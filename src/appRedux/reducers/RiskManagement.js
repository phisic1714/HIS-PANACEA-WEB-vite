import { RISK_MANAGEMENT } from '../../constants/ActionTypes';

const INIT_STATE = null;
const RiskManagement = (state = INIT_STATE, action) => {
	switch (action.type) {
		case RISK_MANAGEMENT: {
			return action.payload;
		}
		default:
			return state;
	}
};
export default RiskManagement;
