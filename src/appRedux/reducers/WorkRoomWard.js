import { WARD_MENU } from '../../constants/ActionTypes'

const INIT_STATE = {
    error: "",
    loading: false,
    selectWorkRoomWard: JSON.parse(window.localStorage.getItem('workRoomWard')),
};


const WorkRoomWard = (state = INIT_STATE, action) => {
    switch (action.type) {

        case WARD_MENU: {
            return {...state, error: '', selectWorkRoomWard: action.payload, loading: false};
        }
        default: 
            return state;
    }
}


export default WorkRoomWard;