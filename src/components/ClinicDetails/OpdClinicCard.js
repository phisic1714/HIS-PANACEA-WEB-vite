/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { allSearchDetail, } from "appRedux/actions";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { callApis } from 'components/helper/function/CallApi';
import { notiError, notiSuccess } from 'components/Notification/notificationX';
import { map, filter, intersectionBy, find } from "lodash";
import dayjs from "dayjs";
import { Button, Col, Modal, Row } from 'antd';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const userId = userFromSession.responseData.userId
const userType = userFromSession.responseData.userType

export default function OpdClinicCard({
    loading = false,
    clinicDetails = null,
    setClinicDetails = () => { },
    setLoading = () => { },
    returnData = () => { },
    historyTo = null,
    page = null,
    workId = null,
    chkDoctor = false,
}) {
    console.log('userType', userType)
    // console.log('clinicDetails', clinicDetails)
    const history = useHistory();
    const dispatch = useDispatch();
    // State
    const [usersMockFlagY, setUsersMockFlagY] = useState([])
    const [vsb, setVsb] = useState(false)
    const [clinicByMockUser, setClinicByMockUser] = useState(null)
    // Funcs
    const getUserMockFlagY = async () => {
        const res = await callApis(apis["GetUserMockFlagY"])
        setUsersMockFlagY(res)
    }
    const dspAllSeearch = async (clinicDetails) => {
        if (!clinicDetails?.clinicId) return
        setLoading(true);
        const patient = await callApis(apis["GetPatientsDetail"], clinicDetails?.patientId)
        setLoading(false);
        let tempRecord = { ...clinicDetails };
        tempRecord.lastAn = patient?.latestAdmits?.an || null;
        tempRecord.lastServiceId = patient?.latestServices?.serviceId || null;
        tempRecord.opdipd = null;
        const tempDataForDsp = {
            patient: tempRecord,
            admitList: patient?.latestAdmits?.an ? [patient?.latestAdmits] : [],
            serviceList: patient?.latestServices?.serviceId ? [patient?.latestServices] : [],
            patientDetail: patient,
            clinicId: clinicDetails.clinicId,
        }
        dispatch(allSearchDetail(tempDataForDsp));
        if (historyTo) {
            return history.push({ pathname: historyTo });
        } else return returnData(tempDataForDsp)
    }
    const chkClinicsAndDoctor = async (clinicDetails) => {
        // console.log('clinicDetails', clinicDetails)
        if (!clinicDetails?.patientId) return
        if (clinicDetails?.doctor === userId) return dspAllSeearch(clinicDetails)
        if (!clinicDetails?.doctor) return dspAllSeearch(clinicDetails)
        if (chkDoctor) {
            setLoading(true);
            let clinics = await callApis(apis["GetOpdClinics"], clinicDetails?.serviceId)
            // console.log('GetOpdClinics =>', clinics)
            setLoading(false);
            clinics = filter(clinics, ["workId", workId])
            clinics = map(clinics, o => {
                return {
                    ...o,
                    userId: o.doctor,
                };
            });
            // console.log('clinics', clinics)
            const findByUserId = find(clinics, ["doctor", userId])
            // console.log('findByUserId', findByUserId)
            if (!findByUserId) {
                setVsb(true)
                const findClinicByMockUser = intersectionBy(clinics, usersMockFlagY, "userId")
                if (findClinicByMockUser.length) {
                    setClinicByMockUser(findClinicByMockUser[0])
                }
            } else {
                dspAllSeearch(clinicDetails)
            }

        } else {
            dspAllSeearch(clinicDetails)
        }
    }
    const insertOpdClinic = async () => {
        let tempRecord = { ...clinicDetails };
        tempRecord.opdipd = null;
        let req = {
            clinicDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            serviceId: clinicDetails?.serviceId,
            workId: workId,
            doctor: userId,
            patientId: clinicDetails?.patientId,
            runHn: clinicDetails?.hn.split("/")[0],
            yearHn: clinicDetails?.hn.split("/")[1],
            hn: clinicDetails?.hn,
            registerType: "O",
            opdRightId: clinicDetails?.opdRightId || null,
        }
        // console.log('insertOpdClinic req', req)
        // return
        setLoading(true);
        const res = await callApis(apis["InsOpdClinic"], req)
        setLoading(false);
        console.log('InsOpdClinic', res)
        if (res?.isSuccess) {
            notiSuccess({ message: "โอน Visit" })
            if (res?.responseData) {
                dspAllSeearch({ ...clinicDetails, clinicId: res?.responseData })
            }
        } else {
            notiError({ message: "โอน Visit" })
        }
    }
    const handleCloseModal = () => {
        setVsb(false)
        setClinicDetails(null)
        setClinicByMockUser(null)
    }
    // Effect
    useEffect(() => {
        getUserMockFlagY()
    }, [])
    useEffect(() => {
        chkClinicsAndDoctor(clinicDetails)
    }, [clinicDetails])

    return <>
        <Modal
            centered
            visible={vsb}
            width={600}
            footer={
                <Row gutter={[4, 4]} justify='center'>
                    <Col>
                        <Button
                            className='mb-0 me-2'
                            onClick={() => handleCloseModal()}
                            loading={loading}
                        >
                            ปิด
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type='primary'
                            className='mb-0 me-2'
                            onClick={() => insertOpdClinic()}
                            loading={loading}
                        >
                            โอน Visit
                        </Button>
                    </Col>
                    <Col hidden={!clinicByMockUser}>
                        <Button
                            className='mb-0'
                            onClick={() => dspAllSeearch(clinicByMockUser)}
                            loading={loading}
                        >
                            ตรวจแทน User จำลอง
                        </Button>
                    </Col>
                </Row>
            }
        >
            <div className='text-center'>
                <label className='gx-text-primary fs-5'>ผู้ป่วยได้รับการตรวจจากแพทย์ท่านอื่นแล้ว !</label>
            </div>
        </Modal>
    </>
}
const apis = {
    GetUserMockFlagY: {
        url: "AdminSystem/GetAdminUserId",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetPatientsDetail: {
        url: "Patients/GetPatientsDetail/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetOpdClinics: {
        url: "OPDClinic/GetOpdClinicsList/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    InsOpdClinic: {
        url: "OpdExamination/InsOpdClinic",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}