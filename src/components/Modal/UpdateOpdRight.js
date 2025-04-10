import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import { map, find } from "lodash";
import axios from 'axios';
import { Modal, Form, Row, Col, ConfigProvider, InputNumber, Input, Checkbox, Select, Divider, Statistic } from 'antd';
import thaiIdCard from 'thai-id-card';
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";
import dayjs from "dayjs";
import thTH from "antd/lib/locale/th_TH";
import { notificationX as notiX } from '../Notification/notificationX';
import SelectHospCode from "components/Input/SelectHospCode"
export default function UpdateOpdRight({
  patientId = null,
  opdRightId = null,
  open = false,
  allowSave = true,
  close = () => {
    console.log('setIsVis :>> ');
  },
  success = () => {
    console.log('success :>> ');
  }
}) {
  const userFromSession = JSON.parse(sessionStorage.getItem('user'));
  let user = userFromSession.responseData.userId;
  const [form] = Form.useForm();
  // useWatch
  const mainFlag = Form.useWatch("mainFlag", form);
  // useState
  const [loading, setLoading] = useState(false);
  const [loadingHospCode, setLoadingHospCode] = useState(false);
  const [opdRightDetails, setOpdRightDetails] = useState(null);
  const [listOpdRight, setListOpdRight] = useState([]);
  const [listDropdown, setListDropdown] = useState({
    listRelinscl: [],
    listGovcodes: [],
    listChangwat: [],
  });

  // Functions
  const getDropdown = async name => {
    let res = await GetDropdown(name);
    if (res?.length) {
      res = map(res, o => {
        let label = o.datadisplay;
        if (name === "GetRelinscl" || name === "GetGovcodes") {
          label = `${o.datavalue} ${o.datadisplay}`;
        }
        return {
          ...o,
          value: o.datavalue,
          label: label,
          className: "data-value"
        };
      });
    }
    switch (name) {
      case "GetRelinscl":
        setListDropdown(prev => ({
          ...prev,
          listRelinscl: res
        }));
        break;
      case "GetGovcodes":
        setListDropdown(prev => ({
          ...prev,
          listGovcodes: res
        }));
        break;
      default:
        break;
    }
  };
  const getOpdRightById = async id => {
    if (!opdRightId) return form.resetFields();
    setLoading(true);
    let res = await callApi("GetOpdRightById", id);
    let size = Object.keys(res).length;
    for (let i = 0; i < size; i++) {
      res[Object.keys(res)[i]] = Object.values(res)[i] || null;
    }
    // console.log('fetOpdRightBtId :>> ', res);
    setOpdRightDetails(res);
    form.setFieldsValue({
      ...res,
      startDate: res?.startDate ? dayjs(res.startDate, "DD/MM/YYYY") : null,
      expireDate: res?.expireDate ? dayjs(res.expireDate, "DD/MM/YYYY") : null,
      approvalDate: res?.approvalDate ? dayjs(res.approvalDate, "MM/DD/YYYY") : null,
      outstandingBalance: res?.outstanding_Balance || null
    });
    setLoading(false);
  };
  const getListOpdRight = async id => {
    if (!id) return setListOpdRight([]);
    let req = {
      patientId: id
    };
    let res = await callApi("GetListOpdRight", req);
    res = map(res, o => {
      return {
        ...o,
        value: o.rightId,
        label: o.name
      };
    });
    setListOpdRight(res);
  };
  const onFinish = async v => {
    let req = {
      ...v,
      patientId: patientId,
      startDate: v?.startDate ? dayjs(v.startDate).format("YYYY-MM-DD") : null,
      expireDate: v?.expireDate ? dayjs(v.expireDate).format("YYYY-MM-DD") : null,
      approvalDate: v?.approvalDate ? dayjs(v.approvalDate).format("YYYY-MM-DD") : null,
      confirm: v?.confirm ? "Y" : null,
      defaultFlag: v?.defaultFlag ? "Y" : null,
      dateModified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      userModified: user
    };
    let res = await callApi("UpdOpdRight", req);
    notiX(res?.isSuccess, "อัพเดตสิทธิ์ประจำวัน");
    success(res?.isSuccess);
    if (res?.isSuccess) {
      close();
    }
  };
  const genFormItem = (fieldName, span = 24) => {
    // console.log('fieldName :>> ', fieldName);
    const idCardVerifyNoRequired = (_, value) => {
      if (!value) {
        return Promise.resolve();
      }
      if (value) {
        if (value.number === "") {
          return Promise.resolve();
        } else {
          if (thaiIdCard.verify(value)) {
            return Promise.resolve();
          }
          if (thaiIdCard.verify(value.number)) {
            return Promise.resolve();
          }
        }
      }
      return Promise.reject(new Error("รูปแบบไม่ถูกต้อง!"));
    };
    const listItem = [
      // rightId
      {
        name: "rightId",
        label: "สิทธิ์",
        inputType: "select",
        allowClear: false,
        options: listOpdRight
      },
      // confirm
      {
        name: "confirm",
        label: " ",
        checkBoxLabel: "รับรองสิทธิ์ ?",
        inputType: "checkbox",
        valuePropName: "checked",
        // options: []
        disabled: !allowSave,
      },
      // defaultFlag
      {
        name: "defaultFlag",
        label: " ",
        checkBoxLabel: "Auto สิทธิ์ย่อย",
        inputType: "checkbox",
        valuePropName: "checked",
        // options: []
        disabled: mainFlag ? true : false
      },
      // insid
      {
        name: "insid",
        label: "หมายเลขบัตร",
        inputType: "input",
        allowClear: false
        // options: []
      },
      // ownrightpid
      {
        name: "ownrightpid",
        label: "เลขบัตรเจ้าของสิทธิ์",
        rules: [{
          validator: idCardVerifyNoRequired
        }],
        inputType: "inputNumber"
      },
      // relinscl
      {
        name: "relinscl",
        label: "ความสัมพันธ์",
        inputType: "select",
        options: listDropdown?.listRelinscl || []
      },
      // govcode
      {
        name: "govcode",
        label: "หน่วยงานต้นสังกัด",
        inputType: "select",
        options: listDropdown?.listGovcodes || []
      },
      // status
      {
        name: "status",
        label: "สถานะ",
        inputType: "select",
        options: [{
          value: "F",
          label: "สิ้นสุดการให้บริการ"
        }, {
          value: "C",
          label: "ยกเลิกการให้บริการ"
        }]
      },
      // remark
      {
        name: "remark",
        label: "หมายเหตุ",
        inputType: "textArea"
      },
      // startDate
      {
        name: "startDate",
        label: "วันเริ่มต้น",
        inputType: "datePicker"
      },
      // expireDate
      {
        name: "expireDate",
        label: "วันสิ้นสุด",
        inputType: "datePicker"
      },
      // approvalDate
      {
        name: "approvalDate",
        label: "วันที่อนุมัติ",
        inputType: "datePicker"
      },
      // claimcode
      {
        name: "claimcode",
        label: "เลขขออนุมัติ",
        inputType: "input"
      },
      // limit
      {
        name: "limit",
        label: "Lock วงเงิน",
        inputType: "inputNumber"
      },
      // balance
      {
        name: "balance",
        label: "วงเงินคงเหลือ",
        inputType: "inputNumber",
        disabled: true
      },
      // outstandingBalance
      {
        name: "outstandingBalance",
        label: "ยอดค้างชำระ",
        inputType: "inputNumber",
        disabled: true
      },
      // payment
      {
        name: "payment",
        label: "ยอดชำระแล้ว",
        inputType: "inputNumber",
        disabled: true
      }];
    let fndByName = find(listItem, ['name', fieldName]);
    if (!fndByName) return;
    const {
      allowClear = true,
      name,
      label,
      rules = [],
      inputType,
      valuePropName,
      checkBoxLabel,
      options = [],
      placeholder,
      format = "DD/MM/YYYY",
      disabledDate = false,
      rows = 1,
      disabled = false,
      onChange = () => { },
      dropDownLoading = false
    } = fndByName;
    const genInput = () => {
      // eslint-disable-next-line default-case
      switch (inputType) {
        case "select":
          return <Select showSearch allowClear={allowClear} optionFilterProp="label" className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} options={options || []} dropdownMatchSelectWidth={345} disabled={disabled} onChange={onChange} loading={dropDownLoading} />;
        case "textArea":
          return <Input.TextArea className="data-value" rows={rows || 1} placeholder={placeholder} disabled={disabled} />;
        case "checkbox":
          return <Checkbox disabled={disabled}>{labelTopicPrimary(checkBoxLabel)}</Checkbox>;
        case "input":
          return <Input className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} disabled={disabled} />;
        case "inputNumber":
          return <InputNumber className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} stringMode controls={false} disabled={disabled} />;
        // case "radioGroup":
        //     return <Radio.Group options={options} />
        case "datePicker":
          return <DayjsDatePicker className="data-value" form={form} name={name} style={{
            width: "100%"
          }} format={format} disabledDate={disabledDate} />;
      }
    };
    return <Col span={span}>
      <Form.Item name={name} label={label ? labelTopicPrimary(label) : false} rules={rules} valuePropName={valuePropName}>
        {genInput()}
      </Form.Item>
    </Col>;
  };

  // useEffect
  useEffect(() => {
    if (!open) return;
    getOpdRightById(opdRightId);
    getListOpdRight(patientId);
    if (!listDropdown?.listRelinscl?.length) {
      getDropdown("GetRelinscl");
      getDropdown("GetRightsVisit");
      getDropdown("GetGovcodes");
      // getHospcodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return <ConfigProvider locale={thTH}>
    <Modal
      // forceRender
      confirmLoading={loading} title={<Row gutter={[4, 4]}>
        <Col span={12}>
          {labelTopicPrimary18("2.2.3 แก้ไขสิทธิ์ประจำวัน")}
        </Col>
      </Row>} closable={false} centered visible={open} onCancel={() => {
        close();
      }} width={900} onOk={() => form.submit()} okText="บันทึก" cancelText="ปิด"
      okButtonProps={{
        disabled: !allowSave
      }}
    >

      <Form form={form} onFinish={onFinish} layout='vertical' disabled={!allowSave}>
        <div hidden>
          <Form.Item name="serviceId">
            <Input />
          </Form.Item>
          <Form.Item name="opdRightId">
            <Input />
          </Form.Item>
          <Form.Item name="mainFlag">
            <Input />
          </Form.Item>
        </div>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {genFormItem("rightId", 8)}
          {genFormItem("confirm", 4)}
          {genFormItem("defaultFlag", 4)}
          {genFormItem("insid", 8)}
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {/* {genFormItem("hmain", 8)}
          {genFormItem("hsub", 8)}
          {genFormItem("hmainOp", 8)} */}
          <Col span={8}>
            <Form.Item name="hmain" label="รพ.หลัก">
              <SelectHospCode value={form.getFieldValue("hmain")} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hsub" label="รพ.หลัก">
              <SelectHospCode value={form.getFieldValue("hsub")} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hmainOp" label="รพ.หลัก">
              <SelectHospCode value={form.getFieldValue("hmainOp")} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {genFormItem("ownrightpid", 8)}
          {genFormItem("relinscl", 8)}
          {genFormItem("govcode", 8)}
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {genFormItem("status", 8)}
          {genFormItem("remark", 16)}
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {genFormItem("startDate", 6)}
          {genFormItem("expireDate", 6)}
          {genFormItem("approvalDate", 6)}
          {genFormItem("claimcode", 6)}
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginBottom: -10
        }}>
          {genFormItem("limit", 6)}
          {genFormItem("balance", 6)}
          {genFormItem("outstandingBalance", 6)}
          {genFormItem("payment", 6)}
        </Row>
      </Form>
      <Divider />
      <Row gutter={[8, 8]} style={{
        marginBottom: -20
      }}>
        <Col span={6}>
          {labelTopicPrimary("ค่าบริการตามสิทธิ์")}
        </Col>
        <Col span={6}>
          {labelTopicPrimary("จำนวนเงิน")}
          <Statistic value={opdRightDetails?.amount || "-"} precision={2} valueStyle={{
            fontSize: 14
          }} />
        </Col>
        <Col span={6}>
          {labelTopicPrimary("เบิกได้")}
          <Statistic value={opdRightDetails?.cashReturn || "-"} precision={2} valueStyle={{
            fontSize: 14
          }} />
        </Col>
        <Col span={6}>
          {labelTopicPrimary("เบิกไม่ได้")}
          <Statistic value={opdRightDetails?.cashNotReturn || "-"} precision={2} valueStyle={{
            fontSize: 14
          }} />
        </Col>
      </Row>
    </Modal>
  </ConfigProvider>;
}
const labelTopicPrimary18 = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`} style={{
    fontSize: 18
  }}>
    {text}
  </label>;
};
const labelTopicPrimary = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`}>{text}</label>;
};
const GetDropdown = async action => {
  let url = `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
  let res = await axios({
    url: url,
    method: "POST"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const callApi = async (name, param) => {
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
  // GetPatientsByID
  {
    name: "GetPatientsByID",
    url: "Patients/GetPatientsByID/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  },
  // GetPatientsByID
  {
    name: "GetOpdRightById",
    url: "OpdRightVisit/GetUpdOpdRightVisitOfDate/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  },
  // GetOpdRightVisit
  {
    name: "GetListOpdRight",
    url: "OpdRightVisit/GetOpdRightVisit",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
  // UpdOpdRight
  {
    name: "UpdOpdRight",
    url: "OpdRightVisit/UpdOpdRightVisitOfDate",
    method: "PUT",
    return: "data",
    sendRequest: true
  }];