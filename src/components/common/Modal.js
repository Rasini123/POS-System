
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';

const Modal = ({ children, size = 'md' }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);

  const sizeClasses = {
    sm: 'w-11/12 md:w-96',
    md: 'w-11/12 md:w-[450px]',
    lg: 'w-11/12 md:w-[800px]',
    xl: 'w-11/12 md:w-[95vw] h-[95vh]'
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-2 md:p-4">
      <div 
        className={`${sizeClasses[size]} rounded-2xl p-4 md:p-5 relative max-h-[85vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border shadow-2xl backdrop-blur-sm`}
      >
        {/* <button 
          onClick={handleClose}
          className="absolute top-2 md:top-3 right-2 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm transition-all hover:rotate-90 hover:shadow-lg z-10"
        >
          <i className="fas fa-times"></i>
        </button> */}
        {children}
      </div>
    </div>
  );
};

export default Modal;