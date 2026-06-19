import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiUsers, FiShield, FiUserCheck, FiUserX, FiX, FiSearch, FiCheckCircle, FiEdit } from 'react-icons/fi';
import { getUsersList, addUser, updateUserStatus } from '../../services/userService';
const UserAccessPage = () => {
  const { darkMode } = useSelector(state => state.ui);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ 
    UserName: '', 
    Password: '', 
    RoleName: 'Cashier',
    IsActive: 'A'
  });
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);

  // Load users from localStorage
  const loadUsersList = async () => {
    try {
      const response = await getUsersList();
      if (response && response.ResultSet) {
        // Normalize RoleName to strictly be "Admin" or "Cashier"
        const normalizedUsers = response.ResultSet.map(u => ({
          ...u,
          RoleName: u.RoleName?.toLowerCase() === 'admin' ? 'Admin' : 'Cashier'
        }));
        setUsers(normalizedUsers);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const openModal = (user = null) => {
    if (user && user.UserId) {
      setIsEditing(true);
      setCurrentUser({ ...user, Password: '' });
    } else {
      setIsEditing(false);
      setCurrentUser({ UserName: '', Password: '', RoleName: 'Cashier', IsActive: 'A' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openStatusModal = (user) => {
    setUserToUpdate(user);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => setIsStatusModalOpen(false);

  const handleSave = async () => {
    if (!currentUser.UserName.trim() || (!isEditing && !currentUser.Password.trim()) || !currentUser.RoleName) {
      showAlertMessage('Please fill all required fields before saving.', 'error');
      return;
    }

    // Check username uniqueness if adding new
    if (!isEditing) {
      const existing = users.find(u => u.UserName.toLowerCase() === currentUser.UserName.toLowerCase().trim());
      if (existing) {
        showAlertMessage('Username already exists. Please choose a different one.', 'error');
        return;
      }
    }

    try {
      if (isEditing) {
        await updateUserStatus(
          currentUser.UserId,
          currentUser.UserName.trim(),
          currentUser.Password.trim() || "12345",
          currentUser.RoleName,
          currentUser.IsActive || 'A'
        );
        showAlertMessage(`User "${currentUser.UserName}" updated successfully!`, 'success');
      } else {
        await addUser(
          currentUser.UserName.trim(),
          currentUser.Password.trim(),
          currentUser.RoleName
        );
        showAlertMessage(`User "${currentUser.UserName}" created successfully!`, 'success');
      }
      closeModal();
      loadUsersList();
    } catch (error) {
      showAlertMessage(`Failed to ${isEditing ? 'update' : 'create'} user. Please try again.`, 'error');
    }
  };

  const handleStatusChange = async () => {
    if (userToUpdate) {
      try {
        const newStatus = userToUpdate.IsActive === 'A' ? 'I' : 'A';
        await updateUserStatus(
          userToUpdate.UserId,
          userToUpdate.UserName,
          userToUpdate.Password || "12345", // Use default or original if missing
          userToUpdate.RoleName,
          newStatus
        );
        closeStatusModal();
        loadUsersList();
        const action = newStatus === 'I' ? 'deactivated' : 'activated';
        showAlertMessage(`User "${userToUpdate.UserName}" ${action} successfully!`, 'success');
      } catch (error) {
        showAlertMessage('Failed to change user status. Please try again.', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.RoleName.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && user.IsActive === 'A';
    if (activeFilter === 'inactive') return matchesSearch && user.IsActive !== 'A';

    return matchesSearch && user.RoleName === activeFilter;
  });

  const getAlertBgColor = () => {
    switch (alertType) {
      case 'success': return 'bg-green-100 border-green-300 dark:bg-green-900/70 dark:border-green-700';
      case 'error': return 'bg-red-100 border-red-300 dark:bg-red-900/70 dark:border-red-700';
      default: return 'bg-gray-100 border-gray-300 dark:bg-gray-900/70 dark:border-gray-700';
    }
  };

  const getAlertTextColor = () => {
    switch (alertType) {
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'error': return 'text-red-800 dark:text-red-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`flex flex-col p-6 rounded-2xl shadow-xl h-full transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    } border overflow-hidden`}>

      {/* Alert Message */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down w-full max-w-md px-4">
          <div className={`flex items-center justify-between p-4 rounded-xl shadow-lg border ${getAlertBgColor()} ${getAlertTextColor()}`}>
            <div className="flex items-center gap-3">
              {alertType === 'success' ? (
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p className="font-semibold text-sm">{alertMessage}</p>
            </div>
            <button onClick={() => setShowAlert(false)} className="hover:opacity-70 transition-opacity">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Access Management</h1>
            <p className="text-xs opacity-75">Create and manage role-based user accounts</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95"
        >
          <FiPlus className="w-5 h-5" /> Add New User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-2xl p-4 shadow-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-xs opacity-60 font-medium">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-xs opacity-60 font-medium text-green-600">Active Accounts</p>
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.IsActive === 'A').length}</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-xs opacity-60 font-medium text-indigo-500">Admins</p>
          <p className="text-2xl font-bold text-indigo-500">{users.filter(u => u.RoleName === 'Admin').length}</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-md border ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className="text-xs opacity-60 font-medium text-teal-500">Cashiers</p>
          <p className="text-2xl font-bold text-teal-500">{users.filter(u => u.RoleName === 'Cashier').length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'Admin', 'Cashier', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeFilter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All Roles' : f === 'inactive' ? 'Deactivated' : f}
            </button>
          ))}
        </div>
      </div>

      {/* User Table Container */}
      <div className="flex-grow overflow-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table className="hidden md:table w-full text-left border-collapse">
          <thead>
            <tr className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}`}>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Username</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredUsers.map((user) => (
              <tr key={user.UserId} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold opacity-70">
                  {user.UserId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {user.UserName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    user.RoleName === 'Admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {user.RoleName === 'Admin' ? <FiShield className="w-3.5 h-3.5" /> : <FiUsers className="w-3.5 h-3.5" />}
                    {user.RoleName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    user.IsActive === 'A'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {user.IsActive === 'A' ? <FiUserCheck className="w-3.5 h-3.5" /> : <FiUserX className="w-3.5 h-3.5" />}
                    {user.IsActive === 'A' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(user)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <FiEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => openStatusModal(user)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        user.IsActive === 'A'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {user.IsActive === 'A' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {filteredUsers.map((user) => (
            <div key={user.UserId} className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{user.UserName}</h3>
                  <p className="text-xs opacity-60 mt-0.5">User ID: {user.UserId}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  user.RoleName === 'Admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {user.RoleName === 'Admin' ? <FiShield className="w-3.5 h-3.5" /> : <FiUsers className="w-3.5 h-3.5" />}
                  {user.RoleName}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  user.IsActive === 'A'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {user.IsActive === 'A' ? <FiUserCheck className="w-3.5 h-3.5" /> : <FiUserX className="w-3.5 h-3.5" />}
                  {user.IsActive === 'A' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => openModal(user)}
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 flex justify-center items-center gap-1"
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => openStatusModal(user)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                    user.IsActive === 'A'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {user.IsActive === 'A' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold opacity-70">No users found</p>
            <p className="text-xs opacity-60">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up ${
            darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">{isEditing ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={closeModal} className="hover:opacity-75 transition-opacity">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={currentUser.UserName}
                  onChange={e => setCurrentUser({ ...currentUser, UserName: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">
                  Password {isEditing && <span className="text-gray-400 font-normal lowercase">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={currentUser.Password}
                  onChange={e => setCurrentUser({ ...currentUser, Password: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Role Name</label>
                <select
                  value={currentUser.RoleName}
                  onChange={e => setCurrentUser({ ...currentUser, RoleName: e.target.value })}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-900/40">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                {isEditing ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Modal */}
      {isStatusModalOpen && userToUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center ${
            darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-4 ${
              userToUpdate.IsActive === 'A' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'
            }`}>
              {userToUpdate.IsActive === 'A' ? <FiUserX className="w-6 h-6" /> : <FiUserCheck className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold mb-2">
              {userToUpdate.IsActive === 'A' ? 'Deactivate User?' : 'Activate User?'}
            </h3>
            <p className="text-xs opacity-75 mb-6">
              Are you sure you want to {userToUpdate.IsActive === 'A' ? 'deactivate' : 'activate'} user account for <strong>{userToUpdate.UserName}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeStatusModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className={`flex-1 py-2.5 text-white rounded-xl font-semibold text-sm transition-all ${
                  userToUpdate.IsActive === 'A'
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessPage;
