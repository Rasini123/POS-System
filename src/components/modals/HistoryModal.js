
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal } from '../../actions/modalActions';
import Modal from '../common/Modal';
import { invoiceService } from '../../services/POS/invoiceService';

const HistoryModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const products = useSelector(state => state.product?.allProducts || []);

  const [transactions, setTransactions] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [billsData, itemsData] = await Promise.all([
          invoiceService.getAllBills(),
          invoiceService.getAllBillItems()
        ]);
        // data may be an array or an object containing arrays
        const list = Array.isArray(billsData) ? billsData : (billsData?.Bills || billsData?.ResultSet || []);
        const bItems = Array.isArray(itemsData) ? itemsData : (itemsData?.ResultSet || itemsData || []);
        
        if (mounted) {
          setTransactions(list);
          setBillItems(bItems);
        }
      } catch (err) {
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleRowClick = (transaction) => {
    // Find items for this specific bill
    const itemsForThisTxn = billItems.filter(bi => 
      String(bi.BillId) === String(transaction.BillId) || 
      String(bi.BillNo) === String(transaction.BillNo)
    );

    const mappedItems = itemsForThisTxn.map(bi => {
      const prod = products.find(p => String(p.ProductId) === String(bi.ProductId)) || {};
      return {
        id: bi.BillItemId || bi.ProductId,
        name: prod.ProductName || `Prod-${bi.ProductId}`,
        quantity: Number(bi.Qty || 1),
        price: Number(bi.UnitPrice || 0),
        discountedPrice: Number(bi.UnitPrice || 0)
      };
    });

    const netAmount = Number(transaction.NetAmount ?? transaction.TotalAmount ?? 0);
    const discountAmt = Number(transaction.DiscountAmount ?? 0);
    const totalAmt = Number(transaction.TotalAmount ?? netAmount + discountAmt);

    // Open invoice receipt view
    dispatch(openModal('INVOICE', {
      items: mappedItems,
      subtotal: totalAmt, 
      total: netAmount,
      discount: discountAmt,
      paidAmount: netAmount, // fallback
      paymentMethod: transaction.PaymentType || 'CASH'
    }));
  };

  return (
    <Modal size="lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <i className="fas fa-history"></i> Transaction History
      </h2>
      
      <div className={`rounded-lg border overflow-hidden ${
        darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
      }`}>
        {loading ? (
          <div className="p-4 text-center">Loading transactions...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">Error loading transactions: {error}</div>
        ) : (
          <table className="w-full">
          <thead>
            <tr className={darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}>
              <th className="p-3 text-left">Transaction ID</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => {
              const id = transaction.BillNo || transaction.BillId || transaction.id || `txn-${idx}`;
              const date = transaction.BillDate || transaction.BillCreatedDate || transaction.Date || transaction.createdAt || '';
              const amount = Number(transaction.NetAmount ?? transaction.TotalAmount ?? transaction.NetAmountWithTax ?? transaction.NetAmountWithCurrency ?? transaction.NetAmt ?? 0);
              const itemsCount = transaction.BillItems?.length ?? transaction.items ?? transaction.qty ?? '-';
              const status = transaction.Status || transaction.PaymentType || transaction.status || 'Completed';

              return (
                <tr 
                  key={id} 
                  onClick={() => handleRowClick(transaction)}
                  className={`border-t cursor-pointer transition-colors ${
                  darkMode 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-300'
                }`}>
                  <td className="p-3 dark:text-white">{id}</td>
                  <td className="p-3 dark:text-white">{date}</td>
                  <td className="p-3 dark:text-white">Rs. {Number(amount).toFixed(2)}</td>
                  <td className="p-3 dark:text-white">{itemsCount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      status === 'Completed' || status === 'CASH' || status === 'CARD' || status === 'SPLIT'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal;