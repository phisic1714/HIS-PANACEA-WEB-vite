import _map from "lodash/map"
import _find from "lodash/find"
import _intersectionBy from "lodash/intersectionBy"
import { callApis } from 'components/helper/function/CallApi.js';
export default async function RecheckDrugAllergy({
    finances = [],
    patientId = null,
    doctor = null,
    drugAllergyDetails = null,
    setUpdateFinanceId = () => { },
}) {
    // console.log('finances :>> ', finances);
    if (!finances.length || !patientId) return
    const req = _map(finances, o => {
        return {
            patientId: patientId,
            expenseId: o.expenseId,
            doctor: doctor,
        }
    })
    const resDrugConditions = await callApis(apis["GetDrugConditions"], req)
    const mappingDrugAllergy = _map(drugAllergyDetails?.drugsAllergy, o => {
        return {
            ...o,
            genericName: o.generic,
        }
    })
    const mappingDrugGroupAllergy = _map(drugAllergyDetails?.drugGroupAllergy, o => {
        return {
            ...o,
            drugGroupName: o.drugGroup
        }
    })
    const newmapselectDrug = _map(finances, o => {
        const drugConditions = _find(resDrugConditions, ["expenseId", o.expenseId])
        const drugGenericAllergy = _intersectionBy(mappingDrugAllergy, drugConditions?.masterGenerics, 'genericName')//แพ้ยา
        const drugCodeAllergy = _find(drugAllergyDetails?.drugCodeAllergy || [], ["expenseId", o.expenseId])//แพ้ Code ยา
        const drugComponentsAllergy = drugConditions?.getOpdChkPatientExpAllerygiesfinancesDrug || []//แพ้ส่วนประกอบ
        const drugGroupAllergy = _intersectionBy(mappingDrugGroupAllergy || [], o?.opdFormulaExpensesDrugGroup || [], "drugGroupName")//แพ้กลุ่มยา
        let alertTypes = []
        if (drugGenericAllergy?.length || drugCodeAllergy || drugGroupAllergy?.length || drugComponentsAllergy?.length) {
            if (!o.adrFlag) {
                alertTypes = [...alertTypes, "ADR"]
                o.adrFlag = "Y"
                setUpdateFinanceId(p => [...p, o.financeId]);
            }
        }
        return {
            ...o,
            alertTypes: alertTypes,
        };
    })
    return newmapselectDrug
}
export const apis = {
    GetDrugConditions: {
        url: "PatientsFinancesDrug/GetDrugAllerygiesAndGenerics",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}