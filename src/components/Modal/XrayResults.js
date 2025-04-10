import React from "react";
import { Modal } from 'antd'
import CheckXrayResult from '../../routes/RadioGraphy/Views/CheckXrayResult'

export default function XrayResults ({ xrayResultsActive, patientId, onCancel }){
    return (
        <Modal
            visible={xrayResultsActive}
            centered
            width={1500}
            onCancel={() => {
                onCancel()
            }}
        >
            <CheckXrayResult xrayResultsOnly={true} patientIdInput={patientId}/>
        </Modal>
    )
}