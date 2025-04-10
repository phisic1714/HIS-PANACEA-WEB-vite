import { env } from '../../env.js';
import { Avatar, Button, Col, Divider, Image, Modal, Row, Table, Spin, Form, Select, Card, Popconfirm, InputNumber, List, Badge, Checkbox } from 'antd';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import flaskIcon from '@iconify/icons-iconoir/flask';
import saveIcon from '@iconify/icons-la/save';
import radiationAlt from '@iconify/icons-la/radiation-alt';
import notesMedical from '@iconify/icons-la/notes-medical';
import styled from 'styled-components';
import { AddActivity } from './AddActivity';
import axios from 'axios';
import moment from 'moment';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { FaCog, FaTrash } from 'react-icons/fa';
import '../../routes/OpdClinic/Styles/Appointment.less';
import Notifications from './Notifications';
import { nanoid } from 'nanoid';
import { filter, isEqual, map, reverse, sumBy, toNumber } from 'lodash';
import ScreeningAddLabItem from '../../routes/OpdClinic/Components/ScreeningAddLabItem';
import ScreeningXRay from '../../routes/OpdClinic/Components/ScreeningXRay';
import ScreeningAddOrderItem from '../../routes/OpdClinic/Components/ScreeningAddOrderItem';
import { PrintFormReport } from '../qzTray/PrintFormReport';
import { GetExpenseByFormulaId } from '../../routes/OpdClinic/API/AppointmentApi';
import dayjs from 'dayjs';
const Column = Table.Column;
const TableCustomHeader = styled(Table)`
thead > tr > th {
    background-color: #F0F7EB;
  },
  .ant-table-cell.nopadding {
  padding: 0;
}
`;
const CardCustom = styled(Card)`
  .ant-card-body{
    padding:0px;
    margin:0px;
  }
  .ant-card{
      margin: 5px 0px 5px 0px;
  }
  `;
const NumberInput = styled(InputNumber)`
  .ant-input-number-input {
      margin-right:0px;
      text-align:end!important;
  }
  .ant-input-number-handler-wrap{
  display: none;
}
  `;
