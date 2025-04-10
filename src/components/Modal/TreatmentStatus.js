import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Modal, Form, Row, Col, Select, Table, Input } from 'antd'
import { mappingOptions } from "components/helper/function/MappingOptions";
import { callApis } from "../helper/function/CallApi";
import { notiError, notiSuccess, } from "components/Notification/notificationX";
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
const rules = [
    {
        required: true,
        message: 'จำเป็น !',
    }
]
export default function TreatmentStatus({
    size = "small",
    visible,
    onCancel = () => { },
    clinicDetails = null,
}) {
    // Form
    const [form] = Form.useForm();
    // Watch
    const status = Form.useWatch("status", form)
    const departId = Form.useWatch("departId", form)
    const workId = Form.useWatch("workId", form)
    // State
    const [loading, setLoading] = useState(false)
    const [prevType, setPrevType] = useState(null)
    const [MedicalStatusMas, setMedicalStatusMas] = useState([]);
    const [options, setOptions] = useState({
        status: [],
        workId: [],
        departId: [],
    })
    // console.log('options', options)
    const [his, setHis] = useState([])
    // Functions
    const getDD = async () => {
        let [
            status,
            departId,
        ] = await Promise.all([
            callApis(apis["GetTbmTreantment"]),
            callApis(apis["GetListDepartment"]),
        ])
        status = mappingOptions({ dts: status, valueField: "code", labelField: "name" })
        departId = mappingOptions({ dts: departId, valueField: "departId", labelField: "name" })

        setOptions(p => {
            return {
                ...p,
                status: status,
                departId: departId,
            }
        })
    }
    const getWorkPlacesByPlaceType = async (placeType) => {
        if (!placeType) return setOptions(p => {
            return {
                ...p,
                workId: [],
            }
        })
        setPrevType(placeType)
        let workId = await callApis(apis["GetWorkPlaces"], [{ placeType: placeType }])
        workId = mappingOptions({ dts: workId })
        setOptions(p => {
            return {
                ...p,
                workId: workId,
            }
        })
    }
    const getHis = async () => {
        if (!clinicDetails?.clinicId) return
        setLoading(p => !p)
        const res = await callApis(apis["GetTreatmentHis"], clinicDetails?.clinicId)
        setLoading(p => !p)
        setHis(res)
    }

    const getMedStatusMS = async () => {
        const res = await callApis(apis["GetmedStatusMS"], { table: "TB_TREATMENT_STATUS", field: "TreatmentStatus" })
        // console.log(res);
        setMedicalStatusMas(res)

    }
    const upsert = async (v) => {
        const crrDate = dayjs().format("YYYY-MM-DD HH:mm:ss")
        const req = [{
            "treatmentStatusId": v?.treatmentStatusId || null,
            "treatmentStatus": v?.treatmentStatus,
            "status": v?.status,
            "clinicId": clinicDetails?.clinicId,
            "serviceId": clinicDetails?.serviceId,
            "patientId": clinicDetails?.patientId,
            "admitId": clinicDetails?.admitId,
            "runHn": clinicDetails?.runHn,
            "yearHn": clinicDetails?.yearHn,
            "hn": clinicDetails?.hn,
            "departId": v?.departId,
            "workId": v?.workId,
            "userCreated": user,
            "dateCreated": crrDate,
            "userModified": user,
            "dateModified": crrDate
        }]
        setLoading(p => !p)
        const res = await callApis(apis["UpSertTreatmentStatus"], req)
        setLoading(p => !p)
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึก" })
            form.resetFields()
            getHis()
            onCancel()
        } else notiError({ message: "บันทึก" })
    }

    const onFinish = (v) => {
        console.log('v :>> ', v);
        upsert(v)
    }

    useEffect(() => {
        getDD()
        getMedStatusMS()
    }, [])
    useEffect(() => {
        getHis()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clinicDetails?.clinicId])
    const PartsForm = () => {
        return <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
        >
            <Form.Item hidden name={"treatmentStatusId"}>
                <Input />
            </Form.Item>
            <Form.Item className="mb-2" name={"treatmentStatus"} label="สถานะการรักษา" >
                <Select
                    size={size}
                    style={{ width: "100%" }}
                    rules={rules}
                    showSearch
                    allowClear={true}
                    optionFilterProp="children"
                    className="data-value"
                    options={MedicalStatusMas?.map(item => ({
                        value: item?.dataother1,
                        label: item?.datadisplay
                    }))}
                />

            </Form.Item>
            <Form.Item
                className="mb-2"
                name={"status"}
                label="สถานที่ส่งต่อ"
            // rules={rules}
            >
                <Select
                    size={size}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="label"
                    dropdownMatchSelectWidth={345}
                    options={options.status}
                    onChange={(v, o) => {
                        getWorkPlacesByPlaceType(o?.placetype)
                        if (prevType !== o.placetype) form.setFieldsValue({ workId: null })
                    }}
                />
            </Form.Item>
            {/* <Form.Item className="mb-2" name={"status"} label="สถานะการรักษา" rules={rules}>
                <Select
                    size={size}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="label"
                    dropdownMatchSelectWidth={345}
                    options={options.status}
                    onChange={(v, o) => {
                        getWorkPlacesByPlaceType(o?.placetype)
                        if (prevType !== o.placetype) form.setFieldsValue({ workId: null })
                    }}
                />
            </Form.Item> */}
            <Form.Item className="mb-2" name={"departId"} label="แผนก">
                <Select
                    size={size}
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    dropdownMatchSelectWidth={345}
                    options={options.departId}
                    disabled={!status}
                    onChange={(v) => {
                        const worksInDepartment = options.workId.filter(o => o.dataother1 === v)
                        const chkWorkId = worksInDepartment.find(o => o.value === workId)
                        if (!chkWorkId) return form.setFieldsValue({ workId: null })
                    }}
                />
            </Form.Item>
            <Form.Item className="mb-2" name={"workId"} label="ห้องส่งต่อ">
                <Select
                    size={size}
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    dropdownMatchSelectWidth={345}
                    options={departId ? options.workId.filter(o => o.dataother1 === departId) : options.workId}
                    disabled={!status}
                    onChange={(v, o) => {
                        form.setFieldsValue({ departId: o?.dataother1 || null })
                    }}
                />
            </Form.Item>
        </Form>
    }
    const PartsHis = () => {
        const columns = [
            {
                title: 'วันที่/เวลา',
                dataIndex: 'dateCreated',
                align: "center",
                width: 150,
                render: (v) => dayjs(v, 'MM/DD/YYYY HH:mm:ss').format("DD/MM/BBBB HH:mm")
            },
            {
                title: 'สถานะการรักษา',
                dataIndex: 'statusName',
            },
            {
                title: 'แผนก',
                dataIndex: 'departName',
            },
            {
                title: 'สถานที่ส่งต่อ',
                dataIndex: 'workName',
            },
        ]
        return <Table
            size={size}
            scroll={{ y: 400 }}
            title={() => <label className="fs-6 fw-bold gx-text-primary">ประวัติการส่ง</label>}
            dataSource={his}
            columns={columns}
            rowKey={"treatmentStatusId"}
            rowClassName={"data-value"}
            pagination={false}
        />
    }
    return (
        <Modal
            title={<label className="fs-5 fw-bold gx-text-primary">บันทึกสถานะการรักษา</label>}
            closable={false}
            closeIcon={false}
            visible={visible}
            centered
            width={1000}
            okText="บันทึก"
            cancelText="ปิด"
            onCancel={() => {
                onCancel()
            }}
            onOk={() => form.submit()}
            okButtonProps={{
                loading: loading,
            }}
            cancelButtonProps={{
                loading: loading,
            }}
        >
            <div style={{ margin: -12 }}>
                <Row gutter={[8, 8]}>
                    <Col span={6}>
                        {PartsForm()}
                    </Col>
                    <Col span={18}>
                        {PartsHis()}
                    </Col>
                </Row>
            </div>
        </Modal>
    )
}

const apis = {
    GetTbmTreantment: {
        url: "OpdClinics/GetTbmTreantmentDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetListDepartment: {
        url: "AdminItHospital/ItHospital/GetListDepartment",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetWorkPlaces: {
        url: "OutConsult/GetWorkPlaceList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    UpSertTreatmentStatus: {
        url: "OpdClinics/UpSertTreatmentStatus",
        method: "PUT",
        return: "data",
        sendRequest: true,
    },
    GetTreatmentHis: {
        url: "OpdClinics/GetTreatmentstatuslist/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetmedStatusMS: {
        url: "Masters/GetDropDownMas",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },

    ////
    // GetMasterDropdown: {
    //     url: "OpdRightVisit/GetDataMasterforDropdown?",
    //     method: "GET",
    //     return: "responseData",
    //     sendRequest: false,
    // },
}