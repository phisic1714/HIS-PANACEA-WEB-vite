import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import UploadToZip from './UploadToZip'
import ZipFilesShow from 'components/files/ZipFilesShow'

export default function ZipFilePicker ({ base64, onChange=()=>{} }) {
    const [zipBase64, setZipBase64] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (base64){
            setZipBase64(base64)
        }
        else{
            setZipBase64(null)
        }
    }, [base64])

    const onSetBase64 = (data) => {
        onChange(data)
        setZipBase64(data)
    }

    const onUpload = (status) => {
        setLoading(status === 'uploading')
    }

    return (
        <Row>
            <label className="gx-text-primary">
                File เอกสารประกอบ
            </label>
            <Row
            style={{ flexDirection: 'row', marginTop: 10 }}
            >
                <Col span={6}>
                    <UploadToZip base64={zipBase64} onChange={(data) => onSetBase64(data?.base64)} onUpload={onUpload}/>
                </Col>
                <Col span={18}>
                    <ZipFilesShow showRemove loading={loading} base64={zipBase64} onChange={(data) => onSetBase64(data?.base64)}/>
                </Col>
            </Row>
        </Row>
    )
}