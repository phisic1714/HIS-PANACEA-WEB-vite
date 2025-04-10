import { callApis } from 'components/helper/function/CallApi.js';
import { filter, map, find, intersectionBy, groupBy ,toNumber } from "lodash"
import { notiDrugAllergy } from "components/Drug/DrugAllerts"
import { notiWarning } from 'components/Notification/notificationX';
import dayjs from "dayjs"

const crrDate = dayjs()
export default async function ChkDrugConditionsV2({
    patientId = null,
    newExpenses = [],
    oldExpenses = [],
    doctorId = null,
    drugAllergyDetails = null,
    checkDup = true,
    drugprofile = null,
}) {
    // console.log('ChkDrugConditionsV2 => patientId :>> ', patientId);
    // console.log('ChkDrugConditionsV2 => newExpenses :>> ', newExpenses);
    // console.log('ChkDrugConditionsV2 => oldExpenses :>> ', oldExpenses);
    // console.log('ChkDrugConditionsV2 => drugAllergyDetails :>> ', drugAllergyDetails);
    // console.log('ChkDrugConditionsV2 => doctorId :>> ', doctorId);
    const allExpenses = [...oldExpenses, ...newExpenses]
    if (!allExpenses.length) return
    const reqGetDrugConditions = map(allExpenses, o => {
        return {
            "expenseId": o.expenseId,
            "doctor": doctorId,
            "patientid": patientId,
            checkExpenseId: o?.checkExpenseId || [],
        }
    })
    const chkDipDrugCodeAndGeneric = (dts = []) => {
        if (!dts.length) return false
        const overRuleRepeatDrugDay = JSON.parse(localStorage.getItem("hos_param"))?.overRuleRepeatDrugDay
        if (!overRuleRepeatDrugDay) return false
        dts = filter(dts, "endDate")
        const dtsByFinances = filter(dts, "endDate")
        const dtsByDrugProfiles = filter(dts, "drugprofileid")
        let isDup = false
        let diffDays = 0
        if (dtsByFinances?.length) {
            map(dtsByFinances, o => {
                const testDate = dayjs(o.endDate, "MM/DD/YYYY")
                diffDays = testDate.diff(crrDate, "days")
                if ((diffDays + 2) > overRuleRepeatDrugDay) {
                    isDup = true
                    notiWarning({ message: "แจ้งเตือนจ่ายยาซ้ำซ้อน !" })
                }
            })
        }
        if (!isDup && dtsByDrugProfiles.length) {
            isDup = true
            notiWarning({ message: "แจ้งเตือนจ่ายยาซ้ำซ้อน(Drug profile) !" })
        }
        return isDup
    }
    const resDrugConditions = await callApis(apis["GetDrugConditions"], reqGetDrugConditions)
    // console.log('resDrugConditions :>> ', resDrugConditions);
    const mappingDrugAllergy = map(drugAllergyDetails?.drugsAllergy, o => {
        // const findMasterGeneric = find(resDrugConditions, ["expenseId", o.expenseId])
        return {
            ...o,
            genericName: o.generic,
            // masterGeneric: findMasterGeneric?.masterGenerics || []
        }
    })
    const mappingDrugGroupAllergy = map(drugAllergyDetails?.drugGroupAllergy, o => {
        return {
            ...o,
            drugGroupName: o.drugGroup
        }
    })
    let notAllowedToOrder = false
    // console.log('allExpenses :>> ', allExpenses);
    const newmapselectDrug = map(allExpenses, o => {
        if (o?.financeId) return o
        // const drugGenericAllergy = find(drugAllergyDetails?.drugsAllergy || [], ["generic", o.generic])//แพ้ยา
        const drugConditions = find(resDrugConditions, ["expenseId", o.expenseId])
        const drugGenericAllergy = intersectionBy(mappingDrugAllergy, drugConditions?.masterGenerics, 'genericName')//แพ้ยา
        const drugCodeAllergy = find(drugAllergyDetails?.drugCodeAllergy || [], ["expenseId", o.expenseId])//แพ้ Code ยา
        const drugGroupAllergy = intersectionBy(mappingDrugGroupAllergy || [], o?.opdFormulaExpensesDrugGroup || [], "drugGroupName")//แพ้กลุ่มยา
        const chkDoctors = drugConditions?.opdDrugDoctorExpense || []//ยากับแพทย์
        const chkDocSpecialties = drugConditions?.getOpdDrugDocSpecialtiesfinancesDrug//ยากับสาขาแพทย์
        const drugComponentsAllergy = drugConditions?.getOpdChkPatientExpAllerygiesfinancesDrug || []//แพ้ส่วนประกอบ
        const drugAndLab = drugConditions?.opdChkDrugLabCriticalsfinancesDrug || []//ยากับ Lab
        let alertTypes = []
        let notAllowedDrugAndDoctor = false
        let notAllowedDrugAndDocSpecialties = false
        let allowedDrugAndDoctor = false
        let allowedDrugAndDocSpecialties = false
        if (chkDoctors?.length) {
            const findByDoctor = find(chkDoctors, ["doctor", doctorId])
            if (!findByDoctor) {
                if (o.lockDoctorFlag) allowedDrugAndDoctor = true
                if (!o.lockDoctorFlag) {
                    notAllowedDrugAndDoctor = true
                    notiWarning({
                        message: "แจ้งเตือนห้ามสั่งยาไม่ตรงกับแพทย์",
                        description: `ยา : ${o?.expenseName}`
                    })
                }
            }
        }
        if (chkDocSpecialties) {
            if (isNaN(toNumber(chkDocSpecialties))) {
                if (o.lockPecialtiesFlag) allowedDrugAndDocSpecialties = true
                if (!o.lockPecialtiesFlag) {
                    notAllowedDrugAndDocSpecialties = true
                    notiWarning({
                        message: "แจ้งเตือนห้ามสั่งยาไม่ตรงกับสาขาแพทย์",
                        description: `ยา : ${o?.expenseName}`
                    })
                }
            }
        }
        if (drugGenericAllergy?.length || drugCodeAllergy || drugGroupAllergy?.length || drugComponentsAllergy?.length) {
            alertTypes = [...alertTypes, "ADR"]
            o.adrFlag = "Y"
        }
        if (allowedDrugAndDoctor || allowedDrugAndDocSpecialties) alertTypes = [...alertTypes, "DOC"]
        if (drugGenericAllergy?.length) {
            if (find(drugGenericAllergy, ["lockDoNotOrder", "Y"])) notAllowedToOrder = true
            map(drugGenericAllergy, o => notiDrugAllergy({
                details: o,
                title: "แจ้งตือนแพ้ยา !",
                symptom: "symptom",
                otherSymptom: "otherSymptom",
                alevel: "alevel",
            }))
        }
        if (drugComponentsAllergy.length) {
            if (find(drugComponentsAllergy, ["lockDoNotOrder", "Y"])) notAllowedToOrder = true
            map(drugComponentsAllergy, d => notiDrugAllergy({
                details: d,
                title: "แจ้งเตือนแพ้ส่วนประกอบยา !",
                symptom: "symptomName",
                otherSymptom: "otherSymptom",
                alevel: "alevelName",
            }))
        }
        if (drugCodeAllergy) {
            if (drugCodeAllergy?.lockDoNotOrder === "Y") notAllowedToOrder = true
            notiDrugAllergy({
                details: drugCodeAllergy,
                title: "แจ้งเตือนแพ้ Code ยา !",
                symptom: "symptomDesc",
                otherSymptom: "otherSymptom",
                alevel: "alevelName",
            })
        }
        if (drugGroupAllergy?.length) {
            if (find(drugGroupAllergy, ["lockDoNotOrder", "Y"])) notAllowedToOrder = true
            map(drugGroupAllergy, g => notiDrugAllergy({
                details: g,
                drugGroupName: "drugGroupName",
                expenseName: o.expenseName,
                title: 'แจ้งตือนแพ้กลุ่มยา !',
                symptom: "symptom",
                otherSymptom: "otherSymptom",
                alevel: "alevel",
            }))
        }
        let isDup = false
        if (checkDup) {
            const opdchkfinancesDrug = drugConditions.opdchkfinancesDrug || []
            isDup = chkDipDrugCodeAndGeneric(opdchkfinancesDrug)
        }
        return {
            ...o,
            // quantity: numDays ? numDays * (o?.dose || 1) * (o?.frequency || 1) : o?.quantity,
            isDup: isDup,
            drugGenericAllergy,
            drugGenericAllergyLock: find(drugGenericAllergy, ["lockFlag", "Y"]) ? true : false,
            drugCodeAllergy,
            drugCodeAllergyLock: drugCodeAllergy?.lockFlag ? true : false,
            drugGroupAllergy,
            drugGroupAllergyLock: find(drugGroupAllergy, ["lockFlag", "Y"]) ? true : false,
            drugComponentsAllergy: drugComponentsAllergy || [],
            drugComponentsAllergyLock: find(drugComponentsAllergy, ["lockFlag", "Y"]) ? true : false,
            notAllowedDrugAndDoctor,
            notAllowedDrugAndDocSpecialties,
            notAllowedToOrder,
            allowedDrugAndDoctor,
            allowedDrugAndDocSpecialties,
            opdFormulaExpensesGeneric: drugAndLab,
            alertTypes: alertTypes,
        };
    })
    // let outList = [];
    let finance = filter(newmapselectDrug, o => !(o.notAllowedDrugAndDoctor || o.notAllowedDrugAndDocSpecialties || o.notAllowedToOrder || o.isDup));
    const chkDrugInteractions = await callApis(apis["CheckDrugInteractions"], {
        patientId,
        expenseid: allExpenses,
        drugprofile: drugprofile,
    })
    // console.log('finance :>> ', finance);
    const grouping = groupBy(chkDrugInteractions, "expenseid")
    finance = map(finance, o => {
        const di = grouping[o.expenseId]
        let alertTypes = o.alertTypes || []
        if (di?.length) {
            if (find(alertTypes, o => o !== "DI")) alertTypes = [...alertTypes, "DI"]
        } else {
            if (find(alertTypes, o => o === "DI")) alertTypes = filter(alertTypes, o => o !== "DI")
        }
        return {
            ...o,
            drugInteractions: di || [],
            diFlag: o?.financeId ? o.diFlag : di?.length ? "Y" : null,
            alertTypes: alertTypes,
        }
    })
    return finance
}

export const apis = {
    GetDrugConditions: {
        url: "PatientsFinancesDrug/GetAlldDrug",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    CheckDrugInteractions: {
        url: "DrugInteractions/CheckDrugInteractions",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}