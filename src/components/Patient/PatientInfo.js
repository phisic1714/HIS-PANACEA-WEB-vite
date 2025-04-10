
import { env } from '../../env.js';
import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { Row, Col, Input, Avatar, Modal, Image, Divider, Card, Spin, Grid, Button, Form, Select } from 'antd';
import Address from '../Modal/Address';
// import PharmaceuticalDetail from '../Modal/PharmaceuticalDetail';
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PatientInfoHistory from "../Modal/PatientInfoHistory";
import { Icon } from '@iconify/react';
import handcuffsIcon from '@iconify/icons-mdi/handcuffs';
import pregnantWoman from '@iconify/icons-emojione-monotone/pregnant-woman';
import backInTime from '@iconify/icons-entypo/back-in-time';
import { useSelector } from "react-redux";
import EMessage from '../Modal/EMessageAntdDatePicker.js';
import { HistoryOutlined } from '@ant-design/icons';
import { RiQuestionAnswerLine } from "react-icons/ri";
import { notificationX as notiX } from "../Notification/notificationX";
import { find } from "lodash";
import VipStatus from 'components/VipStatus/VipStatus.js';
import EllipsisDrugAllergy from "components/Drug/EllipsisDrugAllergy";
import ComponentHx from 'components/Drug/ComponentHx.js';
import { getContactInfo } from "util/GeneralFuctions";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

