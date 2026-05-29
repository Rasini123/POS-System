import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { scanBarcode } from '../actions/cartActions';

const BarcodeScanner = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (error) {
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      dispatch(scanBarcode(manualBarcode.trim()));
      setManualBarcode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Barcode Scanner</h2>
        
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded"
            autoPlay
            playsInline
          />
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-2 bg-red-500 animate-pulse"></div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <form onSubmit={handleManualBarcodeSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode manually"
              className="flex-1 px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </form>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;