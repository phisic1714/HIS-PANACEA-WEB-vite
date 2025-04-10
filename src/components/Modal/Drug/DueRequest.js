import React, { useState, useEffect, useMemo } from 'react'
import { Modal, Form, Tabs, Row, Col, Input, Radio, Select, Spin } from 'antd'
import {
    LabelTopic,
    LabelTopicPrimary18,
    GenFormItemLabel,
} from 'components/helper/function/GenLabel';
import { rowProps, selectSm, } from 'props'
import { callApis } from 'components/helper/function/CallApi';
import { mappingOptions } from "components/helper/function/MappingOptions";
import dayjs from "dayjs"
import { notiSuccess, notiError } from "components/Notification/notificationX"
const size = "small"
const rules = [
    {
        required: true,
        message: 'จำเป็น',
    },
]
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId || null;
export default function DueRequest({
    dueReport = null,
    expenses = [],
    visible = false,
    onClose = () => { },
    reloadOrder = () => { },
    reloadDrugProfile = () => { },
    onSave = () => { },
    optionsUser = []
}) {
    // Form
    const [formDue] = Form.useForm()
    // Watch
    const dueRpid = Form.useWatch("dueRpid", formDue)
    const dueType = Form.useWatch("dueType", formDue)
    // State
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState({
        indication: [],
        empirical: [],
        specific: [],
        sumEmpirical: [],
        sumeSpecific: [],
        suitability: [],
        csResult: [],
        csResultPositive: [],
        drugBacteria: [],
    })
    const [selectedDueType, setSelectedDueType] = useState({})
    // Functions
    const updateDueReport = async (dts) => {
        const req = [
            {
                ...dts,
                dueRpid: dueRpid ? String(dueRpid) : null,
                financeId: dts.financeId,
                userModified: user,
                dateModified: dayjs(),
                dueRemark: dts.dueType === "E"
                    ? dts?.empiricalRemark
                    : dts.dueType === "S"
                        ? dts?.specificRemark
                        : null,
            },
        ]
        setLoading(p => !p)
        const res = await callApis(apis["UpsertDueReport"], req)
        setLoading(p => !p)
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึก Due report" })
            reloadOrder()
            reloadDrugProfile()
            onClose()
        } else notiError({ message: "บันทึก Due report" })
    }
    const onFinishDue = v => {
        // console.log('onFinishDue :>> ', v);
        if (dueRpid) return updateDueReport(v)
        onSave(v)
        formDue.resetFields()
        onClose()
    }
    const getOptions = async () => {
        setLoading(p => !p)
        let [
            indication,
            empirical,
            specific,
            sumEmpirical,
            sumeSpecific,
            suitability,
            csResult,
            csResultPositive,
            drugBacteria,
        ] = await Promise.all([
            callApis(apis["Indication"]),
            callApis(apis["DueEmpiricalDropdown"]),
            callApis(apis["DueRemarkSpecificDropdown"]),
            callApis(apis["SummarizeEmpiricalDropdown"]),
            callApis(apis["SummarizeSpecificDropdown"]),
            callApis(apis["GetDropDownMas"], { "table": "TB_DUE_REPORTS", "field": "suitability" }),
            callApis(apis["GetDropDownMas"], { "table": "TB_DUE_REPORTS", "field": "CsResult" }),
            callApis(apis["GetDropDownMas"], { "table": "TB_DUE_REPORTS", "field": "CsResultPositive" }),
            callApis(apis["GetDropDownMas"], { "table": "TB_DUE_REPORTS", "field": "Drugbacteria" }),
            callApis(apis["GetDropDownMas"], { "table": "TB_DUE_REPORTS", "field": " INDICATION", "Labelcolumn": "INDICATION" }),
        ])
        setLoading(p => !p)
        indication = mappingOptions({ dts: indication })
        empirical = mappingOptions({ dts: empirical })
        specific = mappingOptions({ dts: specific })
        sumEmpirical = mappingOptions({ dts: sumEmpirical })
        sumeSpecific = mappingOptions({ dts: sumeSpecific })
        suitability = mappingOptions({ dts: suitability })
        csResult = mappingOptions({ dts: csResult })
        csResultPositive = mappingOptions({ dts: csResultPositive })
        drugBacteria = mappingOptions({ dts: drugBacteria })
        setOptions(p => {
            return {
                ...p,
                indication,
                empirical,
                specific,
                sumEmpirical,
                sumeSpecific,
                suitability,
                csResult,
                csResultPositive,
                drugBacteria,
            }
        })
    }
    const genFormList = (expenses = []) => {
        if (!expenses?.length) return
        expenses.map(o => {
            formDue.setFieldsValue({ [o.expenseId]: [{}] })
        })
    }
    // Helper function
    const defaultForm = (dts) => {
        if (!dts) return
        formDue.setFieldsValue({
            ...dts,
            empiricalRemark: dts.dueType === "E" ? dts?.dueRemark : null,
            specificRemark: dts.dueType === "S" ? dts?.dueRemark : null,
        })
    }
    // Handle
    const handleChangeDueType = (listName, value) => {
        if (!listName) {
            formDue.setFieldsValue({
                empiricalRemark: null,
                specificRemark: null,
            })
            return
        }
        setSelectedDueType({
            [listName]: value
        })
        const formValues = formDue.getFieldValue(listName)[0]
        formDue.setFieldsValue({
            [listName]: [{
                ...formValues,
                empiricalRemark: null,
                specificRemark: null,
            }]
        })
    }

    // Effect
    useEffect(() => {
        getOptions()
    }, [])
    useEffect(() => {
        genFormList(expenses)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenses])
    useEffect(() => {
        defaultForm(dueReport)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dueReport])


    // Components
    const PartsFormList = expense => {
        const listName = expense.expenseId
        const PartsUser = name => {
            return <div className='p-2' style={{ backgroundColor: "#fafafa" }}>
                <LabelTopicPrimary18 text='สำหรับผู้สั่งใช้ยา' />
                <Row {...rowProps}>
                    <Col span={24}>
                        <LabelTopic className='me-1' text={expense.expenseName} />
                    </Col>
                    <Col span={24}>
                        <Form.Item className='mb-2' name={[name, 'dueType']} rules={rules}>
                            <Radio.Group
                                style={{ width: "100%" }}
                                onChange={(e) => handleChangeDueType(listName, e.target.value)}
                            >
                                <Row {...rowProps} align='middle'>
                                    <Col span={10}>
                                        <Radio value={"E"}>
                                            <GenFormItemLabel label="Empirical" />
                                        </Radio>
                                    </Col>
                                    <Col span={14}>
                                        <Form.Item className='mb-0' name={[name, 'empiricalRemark']}>
                                            <Select
                                                {...selectSm}
                                                options={options.empirical}
                                                disabled={selectedDueType[listName] !== "E"}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Radio value={"S"}>
                                            <GenFormItemLabel label="Specific" />
                                        </Radio>
                                    </Col>
                                    <Col span={14}>
                                        <Form.Item className='mb-0' name={[name, 'specificRemark']}>
                                            <Select {...selectSm} options={options.specific}
                                                disabled={selectedDueType[listName] !== "S"}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Radio.Group>
                        </Form.Item>
                        <GenFormItemLabel label="หมายเหตุถึงเภสัช" />
                        <Form.Item className='mb-0' name={[name, 'remarkToPharmacy']}>
                            <Input.TextArea rows={4} className='mt-1' />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        }
        const PartsPharmacist = name => {
            return <div className='p-2'>
                <LabelTopicPrimary18 text='สำหรับเภสัช' />
                <Row {...rowProps}>
                    <Col span={24}>
                        <GenFormItemLabel label="Indication" />
                        <Form.Item className='mb-0' name={[name, 'indication']}>
                            <Select {...selectSm} options={options.indication} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="สรุป Empirical" />
                        <Form.Item className='mb-0' name={[name, 'summarizeEmpirical']}>
                            <Select {...selectSm} options={options.sumEmpirical} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="สรุป Specific" />
                        <Form.Item className='mb-0' name={[name, 'summarizeSpecific']}>
                            <Select {...selectSm} options={options.sumeSpecific} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ความเหมาะสมด้านขนาดยา" />
                        <Form.Item className='mb-0' name={[name, 'suitability']}>
                            <Select {...selectSm} options={options.suitability} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ผล C/S" />
                        <Form.Item className='mb-0' name={[name, 'csResult']}>
                            <Select {...selectSm} options={options.csResult} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ผล C/S Positive" />
                        <Form.Item className='mb-0' name={[name, 'csResultPositive']}>
                            <Select {...selectSm} options={options.csResultPositive} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="เชื้อดื้อยา" />
                        <Form.Item className='mb-0' name={[name, 'drugBacteria']}>
                            <Select {...selectSm} options={options.drugBacteria} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="De-escalate" />
                        <Form.Item className='mb-0' name={[name, 'deEscalate']}>
                            <Select {...selectSm} options={options.suitability} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="หมายเหตุ" />
                        <Form.Item className='mb-0' name={[name, 'remark']}>
                            <Input.TextArea rows={4} className='mt-1' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ประเมิน" />
                        <Form.Item className='mb-0' name={[name, 'userCreated']}>
                            <Select {...selectSm} options={optionsUser} />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        }
        return <Form.List name={listName}>
            {(fields) => (
                <>
                    {fields.map(({ key, name, }) => (
                        <Row {...rowProps} key={key}>
                            <Col span={12}>
                                {PartsUser(name)}
                            </Col>
                            <Col span={12}>
                                {PartsPharmacist(name)}
                            </Col>
                        </Row>
                    ))}
                </>
            )}
        </Form.List>
    }
    const PartForm = () => {
        const PartsUser = () => {
            return <div className='p-2' style={{ backgroundColor: "#fafafa" }}>
                <LabelTopicPrimary18 text='สำหรับผู้สั่งใช้ยา' />
                <Row {...rowProps}>
                    {/* <Col span={24}>
                        <LabelTopic className='me-1' text={expense.expenseName} />
                    </Col> */}
                    <Col span={24}>
                        <Form.Item className='mb-2' name="dueType" rules={rules}>
                            <Radio.Group
                                style={{ width: "100%" }}
                                onChange={() => handleChangeDueType()}
                            >
                                <Row {...rowProps} align='middle'>
                                    <Col span={10}>
                                        <Radio value={"E"}>
                                            <GenFormItemLabel label="Empirical" />
                                        </Radio>
                                    </Col>
                                    <Col span={14}>
                                        <Form.Item className='mb-0' name="empiricalRemark">
                                            <Select {...selectSm} options={options.empirical} disabled={dueType !== "E"} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={10}>
                                        <Radio value={"S"}>
                                            <GenFormItemLabel label="Specific" />
                                        </Radio>
                                    </Col>
                                    <Col span={14}>
                                        <Form.Item className='mb-0' name="specificRemark">
                                            <Select {...selectSm} options={options.specific} disabled={dueType !== "S"} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Radio.Group>
                        </Form.Item>
                        <GenFormItemLabel label="หมายเหตุถึงเภสัช" />
                        <Form.Item className='mb-0' name="remarkToPharmacy">
                            <Input.TextArea rows={4} className='mt-1' />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        }
        const PartsPharmacist = () => {
            return <div className='p-2'>
                <LabelTopicPrimary18 text='สำหรับเภสัช' />
                <Row {...rowProps}>
                    <Col span={24}>
                        <GenFormItemLabel label="Indication" />
                        <Form.Item className='mb-0' name="indication">
                            <Select {...selectSm} options={options.indication} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="สรุป Empirical" />
                        <Form.Item className='mb-0' name="summarizeEmpirical">
                            <Select {...selectSm} options={options.sumEmpirical} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="สรุป Specific" />
                        <Form.Item className='mb-0' name="summarizeSpecific">
                            <Select {...selectSm} options={options.sumeSpecific} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ความเหมาะสมด้านขนาดยา" />
                        <Form.Item className='mb-0' name="suitability">
                            <Select {...selectSm} options={options.suitability} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ผล C/S" />
                        <Form.Item className='mb-0' name="csResult">
                            <Select {...selectSm} options={options.csResult} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ผล C/S Positive" />
                        <Form.Item className='mb-0' name="csResultPositive">
                            <Select {...selectSm} options={options.csResultPositive} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="เชื้อดื้อยา" />
                        <Form.Item className='mb-0' name="drugBacteria">
                            <Select {...selectSm} options={options.drugBacteria} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="De-escalate" />
                        <Form.Item className='mb-0' name="deEscalate">
                            <Select {...selectSm} options={options.suitability} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <GenFormItemLabel label="หมายเหตุ" />
                        <Form.Item className='mb-0' name="remark">
                            <Input.TextArea rows={4} className='mt-1' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <GenFormItemLabel label="ประเมิน" />
                        <Form.Item className='mb-0' name="userCreated">
                            <Select {...selectSm} options={optionsUser} />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        }
        return <Row {...rowProps}>
            <Col span={12}>
                {PartsUser()}
            </Col>
            <Col span={12}>
                {PartsPharmacist()}
            </Col>
        </Row>
    }
    return <Modal
        centered
        visible={visible}
        title={<LabelTopicPrimary18 text='รายงานยา DUE' />}
        width={1145}
        closable={false}
        closeIcon={false}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => formDue.submit()}
        onCancel={() => {
            formDue.resetFields()
            onClose()
        }}
    >
        <Spin spinning={loading}>
            <div style={{ margin: -18 }}>
                <Form
                    form={formDue}
                    onFinish={onFinishDue}
                    layout='vertical'
                    onValuesChange={(changedValues, values) => {
                        console.log('changedValues', changedValues)
                        const name = Object.keys(changedValues)
                        const value = Object.values(changedValues)
                    }}
                >
                    <Form.Item hidden name="dueRpid"> <Input /></Form.Item>
                    <Form.Item hidden name="financeId"> <Input /></Form.Item>
                    <Form.Item hidden name="dateCreated"> <Input /></Form.Item>
                    {
                        dueRpid
                            ? PartForm()
                            : <Tabs
                                type='card'
                                tabPosition="left"
                                size='small'
                                defaultActiveKey="0"
                            >
                                {
                                    expenses.map((o, i) => {
                                        return <Tabs.TabPane tab={o.expenseName} key={String(i)} forceRender>
                                            {PartsFormList(o)}
                                        </Tabs.TabPane>
                                    })
                                }
                            </Tabs>
                    }
                </Form>
            </div>
        </Spin>
    </Modal>
}

const apis = {
    Indication: {
        url: "Masters/Indication",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    DueEmpiricalDropdown: {
        url: "DueReports/DueRemarkEmpiricalDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    DueRemarkSpecificDropdown: {
        url: "DueReports/DueRemarkSpecificDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    SummarizeEmpiricalDropdown: {
        url: "DueReports/SummarizeEmpiricalDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    SummarizeSpecificDropdown: {
        url: "DueReports/SummarizeSpecificDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetDropDownMas: {
        url: "Masters/GetDropDownMas",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    UpsertDueReport: {
        url: "DueReports/UpsertDueReport",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}