// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { closeModal, openModal } from '../../actions/modalActions';
// import { clearCart } from '../../actions/POS/cartActions';
// import { addInvoice } from '../../actions/POS/invoiceActions';
// import Modal from '../common/Modal';
// import { FiCreditCard, FiDollarSign, FiGift, FiSmartphone, FiCheckCircle, FiBox, FiAperture, FiArrowLeft, FiDivide } from 'react-icons/fi';

// const PaymentModal = () => {
//   const dispatch = useDispatch();
//   const { darkMode } = useSelector(state => state.ui);
//   const { modalProps } = useSelector(state => state.ui);

//   const items = modalProps?.items || [];
//   const subtotal = modalProps?.subtotal || 0;
//   const discount = modalProps?.discount || 0;
//   const tax = modalProps?.tax || 0;
//   const total = modalProps?.total || 0;
//   const tabId = modalProps?.tabId;

//   const [selectedMethods, setSelectedMethods] = useState([]);
//   const [splitPayment, setSplitPayment] = useState(false);
//   const [splitAmounts, setSplitAmounts] = useState({});
//   const [processing, setProcessing] = useState(false);
//   const [invoiceData, setInvoiceData] = useState(null);

//   const paymentMethods = [
//     { id: 'cash', icon: <FiDollarSign className="w-5 h-5" />, label: 'Cash' },
//     { id: 'card', icon: <FiCreditCard className="w-5 h-5" />, label: 'Card' },
//     { id: 'lankaqr', icon: <FiAperture className="w-5 h-5" />, label: 'LankaQR' },
//     { id: 'gift', icon: <FiGift className="w-5 h-5" />, label: 'Gift Card' },
//     { id: 'paypal', icon: <FiBox className="w-5 h-5" />, label: 'PayPal' },
//     { id: 'mobile', icon: <FiSmartphone className="w-5 h-5" />, label: 'Mobile Pay' }
//   ];

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-LK', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   const handleBack = () => {
//     if (!processing) {
//       dispatch(closeModal());
//     }
//   };

//   const togglePaymentMethod = (methodId) => {
//     if (processing) return;

//     if (methodId === 'split') {
//       setSplitPayment(!splitPayment);
//       if (!splitPayment) {
//         setSelectedMethods(['cash', 'card']);
//         setSplitAmounts({
//           cash: total / 2,
//           card: total / 2
//         });
//       } else {
//         setSelectedMethods([]);
//         setSplitAmounts({});
//       }
//       return;
//     }

//     if (splitPayment) {
//       if (selectedMethods.includes(methodId)) {
//         const newMethods = selectedMethods.filter(id => id !== methodId);
//         setSelectedMethods(newMethods);


//         const newAmounts = { ...splitAmounts };
//         delete newAmounts[methodId];
//         setSplitAmounts(newAmounts);


//         if (newMethods.length <= 1) {
//           setSplitPayment(false);
//           if (newMethods.length === 1) {
//             setSelectedMethods([newMethods[0]]);
//           }
//         }
//       } else {

//         const newMethods = [...selectedMethods, methodId];
//         setSelectedMethods(newMethods);


//         const equalAmount = total / newMethods.length;
//         const newAmounts = {};
//         newMethods.forEach(method => {
//           newAmounts[method] = equalAmount;
//         });
//         setSplitAmounts(newAmounts);
//       }
//     } else {

//       setSelectedMethods([methodId]);
//     }
//   };

//   const updateSplitAmount = (methodId, amount) => {
//     if (amount < 0) amount = 0;
//     if (amount > total) amount = total;

//     const newAmounts = { ...splitAmounts, [methodId]: amount };


//     const currentTotal = Object.values(newAmounts).reduce((sum, amt) => sum + amt, 0);
//     const remaining = total - currentTotal + newAmounts[methodId];

//     if (remaining < 0) {

//       newAmounts[methodId] = total - (currentTotal - newAmounts[methodId]);
//     }

//     setSplitAmounts(newAmounts);
//   };

//   const getRemainingAmount = () => {
//     const paidAmount = Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0);
//     return total - paidAmount;
//   };

