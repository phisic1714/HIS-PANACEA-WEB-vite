import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { opdPatientDetail } from "appRedux/actions";
import { useDispatch } from "react-redux";
// Antd
import { Avatar, Button, Col, Image, Form, Select, Statistic, Spin, Input } from 'antd';
// Components
import {
    LabelTopic,
    LabelText,
    // LabelTopicPrimary18,
    LabelTopicPrimary,
    LabelTextPrimary,
} from "components/helper/function/GenLabel";
import GenRow from "components/helper/function/GenRow";
import EMessage from "components/Modal/EMessageAntdDatePicker";
import Hx from "components/Modal/Hx";
import DrugAllergic from 'components/Modal/PharmaceuticalDetail';
import UpdateMobile from "components/Modal/UpdateMobile";
import VipStatus from 'components/VipStatus/VipStatus.js';
import AddressOnPatientCard from "components/Patient/AddressOnPatientCard";
// Funcs
import { callApiObject } from 'components/helper/function/CallApi';
import { mappingOptions } from "components/helper/function/MappingOptions";
import { find, filter, uniqBy } from "lodash"
// Icons
import { CommentOutlined, FileTextOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { BsThreeDots } from "react-icons/bs";
import EllipsisDrugAllergy from 'components/Drug/EllipsisDrugAllergy';
// import PregnantStatus from 'components/Pregnant/PregnantStatus';
import UpdateOpdRight from '../Modal/UpdateOpdRight';
import { getContactInfo } from 'util/GeneralFuctions';
import ComponentHx from 'components/Drug/ComponentHx';
import pregnantIcon from '@iconify/icons-cil/pregnant';
import { Icon } from '@iconify/react';

// import dayjs from 'dayjs';
// const { Paragraph } = Typography;
export default function Patient({
    // Patient
    patientId = null,
    serviceId = null,
    admitId = null,
    clinicId = null,
    workId = null,
    // Right
    opdRightId = null,
    // admitRightId = null,
    // Doctor
    // doctor = null,
    // Show
    showRight = true,
    showHxAndDrugAllergy = true,
    showAddress = true,
    showService = true,
    showClinic = true,
    showDoctor = true,
    // Allowed Select
    disabledSelectService = false,
    // disabledSelectAdmit = false,
    // disabledSelectRight = false,
    disabledSelectClinic = false,
    disabledSelectDoctor = false,
    // Selected
    selectedValues = () => { },
    reloadPatient = false,
    getUsers = true,
    users = [],
    // reloadOpdRight = 0,
}) {
    // console.log('clinicId', clinicId)
    const dispatch = useDispatch();
    const allSearchPatientDetail = useSelector(({ Search }) => Search);
    // console.log('allSearchPatientDetail :>> ', allSearchPatientDetail);
    // Form
    const [formPatient] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [formPatientSubmit, setFormPatientSubmit] = useState(false)
    const [options, setOptions] = useState({
        services: [],
        opdRights: [],
        admitRights: [],
        clinics: [],
        users: [],
    })
    const [patient, setPatient] = useState(null)
    const [queueservice, setQueueservice] = useState(null)
    const [opdRightDetails, setOpdRightDetails] = useState(null)
    // Vsb
    const [vsbEmessage, setVsbEmessage] = useState(false)
    const [vsbPhone, setVsbPhone] = useState(false);
    const [vsbOpdRight, setVsbOpdRight] = useState(false);
    const [vsbHx, setVsbHx] = useState(false);
    const [vsbDrugAllergy, setVsbDrugAllergy] = useState(false);
    // Funcs
    const getDropdown = async () => {
        if (!getUsers) return
        let [
            users,
        ] = await Promise.all([
            callApiObject(apis, "GetUserMas"),
        ])
        users = mappingOptions({ dts: users, })
        setOptions(p => {
            return {
                ...p,
                users: users,
            }
        })
    }
    const getDataByPatientId = async (patientId) => {
        if (!patientId) return setPatient(null)
        let services = mappingOptions({ dts: allSearchPatientDetail.serviceList, valueField: "serviceId", labelField: "serviceDate", compound: true })
        services = uniqBy(services, "serviceId")
        let tempServiceId = null
        if (services.length) {
            tempServiceId = services[0].serviceId
            setQueueservice(services[0].queueservice ? `${Number(services[0]?.queueservice).toFixed(0)}` : null)
        }
        setLoading(true)
        let [
            res,
            opdRights,
        ] = await Promise.all([
            callApiObject(apis, "GetPatientDetail", { patientId }),
            callApiObject(apis, "GetOpdRights", tempServiceId),
        ])
        // console.log('opdRights :>> ', opdRights);
        setLoading(false)
        // Clinics
        let clinics = res?.opdClinics || []
        // let tempClinicId = clinicId || clinics.length ? clinics[0].clinicId : null
        clinics = mappingOptions({ dts: clinics, valueField: "clinicId", labelField: "workName" })
        res.opdClinics = clinics
        clinics = filter(clinics, ["serviceId", tempServiceId])
        let tempClinicId = clinicId || find(clinics, ["workId", workId])?.clinicId || clinics[0].clinicId
        // Doctor
        const crrClinic = find(clinics, ["clinicId", tempClinicId])
        // OpdRights
        opdRights = mappingOptions({ dts: opdRights, valueField: "opdRightId", labelField: "opdRightName" })
        res.opdRights = opdRights
        let tempOpdRightId = opdRightId
        if (!opdRightId) {
            if (opdRights.length) {
                const findMain = find(opdRights, ["mainFlag", "Y"]) || opdRights[0]
                tempOpdRightId = findMain?.opdRightId
                setOpdRightDetails(findMain)
            }
        } else {
            const findRight = find(opdRights, ["opdRightId", opdRightId])
            setOpdRightDetails(findRight)
        }
        // Patient
        setPatient(res)
        formPatient.setFieldsValue({
            serviceId: tempServiceId,
            clinicId: tempClinicId,
            doctor: crrClinic?.doctor,
            doctorSpecialties: crrClinic?.doctorSpecialtiesName,
            opdRightId: tempOpdRightId,
        })
        setOptions(p => {
            return {
                ...p,
                services: services,
                clinics: clinics,
                opdRights: opdRights,
            }
        })
        dispatch(opdPatientDetail(find(services, ["serviceId", tempServiceId])))
        setFormPatientSubmit(p => !p)
    }
    const getDataByAdmitId = async (admitId) => {
        if (!admitId) return setPatient(null)
    }
    const getPatient = async (patientId, admitId) => {
        if (!admitId) getDataByPatientId(patientId);
        if (admitId) getDataByAdmitId(patientId, admitId);
    }
    // Form Finish
    const onPatientFinish = (v) => {
        // console.log('onFinish', v)
        const temp = {
            ...options,
            ...v,
            patientId: patientId,
        }
        selectedValues(temp)
    }
    // Handle
    const handleClickBtn = (name) => {
        switch (name) {
            case "vsbPhone": return setVsbPhone(true)
            case "vsbOpdRight": return setVsbOpdRight(true)
            case "vsbHx": return setVsbHx(true)
            case "vsbDrugAllergy": return setVsbDrugAllergy(true)
            default: break;
        }
    }
    const handleChangeClinicId = (clinicId) => {
        // Doctor
        const crrClinic = find(options.clinics, ["clinicId", clinicId])
        formPatient.setFieldsValue({
            doctor: crrClinic?.doctor,
            doctorSpecialties: crrClinic?.doctorSpecialtiesName,
        })
    }
    const handleChangeFormPatient = (name, value) => {
        // console.log('name', name)
        switch (name) {
            case "serviceId":
                handleChangeServiceId(value)
                break;
            case "clinicId":
                handleChangeClinicId(value)
                setFormPatientSubmit(p => !p)
                break;
            case "opdRightId":
                setFormPatientSubmit(p => !p)
                break;
            case "admitRightId":
                setFormPatientSubmit(p => !p)
                break;
            case "doctor":
                setFormPatientSubmit(p => !p)
                formPatient.setFieldsValue({ doctorSpecialties: null })
                break;
            default: break;
        }
    }
    const handleChangeServiceId = async (serviceId) => {
        let opdRights = await callApiObject(apis, "GetOpdRights", serviceId)
        opdRights = mappingOptions({ dts: opdRights, valueField: "opdRightId", labelField: "opdRightName" })
        const clinics = filter(patient?.opdClinics, ["serviceId", serviceId])
        const lastClinic = clinics.length ? find(clinics, ["workId", workId]) || clinics[0] : null
        const service = options.services.find((v => v.serviceId === serviceId))
        let opdRightId = null
        if (opdRights.length) {
            const findRight = find(opdRights, ["mainFlag", "Y"]) || opdRights[0]
            opdRightId = findRight?.opdRightId
            setOpdRightDetails(findRight)
        }
        formPatient.setFieldsValue({
            clinicId: lastClinic?.clinicId,
            doctor: lastClinic?.doctor,
            doctorSpecialties: lastClinic?.doctorSpecialtiesName,
            opdRightId: opdRightId,
        })
        setOptions(p => {
            return {
                ...p,
                clinics: clinics,
                opdRights: opdRights,
            }
        })
        setFormPatientSubmit(p => !p)
        setQueueservice(service.queueservice ? `${Number(service.queueservice).toFixed(0)}` : null)
    }
    // Effect
    useEffect(() => {
        getDropdown()
    }, [])
    useEffect(() => {
        getPatient(patientId, admitId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadPatient, patientId])
    useEffect(() => {
        formPatient.submit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formPatientSubmit])
    useEffect(() => {
        if (!getUsers) {
            setOptions(p => {
                return { ...p, users: users }
            })
        }
    }, [users])

    // Components
    const GenFormItem = ({ name, label = false, required = false, input = <></>, ...props }) => {
        const rules = [
            {
                required: required,
                message: "จำเป็น !"
            }
        ]
        const formLabelRequired = <label className='d-block' style={{ marginBottom: -4 }}>
            <label style={{ color: "red" }}>*</label>
            <label className='gx-text-primary'>{label}</label>
        </label>
        const formLabel = <label style={{ marginBottom: -4 }} className='gx-text-primary d-block'>{label}</label>
        return <>
            {
                label
                    ? required ? formLabelRequired : formLabel
                    : false
            }
            <Form.Item
                style={{ margin: 0 }}
                name={name}
                // label={label}
                rules={rules}
                {...props}
            >
                {input}
            </Form.Item>
        </>
    }

    const GenInput = ({ type, size = "small", disabled = false, options = [], ...props }) => {
        const inputType = type.toLowerCase()
        const selectProps = {
            // bordered: false,
            size: size,
            showSearch: true,
            allowClear: true,
            style: { width: "100%" },
            optionFilterProp: "label",
            dropdownMatchSelectWidth: 300,
            className: "data-value",
            options: options,
            disabled: disabled,
            ...props,
        }
        switch (inputType) {
            case "select":
                return <Select {...selectProps} />
            default: break
        }

    }

    const GenBtnThreeDot = ({ name, disabled, ...props }) => {
        return <label>
            <Button
                style={{ marginBottom: 0 }}
                size='small'
                shape='circle'
                icon={<BsThreeDots className='gx-text-primary' />}
                onClick={(e) => {
                    e.stopPropagation()
                    handleClickBtn(name)
                }}
                disabled={disabled}
                {...props}
            />
        </label>
    }

    const PartsModalEmessage = () => {
        return <>
            {
                vsbEmessage && <EMessage
                    isVisible={vsbEmessage}
                    onOk={() => setVsbEmessage(false)}
                    onCancel={() => setVsbEmessage(false)}
                    patientId={patientId || null}
                />
            }
        </>
    }

    const PartsModalPhone = () => {
        return <>
            {
                vsbPhone && <UpdateMobile
                    isZhow={vsbPhone}
                    patientId={patientId}
                    afterUpdate={() => {
                        setVsbPhone(false);
                        getPatient(patientId, admitId);
                    }} afterClose={() => {
                        setVsbPhone(false);
                    }} />
            }
        </>
    }

    const PartsOpdRights = () => {
        return <GenRow>
            <Col span={8}>
                {GenFormItem(
                    {
                        name: "opdRightId",
                        label: `สิทธิ์(${options.opdRights.length})`,
                        input: GenInput({
                            type: "select",
                            options: options.opdRights
                        }),
                        // required: true,
                        allowClear: false,
                    },
                )}
            </Col>
            <Col span={14}>
                <GenRow>
                    <Col span={6} className="text-center">
                        <LabelTextPrimary text='จำนวนเงิน' />
                        <Statistic precision={2} value={opdRightDetails?.amount || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <LabelTextPrimary text='เครดิต' />
                        <Statistic precision={2} value={opdRightDetails?.credit || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <LabelTextPrimary text='เบิกได้' />
                        <Statistic precision={2} value={opdRightDetails?.cashReturn || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <label style={{ color: "red" }}>เบิกไม่ได้</label>
                        <Statistic precision={2} value={opdRightDetails?.cashNotReturn || "0"} valueStyle={{
                            fontSize: 14,
                            color: "red"
                        }} />
                    </Col>
                </GenRow>
            </Col>
            <Col span={2} className='text-end'>
                {GenBtnThreeDot({ name: "vsbOpdRight", disabled: !patientId })}
            </Col>
        </GenRow>
    }

    const PartsAdmitRights = () => {
        const opdRightDetails = null
        return <GenRow align="middle">
            <Col span={8}>
                {GenFormItem(
                    {
                        name: "admitRightId",
                        label: `สิทธิ์(${options.admitRights.length})`,
                        input: GenInput({ type: "select", options: options.admitRights }),
                        required: true,
                    },
                )}
            </Col>
            <Col span={14}>
                <GenRow align="middle">
                    <Col span={6} className="text-center">
                        <LabelTopicPrimary text='จำนวนเงิน' />
                        <Statistic precision={2} value={opdRightDetails?.amount || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <LabelTopicPrimary text='เครดิต' />
                        <Statistic precision={2} value={opdRightDetails?.credit || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <LabelTopicPrimary text='เบิกได้' />
                        <Statistic precision={2} value={opdRightDetails?.cashReturn || "0"} valueStyle={{
                            fontSize: 14
                        }} />
                    </Col>
                    <Col span={6} className="text-center">
                        <label style={{ color: "red", fontWeight: "bold" }}>เบิกไม่ได้</label>
                        <Statistic precision={2} value={opdRightDetails?.cashNotReturn || "0"} valueStyle={{
                            fontSize: 14,
                            color: "red"
                        }} />
                    </Col>
                </GenRow>
            </Col>
            <Col span={2} className='text-end'>
                {GenBtnThreeDot({ name: "vsbOpdRight", disabled: !patientId })}
            </Col>
        </GenRow>
    }

    const PartsServices = () => {
        return GenFormItem(
            {
                name: "serviceId",
                label: `Service(${options.services.length})`,
                input: GenInput({
                    type: "select",
                    allowClear: false,
                    disabled: disabledSelectService,
                    options: options.services,
                }),
                // required: true,
                // allowClear: false,
            },
        )
    }

    const PartsClinics = () => {
        return GenFormItem(
            {
                name: "clinicId",
                label: `ห้องตรวจ(${options.clinics.length})`,
                input: GenInput({
                    type: "select",
                    allowClear: false,
                    disabled: disabledSelectClinic,
                    options: options.clinics,
                }),
                // required: true,
                allowClear: false,
            },
        )
    }

    const PartsDoctor = () => {
        return GenFormItem({
            name: "doctor",
            label: "แพทย์",
            input: GenInput({
                type: "select",
                allowClear: false,
                disabled: disabledSelectDoctor,
                options: options.users,
            })
        })
    }

    const PartsHxAndDrugAllergy = () => {
        return <GenRow>
            <Col span={12}>
                <ComponentHx
                    patientId={patientId}
                    spanCol1={4}
                    spanCol2={16}
                    spanCol3={4}
                    btnShape='circle'
                />
            </Col>
            <Col span={12}>
                <EllipsisDrugAllergy
                    patientId={patientId}
                    spanCol1={4}
                    spanCol2={16}
                    spanCol3={4}
                    btnShape='circle'
                />
            </Col>
        </GenRow>
    }

    const PartsModalHx = () => {
        return <Hx
            isVisible={vsbHx}
            setModal={isVisible => setVsbHx(isVisible)}
            patientId={patientId}
            reloadHx={isSuccess => getPatient(patientId)} />
    }

    const PartsModalDrugAllergy = () => {
        return <DrugAllergic
            handlePharmaceuticalDetail={() => setVsbDrugAllergy(!vsbDrugAllergy)}
            showPharmaceuticalDetail={vsbDrugAllergy}
            patientId={patientId}
            reloadDrugAllergic={isSuccess => {
                if (isSuccess) {
                    getPatient(patientId);
                }
            }}
        />
    }

    const PartsAddress = () => {
        return <AddressOnPatientCard patientId={patientId} />
    }

    // console.log('formPatient', formPatient.getFieldValue())

    return <Spin spinning={loading}>
        {/* Form */}
        <Form
            form={formPatient}
            onFinish={onPatientFinish}
            layout='vertical'
            onValuesChange={(changedValues) => {
                const name = Object.keys(changedValues)
                const value = Object.values(changedValues)
                handleChangeFormPatient(...name, ...value)
            }}
        >
            <GenRow>
                <Col span={2} className='text-center'>
                    {
                        patient?.picture
                            ? <Avatar size={60} src={<Image src={`data:image/jpeg;base64,${patient.picture}`} />} />
                            : <Avatar size={60}>Patient</Avatar>
                    }
                </Col>
                <Col span={22}>
                    <GenRow>
                        <Col span={22}>
                            <GenRow>
                                <Col>
                                    <LabelTopicPrimary className='me-1' text={patient?.displayName || "ชื่อ -"} />
                                    {patient?.gender === "M" && <ManOutlined style={{
                                        color: "blue"
                                    }} />}
                                    {patient?.gender === "F" && <WomanOutlined style={{
                                        color: "pink"
                                    }} />}
                                    <LabelTopicPrimary className='ms-2 me-2' text={patient?.idCard || "ID -"} />
                                    <LabelTopicPrimary className='me-1' text="HN" />
                                    <LabelTopic className='me-2' text={patient?.hn || "-"} />
                                    {allSearchPatientDetail?.patientDetail?.pregnancyFlag === "Y" &&
                                        <label className="me-2">
                                            <Icon style={{ cursor: "pointer" }}
                                                icon={pregnantIcon}
                                                width="22"
                                                height="22"
                                                className='gx-text-primary'
                                            />
                                        </label>}
                                    <LabelTopicPrimary className='me-1' text="เลขรับบริการ" />
                                    <LabelTopic className='me-2' text={queueservice || "-"} />
                                    <label className='me-2'><VipStatus patientId={patientId} /></label>
                                    <LabelTextPrimary className='me-1' text="อายุ" />
                                    <LabelText className='me-2' text={patient?.age || "-"} />
                                    <LabelTextPrimary className='me-1' text="เบอร์โทร" />
                                    <LabelText className='me-2' text={getContactInfo(patient)} />
                                    {GenBtnThreeDot({ name: "vsbPhone", disabled: !patientId })}
                                </Col>
                                {
                                    admitId && <Col>
                                        <LabelTopicPrimary className="ms-2 me-1" text={"AN"} />
                                        <LabelTopic className="me-2" text={patient?.an || '-'} />
                                        <LabelTextPrimary className="me-1" text={"Admit"} />
                                        <LabelTopic className="" text={patient?.admitDate} />
                                    </Col>
                                }
                            </GenRow>
                        </Col>
                        <Col span={2} className='text-end text-nowrap'>
                            <Button style={{
                                margin: 2
                            }} size="small" icon={<FileTextOutlined className="gx-text-primary" />} />
                            <Button style={{
                                margin: 2
                            }} size="small" icon={<CommentOutlined className="gx-text-primary" />} onClick={() => setVsbEmessage(true)} />
                        </Col>
                    </GenRow>
                    <GenRow>
                        {showService && <Col span={24} xxl={4} xl={4} lg={8} md={8}>{PartsServices()}</Col>}
                        {showClinic && <Col span={24} xxl={4} xl={4} lg={8} md={8}>{PartsClinics()}</Col>}
                        {showDoctor && <Col span={24} xxl={4} xl={4} lg={8} md={8}>{PartsDoctor()}</Col>}
                        {
                            showRight
                                ? admitId
                                    ? <Col span={24} xxl={12} xl={12}>{PartsAdmitRights()}</Col>
                                    : <Col span={24} xxl={12} xl={12}>{PartsOpdRights()}</Col>
                                : []
                        }
                    </GenRow>
                </Col>
            </GenRow>
            <GenRow>
                {showHxAndDrugAllergy && <Col span={24} xxl={14} xl={14} lg={14}>{PartsHxAndDrugAllergy()}</Col>}
                {showAddress && <Col span={24} xxl={10} xl={10} lg={10}>{PartsAddress()}</Col>}
            </GenRow>
            <div hidden>
                <Form.Item name="doctorSpecialties"><Input /></Form.Item>
            </div>
        </Form>
        {/* Modal */}
        {PartsModalEmessage()}
        {PartsModalPhone()}
        {PartsModalHx()}
        {PartsModalDrugAllergy()}
        <UpdateOpdRight
            patientId={patientId}
            opdRightId={formPatient.getFieldValue("opdRightId")}
            open={vsbOpdRight}
            close={() => {
                setVsbOpdRight(false);
            }}
            success={(bool) => {
                if (bool) {
                    setVsbOpdRight(false);
                    //   getOpdRights(serviceId);
                }
            }}
        />
    </Spin>
}
const apis = {
    GetPatientsByPatientId: {
        name: "GetPatientsByPatientId",
        url: "OPDClinic/GetPatientData/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetServices: {
        name: "GetServices",
        url: "OPDClinic/GetOpdService/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetOpdRights: {
        name: "GetOpdRights",
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetPatientDetail: {
        name: "GetPatientDetail",
        url: "OperationRoom/GetPatientDetail",
        // url: "OpdExamination/GetPatientDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetUserMas: {
        name: "GetUserMas",
        url: "Masters/GetUserMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
}
