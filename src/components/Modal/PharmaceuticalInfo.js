import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Modal, Button, Form, Select, Input, message, Spin } from 'antd';
import moment from 'moment';
import { Get_Upd_Patient_Drug_Allergies, UpdPatients_Drug_Allergies } from '../../routes/AdrRegistration/API/DrugAllergyApi';
const {
  Option
} = Select;
const {
  TextArea
} = Input;
export default function ScreeningPharmaceuticalInfo({ ...props }) {
  // Api
  // Dropdown
  // [GET] http://203.154.95.149:3321/api/Patients/Get_Upd_Patient_Drug_Allergies/170640
  // ระบุ typedx = 2 ตอนดึง api ได้ typedx = null
  // ดึง typedx มาให้แล้ว ครับ
  // [GET] http://203.154.95.149:3321/api/Patients/GetPatients/951745
  // ขอ field admitId

  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  const [modalloading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // รายการยาที่แพ้
  const [listDrugGeneric, setListDrugGeneric] = useState([]);
  const getDrugGenericList = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugAllergies/GetDrugGenericList `,
      method: "GET"
      // data: { requestData }
    }).then(res => {
      setListDrugGeneric(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // ระดับการแพ้
  const [listLevel, setListLevel] = useState([]);
  const getLevelList = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DrugAllergies/GetAllergyLevelsMas`,
      method: "GET"
      // data: { requestData }
    }).then(res => {
      setListLevel(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // การวินิจฉัย
  const [listTypeDx, setListTypeDx] = useState([]);
  const getTypedxMas = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetTypedxMas`,
      method: "POST"
      // data: { requestData }
    }).then(res => {
      setListTypeDx(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // ลักษณะอาการ
  const [listSymptoms, setListSymptoms] = useState([]);
  const getAllergySymptoms = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetAllergySymptoms`,
      method: "POST"
      // data: { requestData }
    }).then(res => {
      setListSymptoms(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // การให้ข้อมูล
  const [listInformant, setListInformant] = useState([]);
  const getInformant = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetInformant`,
      method: "POST"
      // data: { requestData }
    }).then(res => {
      setListInformant(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // โรงพยาบาลที่ให้ข้อมูล
  const [listHosp, setListHosp] = useState([]);
  const getHospcodes = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetHospcodes`,
      method: "GET"
      // data: { requestData }
    }).then(res => {
      setListHosp(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // หน่วยงาน
  const [setListWorkPlace] = useState([]);
  const getWorkPlacesMas = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMas`,
      method: "POST"
      // data: { requestData }
    }).then(res => {
      setListWorkPlace(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // ผู้ป่วยเก่า/ใหม่
  const [, setListNewFlag] = useState([]);
  const getNewFlag = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetNewFlag`,
      method: "POST"
      // data: { requestData }
    }).then(res => {
      setListNewFlag(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  // ดึงข้อมูลผู้ป่วย
  const [patient, setPatient] = useState({});
  const getPatientsByPatientId = async patientId => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsByPatientId/` + patientId,
      method: "GET"
      // data: { requestData }
    }).then(res => {
      setPatient(res.data.responseData[0]);
    }).catch(error => {
      return error;
    });
  };
  const getInitialValues = async ptAdrId => {
    setModalLoading(true);
    let res = await Get_Upd_Patient_Drug_Allergies(ptAdrId);
    form.setFieldsValue(res[0]);
    setModalLoading(false);
  };
  useEffect(() => {
    getDrugGenericList();
    getLevelList();
    getTypedxMas();
    getAllergySymptoms();
    getInformant();
    getHospcodes();
    getWorkPlacesMas();
    getNewFlag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (props?.patientId) {
      getPatientsByPatientId(props?.patientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.patientId]);
  useEffect(() => {
    if (props?.ptAdrId) {
      getInitialValues(props?.ptAdrId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.ptAdrId])

  // แจ้งเตือน
  const success = () => {
    message.success('เพิ่มรายการยาที่แพ้ สำเร็จ', 5);
  };
  const error = () => {
    message.error('เพิ่มรายการยาที่แพ้ ไม่สำเร็จ', 5);
  };
  const [form] = Form.useForm();
  const onFinish = values => {
    values = form.getFieldValue();
    console.log(form.getFieldValue(), "dd");
    let req = {
      "requestData": {
        "ptAdrId": values?.ptAdrId ? values?.ptAdrId : null,
        "patientId": patient.patientId,
        "runHn": patient.runHn,
        "yearHn": patient.yearHn,
        "hn": patient.hn,
        "generic": values?.generic ? values?.generic : null,
        "typedx": values?.typedx ? values?.typedx : null,
        "symptom": values?.symptom ? values?.symptom : null,
        "otherSymptom": values?.otherSymptom ? values?.otherSymptom : null,
        "alevel": values?.alevel ? values?.alevel : null,
        "informuser": null,
        "informant": values?.informant ? values?.informant : null,
        "informhosp": values?.informhosp ? values?.informhosp : null,
        "lockFlag": null,
        "userCreated": user,
        "dateCreated": moment().format("MM/DD/YYYY HH:mm:ss"),
        "userModified": null,
        "dateModified": null,
        "mapping1": null
      }
    };
    const insPatients_Drug_Allergies = async () => {
      setLoading(true);
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/InsPatients_Drug_Allergies`,
        method: "POST",
        data: req
      }).then(res => {
        if (res.data.isSuccess) {
          success();
          props.handleScreeningPharmaceuticalInfoModal(false);
          props.fetchDrugAllergiesByPatientId(patient.patientId);
        } else {
          error();
        }
      }).catch(error => {
        return error;
      });
      setLoading(false);
    };
    const updPatients_Drug_Allergies = async () => {
      setLoading(true);
      let res = await UpdPatients_Drug_Allergies(req);
      if (res?.isSuccess) {
        message.success('แก้ไขรายการยาที่แพ้ สำเร็จ', 5);
        props.handleScreeningPharmaceuticalInfoModal(false);
        props.fetchDrugAllergiesByPatientId(patient.patientId);
      } else {
        message.error('แก้ไขรายการยาที่แพ้ ไม่สำเร็จ', 5);
      }
      setLoading(false);
    };
    if (patient?.patientId) {
      if (values?.ptAdrId) {
        updPatients_Drug_Allergies();
      } else {
        insPatients_Drug_Allergies();
      }
    }
  };
  return <Modal loading={modalloading} title={<label className="gx-text-primary fw-bold fs-5">{props?.initialValues ? "แก้ไขข้อมูลแพ้ยา" : "เพิ่มข้อมูลแพ้ยา"}</label>} centered visible={props.screeningPharmaceuticalInfoActive} onCancel={() => props.handleScreeningPharmaceuticalInfoModal(false)} footer={<div className="text-center">
    <Button type="default" onClick={() => props.handleScreeningPharmaceuticalInfoModal(false)} disabled={loading}>ปิด</Button>
    <Button type="primary" onClick={() => form.submit()} disabled={loading || modalloading}>บันทึก</Button>
  </div>} width={750}>
    <Spin spinning={modalloading}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div className="d-flex flex-row">
          {/* ยาที่แพ้ */}
          <div className="me-3" style={{
            width: "50%"
          }}>
            <Form.Item name="generic" label={<label className="gx-text-primary">ระบุยาที่แพ้</label>} rules={[{
              required: true,
              message: 'กรุณากรอก ระบุยาที่แพ้'
            }]}>
              <Select showSearch placeholder="รหัสยา/ชื่อยา" style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children">
                {listDrugGeneric.map((val, index) => <Option value={val.code} key={index} className="data-value">
                  {val.dataDisplay}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
          {/* ระดับความรุนแรง */}
          <div style={{
            width: "50%"
          }}>
            <Form.Item name="alevel" label={<label className="gx-text-primary">ระดับความรุนแรง</label>} rules={[{
              required: true,
              message: 'กรุณากรอก ระดับความรุนแรง'
            }]}>
              <Select showSearch placeholder="ระดับความรุนแรง" style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children">
                {listLevel.map((val, index) => <Option value={val.code} key={index} className="data-value">
                  {val.code} {val.name}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
        </div>
        <Form.Item name="otherSymptom" label={<label className="gx-text-primary">รายละเอียดการแพ้ยา</label>}>
          <TextArea rows={4} placeholder="รายละเอียดการแพ้ยา" />
        </Form.Item>
        <div className="d-flex flex-row">
          <div className="me-3" style={{
            width: "50%"
          }}>
            <Form.Item name="typedx" label={<label className="gx-text-primary">การวินิจฉัย</label>} rules={[{
              required: true,
              message: 'กรุณากรอก การวินิจฉัย'
            }]}>
              <Select showSearch style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children" placeholder="การวินิจฉัย">
                {listTypeDx.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                  {val.datavalue} {val.datadisplay}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
          <div style={{
            width: "50%"
          }}>
            <Form.Item name="symptom" label={<label className="gx-text-primary">ลักษณะอาการ</label>}>
              <Select showSearch style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children" placeholder="ลักษณะอาการ">
                {listSymptoms.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                  {val.datavalue} {val.datadisplay}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="d-flex flex-row">
          <div className="me-3" style={{
            width: "50%"
          }}>
            <Form.Item name="informant" label={<label className="gx-text-primary">การให้ข้อมูล</label>}>
              <Select showSearch style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children" placeholder="การให้ข้อมูล">
                {listInformant.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                  {val.datadisplay}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
          <div style={{
            width: "50%"
          }}>
            <Form.Item name="informhosp" label={<label className="gx-text-primary">โรงพยาบาลที่ให้ข้อมูล</label>}>
              <Select showSearch style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children" placeholder="โรงพยาบาล">
                {listHosp.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                  {val.datavalue} {val.datadisplay}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
        </div>
      </Form>
    </Spin>
  </Modal>;
}