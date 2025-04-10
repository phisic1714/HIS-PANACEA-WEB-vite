import { GET_ASSESSMENT_CODE } from '../../constants/ActionTypes'

//34.7
export const assessment = (data) => {
    window.localStorage.setItem('assessment',JSON.stringify(data));
    return {
        type: GET_ASSESSMENT_CODE,
        payload: data,
    };
};