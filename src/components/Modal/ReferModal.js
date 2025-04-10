import { env } from '../../env.js';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Popconfirm, Radio, Row, Select, Spin, notification } from "antd";
import { Option } from 'antd/lib/mentions/index.js';
import axios from 'axios';
import { sortBy, map, filter, differenceBy } from "lodash";
import moment from 'moment';
import { useEffect, useState } from 'react';
import DatepickerWithForm from "../DatePicker/DatePickerWithForm";
import { momentEN, momentTH } from '../helper/convertMoment';
import { GetDropdown, apis } from './AddOrUpdVisitApi.js';
// import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker.js';
import { callApis } from 'components/helper/function/CallApi.js';
import { mappingOptions } from 'components/helper/function/MappingOptions.js';
import SelectHospCode from '../Input/SelectHospCode.js';
import SelectReferDiag from '../Input/SelectReferDiag.js';
import SelectWithTextArea from '../Input/SelectWithTextArea';
import { useDispatch, useSelector } from "react-redux";
import { dspDropdowsReferModal } from "appRedux/actions";
const {
  TextArea
} = Input;
export default function ReferModal({
  isZhow = false,
  patient = null,
  prevRefer = null,
  handleClose = () => { },
  workIdRefer
}) {
  const dispatch = useDispatch();
  const optionsReferModal = useSelector(({ getDropdowns }) => getDropdowns.optionsReferModal);

  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [prevDocumentNo, setPrevDocumentNo] = useState(null);
  const [referId, setReferId] = useState(null);
  const [referTypeValue, setReferTypeValue] = useState("O");

  const getDropdowns = async () => {
    if (Object.keys(optionsReferModal).length) return
    let [
      referTypeList,
      referReason,
      listOPDWorkPlaces,
      listTriages,
      listReferPtTypes,
      listReceiveTypes,
      listDoctor,
      listReferStatus,
      listBedsDepart,
      listReferType,
    ] = await Promise.all([
      GetDropdown('GetReferTypeMas'),
      callApis(apis['GetDropDownMas'], { table: 'TB_PATIENTS_REFERS', field: 'ReferReason', }),
      callApis(listDdApi['GetWorkPlacesMas']),
      callApis(listDdApi['GetMasterTriages']),
      callApis(listDdApi['GetReferPtTypes']),
      callApis(listDdApi['GetReceiveTypes']),
      callApis(listDdApi['GetDoctorMas']),
      callApis(listDdApi['GetRefferStatus']),
      callApis(listDdApi['GetBedsDepartList']),
      callApis(listDdApi['GetReferTypeMas']),
    ])
    referTypeList = sortBy(
      referTypeList?.map((i) => {
        return {
          ...i,
          datavalue: isNaN(Number(i.datavalue)) ? i.datavalue : Number(i.datavalue),
        };
      }),
      'datavalue'
    );
    referReason = mappingOptions({ dts: referReason })
    listOPDWorkPlaces = mappingOptions({ dts: listOPDWorkPlaces })
    listTriages = mappingOptions({ dts: listTriages })
    listReferPtTypes = mappingOptions({ dts: listReferPtTypes })
    listReceiveTypes = mappingOptions({ dts: listReceiveTypes })
    listDoctor = mappingOptions({ dts: listDoctor })
    listReferStatus = mappingOptions({ dts: listReferStatus })
    listBedsDepart = mappingOptions({ dts: listBedsDepart })
    listReferType = mappingOptions({ dts: listReferType })

    dispatch(dspDropdowsReferModal({
      referTypeList,
      referReason,
      listOPDWorkPlaces,
      listTriages,
      listReferPtTypes,
      listReceiveTypes,
      listDoctor,
      listReferStatus,
      listBedsDepart,
      listReferType,
    }))
  }
  useEffect(() => {
    if (isZhow) {
      getDropdowns();
    }
    return () => momentEN();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZhow]);
  const dateTransToEN = dateTH => {
    let DDMM = dateTH.slice(0, 6);
    let Year = Number(dateTH.slice(-4)) - 543;
    let temp = `${DDMM}${Year}`;
    return temp;
  };
  useEffect(() => {
    if (isZhow) {
      momentTH();
    }
    setReferId(null);
    if (!prevRefer) {
      form.setFieldsValue({
        referDate: moment(),
        expireDate: moment().add(1, "years"),
        appointDateRefer: moment(),
        arriveDate: moment(),
        inout: "I"
      });
    }
    if (prevRefer) {
      setPrevDocumentNo(prevRefer.documentNo);
      setReferId(prevRefer.referId);
      setReferTypeValue(prevRefer.inout);
      let referDate = prevRefer.referDate ? moment(dateTransToEN(prevRefer.referDate), "DD/MM/YYYY") : null
      let expireDate = prevRefer.expireDate ? moment(dateTransToEN(prevRefer.expireDate), "DD/MM/YYYY") : null
      let appointDateRefer = prevRefer.appointDateRefer ? moment(dateTransToEN(prevRefer.appointDateRefer), "BBBB-MM-DD HH:mm:ss") : null
      let arriveDate = prevRefer.arriveDate ? moment(dateTransToEN(prevRefer.arriveDate), "BBBB-MM-DD HH:mm:ss") : null
      form.setFieldsValue({
        ...prevRefer,
        referDate: referDate,
        expireDate: expireDate,
        appointDateRefer: appointDateRefer,
        arriveDate: arriveDate,
      });
    }

    if (!isZhow) {
      return () => momentEN();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevRefer, isZhow]);
  const notificationX = (type, title,) => {
    notification[type ? "success" : "warning"]({
      message: <label className={type ? "gx-text-primary fw-bold" : "fw-bold"} style={type ? {
        fontSize: 18
      } : {
        fontSize: 18,
        color: "red"
      }}>
        {title}
      </label>,
      description: <label className={type ? "gx-text-primary me-1 fw-bold" : "me-1 fw-bold"} style={type ? {
        fontSize: 18
      } : {
        fontSize: 18,
        color: "red"
      }}>
        {type ? "สำเร็จ" : "ไม่สำเร็จ"}
      </label>,
      duration: 5
    });
  };
  const thaiYear = moment().format("/YYYY").slice(-2);
  const onFinish = values => {
    const Insert = async () => {
      setLoading(true);
      let workplaceRefers = map(values?.workplaceRefers, o => {
        return {
          ...o,
          referId: null,
          wprId: null,
          cancelFlag: null,
          UserCreated: user,
          dateCreated: moment().format("BBBB-MM-DD HH:mm:ss")
        };
      });
      let req = {
        thaiYear: thaiYear,
        referId: null,
        patientId: patient.patientId,
        runHn: patient.runHn,
        yearHn: patient.yearHn,
        hn: patient.hn,
        referRunNo: null,
        referYearNo: thaiYear,
        referDate: values.referDate ? moment(values.referDate).format("BBBB-MM-DD") : null,
        appointDateRefer: values.appointDateRefer ? moment(values.appointDateRefer).format("BBBB-MM-DD") : null,
        arriveDate: values.arriveDate ? moment(values.arriveDate).format("BBBB-MM-DD") : null,
        inout: values.inout,
        referHosp: values.referHosp || null,
        documentNo: values.documentNo || null,
        expireDate: values.expireDate ? moment(values.expireDate).format("BBBB-MM-DD") : null,
        referType: values.referType || null,
        referPtType: values.referPtType || null,
        receiveDx: values.receiveDx || null,
        referDx: values.referDx || null,
        request: values.request || null,
        urgent: values.urgent || null,
        depart: values.depart || null,
        doctor: values.doctor || null,
        referReason: values.referReason || null,
        status: values.status || null,
        numOfCoordinate: values.numOfCoordinate || null,
        rightId: values.rightId,
        referAn: null,
        problem: values.problem || null,
        workId: values.workId,
        UserCreated: user,
        UserModified: null,
        referPicture: null,
        receiveDxIcd: values.receiveDxIcd || null,
        dischargeDx: values.dischargeDx || null,
        dischargeDxIcd: values.dischargeDxIcd || null,
        workplaceRefers: workplaceRefers,
      };
      let res = await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsPatientsRefersVisit`,
        method: "POST",
        data: {
          requestData: req
        }
      }).then(res => {
        return res.data;
      }).catch(error => {
        return error;
      });
      if (res) {
        notificationX(res.isSuccess, "บันทึกการส่งต่อ");
        if (res.isSuccess) {
          handleClose(false, true);
          form.resetFields();
        }
      }
      setLoading(false);
    };
    const Update = async () => {
      setLoading(true);
      let workplaceRefers = map(values?.workplaceRefers, o => {
        return {
          ...o,
          UserModified: user,
          dateModified: moment().format("BBBB-MM-DD HH:mm:ss"),

        };
      });
      let listWprForDel = [];
      if (prevRefer?.workplaceRefers?.length) {
        let listPrevWorkplaceRefers = filter(workplaceRefers, 'wprId');
        listWprForDel = differenceBy(prevRefer?.workplaceRefers, listPrevWorkplaceRefers, "wprId");
      }
      let req = {
        thaiYear: thaiYear,
        referId: referId,
        patientId: patient.patientId,
        runHn: patient.runHn,
        yearHn: patient.yearHn,
        hn: patient.hn,
        referRunNo: null,
        referYearNo: thaiYear,
        referDate: values.referDate ? moment(values.referDate).format("BBBB-MM-DD") : null,
        appointDateRefer: values.appointDateRefer ? moment(values.appointDateRefer).format("BBBB-MM-DD") : null,
        arriveDate: values.arriveDate ? moment(values.arriveDate).format("BBBB-MM-DD") : null,
        inout: values.inout,
        referHosp: values.referHosp || null,
        documentNo: values.documentNo || null,
        expireDate: values.expireDate ? moment(values.expireDate).format("BBBB-MM-DD") : null,
        referType: values.referType || null,
        referPtType: values.referPtType || null,
        receiveDx: values.receiveDx || null,
        referDx: values.referDx || null,
        request: values.request || null,
        urgent: values.urgent || null,
        depart: values.depart || null,
        doctor: values.doctor || null,
        referReason: values.referReason || null,
        status: values.status || null,
        numOfCoordinate: values.numOfCoordinate || null,
        rightId: values.rightId,
        referAn: null,
        problem: values.problem || null,
        workId: values.workId,
        UserCreated: null,
        UserModified: user,
        referPicture: null,
        receiveDxIcd: values.receiveDxIcd || null,
        dischargeDx: values.dischargeDx || null,
        dischargeDxIcd: values.dischargeDxIcd || null,
        workplaceRefers: workplaceRefers,
      };
      if (listWprForDel?.length) {
        let resDelWpr = await DelWpr(listWprForDel);
      }
      let res = await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/UpdPatientsRefersVisit`,
        method: "PUT",
        data: {
          requestData: req
        }
      }).then(res => {
        return res.data;
      }).catch(error => {
        return error;
      });
      if (res) {
        notificationX(res.isSuccess, "แก้ไขการส่งต่อ");
        if (res.isSuccess) {
          handleClose(false, true);
          form.resetFields();
        }
      }
      setLoading(false);
    };
    if (referId) {
      Update();
    }
    if (!referId) {
      Insert();
    }
  };
  const inout = Form.useWatch("inout", form);
  return <Modal centered visible={isZhow} width={720} onOk={() => {
    form.submit();
  }} onCancel={e => {
    e.stopPropagation();
    handleClose(false);
    form.resetFields();
  }} okText="บันทึก" cancelText="ออก" title={<label className="gx-text-primary fw-bold" style={{
    fontSize: 18
  }}>2.2.2 บันทึก/แก้ไข การส่งต่อ</label>} footer={<div className="text-center">
    <Button onClick={e => {
      e.stopPropagation();
      handleClose(false);
      form.resetFields();
    }}>
      ปิด
    </Button>
    <Button type="primary" onClick={() => form.submit()}>
      บันทึก
    </Button>
  </div>}>
    <Spin spinning={loading}>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div hidden>
          <Form.Item name="runHn">
            <Input />
          </Form.Item>
          <Form.Item name="yearHn">
            <Input />
          </Form.Item>
          <Form.Item name="hn">
            <Input />
          </Form.Item>
          <Form.Item name="referRunNo">
            <Input />
          </Form.Item>
          <Form.Item name="referYearNo">
            <Input />
          </Form.Item>
        </div>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={9}>
            <Form.Item name="inout" label={<label className="gx-text-primary fw-bold">ประเภท</label>} rules={[{
              required: true,
              message: "กรุณาเลือกประเภท!"
            }]}>
              <Radio.Group value={referTypeValue} onChange={e => {
                setReferTypeValue(e.target.value);
                if (referId) {
                  form.setFieldsValue({
                    documentNo: prevDocumentNo
                  });
                } else {
                  if (e.target.value === "O") {
                    form.setFieldsValue({
                      documentNo: null
                    });
                  }
                  if (e.target.value === "B") {
                    form.setFieldsValue({
                      documentNo: null
                    });
                  }
                }
              }} disabled={referId ? true : false}>
                <Radio value="I">
                  {<label className="gx-text-primary">
                    IN
                  </label>}
                </Radio>
                <Radio value="O">
                  {<label className="gx-text-primary">
                    OUT
                  </label>}
                </Radio>
                <Radio value="B">
                  {<label className="gx-text-primary">
                    BACK
                  </label>}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="documentNo" label={<label className="gx-text-primary  fw-bold">
              เลขใบส่งตัว
            </label>}
            // rules={[{
            //   required: inout === "O" || inout === "B" ? false : true,
            //   message: "กรุณาเลือกประเภท!"
            // }]}
            >
              <Input disabled={inout === "O" || inout === "B" ? true : false} style={{
                width: "100%"
              }} />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="referDate" label={<label className="gx-text-primary fw-bold">
              วันที่ Refer
            </label>}
            // rules={[{
            //   required: true,
            //   message: "กรุณาเลือก วันที่ Refer*!"
            // }]}
            >
              <DatepickerWithForm format={"DD/MM/YYYY"} form={form} name="referDate" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="expireDate" label={<label className="gx-text-primary fw-bold">
              วันหมดอายุ
            </label>}>
              <DatepickerWithForm format={"DD/MM/YYYY"} form={form} name="expireDate" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={12}>
            <Form.Item name="referHosp" label={<label className="gx-text-primary fw-bold">
              รพ.ที่ส่งตัว
            </label>}
            // rules={[{
            //   required: true,
            //   message: "กรุณาเลือก รพ.ที่ส่งตัว!"
            // }]}
            >
              <SelectHospCode value={form.getFieldValue("referHosp")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Row gutter={[4, 4]} style={{
              flexDirection: 'row'
            }}>
              <Col span={20}>
                <Form.Item name="workId" label={<label className="gx-text-primary fw-bold">หน่วยงานที่ส่งตัว</label>}
                // rules={[
                //   ({ getFieldValue }) => ({
                //     required: getFieldValue("inout") !== "I",
                //     message: "กรุณาเลือก หน่วยงานที่ส่งตัว!",
                //   }),
                // ]}
                >
                  <Select style={{
                    width: "100%"
                  }} showSearch
                    // allowClear
                    optionFilterProp="label" className="data-value" options={optionsReferModal?.listOPDWorkPlaces || []}
                    defaultValue={workIdRefer}
                  // mode="multiple"
                  />
                </Form.Item>
              </Col>
              <Col span={4} className='text-end'>
                <Form.Item label=" ">
                  <Button type="primary" onClick={() => {
                    let formValues = form.getFieldsValue();
                    form.setFieldsValue({
                      workplaceRefers: [{
                        workId: null,
                        referId: referId,
                        wprId: null
                      }, ...(formValues?.workplaceRefers || [])]
                    });
                  }} icon={<PlusOutlined />} />
                </Form.Item>
              </Col>
            </Row>
            <Form.List name="workplaceRefers">
              {(fields, {
                remove
              }) => <div style={{
                marginTop: -24
              }}>
                  {fields.map(({
                    key,
                    name,
                    ...restField
                  }) => <Row key={key} gutter={[4, 4]} style={{
                    flexDirection: "row",
                    marginTop: -12
                  }}>
                      <Col span={20}>
                        <Form.Item hidden {...restField} name={[name, 'wprId']}>
                          <Input />
                        </Form.Item>
                        <Form.Item hidden {...restField} name={[name, 'referId']}>
                          <Input />
                        </Form.Item>
                        <Form.Item name={[name, 'workId']} rules={[{
                          required: true,
                          message: "กรุณาเลือก หน่วยงานที่ส่งตัว!"
                        }]} style={{
                          margin: 0
                        }}>
                          <Select placeholder="หน่วยงานที่ส่งตัว" showSearch
                            // allowClear
                            optionFilterProp="label" className="data-value" options={optionsReferModal?.listOPDWorkPlaces || []} />
                        </Form.Item>
                      </Col>
                      <Col span={4} className='text-end'>
                        <Form.Item style={{
                          margin: 0
                        }}>
                          <Popconfirm title="ลบหน่วยงาน?" onConfirm={() => remove(name)} onCancel={() => { }} okText="Yes" cancelText="No">
                            <Button type="danger"
                              // onClick={}
                              icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Form.Item>
                      </Col>
                    </Row>)}
                </div>}
            </Form.List>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={12} >
            <Form.Item
              style={{
                margin: 0
              }}
              name='appointDateRefer'
              label={<label className="gx-text-primary fw-bold">
                วันที่นัดหมาย Refer
              </label>}
            >
              <DatepickerWithForm
                style={{ width: '100%' }}
                format={'DD/MM/YYYY'}
                name="appointDateRefer"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col span={12} >
            <Form.Item
              style={{
                margin: 0
              }}
              name='arriveDate'
              label={<label className="gx-text-primary fw-bold">
                วันที่ถึงรพ.ปลายทาง
              </label>}
            >
              <DatepickerWithForm
                style={{ width: '100%' }}
                format={'DD/MM/YYYY'}
                name="arriveDate"
                form={form}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="referType" label={<label className="gx-text-primary fw-bold">
              ประเภทการส่งต่อ
            </label>}>
              <Select style={{ width: "100%" }}
                showSearch allowClear optionFilterProp="label" className="data-value"               >
                {optionsReferModal?.referTypeList?.map((val, index) => (
                  <Option value={val.datavalue} key={index}>
                    {val.dataother2}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="referPtType" label={<label className="gx-text-primary fw-bold">
              ประเภทผู้ป่วย Refer
            </label>}>
              <Select style={{
                width: "100%"
              }} showSearch allowClear optionFilterProp="label" className="data-value" options={optionsReferModal?.listReferPtTypes || []} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="receiveDx" label={<label className="gx-text-primary fw-bold">
              Dx แรกรับ
            </label>}>
              <Input.TextArea
                className="data-value"
                maxLength={200}
                autoSize={{ minRows: 1, maxRows: 5 }} // กำหนดจำนวนแถวที่จะแสดงอัตโนมัติ

              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={8}>
            <Form.Item name="referDx" label={<label className="gx-text-primary fw-bold">
              กลุ่มโรคเฉพาะการส่งตัว
            </label>}>
              <SelectReferDiag value={form.getFieldValue("referDx")} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="request" label={<label className="gx-text-primary fw-bold">
              สิ่งที่ต้องการให้ดำเนินการ
            </label>}>
              <Input className="data-value" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="urgent" label={<label className="gx-text-primary fw-bold">
              ความเร่งด่วน
            </label>}>
              <Select style={{
                width: "100%"
              }} showSearch allowClear optionFilterProp="label" className="data-value" options={optionsReferModal?.listTriages || []} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={8}>
            <Form.Item name="depart" label={<label className="gx-text-primary fw-bold">
              แผนกที่รับ/ส่งตัว
            </label>}>
              <Select style={{
                width: "100%"
              }} showSearch allowClear optionFilterProp="label" className="data-value" options={optionsReferModal?.listBedsDepart || []} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="doctor" label={<label className="gx-text-primary fw-bold">
              แพทย์ผู้รับ/ส่งตัว
            </label>}>
              <Select style={{
                width: "100%"
              }} showSearch allowClear optionFilterProp="label" className="data-value" options={optionsReferModal?.listDoctor || []} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="referReason" label={<label className="gx-text-primary fw-bold">
              เหตุผลการส่งตัว
            </label>}>
              <SelectWithTextArea
                options={optionsReferModal?.referReason || []}
                initvalue={form.getFieldsValue()?.referReason}
                onChange={(v) => form.setFieldsValue({ referReason: v })
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{
          flexDirection: "row",
          marginTop: -12
        }}>
          <Col span={8}>
            <Form.Item name="status" label={<label className="gx-text-primary fw-bold">
              สถานะการ Refer
            </label>}>
              <Select style={{
                width: "100%"
              }} showSearch allowClear optionFilterProp="label" className="data-value" options={optionsReferModal?.listReferStatus || []} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="numOfCoordinate" label={<label className="gx-text-primary fw-bold">
              จำนวนครั้งที่ประสาน
            </label>}>
              <Input className="data-value" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="problem" label={<label className="gx-text-primary fw-bold">
              ปัญหาที่พบ
            </label>}>
              <TextArea autoSize maxLength={2000} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Spin>
  </Modal>;
}
const listDdApi = {
  GetMasterTriages: {
    url: "OpdExamination/GetMasterTriages",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetReferPtTypes: {
    url: "Masters/GetReferPtTypes",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetReceiveTypes: {
    url: "Masters/GetReceiveTypes",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetDoctorMas: {
    url: "Masters/GetDoctorMas",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetRefferStatus: {
    url: "Masters/GetRefferStatus",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetBedsDepartList: {
    url: "Masters/GetBedsDepartList",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetReferTypeMas: {
    url: "Masters/GetReferTypeMas",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
  GetWorkPlacesMas: {
    url: "OpdExamination/GetWorkPlacesMas",
    method: "POST",
    sendRequest: false,
    return: "responseData",
  },
}
export const DelWpr = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DeleteWorkPlaceRefer`,
    method: "POST",
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