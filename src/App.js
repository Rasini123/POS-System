import React from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "./store";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ModalProvider } from "./context/ModalContext";
import Layout from "./components/common/Layout";
import LoginModal from "./components/modals/LoginModal";
import ScannerModal from "./components/modals/ScannerModal";
import PaymentModal from "./components/modals/PaymentModal";
import InvoiceModal from "./components/modals/InvoiceModal";
import CashCalcModal from "./components/modals/CashCalcModal";
import CustomerModal from "./components/modals/CustomerModal";
import HistoryModal from "./components/modals/HistoryModal";
import SettingsModal from "./components/modals/SettingsModal";
import CouponModal from "./components/modals/CouponModal";
import AddProductModal from "./components/modals/AddProductModal";
import DiscountModal from "./components/modals/DiscountModal";
import { LOGIN_SUCCESS } from "./constants/authConstants";
import { openModal, closeModal } from "./actions/modalActions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function AppInitializer() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: JSON.parse(user), token }
      });
    }
  }, [dispatch]);
  return null;
}

function AppContent() {
  const dispatch = useDispatch();
  const { darkMode, activeModal } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);
  React.useEffect(() => {
    if (!isAuthenticated && !activeModal) {
      dispatch(openModal("LOGIN"));
    } else if (isAuthenticated && activeModal === "LOGIN") {
      dispatch(closeModal());
    }
  }, [isAuthenticated, activeModal, dispatch]);
  
  const renderModal = () => {
    switch (activeModal) {
      case "LOGIN":
        return <LoginModal />;
      case "SCANNER":
        return <ScannerModal />;
      case "PAYMENT":
        return <PaymentModal />;
      case "INVOICE":
        return <InvoiceModal />;
      case "CASH_CALC":
        return <CashCalcModal />;
      case "CUSTOMER":
        return <CustomerModal />;
      case "HISTORY":
        return <HistoryModal />;
      case "SETTINGS":
        return <SettingsModal />;
      case "DISCOUNT":
        return <DiscountModal />;
      case "COUPON":
        return <CouponModal />;
      case "ADD_PRODUCT":
        return <AddProductModal />;
      default:
        return null;
    }
  };
  
  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Layout />
      {renderModal()}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <CartProvider>
        <ThemeProvider>
          <ModalProvider>
            <AppInitializer />
            <AppContent />
          </ModalProvider>
        </ThemeProvider>
      </CartProvider>
    </Provider>
  );
}
export default App;
