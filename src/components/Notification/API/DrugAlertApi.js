import { env } from '../../../env.js';
import axios from "axios";
export const GetOpdExpenseNamefinancesDrug = async () => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdExpenseNamefinancesDrug?type=DM`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//แพ้ยา
export const GetOpdChkPatientDrugAllergiesfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkPatientDrugAllergiesfinancesDrug/${param.patientId}, ${param.generic}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//แพ้กลุ่มยา
export const GetOpdChkPtDgAdrsfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkPtDgAdrsfinancesDrug/${param.patientId}, ${param.drugGroup}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

// แพ้ส่วนประกอบยา
export const GetOpdChkPatientExpAllerygiesfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkPatientExpAllerygiesfinancesDrug/${param.patientId}, ${param.expendId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยาที่ทำปฏิกิริยา
export const GetOpdDrugInteractionsfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugInteractionsfinancesDrug/${param.generic1}, ${param.generic2}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//HIGH ALERT DRUG
export const GetOpdHighalertfinancesDrug = async code => {
  //code จาก expense
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdHighalertfinancesDrug/${code}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับเพศ
export const GetOpdDrugGenderfinancesDrug = async code => {
  //code จาก expense
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugGenderfinancesDrug/${code}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับโรค
export const GetOpdDrugUnderlyingDiseasesfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugUnderlyingDiseasesfinancesDrug/${param.generic}, ${param.udId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับอายุ และ OVER DOSE
export const GetOpdChkDrugUsualDosesfinancesDrug = async expenseId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkDrugUsualDosesfinancesDrug/${expenseId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับสตรีมีครรภ์ให้นมบุตร
export const GetOpdPregnancyOrBreastfeedingfinancesDrug = async code => {
  //code จาก expense
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdPregnancyOrBreastfeedingfinancesDrug/${code}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยา กับ LAB
/* export const GetOpdChkDrugLabCriticalsfinancesDrug = async (param) => {
    let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkDrugLabCriticalsfinancesDrug/${param.labDomain}, ${param.generic}`)
        .then((res) => { return res.data.responseData })
        .catch((error) => { return error })
    return res;
} */
export const GetOpdChkDrugLabCriticalsfinancesDrug = async param => {
  // let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkDrugLabCriticalsfinancesDrug/${param.generic}, ${param.patientId}`)
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkDrugLabCriticalsfinancesDrug/${param.patientId}, ${param.generic}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยา NED
export const GetOpdIsedfinancesDrug = async code => {
  //code จาก expense
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdIsedfinancesDrug/${code}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetOpdNedfinancesDrug = async rightId => {
  //code จาก expense
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdNedfinancesDrug/${rightId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับแพทย์ และ ยากับสาขาแพทย์
export const GetOpdDrugDoctorsfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugDoctorsfinancesDrug/${param.expenseId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetOpdDrugDocSpecialtiesfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugDocSpecialtiesfinancesDrug/${param.expenseId}, ${param.doctorId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับหน่วยงาน
export const GetExpenseWorkPlacesfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetExpenseWorkPlacesfinancesDrug/${param.expenseId}, ${param.workId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยากับ STOCK
export const GetOpdInventoriesfinancesDrug = async goodsId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdInventoriesfinancesDrug/${goodsId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//สิทธิ์
export const GetOpdchkExpenseRightsPopupTextfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdchkExpenseRightsPopupTextfinancesDrug/${param.expenseId}, ${param.rightId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยา DUE, ข้อความของห้องยา, ข้อความของแพทย์
export const GetOpdchkExpensefinancesDrug = async expenseId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdchkExpensefinancesDrug/${expenseId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//จ่ายยาซ้ำซ้อน
export const GetOpdchkfinancesDrug = async param => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdchkfinancesDrug/${param.patientId}, ${param.expenseId}, ${param.date}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//ยาราคาแพง, ยาเสพติด, ยาอันตราย, ยาละลายลิ่มเลือด, ลายเซ็นแพทย์
export const GetPopUpFinancesDrugDisPlay = async expenseId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetPopUpFinancesDrugDisPlay/${expenseId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//แพ้ยาข้ามกลุ่ม
export const GetOpdChkPatientExpAllerygiesDrugAcross = async (patientId,expenseId) => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkPatientExpAllerygiesDrugAcross?PatientId=${patientId}&ExpenseId=${expenseId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};