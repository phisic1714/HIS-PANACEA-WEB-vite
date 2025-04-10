import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Avatar, Button, Card, Col, Divider, Row, Typography, Image, Input, Modal } from 'antd';
// import { CommentOutlined, FileOutlined } from '@ant-design/icons';
import { BsThreeDots } from 'react-icons/bs';
import moment from "moment";
// import Hx from 'components/Modal/Hx';
// import PharmaceuticalDetail from 'components/Modal/PharmaceuticalDetail';
import EllipsisDrugAllergy from 'components/Drug/EllipsisDrugAllergy.js';
import ComponentHx from 'components/Drug/ComponentHx.js';
import BtnEmessage from 'components/Button/BtnEMessage.js';
const {
  Paragraph
} = Typography;
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
const labelPrimaryBold = (text, fontSize, className) => {
  return <label className={`gx-text-primary fw-bold ${className}`} style={{
    fontSize: fontSize
  }}>
    {text}
  </label>;
};
const labelBold = (text, fontSize, className) => {
  return <label className={`fw-bold ${className}`} style={{
    fontSize: fontSize
  }}>
    {text}
  </label>;
};
export default function IpdPatientWalkin({
  patientId = null,
  admitId = null,
  // type = null,
  // page = null,
  returnPatientDetail = () => {
    console.log("Feuang");
  },
}) {

  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const [admitDetail, setAdmitDetail] = useState({});
  const [, setLoading] = useState(false);
  const [modalTelephone, setModalTelephone] = useState(false);
  const [telephoneValue, setTelephoneValue] = useState(null);
  const [mobileValue, setMobileValue] = useState(null);
  // console.log(admitDetail);
  const fetchPatientAdmitDetail = async id => {
    setLoading(true);
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/AdmissionCenter/GetPatientAdmitDetail/${id}`).then(res => {
      setAdmitDetail(res.data.responseData);
      returnPatientDetail(res.data.responseData);
      setLoading(false);
    }).catch(error => {
      return error;
    });
  };
  const fetchPatientByAdmitId = async (patientId, admitId) => {
    let req = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": {
        "admitId": admitId,
        "patientId": patientId,
        "startDate": null,
        "endDate": null
      },
      "barcode": null
    };
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitByAdmitID`, req).then(res => {
      console.log(res.data.responseData);
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    setAdmitDetail(res);
    returnPatientDetail(res);
  };
  const updatePatientPhone = async () => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/UpdPatients_Phone`,
      method: "PUT",
      data: {
        requestData: {
          patientId: patientId,
          telephone: telephoneValue ? telephoneValue : null,
          mobile: mobileValue ? mobileValue : null
        }
      }
    }).then(() => {
      setModalTelephone(false);
      if (patientId && admitId) {
        fetchPatientByAdmitId(patientId, admitId);
      } else {
        fetchPatientAdmitDetail(patientId);
      }
    }).catch(() => {
      setModalTelephone(false);
    });
  };
  useEffect(() => {
    // console.log(patientId, admitId);
    if (patientId && admitId) {
      fetchPatientByAdmitId(patientId, admitId);
    } else {
      if (patientId) {
        fetchPatientAdmitDetail(patientId);
      } else setAdmitDetail({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, admitId]);
  return <>
    <Card>
      <Row gutter={[8, 8]} style={{
        marginTop: -12
      }} align="middle">
        <Col span={4} className="text-center">
          {admitDetail?.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patients</Avatar>}
        </Col>
        <Col span={20}>
          <Row gutter={[4, 4]}>
            <Col span={21}>
              {labelPrimaryBold(admitDetail?.displayName || "ชื่อ -", 18, "me-2")}
              {labelPrimaryBold("อายุ", 18, "ms-2")}
              {labelBold(admitDetail?.age || "-", 18, "ms-1")}
            </Col>
            <Col span={3} className="text-end">
              <BtnEmessage patientId={admitDetail?.patientId} />
            </Col>
          </Row>
          <Row gutter={[4, 4]}>
            <Col span={24}>
              {labelPrimaryBold("HN", 18, "me-1")}
              {labelBold(admitDetail?.hn || "-", 18, "me-2")}
              {labelPrimaryBold("AN", 18, "me-1")}
              {labelBold(admitDetail?.an || "-", 18, "me-2")}
              {labelPrimaryBold("เบอร์โทร", 18, "me-1")}
              {labelBold(admitDetail?.telephone ? admitDetail?.telephone : admitDetail?.mobile ? admitDetail?.mobile : "-", 18, "me-2")}
              <Button className="btn-bsThreeDots" icon={<BsThreeDots style={{
                marginTop: -25
              }} />} onClick={() => {
                setMobileValue(admitDetail?.mobile);
                setTelephoneValue(admitDetail?.telephone);
                setModalTelephone(true);
              }} />
            </Col>

            <Modal
              visible={modalTelephone}
              title={<label className="gx-text-primary-bold">แก้ไขเบอร์โทรติดต่อ</label>}
              width="400px"
              onOk={() => {
                updatePatientPhone();
              }} onCancel={() => {
                setModalTelephone(false);
                setMobileValue(null);
                setTelephoneValue(null);
              }}
              okText="บันทึก"
              okButtonProps={{
                disabled: hosParam?.regTelEdit === "Y"
              }}
              cancelText="ปิด">
              <Row align="middle">
                <Col span={8} style={{
                  textAlign: "right"
                }}>
                  <label className="gx-text-primary">เบอร์โทรศัพท์</label>
                </Col>
                <Col span={16}>
                  <Input
                    disabled={hosParam?.regTelEdit === "Y"}
                    placeholder="เบอร์โทรศัพท์"
                    value={telephoneValue} onChange={e => setTelephoneValue(e.target.value)} />
                </Col>
              </Row>
              <br />
              <Row align="middle">
                <Col span={8} style={{
                  textAlign: "right"
                }}>
                  <label className="gx-text-primary">เบอร์มือถือ</label>
                </Col>
                <Col span={16}>
                  <Input
                    disabled={hosParam?.regTelEdit === "Y"}
                    placeholder="เบอร์มือถือ"
                    value={mobileValue} onChange={e => setMobileValue(e.target.value)} />
                </Col>
              </Row>
            </Modal>
          </Row>
        </Col>
        <Col span={12}>
          {labelPrimaryBold("Admit", 18, "me-1")}
          {labelBold(admitDetail?.admitDate || "-", "", "me-1")}
          {labelBold(admitDetail?.admitTime ? admitDetail?.admitTime.substring(0, 5) : "-")}
        </Col>
        <Col span={12}>
          {labelPrimaryBold("D/C", 18, "me-1")}
          {labelBold(admitDetail?.dischDate ? `${admitDetail?.dischDate} ${admitDetail?.dischTime ? moment(admitDetail?.dischTime).format("HH:mm") : ""}` : "-")}
        </Col>
        <Col span={12}>
          {labelPrimaryBold("Ward", 18, "me-1")}
          {labelBold(admitDetail?.wardName || "-", "", "me-2")}
          {labelPrimaryBold("เตียง", 18, "me-1")}
          {labelBold(admitDetail?.bedName || "-")}
        </Col>
        <Col span={12}>
          {labelPrimaryBold("แพทย์", 18, "me-1")}
          {labelBold(admitDetail ? admitDetail.feverDoctorName !== "  " && admitDetail.feverDoctorName !== "" && admitDetail.feverDoctorName !== null && admitDetail.feverDoctorName !== undefined ? admitDetail.feverDoctorName : "-" : "-")}
        </Col>

      </Row>
      <div style={marginForDivider}>
        <Divider />
      </div>
      <ComponentHx patientId={patientId} />
      <div style={marginForDivider}>
        <Divider />
      </div>
      <EllipsisDrugAllergy patientId={patientId} />
    </Card>
  </>;
}