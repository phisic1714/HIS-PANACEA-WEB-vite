import {
    GET_WARD_AND_BEDTYPE
} from "../../constants/ActionTypes";

const INIT_STATE = {
    wardAndBedType: JSON.parse(window.localStorage.getItem('wardAndBedType')||null),
};

const BedManagement = (state = INIT_STATE, action) => {
    switch (action.type) {
        case GET_WARD_AND_BEDTYPE: {
            return {
                wardAndBedType: action.payload,
            };
        }
        default: 
            return state;
    }
}

export default BedManagement;