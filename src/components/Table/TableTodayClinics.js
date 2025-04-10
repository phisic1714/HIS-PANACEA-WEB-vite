import React, { useState, useEffect } from 'react'
import { useDispatch } from "react-redux";
import { allSearchDetail } from "appRedux/actions";
import { Checkbox, Col, Form, Input, Row, Select, Spin, Table } from 'antd'
import dayjs from 'dayjs'
import { filter, toNumber } from "lodash"
import { callApis } from 'components/helper/function/CallApi';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
// const userType = userFromSession.responseData.userType;
export default function TableTodayClinics({
    size = "small",
    workId = null,
    mainPageLoading = false,
}) {
    // console.log('workId', workId)
    const dispatch = useDispatch();
    // Form
    const [form] = Form.useForm()
    // Watch
    const viewTypes = Form.useWatch("viewTypes", form)
    // State
    const [loading, setLoading] = useState(false)
    const [loadingTodayClinics, setLoadingTodayClinics] = useState(false)
    const [todayClinics, setTodayClinics] = useState([])
    const [todayClinicTotal, setTodayClinicTotal] = useState(0)
    const [todayClinicsFiltered, setTodayClinicsFiltered] = useState([])
    // Funcs
    const filterTodayClinics = (dts = []) => {
        const finishFlag = form.getFieldValue("finishFlag")
        if (!finishFlag) return setTodayClinicsFiltered(dts)
        setTodayClinicsFiltered(filter(dts, ["isFinished", "0"]))
    }
    const getPatientVisit = async (req) => {
        setLoadingTodayClinics(p => !p)
        const res = await callApis(listApi["GetPatientVisit"], req)
        setLoadingTodayClinics(p => !p)
        setTodayClinicTotal(toNumber(res?.countPatient || 0))
        setTodayClinics(res?.patientList || [])
        filterTodayClinics(res?.patientList || [])
    }
    const onFinish = (v) => {
        const req = {
            date: dayjs().format("YYYY-MM-DD"),
            doctor: v?.viewTypes === "doctor" ? user : null,
            page: String(v.currentPage),
            rows: "10",
            type: "allCount",
            workId: v?.viewTypes === "workId" ? workId !== "all" ? workId : null : null,
            // workId: null,
            "subspecialty": null,
            "placeType": null,
            "therapyType": null,
            "searchNameKey": v?.name || null,
            "searchHnKey": v?.hn || null,
        }
        getPatientVisit(req)
    }
    const handleClickTadayClinic = async (item) => {
        setLoading(true);
        const [
            patient,
            services,
        ] = await Promise.all([
            callApis(listApi["GetPatientsDetail"], item.patientId),
            callApis(listApi["GetListServicesIdByPatient"], item.patientId),
        ])
        setLoading(false);
        let tempRecord = { ...item };
        tempRecord.lastAn = patient?.latestAdmits?.an || null;
        tempRecord.lastServiceId = patient?.latestServices?.serviceId || null;
        tempRecord.opdipd = null;
        dispatch(
            allSearchDetail({
                patient: tempRecord,
                admitList: patient?.latestAdmits?.an ? [patient?.latestAdmits] : [],
                serviceList: services,
                patientDetail: patient,
            })
        );
    }
    useEffect(() => {
        form.submit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const columns = [
        {
            title: "HN",
            dataIndex: "hn",
            width: 95,
        },
        {
            title: "เพศ",
            dataIndex: "gender",
            align: "center",
            width: 60,
        },
        {
            title: "ชื่อ-นามสกุล",
            dataIndex: "fullName",
        },
        {
            title: "ห้องตรวจ",
            dataIndex: "workname",
            viewTypes: "workId",
        },
        {
            title: "แพทย์",
            dataIndex: "doctorName",
            viewTypes: "doctor",
        },
        {
            title: "เลขบัตร ปชช.",
            dataIndex: "idCard",
            width: 125,
            align: "center",
        },
    ]
    const title = <Form
        form={form}
        onFinish={onFinish}
        layout='vertical'
        initialValues={{
            viewTypes: "doctor",
            currentPage: 1,
        }}
    >
        <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
            <Col span={5}>
                <Form.Item
                    style={{ margin: 0 }}
                    name="viewTypes"
                >
                    <Select
                        size={size}
                        className='data-value'
                        style={{ width: "100%", margin: 0 }}
                        options={[
                            {
                                value: "doctor",
                                label: "มุมมองแพทย์",
                                className: "data-value",
                            },
                            {
                                value: "workId",
                                label: "มุมมองห้องตรวจ",
                                className: "data-value",
                            },
                        ]}
                        onChange={() => {
                            form.setFieldsValue({ currentPage: 1 })
                            form.submit()
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={5}>
                <Form.Item
                    style={{ margin: 0 }}
                    name="hn"
                >
                    <Input.Search
                        placeholder='HN'
                        size={size}
                        allowClear
                        style={{ width: "100%", margin: 0 }}
                        onSearch={() => {
                            form.setFieldsValue({ currentPage: 1 })
                            form.submit()
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item
                    style={{ margin: 0 }}
                    name="name"
                >
                    <Input.Search
                        size={size}
                        allowClear
                        style={{ width: "100%", margin: 0 }}
                        placeholder="ชื่อผู้ป่วย"
                        onSearch={() => {
                            form.setFieldsValue({ currentPage: 1 })
                            form.submit()
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item
                    style={{ margin: 0 }}
                    name="finishFlag"
                    valuePropName='checked'
                >
                    <Checkbox
                        onChange={() => filterTodayClinics(todayClinics)}
                    >เฉพาะที่ยังไม่ตรวจ</Checkbox>
                </Form.Item>
            </Col>
            <Form.Item
                hidden
                style={{ margin: 0 }}
                name="currentPage"
            >
                <Input />
            </Form.Item>
        </Row></Form>

    return <Spin spinning={loadingTodayClinics}>
        <Table
            scroll={{ y: 175 }}
            size={size}
            title={() => title}
            // columns={columns}
            columns={
                viewTypes === "workId"
                    ? filter(columns, o => o?.viewTypes !== "workId")
                    : filter(columns, o => o?.viewTypes !== "doctor")
            }
            dataSource={todayClinicsFiltered}
            rowClassName="pointer data-value"
            onRow={(record) => {
                return {
                    onClick: e => {
                        e.stopPropagation()
                        if (loading || mainPageLoading) return
                        handleClickTadayClinic(record)
                    }, // click row
                };
            }}
            pagination={{
                total: todayClinicTotal,
                pageSize: 10,
                showSizeChangers: false,
                onChange: (page) => {
                    form.setFieldsValue({
                        currentPage: page
                    })
                    form.submit()
                },
                size: size
            }}
        />
    </Spin>
}

const listApi = {
    GetPatientVisit: {
        url: "DoctorOutpatientCare/GetPatientListNoPic",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetPatientsDetail: {
        url: "Patients/GetPatientsDetail/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetListServicesIdByPatient: {
        name: "GetListServicesIdByPatient",
        url: "OpdServices/GetListServicesIdByPatient/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}