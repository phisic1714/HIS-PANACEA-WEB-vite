import { env } from '../../env.js';

import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Input, Col, Row, Spin, Table, Avatar, Image } from "antd";
import axios from "axios";
import moment from "moment";
import DatepickerWithForm from "../DatePicker/DatePickerWithForm";
import { momentTH, momentEN } from "../helper/convertMoment";
export default function AuditLog({
  isZhow = false,
  handleClose = () => { }
}) {
  // const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  // const user = userFromSession.responseData.userId;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const GetData = async req => {
    setLoading(true);
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetEditLog`,
      method: "POST",
      data: {
        requestData: req
      }
    }).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    setData(res);
    setLoading(false);
  };
  const onFinish = v => {
    console.log("onFinish", v);
    GetData({
      code: v?.code || null,
      name: v?.name || null,
      date: v?.date ? moment(v.date).format("BBBB-MM-DD") : null,
      startRow: 0,
      endRow: 10000000
    });
  };
  useEffect(() => {
    if (isZhow) {
      momentTH();
      GetData({
        code: null,
        name: null,
        date: null,
        startRow: 0,
        endRow: 10000000
      });
    }
    return () => momentEN();
  }, [isZhow]);
  /* const notificationX = (type, title, text) => {
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
  }; */
  return <Modal centered visible={isZhow} width={1100} onOk={() => { }} onCancel={()=> {
    handleClose();
  }} title={<Form form={form} onFinish={onFinish} layout="vertical">
    <Row gutter={[8, 8]} align="middle" style={{
      flexDirection: "row"
    }}>
      <Col span={6}>
        <label className="gx-text-primary fw-bold" style={{
          fontSize: 18
        }}>
          24.7.5 การแก้ไขรหัส
        </label>
      </Col>
      <Col>
        <Form.Item name="date" noStyle>
          <DatepickerWithForm form={form} name="date" format="DD/MM/YYYY" onChange={() => form.submit()} disabled={loading} />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item name="name" noStyle>
          <Input.Search style={{
            width: 222,
            marginTop: 0,
            marginBottom: 0
          }} placeholder="ค้นหา User" allowClear
            // value={wordForSearch}
            onChange={e => {
              if (!e.target.value) {
                form.submit();
              }
            }} onSearch={() => form.submit()} disabled={loading} />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item name="code" noStyle>
          <Input.Search style={{
            width: 222,
            marginTop: 0,
            marginBottom: 0
          }} placeholder="ค้นหารหัส" allowClear onChange={e => {
            if (!e.target.value) {
              form.submit();
            }
          }} onSearch={() => form.submit()} disabled={loading} />
        </Form.Item>
      </Col>
    </Row>
  </Form>} footer={<div className="text-center">
    <Button onClick={e => {
      e.stopPropagation();
      handleClose();
    }}>
      ปิด
    </Button>
    {/* <Button type="primary" onClick={() => {}}>
            บันทึก
           </Button> */}
  </div>}>
    <div style={{
      margin: -20,
      height: 485
    }}>
      <Spin spinning={loading}>
        <Table scroll={{
          y: 385
        }} columns={columns} dataSource={data} rowKey="userId" rowClassName="data-value" pagination={{
          pageSize: 100,
          showSizeChanger: false
        }} />
      </Spin>
    </div>
  </Modal>;
}
const columns = [{
  title: "User",
  dataIndex: "",
  render: v => <Row gutter={[4, 4]} align="middle">
    <Col span={7}>
      {v?.picture ? <Avatar size={40} src={<Image src={`data:image/jpeg;base64,${v?.picture}`} />} /> : <Avatar size={40}>Patient</Avatar>}
    </Col>
    <Col span={17}>{v?.userNameDisplay || v?.userId}</Col>
  </Row>
}, {
  title: "รหัสที่แก้ไข",
  dataIndex: "tableName"
}, {
  title: "การแก้ไข",
  dataIndex: "columnName",
  width: 125
}, {
  title: "ข้อมูลก่อนการแก้ไข",
  dataIndex: "oldData"
}, {
  title: "ข้อมูลหลังแก้ไข",
  dataIndex: "newData"
}, {
  title: "วันที่แก้ไข",
  dataIndex: "dateModified",
  width: 135,
  align: "center"
}];