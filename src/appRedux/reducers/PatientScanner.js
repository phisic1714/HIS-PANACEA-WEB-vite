import { PATIENT_SCANNER } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    detail: {
        code: false,
        type: null,
        val: null,
        documents: [],
        scanId: null,
    },
};

const PatientScanner = (state = INIT_STATE, action) => {
    switch (action.type) {

        case PATIENT_SCANNER: {
            return {
                ...state,
                error: '',
                detail: action.payload,
                loading: false
            };
        }

        default:
            return state;
    }
}

export default PatientScanner;