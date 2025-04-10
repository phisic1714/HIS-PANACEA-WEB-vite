import {
  HOSPITAL_PARAM_SET
} from "../../constants/ActionTypes";

export const set_hosparam_action = (data) => {
  return {
      type: HOSPITAL_PARAM_SET,
      payload: data,
  };
};