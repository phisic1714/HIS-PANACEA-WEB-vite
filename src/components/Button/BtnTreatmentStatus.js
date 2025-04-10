import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import TreatmentStatus from "components/Modal/TreatmentStatus"

export default function BtnTreatmentStatus({
    type = 'primary',
    size = "small",
    clinicDetails = null,
    onFinish = () => { },
    ...props
}) {
    // State
    const [vsbModal, setVsbModal] = useState(false)
    // Effects
    useEffect(() => {
    }, [clinicDetails])

    // Components
    const PartsModal = () => {
        return <>
            {
                vsbModal && <TreatmentStatus
                    size={size}
                    visible={vsbModal}
                    clinicDetails={clinicDetails}
                    onCancel={() => {
                        setVsbModal(false)
                    }}
                />
            }
        </>
    }
    return <div>
        <Button
            id="add-treatment-status"
            size={size}
            style={{ marginBottom: 0 }}
            type={type}
            // disabled={!clinicDetails?.clinicId && !clinicDetails?.admitId} 
            onClick={e => {
                e.stopPropagation()
                setVsbModal(true)
            }}
            {...props}
        >
            สถานะการรักษา
        </Button>
        {PartsModal()}
    </div>
}