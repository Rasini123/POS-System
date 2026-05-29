
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../actions/POS/cartActions';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';

const ScannerModal = () => {
  const dispatch = useDispatch();
  const { products } = useSelector(state => state.products);
  const [scannedCode, setScannedCode] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Ready');
  const [scannedProduct, setScannedProduct] = useState(null);

  const handleScannerInput = (code) => {
    if (!code) return;

    setScannerStatus('Processing...');


    const product = products.find(p =>
      p.sku.toLowerCase() === code.toLowerCase() ||
      p.id.toString() === code
    );

    if (product) {
      setScannerStatus('Product Found!');
      setScannedProduct(product);
    } else {
      setScannerStatus('Product not found');
      setTimeout(() => setScannerStatus('Ready'), 2000);
    }
  };

  const handleAddScannedProduct = () => {
    if (scannedProduct) {
      dispatch(addToCart(scannedProduct));
      dispatch(closeModal());
      setScannedCode('');
      setScannedProduct(null);
      setScannerStatus('Ready');
    }
  };

  return (
    <Modal>
      <h2 className="text-xl font-bold mb-2 dark:text-white">Barcode/QR Scanner</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Scan product barcode or manually enter code</p>

      <div className="w-56 h-36 bg-gray-200 dark:bg-gray-700 rounded-xl border-2 border-green-500 shadow-md mx-auto my-4 relative overflow-hidden">
        <div className="absolute w-full h-1 bg-orange-400 top-1/2 shadow-[0_0_10px_#ff9e00] rounded animate-scan"></div>
      </div>

      <div className={`p-3 rounded-lg mb-4 border ${scannerStatus.includes('Found')
          ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
          : 'bg-gray-100 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600'
        }`}>
        <p className="dark:text-white">Scanner Status: <span>{scannerStatus}</span></p>
      </div>

      <input
        type="text"
        value={scannedCode}
        onChange={(e) => {

          setScannedCode(e.target.value);
          if (e.target.value.length > 3) {
            setTimeout(() => handleScannerInput(e.target.value.trim()), 500);
          }
        }}
        onKeyPress={(e) => e.key === 'Enter' && handleScannerInput(scannedCode.trim())}
        placeholder="Scanned barcode will appear here..."
        className="w-full px-4 py-3 mb-4 border-2 border-green-500 rounded-lg text-center bg-green-50 dark:bg-green-900/20 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white"
        autoFocus
      />

      <button
        onClick={handleAddScannedProduct}
        className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition-all hover:bg-green-600 hover:shadow-md flex items-center justify-center gap-2"
        disabled={!scannedProduct}
      >
        <i className="fas fa-plus"></i> Add to Cart
      </button>

      {scannedProduct && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
          <h4 className="font-semibold dark:text-white">Product Found:</h4>
          <p className="dark:text-white">{scannedProduct.name}</p>
          <p className="text-green-600 dark:text-green-400 font-semibold">Rs. {scannedProduct.price.toFixed(2)}</p>
        </div>
      )}
    </Modal>
  );
};

export default ScannerModal;
