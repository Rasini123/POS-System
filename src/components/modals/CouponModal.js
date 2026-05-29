
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import { applyDiscount } from '../../actions/POS/cartActions';
import Modal from '../common/Modal';

const CouponModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { items } = useSelector(state => state.cart);
  
  const [couponCode, setCouponCode] = useState('');
  const [promoType, setPromoType] = useState('percentage');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = () => {
    if (couponCode === 'DISCOUNT10') {
      let discountAmount = 0;
      
      if (promoType === 'percentage') {
        discountAmount = subtotal * 0.10;
      } else if (promoType === 'fixed') {
        discountAmount = 50;
      } else if (promoType === 'bogo') {
        // Find cheapest item for BOGO
        const minPrice = Math.min(...items.map(item => item.price));
        discountAmount = minPrice;
      } else if (promoType === 'mixmatch') {
        discountAmount = 20;
      }
      
      dispatch(applyDiscount(discountAmount, 'amount'));
      dispatch(closeModal());
    } else {
      alert('Invalid coupon code!');
    }
  };

  return (
    <Modal>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Apply Coupon/Promotion</h2>
      
      <input
        type="text"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Enter coupon code"
        className="w-full px-3 py-2 mb-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      
      <select
        value={promoType}
        onChange={(e) => setPromoType(e.target.value)}
        className="w-full px-3 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="percentage">Percentage Discount</option>
        <option value="fixed">Fixed Amount</option>
        <option value="bogo">Buy One Get One</option>
        <option value="mixmatch">Mix and Match</option>
      </select>
      
      <button
        onClick={handleApplyCoupon}
        className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
      >
        Apply
      </button>
    </Modal>
  );
};

export default CouponModal;
