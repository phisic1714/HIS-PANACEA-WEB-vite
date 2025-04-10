import { env } from '../../../../env.js';
import axios from "axios";
export const EMessage = {
  "getPatientEMessageDetail": async patientId => GET({
    path: `EMessage/GetPatientEMessageDetail/${patientId}`
  }),
  "getPatientEMessageDetailByMessId": async patientId => GET({
    path: `EMessage/GetPatientEMessageDetail/${patientId}`
  }),
  "getListWorkPlace": async () => GET({
    path: `AdminSystem/Role/GetListWorkPlace`
  }),
  "getPatientMessage": async p => POST({
    path: "EMessage/GetPatientMessage",
    data: {
      "requestData": {
        "patientId": p.patientId,
        "workId": p.workId,
        "placeType": p.placeType,
        "isToday": p.isToday,
        //Y => รับข้อความเฉพาะวันนี้กับเมื่อวาน, null => ทุกข้อความ 
        "page": p.page,
        "rows": p.rows
      }
    }
  }),
  "upsertPatientMessage": async p => POST({
    path: "EMessage/UpsertPatientMessage",
    data: {
      "requestData": {
        ...p
      }
    }
  }),
  "GetWorkPlacesMas": async () => POST({
    path: "Masters/GetWorkPlacesMas",
  }),
  "delPatientMessage": async ptMessId => DELETE({
    path: `EMessage/DelPatientMessage/${ptMessId}`
  })
};
export const GET = async request => {
  try {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/${request["path"]}`);
    return res.data;
  } catch (error) {
    return error;
  }
};
export const POST = async request => {
  try {
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${request["path"]}`,
      method: "POST",
      data: request["data"]
    });
    return res.data;
  } catch (error) {
    return error;
  }
};
export const DELETE = async request => {
  try {
    let res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/${request["path"]}`);
    return res.data;
  } catch (error) {
    return error;
  }
};