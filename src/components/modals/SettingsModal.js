
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import { setPosLayout } from '../../actions/uiActions';
import Modal from '../common/Modal';
import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE } from '../../constants/config';

const SettingsModal = () => {
  const dispatch = useDispatch();
  const { darkMode, posLayout } = useSelector(state => state.ui);

  const [settings, setSettings] = useState({
    storeName: COMPANY_NAME,
    storeAddress: COMPANY_ADDRESS,
    storePhone: COMPANY_PHONE,
    taxRate: 8,
    receiptTemplate: 'standard',
    scannerMode: 'auto',
    currencyFormat: 'lkr'
  });

  const [selectedLayout, setSelectedLayout] = useState(posLayout || 'tile');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    dispatch(setPosLayout(selectedLayout));
    alert('Settings saved successfully!');
    dispatch(closeModal());
  };

  const cardBase = `cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col gap-2`;
  const cardActive = darkMode
    ? 'border-green-500 bg-green-900/20'
    : 'border-green-500 bg-green-50';
  const cardInactive = darkMode
    ? 'border-gray-600 bg-gray-700/40 hover:border-gray-500'
    : 'border-gray-200 bg-gray-50 hover:border-gray-400';

  return (
    <Modal size="lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <i className="fas fa-cog"></i> System Settings
      </h2>

      {/* POS Interface Design */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1 dark:text-white">POS Interface Design</h3>
        <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Choose how the POS screen is displayed for cashiers.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Tile Version */}
          <div
            className={`${cardBase} ${selectedLayout === 'tile' ? cardActive : cardInactive}`}
            onClick={() => setSelectedLayout('tile')}
          >
            {/* Mini preview */}
            <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'} h-20 flex gap-1 p-1`}>
              <div className={`flex-1 rounded flex flex-col gap-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div className={`h-2 rounded mx-1 mt-1 ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                <div className="grid grid-cols-3 gap-1 p-1 flex-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`rounded ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                  ))}
                </div>
              </div>
              <div className={`w-10 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex flex-col gap-1 p-1`}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-2 rounded ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Tile Version
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Products grid + cart side panel
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLayout === 'tile' ? 'border-green-500' : darkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                {selectedLayout === 'tile' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
              </div>
            </div>
          </div>

          {/* Cart Focus Version */}
          <div
            className={`${cardBase} ${selectedLayout === 'cart-focus' ? cardActive : cardInactive}`}
            onClick={() => setSelectedLayout('cart-focus')}
          >
            {/* Mini preview */}
            <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-200'} h-20 flex gap-1 p-1`}>
              <div className={`flex-1 rounded flex flex-col gap-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div className={`h-2 rounded mx-1 mt-1 ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                <div className="flex flex-col gap-1 p-1 flex-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`h-3 rounded ${darkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                  ))}
                </div>
                <div className={`h-4 rounded mx-1 mb-1 ${darkMode ? 'bg-green-700' : 'bg-green-400'}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Cart Focus
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Full-screen cart, scan &amp; search only
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLayout === 'cart-focus' ? 'border-green-500' : darkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                {selectedLayout === 'cart-focus' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Store Information</h3>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <input
            type="text"
            name="storeName"
            value={settings.storeName}
            onChange={handleInputChange}
            placeholder="Store Name"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="text"
            name="storeAddress"
            value={settings.storeAddress}
            onChange={handleInputChange}
            placeholder="Store Address"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="text"
            name="storePhone"
            value={settings.storePhone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Tax Settings</h3>

        <input
          type="number"
          name="taxRate"
          value={settings.taxRate}
          onChange={handleInputChange}
          placeholder="Tax Rate %"
          step="0.01"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Receipt Settings</h3>

        <select
          name="receiptTemplate"
          value={settings.receiptTemplate}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="standard">Standard Receipt</option>
          <option value="detailed">Detailed Receipt</option>
          <option value="minimal">Minimal Receipt</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Scanner Settings</h3>

        <select
          name="scannerMode"
          value={settings.scannerMode}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="auto">Auto-detect Scanner</option>
          <option value="manual">Manual Input Only</option>
          <option value="camera">Camera Scanner</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Display Settings</h3>

        <select
          name="currencyFormat"
          value={settings.currencyFormat}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="lkr">LKR (Rs.)</option>
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
        </select>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        <i className="fas fa-save"></i> Save Settings
      </button>
    </Modal>
  );
};

export default SettingsModal;
