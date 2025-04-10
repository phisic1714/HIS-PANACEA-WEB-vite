import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Button, Table, Modal, Radio } from 'antd';
import Column from 'antd/lib/table/Column';
import moment from 'moment';
import 'moment/locale/th';
import { useSelector } from "react-redux";
import { isEmpty } from 'lodash';

//สิทธิ์การรักษา -> หลังเลือกผู้ป่วย ( ส่ง PatientId )
export default function SelectOpdRight({
  getSelectOpdRight,
  ...props
}) {
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const date = moment().add(543, 'years').locale("th").format('DD MMMM YYYY');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [opdRight, setOpdRight] = useState([]);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [selectOpdRight, setSelectOpdRight] = useState({});

  //Api
  const getOpdRightFinancesDrug = async serviceId => {
    setLoading(true);
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetopdRightFinancesDrug/${serviceId}`).then(res => {
      let resData = res.data.responseData;
      if (resData.length > 0) {
        if (resData.length === 1) {
          getSelectOpdRight(resData[0]);
          setIsVisible(false);
        }
        if (resData.length > 1) {
          setIsVisible(true);
          setOpdRight(resData.map((val, index) => {
            return {
              ...val,
              key: index
            };
          }));
        }
      }
    }).catch(error => {
      return error;
    });
    setLoading(false);
  };
  useEffect(() => {
    setPageCurrent(1);
    if (opdPatientDetail && (props.page === "7.5" || props.page === "9.6" || props.page === "14.2")) {
      getOpdRightFinancesDrug(opdPatientDetail.serviceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opdPatientDetail, props.page]);
  return <Modal title={<strong><label className="gx-text-primary">เลือกสิทธิ์ผู้ป่วยนอก</label></strong>} visible={isVisible} onCancel={() => {
    setIsVisible(false);
  }} footer={[<Row justify="center" key="footer">
    <Button key="exit" onClick={() => {
      setIsVisible(false);
    }}>ออก</Button>
    <Button key="ok" type="primary" disabled={isEmpty(selectOpdRight)} onClick={() => {
      getSelectOpdRight(selectOpdRight);
      setIsVisible(false);
    }}>ตกลง</Button>
  </Row>]} width={1000}>
    <Row style={{
      margin: 0
    }}>
      <label className="gx-text-primary">วันที่ <span style={{
        color: "black"
      }}>{date}</span></label>
    </Row>
    <Table style={{
      marginTop: 24
    }} dataSource={opdRight} loading={loading} pagination={{
      current: pageCurrent,
      pageSize: 5,
      showSizeChanger: false,
      showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`
    }} onChange={n => {
      setPageCurrent(n.current);
    }}>
      <Column title={<label className="gx-text-primary"><b>เลือก</b></label>} align="center" dataIndex={props.right === "IpdRight" ? "admitRightId" : props.right === "OpdRight" && "opdRightId"} render={record => {
        return <Radio.Group value={selectOpdRight?.opdRightId} onChange={() => {
          // console.log(record);
          setSelectOpdRight(record);
        }}>
          <Radio value={record?.opdRightId} />
        </Radio.Group>;
      }} />
      <Column title={<label className="gx-text-primary"><b>วันที่ใช้สิทธิ์</b></label>} dataIndex="serviceDate" />
      <Column title={<label className="gx-text-primary"><b>สิทธิ์การรักษา</b></label>} dataIndex="rightName" />
      <Column title={<label className="gx-text-primary"><b>จำนวนเงิน</b></label>} dataIndex="amount" render={record => {
        return <>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</>;
      }} />
      <Column title={<label className="gx-text-primary"><b>เครดิต</b></label>} dataIndex="credit" render={record => {
        return <>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</>;
      }} />
      <Column title={<label className="gx-text-primary"><b>เบิกได้</b></label>} dataIndex="reminburse" render={record => {
        return <>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</>;
      }} />
      <Column title={<label className="gx-text-primary" /* style={{color: "red"}} */><b>เบิกไม่ได้</b></label>} dataIndex="copay" render={record => {
        return <label /* style={{color: "red"}} */>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</label>;
      }} />
      <Column title={<label className="gx-text-primary" /* style={{color: "red"}} */><b>ส่วนลด</b></label>} dataIndex="discount" render={record => {
        return <label /* style={{color: "red"}} */>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</label>;
      }} />
      <Column title={<label className="gx-text-primary"><b>ชำระ</b></label>} dataIndex="payment" render={record => {
        return <>{Intl.NumberFormat('en', {
          minimumFractionDigits: 2
        }).format(record)}</>;
      }} />
    </Table>
  </Modal>;
}