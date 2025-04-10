/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { Form, Input } from 'antd'
import _map from "lodash/map"
import _intersection from "lodash/intersection"

// ทำเพิ่ม DosingInterval
export default function PrevDrugUsing({
    form,
    prevFormValues = null,
    newDrugUse = null,
    setNewDrugLabel = () => { },
    dosingIntervalRef = null,
    resetFields = false,
}) {
    // console.log('prevFormValues', prevFormValues)
    // console.log('newDrugUse', newDrugUse)
    const [formDrugUseA] = Form.useForm()
    const [formDrugUseB] = Form.useForm()
    const [formDrugUseD] = Form.useForm()
    const [formDrugUseE] = Form.useForm()
    const formDrugUseAItems = [
        "drugUsing", "dose", "dosingUnit", "drugTiming", "dosingTime", "drugAdmin", "alternateDay", "otherDosingInterval", "drugProperty", "drugPropertyFrequency"
        , "drugWarning", "docRemark", "reason", "doctorNote", "sachet", "startDate", "endDate", "drugExpensesInventory", "oldQty", "rate"
        , "amount", "docQty", "credit", "cashReturn", "cashNotReturn", "discount", "genOverRule", "nMon", "nTue", "nWed"
        , "nThu", "nFri", "nSat", "nSun", "nTime1", "nTime2", "nTime3", "nTime4", "nTime5", "nTime6"
        , "nTime7", "nTime8",
    ]
    const formDrugUseBItems = [
        "drugUsing", "doseM", "doseL", "doseN", "doseE", "doseB", "timeM", "timeL",
        "timeN", "timeE", "timeB", "dosingUnit", "dosingTime", "drugAdmin", "alternateDay", "otherDosingInterval", "drugProperty", "drugPropertyFrequency",
        "drugWarning", "docRemark", "reason", "doctorNote", "sachet", "startDate", "endDate", "drugExpensesInventory", "oldQty", "rate"
        , "amount", "docQty", "credit", "cashReturn", "cashNotReturn", "discount", "genOverRule", "nMon", "nTue", "nWed"
        , "nThu", "nFri", "nSat", "nSun", "nTime1", "nTime2", "nTime3", "nTime4", "nTime5", "nTime6"
        , "nTime7", "nTime8",
    ]
    const formDrugUseDItems = [
        "docLabel1", "docLabel2", "docLabel3", "docLabel4",
        "dosingTime", "drugAdmin", "alternateDay", "otherDosingInterval", "drugProperty", "drugPropertyFrequency",
        "drugWarning", "docRemark", "reason", "doctorNote", "sachet", "startDate", "endDate", "drugExpensesInventory", "oldQty", "rate"
        , "amount", "docQty", "credit", "cashReturn", "cashNotReturn", "discount", "genOverRule", "nMon", "nTue", "nWed"
        , "nThu", "nFri", "nSat", "nSun", "nTime1", "nTime2", "nTime3", "nTime4", "nTime5", "nTime6"
        , "nTime7", "nTime8",
    ]
    const formDrugUseEItems = [
        "drugLabel", "dosingTime", "drugAdmin", "alternateDay", "otherDosingInterval", "drugProperty", "drugPropertyFrequency",
        "drugWarning", "docRemark", "reason", "doctorNote", "sachet", "startDate", "endDate", "drugExpensesInventory", "oldQty", "rate"
        , "amount", "docQty", "credit", "cashReturn", "cashNotReturn", "discount", "genOverRule", "nMon", "nTue", "nWed"
        , "nThu", "nFri", "nSat", "nSun", "nTime1", "nTime2", "nTime3", "nTime4", "nTime5", "nTime6"
        , "nTime7", "nTime8",
    ]
    const setPrevValues = () => {
        const allFields = _intersection([...formDrugUseAItems, ...formDrugUseBItems, ...formDrugUseDItems, ...formDrugUseEItems])
        // console.log('allFields', allFields)
        _map(allFields, o => {
            form.setFieldsValue({ [o]: null })
        })
        switch (prevFormValues?.prevDrugUsing) {
            case 'A':
                _map(formDrugUseAItems, o => {
                    formDrugUseA.setFieldsValue({ [o]: prevFormValues?.[o] })
                })
                formDrugUseA.setFieldsValue({
                    dosingInterval: dosingIntervalRef?.current?.getValue(),
                    dosingIntervalDays: dosingIntervalRef?.current?.getChkDays(),
                })
                break;
            case 'B':
                _map(formDrugUseBItems, o => {
                    formDrugUseB.setFieldsValue({ [o]: prevFormValues?.[o] })
                })
                formDrugUseB.setFieldsValue({
                    dosingInterval: dosingIntervalRef?.current?.getValue(),
                    dosingIntervalDays: dosingIntervalRef?.current?.getChkDays(),
                })
                break;
            case 'D':
                _map(formDrugUseDItems, o => {
                    formDrugUseD.setFieldsValue({ [o]: prevFormValues?.[o] })
                })
                formDrugUseD.setFieldsValue({
                    dosingInterval: dosingIntervalRef?.current?.getValue(),
                    dosingIntervalDays: dosingIntervalRef?.current?.getChkDays(),
                })
                break;
            case 'E':
                _map(formDrugUseEItems, o => {
                    formDrugUseE.setFieldsValue({ [o]: prevFormValues?.[o] })
                })
                formDrugUseE.setFieldsValue({
                    dosingInterval: dosingIntervalRef?.current?.getValue(),
                    dosingIntervalDays: dosingIntervalRef?.current?.getChkDays(),
                })
                break;
            default:
                break;
        }
    }
    const onFinishFormDrugUseA = async (v) => {
        // console.log('onFinishFormDrugUseA :>> ', v);
        _map(formDrugUseAItems, o => form.setFieldsValue({ [o]: v?.[o] || null }))
        dosingIntervalRef?.current?.setValue(v?.dosingInterval || undefined)
        dosingIntervalRef?.current?.setChkDays(v?.dosingIntervalDays || [])
        setNewDrugLabel(newDrugUse)
    }
    const onFinishFormDrugUseB = (v) => {
        // console.log('onFinishFormDrugUseB :>> ', v);
        _map(formDrugUseBItems, o => form.setFieldsValue({ [o]: v?.[o] || null }))
        dosingIntervalRef?.current?.setValue(v?.dosingInterval || undefined)
        dosingIntervalRef?.current?.setChkDays(v?.dosingIntervalDays || [])
        setNewDrugLabel(newDrugUse)
    }
    const onFinishFormDrugUseD = (v) => {
        // console.log('onFinishFormDrugUseD :>> ', v);
        _map(formDrugUseDItems, o => form.setFieldsValue({ [o]: v?.[o] || null }))
        dosingIntervalRef?.current?.setValue(v?.dosingInterval || undefined)
        dosingIntervalRef?.current?.setChkDays(v?.dosingIntervalDays || [])
        setNewDrugLabel(newDrugUse)
    }
    const onFinishFormDrugUseE = (v) => {
        // console.log('onFinishFormDrugUseE :>> ', v);
        _map(formDrugUseEItems, o => form.setFieldsValue({ [o]: v?.[o] || null }))
        dosingIntervalRef?.current?.setValue(v?.dosingInterval || undefined)
        dosingIntervalRef?.current?.setChkDays(v?.dosingIntervalDays || [])
        setNewDrugLabel(newDrugUse)
    }
    useEffect(() => {
        if (prevFormValues) {
            setPrevValues()
            switch (newDrugUse) {
                case 'A':
                    formDrugUseA.submit()
                    break;
                case 'B':
                    formDrugUseB.submit()
                    break;
                case 'D':
                    formDrugUseD.submit()
                    break;
                case 'E':
                    formDrugUseE.submit()
                    break;
                default:
                    break;
            }
        }
    }, [newDrugUse])
    useEffect(() => {
        formDrugUseA.resetFields()
        formDrugUseB.resetFields()
        formDrugUseD.resetFields()
        formDrugUseE.resetFields()
    }, [resetFields])

    return (
        <div hidden>
            <Form form={formDrugUseA} onFinish={onFinishFormDrugUseA}>
                <Form.Item name="dosingInterval"><Input /></Form.Item>
                <Form.Item name="dosingIntervalDays"><Input /></Form.Item>
                {
                    _map(formDrugUseAItems, o => <Form.Item name={o} key={o}><Input /></Form.Item>)
                }
            </Form>
            <Form form={formDrugUseB} onFinish={onFinishFormDrugUseB}>
                <Form.Item name="dosingInterval"><Input /></Form.Item>
                <Form.Item name="dosingIntervalDays"><Input /></Form.Item>
                {
                    _map(formDrugUseBItems, o => <Form.Item name={o} key={o}><Input /></Form.Item>)
                }
            </Form>
            <Form form={formDrugUseD} onFinish={onFinishFormDrugUseD}>
                <Form.Item name="dosingInterval"><Input /></Form.Item>
                <Form.Item name="dosingIntervalDays"><Input /></Form.Item>
                {
                    _map(formDrugUseDItems, o => <Form.Item name={o} key={o}><Input /></Form.Item>)
                }
            </Form>
            <Form form={formDrugUseE} onFinish={onFinishFormDrugUseE}>
                <Form.Item name="dosingInterval"><Input /></Form.Item>
                <Form.Item name="dosingIntervalDays"><Input /></Form.Item>
                {
                    _map(formDrugUseEItems, o => <Form.Item name={o} key={o}><Input /></Form.Item>)
                }
            </Form>
        </div>
    )
}
