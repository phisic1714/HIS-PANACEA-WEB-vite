import axios from "axios";
import { env } from '../../../../env.js';
import dayjs from "dayjs";

const ip_address = localStorage.getItem("ip_address") ? localStorage.getItem("ip_address") : null;
const requestparam = {
    mode: null,
    user: null,
    ip: ip_address,
    lang: null,
    branch_id: null,
    barcode: null
};

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
let user = userFromSession.responseData.userId;

export const GetNarcoticModal = async (orderId) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetNarcoticModal/${orderId}`).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};

export const UpdateRecivesNarcotic = async (param) => {
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/UpdateRecivesNarcotic`,{
        ...requestparam,
        requestData: {
            userId: user,
            nacrosId: param?.nacrosId,
            remark: param?.remark,
            NacrosDate: param.nacrosDate ? dayjs(param.nacrosDate).format("YYYY-MM-DD"):null,
            RecivesNarcotic: param.recivesNarcotic ? "Y":null
        }
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};