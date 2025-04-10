import { X_RAY_WORK_ID } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    xRayWorkId: null,
};


const XRayWorkId = (state = INIT_STATE, action) => {
    switch (action.type) {

        case X_RAY_WORK_ID: {
            return {...state, error: '', xRayWorkId: action.payload, loading: false};
        }
        default: 
            return state;
    }
}


export default XRayWorkId;