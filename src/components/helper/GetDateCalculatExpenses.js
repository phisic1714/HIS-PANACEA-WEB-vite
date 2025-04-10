import axios from "axios";
import { toNumber } from "lodash";
import { env } from '../../env.js';
const GetDateCalculatExpenses = async param => {
  // let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/14688, 75`)
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/${param.expenseId}, ${param.rightId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const calculatExpenses = (resData, ipdRate = null, ipdCredit = null, ipdCashReturn = null, patientType = "opd") => {
  // console.log('resData', resData)
  // console.log('ipdRate', ipdRate)
  let newDataCalculat = {};
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
      // console.log('ipdCredit !== null || resData?.opdCredit !== null', resData)
      // newDataCalculat.credit = ipdCredit || resData.opdCredit; //Bank
      // newDataCalculat.cashReturn = ipdCashReturn || resData?.opdCashReturn; //Bank
      if (patientType === "opd") {
        newDataCalculat.credit = resData.opdCredit || ipdCredit;
        newDataCalculat.cashReturn = resData?.opdCashReturn || ipdCashReturn;
      } else {
        newDataCalculat.credit = ipdCredit || resData.opdCredit;
        newDataCalculat.cashReturn = ipdCashReturn || resData?.opdCashReturn;
      }
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
  const cashNotReturn = toNumber(newDataCalculat.rate) - (toNumber(newDataCalculat.credit || 0) + toNumber(newDataCalculat.cashReturn || 0))
  newDataCalculat.cashNotReturn = String(cashNotReturn < 0 ? 0 : cashNotReturn);
  newDataCalculat.popUp = resData?.expenseRightPopupText;
  newDataCalculat.code = resData.code;
  newDataCalculat.quantity = resData.quantity;
  newDataCalculat.distance = resData.distance;
  if (!newDataCalculat?.maxRate) {
    const rate = toNumber(newDataCalculat.rate || 0)
    const credit = toNumber(newDataCalculat.credit || 0)
    if (credit > rate) {
      newDataCalculat.credit = newDataCalculat.rate
    }
  }
  // console.log('newDataCalculat', newDataCalculat)
  return newDataCalculat;
};
export const getDateCalculatExpenses = async ({
  expenseId = null,
  rightId = "x000",
  patientType = "opd"
}) => {
  let newDataCalculat = {};
  let resData = await GetDateCalculatExpenses({
    expenseId: expenseId,
    rightId: rightId
  });
  // console.log('patientType resData :>> ', resData, patientType);
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
export const calcExpense = (expenseDetails, patientType = "opd") => {
  if (!expenseDetails) return null
  const ipdRate = patientType === "ipd" ? expenseDetails?.ipdRate : null;
  const ipdCredit = patientType === "ipd" ? expenseDetails?.ipdCredit : null;
  const ipdCashReturn = patientType === "ipd" ? expenseDetails?.ipdCashReturn : null;
  const result = calculatExpenses(expenseDetails, ipdRate, ipdCredit, ipdCashReturn, patientType)
  return result
}
export const calcByDiatanceAndQuantity = ({
  calcExpenseResult = null, //ผลการคํานวณค่าใช้จ่ายกับสิทธิ์
  isChangeExpense = false, //ถ้าเป็นการเปลี่ยน ExpenseId ส่ง true
  quantity = 1, // ส่งเสมอนอกจากการเปลี่ยน ExpenseId
}) => {
  if (!calcExpenseResult) { // กรณีไม่มีข้อมูล
    return {
      rate: 0,
      credit: 0,
      cashReturn: 0,
      cashNotReturn: 0,
    }
  }
  const calc = ({
    calcExpenseResult = null,
    quantity = 1,
    distance = 1,
  }) => {
    const tempQuantity = toNumber(quantity || 1)
    const tempDistance = toNumber(distance || 1)
    let rate = toNumber(calcExpenseResult?.rate || 0) * tempDistance * tempQuantity
    let credit = toNumber(calcExpenseResult?.credit || 0) * tempDistance * tempQuantity
    let cashReturn = toNumber(calcExpenseResult?.cashReturn || 0) * tempDistance * tempQuantity
    let cashNotReturn = rate - (cashReturn + credit);
    return {
      ...calcExpenseResult,
      rate,
      credit,
      cashReturn,
      cashNotReturn,
    }
  }
  if (!isChangeExpense) return calc({ calcExpenseResult, quantity }) // กรณีไม่เปลี่ยน ExpenseId
  // กรณีเปลี่ยน ExpenseId
  if (!calcExpenseResult?.distance) return calc({// กรณีไม่มีระยะทาง
    calcExpenseResult,
    quantity: calcExpenseResult?.quantity || quantity
  })
  if (!calcExpenseResult?.quantity) return calc({ calcExpenseResult, quantity }) // กรณีไม่มีจํานวน
}