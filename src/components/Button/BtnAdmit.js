import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import Admit from "components/Modal/Admit"
import { callApis } from 'components/helper/function/CallApi';
import { find } from 'lodash';
import { notiWarning } from 'components/Notification/notificationX';

const hosParam = JSON.parse(localStorage.getItem("hos_param"));

export default function BtnAdmit({
    size = "small",
    type = 'primary',
    clinicDetails = null,
    rightId = null,
    onFinishAdmit = () => { },
    ...props
}) {
    // State
    const [vsbModalAdmit, setVsbModalAdmit] = useState(false)
    const [admitHis, setAdmitHis] = useState([])
    // Get Functions
    const getAdmitHis = async (patientId) => {
        if (!patientId) return setAdmitHis([])
        const result = await callApis(apis["GetAdmitHistory"], patientId)
        setAdmitHis(result || [])
    }
    // Helper functions
    const chkAdmitHis = () => {
        const findIsAdmit = find(admitHis, o => !o?.deleteFlag && !o?.dischDate)
        if (findIsAdmit) return notiWarning({ message: "ผู้ป่วย Admit อยู่แล้ว !", description: `AN : ${findIsAdmit?.an || "-"}` })
        setVsbModalAdmit(true)
    }
    // Effects
    useEffect(() => {
        getAdmitHis(clinicDetails?.patientId)
    }, [clinicDetails])

    // Components
    const PartsModalAdmit = () => {
        return <>
            {
                vsbModalAdmit && <Admit
                    visible={vsbModalAdmit}
                    setVisible={() => setVsbModalAdmit(false)}
                    clinicDetails={clinicDetails}
                    rightId={rightId}
                    onFinishAdmit={onFinishAdmit}
                />
            }
        </>
    }
    return <div>
        <Button
            size={size}
            style={{ marginBottom: 0 }}
            type={type}
            disabled={!hosParam?.clinicRunAn}
            onClick={e => {
                e.stopPropagation()
                if (!rightId) return notiWarning({ message: "กรุณาระบุสิทธิ์การรักษา !", })
                chkAdmitHis()
            }}
            {...props}
        >Admit</Button>
        {PartsModalAdmit()}
    </div>
}
const apis = {
    GetAdmitHistory: {
        url: "AdmissionCenter/GetPatientAdmitHistory/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}