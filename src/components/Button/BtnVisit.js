import React, { useState, useEffect } from 'react'
import { Button, Modal } from 'antd'
import Visit from "components/Patient/Visit"

export default function BtnVisit({
    patientId = null,
    onFinished = () => { },
}) {
    const [vsb, setVsb] = useState(false)
    return <>
        <Button
            type="primary"
            style={{ margin: 0 }}
            onClick={e => {
                e.stopPropagation()
                setVsb(true)
            }}
            disabled={!patientId}
        >
            Visit
        </Button>
        <Modal
            centered
            closable={false}
            closeIcon={false}
            visible={vsb}
            onCancel={() => setVsb(false)}
            width={1345}
            title={<label className='gx-text-primary fw-bold fs-5'>สิทธิ์การรักษา/Visit</label>}
            footer={false}
        >
            <div style={{ margin: -20 }}>
                <Visit
                    patientId={patientId}
                    onFinished={onFinished}
                    onCancel={() => setVsb(false)}
                />
            </div>
        </Modal>
    </>
}
