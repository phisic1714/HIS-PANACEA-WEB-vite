import {
    GET_EXPENSE,
    GET_HOSP_CODE,
    GET_ICD10_IT,
    GET_ICD10_PURE,
    GET_ICD9_CM,
    GET_ICD9_PURE,
    GET_ICDS,
    GET_USER_ALL,
    SET_DOSING_INTERVAL,
    SET_DOSING_TIME,
    SET_DRUG_ADMIN,
    SET_DRUG_LIST,
    SET_DRUG_PROPERTY,
    SET_DRUG_TIMING_LIST,
    SET_DRUG_TYPE_LIST,
    SET_DRUG_USING_LIST,
    SET_DRUG_WARNING,
    SET_EXPENSE_LABS,
    SET_EXPENSE_LIST_WITH_TYPES,
    SET_EXPENSE_ORDERS,
    SET_EXPENSE_XRAYS,
    SET_FINANCE_TYPES,
    SET_ISED_REASON,
    SET_UNIT_LIST
} from '../../constants/ActionTypes';

const createAction = (type) => (payload) => ({ type, payload });

export const dspIcds = createAction(GET_ICDS);
export const dspIcd10It = createAction(GET_ICD10_IT);
export const dspIcd9Cm = createAction(GET_ICD9_CM);
export const dspIcd10Pure = createAction(GET_ICD10_PURE);
export const dspIcd9Pure = createAction(GET_ICD9_PURE);
export const dspUserAll = createAction(GET_USER_ALL);
export const dspHospCode = createAction(GET_HOSP_CODE);
export const dspExpense = createAction(GET_EXPENSE);
export const dspDrugUsingList = createAction(SET_DRUG_USING_LIST);
export const dspUnitList = createAction(SET_UNIT_LIST);
export const dspDrugTimingList = createAction(SET_DRUG_TIMING_LIST);
export const dspDosingTime = createAction(SET_DOSING_TIME);
export const dspDosingInterval = createAction(SET_DOSING_INTERVAL);
export const dspDrugProperty = createAction(SET_DRUG_PROPERTY);
export const dspDrugWarning = createAction(SET_DRUG_WARNING);
export const dspDrugAdmin = createAction(SET_DRUG_ADMIN);
export const dspIsedReason = createAction(SET_ISED_REASON);
export const dspDrugTypeList = createAction(SET_DRUG_TYPE_LIST);
export const dspDrugList = createAction(SET_DRUG_LIST);
export const dspFinanceTypes = createAction(SET_FINANCE_TYPES);
export const dspExpenseListWithTypes = createAction(SET_EXPENSE_LIST_WITH_TYPES);
export const dspExpenseOrders = createAction(SET_EXPENSE_ORDERS);
export const dspExpenseLabs = createAction(SET_EXPENSE_LABS);
export const dspExpenseXrays = createAction(SET_EXPENSE_XRAYS);
