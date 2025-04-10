import { TypeAndPatient } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    patientByAnHn: null,
};

const DataTypeAndPatient = (state = INIT_STATE, action) => {
    switch (action.type) {
        case TypeAndPatient: {
            return {...state, error: '', patientByAnHn: action.payload, loading: false};
        }
        default: 
            return state;
    }
}

export default DataTypeAndPatient;
