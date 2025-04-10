import React, { useEffect, useState } from 'react'
import {
    Row, Col, Button, Modal, Form, Avatar, Image, Divider, Table, Select, Input, TimePicker,
    ConfigProvider
} from 'antd';
import { find, map } from 'lodash'
import { callApis } from 'components/helper/function/CallApi';
import DayjsDatePicker from "../../components/DatePicker/DayjsDatePicker";
// import dayjs from "dayjs";
import thTH from "antd/lib/locale/th_TH";
import { Scrollbars } from 'react-custom-scrollbars';
// GenLabel
import {
    labelTopicPrimary18,
    labelTopicPrimary,
    labelTopic18,
    labelTopic,
    labelText
} from "../../components/helper/function/GenLabel"
// GenFormItem
import GenFormItem from 'components/helper/function/GenFormItem';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const apis = {
    GetAllDonorUnit: {
        url: "Masters/GetAllDonorUnit",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}

const { Option } = Select

export default function TransfusionReaction({
    visible,
    close = () => { },
    onSave = () => { },
    patient = {},
    prev = null,
    optionsRight = [],
    optionsWork = [],
    optionsDoctor = [],
    // doctor = null,
    opdIpd = "O",
    disabledForm = false,
}) {
    const {
        selectPatient
    } = useSelector(({
        patient
    }) => patient);
    const { opdPatientDetail } = useSelector(({ opdPatientDetail }) => opdPatientDetail)
    // console.log('prev', prev)
    // console.log('selectPatient :>> ', selectPatient, opdPatientDetail);

    // console.log('options TransfusionReaction:>> ', optionsRight, optionsWork, optionsDoctor);
    // console.log('patient :>> ', patient);
    // Form
    const [form] = Form.useForm()
    // State
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [, setSelectedRows] = useState([]);
    const [donorUnits, setDonorUnits] = useState([])

    // Functions
    const onFinish = (v) => {
        const chkBoxValue = (v) => {
            if (v) return "Y"
            if (!v) return null
        }
        let temp = {
            ...v,
            fever: chkBoxValue(v?.fever),
            lowerbackpain: chkBoxValue(v?.lowerbackpain),
            cyanosis: chkBoxValue(v?.cyanosis),
            chills: chkBoxValue(v?.chills),
            chestpain: chkBoxValue(v?.chestpain),
            darkUrine: chkBoxValue(v?.darkUrine),
            nauseaVomiTING: chkBoxValue(v?.nauseaVomiTING),
            anxiety: chkBoxValue(v?.anxiety),
            dyspnoez: chkBoxValue(v?.dyspnoez),
            urticariaItching: chkBoxValue(v?.urticariaItching),
            headche: chkBoxValue(v?.headche),
            bleeding: chkBoxValue(v?.bleeding),
            other: chkBoxValue(v?.other),
        }
        onSave(temp)
    }
    const defaultForm = (dataSource) => {
        if (!dataSource) return form.resetFields()
        form.setFieldsValue(dataSource)
    }
    const chkOpdRights = (dataSource) => {
        if (!dataSource?.length) return form.setFieldsValue({ opdRightId: null })
        let findX = find(dataSource, ["mainFlag", "Y"])
        if (!findX) findX = dataSource[0]
        form.setFieldsValue({ opdRightId: find?.opdRightId })
    }
    const chkOpdClinics = (dataSource) => {
        if (!dataSource?.length) return form.setFieldsValue({ clinicId: null, doctor: null })
        let findX = dataSource[0]
        form.setFieldsValue({ clinicId: findX?.clinicId, doctor: findX?.doctor })
    }
    // Effect
    useEffect(() => {
        const fetchDonorUnit = async () => {
            const result = await callApis(apis["GetAllDonorUnit"])
            setDonorUnits(result || [])
        }
        fetchDonorUnit()
    }, [])
    useEffect(() => {
        defaultForm(prev)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prev])

    useEffect(() => {
        if (opdIpd === "O") {
            chkOpdRights(optionsRight)
        }
        // eslint-disable-next-line no-empty
        if (opdIpd === "I") {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsRight])
    useEffect(() => {
        if (opdIpd === "O") {
            chkOpdClinics(optionsWork)
        }
        // eslint-disable-next-line no-empty
        if (opdIpd === "I") {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsWork])

    const PartsHeader = () => {
        const formItems = [
            // opdRightId
            {
                name: "opdRightId",
                label: "สิทธิ์",
                inputType: "select",
                options: optionsRight,
                disabled: true,
            },
            // clinicId
            {
                name: "clinicId",
                label: "ห้องตรวจ",
                inputType: "select",
                options: optionsWork,
                disabled: true,
            },
            // doctor
            {
                name: "doctor",
                label: "แพทย์",
                inputType: "select",
                options: optionsDoctor,
                disabled: true,
            },
        ]
        return (
            <Row gutter={[4, 4]}>
                <Col span={12}>
                    {labelTopic("Blood Transfusion Reaction Request", 'd-block')}
                    {labelText("To be used for investigation of suspected reaction to blood products", 'd-block')}
                    {labelText("(PRC , platelets concentrate, FFP , cryoprecipitate )", 'd-block')}
                    {labelText("กรุณากรอกแบบฟอร์ม Blood transfution reaction report นำส่งธนาคารเลือดพร้อมตัวอย่างเลือดผู้ป่วย (EDTA Blood 6 ml) และถุงโลหิตที่ทำให้ผู้ป่วยเกิดอาการไม่พึงประสงค์")}
                    {labelText("หากมีข้อสงสัย กรุณาประสานเจ้าหน้าที่ธนาคารเลือด โทร. 1274, 1469")}
                </Col>
                <Col span={12}>
                    <Row gutter={[4, 4]}>
                        <Col span={3} className='text-center'>
                            {patient?.picture
                                ? <Avatar
                                    size={60}
                                    src={<Image src={`data:image/jpeg;base64,${patient.picture}`} />}
                                />
                                : <Avatar size={60}>Patient</Avatar>
                            }
                        </Col>
                        <Col span={21}>
                            {labelTopicPrimary18("AN", "me-1")}
                            {labelTopic18(opdPatientDetail?.an || "-", "me-3")}
                            {labelTopicPrimary18("HN", "me-1")}
                            {labelTopic18(patient?.hn || "-", "me-3")}
                            <br />
                            {labelTopicPrimary18("ชื่อ", "me-1")}
                            {labelTopic18(`${opdPatientDetail?.displayName?.split(" ").slice(1).join(" ") || "-"} ${opdPatientDetail?.idCard || "-"}`, "me-2")}
                            {opdPatientDetail?.gender === "M" && <ManOutlined style={{ color: "blue" }} />}
                            {opdPatientDetail?.gender === "F" && <WomanOutlined style={{ color: "pink" }} />}
                            {labelTopicPrimary18("อายุ", "ms-2 me-1")}
                            {labelTopic18(opdPatientDetail?.ageYear || "-", "me-3")}
                            <br />
                            {/* {labelTopicPrimary("สิทธิ์", "me-1")}
                            {labelText(patient?.opdRightName || "-")} */}
                            {labelTopicPrimary18("ห้องตรวจ", "me-1")}
                            {labelTopic18(patient?.workName || "-")}
                            {labelTopicPrimary18("แพทย์", "ms-2  me-1")}
                            {labelTopic18(patient?.doctorName || "-")}
                            <Form
                                form={form}
                                onFinish={onFinish}
                                layout='vertical'
                                disabled={disabledForm}
                            >
                                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                                    <Col span={8}>
                                        <GenFormItem items={formItems} itemName={"opdRightId"} />
                                    </Col>
                                    {/* <Col span={8}>
                                        <GenFormItem items={formItems} itemName={"clinicId"} />
                                    </Col>
                                    <Col span={8}>
                                        <GenFormItem items={formItems} itemName={"doctor"} />
                                    </Col> */}
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
    const PartsForm = () => {
        const items = [
            // clinicalDiag
            {
                name: "clinicalDiag",
                label: "Clinical Diagnosis",
                inputType: "input",
            },
            // transfusionDate
            {
                name: "transfusionDate",
                label: "วันที่ให้",
                inputType: "datepicker",
            },
            // transfusionTime
            {
                name: "transfusionTime",
                label: "เวลาเริ่มให้",
                inputType: "timepicker",
            },
            // bloodProduct
            {
                name: "bloodProduct",
                label: "เลือกชนิด Blood Product",
                inputType: "input",
            },
            // bloodNo
            {
                name: "bloodNo",
                label: "Blood Component Number",
                inputType: "input",
            },
            // volume
            {
                name: "volume",
                label: "Volume Transfusion",
                inputType: "inputNumber",
                addonAfter: "ml."
            },
            // hnCorrect
            {
                name: "hnCorrect",
                label: "1.Patient's name HN correct",
                inputType: "radioGroup",
                options: [
                    {
                        value: "Y",
                        label: "YES",
                    },
                    {
                        value: "N",
                        label: "NO",
                    },
                ]
            },
            // bcCorrect
            {
                name: "bcCorrect",
                label: "2.Blood component correct",
                inputType: "radioGroup",
                options: [
                    {
                        value: "Y",
                        label: "YES",
                    },
                    {
                        value: "N",
                        label: "NO",
                    },
                ]
            },
            // btrCorrect
            {
                name: "btrCorrect",
                label: "3.Blood transfusion record correct",
                inputType: "radioGroup",
                options: [
                    {
                        value: "Y",
                        label: "YES",
                    },
                    {
                        value: "N",
                        label: "NO",
                    },
                ]
            },
            // temperature
            {
                name: "temperature",
                label: "4.Temperature in 24 hrs. prior to transfusion",
                inputType: "radioGroup",
                options: [
                    {
                        value: "Y",
                        label: "มีไข้",
                    },
                    {
                        value: "N",
                        label: "ไม่มีไข้ (<38  ํC)",
                    },
                    {
                        value: "O",
                        label: "อื่นๆ",
                    },
                ]
            },
            // temperatureOther
            {
                name: "temperatureOther",
                label: "ระบุอื่นๆ",
                inputType: "textArea",
            },
            // preTemperature
            {
                name: "preTemperature",
                label: false,
                inputType: "inputNumber",
            },
            // postTemperature
            {
                name: "postTemperature",
                label: false,
                inputType: "inputNumber",
            },
            // preBp
            {
                name: "preBp",
                label: false,
                inputType: "inputNumber",
            },
            // postBp
            {
                name: "postBp",
                label: false,
                inputType: "inputNumber",
            },
            // prePulse
            {
                name: "prePulse",
                label: false,
                inputType: "inputNumber",
            },
            // postPulSE
            {
                name: "postPulSE",
                label: false,
                inputType: "inputNumber",
            },
            // Fever
            {
                name: "fever",
                label: false,
                checkBoxLabel: "Fever",
                inputType: "checkbox",
            },
            // lowerbackpain
            {
                name: "lowerbackpain",
                label: false,
                checkBoxLabel: "Lower Back Pain",
                inputType: "checkbox",
            },
            // Cyanosis
            {
                name: "cyanosis",
                label: false,
                checkBoxLabel: "Cyanosis",
                inputType: "checkbox",
            },
            // Chills
            {
                name: "chills",
                label: false,
                checkBoxLabel: "Chills",
                inputType: "checkbox",
            },
            // chestpain
            {
                name: "chestpain",
                label: false,
                checkBoxLabel: "Chest Pain",
                inputType: "checkbox",
            },
            // darkUrine
            {
                name: "darkUrine",
                label: false,
                checkBoxLabel: "Dark Urine",
                inputType: "checkbox",
            },
            // nauseaVomiTING
            {
                name: "nauseaVomiTING",
                label: false,
                checkBoxLabel: "NauseaVomiting",
                inputType: "checkbox",
            },
            // anxiety
            {
                name: "anxiety",
                label: false,
                checkBoxLabel: "Anxiety",
                inputType: "checkbox",
            },
            // dyspnoez
            {
                name: "dyspnoez",
                label: false,
                checkBoxLabel: "Dyspnoez",
                inputType: "checkbox",
            },
            // urticariaItching
            {
                name: "urticariaItching",
                label: false,
                checkBoxLabel: "Urticaria/itching",
                inputType: "checkbox",
            },
            // headche
            {
                name: "headche",
                label: false,
                checkBoxLabel: "Headche",
                inputType: "checkbox",
            },
            // bleeding
            {
                name: "bleeding",
                label: false,
                checkBoxLabel: "Bleeding from wound",
                inputType: "checkbox",
            },
            // Other
            {
                name: "other",
                label: false,
                checkBoxLabel: "Other (Specify below)",
                inputType: "checkbox",
            },
            // OtherDetail
            {
                name: "otherDetatl",
                label: false,
                // checkBoxLabel: "Other (Specify below)",
                placeHolder: "Other Details",
                inputType: "textArea",
            },
        ]
        return (
            <Form
                form={form}
                onFinish={onFinish}
                layout='vertical'
                disabled={disabledForm}
            >
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <GenFormItem span={16} items={items} itemName={"clinicalDiag"} />
                    <GenFormItem span={4} items={items} itemName={"transfusionDate"} />
                    <GenFormItem span={4} items={items} itemName={"transfusionTime"} />
                </Row>
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <GenFormItem span={15} items={items} itemName={"bloodProduct"} />
                    <GenFormItem span={5} items={items} itemName={"bloodNo"} />
                    <GenFormItem span={4} items={items} itemName={"volume"} />
                </Row>
                <Divider />
                {labelTopic18("ผลการตรวจสอบความถูกต้องเอกสาร", "d-block")}
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <GenFormItem span={8} items={items} itemName={"hnCorrect"} />
                    <GenFormItem span={8} items={items} itemName={"bcCorrect"} />
                    <GenFormItem span={8} items={items} itemName={"btrCorrect"} />
                </Row>
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <GenFormItem span={8} items={items} itemName={"temperature"} />
                    <GenFormItem span={16} items={items} itemName={"temperatureOther"} />
                </Row>
                <Divider />
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <Col span={10}>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row", marginBottom: 8 }}>
                            <Col span={8}>{labelTopic("Vital signs")}</Col>
                            <Col span={8}>{labelTopic("Pre-Transfusion")}</Col>
                            <Col span={8}>{labelTopic("Post-Transfusion")}</Col>
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <Col span={8} className='text-end'>{labelTopic("Temperature :")}</Col>
                            <GenFormItem span={8} items={items} itemName={"preTemperature"} />
                            <GenFormItem span={8} items={items} itemName={"postTemperature"} />
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <Col span={8} className='text-end'>{labelTopic("B.P. :")}</Col>
                            <GenFormItem span={8} items={items} itemName={"preBp"} />
                            <GenFormItem span={8} items={items} itemName={"postBp"} />
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <Col span={8} className='text-end'>{labelTopic("Pulse :")}</Col>
                            <GenFormItem span={8} items={items} itemName={"prePulse"} />
                            <GenFormItem span={8} items={items} itemName={"postPulSE"} />
                        </Row>
                    </Col>
                    <Col span={14}>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row", marginBottom: 8 }}>
                            <Col span={24}>{labelTopic("อาการและอาการแสดงของผู้ป่วย - Please Tick")}</Col>
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <GenFormItem span={6} items={items} itemName={"fever"} />
                            <GenFormItem span={6} items={items} itemName={"lowerbackpain"} />
                            <GenFormItem span={6} items={items} itemName={"cyanosis"} />
                            <GenFormItem span={6} items={items} itemName={"chills"} />
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <GenFormItem span={6} items={items} itemName={"chestpain"} />
                            <GenFormItem span={6} items={items} itemName={"darkUrine"} />
                            <GenFormItem span={6} items={items} itemName={"nauseaVomiTING"} />
                            <GenFormItem span={6} items={items} itemName={"anxiety"} />
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <GenFormItem span={6} items={items} itemName={"dyspnoez"} />
                            <GenFormItem span={6} items={items} itemName={"urticariaItching"} />
                            <GenFormItem span={6} items={items} itemName={"headche"} />
                            <GenFormItem span={6} items={items} itemName={"bleeding"} />
                        </Row>
                        <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                            <GenFormItem span={8} items={items} itemName={"other"} />
                            <GenFormItem span={16} items={items} itemName={"otherDetatl"} />
                        </Row>
                    </Col>
                </Row>
            </Form>
        )
    }
    const PartsTable = () => {
        const columns = [
            {
                title: labelTopicPrimary("Donor Unit Number"),
                name: 'donorUnit',
                // width: 150,
                // fixed: "left",
                render: (v, r, i) => {
                    return (
                        <div style={{ marginLeft: -10, marginRight: -10 }}>
                            <Form.Item
                                name={[i, "donorUnit"]}
                                style={{ margin: 0 }}
                                rules={[
                                    {
                                        required: true,
                                        message: "จำเป็น"
                                    }
                                ]}
                            >
                                <Select
                                    style={{ width: "100%" }}
                                    className='data-value'
                                    dropdownMatchSelectWidth={200}
                                    showSearch
                                    optionFilterProp='children'
                                >
                                    {donorUnits?.map((val) => <Option value={val.donorUnitId} key={val.donorUnitId} className="data-value">{val.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </div>
                    )
                }
            },
            {
                title: labelTopicPrimary("Product Type(eg FFP)"),
                name: 'productType',
                width: 200,
                // fixed: "left",
                render: (v, r, i) => {
                    return (
                        <div style={{ marginLeft: -10, marginRight: -10 }}>
                            <Form.Item
                                name={[i, "productType"]}
                                style={{ margin: 0 }}
                            >
                                <Input
                                    // style={{ width: "100%" }}
                                    className='data-value'
                                />
                            </Form.Item>
                        </div>
                    )
                }
            },
            {
                title: labelTopicPrimary("Date"),
                name: 'dateDonorUnit',
                width: 125,
                // fixed: "left",
                render: (v, r, i) => {
                    return (
                        <div style={{ marginLeft: -10, marginRight: -10 }}>
                            <Form.Item
                                name={[i, "dateDonorUnit"]}
                                style={{ margin: 0 }}
                            >
                                <DayjsDatePicker
                                    isFormList={true}
                                    listName="bloodComponent"
                                    listIndex={i}
                                    form={form}
                                    name="dateDonorUnit"
                                />
                            </Form.Item>
                        </div>
                    )
                }
            },
            {
                title: labelTopicPrimary("Time Unit"),
                children: [
                    {
                        title: labelTopicPrimary("Started"),
                        dataIndex: 'timeUnitStart',
                        width: 100,
                        render: (v, r, i) => {
                            return (
                                <div style={{ marginLeft: -10, marginRight: -10 }}>
                                    <Form.Item
                                        name={[i, "timeUnitStart"]}
                                        style={{ margin: 0 }}
                                    >
                                        <TimePicker
                                            style={{ width: "100%" }}
                                            format={"HH:mm"}
                                        />
                                    </Form.Item>
                                </div>
                            )
                        }
                    },
                    {
                        title: labelTopicPrimary("Stoped"),
                        dataIndex: 'timeUnitStop',
                        width: 100,
                        render: (v, r, i) => {
                            return (
                                <div style={{ marginLeft: -10, marginRight: -10 }}>
                                    <Form.Item
                                        name={[i, "timeUnitStop"]}
                                        style={{ margin: 0 }}
                                    >
                                        <TimePicker
                                            style={{ width: "100%" }}
                                            format={"HH:mm"}
                                        />
                                    </Form.Item>
                                </div>
                            )
                        }
                    },
                ]
            },
        ]
        const onSelectChange = (newSelectedRowKeys, selectedRows) => {
            // console.log('selectedRowKeys changed: ', newSelectedRowKeys);
            // console.log('selectedRows :>> ', selectedRows);
            setSelectedRowKeys(newSelectedRowKeys);
            setSelectedRows(selectedRows);
        };
        const rowSelection = {
            selectedRowKeys,
            onChange: onSelectChange,
        }
        return (
            <Form
                form={form}
                onFinish={onFinish}
                layout='vertical'
            >
                <Form.List name={"bloodComponent"}>
                    {(listFinance, { add }) => {
                        let formValues = form.getFieldsValue()
                        // console.log('formValues :>> ', formValues);
                        let finances = formValues?.listFinance || []
                        listFinance = map(listFinance, (val, i) => {
                            let crrRow = finances[i]
                            return {
                                ...crrRow,
                                ...val,
                                key: String(i)
                            };
                        })
                        // console.log('listFinance :>> ', listFinance);
                        return (
                            <>
                                <Row gutter={[8, 8]} style={{ flexDirection: "row" }} className='mb-2' align='middle'>
                                    {/* <Col>
                                        <Button
                                            type='danger'
                                            style={{ margin: 0 }}
                                            onClick={() => {
                                                // delSelectedRows(selectedRows, listFinance)
                                            }}
                                        // disabled={!selectedRows?.length}
                                        >ลบที่เลือก</Button>
                                    </Col> */}
                                    <Col>
                                        {labelTopic("กรุณาบอกชนิด Blood component ที่ให้ภายใน 12 ชั่วโมงก่อน")}
                                    </Col>
                                    <Col>
                                        <Button
                                            type='primary'
                                            style={{ margin: 0 }}
                                            onClick={() => {
                                                add()
                                            }}
                                        >เพิ่มรายการ</Button>
                                    </Col>
                                </Row>
                                <Table
                                    rowClassName="data-value"
                                    scroll={{ y: 300 }}
                                    rowSelection={rowSelection}
                                    dataSource={listFinance}
                                    columns={columns}
                                    pagination={false}
                                />
                            </>
                        );
                    }}
                </Form.List>
            </Form>
        )
    }
    return (
        <Modal
            centered
            width={1100}
            closable={false}
            closeIcon={false}
            visible={visible}
            onCancel={() => close()}
            onOk={() => form.submit()}
            cancelText={"ออก"}
            okText={"บันทึก"}
            okButtonProps={{
                disabled: disabledForm
            }}
        >
            <ConfigProvider locale={thTH}>
                <div style={{ margin: -18 }}>
                    <Scrollbars
                        autoHeight
                        autoHeightMax={600}
                    >
                        <div className='ps-2 pe-2'>
                            {PartsHeader()}
                            <Divider />
                            {PartsForm()}
                            <Divider />
                            {PartsTable()}
                        </div>
                    </Scrollbars>
                </div>
            </ConfigProvider>
        </Modal>
    )
}
