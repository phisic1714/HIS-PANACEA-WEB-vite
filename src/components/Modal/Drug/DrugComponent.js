import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';
import _find from "lodash/find"
import { Checkbox, Col, Form, Input, Modal, Row, Select, Spin } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import {
    LabelTopicPrimary18,
    GenFormItemLabel,
} from 'components/helper/function/GenLabel';
import { notiSuccess, notiError, notiWarning } from "components/Notification/notificationX";
import { rowProps, selectSm, } from 'props'
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker';
import { mappingOptions } from "components/helper/function/MappingOptions";
import { dspHospCode } from "appRedux/actions";

const size = "small"
const rules = [
    {
        required: true,
        message: 'จำเป็น !',
    }
]
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function DrugComponent({
    patientId = null,
    runHn = null,
    yearHn = null,
    hn = null,
    visible = false,
    onCancel = () => { },
    defaultValues = null,
    isFinished = () => { },
    prevRecord = [],
}) {
    const dispatch = useDispatch();
    const { hospCode } = useSelector(({ getDropdownMaster }) => getDropdownMaster);
    // Form
    const [form] = Form.useForm()
    // Watch
    const drugComponemtPatientId = Form.useWatch("drugComponemtPatientId", form)
    // State
    const [loading, setLoading] = useState(false)
    const [loadingHospCode, setLoadingHospCode] = useState(false)
    const [isDropdownDowloaded, setIsDropdownDowloaded] = useState(false)
    const [loadingDropdownDowloaded, setLoadingDropdownDowloaded] = useState(false)
    const [options, setOptions] = useState({
        drugComponent: [],
        symptoms: [],
        typeDx: [],
        informant: [],
        allergyLevels: [],
        userEvaluated: [],
        works: [],
        newFlag: [],
        adrType: [],
    })
    // Funcs
    const upsert = async (req) => {
        setLoading(p => !p)
        const res = await callApis(apis["UpSertDrugComponentAllegies"], req)
        setLoading(p => !p)
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกข้อมูลแพ้ส่วนประกอบยา", })
            onCancel()
            isFinished()
            form.resetFields()
        } else notiError({ message: "บันทึกข้อมูลแพ้ส่วนประกอบยา" })
    }
    const onFinish = (v) => {
        // console.log('onFinish :>> ', v);
        const req = {
            ...v,
            patientId,
            runHn,
            yearHn,
            hn,
            userId: user,
            userCreated: user,
            dateCreated: dayjs().format("YYYY/MM/DD HH:mm:ss"),
            userModified: user,
            dateModified: dayjs().format("YYYY/MM/DD HH:mm:ss"),
            adrDate: v?.adrDate ? dayjs(v.adrDate).format("YYYY/MM/DD HH:mm:ss") : null,
            dateEvaluated: v?.dateEvaluated ? dayjs(v.dateEvaluated).format("YYYY/MM/DD HH:mm:ss") : null,
            lockFlag: v?.lockFlag ? "Y" : null,
            tbAdrPictures: [],
        }
        upsert(req)
    }
    const getHospCode = async () => {
        if (isDropdownDowloaded) return
        if (hospCode?.length) return
        setLoadingHospCode(true)
        let res = await callApis(apis["GetHospcodes"]);
        res = mappingOptions({ dts: res, compound: true })
        dispatch(dspHospCode(res))
        setLoadingHospCode(false)
    }
    const getOptions = async () => {
        if (isDropdownDowloaded) return
        setIsDropdownDowloaded(true)
        setLoadingDropdownDowloaded(p => !p)
        let [
            drugComponent,
            resAllergySymptoms,
            resTypeDx,
            informant,
            allergyLevels,
            userEvaluated,
            works,
            newFlag,
            adrType,
        ] = await Promise.all([
            callApis(apis["GetDrugComponent"]),
            callApis(apis["GetAllergySymptoms"]),
            callApis(apis["GetDropDownMas"], { table: "TB_PATIENT_DRUG_COMPONENT_ALLERGY", field: "TypeDX" }),
            callApis(apis["GetDropDownMas"], { table: "TB_PATIENT_DRUG_COMPONENT_ALLERGY", field: "INFORMANT" }),
            callApis(apis["GetAllergyLevels"]),
            callApis(apis["GetUserEvaluated"]),
            callApis(apis["GetWorkPlacesMas"]),
            callApis(apis["GetNewFlag"]),
            callApis(apis["GetAdrType"]),
        ])
        setLoadingDropdownDowloaded(p => !p)
        drugComponent = mappingOptions({ dts: drugComponent })
        resAllergySymptoms = mappingOptions({ dts: resAllergySymptoms, compound: true })
        resTypeDx = mappingOptions({ dts: resTypeDx, compound: true })
        informant = mappingOptions({ dts: informant, compound: true })
        allergyLevels = mappingOptions({ dts: allergyLevels, valueField: "code", labelField: "name", compound: true })
        userEvaluated = mappingOptions({ dts: userEvaluated, compound: true })
        works = mappingOptions({ dts: works })
        newFlag = mappingOptions({ dts: newFlag, compound: true })
        adrType = mappingOptions({ dts: adrType })
        setOptions(p => {
            return {
                ...p,
                drugComponent: drugComponent,
                symptoms: resAllergySymptoms,
                typeDx: resTypeDx,
                informant: informant,
                allergyLevels: allergyLevels,
                userEvaluated: userEvaluated,
                works: works,
                newFlag: newFlag,
                adrType: adrType,
            }
        })
    }
    // Helpers
    const defaultForm = (dts) => {
        const dateFormat = "YYYY-MM-DD HH:mm:ss"
        if (!dts) return
        form.setFieldsValue({
            ...dts,
            typedx: dts?.typeDx,
            informhosp: dts?.informHosp,
            adrDate: dts?.adrDate ? dayjs(dts.adrDate, dateFormat) : null,
            dateEvaluated: dts?.dateEvaluated ? dayjs(dts.dateEvaluated, dateFormat) : null,
        })
    }
    const chkDup = (v) => {
        if (!prevRecord.length) return
        if (!v) return
        const find = _find(prevRecord, ["drugComponentId", v])
        if (!find) return
        if (drugComponemtPatientId === find.drugComponemtPatientId) return
        notiWarning({ message: "แจ้งเตือน !", description: "เลือกส่วนประกอบยาซ้ำ" })
    }
    useEffect(() => {
        if (visible) {
            getOptions()
            getHospCode()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, isDropdownDowloaded])
    useEffect(() => {
        defaultForm(defaultValues)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues])

    return <Modal
        title={<LabelTopicPrimary18 text='รายละเอียดแพ้ส่วนประกอบยา' />}
        centered
        width={775}
        closable={false}
        closeIcon={false}
        visible={visible}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => form.submit()}
        onCancel={() => {
            form.resetFields()
            onCancel(false)
        }}
        okButtonProps={{ loading: loading, }}
        cancelButtonProps={{ loading: loading, }}
    >
        <Spin spinning={loading}>
            <Form form={form} onFinish={onFinish} layout='vertical'>
                <Form.Item hidden name="drugComponemtPatientId">
                    <Input />
                </Form.Item>
                <Form.Item hidden name="cancelFlag">
                    <Input />
                </Form.Item>
                <Row {...rowProps}>
                    {/* expenseId */}
                    <Col span={11}>
                        <GenFormItemLabel required={true} label="ระบุ Code ยาที่แพ้" />
                        <Form.Item className='mb-0' name="drugComponentId" rules={rules}>
                            <Select
                                {...selectSm}
                                options={options.drugComponent}
                                onChange={v => {
                                    chkDup(v)
                                }}
                                loading={loadingDropdownDowloaded}
                            />
                        </Form.Item>
                    </Col>
                    {/* lockFlag */}
                    <Col span={2} className='text-center'>
                        <GenFormItemLabel label="Lock" />
                        <Form.Item className='mb-0' name="lockFlag" valuePropName='checked'>
                            <Checkbox />
                        </Form.Item>
                    </Col>
                    {/* symptom */}
                    <Col span={11}>
                        <GenFormItemLabel required={true} label="ลักษณะอาการ" />
                        <Form.Item className='mb-0' name="symptom" rules={rules}>
                            <Select
                                {...selectSm}
                                filterSort={(optionA, optionB) =>
                                    optionA?.label
                                        ?.toLowerCase()
                                        ?.localeCompare(optionB?.label?.toLowerCase())
                                }
                                options={options.symptoms}
                                loading={loadingDropdownDowloaded}
                            />
                        </Form.Item>
                    </Col>
                    {/* otherSymptom */}
                    <Col span={13}>
                        <GenFormItemLabel required={true} label="ระบุรายละเอียดการแพ้ยา" />
                        <Form.Item className='mb-0 mt-1' name="otherSymptom" rules={rules}>
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Col>
                    {/* typedx */}
                    <Col span={11}>
                        <GenFormItemLabel required={true} label="การวินิจฉัย" />
                        <Form.Item className='mb-0 mt-1' name="typedx" rules={rules}>
                            <Select
                                {...selectSm}
                                options={options.typeDx}
                                loading={loadingDropdownDowloaded}
                            />
                        </Form.Item>
                    </Col>
                    {/* adrType */}
                    <Col span={12}>
                        <GenFormItemLabel required={true} label="ADR TYPE" />
                        <Form.Item className='mb-0' name="adrType" rules={rules}>
                            <Select {...selectSm} options={options.adrType} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                    {/* informant */}
                    <Col span={12}>
                        <GenFormItemLabel label="การให้ข้อมูล" />
                        <Form.Item className='mb-0' name="informant">
                            <Select {...selectSm} options={options.informant} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                    {/* alevel */}
                    <Col span={18}>
                        <GenFormItemLabel required={true} label="ระดับความรุนแรง" />
                        <Form.Item className='mb-0' name="alevel" rules={rules}>
                            <Select {...selectSm} options={options.allergyLevels} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                    {/* adrDate */}
                    <Col span={6}>
                        <GenFormItemLabel label="วันที่เกิดอาการ" />
                        <Form.Item className='mb-0' name="adrDate">
                            <DayjsDatePicker
                                size={size}
                                name="adrDate"
                                form={form}
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                            />
                        </Form.Item>
                    </Col>
                    {/* userEvaluated */}
                    <Col span={18}>
                        <GenFormItemLabel label="ผู้ประเมิน" />
                        <Form.Item className='mb-0' name="userEvaluated">
                            <Select {...selectSm} options={options.userEvaluated} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                    {/* dateEvaluated */}
                    <Col span={6}>
                        <GenFormItemLabel label="วันที่รายงาน" />
                        <Form.Item className='mb-0' name="dateEvaluated">
                            <DayjsDatePicker
                                size={size}
                                name="dateEvaluated"
                                form={form}
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                            />
                        </Form.Item>
                    </Col>
                    {/* informhosp */}
                    <Col span={12}>
                        <GenFormItemLabel label="โรงพยาบาลที่ให้ข้อมูล" />
                        <Form.Item className='mb-0' name="informhosp">
                            <Select {...selectSm} options={hospCode} loading={loadingHospCode} />
                        </Form.Item>
                    </Col>
                    {/* workId */}
                    <Col span={12}>
                        <GenFormItemLabel label="หน่วยงาน" />
                        <Form.Item className='mb-0' name="workId">
                            <Select {...selectSm} options={options.works} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                    {/* newFlag */}
                    <Col span={12}>
                        <GenFormItemLabel label="ผู้ป่วยเก่า/ใหม่" />
                        <Form.Item className='mb-0' name="newFlag">
                            <Select {...selectSm} options={options.newFlag} loading={loadingDropdownDowloaded} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Spin>
    </Modal>
}
const apis = {
    GetDrugComponent: {
        url: "Masters/GetDrugComponent",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetAllergyLevels: {
        url: "DrugAllergies/GetAllergyLevelsMas?MeaningFlag=1",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetAdrType: {
        url: "Masters/GetAdrType",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetUserEvaluated: {
        url: "TbPtDgAdrs/GetUserEvaluatedDropdown",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetHospcodes: {
        url: "Masters/GetHospcodes",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetAllergySymptoms: {
        url: "Masters/GetAllergySymptoms",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetTypedxMas: {
        url: "Masters/GetTypedxMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetDropDownMas: {
        url: "Masters/GetDropDownMas",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetWorkPlacesMas: {
        url: "Masters/GetWorkPlacesMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetNewFlag: {
        url: "Masters/GetNewFlag",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    UpSertDrugComponentAllegies: {
        url: "DrugAllergies/UpSertDrugComponentAllegies",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}