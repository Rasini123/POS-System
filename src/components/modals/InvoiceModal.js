// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { closeModal } from "../../actions/modalActions";
// import { clearCart } from "../../actions/POS/cartActions";
// import { getInvoiceDetails,getInvoiceImage } from "../../actions/POS/invoiceActions";
// import Modal from "../common/Modal";
// import qz from "qz-tray";
// import Barcode from "react-barcode"; 
// import { fetchProducts } from "../../actions/POS/productAction";
// import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";

// const PRINTER_NAME = "BIXOLON SRP-E302";


// const CASH_DRAWER_COMMANDS = {
//   // ESC/POS commands for cash drawer
//   OPEN_DRAWER_PIN2: "\x1B\x70\x00\x19\xFA",
//   OPEN_DRAWER_PIN5: "\x1B\x70\x01\x19\xFA",
//   ALTERNATE_1: "\x1B\x70\x00\x60\x60",
//   ALTERNATE_2: "\x1B\x70\x01\x60\x60",
//   BELL_COMMAND: "\x07",
// };

// const getCurrentDateString = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   return `${year}${month}${day}`;
// };

// const getNextInvoiceNumber = () => {
//   const today = getCurrentDateString();
//   const lastInvoice = localStorage.getItem('lastInvoice');
//   if (lastInvoice) {
//     const lastDate = lastInvoice.substring(0, 8);
//     const lastNumber = lastInvoice.substring(8);
//     if (lastDate === today) {
//       const nextNum = String(parseInt(lastNumber) + 1).padStart(4, '0');
//       return `${today}${nextNum}`;
//     }
//   }
//   return `${today}0000`;
// };

// const storeInvoiceNumber = (invoiceNumber) => {
//   localStorage.setItem('lastInvoice', invoiceNumber);
// };

// const getInvoiceData = (invoiceNumber) => {
//   const sampleInvoices = {
//     "202405150000": {
//       items: [
//         { id: 1, name: "Product A", price: 100, quantity: 2 },
//         { id: 2, name: "Product B", price: 50, quantity: 1 }
//       ],
//       subtotal: 250,
//       total: 225,
//       paymentMethod: "Cash",
//       paidAmount: 300,
//       changeAmount: 75,
//       date: "2024-05-15",
//       time: "10:30 AM"
//     },
//     "202405150001": {
//       items: [
//         { id: 3, name: "Product C", price: 75, quantity: 3 },
//         { id: 4, name: "Product D", price: 120, quantity: 1 }
//       ],
//       subtotal: 345,
//       total: 345,
//       paymentMethod: "Card",
//       paidAmount: 400,
//       changeAmount: 55,
//       date: "2024-05-15",
//       time: "02:15 PM"
//     }
//   };

//   return sampleInvoices[invoiceNumber] || null;
// };

// const formatCurrency = (value) => {
//   return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// };

// // Product-specific discount calculations
// const getProductDiscount = (item) => {
//   if (item.discountType === 'Percentage') {
//     return (item.price * item.discountValue) / 100;
//   } else if (item.discountType === 'Value') {
//     return item.discountValue;
//   }
//   return 0; // No discount
// };

// const getDiscountedPrice = (item) => {
//   return item.discountedPrice || item.price;
// };

// const getItemTotal = (item) => {
//   const discountedPrice = getDiscountedPrice(item);
//   return discountedPrice * item.quantity;
// };

// const getItemDiscountAmount = (item) => {
//   const discountAmount = getProductDiscount(item);
//   return discountAmount * item.quantity;
// };

// const getItemDiscountPercentage = (item) => {
//   if (item.discountType === 'Percentage') {
//     return item.discountValue;
//   } else if (item.discountType === 'Value' && item.price > 0) {
//     return ((item.discountValue / item.price) * 100).toFixed(1);
//   }
//   return 0;
// };

// // Function to convert image to thermal printer compatible format
// const convertImageForThermalPrint = async (imageUrl) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = function() {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       // Set canvas size for thermal printer (max 384 pixels width for most thermal printers)
//       const maxWidth = 384;
//       const scaleFactor = maxWidth / img.width;
//       canvas.width = maxWidth;
//       canvas.height = img.height * scaleFactor;

//       // Draw image on canvas
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       // Get image data and convert to black and white for thermal printing
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const data = imageData.data;

//       // Convert to 1-bit monochrome (black and white)
//       for (let i = 0; i < data.length; i += 4) {
//         const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
//         // Use threshold to convert to black or white
//         const value = brightness > 128 ? 255 : 0;
//         data[i] = value;     // red
//         data[i + 1] = value; // green
//         data[i + 2] = value; // blue
//         // alpha remains the same
//       }

//       ctx.putImageData(imageData, 0, 0);

//       // Convert to base64 for printing
//       const processedImageData = canvas.toDataURL('image/png');
//       resolve(processedImageData);
//     };

//     img.onerror = function() {
//       reject(new Error('Failed to load image'));
//     };

//     img.src = imageUrl;
//   });
// };

// const InvoiceModal = () => {
//   const dispatch = useDispatch();
//   const { darkMode } = useSelector(state => state.ui);
//   const { modalProps } = useSelector((state) => state.ui);
//   const { items: cartItems, tabs, activeTabId } = useSelector((state) => state.cart);
//   const { invoiceDetails } = useSelector((state) => state.invoice);

//   const [invoiceSettings, setInvoiceSettings] = useState({
//     templates: [],
//     selectedTemplate: 'retail',
//     companyDetails: {}
//   });

//   const [invoiceNumber, setInvoiceNumber] = useState("");
//   const [scanMode, setScanMode] = useState(false);
//   const [scannedInvoice, setScannedInvoice] = useState(null);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [isPrinting, setIsPrinting] = useState(false);
//   const [isOpeningDrawer, setIsOpeningDrawer] = useState(false);
//   const [printableImage, setPrintableImage] = useState(null);
//   const barcodeInputRef = useRef(null);

//   const apiImageUrl = invoiceDetails?.ResultSet?.[0]?.IMAGEURL;
//   const { imageData: authenticatedLogo } = useAuthenticatedImage(apiImageUrl);

//   // Define companyDetails here to avoid initialization issues
//   const companyDetails = invoiceSettings.companyDetails || {};

//   useEffect(() => {
//     const loadInvoiceSettings = () => {
//       try {
//         const savedSettings = localStorage.getItem('invoiceSettings');
//         if (savedSettings) {
//           const parsedSettings = JSON.parse(savedSettings);
//           setInvoiceSettings(parsedSettings);
//         } else {
//           setInvoiceSettings({
//             templates: [
//               {
//                 id: 'retail',
//                 name: 'Retail Template',
//                 description: 'Modern retail invoice design',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'vertical',
//                   showSaving: true
//                 }
//               },
//               {
//                 id: 'default',
//                 name: 'Default Template',
//                 description: 'Standard invoice layout',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'vertical',
//                   showSaving: false
//                 }
//               },
//               {
//                 id: 'minimal',
//                 name: 'Minimal Template',
//                 description: 'Clean and simple design',
//                 fields: {
//                   showLogo: false,
//                   showHeader: true,
//                   showFooter: false,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: false,
//                   layout: 'compact',
//                   showSaving: false
//                 }
//               },
//               {
//                 id: 'professional',
//                 name: 'Professional Template',
//                 description: 'Formal business style',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'detailed',
//                   showSaving: false
//                 }
//               }
//             ],
//             selectedTemplate: 'retail',
//             companyDetails: {
//               name: 'DCSICN CLUB',
//               phone: '070 - 731 4445',
//               address: 'No. 316/7, Thalangama North, Battaramulla.',
//               email: '',
//               website: '',
//               taxNumber: '',
//               logo: '',
//               footerText: 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
//               termsAndConditions: 'Goods sold are not returnable. Warranty as per manufacturer terms.'
//             }
//           });
//         }
//       } catch (error) {
//         console.error('Error loading invoice settings:', error);
//       }
//     };

//     loadInvoiceSettings();
//     dispatch(getInvoiceDetails());
//   }, [dispatch]);

//   useEffect(() => {
//     dispatch(getInvoiceImage());
//   }, [dispatch]);

//   useEffect(() => {
//     if (invoiceDetails && invoiceDetails.ResultSet && invoiceDetails.ResultSet.length > 0) {
//       const apiData = invoiceDetails.ResultSet[0];
//       setInvoiceSettings(prev => ({
//         ...prev,
//         companyDetails: {
//           name: apiData.p_company_name || 'DCSICN CLUB',
//           phone: apiData.p_phone_number || '070 - 731 4445',
//           address: apiData.p_address || 'No. 316/7, Thalangama North, Battaramulla.',
//           email: apiData.p_email || '',
//           website: apiData.p_website || '',
//           taxNumber: apiData.p_tax_number || '',
//           logo: authenticatedLogo || apiData.IMAGEURL || '',
//           footerText: apiData.p_footer_text || 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
//           termsAndConditions: apiData.p_terms_conditions || 'Goods sold are not returnable. Warranty as per manufacturer terms.'
//         }
//       }));
//     }
//   }, [invoiceDetails, authenticatedLogo]);

//   // Prepare printable image when logo is available
//   useEffect(() => {
//     const preparePrintableImage = async () => {
//       const currentCompanyDetails = invoiceSettings.companyDetails || {};
//       if (currentCompanyDetails.logo) {
//         try {
//           const processedImage = await convertImageForThermalPrint(currentCompanyDetails.logo);
//           setPrintableImage(processedImage);
//         } catch (error) {
//           console.error('Error preparing image for printing:', error);
//           setPrintableImage(null);
//         }
//       } else {
//         setPrintableImage(null);
//       }
//     };

//     preparePrintableImage();
//   }, [invoiceSettings.companyDetails]);

//   const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
//   //const { items: activeTabItems } = activeTab;
// const { items: activeTabItems, discount: cartDiscount = 0 } = activeTab; 
//   const items = activeTabItems || cartItems || [];

//   const {
//     subtotal: propSubtotal = 0,
//     total: propTotal = 0,
//     paymentMethod = "",
//     paidAmount = 0,
//     changeAmount = 0,
//      discount: propDiscount = 0,  
//     cartDiscount: propCartDiscount = 0,  
//     totalProductDiscount: propTotalProductDiscount = 0, 
//   } = modalProps || {};

//   const calculateAmounts = () => {
//     const itemTotals = items.map(item => getItemTotal(item));
//     const subtotal = itemTotals.reduce((sum, total) => sum + total, 0);

//     const totalProductDiscount = items.reduce(
//       (sum, item) => sum + getItemDiscountAmount(item),
//       0
//     );

//     const additionalCartDiscount = cartDiscount || 0;

//     const total = subtotal - additionalCartDiscount;

//     return {
//       subtotal,
//      totalProductDiscount: propTotalProductDiscount || totalProductDiscount,
//       additionalCartDiscount,
//       total
//     };
//   };

//   const {
//     subtotal,
//    totalProductDiscount,
//     additionalCartDiscount,
//     total
//   } = calculateAmounts();

//   const invoiceDate = new Date().toLocaleDateString();
//   const invoiceTime = new Date().toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const formattedInvoiceNumber = invoiceNumber || "";

//   useEffect(() => {
//     const newInvoiceNumber = getNextInvoiceNumber();
//     setInvoiceNumber(newInvoiceNumber);
//   }, []);

//   useEffect(() => {
//     if (scanMode && barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//   }, [scanMode]);

//   useEffect(() => {
//     if (barcodeInput.length >= 12) {
//       const invoiceData = getInvoiceData(barcodeInput);
//       if (invoiceData) {
//         setScannedInvoice(invoiceData);
//         setScanMode(false);
//       } else {
//         alert("Invoice not found!");
//         setBarcodeInput("");
//       }
//     }
//   }, [barcodeInput]);

//   const currentTemplate = invoiceSettings.templates?.find(
//     t => t.id === invoiceSettings.selectedTemplate
//   ) || { fields: {} };

//   const esc = "\x1B";
//   const gs = "\x1D";
//   const LINE_WIDTH = 42;

//   const leftRight = (left, right, width = LINE_WIDTH) => {
//     const space = width - (left.length + right.length);
//     return left + " ".repeat(space > 0 ? space : 1) + right;
//   };

//   const divider = (char = "-") => char.repeat(LINE_WIDTH) + "\n";

//   const generateBarcodeCommands = (data) => {
//     return [
//       gs + "H" + "\x02",
//       gs + "w" + "\x02",
//       gs + "h" + "\x35",
//       gs + "k" + "\x04" + data + "\x00",
//       "\n",
//     ];
//   };

//   // Enhanced Cash Drawer Function
//   const openCashDrawer = async () => {
//     try {

