import JSZip from 'jszip';
import { apiClient } from '@/lib/api/apiClient';
import { generateInvoicePDFBlob } from '@/lib/InvoiceGenerator';
import { customerApi } from '@/lib/api/customers';
import { orderApi, PosOrdersFilters } from '@/lib/api/orders';

interface InvoiceCSVRow {
  name: string;
  invoiceNo: string;
  date: string;
  totalBillValue: number;
  gstValue: number; // Total GST amount for all items in the order
  gstNo: string;
}

interface BulkInvoiceFilters {
  startDate: string;
  endDate: string;
}

interface PosBulkInvoiceFilters {
  startDate: string;
  endDate: string;
  cashierId?: string;
}

export interface BulkInvoiceOptions {
  includePDFs: boolean;
  includeCSV: boolean;
}

interface OrderForInvoice {
  _id: string;
  refId: string;
  invoiceNumber?: string;
  items: any[];
  totalAmount: number;
  itemsTotal?: number;
  shippingCharges?: number;
  walkin?: boolean;
  couponDiscount?: number;
  couponCode?: string;
  loyaltyDiscountPercent?: number;
  loyaltyDiscountAmount?: number;
  originalAmount?: number;
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
  const response = await apiClient.get('/orders/all', {
    params: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 1000, // Maximum limit to get all orders
      page: 1,
      status: 'DELIVERED',
    },
  });

  if (response.data.success && response.data.data?.orders) {
    return response.data.data.orders;
  }

  return [];
}

/**
 * Prepares order data for invoice generation
 */
