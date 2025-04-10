/* eslint-disable react-hooks/exhaustive-deps */


import { StarOutlined } from '@ant-design/icons';
import doctorMaleOutline from "@iconify/icons-healthicons/doctor-male-outline";
import { Icon } from "@iconify/react";
import {
    Button,
    Checkbox,
    Col,
    Divider,
    Form,
    Image,
    Input,
    Menu,
    Modal,
    notification,
    Radio,
    Select,
    Spin,
    Table,
    Tabs,
    Tooltip
} from 'antd';
import { notiWarning } from "components/Notification/notificationX";
import { callApi } from 'components/helper/function/CallApi';
import {
    LabelText,
    LabelTopic,
    LabelTopic18,
    LabelTopicPrimary18
} from "components/helper/function/GenLabel";
import GenRow from "components/helper/function/GenRow";
import { mappingOptions } from "components/helper/function/MappingOptions";
import { env } from 'env';
import { differenceBy, filter, intersectionBy, map, uniqBy } from "lodash";
import moment from "moment";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from 'react';
import Scrollbars from "react-custom-scrollbars";
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import { dspExpenseLabs, dspExpenseOrders, dspExpenseXrays } from '../../appRedux/actions/DropdownMaster';
import UpsertFinancesDivideByType from "./UpsertFinancesDivideByType";

const { SubMenu } = Menu;
const selectProps = {
    style: { width: '100%' },
    showSearch: true,
    allowClear: true,
    dropdownMatchSelectWidth: 345,
    className: 'data-value',
    optionFilterProp: 'label',
}
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
const size = "small"
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

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const doctorTypeFromsession = userFromSession.responseData.doctorType || null;
const user = userFromSession.responseData.userId || null;
const hosParam = JSON.parse(localStorage.getItem("hos_param"));

