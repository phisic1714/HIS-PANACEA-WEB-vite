import { Button, Col, Divider, Empty, Modal, Row } from 'antd';
import axios from "axios";
import { map, find, filter, uniqBy } from "lodash";
import { useEffect, useState } from 'react';
import { BsThreeDots } from "react-icons/bs";
import { env } from '../../env.js';
import { labelText, labelTopic18, labelTopicPrimary } from "../helper/function/GenLabel";
export default function AddressOnPatientCard({
  patientId = null
}) {
  // State
  const [listAddress, setListAddress] = useState([]);
  const [dispAddress, setDispAddress] = useState(null);
  // Modal Controller
  const [vsbModal, setVsbModal] = useState(false);
  // Functions
  const getAddress = async patientId => {
    setDispAddress(null);
    setListAddress([]);
    if (!patientId) return;
    let res = await callApi("getListAddress", patientId);
    res = uniqBy(res, 'addressType');
    setListAddress(filter(res, o => !o.deleteFlag));
    let findType2 = find(res, ['addressType', "2"]); //ปัจจุบัน
    if (findType2) return setDispAddress(findType2);
    let findType5 = find(res, ['addressType', "5"]); //ตามบัตร ปชช
    if (findType5) return setDispAddress(findType5);
    let findType1 = find(res, ['addressType', "1"]); // ทะเบียนบ้าน
    if (findType1) return setDispAddress(findType1);
    let findType4 = find(res, ['addressType', "4"]); //ที่ทำงาน
    if (findType4) return setDispAddress(findType4);
    let findType3 = find(res, ['addressType', "3"]); //นายจ้าง
    if (findType3) return setDispAddress(findType3);
    let findType6 = find(res, ['addressType', "6"]); // ส่งยาทางไปรษณีย์
    if (findType6) return setDispAddress(findType6);
  };
  // Effect
  useEffect(() => {
    getAddress(patientId);
  }, [patientId]);
  return <>
    <Row gutter={[4, 4]} align='middle' style={{ flexDirection: "row" }}>
      <Col span={22}>
        {labelTopicPrimary("ที่อยู่ :", "me-2")}
        {labelTopicPrimary("เลขที่", "me-1")}
        {labelText(dispAddress?.addressNo || "-", "me-2")}
        {dispAddress?.villaname && <label>
          {labelTopicPrimary("อาคาร/หมู่บ้าน", "me-1")}
          {labelText(dispAddress?.villaname || "-", "me-2")}
        </label>}
        {dispAddress?.moo && <label>
          {labelTopicPrimary("หมู่ที่", "me-1")}
          {labelText(dispAddress?.moo || "-", "me-2")}
        </label>}
        {dispAddress?.soimain && <label>
          {labelTopicPrimary("ซอย", "me-1")}
          {labelText(dispAddress?.soimain || "-", "me-2")}
        </label>}
        {dispAddress?.soisub && <label>
          {labelTopicPrimary("แยก", "me-1")}
          {labelText(dispAddress?.soisub || "-", "me-2")}
        </label>}
        {dispAddress?.road && <label>
          {labelTopicPrimary("ถนน", "me-1")}
          {labelText(dispAddress?.road || "-", "me-2")}
        </label>}
        {labelTopicPrimary("แขวง/ตำบล", "me-1")}
        {labelText(dispAddress?.tambonName || "-", "me-2")}
        {labelTopicPrimary("เขต/อำเภอ", "me-1")}
        {labelText(dispAddress?.amphurName || "-", "me-2")}
        {labelTopicPrimary("จังหวัด", "me-1")}
        {labelText(dispAddress?.changwatName || "-", "me-2")}
        {dispAddress?.zipcode && <label>
          {labelTopicPrimary("รหัสไปรษณีย์", "me-1")}
          {labelText(dispAddress?.zipcode || "-", "me-2")}
        </label>}
        {labelTopicPrimary("ประเทศ", "me-1")}
        {labelText(dispAddress?.countryName || "-")}
      </Col>
      <Col span={2} className='text-end'>
        <Button
          style={{
            marginBottom: 0
          }}
          size='small'
          shape='circle'
          icon={<BsThreeDots
            className='gx-text-primary' />}
          onClick={() => setVsbModal(true)}
          disabled={!patientId}
        />
      </Col>
    </Row>
    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>รายละเอียดที่อยู่</label>} centered visible={vsbModal} onCancel={() => {
      setVsbModal(false);
    }} footer={<div className="text-center">
      <Button type="secondary" onClick={() => setVsbModal(false)}>ปิด</Button>
    </div>} width={540}>
      {map(listAddress, (o, i) => {
        return <div key={String(i)}>
          <Row gutter={[4, 4]}>
            <Col span={16}>
              {/* {labelTopicPrimary18("ประเภทที่อยู่")} */}
              {labelTopic18(find(addressType, ["value", o.addressType])?.label || "-")}
            </Col>
          </Row>
          <Row gutter={[4, 4]}>
            <Col span={24}>
              {labelTopicPrimary("เลขที่", "me-1")}
              {labelText(o?.addressNo || "-", "me-2")}
              {labelTopicPrimary("อาคาร/หมู่บ้าน", "me-1")}
              {labelText(o?.villaname || "-", "me-2")}
              {labelTopicPrimary("หมู่ที่", "me-1")}
              {labelText(o?.moo || "-", "me-2")}
              {labelTopicPrimary("ซอย", "me-1")}
              {labelText(o?.soimain || "-", "me-2")}
              {labelTopicPrimary("แยก", "me-1")}
              {labelText(o?.soisub || "-", "me-2")}
              {labelTopicPrimary("ถนน", "me-1")}
              {labelText(o?.road || "-", "me-2")}
              {labelTopicPrimary("แขวง/ตำบล", "me-1")}
              {labelText(o?.tambonName || "-", "me-2")}
              {labelTopicPrimary("เขต/อำเภอ", "me-1")}
              {labelText(o?.amphurName || "-", "me-2")}
              {labelTopicPrimary("จังหวัด", "me-1")}
              {labelText(o?.changwatName || "-", "me-2")}
              {labelTopicPrimary("รหัสไปรษณีย์", "me-1")}
              {labelText(o?.zipcode || "-", "me-2")}
              {labelTopicPrimary("ประเทศ", "me-1")}
              {labelText(o?.countryName || "-")}
            </Col>
          </Row>
          <Divider />
        </div>;
      })}
      {!listAddress?.length && <Empty />}
    </Modal>
  </>;
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