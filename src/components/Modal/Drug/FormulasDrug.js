import { env } from '../../../env.js';
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useContext } from 'react';
import { Row, Col, Button, Table, Input, Modal, Checkbox, Form, Radio, Select, InputNumber, Popconfirm, Divider, Spin } from 'antd';
import Column from 'antd/lib/table/Column';
import axios from "axios";
import {find , toNumber , isArray , differenceBy ,map ,cloneDeep} from "lodash";
import styled from "styled-components";
import { CheckOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FaRegEdit } from 'react-icons/fa';
import { nanoid } from 'nanoid';
import Notifications from '../Notifications';
import { useSelector } from "react-redux";
import SelectDrugName, { getDrugExpenseList } from 'components/helper/SelectDrugName';
import SelectSearchBold from 'components/Drug/SelectSearchBold';
//Context
import { DropdownPrescription } from "routes/OpdClinic/Views/OpdDrugCharge";
import {
  GetOpdDrugUsingsFinancesDrugDisplay,
  GetOpdDrugWarningsFinancesDrugDisplay,
  GetOpdDrugTimingsFinancesDrugDisplay,
  GetOpdDrugPropertiesFinancesDrugDisplay,
  // GetOpdDrugLabelsFinancesDrugDisplay,
  GetOpdDrugAdminsFinancesDrugDisplay,
  GetOpdDosingUnitsFinancesDrugDisplay,
  GetDosingTime, GetNewDosingInterval,
  GetIsedReasons, GetOpdDosingTextfinancesDrug,
  apis
} from "routes/OpdClinic/API/OpdDrugChargeApi";
import {
  GetDrugLabels, InsDrugLabels, UpdDrugLabels,
  InsDrugFormulas, GetFormulaExpensesbyFormulaId,
  GetDropdown, InsListFormulaExpenses, UpdOrderFormulas,
  UpdListFormulaExpenses, DelListFormulaExpenses,
  DelListFormulas, ChkDupFormulaName
} from "./Api/FormulasDrugApi";
import { ShowDrugLabel, drugLabelFunc, dosingIntervalLabel } from '../../helper/DrugCalculatOrder';
// import moment from 'moment';
import dayjs from "dayjs";
import SelectDosingInterval from "../../Drug/SelectDosingInterval";
import { useExpenseListContext } from "routes/OpdClinic/Views/OpdDrugCharge";
import { checkNED, calculatDayOrDrug as funcCalculatDayOrDrug } from 'components/helper/DrugCalculatOrder';
import { toast } from "react-toastify";
import { toastTopRight } from 'components/Notification/toast.js';
import { callApis } from '../../helper/function/CallApi.js';
import { mappingOptions } from "components/helper/function/MappingOptions";
import ChkDrugConditionsV2 from "components/helper/function/drugs/ChkDrugConditionsV2.js"
import SelectDrugLabel from 'components/Input/SelectDrugLabel'
import SelectMasterIcd10 from 'components/Input/SelectMasterIcd10'
import PrevDrugUsing from 'components/Drug/PrevDrugUsing.js'

const { Option } = Select

