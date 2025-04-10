import { env } from '../env.js';
import axios from "axios";
export const GetDropDownMas = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`,
    method: "POST",
    data: {
      requestData: {
        "table": param?.table,
        "page": param?.page,
        "field": param?.field
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlacesMed = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMed`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlacesMasMedIpd = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMasMedIpd`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlacesStore = async () => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesStore`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDoctorMas = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDoctorMas`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDrugComponent = async () => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDrugComponent`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDischargeTypes = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDischargeTypes`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
//60.1
export const GetWorkPlacesThaiTraditionalMedicine = async () => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesThaiTraditionalMedicine`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};