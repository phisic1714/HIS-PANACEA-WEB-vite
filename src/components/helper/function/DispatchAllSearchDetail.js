import { callApis } from 'components/helper/function/CallApi';
export default async function DispatchAllSearchDetail({
    patientId = null,
    patientDetails = {},
}) {
    if (!patientId) return
    // const dispatch = useDispatch()
    const [
        patient,
        services,
    ] = await Promise.all([
        callApis(apis["GetPatientsDetail"], patientId),
        callApis(apis["GetListServices"], patientId),
    ])
    let tempRecord = { ...patientDetails };
    tempRecord.lastAn = patient?.latestAdmits?.an || null;
    tempRecord.lastServiceId = patient?.latestServices?.serviceId || null;
    tempRecord.opdipd = null;
    const data = {
        patient: tempRecord,
        admitList: patient?.latestAdmits?.an ? [patient?.latestAdmits] : [],
        serviceList: services,
        patientDetail: patient,
    }
    return data
}
const apis = {
    GetPatientsDetail: {
        url: "Patients/GetPatientsDetail/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetListServices: {
        url: "OpdServices/GetListServicesIdByPatient/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}