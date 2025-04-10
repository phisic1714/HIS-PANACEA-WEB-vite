import React from 'react'
import { Button } from 'antd'
import { RollbackOutlined } from "@ant-design/icons";
import { useHistory } from 'react-router-dom'

export default function BackToPage ({ goToPageUrl=null, ...props }) {
    const history = useHistory()
    return (
        <Button
            style={{ marginBottom: 0 }}
            onClick={() => {
                if (goToPageUrl){
                    history.push({ pathname: goToPageUrl })
                }
            }}
            type="ghost"
            icon={<RollbackOutlined />}
        >
            {props.children}
        </Button>
    )
}