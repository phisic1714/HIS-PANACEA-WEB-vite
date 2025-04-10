import { env } from '../../env.js';
import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import { Row, Col, Button, Table, Modal, Spin, Checkbox, Popconfirm, Radio, Card, Form, Input, Select, DatePicker } from 'antd';
import Column from 'antd/lib/table/Column';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AddOrUpdVisit from "../Modal/AddOrUpdVisit";
import { useSelector } from "react-redux";
import moment from 'moment';
import thaiIdCard from 'thai-id-card';
import { InputNumber } from '../Input/InputNumber';
import Notifications from "../Modal/Notifications";
import { find, filter } from "lodash";

const {
  Option
} = Select;

const btnEdit = {
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  backgroundColor: "#2962FF",
  boxShadow: "0px 1px 2px 0 #B0BEC5",
  color: "#FFFFFF",
  cursor: "pointer"
};

const btnNotAllowed = {
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  backgroundColor: "#CFD8DC",
  boxShadow: "0px 1px 2px 0 #B0BEC5",
  color: "#FFFFFF",
  cursor: "not-allowed"
};

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;

export default function AddRight({
  setModal,
  reloadAddRight = null,
  personalData = {},
  serviceRight = [],
  page = null,
  patientTypeProp = "opd",
  getRightHistory = () => { },
  ...props
}) {
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

  const [checkedList, setCheckedList] = useState([]);
  const [mainFlag, setMainFlag] = useState(null);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [patientsRights, setPatientsRights] = useState(null);
  const [opdPatientRight, setOpdPatientRight] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const dateFormat = 'DD/MM/YYYY';
  const [reloadVisitOfDateTable, setReloadVisitOfDateTable] = useState(0);
  const [checkedOpdRightList, setCheckedOpdRightList] = useState([]);
  const checkedOpdRight = useRef([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [addOrUpdVisitModal, setAddOrUpdVisitModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [prevVisit, setPrevVisit] = useState({});
  const [showVisitOfDateModal, setShowVisitOfDateModal] = useState(false);
  const [rightsVisitList, setrightsVisitList] = useState([]);
  const [relinsclList, setRelinsclList] = useState([]);
  const [govcodesList, setGovcodesList] = useState([]);
  const [hospcodesList, setHospcodesList] = useState([]);

  // ตรวจสอบ IdCard
  const idCardVerifyNoRequired = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (value) {
      if (value.number === "") {
        return Promise.resolve();
      } else {
        if (thaiIdCard.verify(value)) {
          return Promise.resolve();
        }
        if (thaiIdCard.verify(value.number)) {
          return Promise.resolve();
        }
      }
    }
    return Promise.reject(new Error('กรุณาป้อนเลขบัตรประชาชนให้ถูกต้อง!'));
  };
  // แปลง พศ => คศ
  const DATE_REGEXP = new RegExp('^(0?[1-9]|[1-2][0-9]|3[0-1])/(0?[1-9]|1[0-2])/([0-9]{4})$', 'gi');

  const dateTrans = date => {
    let result = date.replace(DATE_REGEXP, (str, day, month, year) => {
      return `${day}/${month}/${parseInt(year, 10) - 543}`;
    });
    return result;
  };
  //Api
  const getOpdRightVisitOfDate = async patientId => {
    let values = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": {
        "patientId": patientId
      },
      "barcode": null
    };
    let res = await Axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetOpdRightVisitOfDate`, values).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    setOpdPatientRight(res);
  };

  const getDataAdmitsPatientsRights = async selectPatientt => {
    await Axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitsPatientsRights`,
      method: "POST",
      data: {
        requestData: {
          fullName: selectPatientt.fullName,
          patientId: selectPatientt.patientId,
          hn: selectPatientt.hn,
          an: selectPatientt.an,
          admitId: selectPatientt.admitId
        }
      }
    }).then(res => {
      return setPatientsRights(res.data.responseData.map((val, index) => {
        return {
          ...val,
          key: index
        };
      }));
    }).catch(error => {
      return error;
    });
  };

  const InsAdmitRight = async () => {
    let addRight = patientsRights.filter(val => checkedList.includes(val.rightId));
    const userFromSession = JSON.parse(sessionStorage.getItem('user'));
    let user = userFromSession.responseData.userId;
    let reqData = addRight.map(val => {
      return {
        patientId: val.patientId,
        runHn: val.runHn,
        yearHn: val.yearHn,
        hn: val.hn,
        AdmitId: selectPatient.admitId,
        rightId: val.rightId,
        insid: val.insid,
        mainFlag: val.rightId === mainFlag ? "Y" : "",
        hmain: val.hmain,
        hsub: val.hsub,
        hmainOp: val.hmainOp,
        govcode: val.govcode,
        ownRightPid: val.ownRightPid,
        owner: val.owner,
        relinscl: val.relinscl,
        remark: val.remark,
        userCreated: user,
        UserModified: user,
        limit: null,
        opdFinance: "Y",
      };
    });
    await setLoading(true);
    await Axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/InsListAdmitRight`,
      method: "POST",
      data: {
        requestData: reqData
      }
    }).then(res => {
      setModal(false, true);
      setProcessResult(res.data);
      setNotificationsTitle("ดำเนินการเพิ่มสิทธิ์");
      setShowNotificationsModal(true);
      setMainFlag(null);
      setCheckedList([]);
      setPageCurrent(1);
    }).catch(error => {
      return error;
    });
    await setLoading(false);
  };

  const InsOpdRights = async () => {
    setLoading(true);
    let valuesForRequest = checkedOpdRightList.map(o => {
      return {
        "opdRightId": null,
        "serviceId": personalData.serviceId,
        "rightId": o.rightId,
        "patientId": personalData.patientId,
        "runHn": personalData?.runHn ? personalData.runHn : personalData.hn.split("/")[0],
        "yearHn": personalData?.yearHn ? personalData.yearHn : personalData.hn.split("/")[1],
        "hn": personalData.hn,
        "mainFlag": null,
        "userCreated": user,
        "dateCreated": null,
        "userModified": null,
        "dateModified": null,
        "amount": null,
        "copay": null,
        "discount": null,
        "claim": null,
        "payment": null,
        "reminburse": null,
        "limit": null,
        "insid": null,
        "hmain": null,
        "hsub": null,
        "hmainOp": null,
        "govcode": null,
        "ownrightpid": null,
        "owner": null,
        "relinscl": null,
        "referId": null,
        "receive": null,
        "claimcode": null,
        "remark": null,
        "approvalDate": null,
        "confirm": null,
        "dateConfirm": null,
        "userConfirm": null,
        "cashNotReturn": null,
        "cashReturn": null,
        "credit": null
      };
    });

    let req = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": valuesForRequest,
      "barcode": null
    };

    let res = await Axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/InsListOpdRights`, req).then(res => {
      return res.data;
    }).catch(error => console.log(error))
      .finally(() => {
        setLoading(false)
      })

    if (res.isSuccess === true) {
      setModal(false, true);
      setProcessResult(res);
      setNotificationsTitle("ดำเนินการเพิ่มสิทธิ์");
      setShowNotificationsModal(true);
    }
  };

  const DelPatientsRights = async ptRightId => {
    setLoading(true);
    let res = await Axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DelPatientsRights?PtRightId=` + ptRightId).then(res => {
      return res.data;
    }).catch(error => console.log(error));
    if (res.isSuccess === true) {
      if (patientTypeProp === "ipd" && selectPatient !== null && props.isModelVisible) {
        await getDataAdmitsPatientsRights(selectPatient);
      }
    }
    setLoading(false);
    setProcessResult(res);
    setNotificationsTitle("ลบสิทธิ์การรักษา");
    setShowNotificationsModal(true);
  };

  const DelOpdRightVisitOfDate = async id => {
    setLoading(true);
    let res = await Axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DelOpdRightVisitOfDate?opdRightId=` + id).then(res => {
      return res.data;
    }).catch(error => console.log(error));

    setProcessResult(res);
    setNotificationsTitle("ลบสิทธิ์");
    setShowNotificationsModal(true);
    setModal(true, true)
    if (patientTypeProp === "opd" && opdPatientDetail !== null) {
      await getOpdRightVisitOfDate(opdPatientDetail.patientId);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function setData() {
      setLoading(true);
      setOpdPatientRight([]);
      if (patientTypeProp === "opd" && opdPatientDetail !== null) {
        await getOpdRightVisitOfDate(opdPatientDetail.patientId);
      }
      if (patientTypeProp === "ipd" && selectPatient !== null && props.isModelVisible) {
        await getDataAdmitsPatientsRights(selectPatient);
      }
      setLoading(false);
    }
    setData();
  }, [opdPatientDetail, patientTypeProp, props.isModelVisible, selectPatient, reload, reloadAddRight, reloadVisitOfDateTable]);

  const GetDropdown = async action => {
    let masters = await `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
    let res = await Axios.post(masters).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };

  const GetHospcodes = async () => {
    let request = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": {
        "datakey1": "",
        "datakey2": null,
        "datakey3": null,
        "datakey4": null,
        "datakey5": null
      },
      "barcode": null
    };
    let res = await Axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetHospcodes`, request).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };

  // -----------ModalControl
  useEffect(() => {
    if (relinsclList.length === 0 || hospcodesList.length === 0) {
      if (showVisitOfDateModal) {
        async function fetchData() {
          await setLoading(true);
          let res = await GetDropdown("GetRightsVisit");
          setrightsVisitList(res);
          res = await GetDropdown("GetRelinscl");
          setRelinsclList(res);
          res = await GetDropdown("GetGovcodes");
          setGovcodesList(res);
          res = await GetHospcodes();
          setHospcodesList(res);
          await setLoading(false);
        }
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVisitOfDateModal]);
  // ดึงข้อมูลเดิมสิทธิ์ประจำวัน
  const GetUpdOpdRightVisitOfDate = async id => {
    let res = await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetUpdOpdRightVisitOfDate/` + id).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };
  // อัพเดทสิทธิ์ประจำวัน
  const UpdOpdRightVisitOfDate = async values => {
    setLoading(true);
    let res = await Axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/UpdOpdRightVisitOfDate`, values).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    setLoading(false);
    return res;
  };
  // -----------อัพเดทสิทธิ์ประจำวัน
  const [visitOfDateForm] = Form.useForm();
  const [prevUpdOpdRightVisitOfDate, setPrevUpdOpdRightVisitOfDate] = useState(null);

  useEffect(() => {
    if (prevUpdOpdRightVisitOfDate) {
      async function addPrevValues() {
        await visitOfDateForm.setFieldsValue({
          rightsvisit: prevUpdOpdRightVisitOfDate.rightId,
          hmain: prevUpdOpdRightVisitOfDate.hmain,
          hmainOp: prevUpdOpdRightVisitOfDate.hmainOp,
          relinscl: prevUpdOpdRightVisitOfDate.relinscl,
          govcode: prevUpdOpdRightVisitOfDate.govcode,
          status: prevUpdOpdRightVisitOfDate.status,
          insid: prevUpdOpdRightVisitOfDate.insid,
          hsub: prevUpdOpdRightVisitOfDate.hsub,
          ownRightPid: prevUpdOpdRightVisitOfDate.ownrightpid,
          startDate: prevUpdOpdRightVisitOfDate.startDate !== "" ? moment(dateTrans(prevUpdOpdRightVisitOfDate.startDate), 'DD/MM/YYYY') : undefined,
          expireDate: prevUpdOpdRightVisitOfDate.expireDate !== "" ? moment(dateTrans(prevUpdOpdRightVisitOfDate.expireDate), 'DD/MM/YYYY') : undefined,
          remark: prevUpdOpdRightVisitOfDate.remark,
          claimcode: prevUpdOpdRightVisitOfDate.claimcode,
          limit: prevUpdOpdRightVisitOfDate.limit,
          balance: prevUpdOpdRightVisitOfDate.balance,
          outstandingBalance: prevUpdOpdRightVisitOfDate.outstanding_Balance,
          payment: prevUpdOpdRightVisitOfDate.payment
        });
      }
      addPrevValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevUpdOpdRightVisitOfDate]);

  const onVisitOfDateFinish = values => {
    async function updateData() {
      setLoading(true);
      let request = {
        "mode": null,
        "user": null,
        "ip": null,
        "lang": null,
        "branch_id": null,
        "requestData": {
          "opdRightId": editId,
          "rightId": values.rightsvisit,
          "insid": values.insid ? typeof values.insid === "object" ? values.insid.number : values.insid : null,
          "hmain": values.hmain,
          "hsub": values.hsub,
          "hmainOp": values.hmainOp,
          "ownrightpid": values.ownRightPid ? typeof values.ownRightPid === "object" ? values.ownRightPid.number : values.ownRightPid : null,
          "relinscl": values.relinscl,
          "startDate": prevUpdOpdRightVisitOfDate.startDate ? moment(prevUpdOpdRightVisitOfDate.startDate).format("YYYY-MM-DD") : null,
          "expireDate": prevUpdOpdRightVisitOfDate.expireDate ? moment(prevUpdOpdRightVisitOfDate.expireDate).format("YYYY-MM-DD") : null,
          "govcode": values.govcode,
          "remark": values.remark,
          "limit": values.limit ? values.limit : null,
          "status": values.status,
          "balance": values.balance,
          "claimcode": values.claimcode,
          "approvalDate": null,
          // "approvalDate": values.approvalDate ? moment(values.approvalDate).format("YYYY-MM-DD") : null,
          "outstanding_Balance": values.outstandingBalance,
          "payment": values.payment,
          "amount": prevUpdOpdRightVisitOfDate ? prevUpdOpdRightVisitOfDate.amount : null,
          "credit": prevUpdOpdRightVisitOfDate ? prevUpdOpdRightVisitOfDate.credit : null,
          "copay": prevUpdOpdRightVisitOfDate ? prevUpdOpdRightVisitOfDate.copay : null,
          "serviceId": prevUpdOpdRightVisitOfDate ? prevUpdOpdRightVisitOfDate.serviceId : null
        },
        "barcode": null
      };
      const res = await UpdOpdRightVisitOfDate(request);
      closeModal("visitOfDateForm");
      setLoading(false);
      setProcessResult(res);
      setNotificationsTitle("ดำเนินการอัพเดทสิทธิ์");
      setShowNotificationsModal(true);
      if (res?.isSuccess) {
        getRightHistory()
        setReloadVisitOfDateTable(reloadVisitOfDateTable + 1);
        visitOfDateForm.resetFields();
      }
    }
    updateData();
  };

  const closeModal = async (name,) => {
    setEditId(null);
    if (name === "visitForm") {
      setAddOrUpdVisitModal(false);
    }
    if (name === "visitOfDateForm") {
      visitOfDateForm.resetFields();
      setShowVisitOfDateModal(false);
      setPrevUpdOpdRightVisitOfDate(null);
    }
  };

  useEffect(() => {
    if (!props.isModelVisible) {
      checkedOpdRight.current = [];
      setCheckedOpdRightList([]);
    }
  }, [props.isModelVisible]);

  const selectAdd = event => {
    if (event.target.checked) {
      return setCheckedList([...checkedList, event.target.value]);
    }
    setCheckedList(checkedList.filter(val => val !== event.target.value));
  };

  const getCheckedOpdRight = async event => {
    if (event.target.checked) {
      checkedOpdRight.current = [...checkedOpdRight.current, event.target.value];
      let findedData = await find(opdPatientRight, o => {
        return o.opdRightId === event.target.value;
      });
      setCheckedOpdRightList(checkedOpdRightList.concat([findedData]));
    }
    if (!event.target.checked) {
      let filteredCheckedOpdRight = await filter(checkedOpdRight.current || [], o => {
        return o !== event.target.value;
      });
      checkedOpdRight.current = filteredCheckedOpdRight;
      let filteredCheckedOpdRightList = await filter(checkedOpdRightList, o => {
        return o.opdRightId !== event.target.value;
      });
      setCheckedOpdRightList(filteredCheckedOpdRightList);
    }
  };

  const findDataInArray = (valueForFinding, list, fieldName) => {
    let res = find(list, o => {
      return o[fieldName] === valueForFinding;
    });
    if (res) {
      return true;
    } else return false;
  };

  const TableOpdPatientRight = () => {
    const dataSource = opdPatientRight.map((val, index) => {
      return {
        ...val,
        key: index,
        outstanding_Balance: val.outstanding_Balance < 0 ? 0 : val.outstanding_Balance
      };
    });
    const columns = [{
      title: <label className="gx-text-primary">*เลือก</label>,
      dataIndex: "",
      key: "key",
      align: "center",
      width: 70,
      fixed: "left",
      render: val => <Checkbox.Group value={checkedOpdRight.current || []}>
        <Checkbox value={val.opdRightId} onChange={event => getCheckedOpdRight(event)} disabled={serviceRight.length === 0 ? false : findDataInArray(val.rightId, serviceRight, "rightId")} />
      </Checkbox.Group>
    },
    // วันที่ใช้สิทธิ์
    {
      title: <label className="gx-text-primary">วันที่ใช้สิทธิ์</label>,
      dataIndex: "serviceTime",
      key: "key",
      align: "center",
      width: 140,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">สิทธิ์การรักษา</label>,
      dataIndex: "right_Name",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">รพ.หลัก</label>,
      dataIndex: "hospital_Main",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">รพ.รอง</label>,
      dataIndex: "hospital_Sub",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">จำนวนเงิน</label>,
      dataIndex: "amount",
      key: "key",
      align: "right",
      width: 95,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">เบิกได้</label>,
      dataIndex: "credit",
      key: "key",
      align: "right",
      width: 90,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">เบิกไม่ได้</label>,
      dataIndex: "copay",
      key: "key",
      align: "right",
      width: 90,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">วงเงินคงเหลือ</label>,
      dataIndex: "",
      key: "key",
      align: "right",
      width: 115
      // render: (val) => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ยอดค้างชำระ</label>,
      dataIndex: "outstanding_Balance",
      key: "key",
      align: "right",
      width: 110,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ยอดชำระ</label>,
      dataIndex: "payment",
      key: "key",
      align: "right",
      width: 90,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary"></label>,
      dataIndex: "",
      key: "key",
      align: "center",
      width: 90,
      fixed: "right",
      render: val => <div className="d-flex flex-row">
        {val.editAble === "0" ? <div className="text-center me-1" style={btnEdit} onClick={async () => {
          await setShowVisitOfDateModal(true);
          await setEditId(val.opdRightId);
          let res = await GetUpdOpdRightVisitOfDate(val.opdRightId);
          await setPrevUpdOpdRightVisitOfDate(res);
        }}>
          <EditOutlined />
        </div> : <div className="text-center me-1" style={btnNotAllowed}>
          <EditOutlined />
        </div>}
        {(val.amount !== 0 || val?.disabledDelete) ? <div className="text-center me-1" style={btnNotAllowed}>
          <DeleteOutlined />
        </div> : <div className="text-center">
          <Popconfirm title="ต้องการลบรายการนี้ ？" okText="Yes" onConfirm={() => {
            DelOpdRightVisitOfDate(val.opdRightId);
          }} cancelText="No">
            <button className="btn-table deleterow">
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>}
      </div>
    }];
    return <Table scroll={{
      x: 1400,
      y: 480
    }} columns={columns} dataSource={dataSource} pagination={false} />;
  };
  return <div>
    {/* เพิ่มสิทธิ์การรักษาผู้ป่วยนอก ,แก้ไขสิทธิ์ประจำวัน */}
    <Modal forceRender title={<Row align="middle" style={{
      marginTop: -8,
      marginBottom: -10
    }}>
      <Col span={12}>
        {patientTypeProp === "opd" && <label className="gx-text-primary fw-bold" style={{
          fontSize: 18
        }}>เพิ่มสิทธิ์การรักษาผู้ป่วยนอก</label>}
        {patientTypeProp === "ipd" && <label className="gx-text-primary fw-bold" style={{
          fontSize: 18
        }}>เพิ่มสิทธิ์การรักษาผู้ป่วย Admit</label>}
      </Col>
      <Col span={12} style={{
        textAlign: "right"
      }}>
        <Button type="primary" style={{
          margin: 0
        }} disabled={patientTypeProp === "opd" ? opdPatientDetail ? false : true : patientTypeProp === "ipd" && selectPatient ? false : true} onClick={() => setAddOrUpdVisitModal(true)}><p style={{
          fontSize: "24px"
        }}>+</p></Button>
      </Col>
    </Row>} centered closable={false} visible={props.isModelVisible} onCancel={() => {
      setModal(false);
      setCheckedList([]);
      setPatientsRights(null);
      setPageCurrent(1);
    }} footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setModal(false);
        setCheckedList([]);
        setPatientsRights(null);
        setPageCurrent(1);
      }}>ยกเลิก</Button>
      <Button key="save" type="primary" onClick={() => {
        if (patientTypeProp === "ipd") {
          InsAdmitRight();
          setCheckedList([]);
          setPatientsRights(null);
        }
        if (patientTypeProp === "opd") {
          setCheckedList([]);
          checkedOpdRight.current = [];
          setCheckedOpdRightList([]);
          InsOpdRights();
        }
      }} disabled={patientTypeProp === "opd" ? loading ? loading : checkedOpdRightList.length === 0 ? true : false : loading ? loading : checkedList.length === 0 ? true : false}>บันทึก</Button>
    </Row>]} width={1180}>
      <Spin spinning={loading}>
        <div style={{
          margin: -18
        }}>
          {patientTypeProp === "opd" && <>{TableOpdPatientRight()}</>}
          {patientTypeProp === "ipd" && <Table scroll={{
            x: 2400
          }} style={{
            marginTop: 12
          }} dataSource={patientsRights !== null ? patientsRights : []} pagination={{
            current: pageCurrent,
            pageSize: 5,
            total: patientsRights !== null && patientsRights.length,
            onChange: page => {
              setPageCurrent(page);
            },
            showTotal: (total, range) => <label>
              รายการที่
              <label className="gx-text-primary ps-1 pe-1"> {range[0]}-{range[1]} </label>
              จากทั้งหมด
              <label className="gx-text-primary ps-1 pe-1"> {total} </label>
              รายการ
            </label>
          }}>
            <Column title={<label className="gx-text-primary"><b>เลือก<span style={{
              color: "red"
            }}>*</span></b></label>}
            /* dataIndex="rightId" */ align="center" fixed="left" width={70} render={record => {
                return <>
                  <Checkbox.Group disabled={parseInt(record.selectAble) /* dataRightId!==undefined&&dataRightId.find(val=>val.rightId===record) */} value={checkedList}>
                    <Checkbox onChange={event => selectAdd(event)} value={record.rightId} />
                  </Checkbox.Group>
                </>;
              }} />
            <Column title={<label className="gx-text-primary"><b>สิทธิ์</b></label>} dataIndex="rightName" />
            <Column title={<label className="gx-text-primary"><b>สิทธิ์หลัก?</b></label>}
            /* dataIndex="mainFlag" */ align="center" width={100} render={record => {
                return <>
                  <Radio.Group disabled={parseInt(record.selectAble) /* dataRightId!==undefined&&dataRightId.find(val=>val.rightId===record.rightId) */} value={mainFlag} onChange={e => setMainFlag(e.target.value)}>
                    <Radio value={record.rightId} />
                  </Radio.Group>
                </>;
              }} />
            <Column title={<label className="gx-text-primary"><b>ใช้สิทธิ์ล่าสุด</b></label>} align="center" width={115} dataIndex="lastDate" />
            <Column title={<label className="gx-text-primary"><b>หมายเลขบัตร</b></label>} align="center" width={145} dataIndex="insid" />
            <Column title={<label className="gx-text-primary"><b>รพ.หลัก</b></label>} dataIndex="hmainName" />
            <Column title={<label className="gx-text-primary"><b>รพ.รอง</b></label>} dataIndex="hsubName" />
            <Column title={<label className="gx-text-primary"><b>รพ.ที่รักษาประจำ</b></label>} dataIndex="hmainOpName" />
            <Column title={<label className="gx-text-primary"><b>หน่วยงานต้นสังกัด</b></label>} dataIndex="govname" />
            <Column title={<label className="gx-text-primary"><b>เลขบัตรเจ้าของสิทธิ์</b></label>} align="center" width={160} dataIndex="ownRightPid" />
            <Column title={<label className="gx-text-primary"><b>ความสัมพันธ์</b></label>} width={115} dataIndex="relinsclName" />
            <Column title={<label className="gx-text-primary"><b>วันที่เริ่มต้น</b></label>} align="center" width={115} dataIndex="startDateDesc" />
            <Column title={<label className="gx-text-primary"><b>วันที่สิ้นสุด</b></label>} align="center" width={115} dataIndex="expireDateDesc" />
            <Column title={<label className="gx-text-primary"><b>วันที่สร้าง</b></label>} align="center" width={115} dataIndex="dateCreated" />
            <Column title={<label className="gx-text-primary"><b>สร้างโดย</b></label>} dataIndex="userCreated" />
            <Column title={<label className="gx-text-primary"><b>ผู้แก้ไข</b></label>} dataIndex="userModifiedName" />
            <Column title={<label className="gx-text-primary"><b>วันเวลาที่แก้ไข</b></label>} dataIndex="dateModified" />
            <Column width={90} align="center" fixed="right" render={record => {
              return <>
                <Row style={{
                  marginLeft: 0
                }}>
                  <button className="btn-table editrow" style={{
                    marginRight: "0.25rem"
                  }} onClick={() => {
                    setAddOrUpdVisitModal(true);
                    setEditId(record.ptRightId);
                    setPrevVisit({
                      rightId: record.rightId,
                      runHn: record.runHn,
                      yearHn: record.yearHn,
                      insid: record.insid,
                      hmain: record.hmain,
                      Hsub: record.hsub,
                      hmainOp: record.hmainOp,
                      ownRightPid: record.ownRightPid,
                      relinscl: record.relinscl,
                      startDate: record.startDateDesc !== "-" ? record.startDateDesc : "",
                      expireDate: record.expireDateDesc !== "-" ? record.expireDateDesc : "",
                      govcode: record.govcode
                    });
                  }}>
                    <EditOutlined />
                  </button>
                  <Popconfirm title="ต้องการลบหรือไม่?" onConfirm={() => {
                    DelPatientsRights(record.ptRightId);
                  }}
                  /* okText="Yes"
                  cancelText="No" */>
                    <button className="btn-table deleterow">
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </Row>
              </>;
            }} />
          </Table>}
        </div>
      </Spin>
      {/* แก้ไขสิทธิ์ประจำวัน */}
      <Modal
        forceRender
        title={<label className="gx-text-primary-bold">2.2.3 แก้ไขสิทธิ์ประจำวัน</label>}
        centered
        visible={showVisitOfDateModal}
        okText="บันทึก"
        cancelText="ออก"
        onOk={() => closeModal("visitOfDateForm")}
        onCancel={() => closeModal("visitOfDateForm")}
        width={800}
        footer={<div className="text-center"
        >
          <Button type="secondary" onClick={() => closeModal("visitOfDateForm")}>ปิด</Button>
          <Button type="primary" disabled={loading} onClick={visitOfDateForm.submit}>บันทึก</Button>
        </div>}>
        <Spin spinning={loading}>
          <Form layout="vertical" form={visitOfDateForm} name="visitOfDateForm" onFinish={onVisitOfDateFinish}>
            <div className="d-flex flex-row">
              <div className="p-2 m-1" style={{
                width: "50%"
              }}>
                <Form.Item name="rightsvisit" label={<label className="gx-text-primary">สิทธิ์</label>} rules={[{
                  required: true,
                  message: 'กรุณาเลือกสิทธิ์!'
                }]}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {rightsVisitList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="hmain" label={<label className="gx-text-primary">รพ.หลัก</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {hospcodesList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="hmainOp" label={<label className="gx-text-primary">รพ.ที่รักษาประจำ</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {hospcodesList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="relinscl" label={<label className="gx-text-primary">ความสัมพันธ์</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {relinsclList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="govcode" label={<label className="gx-text-primary">หน่วยงานต้นสังกัด</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children"
                  // filterOption={(input, option) => option?.name?.toLowerCase().includes(input.toLowerCase()) || option.value.toLowerCase().includes(input.toLowerCase())}
                  >
                    {govcodesList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="status" label={<label className="gx-text-primary">สถานะ</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {/* {refferStatusList.map((val, index) =>
                                                                <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                                            )} */}
                  </Select>
                </Form.Item>
                <div className="d-flex flex-row">
                  <div className="me-3" style={{
                    width: "50%"
                  }}>
                    <Form.Item name="claimcode" label={<label className="gx-text-primary">เลขขออนุมัติ</label>}>
                      <Input />
                    </Form.Item>
                  </div>
                  <div style={{
                    width: "50%"
                  }}>
                    <Form.Item name="approvalDate" label={<label className="gx-text-primary">วันที่อนุมัติ</label>}>
                      <DatePicker format={dateFormat} disabled={true} />
                    </Form.Item>
                  </div>
                </div>
              </div>
              <div className="p-2 m-1" style={{
                width: "50%"
              }}>
                <Form.Item name="insid" label={<label className="gx-text-primary">หมายเลขบัตร</label>} rules={[{
                  validator: idCardVerifyNoRequired
                }]}>
                  <InputNumber prev={visitOfDateForm.getFieldValue("insid")} />
                </Form.Item>
                <Form.Item name="hsub" label={<label className="gx-text-primary">รพ.รอง</label>}>
                  <Select showSearch style={{
                    width: '100%'
                  }} allowClear={true} optionFilterProp="children">
                    {hospcodesList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="ownRightPid" label={<label className="gx-text-primary">เลขที่บัตรประชาชนเจ้าของสิทธิ์</label>} rules={[{
                  validator: idCardVerifyNoRequired
                }]}>
                  <InputNumber prev={visitOfDateForm.getFieldValue("ownRightPid")} />
                </Form.Item>
                <div className="d-flex flex-row">
                  <div className="me-3" style={{
                    width: "50%"
                  }}>
                    <Form.Item name="startDate" label={<label className="gx-text-primary">วันเริ่มต้น</label>}>
                      <DatePicker format={dateFormat} disabled={true} />
                    </Form.Item>
                  </div>
                  <div style={{
                    width: "50%"
                  }}>
                    <Form.Item name="expireDate" label={<label className="gx-text-primary">วันสิ้นสุด</label>}>
                      <DatePicker format={dateFormat} disabled={true} />
                    </Form.Item>
                  </div>
                </div>
                <Form.Item name="remark" label={<label className="gx-text-primary">หมายเหตุ</label>}>
                  <Input />
                </Form.Item>
                <div className="d-flex flex-row">
                  <div className="me-3" style={{
                    width: "50%"
                  }}>
                    <Form.Item name="limit" label={<label className="gx-text-primary">Lock วงเงิน</label>}>
                      <Input />
                    </Form.Item>
                  </div>
                  <div style={{
                    width: "50%"
                  }}>
                    <Form.Item name="balance" label={<label className="gx-text-primary">วงเงินคงเหลือ</label>}>
                      <Input disabled={true} />
                    </Form.Item>
                  </div>
                </div>
                <div className="d-flex flex-row">
                  <div className="me-3" style={{
                    width: "50%"
                  }}>
                    <Form.Item name="outstandingBalance" label={<label className="gx-text-primary">ยอดค้างชำระ</label>}>
                      <Input disabled={true} />
                    </Form.Item>
                  </div>
                  <div style={{
                    width: "50%"
                  }}>
                    <Form.Item name="payment" label={<label className="gx-text-primary">ยอดชำระแล้ว</label>}>
                      <Input disabled={true} />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
            <div className="ps-2 pe-2" style={{
              marginBottom: "-28px"
            }}>
              <Card>
                <div className="d-flex flex-row" style={{
                  marginBottom: "-24px"
                }}>
                  <div className="me-3" style={{
                    width: "25%"
                  }}>
                    {<label className="gx-text-primary"><b>ค่าบริการตามสิทธิ์</b></label>}
                  </div>
                  {prevUpdOpdRightVisitOfDate ? <div className="d-flex flex-row" style={{
                    width: "75%"
                  }}>
                    <div className="me-3" style={{
                      width: "33%"
                    }}>
                      {<label className="gx-text-primary"><b>จำนวนเงิน</b></label>}
                      <p>{prevUpdOpdRightVisitOfDate.amount}</p>
                    </div>
                    <div className="me-3" style={{
                      width: "33%"
                    }}>
                      {<label className="gx-text-primary"><b>เบิกได้</b></label>}
                      <p>{prevUpdOpdRightVisitOfDate.credit}</p>
                    </div>
                    <div className="me-3" style={{
                      width: "33%"
                    }}>
                      {<label className="gx-text-primary"><b>เบิกไม่ได้</b></label>}
                      <p>{prevUpdOpdRightVisitOfDate.copay}</p>
                    </div>
                  </div> : null}
                </div>
              </Card>
            </div>
          </Form>
        </Spin>
      </Modal>
      <AddOrUpdVisit patientType={patientTypeProp} show={addOrUpdVisitModal} modalControl={closeModal}
        serviceId={personalData.serviceId} page={page} editId={editId} prevVisit={prevVisit} reload={value => {
          if (page === '22.23' || page === "22.5") {
            setModal(false, true);
          } else {
            setReload(reload + value);
          }
        }} prevRightList={patientTypeProp === "opd" ? opdPatientRight : patientsRights} />
    </Modal>
    <Notifications setModal={isVisible => {
      setShowNotificationsModal(isVisible);
      setProcessResult({});
      setNotificationsTitle(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type="result" />
  </div>;
}