import { DeleteOutlined, EditOutlined, RedoOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card, Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select, Tag,
  TreeSelect
} from "antd";
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker.js';
import { notiError, notiSuccess, } from "components/Notification/notificationX";
import dayjs from "dayjs";
import "dayjs/locale/th"; // without this line it didn't work
import { differenceBy, map } from "lodash";
import { useEffect, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { env } from '../../env.js';
import * as api from "./API/EMessage/EMessage";
const {
  TextArea
} = Input;
const {
  TreeNode
} = TreeSelect;
const {
  Option
} = Select;
const textDefault = "data-value"

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function EMessageAntdDatePicker({
  isVisible = false,
  onOk = () => { },
  onCancel = () => { },
  patientId = null,
  workId = null,
  ...props
}) {
  const [form] = Form.useForm();
  const [selectDeptVisible, setSelectDeptVisible] = useState(true);
  const [workPlaceDropdown, setWorkPlaceDropdown] = useState([]);
  const [deleteSelected, setDeleteSelected] = useState([]);
  const [disabledDate, setDisabledDate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [prevWorkPlaces, setPrevWorkPlaces] = useState([]);
  const [messageList, setMessageList] = useState({
    result: [],
    totalPages: 50
  });
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
  const onChangeRadio = v => {
    switch (v) {
      case "2":
        setSelectDeptVisible(true);
        break;
      case "3":
        setSelectDeptVisible(true);
        break;
      default:
        setSelectDeptVisible(false);
        break;
    }
  };
  const modalOk = () => {
    form.submit();
  };

  const initDropdown = async () => {
    let workPlaceDropdown = await api.EMessage.GetWorkPlacesMas();
    setWorkPlaceDropdown(workPlaceDropdown.responseData);
    return;
  };
  const fetchPatientDetail = async patientId => {
    if (!isVisible) return;
    if (isNaN(patientId)) return;
    const res = await api.EMessage.getPatientEMessageDetail(patientId);
    const detail = res.responseData;
    setPatientDetail({
      picture: detail.picture,
      displayName: detail.displayName,
      hn: detail.hn,
      age: detail.age
    });

    const resMessage = await api.EMessage.getPatientMessage({
      patientId: patientId,
      workId: /* roomValue || userWorkId */null,
      isToday: null,
      page: "1",
      rows: null
    });
    const resultMessage = resMessage?.responseData?.results?.map(prev => {
      return {
        ...prev,
        disabled: prev?.userCreated === user
      };
    });
    const totalPagesMessage = resMessage?.responseData?.totalCount;
    setMessageList({
      result: resultMessage,
      totalPages: totalPagesMessage
    });
  };
  const newMessageBtn = () => {
    setEditId(null);
    setPrevWorkPlaces([]);
    setSelectDeptVisible(false);
    setDisabledDate(false);
    form.resetFields();
    success("เริ่มสร้างข้อความใหม่");
  };
  const handleResponse = res => {
    if (res.isSuccess === true) {
      setEditId(null);
      setPrevWorkPlaces([]);
      form.resetFields();
      setDisabledDate(false);
      setSelectDeptVisible(false);
      fetchPatientDetail(patientId);
      notiSuccess({})
      return;
    } else notiError({})
    return;
  };
  const handleFinish = async v => {
    // console.log('v', v)
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
              dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
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
              dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
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
        action: "add",
        patientId: patientId,
        ptMessId: editId,
        message: v.message,
        startDate: v.startDate ? dayjs(v.startDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        endDate: v.endDate ? dayjs(v.endDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        foreverFlag: v.foreverFlag ? "Y" : null,
        messageType: v.messageType,
        //1 => เห็นทุกหน่วย, 3 => เห็นบางหน่วย
        workId: v.workId ? String(v?.workId) : null,
        subject: v.subject,
        userCreated: v.userCreated,
        dateCreated: v.dateCreated,
        userModified: user,
        dateModified: dayjs().format("YYYY-MM-DD HH:mm"),
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
        startDate: v.startDate ? dayjs(v.startDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        endDate: v.endDate ? dayjs(v.endDate, "DD/MM/YYYY").format("YYYY-MM-DD") : null,
        foreverFlag: v.foreverFlag ? "Y" : null,
        messageType: v.messageType,
        //1 => เห็นทุกหน่วย, 3 => เห็นบางหน่วย
        workId: v.workId ? String(v?.workId) : null,
        subject: v.subject,
        userCreated: user,
        dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
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
            dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
            userModified: null,
            dateModified: null,
            workName: null,
            placeType: null
          };
        })
      };
      res = await api.EMessage.upsertPatientMessage(req);
      handleResponse(res);
    }
  };
  useEffect(() => {
    initDropdown();

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
  const showMessageType = (type) => {
    switch (type) {
      case "1":
        return "ทั้งหมด";
      case "4":
        return "เฉพาะ OPD";
      case "5":
        return "เฉพาะ IPD";
      default:
        return "ทั้งหมด";
    }
  }
  return <>
    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>
      E-Message
    </label>}
      centered
      visible={isVisible && patientId !== null ? isVisible : false}
      onOk={() => {
        modalOk();
      }} onCancel={() => {
        onCancel();
      }} width={1180} okText="บันทึก" cancelText="ปิด">
      <Row gutter={[16, 8]} style={{
        marginBottom: -28,
        marginTop: -12
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
                <Avatar size={60} src={patientDetail.picture == null ? `${env.PUBLIC_URL}/assets/images/placeholder.jpg` : `data:image/png;base64,${patientDetail.picture}`} />
              </Col>
              <Col span={19}>
                <label className="gx-text-primary fw-bold mb-1" style={{
                  fontSize: 16
                }}>
                  {patientDetail.displayName || "-"}
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
                  {patientDetail.hn}
                </label>
                <label className="gx-text-primary fw-bold ms-2" style={{
                  fontSize: 16
                }}>
                  อายุ
                </label>
                <label className="fw-bold ms-1" style={{
                  fontSize: 16
                }}>
                  {patientDetail.age}
                </label>
              </Col>
            </Row>}
            >
              <div style={{ marginLeft: -20, marginRight: 20, marginBottom: -20 }}>
                <Form form={form} name="basic" onFinish={handleFinish} layout="vertical"
                // onFinishFailed={() => {
                //     unvalid()
                // }}
                >
                  <Row gutter={[8, 8]} style={{
                    marginTop: -14,
                    flexDirection: "row"
                  }}>
                    <Col span={12}>
                      <Form.Item style={{ marginBottom: 0 }} name={`workId`} label={<label className="gx-text-primary">
                        หน่วยงานที่ส่งเรื่อง
                      </label>}>
                        <Select showSearch style={{
                          width: "100%"
                        }}
                          // allowClear={true}
                          optionFilterProp="children" placeholder="เลือกหน่วยงานที่ส่งเรื่อง" dropdownMatchSelectWidth={300} className="data-value">
                          {workPlaceDropdown?.length > 0 ? workPlaceDropdown.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                            {val.datadisplay}
                          </Option>) : []}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item style={{ marginBottom: 0 }} name="subject" label={<label className="gx-text-primary">เรื่อง</label>}>
                        <Input placeholder="ระบุหัวข้อเรื่อง" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item style={{ marginBottom: 4 }} name={`message`} label={<label className="gx-text-primary">รายละเอียด</label>} rules={[{
                        required: true,
                        message: "กรุณาระบุข้อความ"
                      }]}>
                        <TextArea placeholder="ระบุข้อความ" showCount maxLength={300} style={{
                          height: 150
                        }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} style={{
                    flexDirection: "row"
                  }}>
                    <Col span={8}>
                      <Form.Item style={{ marginBottom: 0 }} shouldUpdate={(prev, cur) => prev.startDate !== cur.startDate}>
                        {({
                          getFieldValue
                        }) => <DayjsDatePicker name="startDate" form={form} placeholder={"เริ่มแสดง"} clearable={true} height="36px" defaultDate={getFieldValue("startDate")} disabled={disabledDate} required={!disabledDate} />}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item style={{ marginBottom: 0 }} shouldUpdate={(prev, cur) => prev.endDate !== cur.endDate}>
                        {({
                          getFieldValue
                        }) => <DayjsDatePicker name="endDate" form={form} placeholder={"แสดงถึง"} clearable={true} height="36px" defaultDate={getFieldValue("endDate")} disabled={disabledDate} required={!disabledDate} />}
                      </Form.Item>
                    </Col>
                    <Col span={4} className="text-nowrap">
                      <Form.Item style={{ marginBottom: 0 }} name={`foreverFlag`} valuePropName="checked" onChange={e => {
                        setDisabledDate(() => e.target.checked);
                        if (e.target.checked) {
                          form.setFieldsValue({
                            startDate: null,
                            endDate: null
                          });
                        }
                      }}>
                        <Checkbox className="gx-text-primary fw-bold ms-1">
                          แสดงเสมอ
                        </Checkbox>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} >
                    <Col span={24}>
                      <Form.Item
                        style={{ marginBottom: 4 }}
                        name="messageType"
                        label={<label className="gx-text-primary">หน่วยงานที่สามารถเห็นข้อความ</label>}
                        // preserve={false}
                        initialValue={"1"}
                      >
                        <Select
                          style={{ width: 200 }}
                          showSearch
                          className={textDefault}
                          optionFilterProp="label"
                          options={optionsMessageType}
                          onChange={v => onChangeRadio(v)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      {selectDeptVisible ? <Form.Item style={{ marginBottom: 0 }} name="patientMessageWorkPlaces" rules={[{
                        required: true,
                        message: "กรุณาเลือกหน่วยงาน"
                      }]}>
                        <TreeSelect showSearch treeNodeFilterProp="title" style={{
                          width: "100%"
                        }} dropdownStyle={{
                          maxHeight: 400,
                          overflow: "auto"
                        }} placeholder="เลือกได้มากกว่าหนึ่ง" allowClear multiple treeDefaultExpandAll onDeselect={x => {
                          setDeleteSelected([...deleteSelected, ...x]);
                        }} onSelect={x => {
                          let temp = [...deleteSelected];
                          temp.forEach((ele, index) => {
                            if (x === ele) {
                              temp.splice(index, 1);
                            }
                          });
                          setDeleteSelected(temp);
                        }}>
                          {workPlaceDropdown?.length > 0 && workPlaceDropdown.map((ele, i) => <TreeNode key={i} value={ele.datavalue} title={ele.datadisplay} />)}
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
                {messageList?.result?.map((ele, i) => <Card key={i} headStyle={{
                  backgroundColor: "#FAFAFA"
                }}
                >
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
                            workId: ele?.workId || null,
                            foreverFlag: ele.foreverFlag === "Y",
                            startDate: ele.startDate ? dayjs(ele.startDate) : null,
                            endDate: ele.endDate ? dayjs(ele.endDate) : null,
                            patientMessageWorkPlaces: map(ele.patientMessageWorkPlaces, "workId")
                          });
                          if (ele.patientMessageWorkPlaces.length > 0) {
                            setSelectDeptVisible(true);
                            setPrevWorkPlaces(ele.patientMessageWorkPlaces);
                          } else {
                            setSelectDeptVisible(false);
                            setPrevWorkPlaces([]);
                          }
                          if (ele.foreverFlag === "Y") {
                            setDisabledDate(() => true);
                          } else {
                            setDisabledDate(() => false);
                          }
                        }} />
                        {ele.disabled ? <Popconfirm title={<label className="text-danger">
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
                        <label className="gx-text-primary fw-bold me-2">
                          รายละเอียด :
                        </label>
                        <label className="data-value ms-1 mb-1">
                          {ele?.message || "-"}
                        </label>
                      </Col>
                      <Col span={12}>
                        <label className="gx-text-primary fw-bold me-2">
                          วันที่เริ่มต้น :
                        </label>
                        <label className="data-value ms-1 mb-1">
                          {ele?.dateCreated ? dayjs(ele.dateCreated, "MM/DD/YYYY HH:mm:ss").add(543, "years").format("DD/MM/YYYY") : "-"}
                        </label>
                      </Col>
                      <Col span={12}>
                        <label className="gx-text-primary mb-1">
                          วันที่สิ้นสุด :
                        </label>
                        <label className="data-value ms-1 mb-1">
                          {ele?.dateCreated ? dayjs(ele.dateCreated, "MM/DD/YYYY HH:mm:ss").add(543, "years").format("DD/MM/YYYY") : "-"}
                        </label>
                      </Col>
                      <Col span={24}>
                        <label className="gx-text-primary fw-bold me-2">
                          สำหรับที่สามารถเห็นข้อความ :
                        </label>
                        {
                          ele.messageType === "3"
                            ? ele.patientMessageWorkPlaces.map((tag, i) => <Tag key={i} color="#108ee9">{tag.workName} </Tag>)
                            : <Tag key={i} color="#87d068">{showMessageType(ele.messageType)} </Tag>
                        }
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
    </Modal>
  </>;
}
const optionsMessageType = [
  {
    value: "1",
    label: "ทั้งหมด",
    className: textDefault,
  },
  {
    value: "2",
    label: "เฉพาะหน่วยงาน",
    className: textDefault,
  },
  {
    value: "3",
    label: "เฉพาะห้องตรวจ",
    className: textDefault,
  },
  {
    value: "4",
    label: "เฉพาะ OPD",
    className: textDefault,
  },
  {
    value: "5",
    label: "เฉพาะ IPD",
    className: textDefault,
  },
]