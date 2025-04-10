import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Modal, Form, Input, Row, Col, notification } from 'antd';
export default function UpdateMobile({
  isZhow = false,
  patientId = null,
  afterUpdate = () => { },
  afterClose = () => { }
}) {
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  // console.log('patientId :>> ', patientId);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(isZhow);
  }, [isZhow]);
  const getPatientById = async () => {
    if (patientId) {
      setEditLoading(true);
      await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` + patientId).then(res => {
        let patient = res?.data?.responseData;
        form.setFieldsValue({
          telephone: patient?.telephone || null,
          mobile: patient?.mobile || null
        });
      }).catch(error => {
        return error;
      });
      setEditLoading(false);
    }
  };
  useEffect(() => {
    getPatientById();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);
  const onFinish = async params => {
    setEditLoading(true);
    await Axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/UpdPatients_Phone`,
      method: "PUT",
      data: {
        requestData: {
          patientId: patientId,
          telephone: params?.telephone || null,
          mobile: params?.mobile || null
        }
      }
    }).then(res => {
      setEditLoading(false);
      notificationX(res?.data?.isSuccess, "บันทึกเบอร์โทร");
      if (res?.data?.isSuccess) {
        afterUpdate();
        setIsVisible(false);
      }
    }).catch(() => {
      setEditLoading(false);
    });
  };
  const notificationX = (type, title, ) => {
    notification[type ? "success" : "warning"]({
      message: <label className={type ? "gx-text-primary fw-bold" : "text-danger fw-bold"} style={{
        fontSize: 18
      }}>
        {title}
      </label>,
      description: <label className={type ? "gx-text-primary me-1" : "text-danger me-1"} style={{
        fontSize: 16
      }}>
        {type ? "สำเร็จ" : "ไม่สำเร็จ"}
      </label>,
      duration: 5
    });
  };
  return <Modal
    visible={isVisible}
    confirmLoading={editLoading}
    title={<label className="gx-text-primary fw-bold"
      style={{
        fontSize: 18
      }}>แก้ไขเบอร์โทรติดต่อ</label>}
    width={400}
    onOk={() => {
      form.submit();
    }} onCancel={() => {
      afterClose();
    }}
    okText="บันทึก"
    cancelText="ปิด"
    centered
    okButtonProps={{
      disabled: hosParam?.regTelEdit === "Y"
    }}
  >
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Row gutter={[8, 8]} align='middle' style={{
        flexDirection: "row",
        marginBottom: 8,
        marginTop: -14
      }}>
        <Col span={8} className='text-end'>
          <label className="gx-text-primary fw-bold">เบอร์โทรศัพท์</label>
        </Col>
        <Col span={16}>
          <Form.Item label={false} name="telephone" style={{
            margin: 0
          }}>
            <Input disabled={hosParam?.regTelEdit === "Y"} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[8, 8]} align='middle' style={{
        flexDirection: "row",
        marginBottom: -14
      }}>
        <Col span={8} className='text-end'>
          <label className="gx-text-primary fw-bold">เบอร์มือถือ</label>
        </Col>
        <Col span={16}>
          <Form.Item label={false} name="mobile" style={{
            margin: 0
          }}>
            <Input disabled={hosParam?.regTelEdit === "Y"} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </Modal>;
}