import {
    ADMIT_LIST,
    SELECT_PATIENT,
    SELECT_OPD_PATIENT,
    SELECT_WORK_ROOM,
    SELECT_LAB_PATIENT_ID,
    SELECT_X_RAY_PATIENT_ID,
    SELECT_SCREENING_PATIENT,
    SERVICE_LIST,
    SELECT_OPERATION_SET,
    CLEAR_SELECT_PATIENT,
    CLEAR_SELECT_OPD_PATIENT,
} from "../../constants/ActionTypes";

export const selectAdmitList = (data) => {
    return {
        type: ADMIT_LIST,
        payload: data,
    };
};

export const showPatient = (data) => {
    const [runHn = "", yearHn = ""] = data?.hn?.split("/") || [];

    return {
        type: SELECT_PATIENT,
        payload: {
            ...data,
            runHn,
            yearHn
        },
    };
};

export const clearIpdPatient = (data) => {
    return {
        type: CLEAR_SELECT_PATIENT,
        payload: data,
    };
};

export const clearOpdPatient = (data) => {
    return {
        type: CLEAR_SELECT_OPD_PATIENT,
        payload: data,
    };
};

export const selectServiceList = (data) => {
    return {
        type: SERVICE_LIST,
        payload: data,
    };
};

export const opdPatientDetail = (data) => {
    // console.log(data);
    return {
        type: SELECT_OPD_PATIENT,
        payload: data,
    };
};


export const workRoom = (data) => {
    window.localStorage.setItem('selectWorkRoom', JSON.stringify(data));
    return {
        type: SELECT_WORK_ROOM,
        payload: data,
    };
};

export const labPatientID = (data) => {
    return {
        type: SELECT_LAB_PATIENT_ID,
        payload: data,
    };
};

export const xrayPatientID = (data) => {
    return {
        type: SELECT_X_RAY_PATIENT_ID,
        payload: data,
    };
};

export const screeningPatientInfo = (data) => {
    return {
        type: SELECT_SCREENING_PATIENT,
        payload: data,
    };
};


export const operationSet = (data) => {
    return {
        type: SELECT_OPERATION_SET,
        payload: data,
    };
};


