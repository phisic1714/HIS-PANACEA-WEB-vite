import { env } from '../../env.js';
import React, { useEffect, useState } from "react";
import { Modal, Button, Card, Avatar, Table, Image, Row, Col } from "antd";
import axios from "axios";
import moment from "moment";
export default function PatientInfoHistory({
  closeModalPatientDetailEdit,
  showModalPatientDetailEdit,
  patientId
}) {
  const [patientDetailEditDisplayCard, setpatientDetailEditDisplayCard] = useState(null);
  const [patientDetailEditDisplayTable, setpatientDetailEditDisplayTable] = useState([]);
  useEffect(() => {
    if (patientId && showModalPatientDetailEdit) {
      fetchHistoryUpdPatient(patientId);
    }
  }, [patientId, showModalPatientDetailEdit]);
  const fetchHistoryUpdPatient = async patientId => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetHistoryUpdPatient/` + patientId).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    // console.log(res);
    setpatientDetailEditDisplayCard({
      picture: res.picture,
      pname: res.pname,
      hn: res.hn,
      userModified: res.userModified,
      dateModified: res.dateModified,
      dateModifiedTime: res.dateModifiedTime ? moment(res.dateModifiedTime, "HH:mm:ss").format("HH:mm") : null
    });
    setpatientDetailEditDisplayTable(res?.patientLogDisplay);
  };
  const TablePatientDetailEdit = () => {
    const dataSource = patientDetailEditDisplayTable?.map((val, index) => {
      return {
        ...val,
        key: index,
        dateUpdatedTime: val.dateUpdatedTime ? moment(val.dateUpdatedTime, "HH:mm:ss").format("HH:mm") : null
      };
    });
    const columns = [{
      title: <label className="gx-text-primary">การแก้ไข</label>,
      dataIndex: "logField",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ข้อมูลเดิม</label>,
      dataIndex: "oldData",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ข้อมูลที่แก้ไข</label>,
      dataIndex: "newData",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">วันที่แก้ไข</label>,
      // dataIndex: "dateUpdated",
      key: "key",
      align: "center",
      render: val => <label className="data-value">{val.dateUpdated} {val.dateUpdatedTime}</label>
    }, {
      title: <label className="gx-text-primary">ผู้แก้ไข</label>,
      dataIndex: "userUpdated",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }];
    return <Table scroll={{
      y: 300
    }} columns={columns} dataSource={dataSource} pagination={false} />;
  };
  // console.log(patientDetailEditDisplayCard);
  return <>
    <Modal name="PatientDetailEdit" title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>
      รายละเอียดการแก้ไขข้อมูลผู้ป่วย
    </label>} centered visible={showModalPatientDetailEdit} onCancel={closeModalPatientDetailEdit} footer={<div className="text-center">
      <Button onClick={closeModalPatientDetailEdit}>
        ปิด
      </Button>
    </div>} width={900}>
      <div style={{
        marginTop: -18
      }}>
        <Card style={{
          backgroundColor: "#F5F5F5"
        }} bordered={false}>
          <Row gutter={[8, 8]} align="middle" style={{
            marginTop: -18,
            marginBottom: -18
          }}>
            <Col span={3} className='text-center'>
              {patientDetailEditDisplayCard?.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${patientDetailEditDisplayCard?.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
            </Col>
            <Col span={21}>
              <Row gutter={[8, 8]} align="middle">
                <Col span={11}>
                  <label className="gx-text-primary fw-bold" style={{
                    fontSize: 18
                  }}>{patientDetailEditDisplayCard?.pname || "ชื่อ :"}</label>
                </Col>
                <Col span={8}>
                  <label className="gx-text-primary fw-bold">ผู้แก้ไขล่าสุด</label>
                </Col>
                <Col span={5}>
                  <label className="gx-text-primary fw-bold">วันที่แก้ไขล่าสุด</label>
                </Col>
              </Row>
              <Row gutter={[8, 8]} align="middle">
                <Col span={11}>
                  <label className="gx-text-primary fw-bold" style={{
                    fontSize: 18
                  }}>HN : {patientDetailEditDisplayCard?.hn}</label>
                </Col>
                <Col span={8}>
                  <label className="data-value">
                    {patientDetailEditDisplayCard?.userModified}
                  </label>
                </Col>
                <Col span={5}>
                  <label className="data-value">
                    {patientDetailEditDisplayCard?.dateModified} {patientDetailEditDisplayCard?.dateModifiedTime}
                  </label>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <div style={{
          marginTop: -24
        }}>
          {TablePatientDetailEdit()}
        </div>
      </div>
    </Modal>
  </>;
}