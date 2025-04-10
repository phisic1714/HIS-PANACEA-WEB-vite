import React, { useEffect } from "react";
import { Modal } from 'antd'
import CheckLabResults from 'routes/OpdClinic/Views/CheckLabResult'
import { momentEN } from 'components/helper/convertMoment';

export default function LabResults({ LabResultsActive, patientId, onCancel }) {
    useEffect(() => {
        momentEN()
    }, [])

    return (
        <Modal
            visible={LabResultsActive}
            centered
            width={1500}
            onCancel={() => {
                onCancel()
            }}
        >
            <CheckLabResults labResultOnly={true} patientIdInput={patientId} />
        </Modal>
    )
}