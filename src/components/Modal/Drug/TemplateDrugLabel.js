import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { Row, Col, Button, Modal, Form, Input, Table, Radio, Popconfirm } from 'antd';
import Column from 'antd/lib/table/Column';
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { InsDrugUsingTemplates, UpdDrugUsingTemplates, DelDrugUsingTemplates, apis } from './Api/TemplateDrugLabelApi';
import { NotificationCompo } from '../Notifications'
import { callApis } from "components/helper/function/CallApi";
import SelectDrugName from 'components/helper/SelectDrugName';

const FormInputDrugLabel = ({ form, line }) => {
    const docLabelLength = 50;
    let name = "docLabel" + line;
    let docLabel = Form.useWatch(name, form)
    return (
        <>
            <Col span={3} style={{ marginTop: 8, paddingLeft: 8 }}>

                <label className="gx-text-primary">
                    {line === "0" ? "ชื่อ template " : `บรรทัด#${line}`}

                </label></Col>
            <Col span={21}>
                <Row>
                    <Form.Item style={{ margin: 0, width: "100%" }} name={name}>
                        <Input
                            onChange={(e) => {
                                let value = e.target.value;
                                value = value.slice(0, docLabelLength);
                                form.setFieldsValue({ [name]: value });
                            }}
                        />
                    </Form.Item>
                </Row>
                {
                    docLabel?.length === docLabelLength ?
                        <Row><label style={{ color: "red" }}>ไม่เกิน {docLabelLength} ตัวอักษร</label></Row>
                        :
                        null
                }
            </Col>
        </>
    )
}

const CreateTemplate = forwardRef(function TemplateDrugLabel({
    expenseId = null,
    expenseList = [],
    getDrugUsingTemplatesAll = () => { },
    ...props }, ref) {
    const [createVisible, setCreateVisible] = useState(false);
    const [form] = Form.useForm();
    const type = Form.useWatch("type", form)
    const selectedExpenseId = Form.useWatch("expenseId", form)

    const onFinish = async (param) => {
        let req = { ...form.getFieldValue(), ...param };
        req.expenseId = req?.type === "EXP" ? req.expenseId : null
        let resData = null;
        if (req.tempUsingId) {
            resData = await UpdDrugUsingTemplates(req);
        } else {
            resData = await InsDrugUsingTemplates(req);
        }
        if (resData.isSuccess) {
            props.notiRef.current.setTitleFormulasDrugProcess({
                title: "บันทึกข้อมูลสำเร็จ",
                type: "success",
            });
            props.notiRef.current.setShowFormulasDrugProcess(true);
            setCreateVisible(false);
            getDrugUsingTemplatesAll();
        } else {
            props.notiRef.current.setTitleFormulasDrugProcess({
                title: "บันทึกข้อมูลไม่สำเร็จ",
                type: "error",
            });
            props.notiRef.current.setShowFormulasDrugProcess(true);
        }
    }

    const closeModal = () => {
        form.resetFields();
        setCreateVisible(false);
    }

    useImperativeHandle(ref, () => ({
        setCreateVisible: (props) => setCreateVisible(props),
        getForm: () => form
    }));

    return (
        <Modal title={<strong><label>14.2.7.1 Template วิธีใช้ยา</label></strong>}
            width="800px"
            centered
            visible={createVisible}
            onCancel={() => closeModal()}
            closable={false}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="cancel" onClick={() => { closeModal() }} >ออก</Button>
                    <Button key="ok" type="primary"
                        onClick={() => {
                            form.submit();
                        }}
                    >
                        บันทึก
                    </Button>
                </Row>
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row gutter={[16, 16]} style={{ flexDirection: "row" }}>
                    <Col span={24}><label className="gx-text-primary fw-bold">วิธีใช้ยาแบบระบุเอง</label></Col>
                    <FormInputDrugLabel form={form} line="0" />
                    <Col span={24}>
                        <Form.Item name="type" className='mb-0'>
                            <Radio.Group onChange={e => {
                                if (e.target.value !== "EXP") form.setFieldsValue({ expenseId: null })
                            }}>
                                <Radio value="NOEXP">วิธีใช้รวม</Radio>
                                <Radio value="EXP">จับคู่กับรายการยา</Radio>
                                {/* <Radio value="ALL">ทั้งหมด</Radio> */}
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="expenseId" className='mb-0'
                            label="รายการยา"
                            rules={[
                                { required: type === "EXP", message: 'กรุณาระบุรายการ !' },
                            ]}
                        >
                            <SelectDrugName
                                notUsePtFlag="N"
                                // notShow={props?.page === "7.5" || props?.page === "11.22" || props?.page === "9.6" ? "Y" : null}
                                expenseId={selectedExpenseId}
                                drugType={"MD"}
                                expense_List={expenseList}
                                doNotDowloadDropdown={true}
                                disabled={type !== "EXP"}
                            />
                        </Form.Item>
                    </Col>
                    <FormInputDrugLabel form={form} line="1" />
                    <FormInputDrugLabel form={form} line="2" />
                    <FormInputDrugLabel form={form} line="3" />
                    <FormInputDrugLabel form={form} line="4" />
                </Row>
            </Form>
        </Modal>
    )
})