//       if (!qz.websocket.isActive()) {
//         await qz.websocket.connect();
//       }

//       const config = qz.configs.create(PRINTER_NAME);

//       // Try different cash drawer commands in sequence
//       const commands = [
//         CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN2,
//         CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN5,
//         CASH_DRAWER_COMMANDS.ALTERNATE_1,
//         CASH_DRAWER_COMMANDS.ALTERNATE_2,
//         CASH_DRAWER_COMMANDS.BELL_COMMAND
//       ];

//       let drawerOpened = false;
//       let lastError = null;

//       for (const command of commands) {
//         try {
//           await qz.print(config, [{ type: "raw", format: "command", data: command }]);
//           drawerOpened = true;
//           break;
//         } catch (error) {
//           console.warn(`Cash drawer command failed: ${error.message}`);
//           lastError = error;
//           // Continue to next command
//         }
//       }

//       if (!drawerOpened) {
//         console.error("All cash drawer commands failed", lastError);
//         throw new Error(`Cash drawer failed to open: ${lastError?.message || 'Unknown error'}`);
//       }

//       return drawerOpened;
//     } catch (error) {
//       console.error("Cash drawer error:", error);
//       throw error;
//     }
//   };

//   // Enhanced Print function with cash drawer and image printing - UPDATED TO REMOVE CART DISCOUNT
//   const handlePrint = async () => {
//     if (isPrinting) return;

//     setIsPrinting(true);
//     localStorage.removeItem("saleId");
//     localStorage.removeItem("invoiceNumber");
//     dispatch(fetchProducts());

//     try {
//       // Connect to printer first
//       if (!qz.websocket.isActive()) {
//         await qz.websocket.connect();
//       }
//       const config = qz.configs.create(PRINTER_NAME);

//       // Create print data with enhanced formatting
//       const lines = [
//         esc + "@", // Initialize printer

//         // Print company logo if available
//         ...(printableImage ? [
//           esc + "a" + "\x01", // Center align
//           "[" + (companyDetails.name || "DCSICN CLUB") + " LOGO]\n",
//           esc + "a" + "\x00", // Left align
//           "\n"
//         ] : []),

//         // Company header - Big and Bold
//         esc + "!" + "\x38", // Select double height and emphasized printing
//         esc + "a" + "\x01", // Center align
//         "★ " + (companyDetails.name || "DCSICN CLUB") + " ★\n",
//         esc + "!" + "\x00", // Cancel text formatting
//         esc + "a" + "\x00", // Left align

//         // Company details
//         esc + "!" + "\x08", // Select emphasized printing
//         (companyDetails.phone || "070 - 731 4445") + "\n",
//         (companyDetails.address || "No. 316/7, Thalangama North, Battaramulla.") + "\n",
//         esc + "!" + "\x00", // Cancel text formatting

//         divider("="),

//         // Invoice info
//         leftRight("Invoice:", formattedInvoiceNumber) + "\n",
//         leftRight("Date:", `${invoiceDate} ${invoiceTime}`) + "\n",
//         divider("-"),

//         // Items header
//         esc + "!" + "\x08", // Emphasized
//         leftRight("Item", "Qty  Price   Total") + "\n",
//         esc + "!" + "\x00", // Cancel emphasis
//         divider("-"),

//         // Items list
//         ...items.map((item) => {
//           const discountedPrice = getDiscountedPrice(item);
//           const itemTotal = getItemTotal(item);
//           const saving = getItemDiscountAmount(item);

//           const line1 = item.name.length > 28 ? item.name.slice(0, 28) : item.name;
//           const line2 = leftRight(
//             " ".repeat(2) + `${item.quantity} x ${discountedPrice.toFixed(2)}`,
//             itemTotal.toFixed(2)
//           );
//           const line3 = leftRight(
//             " ".repeat(2) + `Saving: -${saving.toFixed(2)}`,
//             ""
//           );

//           return line1 + "\n" + line2 + "\n" + line3 + "\n";
//         }),

//         divider("-"),
//         leftRight("Subtotal", "Rs." + subtotal.toFixed(2)) + "\n",

//         // REMOVED CART DISCOUNT DISPLAY
//         leftRight("Product Discount", "-Rs." + totalProductDiscount.toFixed(2)) + "\n",
//         additionalCartDiscount > 0 ? leftRight("Additional Discount", "-Rs." + additionalCartDiscount.toFixed(2)) + "\n" : "",
//         divider("="),
//         esc + "!" + "\x38", // Double height and emphasized
//         leftRight("TOTAL", "Rs." + total.toFixed(2)) + "\n",
//         esc + "!" + "\x00", // Cancel text formatting
//         divider("="),

//         // Payment information
//         paidAmount > 0 ? leftRight("Paid", "Rs." + paidAmount.toFixed(2)) + "\n" : "",
//         changeAmount > 0
//           ? leftRight("Change", "Rs." + changeAmount.toFixed(2)) + "\n"
//           : "",
//         paymentMethod ? leftRight("Payment", paymentMethod) + "\n" : "",
//         divider("-"),

//         // Retail template footer
//         esc + "a" + "\x01", // Center align
//         esc + "!" + "\x08", // Emphasized
//         "★ THANK YOU ★\n",
//         esc + "!" + "\x00", // Cancel emphasis
//         "\n",
//         (companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.") + "\n",
//         "\n",

//         // Barcode
//         ...generateBarcodeCommands(invoiceNumber),

//         "\n\n",
//         gs + "V" + "\x41" + "\x03",  
//       ];

//       const printData = lines.join("");

//       await qz.print(config, [{ type: "raw", format: "command", data: printData }]);

//       await openCashDrawer();

//       storeInvoiceNumber(invoiceNumber);
//       handleClose();
//     } catch (err) {
//       console.error("Print process failed:", err);
//       alert("Print error: " + err.message);
//     } finally {
//       setIsPrinting(false);
//     }
//   };

//   // Separate function to just open cash drawer
//   const handleOpenCashDrawer = async () => {
//     if (isOpeningDrawer) return;

//     setIsOpeningDrawer(true);
//     try {
//       await openCashDrawer();
//       alert("Cash drawer opened successfully!");
//     } catch (error) {
//       console.error("Cash drawer error:", error);
//       alert("Error opening cash drawer: " + error.message);
//     } finally {
//       setIsOpeningDrawer(false);
//     }
//   };

//   useEffect(() => {
//     // First, try to get invoice number from localStorage (from API)
//     const savedInvoiceNumber = localStorage.getItem("invoiceNumber");

//     if (savedInvoiceNumber) { 
//       setInvoiceNumber(savedInvoiceNumber);
//     } else { 
//       const newInvoiceNumber = getNextInvoiceNumber();
//       setInvoiceNumber(newInvoiceNumber);
//     }
//   }, []);

//   const formatInvoiceNumber = (invNum) => {
//     if (!invNum) return "";
//     return invNum.toString();
//   };

//   const handleClose = () => {
//     localStorage.removeItem("saleId");
//     dispatch(closeModal());
//     dispatch(clearCart());
//     dispatch(fetchProducts());
//     localStorage.removeItem("invoiceNumber");
//   };

//   const handleScanModeToggle = () => {
//     setScanMode(!scanMode);
//     setBarcodeInput("");
//     setScannedInvoice(null);
//   };

//   const handleBarcodeInput = (e) => {
//     setBarcodeInput(e.target.value);
//   };

//   const displayData = scannedInvoice || {
//     items,
//     subtotal,
//     total,
//     paymentMethod,
//     paidAmount,
//     changeAmount,
//     date: invoiceDate,
//     time: invoiceTime
//   };

//   const renderInvoiceTemplate = () => {
//     const templateId = invoiceSettings.selectedTemplate || 'retail';

//     switch (templateId) {
//       case 'retail':
//         return renderRetailTemplate();
//       case 'minimal':
//         return renderMinimalTemplate();
//       case 'professional':
//         return renderProfessionalTemplate();
//       default:
//         return renderDefaultTemplate();
//     }
//   };

//   const renderRetailTemplate = () => (
//     <div className="space-y-4">
//       {/* Retail Header */}
//       {currentTemplate.fields.showHeader && (
//         <div className={`text-center border-b-2 pb-4 ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
//           {companyDetails.logo && currentTemplate.fields.showLogo && (
//             <img 
//               src={companyDetails.logo} 
//               alt="Company Logo" 
//               className="h-16 mx-auto mb-2"
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             ★ {companyDetails.name || 'DCSICN CLUB'} ★
//           </h2>
//           <p className="text-sm font-semibold text-gray-600">{companyDetails.phone || '070 - 731 4445'}</p>
//           <p className="text-xs text-gray-500">{companyDetails.address || 'No. 316/7, Thalangama North, Battaramulla.'}</p>
//         </div>
//       )}

//       {/* Invoice Info */}
//       <div className={`p-3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
//         <div className="flex justify-between text-sm">
//           <div>
//             <span className="font-semibold">Invoice #: </span>
//             {scannedInvoice ? barcodeInput : formattedInvoiceNumber}
//           </div>
//           <div>
//             <span className="font-semibold">Date: </span>
//             {scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}
//           </div>
//         </div>
//       </div>

//       {/* Items Table */}
//       <div className={`border rounded-lg overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
//         <div
//           className={`grid grid-cols-5 text-xs font-bold px-3 py-2 border-b
//             ${darkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}
//         >
//           <div className="col-span-3">Item</div>
//           <div className="text-center">Qty</div>
//           <div className="text-right">Total</div>
//         </div>
//         {renderRetailItemsTable()}
//       </div>

//       {/* Totals */}
//       {renderRetailTotalsSection()}

//       {/* Footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className={`text-center border-t-2 pt-4 text-xs ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-600"}`}>
//           <p className="font-semibold mb-2">★ THANK YOU ★</p>
//           <p className="leading-relaxed">{companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days."}</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderRetailItemsTable = () => {
//     if (!displayData.items || displayData.items.length === 0) {
//       return <p className="text-center py-4 text-gray-400">No items</p>;
//     }

//     return displayData.items.map((item) => {
//       const discountedPrice = getDiscountedPrice(item);
//       const itemTotal = getItemTotal(item);
//       const saving = getItemDiscountAmount(item);

//       return (
//         <div key={item.id} className="border-b border-gray-100">
//           <div className="grid grid-cols-5 px-3 py-2 text-sm">
//             <div className="col-span-3 font-medium">{item.name}</div>
//             <div className="text-center">{item.quantity}</div>
//             <div className="text-right font-semibold">Rs.{formatCurrency(itemTotal)}</div>
//           </div>
//           <div className="grid grid-cols-5 px-3 pb-2 text-xs text-gray-500">
//             <div className="col-span-3">
//               {item.quantity} x Rs.{formatCurrency(discountedPrice)}
//               <span className="text-red-500 ml-2">
//                 (Saving: -Rs.{formatCurrency(saving)})
//               </span>
//             </div>
//             <div className="col-span-2 text-right line-through text-gray-400">
//               Rs.{formatCurrency(item.price * item.quantity)}
//             </div>
//           </div>
//         </div>
//       );
//     });
//   };

//   const renderRetailTotalsSection = () => (
//     <div className="space-y-2 text-sm">
//       <div className="flex justify-between border-b pb-1">
//         <span>Subtotal:</span>
//         <span>Rs.{formatCurrency(subtotal)}</span>
//       </div>

//       {currentTemplate.fields.showDiscountBreakdown && (
//         <div className="flex justify-between text-red-500 border-b pb-1">
//           <span>Product Discounts:</span>
//           <span>-Rs.{formatCurrency(totalProductDiscount)}</span>
//         </div>
//       )}

//           {additionalCartDiscount > 0 && (
//         <div className="flex justify-between text-red-500">
//           <span>Additional Discount:</span>
//           <span>-Rs.{formatCurrency(additionalCartDiscount)}</span>
//         </div>
//       )}

//       <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2">
//         <span>TOTAL:</span>
//         <span>Rs.{formatCurrency(total)}</span>
//       </div>

//       {/* Payment Info */}
//       {((displayData.paidAmount > 0) || (displayData.changeAmount > 0) || displayData.paymentMethod) && (
//         <div
//           className={`mt-3 border-t pt-2 space-y-1 p-2 rounded 
//             ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"}`}
//         >
//           {displayData.paidAmount > 0 && (
//             <div className="flex justify-between">
//               <span>Paid:</span>
//               <span>Rs.{formatCurrency(displayData.paidAmount)}</span>
//             </div>
//           )}
//           {displayData.changeAmount > 0 && (
//             <div className="flex justify-between">
//               <span>Change:</span>
//               <span>Rs.{formatCurrency(displayData.changeAmount)}</span>
//             </div>
//           )}
//           {displayData.paymentMethod && (
//             <div className="flex justify-between">
//               <span>Payment Method:</span>
//               <span>{displayData.paymentMethod}</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );

