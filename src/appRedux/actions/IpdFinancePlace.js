import {
    IPD_FINANCE_PLACE
} from "../../constants/ActionTypes";

export const ipdFinancePlace = (data) => {
    window.localStorage.setItem('ipdFinancePlace',JSON.stringify(data));
    return {
        type: IPD_FINANCE_PLACE,
        payload: data,
    };
};