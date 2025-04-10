import { env } from '../../env.js';

import { Avatar, Button, Card, Checkbox, Col, ConfigProvider, DatePicker, Divider, Form, Image, Input, Modal, Radio, Row, Select, Spin, Table, Tabs } from 'antd';
import thTH from "antd/lib/locale/th_TH";
import Axios from 'axios';
import SelectHospCode from "components/Input/SelectHospCode";
import { notiWarning } from 'components/Notification/notificationX.js';
import dayjs from "dayjs";
import {find} from "lodash";
import { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import thaiIdCard from 'thai-id-card';
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";
import { InputNumber } from "../Input/InputNumber";
import Notifications from "../Modal/Notifications";
import { CheckAccidentHistory, ClaimReservation, GetAllInsurance, GetIdType, GetillnessType, GetInsurance, GetServiceSetting } from './API/UpdPatientRightApi.js';

const {
  Option
} = Select;
const {
  TabPane
} = Tabs;

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;
const dateFormat = 'DD/MM/YYYY';
const hosParam = JSON.parse(localStorage.getItem("hos_param"));

export default function UpdPatientRight({
  patient = null,
  show = false,
  setModal,
  editId = null,
  prevRight = null,
  right = null,
  disabled = false,
  page = null,
  showComponent = false,
  allowSave = true,
  ...props
}) {
  const {
    pathname
  } = useSelector(({
    common
  }) => common);

  const patientTypeRef = useRef(null);

  const [updRightVisitForm] = Form.useForm();
  const [claimReservationForm] = Form.useForm();

  const illnessTypee = Form.useWatch("illnessType", updRightVisitForm);

  const [loading, setLoading] = useState(false);

  const [prevRightVisit, setPrevRightVisit] = useState({});
  const [RightVisit, setRightVisit] = useState({});
  const [showModal, setShowmodal] = useState(false);
  const [modalInsurance, setModalInsurance] = useState(false);
  const [reQuestIdType, setReQuestIdType] = useState("");
  const [listIdType, setListIdType] = useState([]);
  const [reQuestIllnessType, setReQuestIllnessType] = useState("");
  const [, setReQuestAccidentTime] = useState("");
  const [requestService, setRequestService] = useState("");
  const [serviceSetting, setServiceSetting] = useState([]);
  const [created, setCreated] = useState("");
  const [idCards, setidCards] = useState("");
  const [illnessType, setIllnessType] = useState([]);
  const [title, settitle] = useState("1");
  const [insurerRadio, setInsurerRadio] = useState("");
  const [insurerData, setInsurerData] = useState("");
  const [allInsurance, setAllInsurance] = useState([]);
  const [transactionUid, setTransactionUid] = useState("");
  const [, setTransactionNo] = useState("");
  const [listAllInsurance, setListAllInsurance] = useState({});
  const [rightsVisitList, setrightsVisitList] = useState([]);
  const [relinsclList, setRelinsclList] = useState([]);
  const [govcodesList, setGovcodesList] = useState([]);
  const [dropDownMas, setDropDownMas] = useState([]);
  const [hTypeMas, setHTypeMas] = useState([]);
  const [idTypeCIPN, setIdTypeCIPN] = useState([]);
  const [, setCheckpatientInfo] = useState([]);
  const [checkAccident, setCheckAccident] = useState([]);

  const getAllInsurance = async () => {
    let requestData = {
      patientId: patient.patientId,
      insurer: null,
      billId: null,
      hospCode: hosParam.hospCode,
      userId: user,
      admitRightId: created,
      idCard: idCards,
      idType: reQuestIdType,
      serviceSetting: requestService,
      illnessType: reQuestIllnessType,
      "accidentTime": "2010-01-17 06:00"
    };
    let result = await GetAllInsurance(requestData);
    setAllInsurance(result.data);
  };

  const [insurance, setInsurance] = useState([]);
  const getInsurance = async () => {
    setLoading(true);
    let requestData = {
      patientId: patient.patientId,
      hospCode: hosParam.hospCode,
      userId: user,
      admitRightId: created,
      insurer: insurerData
    };
    let result = await GetInsurance(requestData);
    setLoading(false);
    setInsurance(result.data);
  };

  const checkAccidentHistory = async () => {
    let requestData = {
      userId: user,
      transaction_uid: transactionUid
    };
    let result = await CheckAccidentHistory(requestData);
    setCheckpatientInfo(result);
    setCheckAccident(result.data);
  };

  const TableAllInsurance = () => {
    const columns = [{
      key: "key",
      fixed: "left",
      align: "center",
      width: 45,
      render: (val, record) => {
        return <Radio.Group onChange={(e,) => {
          let findData = allInsurance.find(ins => ins.transaction_no === e.target.value);
          setListAllInsurance(findData)
          setInsurerRadio(findData.transaction_no);
          setTransactionUid(findData.transaction_uid);
          setTransactionNo(findData.transaction_no);
          setInsurerData(findData.insurer);
        }} value={insurerRadio}>
          <Radio value={record.transaction_no} />
        </Radio.Group>
      }
    }, {
      title: <label className="gx-text-primary">บริษัทประกัน</label>,
      dataIndex: "insurer",
      key: "key",
      className: "data-value"
    }, {
      title: <label className="gx-text-primary">นโยบาย</label>,
      dataIndex: "policy_type",
      key: "key",
      className: "data-value"
    }, {
      title: <label className="gx-text-primary">หมายเลขกรมธรรม์</label>,
      dataIndex: "transaction_no",
      key: "key",
      className: "data-value"
    }, {
      title: <label className="gx-text-primary">รายละเอียดประกัน</label>,
      dataIndex: "transaction_uid",
      key: "key",
      className: "data-value"
    }, {
      title: <label className="gx-text-primary"></label>,
      dataIndex: "benefit",
      key: "key",
      className: "data-value",
      render: v => <>
        {v?.coverage_claim_status}
      </>
    }
    ]
    return <Table scroll={{
      x: 1000,
      y: 280
    }}
      columns={columns}
      pagination={false}
      dataSource={allInsurance} />;
  }

  // Notifications
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  // DropDown
  const GetDropdown = async action => {
    let masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
    let res = await Axios.post(masters).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };

  const GetHTypeMas = async () => {
    let endpoint = `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetHTypeMas`;
    let res = await Axios.get(endpoint).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };

  const GetDropDownMas = async () => {
    let res = await Axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDropDownMas`,
      method: "POST",
      data: {
        requestData: {
          "table": "TB_ADMIT_RIGHTS",
          "field": "Relation"
        }
      }
    }).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    return res;
  };

  const GetDataMasterforDropdown = async (TableName, FieldName) => {
    let res = await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetDataMasterforDropdown?TableName=${TableName}&FieldName=${FieldName}`).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    return res;
  };
  const getDropdowns = async () => {
    const [
      GetRightsVisit,
      GetRelinscl,
      GetGovcodes,
      Relation,
      HTypeMas,
      Idtyp_CIPN,
      IdType,
      ServiceSetting,
      illnessType,
    ] = await Promise.all([
      GetDropdown("GetRightsVisit"),
      GetDropdown("GetRelinscl"),
      GetDropdown("GetGovcodes"),
      GetDropDownMas(),
      GetHTypeMas(),
      GetDataMasterforDropdown("TBM_IDTYPE", "Idtyp_CIPN"),
      GetIdType(),
      GetServiceSetting(),
      GetillnessType()
    ])
    setrightsVisitList(GetRightsVisit);
    setRelinsclList(GetRelinscl);
    setGovcodesList(GetGovcodes);
    setDropDownMas(Relation);
    setHTypeMas(HTypeMas);
    setIdTypeCIPN(Idtyp_CIPN);
    setListIdType(IdType)
    setServiceSetting(ServiceSetting);
    setIllnessType(illnessType);
  }
  useEffect(() => {
    if (editId) {
      if (relinsclList.length === 0) {
        getDropdowns()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const closeModal = () => {
    if (pathname !== "/opd clinic/opd-clinic-opd-non-drug-charge" && pathname !== "/opd clinic/opd-clinic-opd-drug-charge" && pathname !== "/opd clinic/opd-clinic-screening" && pathname !== "/dental/dental-opd-non-drug-charge" && pathname !== "/inpatient finance/inpatient-finance-ipd-right"
      // && pathname !== "/social welfare/social-welfare-ipd-finances-discount"
    ) {
      updRightVisitForm.resetFields();
      claimReservationForm.resetFields();
    }
    setModal(false);
  };
  // แปลง พศ => คศ
  const DATE_REGEXP = new RegExp('^(0?[1-9]|[1-2][0-9]|3[0-1])/(0?[1-9]|1[0-2])/([0-9]{4})$', 'gi');
  const dateTrans = date => {
    let result = date.replace(DATE_REGEXP, (str, day, month, year) => {
      return `${day}/${month}/${parseInt(year, 10) - 543}`;
    });
    return result;
  };
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
  // Check PatientType
  useEffect(() => {
    if (pathname === "/privilege center/privilege-center-opd-expense-right-transfer" || pathname === "/opd clinic/opd-clinic-opd-non-drug-charge" || pathname === "/opd clinic/opd-clinic-screening" || pathname === "/reimbursement/reimbursement-opd-transfer-expenses-right" || pathname === "/outpatient finance/outpatient-transfer-finance-ipd-right"
      // || pathname === "/social welfare/social-welfare-ipd-finances-discount"
    ) {
      patientTypeRef.current = "opd";
      // setPatientType("opd");
    } else {
      patientTypeRef.current = "ipd";
      // setPatientType("ipd");
    }

    if (right === "OpdRight") {
      patientTypeRef.current = "opd";
    }
    if (right === "IpdRight") {
      patientTypeRef.current = "ipd";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, right]);

  const getUpdRightVisit = async id => {
    setLoading(true);
    switch (patientTypeRef.current) {
      case "opd":
        await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/GetUpdOpdRightVisitOfDate/` + id).then(res => {
          setPrevRightVisit(res?.data?.responseData || {});
        }).catch(error => console.log(error));
        break;
      case "ipd":
        await Axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitRight/` + id).then(res => {
          setPrevRightVisit(res?.data?.responseData[0] || {});
          setRightVisit(res?.data?.responseData[0] || {});
        }).catch(error => console.log(error));
        break;
      default:
        break;
    }
    setLoading(false);
  };
  // Update
  const updOpdRightVisit = async values => {
    let path = "";
    if (patientTypeRef.current === "opd") path = "OpdRightVisit/UpdOpdRightVisitOfDate";
    if (patientTypeRef.current === "ipd") path = "Admits/UpdAdmitRight";
    let res = await Axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/${path}`, values).then(res => {
      return res.data;
    }).catch(error => console.log(error));
    return res;
  };

  const UpdAdmitRightIclaim = async values => {
    let path = "";
    // if (patientTypeRef.current === "opd") path = "OpdRightVisit/UpdOpdRightVisitOfDate";
    if (patientTypeRef.current === "ipd") path = "Admits/UpdAdmitRightIclaim";
    let res = await Axios.put(`${env.REACT_APP_PANACEACHS_SERVER}/api/${path}`, values).then(res => {
      return res.data;
    }).catch(error => console.log(error));
    return res;
  };

  useEffect(() => {
    if (editId && show) {
      setCreated(editId)
      getUpdRightVisit(editId);
    } else setPrevRightVisit({});
  }, [editId, show]);

  const [mainFlag, setMainFlag] = useState(null);

  useEffect(() => {
    if (prevRightVisit !== undefined) {
      updRightVisitForm.setFieldsValue({
        ...prevRightVisit,
        rightsvisit: prevRightVisit.rightId,
        ownRightPid: patientTypeRef.current === "opd" ? prevRightVisit.ownrightpid : patientTypeRef.current === "ipd" && prevRightVisit.ownRightPid,
        startDate: prevRightVisit.startDate ? dayjs(prevRightVisit.startDate, "MM/DD/YYYY") : undefined,
        expireDate: prevRightVisit.expireDate ? dayjs(prevRightVisit.expireDate, "MM/DD/YYYY") : undefined,
        approvalDate: prevRightVisit.approvalDate ? dayjs(prevRightVisit.approvalDate, "MM/DD/YYYY") : undefined,
        outstandingBalance: prevRightVisit.outstanding_Balance,
        documentDate: prevRightVisit.documentDate ? dayjs(prevRightVisit.documentDate) : undefined,
        hospName: hosParam.hospName,
        hospCode: hosParam.hospCode,
        idDes: prevRightVisit.idDes ? prevRightVisit.idDes : patient?.idCard,
        accident: prevRightVisit?.accident === "Y" ? true : false,
        remark: prevRightVisit?.remark,
        claimcode: prevRightVisit?.claimcode,
        accidentTime: prevRightVisit?.accidentTime ? dayjs(dateTrans(prevRightVisit.accidentTime), "MM/DD/YYYY HH:mm:ss") : null,
        serviceDate: prevRightVisit?.serviceDate ? dayjs(prevRightVisit.serviceDate, "MM/DD/YYYY") : null,
        confirm: prevRightVisit?.confirm === "Y" ? true : false,
      });
      if (patientTypeRef.current === "ipd") setMainFlag(prevRightVisit.mainFlag);
      setReQuestIllnessType(prevRightVisit?.illnessType);
      setRequestService(prevRightVisit?.serviceSetting);
      setReQuestIdType(prevRightVisit?.idType);
      setReQuestAccidentTime(prevRightVisit?.accidentTime);
      setidCards(prevRightVisit?.idDes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevRightVisit]);

  const onUpdRightVisitFinish = values => {
    async function updateData() {
      setLoading(true);
      let request = patientTypeRef.current === "opd" ? {
        "mode": null,
        "user": null,
        "ip": null,
        "lang": null,
        "branch_id": null,
        "requestData": {
          "opdRightId": editId,
          "rightId": values.rightsvisit,
          "insid": values.insid ? typeof values.insid === "object" ? values.insid.number : values.insid : null,
          "hmain": values.hmain || null,
          "hsub": values.hsub || null,
          "hmainOp": values.hmainOp || null,
          "ownrightpid": values.ownRightPid ? typeof values.ownRightPid === "object" ? values.ownRightPid.number : values.ownRightPid : null,
          "relinscl": values.relinscl || null,
          "relation": values.relation || null,
          "startDate": values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD HH:mm") : null,
          "expireDate": values.expireDate ? dayjs(values.expireDate).format("YYYY-MM-DD HH:mm") : null,
          "approvalDate": values.approvalDate ? dayjs(values.approvalDate).format("YYYY-MM-DD HH:mm") : null,
          "govcode": values.govcode || null,
          "limit": values.limit || null,
          "status": values.status || null,
          "balance": values.balance || null,
          "outstanding_Balance": values.outstandingBalance,
          "payment": values.payment || null,
          "amount": prevRightVisit ? prevRightVisit.amount : null,
          "credit": prevRightVisit ? prevRightVisit.credit : null,
          "copay": prevRightVisit ? prevRightVisit.copay : null,
          "serviceId": prevRightVisit ? prevRightVisit.serviceId : null,
          "ofcFlag": values.ofcFlag ? "Y" : null,
          "pvtFlag": values.pvtFlag ? "Y" : null,
          "welFlag": values.welFlag ? "Y" : null,
          "soeFlag": values.soeFlag ? "Y" : null,
          "lgoFlag": values.lgoFlag ? "Y" : null,
          "bkkFlag": values.bkkFlag ? "Y" : null,
          "defaultFlag": values.defaultFlag ? "Y" : null,
          "idTypeCIPN": values.idTypeCIPN || null,
          "idTypeAIPN": values.idTypeAIPN || null,
          //IPD-ICLAME
          "refId": values.refId ? values.refId : null,
          "hospCode": hosParam.hospCode,
          "idType": values.idType ? values.idType : null,
          "idDes": values.idDes,
          "priviledgeCardNo": values.priviledgeCardNo ? values.priviledgeCardNo : null,
          "illnessType": values.illnessType ? values.illnessType : null,
          "accidentTime": values?.accidentTime ? dayjs(values.accidentTime).format("YYYY-MM-DD HH:mm:ss") : null,
          "serviceSetting": values.serviceSetting ? values.serviceSetting : null,
          "claimFromMotorcycle": values.claimFromMotorcycle ? values.claimFromMotorcycle : null,
          "serviceDate": values?.serviceDate ? dayjs(values.serviceDate).format("YYYY-MM-DD") : null,
          "accident": values.accident ? "Y" : null,
          "insurer": values.insurer ? values.insurer : null,
        },
        "barcode": null
      } : patientTypeRef.current === "ipd" && {
        "mode": null,
        "user": null,
        "ip": null,
        "lang": null,
        "branch_id": null,
        "requestData": {
          "admitRightId": editId,
          "patientId": prevRightVisit.patientId,
          "runHn": prevRightVisit.runHn,
          "yearHn": prevRightVisit.yearHn,
          "hn": prevRightVisit.hn,
          "AdmitId": prevRightVisit.admitId,
          "rightId": values.rightsvisit,
          "insid": values.insid ? typeof values.insid === "object" ? values.insid.number : values.insid : null,
          "mainFlag": mainFlag,
          "confirm": values?.confirm ? "Y" : null,
          "defaultFlag": values?.defaultFlag ? "Y" : null,
          "userConfirm": values?.confirm ? user : null,
          "hmain": values.hmain,
          "hsub": values.hsub,
          "hmainOp": values.hmainOp,
          "govcode": values.govcode,
          "startDate": values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD HH:mm") : null,
          "expireDate": values.expireDate ? dayjs(values.expireDate).format("YYYY-MM-DD HH:mm") : null,
          "approvalDate": values.approvalDate ? dayjs(values.approvalDate).format("YYYY-MM-DD HH:mm") : null,
          "ownRightPid": values.ownRightPid ? typeof values.ownRightPid === "object" ? values.ownRightPid.number : values.ownRightPid : null,
          "owner": prevRightVisit.owner,
          "relinscl": values.relinscl,
          "relation": values.relation,
          "remark": prevRightVisit.remark,
          "userCreated": prevRightVisit.userCreated,
          "userModified": user,
          "limit": values.limit ? values.limit : null,
          "govNote": values.govNote,
          "documentNote": values.documentNote,
          "documentDate": values.documentDate,
          "ownerName": values.ownerName,
          "goVid": values.goVid,
          "headingForm": values.headingForm,
          "ownRightPosition": values.ownRightPosition,
          "ofcFlag": values.ofcFlag ? "Y" : null,
          "pvtFlag": values.pvtFlag ? "Y" : null,
          "welFlag": values.welFlag ? "Y" : null,
          "soeFlag": values.soeFlag ? "Y" : null,
          "lgoFlag": values.lgoFlag ? "Y" : null,
          "bkkFlag": values.bkkFlag ? "Y" : null,
          "hType": values.hType || null,
          "idTypeCIPN": values.idTypeCIPN || null,
          "idTypeAIPN": values.idTypeAIPN || null,
          //IPD-ICLAME
          "refId": values.refId ? values.refId : null,
          "hospCode": hosParam.hospCode,
          "idType": values.idType ? values.idType : null,
          "idDes": values.idDes,
          "priviledgeCardNo": values.priviledgeCardNo ? values.priviledgeCardNo : null,
          "illnessType": values.illnessType ? values.illnessType : null,
          "accidentTime": values?.accidentTime ? dayjs(values.accidentTime).format("YYYY-MM-DD HH:mm:ss") : null,
          "serviceSetting": values.serviceSetting ? values.serviceSetting : null,
          "claimFromMotorcycle": values.claimFromMotorcycle ? values.claimFromMotorcycle : null,
          "serviceDate": values?.serviceDate ? dayjs(values.serviceDate).format("YYYY-MM-DD") : null,
          "accident": values.accident ? "Y" : null,
          "insurer": values.insurer ? values.insurer : null,
          // "insurer": listAllInsurance.insurer,
          // "TransactionUID": listAllInsurance.transaction_uid,
          // "TransactionNo": listAllInsurance.transaction_no
        },
        "barcode": null
      };
      let res = await updOpdRightVisit(request);
      if (res.isSuccess === true) {
        updRightVisitForm.resetFields();
        // console.log(updRightVisitForm);
        setShowmodal(true);
        setAllInsurance([]);
        getAllInsurance()
      }
      await setModal(false, res.isSuccess);
      setLoading(false);
      setProcessResult(res);
      setNotificationsTitle("แก้ไขสิทธิ์");
      setShowNotificationsModal(true);
      // setPrevUpdOpdRightVisitOfDate(res);
    }
    updateData();
  };

  const onlistAllInsuranceFinish = async () => {
    setLoading(true);
    let request = patientTypeRef.current === "ipd" && {
      "requestData": {
        "PatientId": RightVisit.patientId,
        "RunHn": RightVisit.runHn,
        "YearHn": RightVisit.yearHn,
        "AdmitId": RightVisit.admitId,
        "admitRightId": created,
        "insurer": listAllInsurance.insurer,
        "TransactionUID": listAllInsurance.transaction_uid,
        "TransactionNo": listAllInsurance.transaction_no
      }

    }
    let res = await UpdAdmitRightIclaim(request)
    // console.log(res);
    if (res?.isSuccess) {
      setShowmodal(false);
      toast.success("บันทึกสำเร็จ", {
        position: "top-right",
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,

      })
    } else {
      toast.error(
        "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        {
          position: "top-right",
          autoClose: 2500,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
    setLoading(false);
  }


  const onclaimReservationFinish = async (val) => {
    if (!prevRightVisit?.transactionUID) return notiWarning({ message: "กรุณาขอ รหัสอ้างอิงที่ iClaim ก่อน" })
    setLoading(true);
    let req = {
      "admitRightId": created,
      "hospCode": hosParam.hospCode,
      "insurer": listAllInsurance.insurer,
      "userId": user,
      "is_procedure": val.is_procedure,
      "chief_complaint": val.chief_complaint,
      "chief_complaint_duration": val.chief_complaint_duration || "",
      "additional_note": val.additional_note || "",
      "underlying_diseases": []
    }

    let res = await ClaimReservation(req)
    setLoading(false);
    claimReservationForm.resetFields();
    setModal(false);

    if (res?.status === 200) {
      toast.success("บันทึกสำเร็จ", {
        position: "top-right",
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,

      })
    } else {
      toast.error(
        "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        {
          position: "top-right",
          autoClose: 2500,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }

  }

  const opdUpdForm = () => {
    return <Form layout="vertical"
      form={updRightVisitForm} name="updRightVisitForm" onFinish={onUpdRightVisitFinish} disabled={disabled}>
      <Row gutter={[8, 8]} style={{
        flexDirection: "row"
      }}>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="rightsvisit" label={<label className="gx-text-primary fw-bold">สิทธิ์</label>} rules={[{
            required: true,
            message: "กรุณาเลือกสิทธิ์!"
          }]}>
            <Select showSearch style={{
              width: "100%"
            }} allowClear={true} optionFilterProp="children" className="data-value">
              {rightsVisitList?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                {val.datadisplay}
              </Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4} style={{
          marginBottom: -14
        }}>
          <Form.Item
            name="confirm"
            label={<label className="gx-text-primary fw-bold">
              รับรองสิทธิ์
            </label>}
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
        </Col>
        <Col span={4} style={{
          marginBottom: -14
        }}>
          <Form.Item
            name="defaultFlag"
            label={<label className="gx-text-primary fw-bold">
              auto สิทธิ์ย่อย
            </label>}
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="insid" label={<label className="gx-text-primary fw-bold">
            หมายเลขบัตร
          </label>}>
            <Input style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>

        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="hmain" label={<label className="gx-text-primary fw-bold">รพ.หลัก</label>}>
            <SelectHospCode value={updRightVisitForm.getFieldValue("hmain")} />
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="hsub" label={<label className="gx-text-primary fw-bold">รพ.รอง</label>}>
            <SelectHospCode value={updRightVisitForm.getFieldValue("hsub")} />
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="hmainOp" label={<label className="gx-text-primary fw-bold">
            รพ.ที่รักษาประจำ
          </label>}>
            <SelectHospCode value={updRightVisitForm.getFieldValue("hmainOp")} />
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="ownRightPid" label={<label className="gx-text-primary fw-bold">
            เลขที่บัตรประชาชนเจ้าของสิทธิ์
          </label>} rules={[{
            validator: idCardVerifyNoRequired
          }]}>
            <InputNumber prev={updRightVisitForm.getFieldValue("ownRightPid")} style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="relinscl" label={<label className="gx-text-primary fw-bold">
            ความสัมพันธ์
          </label>}>
            <Select showSearch style={{
              width: "100%"
            }} allowClear={true} optionFilterProp="children" className="data-value">
              {relinsclList?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                {val.datadisplay}
              </Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="govcode" label={<label className="gx-text-primary fw-bold">
            หน่วยงานต้นสังกัด
          </label>}>
            <Select showSearch style={{
              width: "100%"
            }} allowClear={true} optionFilterProp="children" className="data-value">
              {govcodesList?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                {val.datadisplay}
              </Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8} style={{
          marginBottom: -14
        }}>
          <Form.Item name="status" label={<label className="gx-text-primary fw-bold">สถานะ</label>}>
            <Select showSearch style={{
              width: "100%"
            }} allowClear={true} optionFilterProp="children" className="data-value">
              <Option value="F" key="aka1" className="data-value">
                สิ้นสุดการให้บริการ
              </Option>
              <Option value="C" key="aka2" className="data-value">
                ยกเลิกการให้บริการ
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={16} style={{
          marginBottom: -14
        }}>
          <Form.Item name="remark" label={<label className="gx-text-primary fw-bold">หมายเหตุ</label>}>
            <Input style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -14
        }}>
          <Form.Item name="startDate" label={<label className="gx-text-primary fw-bold">
            วันเริ่มต้น
          </label>}>
            <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="startDate" style={{
              width: '100%'
            }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -14
        }}>
          <Form.Item name="expireDate" label={<label className="gx-text-primary fw-bold">
            วันสิ้นสุด
          </label>}>
            <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="expireDate" style={{
              width: '100%'
            }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -14
        }}>
          <Form.Item name="approvalDate" label={<label className="gx-text-primary fw-bold">วันที่อนุมัติ</label>}>
            <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="approvalDate" style={{
              width: '100%'
            }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -14
        }}>
          <Form.Item name="claimcode" label={<label className="gx-text-primary fw-bold">
            เลขขออนุมัติ
          </label>}>
            <Input style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -10
        }}>
          <Form.Item name="limit" label={<label className="gx-text-primary fw-bold">
            Lock วงเงิน
          </label>}>
            <Input style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -10
        }}>
          <Form.Item name="balance" label={<label className="gx-text-primary fw-bold">
            วงเงินคงเหลือ
          </label>}>
            <Input disabled={true} style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -10
        }}>
          <Form.Item name="outstandingBalance" label={<label className="gx-text-primary fw-bold">
            ยอดค้างชำระ
          </label>}>
            <Input disabled={true} style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
        <Col span={6} style={{
          marginBottom: -10
        }}>
          <Form.Item name="payment" label={<label className="gx-text-primary fw-bold">
            ยอดชำระแล้ว
          </label>}>
            <Input disabled={true} style={{
              width: "100%"
            }} className="data-value" />
          </Form.Item>
        </Col>
      </Row>
    </Form>;
  };

  const findDataInArray = (valueForFinding, list, fieldName) => {
    let res = find(list, o => {
      return o[fieldName] === valueForFinding;
    });
    if (res) {
      return true;
    } else return false;
  };

  const ipdUpdForm = () => {
    return <Form
      layout="vertical"
      form={updRightVisitForm}
      onFinish={onUpdRightVisitFinish}
    >
      <Row gutter={8} style={{
        flexDirection: 'row'
      }}>
        <Col span={8}>
          <Form.Item
            name="mainFlag"
            style={{ margin: 0 }}
          >
            <Checkbox disabled={disabled} checked={mainFlag === "Y" ? true : false} onChange={e => {
              if (e.target.checked) {
                setMainFlag("Y");
              } else setMainFlag("");
            }}>
              <label className="gx-text-primary fw-bold">สิทธิ์หลัก?</label>
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="confirm"
            style={{ margin: 0 }}
            valuePropName="checked"
          >
            <Checkbox disabled={disabled} >
              <label className="gx-text-primary fw-bold">รับรองสิทธิ์</label>
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="defaultFlag"
            style={{ margin: 0 }}
            valuePropName="checked"
          >
            <Checkbox
              disabled={disabled}
            >
              <label className="gx-text-primary fw-bold">auto สิทธิ์ย่อย</label>
            </Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="ownRightPid"
            label={<label className="gx-text-primary fw-bold">เลขที่บัตรประชาชนเจ้าของสิทธิ์</label>}
            rules={[{
              validator: idCardVerifyNoRequired
            }]}
            style={{ marginBottom: 6 }}
          >
            <InputNumber prev={updRightVisitForm.getFieldValue("ownRightPid")} style={{
              width: '100%'
            }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="rightsvisit" label={<label className="gx-text-primary fw-bold">สิทธิ์</label>} rules={[{
              required: true,
              message: 'กรุณาเลือกสิทธิ์!'
            }]}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled || page === "22.6"}>
              {rightsVisitList.map((val, index) => <Option value={val.datavalue} key={index} disabled={props?.prevRightList?.length === 0 ? false : findDataInArray(val.datavalue, props?.prevRightList, "rightId")}>{val.datadisplay}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="insid"
            label={<label className="gx-text-primary fw-bold">หมายเลขบัตร</label>}
            initialValue={updRightVisitForm.getFieldValue("insid")}
            style={{ marginBottom: 6 }}
          >
            <Input disabled={disabled}
              // prev={updRightVisitForm.getFieldValue("insid")}
              style={{
                width: '100%'
              }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="relinscl"
            label={<label className="gx-text-primary fw-bold">ความสัมพันธ์</label>}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled}>
              {relinsclList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="hmainOp"
            label={<label className="gx-text-primary fw-bold">รพ.ที่รักษาประจำ</label>}
            style={{ marginBottom: 6 }}
          >
            <SelectHospCode value={updRightVisitForm.getFieldValue("hmainOp")} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="hmain" label={<label className="gx-text-primary fw-bold">รพ.หลัก</label>}
            style={{ marginBottom: 6 }}
          >
            <SelectHospCode value={updRightVisitForm.getFieldValue("hmain")} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="hsub" label={<label className="gx-text-primary fw-bold">รพ.รอง</label>}
            style={{ marginBottom: 6 }}
          >
            <SelectHospCode value={updRightVisitForm.getFieldValue("hsub")} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="govcode" label={<label className="gx-text-primary fw-bold">หน่วยงานต้นสังกัด</label>}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled}>
              {govcodesList.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          {/* <Form.Item name="startDate" label={<label className="gx-text-primary fw-bold">วันเริ่มต้น</label>}>
                            <DatePicker
                                format={dateFormat}
                                style={{ width: '100%' }}
                            />
                         </Form.Item> */}
          <Form.Item name="startDate"
            // style={{ margin: 0 }}
            style={{ marginBottom: 6 }}
            label={<label className="gx-text-primary fw-bold">วันเริ่มต้น</label>}>
            <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="startDate" style={{
              width: '100%'
            }} format={dateFormat} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="expireDate" label={<label className="gx-text-primary fw-bold">วันสิ้นสุด</label>}
            style={{ marginBottom: 6 }}
          >
            <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="expireDate" style={{
              width: '100%'
            }} format={dateFormat} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="limit" label={<label className="gx-text-primary fw-bold">Lock วงเงิน</label>}
            style={{ marginBottom: 6 }}
          >
            <Input disabled={disabled} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="balance" label={<label className="gx-text-primary fw-bold">วงเงินคงเหลือ</label>}
            style={{ marginBottom: 6 }}
          >
            <Input disabled={true} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="claimcode" label={<label className="gx-text-primary fw-bold">claimcode</label>}
            style={{ marginBottom: 6 }}
          >
            <Input disabled={true} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="hType" label={<label className="gx-text-primary fw-bold">ประเภทสถานพยาบาลที่รักษา</label>}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled}>
              {hTypeMas?.map((val, index) => <Option value={val.code} key={index}>{val.name}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="idTypeCIPN" label={<label className="gx-text-primary fw-bold">ประเภทบัตร CIPN</label>}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled}>
              {idTypeCIPN?.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="idTypeAIPN" label={<label className="gx-text-primary fw-bold">ประเภทบัตร AIPN</label>}
            style={{ marginBottom: 6 }}
          >
            <Select showSearch style={{
              width: '100%'
            }} allowClear={true} optionFilterProp="children" disabled={disabled}>
              {idTypeCIPN?.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>;
  };

  return <div>
    <Modal forceRender title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 18
    }}>
      {patientTypeRef.current === "opd" ? "2.2.3 แก้ไขสิทธิ์ประจำวัน" : patientTypeRef.current === "ipd" && "3.7.2 แก้ไขสิทธิ์การรักษาผู้ป่วย Admit"}
    </label>} centered visible={show} okText="บันทึก" cancelText="ออก" onOk={closeModal} onCancel={closeModal} footer={<div className="text-center">
      <Button type="secondary" onClick={closeModal}>ปิด</Button>
      {title !== "4" ? (
        <Button disabled={loading || disabled || window.location.pathname === "/opd%20clinic/opd-clinic-screening" ? true : false || window.location.pathname === "/dental/dental-screening" ? true : false || window.location.pathname === "/dental/dental-docter-details" ? true : false || window.location.pathname === "/ward/ward-ipd-patient-description" ? true : false} type="primary" onClick={updRightVisitForm.submit}>
          บันทึก
        </Button>
      ) : (
        <Button disabled={loading || disabled || window.location.pathname === "/opd%20clinic/opd-clinic-screening" ? true : false || window.location.pathname === "/dental/dental-screening" ? true : false || window.location.pathname === "/dental/dental-docter-details" ? true : false || window.location.pathname === "/ward/ward-ipd-patient-description" ? true : false} type="primary" onClick={claimReservationForm.submit}>
          บันทึก</Button>
      )}
    </div>} width={900}>
      <ConfigProvider locale={thTH}>
        <Tabs type="card" style={{
          marginTop: -16
        }}
          onChange={(activeKey) => settitle(activeKey)}
          value={title}
        >
          <TabPane tab="แก้ไขสิทธิ์" key="1" >
            <div style={{
              marginTop: "-14px",
              marginBottom: "-32px"
            }}>
              <Spin spinning={loading}>
                {patientTypeRef.current === "opd" ? <>{opdUpdForm()}</> : patientTypeRef.current === "ipd" && <>{ipdUpdForm()}</>}

                <Card
                  size='small'
                  className='mb-0'
                >
                  <Row gutter={[4, 4]} align="middle" style={{ flexDirection: "row" }}>
                    <Col>
                      <label className="gx-text-primary fw-bold">
                        ค่าบริการตามสิทธิ์
                      </label>
                    </Col>
                    <Col span={4} className="text-end">
                      <label className="gx-text-primary fw-bold d-block">
                        จำนวนเงิน
                      </label>
                      <label className="data-value">
                        {prevRightVisit?.amount}
                      </label>
                    </Col>
                    <Col span={4} className="text-end" hidden={!props?.showCredit}>
                      <label className="gx-text-primary fw-bold d-block">
                        เครดิต
                      </label>
                      <label className="data-value">
                        {prevRightVisit?.credit}
                      </label>
                    </Col>
                    <Col span={4} className="text-end">
                      <label className="gx-text-primary fw-bold d-block">
                        เบิกได้
                      </label>
                      <label className="data-value">
                        {prevRightVisit?.cashReturn}
                      </label>
                    </Col>
                    <Col span={4} className="text-end">
                      <label className="gx-text-primary fw-bold d-block">
                        เบิกไม่ได้
                      </label>
                      <label className="data-value">
                        {prevRightVisit?.cashNotReturn}
                      </label>
                    </Col>
                  </Row>
                </Card>
              </Spin>
            </div>
          </TabPane>
          <TabPane tab="ข้อมูลรับหนังสือต้นสังกัด" key="2" disabled={patientTypeRef.current !== "ipd"}>
            <Form layout="vertical" form={updRightVisitForm} onFinish={onUpdRightVisitFinish}>
              <Row gutter={8} style={{
                flexDirection: "row"
              }}>
                <Col span={10}>
                  <Form.Item name="govNote" label={<label className="gx-text-primary fw-bold">ส่วนราชการ</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item name="documentNote" label={<label className="gx-text-primary fw-bold">เลขที่หนังสือ</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item name="documentDate" label={<label className="gx-text-primary fw-bold">ลงวันที่</label>}>
                    <DayjsDatePicker allowClear={true} form={updRightVisitForm} name="documentDate" style={{
                      width: '100%'
                    }} format={dateFormat} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ownerName" label={<label className="gx-text-primary fw-bold">ชื่อเจ้าของสิทธิ์</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="goVid" label={<label className="gx-text-primary fw-bold">เลขที่รัฐวิสาหกิจ/ครูเอกชน</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="headingForm" label={<label className="gx-text-primary fw-bold">เรียน</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ownRightPosition" label={<label className="gx-text-primary fw-bold">ตำแหน่งเจ้าของสิทธิ์</label>}>
                    <Input style={{
                      width: '100%'
                    }} />
                  </Form.Item>
                </Col>
                {showComponent && <>
                  <Col span={12}>
                    <Form.Item name="relation" label={<label className="gx-text-primary fw-bold">เกี่ยวข้องเป็น</label>}>
                      <Select showSearch style={{
                        width: '100%'
                      }} allowClear={true} optionFilterProp="children">
                        {dropDownMas.map((val, index) => <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>)}
                      </Select>

                    </Form.Item>
                  </Col>
                  <Col span={12}> </Col>
                  <Col span={4}>
                    <Form.Item name="ofcFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">ข้าราชการ</label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="pvtFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">ครูเอกชน</label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item name="welFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">สปสช</label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="soeFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">รัฐวิสาหกิจ</label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item name="lgoFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">องค์การปกครองส่วนท้องถิ่น</label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item name="bkkFlag" valuePropName="checked">
                      <Checkbox>
                        <label className="gx-text-primary fw-bold">กทม </label>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </>}
              </Row>
            </Form>
          </TabPane>
          <TabPane tab="รายละเอียดการเคลม" key="3" >
            <Form
              layout="vertical"
              form={updRightVisitForm}
              name="updRightVisitForm"
              onFinish={onUpdRightVisitFinish}
              disabled={disabled}
            >
              <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
                <Col span={12} style={{ flexDirection: "row", marginBottom: -14 }} >
                  <Form.Item
                    name="hospCode"
                    label={<label className="gx-text-primary fw-bold">รหัสโรงพยาบาล 5 หลัก</label>}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="idType"
                    label={<label className="gx-text-primary fw-bold">ประเภทของข้อมูลที่ระบุตัวตนผู้เอาประกัน</label>}>
                    <Select
                      style={{ width: "100%" }}
                      allowClear={true} optionFilterProp="children" className="data-value"
                      onChange={v => {
                        if (v === "NATIONAL_ID") {
                          updRightVisitForm.setFieldsValue({
                            idDes: updRightVisitForm.nationId
                          });
                        } else if (v === "PASSPORT") {
                          updRightVisitForm.setFieldsValue({
                            idDes: updRightVisitForm.passport
                          });
                        } else {
                          updRightVisitForm.setFieldsValue({
                            idDes: null
                          });
                        }
                        setReQuestIdType(v);
                      }}
                    >
                      {listIdType?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                        {val.datadisplay}
                      </Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="idDes"
                    label={<label className="gx-text-primary fw-bold"> ข้อมูลระบุตัวตนผู้เอาประกัน</label>}
                    rules={[{
                      // required: idType ? true : false,
                      message: "จำเป็น"
                    }]}>
                    <Input onBlur={(e) => setidCards(e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="priviledgeCardNo"
                    label={<label className="gx-text-primary fw-bold"> หมายเลขสิทธิ์ประโยชน์ </label>}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="illnessType"
                    label={<label className="gx-text-primary fw-bold">ประเภทบริการ</label>}
                    rules={[{
                      // required: idType ? true : false,
                      message: "จำเป็น"
                    }]}>
                    <Select style={{
                      width: "100%"
                    }} allowClear={true} optionFilterProp="children" className="data-value" onChange={v => {
                      // console.log(v);
                      setReQuestIllnessType(v);
                      if (v !== "Acc") {
                        updRightVisitForm.setFieldsValue({
                          accidentTime: null
                        });
                      }
                    }}>
                      {illnessType?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                        {val.datadisplay}
                      </Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="accidentTime"
                    label={<label className="gx-text-primary fw-bold"> วันเวลาที่เกิดอุบัติเหตุ</label>}>
                    <DatePicker disabled={illnessTypee !== "Acc"} format={dateFormat} style={{
                      width: "100%"
                    }} className="data-value" onChange={v => {
                      // console.log(v);
                      setReQuestAccidentTime(v);
                    }} />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="serviceSetting"
                    label={<label className="gx-text-primary fw-bold"> ประเภทแผนกที่ผู้เอาประกันรับบริการ </label>}
                    rules={[{
                      // required: idType ? true : false,
                      message: "จำเป็น"
                    }]}>
                    <Select style={{
                      width: "100%"
                    }} allowClear={true} optionFilterProp="children" className="data-value" onChange={v => {
                      setRequestService(v);
                    }}>
                      {serviceSetting?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">
                        {val.datadisplay}
                      </Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6} style={{ marginBottom: -14 }}>
                  <Form.Item name="claimFromMotorcycle" label={<label className="gx-text-primary fw-bold">อุบัติเหตุจากมอเตอร์ไซต์</label>}>
                    <Radio.Group>
                      <Radio value="Y">
                        <label className="data-value">ใช่</label>
                      </Radio>
                      <Radio value="N">
                        <label className="data-value">ไม่ใช่</label>
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="serviceDate" label={<label className="gx-text-primary fw-bold">วันเวลาที่เข้ามารักษา</label>}>
                    <DatePicker disabled format={dateFormat} style={{
                      width: "100%"
                    }} className="data-value" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="accident" label=" " valuePropName="checked">
                    <Checkbox>
                      <label className="gx-text-primary fw-bold">
                        {" "}
                        อุบัติเหตุ ?
                      </label>
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>
          <TabPane tab="จองสิทธิ์ผู้ป่วยใน" key="4" >
            <Form
              layout="vertical"
              form={claimReservationForm}
              onFinish={onclaimReservationFinish}
              disabled={disabled}
              initialValues={{
                is_procedure: 'N'
              }}
            >
              <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
                <Col span={12}>
                  <label className="gx-text-primary fw-bold">รหัสอ้างอิงที่ iClaim*</label>
                  <Input value={prevRightVisit?.transactionUID || ""} disabled />
                </Col>
                <Col span={12}>
                  <label className="gx-text-primary fw-bold">เลขสิทธิ์ที่จอง iClaim</label>
                  <Input value={prevRightVisit?.reserveUid || ""} disabled />
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="is_procedure"
                    label={<label className="gx-text-primary fw-bold">มีหัตถการ?</label>}>
                    <Radio.Group onChange={() => claimReservationForm.setFieldsValue({
                      description: "",
                      icd10: ""
                    })}>
                      <Radio value="Y">
                        <label className="data-value">ใช่</label>
                      </Radio>
                      <Radio value="N">
                        <label className="data-value">ไม่ใช่</label>
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    rules={[{
                      required: true,
                      message: "กรุณาระบุอาการสำคัญ ที่มา รพ."
                    }]}
                    name="chief_complaint"
                    label={<label className="gx-text-primary fw-bold"> อาการสำคัญ ที่มา รพ.</label>}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="chief_complaint_duration"
                    label={<label className="gx-text-primary fw-bold"> ช่วงระยะเวลาที่ปรากฏอาการกี่วัน </label>}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24} style={{ marginBottom: -14 }}>
                  <Form.Item
                    name="additional_note"
                    label={<label className="gx-text-primary fw-bold"> ข้อมูลเพิ่มเติมอื่นๆ </label>}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

        </Tabs>
      </ConfigProvider>
    </Modal>
    <Modal
      centered
      closable={false}
      title={
        <Row>
          <Col span={12}>
            <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
              รายละเอียดประกัน
            </label>
          </Col>
          <Col span={12} className="text-end">
            <label>
              <Button type="primary" onClick={() => {
                setModalInsurance(true);
                getInsurance();
                checkAccidentHistory()
              }}>
                ดูประวัติการรักษา
              </Button>
            </label>
          </Col>
        </Row>}
      width={900}
      visible={showModal}
      footer={<div className="text-center">
        <Button onClick={() => {
          setShowmodal(false)
        }}>ปิด</Button>
        <Button type="primary" onClick={onlistAllInsuranceFinish}>บันทึก</Button>
      </div>}
    >
      {TableAllInsurance()}
    </Modal>
    <Modal
      // title={<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>ประวัติการรักษา</label>}
      width={1500}
      centered
      closable={false}
      visible={modalInsurance}
      footer={<div className="text-center">
        <Button onClick={() => {
          setModalInsurance(false);
        }}>
          ปิด
        </Button>
      </div>}
    >
      <Tabs>
        <TabPane tab="แสดงรายละเอียดข้อมูลประกันภัยของผู้ป่วย" key="1">
          <Card>
            <div>
              <Row gutter={[10, 8]} style={{ marginTop: -10 }}>
                <Col span={4}>
                  {patient?.picture ? <Avatar size={80} src={<Image src={`data:image/jpeg;base64,${patient?.picture}`} />} /> : <Avatar size={80}>Patient</Avatar>}
                </Col>
                <Col span={20}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold" style={{
                        fontSize: "18px"
                      }}>ชื่อ : </label>
                      <label className="fw-bold ms-2" style={{
                        fontSize: "15px"
                      }}>{patient?.displayName}</label>&nbsp;
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold" style={{
                        fontSize: "18px"
                      }}>อายุ : </label>
                      <label className="fw-bold ms-2" style={{
                        fontSize: "15px"
                      }}>{patient?.age || "-"}</label>
                      <label className="gx-text-primary fw-bold">บัตรประชาชน : </label>
                      <label className="fw-bold ms-2">{patient?.idCard || "-"}</label>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} className="mt-2">
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">Passport : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.passport || "-"}</label>
                      <label className="gx-text-primary fw-bold">สัญชาติ : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.nationalityName || "-"}</label>
                      <label className="gx-text-primary fw-bold">ศาสนา : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.religionName || "-"}</label>
                      <label className="gx-text-primary fw-bold">กรุ๊ปเลือด : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.bloodGroup || "-"}</label>
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">สถานะภาพ : </label>
                      <label className="fw-bold ms-2 me-2">{patient?.maritalStatusName || "-"}</label>
                      <label className="gx-text-primary fw-bold">อาชีพ : </label>
                      <label className="fw-bold ms-2 me-2">{patient?.occupationName || "-"}</label>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} className="mt-2">
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">ที่อยู่ : </label>
                      {patient?.addressNo ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.addressNo}</label>
                      </label> : null}
                      {patient?.tambon ? <label>
                        <label className="gx-text-primary fw-bold">แขวง/ตำบล : </label>
                        <label className="fw-bold ms-2 me-2">{patient?.tambon}</label>
                      </label> : null}
                      {patient?.amphur ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.amphur}</label>
                      </label> : null}
                      {patient?.changwat ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.changwat}</label>
                      </label> : null}
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">เบอร์โทร : </label>
                      <label className="fw-bold ms-2 me-2">
                        {patient?.mobile === null ? patient?.telephone : patient?.mobile}
                      </label>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Card>
          <Spin spinning={loading}>
            <Row>
              <Col xs={24} xl={12} style={{
                borderRight: "1px solid #DBDBDB"
              }}>
                <Col span={24}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ชื่อบริษัทประกัน : </label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0]?.insurer || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>รหัสอ้างอิงที่ บริษัทประกันส่งออกให้รพ. :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].transaction_no || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>รหัสอ้างอิง ที่ I-Claim ส่งออกให้รพ. :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].transaction_uid || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ข้อมูลการลงทะเบียนเบิกจ่ายตรง :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].policy_type || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ประเภทของความคุ้มครอง :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.service_type || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ประเภทของผลประโยชน์ :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.episode_type || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>หมายเลขกรมธรรม์ที่มีผลบังคับ :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.policy_number || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ชื่อผู้เอาประกัน คำนำหน้า :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.title_name || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ marginLeft: 10, fontSize: 17 }}>ชื่อ :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.first_name || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ marginLeft: 10, fontSize: 17 }}>ชื่อกลาง :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.mid_name || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ marginLeft: 10, fontSize: 17 }}>นามสกุล :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.last_name || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>รหัสแผนประกัน :</label>
                  <label style={{ marginLeft: 10 }}>  {insurance && insurance.length > 0 ? insurance[0].benefit.plan_code || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 15 }}>รายละเอียดแผนประกัน :</label>
                  <label style={{ marginLeft: 10 }}>  {insurance && insurance.length > 0 ? insurance[0].benefit.plan_name || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>วันที่กรมธรรม์มีผลบังคับ :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.effective_date || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 15 }}>เวลาที่กรมธรรม์เริ่มมีผลบังคับ :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.effective_time || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>วันที่สิ้นสุดความคุ้มครอง :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.expire_date || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 15 }}>เวลาสิ้นสุดความคุ้มครอง :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.expire_time || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ผลบังคับ :</label>
                  <label style={{ marginLeft: 10 }}> {insurance && insurance.length > 0 ? insurance[0].benefit.coverage_status || "-" : "-"} </label>
                </Col>
              </Col>
              <Col xs={24} xl={12}>
                <Col span={24}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ผลการตรวจสอบ :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.coverage_claim_status || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>รายละเอียดเพิ่มเติม :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.coverage_claim_remark || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>วงเงินค่าห้อง-อาหาร ต่อวัน :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_IPD_room || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>วงเงินค่าผ่าตัดกรณี IPD ไม่เกิน:</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit_surgical_benefit_IPD || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>วงเงินค่าผ่าตัดกรณี OPD ไม่เกิน:</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_surgical_benefit_OPD || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}> ไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.benefit_OPD_times_per_day || "-" : "-"} ครั้ง ต่อวัน </label>

                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>ไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.benefit_OPD_day_per_year || "-" : "-"} วัน ต่อปี </label>

                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}> ไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.benefit_OPD_times_per_year || "-" : "-"} ครั้ง </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>ต่อครั้งไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.benefit_OPD_amount_per_times || "-" : "-"} บาท </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>ไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.benefit_OPD_amount_per_year || "-" : "-"} บาท ต่อปี </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ผลประโยชน์ต่อวัน :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_amount_per_day || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>อุบัติเหตุฉุกเฉินไม่เกิน :</label>
                  <label style={{
                    marginLeft: 10
                  }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_emergency || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>อุบัติเหตุฉุกเฉินภายใน :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_ER_within_hrs || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>ค่ารักษาพยาบาลอุบัติเหตุต่อครั้ง :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit_medical_expense || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ความคุ้มครองอุบัติเหตูจากมอเตอร์ไซด์:</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.benefit_for_motorcycle || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>คงเหลือ {insurance && insurance.length > 0 ? insurance[0].benefit.remaining_OPD_times_per_year || "-" : "-"} ครั้ง</label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>คงเหลือ {insurance && insurance.length > 0 ? insurance[0].benefit.remaining_OPD_times_per_day || "-" : "-"} ครั้ง ต่อวัน</label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>จำนวนวันคงเหลือ {insurance && insurance.length > 0 ? insurance[0].benefit.remaining_OPD_day_per_year || "-" : "-"} ต่อปี</label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>คงเหลือต่อครั้งไม่เกิน {insurance && insurance.length > 0 ? insurance[0].benefit.remaining_OPD_amount_per_times || "-" : "-"}  บาท</label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>OPD:</label>
                  <label style={{ marginLeft: 10 }}>คงเหลือ {insurance && insurance.length > 0 ? insurance[0].benefit.remaining_OPD_amount_per_year || "-" : "-"} บาท ต่อปี</label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ผลประโยชน์คงเหลือ :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.remaining_amount_per_day || "-" : "-"} ต่อวัน</label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>อุบัติเหตุฉุกเฉิน คงเหลือ :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.remaining_emergency || "-" : "-"} บาท</label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ค่ารักษาพยาบาลอุบัติเหตุคงเหลือ :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.remaining_medical_expense || "-" : "-"} บาท</label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ข้อยกเว้นทั้งหมด (ทั่วไป) :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.exclusion_product || "-" : "-"} </label>
                  <label className="gx-text-primary" style={{ fontSize: 17, marginLeft: 30 }}>ข้อยกเว้นทั้งหมด (เฉพาะกรมธรรม์) :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.exclusion_policy || "-" : "-"} </label>
                </Col>
                <Col span={24} style={{ marginTop: 10 }}>
                  <label className="gx-text-primary" style={{ fontSize: 17 }}>ข้อยกเว้นทั้งหมด (บุคคล) :</label>
                  <label style={{ marginLeft: 10 }}>{insurance && insurance.length > 0 ? insurance[0].benefit.exclusion_personal || "-" : "-"} </label>
                </Col>
              </Col>
            </Row>
          </Spin>
        </TabPane>
        <TabPane tab="แสดงผลตรวจสอบประวัติการรักษาครั้งก่อนหน้าเพื่อพิจารณาเป็นการรักษาต่อเนื่อง" key="2">
          <Card>
            <div>
              <Row gutter={[10, 8]} style={{ marginTop: -10 }}>
                <Col span={4}>
                  {patient?.picture ? <Avatar size={80} src={<Image src={`data:image/jpeg;base64,${patient?.picture}`} />} /> : <Avatar size={80}>Patient</Avatar>}
                </Col>
                <Col span={20}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold" style={{
                        fontSize: "18px"
                      }}>ชื่อ : </label>
                      <label className="fw-bold ms-2" style={{
                        fontSize: "15px"
                      }}>{patient?.displayName}</label>&nbsp;
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold" style={{
                        fontSize: "18px"
                      }}>อายุ : </label>
                      <label className="fw-bold ms-2" style={{
                        fontSize: "15px"
                      }}>{patient?.age || "-"}</label>
                      <label className="gx-text-primary fw-bold">บัตรประชาชน : </label>
                      <label className="fw-bold ms-2">{patient?.idCard || "-"}</label>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]} className="mt-2">
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">Passport : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.passport || "-"}</label>
                      <label className="gx-text-primary fw-bold">สัญชาติ : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.nationalityName || "-"}</label>
                      <label className="gx-text-primary fw-bold">ศาสนา : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.religionName || "-"}</label>
                      <label className="gx-text-primary fw-bold">กรุ๊ปเลือด : </label>
                      <label className="fw-bold ms-2 me-2" style={{
                        fontSize: "15px"
                      }}>{patient?.bloodGroup || "-"}</label>
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">สถานะภาพ : </label>
                      <label className="fw-bold ms-2 me-2">{patient?.maritalStatusName || "-"}</label>
                      <label className="gx-text-primary fw-bold">อาชีพ : </label>
                      <label className="fw-bold ms-2 me-2">{patient?.occupationName || "-"}</label>
                    </Col>
                  </Row>

                  <Row gutter={[8, 8]} className="mt-2">
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">ที่อยู่ : </label>
                      {patient?.addressNo ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.addressNo}</label>
                      </label> : null}
                      {patient?.tambon ? <label>
                        <label className="gx-text-primary fw-bold">แขวง/ตำบล : </label>
                        <label className="fw-bold ms-2 me-2">{patient?.tambon}</label>
                      </label> : null}
                      {patient?.amphur ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.amphur}</label>
                      </label> : null}
                      {patient?.changwat ? <label>
                        <label className="fw-bold ms-2 me-2">{patient?.changwat}</label>
                      </label> : null}
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary fw-bold">เบอร์โทร : </label>
                      <label className="fw-bold ms-2 me-2">
                        {patient?.mobile === null ? patient?.telephone : patient?.mobile}
                      </label>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Card>
          <Row style={{
            overflowY: "scroll",
            overflowX: "hidden",
            height: "450px"
          }}>
            {checkAccident?.map(data => <>
              <Col xs={24} xl={12} style={{
                borderRight: "1px solid #DBDBDB"
              }}>
                <Col span={24}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>รหัสการเคลม สำหรับการรักษาต่อเนื่อง : </label>
                  <label style={{
                    marginLeft: 10
                  }}>{data.further_claim_id ? data.further_claim_id : "-"}</label>
                </Col>
                <Col span={24} style={{
                  marginTop: "30px"
                }}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>เลขที่เคลมต่อเนื่อง : </label>
                  <label style={{
                    marginLeft: 10
                  }}>{data.occurrence_no ? data.occurrence_no : "-"}</label>
                </Col>
                <Col span={24} style={{
                  marginTop: "30px"
                }}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>วันเวลาที่เกิดอุบัติเหตุ : </label>
                  <label>{data.accident_time ? dayjs(data.accident_time ? data.accident_time : "-").format("DD/MM/YYYY HH:mm") : '-'}</label>
                </Col>
                <Col span={24} style={{
                  marginTop: "30px"
                }}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>รหัสวินิจฉัยโรค (ICD10) : </label>
                  <label style={{
                    marginLeft: 10
                  }}>{data.icd10 ? data.icd10 : "-"}</label>
                </Col>
              </Col>

              <Col xs={24} xl={12}>
                <Col span={24}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>รหัสอนุมัติ ของการรักษาครั้งก่อน : </label>
                  <label style={{
                    marginLeft: 10
                  }}>{data.claim_no ? data.claim_no : "-"}</label>
                </Col>
                <Col span={24} style={{
                  marginTop: "30px"
                }}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>วันที่เข้ารับการรักษา : </label>
                  <label>{data.visit_date ? dayjs(data.visit_date).format("DD/MM/YYYYw") : '-'}</label>
                </Col>
                <Col span={24} style={{
                  marginTop: "30px"
                }}>
                  <label className="gx-text-primary" style={{
                    fontSize: 17
                  }}>ชื่อข้อวินิจฉัยโรค ของการรักษาครั้งก่อน : </label>
                  <label style={{
                    marginLeft: 10
                  }}>{data.description ? data.description : "-"}</label>
                </Col>
              </Col>
              <Col style={{
                marginTop: "40px",
                marginBottom: "10px"
              }} xs={24} xl={24}>
                <Divider />
              </Col>
            </>)}
          </Row>
        </TabPane>

      </Tabs>

    </Modal>
    <Notifications setModal={isVisible => {
      setShowNotificationsModal(isVisible);
      setProcessResult({});
      setNotificationsTitle(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type="result" />
  </div>;
}