//   const renderMinimalTemplate = () => (
//     <div className="space-y-3">
//       {/* Minimal header */}
//       <div className="text-center">
//         <h2 className="text-xl font-bold">{companyDetails.name}</h2>
//       </div>

//       {/* Invoice info */}
//       <div className="text-center text-sm">
//         <p>Invoice: {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//         <p>Date: {scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}</p>
//       </div>

//       {/* Compact items */}
//       <div className="space-y-2">
//         {displayData.items && displayData.items.map((item, index) => {
//           const discountedPrice = getDiscountedPrice(item);
//           const itemTotal = getItemTotal(item);
//           return (
//             <div key={index} className="flex justify-between text-sm">
//               <span>{item.name} x {item.quantity}</span>
//               <span>Rs.{formatCurrency(itemTotal)}</span>
//             </div>
//           );
//         })}
//       </div>

//       <div className="border-t pt-2 space-y-1">
//         <div className="flex justify-between font-bold">
//           <span>TOTAL:</span>
//           <span>Rs.{formatCurrency(displayData.total)}</span>
//         </div>
//       </div>
//     </div>
//   );

//   const renderProfessionalTemplate = () => (
//     <div className="space-y-4">
//       {/* Professional header with border */}
//       <div className="border-2 border-gray-300 p-4 text-center">
//         {companyDetails.logo && currentTemplate.fields.showLogo && (
//           <img 
//             src={companyDetails.logo} 
//             alt="Company Logo" 
//             className="h-16 mx-auto mb-2"
//             onError={(e) => {
//               e.target.style.display = 'none';
//             }}
//           />
//         )}
//         <h2 className="text-2xl font-bold">{companyDetails.name}</h2>
//         <p className="text-sm">{companyDetails.address}</p>
//         <p className="text-sm">Tax: {companyDetails.taxNumber}</p>
//       </div>

//       {/* Invoice details in table format */}
//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div>
//           <p><strong>Invoice #:</strong> {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//           <p><strong>Date:</strong> {invoiceDate} {invoiceTime}</p>
//         </div>
//         <div className="text-right">
//           <p><strong>Customer:</strong> Walk-in</p>
//           <p><strong>Cashier:</strong> Admin</p>
//         </div>
//       </div>

//       {/* Professional items table */}
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b-2 border-gray-300">
//             <th className="text-left pb-2">Item</th>
//             <th className="text-center pb-2">Qty</th>
//             <th className="text-right pb-2">Price</th>
//             <th className="text-right pb-2">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           {displayData.items && displayData.items.map((item, index) => {
//             const discountedPrice = getDiscountedPrice(item);
//             const itemTotal = getItemTotal(item);
//             return (
//               <tr key={index} className="border-b border-gray-100">
//                 <td className="py-2">{item.name}</td>
//                 <td className="text-center py-2">{item.quantity}</td>
//                 <td className="text-right py-2">Rs.{formatCurrency(discountedPrice)}</td>
//                 <td className="text-right py-2">Rs.{formatCurrency(itemTotal)}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {/* Detailed totals */}
//       <div className="space-y-1 text-sm">
//         <div className="flex justify-between">
//           <span>Subtotal:</span>
//           <span>Rs.{formatCurrency(subtotal)}</span>
//         </div>
//         <div className="flex justify-between text-red-500">
//           <span>Product Discounts:</span>
//           <span>-Rs.{formatCurrency(totalProductDiscount)}</span>
//         </div>
//         {/* REMOVED CART DISCOUNT DISPLAY */}
//         <div className="flex justify-between font-bold text-lg border-t pt-2">
//           <span>Total:</span>
//           <span>Rs.{formatCurrency(total)}</span>
//         </div>
//       </div>

//       {/* Professional footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className="border-t-2 border-gray-300 pt-3 text-center text-xs">
//           <p>{companyDetails.footerText}</p>
//           <p className="text-gray-500">{companyDetails.termsAndConditions}</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderDefaultTemplate = () => (
//     <div className="space-y-4">
//       {/* Header */}
//       {currentTemplate.fields.showHeader && (
//         <div className="text-center border-b pb-4">
//           {companyDetails.logo && currentTemplate.fields.showLogo && (
//             <img 
//               src={companyDetails.logo} 
//               alt="Company Logo" 
//               className="h-16 mx-auto mb-2"
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <h2 className="text-3xl font-extrabold text-green-500 tracking-wide">
//             {companyDetails.name || 'Your Company Name'}
//           </h2>
//           <p className="text-sm text-gray-400">{companyDetails.phone || ''}</p>
//           <p className="text-sm text-gray-400">{companyDetails.address || ''}</p>
//         </div>
//       )}

//       {/* Invoice info */}
//       <div className="flex justify-between text-sm mb-4">
//         <div className="text-right">
//           <p className="font-semibold">Invoice #: {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//           <p>{scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}</p>
//         </div>
//         <div className="text-right">
//           <p>Customer: Walk-in</p>
//           <p>Cashier: Admin</p>
//         </div>
//       </div>

//       {/* Items table */}
//       <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//         <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-700 text-xs font-bold px-3 py-2">
//           <div className="col-span-2">Item</div>
//           <div>Qty</div>
//           <div>Price</div>
//           <div>Total</div>
//         </div>
//         {renderItemsTable()}
//       </div>

//       {/* Totals */}
//       <div className="space-y-1 text-sm mt-4">
//         <div className="flex justify-between">
//           <span>Subtotal:</span>
//           <span>Rs.{formatCurrency(subtotal)}</span>
//         </div>
//         {currentTemplate.fields.showDiscountBreakdown && (
//           <div className="flex justify-between text-red-500">
//             <span>Product Discounts:</span>
//             <span>-Rs.{formatCurrency(totalProductDiscount)}</span>
//           </div>
//         )}
//         {/* REMOVED CART DISCOUNT DISPLAY */}
//         <div className="flex justify-between font-bold text-green-600 text-lg mt-2 border-t pt-2">
//           <span>Total:</span>
//           <span>Rs.{formatCurrency(total)}</span>
//         </div>

//         {/* Payment Info */}
//         {((displayData.paidAmount > 0) || (displayData.changeAmount > 0) || displayData.paymentMethod) && (
//           <div className="mt-2 border-t pt-2 space-y-1">
//             {displayData.paidAmount > 0 && (
//               <div className="flex justify-between">
//                 <span>Paid:</span>
//                 <span>Rs.{formatCurrency(displayData.paidAmount)}</span>
//               </div>
//             )}
//             {displayData.changeAmount > 0 && (
//               <div className="flex justify-between">
//                 <span>Change:</span>
//                 <span>Rs.{formatCurrency(displayData.changeAmount)}</span>
//               </div>
//             )}
//             {displayData.paymentMethod && (
//               <div className="flex justify-between">
//                 <span>Payment Method:</span>
//                 <span>{displayData.paymentMethod}</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className="text-center border-t mt-6 pt-3 text-xs text-gray-500">
//           <p className="font-semibold">★ {companyDetails.footerText || "Thank you for your business"} ★</p>
//           <p>Please visit again!</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderItemsTable = () => {
//     if (!displayData.items || displayData.items.length === 0) {
//       return <p className="text-center py-4 text-gray-400">No items</p>;
//     }

//     return displayData.items.map((item) => {
//       const discountedPrice = getDiscountedPrice(item);
//       const itemTotal = getItemTotal(item);

//       return (
//         <div
//           key={item.id}
//           className="grid grid-cols-5 px-3 py-2 text-sm border-b dark:border-gray-700"
//         >
//           <div className="col-span-2">{item.name}</div>
//           <div>{item.quantity}</div>
//           <div>
//             <div className="text-gray-400 line-through text-xs">
//               Rs.{formatCurrency(item.price)}
//             </div>
//             <div className="text-green-600 font-semibold">
//               Rs.{formatCurrency(discountedPrice)}
//             </div>
//           </div>
//           <div className="font-semibold">Rs.{formatCurrency(itemTotal)}</div>
//         </div>
//       );
//     });
//   };

//   return (
//     <Modal size="lg">
//       <div
//         className={`p-6 rounded-xl shadow-lg ${
//           darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
//         }`}
//       >
//         {/* Header with buttons at top right */}
//         <div className="flex justify-between items-start mb-4">
//           <div className="text-center">
//             <p className="text-sm text-gray-500 mb-1">Active Template: {currentTemplate.name}</p>
//           </div>

//           {/* Buttons at top right */}
//           <div className="flex gap-2">
//             <button
//               onClick={handleScanModeToggle}
//               className={`py-2 px-4 font-semibold rounded-lg shadow ${
//                 scanMode 
//                   ? "bg-red-500 text-white hover:bg-red-600" 
//                   : "bg-blue-500 text-white hover:bg-blue-600"
//               }`}
//             >
//               {scanMode ? "Cancel Scan" : "Scan Invoice"}
//             </button>

//             {/* Separate Cash Drawer Button */}
//             <button
//               onClick={handleOpenCashDrawer}
//               disabled={isOpeningDrawer}
//               className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
//             >
//               {isOpeningDrawer ? "Opening..." : "Open Drawer"}
//             </button>

//             {/* Print Button - Now includes cash drawer opening */}
//             <button
//               onClick={handlePrint}
//               disabled={isPrinting}
//               className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 disabled:opacity-50"
//             >
//               {isPrinting ? "Printing..." : "Print"}
//             </button>

//             <button
//               onClick={handleClose}
//               className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>

//         {/* Barcode scanner input */}
//         {scanMode && (
//           <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
//             <label className="block text-sm font-bold mb-2">
//               Scan Barcode or Enter Invoice Number:
//             </label>
//             <input
//               ref={barcodeInputRef}
//               type="text"
//               value={barcodeInput}
//               onChange={handleBarcodeInput}
//               className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
//               placeholder="Scan barcode or enter invoice number"
//               autoFocus
//             />
//             <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
//               Point your barcode scanner at this field and scan the invoice barcode.
//             </p>
//           </div>
//         )}

//         {/* Render selected invoice template */}
//         {renderInvoiceTemplate()}

//         {/* Barcode */}
//         {currentTemplate.fields.showBarcode && (
//           <div className="mt-6 flex justify-center">
//             <Barcode
//               value={scannedInvoice ? barcodeInput : invoiceNumber}
//               format="CODE128"
//               width={1.5}
//               height={40}
//               displayValue={true}
//               background={darkMode ? "#1F2937" : "#FFFFFF"}
//               lineColor={darkMode ? "#FFFFFF" : "#000000"}
//             />
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default InvoiceModal;




















// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { closeModal } from "../../actions/modalActions";
// import { clearCart } from "../../actions/POS/cartActions";
// import { getInvoiceDetails,getInvoiceImage } from "../../actions/POS/invoiceActions";
// import Modal from "../common/Modal";
// import qz from "qz-tray";
// import Barcode from "react-barcode"; 
// import { fetchProducts } from "../../actions/POS/productAction";
// import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";
// import ledDisplayService from "../../services/ledDisplayService";

// const PRINTER_NAME = "BIXOLON SRP-E302";


// const CASH_DRAWER_COMMANDS = {
//   // ESC/POS commands for cash drawer
//   OPEN_DRAWER_PIN2: "\x1B\x70\x00\x19\xFA",
//   OPEN_DRAWER_PIN5: "\x1B\x70\x01\x19\xFA",
//   ALTERNATE_1: "\x1B\x70\x00\x60\x60",
//   ALTERNATE_2: "\x1B\x70\x01\x60\x60",
//   BELL_COMMAND: "\x07",
// };

// const getCurrentDateString = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   return `${year}${month}${day}`;
// };

// const getNextInvoiceNumber = () => {
//   const today = getCurrentDateString();
//   const lastInvoice = localStorage.getItem('lastInvoice');
//   if (lastInvoice) {
//     const lastDate = lastInvoice.substring(0, 8);
//     const lastNumber = lastInvoice.substring(8);
//     if (lastDate === today) {
//       const nextNum = String(parseInt(lastNumber) + 1).padStart(4, '0');
//       return `${today}${nextNum}`;
//     }
//   }
//   return `${today}0000`;
// };

// const storeInvoiceNumber = (invoiceNumber) => {
//   localStorage.setItem('lastInvoice', invoiceNumber);
// };

