import { SMART_CARD, SMART_CARD_CLEAR } from '../../constants/ActionTypes'

const INIT_STATE = null;


const SmartCard = (state = INIT_STATE, action) => {
    switch (action.type) {

        case SMART_CARD: {
            return action.payload;
        }
        case SMART_CARD_CLEAR: {
            return action.payload;
        }
        default: 
            return state;
    }
}


export default SmartCard;