import { env } from '../../../env.js';
import axios from "axios";
export const CancelDischargePatientFetch = async values => {
  // (Get Cancel Discharge Patient) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/CancelDischargePatient`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        admitId: values.admitId,
        ward: values.ward,
        patientId: values.patientId,
        bed: values.bed,
        moveReason: values.moveReason
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const DischargePatientFetch = async values => {
  // (Get Discharge Patient) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/DischargePatient`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        admitId: values.admitId,
        dischDate: values.dischDate,
        dischTime: values.dischTime,
        dischDoctor: values.dischDoctor,
        dischType: values.dischType,
        dischStatus: values.dischStatus,
        dischRemark: values.dischRemark
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAdmitRightDetailDisplayFetch = async values => {
  // (Get Admit Right Detail Display) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitRightDetailDisplay`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "1"
        admitId: values.admitId,
        serviceId: values.serviceId,
        workId: values.workId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getLabMonitorDisplayFetch = async values => {
  // (Get Lab Monitor Display) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetLabMonitorDisplay`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "66"
        admitId: values.admitId,
        serviceId: values.serviceId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getAppointDisplayFetch = async patientId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetAppointsOpdVisit/` + patientId).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};
export const getAdmitRightPopupFetch = async values => {
  // (Get Admit Right Popup) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitRightPopup`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "1"
        admitId: values.admitId,
        serviceId: values.serviceId,
        workId: values.workId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getAdmitRightDisplayFetch = async values => {
  // (Get Admit Right Display) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitRightDisplay`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "1"
        admitId: values.admitId,
        serviceId: values.serviceId,
        workId: values.workId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getAdmitDetailFetch = async values => {
  // (Get Admit Detail) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitDetail`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "1"
        admitId: values.admitId,
        serviceId: values.serviceId,
        workId: values.workId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const ipdSummaryFinanceFetch = async values => {
  // (Ipd Summary Finance) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/IpdSummaryFinance`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: values.patientId,
        // "1"
        rightId: values.rightId,
        admitId: values.admitId,
        // "123100"
        startDate: values.startDate,
        endDate: values.endDate,
        ward: values.ward,
        admitRightId: values.admitRightId
      },
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getAdmitDocVisitFetch = async values => {
  // (Get Admit Doc Visit) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitDocVisit`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        admitId: values.admitId // "123100"
      },

      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getUrgentTypesFetch = async () => {
  // (Get urgentType) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetUrgentTypes`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getFoodTypeFetch = async () => {
  // (Get ) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFoodType`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getFoodGroupFetch = async () => {
  // (Get ) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFoodGroup`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getFoodSupplementMasFetch = async () => {
  // (Get ) : [/]
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFoodSupplementMas`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getDischargeTypeFetch = async () => {
  // (Get GetDischargeTypes) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDischargeTypes`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const getDischargeStatusFetch = async () => {
  // (Get GetDischargeStatus) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDischargeStatus`,
    method: "POST"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const updAdmitFetch = async values => {
  // (Update Admit) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/UpdAdmit`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: values,
      barcode: null
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

// ConsultId = 11714558
export const getConsultDetailFetch = async ConsultId => {
  // (Get Consult Detail) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetConsultDetail/${ConsultId}`,
    method: "GET"
    // data: {}
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const updateConsultOpdClinicFetch = async values => {
  // (Update Admit) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpdateConsultOpdClinic`,
    method: "PUT",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        clinicId: values.clinicId,
        // <==ใส่ consultid
        doctor: values.doctor,
        workId: values.workId,
        consult: values.consult,
        consultReason: values.consultReason,
        urgent: values.urgent,
        chiefComplaint: values.chiefComplaint,
        presentIllness: values.presentIllness,
        familyHistory: values.familyHistory,
        physicalExam: values.physicalExam,
        clinicalFinding: values.clinicalFinding,
        doctorNote: values.doctorNote
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
export const deleteConsultOpdClinicFetch = async ConsultId => {
  // (Get Consult Detail) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/DeleteConsultOpdClinic?ConsultId=${ConsultId}`,
    method: "DELETE"
    // data: {}
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const DischargePatient = async req => {
  // (Update Admit) : []
  let request = {
    mode: null,
    user: null,
    ip: null,
    lang: null,
    branch_id: null,
    requestData: req,
    barcode: null
  };
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/DischargePatient`,
    method: "POST",
    data: request
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const PrepareWaitAdmitPatient = async data => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/PrepareWaitAdmitPatient`,
    method: "POST",
    data: {
      requestData: data
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetWorkPlaces = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlaces_Dashboard_Mas`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetBedWardMas = async val => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetBedWardMas/${val}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAvaliableBed = async val => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/CheckAvaliableBed/${val}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetUserMas = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetUserMas`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetBedsDepartList = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetBedsDepartList`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDocSpecialties = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDocSpecialties`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetUrgentTypes = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetUrgentTypes`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetFoodType = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFoodType`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetFoodGroup = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetFoodGroup`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAwailableBed = async val => {
  if (val) {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/CheckAvaliableBed/${val}`).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    return res;
  } else {
    return null;
  }
};
export const GetWaitAdmitPatientDetail = async val => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetWaitAdmitPatientDetail/${val}`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetPatients = async values => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/${values}`,
    method: "GET"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const MoveAdmitBedPatient = async data => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/MoveAdmitBedPatient`,
    method: "POST",
    data: {
      requestData: data
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const MoveAdmitWardPatient = async data => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/MoveAdmitWardPatient`,
    method: "POST",
    data: {
      requestData: data
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const UpdAdmitBedPatient = async data => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/UpdAdmitBedPatient`,
    method: "POST",
    data: {
      requestData: data
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetAdmitWardDateInDateOutLength = async wardId => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitWardDateInDateOutLength/${wardId}`,
    method: "GET"
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const InsDoctorVisit = async data => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/InsDoctorVisit`,
    method: "POST",
    data: {
      requestData: data
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const UpsertDoctorVisit = async values => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/UpsertDoctorVisit`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: values,
      barcode: null
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDoctorVisitDetail = async values => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetDoctorVisitDetail/${values}`,
    method: "GET"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const DelDoctorVisit = async progressId => {
  // (Get Consult Detail) : []
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/DelDoctorVisit`,
    method: "DELETE",
    // data: {}
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: progressId,
      barcode: null
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};