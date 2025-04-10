import React, { useState } from 'react'
import { CommentOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import EMessage from "components/Modal/EMessageAntdDatePicker";

export default function BtnEmessage({
    patientId = null,
    size = "small",
    type = "default",
    ...props
}) {
    const [vsbEMessage, setVsbEMessage] = useState(false)
    return <>
        <Button
            className='mb-0'
            size={size}
            type={type}
            icon={<CommentOutlined className="gx-text-primary" />}
            onClick={() => setVsbEMessage(true)}
            {...props}
        />
        {
            vsbEMessage && <EMessage
                isVisible={vsbEMessage}
                onOk={() => setVsbEMessage(false)}
                onCancel={() => setVsbEMessage(false)}
                patientId={patientId || null}
            />}
    </>
}
