import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCartWithSync } from '../../actions/POS/cartActions';
const BatchSelectionModal = ({ product, batches, darkMode, onClose, onBatchSelect }) => {
  const dispatch = useDispatch();

  const handleBatchSelect = (batchProduct) => {
    if (batchProduct.stock <= 0) {
      alert(`"${batchProduct.name}" - Batch ${batchProduct.batchId} is out of stock!`);
      return;
    }
    if (batchProduct.stock < 5) {
      const proceed = window.confirm(
        `"${batchProduct.name}" - Batch ${batchProduct.batchId} has low stock (${batchProduct.stock} items remaining). Continue adding to cart?`
      );
      if (!proceed) return;
    }
    dispatch(addToCartWithSync(batchProduct));
    onClose();
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };
  const getDiscountText = (batch) => {
    if (batch.discountValue > 0) {
      if (batch.discountType === 'Percentage') {
        return `${batch.discountValue}% OFF`;
      } else {
        return `Rs. ${batch.discountValue} OFF`;
      }
    }
    return '';
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl p-5 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className="flex justify-between items-center mb-5">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Select Batch - {product.name}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto space-y-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => handleBatchSelect(batch)}
              className={`p-4 rounded-xl border-2 transition-all ${darkMode
                  ? 'bg-gray-700 hover:bg-gray-650 border-gray-600 hover:border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-blue-400'
                } ${batch.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Header: Batch ID and Stock */}
              <div className="flex justify-between items-center mb-3">
                <span className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Batch {batch.batchId}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${batch.stock <= 0 ? 'bg-red-500 text-white' :
                    batch.stock < 5 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                  {batch.stock <= 0 ? 'Out of Stock' : `Stock: ${batch.stock}`}
                </span>
              </div>

              {/* Price Section - Larger and More Prominent */}
              <div className="mb-3 pb-3 border-b dark:border-gray-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-2xl font-bold text-green-500`}>
                    Rs. {batch.discountedPrice.toFixed(2)}
                  </span>

                  {batch.discountedPrice < batch.price && (
                    <>
                      <span className="text-lg line-through text-gray-400">
                        Rs. {batch.price.toFixed(2)}
                      </span>
                      {getDiscountText(batch) && (
                        <span className="text-sm font-bold text-red-500 bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                          {getDiscountText(batch)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className={`block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Expiry Date
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {formatDate(batch.expiryDate)}
                  </span>
                </div>

                <div>
                  <span className={`block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Warehouse
                  </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {batch.Whcode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${darkMode
                ? 'bg-gray-600 text-white hover:bg-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default BatchSelectionModal;