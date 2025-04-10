import {
    OPD_FINANCE_PLACE
} from "../../constants/ActionTypes";

const INIT_STATE = {
    error: "",
    loading: false,
    financePlace: JSON.parse(window.localStorage.getItem('opdFinancePlace'))
};

const OpdFinancePlace = (state = INIT_STATE, action) => {
    switch (action.type) {
        case OPD_FINANCE_PLACE: {
            return {...state, error: '', financePlace: action.payload, loading: false};
        }
        default: 
            return state;
    }
}

export default OpdFinancePlace;