import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
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
import { find, filter } from "lodash"
// Icons
import { CommentOutlined, FileTextOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { BsThreeDots } from "react-icons/bs";
import EllipsisDrugAllergy from 'components/Drug/EllipsisDrugAllergy';
import PregnantStatus from 'components/Pregnant/PregnantStatus';
import ComponentHx from 'components/Drug/ComponentHx';
import UpdateOpdRight from "components/Modal/UpdateOpdRight";
// import dayjs from 'dayjs';
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
    doNotDefaultServiceId = false
}) {
    // console.log('patientId :>> ', patientId);
    const allSearchPatientDetail = useSelector(({ Search }) => Search);
    // console.log('allSearchPatientDetail :>> ', allSearchPatientDetail);
    // Form
    const [formPatient] = Form.useForm()
    // Watch
    const doctorSpecialties = Form.useWatch("doctorSpecialties", formPatient)
    const selectedServiceId = Form.useWatch("serviceId", formPatient)
    const selectedClinicId = Form.useWatch("clinicId", formPatient)
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
    // console.log('options :>> ', options);
    const [patient, setPatient] = useState(null)
    const [queueservice, setQueueservice] = useState(null)
    // Vsb
    const [vsbEmessage, setVsbEmessage] = useState(false)
    const [vsbPhone, setVsbPhone] = useState(false);
    const [vsbOpdRight, setVsbOpdRight] = useState(false);
    const [vsbHx, setVsbHx] = useState(false);
    const [vsbDrugAllergy, setVsbDrugAllergy] = useState(false);
    const [opdRightDetails, setOpdRightDetails] = useState(null)
    // Funcs
    const getDropdown = async () => {
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
        let services = mappingOptions({ dts: allSearchPatientDetail?.serviceList || [], valueField: "serviceId", labelField: "serviceDate", compound: true })
        let tempServiceId = null
        if (serviceId) {
            const queueservice = find(services, ["serviceId", serviceId])?.queueservice
            tempServiceId = serviceId
            setQueueservice(queueservice ? `${Number(queueservice).toFixed(0)}` : null)
        } else if (services?.length) {
            tempServiceId = services?.[0].serviceId
            setQueueservice(services?.[0]?.queueservice ? `${Number(services?.[0]?.queueservice).toFixed(0)}` : null)
        }
        setLoading(true)
        let [
            res,
            opdRights,
        ] = await Promise.all([
            callApiObject(apis, "GetPatientDetail", { patientId }),
            tempServiceId ? callApiObject(apis, "GetOpdRights", tempServiceId) : [],
        ])
        setLoading(false)
        // Clinics
        let clinics = res?.opdClinics || []
        res.opdClinics = clinics
        clinics = filter(clinics, ["serviceId", tempServiceId])
        let tempClinicId = clinicId || find(clinics, ["workId", workId])?.clinicId || clinics?.[0]?.clinicId
        clinics = mappingOptions({ dts: clinics, valueField: "clinicId", labelField: "workName" })
        // Doctor
        const crrClinic = find(clinics, ["clinicId", tempClinicId])
        // OpdRights
        opdRights = mappingOptions({ dts: opdRights, valueField: "opdRightId", labelField: "opdRightName" })
        res.opdRights = opdRights
        let tempOpdRightId = opdRightId
        if (!opdRightId) {
            if (opdRights?.length) {
                const findRight = find(opdRights, ["mainFlag", "Y"]) || opdRights?.[0]
                tempOpdRightId = findRight?.opdRightId
                setOpdRightDetails(findRight)
            }
        } else {
            const findRight = find(opdRights, ["opdRightId", opdRightId])
            setOpdRightDetails(findRight)
        }
        // Patient
        setPatient(res)
        if (!doNotDefaultServiceId || serviceId) {
            formPatient.setFieldsValue({
                serviceId: tempServiceId,
                clinicId: tempClinicId,
                doctor: crrClinic?.doctor,
                doctorSpecialties: crrClinic?.doctorSpecialtiesName,
                opdRightId: tempOpdRightId,
            })
        } else {
            formPatient.setFieldsValue({
                serviceId: null,
                clinicId: null,
                doctor: null,
                doctorSpecialties: null,
                opdRightId: null,
            })
        }
        setOptions(p => {
            return {
                ...p,
                services: services,
                clinics: clinics,
                opdRights: opdRights,
            }
        })
        setFormPatientSubmit(p => !p)
    }
    const getDataByAdmitId = async (admitId) => {
        if (!admitId) return setPatient(null)
    }
    const getPatient = async (patientId, serviceId, admitId) => {
        if (!admitId) getDataByPatientId(patientId, serviceId);
        if (admitId) getDataByAdmitId(patientId, admitId);
    }
    const getOpdRights = async () => {
        const serviceId = formPatient.getFieldValue("serviceId")
        const opdRightId = formPatient.getFieldValue("opdRightId")
        let opdRights = await callApiObject(apis, "GetOpdRights", serviceId)
        opdRights = mappingOptions({ dts: opdRights, valueField: "opdRightId", labelField: "opdRightName" })
        const findRight = find(opdRights, ["opdRightId", opdRightId])
        setOpdRightDetails(findRight)
        setOptions(p => {
            return {
                ...p,
                opdRights: opdRights,
            }
        })
        setFormPatientSubmit(p => !p)
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
    const handleChangeFormPatient = (name, value) => {
        // console.log('name', name)
        switch (name) {
            case "serviceId":
                handleChangeServiceId(value)
                break;
            case "clinicId":
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
        let clinics = filter(patient?.opdClinics, ["serviceId", serviceId])
        clinics = mappingOptions({ dts: clinics, valueField: "clinicId", labelField: "workName" })
        const lastClinic = clinics.length ? clinics[0] : null
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
        setQueueservice(service?.queueservice ? `${Number(service.queueservice).toFixed(0)}` : null)
    }
    // Effect
    useEffect(() => {
        getDropdown()
    }, [])
    useEffect(() => {
        getPatient(patientId, serviceId, admitId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, reloadPatient])
    useEffect(() => {
        formPatient.submit()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formPatientSubmit])
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
            bordered: false,
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
    const PartsPatient = () => {
        return <GenRow>
            <Col span={3} className='text-center'>
                {
                    patient?.picture
                        ? <Avatar size={60} src={<Image src={`data:image/jpeg;base64,${patient.picture}`} />} />
                        : <Avatar size={60}>Patient</Avatar>
                }
            </Col>
            <Col span={21}>
                <GenRow>
                    <Col span={20}>
                        <LabelTopicPrimary className='me-1' text={patient?.displayName || "ชื่อ -"} />
                        {patient?.gender === "M" && <ManOutlined style={{
                            color: "blue"
                        }} />}
                        {patient?.gender === "F" && <WomanOutlined style={{
                            color: "pink"
                        }} />}
                        <LabelTopicPrimary className='ms-2' text={patient?.idCard || "ID -"} />
                    </Col>
                    <Col span={4} className='text-end text-nowrap'>
                        <Button style={{
                            margin: 2
                        }} size="small" icon={<FileTextOutlined className="gx-text-primary" />} />
                        <Button style={{
                            margin: 2
                        }} size="small" icon={<CommentOutlined className="gx-text-primary" />} onClick={() => setVsbEmessage(true)} />
                    </Col>
                </GenRow>
                <GenRow align='middle'>
                    <Col span={24}>
                        <LabelTopicPrimary className='me-1' text="HN" />
                        <LabelTopic className='me-2' text={patient?.hn || "-"} />
                        <label className="me-2">
                            <PregnantStatus patientId={patientId} />
                        </label>
                        <LabelTopicPrimary className='me-1' text="เลขรับบริการ" />
                        <LabelTopic className='me-2' text={queueservice || "-"} />
                        <label className='me-2'>
                            <VipStatus patientId={patientId} />
                        </label>
                        <LabelTextPrimary className='me-1' text="อายุ" />
                        <LabelText className='me-2' text={patient?.age || "-"} />
                        <LabelTextPrimary className='me-1' text="เบอร์โทร" />
                        <LabelText className='me-2' text={patient?.mobile || patient?.telephone || "-"} />
                        {GenBtnThreeDot({ name: "vsbPhone", disabled: !patientId })}
                    </Col>
                </GenRow>
                {
                    admitId && <GenRow align='middle'>
                        <Col span={24}>
                            <LabelTopicPrimary className="me-1" text={"AN"} />
                            <LabelTopic className="me-2" text={patient?.an || '-'} />
                            <LabelTextPrimary className="me-1" text={"Admit"} />
                            <LabelTopic className="" text={patient?.admitDate} />
                        </Col>
                    </GenRow>
                }
            </Col>
        </GenRow>
    }
    const PartsOpdRights = () => {
        return <div style={{ borderTop: "1px solid #EEE", marginTop: showService || showClinic ? 0 : 2, }}>
            <GenRow align="middle">
                <Col span={8}>
                    {GenFormItem(
                        {
                            name: "opdRightId",
                            label: `สิทธิ์(${options.opdRights.length})`,
                            input: GenInput({ type: "select", options: options.opdRights, disabled: !selectedServiceId }),
                            // required: true,
                            allowClear: false,
                        },
                    )}
                </Col>
                <Col span={14}>
                    <GenRow align="middle">
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
        </div>
    }
    const PartsAdmitRights = () => {
        const opdRightDetails = null
        return <div style={{ borderTop: "1px solid #EEE", marginTop: showService || showClinic ? 0 : 2 }}>
            <GenRow align="middle">
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
        </div>
    }
    const PartsServicesAndClinics = () => {
        return <div hidden={!showService && !showClinic} style={{ borderTop: "1px solid #EEE", marginTop: 2 }}>
            <GenRow>
                <Col span={12} hidden={!showService}>
                    <GenRow align="middle">
                        <Col span={8}>
                            <LabelTextPrimary text={`service(${options.services.length})`} />
                        </Col>
                        <Col span={16}>
                            {GenFormItem({
                                name: "serviceId",
                                input: GenInput({
                                    type: "select",
                                    allowClear: doNotDefaultServiceId,
                                    disabled: disabledSelectService,
                                    options: options.services,
                                })
                            })
                            }
                        </Col>
                    </GenRow>
                </Col>
                <Col span={12} hidden={!showClinic}>
                    <GenRow align="middle">
                        <Col span={8}>
                            <LabelTextPrimary text={`ห้องตรวจ(${options.clinics.length})`} />
                        </Col>
                        <Col span={16}>
                            {GenFormItem({
                                name: "clinicId",
                                input: GenInput({
                                    type: "select",
                                    allowClear: false,
                                    disabled: (!selectedServiceId) || disabledSelectClinic,
                                    options: options.clinics,
                                })
                            })
                            }
                        </Col>
                    </GenRow>
                </Col>
            </GenRow>
        </div>
    }
    const PartsDoctor = () => {
        return <div hidden={!showDoctor} style={{ borderTop: "1px solid #EEE" }}>
            <GenRow align="middle">
                {
                    showDoctor && <Col span={12}>
                        <GenRow align="middle">
                            <Col span={8}>
                                <LabelTextPrimary text="แพทย์" />
                            </Col>
                            <Col span={16}>
                                {GenFormItem({
                                    name: "doctor",
                                    input: GenInput({
                                        type: "select",
                                        allowClear: false,
                                        disabled: (!selectedClinicId) || disabledSelectDoctor,
                                        options: options.users,
                                    })
                                })
                                }
                            </Col>
                        </GenRow>
                    </Col>
                }
                {
                    showDoctor && <Col span={12}>
                        <LabelTextPrimary className='me-1' text="สาขาแพทย์" />
                        <LabelText text={doctorSpecialties || "-"} />
                    </Col>
                }
            </GenRow>
        </div>
    }
    const PartsHxAndDrugAllergy = () => {
        return <div hidden={!showHxAndDrugAllergy} style={{ borderTop: "1px solid #EEE", paddingTop: 4, paddingBottom: 0 }}>
            <GenRow>
                <Col span={24}>
                    <ComponentHx patientId={patientId}
                        btnShape='circle'
                    />
                </Col>
                <Col span={24}>
                    <EllipsisDrugAllergy
                        patientId={patientId}
                        btnShape='circle'
                    />
                </Col>
            </GenRow>
        </div>
    }
    const PartsModalHx = () => {
        return <>
            {
                vsbHx && <Hx
                    isVisible={vsbHx}
                    setModal={isVisible => setVsbHx(isVisible)}
                    patientId={patientId}
                    reloadHx={isSuccess => getPatient(patientId)} />
            }

        </>
    }
    const PartsModalDrugAllergy = () => {
        return <>
            {
                vsbDrugAllergy && <DrugAllergic
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
        </>
    }
    const PartsAddress = () => {
        return <div hidden={!showAddress} style={{ borderTop: "1px solid #EEE", paddingTop: 4 }}>
            {
                showAddress && <AddressOnPatientCard patientId={patientId} />
            }
        </div>
    }
    const PartsUpdateOpdRightModal = () => {
        return vsbOpdRight && <UpdateOpdRight
            patientId={patientId}
            opdRightId={opdRightDetails?.opdRightId}
            open={vsbOpdRight}
            close={() => setVsbOpdRight(false)}
            success={bool => {
                if (bool) {
                    setVsbOpdRight(false);
                    getOpdRights(serviceId)
                }
            }}
        />
    }
    return <Spin spinning={loading}>
        {PartsPatient()}
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
            <div hidden>
                <Form.Item name="doctorSpecialties"><Input /></Form.Item>
            </div>
            {PartsServicesAndClinics()}
            {showRight && admitId ? PartsAdmitRights() : PartsOpdRights()}
            {PartsDoctor()}
            {PartsHxAndDrugAllergy()}
            {PartsAddress()}
        </Form>
        {/* Modal */}
        {PartsModalEmessage()}
        {PartsModalPhone()}
        {PartsModalHx()}
        {PartsModalDrugAllergy()}
        {PartsUpdateOpdRightModal()}
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
    GetPatientDetail: {
        name: "GetPatientDetail",
        url: "OperationRoom/GetPatientDetail",
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
    GetOpdRights: {
        name: "GetOpdRights",
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
