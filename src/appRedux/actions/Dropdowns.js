const createAction = (type) => (payload) => ({ type, payload });

// Menu
export const dspDropdows2_1 = createAction("DROPDOWNS_2.1");
export const dspDropdows2_2 = createAction("DROPDOWNS_2.2");
export const dspDropdows5_1 = createAction("DROPDOWNS_5.1");
export const dspDropdows7_3 = createAction("DROPDOWNS_7.3");
export const dspDropdows7_4 = createAction("DROPDOWNS_7.4");
export const dspDropdows7_5 = createAction("DROPDOWNS_7.5");
export const dspDropdows10_3 = createAction("DROPDOWNS_10.3");
export const dspDropdows11_21 = createAction("DROPDOWNS_11.21");
export const dspDropdows12_10_1 = createAction("DROPDOWNS_12.10.1");
export const dspDropdows16_1 = createAction("DROPDOWNS_16.1");
export const dspDropdows30_3 = createAction("DROPDOWNS_30.3");
export const dspDropdows34_5 = createAction("DROPDOWNS_34.5");
export const dspDropdows81_3 = createAction("DROPDOWNS_81.3");

// Components
export const dspDropdowsVsEyes = createAction("DROPDOWNS_VS_EYES");
export const dspDropdowsVsFoot = createAction("DROPDOWNS_VS_FOOT");
export const dspDropdowsOpdDrugCharge = createAction("DROPDOWNS_OPD_DRUG_CHARGE");
export const dspDropdowsEmessage = createAction("DROPDOWNS_E_MESSAGE");
export const dspDropdowsTabCardDrug = createAction("DROPDOWNS_TAB_CARD_DRUG");
export const dspDropdowsOrderComponent = createAction("DROPDOWNS_ORDER_COMPONENT");
export const dspDropdowsUpserFinanceDoctorClinic = createAction("DROPDOWNS_UPSERT_FINANCE_DOCTOR_CLINIC");
export const dspDropdowsReferModal = createAction("DROPDOWNS_REFER_MODAL");

// individually