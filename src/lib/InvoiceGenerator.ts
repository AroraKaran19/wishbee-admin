// Lazy load jsPDF to reduce initial bundle size
let jsPDF: any;
const loadJsPDF = async () => {
  if (!jsPDF) {
    jsPDF = (await import("jspdf")).default;
  }
  return jsPDF;
};

interface OrderItem {
  _id: string;
  refId: string;
  invoiceNumber?: string;
  items: {
    product: any;
    productType: "product" | "combo";
    quantity: number;
    priceAtPurchase: number;
    discountApplied?: number;
  }[];
  totalAmount: number;
  status: string;
  shippingAddress: {
    type: string;
    addressLine: string;
    landmark: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment: {
    method: string;
    status: string;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  gstin?: string;
}

export class InvoiceGenerator {
  private doc: any;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private currentPage: number;
  private totalPages: number;
  private logoDataUrl: string | null = null;
  private jsPDFClass: any;

  private constructor(jsPDFClass: any) {
    this.jsPDFClass = jsPDFClass;
    this.doc = new jsPDFClass();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.currentY = 15;
    this.currentPage = 1;
    this.totalPages = 1;
  }

  static async create(): Promise<InvoiceGenerator> {
    const jsPDFClass = await loadJsPDF();
    return new InvoiceGenerator(jsPDFClass);
  }

  // Helper method to load image as data URL
  private async loadImageAsDataUrl(
    src: string,
    opacity: number = 1
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Apply opacity by setting globalAlpha
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            resolve(dataUrl);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error converting image to data URL:", error);
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = src;
    });
  }

  async generateInvoice(order: OrderItem, userInfo: UserInfo): Promise<void> {
    // Preload logo as data URL for better compatibility (full opacity for header)
    if (!this.logoDataUrl) {
      this.logoDataUrl = await this.loadImageAsDataUrl("/logo.png", 1);
    }

    // Add watermark (with reduced opacity)
    await this.addWatermark();

    // Header section
    this.addHeader(order, this.currentPage, this.totalPages);

    // Invoice details
    this.addInvoiceDetails(order);

    // Billing and shipping details
    this.addBillingShippingDetails(order, userInfo);

    // Line items table
    this.addLineItemsTable(order);

    // Summary section
    this.addSummary(order);

    // Declaration and contact info
    this.addDeclarationAndContact();

    // Signature section
    this.addSignatureSection();

    // Update total pages after content generation
    this.totalPages = this.doc.getNumberOfPages();

    // Add header to all pages
    this.addHeaderToAllPages(order);
  }

  private async addWatermark(): Promise<void> {
    // Light watermark with Wishbee logo (reduced opacity)
    const watermarkOpacity = 0.15; // 15% opacity for subtle watermark
    let watermarkAdded = false;

    // Load logo with reduced opacity for watermark
    const watermarkLogoDataUrl = await this.loadImageAsDataUrl(
      "/logo.png",
      watermarkOpacity
    );

    if (watermarkLogoDataUrl) {
      try {
        // Add logo as watermark in center of page
        this.doc.addImage(
          watermarkLogoDataUrl,
          "PNG",
          this.pageWidth / 2 - 60,
          this.pageHeight / 2 - 40,
          120,
          80
        );
        watermarkAdded = true;
      } catch (error) {
        console.warn("Failed to add watermark logo:", error);
      }
    }

    if (!watermarkAdded) {
      try {
        // Try direct path as fallback (jsPDF doesn't support opacity directly, so we'll use lighter text)
        this.doc.addImage(
          "/logo.png",
          "PNG",
          this.pageWidth / 2 - 40,
          this.pageHeight / 2 - 40,
          80,
          80
        );
        watermarkAdded = true;
      } catch (_error) {
        // Fallback to text watermark if image fails (lighter color for lower opacity effect)
        this.doc.setFontSize(60);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(245, 245, 245); // Very light gray (lighter than before for lower opacity effect)
        const centerX = this.pageWidth / 2;
        const centerY = this.pageHeight / 2;
        this.doc.text("Wish", centerX - 20, centerY, {
          align: "center",
          angle: 45,
        });
        this.doc.text("Bee", centerX + 20, centerY, {
          align: "center",
          angle: 45,
        });
        this.doc.setTextColor(0, 0, 0);
      }
    }
  }

