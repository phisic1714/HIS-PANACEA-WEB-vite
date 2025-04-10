import{
    SMART_CARD,
    SMART_CARD_CLEAR
} from "../../constants/ActionTypes";


export const smartCardAction = (data) => {
    return {
        type: SMART_CARD,
        payload: data,
    };
};

export const smartCardClear = () => {
    return {
        type: SMART_CARD_CLEAR,
        payload: null,
    };
};