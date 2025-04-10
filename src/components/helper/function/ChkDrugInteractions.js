import { callApis } from 'components/helper/function/CallApi.js';
export default async function ChkDrugInteractions(patientId = null, drugs = [], drugprofile = null) {
    // console.log('ChkDrugInteractions', drugs)
    const res = await callApis(apis["CheckDrugInteractions"], {
        patientId,
        expenseid: drugs,
        drugprofile: drugprofile,
    })
    return res
}
const apis = {
    CheckDrugInteractions: {
        url: "DrugInteractions/CheckDrugInteractions",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}
