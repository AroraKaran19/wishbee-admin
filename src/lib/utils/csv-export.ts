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
