import { PATIENT_TYPE } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    patient_Type: "opd",
};

const PatientType = (state = INIT_STATE, action) => {
    switch (action.type) {
        case PATIENT_TYPE: {
            return { ...state, error: '', patient_Type: action.payload, loading: false };
        }
        default:
            return state;
    }
}

export default PatientType;