async function prepareOrderForInvoice(apiOrder: OrderForInvoice) {
  const user = apiOrder.user;
  let fullUser = user;
  
  // Fetch full user details if storeName is not available (to get storeName and govtId)
  if (user?._id && (!user?.storeName || !user?.govtId)) {
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
        title2: item.product?.title2,
        title3: item.product?.title3,
        title4: item.product?.title4,
        mrp: item.product?.mrp || item.priceAtPurchase,
        gst: item.product?.gst || 0,
      },
      productType: item.productType || 'product',
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      discountApplied: item.discountApplied || 0,
    })),
    totalAmount: apiOrder.totalAmount,
    itemsTotal: apiOrder.itemsTotal,
    shippingCharges: apiOrder.shippingCharges,
    walkin: apiOrder.walkin === true,
    couponDiscount: apiOrder.couponDiscount,
    couponCode: apiOrder.couponCode,
    loyaltyDiscountPercent: apiOrder.loyaltyDiscountPercent,
    loyaltyDiscountAmount: apiOrder.loyaltyDiscountAmount,
    originalAmount: apiOrder.originalAmount,
    status: apiOrder.status,
    shippingAddress: {
      type: apiOrder.shippingAddress?.type || 'HOME',
      addressLine: apiOrder.shippingAddress?.addressLine || '',
      landmark: apiOrder.shippingAddress?.landmark,
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
 * Calculates total GST value for an order
 */
function calculateTotalGST(orderForInvoice: any): number {
  return orderForInvoice.items.reduce((total: number, item: any) => {
    const gstPercentage = item.product?.gst || 0;
    const priceBeforeGST = item.priceAtPurchase * item.quantity;
    const totalGST = (priceBeforeGST * gstPercentage) / 100;
    return total + totalGST;
  }, 0);
}

/**
 * Formats date for CSV (DD/MM/YYYY format)
 */
function formatDateForCSV(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Generates CSV content for bulk invoices
 */
function generateBulkInvoiceCSV(invoiceRows: InvoiceCSVRow[]): string {
  // CSV Header
  const headers = ['Name/Store Name', 'Invoice No', 'Date', 'Total Bill Value', 'GST Value', 'GST No.'];
  
  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...invoiceRows.map(row => [
      escapeCSVValue(row.name),
      escapeCSVValue(row.invoiceNo),
      escapeCSVValue(row.date),
      escapeCSVValue(row.totalBillValue.toFixed(2)),
      escapeCSVValue(row.gstValue.toFixed(2)),
      escapeCSVValue(row.gstNo || ''),
    ].join(','))
  ];

  return csvRows.join('\n');
}

/**
 * Generates CSV file for bulk invoices
 */
export async function generateBulkInvoiceCSVFile(
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

  const csvRows: InvoiceCSVRow[] = [];
  let processed = 0;

  // Process each order to collect CSV data
  for (const order of eligibleOrders) {
    try {
      const { orderForInvoice, userInfo } = await prepareOrderForInvoice(order);
      
      // Generate filename
      const invoiceNumber = orderForInvoice.invoiceNumber 
        ? `WB${orderForInvoice.invoiceNumber}` 
        : orderForInvoice.refId;
      
      // Get total bill value
      const totalBillValue = orderForInvoice.totalAmount;
      
      // Calculate total GST value for all items in the order
      // GST Value = (priceAtPurchase * quantity) * (gst% / 100) for each item, then sum
      const totalGSTValue = orderForInvoice.items.reduce((total: number, item: any) => {
        const gstPercentage = item.product?.gst || 0;
        const itemTotalPrice = item.priceAtPurchase * item.quantity;
        const itemGST = (itemTotalPrice * gstPercentage) / 100;
        return total + itemGST;
      }, 0);
      
      // Add to CSV rows
      csvRows.push({
        name: userInfo.name,
        invoiceNo: invoiceNumber,
        date: formatDateForCSV(orderForInvoice.createdAt),
        totalBillValue: totalBillValue,
        gstValue: totalGSTValue,
        gstNo: userInfo.gstin || '',
      });
      
      processed++;
      if (onProgress) {
        onProgress(processed, eligibleOrders.length);
      }
    } catch (error) {
      console.error(`Error processing order ${order._id}:`, error);
      // Continue with other orders even if one fails
    }
  }

  // Generate CSV file
  if (csvRows.length === 0) {
    throw new Error('No invoice data to export');
  }

  const csvContent = generateBulkInvoiceCSV(csvRows);
  const startDateStr = filters.startDate.replace(/-/g, '');
  const endDateStr = filters.endDate.replace(/-/g, '');
  const csvFilename = `WishBee_Invoices_${startDateStr}_${endDateStr}.csv`;
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generates bulk invoices and returns them as a zip file or CSV blob
 */
export async function generateBulkInvoices(
  filters: BulkInvoiceFilters,
  options: BulkInvoiceOptions,
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

  // If only CSV is requested, return CSV directly
  if (!options.includePDFs && options.includeCSV) {
    return await generateBulkInvoiceCSVFile(filters, onProgress);
  }

  // Create zip file
  const zip = new JSZip();
  let processed = 0;
  const csvRows: InvoiceCSVRow[] = [];

  // Generate invoices for each order
  for (const order of eligibleOrders) {
    try {
      const { orderForInvoice, userInfo } = await prepareOrderForInvoice(order);
      
      // Generate filename
      const invoiceNumber = orderForInvoice.invoiceNumber 
        ? `WB${orderForInvoice.invoiceNumber}` 
        : orderForInvoice.refId;
      
      // Generate PDF if requested
      if (options.includePDFs) {
        const pdfBlob = await generateInvoicePDFBlob(orderForInvoice, userInfo);
        const filename = `WishBee_Invoice_${invoiceNumber}.pdf`;
        zip.file(filename, pdfBlob);
      }
      
      // Collect CSV data if requested
      if (options.includeCSV) {
        // Get total bill value
        const totalBillValue = orderForInvoice.totalAmount;
        
        // Calculate total GST value for all items in the order
        // GST Value = (priceAtPurchase * quantity) * (gst% / 100) for each item, then sum
        const totalGSTValue = orderForInvoice.items.reduce((total: number, item: any) => {
          const gstPercentage = item.product?.gst || 0;
          const itemTotalPrice = item.priceAtPurchase * item.quantity;
          const itemGST = (itemTotalPrice * gstPercentage) / 100;
          return total + itemGST;
        }, 0);
        
        // Add to CSV rows
        csvRows.push({
          name: userInfo.name,
          invoiceNo: invoiceNumber,
          date: formatDateForCSV(orderForInvoice.createdAt),
          totalBillValue: totalBillValue,
          gstValue: totalGSTValue,
          gstNo: userInfo.gstin || '',
        });
      }
      
      processed++;
      if (onProgress) {
        onProgress(processed, eligibleOrders.length);
      }
    } catch (error) {
      console.error(`Error generating invoice for order ${order._id}:`, error);
      // Continue with other orders even if one fails
    }
  }

  // Generate CSV file and add to zip if requested
  if (options.includeCSV && csvRows.length > 0) {
    const csvContent = generateBulkInvoiceCSV(csvRows);
    const startDateStr = filters.startDate.replace(/-/g, '');
    const endDateStr = filters.endDate.replace(/-/g, '');
    const csvFilename = `WishBee_Invoices_${startDateStr}_${endDateStr}.csv`;
    zip.file(csvFilename, csvContent);
  }

  // Generate zip file (or return CSV blob if only CSV was requested)
  if (options.includePDFs || (options.includeCSV && csvRows.length > 0)) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  }

  throw new Error('No export options selected');
}

/**
 * Fetches POS orders based on filters
 */
async function fetchPosOrders(filters: PosBulkInvoiceFilters): Promise<OrderForInvoice[]> {
  try {
    const response = await orderApi.getPosOrders({
      fromDate: filters.startDate,
      toDate: filters.endDate,
      cashierId: filters.cashierId,
      // Omit limit to get all orders in one page
    });
    
    return response.orders || [];
  } catch (error) {
    console.error('Error fetching POS orders:', error);
    throw error;
  }
}

/**
 * Generates CSV file for POS bulk invoices
 */
export async function generatePosBulkInvoiceCSVFile(
  filters: PosBulkInvoiceFilters,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const orders = await fetchPosOrders(filters);
  
  if (orders.length === 0) {
    throw new Error('No POS orders found for the selected filters');
  }

  // POS orders are always DELIVERED with COMPLETED payment, but filter just in case
  const eligibleOrders = orders.filter((order) => {
    const orderStatus = order.status?.toUpperCase();
    const paymentStatus = order.payment?.status?.toUpperCase();
    return orderStatus === 'DELIVERED' && paymentStatus === 'COMPLETED';
  });

  if (eligibleOrders.length === 0) {
    throw new Error('No eligible POS orders found. Only delivered orders with completed payment can have invoices.');
  }

  const csvRows: InvoiceCSVRow[] = [];
  let processed = 0;

  for (const order of eligibleOrders) {
    try {
      const { orderForInvoice, userInfo } = await prepareOrderForInvoice(order);
      
      const invoiceNumber = orderForInvoice.invoiceNumber 
        ? `WB${orderForInvoice.invoiceNumber}` 
        : orderForInvoice.refId;
      
      const totalBillValue = orderForInvoice.totalAmount;
      
      const totalGSTValue = orderForInvoice.items.reduce((total: number, item: any) => {
        const gstPercentage = item.product?.gst || 0;
        const itemTotalPrice = item.priceAtPurchase * item.quantity;
        const itemGST = (itemTotalPrice * gstPercentage) / 100;
        return total + itemGST;
      }, 0);
      
      csvRows.push({
        name: userInfo.name,
        invoiceNo: invoiceNumber,
        date: formatDateForCSV(orderForInvoice.createdAt),
        totalBillValue: totalBillValue,
        gstValue: totalGSTValue,
        gstNo: userInfo.gstin || '',
      });
      
      processed++;
      if (onProgress) {
        onProgress(processed, eligibleOrders.length);
      }
    } catch (error) {
      console.error(`Error processing POS order ${order._id}:`, error);
    }
  }

  if (csvRows.length === 0) {
    throw new Error('No POS invoice data to export');
  }

  const csvContent = generateBulkInvoiceCSV(csvRows);
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generates bulk invoices for POS orders and returns them as a zip file or CSV blob
 */
export async function generatePosBulkInvoices(
  filters: PosBulkInvoiceFilters,
  options: BulkInvoiceOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const orders = await fetchPosOrders(filters);
  
  if (orders.length === 0) {
    throw new Error('No POS orders found for the selected filters');
  }

  // POS orders are always DELIVERED with COMPLETED payment, but filter just in case
  const eligibleOrders = orders.filter((order) => {
    const orderStatus = order.status?.toUpperCase();
    const paymentStatus = order.payment?.status?.toUpperCase();
    return orderStatus === 'DELIVERED' && paymentStatus === 'COMPLETED';
  });

  if (eligibleOrders.length === 0) {
    throw new Error('No eligible POS orders found. Only delivered orders with completed payment can have invoices.');
  }

  const zip = new JSZip();
  const csvRows: InvoiceCSVRow[] = [];
  let processed = 0;

  for (const order of eligibleOrders) {
    try {
      const { orderForInvoice, userInfo } = await prepareOrderForInvoice(order);
      
      const invoiceNumber = orderForInvoice.invoiceNumber 
        ? `WB${orderForInvoice.invoiceNumber}` 
        : orderForInvoice.refId;

      if (options.includePDFs) {
        const pdfBlob = await generateInvoicePDFBlob(orderForInvoice, userInfo);
        const filename = `WishBee_Invoice_${invoiceNumber}.pdf`;
        zip.file(filename, pdfBlob);
      }

      if (options.includeCSV) {
        const totalBillValue = orderForInvoice.totalAmount;
        const totalGSTValue = orderForInvoice.items.reduce((total: number, item: any) => {
          const gstPercentage = item.product?.gst || 0;
          const itemTotalPrice = item.priceAtPurchase * item.quantity;
          const itemGST = (itemTotalPrice * gstPercentage) / 100;
          return total + itemGST;
        }, 0);

        csvRows.push({
          name: userInfo.name,
          invoiceNo: invoiceNumber,
          date: formatDateForCSV(orderForInvoice.createdAt),
          totalBillValue: totalBillValue,
          gstValue: totalGSTValue,
          gstNo: userInfo.gstin || '',
        });
      }

      processed++;
      if (onProgress) {
        onProgress(processed, eligibleOrders.length);
      }
    } catch (error) {
      console.error(`Error processing POS order ${order._id}:`, error);
    }
  }

  if (options.includePDFs && Object.keys(zip.files).length === 0) {
    throw new Error('No PDF invoices generated');
  }

  if (options.includeCSV && csvRows.length === 0) {
    throw new Error('No CSV data generated');
  }

  if (options.includePDFs && options.includeCSV) {
    const csvContent = generateBulkInvoiceCSV(csvRows);
    zip.file('WishBee_Invoices_Summary.csv', csvContent);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } else if (options.includePDFs) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } else if (options.includeCSV) {
    const csvContent = generateBulkInvoiceCSV(csvRows);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  throw new Error('No export options selected');
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

