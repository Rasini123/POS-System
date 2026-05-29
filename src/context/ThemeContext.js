
import React, { createContext, useContext, useReducer } from 'react';
import { uiReducer } from '../reducers/uiReducer';

const ThemeContext = createContext();

const initialState = {
  darkMode: false,
  activeModal: null,
  modalProps: null,
  sidebarCollapsed: false
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};