import { env } from '../../env.js';
import { Avatar, Button, Col, Image, Modal, Row, Table, Spin, Card } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';
import '../../routes/OpdClinic/Styles/Appointment.less';
import { nanoid } from 'nanoid';
import {map ,sumBy} from 'lodash';
import { PrintFormReport } from '../qzTray/PrintFormReport';
import { getDateCalculatExpenses as getExpenseRate } from "components/helper/GetDateCalculatExpenses";

const CustomModal = styled(Modal)`
  .ant-modal-content{

  }
  .ant-modal-header{
    padding:5px 5px;
  }
  .ant-card{
      margin:0px
  }
  .ant-modal-body{
      padding:12px;
  }
  `;
export default function EditAppointmentDesc({
  visible,
  onCancel,
  appointId
},) {
  //AppointDetail
  const [appointDetail, setAppointDetail] = useState(null);
  //loading
  const [loading, setLoading] = useState(false);
  //activity
  const [appointActivity, setAppointActivity] = useState([]);
  // Get Appoint Detail 
  const GetAppointDetail = async id => {
    setLoading(true);
    // let final = [];
    let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetAppointDetail/${id}`, {
      method: "POST"
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess) {
      setAppointDetail(res.responseData);
      if (res.responseData.appointActivities.length > 0) {
        const data = res.responseData.appointActivities
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
            const quantity = Number(o?.quantity || "0")
            rate = rate ? Number(rate) : 0;
            credit = credit ? Number(credit) * quantity : 0
            credit = credit > rate ? rate : credit;
            cashReturn = cashReturn ? Number(cashReturn) * quantity : "0";
            cashNotReturn = cashNotReturn ? Number(cashNotReturn) * quantity : "0";
            const amount = Number(rate) * quantity;
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
          // console.log("promises =>", result);
          setAppointActivity(result);
          setLoading(false);
          return
        });
      } else {
        setAppointActivity([]);
      }
    } else {
      // console.log("error_code", res.errorCode, "error_message", res.errorMessage);
    }
    setLoading(false);
  };
  const TableAppoint = () => {
    const columns = [
      {
        title: <label>รายการ</label>,
        dataIndex: "activityDesc"
      },
      {
        title: <label>ICD10</label>,
        dataIndex: "icd"
      },
      {
        title: <label>ราคา/หน่วย</label>,
        dataIndex: "price"
      },
      {
        title: <label>จำนวน</label>,
        dataIndex: "quantity"
      },
      {
        title: <label>จำนวนเงิน</label>,
        dataIndex: "amount"
      },
      {
        title: <label>เบิกได้</label>,
        dataIndex: "cashReturn"
      },
      {
        title: <label style={{ color: "red" }}>เบิกไม่ได้</label>,
        dataIndex: "cashNotReturn"
      }
    ]
    return (
      <div>
        <Table
          size='small'
          scroll={{ y: 221 }}
          columns={columns}
          dataSource={appointActivity.length > 0 ? appointActivity : []}
        />
      </div>
    )
  }
  useEffect(() => {
    if (appointId && visible) {
      GetAppointDetail(appointId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, appointId]);
  return <div>
    <CustomModal visible={visible} onCancel={() => {
      onCancel();
      setAppointDetail(null);
    }} closable={false} title={<Row align="middle">
      <Col span={20}>
        <div className="text-start">
          <label className="gx-text-primary" style={{
            fontSize: "18px", padding: 10
          }}>รายละเอียดการนัด</label>
        </div>
      </Col>
      <Col span={4}>
        <div className="text-end">
          <PrintFormReport param={{
            appointid: appointId,
            hn: appointDetail?.hn
          }} />
        </div>
      </Col>
    </Row>} footer={<div className="text-center">
      {appointDetail?.appointStatus ? appointDetail && <Button type="secondary" style={{
        width: "100px"
      }} onClick={() => {
        onCancel();
        setAppointDetail(null);
      }}>ออก</Button> : appointDetail && <>
        <Button type="secondary" style={{
          width: "100px"
        }} onClick={() => {
          onCancel();
          setAppointDetail(null);
        }}>ออก</Button>
      </>}
    </div>} width={1000}>

      <div>
        <Spin spinning={loading}>
          <Card>
            <Row gutter={[8, 8]}>
              <Col span={3}>
                {appointDetail?.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${appointDetail.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
              </Col>

              <Col span={6}>
                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>ชื่อ : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{appointDetail?.displayName}</label><br />

                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>HN : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{appointDetail?.hn}</label>
              </Col>

              <Col span={9}>
                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>แพทย์ผู้นัดตรวจ : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{appointDetail?.doctorName}</label><br />

                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>ห้องตวจ : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>{appointDetail?.workName}</label>
              </Col>

              <Col span={6}>
                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>วันที่นัด : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>
                  {/* {`${moment(appointDetail?.appointDate).format("DD/MM/YYYY") === "Invalid date" ? [] : moment(appointDetail?.appointDate).format("DD/MM/YYYY")}`} */}
                  {
                    appointDetail?.appointDate ? dayjs(appointDetail.appointDate, "MM/DD/YYYY").format("DD/MM/BBBB") : "-"
                  }
                </label><br />

                <label className="gx-text-primary fw-bold" style={{ fontSize: "17px" }}>เวลา : </label>
                <label className="fw-bold ms-2" style={{ fontSize: "14px" }}>
                  {`${moment(appointDetail?.startTime).format("HH:mm")} - ${moment(appointDetail?.endTime).format("HH:mm")}`}
                </label>
              </Col>
            </Row>
          </Card>

          <Row>
            <Col span={24}>
              <label className="gx-text-primary fw-bold" style={{ fontSize: "16px", padding: 10, marginTop: 15 }}>
                กิจกรรมก่อนพบแพทย์
              </label>
              {TableAppoint()}

              <Card>
                <Row gutter={[8, 8]} >
                  <Col span={4}>
                    <label className="gx-text-primary fw-bold">หน่วยงานที่นัด</label>
                    <br />
                    <label className="topic">{appointDetail?.workName || "-"}</label>
                  </Col>

                  <Col span={4}>
                    <label className="gx-text-primary fw-bold">ผู้บันทึก</label>
                    <br />
                    <label className="topic">{appointDetail?.userCreated || "-"}</label>
                    <br />
                    <label> {appointDetail?.dateCreated ? dayjs(appointDetail.dateCreated, "MM/DD/YYYY").format("DD/MM/BBBB") : "-"}</label>

                  </Col>

                  <Col span={4}>
                    <label className='gx-text-primary fw-bold'>ผู้แก้ไข</label>
                    <br />
                    <label className='gx-text-primary-bold'>{appointDetail?.userModified || "-"}</label>
                    <br />
                    <label> {appointDetail?.dateModified ? dayjs(appointDetail.dateModified, "MM/DD/YYYY").format("DD/MM/BBBB") : "-"}</label>
                  </Col>

                  <Col span={4}>
                    <label className='gx-text-primary fw-bold' >จำนวนเงินรวม</label>
                    <br />
                    <label>{sumBy(appointActivity, "amount")}</label>
                  </Col>

                  <Col span={4}>
                    <label className='gx-text-primary fw-bold'>เบิกได้</label>
                    <br />
                    <label>{sumBy(appointActivity, "cashReturn")}</label>
                  </Col>

                  <Col span={4}>
                    <label style={{ color: "red" }} className='fw-bold'>เบิกไม่ได้</label>
                    <br />
                    <label>{sumBy(appointActivity, "cashNotReturn")}</label>
                  </Col>

                </Row>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </CustomModal>
  </div>;
}