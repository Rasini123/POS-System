
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';

const CustomerModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);

  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    loyaltyTier: 'bronze',
    points: '',
    membershipId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: "John Smith", email: "john@example.com", phone: "555-1234", address: "123 Main St", dob: "1985-05-15", tier: "gold", points: 2450, membershipId: "MEM-001" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "555-5678", address: "456 Oak Ave", dob: "1990-08-22", tier: "silver", points: 1280, membershipId: "MEM-002" },
    { id: 3, name: "Michael Brown", email: "michael@example.com", phone: "555-9012", address: "789 Pine Rd", dob: "1982-11-30", tier: "bronze", points: 420, membershipId: "MEM-003" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "555-3456", address: "321 Elm St", dob: "1995-03-10", tier: "platinum", points: 5120, membershipId: "MEM-004" }
  ];

  const purchaseHistory = [
    { id: 1, product: "Ryzen 7 5800X", invoice: "INV-2023-0012", date: "12/03/2023", amount: 299.99 },
    { id: 2, product: "GeForce RTX 4070", invoice: "INV-2023-0011", date: "10/03/2023", amount: 599.99 },
    { id: 3, product: "32GB DDR5 RAM", invoice: "INV-2023-0009", date: "05/03/2023", amount: 129.99 }
  ];

  const rewards = [
    { id: 1, name: "10% Discount Coupon", expiry: "30/04/2023", code: "COUPON10" },
    { id: 2, name: "Free Shipping", expiry: "Valid on next purchase", code: "ACTIVE" }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCustomer = () => {
    if (!customerData.name) {
      alert('Customer name is required!');
      return;
    }

    alert(`Customer ${customerData.name} saved successfully!`);
    dispatch(closeModal());
  };

  const handleSelectCustomer = (customer) => {
    setCustomerData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      dob: customer.dob,
      loyaltyTier: customer.tier,
      points: customer.points.toString(),
      membershipId: customer.membershipId
    });
  };

  return (
    <Modal size="lg">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <i className="fas fa-users"></i> Customer Management & Loyalty
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
          <i className="fas fa-id-card"></i> Customer Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            name="name"
            value={customerData.name}
            onChange={handleInputChange}
            placeholder="Customer Name"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="email"
            name="email"
            value={customerData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="tel"
            name="phone"
            value={customerData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="text"
            name="address"
            value={customerData.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="date"
            name="dob"
            value={customerData.dob}
            onChange={handleInputChange}
            placeholder="Date of Birth"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
          <i className="fas fa-gift"></i> Loyalty Program
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            name="loyaltyTier"
            value={customerData.loyaltyTier}
            onChange={handleInputChange}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="bronze">Bronze Tier</option>
            <option value="silver">Silver Tier</option>
            <option value="gold">Gold Tier</option>
            <option value="platinum">Platinum Tier</option>
          </select>

          <input
            type="number"
            name="points"
            value={customerData.points}
            onChange={handleInputChange}
            placeholder="Loyalty Points"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <input
            type="text"
            name="membershipId"
            value={customerData.membershipId}
            onChange={handleInputChange}
            placeholder="Membership ID"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
          <i className="fas fa-history"></i> Purchase History
        </h3>

        <div className={`max-h-40 overflow-y-auto border rounded-lg ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
          }`}>
          {purchaseHistory.map(purchase => (
            <div key={purchase.id} className={`p-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-600 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-200'
              }`}>
              <div>
                <div className="font-semibold dark:text-white">{purchase.product}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {purchase.invoice} | {purchase.date}
                </div>
              </div>
              <div className="font-semibold text-green-500">Rs. {purchase.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
          <i className="fas fa-receipt"></i> Rewards & Promotions
        </h3>

        <div className={`max-h-40 overflow-y-auto border rounded-lg ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
          }`}>
          {rewards.map(reward => (
            <div key={reward.id} className={`p-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-600 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-200'
              }`}>
              <div>
                <div className="font-semibold dark:text-white">{reward.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Expires: {reward.expiry}
                </div>
              </div>
              <div className="font-semibold text-blue-500">{reward.code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
          <i className="fas fa-search"></i> Search Customers
        </h3>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full px-3 py-2 mb-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <div className={`max-h-40 overflow-y-auto border rounded-lg ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'
          }`}>
          {filteredCustomers.length === 0 ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              No customers found
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-3 border-b flex justify-between items-center cursor-pointer ${darkMode ? 'border-gray-600 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-200'
                  }`}
              >
                <div>
                  <div className="font-semibold dark:text-white">{customer.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.email} | {customer.phone}
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-500 uppercase">{customer.tier}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => dispatch(closeModal())}
          className="py-2 bg-red-100 text-red-700 border border-red-300 font-semibold rounded-lg transition-all hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveCustomer}
          className="py-2 bg-green-500 text-white font-semibold rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          Save Customer
        </button>
      </div>
    </Modal>
  );
};

export default CustomerModal;