import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Row, Col, Button, Modal, Avatar, Image, Table, Spin, Card } from 'antd';
import { nanoid } from 'nanoid';
import {map} from 'lodash';
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";
// เรียกใช้
// const [activityAppointVisible, setActivityAppointVisible] = useState(false)
/* <ActivityAppoint
    isVisible={activityAppointVisible}
    setModal={(isVisible) => setActivityAppointVisible(isVisible)}
    patientId={patientId}
    appointId={appointId}
 /> */
export default function ActivityAppoint({
  setModal,
  isVisible = false,
  patientId = null,
  appointId = null
}) {
  const [loading, setLoading] = useState(false);
  const [patientDetail, setPatientDetail] = useState({});
  const [activityAppointList, setActivityAppointList] = useState([]);

  const fetchActivityAppoints = async () => {
    setLoading(true);
    if (patientId && appointId) {
      let req = `${patientId}, ${appointId}`;
      let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/GetActivityAppoint/` + req).then(res => {
        return res.data.responseData;
      }).catch(error => {
        return error;
      });
      setPatientDetail(res);

      const data = await res.activityAppointList.map((item) => {
        return {
          key: nanoid(),
          ...item,
          quantity: +item.quantity,
          name: item.activityDesc
        };
      });

      const promises = map(data, o => {
        return getExpenseRate({
          expenseId: o.expenseId,
          rightId: res?.responseData?.rightId || "x000000"
        }).then(value => {
          let {
            rate = null,
            credit = "0",
            cashReturn = "0",
            cashNotReturn = "0",
            // minRate = null,
            // maxRate = null
          } = value;
          // const rateByUser = minRate ? "YES" : "NO";
          const quantity = Number(o?.quantity || "1")
          rate = rate ? Number(rate) : 0;
          credit = credit ? Number(credit) * quantity : 0
          credit = credit > rate ? rate : credit;
          cashReturn = cashReturn ? Number(cashReturn) * quantity : "0";
          cashNotReturn = cashNotReturn ? Number(cashNotReturn) * quantity : "0";
          const amount = rate * quantity;
          return {
            ...o,
            key: nanoid(),
            quantity: quantity,
            code: o.code,
            price: rate,
            amount: amount,
            credit: credit,
            cashReturn: cashReturn,
            cashNotReturn: cashNotReturn,
          };
        });
      });
      return Promise.all(promises).then(result => {

        setActivityAppointList(result);
        setLoading(false);
        return
      });
    } else {
      setPatientDetail({});
      setActivityAppointList([]);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchActivityAppoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, appointId]);

  const TableActivityAppoints = () => {
    const dataSource = activityAppointList.map((o, index) => {
      return {
        ...o,
        key: index,
        icd10: o.code,
      };
    });
    const columns = [{
      title: <label className="topic-green">รายการ</label>,
      dataIndex: "name",
      render: val => <label className="data-value pointer">{val}</label>
    }, {
      title: <label className="gx-text-primary">ICD10</label>,
      dataIndex: "icd10",
      render: val => <label className="data-value pointer">{val}</label>
    }, {
      title: <label className="gx-text-primary">ราคา/หน่วย</label>,
      dataIndex: "price",
      render: val => <label className="data-value pointer">{val}</label>
    },
    {
      title: <label className="gx-text-primary">จำนวน</label>,
      dataIndex: "quantity",
      render: val => <label className="data-value pointer">{val}</label>
    },
    {
      title: <label className="gx-text-primary">จำนวนเงิน</label>,
      dataIndex: "amount",
      render: val => <label className="data-value pointer">{val}</label>
    },
    {
      title: <label className="gx-text-primary">เครดิต</label>,
      dataIndex: "credit",
      render: val => <label className="data-value pointer">{val}</label>
    }, {
      title: <label className="gx-text-primary">เบิกได้</label>,
      dataIndex: "cashReturn",
      render: val => <label className="data-value pointer">{val}</label>
    }, {
      title: <label className="gx-text-primary">เบิกไม่ได้</label>,
      dataIndex: "cashNotReturn",
      // render: (val) => <label className="data-value pointer">{val}</label>
    }];

    return <Table
      size='small'
      scroll={{ y: 245 }}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      rowKey={"appActId"}
      rowClassName={"data-value"}
    />
  };
  return <div>
    <Modal title={<label className="topic-green-bold"> รายละเอียดการนัดหมาย </label>} centered visible={isVisible} onCancel={() => {
      setModal(false);
    }} footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setModal(false);
      }}>ออก</Button>
    </Row>]} width={900}>

      <Spin spinning={loading}>
        <Card>
          <Row gutter={[8, 8]}>
            <Col span={3}>
              {patientDetail.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${patientDetail.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
            </Col>

            <Col span={6}>
              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>ชื่อ : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{patientDetail.patientName}</label><br />

              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>HN : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{patientDetail?.hn}</label>
            </Col>

            <Col span={9}>
              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>แพทย์ผู้นัดตรวจ : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{patientDetail?.doctorName}</label><br />

              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>ห้องตวจ : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{patientDetail?.workName}</label>
            </Col>

            <Col span={6}>
              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>วันที่นัด : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>
                <label className="data-value">{patientDetail.appointDate}</label>
              </label><br />

              <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>เวลา : </label>
              <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>
                <label className="data-value">{patientDetail.startEndTime}</label>
              </label>
            </Col>

          </Row>
        </Card>

        <Row>
          <Col span={24}>
            <label className="topic-green-bold">
              กิจกรรมก่อนพบแพทย์
            </label>
            <div style={{ marginTop: 10 }}>
              {TableActivityAppoints()}

            </div>
          </Col>
        </Row>
      </Spin>
    </Modal>
  </div>;
}