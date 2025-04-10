const INIT_STATE = {
    // Menu
    options2_1: {},
    options2_2: {},
    options5_1: {},
    options7_3: {},
    options7_4: {},
    options7_5: {},
    options10_3: {},
    options11_21: {},
    options12_10_1: {},
    options16_1: {},
    options30_3: {},
    options34_5: {},
    options81_3: {},

    // Components
    optionsVs_Eyes: {},
    optionsVs_Foot: {},
    optionsOpdDrugCharge: {},
    optionsEmessage: {},
    optionsTabCardDrug: {},
    optionsOrderComponent: {},
    optionsUpserFinanceDoctorClinic: {},
    optionsReferModal: {},

    // individually
};

const actionHandlers = {
    // Menu
    "DROPDOWNS_2.1": (state, action) => ({ ...state, options2_1: action.payload }),
    "DROPDOWNS_2.2": (state, action) => ({ ...state, options2_2: action.payload }),
    "DROPDOWNS_5.1": (state, action) => ({ ...state, options5_1: action.payload }),
    "DROPDOWNS_7.3": (state, action) => ({ ...state, options7_3: action.payload }),
    "DROPDOWNS_7.4": (state, action) => ({ ...state, options7_4: action.payload }),
    "DROPDOWNS_7.5": (state, action) => ({ ...state, options7_5: action.payload }),
    "DROPDOWNS_10.3": (state, action) => ({ ...state, options10_3: action.payload }),
    "DROPDOWNS_11.21": (state, action) => ({ ...state, options11_21: action.payload }),
    "DROPDOWNS_12.10.1": (state, action) => ({ ...state, options12_10_1: action.payload }),
    "DROPDOWNS_16.1": (state, action) => ({ ...state, options16_1: action.payload }),
    "DROPDOWNS_30.3": (state, action) => ({ ...state, options30_3: action.payload }),
    "DROPDOWNS_34.5": (state, action) => ({ ...state, options34_5: action.payload }),
    "DROPDOWNS_81.3": (state, action) => ({ ...state, options81_3: action.payload }),

    // Components
    "DROPDOWNS_VS_EYES": (state, action) => ({ ...state, optionsVs_Eyes: action.payload }),
    "DROPDOWNS_VS_FOOT": (state, action) => ({ ...state, optionsVs_Foot: action.payload }),
    "DROPDOWNS_OPD_DRUG_CHARGE": (state, action) => ({ ...state, optionsOpdDrugCharge: action.payload }),
    "DROPDOWNS_E_MESSAGE": (state, action) => ({ ...state, optionsEmessage: action.payload }),
    "DROPDOWNS_TAB_CARD_DRUG": (state, action) => ({ ...state, optionsTabCardDrug: action.payload }),
    "DROPDOWNS_ORDER_COMPONENT": (state, action) => ({ ...state, optionsOrderComponent: action.payload }),
    "DROPDOWNS_UPSERT_FINANCE_DOCTOR_CLINIC": (state, action) => ({ ...state, optionsUpserFinanceDoctorClinic: action.payload }),
    "DROPDOWNS_REFER_MODAL": (state, action) => ({ ...state, optionsReferModal: action.payload }),

    // individually
};

const Dropdowns = (state = INIT_STATE, action) => {
    const handler = actionHandlers[action.type];
    return handler ? handler(state, action) : state;
};

export default Dropdowns;