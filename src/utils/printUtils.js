// import qz from "qz-tray";

// const PRINTER_NAME = "BIXOLON SRP-E302";

// const esc = "\x1B";
// const gs = "\x1D";
// const LINE_WIDTH = 42;

// const leftRight = (left, right, width = LINE_WIDTH) => {
//   const space = width - (left.length + right.length);
//   return left + " ".repeat(space > 0 ? space : 1) + right;
// };

// const divider = (char = "-") => char.repeat(LINE_WIDTH) + "\n";

// const centerText = (text, width = LINE_WIDTH) => {
//   const spaces = Math.max(0, width - text.length);
//   const leftSpaces = Math.floor(spaces / 2);
//   const rightSpaces = spaces - leftSpaces;
//   return " ".repeat(leftSpaces) + text + " ".repeat(rightSpaces) + "\n";
// };

// const formatCurrency = (value) => {
//   const amount = Math.abs(parseFloat(value) || 0);
//   return `Rs. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
// };

// export const generateDailySummaryReport = async (reportData) => {
//   try {
//     if (!qz.websocket.isActive()) {
//       await qz.websocket.connect();
//     }
    
//     const config = qz.configs.create(PRINTER_NAME);

//     const lines = [
//       esc + "@", // Initialize printer
      
//       // Report Header
//       esc + "!" + "\x38", // Double height and emphasized
//       centerText("DAILY SALES SUMMARY REPORT"),
//       esc + "!" + "\x00", // Cancel text formatting
      
//       // Date and Time
//       divider("="),
//       leftRight("Report Date:", new Date().toLocaleDateString()) + "\n",
//       leftRight("Generated:", reportData.generatedAt) + "\n",
//       leftRight("Date Range:", `${reportData.dateRange.start} to ${reportData.dateRange.end}`) + "\n",
//       divider("="),
      
//       // Summary Section
//       esc + "!" + "\x08", // Emphasized
//       centerText("SUMMARY STATISTICS"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       leftRight("Total Sales:", formatCurrency(reportData.summary.totalSales)) + "\n",
//       leftRight("Total Profit:", formatCurrency(reportData.summary.totalProfit)) + "\n",
//       leftRight("Items Sold:", reportData.summary.totalQuantity.toLocaleString('en-IN')) + "\n",
//       leftRight("Transactions:", reportData.summary.totalTransactions.toString()) + "\n",
//       leftRight("Avg Order Value:", formatCurrency(reportData.summary.averageOrderValue)) + "\n",
//       leftRight("Unique Products:", reportData.summary.uniqueProducts.toString()) + "\n",
//       divider("="),
      
//       // Sales Trend Summary
//       esc + "!" + "\x08", // Emphasized
//       centerText("SALES TREND ANALYSIS"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       ...reportData.salesTrend.slice(0, 8).map(interval => 
//         leftRight(interval.time, formatCurrency(interval.sales)) + "\n"
//       ),
      
//       reportData.salesTrend.length > 8 ? 
//         leftRight(`... and ${reportData.salesTrend.length - 8} more intervals`, "") + "\n" : "",
      
//       divider("="),
      
//       // Top Products
//       esc + "!" + "\x08", // Emphasized
//       centerText("TOP PRODUCTS"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       ...reportData.topProducts.slice(0, 5).map((product, index) => [
//         leftRight(
//           `${index + 1}. ${product.name}`,
//           formatCurrency(product.sales)
//         ) + "\n",
//         leftRight(
//           `   Price: ${formatCurrency(product.unitPrice)}`,
//           `Qty: ${product.quantity}`
//         ) + "\n",
//         "\n"
//       ].join("")),
      
//       divider("="),
      
//       // Warehouse Performance
//       esc + "!" + "\x08", // Emphasized
//       centerText("WAREHOUSE PERFORMANCE"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       ...reportData.revenueByWarehouse.map(warehouse => 
//         leftRight(
//           warehouse.name,
//           `${warehouse.value}% (${formatCurrency(warehouse.sales)})`
//         ) + "\n"
//       ),
      
//       divider("="),
      
//       // Category Distribution
//       esc + "!" + "\x08", // Emphasized
//       centerText("CATEGORY DISTRIBUTION"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       ...reportData.categoryDistribution.map(category => 
//         leftRight(
//           category.name,
//           `${category.value}% (${formatCurrency(category.sales)})`
//         ) + "\n"
//       ),
      
