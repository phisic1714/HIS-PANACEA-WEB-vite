import { env } from '../../../../env.js';
import axios from "axios";
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;
export const GetDrugLabels = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugLabels/GetDrugLabels`,
    method: "POST",
    data: {
      requestData: param.drugLabel
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
export const InsDrugLabels = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugLabels/InsDrugLabels`,
    method: "POST",
    data: {
      requestData: {
        code: param.drugLabel,
        name: param.drugUsingLabel,
        eName: null,
        dose: param.dose || 0,
        frequency: param.frequency || 0,
        mapping1: null,
        mapping2: null,
        mapping3: null,
        mapping4: null,
        mapping5: null,
        userCreated: user,
        dateCreated: null,
        userModified: null,
        dateModified: null,
        cancelFlag: null
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const UpdDrugLabels = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugLabels/UpdDrugLabels`,
    method: "PUT",
    data: {
      requestData: {
        code: param.drugLabel,
        name: param.drugUsingLabel,
        eName: null,
        dose: param.dose || 0,
        frequency: param.frequency || 0,
        mapping1: null,
        mapping2: null,
        mapping3: null,
        mapping4: null,
        mapping5: null,
        userCreated: null,
        dateCreated: null,
        userModified: user,
        dateModified: null,
        cancelFlag: null
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

//เพิ่มสูตรยา
export const InsDrugFormulas = async param => {
  let listFormulaExpenses = param.listFormulaExpenses.map(val => {
    return {
      ...val,
      formulaExpId: 0,
      formulaId: 0,
      expenseId: val.expenseId,
      quantity: val.quantity,
      userCreated: user,
      dateCreated: null,
      userModified: null,
      drugUsing: val.drugUsing,
      drugTiming: val.drugTiming,
      drugWarning: val.drugWarning,
      drugProperty: val.drugProperty,
      drugLabel: val.drugLabel,
      // drugLabelName: val.drugLabelName,
      dose: val.dose ? `${val?.multiply ? 0 : val.dose}` : "0",
      doseText: val?.doseText || (val?.multiply ? val?.dose : null),
      duration: val.duration,
      reason: null,
      route: val.route,
      dosingInterval: val.dosingInterval,
      docRemark: val.docRemark,
      docLabel1: val.docLabel1,
      docLabel2: val.docLabel2,
      docLabel3: val.docLabel3,
      docLabel4: val.docLabel4,
      sachet: 0,
      dosingUnit: val.dosingUnit,
      dosingTime: val.dosingTime,
      alternateDay: val.alternateDay,
      otherDosingInterval: val.otherDosingInterval,
      drugAdmin: val.drugAdmin,
      mapping1: null,
      doseM: val?.doseM,
      doseL: val?.doseL,
      doseN: val?.doseN,
      doseE: val?.doseE,
      doseB: val?.doseB
    };
  });
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/InsDrugFormulas`,
    method: "POST",
    data: {
      requestData: {
        orderFormulas: {
          formulaId: null,
          name: param.formulaName,
          eName: null,
          workId: param.workId,
          userId: param.userId,
          financeType: "D",
          formulaType: param.formulaType,
          seq: null,
          userCreated: user,
          dateCreated: null,
          userModified: null,
          dateModified: null,
          cancelFlag: null,
          icd: param.icd,
          mapping1: param.icd,
          depart: null,
          specialty: null
        },
        listFormulaExpenses: listFormulaExpenses
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

//ข้อมูลรายการยาทั้งหมดภายในสูตรยา
export const GetFormulaExpensesbyFormulaId = async formulaId => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/FormulaExpenses/GetFormulaExpensesbyFormulaId/${formulaId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

//เพิ่มเติม ยาในสูตร
export const InsListFormulaExpenses = async param => {
  let listFormulaExpenses = param.listFormulaExpenses.map(val => {
    return {
      ...val,
      formulaExpId: 0,
      formulaId: val.formulaId,
      expenseId: val.expenseId,
      quantity: val.quantity,
      userCreated: user,
      dateCreated: null,
      userModified: null,
      drugUsing: val.drugUsing,
      drugTiming: val.drugTiming,
      drugWarning: val.drugWarning,
      drugProperty: val.drugProperty,
      drugLabel: val.drugLabel,
      dose: val.dose ? `${val?.multiply ? 0 : val.dose}` : "0",
      doseText: val?.doseText || (val?.multiply ? val?.dose : null),
      duration: val.duration,
      reason: null,
      route: val.route,
      dosingInterval: val.dosingInterval,
      docRemark: val.docRemark,
      docLabel1: val.docLabel1,
      docLabel2: val.docLabel2,
      docLabel3: val.docLabel3,
      docLabel4: val.docLabel4,
      sachet: 0,
      dosingUnit: val.dosingUnit,
      dosingTime: val.dosingTime,
      alternateDay: val.alternateDay,
      otherDosingInterval: val.otherDosingInterval,
      drugAdmin: val.drugAdmin,
      mapping1: null
    };
  });
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/FormulaExpenses/InsListFormulaExpenses`,
    method: "POST",
    data: {
      requestData: listFormulaExpenses
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

//แก้ไขสูตรยา
export const UpdOrderFormulas = async param => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OrderFormulas/UpdOrderFormulas`,
    method: "PUT",
    data: {
      requestData: {
        formulaId: param.formulaId,
        name: param.formulaName,
        eName: null,
        workId: param.workId,
        userId: param.userId,
        financeType: "D",
        formulaType: param.formulaType,
        seq: null,
        userCreated: null,
        dateCreated: null,
        userModified: user,
        dateModified: null,
        cancelFlag: null,
        icd: param.icd,
        mapping1: param.icd,
        depart: null,
        specialty: null
      }
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

//แก้ไข ยาในสูตร
export const UpdListFormulaExpenses = async param => {
  let listFormulaExpenses = param.listFormulaExpenses.map(val => {
    return {
      ...val,
      formulaExpId: val.formulaExpId,
      formulaId: val.formulaId,
      expenseId: val.expenseId,
      quantity: val.quantity,
      userCreated: user,
      dateCreated: null,
      userModified: null,
      drugUsing: val.drugUsing,
      drugTiming: val.drugTiming,
      drugWarning: val.drugWarning,
      drugProperty: val.drugProperty,
      drugLabel: val.drugLabel,
      dose: val.dose ? `${val?.multiply ? 0 : val.dose}` : "0",
      doseText: val?.doseText || (val?.multiply ? val?.dose : null),
      duration: val.duration,
      reason: null,
      route: val.route,
      dosingInterval: val.dosingInterval,
      docRemark: val.docRemark,
      docLabel1: val.docLabel1,
      docLabel2: val.docLabel2,
      docLabel3: val.docLabel3,
      docLabel4: val.docLabel4,
      sachet: 0,
      dosingUnit: val.dosingUnit,
      dosingTime: val.dosingTime,
      alternateDay: val.alternateDay,
      otherDosingInterval: val.otherDosingInterval,
      drugAdmin: val.drugAdmin,
      mapping1: null
    };
  });
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/FormulaExpenses/UpdListFormulaExpenses`,
    method: "PUT",
    data: {
      requestData: listFormulaExpenses
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

//ลบยาในสูตร
export const DelListFormulaExpenses = async expenseList => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/FormulaExpenses/DelListFormulaExpenses`,
    method: "DELETE",
    data: expenseList
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const GetDropdown = async action => {
  let masters = await `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
  let res = await axios.post(masters).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};

//ลบสูตรยา
export const DelListFormulas = async formulasList => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/FormulaExpenses/DelListFormulas`,
    method: "DELETE",
    data: formulasList
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
export const ChkDupFormulaName = async param => {
  let masters = await `${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/ChkDupFormulaName/${param.formulaName}, ${param.formulaId}, ${param.action}`;
  let res = await axios.get(masters).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};