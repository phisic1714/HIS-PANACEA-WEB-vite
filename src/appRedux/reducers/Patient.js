import {
    ADMIT_LIST,
    SELECT_PATIENT,
    SELECT_LAB_PATIENT_ID,
    SELECT_X_RAY_PATIENT_ID,
    SELECT_SCREENING_PATIENT,
    SELECT_OPERATION_SET,
    CLEAR_SELECT_PATIENT,
    SELECT_ALL_SEARCH,
    SELECT_OPD_PATIENT
} from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    admitList: [],
    selectPatient: null,
    selectLabPatientID: null,
    selectXrayPatientID: null,
    selectScreeningPatient: null,
    selectOperationSet: null,
};

const Patient = (state = INIT_STATE, action) => {
    switch (action.type) {

        case SELECT_ALL_SEARCH: {
            return { ...state, error: '', details: action.payload, loading: false };
        }
        case ADMIT_LIST: {
            return { ...state, error: '', admitList: action.payload, loading: false };
        }

        case SELECT_PATIENT: {
            return { ...state, error: '', selectPatient: action.payload, loading: false };
        }

        case SELECT_OPD_PATIENT: {
            // console.log(action.payload);
            return { ...state, error: '', selectOpdPatient: action.payload, loading: false };
        }

        case SELECT_LAB_PATIENT_ID: {
            return { ...state, error: '', selectLabPatientID: action.payload, loading: false };
        }

        case SELECT_X_RAY_PATIENT_ID: {
            return { ...state, error: '', selectXrayPatientID: action.payload, loading: false };
        }

        case SELECT_SCREENING_PATIENT: {
            return { ...state, error: '', selectScreeningPatient: action.payload, loading: false };
        }

        case SELECT_OPERATION_SET: {
            return { ...state, error: '', selectOperationSet: action.payload, loading: false };
        }

        case CLEAR_SELECT_PATIENT: {
            return { ...state, error: '', selectPatient: null, admitList: [], loading: false };
        }

        default:
            return state;
    }
}

export default Patient;