//       divider("="),
      
//       // All Sales Transactions
//       esc + "!" + "\x08", // Emphasized
//       centerText("ALL SALES TRANSACTIONS"),
//       esc + "!" + "\x00", // Cancel emphasis
//       divider("-"),
      
//       leftRight("Total Transactions:", reportData.transactions.length.toString()) + "\n",
//       "\n",
      
//       // All transactions with prices
//       ...reportData.transactions.slice(0, 20).map((transaction, index) => [
//         leftRight(`#${index + 1} ${(transaction.PRDESC || 'N/A').substring(0, 25)}`, "") + "\n",
//         leftRight("  Price:", formatCurrency(transaction.UNITPRICE)) + "\n",
//         leftRight("  Qty:", transaction.SOLDQTY.toString()) + "\n",
//         leftRight("  Total:", formatCurrency(transaction.SALESVALUE)) + "\n",
//         leftRight("  Warehouse:", transaction.WHCODE || 'N/A') + "\n",
//         leftRight("  Customer:", transaction.CUSNAME || 'Walk-in') + "\n",
//         leftRight("  Cashier:", transaction.CAHIERNAME || 'N/A') + "\n",
//         "\n"
//       ].join("")),
      
//       reportData.transactions.length > 20 ? 
//         leftRight(`... and ${reportData.transactions.length - 20} more transactions`, "") + "\n" : "",
      
//       divider("="),
      
//       // Footer
//       esc + "a" + "\x01", // Center align
//       esc + "!" + "\x08", // Emphasized
//       "★ END OF REPORT ★\n",
//       esc + "!" + "\x00", // Cancel emphasis
//       "\n",
//       centerText("Generated by Sales Dashboard System"),
//       centerText("Confidential Business Document"),
//       "\n\n\n",
      
//       gs + "V" + "\x41" + "\x03", // Cut paper
//     ];

//     const printData = lines.join("");

//     await qz.print(config, [{ type: "raw", format: "command", data: printData }]);
//     console.log("Daily summary report printed successfully");
    
//   } catch (error) {
//     console.error("Print error:", error);
//     throw new Error(`Failed to print report: ${error.message}`);
//   }
// };









// src/utils/printUtils.js

import qz from "qz-tray";

// Printer Configuration
const PRINTER_CONFIG = {
  name: "BIXOLON SRP-E302",
  lineWidth: 42,
  encoding: "utf-8",
  retries: 3,
  timeout: 30000
};

// ESC/POS Commands
const ESC = "\x1B";
const GS = "\x1D";
const LF = "\x0A";

// Text Formatting
const TextFormat = {
  RESET: ESC + "@",
  BOLD_ON: ESC + "!" + "\x08",
  BOLD_OFF: ESC + "!" + "\x00",
  DOUBLE_HEIGHT: ESC + "!" + "\x30",
  ALIGN_LEFT: ESC + "a" + "\x00",
  ALIGN_CENTER: ESC + "a" + "\x01",
  ALIGN_RIGHT: ESC + "a" + "\x02",
  CUT_PAPER: GS + "V" + "\x41" + "\x03",
  LINE_FEED: LF
};

