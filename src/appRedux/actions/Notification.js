import {
    FETCH_NOTI
} from "../../constants/ActionTypes";

export const fetch_noti = (data) => {
    return {
        type: FETCH_NOTI,
        payload: data,
    };
};
