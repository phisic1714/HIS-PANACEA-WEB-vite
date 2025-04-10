import React, { useState } from 'react'
import { Button, Checkbox, Col, Divider, Form, Modal, Row, Select, Spin } from 'antd'
import { useEffect } from 'react';
import * as api from "./Api/DruginDGApi";
import { GetDropDownMas } from "../../../api/Masters";
import { DivScrollY, DivScrollXY } from "../../helper/DivScroll"
import { DeleteOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import styled from 'styled-components';

export default function DruginDG({ visible, setVisible, drugGroupId, drugGroupName }) {
    const [loading, setLoading] = useState(false);
    const [expenseInDG, setExpenseInDG] = useState([]);
    const [form] = Form.useForm();
    const [riskADRList, setRiskADRList] = useState([]);
    const [drugOffGroupList, setDrugOffGroupList] = useState([]);

    const getDataBydrugGroupId = async (drugGroupId) => {
        setLoading(true);
        await Promise.all([getAllExpenseInDrugGroup(drugGroupId), getDrugAllergySet(drugGroupId), getDrugOffGroup(drugGroupId)])
        setLoading(false);
    }

    const getAllExpenseInDrugGroup = async (drugGroupId) => {
        let res = await api.GetAllExpenseInDrugGroup(drugGroupId);
        if (res?.isSuccess) {
            setExpenseInDG(res?.responseData)
        }
    }

    const getDrugAllergySet = async (drugGroupId) => {
        let res = await api.GetDrugAllergySet(drugGroupId);
        if (res?.isSuccess) {
            form.setFieldsValue({
                list: res?.responseData.map(val => ({
                    ...val,
                    drugGroupId: val?.drugOutGroup,
                    drugGroupName: val?.drugOutGroupName,
                    lockFlag: val?.lockFlag === "Y" ? true : false
                }))
            });
        }
    }

    const getDrugOffGroup = async (drugGroupId) => {
        let res = await api.GetDrugOffGroup(drugGroupId);
        if (res?.isSuccess) {
            setDrugOffGroupList(res?.responseData);
        }
    }

    const getRiskADRList = async () => {
        let res = await GetDropDownMas({
            table: "TBM_DRUG_ALLERGY_ACROSS_GROUPS",
            field: "RiskADR"
        });
        if (res?.isSuccess) {
            setRiskADRList(res?.responseData);
        }
    }

    const onFinish = async (value) => {
        // console.log(value,"value");
        setLoading(true);
        const userFromSession = JSON.parse(sessionStorage.getItem("user"));
        let user = userFromSession.responseData.userId;
        let req = value.list.map((val, index) => ({
            ...val,
            lockFlag: val?.lockFlag ? "Y" : null,
            drugAllergyAcrossGroupsId: form.getFieldValue("list")[index]?.drugAllergyAcrossGroupsId ? form.getFieldValue("list")[index]?.drugAllergyAcrossGroupsId : null,
            druginGroup: drugGroupId,
            drugOutGroup: form.getFieldValue("list")[index]?.drugGroupId,
            drugOutExpenseID: val?.expenseId,
            user: user
        }))
        console.log(req, "req");
        let res = await api.UpSertDrugAllergy(req);
        if (res?.isSuccess) {
            toast.success('บันทึกสำเร็จ', toastSetting);
            getDrugAllergySet(drugGroupId)
        } else {
            toast.error('บันทึกไม่สำเร็จ', toastSetting);
        }
        setLoading(false);
    }

    useEffect(() => {
        getRiskADRList();
        return () => {
            setRiskADRList([]);
        }
    }, [])

    useEffect(() => {
        if (drugGroupId) {
            getDataBydrugGroupId(drugGroupId)
        }
        return () => {
            setExpenseInDG([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drugGroupId])

    return (
        <Modal
            title={
                <Row align='middle'>
                    <Col span={24}>
                        <strong><label className='gx-text-primary'>กลุ่มยา : {drugGroupName}</label></strong>
                        <Button
                            type='primary'
                            style={{ marginLeft: 16, marginBottom: 0 }}
                            onClick={() => {
                                let oldList = form.getFieldValue("list");
                                form.setFieldsValue({ list: [...oldList, {}] })
                            }}
                        >+</Button>
                    </Col>
                </Row>
            }
            centered
            visible={visible}
            onCancel={() => setVisible(false)}
            closable={false}
            width="1000px"
            bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
            footer={[
                <Row justify="center" key="footer">
                    <Button type='default' key="cancel"
                        onClick={() => {
                            setVisible(false);
                        }}
                    >ยกเลิก</Button>
                    <Button type='primary' key="save"
                        onClick={() => {
                            form.submit();
                            // setVisible(false);
                        }}
                    >บันทึก</Button>
                </Row>]}
        >
            <Spin spinning={loading}>
                <Row gutter={[0, 0]}>
                    <Col span={7} style={{ paddingTop: 16, paddingBottom: 16 }}>
                        <DivScrollY height={500}>
                            <Row style={{ margin: 0, marginBottom: 8 }}><label className='gx-text-primary'>ยาในกลุ่ม</label></Row>
                            {expenseInDG.map((val, index) => (
                                <Row key={index} style={{ margin: 0 }}>
                                    {index + 1}. {val?.expenseName}
                                </Row>
                            ))}
                        </DivScrollY>
                    </Col>
                    <Col span={1} style={{ textAlign: "center" }}>
                        <Divider type='vertical' style={{ height: "100%", border: "1px solid #ececec" }} />
                    </Col>
                    <Col span={16} style={{ paddingTop: 16, paddingBottom: 16, paddingLeft: 0 }}>
                        <DivScrollXY height={500} width={"100%"} >
                            <div style={{ width: 1000/* , paddingBottom: 8 */ }}>
                                <Form form={form} layout='vertical' onFinish={onFinish}>
                                    <Form.List name="list" initialValue={[{}]}>
                                        {(list, { remove }) => (
                                            <>
                                                {list.map((val, index) => (
                                                    <Row key={index} gutter={[16, 16]} style={{ flexDirection: "row" }}>
                                                        <Col span={7}>
                                                            <Form.Item
                                                                label={<label className='gx-text-primary'>ยานอกกลุ่ม</label>}
                                                                name={[index, "expenseId"]}
                                                                style={{ marginBottom: 0 }}
                                                                rules={[{ required: true, message: "ระบุ" }]}
                                                            >
                                                                <Select
                                                                    allowClear
                                                                    style={{ width: "100%" }}
                                                                    showSearch
                                                                    optionFilterProp='label'
                                                                    options={drugOffGroupList.map(n => ({ value: n.expenseId, label: n.expenseName, drugGroupId: n.drugGroup, drugGroupName: n.drugGroupName }))}
                                                                    onChange={(val, option) => {
                                                                        console.log(option, "option");
                                                                        form.setFields([
                                                                            {
                                                                                name: ["list", index, "drugGroupId"],
                                                                                value: option.drugGroupId
                                                                            },
                                                                            {
                                                                                name: ["list", index, "drugGroupName"],
                                                                                value: option.drugGroupName
                                                                            },
                                                                        ])
                                                                    }
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={7}>
                                                            <Form.Item
                                                                label={<label className='gx-text-primary'>กลุ่มยา</label>}
                                                                style={{ marginBottom: 0 }}
                                                                shouldUpdate={(prev, cur) => prev.list[index]?.drugGroupName !== cur.list[index]?.drugGroupName}
                                                            >
                                                                {({ getFieldValue }) => (<>{getFieldValue("list")[index]?.drugGroupName}</>)}
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={7}>
                                                            <Form.Item
                                                                label={<label className='gx-text-primary'>ระดับความเสี่ยง</label>}
                                                                name={[index, "riskADR"]}
                                                                style={{ marginBottom: 0 }}
                                                                rules={[{ required: true, message: "ระบุ" }]}
                                                            >
                                                                <Select
                                                                    allowClear
                                                                    style={{ width: "100%" }}
                                                                    showSearch
                                                                    optionFilterProp='label'
                                                                    options={riskADRList.map(n => ({ value: n.datavalue, label: n.datadisplay }))}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={2} style={{ textAlign: "center" }}>
                                                            <Form.Item
                                                                label={<> </>}
                                                                name={[index, "lockFlag"]}
                                                                style={{ marginBottom: 0 }}
                                                                valuePropName="checked"
                                                            >
                                                                <Checkbox><label className='gx-text-primary'>Lock</label></Checkbox>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={1} style={{ textAlign: "center" }}>
                                                            <Form.Item
                                                                label={<> </>}
                                                            >
                                                                <DelectBtn
                                                                    className="btn-table deleterow"
                                                                    style={{
                                                                        marginRight: 0,
                                                                        color: "white !important",

                                                                    }}
                                                                    onClick={() => {
                                                                        // e.stopPropagation();
                                                                        remove(index);
                                                                    }}
                                                                >
                                                                    <DeleteOutlined />
                                                                </DelectBtn>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </>
                                        )}
                                    </Form.List>
                                </Form>
                            </div>
                        </DivScrollXY>
                    </Col>
                </Row>
            </Spin>
        </Modal>
    )
}

const toastSetting = {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    className: "toastBodyClassName"
};

const DelectBtn = styled(Button)`
    color: white !important;
    :active{
        color: white !important;
        background-color: red !important;
    }
    :focus{
        color: white !important;
        background-color: red !important;
    }
    :hover{
        color: white !important;
    }
`;