class PrintService {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
  }

  async ensureConnection() {
    if (!qz.websocket.isActive()) {
      try {
        await qz.websocket.connect({
          retries: 3,
          delay: 1000
        });
        this.isConnected = true;
        this.retryCount = 0;
      } catch (error) {
        this.retryCount++;
        if (this.retryCount >= PRINTER_CONFIG.retries) {
          throw new Error(`Failed to connect to printer after ${PRINTER_CONFIG.retries} attempts: ${error.message}`);
        }
        throw error;
      }
    }
    this.isConnected = true;
  }

  formatCurrency(value) {
    const amount = Math.abs(parseFloat(value) || 0);
    return `Rs. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }

  formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  centerText(text, width = PRINTER_CONFIG.lineWidth) {
    const spaces = Math.max(0, width - text.length);
    const leftSpaces = Math.floor(spaces / 2);
    const rightSpaces = spaces - leftSpaces;
    return " ".repeat(leftSpaces) + text + " ".repeat(rightSpaces);
  }

  leftRight(left, right, width = PRINTER_CONFIG.lineWidth) {
    const space = width - (left.length + right.length);
    return left + " ".repeat(space > 0 ? space : 1) + right;
  }

  divider(char = "-") {
    return char.repeat(PRINTER_CONFIG.lineWidth);
  }

  createSection(title, align = "center") {
    const lines = [];
    lines.push(TextFormat.ALIGN_CENTER);
    lines.push(TextFormat.BOLD_ON);
    lines.push(this.centerText(title) + TextFormat.LINE_FEED);
    lines.push(TextFormat.BOLD_OFF);
    lines.push(TextFormat.ALIGN_LEFT);
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createHeader(reportData) {
    const lines = [];
    lines.push(TextFormat.RESET);
    lines.push(TextFormat.DOUBLE_HEIGHT);
    lines.push(TextFormat.ALIGN_CENTER);
    lines.push(TextFormat.BOLD_ON);
    lines.push(this.centerText("DAILY SALES SUMMARY") + TextFormat.LINE_FEED);
    lines.push(TextFormat.BOLD_OFF);
    lines.push(TextFormat.ALIGN_LEFT);
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    lines.push(this.leftRight("Date:", new Date().toLocaleDateString()) + TextFormat.LINE_FEED);
    lines.push(this.leftRight("Generated:", reportData.generatedAt) + TextFormat.LINE_FEED);
    lines.push(this.leftRight("Period:", `${reportData.dateRange.start} to ${reportData.dateRange.end}`) + TextFormat.LINE_FEED);
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    
    return lines.join("");
  }

  createSummarySection(summary) {
    const lines = [];
    lines.push(this.createSection("SUMMARY STATISTICS"));
    
    const metrics = [
      { label: "Total Sales", value: this.formatCurrency(summary.totalSales) },
      { label: "Total Profit", value: this.formatCurrency(summary.totalProfit) },
      { label: "Items Sold", value: summary.totalQuantity.toLocaleString('en-IN') },
      { label: "Transactions", value: summary.totalTransactions.toString() },
      { label: "Avg Order Value", value: this.formatCurrency(summary.averageOrderValue) },
      { label: "Unique Products", value: summary.uniqueProducts.toString() },
      { label: "Categories", value: summary.totalCategories.toString() },
      { label: "Sub-Categories", value: summary.totalSubCategories.toString() }
    ];

    metrics.forEach(metric => {
      lines.push(this.leftRight(metric.label + ":", metric.value) + TextFormat.LINE_FEED);
    });
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createSalesTrendSection(salesTrend) {
    const lines = [];
    lines.push(this.createSection("HOURLY SALES TREND"));
    
    if (!salesTrend || salesTrend.length === 0) {
      lines.push("No sales data available" + TextFormat.LINE_FEED);
    } else {
      // Get top performing hours
      const topHours = [...salesTrend]
        .filter(hour => hour.sales > 0)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 6);

      topHours.forEach(hour => {
        lines.push(this.leftRight(
          `🕒 ${hour.time}`,
          this.formatCurrency(hour.sales)
        ) + TextFormat.LINE_FEED);
        
        lines.push(this.leftRight(
          "   Transactions:",
          hour.transactions.toString()
        ) + TextFormat.LINE_FEED);
        
        lines.push(this.leftRight(
          "   Quantity:",
          hour.quantity.toString()
        ) + TextFormat.LINE_FEED + TextFormat.LINE_FEED);
      });
    }
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createTopProductsSection(topProducts) {
    const lines = [];
    lines.push(this.createSection("TOP PERFORMING PRODUCTS"));
    
    if (!topProducts || topProducts.length === 0) {
      lines.push("No product data available" + TextFormat.LINE_FEED);
    } else {
      topProducts.slice(0, 5).forEach((product, index) => {
        const rank = ["🥇", "🥈", "🥉", "4.", "5."][index] || `${index + 1}.`;
        
        lines.push(TextFormat.BOLD_ON);
        lines.push(this.leftRight(
          `${rank} ${product.name}`,
          this.formatCurrency(product.sales)
        ) + TextFormat.LINE_FEED);
        lines.push(TextFormat.BOLD_OFF);
        
        lines.push(this.leftRight(
          "   Price:",
          this.formatCurrency(product.unitPrice)
        ) + TextFormat.LINE_FEED);
        
        lines.push(this.leftRight(
          "   Quantity:",
          product.quantity.toString()
        ) + TextFormat.LINE_FEED);
        
        lines.push(this.leftRight(
          "   Profit:",
          this.formatCurrency(product.profit)
        ) + TextFormat.LINE_FEED + TextFormat.LINE_FEED);
      });
    }
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createPerformanceMetrics(salesProfitComparison) {
    const lines = [];
    lines.push(this.createSection("PERFORMANCE METRICS"));
    
    if (salesProfitComparison && salesProfitComparison.length > 0) {
      const totalSales = salesProfitComparison.reduce((sum, item) => sum + item.sales, 0);
      const totalProfit = salesProfitComparison.reduce((sum, item) => sum + item.profit, 0);
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
      
      const peakHour = salesProfitComparison.reduce((peak, current) => 
        current.sales > peak.sales ? current : peak, 
        { sales: 0, time: 'N/A' }
      );

      lines.push(this.leftRight("Profit Margin:", this.formatPercentage(profitMargin)) + TextFormat.LINE_FEED);
      lines.push(this.leftRight("Peak Sales Hour:", peakHour.time) + TextFormat.LINE_FEED);
      lines.push(this.leftRight("Peak Sales Amount:", this.formatCurrency(peakHour.sales)) + TextFormat.LINE_FEED);
      lines.push(TextFormat.LINE_FEED);
    }
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createTransactionsSection(transactions) {
    const lines = [];
    lines.push(this.createSection("RECENT TRANSACTIONS"));
    
    if (!transactions || transactions.length === 0) {
      lines.push("No transactions available" + TextFormat.LINE_FEED);
    } else {
      lines.push(this.leftRight("Total Count:", transactions.length.toString()) + TextFormat.LINE_FEED);
      lines.push(this.divider("-") + TextFormat.LINE_FEED);
      
      transactions.slice(0, 8).forEach((transaction, index) => {
        const productName = (transaction.PRDESC || 'N/A').substring(0, 20);
        
        lines.push(TextFormat.BOLD_ON);
        lines.push(`#${index + 1} ${productName}` + TextFormat.LINE_FEED);
        lines.push(TextFormat.BOLD_OFF);
        
        lines.push(this.leftRight(
          "  Amount:",
          this.formatCurrency(transaction.SALESVALUE)
        ) + TextFormat.LINE_FEED);
        
        lines.push(this.leftRight(
          "  Qty:",
          (transaction.SOLDQTY || 0).toString()
        ) + TextFormat.LINE_FEED);
        
        if (transaction.CUSNAME && transaction.CUSNAME !== 'N/A') {
          lines.push(this.leftRight(
            "  Customer:",
            transaction.CUSNAME.substring(0, 15)
          ) + TextFormat.LINE_FEED);
        }
        
        lines.push(TextFormat.LINE_FEED);
      });

      if (transactions.length > 8) {
        lines.push(this.centerText(`... and ${transactions.length - 8} more transactions`) + TextFormat.LINE_FEED);
      }
    }
    
    lines.push(this.divider("=") + TextFormat.LINE_FEED);
    return lines.join("");
  }

  createFooter() {
    const lines = [];
    lines.push(TextFormat.ALIGN_CENTER);
    lines.push(TextFormat.BOLD_ON);
    lines.push("★ REPORT COMPLETE ★" + TextFormat.LINE_FEED);
    lines.push(TextFormat.BOLD_OFF);
    lines.push(TextFormat.LINE_FEED);
    lines.push("Generated by Sales Dashboard" + TextFormat.LINE_FEED);
    lines.push("Confidential Business Document" + TextFormat.LINE_FEED);
    lines.push(TextFormat.LINE_FEED);
    lines.push(TextFormat.LINE_FEED);
    lines.push(TextFormat.CUT_PAPER);
    
    return lines.join("");
  }

  async printContent(content) {
    try {
      await this.ensureConnection();
      
      const config = qz.configs.create(PRINTER_CONFIG.name, {
        encoding: PRINTER_CONFIG.encoding
      });

      const printData = [{
        type: "raw",
        format: "plain",
        data: content,
        options: {
          language: "ESCPOS",
          dotDensity: "double",
          encoding: "utf-8"
        }
      }];

      const result = await qz.print(config, printData);
      
      return result;
      
    } catch (error) {
      
      throw new Error(`Printing failed: ${error.message}`);
    }
  }

  async generateDailySummaryReport(reportData) {
    try {
      
      
      const content = [
        this.createHeader(reportData),
        this.createSummarySection(reportData.summary),
        this.createSalesTrendSection(reportData.salesTrend),
        this.createTopProductsSection(reportData.topProducts),
        this.createPerformanceMetrics(reportData.salesProfitComparison),
        this.createTransactionsSection(reportData.transactions),
        this.createFooter()
      ].join("");

      await this.printContent(content);
      
      
    } catch (error) {
      
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  async testPrinter() {
    try {
      await this.ensureConnection();
      
      const testContent = [
        TextFormat.RESET,
        TextFormat.ALIGN_CENTER,
        TextFormat.BOLD_ON,
        "PRINTER TEST PAGE" + TextFormat.LINE_FEED,
        TextFormat.BOLD_OFF,
        this.divider("=") + TextFormat.LINE_FEED,
        "Connection: ✓ SUCCESS" + TextFormat.LINE_FEED,
        "Printer: " + PRINTER_CONFIG.name + TextFormat.LINE_FEED,
        "Time: " + new Date().toLocaleString() + TextFormat.LINE_FEED,
        this.divider("=") + TextFormat.LINE_FEED,
        TextFormat.LINE_FEED,
        TextFormat.CUT_PAPER
      ].join("");

      await this.printContent(testContent);
      return true;
      
    } catch (error) {
      
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        await qz.websocket.disconnect();
        this.isConnected = false;
        
      } catch (error) {
       
      }
    }
  }
}

