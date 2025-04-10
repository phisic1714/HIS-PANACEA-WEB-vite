import { env } from '../../env.js';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { nanoid } from "nanoid";
import { Row, Col, Spin, Select, Form, Divider, Checkbox, notification, Input, Button } from "antd";
import { map, filter, toNumber, differenceBy } from "lodash";
import { BsThreeDots } from "react-icons/bs";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import ScreeningMoreVS from 'routes/OpdClinic/Components/ScreeningMoreVS.js';
const {
  Option
} = Select;
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
export default function IpdClinicsDetail({
  patientId = null,
  opdClinicValue = null,
  showSelect = false,
  updOpdClinic = false,
  editAble = false,
  workId = null,
  admitId = null,
  // type = null
}) {
  const [loading, setLoading] = useState(false);
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const userId = userFromSession.responseData.userId;
  const userDetails = userFromSession.responseData;

  const [vitalSignsDetail, setVitalSignsDetail] = useState({});
  const [vitalSignsEyes, setVitalSignsEyes] = useState({});
  const [showOpdVitalSignsModal, setShowOpdVitalSignsModal] = useState(false);
  const [workPlaceList, setWorkPlaceList] = useState([]);
  const [checkinList, setCheckinList] = useState([]);
  const [checkoutList, setCheckoutList] = useState([]);
  const [serviceTypeList, setServiceTypeList] = useState([]);
  const [listDoctorMas, setListDoctorMas] = useState([]);
  const [aeTypeMas, setAeTypeMas] = useState([]);
  const [friend, setFriend] = useState(false);

  const [vitalSignsForm] = Form.useForm();
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
    let masters = `${env.REACT_APP_PANACEACHS_SERVER}/api/SocialMedication/GetAETypeMas`;
    await axios.get(masters).then(res => {
      setAeTypeMas(res.data.responseData);
    }).catch(error => console.log(error));
  };
  // ดึงข้อมูลรายละเอียดการมารับบริการ
  const [opdClinicDetail, setOpdClinicDetail] = useState({});
  const [listDiag, setListDiag] = useState([]);
  const [listProcedure, setListProcedure] = useState([]);
  const [listFinance, setListFinance] = useState([]);
  const fetchAdmitDetails = async admitId => {
    setLoading(true);
    let admitDetails = await getClinicsAdmits(admitId);
    setOpdClinicDetail(admitDetails);
    setLoading(false);
  };
  const GetIpdDiags = async admitId => {
    let diags = await getIpdDiags(admitId);
    setListDiag(diags);
  };
  const GetIpdProcedures = async admitId => {
    let procedures = await getIpdProcedures(admitId);
    setListProcedure(procedures);
  };
  const GetIpdFinance = async admitId => {
    let reqForFinances = {
      admitId: admitId,
      endDate: null,
      patientId: patientId,
      rightId: null,
      startDate: null,
      ward: null
    };
    let finances = await getIpdFinance(reqForFinances);
    if (!finances?.length) return setListFinance([]);
    if (finances?.length) {
      let tempFinances = [];
      map(finances, o => {
        tempFinances = [...tempFinances, ...o.finances];
      });
      setListFinance(tempFinances);
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
      setLoading(true);
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
      }).finally(() => setLoading(false));
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
  const [, setIsLoaded] = useState(false);
  useEffect(() => {
    fetchVitalSigns(patientId);
    if (admitId) {
      fetchAdmitDetails(admitId);
      GetIpdDiags(admitId);
      GetIpdProcedures(admitId);
      GetIpdFinance(admitId);
      async function fetchDropdown() {
        if (checkinList.length === 0) {
          setDrpLoading(true);
          let resA = await GetDropdown("GetCheckins");
          setCheckinList(resA);
          let resB = await GetDropdown("GetWorkPlacesMas");
          setWorkPlaceList(resB);
          let resC = await GetDropdown("GetServiceTypes");
          setServiceTypeList(resC);
          let resD = await GetDropdown("GetCheckOuts");
          setCheckoutList(resD);

          //new filter workroom and doctor
          let resE = await GetDropdownDoctorAndWork();
          setListDoctorMas(resE);
          getAETypeMas();
          setDrpLoading(false);
          setIsLoaded(true);
        }
      }
      fetchDropdown();
    } else {
      setVitalSignsDetail({});
      setVitalSignsEyes({});
      setOpdClinicDetail({});
      form.resetFields();
    }
    getOpdClinicAssistant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admitId]);
  // const closeModal = async (modalName, modalStatus) => {
  //   if (modalName === "opdVitalSigns") {
  //     setShowOpdVitalSignsModal(modalStatus);
  //   }
  // };
  const showLabDetail = () => {
    let filltered = filter(listFinance, ["financeType", "L"]);
    return <div>
      {filltered?.map((o, index) => <div key={index}>
        <p className="data-value ms-5" style={{
          color: o.status === "A" ? "blue" : o.statusDesc === "R" ? "red" : "#424242"
        }}>
          {o.expenseName}
        </p>
      </div>)}
    </div>;
  };
  const showXRayDetail = () => {
    let filltered = filter(listFinance, ["financeType", "X"]);
    return <div>
      {filltered?.map((o, index) => <div key={index}>
        <p className="data-value ms-5" style={{
          color: o.statusDesc === "A" ? "blue" : o.statusDesc === "R" ? "red" : "#424242"
        }}>
          {o.expenseName}
        </p>
      </div>)}
    </div>;
  };
  const showOrdersDetail = () => {
    let filltered = listFinance.filter(item => item.financeType !== "X" && item.financeType !== "L" && item.financeType !== "M" && item.financeType !== "D");
    return <div>
      {filltered?.map((o, index) => <div key={index}>
        <p className="data-value ms-5">{o.expenseName}</p>
      </div>)}
    </div>;
  };
  const showMedicationsDetail = () => {
    let filltered = filter(listFinance, ["financeType", "D"]);
    return <div>
      {filltered?.map((o, index) => <div key={index}>
        <p className="data-value ms-5">{o.expenseName}</p>
      </div>)}
    </div>;
  };
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
    // console.log(v);
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
          fetchAdmitDetails(admitId);
          GetIpdDiags(admitId);
          GetIpdProcedures(admitId);
          GetIpdFinance(admitId);
        }
      }).catch(error => {
        console.log(error);
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
          console.log(error);
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
          console.log(error);
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

  // useEffect(()=>{
  //   getSubspecialtyWorkId()

  // },[workIdIsChange])
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
                            // { name: ["users", name, "userName"], value: null },
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
  const showClinicDetailList = () => {
    return <div style={{
      width: "100%",
      height: "100%",
      backgroundImage: bg
    }}>
      <div hidden={showSelect}>
        <div style={{
          marginTop: "-12px"
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
              <label className="data-value">{opdClinicDetail?.bpSD}</label>
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
              <label className="ms-3 gx-text-primary" onClick={() => setShowOpdVitalSignsModal(true)}>
                <BsThreeDots style={threeDot} />
              </label>
            </Col>
          </Row>
        </div>
        <div>
          <ScreeningMoreVS
            page="10.3"
            disabled={true}
            show={showOpdVitalSignsModal}
            close={async bool => {
              if (bool) {
                await fetchVitalSigns(patientId);
              }
              setShowOpdVitalSignsModal(false);
            }}
            prevVitalSign={vitalSignsDetail}
          />
          {/* <OpdVitalSigns show={showOpdVitalSignsModal} setModal={() => closeModal("opdVitalSigns", false)} vitalSignsDetail={vitalSignsDetail} vitalSignsEyes={vitalSignsEyes} /> */}
        </div>
        <div style={marginForDivider}>
          <Divider />
        </div>
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
                  }} optionFilterProp="children" showSearch onChange={() => {
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
          <div style={marginForDivider}>
            <Divider />
          </div>
        </div>}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">อาการสำคัญ</label>
        </p>
        {opdClinicDetail?.chiefComplaint && <div dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.chiefComplaint || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">การเจ็บป่วยในอดีต</label>
        </p>
        {opdClinicDetail?.chiefComplaint && <div dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.pastHistory || ""}`
        }} />}
      </div>
      <div>
        {/* APi ยังไม่มีข้อมูลมาให้ */}
        <p>
          <label className="gx-text-primary fw-bold">
            การเจ็บป่วยในปัจจุบัน
          </label>
        </p>
        {opdClinicDetail?.chiefComplaint && <div dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.presentIllness || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">
            ประวัติคนในครอบครัว
          </label>
        </p>
        {opdClinicDetail?.chiefComplaint && <div dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.familyHistory || ""}`
        }} />}
      </div>
      <div>
        <p>
          <label className="gx-text-primary fw-bold">การตรวจร่างกาย</label>
        </p>
        {opdClinicDetail?.chiefComplaint && <div dangerouslySetInnerHTML={{
          __html: `${opdClinicDetail?.physicalExam || ""}`
        }} />}
      </div>
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
        <Row gutter={[8, 8]}>
          <Col span={20}>
            <p>
              <label className="gx-text-primary fw-bold">Diagnosis</label>
            </p>
            {listDiag?.map((o, index) => <p key={index} className="data-value ms-3">
              <b> {o.icd} </b> {o.diagnosis}
            </p>)}
          </Col>
        </Row>
      </div>
      <div>
        <Row gutter={[8, 8]}>
          <Col span={20}>
            <p>
              <label className="gx-text-primary fw-bold">
                Procedures/Operation
              </label>
            </p>
            {listProcedure?.map((o, index) => <p key={index} className="data-value ms-3">
              <b>{o.icd}</b> {" "} {o.procedure}
            </p>)}
          </Col>
          <Col span={4}></Col>
        </Row>
      </div>
      <div>
        <Row gutter={[8, 8]}>
          <Col save={24}>
            <p>
              <label className="gx-text-primary fw-bold">Medications</label>
            </p>
          </Col>
          {showMedicationsDetail()}
        </Row>
      </div>
    </div>;
  };
  return <Spin spinning={loading || drpLoading}>
    {showClinicDetailList()}
  </Spin>;
}
const getClinicsAdmits = async admitId => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Admits/GetAdmitDetailStatistics/${admitId}`,
    method: "GET"
    // data: { requestData: req }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const getIpdDiags = async admitId => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdDiags/GetIpdDiagsDisplay/${admitId}`,
    method: "GET"
    // data: { requestData: req }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const getIpdProcedures = async admitId => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdProcedures/GetIpdProceduresDisplay/${admitId}`,
    method: "GET"
    // data: { requestData: req }
  }).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};
const getIpdFinance = async req => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/IpdSummaryFinance`,
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

const GetVitalSignsDisplay = async patientId => {
  const res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetVitalSignsDisplay/${patientId}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};