//   const isPaymentValid = () => {
//     if (selectedMethods.length === 0) return false;

//     if (splitPayment) {
//       const paidAmount = Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0);
//       return Math.abs(paidAmount - total) < 0.01;
//     }

//     return selectedMethods.length === 1;
//   };

//   const processPayment = async () => {
//     if (!isPaymentValid() || processing) return;

//     setProcessing(true);
//     try {
//       const whCode = localStorage.getItem("whCode");

//       let paymentData = {};

//       if (splitPayment) {
//         paymentData = {
//           splitPayment: true,
//           methods: selectedMethods.map(method => ({
//             method,
//             amount: splitAmounts[method]
//           }))
//         };
//       } else {
//         paymentData = {
//           splitPayment: false,
//           method: selectedMethods[0],
//           amount: total
//         };
//       }
// const invoiceResponse = await dispatch(addInvoice({
 
//   items,
//   subtotal,
//   discount,
//   tax,
//   total,
//   ...paymentData, 
//   tabId
// }));

//       const invoiceData = invoiceResponse?.payload || invoiceResponse;
//       setInvoiceData(invoiceData);

//       if (selectedMethods.includes('cash') && !splitPayment) {
//         dispatch(closeModal());
//         dispatch(openModal('CASH_CALC', {
//           items,
//           subtotal,
//           discount,
//           tax,
//           total,
//           tabId,
//           paymentMethod: 'cash',
//           invoiceData
//         }));
//       } else if (splitPayment && selectedMethods.includes('cash')) {

//         const cashAmount = splitAmounts.cash;
//         dispatch(closeModal());
//         dispatch(openModal('CASH_CALC', {
//           items,
//           subtotal,
//           discount,
//           tax,
//           total: cashAmount,
//           tabId,
//           paymentMethod: 'split',
//           splitPayment: true,
//           otherMethods: selectedMethods.filter(m => m !== 'cash').map(method => ({
//             method,
//             amount: splitAmounts[method]
//           })),
//           invoiceData
//         }));
//       } else {

//         dispatch(closeModal());
//         dispatch(openModal('INVOICE', {
//           items,
//           subtotal,
//           discount,
//           tax,
//           total,
//           paymentMethod: splitPayment ? 'split' : selectedMethods[0],
//           splitPayment: splitPayment ? {
//             methods: selectedMethods.map(method => ({
//               method,
//               amount: splitAmounts[method]
//             }))
//           } : null,
//           tabId,
//           invoiceData
//         }));

//         if (tabId) {
//           dispatch(clearCart(tabId));
//         }
//       }
//     } catch (error) {

//       setProcessing(false);
//     }
//   };

//   return (
//     <Modal>
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-md mx-auto">
//         {/* Header */}
//         <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleBack}
//               disabled={processing}
//               className={`p-1.5 rounded-md transition-all ${processing
//                   ? 'opacity-50 cursor-not-allowed'
//                   : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
//                 }`}
//               title="Go back"
//             >
//               <FiArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
//             </button>

//             <div className="p-1.5 bg-gradient-to-br from-green-500 to-teal-600 rounded-md shadow">
//               <FiCreditCard className="w-4 h-4 text-white" />
//             </div>
//             <div>
//               <h2 className="text-base font-bold text-gray-900 dark:text-white">
//                 {splitPayment ? 'Split Payment' : 'Payment Method'}
//               </h2>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {splitPayment ? 'Split amount between methods' : 'Select payment method'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Payment Methods */}
//         <div className="p-3">
//           {/* Split Payment Toggle */}
//           <div className="mb-3">
//             <button
//               onClick={() => togglePaymentMethod('split')}
//               disabled={processing}
//               className={`w-full p-3 rounded-md transition-all border flex items-center justify-center gap-2 ${splitPayment
//                   ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow'
//                   : darkMode
//                     ? 'bg-gray-700/30 border-gray-600 hover:shadow hover:-translate-y-0.5'
//                     : 'bg-gray-100 border-gray-200 hover:shadow hover:-translate-y-0.5'
//                 } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <FiDivide className={`w-5 h-5 ${splitPayment ? 'text-purple-600' : darkMode ? 'text-white' : 'text-gray-800'}`} />
//               <span className={`font-medium ${splitPayment ? 'text-purple-600' : darkMode ? 'text-white' : 'text-gray-800'}`}>
//                 Split Payment
//               </span>
//             </button>
//           </div>

