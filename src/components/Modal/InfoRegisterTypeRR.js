import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'antd'
export default function InfoRegisterTypeRR({ type = null }) {
    // console.log('type :>> ', type);
    const [vsb, setVsb] = useState(false)
    useEffect(() => {
        if (type === "RR") setVsb(true);
    }, [type])
    return <Modal
        centered
        closable={false}
        closeIcon={false}
        visible={vsb}
        onCancel={() => setVsb(false)}
        footer={<div className='text-center' style={{ marginTop: -4, marginBottom: -4 }}>
            <Button
                style={{ margin: 0 }}
                onClick={e => {
                    e.stopPropagation()
                    setVsb(false)
                }}
            >ปิด</Button>
        </div>}
    >
        <div className='text-center'>
            <label className='gx-text-primary fw-bold fs-4'>เป็นผู้ป่วยที่ Visit ย้อนหลัง</label>
        </div>
    </Modal>
}
