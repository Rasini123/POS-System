// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { closeModal } from '../../actions/modalActions';
// import { openModal } from '../../actions/modalActions';
// import Modal from '../common/Modal';

// const CashCalcModal = () => {
//   const dispatch = useDispatch();
//   const { darkMode } = useSelector(state => state.ui);
//   const { modalProps } = useSelector(state => state.ui);

//   const [cashGiven, setCashGiven] = useState('');
//   const [showNumberPad, setShowNumberPad] = useState(false);
//   const total = modalProps?.total || 0;
//   const balance = parseFloat(cashGiven.replace(/,/g, '')) - total || 0;


//   const formatNumber = (num) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };


//   const parseInput = (value) => {
//     return value.replace(/[^\d.]/g, '');
//   };

//   const handleCalculateBalance = () => {
//     const numericCash = parseFloat(cashGiven.replace(/,/g, ''));
//     if (numericCash >= total) {
//       dispatch(closeModal());
//       dispatch(openModal('INVOICE', {
//         ...modalProps,
//         paidAmount: numericCash,
//         changeAmount: balance,
//         paymentMethod: 'cash'
//       }));
//     } else {
//       alert('Insufficient cash!');
//     }
//   };

//   const handleAddCashNote = (amount) => {
//     const currentValue = parseFloat(cashGiven.replace(/,/g, '')) || 0;
//     const newValue = currentValue + amount;
//     setCashGiven(formatNumber(newValue.toString()));
//   };

//   const handleClear = () => {
//     setCashGiven('');
//   };

//   const handleInputChange = (e) => {
//     const inputValue = e.target.value;
//     if (/^\d*\.?\d*$/.test(inputValue.replace(/,/g, ''))) {
//       const parsedValue = parseInput(inputValue);
//       setCashGiven(formatNumber(parsedValue));
//     }
//   };


//   const handleNumberPadClick = (value) => {
//     const currentValue = cashGiven.replace(/,/g, '');
//     let newValue = '';

//     if (value === '.') {

//       if (!currentValue.includes('.')) {
//         newValue = currentValue ? currentValue + '.' : '0.';
//       } else {
//         newValue = currentValue;
//       }
//     } else if (value === 'backspace') {

//       newValue = currentValue.slice(0, -1);
//     } else {

//       newValue = currentValue + value;
//     }


//     if (newValue === '' || newValue === '.') {
//       setCashGiven(newValue === '.' ? '0.' : '');
//     } else {

//       if (newValue.includes('.')) {
//         const parts = newValue.split('.');
//         parts[0] = parts[0] ? formatNumber(parts[0]) : '0';
//         setCashGiven(parts.join('.'));
//       } else {
//         setCashGiven(formatNumber(newValue));
//       }
//     }
//   };

//   const handleInputFocus = () => {
//     setShowNumberPad(true);
//   };

//   return (
//     <Modal>
//       <div className="w-full max-w-md mx-auto p-4">
//         {/* Header */}
//         <div className="mb-4 text-center">
//           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cash Payment</h2>
//           <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//             Enter cash received
//           </p>
//         </div>

//         {/* Total Amount Card */}
//         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 mb-4 text-white shadow">
//           <p className="text-xs font-medium opacity-90">Total Amount</p>
//           <p className="text-2xl font-bold">Rs. {formatNumber(total.toFixed(2))}</p>
//         </div>

//         {/* Cash Input Card */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-4 shadow border border-gray-100 dark:border-gray-700">
//           <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Cash Received
//           </label>
//           <div className="relative">
//             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rs.</span>
//             <input
//               type="text"
//               value={cashGiven}
//               onChange={handleInputChange}
//               onFocus={handleInputFocus}
//               placeholder="0.00"
//               className="w-full pl-10 pr-3 py-2 text-xl font-semibold bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 dark:text-white"
//             />
//           </div>

