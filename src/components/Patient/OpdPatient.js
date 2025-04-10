import { env } from '../../env.js';
import React, { useState } from 'react';
import Axios from 'axios';
import { Card, Col, Divider, Row, Avatar, Image, Modal, Button } from 'antd';
import { uniqBy } from 'lodash';
import { useSelector } from "react-redux";
import { CgGenderMale, CgGenderFemale } from "react-icons/cg";
import { BsThreeDots } from "react-icons/bs";
import { Icon } from '@iconify/react';
import starFill from '@iconify/icons-bi/star-fill';
import pregnantWoman from '@iconify/icons-emojione-monotone/pregnant-woman';
import handcuffsIcon from '@iconify/icons-mdi/handcuffs';
import VipStatus from 'components/VipStatus/VipStatus.js';
import BtnEmessage from 'components/Button/BtnEMessage.js';
const marginForDivider = {
  marginLeft: "-24px",
  marginRight: "-24px"
};
const threeDot = {
  backgroundColor: "#ECEFF1",
  width: "26px",
  height: "12px",
  borderRadius: "50px",
  boxShadow: "0 1px 1px 0 #CFD8DC",
  alignItems: "center",
  cursor: "pointer"
};
export default function OpdPatient({
  personalData = {}
}) {
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const [patientAddress, setPatientAddress] = useState([]);
  const getPatientAddress = async id => {
    let res = await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Address/GetPatientsByHistoryaddress/` + id).then(res => {
      return uniqBy(res.data.responseData, 'addressType');
    }).catch(error => {
      return error;
    });
    return res;
  };
  const [ShowAddressModal, setShowAddressModal] = useState(false);
  const showModal = async () => {
    if (opdPatientDetail) {
      let res = await getPatientAddress(opdPatientDetail.patientId);
      await setPatientAddress(res);
    }
    await setShowAddressModal(true);
  };
  const closeModal = () => {
    setShowAddressModal(false);
  };
  return <div>
    <Card>
      <Row gutter={[4, 4]} align="middle" style={{
        marginTop: -14
      }}>
        <Col span={4} className="text-center">
          {personalData.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${personalData.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
        </Col>
        <Col span={20}>
          <Row gutter={[4, 4]} align="middle">
            <Col span={22}>
              <label className="gx-text-primary fw-bold" style={{
                fontSize: 18
              }}>{personalData.displayName || "ชื่อ -"}</label>
              <label className="ms-1">
                {personalData.gender ? personalData.gender === "M" ? <label style={{
                  color: "blue",
                  fontSize: 22
                }}><CgGenderMale /></label> : personalData.gender === "F" ? <label style={{
                  color: "pink",
                  fontSize: 22
                }}><CgGenderFemale /></label> : null : null}

              </label>
              <label className="gx-text-primary fw-bold ms-2">ID</label>
              <label className="data-value ms-1 me-2">{personalData.idCard}</label>
              <VipStatus patientId={opdPatientDetail?.patientId} />
            </Col>
            <Col span={2} className="text-nowrap text-end">
              {/* <Button size="small" icon={<RiFile4Line className="gx-text-primary" />} style={{
                marginBottom: 0,
                marginTop: 0
              }} /> */}
              <BtnEmessage patientId={opdPatientDetail?.patientId} />
            </Col>
            <Col span={24}>
              <label className="gx-text-primary fw-bold" style={{
                fontSize: 18
              }}>Hn</label>
              <label className="ms-1" style={{
                fontSize: 18
              }}>{personalData.hn || "-"}</label>
              {personalData.isVip === "1" && <label className="ms-1">
                <Icon icon={starFill} color="#ffea00" width="18" />
              </label>}
              {personalData.isPregnant === "1" && <label className="ms-1">
                <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
              </label>}
              {personalData.isConceled === "1" && <label className="ms-1">
                <Icon icon={handcuffsIcon} color="#d50000" width="18" />
              </label>}
              <label className="gx-text-primary fw-bold ms-2">อายุ</label>
              <label className="data-value ms-1">{personalData.age || "-"}</label>
              <label className="gx-text-primary fw-bold ms-2">เบอร์โทร</label>
              <label className="data-value ms-1">
                {personalData.mobile ? personalData.mobile : personalData.telephone ? personalData.telephone : "-"}
              </label>
            </Col>
            <Col span={24}>
              <label className="gx-text-primary fw-bold me-1" style={{
                fontSize: 18
              }}>สิทธิ์</label>
              <label className="data-value">{personalData.rightName || "-"}</label>
            </Col>
          </Row>
        </Col>
      </Row>
      <div style={marginForDivider}>
        <Divider />
      </div>
      <Row gutter={[8, 8]} align="middle" style={{
        marginBottom: -12
      }}>
        <Col span={23}>
          <label className="gx-text-primary fw-bold pe-1">ที่อยู่ </label>
          {personalData.addressNo ? <label>
            <label className="gx-text-primary ps-1 pe-1">เลขที่ :</label>
            <label className="data-value ps-1 pe-1">{personalData.addressNo}</label>
          </label> : null}
          {personalData.tambon ? <label>
            <label className="gx-text-primary ps-1 pe-1">ตำบล :</label>
            <label className="data-value ps-1 pe-1">{personalData.tambon}</label>
          </label> : null}
          {personalData.amphur ? <label>
            <label className="gx-text-primary ps-1 pe-1">อำเภอ :</label>
            <label className="data-value ps-1 pe-1">{personalData.amphur}</label>
          </label> : null}
          {personalData.changwat ? <label>
            <label className="gx-text-primary ps-1 pe-1">จังหวัด :</label>
            <label className="data-value ps-1 pe-1">{personalData.changwat}</label>
          </label> : null}
        </Col>
        <Col span={1} className="text-end text-nowrap">
          <label className="gx-text-primary">
            <BsThreeDots style={threeDot} onClick={showModal} />
          </label>
        </Col>
      </Row>
    </Card>
    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>รายละเอียดที่อยู่</label>} centered visible={ShowAddressModal} okText="บันทึก" cancelText="ออก" onOk={closeModal} onCancel={closeModal} footer={<div className="text-center">
      <Button type="secondary" onClick={closeModal}>ปิด</Button>
    </div>} width={540}>
      <div style={{
        marginBottom: -28,
        marginTop: -14
      }}>
        {patientAddress.map((val, index) => <div key={index} className="mb-4">
          {val.address_type ? <p>
            <label className="gx-text-primary-bold ps-1 pe-1" style={{
              fontSize: 18
            }}>ประเภทที่อยู่ :</label>
            <label style={{
              fontSize: 18
            }}>{val.address_type}</label>
          </p> : null}
          <div style={{
            marginTop: "-12px"
          }}>
            {val.addressNo ? <label>
              <label className="gx-text-primary ps-1 pe-1">เลขที่ :</label>
              <label className="data-value ps-1 pe-1">{val.addressNo}</label>
            </label> : null}
            {val.tambonName ? <label>
              <label className="gx-text-primary ps-1 pe-1">แขวง/ตำบล :</label>
              <label className="data-value ps-1 pe-1">{val.tambonName}</label>
            </label> : null}
            {val.amphurName ? <label>
              <label className="gx-text-primary ps-1 pe-1">เขต/อำเภอ :</label>
              <label className="data-value ps-1 pe-1">{val.amphurName}</label>
            </label> : null}
            {val.changwatName ? <label>
              <label className="gx-text-primary ps-1 pe-1">จังหวัด :</label>
              <label className="data-value ps-1 pe-1">{val.changwatName}</label>
            </label> : null}
            {val.zipcode ? <label>
              <label className="gx-text-primary ps-1 pe-1">รหัสไปรษณีย์ :</label>
              <label className="data-value ps-1 pe-1">{val.zipcode}</label>
            </label> : null}
          </div>
        </div>)}
      </div>
    </Modal>
  </div>;
}