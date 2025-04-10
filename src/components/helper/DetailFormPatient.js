import { env } from '../../env.js';
import PropTypes from 'prop-types';
import axios from 'axios';
const initialData = {
  patient: null,
  inPatient: {
    selectPatient: null,
    admitList: [],
    detail: null
  },
  outPatient: {
    opdPatientDetails: null,
    serviceList: [],
    detail: null
  }
};
async function DetailFormPatient({
  patientId,
  admitId,
  serviceId
}) {
  let data = {
    patient: null,
    inPatient: {
      selectPatient: null,
      admitList: [],
      detail: null
    },
    outPatient: {
      opdPatientDetails: null,
      serviceList: [],
      detail: null
    }
  };
  if (patientId) {
    // let patient = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/${patientId}`)
    //     .then((res) => { return res.data })
    //     .catch((error) => { return error })
    // if (patient?.isSuccess) {
    //     console.log("patient", patient);
    //     data.outPatient.detail = patient.responseData
    //     data.inPatient.detail = patient.responseData
    // } else {
    //     data = initialData
    // }

    let patientDetail = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetPatientByID`, {
      "mode": "string",
      "user": "string",
      "ip": "string",
      "lang": "string",
      "branch_id": "string",
      "requestData": {
        "patientId": patientId,
        "admitId": admitId || null,
        "serviceId": serviceId || null,
        "workId": null
      },
      "barcode": "string"
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (patientDetail?.isSuccess) {
      console.log("patientDetail", patientDetail);
      data.patient = patientDetail.responseData;
      data.outPatient.detail = {
        ...patientDetail.responseData,
        ...patientDetail?.responseData.services
      };
      data.inPatient.detail = {
        ...patientDetail.responseData,
        ...patientDetail?.responseData.services
      };
    } else {
      data = initialData;
    }
    let serviceList = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdServices/GetListServicesIdByPatient/${patientId}`).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (serviceList?.isSuccess) {
      // console.log("serviceList", serviceList);
      data.outPatient.serviceList = serviceList.responseData;
    } else {
      data = {
        ...data,
        outPatient: {
          ...data.outPatient,
          serviceList: []
        }
      };
    }
    //     serviceList = serviceList.map((val) => {
    //     return {
    //         ...val,
    //     };
    // });
    let admitList = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetListAdmintsIdByPatient/${patientId}`).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (admitList?.isSuccess) {
      // console.log("admitList", admitList);
      data.inPatient.admitList = admitList.responseData;
    } else {
      data = {
        ...data,
        inPatient: {
          ...data.inPatient,
          admitList: []
        }
      };
    }
    //     admitList = admitList.map((val) => {
    //     return {
    //         ...val,
    //     };
    // });
  }

  return data;
}
DetailFormPatient.propTypes = {
  patientId: PropTypes.string,
  admitId: PropTypes.string,
  serviceId: PropTypes.string
};
export default DetailFormPatient;