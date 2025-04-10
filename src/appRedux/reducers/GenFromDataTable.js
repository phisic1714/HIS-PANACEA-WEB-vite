import { GETGENFROMDATATABEL, CLEARGENFROMDATATABEL } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    genFromDataTable: [],
};
const GenFromDataTable = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GETGENFROMDATATABEL: {
            return {...state, genFromDataTable: action.payload };
        }
        case CLEARGENFROMDATATABEL: {
            return {...state, genFromDataTable: [] };
        }
        default:
            return state;
    }
}
export default GenFromDataTable;