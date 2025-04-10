import { env } from '../../env.js';
import {toNumber , } from "lodash";
import axios from "axios";
const GetDateCalculatExpenses = async param => {
  // let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/14688, 75`)
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/${param.expenseId}, ${param.rightId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetDateCalculatExpensesTretment = async param => {
  // let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/14688, 75`)
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetCalculatExpensesByTreatmentExpenseId/${param.expenseId}, ${param.rightId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const calculatExpenses = (resData, ipdRate = null, ipdCredit = null, ipdCashReturn = null, patientType = "opd") => {
  let newDataCalculat = {
    ...resData
  };
  //หาราคา
  if (ipdRate !== null || resData?.opdRate !== null) {
    newDataCalculat.rate = ipdRate || resData.opdRate;
  } else {
    if (resData?.minRate === resData?.maxRate) {
      newDataCalculat.rate = resData.maxRate;
    } else {
      newDataCalculat.rate = newDataCalculat.minRate = resData?.minRate;
      newDataCalculat.maxRate = resData?.maxRate;
    }
  }
  //หาเครดิต เบิกได้
  if (resData?.cashFlag === "Y") {
    newDataCalculat.credit = "0";
    if (ipdCashReturn !== null || resData?.opdCashReturn !== null) {
      newDataCalculat.cashReturn = ipdCashReturn || resData.opdCashReturn;
    } else {
      if (resData?.cscdFlag === "Y") {
        newDataCalculat.cashReturn = resData?.cscdRate;
      } else {
        newDataCalculat.cashReturn = "0";
      }
    }
  } else {
    if (ipdCredit !== null || resData?.opdCredit !== null) {
      newDataCalculat.credit = ipdCredit || resData.opdCredit;
      newDataCalculat.cashReturn = ipdCashReturn || resData?.opdCashReturn;
    } else if (resData?.opdDrugRightMeaningFlagfinancesDrug) {
      let meaningList = [{
        meaning: "isAlien",
        flag: "alienFlag",
        rate: "alien"
      }, {
        meaning: "isSso",
        flag: "ssoFlag",
        rate: "sso"
      }, {
        meaning: "isNhso",
        flag: "nhsoFlag",
        rate: "nhso"
      }, {
        meaning: "isInsurance",
        flag: "insuranceFlag",
        rate: "insurance"
      }, {
        meaning: "isCscd",
        flag: "cscdFlag",
        rate: "cscd"
      }];
      for (let val of meaningList) {
        if (resData?.opdDrugRightMeaningFlagfinancesDrug[val.meaning]) {
          if (resData[val.flag] === "Y") {
            newDataCalculat.credit = resData[`${val.rate}${patientType === "ipd" ? "Ipd" : ""}Rate`];
            newDataCalculat.cashReturn = "0";
          }
        }
      }
    } else {
      let meaningList = [{
        meaning: "A",
        flag: "alienFlag",
        rate: "alien"
      }, {
        meaning: "S",
        flag: "ssoFlag",
        rate: "sso"
      }, {
        meaning: "U",
        flag: "nhsoFlag",
        rate: "nhso"
      }, {
        meaning: "I",
        flag: "insuranceFlag",
        rate: "insurance"
      }, {
        meaning: "G",
        flag: "cscdFlag",
        rate: "cscd"
      }];
      for (let val of meaningList) {
        if (resData?.meaningFlag === val.meaning) {
          if (resData[val.flag] === "Y") {
            newDataCalculat.credit = resData[`${val.rate}${patientType === "ipd" ? "Ipd" : ""}Rate`];
            newDataCalculat.cashReturn = "0";
          }
        }
      }
    }
  }
  //หาเบิกไม่ได้
  newDataCalculat.cashNotReturn = String(toNumber(newDataCalculat.rate) - toNumber(newDataCalculat.credit || 0) - toNumber(newDataCalculat.cashReturn || 0));
  newDataCalculat.popUp = resData?.expenseRightPopupText;
  return newDataCalculat;
};
export const calcExpense = async (expenseId, rightId, patientType = "opd", treatment = false) => {
  let newDataCalculat = {};
  let resData = null;
  // let resData = await GetDateCalculatExpenses({ expenseId: expenseId, rightId: rightId })
  if (!treatment) resData = await GetDateCalculatExpenses({
    expenseId: expenseId,
    rightId: rightId
  });
  if (treatment) resData = await GetDateCalculatExpensesTretment({
    expenseId: expenseId,
    rightId: rightId
  });
  // console.log('resData :>> ', resData);
  if (resData) {
    if (patientType === "ipd") {
      newDataCalculat = calculatExpenses(resData, resData?.ipdRate, resData?.ipdCredit, resData?.ipdCashReturn, patientType);
    } else {
      newDataCalculat = calculatExpenses(resData);
    }
  }
  // console.log("newDataCalculat", newDataCalculat);
  return newDataCalculat;
};