const {
  useBreakpoint
} = Grid;
const threeDot = {
  backgroundColor: "#ECEFF1",
  width: "26px",
  height: "12px",
  borderRadius: "50px",
  boxShadow: "0 1px 1px 0 #CFD8DC",
  alignItems: "center",
  cursor: "pointer"
};
const marginForDivider = {
  marginLeft: "-24px",
  marginRight: "-24px"
};
const sliderSettings = {
  arrows: true,
  dots: false,
  infinite: true,
  speed: 500,
  marginLeft: 10,
  marginRight: 10,
  slidesToShow: 1,
  slidesToScroll: 1
};
export default function PatientInfo({
  setPatientById,
  patientReload = 0,
  mainConceledFlag,
  returnPatientDetail = () => { console.log(""); },
  page = null,
  rowData = [],
  returnDrugAllergyDetails = () => { },
  styleCard = {},
  reloadHxDrug = () => { },
  ...props
}) {
  const { Option } = Select;

  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { pathname } = useSelector(({ common }) => common);
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const [modalTelephone, setModalTelephone] = useState(false);
  const [addressVisible, setAddressVisible] = useState(false);
  const [hxVisible, setHxVisible] = useState(false);
  const [showModalPatientDetailEdit, setShowModalPatientDetailEdit] = useState(false);
  const [reload, setReload] = useState(false);
  const [patientInfo, setPatientInfo] = useState([]);
  const [, setPatientAddress] = useState([]);
  const [telephoneValue, setTelephoneValue] = useState(null);
  const [mobileValue, setMobileValue] = useState(null);
  const [bedDetail, setBedDetail] = useState({});
  const [address, setAddress] = useState([]);
  const [eMessageVisible, setEMessageVisible] = useState(false);
  const [, setVipRank] = useState(true)
  const [disabledSave, setDisabledSave] = useState(true)

  const chkAddress = list => {
    if (!list?.length) return setAddress(null);
    let findAddressType2 = find(list, ["addressType", "2"]);
    let findAddressType5 = find(list, ["addressType", "5"]);
    let findAddressType1 = find(list, ["addressType", "1"]);
    setAddress(findAddressType2 || findAddressType5 || findAddressType1 || list[0]);
  };

  const selectAfter = (
    <Form.Item name="socialEconomicType" noStyle>
      <Select defaultValue="/เดือน" style={{ width: 80 }} >
        <Option value="D">/วัน</Option>
        <Option value="M">/เดือน</Option>
        <Option value="Y">/ปี</Option>
      </Select>
    </Form.Item>
  )

  const getPatientById = async () => {
    setLoading(true);
    await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` + props.patient_id).then(res => {
      if (typeof props.setGender === 'function') {
        props.setGender(res.data.responseData.gender);
      }
      setLoading(false);
      setPatientInfo([res.data.responseData]);
      if (res.data.responseData) {
        setVipRank(false)
      }
      chkAddress(res?.data?.responseData?.listAddress || []);
      props.onSetList && props.onSetList(res.data.responseData);
      returnPatientDetail(res.data.responseData);
      setPatientById(res.data.responseData)
      props.setPatientInfo && props.setPatientInfo(res.data.responseData);
      props.setHn && props.setHn(res.data.responseData.hn);
    }).catch(error => {
      return error;
    });
    setLoading(false);
    setReload(false);
  };

  const updatePatientPhone = async () => {
    setEditLoading(true);
    await Axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/UpdPatients_Phone`,
      method: "PUT",
      data: {
        requestData: {
          patientId: props.patient_id,
          telephone: telephoneValue ? telephoneValue : null,
          mobile: mobileValue ? mobileValue : null,
          userModified: user
        }
      }
    }).then(() => {
      setModalTelephone(false);
      setEditLoading(false);
      getPatientById();
    }).catch(() => {
      setEditLoading(false);
      setModalTelephone(false);
    });
  };

  const getBed = async () => {
    await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientBedByPatientId/` + props.patient_id).then(res => {
      setBedDetail(res.data.responseData ? res.data.responseData : {});
      props.setClinicId(res.data.responseData.workId);
    }).catch(error => {
      return error;
    });
  };

  const [listOccupation, setListOccupation] = useState([]);
  const [isVisibleOccupation, setIsVisibleoccupation] = useState(false);
  const [isVisibleSocialEconomic, setIsVisibleSocialEconomic] = useState(false);

  const updatePatient = async (field, value, socialEconomicType) => {
    setEditLoading(true);
    let req = await GetPatientsByID(props?.patient_id);
    // console.log(req);
    switch (field) {
      case "occupation":
        req.occupationId = value;
        break;
      case "socialEconomic":
        req.socialEconomic = value;
        req.socialEconomicType = socialEconomicType;
        break;
      default:
        break;
    }
    let res = await UpdPatients(req);
    notiX(res?.isSuccess, "อัพเดตข้อมูลผู้ป่วย");
    setEditLoading(false);
    if (res?.isSuccess) {
      setIsVisibleoccupation(false);
      setIsVisibleSocialEconomic(false);
      getPatientById();
    }
  };

  const [occupationForm] = Form.useForm();
  const onFinishOccupation = v => {
    updatePatient("occupation", v?.occupation);
  };
  const [socialEconomicForm] = Form.useForm();
  const onFinishSocialEconomic = v => {
    updatePatient("socialEconomic", v?.socialEconomic, v?.socialEconomicType);
  };

  const getOccupations = async () => {
    if (isVisibleOccupation && !listOccupation?.length) {
      let res = await GetOccupations();
      let mapping = res.map(o => {
        let label = `${o.datavalue} ${o.datadisplay}`;
        return {
          ...o,
          value: o.datavalue,
          label: label,
          className: "data-value"
        };
      });
      setListOccupation(mapping);
    }
  };

  const chkHosParam = () => {
    const regTelEdit = hosParam?.regTelEdit
    if (!regTelEdit) return setDisabledSave(false)
    if (page !== "2.2") setDisabledSave(true)
  }

  const handleReturnDrugAllergyDetails = useCallback((value) => {
    returnDrugAllergyDetails(value)
  }, [])

  useEffect(() => {
    chkHosParam()
  }, [hosParam, page])

  useEffect(() => {
    getOccupations();
  }, [isVisibleOccupation]);

  useEffect(() => {
    if (props.patient_id !== null) {
      getPatientById();
      getBed();
    } else {
      setPatientInfo([]);
      setPatientAddress([]);
      setBedDetail({});
    }
  }, [props.patient_id]);

  useEffect(() => {
    if (reload) {
      getPatientById();
    }

    if (patientReload > 0) {
      getPatientById();
    }
  }, [reload, patientReload]);

  return <Card style={styleCard}>
    <Spin spinning={loading}>
      {screens.lg === false ? <>
        <Slider {...sliderSettings} className="gx-slick-slider">
          <div>
            <Row>
              <Col span={4}>
                {patientInfo[0]?.picture ? <Avatar size={80} src={<Image src={`data:image/jpeg;base64,${patientInfo[0].picture}`} />} /> : <Avatar size={80}>Patient</Avatar>}
              </Col>
              <Col span={10}>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={5} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label style={{
                      fontSize: 14,
                      color: "#1A73E8"
                    }}>HN</label>
                  </Col>
                  <Col span={19}>
                    <label className='data-value'>{patientInfo[0]?.hn}</label>
                    {(mainConceledFlag === "Y" || patientInfo[0]?.conceledFlag === "Y") && <label className="ms-1">
                      <Icon icon={handcuffsIcon} color="#d50000" width="18" />
                    </label>}
                    {patientInfo[0]?.pregnancyFlag === "P" && <label className="ms-1">
                      <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
                    </label>}
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }} xl={7}>
                  <Col span={5} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">ชื่อ</label>
                  </Col>
                  <Col span={19}>
                    <label className="data-value">{patientInfo[0]?.displayName}</label>&nbsp;
                    {patientInfo[0]?.gender === "F" ? <IoMdFemale style={{
                      color: "#EC407A"
                    }} /> : <IoMdMale style={{
                      color: "blue"
                    }} />}

                    <br />
                    <label className="data-value">{patientInfo[0]?.eDisplayName}</label>
                    <label className="button-circle" onClick={() => setShowModalPatientDetailEdit(true)}>
                      <Icon icon={backInTime} color="green" />
                    </label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={5} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">ที่อยู่</label>
                  </Col>
                  <Col span={19}>
                    <div>
                      {patientInfo[0]?.addressNo ? <label>
                        <label className="data-value pe-1">{patientInfo[0].addressNo}</label>
                      </label> : null}
                      {patientInfo[0]?.tambon ? <label>
                        <label className="gx-text-primary ps-1">แขวง/ตำบล</label>
                        <label className="data-value ps-1">{patientInfo[0].tambon}</label>
                      </label> : null}
                      {patientInfo[0]?.amphur ? <label>
                        <label className="data-value ps-1">{patientInfo[0].amphur}</label>
                      </label> : null}
                      {patientInfo[0]?.changwat ? <label>
                        <label className="data-value ps-1 pe-1">{patientInfo[0].changwat}</label>
                      </label> : null}
                      <label className="gx-text-primary" onClick={() => setAddressVisible(true)}>
                        <BsThreeDots style={threeDot} />
                      </label>
                    </div>
                    <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={patientInfo[0]} />
                  </Col>
                </Row>
              </Col>
              <Col span={10}>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={24}>
                    <label style={{
                      fontSize: 14,
                      color: "#1A73E8"
                    }}>
                      เลขบัตรประชาชน
                    </label>
                    <label className='data-value ms-2'>
                      {patientInfo[0]?.idCard}
                    </label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={8} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">อายุ</label>
                  </Col>
                  <Col span={16}>
                    <label className="data-value">{patientInfo[0]?.age}</label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={8} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">สัญชาติ</label>
                  </Col>
                  <Col span={16}>
                    <label className="data-value">{patientInfo[0]?.nation}</label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={8} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">ศาสนา</label>
                  </Col>
                  <Col span={16}>
                    <label className="data-value">{patientInfo[0]?.religion}</label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={8} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">กรุ๊ปเลือด</label>
                  </Col>
                  <Col span={16}>
                    <label className="data-value">{patientInfo[0]?.bloodGroupName}</label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={8} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">เตียง</label>
                  </Col>
                  <Col span={16} className="text-nowrap">
                    {bedDetail.bedName ? <label className="data-value">{bedDetail.bedName}</label> : "-"}

                    {bedDetail.bedGroup ? <label className="data-value ms-1">({bedDetail.bedGroupName})</label> : ""}
                    {bedDetail.buildingId ? <label className="data-value ms-1">{bedDetail.buildingName}</label> : ""}
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          <div>
            <Row>
              <Col span={4}>
                {patientInfo[0]?.picture ? <Avatar size={80} src={<Image src={`data:image/jpeg;base64,${patientInfo[0].picture}`} />} /> : <Avatar size={80}>Patient</Avatar>}
              </Col>
              <Col span={20}>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={6} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label style={{
                      fontSize: 14,
                      color: "#1A73E8"
                    }}>Passport</label>
                  </Col>
                  <Col span={18}>
                    <label className='data-value'>
                      {patientInfo[0]?.passport}
                    </label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={6} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">สถานะภาพสมรส</label>
                  </Col>
                  <Col span={18}>
                    <label className="data-value">{patientInfo[0]?.mstatus}</label>
                  </Col>
                </Row>
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={6} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">อาชีพ</label>
                  </Col>
                  <Col span={18}>
                    <label className="data-value">{patientInfo[0]?.occupation}</label>
                  </Col>
                </Row>
                {pathname === "/social welfare/social-welfare-patient-history" && <Row style={{
                  padding: "6px 0px 6px 0px"
                }}>
                  <Col span={6} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">รายได้</label>
                  </Col>
                  <Col span={18}>
                    <label className="data-value">{patientInfo[0]?.socialEconomic || "-"}</label>
                  </Col>
                </Row>}
                <Row style={{
                  padding: "6px 0px 6px 0px"
                }} align="middle">
                  <Col span={6} style={{
                    textAlign: "right",
                    paddingRight: "0px"
                  }}>
                    <label className="gx-text-primary">เบอร์โทร</label>
                  </Col>
                  <Col span={18}>
                    <label className="data-value">
                      {patientInfo[0]?.mobile === null ? patientInfo[0]?.telephone : patientInfo[0]?.mobile}
                    </label>
                    <label className="ms-3 gx-text-primary" onClick={() => {
                      setMobileValue(patientInfo[0]?.mobile);
                      setTelephoneValue(patientInfo[0]?.telephone);
                      setModalTelephone(true);
                    }}>
                      <BsThreeDots style={threeDot} />
                    </label>
                  </Col>


                </Row>
              </Col>
            </Row>
          </div>
        </Slider>
        <div hidden={props?.page ? props?.page === "4" : false} style={marginForDivider}>
          <Divider />
        </div>
        <Row hidden={props?.page ? props?.page === "4" : false} gutter={[8, 16]}>
          <Col span={24} xl={12}>
            <ComponentHx
              patientId={props.patient_id}
              reloadHxDrug={() => reloadHxDrug()}
            />
          </Col>
          <Col span={24} xl={12}>
            <EllipsisDrugAllergy patientId={props.patient_id} returnDrugAllergyDetails={handleReturnDrugAllergyDetails} />
          </Col>
        </Row>
      </> : <>
        <Row gutter={[10, 8]} style={{
          marginTop: -10
        }}>
          <Col span={4} lg={2} xl={2} xxl={2} className='text-center'>
            {patientInfo[0]?.picture ? <Avatar size={70}
              src={<Image src={`data:image/jpeg;base64,${patientInfo[0].picture}`} />} /> : <Avatar size={70}>Patient</Avatar>}
          </Col>
          <Col span={20} lg={22} xl={22} xxl={22}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <label className="gx-text-primary fw-bold" style={{
                  fontSize: 18
                }}>HN</label>
                <label className='gx-text-primary ms-1 me-1' style={{
                  fontSize: 18
                }}>{patientInfo[0]?.hn}</label>
                {page === "12.7" ? <>
                  {!props.setAn ? null : <>
                    <label className="gx-text-primary fw-bold" style={{
                      fontSize: 18
                    }}>AN</label>
                    <label className='gx-text-primary ms-1 me-1' style={{
                      fontSize: 18
                    }}>{props?.setAn}</label>
                  </>}
                </> : ""}
                {patientInfo[0]?.gender === "F" ? <IoMdFemale style={{
                  color: "#EC407A"
                }} /> : <IoMdMale style={{
                  color: "blue"
                }} />}
                {(mainConceledFlag === "Y" || patientInfo[0]?.conceledFlag === "Y" || (rowData.length > 0 && rowData[0]?.conceledFlag === "Y" ? true : false)) && <label className="ms-1">
                  <Icon icon={handcuffsIcon} color="#d50000" width="18" />
                </label>}
                {patientInfo[0]?.pregnancyFlag === "P" && <label className="ms-1">
                  <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
                </label>}
                <label className="gx-text-primary fw-bold ms-2" style={{
                  fontSize: 18
                }}>{patientInfo[0]?.displayName}</label>&nbsp;
                {patientInfo[0]?.eDisplayName && <label className="gx-text-primary ms-1 me-2">({patientInfo[0]?.eDisplayName})</label>}
                <Button size="small" shape="circle" icon={<HistoryOutlined className="gx-text-primary" />} onClick={() => setShowModalPatientDetailEdit(true)} style={{
                  marginBottom: 6
                }} />
                <VipStatus patientId={patientInfo[0]?.patientId} />
              </Col>

              <Col span={10}>
                <label className="gx-text-primary fw-bold">อายุ</label>
                <label className="gx-text-primary ms-1">{patientInfo[0]?.age || "-"}</label>
                <label className="gx-text-primary fw-bold ms-3">บัตรประชาชน</label>
                <label className="gx-text-primary ms-1">{patientInfo[0]?.idCard || "-"}</label>
              </Col>
              <Col span={2} className="text-end text-nowrap">
                <Button size="small" icon={<RiQuestionAnswerLine className="gx-text-primary" />} onClick={() => setEMessageVisible(true)} />
              </Col>
            </Row>
            <Row gutter={[8, 8]} style={{
              marginTop: -8
            }}>
              <Col span={12}>
                <label className="gx-text-primary fw-bold">Passport</label>
                <label className="data-value ms-1">{patientInfo[0]?.passport || "-"}</label>
                <label className="gx-text-primary fw-bold ms-2">สัญชาติ</label>
                <label className="data-value ms-1">{patientInfo[0]?.nation || "-"}</label>
                <label className="gx-text-primary fw-bold ms-2">ศาสนา</label>
                <label className="data-value ms-1">{patientInfo[0]?.religion || "-"}</label>
                <label className="gx-text-primary fw-bold ms-2">กรุ๊ปเลือด</label>
                <label className="data-value ms-1">{patientInfo[0]?.bloodGroupName || "-"}</label>
              </Col>
              <Col span={12}>
                <label className="gx-text-primary fw-bold">สถานะภาพ</label>
                <label className="data-value ms-1">{patientInfo[0]?.mstatus || "-"}</label>
                <label className="gx-text-primary fw-bold ms-2">อาชีพ</label>
                <label className="data-value ms-1">{patientInfo[0]?.occupation || "-"}</label>
                <label className="ms-3 gx-text-primary" onClick={() => {
                  if (!props.patient_id) return notiX(false, "กรุณาเลือกผู้ป่วย", " ");
                  occupationForm.setFieldsValue({
                    occupation: patientInfo[0]?.occupation || null
                  });
                  setIsVisibleoccupation(true);
                }}>
                  <BsThreeDots style={threeDot} />
                </label>
                {pathname === "/social welfare/social-welfare-patient-history" && <label>
                  <label className="gx-text-primary fw-bold ms-2">รายได้</label>
                  <label className="data-value ms-1">{patientInfo[0]?.socialEconomic || "-"}</label>
                  <label className="ms-3 gx-text-primary" onClick={() => {
                    if (!props.patient_id) return notiX(false, "กรุณาเลือกผู้ป่วย", " ");
                    socialEconomicForm.setFieldsValue({
                      socialEconomic: patientInfo[0]?.socialEconomic || null,
                      socialEconomicType: patientInfo[0]?.socialEconomicType || null,
                    });
                    setIsVisibleSocialEconomic(true);
                  }}>
                    <BsThreeDots style={threeDot} />
                  </label>
                </label>}
              </Col>
            </Row>
            <Row gutter={[8, 8]} className="mt-2">
              <Col span={12}>
                <label className="gx-text-primary fw-bold">ที่อยู่</label>
                {address?.addressNo ? <label>
                  <label className="data-value ms-1">{address?.addressNo}</label>
                </label> : null}
                {address?.tambon ? <label>
                  <label className="gx-text-primary ms-1">แขวง/ตำบล</label>
                  <label className="data-value ms-1">{address?.tambonName}</label>
                </label> : null}
                {address?.amphur ? <label>
                  <label className="data-value ms-1">{address?.amphurName}</label>
                </label> : null}
                {address?.changwat ? <label>
                  <label className="data-value ms-1">{address?.changwatName}</label>
                </label> : null}
                <label className="gx-text-primary ms-1" onClick={() => setAddressVisible(true)}>
                  <BsThreeDots style={threeDot} />
                </label>
                <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={patientInfo[0]} />
              </Col>
              <Col span={12}>
                <label className="gx-text-primary fw-bold">เบอร์โทร</label>
                <label className="data-value ms-1">
                  {getContactInfo(patientInfo[0])}
                  {/* {patientInfo[0]?.mobile === null ? patientInfo[0]?.telephone : patientInfo[0]?.mobile} */}
                </label>
                <label className="ms-3 gx-text-primary" onClick={() => {
                  if (!props.patient_id) return notiX(false, "กรุณาเลือกผู้ป่วย", " ");
                  setMobileValue(patientInfo[0]?.mobile);
                  setTelephoneValue(patientInfo[0]?.telephone);
                  setModalTelephone(true);
                }}>
                  <BsThreeDots style={threeDot} />
                </label>
                <label className="gx-text-primary fw-bold ms-2">เตียง</label>
                {bedDetail.bedName ? <label className="data-value ms-1">{bedDetail.bedName || "-"}</label> : "-"}
                {bedDetail.bedGroup ? <label className="data-value ms-1">({bedDetail.bedGroupName})</label> : ""}
                {bedDetail.buildingId ? <label className="data-value ms-1">{bedDetail.buildingName}</label> : ""}
              </Col>
            </Row>
            {page === "7.9" ? <Row gutter={[8, 8]} className="mt-2">
              <Col span={24}>
                <label className="gx-text-primary fw-bold">ผู้นำส่ง</label>
                <label className="data-value ms-1">{patientInfo[0]?.contactName || "-"}</label>
                <label className="gx-text-primary fw-bold ms-2">เบอร์โทร</label>
                <label className="data-value ms-1">
                  {patientInfo[0]?.contactTelephone ? patientInfo[0]?.contactTelephone : patientInfo[0]?.contactMobile || "-"}
                </label>
              </Col>
            </Row> : ""}
          </Col>
        </Row>
        {props?.hideFooter ? <></> : <div style={marginForDivider}>
          <Divider />
        </div>}
        {props?.hideFooter ? <></> : <Row gutter={[8, 8]} style={{
          marginBottom: -18,
          marginTop: -4
        }}>
          <Col span={24} xl={12}>
            <ComponentHx patientId={props.patient_id} />
          </Col>
          <Col span={24} xl={12}>
            <EllipsisDrugAllergy patientId={props.patient_id} returnDrugAllergyDetails={handleReturnDrugAllergyDetails} />
          </Col>
        </Row>}
      </>}
    </Spin>
    <Modal
      visible={modalTelephone}
      confirmLoading={editLoading}
      title={<label className="gx-text-primary fw-bold fs-5">แก้ไขเบอร์โทรติดต่อ</label>}
      width={400}
      onOk={() => {
        updatePatientPhone();
      }}
      onCancel={() => {
        setModalTelephone(false);
        setMobileValue(null);
        setTelephoneValue(null);
      }}
      okText="บันทึก"
      cancelText="ปิด"
      centered
      okButtonProps={{
        disabled: disabledSave
      }}
    >
      <Row gutter={[8, 8]} style={{
        marginTop: -14,
        marginBottom: -14
      }} align="middle">
        <Col span={8} style={{
          textAlign: "right"
        }}>
          <label className="gx-text-primary fw-bold">เบอร์โทรศัพท์</label>
        </Col>
        <Col span={16}>
          <Input
            disabled={disabledSave}
            placeholder="เบอร์โทรศัพท์"
            value={telephoneValue}
            onChange={e => setTelephoneValue(e.target.value)}
          />
        </Col>
        <Col span={8} style={{
          textAlign: "right"
        }}>
          <label className="gx-text-primary fw-bold">เบอร์มือถือ</label>
        </Col>
        <Col span={16}>
          <Input
            disabled={disabledSave}
            placeholder="เบอร์มือถือ"
            value={mobileValue}
            onChange={e => setMobileValue(e.target.value)}
          />
        </Col>
      </Row>
    </Modal>
    <Modal visible={isVisibleOccupation} confirmLoading={editLoading} title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>แก้ไขอาชีพ</label>} width={400} onOk={() => {
      occupationForm.submit();
    }} onCancel={() => {
      setIsVisibleoccupation(false);
    }} okText="บันทึก" cancelText="ปิด" centered>
      <div style={{
        width: "100%"
      }}>
        <Form form={occupationForm} onFinish={onFinishOccupation} layout='vertical'>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Form.Item name="occupation" label={<label className='gx-text-primary fw-bold'>ระบุอาชีพ</label>}>
                <Select style={{
                  width: "100%"
                }} showSearch allowClear options={listOccupation} optionFilterProp='label' className='data-value' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
    <Modal visible={isVisibleSocialEconomic} confirmLoading={editLoading} title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>แก้ไขรายได้</label>} width={400} onOk={() => {
      socialEconomicForm.submit();
    }} onCancel={() => {
      setIsVisibleSocialEconomic(false);
    }} okText="บันทึก" cancelText="ปิด" centered>
      <Form form={socialEconomicForm} onFinish={onFinishSocialEconomic} layout='vertical'>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Form.Item name="socialEconomic" label={<label className='gx-text-primary fw-bold'>ระบุรายได้</label>}>
              <Input addonAfter={selectAfter} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
    <PatientInfoHistory
      showModalPatientDetailEdit={showModalPatientDetailEdit}
      closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)}
      patientId={props.patient_id || null}
    />
    <EMessage isVisible={eMessageVisible} onOk={() => setEMessageVisible(false)} onCancel={() => setEMessageVisible(false)} patientId={props?.patient_id ? props.patient_id : null} />
  </Card>;
}

const GetPatientsByID = async patientId => {
  let res = await Axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsByID/${patientId}`,
    method: "GET"
    // data: req
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

const UpdPatients = async req => {
  let res = await Axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/UpdPatients`,
    method: "PUT",
    data: {
      requestData: req
    }
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

const GetOccupations = async () => {
  let res = await Axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetOccupations`,
    method: "POST"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};