import {
    TEMP_INC_ID,
} from '../../constants/ActionTypes'
export const dspIncId = (data) => {
    return {
        type: TEMP_INC_ID,
        payload: data,
    }
};