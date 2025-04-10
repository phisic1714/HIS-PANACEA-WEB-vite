import {
    HOSPITAL_PARAM_SET
  } from "../../constants/ActionTypes";

const HospitalParamReducer = (state = null, action) => {
  switch (action.type) {
    case HOSPITAL_PARAM_SET: {
        return action.payload;
    }
 
    default:
      return state;
  }
}

export default HospitalParamReducer;
