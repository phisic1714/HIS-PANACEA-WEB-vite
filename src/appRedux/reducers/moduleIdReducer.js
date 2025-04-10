import { MODULE_ID } from '../../constants/ActionTypes'

const INIT_STATE = {module: null, refreshTime: null};


const ModuleIdReducer = (state = INIT_STATE, action) => {
    switch (action.type) {

        case MODULE_ID: {
            return {...state, module: action.payload?.moduleId, refreshTime: action.payload?.refreshTime}
        }
        default: 
            return state;
    }
}


export default ModuleIdReducer;