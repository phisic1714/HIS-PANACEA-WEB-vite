import{
    OPDCLINIC_ROOM,
    DENTAL_ROOM,
    DOCTORCLINIC_ROOM,
    WARD_ROOM,
    LABORATORY_ROOM,
    OPDPRESCRIPTION_ROOM,
    IPDPRESCRIPTION_ROOM,
    Operation_ROOM,
    INVENTORY_ROOM,
    QUEUE_ROOM,
    PSYCHIATRIC_ROOM
} from "../../constants/ActionTypes";

//menu 7
export const opdClinicRoom = (data) => {
    window.localStorage.setItem('opdClinicRoom',JSON.stringify(data));
    return {
        type: OPDCLINIC_ROOM,
        payload: data,
    };
};
//menu 9
export const dentalRoom = (data) => {
    window.localStorage.setItem('dentalRoom',JSON.stringify(data));
    return {
        type: DENTAL_ROOM,
        payload: data,
    };
};
//menu 10
export const doctorClinicRoom = (data) => {
    window.localStorage.setItem('doctorClinicRoom',JSON.stringify(data));
    return {
        type: DOCTORCLINIC_ROOM,
        payload: data,
    };
};
//menu 11
export const wardRoom = (data) => {
    window.localStorage.setItem('wardRoom',JSON.stringify(data));
    return {
        type: WARD_ROOM,
        payload: data,
    };
};
//menu 12
export const laboratoryRoom = (data) => {
    window.localStorage.setItem('laboratoryRoom',JSON.stringify(data));
    return {
        type: LABORATORY_ROOM,
        payload: data,
    };
};
//menu 14
export const OPDPrescriptionRoom = (data) => {
    window.localStorage.setItem('opdPrescriptionRoom',JSON.stringify(data));
    return {
        type: OPDPRESCRIPTION_ROOM,
        payload: data,
    };
};
//menu 15
export const IPDPrescriptionRoom = (data) => {
    window.localStorage.setItem('ipdPrescriptionRoom',JSON.stringify(data));
    return {
        type: IPDPRESCRIPTION_ROOM,
        payload: data,
    };
};
//menu 18
export const OperationRoom = (data) => {
    window.localStorage.setItem('operationRoom',JSON.stringify(data));
    return {
        type: Operation_ROOM,
        payload: data,
    };
};
//menu 25
export const inventoryRoom = (data) => {
    window.localStorage.setItem('inventoryRoom',JSON.stringify(data));
    return {
        type: INVENTORY_ROOM,
        payload: data,
    };
};
//menu 75
export const queueRoom = (data) => {
    window.localStorage.setItem('queueRoom',JSON.stringify(data));
    return {
        type: QUEUE_ROOM,
        payload: data,
    };
};
//menu 80
export const psychiatricRoom = (data) => {
    window.localStorage.setItem('psychiatricRoom',JSON.stringify(data));
    return {
        type: PSYCHIATRIC_ROOM,
        payload: data,
    };
};