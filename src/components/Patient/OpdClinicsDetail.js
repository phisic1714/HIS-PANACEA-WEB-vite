
import { env } from '../../env.js';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { Row, Col, Spin, Select, Form, Divider, Checkbox, notification, Input, Button, Image, Modal, Table } from "antd";
import { map, find, filter, toNumber, uniqBy, differenceBy, groupBy } from "lodash";
import { useSelector } from "react-redux";
import { BsThreeDots } from "react-icons/bs";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  LabelTopic,
} from 'components/helper/function/GenLabel.js';
import ScreeningMoreVS from 'routes/OpdClinic/Components/ScreeningMoreVS.js';
import dayjs from 'dayjs';
import { withResolve } from 'api/create-api.js';
const {
  Option
} = Select;
const marginForDivider = {
  marginLeft: "-24px",
  marginRight: "-24px"
};
export default function OpdClinicsDetail({
  patientId = null,
  // opdServiceValue = null,
  opdClinicValue = null,
  // getServiceId = () => { },
  showSelect = false,
  updOpdClinic = false,
  editAble = false,
  workId = null,
  admitId = null,
  type = null,
  handleServiceSelect = null
}) {
  const [loading, setLoading] = useState(false);
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const userId = userFromSession.responseData.userId;
  const userDetails = userFromSession.responseData;
  // console.log('userFromSession.responseData :>> ', userFromSession.responseData);
  const {
    message
  } = useSelector(({
    autoComplete
  }) => autoComplete);
  const [, setOpdClinicsDetailList] = useState([]);
  const [vitalSignsDetail, setVitalSignsDetail] = useState({});
  const [vitalSignsEyes, setVitalSignsEyes] = useState({});
  const [showOpdVitalSignsModal, setShowOpdVitalSignsModal] = useState(false);
  const [workPlaceList, setWorkPlaceList] = useState([]);
  const [, setWorkPlaceValue] = useState(null);
  const [checkinList, setCheckinList] = useState([]);
  const [, setCheckinValue] = useState(null);
  const [checkoutList, setCheckoutList] = useState([]);
  const [, setCheckoutValue] = useState(null);
  const [serviceTypeList, setServiceTypeList] = useState([]);
  const [, setServiceTypeValue] = useState(null);
  const [, setFilteredOpdClinicList] = useState([]);
  const [listDoctorMas, setListDoctorMas] = useState([]);
  const [aeTypeMas, setAeTypeMas] = useState([]);
  const [friend, setFriend] = useState(false);
  const [isWorkPlaceTypeDen, setIsWorkPlaceTypeDen] = useState(false)
  const [dentalDiags, setDentalDiags] = useState([])

  const [labOpen, setLabOpen] = useState(false)

  const [vitalSignsForm] = Form.useForm();

  const [labResult, setLabResult] = useState([])

  const threeDot = {
    backgroundColor: "#ECEFF1",
    width: "26px",
    height: "12px",
    borderRadius: "50px",
    boxShadow: "0 1px 1px 0 #CFD8DC",
    alignItems: "center",
    cursor: "pointer"
  };

  const fetchVitalSigns = async patientId => {
    if (patientId) {
      const res = await GetVitalSignsDisplay(patientId);
      const lastVitalSign = res && res.length > 0 ? res[0] : null;
      // console.log('lastVitalSign', lastVitalSign)
      let lmp = lastVitalSign?.lmp ? moment(lastVitalSign.lmp, "MM/DD/YYYY HH:mm:ss") : null;
      if (lmp) {
        lastVitalSign.lmp = lastVitalSign?.lmp ? moment(lastVitalSign.lmp, "MM/DD/YYYY HH:mm:ss") : null;
      }
      // console.log(lastVitalSign);
      setVitalSignsDetail(lastVitalSign);
      vitalSignsForm.setFieldsValue(lastVitalSign);
    } else {
      setVitalSignsDetail({});
      vitalSignsForm.resetFields();
    }
  };

  const fetchLabResults = async (financeId) => {
    if (financeId) {
      let res = await withResolve(`/api/OpdClinics/OpdLabResult/${financeId}`).fetch();

      if (res.result.length > 0) {
        setLabResult(res.result)
      } else {
        setLabResult([])
      }
    }
  }
  const handleOpenLabModal = async (financeId) => {
    await fetchLabResults(financeId);
    setLabOpen(true);
  };
  const GetDropdown = async action => {
    let masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/${action}`;
    let res = await axios.post(masters).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };
  const GetDropdownDoctorAndWork = async () => {
    let req = {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        datakey1: null,
        datakey2: null,
        datakey3: null,
        datakey4: null,
        datakey5: null
      },
      barcode: null
    };
    let masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDoctorMasAndWork`;
    let res = await axios.post(masters, req).then(res => {
      return res.data.responseData;
    }).catch(error => console.log(error));
    return res;
  };
  const getAETypeMas = async () => {
    if (aeTypeMas?.length) return
    const masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/SocialMedication/GetAETypeMas`;
    const res = await axios.get(masters).then(res => {
      return res.data.responseData
    }).catch(error => {
      console.log(error)
      return []
    });
    return res;
  };
  const getDentalDiagsAndTreatments = async (clinicDetail) => {
    const { clinicId, serviceId, patientId } = clinicDetail
    const [diags, treatments] = await Promise.all([
      GetDentalDiags(clinicId, serviceId, patientId),
      GetDentalTreatments(clinicId, serviceId, patientId),
    ])
    if (diags?.length) {
      // eslint-disable-next-line array-callback-return
      diags.map(dent => {
        // eslint-disable-next-line array-callback-return
        treatments.map(treat => {
          // console.log(treat);
          if (dent.dentalId === treat.dentalId) {
            dent.treatment = [...dent?.treatment || [], treat];
          }
        });
      });
      let grouping = groupBy(diags, "teeth");
      let size = Object.keys(grouping).length;
      let newArr = [];
      for (let index = 0; index < size; index++) {
        let values = grouping[Object.keys(grouping)[index]];
        newArr = [...newArr, {
          key: nanoid(),
          teeth: values[0].teeth,
          teethName: values[0].teethName,
          icd10: values
        }];
      }
      // console.log('newArr', newArr)
      newArr = map(newArr, n => {
        let icd10 = uniqBy(n.icd10, 'icd');
        return {
          ...n,
          icd10: icd10
        };
      });
      setDentalDiags(newArr)
    }
  }
  const chkWorkPlaceTypeDen = (clinicDetail) => {
    if (!clinicDetail) return
    const work = find(workPlaceList, ['datavalue', clinicDetail?.workId])
    if (work?.dataother2 === "DEN") {
      getDentalDiagsAndTreatments(clinicDetail)
      setIsWorkPlaceTypeDen(true)
    } else {
      setIsWorkPlaceTypeDen(false)
    }
  }
  // ดึงข้อมูลรายละเอียดการมารับบริการ
  const [opdClinicDetail, setOpdClinicDetail] = useState({});
  const fetchHistoryClinicsDetail = async () => {
    setLoading(true);
    let urlold = `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetOpdClinicHistoryPopUpDisplayDetail`;
    let urlwithtype = `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetOpdClinicHistoryPopUpDisplayDetail`;
    let reqA = {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: patientId || message,
        serviceId: null,
        date: null,
        userId: null,
        workId: null,
        clinicId: opdClinicValue,
        admitId: admitId
      },
      barcode: null
    };
    let resA = await axios.post(`${type ? urlwithtype : urlold}`, reqA).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    }).finally(() => setLoading(false));
    if (type) {
      if (resA.opdIpd === "ipd") {
        setOpdClinicDetail(resA.admitDetail || {});
        form.setFieldsValue(resA.admitDetail || {});
      } else if (resA.opdIpd === "opd") {
        setOpdClinicDetail(resA?.clinicDetail || {});
        form.setFieldsValue(resA?.clinicDetail || {});
        chkWorkPlaceTypeDen(resA?.clinicDetail)
        if (handleServiceSelect) handleServiceSelect(resA?.clinicDetail)
      } else {
        setOpdClinicDetail({});
        form.setFieldsValue({});
      }
    } else {
      setOpdClinicDetail(resA);
      form.setFieldsValue(resA);
      chkWorkPlaceTypeDen(resA)
      if (handleServiceSelect) handleServiceSelect(resA)
    }
  };
  const [listSubWorkPlace, setListSubWorkPlace] = useState([]);
  const getDentalClinicMainWorkId = async workId => {
    if (workId) {
      let res = await GetDentalClinicMainWorkId(workId);
      setListSubWorkPlace(res);
    } else {
      setListSubWorkPlace([]);
    }
  };
  const [listUser, setListUser] = useState([]);
  const getOpdClinicAssistant = async () => {
    if (opdClinicValue) {
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetOpdClinicAssistantByClinicId/${opdClinicValue}`,
        method: "GET"
        // data: { requestData: param }
      }).then(res => {
        let data = res?.data?.responseData;
        form.setFieldsValue({
          users: data
        });
        setListUser(data);
      }).catch(error => {
        return error;
      }).finally(() => { });
    }
  };
  const GetDentalClinicMainWorkId = async mainWorkId => {
    let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/DentalClinic/GetDentalClinicMainWorkId/` + mainWorkId).then(res => {
      return res.data.responseData;
    }).catch(error => {
      return error;
    });
    return res;
  };
  const [drpLoading, setDrpLoading] = useState(false);
  const getDD = async () => {
    if (!showSelect) return
    if (opdClinicValue || admitId) {
      if (checkinList.length === 0) {
        setDrpLoading(true)
        const [
          GetCheckins,
          GetWorkPlacesMas,
          GetServiceTypes,
          GetCheckOuts,
          DoctorAndWork,
          AETypeMas,
        ] = await Promise.all([
          GetDropdown("GetCheckins"),
          GetDropdown("GetWorkPlacesMas"),
          GetDropdown("GetServiceTypes"),
          GetDropdown("GetCheckOuts"),
          GetDropdownDoctorAndWork(),
          getAETypeMas(),
        ])
        setCheckinList(GetCheckins);
        setWorkPlaceList(GetWorkPlacesMas);
        setServiceTypeList(GetServiceTypes);
        setCheckoutList(GetCheckOuts);
        setListDoctorMas(DoctorAndWork);
        setAeTypeMas(AETypeMas);
        setDrpLoading(false)
      }
    } else {
      setOpdClinicsDetailList([]);
      setFilteredOpdClinicList([]);
      setVitalSignsDetail({});
      setVitalSignsEyes({});
      setCheckinValue(null);
      setWorkPlaceValue(null);
      setCheckoutValue(null);
      setServiceTypeValue(null);
    }
  }
  useEffect(() => {
    setDentalDiags([])
    getDD()
    if (opdClinicValue || admitId) {
      getOpdClinicAssistant();
      fetchHistoryClinicsDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opdClinicValue, admitId]);
  useEffect(() => {
    setOpdClinicDetail({});
    form.resetFields();
    fetchVitalSigns(patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);
  const showMedicationDetails = (dts = []) => {
    return <div style={{ width: "100%" }}>
      <Row gutter={[8, 8]}>
        <Col span={16}>
          <label className="gx-text-primary fw-bold">Medications</label>
        </Col>
        <Col span={8}>
          <label className="fw-bold">วิธีใช้</label>
        </Col>
      </Row>
      {
        map(dts, o => {
          return <Row gutter={[8, 8]} className='mb-1 border-bottom'>
            <Col span={16}>
              <label className="data-value">{o.expenseName}</label>
            </Col>
            <Col span={8}>
              <label className="data-value">{o.drugLabelName || "-"}</label>
            </Col>
          </Row>
        })
      }
    </div>;
  };
  const showpicturesDetail = (dts = []) => {
    return <Row gutter={[8, 8]} style={{ flexDirection: 'row' }}>
      {dts.map((o, index) =>
        <Col span={8} key={String(index)} >
          <Image width={"100%"} src={`data:image/jpg;base64,${o.picture}`} />
        </Col>
      )}
    </Row>
  };
  const showLabDetail = () => {
    const columns = [
      {
        title: 'ชื่อผล Lab',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'ผล Lab',
        dataIndex: 'unitText',
        key: 'unitText',
        render: (text, record) => (
          <span>
            {record.resultValue || ''} {record.unitText || ''}
          </span>
        ),
      },
      {
        title: 'Normal Range',
        dataIndex: 'result',
        key: 'result',
        render: (text, record) => {
          const minRef = record.minNumberRef || 0;
          const maxRef = record.maxNumberRef || 0;

          const formattedMinRef = minRef.toFixed(2);
          const formattedMaxRef = maxRef.toFixed(2);

          return (
            <span>
              {minRef === 0 && maxRef === 0 ? "0.00" : formattedMinRef} - {minRef === 0 && maxRef === 0 ? "0.00" : formattedMaxRef}
            </span>
          );
        },
      },
    ];

    if (opdClinicDetail?.labs?.length > 0) {
      return (
        <div>
          {opdClinicDetail?.labs.map((o, index) => (
            <div key={index}>
              <p
                className="data-value ms-5"
                style={{
                  color: o.statusDesc === "Accept"
                    ? "blue"
                    : o.statusDesc === "Reject"
                      ? "red"
                      : "#424242",
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {o.expenseName}

                {o.labResults?.length === 1 && (
                  (() => {
                    const { resultValue, unitText } = o.labResults[0] || {};
                    const displayValue =
                      (resultValue || unitText) &&
                      `${resultValue || ""} ${unitText || ""}`.trim();

                    return displayValue ? (
                      <span style={{ color: "#096dd9", paddingLeft: "10px" }}>
                        ({displayValue})
                      </span>
                    ) : null;
                  })()
                )}

                {o.labResults?.length > 1 && (
                  <label
                    className="ms-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpenLabModal(o.financeId)}
                  >
                    <BsThreeDots style={threeDot} />
                  </label>
                )}
              </p>
            </div>
          ))}

          <Modal
            title={<label className="gx-text-primary fw-bold fs-5">ผล Lab</label>}
            visible={labOpen}
            onCancel={() => setLabOpen(false)}
            width={1000}
            footer={[
              <div style={{ alignItems: 'center' }} key="footer">
                <Button key="close" onClick={() => setLabOpen(false)}>ปิด</Button>
              </div>
            ]}
          >
            <div style={{ overflowY: 'auto' }}>
              <Table columns={columns} dataSource={labResult} />
            </div>
          </Modal>
        </div>
      );
    }
  };
  const showXRayDetail = () => {
    if (opdClinicDetail?.xrays?.length > 0) {
      return <div>
        {opdClinicDetail?.xrays.map((o, index) => <div key={index}>
          <p className="data-value ms-5" style={{
            color: o.statusDesc === "Accept" ? "blue" : o.statusDesc === "Reject" ? "red" : "#424242"
          }}>
            {o.expenseName}
          </p>
        </div>)}
      </div>;
    }
  };
  const showOrdersDetail = () => {
    if (opdClinicDetail?.orders?.length > 0) {
      return <div>
        {opdClinicDetail?.orders.map((o, index) => <div key={index}>
          <p className="data-value ms-5">{o.expenseName}</p>
        </div>)}
      </div>;
    }
  };
  const showClinicDoctorAndNurse = (opdClinicDetail) => {
    const doctorData = [
      {
        field: "chiefComplaint",
        label: "อาการสำคัญ",
      },
      {
        field: "presentIllness",
        label: "การเจ็บป่วยในปัจจุบัน",
      },
      {
        field: "pastHistory",
        label: "การเจ็บป่วยในอดีต",
      },
      {
        field: "physicalExam",
        label: "การตรวจร่างกาย",
      },
    ]
    const nurseData = [
      {
        field: "chiefComplaintNurse",
        label: "อาการสำคัญ (Nurse)",
      },
      {
        field: "presentIllnessNurse",
        label: "การเจ็บป่วยในปัจจุบัน (Nurse)",
      },
      {
        field: "pastHistoryNurse",
        label: "การเจ็บป่วยในอดีต (Nurse)",
      },
      {
        field: "physicalExamNurse",
        label: "การตรวจร่างกาย (Nurse)",
      },
    ]
    return <>
      {
        map(doctorData, o => {
          return <div key={o.field}>
            <p>
              <label className="gx-text-primary fw-bold">{o.label}</label>
            </p>
            <div dangerouslySetInnerHTML={{ __html: `${opdClinicDetail?.[o.field] || ""}` }} />
          </div>
        })
      }

      {showpicturesDetail(opdClinicDetail?.pictures || [])}

      {
        map(nurseData, o => {
          // console.log('opdClinicDetail?.[o.field]', opdClinicDetail?.[o.field])
          return <div key={o.field}>
            <p>
              <label className="gx-text-primary fw-bold">{o.label}</label>
            </p>
            <div dangerouslySetInnerHTML={{ __html: `${opdClinicDetail?.[o.field] || ""}` }} />
          </div>
        })
      }
    </>
  }
  const notificationX = (type, title,) => {
    notification[type ? "success" : "warning"]({
      message: <label className={type ? "gx-text-primary-bold" : "topic-danger-bold"}>
        {title}
      </label>,
      description: <>
        <label className={type ? "gx-text-primary me-1" : "topic-danger me-1"}>
          {type ? "สำเร็จ" : "ไม่สำเร็จ"}
        </label>
      </>,
      duration: 10
    });
  };
  const [form] = Form.useForm();
  const onFinish = async v => {
    // console.log("onFinish", v);
    let count = 0;
    if (v?.editStatus === "Y") {
      setLoading(true);
      let req = opdClinicDetail;
      req.checkin = v?.checkin || null;
      req.checkout = v?.checkout || null;
      req.serviceType = v?.serviceType || null;
      req.subspecialty = v?.subspecialty || null;
      req.accidentFlag = v?.accidentFlag ? "Y" : null;
      req.aetype = v?.aetype || null;
      req.workId = v?.workId || null;
      // console.log(req);
      await axios({
        url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpdOpdClinic`,
        method: "POST",
        data: {
          mode: null,
          user: null,
          ip: null,
          lang: null,
          branch_id: null,
          requestData: req,
          barcode: null
        }
      }).then(res => {
        if (count === 0) {
          notificationX(res?.data?.isSuccess, "อัพเดตรายละเอียดการรับบริการ");
        }
        count = count + 1;
        if (res?.data?.isSuccess) {
          fetchHistoryClinicsDetail();
        }
      }).catch(error => {
        // console.log(error);
      });
      setLoading(false);
    }
    if (v?.users?.length > 0) {
      setLoading(true);
      let mapping = map(v.users, o => {
        return {
          assClinicId: o?.assClinicId || null,
          clinicId: opdClinicValue,
          userType: null,
          userId: o?.userId,
          userName: null,
          startTime: null,
          endTime: null,
          physicalExam: null,
          note: o?.note,
          userCreated: o?.assClinicId ? o?.userCreated : userId,
          dateCreated: o?.assClinicId ? o?.dateCreated : moment().format("MM-DD-YYYY HH:mm"),
          userModified: o?.assClinicId ? userId : null,
          dateModified: o?.assClinicId ? moment().format("MM-DD-YYYY HH:mm") : null
        };
      });
      let listForInsert = filter(mapping, o => !o?.assClinicId);
      let listForUpdate = filter(mapping, "assClinicId");
      let listForDel = differenceBy(listUser, listForUpdate, "assClinicId");
      const InsertOrUpdate = async () => {
        let reqForUpdSert = [...listForInsert, ...listForUpdate];
        await axios({
          url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpsertListOpdClinicAssistant`,
          method: "POST",
          data: {
            requestData: reqForUpdSert
          }
        }).then(res => {
          if (count === 0) {
            notificationX(res?.data?.isSuccess, "อัพเดตรายละเอียดการรับบริการ");
          }
          count = count + 1;
          if (res?.data?.isSuccess) {
            getOpdClinicAssistant();
          }
        }).catch(error => {
          // console.log(error);
        });
      };
      const Delete = async () => {
        await axios({
          url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/DelListOpdClinicAssistant`,
          method: "DELETE",
          data: {
            requestData: listForDel
          }
        }).then(res => {
          if (count === 0) {
            notificationX(res?.data?.isSuccess, "อัพเดตรายละเอียดการรับบริการ");
          }
          count = count + 1;
          if (res?.data?.isSuccess) {
            getOpdClinicAssistant();
          }
        }).catch(error => {
          // console.log(error);
        });
      };
      if (listForInsert?.length > 0 || listForUpdate?.length > 0) {
        await InsertOrUpdate();
      }
      if (listForDel?.length > 0) {
        await Delete();
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    if (updOpdClinic) {
      form.submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updOpdClinic]);
  const [filterDoctor, setFilterDoctor] = useState([]);
  useEffect(() => {
    if (listDoctorMas.length > 0) {
      let filterDropdown = filter(listDoctorMas, ["dataother1", workId]);
      setFilterDoctor(filterDropdown);
    }
    getDentalClinicMainWorkId(workId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId, listDoctorMas]);
  const notificationY = (type, title, topic) => {
    notification[type ? "success" : "warning"]({
      message: <label className={type ? "gx-text-primary-bold" : "topic-danger-bold"}>
        {title}
      </label>,
      description: <>
        <label className={type ? "gx-text-primary me-1" : "topic-danger me-1"}>
          {topic}
        </label>
      </>,
      duration: 5
    });
  };
  const usersForm = () => {
    return <>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.List name="users">
          {(fields, {
            add,
            remove
          }) => <>
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Button type="primary" onClick={() => add()}>
                    เพิ่มแพทย์
                  </Button>
                </Col>
              </Row>
              {fields.map(({
                name
              }) => <Row gutter={[8, 8]} key={nanoid()} style={{
                flexDirection: "row"
              }}>
                  <Col span={21}>
                    <Form.Item
                      // {...restField}
                      name={[name, "userId"]} label={<label className="gx-text-primary">แพทย์</label>} rules={[{
                        required: true,
                        message: "กรุณาเลือกแพทย์"
                      }]}>
                      <Select allowClear showSearch style={{
                        width: "100%"
                      }} className="data-value" disabled={form.getFieldsValue()?.users[name]?.assClinicId ? true : false} onChange={v => {
                        let list = form.getFieldsValue()?.users;
                        let filterX = filter(list || [], ["userId", v]);
                        if (filterX.length > 1) {
                          notificationY(false, "เลือกแพทย์ซ้ำกัน !", "กรุณาเลือกใหม่");
                          form.setFields([{
                            name: ["users", name, "userId"],
                            value: null
                          }
                            // { name: ["users", name, "userName",], value: null },
                          ]);
                        }
                      }}>
                        {filterDoctor?.length > 0 && filterDoctor.map(o => <Option value={o.datavalue} key={nanoid()} className="data-value">
                          {o.datadisplay}
                        </Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={3} className="text-center">
                    <Form.Item
                      // {...restField}
                      label={" "}>
                      <Button size="small" shape="circle" icon={<DeleteOutlined style={{
                        color: "red"
                      }} />} onClick={() => remove(name)} style={{
                        marginBottom: 0
                      }} />
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{
                    marginTop: -22
                  }}>
                    <Form.Item
                      // {...restField}
                      name={[name, "note"]} label={<label className="gx-text-primary">Note</label>}>
                      <Input.TextArea placeholder="Note" />
                    </Form.Item>
                  </Col>
                </Row>)}
            </>}
        </Form.List>
      </Form>
    </>;
  };
  let userDisplay = `${userDetails?.preName} ${userDetails?.firstName} ${userDetails?.lastName}`;
  // eslint-disable-next-line no-useless-concat
  const bg = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='180px' width='150px'>" + "<text transform='translate(10, 100) rotate(-50)' fill='rgb(189, 195, 199)' font-size='10'>" + userDisplay + "</text></svg>\")";
  const showOpdClinicDetailList = () => {
    const renderIcd10 = () => {
      return (
        <>
          {
            opdClinicDetail?.diagnosis?.length > 0 &&
            opdClinicDetail.diagnosis.map((o, index) =>
              <p key={index} className="data-value ms-3">
                <b> {o.icd} </b> {o?.diagnosisMaster}
              </p>
            )
          }
        </>
      )
    }
    const renderDiags = () => {
      return (
        <>
          {!isWorkPlaceTypeDen &&
            opdClinicDetail?.diagnosis?.length > 0 &&
            opdClinicDetail.diagnosis.map((o, index) =>
              <p key={index} className="data-value ms-3">
                {/* <b> {o.icd} </b> {o.diagnosis} */}
                {o.diagnosis}
              </p>
            )
          }
          {isWorkPlaceTypeDen &&
            dentalDiags.map((o, i) => {
              return (
                <Row gutter={[4, 4]} key={String(i)} className='ms-3'>
                  <Col span={3}>
                    <LabelTopic text={o.teeth} />
                  </Col>
                  <Col span={21}>
                    {
                      o?.icd10.map((icd, i) => {
                        return (
                          <div key={String(i)}>
                            {
                              i > 0 && <Divider />
                            }
                            <Row gutter={[4, 4]} key={String(i)}>
                              <Col span={12}>
                                <p style={{ wordBreak: "break-all" }} className='data-value'>
                                  <b>{icd?.icd}</b>-{icd?.diagnosis}
                                </p>
                              </Col>
                              <Col span={12}>
                                {
                                  icd?.treatment.map((t, i) => {
                                    return (
                                      <p key={String(i)} style={{ wordBreak: "break-all" }} className='data-value'>
                                        <b>{t.treatment}</b>-{t.name}
                                      </p>
                                    )
                                  })
                                }
                              </Col>
                            </Row>
                          </div>
                        )
                      })
                    }
                  </Col>
                </Row>
              )
            })
          }
        </>
      )
    }
    const renderIcd9 = () => {
      return (
        <>
          {opdClinicDetail?.procedures?.length > 0 && opdClinicDetail?.procedures?.map((o, index) => <p key={index} className="data-value ms-3">
            <b>  {o.icd} </b>{o.procedureMaster}{" "}
          </p>)}
        </>
      )
    }
    const renderProcedures = () => {
      return (
        <>
          {
            opdClinicDetail?.procedures?.length > 0 &&
            opdClinicDetail.procedures.map((o, index) =>
              <p key={index} className="data-value ms-3">
                {/* <b> {o.icd} </b> {o.diagnosis} */}
                {o.procedure}
              </p>
            )
          }
          {/* {isWorkPlaceTypeDen &&
            dentalDiags.map((o, i) => {
              return (
                <Row gutter={[4, 4]} key={String(i)} className='ms-3'>
                  <Col span={3}>
                    <LabelTopic text={o.teeth} />
                  </Col>
                  <Col span={21}>
                    {
                      o?.icd10.map((icd, i) => {
                        return (
                          <div key={String(i)}>
                            {
                              i > 0 && <Divider />
                            }
                            <Row gutter={[4, 4]} key={String(i)}>
                              <Col span={12}>
                                <p style={{ wordBreak: "break-all" }} className='data-value'>
                                  <b>{icd?.icd}</b>-{icd?.diagnosis}
                                </p>
                              </Col>
                              <Col span={12}>
                                {
                                  icd?.treatment.map((t, i) => {
                                    return (
                                      <p key={String(i)} style={{ wordBreak: "break-all" }} className='data-value'>
                                        <b>{t.treatment}</b>-{t.name}
                                      </p>
                                    )
                                  })
                                }
                              </Col>
                            </Row>
                          </div>
                        )
                      })
                    }
                  </Col>
                </Row>
              )
            })
          } */}
        </>
      )
    }
    return <div style={{
      width: "100%",
      height: "100%",
      backgroundImage: bg
    }}>
      <div hidden={!showSelect}>
        <div style={{
          marginTop: "10px"
        }}>
          <Row gutter={[8, 8]}>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">BW</label>
              <label className="data-value">
                {opdClinicDetail?.weight && toNumber(opdClinicDetail?.weight)}{" "}
                kg
              </label>
            </Col>
            <Col span={4}>
              <label className="gx-text-primary fw-bold me-1">Ht.</label>
              <label className="data-value">
                {opdClinicDetail?.height && toNumber(opdClinicDetail?.height)}{" "}
                cm
              </label>
            </Col>
            <Col span={6}>
              <label className="gx-text-primary fw-bold me-1">BP</label>
              <label className="data-value">{opdClinicDetail?.bp || "-"}</label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">BT</label>
              <label className="data-value">
                {opdClinicDetail?.bodyTemperature && toNumber(opdClinicDetail?.bodyTemperature)}{" "}
                °C
              </label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">P</label>
              <label className="data-value">
                {opdClinicDetail?.pulse && toNumber(opdClinicDetail?.pulse)}
                /min
              </label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">R</label>
              <label className="data-value">
                {opdClinicDetail?.respiratory && toNumber(opdClinicDetail?.respiratory)}
                /min
              </label>
            </Col>
            <Col span={2}>
              <label className="ms-3 gx-text-primary" onClick={() => {
                setShowOpdVitalSignsModal(true)
                // console.log('opdClinicDetail', opdClinicDetail)
                // vitalSignsForm.setFieldsValue(opdClinicDetail)
              }}>
                <BsThreeDots style={threeDot} />
              </label>
            </Col>
          </Row>
        </div>
        <Divider />
        {editAble && <div className="mt-3">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item name="editStatus" hidden>
              <Input />
            </Form.Item>
            <Row gutter={[8, 8]} style={{
              flexDirection: "row"
            }} align="middle">
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="workId" label={<label className="gx-text-primary fw-bold">
                  หน่วยที่ซักประวัติ
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children" allowClear showSearch
                    // value={subspecialtyValue}
                    onChange={value => {
                      // setSubspecialtyValue(value)
                      form.setFieldsValue({
                        editStatus: "Y"
                      });
                      // setWorkIdIsChange(value)
                      getDentalClinicMainWorkId(value);
                    }} dropdownMatchSelectWidth={280} className="data-value">
                    {workPlaceList.map((val, index) => <Option value={val.datavalue} key={index} className="data-value"
                    // disabled={disabledFieldInOption(val.datavalue, opdClinicsDetailList, "subspecialty")}
                    >
                      {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="subspecialty" label={<label className="gx-text-primary fw-bold">
                  Subspecialty
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children" allowClear showSearch
                    // value={subspecialtyValue}
                    onChange={() => {
                      // setSubspecialtyValue(value)
                      form.setFieldsValue({
                        editStatus: "Y"
                      });
                    }} dropdownMatchSelectWidth={280} className="data-value">
                    {listSubWorkPlace?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value"
                    // disabled={disabledFieldInOption(val.datavalue, opdClinicsDetailList, "subspecialty")}
                    >
                      {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="serviceType" label={<label className="gx-text-primary fw-bold">
                  ประเภทการให้บริการ
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children"
                    // allowClear
                    showSearch
                    // value={serviceType}
                    onChange={() => {
                      // setServiceType(value)
                      // console.log('value :>> ', value);
                      form.setFieldsValue({
                        editStatus: "Y"
                      });
                    }} dropdownMatchSelectWidth={280} className="data-value">
                    {serviceTypeList.map((val, index) => <Option value={val.datavalue} key={index} className="data-value"
                    // disabled={disabledFieldInOption(val.datavalue, opdClinicsDetailList, "serviceType")}
                    >
                      {val.datavalue} - {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="aetype" label={<label className="gx-text-primary fw-bold">
                  ประเภทผู้ป่วยอุบัติเหตุ
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children" allowClear showSearch disabled={!form.getFieldsValue()?.accidentFlag} onChange={() => {
                    form.setFieldsValue({
                      editStatus: "Y"
                    });
                  }} dropdownMatchSelectWidth={280} className="data-value">
                    {aeTypeMas?.length > 0 && aeTypeMas.map((val, index) => <Option value={val.code} key={index} className="data-value">
                      {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="checkout" label={<label className="gx-text-primary fw-bold">
                  สถานะการจำหน่าย
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children"
                    // allowClear
                    showSearch
                    // value={checkOutValue}
                    onChange={() => {
                      // setCheckOutValue(value)
                      form.setFieldsValue({
                        editStatus: "Y"
                      });
                    }} dropdownMatchSelectWidth={280} className="data-value">
                    {checkoutList.map((val, index) => <Option value={val.datavalue} key={index} className="data-value"
                    // disabled={disabledFieldInOption(val.datavalue, opdClinicsDetailList, "checkout")}
                    >
                      {val.datavalue} - {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6} xl={8} xxl={8}>
                <Form.Item name="checkin" label={<label className="gx-text-primary fw-bold">
                  สถานะการมารับบริการ
                </label>}>
                  <Select style={{
                    width: "100%"
                  }} optionFilterProp="children"
                    // allowClear
                    showSearch
                    // value={checkInValue}
                    onChange={() => {
                      // setCheckInValue(value)
                      form.setFieldsValue({
                        editStatus: "Y"
                      });
                    }} dropdownMatchSelectWidth={280} className="data-value">
                    {checkinList.map((val, index) => <Option value={val.datavalue} key={index}
                      // disabled={disabledFieldInOption(val.datavalue, opdClinicsDetailList, "checkin")}
                      className="data-value">
                      {val.datadisplay}
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item name="accidentFlag" valuePropName="checked"
                  // label={<label className="gx-text-primary fw-bold">อุบัติเหตุ</label>}
                  onChange={() => {
                    form.setFieldsValue({
                      editStatus: "Y"
                    });
                    setFriend(!friend);
                  }}>
                  <Checkbox>
                    <label className="gx-text-primary fw-bold">
                      อุบัติเหตุ
                    </label>
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="hiv" valuePropName="checked"
                // label={<label className="gx-text-primary fw-bold">HIV Positive</label>}
                >
                  <Checkbox>
                    <label className="gx-text-primary fw-bold">
                      HIV Positive
                    </label>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          {usersForm()}
          <Divider />
        </div>}
      </div>

      <div style={{
        width: "100%",
        height: "100%",
        backgroundImage: bg
      }}
        hidden={showSelect}
      >
        <div style={{
          marginTop: "10px"
        }}

        >
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <label className="gx-text-primary fw-bold me-1">ผลการรักษา</label>
              <label className="data-value">
                {opdClinicDetail?.statusDesc} {" "}
              </label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">BW</label>
              <label className="data-value">
                {opdClinicDetail?.weight && toNumber(opdClinicDetail?.weight)}{" "}
                kg
              </label>
            </Col>
            <Col span={4}>
              <label className="gx-text-primary fw-bold me-1">Ht.</label>
              <label className="data-value">
                {opdClinicDetail?.height && toNumber(opdClinicDetail?.height)}{" "}
                cm
              </label>
            </Col>
            <Col span={6}>
              <label className="gx-text-primary fw-bold me-1">BP</label>
              <label className="data-value">{opdClinicDetail?.bp || "-"}</label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">BT</label>
              <label className="data-value">
                {opdClinicDetail?.bodyTemperature && toNumber(opdClinicDetail?.bodyTemperature)}{" "}
                °C
              </label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">P</label>
              <label className="data-value">
                {opdClinicDetail?.pulse && toNumber(opdClinicDetail?.pulse)}
                /min
              </label>
            </Col>
            <Col span={3}>
              <label className="gx-text-primary fw-bold me-1">R</label>
              <label className="data-value">
                {opdClinicDetail?.respiratory && toNumber(opdClinicDetail?.respiratory)}
                /min
              </label>
            </Col>

            <Col span={2}>
              <label className="ms-3 gx-text-primary" onClick={() => {
                setShowOpdVitalSignsModal(true)
                // console.log('opdClinicDetail', opdClinicDetail)
                // vitalSignsForm.setFieldsValue(opdClinicDetail)
              }}>
                <BsThreeDots style={threeDot} />
              </label>
            </Col>
          </Row>
        </div>
        <Divider />
      </div>
      {showClinicDoctorAndNurse(opdClinicDetail)}
      <div>
        <p>
          <label className="gx-text-primary fw-bold">Investigation</label>
        </p>
        <div className="ms-3">
          <p className="gx-text-primary fw-boldms-3">LAB</p>
          {showLabDetail()}
        </div>
        <div className="ms-3">
          <p className="gx-text-primary fw-boldms-3">X-Ray</p>
          {showXRayDetail()}
        </div>
        <div className="ms-3">
          <p className="gx-text-primary fw-boldms-3">Orders</p>
          {showOrdersDetail()}
        </div>
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">การแปลผลทางคลินิค</label>
        </p>
        {opdClinicDetail?.clinicalFinding && <div className="ms-3" dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.clinicalFinding || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">Doctor Note</label>
        </p>
        {opdClinicDetail?.doctorNote && <div className="ms-3" dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.doctorNote || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">Nurse Note</label>
        </p>
        {opdClinicDetail?.nurseNote && <div className="ms-3" dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.nurseNote || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">Observer</label>
        </p>
        {opdClinicDetail?.clinilcObservers && (
          <div className="ms-3" dangerouslySetInnerHTML={{
            __html: (() => {
              const latestObserver = opdClinicDetail.clinilcObservers
                .filter(observer => observer.observer !== null)
                .sort((a, b) => new Date(b.observerTime) - new Date(a.observerTime))[0];

              return latestObserver
                ? `${dayjs(latestObserver.observerTime).add(543, 'year').format('DD/MM/YYYY HH:mm:ss')} ${latestObserver.observer || ""}`
                : "";
            })()
          }} />
        )}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">Diagnosis {isWorkPlaceTypeDen ? "(Dental)" : ""}</label>
        </p>
        {renderDiags()}
      </div>
      <div hidden={isWorkPlaceTypeDen}>
        <p>
          <label className="gx-text-primary fw-bold">ICD10</label>
        </p>
        {renderIcd10()}
      </div>
      <div>
        {/* <Row gutter={[8, 8]}>
          <Col span={24}> */}
        <p>
          <label className="gx-text-primary fw-bold">
            Procedures/Operation
          </label>
        </p>
        {/* {opdClinicDetail?.procedures?.length > 0 && opdClinicDetail?.procedures?.map((o, index) => <p key={index} className="data-value ms-3">
              {o.icd} <b>{o.procedure}</b>{" "}
            </p>)} */}
        {renderProcedures()}
        {/* </Col>
        </Row> */}
      </div>
      <div hidden={isWorkPlaceTypeDen}>
        <p>
          <label className="gx-text-primary fw-bold">ICD9</label>
        </p>
        {renderIcd9()}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">
            Pharmacist Note
          </label>
        </p>
        {opdClinicDetail?.pharmacistNote && <div className="ms-3" dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.pharmacistNote || ""}`
        }} />}
      </div>
      <Divider />
      <div>
        {showMedicationDetails(opdClinicDetail?.medication || [])}
      </div>
    </div>;
  };
  return <Spin spinning={loading || drpLoading}>
    {showOpdClinicDetailList()}
    <Form form={vitalSignsForm}>
      <div>
        <ScreeningMoreVS
          page="10.28"
          show={showOpdVitalSignsModal}
          disabled={true}
          close={async bool => {
            if (bool) {
              await fetchVitalSigns(patientId);
            }
            setShowOpdVitalSignsModal(false);
          }}
          prevVitalSign={opdClinicDetail}
        />
        {/* <OpdVitalSigns show={showOpdVitalSignsModal} setModal={() => closeModal("opdVitalSigns", false)} vitalSignsDetail={vitalSignsDetail} vitalSignsEyes={vitalSignsEyes} /> */}
      </div>
    </Form>
  </Spin>;
}
const GetDentalDiags = async (clinicId, serviceId, patientId) => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DentalDiags/GetDentalDiags/${clinicId}, ${serviceId}, ${patientId}`,
    method: "GET"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetDentalTreatments = async (clinicId, serviceId, patientId) => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/DentalTreatments/GetDentalTreatments/${clinicId}, ${serviceId}, ${patientId}`,
    method: "GET"
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const GetVitalSignsDisplay = async patientId => {
  const res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetVitalSignsDisplay/${patientId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};