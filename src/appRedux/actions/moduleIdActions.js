import{
    MODULE_ID,
} from "../../constants/ActionTypes";


export const moduleIdAction = (data) => {
    return {
        type: MODULE_ID,
        payload: data,
    };
};