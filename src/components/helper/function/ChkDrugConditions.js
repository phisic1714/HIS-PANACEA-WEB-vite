import { callApis } from 'components/helper/function/CallApi.js';
import _map from "lodash/map"

export default async function ChkDrugConditions({
    patientId = null,
    expenses = [],
    doctorId = null,
    checkExpenseId = null,
    workId = null,
    drugprofile = null,
}) {
    // console.log('checkExpenseId :>> ', checkExpenseId);
    if (!expenses.length) return
    const request = _map(expenses, o => {
        return {
            "expenseId": o.expenseId,
            "doctor": doctorId,
            "patientid": patientId,
            checkExpenseId: checkExpenseId || [],
            drugprofile: drugprofile,
        }
    })
    // console.log('request', request)
    const response = await callApis(apis["GetDrugConditions"], request)
    // console.log('GetDrugConditions', response)
    return response
}

export const apis = {
    GetDrugConditions: {
        url: "PatientsFinancesDrug/GetAlldDrug",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}