// const getInvoiceData = (invoiceNumber) => {
//   const sampleInvoices = {
//     "202405150000": {
//       items: [
//         { id: 1, name: "Product A", price: 100, quantity: 2 },
//         { id: 2, name: "Product B", price: 50, quantity: 1 }
//       ],
//       subtotal: 250,
//       total: 225,
//       paymentMethod: "Cash",
//       paidAmount: 300,
//       changeAmount: 75,
//       date: "2024-05-15",
//       time: "10:30 AM"
//     },
//     "202405150001": {
//       items: [
//         { id: 3, name: "Product C", price: 75, quantity: 3 },
//         { id: 4, name: "Product D", price: 120, quantity: 1 }
//       ],
//       subtotal: 345,
//       total: 345,
//       paymentMethod: "Card",
//       paidAmount: 400,
//       changeAmount: 55,
//       date: "2024-05-15",
//       time: "02:15 PM"
//     }
//   };

//   return sampleInvoices[invoiceNumber] || null;
// };

// const formatCurrency = (value) => {
//   return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// };

// // Product-specific discount calculations
// const getProductDiscount = (item) => {
//   if (item.discountType === 'Percentage') {
//     return (item.price * item.discountValue) / 100;
//   } else if (item.discountType === 'Value') {
//     return item.discountValue;
//   }
//   return 0; // No discount
// };

// const getDiscountedPrice = (item) => {
//   return item.discountedPrice || item.price;
// };

// const getItemTotal = (item) => {
//   const discountedPrice = getDiscountedPrice(item);
//   return discountedPrice * item.quantity;
// };

// const getItemDiscountAmount = (item) => {
//   const discountAmount = getProductDiscount(item);
//   return discountAmount * item.quantity;
// };

// const getItemDiscountPercentage = (item) => {
//   if (item.discountType === 'Percentage') {
//     return item.discountValue;
//   } else if (item.discountType === 'Value' && item.price > 0) {
//     return ((item.discountValue / item.price) * 100).toFixed(1);
//   }
//   return 0;
// };

// // Function to convert image to thermal printer compatible format
// const convertImageForThermalPrint = async (imageUrl) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous";
//     img.onload = function() {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       // Set canvas size for thermal printer (max 384 pixels width for most thermal printers)
//       const maxWidth = 384;
//       const scaleFactor = maxWidth / img.width;
//       canvas.width = maxWidth;
//       canvas.height = img.height * scaleFactor;

//       // Draw image on canvas
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       // Get image data and convert to black and white for thermal printing
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const data = imageData.data;

//       // Convert to 1-bit monochrome (black and white)
//       for (let i = 0; i < data.length; i += 4) {
//         const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
//         // Use threshold to convert to black or white
//         const value = brightness > 128 ? 255 : 0;
//         data[i] = value;     // red
//         data[i + 1] = value; // green
//         data[i + 2] = value; // blue
//         // alpha remains the same
//       }

//       ctx.putImageData(imageData, 0, 0);

//       // Convert to base64 for printing
//       const processedImageData = canvas.toDataURL('image/png');
//       resolve(processedImageData);
//     };

//     img.onerror = function() {
//       reject(new Error('Failed to load image'));
//     };

//     img.src = imageUrl;
//   });
// };

// const InvoiceModal = () => {
//   const dispatch = useDispatch();
//   const { darkMode } = useSelector(state => state.ui);
//   const { modalProps } = useSelector((state) => state.ui);
//   const { items: cartItems, tabs, activeTabId } = useSelector((state) => state.cart);
//   const { invoiceDetails } = useSelector((state) => state.invoice);

//   const [invoiceSettings, setInvoiceSettings] = useState({
//     templates: [],
//     selectedTemplate: 'retail',
//     companyDetails: {}
//   });

//   const [invoiceNumber, setInvoiceNumber] = useState("");
//   const [scanMode, setScanMode] = useState(false);
//   const [scannedInvoice, setScannedInvoice] = useState(null);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [isPrinting, setIsPrinting] = useState(false);
//   const [isOpeningDrawer, setIsOpeningDrawer] = useState(false);
//   const [printableImage, setPrintableImage] = useState(null);
//   const barcodeInputRef = useRef(null);

//   const apiImageUrl = invoiceDetails?.ResultSet?.[0]?.IMAGEURL;
//   const { imageData: authenticatedLogo } = useAuthenticatedImage(apiImageUrl);

//   // Define companyDetails here to avoid initialization issues
//   const companyDetails = invoiceSettings.companyDetails || {};

//   useEffect(() => {
//     const loadInvoiceSettings = () => {
//       try {
//         const savedSettings = localStorage.getItem('invoiceSettings');
//         if (savedSettings) {
//           const parsedSettings = JSON.parse(savedSettings);
//           setInvoiceSettings(parsedSettings);
//         } else {
//           setInvoiceSettings({
//             templates: [
//               {
//                 id: 'retail',
//                 name: 'Retail Template',
//                 description: 'Modern retail invoice design',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'vertical',
//                   showSaving: true
//                 }
//               },
//               {
//                 id: 'default',
//                 name: 'Default Template',
//                 description: 'Standard invoice layout',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'vertical',
//                   showSaving: false
//                 }
//               },
//               {
//                 id: 'minimal',
//                 name: 'Minimal Template',
//                 description: 'Clean and simple design',
//                 fields: {
//                   showLogo: false,
//                   showHeader: true,
//                   showFooter: false,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: false,
//                   layout: 'compact',
//                   showSaving: false
//                 }
//               },
//               {
//                 id: 'professional',
//                 name: 'Professional Template',
//                 description: 'Formal business style',
//                 fields: {
//                   showLogo: true,
//                   showHeader: true,
//                   showFooter: true,
//                   showBarcode: true,
//                   showTaxDetails: false,
//                   showDiscountBreakdown: true,
//                   layout: 'detailed',
//                   showSaving: false
//                 }
//               }
//             ],
//             selectedTemplate: 'retail',
//             companyDetails: {
//               name: 'DCSICN CLUB',
//               phone: '070 - 731 4445',
//               address: 'No. 316/7, Thalangama North, Battaramulla.',
//               email: '',
//               website: '',
//               taxNumber: '',
//               logo: '',
//               footerText: 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
//               termsAndConditions: 'Goods sold are not returnable. Warranty as per manufacturer terms.'
//             }
//           });
//         }
//       } catch (error) {
//         console.error('Error loading invoice settings:', error);
//       }
//     };

//     loadInvoiceSettings();
//     dispatch(getInvoiceDetails());
//   }, [dispatch]);

//   useEffect(() => {
//     dispatch(getInvoiceImage());
//   }, [dispatch]);

//   useEffect(() => {
//     if (invoiceDetails && invoiceDetails.ResultSet && invoiceDetails.ResultSet.length > 0) {
//       const apiData = invoiceDetails.ResultSet[0];
//       setInvoiceSettings(prev => ({
//         ...prev,
//         companyDetails: {
//           name: apiData.p_company_name || 'DCSICN CLUB',
//           phone: apiData.p_phone_number || '070 - 731 4445',
//           address: apiData.p_address || 'No. 316/7, Thalangama North, Battaramulla.',
//           email: apiData.p_email || '',
//           website: apiData.p_website || '',
//           taxNumber: apiData.p_tax_number || '',
//           logo: authenticatedLogo || apiData.IMAGEURL || '',
//           footerText: apiData.p_footer_text || 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
//           termsAndConditions: apiData.p_terms_conditions || 'Goods sold are not returnable. Warranty as per manufacturer terms.'
//         }
//       }));
//     }
//   }, [invoiceDetails, authenticatedLogo]);

//   // Prepare printable image when logo is available
//   useEffect(() => {
//     const preparePrintableImage = async () => {
//       const currentCompanyDetails = invoiceSettings.companyDetails || {};
//       if (currentCompanyDetails.logo) {
//         try {
//           const processedImage = await convertImageForThermalPrint(currentCompanyDetails.logo);
//           setPrintableImage(processedImage);
//         } catch (error) {
//           console.error('Error preparing image for printing:', error);
//           setPrintableImage(null);
//         }
//       } else {
//         setPrintableImage(null);
//       }
//     };

//     preparePrintableImage();
//   }, [invoiceSettings.companyDetails]);

//   const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
//   const { items: activeTabItems, discount: cartDiscount = 0 } = activeTab; 
//   const items = activeTabItems || cartItems || [];

//   const {
//     subtotal: propSubtotal = 0,
//     total: propTotal = 0,
//     paymentMethod = "",
//     paidAmount = 0,
//     changeAmount = 0,  
//     discount: propDiscount = 0,  
//     cartDiscount: propCartDiscount = 0,  
//     totalProductDiscount: propTotalProductDiscount = 0, 
//   } = modalProps || {};

//   const calculateAmounts = () => {
//     const itemTotals = items.map(item => getItemTotal(item));
//     const subtotal = itemTotals.reduce((sum, total) => sum + total, 0);

//     const totalProductDiscount = items.reduce(
//       (sum, item) => sum + getItemDiscountAmount(item),
//       0
//     );

//     const additionalCartDiscount = cartDiscount || 0;

//     const total = subtotal - additionalCartDiscount;

//     return {
//       subtotal,
//      totalProductDiscount: propTotalProductDiscount || totalProductDiscount,
//       additionalCartDiscount,
//       total
//     };
//   };

//   const {
//     subtotal,
//    totalProductDiscount,
//     additionalCartDiscount,
//     total
//   } = calculateAmounts();

//   const invoiceDate = new Date().toLocaleDateString();
//   const invoiceTime = new Date().toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const formattedInvoiceNumber = invoiceNumber || "";

//   useEffect(() => {
//     const newInvoiceNumber = getNextInvoiceNumber();
//     setInvoiceNumber(newInvoiceNumber);
//   }, []);

//   useEffect(() => {
//     if (scanMode && barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//   }, [scanMode]);

//   useEffect(() => {
//     if (barcodeInput.length >= 12) {
//       const invoiceData = getInvoiceData(barcodeInput);
//       if (invoiceData) {
//         setScannedInvoice(invoiceData);
//         setScanMode(false);
//       } else {
//         alert("Invoice not found!");
//         setBarcodeInput("");
//       }
//     }
//   }, [barcodeInput]);

//   // LED Display Effect - Show change amount when payment is cash and there's change
//   useEffect(() => {
//     const updateLEDForChange = async () => {
//       if (paymentMethod === "Cash" && changeAmount > 0) {
//         try {
//           // Display change amount on LED panel
//           await ledDisplayService.displayNumber(changeAmount);
//           console.log(`LED display showing change amount: ${changeAmount}`);
//         } catch (error) {
//           console.error('Error updating LED display with change amount:', error);
//         }
//       }
//     };

//     updateLEDForChange();
//   }, [paymentMethod, changeAmount]);

//   const currentTemplate = invoiceSettings.templates?.find(
//     t => t.id === invoiceSettings.selectedTemplate
//   ) || { fields: {} };

//   const esc = "\x1B";
//   const gs = "\x1D";
//   const LINE_WIDTH = 42;

//   const leftRight = (left, right, width = LINE_WIDTH) => {
//     const space = width - (left.length + right.length);
//     return left + " ".repeat(space > 0 ? space : 1) + right;
//   };

//   const divider = (char = "-") => char.repeat(LINE_WIDTH) + "\n";

//   const generateBarcodeCommands = (data) => {
//     return [
//       gs + "H" + "\x02",
//       gs + "w" + "\x02",
//       gs + "h" + "\x35",
//       gs + "k" + "\x04" + data + "\x00",
//       "\n",
//     ];
//   };

//   // Enhanced Cash Drawer Function
//   const openCashDrawer = async () => {
//     try {

//       if (!qz.websocket.isActive()) {
//         await qz.websocket.connect();
//       }

//       const config = qz.configs.create(PRINTER_NAME);

//       // Try different cash drawer commands in sequence
//       const commands = [
//         CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN2,
//         CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN5,
//         CASH_DRAWER_COMMANDS.ALTERNATE_1,
//         CASH_DRAWER_COMMANDS.ALTERNATE_2,
//         CASH_DRAWER_COMMANDS.BELL_COMMAND
//       ];

//       let drawerOpened = false;
//       let lastError = null;

//       for (const command of commands) {
//         try {
//           await qz.print(config, [{ type: "raw", format: "command", data: command }]);
//           drawerOpened = true;
//           break;
//         } catch (error) {
//           console.warn(`Cash drawer command failed: ${error.message}`);
//           lastError = error;
//           // Continue to next command
//         }
//       }

//       if (!drawerOpened) {
//         console.error("All cash drawer commands failed", lastError);
//         throw new Error(`Cash drawer failed to open: ${lastError?.message || 'Unknown error'}`);
//       }

//       return drawerOpened;
//     } catch (error) {
//       console.error("Cash drawer error:", error);
//       throw error;
//     }
//   };

