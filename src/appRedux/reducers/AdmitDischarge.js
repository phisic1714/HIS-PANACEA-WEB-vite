import {FETCH_START, FETCH_SUCCESS, FETCH_ERROR, SHOW_MESSAGE, CLEAR_SHOW_MESSAGE} from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    message: '',
};

const AdmitDischarge = (state = INIT_STATE, action) => {
    switch (action.type) {
        case FETCH_START: {
            return {...state, error: '', message: '', loading: true};
        }
        case FETCH_SUCCESS: {
            return {...state, error: '', message: '', loading: false};
        }
        case FETCH_ERROR: {
            return {...state, error: action.payload, message: '', loading: false};
        }
        case SHOW_MESSAGE: {
            return {...state, error: '', message: action.payload, loading: false};
        }
        case CLEAR_SHOW_MESSAGE: {
            return {...state, error: '', message: action.payload, loading: false};
        }
        default: 
            return state;
    }
}

export default AdmitDischarge;
 