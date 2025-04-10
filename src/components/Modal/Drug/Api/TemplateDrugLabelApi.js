import { env } from '../../../../env.js';
import axios from "axios";
import moment from "moment";
import dayjs from 'dayjs';
const ip_address = localStorage.getItem("ip_address") ? localStorage.getItem("ip_address") : null;
const requestparam = {
  "mode": null,
  "user": null,
  "ip": ip_address,
  "lang": null,
  "branch_id": null,
  "barcode": null
};
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;
export const GetDrugUsingTemplatesAll = async () => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugUsingTemplates/GetDrugUsingTemplatesAll`,
    method: "POST",
    data: {
      ...requestparam
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const InsDrugUsingTemplates = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugUsingTemplates/InsDrugUsingTemplates`,
    method: "POST",
    data: {
      ...requestparam,
      "requestData": {
        "tempUsingId": null,
        "doctor": user,
        "docLabel": param.docLabel1 + (param.docLabel1 && " ") + param.docLabel2 + ((param.docLabel1 || param.docLabel2) && " ") + param.docLabel3 + ((param.docLabel1 || param.docLabel2 || param.docLabel3) && " ") + param.docLabel4 + param.docLabel0,
        "templateName": param.docLabel0,
        "docLabel1": param.docLabel1,
        "docLabel2": param.docLabel2,
        "docLabel3": param.docLabel3,
        "docLabel4": param.docLabel4,
        "userCreated": user,
        "dateCreated": dayjs().format("YYYY-MM-DD"),
        "userModified": null,
        "dateModified": null,
        "expenseId": param?.expenseId
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const UpdDrugUsingTemplates = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugUsingTemplates/UpdDrugUsingTemplates`,
    method: "PUT",
    data: {
      ...requestparam,
      "requestData": {
        "tempUsingId": param.tempUsingId,
        "doctor": user,
        "docLabel": param.docLabel1 + (param.docLabel1 && " ") + param.docLabel2 + ((param.docLabel1 || param.docLabel2) && " ") + param.docLabel3 + ((param.docLabel1 || param.docLabel2 || param.docLabel3) && " ") + param.docLabel4,
        "templateName": param.docLabel0,
        "docLabel1": param.docLabel1,
        "docLabel2": param.docLabel2,
        "docLabel3": param.docLabel3,
        "docLabel4": param.docLabel4,
        "userCreated": param.userCreated,
        "dateCreated": param.dateCreated,
        "userModified": user,
        "dateModified": moment().format("YYYY-MM-DD")
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const DelDrugUsingTemplates = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugUsingTemplates/DelDrugUsingTemplates?TempUsingId=${param.tempUsingId}`,
    method: "DELETE"
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

export const apis = {
  GetDrugUsingTemplatesfilter: {
    url: "DrugUsingTemplates/GetDrugUsingTemplatesfilter",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
}