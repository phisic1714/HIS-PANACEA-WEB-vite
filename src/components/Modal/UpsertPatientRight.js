import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import { map, find, filter } from "lodash";
import axios from 'axios';
import { Modal, Form, Input, Select, Row, Col, Checkbox, ConfigProvider, InputNumber } from 'antd';
import thaiIdCard from 'thai-id-card';
import { useSelector } from "react-redux";
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";
import dayjs from "dayjs";
import "dayjs/locale/th";
import thTH from "antd/lib/locale/th_TH";
import { notificationX as notiX } from '../Notification/notificationX';
import SelectHospCode from "components/Input/SelectHospCode"

const hos_param = JSON.parse(localStorage.getItem('hos_param'));

export default function UpserPatientRight({
  // page = null,
  // opdIpd = null,
  patientId = null,
  ptRightId = null,
  // serviceId = null,
  open = false,
  close = () => {
    console.log('setIsVis :>> ');
  },
  success = () => {
    console.log('success :>> ');
  }
}) {
  const smartCard = useSelector(({
    smartCard
  }) => smartCard);
  const [loading, setLoading] = useState(false);
  const userFromSession = JSON.parse(sessionStorage.getItem('user'));
  let user = userFromSession.responseData.userId;
  const [form] = Form.useForm();
  // Watch
  const rightId = Form.useWatch("rightId", form);

  // useState
  const [rightGroup, setRightGroup] = useState(null);
  const [listDropdown, setListDropdown] = useState({
    listRight: [],
    listRelinscl: [],
    listGovcodes: [],
    listChangwat: [],
  });
  const [listRight, setListRight] = useState([]);
  const [listPatientRight, setListPatientRight] = useState([]);
  // console.log('listDropdown :>> ', listDropdown);
  // Function
  const getDropdown = async name => {
    let res = await GetDropdown(name);
    if (res?.length) {
      res = map(res, o => {
        let label = o.datadisplay;
        if (name === "GetChangwatMas" || name === "GetRelinscl" || name === "GetGovcodes") {
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
      case "GetRightsVisit":
        res = filter(res, o => o.value !== " ");
        setListDropdown(prev => ({
          ...prev,
          listRight: res
        }));
        setListRight(res);
        break;
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
      case "GetChangwatMas":
        setListDropdown(prev => ({
          ...prev,
          listChangwat: res
        }));
        break;
      default:
        break;
    }
  };
  const resetPatient = () => {
    setListPatientRight([]);
    form.resetFields();
  };
  const getPatient = async patientId => {
    let res = await callApi("GetPatientsByID", patientId);
    // console.log('res :>> ', res);
    if (!ptRightId) {
      form.setFieldsValue({
        patientId: patientId,
        hn: res.hn,
        runHn: res.runHn,
        yearHn: res.yearHn,
        ptRightId: null,
        ownRightPid: res?.idCard || null
      });
    }
  };
  const defaultFormValues = (patientRight, ptRightId) => {
    if (!ptRightId) return;
    let findX = find(patientRight, ["ptRightId", ptRightId]);
    findX.startDate = findX?.startDate ? dayjs(findX.startDate, "DD/MM/BBBB") : null;
    findX.expireDate = findX?.expireDate ? dayjs(findX.expireDate, "DD/MM/BBBB") : null;
    form.setFieldsValue(findX);
  };
  function disabledDateBefore(current) {
    // Can not select days after today and today
    return current && current > dayjs().endOf('day');
  }
  function disabledDateAfter(current) {
    // Can not select days before startDate
    return current && current < form.getFieldValue('startDate');
  }
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
  const disabledRightId = (listPatientRight, listRight) => {
    if (!listPatientRight?.length) {
      let mapping = map(listRight, o => {
        return {
          ...o,
          disabled: false
        };
      });
      setListDropdown(p => ({
        ...p,
        listRight: mapping
      }));
    }
    if (listPatientRight?.length) {
      let mapping = map(listRight, o => {
        let disabled = false;
        let findX = find(listPatientRight, ["rightId", o.value]);
        if (findX) disabled = true;
        return {
          ...o,
          disabled: disabled
        };
      });
      setListDropdown(p => ({
        ...p,
        listRight: mapping
      }));
    }
  };
  const getListPatientRight = async patientId => {
    let req = {
      patientId: patientId
    };
    let res = await callApi("GetListPatientRight", req);
    // console.log('res :>> ', res);
    defaultFormValues(res, ptRightId);
    setListPatientRight(res);
  };

  const onFinish = values => {
    // console.log('values :>> ', values);
    // close(true, values);
    // return
    let cleanData = {
      ...values,
      "insid": values?.insid || null,
      "hmain": values?.hmain || null,
      "hsub": values?.hsub || null,
      "hmainOp": values?.hmainOp || null,
      "ownRightPid": values?.ownRightPid || null,
      "relinscl": values?.relinscl || null,
      "startDate": values?.startDate || null,
      "expireDate": values?.expireDate || null,
      "govcode": values?.govcode || null,
      "identifyFlag": values?.identifyFlag ? "Y" : null,
      "mainFlag": values?.mainFlag ? "Y" : null,
      "remark": values?.remark || null,
      "changwat": values?.changwat || null
    };
    const insert = async v => {
      setLoading(true);
      let req = {
        ...v,
        startDate: v?.startDate ? dayjs(v.startDate).format('YYYY-MM-DD') : null,
        expireDate: v?.expireDate ? dayjs(v.expireDate).format('YYYY-MM-DD') : null,
        dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        userCreated: user
      };
      let res = await callApi("InsPatientsRights", req);
      setLoading(false);
      notiX(res?.isSuccess, "บันทึกสิทธิ์");
      success(res?.isSuccess);
      if (res?.isSuccess) {
        close(res?.isSuccess, values);
      }
    };
    const update = async v => {
      setLoading(true);
      let req = {
        ...v,
        startDate: v?.startDate ? dayjs(v.startDate).format('YYYY-MM-DD') : null,
        expireDate: v?.expireDate ? dayjs(v.expireDate).format('YYYY-MM-DD') : null,
        dateModified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        userModified: user
      };
      let res = await callApi("UpdPatientsRights", req);
      setLoading(false);
      notiX(res?.isSuccess, "แก้ไขสิทธิ์");
      success(res?.isSuccess);
      if (res?.isSuccess) {
        close(res?.isSuccess, values);
      }
    };
    if (ptRightId) return update(cleanData);
    if (!ptRightId) return insert(cleanData);
  };

  // useEffect
  useEffect(() => {
    if (!open) return resetPatient();
    if (!patientId) return;
    getPatient(patientId);
    getListPatientRight(patientId);
    if (!listDropdown?.listRelinscl?.length) {
      getDropdown("GetRelinscl");
      getDropdown("GetRightsVisit");
      getDropdown("GetGovcodes");
      getDropdown("GetChangwatMas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientId]);
  useEffect(() => {
    if (smartCard) {
      form.setFieldsValue({
        insid: smartCard?.insid
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartCard]);
  useEffect(() => {
    disabledRightId(listPatientRight, listRight);
  }, [listPatientRight, listRight]);
  const genFormItem = (fieldName, span = 24) => {
    // console.log('fieldName :>> ', fieldName);
    const listItem = [
      // mainFlag
      {
        name: "mainFlag",
        label: false,
        checkBoxLabel: "สิทธิ์หลัก?",
        inputType: "checkbox",
        hidden: false,
        valuePropName: "checked",
        onChange: (e) => {
          if (e.target.checked) {
            form.setFieldsValue({
              startDate: dayjs(),
              expireDate: hos_param?.defaultRightExpire ? dayjs().add(30, "days") : null
            })
          }
        },
      },
      // identifyFlag
      {
        name: "identifyFlag",
        label: false,
        checkBoxLabel: "สิทธิ์ติดตัว?",
        inputType: "checkbox",
        hidden: false,
        valuePropName: "checked"
        // options: []
      },
      // rightId
      {
        name: "rightId",
        label: "สิทธิ์",
        rules: [{
          required: true,
          message: "จำเป็น"
        }],
        inputType: "select",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: listDropdown?.listRight || [],
        onChange: (v, o) => {
          setRightGroup(o?.dataother1 || null);
        },
        allowClear: false
      },
      // changwat
      {
        name: "changwat",
        label: "จังหวัด",
        inputType: "select",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: listDropdown?.listChangwat || []
      },
      // insid
      {
        name: "insid",
        label: "หมายเลขบัตร",
        rules: [{
          required: rightGroup === "SSS" || rightGroup === "UCS" ? rightId !== "07" : false,
          message: "จำเป็น"
        }],
        inputType: "input",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: []
      },
      // relinscl
      {
        name: "relinscl",
        label: "ความสัมพันธ์",
        inputType: "select",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: listDropdown?.listRelinscl || []
      },
      // ownRightPid
      {
        name: "ownRightPid",
        label: "เลขที่บัตรประชาชนเจ้าของสิทธิ์",
        inputType: "input",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: [],
        rules: [{
          validator: idCardVerifyNoRequired
        }]
      },
      // govcode
      {
        name: "govcode",
        label: "หน่วยงานต้นสังกัด",
        inputType: "select",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: listDropdown?.listGovcodes || []
      },
      // startDate
      {
        name: "startDate",
        label: "เริ่มต้น",
        inputType: "datePicker",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        disabledDate: disabledDateBefore,
        onChange: (v, o) => {
          if (!v || hos_param?.defaultRightExpire === null) return
          // if (!hos_param.defaultRightExpire === "Y") return
          form.setFieldsValue({
            expireDate: v.add(30, "days")
          })
        },
      },
      // expireDate
      {
        name: "expireDate",
        label: "สิ้นสุด",
        inputType: "datePicker",
        hidden: false,
        valuePropName: undefined,
        disabled: false,
        options: [],
        disabledDate: disabledDateAfter
      },
      // remark
      {
        name: "remark",
        label: "หมายเหตุ",
        inputType: "textArea",
        hidden: false,
        valuePropName: undefined,
        rows: 1
        // options: []
      }];

    let fndByName = find(listItem, ['name', fieldName]);
    if (!fndByName) return;
    const {
      allowClear = true,
      name,
      label,
      rules = [],
      inputType,
      hidden,
      valuePropName,
      checkBoxLabel,
      options,
      placeholder,
      format = "DD/MM/YYYY",
      disabledDate = false,
      rows,
      disabled,
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
          return <Checkbox disabled={disabled} onChange={onChange}>{labelTopicPrimary(checkBoxLabel)}</Checkbox>;
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
          return <DayjsDatePicker
            className="data-value"
            form={form}
            name={name}
            style={{
              width: "100%"
            }}
            format={format}
            disabledDate={disabledDate}
            onChange={onChange}
          />;
      }
    };
    return <Col span={span}>
      <Form.Item name={name} label={label ? labelTopicPrimary(label) : false} hidden={hidden} rules={rules} valuePropName={valuePropName}>
        {genInput()}
      </Form.Item>
    </Col>;
  };


  return <div>
    <Modal forceRender confirmLoading={loading} title={<label className={"gx-text-primary fw-bold"} style={{
      fontSize: 18
    }}>{ptRightId ? "2.2.1.1 แก้ไขสิทธิ์" : "2.2.1 เพิ่มสิทธิ์"}
    </label>} centered visible={open} onCancel={() => {
      close();
    }} width={680} onOk={() => form.submit()} okText="บันทึก" cancelText="ปิด">
      <ConfigProvider locale={thTH}>
        <Form form={form} onFinish={onFinish} initialValues={{
          // startDate: dayjs(),
          // expireDate: dayjs().add(30, "day"),
        }} layout="vertical">
          <div hidden>
            <Form.Item name="patientId">
              <Input />
            </Form.Item>
            <Form.Item name="hn">
              <Input />
            </Form.Item>
            <Form.Item name="runHn">
              <Input />
            </Form.Item>
            <Form.Item name="yearHn">
              <Input />
            </Form.Item>
            <Form.Item name="ptRightId">
              <Input />
            </Form.Item>
          </div>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {genFormItem("mainFlag", 12)}
            {genFormItem("identifyFlag", 12)}
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {genFormItem("rightId", 12)}
            {genFormItem("changwat", 12)}
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {/* {genFormItem("hmain", 12)} */}
            {/* {genFormItem("hsub", 12)} */}
            {/* 07 บัตรทอง ส่งเสริมสุขภาพ , 108 บัตรทอง ตรวจสุขภาพ */}
            <Col span={12}>
              <Form.Item
                name={"hmain"}
                label={labelTopicPrimary("รพ.หลัก")}
                rules={[{
                  required: rightGroup === "UCS" ? rightId !== "07" : false,
                  message: "จำเป็น"
                }]}
              >
                <SelectHospCode value={form.getFieldValue("hmain")} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={"hsub"}
                label={labelTopicPrimary("รพ.รอง")}
                rules={[{
                  required: rightGroup === "UCS" ? rightId !== "07" : false,
                  message: "จำเป็น"
                }]}
              >
                <SelectHospCode value={form.getFieldValue("hsub")} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {/* {genFormItem("hmainOp", 12)} */}
            <Col span={12}>
              <Form.Item
                name={"hmainOp"}
                label={labelTopicPrimary("รพ.ที่รักษาประจำ")}
                rules={[{
                  required: rightGroup === "SSS" ? rightId !== "07" : false,
                  message: "จำเป็น"
                }]}
              >
                <SelectHospCode value={form.getFieldValue("hmainOp")} />
              </Form.Item>
            </Col>
            {genFormItem("insid", 12)}
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {genFormItem("relinscl", 12)}
            {genFormItem("ownRightPid", 12)}
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {genFormItem("govcode", 12)}
            {genFormItem("startDate", 6)}
            {genFormItem("expireDate", 6)}
          </Row>
          <Row gutter={[8, 8]} style={{
            flexDirection: "row",
            marginTop: -12
          }}>
            {genFormItem("remark", 24)}
          </Row>
        </Form>
      </ConfigProvider>
    </Modal>
  </div>;
}
const labelTopicPrimary = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`}>{text}</label>;
};
const GetDropdown = async action => {
  let masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
  let res = await axios.post(masters).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
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
  // GetHospcodes
  {
    name: "GetHospcodes",
    url: "Masters/GetHospcodes",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
  // GetPatientsByID
  {
    name: "GetPatientsByID",
    url: "Patients/GetPatientsByID/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  },
  // GetListPatientRight
  {
    name: "GetListPatientRight",
    url: "OpdRightVisit/GetOpdRightVisit",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
  // InsPatientsRights
  {
    name: "InsPatientsRights",
    url: "OpdRightVisit/InsPatientsRights",
    method: "POST",
    return: "data",
    sendRequest: true
  },
  // UpdPatientsRights
  {
    name: "UpdPatientsRights",
    url: "OpdRightVisit/UpdPatientsRights",
    method: "PUT",
    return: "data",
    sendRequest: true
  }];