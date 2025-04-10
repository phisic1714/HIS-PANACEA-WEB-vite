import { GETGENFROMDATATABEL, CLEARGENFROMDATATABEL } from '../../constants/ActionTypes'

export const getGenFromDataTable = (data) => {
    return {
        type: GETGENFROMDATATABEL,
        payload: data,
    };
};

export const clearGenFromDataTable = () => {
    return {
        type: CLEARGENFROMDATATABEL,
    };
};