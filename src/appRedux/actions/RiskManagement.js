import {
  RISK_MANAGEMENT
} from "../../constants/ActionTypes";

export const riskManagement = (data) => {
  return {
      type: RISK_MANAGEMENT,
      payload: data,
  };
};
export const clearRiskManagement = () => {
  return {
      type: RISK_MANAGEMENT,
      payload: null,
  };
};