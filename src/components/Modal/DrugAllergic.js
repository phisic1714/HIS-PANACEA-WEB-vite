import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Row, Col, Button, Table, Modal, Spin, Checkbox, Radio, Card, Form, Input, Avatar, Image } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
export default function DrugAllergic({
    setModal,
    isVisible = false,
    patientId = null,
    readOnly = false
}) {
    const [patientDetail, setPatientDetail] = useState({});
    const [drugAllergic, setDrugAllergic] = useState([]);
    const [drugGroupAllergic, setDrugGroupAllergic] = useState([]);
    const fetchDrugAllergiesByPatientId = async patientId => {
        if (patientId) {
            let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients_Drug_AllergiesById/` + patientId).then(res => {
                return res.data.responseData;
            }).catch(error => {
                return error;
            });
            setPatientDetail(res);
            setDrugAllergic(res.drug_Allergies_Info);
            setDrugGroupAllergic(res.drug_Group_Allergies_Info);
        } else {
            setPatientDetail({});
            setDrugAllergic([]);
            setDrugGroupAllergic([]);
        }
    };
    useEffect(() => {
        fetchDrugAllergiesByPatientId(patientId);
    }, [patientId]);
    return <div>
        <Modal title={<label className="topic-green-bold"> 1.1.6 รายละเอียดการแพ้ยา</label>} centered visible={isVisible} onCancel={() => {
            setModal(false);
        }} footer={[<Row justify="center" key="footer">
            <Button key="cancel" onClick={() => {
                setModal(false);
            }}>ออก</Button>
            <Button key="save" type="primary">บันทึก</Button>
        </Row>]} width={1180}>
            <div style={{
                marginTop: "-20px"
            }}>
                <Card bordered={false} style={{
                    marginBottom: "0px"
                }}>
                    <Row gutter={[8, 8]}>
                        <Col span={2}>
                            {patientDetail.picture ? <Avatar size={64} src={<Image src={`data:image/jpeg;base64,${patientDetail.picture}`} />} /> : <Avatar size={64}>Patient</Avatar>}
                        </Col>
                        <Col span={21} className="ms-3">
                            <Row gutter={[8, 8]} className="mb-2 mt-2">
                                <Col>
                                    <label className="topic-green ">{patientDetail.displayName}</label>
                                </Col>
                            </Row>
                            <Row gutter={[8, 8]}>
                                <Col span={5}>
                                    <label className="topic-green me-1">HN :</label>
                                    <label className="data-value">{patientDetail.hn}</label>
                                </Col>
                                <Col span={4}>
                                    <label className="topic-green me-1">อายุ</label>
                                    <label className="data-value">{patientDetail.age}</label>
                                </Col>
                                <Col span={6}>
                                    <label className="topic-green me-1">เบอร์โทรศัพท์</label>
                                    <label className="data-value">
                                        {patientDetail.mobile ? <label>{patientDetail.mobile}</label> : <label>{patientDetail.telephone}</label>}
                                    </label>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card>
                <Row gutter={[16, 8]} className="border-top">
                    <Col span={8} className="pe-4">
                        <Form layout="vertical">
                            <Form.Item name="0" label="">
                                <Radio.Group>
                                    <Radio value="0">
                                        <label className="topic-danger">แพ้ยา</label>
                                    </Radio>
                                    <Radio value="1">
                                        <label className="topic-danger">ไม่มีประวัติแพ้ยา</label>
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item name="1" label="">
                                <Input />
                            </Form.Item>
                            <Form.Item name="2" label={<label className="topic-danger">แพ้อื่นๆ</label>}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="3" label={<label className="topic-green">ข้อมูลสำคัญทางคลีนิค</label>}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="4" label={<label className="topic-green">ข้อมูลสำคัญทางผ่าตัด</label>}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={8} className="pt-2" style={{
                        backgroundColor: "#FAFAFA",
                        borderRadius: "2px"
                    }}>
                        <Row>
                            <Col span={18}><label className="mt-2">รายละเอียดแพ้ยา</label></Col>
                            <Col span={6} className="text-end"><Button type="primary">+</Button></Col>
                        </Row>
                        <Scrollbars autoHeight autoHeightMax={400}>
                            <div className="border-top">
                                <p className="topic-green mt-2">รายละเอียดยาที่แพ้</p>
                            </div>
                            <div>
                                {drugAllergic.length > 0 ? <div>
                                    {drugAllergic.map((o, index) => <div key={index}>
                                        <Row>
                                            <Col span={18}>
                                                <p>
                                                    {o.name}
                                                </p>
                                            </Col>
                                            <Col span={6}>
                                                <label className="topic-danger">
                                                    {o.alevel}
                                                </label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col span={12} className="text-end">
                                                <p className="topic-green">รายละเอียดการแพ้ยา :</p>
                                                <p className="topic-green">การวินิจฉัย :</p>
                                                <p className="topic-green">ลักษณะอาการ :</p>
                                                <p className="topic-green">การให้ข้อมูล :</p>
                                                <p className="topic-green">โรงพยาบาลที่ให้ข้อมูล :</p>
                                            </Col>
                                            <Col span={12}>
                                                <p className="topic-green">{o.alevel}</p>
                                                <p className="topic-green">{o.typedx}</p>
                                                <p className="topic-green">{o.symptom}</p>
                                                <p className="topic-green">{o.informant}</p>
                                                <p className="topic-green">{o.informhosp}</p>
                                            </Col>
                                        </Row>
                                    </div>)}
                                </div> : null}
                            </div>
                        </Scrollbars>
                    </Col>
                    <Col span={8} className="pt-2">
                        <Row>
                            <Col span={18}><label className="mt-2">รายละเอียดแพ้กลุ่มยา</label></Col>
                            <Col span={6} className="text-end"><Button type="primary">+</Button></Col>
                        </Row>
                        {/* <Scrollbars
                                autoHeight
                                autoHeightMax={400}
                             >
                                <div className="border-top">
                                    <p className="topic-green mt-2">รายละเอียดยาที่แพ้</p>
                                </div>
                                <div>
                                    <Row>
                                        <Col span={18}>
                                            <p >xxxxxxxxxxxxxxxxxxxxxxxxx
                                            </p>
                                        </Col>
                                        <Col span={6}>
                                            <label className="topic-danger">รุนแรง</label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={12} className="text-end">
                                            <p className="topic-green">รายละเอียดการแพ้ยา :</p>
                                            <p className="topic-green">การวินิจฉัย :</p>
                                            <p className="topic-green">ลักษณะอาการ :</p>
                                            <p className="topic-green">การให้ข้อมูล :</p>
                                            <p className="topic-green">โรงพยาบาลที่ให้ข้อมูล :</p>
                                        </Col>
                                        <Col span={12}>
                                            <p className="topic-green"></p>
                                            <p className="topic-green"></p>
                                            <p className="topic-green"></p>
                                            <p className="topic-green"></p>
                                            <p className="topic-green"></p>
                                        </Col>
                                    </Row>
                                </div>
                             </Scrollbars> */}
                    </Col>
                </Row>
            </div>
        </Modal>
    </div>;
}