//   // Enhanced Print function with cash drawer and image printing - UPDATED TO REMOVE CART DISCOUNT
//   const handlePrint = async () => {
//     if (isPrinting) return;

//     setIsPrinting(true);
//     localStorage.removeItem("saleId");
//     localStorage.removeItem("invoiceNumber");
//     dispatch(fetchProducts());

//     try {
//       // Connect to printer first
//       if (!qz.websocket.isActive()) {
//         await qz.websocket.connect();
//       }
//       const config = qz.configs.create(PRINTER_NAME);

//       // Create print data with enhanced formatting
//       const lines = [
//         esc + "@", // Initialize printer

//         // Print company logo if available
//         ...(printableImage ? [
//           esc + "a" + "\x01", // Center align
//           "[" + (companyDetails.name || "DCSICN CLUB") + " LOGO]\n",
//           esc + "a" + "\x00", // Left align
//           "\n"
//         ] : []),

//         // Company header - Big and Bold
//         esc + "!" + "\x38", // Select double height and emphasized printing
//         esc + "a" + "\x01", // Center align
//         "★ " + (companyDetails.name || "DCSICN CLUB") + " ★\n",
//         esc + "!" + "\x00", // Cancel text formatting
//         esc + "a" + "\x00", // Left align

//         // Company details
//         esc + "!" + "\x08", // Select emphasized printing
//         (companyDetails.phone || "070 - 731 4445") + "\n",
//         (companyDetails.address || "No. 316/7, Thalangama North, Battaramulla.") + "\n",
//         esc + "!" + "\x00", // Cancel text formatting

//         divider("="),

//         // Invoice info
//         leftRight("Invoice:", formattedInvoiceNumber) + "\n",
//         leftRight("Date:", `${invoiceDate} ${invoiceTime}`) + "\n",
//         divider("-"),

//         // Items header
//         esc + "!" + "\x08", // Emphasized
//         leftRight("Item", "Qty  Price   Total") + "\n",
//         esc + "!" + "\x00", // Cancel emphasis
//         divider("-"),

//         // Items list
//         ...items.map((item) => {
//           const discountedPrice = getDiscountedPrice(item);
//           const itemTotal = getItemTotal(item);
//           const saving = getItemDiscountAmount(item);

//           const line1 = item.name.length > 28 ? item.name.slice(0, 28) : item.name;
//           const line2 = leftRight(
//             " ".repeat(2) + `${item.quantity} x ${discountedPrice.toFixed(2)}`,
//             itemTotal.toFixed(2)
//           );
//           const line3 = leftRight(
//             " ".repeat(2) + `Saving: -${saving.toFixed(2)}`,
//             ""
//           );

//           return line1 + "\n" + line2 + "\n" + line3 + "\n";
//         }),

//         divider("-"),
//         leftRight("Subtotal", "" + subtotal.toFixed(2)) + "\n",

//         // REMOVED CART DISCOUNT DISPLAY
//         leftRight("Product Discount", "(" + totalProductDiscount.toFixed(2) + ")" ) + "\n",
//         additionalCartDiscount > 0 ? leftRight("Additional Discount", "(" + additionalCartDiscount.toFixed(2) + ")") + "\n" : "",
//         divider("="),
//         esc + "!" + "\x38", // Double height and emphasized
//         leftRight("TOTAL", "" + total.toFixed(2)) + "\n",
//         esc + "!" + "\x00", // Cancel text formatting
//         divider("="),

//         // Payment information
//         paidAmount > 0 ? leftRight("Paid", "" + paidAmount.toFixed(2)) + "\n" : "",
//         changeAmount > 0
//           ? leftRight("Change", "" + changeAmount.toFixed(2)) + "\n"
//           : "",
//         paymentMethod ? leftRight("Payment", paymentMethod) + "\n" : "",
//         divider("-"),

//         // Retail template footer
//         esc + "a" + "\x01", // Center align
//         esc + "!" + "\x08", // Emphasized
//         "★ THANK YOU ★\n",
//         esc + "!" + "\x00", // Cancel emphasis
//         "\n",
//         (companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.") + "\n",
//         "\n",

//         // Barcode
//         ...generateBarcodeCommands(invoiceNumber),

//         "\n\n",
//         gs + "V" + "\x41" + "\x03",  
//       ];

//       const printData = lines.join("");

//       await qz.print(config, [{ type: "raw", format: "command", data: printData }]);

//       await openCashDrawer();

//       storeInvoiceNumber(invoiceNumber);

//       // CLEAR LED DISPLAY AFTER SUCCESSFUL PRINTING
//       try {
//         await ledDisplayService.clearAndResetDisplay();
//         console.log('LED display cleared after printing');
//       } catch (error) {
//         console.error('Error clearing LED display after printing:', error);
//       }

//       handleClose();
//     } catch (err) {
//       console.error("Print process failed:", err);
//       alert("Print error: " + err.message);
//     } finally {
//       setIsPrinting(false);
//     }
//   };

//   // Separate function to just open cash drawer
//   const handleOpenCashDrawer = async () => {
//     if (isOpeningDrawer) return;

//     setIsOpeningDrawer(true);
//     try {
//       await openCashDrawer();
//       alert("Cash drawer opened successfully!");
//     } catch (error) {
//       console.error("Cash drawer error:", error);
//       alert("Error opening cash drawer: " + error.message);
//     } finally {
//       setIsOpeningDrawer(false);
//     }
//   };

//   useEffect(() => {
//     // First, try to get invoice number from localStorage (from API)
//     const savedInvoiceNumber = localStorage.getItem("invoiceNumber");

//     if (savedInvoiceNumber) { 
//       setInvoiceNumber(savedInvoiceNumber);
//     } else { 
//       const newInvoiceNumber = getNextInvoiceNumber();
//       setInvoiceNumber(newInvoiceNumber);
//     }
//   }, []);

//   const formatInvoiceNumber = (invNum) => {
//     if (!invNum) return "";
//     return invNum.toString();
//   };

//   const handleClose = () => {
//     localStorage.removeItem("saleId");
//     dispatch(closeModal());
//     dispatch(clearCart());
//     dispatch(fetchProducts());
//     localStorage.removeItem("invoiceNumber");

//     // CLEAR LED DISPLAY WHEN MODAL CLOSES
//     const clearLED = async () => {
//       try {
//         await ledDisplayService.clearAndResetDisplay();
//         console.log('LED display cleared when modal closed');
//       } catch (error) {
//         console.error('Error clearing LED display on modal close:', error);
//       }
//     };

//     clearLED();
//   };

//   const handleScanModeToggle = () => {
//     setScanMode(!scanMode);
//     setBarcodeInput("");
//     setScannedInvoice(null);
//   };

//   const handleBarcodeInput = (e) => {
//     setBarcodeInput(e.target.value);
//   };

//   const displayData = scannedInvoice || {
//     items,
//     subtotal,
//     total,
//     paymentMethod,
//     paidAmount,
//     changeAmount,
//     date: invoiceDate,
//     time: invoiceTime
//   };

//   const renderInvoiceTemplate = () => {
//     const templateId = invoiceSettings.selectedTemplate || 'retail';

//     switch (templateId) {
//       case 'retail':
//         return renderRetailTemplate();
//       case 'minimal':
//         return renderMinimalTemplate();
//       case 'professional':
//         return renderProfessionalTemplate();
//       default:
//         return renderDefaultTemplate();
//     }
//   };

//   const renderRetailTemplate = () => (
//     <div className="space-y-4">
//       {/* Retail Header */}
//       {currentTemplate.fields.showHeader && (
//         <div className={`text-center border-b-2 pb-4 ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
//           {companyDetails.logo && currentTemplate.fields.showLogo && (
//             <img 
//               src={companyDetails.logo} 
//               alt="Company Logo" 
//               className="h-16 mx-auto mb-2"
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             ★ {companyDetails.name || 'DCSICN CLUB'} ★
//           </h2>
//           <p className="text-sm font-semibold text-gray-600">{companyDetails.phone || '070 - 731 4445'}</p>
//           <p className="text-xs text-gray-500">{companyDetails.address || 'No. 316/7, Thalangama North, Battaramulla.'}</p>
//         </div>
//       )}

//       {/* Invoice Info */}
//       <div className={`p-3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
//         <div className="flex justify-between text-sm">
//           <div>
//             <span className="font-semibold">Invoice #: </span>
//             {scannedInvoice ? barcodeInput : formattedInvoiceNumber}
//           </div>
//           <div>
//             <span className="font-semibold">Date: </span>
//             {scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}
//           </div>
//         </div>
//       </div>

//       {/* Items Table */}
//       <div className={`border rounded-lg overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
//         <div
//           className={`grid grid-cols-5 text-xs font-bold px-3 py-2 border-b
//             ${darkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}
//         >
//           <div className="col-span-3">Item</div>
//           <div className="text-center">Qty</div>
//           <div className="text-right">Total</div>
//         </div>
//         {renderRetailItemsTable()}
//       </div>

//       {/* Totals */}
//       {renderRetailTotalsSection()}

//       {/* Footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className={`text-center border-t-2 pt-4 text-xs ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-600"}`}>
//           <p className="font-semibold mb-2">★ THANK YOU ★</p>
//           <p className="leading-relaxed">{companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days."}</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderRetailItemsTable = () => {
//     if (!displayData.items || displayData.items.length === 0) {
//       return <p className="text-center py-4 text-gray-400">No items</p>;
//     }

//     return displayData.items.map((item) => {
//       const discountedPrice = getDiscountedPrice(item);
//       const itemTotal = getItemTotal(item);
//       const saving = getItemDiscountAmount(item);

//       return (
//         <div key={item.id} className="border-b border-gray-100">
//           <div className="grid grid-cols-5 px-3 py-2 text-sm">
//             <div className="col-span-3 font-medium">{item.name}</div>
//             <div className="text-center">{item.quantity}</div>
//             <div className="text-right font-semibold">{formatCurrency(itemTotal)}</div>
//           </div>
//           <div className="grid grid-cols-5 px-3 pb-2 text-xs text-gray-500">
//             <div className="col-span-3">
//               {item.quantity} x {formatCurrency(discountedPrice)}
//               <span className="text-red-500 ml-2">
//                 (Saving: ({formatCurrency(saving)}))
//               </span>
//             </div>
//             <div className="col-span-2 text-right line-through text-gray-400">
//               {formatCurrency(item.price * item.quantity)}
//             </div>
//           </div>
//         </div>
//       );
//     });
//   };

//   const renderRetailTotalsSection = () => (
//     <div className="space-y-2 text-sm">
//       <div className="flex justify-between border-b pb-1">
//         <span>Subtotal:</span>
//         <span>{formatCurrency(subtotal)}</span>
//       </div>

//       {currentTemplate.fields.showDiscountBreakdown && (
//         <div className="flex justify-between text-red-500 border-b pb-1">
//           <span>Product Discounts:</span>
//           <span>({formatCurrency(totalProductDiscount)})</span>
//         </div>
//       )}

//           {additionalCartDiscount > 0 && (
//         <div className="flex justify-between text-red-500">
//           <span>Additional Discount:</span>
//           <span>({formatCurrency(additionalCartDiscount)})</span>
//         </div>
//       )}

//       <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2">
//         <span>TOTAL:</span>
//         <span>{formatCurrency(total)}</span>
//       </div>

//       {/* Payment Info */}
//       {((displayData.paidAmount > 0) || (displayData.changeAmount > 0) || displayData.paymentMethod) && (
//         <div
//           className={`mt-3 border-t pt-2 space-y-1 p-2 rounded 
//             ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"}`}
//         >
//           {displayData.paidAmount > 0 && (
//             <div className="flex justify-between">
//               <span>Paid:</span>
//               <span>{formatCurrency(displayData.paidAmount)}</span>
//             </div>
//           )}
//           {displayData.changeAmount > 0 && (
//             <div className="flex justify-between">
//               <span>Change:</span>
//               <span>{formatCurrency(displayData.changeAmount)}</span>
//             </div>
//           )}
//           {displayData.paymentMethod && (
//             <div className="flex justify-between">
//               <span>Payment Method:</span>
//               <span>{displayData.paymentMethod}</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );

//   const renderMinimalTemplate = () => (
//     <div className="space-y-3">
//       {/* Minimal header */}
//       <div className="text-center">
//         <h2 className="text-xl font-bold">{companyDetails.name}</h2>
//       </div>

//       {/* Invoice info */}
//       <div className="text-center text-sm">
//         <p>Invoice: {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//         <p>Date: {scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}</p>
//       </div>

