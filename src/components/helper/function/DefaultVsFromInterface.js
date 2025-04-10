import { env } from '../../../env.js';
import axios from 'axios';
export const defaultVsFromInterface = async ({
  patientId = null,
  clinicId = null,
  admitId = null,
  form = null,
}) => {
  if (patientId) {
    const req = {
      patientId,
      clinicId,
      admitId: admitId,
    };
    const res = await GetVitalSignByPatientId(req);
    // console.log('GetVitalSignByPatientId', res)
    if (res?.clinicId) {
      if (form) {
        const urgent = form.getFieldValue('urgent');
        form.setFieldsValue({
          ...res,
          map: res?.map ? Number(res.map).toFixed(2) : null,
          urgent: urgent || res?.urgent,
        });
      }
    }
    return res || null
  } else return
};
const GetVitalSignByPatientId = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/VitalSigns/SearchVitalSignByPatientId`,
    method: "POST",
    data: {
      requestData: req
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};