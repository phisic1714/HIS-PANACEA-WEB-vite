import { env } from '../../env.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Avatar, Image, Modal, Input, Divider, Grid, Typography, Button } from 'antd';
import Address from "../Modal/Address";
import { CgGenderMale, CgGenderFemale } from "react-icons/cg";
import { BsThreeDots } from "react-icons/bs";
import { RiQuestionAnswerLine } from "react-icons/ri";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PatientInfoHistory from "../Modal/PatientInfoHistory";
import { Icon } from '@iconify/react';
import backInTime from '@iconify/icons-entypo/back-in-time';
import handcuffsIcon from '@iconify/icons-mdi/handcuffs';
import pregnantWoman from '@iconify/icons-emojione-monotone/pregnant-woman';
import EMessage from '../Modal/EMessageAntdDatePicker.js';
import moment from 'moment';
import { HistoryOutlined } from '@ant-design/icons';
import EllipsisDrugAllergy from 'components/Drug/EllipsisDrugAllergy.js';
import ComponentHx from 'components/Drug/ComponentHx.js';
import dayjs from 'dayjs';
import { getContactInfo } from 'util/GeneralFuctions';

const {
    useBreakpoint
} = Grid;
const {
    Paragraph
} = Typography;
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
export default function IpdPatientInfo({
    patientId = null,
    admitId = null,
    type = null,
    page = null,
    returnPatientDetail = () => {
        console.log("AKA");
    }
}) {
    const screens = useBreakpoint();
    const [admitDetail, setAdmitDetail] = useState({});
    console.log(admitDetail);

    const [showModalPatientDetailEdit, setShowModalPatientDetailEdit] = useState(false);
    const [addressVisible, setAddressVisible] = useState(false);
    const [, setLoading] = useState(false);
    const [eMessageVisible, setEMessageVisible] = useState(false);
    const [modalTelephone, setModalTelephone] = useState(false);
    const [telephoneValue, setTelephoneValue] = useState(null);
    const [mobileValue, setMobileValue] = useState(null);
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
            // console.log(res.data.responseData)
            return res.data.responseData;
        }).catch(error => {
            return error;
        });
        console.log('res', res)
        const admitDateTime = res?.admitDate + " " + (res?.admitTime ? dayjs(res.admitTime, "HH:mm:ss").format("HH:mm") : "-")
        setAdmitDetail({
            ...res,
            admitDate: res?.admitDate ? dayjs(res.admitDate, "DD/MM/YYYY").subtract(543, "y").format("MM/DD/YYYY") : null,
            admitDateTime,
        });
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
    //   const handleChangeAN = admitId => {
    //     let patientData = {
    //       ...admitList.find(data => data.admitId === admitId)
    //     };
    //     dispatch(showPatient(patientData));
    //   };
    const calBMI = (weight, height) => {
        let w = weight ? +weight : 0;
        let h = height ? +height : 0;
        let bmi = (w / (h * h / 10000)).toFixed(2);
        return bmi;
    };
    useEffect(() => {
        if (patientId && admitId) {
            fetchPatientByAdmitId(patientId, admitId);
        } else {
            if (patientId) {
                fetchPatientAdmitDetail(patientId);
            } else setAdmitDetail({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, admitId]);
    const PersonalHistory = () => {
        return <>
            <div>
                {type === null && <>
                    {screens.lg === false ? <>
                        <Slider {...sliderSettings} className="gx-slick-slider">
                            <div>
                                <Row gutter={[2, 16]}>
                                    <Col span={4}>
                                        <div className="text-center mt-4">
                                            {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patients</Avatar>}
                                        </div>
                                    </Col>
                                    {/* AN HN */}
                                    <Col span={10}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={24}>
                                                <label className="topic-blue me-1">AN</label>
                                                <label className="me-2">{admitDetail?.an}</label>
                                                {/* <Select value={admitDetail.admitId} onSelect={handleChangeAN}>
                                                                    {admitList.map(admit => <Select.Option value={admit.admitId} other={admit}>{admit.an}</Select.Option>)}
                                                                 </Select> */}
                                                <label className="topic-blue me-1">HN</label>
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

                                                <label className="button-circle" onClick={() => setShowModalPatientDetailEdit(true)}>
                                                    <Icon icon={backInTime} color="green" />
                                                </label>
                                                <PatientInfoHistory showModalPatientDetailEdit={showModalPatientDetailEdit} closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)} patientId={patientId ? patientId : null} />


                                            </Col>
                                            <Col span={5} style={{
                                                textAlign: "right",
                                                paddingRight: "0px"
                                            }}>
                                                <label className="gx-text-primary">ที่อยู่</label>
                                            </Col>
                                            <Col span={19}>
                                                <div>
                                                    {admitDetail?.addressNo ? <label>
                                                        <label className="data-value pe-1">{admitDetail.addressNo}</label>
                                                    </label> : null}
                                                    {admitDetail?.tambon ? <label>
                                                        <label className="gx-text-primary ps-1">แขวง/ตำบล</label>
                                                        <label className="data-value ps-1">{admitDetail.tambon}</label>
                                                    </label> : null}
                                                    {admitDetail?.amphur ? <label>
                                                        <label className="data-value ps-1">{admitDetail.amphur}</label>
                                                    </label> : null}
                                                    {admitDetail?.changwat ? <label>
                                                        <label className="data-value ps-1 pe-1">{admitDetail.changwat}</label>
                                                    </label> : null}
                                                    <label className="gx-text-primary" onClick={() => setAddressVisible(true)}>
                                                        <BsThreeDots style={threeDot} />
                                                    </label>
                                                </div>
                                                <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                            </Col>
                                            <Col span={5} className="text-end">
                                                <label className="gx-text-primary">Admit</label>
                                            </Col>
                                            <Col span={19}>
                                                <label className="data-value ms-1">{admitDetail?.admitDateTime || '-'}</label>
                                            </Col>
                                        </Row>
                                    </Col>
                                    {/* Id Card */}
                                    <Col span={10}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={9} className="text-end">
                                                <label className="topic-blue">เลขบัตรประชาชน</label>
                                            </Col>
                                            <Col span={15}>
                                                <label className="data-value">{admitDetail?.idCard}</label>
                                            </Col>

                                            <Col span={4} className="text-end">
                                                <label className="gx-text-primary">อายุ</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitDetail?.age}</label>
                                            </Col>
                                            <Col span={4} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary">สัญชาติ</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitId ? admitDetail?.nationalityName : admitDetail?.nation}</label>
                                            </Col>
                                            <Col span={4} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary">ศาสนา</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitId ? admitDetail?.religionName : admitDetail?.religion}</label>
                                            </Col>
                                            <Col span={4} className="text-end">
                                                <label className="gx-text-primary">WARD</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value me-1">{admitDetail?.wardName || "-"}</label>
                                                <label className="gx-text-primary me-1">เตียง</label>
                                                <label className="data-value">{admitDetail?.bedName || "-"}</label>
                                            </Col>
                                        </Row>
                                    </Col>

                                </Row>
                            </div>
                            <div>
                                <Row gutter={[2, 16]}>
                                    <Col span={4}>
                                        <div className="text-center mt-4">
                                            {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patients</Avatar>}
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={24}>
                                                <label className="topic-blue me-1">AN</label>
                                                <label className="me-2">{admitDetail?.an}</label>
                                                <label className="topic-blue me-1">HN</label>
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

                                                <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                            </Col>
                                            <Col span={5} className="text-end">
                                                <label className="gx-text-primary">Admit</label>
                                            </Col>
                                            <Col span={19}>
                                                <label className="data-value ms-1">{admitDetail?.admitDateTime || '-'}</label>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={9} className="text-end">
                                                <label className="topic-blue">Passport</label>
                                            </Col>
                                            <Col span={15}>
                                                <label className="data-value">{admitDetail?.passport}</label>
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">สถานภาพสมรส</label>
                                            </Col>
                                            <Col span={6}>
                                                <label className="data-value">{admitId ? admitDetail?.maritalStatusName : admitDetail?.mstatus}</label>
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">อาชีพ</label>
                                            </Col>
                                            <Col span={6}>
                                                <label className="data-value">{admitId ? admitDetail?.occupationName : admitDetail?.occupation}</label>
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">เบอร์โทร</label>
                                            </Col>
                                            <Col span={6}>
                                                {admitDetail?.mobile !== undefined ? <label>
                                                    {admitDetail?.mobile ? <label className="data-value">{admitDetail?.mobile}</label> : <label className="data-value">{admitDetail?.telephone}</label>}
                                                    <label className="gx-text-primary" hidden={patientId ? false : true} onClick={() => {
                                                        setMobileValue(admitDetail?.mobile);
                                                        setTelephoneValue(admitDetail?.telephone);
                                                        setModalTelephone(true);
                                                    }}>
                                                        <BsThreeDots style={threeDot} />
                                                    </label>
                                                </label> : "-"}
                                                {/* modal edit telephone */}
                                                <Modal visible={modalTelephone} title={<label className="gx-text-primary-bold">แก้ไขเบอร์โทรติดต่อ</label>} width="400px" onOk={() => {
                                                    updatePatientPhone();
                                                }} onCancel={() => {
                                                    setModalTelephone(false);
                                                    setMobileValue(null);
                                                    setTelephoneValue(null);
                                                }} okText="บันทึก" cancelText="ปิด">
                                                    <Row align="middle">
                                                        <Col span={8} style={{
                                                            textAlign: "right"
                                                        }}>
                                                            <label className="gx-text-primary">เบอร์โทรศัพท์</label>
                                                        </Col>
                                                        <Col span={16}>
                                                            <Input placeholder="เบอร์โทรศัพท์" value={telephoneValue} onChange={e => setTelephoneValue(e.target.value)} />
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
                                                            <Input placeholder="เบอร์มือถือ" value={mobileValue} onChange={e => setMobileValue(e.target.value)} />
                                                        </Col>
                                                    </Row>
                                                </Modal>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </Slider>
                    </> : <Row gutter={[10, 8]} style={{
                        marginTop: -10
                    }}>
                        <Col span={4} lg={2} xl={2} xxl={2} className='text-center'>
                            {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patient</Avatar>}
                        </Col>
                        <Col span={20} lg={22} xl={22} xxl={22}>
                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <label className="gx-text-primary fw-bold" style={{
                                        fontSize: 18
                                    }}>AN</label>
                                    {/* <Select value={admitDetail.admitId} onSelect={handleChangeAN}>
                                                        {admitList.map(admit => <Select.Option value={admit.admitId} other={admit}>{admit.an}</Select.Option>)}
                                                     </Select> */}
                                    <label className='gx-text-primary ms-1' style={{
                                        fontSize: 18
                                    }}>{admitDetail?.an}</label>
                                    <label className="gx-text-primary fw-bold ms-2" style={{
                                        fontSize: 18
                                    }}>HN</label>
                                    <label className='gx-text-primary ms-1 me-1' style={{
                                        fontSize: 18
                                    }}>{admitDetail?.hn}</label>
                                    {admitDetail?.gender && <label>
                                        {admitDetail?.gender === "M" && <CgGenderMale style={{
                                            color: "blue"
                                        }} />}
                                        {admitDetail?.gender === "F" && <CgGenderFemale style={{
                                            color: "#FF4081"
                                        }} />}
                                    </label>}
                                    {admitDetail?.conceledFlag === "Y" && <label className="ms-1">
                                        <Icon icon={handcuffsIcon} color="#d50000" width="18" />
                                    </label>}
                                    {admitDetail?.pregnancyFlag === "P" && <label className="ms-1">
                                        <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
                                    </label>}
                                    <label className="gx-text-primary fw-bold ms-2" style={{
                                        fontSize: 18
                                    }}>{admitDetail?.displayName}</label>&nbsp;
                                    {admitDetail?.eDisplayName && <label className="gx-text-primary ms-1 me-2">({admitDetail?.eDisplayName})</label>}
                                    <Button size="small" shape="circle" icon={<HistoryOutlined className="gx-text-primary" />} onClick={() => setShowModalPatientDetailEdit(true)} style={{
                                        marginBottom: 6
                                    }} />
                                    <PatientInfoHistory showModalPatientDetailEdit={showModalPatientDetailEdit} closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)} patientId={patientId ? patientId : null} />
                                </Col>
                                <Col span={10}>
                                    <label className="gx-text-primary fw-bold">อายุ</label>
                                    <label className="gx-text-primary ms-1">{admitDetail?.age || "-"}</label>
                                    <label className="gx-text-primary fw-bold ms-3">บัตรประชาชน</label>
                                    <label className="gx-text-primary ms-1">{admitDetail?.idCard || "-"}</label>
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
                                    <label className="data-value ms-1">{admitDetail?.passport || "-"}</label>
                                    <label className="gx-text-primary fw-bold ms-2">สัญชาติ</label>
                                    <label className="data-value ms-1">{admitDetail?.nation || "-"}</label>
                                    <label className="gx-text-primary fw-bold ms-2">ศาสนา</label>
                                    <label className="data-value ms-1">{admitDetail?.religion || "-"}</label>
                                </Col>
                                <Col span={12}>
                                    <label className="gx-text-primary fw-bold">สถานะภาพ</label>
                                    <label className="data-value ms-1">{admitDetail?.mstatus || "-"}</label>
                                    <label className="gx-text-primary fw-bold ms-2">อาชีพ</label>
                                    <label className="data-value ms-1">{admitDetail?.occupation || "-"}</label>
                                    {/* {pathname === "/social welfare/social-welfare-patient-history" &&
                                                     <label>
                                                     <label className="gx-text-primary fw-bold ms-2">รายได้</label>
                                                     <label className="data-value ms-1">{admitDetail?.mstatus || "-"}</label>
                                                     </label>
                                                     } */}
                                    <label className="gx-text-primary fw-bold ms-2">เบอร์โทร</label>
                                    <label className="data-value ms-1">
                                        {admitDetail?.mobile === null ? admitDetail?.telephone : admitDetail?.mobile}
                                    </label>
                                    <label className="ms-3 gx-text-primary" onClick={() => {
                                        setMobileValue(admitDetail?.mobile);
                                        setTelephoneValue(admitDetail?.telephone);
                                        setModalTelephone(true);
                                    }}>
                                        <BsThreeDots style={threeDot} />
                                    </label>
                                    <Modal visible={modalTelephone} title={<label className="gx-text-primary fw-bold" style={{
                                        fontSize: 18
                                    }}>แก้ไขเบอร์โทรติดต่อ</label>} width={380} onOk={() => {
                                        updatePatientPhone();
                                    }} onCancel={() => {
                                        setModalTelephone(false);
                                        setMobileValue(null);
                                        setTelephoneValue(null);
                                    }} okText="บันทึก" cancelText="ปิด">
                                        <Row align="middle">
                                            <Col span={8} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary fw-bold">เบอร์โทรศัพท์</label>
                                            </Col>
                                            <Col span={16}>
                                                <Input placeholder="เบอร์โทรศัพท์" value={telephoneValue} onChange={e => setTelephoneValue(e.target.value)} />
                                            </Col>
                                        </Row>
                                        <br />
                                        <Row align="middle">
                                            <Col span={8} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary fw-bold">เบอร์มือถือ</label>
                                            </Col>
                                            <Col span={16}>
                                                <Input placeholder="เบอร์มือถือ" value={mobileValue} onChange={e => setMobileValue(e.target.value)} />
                                            </Col>
                                        </Row>
                                    </Modal>
                                </Col>
                            </Row>
                            <Row gutter={[8, 8]} className="mt-2">
                                <Col span={12}>
                                    <label className="gx-text-primary fw-bold">ที่อยู่</label>
                                    {admitDetail?.addressNo ? <label>
                                        <label className="data-value ms-1">{admitDetail.addressNo}</label>
                                    </label> : null}
                                    {admitDetail?.tambon ? <label>
                                        <label className="gx-text-primary ms-1">แขวง/ตำบล</label>
                                        <label className="data-value ms-1">{admitDetail.tambon}</label>
                                    </label> : null}
                                    {admitDetail?.amphur ? <label>
                                        <label className="data-value ms-1">{admitDetail.amphur}</label>
                                    </label> : null}
                                    {admitDetail?.changwat ? <label>
                                        <label className="data-value ms-1">{admitDetail.changwat}</label>
                                    </label> : null}
                                    <label className="gx-text-primary ms-1" onClick={() => setAddressVisible(true)}>
                                        <BsThreeDots style={threeDot} />
                                    </label>
                                    <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                </Col>
                                <Col span={12}>
                                    <label className="gx-text-primary fw-bold">Admit</label>
                                    <label className="data-value ms-1">
                                        {admitDetail?.admitDateTime || "-"}
                                    </label>
                                    <label className="gx-text-primary fw-bold ms-2">WARD</label>
                                    <label className="data-value ms-1">{admitDetail?.wardName || "-"}</label>
                                    <label className="gx-text-primary fw-bold ms-2">เตียง</label>
                                    <label className="data-value ms-1">{admitDetail?.bedName || "-"}</label>
                                </Col>
                            </Row>
                        </Col>
                    </Row>}
                </>}
            </div>
            <div>
                {type === "2" && <>
                    {screens.lg === false ? <>
                        <Slider {...sliderSettings} className="gx-slick-slider">
                            <div>
                                <Row gutter={[2, 16]}>
                                    <Col span={4}>
                                        <div className="text-center mt-4">
                                            {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patients</Avatar>}
                                        </div>
                                    </Col>
                                    {/* AN HN */}
                                    <Col span={10}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={6} className="text-end text-nowrap">
                                                <label className="topic-blue">AN</label>
                                                {/* <label>
                                                                 <AiOutlineStar style={{ color: "yellow" }} />
                                                                 <Icon icon="cil:pregnant" color="pink" />
                                                                 <Icon icon="si-glyph:handcuff" color="red" />
                                                                 </label> */}
                                            </Col>
                                            <Col span={18} className="text-nowrap">
                                                <label className="data-value me-2">{admitDetail?.an ? admitDetail?.an : "-"}</label>
                                                <label className="topic-blue me-1">HN</label>
                                                <label className="data-value">{admitDetail?.hn ? admitDetail?.hn : "-"}</label>
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">ชื่อ</label>
                                            </Col>
                                            <Col span={18}>
                                                <label className="data-value me-1">{admitDetail?.displayName ? admitDetail?.displayName : '-'}</label>
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

                                                <label className="button-circle" onClick={() => setShowModalPatientDetailEdit(true)}>
                                                    <Icon icon={backInTime} color="green" />
                                                </label>
                                                <PatientInfoHistory showModalPatientDetailEdit={showModalPatientDetailEdit} closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)} patientId={patientId ? patientId : null} />


                                            </Col>
                                            <Col span={6} style={{
                                                textAlign: "right",
                                                paddingRight: "0px"
                                            }}>
                                                <label className="gx-text-primary">ที่อยู่</label>
                                            </Col>
                                            <Col span={18}>
                                                <div>
                                                    {admitDetail?.addressNo ? <label>
                                                        <label className="data-value pe-1">{admitDetail.addressNo}</label>
                                                    </label> : null}
                                                    {admitDetail?.tambon ? <label>
                                                        <label className="gx-text-primary ps-1">แขวง/ตำบล</label>
                                                        <label className="data-value ps-1">{admitDetail.tambon}</label>
                                                    </label> : null}
                                                    {admitDetail?.amphur ? <label>
                                                        <label className="data-value ps-1">{admitDetail.amphur}</label>
                                                    </label> : null}
                                                    {admitDetail?.changwat ? <label>
                                                        <label className="data-value ps-1 pe-1">{admitDetail.changwat}</label>
                                                    </label> : null}
                                                    <label className="gx-text-primary" onClick={() => setAddressVisible(true)}>
                                                        <BsThreeDots style={threeDot} />
                                                    </label>
                                                </div>
                                                <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">Admit</label>
                                            </Col>
                                            <Col span={18}>
                                                <label className="data-value">{admitDetail?.admitDateTime || '-'}</label>
                                            </Col>
                                        </Row>
                                    </Col>
                                    {/* Id Card */}
                                    <Col span={10}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={9} className="text-end">
                                                <label className="topic-blue">เลขบัตร</label>
                                            </Col>
                                            <Col span={15}>
                                                <label className="data-value">{admitDetail?.idCard ? admitDetail?.idCard : "-"}</label>
                                            </Col>

                                            <Col span={4} className="text-end">
                                                <label className="gx-text-primary">อายุ</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitDetail?.age ? admitDetail?.age : '-'}</label>
                                            </Col>
                                            <Col span={4} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary">หมู่โลหิต</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitDetail?.bloodGroup ? admitDetail.bloodGroup : "-"}</label>
                                            </Col>
                                            <Col span={4} style={{
                                                textAlign: "right"
                                            }}>
                                                <label className="gx-text-primary">ศาสนา</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value">{admitDetail?.religionName ? admitDetail.religionName : "-"}</label>
                                            </Col>
                                            <Col span={4} className="text-end">
                                                <label className="gx-text-primary">WARD</label>
                                            </Col>
                                            <Col span={8}>
                                                <label className="data-value me-1">{admitDetail?.wardName || "-"}</label>
                                                <label className="gx-text-primary me-1">เตียง</label>
                                                <label className="data-value">{admitDetail?.bedName || "-"}</label>
                                            </Col>
                                        </Row>
                                    </Col>

                                </Row>
                            </div>
                            <div>
                                <Row gutter={[2, 16]}>
                                    <Col span={4}>
                                        <div className="text-center mt-4">
                                            {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patients</Avatar>}
                                        </div>
                                    </Col>
                                    {/* AN HN */}
                                    <Col span={8}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={6} className="text-end text-nowrap">
                                                <label className="topic-blue">AN</label>
                                                {/* <label>
                                                                 <AiOutlineStar style={{ color: "yellow" }} />
                                                                 <Icon icon="cil:pregnant" color="pink" />
                                                                 <Icon icon="si-glyph:handcuff" color="red" />
                                                                 </label> */}
                                            </Col>
                                            <Col span={18} className="text-nowrap">
                                                <label className="data-value me-2">{admitDetail?.an ? admitDetail?.an : "-"}</label>
                                                <label className="topic-blue me-1">HN</label>
                                                <label className="data-value">{admitDetail?.hn ? admitDetail?.hn : "-"}</label>
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">ชื่อ</label>
                                            </Col>
                                            <Col span={18}>
                                                <label className="data-value me-1">{admitDetail?.displayName ? admitDetail?.displayName : '-'}</label>
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

                                                <label className="button-circle" onClick={() => setShowModalPatientDetailEdit(true)}>
                                                    <Icon icon={backInTime} color="green" />
                                                </label>
                                                <PatientInfoHistory showModalPatientDetailEdit={showModalPatientDetailEdit} closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)} patientId={patientId ? patientId : null} />


                                            </Col>
                                            <Col span={6} style={{
                                                textAlign: "right",
                                                paddingRight: "0px"
                                            }}>
                                                <label className="gx-text-primary">ที่อยู่</label>
                                            </Col>
                                            <Col span={18}>
                                                <div>
                                                    {admitDetail?.addressNo ? <label>
                                                        <label className="data-value pe-1">{admitDetail.addressNo}</label>
                                                    </label> : null}
                                                    {admitDetail?.tambon ? <label>
                                                        <label className="gx-text-primary ps-1">แขวง/ตำบล</label>
                                                        <label className="data-value ps-1">{admitDetail.tambon}</label>
                                                    </label> : null}
                                                    {admitDetail?.amphur ? <label>
                                                        <label className="data-value ps-1">{admitDetail.amphur}</label>
                                                    </label> : null}
                                                    {admitDetail?.changwat ? <label>
                                                        <label className="data-value ps-1 pe-1">{admitDetail.changwat}</label>
                                                    </label> : null}
                                                    <label className="gx-text-primary" onClick={() => setAddressVisible(true)}>
                                                        <BsThreeDots style={threeDot} />
                                                    </label>
                                                </div>
                                                <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                            </Col>
                                            <Col span={6} className="text-end">
                                                <label className="gx-text-primary">Admit</label>
                                            </Col>
                                            <Col span={18}>
                                                <label className="data-value">{admitDetail?.admitDateTime || '-'}</label>
                                            </Col>
                                        </Row>
                                    </Col>
                                    {/* Passport */}
                                    <Col span={12}>
                                        <Row gutter={[8, 8]}>
                                            <Col span={7} className="text-end">
                                                <label className="topic-blue">Passport</label>
                                            </Col>
                                            <Col span={17}>
                                                <label className="data-value">{admitDetail?.passport ? admitDetail.passport : '-'}</label>
                                            </Col>
                                            <Col span={7} className="text-end">
                                                <label className="gx-text-primary">เบอร์โทร</label>
                                            </Col>
                                            <Col span={17}>
                                                {admitDetail?.mobile !== undefined ? <label>
                                                    {admitDetail?.mobile ? <label className="data-value">{admitDetail?.mobile}</label> : <label className="data-value">{admitDetail?.telephone}</label>}
                                                    <label className="gx-text-primary ms-1" hidden={patientId ? false : true} onClick={() => {
                                                        setMobileValue(admitDetail?.mobile);
                                                        setTelephoneValue(admitDetail?.telephone);
                                                        setModalTelephone(true);
                                                    }}>
                                                        <BsThreeDots style={threeDot} />
                                                    </label>
                                                </label> : "-"}
                                                {/* modal edit telephone */}
                                                <Modal visible={modalTelephone} title={<label className="gx-text-primary-bold">แก้ไขเบอร์โทรติดต่อ</label>} width="400px" onOk={() => {
                                                    updatePatientPhone();
                                                }} onCancel={() => {
                                                    setModalTelephone(false);
                                                    setMobileValue(null);
                                                    setTelephoneValue(null);
                                                }} okText="บันทึก" cancelText="ปิด">
                                                    <Row align="middle">
                                                        <Col span={8} style={{
                                                            textAlign: "right"
                                                        }}>
                                                            <label className="gx-text-primary">เบอร์โทรศัพท์</label>
                                                        </Col>
                                                        <Col span={16}>
                                                            <Input placeholder="เบอร์โทรศัพท์" value={telephoneValue} onChange={e => setTelephoneValue(e.target.value)} />
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
                                                            <Input placeholder="เบอร์มือถือ" value={mobileValue} onChange={e => setMobileValue(e.target.value)} />
                                                        </Col>
                                                    </Row>
                                                </Modal>
                                            </Col>
                                            <Col span={7} className="text-end">
                                                <label className="gx-text-primary">แพทย์</label>
                                            </Col>
                                            <Col span={17}>
                                                <label className="data-value">{admitDetail?.feverDoctorName ? admitDetail?.feverDoctorName : "-"}</label>
                                            </Col>
                                            <Col span={7} className="text-end">
                                                <label className="gx-text-primary">LOS</label>
                                            </Col>
                                            <Col span={17}>
                                                <label className="data-value me-1">
                                                    {admitDetail?.los ? admitDetail?.los === " วัน  ชม." ? "-" : admitDetail?.los : "-"}
                                                </label>
                                                <label className="gx-text-primary me-2">BMI</label>
                                                <label className="data-value me-2">{admitDetail?.weight && admitDetail?.height ? calBMI(admitDetail?.weight, admitDetail?.height) : "-"}
                                                </label>
                                                <label className="gx-text-primary">BW</label>
                                                <label className="data-value ms-1 me-1">{admitDetail?.weight ? Intl.NumberFormat('en', {
                                                    maximumFractionDigits: 2
                                                }).format(admitDetail?.weight) : "-"}
                                                </label>
                                                <label className="gx-text-primary">Ht.</label>
                                                <label className="data-value ms-1 me-1">{admitDetail?.height ? Intl.NumberFormat('en', {
                                                    maximumFractionDigits: 2
                                                }).format(admitDetail?.height) : "-"}
                                                </label>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </Slider>
                    </> : <div>
                        <Row gutter={[10, 8]} style={{
                            marginTop: -10
                        }}>
                            <Col span={4} lg={2} xl={2} xxl={2} className='text-center'>
                                {admitDetail?.picture ? <Avatar size={70} src={<Image src={`data:image/jpeg;base64,${admitDetail?.picture}`} />} /> : <Avatar size={70}>Patient</Avatar>}
                            </Col>
                            <Col span={20} lg={22} xl={22} xxl={22}>
                                <Row gutter={[8, 8]}>
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold" style={{
                                            fontSize: 18
                                        }}>AN</label>
                                        <label className='ms-1' style={{
                                            fontSize: 18
                                        }}>{admitDetail?.an}</label>
                                        <label className="gx-text-primary fw-bold ms-2" style={{
                                            fontSize: 18
                                        }}>HN</label>
                                        <label className='ms-1 me-1' style={{
                                            fontSize: 18
                                        }}>{admitDetail?.hn}</label>
                                        {admitDetail?.gender && <label>
                                            {admitDetail?.gender === "M" && <CgGenderMale style={{
                                                color: "blue",
                                                fontSize: 20
                                            }} />}
                                            {admitDetail?.gender === "F" && <CgGenderFemale style={{
                                                color: "#FF4081",
                                                fontSize: 20
                                            }} />}
                                        </label>}
                                        {admitDetail?.conceledFlag === "Y" && <label className="ms-1">
                                            <Icon icon={handcuffsIcon} color="#d50000" width="18" />
                                        </label>}
                                        {admitDetail?.pregnancyFlag === "P" && <label className="ms-1">
                                            <Icon icon={pregnantWoman} color="#e91e63" width="20" hFlip={true} />
                                        </label>}
                                        <label className="gx-text-primary fw-bold ms-2" style={{
                                            fontSize: 18
                                        }}>{admitDetail?.displayName}</label>&nbsp;
                                        {admitDetail?.eDisplayName && <label className="gx-text-primary ms-1 me-2">({admitDetail?.eDisplayName})</label>}
                                        <Button size="small" shape="circle" icon={<HistoryOutlined className="gx-text-primary" />} onClick={() => setShowModalPatientDetailEdit(true)} style={{
                                            marginBottom: 6
                                        }} />
                                        <PatientInfoHistory showModalPatientDetailEdit={showModalPatientDetailEdit} closeModalPatientDetailEdit={() => setShowModalPatientDetailEdit(false)} patientId={patientId ? patientId : null} />
                                    </Col>
                                    <Col span={10}>
                                        <label className="gx-text-primary fw-bold">อายุ</label>
                                        <label className="ms-1">{admitDetail?.age || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-3">บัตรประชาชน</label>
                                        <label className="ms-1">{admitDetail?.idCard || "-"}</label>
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
                                        <label className="data-value ms-1">{admitDetail?.passport || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-2">สัญชาติ</label>
                                        <label className="data-value ms-1">{admitDetail?.nation || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-2">ศาสนา</label>
                                        <label className="data-value ms-1">{admitDetail?.religion || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-2">หมู่โลหิต</label>
                                        <label className="data-value ms-1">{admitDetail?.displayBlood ? admitDetail.displayBlood : "-"}</label>
                                    </Col>
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold">สถานะภาพ</label>
                                        <label className="data-value ms-1">{admitDetail?.mstatus || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-2">อาชีพ</label>
                                        <label className="data-value ms-1">{admitDetail?.occupation || "-"}</label>
                                        {/* {pathname === "/social welfare/social-welfare-patient-history" &&
                                                         <label>
                                                         <label className="gx-text-primary fw-bold ms-2">รายได้</label>
                                                         <label className="data-value ms-1">{admitDetail?.mstatus || "-"}</label>
                                                         </label>
                                                         } */}
                                        <label className="gx-text-primary fw-bold ms-2">เบอร์โทร</label>
                                        <label className="data-value ms-1">
                                            {getContactInfo(admitDetail)}
                                        </label>
                                        <label className="ms-3 gx-text-primary" onClick={() => {
                                            setMobileValue(admitDetail?.mobile);
                                            setTelephoneValue(admitDetail?.telephone);
                                            setModalTelephone(true);
                                        }}>
                                            <BsThreeDots style={threeDot} />
                                        </label>
                                        <Modal visible={modalTelephone} title={<label className="gx-text-primary fw-bold" style={{
                                            fontSize: 18
                                        }}>แก้ไขเบอร์โทรติดต่อ</label>} width={380} onOk={() => {
                                            updatePatientPhone();
                                        }} onCancel={() => {
                                            setModalTelephone(false);
                                            setMobileValue(null);
                                            setTelephoneValue(null);
                                        }} okText="บันทึก" cancelText="ปิด">
                                            <Row gutter={[8, 8]} align="middle" style={{
                                                marginTop: -8,
                                                marginBottom: -8
                                            }}>
                                                <Col span={8} style={{
                                                    textAlign: "right"
                                                }}>
                                                    <label className="gx-text-primary fw-bold">เบอร์โทรศัพท์</label>
                                                </Col>
                                                <Col span={16}>
                                                    <Input placeholder="เบอร์โทรศัพท์" value={telephoneValue} onChange={e => setTelephoneValue(e.target.value)} />
                                                </Col>
                                                <Col span={8} style={{
                                                    textAlign: "right"
                                                }}>
                                                    <label className="gx-text-primary fw-bold">เบอร์มือถือ</label>
                                                </Col>
                                                <Col span={16}>
                                                    <Input placeholder="เบอร์มือถือ" value={mobileValue} onChange={e => setMobileValue(e.target.value)} />
                                                </Col>
                                            </Row>
                                        </Modal>
                                    </Col>
                                </Row>
                                <Row gutter={[8, 8]} className="mt-2">
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold">ที่อยู่</label>
                                        {admitDetail?.addressNo ? <label>
                                            <label className="data-value ms-1">{admitDetail.addressNo}</label>
                                        </label> : null}
                                        {admitDetail?.tambon ? <label>
                                            <label className="gx-text-primary ms-1">แขวง/ตำบล</label>
                                            <label className="data-value ms-1">{admitDetail.tambon}</label>
                                        </label> : null}
                                        {admitDetail?.amphur ? <label>
                                            <label className="data-value ms-1">{admitDetail.amphur}</label>
                                        </label> : null}
                                        {admitDetail?.changwat ? <label>
                                            <label className="data-value ms-1">{admitDetail.changwat}</label>
                                        </label> : null}
                                        <label className="gx-text-primary ms-1" onClick={() => setAddressVisible(true)}>
                                            <BsThreeDots style={threeDot} />
                                        </label>
                                        <Address isVisible={addressVisible} setModal={isVisible => setAddressVisible(isVisible)} patientDetail={admitDetail} />
                                    </Col>
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold">LOS</label>
                                        <label className="data-value ms-1">
                                            {admitDetail?.los ? admitDetail?.los === " วัน  ชม." ? "-" : admitDetail?.los : "-"}
                                        </label>
                                        <label className="gx-text-primary fw-bold ms-2">BMI</label>
                                        <label className="data-value ms-2 me-2">{admitDetail?.weight && admitDetail?.height ? calBMI(admitDetail?.weight, admitDetail?.height) : "-"}
                                        </label>
                                        <label className="gx-text-primary fw-bold">BW</label>
                                        <label className="data-value ms-1 me-1">{admitDetail?.weight ? Intl.NumberFormat('en', {
                                            maximumFractionDigits: 2
                                        }).format(admitDetail?.weight) : "-"}
                                        </label>
                                        <label className="gx-text-primary fw-bold">Ht.</label>
                                        <label className="data-value ms-1 me-1">{admitDetail?.height ? Intl.NumberFormat('en', {
                                            maximumFractionDigits: 2
                                        }).format(admitDetail?.height) : "-"}
                                        </label>
                                    </Col>
                                </Row>
                                <Row gutter={[8, 8]} className="mt-2">
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold">Admit</label>
                                        {/* <label className="data-value ms-1">{admitDetail?.admitDate ? admitDetail?.admitDate : null}</label> */}
                                        <label className="data-value ms-1">{admitDetail?.admitDateTime || '-'}</label>
                                        <label className="gx-text-primary fw-bold ms-2">WARD</label>
                                        <label className="data-value ms-1">{admitDetail?.wardName || "-"}</label>
                                        <label className="gx-text-primary fw-bold ms-2">เตียง</label>
                                        <label className="data-value ms-1">{admitDetail?.bedName || "-"}</label>
                                    </Col>
                                    <Col span={12}>
                                        <label className="gx-text-primary fw-bold">แพทย์</label>
                                        <label className="data-value ms-1">{admitDetail?.feverDoctorName || "-"}</label>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>}
                </>}
            </div>
        </>;
    };
    // console.log(admitDetail);
    console.log('patientId & admitId', patientId, admitId)


    return <div>
        <div>
            {PersonalHistory()}
        </div>
        <div className='mt-3' style={marginForDivider}>
            <Divider />
        </div>
        {/* Hx แพ้ยา */}
        <Row gutter={[8, 8]} style={{
            marginBottom: -16,
            marginTop: -8
        }}>
            {/* HX */}
            <Col span={24} xl={12}>
                <ComponentHx patientId={patientId} />
            </Col>
            {/* แพ้ยา */}
            <Col span={24} xl={12}>
                <EllipsisDrugAllergy patientId={patientId} />
            </Col>
        </Row>
        <EMessage isVisible={eMessageVisible} onOk={() => setEMessageVisible(false)} onCancel={() => setEMessageVisible(false)} patientId={patientId ? patientId : null} />
    </div>;
}