import { PATIENT_SCANNER} from '../../constants/ActionTypes'

export const selectPatientScanner = (data) => {
    return {
        type: PATIENT_SCANNER,
        payload: data,
    };
};