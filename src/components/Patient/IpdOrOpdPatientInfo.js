import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { uniqBy } from "lodash";
import { Table, Card, Row, Col, Avatar, Image, Modal, Button } from 'antd';
import { useSelector } from "react-redux";
import { CgGenderMale, CgGenderFemale } from "react-icons/cg";
import { BsThreeDots } from "react-icons/bs";
import { GiBackwardTime } from "react-icons/gi";
import { RiQuestionAnswerLine, RiFile4Line } from "react-icons/ri";
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import EMessage from '../Modal/EMessageAntdDatePicker.js';
const threeDot = {
  backgroundColor: "#ECEFF1",
  width: "26px",
  height: "12px",
  borderRadius: "50px",
  boxShadow: "0 1px 1px 0 #CFD8DC",
  alignItems: "center",
  cursor: "pointer"
};
export default function IpdOrOpdPatientInfo({
  setPatientDetail,
  patientId
}) {
  const {
    patient_Type
  } = useSelector(({
    patientType
  }) => patientType);
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const {
    selectPatient
  } = useSelector(({
    patient
  }) => patient);
  // const { selectPatient } = useSelector(({ patient }) => patient);
  const [admitDetail, setAdmitDetail] = useState(null);
  const [showModalAddress, setShowModalAddress] = useState(false);
  const [showModalPatientDetailEdit, setShowModalPatientDetailEdit] = useState(false);
  const [patientAddress, setPatientAddress] = useState([]);
  const [patientDetailEditDisplayCard, setpatientDetailEditDisplayCard] = useState(null);
  const [patientDetailEditDisplayTable, setpatientDetailEditDisplayTable] = useState([]);
  const [emessageVisible, setEMessageVisible] = useState(false);

  console.log(admitDetail);
  // console.log("AN", selectPatient);
  // console.log("HN", opdPatientDetail);
  // console.log("patient_Type", patient_Type);
  // console.log(admitDetail);

  const fetchAdmitByAdmitID = async id => {
    let req = await {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": {
        "admitId": id,
        "patientId": null,
        "startDate": null,
        "endDate": null
      },
      "barcode": null
    };
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitByAdmitID`, req).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    await setAdmitDetail(res);
    setPatientDetail && (await setPatientDetail(res));
    // await fetchPatientAdmitDetail(data.patient.patientId)
  };
  // const fetchPatientAdmitDetail = async (id) => {
  //     let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/AdmissionCenter/GetPatientAdmitDetail/${id}`)
  //         .then((res) => { return res.data.responseData })
  //         .catch((error) => { return error })
  //     await setAdmitDetail({...admitDetail,...{ex:res}})
  // }
  const fetchPatient = async id => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` + id).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    await setAdmitDetail(res);
    setPatientDetail && (await setPatientDetail(res));
  };
  const fetchPatientAddress = async id => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Address/GetPatientsByHistoryaddress/` + id).then(res => {
      return uniqBy(res.data.responseData, 'addressType');
    }).catch(error => {
      return error;
    });
    await setPatientAddress(res);
  };
  const fetchHistoryUpdPatient = async id => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetHistoryUpdPatient/` + id).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    await setpatientDetailEditDisplayCard({
      "picture": res.picture,
      "pname": res.pname,
      "hn": res.hn,
      "userModified": res.userModified,
      "dateModified": res.dateModified
    });
    await setpatientDetailEditDisplayTable(res.patientLogDisplay);
  };
  const showModalAddressControl = async () => {
    if (opdPatientDetail || selectPatient) {
      await fetchPatientAddress(admitDetail.patientId);
    }
    await setShowModalAddress(true);
  };
  const closeModalAddress = () => {
    setShowModalAddress(false);
  };
  const showModalPatientDetailEditControl = async () => {
    if ((opdPatientDetail || selectPatient) && patientDetailEditDisplayCard?.hn === undefined) {
      await fetchHistoryUpdPatient(admitDetail.patientId);
    }
    await setShowModalPatientDetailEdit(true);
  };
  const closeModalPatientDetailEdit = () => {
    setShowModalPatientDetailEdit(false);
  };
  useEffect(() => {
    setpatientDetailEditDisplayCard(null);
    setpatientDetailEditDisplayTable([]);
    if (opdPatientDetail || selectPatient) {
      if (selectPatient && patient_Type === "ipd") {
        fetchAdmitByAdmitID(selectPatient.admitId);
      }
      if (opdPatientDetail && patient_Type === "opd") {
        fetchPatient(opdPatientDetail.patientId);
      }
    } else setAdmitDetail(null);
    setPatientDetail && setPatientDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opdPatientDetail, selectPatient]);
  useEffect(() => {
    setpatientDetailEditDisplayCard(null);
    setpatientDetailEditDisplayTable([]);
    setAdmitDetail(null);
    setPatientDetail && setPatientDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient_Type]);
  const PersonalHistory = () => {
    return <Row gutter={[2, 16]}>
      <Col xl={2} lg={12} md={12} sm={24} xs={24}>
        <div className="text-center mt-4">
          {admitDetail?.picture ? <Avatar size={90} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} src={<Image style={{
            width: "90px",
            height: "90px"
          }} src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={90}>Patient</Avatar>}
        </div>
      </Col>
      <Col xl={8} lg={12} md={12} sm={24} xs={24}>
        <Row gutter={[8, 8]}>
          <Col span={24} style={{ marginLeft: 50 }}>

            {selectPatient ? <>
              <label className="gx-text-primary me-1">AN</label>
              <label className="me-2">{admitDetail?.an}</label>
            </> : null}

            <label className="gx-text-primary me-1">HN</label>
            <label className="me-2">{admitDetail?.hn}</label>
            {/* <label>
                                    <AiOutlineStar style={{ color: "yellow" }} />
                                    <Icon icon="cil:pregnant" color="pink" />
                                    <Icon icon="si-glyph:handcuff" color="red" />
                                </label> */}
          </Col>
          <Col span={5} className="text-end">
            <label className="gx-text-primary">ชื่อ</label>
          </Col>
          <Col span={19}>
            <label className="data-value me-1">{admitDetail?.displayName}</label>
            <label>
              {admitDetail?.gender && <label>
                {admitDetail?.gender === "M" && <CgGenderMale style={{
                  color: "blue"
                }} />}
                {admitDetail?.gender === "F" && <CgGenderFemale style={{
                  color: "#FF4081"
                }} />}
              </label>}
            </label>
            <label className="gx-text-primary ms-3">
              <div className="button-circle" hidden={opdPatientDetail || selectPatient ? false : true} onClick={showModalPatientDetailEditControl}>
                <GiBackwardTime />
              </div>
            </label>
          </Col>
          <Col span={5} className="text-end">
            <label className="gx-text-primary">Ename</label>
          </Col>
          <Col span={19}>
            <label className="data-value">{admitDetail?.eDisplayName}</label>
          </Col>
          <Col span={5} className="text-end">
            <label className="gx-text-primary">ที่อยู่</label>
          </Col>
          <Col span={19}>
            <label>
              {admitDetail?.addressNo && <label className="data-value pe-1">{admitDetail?.addressNo}</label>}
              {admitDetail?.tambon && <label className="data-value pe-1">{admitDetail?.tambon}</label>}
              {admitDetail?.amphur && <label className="data-value pe-1">{admitDetail?.amphur}</label>}
              {admitDetail?.changwat && <label className="data-value pe-1">{admitDetail?.changwat}</label>}
              <label className="gx-text-primary" hidden={opdPatientDetail || selectPatient ? false : true} onClick={showModalAddressControl}>
                <BsThreeDots style={threeDot} />
              </label>
            </label>
          </Col>

          {selectPatient ? <>
            <Col span={5} className="text-end">
              <label className="gx-text-primary">Admit</label>
            </Col>
            <Col span={19}>
              {opdPatientDetail || selectPatient ? <label className="data-value">{`
                            ${patient_Type === "opd" ? [] : admitDetail?.admitDate ? moment(admitDetail?.admitDate, 'DD/MM/YYYY').add(-543, 'year').format('DD/MM/YYYY') : []} 
                            ${patient_Type === "opd" ? [] : admitDetail?.admitTime ? moment(admitDetail?.admitTime, 'HH:mm:ss').format('HH.mm น.') : []}`}</label> : <label className="data-value" />}
            </Col>
            <Col span={5} className="text-end">
              <label className="gx-text-primary">DC</label>
            </Col>
            <Col span={19}>
              {opdPatientDetail || selectPatient ? <label className="data-value">{`
                            ${patient_Type === "opd" ? [] : admitDetail?.dischDate ? moment(admitDetail?.dischDate, 'DD/MM/YYYY').add(-543, 'year').format('DD/MM/YYYY') : []} 
                            ${patient_Type === "opd" ? [] : admitDetail?.dischDate ? moment(admitDetail?.dischTime).format('HH.mm น.') : []}`}
              </label> : <label className="data-value" />}
            </Col>
          </> : null}

        </Row>
      </Col>
      <Col xl={7} lg={12} md={12} sm={24} xs={24}>
        <Row gutter={[8, 8]}>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">เลขบัตรประชาชน</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{admitDetail?.idCard}</label>
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">อายุ</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{admitDetail?.age}</label>
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">สัญชาติ</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{patient_Type === "opd" ? admitDetail?.nation : admitDetail?.nationalityName}</label>
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">ศาสนา</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{patient_Type === "opd" ? admitDetail?.religion : admitDetail?.religionName}</label>
          </Col>

          {selectPatient ? <>
            <Col span={9} className="text-end">
              <label className="gx-text-primary">WARD</label>
            </Col>
            <Col span={15}>
              <label className="data-value">{`${admitDetail?.wardName ? `${admitDetail?.wardName || "-"} เตียง ${admitDetail?.bedName || "-"}` : ""}`}</label>
            </Col>
          </> : null}

        </Row>
      </Col>
      <Col xl={7} lg={12} md={12} sm={24} xs={24}>
        <Row gutter={[8, 8]}>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">Passport</label>
          </Col>
          <Col span={12}>
            <label className="data-value">{admitDetail?.passport}</label>
          </Col>
          <Col span={3} className='text-end'>
            <RiQuestionAnswerLine
              className="btn-custom-bgcolor pointer fs-5"
              onClick={() => setEMessageVisible(true)}
            />
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">สถานภาพสมรส</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{patient_Type === "opd" ? admitDetail?.mstatus : admitDetail?.maritalStatusName}</label>
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">อาชีพ</label>
          </Col>
          <Col span={15}>
            <label className="data-value">{patient_Type === "opd" ? admitDetail?.occupation : admitDetail?.occupationName}</label>
          </Col>
          <Col span={9} className="text-end">
            <label className="gx-text-primary">เบอร์โทรศัพท์</label>
          </Col>
          <Col span={15}>
            {admitDetail?.mobile !== undefined ? <label>
              {admitDetail?.mobile ? <label className="data-value">{admitDetail?.mobile}</label> : <label className="data-value">{admitDetail?.telephone}</label>}
            </label> : null}
          </Col>
          {selectPatient ? <>
            <Col span={9} className="text-end">
              <label className="gx-text-primary">แพทย์</label>
            </Col>
            <Col span={15}>
              <label className="data-value">{admitDetail?.feverDoctorName || "-"}</label>
            </Col>
          </> : null}
        </Row>
      </Col>
    </Row>;
  };
  const TablePatientDetailEdit = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const dataSource = patientDetailEditDisplayTable.map((val, index) => {
      return {
        key: index,
        logField: val.logField,
        oldData: val.oldData,
        newData: val.newData,
        dateUpdated: val.dateUpdated,
        userUpdated: val.userUpdated
      };
    });
    const columns = [{
      title: <label className="gx-text-primary">การแก้ไข</label>,
      dataIndex: "logField",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ข้อมูลที่แก้ไข</label>,
      dataIndex: "newData",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ข้อมูลเดิม</label>,
      dataIndex: "oldData",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">วันที่แก้ไข</label>,
      dataIndex: "dateUpdated",
      key: "key",
      align: "center",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ผู้แก้ไข</label>,
      dataIndex: "userUpdated",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }];
    const setWidthForScrollbars = dataSourceLength => {
      if (dataSourceLength === 0) return 250;
      if (dataSourceLength === 1) return 180;
      if (dataSourceLength === 2) return 230;
      if (dataSourceLength === 3) return 280;
      if (dataSourceLength === 4) return 330;
      if (dataSourceLength >= 5) return 385;
    };
    return <div>
      <Scrollbars autoHeight autoHeightMin={setWidthForScrollbars(dataSource.length)}>
        <div>
          <Table columns={columns} dataSource={dataSource} pagination={{
            current: page,
            pageSize: pageSize,
            total: dataSource.length,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) => <label>
              รายการที่
              <label className="gx-text-primary ps-1 pe-1"> {range[0]}-{range[1]} </label>
              จากทั้งหมด
              <label className="gx-text-primary ps-1 pe-1"> {total} </label>
              รายการ
            </label>
          }} />
        </div>
      </Scrollbars>
    </div>;
  };
  return <div>
    <div>
      {PersonalHistory()}
    </div>
    <Modal name="Address" title={<label className="gx-text-primary-bold">ที่อยู่</label>} centered visible={showModalAddress} okText="บันทึก" cancelText="ออก" onOk={closeModalAddress} onCancel={closeModalAddress} footer={<div className="text-center">
      <Button type="secondary" onClick={closeModalAddress}>ปิด</Button>
    </div>} width={540}>
      <div style={{
        marginBottom: "-28px",
        marginTop: "-4px"
      }}>
        {patientAddress.map((val, index) => <div key={index} className="mb-4">
          {val.address_type ? <p>
            <label className="gx-text-primary-bold ps-1 pe-1">ประเภทที่อยู่ :</label>
            <label>{val.address_type}</label>
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

    <Modal name="PatientDetailEdit" title={<label className="gx-text-primary-bold">รายละเอียดการเปลี่ยนแปลงข้อมูลผู้ป่วย</label>} centered visible={showModalPatientDetailEdit} onCancel={closeModalPatientDetailEdit} footer={<div className="text-center">
      <Button type="secondary" onClick={closeModalPatientDetailEdit}>ปิด</Button>
    </div>} width={900}>
      <div>
        <Card style={{
          backgroundColor: "#F5F5F5"
        }} bordered={false}>
          <Row>
            <Col span={3}>
              <div className="text-center">
                {patientDetailEditDisplayCard?.picture ? <Avatar size={90} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }} src={<Image style={{
                  width: "90px",
                  height: "90px"
                }} src={`data:image/jpeg;base64,${patientDetailEditDisplayCard?.picture}`} />} /> : <Avatar size={90}>Patient</Avatar>}
              </div>
            </Col>
            <Col span={21} className="mt-3">
              <Row className="mb-2">
                <Col span={9}>
                  <label className="gx-text-primary me-1">ชื่อ :</label>
                  <label className="data-value">{patientDetailEditDisplayCard?.pname}</label>
                </Col>
                <Col span={9}>
                  <label className="gx-text-primary">ผู้แก้ไขล่าสุด</label>
                </Col>
                <Col span={6}>
                  <label className="gx-text-primary">วันที่แก้ไขล่าสุด</label>
                </Col>
              </Row>
              <Row>
                <Col span={9}>
                  <label className="gx-text-primary me-1">HN :</label>
                  <label className="data-value">{patientDetailEditDisplayCard?.hn}</label>
                </Col>
                <Col span={9}>
                  <label className="data-value">{patientDetailEditDisplayCard?.userModified}</label>
                </Col>
                <Col span={6}>
                  <label className="data-value">{patientDetailEditDisplayCard?.dateModified}</label>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        {TablePatientDetailEdit()}
      </div>
    </Modal>
    <EMessage
      isVisible={emessageVisible}
      onOk={() => setEMessageVisible(false)}
      onCancel={() => setEMessageVisible(false)}
      patientId={patientId}
    />
  </div>;
}