//       {/* Compact items */}
//       <div className="space-y-2">
//         {displayData.items && displayData.items.map((item, index) => {
//           const discountedPrice = getDiscountedPrice(item);
//           const itemTotal = getItemTotal(item);
//           return (
//             <div key={index} className="flex justify-between text-sm">
//               <span>{item.name} x {item.quantity}</span>
//               <span>{formatCurrency(itemTotal)}</span>
//             </div>
//           );
//         })}
//       </div>

//       <div className="border-t pt-2 space-y-1">
//         <div className="flex justify-between font-bold">
//           <span>TOTAL:</span>
//           <span>{formatCurrency(displayData.total)}</span>
//         </div>
//       </div>
//     </div>
//   );

//   const renderProfessionalTemplate = () => (
//     <div className="space-y-4">
//       {/* Professional header with border */}
//       <div className="border-2 border-gray-300 p-4 text-center">
//         {companyDetails.logo && currentTemplate.fields.showLogo && (
//           <img 
//             src={companyDetails.logo} 
//             alt="Company Logo" 
//             className="h-16 mx-auto mb-2"
//             onError={(e) => {
//               e.target.style.display = 'none';
//             }}
//           />
//         )}
//         <h2 className="text-2xl font-bold">{companyDetails.name}</h2>
//         <p className="text-sm">{companyDetails.address}</p>
//         <p className="text-sm">Tax: {companyDetails.taxNumber}</p>
//       </div>

//       {/* Invoice details in table format */}
//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div>
//           <p><strong>Invoice #:</strong> {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//           <p><strong>Date:</strong> {invoiceDate} {invoiceTime}</p>
//         </div>
//         <div className="text-right">
//           <p><strong>Customer:</strong> Walk-in</p>
//           <p><strong>Cashier:</strong> Admin</p>
//         </div>
//       </div>

//       {/* Professional items table */}
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b-2 border-gray-300">
//             <th className="text-left pb-2">Item</th>
//             <th className="text-center pb-2">Qty</th>
//             <th className="text-right pb-2">Price</th>
//             <th className="text-right pb-2">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           {displayData.items && displayData.items.map((item, index) => {
//             const discountedPrice = getDiscountedPrice(item);
//             const itemTotal = getItemTotal(item);
//             return (
//               <tr key={index} className="border-b border-gray-100">
//                 <td className="py-2">{item.name}</td>
//                 <td className="text-center py-2">{item.quantity}</td>
//                 <td className="text-right py-2">{formatCurrency(discountedPrice)}</td>
//                 <td className="text-right py-2">{formatCurrency(itemTotal)}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       {/* Detailed totals */}
//       <div className="space-y-1 text-sm">
//         <div className="flex justify-between">
//           <span>Subtotal:</span>
//           <span>{formatCurrency(subtotal)}</span>
//         </div>
//         <div className="flex justify-between text-red-500">
//           <span>Product Discounts:</span>
//           <span>({formatCurrency(totalProductDiscount)})</span>
//         </div>
//         {/* REMOVED CART DISCOUNT DISPLAY */}
//         <div className="flex justify-between font-bold text-lg border-t pt-2">
//           <span>Total:</span>
//           <span>{formatCurrency(total)}</span>
//         </div>
//       </div>

//       {/* Professional footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className="border-t-2 border-gray-300 pt-3 text-center text-xs">
//           <p>{companyDetails.footerText}</p>
//           <p className="text-gray-500">{companyDetails.termsAndConditions}</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderDefaultTemplate = () => (
//     <div className="space-y-4">
//       {/* Header */}
//       {currentTemplate.fields.showHeader && (
//         <div className="text-center border-b pb-4">
//           {companyDetails.logo && currentTemplate.fields.showLogo && (
//             <img 
//               src={companyDetails.logo} 
//               alt="Company Logo" 
//               className="h-16 mx-auto mb-2"
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <h2 className="text-3xl font-extrabold text-green-500 tracking-wide">
//             {companyDetails.name || 'Your Company Name'}
//           </h2>
//           <p className="text-sm text-gray-400">{companyDetails.phone || ''}</p>
//           <p className="text-sm text-gray-400">{companyDetails.address || ''}</p>
//         </div>
//       )}

//       {/* Invoice info */}
//       <div className="flex justify-between text-sm mb-4">
//         <div className="text-right">
//           <p className="font-semibold">Invoice #: {scannedInvoice ? barcodeInput : formattedInvoiceNumber}</p>
//           <p>{scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}</p>
//         </div>
//         <div className="text-right">
//           <p>Customer: Walk-in</p>
//           <p>Cashier: Admin</p>
//         </div>
//       </div>

//       {/* Items table */}
//       <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
//         <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-700 text-xs font-bold px-3 py-2">
//           <div className="col-span-2">Item</div>
//           <div>Qty</div>
//           <div>Price</div>
//           <div>Total</div>
//         </div>
//         {renderItemsTable()}
//       </div>

//       {/* Totals */}
//       <div className="space-y-1 text-sm mt-4">
//         <div className="flex justify-between">
//           <span>Subtotal:</span>
//           <span>{formatCurrency(subtotal)}</span>
//         </div>
//         {currentTemplate.fields.showDiscountBreakdown && (
//           <div className="flex justify-between text-red-500">
//             <span>Product Discounts:</span>
//             <span>({formatCurrency(totalProductDiscount)})</span>
//           </div>
//         )}
//         {/* REMOVED CART DISCOUNT DISPLAY */}
//         <div className="flex justify-between font-bold text-green-600 text-lg mt-2 border-t pt-2">
//           <span>Total:</span>
//           <span>{formatCurrency(total)}</span>
//         </div>

//         {/* Payment Info */}
//         {((displayData.paidAmount > 0) || (displayData.changeAmount > 0) || displayData.paymentMethod) && (
//           <div className="mt-2 border-t pt-2 space-y-1">
//             {displayData.paidAmount > 0 && (
//               <div className="flex justify-between">
//                 <span>Paid:</span>
//                 <span>{formatCurrency(displayData.paidAmount)}</span>
//               </div>
//             )}
//             {displayData.changeAmount > 0 && (
//               <div className="flex justify-between">
//                 <span>Change:</span>
//                 <span>{formatCurrency(displayData.changeAmount)}</span>
//               </div>
//             )}
//             {displayData.paymentMethod && (
//               <div className="flex justify-between">
//                 <span>Payment Method:</span>
//                 <span>{displayData.paymentMethod}</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {currentTemplate.fields.showFooter && (
//         <div className="text-center border-t mt-6 pt-3 text-xs text-gray-500">
//           <p className="font-semibold">★ {companyDetails.footerText || "Thank you for your business"} ★</p>
//           <p>Please visit again!</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderItemsTable = () => {
//     if (!displayData.items || displayData.items.length === 0) {
//       return <p className="text-center py-4 text-gray-400">No items</p>;
//     }

//     return displayData.items.map((item) => {
//       const discountedPrice = getDiscountedPrice(item);
//       const itemTotal = getItemTotal(item);

//       return (
//         <div
//           key={item.id}
//           className="grid grid-cols-5 px-3 py-2 text-sm border-b dark:border-gray-700"
//         >
//           <div className="col-span-2">{item.name}</div>
//           <div>{item.quantity}</div>
//           <div>
//             <div className="text-gray-400 line-through text-xs">
//               {formatCurrency(item.price)}
//             </div>
//             <div className="text-green-600 font-semibold">
//               {formatCurrency(discountedPrice)}
//             </div>
//           </div>
//           <div className="font-semibold">{formatCurrency(itemTotal)}</div>
//         </div>
//       );
//     });
//   };

//   return (
//     <Modal size="lg">
//       <div
//         className={`p-6 rounded-xl shadow-lg ${
//           darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
//         }`}
//       >
//         {/* Header with buttons at top right */}
//         <div className="flex justify-between items-start mb-4">
//           <div className="text-center">
//             <p className="text-sm text-gray-500 mb-1">Active Template: {currentTemplate.name}</p>
//           </div>

//           {/* Buttons at top right */}
//           <div className="flex gap-2">
//             <button
//               onClick={handleScanModeToggle}
//               className={`py-2 px-4 font-semibold rounded-lg shadow ${
//                 scanMode 
//                   ? "bg-red-500 text-white hover:bg-red-600" 
//                   : "bg-blue-500 text-white hover:bg-blue-600"
//               }`}
//             >
//               {scanMode ? "Cancel Scan" : "Scan Invoice"}
//             </button>

//             {/* Separate Cash Drawer Button */}
//             <button
//               onClick={handleOpenCashDrawer}
//               disabled={isOpeningDrawer}
//               className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
//             >
//               {isOpeningDrawer ? "Opening..." : "Open Drawer"}
//             </button>

//             {/* Print Button - Now includes cash drawer opening */}
//             <button
//               onClick={handlePrint}
//               disabled={isPrinting}
//               className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 disabled:opacity-50"
//             >
//               {isPrinting ? "Printing..." : "Print"}
//             </button>

//             <button
//               onClick={handleClose}
//               className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>

//         {/* Barcode scanner input */}
//         {scanMode && (
//           <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
//             <label className="block text-sm font-bold mb-2">
//               Scan Barcode or Enter Invoice Number:
//             </label>
//             <input
//               ref={barcodeInputRef}
//               type="text"
//               value={barcodeInput}
//               onChange={handleBarcodeInput}
//               className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
//               placeholder="Scan barcode or enter invoice number"
//               autoFocus
//             />
//             <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
//               Point your barcode scanner at this field and scan the invoice barcode.
//             </p>
//           </div>
//         )}

//         {/* Render selected invoice template */}
//         {renderInvoiceTemplate()}

//         {/* Barcode */}
//         {currentTemplate.fields.showBarcode && (
//           <div className="mt-6 flex justify-center">
//             <Barcode
//               value={scannedInvoice ? barcodeInput : invoiceNumber}
//               format="CODE128"
//               width={1.5}
//               height={40}
//               displayValue={true}
//               background={darkMode ? "#1F2937" : "#FFFFFF"}
//               lineColor={darkMode ? "#FFFFFF" : "#000000"}
//             />
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default InvoiceModal;








import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../actions/modalActions";
import { clearCart } from "../../actions/POS/cartActions";
import { getInvoiceDetails, getInvoiceImage } from "../../actions/POS/invoiceActions";
import Modal from "../common/Modal";
import qz from "qz-tray";
import Barcode from "react-barcode";
import { fetchProducts } from "../../actions/POS/productAction";
import { useAuthenticatedImage } from "../../hooks/useAuthenticatedImage";
import ledDisplayService from "../../services/ledDisplayService";

const PRINTER_NAME = "BIXOLON SRP-E302";

const CASH_DRAWER_COMMANDS = {
  OPEN_DRAWER_PIN2: "\x1B\x70\x00\x19\xFA",
  OPEN_DRAWER_PIN5: "\x1B\x70\x01\x19\xFA",
  ALTERNATE_1: "\x1B\x70\x00\x60\x60",
  ALTERNATE_2: "\x1B\x70\x01\x60\x60",
  BELL_COMMAND: "\x07",
};

const getCurrentDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getNextInvoiceNumber = () => {
  const today = getCurrentDateString();
  const lastInvoice = localStorage.getItem('lastInvoice');
  if (lastInvoice) {
    const lastDate = lastInvoice.substring(0, 8);
    const lastNumber = lastInvoice.substring(8);
    if (lastDate === today) {
      const nextNum = String(parseInt(lastNumber) + 1).padStart(4, '0');
      return `${today}${nextNum}`;
    }
  }
  return `${today}0000`;
};

const storeInvoiceNumber = (invoiceNumber) => {
  localStorage.setItem('lastInvoice', invoiceNumber);
};

const getInvoiceData = (invoiceNumber) => {
  const sampleInvoices = {
    "202405150000": {
      items: [
        { id: 1, name: "Product A", price: 100, quantity: 2 },
        { id: 2, name: "Product B", price: 50, quantity: 1 }
      ],
      subtotal: 250,
      total: 225,
      paymentMethod: "Cash",
      paidAmount: 300,
      changeAmount: 75,
      date: "2024-05-15",
      time: "10:30 AM"
    },
    "202405150001": {
      items: [
        { id: 3, name: "Product C", price: 75, quantity: 3 },
        { id: 4, name: "Product D", price: 120, quantity: 1 }
      ],
      subtotal: 345,
      total: 345,
      paymentMethod: "Card",
      paidAmount: 400,
      changeAmount: 55,
      date: "2024-05-15",
      time: "02:15 PM"
    }
  };

  return sampleInvoices[invoiceNumber] || null;
};

const formatCurrency = (value) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Product-specific discount calculations
const getProductDiscount = (item) => {
  if (item.discountType === 'Percentage') {
    return (item.price * item.discountValue) / 100;
  } else if (item.discountType === 'Value') {
    return item.discountValue;
  }
  return 0;
};

