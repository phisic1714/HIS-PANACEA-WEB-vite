import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { callApiObject } from 'components/helper/function/CallApi';
import dayjs from "dayjs";

export default function NotiSurveillance({ patientId, serviceId, clinicId }) {
    const [vsb, setVsb] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const getSurveillancesDetail = async () => {
        if (!serviceId) return
        const req = {
            patientId: patientId,
            serviceId: serviceId,
        }
        const res = await callApiObject(apis, "GetSurveillancesDetail", req)
        // console.log('GetSurveillancesDetail', res)
        setDataSource(res || [])
        if (res?.length) setVsb(true)
    }
    useEffect(() => {
        getSurveillancesDetail()
    }, [clinicId])

    return <Modal
        title={<label className='gx-text-primary fw-bold fs-5'>แจ้งเตือนข้อมูลเฝ้าระวังโรคระบาด</label>}
        centered
        visible={vsb}
        width={700}
        okText="บันทึก"
        cancelText="ปิด"
        // onOk={() => form.submit()}
        onCancel={() => setVsb(false)}
        okButtonProps={{
            // loading: loading,
            hidden: true,
        }}
    >
        <div style={{ marginBottom: -18, marginTop: -18 }}>
            <label className='fs-6 fw-bold d-block'>กลุ่มอาการที่เฝ้าระวัง</label>
            {
                dataSource.map(o => {
                    return <div key={o.surveilId}>
                        <label className='data-value ms-3'>- {dayjs(o.dateCreated).format("DD/MM/BBBB HH:mm")}</label>
                        <label className='data-value ms-1'>- {o.syndromeName}</label>
                    </div>
                })
            }
        </div>
    </Modal>
}
const apis = {
    GetSurveillancesDetail: {
        name: "GetSurveillancesDetail",
        url: "SocialMedication/GetSurveillancesDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    }
}
