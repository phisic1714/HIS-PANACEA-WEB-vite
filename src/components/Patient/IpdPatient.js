import { SmallDashOutlined } from '@ant-design/icons';
import { Avatar, Button, Checkbox, Col, Divider, Form, Image, Input, List, Modal, Radio, Row, Select, Spin } from 'antd';
import Axios from 'axios';
import { uniqBy, find } from "lodash";
import React, { useEffect, useState } from 'react';
import { env } from '../../env.js';
// import { FaRegStickyNote/* , FaUserAlt */ } from "react-icons/fa";
import genderFemale from '@iconify/icons-bi/gender-female';
import genderMale from '@iconify/icons-bi/gender-male';
import starFill from '@iconify/icons-bi/star-fill';
import pregnantWoman from '@iconify/icons-emojione-monotone/pregnant-woman';
import handcuffsIcon from '@iconify/icons-mdi/handcuffs';
import { Icon } from '@iconify/react';
import EllipsisDrugAllergy from 'components/Drug/EllipsisDrugAllergy.js';
import moment from 'moment';
import { BsThreeDots } from "react-icons/bs";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { showPatient } from "../../appRedux/actions";
import EMessage from "../Modal/EMessageAntdDatePicker";
import UpdateMobile from "../Modal/UpdateMobile";
import { notificationX as notiX } from "../Notification/notificationX";
import { getContactInfo } from 'util/GeneralFuctions';