export default forwardRef(function TemplateDrugLabel({ expenseId, expenseList = [], ...props }, ref) {
    // console.log('expenseId', expenseId)
    const [templateVisible, setTemplateVisible] = useState(false);
    const createTemplateRef = useRef(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const notificationCompoRef = useRef(null);
    const [searchValueTemplateName, setSearchValueTemplateName] = useState(null);
    const [searchName, setSearchName] = useState(null);
    const [searchTypeValue, setSearchTypeValue] = useState("EXP");

    const getDrugUsingTemplatesAll = async (searchTypeValue) => {
        setLoading(true);
        let res = await callApis(apis["GetDrugUsingTemplatesfilter"], {
            searchType: searchTypeValue,
            expenseId: searchTypeValue === "EXP" ? expenseId : null,
        });
        res = res.map((param) => {
            return {
                ...param, docLabel0: param.templateName
            }

        })
        setData(res);
        setSelectedRowKeys([]);
        setSearchValueTemplateName(null);
        setSearchName(null);
        setLoading(false);
    }

    const closeModal = () => {
        setTemplateVisible(false);
    }

    useImperativeHandle(ref, () => ({
        setTemplateVisible: (props) => setTemplateVisible(props),
    }));

    useEffect(() => {
        getDrugUsingTemplatesAll(searchTypeValue);
    }, [expenseId]);

    return (
        <>
            <Modal
                title={
                    <Row align="middle" style={{ position: "relative", margin: 0 }}>
                        <strong><label>14.2.7 Template วิธีใช้ยา</label></strong>
                        <Button type="primary" style={{ position: "absolute", right: 0, margin: 0, paddingLeft: 10, paddingRight: 10, fontSize: "24px" }}
                            onClick={() => {
                                createTemplateRef.current?.getForm().setFieldsValue({ expenseId: expenseId, type: "EXP" });
                                createTemplateRef.current.setCreateVisible(true);
                            }}
                        >+</Button>
                    </Row>
                }
                centered
                width="1200px"
                visible={templateVisible}
                onCancel={() => closeModal()}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={() => { closeModal() }} >ออก</Button>
                        <Button key="ok" type="primary"
                            onClick={() => {
                                console.log(selectedRowKeys);
                                props.form.setFieldsValue(selectedRowKeys)
                                setTemplateVisible(false);
                            }}
                        >
                            ตกลง
                        </Button>
                    </Row>
                ]}
            >
                <Row gutter={[8, 8]} align='middle'>
                    <Col span={6}>
                        <Input.Search placeholder="ค้นหา Template Name" allowClear
                            enterButton
                            onChange={(e) => setSearchValueTemplateName(e.target.value)}
                            onSearch={(value) => {
                                setSelectedRowKeys([]);
                                setSearchName(value);
                            }}
                            value={searchValueTemplateName}
                        />
                    </Col>
                    <Col>
                        <Radio.Group value={searchTypeValue} onChange={e => {
                            getDrugUsingTemplatesAll(e.target.value)
                            setSearchTypeValue(e.target.value)
                        }}>
                            <Radio value="NOEXP">วิธีใช้รวม</Radio>
                            <Radio value="EXP">จับคู่กับรายการยา</Radio>
                            <Radio value="ALL">ทั้งหมด</Radio>
                        </Radio.Group>
                    </Col>
                </Row>
                <Table
                    size='small'
                    scroll={{ x: 800, y: 480 }}
                    dataSource={searchName
                        ? data.filter(val => val.templateName?.includes(searchName))
                        : data
                    }
                    loading={loading}
                    pagination={{
                        pageSize: 50,
                        // showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
                        showSizeChanger: false
                    }}
                    rowKey="tempUsingId"
                >
                    <Column width={50} fixed="left"
                        title={<label className="gx-text-primary"><b>เลือก</b></label>}
                        align="center"
                        // dataIndex="admitRightId"
                        render={(record) => {
                            return (
                                <Radio.Group
                                    onChange={() => {
                                        setSelectedRowKeys(record/* .tempUsingId */)
                                    }}
                                    value={selectedRowKeys}
                                >
                                    <Radio value={record} />
                                </Radio.Group>
                            );
                        }}
                    />
                    <Column width={50} title={<label className="gx-text-primary" ><b>ID</b></label>} dataIndex="tempUsingId" />
                    <Column width={225} title={<label className="gx-text-primary" > <b>Template Name</b> </label>} dataIndex="templateName" />
                    <Column title={<label className="gx-text-primary" ><b>วิธีใช้</b></label>} dataIndex="docLabel" />
                    <Column
                        width={90}
                        fixed="right"
                        align='center'
                        render={(record) => {
                            return (
                                <Row style={{ marginLeft: 0 }}>
                                    <button
                                        className="btn-table editrow"
                                        style={{ marginRight: "0.25rem" }}
                                        onClick={() => {
                                            createTemplateRef.current.getForm().setFieldsValue({ ...record, type: record?.expenseid ? "EXP" : "NOEXP", expenseId: record.expenseid });
                                            createTemplateRef.current.setCreateVisible(true);
                                        }}
                                    >
                                        <EditOutlined />
                                    </button>
                                    <Popconfirm
                                        title="ต้องการลบหรือไม่?"
                                        onConfirm={async () => {
                                            let resData = await DelDrugUsingTemplates({ tempUsingId: record.tempUsingId })
                                            if (resData.isSuccess) {
                                                notificationCompoRef.current.setTitleFormulasDrugProcess({
                                                    title: "ลบข้อมูลสำเร็จ",
                                                    type: "success",
                                                });
                                                notificationCompoRef.current.setShowFormulasDrugProcess(true);
                                                getDrugUsingTemplatesAll();
                                            } else {
                                                notificationCompoRef.current.setTitleFormulasDrugProcess({
                                                    title: "ลบข้อมูลไม่สำเร็จ",
                                                    type: "error",
                                                });
                                                notificationCompoRef.current.setShowFormulasDrugProcess(true);
                                            }
                                        }}
                                    >
                                        <button className="btn-table deleterow">
                                            <DeleteOutlined />
                                        </button>
                                    </Popconfirm>
                                </Row>
                            );
                        }}
                    />
                </Table>
            </Modal>
            <CreateTemplate
                ref={createTemplateRef}
                notiRef={notificationCompoRef}
                expenseId={expenseId}
                expenseList={expenseList}
                getDrugUsingTemplatesAll={() => getDrugUsingTemplatesAll(searchTypeValue)}
            />
            <NotificationCompo ref={notificationCompoRef} />
        </>
    )
})