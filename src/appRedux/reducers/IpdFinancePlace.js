import {
    IPD_FINANCE_PLACE
} from "../../constants/ActionTypes";

const INIT_STATE = {
    error: "",
    loading: false,
    financePlace: JSON.parse(window.localStorage.getItem('ipdFinancePlace'))
};

const IpdFinancePlace = (state = INIT_STATE, action) => {
    switch (action.type) {
        case IPD_FINANCE_PLACE: {
            return {...state, error: '', financePlace: action.payload, loading: false};
        }
        default: 
            return state;
    }
}

export default IpdFinancePlace;