import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Row, Col, notification, Button, Modal, Form, Input, List } from 'antd';
import { Icon } from '@iconify/react';
import testBottle from '@iconify/icons-fontisto/test-bottle';
import genderAmbiguous from '@iconify/icons-bi/gender-ambiguous';
import stethoscopeIcon from '@iconify/icons-la/stethoscope';
import pillIcon from '@iconify/icons-tabler/pill';
import reloadIcon from '@iconify/icons-mdi/reload';
// import pregnantWomen from '@iconify/icons-icon-park/pregnant-women';
import bottleTonicOutline from '@iconify/icons-mdi/bottle-tonic-outline';
import iLaboratory from '@iconify/icons-medical-icon/i-laboratory';
import stopOutlined from '@iconify/icons-ant-design/stop-outlined';
import doctorMaleOutline from '@iconify/icons-healthicons/doctor-male-outline';
import waterIcon from '@iconify/icons-mdi/water';
// import meetingRoomRounded from '@iconify/icons-material-symbols/meeting-room-rounded';
import conferenceRoom20Regular from '@iconify/icons-fluent/conference-room-20-regular';
import stockIcon from '@iconify/icons-vaadin/stock';
import cardText from '@iconify/icons-bi/card-text';
import signatureLight from '@iconify/icons-ph/signature-light';
import styled from "styled-components";
import "./Styles/DrugAlert.less";
import { map, filter, toNumber, uniqBy, intersectionBy } from "lodash";
import moment from 'moment';
import {
    GetOpdExpenseNamefinancesDrug, GetOpdChkPatientDrugAllergiesfinancesDrug, GetOpdChkPatientExpAllerygiesfinancesDrug,
    GetOpdChkPtDgAdrsfinancesDrug, GetOpdDrugInteractionsfinancesDrug, GetOpdHighalertfinancesDrug, GetOpdDrugGenderfinancesDrug,
    GetOpdDrugUnderlyingDiseasesfinancesDrug, GetOpdChkDrugUsualDosesfinancesDrug, GetOpdPregnancyOrBreastfeedingfinancesDrug,
    GetOpdChkDrugLabCriticalsfinancesDrug, GetOpdIsedfinancesDrug, GetOpdNedfinancesDrug, GetOpdDrugDoctorsfinancesDrug,
    GetOpdDrugDocSpecialtiesfinancesDrug, GetOpdInventoriesfinancesDrug, GetOpdchkExpenseRightsPopupTextfinancesDrug,
    GetOpdchkExpensefinancesDrug, GetOpdchkfinancesDrug, GetExpenseWorkPlacesfinancesDrug, GetPopUpFinancesDrugDisPlay,
    GetOpdChkPatientExpAllerygiesDrugAcross
} from './API/DrugAlertApi';
import { httpPanaceas } from "../../util/Api"
import { FindGenericByExpenseId } from "../../routes/OpdClinic/API/OpdDrugChargeApi";
import {
    CloseCircleOutlined,
    WarningOutlined
} from "@ant-design/icons";
import { DivScrollY } from "../../components/helper/DivScroll";

