import { env } from '../../env.js';
import axios from 'axios';

// General
export const GetServiceLastest = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetService_Latest/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetPatientAdmitIpdCardDetail = async admitId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/AdmissionCenter/GetPatientAdmitIpdCardDetail/` + admitId).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAppointHistory = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetAppointHistory/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAppointDetail = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetAppointHistoryActivityDetail/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAdmitHistory = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetAdmit_History/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAdmit = async patientId => {
  // Get Admit -35 [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/AdmissionCenter/GetAdmit/${patientId}`,
    method: "GET",
    data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetStatusHistory = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetStatusHistory/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetPatientsHistoryCard = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsHistoryCard/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetPatientsRequestCard = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsRequestCard/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetOpdCardLatest = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetOpdCard_Latest/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetMasterChkDup = async param => {
  let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetMasterChkDup`, {
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        field: "IdCard",
        code: param.idCard,
        total: null
      },
      barcode: null
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};