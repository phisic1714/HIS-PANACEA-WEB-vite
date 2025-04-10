/* eslint-disable react-hooks/exhaustive-deps */


import doctorMaleOutline from "@iconify/icons-healthicons/doctor-male-outline";
import { Icon } from "@iconify/react";
import {
    Button, Checkbox,
    Col, Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Spin,
    Table,
    notification
} from 'antd';
import Axios from "axios";
import SelectExpenses from 'components/Modal/SelectExpenses';
import { notiError, notiSuccess, notiWarning } from "components/Notification/notificationX";
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
import { AutoIcd } from "components/helper/function/AutoIcd";
import { callApis } from 'components/helper/function/CallApi';
import {
    LabelText,
    LabelTopic,
    LabelTopicPrimary,
    LabelTopicPrimary18
} from "components/helper/function/GenLabel";
import GenRow from "components/helper/function/GenRow";
import { mappingOptions } from "components/helper/function/MappingOptions";
import { PrintFormReport } from "components/qzTray/PrintFormReport";
import dayjs from "dayjs";
import { env } from 'env';
import { map, filter, differenceBy, intersectionBy, uniqBy, find } from "lodash";
import moment from "moment";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { dspDropdowsUpserFinanceDoctorClinic } from "appRedux/actions";

const notiStyle = {
    padding: 16,
    width: 650,
};
const iconBg = {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    marginRight: 0,
};
const RedBtn = styled(Button)`
background-color: #ff7272;
color: white !important;
margin-bottom: 0;
border-radius: 4px;
cursor: pointer;
:active {
  background-color: #ff8585;
  color: white !important;
  border-color: #ff8585 !important;
}
:focus {
  background-color: #ff8585;
  color: white !important;
  border-color: #ff8585 !important;
}
:hover {
  background-color: #ff8585;
  color: white !important;
  border-color: #ff8585 !important;
}
`;
const pinkNoti = {
    backgroundColor: "#ffefef",
    border: "1px solid #fbcccc",
};
const yellowNoti = {
    backgroundColor: "#ffecce",
    border: "1px solid #ffab2b",
};
const redNoti = {
    backgroundColor: "#fbcccc",
    border: "1px solid red",
};

const rules = [
    {
        required: true,
        message: "จำเป็น !",
    }
]

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const doctorTypeFromsession = userFromSession.responseData.doctorType || null;
const user = userFromSession.responseData.userId || null;
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
// console.log('hosParam', hosParam)

