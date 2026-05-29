
import { OPEN_MODAL, CLOSE_MODAL } from '../constants/actionTypes';

export const openModal = (modalType, props = {}) => ({
  type: OPEN_MODAL,
  payload: { modalType, props }
});

export const closeModal = () => ({
  type: CLOSE_MODAL
});