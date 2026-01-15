import JSZip from 'jszip';
import { apiClient } from '@/lib/api/apiClient';
import { generateInvoicePDFBlob } from '@/lib/InvoiceGenerator';
import { customerApi } from '@/lib/api/customers';

interface BulkInvoiceFilters {
  startDate: string;
  endDate: string;
  statuses: string[];
}

interface OrderForInvoice {
  _id: string;
  refId: string;
  invoiceNumber?: string;
  items: any[];
  totalAmount: number;
  status: string;
  shippingAddress: any;
  payment: any;
  createdAt: string;
  updatedAt: string;
  user: any;
}

/**
 * Fetches orders based on filters
 */
async function fetchOrders(filters: BulkInvoiceFilters): Promise<OrderForInvoice[]> {
  const params: any = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: 1000, // Maximum limit to get all orders
    page: 1,
  };

  // Fetch orders for each status
  const allOrders: OrderForInvoice[] = [];
  
  for (const status of filters.statuses) {
    try {
      const response = await apiClient.get('/orders/all', {
        params: {
          ...params,
          status: status,
        },
      });
      
      if (response.data.success && response.data.data?.orders) {
        allOrders.push(...response.data.data.orders);
      }
    } catch (error) {
      console.error(`Error fetching orders for status ${status}:`, error);
    }
  }

  return allOrders;
}

/**
 * Prepares order data for invoice generation
 */
async function prepareOrderForInvoice(apiOrder: OrderForInvoice) {
  const user = apiOrder.user;
  let fullUser = user;
  
  // Fetch full user details if storeName is not available (to get storeName and govtId)
  if (user?._id && !user?.storeName) {
    try {
      fullUser = await customerApi.getById(user._id);
    } catch (error) {
      console.warn(`Failed to fetch full user details for order ${apiOrder._id}, using order user data:`, error);
      // Continue with order user data if fetch fails
    }
  }
  
  let gstin: string | undefined;
  
  // Try to get GSTIN from user.govtId if available
  if (fullUser?.govtId) {
    if (fullUser.govtId.type === 'GST') {
      gstin = fullUser.govtId.number;
    }
  }
  
  // Use storeName if available, otherwise fall back to firstName + lastName
  let customerName: string;
  if (fullUser?.storeName && fullUser.storeName.trim()) {
    customerName = fullUser.storeName.trim();
  } else {
    customerName = [fullUser?.firstName, fullUser?.lastName].filter(Boolean).join(' ') || fullUser?.phoneNumber || 'Customer';
  }
  
  const userInfo = {
    name: customerName,
    email: fullUser?.email || user?.email || '',
    phone: fullUser?.phoneNumber || user?.phoneNumber || '',
    gstin,
  };

  const orderForInvoice = {
    _id: apiOrder._id,
    refId: apiOrder.refId,
    invoiceNumber: apiOrder.invoiceNumber,
    items: apiOrder.items.map((item: any) => ({
      product: {
        name: item.product?.name || 'Product',
        mrp: item.product?.mrp || item.priceAtPurchase,
        gst: item.product?.gst || 0,
      },
      productType: item.productType || 'product',
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      discountApplied: item.discountApplied || 0,
    })),
    totalAmount: apiOrder.totalAmount,
    status: apiOrder.status,
    shippingAddress: {
      type: apiOrder.shippingAddress?.type || 'HOME',
      addressLine: apiOrder.shippingAddress?.addressLine || '',
      landmark: apiOrder.shippingAddress?.landmark || '',
      city: apiOrder.shippingAddress?.city || '',
      state: apiOrder.shippingAddress?.state || '',
      postalCode: apiOrder.shippingAddress?.postalCode || '',
      country: apiOrder.shippingAddress?.country || 'India',
      latitude: apiOrder.shippingAddress?.latitude,
      longitude: apiOrder.shippingAddress?.longitude,
    },
    payment: {
      method: apiOrder.payment?.method || 'COD',
      status: apiOrder.payment?.status || 'PENDING',
      amount: apiOrder.payment?.amount || apiOrder.totalAmount,
    },
    createdAt: apiOrder.createdAt || new Date().toISOString(),
    updatedAt: apiOrder.updatedAt || new Date().toISOString(),
  };

  return { orderForInvoice, userInfo };
}

/**
 * Generates bulk invoices and returns them as a zip file
 */
export async function generateBulkInvoices(
  filters: BulkInvoiceFilters,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  // Fetch orders based on filters
  const orders = await fetchOrders(filters);
  
  if (orders.length === 0) {
    throw new Error('No orders found for the selected filters');
  }

  // Filter orders that are eligible for invoice generation
  // Only DELIVERED orders with COMPLETED payment can have invoices
  const eligibleOrders = orders.filter((order) => {
    const orderStatus = order.status?.toUpperCase();
    const paymentStatus = order.payment?.status?.toUpperCase();
    return orderStatus === 'DELIVERED' && paymentStatus === 'COMPLETED';
  });

  if (eligibleOrders.length === 0) {
    throw new Error('No eligible orders found. Only delivered orders with completed payment can have invoices.');
  }

  // Create zip file
  const zip = new JSZip();
  let processed = 0;

  // Generate invoices for each order
  for (const order of eligibleOrders) {
    try {
      const { orderForInvoice, userInfo } = await prepareOrderForInvoice(order);
      
      // Generate invoice PDF blob
      const pdfBlob = await generateInvoicePDFBlob(orderForInvoice, userInfo);
      
      // Generate filename
      const invoiceNumber = orderForInvoice.invoiceNumber 
        ? `WB${orderForInvoice.invoiceNumber}` 
        : orderForInvoice.refId;
      const filename = `WishBee_Invoice_${invoiceNumber}.pdf`;
      
      // Add to zip
      zip.file(filename, pdfBlob);
      
      processed++;
      if (onProgress) {
        onProgress(processed, eligibleOrders.length);
      }
    } catch (error) {
      console.error(`Error generating invoice for order ${order._id}:`, error);
      // Continue with other orders even if one fails
    }
  }

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

