import { env } from '../../env.js';
import axios from 'axios';
export const searchPctDrug = async values => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PharmaceuticalDrug/SearchPctDrug`, {
    params: {
      ...values
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getPctDrugMain = async values => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PharmaceuticalDrug/GetPctDrugMain/${values}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};