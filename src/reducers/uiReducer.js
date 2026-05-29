import { TOGGLE_THEME, OPEN_MODAL, CLOSE_MODAL, SET_ACTIVE_PAGE, SET_PO_PREFILL_DATA, CLEAR_PO_PREFILL_DATA, SET_POS_LAYOUT } from '../constants/actionTypes';
const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true' ? true : false,
  // darkMode: false,
  activeModal: null,
  modalProps: null,
  sidebarCollapsed: false,
  activePage: 'POS',
  poPrefillData: null,
  posLayout: localStorage.getItem('posLayout') || 'tile',
};
export const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_THEME:
      const newDarkMode = !state.darkMode;
      localStorage.setItem('darkMode', newDarkMode);
      return {
        ...state,
        darkMode: !state.darkMode
      };
    case OPEN_MODAL:
      return {
        ...state,
        activeModal: action.payload.modalType,
        modalProps: action.payload.props || null
      };
    case CLOSE_MODAL:
      return {
        ...state,
        activeModal: null,
        modalProps: null
      };
    case SET_ACTIVE_PAGE:
      return {
        ...state,
        activePage: action.payload
      };
    case SET_PO_PREFILL_DATA:
      return {
        ...state,
        poPrefillData: action.payload
      };
    case CLEAR_PO_PREFILL_DATA:
      return {
        ...state,
        poPrefillData: null
      };
    case SET_POS_LAYOUT:
      localStorage.setItem('posLayout', action.payload);
      return {
        ...state,
        posLayout: action.payload
      };
    default:
      return state;
  }
};