// Create singleton instance
const printService = new PrintService();

// Export main function and service instance
export const generateDailySummaryReport = (reportData) => 
  printService.generateDailySummaryReport(reportData);

export const testPrinterConnection = () => 
  printService.testPrinter();

export const disconnectPrinter = () => 
  printService.disconnect();

export default printService;























































// src/utils/printUtils.js

// /**
//  * Generate and print daily summary report
//  * @param {Object} reportData - The report data to print
//  */
// export const generateDailySummaryReport = async (reportData) => {
//   return new Promise((resolve, reject) => {
//     try {
//       // Create a new window for printing
//       const printWindow = window.open('', '_blank', 'width=1000,height=800');
      
//       if (!printWindow) {
//         reject(new Error('Popup blocked! Please allow popups for this site to print reports.'));
//         return;
//       }

//       // Generate the HTML content for the report
//       const htmlContent = generateReportHTML(reportData);
      
//       printWindow.document.write(htmlContent);
//       printWindow.document.close();

//       // Wait for images and content to load
//       printWindow.onload = () => {
//         try {
//           // Add a small delay to ensure everything is loaded
//           setTimeout(() => {
//             printWindow.focus();
//             printWindow.print();
            
//             // Close the window after printing
//             setTimeout(() => {
//               printWindow.close();
//               resolve();
//             }, 500);
//           }, 500);
//         } catch (error) {
//           printWindow.close();
//           reject(new Error('Print failed: ' + error.message));
//         }
//       };

