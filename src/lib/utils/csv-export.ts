export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // If no columns specified, use all keys from first object
  const exportColumns = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    label: String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }));

  // Create CSV header
  const headers = exportColumns.map(col => col.label).join(',');
  
  // Create CSV rows
  const rows = data.map(item => 
    exportColumns.map(col => {
      const value = item[col.key];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Specific export functions for different data types
export function exportProductsToCSV(products: any[], filename = 'products') {
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'buyingPrice', label: 'Buying Price' },
    { key: 'stockQuantity', label: 'Stock Quantity' },
    { key: 'lastSoldDate', label: 'Last Sold Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'availabilityStatus', label: 'Availability Status' }
  ];
  
  exportToCSV(products, filename, columns);
}

export function exportOutOfStockToCSV(items: any[], filename = 'out-of-stock-items') {
  const columns = [
    { key: 'productName', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'lastStockDate', label: 'Last Stock Date' },
    { key: 'supplierName', label: 'Supplier Name' }
  ];
  
  exportToCSV(items, filename, columns);
}
