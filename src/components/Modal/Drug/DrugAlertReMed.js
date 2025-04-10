import { env } from '../../../env';
import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs';
import { Col, Divider, Form, Image, Input, InputNumber, Modal, Radio, Row, Select, Spin, Table } from 'antd';
import { filter, find, map } from 'lodash';
import { rowProps, } from 'props';
import { LabelText, LabelTopicPrimary18 } from 'components/helper/function/GenLabel';
import { FileTextFilled } from '@ant-design/icons';
import DueRequest from 'components/Modal/Drug/DueRequest';
import { callApis } from 'components/helper/function/CallApi.js';
import { notiWarning } from 'components/Notification/notificationX';

const size = "small"
// const userFromSession = JSON.parse(sessionStorage.getItem("user"));
// const user = userFromSession.responseData.userId;
export default function DrugAlertReMed({
    visible = false,
    setVisible = () => { },
    expenses = [],
    optionsDoctor = [],
    onFinished = () => { },
    doctorId,
    isReMed = true,
}) {
    // console.log('drugAllergies :>> ', drugAllergies);
    // console.log('expenses :>> ', expenses);
    // console.log('diList', diList)
    // Form
    const [form] = Form.useForm()
    // Watch
    const consultStaffStatus = Form.useWatch("consultStaffStatus", form)
    // State
    const [formRequired, setFormRequired] = useState({
        adrReason: false,
        diAdrReason: false,
        consult: false,
        drugInteractions: false,
    })
    const [vsbDueRequest, setVsbDueRequest] = useState(false);
    const [loading, setLoading] = useState(false)
    const [isDrugAllergy, setIsDrugAllergy] = useState(false)
    const [isDrugInteraction, setIsDrugInteraction] = useState(false)
    // Functions
    const chkUser = async (dts) => {
        if (!formRequired.adrReason && !formRequired.diAdrReason && !formRequired.consult) return true
        setLoading(p => !p)
        const req = {
            userId: dts.userName,
            password: dts.password
        }
        const res = await callApis(apis['ChkUser'], req)
        setLoading(p => !p)
        if (!res?.responseData) {
            notiWarning({ message: "Username หรือ รหัสผ่านไม่ถูกต้อง !", description: "กรุณาลองใหม่อีกครั้ง" })
        }
        return res?.responseData
    }
    const reChkDueReport = (v) => {
        const findDue = find(v.expenses, ["dueReport", "Y"])
        if (findDue) {
            setVsbDueRequest(true)
            return true
        }
        return false
    }
    const onFinish = async (v) => {
        const resChkUser = await chkUser(v)
        if (!resChkUser) return
        const reCheckDue = reChkDueReport(v)
        if (reCheckDue) return
        const expenses = map(v?.expenses, o => {
            const drugAllergy = (o?.drugGenericAllergy?.length || o?.drugCodeAllergy || o?.drugGroupAllergy?.length || o?.drugComponentsAllergy?.length) ? true : false
            let financeConsult = null
            if (o?.allowedDrugAndDoctor) {
                financeConsult = {
                    consultStaffStatus: v?.consultStaffStatus,
                    consultType: "D",
                    consultStaffId: v?.consultStaffId || null,
                }
            } else if (o?.allowedDrugAndDocSpecialties) {
                financeConsult = {
                    consultStaffStatus: v?.consultStaffStatus,
                    consultType: "S",
                    consultStaffId: v?.consultStaffId || null,
                }
            }
            let adrReason = null
            let userAdr = null
            let dateAdr = null
            if (!o?.financeId) {
                adrReason = drugAllergy ? v.adrReason : o?.drugInteractions?.length ? v.diAdrReason : null
                userAdr = drugAllergy || o?.drugInteractions?.length ? doctorId : null
                dateAdr = drugAllergy || o?.drugInteractions?.length ? dayjs().format('YYYY-MM-DD HH:mm') : null
            }
            return {
                ...o,
                adrReason: adrReason,
                userAdr: userAdr,
                dateAdr: dateAdr,
                financeConsult: o?.financeId ? null : financeConsult,
                isAlerted: true,
            }
        })
        onFinished(expenses)
    }
    const defaultForm = () => {
        if (!expenses?.length) return form.resetFields()
        const mapping = map(expenses, o => {
            let classes = 'border-bottom-2 data-value'
            let img = null
            let drugAndLabs = []
            map(o.opdFormulaExpensesGeneric, o => {
                map(o.drugAdnLab, x => {
                    drugAndLabs = [...drugAndLabs, x]
                })
            })
            if (
                o?.drugGenericAllergy?.length
                || o?.drugCodeAllergy
                || o?.drugGroupAllergy?.length
                || o?.drugComponentsAllergy?.length
            ) {
                setIsDrugAllergy(true)
                classes = "marking-row-danger border-bottom-2 data-value"
                img = "drugAllergy.jpg"
            } else if (o?.drugInteractions?.length) {
                setIsDrugInteraction(true)
                classes = "marking-row-yellow border-bottom-2 data-value"
                img = "di.jpg"
            } else if (drugAndLabs?.length) {
                classes = "marking-row-orange border-bottom-2 data-value"
                img = "dl.jpg"
            } else if (o?.dueReport === "Y") {
                img = "due.jpg"
            }
            return {
                ...o,
                classes,
                img,
            }
        })
        form.setFieldsValue({ expenses: mapping })
    }
    const chkRequiredForm = () => {
        if (!expenses?.length) return
        const findDrugAllergy = find(expenses, o => (o?.drugGenericAllergyLock || o?.drugCodeAllergyLock || o?.drugGroupAllergyLock || o?.drugComponentsAllergyLock))
        const findConsult = find(expenses, o => o?.allowedDrugAndDoctor || o?.allowedDrugAndDocSpecialties)
        let drugInteractions = []
        map(expenses, o => {
            if (o?.drugInteractions?.length) drugInteractions = [...drugInteractions, ...o?.drugInteractions || []]
        })
        const findDrugInteractionsLock = find(drugInteractions, ["lockFlag", "Y"])
        setFormRequired(p => {
            return {
                ...p,
                adrReason: findDrugAllergy ? true : false,
                consult: findConsult ? true : false,
                drugInteractions: findDrugInteractionsLock ? true : false,
            }
        })
    }
    const chkDueReport = () => {
        if (!expenses?.length) return
        const findDue = find(expenses, ["dueReport", "Y"])
        if (findDue) setVsbDueRequest(true)
    }
    // Effect
    useEffect(() => {
        defaultForm()
        chkRequiredForm()
        chkDueReport()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenses])
    // Components
    const PartsTable = () => {
        const columns = [
            {
                title: "ลำดับ",
                dataIndex: "",
                width: 58,
                align: "center",
                render: (v, r, i) => {
                    return i + 1
                }
            },
            {
                title: "รายการยาเวชภัณฑ์",
                width: 240,
                render: (v, r, i) => {
                    let drugLabel = r.drugLabelName
                    if (r.route === "D") {
                        drugLabel = (r?.docLabel1 || "") + " " + (r?.docLabel2 || "") + " " + (r?.docLabel3 || "") + " " + (r?.docLabel4 || "")
                    }
                    return <Row {...rowProps}>
                        <Col span={24}>
                            <Row {...rowProps}>
                                <Col span={2} className='text-center'>
                                    {
                                        r?.img && <Image
                                            className='pointer'
                                            width={15}
                                            height={15}
                                            preview={false}
                                            src={`${env.PUBLIC_URL}/assets/images/drug/${r.img}`}
                                            style={{ borderRadius: 12 }}
                                            onClick={() => {
                                                if (r.img === "due.jpg") setVsbDueRequest(true)
                                            }}
                                        />
                                    }
                                </Col>
                                <Col span={22}>
                                    <LabelText text={r.expenseName} />
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <LabelText className='fw-lighter' text={drugLabel} />
                        </Col>
                    </Row>
                }
            },
            {
                title: "จำนวน",
                dataIndex: "quantity",
                width: 125,
                render: (v, r, i) => {
                    return <Form.Item className='m-0' name={[i, "quantity"]}>
                        <InputNumber
                            key={String(v)}
                            size={size}
                            addonAfter={r?.unitText || '-'}
                            disabled={!isReMed}
                        />
                    </Form.Item>
                }
            },
            {
                title: "รายละเอียดการเตือน",
                dataIndex: "",
                render: (v, r, i) => {
                    const drugInteractions = r?.drugInteractions || []
                    const drugAndLabs = r?.opdFormulaExpensesGeneric || []
                    return <Row {...rowProps}>
                        {
                            r?.drugGenericAllergy?.length
                                ? map(r.drugGenericAllergy, (o, i) => {
                                    return <Col span={24} key={String(i)}>
                                        <LabelText className="d-block" text={`-แพ้ยาระดับ : ${o?.alevel || "-"}`} />
                                        <LabelText className="d-block" text={`รายละเอียด : ${o?.otherSymptom || "-"}`} />
                                        <LabelText className="d-block" text={`อาการ : ${o?.symptom || "-"}`} />
                                    </Col>
                                })
                                : []
                        }
                        {
                            r?.drugCodeAllergy && <Col span={24}>
                                <LabelText className="d-block" text={`-แพ้ Code ยา ระดับ : ${r?.drugCodeAllergy.alevelName || "-"}`} />
                                <LabelText className="d-block" text={`รายละเอียด : ${r?.drugCodeAllergy?.otherSymptom || "-"}`} />
                                <LabelText className="d-block" text={`อาการ : ${r?.drugCodeAllergy?.symptomDesc || "-"}`} />
                            </Col>
                        }
                        {
                            r?.drugGroupAllergy?.length
                                ? map(r.drugGroupAllergy, (o, i) => {
                                    return <Col span={24} key={String(o)}>
                                        <LabelText className="d-block" text={`-แพ้กลุ่มยา : ${o?.drugGroupName || "-"}`} />
                                        <LabelText className="d-block" text={`-ระดับ : ${o?.alevel || "-"}`} />
                                        <LabelText className="d-block" text={`รายละเอียด : ${o?.otherSymptom || "-"}`} />
                                        <LabelText className="d-block" text={`อาการ : ${o?.symptom || "-"}`} />
                                    </Col>
                                })
                                : []
                        }
                        {
                            map(r?.drugComponentsAllergy, (o, i) => {
                                return <Col span={24} key={String(i)}>
                                    <LabelText className="d-block" text={`-แพ้ส่วนประกอบยา : ${o?.drugComponentName || "-"}`} />
                                    <LabelText className="d-block" text={`ระดับ : ${o?.alevelName || "-"}`} />
                                    <LabelText className="d-block" text={`รายละเอียด : ${o?.otherSymptom || "-"}`} />
                                    <LabelText className="d-block" text={`อาการ : ${o?.symptomName || "-"}`} />
                                </Col>
                            })
                        }
                        {
                            r?.allowedDrugAndDoctor && <Col span={24}>
                                <LabelText className="d-block" text="-สั่งยาไม่ตรงกับแพทย์" />
                            </Col>
                        }
                        {
                            r?.allowedDrugAndDocSpecialties && <Col span={24}>
                                <LabelText className="d-block" text="-สั่งยาไม่ตรงกับสาขาแพทย์" />
                            </Col>
                        }
                        {
                            drugInteractions?.length
                                ? <Col span={24}
                                    className='marking-row-yellow data-value'
                                >
                                    <Row {...rowProps}>
                                        {
                                            map(drugInteractions, o => {
                                                return <Col span={24} key={String(o.diId)}>
                                                    <LabelText className="d-block" text={`-${o?.oldDrug === "Y" ? "(ยาเดิม)" : ""} ยา${o?.generic1} + ยา:${o?.generic2}`} />
                                                    <LabelText className="d-block" text={`กลไก : ${o?.mechanism}`} />
                                                    <LabelText className="d-block" text={`Management : ${o?.management}`} />
                                                </Col>
                                            })
                                        }
                                    </Row>
                                </Col>
                                : []
                        }
                        {
                            map(drugAndLabs, (o, oIndex) => {
                                if (o?.drugAdnLab?.length) {
                                    return <Col span={24} key={String(oIndex)}>
                                        <LabelText className="d-block" text={`-ยากับ Lab Generic :${o?.genericName}`} />
                                        {
                                            map(o?.drugAdnLab, (x, xIndex) => {
                                                return <div key={String(xIndex)}>
                                                    {
                                                        x?.criticalType === "1" && <LabelText
                                                            className="d-block"
                                                            text={`ผู้ป่วยที่มีค่า INR มากกว่า ${x?.maxValue ? Number(x?.maxValue) : null || x?.minValue ? Number(x?.minValue) : "-"}`}
                                                        />
                                                    }
                                                    {
                                                        x?.criticalType === "2" && <LabelText
                                                            className="d-block"
                                                            text={`ผู้ป่วยที่มีค่า INR น้อยกว่า ${x?.minValue ? Number(x?.minValue) : "" || x?.maxValue ? Number(x?.maxValue) : "-"}`}
                                                        />
                                                    }
                                                    {
                                                        x?.criticalType === "3" && <LabelText
                                                            className="d-block"
                                                            text={`ผู้ป่วยที่มีค่า INR อยู่ระหว่าง ${x?.minValue ? Number(x?.minValue) : ""} - ${x?.maxValue ? Number(x?.maxValue) : ""}`}
                                                        />
                                                    }
                                                    {
                                                        !x?.criticalType && <LabelText
                                                            className="d-block"
                                                            text={`ผู้ป่วยที่มีค่า INR ไม่อยู่ระหว่าง ${x?.minValue ? Number(x?.minValue) : ""} - ${x?.maxValue ? Number(x?.maxValue) : ""}`}
                                                        />
                                                    }
                                                </div>
                                            })
                                        }
                                    </Col>
                                }
                            })
                        }
                    </Row>
                }
            },
        ]
        return <Form.List name={"expenses"}>
            {(list, { add, remove }) => {
                let formValues = form.getFieldsValue();
                // console.log('formValues :>> ', formValues);
                const expenses = formValues?.expenses || [];
                list = map(list, (val, i) => {
                    let crrRow = expenses[i];
                    return {
                        ...crrRow,
                        ...val,
                        key: String(i),
                    };
                });
                // console.log('listFinance :>> ', listFinance);
                return <Table
                    size={size}
                    rowClassName={record => record?.classes}
                    columns={columns}
                    dataSource={list}
                    pagination={false}
                    scroll={{ y: 400 }}
                />
            }}
        </Form.List>
    }
    const PartsDueRequestModal = () => {
        return vsbDueRequest && <DueRequest
            // dueReport={dueReport}
            expenses={filter(expenses, o => o.dueReport === "Y")}
            optionsUser={optionsDoctor}
            visible={vsbDueRequest}
            onClose={() => {
                setVsbDueRequest(false);
                // setDueReport(null)
            }}
            // reloadOrder={() => setReloadOrder(p => p + 1)}
            onSave={(dts) => {
                const expenses = form.getFieldValue("expenses")
                const newOrderFinances = expenses.map(o => {
                    const dueReport = dts[o.expenseId]
                    return {
                        ...o,
                        dueReport: dueReport
                            ? {
                                ...dueReport[0],
                                userCreated: doctorId,
                                dateCreated: dayjs(),
                                dueRemark: dueReport[0].dueType === "E"
                                    ? dueReport[0]?.empiricalRemark
                                    : dueReport[0].dueType === "S"
                                        ? dueReport[0]?.specificRemark
                                        : null,
                            }
                            : null
                    }
                });
                form.setFieldsValue({ expenses: newOrderFinances });
                setVsbDueRequest(false);
            }}
        />
    }
    return <Modal
        visible={visible}
        centered
        title={<Row {...rowProps} gutter={[16, 8]} align='middle'>
            <Col>
                <LabelTopicPrimary18 text='สรุปรายการยา' />
            </Col>
            <Col>
                <FileTextFilled style={{ color: "#D50000" }} />
                แพ้ยา
            </Col>
            <Col>
                <FileTextFilled style={{ color: "#FDD835" }} />
                Drug interaction
            </Col>
            <Col>
                <FileTextFilled style={{ color: "#FB8C00" }} />
                ยากับ Lab
            </Col>
        </Row>}
        width={1245}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ปิด"
    >
        <Spin spinning={loading}>
            <div style={{ margin: -20 }}>
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Row {...rowProps}>
                        <Col span={17}>
                            {PartsTable()}
                        </Col>
                        <Col span={7}>
                            <Row {...rowProps}>
                                <Col span={24}>
                                    <Form.Item
                                        className='m-0'
                                        name="adrReason"
                                        label="เหตุผลการสั่งยาที่แพ้"
                                        rules={[
                                            {
                                                required: formRequired.adrReason,
                                                message: "สั่งรายการแพ้ยาที่ Lock กรุณาระบุเหตุผล !"
                                            },
                                        ]}
                                    >
                                        <Input.TextArea rows={3} disabled={!isDrugAllergy} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        className='m-0'
                                        name="diAdrReason"
                                        label="เหตุผลการสั่งยา Drug Interaction"
                                        rules={[
                                            {
                                                required: formRequired.drugInteractions,
                                                message: "สั่ง Drug interaction ที่ Lock กรุณาระบุเหตุผล !"
                                            },
                                        ]}
                                    >
                                        <Input.TextArea rows={3} disabled={!isDrugInteraction} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        className='m-0'
                                        name="userName"
                                        label="Username"
                                        rules={[
                                            {
                                                required: formRequired.adrReason || formRequired.diAdrReason || formRequired.drugInteractions,
                                                message: 'จำเป็น !'
                                            }
                                        ]}
                                    >
                                        <Input
                                            size='small'
                                            disabled={!formRequired.adrReason && !formRequired.diAdrReason && !formRequired.drugInteractions}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        className='m-0'
                                        name="password"
                                        label="Password"
                                        rules={[
                                            {
                                                required: formRequired.adrReason || formRequired.diAdrReason || formRequired.drugInteractions,
                                                message: 'จำเป็น !'
                                            }
                                        ]}
                                    >
                                        <Input.Password
                                            size='small'
                                            disabled={!formRequired.adrReason && !formRequired.diAdrReason && !formRequired.drugInteractions}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider className='m-2' />
                            {
                                formRequired.consult && <div>
                                    <Form.Item
                                        className='m-0'
                                        name="consultStaffStatus"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'กรุณาเลือก Consult Staff'
                                            }
                                        ]}
                                    >
                                        <Radio.Group style={{ width: "100%" }} >
                                            <Row {...rowProps}>
                                                <Col span={12}>
                                                    <Radio value="Y">มีแพทย์ Consult Staff</Radio>
                                                </Col>
                                                <Col span={12}>
                                                    <Radio value="N">ไม่มีแพทย์ Consult Staff</Radio>
                                                </Col>
                                            </Row>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Row {...rowProps}>
                                        <Col span={24}>
                                            <Form.Item
                                                className='m-0'
                                                name="consultStaffId"
                                                label="ชื่อแพทย์ Consult Staff"
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
                                                    options={optionsDoctor}
                                                    className='data-value'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            }
                        </Col>
                    </Row>
                </Form>
                {PartsDueRequestModal()}
            </div>
        </Spin>
    </Modal>
}
const apis = {
    ChkUser: {
        url: "OpdExamination/CheckAuthenticate",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}
