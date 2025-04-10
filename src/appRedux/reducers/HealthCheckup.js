import {
    GET_ASSESSMENT_CODE
} from "../../constants/ActionTypes";

const INIT_STATE = {
    error: "",
    loading: false,
    assessment: JSON.parse(window.localStorage.getItem('assessment')||null),

};

const HealthCheckup = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_ASSESSMENT_CODE: {
            return {
                ...state,
                error: "",
                assessment: action.payload,
                loading: false,
            };
        }
        default: 
            return state;
    }
}

export default HealthCheckup;