//           {/* Quick Add Buttons */}
//           <div className="mt-2 grid grid-cols-4 gap-1">
//             {[5000, 1000, 500, 100].map((amount) => (
//               <button
//                 key={amount}
//                 onClick={() => handleAddCashNote(amount)}
//                 className="py-1.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold rounded-lg transition-all hover:shadow-sm active:opacity-90 flex items-center justify-center"
//               >
//                 <span className="text-sm">{formatNumber(amount)}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Balance Card */}
//         <div className={`rounded-xl p-3 mb-4 shadow border ${balance >= 0
//             ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
//             : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
//           }`}>
//           <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Change Due</p>
//           <p className={`text-lg font-bold ${balance >= 0
//               ? 'text-green-600 dark:text-green-400'
//               : 'text-red-600 dark:text-red-400'
//             }`}>
//             Rs. {formatNumber(balance.toFixed(2))}
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 gap-2">
//           <button
//             onClick={handleClear}
//             className="py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
//           >
//             Clear
//           </button>
//           <button
//             onClick={handleCalculateBalance}
//             disabled={balance < 0}
//             className={`py-2 font-semibold rounded-lg transition-all text-sm ${balance >= 0
//                 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md active:opacity-90'
//                 : 'bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-400 cursor-not-allowed'
//               }`}
//           >
//             Confirm Payment
//           </button>
//         </div>

//         {/* Number Pad Popup */}
//         {showNumberPad && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
//               {/* Header */}
//               <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Enter Amount</h3>
//                   <button
//                     onClick={() => setShowNumberPad(false)}
//                     className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
//                   <div className="text-2xl font-bold text-gray-800 dark:text-white text-center">
//                     Rs. {cashGiven || '0.00'}
//                   </div>
//                 </div>
//               </div>

//               {/* Number Pad */}
//               <div className="p-4">
//                 <div className="grid grid-cols-3 gap-3">
//                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
//                     <button
//                       key={number}
//                       onClick={() => handleNumberPadClick(number.toString())}
//                       className="py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
//                     >
//                       {number}
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => handleNumberPadClick('.')}
//                     className="py-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
//                   >
//                     .
//                   </button>
//                   <button
//                     onClick={() => handleNumberPadClick('0')}
//                     className="py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
//                   >
//                     0
//                   </button>
//                   <button
//                     onClick={() => handleNumberPadClick('backspace')}
//                     className="py-4 bg-gradient-to-br from-red-500 to-pink-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
//                   >
//                     ⌫
//                   </button>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="grid grid-cols-2 gap-3 mt-4">
//                   <button
//                     onClick={() => setShowNumberPad(false)}
//                     className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-gray-600"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => setShowNumberPad(false)}
//                     className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg"
//                   >
//                     Done
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default CashCalcModal;


import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import { openModal } from '../../actions/modalActions';
import { clearCart } from '../../actions/POS/cartActions';
import { addInvoice } from '../../actions/POS/invoiceActions';
import Modal from '../common/Modal';

const CashCalcModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { modalProps } = useSelector(state => state.ui);

  const [cashGiven, setCashGiven] = useState('');
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const total = modalProps?.total || 0;
  const numericCash = parseFloat(cashGiven.replace(/,/g, '')) || 0;
  const balance = numericCash - total;

  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseInput = (value) => {
    return value.replace(/[^\d.]/g, '');
  };

  const printBrowserReceipt = (props, paidAmount, changeAmount, paymentType, billNo, methods) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    const items = props?.items || [];
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 4px 0; font-size: 13px;">
          ${item.name || item.productName || 'Item'}<br/>
          <span style="font-size:11px; color:#555;">${item.quantity || item.qty || 1} x LKR ${parseFloat(item.price || item.unitPrice || 0).toFixed(2)}</span>
        </td>
        <td style="text-align: right; vertical-align: top; padding: 4px 0; font-size: 13px;">
          LKR ${(parseFloat(item.price || item.unitPrice || 0) * (item.quantity || item.qty || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const formattedDate = new Date().toLocaleString();
    const cashier = "User 1";

    let paymentMethodText = paymentType;
    if (paymentType === 'split' && methods) {
      paymentMethodText = methods.map(m => `${m.method} (LKR ${parseFloat(m.amount).toFixed(2)})`).join(', ');
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${billNo}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 15px; width: 280px; color: #000; }
            .text-center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .header-title { font-size: 18px; font-weight: bold; margin-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; }
            .footer { font-size: 11px; margin-top: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="header-title">R.S.BATHIK</div>
            <div style="font-size: 12px;">Premium Bathik Clothing</div>
            <div style="font-size: 11px;">Galle Road, Colombo, Sri Lanka</div>
            <div style="font-size: 11px;">Tel: +94 11 234 5678</div>
          </div>
          <div class="divider"></div>
          <div style="font-size: 12px; line-height: 1.4;">
            <b>Bill No :</b> ${billNo}<br/>
            <b>Date    :</b> ${formattedDate}<br/>
            <b>Cashier :</b> ${cashier}<br/>
          </div>
          <div class="divider"></div>
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="font-size: 13px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span>LKR ${parseFloat(props?.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-style: italic;">
              <span>Discount:</span>
              <span>-LKR ${parseFloat(props?.discount || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 4px;">
              <span>NET TOTAL:</span>
              <span>LKR ${parseFloat(props?.originalTotal || props?.total || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size:12px; margin-top: 4px;">
              <span>Paid Via:</span>
              <span>${paymentMethodText}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            Thank you for shopping with us!<br/>
            Exchange possible within 7 days.<br/>
            <b>Powered by R.S.Bathik POS</b>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCalculateBalance = async () => {
    if (numericCash >= total) {
      setProcessing(true);
      try {
        // If this is part of split payment
        if (modalProps?.splitPayment) {
          const allMethods = [
            {
              method: 'cash',
              amount: numericCash
            },
            ...(modalProps.otherMethods || [])
          ];

          const totalPaid = allMethods.reduce((sum, method) => sum + method.amount, 0);
          
          // Create invoice for split payment
          const invoiceResponse = await dispatch(addInvoice({
            items: modalProps?.items || [],
            subtotal: modalProps?.subtotal || 0,
            discount: modalProps?.discount || 0,
            tax: modalProps?.tax || 0,
            total: modalProps?.originalTotal || total,
            splitPayment: true,
            method: 'split',
            amount: totalPaid,
            methods: allMethods,
            tabId: modalProps?.tabId
          }));

          const invoiceData = invoiceResponse?.payload || invoiceResponse;
          
          const billNo = invoiceData?.BillNo || invoiceData?.ResultSet?.[0]?.BillNo || invoiceData?.data?.BillNo || localStorage.getItem('lastInvoice') || 'N/A';
          printBrowserReceipt(modalProps, totalPaid, balance, 'split', billNo, allMethods);
          
          dispatch(closeModal());
          dispatch(openModal('INVOICE', {
            ...modalProps,
            items: modalProps?.items || [],
            subtotal: modalProps?.subtotal || 0,
            discount: modalProps?.discount || 0,
            tax: modalProps?.tax || 0,
            total: modalProps?.originalTotal || total,
            paidAmount: totalPaid,
            changeAmount: balance,
            paymentMethod: 'split',
            splitPayment: true,
            methods: allMethods,
            invoiceData
          }));

          // Clear cart if tabId exists
          if (modalProps?.tabId) {
            dispatch(clearCart(modalProps.tabId));
          }
        } else {
          // Regular cash payment
          const invoiceResponse = await dispatch(addInvoice({
            items: modalProps?.items || [],
            subtotal: modalProps?.subtotal || 0,
            discount: modalProps?.discount || 0,
            tax: modalProps?.tax || 0,
            total: modalProps?.total || 0,
            splitPayment: false,
            method: 'cash',
            amount: numericCash, // This will be used as P_PAIDAMOUNT
            tabId: modalProps?.tabId
          }));

          const invoiceData = invoiceResponse?.payload || invoiceResponse;
          
          const billNo = invoiceData?.BillNo || invoiceData?.ResultSet?.[0]?.BillNo || invoiceData?.data?.BillNo || localStorage.getItem('lastInvoice') || 'N/A';
          printBrowserReceipt(modalProps, numericCash, balance, 'Cash', billNo, null);
          
          dispatch(closeModal());
          dispatch(openModal('INVOICE', {
            ...modalProps,
            paidAmount: numericCash,
            changeAmount: balance,
            paymentMethod: 'cash',
            invoiceData
          }));

          // Clear cart if tabId exists
          if (modalProps?.tabId) {
            dispatch(clearCart(modalProps.tabId));
          }
        }
      } catch (error) {
        console.error('Error processing cash payment:', error);
        alert('Error processing payment. Please try again.');
        setProcessing(false);
      }
    } else {
      alert('Insufficient cash! Please enter more cash.');
    }
  };

  const handleAddCashNote = (amount) => {
    const currentValue = parseFloat(cashGiven.replace(/,/g, '')) || 0;
    const newValue = currentValue + amount;
    setCashGiven(formatNumber(newValue.toString()));
  };

  const handleClear = () => {
    setCashGiven('');
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (/^\d*\.?\d*$/.test(inputValue.replace(/,/g, ''))) {
      const parsedValue = parseInput(inputValue);
      setCashGiven(formatNumber(parsedValue));
    }
  };

  const handleNumberPadClick = (value) => {
    const currentValue = cashGiven.replace(/,/g, '');
    let newValue = '';

    if (value === '.') {
      if (!currentValue.includes('.')) {
        newValue = currentValue ? currentValue + '.' : '0.';
      } else {
        newValue = currentValue;
      }
    } else if (value === 'backspace') {
      newValue = currentValue.slice(0, -1);
    } else {
      newValue = currentValue + value;
    }

    if (newValue === '' || newValue === '.') {
      setCashGiven(newValue === '.' ? '0.' : '');
    } else {
      if (newValue.includes('.')) {
        const parts = newValue.split('.');
        parts[0] = parts[0] ? formatNumber(parts[0]) : '0';
        setCashGiven(parts.join('.'));
      } else {
        setCashGiven(formatNumber(newValue));
      }
    }
  };

  const handleInputFocus = () => {
    setShowNumberPad(true);
  };

  const handleClose = () => {
    if (!processing) {
      dispatch(closeModal());
    }
  };

  return (
    <Modal>
      <div className="w-full max-w-md mx-auto p-4">
        {/* Header */}
        <div className="mb-4 text-center relative">
          <button
            onClick={handleClose}
            disabled={processing}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
              processing 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {modalProps?.splitPayment ? 'Split Payment - Cash' : 'Cash Payment'}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {modalProps?.splitPayment 
              ? 'Enter cash portion of payment' 
              : 'Enter cash received'
            }
          </p>
        </div>

        {/* Total Amount Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 mb-4 text-white shadow-lg">
          <p className="text-xs font-medium opacity-90 mb-1">Total Amount</p>
          <p className="text-2xl font-bold">Rs. {formatNumber(total.toFixed(2))}</p>
          {modalProps?.splitPayment && modalProps?.originalTotal && (
            <p className="text-xs opacity-80 mt-1">
              Original Total: Rs. {formatNumber(modalProps.originalTotal.toFixed(2))}
            </p>
          )}
        </div>

        {/* Cash Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-lg border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cash Received
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-lg">Rs.</span>
            <input
              type="text"
              value={cashGiven}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="0.00"
              disabled={processing}
              className="w-full pl-12 pr-4 py-3 text-2xl font-semibold bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Quick Add Buttons */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[5000, 1000, 500, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAddCashNote(amount)}
                disabled={processing}
                className="py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="text-sm">{formatNumber(amount)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Balance Card */}
        <div className={`rounded-xl p-4 mb-4 shadow-lg border ${
          balance >= 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Due</p>
          <p className={`text-xl font-bold ${
            balance >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            Rs. {formatNumber(Math.abs(balance).toFixed(2))} {balance < 0 ? 'Short' : ''}
          </p>
          {modalProps?.splitPayment && modalProps?.otherMethods && (
            <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Plus other methods: {modalProps.otherMethods.map(m => 
                  `${m.method}: Rs. ${formatNumber(m.amount.toFixed(2))}`
                ).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClear}
            disabled={processing}
            className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleCalculateBalance}
            disabled={balance < 0 || processing || !cashGiven}
            className={`py-3 font-semibold rounded-lg transition-all flex items-center justify-center ${
              balance >= 0 && cashGiven && !processing
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg active:scale-95'
                : 'bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>

        {/* Insufficient Cash Warning */}
        {balance < 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              Insufficient cash! Please enter more cash or adjust the amount.
            </p>
          </div>
        )}

        {/* Number Pad Popup */}
        {showNumberPad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Enter Amount</h3>
                  <button
                    onClick={() => setShowNumberPad(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                    Rs. {cashGiven || '0.00'}
                  </div>
                </div>
              </div>

              {/* Number Pad */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <button
                      key={number}
                      onClick={() => handleNumberPadClick(number.toString())}
                      className="py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => handleNumberPadClick('.')}
                    className="py-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    .
                  </button>
                  <button
                    onClick={() => handleNumberPadClick('0')}
                    className="py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleNumberPadClick('backspace')}
                    className="py-4 bg-gradient-to-br from-red-500 to-pink-600 text-white font-bold text-xl rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    ⌫
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => setShowNumberPad(false)}
                    className="py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowNumberPad(false)}
                    className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-800 dark:text-white text-center">Processing payment...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CashCalcModal;
