import React from 'react'
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
export default function ConsultWardToOpd({
    admits = [],
    work = {
        workId: null,
        workName: null,
    },
    reCheck = () => { },
    setLoading = () => { },
}) {
    if (!admits.length) return
    const lastAdmit = admits[0]
    if (lastAdmit?.deleteFlag || lastAdmit?.dischDate) return
    const getAdmitRights = async (admitId) => {
        const req = {
            admitId: admitId,
        }
        const res = await callApis(apis['GetAdmitRights'], req)
        if (!res.length) return
        let admitRightDetails = null
        admitRightDetails = find(res, ["mainFlag", "Y"])
        if (!admitRightDetails) admitRightDetails = res[0]
        return admitRightDetails
    }
    const consultToOpd = async () => {
        setLoading(true)
        const admitRightDetails = await getAdmitRights(lastAdmit.admitId)
        // console.log('admitRightDetails :>> ', admitRightDetails);
        if (!admitRightDetails) return notiWarning({ message: "ไม่พบสิทธิ์การรักษา !" })
        const req = {
            patientId: lastAdmit.patientId,
            runHn: lastAdmit.hn.split("/")[0],
            yearHn: lastAdmit.hn.split("/")[1],
            hn: lastAdmit.hn,
            serviceId: lastAdmit?.serviceId,
            registerType: "W",
            clinicId: lastAdmit?.clinicId,
            consultId: lastAdmit?.clinicId,
            clinicDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            dateCreated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            userCreated: user,
            workId: work.workId,
            subspecialty: null,
            doctor: userType === "M" || userType === "D" ? user : null,
            consult: null, // <== เรื่องที่ consult
            urgent: null,
            consultReason: null,
            admitId: lastAdmit?.admitId,
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
        console.log('req :>> ', req);
        const res = await callApis(apis['ConsultToOpd'], req)
        setLoading(false)
        if (res.isSuccess) {
            notiSuccess({ message: "บันทึก Consult" })
            reCheck()
        } else notiError({ message: "บันทึก Consult" })
    }
    const showConfirm = () => {
        confirm({
            width: 600,
            centered: true,
            icon: false,
            title: false,
            content: <div className='text-center'>
                <LabelTopicPrimary18 className='d-block mb-2' text={`ผู้ป่วย Admit อยู่ (Ward : ${lastAdmit.wardName})`} />
                <label className='gx-text-primary fw-bold fs-4 d-block'>รับ Consult ?</label>
                <LabelTopic18 text={`(ห้องตรวจ : ${work.workName})`} />
            </div>,
            onOk() {
                console.log('OK');
                consultToOpd()
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
    GetAdmitRights: {
        url: "Admits/GetAdmitRightByAdmitID",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    ConsultToOpd: {
        url: "OpdExamination/SubmitConsultOpdClinic",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}
