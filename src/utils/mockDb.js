/**
 * mockDb.js
 * LocalStorage mock database management for R.S.Bathik POS
 * Schema matches the SQL Server table structures provided by the user.
 */

const DB_KEYS = {
  USERS: 'rs_bathik_users',
  CATEGORIES: 'rs_bathik_categories',
  SUBCATEGORIES: 'rs_bathik_subcategories',
  PRODUCTS: 'rs_bathik_products',
  BILLS: 'rs_bathik_bills',
  BILL_ITEMS: 'rs_bathik_bill_items',
};

// Seed initial data if not present
export const initDb = () => {
  // 1. Seed Users
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const defaultUsers = [
      {
        pud_user_id: 1,
        pud_username: 'admin',
        pud_password: 'admin123', // In a real backend, this would be hashed
        pud_role_name: 'Admin',
        pud_is_active: 'A',
        pud_create_date: new Date().toISOString(),
        pud_created_by: 1
      },
      {
        pud_user_id: 2,
        pud_username: 'cashier',
        pud_password: 'cashier123',
        pud_role_name: 'Cashier',
        pud_is_active: 'A',
        pud_create_date: new Date().toISOString(),
        pud_created_by: 1
      }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. Seed Categories
  if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
    const defaultCategories = [
      { pcd_category_id: 1, pcd_category_name: 'Saree', pcd_is_active: 'A', pcd_create_date: new Date().toISOString() },
      { pcd_category_id: 2, pcd_category_name: 'Frock', pcd_is_active: 'A', pcd_create_date: new Date().toISOString() },
      { pcd_category_id: 3, pcd_category_name: 'Sarong', pcd_is_active: 'A', pcd_create_date: new Date().toISOString() },
      { pcd_category_id: 4, pcd_category_name: 'Shirt', pcd_is_active: 'A', pcd_create_date: new Date().toISOString() },
      { pcd_category_id: 5, pcd_category_name: 'Dress', pcd_is_active: 'A', pcd_create_date: new Date().toISOString() }
    ];
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  // 3. Seed Subcategories
  if (!localStorage.getItem(DB_KEYS.SUBCATEGORIES)) {
    const defaultSubcategories = [
      { psd_subcategory_id: 1, psd_category_id: 1, psd_subcategory_name: 'Silk Bathik', psd_is_active: 'A' },
      { psd_subcategory_id: 2, psd_category_id: 1, psd_subcategory_name: 'Cotton Bathik', psd_is_active: 'A' },
      { psd_subcategory_id: 3, psd_category_id: 2, psd_subcategory_name: 'Linen Frock', psd_is_active: 'A' },
      { psd_subcategory_id: 4, psd_category_id: 3, psd_subcategory_name: 'Premium Rayon', psd_is_active: 'A' },
      { psd_subcategory_id: 5, psd_category_id: 4, psd_subcategory_name: 'Casual Fit', psd_is_active: 'A' }
    ];
    localStorage.setItem(DB_KEYS.SUBCATEGORIES, JSON.stringify(defaultSubcategories));
  }

  // Helper base64 placeholder values for beautiful Batik items
  const batikBluePattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e3a8a'/><path d='M0,50 Q25,0 50,50 T100,50' fill='none' stroke='%2338bdf8' stroke-width='4'/><path d='M0,25 Q25,-25 50,25 T100,25' fill='none' stroke='%23fef08a' stroke-width='2'/><circle cx='50' cy='50' r='10' fill='%23facc15'/><circle cx='20' cy='30' r='5' fill='%23e2e8f0'/><circle cx='80' cy='70' r='6' fill='%23f8fafc'/></svg>";
  const batikMaroonPattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%237f1d1d'/><path d='M50,0 Q100,50 50,100 T50,0' fill='none' stroke='%23f87171' stroke-width='3'/><path d='M25,0 Q75,50 25,100 T25,0' fill='none' stroke='%23fbbf24' stroke-width='2'/><circle cx='50' cy='50' r='15' fill='%23b91c1c'/><polygon points='50,42 58,58 42,58' fill='%23fbbf24'/></svg>";
  const batikGreenPattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23064e3b'/><circle cx='50' cy='50' r='40' fill='none' stroke='%2334d399' stroke-dasharray='5,5' stroke-width='2'/><path d='M10,10 L90,90 M90,10 L10,90' stroke='%23fbbf24' stroke-width='2'/><circle cx='50' cy='50' r='10' fill='%23047857'/></svg>";
  const batikOrangePattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%237c2d12'/><circle cx='50' cy='50' r='30' fill='%23fb923c' opacity='0.5'/><circle cx='50' cy='50' r='15' fill='%23ea580c'/><path d='M0,0 Q50,100 100,0' fill='none' stroke='%23fef08a' stroke-width='3'/></svg>";
  const batikPurplePattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234c1d95'/><circle cx='50' cy='50' r='25' fill='%23c084fc'/><rect x='35' y='35' width='30' height='30' fill='none' stroke='%23fbbf24' stroke-width='2' transform='rotate(45 50 50)'/></svg>";

  // 4. Seed Products
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    const defaultProducts = [
      {
        ppd_product_id: 1,
        ppd_product_code: 'RSB-SAR-001',
        ppd_barcode: '8801122330012',
        ppd_product_name: 'Ocean Blue Silk Saree',
        ppd_category_id: 1,
        ppd_subcategory_id: 1,
        ppd_price: 12500.00,
        ppd_product_image: batikBluePattern,
        ppd_is_active: 'A',
        ppd_create_date: new Date().toISOString()
      },
      {
        ppd_product_id: 2,
        ppd_product_code: 'RSB-FRO-002',
        ppd_barcode: '8801122330029',
        ppd_product_name: 'Sunset Maroon Cotton Frock',
        ppd_category_id: 2,
        ppd_subcategory_id: 3,
        ppd_price: 6800.00,
        ppd_product_image: batikMaroonPattern,
        ppd_is_active: 'A',
        ppd_create_date: new Date().toISOString()
      },
      {
        ppd_product_id: 3,
        ppd_product_code: 'RSB-SNG-003',
        ppd_barcode: '8801122330036',
        ppd_product_name: 'Forest Green Premium Sarong',
        ppd_category_id: 3,
        ppd_subcategory_id: 4,
        ppd_price: 3500.00,
        ppd_product_image: batikGreenPattern,
        ppd_is_active: 'A',
        ppd_create_date: new Date().toISOString()
      },
      {
        ppd_product_id: 4,
        ppd_product_code: 'RSB-SHI-004',
        ppd_barcode: '8801122330043',
        ppd_product_name: 'Sunset Orange Casual Shirt',
        ppd_category_id: 4,
        ppd_subcategory_id: 5,
        ppd_price: 4200.00,
        ppd_product_image: batikOrangePattern,
        ppd_is_active: 'A',
        ppd_create_date: new Date().toISOString()
      },
      {
        ppd_product_id: 5,
        ppd_product_code: 'RSB-DRS-005',
        ppd_barcode: '8801122330050',
        ppd_product_name: 'Royal Purple Batik Dress',
        ppd_category_id: 5,
        ppd_subcategory_id: 4,
        ppd_price: 8900.00,
        ppd_product_image: batikPurplePattern,
        ppd_is_active: 'A',
        ppd_create_date: new Date().toISOString()
      }
    ];
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }

  // 5. Seed Bills & Bill Items
  if (!localStorage.getItem(DB_KEYS.BILLS)) {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today); dayBefore.setDate(today.getDate() - 2);

    const defaultBills = [
      {
        pbd_bill_id: 1,
        pbd_bill_no: 'RSB-B-10001',
        pbd_bill_date: dayBefore.toISOString(),
        pbd_user_id: 2, // cashier
        pbd_total_amount: 16700.00,
        pbd_discount_amount: 1000.00,
        pbd_net_amount: 15700.00,
        pbd_payment_type: 'Cash',
        pbd_create_date: dayBefore.toISOString(),
        pbd_created_by: 2
      },
      {
        pbd_bill_id: 2,
        pbd_bill_no: 'RSB-B-10002',
        pbd_bill_date: yesterday.toISOString(),
        pbd_user_id: 2, // cashier
        pbd_total_amount: 11000.00,
        pbd_discount_amount: 0.00,
        pbd_net_amount: 11000.00,
        pbd_payment_type: 'Card',
        pbd_create_date: yesterday.toISOString(),
        pbd_created_by: 2
      },
      {
        pbd_bill_id: 3,
        pbd_bill_no: 'RSB-B-10003',
        pbd_bill_date: today.toISOString(),
        pbd_user_id: 1, // admin
        pbd_total_amount: 25000.00,
        pbd_discount_amount: 2500.00,
        pbd_net_amount: 22500.00,
        pbd_payment_type: 'Card',
        pbd_create_date: today.toISOString(),
        pbd_created_by: 1
      }
    ];

    const defaultBillItems = [
      // Bill 1 items
      { pid_billitem_id: 1, pid_bill_id: 1, pid_product_id: 2, pid_qty: 1, pid_unit_price: 6800.00, pid_total: 6800.00, pid_create_date: dayBefore.toISOString() },
      { pid_billitem_id: 2, pid_bill_id: 1, pid_product_id: 5, pid_qty: 1, pid_unit_price: 8900.00, pid_total: 8900.00, pid_create_date: dayBefore.toISOString() },
      
      // Bill 2 items
      { pid_billitem_id: 3, pid_bill_id: 2, pid_product_id: 3, pid_qty: 2, pid_unit_price: 3500.00, pid_total: 7000.00, pid_create_date: yesterday.toISOString() },
      { pid_billitem_id: 4, pid_bill_id: 2, pid_product_id: 4, pid_qty: 1, pid_unit_price: 4200.00, pid_total: 4200.00, pid_create_date: yesterday.toISOString() },

      // Bill 3 items
      { pid_billitem_id: 5, pid_bill_id: 3, pid_product_id: 1, pid_qty: 2, pid_unit_price: 12500.00, pid_total: 25000.00, pid_create_date: today.toISOString() }
    ];

    localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(defaultBills));
    localStorage.setItem(DB_KEYS.BILL_ITEMS, JSON.stringify(defaultBillItems));
  }
};

