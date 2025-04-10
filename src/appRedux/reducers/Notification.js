import { FETCH_NOTI } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    notiMessage: null,
};

const Notification = (state = INIT_STATE, action) => {
    switch (action.type) {
        case FETCH_NOTI: {
            return { ...state, error: '', notiMessage: { ...action.payload } };
        }
        default:
            return state;
    }
}

export default Notification;
