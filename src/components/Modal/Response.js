import React from 'react'
import { Row, Button, Modal, Space } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function Response({ isModalVisible, setIsModalVisible, modalIcon, modalTitle, modalContent }) {
    return(
        <Modal 
            /* title="Basic Modal"  */
            centered
            visible={isModalVisible}
            onCancel={()=>setIsModalVisible(false)}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="ok" onClick={()=>setIsModalVisible(false)} style={{ width:"20%" }}>ปิด</Button>
                </Row>
            ]}
        >
            <Space direction="vertical" size={10} style= {{ width: '100%' }}>
            <Row justify="center" key="icon">
                {modalIcon === "error" && <CloseCircleOutlined style={{fontSize: '3rem',color : "red"}}/>}
                {modalIcon === "warning" && <ExclamationCircleOutlined  style={{fontSize: '3rem',color : "orange"}}/>}
                {modalIcon === "success" && <CheckCircleOutlined style={{fontSize: '3rem',color : "#1DAA3E"}}/>}
            </Row>
                <Row justify="center" key="title">
                    <p ><strong style={{fontSize: '1.5rem'}}>{modalTitle}</strong></p>
                </Row>
                <Row justify="center" key="content" >
                    <p style={{overflow: "auto"}}>{modalContent}</p>
                </Row>
            </Space>
        </Modal>
    );
}