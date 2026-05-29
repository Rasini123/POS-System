import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../actions/cartActions';
const CartItem = ({ item, darkMode }) => {
  const dispatch = useDispatch();
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const itemRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      dispatch(updateQuantity(item.id, newQuantity));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };
  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    // Only allow left swipe (negative delta)
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -80)); // Limit swipe distance
    }
  };
  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    setIsSwiping(false);
    const deltaX = currentXRef.current - startXRef.current;
    
    // If swiped beyond threshold, delete the item
    if (deltaX < -60) {
      dispatch(removeFromCart(item.id));
    } else {
      // Return to original position
      setSwipeOffset(0);
    }
  };
  const handleTouchCancel = () => {
    setIsSwiping(false);
    setSwipeOffset(0);
  };
  const handleDeleteClick = () => {
    dispatch(removeFromCart(item.id));
  };
  return (
    <div 
      ref={itemRef}
      className={`grid grid-cols-[40px_1fr_auto] gap-3 items-center p-3 rounded-lg mb-2 border transition-all relative overflow-hidden ${
        darkMode 
          ? 'bg-gray-700/30 border-gray-600' 
          : 'bg-gray-100 border-gray-200'
      }`}
      style={{ 
        transform: `translateX(${swipeOffset}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Product Image/Icon */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-700 to-green-500 text-white shadow-md flex-shrink-0">
        <i className={item.icon}></i>
      </div>
      
      {/* Product Details */}
      <div className="overflow-hidden min-w-0">
        <div className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {item.name}
        </div>
        <div className="text-green-500 text-xs font-semibold">
          Rs. {item.price.toFixed(2)}
        </div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleQuantityChange(-1)}
          className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg transition-all hover:bg-green-600 hover:shadow-md active:translate-y-0 flex-shrink-0"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-[24px] text-center text-sm font-medium">{item.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(1)}
          className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg transition-all hover:bg-green-600 hover:shadow-md active:translate-y-0 flex-shrink-0"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      
      {/* Delete Button (revealed on swipe) */}
      <div 
        className="absolute right-0 top-0 h-full w-20 bg-red-500 text-white flex items-center justify-center transition-all cursor-pointer"
        style={{ 
          right: swipeOffset < -10 ? '0' : '-80px',
          opacity: swipeOffset < -10 ? '1' : '0'
        }}
        onClick={handleDeleteClick}
      >
        <i className="fas fa-trash"></i>
      </div>
      
      {/* Swipe Hint */}
      {swipeOffset === 0 && (
        <div className="absolute inset-y-0 right-2 flex items-center opacity-30">
          <i className="fas fa-chevron-left text-gray-400"></i>
        </div>
      )}
    </div>
  );
};
export default CartItem;