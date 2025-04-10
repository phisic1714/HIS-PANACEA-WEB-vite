import { env } from '../env.js';
import axios from "axios";
export const GetPatients = async patientId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsDetail/` + patientId).then(res => {
    return res?.data?.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};