export default function SelectExpenses({
    visible = false,
    onCancel = () => { },
    onCopy = () => { },
    patient = null,
    patientId = null,
    serviceId = null,
    admitId = null,
    clinicId = null,
    rightId = null,
    opdRightId = null,
    admitRightId = null,
    workType = "OPD",
    doctor = {
        doctorId: null,
        doctorName: null,
    },
    work = {
        workId: null,
        workName: null,
    },
    oderedExpenses = [],
    isOrder = true,
    listDD = {
        userTypeMD: []
    },
    handleDoctorChange = null
}) {
    const dispatch = useDispatch();
    const {
        expenseOrders: storeExpenseOrders,
        expenseLabs: storeExpenseLabs,
        expenseXrays: storeExpenseXrays
    } = useSelector(({ getDropdownMaster }) => getDropdownMaster);

    const [formLab] = Form.useForm()
    const [formOrder] = Form.useForm()
    const [formXray] = Form.useForm()

    const workIdLab = Form.useWatch("workId", formLab)
    const workIdXray = Form.useWatch("workId", formXray)
    const workIdOrder = Form.useWatch("workId", formOrder)
    const modalityXray = Form.useWatch("group", formXray)
    const inOutLab = Form.useWatch("inOut", formLab)
    const rushFlagLab = Form.useWatch("rushFlag", formLab)
    const rushFlagXray = Form.useWatch("rushFlag", formXray)
    const rushFlagOrder = Form.useWatch("rushFlag", formOrder)
    const specialFlag = Form.useWatch("specialFlag", formXray)

    const [vsbUpsertFinances, setVsbUpsertFinances] = useState(false)
    const [options, setOptions] = useState({
        // LAB
        favoriteLab: [],
        defaultLab: [],
        favoriteLabFiltered: [],
        labExpense: [],
        labExpenseAll: [],
        workPlacesLab: [],
        labGroup: [],
        // ORDER
        orderExpense: [],
        orderExpenseAll: [],
        favoriteOrder: [],
        defaultOrder: [],
        favoriteOrderFiltered: [],
        workPlaces: [],
        financeTypeOrder: [],
        // X-Ray
        xrayExpense: [],
        xrayExpenseAll: [],
        favoriteXray: [],
        defaultXray: [],
        favoriteXrayFiltered: [],
        workPlacesXray: [],
        financeTypeXray: [],
        xrayGroup: [],
        xrayOrgan: [],
        xrayOrganBody: [],
        rightId: [],
        opdRightId: [],
        admitRightId: [],

    })
    const [loading, setLoading] = useState(false)
    const [tabsActiveKey, setTabsActiveKey] = useState("L")
    const [firstTimeActiveTab, setFirstTimeActiveTab] = useState({
        O: true,
        X: true,
    })
    // Lab
    const [labAgianLoading, setLabAgianLoading] = useState(false)
    const [selectedFormulaLabId, setSelectedFormulaLabId] = useState(null);
    const [selectedLabRowKeys, setSelectedLabRowKeys] = useState([])
    const [selectedLabRows, setSelectedLabRows] = useState([])
    // Order
    const [selectedFormulaOrderId, setSelectedFormulaOrderId] = useState(null);
    const [selectedOrderRowKeys, setSelectedOrderRowKeys] = useState([])
    const [selectedOrderRows, setSelectedOrderRows] = useState([])
    // X-Ray
    const [selectedFormulaXrayId, setSelectedFormulaXrayId] = useState(null);
    const [selectedXrayRowKeys, setSelectedXrayRowKeys] = useState([])
    const [selectedXrayRows, setSelectedXrayRows] = useState([])

    const mappingExpenseId = (expenses) => {
        const mapping = map(expenses, o => {
            return o.expenseId
        })
        return mapping
    }

    const chkWarningSelectedItems = (selectedItems) => {
        if (!oderedExpenses.length) return
        const orderedItems = () => {
            const intersections = intersectionBy(selectedItems, oderedExpenses, "expenseId")
            map(intersections, o => {
                return notiWarning({
                    message: "แจ้งเตือนรายการซ้ำ",
                    description: o.name
                })
            })
        }
        orderedItems()
    }

    const chkSelectedItems = ({ type = null, selectedItems = [] }) => {
        let needConfirm = false
        let checkedDts = selectedItems
        let selectedRows = []
        switch (type) {
            case "Lab":
                selectedRows = selectedLabRows
                break
            case "Order":
                selectedRows = selectedOrderRows
                break
            case "Xray":
                selectedRows = selectedXrayRows
                break
            default: break
        }
        if (!needConfirm) {
            chkWarningSelectedItems(checkedDts)
            switch (type) {
                case "Lab":
                    chkLabAlert(checkedDts)
                    break
                default:
                    handleSetSelectedRows({ type, dts: [...checkedDts, ...selectedRows] })
                    break;
            }
        }
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
            const { name } = expenseDetails;
            const findFlags = Object.keys(doctypes).filter((key) => expenseDetails[key] === "Y");
            const findKeyDoctor = Object.keys(doctypes).find((key) => doctypes[key].toLowerCase() === doctorTypeFromsession?.toLowerCase());
            const userCorrect = expenseDetails[findKeyDoctor] === "Y" ? true : false;
            if (!userCorrect && findFlags.length > 0) {
                labAlertNoti({
                    labName: name,
                    titleMessage: "แจ้งเตือนรายการที่ต้องยืนยันจากแพทย์ก่อนสั่ง",
                    notiLabStyle: yellowNoti,
                    notiLabFontStyle: "#ffab2b",
                    textOrIcon: <Icon icon={doctorMaleOutline} width={25} />,
                });
            }
        };

        const chkLifelabflag = (expenseDetails) => {
            const { name, lifelabflag } = expenseDetails;
            if (lifelabflag) {
                labAlertNoti({
                    labName: name,
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
                return callApi(
                    listApi,
                    "GetCheckLabagian",
                    `?PatientId=${patientId}&ExpenseId=${o.expenseId}`
                ).then(value => {
                    let temp = value ? value : {}
                    return {
                        ...o,
                        ...temp,
                        name: o.name,
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
                        labName: `${o.name} - เคยมีการสั่งในช่วง ${o?.countExaminedDate} วัน ${o?.lockLabagian === "Y" ? "(ไม่อนุญาติให้สั่งซ้ำ)" : ""}`,
                        titleMessage: "แจ้งเตือนสั่ง LAB ซ้ำ",
                        descriptionMessage: `สั่งล่าสุด : ${moment(o?.dateCreated, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY ")} Order No : ${o?.orderId}`,
                        notiLabStyle: redNoti,
                        notiLabFontStyle: "#ff7272",
                        textOrIcon: "RLU"
                    })
                })
                if (forSet.length) {
                    handleSetSelectedRows({ type: "Lab", dts: [...forSet, ...selectedLabRows] })
                }
            })
        }
        map(expensesLab, o => {
            checkDoctorTypes(o)
            chkLifelabflag(o)
        })
        checkLabAgain()
    }

    const filterModality = () => {
        if (!workIdXray) return options.xrayGroup
        const filterX = filter(options.xrayGroup, ["workId", workIdXray])
        return filterX
    }

    const filterOrgan = () => {
        let filterX = options?.xrayOrgan || []
        if (workIdXray) {
            filterX = filter(filterX, ["workId", workIdXray])
        }
        if (modalityXray) {
            filterX = filter(filterX, ["modality", modalityXray])
        }

        return uniqBy(filterX, "code")
    }

    const defaultForm = () => {
        formLab.setFieldsValue({ workId: hosParam?.centralLab?.toString() })
        formXray.setFieldsValue({ workId: hosParam?.centralXray?.toString() })
        formOrder.setFieldsValue({ workId: work.workId })
    }

    const getOptions = async ({ type = null, req = null, useStore = true }) => {
        console.log('useStore', useStore)
        let res = null
        switch (type) {
            // LAB
            case "GetFavAndDefaultLab":
                res = await callApi(listApi, type, req)
                setOptions(p => {
                    return {
                        ...p,
                        defaultLab: res?.userLab || [],
                        favoriteLab: [...res?.roomLab, ...res?.globalLab] || [],
                        favoriteLabFiltered: [...res?.roomLab, ...res?.globalLab] || [],
                        defaultXray: res?.userXray || [],
                        favoriteXray: [...res?.roomXray, ...res?.globalXray] || [],
                        favoriteXrayFiltered: [...res?.roomXray, ...res?.globalXray] || [],
                    }
                })
                break;
            case "GetExpensesLab":
                if (useStore) {
                    if (storeExpenseLabs.length) {
                        setOptions(p => {
                            return {
                                ...p,
                                labExpense: storeExpenseLabs,
                                labExpenseAll: storeExpenseLabs,
                            }
                        })
                        break
                    }
                }
                setLoading(true)
                res = await callApi(listApi, type, req)
                setLoading(false)
                res = map(res, o => {
                    const disabled = chkCndForDisabledExpense(o)
                    return {
                        ...o,
                        disabled: disabled
                    }
                })

                setOptions(p => {
                    const all = p.labExpenseAll.length ? p.labExpenseAll : res
                    return {
                        ...p,
                        labExpense: res,
                        labExpenseAll: all,
                    }
                })
                dispatch(dspExpenseLabs(res))
                break
            case "GetWorkPlacesLab":
                res = await callApi(listApi, type)
                res = mappingOptions({
                    dts: res,
                    valueField: "workId",
                    labelField: "dataDisplay",
                })
                setOptions(p => {
                    return {
                        ...p,
                        workPlacesLab: res
                    }
                })
                break
            case "GetLabGroup":
                res = await callApi(listApi, type)
                res = mappingOptions({ dts: res, })
                setOptions(p => {
                    return {
                        ...p,
                        labGroup: res
                    }
                })
                break
            case "GetFavAndDefaultOrder":
                res = await callApi(listApi, type, req)
                setOptions(p => {
                    return {
                        ...p,
                        defaultOrder: res?.userLab || [],
                        favoriteOrder: [...res?.roomLab, ...res?.globalLab] || [],
                        favoriteOrderFiltered: [...res?.roomLab, ...res?.globalLab] || [],
                    }
                })
                break;
            case "GetExpensesOrder":
                if (useStore) {
                    if (storeExpenseOrders.length) {
                        setOptions(p => {
                            return {
                                ...p,
                                orderExpense: storeExpenseOrders,
                                orderExpenseAll: storeExpenseOrders,
                            }
                        })
                        break
                    }
                }
                setLoading(true)
                res = await callApi(listApi, type, req)
                setLoading(false)
                res = map(res, o => {
                    const disabled = chkCndForDisabledExpense(o)
                    return {
                        ...o,
                        disabled: disabled
                    }
                })
                setOptions(p => {
                    const all = p.orderExpenseAll.length ? p.orderExpenseAll : res
                    return {
                        ...p,
                        orderExpense: res,
                        orderExpenseAll: all,
                    }
                })
                dispatch(dspExpenseOrders(res))
                break
            case "GetWorkPlaces":
                res = await callApi(listApi, type)
                res = mappingOptions({ dts: res })
                setOptions(p => {
                    return {
                        ...p,
                        workPlaces: res
                    }
                })
                break
            case "GetFinancesType":
                res = await callApi(listApi, type)
                res = filter(res, o => o.datavalue === "S" || o.datavalue === "O" || o.datavalue === "DF" || o.datavalue === "M")
                res = mappingOptions({ dts: res })

                setOptions(p => {
                    return {
                        ...p,
                        financeTypeOrder: res
                    }
                })

                break
            case "GetExpensesXray":
                if (useStore) {
                    if (storeExpenseOrders.length) {
                        setOptions(p => {
                            return {
                                ...p,
                                xrayExpense: storeExpenseXrays,
                                xrayExpenseAll: storeExpenseXrays,
                            }
                        })
                        break
                    }
                }

                setLoading(true)
                res = await callApi(listApi, type, req)
                setLoading(false)
                res = uniqBy(res, 'expenseId')
                res = map(res, (o) => {
                    const disabled = chkCndForDisabledExpense(o)
                    return {
                        ...o,
                        disabled: disabled
                    }
                })
                setOptions(p => {
                    const all = p.xrayExpenseAll.length ? p.xrayExpenseAll : res
                    return {
                        ...p,
                        xrayExpense: res,
                        xrayExpenseAll: all,
                    }
                })
                dispatch(dspExpenseXrays(res))
                break
            case "GetWorkPlacesXray":
                res = await callApi(listApi, type)
                res = mappingOptions({ dts: res })
                setOptions(p => {
                    return {
                        ...p,
                        workPlacesXray: res
                    }
                })
                break
            case "GetXrayGroup":
                res = await callApi(listApi, type)
                res = mappingOptions({ dts: res, valueField: "code", labelField: "name" })
                setOptions(p => {
                    return {
                        ...p,
                        xrayGroup: res
                    }
                })
                break
            case "GetOrgans":
                res = await callApi(listApi, type)
                res = mappingOptions({ dts: res, valueField: "code", labelField: "name" })
                setOptions(p => {
                    return {
                        ...p,
                        xrayOrgan: res
                    }
                })
                break
            case "GetXrayOrganBody":
                res = await callApi(listApi, type, req)
                setOptions(p => {
                    return {
                        ...p,
                        xrayOrganBody: res?.xrayOrgan || []
                    }
                })
                break
            default:
                break;
        }
    }

    const getExpenseXrayByBodyOrgan = async (expenses) => {
        // console.log('expenses', expenses)
        const cleanUpDts = uniqBy(expenses, "code")
        const IsOrganContain = checkSelectedOrgan(cleanUpDts)
        setLoading(true)
        if (IsOrganContain) {
            const promises = map(cleanUpDts, o => {
                return callApi(
                    listApi,
                    "GetExpensesXray",
                    { organ: o.code, group: formXray.getFieldValue('group') }
                ).then(value => { return value });
            });
            return Promise.all(promises).then((results) => {
                setLoading(false)
                let temp = []
                map(results, o => {
                    temp = [...temp, ...o]
                })
                temp = uniqBy(temp, "expenseId")
                setOptions(p => {
                    return {
                        ...p,
                        xrayExpense: temp,
                    }
                })
            })
        } else {
            setLoading(false)
            setOptions(p => {
                return {
                    ...p,
                    xrayExpense: [],
                }
            })
        }

    }

    const checkSelectedOrgan = (organ) => {
        const organlist = filterOrgan()
        const organCode = organ[0]?.code;

        if (organlist?.some(item => item.code === organCode)) {
            formXray.setFieldsValue({ organ: organCode });
            return true
        } else {
            formXray.setFieldsValue({ organ: null });
            notiWarning({ message: "ไม่พบ organ ตามที่เลือก" });
            return false
        }

    }
    const handleSearchFav = ({ type, keywords }) => {
        let filered = []
        switch (type) {
            case "Lab":
                filered = filter(options.favoriteLab, o => o?.name?.toLowerCase().includes(keywords.toLowerCase()))
                setOptions(p => {
                    return {
                        ...p,
                        favoriteLabFiltered: filered,
                    }
                })
                break
            case "Order":
                filered = filter(options.favoriteOrder, o => o?.name?.toLowerCase().includes(keywords.toLowerCase()))
                setOptions(p => {
                    return {
                        ...p,
                        favoriteOrderFiltered: filered,
                    }
                })
                break
        }
    }

    const handleClickFormulaId = (type, formulaId) => {
        let formValues
        let req
        switch (type) {
            case "Lab":
                formValues = formLab.getFieldsValue()
                req = {
                    "code": formValues?.code || null,
                    "workId": formValues?.workId || null,
                    "group": formValues?.group || null,
                    "formulaId": formulaId
                }
                getOptions({ type: "GetExpensesLab", req, useStore: false })
                break;
            case "Order":
                formValues = formOrder.getFieldsValue()
                req = {
                    "code": formValues?.code || null,
                    "workId": formValues?.workId || null,
                    "group": formValues?.group || null,
                    "formulaId": formulaId
                }
                if (!req?.code && !req?.group && !formulaId) {
                    if (options.orderExpenseAll.length) {
                        setOptions(p => { return { ...p, orderExpense: p.orderExpenseAll, } })
                    } else {
                        getOptions({ type: "GetExpensesOrder", req, useStore: false })
                    }
                } else {
                    getOptions({ type: "GetExpensesOrder", req, useStore: false })
                }

                break;
            case "Xray":
                formValues = formXray.getFieldsValue()
                req = {
                    "code": formValues?.code || null,
                    "workId": formValues?.workId || null,
                    "group": formValues?.group || null,
                    "formulaId": formulaId
                }

                if (!req?.code && !req?.group && !formulaId) {
                    if (options.xrayExpenseAll.length) {
                        setOptions(p => { return { ...p, xrayExpense: p.xrayExpenseAll, } })
                    } else {
                        getOptions({ type: "GetExpensesXray", req, useStore: false })
                    }
                } else {
                    getOptions({ type: "GetExpensesXray", req, useStore: false })
                }
                break;
            default: break
        }
    }

    const handleSetSelectedRows = ({ type = null, dts = [] }) => {
        const cleanUp = uniqBy(dts, "expenseId")
        const mapping = mappingExpenseId(cleanUp)
        switch (type) {
            case "Lab":
                setSelectedLabRows(cleanUp)
                setSelectedLabRowKeys(mapping)
                break
            case "Order":
                setSelectedOrderRows(cleanUp)
                setSelectedOrderRowKeys(mapping)
                break
            case "Xray":
                setSelectedXrayRows(cleanUp)
                setSelectedXrayRowKeys(mapping)
                break
            default: break
        }
    }

    const handleSelectRow = ({ type = null, record }) => {
        switch (type) {
            case "Lab":
                chkSelectedItems({ type, selectedItems: [record] })
                break;
            case "Order":
                chkSelectedItems({ type, selectedItems: [record] })
                break;
            case "Xray":
                chkSelectedItems({ type, selectedItems: [record] })
                break;
            default: break
        }
    }

    const handleCancleSelectedRow = ({ type = null, record }) => {
        let newData = []
        switch (type) {
            case "Lab":
                newData = differenceBy(selectedLabRows, [record], 'expenseId')
                handleSetSelectedRows({ type, dts: newData })
                break;
            case "Order":
                newData = differenceBy(selectedOrderRows, [record], 'expenseId')
                handleSetSelectedRows({ type, dts: newData })
                break;
            case "Xray":
                newData = differenceBy(selectedXrayRows, [record], 'expenseId')
                handleSetSelectedRows({ type, dts: newData })
                break;
            default: break
        }
    }

    const handleSelectAll = ({ type = null, selectedRows = [] }) => {
        const filtered = filter(selectedRows, o => !o.disabled)
        chkSelectedItems({ type, selectedItems: filtered })
    }

    const handleCancleSelectedAll = ({ type = null, canceledRows = [] }) => {
        let newData = []
        switch (type) {
            case "Lab":
                newData = differenceBy(selectedLabRows, canceledRows, 'expenseId')
                break;
            case "Order":
                newData = differenceBy(selectedOrderRows, canceledRows, 'expenseId')
                break;
            case "Xray":
                newData = differenceBy(selectedXrayRows, canceledRows, 'expenseId')
                break;
            default: break
        }
        handleSetSelectedRows({ type, dts: newData })
    }

    const handleChangeTabsKey = (v) => {
        setTabsActiveKey(v)
        switch (v) {
            case "X":
                if (firstTimeActiveTab.X) {
                    formXray.submit()
                    setFirstTimeActiveTab(p => {
                        return {
                            ...p,
                            X: false,
                        }
                    })
                }
                break
            case "O":
                if (firstTimeActiveTab.O) {
                    formOrder.submit()
                    setFirstTimeActiveTab(p => {
                        return {
                            ...p,
                            O: false,
                        }
                    })
                }
                break
            default:
                break
        }
    }

    const handleChangeFormXray = (field) => {
        switch (field) {
            case "workId":
                formXray.setFieldsValue({ group: null, organ: null, })
                break;
            case "group":
                formXray.setFieldsValue({ organ: null, })
                break;
            default:
                break;
        }
        formXray.submit()
    }

    const handleClickBody = e => {
        setSelectedFormulaXrayId(null)
        formXray.setFieldsValue({
            // workId: null,
            // group: null,
            organ: null,
            code: null,
        })
        // console.log('options.xrayOrganBody', options.xrayOrganBody)
        let x = e.nativeEvent.offsetX;
        let y = e.nativeEvent.offsetY;
        let tempChooseOrderXray = [];
        let tempOrganId = [];

        // [1] ท้อง : abdomen
        if (x >= 76 && x <= 153 && y >= 154 && y <= 205) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "1") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val.code);
                }
            });
        }

        // [10, 94] ดวงตา, เบ้าตา : eye, orbit
        if (x >= 329 && x <= 339 && y >= 32 && y <= 39 || x >= 343 && x <= 352 && y >= 32 && y <= 39) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "10" || val.code === "94") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val.code);
                }
            });
        }

        // [100] ข้อ : arthro
        if (x >= 303 && x <= 324 && y >= 288 && y <= 308 || x >= 359 && x <= 381 && y >= 288 && y <= 308) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "100") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val.code);
                }
            });
        }

        // [101] ช่องกลางหน้าอก : mediasti
        if (x >= 108 && x <= 120 && y >= 72 && y <= 154) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "101") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [103, 115] ข้อต่อ TM, ข้อต่อ : TM joint, T.M.JOINT
        if (x >= 325 && x <= 331 && y >= 39 && y <= 43 || x >= 351 && x <= 356 && y >= 40 && y <= 45) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "103" || val.code === "115") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [105] กระดูกเชิงกราน : pelvic
        if (x >= 308 && x <= 375 && y >= 179 && y <= 229) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "105") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [107] ลำไส้เล็ก : small
        if (x >= 105 && x <= 124 && y >= 177 && y <= 201 || x >= 127 && x <= 131 && y >= 177 && y <= 197) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "107") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [108] ลำไส้ : bowel
        if (x >= 89 && x <= 140 && y >= 176 && y <= 205) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "108") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [109] ลำไส้ใหญ่ : large
        if (x >= 105 && x <= 123 && y >= 169 && y <= 175 || x >= 89 && x <= 140 && y >= 176 && y <= 205 || x >= 89 && x <= 140 && y >= 176 && y <= 205) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "109") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [11] ใบหน้า : face
        if (x >= 327 && x <= 357 && y >= 28 && y <= 61) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "11") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [110] ไขสันหลัง : myelo
        if (x >= 336 && x <= 349 && y >= 61 && y <= 188) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "110") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [112] คอหอย : eso
        if (x >= 107 && x <= 121 && y >= 54 && y <= 71) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "112") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [113] การตรวจวินิจฉัยระบบทางเดิน น้ำดี : MRCP
        if (x >= 104 && x <= 124 && y >= 155 && y <= 169) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "113") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [114] ถุงหุ้มอัณฑะ : scrot
        if (x >= 104 && x <= 124 && y >= 202 && y <= 218) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "114") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [117] ข้อต่อ AC : AC joint
        if (x >= 91 && x <= 97 && y >= 32 && y <= 73 || x >= 114 && x <= 118 && y >= 32 && y <= 73) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "117") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [118] กระดูกใต้กระเบนเหน็บ : sacrum
        if (x >= 328 && x <= 356 && y >= 183 && y <= 215) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "118") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [119] ไต : renal
        if (x >= 90 && x <= 102 && y >= 156 && y <= 176 || x >= 125 && x <= 138 && y >= 156 && y <= 176) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "119") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [12] เต้านม : breast
        if (x >= 308 && x <= 334 && y >= 98 && y <= 128 || x >= 351 && x <= 377 && y >= 98 && y <= 128) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "12") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [120] หลอดเลือดแดง : arteries
        if (x >= 130 && x <= 149 && y >= 209 && y <= 248 || x >= 134 && x <= 155 && y >= 84 && y <= 101 || x >= 78 && x <= 107 && y >= 85 && y <= 101) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "120") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [121] ขมับ : mastoid
        if (x >= 352 && x <= 357 && y >= 45 && y <= 49 || x >= 326 && x <= 331 && y >= 45 && y <= 49) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "121") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [122, 17, 18, 19] แขนท่อนปลาย, กระดูกปลายแขนใน, กระดูกปลายแขนนอก, กระดูกปลายแขนนอก : forearm, ulnar, radius, radial
        if (x >= 255 && x <= 289 && y >= 149 && y <= 196 || x >= 394 && x <= 429 && y >= 45 && y <= 49) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "122" || val.code === "17" || val.code === "18" || val.code === "19") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [123] คอ : neck
        if (x >= 329 && x <= 356 && y >= 50 && y <= 68) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "123") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [124, 16] แขน, กระดูกต้นแขน : arm, humerus
        if (x >= 277 && x <= 304 && y >= 86 && y <= 149 || x >= 382 && x <= 406 && y >= 85 && y <= 147) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "124" || val.code === "16") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [13] สะโพก : hip
        if (x >= 306 && x <= 324 && y >= 209 && y <= 230 || x >= 360 && x <= 379 && y >= 209 && y <= 230) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "13") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [14] ต่อมหมวกไต : adrenal
        if (x >= 95 && x <= 103 && y >= 157 && y <= 162 || x >= 126 && x <= 133 && y >= 157 && y <= 162) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "14") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [15] ตับ : liver
        if (x >= 110 && x <= 119 && y >= 141 && y <= 156 || x >= 105 && x <= 110 && y >= 153 && y <= 161 || x >= 87 && x <= 89 && y >= 157 && y <= 169) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "15") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [2] มือ : hand
        if (x >= 8 && x <= 38 && y >= 197 && y <= 236 || x >= 191 && x <= 221 && y >= 197 && y <= 235 || x >= 235 && x <= 267 && y >= 197 && y <= 235 || x >= 418 && x <= 448 && y >= 197 && y <= 236) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "2") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [20] หน้าแข้ง : tibia
        if (x >= 297 && x <= 321 && y >= 305 && y <= 389 || x >= 360 && x <= 385 && y >= 209 && y <= 391) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "20") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [21] ขา : leg
        if (x >= 50 && x <= 180 && y >= 257 && y <= 420 || x >= 282 && x <= 413 && y >= 257 && y <= 420) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "21") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [22] ต้นขา : thigh
        if (x >= 300 && x <= 340 && y >= 217 && y <= 288 || x >= 360 && x <= 378 && y >= 209 && y <= 293) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "22") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [23] กระดูกขาอ่อน : femur
        if (x >= 306 && x <= 324 && y >= 209 && y <= 295 || x >= 114 && x <= 118 && y >= 32 && y <= 73) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "23") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [24] กระดูกน่อง : fibula
        if (x >= 303 && x <= 308 && y >= 309 && y <= 333 || x >= 301 && x <= 305 && y >= 333 && y <= 356 || x >= 298 && x <= 304 && y >= 357 && y <= 372 || x >= 298 && x <= 302 && y >= 372 && y <= 389 || x >= 376 && x <= 380 && y >= 308 && y <= 338 || x >= 378 && x <= 382 && y >= 338 && y <= 355 || x >= 380 && x <= 384 && y >= 356 && y <= 373 || x >= 381 && x <= 384 && y >= 373 && y <= 385) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "24") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [25] ข้อเท้า : ankle
        if (x >= 298 && x <= 309 && y >= 391 && y <= 399 || x >= 114 && x <= 118 && y >= 391 && y <= 399) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "25") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [26] เท้า : foot
        if (x >= 51 && x <= 82 && y >= 394 && y <= 422 || x >= 148 && x <= 178 && y >= 394 && y <= 421 || x >= 280 && x <= 309 && y >= 397 && y <= 420 || x >= 377 && x <= 406 && y >= 398 && y <= 421) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "26") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [27] เท้า(2ข้าง) : feet
        if (x >= 50 && x <= 177 && y >= 393 && y <= 421 || x >= 278 && x <= 406 && y >= 397 && y <= 421) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "27") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [28] นิ้วเท้า : toe
        if (x >= 52 && x <= 62 && y >= 407 && y <= 420 || x >= 166 && x <= 176 && y >= 407 && y <= 419 || x >= 280 && x <= 290 && y >= 407 && y <= 420 || x >= 394 && x <= 404 && y >= 408 && y <= 419) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "28") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [29] ข้อมือ : wrist
        if (x >= 20 && x <= 38 && y >= 196 && y <= 206 || x >= 192 && x <= 210 && y >= 196 && y <= 206 || x >= 250 && x <= 267 && y >= 196 && y <= 206 || x >= 419 && x <= 433 && y >= 196 && y <= 206) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "29") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [3] ไต : kidney
        if (x >= 90 && x <= 103 && y >= 157 && y <= 176 || x >= 125 && x <= 138 && y >= 157 && y <= 176) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "3") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [30] บ่า : shoulder
        if (x >= 90 && x <= 103 && y >= 157 && y <= 176 || x >= 125 && x <= 138 && y >= 157 && y <= 176) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "30") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [31] สะบัก : scapula
        if (x >= 297 && x <= 326 && y >= 80 && y <= 117 || x >= 359 && x <= 388 && y >= 80 && y <= 117) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "31") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [32] สะบัไหปลาร้าก : clavicle
        if (x >= 299 && x <= 336 && y >= 76 && y <= 83 || x >= 346 && x <= 385 && y >= 77 && y <= 82) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "32") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [33] ปอด : lung
        if (x >= 90 && x <= 108 && y >= 101 && y <= 125 || x >= 86 && x <= 108 && y >= 125 && y <= 153 || x >= 121 && x <= 140 && y >= 101 && y <= 125 || x >= 121 && x <= 142 && y >= 125 && y <= 153) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "33") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [39] ลำไส้ : intestine
        if (x >= 89 && x <= 140 && y >= 176 && y <= 205) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "39") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [32] ไหปลาร้าก : clavicle
        if (x >= 299 && x <= 336 && y >= 76 && y <= 83 || x >= 346 && x <= 385 && y >= 77 && y <= 82) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "32") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [40] เข่า : knee
        if (x >= 304 && x <= 324 && y >= 288 && y <= 308 || x >= 360 && x <= 380 && y >= 77 && y <= 82) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "40") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [41] ข้อศอก : elbow
        if (x >= 272 && x <= 294 && y >= 138 && y <= 155 || x >= 390 && x <= 411 && y >= 138 && y <= 155) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "41") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [42] ม้าม : spleen
        if (x >= 310 && x <= 335 && y >= 128 && y <= 167 || x >= 350 && x <= 375 && y >= 128 && y <= 167) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "42") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [43] กระดูกส้นเท้า : calcaneus
        if (x >= 310 && x <= 335 && y >= 128 && y <= 167 || x >= 350 && x <= 375 && y >= 128 && y <= 167) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "43") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [45] กระดูกสัมหลัง : spine
        if (x >= 336 && x <= 349 && y >= 61 && y <= 189) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "45") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [46, 91] จมูก, เกี่ยวกับจมูก : nose, nasal
        if (x >= 338 && x <= 245 && y >= 40 && y <= 46) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "46" || val.code === "91") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [47] หู : ear
        if (x >= 321 && x <= 326 && y >= 31 && y <= 43 || x >= 357 && x <= 361 && y >= 31 && y <= 43) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "47") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [48] หัวใจ : heart
        if (x >= 118 && x <= 138 && y >= 86 && y <= 115) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "48") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [5] นิ้ว : finger
        if (x >= 8 && x <= 16 && y >= 204 && y <= 215 || x >= 11 && x <= 34 && y >= 222 && y <= 235 || x >= 213 && x <= 220 && y >= 203 && y <= 214 || x >= 195 && x <= 216 && y >= 220 && y <= 235 || x >= 236 && x <= 243 && y >= 204 && y <= 215 || x >= 239 && x <= 262 && y >= 219 && y <= 235 || x >= 422 && x <= 446 && y >= 220 && y <= 235 || x >= 440 && x <= 448 && y >= 204 && y <= 215) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "5") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [50] ทางเดินปัสสาวะ : urinary
        if (x >= 103 && x <= 127 && y >= 203 && y <= 224 || x >= 91 && x <= 104 && y >= 156 && y <= 177 || x >= 127 && x <= 139 && y >= 156 && y <= 176) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "50") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [6] หน้าอก : chest
        if (x >= 308 && x <= 377 && y >= 97 && y <= 128 || x >= 317 && x <= 368 && y >= 83 && y <= 97) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "6") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [63] คอหอย : oropharynx
        if (x >= 105 && x <= 124 && y >= 33 && y <= 53) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "63") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [65, 92] ขากรรไกร, ขากรรไกร : maxilla, mandible
        if (x >= 331 && x <= 352 && y >= 47 && y <= 60) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "65" || val.code === "92") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [66] หน้าผาก : frontal
        if (x >= 325 && x <= 358 && y >= 22 && y <= 31) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "66") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [67] สะโพก : buttock
        if (x >= 309 && x <= 328 && y >= 179 && y <= 215 || x >= 356 && x <= 375 && y >= 168 && y <= 206 || x >= 306 && x <= 378 && y >= 216 && y <= 229) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "67") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [68] กระดูกใต้กระเบนเหน็บ : sacral
        if (x >= 328 && x <= 356 && y >= 183 && y <= 215) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "68") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [69] เกี่ยวกับกะโหลก : cranial
        if (x >= 324 && x <= 358 && y >= 9 && y <= 61) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "69") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [7] เอว : waist
        if (x >= 177 && x <= 228 && y >= 178 && y <= 239) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "7") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [73] โพรงอากาศบริเวณใบหน้า : paranasal
        if (x >= 195 && x <= 208 && y >= 31 && y <= 47) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "73") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [76] สมอง : brain
        if (x >= 101 && x <= 125 && y >= 9 && y <= 32) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "76") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [8] ศีรษะ : head
        if (x >= 326 && x <= 358 && y >= 9 && y <= 21) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "8") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [80] แขนขา : extremity
        if (x >= 255 && x <= 304 && y >= 79 && y <= 196 || x >= 380 && x <= 430 && y >= 79 && y <= 197 || x >= 294 && x <= 340 && y >= 223 && y <= 391 || x >= 344 && x <= 390 && y >= 223 && y <= 389) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "80") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }

        // [82, 9] หน้า, กระโหลก : facial, skull
        if (x >= 325 && x <= 358 && y >= 22 && y <= 60) {
            options.xrayOrganBody?.forEach(val => {
                if (val.code === "82" || val.code === "9") {
                    tempChooseOrderXray.push(val.code);
                    tempOrganId.push(val);
                }
            });
        }
        getExpenseXrayByBodyOrgan(tempOrganId)
    };

    const handleCancle = (finished) => {
        onCancel(finished)
        setSelectedLabRowKeys([])
        setSelectedXrayRowKeys([])
        setSelectedOrderRowKeys([])
        setSelectedLabRows([])
        setSelectedXrayRows([])
        setSelectedOrderRows([])
    }

    const handleClickTableRow = (type, record) => {
        const selectedRows = [...selectedLabRows, ...selectedXrayRows, ...selectedOrderRows]
        const findCrrExpense = find(selectedRows, ["expenseId", record.expenseId])
        if (findCrrExpense) handleCancleSelectedRow({ type, record })
        if (!findCrrExpense) handleSelectRow({ type, record })
    }

    const onFinishLab = (dts) => {
        if (!dts?.code && !dts?.group && !selectedFormulaLabId) {
            setOptions(p => { return { ...p, labExpense: p.labExpenseAll, } })
            return
        }
        const req = {
            "code": dts?.code || null,
            "workId": dts?.workId || null,
            "group": dts?.group || null,
            "formulaId": selectedFormulaLabId
        }
        getOptions({ type: "GetExpensesLab", req, useStore: false })
    }

    const onFinishOrder = (dts) => {
        if (!dts?.code && !dts?.financeType && !selectedFormulaOrderId) {
            if (options.orderExpenseAll.length) {
                setOptions(p => { return { ...p, orderExpense: p.orderExpenseAll, } })
                return
            }
        }
        const req = {
            "code": dts?.code || null,
            "workId": dts?.workId || null,
            "financeType": dts?.financeType || null,
            "formulaId": selectedFormulaOrderId
        }
        getOptions({ type: "GetExpensesOrder", req, useStore: false })
    }

    const onFinishXray = (dts) => {
        if (!dts.workId && !dts?.code && !dts?.group && !dts.organ && !selectedFormulaXrayId) {
            if (options.xrayExpenseAll.length) {
                setOptions(p => { return { ...p, xrayExpense: p.xrayExpenseAll, } })
                return
            }
        }
        const req = {
            code: dts?.code || null,
            workId: dts?.workId || null,
            group: dts?.group || null,
            formulaId: selectedFormulaXrayId,
            organ: dts?.organ || null,
        }
        getOptions({ type: "GetExpensesXray", req, useStore: false })
    }

    useEffect(() => {
        if (visible && !options.financeTypeOrder.length) {
            getOptions({ type: "GetExpensesLab", req: {} })
            getOptions({ type: "GetWorkPlacesLab" })
            getOptions({ type: "GetLabGroup" })
            getOptions({ type: "GetFavAndDefaultLab", req: { date: null, userId: user, patientId, serviceId, clinicId, workId: work?.workId, } })
            getOptions({ type: "GetFavAndDefaultOrder", req: { date: null, userId: user, patientId, serviceId, clinicId, workId: work.workId, } })
            getOptions({ type: "GetWorkPlaces" })
            getOptions({ type: "GetFinancesType" })
            getOptions({ type: "GetWorkPlacesXray" })
            getOptions({ type: "GetXrayGroup" })
            getOptions({ type: "GetOrgans" })
            getOptions({ type: "GetXrayOrganBody", req: {} })
            defaultForm()
        }
    }, [visible])

    const PartsSelected = useMemo(() => {
        return <>
            <LabelTopic18 text='รายการที่เลือก' className='d-block' />
            <Divider />
            <Scrollbars autoHeight autoHeightMin={475}>
                <div className='ps-1 pe-1'>
                    <GenRow>
                        <Col span={24}>
                            <LabelTopic text={`Lab (${selectedLabRows.length})`} className='d-block' />
                            <div className='ps-1'>
                                {
                                    map(selectedLabRows, (o, i) => {
                                        return <label
                                            style={{
                                                backgroundColor: i % 2 === 0 ? "#fff" : "",
                                                fontSize: 11,
                                                display: "block"
                                            }}
                                        >
                                            {o.name}
                                        </label>
                                    })
                                }
                            </div>
                        </Col>
                    </GenRow>
                    <GenRow>
                        <Col span={24}>
                            <LabelTopic text={`X-Ray (${selectedXrayRows.length})`} className='d-block' />
                            <div className='ps-1'>
                                {
                                    map(selectedXrayRows, (o, i) => {
                                        return <label
                                            style={{
                                                backgroundColor: i % 2 === 0 ? "#fff" : "",
                                                fontSize: 11,
                                                display: "block"
                                            }}
                                        >
                                            {o.name}
                                        </label>
                                    })
                                }
                            </div>
                        </Col>
                    </GenRow>
                    <GenRow>
                        <Col span={24}>
                            <LabelTopic text={`Order (${selectedOrderRows.length})`} className='d-block' />
                            <div className='ps-1'>
                                {
                                    map(selectedOrderRows, (o, i) => {
                                        return <label
                                            style={{
                                                backgroundColor: i % 2 === 0 ? "#fff" : "",
                                                fontSize: 11,
                                                display: "block"
                                            }}
                                        >
                                            {o.name}
                                        </label>
                                    })
                                }
                            </div>
                        </Col>
                    </GenRow>
                </div>
            </Scrollbars>
        </>
    }, [selectedLabRows, selectedOrderRows, selectedXrayRows])

    const PartsLabFavAndDefault = useMemo(() => {
        return <div className='p-1' style={{ backgroundColor: "#F5F5F5" }}>
            <Input.Search
                style={{ width: "100%" }}
                allowClear
                placeholder="ค้นหา Favorite Lab"
                onSearch={v => handleSearchFav({ type: "Lab", keywords: v })}
                onClear={() => setOptions(p => {
                    return {
                        ...p,
                        favoriteLabFiltered: p.favoriteLab,
                    }
                })}
                disabled={!options?.favoriteLab?.length}
            />
            <Scrollbars autoHeight autoHeightMin={425}>
                <div>
                    <Menu
                        defaultOpenKeys={["favoriteLab", "defaultLab"]}
                        mode="inline"
                        selectedKeys={selectedFormulaLabId}
                        onClick={(e) => {
                            const formulaId = e.key === selectedFormulaLabId ? null : e.key
                            setSelectedFormulaLabId(formulaId)
                            handleClickFormulaId("Lab", formulaId)
                        }}
                    >
                        <SubMenu key="favoriteLab" icon={<StarOutlined />} title="Favorite Lab">
                            {
                                map(options?.favoriteLabFiltered, o => (

                                    <Menu.Item key={o.formulaId}>
                                        <Tooltip title={o.name}>
                                            {o.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                        <SubMenu key="defaultLab" title="Default Lab">
                            {
                                map(options?.defaultLab, (val) => (
                                    <Menu.Item key={val?.formulaId}>
                                        <Tooltip title={val?.name}>
                                            {val?.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                    </Menu>
                </div>
            </Scrollbars>
        </div>
    }, [options?.favoriteLabFiltered, options?.defaultLab, selectedFormulaLabId])

    const PartsFormLab = () => {
        return <Form
            form={formLab}
            onFinish={onFinishLab}
            layout='vertical'
            initialValues={{
                inOut: "I",
            }}
        >
            <GenRow align="middle">
                <Col>
                    <Form.Item style={{ margin: 0 }} name="inOut">
                        <Radio.Group>
                            <Radio value={"I"}>
                                ในโรงพยาบาล
                            </Radio>
                            <Radio value={"O"}>
                                นอกโรงพยาบาล
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item style={{ margin: 0 }} name="rushFlag" valuePropName='checked'>
                        <Checkbox>ด่วน ?</Checkbox>
                    </Form.Item>
                </Col>
            </GenRow>
            <GenRow className='mt-1'>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="workId">
                        <Select
                            {...selectProps}
                            placeholder="หน่วยทำ"
                            options={options.workPlacesLab}
                            onClear={() => formLab.submit()}
                            onChange={v => formLab.submit()}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="group">
                        <Select
                            {...selectProps}
                            placeholder="ไปยังกลุ่ม"
                            options={options.labGroup}
                            onClear={() => formLab.submit()}
                            onChange={v => formLab.submit()}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="code">
                        <Input.Search
                            style={{ width: "100%" }}
                            allowClear
                            placeholder="ค้นหา Lab"
                            onSearch={() => formLab.submit()}
                            onClear={() => formLab.submit()}
                        />
                    </Form.Item>
                </Col>
            </GenRow>
        </Form>
    }

    const PartsTableLab = (dts) => {
        const columns = [
            {
                title: <GenRow align="middle">
                    <Col>
                        รายการ
                    </Col>
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleSelectAll({
                                    type: "Lab",
                                    selectedRows: dts
                                })
                            }}
                            disabled={!selectedFormulaLabId}
                        >
                            เลือกทั้งหมด
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            // type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleCancleSelectedAll({
                                    type: "Lab",
                                    canceledRows: dts,
                                })
                            }}
                            disabled={!selectedLabRowKeys.length}
                        >
                            ไม่เลือก
                        </Button>
                    </Col>
                </GenRow>,
                // dataIndex: "name",
                render: record => {
                    return (
                        <> {record.name} {record.cscd || ""} </>
                    )
                }
            },
            {
                title: "ราคา",
                dataIndex: "maxRate",
                width: 120,
            },
        ]
        const rowSelection = {
            hideSelectAll: true,
            selectedRowKeys: selectedLabRowKeys,
            onSelect: (record, selected) => {
                if (selected) handleSelectRow({ type: "Lab", record })
                if (!selected) handleCancleSelectedRow({ type: "Lab", record })
            },
            getCheckboxProps: (record) => ({
                disabled: record.disabled,
            }),
        };
        return <Table
            size='small'
            scroll={{ y: 275 }}
            columns={columns}
            dataSource={dts}
            rowClassName="data-value pointer"
            rowKey="expenseId"
            pagination={{
                pageSize: 50,
                showSizeChanger: false,
            }}
            rowSelection={{ ...rowSelection, }}
            onRow={(record) => {
                return {
                    onClick: e => {
                        e.stopPropagation()
                        handleClickTableRow("Lab", record)
                    },
                };
            }}
        />
    }

    const PartsOrderFavAndDefault = useMemo(() => {
        return <div className='p-1' style={{ backgroundColor: "#F5F5F5" }}>
            <Input.Search
                style={{ width: "100%" }}
                allowClear
                placeholder="ค้นหา Favorite Order"
                onSearch={v => handleSearchFav({ type: "Order", keywords: v })}
                onClear={() => setOptions(p => {
                    return {
                        ...p,
                        favoriteOrderFiltered: p.favoriteOrder,
                    }
                })}
                disabled={!options?.favoriteOrder?.length}
            />
            <Scrollbars autoHeight autoHeightMin={425}>
                <div>
                    <Menu
                        defaultOpenKeys={["favoriteOrder", "defaultOrder"]}
                        mode="inline"
                        selectedKeys={selectedFormulaOrderId}
                        onClick={(e) => {
                            const formulaId = e.key === selectedFormulaOrderId ? null : e.key
                            setSelectedFormulaOrderId(formulaId)
                            handleClickFormulaId("Order", formulaId)
                        }}
                    >
                        <SubMenu key="favoriteOrder" icon={<StarOutlined />} title="Favorite Order">
                            {
                                map(options.favoriteOrderFiltered, o => (
                                    <Menu.Item key={o.formulaId}>
                                        <Tooltip title={o.name}>
                                            {o.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                        <SubMenu key="defaultOrder" title="Default Order">
                            {
                                map(options.defaultOrder, (val) => (
                                    <Menu.Item key={val?.formulaId}>
                                        <Tooltip title={val?.name}>
                                            {val?.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                    </Menu>
                </div>
            </Scrollbars>
        </div>
    }, [options.favoriteOrderFiltered, options.defaultOrder, selectedFormulaOrderId])

    const PartsFormOrder = () => {
        return <Form
            form={formOrder}
            onFinish={onFinishOrder}
            layout='vertical'
        >
            <GenRow align="middle">
                <Col>
                    <Form.Item style={{ margin: 0 }} name="rushFlag" valuePropName='checked'>
                        <Checkbox>ด่วน ?</Checkbox>
                    </Form.Item>
                </Col>
            </GenRow>
            <GenRow className='mt-1'>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="workId">
                        <Select
                            {...selectProps}
                            placeholder="หน่วยทำ"
                            options={options.workPlaces}
                            onClear={() => formOrder.submit()}
                            onChange={v => formOrder.submit()}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="financeType">
                        <Select
                            {...selectProps}
                            placeholder="ไปยังกลุ่ม"
                            options={options.financeTypeOrder}
                            onClear={() => formOrder.submit()}
                            onChange={v => formOrder.submit()}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item style={{ margin: 0 }} name="code">
                        <Input.Search
                            style={{ width: "100%" }}
                            allowClear
                            placeholder="ค้นหา Order"
                            onSearch={() => formOrder.submit()}
                            onClear={() => formOrder.submit()}
                        />
                    </Form.Item>
                </Col>
            </GenRow>
        </Form>
    }

    const PartsTableOrder = (dts) => {
        const columns = [
            {
                title: <GenRow align="middle">
                    <Col>
                        รายการ
                    </Col>
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleSelectAll({
                                    type: "Order",
                                    selectedRows: dts
                                })
                            }}
                        // disabled={!selectedFormulaOrderId}
                        >
                            เลือกทั้งหมด
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            // type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleCancleSelectedAll({
                                    type: "Order",
                                    canceledRows: dts,
                                })
                            }}
                            disabled={!selectedOrderRowKeys.length}
                        >
                            ไม่เลือก
                        </Button>
                    </Col>
                </GenRow>,
                dataIndex: "name",
            },
            {
                title: "ราคา",
                dataIndex: "maxRate",
                width: 120,
            },
        ]
        const rowSelection = {
            hideSelectAll: true,
            selectedRowKeys: selectedOrderRowKeys,
            onSelect: (record, selected) => {
                if (selected) handleSelectRow({ type: "Order", record })
                if (!selected) handleCancleSelectedRow({ type: "Order", record })
            },
            getCheckboxProps: (record) => ({
                disabled: record.disabled,
            }),
        };
        return <Table
            size='small'
            scroll={{ y: 275 }}
            columns={columns}
            dataSource={dts}
            rowClassName="data-value pointer"
            rowKey="expenseId"
            pagination={{
                pageSize: 50,
                showSizeChanger: false,
            }}
            rowSelection={{ ...rowSelection, }}
            onRow={(record) => {
                return {
                    onClick: e => {
                        e.stopPropagation()
                        handleClickTableRow("Order", record)
                    },
                };
            }}
        />
    }

    const PartsXrayFavAndDefault = useMemo(() => {
        return <div className='p-1' style={{ backgroundColor: "#F5F5F5" }}>
            <Input.Search
                style={{ width: "100%" }}
                allowClear
                placeholder="ค้นหา Favorite Xray"
                onSearch={v => handleSearchFav({ type: "Xray", keywords: v })}
                onClear={() => setOptions(p => {
                    return {
                        ...p,
                        favoriteXrayFiltered: p.favoriteXray,
                    }
                })}
                disabled={!options?.favoriteXray?.length}
            />
            <Scrollbars autoHeight autoHeightMin={425}>
                <div>
                    <Menu
                        defaultOpenKeys={["favoriteXray", "defaultXray"]}
                        mode="inline"
                        selectedKeys={selectedFormulaXrayId}
                        onClick={(e) => {
                            const formulaId = e.key === selectedFormulaXrayId ? null : e.key
                            setSelectedFormulaXrayId(formulaId)
                            handleClickFormulaId("Xray", formulaId)
                        }}
                    >
                        <SubMenu key="favoriteXray" icon={<StarOutlined />} title="Favorite Xray">
                            {
                                map(options.favoriteXrayFiltered, o => (
                                    <Menu.Item key={o.formulaId}>
                                        <Tooltip title={o.name}>
                                            {o.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                        <SubMenu key="defaultXray" title="Default Xray">
                            {
                                map(options.defaultXray, (val) => (
                                    <Menu.Item key={val?.formulaId}>
                                        <Tooltip title={val?.name}>
                                            {val?.name}
                                        </Tooltip>
                                    </Menu.Item>
                                ))
                            }
                        </SubMenu>
                    </Menu>
                </div>
            </Scrollbars>
        </div>
    }, [options.favoriteXrayFiltered, options.defaultXray, selectedFormulaXrayId])

    const PartsFormXray = () => {
        const optionsGroup = filterModality()
        const optionsOrgan = filterOrgan()
        // console.log('optionsOrgan', optionsOrgan)
        return <Form
            form={formXray}
            onFinish={onFinishXray}
            layout='vertical'
        >
            <GenRow align="middle">
                <Col>
                    <Form.Item style={{ margin: 0 }} name="specialFlag" valuePropName='checked'>
                        <Checkbox>X-Ray พิเศษ ?</Checkbox>
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item style={{ margin: 0 }} name="rushFlag" valuePropName='checked'>
                        <Checkbox>ด่วน ?</Checkbox>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item style={{ margin: 0 }} name="workId">
                        <Select
                            {...selectProps}
                            size='small'
                            placeholder="หน่วยทำ"
                            options={options.workPlacesXray}
                            onClear={() => handleChangeFormXray("workId")}
                            onChange={v => handleChangeFormXray("workId")}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item style={{ margin: 0 }} name="group">
                        <Select
                            {...selectProps}
                            size='small'
                            placeholder="ไปยังกลุ่ม"
                            options={optionsGroup}
                            onClear={() => handleChangeFormXray("group")}
                            onChange={v => handleChangeFormXray("group")}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item style={{ margin: 0 }} name="organ">
                        <Select
                            {...selectProps}
                            size='small'
                            placeholder="Organ"
                            options={optionsOrgan}
                            onClear={() => handleChangeFormXray("organ")}
                            onChange={v => handleChangeFormXray("organ")}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item style={{ margin: 0 }} name="code">
                        <Input.Search
                            style={{ width: "100%", margin: 0 }}
                            size='small'
                            allowClear
                            placeholder="ค้นหา Xray"
                            onSearch={() => formXray.submit()}
                            onClear={() => formXray.submit()}
                        />
                        {/* <Select
                            {...selectProps}
                            placeholder="ค้นหา Xray"
                            options={options.xrayOrgan}
                            onClear={() => formXray.submit()}
                            onChange={v => formXray.submit()}
                        /> */}
                    </Form.Item>
                </Col>
            </GenRow>
        </Form>
    }

    const PartsTableXray = (dts) => {
        const renderColumn = (v) => {
            return <div style={{ marginLeft: -12, marginRight: -12 }}>
                <label style={{ fontSize: 10 }}>{v}</label>
            </div>
        }
        const columns = [
            {
                title: "รหัส",
                dataIndex: "code",
                width: 75,
                render: v => renderColumn(v)
            },
            {
                title: "IMG",
                dataIndex: "organ",
                width: 75,
                align: "center",
                render: (v) => {
                    return <div style={{ marginLeft: -12, marginRight: -12 }}>
                        <Image
                            preview
                            // style={{ margin: 0 }}
                            width={"auto"}
                            height={40}
                            src="error"
                            fallback={`${env.PUBLIC_URL}/assets/images/screening/component-body/${v}.png`} />
                    </div>;
                }
            },
            {
                title: <GenRow align="middle">
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleSelectAll({
                                    type: "Xray",
                                    selectedRows: dts
                                })
                            }}
                        // disabled={!selectedFormulaXrayId && !isSelectedBodyOrgan}
                        >
                            เลือกทั้งหมด
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            style={{ margin: 0 }}
                            // type='primary'
                            size='small'
                            onClick={e => {
                                e.stopPropagation();
                                handleCancleSelectedAll({
                                    type: "Xray",
                                    canceledRows: dts,
                                })
                            }}
                            disabled={!selectedXrayRowKeys.length}
                        >
                            ไม่เลือก
                        </Button>
                    </Col>
                    <Col span={24}>
                        รายการ
                    </Col>

                </GenRow>,
                dataIndex: "name",
                render: v => renderColumn(v)
            },
            {
                title: "ราคา",
                dataIndex: "maxRate",
                width: 85,
                align: "right",
                render: v => renderColumn(v)
            },
        ]
        const rowSelection = {
            hideSelectAll: true,
            selectedRowKeys: selectedXrayRowKeys,
            onSelect: (record, selected) => {
                if (!doctor.doctorId) return notiWarning({ message: "ยังไม่ระบุแพทย์", description: "จะไม่สามารถส่ง X-Ray ได้ !" })
                if (selected) handleSelectRow({ type: "Xray", record })
                if (!selected) handleCancleSelectedRow({ type: "Xray", record })
            },
            getCheckboxProps: (record) => ({
                disabled: record.disabled,
            }),
        };
        return <Table
            size='small'
            scroll={{ y: 300 }}
            columns={columns}
            dataSource={dts}
            rowKey="expenseId"
            rowClassName="data-value pointer"
            pagination={{
                pageSize: 50,
                showSizeChanger: false,
            }}
            rowSelection={{ ...rowSelection, }}
            onRow={(record) => {
                return {
                    onClick: e => {
                        e.stopPropagation()
                        if (!doctor.doctorId) return notiWarning({ message: "ยังไม่ระบุแพทย์", description: "จะไม่สามารถส่ง X-Ray ได้ !" })
                        handleClickTableRow("Xray", record)
                    },
                };
            }}
        />
    }


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

    return <Modal
        title={<GenRow align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
            <Col>
                <LabelTopicPrimary18 text='เลือกรายการค่ารักษา' />
            </Col>
            <Col>
                <LabelTopic text='แพทย์ :' className='ms-3 me-1' />
            </Col>
            <Col span={5}>
                <Select
                    className="data-value"
                    showSearch
                    style={{ width: "100%" }}
                    size={size}
                    value={doctor?.doctorId}
                    options={listDD?.userTypeMD || []}
                    onChange={(selectedValue) => {
                        const selectedDoctor = listDD?.userTypeMD?.find(
                            (doctor) => doctor.value === selectedValue
                        );
                        if (handleDoctorChange) {
                            handleDoctorChange(selectedDoctor);
                        }
                    }}
                />
            </Col>
            <Col>
                <LabelTopic text='หน่วยส่ง :' className='ms-3 me-1' />
                <LabelText text={work?.workName || "-"} />
            </Col>
        </GenRow>}
        centered
        visible={visible}
        closable={false}
        width={1375}
        okText={isOrder ? "สั่ง" : "ตกลง"}
        cancelText="ปิด"
        onOk={() => {
            if (isOrder) setVsbUpsertFinances(true)
            if (!isOrder) {
                onCopy([...selectedLabRows, ...selectedXrayRows, ...selectedOrderRows])
                setSelectedLabRowKeys([])
                setSelectedXrayRowKeys([])
                setSelectedOrderRowKeys([])
                setSelectedLabRows([])
                setSelectedXrayRows([])
                setSelectedOrderRows([])
            }
        }}
        onCancel={() => {
            handleCancle(false)
        }}
        okButtonProps={{
            disabled: !selectedLabRows.length && !selectedOrderRows.length && !selectedXrayRows.length,
        }}
    >
        <Spin tip={<LabelTopicPrimary18 text='กำลังเช็คข้อมูลรายการ Lab ที่เลือก' />} spinning={labAgianLoading}>
            <Spin spinning={loading}>
                <div style={{ margin: -18, height: 535 }}>
                    <GenRow gutter={[8, 8]}>
                        <Col span={20} className='pe-2'>
                            <Tabs
                                type='card'
                                size='small'
                                defaultActiveKey="L"
                                activeKey={tabsActiveKey}
                                onChange={v => handleChangeTabsKey(v)}
                            >
                                <Tabs.TabPane tab="Lab" key="L">
                                    <div style={{ marginTop: -9 }}>
                                        <GenRow>
                                            <Col span={6}>
                                                {PartsLabFavAndDefault}
                                            </Col>
                                            <Col span={18} style={{ backgroundColor: "#F5F5F5" }}>
                                                {PartsFormLab()}
                                                {PartsTableLab(options?.labExpense || [])}
                                            </Col>
                                        </GenRow>
                                    </div>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="X-Ray" key="X">
                                    <div style={{ marginTop: -9 }}>
                                        <GenRow>
                                            <Col span={4}>
                                                {PartsXrayFavAndDefault}
                                            </Col>
                                            <Col span={20}>
                                                <GenRow>
                                                    <Col span={24}>
                                                        {PartsFormXray()}
                                                    </Col>
                                                    <Col flex="1 0 450px">
                                                        <img
                                                            onClick={handleClickBody}
                                                            height={450}
                                                            width={450}
                                                            src={`${env.PUBLIC_URL}/assets/images/screening/body.jpeg`}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </Col>
                                                    <Col span={12} style={{ backgroundColor: "#F5F5F5" }}>

                                                        {PartsTableXray(options.xrayExpense)}
                                                    </Col>
                                                </GenRow>
                                            </Col>
                                        </GenRow>
                                    </div>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="Order" key="O">
                                    <div style={{ marginTop: -9 }}>
                                        <GenRow>
                                            <Col span={6}>
                                                {PartsOrderFavAndDefault}
                                            </Col>
                                            <Col span={18} style={{ backgroundColor: "#F5F5F5" }}>
                                                {PartsFormOrder()}
                                                {PartsTableOrder(options?.orderExpense || [])}
                                            </Col>
                                        </GenRow>
                                    </div>
                                </Tabs.TabPane>
                            </Tabs>
                        </Col>
                        <Col span={4} style={{ backgroundColor: "#F5F5F5" }}>
                            {PartsSelected}
                        </Col>
                    </GenRow>
                </div>
            </Spin>
        </Spin>
        <UpsertFinancesDivideByType
            visible={vsbUpsertFinances}
            onCancel={(bool) => {
                setVsbUpsertFinances(false)
                setTimeout(() => {
                    handleCancle(bool)
                }, 100);
            }}
            onAddNewItems={() => setVsbUpsertFinances(false)}
            patient={patient}
            patientId={patientId}
            serviceId={serviceId}
            admitId={admitId}
            clinicId={clinicId}
            rightId={rightId}
            opdRightId={opdRightId}
            admitRightId={admitRightId}
            inOutLab={inOutLab}
            selectedLab={selectedLabRows}
            rushFlagLab={rushFlagLab}
            toWorkLab={workIdLab}
            selectedXray={selectedXrayRows}
            rushFlagXray={rushFlagXray}
            portableXray={null}
            toWorkXray={workIdXray}
            selectedOrder={selectedOrderRows}
            rushFlagOrder={rushFlagOrder}
            toWorkOrder={workIdOrder}
            work={work}
            doctor={doctor}
            workType={workType}
            specialFlag={specialFlag}
        />
    </Modal>
}

const listApi = [
    {
        name: "GetFavAndDefaultLab",
        url: "OpdExamination/GetOrderLabDisplayDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "GetExpensesLab",
        url: "OpdExamination/GetExpensesLab",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "GetWorkPlacesLab",
        url: "Laboratory/GetWorkPlacesLabVisit",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetLabGroup",
        url: "OpdExamination/GetMasterLabGroup",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetCheckLabagian",
        url: "OpdExamination/GetCheckLabagian",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetExpensesOrder",
        url: "OpdExamination/GetExpensesOrder",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "GetFavAndDefaultOrder",
        url: "OpdExamination/GetOrderAddDisplayDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "GetWorkPlaces",
        url: "Masters/GetWorkPlacesMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetFinancesType",
        url: "Masters/GetFinancesType",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetExpensesXray",
        url: "OpdExamination/GetExpensesXray",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "GetWorkPlacesXray",
        url: "Masters/GetWorkPlacesXray",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetXrayGroup",
        url: "OPDClinic/GetXrayGroup",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetOrgans",
        url: "IpdWard/GetOrgansList",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    {
        name: "GetXrayOrganBody",
        url: "OpdExamination/GetOrderXrayDisplayDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
]
