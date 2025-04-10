import { env } from '../../env.js';
import axios from 'axios';
export const GetAppointsOpdVisit = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdServices/GetAppointsOpdVisit/` + id).then(res => {
    return res.data.responseData[0];
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetOpdServiceRightCash = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetOpdServiceRightCash/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetServiceRight = async values => {
  let req = values.patientType === "opd" ? {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": values.patientId,
      "hn": values.hn,
      "startDate": values.startDate,
      "endDate": values.endDate
    },
    "barcode": null
  } : values.patientType === "ipd" && {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "admitId": values.actionId,
      "patientId": null,
      "startDate": values.startDate,
      "endDate": values.endDate
    },
    "barcode": null
  };
  let path = values.patientType === "opd" ? "OpdRightVisit/GetOpdServiceRight" : values.patientType === "ipd" && "Admits/GetAdmitRightByAdmitID";
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/${path}`, req).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetFinancesRightDisplay = async values => {
  let req = values.patientType === "opd" ? {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": values.patientId,
      "hn": values.hn,
      "an": null,
      "admitId": null,
      "opdRightId": values.actionRightId,
      "admitRightId": null,
      "financeType": values.financeType
    },
    "barcode": null
  } : values.patientType === "ipd" && {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "admitId": values.actionId,
      "admitRightId": values.actionRightId,
      "financeType": values.financeType,
      startDate: values.startDate,
      endDate: values.endDate
    },
    "barcode": null
  };
  let path = values.patientType === "opd" ? "GetFinancesRightOpdDisplay" : values.patientType === "ipd" && "GetFinancesRightIpdDisplay";
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/${path}`, req).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetSelectRights = async values => {
  let req = (await values.patientType) === "opd" ? {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": values.patientId,
      "serviceId": values.actionId
    },
    "barcode": null
  } : values.patientType === "ipd" && {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": values.patientId,
      "admitId": values.actionId
    },
    "barcode": null
  };
  let path = (await values.patientType) === "opd" ? "OpdRightVisit/GetSelectOpdRights" : values.patientType === "ipd" && "Admits/GetSelectIpdRights";
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/${path}`, req).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetLookupViewOpdRight = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetLookupViewOpdRight`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
// โอนค่าใช้จ่าย
export const UpdListFinancesOpdRights = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/UpdListFinancesOpdRights`, req).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const InsListRefFinancesOpdRights = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsListRefFinancesOpdRights`, req).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const UpdListFinancesIpdRights = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/UpdListFinancesIpdRights`, req).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const InsListRefFinancesIpdRights = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/InsListRefFinancesIpdRights`, req).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const DelOpdRightVisitOfDate = async id => {
  let res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DelOpdRightVisitOfDate?opdRightId=` + id).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const DelIpdRight = async id => {
  let res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/DelIpdRight?AdmitRightId=` + id).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};
export const GetFinancesType = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFinancesType`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
// OpdRightVisit
export const GetOpdRightVisit = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetOpdRightVisit`, values).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};
export const InsListOpdRights = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsListOpdRights`,
    method: "POST",
    data: req
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const DelPatientsRights = async id => {
  let res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DelPatientsRights?PtRightId=` + id).then(res => {
    return res.data;
  }).catch(error => console.log(error));
  return res;
};