
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';

const HistoryModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);

  const transactions = [
    { id: 'TXN-2023-001', date: '2023-03-15 14:30', amount: 899.97, items: 3, status: 'Completed' },
    { id: 'TXN-2023-002', date: '2023-03-15 13:45', amount: 299.99, items: 1, status: 'Completed' },
    { id: 'TXN-2023-003', date: '2023-03-15 12:20', amount: 599.99, items: 1, status: 'Refunded' }
  ];

  return (
    <Modal size="lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <i className="fas fa-history"></i> Transaction History
      </h2>
      
      <div className={`rounded-lg border overflow-hidden ${
        darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
      }`}>
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
            {transactions.map(transaction => (
              <tr key={transaction.id} className={`border-t ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-700/50' 
                  : 'border-gray-200 hover:bg-gray-200'
              }`}>
                <td className="p-3 dark:text-white">{transaction.id}</td>
                <td className="p-3 dark:text-white">{transaction.date}</td>
                <td className="p-3 dark:text-white">Rs. {transaction.amount.toFixed(2)}</td>
                <td className="p-3 dark:text-white">{transaction.items}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    transaction.status === 'Completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default HistoryModal;