export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // If no columns specified, use all keys from first object
  const exportColumns =
    columns ||
    Object.keys(data[0]).map((key) => ({
      key: key as keyof T,
      label: String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));

  // Create CSV header
  const headers = exportColumns.map((col) => col.label).join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    exportColumns
      .map((col) => {
        const value = item[col.key];
        // Handle values that might contain commas or quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",")
  );

  // Combine header and rows
  const csvContent = [headers, ...rows].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * The orders behind one status tile. `dateLabel` varies by status because the
 * timestamp means different things: when staff moved the order into that
 * status, or - for the pending backlog - when the customer placed it.
 */
export function exportStatusActivityOrdersToCSV(
  orders: Array<{
    refId: string;
    customerName: string;
    storeName: string;
    amount: number;
    changedAt: string;
    changedByName: string;
  }>,
  filename: string,
  dateLabel = "Changed At",
  actorLabel = "Changed By"
) {
  const rows = orders.map((order) => ({
    orderId: order.refId || "",
    customer: order.customerName,
    store: order.storeName,
    amount: order.amount,
    changedAt: formatTimestampForCSV(order.changedAt),
    changedBy: order.changedByName,
  }));

  exportToCSV(rows, filename, [
    { key: "orderId", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "store", label: "Store" },
    { key: "amount", label: "Amount" },
    { key: "changedAt", label: dateLabel },
    { key: "changedBy", label: actorLabel },
  ]);
}

/**
 * Timestamps for spreadsheets: full year, 24-hour clock, no comma. The comma
 * matters - `exportToCSV` only quotes when it has to, and a locale string like
 * "13 Aug 2026, 07:00 pm" would otherwise split across two columns.
 */
function formatTimestampForCSV(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Specific export functions for different data types
export function exportProductsToCSV(products: any[], filename = "products") {
  const columns = [
    { key: "name", label: "Product Name" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "mrp", label: "MRP" },
    { key: "stock", label: "Stock Quantity" },
    { key: "status", label: "Status" },
    { key: "isOrganic", label: "Organic" },
    { key: "isB2B", label: "B2B" },
    { key: "dotd", label: "Deal of the Day" },
    { key: "pfy", label: "Pick for You" },
    { key: "productDiscountPage", label: "Discount Page" },
  ];

  // Transform products to handle nested objects
  const transformedProducts = products.map((product) => ({
    ...product,
    category:
      product.category &&
      typeof product.category === "object" &&
      "name" in product.category
        ? product.category.name
        : "N/A",
    subCategory:
      product.subCategory &&
      typeof product.subCategory === "object" &&
      "name" in product.subCategory
        ? product.subCategory.name
        : "N/A",
    isOrganic: product.isOrganic ? "Yes" : "No",
    isB2B: product.isB2B ? "Yes" : "No",
    dotd: product.dotd ? "Yes" : "No",
    pfy: product.pfy ? "Yes" : "No",
    productDiscountPage: product.productDiscountPage ? "Yes" : "No",
  }));

  exportToCSV(transformedProducts, filename, columns);
}

export function exportOutOfStockToCSV(
  items: any[],
  filename = "out-of-stock-items"
) {
  const columns = [
    { key: "productName", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "lastStockDate", label: "Last Stock Date" },
    { key: "supplierName", label: "Supplier Name" },
  ];

  exportToCSV(items, filename, columns);
}

export function exportLongUnsoldToCSV(
  items: any[],
  filename = "long-unsold-items"
) {
  const columns = [
    { key: "productName", label: "Product Name" },
    { key: "daysSinceLastSale", label: "Days Since Last Sale" },
    { key: "stockQty", label: "Stock Quantity" },
    { key: "unit", label: "Unit" },
    { key: "price", label: "Price (₹)" },
    { key: "suggestedAction", label: "Suggested Action" },
  ];

  exportToCSV(items, filename, columns);
}

export function exportTopSellingToCSV(
  items: any[],
  filename = "top-selling-items"
) {
  // Transform Product objects to CSV-friendly format
  const transformedItems = items.map((item) => ({
    productName: item.name || "",
    sku: item.sku || "",
    soldQuantity: item.soldQuantity || 0,
    unit: item.weight?.unit || "units",
    revenue: item.revenue || 0,
    remainingQuantity: item.stock || 0,
    category: item.category?.name || "",
    mrp: item.mrp || 0,
  }));

  type TransformedItem = (typeof transformedItems)[0];

  const columns: { key: keyof TransformedItem; label: string }[] = [
    { key: "productName", label: "Product Name" },
    { key: "sku", label: "SKU" },
    { key: "soldQuantity", label: "Sold Quantity (Last 30 Days)" },
    { key: "unit", label: "Unit" },
    { key: "revenue", label: "Revenue (₹)" },
    { key: "remainingQuantity", label: "Remaining Stock" },
    { key: "category", label: "Category" },
    { key: "mrp", label: "MRP (₹)" },
  ];

  exportToCSV(transformedItems, filename, columns);
}

export function exportCustomerDataToCSV(
  customer: any,
  orderStatistics: any,
  filename = "customer-data"
) {
  // Format customer name
  const name = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ") || "N/A";

  // Format store name
  const storeName = customer.storeName?.trim() || "N/A";

  // Format phone number
  const phoneNumber = customer.phoneNumber || "N/A";

  // Format address - prefer default address, otherwise use first address
  let address = "N/A";
  if (customer.addresses && customer.addresses.length > 0) {
    const defaultAddress = customer.addresses.find(
      (addr: any) => addr.isDefault === true
    ) || customer.addresses[0];
    
    if (defaultAddress) {
      const addressParts = [
        defaultAddress.addressLine,
        defaultAddress.city,
        defaultAddress.state,
        defaultAddress.postalCode,
        defaultAddress.country,
      ].filter(Boolean);
      address = addressParts.join(", ") || "N/A";
    }
  }

  // Format GST/Document number
  let govtDocument = "N/A";
  if (customer.govtId) {
    const { type, number } = customer.govtId;
    govtDocument = `${type}: ${number}`;
  }

  // Get lifetime orders count - prefer customer.orders array length as it's definitely lifetime
  const lifetimeOrders =
    customer.orders?.length ||
    customer.totalOrders ||
    orderStatistics?.totalOrders ||
    0;

  // Get total spend - prefer customer.totalSpend as it's lifetime spend
  const totalSpendValue =
    customer.totalSpend ||
    customer.totalRevenue ||
    orderStatistics?.totalSpend ||
    0;

  // Format total spend as a number with 2 decimal places (Excel-friendly, no currency symbol)
  // Using en-IN locale for Indian number formatting (commas for thousands)
  const totalSpend = totalSpendValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Create data array with single customer record
  const customerData = [
    {
      name,
      storeName,
      phoneNumber,
      address,
      govtDocument,
      lifetimeOrders,
      totalSpend,
    },
  ];

  type CustomerDataItem = (typeof customerData)[0];

  const columns: { key: keyof CustomerDataItem; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "storeName", label: "Store Name" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "address", label: "Address" },
    { key: "govtDocument", label: "GST Number/Document" },
    { key: "lifetimeOrders", label: "Lifetime Orders" },
    { key: "totalSpend", label: "Total Spend" },
  ];

  exportToCSV(customerData, filename, columns);
}