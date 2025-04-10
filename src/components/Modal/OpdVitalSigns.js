import React, { useEffect } from 'react'
import {
    Button, Modal, Form, Input, Select,
    Tabs, Divider, Radio
} from 'antd';

const { TabPane } = Tabs;
// eslint-disable-next-line no-unused-vars
export default function OpdVitalSigns({ show, setModal, vitalSignsDetail = {}, vitalSignsEyes = {}, page = "7.3", onOpdVitalSignsFormFinishHandle = () => {} }) {
    // -----------ModalControl
    const closeModal = () => {
        setModal(false)
    }
    const [opdVitalSignsForm] = Form.useForm()
    const onOpdVitalSignsFormFinish = (values) => {
        onOpdVitalSignsFormFinishHandle(values)
    }
    const [opdVitalSignsForm2] = Form.useForm()
    const onOpdVitalSignsForm2Finish = (values) => {
        onOpdVitalSignsFormFinishHandle(values)
    }
    useEffect(() => {
        if (vitalSignsDetail.bpSystolic !== undefined) {
            opdVitalSignsForm.setFieldsValue({
                bpSystolic: vitalSignsDetail.bpSystolic,
                bpDiastolic: vitalSignsDetail.bpSystolic,
                map: vitalSignsDetail.map,
                bpType: vitalSignsDetail.bpType,
                o2sat: vitalSignsDetail.o2sat,
                waistline: vitalSignsDetail.waistline,
                chestlineIn: vitalSignsDetail.chestlineIn,
                headCircumference: vitalSignsDetail.headCircumference,
                childFeeding: vitalSignsDetail.childFeeding,
                vaccine: vitalSignsDetail.vaccine,
                wbc: vitalSignsDetail.wbc,
                hct: vitalSignsDetail.hct,
                dtx: vitalSignsDetail.dtx,
                para: vitalSignsDetail.para,
                lmp: vitalSignsDetail.lmp,
                fptype: vitalSignsDetail.fptype,
                vMenopause: vitalSignsDetail.vMenopause,
                menopauseAge: vitalSignsDetail.menopauseAge,
                lastChildAge: vitalSignsDetail.lastChildAge,
                ecog: vitalSignsDetail.ecog,
                cvd: vitalSignsDetail.cvd,
                barden: vitalSignsDetail.barden,
                adl: vitalSignsDetail.adl,
                gcs: vitalSignsDetail.gcs,
                gcsE: vitalSignsDetail.gcsE,
                gcsV: vitalSignsDetail.gcsV,
                gcsM: vitalSignsDetail.gcsM,
                pupilRt: vitalSignsDetail.pupilRt,
                pupilRtRe: vitalSignsDetail.pupilRtRe,
                pupilLt: vitalSignsDetail.pupilLt,
                pupilLtRe: vitalSignsDetail.pupilLtRe,
                pps: vitalSignsDetail.pps,
                q8: vitalSignsDetail.q8,
                q9: vitalSignsDetail.q9,
                bpsArmLt: vitalSignsDetail.bpsArmLt,
                bpdArmLt: vitalSignsDetail.bpdArmLt,
                bpsArmRt: vitalSignsDetail.bpsArmRt,
                bpdArmRt: vitalSignsDetail.bpdArmRt,
                bpsLegLt: vitalSignsDetail.bpsLegLt,
                bpdLegLt: vitalSignsDetail.bpdLegLt,
                bpsLegRt: vitalSignsDetail.bpsLegRt,
                bpdLegRt: vitalSignsDetail.bpdLegRt,
                o2satArmLt: vitalSignsDetail.o2satArmLt,
                o2satArmRt: vitalSignsDetail.o2satArmRt,
                o2satLegLt: vitalSignsDetail.o2satLegLt,
                o2satLegRt: vitalSignsDetail.o2satLegRt,
                mpArmLt: vitalSignsDetail.mpArmLt,
                mpArmRt: vitalSignsDetail.mpArmRt,
                mpLegLt: vitalSignsDetail.mpLegLt,
                mpLegRt: vitalSignsDetail.mpLegRt,
                palseFootLt: vitalSignsDetail.palseFootLt,
                palseFootRt: vitalSignsDetail.palseFootRt
            })
            opdVitalSignsForm2.setFieldsValue({
                lVa: vitalSignsEyes.lVa,
                lTn: vitalSignsEyes.lTn,
                lSph: vitalSignsEyes.lSph,
                lCyl: vitalSignsEyes.lCyl,
                lAx: vitalSignsEyes.lAx,
                lKmax: vitalSignsEyes.lKmax,
                lKmin: vitalSignsEyes.lKmin,
                rVa: vitalSignsEyes.rVa,
                rTn: vitalSignsEyes.rTn,
                rSph: vitalSignsEyes.rSph,
                rCyl: vitalSignsEyes.rCyl,
                rAx: vitalSignsEyes.rAx,
                rKmax: vitalSignsEyes.rKmax,
                rKmin: vitalSignsEyes.rKmin
            })
        } else {
            opdVitalSignsForm.resetFields()
            opdVitalSignsForm2.resetFields()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vitalSignsDetail])
    return (
        <div>
            <Modal
                centered
                visible={show}
                cancelText="ออก"
                onCancel={closeModal}
                // onOk={closeModal}
                // onOk={() => closeModal("referForm")}
                footer={
                    <div className="text-center">
                        <Button type="primary" onClick={closeModal}>บันทึก</Button>
                        {/* <Button type="secondary" onClick={closeModal}>ปิด</Button> */}
                        {/* <Button type="primary" onClick={opdVitalSignsForm.submit}>บันทึก</Button> */}
                    </div>
                }
                width={1250}
            >
                <Tabs type="card">
                    <TabPane key="1" tab={<label className="gx-text-primary">7.3.1  V/S เพิ่มเติม</label>}>
                        <div>
                            <Form name="opdVitalSignsForm"
                                layout="vertical"
                                form={opdVitalSignsForm}
                                onFinish={onOpdVitalSignsFormFinish}
                            >
                                <div className="row row-cols-3">
                                    <div className="col" style={{ width: "23%", borderRight: "1px solid #E0E0E0" }}>
                                        <div className="mb-2">
                                            <label>Blood pressure (mmHg)</label>
                                        </div>
                                        <div className="row row-cols-3" style={{ marginBottom: "-10px" }}>
                                            <div className="col" style={{ width: "103px", marginRight: "-15px" }}>
                                                <Form.Item name="bpSystolic" label={<label className="gx-text-primary">Systolic</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "103px", marginRight: "-15px" }}>
                                                <Form.Item name="bpDiastolic" label={<label className="gx-text-primary">Diastolic</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "104px", marginRight: "-15px" }}>
                                                <Form.Item name="map" label={<label className="gx-text-primary">MAP</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: "-10px" }}>
                                            <Form.Item name="bpType">
                                                <Select
                                                    placeholder="ท่าที่วัดความดัน"
                                                >
                                                </Select>
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div className="row row-cols-3" style={{ marginBottom: "-23px" }}>
                                            <div className="col" style={{ width: "103px", marginRight: "-15px" }}>
                                                <Form.Item name="o2sat" label={<label className="gx-text-primary">O2sat</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "104px", marginRight: "-15px" }}>
                                                <Form.Item name="waistline" label={<label className="gx-text-primary">รอบเอว</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "104px", marginRight: "-15px" }}>
                                                <Form.Item name="chestlineIn" label={<label className="gx-text-primary">รอบอก</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div>
                                            <div className="mb-2">
                                                <label>ข้อมูลด้านกุมารเวช</label>
                                            </div>
                                            <div className="text-end" style={{ marginBottom: "-18px" }}>
                                                <label className="data-value-danger">{vitalSignsDetail.childFeedingDesc}</label>
                                            </div>
                                            <div className="row row-cols-2" style={{ marginBottom: "-10px" }}>
                                                <div className="col" style={{ width: "120px", marginRight: "-15px" }}>
                                                    <Form.Item name="headCircumference" label={<label className="gx-text-primary" style={{}}>รอบศีรษะ</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div className="col" style={{ width: "176px", marginRight: "-15px" }}>
                                                    <Form.Item name="childFeeding" label={<label className="gx-text-primary">ได้รับนม</label>}>
                                                        <Select
                                                            placeholder="นมแม่"
                                                        >
                                                        </Select>
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="gx-text-primary">ได้รับวัคซีนตามเกณฑ์</label>
                                            </div>
                                            <div style={{ marginBottom: "-23px" }}>
                                                <Form.Item name="vaccine">
                                                    <Radio.Group>
                                                        <Radio value={1}><label className="data-value">ครบ</label></Radio>
                                                        <Radio value={2}><label className="data-value">ไม่ครบ</label></Radio>
                                                        <Radio value={3}><label className="data-value">ไม่ทราบ</label></Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div className="row row-cols-3">
                                            <div className="col" style={{ width: "103px", marginRight: "-15px" }}>
                                                <Form.Item name="wbc" label={<label className="gx-text-primary">WBC</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "104px", marginRight: "-15px" }}>
                                                <Form.Item name="hct" label={<label className="gx-text-primary">HCT</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "104px", marginRight: "-15px" }}>
                                                <Form.Item name="dtx" label={<label className="gx-text-primary">DTX</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ width: "34%", borderRight: "1px solid #E0E0E0" }}>
                                        <div className="mb-2">
                                            <label>ข้อมูลด้านสูติ-นรีเวช</label>
                                        </div>
                                        <div className="row row-cols-3" style={{ marginBottom: "-10px" }}>
                                            <div className="col" style={{ width: "148px", marginRight: "-15px" }}>
                                                <Form.Item name="para" label={<label className="gx-text-primary">PARA</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "148px", marginRight: "-15px" }}>
                                                <Form.Item name="lmp" label={<label className="gx-text-primary">LMP</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "150px", marginRight: "-15px" }}>
                                                <Form.Item name="fptype" label={<label className="gx-text-primary">วิธีคุมกำเนิด</label>}>
                                                    <Select>
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div className="row row-cols-3" style={{ marginBottom: "-23px" }}>
                                            <div className="col" style={{ width: "150px", marginRight: "-20px" }}>
                                                <Form.Item name="vMenopause" label={<label className="gx-text-primary">Menopause</label>}>
                                                    <Radio.Group>
                                                        <Radio value={1}><label className="data-value">No</label></Radio>
                                                        <Radio value={2}><label className="data-value">Yes</label></Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "105px", marginRight: "-15px" }}>
                                                <Form.Item name="menopauseAge" label={<label className="gx-text-primary"></label>}>
                                                    <Input placeholder="อายุ" />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "196px", marginRight: "-15px" }}>
                                                <Form.Item name="lastChildAge" label={<label className="gx-text-primary">อายุลูกคนสุดท้อง</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div className="row row-cols-2" style={{ marginBottom: "0px" }}>
                                            <div className="col">
                                                <div className="row row-cols-2">
                                                    <div className="col" style={{ width: "111px", marginRight: "-15px" }}>
                                                        <Form.Item name="ecog" label={<label className="gx-text-primary">ECOG</label>}>
                                                            <Input />
                                                        </Form.Item>
                                                    </div>
                                                    <div className="col" style={{ width: "113px", marginRight: "-15px" }}>
                                                        <Form.Item name="cvd" label={<label className="gx-text-primary">CVD</label>}>
                                                            <Input />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="row row-cols-2" style={{ borderLeft: "1px solid #E0E0E0" }}>
                                                    <div className="col" style={{ width: "111px", marginRight: "-15px" }}>
                                                        <Form.Item name="barden" label={<label className="gx-text-primary">Barden</label>}>
                                                            <Input />
                                                        </Form.Item>
                                                    </div>
                                                    <div className="col" style={{ width: "111px", marginRight: "-15px" }}>
                                                        <Form.Item name="adl" label={<label className="gx-text-primary">ADL</label>}>
                                                            <Input />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div className="row row-cols-4" style={{ marginBottom: "-23px" }}>
                                            <div className="col" style={{ width: "131px", marginRight: "-15px" }}>
                                                <Form.Item name="gcs" label={<label className="gx-text-primary">GCS. ( Score )</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "110px", marginRight: "-15px" }}>
                                                <Form.Item name="gcsE" label={<label className="gx-text-primary">E</label>}>
                                                    <Select>

                                                    </Select>
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "110px", marginRight: "-15px" }}>
                                                <Form.Item name="gcsV" label={<label className="gx-text-primary">V</label>}>
                                                    <Select>

                                                    </Select>
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ width: "110px", marginRight: "-15px" }}>
                                                <Form.Item name="gcsM" label={<label className="gx-text-primary">M</label>}>
                                                    <Select>

                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>

                                        <div>
                                            <div className="mb-2">
                                                <label>Pupils</label>
                                            </div>
                                            <div className="row row-cols-4" style={{ marginBottom: "-23px" }}>
                                                <div className="col" style={{ width: "117px", marginRight: "-18px" }}>
                                                    <Form.Item name="pupilRt" label={<label className="gx-text-primary">Rt.</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div className="col" style={{ width: "117px", marginRight: "-18px" }}>
                                                    <Form.Item name="pupilRtRe" label={<label className="gx-text-primary">Re.</label>}>
                                                        <Select>

                                                        </Select>
                                                    </Form.Item>
                                                </div>
                                                <div className="col" style={{ width: "117px", marginRight: "-18px" }}>
                                                    <Form.Item name="pupilLt" label={<label className="gx-text-primary">Lt.</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div className="col" style={{ width: "119px", marginRight: "-18px" }}>
                                                    <Form.Item name="pupilLtRe" label={<label className="gx-text-primary">Le.</label>}>
                                                        <Select>

                                                        </Select>
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col" style={{ width: "43%" }}>
                                        <div className="row row-cols-2" style={{ marginBottom: "-6px" }}>
                                            <div className="col" style={{ width: "130px", marginRight: "-15px", borderRight: "1px solid #E0E0E0" }}>
                                                <div style={{ marginBottom: "-15px" }}>
                                                    <Form.Item name="pps" label={<label className="gx-text-primary">PPS</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div style={{ marginBottom: "-15px" }}>
                                                    <Form.Item name="q8" label={<label className="gx-text-primary">Q8</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div style={{ marginBottom: "-15px" }}>
                                                    <Form.Item name="q9" label={<label className="gx-text-primary">Q9</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="col ps-4 ms-4" style={{ width: "310px", marginRight: "-20px" }}>
                                                <div className="mb-2">
                                                    <label className="gx-text-primary">BP 4 รยางค์</label>
                                                </div>
                                                <div className="position-relative" style={{ width: "310px" }}>
                                                    <div className="position-absolute top-50 start-0 translate-middle">
                                                        <label style={{ marginLeft: "-15px" }}>Lt.</label>
                                                    </div>
                                                    <div className="position-absolute top-50 end-0 translate-middle">
                                                        <label style={{ marginRight: "-50px" }}>Rt.</label>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>แขน</label>
                                                    </div>
                                                    <div style={{ borderBottom: "1px solid #E0E0E0" }}>
                                                        <div className="row row-cols-2" style={{ marginBottom: "-11px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols-2 text-end">
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpsArmLt" label={<label className="data-value">sys.</label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpdArmLt" label={<label className="data-value">dia.</label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols-2">
                                                                    <div className="col" style={{ width: "92px", marginLeft: "-4px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpsArmRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpdArmRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="row row-cols-2" style={{ marginTop: "-17px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols-2 text-end">
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpsLegLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpdLegLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols-2">
                                                                    <div className="col" style={{ width: "92px", marginLeft: "-4px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpsLegRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                    <div className="col" style={{ width: "92px", marginRight: "-15px" }}>
                                                                        <Form.Item name="bpdLegRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>ขา</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div className="row row-cols-2" style={{ marginBottom: "-6px" }}>
                                            <div className="col ps-3 ms-2" style={{ width: "200px" }}>
                                                <div className="mb-2">
                                                    <label className="gx-text-primary">O2sat 4 รยางค์</label>
                                                </div>
                                                <div className="position-relative" style={{ width: "200px" }}>
                                                    <div className="position-absolute top-50 start-0 translate-middle">
                                                        <label style={{ marginLeft: "-15px" }}>Lt.</label>
                                                    </div>
                                                    <div className="position-absolute top-50 end-0 translate-middle">
                                                        <label style={{ marginRight: "-20px" }}>Rt.</label>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>แขน</label>
                                                    </div>
                                                    <div style={{ borderBottom: "1px solid #E0E0E0" }}>
                                                        <div className="row row-cols-2" style={{ marginBottom: "-11px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols text-end">
                                                                    <div className="col">
                                                                        <Form.Item name="o2satArmLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols">
                                                                    <div className="col">
                                                                        <Form.Item name="o2satArmRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="row row-cols-2" style={{ marginTop: "-17px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols text-end">
                                                                    <div className="col">
                                                                        <Form.Item name="o2satLegLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols">
                                                                    <div className="col">
                                                                        <Form.Item name="o2satLegRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Input />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>ขา</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col ps-4" style={{ width: "200px", marginLeft: "40px", borderLeft: "1px solid #E0E0E0" }}>
                                                <div className="mb-2">
                                                    <label className="gx-text-primary">Motor Power Grade</label>
                                                </div>
                                                <div className="position-relative" style={{ width: "220px" }}>
                                                    <div className="position-absolute top-50 start-0 translate-middle">
                                                        <label style={{ marginLeft: "-15px" }}>Lt.</label>
                                                    </div>
                                                    <div className="position-absolute top-50 end-0 translate-middle">
                                                        <label style={{ marginRight: "-50px" }}>Rt.</label>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>แขน</label>
                                                    </div>
                                                    <div style={{ borderBottom: "1px solid #E0E0E0" }}>
                                                        <div className="row row-cols-2" style={{ marginBottom: "-11px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols text-end">
                                                                    <div className="col">
                                                                        <Form.Item name="mpArmLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Select></Select>
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols">
                                                                    <div className="col">
                                                                        <Form.Item name="mpArmRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Select></Select>
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="row row-cols-2" style={{ marginTop: "-17px" }}>
                                                            <div className="col text-end" style={{ borderRight: "1px solid #E0E0E0" }}>
                                                                <div className="row row-cols text-end">
                                                                    <div className="col" style={{ width: "95px", marginRight: "-20px" }}>
                                                                        <Form.Item name="mpLegLt" label={<label className="gx-text-primary"></label>}>
                                                                            <Select></Select>
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="row row-cols">
                                                                    <div className="col">
                                                                        <Form.Item name="mpLegRt" label={<label className="gx-text-primary"></label>}>
                                                                            <Select></Select>
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <label>ขา</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Divider />
                                        </div>
                                        <div>
                                            <div>
                                                <label className="gx-text-primary">ชีพจรหลังเท้า</label>
                                            </div>
                                            <div className="row row-cols-5">
                                                <div className="col">
                                                    <Form.Item name="palseFootLt" label={<label className="gx-text-primary">Lt.</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <div className="col">
                                                    <Form.Item name="palseFootRt" label={<label className="gx-text-primary">Rt.</label>}>
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </TabPane>
                    <TabPane key="2" tab={<label className="gx-text-primary">V/S ตา</label>}>
                        <div>
                            <div className="mb-3">
                                <label>ค่าวัดสายตา</label>
                            </div>
                            <Form name="opdVitalSignsForm2"
                                layout="vertical"
                                form={opdVitalSignsForm2}
                                onFinish={onOpdVitalSignsForm2Finish}
                            >
                                <div className="row row-cols-3">
                                    <div className="col mt-2 text-end" style={{ width: "60px" }}>
                                        <label className="mt-4">Lt.</label>
                                    </div>
                                    <div className="col" style={{ width: "200px" }}>
                                        <Form.Item name="lVa" label={<label className="gx-text-primary">VA</label>}>
                                            <Select></Select>
                                        </Form.Item>
                                    </div>
                                    <div className="col" style={{ width: "700px" }}>
                                        <div className="row row-cols-6">
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lTn" label={<label className="gx-text-primary">TN</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lSph" label={<label className="gx-text-primary">Sph</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lCyl" label={<label className="gx-text-primary">Cyl</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lAx" label={<label className="gx-text-primary">Ax</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lKmax" label={<label className="gx-text-primary">Kmax</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="lKmin" label={<label className="gx-text-primary">Kmin</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row row-cols-3">
                                    <div className="col mt-2 text-end" style={{ width: "60px" }}>
                                        <label>Rt.</label>
                                    </div>
                                    <div className="col" style={{ width: "200px" }}>
                                        <Form.Item name="rVa">
                                            <Select></Select>
                                        </Form.Item>
                                    </div>
                                    <div className="col" style={{ width: "700px" }}>
                                        <div className="row row-cols-6">
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rTn">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rSph">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rCyl">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rAx">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rKmax">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="rKmin">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Divider />
                                </div>
                                <div className="mb-2">
                                    <label>
                                        ค่าวัดแว่นตา
                                    </label>
                                </div>
                                <div className="row row-cols-3">
                                    <div className="col mt-2 text-end" style={{ width: "60px" }}>
                                        <label className="mt-4">Lt.</label>
                                    </div>
                                    <div className="col" style={{ width: "200px" }}>
                                        <Form.Item name="x" label={<label className="gx-text-primary">VA</label>}>
                                            <Select></Select>
                                        </Form.Item>
                                    </div>
                                    <div className="col" style={{ width: "700px" }}>
                                        <div className="row row-cols-6">
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x" label={<label className="gx-text-primary">GSph</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x" label={<label className="gx-text-primary">GCyl</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x" label={<label className="gx-text-primary">GAx</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x" label={<label className="gx-text-primary">Add</label>}>
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row row-cols-3">
                                    <div className="col mt-2 text-end" style={{ width: "60px" }}>
                                        <label>Rt.</label>
                                    </div>
                                    <div className="col" style={{ width: "200px" }}>
                                        <Form.Item name="x">
                                            <Select></Select>
                                        </Form.Item>
                                    </div>
                                    <div className="col" style={{ width: "700px" }}>
                                        <div className="row row-cols-6">
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                            <div className="col" style={{ marginRight: "-15px" }}>
                                                <Form.Item name="x">
                                                    <Input />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </TabPane>
                </Tabs>
            </Modal >
        </div >
    )
}
