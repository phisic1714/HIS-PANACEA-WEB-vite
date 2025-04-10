import { createContext } from "react";
import { createReducer } from "@reduxjs/toolkit";

const initContext = createContext();

export const initState = {
  name: "",
  lastname: "",
  tel: "",
  data: null,
  sidebarGetImage: false,
};

export const initReducer = createReducer(initState, {
  SET_NAME: (state, { payload }) => {
    state.name = payload;
  },
  SET_LASTNAME: (state, { payload }) => {
    state.lastname = payload;
  },
  SET_TEL: (state, { payload }) => {
    state.tel = payload;
  },
  SET_DATA: (state, { payload }) => {
    state.data = payload;
  },
  // eslint-disable-next-line no-unused-vars
  SET_GETIMAGE: (state, { payload }) => {
    state.sidebarGetImage = true;
  },
});

export default initContext;