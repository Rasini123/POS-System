
import React, { createContext, useContext, useReducer } from 'react';
import { uiReducer } from '../reducers/uiReducer';

const ModalContext = createContext();

const initialState = {
  activeModal: null,
  modalProps: null
};

export const ModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <ModalContext.Provider value={{ state, dispatch }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};