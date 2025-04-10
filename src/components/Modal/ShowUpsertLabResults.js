import React from 'react'
import { Modal } from 'antd'
import TableUpsertLabResult from "components/Table/TableUpsertLabResult";
export default function ShowUpsertLabResults({
    patientId = null,
    gender = null,
    orderId = null,
    financeId = null,
    visible = false,
    setVisible = () => { },
}) {
    return <Modal
        centered
        closable={false}
        closeIcon={false}
        visible={visible}
        onCancel={() => setVisible(false)}
        width={1200}
        cancelText="ปิด"
        okText="บันทึก"
        onOk={() => {
            document.getElementById("btn-save-lab-results").click();
        }}
    >
        <TableUpsertLabResult
            patientId={patientId}
            orderId={orderId}
            financeId={financeId}
            gender={gender}
        />
    </Modal>
}
