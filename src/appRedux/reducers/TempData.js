import {
    TEMP_INC_ID
} from '../../constants/ActionTypes'
const INIT_STATE = {
    incId: null,
};
const TempData = (state = INIT_STATE, action) => {
    switch (action.type) {
        case TEMP_INC_ID:
            return {
                ...state,
                incId: action.payload
            }

        default:
            return state;
    }
}

export default TempData;