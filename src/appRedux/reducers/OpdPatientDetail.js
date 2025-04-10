import { SELECT_OPD_PATIENT, SERVICE_LIST,CLEAR_SELECT_OPD_PATIENT } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    serviceList: [],
    opdPatientDetail: null,
};
const OpdPatientDetail = (state = INIT_STATE, action) => {
    switch (action.type) {
        case SERVICE_LIST: {
            return { ...state, error: '', serviceList: action.payload, loading: false };
        }
        case SELECT_OPD_PATIENT: {
            return { ...state, error: '', opdPatientDetail: action.payload, loading: false };
        }
        case CLEAR_SELECT_OPD_PATIENT: {
            return { ...state, error: '',  opdPatientDetail: null,serviceList:[], loading: false};
        }
        default:
            return state;
    }
}
export default OpdPatientDetail;