import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

export default function ProcessingResult({ setModal, isVisible = false, response = {}, title, type }) {
    const [processResult, setProcessResult] = useState({})
    const setDataForProcessResultModal = async () => {
        if (response.isSuccess) {
            await setProcessResult({
                "isSuccess": response.isSuccess,
                "status": "สำเร็จ"
            })
        } else await setProcessResult({
            "isSuccess": response.isSuccess,
            "status": "ไม่สำเร็จ",
            "errorCode": response.errorCode,
            "errorMessage": response.errorMessage
        })
    }
    useEffect(() => {
        if (response) {
            setDataForProcessResultModal()
        } else setProcessResult({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);
    return (
        <div>
            <Modal
                closable={false}
                centered
                visible={isVisible}
                onCancel={() => setModal(false)}
                width={480}
                footer={false}
            >
                <div style={{ margin: "-20px", border: "1px solid #CFD8DC", borderRadius: "2px", backgroundImage: "linear-gradient(to bottom,#fff 60%, #ECEFF1)" }}>
                    {processResult.isSuccess !== undefined &&
                        <div>
                            {processResult.isSuccess
                                ? <div className="text-center">
                                    <p style={{ marginBottom: "-10px" }}>
                                        <label className="bold mt-3" style={{ fontSize: "24px" }}>
                                            {title}
                                        </label>
                                    </p>
                                    <p>
                                        <label className="topic-green" style={{ fontSize: "52px" }}><CheckCircleOutlined /></label>
                                    </p>
                                    <p>
                                        <label className="topic-green-bold" style={{ fontSize: "24px" }}>{processResult.status}</label>
                                    </p>
                                </div>
                                : <div className="text-center">
                                    <p style={{ marginBottom: "-8px" }}>
                                        <label className="bold mt-4" style={{ fontSize: "24px" }}>
                                            {title}
                                        </label>
                                    </p>
                                    <p>
                                        <label className="topic-danger-bold" style={{ fontSize: "52px" }}><WarningOutlined /></label>
                                    </p>
                                    <p>
                                        <label className="topic-danger-bold" style={{ fontSize: "24px" }}>{processResult.status}</label>
                                    </p>
                                    <p>
                                        <label className="topic-danger">errorCode : {processResult.errorCode}</label>
                                    </p>
                                </div>
                            }
                        </div>
                    }
                    <div className="text-center">
                        <button className="btn-Close mb-3" onClick={() => { setModal(false) }}>
                            <label className="btn-Close-label">ปิด</label>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}


// วิธีเรียกใช้
/* <ProcessingResult
    setModal={(isVisible) => {
        setShowProcessResultModal(isVisible)
        setProcessResult({})
        setProcessResultTitle(null)
    }}
    isVisible={showProcessResultModal}
    response={processResult}
    title={processResultTitle}
/> */

// type = warning,confirm