const TableStyle = styled(Table)`
    th > div.ant-table-selection{
        display: ${props => props.selectAll ? "inline" : "none"};
    }
`;
const InputNumberStyle = styled(InputNumber)`
    margin-right: 0;
    width: 100% !important;
    .ant-input-number-input {
        text-align: ${props => props.text};
    }
`;
const AddOrder = forwardRef(function AddOrder({
  addOrder,
  editOrder,
  optionsConvertDose = [],
}, ref) {
  const dropdownPrescription = useContext(DropdownPrescription);
  const [addOrderVisible, setAddOrderVisible] = useState(false);
  const [addOrderForm] = Form.useForm();
  // Watch
  const profiletype = Form.useWatch("profiletype", addOrderForm)
  const prevDrugUsing = Form.useWatch('prevDrugUsing', addOrderForm);
  // console.log('prevDrugUsing', prevDrugUsing)
  const [drugUse, setDrugUse] = useState("A");
  const [prevFormValues, setPrevFormValues] = useState(null);
  const [resetPrevDrugUsingForm, setResetPrevDrugUsingForm] = useState(false);
  const [expenseList, setExpenseList] = useState([]);
  const [expenseId, setExpenseId] = useState(undefined);
  const [drugUsingLabel, setDrugUsingLabel] = useState({}); //วิธีใช้ยา
  console.log('drugUsingLabel', drugUsingLabel)
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
  const [multiply, setMultiply] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const selectDrugNameRef = useRef(null);
  const [ised, setIsed] = useState(null);
  const [isedReason, setIsedReason] = useState([]); //เหตุผลการใช้ยานอกบัญชีฯ
  const [optionsProfileType, setOptionsProfileType] = useState([])
  //เปลี่ยน Modal จาก Create เป็น Edit
  const [checkOrderEdit, setCheckOrderEdit] = useState(false);
  const [formulaExpId, setFormulaExpId] = useState(null);
  const [newDrug, setNewDrug] = useState(1);
  const selectDosingIntervalRef = useRef(null);
  const alternateDayRef = useRef(null);
  const otherDosingIntervalRef = useRef(null);
  useImperativeHandle(ref, () => ({
    setAddOrderVisible: props => setAddOrderVisible(props),
    setExpenseId: props => setExpenseId(props),
    setDrugUse: props => setDrugUse(props),
    addOrderForm: () => addOrderForm,
    setDosingInterval: props => setTimeout(() => {
      selectDosingIntervalRef.current.setDosingInterval(props);
    }, 1),
    setCheckOrderEdit: props => setCheckOrderEdit(props),
    changeDosingInterval: props => changeDosingInterval(props),
    setNewDrugUsingLabel: (props, dose) => setNewDrugUsingLabel(props, dose),
    setFormulaExpId: props => setFormulaExpId(props)
  }));
  const getOpdDosingTextfinancesDrug = async (dose, field) => {
    // หาค่า mutiply ของ dose
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
  };
  const getDropdownPrescription = async () => {
    if (dropdownPrescription?.getDropdownPrescription) {
      // console.log('dropdownPrescription', dropdownPrescription)
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
      //เหตุผลการใช้ยานอกบัญชี
      setIsedReason(dropdownPrescription.isedReason);
    } else {
      await axios.all([GetOpdDrugUsingsFinancesDrugDisplay(), GetOpdDosingUnitsFinancesDrugDisplay(), GetOpdDrugTimingsFinancesDrugDisplay(), GetDosingTime(),
      // GetDosingInterval(),
      GetNewDosingInterval(), GetOpdDrugPropertiesFinancesDrugDisplay(), GetOpdDrugWarningsFinancesDrugDisplay(), GetOpdDrugAdminsFinancesDrugDisplay(),
      GetIsedReasons()]).then(resData => {
        // console.log(resData, "resData");
        let funcList = [setDrugUsingList, setUnitList, setDrugTimingList, setDosingTime, setDosingInterval, setDrugProperty, setDrugWarning, setDrugAdmin, setIsedReason];
        for (let i = 0; i < resData.length; i++) {
          // console.log(funcList[i], "funcList");
          funcList[i](resData[i]);
        }
      }).catch(error => {
        // console.log(error);
        return error;
      });
    }
  };
  const getProfileTypeMas = async () => {
    let res = await callApis(apis["GetProfileTypeMas"])
    res = mappingOptions({ dts: res })
    setOptionsProfileType(res)
  }

  //Func.
  const getExpenseList = async () => {
    let resData = await getDrugExpenseList("DM", "N");
    setExpenseList(resData);
  };
  const setNewDrugUsingLabel = async (select, dose) => {
    // console.log(select);
    let drugTiming = drugTimingList.find(val => val.code === select?.drugTiming);
    let doseLabel = await getOpdDosingTextfinancesDrug(dose);
    if (drugTiming?.frequency !== "" && drugTiming?.frequency) {
      setFrequency(toNumber(drugTiming?.frequency));
    }
    // console.log(select,"select");
    setDrugUsingLabel({
      drugUsing: drugUsingList?.find(val => val.code === select?.drugUsing)?.name,
      dose: doseLabel ? doseLabel : dose,
      dosingUnit: unitList?.find(val => val.code === select?.dosingUnit)?.name,
      drugTiming: drugTiming?.name,
      dosingTime: dosingTime?.find(val => val.datavalue === select?.dosingTime)?.datadisplay,
      // dosingInterval: dosingInterval.find(val=>val.datavalue===select.dosingInterval)?.datadisplay,

      // dosingInterval: dosingIntervalLabel(select?.dosingInterval ? select.dosingInterval.split(',') : []),
      dosingInterval: dosingIntervalLabel(select?.dosingInterval, dosingInterval),
      drugProperty: drugProperty?.find(val => val.code === select?.drugProperty)?.name,
      drugWarning: drugWarning?.find(val => val.code === select?.drugWarning)?.name,
      alternateDay: select?.alternateDay,
      otherDosingInterval: select?.otherDosingInterval,
      drugAdmin: drugAdmin?.find(val => val.code === select?.drugWarning)?.name,
      docRemark: select?.docRemark,
      docLabel1: select?.docLabel1,
      docLabel2: select?.docLabel2,
      docLabel3: select?.docLabel3,
      docLabel4: select?.docLabel4,
      moriningDose: select?.doseM,
      middayDose: select?.doseL,
      afternoonDose: select?.doseN,
      eveningDose: select?.doseE,
      beforeBedDose: select?.doseB
    });
  };
  const calculatDayOrDrug = (value, field,) => {
    const dosingUnit = addOrderForm.getFieldValue("dosingUnit")
    const findTabletFlag = find(unitList, ["code", dosingUnit])
    const checkUnit = findTabletFlag?.tabletFlag === "Y"
    let numOfDays = toNumber(addOrderForm.getFieldValue("duration"));
    let numOfDrugs = toNumber(addOrderForm.getFieldValue("quantity"));
    let newCalculatDayOrDrug = null;

    if (drugUse === "B") {
      let doseKey = ["doseM", "doseL", "doseN", "doseE", "doseB"];
      let sumDose = 0;
      for (let k of doseKey) {
        sumDose += toNumber(addOrderForm.getFieldValue(k));
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
          dose: sumDose
        },
        dataCalculatExpense: null,
        selectRight: null,
        chkdayjs: true,
        chkUnit: checkUnit,
        disabledDiscount: null
      });
    } else {
      newCalculatDayOrDrug = funcCalculatDayOrDrug({
        value: value,
        field: field,
        data: {
          numOfDays: numOfDays,
          frequency: frequency,
          numOfDrugs: numOfDrugs,
          multiply: multiply,
          oldQty: 0,
          dose: drugUsingLabel.dose !== "" ? toNumber(drugUsingLabel.dose) : "",
          disabledDiscount: null
        },
        dataCalculatExpense: null,
        selectRight: null,
        chkdayjs: true,
        chkUnit: checkUnit
      })
    }

    let newcalculate = checkNED(newCalculatDayOrDrug?.newcalculateExpense, addOrderForm.getFieldValue("reason"));
    addOrderForm.setFieldsValue(newcalculate);
    addOrderForm.setFieldsValue({
      quantity: newCalculatDayOrDrug?.numOfDrugs !== undefined ? newCalculatDayOrDrug.numOfDrugs : addOrderForm.getFieldValue("quantity"),
      startDate: newCalculatDayOrDrug?.startDate,
      endDate: newCalculatDayOrDrug?.endDate,
      duration: newCalculatDayOrDrug?.numOfDays !== undefined ? newCalculatDayOrDrug.numOfDays : addOrderForm.getFieldValue("duration"),
    });
  }
  const changeDosingInterval = (value, event = false) => {
    if (["EW", "PW", "EOD", "DOS", "CO"].includes(value)) {
      setDisabledExceptDay(false);
      setDisabledOther(true);
      if (event) {
        setTimeout(() => {
          alternateDayRef.current.focus();
        }, 10);
      }
    } else if (value === "OTH" || value === "PRD") {
      setDisabledOther(false);
      setDisabledExceptDay(true);
      if (event) {
        setTimeout(() => {
          otherDosingIntervalRef.current.focus();
        }, 1);
      }
    } else {
      setDisabledOther(true);
      setDisabledExceptDay(true);
    }
  };
  const addOrderSubmit = param => {
    console.log('addOrderSubmit', param)
    let selectExpend = selectDrugNameRef.current.getExpenseList().find(val => val.expenseId === expenseId);
    let textDrugLabel = drugLabelFunc(param, "+", drugUse, param, optionsConvertDose);
    let newDrugUsingLabel = drugLabelFunc(drugUsingLabel, " ", drugUse, param, optionsConvertDose);
    let newOrder = {
      ...param,
      key: nanoid(),
      formulaExpId: formulaExpId,
      route: drugUse,
      drugLabel: textDrugLabel,
      drugUsingLabel: newDrugUsingLabel,
      expenseId: selectExpend?.expenseId,
      expenseName: selectExpend?.expenseName,
      frequency: frequency,
      dosingInterval: [selectDosingIntervalRef.current.getValue(), ...selectDosingIntervalRef.current.getChkDays()],
      multiply: multiply,
      quantityCon: param?.quantityCon || "0"
    };

    if (checkOrderEdit) {
      editOrder(newOrder);
    } else {
      addOrder(newOrder);
    }
    setAddOrderVisible(false);
    clearData();
  };
  const clearData = () => {
    setDrugUse("A");
    setDrugUsingLabel({});
    setExpenseId(undefined);
    setDisabledExceptDay(true);
    setDisabledOther(true);
    selectDosingIntervalRef.current.handleClear();
    addOrderForm.resetFields();
    setResetPrevDrugUsingForm(p => !p)
  };
  const docLabelLength = 50;
  const formInputDrugLabel = line => {
    let name = "docLabel" + line;
    return <>
      <Col span={2} style={{
        marginTop: 8,
        paddingLeft: 0
      }}><label className="gx-text-primary">บรรทัด#{line}</label></Col>
      <Col span={22}>
        <Row>
          <Form.Item style={{
            marginBottom: 0
          }} name={name}>
            <Input onChange={e => {
              let value = e.target.value;
              value = value.slice(0, docLabelLength);
              addOrderForm.setFieldsValue({
                [name]: value
              });
            }} />
          </Form.Item>
        </Row>
        <Form.Item shouldUpdate={(prev, cur) => prev[name] !== cur[name]} noStyle>
          {({
            getFieldValue
          }) => <>
              {getFieldValue(name)?.length === docLabelLength ? <Row><label style={{
                color: "red"
              }}>ไม่เกิน {docLabelLength} ตัวอักษร</label></Row> : null}
            </>}
        </Form.Item>
      </Col>
    </>;
  };
  const onChangeDoseInputNumber = param => {
    let {
      value,
      formFieldKey,
      drugUsingLabelKey
    } = param;
    let doseVal = value?.toFixed(2);
    addOrderForm.setFieldsValue({
      [formFieldKey]: doseVal
    });
    setDrugUsingLabel({
      ...drugUsingLabel,
      [drugUsingLabelKey]: doseVal
    });
  };
  const setNewDrugLabel = (dts, dose) => {
    console.log('dts', dts)
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
          : profiletype === 'C' ? ['ED'] : undefined, dosingInterval)
        : '',
      drugProperty: drugProperty.find((val) => val.code === dts.drugProperty)?.name,
      drugWarning: drugWarning.find((val) => val.code === dts.drugWarning)?.name,
      drugAdmin: drugAdmin.find((val) => val.code === dts.drugAdmin)?.name,
    });
  }
  useEffect(() => {
    getExpenseList();
    getProfileTypeMas()
  }, []);
  useEffect(() => {
    getDropdownPrescription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownPrescription]);
  useEffect(() => {
    if (addOrderVisible) {
      if (!checkOrderEdit) {
        setDrugUsingLabel({})
      }
    }
  }, [checkOrderEdit, addOrderVisible])

  return <Modal
    centered
    title={<div style={{
      marginTop: 8,
      marginBottom: 8
    }}>
      <Row align="middle" style={{
        flexDirection: "row",
        marginLeft: 0,
        marginRight: 0,
        position: "relative"
      }}>
        <label className="gx-text-primary" style={{
          fontSize: "24px"
        }}>{checkOrderEdit ? "แก้ไขรายการ" : "เพิ่มรายการ"}</label>
        <Button type="primary" style={{
          position: "absolute",
          right: 0,
          marginBottom: 0
        }} onClick={() => {
          addOrderForm.submit();
        }}>
          บันทึก
        </Button>
      </Row>
    </div>}
    // centered
    visible={addOrderVisible}
  /* onCancel={()=>{
      setAddOrderVisible(false);
      clearData();
  }} */ closable={false}
    // footer={false}
    footer={[<Row justify="center" key="footer">
      <Popconfirm title={checkOrderEdit ? "รายการที่แก้ไขจะไม่ถูกบันทึก" : "รายการที่เพิ่มจะไม่ถูกบันทึก"} onConfirm={() => {
        clearData();
        setTimeout(() => {
          setAddOrderVisible(false);
        }, 100);
      }}>
        <Button key="cancel">ออก</Button>
      </Popconfirm>
    </Row>]} width="1200px">
    <Form
      form={addOrderForm}
      layout="vertical"
      onFinish={addOrderSubmit}
      requiredMark={false}
    >
      <Form.Item name="prevDrugUsing" hidden><Input /></Form.Item>
      <Form.Item name="isFetchDoseRouteB" hidden><Input /></Form.Item>
      <Row align="top" gutter={[16, 16]} style={{
        flexDirection: "row",
        marginTop: 16,
        marginLeft: 0,
        marginRight: 0
      }}>
        <Col span={5} style={{ paddingLeft: 0 }}>
          <Form.Item
            style={{ margin: 0, }}
            name="profiletype"
            label={<label className="gx-text-primary">ประเภท Drug profile (เฉพาะผู้ป่วยใน)</label>}
          >
            <Select
              // showSearch
              allowClear
              className='data-value'
              options={optionsProfileType}
              onChange={() => {
                addOrderForm.setFieldsValue({
                  duration: null,
                  quantityCon: null,
                })
              }}
            />
          </Form.Item>
        </Col>
        <Col span={13} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            margin: 0
          }} label={<center><label className="gx-text-primary">รหัสยา/ชื่อยา</label></center>} name="expenseId" rules={[{
            required: true,
            message: "ระบุ รหัสยา/ชื่อยา"
          }]}>
            <SelectDrugName
              drugType="DM"
              form={addOrderForm}
              expense_List={expenseList}
              sentApi={false}
              ref={selectDrugNameRef}
              expenseId={expenseId}
              onChange={async value => {
                // console.log(value, "value");
                //reset state
                addOrderForm.setFieldsValue({
                  duration: null,
                  quantity: null
                });
                setNewDrug(prev => prev += 1);
                setMultiply(0);
                setFrequency(0);
                setExpenseId(value);
                if (value === undefined) {
                  addOrderForm.resetFields();
                  return setDrugUsingLabel({});
                }
                let select = selectDrugNameRef.current.getExpenseList().find(val => val.expenseId === value);
                setIsed(select.ised?.charAt(0));
                // console.log(select);
                // console.log(drugUsingList);
                let dose = drugUsingList.find(val => val.code === select.drugUsing)?.dose;
                // console.log(dose);
                let drugTiming = drugTimingList.find(val => val.code === select.drugTiming);
                let doseLabel = await getOpdDosingTextfinancesDrug(dose);
                // console.log(doseLabel);
                if (drugTiming?.frequency !== "" && drugTiming?.frequency) {
                  setFrequency(toNumber(drugTiming?.frequency));
                }
                if (drugUse !== "E") {
                  addOrderForm.setFieldsValue({
                    ...select,
                    dose: select?.dose ? select.dose % 1 === 0 ? parseInt(select.dose) : select.dose : select?.dose,
                    dosingInterval: select?.dosingInterval ? select.dosingInterval.split(',') : []
                  });
                  setNewDrugUsingLabel(addOrderForm.getFieldsValue(), doseLabel ? doseLabel : select?.dose);
                }
              }} />
          </Form.Item>
        </Col>
        <Col span={2} style={{
          paddingLeft: 0,
          textAlign: "center"
        }}>
          <Form.Item style={{
            margin: 0,
            alignItems: "center"
          }} label={<label className="gx-text-primary">NED</label>}>
            {ised === "N" ? <label className="gx-text-primary"><CheckOutlined /></label> : <Checkbox disabled={true} />}

          </Form.Item>
        </Col>
        <Col span={2}
          hidden={profiletype !== "C"}
          style={{
            paddingLeft: 0,
            textAlign: "center"
          }}>
          <Form.Item style={{
            margin: 0,
            alignItems: "center"
          }} name="quantityCon" label={<label className="gx-text-primary">จน.Con</label>}>
            <InputNumberStyle text={"center"} />
          </Form.Item>
        </Col>
        <Col span={2}
          hidden={!profiletype ? false : profiletype !== "H"}
          style={{
            paddingLeft: 0,
            textAlign: "center"
          }}>
          <Form.Item style={{
            margin: 0,
            alignItems: "center"
          }} name="duration" label={<label className="gx-text-primary">จน.วัน</label>}>
            <InputNumberStyle min={1} /*  value={numOfDays!==0 ? numOfDays : ""} */ text={"center"} onChange={val => calculatDayOrDrug(val, "จน.วัน")} />
          </Form.Item>
        </Col>
        <Col
          span={2}
          style={{
            paddingLeft: 0,
            textAlign: "center"
          }}>
          <Form.Item
            style={{
              margin: 0,
              alignItems: "center"
            }} label={<label className="gx-text-primary">{profiletype === "C" ? "จน.Daily" : "จน.ยา"}</label>} name="quantity" rules={[{
              required: true,
              message: "ระบุ"
            }]}>
            <InputNumberStyle min={0} /* value={numOfDrugs!==0 ? numOfDrugs : ""} */ text={"center"} onChange={val => calculatDayOrDrug(val, "จน.ยา")} />
          </Form.Item>
        </Col>
      </Row>
      <Divider style={{
        marginTop: 10
      }} />
      {/* drugUse === "A" && */
        <>
          <div className="content_container" style={{
            paddingTop: 0,
            paddingBottom: 12,
            paddingLeft: 0,
            paddingRight: 0
          }}>
            <Row align="middle" style={{
              margin: 0,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: "#f2f4f6",
              flexDirection: "row"
            }}>
              <Col xxl={2} xl={2} lg={3} mg={4} sm={4} xs={4}><label className="gx-text-primary" style={{
                whiteSpace: "nowrap"
              }}>วิธีใช้ยา&nbsp;:&nbsp;</label></Col>
              <Col xxl={22} xl={22} lg={20} mg={20} sm={20} xs={20} style={{
                paddingLeft: 0
              }}>
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues} noStyle>
                  {({
                    getFieldValue
                  }) => <ShowDrugLabel
                      drugUse={drugUse}
                      drugUsingLabel={drugUsingLabel}
                      getFieldValue={getFieldValue}
                      optionsConvertDose={optionsConvertDose}
                    />}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>}
      <Row gutter={[16, 16]} style={{
        marginTop: 16,
        paddingLeft: 8
      }}>
        <Radio.Group value={drugUse} onChange={e => {
          const formValues = addOrderForm.getFieldsValue()
          const newValue = e.target.value;
          setPrevFormValues(formValues)
          setDrugUse(newValue);
          addOrderForm.setFieldsValue({ prevDrugUsing: newValue });
          // setDrugUse(e.target.value);
          // if (e.target.value === "E") {
          //   let oldExpensnId = addOrderForm.getFieldValue("expenseId");
          //   addOrderForm.resetFields();
          //   addOrderForm.setFieldsValue({
          //     expenseId: oldExpensnId
          //   });
          //   setDrugUsingLabel({});
          // }
        }}>
          <Radio value={"A"}>Dose and Unit</Radio>
          <Radio value={"B"}>ปริมาณยากับเวลาใช้</Radio>
          <Radio value={"D"}>วิธีใช้ยาแบบระบุเอง</Radio>
          <Radio value={"E"}>วิธีใช้แบบฉลากรวม</Radio>
        </Radio.Group>
      </Row>
      <Row gutter={[16, 16]} style={{
        flexDirection: "row",
        marginTop: 16,
        marginLeft: 0,
        marginRight: 0
      }}>
        {(drugUse === "A" || drugUse === "B") && <Col span={drugUse === "A" ? 4 : 6} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="drugUsing" label={<label className="gx-text-primary">Route</label>}>
            <SelectSearchBold reFresh={newDrug} dataList={drugUsingList} optionValue="code" optionLabel="name" form={addOrderForm} name="drugUsing" allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={async (value, option) => {
              // addOrderForm.resetFields();
              // changeDosingInterval();
              //reset state
              setMultiply(0);
              let doseLabel = await getOpdDosingTextfinancesDrug(option?.data?.dose);
              addOrderForm.setFieldsValue({
                drugUsing: value,
                dose: option?.data?.dose
              });
              setDrugUsingLabel({
                ...drugUsingLabel,
                drugUsing: option?.data?.name,
                dose: doseLabel ? doseLabel : option?.data?.dose
              });
              calculatDayOrDrug(option?.data?.dose, "Dose");
            }} />
          </Form.Item>
        </Col>}
        {drugUse === "A" && <>
          <Col span={3} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="dose" label={<label className="gx-text-primary">Dose</label>}>
              <Input onChange={e => {
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dose: e.target.value
                });
                calculatDayOrDrug(e.target.value, "Dose");
              }} onBlur={async e => {
                let doselabel = await getOpdDosingTextfinancesDrug(e.target.value, "Dose");
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dose: doselabel ? doselabel : e.target.value
                });
              }} onPressEnter={async e => {
                let doselabel = await getOpdDosingTextfinancesDrug(e.target.value, "Dose");
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dose: doselabel ? doselabel : e.target.value
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={4} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="dosingUnit" label={<label className="gx-text-primary">Unit</label>}>
              <Select allowClear={true} style={{
                width: '100%'
              }} showSearch onChange={(value, option) => {
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dosingUnit: option?.name
                });
              }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                options={unitList.map(n => ({
                  ...n,
                  value: n.code,
                  label: n.name
                }))} />
            </Form.Item>
          </Col>
          <Col span={13} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="drugTiming" label={<label className="gx-text-primary">เวลาใช้ยา</label>}>
              <SelectSearchBold reFresh={newDrug} dataList={drugTimingList} optionValue="code" optionLabel="name" form={addOrderForm} name="drugTiming" allowClear={true} style={{
                width: '100%'
              }} showSearch onChange={(value, option) => {
                // addOrderForm.resetFields();
                // changeDosingInterval();
                //reset state
                setFrequency(0);
                if (option?.data?.frequency !== "" && option?.data?.frequency) {
                  let newFrequency = toNumber(option?.data?.frequency);
                  setFrequency(newFrequency);
                  calculatDayOrDrug(newFrequency, "Frequency");
                }
                addOrderForm.setFieldsValue({
                  drugTiming: value
                });
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  drugTiming: option?.data?.name
                });
              }} />
            </Form.Item>
          </Col>
        </>}
        {drugUse === "B" && <>
          <Col span={1} />
          <Col span={1} style={{
            paddingLeft: 0,
            paddingTop: 33,
            textAlign: "right"
          }}>
            <label className="gx-text-primary">Dose</label>
          </Col>
          <Col span={2} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="doseM" label={<label className="gx-text-primary">เช้า</label>}>
              <InputNumber style={{
                width: '100%'
              }} controls={false} onChange={val => {
                onChangeDoseInputNumber({
                  value: val,
                  formFieldKey: "doseM",
                  drugUsingLabelKey: "moriningDose"
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={2} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="doseL" label={<label className="gx-text-primary">เที่ยง</label>}>
              <InputNumber style={{
                width: '100%'
              }} controls={false} onChange={val => {
                onChangeDoseInputNumber({
                  value: val,
                  formFieldKey: "doseL",
                  drugUsingLabelKey: "middayDose"
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={2} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="doseN" label={<label className="gx-text-primary">บ่าย</label>}>
              <InputNumber style={{
                width: '100%'
              }} controls={false} onChange={val => {
                onChangeDoseInputNumber({
                  value: val,
                  formFieldKey: "doseN",
                  drugUsingLabelKey: "afternoonDose"
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={2} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="doseE" label={<label className="gx-text-primary">เย็น</label>}>
              <InputNumber style={{
                width: '100%'
              }} controls={false} onChange={val => {
                onChangeDoseInputNumber({
                  value: val,
                  formFieldKey: "doseE",
                  drugUsingLabelKey: "eveningDose"
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={2} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="doseB" label={<label className="gx-text-primary">ก่อนนอน</label>}>
              <InputNumber style={{
                width: '100%'
              }} controls={false} onChange={val => {
                onChangeDoseInputNumber({
                  value: val,
                  formFieldKey: "doseB",
                  beforeBedDose: "eveningDose"
                });
              }} />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={5} style={{
            paddingLeft: 0
          }}>
            <Form.Item style={{
              marginBottom: 0
            }} name="dosingUnit" label={<label className="gx-text-primary">Unit</label>}>
              <Select allowClear={true} style={{
                width: '100%'
              }} showSearch onChange={(value, option) => {
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dosingUnit: option?.name
                });
              }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                options={unitList.map(n => ({
                  ...n,
                  value: n.code,
                  label: n.name
                }))} />
            </Form.Item>
          </Col>
        </>}
        {drugUse === "D" ? <>
          {formInputDrugLabel(1)}
          {formInputDrugLabel(2)}
          {formInputDrugLabel(3)}
          {formInputDrugLabel(4)}
        </> : null}
        {drugUse === "E" && <Col span={24} style={{
          paddingLeft: 0
        }}>
          <Form.Item
            name="drugLabel"
            style={{ marginBottom: 0 }}
            label={<label className="gx-text-primary">ฉลากยา</label>}
          >
            <SelectDrugLabel
              value={addOrderForm.getFieldValue("drugLabel")}
              onChange={(val, option) => {
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  drugLabel: option.label,
                });
              }}
            />
          </Form.Item>
        </Col>}
        {JSON.parse(localStorage.getItem("hos_param"))?.hideTimeMed === "Y" && drugUse === "A" ?
          null
          :
          <Col
            span={6}
            style={{
              paddingLeft: 0
            }}
          >
            <Form.Item style={{
              marginBottom: 0
            }} name="dosingTime" label={<label className="gx-text-primary">เวลารับประทาน</label>}>
              <Select disabled={drugUse === "E"} allowClear={true} style={{
                width: '100%'
              }} showSearch onChange={(value, option) => {
                // addOrderForm.resetFields();
                // changeDosingInterval();
                addOrderForm.setFieldsValue({
                  dosingTime: value
                });
                setDrugUsingLabel({
                  ...drugUsingLabel,
                  dosingTime: option?.label
                });
              }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={dosingTime.map(n => ({
                value: n.datavalue,
                label: n.datadisplay
              }))} />
            </Form.Item>
          </Col>
        }
        <Col span={6} style={{
          paddingLeft: 0
        }}>
          <div style={{
            marginBottom: 8
          }}><label className="gx-text-primary">Dosing Interval</label></div>
          <SelectDosingInterval ref={selectDosingIntervalRef} disabled={drugUse === "E"} options={dosingInterval} changeDosingInterval={changeDosingInterval} setDrugUsingLabel={setDrugUsingLabel} dosingIntervalLabel={dosingIntervalLabel} drugUsingLabel={drugUsingLabel} form={addOrderForm} />
        </Col>
        <Col span={3} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} label={<label className="gx-text-primary">ความถี่</label>} name="alternateDay">
            <Input ref={alternateDayRef} placeholder="วัน" disabled={disabledExceptDay} onChange={e => {
              setDrugUsingLabel({
                ...drugUsingLabel,
                alternateDay: e.target.value
              });
            }} />
          </Form.Item>
        </Col>
        <Col
          span={JSON.parse(localStorage.getItem("hos_param"))?.hideTimeMed === "Y" && drugUse === "A" ? 15 : 9}
          style={{
            paddingLeft: 0
          }}
        >
          <Form.Item style={{
            marginBottom: 0
          }} label={<label className="gx-text-primary">อื่นๆ</label>} name="otherDosingInterval">
            <Input ref={otherDosingIntervalRef} placeholder="ระบุ" disabled={disabledOther} onChange={e => {
              setDrugUsingLabel({
                ...drugUsingLabel,
                otherDosingInterval: e.target.value
              });
            }} />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="drugProperty" label={<label className="gx-text-primary">ข้อบ่งใช้</label>}>
            <SelectSearchBold reFresh={newDrug} disabled={drugUse === "E"} dataList={drugProperty} form={addOrderForm} name="drugProperty" optionValue="code" optionLabel="name" allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={(value, option) => {
              // addOrderForm.resetFields();
              // changeDosingInterval();
              addOrderForm.setFieldsValue({
                drugProperty: value
              });
              setDrugUsingLabel({
                ...drugUsingLabel,
                drugProperty: option?.data?.name
              });
            }} />
          </Form.Item>
        </Col>
        <Col span={9} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="drugWarning" label={<label className="gx-text-primary">ข้อควรระวัง</label>}>
            <Select disabled={drugUse === "E"} allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={(value, option) => {
              // addOrderForm.resetFields();
              // changeDosingInterval();
              addOrderForm.setFieldsValue({
                drugWarning: value
              });
              setDrugUsingLabel({
                ...drugUsingLabel,
                drugWarning: option?.label
              });
            }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={drugWarning.map(n => ({
              value: n.code,
              label: n.name
            }))} />
          </Form.Item>
        </Col>
        <Col span={9} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="drugAdmin" label={<label className="gx-text-primary">ฉลากช่วย</label>}>
            <Select disabled={drugUse === "E"} allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={(value, option) => {
              // addOrderForm.resetFields();
              // changeDosingInterval();
              addOrderForm.setFieldsValue({
                drugAdmin: value
              });
              setDrugUsingLabel({
                ...drugUsingLabel,
                drugAdmin: option?.label
              });
            }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={drugAdmin.map(n => ({
              value: n.code,
              label: n.name
            }))} />
          </Form.Item>
        </Col>
        <Col span={13} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="docRemark" label={<label className="gx-text-primary">หมายเหตุเฉพาะ (แสดงที่ฉลากยา)</label>}>
            <Input disabled={drugUse === "E"} onChange={e => {
              setDrugUsingLabel({
                ...drugUsingLabel,
                docRemark: e.target.value
              });
            }} />
          </Form.Item>
        </Col>
        <Col span={9} style={{
          paddingLeft: 0
        }}>
          <Form.Item style={{
            marginBottom: 0
          }} name="reason" label={<label className="gx-text-primary">เหตุผลการใช้ยานอกบัญชีฯ</label>} rules={[{
            required: /* chkNed &&  */ised === "N" /*  && patientType === "opd" */,
            message: 'ระบุเหตุผลการใช้ยานอกบัญชีฯ'
          }]}>
            <Select disabled={ised !== "N"} allowClear={true} style={{
              width: '100%'
            }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              // onChange={(val) => {
              //     if (val === "F") {
              //         let newcashNotReturn = form.getFieldValue("credit") ? form.getFieldValue("credit") : form.getFieldValue("")
              //         form.setFieldsValue({
              //             credit: 0,
              //             cashReturn: 0,
              //             cashNotReturn: newcashNotReturn || 0
              //         })
              //     }
              // }}
              options={isedReason?.map(n => ({
                value: n.datavalue,
                label: n.datadisplay
              }))} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
    <PrevDrugUsing
      form={addOrderForm}
      prevFormValues={prevFormValues}
      oldDrugUse={prevDrugUsing}
      newDrugUse={drugUse}
      dosingIntervalRef={selectDosingIntervalRef}
      resetFields={resetPrevDrugUsingForm}
      setNewDrugLabel={(newDrugUse) => {
        setTimeout(() => {
          const formValues = addOrderForm.getFieldsValue()
          const dosingIntervalDays = selectDosingIntervalRef?.current?.getChkDays() || []
          setNewDrugLabel({
            ...formValues,
            dosingInterval: dosingIntervalDays.join(","),
          });
        }, 100);
        // setTimeout(() => {
        //   if (newDrugUse === 'A' || newDrugUse === 'B') {
        //     chkPageForClcDayOrDrugInjectionFlag(
        //       'dosingUnit',
        //       null,
        //       newDrugUse
        //     );
        //   }
        // }, 200);
      }}
    />
  </Modal>;
});
const CreateAndEditFormulasDrug = forwardRef(function FormulasDrug({
  workId,
  doctorId,
  getOpdOederFormulasFinancesDrug,
  optionsConvertDose = [],
  // medOrder = [],
}, ref) {
  const [createVisible, setCreateVisible] = useState(false);
  const [orderForm] = Form.useForm();
  // State
  const [doctorList, setDoctorList] = useState([]);
  const [type, setType] = useState("1"); //แถวบนสุดของModal
  // console.log(type);

  const addOrderRef = useRef(null);
  const [oldOrder, setOldOrder] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [showDoctorField,] = useState(true);
  //เปลี่ยน Modal จาก Create เป็น Edit
  const [formulaId, setFormulaId] = useState(null);
  const [checkEdit, setCheckEdit] = useState(false);
  //เก็บ index ของรายการยาที่กำลังแก้ไข
  const [editIndex, setEditIndex] = useState(0);
  //Notifications modal
  const [showFormulasDrugProcess, setShowFormulasDrugProcess] = useState(false);
  const [titletFormulasDrugProcess, setTitleFormulasDrugProcess] = useState(null);
  useImperativeHandle(ref, () => ({
    orderForm: () => orderForm,
    setCreateVisible: props => setCreateVisible(props),
    setFormulaId: props => setFormulaId(props),
    setCheckEdit: props => setCheckEdit(props),
    setOrderData: props => setOrderData(props),
    setOldOrder: props => setOldOrder(props),
    // setShowDoctorField: (props) => setShowDoctorField(props),
    setType: props => setType(props)
  }));

  const orderSubmit = async param => {
    console.log('orderSubmit', param)
    let resChkDupFormulaName = await ChkDupFormulaName({
      formulaName: param.formulaName,
      formulaId: formulaId,
      action: checkEdit ? "U" : "I"
    });
    if (toNumber(resChkDupFormulaName) > 0) {
      setTitleFormulasDrugProcess({
        // title: !checkEdit ? "สร้างสูตรการสั่งยาไม่สำเร็จ" : "แก้ไขสูตรการสั่งยาไม่สำเร็จ",
        title: "ชื่อสูตรการสั่งยานี้มีอยู่ในระบบแล้ว",
        type: "error"
      });
      return setShowFormulasDrugProcess(true);
    }
    let newOrderdata = orderData.map((val, index) => {
      return {
        ...val,
        formulaId: formulaId,
        expenseId: toNumber(val.expenseId),
        drugTiming: val.drugTiming ? val.drugTiming : null,
        drugWarning: val.drugWarning ? val.drugWarning : null,
        drugProperty: val.drugProperty ? val.drugProperty : null,
        drugLabel: val.drugLabel ? val.drugLabel : null,
        dose: val?.dose,
        doseText: val?.doseText,
        multiply: val?.multiply,
        duration: val.duration ? toNumber(val.duration) : 0,
        drugUsing: val.drugUsing ? val.drugUsing : null,
        docRemark: val.docRemark ? val.docRemark : null,
        dosingInterval: val?.dosingInterval
          ? isArray(val?.dosingInterval)
            ? val?.dosingInterval?.join()
            : val?.dosingInterval || null
          : null,
        dosingUnit: val.dosingUnit ? val.dosingUnit : null,
        dosingTime: val.dosingTime ? val.dosingTime : null,
        alternateDay: val.alternateDay ? toNumber(val.alternateDay) : 0,
        otherDosingInterval: val.otherDosingInterval ? val.otherDosingInterval : null,
        drugAdmin: val.drugAdmin ? val.drugAdmin : null,
        doseM: val?.doseM,
        doseL: val?.doseL,
        doseN: val?.doseN,
        doseE: val?.doseE,
        doseB: val?.doseB,
        profiletype: val?.profiletype || null,
      };
    });
    let error = false;
    for (const val of newOrderdata) {
      // if(val?.route==="A"){
      let resData = await GetDrugLabels({
        drugLabel: val.drugLabel
      });
      if (resData?.length === 0) {
        if (val.drugLabel) {
          let resData = await InsDrugLabels({
            drugLabel: val.drugLabel,
            drugUsingLabel: val.drugUsingLabel,
            dose: val?.multiply ? "0" : val?.dose,
            frequency: val.frequency
          });
          if (!resData.isSuccess) {
            return showError();
          }
        }
      } else {
        if (resData[0].name !== val.drugLabelName) {
          let resData = await UpdDrugLabels({
            drugLabel: val.drugLabel,
            drugUsingLabel: val.drugUsingLabel,
            dose: val?.multiply ? "0" : val.dose,
            frequency: val.frequency
          });
          if (!resData.isSuccess) {
            // return showError();
          }
        }
      }
      // }
    }
    if (checkEdit) {
      //update FormulasName && icd
      let resData = await UpdOrderFormulas({
        formulaId: formulaId,
        formulaName: param.formulaName,
        icd: param.icd,
        workId: workId,
        userId: param.doctor ? param.doctor : doctorId,
        formulaType: type
      });
      if (!resData.isSuccess) {
        return showError();
      }
      //เพิ่มเติม ยาในสูตร
      let arrReq = newOrderdata.filter((val, index) => index >= oldOrder.length);
      if (arrReq.length > 0) {
        resData = await InsListFormulaExpenses({
          listFormulaExpenses: arrReq
        });
        if (!resData.isSuccess) {
          error = true;
          showError();
        }
      }
      //แก้ไข ยาในสูตร
      arrReq = newOrderdata.filter((val, index) => index < oldOrder.length);
      if (arrReq.length > 0) {
        resData = await UpdListFormulaExpenses({
          listFormulaExpenses: arrReq
        });
        if (!resData.isSuccess) {
          error = true;
          showError();
        }
      }
      arrReq = oldOrder.filter((val, index) => index >= newOrderdata.length);
      if (arrReq.length > 0) {
        let newOrderId = [];
        for (let val of newOrderdata) {
          newOrderId.push(val.formulaExpId);
        }
        arrReq = oldOrder.filter(val => !newOrderId.includes(val.formulaExpId));
        console.log("arrReq", arrReq);
        let newarrReq = [];
        for (let val of arrReq) {
          newarrReq.push(String(val.formulaExpId));
        }
        console.log(newarrReq);
        resData = await DelListFormulaExpenses(newarrReq);
        if (!resData.isSuccess) {
          error = true;
          showError();
        }
      }
    } else {
      // console.log(newOrderdata, "newOrderdata");
      let resData = await InsDrugFormulas({
        formulaName: param.formulaName,
        icd: param.icd,
        workId: workId,
        userId: param.doctor ? param.doctor : doctorId,
        formulaType: type,
        listFormulaExpenses: newOrderdata
      });
      if (!resData.isSuccess) {
        return showError();
      }
    }
    if (!error) {
      setTitleFormulasDrugProcess({
        title: "บันทีกสูตรการสั่งยาใหม่สำเร็จ",
        type: "success"
      });
      setShowFormulasDrugProcess(true);
      getOpdOederFormulasFinancesDrug();
    }
    setCreateVisible(false);
    clearData();
  };
  //Func.
  const getDoctorList = async () => {
    if (!doctorList.length) {
      const resData = await GetDropdown("GetDoctorMas");
      setDoctorList(resData);
    }
  };
  const showError = () => {
    setTitleFormulasDrugProcess({
      title: !checkEdit ? "สร้างสูตรการสั่งยาไม่สำเร็จ" : "แก้ไขสูตรการสั่งยาไม่สำเร็จ",
      type: "error"
    });
    setShowFormulasDrugProcess(true);
    // setLoading(false);
    clearData();
  };
  const clearData = async () => {
    setOrderData([]);
    setFormulaId(null);
    orderForm.resetFields();
  };
  useEffect(() => {
    if (createVisible) {
      getDoctorList();
    }
  }, [createVisible]);

  return <>
    <Modal title={<strong><label>{checkEdit ? "แก้ไขสูตรการสั่งยา" : "สร้างสูตรการสั่งยา"}</label></strong>}
      centered
      visible={createVisible}
      closable={false} width="1200px" footer={[<Row justify="center" key="footer">
        <Popconfirm title={checkEdit ? "สูตรยาที่แก้ไขจะไม่ถูกบันทึก" : "สูตรยาที่สร้างจะไม่ถูกบันทึก"} onConfirm={() => {
          setCreateVisible(false);
          clearData();
        }}>
          <Button key="cancel">ออก</Button>
        </Popconfirm>
        <Button key="ok" type="primary" onClick={() => {
          orderForm.submit();
        }}>
          บันทึก
        </Button>
      </Row>]}>
      <Form form={orderForm} layout="vertical" onFinish={orderSubmit} requiredMark={false} initialValues={{
        doctor: doctorId
      }}>
        <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
          {
            showDoctorField
              ? <Col span={24}>
                <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
                  <Col span={6}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">ตั้งชื่อสูตรการสั่งยา</label>}
                      name="formulaName"
                      rules={[{
                        required: true,
                        message: "ระบุ ชื่อสูตร"
                      }]}>
                      <Input placeholder="ชื่อสูตร" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      name="icd"
                      label={<label className="gx-text-primary">รหัสโรค</label>}
                    >
                      <SelectMasterIcd10 value={orderForm.getFieldValue("icd")} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item style={{ marginBottom: 0 }}
                      name="doctor" label={<label className="gx-text-primary">แพทย์</label>}>
                      <Select
                        placeholder="แพทย์"
                        allowClear={true}
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={doctorList.map(n => ({
                          value: n.datavalue,
                          label: n.datadisplay
                        }))} />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Radio.Group onChange={e => setType(e.target.value)} value={type}>
                        <Radio value={"2"}><label className="gx-text-primary">GLOBAL</label></Radio>
                        <Radio value={"3"}><label className="gx-text-primary">แผนก</label></Radio>
                        <Radio value={"4"}><label className="gx-text-primary">สาขา</label></Radio>
                        <Radio value={"1"}><label className="gx-text-primary">เฉพาะตัว</label></Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              : <Col span={14}>
                <Form.Item style={{
                  marginBottom: 0
                }}>
                  <Radio.Group onChange={e => setType(e.target.value)} value={type}>
                    <Radio value={0}><label className="gx-text-primary">GLOBAL</label></Radio>
                    <Radio value={1}><label className="gx-text-primary">แผนก</label></Radio>
                    <Radio value={2}><label className="gx-text-primary">สาขา</label></Radio>
                    <Radio value={3}><label className="gx-text-primary">เฉพาะตัว</label></Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>}
        </Row>
      </Form>
      <Table
        size='small'
        rowClassName={"data-value"}
        dataSource={orderData}
        style={{
          marginTop: 10
        }}
      >
        <Column
          width={345}
          title={<Row gutter={[8, 8]} align='middle'>
            <Col>
              <label className="gx-text-primary"><b>รายการ</b></label>
            </Col>
            <Col>
              <Button
                className='mb-0'
                type="primary"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  addOrderRef.current.setCheckOrderEdit(false);
                  addOrderRef.current.setAddOrderVisible(true);
                }}>เพิ่ม</Button>
            </Col>
          </Row>
          }
          dataIndex="expenseName" />
        <Column
          title={<label className="gx-text-primary"><b>วิธีใช้</b></label>} /* dataIndex="drugUsingLabel" */
          render={record => {
            // console.log('record', record)
            return <>
              {record?.docLabel1 ? record?.docLabel1 + " , " : null}
              {record?.docLabel2 ? record?.docLabel2 + " , " : null}
              {record?.docLabel3 ? record?.docLabel3 + " , " : null}
              {record?.docLabel4 ? record?.docLabel4 + " , " : null}
              {record?.drugLabelName}
              {record?.drugUsingLabel}
            </>;
          }} />
        <Column
          title={<label className="gx-text-primary"><b>จำนวน</b></label>}
          dataIndex="quantity"
          width={100}
          align='center'
        />
        <Column
          width={85}
          align='center'
          render={(record, row, index) => {
            return <Row gutter={[4, 4]}>
              <Col span={12}>
                <button
                  className="btn-table editrow"
                  onClick={() => {
                    setEditIndex(index);
                    addOrderRef.current.setExpenseId(String(row?.expenseId));
                    if (["A", "B", "D", "E"].includes(row?.route)) {
                      addOrderRef.current.setDrugUse(row?.route);
                    }
                    addOrderRef.current.changeDosingInterval(row?.dosingInterval);
                    let dosingInterval = row.dosingInterval;
                    if (Array.isArray(row?.dosingInterval)) {
                      dosingInterval = row.dosingInterval.join();
                    }
                    row = {
                      ...row,
                      dosingInterval: dosingInterval && dosingInterval.split(',')
                    };
                    let tempDosingInterval = row.dosingInterval ? row.dosingInterval.slice() : [];
                    addOrderRef.current.setDosingInterval(tempDosingInterval);
                    addOrderRef.current.setNewDrugUsingLabel(row, row?.dose);
                    addOrderRef.current.setFormulaExpId(row?.formulaExpId);
                    addOrderRef.current.setCheckOrderEdit(true);
                    addOrderRef.current.setAddOrderVisible(true);
                    setTimeout(() => {
                      addOrderRef.current.addOrderForm().setFieldsValue({
                        ...row,
                        expenseId: String(row?.expenseId),
                        duration: row?.duration > 0 ? row?.duration : null,
                        dose: String(row?.dose),
                        alternateDay: row?.alternateDay > 0 ? row?.alternateDay : null,
                      });
                    }, 200);
                  }}>
                  <EditOutlined />
                </button>
              </Col>
              <Col span={12}>
                <button className="btn-table deleterow" onClick={() => {
                  setOrderData(orderData.filter((val, valindex) => valindex !== index));
                }}>
                  <DeleteOutlined />
                </button>
              </Col>
            </Row>;
          }} />
      </Table>
    </Modal>
    <AddOrder
      ref={addOrderRef}
      addOrder={val => {
        setOrderData([...orderData, val]);
      }}
      editOrder={val => {
        let neworderData = orderData;
        neworderData[editIndex] = val;
        setOrderData(cloneDeep(neworderData));
      }}
      optionsConvertDose={optionsConvertDose}
    />
    <Notifications setModal={isVisible => {
      setShowFormulasDrugProcess(isVisible);
      setTitleFormulasDrugProcess(null);
    }} isVisible={showFormulasDrugProcess} title={titletFormulasDrugProcess?.title} type={titletFormulasDrugProcess?.type} />
  </>;
});
const FormulasDrug = forwardRef(function FormulasDrug({
  workId,
  doctorId,
  medOrder = [],
  optionsConvertDose = [],
  ...props
}, ref) {
  const [loading, setLoading] = useState(false);
  const [filterSearch, setFilterSearch] = useState(null);
  const [filterType, setFilterType] = useState(null);
  console.log(filterType);


  const [numDays, setNumDays] = useState(null);
  const [filterOrderFormulas, setFilterOrderFormulas] = useState(null);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [parentSelectedRowKeys, setParentSelectedRowKeys] = useState([]);
  const [childSelectedRowKeys, setChildSelectedRowKeys] = useState([]);
  const [orderFormulas, setOrderFormulas] = useState([]);
  const createAndEditDrugRef = useRef(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const {
    pathname
  } = useSelector(({
    common
  }) => common);
  const [tableType, setTableType] = useState(1);
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  //Notifications modal
  const [showFormulasDrugProcess, setShowFormulasDrugProcess] = useState(false);
  const [titletFormulasDrugProcess, setTitleFormulasDrugProcess] = useState(null);
  useImperativeHandle(ref, () => ({
    getCheckedList: () => getCheckedList(),
    createAndEditDrugRef: () => createAndEditDrugRef,
    clearFormulasData: () => clearFormulasData(),
    getnumDays: () => numDays
  }));
  //Func. Call Api
  const getDrugFormulas = async (newPage, search, type) => {
    setParentSelectedRowKeys([]);
    setChildSelectedRowKeys([]);
    const params = `${workId},${doctorId},${newPage},20/${search || null}/${type || ""}`
    console.log(params);

    setLoading(p => !p)
    const res = await callApis(apis["GetDrugFormulas"], params)
    setLoading(p => !p)
    // console.log('res', res)
    setTotal(res?.total || 0)
    const formulas = map(res?.items || [], o => {
      const opdFormulaExpensesFinancesDrug = map(o.opdFormulaExpensesFinancesDrug, x => {
        return { ...x, key: nanoid() }
      })
      return {
        ...o,
        key: o?.formulaId,
        opdFormulaExpensesFinancesDrug: opdFormulaExpensesFinancesDrug,
      }
    })
    setOrderFormulas(formulas)
  }
  const editFormulasDrug = async row => {
    // console.log("editFormulasDrug =>", row);
    let resData = await GetFormulaExpensesbyFormulaId(row?.formulaId);
    resData = resData?.sort((a, b) => {
      return dayjs(b.dateCreated, "MM/DD/YYYY HH:mm:ss").diff(dayjs(a.dateCreated, "MM/DD/YYYY HH:mm:ss"));
    });
    let orderData = resData?.map((val, index) => {
      return {
        ...val,
        // icd: val?.mapping1 || null,
        expenseName: row?.opdFormulaExpensesFinancesDrug[index]?.expenseName,
        drugUsingLabel: row?.opdFormulaExpensesFinancesDrug[index]?.drugLabelName,
        key: row?.opdFormulaExpensesFinancesDrug[index]?.key,
        dose: val?.doseText ? val.doseText : toNumber(val?.dose)
      };
    });
    createAndEditDrugRef.current.orderForm().setFieldsValue({
      formulaName: row.formulaName,
      icd: row?.mapping1 || null,
      doctor: doctorId
    });
    createAndEditDrugRef.current.setOrderData(orderData);
    createAndEditDrugRef.current.setOldOrder(orderData);
    createAndEditDrugRef.current.setCheckEdit(true);
    createAndEditDrugRef.current.setFormulaId(row.formulaId);
    createAndEditDrugRef.current.setCreateVisible(true);
  };
  //Func.
  const onExpandedRowsChange = expandedRows => {
    setExpandedRowKeys(expandedRows);
  };
  const clearFormulasData = () => {
    setFilterSearch(null);
    setFilterType(null)
    setFilterOrderFormulas(null);
    setPageCurrent(1);
    setExpandedRowKeys([]);
    setParentSelectedRowKeys([]);
    setChildSelectedRowKeys([]);
  };
  const rowSelection = {
    selectedRowKeys: parentSelectedRowKeys,
    onChange: selectedRowKeys => {
      setParentSelectedRowKeys(selectedRowKeys);
    }
  };
  const onParentSelectChange = (record, selected,) => {
    let patentArr = [...parentSelectedRowKeys];
    let childArr = [...childSelectedRowKeys];
    //setChildArr: select all child options under the parent Table
    let setChildArr = orderFormulas.find(d => d.key === record.key).opdFormulaExpensesFinancesDrug.map(item => item.key);
    //The first step is to determine the selected true: selected, false, unselected
    if (selected) {
      //The second step, the parent table is selected, and the child tables are all selected
      patentArr.push(record.key);
      childArr = Array.from(new Set([...setChildArr, ...childArr]));
    } else {
      //The second step is to uncheck the parent table and uncheck all the child tables
      patentArr.splice(patentArr.findIndex(item => item === record.key), 1);
      childArr = childArr.filter(item => !setChildArr.some(e => e === item));
    }
    //The third step is to set the SelectedRowKeys of the parent and child
    setParentSelectedRowKeys(patentArr);
    setChildSelectedRowKeys(childArr);
  };
  const onChildSelectChange = (record, selected, selectedRows) => {
    //record: current operation line
    //selected selected state
    //selectedRows: selected array
    let childArr = [...childSelectedRowKeys];
    //The first step is to judge selected true: selected, false: unselected
    if (selected) {
      childArr.push(record.key);
    } else {
      childArr.splice(childArr.findIndex(item => item === record.key), 1);
    }
    selectedRows = selectedRows.filter(a => a !== undefined);
    //The second step is to determine whether the length of selectedRows is the length of the child in the data. If it is equal, select the parent table.
    for (let item of orderFormulas) {
      if (item.opdFormulaExpensesFinancesDrug.find(d => d.key === record.key)) {
        let parentArr = [...parentSelectedRowKeys];
        if (item.opdFormulaExpensesFinancesDrug.length === selectedRows.length) {
          parentArr.push(item.key);
        } else {
          if (parentArr.length && parentArr.find(d => d === item.key)) {
            parentArr.splice(parentArr.findIndex(item1 => item1 === item.key), 1);
          }
        }
        setParentSelectedRowKeys(parentArr);
        break;
      }
    }
    setChildSelectedRowKeys(childArr);
  };
  const childRowSelection = {
    selectedRowKeys: childSelectedRowKeys,
    onSelect: onChildSelectChange
    /* onSelectAll: onChildSelectAll */
  };

  const parentRowSelection = {
    selectedRowKeys: parentSelectedRowKeys,
    onSelect: onParentSelectChange,
    getCheckboxProps: record => ({
      disabled: record.opdFormulaExpensesFinancesDrug.length === 0
    })
    /* onSelectAll: onParentSelectAll, */
  };

  const getCheckedList = () => {
    let checkList = [];
    orderFormulas.forEach(val => {
      checkList = [...checkList, ...val.opdFormulaExpensesFinancesDrug.filter(val => childSelectedRowKeys.includes(val.key))];
    });
    return checkList;
  };
  const expandedRowRender = record => {
    console.log(record);
    return <Table
      size="small"
      rowClassName="data-value"
      dataSource={record.opdFormulaExpensesFinancesDrug} pagination={false}
      rowSelection={tableType === 1 ? childRowSelection : null}>
      <Column width="45%" title={<label className="gx-text-primary"><b>ชื่อยา</b></label>} dataIndex="expenseName" />
      <Column width="45%" title={<label className="gx-text-primary"><b>วิธีใช้</b></label>} render={record => <>
        {record?.docLabel1 ? <div>{record?.docLabel1}</div> : null}
        {record?.docLabel2 ? <div>{record?.docLabel2}</div> : null}
        {record?.docLabel3 ? <div>{record?.docLabel3}</div> : null}
        {record?.docLabel4 ? <div>{record?.docLabel4}</div> : null}
        {record?.drugLabelName ? <div>{record?.drugLabelName}</div> : null}
      </>} />
      <Column width="10%" title={<label className="gx-text-primary"><b>จำนวน</b></label>} dataIndex="quantity" />
    </Table>;
  };
  useEffect(() => {
    if (workId || doctorId) {
      getDrugFormulas(page, filterSearch, filterType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, workId]);
  useEffect(() => {
    if (pathname.includes("/doctor clinic/doctor-clinic-doctor-drug-formular")) {
      setTableType(2);
    }
  }, [pathname]);
  return <div style={{ margin: -10 }}>
    <Spin spinning={loading}>
      <Row style={{
        margin: 0
      }} /* gutter={[16,16]} */>
        <Col span={6} style={{
          padding: 0
        }}>
          <label className="gx-text-primary">ค้นหาสูตรการสั่งยา</label>
        </Col>
        <Col span={6} style={{
          padding: 0
        }}>
          <label className="gx-text-primary">ค้นหาเฉพาะคน</label>
        </Col>
        {tableType === 1 && <Col span={8} style={{
          padding: 0,
          marginLeft: 16
        }}>
          <label className="gx-text-primary">จน.ตามวันที่สั่ง</label>
        </Col>}
      </Row>
      <Row style={{
        margin: 0,
        marginTop: 10
      }} /* gutter={[16,16]} */>
        <Col span={6} style={{
          padding: 0
        }}>
          <Input.Search
            placeholder="สูตรการสั่งยา"
            allowClear
            onChange={e => setFilterSearch(e.target.value)}
            onSearch={(v) => {
              setPage(1);
              getDrugFormulas(1, v, filterType)
            }}
            value={filterSearch}
            style={{ marginBottom: 0 }}
          />
        </Col>
        <Col span={6} style={{
          padding: 0
        }}>
          <Select
            placeholder="ค้นหาเฉพาะคน"
            allowClear
            style={{ marginBottom: 0, width: "100%" }}
            onChange={e => {
              console.log(e);

              setFilterType(e)
              setPage(1);
              getDrugFormulas(1, filterSearch, e)
            }}
            value={filterType}

          >
            <Option value={"1"}>เฉพาะตัว</Option>
            <Option value={"2"}>GLOBAL</Option>
            <Option value={"3"} >แผนก</Option>
            <Option value={"4"}>สาขา</Option>

          </Select>
        </Col>
        {tableType === 1 && <Col span={8} style={{
          padding: 0,
          marginLeft: 16
        }}>
          <InputNumber
            placeholder="จน.ตามวันที่สั่ง"
            min={1}
            style={{
              width: "100%",
              marginBottom: 0
            }}
            onChange={val => setNumDays(val)}
            value={numDays}
          />
        </Col>}
      </Row>
      {tableType === 2 && <Row style={{
        margin: 0
      }}>
        <Popconfirm title="ต้องการลบรายการที่เลือก" onConfirm={async () => {
          let formulasList = orderFormulas.filter(val => parentSelectedRowKeys.includes(val.key));
          formulasList = formulasList.map(val => {
            return val.formulaId;
          });
          let res = await DelListFormulas(formulasList);
          if (res.isSuccess) {
            setTitleFormulasDrugProcess({
              title: "ลบสูตรการสั่งยาสำเร็จ",
              type: "success"
            });
            setShowFormulasDrugProcess(true);
            setFilterOrderFormulas(null);
            return getDrugFormulas(page, filterSearch, filterType);
          }
          setTitleFormulasDrugProcess({
            title: "ลบสูตรการสั่งยาไม่สำเร็จ",
            type: "error"
          });
          setShowFormulasDrugProcess(true);
        }}>
          <Button style={{
            marginTop: 15
          }} type="default">ลบที่เลือก</Button>
        </Popconfirm>
      </Row>}
      <TableStyle
        size="small"
        rowClassName="data-value"
        style={{
          marginTop: 10
        }}
        dataSource={orderFormulas}
        selectAll={tableType === 1 ? false : true}
        className="parent"
        // rowKey="key"
        scroll={{ y: 400 }}
        // loading={loading}
        pagination={{
          current: page,
          pageSize: 20,
          showSizeChanger: false,
          total: total,
        }}
        expandable={{
          expandedRowRender: expandedRowRender,
          rowExpandable: record => record.opdFormulaExpensesFinancesDrug.length > 0,
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: onExpandedRowsChange
        }}
        rowSelection={tableType === 1 ? parentRowSelection : rowSelection}
        onChange={(n) => {
          const newPage = n.current
          setPage(n.current);
          getDrugFormulas(newPage, filterSearch, filterType)
        }}
      >
        <Column title={<label className="gx-text-primary"><b>ชื่อสูตร</b></label>} /* dataIndex="formulaName"  */ render={(record, row) => {
          return <Row align='middle' style={{
            flexDirection: "row"
          }}>
            <label className="gx-text-primary">
              {record.formulaName}  <span style={{
                cursor: "pointer",
                lineHeight: "80%"
              }} onClick={() => editFormulasDrug(row)}><FaRegEdit /></span>
              &nbsp;{tableType === 1 && <span style={{
                cursor: "pointer",
                lineHeight: "50%"
              }}>
                <Popconfirm title="ต้องการลบสูตรการสั่งยานี้" onConfirm={async () => {
                  // console.log(record);
                  let res = await DelListFormulas([record.formulaId]);
                  if (res.isSuccess) {
                    setTitleFormulasDrugProcess({
                      title: "ลบสูตรการสั่งยาสำเร็จ",
                      type: "success"
                    });
                    setShowFormulasDrugProcess(true);
                    return getDrugFormulas(page, filterSearch, filterType)
                  }
                  setTitleFormulasDrugProcess({
                    title: "ลบสูตรการสั่งยาไม่สำเร็จ",
                    type: "error"
                  });
                  setShowFormulasDrugProcess(true);
                }}>
                  <DeleteOutlined />
                </Popconfirm>
              </span>}
            </label>
          </Row>;
        }} />
        <Column title={<label className="gx-text-primary"><b>ICD10</b></label>} dataIndex="icdName" />
      </TableStyle>
    </Spin>
    <Notifications setModal={isVisible => {
      setShowFormulasDrugProcess(isVisible);
      setTitleFormulasDrugProcess(null);
    }} isVisible={showFormulasDrugProcess} title={titletFormulasDrugProcess?.title} type={titletFormulasDrugProcess?.type} />
    <CreateAndEditFormulasDrug ref={createAndEditDrugRef} workId={workId} doctorId={doctorId}
      getOpdOederFormulasFinancesDrug={() => {
        getDrugFormulas(page, filterSearch, filterType)
      }}
      optionsConvertDose={optionsConvertDose}
    />
  </div>
});
const FormulasDrugModal = forwardRef(function FormulasDrugModal({
  patient,
  formularyVisible,
  setFormularyVisible,
  workId,
  doctorId,
  doctorName,
  drugAlertRef,
  dispatchDiList,
  setChkDrugDiseaseinsertMuti = () => { },
  dispatchDrugDiseaseList,
  page = null,
  inSertFormulasToDrugProfile = () => { },
  medOrder = [],
  drugAllergyDetails = null,
  expenses = [],
  optionsConvertDose = [],
  drugprofile = null,
  ...props
}, ref) {
  const {
    expenseList
  } = useExpenseListContext();
  const formularyDrugRef = useRef(null);
  const [loading, setLoading] = useState(false);

  //DrugAlert
  // const drugAlertRef =  useRef(null);

  const closeFormulasDrugModal = () => {
    formularyDrugRef.current.clearFormulasData();
    setFormularyVisible(false);
    // setTimeout(()=>formularyDrugRef.current.clearFormulasData(), 100);
  };

  useImperativeHandle(ref, () => ({
    setFormularyVisible: props => setFormularyVisible(props)
  }));
  const handleSaveSelectedFormulasDrug = async () => {
    // console.log('medOrder :>> ', medOrder);
    let selectDrug = formularyDrugRef.current.getCheckedList();
    // console.log('selectDrug :>> ', selectDrug);
    const numDays = formularyDrugRef.current.getnumDays();
    // console.log('numDays :>> ', numDays);
    if (!selectDrug?.length) return toast.error('กรุณาเลือกสูตรยา !', toastTopRight);
    let chkDrugConditions = await ChkDrugConditionsV2({
      patientId: patient?.patientId,
      newExpenses: medOrder,
      oldExpenses: selectDrug,
      doctorId: doctorId,
      workId: workId,
      drugAllergyDetails: drugAllergyDetails,
      expenses: expenses,
      drugprofile: drugprofile,
    })
    chkDrugConditions = chkDrugConditions.map(val => {
      if (val?.finaceId) return val
      let expense = expenseList.find(expense => expense.expenseId === val.expenseId);
      return {
        ...expense,
        ...val,
        billgroup: expense?.billgroup || null,
        actgroup: expense?.actgroup || null,
        financeType: "D",
        quantity: numDays ? numDays * (val?.dose || 1) * (val?.frequency || 1) : val?.quantity,
        dosingInterval: expense?.dosingInterval && expense.dosingInterval.split(',')
      };
    });
    // console.log('chkDrugConditions', chkDrugConditions)
    chkDrugConditions = differenceBy(chkDrugConditions, medOrder, "key")
    if (page === "15.3") {
      inSertFormulasToDrugProfile(chkDrugConditions);
    } else {
      props?.setOrderFinances(chkDrugConditions);
    }
    setFormularyVisible(false);
  }
  return <>
    <Modal
      title={<Row align="middle" gutter={[4, 4]}>
        <Col span={12}>
          <label className='gx-text-primary fw-bold fs-5'>14.2.2 สูตรการสั่งยา</label>
        </Col>
        <Col span={12} className='text-end'>
          <Button
            className='mb-0'
            type="primary"
            onClick={() => {
              formularyDrugRef.current.createAndEditDrugRef().current.setCreateVisible(true);
              formularyDrugRef.current.createAndEditDrugRef().current.setCheckEdit(false);
            }}
            icon={<PlusOutlined />}
          />
        </Col>
      </Row>}
      centered
      visible={formularyVisible}
      onCancel={closeFormulasDrugModal}
      closable={false}
      width={1200}
      footer={[<Row justify="center" key="footer">
        <Button key="cancel" onClick={closeFormulasDrugModal}>ออก</Button>
        <Button
          // disabled={!formularyDrugRef?.current?.getCheckedList()?.length}
          key="ok"
          type="primary"
          onClick={() => handleSaveSelectedFormulasDrug()}
          loading={loading}
        >
          ตกลง
        </Button>
      </Row>]}>
      <Spin spinning={loading}>
        <FormulasDrug
          ref={formularyDrugRef}
          workId={workId}
          doctorId={doctorId}
          loading={loading}
          setLoading={setLoading}
          optionsConvertDose={optionsConvertDose}
        />
      </Spin>
    </Modal>
  </>;
});
export { AddOrder, FormulasDrug, FormulasDrugModal, CreateAndEditFormulasDrug };