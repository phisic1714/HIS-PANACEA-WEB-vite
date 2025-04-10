import { env } from '../../env.js';
import axios from "axios";
export const patientSearch = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsSearch`, values).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetCountPatientsSearch = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsTotalSearch`, values).then(res => {
    return res.data.responseData.totalPatient;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAdmitsSearch = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitsSearch`, values).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetTotalAdmitsSearch = async values => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetTotalAdmitsSearch`, values).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetListAdmintsIdByPatient = async patientId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetListAdmintsIdByPatient/${patientId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetListServicesIdByPatient = async patientId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdServices/GetListServicesIdByPatient/${patientId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlacesRGST = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesRGST`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlacesByPlaceType = async PlaceType => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesByPlaceType/${PlaceType}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetLastWorkPlacesByPlaceType = async PlaceType => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/last-work-places-by-placetype/${PlaceType}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};