import { env } from '../../env.js';
import { httpPanaceas } from "../../util/Api";
export const getHospitalByHospCode = async () => {
  const result = await httpPanaceas.get(`OPDClinic/GetHospitalByHospCode?HospCode=${env.REACT_APP_CODE_HOSPITAL}`).then(({
    data
  }) => {
    if (data.isSuccess) {
      console.log(data);
      localStorage.setItem("hos_param", JSON.stringify(data.responseData));
      return data.responseData;
    // eslint-disable-next-line no-empty
    } else {}
  }).catch(function (error) {
    return error;
  });
  return result;
};