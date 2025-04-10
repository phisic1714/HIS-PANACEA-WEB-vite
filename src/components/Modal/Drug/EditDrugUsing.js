import { Button, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Select, Spin } from 'antd';
import { debounce, find, toNumber, } from "lodash";
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
//Context
import { CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { GetDrugLabels, InsDrugLabels, UpdDrugLabels } from "components/Modal/Drug/Api/FormulasDrugApi";
import { notiError, notiSuccess, notiWarning, } from "components/Notification/notificationX";
import dayjs from "dayjs";
import Scrollbars from "react-custom-scrollbars";
import { UpdDrugProfilecsValues } from "routes/IPDPrescription/API/IpdDrugProfileAPI";
import styled from "styled-components";
import DayjsDatePicker from "../../../components/DatePicker/DayjsDatePicker";
import DayjsTimePicker from "../../../components/DatePicker/DayjsTimePicker";
import SelectSearchBold from '../../../components/Drug/SelectSearchBold';
// import SelectDrugName from '../../../components/helper/SelectDrugName';
import {
    GetDosingTime,
    GetIsedReasons,
    GetNewDosingInterval,
    GetOpdDosingTextfinancesDrug,
    GetOpdDosingUnitsFinancesDrugDisplay,
    GetOpdDrugAdminsFinancesDrugDisplay,
    // GetOpdDrugLabelsFinancesDrugDisplay,
    GetOpdDrugPropertiesFinancesDrugDisplay,
    GetOpdDrugTimingsFinancesDrugDisplay,
    GetOpdDrugUsingsFinancesDrugDisplay,
    GetOpdDrugUsualDosesfinancesDrug,
    GetOpdDrugWarningsFinancesDrugDisplay,
    apis,
} from "../../../routes/OpdClinic/API/OpdDrugChargeApi";
import { callApis } from 'components/helper/function/CallApi.js';
import { DropdownPrescription } from "../../../routes/OpdClinic/Views/OpdDrugCharge";
import SelectDosingInterval from "../../Drug/SelectDosingInterval";
import {
    onChangeExpense as calOnChangeExpense,
    calculatDayOrDrugInjectionFlag,
    calculateExpenseDrug, checkNED,
    dosingIntervalLabel,
    drugLabelFunc,
    calculatDayOrDrug as funcCalculatDayOrDrug,
} from '../../helper/DrugCalculatOrder';
import { getDateCalculatExpenses } from '../../helper/GetDateCalculatExpenses';
import SelectDrugLabel from 'components/Input/SelectDrugLabel'
import PrevDrugUsing from 'components/Drug/PrevDrugUsing.js'

// var isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
// dayjs.extend(isSameOrBefore)
// eslint-disable-next-line no-undef
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
dayjs.extend(isSameOrAfter)

const InputNumberStyle = styled(InputNumber)`
    margin-right: 0;
    width: 100% !important;
    .ant-input-number-input {
        text-align: ${props => props.text};
    }
`;

const CalculatDrug = styled(Row)`
    .ant-editDrugForm-item-label{
        text-align: center;
    }
`;

export default forwardRef(
    function EditDrugUsing({ /* editVisible, setEditVisible, */
        drugCondiRef,
        setDrugCondiVisible,
        saveOrder, /*medLoading,*/
        getDropdown = true,
        profileType/* , chkDayLockDrugByHosparam */,
        disabledDiscount,
        getDrugProfilecsTabDisplay = () => { },
        optionsConvertDose = [],
        optionsExpense = [],
        ...props
    }, ref) {
        // Form
        const [editDrugForm] = Form.useForm();
        // Watch
        const startDate = Form.useWatch("startDate", editDrugForm)
        const endDate = Form.useWatch("endDate", editDrugForm)
        const status = Form.useWatch("status", editDrugForm)
        const prevDrugUsing = Form.useWatch('prevDrugUsing', editDrugForm);
        // const dose = Form.useWatch('dose', editDrugForm);
        // console.log('dose', dose)
        const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY'];
        const dropdownPrescription = useContext(DropdownPrescription);
        // console.log('dropdownPrescription', dropdownPrescription)
        const [editVisible, setEditVisible] = useState(false);
        const [loading, setLoading] = useState(false);
        const [drugUse, setDrugUse] = useState("A");
        const [prevFormValues, setPrevFormValues] = useState(null);
        const [resetPrevDrugUsingForm, setResetPrevDrugUsingForm] = useState(false);
        // console.log('prevFormValues', prevFormValues)
        const [expenseId, setExpenseId] = useState(undefined);
        const [drugUsingLabel, setDrugUsingLabel] = useState({});//วิธีใช้ยา
        const [drugUsingList, setDrugUsingList] = useState([]);
        const [unitList, setUnitList] = useState([]);
        const [drugTimingList, setDrugTimingList] = useState([]);
        const [dosingTime, setDosingTime] = useState([]);
        const [dosingInterval, setDosingInterval] = useState([]);
        const [disabledExceptDay, setDisabledExceptDay] = useState(true);
        const [disabledOther, setDisabledOther] = useState(true);
        const [drugProperty, setDrugProperty] = useState([]);
        const [drugWarning, setDrugWarning] = useState([]);
        const [drugAdmin, setDrugAdmin] = useState([]); //ฉลากช่วย
        // const [drugLabel, setDrugLabel] = useState([]); //ฉลากยา (ตอนเลือก วิธีใช้แบบฉลากรวม)
        const [isedReason, setIsedReason] = useState([]); //เหตุผลการใช้ยานอกบัญชีฯ
        const [numOfDrugs, setNumOfDrugs] = useState("");
        // const [numOfDays, setNumOfDays] = useState(0);
        const [multiply, setMultiply] = useState(0);
        const [frequency, setFrequency] = useState(0);
        const [rightList, setRightList] = useState([]); // console.log(rightList);//List สิทธิ์ 
        // const [rightId, setRightId] = useState(undefined);
        const [selectRight, setSelectRight] = useState({});
        const [dataCalculatExpense, setDataCalculatExpense] = useState({}); //DataCalculat for Api
        const [chkEdit, setChkEdit] = useState(false);
        const [drugUsingDose, setDrugUsingDose] = useState({});
        const [editPrescription, setEditPrescription] = useState(false); //ถ้าแก้ไขรายการในใบสั่งยาจะเป็น true แต่ถ้าแก้ไขรายการใน medOrder จะเป็น false
        const [financeId, setFinanceId] = useState(0);
        const [newDrug, setNewDrug] = useState(1);
        const [profileTypeSelect, setProfileTypeSelect] = useState("C");
        const [editDrugProfileId, setEditDrugProfileId] = useState(null);
        const selectDosingIntervalRef = useRef(null);
        const alternateDayRef = useRef(null);
        const otherDosingIntervalRef = useRef(null);
        const hourFormat = "HH:mm";
        const [tempDiscount, setTempDiscount] = useState(0);
        const [chkEditStartDate, setChkEditStartDate] = useState(false);
        const [isEditDP, setIsEditDp] = useState(false);
        const [dPValues, setDPValues] = useState(null);
        const [, setFriend] = useState(false)
        const [drugDetails, setDrugDetails] = useState(null)
        const [dosingIntervalDays, setDosingIntervalDays] = useState([])
        const [prevRecord, setPrevRecord] = useState(null)
        // console.log('drugDetails', drugDetails)
        // console.log('isEditDP', isEditDP)
        useImperativeHandle(ref, () => ({
            setEditVisible: (props) => setEditVisible(props),
            setExpenseId: (props) => setExpenseId(props),
            setDrugUse: (props) => setDrugUse(props),
            changeDosingInterval: (props) => changeDosingInterval(props),
            setNewDrugUsingLabel: (props, dose) => setNewDrugUsingLabel(props, dose),
            editDrugForm: () => editDrugForm,
            setPrevRecord: record => setPrevRecord(record),
            setDosingInterval: (props) => setTimeout(() => { selectDosingIntervalRef.current.setDosingInterval(props) }, 1)/* {} */,
            setNumOfDrugs: (props) => setNumOfDrugs(props),
            // setNumOfDays: (props) => setNumOfDays(props),
            setSelectRight: (props) => setSelectRight(props),
            setDataCalculatExpense: (props) => setDataCalculatExpense(props),
            setChkEdit: (props) => setChkEdit(props),
            setDrugUsingDose: (props) => setDrugUsingDose(props),
            setEditPrescription: (props) => setEditPrescription(props),
            setRightList: (props) => setRightList(props),
            setFinanceId: (props) => setFinanceId(props),
            setEditDrugProfileId: (props) => setEditDrugProfileId(props),
            setProfileTypeSelect: (props) => setProfileTypeSelect(props),
            setTempDiscount: (props) => setTempDiscount(props),
            chkEditStartDate: () => chkEditStartDate,
            setIsEditDp: (bool) => setIsEditDp(bool),
            setDPValues: (v) => setDPValues(v),
        }));
        const getOpdDosingTextfinancesDrug = async (dose, field) => { // หาค่า mutiply ของ dose]
            if (dose !== "") {
                let resData = await GetOpdDosingTextfinancesDrug(`${dose}`);
                if (resData.length > 0) {
                    if (resData[0]?.multiply !== "") {
                        setMultiply(toNumber(resData[0]?.multiply));
                    }
                }
                if (field === "Dose") {
                    calculatDayOrDrug(resData[0]?.multiply, "Dose");
                }
                return resData[0]?.multiply;
            }
        }
        const getDropdownPrescription = async () => { //ข้อมูลที่ใส่ใน dropdown เอามาจาก context ถ้าไม่ได้เอาข้อมูลมาจาก context rightList จะไม่มีข้อมูล
            if (dropdownPrescription?.getDropdownPrescription) {
                //Route
                setDrugUsingList(dropdownPrescription.drugUsingList);
                //Unit
                setUnitList(dropdownPrescription.unitList);
                //เวลาใช้ยา
                setDrugTimingList(dropdownPrescription.drugTimingList);
                //เวลารับประทาน
                setDosingTime(dropdownPrescription.dosingTime);
                //Dosing Interval
                setDosingInterval(dropdownPrescription.dosingInterval);
                //ข้อบ่งใช้
                setDrugProperty(dropdownPrescription.drugProperty);
                //ข้อควรระวัง
                setDrugWarning(dropdownPrescription.drugWarning);
                //ฉลากช่วย
                setDrugAdmin(dropdownPrescription.drugAdmin);
                //เหตุผลการใช้ยานอกบัญชีฯ
                setIsedReason(dropdownPrescription.isedReason);
            }
            if (getDropdown) {
                await axios.all([
                    GetOpdDrugUsingsFinancesDrugDisplay(),
                    GetOpdDosingUnitsFinancesDrugDisplay(),
                    GetOpdDrugTimingsFinancesDrugDisplay(),
                    GetDosingTime(),
                    // GetDosingInterval(),
                    GetNewDosingInterval(),
                    GetOpdDrugPropertiesFinancesDrugDisplay(),
                    GetOpdDrugWarningsFinancesDrugDisplay(),
                    GetOpdDrugAdminsFinancesDrugDisplay(),
                    GetIsedReasons()
                ]).then(resData => {
                    let funcList = [setDrugUsingList, setUnitList, setDrugTimingList, setDosingTime, setDosingInterval, setDrugProperty, setDrugWarning, setDrugAdmin/* , setDrugLabel */, setIsedReason];
                    for (let i = 0; i < resData.length; i++) {
                        funcList[i](resData[i]);
                    }
                }).catch((error) => {
                    console.log(error);
                    return error
                })
            }
        }
        const getDrugDetails = async (expenseId) => {
            const [
                drugUsingDose,
                drugDetails,
            ] = await Promise.all([
                GetOpdDrugUsualDosesfinancesDrug(expenseId),
                callApis(apis["GetExpenseDrugDetails"], expenseId),
            ])
            setDrugUsingDose(drugUsingDose);
            setDrugDetails(drugDetails);
        }
        const setNewDrugUsingLabel = async (select, dose) => {
            let dosingIntervalarr = select?.dosingInterval
            let drugTiming = drugTimingList.find(val => val.code === select.drugTiming);
            let doseLabel = await getOpdDosingTextfinancesDrug(dose);
            if (drugTiming?.frequency !== "" && drugTiming?.frequency) {
                setFrequency(toNumber(drugTiming?.frequency));
            }
            setDrugUsingLabel({
                drugUsing: drugUsingList.find(val => val.code === select?.drugUsing)?.name,
                dose: doseLabel ? doseLabel : dose,
                dosingUnit: unitList.find(val => val.code === select?.dosingUnit)?.name,
                drugTiming: drugTiming?.name,
                dosingTime: dosingTime.find(val => val.datavalue === select?.dosingTime)?.datadisplay,
                // dosingInterval: dosingInterval.find(val=>val.datavalue===select.dosingInterval)?.datadisplay,
                dosingInterval: dosingIntervalLabel(dosingIntervalarr, dosingInterval),
                alternateDay: select?.alternateDay,
                otherDosingInterval: select?.otherDosingInterval,
                drugProperty: drugProperty.find(val => val.code === select?.drugProperty)?.name,
                drugWarning: drugWarning.find(val => val.code === select?.drugWarning)?.name,
                drugAdmin: drugAdmin.find(val => val.code === select?.drugAdmin)?.name,
                docRemark: select?.docRemark,
                docLabel1: select?.docLabel1,
                docLabel2: select?.docLabel2,
                docLabel3: select?.docLabel3,
                docLabel4: select?.docLabel4,
                // drugLabel: select?.drugLabelName,
                moriningDose: select?.doseM,
                middayDose: select?.doseL,
                afternoonDose: select?.doseN,
                eveningDose: select?.doseE,
                beforeBedDose: select?.doseB,
            })
        }
        const calculatDayOrDrug = (value, field,) => {
            const dose = editDrugForm.getFieldValue("dose")
            const dosingUnit = editDrugForm.getFieldValue("dosingUnit")
            const drugTiming = editDrugForm.getFieldValue("drugTiming")
            const findTabletFlag = find(unitList, ["code", dosingUnit])
            const checkUnit = findTabletFlag?.tabletFlag === "Y"
            const drugTimingDetails = find(drugTimingList || [], ['code', drugTiming])
            const numOfDays = toNumber(editDrugForm.getFieldValue("duration"));
            const numOfDrugs = toNumber(editDrugForm.getFieldValue("quantity"));
            let newCalculatDayOrDrug = null;
            const dosingInterval = selectDosingIntervalRef.current.getValue()
            const dosingIntervalChkDays = dosingIntervalDays
            if (drugUse === "B") {
                let doseKey = ["doseM", "doseL", "doseN", "doseE", "doseB"];
                let sumDose = 0;
                for (let k of doseKey) {
                    sumDose += toNumber(editDrugForm.getFieldValue(k));
                }
                // console.log(sumDose,"sumFrequency");
                newCalculatDayOrDrug = funcCalculatDayOrDrug({
                    value: field === "Dose" ? sumDose : value,
                    field: field,
                    data: {
                        numOfDays: numOfDays,
                        frequency: 1,
                        numOfDrugs: numOfDrugs,
                        multiply: multiply,
                        oldQty: 0,
                        dose: sumDose,
                        dosingInterval,
                        dosingIntervalChkDays,
                    },
                    dataCalculatExpense: dataCalculatExpense,
                    selectRight: selectRight,
                    chkdayjs: true,
                    chkUnit: checkUnit,
                    disabledDiscount: disabledDiscount
                });
            } else {
                newCalculatDayOrDrug = funcCalculatDayOrDrug({
                    value: value,
                    field: field,
                    data: {
                        numOfDays: numOfDays,
                        frequency: drugTimingDetails?.frequency,
                        numOfDrugs: numOfDrugs,
                        multiply: multiply,
                        oldQty: 0,
                        dose: toNumber(dose || 0),
                        disabledDiscount: disabledDiscount,
                        dosingInterval,
                        dosingIntervalChkDays,
                    },
                    dataCalculatExpense: dataCalculatExpense,
                    selectRight: selectRight,
                    chkdayjs: true,
                    chkUnit: checkUnit
                })
            }
            // console.log('newCalculatDayOrDrug', newCalculatDayOrDrug)
            let newcalculate = checkNED(newCalculatDayOrDrug?.newcalculateExpense, editDrugForm.getFieldValue("reason"));
            editDrugForm.setFieldsValue({
                quantity: newCalculatDayOrDrug?.numOfDrugs !== undefined ? newCalculatDayOrDrug.numOfDrugs : editDrugForm.getFieldValue("quantity"),
                duration: newCalculatDayOrDrug?.numOfDays !== undefined ? newCalculatDayOrDrug.numOfDays : editDrugForm.getFieldValue("duration"),
                ...newcalculate,
            });
            if(newCalculatDayOrDrug?.startDate){
                editDrugForm.setFieldsValue({
                    startDate: newCalculatDayOrDrug.startDate,
                });
            }
            if(newCalculatDayOrDrug?.endDate){
                editDrugForm.setFieldsValue({
                    endDate: newCalculatDayOrDrug.endDate,
                });
            }
        }
        const onChangeExpense = (value, field) => {
            calOnChangeExpense({
                value: value,
                field: field,
                form: editDrugForm,
                numOfDrugs: numOfDrugs,
                disabledDiscount: disabledDiscount,
                tempDiscount: tempDiscount,
                setTempDiscount: setTempDiscount
            })
        }
        const changeDosingInterval = (value, event = false) => {
            if (["EW", "PW", "EOD", "DOS", "CO", "CTN"].includes(value)) {
                setDisabledExceptDay(false);
                setDisabledOther(true);
                if (event) {
                    setTimeout(() => { alternateDayRef.current.focus(); }, 10);
                }
            } else if (value === "OTH" || value === "PRD") {
                setDisabledOther(false);
                setDisabledExceptDay(true);
                if (event) {
                    setTimeout(() => { otherDosingIntervalRef.current.focus(); }, 1);
                }
            } else {
                setDisabledOther(true);
                setDisabledExceptDay(true);
            }
        }
        const disabledEndDate = (date) => {
            return date < dayjs(editDrugForm.getFieldValue("startDate")).add(-1, "day").endOf("date");
        }
        const updateDp = async (v) => {
            setLoading(true)
            let req = {
                ...dPValues,
                ...v,
                rightId: dPValues?.rightId,
                admitRightId: dPValues?.admitRightId,
                admitId: dPValues?.admitId,
            }
            req.dosingInterval = req?.dosingInterval ? req.dosingInterval.join() : null;
            let resData = await GetDrugLabels({
                drugLabel: req.drugLabel
            });
            if (resData?.length === 0) {
                if (req.drugLabel) {
                    let resData = await InsDrugLabels({
                        drugLabel: req.drugLabel,
                        drugUsingLabel: req.drugLabelName,
                        dose: req?.multiply ? "0" : req.dose,
                        frequency: req.frequency
                    });
                    if (!resData.isSuccess) {
                        // return showError();
                    }
                }
            } else {
                if (resData[0].name !== req.drugLabelName) {
                    let resData = await UpdDrugLabels({
                        drugLabel: req.drugLabel,
                        drugUsingLabel: req.drugLabelName,
                        dose: req?.multiply ? "0" : req.dose,
                        frequency: req.frequency
                    });
                    if (!resData.isSuccess) {
                        // return showError();
                    }
                }
            }
            // console.log(req);
            const res = await UpdDrugProfilecsValues(req);
            setLoading(false)
            if (res.isSuccess) {
                notiSuccess({ message: "บันทึกข้อมูล" })
                getDrugProfilecsTabDisplay();
                setEditVisible(false);
                setDPValues(null)
                clearData();
            } else {
                console.log("Error UpdDrugProfilecsValues");
                notiError({ message: "บันทึกข้อมูล" })
            }
        }
        const editOrderSubmit = (param) => {
            let selectExpense = drugDetails;
            let selectRight = props?.patientType === "opd" ? rightList.find(val => val.opdRightId === param.rightId) : rightList.find(val => val.admitRightId === param.rightId);
            let newOrder = {
                ...param,
                expenseName: param?.expenseName,
                code: selectExpense?.code,
                financeId: financeId,
                financeType: selectExpense?.financeType,
                nedFlag: selectExpense?.ised,
                duration: param.duration ? param.duration : 1,
                startDate: param.duration ? param.startDate : dayjs(),
                endDate: param.duration ? param.endDate : props?.page !== "15.3" ? dayjs() : profileTypeSelect !== "C" ? dayjs() : null,
                drugLabel: drugLabelFunc(param, "+", drugUse, param, optionsConvertDose),
                drugLabelName: drugLabelFunc(drugUsingLabel, " ", drugUse, param, optionsConvertDose),
                route: drugUse,
                frequency: frequency,
                rightId: selectRight?.rightId,//change dropdown value to rightId before cilck save
                profileType: profileTypeSelect,
                qty: profileTypeSelect === "C" ? param.qty : param.quantity,
                drugProfileId: editDrugProfileId || null,
                drugGroup: selectExpense?.drugGroup,
                drugGroupName: selectExpense?.drugGroupName,
                dosingInterval: [selectDosingIntervalRef.current.getValue(), ...selectDosingIntervalRef.current.getChkDays()],
                multiply: multiply,
                doseText: editDrugForm.getFieldValue("doseText")
            }
            if (props?.patientType === "opd") {
                newOrder.opdRightId = selectRight?.opdRightId;
            } else {
                newOrder.admitRightId = selectRight?.admitRightId;
            }
            // console.log('updateDp')
            if (isEditDP) return updateDp(newOrder)
            // console.log('saveOrder :>> ');
            function filterUndefined(obj) {
                return Object.fromEntries(Object.entries(obj).filter(([key, value]) => value !== undefined));
            }
            const filteredData = filterUndefined(newOrder);
            let tempOrder = filteredData
            if (prevRecord) {
                tempOrder = { ...prevRecord, ...tempOrder }
            }
            saveOrder(tempOrder, editPrescription, editDrugProfileId);
            setEditVisible(false);
            clearData();
        }
        const clearData = () => {
            setDrugUse("A");
            setDrugUsingLabel([]);
            setExpenseId(undefined);
            setDisabledExceptDay(true);
            setDisabledOther(true);
            editDrugForm.resetFields();
            setResetPrevDrugUsingForm(p => !p)
        }
        const docLabelLength = 50;
        const formInputDrugLabel = (line) => {
            let name = "docLabel" + line;
            return (
                <>
                    <Col span={2} style={{ marginTop: 8, paddingLeft: 0 }}><label className="gx-text-primary">บรรทัด#{line}</label></Col>
                    <Col span={22}>
                        <Row>
                            <Form.Item style={{ marginBottom: 0 }} name={name}>
                                <Input
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.slice(0, docLabelLength);
                                        editDrugForm.setFieldsValue({ [name]: value });
                                    }}
                                />
                            </Form.Item>
                        </Row>
                        <Form.Item shouldUpdate={(prev, cur) =>
                            prev[name] !== cur[name]
                        }
                            noStyle
                        >
                            {({ getFieldValue }) => (
                                <>
                                    {
                                        getFieldValue(name)?.length === docLabelLength ?
                                            <Row><label style={{ color: "red" }}>ไม่เกิน {docLabelLength} ตัวอักษร</label></Row>
                                            :
                                            null
                                    }
                                </>
                            )}
                        </Form.Item>
                    </Col>
                </>
            )
        }
        const onChangeDoseInputNumber = (param) => {
            let { value, formFieldKey, drugUsingLabelKey } = param;
            let doseVal = value?.toFixed(2);
            editDrugForm.setFieldsValue({ [formFieldKey]: doseVal });
            setDrugUsingLabel({
                ...drugUsingLabel,
                [drugUsingLabelKey]: doseVal
            });
        }
        const clcUseDays = (start, end) => {
            if (start && end) {
                const diff = end.diff(start, "days");
                editDrugForm.setFieldsValue({ duration: diff + 1 })
            } else editDrugForm.setFieldsValue({ duration: null })
        }
        const handleChangeUseDays = (num) => {
            // console.log('num', num)
            if (!num) return editDrugForm.setFieldsValue({ endDate: null })
            const dateForSet = dayjs(startDate).add((num - 1), "day")
            editDrugForm.setFieldsValue({ endDate: dateForSet })
            const newNumOfDays = dayjs(dateForSet).startOf("date").diff(dayjs(startDate).startOf("date"), "day") + 1;
            // setNumOfDays(newNumOfDays);
            calculatDayOrDrug(newNumOfDays, "จน.วัน", true);
        }
        const clcDayOrDrugInjectionFlag = (name, newDrugUse) => {
            newDrugUse = newDrugUse ? newDrugUse : drugUse
            const formValues = editDrugForm.getFieldsValue()
            // console.log('formValues', formValues)
            const days = formValues?.duration || null
            const findInjectionFlag = find(unitList, ["code", formValues?.dosingUnit])
            const frequency = toNumber(find(drugTimingList, ["code", formValues?.drugTiming])?.frequency || 1)
            if (findInjectionFlag?.injectionFlag === "Y" || findInjectionFlag?.syrupFlag === "Y" || findInjectionFlag?.inhalerflag === "Y") {
                if (newDrugUse === "A" || newDrugUse === "B") {
                    const resClctDayOrDrugInjectionFlag = calculatDayOrDrugInjectionFlag({
                        formItemName: name,
                        formValues: formValues,
                        dosagecontain: drugDetails?.dosagecontain,
                        days: days,
                        drugUse: newDrugUse,
                        frequency: frequency,
                        dataCalculatExpense: dataCalculatExpense,
                        selectRight: selectRight,
                        disabledDiscount: disabledDiscount,
                    })
                    if (!resClctDayOrDrugInjectionFlag) return false
                    editDrugForm.setFieldsValue({
                        quantity: resClctDayOrDrugInjectionFlag.quantity,
                        duration: resClctDayOrDrugInjectionFlag.daysDrug,
                    })
                    if (resClctDayOrDrugInjectionFlag?.startDate) {
                        editDrugForm.setFieldsValue({
                            startDate: resClctDayOrDrugInjectionFlag.startDate
                        })
                    }
                    if (resClctDayOrDrugInjectionFlag?.endDate) {
                        editDrugForm.setFieldsValue({
                            endDate: resClctDayOrDrugInjectionFlag.endDate
                        })
                    }
                    const newcalculate = checkNED(
                        resClctDayOrDrugInjectionFlag?.newcalculateExpense,
                        editDrugForm.getFieldValue('reason')
                    );
                    // console.log('newcalculate :>> ', newcalculate);
                    editDrugForm.setFieldsValue(newcalculate);
                    return true
                }
            }
            return false

        }
        const chkPageForClcDayOrDrugInjectionFlag = (name, days, newDrugUse) => {
            if (props?.page !== "15.3") {
                return clcDayOrDrugInjectionFlag(name, days, newDrugUse)
            } else {
                if (profileTypeSelect === "H") {
                    return clcDayOrDrugInjectionFlag(name, days, newDrugUse)
                } else {
                    return false
                }
            }
        }
        const clcDrugQtyDP = (drugUse, profileType, formItemName) => {
            // console.log('drugTimingList', options7_5?.drugTimingList)
            const formValues = editDrugForm.getFieldsValue()
            // console.log('formValues', formValues)
            const drugTimingDetails = find(drugTimingList || [], ['code', formValues?.drugTiming])
            const unitDetails = find(unitList || [], ['code', formValues?.dosingUnit])
            let doseKeyDrugUseB = ['doseM', 'doseL', 'doseN', 'doseE', 'doseB'];
            let newCalculatDayOrDrug = null;
            if (unitDetails?.tabletFlag === "Y") {// ยาเม็ด
                let sumDose
                switch (drugUse) {
                    case "A":
                        sumDose = toNumber(formValues?.dose || 0)
                        break;
                    case "B":
                        for (let k of doseKeyDrugUseB) {
                            sumDose += toNumber(formValues?.[k] || 0);
                        }
                        break;
                    default:
                        sumDose = 0
                        break;
                }
                if (!sumDose) return
                newCalculatDayOrDrug = funcCalculatDayOrDrug({
                    value: 1,
                    field: "จน.วัน",
                    data: {
                        numOfDays: 1,
                        frequency: toNumber(drugTimingDetails?.frequency || 1),
                        dose: sumDose,
                    },
                    dataCalculatExpense: dataCalculatExpense,
                    selectRight: selectRight,
                    chkdayjs: true,
                    chkUnit: true,
                });
            }
            if (unitDetails?.injectionFlag === 'Y' || unitDetails?.syrupFlag === "Y" || unitDetails?.inhalerflag === "Y") {
                const expenseDetails = find(optionsExpense, ['expenseId', expenseId,]);
                const resClctDayOrDrugInjectionFlag = calculatDayOrDrugInjectionFlag({
                    formItemName: formItemName,
                    formValues: formValues,
                    dosagecontain: expenseDetails?.dosagecontain,
                    days: 1,
                    drugUse: drugUse,
                    frequency: toNumber(drugTimingDetails?.frequency || 1),
                    dataCalculatExpense: dataCalculatExpense,
                    selectRight: selectRight,
                    disabledDiscount: disabledDiscount,
                });
                if (!resClctDayOrDrugInjectionFlag) return false;
                newCalculatDayOrDrug = resClctDayOrDrugInjectionFlag
            }
            if (!newCalculatDayOrDrug) return
            // console.log('newCalculatDayOrDrug', newCalculatDayOrDrug)
            const newcalculate = checkNED(
                newCalculatDayOrDrug?.newcalculateExpense,
                editDrugForm.getFieldValue('reason')
            );
            editDrugForm.setFieldsValue({
                qtyCon: newCalculatDayOrDrug.numOfDrugs,
                quantity: profileType !== "C" ? newCalculatDayOrDrug.numOfDrugs : formValues?.quantity,
                duration: newCalculatDayOrDrug.numOfDays,
                ...newcalculate,
            });
            // setNumOfDays(newCalculatDayOrDrug.numOfDays);
        }
        const setNewDrugLabel = (dts, dose) => {
            // console.log('dts', dts)
            setDrugUsingLabel({});
            const drugTiming = drugTimingList.find((val) => val.code === dts.drugTiming);
            const tempDose = dose ? dose : dts?.dose
            setDrugUsingLabel({
                drugUsing: drugUsingList.find((val) => val.code === dts.drugUsing)?.name,
                dose: tempDose,
                dosingUnit: unitList.find((val) => val.code === dts.dosingUnit)?.name,
                drugTiming: drugTiming?.name,
                dosingTime: dosingTime.find((val) => val.datavalue === dts.dosingTime)?.datadisplay,
                dosingInterval: dts?.dosingInterval
                    ? dosingIntervalLabel(dts?.dosingInterval
                        ? dts.dosingInterval.split(',')
                        : profileTypeSelect === 'C' ? ['ED'] : undefined, dosingInterval)
                    : '',
                drugProperty: drugProperty.find((val) => val.code === dts.drugProperty)?.name,
                drugWarning: drugWarning.find((val) => val.code === dts.drugWarning)?.name,
                drugAdmin: drugAdmin.find((val) => val.code === dts.drugAdmin)?.name,
            });
        }
        useEffect(() => {
            clcUseDays(startDate, endDate)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [startDate, endDate])
        useEffect(() => {
            getDropdownPrescription();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dropdownPrescription])
        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => {
            const callIt = async () => {
                let selectRightId = props?.patientType === "opd" ? rightList.find(val => val?.opdRightId === selectRight?.opdRightId)?.rightId : rightList.find(val => val?.admitRightId === selectRight?.admitRightId)?.rightId;
                if (expenseId && selectRight) {
                    let newDataCalculat = await getDateCalculatExpenses({
                        expenseId: expenseId,
                        rightId: selectRightId,
                        patientType: props?.patientType
                    });
                    setDataCalculatExpense(newDataCalculat);
                    if (chkEdit) {
                        let newcalculate = calculateExpenseDrug({
                            data: newDataCalculat,
                            newNumOfDrugs: numOfDrugs,
                            cashFlag: selectRight?.cashFlag
                        });
                        newcalculate = checkNED(newcalculate, editDrugForm.getFieldValue("reason"));
                        editDrugForm.setFieldsValue(newcalculate);
                    }
                }
            }
            callIt()
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [expenseId, selectRight])

        useEffect(() => {
            if (expenseId) {
                setMultiply(0);
                getDrugDetails(expenseId);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [expenseId])

        const debounceSetFriend = useMemo(() => {
            const onSet = async () => {
                setFriend(p => !p)
            }
            return debounce(onSet, 500);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <Modal
                zIndex={1002}
                title={
                    <Row align="middle" style={{ position: "relative", margin: 0 }}>
                        <label style={{ fontSize: "24px" }}>14.2.1.แก้ไขวิธีใช้</label>
                        <Button type="default" className="btn-custom-bgcolor" style={{ position: "absolute", right: 0, margin: 0 }}
                            onClick={() => {
                                setDrugCondiVisible(true);
                                setTimeout(() => drugCondiRef.current.setExpenseId(expenseId), 10);
                            }}
                        >
                            เงื่อนไขการสั่ง
                        </Button>
                    </Row>
                }
                centered
                visible={editVisible}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Popconfirm
                            title="รายการที่แก้ไขจะไม่ถูกบันทึก"
                            onConfirm={() => {
                                setEditVisible(false);
                                clearData();
                            }}
                        >
                            <Button key="cancel">ออก</Button>
                        </Popconfirm>
                        <Button
                            type="primary"
                            key="save"
                            onClick={() => { editDrugForm.submit() }}
                            disabled={status === "D"}
                        >บันทึก</Button>
                    </Row>
                ]}
                width="1200px"
            >
                <Spin spinning={loading/* true */}>
                    <Scrollbars autoHeight autoHeightMin={545}>
                        <Form
                            form={editDrugForm}
                            layout="vertical"
                            onFinish={editOrderSubmit}
                            onFinishFailed={(errorInfo) => {
                                const reasonError = errorInfo.errorFields.find(error => error.name.includes('reason'));

                                if (reasonError) {
                                    notiWarning({ message: reasonError.errors[0] })
                                    return
                                }

                            }}
                            requiredMark={false}
                            disabled={status === "D"}
                            onValuesChange={(changedValues, values) => {
                                // console.log('values :>> ', values);
                                const name = Object.keys(changedValues);
                                const value = Object.values(changedValues);
                                console.log('name[0] :>> ', name[0]);
                                console.log('value[0] :>> ', value[0]);
                                const clcOpd = () => {
                                    const resClcDayOrDrugInjectionFlag = chkPageForClcDayOrDrugInjectionFlag(name[0]);
                                    if (!resClcDayOrDrugInjectionFlag) {
                                        switch (name[0]) {
                                            case "quantity":
                                                calculatDayOrDrug(value[0], 'จน.ยา');
                                                break;
                                            case "duration":
                                                calculatDayOrDrug(value[0], 'จน.วัน');
                                                break;
                                            default:
                                                calculatDayOrDrug(values?.duration || 1, 'จน.วัน')
                                                break;
                                        }
                                    }
                                }
                                switch (name[0]) {
                                    case "dose":
                                    case "quantity":
                                    case "doseM":
                                    case "doseL":
                                    case "doseN":
                                    case "doseE":
                                    case "doseB":
                                    case "dosingUnit":
                                    case "drugTiming":
                                    case "duration":
                                    case "qtyCon":
                                    case "qty":
                                        if (props?.page === '15.3') {
                                            if (editDrugProfileId) {
                                                if (profileTypeSelect === "H") {
                                                    clcOpd()
                                                } else {
                                                    if (name[0] === 'quantity' || name[0] === 'qtyCon' || name[0] === 'qty') {
                                                        const clcRate = calculateExpenseDrug({
                                                            data: dataCalculatExpense,
                                                            newNumOfDrugs: value[0],
                                                            patientType: 'opd',
                                                        });
                                                        const newcalculate = checkNED(clcRate, editDrugForm.getFieldValue('reason'));
                                                        editDrugForm.setFieldsValue(newcalculate);
                                                    } else {
                                                        clcDrugQtyDP(drugUse, profileTypeSelect, name[0])
                                                    }
                                                }
                                            } else {
                                                clcOpd();
                                            }
                                        } else {
                                            clcOpd();
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                if (find([...robotsDay, ...robotsTime], ["field", name[0]])) debounceSetFriend()
                                setFriend(p => !p)
                            }}
                        >
                            <Form.Item name="admitId" hidden><Input /></Form.Item>
                            <Form.Item name="prevDrugUsing" hidden><Input /></Form.Item>
                            <Form.Item name="isFetchDoseRouteB" hidden><Input /></Form.Item>
                            <Form.Item hidden name="drugHold"><Input /></Form.Item>
                            <Form.Item hidden name="status"><Input /></Form.Item>
                            <Form.Item hidden name="reMed"><Input /></Form.Item>
                            <Row align="bottom" gutter={[16, 16]} style={{ flexDirection: "row", marginTop: 16, marginLeft: 0, marginRight: 0 }}>
                                {editDrugProfileId &&
                                    <Col span={8} style={{ paddingLeft: 0 }}>
                                        <Row align="middle" style={{ flexDirection: "row" }}>
                                            <label className="gx-text-primary" style={{ marginRight: 12 }}>ประเภท</label>
                                        </Row>
                                        <Row align="middle" style={{ flexDirection: "row", marginTop: 12 }}>
                                            <Select
                                                allowClear={true}
                                                style={{ width: '100%' }}
                                                showSearch
                                                onChange={(val) => {
                                                    setProfileTypeSelect(val);
                                                }}
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                options={profileType.map((n) => ({ value: n.datavalue, label: n.datadisplay }))}
                                                value={profileTypeSelect}
                                            />
                                        </Row>
                                    </Col>
                                }
                                <Col span={editDrugProfileId ? 10 : 18} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ margin: 0 }}
                                        label={<center><label className="gx-text-primary">รหัสยา/ชื่อยา</label></center>}
                                        name="expenseName"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        hidden
                                        style={{ margin: 0 }}
                                        // label={<center><label className="gx-text-primary">รหัสยา/ชื่อยา</label></center>}
                                        name="expenseId"
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ รหัสยา/ชื่อยา"
                                            }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 0, textAlign: "center" }}>
                                    <Form.Item
                                        style={{ margin: 0, alignItems: "center" }}
                                        label={<label className="gx-text-primary">NED</label>}
                                    >
                                        {
                                            drugDetails?.ised === "N" ?
                                                <label className="gx-text-primary"><CheckOutlined /></label>
                                                :
                                                <Checkbox disabled={true} />
                                        }

                                    </Form.Item>
                                </Col>
                                {!editDrugProfileId &&
                                    <>
                                        <Col span={2} style={{ paddingLeft: 0, textAlign: "center" }}>
                                            <Form.Item
                                                style={{ margin: 0, alignItems: "center" }}
                                                name="duration"
                                                label={<label className="gx-text-primary">จน.วัน</label>}
                                            >
                                                <InputNumberStyle
                                                    min={1}
                                                    text={"center"}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2} style={{ paddingLeft: 0, textAlign: "center" }}>
                                            <Form.Item
                                                style={{ margin: 0, alignItems: "center" }}
                                                label={<label className="gx-text-primary">จน.ยา</label>}
                                                name="quantity"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "ระบุ"
                                                    }
                                                ]}
                                            >
                                                <InputNumberStyle
                                                    min={0}
                                                    text={"center"}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </>
                                }
                                {editDrugProfileId &&
                                    <>
                                        {profileTypeSelect === "C" ?
                                            <>
                                                <Col span={2} style={{ textAlign: "center", paddingLeft: 0 }}>
                                                    <Row style={{ flexDirection: "row" }}>
                                                        <Col span={24} style={{ padding: 0 }}><label className="gx-text-primary">จน.Con</label></Col>
                                                        <Col span={24} style={{ padding: 0 }}>
                                                            <Form.Item
                                                                style={{ margin: 0, alignItems: "center" }}
                                                                name="qtyCon"
                                                            >
                                                                <InputNumberStyle text={"center"} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col span={2} style={{ textAlign: "center", paddingLeft: 0 }}>
                                                    <Row style={{ flexDirection: "row" }}>
                                                        <Col span={24} style={{ padding: 0 }}><label className="gx-text-primary">จน.Daily</label></Col>
                                                        <Col span={24} style={{ padding: 0 }}>
                                                            <Form.Item
                                                                style={{ margin: 0, alignItems: "center" }}
                                                                name="qty"
                                                            >
                                                                <InputNumberStyle text={"center"} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </>
                                            :
                                            <>
                                                {profileTypeSelect === "H" &&
                                                    <Col span={2} style={{ paddingLeft: 0, textAlign: "center" }}>
                                                        <Form.Item
                                                            style={{ margin: 0, alignItems: "center" }}
                                                            name="duration"
                                                            label={<label className="gx-text-primary">จน.วัน</label>}
                                                        >
                                                            <InputNumberStyle min={1}/*  value={numOfDays!==0 ? numOfDays : ""} */
                                                                text={"center"}
                                                            // onChange={val => calculatDayOrDrug(val, "จน.วัน")}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                }
                                                <Col span={2} style={{ paddingLeft: 0, textAlign: "center" }}>
                                                    <Form.Item
                                                        style={{ margin: 0, alignItems: "center" }}
                                                        label={<label className="gx-text-primary">จน.ยา</label>}
                                                        name="quantity"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "ระบุ"
                                                            }
                                                        ]}
                                                    >
                                                        <InputNumberStyle min={0}
                                                            text={"center"}
                                                            onChange={val => calculatDayOrDrug(val, "จน.ยา")}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </>
                                        }
                                    </>
                                }
                            </Row>
                            <Divider style={{ marginTop: 10 }} />
                            { /* drugUse === "A" && */
                                <>
                                    <div className="content_container" style={{ paddingTop: 0, paddingBottom: 12, paddingLeft: 0, paddingRight: 0 }}>
                                        <Row align="middle" style={{ margin: 0, paddingTop: 12, paddingBottom: 12, backgroundColor: "#f2f4f6", flexDirection: "row" }}>
                                            <Col xxl={2} xl={2} lg={3} mg={4} sm={4} xs={4}><label className="gx-text-primary" style={{ whiteSpace: "nowrap" }}>วิธีใช้ยา&nbsp;:&nbsp;</label></Col>
                                            <Col xxl={22} xl={22} lg={20} mg={20} sm={20} xs={20} style={{ paddingLeft: 0 }}>
                                                {drugLabelFunc(drugUsingLabel, " ", drugUse, editDrugForm.getFieldsValue(), optionsConvertDose)}
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                            }

                            <Row gutter={[16, 16]} style={{ marginTop: 16, paddingLeft: 8 }}>
                                <Radio.Group value={drugUse}
                                    onChange={(e) => {
                                        const formValues = editDrugForm.getFieldsValue()
                                        const newValue = e.target.value;
                                        setPrevFormValues(formValues)
                                        setDrugUse(newValue);
                                        editDrugForm.setFieldsValue({ prevDrugUsing: newValue });
                                    }}
                                >
                                    <Radio value={"A"}>Dose and Unit</Radio>
                                    <Radio value={"B"}>ปริมาณยากับเวลาใช้</Radio>
                                    <Radio value={"D"}>วิธีใช้ยาแบบระบุเอง</Radio>
                                    <Radio value={"E"}>วิธีใช้แบบฉลากรวม</Radio>
                                </Radio.Group>
                            </Row>
                            <Row gutter={[16, 16]} style={{ flexDirection: "row", marginTop: 16, marginLeft: 0, marginRight: 0 }}>
                                {(drugUse === "A" || drugUse === "B") &&
                                    <Col span={drugUse === "A" ? 4 : 6} style={{ paddingLeft: 0 }} >
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name="drugUsing"
                                            label={<label className="gx-text-primary">Route</label>}
                                        >
                                            <SelectSearchBold reFresh={newDrug}
                                                dataList={drugUsingList}
                                                optionValue="code"
                                                optionLabel="name"
                                                form={editDrugForm}
                                                name="drugUsing"
                                                allowClear={true}
                                                style={{ width: '100%' }}
                                                showSearch
                                                onChange={async (value, option) => {
                                                    // editDrugForm.resetFields();
                                                    // changeDosingInterval();
                                                    //reset state
                                                    setMultiply(0);
                                                    let doseLabel = await getOpdDosingTextfinancesDrug(option?.data?.dose);
                                                    editDrugForm.setFieldsValue({ drugUsing: value, dose: option?.data?.dose });
                                                    setDrugUsingLabel({
                                                        ...drugUsingLabel,
                                                        drugUsing: option?.data?.name,
                                                        dose: doseLabel ? doseLabel : option?.data?.dose
                                                    })
                                                    calculatDayOrDrug(option?.data?.dose, "Dose");
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                }
                                {drugUse === "A" &&
                                    <>
                                        <Col span={3} style={{ paddingLeft: 0 }}>
                                            <Form.Item
                                                style={{ marginBottom: 0 }}
                                                name="dose"
                                                label={<label className="gx-text-primary">Dose</label>}
                                            >
                                                <InputNumber
                                                    stringMode
                                                    style={{ width: '100%' }}
                                                    onChange={(v) => {
                                                        setDrugUsingLabel({
                                                            ...drugUsingLabel,
                                                            dose: v
                                                        });
                                                    }}
                                                    onBlur={async (e) => {
                                                        let doseLabel = await getOpdDosingTextfinancesDrug(e.target.value, "Dose");
                                                        setDrugUsingLabel({
                                                            ...drugUsingLabel,
                                                            dose: doseLabel ? doseLabel : e.target.value
                                                        });
                                                    }}
                                                    onPressEnter={async (e) => {
                                                        let doseLabel = await getOpdDosingTextfinancesDrug(e.target.value, "Dose");
                                                        setDrugUsingLabel({
                                                            ...drugUsingLabel,
                                                            dose: doseLabel ? doseLabel : e.target.value
                                                        });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4} style={{ paddingLeft: 0 }}>
                                            <Form.Item
                                                style={{ marginBottom: 0 }}
                                                name="dosingUnit"
                                                label={<label className="gx-text-primary">Unit</label>}
                                            >
                                                <Select
                                                    allowClear={true}
                                                    style={{ width: '100%' }}
                                                    showSearch
                                                    onChange={(value, option) => {
                                                        setDrugUsingLabel({
                                                            ...drugUsingLabel,
                                                            dosingUnit: option?.name
                                                        });
                                                    }}
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                                                        option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    options={unitList.map((n) => ({ ...n, value: n.code, label: n.name }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={13} style={{ paddingLeft: 0 }}>
                                            <Form.Item
                                                style={{ marginBottom: 0 }}
                                                name="drugTiming"
                                                label={<label className="gx-text-primary">เวลาใช้ยา</label>}
                                            >
                                                <SelectSearchBold reFresh={newDrug}
                                                    dataList={drugTimingList}
                                                    optionValue="code"
                                                    optionLabel="name"
                                                    form={editDrugForm}
                                                    name="drugTiming"
                                                    allowClear={true}
                                                    style={{ width: '100%' }}
                                                    showSearch
                                                    onChange={(value, option) => {
                                                        // editDrugForm.resetFields();
                                                        // changeDosingInterval();
                                                        //reset state
                                                        setFrequency(0);
                                                        if (option?.data?.frequency !== "" && option?.data?.frequency) {
                                                            let newFrequency = toNumber(option?.data?.frequency);
                                                            setFrequency(newFrequency);
                                                        }
                                                        editDrugForm.setFieldsValue({ drugTiming: value });
                                                        const findDrugAdmin = option?.data?.drugAdmin
                                                        if (findDrugAdmin) {
                                                            editDrugForm.setFieldsValue({
                                                                drugAdmin: findDrugAdmin,
                                                            });
                                                            setDrugUsingLabel({
                                                                ...drugUsingLabel,
                                                                drugAdmin: find(drugAdmin, ["code", findDrugAdmin])?.name,
                                                                drugTiming: option?.data?.name
                                                            })
                                                        } else {
                                                            editDrugForm.setFieldsValue({
                                                                drugAdmin: null,
                                                            });
                                                            setDrugUsingLabel({
                                                                ...drugUsingLabel,
                                                                drugTiming: option?.data?.name,
                                                                drugAdmin: null
                                                            })
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </>
                                }
                                {drugUse === "B" &&
                                    <>
                                        <Col style={{ paddingLeft: 0 }} span={13}>
                                            <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
                                                <Col span={4} style={{ paddingLeft: 0, textAlign: "right" }} />
                                                <Col span={4} style={{ paddingLeft: 0 }}><label className="gx-text-primary">เช้า</label></Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}><label className="gx-text-primary">เที่ยง</label></Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}><label className="gx-text-primary">บ่าย</label></Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}><label className="gx-text-primary">เย็น</label></Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}><label className="gx-text-primary">ก่อนนอน</label></Col>
                                            </Row>
                                            <Row gutter={[8, 8]} align='middle' style={{ flexDirection: "row" }}>
                                                <Col span={4} style={{ paddingLeft: 0, textAlign: "center" }} ><label className="gx-text-primary">Dose</label></Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="doseM"
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            controls={false}
                                                            onChange={(val) => {
                                                                onChangeDoseInputNumber({
                                                                    value: val,
                                                                    formFieldKey: "doseM",
                                                                    drugUsingLabelKey: "moriningDose"
                                                                })
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="doseL"
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            controls={false}
                                                            onChange={(val) => {
                                                                onChangeDoseInputNumber({
                                                                    value: val,
                                                                    formFieldKey: "doseL",
                                                                    drugUsingLabelKey: "middayDose"
                                                                })
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="doseN"
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            controls={false}
                                                            onChange={(val) => {
                                                                onChangeDoseInputNumber({
                                                                    value: val,
                                                                    formFieldKey: "doseN",
                                                                    drugUsingLabelKey: "afternoonDose"
                                                                })
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="doseE"
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            controls={false}
                                                            onChange={(val) => {
                                                                onChangeDoseInputNumber({
                                                                    value: val,
                                                                    formFieldKey: "doseE",
                                                                    drugUsingLabelKey: "eveningDose"
                                                                })
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="doseB"
                                                    >
                                                        <InputNumber
                                                            style={{ width: '100%' }}
                                                            controls={false}
                                                            onChange={(val) => {
                                                                onChangeDoseInputNumber({
                                                                    value: val,
                                                                    formFieldKey: "doseB",
                                                                    beforeBedDose: "eveningDose"
                                                                })
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row gutter={[8, 8]} style={{ flexDirection: "row", marginTop: 8 }}>
                                                <Col span={4} style={{ paddingLeft: 0 }} />
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="timeM"
                                                    >
                                                        <DayjsTimePicker format={"HH:mm"} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="timeL"
                                                    >
                                                        <DayjsTimePicker format={"HH:mm"} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="timeN"
                                                    >
                                                        <DayjsTimePicker format={"HH:mm"} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="timeE"
                                                    >
                                                        <DayjsTimePicker format={"HH:mm"} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4} style={{ paddingLeft: 0 }}>
                                                    <Form.Item
                                                        style={{ marginBottom: 0 }}
                                                        name="timeB"
                                                    >
                                                        <DayjsTimePicker format={"HH:mm"} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={5} style={{ paddingLeft: 0 }}>
                                            <Form.Item
                                                style={{ marginBottom: 0 }}
                                                name="dosingUnit"
                                                label={<label className="gx-text-primary">Unit</label>}
                                            >
                                                <Select
                                                    allowClear={true}
                                                    style={{ width: '100%' }}
                                                    showSearch
                                                    onChange={(value, option) => {
                                                        editDrugForm.setFieldsValue({ dosingUnit: value });
                                                        setDrugUsingLabel({
                                                            ...drugUsingLabel,
                                                            dosingUnit: option?.name
                                                        });
                                                    }}
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    options={unitList.map((n) => ({ ...n, value: n.code, label: n.name }))}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </>
                                }
                                {drugUse === "D" ?
                                    <>
                                        {formInputDrugLabel(1)}
                                        {formInputDrugLabel(2)}
                                        {formInputDrugLabel(3)}
                                        {formInputDrugLabel(4)}
                                    </>
                                    : null
                                }
                                {drugUse === "E" &&
                                    <Col span={24} style={{ paddingLeft: 0 }} >
                                        <Form.Item
                                            name="drugLabel"
                                            style={{ marginBottom: 0 }}
                                            label={<label className="gx-text-primary">ฉลากยา</label>}
                                        >
                                            <SelectDrugLabel
                                                value={editDrugForm.getFieldValue("drugLabel")}
                                                onChange={(val, option) => {
                                                    setDrugUsingLabel({
                                                        ...drugUsingLabel,
                                                        drugLabel: option.label,
                                                    });
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                }
                                {JSON.parse(localStorage.getItem("hos_param"))?.hideTimeMed === "Y" && drugUse === "A" ?
                                    null
                                    :
                                    <Col span={6} style={{ paddingLeft: 0 }}>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name="dosingTime"
                                            label={<label className="gx-text-primary">เวลารับประทาน</label>}
                                        >
                                            <Select disabled={drugUse === "E"}
                                                allowClear={true}
                                                style={{ width: '100%' }}
                                                showSearch
                                                onChange={(value, option) => {
                                                    // editDrugForm.resetFields();
                                                    // changeDosingInterval();
                                                    editDrugForm.setFieldsValue({ dosingTime: value });
                                                    setDrugUsingLabel({
                                                        ...drugUsingLabel,
                                                        dosingTime: option?.label
                                                    });
                                                }}
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                                                    option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                options={dosingTime.map((n) => ({ value: n.datavalue, label: n.datadisplay }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                }
                                <Col span={6} style={{ paddingLeft: 0 }}>
                                    <div style={{ marginBottom: 8 }}><label className="gx-text-primary">Dosing Interval</label></div>
                                    <SelectDosingInterval
                                        ref={selectDosingIntervalRef}
                                        disabled={drugUse === "E"}
                                        options={dosingInterval}
                                        changeDosingInterval={changeDosingInterval}
                                        setDrugUsingLabel={setDrugUsingLabel}
                                        dosingIntervalLabel={dosingIntervalLabel}
                                        drugUsingLabel={drugUsingLabel}
                                        form={editDrugForm}
                                        setDosingIntervalDays={setDosingIntervalDays}
                                    />
                                </Col>
                                <Col span={3} style={{ paddingLeft: 0 }} >
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        label={<label className="gx-text-primary">ความถี่</label>}
                                        name="alternateDay"
                                    >
                                        <Input
                                            ref={alternateDayRef}
                                            placeholder="วัน"
                                            disabled={disabledExceptDay}
                                            onChange={(e) => {
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    alternateDay: e.target.value
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col
                                    span={JSON.parse(localStorage.getItem("hos_param"))?.hideTimeMed === "Y" && drugUse === "A" ? 15 : 9}
                                    style={{ paddingLeft: 0 }}
                                >
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        label={<label className="gx-text-primary">อื่นๆ</label>}
                                        name="otherDosingInterval"
                                    >
                                        <Input
                                            ref={otherDosingIntervalRef}
                                            placeholder="ระบุ"
                                            disabled={disabledOther}
                                            onChange={(e) => {
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    otherDosingInterval: e.target.value
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={10} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="drugProperty"
                                        label={<label className="gx-text-primary">ข้อบ่งใช้</label>}
                                    >
                                        <SelectSearchBold reFresh={newDrug} disabled={drugUse === "E"}
                                            dataList={drugProperty}
                                            form={editDrugForm}
                                            name="drugProperty"
                                            optionValue="code"
                                            optionLabel="name"
                                            allowClear={true}
                                            style={{ width: '100%' }}
                                            showSearch
                                            onChange={(value, option) => {
                                                // editDrugForm.resetFields();
                                                // changeDosingInterval();
                                                editDrugForm.setFieldsValue({ drugProperty: value });
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    drugProperty: option?.data?.name
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={3} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="drugPropertyFrequency"
                                        label={<label className="gx-text-primary">ความถี่</label>}
                                    >
                                        <Input /* reFresh={newDrug}  */ disabled={drugUse === "E"}
                                        // onChange={(e) => {
                                        //     setDrugUsingLabel({
                                        //         ...drugUsingLabel,
                                        //         field: e.target.value
                                        //     });
                                        // }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={11} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="drugWarning"
                                        label={<label className="gx-text-primary">ข้อควรระวัง</label>}
                                    >
                                        <Select disabled={drugUse === "E"}
                                            allowClear={true}
                                            style={{ width: '100%' }}
                                            showSearch
                                            onChange={(value, option) => {
                                                // editDrugForm.resetFields();
                                                // changeDosingInterval();
                                                editDrugForm.setFieldsValue({ drugWarning: value });
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    drugWarning: option?.label
                                                });
                                            }}
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            options={drugWarning.map((n) => ({ value: n.code, label: n.name }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="drugAdmin"
                                        label={<label className="gx-text-primary">ฉลากช่วย</label>}
                                    >
                                        <Select disabled={drugUse === "E"}
                                            allowClear={true}
                                            style={{ width: '100%' }}
                                            showSearch
                                            onChange={(value, option) => {
                                                // editDrugForm.resetFields();
                                                // changeDosingInterval();
                                                editDrugForm.setFieldsValue({ drugAdmin: value });
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    drugAdmin: option?.label
                                                });
                                            }}
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                                                option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            options={drugAdmin.map((n) => ({ value: n.code, label: n.name }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="docRemark"
                                        label={<label className="gx-text-primary">หมายเหตุเฉพาะ (แสดงที่ฉลากยา)</label>}
                                    >
                                        <Input disabled={drugUse === "E"}
                                            onChange={(e) => {
                                                setDrugUsingLabel({
                                                    ...drugUsingLabel,
                                                    docRemark: e.target.value
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="doctorNote"
                                        label={<label className="gx-text-primary">หมายเหตุการสั่งใช้ยาของแพทย์ (ไม่แสดงที่ฉลากยา)</label>}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={8} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="reason"
                                        label={<label className="gx-text-primary">เหตุผลการใช้ยานอกบัญชีฯ</label>}
                                        rules={[{ required: drugDetails?.ised === "N", message: 'ระบุเหตุผลการใช้ยานอกบัญชีฯ', }]}
                                    >
                                        <Select disabled={drugDetails?.ised !== "N"}
                                            allowClear={true}
                                            style={{ width: '100%' }}
                                            onChange={(val) => {
                                                if (val === "F") {
                                                    let newcashNotReturn = editDrugForm.getFieldValue("credit") ? editDrugForm.getFieldValue("credit") : editDrugForm.getFieldValue("")
                                                    editDrugForm.setFieldsValue({
                                                        credit: 0,
                                                        cashReturn: 0,
                                                        cashNotReturn: newcashNotReturn || 0
                                                    })
                                                }
                                            }}
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            options={isedReason.map((n) => ({ value: n.datavalue, label: n.datadisplay }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="sachet"
                                        label={<label className="gx-text-primary">ซองที่</label>}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        label={<label className="gx-text-primary">ค่าฉีดยา</label>}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={6} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="rightId"
                                        label={<label className="gx-text-primary">สิทธิ์</label>}
                                    >
                                        <Select
                                            allowClear={true}
                                            style={{ width: '100%' }}
                                            showSearch
                                            onChange={(value) => {
                                                setChkEdit(true)
                                                let newSelect = props?.patientType === "opd" ? rightList.find(val => val.opdRightId === value) : rightList.find(val => val.admitRightId === value);
                                                setSelectRight(newSelect);
                                            }}
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            // options={rightList?.map((n) => ({ value: n.opdRightId, label: n.rightName }))}
                                            options={props?.patientType === "opd" ?
                                                rightList?.map((n) => ({ value: n.opdRightId, label: n.opdRightName }))
                                                :
                                                rightList?.map((n) => ({ value: n.admitRightId, label: n.rightName }))
                                            }
                                            value={props?.patientType === "opd" ? selectRight?.opdRightId : selectRight?.admitRightId}
                                        />
                                    </Form.Item>
                                    {/* {console.log(props?.patientType ==="opd" ? selectRight?.opdRightId : selectRight?.admitRightId)} */}
                                </Col>
                                <Col span={18} style={{ paddingRight: 0 }}>
                                    <CalculatDrug gutter={[16, 16]} style={{ flexDirection: "row" }}>
                                        <Col span={4} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="rate"
                                                label={<label className="gx-text-primary">ราคา</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumberStyle style={{ textAlign: "right" }}
                                                    text={"center"}
                                                    onChange={(value) => onChangeExpense(value, "price")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="amount"
                                                label={<label className="gx-text-primary">จำนวนเงิน</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input disabled style={{ textAlign: "center" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="docQty"
                                                label={<label className="gx-text-primary">จน.ที่เบิกได้</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {/* <Input style={{ textAlign: "right" }} /> */}
                                                <InputNumberStyle min={0} value={numOfDrugs !== "" ? numOfDrugs : ""}
                                                    text={"center"}
                                                    onChange={val => calculatDayOrDrug(val, "จน.ที่เบิกได้")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="credit"
                                                label={<label className="gx-text-primary">เครดิต</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumberStyle min={0}
                                                    text={"center"}
                                                    onChange={(value) => onChangeExpense(value, "credit")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="cashReturn"
                                                label={<label className="gx-text-primary">เบิกได้</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumberStyle min={0}
                                                    text={"center"}
                                                    onChange={(value) => onChangeExpense(value, "cashReturn")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="cashNotReturn"
                                                label={<label style={{ color: "red" }}>เบิกไม่ได้</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumberStyle className='textCashNotReturn' min={0}
                                                    text={"center"}
                                                    onChange={(value) => onChangeExpense(value, "cashNotReturn")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3} style={{ paddingLeft: 0 }}>
                                            <Form.Item name="discount"
                                                label={<label className="gx-text-primary">ส่วนลด</label>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumberStyle
                                                    disabled={disabledDiscount}
                                                    min={0}
                                                    text={"center"}
                                                    onChange={(value) => onChangeExpense(value, "discount")}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </CalculatDrug>
                                </Col>
                                <Col span={9} style={{ paddingLeft: 0 }}>
                                    <Row gutter={[16, 16]} style={{ flexDirection: "row", marginLeft: 0, marginRight: 0, paddingTop: 8, paddingBottom: 8, backgroundColor: "#f2f4f6" }}>
                                        <Col xxl={12} xl={24} lg={12} mg={24} sm={24} xs={24}>
                                            <div>Usual dose</div>
                                            <div style={{ marginTop: 10, fontWeight: "500" }}>{drugUsingDose?.minAge}-{drugUsingDose?.maxAge} mg/kg/day</div>
                                        </Col>
                                        <Col xxl={12} xl={24} lg={12} mg={24} sm={24} xs={24}>
                                            <div>ขนาดยาแนะนำผู้ป่วย</div>
                                            <div style={{ marginTop: 10, fontWeight: "500" }}>{drugUsingDose?.minDose}-{drugUsingDose?.maxDose} mg/day</div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        label={<label className="gx-text-primary">mg/day</label>}
                                    >
                                        <Input disabled value={drugUsingDose?.maxDose} />
                                    </Form.Item>
                                </Col>
                                <Col span={2} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        label={<label className="gx-text-primary">ml/day</label>}
                                    >
                                        <Input disabled value={drugUsingDose?.maxDose} />
                                    </Form.Item>
                                </Col>
                                <Col span={4} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="duration"
                                        label={<label className="gx-text-primary">จำนวนวันที่ต้องการให้ยา</label>}
                                    >
                                        <InputNumber
                                            // size='small'
                                            style={{ width: "100%" }}
                                            disabled={!startDate}
                                            onChange={v => {
                                                handleChangeUseDays(v)
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={3} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="startDate"
                                        label={<label className="gx-text-primary">วันที่เริ่มให้ยา</label>}
                                    >
                                        <DayjsDatePicker
                                            style={{ width: '100%' }}
                                            format={dateFormatList}
                                            form={editDrugForm}
                                            name="startDate"
                                            onChange={(val) => {
                                                setChkEditStartDate(true);
                                                editDrugForm.setFieldsValue({ startDate: val, endDate: val && dayjs(val).add(editDrugForm.getFieldValue("duration") ? editDrugForm.getFieldValue("duration") - 1 : 0, "day") });
                                            }}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                setTimeout(() => {
                                                    let date = e.target.value + dayjs().format(" HH:mm:ss");
                                                    if (dayjs(date, "DD/MM/YYYY HH:mm:ss", true).isValid() && (/[\d.]/.test(e.key) || e.key === "Backspace")) {
                                                        date = dayjs(date, "DD/MM/YYYY HH:mm:ss").add(-543, "year");
                                                        setChkEditStartDate(true);
                                                        editDrugForm?.setFieldsValue({ startDate: date, endDate: dayjs(date).add(editDrugForm.getFieldValue("duration") ? editDrugForm.getFieldValue("duration") - 1 : 0, "day") });
                                                    }
                                                }, 1);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={3} style={{ paddingLeft: 0 }}>
                                    <Form.Item
                                        style={{ marginBottom: 0 }}
                                        name="endDate"
                                        label={<label className="gx-text-primary">วันที่สิ้นสุดการให้ยา</label>}
                                    >
                                        <DayjsDatePicker
                                            style={{ width: '100%' }}
                                            format={dateFormatList}
                                            form={editDrugForm}
                                            name="endDate"
                                            disabledDate={disabledEndDate}
                                            onChange={(val) => {
                                                editDrugForm.setFieldsValue({ endDate: val });
                                                if (val !== null && editDrugForm.getFieldValue("startDate") !== null) {
                                                    let newNumOfDays = dayjs(val).startOf("date").diff(dayjs(editDrugForm.getFieldValue("startDate")).startOf("date"), "day") + 1;
                                                    // setNumOfDays(newNumOfDays);
                                                    calculatDayOrDrug(newNumOfDays, "จน.วัน", true);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                setTimeout(() => {
                                                    let date = e.target.value;
                                                    if (dayjs(date, dateFormatList, true).isValid() && (/[\d.]/.test(e.key) || e.key === "Backspace")) {
                                                        date = dayjs(date, dateFormatList).add(-543, "year");
                                                        if (!date.isSameOrAfter(editDrugForm.getFieldValue("startDate").startOf("date"))) {
                                                            return;
                                                        }
                                                        editDrugForm?.setFieldsValue({ endDate: date });
                                                        if (date !== null && editDrugForm.getFieldValue("startDate") !== null) {
                                                            let newNumOfDays = dayjs(date).startOf("date").diff(dayjs(editDrugForm.getFieldValue("startDate")).startOf("date"), "day") + 1;
                                                            calculatDayOrDrug(newNumOfDays, "จน.วัน", true);
                                                        }
                                                    }
                                                }, 1);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <div style={{ marginTop: 16 }}>
                                <Divider style={{ margin: 0 }} />
                                <div className="content_container" style={{ paddingRight: 16 }}>
                                    <Row gutter={[16, 16]} style={{ flexDirection: "row", marginLeft: 0, marginRight: 0 }}>
                                        {editDrugProfileId ?
                                            <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                                <Form.Item name="genOverRule"
                                                    style={{ marginBottom: 0 }}
                                                    label={<label className="gx-text-primary">Over Rule</label>}
                                                >
                                                    <InputNumberStyle controls={false} text={"center"} />
                                                </Form.Item>
                                            </Col>
                                            : null
                                        }
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nMon"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">จันทร์</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTue"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">อังคาร</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nWed"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">พุธ</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nThu"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">พฤหัสบดี</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nFri"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">ศุกร์</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nSat"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">เสาร์</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nSun"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">อาทิตย์</label>}
                                            >
                                                <InputNumberStyle controls={false} text={"center"} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                                <Divider style={{ margin: 0 }} />
                                <div className="content_container" style={{ paddingRight: 16 }}>
                                    <Row gutter={[16, 16]} style={{ flexDirection: "row", marginLeft: 0, marginRight: 0 }}>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime1"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 1</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime2"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 2</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime3"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 3</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime4"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 4</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime5"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 5</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime6"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 6</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime7"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 7</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                        <Col xxl={3} xl={6} lg={3} mg={6} span={6}>
                                            <Form.Item name="nTime8"
                                                style={{ marginBottom: 0 }}
                                                label={<label className="gx-text-primary">Time 8</label>}
                                            >
                                                <DayjsTimePicker style={{ width: "100%" }} format={hourFormat} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Form>
                    </Scrollbars>
                </Spin>
                <PrevDrugUsing
                    form={editDrugForm}
                    prevFormValues={prevFormValues}
                    oldDrugUse={prevDrugUsing}
                    newDrugUse={drugUse}
                    dosingIntervalRef={selectDosingIntervalRef}
                    resetFields={resetPrevDrugUsingForm}
                    setNewDrugLabel={(newDrugUse) => {
                        setTimeout(() => {
                            const formValues = editDrugForm.getFieldsValue()
                            const dosingIntervalDays = selectDosingIntervalRef?.current?.getChkDays() || []
                            setNewDrugLabel({
                                ...formValues,
                                dosingInterval: dosingIntervalDays.join(","),
                            });
                        }, 100);
                        setTimeout(() => {
                            if (newDrugUse === 'A' || newDrugUse === 'B') {
                                chkPageForClcDayOrDrugInjectionFlag(
                                    'dosingUnit',
                                    null,
                                    newDrugUse
                                );
                            }
                        }, 200);
                    }}
                />
            </Modal>
        )
    })

const robotsDay = [
    { field: "nMon" },
    { field: "nTue" },
    { field: "nWed" },
    { field: "nThu" },
    { field: "nFri" },
    { field: "nSat" },
    { field: "nSun" },
]
const robotsTime = [
    { field: "nTime1" },
    { field: "nTime2" },
    { field: "nTime3" },
    { field: "nTime4" },
    { field: "nTime5" },
    { field: "nTime6" },
    { field: "nTime7" },
    { field: "nTime8" },
]