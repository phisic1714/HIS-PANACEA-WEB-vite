import { ADD_SOUND } from '../../constants/ActionTypes'

export const addSound = (data) => {
    return {
        type: ADD_SOUND,
        payload: data
    }
}