//style component
const RedBtn = styled(Button)` 
    background-color: #ff7272;
    color: white!important;
    margin-bottom: 0;
    border-radius: 4px;
    cursor: pointer;
    :active{
        background-color: #ff8585;
        color: white!important;
        border-color: #ff8585!important;
    }
    :focus{
        background-color: #ff8585;
        color: white!important;
        border-color: #ff8585!important;
    }
    :hover{
        background-color: #ff8585;
        color: white!important;
        border-color: #ff8585!important;
    }
`;
const PinkBtn = styled(Button)` 
    background-color: #fbcccc;
    color: white!important;
    margin-bottom: 0;
    border-radius: 4px;
    cursor: pointer;
    :active{
        background-color: #ffd6d6;
        color: white!important;
        border-color: #ffd6d6!important;
    }
    :focus{
        background-color: #ffd6d6;
        color: white!important;
        border-color: #ffd6d6!important;
    }
    :hover{
        background-color: #ffd6d6;
        color: white!important;
        border-color: #ffd6d6!important;
    }
`;
const YellowBtn = styled(Button)` 
    background-color: #ffab2b;
    color: white!important;
    margin-bottom: 0;
    border-radius: 4px;
    cursor: pointer;
    :active{
        background-color: #ffbb53;
        color: white!important;
        border-color: #ffbb53!important;
    }
    :focus{
        background-color: #ffbb53;
        color: white!important;
        border-color: #ffbb53!important;
    }
    :hover{
        background-color: #ffbb53;
        color: white!important;
        border-color: #ffbb53!important;
    }
`;
const BlueBtn = styled(Button)` 
    background-color: #bbd9ff;
    color: white!important;
    margin-bottom: 0;
    border-radius: 4px;
    cursor: pointer;
    :active{
        background-color: #d1e5ff;
        color: white!important;
        border-color: #d1e5ff!important;
    }
    :focus{
        background-color: #d1e5ff;
        color: white!important;
        border-color: #d1e5ff!important;
    }
    :hover{
        background-color: #d1e5ff;
        color: white!important;
        border-color: #d1e5ff!important;
    }
`;
//style
const notiStyle = {
    padding: 16,
    width: 650,
}
const iconBg = {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    marginRight: 0
}
const redNoti = {
    backgroundColor: "#fbcccc",
    border: "1px solid red"
}
const pinkNoti = {
    backgroundColor: "#ffefef",
    border: "1px solid #fbcccc"
}
const yellowNoti = {
    backgroundColor: "#ffecce",
    border: "1px solid #ffab2b"
}
const orangeNoti = {
    backgroundColor: "#ffe8e3",
    border: "1px solid #ff693a"
}
const blueNoti = {
    backgroundColor: "#e1eeff",
    border: "1px solid #73aaea"
}
const popupTextNoti = {
    border: "1px solid #73aaea"
}
const newYellowNoti = {
    backgroundColor: "#f5faaa",
    border: "1px solid #d0d016"
}
const signatureDrugNoti = {
    // backgroundColor: "#fbcccc",
    border: "1px solid var(--primary-color)"
}
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const prescribeMedicineTemplates = hosParam?.prescribeMedicineTemplates || null
// eslint-disable-next-line no-unused-vars
export default forwardRef(function DrugAlert({
    patientData = [],
    hxList = [],
    // opdLabResult = [],
    rightId,
    doctorId,
    workId,
    selectPatient,
    patientType,
    drugWarningList,
    dispatchDrugDiseaseList,
    patientDrugLeft,
    // alertTypes = [],
    ...props
}, ref) {
    const [expenseList, setExpenseList] = useState([]);
    const [drugUsualDose, setDrugUsualDose] = useState([]);
    const [, setCheckNoti] = useState(false);
    useImperativeHandle(ref, () => ({
        checkDrugAlert: (props) => checkDrugAlert(props),
        setCheckNoti: (props) => setCheckNoti(props),
        editNumDrug: (expenseId, expenseName, quantity) => editNumDrug(expenseId, expenseName, quantity),
        chkDrugAccept: (props) => chkDrugAccept(props),
        chkReasonModal: (props) => chkReasonModal(props),
        chkDiseaseModal: (props) => chkDiseaseModal(props),
        drugDuplicateNoti: (expenseName, startDate, doNotOrder) => drugDuplicateNoti(expenseName, startDate, doNotOrder),
        chkDrugAllergyModal: (props) => chkDrugAllergyModal(props),
        chkDIOrder: (props) => chkDIOrder(props),
        chkDIMituDrug: (props) => chkDIMituDrug(props.selectDrug, props.orderFinances, props?.reMed),
        chkDrugCodeAdrsNoti: (drugCodeAdrs, orders) => chkDrugCodeAdrsNoti(drugCodeAdrs, orders),
    }));
    //Func. call api
    const getOpdExpenseNamefinancesDrug = async () => {
        let resData = await GetOpdExpenseNamefinancesDrug();
        resData = uniqBy(resData, "expenseId");
        setExpenseList(resData);
    }
    //Func.
    const checkDrugAlert = async (props) => {
        let doctorName = props.doctorName;
        let selectDrug = props.selectDrug;
        let orderFinances = props.orderFinances;
        let diseaseList = hxList?.underlying_Diseases_Display;
        let sentApiDi = props?.sentApiDi === false ? false : true;
        let sentApiDisease = props?.sentApiDisease === false ? false : true;
        let checkReMed = props?.reMed ? true : false;
        // let index = 0;
        // console.log(selectDrug);
        const returnData = await Promise.all(selectDrug.map(async o => {
            let returnObj = {}
            let code = expenseList.find(expense => expense.expenseId === o.expenseId)?.code
            let drugWarning = drugWarningList.find(vallist => vallist.code === o.drugWarning)?.name;
            returnObj = await chkAlertAndOutExpenseList({
                returnObj: returnObj,
                drug: o,
                code: code,
                doctorId: doctorId,
                doctorName: doctorName,
                diseaseList: diseaseList,
                orderFinances: orderFinances,
                checkReMed: checkReMed,
                drugWarning: drugWarning,
                sentApiDi: sentApiDi,
                sentApiDisease: sentApiDisease,
            });
            return returnObj;
        }))
        return returnData
    }
    const dueFunc = async (drug, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return
        //ยา DUE
        // if(!checkAlert){
        let resDataDUE = await drugDUENoti(drug.expenseId, drug.expenseName);
        // }
        //ข้อความของห้องยา
        if (resDataDUE?.docPopupText) {
            let title = "ข้อความของห้องยา";
            let content = (
                <>
                    <div>ยา {drug.expenseName}</div>
                    <div>{resDataDUE?.docPopupText}</div>
                </>
            )
            popupText(title, content, "#ff693a", "#ff693a");
            // checkAlert = true;
        }
        // }
        //ข้อความของแพทย์
        // if(!checkAlert){
        if (resDataDUE?.popupText) {
            let title = "ข้อความของแพทย์";
            let content = (
                <>
                    <div>ยา {drug.expenseName}</div>
                    <div>{resDataDUE?.popupText}</div>
                </>
            )
            popupText(title, content);
            // checkAlert = true;
        }
        // }
    }
    const chkAlertAndOutExpenseList = async (param) => {
        let { returnObj, drug, code, doctorId, doctorName, diseaseList, orderFinances, checkReMed, drugWarning, sentApiDi, sentApiDisease } = param
        returnObj.alertTypes = [];
        let alertList = [
            {
                //ยาที่ทำปฏิกิริยา
                func: async (val, orderFinances) => {
                    if (prescribeMedicineTemplates === "Y" && checkReMed) return
                    await Promise.all(orderFinances.map(orderFinance => (
                        drugInterActionNoti({
                            genericList1: val.opdFormulaExpensesGeneric,
                            genericList2: orderFinance.opdFormulaExpensesGeneric
                        })
                    ))).then(res => (res.some(val => val === true)))
                },
                alertTypes: "DI",
                sentApi: sentApiDi
            },
            {
                //HIGH ALERT DRUG
                func: (val) => drugHighAlertNoti(code, val.expenseName, checkReMed)
            },
            {
                //ยากับเพศ
                func: () => drugAndGender(code, checkReMed)
            },
            {
                //ยากับแพทย์ และ ยากับสาขาแพทย์
                func: () => drugAndDoctorNoti(drug.expenseId, drug.expenseName, doctorId, drug.quantity, checkReMed),
                alertTypes: "DOC",
                outExpenseList: true
            },
            {
                //ยากับหน่วยงาน
                func: () => chkDrugWork(drug.expenseId, drug.expenseName, workId, drug.quantity, checkReMed),
                outExpenseList: true,
                alertTypes: "WORK",
            },
            {
                //ยากับโรค
                func: () => checkDrugDiseasefunc(drug, diseaseList, checkReMed),
                alertTypes: "UD",
                sentApi: sentApiDisease,
                outExpenseList: true,
                chkLock: true
            },
            {
                // ยากับอายุ
                func: () => drugAndAgeNoti(drug.expenseId, drug.expenseName, checkReMed),
                alertTypes: "AGE",
                outExpenseList: true
            },
            {
                ////ยากับสตรีมีครรภ์ให้นมบุตร
                func: (val) => drugAndPregnantNoti(code, val.expenseName, checkReMed),
                alertTypes: "PREG",
            },
            {
                //OVER DOSE
                func: (val) => overDrugNoti(val.dose, val.expenseId, val.expenseName, checkReMed),
                alertTypes: "OVER",
            },
            {
                //ยา กับ LAB
                func: (val) => drugAndLabNoti(val.opdFormulaExpensesGeneric, val.expenseName, checkReMed),
                alertTypes: "L",
            },
            // {
            //     // ยา NED
            //     func: (val) => drugNEDNoti(code, val.expenseName, rightId, checkReMed),
            //     alertTypes: "NED",
            //     setApi: patientType === "opd"
            // },
            {
                //ยากับ STOCK
                func: (val) => drugAndStockNoti(val.expenseName, val.goodsId, val.quantity, checkReMed),
                alertTypes: "Stock",
            },
            {
                //สิทธิ์
                func: (val) => rightNoti(val.expenseId, val.expenseName, rightId, checkReMed),
                alertTypes: "RIGHT",
            },
            // {
            //     func: (val) => drugWarninng(val.expenseName, drugWarning, checkReMed),
            //     sentApi: drug?.drugWarning
            // },
            {
                func: (val) => dueFunc(val, checkReMed)
            },
            {
                func: (val) => getPopUpFinancesDrugDisPlay(val.expenseId, checkReMed)
            },
            {
                //จ่ายยาซ้ำซ้อน
                func: (val) => chkDrugDuplicateNoti(val.expenseId, val.expenseName, val.financeId, patientType, checkReMed),
                alertTypes: "REPEAT",
            },
            {
                //แพ้ยาข้ามกลุ่ม
                func: (val) => allerygiesDrugAcross(val.expenseId, val.expenseName, doctorName, checkReMed)
            },
        ];
        await Promise.all(alertList.map(val => (
            (val.sentApi === undefined || val.sentApi) ? val.func(drug, orderFinances) : false
        ))).then(res => {
            let addOutList = false;
            let tempDiseaseList = [];
            for (let i = 0; i < res.length; i++) {
                if (res[i]) {
                    if (alertList[i]?.outExpenseList && addOutList === false) {
                        if (returnObj?.outExpenseList?.length > 0) {
                            if (alertList[i]?.chkLock) {
                                if (res[i]?.lock) {
                                    tempDiseaseList.push(drug);
                                    returnObj.outExpenseList = [...returnObj?.outExpenseList, drug];
                                }
                            } else {
                                returnObj.outExpenseList = [...returnObj?.outExpenseList, drug];
                            }
                        } else {
                            if (alertList[i]?.chkLock) {
                                if (res[i]?.lock) {
                                    tempDiseaseList.push(drug);
                                    returnObj.outExpenseList = [drug];
                                }
                            } else {
                                returnObj.outExpenseList = [drug];
                            }
                        }
                        break;
                    }
                    if (alertList[i]?.alertTypes) {
                        if (returnObj?.alertTypes?.length > 0) {
                            returnObj.alertTypes = [...returnObj.alertTypes, alertList[i].alertTypes];
                        } else {
                            returnObj.alertTypes = [alertList[i].alertTypes];
                        }
                    }
                }
            }
            dispatchDrugDiseaseList({ type: "adddiseaseList", data: tempDiseaseList });
        })
        return returnObj
    }
    const getPopUpFinancesDrugDisPlay = async (expenseId, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return
        let res = await GetPopUpFinancesDrugDisPlay(expenseId);
        let fuctList = [drugExpensive, drugNarotic, drugDanger, drugBlood, signatureDrug];
        let index = 0;
        for (let type = 2; type <= 6; type++) {
            let found = res.find(val => toNumber(val.type) === type);
            if (found) {
                fuctList[index](found?.expenseName);
            }
            index++;
        }
    }
    const checkDrugDiseasefunc = async (drug, diseaseList, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        for (const disease of diseaseList) {
            let resDrugAllergy = await drugAndDiseaseNoti(drug.expenseName, drug.opdFormulaExpensesGeneric, disease);
            // console.log(resDrugAllergy, "resDrugAllergy");
            let returnObj = {};
            if (resDrugAllergy[0]?.lockFlag === "Y") {
                returnObj.chk = true;
                returnObj.lock = true;
                return returnObj;
            }
            if (resDrugAllergy[0]) {
                returnObj.chk = true;
                return returnObj;
            }
        }
        return false;
    }
    //แก้ไขจำนวนยาที่ตาราง Order No
    const editNumDrug = async (expenseId, expenseName, quantity) => {
        return await Promise.all([
            //ยากับแพทย์ และ ยากับสาขาแพทย์
            drugAndDoctorNoti(expenseId, expenseName, doctorId, quantity),
            //ยากับหน่วยงาน
            chkDrugWork(expenseId, expenseName, workId, quantity)
        ])
            // .then((res)=>
            .then(([resChkDoctor, resChkWork]) => {
                if (resChkDoctor || resChkWork) {
                    return true;
                }
                return false;
            })
    }
    const chkDrugInterActionNoti = async (drug, orderFinances, drugLeft = false) => {
        // console.log("orderFinances", orderFinances);
        return await Promise.all(
            orderFinances.map(val => (
                drugInterActionNoti({
                    genericList1: drug.opdFormulaExpensesGeneric,
                    genericList2: val.opdFormulaExpensesGeneric,
                    expense1: drug,
                    expense2: val,
                    drugLeft: drugLeft
                })
            ))
        ).then(res => {
            console.log("chkDrugInterActionNoti", res);
            if (res?.length > 0) {
                return {
                    resDi: res,
                    // chkDrugInterActionNoti: res.some(val=>Boolean(val)===true)
                    chkDrugInterActionNoti: res.some(val => val?.lockFlag === "Y")
                }
            } else {
                return { chkDrugInterActionNoti: false };
            }
        })
    }
    //chk show modal reason and chk user
    const chkReasonModal = async (props) => {
        let selectDrug = props.selectDrug;
        let orderFinances = props.orderFinances;
        selectDrug = await Promise.all(
            selectDrug.map(async (val) => {
                let drug = expenseList.find(expense => expense.expenseId === val.expenseId);
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    code: drug?.code,
                    opdFormulaExpensesDrugGroup: drug?.expensesDrugGroup,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )
        orderFinances = await Promise.all(
            orderFinances.map(async (val) => {
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )

        patientDrugLeft = patientDrugLeft.map(val => ({
            ...val,
            opdFormulaExpensesGeneric: val.genericList
        }))

        return await Promise.all(
            selectDrug.map(async (val) => {
                let chkDrugInterAction = await chkDrugInterActionNoti(val, orderFinances);
                let chkDrugInterActionLeft = await chkDrugInterActionNoti(val, patientDrugLeft, true);
                let check1 = chkDrugInterAction?.resDi ? chkDrugInterAction.resDi?.length > 0 : false;
                let check2 = chkDrugInterActionLeft?.resDi ? chkDrugInterActionLeft?.resDi?.length > 0 : false;
                let result = {
                    expenseId: val.expenseId,
                    chkReasonVisible: chkDrugInterAction.chkDrugInterActionNoti || chkDrugInterActionLeft.chkDrugInterActionNoti,
                    resDi: (check1 && check2) ? [...chkDrugInterAction?.resDi, ...chkDrugInterActionLeft?.resDi]
                        : (check1 && !check2) ? chkDrugInterAction?.resDi : chkDrugInterActionLeft?.resDi
                }
                return result;
            })
        ).then(res => {
            return res;
        })
    }
    const chkDiseaseModal = async (props) => {
        let diseaseList = hxList?.underlying_Diseases_Display;
        let selectDrug = props.selectDrug;
        let orderFinances = props.orderFinances; console.log(orderFinances);

        selectDrug = await Promise.all(
            selectDrug.map(async (val) => {
                let drug = expenseList.find(expense => expense.expenseId === val.expenseId);
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    code: drug?.code,
                    opdFormulaExpensesDrugGroup: drug?.expensesDrugGroup,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )

        return await Promise.all(
            selectDrug.map(async (drug) => (await checkDrugDiseasefunc(drug, diseaseList)))
        ).then(res => {
            return res;
        })
    }
    const chkDrugAllergyModal = async (props) => {
        let doctorName = props?.doctorName || null;
        let selectDrug = props.selectDrug;
        const reMed = props?.reMed || false;
        if (prescribeMedicineTemplates === "Y" && reMed) return []
        // console.log(selectDrug, "opdFormulaExpensesDrugGroup");
        selectDrug = await Promise.all(
            selectDrug.map(async (val) => {
                let drug = expenseList.find(expense => expense.expenseId === val.expenseId);
                // console.log(drug, "opdFormulaExpensesDrugGroup")
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    code: drug?.code,
                    opdFormulaExpensesDrugGroup: drug?.expensesDrugGroup,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )
        let resDrug = [];
        for (const val of selectDrug) {
            // console.log(val, "opdFormulaExpensesDrugGroup");
            let chkDrugAllergy = await Promise.all([
                //แพ้ยา
                drugAllergyNoti(1, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId, reMed),
                //แพ้กลุ่มยา
                drugAllergyNoti(2, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId, reMed),
                //แพ้ส่วนประกอบยา 
                drugAllergyNoti(3, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId, reMed),
            ]).then((res) => {
                return res;
            })
            resDrug = [...resDrug, {
                expenseId: val.expenseId,
                chkDrugAllergy: chkDrugAllergy,
                showDrugAllergy: chkDrugAllergy.findIndex(val => val?.lockFlag === "Y"),
                ptAdrId: chkDrugAllergy[0] ? chkDrugAllergy[0]?.code : null,
                ptDgAdrId: chkDrugAllergy[1] ? chkDrugAllergy[1]?.code : null,
                adrFlag: chkDrugAllergy.some(val => val === true) ? "Y" : null
            }];
            // console.log("chkDrugAllergy", resDrug);
        }
        return resDrug;
    }
    const chkDrugCodeAdrsNoti = (drugCodeAdrs, orders) => {
        if (prescribeMedicineTemplates) return
        const dts = intersectionBy(drugCodeAdrs, orders, "expenseId")
        map(dts, (o, i) => {
            const key = o.code + String(i)
            const args = {
                // placement,
                key: key,
                className: 'drugAlert red_border',
                style: { ...notiStyle, ...redNoti },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}>
                            <label style={{ color: "#ff7171", fontSize: 22 }}>
                                แพ้ Code ยา
                            </label>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }} >
                            <label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label>
                        </Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            {/* {doctorName ? <div>แพทย์ผู้สั่ง {doctorName}</div> : null} */}
                            <div>ยา : {o.expenseName}</div>
                            <div>ระดับการประเมิน : {o?.alevelName || "-"}</div>
                            <div>รายละเอียด : {o?.otherSymptom || "-"}</div>
                            <div>อาการ : {o?.symptomDesc || "-"}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <RedBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</RedBtn>
                        </Col>
                    </Row>,
                duration: 0,
                onClose: () => {
                    notification.destroy();
                },
            };
            return notification.open(args);
        })
    }
    const chkDrugAccept = async (props) => {
        // let checkAlert = false;
        let doctorName = props?.doctorName || null;
        let selectDrug = props.selectDrug;
        let orderFinances = props.orderFinances;
        // let newExpenseList = await getDrugExpenseList("DM","N");
        let diseaseList = hxList?.underlying_Diseases_Display;
        selectDrug = await Promise.all(
            selectDrug.map(async (val) => {
                let drug = expenseList.find(expense => expense.expenseId === val.expenseId);
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    code: drug?.code,
                    opdFormulaExpensesDrugGroup: drug?.expensesDrugGroup,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )
        orderFinances = await Promise.all(
            orderFinances.map(async (val) => {
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )

        let resDrug = [];

        for (const val of selectDrug) {
            let chkDrug = await Promise.all([
                //ยาที่ทำปฏิกิริยา
                chkDrugInterActionNoti(val, orderFinances),
                //แพ้ยา
                drugAllergyNoti(1, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId),
                //แพ้กลุ่มยา
                drugAllergyNoti(2, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId),
                //แพ้ส่วนประกอบยา 
                drugAllergyNoti(3, doctorName, val.opdFormulaExpensesDrugGroup, val.expenseName, val.opdFormulaExpensesGeneric, val.expenseId),
                //ยากับโรค
                checkDrugDiseasefunc(val, diseaseList),
                //ยากับLab
                drugAndLabNoti(val.opdFormulaExpensesGeneric, val.expenseName)
            ]).then(([resDi, ...res]) => {
                if (resDi.chkDrugInterActionNoti && res.some(val => val === true)) {
                    return true;
                }
                return false;
            })
            resDrug = [...resDrug, { expenseId: val.expenseId, check: chkDrug }];
            console.log("chkDrugInterActionNoti", resDrug);
        }
        return resDrug.some(val => val.check === true);
    }
    const chkDIOrder = async (orderFinances = []) => {
        console.log('orderFinances', orderFinances)
        orderFinances = await Promise.all(
            orderFinances.map(async (val) => {
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )
        const promises = [];
        for (let i = 1; i < orderFinances.length; i++) {
            for (let j = 0; j < i; j++) {
                const promise = new Promise((resolve,) => {
                    resolve(
                        drugInterActionNoti({
                            genericList1: orderFinances[i].opdFormulaExpensesGeneric,
                            genericList2: orderFinances[j].opdFormulaExpensesGeneric,
                            expense1: orderFinances[i],
                            expense2: orderFinances[j],
                            showNoti: false
                        })
                    );
                });
                promises.push(promise);
            }
        }
        return Promise.all(promises)
            .then((res) => {
                // console.log("All promises resolved");
                return res;
            })
            .catch((error) => {
                console.error("Error occurred:", error);
            });
    }
    const chkDIMituDrug = async (selectDrug = [], orderFinances = [], reMed) => {
        await Promise.all(
            selectDrug = reMed ? selectDrug : selectDrug.map(async (val) => {
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            }),
            orderFinances = orderFinances.map(async (val) => {
                let opdFormulaExpensesGeneric = await FindGenericByExpenseId(val.expenseId)
                return {
                    ...val,
                    opdFormulaExpensesGeneric: opdFormulaExpensesGeneric
                }
            })
        )

        const promises = [];

        for (let i = 0; i < selectDrug.length; i++) {
            for (let j = 0; j < orderFinances.length; j++) {
                const promise = new Promise((resolve,) => {
                    resolve(
                        drugInterActionNoti({
                            genericList1: selectDrug[i].opdFormulaExpensesGeneric,
                            genericList2: orderFinances[j].opdFormulaExpensesGeneric,
                            expense1: selectDrug[i],
                            expense2: orderFinances[j]
                        })
                    );
                });
                promises.push(promise);
            }
            orderFinances.push(selectDrug[i])
        }

        return Promise.all(promises)
            .then((res) => {
                console.log("All promises resolved");
                // console.log('chkDIMituDrug', res)
                return res;
            })
            .catch((error) => {
                console.error("Error occurred:", error);
            });
    }
    useEffect(() => {
        getOpdExpenseNamefinancesDrug();
    }, [])
    //แพ้ยา
    const drugAllergyNoti = async (checkDrugAllergyNoti, doctorName, drugGroup, expenseName, genericList, expendId, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = [];
        if (checkDrugAllergyNoti === 1) {
            //Api1 แพ้ยา
            if (genericList?.length > 0) {
                await Promise.all(map(genericList, async o => {
                    const res = await GetOpdChkPatientDrugAllergiesfinancesDrug({ patientId: selectPatient.patientId, generic: o.generic })
                    return res
                })).then((res) => {
                    map(res, o => {
                        if (resData.length) return
                        if (o.length > 0) {
                            resData = o
                        }
                    })
                })
                // for (let i = 0; i < genericList.length; i++) {
                //     if (genericList[i].generic) {
                //         resData = await GetOpdChkPatientDrugAllergiesfinancesDrug({ patientId: selectPatient.patientId, generic: genericList[i].generic });
                //     }
                //     if (resData?.length > 0) {
                //         break;
                //     }
                // }
            }
        }
        if (checkDrugAllergyNoti === 2) {
            //Api2 แพ้กลุ่มยา
            // resData = await GetOpdChkPtDgAdrsfinancesDrug({patientId: "419238", drugGroup: "050108"});
            // console.log(drugGroup);
            if (drugGroup) {
                await Promise.all(map(drugGroup, async o => {
                    const res = await GetOpdChkPtDgAdrsfinancesDrug({ patientId: selectPatient.patientId, drugGroup: o?.drugGroup })
                    return res
                })).then((res) => {
                    map(res, o => {
                        if (resData.length) return
                        if (o.length > 0) {
                            resData = o
                        }
                    })
                })
                // for (let val of drugGroup) {
                //     if (val.drugGroup) {
                //         resData = await GetOpdChkPtDgAdrsfinancesDrug({ patientId: selectPatient.patientId, drugGroup: val?.drugGroup });
                //     }
                //     if (resData?.length > 0) {
                //         break;
                //     }
                // }
            }
        }
        if (checkDrugAllergyNoti === 3) {
            //Api3 แพ้ส่วนประกอบยา
            // resData = await GetOpdChkPatientDrugAllergiesfinancesDrug({patientId: "2021463", expenseid: "28238"});
            resData = await GetOpdChkPatientExpAllerygiesfinancesDrug({ patientId: selectPatient.patientId, expendId: expendId });
        }
        if (resData?.length > 0) {
            const key = `drugAllergy${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert red_border',
                style: {
                    ...notiStyle,
                    ...redNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}>
                            <label style={{ color: "#ff7171", fontSize: 22 }}>
                                {checkDrugAllergyNoti === 1 && "แพ้ยา"}
                                {checkDrugAllergyNoti === 2 && "แพ้กลุ่มยา"}
                                {checkDrugAllergyNoti === 3 && "แพ้ส่วนประกอบยา"}
                            </label>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            {doctorName ? <div>แพทย์ผู้สั่ง {doctorName}</div> : null}
                            <div>ยา {expenseName}</div>
                            <div>ระดับการประเมิน {resData[0]?.alevelName ? resData[0]?.alevelName : "-"}</div>
                            <div>รายละเอียด {resData[0]?.otherSymptom ? resData[0]?.otherSymptom : "-"}</div>
                            <div>อาการ {resData[0]?.symptomName ? resData[0]?.symptomName : "-"}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <RedBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</RedBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ff7272",
                        }}
                    >
                        แพ้ยา
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return resData[0]
            notification.open(args);
            return /* checkDrugAllergyNoti===2 ? */ resData[0] /* : true */;
        }
        return false;
    };
    //ยาที่ทำปฏิกิริยา
    const drugInterActionNoti = async (param) => {
        let { genericList1, genericList2, expense1 = null, expense2 = null, showNoti = true, drugLeft = false } = param;
        let resData = [];
        if (genericList1?.length > 0) {
            if (genericList2?.length > 0) {
                for (let i = 0; i < genericList1.length; i++) {
                    for (let j = 0; j < genericList2.length; j++) {
                        if (genericList1[i].generic && genericList2[j].generic) {
                            resData = await GetOpdDrugInteractionsfinancesDrug({ generic1: genericList1[i].generic, generic2: genericList2[j].generic });
                        }
                        if (resData?.length > 0) {
                            break;
                        }
                    }
                }
            }
        }

        if (resData?.length > 0) {
            const key = `drugInterAction${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert red_border',
                style: {
                    ...notiStyle,
                    ...redNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ff7171", fontSize: 22 }}>DRUG INTERACTION {drugLeft ? "(กับยาที่ผู้ป่วยยังเหลือ)" : ""}</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {resData[0]?.generic1Name} + ยา {resData[0]?.generic2Name}</div>
                            <div>{resData[0]?.diDesc} {resData[0]?.mechanism}</div>
                            <div>Management: {resData[0]?.management}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <RedBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</RedBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ff7272",
                            position: "relative"
                        }}
                    >
                        <Icon icon={testBottle} width="40" height="40" />
                        <div style={{ position: "absolute", height: 10, width: 15, fontSize: 12, marginBottom: 5, marginLeft: 2 }}>DI</div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (expense1 && expense2) {
                if (showNoti) {
                    notification.open(args);
                }
                return {
                    expenseId1: expense1.expenseId,
                    expenseName1: expense1.expenseName,
                    expenseId2: expense2.expenseId,
                    expenseName2: expense2.expenseName,
                    mechanism: resData[0]?.mechanism,
                    lockFlag: resData[0]?.lockFlag,
                };
            } else {
                notification.open(args);
                return true;
            }
        }
        return false;
    };
    //HIGH ALERT DRUG
    const drugHighAlertNoti = async (code, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdHighalertfinancesDrug(code);
        if (toNumber(resData) > 0) {
            const key = `drugHighAlert${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert red_border',
                style: {
                    ...notiStyle,
                    ...redNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ff7171", fontSize: 22 }}>HIGH ALERT DRUG</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            <div>ยา High Alert Drug</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <RedBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</RedBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ff7272",
                        }}
                    >
                        HAD
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //ยากับเพศ
    const drugAndGender = async (code, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdDrugGenderfinancesDrug(code);
        if (resData?.length > 0) {
            const key = `drugAndGender${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert pink_border',
                style: {
                    ...notiStyle,
                    ...pinkNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#fcc3c3", fontSize: 22 }}>ยากับเพศ</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>{resData[0]?.expenseName}</div>
                            <div>ใช้ไม่ได้กับเพศนี้</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <PinkBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</PinkBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#fbcccc",
                            position: "relative"
                        }}
                    >
                        <div style={{ marginLeft: -5 }}>
                            <Icon icon={genderAmbiguous} width="40" height="40" />
                        </div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //ยากับโรค
    const drugAndDiseaseNoti = async (expenseName, genericList, disease, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        // let resData = await GetOpdDrugUnderlyingDiseasesfinancesDrug({ generic: "18", udId: "12" });
        let resData = [];
        if (genericList?.length > 0) {
            await Promise.all(map(genericList, async o => {
                const res = await GetOpdDrugUnderlyingDiseasesfinancesDrug({ generic: o.generic, udId: disease.udId })
                return res
            })).then((res) => {
                map(res, o => {
                    if (resData.length) return
                    if (o.length > 0) {
                        resData = o
                    }
                })
            })
            // for (let i = 0; i < genericList.length; i++) {
            //     if (genericList[i].generic) {
            //         resData = await GetOpdDrugUnderlyingDiseasesfinancesDrug({ generic: genericList[i].generic, udId: disease.udId });
            //     }
            //     if (resData?.length > 0) {
            //         break;
            //     }
            // }
        }
        if (resData?.length > 0) {
            const key = `drugAndDisease${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert pink_border',
                style: {
                    ...notiStyle,
                    ...pinkNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#fcc3c3", fontSize: 22 }}>ยากับโรค {resData[0]?.lockFlag ? "ติดต่อเภสัชเพื่อปลดล็อค" : ""}</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            <div>ผู้ป่วยเป็นโรค {disease?.name}</div>
                            <div>อาการ {resData[0]?.otherSymptom}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <PinkBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</PinkBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#fbcccc",
                            position: "relative"
                        }}
                    >
                        <Icon icon={stethoscopeIcon} width="40" height="40" />
                        <div style={{ position: "absolute", right: 15, top: 10 }}>
                            <Icon icon={pillIcon} width="15" height="20" />
                        </div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return resData
            notification.open(args);
            return resData;
        }
        return false;
    };
    //ยากับอายุ
    const drugAndAgeNoti = async (expenseId, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdChkDrugUsualDosesfinancesDrug(expenseId);
        setDrugUsualDose([...drugUsualDose, ...resData]);
        if (toNumber(patientData?.currentAgeYear) < toNumber(resData[0]?.minAge) || toNumber(resData[0]?.maxAge) < toNumber(patientData?.currentAgeYear)) {
            const key = `drugAndAge${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert pink_border',
                style: {
                    ...notiStyle,
                    ...pinkNoti
                },
                message:
                    <Row>
                        <Col span={8} style={{ paddingRight: 0 }}><label style={{ color: "#fcc3c3", fontSize: 22 }}>ยากับอายุ</label></Col>
                        <Col span={16} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName} อายุ {patientData?.age}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            <div>
                                {toNumber(patientData?.currentAgeYear) < toNumber(resData[0]?.minAge) && "จ่ายให้กับผู้ป่วยที่อายุไม่ถึง " + resData[0]?.minAge + " ปี ไม่ได้"}
                                {toNumber(resData[0]?.maxAge) < toNumber(patientData?.currentAgeYear) && "จ่ายให้กับผู้ป่วยที่อายุเกิน" + resData[0]?.maxAge + " ปี ไม่ได้"}
                            </div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <PinkBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</PinkBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#fbcccc",
                            position: "relative"
                        }}
                    >
                        <Icon icon={reloadIcon} vFlip={true} width="50" height="50" />
                        <div style={{ position: "absolute", fontSize: 10, marginRight: 4 }}>AGE</div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()

            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //ยากับสตรีมีครรภ์ให้นมบุตร
    const drugAndPregnantNoti = async (code, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdPregnancyOrBreastfeedingfinancesDrug(code);
        if (patientData?.pregnancyFlag === "P" && resData?.breastfeeding) {
            const key = `drugAndPregnant${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert pink_border',
                style: {
                    ...notiStyle,
                    ...pinkNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#fcc3c3", fontSize: 22 }}>ยากับสตรีมีครรภ์ให้นมบุตร</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            {/* <div>ผู้ป่วยตั้งครรภ์ไม่สามารถใช้ยา {expenseName} ได้</div> */}
                            <div>ยาเฝ้าระวังในสตรีมีครรภ์ ระดับ {resData?.pregnancy} {resData?.pregnancy === "X" ? "ไม่สามารถจ่ายให้ผู้ป่วยได้" : ""}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <PinkBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</PinkBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#fbcccc",
                        }}
                    >
                        <PregnantWomen width="50" height="50" />
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //OVER DOSE
    const overDrugNoti = async (dose, expenseId, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = [];
        resData = await GetOpdChkDrugUsualDosesfinancesDrug(expenseId);
        if (toNumber(dose) > toNumber(resData[0]?.maxDose)) {
            const key = `overDrug${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert pink_border',
                style: {
                    ...notiStyle,
                    ...pinkNoti
                },
                message:
                    <Row>
                        <Col span={8} style={{ paddingRight: 0 }}><label style={{ color: "#fcc3c3", fontSize: 22 }}>OVER DOSE</label></Col>
                        <Col span={16} style={{ textAlign: "right" }} >
                            <label style={{ fontSize: 12 }}>
                                HN 1502/63 {selectPatient?.hn} {patientData?.displayName}&nbsp;
                                น้ำหนัก {patientData?.lastWeight ? patientData?.lastWeight : patientData?.weight ? patientData?.weight : "-"} kg
                            </label>
                        </Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            <div>สามารถจ่ายได้สูงสุดไม่เกิน {resData[0]?.maxDose} dose/day</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <PinkBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</PinkBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#fbcccc",
                            position: "relative"
                        }}
                    >
                        <Icon icon={bottleTonicOutline} width="50" height="50" />
                        <div style={{ position: "absolute", fontSize: 7, marginTop: 15, marginLeft: 1 }}><b>DOSE</b></div>
                    </div>
                ,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //ยา กับ LAB
    const drugAndLabNoti = async (/*  labDomain, */ genericList, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = [];
        if (genericList?.length > 0) {
            await Promise.all(map(genericList, async o => {
                const res = await GetOpdChkDrugLabCriticalsfinancesDrug({ generic: o.generic, patientId: selectPatient.patientId, })
                return res
            })).then((res) => {
                map(res, o => {
                    if (resData.length) return
                    if (o.length > 0) {
                        resData = o
                    }
                })
            })
            // for (let i = 0; i < genericList.length; i++) {
            //     if (genericList[i].generic) {
            //         resData = await GetOpdChkDrugLabCriticalsfinancesDrug({ generic: genericList[i].generic, patientId: selectPatient.patientId, });
            //     }
            //     if (resData?.length > 0) {
            //         break;
            //     }
            // }
        }
        if (resData?.length > 0) {
            const key = `drugAndLab${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert yellow_border',
                style: {
                    ...notiStyle,
                    ...yellowNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ffab2b", fontSize: 22 }}>ยา กับ LAB</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} >
                            <div>ยา {expenseName}</div>
                            <div>ผู้ป่วยที่มีค่า INR {resData[0]?.criticalTypeDESC}&nbsp;
                                {resData[0]?.criticalTypeDESC === "มากกว่า" ? resData[0]?.maxValue : resData[0]?.minValue}
                            </div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <YellowBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</YellowBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ffab2b",
                        }}
                    >
                        <Icon icon={iLaboratory} hFlip={true} width="35" height="35" />
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //สิทธิ์
    const rightNoti = async (expenseId, expenseName, rightId, reMed) => {
        // console.log('rightId', rightId)
        if (!rightId) return
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        // let resData = await GetOpdchkExpenseRightsPopupTextfinancesDrug({expenseId: "28235", rightId: "53"});
        let resData = await GetOpdchkExpenseRightsPopupTextfinancesDrug({ expenseId: expenseId, rightId: rightId });
        resData = filter(resData, "popupText")
        if (resData?.length > 0) {
            const key = `right${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert yellow_border',
                style: {
                    ...notiStyle,
                    ...yellowNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ffab2b", fontSize: 22 }}>สิทธิ์</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={24} style={{ paddingRight: 40 }}>
                            <div>ยา {expenseName}</div>
                            <div>{resData[0]?.popupText}</div>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ffab2b",
                            position: "relative"
                        }}
                    >
                        <Icon icon={pillIcon} />
                        <div style={{ position: "absolute" }}><Icon icon={stopOutlined} width="40" height="40" /></div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //ยา NED
    const drugNEDNoti = async (code, expenseName, rightId, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData1 = await GetOpdIsedfinancesDrug(code);
        let resData2 = [];
        if (toNumber(resData1) > 0) {
            resData2 = await GetOpdNedfinancesDrug(rightId);
        }
        if (toNumber(resData1) > 0 || toNumber(resData2) > 0) {
            const key = `drugNED${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert blue_border',
                style: {
                    ...notiStyle,
                    ...blueNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#73aaea", fontSize: 22 }}>ยา NED</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={24} style={{ paddingRight: 40 }}>
                            <div>ยา {expenseName}</div>
                            <div>
                                {toNumber(resData1) > 0 && "เป็นยานอกบัญชีหลัก"}
                                {toNumber(resData2) > 0 && "เป็นสิทธิ์ที่ Lock ว่าต้องระบุเหตุผล"}
                            </div>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#bbd9ff",
                        }}
                    >
                        NED
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };
    //จ่ายยาซ้ำซ้อน
    const chkDrugDuplicateNoti = async (expenseId, expenseName, financeId, patientType, checkReMed) => {
        if (prescribeMedicineTemplates === "Y" && checkReMed) return false
        let resData = await GetOpdchkfinancesDrug({ patientId: selectPatient.patientId, expenseId: expenseId, date: moment().format("YYYY-MM-DD") });
        let checkDate = false;
        let startDate = null;
        if (resData?.length > 0) {
            for (const val of resData) {
                if (val?.startDate) {
                    if (val?.endDate) {
                        startDate = moment(val.startDate, "MM/DD/YYYY HH:mm:ss");
                        let endDate = moment(val.endDate, "MM/DD/YYYY HH:mm:ss");
                        if (patientType === "opd") {
                            if (JSON.parse(localStorage.getItem("hos_param"))?.overRuleRepeatDrug) {
                                if (endDate.diff(moment(), "days") + 1 >= JSON.parse(localStorage.getItem("hos_param"))?.overRuleRepeatDrugDay) {
                                    checkDate = true;
                                }
                            } else {
                                if (endDate.diff(moment(), "days") >= 0) {
                                    checkDate = true;
                                }
                            }
                        } else {
                            checkDate = moment().isBetween(startDate, endDate);
                        }
                        if (checkDate && val?.financeId === financeId && checkReMed === false) {
                            checkDate = false;
                        }
                        if (checkDate) {
                            break;
                        }
                    }
                }
            }
        }
        // console.log(checkDate, "checkDate");
        if (checkDate) {
            drugDuplicateNoti(expenseName, startDate);
            return true;
        }
        return false;
    };
    const drugDuplicateNoti = (expenseName, startDate, doNotOrder) => {
        const key = `drugDuplicate${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert blue_border',
            style: {
                ...notiStyle,
                ...blueNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#73aaea", fontSize: 22 }}>จ่ายยาซ้ำซ้อน</label></Col>
                    <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={20} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        {startDate ?
                            <div>ผู้ป่วยได้รับยาเมื่อวันที่ {startDate.format("DD/MM/YYYY")}</div>
                            : null
                        }
                        {doNotOrder ?
                            <label style={{ fontSize: 16, color: "red" }}>ไม่อนุญาติให้สั่ง !</label>
                            : null
                        }
                    </Col>
                    <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                        <BlueBtn type="default" onClick={() => notification.close(key)}>ยืนยัน</BlueBtn>
                    </Col>
                </Row>,
            icon:

                <div
                    style={{
                        ...iconBg,
                        background: "#bbd9ff"
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", zIndex: 0, border: "2px dashed white", width: 20, height: 20, top: -8, left: -8 }}></div>
                        <div style={{ position: "absolute", zIndex: 1, backgroundColor: "#bbd9ff", border: "2px solid white", width: 20, height: 20, top: -15, left: -15 }}></div>
                        <div style={{ position: "absolute", zIndex: 2, top: -19, left: -14 }}><Icon icon={pillIcon} width="18" height="17" /></div>
                    </div>
                </div>
            ,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }
    //ยากับแพทย์ และ ยากับสาขาแพทย์
    const drugAndDoctorNoti = async (expenseId, expenseName, doctorId, quantity, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        const [
            chkDrugAndDoctor,
            chkDrugAndDocSpecialTies,
        ] = await Promise.all([
            GetOpdDrugDoctorsfinancesDrug({ expenseId: expenseId }),
            GetOpdDrugDocSpecialtiesfinancesDrug({ expenseId: expenseId, doctorId: doctorId }),
        ])
        const doctorType = props?.doctorList?.find(val => val.datavalue === doctorId)?.dataother2;
        const expenseDetails = expenseList.find(val => val.expenseId === expenseId)
        if (expenseDetails?.internNotUseFlag === "Y") {
            if (doctorType === "Intern" || doctorType === "Exturn") {
                showNotiDoctor(
                    <>
                        ยากับแพทย์
                    </>
                    ,
                    <>
                        <div>ยา {expenseName}</div>
                        <div>แพทย์ {doctorType} ไม่สามารถสั่งได้</div>
                    </>
                    ,
                    doctorMaleOutline
                )
                return true;
            }
        }
        let orderable = false;
        let findDoctor = false;
        let returnStatus = false;
        if (expenseDetails?.lockDoctorFlag !== "Y") {
            if (chkDrugAndDoctor.length > 0) {
                findDoctor = chkDrugAndDoctor.find(val => val.doctor === doctorId);
                if (toNumber(quantity) <= toNumber(findDoctor?.qty) || quantity === undefined) {
                    orderable = true;
                }
            } else orderable = true;
        } else {
            if (chkDrugAndDoctor.length > 0) {
                findDoctor = chkDrugAndDoctor.find(val => val.doctor === doctorId);
                if (!findDoctor) {
                    showNotiDoctor(
                        <>ยากับแพทย์</>,
                        <>
                            <div>ยา {expenseName}</div>
                            <>
                                <div>แพทย์ {props?.doctorList?.find(val => val.datavalue === doctorId)?.datadisplay}</div>
                                <div>
                                    ไม่อยู่ในรายการแพทย์ที่สามารถสั่งได้ !
                                </div>
                            </>
                        </>
                        ,
                        doctorMaleOutline
                    )
                }
                orderable = true;
            } else orderable = true;
        }
        if (!orderable) {
            showNotiDoctor(
                <>ยากับแพทย์</>,
                <>
                    <div>ยา {expenseName}</div>
                    <>
                        <div>แพทย์ {props?.doctorList?.find(val => val.datavalue === doctorId)?.datadisplay}</div>
                        {findDoctor
                            ? <div>สามารถสั่งยาได้แค่ {findDoctor?.qty} รายการ ต่อ 1 ใบสั่งยา</div>
                            : <Row gutter={[2, 2]}>
                                <Col span={24}>
                                    ไม่สามารถสั่งยาได้
                                </Col>
                                <Col span={24}>
                                    เหตุผล : {expenseDetails?.lockDoctor || "-"}
                                </Col>
                            </Row>
                        }
                    </>
                </>
                ,
                doctorMaleOutline
            )
            returnStatus = true;
        }
        let docSpecialStatus = null;
        if (expenseDetails?.lockPecialtiesFlag === "Y") {
            if (chkDrugAndDocSpecialTies) {
                if (isNaN(toNumber(chkDrugAndDocSpecialTies))) {
                    showNotiDoctor(
                        <>ยากับสาขาแพทย์</>,
                        <>
                            <div>ยา {expenseName}</div>
                            <>
                                <div>สาขาของแพทย์ {props?.doctorList?.find(val => val.datavalue === doctorId)?.datadisplay}</div>
                                <div>
                                    ไม่อยู่ในรายการสาขาแพทย์ที่สามารถสั่งได้ !
                                </div>
                            </>
                        </>
                        ,
                        doctorMaleOutline
                    )
                }
            };
        } else {
            if (chkDrugAndDocSpecialTies) {
                if (isNaN(toNumber(chkDrugAndDocSpecialTies))) {
                    docSpecialStatus = 1;
                } else if (quantity > toNumber(chkDrugAndDocSpecialTies)) {
                    docSpecialStatus = 2;
                } else {
                    docSpecialStatus = null;
                }
            };
        }
        if (chkDrugAndDocSpecialTies && docSpecialStatus) {
            showNotiDoctor(
                <>ยากับสาขาแพทย์</>,
                <>
                    <div>ยา {expenseName}</div>
                    <>
                        {docSpecialStatus === 1
                            ? <Row gutter={[2, 2]}>
                                <Col span={24}>
                                    เป็นยาที่สาขาของแพทย์คนนี้สั่งไม่ได้
                                </Col>
                                <Col span={24}>
                                    เหตุผล : {expenseDetails?.lockSpecialties || "-"}
                                </Col>
                            </Row>
                            :
                            <div>สามารถสั่งยาได้แค่ {chkDrugAndDocSpecialTies} รายการ ต่อ 1 ใบสั่งยา</div>
                        }
                    </>
                </>
                ,
                doctorMaleOutline
            )
            returnStatus = true;
        }
        return returnStatus;
    };
    const showNotiDoctor = (message, description, icon) => {
        const key = `drugAndDoctor${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert blue_border',
            style: {
                ...notiStyle,
                ...blueNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}>
                        <label style={{ color: "#73aaea", fontSize: 22 }}>
                            {message}
                        </label>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        {description}
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#bbd9ff",
                        position: "relative"
                    }}
                >
                    <Icon icon={icon} /* height="15" width="15" */ />
                    <div style={{ position: "absolute" }}><Icon icon={stopOutlined} width="40" height="40" /></div>
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }
    //ยากับหน่วยงาน
    const chkDrugWork = async (expenseId, expenseName, workId, quantity, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetExpenseWorkPlacesfinancesDrug({ expenseId: expenseId, workId: workId });
        let statusOrderable = null;
        if (resData) {
            if (isNaN(toNumber(resData))) {
                statusOrderable = 1;
            } else if (quantity > toNumber(resData)) {
                statusOrderable = 2;
            } else {
                statusOrderable = null;
            }
        }
        if (statusOrderable) {
            showNotiDoctor(
                <>
                    ยากับหน่วยงาน
                </>
                ,
                <>
                    <div>ยา {expenseName}</div>
                    <div>ห้องตรวจ {props?.workList?.find(val => val?.workId === workId)?.workName}</div>
                    {statusOrderable === 1 ?
                        <div>ไม่สามารถสั่งยาได้</div>
                        :
                        <div>สามารถสั่งยาได้แค่ {resData} รายการ ต่อ 1 ใบสั่งยา</div>
                    }
                </>
                ,
                // doctorMaleOutline// meetingRoomRounded
                conferenceRoom20Regular
            )
            return true;
        }
        return false;
    }
    //ยากับ STOCK
    const drugAndStockNoti = async (expenseName, goodsId, quantity, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = [];
        if (goodsId) {
            // resData = await GetOpdInventoriesfinancesDrug("2458");
            resData = await GetOpdInventoriesfinancesDrug(goodsId);
        }
        if (toNumber(quantity) > toNumber(resData[0]?.quantity)) {
            const key = `drugAndStock${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert blue_border',
                style: {
                    ...notiStyle,
                    ...blueNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#73aaea", fontSize: 22 }}>ยากับ STOCK</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={24} style={{ paddingRight: 40 }}>
                            <div>ยา {expenseName}</div>
                            <div>จำนวนในคลังเหลือ {parseInt(resData[0]?.quantity)} ไม่พอจ่าย</div>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#bbd9ff",
                        }}
                    >
                        <div style={{ overflow: "hidden", height: 35 }}><Icon icon={stockIcon} width="40" height="40" /></div>
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return true
            notification.open(args);
            return true;
        }
        return false;
    };

    //ยา DUE
    const drugDUENoti = async (expenseId, expenseName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdchkExpensefinancesDrug(expenseId);
        if (resData[0]?.dueReport) {
            const key = `drugDUE${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert blue_border',
                style: {
                    ...notiStyle,
                    ...blueNoti
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#73aaea", fontSize: 22 }}>ยา DUE</label></Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={20} style={{ paddingRight: 40 }}>
                            <div>ยา {expenseName}</div>
                            <div>{resData[0]?.dueReport}</div>
                        </Col>
                        <Col span={4} style={{ textAlign: "right", paddingLeft: 0 }}>
                            <BlueBtn type="default" onClick={() => notification.destroy()}>ยืนยัน</BlueBtn>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#bbd9ff",
                        }}
                    >
                        DUE
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            if (prescribeMedicineTemplates === "Y" && reMed) return resData[0]
            notification.open(args);
            return resData[0];
        }
        return resData[0];
    };

    //POPUP TEXT
    const popupText = (title, content, background = "#bbd9ff", color = "#73aaea") => {
        const key = `popupText${Date.now()}`;
        const args = {
            // placement,
            key,
            className: background === "#bbd9ff" ? 'drugAlert blue_border' : "drugAlert orange_border",
            style: background === "#bbd9ff" ?
                {
                    ...notiStyle,
                    ...popupTextNoti
                }
                :
                {
                    ...notiStyle,
                    ...orangeNoti
                },
            message:
                <Row>
                    <Col span={24} style={{ paddingRight: 0 }}><label style={{ color: color, fontSize: 22 }}>{/* POPUP TEXT */}{title}</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        {content}
                        {/* <div>ยา XXXXXXXXXXXXXXX</div>
                        <div>เป็นยา DUE ที่ต้องทำแบบประเมิน</div> */}
                    </Col>
                </Row>,
            icon:

                <div
                    style={{
                        ...iconBg,
                        background: background,
                        position: "relative"
                    }}
                >
                    {/* <div style={{ position: "relative" }}> */}
                    <div style={{ position: "absolute", zIndex: 0, border: "2px solid white", width: 35, height: 35 }}></div>
                    <div style={{ position: "absolute", zIndex: 1, border: "2px solid white", width: 35, height: 30, marginTop: 7 }}></div>
                    <div style={{ position: "absolute", zIndex: 2, top: 22 }}><Icon icon={cardText} /></div>
                    {/* </div> */}
                </div>
            ,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    };

    //DRUG WARNING
    const drugWarninng = (expenseName, msg, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        const key = `drugWarninng${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert blue_border',
            style: {
                ...notiStyle,
                ...popupTextNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#73aaea", fontSize: 22 }}>DRUG WARNING</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        <div>{msg}</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#bbd9ff",
                        position: "relative"
                    }}
                >
                    <div style={{ position: "absolute", zIndex: 0, border: "2px solid white", width: 35, height: 35 }}></div>
                    <div style={{ position: "absolute", zIndex: 1, border: "2px solid white", width: 35, height: 30, marginTop: 7 }}></div>
                    <div style={{ position: "absolute", zIndex: 2, top: 22 }}><Icon icon={cardText} /></div>
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        if (prescribeMedicineTemplates === "Y" && reMed) return true
        notification.open(args);
        return true;
    }

    //ยาราคาแพง
    const drugExpensive = (expenseName) => {
        const key = `drugExpensive${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert',
            style: {
                ...notiStyle,
                ...newYellowNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#d0d016", fontSize: 22 }}>ยาราคาแพง</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        <div>เป็นยาที่มีราคาแพง</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#d0d016",
                        color: "white",
                        fontSize: 18
                    }}
                >
                    PRICE
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }

    //ยาเสพติด
    const drugNarotic = (expenseName) => {
        const key = `drugNarotic${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert',
            style: {
                ...notiStyle,
                ...redNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ff7171", fontSize: 22 }}>ยาเสพติด</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        <div>เป็นยาเสพติด</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#ff7272",
                        color: "white",
                        fontSize: 10
                    }}
                >
                    NAROTICS
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }

    //ยาอันตราย
    const drugDanger = (expenseName) => {
        const key = `drugDanger${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert',
            style: {
                ...notiStyle,
                ...redNoti
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ff7171", fontSize: 22 }}>ยาอันตราย</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        <div>เป็นยาอันตราย</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#ff7272",
                        fontSize: 36
                    }}
                >
                    <WarningOutlined style={{ color: "white" }} />
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }

    //ยาละลายลิ่มเลือด
    const drugBlood = (expenseName) => {
        const key = `drugBlood${Date.now()}`;
        const args = {
            // placement,
            key,
            className: 'drugAlert',
            style: {
                ...notiStyle,
                ...redNoti,
                backgroundColor: "#f7f4f4",
            },
            message:
                <Row>
                    <Col span={12} style={{ paddingRight: 0 }}><label style={{ color: "#ff7171", fontSize: 22 }}>ยาละลายลิ่มเลือด</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName}</div>
                        <div>เป็นยาละลายลิ่มเลือด</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        background: "#ff7272",
                    }}
                >
                    <Icon icon={waterIcon} color="#b70505" width="50" height="50" />
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }

    //ยาที่ต้องมีรายเซ็นต์แพทย์กำกับ
    const signatureDrug = (expenseName) => {
        const key = `signatureDrug${Date.now()}`;
        const args = {
            // placement,
            key,
            className: "drugAlert",
            style: {
                ...notiStyle,
                ...signatureDrugNoti
            },
            message:
                <Row>
                    <Col span={24} style={{ paddingRight: 0 }}><label style={{ color: "var(--primary-color)", fontSize: 22 }}>ยาที่ต้องมีรายเซ็นต์แพทย์กำกับ</label></Col>
                </Row>,
            description:
                <Row align="bottom">
                    <Col span={24} style={{ paddingRight: 40 }}>
                        <div>ยา {expenseName} เป็นยาที่ต้องมีรายเซ็นต์แพทย์กำกับ</div>
                    </Col>
                </Row>,
            icon:
                <div
                    style={{
                        ...iconBg,
                        // background: "#ff7272",
                    }}
                >
                    <Icon icon={signatureLight} color="var(--primary-color)" width="50" height="50" />
                </div>,
            duration: 0,
            onClose: () => notification.destroy()
        };
        notification.open(args);
    }

    //แพ้ยาข้ามกลุ่ม
    const allerygiesDrugAcross = async (expenseId, expenseName, doctorName, reMed) => {
        if (prescribeMedicineTemplates === "Y" && reMed) return false
        let resData = await GetOpdChkPatientExpAllerygiesDrugAcross(selectPatient.patientId, expenseId);
        if (resData?.length > 0) {
            const key = `allerygiesDrugAcross${Date.now()}`;
            const args = {
                // placement,
                key,
                className: 'drugAlert',
                style: {
                    ...notiStyle,
                    ...redNoti,
                    // backgroundColor: "#f7f4f4",
                },
                message:
                    <Row>
                        <Col span={12} style={{ paddingRight: 0 }}>
                            <label style={{ color: "#ff7171", fontSize: 22 }}>
                                {resData[0]?.riskAdr === "R" ? "มีโอกาศแพ้ข้ามกันสูง ควรหลีกเลียงการใช้"
                                    : resData[0]?.riskAdr === "R1" ? "มีโอกาสแพ้ข้ามกันน้อยกว่า แต่ถ้าไม่จำเป็นแนะนำให้ใช้ยาอื่นก่อน"
                                        : "มีโอกาสแพ้ข้ามการค่อนข้างน้อย แต่ไม่จำเป็นแนะนำให้ใช้ยาอื่นก่อน"
                                }
                            </label>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }} ><label style={{ fontSize: 12 }}>HN {selectPatient?.hn} {patientData?.displayName}</label></Col>
                    </Row>,
                description:
                    <Row align="bottom">
                        <Col span={24} style={{ paddingRight: 40 }}>
                            <div>แพทย์ผู้สั่ง {doctorName}</div>
                            <div>ยา {expenseName}</div>
                        </Col>
                    </Row>,
                icon:
                    <div
                        style={{
                            ...iconBg,
                            background: "#ff7272",
                        }}
                    >
                        {resData[0]?.riskAdr}
                        {/* <Icon icon={waterIcon} color="#b70505" width="50" height="50" /> */}
                    </div>,
                duration: 0,
                onClose: () => notification.destroy()
            };
            notification.open(args);
            return true;
        }
        return false;
    }
    return false;
})
const fetchError = (msg, noti) => {
    const { setVisibleNoti, setMsgNoti } = noti;
    setMsgNoti(msg);
    setVisibleNoti(true);
}
const chkUser = async (user, noti, fetchSuccess = () => { }) => {
    await httpPanaceas
        .post("User/GetAuthenticate", { ...user })
        .then(async ({ data }) => {
            console.log("data", user);
            console.log("data", data);
            if (!data) {
                return fetchError("Server ขัดข้อง", noti);
            }
            if (data.responseData === null) {
                return fetchError("username หรือ password ไม่ถูกต้อง", noti);
            }
            if (data.responseData.cancelFlag === "Y") {
                return fetchError("รหัสนี้ถูกยกเลิกแล้ว", noti);
            }
            if (data.responseData === null) {
                return fetchError("username หรือ password ไม่ถูกต้อง", noti);
            }
            if (user.userId !== "poweruser") {
                if (data.responseData.isExpireDate !== "0") {
                    return fetchError("user นี้หมดอายุ", noti);
                }
                if (
                    data.responseData.isPasswordDate
                        ? data.responseData.isPasswordDate !== "0"
                        : false
                ) {
                    return fetchError("password หมดอายุ", noti);
                }
            }
            if (
                data.isSuccess &&
                data.responseData.isExpireDate === "0" &&
                data.responseData.cancelFlag === null
            ) {
                console.log(fetchSuccess, "fetchSuccess");
                fetchSuccess(data.responseData?.userId);
            }
        })
        .catch(function (error) {
            fetchError(error.message, noti);
        });
}
export const ModalNoti = ({ visible, setVisible, msgNoti }) => {
    return (
        <Modal
            centered
            visible={visible}
            width={600}
            onCancel={() => setVisible(false)}
            closable={false}
            footer={false}
        >
            <Row gutter={[16, 16]}>
                <Col span={24} style={{ textAlign: "center", color: "red" }}>
                    <label style={{ fontSize: 30 }}><CloseCircleOutlined /* height={40} width={40} */ /></label>
                </Col>
                <Col span={24} style={{ textAlign: "center" }}>
                    <label className="data-value">{msgNoti}</label>
                </Col>
                <Col span={24} style={{ textAlign: "center" }}>
                    <Button
                        type="primary"
                        style={{ marginBottom: 0 }}
                        onClick={() => {
                            setVisible(false);
                        }}
                    >
                        ปิด
                    </Button>
                </Col>
            </Row>
        </Modal>
    )
}
export const DrugReasonModal = ({ visible, setVisible, insertFinanceInTable = () => { } }) => {
    const [visibleNoti, setVisibleNoti] = useState(false);
    const [msgNoti, setMsgNoti] = useState("");
    const [form] = Form.useForm();

    const onFinish = (param) => {
        let valuesFormat = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                userId: param?.userAdr,
                password: param?.password,
                // loginType: loginType === "Y" ? 1 : null
            },
            barcode: null,
        };
        chkUser(
            valuesFormat,
            { setVisibleNoti: setVisibleNoti, setMsgNoti: setMsgNoti },
            (userId) => {
                insertFinanceInTable(param?.adrReason, userId);
                setVisible(false);
            }
        );

    }

    return (
        <>
            <Modal
                centered
                visible={visible}
                title={<label className='topic-green-bold'>ระบุเหตุผลในการสั่งยาDrug Interaction</label>}
                width={1200}
                onCancel={() => setVisible(false)}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={() => setVisible(false)}>ออก</Button>
                        <Button type="primary" key="ok" onClick={() => form.submit()}>ตกลง</Button>
                    </Row>
                ]}
            >
                <Form form={form} layout='vertical' onFinish={onFinish}>
                    <Row style={{ flexDirection: "row" }}>
                        <Col span={12}>
                            <Form.Item
                                label={<label className="gx-text-primary">Username</label>}
                                name="userAdr"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={<label className="gx-text-primary">Password</label>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={<label className="gx-text-primary">เหตุผล</label>}
                                name="adrReason"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            {visibleNoti ?
                <ModalNoti
                    visible={visibleNoti}
                    setVisible={setVisibleNoti}
                    msgNoti={msgNoti}
                />
                : null
            }
        </>
    )
}
export const DrugDiseaseModal = ({ visible, setVisible, insertFinanceInTable = () => { }, setChkDrugDisease = () => { }, chkdrugDisease,
    dispatchDrugDiseaseList, chkDrugDiseaseinsertMuti, setChkDrugDiseaseinsertMuti = () => { }, insertMutiFinanceInTable = () => { } }) => {
    const [visibleNoti, setVisibleNoti] = useState(false);
    const [msgNoti, setMsgNoti] = useState("");
    const [form] = Form.useForm();

    const closeDiseaseModal = () => {
        setChkDrugDisease(false);
        setChkDrugDiseaseinsertMuti(false);
        dispatchDrugDiseaseList({ type: "clear" });
        setVisible(false);
    }

    const onFinish = (param) => {
        const userFromSession = JSON.parse(sessionStorage.getItem('user'));
        let user = userFromSession.responseData.userId;
        let valuesFormat = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                userId: user,
                password: param?.password,
                // loginType: loginType === "Y" ? 1 : null
            },
            barcode: null,
        };
        chkUser(
            valuesFormat,
            { setVisibleNoti: setVisibleNoti, setMsgNoti: setMsgNoti },
            () => {
                console.log("chkDrugDiseaseinsertMuti", chkDrugDiseaseinsertMuti,);
                if (chkDrugDiseaseinsertMuti) {
                    insertMutiFinanceInTable();
                } else {
                    insertFinanceInTable();
                }
                setVisible(false);
            }
        );
    }

    return (
        <>
            <Modal
                centered
                visible={visible}
                title={<label className='topic-green-bold'>เป็นยาที่มีการระบุไว้กับโรคกรุณาใส่รหัสผ่าน</label>}
                width={1200}
                onCancel={() => closeDiseaseModal()}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={() => closeDiseaseModal()}>ออก</Button>
                        <Button type="primary" key="ok" onClick={() => form.submit()}>ตกลง</Button>
                    </Row>
                ]}
            >
                <Form form={form} layout='vertical' onFinish={onFinish}>
                    <Row style={{ flexDirection: "row" }}>
                        <Col span={24}>
                            <Form.Item
                                label={<label className="gx-text-primary">Password</label>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            {visibleNoti ?
                <ModalNoti
                    visible={visibleNoti}
                    setVisible={setVisibleNoti}
                    msgNoti={msgNoti}
                />
                : null
            }
        </>
    )
}
export const DrugAcceptModal = (props) => {
    let {
        visible,
        setVisible,
        manageAcceptCase,
        setLoading = () => { }
    } = props;
    const [visibleNoti, setVisibleNoti] = useState(false);
    const [msgNoti, setMsgNoti] = useState("");
    const [form] = Form.useForm();

    const closeAcceptModal = () => {
        setVisible(false);
        setLoading(false);
    }

    const fetchSuccess = () => {
        setVisible(false);
        manageAcceptCase();
    }

    const onFinish = (param) => {
        let valuesFormat = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                userId: param?.userAdr,
                password: param?.password,
                // loginType: loginType === "Y" ? 1 : null
            },
            barcode: null,
        };
        console.log(valuesFormat, "valuesFormat");
        chkUser(
            valuesFormat,
            { setVisibleNoti: setVisibleNoti, setMsgNoti: setMsgNoti },
            fetchSuccess
        );
    }

    return (
        <>
            <Modal
                centered
                visible={visible}
                // title={<label className='topic-green-bold'>ระบุเหตุผลในการสั่งยาที่แพ้ หรือ Drug Interaction</label>}
                width={1200}
                onCancel={closeAcceptModal}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={closeAcceptModal}>ยกเลิก</Button>
                        <Button type="primary" key="ok" onClick={() => form.submit()}>ยินยัน</Button>
                    </Row>
                ]}
            >
                <Form form={form} layout='vertical' onFinish={onFinish}>
                    <Row style={{ flexDirection: "row" }}>
                        <Col span={24}>
                            <Form.Item
                                label={<label className="gx-text-primary">Username</label>}
                                name="userAdr"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={<label className="gx-text-primary">Password</label>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            {visibleNoti ?
                <ModalNoti
                    visible={visibleNoti}
                    setVisible={setVisibleNoti}
                    msgNoti={msgNoti}
                />
                : null
            }
        </>
    )
}
const { TextArea } = Input;
export const DrugAllergyModal = ({ visible, setVisible, order, accept = () => { } }) => {
    const [visibleNoti, setVisibleNoti] = useState(false);
    const [msgNoti, setMsgNoti] = useState("");
    const [form] = Form.useForm();

    const closeAcceptModal = () => {
        setVisible(false);
    }
    const onFinish = (param) => {
        let valuesFormat = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                userId: param?.userAdr,
                password: param?.password,
                // loginType: loginType === "Y" ? 1 : null
            },
            barcode: null,
        };
        chkUser(
            valuesFormat,
            { setVisibleNoti: setVisibleNoti, setMsgNoti: setMsgNoti },
            (userId) => {
                accept(param?.adrReason, userId);
                setVisible(false);
            }
        );

    }

    return (
        <>
            <Modal
                centered
                visible={visible}
                title={<label className='topic-green-bold'>พบยาที่ผู้ป่วยแพ้ ดังนี้</label>}
                width={1200}
                bodyStyle={{ height: "35vh" }}
                onCancel={closeAcceptModal}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={closeAcceptModal}>ยกเลิก</Button>
                        <Button type="primary" key="ok" onClick={() => form.submit()}>ยินยัน</Button>
                    </Row>
                ]}
            >
                <Row align='middle'>
                    <Col span={12}>
                        <DivScrollY height="25vh">
                            <List
                                itemLayout="horizontal"
                                dataSource={order}
                                renderItem={(item,) => {
                                    console.log(item, "item");
                                    return (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<>{item.expenseName}</>}
                                                description={
                                                    <div style={{ paddingLeft: 5, color: "#c2d5bb" }}>
                                                        {item?.docLabel1 ? item?.docLabel1 + " , " : null}
                                                        {item?.docLabel2 ? item?.docLabel2 + " , " : null}
                                                        {item?.docLabel3 ? item?.docLabel3 + " , " : null}
                                                        {item?.docLabel4 ? item?.docLabel4 + " , " : null}
                                                        {item.drugLabelName}
                                                    </div>
                                                }
                                            />
                                            <div>{item.quantity}</div>
                                        </List.Item>
                                    )
                                }
                                }
                            />
                        </DivScrollY>
                    </Col>
                    <Col span={12}>
                        <Form form={form} layout='vertical' onFinish={onFinish}>
                            <Row gutter={[16, 16]} style={{ flexDirection: "row" }}>
                                <Col span={24}>
                                    <Form.Item
                                        name="adrReason"
                                        label={<label className="gx-text-primary">เหตุผลการสั่ง</label>}
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<label className="gx-text-primary">Username</label>}
                                        name="userAdr"
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<label className="gx-text-primary">Password</label>}
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Modal>
            {visibleNoti ?
                <ModalNoti
                    visible={visibleNoti}
                    setVisible={setVisibleNoti}
                    msgNoti={msgNoti}
                />
                : null
            }
        </>
    )
}
export const DrugCodeAdrs = ({ visible, setVisible, order, accept = () => { } }) => {
    const [visibleNoti, setVisibleNoti] = useState(false);
    const [msgNoti, setMsgNoti] = useState("");
    const [form] = Form.useForm();
    const closeAcceptModal = () => setVisible(false);
    const onFinish = (param) => {
        const valuesFormat = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                userId: param?.userAdr,
                password: param?.password,
            },
            barcode: null,
        };
        chkUser(
            valuesFormat,
            { setVisibleNoti: setVisibleNoti, setMsgNoti: setMsgNoti },
            (userId) => {
                accept(param?.adrReason, userId);
                setVisible(false);
            }
        );

    }
    return (
        <>
            <Modal
                centered
                visible={visible}
                title={<label className='topic-green-bold'>ยืนยันการสั่งรายการที่ผู้ป่วยแพ้ Code ยา</label>}
                width={1200}
                bodyStyle={{ height: "35vh" }}
                onCancel={closeAcceptModal}
                closable={false}
                footer={[
                    <Row justify="center" key="footer">
                        <Button key="cancel" onClick={closeAcceptModal}>ยกเลิก</Button>
                        <Button type="primary" key="ok" onClick={() => form.submit()}>ยินยัน</Button>
                    </Row>
                ]}
            >
                <Row align='middle'>
                    <Col span={12}>
                        <DivScrollY height="25vh">
                            <List
                                itemLayout="horizontal"
                                dataSource={order}
                                renderItem={(item,) => {
                                    console.log(item, "item");
                                    return (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<>{item.expenseName}</>}
                                                description={
                                                    <div style={{ paddingLeft: 5, color: "#c2d5bb" }}>
                                                        {item?.docLabel1 ? item?.docLabel1 + " , " : null}
                                                        {item?.docLabel2 ? item?.docLabel2 + " , " : null}
                                                        {item?.docLabel3 ? item?.docLabel3 + " , " : null}
                                                        {item?.docLabel4 ? item?.docLabel4 + " , " : null}
                                                        {item.drugLabelName}
                                                    </div>
                                                }
                                            />
                                            <div>{item.quantity}</div>
                                        </List.Item>
                                    )
                                }
                                }
                            />
                        </DivScrollY>
                    </Col>
                    <Col span={12}>
                        <Form form={form} layout='vertical' onFinish={onFinish}>
                            <Row gutter={[16, 16]} style={{ flexDirection: "row" }}>
                                <Col span={24}>
                                    <Form.Item
                                        name="adrReason"
                                        label={<label className="gx-text-primary">เหตุผลการสั่ง</label>}
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<label className="gx-text-primary">Username</label>}
                                        name="userAdr"
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={<label className="gx-text-primary">Password</label>}
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: "ระบุ"
                                            }
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Modal>
            {visibleNoti ?
                <ModalNoti
                    visible={visibleNoti}
                    setVisible={setVisibleNoti}
                    msgNoti={msgNoti}
                />
                : null
            }
        </>
    )
}
const PregnantWomen = (props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512" {...props}><path fill="currentColor" d="M224 144a64 64 0 1 0-64-64a64.072 64.072 0 0 0 64 64m0-96a32 32 0 1 1-32 32a32.036 32.036 0 0 1 32-32m129.959 203.37c-15.021-16.9-35.063-27.659-62.61-33.506L266.551 160h-88.428L152 342.863V400h56v96h96v-96h80v-48c0-44.972-9.826-77.888-30.041-100.63M352 368h-80v96h-32v-96h-56v-22.863L205.877 192h39.572l23.291 54.344l8.629 1.438c24.5 4.083 41.233 11.979 52.672 24.848C344.817 289.253 352 315.215 352 352Z"></path></svg>
    )
}