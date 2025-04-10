import { CheckOutlined, EditOutlined, EyeOutlined, InfoCircleOutlined, LockOutlined, PlusOutlined, UnlockOutlined, UserSwitchOutlined } from '@ant-design/icons';
import doctorMaleOutline from "@iconify/icons-healthicons/doctor-male-outline";
import { Icon } from "@iconify/react";
import {
    Button, Checkbox, Col, ConfigProvider, Form, Input,
    InputNumber, Modal,
    notification,
    Radio, Select, Spin, Table,
    Tooltip
} from 'antd';
import thTH from "antd/lib/locale/th_TH";
import Axios from "axios";
import DayjsDatePicker from "components/DatePicker/DayjsDatePicker";
import DayjsTimePicker from "components/DatePicker/DayjsTimePicker";
import { callApi } from 'components/helper/function/CallApi';
import {
    LabelText,
    LabelTopic,
    LabelTopicPrimary,
    LabelTopicPrimary18
} from "components/helper/function/GenLabel";
import GenRow from 'components/helper/function/GenRow';
import { mappingOptions } from "components/helper/function/MappingOptions";
import { calcExpense, getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
import DiagAndAncRequest from "components/Modal/DiagAndAncRequest";
import TransfusionReaction from "components/Modal/TransfusionReaction";
import { notificationX as noti, notiError, notiSuccess, notiWarning } from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import { env } from 'env';
import { find, filter, toNumber, map, differenceBy, groupBy, sumBy, pick, isNumber } from "lodash";
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { changeRebatePercentage as percentToNumber } from "routes/MedicationAndSuppliesInventory/Components/CalculatPurchaseOrder";
import ScreeningAddLabItem from "routes/OpdClinic/Components/ScreeningAddLabItem";
import ScreeningAddOrderItem from "routes/OpdClinic/Components/ScreeningAddOrderItem";
import ScreeningXRay from "routes/OpdClinic/Components/ScreeningXRay";
import styled from "styled-components";

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

const notiStyle = {
    padding: 16,
    width: 650
};

const iconBg = {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    marginRight: 0
};
const redNoti = {
    backgroundColor: "#fbcccc",
    border: "1px solid red"
};
const pinkNoti = {
    backgroundColor: "#ffefef",
    border: "1px solid #fbcccc"
};
const yellowNoti = {
    backgroundColor: "#ffecce",
    border: "1px solid #ffab2b"
};
const rules = [
    {
        required: true,
        message: "จำเป็น !",
    }
]
const listEditerOrderQty = [{
    value: "1",
    label: "ผู้สั่ง Order เป็นผู้มีสิทธิ์แก้ไข"
}, {
    value: "2",
    label: "ผู้ Accept Order เป็นผู้มีสิทธิ์แก้ไข"
}, {
    value: "3",
    label: "ผู้สั่ง Order และ ผู้ Accept เป็นผู้มีสิทธิ์แก้ไข"
}, {
    value: "4",
    label: "สามารถแก้ไขได้ทุกคน"
}];

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
const doctorTypeFromsession = userFromSession.responseData.doctorType || null;

export default function UpsertFinances({
    patientId = null,
    serviceId = null,
    clinicId = null,
    admitId = null,
    workType = "opd",
    opdRightId = null,
    admitRightId = null,
    opdIpd = "O",
    appointId = null,
    doctorId = null,
    drugAllowed = false,
    orderId = null,
    page = null,
    onFinished = () => { },
    close = () => { }
}) {
    const {
        reasonQty,
        lockQTYOrderUserType,
        centralXray,
        centralLab,
        lockQTYOrder,
    } = JSON.parse(localStorage.getItem("hos_param"));

    const [form] = Form.useForm()
    const [formSpecimen] = Form.useForm()
    const [formReason] = Form.useForm();
    const autoAccept = Form.useWatch("autoAccept", form)
    const resultFlag = Form.useWatch("resultFlag", form)
    const orderLockFlag = Form.useWatch("orderLockFlag", form)

    const [friend, setFriend] = useState(false)
    const [Loading, setLoading] = useState(false)
    const [checkStrictly, setCheckStrictly] = useState(true);
    const [isExpensesDownloaded, setIsExpensesDownloaded] = useState(false)
    const [isFinanceTypesDownloaded, setIsFinanceTypesDownloaded] = useState(false)
    const [expensesLoading, setExpensesLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [currentFinanceRowKey, setCurrentFinanceRowKey] = useState(null);
    const [listOpdRightFinanceBalance, setListOpdRightFinanceBalance] = useState([]);
    const [dscBalance, setDscBalance] = useState(0);
    const [toWorkType, setToWorkType] = useState(null);
    const [optionsSpecimen, setOptionsSpecimen] = useState([])
    const [optionsReason, setOptionsReason] = useState([])
    const [optionsFinanceType, setOptionsFinanceType] = useState([])
    const [optionsFromWork, setOptionsFromWork] = useState([])
    const [optionsToWork, setOptionsToWork] = useState([])
    const [optionsPackage, setOptionsPackage] = useState([])
    const [expenses, setExpenses] = useState([])
    const [vsbOverBalanceModal, setVsbOverBalanceModal] = useState(false);
    const [vsbOverBalanceDetail, setVsbOverBalanceDetail] = useState({});
    const [vsbModalSpecimen, setVsbModalSpecimen] = useState(false);
    const [vsbModalEditQty, setVsbModalEditQty] = useState(false);
    const [vsbAddList, setVsbAddList] = useState(null)
    const [vsbTransfusionReaction, setVsbTransfusionReaction] = useState(false);
    const [vsbDiagAndAncRequest, setVsbDiagAndAncRequest] = useState(false);
    const [transfusionReactionByOrder, setTransfusionReactionByOrder] = useState(null);
    const [patient, setPatient] = useState(null)
    const [finances, setFinances] = useState([])
    const [disabledRushCheckbox, setDisabledRushCheckbox] = useState(false);
    const [dailyNo, setDailyNo] = useState("-");
    const [opdClinicDetails, setOpdClinicDetails] = useState(null)
    const [opdRightList, setOpdRightList] = useState([]);
    const [opdRightIdSelected, setOpdRightIdSelected] = useState(opdRightId);
    const [admitDetails, setAdmitDetails] = useState(null)
    const [admitRightList, setAdmitRightList] = useState([]);
    const [admitRightIdSelected, setAdmitRightIdSelected] = useState(admitRightId);

    const getFinanceTypes = async () => {
        if (isFinanceTypesDownloaded) return
        setIsFinanceTypesDownloaded(true)
        let res = await callApi(listApi, "GetFinanceTypes",)
        res = mappingOptions({ dts: res })
        res = map(res, o => {
            let disabled = false
            if (!drugAllowed) {
                if (o.value === "D" || o.value === "M") disabled = true
            }
            return {
                ...o,
                disabled: disabled,
            }
        })
        setOptionsFinanceType(res)
        getExpenses(res)
    }

    const getWorkPlacesMas = async () => {
        let res = await callApi(listApi, "GetWorkPlacesMas",)
        res = mappingOptions({ dts: res })
        setOptionsFromWork(res)
        if (workType === "opd") setOptionsToWork(res)
    }

    const getToWork = async (workType) => {
        switch (workType) {
            case "opd":
                break;
            case "lab":
                break;
            case "xray":
                break;
            default:
                break;
        }
    }

    const getMasterPackages = async () => {
        let res = await callApi(listApi, "GetMasterPackages", {})
        res = mappingOptions({ dts: res })
        setOptionsPackage(res)
    }

    const getExpenses = async (optionsFinanceType) => {
        if (isExpensesDownloaded) return
        setIsExpensesDownloaded(true)
        setExpensesLoading(true)
        let promises = map(optionsFinanceType, o => {
            const req = {
                code: null,
                name: null,
                workId: null,
                group: null,
                financeType: o.value,
                formulaId: null,
                organ: null
            }
            if (!drugAllowed) {
                if (o.value === "M" || o.value === "D") return { financeType: o.value, expenses: [] }
            }
            return callApi(listApi, "GetExpenses", req).then(value => {
                const mapping = map(value, o => {
                    return {
                        ...o,
                        value: o.expenseId,
                        label: `${o.code} ${o.name} ${o?.initials ? `(${o.initials})` : ""}`,
                        className: "data-value"
                    }
                })
                return {
                    financeType: o.value,
                    expenses: mapping
                };
            });
        });

        return Promise.all(promises).then(function (results) {
            setExpensesLoading(false)
            let allExpenses = []
            map(results, o => {
                allExpenses = [...allExpenses, ...o.expenses]
            })
            setExpenses([
                ...results,
                {
                    financeType: "ALL",
                    expenses: allExpenses,
                },
            ])
            setOptionsFinanceType(p => {
                return [
                    {
                        value: "ALL",
                        label: "All ทั้งหมด",
                        className: "data-value",
                    },
                    ...p
                ]
            })
        });
    }

    const getUpdOpdRightVisitOfDate = async (dts) => {
        const promises = map(dts, o => {
            return callApi(listApi, "GetUpdOpdRightVisitOfDate", o.opdRightId).then(value => {
                return {
                    key: nanoid(),
                    rightId: value.rightId,
                    rightName: o.opdRightName,
                    opdRightId: value.opdRightId,
                    balance: value.balance ? toNumber(value.balance) : "ไม่ได้กำหนด"
                };
            });
        });
        return Promise.all(promises).then(function (results) {
            setListOpdRightFinanceBalance(results);
        });
    }

    const getClinicsAndOpdRights = async (serviceId) => {
        if (!serviceId) return
        setLoading(true)
        const [
            opdRights,
            clinics,
        ] = await Promise.all([
            callApi(listApi, "GetOpdRightByServiceId", serviceId),
            callApi(listApi, "GetOpdClinicsByServiceId", serviceId),
        ])
        setLoading(false)
        let clinicDetails = null
        if (clinicId) clinicDetails = find(clinics, ["clinicId", clinicId])
        if (!clinicId) clinicDetails = clinics[0]
        setOpdClinicDetails(clinicDetails)
        setOpdRightList(opdRights)
        getUpdOpdRightVisitOfDate(opdRights)
        let tempOpdRightId = opdRightId
        if (opdRights.length) {
            if (!opdRightId) {
                const mainRight = find(opdRights, ["mainFlag", "Y"])
                setOpdRightIdSelected(mainRight?.opdRightId || opdRights[0].opdRightId)
                tempOpdRightId = mainRight?.opdRightId || opdRights[0].opdRightId
            }
        }
        handleClickResetFinanceForm({ ...clinicDetails, opdRightId: tempOpdRightId })
    }

    const getAdmitAndAdmitRights = async (admitId) => {
        if (!admitId) return
        setLoading(true)
        const req = {
            admitId: admitId
        }
        const [
            admitRights,
            admitDetails,
        ] = await Promise.all([
            callApi(listApi, "GetAdmitRightByAdmitID", req),
            callApi(listApi, "GetAdmitByAdmitID", req),
        ])
        setLoading(false)
        setAdmitDetails(admitDetails)
        setAdmitRightList(admitRights)
        let tempAdmitRightId = admitRightId
        if (admitRights.length) {
            if (!admitRightId) {
                const mainRight = find(admitRights, ["mainFlag", "Y"])
                setAdmitRightIdSelected(mainRight?.admitRightId || admitRights[0].admitRightId)
                tempAdmitRightId = mainRight?.admitRightId || admitRights[0].admitRightId
            }
        }
        handleClickResetFinanceForm({ ...admitDetails, workId: admitDetails?.ward, admitRightId: tempAdmitRightId, })
    }

    const getMasterCodeSpecimens = async () => {
        const req = {
            "key": null,
            "page": null,
            "rows": null
        }
        let res = await callApi(listApi, "GetMasterCodeSpecimens", req)
        res = mappingOptions({ dts: res, valueField: "code", labelField: "name" })
        setOptionsSpecimen(res)
    }

    const getCancelReason = async () => {
        let res = await callApi(listApi, "GetCancelReason")
        res = mappingOptions({ dts: res })
        setOptionsReason(res)
    }

    const getTransfusionReaction = async orderId => {
        if (!orderId) return setTransfusionReactionByOrder(null);
        let res = await callApi(listApi, "GetTransfusionReaction", orderId)
        if (res?.length) {
            let temp = res[0];
            temp.transfusionDate = dayjs(temp.transfusionDate, "MM/DD/YYYY HH:mm:ss");
            temp.transfusionTime = dayjs(temp.transfusionTime, "MM/DD/YYYY HH:mm:ss");
            setTransfusionReactionByOrder(temp);
        }
        if (!res?.length) setTransfusionReactionByOrder(null);
    };

    const getFinancesByOrderId = async (orderId) => {
        if (!orderId) return
        const req = {
            patientId: patientId,
            orderId: orderId,
        }
        setLoading(true);
        const res = await callApi(listApi, "GetFinancesByOrderId", req)
        setLoading(false);
        manageOrder(res)
    }

    const getOrders = async (patientId, orderId) => {
        if (!orderId) return
        const req = {
            patientId: patientId,
            orderId: orderId,
        }
        const res = await callApi(listApi, "GetOrders", req)
        const order = res[0]
        form.setFieldsValue({
            toWork: order.toWork,
            fromWork: order.fromWork,
            orderDate: dayjs(order.orderDate, "MM/DD/YYYY HH:mm:ss"),
            orderLockFlag: order.lockFlag
        });
    }

    const onFinish = (v) => {
        const { warningTransfusion, upsertTransfusion } = chkTransfusionReaction();
        if (warningTransfusion) return;

        const expensesAll = find(expenses, ['financeType', "ALL"]).expenses
        const crrDateTime = dayjs().format("YYYY-MM-DD HH:mm")

        let tempServiceId = null
        let tempClinicId = null

        if (!admitId) {
            tempServiceId = opdClinicDetails?.serviceId
            tempClinicId = opdClinicDetails?.clinicId
        }
        if (admitId) {
            tempServiceId = admitDetails?.serviceId
            tempClinicId = admitDetails?.clinicId
        }

        if (!tempServiceId) tempServiceId = serviceId

        const mapping = map(v.finances, o => {
            const expense = find(expensesAll, ['expenseId', o.expenseId])
            let status = autoAccept ? "A" : o.status || null
            status = expense?.docConfirm === "Y" ? checkDoctype(expense) ? status : "WD" : status
            let right
            if (!admitId) right = find(opdRightList, ["opdRightId", o.opdRightId])
            if (admitId) right = find(admitRightList, ["admitRightId", o.admitRightId])
            return {
                patientId: patientId,
                hn: patient?.hn,
                runHn: patient?.runHn,
                yearHn: patient?.yearHn,
                serviceId: tempServiceId,
                clinicId: tempClinicId,
                an: admitDetails?.an || null,
                runAn: admitDetails?.an ? admitDetails.an.split("/")[0] : null,
                yearAn: admitDetails?.an ? admitDetails.an.split("/")[1] : null,
                admitId: admitId || null,
                rightId: right?.rightId,
                opdRightId: admitId ? null : o?.opdRightId,
                admitRightId: admitId ? o?.admitRightId : null,
                orderId: orderId || null,
                financeId: o.financeId,
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
                orderDate: dayjs(v.orderDate).format("YYYY-MM-DD HH:mm:ss"),
                orderTime: crrDateTime,
                dateCreated: crrDateTime,
                dateModified: null,
                datePrepared: null,
                dateChecked: null,
                dateDispensed: null,
                datePayabled: null,
                fromWork: v.fromWork || null,
                toWork: v.toWork || null,
                vendor: v?.vendor || null,
                doctor: doctorId,
                userCreated: user,
                userModified: null,
                userPrepared: null,
                userChecked: null,
                userDispensed: null,
                userPayabled: null,
                teeth: o.teeth || null,
                lockFlag: null,
                docRemark: v?.docRemark,
                orderRemark: null,
                notTriggerFlag: "Y",
                rushFlag: v?.rushFlag ? "Y" : null,
                acceptFlag: expense?.acceptFlag || null,
                cashFlag: right?.cashFlag || null,
                editStatus: o.editStatus,
                status: status,
                userAccepted: status === "A" ? user : v.userAccepted || null,
                dateAccepted: status === "A" ? dayjs(v.orderDate).format("YYYY-MM-DD HH:mm") : v.dateAccepted || null,
                notResultFlag: o.notResultFlag,
                xrayResultFlag: o.xrayResultFlag || null,
                specimen: o.financeType === "L" ? o.specimen ? o.specimen : null : null,
                specimenVol: o.financeType === "L" ? o.specimenVol ? String(o.specimenVol) : null : null,
                specimenSite: o.financeType === "L" ? o.specimenSite || null : null,
                specimenRemark: o.financeType === "L" ? o.specimenRemark || null : null,
                specimenUser: o.financeType === "L" ? o?.specimenUser || null : null,
                specimenDate: o.financeType === "L" ? o?.specimenDate || null : null
            }
        })
        if (!orderId) chkConsitionsForInsert(mapping, upsertTransfusion)
        if (orderId) chkConsitionsForUpdate(mapping)
    }
    const onFinishSpecimen = value => {
        form.setFields([
            { name: ["finances", value.index, "specimen"], value: value.specimen },
            { name: ["finances", value.index, "specimenVol"], value: value.specimenVol },
            { name: ["finances", value.index, "specimenSite"], value: value.specimenSite },
            { name: ["finances", value.index, "specimenRemark"], value: value.specimenRemark },
            { name: ["finances", value.index, "editStatus"], value: orderId ? true : false },
            { name: ["finances", value.index, "specimenUser"], value: value?.specimenUser },
            { name: ["finances", value.index, "specimenDate"], value: value?.specimenDate }
        ]);
        setVsbModalSpecimen(false);
        formSpecimen.resetFields();
    };

    const onFinishReason = v => {
        form.setFields([
            { name: ["finances", v.index, "reason"], value: v.reason },
            { name: ["finances", v.index, "userModifiedQTY"], value: user },
            { name: ["finances", v.index, "dateModifiedQTY"], value: dayjs().format("YYYY-MM-DD HH:mm:ss") },
            { name: ["finances", v.index, "allowEditQty"], value: true },
            { name: ["finances", v.index, "editStatus"], value: orderId ? true : false }
        ]);
        setVsbModalEditQty(false);
        formReason.resetFields();
    };

    const getPatient = async () => {
        if (!patientId) return setPatient(null)
        const res = await callApi(listApi, "GetPatientsByPatientId", patientId)
        setPatient(res);
    }

    const insertOrder = async (finances, upsertTransfusion) => {
        let findXray = find(finances, ["financeType", "X"]);
        if (findXray && !doctorId) {
            notiWarning({ message: "มีการสั่งค่า X-RAY", description: "กรุณาระบุแพทย์ผู้สั่ง" })
            return;
        }
        let transfusionReq = null;
        if (upsertTransfusion) {
            const prev = transfusionReactionByOrder;
            const prmKey = prev?.transfusionReactionId || null;
            const crrDate = dayjs().format("YYYY-MM-DD hh:mm:ss");
            const transfusionDate = prev?.transfusionDate ? dayjs(prev?.transfusionDate).format("YYYY-MM-DD HH:mm:ss") : dayjs(prev?.transfusionDate).format("YYYY-MM-DD HH:mm:ss");
            const transfusionTime = prev?.transfusionTime ? dayjs(prev?.transfusionTime).format("YYYY-MM-DD HH:mm:ss") : dayjs(prev?.transfusionTime).format("YYYY-MM-DD HH:mm:ss");
            transfusionReq = {
                ...prev,
                transfusionDate: transfusionDate,
                transfusionTime: transfusionTime,
                userCreated: prmKey ? prev.userCreated : user,
                dateCreated: prmKey ? prev.dateCreated : crrDate,
                userModified: prmKey ? user : null,
                dateModified: prmKey ? prev.dateModified : crrDate
            };
        }
        const req = {
            "requestData": finances,
            transfusionReactionReq: transfusionReq
        }
        setLoading(true);
        const res = await insertNewOrder(req)
        setLoading(false);
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกค่าใช้จ่าย" })
            if (autoAccept) {
                postLabOrder(res?.id);
                sendRequestLISAllabis(res?.id);
            }
            document.getElementById("Reset_Finance_Form")?.click()
            reloadData()
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย" })
        return res
    }

    const insertAppActOrder = async (dts) => {
        let findXray = find(dts, ["financeType", "X"]);
        if (findXray && !doctorId) {
            notiWarning({ message: "มีการสั่งค่า X-RAY", description: "กรุณาระบุแพทย์ผู้สั่ง" })
            return;
        }
        setLoading(true)
        const res = await callApi(listApi, "InsAppActNewOrder", dts)
        setLoading(false)
        if (res?.isSuccess) notiSuccess({ message: "บันทึกค่าใช้จ่าย Appoint activity" })
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย Appoint activity" })
        return res
    }

    const insertFinancesByOrderId = async (dts) => {
        let findXray = find(dts, ["financeType", "X"]);
        if (findXray && !doctorId) {
            notiWarning({ message: "มีการสั่งค่า X-RAY", description: "กรุณาระบุแพทย์ผู้สั่ง" })
            return;
        }
        const res = await callApi(listApi, "InsertFinances", dts)
        if (res?.isSuccess) notiSuccess({ message: "เพิ่มค่าใช้จ่าย" })
        if (!res?.isSuccess) notiError({ message: "เพิ่มค่าใช้จ่าย" })
        return res
    }

    const updateFinances = async (dts) => {
        const res = await callApi(listApi, "UpdateFinances", dts)
        if (res?.isSuccess) notiSuccess({ message: "แก้ไขค่าใช้จ่าย" })
        if (!res?.isSuccess) notiError({ message: "แก้ไขค่าใช้จ่าย" })
        return res
    }

    const deleteFinances = async (dts) => {
        const res = await callApi(listApi, "DeleteFinances", dts)
        if (res?.isSuccess) notiSuccess({ message: "ลบค่าใช้จ่าย" })
        if (!res?.isSuccess) notiError({ message: "ลบค่าใช้จ่าย" })
        return res
    }

    const chkConsitionsForInsert = async (dts, upsertTransfusion) => {
        let res
        switch (workType) {
            case "xray":
                if (!resultFlag) return insertOrder(dts, upsertTransfusion);
                let temp = [...dts];
                let listExpenseDF = find(expenses, ["financeType", "DF"]);
                let listExpenseX = find(expenses, ["financeType", "X"]);
                map(temp, (o, i) => {
                    if (o.financeType === "X") {
                        let findDfExId = find(listExpenseX.expenses, ["expenseId", o.expenseId]);
                        if (!findDfExId?.dfExpId) return;
                        if (!findDfExId?.dfXrayFlag) return;
                        if (!findDfExId?.dfRate && !findDfExId?.dfPercentage) return;
                        let findDfExIdDetails = find(listExpenseDF.expenses, ["expenseId", findDfExId.dfExpId]);
                        let quantity = toNumber(o.quantity);
                        let dfRate = 0;
                        if (findDfExId.dfRate) dfRate = toNumber(findDfExId.dfRate);
                        if (findDfExId.dfPercentage) dfRate = percentToNumber(toNumber(findDfExId.dfPercentage), toNumber(o.price));
                        let amount = dfRate * quantity;
                        let dfFinance = {
                            ...o,
                            appActId: null,
                            financeType: "DF",
                            code: findDfExIdDetails.code,
                            expenseId: findDfExIdDetails.expenseId,
                            expenseName: findDfExIdDetails.name,
                            price: String(dfRate),
                            amount: String(amount),
                            cashNotReturn: String(amount),
                            copay: String(amount),
                            overdue: String(amount),
                            billgroup: findDfExIdDetails?.billgroup,
                            actgroup: findDfExIdDetails?.actgroup,
                            accgroup: findDfExIdDetails?.accgroup
                        };
                        temp.splice(i + 1, 0, dfFinance);
                    }
                });
                res = insertOrder(dts, upsertTransfusion)
                break;
            default:
                const findAppointAct = find(dts, "appActId");
                if (findAppointAct) res = insertAppActOrder(dts);
                if (!findAppointAct) res = insertOrder(dts, upsertTransfusion);
                break
        }
        if (res?.isSuccess) reloadData();
    }

    const chkConsitionsForUpdate = async (dts) => {
        const forUpdate = filter(dts, o => o.financeId && o.editStatus)
        const forInsert = filter(dts, o => !o.financeId)
        const forDelete = differenceBy(finances, dts, "financeId")
        setLoading(true)
        let resUpdate
        let resInsert
        let resDelete
        if (forUpdate.length) resUpdate = await updateFinances(forUpdate)
        if (forInsert.length) resInsert = await insertFinancesByOrderId(forInsert)
        if (forDelete.length) resDelete = await deleteFinances(forDelete)
        setLoading(false)
        if (resUpdate?.isSuccess || resInsert?.isSuccess || resDelete?.isSuccess) {
            getFinancesByOrderId(orderId)
            getOrders(patientId, orderId)
            reloadData()
        }
    }

    const postLabOrder = async orderId => {
        if (!orderId) return;
        const req = {
            status: "A",
            orderId: orderId,
            labgroup: null,
            financeId: null
        };
        await callApi(listApi, "PostLabOrder", req);
    };

    const sendRequestLISAllabis = async orderId => {
        if (!orderId) return;
        let req = {
            status: "A",
            orderId: orderId,
            labgroup: null,
            financeId: null
        };
        await callApi(listApi, "LISAllabisRequest", req);
    };

    const handleClickBtn = (name) => {
        switch (name) {
            case "addList": return setVsbAddList(toWorkType)
            case "delSelectedFinances":
                delSelectedFinances(selectedRowKeys)
                break
            case "addFinance":
                document.getElementById("add-Finance").click()
                break
            case "transfusionReaction":
                setVsbTransfusionReaction(true);
                break
            case "diagAndAncRequest":
                setVsbDiagAndAncRequest(true);
                break
            default:
                break;
        }
    }

    const handleChangeExpense = (index, record, detail) => {
        let {
            lifelabflag,
            labagian,
            labagianFrequency,
            docConfirm,
            expenseId,
        } = detail;
        const resetFieldIndex = () => {
            setTimeout(() => {
                form.setFields([{
                    name: ["finances", index, "expenseId"],
                    value: null
                }, {
                    name: ["finances", index, "status"],
                    value: null
                }]);
            }, 1500);
        };
        checkLabAlertNoti(detail, resetFieldIndex);

        if (lifelabflag === "Y") { }
        if (labagian || labagianFrequency) {
            checkLabAgain(detail, resetFieldIndex);
        }
        if (docConfirm === "Y") {
            checkDoctorTypes(detail, index, resetFieldIndex);
        } else {
            form.setFields([{
                name: ["finances", index, "status"],
                value: null
            }]);
        }
        form.setFields([
            { name: ["finances", index, "editStatus"], value: orderId ? true : false },
            { name: ["finances", index, "financeType"], value: detail?.financeType.toUpperCase() },
            { name: ["finances", index, "expenseName"], value: detail?.name },
            { name: ["finances", index, "code"], value: detail?.code },
            { name: ["finances", index, "autoMeaning"], value: detail?.autoMeaning },
            { name: ["finances", index, "notOffer"], value: detail?.notOffer },
        ]);
        if (detail?.notDiscountFlag === "Y") {
            form.setFields([{
                name: ["finances", index, "notDiscountFlag"],
                value: "Y"
            }]);
        }
        let currentDate = dayjs().startOf("day");
        let dateEff = detail?.dateeff ? dayjs(detail?.dateeff, "MM/DD/YYYY").startOf("day") : null;
        let dateExp = detail?.dateexp ? dayjs(detail?.dateexp, "MM/DD/YYYY").endOf("day") : null;
        if (dateEff && !dateExp) {
            if (!(dateEff <= currentDate)) {
                form.setFields([{
                    name: ["finances", index, "expenseId"],
                    value: null
                }]);
                return Modal.warning(modalWarning("notAvailable"));
            } else {
                const test = async () => {
                    setLoading(true);
                    await getRateByRightId({ index: index, expenseId: expenseId, opdRightId: record?.opdRightId, admitRightId: record?.admitRightId });
                    setCurrentFinanceRowKey(record.key);
                    setLoading(false);
                };
                test();
            }
        }
        if (dateExp && !dateEff) {
            if (!(dateExp >= currentDate)) {
                form.setFields([{
                    name: ["finances", index, "expenseId"],
                    value: null
                }]);
                return Modal.warning(modalWarning("notAvailable"));
            } else {
                const test = async () => {
                    setLoading(true);
                    await getRateByRightId({ index: index, expenseId: expenseId, opdRightId: record?.opdRightId, admitRightId: record?.admitRightId });
                    setCurrentFinanceRowKey(record.key);
                    setLoading(false);
                };
                test();
            }
        }
        if (dateEff && dateExp) {
            if (!(dateEff <= currentDate && dateExp >= currentDate)) {
                form.setFields([{
                    name: ["finances", index, "expenseId"],
                    value: null
                }]);
                return Modal.warning(modalWarning("notAvailable"));
            } else {
                const test = async () => {
                    setLoading(true);
                    await getRateByRightId({ index: index, expenseId: expenseId, opdRightId: record?.opdRightId, admitRightId: record?.admitRightId });
                    setCurrentFinanceRowKey(record.key);
                    setLoading(false);
                };
                test();
            }
        }
        if (!dateEff && !dateExp) {
            const test = async () => {
                setLoading(true);
                await getRateByRightId({ index: index, expenseId: expenseId, opdRightId: record?.opdRightId, admitRightId: record?.admitRightId });
                setCurrentFinanceRowKey(record.key);
                setLoading(false);
            };
            test();
        }
        let inTimeFlag = detail?.intimeFlag;
        if (inTimeFlag === "Y") {
            let startTime = "06:00:00";
            let endTime = "16:00:00";
            let currentTime = dayjs(); /* .startOf("day") */
            let timeEff = dayjs(startTime, "HH:mm:ss"); /* .startOf("day") */
            let timeExp = dayjs(endTime, "HH:mm:ss"); /* .endOf("day") */

            let inTime = currentTime.isBetween(timeEff, timeExp);
            if (inTime) {
                const test = async () => {
                    setLoading(true);
                    await getRateByRightId({ index: index, expenseId: expenseId, opdRightId: record?.opdRightId, admitRightId: record?.admitRightId });
                    setCurrentFinanceRowKey(record.key);
                    setLoading(false);
                };
                test();
            } else {
                form.setFields([{
                    name: ["finances", index, "expenseId"],
                    value: null
                }]);
                return Modal.warning(modalWarning("notInTime"));
            }
        }
        let formValues = form.getFieldsValue().finances;
        let dataOnselect = formValues[index];
        if (dataOnselect.expenseId !== null) {
            calcBalance(index);
        }
    }

    const handleChangeFieldMoney = (index, name) => {
        const finances = form.getFieldValue("finances")
        const crrRecord = finances[index]
        const quantity = toNumber(crrRecord?.quantity || 0);
        const price = toNumber(crrRecord?.price || 0);
        const amount = quantity * price;

        const casePrice = () => {
            form.setFields([
                { name: ["finances", index, "amount"], value: amount },
                { name: ["finances", index, "editStatus"], value: orderId ? true : false },
                { name: ["finances", index, "credit"], value: 0 },
                { name: ["finances", index, "cashReturn"], value: 0 },
                { name: ["finances", index, "cashNotReturn"], value: amount },
                { name: ["finances", index, "overdue"], value: amount },
            ]);
        }

        const caseQuantity = () => {
            if (crrRecord?.financeId) {
                const price = toNumber(crrRecord?.price || 0);
                const quantity = toNumber(crrRecord?.quantity || 0);
                let amount = price * quantity;
                let credit = toNumber(crrRecord?.credit || 0);
                credit = credit > amount ? amount : credit;
                let cashReturn = toNumber(crrRecord.cashReturn || 0);
                cashReturn = cashReturn > amount - credit ? amount - credit : cashReturn;
                let cashNotReturn = amount - credit - cashReturn;
                form.setFields([
                    { name: ["finances", index, "amount"], value: amount },
                    { name: ["finances", index, "credit"], value: credit < 0 ? 0 : credit },
                    { name: ["finances", index, "cashReturn"], value: cashReturn < 0 ? 0 : cashReturn },
                    { name: ["finances", index, "cashNotReturn"], value: cashNotReturn < 0 ? 0 : cashNotReturn },
                    { name: ["finances", index, "editStatus"], value: crrRecord.financeId ? true : false },
                    { name: ["finances", index, "userModifiedQTY"], value: user },
                    { name: ["finances", index, "dateModifiedQTY"], value: dayjs().format("YYYY-MM-DD HH:mm:ss") }
                ]);
            } else {
                getRateByRightId({ index: index, expenseId: crrRecord?.expenseId, quantity: quantity, opdRightId: crrRecord?.opdRightId, admitRightId: crrRecord?.admitRightId })
            }
        }

        const caseDiscount = () => {
            form.setFields([{ name: ["finances", index, "editStatus"], value: orderId ? true : false }]);
            let dsc = Number(crrRecord?.discount || 0);
            const dscLimit = Number(crrRecord?.amount || 0) - (Number(crrRecord?.credit || 0) + Number(crrRecord?.cashReturn || 0));
            if (dsc > dscLimit) {
                if (dscLimit > dscBalance) {
                    noti(false, `ใช้ส่วนลดได้ไม่เกิน ${dscBalance || 0}`, " ");
                    form.setFields([{ name: ["finances", index, "discount"], value: dscBalance }]);
                }
                if (dscLimit <= dscBalance) {
                    form.setFields([{ name: ["finances", index, "discount"], value: dscLimit }]);
                }
            }
            if (dsc <= dscLimit) {
                if (dsc > dscBalance) {
                    noti(false, `ใช้ส่วนลดได้ไม่เกิน ${dscBalance || 0}`, " ");
                    form.setFields([{ name: ["finances", index, "discount"], value: dscBalance }]);
                }
                if (dsc <= dscBalance) {
                    form.setFields([{ name: ["finances", index, "discount"], value: dsc }]);
                }
            }
        }

        const caseCashReturn = () => { }
        switch (name) {
            case "price":
                casePrice()
                break
            case "quantity":
                caseQuantity()
                break
            case "discount":
                caseDiscount()
                break
            case "cashReturn":
                caseCashReturn()
                break
            default: break;
        }
        setFriend(p => !p);
    }

    const handleChangeField = ({ index = null, name = null, record = null, details = null }) => {
        form.setFields([{ name: ["finances", index, "editStatus"], value: orderId ? true : false }]);
        switch (name) {
            case "financeType":
                form.setFields([
                    { name: ["finances", index, "expenseId"], value: null },
                    { name: ["finances", index, "price"], value: null },
                    { name: ["finances", index, "amount"], value: null },
                    { name: ["finances", index, "credit"], value: null },
                    { name: ["finances", index, "cashReturn"], value: null },
                    { name: ["finances", index, "cashNotReturn"], value: null },
                    { name: ["finances", index, "discount"], value: null },
                    { name: ["finances", index, "overdue"], value: null },
                ])
                break;
            case "expenseId": return handleChangeExpense(index, record, details)
            case "opdRightId":
                if (!record?.financeId) getRateByRightId({
                    index: index,
                    expenseId: record?.expenseId,
                    opdRightId: record?.opdRightId || null,
                });
                form.setFields([{ name: ["finances", index, "cashFlag"], value: details?.cashflag }]);
                setOpdRightIdSelected(record?.opdRightId)
                break;
            case "admitRightId":
                if (!record?.financeId) getRateByRightId({
                    index: index,
                    expenseId: record?.expenseId,
                    admitRightId: record?.admitRightId || null
                });
                form.setFields([{ name: ["finances", index, "cashFlag"], value: details?.cashflag }]);
                setAdmitRightIdSelected(record?.admitRightId)
                break;
            default:
                break;
        }
        setFriend(p => !p)
    }

    const handleBlurField = ({ event, index = null, name = null, record = null, }) => {
        switch (name) {
            case "quantity":
                if (!record?.financeId) calcBalance(index)
                break;
            case "credit":
                let finances = form.getFieldValue("finances");
                const amount = toNumber(record?.amount || 0);
                const payment = toNumber(record?.payment || 0);
                let credit = toNumber(event.target.value || 0);
                let cashReturn = toNumber(record?.cashReturn || 0);
                let offer = toNumber(record?.offer || 0);

                credit = credit > amount ? amount : credit;
                cashReturn = cashReturn > amount - credit ? amount - credit : cashReturn;

                const cashNotReturn = amount - (credit + cashReturn);
                offer = record?.offerFlag === "Y" && record?.autoMeaning !== 'T' && record?.notOffer !== 'Y' ? cashNotReturn : 0
                const overdue = cashReturn + cashNotReturn - (payment || 0) - (offer || 0);

                finances[index].credit = credit;
                finances[index].cashReturn = cashReturn;
                finances[index].cashNotReturn = cashNotReturn;
                finances[index].offer = offer;
                finances[index].overdue = overdue;
                form.setFieldsValue({ finances: finances });
                if (credit > 0) calcBalance(index);
                break;
            case "cashReturn":
                const value = toNumber(event.target.value);
                if (isNumber(value)) {
                    let finances = form.getFieldValue("finances");
                    const amount = toNumber(record?.amount || 0);
                    const payment = toNumber(record?.payment || 0);
                    let credit = toNumber(record?.credit || 0);
                    let cashReturn = toNumber(value);
                    cashReturn = cashReturn > amount ? amount : cashReturn;
                    credit = amount - cashReturn;
                    if (record.cashFlag === "Y") credit = 0;
                    const cashNotReturn = amount - (credit + cashReturn);
                    const overdue = cashReturn + cashNotReturn - (payment || 0);
                    finances[index].credit = credit;
                    finances[index].cashReturn = cashReturn;
                    finances[index].cashNotReturn = cashNotReturn;
                    finances[index].overdue = overdue;
                    form.setFieldsValue({ finances: finances })
                    if (credit > 0) calcBalance(index);
                }
                break;
            case "discount":
                setDscBalance(p => p - record.discount);
                break;
            case "price":
                chkRateByUser(index, record)
                break;
            default:
                break;
        }
        setFriend(p => !p)
    }

    const handleFocusField = ({ event, name = null, record }) => {
        const dsc = Number(event.target.value || 0);
        switch (name) {
            case "discount":
                setDscBalance(p => p + dsc);
                break;
            case "credit":
                setCurrentFinanceRowKey(record.key);
                break;
            case "cashReturn":
                setCurrentFinanceRowKey(record.key);
                break;
            default:
                break;
        }
    }

    const handleClickBtnEditQty = (e, index, record) => {
        e.stopPropagation();
        if (!reasonQty) return form.setFields([{ name: ["finances", index, "allowEditQty"], value: true }]);
        const allowed = () => {
            setVsbModalEditQty(true);
            formReason.setFieldsValue({ index: index });
        };
        const notAllowed = type => {
            let findX = find(listEditerOrderQty, ["value", type]);
            if (findX) return noti(false, "จำกัดสิทธิ์การแก้ไขเฉพาะ", findX?.label);
        };
        switch (lockQTYOrderUserType) {
            case "1":
                if (record?.userCreated === user) return allowed();
                return notAllowed(lockQTYOrderUserType);
            case "2":
                if (record?.userAccepted === user) return allowed();
                return notAllowed(lockQTYOrderUserType);
            case "3":
                if (record?.userCreated === user || record?.userAccepted === user) return allowed();
                return notAllowed(lockQTYOrderUserType);
            default:
                return allowed();
        }
    }

    const duplicateRecord = async index => {
        let allCharge = await form.getFieldValue("finances");
        let dataOnselect = allCharge[index];
        let arrayObjKeysForOmit = [
            "financeId", "financeType", "expenseId",
            "opdRightId", "price", "quantity", "amount",
            "copay", "discount", "cashNotReturn", "cashReturn",
            "overdue", "xrayResultFlag", "prevCredit", "key", "cashFlag"
        ];
        let pickObj = pick(dataOnselect, arrayObjKeysForOmit);
        if (dataOnselect?.expenseId) {
            form.setFieldsValue({
                finances: [{
                    ...pickObj,
                    key: nanoid(),
                    editStatus: false,
                    financeId: null
                }, ...allCharge]
            });
        }
    };

    const handleSelcetPackage = async (packageId) => {
        setLoading(true);
        form.setFieldsValue({ packageId: null });
        const res = await callApi(listApi, "GetExpenseByFormulaId", packageId);
        setLoading(false)
        if (res?.length) return addListExpense(res)
    }

    const handleChangeToWork = (workId) => {
        const work = find(optionsToWork, ["value", workId])
        setToWorkType(work?.dataother1 || null);
    }

    const handleAddListExpense = (dts) => {
        setVsbAddList(null)
        const tempExpenses = find(expenses, ["financeType", "ALL"]).expenses
        const mappingDts = map(dts, o => {
            const expense = find(tempExpenses, ["expenseId", o])
            return {
                financeType: expense?.financeType?.toUpperCase(),
                expenseId: expense?.expenseId,
                quantity: "1",
                code: expense?.code,
            }
        })
        return addListExpense(mappingDts)
    }

    const handleClickResetFinanceForm = (dts) => {
        form.resetFields()
        let toWork = null;
        let fromWork = null;
        let financeType = null;
        switch (workType) {
            case "xray":
                toWork = centralXray?.toString();
                fromWork = centralXray?.toString();
                financeType = "X";
                break;
            case "lab":
                toWork = centralLab?.toString();
                fromWork = centralLab?.toString();
                financeType = "L";
                break;
            default:
                fromWork = dts?.workId;
                toWork = dts?.workId;
                financeType = "S";
                break;
        }
        form.setFieldsValue({
            orderDate: dayjs(),
            fromWork: fromWork,
            toWork: toWork,
            finances: [{
                key: nanoid(),
                financeId: null,
                financeType: financeType,
                opdRightId: dts?.opdRightId,
                admitRightId: dts?.admitRightId,
                prevCredit: 0,
            }]
        })
    }

    const handleCheck = (e, name) => {
        const finances = form.getFieldValue("finances")
        let mapping = []
        switch (name) {
            case "rushFlag":
                mapping = map(finances, o => {
                    if (o?.status === "A") {
                        return {
                            ...o
                        };
                    } else {
                        return {
                            ...o,
                            editStatus: true
                        };
                    }
                });
                form.setFieldsValue({
                    finances: mapping
                });
                break
            case "notResultFlag":
                mapping = map(finances, o => {
                    return {
                        ...o,
                        editStatus: o.financeId ? true : false,
                        notResultFlag: o.financeType === "X" ? e.target.checked ? "Y" : null : null,
                        xrayResultFlag: o.financeType === "X" ? !e.target.checked ? "Y" : null : null
                    };
                });
                form.setFieldsValue({
                    finances: mapping,
                    notResultFlag: e.target.checked ? "Y" : null,
                    resultFlag: e.target.checked ? null : "Y",
                });
                break;
            case "resultFlag":
                mapping = map(finances, o => {
                    return {
                        ...o,
                        editStatus: o.financeId ? true : null,
                        xrayResultFlag: o.financeType === "X" ? e.target.checked ? "Y" : null : null,
                        notResultFlag: o.financeType === "X" ? !e.target.checked ? "Y" : null : null
                    };
                });
                form.setFieldsValue({
                    finances: mapping,
                    resultFlag: e.target.checked ? "Y" : null,
                    notResultFlag: e.target.checked ? null : "Y",
                });
                break;
            default:
                break
        }
    }

    const manageOrder = (res) => {
        setFinances(res)
        const financeOrderWithoutDrug = filter(res, o => o.financeType !== "D" && o.financeType !== "M");
        const findStatusAorX = find(financeOrderWithoutDrug, o => o.status === "A" || o.status === "R");
        const mapping = map(financeOrderWithoutDrug, o => {
            const payment = o.payment ? toNumber(o.payment) : 0;
            const reminburse = o.reminburse ? toNumber(o.reminburse) : 0;
            const prevCredit = o.credit ? toNumber(o.credit) : 0;
            const findX = find(opdRightList, ["rightId", o.rightId]);
            const chkRate = calcExpense(o?.dateCalculatExpenses)
            const minRate = chkRate?.minRate || null
            const maxRate = chkRate?.maxRate || null
            let rateByUser = false
            if (payment === 0 && reminburse === 0 && o.status === null && o.lockFlag === null) {
                if (minRate) rateByUser = true
            }
            return {
                ...o,
                prevCredit: prevCredit,
                key: nanoid(),
                dateModifiedForOrder: o.dateModified ? dayjs(o.dateModified, "MM/DD/YYYY HH:mm:ss") : null,
                dateCreatedForOrder: o.dateCreated ? dayjs(o.dateCreated, "MM/DD/YYYY HH:mm:ss") : null,
                prevLockFlag: o.lockFlag,
                disabled: payment > 0 || reminburse > 0 || o.status === "X" || o.status === "R",
                cashFlag: findX?.cashFlag || null,
                resultFlag: o.resultFlag || null,
                notDiscountFlag: o.notDiscountFlag === "Y" ? o.notDiscountFlag : null,
                expenseCancelFlagY: o.code + " " + o.expenseName,
                rateByUser,
                minRate,
                maxRate,
            };
        });
        // console.log('mapping', mapping)
        const filterDailyNo = filter(mapping, "dailyNo");
        const filterStatusA = filter(mapping, ["status", "A"]);
        const filterStatusNotA = filter(mapping, o => o.status !== "A");
        const filterRushItem = filter(filterStatusNotA, ["rushFlag", "Y"]);
        let filterNotResultFlagItem = [];
        let findXrayResultFlag = null
        if (workType === "xray") {
            filterNotResultFlagItem = filter(mapping, ["notResultFlag", "Y"]);
            findXrayResultFlag = find(mapping, ["xrayResultFlag", "Y"]);
        }
        setDisabledRushCheckbox(mapping?.length === filterStatusA?.length);
        setDailyNo(filterDailyNo.length ? filterDailyNo[0]?.dailyNo : "-");
        form.setFieldsValue({
            finances: mapping,
            orderStatus: findStatusAorX?.status || null,
            notResultFlag: filterNotResultFlagItem.length === mapping.length,
            resultFlag: findXrayResultFlag || filterRushItem?.length > 0 ? true : false,
        })
        if (mapping?.length === 0) {
            notiWarning({ message: "Order ที่เลือกมีเฉพาะค่าใช้จ่ายยาหรือเวชภัณฑ์", description: " " })
        }
    }
    const delSelectedFinances = (keys) => {
        const mappingKeys = map(keys, o => { return { key: o } })
        const finances = form.getFieldValue("finances")
        const differences = differenceBy(finances, mappingKeys, 'key')
        form.setFieldsValue({ finances: differences })
        setSelectedRowKeys([])
    }
    const openNotificationWithIcon = (type, rightDetail) => {
        notification[type]({
            message: <label className="fw-bold" style={{
                fontSize: 18,
                color: "red"
            }}>
                ยอดค่าใช้จ่ายเกินวงเงินคงเหลือของสิทธิ์
            </label>,
            description: <>
                <label className="gx-text-primary me-1" style={{
                    fontSize: 16
                }}>
                    สิทธิ์
                </label>
                <label className="mb-1" style={{
                    fontSize: 16
                }}>
                    {rightDetail.rightName}
                </label>
                <br />
                <label className="gx-text-primary me-1" style={{
                    fontSize: 16
                }}>
                    มีวงเงินคงเหลือ
                </label>
                <label className="mb-1" style={{
                    fontSize: 18
                }}>
                    {rightDetail.newCreditForCurrent}
                </label>
            </>,
            duration: 10,
            style: {
                width: 500
            }
        });
    };
    const checkDoctype = (detail) => {
        const doctypes = {
            staffFlag: "s",
            residentFlag: "r",
            externFlag: "e",
            internFlag: "i",
            partTimeFlag: "p",
            notDocTypeFlag: "0"
        };
        // const findFlags = Object.keys(doctypes).filter(key => detail[key] === "Y");
        const findKeyDoctor = Object.keys(doctypes).find(key => doctypes[key].toLowerCase() === doctorTypeFromsession?.toLowerCase());
        let userCorrect = detail[findKeyDoctor] === "Y" ? true : false;
        return userCorrect
    }
    const calcBalance = index => {
        let finances = form.getFieldsValue().finances;
        let grouping = groupBy(finances, "opdRightId");
        if (grouping) {
            let mapping = map(listOpdRightFinanceBalance, o => {
                let size = Object.keys(grouping).length;
                for (let i = 0; i < size; i++) {
                    let objKey = Object.keys(grouping)[i];
                    if (objKey === o.opdRightId) {
                        o.finances = Object.values(grouping)[i];
                    }
                }
                o.sumCredit = o.finances ? sumBy(map(o.finances, x => {
                    return {
                        credit: x.credit ? toNumber(x.credit) : 0
                    };
                }), "credit") : 0;
                o.sumPrevCredit = o.finances ? sumBy(map(o.finances, x => {
                    return {
                        prevCredit: x.prevCredit ? toNumber(x.prevCredit) : 0
                    };
                }), "prevCredit") : 0;
                return o;
            });
            let finded = find(mapping, ["opdRightId", finances[index].opdRightId]);
            if (isNumber(finded?.balance)) {
                let listFinanceToNumber = map(finded.finances, o => {
                    return {
                        ...o,
                        amount: toNumber(o.amount),
                        credit: toNumber(o.credit),
                        cashReturn: toNumber(o.cashReturn)
                    };
                });
                let listFinanceWithoutCurrent = filter(listFinanceToNumber, o => o.key !== currentFinanceRowKey);
                let newListFinance = filter(listFinanceWithoutCurrent, o => !o.financeId);
                let oldListFinance = filter(listFinanceWithoutCurrent, "financeId");
                let sumCreditOfOldListFinance = sumBy(oldListFinance, "credit");

                let balance = finded.balance;
                let sumPrevCredit = finded.sumPrevCredit;
                if (sumCreditOfOldListFinance !== sumPrevCredit) {
                    if (sumCreditOfOldListFinance > sumPrevCredit) {
                        let diff = sumCreditOfOldListFinance - sumPrevCredit;
                        balance = balance - diff;
                    }
                    if (sumCreditOfOldListFinance < sumPrevCredit) {
                        let diff = sumPrevCredit - sumCreditOfOldListFinance;
                        balance = balance + diff;
                    }
                }
                let currentListFinance = find(listFinanceToNumber, ["key", currentFinanceRowKey]);
                let currentCredit = currentListFinance?.credit;
                let sumPrevCreditCurrentListFinance = sumBy(currentListFinance, "prevCredit");
                let sumCreditNewListFinance = sumBy(newListFinance, "credit");
                let currentAmount = currentListFinance?.amount || 0;
                let currentCashReturn = currentListFinance?.cashReturn || 0;
                let newCreditForCurrent = balance - sumCreditNewListFinance - sumPrevCreditCurrentListFinance;
                newCreditForCurrent = currentCredit > newCreditForCurrent ? newCreditForCurrent : currentCredit;
                finded.currentAmount = currentAmount;
                finded.currentCashReturn = currentCashReturn > currentAmount - newCreditForCurrent ? currentAmount - newCreditForCurrent : currentCashReturn;
                finded.newCreditForCurrent = newCreditForCurrent;
                if (finded?.sumCredit - finded?.sumPrevCredit > finded?.balance) {
                    if (listOpdRightFinanceBalance.length === 1) {
                        openNotificationWithIcon("warning", finded);
                        let newCashNotReturn = finded.currentAmount - finded.newCreditForCurrent - finded.currentCashReturn;
                        form.setFields([
                            {
                                name: ["finances", index, "credit"],
                                value: finded.newCreditForCurrent
                            }, {
                                name: ["finances", index, "cashReturn"],
                                value: finded.currentCashReturn
                            }, {
                                name: ["finances", index, "cashNotReturn"],
                                value: newCashNotReturn
                            }, {
                                name: ["finances", index, "overdue"],
                                value: finded.currentCashReturn + newCashNotReturn
                            },
                        ]);
                    }
                    if (listOpdRightFinanceBalance.length > 1) {
                        finded.index = index;
                        setVsbOverBalanceDetail(finded);
                        setVsbOverBalanceModal(true);
                    }
                }
            }
        }
    };
    const showPopupText = text => {
        toast.info(text, {
            position: "top-right",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light"
        });
    };

    const getRateByRightId = async ({ index = null, expenseId = null, opdRightId = null, admitRightId = null, quantity = 1 }) => {
        let right = null
        if (!admitId) right = find(opdRightList, ["opdRightId", opdRightId])
        if (admitId) right = find(admitRightList, ["admitRightId", admitRightId])

        const finances = form.getFieldValue("finances");
        const rateResult = await getExpenseRate({ expenseId: expenseId, rightId: right?.rightId });

        if (rateResult?.popUp) showPopupText(rateResult.popUp)
        rateResult.rateByUser = rateResult?.minRate ? true : false;

        const valuesForSetFormAgain = map(finances, (o, indx) => {
            if (indx !== index) return o
            const rate = toNumber(rateResult?.rate || 0);
            const amount = rate * quantity;
            const credit = toNumber(rateResult?.credit || 0) * quantity;
            const cashReturn = toNumber(rateResult?.cashReturn || 0) * quantity;
            const cashNotReturn = (amount - (cashReturn + credit));
            const payment = toNumber(o?.payment || 0) * quantity;

            console.log('right', right)

            let offer = right?.offerFlag === "Y" && o.autoMeaning !== 'T' && o.notOffer !== 'Y' ? cashNotReturn : 0

            o.price = rateResult.rateByUser ? null : rate;
            o.minRate = rateResult.minRate;
            o.maxRate = rateResult.maxRate;
            o.rateByUser = rateResult.rateByUser;
            o.quantity = quantity;
            o.amount = amount;
            o.claim = cashReturn;
            o.copay = cashNotReturn < 0 ? 0 : cashNotReturn;
            o.cashReturn = cashReturn;
            o.cashNotReturn = cashNotReturn < 0 ? 0 : cashNotReturn;
            o.offer = offer < 0 ? 0 : offer;
            o.overdue = (cashReturn + cashNotReturn) - payment;
            o.credit = credit;
            o.editStatus = orderId ? true : false;
            o.disablePrice = !rateResult.rateByUser;
            o.cashFlag = right?.cashFlag;
            o.offerFlag = right?.offerFlag;
            return o;
        });
        form.setFieldsValue({ finances: valuesForSetFormAgain });
        setFriend(p => !p);
    };

    const expenseByFinanceType = index => {
        const finances = form.getFieldValue("finances");
        const type = finances[index]?.financeType
        const finded = find(expenses, ["financeType", type]);
        return finded?.expenses || [];
    };

    const checkLabAgain = async (detail, resetFieldIndex) => {
        let {
            name,
            expenseId,
        } = detail;
        const res = await callApi(listApi, "GetCheckLabagian", `?PatientId=${patientId}&ExpenseId=${expenseId}`);
        if (!res.isSuccess) return;
        if (res?.responseData?.isLabagian === "N") {
            if (res?.responseData?.lockLabagian === "Y") {
                resetFieldIndex()
            }
            labAlertNoti({
                labName: `${name} เคยมีการสั่งในช่วง ${res.responseData?.countExaminedDate} วัน ${res?.responseData?.lockLabagian === "Y" ? "" : ""}`,
                titleMessage: "แจ้งเตือนสั่ง LAB ซ้ำ",
                descriptionMessage: `วันที่สั่งล่าสุด ${dayjs(res.responseData?.dateCreated, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY ")} Order No  ${res.responseData?.orderId}`,
                notiLabStyle: redNoti,
                notiLabFontStyle: "#ff7272",
                textOrIcon: "RLU"
            });
        }

    };
    const checkDoctorTypes = (detail, index) => {
        let { name, } = detail;
        const doctypes = {
            staffFlag: "s",
            residentFlag: "r",
            externFlag: "e",
            internFlag: "i",
            partTimeFlag: "p",
            notDocTypeFlag: "0"
        };
        // const findFlags = Object.keys(doctypes).filter(key => detail[key] === "Y");
        const findKeyDoctor = Object.keys(doctypes).find(key => doctypes[key].toLowerCase() === doctorTypeFromsession?.toLowerCase());
        let userCorrect = detail[findKeyDoctor] === "Y" ? true : false;
        if (userCorrect) return
        if (!userCorrect) {
            form.setFields([{
                name: ["finances", index, "status"],
                value: "WD"
            }]);
        }
        labAlertNoti({
            labName: name,
            titleMessage: "รายการนี้ต้องยืนยันจากแพทย์ก่อนสั่ง",
            descriptionMessage: "ต้องได้รับการยืนยันจากแพทย์ก่อนทำรายการ",
            notiLabStyle: yellowNoti,
            notiLabFontStyle: "#ffab2b",
            textOrIcon: <Icon icon={doctorMaleOutline} width={25} />
        });
    };
    const checkLabAlertNoti = async (detail = {}) => {
        let {
            name,
        } = detail;
        const listLab = [{
            name: "lifelabflag",
            func: () => labAlertNoti({
                labName: name,
                titleMessage: "LAB ALERT",
                descriptionMessage: "เป็นรายการที่ควรสั่งตรวจได้แค่ 1 ครั้งในชีวิต ต้องการสั่ง ??",
                notiLabStyle: pinkNoti,
                textOrIcon: "AGE",
                notiLabFontStyle: "#fbcccc",
                needConfirm: true
            })
        }
        ];

        let nameField = listLab.reduce((a, b) => {
            a.push(b["name"]);
            return a;
        }, []);
        let labFlagList = pick(detail, nameField);
        await Promise.all(listLab.map(async val => {
            if (labFlagList[val.name] === "Y") {
                await val.func(val.name);
            }
        }));
    };
    const labAlertNoti = async ({
        labName = null,
        titleMessage = null,
        descriptionMessage = null,
        notiLabStyle,
        notiLabFontStyle,
        textOrIcon,
        needConfirm = false
    }) => {
        const key = `labAlertNoti{${nanoid()}`;
        const args = {
            // placement,
            key,
            className: "drugAlert red_border",
            style: { ...notiStyle, ...notiLabStyle },
            onClick: () => notification.close(key),
            message: <GenRow>
                <Col span={12} style={{ paddingRight: 0, paddingLeft: 50 }}>
                    <label style={{ fontSize: 22 }}>
                        {titleMessage ? titleMessage : "-"}
                    </label>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <label style={{ fontSize: 12 }}>
                        HN {patient?.hn} {patient?.displayName}
                    </label>
                </Col>
            </GenRow>,
            description: <GenRow align="bottom">
                <Col span={20} style={{ paddingRight: 0, paddingLeft: 50 }}>
                    <div>
                        <label style={{ fontSize: 22 }}>
                            รายการ {labName ? labName : "-"}
                        </label>
                    </div>
                    <div>
                        <label style={{ fontSize: 22 }}>
                            {descriptionMessage ? descriptionMessage : ""}
                        </label>
                    </div>
                </Col>
                {
                    needConfirm && <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                        <RedBtn type="default" onClick={() => notification.close(key)}>
                            ยืนยัน
                        </RedBtn>
                    </Col>
                }
            </GenRow>,
            icon: <div style={{ ...iconBg, background: notiLabFontStyle }}>{textOrIcon ? textOrIcon : "-"} </div>,
            duration: 0
        };
        notification.open(args);
        return false;
    };
    const warnigMessage = name => {
        let modalTitle = null;
        let modalMassage = null;
        switch (name) {
            case "notAvailable":
                modalTitle = "ค่าใช้จ่ายหมดอายุ";
                modalMassage = "ไม่สามารถเพิ่มค่าใช้จ่ายได้";
                break;
            case "notInTime":
                modalTitle = "ไม่สามารถสั่งนอกเวลา";
                modalMassage = "06:00 น. - 16:00 น.";
                break;
            case "orderAcceptOrReject":
                modalTitle = "แจ้งเตือน Order ถูก Accept หรือ Reject แล้ว";
                modalMassage = "ไม่สามารถคีย์ค่าใช้จ่ายเพิ่มได้ !";
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
    const addListExpense = async (dts) => {
        setLoading(true);
        let right = null
        if (!admitId) right = find(opdRightList, ["opdRightId", opdRightIdSelected])
        if (admitId) right = find(admitRightList, ["admitRightId", admitRightIdSelected])
        const promises = map(dts, o => {
            return getExpenseRate({ expenseId: o.expenseId, rightId: right?.rightId || "x000000" }).then(value => {
                let {
                    rate = null,
                    credit = "0",
                    cashReturn = "0",
                    cashNotReturn = "0",
                    minRate = null,
                    maxRate = null
                } = value;
                const rateByUser = minRate ? true : false;
                rate = rate ? Number(rate) : 0;
                credit = credit ? Number(credit) * Number(o?.quantity || 0) : "0";
                cashReturn = cashReturn ? Number(cashReturn) * Number(o?.quantity || 0) : "0";
                cashNotReturn = cashNotReturn ? Number(cashNotReturn) * Number(o?.quantity || 0) : "0";
                minRate = minRate ? Number(minRate) * Number(o?.quantity || 0) : "0";
                maxRate = maxRate ? Number(maxRate) * Number(o?.quantity || 0) : "0";
                let amount = rate ? Number(rate) * Number(o?.quantity || 0) : 0;
                return {
                    key: nanoid(),
                    financeId: null,
                    financeType: o.financeType,
                    expenseId: o.expenseId,
                    quantity: o?.quantity,
                    code: o.code,
                    opdRightId: opdRightIdSelected,
                    admitRightId: admitRightIdSelected,
                    rightId: right?.rightId,
                    price: rate,
                    amount: amount,
                    credit: credit,
                    cashReturn: cashReturn,
                    cashNotReturn: cashNotReturn,
                    minRate: minRate,
                    maxRate: maxRate,
                    rateByUser: rateByUser,
                    disablePrice: !rateByUser,
                    cashFlag: right?.cashFlag,
                };
            });
        });
        return Promise.all(promises).then(result => {
            const finances = form.getFieldValue("finances") || [];
            form.setFieldsValue({ finances: [...result, ...finances] });
            setLoading(false);
        });
    }
    const chkTransfusionReaction = () => {
        // console.log('chkTransfusionReaction :>> ');
        const dataSource = form.getFieldValue("finances")
        const expensesTypeL = find(expenses, ['financeType', "L"]).expenses
        // console.log('expensesTypeL :>> ', expensesTypeL);
        let warning = false;
        let upsertTransfusion = false;
        const transfusion = transfusionReactionByOrder;
        map(dataSource, f => {
            const findByExpense = find(expensesTypeL, ["expenseId", f.expenseId]);
            if (findByExpense?.diagFlag) {
                upsertTransfusion = true;
                if (!transfusion?.diagnosisL) {
                    warning = true;
                    notiWarning({ message: "สั่งค่าใช้จ่ายที่จำเป็นต้องระบุ Diagnosis", description: "กรุณาระบุ Diagnosis !" });
                    setVsbDiagAndAncRequest(true);
                }
            }
            if (findByExpense?.ancFlag) {
                upsertTransfusion = true;
                if (!transfusion?.ancL || !transfusion?.ancnoL) {
                    warning = true;
                    notiWarning({ message: "สั่งค่าใช้จ่ายที่จำเป็นต้องระบุ ANC", description: "กรุณาระบุ ANC !" });
                    setVsbDiagAndAncRequest(true);
                }
            }
            if (findByExpense?.transfusionReactionFlag) {
                upsertTransfusion = true;
                if (!transfusion?.clinicalDiag || !transfusion?.transfusionDate) {
                    warning = true;
                    notiWarning({ message: "สั่งค่าใช้จ่ายที่จำเป็นต้องระบุ Transfusion reaction request", description: "กรุณาระบุข้อมูล !" });
                    setVsbTransfusionReaction(true);
                }
            }
        });
        return {
            warningTransfusion: warning,
            upsertTransfusion: upsertTransfusion
        };
    };
    const reloadData = () => {
        onFinished()
        console.log('reloadData page', page)
        switch (page) {
            case "10.14":
                document.getElementById("Reload_Finances_10.14")?.click()
                close()
                break;
            case "22.6":
            case "21.2":
                document.getElementById("Reload_Finances_22.6")?.click()
                document.getElementById("Reload_AdmitRights_22.6")?.click()
                close()
                break;
            default:
                break;
        }
    }
    const chkRateByUser = (index) => {
        const finances = form.getFieldValue("finances");
        const crrFinance = finances[index]
        let price = crrFinance.price
        let amount
        const quantity = crrFinance.quantity
        const minRate = toNumber(crrFinance.minRate)
        const maxRate = toNumber(crrFinance.maxRate)
        if (price < minRate || price > maxRate) {
            if (price < minRate) price = minRate
            if (price > maxRate) price = maxRate
            amount = price * quantity
            form.setFields([
                { name: ["finances", index, "price"], value: price },
                { name: ["finances", index, "amount"], value: amount },
                { name: ["finances", index, "credit"], value: 0 },
                { name: ["finances", index, "cashReturn"], value: 0 },
                { name: ["finances", index, "cashNotReturn"], value: amount },
                { name: ["finances", index, "discount"], value: null },
                { name: ["finances", index, "overdue"], value: amount },
            ])
        }
    }
    // Effect
    useEffect(() => {
        if (!isFinanceTypesDownloaded) {
            getFinanceTypes()
            getWorkPlacesMas()
            getMasterPackages()
            getMasterCodeSpecimens()
            getCancelReason()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFinanceTypesDownloaded])
    useEffect(() => {
        getToWork(workType)
    }, [workType])
    useEffect(() => {
        getClinicsAndOpdRights(serviceId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId])
    useEffect(() => {
        getAdmitAndAdmitRights(admitId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [admitId])
    useEffect(() => {
        getPatient()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId])
    useEffect(() => {
        getTransfusionReaction(orderId)
        getFinancesByOrderId(orderId)
        getOrders(patientId, orderId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId])

    // Components
    const modalWarning = (name, width = 520) => {
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
            },
            width: width
        };
    };
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
            max = 100,
            min = 0,
            // value = null,
            // checked = false,
        } = fndByName;
        const genInput = () => {
            switch (inputType) {
                case "select":
                    return (
                        <Select
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
                        <Checkbox
                            disabled={disabled}
                            onChange={onChange}
                        >
                            <LabelText text={checkBoxLabel} />
                        </Checkbox>
                    );
                case "input":
                    return (
                        <Input
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
                            max={max}
                            min={min}
                        />
                    );
                case "radio":
                    return (
                        <Radio
                            className="data-value"
                            onChange={onChange}
                            onClick={onClick}
                        // value={value}
                        // checked={checked}
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
                        <DayjsTimePicker
                            className="data-value"
                            style={{ width: "100%" }}
                            format={"HH:mm"}
                        />
                    );
                default:
                    break;
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
    const GenBtnPrm = ({
        type = "primary",
        name = "",
        label = "",
        disabled = false,
        icon = false,
        ...props
    }) => {
        return <Button
            style={{ marginBottom: 0 }}
            type={type}
            disabled={disabled}
            onClick={() => handleClickBtn(name)}
            icon={icon}
            {...props}
        >{label}</Button>
    }
    const GenBtnDel = ({
        name = "",
        label = "",
        disabled = false,
        icon = false,
        ...props
    }) => {
        return <Button
            style={{ marginBottom: 0 }}
            type="danger"
            disabled={disabled}
            onClick={() => handleClickBtn(name)}
            icon={icon}
            {...props}
        >{label}</Button>
    }
    const PartsHeader = () => {
        const items = [
            // orderDate
            {
                name: "orderDate",
                label: "วันที่สั่ง",
                inputType: "datepicker",
                rules: rules,
            },
            // fromWork
            {
                name: "fromWork",
                label: "หน่วยส่ง",
                inputType: "select",
                rules: rules,
                options: optionsFromWork,
            },
            // toWork
            {
                name: "toWork",
                label: "หน่วยทำ",
                inputType: "select",
                rules: rules,
                options: optionsToWork,
                onChange: v => handleChangeToWork(v)
            },
            // packageId
            {
                name: "packageId",
                label: "Package",
                inputType: "select",
                options: optionsPackage,
                onChange: (v) => handleSelcetPackage(v)
                // rules: rules,
            },
        ]
        return <>
            <div hidden>
                <Form.Item name="orderStatus"><Input /></Form.Item>
                <Form.Item name="orderLockFlag"><Input /></Form.Item>
            </div>
            <GenRow align="bottom">
                <Col>
                    <div className='d-block'>
                        <LabelTopicPrimary className='me-1' text='Order No. :' />
                        <LabelTopic text={orderId || "-"} />
                    </div>
                    <div className='d-block'>
                        <LabelTopicPrimary className='me-1' text='Daily No. :' />
                        <LabelTopic text={dailyNo} />
                    </div>
                </Col>
                <Col span={12} xxl={3} xl={3} lg={6} md={6}>{GenFormItem(items, "orderDate")}</Col>
                <Col span={12} xxl={4} xl={4} lg={6} md={6}>{GenFormItem(items, "fromWork")}</Col>
                <Col span={12} xxl={4} xl={4} lg={6} md={6}>{GenFormItem(items, "toWork")}</Col>
                <Col span={12} xxl={4} xl={4} lg={6} md={6}>{GenFormItem(items, "packageId")}</Col>
                <Col>
                    <Form.Item label=" " style={{ marginBottom: 4 }}>
                        <GenBtnPrm
                            name='addList'
                            label='แบบรายการ'
                            disabled={
                                toWorkType === "LAB" ||
                                    toWorkType === "XRAY" ||
                                    toWorkType === "OR"
                                    ? false
                                    : true
                            }
                        />
                    </Form.Item>
                </Col>
            </GenRow>
        </>
    }
    const PartsTable = () => {
        const items = [
            // rushFlag
            {
                name: "rushFlag",
                // label: "วันที่สั่ง",
                checkBoxLabel: "ด่วน",
                inputType: "checkbox",
                disabled: disabledRushCheckbox || orderLockFlag,
                // onChange: e => handleCheck(e, "rushFlag")

            },
            // autoAccept
            {
                name: "autoAccept",
                // label: "วันที่สั่ง",
                checkBoxLabel: "Auto Accept",
                inputType: "checkbox",
                disabled: orderId
                    ? true
                    : orderLockFlag
                        ? true
                        : workType === "LAB" || workType === "XRAY"
                            ? false
                            : true
            },
            // notResultFlag
            {
                name: "notResultFlag",
                // label: "วันที่สั่ง",
                checkBoxLabel: "ไม่ต้องการผลอ่านฟิล์ม",
                inputType: "checkbox",
                onChange: e => handleCheck(e, "notResultFlag"),
                disabled: orderLockFlag
                    ? true
                    : workType === "xray"
                        ? false
                        : true,
            },
            // resultFlag
            {
                name: "resultFlag",
                // label: "วันที่สั่ง",
                checkBoxLabel: "ต้องการผลอ่านฟิล์ม",
                inputType: "checkbox",
                onChange: e => handleCheck(e, "resultFlag"),
                disabled: orderLockFlag
                    ? true
                    : workType === "xray"
                        ? false
                        : true,
            },
        ]
        // eslint-disable-next-line no-unused-vars
        const genInputNumber = ({ value = null, record = null, index = null, name = "", controls = false, rules, ...props }) => {
            // console.log('name', name)
            return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -8, marginTop: -8 }}>
                <Form.Item
                    name={[index, name]}
                    style={{ margin: 0 }}
                    rules={rules}
                >
                    <InputNumber
                        size='small'
                        style={{ width: "100%" }}
                        className='data-value'
                        controls={controls}
                        onChange={() => handleChangeFieldMoney(index, name)}
                        onBlur={(event) => handleBlurField({ event: event, index: index, name: name, record: record })}
                        onFocus={(event) => handleFocusField({ event: event, name: name, record: record })}
                        {...props}
                    />
                </Form.Item>
            </div>
        }
        // eslint-disable-next-line no-unused-vars
        const genInput = ({ value = null, record = null, index = null, name = "", rules = [], ...props }) => {
            return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -8, marginTop: -8 }}>
                <Form.Item
                    name={[index, name]}
                    style={{ margin: 0 }}
                    rules={rules}
                >
                    <Input
                        size='small'
                        style={{ width: "100%" }}
                        className='data-value'
                        {...props}
                    />
                </Form.Item>
            </div>
        }
        const columns = [
            {
                title: <LabelText text='ประเภท' />,
                dataIndex: "financeType",
                width: 95,
                fixed: "left",
                render: (v, r, i) => {
                    return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -8, marginTop: -8 }}>
                        <div hidden>
                            <Form.Item name={[i, "key"]}><Input /></Form.Item>
                            <Form.Item name={[i, "financeId"]}><Input /></Form.Item>
                            <Form.Item name={[i, "teeth"]}><Input /></Form.Item>
                            <Form.Item name={[i, "lockFlag"]}><Input /></Form.Item>
                            <Form.Item name={[i, "allowEditQty"]} valuePropName="checked"><Checkbox /></Form.Item>
                            <Form.Item name={[i, "reason"]}> <Input /></Form.Item>
                            <Form.Item name={[i, "userModifiedQTY"]}><Input /></Form.Item>
                            <Form.Item name={[i, "dateModifiedQTY"]}> <Input /></Form.Item>
                            <Form.Item name={[i, "resultFlag"]}> <Input /></Form.Item>
                            <Form.Item name={[i, "notResultFlag"]}> <Input /></Form.Item>
                        </div>
                        <Form.Item
                            name={[i, "financeType"]}
                            style={{ margin: 0 }}
                            rules={rules}
                        >
                            <Select
                                size='small'
                                autoFocus={i === 0}
                                style={{ width: "100%" }}
                                dropdownMatchSelectWidth={165}
                                className='data-value'
                                showSearch
                                optionFilterProp='label'
                                options={optionsFinanceType}
                                onChange={() => handleChangeField({ name: "financeType", index: i })}
                            />
                        </Form.Item>
                    </div>
                }
            },
            {
                title: <LabelText text='รายการค่าใช้จ่าย' />,
                dataIndex: "expenseId",
                render: (v, r, i) => {
                    return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -8, marginTop: -8 }}>
                        <Form.Item
                            name={[i, "expenseId"]}
                            style={{ margin: 0 }}
                        >
                            <Select
                                size='small'
                                loading={expensesLoading}
                                autoFocus={i === 0}
                                style={{ width: "100%" }}
                                className='data-value'
                                dropdownMatchSelectWidth={345}
                                showSearch
                                optionFilterProp='label'
                                filterSort={(optionA, optionB) => optionA.label.localeCompare(optionB?.label)}
                                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                options={expenseByFinanceType(i)}
                                onChange={(v, d) => handleChangeField({ name: "expenseId", index: i, record: r, details: d, })}
                                onInputKeyDown={event => {
                                    if (event.key === "Enter") {
                                        duplicateRecord(i);
                                    }
                                }}
                            />
                        </Form.Item>
                    </div>
                }
            },

            {
                title: <LabelText text='Specimen' />,
                dataIndex: "",
                align: "center",
                width: 90,
                render: (val, record, index) => {
                    return <>
                        <Form.Item hidden name={[index, "specimen"]}> <Select /></Form.Item>
                        <Form.Item hidden name={[index, "specimenVol"]}><InputNumber /></Form.Item>
                        <Form.Item hidden name={[index, "specimenSite"]}><Input /> </Form.Item>
                        <Form.Item hidden name={[index, "specimenRemark"]}> <Input /></Form.Item>
                        <Tooltip title="ระบุ Specimen">
                            <Button
                                style={{ margin: 0 }}
                                size="small"
                                shape="circle"
                                icon={<PlusOutlined
                                    className="gx-text-primary"
                                    onClick={e => {
                                        setVsbModalSpecimen(true);
                                        e.stopPropagation();
                                        formSpecimen.setFieldsValue({
                                            index: index,
                                            specimen: record.specimen,
                                            specimenVol: record.specimenVol,
                                            specimenSite: record.specimenSite,
                                            specimenRemark: record.specimenRemark
                                        });
                                    }} />}
                            />
                        </Tooltip>
                    </>;
                }
            },
            {
                title: <LabelText text='ราคา/หน่วย' />,
                dataIndex: "price",
                width: 100,
                render: (v, r, i) => {
                    const range = r.minRate ? `${r.minRate} - ${r.maxRate}` : null;
                    const disabled = !r.rateByUser || r.lockFlag === "Y" ? true : false;
                    return genInputNumber({
                        value: v || null,
                        record: r,
                        index: i,
                        name: "price",
                        className: "custom-antd-placeholder-danger-range data-value",
                        disabled: disabled,
                        placeholder: range,
                        rules: rules,
                    })
                }
            },
            {
                title: <LabelText text='จำนวน' />,
                dataIndex: "quantity",
                width: 80,
                render: (v, r, i) => {
                    const disabled = r?.disabled ? r?.disabled : r?.lockFlag === "Y";
                    return genInputNumber({
                        value: v || null,
                        record: r, index: i,
                        name: "quantity",
                        rules: rules,
                        controls: true,
                        min: 1,
                        disabled: orderLockFlag
                            ? true
                            : !r?.financeId
                                ? false
                                : r?.financeType === "L" || r?.financeType === "X"
                                    ? lockQTYOrder === "Y"
                                        ? !r?.allowEditQty
                                        : disabled
                                    : disabled
                    })
                }
            },
            {
                title: " ",
                width: 50,
                align: "center",
                render: (val, record, index) => {
                    const disabled = !record?.financeId ? true : record?.disabled ? true : record?.financeType === "L" || record?.financeType === "X" ? false : true
                    return <Tooltip
                        placement="top"
                        title={<LabelText text='แก้ไขจำนวน' />}
                    >
                        <Button
                            size="small"
                            shape="circle"
                            style={{ margin: 0 }}
                            icon={<EditOutlined style={{ color: "blue" }} />}
                            onClick={e => handleClickBtnEditQty(e, index, record)}
                            disabled={disabled}
                        />
                    </Tooltip>
                }
            },
            {
                title: <LabelText text='จำนวนเงิน' />,
                dataIndex: "amount",
                width: 100,
                render: (v, r, i) => genInputNumber({
                    value: v || null,
                    record: r, index: i,
                    name: "amount",
                    rules: rules,
                    disabled: true,
                })
            },
            {
                title: <LabelText text='เครดิต' />,
                dataIndex: "credit",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "credit" })
            },
            {
                title: <LabelText text='เบิกได้' />,
                dataIndex: "cashReturn",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "cashReturn" })
            },
            {
                title: <LabelText text='เบิกไม่ได้' />,
                dataIndex: "cashNotReturn",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "cashNotReturn", disabled: true })
            },
            {
                title: <LabelText text='รพ. ร่วมจ่าย' />,
                dataIndex: "offer",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "offer", disabled: true })
            },
            {
                title: <LabelText text='ส่วนลด' />,
                dataIndex: "discount",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "discount" })
            },
            {
                title: <LabelText text='ค้างชำระ' />,
                dataIndex: "overdue",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "overdue", disabled: true })
            },
            {
                title: <LabelText text='ชำระแล้ว' />,
                dataIndex: "payment",
                width: 100,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "payment", disabled: true })
            },
            {
                title: <LabelText text='เรียกเก็บแล้ว' />,
                dataIndex: "reminburse",
                width: 110,
                render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "reminburse", disabled: true })
            },
            {
                title: <LabelText text='หมายเหตุ(Order)' />,
                dataIndex: "orderRemark",
                width: 110,
                render: (v, r, i) => genInput({ value: v || null, record: r, index: i, name: "orderRemark" })
            },
            {
                title: <LabelText text='หมายเหตุ (Reject/Cancel)' />,
                dataIndex: "reasonDesc",
                width: 110,
                render: (v, r, i) => genInput({ value: v || null, record: r, index: i, name: "reasonDesc" })
            },
            {
                title: <LabelText text='สิทธิ์การรักษา' />,
                dataIndex: "",
                width: 175,
                render: (v, r, i) => {
                    const disabled = r?.disabled || r?.status === "A";
                    return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -8, marginTop: -8 }}>
                        {
                            !admitId && <Form.Item
                                name={[i, "opdRightId"]}
                                style={{ margin: 0 }}
                                initialValue={opdRightId}
                                rules={[{
                                    required: true,
                                    message: "กรุณาระบุสิทธิ์"
                                }]}
                            >
                                <Select
                                    size='small'
                                    style={{ width: "100%" }}
                                    showSearch={true}
                                    optionFilterProp="children"
                                    onChange={(v, o) => handleChangeField({ name: "opdRightId", index: i, record: { ...r, opdRightId: v }, details: o, })}
                                    onBlur={() => {
                                        setCurrentFinanceRowKey(r.key);
                                        calcBalance(i);
                                    }}
                                    className="data-vlaue"
                                    disabled={orderLockFlag ? true : disabled ? disabled : r?.lockFlag === "Y"}
                                >
                                    {map(opdRightList, (o, index) => <Select.Option
                                        value={o.opdRightId}
                                        cashflag={o.cashFlag}
                                        key={index}
                                        className="data-value"
                                    >
                                        {o.opdRightName}
                                    </Select.Option>
                                    )}
                                </Select>
                            </Form.Item>
                        }
                        {
                            admitId && <Form.Item
                                name={[i, "admitRightId"]}
                                style={{ margin: 0 }}
                                initialValue={admitRightId}
                                rules={[{
                                    required: true,
                                    message: "กรุณาระบุสิทธิ์"
                                }]}
                            >
                                <Select
                                    size='small'
                                    style={{ width: "100%" }}
                                    showSearch={true}
                                    optionFilterProp="children"
                                    onChange={(v, o) => handleChangeField({ name: "admitRightId", index: i, record: { ...r, admitRightId: v }, details: o, })}
                                    onBlur={() => {
                                        setCurrentFinanceRowKey(r.key);
                                        calcBalance(i);
                                    }}
                                    className="data-vlaue"
                                    disabled={orderLockFlag ? true : disabled ? disabled : r?.lockFlag === "Y"}
                                >
                                    {map(admitRightList, (o, index) => <Select.Option
                                        value={o.admitRightId}
                                        cashflag={o.cashFlag}
                                        key={index}
                                        className="data-value"
                                    >
                                        {o.rightName}
                                    </Select.Option>
                                    )}
                                </Select>
                            </Form.Item>
                        }
                    </div>
                }
            },
            {
                title: <LabelText text='ต้องการผล?' />,
                width: 110,
                align: "center",
                render: (v, r,) => {
                    return <>
                        {r?.resultFlag === "Y" ? <CheckOutlined className="text-success" /> : ""}
                    </>;
                }
            },
            {
                title: " ",
                width: 120,
                align: "center",
                render: (val, record, index) => {
                    return <>
                        <Tooltip placement="top" color={"blue"} title={<>
                            <label className="data-value">
                                ผู้บันทึก : {record.userCreated || "-"}
                            </label>
                            <br />
                            <label className="data-value">
                                เวลา :{" "}
                                {record.dateCreated ? dayjs(record.dateCreated, "MM/DD/YYYY HH:mm").format("DD/MM/YYYY HH:mm") : "-"}
                            </label>
                            <br />
                            <label className="data-value">
                                ผู้แก้ไข : {record.userModified || "-"}
                            </label>
                            <br />
                            <label className="data-value">
                                เวลา :{" "}
                                {record.dateModified ? dayjs(record.dateModified, "MM/DD/YYYY HH:mm").format("DD/MM/YYYY HH:mm") : "-"}
                            </label>
                            <br />
                            <label className="data-value">
                                ผู้รับทราบ : {record.userAccepted || "-"}
                            </label>
                            <br />
                            <label className="data-value">
                                เวลา :{" "}
                                {record.dateAccepted ? dayjs(record.dateAccepted, "MM/DD/YYYY HH:mm").format("DD/MM/YYYY HH:mm") : "-"}
                            </label>
                        </>}>
                            <Button
                                size="small"
                                shape="circle"
                                style={{ margin: 0 }}
                                icon={<UserSwitchOutlined style={{ color: "green" }} />}
                                onClick={() => {
                                    console.log(record);
                                }} />
                        </Tooltip>
                        <Button
                            size="small"
                            shape="circle"
                            style={{ margin: 0 }}
                            icon={<EyeOutlined style={{ color: "green" }} />}
                            className="ms-1 me-1"
                        />
                        <Button
                            size="small"
                            shape="circle"
                            style={{ margin: 0 }}
                            icon={record.lockFlag === "Y"
                                ? <LockOutlined style={{ color: "red" }} />
                                : <UnlockOutlined style={{ color: "blue" }} />
                            }
                            onClick={() => {
                                form.setFields([
                                    { name: ["finances", index, "lockFlag"], value: record.lockFlag === "Y" ? null : "Y" },
                                    { name: ["finances", index, "editStatus"], value: orderId ? true : false }
                                ]);
                                setFriend(!friend);
                            }} />
                    </>;
                }
            }
        ]

        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys,) => {
                setSelectedRowKeys(selectedRowKeys);
            },
            // eslint-disable-next-line no-unused-vars
            getCheckboxProps: record => ({
                // disabled: record?.disabled || record?.status === "A" ? true : record.prevLockFlag === "Y" || record.lockFlag === "Y"
            })
        };

        return <>
            <GenRow className='' style={{ marginBottom: -10 }} align="middle">
                <Col><GenBtnDel size="small" name="delSelectedFinances" label='ลบที่เลือก' /></Col>
                <Col>
                    <GenBtnPrm size="small" name="addFinance" label='เพิ่มรายการ' />
                </Col>
                <Col className='ps-4'>{GenFormItem(items, "rushFlag")}</Col>
                <Col>{GenFormItem(items, "autoAccept")}</Col>
                <Col>{GenFormItem(items, "notResultFlag")}</Col>
                <Col>{GenFormItem(items, "resultFlag")}</Col>
                <Col>
                    <GenBtnPrm size="small" name="transfusionReaction" label='เอกสาร Transfusion Reaction' />
                    <GenBtnPrm size="small" name="diagAndAncRequest" label='ข้อมูลประกอบการสั่ง LAB' />
                </Col>
            </GenRow>
            <Form.List name={"finances"}>
                {(list, { add }) => {
                    let temp = form.getFieldValue("finances") || [];
                    list = map(list, (val, i) => {
                        let crrRow = temp[i];
                        return {
                            ...crrRow,
                            ...val,
                            key: temp[i].key,
                        };
                    });
                    return <div style={{ height: 385 }}>
                        <Table
                            size='small'
                            scroll={{ y: 285, x: 2185 }}
                            title={() => <GenRow className='' style={{ marginBottom: -10, marginTop: -10 }} align="middle" hidden={true}>
                                <Col>
                                    <Button
                                        hidden
                                        id='add-Finance'
                                        onClick={() => {
                                            let newRec = { key: nanoid(), financeType: "ALL", }
                                            if (admitId) newRec.admitRightId = admitRightIdSelected
                                            if (!admitId) newRec.opdRightId = opdRightIdSelected
                                            add(newRec)
                                        }}
                                    />
                                </Col>
                            </GenRow>
                            }
                            columns={columns}
                            dataSource={list}
                            pagination={false}
                            rowClassName='data-value'
                            rowSelection={{ ...rowSelection, checkStrictly }}
                        />
                    </div>;
                }}
            </Form.List>
        </>
    }
    const PartsSumFinances = () => {
        const finances = form.getFieldValue("finances") || []
        const amount = sumBy(finances, "amount")
        const credit = sumBy(finances, "credit")
        const cashReturn = sumBy(finances, "cashReturn")
        const cashNotReturn = sumBy(finances, "cashNotReturn")
        const discount = sumBy(finances, "discount")
        const overdue = sumBy(finances, "overdue")
        const payment = sumBy(finances, "payment")
        const reminburse = sumBy(finances, "reminburse")
        const offer = sumBy(finances, "offer")

        return <GenRow gutter={[16, 4]}>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='รายการ' />
                <label className='fs-6'>{finances.length}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='จำนวนเงินรวม' />
                <label className='fs-6'>{amount || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='เรียกเก็บ' />
                <label className='fs-6'>{credit || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='เบิกได้' />
                <label className='fs-6'>{cashReturn || 0}</label>
            </Col>
            <Col className='text-center'>
                <label className='d-block text-danger fw-bold'>เบิกไม่ได้</label>
                <label className='fs-6'>{cashNotReturn || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='รพ. ร่วมจ่าย' />
                <label className='fs-6'>{offer || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='ส่วนลด' />
                <label className='fs-6'>{discount || 0}</label>
            </Col>
            <Col className='text-center'>
                <label className='d-block text-danger fw-bold'>ค้างชำระ</label>
                <label className='fs-6'>{overdue || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='ชำระแล้ว' />
                <label className='fs-6'>{payment || 0}</label>
            </Col>
            <Col className='text-center'>
                <LabelTopicPrimary className='d-block' text='เรียกเก็บแล้ว' />
                <label className='fs-6'>{reminburse || 0}</label>
            </Col>
        </GenRow>
    }

    const PartsModalSpecimen = () => {
        return <Modal
            centered
            visible={vsbModalSpecimen}
            title={<LabelTopicPrimary18 text='ระบุ Specimen' />}
            width={700}
            onOk={() => formSpecimen.submit()}
            onCancel={() => setVsbModalSpecimen(false)}
            okText="บันทึก"
            cancelText="ปิด"
        >
            <Form
                form={formSpecimen}
                onFinish={onFinishSpecimen}
                layout="vertical"
                onValuesChange={() => {
                    formSpecimen.setFieldsValue({
                        specimenUser: user,
                        specimenDate: dayjs().format("YYYY-MM-DD HH:mm")
                    });
                }}
            >
                <Form.Item hidden name="index"><Input /></Form.Item>
                <Form.Item hidden name="specimenUser"><Input /></Form.Item>
                <Form.Item hidden name="specimenDate"><Input /></Form.Item>
                <GenRow align="middle" style={{ marginBottom: -8, marginTop: -8 }}>
                    <Col span={6}>
                        <Form.Item name="specimen" label={<LabelText text='Specimen' />}>
                            <Select showSearch allowClear className="data-value" dropdownMatchSelectWidth={200} options={optionsSpecimen} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="specimenSite" label={<LabelText text='Specimen Site' />}>
                            <Input style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="specimenVol" label={<LabelText text='Specimen Vol' />}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="specimenRemark" label={<LabelText text='Specimen Remark' />}>
                            <Input style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </GenRow>
            </Form>
        </Modal>
    }

    const PartsModalEditQty = () => {
        return <Modal
            centered
            visible={vsbModalEditQty}
            title={<LabelTopicPrimary18 text='กรุณาระบุเหตุผลการแก้ไขจำนวน' />}
            width={500}
            onOk={() => formReason.submit()}
            onCancel={() => setVsbModalEditQty(false)}
            okText="แก้ไขจำนวน"
            cancelText="ปิด"
        >
            <Form form={formReason} onFinish={onFinishReason} layout="vertical">
                <Form.Item hidden name="index"><Input /></Form.Item>
                <GenRow>
                    <Col span={24}>
                        <Form.Item
                            name={"reason"}
                            label={<LabelText text='เหตุผลการแก้ไขจำนวน' />}
                            rules={[{
                                required: reasonQty === "Y",
                                message: "กรุณาระบุเหตุผล"
                            }]}>
                            <Select
                                showSearch
                                allowClear
                                style={{ width: "100%" }}
                                className="data-value"
                                options={optionsReason}
                            />
                        </Form.Item>
                    </Col>
                </GenRow>
            </Form>
        </Modal>
    }

    const PartsModalAddListExpense = (vsb) => {
        return <>
            {
                vsb === "LAB" && <ScreeningAddLabItem
                    handleScreeningAddLabItemModal={handleAddListExpense}
                    screeningAddLabItemActive={vsb === "LAB"}
                    patientId={patientId}
                    copy={true}
                />
            }
            {
                vsb === "XRAY" && <ScreeningXRay
                    handleScreeningXRayModal={handleAddListExpense}
                    screeningXRayActive={vsb === "XRAY"}
                    patientId={patientId}
                    copy={true}
                />
            }
            {
                vsb === "OR" && <ScreeningAddOrderItem
                    handleScreeningAddOrderItemModal={handleAddListExpense}
                    screeningAddOrderItemActive={vsb === "OR"}
                    patientId={patientId}
                    copy={true}
                />
            }
        </>
    }

    const PartsModalTransfusionReaction = () => {
        return <>
            {vsbTransfusionReaction && <TransfusionReaction
                visible={vsbTransfusionReaction}
                patient={patient}
                prev={transfusionReactionByOrder}
                optionsRight={[]}
                optionsWork={[]}
                optionsDoctor={[]}
                doctor={null}
                opdIpd={admitId ? "I" : "O"}
                close={() => setVsbTransfusionReaction(false)}
                onSave={v => {
                    console.log('onSave', v);
                    setTransfusionReactionByOrder({
                        ...(transfusionReactionByOrder || {}),
                        ...(v || {})
                    });
                    setVsbTransfusionReaction(false);
                }}
            />
            }
        </>
    }

    const PartsModalDiagAndAncRequest = () => {
        return <>
            {vsbDiagAndAncRequest && <DiagAndAncRequest
                visible={vsbDiagAndAncRequest}
                patient={patient}
                prev={transfusionReactionByOrder}
                close={() => setVsbDiagAndAncRequest(false)}
                onSave={v => {
                    setTransfusionReactionByOrder({
                        ...(transfusionReactionByOrder || {}),
                        ...(v || {})
                    });
                    setVsbDiagAndAncRequest(false);
                }}
            />
            }
        </>
    }

    return <Spin spinning={Loading}>
        <ConfigProvider locale={thTH}>
            <Form form={form} onFinish={onFinish} layout='vertical'>
                {PartsHeader()}
                {PartsTable()}
                {PartsSumFinances()}
            </Form>
            <Button
                hidden
                id="onFinish_Finance_Form"
                onClick={e => {
                    e.stopPropagation()
                    form.submit()
                }}
            />
            <Button
                hidden
                id="Reset_Finance_Form"
                onClick={e => {
                    e.stopPropagation()
                    if (!admitId) handleClickResetFinanceForm({ ...opdClinicDetails, opdRightId: opdRightIdSelected })
                    if (admitId) handleClickResetFinanceForm({ ...admitDetails, workId: admitDetails?.ward, admitRightId: admitRightIdSelected })
                }}
            />
            {/* Modal */}
            {PartsModalSpecimen()}
            {PartsModalEditQty()}
            {PartsModalAddListExpense(vsbAddList)}
            {PartsModalTransfusionReaction()}
            {PartsModalDiagAndAncRequest()}
        </ConfigProvider>
    </Spin>
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

const listApi = [
    // GetFinanceTypes
    {
        name: "GetFinanceTypes",
        url: "Masters/GetFinancesType",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetExpenses
    {
        name: "GetExpenses",
        url: "OpdExamination/GetExpenses",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // GetWorkPlacesMas
    {
        name: "GetWorkPlacesMas",
        url: "OpdExamination/GetWorkPlacesMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetMasterPackages
    {
        name: "GetMasterPackages",
        url: "OpdExamination/GetMasterPackages",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // GetCheckLabagian
    {
        name: "GetCheckLabagian",
        url: "OpdExamination/GetCheckLabagian",
        method: "POST",
        return: "data",
        sendRequest: false,
    },
    // GetUpdOpdRightVisitOfDate
    {
        name: "GetUpdOpdRightVisitOfDate",
        url: "OpdRightVisit/GetUpdOpdRightVisitOfDate/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetOpdRightByServiceId
    {
        name: "GetOpdRightByServiceId",
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetMasterCodeSpecimens
    {
        name: "GetMasterCodeSpecimens",
        url: "Laboratory/GetMasterCodeSpecimensList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // GetCancelReason
    {
        name: "GetCancelReason",
        url: "OpdExamination/GetCancelReason",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetExpenseByFormulaId
    {
        name: "GetExpenseByFormulaId",
        url: "OpdExamination/GetExpenseByFormulaId/",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetPatientsByPatientId
    {
        name: "GetPatientsByPatientId",
        url: "Patients/GetPatientsByID/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetTransfusionReaction
    {
        name: "GetTransfusionReaction",
        url: "Finances/GetTransfusionReaction?OrderId=",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // PostLabOrder
    {
        name: "PostLabOrder",
        url: "LisRoche/PostLabOrder",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // LISAllabisRequest
    {
        name: "LISAllabisRequest",
        url: "LisAllabis/LISAllabisRequest",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // GetFinancesByOrderId
    {
        name: "GetFinancesByOrderId",
        url: "OpdExamination/GetFinancesOrder",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    // GetOrders
    {
        name: "GetOrders",
        url: "OpdExamination/GetOrderGroupFinances",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    // InsAppActNewOrder
    {
        name: "InsAppActNewOrder",
        url: "Finances/InsAppActNewOrderListFinance",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    // UpdateFinances
    {
        name: "UpdateFinances",
        url: "Finances/UpdListFinance",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    // InsertFinances
    {
        name: "InsertFinances",
        url: "Finances/InsListFinance",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    // DeleteFinances
    {
        name: "DeleteFinances",
        url: "Finances/DelListFinance",
        method: "POST",
        return: "data",
        sendRequest: true
    },
    // GetOpdClinicsByServiceId
    {
        name: "GetOpdClinicsByServiceId",
        url: "OPDClinic/GetOpdClinicsList/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    // GetAdmitRightByAdmitID
    {
        name: "GetAdmitRightByAdmitID",
        url: "Admits/GetAdmitRightByAdmitID",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    // GetAdmitByAdmitID
    {
        name: "GetAdmitByAdmitID",
        url: "Admits/GetAdmitByAdmitID",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
]