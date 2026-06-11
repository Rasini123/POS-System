// src/config/index.js
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://testrcc.dockyardsoftware.com',
  PRINTER_NAME: process.env.REACT_APP_PRINTER_NAME || 'BIXOLON SRP-E302',
  TOKEN_KEY: 'token',
  INVOICE_TEMPLATE: 'retail',
  COMPANY_NAME: 'Rs Bathik Gallery',
  COMPANY_PHONE: '0717517044',
  COMPANY_ADDRESS: 'No 286, moronthuduwa rd, melegama, wadduwa, Sri Lanka,12560'
};

export default config;