import React from 'react'
import {
    Col, Modal,
} from 'antd';
import GenRow from "components/helper/function/GenRow";
import { LabelTopicPrimary18 } from 'components/helper/function/GenLabel';

export default function ModalLengthAndHeight24Months({
    visible = false,
    onCancel = () => { },
    vitalSignHis = [
        {
            age: 0,
            height: 30,
            weight: 15,
        }
    ],
    // orderId = null,
}) {
    return <Modal
        title={<GenRow align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
            <Col span={12}>
                <LabelTopicPrimary18 text='สรุปค่าใช้จ่าย' />
            </Col>
            <Col span={12} className='text-end'>

            </Col>
        </GenRow>}
        centered
        visible={visible}
        closable={false}
        width={1375}
        // okText="บันทึก"
        cancelText="ปิด"
        // onOk={() => handleOk()}
        // onCancel={() => handleCancle()}
        okButtonProps={{
            hidden: true,
        }}
    >

    </Modal>
}