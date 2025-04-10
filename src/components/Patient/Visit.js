import React, { useEffect, useState } from 'react'
import { env } from 'env.js';
import {
    Col, Row, Tabs, Card, Radio,
    Button, Popconfirm, Form, Input, Select,
    Checkbox, Tooltip, Modal, notification
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons';
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker';
import { map, find, filter } from 'lodash';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { rowProps, cardSm, selectSm } from 'props';
import { callApis } from 'components/helper/function/CallApi';
import Scrollbars from 'react-custom-scrollbars';
import { mappingOptions } from "components/helper/function/MappingOptions";
import TablePatientRights from "components/Table/TablePatientRights";
import BtnCheckRights from "components/Button/BtnCheckRights";
import {
    LabelTopicPrimary18,
    LabelTopicPrimary,
    LabelTextPrimary,
    // LabelText,
    GenFormItemLabel,
    // LabelTopic,
} from 'components/helper/function/GenLabel';
import { notiError, notiSuccess, notiWarning } from 'components/Notification/notificationX.js';
import AutoServiceCharge from 'components/helper/function/AutoServiceCharge';

const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const userId = userFromSession.responseData.userId;
const rules = [{
    required: true,
    message: 'จําเป็น !',
}]
export default function Visit({
    patientId = null,
    size = "small",
    hiddenBtnClose = false,
    onFinished = () => { },
    onCancel = () => { },
}) {
    const { doctorClinicRoom } = useSelector(({ workRoom }) => workRoom);
    // Form
    const [form] = Form.useForm();
    // Watch
    const serviceDate = Form.useWatch("serviceDate", form);
    const workId = Form.useWatch("workId", form);
    const doctor = Form.useWatch("doctor", form);
    // State
    const [loading, setLoading] = useState(false)
    const [loadingOptions, setLoadingOptions] = useState(false)
    const [isAdmit, setIsAdmit] = useState(false)
    const [patientRights, setPatientRights] = useState([])
    const [reloadPatientRight, setReloadPatientRight] = useState(false)
    const [opdClinics, setOpdClinics] = useState([])
    const [opdClinicsToday, setOpdClinicsToday] = useState([])
    const [mainRight, setMainRight] = useState(null)
    const [selectedRows, setSelectedRows] = useState([]);
    const [patient, setPatient] = useState(null)
    // console.log('patient', patient)
    const [objAvailableTime, setObjAvailableTime] = useState();
    const [vsbModalClaimType, setVsbModalClaimType] = useState(false)
    const [selectedClaimType, setSelectedClaimType] = useState(null)
    const [claimTypeDetails, setClaimTypeDetails] = useState(null)
    const [options, setOptions] = useState({
        pregnent: [],
        workPlaces: [],
        checkins: [],
        serviceTypes: [],
        doctors: [],
    })
    // Funcs
    const getOptions = async () => {
        setLoadingOptions(p => !p)
        let [
            pregnent,
            checkins,
            workPlaces,
            serviceTypes,
            doctors,
        ] = await Promise.all([
            callApis(apis["GetPregnant"]),
            callApis(apis["GetCheckIns"]),
            callApis(apis["GetWorkPlacesNotMain"]),
            callApis(apis["GetServiceTypes"]),
            callApis(apis["GetDoctorMas"]),
        ])
        setLoadingOptions(p => !p)
        pregnent = mappingOptions({ dts: pregnent })
        checkins = mappingOptions({ dts: checkins })
        workPlaces = mappingOptions({ dts: workPlaces })
        serviceTypes = mappingOptions({ dts: serviceTypes })
        doctors = mappingOptions({ dts: doctors })
        setOptions(p => {
            return {
                ...p,
                pregnent: pregnent,
                workPlaces: workPlaces,
                checkins: checkins,
                serviceTypes: serviceTypes,
                doctors: doctors
            }
        })
    }
    const getPatientData = async (patientId) => {
        if (!patientId) {
            setPatient(null)
            setOpdClinics([])
            setIsAdmit(false)
            return
        }
        let [
            patient,
            opdClinics,
            chkAdmit,
        ] = await Promise.all([
            callApis(apis["GetPatientsByPatientId"], patientId),
            callApis(apis["GetOpdClinics"], patientId),
            callApis(apis["ChkAdmit"], patientId),
        ])
        opdClinics = map(opdClinics, (o) => {
            return {
                ...o,
                clinicDate: o.clinicDate ? dayjs(o.clinicDate, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm") : null,
                serviceDate: o.clinicDate ? dayjs(o.clinicDate, "MM/DD/YYYY").format("YYYY-MM-DD") : null,
                clinicTimedesc: o.clinicDate ? dayjs(o.clinicDate, "MM/DD/YYYY HH:mm:ss").format("HH:mm") : null
            };
        });
        const tempPatient = patient?.[0] || null
        if (tempPatient?.isDied === "1") notiWarning({ message: "ผู้ป่วยเสียชีวิตแล้ว", description: "ไม่สามารถ Visit ได้" })
        setPatient(tempPatient)
        setOpdClinics(opdClinics || [])
        if (chkAdmit !== "0") {
            setIsAdmit(true);
            notiWarning({ message: "ผู้ป่วยกำลัง Admit !", description: "จะไม่สามารถ Visit ได้" })
        } else {
            setIsAdmit(false);
        }
    }
    const deleteAdr = async patientId => {
        if (!patientId) return;
        if (!hosParam?.deleteAdr) return;
        let drugAllergic = await callApis(apis["GetPatientsDrugAllergiesById"], patientId);
        let req = {
            "patientId": patientId,
            "notAlergicFlag": null,
            "drugAllergic": null,
            "underlyingDisease": drugAllergic?.underlyingDisease || null,
            "userModified": userId,
            "foodAllergy": drugAllergic?.foodAllergy || null,
            "otherAllergic": drugAllergic?.otherAllergic || null,
            "clinicalHistory": drugAllergic?.clinicalHistory || null,
            "surgeryHistory": drugAllergic?.surgeryHistory || null,
            "bloodInteraction": drugAllergic?.bloodInteraction ? "Y" : null,
            "bloodInteractionDesc": drugAllergic?.bloodInteractionDesc,
            "regularMedication": drugAllergic?.regularMedication || null
        };
        const res = await callApis(apis["UpdDrugAllergies"], req);
        // if (res?.isSuccess) {
        //     setPatientReload(patientReload + 1);
        // }
    };
    const openNotificationWithIcon = (type) => {
        notification[type]({
            message: <label className="topic-danger-bold">แจ้งเตือน Limit ผู้ป่วย</label>,
            description: <>
                <label className="topic-green">ห้องตรวจและแพทย์ที่เลือก</label>
                <br />
                <label className="topic-danger mb-1">
                    มีจำนวนคนไข้ครบ Limit แล้ว
                </label>
                <br />
                <label className="topic-danger">ไม่สามารถ Visit เพิ่มได้</label>
            </>,
            duration: 8
        });
    };
    const onFinish = async (values) => {
        console.log('onFinish', values)
        const mainRightDetails = find(patientRights, ["ptRightId", mainRight]);
        const insertVisit = async () => {
            const rights = map(selectedRows, o => {
                return {
                    rightId: o.rightId,
                    rightName: o.name,
                    mainFlag: o.ptRightId === mainRight ? "Y" : null
                };
            });
            let req = {
                patientId: patient.patientId,
                workId: values.workId,
                fromWork: values.workId,
                referId: null,
                runHn: patient.runHn,
                yearHn: patient.yearHn,
                hn: patient.hn,
                ageYear: patient.ageYear || null,
                limit: null,
                serviceId: null,
                serviceDate: serviceDate.format("YYYY-MM-DD HH:mm:ss"),
                userCreated: userId,
                register: userId,
                authenCode: values.authenCode ? values.authenCode : null,
                authenFail: values.authenFail ? "Y" : null,
                opdRightId: mainRightDetails?.opdRightId || null,
                doctor: values.doctor ? values.doctor : null,
                checkin: values.checkins ? values.checkins : null,
                checkinUser: userId,
                serviceType: values.serviceType ? values.serviceType : null,
                registerType: "R",
                appointId: null,
                rightIdMainFlag: mainRightDetails?.rightId,
                rightId: rights,
                status: "R",
                urgentFlag: values.urgentFlag ? "Y" : null,
                accidentFlag: values.accidentFlag ? "Y" : null,
                conceledFlag: values.conceledFlag ? "Y" : null,
                pregnantFlag: values.pregnantFlag ? values.pregnantFlag : null,
                subspecialty: values?.subspecialty || null,
                screeningWorkId: values?.screeningWorkId || null,
            }
            // return
            setLoading(true)
            const res = await callApis(apis["ChkServiceVisit"], req);
            const clinicId = res?.responseData?.clinicId
            if (res.isSuccess && !(clinicId === null || clinicId === "0")) {
                notiSuccess({ message: "Visit" });
                setLoading(false);
                form.resetFields();
                deleteAdr(patientId);
                await AutoServiceCharge({
                    patientId: patientId,
                    workId: values.workId,
                    rightId: mainRightDetails?.rightId,
                    serviceDetail: {
                        ...patient,
                        ...res.responseData,
                    },
                });
                onFinished(res.responseData)
            } else {
                if (res?.responseData?.chkMsg === " มี ServiceId และ มี ClinicId ที่ TB_OPD_CLINICS มี workId ที่เลือกใน ClinicDate = วันที่ปัจจุบัน") {
                    notiError({ message: "Visit", description: "ผู้ป่วยมี Visit ที่ห้องตรวจนี้แล้ว" });
                } else {
                    notiError({ message: "Visit" });
                }
            }
        };
        // console.log('workPlaceValue', workPlaceValue)
        if (workId && doctor) {
            let req = {
                workId: workId,
                doctor: doctor,
                startDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                endDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
            };
            const res = await callApis(apis["GetDoctorSchedulesLimitCase"], req)
            if (res?.result?.length) {
                if (res?.result[0]?.isLimit === "Y") {
                    openNotificationWithIcon("warning");
                } else {
                    insertVisit();
                }
            } else {
                insertVisit();
            }
        } else {
            insertVisit();
        }
    }
    const onFinishFailed = (params) => {
        console.log('onFinishFailed', params)
    }
    const visitAble = (patient, mainRight) => {
        if (!patient) return true
        if (patient?.isDelete === "1" || patient?.isDied === "1") return true
        if (!mainRight) return true
        return false
    }
    const warnigMessage = name => {
        let modalTitle = null;
        let modalMassage = null;
        switch (name) {
            case "duplicateWork":
                modalTitle = "ไม่สามารถดำเนินการได้";
                modalMassage = "ผู้ป่วยมี Visit ที่ห้องตรวจนี้แล้ว";
                break;
            case "admit":
                modalTitle = "ผู้ป่วยกำลัง Admit";
                modalMassage = "จะไม่สามารถ Visit ได้";
                break;
            case "dead":
                modalTitle = "ผู้ป่วยเสียชีวิตแล้ว";
                modalMassage = "ไม่สามารถ Visit ได้";
                break;
            case "notAvailable":
                modalTitle = "นอกเวลาทำการ";
                modalMassage = "ไม่สามารถ Visit ได้";
                break;
            case "checkpopuprightGroup":
                modalTitle = "ตรวจสอบสิทธิ์หลัก";
                modalMassage = "สิทธิ์หลักอยู่ในกลุ่มที่ต้องตรวจสอบสิทธิ์";
                break;
            default:
                break;
        }
        return <>
            <label className="gx-text-primary mb-1" style={{
            /* color: "#FF3D00", */fontSize: 26,
                fontWeight: "bold"
            }}>
                {modalTitle}
            </label>
            <br />
            <label className="gx-text-primary" style={{
                fontSize: 22
            }}>
                {modalMassage}
            </label>
        </>;
    };
    const modalInfo = name => {
        return {
            centered: true,
            icon: <InfoCircleOutlined style={{
                color: "#1890FF",
                fontSize: 42
            }} />,
            content: warnigMessage(name),
            okText: "ปิด",
            okButtonProps: {
                size: "large",
                type: "default"
            }
        };
    };
    const modalWarning = name => {
        return {
            centered: true,
            icon: <InfoCircleOutlined style={{
                color: "#DD2C00",
                fontSize: 42
            }} />,
            content: warnigMessage(name),
            okText: "ปิด",
            okButtonProps: {
                size: "large",
                type: "default"
            }
        };
    };
    const confirmVisit = async () => {
        const findByWorkId = find(opdClinicsToday, ["workId", workId]);
        const duplicatedVisit = find(opdClinicsToday, (clinic) => {
            return clinic.workId === workId && clinic.clinicDate === findByWorkId?.clinicDate;
        });

        if (hosParam.repeatVisit === "Y" && duplicatedVisit) {
            const proceedWithVisit = await new Promise((resolve) => {
                Modal.confirm({
                    content: (
                        <div style={{ textAlign: "center", marginTop: "15px" }} className="fw-bold">
                            <label className="fs-5" style={{ marginBottom: "8px" }}>
                                ห้องตรวจ{" "}
                                <span className="gx-text-primary">{duplicatedVisit.workName}</span>
                            </label>
                            <label className="fs-5">
                                มีการ Visit ไปแล้วเมื่อ{" "}
                                <span className="gx-text-primary">
                                    {duplicatedVisit.clinicDatedesc} เวลา {duplicatedVisit.clinicTimedesc}
                                </span>
                                <span style={{ paddingLeft: "5px" }}>น. ต้องการ Visit ซ้ำหรือไม่?</span>
                            </label>
                        </div>
                    ),
                    icon: false,
                    width: 800,
                    centered: true,
                    okText: "Visit",
                    cancelText: "ยกเลิก",
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!proceedWithVisit) {
                return;
            }
        }
        const findptRightId = find(selectedRows, ["ptRightId", mainRight]);
        if (findptRightId) {
            const { isSuccess, responseData } = await callApis(apis["CheckRightPopup"], findptRightId?.rightId);
            if (isSuccess && responseData) {
                Modal.warning(modalInfo("checkpopuprightGroup"));
                return;
            }
        }
        const startTimeWithMoment = objAvailableTime
            ? objAvailableTime?.dataother2
                ? dayjs(objAvailableTime.dataother2, "HH:mm:ss").format("HH:mm:ss")
                : null
            : null;
        const endTimeWithMoment = objAvailableTime
            ? objAvailableTime?.dataother3
                ? dayjs(objAvailableTime.dataother3, "HH:mm:ss").format("HH:mm:ss")
                : null
            : null;
        const currentTime = dayjs().format("HH:mm:ss");
        const notAvailableTime = !(currentTime >= startTimeWithMoment && currentTime <= endTimeWithMoment);

        if (patient?.isDied === "1") {
            Modal.warning(modalWarning("dead"));
        } else if (isAdmit) {
            Modal.warning(modalWarning("admit"));
        } else if (notAvailableTime && startTimeWithMoment && endTimeWithMoment) {
            Modal.warning(modalWarning("notAvailable"));
        } else {
            form.submit();
        }
    };
    const filterOpdClinicsByServiceDate = (opdClinics, serviceDate) => {
        if (!opdClinics?.length) return setOpdClinicsToday([])
        const tempServiceDate = dayjs(serviceDate).format("YYYY-MM-DD");
        setOpdClinicsToday(filter(opdClinics, ["serviceDate", tempServiceDate]));
    }
    const chkAvailableTime = (workPlaces, workId) => {
        const result = find(workPlaces, o => o.value === workId)
        setObjAvailableTime(result);
    }
    const handleNhsoServiceConfirm = async () => {
        const req = {
            "pid": claimTypeDetails.pid,
            "claimType": selectedClaimType,
            "mobile": patient?.mobile || patient?.telephone || "0000000000",
            "correlationId": claimTypeDetails.correlationId,
            "hn": patient?.hn,
            "hcode": claimTypeDetails.hospMain?.hcode || null,
        }
        setLoading(true)
        fetch(`${env.REACT_APP_PANACEACHS_SERVER}/api/VitalSigns/AuthenCode`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(req)
        }).then(response => response.json()).then(data => {
            // console.log('data :>> ', data);
            setLoading(false)
            if (data?.isSuccess) {
                form.setFieldsValue({
                    authenCode: data?.responseData || null,
                });
                setSelectedClaimType(null)
                setClaimTypeDetails(null)
                setVsbModalClaimType(false)
            } else notiWarning({ message: "ไม่สามารถขอเลข Authen code ได้ !" })
        });
    }
    const checkAndGetAuthenCodeStep2 = async () => {
        setLoading(true)
        const res = await fetch(`${env.REACT_APP_PANACEA_CHECKRIGHT}/api/smartcard/read?readImageFlag=false`, {
            method: "GET"
        }).then(response => response.json()).then(data => data);
        // console.log('response', response)
        setLoading(false)
        if (!res?.claimTypes?.length) return notiWarning({ message: "ไม่สามารถขอเลข Authen code ได้ !" })
        if (patient?.idCard !== res.pid) return notiError({ message: "เลขประจำตัวประชาชนของผู้ป่วยกับบัตรที่เสียบไม่ตรงกัน" })
        setVsbModalClaimType(true)
        setClaimTypeDetails(res)
        setSelectedClaimType(res.claimTypes[0].claimType)
    }
    const checkAndGetAuthenCodeStep1 = async () => {
        if (!patient?.idCard) return notiWarning({ message: "ไม่พบข้อมูลเลขบัตร ปชช. ของผู้ป่วย !" })
        setLoading(true)
        const responseIdCard = await fetch(`${env.REACT_APP_PANACEA_CHECKRIGHT}/api/nhso-service/latest-authen-code/${patient.idCard}`, {
            method: "GET"
        }).then(response => response.json()).then(data => data);
        // console.log('responseIdCard', responseIdCard)
        setLoading(false)
        if (responseIdCard?.claimCode) {
            const crrDate = dayjs().format("DD-MM-YYYY")
            const claimDate = dayjs(responseIdCard.claimDateTime).format("DD-MM-YYYY")
            if (crrDate === claimDate) {
                form.setFieldsValue({
                    authenCode: responseIdCard?.claimCode
                });
            } else {
                checkAndGetAuthenCodeStep2()
            }
        } else {
            checkAndGetAuthenCodeStep2()
        }
    }
    // Effect
    useEffect(() => {
        getOptions()
    }, [])
    useEffect(() => {
        getPatientData(patientId)
    }, [patientId])
    useEffect(() => {
        filterOpdClinicsByServiceDate(opdClinics, serviceDate)
    }, [serviceDate, opdClinics])
    useEffect(() => {
        chkAvailableTime(options.workPlaces, workId)
    }, [options.workPlaces, workId])
    // Components
    const PartsModalClaimType = () => {
        return <Modal
            centered
            width={800}
            visible={vsbModalClaimType}
            closable={false}
            closeIcon={false}
            title={<LabelTopicPrimary18 text='ประเภทการรับบริการสำหรับยืนยันการเข้ารับบริการ' />}
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            onOk={() => handleNhsoServiceConfirm()}
            onCancel={() => {
                setVsbModalClaimType(false);
                setClaimTypeDetails(null);
                setSelectedClaimType(null)
            }}
        >
            <Scrollbars autoHeight autoHeightMin={445}>
                <div className='ps-1 pe-1'>
                    <Row gutter={[8, 8]} align='middle'>
                        {
                            map(claimTypeDetails?.claimTypes || [], o => {
                                return <Col span={8} key={o.claimType}>
                                    <Card
                                        className='text-center m-0'
                                        size='small'
                                        hoverable
                                        onClick={e => {
                                            e.stopPropagation()
                                            setSelectedClaimType(o.claimType)
                                        }}
                                        style={{
                                            height: 100,
                                            border: o.claimType === selectedClaimType ? "1px solid #4FC3F7" : "",
                                            alignContent: "center",
                                            backgroundColor: o.claimType === selectedClaimType ? "#B3E5FC" : "#E1F5FE",
                                        }}
                                    >
                                        <div style={{ margin: -8 }}>
                                            <LabelTopicPrimary className='pointer' text={o.claimTypeName} />
                                        </div>
                                    </Card>
                                </Col>
                            })
                        }
                    </Row>
                </div>
            </Scrollbars>
        </Modal>
    }
    const PartForm = () => {
        return <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            initialValues={{
                serviceDate: dayjs(),
                checkins: "01",
                workId: doctorClinicRoom?.datavalue
            }}
        >
            <Form.Item name="mainRight" hidden><Input /></Form.Item>
            <Row {...rowProps}>
                <Col span={8}>
                    <GenFormItemLabel label="วันที่รับบริการ" required={true} />
                    <Form.Item className='mb-0' name="serviceDate" rules={rules}>
                        <DayjsDatePicker
                            size={size}
                            allowClear={false}
                            form={form}
                            name="serviceDate"
                            style={{ width: "100%" }}
                            format={"DD/MM/YYYY"}
                            className="data-value"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <GenFormItemLabel label={hosParam?.isSetWorkName ? hosParam?.isSetWorkName : "ห้องตรวจ"} required={true} />
                    <Form.Item className='mb-0' name="workId" rules={rules}>
                        <Select {...selectSm} options={options.workPlaces} loading={loadingOptions} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <GenFormItemLabel label="สถานะการมา" required={true} />
                    <Form.Item className='mb-0' name="checkins" rules={rules}>
                        <Select {...selectSm} options={options.checkins} loading={loadingOptions} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <GenFormItemLabel label="ประเภทการมารับบริการ" />
                    <Form.Item className='mb-0' name="serviceType">
                        <Select {...selectSm} options={options.serviceTypes} loading={loadingOptions} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <GenFormItemLabel label="แพทย์" />
                    <Form.Item className='mb-0' name="doctor">
                        <Select {...selectSm} options={options.doctors} loading={loadingOptions} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Row {...rowProps}>
                        <Col span={16}>
                            <GenFormItemLabel label="Authen Code" />
                            <Form.Item className='mb-0' name="authenCode">
                                <Input size={size} disabled readOnly className="data-value" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Button
                                size={size}
                                type="primary"
                                style={{ width: "100%", marginTop: 18 }}
                                onClick={checkAndGetAuthenCodeStep1}
                            >
                                ขอ Authen Code
                            </Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Form.Item className='mb-0' name="authenFail" valuePropName="checked">
                        <Checkbox>
                            <label className="gx-text-primary">ไม่สามารถเชื่อมต่อเพื่อขอเลข Authen Code จาก สปสช. ได้</label>
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Row {...rowProps}>
                        <Col>
                            <Form.Item className='mb-0' name="urgentFlag" valuePropName="checked">
                                <Checkbox>
                                    <label className="gx-text-primary">ฉุกเฉิน</label>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item className='mb-0' name="accidentFlag" valuePropName="checked">
                                <Checkbox>
                                    <label className="gx-text-primary">อุบัติเหตุ</label>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item className='mb-0' name="conceledFlag" valuePropName="checked">
                                <Checkbox>
                                    <label className="gx-text-primary">ผู้ป่วยคดี</label>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item className='mb-0' name="positiveFlag" valuePropName="checked">
                                <Checkbox>
                                    <label className="gx-text-primary">ผู้ป่วยเฝ้าระวัง</label>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Form.Item className='mb-0' name="pregnantFlag">
                        <Radio.Group
                        // disabled={patientData[0]?.gender === "M" ? true : false}
                        >
                            {
                                map(options.pregnent, o => {
                                    return <Radio key={o.value} value={o.value}>
                                        <LabelTextPrimary text={o.label} />
                                    </Radio>
                                })
                            }
                        </Radio.Group>
                    </Form.Item>
                </Col>
                {/* <Col>
                    <Form.Item className='mb-0' name="searchDocunemt" valuePropName="checked">
                        <Checkbox>
                            <label className="gx-text-primary">ค้นแฟ้ม?</label>
                        </Checkbox>
                    </Form.Item>
                </Col> */}
                <Col span={24} className='text-center'>
                    <Button
                        hidden={hiddenBtnClose}
                        className='mb-0 me-2'
                        onClick={() => onCancel()}
                    >
                        ปิด
                    </Button>
                    <Tooltip
                        placement="top"
                        color="yellow"
                        title={!mainRight && <label>กรุณาเลือกสิทธิ์หลักก่อน !</label>}
                    >
                        {selectedRows?.length > 1 && hosParam?.popupManyRightFlag === "Y"
                            ? <Popconfirm
                                placement="topRight"
                                title="ผู้ป่วยใช้สิทธิ์เกิน 1 สิทธิ์ ต้องการ visit หลายสิทธิ์หรือไม่"
                                onConfirm={() => confirmVisit()}
                                disabled={() => visitAble(patient, mainRight)}
                            >
                                <Button
                                    style={{ margin: 0 }}
                                    type="primary"
                                    disabled={visitAble(patient, mainRight)}
                                >
                                    Visit
                                </Button>
                            </Popconfirm>
                            : <Button
                                style={{ margin: 0 }}
                                type="primary"
                                loading={loading}
                                disabled={visitAble(patient, mainRight)}
                                onClick={() => {
                                    confirmVisit();
                                }}>
                                Visit
                            </Button>
                        }
                    </Tooltip>
                </Col>
            </Row>
        </Form>
    }
    return <Row {...rowProps}>
        <Col span={14}>
            <Tabs size='small'
                tabBarExtraContent={
                    <>
                        <BtnCheckRights
                            idCard={patient?.idCard}
                            patient={patient}
                            reloadPatientRight={() => setReloadPatientRight(p => !p)}
                        />
                    </>
                }
            >
                <Tabs.TabPane tab="สิทธิ์การรักษา" key="patientRights">
                    <TablePatientRights
                        patientId={patientId}
                        selectedRows={(patientRights, mainRight, selectedRows) => {
                            setPatientRights(patientRights)
                            setMainRight(mainRight)
                            setSelectedRows(selectedRows)
                        }}
                        reloadPatientRight={reloadPatientRight}
                    />
                </Tabs.TabPane>
                {/* <Tabs.TabPane tab="สิทธิ์ประจำวัน" key="opdRights">
                    <TableOpdRights />
                </Tabs.TabPane> */}
            </Tabs>
        </Col>
        <Col span={10}>
            <Card {...cardSm} bordered={false}>
                {PartForm()}
                {PartsModalClaimType()}
            </Card>
        </Col>
    </Row>
}
const apis = {
    GetPregnant: {
        url: "Masters/GetPregnant",
        method: "POST",
        return: "responseData",
        sendRequest: false
    },
    GetCheckIns: {
        url: "Masters/GetCheckins",
        method: "POST",
        return: "responseData",
        sendRequest: false
    },
    GetServiceTypes: {
        url: "Masters/GetServiceTypes",
        method: "POST",
        return: "responseData",
        sendRequest: false
    },
    GetDoctorMas: {
        url: "Masters/GetDoctorMas",
        method: "POST",
        return: "responseData",
        sendRequest: false
    },
    GetWorkPlacesNotMain: {
        url: "Masters/GetWorkPlacesNotMain?CancelFlag=N",
        method: "POST",
        return: "responseData",
        sendRequest: false
    },
    ChkAdmit: {
        url: "Admits/ChkAdmit/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetOpdClinics: {
        url: "OpdRightVisit/GetOpdClinicsVisit?PatientId=",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    CheckRightPopup: {
        url: "RightCheck/CheckRightPopup/",
        method: "GET",
        return: "data",
        sendRequest: false
    },
    GetPatientsByPatientId: {
        url: "Patients/GetPatientsByPatientId/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetPatientsDrugAllergiesById: {
        url: "Patients/GetPatients_Drug_AllergiesById/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    ChkServiceVisit: {
        url: "OpdRightVisit/ChkServiceVisit",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    UpdDrugAllergies: {
        url: "Patients/UpdDrug_Allergies_Underlying_Diseases",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    GetDoctorSchedulesLimitCase: {
        url: "OpdExamination/GetDoctorSchedulesLimitCase",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
}
