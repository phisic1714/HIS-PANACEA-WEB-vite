import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Row, Col, Empty } from 'antd';
import axios from "axios";
import { find, filter } from "lodash";
export default function Address({
  setModal,
  isVisible = false,
  patientDetail = null
}) {
  const [addressList, setAddressList] = useState([]);
  const getAddress = async patientId => {
    if (!patientId) return setAddressList([]);
    let res = await callApi("getListAddress", patientId);
    setAddressList(filter(res, o => !o.deleteFlag));
  };
  useEffect(() => {
    getAddress(patientDetail?.patientId);
  }, [patientDetail]);
  return <div>
    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>รายละเอียดที่อยู่</label>} centered visible={isVisible} onCancel={() => {
      setModal(false);
    }} footer={<div className="text-center">
      <Button type="secondary" onClick={() => setModal(false)}>ปิด</Button>
    </div>} width={540}>
      <div style={{
        marginBottom: "-24px",
        marginTop: "-4px"
      }}>
        {addressList.map((o, index) => <div key={index} className="mb-3">
          <Row gutter={[8, 8]}>
            <Col span={24}>
              {/* <label className="gx-text-primary fw-bold mb-1 me-2" style={{ fontSize: 18 }}>ประเภทที่อยู่</label> */}
              <label className='fw-bold fs-6'>{find(addressType, ["value", o.addressType])?.label || "-"}</label>
            </Col>
            <Col span={24}>
              <div className="mb-2">
                <label className="gx-text-primary fw-bold me-2">เลขที่</label>
                <label className="data-value me-2">{o.addressNo}</label>
                {o.moo && <label>
                  <label className="gx-text-primary fw-bold me-2">หมู่ที่</label>
                  <label className="data-value me-2">{o.moo}</label>
                </label>}
                {o.villaname && <label>
                  <label className="gx-text-primary fw-bold me-2">หมู่บ้าน/อาคาร</label>
                  <label className="data-value me-2">{o.villaname}</label>
                </label>}
                {o.soisub && <label>
                  <label className="gx-text-primary fw-bold me-2">ซอย</label>
                  <label className="data-value me-2">{o.soisub}</label>
                </label>}
                {o.soimain && <label>
                  <label className="gx-text-primary fw-bold me-2">แยก</label>
                  <label className="data-value me-2">{o.soimain}</label>
                </label>}
                {o.road && <label>
                  <label className="gx-text-primary fw-bold me-2">ถนน</label>
                  <label className="data-value me-2">{o.road}</label>
                </label>}
                <label className="gx-text-primary fw-bold me-2">แขวง/ตำบล</label>
                <label className="data-value me-2">{o.tambonName}</label>
                <label className="gx-text-primary fw-bold me-2">เขต/อำเภอ</label>
                <label className="data-value me-2">{o.amphurName}</label>
                <label className="gx-text-primary fw-bold me-2">จังหวัด</label>
                <label className="data-value me-2">{o.changwatName}</label>
                {o.zipcode && <label>
                  <label className="gx-text-primary fw-bold me-2">รหัสไปรษณีย์</label>
                  <label className="data-value me-2">{o.zipcode}</label>
                </label>}
              </div>
            </Col>
          </Row>
        </div>)}
        {addressList.length === 0 && <div className="mb-3">
          <Empty description="ยังไม่มีบันทึกข้อมูลที่อยู่" />
        </div>}
      </div>
    </Modal>
  </div>;
}
export const callApi = async (name, param) => {
  let api = listApi.find(o => o.name === name);
  if (!api) return;
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`,
    method: api?.method,
    data: api?.sendRequest ? {
      requestData: param
    } : undefined
  }).then(res => {
    if (api?.return === "data") return res?.data || null;
    if (api?.return === "responseData") return res?.data?.responseData || null;
  }).catch(error => {
    return error;
  });
  return res;
};
const listApi = [
  // getListAddress
  {
    name: "getListAddress",
    url: "Patients/GetPatients_AddressByID/",
    method: "GET",
    return: "responseData",
    sendRequest: false
  }];
const addressType = [{
  value: "1",
  label: "ที่อยู่ตามทะเบียนบ้าน",
  className: "data-value"
}, {
  value: "2",
  label: "ที่อยู่ปัจจุบัน",
  className: "data-value"
}, {
  value: "3",
  label: "ที่อยู่นายจ้าง",
  className: "data-value"
}, {
  value: "4",
  label: "ที่อยู่ทำงาน",
  className: "data-value"
}, {
  value: "5",
  label: "ที่อยู่ตามบัตรประชาชน",
  className: "data-value"
}, {
  value: "6",
  label: "ที่อยู่จัดส่งยาทางไปรษณีย์",
  className: "data-value"
}];