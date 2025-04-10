import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Row, Col, Form, Select, Input, ConfigProvider, notification } from 'antd';
import dayjs from "dayjs";
import thTH from "antd/lib/locale/th_TH";
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";
import DayjsTimePicker from "../DatePicker/DayjsTimePicker";
import axios from "axios";
import { useSelector } from 'react-redux';
export default function Discharge({
  isVsb = false,
  setIsVsb = () => {},
  onFinish = () => {}
}) {
  const openNotificationWithIcon = (type, txt) => {
    notification[type]({
      message: txt
    });
  };
  const {
    selectPatient
  } = useSelector(({
    patient
  }) => patient);
  // console.log("selectPatient", selectPatient)
  const [form] = Form.useForm();
  const checkLockDrug = async () => {
    let check = false;
    if (JSON.parse(localStorage.getItem("hos_param"))?.dcLockWardDrugRequestFlag === "Y") {
      let res = await callApi("getCheckDupicateOrderByAdmitId", selectPatient?.admitId);
      if (res?.isSuccess) {
        check = res?.responseData !== "0";
      }
    }
    return check;
  };
  const onFinishForm = async v => {
    setLoading(true);
    let chkLockDrug = await checkLockDrug();
    if (chkLockDrug) {
      setLoading(false);
      return setShowNoti(true);
    }
    let req = v;
    req.admitId = selectPatient?.admitId;
    req.wardId = selectPatient?.ward;
    req.dischDate = req?.dischDate ? dayjs(req.dischDate).format("YYYY-MM-DD HH:mm:ss") : null;
    req.dischTime = req.dischTime ? dayjs(req.dischTime).format("YYYY-MM-DD HH:mm:ss") : null;
    req.deathDate = req.deathDate ? req.deathDate.format("YYYY-MM-DD HH:mm:ss") : null;
    let res = await callApi("dischargePatient", req);
    if (res.isSuccess === true) {
      setIsVsb();
      openNotificationWithIcon('success', "จำหน่ายสำเร็จ");
    } else {
      openNotificationWithIcon('error', "จำหน่ายไม่สำเร็จ");
    }
    onFinish(res.isSuccess);
    setLoading(false);
  };
  const [showNoti, setShowNoti] = useState(false);
  const [, setLoading] = useState(false);
  const dischStatus = Form.useWatch("dischStatus", form);
  const [listDoctor, setListDoctor] = useState([]);
  const [dischargeTypes, setDischargeTypes] = useState([]);
  const [dischargeStatus, setDischargeStatus] = useState([]);
  const getDD = async name => {
    let res = await callApi(name);
    switch (name) {
      case "getDoctorMas":
        setListDoctor(res);
        break;
      case "getDischargeTypes":
        setDischargeTypes(res);
        break;
      case "getDischargeStatus":
        setDischargeStatus(res);
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    getDD("getDoctorMas");
    getDD("getDischargeTypes");
    getDD("getDischargeStatus");
  }, []);
  return <>
            <Modal title={labelTopicPrimary18("ลงหลักฐานจำหน่ายผู้ป่วย")} visible={isVsb} onOk={() => {
      form.submit();
    }} onCancel={() => {
      setIsVsb();
    }} width={700}>
                <ConfigProvider locale={thTH}>
                    <Form form={form} onFinish={onFinishForm} layout='vertical'>
                        <Row gutter={[8, 8]} style={{
            flexDirection: "row"
          }}>
                            <Col span={6}>
                                <Form.Item name="dischDate" label={<label className="gx-text-primary">วันที่จำหน่าย</label>} rules={[{
                required: true,
                message: "กรุณาระบุ"
              }]} initialValue={dayjs()}>
                                    <DayjsDatePicker form={form} name={"dischDate"} style={{
                  width: "100%"
                }} format={"DD/MM/YYYY"} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item label=" " name="dischTime" rules={[{
                required: true,
                message: "กรุณาระบุ"
              }]}>
                                    <DayjsTimePicker placeholder="เวลา" format={"HH:mm"} style={{
                  width: "100%"
                }} />
                                </Form.Item>
                            </Col>
                            <Col span={14}>
                                <Form.Item name="dischDoctor" label={<label className="gx-text-primary">เเพทย์ผู้จำหน่าย</label>} rules={[{
                required: true,
                message: "กรุณาระบุ"
              }]}>
                                    <Select showSearch style={{
                  width: "100%"
                }} optionFilterProp="datadisplay" options={listDoctor} fieldNames={{
                  label: "datadisplay",
                  value: "datavalue"
                }} />

                                </Form.Item>
                            </Col>

                        </Row>
                        <Row gutter={[8, 8]} style={{
            flexDirection: "row"
          }}>
                            <Col span={12}>
                                <Form.Item name="dischType" label={<label className="gx-text-primary">ประเภทการจำหน่าย</label>} rules={[{
                required: true,
                message: "กรุณาระบุ"
              }]}>
                                    <Select showSearch style={{
                  width: "100%"
                }} optionFilterProp="datadisplay" options={dischargeStatus} fieldNames={{
                  label: "datadisplay",
                  value: "datavalue"
                }} />

                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="dischStatus" label={<label className="gx-text-primary">สถานะการจำหน่าย</label>} rules={[{
                required: true,
                message: "กรุณาระบุ"
              }]}>
                                    <Select showSearch style={{
                  width: "100%"
                }} optionFilterProp="datadisplay" options={dischargeTypes} fieldNames={{
                  label: "datadisplay",
                  value: "datavalue"
                }} />

                                </Form.Item>
                            </Col>


                        </Row>
                        <Row gutter={[8, 8]} style={{
            flexDirection: "row"
          }}>
                            <Col span={6}>
                                <Form.Item hidden={dischStatus === "8" || dischStatus === "9" ? false : true} name="deathDate" label={<label className="gx-text-primary">วันที่เสียชีวิต</label>} rules={[{
                required: dischStatus === "8" || dischStatus === "9" ? true : false,
                message: "กรุณาระบุ"
              }]}>
                                    <DayjsDatePicker form={form} name={"deathDate"} style={{
                  width: "100%"
                }} format={"DD/MM/YYYY"} initialValue={dayjs()} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item hidden={dischStatus === "8" || dischStatus === "9" ? false : true} label=" " name="deathDateTime" rules={[{
                required: dischStatus === "8" || dischStatus === "9" ? true : false,
                message: "กรุณาระบุ"
              }]}>
                                    <DayjsTimePicker placeholder="เวลา" format={"HH:mm"} style={{
                  width: "100%"
                }} />
                                </Form.Item>
                            </Col>


                        </Row>
                        <Row gutter={[8, 8]} style={{
            flexDirection: "row"
          }}>
                            <Col span={24}>
                                <Form.Item name="dischRemark" label={<label className="gx-text-primary">หมายเหตุ DC#1</label>}>
                                    <Input.TextArea autoSize={{
                  minRows: 2,
                  maxRows: 2
                }} />
                                </Form.Item>
                            </Col>



                        </Row>
                    </Form>
                </ConfigProvider>

            </Modal>
            <Modal visible={showNoti} closable={false} footer={false}>
                <Row gutter={[16, 16]} justify="center">
                    <Col span={24} style={{
          textAlign: "center"
        }}>
                        มีรายการ Order ยาที่ยาไม่ถูก Accept
                    </Col>
                    <Col span={24} style={{
          textAlign: "center"
        }}>
                        กรุณาตรวจสอบ Order ยาก่อน D/C
                    </Col>
                    <Col span={24} style={{
          textAlign: "center"
        }}>
                        <Button type="primary" onClick={() => setShowNoti(false)}>
                            ตกลง
                        </Button>
                    </Col>
                </Row>
            </Modal>
        </>;
}
const labelTopicPrimary18 = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`} style={{
    fontSize: 18
  }}>
            {text}
        </label>;
};
export const callApi = async (name, param) => {
  let api = listApi.find(o => o.name === name);
  if (!api) return;
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`,
    method: api?.method,
    data: api?.sendRequest ? {
      requestData: param
    } : undefined
  }).then(res => {
    if (api?.return === "data") return res?.data || null;
    if (api?.return === "responseData") return res?.data?.responseData || null;
  }).catch(error => {
    return error;
  });
  return res;
};
const listApi = [
// getDoctorMas
{
  name: "getDoctorMas",
  url: "Masters/GetDoctorMas",
  method: "POST",
  return: "responseData",
  sendRequest: false
}, {
  name: "getDischargeTypes",
  url: "Masters/GetDischargeTypes",
  method: "POST",
  return: "responseData",
  sendRequest: false
}, {
  name: "getDischargeStatus",
  url: "Masters/GetDischargeStatus",
  method: "POST",
  return: "responseData",
  sendRequest: false
}, {
  name: "getCheckDupicateOrderByAdmitId",
  url: "WardPrescription/GetCheckDupicateOrderByAdmitId/",
  method: "GET",
  return: "data",
  sendRequest: false
}, {
  name: "dischargePatient",
  url: "IpdWard/DischargePatient",
  method: "POST",
  return: "data",
  sendRequest: true
}];