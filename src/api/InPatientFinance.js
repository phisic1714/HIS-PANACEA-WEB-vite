import { env } from '../env.js';
import axios from "axios";
const ip_address = localStorage.getItem("ip_address") ? localStorage.getItem("ip_address") : null;
const requestparam = {
  "mode": null,
  "user": null,
  "ip": ip_address,
  "lang": null,
  "branch_id": null,
  "barcode": null
};
export const GetDiscount = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/InPatientFinance/GetDiscount`,
    method: "POST",
    data: {
      ...requestparam,
      requestData: {
        "patientId": param?.patientId || null,
        "serviceId": param?.serviceId || null,
        "admitId": param?.admitId || null,
        "date": param?.date || null,
        "userId": param?.userId || null,
        "workId": param?.workId || null,
        "orderId": param?.orderId || null,
        "startDate": param?.startDate || null,
        "endDate": param?.endDate || null
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};