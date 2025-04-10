import {
    SELECT_ALL_SEARCH
} from '../../constants/ActionTypes'

const INIT_STATE = {
    patient: null,
    serviceList: [],
    admitList: [],
};

const Search = (state = INIT_STATE, action) => {
    switch (action.type) {
        case SELECT_ALL_SEARCH: {
            return { ...action?.payload };
        }
        default:
            return state;
    }
}

export default Search;
