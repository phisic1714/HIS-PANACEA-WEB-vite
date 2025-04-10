import {
    OPD_FINANCE_PLACE
} from "../../constants/ActionTypes";

export const opdFinancePlace = (data) => {
    window.localStorage.setItem('opdFinancePlace',JSON.stringify(data));
    return {
        type: OPD_FINANCE_PLACE,
        payload: data,
    };
};