const getDiscountedPrice = (item) => {
  return item.discountedPrice || item.price;
};

const getItemTotal = (item) => {
  const discountedPrice = getDiscountedPrice(item);
  return discountedPrice * item.quantity;
};

const getItemDiscountAmount = (item) => {
  const discountAmount = getProductDiscount(item);
  return discountAmount * item.quantity;
};

// Helper function to format payment method names for display
const formatPaymentMethodName = (method) => {
  const methodNames = {
    'cash': 'Cash',
    'card': 'Credit Card',
    'debit': 'Debit Card',
    'lankaqr': 'LankaQR',
    'gift': 'Gift Card',
    'paypal': 'PayPal',
    'mobile': 'Mobile Pay'
  };
  return methodNames[method] || method;
};

// Helper function to get payment method display name
const getPaymentMethodDisplay = (paymentMethod, splitPayment) => {
  if (!splitPayment) {
    return formatPaymentMethodName(paymentMethod);
  }

  if (splitPayment && splitPayment.methods) {
    const methods = splitPayment.methods.map(method =>
      formatPaymentMethodName(method.method)
    );


    if (methods.includes('Cash') && methods.includes('Credit Card')) {
      return 'Cash & Card';
    } else if (methods.includes('Cash') && methods.includes('Debit Card')) {
      return 'Cash & Debit Card';
    } else if (methods.includes('Credit Card') && methods.includes('Debit Card')) {
      return 'Credit & Debit Card';
    } else {
      return methods.join(' + ');
    }
  }

  return "Cash & Card";
};

