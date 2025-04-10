import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Row, Col, Table, Spin, Tooltip, Button } from 'antd';
import { split, map, toNumber } from "lodash";
import moment from "moment";
import { CaretDownOutlined, CaretUpOutlined, CommentOutlined } from '@ant-design/icons';
export default function LastLabResult({
  size = "middle",
  patientId = null,
  scrollY = 200,
  momentTH = false,
  reload = false,
  ...props
}) {
  // console.log('patientId :>> ', patientId);
  const [loading, setLoading] = useState(false);
  const [listLabResult, setListLabResult] = useState([]);
  const getLastLab = async patientId => {
    if (!patientId) return;
    setLoading(true);
    let res = await GetLatestLabResult(patientId);
    res = map(res, o => {
      // วันที่ตรวจ
      let labResult = o.labResult[0];
      let tempOrderDateDisplay = null;
      let resultValue = labResult?.resultValue;
      let lowCriticalRef = labResult?.lowCriticalRef;
      let highCriticalRef = labResult?.highCriticalRef;
      let isLowerCri = false;
      let isHigherCri = false;
      let minNumberRef = labResult?.minNumberRef;
      let maxNumberRef = labResult?.maxNumberRef;
      let isLowerMin = false;
      let isHigherMax = false;
      if (labResult?.orderDate) {
        let orderDate = moment(labResult?.orderDate, "MM/DD/YYYY").format("DD/MM/YYYY");
        if (!momentTH) {
          orderDate = moment(labResult?.orderDate, "MM/DD/YYYY").add(543, "y").format("DD/MM/YYYY");
        }
        let orderTime = split(labResult?.orderTime, " ")[1];
        orderTime = orderTime.slice(0, 5);
        tempOrderDateDisplay = orderDate + " " + orderTime;
      }
      // chk result

      if (labResult?.dataType === "N") {
        resultValue = toNumber(resultValue);
        if (lowCriticalRef) isLowerCri = resultValue < toNumber(lowCriticalRef);
        if (highCriticalRef) isHigherCri = resultValue > toNumber(highCriticalRef);
        if (minNumberRef) isLowerMin = resultValue < toNumber(minNumberRef);
        if (maxNumberRef) isHigherMax = resultValue > toNumber(maxNumberRef);
      }
      return {
        ...o,
        resultValue: resultValue,
        orderDateDisplay: tempOrderDateDisplay,
        isLowerCri: isLowerCri,
        isHigherCri: isHigherCri,
        isLowerMin: isLowerMin,
        isHigherMax: isHigherMax
      };
    });
    // console.log('res :>> ', res);
    setListLabResult(res);
    setLoading(false);
  };
  useEffect(() => {
    getLastLab(patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, reload]);
  const columns = [{
    title: "ชื่อ Lab",
    dataIndex: 'expenseName',
    render: (v, r,) => {
      return <>
        <label className='me-3'>
          {v}
        </label>
        {r.orderComment ? <Tooltip title={<label>
          Order comment : {r.orderComment}
        </label>}>
          <Button size='small' style={{
            margin: 0
          }} icon={<CommentOutlined className='gx-text-primary' />} disabled={!r.orderComment} />
        </Tooltip> : <Button size='small' style={{
          margin: 0
        }} icon={<CommentOutlined style={{
          color: "#BDBDBD"
        }} />} disabled />}

      </>;
    }
  }, {
    title: "ผล Lab",
    dataIndex: 'resultValue',
    width: 160,
    align: "center",
    render: (v, r,) => {
      return <>
        {r.conceal ? "*****" : <Row gutter={[4, 4]}>
          <Col span={12} className="text-end fw-bold">
            {v}
          </Col>
          <Col span={12} className="text-start">
            {r.isLowerCri && <CaretDownOutlined style={{
              color: "blue"
            }} />}
            {r.isHigherCri && <CaretUpOutlined style={{
              color: "blue"
            }} />}
            {r.isLowerMin && <CaretDownOutlined style={{
              color: "red"
            }} />}
            {r.isHigherMax && <CaretUpOutlined style={{
              color: "red"
            }} />}
          </Col>
        </Row>}
      </>;
    }
  }, {
    title: "วันที่ตรวจล่าสุด",
    dataIndex: 'orderDateDisplay',
    width: 140
  }];
  return <div>
    <Spin spinning={loading}>
      <Table
        size={size}
        scroll={{
          y: scrollY
        }} dataSource={listLabResult} columns={columns} rowKey={"labResultId"} rowClassName="data-value" pagination={false}
        {...props}
      />
    </Spin>
  </div>;
}
const GetLatestLabResult = async patientId => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetLatestLabResultServiceByPatientId/${patientId}`,
    method: "GET"
    //   data: { requestData: values },
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};