// src/config/index.js
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://testrcc.dockyardsoftware.com',
  PRINTER_NAME: process.env.REACT_APP_PRINTER_NAME || 'BIXOLON SRP-E302',
  TOKEN_KEY: 'token',
  INVOICE_TEMPLATE: 'retail',
  COMPANY_NAME: 'DCSICN CLUB',
  COMPANY_PHONE: '070 - 731 4445',
  COMPANY_ADDRESS: 'No. 316/7, Thalangama North, Battaramulla.'
};

export default config;