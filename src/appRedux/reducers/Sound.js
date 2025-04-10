import { ADD_SOUND } from '../../constants/ActionTypes'

const INIT_STATE = {
    playList: [],
    addSoundCount: 0
};

const SoundReducer  = (state = INIT_STATE, action) => {
    switch (action.type){
        case ADD_SOUND: {
            return {
                ...state, ...action.payload
            }
        }
        default:
            return state
    }
}

export default SoundReducer