// General DB Helpers
const getList = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveList = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// USERS MANAGEMENT
export const dbGetUsers = () => getList(DB_KEYS.USERS);
export const dbSaveUser = (user) => {
  const users = dbGetUsers();
  if (user.pud_user_id) {
    // Update
    const index = users.findIndex(u => u.pud_user_id === user.pud_user_id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user, pud_updated_date: new Date().toISOString() };
    }
  } else {
    // Create
    const newId = users.length > 0 ? Math.max(...users.map(u => u.pud_user_id)) + 1 : 1;
    users.push({
      ...user,
      pud_user_id: newId,
      pud_is_active: 'A',
      pud_create_date: new Date().toISOString()
    });
  }
  saveList(DB_KEYS.USERS, users);
  return true;
};
export const dbToggleUserStatus = (userId) => {
  const users = dbGetUsers();
  const index = users.findIndex(u => u.pud_user_id === userId);
  if (index !== -1) {
    users[index].pud_is_active = users[index].pud_is_active === 'A' ? 'I' : 'A';
    saveList(DB_KEYS.USERS, users);
    return users[index];
  }
  return null;
};

// CATEGORIES MANAGEMENT
export const dbGetCategories = () => getList(DB_KEYS.CATEGORIES);
export const dbSaveCategory = (category) => {
  const categories = dbGetCategories();
  if (category.pcd_category_id) {
    const index = categories.findIndex(c => c.pcd_category_id === category.pcd_category_id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...category, pcd_updated_date: new Date().toISOString() };
    }
  } else {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.pcd_category_id)) + 1 : 1;
    categories.push({
      ...category,
      pcd_category_id: newId,
      pcd_is_active: 'A',
      pcd_create_date: new Date().toISOString()
    });
  }
  saveList(DB_KEYS.CATEGORIES, categories);
  return true;
};
export const dbToggleCategoryStatus = (catId) => {
  const categories = dbGetCategories();
  const index = categories.findIndex(c => c.pcd_category_id === catId);
  if (index !== -1) {
    categories[index].pcd_is_active = categories[index].pcd_is_active === 'A' ? 'I' : 'A';
    saveList(DB_KEYS.CATEGORIES, categories);
  }
};

