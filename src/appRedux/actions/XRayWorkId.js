import{
    X_RAY_WORK_ID,
} from "../../constants/ActionTypes";


//module 11 dashbord
export const XRayWorkId = (data) => {
    return {
        type: X_RAY_WORK_ID,
        payload: data,
    };
};