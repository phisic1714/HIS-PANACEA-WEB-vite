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
export const GetDiscountList = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OutpatientFinance/GetDiscountList`,
    method: "POST",
    data: {
      ...requestparam,
      requestData: {
        "patientId": param?.patientId || null,
        "serviceId": param?.serviceId || null,
        "admitId": param?.admitId || null,
        "opdipd": param?.opdipd || null,
        "discountId": param?.discountId || null
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};