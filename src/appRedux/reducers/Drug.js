import { DRUG_INFO_BY_ID, RESET_DRUG_INFO } from '../../constants/ActionTypes';

const INIT_STATE = {
    loading: false,
    drugInfo: {},
    error: "",
    status: "",
};

const Drug = (state = INIT_STATE, action) => {
    switch (action.type) {
        case DRUG_INFO_BY_ID: {
            return { ...state, error: '', drugInfo: action.payload, loading: false };
        }
        case RESET_DRUG_INFO: {
            return { ...state, error: '', drugInfo: INIT_STATE.drugInfo, loading: false }
        }
        default:
            return state;
    }
}

export default Drug;