//       // Fallback in case onload doesn't fire
//       setTimeout(() => {
//         if (printWindow.document.readyState === 'complete') {
//           printWindow.focus();
//           printWindow.print();
//           setTimeout(() => {
//             printWindow.close();
//             resolve();
//           }, 500);
//         }
//       }, 1000);

//     } catch (error) {
//       reject(new Error('Print setup failed: ' + error.message));
//     }
//   });
// };

// /**
//  * Generate HTML content for the daily summary report
//  * @param {Object} data - Report data
//  * @returns {string} HTML content
//  */
// const generateReportHTML = (data) => {
//   const {
//     summary,
//     salesTrend,
//     hourlySales,
//     topProducts,
//     salesProfitComparison,
//     transactions,
//     dateRange,
//     generatedAt
//   } = data;

//   // Format currency function
//   const formatCurrency = (value) => {
//     const amount = parseFloat(value) || 0;
//     return `Rs. ${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Daily Sales Summary Report</title>
//     <style>
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }
//         body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             background: #fff;
//             padding: 20px;
//         }
//         .report-container {
//             max-width: 1000px;
//             margin: 0 auto;
//             background: #fff;
//         }
//         .header {
//             text-align: center;
//             border-bottom: 3px solid #2c5aa0;
//             padding-bottom: 20px;
//             margin-bottom: 30px;
//         }
//         .header h1 {
//             color: #2c5aa0;
//             font-size: 28px;
//             margin-bottom: 10px;
//         }
//         .header .subtitle {
//             color: #666;
//             font-size: 16px;
//         }
//         .date-info {
//             background: #f8f9fa;
//             padding: 15px;
//             border-radius: 8px;
//             margin-bottom: 20px;
//             text-align: center;
//         }
//         .summary-cards {
//             display: grid;
//             grid-template-columns: repeat(4, 1fr);
//             gap: 15px;
//             margin-bottom: 30px;
//         }
//         .summary-card {
//             background: #fff;
//             border: 1px solid #e0e0e0;
//             border-radius: 8px;
//             padding: 15px;
//             text-align: center;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
//         .summary-card.primary {
//             border-top: 4px solid #28a745;
//         }
//         .summary-card.warning {
//             border-top: 4px solid #ffc107;
//         }
//         .summary-card.info {
//             border-top: 4px solid #17a2b8;
//         }
//         .summary-card.danger {
//             border-top: 4px solid #dc3545;
//         }
//         .card-value {
//             font-size: 20px;
//             font-weight: bold;
//             color: #2c5aa0;
//             margin: 10px 0;
//         }
//         .card-label {
//             font-size: 12px;
//             color: #666;
//             text-transform: uppercase;
//         }
//         .section {
//             margin-bottom: 30px;
//         }
//         .section-title {
//             background: #2c5aa0;
//             color: white;
//             padding: 12px 15px;
//             border-radius: 6px;
//             margin-bottom: 15px;
//             font-size: 16px;
//         }
//         table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-bottom: 20px;
//         }
//         th {
//             background: #f8f9fa;
//             padding: 12px;
//             text-align: left;
//             font-weight: 600;
//             border-bottom: 2px solid #dee2e6;
//         }
//         td {
//             padding: 12px;
//             border-bottom: 1px solid #dee2e6;
//         }
//         tr:hover {
//             background: #f8f9fa;
//         }
//         .text-right {
//             text-align: right;
//         }
//         .text-center {
//             text-align: center;
//         }
//         .chart-placeholder {
//             background: #f8f9fa;
//             border: 2px dashed #dee2e6;
//             border-radius: 8px;
//             padding: 40px;
//             text-align: center;
//             margin: 20px 0;
//             color: #6c757d;
//         }
//         .footer {
//             margin-top: 40px;
//             padding-top: 20px;
//             border-top: 2px solid #dee2e6;
//             text-align: center;
//             color: #666;
//             font-size: 12px;
//         }
//         .no-data {
//             text-align: center;
//             padding: 40px;
//             color: #666;
//             font-style: italic;
//         }
//         @media print {
//             body {
//                 padding: 0;
//             }
//             .no-print {
//                 display: none;
//             }
//             .summary-cards {
//                 page-break-inside: avoid;
//             }
//             .section {
//                 page-break-inside: avoid;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="report-container">
//         <div class="header">
//             <h1>Daily Sales Summary Report</h1>
//             <div class="subtitle">Comprehensive overview of daily sales performance</div>
//         </div>

