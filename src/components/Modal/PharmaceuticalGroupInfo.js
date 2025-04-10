import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Modal, Button, Form, Select, Input, message, Spin } from 'antd';
import moment from 'moment';
const {
  Option
} = Select;
const {
  TextArea
} = Input;
export default function ScreeningPharmaceuticalInfo(props) {
  // Api
  // Dropdown
  // [GET] http://203.154.95.149:3321/api/Patients/Get_Upd_Patient_Drug_Allergies/170640
  // ระบุ typedx = 2 ตอนดึง api ได้ typedx = null
  // ดึง typedx มาให้แล้ว ครับ
  // [GET] http://203.154.95.149:3321/api/Patients/GetPatients/951745
  // ขอ field admitId

  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  const [loading, setLoading] = useState(false);
  const [modalloading, setModalLoading] = useState(false);

  // รายการยาที่แพ้
  const [listDrugGroup, setListDrugGroup] = useState([]);
  const getDrugGroupInquiry = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/PharmaceuticalDrug/DrugGroupInquiry`,
      method: "GET"
      // data: { requestData }
    }).then(res => {
      setListDrugGroup(res.data.responseData);
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
      setListLevel(res?.data?.responseData || []);
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
  // // หน่วยงาน
  // const [listWorkPlace, setListWorkPlace] = useState([])
  // const getWorkPlacesMas = async () => {
  //     await axios({
  //         url: `${process.env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMas`,
  //         method: "POST",
  //         // data: { requestData }
  //     })
  //         .then((res) => { setListWorkPlace(res.data.responseData) })
  //         .catch((error) => { return error })
  // }
  // ผู้ป่วยเก่า/ใหม่
  // const [listNewFlag, setListNewFlag] = useState([])
  // const getNewFlag = async () => {
  //     await axios({
  //         url: `${process.env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetNewFlag`,
  //         method: "POST",
  //         // data: { requestData }
  //     })
  //         .then((res) => { setListNewFlag(res.data.responseData) })
  //         .catch((error) => { return error })
  // }
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
  useEffect(() => {
    if (props?.patientId) {
      getDrugGroupInquiry();
      getLevelList();
      getTypedxMas();
      getAllergySymptoms();
      getInformant();
      getHospcodes();
      // getWorkPlacesMas()
      // getNewFlag()
      getPatientsByPatientId(props?.patientId);
    }
  }, [props]);
  // แจ้งเตือน
  const success = (isUpdate = false) => {
    message.success(isUpdate ? 'แก้ไขรายการกลุ่มยาที่แพ้ สำเร็จ' : 'เพิ่มรายการกลุ่มยาที่แพ้ สำเร็จ', 5);
  };
  const error = () => {
    message.error('เพิ่มรายการกลุ่มยาที่แพ้ ไม่สำเร็จ', 5);
  };
  const [form] = Form.useForm();
  const onFinish = values => {
    let req = {
      "requestData": {
        "ptDgAdrId": props?.ptDgAdrId ? props?.ptDgAdrId : null,
        "patientId": patient.patientId,
        "runHn": patient.runHn,
        "yearHn": patient.yearHn,
        "hn": patient.hn,
        "drugGroup": values?.drugGroup ? values?.drugGroup : null,
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
        "mapping1": null,
        "newFlag": null,
        "workId": null
      }
    };

    const InsTbPtDgAdrs = async () => {
      setLoading(true);
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/TbPtDgAdrs/InsTbPtDgAdrs`,
        method: "POST",
        data: req
      }).then(res => {
        if (res.data.isSuccess) {
          success();
          props.handleScreeningPharmaceuticalGroupInfoModal(false);
          props.fetchDrugAllergiesByPatientId(patient.patientId);
        } else {
          error();
        }
      }).catch(error => {
        return error;
      });
      setLoading(false);
    };

    const UpdTbPtDgAdrs = async () => {
      setLoading(true);
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/TbPtDgAdrs/UpdTbPtDgAdrs`,
        method: "PUT",
        data: req
      }).then(res => {
        if (res.data.isSuccess) {
          success(true);
          props.handleScreeningPharmaceuticalGroupInfoModal(false);
          props.fetchDrugAllergiesByPatientId(patient.patientId);
        } else {
          error();
        }
      }).catch(error => {
        return error;
      });
      setLoading(false);
    };

    if (!patient?.patientId) return

    if (props?.ptDgAdrId) return UpdTbPtDgAdrs()

    InsTbPtDgAdrs();
  };

  const GetTbPtDgAdrs = async (patientId, ptDgAdrId) => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/TbPtDgAdrs/GetTbPtDgAdrs/${patientId}, ${ptDgAdrId}`).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    return res;
  };

  const getInitialValues = async (patientId, ptDgAdrId) => {
    setModalLoading(true);
    const res = await GetTbPtDgAdrs(patientId, ptDgAdrId)
    if (res) form.setFieldsValue(res)
    setModalLoading(false);
  };

  useEffect(() => {
    if (props?.patientId && props?.ptDgAdrId) {
      getInitialValues(props?.patientId, props?.ptDgAdrId)
    }
  }, [props?.patientId, props?.ptAdrId]);

  return <Modal title={<label className="gx-text-primary fw-bold fs-5">{props?.ptDgAdrId ? "แก้ไขข้อมูลแพ้กลุ่มยา" : "เพิ่มข้อมูลแพ้กลุ่มยา"}</label>} centered visible={props.screeningPharmaceuticalGroupInfoActive} onCancel={() => props.handleScreeningPharmaceuticalGroupInfoModal(false)} footer={<div className="text-center">
    <Button type="default" onClick={() => props.handleScreeningPharmaceuticalGroupInfoModal(false)} disabled={loading}>ปิด</Button>
    <Button type="primary" onClick={() => form.submit()} disabled={loading}>บันทึก</Button>
  </div>} width={750}>
    <Spin spinning={modalloading}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div className="d-flex flex-row">
          {/* ยาที่แพ้ */}
          <div className="me-3" style={{
            width: "50%"
          }}>
            <Form.Item name="drugGroup" label={<label className="gx-text-primary">ระบุกลุ่มยาที่แพ้</label>} rules={[{
              required: true,
              message: 'กรุณากรอก ระบุยาที่แพ้'
            }]}>
              <Select showSearch placeholder="รหัสยา/ชื่อยา" style={{
                width: '100%'
              }} allowClear={true} optionFilterProp="children">
                {listDrugGroup.map((val, index) => <Option value={val.value} key={index} className="data-value">
                  {val.displayName}
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
                {listLevel?.map((val, index) => <Option value={val.code} key={index} className="data-value">
                  {val.code} {val.name}
                </Option>)}
              </Select>
            </Form.Item>
          </div>
        </div>
        <Form.Item name="otherSymptom" label={<label className="gx-text-primary">รายละเอียดการแพ้กลุ่มยา</label>}>
          <TextArea rows={4} placeholder="รายละเอียดการแพ้กลุ่มยา" />
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