//           <div className="grid grid-cols-3 gap-2 mb-4">
//             {paymentMethods.map(method => (
//               <button
//                 key={method.id}
//                 onClick={() => togglePaymentMethod(method.id)}
//                 disabled={processing}
//                 className={`p-3 rounded-md transition-all border flex flex-col items-center justify-center ${selectedMethods.includes(method.id)
//                     ? splitPayment
//                       ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
//                       : 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow scale-105'
//                     : darkMode
//                       ? 'bg-gray-700/30 border-gray-600 hover:shadow hover:-translate-y-0.5'
//                       : 'bg-gray-100 border-gray-200 hover:shadow hover:-translate-y-0.5'
//                   } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 <div className={`mb-1 ${selectedMethods.includes(method.id)
//                     ? splitPayment ? 'text-purple-600' : 'text-green-600'
//                     : darkMode ? 'text-white' : 'text-gray-800'
//                   }`}>
//                   {method.icon}
//                 </div>
//                 <div className={`text-xs text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//                   {method.label}
//                 </div>
//                 {splitPayment && selectedMethods.includes(method.id) && splitAmounts[method.id] && (
//                   <div className="text-xs font-semibold text-purple-600 mt-1">
//                     Rs. {formatCurrency(splitAmounts[method.id])}
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Split Amount Controls */}
//           {splitPayment && selectedMethods.length > 1 && (
//             <div className="mb-4 p-3 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
//               <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
//                 Split Amounts
//               </h3>
//               {selectedMethods.map(methodId => {
//                 const method = paymentMethods.find(m => m.id === methodId);
//                 return (
//                   <div key={methodId} className="flex items-center justify-between mb-2 last:mb-0">
//                     <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}:</span>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => updateSplitAmount(methodId, (splitAmounts[methodId] || 0) - 10)}
//                         disabled={processing}
//                         className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold"
//                       >
//                         -
//                       </button>
//                       <input
//                         type="number"
//                         value={splitAmounts[methodId] || 0}
//                         onChange={(e) => updateSplitAmount(methodId, parseFloat(e.target.value) || 0)}
//                         disabled={processing}
//                         className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700"
//                         step="10"
//                       />
//                       <button
//                         onClick={() => updateSplitAmount(methodId, (splitAmounts[methodId] || 0) + 10)}
//                         disabled={processing}
//                         className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold"
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}

//               <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-700 dark:text-gray-300">Remaining:</span>
//                   <span className={`font-semibold ${Math.abs(getRemainingAmount()) < 0.01 ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                     Rs. {formatCurrency(getRemainingAmount())}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Selected Method Indicator */}
//           {(selectedMethods.length > 0 || processing) && (
//             <div className={`p-2 rounded-md mb-3 ${splitPayment
//                 ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
//                 : darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50 border-blue-200'
//               }`}>
//               <div className="flex items-center justify-center">
//                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
//                   {processing ? 'Processing' : splitPayment ? 'Split Payment with' : 'Selected'}:
//                 </span>
//                 <span className={`font-semibold ${splitPayment ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
//                   }`}>
//                   {selectedMethods.map(methodId =>
//                     paymentMethods.find(m => m.id === methodId)?.label
//                   ).join(' + ')}
//                 </span>
//                 {processing && <span className="ml-2 animate-pulse">...</span>}
//               </div>
//               {processing && (
//                 <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
//                   Creating invoice and processing payment
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Total Amount */}
//           <div className={`p-3 rounded-md mb-4 border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
//             }`}>
//             <div className="flex justify-between mb-1 text-xs">
//               <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Subtotal:</span>
//               <span className="font-medium">Rs. {formatCurrency(subtotal)}</span>
//             </div>
//             <div className="flex justify-between mb-1 text-xs">
//               <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Discount:</span>
//               <span className="font-medium text-red-500">-Rs. {formatCurrency(discount)}</span>
//             </div>
//             <div className="flex justify-between mb-1 text-xs">
//               <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Tax:</span>
//               <span className="font-medium">Rs. {formatCurrency(tax)}</span>
//             </div>
//             <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
//               <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total:</span>
//               <span className="font-bold text-green-600">Rs. {formatCurrency(total)}</span>
//             </div>
//           </div>

