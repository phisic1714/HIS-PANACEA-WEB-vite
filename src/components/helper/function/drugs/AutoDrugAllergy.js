import { callApis } from 'components/helper/function/CallApi';
export const autoNotAllergicFlag = async ({
    patientId,
    notAlergicFlag,
    drugAllergic = null,
}) => {
    if (!patientId) return { isSuccess: false, message: "Patient ID is required" }
    const res = await callApis(apis["UpdPatientsNotAlergicFlag"], { patientId, notAlergicFlag, drugAllergic })
    return res
}
export const apis = {
    UpdPatientsNotAlergicFlag: {
        url: "Patients/UpdPatientsNotAlergicFlag",
        method: "PUT",
        return: "data",
        sendRequest: true,
    },
}