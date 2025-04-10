import React from 'react'
import dayjs from 'dayjs'
import moment from 'moment'
import {find,map} from 'lodash'
import { callApis } from 'components/helper/function/CallApi';
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default async function AutoServiceCharge({
    patientId = null,
    workId = null,
    workPlaces = [],
    rightId = null,
    serviceDetail = null,
}) {
    // console.log('workId :>> ', workId);
    // console.log('patientId :>> ', patientId);
    // console.log('serviceDetail :>> ', serviceDetail);
    if (!workId || !patientId) return
    const findAlienFlag = find(workPlaces, ["datavalue", workId])
    if (findAlienFlag?.alienFlag === "Y") return
    let listAutoWorkPlaceCharge = [];
    // if (opdClinicsVisitList?.length) return reLoadVisitOfDate()
    const crrTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const startTime = dayjs().format("YYYY-MM-DD 08:00:00");
    const endTime = dayjs().format("YYYY-MM-DD 16:00:00");
    const inTime = moment(crrTime, "YYYY-MM-DD HH:mm:ss").isBetween(startTime, endTime);
    let [
        workPlaceDetails,
        patientRights,
    ] = await Promise.all([
        callApis(apis["GetWorkPlaceDetails"], workId),
        callApis(apis["GetPatientRights"], { patientId: patientId, serviceId: serviceDetail?.serviceId }),
    ])
    workPlaceDetails = workPlaceDetails?.length ? workPlaceDetails[0] : null
    if (!workPlaceDetails) return
    // console.log('workPlaceDetails :>> ', workPlaceDetails);
    // console.log('patientRights :>> ', patientRights);
    const [
        sFeeO,
        sOtFeeE,
        hFeeHi,
        hFeeHe,
        checkExpenseAutomeaningT,
        resAutoByHosParamS,
        resAutoByHosParamDF,
    ] = await Promise.all([
        workPlaceDetails?.serviceFeeO ? callApis(apis["GetExpenseDetails"], { expenseId: String(workPlaceDetails.serviceFeeO), }) : null,
        workPlaceDetails?.serviceOtFeeE ? callApis(apis["GetExpenseDetails"], { expenseId: String(workPlaceDetails.serviceOtFeeE), }) : null,
        workPlaceDetails?.hospitalFeeHi ? callApis(apis["GetExpenseDetails"], { expenseId: String(workPlaceDetails.hospitalFeeHi), }) : null,
        workPlaceDetails?.hospitalFeeHe ? callApis(apis["GetExpenseDetails"], { expenseId: String(workPlaceDetails.hospitalFeeHe), }) : null,
        callApis(apis["CheckExpenseAutomeaningT"], serviceDetail?.serviceId),
        hosParam?.autoServiceCharge === "S" ? callApis(apis["GetDataExpensesAutoServiceCharge"], rightId) : null,
        hosParam?.autoServiceCharge === "D" ? callApis(apis["GetExpenseByAutoMeaning"], "DF") : null,
    ])
    if (sFeeO?.length) listAutoWorkPlaceCharge = [sFeeO[0]]
    if (sOtFeeE?.length) listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, sOtFeeE[0]]
    if (hFeeHi?.length) listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, hFeeHi[0]]
    if (hFeeHe?.length) listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, hFeeHe[0]]

    // เช็คสิทธิ์ 30 บาท
    const findRightDetails = find(patientRights, ["rightId", rightId])
    if (findRightDetails?.right30 === "Y") {
        if (!checkExpenseAutomeaningT?.length) {
            const expenseAutoMeaningT = await callApis(apis["GetExpenseByAutoMeaning"], "T")
            if (expenseAutoMeaningT?.length) {
                listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, expenseAutoMeaningT[0]]
            }
        }
    }
    const autoByHosParam = async () => {
        if (!hosParam?.autoServiceCharge) return;
        if (hosParam?.autoServiceCharge === "S") {
            if (resAutoByHosParamS) {
                let chkAutoCharge = await callApis(apis["GetHospParametersVisit"], `ExpenseId=${resAutoByHosParamS?.expenseId}&ServiceId=${serviceDetail?.serviceId}`);
                if (chkAutoCharge?.autoServiceCharge === "S") {
                    let expenseDetails = await callApis(apis["GetExpenseDetails"], { expenseId: resAutoByHosParamS?.expenseId })
                    expenseDetails = expenseDetails?.length ? expenseDetails[0] : null;
                    resAutoByHosParamS.code = expenseDetails?.code
                    resAutoByHosParamS.billgroup = expenseDetails?.billgroup
                    resAutoByHosParamS.accgroup = expenseDetails?.accgroup
                    return listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, resAutoByHosParamS];
                } else return;
            } else {
                return console.log("ไม่สามารถคิดค่าบริการแรกเข้าได้");
            }
        }
        if (hosParam?.autoServiceCharge === "D") {
            if (!resAutoByHosParamDF?.length) return;
            let expenseDF = resAutoByHosParamDF[0];
            return listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, expenseDF];
        }
    };
    if (!hFeeHi?.length && !hFeeHe?.length) {
        // ห้องตรวจไม่มีการกำหนดค่าสถานพยาบาล
        await autoByHosParam();
    } else {
        // ห้องตรวจมีการกำหนดค่าสถานพยาบาล
        if (inTime) {
            // ในเวลา
            if (!hFeeHi?.length) await autoByHosParam(); // ไม่มีค่าบริการของห้อง
            if (hFeeHi?.length) {
                // มีค่าบริการของห้อง
                listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, hFeeHi[0]]
            }
        }
        if (!inTime) {
            // นอกเวลา
            if (!hFeeHe?.length) await autoByHosParam(); // ไม่มีค่าบริการของห้อง
            if (hFeeHe?.length) {
                // มีค่าบริการของห้อง
                listAutoWorkPlaceCharge = [...listAutoWorkPlaceCharge, hFeeHe[0]]
            }
        }
    }
    // console.log('listAutoWorkPlaceCharge :>> ', listAutoWorkPlaceCharge);
    if (listAutoWorkPlaceCharge?.length) {
        const promises = map(listAutoWorkPlaceCharge, o => {
            const orderDetail = {
                opdipd: "O",
                patientId: patientId,
                runHn: serviceDetail?.runHn,
                yearHn: serviceDetail?.yearHn,
                hn: serviceDetail?.hn,
                admitId: null,
                runAn: null,
                yearAn: null,
                an: null,
                serviceId: serviceDetail?.serviceId || null,
                clinicId: serviceDetail?.clinicId || null,
                rightId: rightId,
                opdRightId: serviceDetail?.opdRightId || null,
                fromWork: workId,
                toWork: null,
                packageId: null,
                billgroup: o?.billgroup || null,
                actgroup: o?.actgroup || null,
                accgroup: o?.accgroup || null,
                orderId: null,
                financeId: null,
                financeType: o.financeType,
                expenseId: o.expenseId,
                code: o.code,
                expenseName: o?.name || o?.expenseName || null,
                organ: o.organ,
                claim: "0",
                copay: "0",
                discount: "0",
                payment: "0",
                reminburse: "0",
                receive: "0",
                cost: "0",
                lockFlag: null,
                doctor: null,
                status: null,
                rushFlag: null,
                userCreated: user,
                dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                orderDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                orderTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                userModified: null,
                dateModified: null,
                userAccepted: null,
                dateAccepted: null,
                userPrepared: null,
                datePrepared: null,
                userChecked: null,
                dateChecked: null,
                userDispensed: null,
                dateDispensed: null,
                userPayabled: null,
                datePayabled: null,
                admitRightId: null,
                specimen: null,
                docRemark: null,
                notTriggerFlag: "Y",
            }
            return getExpenseRate({ expenseId: o.expenseId, rightId: rightId || "x000000" }).then(value => {
                let {
                    rate = null,
                    credit = "0",
                    cashReturn = "0",
                    cashNotReturn = "0",
                    // minRate = null,
                    // maxRate = null
                } = value;
                // const rateByUser = minRate ? "YES" : "NO";
                const quantity = 1
                rate = rate ? Number(rate) : 0;
                credit = credit ? Number(credit) * quantity : "0";
                cashReturn = cashReturn ? Number(cashReturn) * quantity : "0";
                cashNotReturn = cashNotReturn ? Number(cashNotReturn) * quantity : "0";
                let amount = rate ? Number(rate) * quantity : 0;
                return {
                    ...orderDetail,
                    quantity: String(quantity),
                    price: String(rate),
                    amount: String(amount),
                    credit: String(credit),
                    cashReturn: String(cashReturn),
                    cashNotReturn: String(cashNotReturn),
                };
            });
        });
        return await Promise.all(promises).then(async result => {
            const res = await callApis(apis["InsNewOrderListFinance"], result)
            console.log('AutoServiceCharge :>> ', res);
            return res
        })
    } else return
}

export const apis = {
    GetExpenseByAutoMeaning: {
        url: "Masters/GetExpenseByAutoMeaning/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    CheckExpenseAutomeaningT: {
        url: "Finances/check-serviceid-automeaning-t?id=",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetDataExpensesAutoServiceCharge: {
        url: "Finances/GetDataExpensesAutoServiceCharge/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetHospParametersVisit: {
        url: "HospParameters/GetHospParametersVisit?",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetWorkPlaceDetails: {
        url: "AdminItHospital/ItHospital/GetListWorkPlaceByWorkId?workId=",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetPatientRights: {
        url: "OpdRightVisit/GetOpdRightVisit",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    GetExpenseDetails: {
        url: "OpdExamination/GetExpensesOrderAll",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    InsNewOrderListFinance: {
        url: "Finances/InsNewOrderListFinance",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}