import React from 'react'
import { filter, map, find } from 'lodash'
import { Button, Col, notification, Row, } from 'antd';
import { LabelText, LabelTopic, } from 'components/helper/function/GenLabel.js';

export const notiDrugAllergy = ({
    details,
    expenseName,
    drugGroupName,
    title = "แจ้งเตือนแพ้ยา !",
    alevel = "alevelName",
    symptom = "symptom",
    otherSymptom = "otherSymptom",
    onCancel = () => { },
}) => {
    const key = "drugAlertsAdr"
    const btn = (
        <Row gutter={[4, 4]}>
            <Col>
                <Button className='mb-0 me-2' onClick={() => {
                    onCancel(details)
                    notification.close(key)
                    notification.close("drugAlertsDi")
                }}
                >
                    ยกเลิก
                </Button>
            </Col>
            <Col>
                <Button className='mb-0' onClick={() => notification.close(key)}>
                    ยืนยัน
                </Button>

            </Col>
        </Row>
    );
    const noti = (details) => {
        const description = <Row gutter={[4, 4]}>
            <Col span={24} hidden={!drugGroupName}>
                <label className='text-light data-value d-block'>
                    <b>กลุ่มยา :</b> {details?.[drugGroupName]}
                </label>
                <label className='text-light data-value'>
                    <b>ซึ่งยา :</b> {expenseName} <b>อยู่ในกลุ่มนี้</b>
                </label>
            </Col>
            <Col span={24}>
                <label className='text-light data-value'>
                    <b>รายละเอียด :</b> {details[otherSymptom]}
                </label>
            </Col>
            <Col span={24}>
                <label className='text-light data-value'>
                    <b>อาการ :</b> {details[symptom]}
                </label>
            </Col>
            <Col span={24}>
                <label className='text-light data-value'>
                    <b>ความรุนแรง :</b> {details[alevel]}
                </label>
            </Col>
            {
                details?.lockDoNotOrder === "Y" && <Col span={24}>
                    <label className='text-light fs-5 fw-bold'>Lock ห้ามสั่ง !</label>
                </Col>
            }
        </Row>
        notification.open({
            // closeIcon: false,
            message: <label className='text-light fs-5 fw-bold'>{title}</label>,
            description,
            btn,
            key,
            // duration: details?.lockDoNotOrder === "Y" ? 0 : 10,
            duration: 0,
            style: { width: 545, backgroundColor: "#ef5350" },
            onClose: () => notification.close(key),
        });
    }
    noti(details)
}
export const notiDi = ({
    expenseId = null,
    expenses = [],
    drugInteractions = [],
}) => {
    if (!expenseId) return
    const key = "drugAlertsDi"
    const filterByExpenseId = filter(drugInteractions, ['expenseid', expenseId])
    const filterNoExpenseId = filter(drugInteractions, o => o?.expenseid !== expenseId)
    const btn = (
        <Button className='mb-0' onClick={() => {
            notification.close(key)
            notification.close("drugAlertsAdr")
        }}>
            ยืนยัน
        </Button>
    );
    const noti = (findDi) => {
        const description = <Row gutter={[4, 4]}>
            <Col span={24}>
                <label className='data-value'>
                    <b>กับยา :</b> {find(expenses, ["expenseId", findDi.expenseid])?.expenseName}
                    <b>{findDi?.oldDrug === "Y" ? "(ยาเก่า)" : ""}</b>
                </label>
            </Col>
            <Col span={24}>
                <LabelTopic className='me-1' text='ยา :' />
                <LabelText className='me-1' text={findDi.generic1} />
                <LabelText className='me-1' text={"+"} />
                <LabelTopic className='me-1' text='ยา :' />
                <LabelText className='me-1' text={findDi.generic2} />
            </Col>
            <Col span={24}>
                <label className='data-value'>
                    <b>Mechanism :</b> {findDi.mechanism}
                </label>
            </Col>
            <Col span={24}>
                <label className='data-value'>
                    <b>Management :</b> {findDi.management}
                </label>
            </Col>
            {
                findDi?.lockDoNotOrder === "Y" && <Col span={24}>
                    <label className='text-danger fs-5 fw-bold'>Lock ห้ามสั่ง !</label>
                </Col>
            }
        </Row>
        notification.open({
            // closeIcon: false,
            message: <label className='text-warning fs-5 fw-bold'>แจ้งเตือน Drug Interaction !</label>,
            description,
            btn,
            key,
            // duration: findDi?.lockDoNotOrder === "Y" ? 0 : 10,
            duration: 0,
            style: { width: 545, backgroundColor: "#FFF59D" },
            onClose: () => notification.close(key),
        });
    }
    map(filterByExpenseId, o => {
        const findDi = find(filterNoExpenseId, ['diid', o.diid])
        if (findDi) noti(findDi)
    })
}
export const chkDrugAlertReMed = (dts = []) => {
    const chk1 = filter(dts, o => !o?.isAlerted) // เช็คว่า Alert และกรอกข้อมูลแล้ว
    if (!chk1.length) return false
    const chk2 = find(filter(chk1, c => !c?.financeId), o => o?.drugGenericAllergy?.length// เช็คว่าต้อง Alert ไหม
        || o?.drugCodeAllergy
        || o?.drugGroupAllergy?.length
        || o?.drugComponentsAllergy?.length
        || o?.allowedDrugAndDoctor
        || o?.allowedDrugAndDocSpecialties
        || o?.drugInteractionsLock
        || o?.dueReport === "Y"
    )
    return chk2 ? true : false
}
export const notiDueRemark = ({
    expenseName,
    remark,
}) => {
    if (!remark) return
    const key = "notiDueRemark"
    const btn = (
        <Button className='mb-0' onClick={() => {
            notification.close(key)
            notification.close("drugAlertsAdr")
        }}>
            ยืนยัน
        </Button>
    );
    const noti = () => {
        const description = <Row gutter={[4, 4]}>
            <Col span={24}>
                <label style={{ fontSize: 17, color: "#004d40" }}>
                    {remark}
                </label>
            </Col>
        </Row>
        notification.open({
            // closeIcon: false,
            message: <label className='data-value'>{expenseName}</label>,
            description,
            btn,
            key,
            // duration: findDi?.lockDoNotOrder === "Y" ? 0 : 10,
            duration: 0,
            style: { width: 545, backgroundColor: "#b3e5fc" },
            onClose: () => notification.close(key),
        });
    }
    return noti()
}
