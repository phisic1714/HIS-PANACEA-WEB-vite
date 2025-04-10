import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';
import _uniqBy from "lodash/uniqBy"
import _find from "lodash/find"
import { Checkbox, Col, Form, Input, Modal, Row, Select, Spin } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import {
    LabelTopicPrimary18,
    GenFormItemLabel,
} from 'components/helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
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
export default function PtCodeAdrs({
    patientId = null,
    runHn = null,
    yearHn = null,
    hn = null,
    visible = false,
    onCancel = () => { },
    defaultPtCodeAdrs = null,
    isFinished = () => { },
}) {
    const dispatch = useDispatch();
    const { hospCode } = useSelector(({ getDropdownMaster }) => getDropdownMaster);
    // Form
    const [form] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [loadingHospCode, setLoadingHospCode] = useState(false)
    const [isDropdownDowloaded, setIsDropdownDowloaded] = useState(false)
    const [options, setOptions] = useState({
        expenses: [],
        symptoms: [],
        typeDx: [],
        informant: [],
        allergyLevels: [],
        userEvaluated: [],
        works: [],
        newFlag: [],
    })
    // Funcs
    const upsert = async (req) => {
        setLoading(p => !p)
        let res
        if (!req?.ptCodeAdrId) res = await callApis(apis["InsTbPtCodeAdrs"], req)
        if (req?.ptCodeAdrId) res = await callApis(apis["UpdTbPtCodeAdrs"], req)
        setLoading(p => !p)
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกข้อมูลแพ้ Code ยา", })
            onCancel()
            isFinished()
            form.resetFields()
        } else notiError({ message: "บันทึกข้อมูลแพ้ Code ยา" })
    }
    const onFinish = (v) => {
        // console.log('onFinish :>> ', v);
        const findCrrExpense = _find(options.expenses, ["expenseId", v.expenseId])
        const req = {
            ...v,
            patientId,
            runHn,
            yearHn,
            hn,
            userCreated: user,
            dateCreated: dayjs().format("YYYY/MM/DD HH:mm:ss"),
            userModified: user,
            dateModified: dayjs().format("YYYY/MM/DD HH:mm:ss"),
            adrDate: v?.adrDate ? dayjs(v.adrDate).format("YYYY/MM/DD HH:mm:ss") : null,
            dateEvaluated: v?.dateEvaluated ? dayjs(v.dateEvaluated).format("YYYY/MM/DD HH:mm:ss") : null,
            lockFlag: v?.lockFlag ? "Y" : null,
            code: findCrrExpense?.code,
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
        let [
            resExpenses,
            resAllergySymptoms,
            resTypeDx,
            informant,
            allergyLevels,
            userEvaluated,
            works,
            newFlag,
        ] = await Promise.all([
            callApis(apis["GetExpensesTypeD"]),
            callApis(apis["GetAllergySymptoms"]),
            callApis(apis["GetTypedxMas"]),
            callApis(apis["GetDropDownMas"], { table: "TB_PATIENT_DRUG_COMPONENT_ALLERGY", field: "INFORMANT" }),
            callApis(apis["GetAllergyLevels"]),
            callApis(apis["GetUserEvaluated"]),
            callApis(apis["GetWorkPlacesMas"]),
            callApis(apis["GetNewFlag"]),
        ])
        resExpenses = _uniqBy(resExpenses, "expenseId");
        resExpenses = mappingOptions({ dts: resExpenses, valueField: "expenseId", labelField: "expenseName", compound: true })
        resAllergySymptoms = mappingOptions({ dts: resAllergySymptoms, compound: true })
        resTypeDx = mappingOptions({ dts: resTypeDx, compound: true })
        informant = mappingOptions({ dts: informant, compound: true })
        allergyLevels = mappingOptions({ dts: allergyLevels, valueField: "code", labelField: "name", compound: true })
        userEvaluated = mappingOptions({ dts: userEvaluated, compound: true })
        works = mappingOptions({ dts: works })
        newFlag = mappingOptions({ dts: newFlag, compound: true })
        setOptions(p => {
            return {
                ...p,
                expenses: resExpenses,
                symptoms: resAllergySymptoms,
                typeDx: resTypeDx,
                informant: informant,
                allergyLevels: allergyLevels,
                userEvaluated: userEvaluated,
                works: works,
                newFlag: newFlag,
            }
        })
    }
    // Helpers
    const defaultForm = (dts) => {
        const dateFormat = "MM/DD/YYYY HH:mm:ss"
        if (!dts) return
        form.setFieldsValue({
            ...dts,
            adrDate: dts?.adrDate ? dayjs(dts.adrDate, dateFormat) : null,
            dateEvaluated: dts?.dateEvaluated ? dayjs(dts.dateEvaluated, dateFormat) : null,
        })
    }
    useEffect(() => {
        if (visible) {
            getOptions()
            getHospCode()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, isDropdownDowloaded])
    useEffect(() => {
        defaultForm(defaultPtCodeAdrs)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultPtCodeAdrs])

    return <Modal
        title={<LabelTopicPrimary18 text='ระบุรายละเอียดแพ้ Code ยา' />}
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
                <Form.Item hidden name="ptCodeAdrId">
                    <Input />
                </Form.Item>
                <Row {...rowProps}>
                    {/* expenseId */}
                    <Col span={11}>
                        <GenFormItemLabel required={true} label="ระบุ Code ยาที่แพ้" />
                        <Form.Item className='mb-0' name="expenseId" rules={rules}>
                            <Select
                                {...selectSm}
                                filterSort={(optionA, optionB) =>
                                    optionA?.label
                                        ?.toLowerCase()
                                        ?.localeCompare(optionB?.label?.toLowerCase())
                                }
                                options={options.expenses}
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
                            />
                        </Form.Item>
                    </Col>
                    {/* adrType */}
                    <Col span={12}>
                        <GenFormItemLabel required={true} label="ADR TYPE" />
                        <Form.Item className='mb-0' name="adrType" rules={rules}>
                            <Select {...selectSm} options={optionsAdrType} />
                        </Form.Item>
                    </Col>
                    {/* informant */}
                    <Col span={12}>
                        <GenFormItemLabel label="การให้ข้อมูล" />
                        <Form.Item className='mb-0' name="informant">
                            <Select {...selectSm} options={options.informant} />
                        </Form.Item>
                    </Col>
                    {/* alevel */}
                    <Col span={18}>
                        <GenFormItemLabel required={true} label="ระดับความรุนแรง" />
                        <Form.Item className='mb-0' name="alevel" rules={rules}>
                            <Select {...selectSm} options={options.allergyLevels} />
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
                            <Select {...selectSm} options={options.userEvaluated} />
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
                            <Select {...selectSm} options={options.works} />
                        </Form.Item>
                    </Col>
                    {/* newFlag */}
                    <Col span={12}>
                        <GenFormItemLabel label="ผู้ป่วยเก่า/ใหม่" />
                        <Form.Item className='mb-0' name="newFlag">
                            <Select {...selectSm} options={options.newFlag} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Spin>
    </Modal>
}
const optionsAdrType = [
    {
        value: 'A',
        label: 'Side Effect',
        className: 'data-value',
    },
    {
        value: 'B',
        label: 'Drug Allergy',
        className: 'data-value',
    }
]
const apis = {
    GetExpensesTypeD: {
        url: "PatientsFinancesDrug/GetOpdExpenseNamefinancesDrug?type=D",
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
    InsTbPtCodeAdrs: {
        url: "TbPtCodeAdrs/InsTbPtCodeAdrs",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    UpdTbPtCodeAdrs: {
        url: "TbPtCodeAdrs/UpdTbPtCodeAdrs",
        method: "PUT",
        return: "data",
        sendRequest: true,
    },

}