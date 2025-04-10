import {
    DRUG_INFO_BY_ID,
    RESET_DRUG_INFO,
    EDIT_DRUG_INFO
} from "../../constants/ActionTypes";

export const select_drug_info = (data) => {
    return {
        type: DRUG_INFO_BY_ID,
        payload: data,
    };
};


export const reset_drug_info = () => {
    return {
        type: RESET_DRUG_INFO,
        payload: null,
    };
}

export const edit_drug_info = (data) => {
    return {
        type: EDIT_DRUG_INFO,
        payload:data
    }
}