import {
    SELECT_ALL_SEARCH
} from "../../constants/ActionTypes";

export const allSearchDetail = (data) => {
    return {
        type: SELECT_ALL_SEARCH,
        payload: data,
    };
};