const convertImageForThermalPrint = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const maxWidth = 384;
      const scaleFactor = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleFactor;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const value = brightness > 128 ? 255 : 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx.putImageData(imageData, 0, 0);

      const processedImageData = canvas.toDataURL('image/png');
      resolve(processedImageData);
    };

    img.onerror = function () {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

const InvoiceModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { modalProps } = useSelector((state) => state.ui);
  const { items: cartItems, tabs, activeTabId } = useSelector((state) => state.cart);
  const { invoiceDetails } = useSelector((state) => state.invoice);

  const [invoiceSettings, setInvoiceSettings] = useState({
    templates: [],
    selectedTemplate: 'retail',
    companyDetails: {}
  });

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scannedInvoice, setScannedInvoice] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isOpeningDrawer, setIsOpeningDrawer] = useState(false);
  const [printableImage, setPrintableImage] = useState(null);
  const barcodeInputRef = useRef(null);

  const apiImageUrl = invoiceDetails?.ResultSet?.[0]?.IMAGEURL;
  const { imageData: authenticatedLogo } = useAuthenticatedImage(apiImageUrl);

  const companyDetails = invoiceSettings.companyDetails || {};

  useEffect(() => {
    const loadInvoiceSettings = () => {
      try {
        const savedSettings = localStorage.getItem('invoiceSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setInvoiceSettings(parsedSettings);
        } else {
          setInvoiceSettings({
            templates: [
              {
                id: 'retail',
                name: 'Retail Template',
                description: 'Modern retail invoice design',
                fields: {
                  showLogo: true,
                  showHeader: true,
                  showFooter: true,
                  showBarcode: true,
                  showTaxDetails: false,
                  showDiscountBreakdown: true,
                  layout: 'vertical',
                  showSaving: true
                }
              }
            ],
            selectedTemplate: 'retail',
            companyDetails: {
              name: 'Rs Bathik Gallery',
              phone: '0717517044',
              address: 'No 286, moronthuduwa rd, melegama, wadduwa, Sri Lanka,12560',
              email: '',
              website: '',
              taxNumber: '',
              logo: '',
              footerText: 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
              termsAndConditions: 'Goods sold are not returnable. Warranty as per manufacturer terms.'
            }
          });
        }
      } catch (error) {
      }
    };

    loadInvoiceSettings();
    dispatch(getInvoiceDetails());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getInvoiceImage());
  }, [dispatch]);

  useEffect(() => {
    if (invoiceDetails && invoiceDetails.ResultSet && invoiceDetails.ResultSet.length > 0) {
      const apiData = invoiceDetails.ResultSet[0];
      setInvoiceSettings(prev => ({
        ...prev,
        companyDetails: {
          name: apiData.p_company_name || 'Rs Bathik Gallery',
          phone: apiData.p_phone_number || '0717517044',
          address: apiData.p_address || 'No 286, moronthuduwa rd, melegama, wadduwa, Sri Lanka,12560',
          email: apiData.p_email || '',
          website: apiData.p_website || '',
          taxNumber: apiData.p_tax_number || '',
          logo: authenticatedLogo || apiData.IMAGEURL || '',
          footerText: apiData.p_footer_text || 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
          termsAndConditions: apiData.p_terms_conditions || 'Goods sold are not returnable. Warranty as per manufacturer terms.'
        }
      }));
    }
  }, [invoiceDetails, authenticatedLogo]);

  useEffect(() => {
    const preparePrintableImage = async () => {
      const currentCompanyDetails = invoiceSettings.companyDetails || {};
      if (currentCompanyDetails.logo) {
        try {
          const processedImage = await convertImageForThermalPrint(currentCompanyDetails.logo);
          setPrintableImage(processedImage);
        } catch (error) {

          setPrintableImage(null);
        }
      } else {
        setPrintableImage(null);
      }
    };

    preparePrintableImage();
  }, [invoiceSettings.companyDetails]);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  const { items: activeTabItems, discount: cartDiscount = 0 } = activeTab;
  const paidItems = modalProps?.items || [];
  const items = paidItems.length > 0 ? paidItems : (activeTabItems || cartItems || []);

  const {
    subtotal: propSubtotal = 0,
    total: propTotal = 0,
    paymentMethod = "",
    paidAmount = 0,
    changeAmount = 0,
    discount: propDiscount = 0,
    cartDiscount: propCartDiscount = 0,
    totalProductDiscount: propTotalProductDiscount = 0,
    splitPayment = null,
    remainingMethods = null,
    invoiceData = null
  } = modalProps || {};

  const getInvoiceDataValue = (keys) => {
    if (!invoiceData) return null;
    for (const key of keys) {
      if (invoiceData[key] !== undefined && invoiceData[key] !== null) {
        return parseFloat(invoiceData[key]);
      }
    }
    if (invoiceData.ResultSet) {
      if (Array.isArray(invoiceData.ResultSet) && invoiceData.ResultSet.length > 0) {
        const res = invoiceData.ResultSet[0];
        for (const key of keys) {
          if (res && res[key] !== undefined && res[key] !== null) {
            return parseFloat(res[key]);
          }
        }
      } else {
        for (const key of keys) {
          if (invoiceData.ResultSet[key] !== undefined && invoiceData.ResultSet[key] !== null) {
            return parseFloat(invoiceData.ResultSet[key]);
          }
        }
      }
    }
    return null;
  };

  const calculateAmounts = () => {
    const itemTotals = items.map(item => getItemTotal(item));
    const computedSubtotal = itemTotals.reduce((sum, total) => sum + total, 0);

    const totalProductDiscount = items.reduce(
      (sum, item) => sum + getItemDiscountAmount(item),
      0
    );

    const backendDiscount = getInvoiceDataValue(['DiscountAmount', 'DiscountAmt', 'discount_amount', 'discount']);
    const additionalCartDiscount = backendDiscount !== null ? backendDiscount : (propDiscount || cartDiscount || 0);

    const backendSubtotal = getInvoiceDataValue(['TotalAmount', 'TotalAmt', 'subtotal']);
    const subtotal = backendSubtotal !== null ? backendSubtotal : computedSubtotal;

    const backendTotal = getInvoiceDataValue(['NetAmount', 'NetAmt', 'total']);
    const total = backendTotal !== null ? backendTotal : (propTotal || (subtotal - additionalCartDiscount));

    return {
      subtotal,
      totalProductDiscount: propTotalProductDiscount || totalProductDiscount,
      additionalCartDiscount,
      total
    };
  };

  const {
    subtotal,
    totalProductDiscount,
    additionalCartDiscount,
    total
  } = calculateAmounts();

  const invoiceDate = new Date().toLocaleDateString();
  const invoiceTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedInvoiceNumber = invoiceNumber || "";

  useEffect(() => {
    const newInvoiceNumber = getNextInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);
  }, []);

  useEffect(() => {
    if (scanMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [scanMode]);

  useEffect(() => {
    if (barcodeInput.length >= 12) {
      const invoiceData = getInvoiceData(barcodeInput);
      if (invoiceData) {
        setScannedInvoice(invoiceData);
        setScanMode(false);
      } else {
        alert("Invoice not found!");
        setBarcodeInput("");
      }
    }
  }, [barcodeInput]);

  // Enhanced LED Display Effect for Split Payments
  useEffect(() => {
    const updateLEDForPayment = async () => {
      try {
        if (splitPayment && splitPayment.methods) {
          await ledDisplayService.displayNumber(total);

        } else if (paymentMethod === "Cash" && changeAmount > 0) {
          await ledDisplayService.displayNumber(changeAmount);

        } else {
          await ledDisplayService.displayNumber(total);

        }
      } catch (error) {

      }
    };

    updateLEDForPayment();
  }, [paymentMethod, changeAmount, total, splitPayment]);

  const currentTemplate = invoiceSettings.templates?.find(
    t => t.id === invoiceSettings.selectedTemplate
  ) || { fields: {} };

  const esc = "\x1B";
  const gs = "\x1D";
  const LINE_WIDTH = 42;

  const leftRight = (left, right, width = LINE_WIDTH) => {
    const space = width - (left.length + right.length);
    return left + " ".repeat(space > 0 ? space : 1) + right;
  };

  const divider = (char = "-") => char.repeat(LINE_WIDTH) + "\n";

  const generateBarcodeCommands = (data) => {
    return [
      gs + "H" + "\x02",
      gs + "w" + "\x02",
      gs + "h" + "\x35",
      gs + "k" + "\x04" + data + "\x00",
      "\n",
    ];
  };

  // Enhanced Cash Drawer Function
  const openCashDrawer = async () => {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }

      const config = qz.configs.create(PRINTER_NAME);

      const commands = [
        CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN2,
        CASH_DRAWER_COMMANDS.OPEN_DRAWER_PIN5,
        CASH_DRAWER_COMMANDS.ALTERNATE_1,
        CASH_DRAWER_COMMANDS.ALTERNATE_2,
        CASH_DRAWER_COMMANDS.BELL_COMMAND
      ];

      let drawerOpened = false;
      let lastError = null;

      for (const command of commands) {
        try {
          await qz.print(config, [{ type: "raw", format: "command", data: command }]);
          drawerOpened = true;
          break;
        } catch (error) {

          lastError = error;
        }
      }

      if (!drawerOpened) {
        throw new Error(`Cash drawer failed to open: ${lastError?.message || 'Unknown error'}`);
      }

      return drawerOpened;
    } catch (error) {

      throw error;
    }
  };

  // Enhanced Print function with split payment support
  const handlePrint = async () => {
    if (isPrinting) return;

    setIsPrinting(true);
    localStorage.removeItem("saleId");
    localStorage.removeItem("invoiceNumber");
    dispatch(fetchProducts());

    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }
      const config = qz.configs.create(PRINTER_NAME);

      // Create print data with split payment support
      const lines = [
        esc + "@", // Initialize printer

        // Print company logo if available
        ...(printableImage ? [
          esc + "a" + "\x01", // Center align
          "[" + (companyDetails.name || "Rs Bathik Gallery") + " LOGO]\n",
          esc + "a" + "\x00", // Left align
          "\n"
        ] : []),

        // Company header
        esc + "!" + "\x38", // Select double height and emphasized printing
        esc + "a" + "\x01", // Center align
        "★ " + (companyDetails.name || "Rs Bathik Gallery") + " ★\n",
        esc + "!" + "\x00", // Cancel text formatting
        esc + "a" + "\x00", // Left align

        // Company details
        esc + "!" + "\x08", // Select emphasized printing
        (companyDetails.phone || "0717517044") + "\n",
        (companyDetails.address || "No 286, moronthuduwa rd, melegama, wadduwa, Sri Lanka,12560") + "\n",
        esc + "!" + "\x00", // Cancel text formatting

        divider("="),

        // Invoice info
        leftRight("Invoice:", formattedInvoiceNumber) + "\n",
        leftRight("Date:", `${invoiceDate} ${invoiceTime}`) + "\n",
        divider("-"),

        // Payment Method - UPDATED TO SHOW FRIENDLY NAMES
        esc + "!" + "\x08", // Emphasized
        leftRight("Payment:", getPaymentMethodDisplay(paymentMethod, splitPayment)) + "\n",
        esc + "!" + "\x00", // Cancel emphasis
        divider("-"),

        // Items header
        esc + "!" + "\x08", // Emphasized
        leftRight("Item", "Qty  Price   Total") + "\n",
        esc + "!" + "\x00", // Cancel emphasis
        divider("-"),

        // Items list
        ...items.map((item) => {
          const discountedPrice = getDiscountedPrice(item);
          const itemTotal = getItemTotal(item);
          const saving = getItemDiscountAmount(item);

          const line1 = item.name.length > 28 ? item.name.slice(0, 28) : item.name;
          const line2 = leftRight(
            " ".repeat(2) + `${item.quantity} x ${discountedPrice.toFixed(2)}`,
            itemTotal.toFixed(2)
          );
          const line3 = leftRight(
            " ".repeat(2) + `Saving: -${saving.toFixed(2)}`,
            ""
          );

          return line1 + "\n" + line2 + "\n" + line3 + "\n";
        }),

        divider("-"),
        leftRight("Subtotal", "" + subtotal.toFixed(2)) + "\n",
        additionalCartDiscount > 0 ? leftRight("Discount", "(" + additionalCartDiscount.toFixed(2) + ")") + "\n" : "",
        divider("="),
        esc + "!" + "\x38", // Double height and emphasized
        leftRight("TOTAL", "" + total.toFixed(2)) + "\n",
        esc + "!" + "\x00", // Cancel text formatting
        divider("="),

        // Enhanced Payment information for split payments
        ...renderSplitPaymentPrintLines(),

        divider("-"),

        // Retail template footer
        esc + "a" + "\x01", // Center align
        esc + "!" + "\x08", // Emphasized
        "★ THANK YOU ★\n",
        esc + "!" + "\x00", // Cancel emphasis
        "\n",
        (companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.") + "\n",
        "\n",

        // Barcode
        ...generateBarcodeCommands(invoiceNumber),

        "\n\n",
        gs + "V" + "\x41" + "\x03",
      ];

      const printData = lines.join("");

      await qz.print(config, [{ type: "raw", format: "command", data: printData }]);

      await openCashDrawer();

      storeInvoiceNumber(invoiceNumber);

      // CLEAR LED DISPLAY AFTER SUCCESSFUL PRINTING
      try {
        await ledDisplayService.clearAndResetDisplay();

      } catch (error) {

      }

      handleClose();
    } catch (err) {

      alert("Print error: " + err.message);
    } finally {
      setIsPrinting(false);
    }
  };

  // NEW: Function to render split payment lines for printing
  const renderSplitPaymentPrintLines = () => {
    const lines = [];

    if (splitPayment && splitPayment.methods) {
      // Split payment details
      lines.push(esc + "!" + "\x08" + "SPLIT PAYMENT DETAILS" + esc + "!" + "\x00" + "\n");

      splitPayment.methods.forEach((method, index) => {
        const methodName = formatPaymentMethodName(method.method).toUpperCase();
        lines.push(leftRight(`${methodName}:`, formatCurrency(method.amount)) + "\n");
      });

      lines.push(divider("-"));

      // Calculate total paid and change
      const totalPaid = splitPayment.methods.reduce((sum, method) => sum + method.amount, 0);
      const change = totalPaid - total;

      if (change > 0) {
        lines.push(leftRight("Change:", formatCurrency(change)) + "\n");
      }
    } else {
      // Single payment method
      if (paidAmount > 0) {
        lines.push(leftRight("Paid", "" + paidAmount.toFixed(2)) + "\n");
      }
      if (changeAmount > 0) {
        lines.push(leftRight("Change", "" + changeAmount.toFixed(2)) + "\n");
      }
    }

    return lines;
  };

  // Separate function to just open cash drawer
  const handleOpenCashDrawer = async () => {
    if (isOpeningDrawer) return;

    setIsOpeningDrawer(true);
    try {
      await openCashDrawer();
      alert("Cash drawer opened successfully!");
    } catch (error) {

      alert("Error opening cash drawer: " + error.message);
    } finally {
      setIsOpeningDrawer(false);
    }
  };

  useEffect(() => {
    const savedInvoiceNumber = localStorage.getItem("invoiceNumber");

    if (savedInvoiceNumber) {
      setInvoiceNumber(savedInvoiceNumber);
    } else {
      const newInvoiceNumber = getNextInvoiceNumber();
      setInvoiceNumber(newInvoiceNumber);
    }
  }, []);

  const formatInvoiceNumber = (invNum) => {
    if (!invNum) return "";
    return invNum.toString();
  };

  const handleClose = () => {
    localStorage.removeItem("saleId");
    dispatch(closeModal());
    dispatch(clearCart());
    dispatch(fetchProducts());
    localStorage.removeItem("invoiceNumber");

    // CLEAR LED DISPLAY WHEN MODAL CLOSES
    const clearLED = async () => {
      try {
        await ledDisplayService.clearAndResetDisplay();

      } catch (error) {

      }
    };

    clearLED();
  };

  const handleScanModeToggle = () => {
    setScanMode(!scanMode);
    setBarcodeInput("");
    setScannedInvoice(null);
  };

  const handleBarcodeInput = (e) => {
    setBarcodeInput(e.target.value);
  };

  const displayData = scannedInvoice || {
    items,
    subtotal,
    total,
    paymentMethod,
    paidAmount,
    changeAmount,
    date: invoiceDate,
    time: invoiceTime,
    splitPayment
  };

  // NEW: Calculate split payment totals
  const calculateSplitPaymentTotals = () => {
    if (!splitPayment || !splitPayment.methods) {
      return { totalPaid: paidAmount, change: changeAmount };
    }

    const totalPaid = splitPayment.methods.reduce((sum, method) => sum + method.amount, 0);
    const change = totalPaid - total;

    return { totalPaid, change };
  };

  const { totalPaid, change } = calculateSplitPaymentTotals();

  const renderInvoiceTemplate = () => {
    const templateId = invoiceSettings.selectedTemplate || 'retail';

    switch (templateId) {
      case 'retail':
        return renderRetailTemplate();
      default:
        return renderRetailTemplate();
    }
  };

  const renderRetailTemplate = () => (
    <div className="space-y-4">
      {/* Retail Header */}
      {currentTemplate.fields.showHeader && (
        <div className={`text-center border-b-2 pb-4 ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
          {companyDetails.logo && currentTemplate.fields.showLogo && (
            <img
              src={companyDetails.logo}
              alt="Company Logo"
              className="h-16 mx-auto mb-2"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            ★ {companyDetails.name || 'Rs Bathik Gallery'} ★
          </h2>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{companyDetails.phone || '0717517044'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{companyDetails.address || 'No 286, moronthuduwa rd, melegama, wadduwa, Sri Lanka,12560'}</p>
        </div>
      )}

      {/* Invoice Info */}
      <div className={`p-3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <div className="flex justify-between text-sm">
          <div>
            <span className="font-semibold">Invoice : </span>
            {scannedInvoice ? barcodeInput : formattedInvoiceNumber}
          </div>
          <div>
            <span className="font-semibold">Date: </span>
            {scannedInvoice ? `${scannedInvoice.date} ${scannedInvoice.time}` : `${invoiceDate} ${invoiceTime}`}
          </div>
        </div>

        {/* Payment Method Display - UPDATED */}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold">Payment Method: </span>
          <span className={`font-bold ${splitPayment ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'
            }`}>
            {getPaymentMethodDisplay(paymentMethod, splitPayment)}
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div className={`border rounded-lg overflow-hidden ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div
          className={`grid grid-cols-5 text-xs font-bold px-3 py-2 border-b
            ${darkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}
        >
          <div className="col-span-3">Item</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Total</div>
        </div>
        {renderRetailItemsTable()}
      </div>

      {/* Totals */}
      {renderRetailTotalsSection()}

      {/* Split Payment Details */}
      {splitPayment && splitPayment.methods && (
        <div className={`p-3 rounded-lg border-2 border-purple-300 ${darkMode ? "bg-purple-900/20" : "bg-purple-50"}`}>
          <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">
            💳 SPLIT PAYMENT DETAILS
          </h3>
          {splitPayment.methods.map((method, index) => (
            <div key={index} className="flex justify-between text-sm mb-1">
              <span className="capitalize font-medium">{formatPaymentMethodName(method.method)}:</span>
              <span className="font-semibold">{formatCurrency(method.amount)}</span>
            </div>
          ))}
          <div className="border-t border-purple-200 dark:border-purple-700 mt-2 pt-2">
            <div className="flex justify-between font-bold">
              <span>Total Paid:</span>
              <span className="text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span>Change:</span>
                <span className="text-blue-600">{formatCurrency(change)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {currentTemplate.fields.showFooter && (
        <div className={`text-center border-t-2 pt-4 text-xs ${darkMode ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-600"}`}>
          <p className="font-semibold mb-2">★ THANK YOU ★</p>
          <p className="leading-relaxed">{companyDetails.footerText || "Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days."}</p>
        </div>
      )}
    </div>
  );

  const renderRetailItemsTable = () => {
    if (!displayData.items || displayData.items.length === 0) {
      return <p className="text-center py-4 text-gray-400">No items</p>;
    }

    return displayData.items.map((item) => {
      const discountedPrice = getDiscountedPrice(item);
      const itemTotal = getItemTotal(item);
      const saving = getItemDiscountAmount(item);

      return (
        <div key={item.id} className="border-b border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-5 px-3 py-2 text-sm">
            <div className="col-span-3 font-medium dark:text-white">{item.name}</div>
            <div className="text-center dark:text-white">{item.quantity}</div>
            <div className="text-right font-semibold dark:text-white">{formatCurrency(itemTotal)}</div>
          </div>
          <div className="grid grid-cols-5 px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="col-span-3">
              {item.quantity} x {formatCurrency(discountedPrice)}
              <span className="text-red-500 ml-2">
                (Saving: ({formatCurrency(saving)}))
              </span>
            </div>
            <div className="col-span-2 text-right line-through text-gray-400 dark:text-gray-500">
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderRetailTotalsSection = () => (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between border-b pb-1 dark:border-gray-700">
        <span className="dark:text-white">Subtotal:</span>
        <span className="dark:text-white">{formatCurrency(subtotal)}</span>
      </div>

      {additionalCartDiscount > 0 && (
        <div className="flex justify-between text-red-500 border-b pb-1 dark:border-gray-700">
          <span>Discount:</span>
          <span>({formatCurrency(additionalCartDiscount)})</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2 dark:border-gray-700">
        <span>TOTAL:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {/* Payment Info - Only show if not split payment */}
      {!splitPayment && ((displayData.paidAmount > 0) || (displayData.changeAmount > 0)) && (
        <div
          className={`mt-3 border-t pt-2 space-y-1 p-2 rounded 
            ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"}`}
        >
          {displayData.paidAmount > 0 && (
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>{formatCurrency(displayData.paidAmount)}</span>
            </div>
          )}
          {displayData.changeAmount > 0 && (
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{formatCurrency(displayData.changeAmount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal size="lg">
      <div
        className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
      >
        {/* Header with buttons at top right */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-center">


          </div>

          {/* Buttons at top right */}
          <div className="flex gap-2">
            {/* <button
              onClick={handleScanModeToggle}
              className={`py-2 px-4 font-semibold rounded-lg shadow ${
                scanMode 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {scanMode ? "Cancel Scan" : "Scan Invoice"}
            </button> */}

            {/* Separate Cash Drawer Button */}
            {/* <button
              onClick={handleOpenCashDrawer}
              disabled={isOpeningDrawer}
              className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
            >
              {isOpeningDrawer ? "Opening..." : "Open Drawer"}
            </button> */}

            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barcode scanner input */}
        {scanMode && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <label className="block text-sm font-bold mb-2 dark:text-white">
              Scan Barcode or Enter Invoice Number:
            </label>
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={handleBarcodeInput}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              placeholder="Scan barcode or enter invoice number"
              autoFocus
            />
            <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
              Point your barcode scanner at this field and scan the invoice barcode.
            </p>
          </div>
        )}

        {/* Render selected invoice template */}
        {renderInvoiceTemplate()}

        {/* Barcode */}
        {currentTemplate.fields.showBarcode && (
          <div className="mt-6 flex justify-center">
            <Barcode
              value={scannedInvoice ? barcodeInput : invoiceNumber}
              format="CODE128"
              width={1.5}
              height={40}
              displayValue={true}
              background={darkMode ? "#1F2937" : "#FFFFFF"}
              lineColor={darkMode ? "#FFFFFF" : "#000000"}
            />
          </div>
        )}

      </div>
    </Modal>
  );
};

export default InvoiceModal;
