
import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { map, find, filter, toNumber, uniqBy, intersectionBy, differenceBy, sortBy, groupBy, isBoolean } from "lodash";
import {
    Modal, Form, Select, Input, Checkbox,
    InputNumber, Radio, Col, ConfigProvider,
    TimePicker
} from 'antd'
import {
    LabelTopicPrimary18,
    LabelText
} from "components/helper/function/GenLabel"
import DayjsDatePicker from "components/DatePicker/DayjsDatePicker";
import GenRow from 'components/helper/function/GenRow'
import { callApi } from 'components/helper/function/CallApi';
import { notificationX as noti, notiError, notiSuccess } from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import thTH from "antd/lib/locale/th_TH";
import SelectHospCode from "components/Input/SelectHospCode"

const dateFrmtFromApi = "MM/DD/YYYY HH:mm:ss";
const dateFrmtForApi = "YYYY-MM-DD HH:mm:ss";

const fieldsForClcScore = [
    {
        type: "vs",
        fieldMain: "bodyTemperature",
        fieldScore: "temperatureScore",
    },
    {
        type: "vs",
        fieldMain: "bpSystolic",
        fieldScore: "systolicScore",
    },
    {
        type: "vs",
        fieldMain: "pulse",
        fieldScore: "pulseScore",
    },
    {
        type: "vs",
        fieldMain: "respiratory",
        fieldScore: "respiratoryScore",
    },
    {
        type: "vs",
        fieldMain: "neuro",
        fieldScore: "neuroScore",
    },
    {
        type: "ur",
        fieldMain: "urineDay",
        fieldScore: "urineDayScore",
    },
    {
        type: "ur",
        fieldMain: "urineEightH",
        fieldScore: "urine8HScore",
    },
    {
        type: "ur",
        fieldMain: "urineFourH",
        fieldScore: "urine4HScore",
    },
    {
        type: "ur",
        fieldMain: "urineOneH",
        fieldScore: "urine1HScore",
    },
]