//         <div class="date-info">
//             <strong>Report Period:</strong> ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)} | 
//             <strong>Generated:</strong> ${generatedAt}
//         </div>

//         <!-- Summary Statistics -->
//         <div class="section">
//             <div class="section-title">Key Performance Indicators</div>
//             <div class="summary-cards">
//                 <div class="summary-card primary">
//                     <div class="card-label">Total Sales</div>
//                     <div class="card-value">${formatCurrency(summary.totalSales)}</div>
//                 </div>
//                 <div class="summary-card warning">
//                     <div class="card-label">Total Profit</div>
//                     <div class="card-value">${formatCurrency(summary.totalProfit)}</div>
//                 </div>
//                 <div class="summary-card info">
//                     <div class="card-label">Items Sold</div>
//                     <div class="card-value">${summary.totalQuantity.toLocaleString()}</div>
//                 </div>
//                 <div class="summary-card danger">
//                     <div class="card-label">Transactions</div>
//                     <div class="card-value">${summary.totalTransactions}</div>
//                 </div>
//             </div>
//         </div>

//         <!-- Sales Trend -->
//         <div class="section">
//             <div class="section-title">Hourly Sales Trend</div>
//             ${salesTrend && salesTrend.length > 0 ? `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Time</th>
//                         <th class="text-right">Sales Amount</th>
//                         <th class="text-right">Transactions</th>
//                         <th class="text-right">Quantity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${salesTrend.map(hour => `
//                     <tr>
//                         <td>${hour.time}</td>
//                         <td class="text-right">${formatCurrency(hour.sales)}</td>
//                         <td class="text-right">${hour.transactions}</td>
//                         <td class="text-right">${hour.quantity}</td>
//                     </tr>
//                     `).join('')}
//                 </tbody>
//             </table>
//             ` : '<div class="no-data">No sales trend data available</div>'}
//         </div>

