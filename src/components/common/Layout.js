import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ProductsSection from "../sections/ProductsSection";
import CartSection from "../sections/CartSection";
import UserAccessPage from "../sections/UserAccessPage";
import History from "../../Pages/History/history";
import Settings from "../../Pages/Settings/Settings";
import AddProduct from "../../Pages/Add_Product/product";
import ReportsPage from "../../Pages/Report/ReportsPage";
import ReturnsPage from "../../Pages/Returns/returns";

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const { tabs } = useSelector((state) => state.cart);
  const { activePage: reduxActivePage, posLayout } = useSelector((state) => state.ui);
  const isCartFocus = posLayout === 'cart-focus';
  const [activePage, setActivePage] = useState("POS");
  const [cartHidden, setCartHidden] = useState(false);

  const hasItemsInAnyTab = tabs && tabs.some((tab) => tab.items.length > 0);

  useEffect(() => {
    if (reduxActivePage && reduxActivePage !== activePage) {
      setActivePage(reduxActivePage);
    }
  }, [reduxActivePage]);

  useEffect(() => {
    setActivePage("POS");
  }, [user]);

  return (
    <div className="container mx-auto p-2 max-w-screen-xl min-h-screen md:h-screen flex flex-col overflow-x-hidden">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 gap-2 md:gap-4 lg:gap-1 mt-2 overflow-y-auto md:overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 w-full md:w-auto z-20">
          <Sidebar setActivePage={setActivePage} />
        </div>

        {/* Main Content */}
        {activePage === "POS" && isCartFocus ? (
          /* Cart Focus Mode: full-width cart with scan/search panel on top */
          <div className="flex-1 overflow-hidden min-h-[500px] md:min-h-0">
            <CartSection cartFocusMode={true} />
          </div>
        ) : (
          <>
            <div
              className={`flex-1 overflow-visible md:overflow-hidden transition-all duration-300 min-h-[600px] md:min-h-0 ${cartHidden || activePage !== "POS" ? "w-full" : ""
                }`}
            >
              {activePage === "POS" && (
                <ProductsSection
                  onExpandProduct={() => setCartHidden(true)}
                  onProductAdded={() => setCartHidden(false)}
                  onCancelExpand={() => setCartHidden(true)}
                />
              )}
              {activePage === "USER_ACCESS" && <UserAccessPage />}
              {activePage === "HISTORY" && <History />}
              {activePage === "RETURNS" && <ReturnsPage />}
              {activePage === "SETTINGS" && <Settings />}
              {activePage === "ADD_PRODUCT" && <AddProduct />}
              {activePage === "REPORTS" && <ReportsPage />}
            </div>
            
            {/* Cart Section */}
            {activePage === "POS" && !cartHidden && (
              <div className="flex-shrink-0 w-full md:w-80 transition-all duration-300 overflow-visible md:overflow-y-auto mt-4 md:mt-0 pb-20 md:pb-0 min-h-[400px] md:min-h-0">
                <CartSection />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Layout;