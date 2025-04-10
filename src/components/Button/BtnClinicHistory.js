import React, { useState } from 'react'
import { Button } from 'antd'
import { HistoryOutlined } from '@ant-design/icons';
import ClinicHistoryDrawer from "components/Drawer/ClinicHistoryDrawer"
export default function BtnClinicHistory({
    patientId,
    serviceId,
    btnType = "primary",
    btnSize = "middle",
    showLabel = true,
    showIcon = true,
    style = { marginBottom: 0 },
    disabled = false,
    hidden = false,
    patient,
    ...props
}) {
    const [vsbModal, setVsbModal] = useState(false)
    return <><Button
        type={btnType}
        size={btnSize}
        icon={showIcon ? <HistoryOutlined /> : false}
        style={style}
        onClick={e => {
            e.stopPropagation()
            setVsbModal(true)
        }}
        disabled={disabled}
        hidden={hidden}
        {...props}
    >
        {showLabel && "ประวัติการรักษา"}
    </Button>
        <ClinicHistoryDrawer
            patient={patient}
            patientId={patientId}
            serviceValue={serviceId}
            visible={vsbModal}
            onClose={() => { setVsbModal(false) }}
        />
    </>
}