//         <!-- Top Products -->
//         <div class="section">
//             <div class="section-title">Top Performing Products</div>
//             ${topProducts && topProducts.length > 0 ? `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Product Name</th>
//                         <th class="text-right">Sales Amount</th>
//                         <th class="text-right">Quantity Sold</th>
//                         <th class="text-right">Profit</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${topProducts.map(product => `
//                     <tr>
//                         <td>${product.name}</td>
//                         <td class="text-right">${formatCurrency(product.sales)}</td>
//                         <td class="text-right">${product.quantity}</td>
//                         <td class="text-right">${formatCurrency(product.profit)}</td>
//                     </tr>
//                     `).join('')}
//                 </tbody>
//             </table>
//             ` : '<div class="no-data">No product data available</div>'}
//         </div>

//         <!-- Recent Transactions -->
//         <div class="section">
//             <div class="section-title">Recent Transactions</div>
//             ${transactions && transactions.length > 0 ? `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Product</th>
//                         <th>Customer</th>
//                         <th class="text-right">Quantity</th>
//                         <th class="text-right">Unit Price</th>
//                         <th class="text-right">Total</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${transactions.slice(0, 10).map(transaction => `
//                     <tr>
//                         <td>${transaction.PRDESC || 'N/A'}</td>
//                         <td>${transaction.CUSNAME || 'N/A'}</td>
//                         <td class="text-right">${transaction.SOLDQTY || 0}</td>
//                         <td class="text-right">${formatCurrency(transaction.UNITPRICE)}</td>
//                         <td class="text-right">${formatCurrency(transaction.SALESVALUE)}</td>
//                     </tr>
//                     `).join('')}
//                 </tbody>
//             </table>
//             ` : '<div class="no-data">No transaction data available</div>'}
//         </div>

//         <!-- Chart Placeholders -->
//         <div class="section">
//             <div class="section-title">Sales Analytics</div>
//             <div class="chart-placeholder">
//                 <h3>Sales Trend Chart</h3>
//                 <p>Chart visualization would appear here in the digital version</p>
//             </div>
//             <div class="chart-placeholder">
//                 <h3>Top Products Chart</h3>
//                 <p>Chart visualization would appear here in the digital version</p>
//             </div>
//         </div>

//         <div class="footer">
//             <p>Generated by Sales Dashboard System</p>
//             <p>This is an automated report. For any discrepancies, please contact the system administrator.</p>
//         </div>
//     </div>

//     <script>
//         // Add print and close buttons for better UX
//         document.addEventListener('DOMContentLoaded', function() {
//             const header = document.querySelector('.header');
//             const buttonContainer = document.createElement('div');
//             buttonContainer.className = 'no-print';
//             buttonContainer.style.cssText = 'text-align: center; margin: 20px 0;';
            
//             buttonContainer.innerHTML = \`
//                 <button onclick="window.print()" style="
//                     background: #28a745;
//                     color: white;
//                     border: none;
//                     padding: 10px 20px;
//                     border-radius: 5px;
//                     cursor: pointer;
//                     margin: 5px;
//                     font-size: 14px;">
//                     🖨️ Print Report
//                 </button>
//                 <button onclick="window.close()" style="
//                     background: #6c757d;
//                     color: white;
//                     border: none;
//                     padding: 10px 20px;
//                     border-radius: 5px;
//                     cursor: pointer;
//                     margin: 5px;
//                     font-size: 14px;">
//                     ❌ Close Window
//                 </button>
//             \`;
            
//             header.parentNode.insertBefore(buttonContainer, header.nextSibling);
//         });
//     </script>
// </body>
// </html>
//   `;
// };