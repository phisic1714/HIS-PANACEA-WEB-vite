import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, ConfigProvider, Form, Modal, Radio, Row, Select, Spin, Table } from 'antd';
import thTH from "antd/lib/locale/th_TH";
import axios from 'axios';
import dayjs from "dayjs";
import { filter, find, map, uniqBy } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { env } from '../../env.js';
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";

export default forwardRef(function ReDiags({
  isVisible = false,
  setIsVisible = () => { },
  patientId = null,
  // clinicId = null,
  afterOk = () => { }
}, ref) {
  // console.log('patientId', patientId)
  const [loading, setLoading] = useState(false);
  const [formRedigs] = Form.useForm();
  const [listDoctorMas, setListDoctorMas] = useState([]);
  const [radioValue, setRadioValue] = useState(null);
  const [listOldClinic, setListOldClinic] = useState([]);
  const [listOldDiag, setListOldDiag] = useState([]);
  const [listCheckedOldDiags, setListCheckedOldDiags] = useState([]);
  const [listDiagForAdd, setListDiagForAdd] = useState([]);
  const [listWorkPlace, setListWorkPlace] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isfirstTime, setIsfirstTime] = useState(true);
  const [listDateForSelect, setListDateForSelect] = useState([]);

  useImperativeHandle(ref, () => ({
    autoRediagsByClinicId: autoRediagsByClinicId
  }));
  const FirstActions = () => {
    const getDoctorMas = async () => {
      setLoading(true);
      if (listDoctorMas.length === 0) {
        let res = await GetDoctorMas();
        let mapping = map(res || [], o => {
          return {
            ...o,
            value: o.datavalue,
            label: o.datadisplay,
            className: "data-value"
          };
        });
        setListDoctorMas(mapping);
      }
      setLoading(false);
    };
    const getWorkPlacesMas = async () => {
      let res = await GetOpdWorkPlaces();
      let mapping = map(res || [], o => {
        return {
          value: o.datavalue,
          label: o.datadisplay,
          className: "data-value"
        };
      });
      setListWorkPlace(mapping);
    };

    // Get Dropdowns
    getDoctorMas();
    getWorkPlacesMas();
    formRedigs.submit();
  };
  useEffect(() => {
    if (patientId && isVisible) {
      FirstActions();
      setIsfirstTime(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isVisible]);
  const modalControl = action => {
    switch (action) {
      case "close":
        setIsVisible(false);
        setSelectAllChecked(false)
        setListCheckedOldDiags([])
        setRadioValue(null)
        setListOldDiag([])
        setListDiagForAdd([])
        break;
      default: break;
    }
  };
  const autoRediagsByClinicId = async clinicId => {
    const req = {
      clinicId
    };
    let res = await GetOpdClinicsReDiags(req);
    if (res) {
      afterOk(res);
      return true;
    } else {
      return false;
    }
  };
  const onFormReDiagsFinish = async v => {
    console.log('v', v);
    let date = v?.clinicDate ? dayjs(v?.clinicDate, "MM/DD/YYYY").format("YYYY-MM-DD") : null;
    let req = {
      "patientId": patientId || null,
      "clinicId": null,
      "workId": v.workId || null,
      "doctor": v.doctor || null,
      "startDate": date ? date : v.startDate ? dayjs(v.startDate).format("YYYY-MM-DD") : null,
      "endDate": date ? date : v.endDate ? dayjs(v.endDate).format("YYYY-MM-DD") : null,
      "clinicDate": null
    };
    let res = await GetOpdClinicsDiagReDiags(req);
    setListOldClinic(res);
    if (!v?.clinicDate && !v?.startDate && !v?.endDate) {
      if (isfirstTime) {
        if (isfirstTime) {
          let mapping = map(res, o => {
            let clinicDate = o.clinicDateDesc ? o.clinicDateDesc.slice(0, 10) : null;
            return {
              value: o.clinicDate,
              label: clinicDate,
              className: "data-value"
            };
          });
          let uniq = uniqBy(mapping, 'label');
          setListDateForSelect(uniq);
          setIsfirstTime(false);
        }
      }
    }
  };
  const getDiagsByClinic = async params => {
    let req = {
      "clinicDate": params?.clinicDate ? dayjs(params.clinicDate, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD") : null,
      "workId": params?.workId || null,
      "patientId": null,
      "clinicId": params?.clinicId || null,
      "doctor": params?.doctor || null
    };
    let res = await GetOpdClinicsReDiags(req);
    let mapping = map(res || [], (o, index) => {
      return {
        ...o,
        key: o.icd + o.diagnosis,
        id: index + o.icd,
        diagnosiss: o.diagnosis,
        type: o.diagType
      };
    });
    setListOldDiag(mapping);
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      const keys = listOldDiag.map(item => item.key);
      setListCheckedOldDiags(keys);
      setListDiagForAdd(listOldDiag);
    } else {
      setListCheckedOldDiags([]);
      setListDiagForAdd([]);
    }
  };

  const handleSingleCheckboxChange = (checked, currentKey) => {
    let newCheckedList;
    let newDiagList;

    if (checked) {
      newCheckedList = [...listCheckedOldDiags, currentKey];
      newDiagList = [...listDiagForAdd, find(listOldDiag, ['key', currentKey])];
    } else {
      newCheckedList = listCheckedOldDiags.filter(key => key !== currentKey);
      newDiagList = listDiagForAdd.filter(diag => diag.key !== currentKey);
    }

    setListCheckedOldDiags(newCheckedList);
    setListDiagForAdd(newDiagList);
    setSelectAllChecked(newCheckedList.length === listOldDiag.length);
  };

  useEffect(() => {
    if (listCheckedOldDiags.length === 0) {
      setSelectAllChecked(false);
    } else {
      setSelectAllChecked(listCheckedOldDiags.length === listOldDiag.length);
    }
  }, [listCheckedOldDiags, listOldDiag.length]);

  const TableOpdClinics = () => {
    const columns = [{
      title: <label className="gx-text-primary"></label>,
      dataIndex: "",
      key: "key",
      width: "40px",
      align: "center",
      render: val => <div style={{
        marginBottom: "-26px",
        marginTop: "-14px"
      }}>
        <Radio.Group value={radioValue}>
          <Radio value={val.clinicId} onClick={e => {
            setRadioValue(e.target.value);
            getDiagsByClinic(val);
          }} />
        </Radio.Group>
      </div>
    }, {
      title: <label className="gx-text-primary">วัน/เวลา</label>,
      dataIndex: "clinicDateDesc",
      key: "key",
      width: "90px",
      render: val => <div style={{
        marginBottom: "-26px",
        marginTop: "-14px"
      }}>
        <label className="data-value">{val}</label>
      </div>
    }, {
      title: <label className="gx-text-primary">แพทย์</label>,
      dataIndex: "",
      key: "key",
      render: val => <div style={{
        marginBottom: "-26px",
        marginTop: "-6px"
      }}>
        <p style={{
          marginBottom: "0px"
        }}>
          <label className="data-value">{val.doctorName}</label>
        </p>
        <p>
          <label className="data-value">{val.workId}</label>
        </p>
      </div>
    }];
    return <Table rowKey="clinicId" scroll={{
      y: 330
    }} columns={columns} dataSource={listOldClinic} pagination={false} className="data-value" />;
  };
  const onCheckOldDiags = (checked, currentKey) => {
    switch (checked) {
      case true:
        setListCheckedOldDiags(prev => [currentKey, ...prev]);
        let findX = find(listOldDiag, ["key", currentKey]);
        setListDiagForAdd(prev => [...prev, findX]);
        break;
      case false:
        let prevKeys = [...listCheckedOldDiags];
        let filterKeys = filter(prevKeys, o => o !== currentKey);
        setListCheckedOldDiags(filterKeys);
        let prevDiagForAdd = [...listDiagForAdd];
        let filterDiags = filter(prevDiagForAdd, o => o.key !== currentKey);
        setListDiagForAdd(filterDiags);
        break;
      default: break;
    }
  };
  const TableOpdDiags = () => {

    const columns = [{
      title: <Checkbox
        indeterminate={listCheckedOldDiags.length > 0 && listCheckedOldDiags.length < listOldDiag.length}
        checked={selectAllChecked}
        onChange={handleSelectAllChange}
      />,
      width: "40px",
      align: "center",
      render: (val, record) => (
        <div style={{ marginBottom: "-22px", marginTop: "-10px" }}>
          <Checkbox
            checked={listCheckedOldDiags.includes(record.key)}
            onChange={e => handleSingleCheckboxChange(e.target.checked, record.key)}
          />
        </div>
      )
    }, {
      title: <label className="gx-text-primary">Diagnosis</label>,
      dataIndex: "diagnosis"
    }, {
      title: <label className="gx-text-primary">ICD10</label>,
      dataIndex: "icd",
      width: 100
    }, {
      title: <label className="gx-text-primary">Type</label>,
      dataIndex: "diagTypeName",
      width: 100
    }];

    return (
      <Table
        scroll={{ y: 330 }}
        columns={columns}
        dataSource={listOldDiag}
        pagination={false}
        rowClassName="data-value"
      />
    );
  };

  const onDeleteDiagsForAdd = currentKey => {
    let prevKeys = [...listCheckedOldDiags];
    let filterKeys = filter(prevKeys, o => o !== currentKey);
    setListCheckedOldDiags(filterKeys);
    let prevDiagForAdd = [...listDiagForAdd];
    let filterDiags = filter(prevDiagForAdd, o => o.key !== currentKey);
    setListDiagForAdd(filterDiags);
  };
  const TableDiagsForAdd = () => {
    const columns = [{
      title: <label className="gx-text-primary">Diagnosis</label>,
      dataIndex: "diagnosis"
    }, {
      title: <label className="gx-text-primary">ICD10</label>,
      dataIndex: "icd",
      width: 100
    }, {
      title: <label className="gx-text-primary">Type</label>,
      dataIndex: "diagTypeName",
      width: 100
    }, {
      title: <label className="gx-text-primary"></label>,
      dataIndex: "key",
      width: 45,
      align: "center",
      render: val => <Button style={{
        margin: 0
      }} size="small" icon={<DeleteOutlined />} danger onClick={() => {
        onDeleteDiagsForAdd(val);
      }} />
    }];
    return <Table scroll={{
      y: 330
    }} columns={columns} dataSource={listDiagForAdd} pagination={false} rowClassName="data-value" />;
  };
  return <ConfigProvider locale={thTH}>
    <Modal width={1200} centered title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>6.1.3 Re-Diagnosis</label>} visible={isVisible} onCancel={() => modalControl("close")} footer={<div className="text-center">
      <Button type="secondary" onClick={() => modalControl("close")}>
        ปิด
      </Button>
      <Button type="primary" disabled={listDiagForAdd.length === 0} onClick={() => {
        afterOk(listDiagForAdd);
        modalControl("close");
      }}>
        ตกลง
      </Button>
    </div>}>
      <div style={{
        margin: -14
      }}>
        <Spin spinning={loading}>
          <Form form={formRedigs} onFinish={onFormReDiagsFinish} layout="vertical"
          // name="rediagnosisForm_modal"
          >
            <Row gutter={[8, 8]} className="mb-4" style={{
              flexDirection: "row",
              marginTop: -10
            }}>
              <Col span={6}>
                <Form.Item name="workId" label={<label className="gx-text-primary fw-bold">ห้องตรวจ</label>}>
                  <Select style={{
                    width: "100%"
                  }} className="data-value" placeholder="ห้องตรวจ" optionFilterProp="label" allowClear showSearch options={listWorkPlace} onChange={() => {
                    formRedigs.submit();
                  }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="doctor" label={<label className="gx-text-primary fw-bold">แพทย์ผู้ตรวจ</label>}>
                  <Select style={{
                    width: "100%"
                  }} className="data-value" allowClear showSearch placeholder="เลือกแพทย์" optionFilterProp="label" options={listDoctorMas} onChange={() => {
                    formRedigs.submit();
                  }}
                  // value={doctorForReDiag}
                  // onChange={(value) => setDoctorForReDiag(value)}
                  />
                </Form.Item>
              </Col>

              <Col span={4} className="text-center">
                <Form.Item shouldUpdate={(prev, cur) => prev.startDate !== cur.startDate}>
                  {() => <Form.Item name="startDate" label={<label className="gx-text-primary fw-bold">วันที่เริ่ม</label>}>
                    <DayjsDatePicker form={formRedigs} name="startDate" placeholder="วันที่เริ่ม" style={{
                      width: "100%"
                    }} format={"DD/MM/YYYY"} onChange={() => {
                      formRedigs.setFieldsValue({
                        clinicDate: null
                      });
                      formRedigs.submit();
                    }} />
                  </Form.Item>}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  // name="endDate"
                  // label={<label className="gx-text-primary fw-bold">วันที่สิ้นสุด</label>}
                  shouldUpdate={(prev, cur) => prev.endDate !== cur.endDate}>
                  {() => <Form.Item name="endDate" label={<label className="gx-text-primary fw-bold">วันที่สิ้นสุด</label>}>
                    <DayjsDatePicker form={formRedigs} name="endDate" placeholder="วันที่สิ้นสุด" onChange={() => {
                      formRedigs.setFieldsValue({
                        clinicDate: null
                      });
                      formRedigs.submit();
                    }} />
                  </Form.Item>}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="clinicDate" label={<label className="gx-text-primary fw-bold">วันที่ตรวจ</label>}>
                  <Select style={{
                    width: "100%"
                  }} className="data-value" showSearch allowClear optionFilterProp="label" options={listDateForSelect} onChange={() => {
                    formRedigs.setFieldsValue({
                      startDate: null,
                      endDate: null
                    });
                    formRedigs.submit();
                  }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div style={{
            height: 390
          }}>
            <Row gutter={[4, 4]} style={{
              marginTop: -28
            }}>
              <Col span={7}>
                <Card>
                  <div style={{
                    margin: -20
                  }}>
                    {TableOpdClinics()}
                  </div>
                </Card>
              </Col>
              <Col span={9}>
                <Card>
                  <div style={{
                    margin: -20
                  }}>
                    {TableOpdDiags()}
                  </div>
                </Card>

              </Col>
              <Col span={8}>
                <Card>
                  <div style={{
                    margin: -20
                  }}>
                    {TableDiagsForAdd()}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Spin>
      </div>
    </Modal>
  </ConfigProvider>;
});
const GetDoctorMas = async () => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDoctorMas`,
    method: "POST"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetOpdClinicsDiagReDiags = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdClinics/GetOpdClinicsDiagReDiags`,
    method: "POST",
    data: {
      requestData: req
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetOpdClinicsReDiags = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdClinics/GetOpdClinicsReDiags`,
    method: "POST",
    data: {
      requestData: req
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetOpdWorkPlaces = async () => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlaces_OPD_Visit`).then(res => {
    return res.data.responseData;
  }).catch(error => console.log(error));
  return res;
};