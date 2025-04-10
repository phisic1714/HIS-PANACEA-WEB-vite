import axios from "axios";
import { env } from '../../../../env.js';

const ip_address = localStorage.getItem("ip_address") ? localStorage.getItem("ip_address") : null;
const requestparam = {
    mode: null,
    user: null,
    ip: ip_address,
    lang: null,
    branch_id: null,
    barcode: null
};

// const userFromSession = JSON.parse(sessionStorage.getItem("user"));
// let user = userFromSession.responseData.userId;

export const GetAllExpenseInDrugGroup = async (drugGroupId) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PharmaceuticalDrug/GetAllExpenseInDrugGroup/${drugGroupId}`).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetDrugAllergySet = async (drugGroupId) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetDrugAllergySet?Druggroup=${drugGroupId}`).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetDrugOffGroup = async (drugGroupId) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetDrugOffGroup?Druggroup=${drugGroupId}`).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const GetDrugGroupDetailByExpenseId = async (id) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetDrugGroupDetailByExpenseId/${id}`).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const UpSertDrugAllergy = async (param) => {
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/UpSertDrugAllergy`, {
        ...requestparam,
        requestData: param
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};