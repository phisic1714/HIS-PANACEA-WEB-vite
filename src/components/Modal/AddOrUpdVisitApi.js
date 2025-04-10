import { env } from '../../env.js';
import axios from 'axios';
// GetDropdown
export const GetDropdown = async action => {
  let masters = await `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
  let res = await axios.post(masters).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};
export const GetHospcodes = async () => {
  let request = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "datakey1": "",
      "datakey2": null,
      "datakey3": null,
      "datakey4": null,
      "datakey5": null
    },
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetHospcodes`, request).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};
// เพิ่มสิทธิ์
export const InsPatientsRights = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsPatientsRights`, values)
  /* .then((res) => console.log("Add visit Status : ", res.data.errorMessage)) */.then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
// แก้ไขสิทธิ์
export const UpdPatientsRights = async values => {
  let res = await axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/UpdPatientsRights`, values)
  /* .then((res) => console.log("Update visit Status : ", res.data.errorMessage)) */.then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const apis = {
  GetDropDownMas: {
    url: "Masters/GetDropDownMas",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
}