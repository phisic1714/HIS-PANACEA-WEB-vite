import { GET_WARD_AND_BEDTYPE } from '../../constants/ActionTypes'

//57.1
export const wardAndBedType = (data) => {
    window.localStorage.setItem('wardAndBedType',JSON.stringify(data));
    return {
        type: GET_WARD_AND_BEDTYPE,
        payload: data,
    };
};