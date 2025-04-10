import {
  FETCH_ERROR,
  FETCH_START,
  FETCH_SUCCESS,
  SHOW_MESSAGE,
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

export const clearShowMessage = () => {
  return {
    type: SHOW_MESSAGE,
    payload: null,
  };
};

// export const admitDischarge = (value) => {

//     console.log(value);

//     return async dispatch => {
//         dispatch(fetchStart());
//         try {
//             const result = await Axios.post(`${process.env.REACT_APP_PANACEACHS_SERVER}/Admits/GetAtmitsAllInfo`, value);
//             console.log('result : ', result.data);
//             // dispatch(showMessage("TOP"));
//             // dispatch(fetchSuccess());
//         }catch(err) {
//             dispatch(fetchError("fetch data fail"));
//         }
//     }
// }