const CustomModal = styled(Modal)`
  .ant-modal-content{

  }
  .ant-modal-header{
    padding:5px 5px;
  }
  .ant-card{
      margin:0px
  }
  .ant-modal-body{
      padding:12px;
  }
  `;
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;
export default function EditAppointmentDesc({
  visible,
  patient,
  onOpen = () => { },
  onClose,
  onUpdate,
  loadingEdit,
  appointMasterPackageList,
  viewOnly = false
},) {
  //Modal ยกเลิกนัด
  const [showCancelAppointmentRemark, setShowCancelAppointmentRemark] = useState(false);
  //Modal กิจกรรม
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  //AppointDetail
  const [appointDetail, setAppointDetail] = useState(null);
  // console.log('appointDetail', appointDetail)
  //Appoint หลายวัน
  const [appointDayList, setAppointDayList] = useState([]);
  //loading
  const [loading, setLoading] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(false);
  //Dropdown
  const [cancelReasonList, setCancelReasonList] = useState([]);
  const [howToReceiveList, setHowToReceiveList] = useState([]);
  const [formCancel] = Form.useForm();

  //activity
  const [appointActivity, setAppointActivity] = useState([]);
  const [appointActivityPrev, setAppointActivityPrev] = useState([]);
  //result modal
  const [showProcessResultModal, setShowProcessResultModal] = useState(false);
  const [titletoModal, setTitleToModal] = useState(null);

  //lab
  const [screeningAddLabItemActive, setScreeningAddLabItemActive] = useState(false);
  //xray
  const [screeningAddXrayItemActive, setScreeningAddXrayItemActive] = useState(false);
  //order
  const [screeningAddOrderItemActive, setScreeningAddOrderItemActive] = useState(false);
  const [refillFlag, setRefillFlag] = useState(false);
  const [drugNo, setDrugNo] = useState(null);
  const [howToReceive, setHowtoReceive] = useState(null);

  // คำนวณค่าใช้จ่าย
  const calculateExpense = expenseValues => {
    // console.log("ค่าที่เข้าไปคำนวณ-------------------------->", expenseValues);
    let calculateExpenseResult = {
      rate: "0",
      credit: "0",
      cashReturn: "0",
      cashNotReturn: "0",
      minRate: "0",
      maxRate: "0",
      rateByUser: "NO"
    };
    // ผู้ป่วย OPD    
    if (expenseValues) {
      if (expenseValues.expRightId !== null) {
        // ราคา
        if (expenseValues.opdRate !== null) {
          // console.log("ราคา = ", expenseValues.opdRate);
          // console.log("opdRate : ", expenseValues.opdRate);
          let result = calculateExpenseResult;
          result.rate = expenseValues.opdRate;
          result.rateByUser = "NO";
          result.minRate = "0";
          result.maxRate = "0";
          calculateExpenseResult = result;
          // setCalculateExpenseResult(result)
        } else {
          if (expenseValues.minRate === expenseValues.maxRate) {
            // console.log("ราคา = ", expenseValues.maxRate);
            // console.log("maxRate : ", expenseValues.maxRate);
            let result = calculateExpenseResult;
            result.rate = expenseValues.maxRate;
            result.rateByUser = "NO";
            result.minRate = "0";
            result.maxRate = "0";
            calculateExpenseResult = result;
          } else {
            // console.log("minRate !== maxRate : ", expenseValues.minRate, " - ", expenseValues.maxRate);
            let result = calculateExpenseResult;
            result.rateByUser = "YES";
            result.rate = expenseValues.minRate ? expenseValues.minRate : "0";
            result.minRate = expenseValues.minRate;
            result.maxRate = expenseValues.maxRate;
            calculateExpenseResult = result;
          }
        }
        // เครดิต เบิกได้ เบิกไม่ได้
        if (expenseValues.cashFlag !== null) {
          // console.log("เลือกชำระเอง สนใจเบิกได้");
          if (expenseValues.cashFlag === "Y" && expenseValues.cscdFlag === "Y") {
            // console.log("เบิกได้ ใส่ค่า cscdRate (กรมบัญชีกลาง) = ", expenseValues.cscdRate);
            let result = calculateExpenseResult;
            result.cashReturn = expenseValues.cscdRate;
            calculateExpenseResult = result;
          } else {
            if (expenseValues.opdCashReturn === null) {
              // console.log("เบิกได้ ใส่ค่า opdRate เต็มจำนวน = ", expenseValues.opdRate);
              let result = calculateExpenseResult;
              result.cashReturn = expenseValues.opdRate;
              calculateExpenseResult = result;
            } else {
              // console.log("เช่น ถ้าราคา 100 เบิกได้ 20 ช่อง Credit ใส่ 0.00 CashReturn ใส่ 20 CashNoReturn ใส่ 80");
              let result = calculateExpenseResult;
              result.credit = "0";
              result.cashReturn = expenseValues.opdCashReturn;
              result.cashNotReturn = String(toNumber(calculateExpenseResult.rate) - toNumber(expenseValues.opdCashReturn));
              calculateExpenseResult = result;
            }
          }
        } else {
          // console.log("ไม่เลือกชำระเอง สนใจเครดิต");
          if (expenseValues.opdRate !== null) {
            // expenseValues.opdRate !== null
            if (expenseValues.opdCredit === null) {
              // console.log("เครดิต ใส่ค่า opdRate เต็มจำนวน = ", expenseValues.opdRate);
              let result = calculateExpenseResult;
              result.credit = expenseValues.opdRate;
              calculateExpenseResult = result;
            } else {
              if (toNumber(expenseValues.opdRate) >= toNumber(expenseValues.opdCredit) + toNumber(expenseValues.opdCashReturn)) {
                // console.log("เครดิต ใส่ค่า opdCredit เต็มจำนวน = ", expenseValues.opdCredit);
                // console.log("เบิกได้ ใส่ค่า opdCashReturn เต็มจำนวน = ", expenseValues.opdCashReturn);
                // console.log("เบิกไม่ได้ ใส่ค่า Rate - (Credit + CashReturn) = ", expenseValues.opdRate - (expenseValues.opdCredit + expenseValues.opdCashReturn));
                let result = calculateExpenseResult;
                result.credit = expenseValues.opdCredit;
                result.cashReturn = expenseValues.opdCashReturn;
                result.cashNotReturn = String(toNumber(expenseValues.opdRate) - (toNumber(expenseValues.opdCredit) + toNumber(expenseValues.opdCashReturn)));
                calculateExpenseResult = result;
              } else {
                if (toNumber(expenseValues.opdRate) <= toNumber(expenseValues.opdCredit)) {
                  // console.log("เครดิต ใส่ค่า opdCredit = ", expenseValues.opdCredit);
                  // console.log("เบิกได้ ใส่ค่า 0 = ", "0");
                  let result = calculateExpenseResult;
                  result.credit = expenseValues.opdCredit;
                  result.cashReturn = "0";
                  calculateExpenseResult = result;
                } else {
                  // console.log("เครดิต ใส่ค่า opdCredit = ", expenseValues.opdCredit);
                  // console.log("เบิกได้ ใส่ค่า CashReturn - (Rate - Credit) = ", expenseValues.opdCashReturn - (expenseValues.opdRate - expenseValues.opdCredit));
                  let result = calculateExpenseResult;
                  result.credit = expenseValues.opdCredit;
                  result.cashReturn = String(toNumber(expenseValues.opdCashReturn) - (toNumber(expenseValues.opdRate) - toNumber(expenseValues.opdCredit)));
                  calculateExpenseResult = result;
                }
              }
            }
          } else {
            // expenseValues.opdRate === null
            if (expenseValues.minRate === expenseValues.maxRate) {
              if (expenseValues.opdCredit === null) {
                // console.log("เครดิต ใส่ค่า maxRate เต็มจำนวน = ", expenseValues.maxRate);
                let result = calculateExpenseResult;
                result.credit = expenseValues.maxRate;
                calculateExpenseResult = result;
              } else {
                if (toNumber(expenseValues.maxRate) >= toNumber(expenseValues.opdCredit) + toNumber(expenseValues.opdCashReturn)) {
                  // console.log("เครดิต ใส่ค่า opdCredit เต็มจำนวน = ", expenseValues.opdCredit);
                  // console.log("เบิกได้ ใส่ค่า opdCashReturn เต็มจำนวน = ", expenseValues.opdCashReturn);
                  // console.log("เบิกไม่ได้ ใส่ค่า Rate - (Credit + CashReturn) = ", expenseValues.maxRate - (expenseValues.opdCredit + expenseValues.opdCashReturn));
                  let result = calculateExpenseResult;
                  result.credit = expenseValues.opdCredit;
                  result.cashReturn = expenseValues.opdCashReturn;
                  result.cashNotReturn = String(toNumber(expenseValues.opdRate) - (toNumber(expenseValues.opdCredit) + toNumber(expenseValues.opdCashReturn)));
                  calculateExpenseResult = result;
                } else {
                  if (toNumber(expenseValues.maxRate) <= toNumber(expenseValues.opdCredit)) {
                    // console.log("เครดิต ใส่ค่า opdCredit = ", expenseValues.opdCredit);
                    // console.log("เบิกได้ ใส่ค่า 0 = ", "0");
                    let result = calculateExpenseResult;
                    result.credit = expenseValues.opdCredit;
                    result.cashReturn = "0";
                    calculateExpenseResult = result;
                  } else {
                    // console.log("เครดิต ใส่ค่า opdCredit = ", expenseValues.opdCredit);
                    // console.log("เบิกได้ ใส่ค่า CashReturn - (Rate - Credit) = ", expenseValues.opdCashReturn - (expenseValues.maxRate - expenseValues.opdCredit));
                    let result = calculateExpenseResult;
                    result.credit = expenseValues.opdCredit;
                    result.cashReturn = String(toNumber(expenseValues.opdCashReturn) - (toNumber(expenseValues.maxRate) - toNumber(expenseValues.opdCredit)));
                    calculateExpenseResult = result;
                  }
                }
              }
            } else {
              // console.log("minRate&maxRate ไม่เท่ากัน");
              let result = calculateExpenseResult;
              result.credit = expenseValues.opdCredit;
              result.cashReturn = expenseValues.opdCashReturn;
              calculateExpenseResult = result;
            }
          }
        }
      } else {
        if (expenseValues.minRate === expenseValues.maxRate) {
          // console.log("ราคา = ", expenseValues.maxRate);
          let result = calculateExpenseResult;
          result.rate = expenseValues.maxRate;
          calculateExpenseResult = result;
          if (expenseValues.meaningFlag !== null) {
            if (expenseValues.meaningFlag === "G" || expenseValues.meaningFlag === "L") {
              if (expenseValues.cscdFlag === "Y") {
                // console.log("เบิกได้ ใส่ค่า cscdRate = ", expenseValues.cscdRate);
                let result = calculateExpenseResult;
                result.cashReturn = expenseValues.cscdRate;
                calculateExpenseResult = result;
              } else {
                // console.log("เบิกไม่ได้ ใส่ค่า Rate เต็มจำนวน");
                let result = calculateExpenseResult;
                result.cashNotReturn = expenseValues.maxRate;
                calculateExpenseResult = result;
              }
            }
            if (expenseValues.meaningFlag === "S") {
              if (expenseValues.ssoFlag === "Y") {
                // console.log("เบิกได้ ใส่ค่า ssoRate = ", expenseValues.ssoRate);
                let result = calculateExpenseResult;
                result.cashReturn = expenseValues.ssoRate;
                calculateExpenseResult = result;
              } else {
                // console.log("เบิกไม่ได้ ใส่ค่า Rate เต็มจำนวน")
                let result = calculateExpenseResult;
                result.cashNotReturn = expenseValues.maxRate;
                calculateExpenseResult = result;
              }
            }
            if (expenseValues.meaningFlag === "I") {
              if (expenseValues.insuranceFlag === "Y") {
                // console.log("เบิกได้ ใส่ค่า insuranceRate = ", expenseValues.insuranceRate);
                let result = calculateExpenseResult;
                result.cashReturn = expenseValues.insuranceRate;
                calculateExpenseResult = result;
              } else {
                // console.log("เบิกไม่ได้ ใส่ค่า Rate เต็มจำนวน")
                let result = calculateExpenseResult;
                result.cashNotReturn = expenseValues.maxRate;
                calculateExpenseResult = result;
              }
            }
            if (expenseValues.meaningFlag === "U") {
              if (expenseValues.nhsoFlag === "Y") {
                // console.log("เบิกได้ ใส่ค่า nhsoRate = ", expenseValues.nhsoRate);
                let result = calculateExpenseResult;
                result.cashReturn = expenseValues.nhsoRate;
                calculateExpenseResult = result;
              } else {
                // console.log("เบิกไม่ได้ ใส่ค่า Rate เต็มจำนวน")
                let result = calculateExpenseResult;
                result.cashNotReturn = expenseValues.maxRate;
                calculateExpenseResult = result;
              }
            }
            if (expenseValues.meaningFlag === "A") {
              if (expenseValues.alienFlag === "Y") {
                // console.log("เบิกได้ ใส่ค่า alienRate = ", expenseValues.alienRate);
                let result = calculateExpenseResult;
                result.cashReturn = expenseValues.alienRate;
                calculateExpenseResult = result;
              } else {
                // console.log("เบิกไม่ได้ ใส่ค่า Rate เต็มจำนวน")
                let result = calculateExpenseResult;
                result.cashNotReturn = expenseValues.maxRate;
                calculateExpenseResult = result;
              }
            }
          } else {
            let result = calculateExpenseResult;
            result.cashNotReturn = expenseValues.maxRate;
            calculateExpenseResult = result;
          }
        } else {
          // console.log("ให้ User กรอกราคาเอง");
          let result = calculateExpenseResult;
          result.rate = expenseValues.minRate ? expenseValues.minRate : "0";
          calculateExpenseResult = result;
        }
      }
      return calculateExpenseResult;
    } else {
      let noCalclate = {
        rate: "0",
        credit: "0",
        cashReturn: "0",
        cashNotReturn: "0",
        minRate: "0",
        maxRate: "0",
        rateByUser: "NO"
      };
      return noCalclate;
    }
  };
  // Get Appoint Detail 
  const GetAppointDetail = async id => {
    setLoading(true);
    let final = [];
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetAppointDetail/${id}`, {
      method: "POST"
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess) {
      setAppointDetail(res.responseData);
      setDrugNo(res.responseData?.drugNo || null);
      setHowtoReceive(res.responseData?.howtoReceive || "");
      setRefillFlag(res.responseData?.refillFlag ? true : false);
      onOpen(res.responseData);
      if (res.responseData.appointActivities.length > 0) {
        let data = await res.responseData.appointActivities.map((item,) => {
          return {
            key: nanoid(),
            ...item,
            rate: 0,
            quantity: +item.quantity,
            name: item.activityDesc
          };
        });
        await Promise.all(data.map(async item => {
          if (item.expenseId) {
            let result = await GetCalculatExpenses(item.expenseId).then(value => value);
            return {
              ...item,
              ...result
            };
          } else {
            return item;
          }
        })).then(function (results) {
          console.log(results);
          final = results;
        });
        // console.log("data", final);
        setAppointActivityPrev(final);
        setAppointActivity(final);
      } else {
        setAppointActivityPrev([]);
        setAppointActivity([]);
      }
    } else {
      console.log("error_code", res.errorCode, "error_message", res.errorMessage);
    }
    setLoading(false);
  };
  const GetHowToReceieve = async () => {
    let HowtoReceive = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`, {
      method: "POST",
      data: {
        "mode": "string",
        "user": "string",
        "ip": "string",
        "lang": "string",
        "branch_id": "string",
        "requestData": {
          "table": "TB_APPOINTS",
          "field": "HowtoReceive"
        },
        "barcode": "string"
      }
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    // console.log("testhowtoReceive", HowtoReceive.responseData);
    if (HowtoReceive?.isSuccess) {
      if (HowtoReceive.responseData) {
        setHowToReceiveList(HowtoReceive.responseData);
      } else {
        setHowToReceiveList([]);
      }
    } else {
      setHowToReceiveList([]);
    }
  };
  const GetCalculatExpenses = async detail => {
    let price = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/Finances/GetDateCalculatExpenses/${detail}, ${patient?.rightId || "x000"}`).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (price.isSuccess) {
      if (price.responseData) {
        let data = calculateExpense(price.responseData);
        return {
          ...data,
          name: price.responseData.expenseName
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  const getExpenseByFormulaId = async package_id => {
    setLoadingPackage(true);
    let res = await GetExpenseByFormulaId(package_id);
    if (res.isSuccess) {
      let duplicate = [];
      let notduplicate = [];
      if (res.responseData.length > 0) {
        let data = await res.responseData.map(item => {
          return {
            key: nanoid(),
            quantity: 1,
            ...item
          };
        });
        await Promise.all(data.map(async item => {
          if (item.expenseId) {
            let result = await GetCalculatExpenses(item.expenseId).then(value => value);
            return {
              ...item,
              ...result
            };
          } else {
            return item;
          }
        })).then(function (results) {
          // console.log(results);
          data = results;
        });
        duplicate = await data.map(item => appointActivity.filter(child => child.expenseId === item.expenseId)).flat();
        /* eslint-disable array-callback-return */
        notduplicate = await data.map(item => {
          if (appointActivity.filter(child => child.expenseId === item.expenseId).length === 0) {
            return item;
          }
        });
        if (appointActivity.length > 0) {
          if (duplicate.length > 0) {
            notduplicate = await notduplicate.filter(item => item !== undefined);
            setAppointActivity([...appointActivity, ...notduplicate]);
            info({
              type: 'info',
              info: <>
                <div>package ซ้ำ</div>
                <br />
                <List style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "start"
                }}>{duplicate.map((item, index) => <List.Item key={index}><Badge color="yellow" />{item.name}</List.Item>)}</List>
              </>
            });
          } else {
            setAppointActivity([...appointActivity, ...data]);
          }
        } else {
          setAppointActivity(data);
        }
      } else {
        console.log("nodata");
      }
    } else {
      console.log("PackageList error", `${res.errorMessage}`);
    }
    setLoadingPackage(false);
  };

  //Update Appoint
  const UpdAppoints = async (val, type) => {
    setLoading(true);
    let detail = appointDetail;
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpdAppoints`,
      method: "POST",
      data: {
        requestData: {
          appointType: detail.appointType,
          // 1 slap 2 slot
          appointId: detail.appointId,
          appointDate: dayjs(detail.appointDate, "MM/DD/YYYY").format("YYYY-MM-DD"),
          startTime: detail.startTime,
          endTime: detail.endTime,
          duration: detail.duration,
          patientId: detail.patientId,
          runHn: detail.runHn,
          yearHn: detail.yearHn,
          hn: detail.hn,
          workId: detail.workId,
          rightId: detail.rightId,
          doctor: detail.doctor,
          referId: detail.referId,
          serviceId: detail.serviceId,
          admitId: detail.admitId,
          queueId: detail.queueId,
          queueBranch: detail.queueBranch,
          newFlag: detail.newFlag,
          appointStatus: type ? type : detail.status,
          //ถ้ามี คือ "P" เลื่อนนัด "C" ยกเลิกนัด "I" แทรกนัด
          confirmStatus: detail.confirmStatus,
          postAppointId: detail.postAppointId,
          remark: detail.remark,
          userCreated: null,
          dateCreated: null,
          userModified: user,
          cancelReason: type ? val.cancelReason : detail.cancelReason,
          dateModified: moment().format("YYYY-MM-DD HH:mm:ss"),
          clinicId: detail.clinicId,
          mapping1: detail.mapping1,
          fromWork: detail.fromWork,
          displayName: detail.displayName,
          drugNo: refillFlag ? drugNo ? drugNo + "" : "" : "",
          howToReceive: refillFlag ? howToReceive : null,
          refillFlag: refillFlag ? "Y" : null
        }
      }
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess) {
      onUpdate(detail, type);
      setAppointDetail(null);
    } else {
      function title(type) {
        switch (type) {
          case "P":
            return "เลื่อนนัด";
          case "C":
            return "ยกเลิกนัด";
          case "I":
            return "แทรกนัด";
          default:
            return "บันทึก";
        }
      }
      faild(type ? title(type) : "บันทึก");
      console.log("error_code", res.errorCode, "error_message", res.errorMessage);
    }
    setLoading(false);
  };
  const upSertAppointActivities = async val => {
    setLoading(true);
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpSertAppointActivities`,
      method: "POST",
      data: {
        requestData: val
      }
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess) {
      success("บันทึก");
      await UpdAppoints();
      onUpdate(appointDetail, null);
      onClose();
      setAppointDetail(null);
    } else {
      faild("บันทึก");
      console.log("error_code", res.errorCode, "error_message", res.errorMessage);
    }
    setLoading(false);
  };
  const handleSave = async () => {
    //เทียบกับ prevAppointActivity ถ้าเป็นตัวที่มีอยู่แล้ว update ถ้าไม่มีให้ insert
    //ถ้าตัวที่มีอยู่หายไปให้ delete
    //ตัวไหน delete ให้ทำก่อน ต่อมา update แล้วค่อย insert
    // console.log("prevAppointActivity", appointActivityPrev);
    // console.log("appointActivity", appointActivity);
    // console.log("appointDetail", appointDetail);
    let data = [];
    //ถ้ามีกิจกรรมทั้งก่อนและหลัง
    if (appointActivityPrev.length > 0 && appointActivity.length > 0) {
      if (isEqual(appointActivity, appointActivityPrev)) {
        UpdAppoints();
        success("บันทึก");
        onClose();
        setAppointDetail(null);
        return;
      }
      //ถ้ามีกิจกรรมเดิม         
      let cleanNonPrev = appointActivity.filter(item => !!item.appActId);
      // console.log("cleanNonPrev", cleanNonPrev);
      //ถ้ากิจกรรมเดิมมีเท่าเดิม update ทั้งหมด
      if (cleanNonPrev.length === appointActivityPrev.length && appointActivityPrev.length === appointActivity.length) {
        data = appointActivity.map((item,) => {
          return {
            appActId: item.appActId,
            appointId: appointDetail.appointId,
            activityId: item.activityId ? item.activityId : null,
            activityDesc: item.name,
            otherFlag: null,
            userCreated: item.appActId ? item.userCreated : user,
            dateCreated: item.appActId ? item.dateCreated : moment().format("YYYY-MM-DD HH:mm:ss"),
            userModified: user,
            dateModified: moment().format("YYYY-MM-DD HH:mm:ss"),
            financeType: item.financeType ? item.financeType : null,
            expenseId: item.expenseId ? item.expenseId : null,
            quantity: item.quantity ? item.quantity + "" : "1",
            mapping1: null,
            appointDate: moment(appointDetail.appointDate, "MM/DD/YYYY").format("YYYY-MM-DD"),
            workId: appointDetail.fromWork,
            financeId: item.financeId ? item.financeId : null,
            icd: item.icd ? item.icd : null,
            action: "update"
          };
        });
        upSertAppointActivities(data);
        return;
      }
      // ถ้ากิจกรรมเดิมมีน้อยกว่าปัจจุบัน ลบทั้งหมดก่อน ต่อมา insert ทั้งหมด
      // if(cleanNonPrev.length>0&&cleanNonPrev.length<appointActivityPrev.length){
      data = appointActivity.map((item,) => {
        if (item.appActId) {
          return {
            appActId: item.appActId,
            appointId: appointDetail.appointId,
            activityId: item.activityId ? item.activityId : null,
            activityDesc: item.name,
            otherFlag: null,
            userCreated: item.userCreated,
            dateCreated: item.dateCreated,
            userModified: user,
            dateModified: moment().format("YYYY-MM-DD HH:mm:ss"),
            financeType: item.financeType ? item.financeType : null,
            expenseId: item.expenseId ? item.expenseId : null,
            quantity: item.quantity ? item.quantity + "" : "1",
            mapping1: null,
            appointDate: moment(appointDetail.appointDate, "MM/DD/YYYY").format("YYYY-MM-DD"),
            workId: appointDetail.fromWork,
            financeId: item.financeId ? item.financeId : null,
            icd: item.icd ? item.icd : null,
            action: "update"
          };
        } else {
          return {
            appActId: null,
            appointId: appointDetail.appointId,
            activityId: item.activityId ? item.activityId : null,
            activityDesc: item.name,
            otherFlag: null,
            userCreated: user,
            dateCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
            userModified: null,
            dateModified: null,
            financeType: item.financeType ? item.financeType : null,
            expenseId: item.expenseId ? item.expenseId : null,
            quantity: item.quantity ? item.quantity + "" : "1",
            mapping1: null,
            appointDate: moment(appointDetail.appointDate, "MM/DD/YYYY").format("YYYY-MM-DD"),
            workId: appointDetail.fromWork,
            financeId: item.financeId ? item.financeId : null,
            icd: item.icd ? item.icd : null,
            action: "insert"
          };
        }
      });
      // console.log("before del", data);
      if (cleanNonPrev.length > 0 && cleanNonPrev.length < appointActivityPrev.length) {
        // console.log("เข้า");
        let del = [];
        appointActivityPrev.map(item => {
          if (filter(cleanNonPrev, {
            appActId: item.appActId
          }).length === 0) {
            // console.log("not del")
            del.push({
              ...item,
              appActId: item.appActId,
              appointId: appointDetail.appointId,
              activityId: item.activityId ? item.activityId : null,
              activityDesc: item.name,
              otherFlag: null,
              userCreated: item.userCreated,
              dateCreated: item.dateCreated,
              userModified: user,
              dateModified: moment().format("YYYY-MM-DD HH:mm:ss"),
              financeType: item.financeType ? item.financeType : null,
              expenseId: item.expenseId ? item.expenseId : null,
              quantity: item.quantity ? item.quantity + "" : "1",
              mapping1: null,
              appointDate: moment(appointDetail.appointDate).format("MM/DD/YYYY"),
              workId: appointDetail.fromWork,
              financeId: item.financeId ? item.financeId : null,
              icd: item.icd ? item.icd : null,
              action: "delete"
            });
          }
          return item;
        });
        if (del.length > 0) {
          data = [...del, ...data];
        }
        // console.log("del", del);
        // console.log("del_data", data);
      }
      await upSertAppointActivities(data);
      // console.log("data upsert", data);

    }
    //ไม่มีกิจกรรมมาก่อน
    if (appointActivityPrev.length === 0 && appointActivity.length > 0) {
      data = appointActivity.map((item,) => {
        return {
          appActId: null,
          appointId: appointDetail.appointId,
          activityId: item.activityId ? item.activityId : null,
          activityDesc: item.name,
          otherFlag: null,
          userCreated: appointDetail.appointId ? appointDetail.userCreated : user,
          dateCreated: appointDetail.appointId ? appointDetail.dateCreated : moment().format("MM/DD/YYYY HH:mm:ss"),
          userModified: user,
          dateModified: moment().format("MM/DD/YYYY HH:mm:ss"),
          financeType: item.financeType ? item.financeType : null,
          expenseId: item.expenseId ? item.expenseId : null,
          quantity: item.quantity ? item.quantity + "" : "1",
          mapping1: null,
          appointDate: moment(appointDetail.appointDate).format("MM/DD/YYYY"),
          workId: appointDetail.fromWork,
          financeId: item.financeId ? item.financeId : null,
          icd: item.icd ? item.icd : null,
          action: "insert"
        };
      });
      await upSertAppointActivities(data);
    }
    //มีกิจกรรมมาก่อนแตตอนหลังไม่มี
    if (appointActivityPrev.length > 0 && appointActivity.length === 0) {
      data = appointActivityPrev.map((item,) => {
        return {
          appActId: item.appActId,
          appointId: appointDetail.appointId,
          activityId: item.activityId ? item.activityId : null,
          activityDesc: item.name,
          otherFlag: null,
          userCreated: appointDetail.appointId ? appointDetail.userCreated : user,
          dateCreated: appointDetail.appointId ? appointDetail.dateCreated : moment().format("MM/DD/YYYY HH:mm:ss"),
          userModified: user,
          dateModified: moment().format("MM/DD/YYYY HH:mm:ss"),
          financeType: item.financeType ? item.financeType : null,
          expenseId: item.expenseId ? item.expenseId : null,
          quantity: item.quantity ? item.quantity + "" : "1",
          mapping1: null,
          appointDate: moment(appointDetail.appointDate).format("MM/DD/YYYY"),
          workId: appointDetail.fromWork,
          financeId: item.financeId ? item.financeId : null,
          icd: item.icd ? item.icd : null,
          action: "delete"
        };
      });
      await upSertAppointActivities(data);
    }
    //ถ้าไม่มีกิจกรรมทั้งก่อนและหลัง
    if (appointActivityPrev.length === 0 && appointActivity.length === 0) {
      UpdAppoints();
      success("บันทึก");
      onClose();
      setAppointDetail(null);
    }
  };

  //CancelReason
  const getCancelReason = async () => {
    if (cancelReasonList.length !== 0) return;
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetCancelReason`).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess) {
      setCancelReasonList(res.responseData);
    } else {
      console.log("cancelReason error", `${res.errorMessage}`);
    }
  };
  const handleCancleAppointFinish = async val => {
    await UpdAppoints(val, "C");
    formCancel.resetFields();
    setShowCancelAppointmentRemark(false);
  };
  const onMinusClick = item => {
    if (item.quantity > 1) {
      let newItem = {
        ...item
      };
      newItem.quantity -= 1;
      setAppointActivity(appointActivity.map(item => item.key === newItem.key ? newItem : item));
    }
  };
  const onPlusClick = item => {
    if (item.quantity <= 100) {
      let newItem = {
        ...item
      };
      newItem.quantity += 1;
      setAppointActivity(appointActivity.map(item => item.key === newItem.key ? newItem : item));
    }
  };
  const onChangeActivityQuantity = (item, val) => {
    let value = +val;
    if (value >= 1 && value <= 100) {
      let newItem = {
        ...item
      };
      newItem.quantity = value;
      setAppointActivity(appointActivity.map(item => item.key === newItem.key ? newItem : item));
    }
  };
  const onDeleteActivity = key => {
    console.log("key", key);
    let newAppointActivityList = appointActivity.filter(item => item.key !== key);
    setAppointActivity(newAppointActivityList);
  };
  const success = param => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param}สำเร็จ`,
      type: "success"
    });
  };
  const faild = param => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param}ไม่สำเร็จ`,
      type: "warning"
    });
  };
  const info = param => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: param.info,
      type: param.type
    });
  };
  const handleScreeningAddLabItemModal = async values => {
    // console.log('handleScreeningAddLabItemModal', values)
    let data = values ? values : [];
    let duplicate = [];
    let notduplicate = [];
    if (data.length > 0) {
      data = await data.map(item => {
        return {
          ...item,
          key: nanoid(),
          rate: 0,
          quantity: null,
          financeType: "L"
        };
      });
      await Promise.all(data.map(async item => {
        if (item.expenseId) {
          let result = await GetCalculatExpenses(item.expenseId).then(value => value);
          return {
            ...item,
            ...result
          };
        } else {
          return item;
        }
      })).then(function (results) {
        console.log(results);
        data = results;
      });
      duplicate = await data.map(item => appointActivity.filter(child => child.expenseId === item.expenseId)).flat();
      /* eslint-disable array-callback-return */
      notduplicate = await data.map(item => {
        if (appointActivity.filter(child => child.expenseId === item.expenseId).length === 0) {
          return item;
        }
      });
      if (appointActivity.length > 0) {
        if (duplicate.length > 0) {
          notduplicate = await notduplicate.filter(item => item !== undefined);
          setAppointActivity([...appointActivity, ...notduplicate]);
          info({
            type: 'info',
            info: <>
              <div>มี Lab ซ้ำในรายการที่เพิ่ม</div>
              <br />
              <List style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "start"
              }}>{duplicate.map((item, index) => <List.Item key={index}><Badge color="yellow" />{item.name}</List.Item>)}</List>
            </>
          });
        } else {
          setAppointActivity([...appointActivity, ...data]);
        }
      } else {
        setAppointActivity(data);
      }
    }
    setScreeningAddLabItemActive(!screeningAddLabItemActive);
  };
  const handleScreeningAddXrayItemModal = async values => {
    // console.log('handleScreeningAddXrayItemModal', values)
    let data = values ? values : [];
    let duplicate = [];
    let notduplicate = [];
    if (data.length > 0) {
      data = await data.map(item => {
        return {
          ...item,
          name: item.nameXRay,
          rate: 0,
          key: nanoid(),
          quantity: null,
          financeType: "X"
        };
      });
      await Promise.all(data.map(async item => {
        if (item.expenseId) {
          let result = await GetCalculatExpenses(item.expenseId).then(value => value);
          return {
            ...item,
            ...result
          };
        } else {
          return item;
        }
      })).then(function (results) {
        console.log(results);
        data = results;
      });
      duplicate = await data.map(item => appointActivity.filter(child => child.expenseId === item.expenseId)).flat();
      /* eslint-disable array-callback-return */
      notduplicate = await data.map(item => {
        if (appointActivity.filter(child => child.expenseId === item.expenseId).length === 0) {
          return item;
        }
      });
      if (appointActivity.length > 0) {
        if (duplicate.length > 0) {
          notduplicate = await notduplicate.filter(item => item !== undefined);
          setAppointActivity([...appointActivity, ...notduplicate]);
          info({
            type: 'info',
            info: <>
              <div>มีXrayซ้ำในรายการที่เพิ่ม</div>
              <br />
              <List style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "start"
              }}>{duplicate.map((item, index) => <List.Item key={index}><Badge color="yellow" />{item.name}</List.Item>)}</List>
            </>
          });
        } else {
          setAppointActivity([...appointActivity, ...data]);
        }
      } else {
        setAppointActivity(data);
      }
    }
    setScreeningAddXrayItemActive(!screeningAddXrayItemActive);
  };
  const handleScreeningAddOrderItemModal = async values => {
    // console.log("handleScreeningAddOrderItemModal", values);
    let data = values ? values : [];
    let duplicate = [];
    let notduplicate = [];
    if (data.length > 0) {
      data = await data.map(item => {
        return {
          ...item,
          key: nanoid(),
          rate: 0,
          quantity: null,
          financeType: "O"
        };
      });
      await Promise.all(data.map(async item => {
        if (item.expenseId) {
          let result = await GetCalculatExpenses(item.expenseId).then(value => value);
          return {
            ...item,
            ...result
          };
        } else {
          return item;
        }
      })).then(function (results) {
        console.log(results);
        data = results;
      });
      duplicate = await data.map(item => appointActivity.filter(child => child.expenseId === item.expenseId)).flat();
      // eslint-disable-next-line array-callback-return
      notduplicate = await data.map(item => {
        if (appointActivity.filter(child => child.expenseId === item.expenseId).length === 0) {
          return item;
        }
      });
      if (appointActivity.length > 0) {
        if (duplicate.length > 0) {
          notduplicate = await notduplicate.filter(item => item !== undefined);
          setAppointActivity([...appointActivity, ...notduplicate]);
          info({
            type: 'info',
            info: <>
              <div>มีหัตถการซ้ำในรายการที่เพิ่ม</div>
              <br />
              <List style={{
                display: "flex",
                justifyContent: "center",
                textAlign: "start"
              }}>{duplicate.map((item, index) => <List.Item key={index}><Badge color="yellow" />{item.name}</List.Item>)}</List>
            </>
          });
        } else {
          setAppointActivity([...appointActivity, ...data]);
        }
      } else {
        setAppointActivity(data);
      }
    }
    setScreeningAddOrderItemActive(!screeningAddOrderItemActive);
  };

  // useEffect(() => {
  //     console.log("appointActivity", appointActivity);
  // }, [appointActivity])

  // console.log("appointActivity", appointActivity);
  // console.log("patient", patient);
  // console.log("appointDetail", appointDetail);
  useEffect(() => {
    if (patient?.appointDayList?.length > 1 && visible) {
      // GetResultAppointsList(patient, patient?.appointDayList)
    }
    if (patient && visible) {
      GetAppointDetail(patient.appointId);
      if (howToReceiveList.length === 0) {
        GetHowToReceieve();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, patient]);
  return <div>
    <CustomModal
      centered={true}
      visible={visible}
      onCancel={() => {
        onClose();
        setAppointDetail(null);
      }}
      closable={false}
      title={<Row align="middle">
        <Col span={20}>
          <div className="text-start">
            <label className="topic-bold" style={{
              fontSize: "18px"
            }}>แก้ไขรายละเอียดการนัด</label>
          </div>
        </Col>
        <Col span={4}>
          <div className="text-end">
            <div style={{
              width: 100
            }}>
              <PrintFormReport param={{
                hn: appointDetail?.hn || null,
                appointid: appointDetail?.appointId || null
              }} /></div>
          </div>
        </Col>
      </Row>}
      footer={<div className="text-center">
        {
          appointDetail?.appointStatus ||
            moment(appointDetail?.appointDate) < moment() ||
            appointDayList.length > 1
            ? appointDetail && <Button
              type="secondary"
              style={{
                width: "100px"
              }} onClick={() => {
                onClose();
                setAppointDetail(null);
                setAppointDayList([]);
              }}>ออก</Button>
            : appointDetail
              ? !viewOnly
                ? <>
                  <Button type="secondary" style={{
                    width: "100px"
                  }} onClick={() => {
                    onClose();
                    setAppointDetail(null);
                    setAppointDayList([]);
                  }}>ออก</Button>
                  <Button type="danger" style={{
                    width: "100px"
                  }} onClick={() => {
                    setShowCancelAppointmentRemark(true);
                    getCancelReason();
                  }}>ยกเลิกนัด</Button>
                  <Button
                    type="primary"
                    style={{
                      width: "100px"
                    }}
                    onClick={() => onUpdate({
                      ...appointDetail,
                      drugNo: refillFlag ? drugNo ? drugNo + "" : "" : "",
                      howToReceive: refillFlag ? howToReceive : null,
                      refillFlag: refillFlag,
                      appointActivities: appointActivity
                    }, "P")}>เลื่อนนัด</Button>
                  <Button type="primary" style={{
                    width: "100px"
                  }} icon={<Icon width="20px" icon={saveIcon} />} onClick={() => handleSave()}>&nbsp;บันทึก</Button>
                </>
                : null
              : null
        }
      </div>} width={1000}>
      <div>
        <Spin spinning={loading || loadingEdit || loadingPackage}>
          <Row gutter={[8, 8]}>
            <Col span={3}>
              {appointDetail?.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${appointDetail.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
            </Col>
            <Col span={5}>
              <Row style={{
                padding: 0,
                margin: 0
              }}>
                <Col span={24}><label className="gx-text-primary">{`${appointDetail?.displayName}`}</label></Col>
                <Col span={24}><label>{`HN : ${appointDetail?.hn}`}</label></Col>
              </Row>
            </Col>
            <Col span={9}>
              <Row style={{
                padding: 0,
                margin: 0
              }}>
                <Col span={10}><label className="gx-text-primary">{`แพทย์ผู้นัดตรวจ`}</label></Col>
                <Col span={14}><label>{`${appointDetail?.doctorName}`}</label></Col>
                <Col span={10}><label className="gx-text-primary">{`ห้องตรวจ`}</label></Col>
                <Col span={14}><label>{`${appointDetail?.workName}`}</label></Col>
                <Col span={10}><label className="gx-text-primary">{`หมายเหตุ`}</label></Col>
                <Col span={14}><label>{`${appointDetail?.remark ? appointDetail?.remark : ""}`}</label></Col>
              </Row>
            </Col>
            <Col span={7}>
              <Row style={{
                padding: 0,
                margin: 0
              }}>
                <Col span={8}><label className="gx-text-primary">{`วันที่นัด`}</label></Col>
                <Col span={16}>
                  {/* <label>
                                            {`${moment(appointDetail?.appointDate).format("DD/MM/YYYY") === "Invalid date" ? [] : `${moment(appointDetail?.appointDate).format("DD/MM/")}${moment(appointDetail?.appointDate).add(543,"y").format("YYYY")}`}`}
                                         </label> */}
                  <Row>
                    {reverse(map(patient?.appointDayList, item => <Col span={24}>
                      <label>
                        {item?.appointDate}
                      </label>
                    </Col>))}
                    <Col span={24}>
                      <label>
                        {
                          appointDetail?.appointDate ? dayjs(appointDetail?.appointDate, "MM/DD/YYYY").format("DD/MM/BBBB") : "-"
                        }
                      </label>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}><label className="gx-text-primary">{`เวลา`}</label></Col>
                <Col span={16}><label>{`${moment(appointDetail?.startTime).format("HH:mm")} - ${moment(appointDetail?.endTime).format("HH:mm")}`}</label></Col>
                <Col span={8}><label className="gx-text-danger">{`${appointDetail?.appointStatus === "C" ? "เหตุผลที่ยกเลิก" : []}`}</label></Col>
                <Col span={16}><label>{`${appointDetail?.appointStatus === "C" ? appointDetail?.cancelReasonName || "" : []}`}</label></Col>
              </Row>
            </Col>
          </Row>
          <div style={{
            margin: "0px -23px 0px -23px"
          }}>
            <Divider />
          </div>
          <Row>
            <Col span={24}>
              <Row gutter={[8, 8]} style={{
                display: "flex",
                alignItems: "flex-end"
              }}>
                <Button className='fix' style={{
                  width: "120px",
                  marginBottom: 1,
                  alignContent: "center"
                }} type="primary" onClick={() => setShowAddActivityModal(true)} icon={<label style={{
                  fontWeight: "bold"
                }}>RX</label>}>
                  <label className="pointer" style={{
                    paddingLeft: "5px"
                  }}>กิจกรรม</label>
                </Button>
                <Button className='fix' style={{
                  width: "120px",
                  marginBottom: 1
                }} onClick={() => {
                  setScreeningAddLabItemActive(true);
                }} type="primary" icon={<label style={{
                  padding: 0
                }}><Icon style={{
                  cursor: "pointer"
                }} icon={flaskIcon} width="25px" /></label>}>
                  <label className="pointer" style={{
                    paddingLeft: "5px"
                  }}>สั่ง LAB</label>
                </Button>
                <Button className='fix' style={{
                  width: "120px",
                  marginBottom: 1
                }} onClick={() => {
                  setScreeningAddXrayItemActive(true);
                }} type="primary" icon={<label style={{
                  padding: 0
                }}><Icon style={{
                  cursor: "pointer"
                }} icon={radiationAlt} width="25px" /></label>}>
                  <label className="pointer" style={{
                    paddingLeft: "5px"
                  }}>สั่ง X-RAY</label>
                </Button>
                <Button className='fix' style={{
                  width: "120px",
                  marginBottom: 1
                }} onClick={() => {
                  setScreeningAddOrderItemActive(true);
                }} type="primary" icon={<label style={{
                  padding: 0
                }}><Icon style={{
                  cursor: "pointer"
                }} icon={notesMedical} width="25px" /></label>}>
                  <label className="pointer" style={{
                    paddingLeft: "5px"
                  }}>หัตถการ</label>
                </Button>
                <Select style={{
                  width: "130px"
                }} placeholder="เลือก Package" showSearch allowClear={true} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={appointMasterPackageList?.map(val => ({
                  value: val.datavalue,
                  label: val.datadisplay
                }))} onSelect={(value, option) => {
                  getExpenseByFormulaId(option.value);
                }}></Select>
                <Col style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 140
                }}>
                  <Checkbox checked={refillFlag} onChange={() => {
                    setRefillFlag(value => !value);
                    setHowtoReceive(null);
                  }}>
                    <label className="gx-text-primary">
                      นัดรับยา
                    </label>
                  </Checkbox>
                  <InputNumber addonBefore={"ใบสั่งยาที่"} controls={false} value={drugNo} onChange={e => setDrugNo(e)}></InputNumber>
                </Col>
                <Col style={{
                  display: "flex",
                  alignItems: "center"
                }}>
                  <label className="gx-text-primary" style={{
                    padding: "5px"
                  }}>
                    วิธีการรับยา
                  </label><Select style={{
                    width: "85px"
                  }} value={howToReceive} onSelect={e => setHowtoReceive(e)}>
                    {howToReceiveList?.map((data, index) => <Select.Option key={index} value={data.datavalue}>
                      {data.datadisplay}
                    </Select.Option>)}

                  </Select>
                </Col>


              </Row>
              <label className="gx-text-primary-bold" style={{
                padding: "5px"
              }}>
                กิจกรรมก่อนพบแพทย์
              </label>
              <TableCustomHeader dataSource={appointActivity.length > 0 ? appointActivity : []} pagination={{
                hideOnSinglePage: true
              }} scroll={{
                y: 221
              }}>
                <Column title={<label className="gx-text-primary-bold">รายการ</label>} width="30%" render={(text, record) => <div>
                  <label>{`${record.name}`}</label>
                </div>} />
                <Column title={<label className="gx-text-primary-bold">ICD10</label>} width="20%" />
                <Column align='center' className='nopadding' title={<label className="gx-text-primary-bold">จำนวน</label>} render={(text, record) => {
                  return <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-evenly"
                  }}>
                    <Button disabled={record.quantity ? false : true} onClick={() => onMinusClick(record)} style={{
                      margin: 2
                    }} type='primary' icon={<HiMinus size={"25px"} />} />
                    <NumberInput disabled={record.quantity ? false : true} controls={false} onChange={e => onChangeActivityQuantity(record, e)} style={{
                      width: "50px",
                      fontSize: "15px",
                      padding: "auto 2px auto 2px",
                      marginRight: "0px"
                    }} className='hidestep' min={record.quantity ? 1 : 1} max={100} value={record.quantity ? record.quantity : 1} />
                    <Button disabled={record.quantity ? false : true} onClick={() => onPlusClick(record)} style={{
                      margin: 2
                    }} type='primary' icon={<HiPlus size={"25px"} />} />
                  </div>;
                }} width="15%" />
                <Column title={<label className="gx-text-primary-bold">ราคา</label>} width="10%" render={(text, record) => <div>
                  <label>{`${(record.rate ? +record.rate : 0) * (record.quantity ? +record.quantity : 1)}`}</label>
                </div>} />
                {/* <Column title={<label className="gx-text-primary-bold">เครดิต</label>} width="10%"
                                        render={(text, record) => (
                                            <div>
                                                <label>{`${record.credit ? record.credit : []}`}</label>
                                            </div>
                                        )}
                                     /> */}
                <Column title={<label className="gx-text-primary-bold">เบิกได้</label>} width="10%" render={(text, record) => <div>
                  <label>{`${(record.cashReturn ? record.cashReturn : 0) * (record.quantity ? +record.quantity : 1)}`}</label>
                </div>} />
                <Column title={<label style={{
                  color: "red"
                }} width="10%">เบิกไม่ได้</label>} render={(text, record) => <div>
                  <label>{`${(record.cashNotReturn ? record.cashNotReturn : 0) * (record.quantity ? +record.quantity : 1)}`}</label>
                </div>} />
                {!viewOnly ? <Column title={<FaCog />} render={(text, record) => {
                  return <Popconfirm title="ต้องการลบหรือไม่?" okText="ตกลง" onConfirm={() => {
                    onDeleteActivity(record.key);
                  }} cancelText="ยกเลิก">
                    <FaTrash className="pointer" style={{
                      fontSize: "14px"
                    }} />
                  </Popconfirm>;
                }} width="5%" /> : null}
              </TableCustomHeader>
              {/* </div>
                                 </Scrollbars> */}
              <CardCustom>
                <Row style={{
                  padding: 0,
                  margin: 0,
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">หน่วยงานที่นัด</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">ผู้บันทึก</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">ผู้แก้ไข</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">จำนวนเงินรวม</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">เบิกได้</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="gx-text-primary-bold">เบิกไม่ได้</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>

                    </Row>
                  </Col>
                </Row>
                <Row style={{
                  padding: 0,
                  margin: 0
                }}>
                  <Col span={4}>
                    <label className="topic">{appointDetail?.workName}</label>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="topic">{`${appointDetail?.userCreated}`}</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="topic">
                        {
                          appointDetail?.dateCreated ? dayjs(appointDetail.dateCreated, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm") : "-"
                        }
                      </label>
                    </Row>
                  </Col>
                  <Col span={4}>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="topic">{`${appointDetail?.userModified ? appointDetail.userModified : []}`}</label>
                    </Row>
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="topic">
                        {
                          appointDetail?.dateModified ? dayjs(appointDetail.dateModified, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm") : "-"
                        }
                      </label>
                    </Row>
                  </Col>

                  <Col span={4}>
                    {/* จำนวนเงินรวม */}
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="resize">{sumBy(appointActivity, item => Number(item.rate ? item.rate : 0) * Number(+item.quantity ? item.quantity : 1))}</label>

                    </Row>
                  </Col>
                  <Col span={4}>
                    {/* เบิกได้ */}
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="resize">{sumBy(appointActivity, item => Number(item.cashReturn ? item.cashReturn : 0) * Number(+item.quantity ? item.quantity : 1))}</label>
                    </Row>
                  </Col>
                  <Col span={4}>
                    {/* เบิกไม่ได้ */}
                    <Row style={{
                      padding: 0,
                      margin: 0
                    }}>
                      <label className="resize" style={{
                        color: "red"
                      }}>{sumBy(appointActivity, item => Number(item.cashNotReturn ? item.cashNotReturn : 0) * Number(+item.quantity ? item.quantity : 1))}</label>
                    </Row>
                  </Col>
                </Row>
              </CardCustom>
            </Col>
          </Row>
        </Spin>
      </div>
    </CustomModal>
    {/* เพิ่มกิจรรม */}
    <AddActivity visible={showAddActivityModal} onCancel={() => {
      setShowAddActivityModal(false);
    }} onAdd={async data => {
      // setShowActivityDetailModal(true)
      // setActivityDetail(data)
      let duplicate = [];
      let notduplicate = [];
      if (data.length > 0) {
        if (appointActivity.length > 0) {
          let cleanNotactivity = appointActivity.filter(item => !!item.activityId);
          console.log("cleanNotactivity", cleanNotactivity);
          if (cleanNotactivity.length > 0) {
            duplicate = await data.map(item => cleanNotactivity.filter(child => child.activityId === item.activityId && child.name === item.name)).flat();
            /* eslint-disable array-callback-return */
            notduplicate = await data.map(item => {
              if (cleanNotactivity.filter(child => child.activityId === item.activityId && child.name === item.name).length === 0) {
                return item;
              }
            });
            if (duplicate.length > 0) {
              notduplicate = await notduplicate.filter(item => item !== undefined);
              setAppointActivity([...appointActivity, ...notduplicate]);
              info({
                type: 'info',
                info: <>
                  <div>มีกิจกรรมซ้ำในรายการที่เพิ่ม</div>
                  <br />
                  <List style={{
                    display: "flex",
                    justifyContent: "center",
                    textAlign: "start"
                  }}>{duplicate.map((item, index) => <List.Item key={index}><Badge color="yellow" />{item.name}</List.Item>)}</List>
                </>
              });
            } else {
              setAppointActivity([...appointActivity, ...data]);
            }
          } else {
            setAppointActivity([...appointActivity, ...data]);
          }
        } else {
          setAppointActivity(data);
        }
      }
    }} />

    {
      screeningAddLabItemActive
        ? <ScreeningAddLabItem
          screeningAddLabItemActive={screeningAddLabItemActive}
          handleScreeningAddLabItemModal={handleScreeningAddLabItemModal}
          patientId={patient?.patientId ? patient.patientId : null}
          page={"8.1"}
        />
        : ""
    }
    {
      screeningAddXrayItemActive
        ? <ScreeningXRay
          screeningXRayActive={screeningAddXrayItemActive}
          handleScreeningXRayModal={handleScreeningAddXrayItemModal}
          patientId={patient?.patientId ? patient.patientId : null}
          page={"8.1"}
        />
        : null
    }
    {
      screeningAddOrderItemActive
        ? <ScreeningAddOrderItem
          screeningAddOrderItemActive={screeningAddOrderItemActive}
          handleScreeningAddOrderItemModal={handleScreeningAddOrderItemModal}
          patientId={patient?.patientId ? patient.patientId : null}
          page={"8.1"}
        />
        : null
    }
    {/* ยกเลิกนัด */}
    <Modal loading={loading || loadingEdit} visible={showCancelAppointmentRemark} onCancel={() => {
      setShowCancelAppointmentRemark(false);
      formCancel.resetFields();
    }} closable={false} title={<div className="text-start">
      <label className="topic-bold" style={{
        fontSize: "18px"
      }}>ระบุเหตุผลการยกเลิกนัด</label>
    </div>} footer={<div className="text-center">
      <Button type="secondary" style={{
        width: "100px"
      }} onClick={() => {
        setShowCancelAppointmentRemark(false);
        formCancel.resetFields();
      }}>ออก</Button>
      <Button type="primary" style={{
        width: "100px"
      }} onClick={() => formCancel.submit()}>ตกลง</Button>
    </div>}>
      <Row>
        <Col span={24}>
          <Form form={formCancel} layout="vertical" colon={false} onFinish={handleCancleAppointFinish}>
            <Form.Item name="cancelReason" label={<label className="gx-text-primary-bold">เหตุผล</label>} rules={[{
              required: true,
              message: 'กรุณาระบุเหตุผล'
            }]}>
              <Select showSearch placeholder="เหตุผล" style={{
                width: "200px"
              }} allowClear={true} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={cancelReasonList && cancelReasonList.map((val,) => ({
                value: val.datavalue,
                label: val.datadisplay
              }))} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
    {/* Modal Notification */}
    <Notifications setModal={isVisible => {
      setShowProcessResultModal(isVisible);
      setTitleToModal(null);
    }} isVisible={showProcessResultModal} title={titletoModal?.title} type={titletoModal?.type} />
  </div>;
}