import { env } from '../../env.js';


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCog } from "react-icons/fa";
import { EditOutlined, DeleteOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { AiOutlinePlus } from "react-icons/ai";
import { filter, find, intersectionBy } from "lodash";
import AddOrUpdVisit from "../../components/Modal/AddOrUpdVisit";
import moment from 'moment';
import { GetPatientRight } from '../../routes/AdmissionCenter/API/AdmitRegisterApi';
import { DelPatientsRights } from '../../routes/AdmissionCenter/API/AdmitRegisterApi';
import {
  Card, Table, Row, Col, Button, Form, Radio, Popconfirm, Modal,
  // Select,
  Spin, Checkbox, Tooltip,
  Popover
} from 'antd';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
const { lockRightFlag } = JSON.parse(localStorage.getItem("hos_param"));
export default function AdmitRegisterRight({ size = "middle", scrollY = 240, ...props }) {
  const { smartCard, patientInfo, setRequestDataRight, dispatch, smartCardAction, NHSORightRef, handleRightId = () => { }, serviceId, patientId, page = null } = props;
  const [rightForm] = Form.useForm();
  const [list, setList] = useState([]);
  const ptRightIdRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const operatorStatusRef = useRef(null);
  const [mainFlag, setMainFlag] = useState(null);
  const [visitMain, setVisitMain] = useState([]);
  const [editId, setEditId] = useState("");
  const [prevVisit, setPrevVisit] = useState({});
  const [loading, setLoading] = useState(false)
  const [optionsOpdRight, setOptionsOpdRight] = useState([])
  // console.log(mainFlag);
  // console.log(visitMain);
  const dateTrans = (date, format,) => {
    if (date) {
      return moment(date, format).format("DD/MM") + "" + moment(date, format).add(543, "year").format("/YYYY HH:mm");
    } else {
      return "-";
    }
  };
  const onRadioChange = e => {
    setMainFlag(e.target.value);
    // let ptRightId = list.filter(item => item.rightId === e.target.value)[0].ptRightId;
    setVisitMain(visitMain => [...visitMain, e.target.value]);
    // handleRightId(e.target.value, [...visitMain, e.target.value]);
  };

  useEffect(() => {
    if (mainFlag && visitMain?.length > 0) {
      handleRightId(mainFlag, visitMain);
    } else {
      handleRightId(null, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainFlag, visitMain]);
  const columns = [{
    title: <label className="gx-text-primary"></label>,
    align: "center",
    width: 45,
    fixed: "left",
    render: val => <Checkbox.Group value={visitMain} disabled={val.mainFlag === "F" || val.mainFlag === "C" ? true : false}>
      <Checkbox value={val.ptRightId} onClick={async e => {
        if (e.target.checked) {
          setVisitMain(visitMain => {
            return [...visitMain, e.target.value];
          });
          if (!mainFlag) {
            setMainFlag(e.target.value);
          }
          // handleRightId(rightId, [...visitMain, e.target.value]);
        } else {
          if (e.target.value === mainFlag) {
            let visitMainWithoutCurrent = filter(visitMain, o => o !== mainFlag);
            if (visitMainWithoutCurrent?.length > 0) {
              setMainFlag(visitMainWithoutCurrent[0]);
              setVisitMain(() => visitMainWithoutCurrent);
            } else {
              setMainFlag(null);
              setVisitMain(() => []);
            }
          }
          // if (visitMain.includes(e.target.value)) {
          //     let checkHavemain = find(list, (i) => i.rightId === mainFlag && i.ptRightId === e.target.value)
          //     if (checkHavemain) {

          //     } else {
          //         const filteredItems = visitMain.filter(filteredItem => filteredItem !== e.target.value);
          //         setVisitMain([...filteredItems]);

          //         if (filteredItems.length === 1) {
          //             handleRightId(filteredItems[0], [...filteredItems]);
          //         } else {
          //             if (filteredItems.length === 0) {
          //                 setMainFlag(null);
          //                 handleRightId([], []);
          //             }
          //         }
          //     }

          // }
        }
      }} />
    </Checkbox.Group>
  }, {
    title: <label className="gx-text-primary">สิทธิ์การรักษา</label>,
    // width: 222,
    render: val => <div>
      {val.mainFlag === "F" || val.mainFlag === "C" ? <label className="data-value-danger">{val.rightName}</label> : <label className="data-value-green">{val.rightName}</label>}
    </div>
  }, {
    title: <label className="gx-text-primary">สิทธิ์หลัก?</label>,
    align: "center",
    width: 100,
    render: val => <Radio.Group onChange={onRadioChange} value={mainFlag} disabled={val.mainFlag === "F" || val.mainFlag === "C" ? true : false}>
      <Radio value={val.ptRightId} />
    </Radio.Group>
  }, {
    title: <label className="gx-text-primary">วันที่ใช้สิทธิ์ล่าสุด</label>,
    dataIndex: 'lastUse',
    width: 150,
    align: 'center'
  }, {
    title: <label className="gx-text-primary">หมายเลขบัตร</label>,
    dataIndex: 'insid',
    width: 125
  }, {
    title: <label className="gx-text-primary">รพ.หลัก</label>,
    dataIndex: 'hmainName',
    width: 125
  }, {
    title: <label className="gx-text-primary">รพ.รอง</label>,
    dataIndex: 'hsubName',
    width: 125
  }, {
    title: <label className="gx-text-primary">รพ.ที่รักษาประจำ</label>,
    dataIndex: 'hmainOpName',
    width: 150
  }, {
    title: <label className="gx-text-primary">หน่วยงานต้นสังกัด</label>,
    dataIndex: 'govcode',
    width: 150
  }, {
    title: <label className="gx-text-primary">บัตรประชาชนเจ้าของสิทธิ์</label>,
    dataIndex: 'ownRightPid',
    width: 200
  }, {
    title: <label className="gx-text-primary">ความสัมพันธ์</label>,
    dataIndex: 'relinscl',
    width: 125
  }, {
    title: <label className="gx-text-primary">วันที่เริ่มต้น</label>,
    dataIndex: 'startDateDesc',
    width: 100,
    align: 'center'
  }, {
    title: <label className="gx-text-primary">วันที่สิ้นสุด</label>,
    dataIndex: 'expireDateDesc',
    width: 100,
    align: 'center'
  }, {
    title: <label className="gx-text-primary"><FaCog /></label>,
    dataIndex: 'operator',
    align: "center",
    width: 105,
    fixed: "right"
  }];
  const success = param => {
    Modal.success({
      content: param === "delete" ? "ลบข้อมูลสำเร็จ" : param === "add" ? "บันทึกข้อมูลสำเร็จ" : "เเก้ไขข้อมูลสำเร็จ",
      okText: "ปิด"
    });
  };
  const fail = param => {
    Modal.error({
      content: param === "delete" ? "ลบข้อมูลไม่สำเร็จ" : param === "add" ? "บันทึกข้อมูลไม่สำเร็จ" : "เเก้ไขข้อมูลไม่สำเร็จ",
      okText: "ปิด"
    });
  };
  const deleteMasterData = async param => {
    setLoading(p => !p)
    const result = await DelPatientsRights(param);
    setLoading(p => !p)
    if (result.isSuccess === true) {
      success("delete");
      setRequestApi();
    } else {
      fail("delete");
    }
    setShowModal(false);
  };

  // console.log('props :>> ', props);
  const defaultRights = async (listRight, serviceId) => {
    if (listRight?.length > 0) {
      // หาสิทธิ์หลัก
      if (serviceId) {
        let req = {
          patientId: patientId,
          serviceId: serviceId
        };
        setLoading(p => !p)
        let res = await GetOpdRightVisit(req);
        setLoading(p => !p)
        setOptionsOpdRight(intersectionBy(listRight, res, "rightId"))
        // console.log('GetOpdRightVisit :>> ', res);
        if (!res.length) return;
        let mainRightOpdVisitOfDate = find(res, ["mainFlag", "Y"]);
        if (!mainRightOpdVisitOfDate) return;
        let mainRight = find(listRight, ["rightId", mainRightOpdVisitOfDate.rightId]);
        if (mainRight) {
          setMainFlag(mainRight.ptRightId);
          setVisitMain([mainRight.ptRightId]);
        } else {
          let identifyRight = find(listRight, ["identifyFlag", "Y"]);
          if (identifyRight) {
            setMainFlag(identifyRight.ptRightId);
            setVisitMain([identifyRight.ptRightId]);
          } else {
            setMainFlag(listRight[0]?.ptRightId);
            setVisitMain([listRight[0]?.ptRightId]);
          }
        }
        return;
      }
      let mainRight = find(listRight, ["mainFlag", "Y"]);
      if (mainRight) {
        setMainFlag(mainRight.ptRightId);
        setVisitMain([mainRight.ptRightId]);
      } else {
        let identifyRight = find(listRight, ["identifyFlag", "Y"]);
        if (identifyRight) {
          setMainFlag(identifyRight.ptRightId);
          setVisitMain([identifyRight.ptRightId]);
        } else {
          setMainFlag(listRight[0]?.ptRightId);
          setVisitMain([listRight[0]?.ptRightId]);
        }
      }
    }
  };
  const setRequestApi = async () => {
    let tempList = [];
    const result = await GetPatientRight(patientId);
    // eslint-disable-next-line array-callback-return
    result.map((val, index) => {
      let dateCreatedDesc = val.dateCreated ? dateTrans(val.dateCreated, "MM/DD/YYYY HH:mm") : null;
      let dateModifiedDesc = val.dateModified ? dateTrans(val.dateModified, "MM/DD/YYYY HH:mm") : null;
      let startDateDesc = val.dateModified ? dateTrans(val.dateModified, "MM/DD/YYYY HH:mm") : null;
      let expireDateDesc = val.expireDate ? dateTrans(val.expireDate, "MM/DD/YYYY HH:mm") : null;
      tempList.push({
        ...val,
        remark: val.remark,
        ptRightId: val.ptRightId,
        rightId: val.rightId,
        key: index,
        lastUse: val.lastUse ? dateTrans(val.lastUse, "MM/DD/YYYY hh:mm") : null,
        startDateDesc: startDateDesc ? startDateDesc.slice(0, 10) : null,
        expireDateDesc: expireDateDesc ? expireDateDesc.slice(0, 10) : null,
        operator: <Row gutter={[4, 4]} className="text-nowrap">
          <Col span={8}>
            <Tooltip title={<>
              <label className="data-value mb-1">ผู้บันทึก</label>
              <label className="data-value ms-1">{val?.userCreated || "-"}</label>
              <label className="data-value ms-2 mb-1">{dateCreatedDesc || "-"}</label>
              <br />
              <label className="data-value mb-1">ผู้แก้ไข</label>
              <label className="data-value ms-1">{val?.userModified || "-"}</label>
              <label className="data-value ms-2 mb-1">{dateModifiedDesc || "-"}</label>
            </>}>
              <Button style={{
                margin: 0
              }} icon={<UserSwitchOutlined className="gx-text-primary" />} size="small" />
            </Tooltip>
          </Col>
          <Col span={8}>
            <Button style={{
              margin: 0
            }} icon={<EditOutlined style={{
              color: "blue"
            }} />} size="small" onClick={() => {
              const stDate = moment(val.startDate).format('x');
              const edDate = moment(val.expireDate).format('x');
              ptRightIdRef.current = val.ptRightId;
              setPrevVisit(val);
              setEditId(val.ptRightId);
              rightForm.setFieldsValue({
                rightId: val.rightId,
                insid: val.insid,
                hmain: val.hmain,
                Hsub: val.hsub,
                hmainOp: val.hmainOp,
                ownRightPid: val.ownRightPid,
                relinscl: val.relinscl,
                startDate: val.startDate ? moment(Number(stDate)) : null,
                expireDate: val.expireDate ? moment(Number(edDate)) : null,
                govcode: val.govcode
              });
              operatorStatusRef.current = 'edit';
              setShowModal(true);
            }} />
          </Col>
          <Col span={8}>
            <Popconfirm title="ต้องการลบรายการนี้ ？" okText="Yes" onConfirm={() => {
              deleteMasterData(val.ptRightId);
            }} cancelText="No">
              <Button style={{
                margin: 0
              }} icon={<DeleteOutlined style={{
                color: "red"
              }} />} size="small" />
            </Popconfirm>
          </Col>
        </Row>
      });
    });
    setList(tempList);
  };
  useEffect(() => {
    defaultRights(list, serviceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, serviceId]);
  const closeModal = (name, reloadTable) => {
    if (reloadTable) {
      setRequestApi();
    }
    setShowModal(false);
    setPrevVisit({});
    setEditId("");
  };
  useEffect(() => {
    if (patientId) {
      setRequestApi();
      setVisitMain([]);
      setMainFlag(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const {
    message
  } = useSelector(({
    autoComplete
  }) => autoComplete);
  return <Spin spinning={loading}>
    <Card
      className='mb-2'
      size={size}
      title={<Row gutter={[8, 8]} align="middle" style={{
        marginTop: -4,
        marginBottom: -4
      }}>
        <Col span={12}>
          <strong><label className="gx-text-primary" style={{
            fontSize: 18
          }}>สิทธิ์การรักษา</label></strong>
        </Col>
        <Col span={12}>
          <Button
            size={size}
            style={{
              float: 'right',
              margin: 0
            }}
            type="primary" id="check-authen" disabled={!message} onClick={() => {
              const ws = new WebSocket("ws://localhost:8100");
              ws.onopen = function () {
                // console.log(e);
                if (smartCard?.IsHasCard) {
                  ws.send(JSON.stringify({
                    Type: "UC",
                    Url: ""
                  }));
                } else {
                  ws.send(JSON.stringify({
                    Type: "TOKEN",
                    Url: ""
                  }));
                }
              };
              ws.onmessage = function (e) {
                var jsonResult = "";
                // console.log(e);
                if (e?.data && e?.data !== "Connected Port : 127.0.0.1:8100" && e?.data !== "Find not found function") {
                  jsonResult = JSON.parse(e?.data);
                  if (jsonResult?.PatientIdCard == null) {
                    jsonResult.PatientIdCard = patientInfo.idCard;
                  }
                  // console.log(jsonResult);

                  if (jsonResult?.PatientIdCard == null) {
                    toast.error("เลขบัตรประชาชนคนไข้ไม่ถูกต้อง", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light"
                    });
                    return;
                  }
                  setRequestDataRight(jsonResult);
                  dispatch(smartCardAction({
                    ...smartCard?.Personal,
                    insid: jsonResult?.person_id
                  }));
                  if (jsonResult?.PatientIdCard && jsonResult?.Citizenid && jsonResult?.Token) {
                    NHSORightRef.current.setShowCheckVisitModal(true);
                  }
                  ws.close();
                  // console.log(jsonResult);
                }
                // console.log(jsonResult);
              };
            }}>
            ตรวจสอบสิทธิ์
          </Button>
          {
            lockRightFlag
              ? <Popover
                content={<label className="gx-text-primary fw-bold">Lock สิทธิ์การรักษา</label>}
                trigger="hover"
              >
                <Button
                  size={size}
                  className='me-2'
                  type="primary"
                  style={{
                    float: 'right',
                    margin: 0
                  }}
                  disabled
                  icon={<AiOutlinePlus />}
                >เพิ่มสิทธิ์</Button>
              </Popover>
              : <Button
                size={size}
                className='me-2'
                type="primary"
                style={{
                  float: 'right',
                  margin: 0
                }}
                icon={<AiOutlinePlus />} onClick={() => {
                  operatorStatusRef.current = 'add';
                  rightForm.resetFields();
                  setShowModal(true);
                }}>เพิ่มสิทธิ์</Button>
          }
        </Col>
      </Row>} style={{
        width: '100%'
      }}>
      <div style={{ margin: -6 }}>
        <Table
          size={size}
          scroll={{
            x: 1880,
            y: scrollY,
          }}
          columns={columns}
          dataSource={optionsOpdRight}
          rowClassName={"data-value"}
          pagination={false}
        />
      </div>
    </Card>
    <AddOrUpdVisit
      show={showModal}
      modalControl={closeModal}
      patientData={[list || {}]}
      editId={editId}
      prevVisit={prevVisit}
      useDateTrans={false}
      page={page}
      disabled={lockRightFlag}
    />
  </Spin>;
}

const GetOpdRightVisit = async req => {
  // Delete สิทธิ์การรักษา [/]
  let res = await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetOpdRightVisitOfDate`, {
    method: "POST",
    data: {
      requestData: req
    }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};