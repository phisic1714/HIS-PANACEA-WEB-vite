import { env } from '../env.js';
import axios from "axios";
export const GetDrugDes = async r => {
  let req = {
    mode: "string",
    user: "string",
    ip: "string",
    lang: "string",
    branch_id: "string",
    requestData: {
      appointId: r?.appointId || null,
      patientId: r?.patientId || null,
      serviceId: r?.serviceId || null,
      orderId: r?.orderId || null
    },
    barcode: "string"
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetDrugDes`, req).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};