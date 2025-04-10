import React, { useRef } from 'react'
import { Modal } from 'antd';
import { find } from 'lodash';
import dayjs from 'dayjs';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import { callApis } from 'components/helper/function/CallApi';
import {
    LabelTopicPrimary18,
    LabelTopic18,
} from "components/helper/function/GenLabel";
import { notiWarning } from '../Notification/notificationX';
const { confirm } = Modal
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
const userType = userFromSession.responseData.userType;
export default function ConsultWardToOpdV2({
    admitDetails = null,
    admitRights = [],
    work = {
        workId: null,
        workName: null,
    },
    onFinished = () => { },
    loading = false,
    setLoading = () => { },
}) {
    if (!admitDetails) return
    const findMainRight = async () => {
        let admitRightDetails = null
        admitRightDetails = find(admitRights, ["mainFlag", "Y"])
        if (!admitRightDetails) admitRightDetails = admitRights[0]
        return admitRightDetails
    }
    const consultToOpd = async () => {
        const admitRightDetails = await findMainRight()
        if (!admitRightDetails) return notiWarning({ message: "ไม่พบสิทธิ์การรักษา !" })
        const req = {
            patientId: admitDetails.patientId,
            runHn: admitDetails.runHn,
            yearHn: admitDetails.yearHn,
            hn: admitDetails.hn,
            serviceId: admitDetails?.serviceId,
            registerType: "W",
            clinicId: admitDetails?.clinicId,
            consultId: admitDetails?.clinicId,
            clinicDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            dateCreated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            userCreated: user,
            workId: work.workId,
            subspecialty: null,
            doctor: userType === "M" || userType === "D" ? user : null,
            consult: null, // <== เรื่องที่ consult
            urgent: null,
            consultReason: null,
            admitId: admitDetails?.admitId,
            rightId: admitRightDetails?.rightId,
            admitRightId: admitRightDetails.admitRightId || null,
            opdRightId: null,
            diagnosis: [],
            finishedFlag: null,
            pain: null,
            sugguestion: null,
            consultStatus: null,
            consultPicture: [],
            checkinDate: null,
            screeningDate: null,
            finishedScreenDate: null,
            meetDrDate: null,
            finishedDate: null,
            afterDrDate: null,
        }
        // console.log('req :>> ', req);
        // return
        setLoading(true)
        const res = await callApis(apis['ConsultToOpd'], req)
        setLoading(false)
        if (res.isSuccess) {
            notiSuccess({ message: "บันทึก Consult" })
            onFinished()
        } else notiError({ message: "บันทึก Consult" })
    }
    const showConfirm = () => {
        confirm({
            width: 600,
            centered: true,
            icon: false,
            title: false,
            content: <div className='text-center'>
                <LabelTopicPrimary18 className='d-block mb-2' text={`ผู้ป่วย Admit อยู่ (Ward : ${admitDetails.wardName})`} />
                <label className='gx-text-primary fw-bold fs-4 d-block'>รับ Consult ?</label>
                <LabelTopic18 text={`(ห้องตรวจ : ${work.workName})`} />
            </div>,
            onOk() {
                console.log('OK');
                consultToOpd()
            },
            okButtonProps: {
                loading: loading,
            },
            onCancel() {
                console.log('Cancel');
            },
            okText: 'ยืนยัน',
            cancelText: 'ยกเลิก',
        });
    };
    showConfirm()
}
const apis = {
    ConsultToOpd: {
        url: "OpdExamination/SubmitConsultOpdClinic",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}
