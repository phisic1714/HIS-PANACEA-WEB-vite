import { env } from '../../env.js';

import React, { useEffect, useState } from "react";
import { Input, Button, Modal, Row, Col, Avatar, Card, Checkbox, TreeSelect, Select, Radio, Tag, Form, message, Popconfirm, Badge } from "antd";
import { EditOutlined, DeleteOutlined, RedoOutlined } from "@ant-design/icons";
import * as api from "./API/EMessage/EMessage";
import moment from "moment";
import "moment/locale/th"; // without this line it didn't work
import Noti from "./Notifications";
import DatepickerWithForm from "../../components/DatePicker/DatePickerWithForm";
import { momentTH, momentEN } from "../../components/helper/convertMoment";
import { map, differenceBy } from "lodash";
import { Scrollbars } from "react-custom-scrollbars";
import { useDispatch, useSelector } from "react-redux";
import { dspDropdowsEmessage } from "appRedux/actions";

const {
  TextArea
} = Input;
const {
  TreeNode
} = TreeSelect;
const {
  Option
} = Select;
export default function EMessageAntdDatePicker(props) {
  const dispatch = useDispatch();
  const optionsEmessage = useSelector(({ getDropdowns }) => getDropdowns.optionsEmessage);
  const [form] = Form.useForm();
  // Watch
  const foreverFlag = Form.useWatch("foreverFlag", form)
  const {
    isVisible,
    // eslint-disable-next-line no-unused-vars
    onOk = () => { },
    onCancel = () => { },
    patientId
  } = props;
  const [radioState, setRadioState] = useState("1");
  const [selectDeptVisible, setSelectDeptVisible] = useState(true);
  const [deleteSelected, setDeleteSelected] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [prevWorkPlaces, setPrevWorkPlaces] = useState([]);
  const [messageList, setMessageList] = useState({
    result: [],
    totalPages: 50
  });
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  let user = userFromSession.responseData.userId;
  const [patientDetail, setPatientDetail] = useState({
    picture: null,
    displayName: null,
    hn: null,
    age: null
  });
  const success = text => {
    message.success(text);
  };
  const error = text => {
    message.error(text);
  };
  const warning = text => {
    message.warning(text);
  };
  const unvalid = () => {
    return message.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
  };
  const onChangeRadio = val => {
    let value = val.target.value;
    setRadioState(value);
    switch (value) {
      case "1":
        setSelectDeptVisible(false);
        break;
      case "2":
        setSelectDeptVisible(true);
        break;
      case "3":
        setSelectDeptVisible(true);
        break;
      default: break;
    }
  };
  const modalOk = () => {
    form.submit();
    // onOk()
  };

  const initDropdown = async () => {
    if (Object.keys(optionsEmessage).length) return
    const workPlaceDropdown = await api.EMessage.getListWorkPlace();
    dispatch(dspDropdowsEmessage({
      workPlaceDropdown: workPlaceDropdown?.responseData || [],
    }))
    return;
  };
  const fetchPatientDetail = async patientId => {
    if (!isVisible) return;
    if (isNaN(patientId)) return;
    let res = await api.EMessage.getPatientEMessageDetail(patientId);
    let detail = res.responseData;
    setPatientDetail({
      picture: detail.picture,
      displayName: detail.displayName,
      hn: detail.hn,
      age: detail.age
    });

    let resMessage = await api.EMessage.getPatientMessage({
      patientId: patientId,
      workId: /* roomValue || userWorkId */null,
      isToday: null,
      page: "1",
      rows: null
    });
    let resultMessage = resMessage?.responseData?.results?.map(prev => {
      return {
        ...prev,
        disabled: prev.userCreated !== user
      };
    });
    let totalPagesMessage = resMessage.responseData.totalCount;
    setMessageList({
      result: resultMessage,
      totalPages: totalPagesMessage
    });
  };

  // console.log("messageList   =>  ", messageList);

  const newMessageBtn = () => {
    setEditId(null);
    setPrevWorkPlaces([]);
    setSelectDeptVisible(false);
    form.resetFields();
    success("เริ่มสร้างข้อความใหม่");
  };
  const handleResponse = res => {
    if (res.isSuccess === true) {
      setEditId(null);
      setPrevWorkPlaces([]);
      form.resetFields();
      setSelectDeptVisible(false);
      setRadioState("1");
      setProcessResult(res);
      setNotificationType("result");
      setNotificationsTitle("บันทึก E-Message");
      setShowNotificationsModal(true);
      fetchPatientDetail(patientId);
      return;
    }
    setProcessResult("บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ ข้อมูล");
    setNotificationType("error");
    setNotificationsTitle("บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ ข้อมูล");
    setShowNotificationsModal(true);
    return;
  };
  const handleFinish = async v => {
    const userFromSession = JSON.parse(sessionStorage.getItem("user"));
    let user = userFromSession.responseData.userId;
    let res;
    if (editId) {
      // Update
      let workPlacesForIns = [];
      let workPlacesForDel = [];
      if (v.messageType === "1") {
        // กรณีเลือกแสดงทุกหน่วยงาน => ลบหมด
        workPlacesForDel = map(prevWorkPlaces || [], o => {
          return {
            ...o,
            action: "delete"
          };
        });
      } else {
        // กรณีเลือกแสดงเฉพาะหน่วยงานที่ระบุ
        if (prevWorkPlaces?.length === 0) {
          // กรณีไม่มีห้องที่เลือกไว้ก่อน => Insert หมด
          workPlacesForIns = map(v.patientMessageWorkPlaces, o => {
            return {
              action: "add",
              ptMessId: editId || null,
              ptMessWpId: null,
              ptMessWgId: null,
              workId: o,
              userCreated: user,
              dateCreated: moment().format("BBBB-MM-DD"),
              userModified: null,
              dateModified: null,
              workName: null,
              placeType: null
            };
          });
        } else {
          //กรณีมีห้องที่เลือกไว้ก่อน
          let mappingKeys = map(v.patientMessageWorkPlaces, o => {
            return {
              workId: o
            };
          });
          let differenceForIns = differenceBy(mappingKeys, prevWorkPlaces, "workId");
          let differenceForDel = differenceBy(prevWorkPlaces, mappingKeys, "workId");
          workPlacesForIns = map(differenceForIns, o => {
            return {
              action: "add",
              ptMessId: editId || null,
              ptMessWpId: null,
              ptMessWgId: null,
              workId: o.workId,
              userCreated: user,
              dateCreated: moment().format("BBBB-MM-DD"),
              userModified: null,
              dateModified: null,
              workName: null,
              placeType: null
            };
          });
          workPlacesForDel = map(differenceForDel || [], o => {
            return {
              ...o,
              action: "delete"
            };
          });
        }
      }
      let req = {
        // action: "add",
        patientId: patientId,
        ptMessId: editId,
        message: v.message,
        startDate: v.startDate ? moment(v.startDate).format("BBBB-MM-DD") : null,
        endDate: v.endDate ? moment(v.endDate).format("BBBB-MM-DD") : null,
        foreverFlag: v.foreverFlag ? "Y" : null,
        messageType: v.messageType,
        //1 => เห็นทุกหน่วย, 3 => เห็นบางหน่วย
        workId: v.workId ? String(v?.workId) : null,
        subject: v.subject,
        userCreated: v.userCreated,
        dateCreated: v.dateCreated,
        userModified: user,
        dateModified: moment().format("BBBB-MM-DD"),
        patientMessageWorkPlaces: [...workPlacesForIns, ...workPlacesForDel]
      };
      res = await api.EMessage.upsertPatientMessage(req);
      handleResponse(res);
    } else {
      // Insert
      let req = {
        patientId: patientId,
        ptMessId: v?.ptMessId || null,
        message: v.message,
        startDate: v.startDate ? moment(v.startDate).format("BBBB-MM-DD") : null,
        endDate: v.endDate ? moment(v.endDate).format("BBBB-MM-DD") : null,
        foreverFlag: v.foreverFlag ? "Y" : null,
        messageType: v.messageType,
        //1 => เห็นทุกหน่วย, 3 => เห็นบางหน่วย
        workId: v.workId ? String(v?.workId) : null,
        subject: v.subject,
        userCreated: user,
        dateCreated: moment().format("BBBB-MM-DD"),
        userModified: null,
        dateModified: null,
        patientMessageWorkPlaces: v.messageType === "1" ? [] : map(v.patientMessageWorkPlaces, o => {
          return {
            action: "add",
            ptMessId: v?.ptMessId || null,
            ptMessWpId: null,
            ptMessWgId: null,
            workId: o,
            userCreated: user,
            dateCreated: moment().format("BBBB-MM-DD"),
            userModified: null,
            dateModified: null,
            workName: null,
            placeType: null
          };
        })
      };
      res = await api.EMessage.upsertPatientMessage(req);
      handleResponse(res);
      // console.log('res', res)
    }
  };

  useEffect(() => {
    initDropdown();
    momentTH();
    return () => momentEN();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (patientId == null || patientId === undefined) {
      if (isVisible === true) warning("กรุณาเลือกผู้ป่วยก่อนเปิดกล่อง E-Message");
      onCancel();
      return;
    }
    if (isVisible) {
      form.resetFields();
      setSelectDeptVisible(false);
      fetchPatientDetail(patientId); /// fix please use dynamic
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);
  return <>
    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 17
    }}>
      E-Message
    </label>} centered visible={isVisible && patientId !== null ? isVisible : false} onOk={() => {
      modalOk();
    }} onCancel={() => {
      onCancel();
    }}
      width={1180}
      okText="บันทึก"
      cancelText="ปิด"
    >
      <div style={{ margin: -18 }}>
        <Row
          gutter={[16, 8]}
          style={{
            marginBottom: -28,
          }}>
          <Col span={10}>
            <Badge.Ribbon
              // placement="start"
              color="#EEEEEE" text={<label className="gx-text-primary fw-bold">
                {editId ? "แก้ไข E-Message" : "เพิ่ม E-Message"}
              </label>}>
              <Card headStyle={{
                backgroundColor: "#FAFAFA"
              }} title={<Row gutter={[8, 8]} align="middle">
                <Col span={5}>
                  <Avatar size={60} src={patientDetail?.picture == null ? `${env.PUBLIC_URL}/assets/images/placeholder.jpg` : `data:image/png;base64,${patientDetail?.picture}`} />
                </Col>
                <Col span={19}>
                  <label className="gx-text-primary fw-bold mb-1" style={{
                    fontSize: 16
                  }}>
                    {patientDetail?.displayName || "-"}
                  </label>
                  <br />
                  <label className="gx-text-primary fw-bold" style={{
                    fontSize: 16
                  }}>
                    HN
                  </label>
                  <label className="fw-bold ms-1" style={{
                    fontSize: 16
                  }}>
                    {patientDetail?.hn}
                  </label>
                  <label className="gx-text-primary fw-bold ms-2" style={{
                    fontSize: 16
                  }}>
                    อายุ
                  </label>
                  <label className="fw-bold ms-1" style={{
                    fontSize: 16
                  }}>
                    {patientDetail?.age}
                  </label>
                </Col>
              </Row>}
              >
                <div style={{ marginLeft: -16, marginRight: -16 }}>
                  <Form
                    form={form}
                    name="basic"
                    onFinish={handleFinish}
                    onFinishFailed={() => {
                      unvalid();
                    }}
                    layout="vertical"
                  >
                    <Row gutter={[8, 8]} style={{ marginTop: -14, flexDirection: "row" }}>
                      <Col span={7}>
                        <label className='gx-text-primary'>หน่วยงานที่ส่งเรื่อง</label>
                      </Col>
                      <Col span={17}>
                        <Form.Item
                          name={`workId`}
                          label={false}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            className='data-value'
                            showSearch
                            style={{ width: "100%" }}
                            optionFilterProp="children" placeholder="เลือกหน่วยงานที่ส่งเรื่อง">
                            {
                              optionsEmessage?.workPlaceDropdown?.map((val, index) => <Option
                                value={val.workId}
                                key={index}
                                className='data-value'
                              >
                                {`${val.workId} ${val.name}`}
                              </Option>)
                            }
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <label className="gx-text-primary">เรื่อง</label>
                      </Col>
                      <Col span={21}>
                        <Form.Item
                          name={`subject`}
                          label={false}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="ระบุหัวข้อเรื่อง" />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.Item
                          name={`message`}
                          label={<label className="gx-text-primary">รายละเอียด</label>}
                          rules={[{
                            required: true,
                            message: "กรุณาระบุข้อความ"
                          }]}>
                          <TextArea
                            placeholder="ระบุข้อความ"
                            showCount
                            maxLength={300}
                            style={{
                              height: 100
                            }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row
                      gutter={[8, 8]}
                      align="middle"
                      style={{ flexDirection: "row" }}
                    >
                      <Col span={8}>
                        <Form.Item
                          shouldUpdate={(prev, curr) => prev.activeForever !== curr.activeForever}
                          name="startDate" rules={[{
                            required: !foreverFlag,
                            message: "ระบุวันที่"
                          }]}
                          style={{ marginBottom: 0 }}
                        >
                          <DatepickerWithForm placeholder="เริ่มแสดง" format={"DD/MM/YYYY"} form={form} name="startDate" style={{
                            width: "100%"
                          }} disabled={foreverFlag} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          shouldUpdate={(prev, curr) => prev.rangeActiveMessageStart !== curr.rangeActiveMessageStart}
                          name="endDate"
                          rules={[{
                            required: !foreverFlag,
                            message: "ระบุวันที่"
                          }]}
                          style={{ marginBottom: 0 }}
                        >
                          <DatepickerWithForm placeholder="แสดงถึง" format={"DD/MM/YYYY"} form={form} name="endDate" style={{
                            width: "100%"
                          }} disabled={foreverFlag} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          // noStyle
                          name={"foreverFlag"}
                          valuePropName="checked"
                          onChange={e => {
                            if (e.target.checked) {
                              form.setFieldsValue({
                                startDate: null,
                                endDate: null
                              });
                            }
                          }}
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox className="gx-text-primary fw-bold ms-1">
                            แสดงเสมอ
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={[8, 8]} style={{
                      marginBottom: -24
                    }}>
                      <Col span={24} style={{
                        marginBottom: -14
                      }}>
                        <Form.Item style={{ marginBottom: 4 }}>
                          <label className="gx-text-primary fw-bold">
                            หน่วยงานที่สามารถเห็นข้อความ
                          </label>
                        </Form.Item>
                      </Col>
                      <Col span={24} style={{
                        marginBottom: -14
                      }}>
                        <Form.Item
                          name={`messageType`}
                          // preserve={false}
                          initialValue={"1"}
                          style={{ marginBottom: 10 }}
                        >
                          <Radio.Group options={[{
                            label: "ทั้งหมด",
                            value: "1"
                          }, {
                            label: "เฉพาะหน่วยงาน",
                            value: "2"
                          }, {
                            label: "เฉพาะห้องตรวจ",
                            value: "3"
                          }]} value={radioState} optionType="button" buttonStyle="solid" onChange={e => onChangeRadio(e)} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        {selectDeptVisible ? <Form.Item
                          name="patientMessageWorkPlaces"
                          rules={[{
                            required: true,
                            message: "กรุณาเลือกหน่วยงาน"
                          }]}
                          style={{ marginBottom: 10 }}
                        >
                          <TreeSelect
                            showSearch
                            treeNodeFilterProp="title"
                            style={{
                              width: "100%"
                            }}
                            dropdownStyle={{
                              maxHeight: 400,
                              overflow: "auto"
                            }}
                            placeholder="เลือกได้มากกว่าหนึ่ง"
                            allowClear
                            multiple
                            treeDefaultExpandAll
                            onDeselect={x => {
                              setDeleteSelected([...deleteSelected, ...x]);
                            }}
                            onSelect={x => {
                              let temp = [...deleteSelected];
                              temp.forEach((ele, index) => {
                                if (x === ele) {
                                  temp.splice(index, 1);
                                }
                              });
                              setDeleteSelected(temp);
                            }}>
                            {optionsEmessage?.workPlaceDropdown?.map(ele => <TreeNode
                              key={ele.workId}
                              value={`${ele.workId}`}
                              title={`${ele.workId} ${ele.name}`}
                            />
                            )}
                          </TreeSelect>
                        </Form.Item> : null}
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Card>
            </Badge.Ribbon>
          </Col>
          <Col span={14}>
            <Card headStyle={{
              backgroundColor: "#FAFAFA"
            }} title={<Row gutter={[8, 8]}>
              <Col span={12}>
                <label className="gx-text-primary fw-bold" style={{
                  fontSize: 16
                }}>
                  รายการ E-Message ของผู้ป่วย
                </label>
              </Col>
              <Col span={12} className="text-end">
                <Button type="primary"
                  // icon={<PlusSquareFilled />}
                  onClick={() => newMessageBtn()} style={{
                    margin: 0
                  }}>
                  สร้าง Message ใหม่
                </Button>
              </Col>
            </Row>}>
              <div style={{
                margin: -14
              }}>
                <Scrollbars autoHeight autoHeightMin={400}>
                  {messageList?.result?.map(ele => <Card key={ele.ptMessId}
                    headStyle={{
                      backgroundColor: "#FAFAFA"
                    }} style={{
                      marginBottom: 6
                    }}>
                    <div style={{
                      margin: "-12px 4px -12px 4px"
                    }}>
                      <Row gutter={[4, 4]}>
                        <Col span={18}>
                          <label className="gx-text-primary fw-bold me-2">
                            เรื่อง :
                          </label>
                          <label className="data-value ms-1 mb-1">
                            {ele?.subject || "-"}
                          </label>
                        </Col>
                        <Col span={6} className="text-end" hidden={!ele.deleteFlag}>
                          <Popconfirm title="กู้คืน ?"
                            okText="ตกลง"
                            cancelText="ปิด"
                            disabled={ele.disabled}
                            onConfirm={async () => {
                              const del = await api.EMessage.upsertPatientMessage({ ...ele, deleteFlag: null });
                              if (del?.isSuccess) {
                                success("กู้คืน E-Message สำเร็จ");
                                fetchPatientDetail(patientId);
                              } else {
                                error("กู้คืน E-Message ไม่สำเร็จ");
                              }
                            }}>
                            <Button
                              disabled={ele.disabled}
                              size="small"
                              icon={<RedoOutlined className='gx-text-primary' />}
                              style={{ margin: 0 }}
                            />
                          </Popconfirm>
                        </Col>
                        <Col span={6} className="text-end" hidden={ele.deleteFlag}>
                          <Button size="small" icon={<EditOutlined style={{
                            color: "blue"
                          }} />} style={{
                            margin: "0px 2px 0px 0px"
                          }} onClick={() => {
                            setEditId(ele.ptMessId);
                            form.setFieldsValue({
                              ...ele,
                              workId: ele?.workId ? Number(ele?.workId) : null,
                              foreverFlag: ele.foreverFlag === "Y",
                              startDate: ele.startDate ? moment(ele.startDate) : null,
                              endDate: ele.endDate ? moment(ele.endDate) : null,
                              patientMessageWorkPlaces: map(ele.patientMessageWorkPlaces, "workId")
                            });
                            if (ele.patientMessageWorkPlaces.length > 0) {
                              setSelectDeptVisible(true);
                              setPrevWorkPlaces(ele.patientMessageWorkPlaces);
                            } else {
                              setSelectDeptVisible(false);
                              setPrevWorkPlaces([]);
                            }
                          }} />
                          {!ele?.disabled ? <Popconfirm title={<label className="text-danger">
                            ลบรายการ ?
                          </label>} okText="ตกลง" cancelText="ยกเลิก" onConfirm={async () => {
                            let del = await api.EMessage.delPatientMessage(ele.ptMessId);
                            if (del?.isSuccess) {
                              success("ลบรายการ E-Message สำเร็จ");
                              fetchPatientDetail(patientId);
                            } else {
                              error("ลบรายการ E-Message ไม่สำเร็จ");
                            }
                          }}>
                            <Button size="small" icon={<DeleteOutlined style={{
                              color: "red"
                            }} />} style={{
                              margin: "0px 2px 0px 0px"
                            }} />
                          </Popconfirm> : <Button size="small" disabled={true} icon={<DeleteOutlined style={{
                            color: "red"
                          }} />} style={{
                            margin: "0px 2px 0px 0px"
                          }} />}
                        </Col>
                        <Col span={24}>
                          <label className="data-value ms-1 mb-1" style={{ wordBreak: "break-all" }}>
                            <span className="gx-text-primary fw-bold me-2">
                              รายละเอียด :
                            </span>
                            {ele?.message || "-"}
                          </label>
                        </Col>
                        <Col span={12}>
                          <label className="gx-text-primary fw-bold me-2">
                            วันที่เริ่มต้น :
                          </label>
                          <label className="data-value ms-1 mb-1">
                            {ele?.startDate ? moment(ele.startDate, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY") : "-"}
                          </label>
                        </Col>
                        <Col span={12}>
                          <label className="gx-text-primary mb-1">
                            วันที่สิ้นสุด :
                          </label>
                          <label className="data-value ms-1 mb-1">
                            {ele?.endDate ? moment(ele.endDate, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY") : "-"}
                          </label>
                        </Col>
                        <Col span={24}>
                          <label className="gx-text-primary fw-bold me-2">
                            สำหรับที่สามารถเห็นข้อความ :
                          </label>
                          {ele.messageType === "3" ? ele.patientMessageWorkPlaces.map((tag, i) => <Tag key={i} color="#108ee9">
                            {tag.workName}
                          </Tag>) : <Tag color="#87d068">ทั้งหมด</Tag>}
                        </Col>
                        <Col span={12}>
                          <label className="gx-text-primary fw-bold me-2">
                            ผู้บันทึก :
                          </label>
                          <label className="data-value ms-1 mb-1">
                            {ele?.userCreatedName || "-"}
                          </label>
                        </Col>
                        <Col span={12}>
                          <label className="gx-text-primary fw-bold me-2">
                            ผู้แก้ไข :
                          </label>

                          <label className="data-value ms-1 mb-1">
                            {ele?.userModifiedName || "-"}
                          </label>
                        </Col>
                        <Col span={12}>
                          <label className="gx-text-primary fw-bold me-2">
                            หน่วยที่ส่งเรื่อง :
                          </label>
                          <label className="data-value ms-1 mb-1">
                            {ele?.workName || "-"}
                          </label>
                        </Col>
                      </Row>
                    </div>
                  </Card>)}
                </Scrollbars>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
    <Noti setModal={() => {
      setShowNotificationsModal(false);
      setProcessResult({});
      setNotificationsTitle(null);
      setNotificationType(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type={notificationType} />
  </>;
}