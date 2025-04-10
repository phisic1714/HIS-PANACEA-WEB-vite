import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Modal, Button, Form, Input, Select, DatePicker, Row, Col, Checkbox, Spin, Popover } from 'antd';
import { GetDropdown, InsPatientsRights, UpdPatientsRights } from "./AddOrUpdVisitApi";
import thaiIdCard from 'thai-id-card';
import { useSelector } from "react-redux";
import Notifications from "./Notifications";
import {find} from "lodash";
import axios from 'axios';
import SelectHospCode from "components/Input/SelectHospCode"
// eslint-disable-next-line no-unused-vars
import { momentTH, momentEN } from '../helper/convertMoment';

const {
  Option
} = Select;

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const user = userFromSession.responseData.userId;

export default function AddOrUpdVisit({
  show,
  modalControl,
  patientData = [],
  editId,
  prevVisit,
  reload,
  page,
  serviceId,
  prevRightList = [],
  isVisible = () => {
    console.log("007");
  },
  useDateTrans = true,
  disabled = false,
  ...props
}) {
  const {
    pathname
  } = useSelector(({
    common
  }) => common);
  const smartCard = useSelector(({
    smartCard
  }) => smartCard);
  const dateFormat = 'DD/MM/YYYY';
  const {
    message
  } = useSelector(({
    autoComplete
  }) => autoComplete);
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const {
    selectPatient
  } = useSelector(({
    patient
  }) => patient);
  const ipdPatientDetail = selectPatient;

  const [visitForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientType, setPatientType] = useState(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const {
    lockRightFlag
  } = JSON.parse(localStorage.getItem("hos_param"));

  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [groupRight, setGroupRight] = useState("");
  const [personalData, setPersonalData] = useState({});

  const InsOpdRights = async checkedOpdRightList => {
    setLoading(true);
    let valuesForRequest = checkedOpdRightList.map(o => {
      return {
        ...o,
        "opdRightId": null,
        "serviceId": serviceId,
        "rightId": o.rightId,
        "patientId": personalData.patientId,
        "runHn": personalData.runHn,
        "yearHn": personalData.yearHn,
        "hn": o.hn,
        "userCreated": user,
        "dateCreated": o.dateCreated || moment().format("YYYY-MM-DD"),
        "userModified": null,
        "dateModified": null,
        "amount": "0",
        "copay": "0",
        "discount": null,
        "claim": null,
        "payment": "0",
        "reminburse": null,
        "limit": null,
        "insid": o.insid || null,
        "hmain": o.hmain || null,
        "hsub": o.hsub || null,
        "hmainOp": o.hmainOp || null,
        "govcode": o.govcode || null,
        "ownrightpid": o.ownRightPid || null,
        "owner": null,
        "relinscl": o.relinscl || null,
        "referId": null,
        "receive": null,
        "claimcode": null,
        "remark": o.remark || null,
        "approvalDate": null,
        "confirm": null,
        "dateConfirm": null,
        "userConfirm": null,
        "cashNotReturn": null,
        "cashReturn": null,
        "credit": "0"
      };
    });

    let req = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": valuesForRequest,
      "barcode": null
    };

    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsListOpdAndPatientRights`, req).then(res => {
      return res.data;
    }).catch(error => console.log(error));
    return res;
  };

  // แปลง พศ => คศ
  const DATE_REGEXP = new RegExp('^(0?[1-9]|[1-2][0-9]|3[0-1])/(0?[1-9]|1[0-2])/([0-9]{4})$', 'gi');
  const dateTrans = date => {
    let result = date.replace(DATE_REGEXP, (str, day, month, year) => {
      return `${day}/${month}/${parseInt(year, 10) - 543}`;
    });
    return result;
  };

  const disabledDateBefore = (current) => {
    return current && current > moment().endOf('day');
  }

  const disabledDateAfter = (current) => {
    return current && current < visitForm.getFieldValue('startDate');
  }

  useEffect(() => {
    if (pathname) {
      if (pathname === "/privilege center/privilege-center-opd-expense-right-transfer" || pathname === "/outpatient finance/outpatient-transfer-finance-ipd-right" || props?.patientType === "opd") {
        setPatientType("opd");
      }
      if (pathname === "/privilege center/privilege-center-check-ipd-right" || pathname === "/privilege center/privilege-center-ipd-expense-right-transfer" || pathname === "/privilege center/privilege-center-opd-expense-transfer-to-ipd" || props?.patientType === "ipd") {
        setPatientType("ipd");
      }
    }
  }, [pathname, props?.patientType]);

  useEffect(() => {
    if (!patientType) {
      if (patientData.length > 0) {
        setPersonalData({
          "patientId": message,
          "hn": String(patientData.map(patient => patient.hn)),
          "runHn": String(patientData.map(patient => patient.runHn)),
          "yearHn": String(patientData.map(patient => patient.yearHn))
        });
        visitForm.setFieldsValue({
          ownRightPid: patientData[0]?.idCard
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData]);

  useEffect(() => {
    if (patientType === "opd") {
      if (opdPatientDetail) {
        setPersonalData({
          "patientId": opdPatientDetail.patientId,
          "runHn": opdPatientDetail.hn?.slice(0, -3),
          "yearHn": opdPatientDetail.hn?.slice(-2)
        });
      }
    }
    if (patientType === "ipd") {
      if (ipdPatientDetail) {
        setPersonalData({
          "patientId": ipdPatientDetail.patientId,
          "runHn": ipdPatientDetail.hn?.slice(0, -3),
          "yearHn": ipdPatientDetail.hn?.slice(-2)
        });
      }
    }
  }, [ipdPatientDetail, opdPatientDetail, patientType]);

  useEffect(() => {
    if (smartCard) {
      visitForm.setFieldsValue({
        insid: smartCard?.insid
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartCard]);

  const onFinish = (values) => {
    if (!editId) {
      async function addData() {
        setSaving(true);
        let request = {
          "mode": null,
          "user": null,
          "ip": null,
          "lang": null,
          "branch_id": null,
          "requestData": {
            "ptRightId": null,
            "patientId": personalData.patientId ? personalData.patientId : patientData[0]?.patientId,
            "hn": personalData?.runHn ? `${personalData.runHn}/${personalData.yearHn}` : patientData[0]?.hn,
            "runHn": personalData.runHn ? personalData.runHn : patientData[0]?.runHn,
            "yearHn": personalData.runHn ? personalData.yearHn : patientData[0]?.yearHn,
            "rightId": values.rightId,
            "insid": values.insid ? values.insid : null,
            "hmain": values.hmain ? values.hmain : null,
            "hsub": values.hsub ? values.hsub : null,
            "hmainOp": values.hmainOp ? values.hmainOp : null,
            "ownRightPid": values.ownRightPid || null,
            "relinscl": values.relinscl ? values.relinscl : null,
            "startDate": values.startDate ? moment(values.startDate).format("YYYY-MM-DD") : null,
            "expireDate": values.expireDate ? moment(values.expireDate).format("YYYY-MM-DD") : null,
            "govcode": values.govcode ? values.govcode : null,
            "identifyFlag": values.identifyFlag ? "Y" : null,
            "mainFlag": values.mainFlag ? "Y" : null,
            "dateCreated": moment().format("YYYY-MM-DD"),
            "dateModified": null,
            "userCreated": user,
            "userModified": null,
            "remark": values.remark || null,
            "changwat": values.changwat || null
          },
          "barcode": null
        };
        let res = {};

        if (page === "22.23" || page === "22.5") {
          res = await InsOpdRights([request?.requestData || {}]);
        } else {
          res = await InsPatientsRights(request);
        }
        setSaving(false);
        setProcessResult(res);
        setNotificationsTitle("เพิ่มสิทธิ์ประจำตัว");
        setShowNotificationsModal(true);
        if (modalControl) {
          modalControl("visitForm", true);
        }
        visitForm.resetFields();
        if (reload) {
          reload(true);
        }
        if (res?.isSuccess) {
          if (props?.isSuccess) {
            props?.isSuccess(res?.isSuccess);
            isVisible();
          }
        }
      }
      addData();
    }

    if (editId) {
      async function updateData() {
        setSaving(true);
        let request = {
          "mode": null,
          "user": null,
          "ip": null,
          "lang": null,
          "branch_id": null,
          "requestData": {
            "ptRightId": editId,
            "patientId": personalData?.patientId ? personalData.patientId : patientData[0]?.patientId,
            "hn": prevVisit.hn ? prevVisit.hn : personalData?.runHn ? `${personalData.runHn}/${personalData.yearHn}` : patientData[0]?.hn,
            "runHn": prevVisit.hn ? prevVisit.runHn : personalData.runHn ? personalData.runHn : patientData[0]?.runHn,
            "yearHn": prevVisit.hn ? prevVisit.yearHn : personalData.runHn ? personalData.yearHn : patientData[0]?.yearHn,
            "rightId": values.rightId,
            "insid": values.insid ? values.insid : null,
            "hmain": values.hmain ? values.hmain : null,
            "hsub": values.hsub ? values.hsub : null,
            "hmainOp": values.hmainOp ? values.hmainOp : null,
            "ownRightPid": values.ownRightPid || null,
            "relinscl": values.relinscl ? values.relinscl : null,
            "startDate": values.startDate ? moment(values.startDate).format("YYYY-MM-DD") : null,
            "expireDate": values.expireDate ? moment(values.expireDate).format("YYYY-MM-DD") : null,
            "govcode": values.govcode ? values.govcode : null,
            "identifyFlag": values.identifyFlag ? "Y" : null,
            "mainFlag": values.mainFlag ? "Y" : null,
            "dateModified": moment().format("YYYY-MM-DD HH:mm"),
            "userModified": user,
            "remark": values.remark || null,
            "changwat": values.changwat || null
          },
          "barcode": null
        };
        let res = await UpdPatientsRights(request);
        setSaving(false);
        setProcessResult(res);
        setNotificationsTitle("แก้ไขสิทธิ์ประจำตัว");
        setShowNotificationsModal(true);
        if (modalControl) {
          modalControl("visitForm", true);
        }
        visitForm.resetFields();
        if (reload) {
          reload(true);
        }
        if (props?.isSuccess) {
          props?.isSuccess(res?.isSuccess);
          isVisible();
        }
      }
      updateData();
    }
  };

  useEffect(() => {
    momentEN();
    if (prevVisit?.ptRightId) {
      let startDate = prevVisit.startDate ? moment(prevVisit.startDate, 'MM/DD/YYYY') : null;
      let expireDate = prevVisit.expireDate ? moment(prevVisit.expireDate, 'MM/DD/YYYY') : null;
      if (useDateTrans) {
        startDate = prevVisit.startDate ? moment(dateTrans(prevVisit.startDate), 'DD/MM/YYYY') : null;
        expireDate = prevVisit.expireDate ? moment(dateTrans(prevVisit.expireDate), 'DD/MM/YYYY') : null;
      }
      visitForm.setFieldsValue({
        ...prevVisit,
        mainFlag: prevVisit.mainFlag === "Y" ? true : false,
        identifyFlag: prevVisit.identifyFlag === "Y" ? true : false,
        startDate: startDate,
        expireDate: expireDate
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevVisit]);

  // -----------For visitForm
  const [rightsVisitList, setrightsVisitList] = useState([]);
  const [relinsclList, setRelinsclList] = useState([]);
  const [govcodesList, setGovcodesList] = useState([]);
  const [listChangwat, setListChangwat] = useState([]);
  const getRightsVisit = async () => {
    let res = await GetDropdown("GetRightsVisit");
    // console.log(res);
    setrightsVisitList(res);
  };
  const getRelinscl = async () => {
    let res = await GetDropdown("GetRelinscl");
    setRelinsclList(res);
  };
  const getGovcodes = async () => {
    let res = await GetDropdown("GetGovcodes");
    setGovcodesList(res);
  };
  const getChangwatMas = async () => {
    let res = await GetDropdown("GetChangwatMas");
    setListChangwat(res);
  };
  useEffect(() => {
    if (rightsVisitList.length === 0 && show) {
      getRightsVisit();
      getRelinscl();
      getGovcodes();
      getChangwatMas();
    }
    if (show) {
      if (patientData.length > 0) {
        visitForm.setFieldsValue({
          ownRightPid: patientData[0]?.idCard
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);
  const closeModal = () => {
    modalControl("visitForm");
    visitForm.resetFields();
  };
  const findDataInArray = (valueForFinding, list, fieldName) => {
    let res = find(list, o => {
      return o[fieldName] === valueForFinding;
    });
    if (res) {
      return true;
    } else return false;
  };
  const idCardVerifyNoRequired = async (_, value) => {
    let idCard = value;
    if (!idCard) {
      return Promise.resolve();
    }
    if (idCard) {
      if (thaiIdCard.verify(idCard)) {
        return Promise.resolve();
      }
    }
    return Promise.reject(new Error("Format ไม่ถูกต้อง!"));
  };
  return <div>
    <Modal forceRender confirmLoading title={<label className={"gx-text-primary fw-bold"} style={{
      fontSize: 18
    }}>{editId ? "2.2.1.1 แก้ไขสิทธิ์" : "2.2.1 เพิ่มสิทธิ์"}</label>} centered visible={show} onCancel={() => {
      closeModal();
      isVisible();
    }} width={680} footer={<div className="text-center">
      <Button type="secondary" onClick={() => {
        closeModal();
        isVisible();
      }}
      >ปิด</Button>
      {lockRightFlag === "Y" ? (
        <Popover
          content={<label className="gx-text-primary fw-bold">Lock สิทธิ์การรักษา</label>} trigger="hover">
          <Button disabled={saving || lockRightFlag === "Y" && page === "4.1"} type="primary" onClick={visitForm.submit}>บันทึก</Button>
        </Popover>
      )
        : <Button disabled={saving} type="primary" onClick={visitForm.submit}>บันทึก</Button>}
    </div>}>
      <Spin spinning={saving}>
        <Form name="visitForm" form={visitForm} onFinish={onFinish} layout="vertical" disabled={disabled}>
          <div hidden>
            <Form.Item name="runHn">
              <Input />
            </Form.Item>
            <Form.Item name="yearHn">
              <Input />
            </Form.Item>
          </div>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -22
          }}>
            <Col span={12}></Col>
            <Col>
              <Form.Item name="mainFlag" valuePropName='checked'>
                <Checkbox disabled={disabled}><label className="gx-text-primary fw-bold">สิทธิ์หลัก</label></Checkbox>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="identifyFlag" valuePropName='checked'>
                <Checkbox disabled={disabled}><label className="gx-text-primary fw-bold">สิทธิ์ติดตัว</label></Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            <Col span={12}>
              <Form.Item name="rightId" label={<label className="gx-text-primary fw-bold">สิทธิ์</label>} rules={[{
                required: true,
                message: 'กรุณาเลือกสิทธิ์!'
              }]}>
                <Select showSearch style={{
                  width: '100%'
                }} allowClear={true} optionFilterProp="children" onChange={(e, o) => {
                  // console.log(e);
                  setGroupRight(o.group);
                }}>
                  {rightsVisitList.map((val, index) => <Option value={val.datavalue} group={val.dataother1} key={index} disabled={prevRightList?.length === 0 ? false : findDataInArray(val.datavalue, prevRightList, "rightId")}>{`${val.datadisplay}`}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="changwat" label={<label className="gx-text-primary fw-bold">จังหวัด</label>}>
                <Select style={{
                  width: "100%"
                }} showSearch allowClear optionFilterProp="children">
                  {// eslint-disable-next-line react/no-children-prop
                    listChangwat?.map((val, index) => <Option value={val.datavalue} children={val} key={index}>{`${val.datavalue} ${val.datadisplay}`}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            <Col span={12}>
              <Form.Item name="hmain" label={<label className="gx-text-primary fw-bold">รพ.หลัก</label>} rules={[{
                required: groupRight === "UCS" ? true : false,
                message: 'กรุณาเลือก รพ.หลัก!'
              }]}>
                <SelectHospCode value={visitForm.getFieldValue("hmain")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hsub" label={<label className="gx-text-primary fw-bold">รพ.รอง</label>} rules={[{
                required: groupRight === "UCS" ? true : false,
                message: 'กรุณาเลือก รพ.รอง!'
              }]}>
                <SelectHospCode value={visitForm.getFieldValue("hsub")} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            <Col span={12}>
              <Form.Item name="hmainOp" label={<label className="gx-text-primary fw-bold">รพ.ที่รักษาประจำ</label>} rules={[{
                required: groupRight === "SSS" ? true : false,
                message: 'กรุณาเลือก รพ.ที่รักษาประจำ!'
              }]}>
                <SelectHospCode value={visitForm.getFieldValue("hmainOp")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="insid" label={<label className="gx-text-primary fw-bold">หมายเลขบัตร</label>} rules={[{
                required: groupRight === "SSS" || groupRight === "UCS" ? true : false,
                message: 'กรุณาระบุหมายเลขบัตร!'
              }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            <Col span={12}>
              <Form.Item name="relinscl" label={<label className="gx-text-primary fw-bold">ความสัมพันธ์</label>}>
                <Select showSearch style={{
                  width: '100%'
                }} allowClear={true} optionFilterProp="children">
                  {relinsclList.map((val, index) => <Option value={val.datavalue} key={index}>{`${val.datavalue} ${val.datadisplay}`}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ownRightPid" label={<label className="gx-text-primary fw-bold">เลขที่บัตรประชาชนเจ้าของสิทธิ์</label>} rules={[{
                validator: idCardVerifyNoRequired
              }]}>
                <Input onKeyPress={event => {
                  if (!/[0-9]/.test(event.key)) return event.preventDefault();
                }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            <Col span={12}>
              <Form.Item name="govcode" label={<label className="gx-text-primary fw-bold">หน่วยงานต้นสังกัด</label>}>
                <Select showSearch style={{
                  width: '100%'
                }} allowClear={true} optionFilterProp="children" filterOption={(input, option) => option?.name?.toLowerCase().includes(input.toLowerCase()) || option.value.toLowerCase().includes(input.toLowerCase())}>
                  {govcodesList.map((val, index) => <Option value={val.datavalue} key={index} name={val.datadisplay}> {val.datavalue}-{val.datadisplay}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Row gutter={[8, 8]} style={{
                flexDirection: 'row'
              }}>
                <Col span={12}>
                  <Form.Item name="startDate" label={<label className="gx-text-primary fw-bold">วันเริ่มต้น</label>}>
                    <DatePicker style={{
                      width: "100%"
                    }} format={dateFormat} disabledDate={disabledDateBefore} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="expireDate" label={<label className="gx-text-primary fw-bold">วันสิ้นสุด</label>}>
                    <DatePicker style={{
                      width: "100%"
                    }} format={dateFormat} disabledDate={disabledDateAfter} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12,
            marginBottom: -32
          }}>
            <Col span={24}>
              <Form.Item name="remark" label={<label className="gx-text-primary fw-bold">หมายเหตุ</label>}>
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
    <Notifications setModal={isVisible => {
      setShowNotificationsModal(isVisible);
      setProcessResult({});
      setNotificationsTitle(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type="result" />
  </div>;
}