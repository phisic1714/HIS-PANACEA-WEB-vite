import React, { useState, useEffect } from 'react'
import { env } from 'env';
import Axios from "axios";
import {
    Form, Modal, Col, Spin, Button, Select, Badge,
    Input, Checkbox, InputNumber, Radio, TimePicker,
    Table, Divider, Popover, Image, Menu, Upload, Dropdown
} from 'antd'
import { find, map, toNumber, filter, sumBy, intersectionBy, differenceBy, cloneDeep, isNumber } from "lodash";
import { nanoid } from "nanoid"
import Scrollbars from "react-custom-scrollbars";
import GenRow from "components/helper/function/GenRow";
import {
    LabelTopic,
    LabelTopic18,
    LabelText,
    LabelTopicPrimary,
    LabelTopicPrimary18,
} from "components/helper/function/GenLabel"
// eslint-disable-next-line no-unused-vars
import { callApi } from 'components/helper/function/CallApi';
// eslint-disable-next-line no-unused-vars
import { mappingOptions } from "components/helper/function/MappingOptions";
import DayjsDatePicker from "components/DatePicker/DayjsDatePicker";
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
import dayjs from 'dayjs';
import { toast } from "react-toastify";
import { notiWarning, notiSuccess, notiError } from "components/Notification/notificationX"
import TransfusionReaction from "components/Modal/TransfusionReaction";
import DiagAndAncRequest from "components/Modal/DiagAndAncRequest";
import { DeleteOutlined, EditOutlined, FileImageOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoIcd } from "components/helper/function/AutoIcd";
import TeethStatusFha from "components/TeethStatus/TeethStatusFha";
import html2canvas from "html2canvas";
import PaintBoardPhysicalExam from "../../routes/OpdClinic/Components/PaintBoardPhysicalExam2";
import { PrintFormReport } from "components/qzTray/PrintFormReport";

const rules = [
    {
        required: true,
        message: "จำเป็น !",
    }
]
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId || null;
const doctorTypeFromsession = userFromSession?.responseData?.doctorType || null;

