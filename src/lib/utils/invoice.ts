import { orderApi } from '@/lib/api/orders';
import { generateInvoicePDF } from '@/lib/InvoiceGenerator';
import { apiClient } from '@/lib/api/apiClient';
import { customerApi } from '@/lib/api/customers';

/**
 * Downloads invoice PDF for an order
 * @param orderId - The order ID
 */
export async function downloadOrderInvoice(orderId: string): Promise<void> {
  try {
    // Fetch full order details from API using apiClient
    const response = await apiClient.get(`/orders/${orderId}`);
    const apiOrder = response.data.data;

    // Check if order is cancelled - do not generate invoice for cancelled orders
    if (apiOrder.status === 'CANCELLED' || apiOrder.status === 'Cancelled') {
      throw new Error('Cannot generate invoice for cancelled orders');
    }

    // Check if order is delivered and payment is completed - invoice can only be generated for delivered orders with completed payment
    const orderStatus = apiOrder.status?.toUpperCase();
    const paymentStatus = apiOrder.payment?.status?.toUpperCase();
    
    if (orderStatus !== 'DELIVERED') {
      throw new Error('Invoice can only be generated for delivered orders');
    }
    
    if (paymentStatus !== 'COMPLETED') {
      throw new Error('Invoice can only be generated for orders with completed payment');
    }

    // Extract user information from the order
    // The user field is populated with firstName, lastName, phoneNumber, email, role
    // storeName and govtId might not be included, so we'll fetch full user details if needed
    const user = apiOrder.user;
    let fullUser = user;
    
    // Fetch full user details if storeName is not available (to get storeName and govtId)
    if (user?._id && !user?.storeName) {
      try {
        fullUser = await customerApi.getById(user._id);
      } catch (error) {
        console.warn('Failed to fetch full user details, using order user data:', error);
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

    // Convert API order format to InvoiceGenerator format (per API order schema)
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
      itemsTotal: apiOrder.itemsTotal,
      shippingCharges: apiOrder.shippingCharges,
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

    // Generate filename
    const invoiceNumber = apiOrder.invoiceNumber 
      ? `WB${apiOrder.invoiceNumber}` 
      : apiOrder.refId;
    const filename = `WishBee_Invoice_${invoiceNumber}.pdf`;

    // Generate and download invoice
    await generateInvoicePDF(orderForInvoice, userInfo, filename);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate invoice: ${error.message}` 
        : 'Failed to generate invoice'
    );
  }
}