export default function UpserFinanceDoctorClinic({
    visible = false,
    onCancel = () => { },
    onFinished = () => { },
    // Patient
    patient = null,
    patientId = null,
    serviceId = null,
    admitId = null,
    clinicId = null,
    // Right
    rightId = null,
    opdRightId = null,
    admitRightId = null,
    // Other
    workType = "OPD",
    portableXray = null,
    doctor = {
        doctorId: null,
        doctorName: null,
    },
    work = {
        workId: null,
        workName: null,
    },
    oderedExpenses = [],
    // orderId = null,
}) {
    const dispatch = useDispatch();
    const optionsStore = useSelector(({ getDropdowns }) => getDropdowns.optionsUpserFinanceDoctorClinic);
    // Form
    const [form] = Form.useForm()
    const [formLab] = Form.useForm()
    const [formXray] = Form.useForm()
    const [formOrder] = Form.useForm()
    // Ref
    const selectLabRef = useRef(null)
    const selectXrayRef = useRef(null)
    const selectOrderRef = useRef(null)
    // State
    const [loadingOptions, setLoadingOptions] = useState(false)
    const [loadingExpenseDetails, setLoadingExpenseDetails] = useState(false)
    const [vsbSelectExpenses, setVsbSelectExpenses] = useState(false)
    const [options, setOptions] = useState({
        // Rights
        opdRights: [],
        admitRights: [],
    })
    const [loading, setLoading] = useState(false)
    const [labAgianLoading, setLabAgianLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    // Funcs
    // Get
    const getAdmitRightDisplay = async (admitId) => {
        const req = {
            "patientId": patientId,
            "admitId": admitId,
            "serviceId": null,
            "workId": null
        }
        let res = await callApis(apis["GetAdmitRightDisplay"], req)
        res = mappingOptions({ dts: res, valueField: "admitRightId", labelField: "rightName" })
        setOptions(p => {
            return {
                ...p,
                admitRights: res
            }
        })
    }
    const getOpdRightIdByServiceId = async (serviceId) => {
        if (admitId) return getAdmitRightDisplay(admitId)
        if (!serviceId) return
        let res = await callApis(apis["GetOpdRightIdByServiceId"], serviceId)
        res = mappingOptions({ dts: res, valueField: "opdRightId", labelField: "opdRightName" })
        setOptions(p => {
            return {
                ...p,
                opdRights: res
            }
        })
    }
    const insertLabs = async (dts, upsertTransfusion) => {
        const expenses = map(dts, o => {
            return {
                ...o,
                toWork: hosParam?.centralLab ? String(hosParam.centralLab) : work.workId,
            }
        })
        const req = {
            requestData: expenses,
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            await AutoIcd(dts)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย LAB" })
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย LAB" })
        return res?.isSuccess
    }
    const insertXrays = async (dts) => {
        let portable = null;
        if (workType === "ward") {
            if (portableXray) portable = "Y";
        }
        const expenses = map(dts, o => {
            return {
                ...o,
                toWork: hosParam?.centralXray ? String(hosParam.centralXray) : work.workId,
                portable: portable,
                // picture: picture,
            }
        })
        const req = {
            requestData: expenses,
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            await AutoIcd(expenses)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย X-Ray" })
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย X-Ray" })
        return res?.isSuccess
    }
    const insertOrders = async (dts) => {
        // const picture = imageOrder ? [{
        //     "financePicId": null,
        //     "financeId": null,
        //     "orderId": null,
        //     "picture": imageOrder,
        //     "userCreated": user,
        //     "dateCreated": dayjs().format("YYYY-MM-DD HH:mm"),
        //     "userModified": null,
        //     "dateModified": null
        // }] : null
        const expenses = map(dts, o => {
            return {
                ...o,
                toWork: work.workId,
                // picture: picture,
            }
        })
        const req = {
            requestData: expenses,
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            await AutoIcd(dts)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย Order" })
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย Order" })
        return res?.isSuccess
    }
    const insertFinances = async (all = [], labs = [], xrays = [], orders = []) => {
        setLoading(p => !p)
        const resLab = labs.length ? await insertLabs(labs) : true
        const resXray = xrays.length ? await insertXrays(xrays) : true
        const resOrder = orders.length ? await insertOrders(orders) : true
        setLoading(p => !p)
        let reload = false
        let prevFormValues = all
        if (labs.length && resLab) {
            reload = true
            prevFormValues = differenceBy(prevFormValues, labs, "expenseId")
        }
        if (xrays.length && resXray) {
            reload = true
            prevFormValues = differenceBy(prevFormValues, xrays, "expenseId")
        }
        if (orders.length && resOrder) {
            reload = true
            prevFormValues = differenceBy(prevFormValues, orders, "expenseId")
        }
        if (reload) onFinished()
        if (resLab && resXray && resOrder) {
            form.setFieldsValue({ finances: [] })
            onCancel()
        } else {
            form.setFieldsValue({ finances: prevFormValues })
        }
    }
    const onFinish = (v) => {
        // console.log('onFinish', v)
        if (!v?.finances?.length) return notiWarning({ message: "กรุณาเลือกรายการค่าใช้จ่าย !" })
        const crrDateTime = dayjs().format("MM-DD-YYYY HH:mm")
        const fromWork = work.workId
        // const toWork = work.workId
        let right
        if (!admitId) right = find(options.opdRights, ["opdRightId", opdRightId])
        if (admitId) right = find(options.admitRights, ["admitRightId", admitRightId])
        const temp = map(v.finances, o => {
            const expense = find([...optionsStore?.labExpense || [], ...optionsStore?.xrayExpense || [], ...optionsStore?.orderExpense || []], ['expenseId', o.expenseId])
            return {
                // Patient
                patientId: patientId,
                hn: patient?.hn,
                runHn: patient?.runHn,
                yearHn: patient?.yearHn,
                serviceId: serviceId,
                clinicId: clinicId,
                runAn: patient?.runAn || null,
                yearAn: patient?.yearAn || null,
                an: patient?.an || null,
                admitId: admitId || null,
                // Right
                rightId: rightId,
                opdRightId: admitId ? null : opdRightId,
                admitRightId: admitId ? admitRightId : null,
                // Finance
                orderId: null,
                financeId: null,
                financeType: o?.financeType,
                expenseId: o?.expenseId,
                expenseName: expense?.name,
                code: expense?.code,
                billgroup: expense?.billgroup,
                actgroup: expense?.actgroup,
                accgroup: expense?.accgroup,
                opdipd: admitId ? "I" : "O",
                price: String(o.price),
                quantity: String(o.quantity),
                amount: String(o.amount),
                cashNotReturn: String(o.cashNotReturn || 0),
                cashReturn: String(o.cashReturn || 0),
                credit: String(o.credit || 0),
                promiseAmount: o?.promiseAmount ? String(o?.promiseAmount) : null,
                claim: o.claim ? String(o.claim) : "0",
                copay: o.copay ? String(o.copay) : "0",
                discount: o.discount ? String(o.discount) : "0",
                payment: o.payment ? String(o.payment) : "0",
                reminburse: o.reminburse ? String(o.reminburse) : "0",
                receive: o.receive ? String(o.receive) : "0",
                cost: "0",
                payAmount: String(o.payAmount || 0),
                nextPayment: String(o.nextPayment || 0),
                // Date
                orderDate: crrDateTime,
                orderTime: crrDateTime,
                dateCreated: crrDateTime,
                dateModified: null,
                dateAccepted: null,
                datePrepared: null,
                dateChecked: null,
                dateDispensed: null,
                datePayabled: null,
                // Work
                fromWork,
                // toWork,
                // User
                doctor: doctor.doctorId || null,
                userCreated: user,
                userModified: null,
                userAccepted: null,
                userPrepared: null,
                userChecked: null,
                userDispensed: null,
                userPayabled: null,
                // Flags
                lockFlag: null,
                rushFlag: v.rushFlag ? "Y" : null,
                notTriggerFlag: "Y",
                acceptFlag: expense?.acceptFlag || null,
                cashFlag: right?.cashFlag || null,
                specialFlag: o?.specialFlag ? "Y" : null,
                notResultFlag: o?.notResultFlag ? "Y" : null,
                // Other
                status: checkDoctype(expense),
                orderRemark: null,
            }
        })
        const labFinances = filter(temp, ["financeType", "L"])
        const xrayFinances = filter(temp, ["financeType", "X"])
        const orderFinances = differenceBy(temp, [...labFinances, ...xrayFinances], "expenseId")
        insertFinances(temp, labFinances, xrayFinances, orderFinances)
    }
    const addExpenseToForm = (dts) => {
        const prevValues = form.getFieldValue("finances") || []
        form.setFieldsValue({
            finances: [...prevValues, { ...dts, key: nanoid() }]
        })
    }
    const addExpensesToForm = (dts) => {
        const prevValues = form.getFieldValue("finances") || []
        form.setFieldsValue({
            finances: [...prevValues, ...dts]
        })
    }
    const onFinishLab = (v) => {
        addExpenseToForm(v)
        formLab.resetFields()
        setTimeout(() => {
            selectLabRef.current?.focus()
        }, 200);
    }
    const onFinishXray = (v) => {
        addExpenseToForm(v)
        formXray.resetFields()
        setTimeout(() => {
            selectXrayRef.current?.focus()
        }, 200);
    }
    const onFinishOrder = (v) => {
        addExpenseToForm(v)
        formOrder.resetFields()
        setTimeout(() => {
            selectOrderRef.current?.focus()
        }, 200);
    }
    const chkCndForDisabledExpense = (dts) => {
        let disabled = false
        if (dts?.intimeFlag === "Y") {
            const startTime = moment("06:00:00", "HH:mm:ss").format("HH:mm:ss");
            const endTime = moment("16:00:00", "HH:mm:ss").format("HH:mm:ss");
            const currentTime = moment().format("HH:mm:ss");
            const chkIsBetween = moment(currentTime, "HH:mm:ss").isBetween(moment(startTime, "HH:mm:ss"), moment(endTime, "HH:mm:ss"))
            if (!chkIsBetween) disabled = true
        }
        if (dts?.dateeff && dts?.dateexp) {
            const currentDay = moment();
            const dateEff = moment(dts?.dateeff);
            const dateExp = moment(dts?.dateexp);
            const chkIsBetween = currentDay.isBetween(dateEff, dateExp)
            if (!chkIsBetween) disabled = true
        }
        return disabled
    }
    const chkLabAlert = (expensesLab) => {
        const doctypes = {
            staffFlag: "s",
            residentFlag: "r",
            externFlag: "e",
            internFlag: "i",
            partTimeFlag: "p",
            notDocTypeFlag: "0",
        };
        const checkDoctorTypes = (expenseDetails) => {
            const { expenseName } = expenseDetails;
            const findFlags = Object.keys(doctypes).filter((key) => expenseDetails[key] === "Y");
            const findKeyDoctor = Object.keys(doctypes).find((key) => doctypes[key].toLowerCase() === doctorTypeFromsession?.toLowerCase());
            const userCorrect = expenseDetails[findKeyDoctor] === "Y" ? true : false;
            if (!userCorrect && findFlags.length > 0) {
                labAlertNoti({
                    labName: expenseName,
                    titleMessage: "แจ้งเตือนรายการที่ต้องยืนยันจากแพทย์ก่อนสั่ง",
                    notiLabStyle: yellowNoti,
                    notiLabFontStyle: "#ffab2b",
                    textOrIcon: <Icon icon={doctorMaleOutline} width={25} />,
                });
            }
        };
        const chkLifelabflag = (expenseDetails) => {
            const { expenseName, lifelabflag } = expenseDetails;
            if (lifelabflag) {
                labAlertNoti({
                    labName: expenseName,
                    titleMessage: "แจ้งเตือนรายการที่ควรสั่งตรวจแค่ 1 ครั้งในชีวิต",
                    descriptionMessage: <LabelTopic text='กรุณายืนยันการเลือก' />,
                    notiLabStyle: pinkNoti,
                    textOrIcon: "AGE",
                    notiLabFontStyle: "#fbcccc",
                    needConfirm: true,
                });
            }
        }
        const checkLabAgain = async () => {
            setLabAgianLoading(true)
            const promises = map(expensesLab, (o, i) => {
                return callApis(apis["GetCheckLabagian"], `?PatientId=${patientId}&ExpenseId=${o.expenseId}`).then(value => {
                    let temp = value ? value : {}
                    return {
                        ...o,
                        ...temp,
                        expenseName: o.expenseName,
                        expenseId: o.expenseId,
                    };
                });
            });
            return Promise.all(promises).then((results) => {
                setLabAgianLoading(false)
                let forSet = []
                map(results, (o) => {
                    if (o?.isLabagian !== "N") return forSet = [...forSet, o]
                    if (o?.lockLabagian !== "Y") forSet = [...forSet, o]
                    labAlertNoti({
                        labName: `${o.expenseName} - เคยมีการสั่งในช่วง ${o?.countExaminedDate} วัน ${o?.lockLabagian === "Y" ? "(ไม่อนุญาติให้สั่งซ้ำ)" : ""}`,
                        titleMessage: "แจ้งเตือนสั่ง LAB ซ้ำ",
                        descriptionMessage: `สั่งล่าสุด : ${moment(o?.dateCreated, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY ")} Order No : ${o?.orderId}`,
                        notiLabStyle: redNoti,
                        notiLabFontStyle: "#ff7272",
                        textOrIcon: "RLU"
                    })
                })
                if (!forSet.length) {
                    // addExpenseToForm(...forSet)
                    formLab.resetFields()
                }
            })
        }
        map(expensesLab, o => {
            checkDoctorTypes(o)
            chkLifelabflag(o)
        })
        checkLabAgain()
    }
    const chkWarningSelectedItems = (selectedItems) => {
        if (!oderedExpenses.length) return
        const orderedItems = () => {
            const intersections = intersectionBy(selectedItems, oderedExpenses, "expenseId")
            map(intersections, o => {
                return notiWarning({
                    message: "แจ้งเตือน เลือกรายการซ้ำกับที่เคยสั่งแล้ว",
                    description: o.expenseName
                })
            })
        }
        orderedItems() // เช็ครายการที่เคยสั่งแล้ว
    }
    const checkDoctype = (detail) => {
        if (!detail?.docConfirm) return null
        const doctypes = {
            staffFlag: "s",
            residentFlag: "r",
            externFlag: "e",
            internFlag: "i",
            partTimeFlag: "p",
            notDocTypeFlag: "0"
        };
        const findKeyDoctor = Object.keys(doctypes).find(key => doctypes[key].toLowerCase() === doctorTypeFromsession?.toLowerCase());
        const userCorrect = detail[findKeyDoctor] === "Y" ? null : "WD";
        return userCorrect
    }
    // Get
    const getOptions = async () => {
        if (!visible) return
        if (Object.keys(optionsStore).length) return
        const reqExpense = {
            "code": null,
            "workId": null,
            "group": null,
            "formulaId": null,
        }
        setLoadingOptions(p => !p)
        let [
            financeTypes,
            labs,
            xrays,
            orders,
            food,
        ] = await Promise.all([
            callApis(apis['GetFinancesType']),
            callApis(apis['GetExpensesLab'], reqExpense),
            callApis(apis['GetExpensesXray'], reqExpense),
            callApis(apis['GetExpensesOrder'], reqExpense),
            callApis(apis['GetExpensesOrder'], { ...reqExpense, financeType: "F" }),
        ])
        console.log('food', food)
        setLoadingOptions(p => !p)
        financeTypes = mappingOptions({ dts: financeTypes })
        labs = map(labs, o => {
            const disabled = chkCndForDisabledExpense(o)
            return {
                ...o,
                disabled: disabled,
                value: o.expenseId,
                label: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""}`,
                optionFilter: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""} ${o.cscd}`,
                className: "data-value"
            }
        })
        xrays = uniqBy(xrays, 'expenseId')
        xrays = map(xrays, o => {
            const disabled = chkCndForDisabledExpense(o)
            return {
                ...o,
                disabled: disabled,
                value: o.expenseId,
                label: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""}`,
                optionFilter: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""} ${o.cscd}`,
                className: "data-value"
            }
        })
        orders = map(orders, o => {
            const disabled = chkCndForDisabledExpense(o)
            return {
                ...o,
                disabled: disabled,
                value: o.expenseId,
                label: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""}`,
                optionFilter: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""} ${o.cscd}`,
                className: "data-value"
            }
        })
        food = map(food, o => {
            const disabled = chkCndForDisabledExpense(o)
            return {
                ...o,
                disabled: disabled,
                value: o.expenseId,
                label: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""}`,
                optionFilter: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""} ${o.cscd}`,
                className: "data-value"
            }
        })
        dispatch(dspDropdowsUpserFinanceDoctorClinic({
            financeType: financeTypes,
            labExpense: labs,
            xrayExpense: xrays,
            orderExpense: [...orders, ...food],
        }))
    }
    // Handle
    const handleCancle = (finished) => {
        // console.log('finished', finished)
        form.setFieldsValue({ finances: [] })
        onCancel(finished)
    }
    const handleChangeExpense = async (form, financeType, expenseId) => {
        // console.log('handleChangeExpense :>> ');
        const quantity = form.getFieldValue("quantity") || 1
        // console.log('quantity :>> ', quantity);
        setLoadingExpenseDetails(p => !p)
        const res = await getExpenseRate({ expenseId: expenseId, rightId: rightId || "x000000" })
        // console.log('res :>> ', res);
        setLoadingExpenseDetails(p => !p)
        const expense = find([...optionsStore?.labExpense || [], ...optionsStore?.xrayExpense || [], ...optionsStore?.orderExpense || []], ["value", expenseId])
        let {
            rate = null,
            credit = "0",
            cashReturn = "0",
            cashNotReturn = "0",
            minRate = null,
            maxRate = null
        } = res;
        const rateByUser = minRate ? true : false;
        rate = rate ? Number(rate) : 0;
        const amount = rate ? (Number(rate) * quantity) : 0;
        credit = credit ? (Number(credit) * quantity) : 0;
        credit = credit > amount ? amount : credit
        cashReturn = cashReturn ? (Number(cashReturn) * quantity) : 0;
        cashNotReturn = amount - (cashReturn + credit);
        minRate = minRate ? Number(minRate) * quantity : 0;
        maxRate = maxRate ? Number(maxRate) * quantity : 0;
        const newData = {
            expenseId: expenseId,
            financeType: expense.financeType?.toUpperCase(),
            expenseName: expense.label,
            quantity: quantity,
            price: rate,
            amount: amount,
            credit: credit,
            tempCredit: credit,
            cashReturn: cashReturn,
            tempCashReturn: cashReturn,
            cashNotReturn: cashNotReturn,
            rateByUser: rateByUser,
        }
        // console.log('newData :>> ', newData);
        form.setFieldsValue({ ...newData })
        chkWarningSelectedItems([newData])
        switch (financeType) {
            case "L":
                formXray.resetFields()
                formOrder.resetFields()
                chkLabAlert([newData])
                break;
            case "X":
                formLab.resetFields()
                formOrder.resetFields()
                break;
            case "O":
                formLab.resetFields()
                formXray.resetFields()
                break;
        }
    }
    const handleChangeFields = (form) => {
        const quantity = form.getFieldValue("quantity")
        // console.log('quantity :>> ', quantity);
        const price = form.getFieldValue("price")
        // console.log('price :>> ', price);
        let credit = form.getFieldValue("tempCredit")
        // console.log('credit :>> ', credit);
        let cashReturn = form.getFieldValue("tempCashReturn")
        // console.log('cashReturn :>> ', cashReturn);
        const amount = quantity * price
        credit = credit * quantity;
        cashReturn = cashReturn * quantity;
        let cashNotReturn = amount - (credit + cashReturn);
        form.setFieldsValue({
            amount: amount,
            credit: credit,
            cashReturn: cashReturn,
            cashNotReturn: cashNotReturn,
        })
    }
    const handlePressEnter = (form) => {
        // console.log('handlePressEnter :>> ');
        const quantity = form.getFieldValue("quantity")
        if (!quantity) return
        form.submit()
    }
    const handleDeleteRows = (keys) => {
        const finances = form.getFieldValue("finances")
        const mappingKeys = map(keys, (key) => {
            return {
                key: key
            }
        })
        const differences = differenceBy(finances, mappingKeys, "key")
        form.setFieldsValue({ finances: differences })
    }
    const handleCopyByList = async (dts) => {
        // console.log('dts', dts)
        setLoading(p => !p)
        const promises = map(dts, o => {
            return getExpenseRate({ expenseId: o.expenseId, rightId: rightId || "x000000" }).then(value => {
                let {
                    rate = null,
                    credit = "0",
                    cashReturn = "0",
                    cashNotReturn = "0",
                    minRate = null,
                    maxRate = null
                } = value;
                const rateByUser = minRate ? true : false;
                const quantity = 1
                rate = rate ? Number(rate) : 0;
                credit = credit ? Number(credit) * quantity : 0;
                cashReturn = cashReturn ? Number(cashReturn) * quantity : 0;
                cashNotReturn = cashNotReturn ? Number(cashNotReturn) * quantity : 0;
                minRate = minRate ? Number(minRate) * quantity : 0;
                maxRate = maxRate ? Number(maxRate) * quantity : 0;
                let amount = rate ? Number(rate) * quantity : 0;
                return {
                    key: nanoid(),
                    financeId: null,
                    financeType: o.financeType.toUpperCase(),
                    expenseId: o.expenseId,
                    quantity: quantity,
                    code: o.code,
                    price: rate,
                    amount: amount,
                    credit: credit,
                    cashReturn: cashReturn,
                    cashNotReturn: cashNotReturn,
                    minRate: minRate,
                    maxRate: maxRate,
                    rateByUser: rateByUser,
                    // disablePrice: rateByUser === "YES" ? false : true,
                    expenseName: o.name,
                    organ: o.organ,
                };
            });
        });
        return Promise.all(promises).then(result => {
            // let outLabs = []
            // if (name === "Lab" && inOutLab === "O" && workType === "Dental") {
            //     const outLab = {
            //         financeId: null,
            //         isOutLab: true,
            //         rightId: rightId,
            //         quantity: 1,
            //         financeType: "L",
            //         opdRightId: opdRightId,
            //     };
            //     outLabs = [outLab]
            // }
            // form.setFieldsValue({ [name]: [...result, ...outLabs] });
            // chkTransfusionReaction()
            setLoading(p => !p)
            addExpensesToForm(result)
        });
    }
    // Effect
    useEffect(() => {
        getOptions()
    }, [visible])
    useEffect(() => {
        getOpdRightIdByServiceId(serviceId)
    }, [serviceId])
    // Components
    // Noti
    const labAlertNoti = async ({
        labName = null,
        titleMessage = null,
        descriptionMessage = null,
        notiLabStyle,
        notiLabFontStyle,
        textOrIcon,
        needConfirm = false,
    }) => {
        const key = `labAlertNoti{${nanoid()}`;
        const args = {
            // placement,
            key,
            className: "drugAlert red_border",
            style: {
                ...notiStyle,
                ...notiLabStyle,
            },
            onClick: () => {
                notification.close(key);
            },
            message: (
                <GenRow align="middle">
                    <Col span={24} style={{ paddingLeft: 38 }}>
                        <LabelTopic text={titleMessage || "-"} className='d-block' />
                        <LabelTopic text={`HN : ${patient?.hn || "-"}`} className='me-2' />
                        <LabelText text={patient?.displayName || "ชื่อ -"} />
                    </Col>
                </GenRow>
            ),
            description: (<>
                <GenRow align="bottom">
                    <Col span={20} style={{ paddingLeft: 38 }}>
                        <LabelText text={`รายการ : ${labName || "-"}`} className='d-block' />
                        {
                            descriptionMessage && <LabelText text={descriptionMessage || "-"} className='d-block' />
                        }
                    </Col>
                    {
                        needConfirm && <Col
                            span={4}
                            style={{
                                textAlign: "right",
                                paddingLeft: 0
                            }}>
                            <RedBtn
                                type="default" onClick={() => notification.close(key)}
                            >
                                ยืนยัน
                            </RedBtn>
                        </Col>
                    }
                </GenRow>
            </>
            ),
            icon: (
                <div
                    style={{
                        ...iconBg,
                        background: notiLabFontStyle,
                    }}
                >
                    {textOrIcon ? textOrIcon : "-"}
                </div>
            ),
            duration: 0,
        };
        notification.open(args);
        return false;
    };
    const PartsFormList = () => {
        const listName = "finances"
        const columns = [
            // ประเภท
            {
                title: <LabelText text='ประเภท' />,
                dataIndex: "financeType",
                width: 95,
                fixed: "left",
                render: (v, r, i) => {
                    const financeTypeName = find(optionsStore?.financeType || [], ["value", v])?.label
                    return <div>
                        <div hidden>
                            <Form.Item name={[i, "key"]}><Input /></Form.Item>
                            <Form.Item name={[i, "financeType"]}><Input /></Form.Item>
                            <Form.Item name={[i, "expenseId"]}><Input /></Form.Item>
                            <Form.Item name={[i, "lockFlag"]}><Input /></Form.Item>
                            <Form.Item name={[i, "expenseName"]}><Input /></Form.Item>
                            <Form.Item name={[i, "isOutLab"]}><Input /></Form.Item>
                            <Form.Item name={[i, "organ"]}><Input /></Form.Item>
                        </div>
                        {financeTypeName || "-"}
                    </div>
                }
            },
            // รายการ
            {
                title: <LabelText text='รายการ' />,
                dataIndex: "expenseName",
            },
            // จำนวน
            {
                title: <LabelText text='จำนวน' />,
                dataIndex: "quantity",
                width: 70,
            },
            // ราคา/หน่วย
            {
                title: <LabelText text='ราคา/หน่วย' />,
                dataIndex: "price",
                width: 90,
            },
            // ราคารวม
            {
                title: <LabelText text='ราคารวม' />,
                dataIndex: "amount",
                width: 90,
            },
            // เครดิต
            {
                title: <LabelText text='เครดิต' />,
                dataIndex: "credit",
                width: 90,
            },
            // เบิกได้
            {
                title: <LabelText text='เบิกได้' />,
                dataIndex: "cashReturn",
                width: 90,
            },
            // เบิกไม่ได้
            {
                title: <LabelText text='เบิกไม่ได้' />,
                dataIndex: "cashNotReturn",
                width: 90,
            },
            // ไม่ต้องการผลอ่าน
            {
                title: <LabelText text='ไม่ต้องการผลอ่าน' />,
                dataIndex: "financeType",
                width: 115,
                align: "center",
                render: (v, r, i) => {
                    return <Form.Item
                        name={[i, "notResultFlag"]}
                        style={{ margin: 0 }}
                        hidden={v !== "X"}
                        valuePropName='checked'
                    >
                        <Checkbox />
                    </Form.Item>
                }
            },
            // X-ray พิเศษ
            {
                title: <LabelText text='X-ray พิเศษ' />,
                dataIndex: "financeType",
                width: 90,
                align: "center",
                render: (v, r, i) => {
                    return <Form.Item
                        name={[i, "specialFlag"]}
                        style={{ margin: 0 }}
                        hidden={v !== "X"}
                        valuePropName='checked'
                    >
                        <Checkbox />
                    </Form.Item>
                }
            },
        ]
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedKeys,) => {
                setSelectedRowKeys(selectedKeys)
            },
        };
        return <Form.List name={listName}>
            {(list,) => {
                const temp = form.getFieldValue(listName) || [];
                list = map(list, (val, i) => {
                    const crrRow = temp[i];
                    return {
                        ...crrRow,
                        ...val,
                        key: crrRow.key
                    };
                });
                return <Table
                    className='mb-2'
                    size="small"
                    scroll={{ y: 300 }}
                    columns={columns}
                    dataSource={list}
                    pagination={false}
                    rowClassName='data-value'
                    rowSelection={{ ...rowSelection }}
                    tableLayout="fixed"
                />
            }}
        </Form.List>
    }
    const PartsFormSelect = (financeType, form, onFinish, options = []) => {
        let topic = "-"
        let ref = null
        switch (financeType) {
            case "L":
                topic = "Lab"
                ref = selectLabRef
                break;
            case "X":
                topic = "X-Ray"
                ref = selectXrayRef
                break;
            case "O":
                topic = "ค่าใช้จ่าย"
                ref = selectOrderRef
                break;
            default:
                break;
        }
        const rateByUser = form.getFieldValue("rateByUser")
        return <Form form={form} onFinish={onFinish} layout='vertical'>
            <div hidden>
                <Form.Item name="financeType"> <Input /></Form.Item>
                <Form.Item name="expenseName"> <Input /></Form.Item>
                <Form.Item name="tempCredit"> <Input /></Form.Item>
                <Form.Item name="credit"> <Input /></Form.Item>
                <Form.Item name="tempCashReturn"> <Input /></Form.Item>
                <Form.Item name="cashReturn"> <Input /></Form.Item>
                <Form.Item name="cashNotReturn"> <Input /></Form.Item>
                <Form.Item name="rateByUser"> <Input /></Form.Item>
                <Form.Item name="minRate"> <Input /></Form.Item>
                <Form.Item name="maxRate"> <Input /></Form.Item>
            </div>
            <GenRow align="middle" className='mb-2'>
                <Col span={2} className='text-end'>
                    <LabelTopicPrimary text={topic} />
                </Col>
                <Col span={9}>
                    <Form.Item name="expenseId" style={{ margin: 0 }} rules={rules}>
                        <Select
                            ref={ref}
                            size='small'
                            style={{ width: "100%" }}
                            showSearch
                            allowClear
                            optionFilterProp='optionFilter'
                            options={options}
                            loading={loadingOptions}
                            onChange={v => {
                                handleChangeExpense(form, financeType, v)
                            }}
                            onInputKeyDown={v => {
                                if (v.code === 'Enter' || v.code === "NumpadEnter") {
                                    handlePressEnter(form)
                                }
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={1} className='text-end'>
                    <LabelTopicPrimary text='จำนวน' />
                </Col>
                <Col span={2}>
                    <Form.Item name="quantity" style={{ margin: 0 }} rules={rules}>
                        <InputNumber
                            style={{ width: '100%' }}
                            size='small'
                            onChange={() => handleChangeFields(form, financeType)}
                            onPressEnter={() => handlePressEnter(form)}
                            min={1}
                        />
                    </Form.Item>
                </Col>
                <Col span={1} className='text-end'>
                    <LabelTopicPrimary text='ราคา' />
                </Col>
                <Col span={3}>
                    <Form.Item name="price" style={{ margin: 0 }} rules={rules}>
                        <InputNumber
                            style={{ width: '100%' }}
                            size='small'
                            controls={false}
                            disabled={!rateByUser}
                            onChange={() => handleChangeFields(form, financeType)}
                            onPressEnter={() => handlePressEnter(form)}
                        />
                    </Form.Item>
                </Col>
                <Col span={1} className='text-end'>
                    <LabelTopicPrimary text='รวม' />
                </Col>
                <Col span={3}>
                    <Form.Item name="amount" style={{ margin: 0 }}>
                        <InputNumber
                            style={{ width: '100%' }}
                            size='small'
                            controls={false}
                            disabled
                        />
                    </Form.Item>
                </Col>
                <Col span={2}>
                    <Button
                        hidden={financeType !== "O"}
                        size='small'
                        type='primary'
                        style={{ margin: 0 }}
                        onClick={e => {
                            e.stopPropagation()
                            setVsbSelectExpenses(true)
                        }}
                    >แบบรายการ</Button>
                </Col>
            </GenRow>
        </Form>
    }
    const PartsModalSelectExpenses = () => {
        return <SelectExpenses
            visible={vsbSelectExpenses}
            onCancel={() => {
                setVsbSelectExpenses(false)
            }}
            onCopy={dts => {
                setVsbSelectExpenses(false)
                handleCopyByList(dts)
            }}
            // Patient
            patient={patient}
            patientId={patientId}
            serviceId={serviceId}
            clinicId={clinicId}
            admitId={admitId}
            // Right
            rightId={rightId}
            opdRightId={opdRightId}
            admitRightId={admitRightId}
            // Other
            work={work}
            doctor={doctor}
            isOrder={false}
            oderedExpenses={oderedExpenses}
        />
    }
    return <Modal
        title={<GenRow align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
            <Col span={12}>
                <LabelTopicPrimary18 className='me-3' text='ค่าใช้จ่าย' />
                {/* <LabelTopicPrimary18 className='me-3' text='Order No.' />
                <LabelTopic18 className='me-3' text={orderNo} /> */}
                <Button
                    type='danger'
                    style={{ margin: 0 }}
                    onClick={e => {
                        e.stopPropagation()
                        handleDeleteRows(selectedRowKeys)
                    }}
                    disabled={!selectedRowKeys.length}
                >ลบที่เลือก</Button>
            </Col>
            <Col span={10} className='text-end'>
                <Form form={form} onFinish={onFinish} layout='vertical'>
                    <Form.Item name="rushFlag" noStyle valuePropName='checked'>
                        <Checkbox>ด่วน ?</Checkbox>
                    </Form.Item>
                </Form>
            </Col>
            <Col span={2} className='text-end'>
                <PrintFormReport
                    type="default"
                    style={{
                        width: "100%",
                        marginBottom: 0,
                        borderRadius: 4,
                    }}
                    className="btn-custom-bgcolor"
                    param={{
                        hn: patient?.hn,
                        clinicid: clinicId
                    }}
                    number={null}
                // workId={workRoom?.datavalue}
                />
            </Col>
        </GenRow>}
        centered
        visible={visible}
        // closeIcon={false}
        closable={false}
        width={1145}
        okText="สั่ง"
        cancelText="ปิด"
        onOk={() => {
            form.submit()
        }}
        onCancel={() => {
            handleCancle(false)
        }}
        okButtonProps={{
            disabled: loading || loadingExpenseDetails || labAgianLoading
        }}
    >
        <Spin spinning={loading || loadingExpenseDetails || labAgianLoading}>
            <div style={{ margin: -18 }}>
                <Form form={form} onFinish={onFinish} layout='vertical'>
                    <div style={{ height: 375 }}>
                        {PartsFormList()}
                    </div>
                </Form>
                {PartsFormSelect("L", formLab, onFinishLab, optionsStore?.labExpense || [])}
                {PartsFormSelect("X", formXray, onFinishXray, optionsStore?.xrayExpense || [])}
                {PartsFormSelect("O", formOrder, onFinishOrder, optionsStore?.orderExpense || [])}
            </div>
        </Spin>
        {/* Modal */}
        {PartsModalSelectExpenses()}
    </Modal>
}
export const insertNewOrder = async (req) => {
    let res = await Axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/InsNewOrderListFinance`,
        method: "POST",
        data: req
    }).then(res => {
        return res.data;
    }).catch(error => {
        return error;
    });
    return res;
};
const apis = {
    GetExpensesLab: {
        url: "OpdExamination/GetExpensesLab",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetExpensesXray: {
        url: "OpdExamination/GetExpensesXray",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetExpensesOrder: {
        url: "OpdExamination/GetExpensesOrder",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetCheckLabagian: {
        url: "OpdExamination/GetCheckLabagian",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetFinancesType: {
        url: "Masters/GetFinancesType",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    InsNewOrderFinance: {
        url: "Finances/InsNewOrderListFinance",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    GetOpdRightIdByServiceId: {
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    GetAdmitRightDisplay: {
        url: "IpdWard/GetAdmitRightDisplay",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
}
