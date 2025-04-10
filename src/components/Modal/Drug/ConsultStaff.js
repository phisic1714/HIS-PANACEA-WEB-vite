import React from 'react'
import { Modal, Row, Col, Radio, Select, Form, Button, Input } from 'antd';
const optionsConsultType = [
    {
        value: "I",
        label: "แพทย์ Intern"
    },
    {
        value: "D",
        label: "สั่งยาไม่ตรงกับแพทย์"
    },
    {
        value: "S",
        label: "สั่งยาไม่ตรงกับสาขาแพทย์"
    },
    {
        value: "W",
        label: "สั่งยาไม่ตรงห้องตรวจ"
    },
]
export default function ConsultStaff({
    visible,
    setVisible,
    doctorList = [],
    consultType = null,
    consultDoctor = null,
    onSave = () => { },
    onClose = () => { },
}) {
    // console.log('consultDoctor :>> ', consultDoctor);
    // Form
    const [form] = Form.useForm()
    // Watch
    const consultStaffStatus = Form.useWatch("consultStaffStatus", form)
    const onFinish = (v) => {
        onSave(v)
    }
    return (
        <Modal
            visible={visible}
            centered
            title={<label className='gx-text-primary fw-bold fs-6'>
                Consult Staff ({optionsConsultType.find(o => o.value === consultType)?.label || "-"})
            </label>}
            width={750}
            onCancel={() => setVisible(false)}
            footer={
                <Row justify='center'>
                    <Button type="default" onClick={() => onClose()}>ออก</Button>
                    <Button type="primary" onClick={() => form.submit()}>บันทึก</Button>
                </Row>
            }
        >
            <Form
                form={form}
                onFinish={onFinish}
                layout='vertical'
                initialValues={{
                    consultStaffStatus: "Y",
                    consultType: consultType,
                    consultStaffId: consultDoctor,
                }}
            >
                <Form.Item hidden name="consultType"><Input /></Form.Item>
                <Form.Item
                    name="consultStaffStatus"
                    rules={[
                        {
                            required: true,
                            message: 'กรุณาเลือก Consult Staff'
                        }
                    ]}
                >
                    <Radio.Group
                        style={{ width: "100%" }}
                        onChange={(e) => {
                            form.setFieldsValue({
                                consultStaffId: e.target.value === "Y" ? consultDoctor : null
                            })
                        }}
                    >
                        <Row style={{ flexDirection: "row" }}>
                            <Col span={12}>
                                <Radio value="Y"><label className='gx-text-primary'>มีแพทย์ Consult Staff</label></Radio>
                            </Col>
                            <Col span={12}>
                                <Radio value="N"><label className='gx-text-primary'>ไม่มีแพทย์ Consult Staff</label></Radio>
                            </Col>
                        </Row>
                    </Radio.Group>
                </Form.Item>
                <Row style={{ flexDirection: "row" }}>
                    <Col span={12}>
                        <Form.Item
                            name="consultStaffId"
                            label={<label className='gx-text-primary'>ชื่อแพทย์ Consult Staff</label>}
                            rules={[
                                {
                                    required: consultStaffStatus === "Y",
                                    message: 'กรุณาเลือกแพทย์ Consult'
                                }
                            ]}
                        >
                            <Select
                                allowClear
                                showSearch
                                disabled={consultStaffStatus !== "Y"}
                                options={doctorList}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