const {
  TextArea
} = Input;
const threeDot = {
  backgroundColor: "#ECEFF1",
  width: "26px",
  height: "12px",
  borderRadius: "50px",
  boxShadow: "0 1px 1px 0 #CFD8DC",
  alignItems: "center",
  cursor: "pointer"
};
export default function IpdPatient({
  address,
  closeAccount,
  closeAccountLoading,
  drugAllergy,
  getPatientInfo,
  specialDetails,
  patientLoading,
  showComponent = false,
  listAdmitRight = [],
  reloadPatient = false,
  ...props
}) {
  const dispatch = useDispatch();
  const userFromSession = JSON.parse(sessionStorage.getItem('user'));
  let user = userFromSession.responseData.userId;
  const {
    /* error,  */admitList,
    selectPatient
  } = useSelector(({
    patient
  }) => patient);
  // console.log(selectPatient);
  // console.log(admitList);
  //data
  const [patientInfo, setPatientInfo] = useState([]);
  const [patientAddress, setPatientAddress] = useState([]);
  //from
  const [formHx] = Form.useForm();
  const [formDrug] = Form.useForm();
  const [formVS] = Form.useForm();

  const [radioValue, setRadioValue] = useState(null);
  const [, setTextAreaDisable] = useState(false);
  //modal
  const [modalAddress, setModalAddress] = useState(false);
  const [modalHx, setModalHx] = useState(false);
  const [modalDrug, setModalDrug] = useState(false);
  const [modalVS, setModalVS] = useState(false);
  //closeAccount
  const [, setIpdAdmitRightCash] = useState(null);
  const [, setChecked] = useState(true);
  // const [disbleSwitch, setDisbleSwitch] = useState(false);
  //emessage
  const [emessageVisible, setEMessageVisible] = useState(false);
  const [isZhowModalTelephone, setIsZhowModalTelephone] = useState(false);
  const onFinishVS = async () => { };
  const onFinishHx = async () => { };
  const onFinishDrug = async value => {
    // console.log(":value", value);
  };
  useEffect(() => {
    if (props.patient !== null && props.patient !== undefined) {
      if (patientLoading) patientLoading(true);
      getPatientById(props.patient.admitId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.patient, reloadPatient]);
  useEffect(() => {
    if (props.patient !== null && props.patient !== undefined && closeAccount === true && closeAccount !== undefined) {
      setChecked(true);
      if (closeAccountLoading) closeAccountLoading(true);
      getIpdAdmitRightCash(props.patient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeAccount, props.patient]);
  useEffect(() => {
    if (getPatientInfo !== undefined && patientInfo.length > 0) {
      getPatientInfo(patientInfo);
    }
  }, [patientInfo, getPatientInfo]);

  /* useEffect(() => {
      if(props.patientInfo !== null && props.patientInfo !== undefined ){ console.log(props.patientInfo);
          setPatientInfo(props.patientInfo);
      }
  }, [props.patientInfo]) */

  // api
  const getPatientById = async admitId => {
    await Axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitByAdmitID`, {
      requestData: {
        admitId: admitId
      }
    }).then(res => {
      setPatientInfo([res.data.responseData]);
      if (patientLoading) patientLoading(false);
    }).catch(error => {
      return error;
    });
  };
  const getIpdAdmitRightCash = async patient => {
    await Axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetIpdAdmitRightCash`, {
      requestData: {
        patientId: patient.patientId,
        admitId: patient.admitId
      }
    }).then(res => {
      setIpdAdmitRightCash(res.data.responseData);
      if (closeAccountLoading) closeAccountLoading(false);
    }).catch(error => {
      return error;
    });
  };
  /*const setAdmitCloseFlag = async admitId => {
    const userFromSession = JSON.parse(sessionStorage.getItem('user'));
    let user = userFromSession.responseData.userId;
    await Axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/SetAdmitCloseFlag`, {
      requestData: {
        admitId: admitId,
        closeUser: user
      }
    });
  };*/
  const getPatientAddress = async () => {
    await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Address/GetPatientsByHistoryaddress/` + props.patient.patientId).then(res => {
      setPatientAddress(uniqBy(res.data.responseData, "addressType"));
    }).catch(error => {
      return error;
    });
  };
  const [loading, setLoading] = useState(false);
  const [allowedOpdFinance, setAllowedOpdFinance] = useState(false);
  // console.log('allowedOpdFinance', allowedOpdFinance)
  const [mainAdmitRightId, setMainAdmitRightId] = useState(null);
  // console.log(mainAdmitRightId);
  const manageAdmitRight = list => {
    setAllowedOpdFinance(false);
    setMainAdmitRightId(null);
    if (!list?.length) return;
    let findMainRight = find(list, ["mainFlag", "Y"]);
    if (!findMainRight) return;
    setMainAdmitRightId(findMainRight?.admitRightId);
    setAllowedOpdFinance(findMainRight?.opdFinance);
  };
  useEffect(() => {
    manageAdmitRight(listAdmitRight);
  }, [listAdmitRight]);
  return <Spin spinning={loading}>
    <Row gutter={[4, 4]} align="middle" style={{
      marginTop: -14
    }}>
      <Col span={4}>
        {patientInfo[0]?.picture ? <Avatar size={68} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }} src={<Image style={{
          width: "90px",
          height: "90px"
        }} src={`data:image/jpeg;base64,${patientInfo[0]?.picture}`} />} /> : <Avatar size={68}>Patient</Avatar>}
      </Col>
      {/* Name */}
      <Col span={20}>
        <Row gutter={[8, 8]} align="middle">
          <Col span={22}>
            <label className="gx-text-primary fw-bold me-1" style={{
              fontSize: 18
            }}>{patientInfo[0]?.newbornId ? "บุตร" : patientInfo[0]?.displayName || "-"}
            </label>
            {patientInfo.length > 0 ? patientInfo[0]?.gender === "F" ? <Icon icon={genderFemale} color="#e91e63" /> : <Icon icon={genderMale} color="blue" /> : <label></label>}
            <label className="gx-text-primary fw-bold ms-2">อายุ</label>
            <label className="ms-1">{patientInfo[0]?.age || "-"}</label>
          </Col>
          <Col span={2} className="text-end text-nowrap">
            <Button size="small" icon={<RiQuestionAnswerLine className="gx-text-primary" />} onClick={() => setEMessageVisible(true)} style={{
              marginBottom: 0,
              marginTop: 0
            }} />
          </Col>
          <Col span={24}>
            <label className="gx-text-primary fw-bold me-1" style={{
              fontSize: 18
            }}>HN</label>
            <label style={{
              fontSize: 18
            }}>{patientInfo[0]?.hn}</label>
            {patientInfo[0]?.isVip === "1" && <label className="ms-1">
              <Icon icon={starFill} color="#ffea00" width="18" />
            </label>}
            {patientInfo[0]?.isPregnant === "1" && <label className="ms-1">
              <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
            </label>}
            {patientInfo[0]?.isConceled === "1" && <label className="ms-1">
              <Icon icon={handcuffsIcon} color="#d50000" width="18" />
            </label>}
            <label className="gx-text-primary fw-bold ms-2 me-1">ID</label>
            <label className="data-value">{patientInfo[0]?.idCard}</label>
            <label className="gx-text-primary fw-bold ms-2" style={{
              fontSize: 14,
              textAlign: "right",
              paddingRight: "0px"
            }}>เบอร์โทรศัพท์</label>
            <label className="data-value ms-1">
              {getContactInfo(patientInfo[0])}
            </label>
            <label className="ms-3 gx-text-primary" onClick={() => {
              setIsZhowModalTelephone(true);
            }}>
              <BsThreeDots style={threeDot} />
            </label>
            <UpdateMobile isZhow={isZhowModalTelephone} patientId={selectPatient?.patientId} afterUpdate={() => {
              setIsZhowModalTelephone(false);
              getPatientById(props.patient.admitId);
            }} afterClose={() => {
              setIsZhowModalTelephone(false);
            }} />
          </Col>
        </Row>
      </Col>
    </Row>
    <Row gutter={[4, 4]} align="middle">
      <Col span={2}>
        <label className="gx-text-primary fw-bold me-1" style={{
          fontSize: 18
        }}>
          AN
        </label>
      </Col>
      <Col span={6}>
        <Select
          style={{
            width: '100%'
          }}
          showSearch
          onChange={value => {
            dispatch(showPatient(admitList.find(val => val.admitId === value)));
          }}
          optionFilterProp="children"
          filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          options={admitList?.map(n => ({
            value: n.admitId,
            label: n.an
          }))}
          value={selectPatient?.admitId}
          bordered={false}
        />
      </Col>
      <Col span={16}>
        <label className="gx-text-primary fw-bold me-1">Admit</label>
        <label className="data-value">
          {patientInfo[0]?.newbornId ? patientInfo[0]?.birthdate : patientInfo[0]?.admitDate ? patientInfo[0]?.admitDate + (patientInfo[0]?.admitTime && " " + moment(patientInfo[0]?.admitTime, "HH:mm:ss").format("HH:mm")) : "-"}
        </label>
        <label className="gx-text-primary fw-bold ms-2 me-1">D/C</label>
        <label className="data-value">{patientInfo[0]?.dischDate || "-"}</label>
      </Col>
      <Col span={24}>
        <label className="gx-text-primary fw-bold me-1">แพทย์เจ้าของไข้</label>
        <label className="data-value">{patientInfo[0]?.feverDoctorName || "-"}</label>
      </Col>
      <Col span={24}>
        <label className="gx-text-primary fw-bold me-1">Ward</label>
        <label className="data-value">{patientInfo[0]?.wardName || "-"}</label>
        <label className="gx-text-primary fw-bold me-1 ms-2">เตียง</label>
        <label>{patientInfo[0]?.bedName || "-"}</label>
      </Col>
      {showComponent && <Col span={24} className="mt-2">
        <Checkbox disabled={!mainAdmitRightId} checked={allowedOpdFinance}
          onChange={async e => {
            setLoading(true);
            let checked = e.target.checked;
            setAllowedOpdFinance(checked);
            let admitDetails = await GetAdmitRight(mainAdmitRightId);
            if (!admitDetails?.length) return setLoading(false);
            admitDetails = admitDetails[0];
            let res = await UpdAdmitRight({
              opdFinance: checked ? "Y" : null,
              admitId: admitDetails?.admitId,
              "admitRightId": mainAdmitRightId,
              "patientId": admitDetails?.patientId,
              "runHn": admitDetails?.runHn,
              "yearHn": admitDetails?.yearHn,
              "hn": admitDetails?.hn,
              "AdmitId": admitDetails?.AdmitId,
              "rightId": admitDetails?.rightId,
              "insid": admitDetails?.insid || null,
              "mainFlag": "Y",
              "confirm": admitDetails?.confirm || null,
              "userConfirm": admitDetails?.userConfirm || null,
              "hmain": admitDetails?.hmain || null,
              "hsub": admitDetails?.hsub || null,
              "hmainOp": admitDetails?.hmainOp || null,
              "govcode": admitDetails?.govcode || null,
              "startDate": admitDetails?.startDate || null,
              "expireDate": admitDetails?.expireDate || null,
              "approvalDate": admitDetails?.approvalDate || null,
              "ownRightPid": admitDetails?.ownRightPid || null,
              "owner": admitDetails?.owner || null,
              "relinscl": admitDetails?.relinscl || null,
              "remark": admitDetails?.remark || null,
              "userCreated": admitDetails?.userCreated,
              "userModified": user,
              "limit": admitDetails?.limit || null
            });
            setLoading(false);
            notiX(res.isSuccess, "อัพเดตสิทธิ์ผู้ป่วยใน");
            if (!res.isSuccess) setAllowedOpdFinance(false);
          }}>
          <label className="gx-text-primary fw-bold">อนุญาตให้คีย์ค่าใช้จ่ายผู้ป่วยนอก</label>
        </Checkbox>
      </Col>}
    </Row>
    <Divider />
    {address === true && <Row align="middle">
      <Col span={22}>
        <label className="gx-text-primary fw-bold me-1">ที่อยู่</label>
        {patientInfo.length > 0 && <label className="data-value">
          เลขที่&nbsp;{patientInfo[0]?.addressNo}&nbsp;
          {patientInfo[0]?.tambon !== null && patientInfo[0]?.changwat === "กรุงเทพมหานคร" ? <>
            แขวง{patientInfo[0]?.tambon.replace("แขวง", "")}
          </> : <>
            ตำบล{patientInfo[0]?.tambon}
          </>}&nbsp;
          {patientInfo[0]?.amphur !== null && patientInfo[0]?.changwat === "กรุงเทพมหานคร" ? <>
            เขต{patientInfo[0]?.amphur.replace("เขต", "")}
          </> : <>
            อำเภอ{patientInfo[0]?.amphur}
          </>}&nbsp;
          {patientInfo[0]?.changwat}
        </label>}
      </Col>
      <Col span={2} className="text-end text-nowrap">
        <label className="gx-text-primary" onClick={() => {
          if (selectPatient) {
            getPatientAddress();
            setModalAddress(true);
          }
        }}>
          <BsThreeDots style={threeDot} />
        </label>
      </Col>
    </Row>}
    {/*โรคประจำตัว และ แพ้ยา*/}
    {drugAllergy === true && <div style={{
      width: "100%",
      padding: "6px",
      borderRadius: "4px",
      backgroundColor: "#FFFFFF",
      border: "1px solid #F0F0F0"
    }}>
      <Row>
        <Col span={21}>
          <label style={{
            fontSize: 16,
            color: "red"
          }}>
            Hx:
          </label>
          <label style={{
            fontSize: 16,
            color: "red"
          }}>
            {patientInfo[0]?.underlyingDisease}
          </label>
        </Col>
        <Col span={3} style={{
          borderRight: "1px solid #F0F0F0"
        }}>
          <Button style={{
            borderRadius: "5px"
          }} type="default" size="small" icon={<SmallDashOutlined />} onClick={() => {
            setModalHx(true);
            formHx.setFieldsValue({
              disease: patientInfo[0]?.underlyingDisease,
              disease_all: patientInfo[0]?.underlying_Diseases_Display
            });
          }} />
        </Col>
        <Col span={24}>
          <EllipsisDrugAllergy patientId={patientInfo[0]?.patientId} />
        </Col>
      </Row>
    </div>}
    {specialDetails === true && <div style={{
      width: "100%",
      padding: "6px",
      borderRadius: "4px",
      backgroundColor: "#FFFFFF",
      border: "1px solid #F0F0F0"
    }}>
      <Row>
        <Col span={4}>
          <label className="gx-text-primary">
            BW
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.weight ? "- Kg." : Intl.NumberFormat("en", {
              maximumFractionDigits: 0
            }).format(patientInfo[0]?.weight) + " Kg."}
          </label>&nbsp;
        </Col>
        <Col span={4}>
          <label className="gx-text-primary">
            Ht.
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.height ? "- cm." : Intl.NumberFormat("en", {
              maximumFractionDigits: 0
            }).format(patientInfo[0]?.height) + " cm."}
          </label>&nbsp;
        </Col>
        <Col span={4}>
          <label className="gx-text-primary">
            BP
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.systolicDiastolic ? "- mmHg." : Intl.NumberFormat("en", {
              maximumFractionDigits: 0
            }).format(patientInfo[0]?.systolicDiastolic) + " mmHg."}
          </label>&nbsp;
        </Col>
        <Col span={4}>
          <label className="gx-text-primary">
            BT
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.bodyTemperature ? "-  °C" : Intl.NumberFormat("en", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(patientInfo[0]?.bodyTemperature) + " °C"}
          </label>&nbsp;
        </Col>
        <Col span={3}>
          <label className="gx-text-primary">
            P
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.palse ? "- /min" : Intl.NumberFormat("en", {
              maximumFractionDigits: 0
            }).format(patientInfo[0]?.palse) + " /min"}
          </label>&nbsp;
        </Col>
        <Col span={3}>
          <label className="gx-text-primary">
            R
          </label>&nbsp;
          <label className="topic">
            {!patientInfo[0]?.respiratory ? "- /min" : Intl.NumberFormat("en", {
              maximumFractionDigits: 0
            }).format(patientInfo[0]?.respiratory) + " /min"}
          </label>&nbsp;
        </Col>
        <Col span={2}>
          <Button style={{
            borderRadius: "5px"
          }} type="default" size="small" icon={<SmallDashOutlined />} onClick={() => {
            setModalVS(true);
            formVS.setFieldsValue({
              bw: !patientInfo[0]?.weight ? "-" : Intl.NumberFormat("en", {
                maximumFractionDigits: 0
              }).format(patientInfo[0]?.weight),
              ht: !patientInfo[0]?.height ? "-" : Intl.NumberFormat("en", {
                maximumFractionDigits: 0
              }).format(patientInfo[0]?.height),
              bp: !patientInfo[0]?.systolicDiastolic ? "-" : Intl.NumberFormat("en", {
                maximumFractionDigits: 0
              }).format(patientInfo[0]?.systolicDiastolic),
              bt: !patientInfo[0]?.bodyTemperature ? "-" : Intl.NumberFormat("en", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(patientInfo[0]?.bodyTemperature),
              p: !patientInfo[0]?.palse ? "-" : Intl.NumberFormat("en", {
                maximumFractionDigits: 0
              }).format(patientInfo[0]?.palse),
              r: !patientInfo[0]?.respiratory ? "-" : Intl.NumberFormat("en", {
                maximumFractionDigits: 0
              }).format(patientInfo[0]?.respiratory)
            });
          }} />
        </Col>
      </Row>
    </div>}

    {/* modal Address */}
    <Modal visible={modalAddress} title="ที่อยู่" width="600px" onOk={() => setModalAddress(false)} onCancel={() => setModalAddress(false)} okButtonProps={{
      hidden: true
    }} cancelText="ปิด">
      <List itemLayout="horizontal" dataSource={patientAddress && patientAddress} renderItem={item => <List.Item>
        <List.Item.Meta title={<label className="gx-text-primary">{item.address_type}</label>} description={<>
          {item.addressNo !== null ? <>
            <label className="data-value">เลขที่</label>&nbsp;
            <label className="data-value">{item.addressNo}</label>
          </> : ""}
          &nbsp;
          {item.moo !== null ? <>
            <label className="data-value">หมู่</label>&nbsp;
            <label className="data-value">{item.moo}</label>
          </> : ""}
          &nbsp;
          {item.villaname !== null ? <>
            <label className="data-value">หมู่บ้าน</label>&nbsp;
            <label className="data-value">{item.villaname}</label>
          </> : ""}
          &nbsp;
          {item.soimain !== null ? <>
            <label className="data-value">ซอย</label>
            <label className="data-value">{item.soimain}</label>
          </> : ""}
          &nbsp;
          {item.soisub !== null ? <>
            <label className="data-value">แยก</label>&nbsp;
            <label className="data-value">{item.soisub}</label>
          </> : ""}
          &nbsp;
          {item.tambonName !== null && item.changwatName === "กรุงเทพมหานคร" ? <>
            <label className="data-value">แขวง</label>
            <label className="data-value">{item.tambonName.replace("แขวง", "")}</label>
          </> : <>
            <label className="data-value">ตำบล</label>
            <label className="data-value">{item.tambonName}</label>
          </>}
          &nbsp;
          {item.amphurName !== null && item.changwatName === "กรุงเทพมหานคร" ? <>
            <label className="data-value">เขต</label>
            <label className="data-value">{item.amphurName.replace("เขต", "")}</label>
          </> : <>
            <label className="data-value">อำเภอ</label>
            <label className="data-value">{item.amphurName}</label>
          </>}
          &nbsp;
          {item.changwatName !== null ? <>
            <label className="data-value">จังหวัด</label>
            <label className="data-value">{item.changwatName}</label>
          </> : ""}
        </>} />
      </List.Item>} />
    </Modal>
    {/* modal Hx */}

    <Modal visible={modalHx} title="โรคประจำตัว" width="800px" onOk={() => setModalHx(false)} onCancel={() => setModalHx(false)} okButtonProps={{
      hidden: true
    }} cancelText="ปิด">
      <Form name="Hx" form={formHx} layout="vertical" onFinish={onFinishHx}>
        <Form.Item name="disease" label="โรคประจำตัว">
          <TextArea rows={5} value={patientInfo[0]?.underlyingDisease} />
        </Form.Item>
      </Form>

    </Modal>

    {/* modal Drug Allergy */}
    <Modal visible={modalDrug} title="รายละเอียดการแพ้ยา" width="1200px" onOk={() => setModalDrug(false)} onCancel={() => {
      setModalDrug(false);
      formDrug.resetFields();
    }} okButtonProps={{
      hidden: true
    }} cancelText="ปิด">
      <Row align="middle">
        <Col span={3}>
          <Avatar size={90} src={<Image src={`data:image/jpeg;base64,${patientInfo[0]?.picture}`} />} />
        </Col>
        <Col span={21}>
          <Row>
            <Col span={24}>
              <label className="gx-text-primary" style={{
                fontSize: 18
              }}>{patientInfo[0]?.displayName}</label>
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={4}>
              <label style={{
                fontSize: 18
              }}> HN: {patientInfo[0]?.hn}</label>
            </Col>
            <Col span={4}>
              <label className="gx-text-primary" style={{
                fontSize: 18
              }}> อายุ </label>&nbsp;
              <label style={{
                fontSize: 18
              }}>{patientInfo[0]?.age}</label>
            </Col>
            <Col span={16}>
              <label className="gx-text-primary" style={{
                fontSize: 18
              }}>เบอร์โทรศัพท์ </label>&nbsp;
              <label style={{
                fontSize: 18
              }}>{patientInfo[0]?.mobile}</label>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={8} style={{
          borderRight: "1px solid #F0F0F0"
        }}>
          <Radio.Group value={radioValue} onChange={e => setRadioValue(e.target.value)}>
            <Radio value={true}><label style={{
              color: "red"
            }}> แพ้ยา</label> </Radio>
            <Radio value={false}><label style={{
              color: "red"
            }}>ไม่มีประวัติแพ้ยา</label> </Radio>
          </Radio.Group>
          <br />
          <br />
          <Form name="drug" form={formDrug} layout="vertical" onFinish={onFinishDrug}>
            <Form.Item name="drug1">
              <TextArea style={{
                overflowY: "scroll"
              }} rows={2} placeholder="ระบุรายละเอียด" disabled={radioValue === true ? false : true} />
            </Form.Item>
            <Form.Item name="drug2" label="แพ้อื่นๆ">
              <TextArea style={{
                overflowY: "scroll"
              }} rows={2} placeholder="ระบุรายละเอียด" />
            </Form.Item>
            <Form.Item name="drug3" label="ข้อมูลสำคัญทางคลีนิก">
              <TextArea style={{
                overflowY: "scroll"
              }} rows={2} placeholder="ระบุรายละเอียด" />
            </Form.Item>
            <Form.Item name="drug4" label="ข้อมูลสำคัญทางผ่าตัด">
              <TextArea style={{
                overflowY: "scroll"
              }} rows={2} placeholder="ระบุรายละเอียด" />
            </Form.Item>
          </Form>
        </Col>
        <Col span={8}>

        </Col>
        <Col span={8}>

        </Col>
      </Row>
    </Modal>
    {/* modal VS */}
    <Modal visible={modalVS} title="รายละเอียด V/S" width="800px" onOk={() => setModalVS(false)} onCancel={() => {
      setModalVS(false);
      formVS.resetFields();
    }} okButtonProps={{
      hidden: true
    }} cancelText="ปิด">
      <Form name="VS" form={formVS} layout="horizontal" onFinish={onFinishVS} labelCol={{
        span: 4
      }} wrapperCol={{
        span: 20
      }}>
        <Row gutter={[8, 8]}>
          <Col span={8}>

            <Form.Item label={<label className="gx-text-primary">BW</label>} style={{
              margin: "0px"
            }} name="bw">
              <Input disabled suffix="Kg." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={<label className="gx-text-primary">Ht.</label>} style={{
              margin: "0px"
            }} name="ht">
              <Input disabled suffix="cm." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={<label className="gx-text-primary">BP</label>} style={{
              margin: "0px"
            }} name="bp">
              <Input disabled suffix="mmHg." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={<label className="gx-text-primary">BT</label>} style={{
              margin: "0px"
            }} name="bt">
              <Input disabled suffix="°C" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={<label className="gx-text-primary">P</label>} style={{
              margin: "0px"
            }} name="p">
              <Input disabled suffix="/min" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={<label className="gx-text-primary">R</label>} style={{
              margin: "0px"
            }} name="r">
              <Input disabled suffix="/min" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

    </Modal>
    <EMessage isVisible={emessageVisible} onOk={() => setEMessageVisible(false)} onCancel={() => setEMessageVisible(false)} patientId={props?.patient?.patientId || null} />
  </Spin>;
}
const UpdAdmitRight = async requestData => {
  let res = await Axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/UpdAdmitRight`,
    method: "PUT",
    data: {
      requestData: requestData
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetAdmitRight = async admitRightId => {
  let res = await Axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitRight/${admitRightId}`,
    method: "GET"
    // data: {
    //     requestData: requestData,
    // },
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};