// SUBCATEGORIES MANAGEMENT
export const dbGetSubcategories = () => getList(DB_KEYS.SUBCATEGORIES);
export const dbSaveSubcategory = (subcat) => {
  const subcategories = dbGetSubcategories();
  if (subcat.psd_subcategory_id) {
    const index = subcategories.findIndex(s => s.psd_subcategory_id === subcat.psd_subcategory_id);
    if (index !== -1) {
      subcategories[index] = { ...subcategories[index], ...subcat, psd_updated_date: new Date().toISOString() };
    }
  } else {
    const newId = subcategories.length > 0 ? Math.max(...subcategories.map(s => s.psd_subcategory_id)) + 1 : 1;
    subcategories.push({
      ...subcat,
      psd_subcategory_id: newId,
      psd_is_active: 'A',
      psd_create_date: new Date().toISOString()
    });
  }
  saveList(DB_KEYS.SUBCATEGORIES, subcategories);
  return true;
};
export const dbToggleSubcatStatus = (subcatId) => {
  const subcategories = dbGetSubcategories();
  const index = subcategories.findIndex(s => s.psd_subcategory_id === subcatId);
  if (index !== -1) {
    subcategories[index].psd_is_active = subcategories[index].psd_is_active === 'A' ? 'I' : 'A';
    saveList(DB_KEYS.SUBCATEGORIES, subcategories);
  }
};

