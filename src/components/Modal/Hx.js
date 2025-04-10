import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Row, Col, Button, Modal, Card, Input, Select, Popconfirm, Empty, Spin, notification } from 'antd';
import { differenceBy, map, find, filter } from 'lodash';
import moment from 'moment';
import Scrollbars from 'react-custom-scrollbars';
import Notifications from "../Modal/Notifications";
import { DeleteOutlined } from '@ant-design/icons';
const {
  Option
} = Select;
export default function Hx({
  setModal,
  isVisible = false,
  patientId = null,
  reloadHx = () => { return false }
}) {
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  const [opdUnderlyingDiseases, setOpdUnderlyingDiseases] = useState(null);
  const [opdUnderlyingDiseasesList, setOpdUnderlyingDiseasesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Noti
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [friend, setFriend] = useState(false);
  // Dropdown โรคเฝ้าระวัง
  const [listDropdown, setListDropdown] = useState([]);
  const getDropdown = async () => {
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetUnderlyingDiseases`).then(res => {
      setListDropdown(res?.data?.responseData);
    }).catch(error => {
      console.log(error);
    });
  };
  // ดึงข้อมูลผู้ป่วย
  const [patientDetail, setPatientDetail] = useState({});
  const getPatientDetail = async patientId => {
    setLoading(true);
    if (patientId) {
      await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` + patientId).then(res => {
        setPatientDetail(res?.data?.responseData);
        setOpdUnderlyingDiseases(res?.data?.responseData?.underlyingDisease);
        setOpdUnderlyingDiseasesList(res?.data?.responseData?.underlying_Diseases_Display);
      }).catch(error => {
        console.log(error);
      });
    } else {
      setOpdUnderlyingDiseases(null);
      setOpdUnderlyingDiseasesList([]);
    }
    setLoading(false);
  };
  const notificationX = (type, title,) => {
    notification[type ? 'success' : 'warning']({
      message: <label className={type ? "gx-text-primary fw-bold" : "topic-danger-bold"}>{title}</label>,
      description: <>
        <label className={type ? "gx-text-primary me-1" : "topic-danger me-1"}>{type ? "สำเร็จ" : "ไม่สำเร็จ"}</label>
      </>,
      duration: 5
    });
  };
  // บันทึกโรคเฝ้าระวัง
  const [listForInsert, setListForInsert] = useState([]);

  const insert = async () => {
    setLoading(true);
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/InsListPatients_Underlying_Diseases`,
      method: "POST",
      data: {
        requestData: listForInsert.length === 0 ? [{
          "ptUdId": "0",
          "patientId": patientDetail.patientId,
          "runHn": patientDetail.runHn,
          "yearHn": patientDetail.yearHn,
          "hn": patientDetail.hn,
          "underlyingDisease": opdUnderlyingDiseases,
          "udId": "0",
          "informant": null,
          "informhosp": null,
          "userCreated": null,
          "dateCreated": null,
          "userModified": null,
          "dateModified": null
        }] : listForInsert.map(i => {
          return {
            "ptUdId": "0",
            "patientId": patientDetail.patientId,
            "runHn": patientDetail.runHn,
            "yearHn": patientDetail.yearHn,
            "hn": patientDetail.hn,
            "underlyingDisease": opdUnderlyingDiseases,
            "udId": i.udId,
            "informant": null,
            "informhosp": null,
            "userCreated": user,
            "dateCreated": moment(),
            "userModified": null,
            "dateModified": null
          };
        })
      }
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });

    setLoading(false);
    notificationX(res?.isSuccess, "เพิ่ม/แก้ไขโรคประจำตัว");
    if (res?.isSuccess === true) {
      reloadHx(true);
      getPatientDetail(patientId);
    }
  };
  const delUnderlyingDiseases = () => {
    setLoading(true);
    let difference = differenceBy(patientDetail?.underlying_Diseases_Display, opdUnderlyingDiseasesList, 'ptUdId');
    let mapping = map(difference, 'ptUdId');
    const del = async () => {
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/DelListPatientUnderlyingDiseases`,
        method: "POST",
        data: {
          requestData: mapping
        }
      }).then(res => {
        let isSuccess = res?.data?.isSuccess;
        notificationX(isSuccess, "ลบโรคเฝ้าระวัง");
        if (isSuccess) {
          getPatientDetail(patientId);
        }
      }).catch(error => {
        return error;
      });
    };
    if (difference.length > 0) {
      del();
    }
    setLoading(false);
  };
  // useEffect(() => {},[])
  // เลือกโรคเฝ้าระวัง
  const [opdUnderlyingDiseasesValue, setOpdUnderlyingDiseasesValue] = useState(null);
  const [opdUnderlyingDiseasesObj, setOpdUnderlyingDiseasesObj] = useState({});
  useEffect(() => {
    getPatientDetail(patientId);
    getDropdown();
  }, [patientId]);
  useEffect(() => {
    let list = listDropdown.map(item => {
      let findX = find(opdUnderlyingDiseasesList, o => o.udId === item.datavalue);
      if (findX) {
        return {
          ...item,
          disabled: true
        };
      } else return {
        ...item,
        disabled: false
      };
    });
    setListDropdown(list);
    let filterX = filter(opdUnderlyingDiseasesList, ["isNew", true]);
    setListForInsert(filterX);
  }, [friend, opdUnderlyingDiseasesList]);
  return <div>
    <Modal forceRender title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}> 1.1.7 โรคประจำตัว</label>} centered visible={isVisible} onCancel={() => {
      setModal(false);
    }} footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setModal(false);
      }}>ออก</Button>
      <Button key="save" type="primary"
        onClick={() => {
          insert();
          delUnderlyingDiseases();
        }}>บันทึก</Button>
    </Row>]} width={580}>
      <Spin spinning={loading}>
        <Row gutter={[8, 8]} style={{
          marginTop: -10
        }}>
          <Col span={24}>
            <label className="gx-text-primary fw-bold mb-1">โรคประจำตัว</label>
            <Input.TextArea value={opdUnderlyingDiseases} maxLength={200} onChange={e => {
              setOpdUnderlyingDiseases(e.target.value);
            }}
            />
          </Col>
        </Row>
        <br />
        <Row gutter={[8, 8]}>
          <Col span={22}>
            <label className="gx-text-primary fw-bold mb-1">โรคเฝ้าระวัง</label>
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" value={opdUnderlyingDiseasesValue} onChange={(v, obj) => {
              if (v) {
                setOpdUnderlyingDiseasesValue(v);
                setOpdUnderlyingDiseasesObj(obj.obj);
              } else {
                setOpdUnderlyingDiseasesValue(null);
                setOpdUnderlyingDiseasesObj({});
              }
            }}
            >
              {listDropdown.map((val, index) => <Option value={val.datavalue} key={index} obj={val} disabled={val.disabled}>
                {val.datadisplay}
              </Option>)}
            </Select>
          </Col>
          <Col span={2}>
            <Button style={{
              marginTop: 22
            }} type="primary" onClick={() => {
              let list = opdUnderlyingDiseasesList;
              list.push({
                isNew: true,
                udId: opdUnderlyingDiseasesObj.datavalue,
                name: opdUnderlyingDiseasesObj.datadisplay
              });
              setOpdUnderlyingDiseasesList(list);
              setOpdUnderlyingDiseasesValue(null);
              setOpdUnderlyingDiseasesObj({});
              setFriend(!friend);
            }} disabled={opdUnderlyingDiseasesValue ? false : true}>+</Button>
          </Col>
        </Row>
        <label className="gx-text-primary fw-bold mt-2" style={{
          paddingBottom: 8
        }}>รายการโรคเฝ้าระวัง</label>
        {opdUnderlyingDiseasesList.length > 0 ? <Scrollbars autoHeight autoHeightMin={70} autoHide>
          <Card>
            {opdUnderlyingDiseasesList.map((o, index) => <label key={index} className="rounded border border-1 bg-light p-1 me-1 mb-1">
              <label className="me-2">
                {o.name}
              </label>
              <label>
                <Popconfirm title="ต้องการลบรายการนี้ ？" okText="Yes" onConfirm={() => {
                  let list = filter(opdUnderlyingDiseasesList, i => i.udId !== o.udId);
                  setOpdUnderlyingDiseasesList(list);
                  setFriend(!friend);
                }} cancelText="No">
                  <Button size="small" shape="circle" icon={<DeleteOutlined style={{
                    color: 'red'
                  }} />} style={{
                    margin: 0
                  }} />
                </Popconfirm>
              </label>
            </label>)}
          </Card>
        </Scrollbars> : <div style={{
          border: '1px solid #E1E1E1',
          borderRadius: 5
        }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>}
      </Spin>
      {/* ProcessResult */}
      <Notifications setModal={() => {
        setShowNotificationsModal(false);
        setProcessResult({});
      }} isVisible={showNotificationsModal} response={processResult} title={"ดำเนินการ"} type={"result"} />
    </Modal>
  </div>;
}