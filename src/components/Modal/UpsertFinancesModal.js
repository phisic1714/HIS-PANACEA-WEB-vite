import React from 'react'
import { Form, Modal, } from 'antd'
import UpsertFinances from "../Finances/UpsertFinances"
export default function UpsertFinancesModal({
    visible = false,
    close = () => { },
    // Patient
    patientId = null,
    serviceId = null,
    clinicId = null,
    admitId = null,
    // Work
    workId = null,
    // Right
    rightId = null,
    opdRightId = null,
    admitRightId = null,
    // PatientType
    opdIpd = "O",
    // Other
    doctorId = null,
    orderId = null,
    page = null,
    onFinished = () => { },
}) {
    // console.log('UpsertFinancesModal clinicId', clinicId)
    return <Modal
        title={<label className='gx-text-primary fw-bold fs-5'>บันทึกค่าใช้จ่าย</label>}
        centered
        visible={visible}
        width={1225}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => document.getElementById('onFinish_Finance_Form').click()}
        onCancel={() => {
            // resetForm()
            close()
        }}
        okButtonProps={{
            // loading: loading,
        }}
    >
        <div style={{ margin: -18 }}>
            <UpsertFinances
                // form={form}
                patientId={patientId}
                serviceId={serviceId}
                clinicId={clinicId}
                admitId={admitId}
                orderId={orderId}
                workId={workId}
                doctorId={doctorId}
                rightId={rightId}
                opdRightId={opdRightId}
                admitRightId={admitRightId}
                page={page}
                opdIpd={opdIpd}
                close={() => {
                    close()
                }}
                onFinished={onFinished}
            />
        </div>
    </Modal>
}
