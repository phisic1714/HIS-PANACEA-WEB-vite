import {
    FETCH_ERROR,
    FETCH_START,
    FETCH_SUCCESS,
    SHOW_MESSAGE,
    TypeAndPatient,
    PATIENT_TYPE
  } from "../../constants/ActionTypes";
  
  export const fetchStart = () => {
    return {
      type: FETCH_START,
    };
  };
  
  export const fetchSuccess = () => {
    return {
      type: FETCH_SUCCESS,
    };
  };
  
  export const fetchError = (error) => {
    return {
      type: FETCH_ERROR,
      payload: error,
    };
  };
  
  export const showMessage = (message) => {
    return {
      type: SHOW_MESSAGE,
      payload: message,
    };
  };

  export const showType = (data) => {
    return {
      type: TypeAndPatient,
      payload: data,
    };
  };
  export const patientType = (data) => {
    return {
      type: PATIENT_TYPE,
      payload: data,
    };
  };