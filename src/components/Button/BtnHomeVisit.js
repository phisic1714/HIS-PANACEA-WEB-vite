import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import _find from "lodash/find"
import { Button } from 'antd';
import ModalHomeHealthCare from "routes/HomeHealthcare/Components/HomeHealthCare/ModalHomeHealthCare"
export default function BtnHomeVisit({
    patientId = null,
    serviceId = null,
    clinicId = null,
    screeningWorkId = null,
    workId = null,
    workName = null,
    doctor = null,
    optionsUser = [],
    type = "primary",
    disabled = false,
    width = "",
    size = "small",
    style = {},
    ...props
}) {
    // const [form] = Form.useForm();
    // State
    const [vsbModal, setVsbModal] = useState(false)
    return <div>
        <Button
            size={size}
            type={type}
            onClick={e => {
                e.stopPropagation()
                setVsbModal(true)
            }}
            disabled={disabled}
            style={{ width: width, marginBottom: 0, ...style }}
            {...props}
        >เยี่ยมบ้าน</Button>
        {
            vsbModal && <ModalHomeHealthCare
                patientId={patientId}
                serviceId={serviceId}
                clinicId={clinicId}
                visible={vsbModal}
                close={() => setVsbModal(false)}
                screeningWorkId={screeningWorkId || null}
                work={{
                    workId: workId,
                    workName: workName
                }}
                doctor={{
                    doctorId: doctor,
                    doctorName: _find(optionsUser, ["value", doctor])?.label
                }}
                optionsUser={optionsUser}
            />
        }
    </div>
}
const apis = {
    xxx: {
        url: "xxxx",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}