// PRODUCTS MANAGEMENT
export const dbGetProducts = () => getList(DB_KEYS.PRODUCTS);
export const dbSaveProduct = (product) => {
  const products = dbGetProducts();
  if (product.ppd_product_id) {
    const index = products.findIndex(p => p.ppd_product_id === product.ppd_product_id);
    if (index !== -1) {
      products[index] = { ...products[index], ...product, ppd_updated_date: new Date().toISOString() };
    }
  } else {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.ppd_product_id)) + 1 : 1;
    products.push({
      ...product,
      ppd_product_id: newId,
      ppd_is_active: 'A',
      ppd_create_date: new Date().toISOString()
    });
  }
  saveList(DB_KEYS.PRODUCTS, products);
  return true;
};
export const dbToggleProductStatus = (prodId) => {
  const products = dbGetProducts();
  const index = products.findIndex(p => p.ppd_product_id === prodId);
  if (index !== -1) {
    products[index].ppd_is_active = products[index].ppd_is_active === 'A' ? 'I' : 'A';
    saveList(DB_KEYS.PRODUCTS, products);
  }
};

// BILLS & TRANSACTIONS
export const dbGetBills = () => getList(DB_KEYS.BILLS);
export const dbGetBillItems = () => getList(DB_KEYS.BILL_ITEMS);

export const dbSaveBill = (billData, cartItems) => {
  const bills = dbGetBills();
  const billItems = dbGetBillItems();

  const newBillId = bills.length > 0 ? Math.max(...bills.map(b => b.pbd_bill_id)) + 1 : 1;
  const billNo = `RSB-B-${10000 + newBillId}`;

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId || 1;

  const newBill = {
    pbd_bill_id: newBillId,
    pbd_bill_no: billNo,
    pbd_bill_date: new Date().toISOString(),
    pbd_user_id: currentUserId,
    pbd_total_amount: billData.total,
    pbd_discount_amount: billData.discount || 0,
    pbd_net_amount: billData.netAmount,
    pbd_payment_type: billData.paymentType || 'Cash',
    pbd_create_date: new Date().toISOString(),
    pbd_created_by: currentUserId
  };

  const newItems = cartItems.map((item, idx) => {
    const newItemId = billItems.length > 0 ? Math.max(...billItems.map(bi => bi.pid_billitem_id)) + idx + 1 : idx + 1;
    return {
      pid_billitem_id: newItemId,
      pid_bill_id: newBillId,
      pid_product_id: item.ppd_product_id,
      pid_qty: item.quantity,
      pid_unit_price: item.ppd_price,
      pid_total: item.quantity * item.ppd_price,
      pid_create_date: new Date().toISOString(),
      pid_created_by: currentUserId
    };
  });

  bills.push(newBill);
  billItems.push(...newItems);

  saveList(DB_KEYS.BILLS, bills);
  saveList(DB_KEYS.BILL_ITEMS, billItems);

  return { bill: newBill, items: newItems };
};

export const dbGetBillDetails = (billId) => {
  const bills = dbGetBills();
  const billItems = dbGetBillItems();
  const products = dbGetProducts();
  const users = dbGetUsers();

  const bill = bills.find(b => b.pbd_bill_id === parseInt(billId));
  if (!bill) return null;

  const cashier = users.find(u => u.pud_user_id === bill.pbd_user_id)?.pud_username || 'Unknown';

  const items = billItems
    .filter(item => item.pid_bill_id === bill.pbd_bill_id)
    .map(item => {
      const prod = products.find(p => p.ppd_product_id === item.pid_product_id);
      return {
        ...item,
        productName: prod ? prod.ppd_product_name : 'Unknown Product',
        productCode: prod ? prod.ppd_product_code : 'N/A',
        barcode: prod ? prod.ppd_barcode : 'N/A'
      };
    });

  return { bill, items, cashier };
};
