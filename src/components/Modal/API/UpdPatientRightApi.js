import { env } from '../../../env.js';
import axios from "axios";

// รายละเอียดการเคลม------------------------------
export const GetillnessType = async () => {
    let res = await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`,
        method: "POST",
        data: {
            requestData: {
                table: "TB_OPD_RIGHTS",
                page: null,
                field: "IllnessType"
            }
        }
    }).then(res => {
        return res.data.responseData;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetServiceSetting = async () => {
    let res = await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`,
        method: "POST",
        data: {
            requestData: {
                table: "TB_OPD_RIGHTS",
                page: null,
                field: "ServiceSetting"
            }
        }
    }).then(res => {
        return res.data.responseData;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetInsurance = async requestData => {
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/IClaim/Insurance`, {
        method: "POST",
        data: requestData
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const CheckAccidentHistory = async requestData => {
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/IClaim/CheckAccidentHistory`, {
        method: "POST",
        data: requestData
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetAllInsurance = async requestData => {
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/IClaim/GetAllInsurance`, {
        method: "POST",
        data: requestData
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetIdType = async () => {
    let res = await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`,
        method: "POST",
        data: {
            requestData: {
                table: "TB_OPD_RIGHTS",
                page: null,
                field: "idType"
            }
        }
    }).then(res => {
        return res.data.responseData;
    }).catch(error => {
        return error;
    });
    return res;
};

//จองสิทธิ์ผู้ป่วยใน
export const ClaimReservation = async request => {
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/IClaim/ClaimReservation`, {
        method: "POST",
        data: request
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};