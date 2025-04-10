import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import { Table, Modal, Row, Col, Avatar, Image, Button } from 'antd';
import axios from "axios";
import { uniqBy } from "lodash";
// import moment from "moment";
// import dayjs from 'dayjs';
export default function AppiontTable({
  useDayjs = false,
  ...props
}) {
  const columns = [{
    title: <label className="gx-text-primary">วันที่นัด</label>,
    dataIndex: "appointDate",
    align: "center",
    width: 100,
    // render: val => <label className="data-value pointer">
    //   {useDayjs ? dayjs(val, "DD/MM/YYYY").format("DD/MM/BBBB") || '-' : moment(val, "DD/MM/YYYY").format("DD/MM/YYYY") || '-'}
    // </label>
  }, {
    title: <label className="gx-text-primary">เวลา</label>,
    align: "center",
    width: 110,
    render: val => <label>
      {val.startEndTime ? val.startEndTime : val.appointTime ? val.appointTime : val.startTimeDesc + " - " + val.endTimeDesc}
    </label>
  }, {
    title: <label className="gx-text-primary">ห้องตรวจ</label>,
    render: val => <label>{val?.ward || val?.wordName || val?.workName}</label>
  }, {
    title: <label className="gx-text-primary">ก่อนพบแพทย์/วัน</label>,
    dataIndex: "appointDateDiff",
    align: "center",
    width: 120,
  }, {
    title: <label className="gx-text-primary">แพทย์</label>,
    dataIndex: "doctorName",
  }, {
    title: <label className="gx-text-primary" >สถานะ</label>,
    dataIndex: "statusName",
  }];
  const isDataEmpty = !props?.dataSource || props?.dataSource.length === 0;

  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      pagination={false}
      scroll={{ y: 375, x: 1000 }}
      rowKey="appointId"
      locale={{
        emptyText: isDataEmpty ? (
          <div className="text-center" style={{ padding: '24px 0' }}>
            <label style={{ color: "#BDBDBD" }}>ไม่มีข้อมูลนัดหมาย</label>
          </div>
        ) : undefined
      }}
      rowClassName="data-value pointer"
      {...props}
    />
  );
}
const GetAppointDetail = async id => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetAppointHistoryActivityDetail/` + id).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const avatarStyle = {
  boxShadow: "0px 4px 2px 0px #ECEFF1"
};
export function AppiontModal({
  appointId,
  listFinance,
  onClickClose,
  onClickCopy = () => { },
  hiddenCopy = true,
  ...props
}) {
  const [appointDetail, setAppointDetail] = useState({});
  // console.log(appointDetail);
  const [appointDetailLoading, setAppointDetailLoading] = useState(false);
  const getAppointDetail = async () => {
    // console.log('getAppointDetail :>> ', appointId);
    if (appointId) {
      setAppointDetailLoading(true);
      let res = await GetAppointDetail(appointId);
      res.activitiesInfo = res.activitiesInfo.filter(o => !o.financeId); //กรองตัวที่ยังไม่ออกค่าใช้จ่าย
      res.activitiesInfo = uniqBy(res.activitiesInfo, "activityId"); //กรองตัวที่ activityId ซ้ำกันออก
      setAppointDetail(res);
      setAppointDetailLoading(false);
    } else {
      setAppointDetail({});
    }
  };
  console.log('appointDetail :>> ', appointDetail);
  const activityColumns = [{
    title: <label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>กิจกรรมก่อนพบแพทย์</label>,
    width: "60%",
    render: record => {
      if (listFinance) {
        let findSelected = listFinance?.find(f => f.appActId === record.appActId);
        return <Row gutter={[8, 8]}>
          <Col span={3}>
            <label className="data-value" style={findSelected ? {
              color: "#9E9E9E"
            } : {
              color: ""
            }}>{record.financetype}</label>
          </Col>
          <Col span={21}>
            <label className="data-value" style={findSelected ? {
              color: "#9E9E9E"
            } : {
              color: ""
            }}>{record.actName}</label>
          </Col>
        </Row>;
      } else {
        return <Row gutter={[8, 8]}>
          <Col span={3}>
            <label className="data-value">{record.financetype}
            </label>
          </Col>
          <Col span={21}>
            <label className="data-value">{record.actName}</label>
          </Col>
        </Row>;
      }
    }
  }, {
    title: <label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>รายละเอียดกิจกรรม</label>,
    render: (v, r,) => {
      return <>
        {r.activitiesInfoDetail.map((o, i) => <Row key={i} gutter={[8, 8]}>
          <Col span={24}>
            <label className='data-value'>
              - {o.detailDesc}
            </label>
          </Col>
        </Row>)}
      </>;
    }
  }];
  useEffect(() => {
    getAppointDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointId, props?.visible]);
  return <Modal title={<label className="gx-text-primary fw-bold" style={{
    fontSize: 18
  }}>รายละเอียดการนัดหมาย</label>} centered footer={false} width={920} {...props}>
    {appointDetail !== null && <div className="ps-3 pe-3" style={{
      marginBottom: -18
    }}>
      <Row gutter={[8, 8]} className="mb-2">
        <Col span={3}>
          {appointDetail?.picture !== null ? <Avatar size={68} src={<Image src={`data:image/jpeg;base64,${appointDetail?.picture}`} />} style={avatarStyle} /> : <Avatar size={68} style={avatarStyle}>
            Patient
          </Avatar>}
        </Col>
        <Col span={7}>
          <br />
          <Row gutter={[8, 8]} className="mb-2">
            <Col span={24}>
              <label className="topic-green">ชื่อ :</label>
              <label className="data-value ms-1">
                {appointDetail?.pname}
              </label>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <label className="topic-green">HN :</label>
              <label className="data-value ms-1">
                {appointDetail?.hn}
              </label>
            </Col>
          </Row>
        </Col>
        <Col span={10}>
          <br />
          <Row gutter={[8, 8]} className="mb-2">
            <Col span={24}>
              <label className="topic-green">แพทย์ผู้นัดตรวจ :</label>
              <label className="data-value ms-1">
                {appointDetail?.doctor}
              </label>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <label className="topic-green">ห้องตรวจ :</label>
              <label className="data-value ms-1">
                {appointDetail?.workId}
              </label>
            </Col>
          </Row>
        </Col>
        <Col span={4}>
          <br />
          <Row gutter={[8, 8]} className="mb-2">
            <Col span={24}>
              <label className="topic-green">วันที่นัด :</label>
              <label className="data-value ms-1">
                {appointDetail?.appointDate}
              </label>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <label className="topic-green">เวลา :</label>
              <label className="data-value ms-1">
                {appointDetail?.time}
              </label>
            </Col>
          </Row>
        </Col>
      </Row>
      <div style={{
        marginRight: -28,
        marginLeft: -28
      }}>
        <Table
          scroll={{ y: 375 }}
          dataSource={appointDetail?.activitiesInfo || []}
          columns={activityColumns}
          loading={appointDetailLoading}
          rowKey="appActId"
          pagination={false}
        />
        <Row gutter={[8, 8]} className="mt-2">
          <Col span={24} className="text-center">
            <Button type="secondary" onClick={onClickClose}>
              ปิด
            </Button>
            {onClickCopy && <Button
              hidden={hiddenCopy}
              type="primary"
              disabled={appointDetail?.activitiesInfo?.length === 0}
              onClick={() => onClickCopy(appointDetail?.activitiesInfo || [])}
            >
              คัดลอก
            </Button>}
          </Col>
        </Row>
      </div>
    </div>}
  </Modal>;
}