export default function SosScore({
    visible = false,
    setVisible = () => { },
    clinicDetails = null,
    sosScoreDetails = () => { },
    opdipd = "O",
    calculatedResult = () => { },
    reload = false,
}) {
    const {
        selectPatient
    } = useSelector(({
        patient
    }) => patient);

    const [form] = Form.useForm()
    const [, setLoading] = useState(false)
    const [nurseNote, setNurseNote] = useState([])

    const upsertOpdSosScore = async (dts) => {
        setLoading(true)
        const res = await callApi(listApi, "UpsertOpdSosScore", dts)
        setLoading(false)
        // noti(res?.isSuccess, "บันทึกการประเมิน SOS score")
        if (res?.isSuccess) notiSuccess({ message: "บันทึกการประเมิน SOS score" })
        if (!res?.isSuccess) notiError({ message: "บันทึกการประเมิน SOS score" })
        if (res?.isSuccess) getOpdSosScore(clinicDetails)
    }

    const onFinish = (dts) => {
        const req = {
            ...dts,
            patientId: clinicDetails?.patientId,
            clinicId: opdipd === "O" ? clinicDetails?.clinicId : null,
            admitId: opdipd === "I" ? selectPatient.admitId : null,
            timeLineDate: formatDateForApi(dts?.timeLineDate),
            sos1Date: formatDateForApi(dts?.sos1Date),
            sos2Date: formatDateForApi(dts?.sos2Date),
            triageTime: formatDateForApi(dts?.triageTime),
            reportTime: formatDateForApi(dts?.reportTime),
            atbTime: formatDateForApi(dts?.atbTime),
            receiveOrderTime: formatDateForApi(dts?.receiveOrderTime),
            hcTime: formatDateForApi(dts?.hcTime),
            ivTime: formatDateForApi(dts?.ivTime),
            inotropeTime: formatDateForApi(dts?.inotropeTime),
            sendOrderTime: formatDateForApi(dts?.sendOrderTime),
            medicineTime: formatDateForApi(dts?.medicineTime),
            drugAtbTime: formatDateForApi(dts?.drugAtbTime),
            labTime: formatDateForApi(dts?.labTime),
            cbcTime: formatDateForApi(dts?.cbcTime),
            icuTime: formatDateForApi(dts?.icuTime),
            referTime: formatDateForApi(dts?.referTime),
            arrivalTime: formatDateForApi(dts?.arrivalTime),
        }
        const cleanUp = cleanUpData(req)
        upsertOpdSosScore(cleanUp)
    }

    const getOpdSosScore = async (dts) => {
        if (!dts) return
        form.resetFields()
        const req = {
            patientId: dts?.patientId,
            clinicId: opdipd === "O" ? dts?.clinicId : null,
            admitId: opdipd === "I" ? selectPatient.admitId : null
        }
        setLoading(true)
        const res = await callApi(listApi, "GetOpdSosScore", req);
        setLoading(false)
        if (res?.length) {
            formDefault(res[0])
            sosScoreDetails(res[0])
            return
        }
        if (!res?.length) {
            sosScoreDetails(null)
            if (clinicDetails) {
                const dts = {
                    bodyTemperature: clinicDetails?.bodyTemperature,
                    bpSystolic: clinicDetails?.bpSystolic,
                    pulse: clinicDetails?.pulse,
                    respiratory: clinicDetails?.respiratory,
                    neuro: clinicDetails?.neuro,
                }
                formDefault(dts)
            }
        }
    }

    const cleanUpData = (dts) => {
        let temp = dts
        let size = Object.keys(temp).length;
        for (let i = 0; i < size; i++) {
            let value = Object.values(temp)[i]
            if (isBoolean(value)) value = value ? "Y" : null
            temp[Object.keys(temp)[i]] = value || null;
        }
        return temp
    }

    const clcScore = (fieldMain, fieldScore, value) => {
        if (!value) return form.setFieldsValue({ [fieldScore]: null })
        let temp = toNumber(value)
        let score = "0"
        switch (fieldMain) {
            case "bodyTemperature":
                if (temp >= 35.1 && temp <= 36) score = "1"
                if (temp >= 38.1 && temp <= 38.4) score = "1"
                if (temp <= 35) score = "2"
                if (temp >= 38.5) score = "2"
                break;
            case "bpSystolic":
                if (temp >= 91 && temp <= 100) score = "1"
                if (temp >= 181 && temp <= 199) score = "1"
                if (temp >= 81 && temp <= 90) score = "2"
                if (temp >= 200) score = "2"
                if (temp <= 80) score = "3"
                break;
            case "pulse":
                if (temp >= 41 && temp <= 50) score = "1"
                if (temp >= 101 && temp <= 120) score = "1"
                if (temp >= 121 && temp <= 139) score = "2"
                if (temp <= 40) score = "3"
                if (temp >= 140) score = "3"
                break;
            case "respiratory":
                if (temp >= 21 && temp <= 25) score = "1"
                if (temp >= 26 && temp <= 34) score = "2"
                if (temp <= 8) score = "3"
                if (temp >= 35) score = "3"
                break;
            case "neuro":
                if (value === "C") score = "1"
                if (value === "A") score = "0"
                if (value === "V") score = "1"
                if (value === "P") score = "2"
                if (value === "U") score = "3"
                break;
            case "urineDay":
                if (temp >= 501 && temp <= 999) score = "1"
                if (temp <= 500) score = "2"
                break;
            case "urineEightH":
                if (temp >= 161 && temp <= 319) score = "1"
                if (temp <= 160) score = "2"
                break;
            case "urineFourH":
                if (temp >= 81 && temp <= 159) score = "1"
                if (temp <= 80) score = "2"
                break;
            case "urineOneH":
                if (temp >= 21 && temp <= 39) score = "1"
                if (temp <= 20) score = "2"
                break;
            default: break;
        }
        form.setFieldsValue({ [fieldScore]: score })
    }

    const clcSosScore = (formDefault) => {
        let sumVs = 0
        let sumAll = 0
        map(filter(fieldsForClcScore, ["type", "vs"]), o => {
            const score = toNumber(form.getFieldValue(o.fieldScore) || 0)
            sumVs = sumVs + score
        })
        map(fieldsForClcScore, o => {
            const score = toNumber(form.getFieldValue(o.fieldScore) || 0)
            sumAll = sumAll + score
        })
        form.setFieldsValue({
            sosScore: String(sumVs),
            sosUrine: String(sumAll),
        })
        const nurseNoteCase = {
            case01: ["Record V/S ทุก 4 ชม.", "I/O ทุก 8 ชม.", "ประเมิน SOS score ทุก 4 ชม."],
            case23: ["Record V/S ทุก 2 ชม. I/O ทุก 4 ชม.", "ประเมิน SOS score ทุก 2 ชม.", "เจาะเลือด ส่ง Lactate"],
            case4: ["รายงานแพทย์ทันที", "Record V/S ทุก 30 นาที I/O ทุก 2 ชม.", "ติดตาม SOS < 4 ทำตาม protocol sepsis", "เจาะเลือด ส่ง Lactate", "ถ้า SOS score ≥6 ติดต่อ admit ICU/semi"],
        }
        let nurseNote = ""
        if (sumVs <= 1) nurseNote = nurseNoteCase.case01
        if (sumVs <= 3) nurseNote = nurseNoteCase.case23
        if (sumVs >= 4) nurseNote = nurseNoteCase.case4
        if (formDefault) {
            calculatedResult({
                sosScore: String(sumVs),
                sosUrine: String(sumAll),
                nurseNote: nurseNote,
            })
        }
        return setNurseNote(nurseNote)
    }

    const manageDtsForClc = (dts, formDefault) => {
        map(fieldsForClcScore, o => clcScore(o.fieldMain, o.fieldScore, dts[o.fieldMain]))
        clcSosScore(formDefault)
    }

    const formatDateForApi = (date) => {
        if (!date) return null
        const temp = dayjs(date).format(dateFrmtForApi)
        return temp
    }

    const dateForDayjs = (v) => {
        if (!v) return null;
        return dayjs(v, dateFrmtFromApi)
    }

    const formDefault = (dts) => {
        const temp = {
            ...dts,
            timeLineDate: dateForDayjs(dts?.timeLineDate),
            sos1Date: dateForDayjs(dts?.sos1Date),
            sos2Date: dateForDayjs(dts?.sos2Date),
            triageTime: dateForDayjs(dts?.triageTime),
            reportTime: dateForDayjs(dts?.reportTime),
            atbTime: dateForDayjs(dts?.atbTime),
            receiveOrderTime: dateForDayjs(dts?.receiveOrderTime),
            hcTime: dateForDayjs(dts?.hcTime),
            ivTime: dateForDayjs(dts?.ivTime),
            inotropeTime: dateForDayjs(dts?.inotropeTime),
            sendOrderTime: dateForDayjs(dts?.sendOrderTime),
            medicineTime: dateForDayjs(dts?.medicineTime),
            drugAtbTime: dateForDayjs(dts?.drugAtbTime),
            labTime: dateForDayjs(dts?.labTime),
            cbcTime: dateForDayjs(dts?.cbcTime),
            icuTime: dateForDayjs(dts?.icuTime),
            referTime: dateForDayjs(dts?.referTime),
            arrivalTime: dateForDayjs(dts?.arrivalTime),
        }
        form.setFieldsValue(temp)
        manageDtsForClc(dts, true)
    }

    const handleChangeUrine = () => {
        const values = form.getFieldsValue()
        const temp = {
            bodyTemperature: values?.bodyTemperature || null,
            bpSystolic: values?.bpSystolic || null,
            pulse: values?.pulse || null,
            respiratory: values?.respiratory || null,
            neuro: values?.neuro || null,
            urineDay: values?.urineDay || null,
            urineEightH: values?.urineEightH || null,
            urineFourH: values?.urineFourH || null,
            urineOneH: values?.urineOneH || null,
        }
        manageDtsForClc(temp)
    }

    useEffect(() => {
        getOpdSosScore(clinicDetails)
    }, [reload, clinicDetails])

    const GenFormItem = (items, fieldName) => {
        let fndByName = find(items, ["name", fieldName]);
        if (!fndByName) return;
        const {
            name,
            label,
            inputType,
            rules = [],
            checkBoxLabel,
            radioLabel,
            options = [],
            placeholder,
            format = "DD/MM/YYYY",
            rows = 1,
            disabled,
            loading = false,
            addonBefore = undefined,
            addonAfter = undefined,
            onChange = () => { },
            onClick = () => { },
            showTime = false,
            status,
            style = {},
            allowClear = false,
            form = undefined,
            size = "",
        } = fndByName;

        const genInput = () => {
            switch (inputType) {
                case "select":
                    return (
                        <Select
                            size={size}
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            className="data-value"
                            style={{ width: "100%" }}
                            placeholder={placeholder}
                            options={options || []}
                            dropdownMatchSelectWidth={345}
                            disabled={disabled}
                            loading={loading}
                            onChange={onChange}
                        />
                    );
                case "textarea":
                    return (
                        <Input.TextArea
                            className="data-value"
                            rows={rows || 1}
                            placeholder={placeholder}
                            disabled={disabled}
                            onChange={onChange}
                        />
                    );
                case "checkbox":
                    return (
                        <Checkbox disabled={disabled} onChange={onChange}>
                            <LabelText text={checkBoxLabel} />
                        </Checkbox>
                    );
                case "input":
                    return (
                        <Input
                            size={size}
                            className="data-value"
                            style={{ width: "100%" }}
                            placeholder={placeholder}
                            disabled={disabled}
                            onChange={onChange}
                            addonBefore={addonBefore}
                            addonAfter={addonAfter}
                        />
                    );
                case "inputnumber":
                    return (
                        <InputNumber
                            size={size}
                            className="data-value"
                            style={{ width: "100%", ...style }}
                            stringMode
                            placeholder={placeholder}
                            controls={false}
                            disabled={disabled}
                            addonBefore={addonBefore}
                            addonAfter={addonAfter}
                            status={status}
                            onChange={onChange}
                        />
                    );
                case "radio":
                    return (
                        <Radio
                            className="data-value"
                            onChange={onChange}
                            onClick={onClick}
                        >
                            {radioLabel}
                        </Radio>
                    );
                case "radiogroup":
                    return (
                        <Radio.Group
                            className="data-value"
                            options={options}
                            onChange={onChange}
                        />
                    );
                case "datepicker":
                    return (
                        <DayjsDatePicker
                            size={size}
                            className="data-value"
                            form={form}
                            name={name}
                            style={{ width: "100%" }}
                            format={format}
                            showTime={showTime}
                            allowClear={allowClear}
                            locale="th"
                            disabled={disabled}
                            onChange={onChange}
                        />
                    );
                case "timepicker":
                    return (
                        <TimePicker
                            className="data-value"
                            style={{ width: "100%" }}
                            format={"HH:mm"}
                            size={size}
                        />
                    );
                case "selectHospCode":
                    return <SelectHospCode
                        disabled={disabled}
                        size={size}
                        value={form.getFieldValue(name)}
                    />
                default: break;
            }
        };

        return <Form.Item
            name={name}
            label={label ? <LabelText text={label} /> : false}
            rules={rules}
            valuePropName={inputType === "checkbox" ? "checked" : undefined}
            style={{ marginBottom: 4 }}
        >
            {genInput()}
        </Form.Item>
    };

    const PartsFormLeft = () => {
        const optionsNeuro = [
            {
                value: "C",
                label: "C สับสนกระสับกระส่าย",
                className: "data-value",
            },
            {
                value: "A",
                label: "A ตื่นดีพูดคุยรู้เรื่อง",
                className: "data-value",
            },
            {
                value: "V",
                label: "V ซึมแต่เรียกแล้วลืมตา",
                className: "data-value",
            },
            {
                value: "P",
                label: "P ซึมมากต้องกระตุ้นจึงลืมตา",
                className: "data-value",
            },
            {
                value: "U",
                label: "U ไม่รู้สึกตัวแม้กระตุ้นแล้ว",
                className: "data-value",
            },
        ]
        const items = [
            // bodyTemperature
            {
                name: "bodyTemperature",
                label: "อุณหภูมิ BT ํC",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // temperatureScore
            {
                name: "temperatureScore",
                label: "คะแนนของผู้ป่วย",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // bpSystolic
            {
                name: "bpSystolic",
                label: "ความดนโลหิต (ค่าบน) Sys BP",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // systolicScore
            {
                name: "systolicScore",
                label: " ",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // pulse
            {
                name: "pulse",
                label: "ชีพจร HR",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // pulseScore
            {
                name: "pulseScore",
                label: " ",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // respiratory
            {
                name: "respiratory",
                label: "หายใจ RR",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // respiratoryScore
            {
                name: "respiratoryScore",
                label: " ",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // neuro
            {
                name: "neuro",
                label: "ความรู้สึก Neuro",
                inputType: "select",
                // rules: rules,
                // disabled: true,
                options: optionsNeuro,
                onChange: () => handleChangeUrine(),
            },
            // neuroScore
            {
                name: "neuroScore",
                label: " ",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // urineDay
            {
                name: "urineDay",
                label: "ปัสสาวะ/วัน",
                inputType: "inputnumber",
                // rules: rules,
                // disabled: true,
                onChange: () => handleChangeUrine(),
            },
            // urineEightH
            {
                name: "urineEightH",
                label: "ปัสสาวะ/8 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                // disabled: true,
                onChange: () => handleChangeUrine(),
            },
            // urineFourH
            {
                name: "urineFourH",
                label: "ปัสสาวะ/4 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                // disabled: true,
                onChange: () => handleChangeUrine(),
            },
            // urineOneH
            {
                name: "urineOneH",
                label: "ปัสสาวะ/1 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                // disabled: true,
                onChange: () => handleChangeUrine(),
            },
            // urineDayScore
            {
                name: "urineDayScore",
                // label: false,
                placeholder: "Score/วัน",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // urine8HScore
            {
                name: "urine8HScore",
                // label: "ปัสสาวะ/8 ชม.",
                placeholder: "Score/8 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // urine4HScore
            {
                name: "urine4HScore",
                // label: "ปัสสาวะ/4 ชม.",
                placeholder: "Score/4 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // urine1HScore
            {
                name: "urine1HScore",
                // label: "ปัสสาวะ/1 ชม.",
                placeholder: "Score/1 ชม.",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // sosScore
            {
                name: "sosScore",
                // label: "คะแนน SOS",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // sosUrine
            {
                name: "sosUrine",
                // label: "คะแนน SOS",
                inputType: "inputnumber",
                // rules: rules,
                disabled: true,
            },
            // sosSum
            {
                name: "sosSum",
                inputType: "textarea",
                // rules: rules,
                disabled: true,
                rows: 4,
            },
        ]
        return <Form form={form} onFinish={onFinish} layout='vertical'>
            <Form.Item hidden name="opdSosscoreId">
                <Input />
            </Form.Item>
            <GenRow>
                <Col span={10}>{GenFormItem(items, "bodyTemperature")}</Col>
                <Col span={8}>{GenFormItem(items, "temperatureScore")}</Col>
                <Col span={10}>{GenFormItem(items, "bpSystolic")}</Col>
                <Col span={8}>{GenFormItem(items, "systolicScore")}</Col>
                <Col span={10}>{GenFormItem(items, "pulse")}</Col>
                <Col span={8}>{GenFormItem(items, "pulseScore")}</Col>
                <Col span={10}>{GenFormItem(items, "respiratory")}</Col>
                <Col span={8}>{GenFormItem(items, "respiratoryScore")}</Col>
                <Col span={10}>{GenFormItem(items, "neuro")}</Col>
                <Col span={8}>{GenFormItem(items, "neuroScore")}</Col>
            </GenRow>
            <GenRow>
                <Col span={6}>{GenFormItem(items, "urineDay")}</Col>
                <Col span={6}>{GenFormItem(items, "urineEightH")}</Col>
                <Col span={6}>{GenFormItem(items, "urineFourH")}</Col>
                <Col span={6}>{GenFormItem(items, "urineOneH")}</Col>
            </GenRow>
            <GenRow>
                <Col span={6}>{GenFormItem(items, "urineDayScore")}</Col>
                <Col span={6}>{GenFormItem(items, "urine8HScore")}</Col>
                <Col span={6}>{GenFormItem(items, "urine4HScore")}</Col>
                <Col span={6}>{GenFormItem(items, "urine1HScore")}</Col>
            </GenRow>
            <LabelTopicPrimary18 text='Nurse record V/S as usual + ประเมิน SOS' className='mb-1' />
            <GenRow>
                <Col span={8}>
                    <GenRow align="middle">
                        <Col span={13}>
                            <LabelText text='SOS Score' />
                        </Col>
                        <Col span={11}>
                            {GenFormItem(items, "sosScore")}
                        </Col>
                        <Col span={13}>
                            <LabelText text='SOS+Urine' />
                        </Col>
                        <Col span={11}>
                            {GenFormItem(items, "sosUrine")}
                        </Col>
                    </GenRow>
                </Col>
                <Col span={16} style={{ backgroundColor: "#fafafa" }}>
                    {
                        map(nurseNote, (o, i) => {
                            return <LabelText key={String(i)} text={`- ${o}`} className='d-block' />
                        })
                    }
                </Col>
            </GenRow>
        </Form>
    }
    const PartsFormRight = () => {
        const items = [
            // timeLineDate
            {
                name: "timeLineDate",
                // label: "วันที่",
                inputType: "datepicker",
                size: "small",
                allowClear: true,
                // rules: rules,
                // disabled: true,
            },
            // scpsis
            {
                name: "scpsis",
                // label: "เริ่ม Protocol scpsis ที่รพ.",
                inputType: "input",
                size: "small",
                // rules: rules,
                // disabled: true,
            },
            // location
            {
                name: "location",
                // label: "สถานที่:ER/OPD",
                inputType: "input",
                size: "small",
                // rules: rules,
                // disabled: true,
            },
            // ward
            {
                name: "ward",
                // label: "Ward",
                inputType: "input",
                size: "small",
                // rules: rules,
                // disabled: true,
            },
            // icU1
            {
                name: "icU1",
                // label: "Ward",
                inputType: "input",
                size: "small",
                // rules: rules,
                // disabled: true,
            },
            // icU2
            {
                name: "icU2",
                // label: "Ward",
                inputType: "input",
                size: "small",
                // rules: rules,
                // disabled: true,
            },
            // triageTime
            {
                name: "triageTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // reportTime
            {
                name: "reportTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // atbTime
            {
                name: "atbTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // receiveOrderTime
            {
                name: "receiveOrderTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // hcTime
            {
                name: "hcTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // ivTime
            {
                name: "ivTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // inotropeTime
            {
                name: "inotropeTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // sendOrderTime
            {
                name: "sendOrderTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // medicineTime
            {
                name: "medicineTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // drugAtbTime
            {
                name: "drugAtbTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // labTime
            {
                name: "labTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // cbcTime
            {
                name: "cbcTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // sos1Date
            {
                name: "sos1Date",
                // label: "Ward",
                inputType: "datepicker",
                size: "small",
                addonAfter: "น.",
                allowClear: true,
                // rules: rules,
                // disabled: true,
            },
            // sos2Date
            {
                name: "sos2Date",
                // label: "Ward",
                inputType: "datepicker",
                size: "small",
                addonAfter: "น.",
                allowClear: true,
                // rules: rules,
                // disabled: true,
            },
            // icuTime
            {
                name: "icuTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // admitMICUSemiICUWard
            {
                name: "admitMICUSemiICUWard",
                // label: "Ward",
                inputType: "input",
                size: "small",
                // addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // referHosp
            {
                name: "referHosp",
                inputType: "selectHospCode",
                size: "small",
                form: form,
            },
            // referTime
            {
                name: "referTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
            // arrivalTime
            {
                name: "arrivalTime",
                // label: "Ward",
                inputType: "timepicker",
                size: "small",
                addonAfter: "น."
                // rules: rules,
                // disabled: true,
            },
        ]
        return <Form form={form} onFinish={onFinish}>
            <LabelTopicPrimary18 text='Timeline' />
            <div className='ps-3 pe-3 pt-2'>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -30 }} align="middle">
                    <Col span={14} className='text-end'><LabelText text="วันที่ :" className='me-3' /></Col>
                    <Col span={10}>{GenFormItem(items, "timeLineDate")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={14} className='text-end'><LabelText text="เริ่ม Protocol scpsis ที่รพ. :" className='me-3' /></Col>
                    <Col span={10}>{GenFormItem(items, "scpsis")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={14} className='text-end'><LabelText text="สถานที่:ER/OPD :" className='me-3' /></Col>
                    <Col span={10}>{GenFormItem(items, "location")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={14} className='text-end'><LabelText text="Ward :" className='me-3' /></Col>
                    <Col span={10}>{GenFormItem(items, "ward")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={4} className='text-end'><LabelText text="ICU :" className='me-3' /></Col>
                    <Col span={8}>{GenFormItem(items, "icU1")}</Col>
                    <Col span={4} className='text-center'><LabelText text="/" /></Col>
                    <Col span={8}>{GenFormItem(items, "icU2")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="Triage เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "triageTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="รายงานแพทย์ เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "reportTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="รับ Order เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "receiveOrderTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="เจาะ H/C เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "hcTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="Load IV Fluid เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "ivTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="ให้ inotrope เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "inotropeTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="ยื่น Order ที่ห้องยา เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "sendOrderTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="รับยาจากเภสัช เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "medicineTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="ผู้ป่วยได้ยา ATB เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "drugAtbTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="Specimen ถึงห้อง Lab เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "labTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="ผล CBC ออกเวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "cbcTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="SOS 1 :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "sos1Date")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="SOS 2 :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "sos2Date")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="ติดต่อ ICU/semiICU at :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "icuTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="Admit MICU/SemiICU/ward :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "admitMICUSemiICUWard")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={6} className='text-end'><LabelText text="Refer รพ. :" className='me-3' /></Col>
                    <Col span={6}>{GenFormItem(items, "referHosp")}</Col>
                    <Col span={5} className='text-center'><LabelText text="เวลา :" /></Col>
                    <Col span={7}>{GenFormItem(items, "referTime")}</Col>
                </GenRow>
                <GenRow style={{ paddingTop: -6, paddingBottom: -6, marginTop: -14 }} align="middle">
                    <Col span={17} className='text-end'><LabelText text="กรณีrefer: ถึง รพ.ปลายทาง เวลา :" className='me-3' /></Col>
                    <Col span={7}>{GenFormItem(items, "arrivalTime")}</Col>
                </GenRow>
            </div>
        </Form>
    }
    return <Modal
        title={<LabelTopicPrimary18 text='การประเมิน SOS score & Timeline Severe sepsis/ Septic shock' />}
        centered
        visible={visible}
        width={1000}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => { form.submit() }}
        onCancel={() => setVisible(false)}
    >
        <ConfigProvider locale={thTH}>
            <div style={{ margin: -18 }}>
                <GenRow gutter={[8, 8]}>
                    <Col span={11}>
                        {PartsFormLeft()}
                    </Col>
                    <Col span={13} style={{ backgroundColor: "#FAFAFA" }}>
                        {PartsFormRight()}
                    </Col>
                </GenRow>
            </div>
        </ConfigProvider>
    </Modal>
}
const listApi = [
    // GetOpdSosScore
    {
        name: "GetOpdSosScore",
        url: "EmergencyRoom/GetOpdSosScore",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // UpsertOpdSosScore
    {
        name: "UpsertOpdSosScore",
        url: "EmergencyRoom/UpsertOpdSosScore",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    // GetHospcodes
    {
        name: "GetHospcodes",
        url: "Masters/GetHospcodes",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
]