export default function UpsertFinancesDivideByType({
    visible = false,
    onCancel = () => { },
    onAddNewItems = () => { },
    patient = null,
    patientId = null,
    serviceId = null,
    admitId = null,
    clinicId = null,
    // Right
    rightId = null,
    opdRightId = null,
    admitRightId = null,
    // Lab
    selectedLab = [],
    inOutLab = null,
    rushFlagLab = null,
    toWorkLab = null,
    // Xray
    selectedXray = [],
    rushFlagXray = null,
    portableXray = null,
    toWorkXray = null,
    specialFlag = null,
    // Order
    selectedOrder = [],
    rushFlagOrder = null,
    toWorkOrder = null,
    // Other
    workType = "OPD",
    doctor = {
        doctorId: null,
        doctorName: null,
    },
    work = {
        workId: null,
        workName: null,
    },
    // orderId = null,
}) {
    // console.log('selectedLab', selectedLab)
    // console.log('opdRightId :>> ', opdRightId);
    // console.log('rightId :>> ', rightId);
    // console.log('admitRightId :>> ', admitRightId);
    // Form
    const [form] = Form.useForm()
    const [formVendor] = Form.useForm()
    const [formChkAuthen] = Form.useForm()
    // Watch
    const topbottom = Form.useWatch("topbottom", formVendor);
    const teethVender = Form.useWatch("teeth", formVendor);
    // State
    const [loading, setLoading] = useState(false)
    const [friend, setFriend] = useState(false)
    const [loadingLab, setLoadingLab] = useState(false)
    const [loadingXray, setLoadingXray] = useState(false)
    const [loadingOrder, setLoadingOrder] = useState(false)
    const [orderNoLab, setOrderNoLab] = useState(null)
    const [orderNoXray, setOrderNoXray] = useState(null)
    const [orderNoOrder, setOrderNoOrder] = useState(null)
    const [selectedRowLabKeys, setSelectedRowLabKeys] = useState([])
    const [selectedRowXrayKeys, setSelectedRowXrayKeys] = useState([])
    const [selectedRowOrderKeys, setSelectedRowOrderKeys] = useState([])
    const [options, setOptions] = useState({
        financeType: [],
        fromWork: [],
        toWorkOpd: [],
        toWorkDental: [],
        toWorkOr: [],
        toWorkLab: [],
        toWorkXray: [],
        toWorkWard: [],
        vendor: [],
        product: [],
        teeth: [],
        productsVendorNull: [],
        outLab: [],
        opdRights: [],
        admitRights: [],
    })
    // console.log('options :>> ', options);
    const [vsbTransfusionReaction, setVsbTransfusionReaction] = useState(false);
    const [vsbVendor, setVsbVendor] = useState(false);
    const [vsbDiagAndAncRequest, setVsbDiagAndAncRequest] = useState(false);
    const [transfusionReactionByOrder, setTransfusionReactionByOrder] = useState(null);
    const [vsbProducsForLabLdt, setVsbProducsForLabLdt] = useState(false);
    const [vsbModalChkAuthen, setVsbModalChkAuthen] = useState(false);
    const [vsbModalSelectTeeth, setVsbModalSelectTeeth] = useState(false);
    const [listLabAcceptFlag, setListLabAcceptFlag] = useState([]);
    const [imageLab, setImageLab] = useState(null);
    const [imageXray, setImageXray] = useState(null);
    const [imageOrder, setImageOrder] = useState(null);
    const [sumFinance, setSumFinance] = useState({
        lab: {},
        xray: {},
        order: {},
    });
    const [teethResult, setTeethResult] = useState([]);
    const [teethStatusResult,] = useState("N");
    const [defaultStatus, setDefaultStatus] = useState(defaultStatusTeeth);
    const [vsbModalPaintBoard, setVsbModalPaintBoard] = useState(false)
    const [formListLengthLab, setFormListLengthLab] = useState(true)
    const [formListLengthXray, setFormListLengthXray] = useState(true)
    const [formListLengthOrder, setFormListLengthOrder] = useState(true)

    // Funcs
    // CRUD
    const insertLabs = async (dts, upsertTransfusion) => {
        // console.log('insertOrderLab :>> ', dts);
        if (orderNoLab) return
        const userAcceptLABcontrol = formChkAuthen.getFieldValue("userId");
        let tempProducts = [];
        if (inOutLab === "O") {
            const crrDate = dayjs().format("YYYY-MM-DD HH:mm")
            const vendor = formVendor.getFieldsValue()
            if (vendor?.product?.length) {
                map(vendor.product, p => {
                    const temp = {
                        ...p,
                        teeth: null,
                        topbottom: vendor?.topbottom,
                        userCreated: user,
                        dateCreated: crrDate,
                    }
                    tempProducts = [...tempProducts, temp]
                });
            }
        }
        if (inOutLab === "I") {
            if (dts?.products?.length) {
                let cloneProducts = cloneDeep(dts?.products || []);
                cloneProducts = filter(cloneProducts, 'productId');
                tempProducts = map(cloneProducts, o => {
                    return {
                        productId: o.productId,
                        financeId: null,
                        remark: null,
                        userCreated: user,
                        dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
                        userModified: null,
                        dateModified: null,
                        cancelFlag: null
                    };
                });
            }
        }
        let transfusionReq = null;
        if (upsertTransfusion) {
            const prev = transfusionReactionByOrder;
            const crrDate = dayjs().format("YYYY-MM-DD hh:mm:ss");
            const transfusionDate = prev?.transfusionDate ? dayjs(prev?.transfusionDate).format("YYYY-MM-DD HH:mm:ss") : null;
            const transfusionTime = prev?.transfusionTime ? dayjs(prev?.transfusionTime).format("YYYY-MM-DD HH:mm:ss") : null;
            transfusionReq = {
                ...prev,
                transfusionDate: transfusionDate,
                transfusionTime: transfusionTime,
                userCreated: user,
                dateCreated: crrDate,
                userModified: null,
                dateModified: null
            };
        }
        const picture = imageLab ? [{
            "financePicId": null,
            "financeId": null,
            "orderId": null,
            "picture": imageLab,
            "userCreated": user,
            "dateCreated": dayjs().format("YYYY-MM-DD HH:mm"),
            "userModified": null,
            "dateModified": null
        }] : null
        const expenses = map(dts, o => {
            return {
                ...o,
                userAcceptLABcontrol: o.acceptFlag ? userAcceptLABcontrol : null,
                outsideFlag: inOutLab === "O" ? "Y" : null,
                product: tempProducts,
                picture: picture,
            }
        })
        const req = {
            requestData: expenses,
            transfusionReactionReq: transfusionReq
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            AutoIcd(expenses)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย LAB" })
            setOrderNoLab(res?.id)
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย LAB" })
        return res?.isSuccess
    }
    const insertXrays = async (dts) => {
        if (orderNoXray) return
        let portable = null;
        if (workType === "ward") {
            if (portableXray) portable = "Y";
        }
        const picture = imageXray ? [{
            "financePicId": null,
            "financeId": null,
            "orderId": null,
            "picture": imageXray,
            "userCreated": user,
            "dateCreated": dayjs().format("YYYY-MM-DD HH:mm"),
            "userModified": null,
            "dateModified": null
        }] : null
        const expenses = map(dts, o => {
            return {
                ...o,
                portable: portable,
                picture: picture,
            }
        })
        const req = {
            requestData: expenses,
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            AutoIcd(expenses)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย X-Ray" })
            setOrderNoXray(res?.id)
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย X-Ray" })
        return res?.isSuccess
    }
    const insertOrders = async (dts) => {
        if (orderNoOrder) return
        const picture = imageOrder ? [{
            "financePicId": null,
            "financeId": null,
            "orderId": null,
            "picture": imageOrder,
            "userCreated": user,
            "dateCreated": dayjs().format("YYYY-MM-DD HH:mm"),
            "userModified": null,
            "dateModified": null
        }] : null
        const expenses = map(dts, o => {
            return {
                ...o,
                picture: picture,
            }
        })
        const req = {
            requestData: expenses,
        }
        const res = await insertNewOrder(req)
        if (res?.isSuccess) {
            if (!admitId) AutoIcd(dts)
            notiSuccess({ message: "บันทึกค่าใช้จ่าย Order" })
            setOrderNoOrder(res?.id)
        }
        if (!res?.isSuccess) notiError({ message: "บันทึกค่าใช้จ่าย Order" })
        return res?.isSuccess
    }
    // Form Finish
    const onFinish = async (v) => {
        // console.log('onFinish', v)
        // const listExpense = [...v?.Lab, ...v.Xray, ...v.Order];
        const { warningTransfusion, upsertTransfusion } = chkTransfusionReaction();
        if (warningTransfusion) return;
        // if (v?.Lab?.length) insertLabs(v.Lab, upsertTransfusion)
        let labs = []
        let xrays = []
        let orders = []
        const selectedExpenses = [...selectedLab, ...selectedXray, ...selectedOrder, ...options.outLab]
        let right
        if (!admitId) right = find(options.opdRights, ["opdRightId", opdRightId])
        if (admitId) right = find(options.admitRights, ["admitRightId", admitRightId])
        // console.log('right', right)
        const mappingExpenses = (type, dts) => {
            const crrDateTime = dayjs().format("MM-DD-YYYY HH:mm")
            let orderDate = null
            let fromWork = null
            let toWork = null
            let docRemark = null
            let clinicalDiag = null
            let rushFlag = null
            let specialFlagXray = null
            switch (type) {
                case "Lab":
                    orderDate = dayjs(v.orderDateLab).format("MM-DD-YYYY HH:mm")
                    fromWork = v.fromWorkLab
                    toWork = v.toWorkLab
                    docRemark = v.docRemarkLab
                    clinicalDiag = v.clinicalDiagLab
                    rushFlag = rushFlagLab ? "Y" : null
                    break
                case "Xray":
                    orderDate = dayjs(v.orderDateXray).format("MM-DD-YYYY HH:mm")
                    fromWork = v.fromWorkXray
                    toWork = v.toWorkXray
                    docRemark = v.docRemarkXray
                    clinicalDiag = v.clinicalDiagXray
                    rushFlag = rushFlagXray ? "Y" : null
                    specialFlagXray = specialFlag ? "Y" : null
                    break
                case "Order":
                    orderDate = dayjs(v.orderDateOrder).format("MM-DD-YYYY HH:mm")
                    fromWork = v.fromWorkOrder
                    toWork = v.toWorkOrder
                    docRemark = v.docRemarkOrder
                    clinicalDiag = v.clinicalDiagOrder
                    rushFlag = rushFlagOrder ? "Y" : null
                    break
                default: break
            }
            const mapping = map(dts, o => {
                const expense = find(selectedExpenses, ['expenseId', o.expenseId])
                return {
                    // Patient
                    patientId: patientId,
                    hn: patient?.hn,
                    runHn: patient?.runHn,
                    yearHn: patient?.yearHn,
                    serviceId: serviceId,
                    clinicId: clinicId || null,
                    runAn: patient?.runAn || null,
                    yearAn: patient?.yearAn || null,
                    an: patient?.an || null,
                    admitId: admitId || null,
                    // Right
                    rightId: right?.rightId,
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
                    orderDate,
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
                    toWork,
                    vendor: v?.vendor || null,
                    // User
                    doctor: doctor.doctorId || null,
                    userCreated: user,
                    userModified: null,
                    userAccepted: null,
                    userPrepared: null,
                    userChecked: null,
                    userDispensed: null,
                    userPayabled: null,
                    // Other
                    // teeth: o.teeth || null,
                    lockFlag: null,
                    status: checkDoctype(expense),
                    docRemark: docRemark,
                    orderRemark: null,
                    notTriggerFlag: "Y",
                    clinicalDiag: clinicalDiag,
                    rushFlag: rushFlag,
                    acceptFlag: expense?.acceptFlag || null,
                    cashFlag: right?.cashFlag || null,
                    // portable: portable, X
                    specialFlag: specialFlagXray,

                }
            })
            return mapping
        }
        labs = mappingExpenses("Lab", v?.Lab || [])
        xrays = mappingExpenses("Xray", v?.Xray || [])
        orders = mappingExpenses("Order", v?.Order || [])
        setLoading(true)
        const isSuccessLab = labs.length ? await insertLabs(labs, upsertTransfusion) : true
        const isSuccessXray = xrays.length ? await insertXrays(xrays) : true
        const isSuccessOrder = orders.length ? await insertOrders(orders) : true
        setLoading(false)
        // const [
        //     isSuccessLab,
        //     isSuccessXray,
        //     isSuccessOrder,
        // ] = await Promise.all([
        //     labs.length ? insertLabs(labs, upsertTransfusion) : true,
        //     xrays.length ? insertXrays(xrays) : true,
        //     orders.length ? insertOrders(orders) : true,
        // ])
        if (isSuccessLab && isSuccessXray && isSuccessOrder) onCancel(true)
    }
    const onFinishVendor = (v) => {
        // console.log('v', v)
        setVsbVendor(false)
    }
    const onFinishChkAuthen = async (v) => {
        let res = await callApi(listApi, "CheckAuthenticate", v);
        // console.log('res', res)
        if (!res) return notiWarning({ message: "UserName หรือ Password ไม่ถูกต้อง", description: "กรุณาตรวจสอบข้อมูล" });
        if (res?.cancelFlag) return notiError({ message: "user ถูกยกเลิกให้งานแล้ว" });
        if (res?.userType === "M" || res?.userType === "D") {
            form.submit();
            return setVsbModalChkAuthen(false);
        }
        return notiError(false, "ไม่สามารถทำรายการได้", "อนุญาตเฉพาะแพทย์และทันตแพทย์เท่านั้น");
    }
    // Get
    const getRateExpenses = async (name, dts) => {
        if (name === "Lab") setLoadingLab(true)
        if (name === "Xray") setLoadingXray(true)
        if (name === "Order") setLoadingOrder(true)
        // let right = null
        // if (!admitId) right = find(options.opdRights, ["opdRightId", opdRightId])
        // if (admitId) right = find(options.admitRights, ["admitRightId", admitRightId])
        const promises = map(dts, o => {
            return getExpenseRate({
                expenseId: o.expenseId,
                rightId: rightId || "x000000"
            }).then(value => {
                let {
                    rate = null,
                    credit = "0",
                    cashReturn = "0",
                    cashNotReturn = "0",
                    minRate = null,
                    maxRate = null
                } = value;
                const rateByUser = minRate ? "YES" : "NO";
                const quantity = Number(o?.quantity || 1)

                rate = rate ? Number(rate) : 0;
                const amount = rate ? Number(rate) * quantity : 0;
                credit = credit ? Number(credit) * quantity : 0
                credit = credit > amount ? amount : credit;
                cashReturn = cashReturn ? Number(cashReturn) * quantity : "0";
                cashNotReturn = cashNotReturn ? Number(cashNotReturn) * quantity : "0";
                minRate = minRate ? Number(minRate) * quantity : "0";
                maxRate = maxRate ? Number(maxRate) * quantity : "0";

                return {
                    key: nanoid(),
                    financeId: null,
                    financeType: o.financeType,
                    expenseId: o.expenseId,
                    quantity: quantity,
                    code: o.code,
                    price: rateByUser === "YES" ? null : rate,
                    amount: amount,
                    credit: credit,
                    cashReturn: cashReturn,
                    cashNotReturn: cashNotReturn < 0 ? 0 : cashNotReturn,
                    minRate: minRate,
                    maxRate: maxRate,
                    rateByUser: rateByUser,
                    disablePrice: rateByUser === "YES" ? false : true,
                    expenseName: o.name,
                    organ: o.organ,
                };
            });
        });
        return Promise.all(promises).then(result => {
            let outLabs = []
            if (name === "Lab" && inOutLab === "O" && workType === "Dental") {
                const outLab = {
                    financeId: null,
                    isOutLab: true,
                    rightId: rightId,
                    quantity: 1,
                    financeType: "L",
                    opdRightId: opdRightId,
                };
                outLabs = [outLab]
            }
            form.setFieldsValue({ [name]: [...result, ...outLabs] });
            sumFinances()
            setLoadingLab(false)
            setLoadingXray(false)
            setLoadingOrder(false)
            chkTransfusionReaction()
            if (name === "Lab" && inOutLab === "O") getExpenseByAutoMeaning("L")
        });
    }
    const getFinanceTypes = async () => {
        let res = await callApi(listApi, "GetFinancesType")
        res = mappingOptions({ dts: res })
        setOptions(p => {
            return {
                ...p,
                financeType: res
            }
        })
    }
    const getFromWorks = async () => {
        // const type = workType.toLowerCase()
        let [
            workPlacesOpd,
            workPlacesDental,
            workPlacesOr,
            workPlacesXray,
            workPlacesLab,
            workPlacesWard,
        ] = await Promise.all([
            callApi(listApi, "GetWorkPlacesOPD"),
            callApi(listApi, "GetWorkPlacesDental"),
            callApi(listApi, "GetWorkPlacesOR"),
            callApi(listApi, "GetWorkPlacesXray"),
            callApi(listApi, "GetWorkPlacesLab"),
            callApi(listApi, "GetWorkPlacesWard")
        ])
        workPlacesOpd = mappingOptions({ dts: workPlacesOpd })
        workPlacesDental = mappingOptions({ dts: workPlacesDental })
        workPlacesOr = mappingOptions({ dts: workPlacesOr })
        workPlacesXray = mappingOptions({ dts: workPlacesXray })
        workPlacesLab = mappingOptions({ dts: workPlacesLab, valueField: "workId", labelField: "dataDisplay" })
        workPlacesWard = mappingOptions({ dts: workPlacesWard })
        setOptions(p => {
            return {
                ...p,
                fromWork: [...workPlacesOpd, ...workPlacesDental, ...workPlacesOr, ...workPlacesXray, ...workPlacesLab, ...workPlacesWard,],
                toWorkOpd: workPlacesOpd,
                toWorkDental: workPlacesDental,
                toWorkOr: workPlacesOr,
                toWorkLab: workPlacesLab,
                toWorkXray: workPlacesXray,
                toWorkWard: workPlacesWard,
            }
        })
    }
    const getVendorOutSide = async () => {
        let res = await callApi(listApi, "GetVendorOutSide")
        res = mappingOptions({ dts: res })
        setOptions(p => {
            return {
                ...p,
                vendor: res
            }
        })
    }
    const getVendorsMaster = async () => {
        let res = await callApi(listApi, "GetVendorsMaster", {})
        res = mappingOptions({ dts: res, valueField: "vendorId", labelField: "name", compound: true })
        setOptions(p => {
            return {
                ...p,
                vendor: res
            }
        })
    }
    const getProductByVendor = async (vendorId) => {
        let res = await callApi(listApi, "GetProductByVendor", vendorId)
        res = mappingOptions({ dts: res, valueField: "productId", labelField: "goodsName" })
        setOptions(p => {
            return {
                ...p,
                product: res
            }
        })
    }
    const getTeeth = async () => {
        let res = await callApi(listApi, "GetTeeth",)
        res = mappingOptions({ dts: res })
        setOptions(p => {
            return {
                ...p,
                teeth: res
            }
        })
    }
    const getProductsVendorNull = async () => {
        let res = await callApi(listApi, "GetProductByVendorNull");
        res = mappingOptions({ dts: res, valueField: "productId", labelField: "goodsName" })
        setOptions(p => {
            return {
                ...p,
                productsVendorNull: res
            }
        })
    };
    const getExpenseByAutoMeaning = async (meaning) => {
        let res = await callApi(listApi, "GetExpenseByAutoMeaning", meaning)
        res = map(res, o => {
            const label = `${o.expenseId} ${o.name} (${o.code})`
            return {
                ...o,
                value: o.expenseId,
                label: label,
                className: "data-value",
            }
        })
        setOptions(p => {
            return {
                ...p,
                outLab: res
            }
        })
    }
    const getAdmitRightDisplay = async (admitId) => {
        const req = {
            "patientId": patientId,
            "admitId": admitId,
            "serviceId": null,
            "workId": null
        }
        let res = await callApi(listApi, "GetAdmitRightDisplay", req)
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
        let res = await callApi(listApi, "GetOpdRightIdByServiceId", serviceId)
        res = mappingOptions({ dts: res, valueField: "opdRightId", labelField: "opdRightName" })
        setOptions(p => {
            return {
                ...p,
                opdRights: res
            }
        })
    }
    // Helpers
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
    const getRateByRightId = async ({ index = null, listName = null, expenseId = null, quantity = 1 }) => {
        const finances = form.getFieldValue(listName);
        setLoading(true);
        const rateResult = await getExpenseRate({ expenseId, rightId });
        setLoading(false);
        if (rateResult?.popUp) showPopupText(rateResult.popUp)
        rateResult.rateByUser = rateResult?.minRate ? "YES" : "NO";
        const valuesForSetFormAgain = map(finances, (o, indx) => {
            if (indx !== index) return o
            const rate = toNumber(rateResult?.rate || 0);
            const amount = rate * quantity;
            let credit = toNumber(rateResult?.credit || 0) * quantity;
            credit = credit > rate ? rate : credit
            const cashReturn = toNumber(rateResult?.cashReturn || 0) * quantity;
            const cashNotReturn = (amount - (cashReturn + credit));
            const payment = toNumber(o?.payment || 0) * quantity;
            const overdue = (cashReturn + cashNotReturn) - payment
            // console.log('cashNotReturn', cashNotReturn)
            o.price = rateResult.rateByUser === "YES" ? null : rate;
            o.minRate = rateResult.minRate;
            o.maxRate = rateResult.maxRate;
            o.rateByUser = rateResult.rateByUser;
            o.quantity = quantity;
            o.amount = amount;
            o.claim = cashReturn;
            o.copay = cashNotReturn < 0 ? 0 : cashNotReturn;
            o.cashReturn = cashReturn;
            o.cashNotReturn = cashNotReturn < 0 ? 0 : cashNotReturn;
            o.overdue = overdue;
            o.credit = credit;
            // o.editStatus = "YES";
            o.disablePrice = rateResult.rateByUser === "YES" ? false : true;
            return o;
        });
        form.setFieldsValue({ [listName]: valuesForSetFormAgain });
        sumFinances()
    };
    const chkTransfusionReaction = () => {
        const dataSource = form.getFieldValue("Lab")
        let warning = false;
        let upsertTransfusion = false;
        const transfusion = transfusionReactionByOrder;
        map(dataSource, f => {
            const findByExpense = find(selectedLab, ["expenseId", f.expenseId]);
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
    const findDataInArray = (valueForFinding, list, fieldName) => {
        let res = find(list, o => {
            return o[fieldName] === valueForFinding;
        });
        if (res) {
            return true;
        } else return false;
    };
    const chkLabGroupLDT = dts => {
        if (!dts?.length) return;
        form.setFieldsValue({
            products: [{
                productId: null
            }]
        });
        const findLDT = find(dts, ['labGroup', "LDT"]);
        if (findLDT) return setVsbProducsForLabLdt(true);
    };
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
    const sumFinances = () => {
        const labs = form.getFieldValue("Lab") || []
        const xrays = form.getFieldValue("Xray") || []
        const orders = form.getFieldValue("Order") || []
        const sum = (dts) => {
            const amount = sumBy(dts, 'amount')
            const cashReturn = sumBy(dts, 'cashReturn')
            const cashNotReturn = sumBy(dts, 'cashNotReturn')
            return { amount, cashReturn, cashNotReturn }
        }
        setSumFinance({
            lab: sum(labs),
            xray: sum(xrays),
            order: sum(orders),
        })
    }
    const genBase64 = file => {
        return new Promise(resolve => {
            let baseURL = "";
            // Make new FileReader
            let reader = new FileReader();

            // Convert the file to base64 text
            reader.readAsDataURL(file);

            // on reader load somthing...
            reader.onload = () => {
                // Make a fileInfo Object
                baseURL = reader.result;
                resolve(baseURL);
            };
            // console.log(fileInfo);
        });
    };
    const chkFormListLength = (name) => {
        const length = form.getFieldValue(name)?.length
        switch (name) {
            case "Lab":
                setFormListLengthLab(length ? true : false)
                break
            case "Xray":
                setFormListLengthXray(length ? true : false)
                break
            case "Order":
                setFormListLengthOrder(length ? true : false)
                break
            default: break;
        }
    }
    const setRequiredForPrice = (index, listName) => {
        const formValues = form.getFieldsValue();
        const listFinance = formValues?.[listName] || [];
        const crrRecord = listFinance[index];
        const rateByUser = crrRecord?.rateByUser;

        // console.log('crrRecord :>> ', crrRecord);

        if (rateByUser === "YES") {
            let price = toNumber(crrRecord.price || 0);
            let minRate = toNumber(crrRecord.minRate || 0);
            let maxRate = toNumber(crrRecord.maxRate || 0);
            if (price >= minRate && price <= maxRate) {
                let rules = [{
                    required: false
                }];
                return rules;
            } else {
                let rules = [{
                    required: true,
                    message: ""
                }, () => ({
                    validator() {
                        if (price < minRate && price > maxRate) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error(`${minRate}-${maxRate}`));
                    }
                })];
                return rules;
            }
        } else {
            let rules = [{
                required: false
            }];
            return rules;
        }
    };
    // Handle
    const handleOk = () => {
        const formValues = form.getFieldsValue();
        const labs = formValues?.Lab || []
        const xrays = formValues?.Xray || []
        const orders = formValues?.Order || []
        let intersection = intersectionBy([...selectedLab, ...selectedXray, ...selectedOrder], [...labs, ...xrays, ...orders], "expenseId");
        let findLabAcceptFlag = filter(intersection, ["acceptFlag", "Y"]);
        if (findLabAcceptFlag.length) {
            setListLabAcceptFlag(findLabAcceptFlag);
            return setVsbModalChkAuthen(true);
        }
        form.submit()
    }
    const handleCancle = () => {
        form.setFieldsValue({
            Lab: [],
            Xray: [],
            Order: [],
        })
        form.resetFields()
        setOrderNoLab(false)
        setOrderNoXray(false)
        setOrderNoOrder(false)
        setImageLab(null)
        setImageXray(null)
        setImageOrder(null)
        setFormListLengthLab(true)
        setFormListLengthXray(true)
        setFormListLengthOrder(true)
        if (orderNoLab || orderNoXray || orderNoOrder) {
            onCancel(true)
        } else {
            onCancel(false)
        }

    }
    const handleSelectRows = (name, keys) => {
        switch (name) {
            case "Lab":
                setSelectedRowLabKeys(keys)
                break
            case "Xray":
                setSelectedRowXrayKeys(keys)
                break
            case "Order":
                setSelectedRowOrderKeys(keys)
                break
            default: break;
        }
    }
    const handleDeleteSelectedRows = (name) => {
        let mapping = []
        let filterData = []
        const expenses = form.getFieldValue(name)
        switch (name) {
            case "Lab":
                mapping = map(selectedRowLabKeys, o => { return { key: o } })
                filterData = differenceBy(expenses, mapping, 'key')
                setSelectedRowLabKeys([])
                break
            case "Xray":
                mapping = map(selectedRowXrayKeys, o => { return { key: o } })
                filterData = differenceBy(expenses, mapping, 'key')
                setSelectedRowXrayKeys([])
                break
            case "Order":
                mapping = map(selectedRowOrderKeys, o => { return { key: o } })
                filterData = differenceBy(expenses, mapping, 'key')
                setSelectedRowOrderKeys([])
                break
            default: break;
        }
        form.setFieldsValue({ [name]: filterData })
        chkFormListLength(name)
        sumFinances()
    }
    const handleClickBtn = (name) => {
        switch (name) {
            case "deleteSelectedLab":
                handleDeleteSelectedRows("Lab")
                break
            case "deleteSelectedXray":
                handleDeleteSelectedRows("Xray")
                break
            case "deleteSelectedOrder":
                handleDeleteSelectedRows("Order")
                break
            case "btrRequest":
                setVsbTransfusionReaction(true);
                break
            case "labRequest":
                setVsbDiagAndAncRequest(true);
                break
            case "selectTeethLab":
                setVsbModalSelectTeeth("Lab");
                break
            case "selectTeethXray":
                setVsbModalSelectTeeth("Xray");
                break
            case "selectTeethOrder":
                setVsbModalSelectTeeth("Order");
                break
            case "editImageLab":
                setVsbModalPaintBoard("Lab")
                break
            case "editImageXray":
                setVsbModalPaintBoard("Xray")
                break
            case "editImageOrder":
                setVsbModalPaintBoard("Order")
                break
            case "deleteImageLab":
                setImageLab(null)
                break
            case "deleteImageXray":
                setImageXray(null)
                break
            case "deleteImageOrder":
                setImageOrder(null)
                break
            default:
                break;
        }
    }
    const handleChangeFieldMoney = (index, listName, name) => {
        const finances = form.getFieldValue(listName)
        const crrRecord = finances[index]
        const quantity = toNumber(crrRecord?.quantity || 0);
        const price = toNumber(crrRecord?.price || 0);
        const amount = quantity * price;
        const casePrice = () => {
            form.setFields([{ name: [listName, index, "amount"], value: amount },]);
            setFriend(!friend);
            sumFinances()
        }
        const caseQuantity = () => {
            getRateByRightId({ index: index, expenseId: crrRecord?.expenseId, quantity: quantity, listName: listName })
        }
        const caseExpenseId = () => {
            getRateByRightId({ index: index, expenseId: crrRecord?.expenseId, quantity: 1, listName: listName })
        }
        switch (name) {
            case "price": return casePrice()
            case "quantity": return caseQuantity()
            case "expenseId": return caseExpenseId()
            default: break;
        }
    }
    const handleBlurField = ({ event, index = null, listName = null, name = null, record = null, }) => {
        switch (name) {
            case "credit":
                let finances = form.getFieldValue(listName);
                const amount = toNumber(record?.amount || 0);
                const payment = toNumber(record?.payment || 0);
                let credit = toNumber(event.target.value || 0);
                let cashReturn = toNumber(record?.cashReturn || 0);
                credit = credit > amount ? amount : credit;
                cashReturn = cashReturn > amount - credit ? amount - credit : cashReturn;
                const cashNotReturn = amount - (credit + cashReturn);
                const overdue = cashReturn + cashNotReturn - (payment || 0);
                finances[index].credit = credit;
                finances[index].cashReturn = cashReturn;
                finances[index].cashNotReturn = cashNotReturn;
                finances[index].overdue = overdue;
                form.setFieldsValue({ listName: finances });
                // calcFinances();
                // if (credit > 0) calcBalance(index);
                break;
            case "cashReturn":
                const value = toNumber(event.target.value);
                if (isNumber(value)) {
                    let finances = form.getFieldValue(listName);
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
                    form.setFieldsValue({ listName: finances });
                    // calcFinances();
                }
                break;
            default:
                break;
        }
        sumFinances()
    }
    const handleChangeVendor = (vendorId) => {
        formVendor.setFieldsValue({ product: [{ key: 0 }] });
        form.setFieldsValue({ vendor: vendorId });
    }
    const handleSelsectVendor = (vendorId) => {
        getProductByVendor(vendorId)
    }
    const handleUploadImg = (file, expenseType) => {
        if (!file) return
        genBase64(file).then(result => {
            const split = result.split(",")[1]
            switch (expenseType) {
                case "Lab":
                    setImageLab(split);
                    break;
                case "Xray":
                    setImageXray(split);
                    break;
                case "Order":
                    setImageOrder(split);
                    break;
                default:
                    break;
            }
        });
    }
    const handleOkModalSelectTeeth = async () => {
        // console.log('onOk')
        setLoading(true);
        const app = document.getElementById("TeathTest");
        const c = await html2canvas(app);
        let imgData = c.toDataURL("image/png");
        imgData = imgData.split(",")[1]
        switch (vsbModalSelectTeeth) {
            case "Lab":
                setImageLab(imgData)
                break
            case "Xray":
                setImageXray(imgData)
                break
            case "Order":
                setImageOrder(imgData)
                break
            default:
                break;
        }
        setTeethResult([])
        setDefaultStatus(defaultStatusTeeth)
        setLoading(false);
        setVsbModalSelectTeeth(false)
    }
    const handleSavePaintBoard = (type, base64) => {
        switch (type) {
            case "Lab":
                setImageLab(base64)
                break
            case "Xray":
                setImageXray(base64)
                break
            case "Order":
                setImageOrder(base64)
                break
            default: break
        }
    }
    // Effect
    useEffect(() => {
        getFinanceTypes()
        getFromWorks()
    }, [])

    useEffect(() => {
        if (visible) {
            getRateExpenses("Lab", selectedLab)
            getRateExpenses("Xray", selectedXray)
            getRateExpenses("Order", selectedOrder)
            if (selectedLab.length && inOutLab === "O") {
                setVsbVendor(true)
                getTeeth()
                if (workType === "Dental") getVendorOutSide()
                if (workType !== "Dental") getVendorsMaster()
            }
            if (selectedLab.length && inOutLab === "I") {
                chkLabGroupLDT(selectedLab)
                getProductsVendorNull()
            }
            getOpdRightIdByServiceId(serviceId)
            form.setFieldsValue({
                toWorkLab: toWorkLab,
                toWorkXray: toWorkXray,
                toWorkOrder: toWorkOrder,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible])

    // Components
    const GenFormItem = (items, fieldName) => {
        let fndByName = find(items, ["name", fieldName]);
        if (!fndByName) return;
        const {
            size = "default",
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
            onClick={(e) => {
                e.stopPropagation()
                handleClickBtn(name)
            }}
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
            onClick={(e) => {
                e.stopPropagation()
                handleClickBtn(name)
            }}
            icon={icon}
            {...props}
        >{label}</Button>
    }
    const PartsForm = () => {
        const partsImg = (img, editName, deleteName) => {
            // console.log('img', img)
            if (!img) return
            return <Badge.Ribbon
                text={<>
                    <EditOutlined
                        className='gx-text-primary pe-1 pointer'
                        onClick={e => {
                            e.stopPropagation()
                            handleClickBtn(editName)
                        }}
                    />
                    <DeleteOutlined
                        className='text-danger pointer'
                        onClick={e => {
                            e.stopPropagation()
                            handleClickBtn(deleteName)
                        }}
                    />
                </>}
                color='#f5f5f5'
            >
                <Image
                    height={85}
                    preview
                    src={`data:image/jpg;base64,${img}`}
                />
            </Badge.Ribbon>
        }
        const partsHeader = (name = "") => {
            const type = workType.toLowerCase()
            let optionsToWork = []
            let disabledDelBtn = false
            let orderNo = null
            let image = null
            let printNumber = null
            let rulesByLenght = []
            switch (name) {
                case "Lab":
                    optionsToWork = [...options.toWorkLab, ...options.toWorkOpd, ...options.toWorkOr]
                    disabledDelBtn = !selectedRowLabKeys.length
                    orderNo = orderNoLab
                    image = imageLab
                    printNumber = "91"
                    rulesByLenght = formListLengthLab ? rules : []
                    break;
                case "Xray":
                    optionsToWork = options.toWorkXray
                    disabledDelBtn = !selectedRowXrayKeys.length
                    orderNo = orderNoXray
                    image = imageXray
                    printNumber = "92"
                    rulesByLenght = formListLengthXray ? rules : []
                    break;
                case "Order":
                    optionsToWork = options.fromWork
                    disabledDelBtn = !selectedRowOrderKeys.length
                    orderNo = orderNoOrder
                    image = imageOrder
                    printNumber = "94"
                    rulesByLenght = formListLengthOrder ? rules : []
                    break;
                default:
                    optionsToWork = options.fromWork
                    break;
            }
            const items = [
                // orderDate
                {
                    name: `orderDate${name}`,
                    label: "วันที่สั่ง",
                    inputType: "datepicker",
                    rules: rulesByLenght,
                    size: "small",
                },
                // fromWork
                {
                    name: `fromWork${name}`,
                    label: "หน่วยส่ง",
                    inputType: "select",
                    rules: rulesByLenght,
                    options: options.fromWork,
                    disabled: type !== "ward",
                    size: "small",
                },
                // toWork
                {
                    name: `toWork${name}`,
                    label: "หน่วยทำ",
                    inputType: "select",
                    rules: rulesByLenght,
                    options: optionsToWork,
                    size: "small",
                },
                // vendor
                {
                    name: `vendor`,
                    label: "รหัสบริษัท",
                    inputType: "select",
                    rules: rulesByLenght,
                    options: options.vendor,
                    size: "small",
                },
            ]
            const menu = <Menu
                items={[
                    {
                        key: "1",
                        label: <label className="pointer" onClick={() => {
                            // setShowCameraModal(true);
                        }}>
                            กล้องถ่ายรูป
                        </label>
                    },
                    {
                        key: "2",
                        label: <Upload showUploadList={false} beforeUpload={file => handleUploadImg(file, name)}>
                            <label className="pointer">อัปโหลดรูป</label>
                        </Upload>
                    }]}
            />
            return <>
                <GenRow>
                    <Col span={1}>
                        <LabelTopic18 text={name} className='mt-4' />
                    </Col>
                    <Col>
                        <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <GenBtnDel
                                name={`deleteSelected${name}`}
                                label='ลบที่เลือก'
                                disabled={disabledDelBtn}
                                size="small"
                            />
                        </Form.Item>
                    </Col>
                    {
                        map(items, o => {
                            let span
                            switch (o.inputType) {
                                case "datepicker":
                                    span = 2
                                    break
                                default:
                                    span = 4
                                    break
                            }
                            if (name === "Lab") {
                                if (inOutLab === "O") {
                                    if (o.name !== "toWorkLab") return <Col key={o.name} span={span}>{GenFormItem(items, o.name)}</Col>
                                } else {
                                    if (o.name !== "vendor") return <Col key={o.name} span={span}>{GenFormItem(items, o.name)}</Col>
                                }
                            } else {
                                if (o.name !== "vendor") return <Col key={o.name} span={span}>{GenFormItem(items, o.name)}</Col>
                            }
                        })
                    }
                    <Col>
                        <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <Dropdown overlay={menu}>
                                <GenBtnPrm
                                    name='uploadImage'
                                    label='เลือกรูป'
                                    size="small"
                                />
                            </Dropdown>
                        </Form.Item>
                    </Col>
                    {/* <Col>
                        <Form.Item label=" " style={{ marginBottom: 0 }}>
                            <GenBtnPrm
                                name={`selectTeeth${name}`}
                                label='เลือกซี่ฟัน'
                                size="small"
                            />
                        </Form.Item>
                    </Col> */}
                    {
                        image && <Col>
                            {partsImg(image, `editImage${name}`, `deleteImage${name}`)}
                        </Col>
                    }
                </GenRow>
                {
                    orderNo && <div style={{ marginTop: image ? -18 : "" }}>
                        <LabelTopic text="Order No." />
                        <LabelText text={orderNo} className='me-3' />
                        <PrintFormReport
                            style={{
                                marginBottom: 0
                            }}
                            button={false}
                            size="small"
                            shape="square"
                            param={{
                                // orderId: clinicValue,
                            }}
                            number={printNumber}
                        />
                    </div>
                }
            </>
        }
        const genFormList = (listName = "") => {
            let selectedRowKeys = []
            switch (listName) {
                case "Lab":
                    selectedRowKeys = selectedRowLabKeys
                    break
                case "Xray":
                    selectedRowKeys = selectedRowXrayKeys
                    break
                case "Order":
                    selectedRowKeys = selectedRowOrderKeys
                    break
                default: break
            }
            // eslint-disable-next-line no-unused-vars
            const genInputNumber = ({ value = null, record = null, index = null, name = "", controls = false, rules, ...props }) => {
                // console.log('name', name)
                return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -18, marginTop: -18 }}>
                    <Form.Item
                        name={[index, name]}
                        style={{ margin: 0 }}
                        rules={rules}
                    >
                        <InputNumber
                            size='small'
                            style={{ width: "100%", margin: 0 }}
                            className='data-value'
                            controls={controls}
                            onChange={() => handleChangeFieldMoney(index, listName, name)}
                            onBlur={(event) => handleBlurField({ event: event, index: index, listName: listName, name: name, record: record })}
                            // onFocus={(event) => handleFocusField({ event: event, name: name, })}
                            {...props}
                        />
                    </Form.Item>
                </div>
            }
            const columns = [
                // ประเภท
                {
                    title: <LabelText text='ประเภท' />,
                    dataIndex: "financeType",
                    width: 95,
                    fixed: "left",
                    render: (v, r, i) => {
                        const financeType = v ? v.toUpperCase() : null
                        const financeTypeName = find(options.financeType, ["value", financeType])?.label
                        return <div>
                            <div hidden>
                                <Form.Item name={[i, "key"]}><Input /></Form.Item>
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
                // รายการค่าใช้จ่าย
                {
                    title: <LabelText text='รายการค่าใช้จ่าย' />,
                    dataIndex: "expenseName",
                    render: (v, r, i) => {
                        return <>
                            {
                                !r.isOutLab && v
                            }
                            {
                                r.isOutLab && <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -18, marginTop: -18 }}>
                                    <Form.Item
                                        name={[i, "expenseId"]}
                                        style={{ margin: 0 }}
                                        rules={rules}
                                    >
                                        <Select
                                            size='small'
                                            style={{ margin: 0, width: "100%" }}
                                            showSearch
                                            optionFilterProp='label'
                                            options={options.outLab}
                                            className='data-value'
                                            onChange={v => handleChangeFieldMoney(i, listName, "expenseId")}
                                        />
                                    </Form.Item>

                                </div>
                            }
                        </>
                    }
                },
                // ราคา
                {
                    title: <LabelText text='ราคา/หน่วย' />,
                    dataIndex: "price",
                    width: 100,
                    render: (v, r, i) => {
                        const range = r.rateByUser === "YES" ? `${r.minRate} - ${r.maxRate}` : null;
                        const disabled = r.rateByUser === "NO" || r.lockFlag === "Y" ? true : false;
                        return genInputNumber({
                            value: v || null,
                            record: r,
                            index: i,
                            name: "price",
                            className: "custom-antd-placeholder-danger-range data-value",
                            disabled: disabled,
                            placeholder: range,
                            rules: setRequiredForPrice(i, listName),
                        })
                    }
                },
                // จำนวน
                {
                    title: <LabelText text='จำนวน' />,
                    dataIndex: "quantity",
                    width: 80,
                    render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "quantity", rules: rules, controls: true })
                },
                // จำนวนเงิน
                {
                    title: <LabelText text='จำนวนเงิน' />,
                    dataIndex: "amount",
                    width: 100,
                    render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "amount", rules: rules, disabled: true, })
                },
                // เครดิต
                {
                    title: <LabelText text='เครดิต' />,
                    dataIndex: "credit",
                    width: 100,
                    render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "credit" })
                },
                // เบิกได้
                {
                    title: <LabelText text='เบิกได้' />,
                    dataIndex: "cashReturn",
                    width: 100,
                    render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "cashReturn" })
                },
                // เบิกไม่ได้
                {
                    title: <LabelText text='เบิกไม่ได้' />,
                    dataIndex: "cashNotReturn",
                    width: 100,
                    render: (v, r, i) => genInputNumber({ value: v || null, record: r, index: i, name: "cashNotReturn", disabled: true })
                },
                // สิทธิ์การรักษา
                {
                    title: <LabelText text='สิทธิ์การรักษา' />,
                    dataIndex: "",
                    width: 175,
                    render: (v, r, i) => {
                        return <div style={{ marginLeft: -6, marginRight: -6, marginBottom: -18, marginTop: -18 }}>
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
                                        style={{ width: "100%", margin: 0 }}
                                        showSearch={true}
                                        optionFilterProp="label"
                                        className="data-vlaue"
                                        disabled
                                        options={options.opdRights}
                                    />
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
                                        style={{ width: "100%", margin: 0 }}
                                        showSearch={true}
                                        optionFilterProp="label"
                                        className="data-vlaue"
                                        disabled
                                        options={options.admitRights}
                                    />
                                </Form.Item>
                            }
                        </div>
                    }
                },
                // IMG
                {
                    title: <LabelText text='IMG' />,
                    dataIndex: "organ",
                    width: 50,
                    align: "center",
                    render: (v) => {
                        const showContent = (organ) => {
                            return <Image
                                // className="border"
                                width={110}
                                height={110}
                                preview
                                src={`${env.PUBLIC_URL}/assets/images/screening/component-body/${organ}.png`}
                            />
                        }
                        const showImg = (organ) => {
                            if (!v) return ""
                            return <Popover content={showContent(organ)}>
                                <FileImageOutlined />
                            </Popover>
                        }
                        return showImg(v)
                    }
                },
            ]
            const rowSelection = {
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys,) => {
                    handleSelectRows(listName, selectedRowKeys)
                },
            };
            return <Form.List name={listName}>
                {(list,) => {
                    let temp = form.getFieldValue(listName) || [];
                    list = map(list, (val, i) => {
                        let crrRow = temp[i];
                        return {
                            ...crrRow,
                            ...val,
                            key: temp[i].key,
                        };
                    });
                    return <Table
                        className='mb-3'
                        size="small"
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
        const partsFooter = (name = "") => {
            let summary = null
            let requiredClinicalDiag = false
            switch (name) {
                case "Lab":
                    summary = sumFinance.lab
                    requiredClinicalDiag = hosParam?.clinicalDiagLabFlag === "Y"
                    break
                case "Xray":
                    summary = sumFinance.xray
                    requiredClinicalDiag = hosParam?.clinicalDiagXrayFlag === "Y"
                    break
                case "Order":
                    summary = sumFinance.order
                    requiredClinicalDiag = hosParam?.clinicalDiagOrderFlag === "Y"
                    break
                default: break
            }
            const items = [
                // docRemark
                {
                    name: `docRemark${name}`,
                    // label: "วันที่สั่ง",
                    inputType: "textarea",
                    // rules: rules,
                    placeholder: "Note"
                },
                // clinicalDiag
                {
                    name: `clinicalDiag${name}`,
                    // label: "วันที่สั่ง",
                    inputType: "textarea",
                    rules: requiredClinicalDiag ? rules : [],
                    placeholder: requiredClinicalDiag ? "*Clinical Diag" : "Clinical Diag"
                },
            ]
            return <>
                <GenRow>
                    <Col span={12}>
                        {
                            name === "Lab" && <>
                                <GenBtnPrm name="btrRequest" label='แนบข้อมูล Blood transfusion reaction request' />
                                <GenBtnPrm name="labRequest" label='ข้อมูลประกอบการสั่ง LAB' />
                            </>
                        }
                    </Col>
                    <Col span={12}>
                        <GenRow className='mb-1'>
                            <Col span={8} className='text-center'>
                                <LabelTopicPrimary text='จำนวนเงิน' className='d-block' />
                                <LabelText text={summary?.amount} />
                            </Col>
                            <Col span={8} className='text-center'>
                                <LabelTopicPrimary text='เบิกได้' className='d-block' />
                                <LabelText text={summary?.cashReturn} />
                            </Col>
                            <Col span={8} className='text-center'>
                                <label className='text-danger d-block fw-bold'>เบิกไม่ได้</label>
                                <LabelText text={summary?.cashNotReturn} />
                            </Col>
                        </GenRow>
                    </Col>
                </GenRow>
                <GenRow>
                    {
                        map(items, o => {
                            return <Col span={12}>{GenFormItem(items, o.name)}</Col>
                        })
                    }
                </GenRow>
            </>
        }
        return <Form
            form={form}
            onFinish={onFinish}
            layout='vertical'
            initialValues={{
                orderDateLab: dayjs(),
                orderDateXray: dayjs(),
                orderDateOrder: dayjs(),
                fromWorkLab: work.workId,
                fromWorkXray: work.workId,
                fromWorkOrder: work.workId,
                vendor: null,
                toWorkLab: toWorkLab,
                toWorkXray: toWorkXray,
                toWorkOrder: toWorkOrder,
            }}
        >

            {
                formListLengthLab && selectedLab.length
                    ? <>
                        {partsHeader("Lab")}
                        {genFormList("Lab")}
                        {partsFooter("Lab")}
                        <Divider />
                    </>
                    : null
            }
            {
                formListLengthXray && selectedXray.length
                    ? <>
                        {partsHeader("Xray")}
                        {genFormList("Xray")}
                        {partsFooter("Xray")}
                        <Divider />
                    </>
                    : null
            }
            {
                formListLengthOrder && selectedOrder.length
                    ? <>
                        {partsHeader("Order")}
                        {genFormList("Order")}
                        {partsFooter("Order")}
                    </>
                    : null
            }
        </Form>
    }
    const PartsModalTransfusionReaction = () => {
        return <>
            {vsbTransfusionReaction && <TransfusionReaction
                visible={vsbTransfusionReaction}
                patient={patient}
                prev={transfusionReactionByOrder}
                optionsRight={options.opdRights}
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
                    // console.log('onSave', v)
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
    const PartsModalVendor = () => {
        return <>
            {/* issue 900 */}
            <Modal
                centered
                width={875}
                visible={vsbVendor}
                okText="บันทึก"
                cancelText="ปิด"
                onCancel={() => {
                    setVsbVendor(false)
                    formVendor.setFieldsValue({ product: [] })
                }}
                onOk={() => formVendor.submit()}
                title={<LabelTopicPrimary18 text='สรุปค่าใช้จ่าย' />}
                closable={false}
                closeIcon={false}
            >
                <Form
                    initialValues={{
                        product: [{
                            key: 0
                        }]
                    }}
                    form={formVendor}
                    onFinish={onFinishVendor}
                    autoComplete="off"
                    layout="vertical"
                >
                    <GenRow>
                        <Col span={6}>
                            <Form.Item
                                label="บริษัท"
                                name="vendor"
                                rules={[{
                                    required: true,
                                    message: "จำเป็น!"
                                }]}
                            >

                                <Select
                                    placeholder="บริษัท"
                                    style={{ width: "100%" }}
                                    showSearch
                                    onChange={value => handleChangeVendor(value)}
                                    onSelect={i => { handleSelsectVendor(i); }}
                                    // allowClear
                                    optionFilterProp="label"
                                    options={options.vendor}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={14}>
                            <Form.Item label="ซี่ฟัน" name="teeth">
                                <Select
                                    disabled={topbottom}
                                    mode="multiple"
                                    defaultActiveFirstOption={false}
                                    dropdownMatchSelectWidth={false}
                                    maxTagCount={"responsive"}
                                    allowClear
                                    style={{ width: "100%" }}
                                    placeholder="เลือกซี่ฟัน"
                                    options={options.teeth}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                label="บนล่าง"
                                name="topbottom"
                            >
                                <Select
                                    disabled={teethVender?.length}
                                    style={{ width: "100%" }}
                                    showSearch
                                    // onChange={v => { }}
                                    // onSelect={() => { }}
                                    allowClear={true}
                                    optionFilterProp="label"
                                    className="data-value"
                                >
                                    <Select.Option value="T">บน</Select.Option>
                                    <Select.Option value="L">ล่าง</Select.Option>
                                    <Select.Option value="F">ทั้งปาก</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </GenRow>
                    <GenRow>
                        <Col span={24}>
                            <Form.List name="product">
                                {(fields, { add, remove }) => {
                                    return <div style={{ height: 345 }}>
                                        <Table
                                            scroll={{ y: 300 }}
                                            dataSource={fields}
                                            pagination={false}
                                        >
                                            <Table.Column
                                                title="รายการ"
                                                dataIndex={['productId', 'key']}
                                                key="productId"
                                                render={(text, record) => <Form.Item
                                                    style={{ marginBottom: 0 }}
                                                    name={[record.name, 'productId']}
                                                    rules={[{
                                                        required: true,
                                                        message: "จำเป็น"
                                                    }]}
                                                >
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        placeholder="สินค้า"
                                                        showSearch
                                                        // allowClear
                                                        optionFilterProp="label"
                                                        className="data-value"
                                                        onChange={() => setFriend(!friend)}
                                                        options={options.product.map(o => {
                                                            return {
                                                                ...o,
                                                                disabled: findDataInArray(o.value, formVendor.getFieldsValue()?.product || [], "productId")
                                                            };
                                                        })} />
                                                </Form.Item>} />
                                            <Table.Column
                                                title={<Button
                                                    style={{ margin: 0 }}
                                                    size="small"
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => add({ productId: null })}
                                                />}
                                                dataIndex="operation"
                                                key="operation"
                                                width={50}
                                                align="center"
                                                render={(text, record) => {
                                                    return <GenRow align="middle">
                                                        <Button
                                                            style={{ margin: 0 }}
                                                            size="small"
                                                            type="danger"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => remove(record.name)} disabled={record.name === 0}
                                                        />
                                                    </GenRow>
                                                }}
                                            />
                                        </Table>
                                    </div>
                                }}
                            </Form.List>
                        </Col>
                    </GenRow>
                </Form>
            </Modal >
        </>
    }
    const PartsModalProduct = () => {
        const columns = [{
            title: "Product",
            dataIndex: "",
            render: (v, r, i) => {
                return <div style={{
                    marginLeft: -12,
                    marginRight: -12
                }}>
                    <Form.Item name={[i, "index"]} hidden> <Input /> </Form.Item>
                    <Form.Item name={[i, "productId"]} style={{
                        margin: 0
                    }}>
                        <Select
                            showSearch
                            // allowClear 
                            optionFilterProp="label"
                            options={options.productsVendorNull}
                        />
                    </Form.Item>
                </div>;
            }
        }, {
            title: <Button size="small" type="primary" style={{
                margin: 0
            }} icon={<PlusOutlined />} onClick={() => {
                const prev = form.getFieldValue("products") || [];
                form.setFieldsValue({
                    products: [...prev, {
                        index: prev.length,
                        product: null
                    }]
                });
            }} />,
            dataIndex: "",
            align: "center",
            width: 75,
            render: (v, r, i) => {
                return <Button size="small" style={{
                    margin: 0
                }} icon={<DeleteOutlined style={{
                    color: "red"
                }} />} onClick={() => {
                    const prev = form.getFieldValue("products") || [];
                    let newValues = filter(prev, o => o.index !== i);
                    newValues = map(newValues, (o, i) => {
                        return {
                            ...o,
                            index: i
                        };
                    });
                    form.setFieldsValue({
                        products: newValues
                    });
                }} />;
            }
        }];
        return <Modal
            title={<LabelTopicPrimary18 text='ระบุ Products Lab LDT' />}
            visible={vsbProducsForLabLdt}
            width={600}
            closable={false}
            closeIcon={false}
            onCancel={() => {
                setVsbProducsForLabLdt(false);
                form.setFieldsValue({ products: [] });
            }}
            onOk={() => setVsbProducsForLabLdt(false)}
        >
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.List name="products">
                    {(list, { add, remove }) => {
                        let formValues = form.getFieldsValue().products || [];
                        // console.log("formValues   =>  ",formValues);
                        list = list?.map((val, i) => {
                            return {
                                ...val,
                                ...formValues[i]
                            };
                        });
                        return <div style={{ margin: -18 }}>
                            <Table
                                rowClassName={"data-value"}
                                scroll={{ y: 280 }}
                                dataSource={list}
                                columns={columns}
                                pagination={false}
                            />
                        </div>;
                    }}
                </Form.List>
            </Form>
        </Modal >
    };
    const PartsModalChkAuthen = () => {
        return <Modal
            centered
            title={<LabelTopicPrimary18 text='มีรายการ LAB ที่มีการควบคุม กรุณาให้แพทย์ยืนยันการสั่ง' />}
            visible={vsbModalChkAuthen}
            width={700}
            closable={false}
            okText="ยืนยัน"
            cancelText="ปิด"
            onCancel={() => setVsbModalChkAuthen(false)}
            onOk={() => formChkAuthen.submit()}
        >
            <Scrollbars autoHeight autoHeightMin={180}>
                {listLabAcceptFlag.map((o, i) => {
                    return <p key={i}>
                        <label className="data-value">
                            - {o.name}
                        </label>
                    </p>;
                })}
            </Scrollbars>
            <Form form={formChkAuthen} onFinish={onFinishChkAuthen} layout="vertical">
                <GenRow>
                    <Col span={12}>
                        <Form.Item name="userId" label={<label className="gx-text-primary">UserName</label>} rules={[{
                            required: true,
                            message: "จำเป็น !"
                        }]}>
                            <Input style={{
                                width: "100%"
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="password" label={<label className="gx-text-primary">Password</label>} rules={[{
                            required: true,
                            message: "จำเป็น !"
                        }]}>
                            <Input.Password style={{
                                width: "100%"
                            }} />
                        </Form.Item>
                    </Col>
                </GenRow>
            </Form>
        </Modal>
    }
    const PartsModalSelectTeeth = () => {
        return <Modal
            title={<LabelTopicPrimary18 text='เลือกซี่ฟัน' />}
            visible={vsbModalSelectTeeth}
            width={1215}
            closable={false}
            closeIcon={false}
            onCancel={() => setVsbModalSelectTeeth(false)}
            onOk={async () => handleOkModalSelectTeeth()}
        >
            <TeethStatusFha
                teethStatus={null}
                setTeethResult={setTeethResult}
                teethResult={teethResult}
                teethStatusResult={teethStatusResult}
                defaultStatus={defaultStatus}
                setDefaultStatus={setDefaultStatus}
                setTeethChange={() => { }}
                showStatusLabel={false}
                showSideTeeth={false}
            />
        </Modal >
    }
    const PartsModalPaintBoard = () => {
        let bg
        switch (vsbModalPaintBoard) {
            case "Lab":
                bg = imageLab
                break
            case "Xray":
                bg = imageXray
                break
            case "Order":
                bg = imageOrder
                break
            default: break
        }
        return <PaintBoardPhysicalExam
            handlePaintModal={() => setVsbModalPaintBoard(false)}
            setBase64={base64 => handleSavePaintBoard(vsbModalPaintBoard, base64)}
            // templateId={templateId}
            // docFavTemplate={docFavTemplate}
            paintActive={vsbModalPaintBoard}
            width={400}
            height={400}
            // getMasterDocFavTemplate={getMasterDocFavTemplate}
            // notificationX={notificationX} 
            bg={bg}
        />
    }
    return <Modal
        title={<GenRow align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
            <Col span={12}>
                <LabelTopicPrimary18 text='สรุปค่าใช้จ่าย' />
            </Col>
            <Col span={12} className='text-end'>

            </Col>
        </GenRow>}
        centered
        visible={visible}
        closable={false}
        width={1375}
        okButtonProps={{
            loading: loading || loadingLab || loadingXray || loadingOrder,
        }}
        footer={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
            <Col span={24} className='text-end'>
                <Button
                    type="primary"
                    style={{ marginBottom: 0 }}
                    onClick={() => onAddNewItems()}
                    disabled={orderNoLab || orderNoXray || orderNoOrder}
                    loading={loading || loadingLab || loadingXray || loadingOrder}
                >
                    สั่งเพิ่ม
                </Button>
                <Button
                    type="default"
                    style={{ marginBottom: 0 }}
                    onClick={() => handleCancle()}
                    loading={loading || loadingLab || loadingXray || loadingOrder}
                >
                    ปิด
                </Button>
                <Button
                    type="primary"
                    style={{ marginBottom: 0 }}
                    onClick={() => handleOk()}
                    loading={loading || loadingLab || loadingXray || loadingOrder}
                >
                    บันทึก
                </Button>
            </Col>
        </GenRow>}
    >
        <Spin spinning={loading || loadingLab || loadingXray || loadingOrder}>
            <div style={{ margin: -18, height: 535 }}>
                <Scrollbars autoHeight autoHeightMin={525}>
                    <div className='ps-1 pe-1'>
                        {PartsForm()}
                    </div>
                </Scrollbars>
            </div>
        </Spin>
        {PartsModalTransfusionReaction()}
        {PartsModalDiagAndAncRequest()}
        {PartsModalVendor()}
        {PartsModalProduct()}
        {PartsModalChkAuthen()}
        {PartsModalSelectTeeth()}
        {PartsModalPaintBoard()}
    </Modal>
}
const listApi = [
    // GetFinancesType
    {
        name: "GetFinancesType",
        url: "Masters/GetFinancesType",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlaces
    {
        name: "GetWorkPlaces",
        url: "Masters/GetWorkPlacesMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesLab
    {
        name: "GetWorkPlacesLab",
        url: "Laboratory/GetWorkPlacesLabVisit",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesXray
    {
        name: "GetWorkPlacesXray",
        url: "Masters/GetWorkPlacesXray",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesOPD
    {
        name: "GetWorkPlacesOPD",
        url: "Masters/GetWorkPlaces_OPD_VisitMainWork",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesDental
    {
        name: "GetWorkPlacesDental",
        url: "Masters/GetWorkPlacesDental",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesOR
    {
        name: "GetWorkPlacesOR",
        url: "Masters/GetWorkPlacesDoSetSurgicalOperationOR",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesWard
    {
        name: "GetWorkPlacesWard",
        url: "Masters/GetWorkPlaces_Dashboard_Mas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetWorkPlacesLab
    {
        name: "GetWorkPlacesLab",
        url: "Laboratory/GetWorkPlacesLabVisit",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetVendorOutSide
    {
        name: "GetVendorOutSide",
        url: "Masters/GetVendorOutSide",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetProductByVendor
    {
        name: "GetProductByVendor",
        url: "Dental/GetProductByVendor?VendorId=",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    // GetTeeth
    {
        name: "GetTeeth",
        url: "Masters/GetTeeth",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    // GetProductByVendorNull
    {
        name: "GetProductByVendorNull",
        url: "Dental/GetProductByVendor?vendornull=1",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    // CheckAuthenticate
    {
        name: "CheckAuthenticate",
        url: "OpdExamination/CheckAuthenticate",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    // GetExpenseByAutoMeaning
    {
        name: "GetExpenseByAutoMeaning",
        url: "Masters/GetExpenseByAutoMeaning/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    // GetVendorsMaster
    {
        name: "GetVendorsMaster",
        url: "MedicationSupplies/GetVendorsMaster",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    // GetOpdRightIdByServiceId
    {
        name: "GetOpdRightIdByServiceId",
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false
    },
    // GetAdmitRightDisplay
    {
        name: "GetAdmitRightDisplay",
        url: "IpdWard/GetAdmitRightDisplay",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
]
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

const defaultStatusTeeth = [{
    ptDenChkId: null,
    teethStatus: "",
    teeth: "55"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "54"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "53"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "52"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "51"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "18"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "17"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "16"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "15"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "14"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "13"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "12"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "11"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "21"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "22"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "23"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "24"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "25"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "26"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "27"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "28"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "61"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "62"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "63"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "64"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "65"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "85"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "84"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "83"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "82"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "81"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "48"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "47"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "46"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "45"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "44"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "43"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "42"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "41"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "31"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "32"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "33"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "34"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "35"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "36"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "37"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "38"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "71"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "72"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "73"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "74"
}, {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "75"
}]