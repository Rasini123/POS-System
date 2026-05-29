import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../actions/authActions';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';

const LoginModal = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    dispatch(clearError());

  }, [dispatch]);


  useEffect(() => {
    if (isAuthenticated) {
      dispatch(closeModal());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(username, password));

  };

  const handleDemoLogin = () => {
    // Bypass login with demo credentials
    dispatch(login('admin', 'admin123'));
  };

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <Modal onClose={handleClose}>
      <div className="text-center">
        <div className="mb-5">
          <i className="fas fa-microchip text-4xl text-green-500 mb-3 text-shadow"></i>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">POS System</h2>
          <p className="text-gray-500 dark:text-gray-400">Point of Sale System</p>
        </div>
        <form onSubmit={handleLogin} className="mt-5">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={loading}
          />
          {error && (
            <div className="text-red-500 mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 py-3 bg-gray-500 dark:bg-gray-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </span>
            ) : (
              'Demo Login'
            )}
          </button>
        </form>
        <div className="text-xs text-green-700/80 dark:text-green-400/80 mt-6">
          <p>© 2025 Batik Clothing Shop. All rights reserved.</p>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;