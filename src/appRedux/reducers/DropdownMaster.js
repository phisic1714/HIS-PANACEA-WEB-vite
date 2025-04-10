
import * as ActionTypes from '../../constants/ActionTypes';

const INIT_STATE = {
    icds: [],
    icd10It: [],
    icd9Cm: [],
    icd10Pure: [],
    icd9Pure: [],
    userAll: [],
    hospCode: [],
    expense: [],
    drugUsingList: [],
    unitList: [],
    drugTimingList: [],
    dosingTime: [],
    dosingInterval: [],
    drugProperty: [],
    drugWarning: [],
    drugAdmin: [],
    isedReason: [],
    drugTypeList: [],
    drugList: [],
    financeTypes: [],
    expenseListWithTypes: [],
    expenseOrders: [],
    expenseLabs: [],
    expenseXrays: []
};

const actionHandlers = {
    [ActionTypes.GET_ICDS]: (state, action) => ({ ...state, icds: action.payload }),
    [ActionTypes.GET_ICD10_IT]: (state, action) => ({ ...state, icd10It: action.payload }),
    [ActionTypes.GET_ICD9_CM]: (state, action) => ({ ...state, icd9Cm: action.payload }),
    [ActionTypes.GET_USER_ALL]: (state, action) => ({ ...state, userAll: action.payload }),
    [ActionTypes.GET_HOSP_CODE]: (state, action) => ({ ...state, hospCode: action.payload }),
    [ActionTypes.GET_EXPENSE]: (state, action) => ({ ...state, expense: action.payload }),
    [ActionTypes.GET_ICD10_PURE]: (state, action) => ({ ...state, icd10Pure: action.payload }),
    [ActionTypes.GET_ICD9_PURE]: (state, action) => ({ ...state, icd9Pure: action.payload }),
    [ActionTypes.SET_DRUG_USING_LIST]: (state, action) => ({ ...state, drugUsingList: action.payload }),
    [ActionTypes.SET_UNIT_LIST]: (state, action) => ({ ...state, unitList: action.payload }),
    [ActionTypes.SET_DRUG_TIMING_LIST]: (state, action) => ({ ...state, drugTimingList: action.payload }),
    [ActionTypes.SET_DOSING_TIME]: (state, action) => ({ ...state, dosingTime: action.payload }),
    [ActionTypes.SET_DOSING_INTERVAL]: (state, action) => ({ ...state, dosingInterval: action.payload }),
    [ActionTypes.SET_DRUG_PROPERTY]: (state, action) => ({ ...state, drugProperty: action.payload }),
    [ActionTypes.SET_DRUG_WARNING]: (state, action) => ({ ...state, drugWarning: action.payload }),
    [ActionTypes.SET_DRUG_ADMIN]: (state, action) => ({ ...state, drugAdmin: action.payload }),
    [ActionTypes.SET_ISED_REASON]: (state, action) => ({ ...state, isedReason: action.payload }),
    [ActionTypes.SET_DRUG_TYPE_LIST]: (state, action) => ({ ...state, drugTypeList: action.payload }),
    [ActionTypes.SET_DRUG_LIST]: (state, action) => ({ ...state, drugList: action.payload }),
    [ActionTypes.SET_FINANCE_TYPES]: (state, action) => ({ ...state, financeTypes: action.payload }),
    [ActionTypes.SET_EXPENSE_LIST_WITH_TYPES]: (state, action) => ({ ...state, expenseListWithTypes: action.payload }),
    [ActionTypes.SET_EXPENSE_ORDERS]: (state, action) => ({ ...state, expenseOrders: action.payload }),
    [ActionTypes.SET_EXPENSE_LABS]: (state, action) => ({ ...state, expenseLabs: action.payload }),
    [ActionTypes.SET_EXPENSE_XRAYS]: (state, action) => ({ ...state, expenseXrays: action.payload })
};

const DropdownMaster = (state = INIT_STATE, action) => {
    const handler = actionHandlers[action.type];
    return handler ? handler(state, action) : state;
};


export default DropdownMaster;