  private addHeader(
    order: OrderItem,
    currentPage: number = 1,
    totalPages: number = 1
  ): void {
    // Logo dimensions - fixed width (smaller to prevent overflow)
    const logoX = 15;
    const logoY = 5;
    const logoWidth = 26; // Fixed width in mm (reduced to prevent overflow)
    const logoHeight = 12; // Fixed height in mm (maintains aspect ratio)

    // Add company logo (PNG)
    let logoAdded = false;
    if (this.logoDataUrl) {
      try {
        this.doc.addImage(
          this.logoDataUrl,
          "PNG",
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
        logoAdded = true;
      } catch (error) {
        console.warn("Failed to add logo image:", error);
      }
    }

    // Fallback to styled text logo if image fails to load
    if (!logoAdded) {
      try {
        // Try direct path as fallback
        this.doc.addImage(
          "/logo.png",
          "PNG",
          logoX,
          logoY,
          logoWidth,
          logoHeight
        );
        logoAdded = true;
      } catch (error) {
        // Use text logo as final fallback
        this.doc.setFontSize(16);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(0, 183, 251); // Blue color (#00B7FB)
        this.doc.text("Wish", logoX, logoY + 8);
        this.doc.setTextColor(255, 140, 0); // Orange color (#FF8C00)
        // Calculate width of "Wish" to position "Bee" right after it
        const wishWidth = this.doc.getTextWidth("Wish");
        this.doc.text("Bee", logoX + wishWidth + 2, logoY + 8);
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFont("helvetica", "normal");
      }
    }
    // Invoice details in center - two rows
    this.doc.setFontSize(8);
    const labelX = this.pageWidth / 2 - 60; // X position for labels

    // First row: Invoice ID and Order ID
    this.doc.setFont("helvetica", "normal"); // normal for labels
    this.doc.text("TAX Invoice :", labelX, 10); // invoice id -> Tax Invoice Number
    this.doc.setFont("helvetica", "bold"); // bold for value
    // Use invoiceNumber if available, otherwise fallback to order ID
    const invoiceId = order.invoiceNumber
      ? `WB${order.invoiceNumber}`
      : `WB${order._id.slice(-8)}`;
    this.doc.text(invoiceId, labelX + 20, 10);

    this.doc.setFont("helvetica", "normal");
    this.doc.text("Order ID:", labelX + 60, 10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${order.refId}`, labelX + 80, 10);

    // Second row: Invoice Date and Shipment No
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Invoice Date:", labelX, 15);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${this.formatDate(order.createdAt)}`, labelX + 20, 15);

    this.doc.setFont("helvetica", "normal");
    this.doc.text("Shipment No:", labelX + 60, 15);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`WBSHIP${order._id.slice(-6)}`, labelX + 80, 15);

    // Page number on the right
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Page ${currentPage}/${totalPages}`, this.pageWidth - 30, 15);

    // Horizontal line under header
    this.doc.setDrawColor(209, 213, 219); // gray-500 color
    this.doc.setLineWidth(0.2); // thin line
    this.doc.line(15, 18, this.pageWidth - 15, 18); // (x1, y1, x2, y2)

    this.currentY = 25;
  }

  private addInvoiceDetails(_order: OrderItem): void {
    // This section will be added in the billing section
  }

  private addBillingShippingDetails(
    order: OrderItem,
    userInfo: UserInfo
  ): void {
    this.currentY += 3;

    // Calculate equal widths for all three sections
    const margin = 15;
    const totalUsableWidth = this.pageWidth - margin * 2;
    const sectionWidth = totalUsableWidth / 3;
    const gap = 4; // Small gap between sections

    const billFromX = margin;
    const shipFromX = margin + sectionWidth + gap;
    const billToX = margin + sectionWidth * 2 + gap * 2;
    const sectionMaxWidth = sectionWidth - gap; // Available width for text in each section

    this.doc.setFontSize(8);
    const lineHeight = 5;
    let maxSectionHeight = 0;

    // BILL FROM section - with text wrapping
    this.doc.setFont("helvetica", "bold");
    this.doc.text("BILL FROM:", billFromX, this.currentY);
    this.doc.setFont("helvetica", "normal");

    let billFromY = this.currentY + 5;
    const billFromLines = [
      "WISHBEE WORLD PRIVATE LIMITED",
      "House No. 54, Village Bagdola, Sector-8 Dwarka",
      "Delhi, Delhi - 110077",
      "GSTIN: 07AADCW4813B1ZO",
      "PAN: AADCW4813B",
      "Email: wishbeecare@gmail.com",
      "Phone: +91 78277 93033",
    ];

    billFromLines.forEach((line) => {
      const wrappedLines = this.doc.splitTextToSize(line, sectionMaxWidth);
      this.doc.text(wrappedLines, billFromX, billFromY);
      billFromY += wrappedLines.length * lineHeight;
    });
    maxSectionHeight = Math.max(maxSectionHeight, billFromY - this.currentY);

    // SHIP FROM section - with text wrapping
    this.doc.setFont("helvetica", "bold");
    this.doc.text("SHIP FROM:", shipFromX, this.currentY);
    this.doc.setFont("helvetica", "normal");

    let shipFromY = this.currentY + 5;
    const shipFromLines = [
      "WISHBEE DISTRIBUTION CENTER",
      "Khara No. 54, Village Bagdola, Sector-8, Dwarka",
      "New Delhi, Delhi - 110077",
      "Place of Supply: DELHI",
      "Supply Type: INTRA_STATE",
    ];

    shipFromLines.forEach((line) => {
      const wrappedLines = this.doc.splitTextToSize(line, sectionMaxWidth);
      this.doc.text(wrappedLines, shipFromX, shipFromY);
      shipFromY += wrappedLines.length * lineHeight;
    });
    maxSectionHeight = Math.max(maxSectionHeight, shipFromY - this.currentY);

    // BILL TO / SHIP TO section - with text wrapping
    this.doc.setFont("helvetica", "bold");
    this.doc.text("BILL TO / SHIP TO:", billToX, this.currentY);
    this.doc.setFont("helvetica", "normal");

    let billToY = this.currentY + 5;

    // Name
    const nameLines = this.doc.splitTextToSize(
      userInfo.name || "Customer",
      sectionMaxWidth
    );
    this.doc.text(nameLines, billToX, billToY);
    billToY += nameLines.length * lineHeight;

    // Address line
    const addressLines = this.doc.splitTextToSize(
      order.shippingAddress.addressLine,
      sectionMaxWidth
    );
    this.doc.text(addressLines, billToX, billToY);
    billToY += addressLines.length * lineHeight;

    // City, State
    const cityStateLines = this.doc.splitTextToSize(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
      sectionMaxWidth
    );
    this.doc.text(cityStateLines, billToX, billToY);
    billToY += cityStateLines.length * lineHeight;

    // PIN
    this.doc.text(`PIN: ${order.shippingAddress.postalCode}`, billToX, billToY);
    billToY += lineHeight;

    // GSTIN
    if (userInfo.gstin) {
      const gstinLines = this.doc.splitTextToSize(
        `GSTIN: ${userInfo.gstin}`,
        sectionMaxWidth
      );
      this.doc.text(gstinLines, billToX, billToY);
      billToY += gstinLines.length * lineHeight;
    }
    maxSectionHeight = Math.max(maxSectionHeight, billToY - this.currentY);

    // Update currentY to the maximum height used by any section
    this.currentY += maxSectionHeight;
  }

  private addLineItemsTable(order: OrderItem): void {
    this.currentY += 3;

    // Table configuration
    const tableStartX = 15;
    const margin = 15;
    const availableWidth = this.pageWidth - (tableStartX + margin); // Full width minus margins
    
    // Base column widths (proportions)
    const baseColWidths = [40, 12, 18, 18, 22, 18, 20, 18];
    const totalBaseWidth = baseColWidths.reduce((sum, width) => sum + width, 0);
    
    // Scale column widths to fill available width proportionally
    const colWidths = baseColWidths.map(width => (width / totalBaseWidth) * availableWidth);
    
    const rowHeight = 7;
    const dataRowHeight = 20;

    // Draw table borders and header
    this.drawTableHeader(tableStartX, colWidths, rowHeight);

    // Table headers
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    const headers = [
      "Description",
      "Qty",
      "Rate",
      "Discount",
      "Net Taxable Amt",
      "Tax Type",
      "Tax",
      "Total",
    ];

    let currentX = tableStartX;
    headers.forEach((header, index) => {
      this.doc.text(header, currentX + 2, this.currentY + 5);
      currentX += colWidths[index];
    });

    this.currentY += rowHeight;
    this.doc.setFont("helvetica", "normal");

    // Table rows with borders
    order.items.forEach((item) => {
      if (this.currentY > this.pageHeight - 100) {
        this.doc.addPage();
        this.currentPage++;
        this.currentY = 25; // Start after header
        this.drawTableHeader(tableStartX, colWidths, rowHeight);
        this.currentY += rowHeight;
      }

      const productName = item.product?.name || "Product";
      const quantity = item.quantity;

      // Get MRP (original price) - use mrp if available, otherwise fallback to priceAtPurchase
      const mrp = item.product?.mrp || item.priceAtPurchase;
      const rate = mrp; // Show MRP in Rate column

      // Calculate discount: (MRP * quantity) - (priceAtPurchase * quantity)
      const totalMRP = mrp * quantity;
      const totalPriceAtPurchase = item.priceAtPurchase * quantity;
      const discount = Math.max(0, totalMRP - totalPriceAtPurchase);

      // Net Taxable Amount = price at which we provided to consumer - GST
      const gstPercentage = item.product?.gst || 0;
      const priceBeforeGST = totalPriceAtPurchase;
      const totalGST = (priceBeforeGST * gstPercentage) / 100;
      const netTaxableAmount = priceBeforeGST - totalGST;

      // Split GST into SGST and CGST (each is 1/2 of total GST)
      const sgst = totalGST / 2;
      const cgst = totalGST / 2;

      const total = priceBeforeGST; // Total = price at purchase (includes GST)

      // Wrap product name/description to fit in Description column
      const descriptionMaxWidth = colWidths[0] - 4; // Leave some padding
      const descriptionLines = this.doc.splitTextToSize(
        productName,
        descriptionMaxWidth
      );
      // Only show first 3 lines to prevent overflow
      const maxLines = Math.min(descriptionLines.length, 3);
      const displayLines = descriptionLines.slice(0, maxLines);

      // Calculate extra height needed for multi-line description
      const extraHeight = maxLines > 1 ? (maxLines - 1) * 3.5 : 0;
      const adjustedRowHeight = dataRowHeight + extraHeight;

      // Draw row border with adjusted height
      this.drawTableRowBorder(
        tableStartX,
        colWidths,
        this.currentY,
        adjustedRowHeight
      );

      // Fill row data
      currentX = tableStartX;
      const baseY = this.currentY + 5;
      const adjustedY = maxLines > 1 ? baseY + (maxLines - 1) * 3 : baseY;

      // Add description lines
      displayLines.forEach((line: string, idx: number) => {
        this.doc.text(line, currentX + 2, baseY + idx * 3.5);
      });
      currentX += colWidths[0];

      // Add other columns aligned to center of row
      this.doc.text(
        quantity.toString(),
        currentX + colWidths[1] / 2,
        adjustedY,
        { align: "center" }
      );
      currentX += colWidths[1];

      this.doc.text(`Rs. ${rate.toFixed(2)}`, currentX + colWidths[2] - 2, adjustedY, {
        align: "right",
      });
      currentX += colWidths[2];

      this.doc.text(
        `Rs. ${discount.toFixed(2)}`,
        currentX + colWidths[3] - 2,
        adjustedY,
        { align: "right" }
      );
      currentX += colWidths[3];

      this.doc.text(
        `Rs. ${netTaxableAmount.toFixed(2)}`,
        currentX + colWidths[4] - 2,
        adjustedY,
        { align: "right" }
      );
      currentX += colWidths[4];

      this.doc.text(
        `GST(${gstPercentage.toFixed(1)}%)`,
        currentX + 2,
        adjustedY
      );
      currentX += colWidths[5];

      // Show SGST and CGST on separate lines in Tax column
      this.doc.setFontSize(7);
      this.doc.text(
        `SGST - Rs. ${sgst.toFixed(2)}`,
        currentX + 2,
        adjustedY - 2,
        { align: "left" }
      );
      this.doc.text(
        `CGST - Rs. ${cgst.toFixed(2)}`,
        currentX + 2,
        adjustedY + 2,
        { align: "left" }
      );
      this.doc.setFontSize(8); // Reset font size
      currentX += colWidths[6];

      this.doc.text(`Rs. ${total.toFixed(2)}`, currentX + colWidths[7] - 2, adjustedY, {
        align: "right",
      });

      // Move to next row
      this.currentY += adjustedRowHeight;
    });

    // Summary row with gray background
    this.currentY += 0;
    this.drawSummaryRow(tableStartX, colWidths, this.currentY, rowHeight);

    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Calculate totals using the same logic as individual items
    const totals = order.items.reduce(
      (acc, item) => {
        const mrp = item.product?.mrp || item.priceAtPurchase;
        const totalMRP = mrp * item.quantity;
        const totalPriceAtPurchase = item.priceAtPurchase * item.quantity;
        const discount = Math.max(0, totalMRP - totalPriceAtPurchase);

        const gstPercentage = item.product?.gst || 0;
        const priceBeforeGST = totalPriceAtPurchase;
        const totalGST = (priceBeforeGST * gstPercentage) / 100;
        const netTaxableAmount = priceBeforeGST - totalGST;

        acc.totalDiscount += discount;
        acc.totalNetTaxableAmount += netTaxableAmount;
        acc.totalGST += totalGST; // Total GST (SGST + CGST combined)
        acc.grandTotal += priceBeforeGST;

        return acc;
      },
      {
        totalDiscount: 0,
        totalNetTaxableAmount: 0,
        totalGST: 0,
        grandTotal: 0,
      }
    );

    // Fill summary row data
    currentX = tableStartX;
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Total Quantity:", currentX + 2, this.currentY + 5);
    currentX += colWidths[0];
    // Total quantity in Qty column with units
    const unitText = totalQuantity === 1 ? "1 unit" : `${totalQuantity} units`;
    this.doc.text(unitText, currentX + colWidths[1] / 2, this.currentY + 5, {
      align: "center",
    });
    currentX += colWidths[1];
    currentX += colWidths[2]; // Skip Rate column
    this.doc.text(
      `Rs. ${totals.totalDiscount.toFixed(2)}`,
      currentX + colWidths[3] - 2,
      this.currentY + 5,
      { align: "right" }
    );
    currentX += colWidths[3];
    this.doc.text(
      `Rs. ${totals.totalNetTaxableAmount.toFixed(2)}`,
      currentX + colWidths[4] - 2,
      this.currentY + 5,
      { align: "right" }
    );
    currentX += colWidths[4];
    currentX += colWidths[5]; // Skip Tax Type column
    // Show total tax (SGST + CGST combined) in totals row
    this.doc.text(
      `Rs. ${totals.totalGST.toFixed(2)}`,
      currentX + colWidths[6] - 2,
      this.currentY + 5,
      { align: "right" }
    );
    currentX += colWidths[6];
    this.doc.text(
      `Rs. ${totals.grandTotal.toFixed(2)}`,
      currentX + colWidths[7] - 2,
      this.currentY + 5,
      { align: "right" }
    );

    this.currentY += rowHeight + 5;
  }

  private drawTableHeader(
    tableStartX: number,
    colWidths: number[],
    rowHeight: number
  ): void {
    const margin = 15;
    const fullWidth = this.pageWidth - (tableStartX + margin);
    
    // Draw header background - full gray background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(tableStartX, this.currentY, fullWidth, rowHeight, "F");

    // Draw header borders
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.2);
    this.doc.rect(tableStartX, this.currentY, fullWidth, rowHeight);

    // Draw vertical lines
    let currentX = tableStartX;
    for (let i = 0; i < colWidths.length; i++) {
      currentX += colWidths[i];
      this.doc.line(
        currentX,
        this.currentY,
        currentX,
        this.currentY + rowHeight
      );
    }
  }

  private drawTableRowBorder(
    tableStartX: number,
    colWidths: number[],
    y: number,
    rowHeight: number
  ): void {
    const margin = 15;
    const fullWidth = this.pageWidth - (tableStartX + margin);
    
    // Draw row border
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.2);
    this.doc.rect(tableStartX, y, fullWidth, rowHeight);

    // Draw vertical lines
    let currentX = tableStartX;
    for (let i = 0; i < colWidths.length; i++) {
      currentX += colWidths[i];
      this.doc.line(currentX, y, currentX, y + rowHeight);
    }
  }

  private drawSummaryRow(
    tableStartX: number,
    colWidths: number[],
    y: number,
    rowHeight: number
  ): void {
    const margin = 15;
    const fullWidth = this.pageWidth - (tableStartX + margin);
    
    // Draw summary row background - full gray background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(tableStartX, y, fullWidth, rowHeight, "F");

    // Draw summary row borders
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.2);
    this.doc.rect(tableStartX, y, fullWidth, rowHeight);

    // Draw vertical lines
    let currentX = tableStartX;
    for (let i = 0; i < colWidths.length; i++) {
      currentX += colWidths[i];
      this.doc.line(currentX, y, currentX, y + rowHeight);
    }
  }

  private addSummary(_order: OrderItem): void {
    // This is handled in the table summary
  }

  private addDeclarationAndContact(): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentPage++;
      this.currentY = 25;
    }

    this.currentY += 3;

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Declaration:", 15, this.currentY);
    this.doc.setFont("helvetica", "normal");

    // Wrap declaration text to fit within page width
    const declarationText =
      "We declare that this invoice shows the actual price of the goods described and all particulars are true and correct. This is a computer-generated invoice.";
    const declarationMaxWidth = this.pageWidth - 30; // Leave margins
    const declarationLines = this.doc.splitTextToSize(
      declarationText,
      declarationMaxWidth
    );
    this.doc.text(declarationLines, 15, this.currentY + 5);

    this.currentY += 5 + declarationLines.length * 5 + 3;

    // Check again before adding contact info
    if (this.currentY > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentPage++;
      this.currentY = 25;
    }

    this.doc.setFont("helvetica", "bold");
    this.doc.text("For any queries, contact:", 15, this.currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      "Wishbee Customer Support: +91 78277 93033",
      15,
      this.currentY + 5
    );
    this.doc.text("wishbeecare@gmail.com", 15, this.currentY + 10);

    this.currentY += 18;
  }

  private addSignatureSection(): void {
    // Check if we need a new page for signature (needs ~30 units of space)
    if (this.currentY > this.pageHeight - 35) {
      this.doc.addPage();
      this.currentPage++;
      this.currentY = 30;
    }

    // Signature box - smaller
    const signatureBoxX = this.pageWidth - 60;
    const signatureBoxY = this.currentY;
    const signatureBoxWidth = 45;
    const signatureBoxHeight = 20;

    this.doc.rect(
      signatureBoxX,
      signatureBoxY,
      signatureBoxWidth,
      signatureBoxHeight
    );

    // Add signature image inside the box
    try {
      // Add image with padding inside the box (2mm padding on all sides)
      const imageX = signatureBoxX + 2;
      const imageY = signatureBoxY + 2;
      const imageWidth = signatureBoxWidth - 4; // 2mm padding on each side
      const imageHeight = signatureBoxHeight - 4; // 2mm padding on each side

      this.doc.addImage(
        "/wishbee-admin-sign-private.jpeg",
        "JPEG",
        imageX,
        imageY,
        imageWidth,
        imageHeight
      );
    } catch (error) {
      // If image fails to load, continue without it
      console.warn("Failed to load signature image:", error);
    }

    this.doc.setFontSize(7);
    this.doc.text(
      "Authorised Signature",
      this.pageWidth - 55,
      this.currentY + 25
    );
  }

  private addHeaderToAllPages(order: OrderItem): void {
    const totalPages = this.doc.getNumberOfPages();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      this.doc.setPage(pageNum);
      this.addHeader(order, pageNum, totalPages);
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  }

  downloadInvoice(filename?: string): void {
    const defaultFilename = `WishBee_Invoice_${new Date().getTime()}.pdf`;
    this.doc.save(filename || defaultFilename);
  }

  getInvoiceBlob(): Blob {
    return this.doc.output('blob');
  }

  openInvoice(): void {
    const pdfDataUri = this.doc.output("datauristring");
    window.open(pdfDataUri, "_blank");
  }

  downloadAndOpenInvoice(filename?: string): void {
    this.downloadInvoice(filename);
  }

  async shareInvoice(filename?: string): Promise<void> {
    // Check if Web Share API is supported
    if (!navigator.share) {
      throw new Error("Web Share API is not supported in this browser");
    }

    const defaultFilename = filename || `WishBee_Invoice_${new Date().getTime()}.pdf`;
    
    // Get PDF as blob (not data URI to avoid blob URLs)
    const pdfBlob = this.doc.output("blob");
    
    // Create a File object from the blob
    const pdfFile = new File([pdfBlob], defaultFilename, {
      type: "application/pdf",
    });

    // Share only the file, without any URL or text that might include blob URLs
    try {
      await navigator.share({
        files: [pdfFile],
        title: defaultFilename.replace(".pdf", ""),
      });
    } catch (error: any) {
      // If sharing fails, fallback to download
      if (error.name !== "AbortError") {
        console.error("Share failed, falling back to download:", error);
        this.downloadInvoice(filename);
        throw error;
      }
      // User cancelled, don't throw error
    }
  }
}

export const generateInvoicePDF = async (
  order: OrderItem,
  userInfo: UserInfo,
  filename?: string
) => {
  // Fetch invoice number from API if not already present
  let invoiceNumber = order.invoiceNumber;

  if (!invoiceNumber) {
    try {
      // Dynamically import apiClient to avoid circular dependencies
      const { apiClient } = await import("@/lib/api/apiClient");
      const response = await apiClient.get(
        `/orders/${order._id}/invoice-number`
      );

      if (response.data.success && response.data.data?.invoiceNumber) {
        invoiceNumber = response.data.data.invoiceNumber;
        // Update order object with invoice number
        order.invoiceNumber = invoiceNumber;
      }
    } catch (error) {
      console.error("Failed to fetch invoice number:", error);
      // Continue without invoice number, will use fallback
    }
  }

  const generator = await InvoiceGenerator.create();
  await generator.generateInvoice(order, userInfo);
  generator.downloadInvoice(filename);
};

export const generateInvoicePDFBlob = async (
  order: OrderItem,
  userInfo: UserInfo
): Promise<Blob> => {
  // Fetch invoice number from API if not already present
  let invoiceNumber = order.invoiceNumber;

  if (!invoiceNumber) {
    try {
      // Dynamically import apiClient to avoid circular dependencies
      const { apiClient } = await import("@/lib/api/apiClient");
      const response = await apiClient.get(
        `/orders/${order._id}/invoice-number`
      );

      if (response.data.success && response.data.data?.invoiceNumber) {
        invoiceNumber = response.data.data.invoiceNumber;
        // Update order object with invoice number
        order.invoiceNumber = invoiceNumber;
      }
    } catch (error) {
      console.error("Failed to fetch invoice number:", error);
      // Continue without invoice number, will use fallback
    }
  }

  const generator = await InvoiceGenerator.create();
  await generator.generateInvoice(order, userInfo);
  return generator.getInvoiceBlob();
};

export const shareInvoicePDF = async (
  order: OrderItem,
  userInfo: UserInfo,
  filename?: string
) => {
  // Fetch invoice number from API if not already present
  let invoiceNumber = order.invoiceNumber;

  if (!invoiceNumber) {
    try {
      // Dynamically import apiClient to avoid circular dependencies
      const { apiClient } = await import("@/lib/api/apiClient");
      const response = await apiClient.get(
        `/orders/${order._id}/invoice-number`
      );

      if (response.data.success && response.data.data?.invoiceNumber) {
        invoiceNumber = response.data.data.invoiceNumber;
        // Update order object with invoice number
        order.invoiceNumber = invoiceNumber;
      }
    } catch (error) {
      console.error("Failed to fetch invoice number:", error);
      // Continue without invoice number, will use fallback
    }
  }

  const generator = await InvoiceGenerator.create();
  await generator.generateInvoice(order, userInfo);
  await generator.shareInvoice(filename);
};