//           {/* Process Payment Button */}
//           <button
//             onClick={processPayment}
//             disabled={!isPaymentValid() || processing}
//             className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all ${isPaymentValid() && !processing
//                 ? splitPayment
//                   ? 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
//                   : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
//                 : 'bg-gray-400 cursor-not-allowed'
//               }`}
//           >
//             {processing ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                 Processing...
//               </div>
//             ) : splitPayment ? (
//               `Pay with ${selectedMethods.map(m => paymentMethods.find(pm => pm.id === m)?.label).join(' + ')}`
//             ) : (
//               `Pay with ${paymentMethods.find(m => m.id === selectedMethods[0])?.label}`
//             )}
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default PaymentModal;









import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal } from '../../actions/modalActions';
import { clearCart } from '../../actions/POS/cartActions';
import { addInvoice } from '../../actions/POS/invoiceActions';
import Modal from '../common/Modal';
import { FiCreditCard, FiDollarSign, FiGift, FiSmartphone, FiCheckCircle, FiBox, FiAperture, FiArrowLeft, FiDivide } from 'react-icons/fi';

const PaymentModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { modalProps } = useSelector(state => state.ui);

  const items = modalProps?.items || [];
  const subtotal = modalProps?.subtotal || 0;
  const discount = modalProps?.discount || 0;
  const tax = modalProps?.tax || 0;
  const total = Number(modalProps?.total || 0);
  const tabId = modalProps?.tabId;

  const [selectedMethods, setSelectedMethods] = useState(['cash']);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState({});
  const [processing, setProcessing] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const paymentMethods = [
    { id: 'cash', icon: <FiDollarSign className="w-5 h-5" />, label: 'Cash' },
    { id: 'card', icon: <FiCreditCard className="w-5 h-5" />, label: 'Card' },
    { id: 'lankaqr', icon: <FiAperture className="w-5 h-5" />, label: 'LankaQR' },
    { id: 'gift', icon: <FiGift className="w-5 h-5" />, label: 'Gift Card' },
    { id: 'paypal', icon: <FiBox className="w-5 h-5" />, label: 'PayPal' },
    { id: 'mobile', icon: <FiSmartphone className="w-5 h-5" />, label: 'Mobile Pay' }
  ];

  useEffect(() => {
    setSelectedMethods(['cash']);
    setSplitPayment(false);
    setSplitAmounts({});
  }, [tabId, total]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleBack = () => {
    if (!processing) {
      dispatch(closeModal());
    }
  };

  const togglePaymentMethod = (methodId) => {
    if (processing) return;

    if (methodId === 'split') {
      setSplitPayment(!splitPayment);
      if (!splitPayment) {
        setSelectedMethods(['cash', 'card']);
        setSplitAmounts({
          cash: total / 2,
          card: total / 2
        });
      } else {
        setSelectedMethods([]);
        setSplitAmounts({});
      }
      return;
    }

    if (splitPayment) {
      if (selectedMethods.includes(methodId)) {
        const newMethods = selectedMethods.filter(id => id !== methodId);
        setSelectedMethods(newMethods);

        const newAmounts = { ...splitAmounts };
        delete newAmounts[methodId];
        setSplitAmounts(newAmounts);

        if (newMethods.length <= 1) {
          setSplitPayment(false);
          if (newMethods.length === 1) {
            setSelectedMethods([newMethods[0]]);
          }
        }
      } else {
        const newMethods = [...selectedMethods, methodId];
        setSelectedMethods(newMethods);

        const equalAmount = total / newMethods.length;
        const newAmounts = {};
        newMethods.forEach(method => {
          newAmounts[method] = equalAmount;
        });
        setSplitAmounts(newAmounts);
      }
    } else {
      setSelectedMethods([methodId]);
    }
  };

  const updateSplitAmount = (methodId, amount) => {
    if (amount < 0) amount = 0;
    if (amount > total) amount = total;

    const newAmounts = { ...splitAmounts, [methodId]: amount };

    const currentTotal = Object.values(newAmounts).reduce((sum, amt) => sum + amt, 0);
    const remaining = total - currentTotal + newAmounts[methodId];

    if (remaining < 0) {
      newAmounts[methodId] = total - (currentTotal - newAmounts[methodId]);
    }

    setSplitAmounts(newAmounts);
  };
 
  const getRemainingAmount = () => {
    const paidAmount = Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0);
    return total - paidAmount;
  };

  const isPaymentValid = () => {
    if (selectedMethods.length === 0) return false;

    if (splitPayment) {
      const paidAmount = Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0);
      return Math.abs(paidAmount - total) < 0.01;
    }

    return selectedMethods.length === 1;
  };

  const processPayment = async () => {
    if (!isPaymentValid() || processing) return;

    setProcessing(true);
    try {
      if (selectedMethods.includes('cash') && !splitPayment) {
         
        dispatch(closeModal());
        dispatch(openModal('CASH_CALC', {
          items,
          subtotal,
          discount,
          tax,
          total,
          tabId,
          paymentMethod: 'cash'
        }));
      } else if (splitPayment && selectedMethods.includes('cash')) {
        
        const cashAmount = splitAmounts.cash;
        dispatch(closeModal());
        dispatch(openModal('CASH_CALC', {
          items,
          subtotal,
          discount,
          tax,
          total: cashAmount, 
          tabId,
          paymentMethod: 'split',
          splitPayment: true,
          otherMethods: selectedMethods.filter(m => m !== 'cash').map(method => ({
            method,
            amount: splitAmounts[method]
          })),
          originalTotal: total
        }));
      } else {
         
        const paymentData = {
          items,
          subtotal,
          discount,
          tax,
          total,
          splitPayment: splitPayment,
          method: splitPayment ? 'split' : selectedMethods[0],
          amount: splitPayment ? 
            Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0) : 
            total,
          methods: splitPayment ? 
            selectedMethods.map(method => ({
              method,
              amount: splitAmounts[method]
            })) : 
            [],
          tabId
        };

        const invoiceResponse = await dispatch(addInvoice(paymentData));
        const invoiceData = invoiceResponse?.payload || invoiceResponse;
        setInvoiceData(invoiceData);

        dispatch(closeModal());

        dispatch(openModal('INVOICE', {
          items,
          subtotal,
          discount,
          tax,
          total,
          paymentMethod: splitPayment ? 'split' : selectedMethods[0],
          splitPayment: splitPayment ? {
            methods: selectedMethods.map(method => ({
              method,
              amount: splitAmounts[method]
            }))
          } : null,
          paidAmount: splitPayment ? 
            Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0) : 
            total,
          changeAmount: 0,
          tabId,
          invoiceData,
          autoPrint: true
        }));

        if (tabId) {
          dispatch(clearCart(tabId));
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Modal>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={processing}
              className={`p-1.5 rounded-md transition-all ${processing
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              title="Go back"
            >
              <FiArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="p-1.5 bg-gradient-to-br from-green-500 to-teal-600 rounded-md shadow">
              <FiCreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {splitPayment ? 'Split Payment' : 'Payment Method'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {splitPayment ? 'Split amount between methods' : 'Select payment method'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-3">
          {/* Split Payment Toggle */}
          <div className="mb-3">
            <button
              onClick={() => togglePaymentMethod('split')}
              disabled={processing}
              className={`w-full p-3 rounded-md transition-all border flex items-center justify-center gap-2 ${splitPayment
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow'
                  : darkMode
                    ? 'bg-gray-700/30 border-gray-600 hover:shadow hover:-translate-y-0.5'
                    : 'bg-gray-100 border-gray-200 hover:shadow hover:-translate-y-0.5'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FiDivide className={`w-5 h-5 ${splitPayment ? 'text-purple-600' : darkMode ? 'text-white' : 'text-gray-800'}`} />
              <span className={`font-medium ${splitPayment ? 'text-purple-600' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                Split Payment
              </span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => togglePaymentMethod(method.id)}
                disabled={processing}
                className={`p-3 rounded-md transition-all border flex flex-col items-center justify-center ${selectedMethods.includes(method.id)
                    ? splitPayment
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow scale-105'
                    : darkMode
                      ? 'bg-gray-700/30 border-gray-600 hover:shadow hover:-translate-y-0.5'
                      : 'bg-gray-100 border-gray-200 hover:shadow hover:-translate-y-0.5'
                  } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`mb-1 ${selectedMethods.includes(method.id)
                    ? splitPayment ? 'text-purple-600' : 'text-green-600'
                    : darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                  {method.icon}
                </div>
                <div className={`text-xs text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {method.label}
                </div>
                {splitPayment && selectedMethods.includes(method.id) && splitAmounts[method.id] && (
                  <div className="text-xs font-semibold text-purple-600 mt-1">
                    Rs. {formatCurrency(splitAmounts[method.id])}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Split Amount Controls */}
          {splitPayment && selectedMethods.length > 1 && (
            <div className="mb-4 p-3 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Split Amounts
              </h3>
              {selectedMethods.map(methodId => {
                const method = paymentMethods.find(m => m.id === methodId);
                return (
                  <div key={methodId} className="flex items-center justify-between mb-2 last:mb-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSplitAmount(methodId, (splitAmounts[methodId] || 0) - 10)}
                        disabled={processing}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={splitAmounts[methodId] || 0}
                        onChange={(e) => updateSplitAmount(methodId, parseFloat(e.target.value) || 0)}
                        disabled={processing}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        step="10"
                        min="0"
                        max={total}
                      />
                      <button
                        onClick={() => updateSplitAmount(methodId, (splitAmounts[methodId] || 0) + 10)}
                        disabled={processing}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Remaining:</span>
                  <span className={`font-semibold ${Math.abs(getRemainingAmount()) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                    Rs. {formatCurrency(getRemainingAmount())}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700 dark:text-gray-300">Total:</span>
                  <span className="font-semibold text-blue-600">Rs. {formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Method Indicator */}
          {(selectedMethods.length > 0 || processing) && (
            <div className={`p-2 rounded-md mb-3 ${splitPayment
                ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                : darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-blue-50 border-blue-200'
              }`}>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
                  {processing ? 'Processing' : splitPayment ? 'Split Payment with' : 'Selected'}:
                </span>
                <span className={`font-semibold ${splitPayment ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {selectedMethods.map(methodId =>
                    paymentMethods.find(m => m.id === methodId)?.label
                  ).join(' + ')}
                </span>
                {processing && <span className="ml-2 animate-pulse">...</span>}
              </div>
              {processing && (
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Creating invoice and processing payment
                </div>
              )}
            </div>
          )}

          {/* Total Amount */}
          <div className={`p-3 rounded-md mb-4 border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex justify-between mb-1 text-xs">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Subtotal:</span>
              <span className="font-medium">Rs. {formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Discount:</span>
              <span className="font-medium text-red-500">-Rs. {formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Tax:</span>
              <span className="font-medium">Rs. {formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total:</span>
              <span className="font-bold text-green-600">Rs. {formatCurrency(total)}</span>
            </div>
          </div>

          {/* Process Payment Button */}
          <button
            onClick={processPayment}
            disabled={!isPaymentValid() || processing}
            className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all flex items-center justify-center ${isPaymentValid() && !processing
                ? splitPayment
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : splitPayment ? (
              `Pay with ${selectedMethods.map(m => paymentMethods.find(pm => pm.id === m)?.label).join(' + ')}`
            ) : (
              `Pay with ${paymentMethods.find(m => m.id === selectedMethods[0])?.label}`
            )}
          </button>

          {/* Validation Message */}
          {!isPaymentValid() && selectedMethods.length > 0 && splitPayment && (
            <div className="mt-2 text-xs text-red-500 text-center">
              {Math.abs(getRemainingAmount()) >= 0.01 
                ? `Amounts don't match total. Remaining: Rs. ${formatCurrency(getRemainingAmount())}`
                : 'Please ensure all amounts are properly set'
              }
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
