import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Form, Input, InputNumber, Modal, Row, Select, Spin } from 'antd';
import axios from "axios";
import dayjs from "dayjs";
import { map, find, filter, toNumber, orderBy } from "lodash";
import { useEffect, useState } from 'react';
import { env } from '../../env.js';
import { notificationX as notiX } from "../Notification/notificationX";
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function Address(props) {
  const {
    patientId = null,
    onFinishAddress = () => { },
    addAble = true,
    editAble = true,
    deleteAble = true
  } = props;
  const [form] = Form.useForm();
  // useState
  const [loading, setLoading] = useState(false);
  const [listAddress, setListAddress] = useState([]);
  const [listAddressType, setListAddressType] = useState([]);
  const [isVisForm, setIsVisForm] = useState(false);
  const [listTambon, setListTambon] = useState([]);
  const [listAmphur, setListAmphur] = useState([]);
  const [listFilteredTambon, setListFilteredTambon] = useState([]);
  const [listFilteredAmphur, setListFilteredAmphur] = useState([]);
  const [listChangwat, setListChangwat] = useState([]);
  const [listCountry, setListCountry] = useState([]);

  // Function GetData
  const getListAddress = async patientId => {
    if (!patientId) return setListAddress([]);
    let res = await callApi("getListAddress", patientId);
    setListAddress(filter(res, o => !o.deleteFlag));
  };
  const getDropDowns = async name => {
    if (!isVisForm) return;
    let res = [];
    let mapping = [];
    switch (name) {
      case "getTambon":
        if (listTambon.length) return;
        res = await callApi("getTambon");
        mapping = map(res, o => {
          let keyword = `${o.datavalue}${o.datadisplay}`;
          return {
            ...o,
            value: o.datavalue,
            label: o.datadisplay,
            keyword: keyword,
            className: "data-value"
          };
        });
        // console.log('mapping', mapping)
        setListTambon(mapping);
        setListFilteredTambon(mapping);
        break;
      case "getAmphur":
        if (listAmphur.length) return;
        res = await callApi("getAmphur");
        mapping = map(res, o => {
          let keyword = `${o.datavalue}${o.datadisplay}`;
          return {
            ...o,
            value: o.datavalue,
            label: o.datadisplay,
            keyword: keyword,
            className: "data-value"
          };
        });
        // console.log('mapping', mapping)
        setListAmphur(mapping);
        setListFilteredAmphur(mapping);
        break;
      case "getChangwat":
        if (listChangwat.length) return;
        res = await callApi("getChangwat");
        mapping = map(res, o => {
          let keyword = `${o.datavalue}${o.datadisplay}`;
          return {
            ...o,
            value: o.datavalue,
            label: o.datadisplay,
            keyword: keyword,
            className: "data-value"
          };
        });
        // console.log('mapping', mapping)
        setListChangwat(mapping);
        break;
      case "getCountries":
        if (listCountry.length) return;
        res = await callApi("getCountries", {
          code: null,
          name: null
        });
        mapping = map(res, o => {
          let mapping1 = toNumber(o?.mapping1 || 0);
          let label = `${mapping1} ${o.name}`;
          return {
            ...o,
            value: o.countryId,
            label: label,
            className: "data-value",
            orderBy: mapping1
          };
        });
        let filtered = filter(mapping, o => !o.cancelFlag);
        let ordered = orderBy(filtered, ['orderBy'], ['asc']);
        setListCountry(ordered);
        break;
      default:
        break;
    }
  };

  // Function ดำเนินการ
  const onFinish = async v => {
    let crrDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    // console.log('v', v)
    let req = {
      ...v,
      patientId: patientId
    };
    setLoading(true);
    let res = null;
    if (!v?.addressId) {
      req.userCreated = user;
      req.dateCreated = crrDate;
      res = await callApi("insAddress", req);
    }
    if (v?.addressId) {
      req.userModified = user;
      req.dateModified = crrDate;
      res = await callApi("updAddress", req);
    }
    if (res?.isSuccess) {
      getListAddress(patientId);
      setIsVisForm(false);
      form.resetFields();
    }
    notiX(res?.isSuccess, "บันทึกข้อมูลที่อยู่");
    onFinishAddress(res?.isSuccess);
    setLoading(false);
  };
  const getAddressByType = async (type, code, formValues) => {
    // console.log('formValues', formValues)
    // console.log('type', type)
    // console.log('code', code)
    const getData = async (type, code) => {
      let res = await callApi('getAddressByType', `${type}, ${code}`);
      let mappingTambon = map(res?.masterDataTambon, o => {
        let orderByX = toNumber(o?.datavalue || 0);
        let keyword = `${o.datavalue}${o.datadisplay}`;
        return {
          ...o,
          value: o.datavalue,
          label: o.datadisplay,
          keyword: keyword,
          className: "data-value",
          orderBy: orderByX
        };
      });
      mappingTambon = orderBy(mappingTambon, ["orderBy"], ["asc"]);
      let mappingAmphur = map(res?.masterDataAmphur, o => {
        let orderByX = toNumber(o?.datavalue || 0);
        let keyword = `${o.datavalue}${o.datadisplay}`;
        return {
          ...o,
          value: o.datavalue,
          label: o.datadisplay,
          keyword: keyword,
          className: "data-value",
          orderBy: orderByX
        };
      });
      mappingAmphur = orderBy(mappingAmphur, ["orderBy"], ["asc"]);
      let tempChangwat = res?.masterDataChangwat || [];
      return {
        tambons: mappingTambon,
        amphurs: mappingAmphur,
        changwats: tempChangwat
      };
    };
    switch (type) {
      case "T":
        if (code) {
          let resT = await getData("T", code);
          form.setFieldsValue({
            amphur: resT?.amphurs[0]?.datavalue
          });
          form.setFieldsValue({
            changwat: resT?.changwats[0]?.datavalue
          });
          form.setFieldsValue({
            zipcode: resT?.tambons[0]?.dataother2
          });
          let resA = await getData("A", code);
          setListFilteredTambon(resA?.tambons);
          let resC = await getData("C", code);
          setListFilteredAmphur(resC?.amphurs);
        }
        break;
      case "A":
        if (code) {
          let resA = await getData("A", code);
          form.setFieldsValue({
            changwat: resA?.changwats[0]?.datavalue
          });
          setListFilteredTambon(resA?.tambons);
          if (formValues?.tambon) {
            let findTambon = find(resA?.tambons, ['value', formValues?.tambon]);
            if (!findTambon) form.setFieldsValue({
              tambon: null
            });
          }
          let resC = await getData("C", resA?.changwats[0]?.datavalue);
          setListFilteredAmphur(resC?.amphurs);
        }
        if (!code) {
          if (formValues?.changwat) {
            let resC = await getData("C", formValues?.changwat);
            setListFilteredTambon(resC?.tambons);
          }
          if (!formValues?.changwat) {
            setListFilteredTambon(listTambon);
          }
        }
        break;
      case "C":
        if (!code) return setListFilteredAmphur(listAmphur);
        let {
          tambons,
          amphurs,
        } = await getData("C", code);
        setListFilteredAmphur(amphurs);
        if (!formValues?.amphur) setListFilteredTambon(tambons);
        if (formValues?.amphur) {
          let findAmphur = find(amphurs, ['value', formValues?.amphur]);
          if (!findAmphur) {
            form.setFieldsValue({
              amphur: null
            });
            setListFilteredTambon(tambons);
          }
        }
        if (formValues?.tambon) {
          let findTambon = find(tambons, ['value', formValues?.tambon]);
          if (!findTambon) form.setFieldsValue({
            tambon: null
          });
        }
        break;
      default:
        break;
    }
  };
  const handleChangeTAC = name => {
    let formValues = form.getFieldsValue();
    let type = null;
    let code = null;
    switch (name) {
      case "tambon":
        type = "T";
        code = formValues?.tambon || "";
        break;
      case "amphur":
        type = "A";
        code = formValues?.amphur || "";
        break;
      case "changwat":
        type = "C";
        code = formValues?.changwat || "";
        break;
      default:
        break;
    }
    getAddressByType(type, code, formValues);
  };
  const genFormItem = (fieldName, span = 24) => {
    // console.log('fieldName :>> ', fieldName);
    const listItem = [
      // addressType
      {
        name: "addressType",
        label: "ประเภทที่อยู่",
        required: true,
        inputType: "select",
        allowClear: false,
        hidden: false,
        valuePropName: undefined,
        options: listAddressType
      },
      // countryId
      {
        name: "countryId",
        label: "ประเทศ",
        required: true,
        inputType: "select",
        allowClear: false,
        hidden: false,
        valuePropName: undefined,
        options: listCountry
      },
      // addressNo
      {
        name: "addressNo",
        label: "เลขที่",
        required: true,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
      },
      // villaname
      {
        name: "villaname",
        label: "อาคาร/หมู่บ้าน",
        required: false,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
        // rows: 2
        // options: []
      },
      // moo
      {
        name: "moo",
        label: "หมู่",
        required: false,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
        // rows: 2
        // options: []
      },
      // soimain
      {
        name: "soimain",
        label: "ซอย",
        required: false,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
        // rows: 2
        // options: []
      },
      // soisub
      {
        name: "soisub",
        label: "แยก",
        required: false,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
        // rows: 2
        // options: []
      },
      // road
      {
        name: "road",
        label: "ถนน",
        required: false,
        inputType: "input",
        hidden: false,
        valuePropName: undefined
        // rows: 2
        // options: []
      },
      // tambon
      {
        name: "tambon",
        label: "แขวง/ตำบล",
        required: true,
        // allowClear: false,
        inputType: "select",
        hidden: false,
        valuePropName: undefined,
        options: listFilteredTambon,
        optionFilterProp: "keyword",
        onChange: () => {
          handleChangeTAC("tambon");
        }
      },
      // amphur
      {
        name: "amphur",
        label: "เขต/อำเภอ",
        required: true,
        inputType: "select",
        // allowClear: false,
        hidden: false,
        valuePropName: undefined,
        options: listFilteredAmphur,
        optionFilterProp: "keyword",
        onChange: () => {
          handleChangeTAC("amphur");
        }
      },
      // changwat
      {
        name: "changwat",
        label: "จังหวัด",
        required: true,
        inputType: "select",
        // allowClear: false,
        hidden: false,
        valuePropName: undefined,
        options: listChangwat,
        optionFilterProp: "keyword",
        onChange: () => {
          handleChangeTAC("changwat");
        }
      },
      // zipcode
      {
        name: "zipcode",
        label: "รหัสไปรษณีย์",
        required: false,
        inputType: "inputNumber",
        hidden: false,
        valuePropName: undefined
        // options: listAddressType
      }];

    let fndByName = find(listItem, ['name', fieldName]);
    if (!fndByName) return;
    const {
      name,
      label,
      required,
      inputType,
      hidden,
      valuePropName,
      options,
      placeholder,
      rows,
      disabled,
      optionFilterProp = "label",
      onChange = () => { },
      allowClear = true
    } = fndByName;
    const genInput = () => {
      // eslint-disable-next-line default-case
      switch (inputType) {
        case "select":
          return <Select showSearch allowClear={allowClear} optionFilterProp={optionFilterProp} className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} options={options || []} dropdownMatchSelectWidth={345} disabled={disabled} onChange={onChange} />;
        case "textArea":
          return <Input.TextArea className="data-value" rows={rows || 1} placeholder={placeholder} disabled={disabled} />;
        case "input":
          return <Input className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} disabled={disabled} />;
        case "inputNumber":
          return <InputNumber className="data-value" style={{
            width: "100%"
          }} placeholder={placeholder} stringMode controls={false} disabled={disabled} />;
      }
    };
    return <Col span={span} style={{
      marginTop: -8
    }}>
      <Form.Item name={name} label={label ? labelTopicPrimary(label) : false} hidden={hidden} rules={[{
        required: required,
        message: "จำเป็น"
      }]} valuePropName={valuePropName}>
        {genInput()}
      </Form.Item>
    </Col>;
  };
  const renderForm = () => {
    return <Modal title={<>{labelTopicPrimary18("เพิ่ม/แก้ไข รายละเอียดที่อยู่")}</>} visible={isVisForm} onOk={() => form.submit()} onCancel={() => {
      form.resetFields();
      setIsVisForm(false);
    }} centered okText="บันทึก" cancelText="ปิด"
    // forceRender
    >
      <Spin spinning={loading}>
        <Form form={form} onFinish={onFinish} layout='vertical'>
          <Form.Item name="addressId" hidden> <Input /></Form.Item>
          <Row gutter={[8, 8]} className='mb-2' style={{
            flexDirection: 'row'
          }}>
            {genFormItem("addressType", 12)}
            {genFormItem("countryId", 12)}
            {genFormItem("addressNo", 12)}
            {genFormItem("villaname", 12)}
            {genFormItem("moo", 12)}
            {genFormItem("soimain", 12)}
            {genFormItem("soisub", 12)}
            {genFormItem("road", 12)}
            {genFormItem("tambon", 12)}
            {genFormItem("amphur", 12)}
            {genFormItem("changwat", 12)}
            {genFormItem("zipcode", 12)}
          </Row>
        </Form>
      </Spin>
    </Modal>;
  };

  // useEffect
  useEffect(() => {
    getListAddress(patientId);
  }, [patientId]);
  useEffect(() => {
    getDropDowns("getTambon");
    getDropDowns("getAmphur");
    getDropDowns("getChangwat");
    getDropDowns("getCountries");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisForm]);
  useEffect(() => {
    let mapping = map(addressType, o => {
      let findUsed = find(listAddress, ["addressType", o.value]);
      return {
        ...o,
        disabled: findUsed ? true : false
      };
    });
    setListAddressType(mapping);
  }, [listAddress]);
  return <div>
    <Row gutter={[8, 8]} className='mb-2'>
      <Col span={12}>
        {labelTopicPrimary18("ที่อยู่")}
      </Col>
      <Col span={12} className='text-end'>
        <Button type='primary' style={{
          margin: 0
        }}
          // size='small'
          icon={<PlusOutlined />} onClick={() => {
            if (!patientId) return notiX(false, "กรุณาเลือกผู้ป่วย", " ");
            setIsVisForm(true);
          }}>เพิ่มที่อยู่</Button>
      </Col>
      {renderForm()}
    </Row>
    <Divider />
    {map(listAddress, o => {
      return <>
        <Row gutter={[8, 8]}>
          <Col span={16}>
            {/* {labelTopicPrimary18("ประเภทที่อยู่")} */}
            {labelTopic18(find(addressType, ["value", o.addressType])?.label || "-")}
          </Col>
          <Col span={8} className='text-end'>
            <Button style={{
              margin: 0
            }} size='small' icon={<EditOutlined style={{
              color: "blue"
            }} />} disabled={!editAble} onClick={() => {
              // console.log('address', o)
              form.setFieldsValue(o);
              setIsVisForm(true);
            }} />
            &nbsp;&nbsp;
            <Button style={{
              margin: 0
            }} size='small' icon={<DeleteOutlined style={{
              color: "red"
            }} />} disabled={!deleteAble} onClick={async () => {
              // console.log('addressId', o?.addressId)
              let req = {
                ...o,
                patientId: patientId,
                deleteFlag: "Y",
                userDelete: user,
                dateDelete: dayjs().format("YYYY-MM-DD HH:mm:ss")
              };
              let res = await callApi("delAddress", req);
              if (res?.isSuccess) getListAddress(patientId);
              notiX(res?.isSuccess, "ลบข้อมูลที่อยู่");
              onFinishAddress(res?.isSuccess);
            }} />
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            {labelTopicPrimary("เลขที่", "me-1")}
            {labelText(o?.addressNo || "-", "me-2")}
            {labelTopicPrimary("อาคาร/หมู่บ้าน", "me-1")}
            {labelText(o?.villaname || "-", "me-2")}
            {labelTopicPrimary("หมู่ที่", "me-1")}
            {labelText(o?.moo || "-", "me-2")}
            {labelTopicPrimary("ซอย", "me-1")}
            {labelText(o?.soimain || "-", "me-2")}
            {labelTopicPrimary("แยก", "me-1")}
            {labelText(o?.soisub || "-", "me-2")}
            {labelTopicPrimary("ถนน", "me-1")}
            {labelText(o?.road || "-", "me-2")}
            {labelTopicPrimary("แขวง/ตำบล", "me-1")}
            {labelText(o?.tambonName || "-", "me-2")}
            {labelTopicPrimary("เขต/อำเภอ", "me-1")}
            {labelText(o?.amphurName || "-", "me-2")}
            {labelTopicPrimary("จังหวัด", "me-1")}
            {labelText(o?.changwatName || "-", "me-2")}
            {labelTopicPrimary("หรัสไปรษณีย์", "me-1")}
            {labelText(o?.zipcode || "-", "me-2")}
            {labelTopicPrimary("ประเทศ", "me-1")}
            {labelText(o?.countryName || "-")}
          </Col>
        </Row>
        <Divider />
      </>;
    })}
  </div>;
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
const labelTopic18 = (text, extraClass) => {
  return <label className={`${extraClass}`} style={{
    fontSize: 18,
    fontWeight: "bold"
  }}>
    {text}
  </label>;
};
const labelText = (text, extraClass) => {
  return <label className={`data-value ${extraClass}`}>{text}</label>;
};
const addressType = [{
  value: "1",
  label: "ที่อยู่ตามทะเบียนบ้าน",
  className: "data-value"
}, {
  value: "2",
  label: "ที่อยู่ปัจจุบัน",
  className: "data-value"
}, {
  value: "3",
  label: "ที่อยู่นายจ้าง",
  className: "data-value"
}, {
  value: "4",
  label: "ที่อยู่ทำงาน",
  className: "data-value"
}, {
  value: "5",
  label: "ที่อยู่ตามบัตรประชาชน",
  className: "data-value"
}, {
  value: "6",
  label: "ที่อยู่จัดส่งยาทางไปรษณีย์",
  className: "data-value"
}];
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
  // getListAddress
  {
    name: "getListAddress",
    url: "Patients/GetPatients_AddressByID/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  },
  // getTambon
  {
    name: "getTambon",
    url: "Masters/GetTambonMas",
    method: "POST",
    return: "responseData",
    sendRequest: false
  },
  // getAmphur
  {
    name: "getAmphur",
    url: "Masters/GetAmphurMas",
    method: "POST",
    return: "responseData",
    sendRequest: false
  },
  // getChangwat
  {
    name: "getChangwat",
    url: "Masters/GetChangwatMas",
    method: "POST",
    return: "responseData",
    sendRequest: false
  },
  // getAddressByType
  {
    name: "getAddressByType",
    url: "Masters/GetAddressMaster/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  },
  // getCountries
  {
    name: "getCountries",
    url: "OpdCardMasterCode/GetCountries",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
  // insAddress
  {
    name: "insAddress",
    url: "Patients/InsPatients_Address",
    method: "POST",
    return: "data",
    sendRequest: true
  },
  // updAddress
  {
    name: "updAddress",
    url: "Patients/UpdPatient_Address",
    method: "PUT",
    return: "data",
    sendRequest: true
  }, {
    name: "delAddress",
    url: "Patients/DelPatient_Address",
    method: "PUT",
    return: "data",
    sendRequest: true
  }];