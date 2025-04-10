/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from 'react'
import { map, filter, toNumber, isNaN, debounce } from "lodash";
import { Button, Col, Form, Input, InputNumber, Row, Table } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import { chkVitalSignConfigs } from "components/helper/VitaalSign.js";
import { callApis } from 'components/helper/function/CallApi';
import CalculatorMap from "components/helper/function/CalculatorMap"
import ShowCvd from "components/helper/function/CalculatorCvd";

const size = "small"
const labelZoom85 = (label) => <label className='d-block' style={{ zoom: '80%' }}>{label}</label>;
export default function VitalSign({
  form,
  vitalSignsHis = [],
  vitalSignConfigs = null,
  showOnly = false,
  getConfigVs = false,
  opdClinicDetails = null,
  age = null,
  gender = null,
}) {
  // console.log('vitalSignsHis :>> ', vitalSignsHis);
  // Watch
  const height = toNumber(Form.useWatch("height", form));
  const weight = toNumber(Form.useWatch("weight", form));
  const bodyTemperature = toNumber(Form.useWatch("bodyTemperature", form));
  const o2satFormValue = toNumber(Form.useWatch("o2sat", form));
  const pulse = toNumber(Form.useWatch("pulse", form));
  const respiratory = toNumber(Form.useWatch("respiratory", form));
  const bpSystolic = Form.useWatch('bpSystolic', form);
  const bpDiastolic = Form.useWatch('bpDiastolic', form);
  const map1 = Form.useWatch('map', form);
  const bpSystolic2 = Form.useWatch('bpSystolic2', form);
  const bpDiastolic2 = Form.useWatch('bpDiastolic2', form);
  const map2 = Form.useWatch('map2', form);
  const cvd = Form.useWatch('cvd', form);
  // State
  // const [, setFriend] = useState(false)
  const [columnsDisplay, setColumnsDisplay] = useState(2)
  const [vsConfigs, setVsConfigs] = useState(null);
  const [o2sat, seto2sat] = useState(true);
  // Funcs
  const getConfigdata = async () => {
    let res = await callApis(apis["GetConfigdata"]);
    setVsConfigs(res);
  };
  const getBMIFUNC = (bmi) => {
    const classification =
      bmi < 18.5 ? "ต่ำกว่าเกณฑ์" :
        bmi < 23 ? "ปกติสมส่วน" :
          bmi < 25 ? "น้ำหนักเกิน" :
            bmi < 30 ? "อ้วนระดับ 1" :
              "อ้วนระดับ 2";

    return classification;
  };
  const clcBsaBmi = () => {
    const formValues = form.getFieldsValue();
    const weight = formValues.weight ? toNumber(formValues.weight) : 0;
    const height = formValues.height ? toNumber(formValues.height) : 0;
    if (weight && height) {
      const bsa = Math.sqrt(weight * height / 3600).toFixed(4);
      const bmi = Number(weight / (height * 0.01) ** 2).toFixed(2);
      form.setFieldsValue({
        bsa: String(bsa),
        bmi: String(bmi),
      });
    } else {
      form.setFieldsValue({
        bsa: null,
        bmi: null
      });
    }
  };
  const clcBsaHis = (dts) => {
    const weight = dts.weight ? toNumber(dts.weight) : 0;
    const height = dts.height ? toNumber(dts.height) : 0;
    if (weight && height) {
      const bsa = Math.sqrt(weight * height / 3600).toFixed(4);
      form.setFieldsValue({
        bsa: String(bsa),
      });
      return bsa
    } else {
      form.setFieldsValue({
        bsa: null,
      });
      return "-"
    }
  };
  const clcBmiHis = (dts) => {
    const weight = dts.weight ? toNumber(dts.weight) : 0;
    const height = dts.height ? toNumber(dts.height) : 0;
    if (weight && height) {
      const bmi = Number(weight / (height * 0.01) ** 2).toFixed(2);
      if (bmi) {
        return <div>
          <label className='data-value d-block'>
            {bmi}
          </label>
          <label className='data-value d-block'>
            {getBMIFUNC(String(bmi))}
          </label>
        </div>
      } else {
        return "-"
      }
    } else {
      return "-"
    }
  };
  const chkInteger = (v) => {
    let value = toNumber(v)
    value = isNaN(value) ? "-" : value
    value = value === "-"
      ? value
      : value % 1 === 0
        ? value
        : value.toFixed(2)
    return value
  }
  const renderCvd = (cvd) => {
    if (!cvd) return "-"
    let value = toNumber(cvd)
    value = isNaN(value) ? "-" : value
    if (value === "-") return value
    if (value < 10) return "<10%"
    if (value < 20) return "<20%"
    if (value < 30) return "<30%"
    if (value < 40) return "<40%"
    return ">=50%"
  }
  const renderBloodPressure = (systolicName, diastolicName, label) => {
    const systolicField = fields.find(f => f.field === systolicName);
    const diastolicField = fields.find(f => f.field === diastolicName);
    const values = form.getFieldsValue();
    const systolicValue = values?.[systolicName];
    const diastolicValue = values?.[diastolicName];

    return (
      <div style={{ display: "flex", alignItems: "center", margin: -8 }}>
        <Form.Item name={systolicName} className="m-0">
          <InputNumber
            stringMode
            placeholder="Systolic"
            disabled={systolicField?.disabled || showOnly}
            size={size}
            controls={false}
            style={{
              width: 50,
              color: chkVitalSignConfigs("color", systolicValue, vsConfigs?.[systolicName]),
              backgroundColor: opdClinicDetails?.[systolicName] ? "#69f0ae" : "",
            }}
            status={chkVitalSignConfigs("status", systolicValue, vsConfigs?.[systolicName])}
            onChange={() => handleChangeInput(systolicName)}
          />
        </Form.Item>
        <div style={{ display: "flex", alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#555", width: 50 }}>{label}</label>
          <Form.Item name={diastolicName} className="m-0">
            <InputNumber
              stringMode
              placeholder="Diastolic"
              disabled={diastolicField?.disabled || showOnly}
              size={size}
              controls={false}
              style={{
                width: 50,
                color: chkVitalSignConfigs("color", diastolicValue, vsConfigs?.[diastolicName]),
                backgroundColor: opdClinicDetails?.[diastolicName] ? "#69f0ae" : "",
              }}
              status={chkVitalSignConfigs("status", diastolicValue, vsConfigs?.[diastolicName])}
              onChange={() => handleChangeInput(diastolicName)}
            />
          </Form.Item>
        </div>
      </div>
    );
  };
  const debounceClcMap = useMemo(() => {
    const clcMap = (bpDiastolic, bpSystolic) => {
      const map1 = CalculatorMap({ bpDiastolic, bpSystolic });
      form.setFieldsValue({
        map: map1 || null,
      });
    };
    return debounce(clcMap, 500);
  }, []);
  const debounceClcMap2 = useMemo(() => {
    const clcMap = (bpDiastolic, bpSystolic) => {
      const map2 = CalculatorMap({ bpDiastolic, bpSystolic });
      form.setFieldsValue({
        map2: map2,
      });
    };
    return debounce(clcMap, 500);
  }, []);
  const handleChangeInput = (name) => {
    switch (name) {
      case "o2sat":
        seto2sat(!o2sat);
        break;
      case "height":
        clcBsaBmi()
        break;
      case "weight":
        clcBsaBmi()
        break;
      default: break;
    }
  }
  useEffect(() => {
    if (getConfigVs) {
      getConfigdata()
    } else {
      setVsConfigs(vitalSignConfigs)
    }
  }, [vitalSignConfigs])
  useEffect(() => {
    debounceClcMap(bpDiastolic, bpSystolic)
  }, [bpDiastolic, bpSystolic])
  useEffect(() => {
    debounceClcMap2(bpDiastolic2, bpSystolic2)
  }, [bpDiastolic2, bpSystolic2])

  const filteredFields = fields.filter(f => !["bpDiastolic", "bpDiastolic2"].includes(f.field));

  const columns = [
    {
      title: <Row gutter={[4, 2]} style={{ flexDirection: "row" }}>
        <Col>
          <Button
            size={size}
            className='mb-0'
            type='primary'
            icon={<PlusOutlined />}
            disabled={columnsDisplay >= vitalSignsHis.length}
            onClick={(e) => {
              e.stopPropagation();
              setColumnsDisplay(p => p + 1)
            }}
          />
        </Col>
      </Row >,
      width: 90,
      dataIndex: 'name',
      fixed: "left",
    },
    {
      title: "",
      width: 175,
      render: (v, r, i) => {
        const name = filteredFields[i].field;
        const placeholder = filteredFields[i].placeholder;
        const disabled = filteredFields[i].disabled;
        const vsConfig = vsConfigs?.[name];
        const values = form.getFieldsValue();
        const value = values?.[name];

        if (name === "bpSystolic") {
          return renderBloodPressure("bpSystolic", "bpDiastolic", "Dias.1");
        }
        if (name === "bpSystolic2") {
          return renderBloodPressure("bpSystolic2", "bpDiastolic2", "Dias.2");
        }
        switch (name) {
          case "bmi":
            return clcBmiHis(values);
          case "bsa":
            return clcBsaHis(values);
          case "map":
            return chkInteger(value);
          case "map2":
            return chkInteger(value);
          case "cvd":
            return renderCvd(value);
          default:
            return (
              <div style={{ margin: -8 }}>
                <Form.Item name={name} className="m-0">
                  <InputNumber
                    stringMode
                    placeholder={placeholder}
                    disabled={disabled || showOnly}
                    size={size}
                    controls={false}
                    style={{
                      margin: 0,
                      width: 50,
                      color: chkVitalSignConfigs("color", value, vsConfig),
                      backgroundColor: opdClinicDetails?.[name] ? "#69f0ae" : "",
                    }}
                    status={chkVitalSignConfigs("status", value, vsConfig)}
                    onChange={() => handleChangeInput(name)}
                  />
                </Form.Item>
              </div>
            );
        }
      },
    },
    ...map(
      filter(vitalSignsHis, (f, i) => i < columnsDisplay),
      (o, vIndex) => {
        const dateCreated = o.dateCreated ? dayjs(o.dateCreated, "MM/DD/YYYY HH:mm").format("DD/MM/YYYY HH:mm") : "-";
        return {
          title: (
            <>
              {labelZoom85(o?.userCreatedName)}
              {labelZoom85(dateCreated)}
            </>
          ),
          align: "center",
          width: 95,
          render: (v, r, i) => {
            const name = filteredFields[i]?.field;
            const crrRow = vitalSignsHis?.[vIndex] || [];
            const field = filteredFields?.[i]?.field || null;

            if (name === "bpSystolic") {
              const systolic = chkInteger(crrRow?.bpSystolic);
              const diastolic = chkInteger(crrRow?.bpDiastolic);
              return (
                <label
                  className="data-value"
                  style={{ color: chkVitalSignConfigs("color", systolic, vsConfigs?.bpSystolic) }}
                >
                  {systolic}/{diastolic}
                </label>
              );
            }

            if (name === "bpSystolic2") {
              const systolic2 = chkInteger(crrRow?.bpSystolic2);
              const diastolic2 = chkInteger(crrRow?.bpDiastolic2);
              return (
                <label
                  className="data-value"
                  style={{ color: chkVitalSignConfigs("color", systolic2, vsConfigs?.bpSystolic2) }}
                >
                  {systolic2}/{diastolic2}
                </label>
              );
            }

            let value = chkInteger(crrRow[field]);
            if (name === "chestline") {
              value = chkInteger(crrRow?.chestlineIn || null);
            }
            if (name === "cvd") {
              value = renderCvd(crrRow?.cvd || null);
            }

            const vsConfig = vsConfigs?.[name];
            return (
              <label className="data-value" style={{ color: chkVitalSignConfigs("color", value, vsConfig) }}>
                {value}
              </label>
            );
          },
        };
      }
    ),
  ]
  return <>
    <Form.Item hidden name={"map"}><Input /></Form.Item>
    <Form.Item hidden name={"map2"}><Input /></Form.Item>
    <Form.Item hidden name={"cvd"}><Input /></Form.Item>
    <Form.Item hidden name={"bsa"}><Input /></Form.Item>
    <Form.Item hidden name={"smoke"}><Input /></Form.Item>
    <Form.Item hidden name={"dm"}><Input /></Form.Item>
    <Form.Item hidden name={"neuro"}><Input /></Form.Item>
    {ShowCvd({ form: form, age: age, gender: gender })}
    <Table
      size={size}
      rowClassName="data-value"
      columns={columns}
      dataSource={fields.filter(f => !["bpDiastolic", "bpDiastolic2"].includes(f.field))}
      pagination={false}
      scroll={{ x: 300 }}
    />
  </>
}
const fields = [
  { field: "bodyTemperature", name: 'Temperature', disabled: false, placeholder: " ํC" },
  { field: "pulse", name: 'Pulse', disabled: false, placeholder: "/min" },
  { field: "respiratory", name: 'Respiration', disabled: false, placeholder: "/min" },
  { field: "bpSystolic", name: 'Sys.1', disabled: false, placeholder: "" },
  { field: "bpSystolic2", name: 'Sys.2', disabled: false, placeholder: "" },
  { field: "bpDiastolic", name: 'Dias.1', disabled: false, placeholder: "" },
  { field: "bpDiastolic2", name: 'Dias.2', disabled: false, placeholder: "" },
  { field: "map", name: 'MAP', disabled: true, placeholder: "" },
  { field: "map2", name: 'MAP2', disabled: true, placeholder: "" },
  { field: "o2sat", name: 'O2sat', disabled: false, placeholder: "" },
  { field: "weight", name: 'Weight', disabled: false, placeholder: "kg" },
  { field: "height", name: 'Height', disabled: false, placeholder: "cm" },
  { field: "bmi", name: 'BMI', disabled: true, placeholder: "" },
  { field: "bsa", name: 'BSA', disabled: true, placeholder: "" },
  { field: "chestline", name: 'รอบอก', disabled: false, placeholder: "cm" },
  { field: "waistline", name: 'รอบเอว', disabled: false, placeholder: "cm" },
  { field: "cvd", name: 'CVD Risk', disabled: false, placeholder: "cm" },
];

const apis = {
  GetConfigdata: {
    url: "Masters/GetConfigdataWithMinMax",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
}