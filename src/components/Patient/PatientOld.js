/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useSelector } from "react-redux";
import { callApis } from 'components/helper/function/CallApi';
import { Modal } from 'antd';

const PatientOld = ({
    PatientSearch,
    AdmitSearch,
    SearchOpd,
    allSearch,
}) => {
    const hosParam = JSON.parse(localStorage.getItem("hos_param"));
    const {
        message
    } = useSelector(({
        autoComplete
    }) => autoComplete)
    const {
        opdPatientDetail
    } = useSelector(({
        opdPatientDetail
    }) => opdPatientDetail);
    const { selectPatient } = useSelector(
        ({ patient }) => patient
    );
    const allSearchPatientDetail = useSelector(({ Search }) => Search);
    const checkOldPatient = async (patientId) => {
        if (!patientId) return
        const notHaveOldData = await callApis(apis["CheckPatientNotHaveOldData"], patientId)
        if (hosParam?.oldRecordAlert === "Y" && notHaveOldData === "Y")
            Modal.warning({
                title: (
                    <div style={{ textAlign: "center", marginTop: "15px" }} >
                        <label className='fs-4 d-block'>ผู้ป่วยท่านนี้ไม่มีประวัติการรักษาในระบบ Panacea Plus</label>
                        <label className='fs-4 d-block'>กรุณาตรวจสอบที่ระบบ HIS เดิมของท่าน</label>
                    </div>
                ),
                icon: false,
                width: 675,
                centered: true,
            });
    }
    useEffect(() => {
        if (PatientSearch) checkOldPatient(message)
    }, [message])
    useEffect(() => {
        if (SearchOpd) checkOldPatient(opdPatientDetail?.patientId)
    }, [opdPatientDetail?.patientId])
    useEffect(() => {
        if (AdmitSearch && selectPatient?.patientId) checkOldPatient(selectPatient?.patientId)
    }, [selectPatient?.patientId])
    useEffect(() => {
        if (allSearch) checkOldPatient(allSearchPatientDetail?.patient?.patientId)
    }, [allSearchPatientDetail?.patient?.patientId])
    return
};

export default PatientOld;

const apis = {
    CheckPatientNotHaveOldData: {
        url: "Masters/CheckPatientNotHaveOldDataByPatientId/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}