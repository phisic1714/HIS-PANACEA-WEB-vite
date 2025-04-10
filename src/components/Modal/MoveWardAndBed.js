import React, { useState, useEffect } from "react";

import {
  Button,
  Checkbox,
  Col,
  Form,
  message,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import {find ,includes} from "lodash";
import { Scrollbars } from "react-custom-scrollbars";
import { useSelector } from "react-redux";

import dayjs from "dayjs";
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";

import Notifications from "./Notifications";


import {
  GetWorkPlaces,
  GetUserMas,
  GetBedsDepartList,
  GetDocSpecialties,
  GetUrgentTypes,
  GetFoodType,
  GetFoodGroup,
  GetAwailableBed,
  GetWaitAdmitPatientDetail,
  getFoodSupplementMasFetch,
  GetAdmitWardDateInDateOutLength,
  PrepareWaitAdmitPatient,
  MoveAdmitBedPatient,
  MoveAdmitWardPatient,
  UpdAdmitBedPatient,
} from "./API/MoveWardAndBedApi";

const { TextArea } = Input;

export default function MoveWardAndBed(props) {
  const [form] = Form.useForm();

  const { selectPatient } = useSelector(({ patient }) => patient);

  const { isVisible, onOk, onCancel, patientDetail = null } = props;

  console.log(props?.patientDetail);

  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  let user = userFromSession.responseData.userId;

  const [bedId, setBedId] = useState(null);
  const [listBed, setListBed] = useState([]);
  const [wardId, setWardId] = useState(null);

  const [selectedMeal, setSelectedMeal] = useState([]);

  const findDataInArray = (valueForFinding, list, fieldName) => {
    let res = find(list, (o) => {
      return o[fieldName] === valueForFinding;
    });
    if (res) {
      return true;
    } else return false;
  };

  const mealList = [
    {
      value: "A",
      label: "ทุกมื้อ",
      disabled:
        selectedMeal?.length === 0
          ? false
          : findDataInArray("A", selectedMeal, "meal"),
    },
    {
      value: "B",
      label: "มื้อเช้า",
      disabled:
        selectedMeal?.length === 0
          ? false
          : findDataInArray("B", selectedMeal, "meal"),
    },
    {
      value: "L",
      label: "มื้อกลางวัน",
      disabled:
        selectedMeal?.length === 0
          ? false
          : findDataInArray("L", selectedMeal, "meal"),
    },
    {
      value: "F",
      label: "มื้อเย็น",
      disabled:
        selectedMeal?.length === 0
          ? false
          : findDataInArray("F", selectedMeal, "meal"),
    },
  ];

  const [bedOnRelocate, setBedOnRelocate] = useState(null);
  const [wardOnRelocateBed, setWardOnRelocateBed] = useState(null);

  const [showProcessResultModal, setShowProcessResultModal] = useState(false);

  const [titletoModal, setTitleToModal] = useState(null);

  const [, setVisibleWaitModal] = useState(false);
  const [objDateInDateOut, setObjDateInDateOut] = useState({});

  const [masterDataModalWait, setMasterDataModalWait] = useState({
    workplace: [],
    bed: [],
    doctor: [],
    beddepart: [],
    specialist: [],
    urgenttype: [],
    food: [],
    foodgroup: [],
    awailableBed: [],
  });

  const [foodSupplement, setFoodSupplement] = useState([]);

  const getMasterDataModalWait = async (ward) => {
    Promise.all([
      await GetWorkPlaces(),
      await GetUserMas(),
      await GetBedsDepartList(),
      await GetDocSpecialties(),
      await GetUrgentTypes(),
      await GetFoodType(),
      await GetFoodGroup(),
      await getFoodSupplement(),
      await GetAwailableBed(ward),
    ])
      .then(
        ([
          workplace,
          doctor,
          beddepart,
          specialist,
          urgenttype,
          food,
          foodgroup,
          awailableBed,
        ]) => {
          setMasterDataModalWait({
            workplace: workplace,
            doctor: doctor,
            beddepart: beddepart,
            specialist: specialist,
            urgenttype: urgenttype,
            food: food,
            foodgroup: foodgroup,
            awailableBed: awailableBed || null,
          });
        }
      )
      .catch((error) => {
        throw error;
      });
  };

  const getWaitAdmitPatientDetail = async (val) => {
    let res = await GetWaitAdmitPatientDetail(val);
    if (res.isSuccess) {
      // let filterData = omit(res.responseData, ["dateIn", "dateOut"]);
      // console.log("res filterData  =>  ", filterData);
      setWardId(res.responseData.ward);
      setWardOnRelocateBed(res.responseData.ward);
      setBedId(res.responseData.bed);
      setBedOnRelocate(res.responseData.bed);

      if(listBed && res.responseData.bed && res.responseData.bedName){
        listBed.push({bedId : res.responseData.bed , name : res.responseData.bedName})
      }
      form.setFieldsValue({
        ...res.responseData,
        npoFlag: res.responseData.npoFlag ? true : false,
        admitTime: dayjs(res.responseData.admitTime, "MM/DD/YYYY HH:mm:ss"),
        dateIn: res.responseData?.admitWards[0]?.dateIn
          ? dayjs(
              res.responseData?.admitWards[0]?.dateIn,
              "MM/DD/YYYY HH:mm:ss"
            )
          : null,
        dateInTime: res.responseData?.admitWards[0]?.dateIn
          ? dayjs(
              res.responseData?.admitWards[0]?.dateIn,
              "MM/DD/YYYY HH:mm:ss"
            )
          : null,
        dateOut: res.responseData?.admitWards[0]?.dateOut
          ? dayjs(
              res.responseData?.admitWards[0]?.dateOut,
              "MM/DD/YYYY HH:mm:ss"
            )
          : dayjs(),
        dateOutTime: res.responseData?.admitWards[0]?.dateOut
          ? dayjs(
              res.responseData?.admitWards[0]?.dateOut,
              "MM/DD/YYYY HH:mm:ss"
            )
          : null,
        foods:
          res.responseData.foods.length > 0
            ? res.responseData.foods.map((item) => {
                return {
                  ...item,
                  foodType: item.foodType ? item.foodType : undefined,
                };
              })
            : [],
      });

      res.responseData.foods
        ? setSelectedMeal(res.responseData.foods)
        : setSelectedMeal([]);

      if (res.responseData.admitWards.length > 0) {
        let res2 = await GetAdmitWardDateInDateOutLength(
          res.responseData.admitWards[0].wardId
        );
        if (res2.isSuccess) {
          setObjDateInDateOut(res2.responseData);
        }
      }
    } else {
      setBedOnRelocate(null);
      setWardOnRelocateBed(null);
      form.resetFields();
    }
  };

  const getListBed = async () => {
    if (wardId) {
      // if(wardId == patientDetail?.ward)return
      // let res = await GetBedWardMas(wardId);
      let res = await GetAwailableBed(wardId);
      setListBed(res);
    } else {
      setListBed([]);
    }
  };

  const getFoodSupplement = async () => {
    if (foodSupplement.length === 0) {
      const result = await getFoodSupplementMasFetch();
      setFoodSupplement(result);
    }
  };

  const warning = (text) => {
    message.warning(text);
  };

  const success = (param) => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param}สำเร็จ`,
      type: "success",
    });
  };

  const faild = (param) => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param} ไม่สำเร็จ`,
      type: "warning",
    });
  };

  const prepareWaitAdmitPatient = async (val) => {
    let res = await PrepareWaitAdmitPatient(val);
    if (res.isSuccess) {
      // getAdmitRightDetailDisplay();
      success("บันทึก");
      setVisibleWaitModal(false);
      form.resetFields()
      onOk()
    } else {
      faild("บันทึก");
      // console.log(res.errorMessage);
    }
  };

  const moveAdmitBedPatient = async (val) => {
    let res = await MoveAdmitBedPatient(val);
    if (res.isSuccess) {
      // getAdmitRightDetailDisplay();
      success("บันทึก");
      setVisibleWaitModal(false);
      form.resetFields();
      onOk()
    } else {
      faild("บันทึก");
      // console.log(res.errorMessage);
    }
  };
  const moveAdmitWardPatient = async (val) => {
    let res = await MoveAdmitWardPatient(val);
    if (res.isSuccess) {
      // getAdmitRightDetailDisplay();
      success("บันทึก");
      setVisibleWaitModal(false);
      form.resetFields();
      onOk()
    } else {
      faild("บันทึก");
    }
  };
  const updAdmitBedPatient = async (val) => {
    let res = await UpdAdmitBedPatient(val);
    if (res.isSuccess) {
      // getAdmitRightDetailDisplay();
      success("บันทึก");
      setVisibleWaitModal(false);
      form.resetFields();
      onOk()
    } else {
      faild("บันทึก");
      // console.log(res.errorMessage);
    }
  };

  const onFinishFormWait = async (values) => {
    // console.log("onFinish: ", values);
    let hn = selectPatient?.hn;
    let parts = hn.split("/");
    // console.log("parts", parts);
    let otherData = form.getFieldValue();

    //วันที่
    let date = dayjs().format("MM/DD/YYYY HH:mm:ss");

    //ข้อมูล
    let data = {
      ...values,
      dateIn: values?.dateIn
        ? dayjs(values?.dateIn).format("YYYY-MM-DD HH:mm")
        : null,
      dateOut: values?.dateOut
        ? dayjs(values?.dateOut).format("YYYY-MM-DD HH:mm")
        : null,
      admitDate: values.admitTime.format("YYYY/MM/DD/ HH:mm:ss"),
      admitTime: values.admitTime.format("YYYY/MM/DD/ HH:mm:ss"),
      admitId: otherData.admitId,
      patientId: otherData.patientId,
      npoFlag: values.npoFlag ? "Y" : null,
      npoDate: values.npoFlag
        ? otherData.npoDate
          ? otherData.npoDate
          : date
        : null,
      npoUser: values.npoFlag
        ? otherData.npoUser
          ? otherData.npoUser
          : user
        : null,
      userModified: user,
      runHn: parts[0],
      yearHn: parts[1],
      hn: hn,
      admitFlag: "Y",
      dischFlag: null,
      extraFlag: null,
      foods:
        values.foods.length > 0
          ? values.foods.map((item) => {
            if (item.admitFoodId) {
              return {
                ...item,
                foodSupplement: item.foodSupplement
                  ? item.foodSupplement
                  : null,
                foodType: item.foodType ? item.foodType : null,
                foodDetail: item.foodDetail ? item.foodDetail : null,
                food: item.food ? item.food : null,
                userModified: user,
                dateModified: date,
              };
            } else {
              return {
                ...item,
                admitFoodId: null,
                admitId: otherData.admitId,
                foodSupplement: item.foodSupplement
                  ? item.foodSupplement
                  : null,
                foodType: item.foodType ? item.foodType : null,
                foodDetail: item.foodDetail ? item.foodDetail : null,
                food: item.food ? item.food : null,
                status: null,
                userCreated: user,
                dateCreated: date,
                userAccepted: null,
                dateAccepted: null,
                code: null,
                foodName: null,
              };
            }
          })
          : [],
    };
    // console.log(data);
    // console.log(data?.bed);

    if (wardId !== wardOnRelocateBed) {
      // console.log("ย้าย ward");
      await moveAdmitWardPatient(data);
    } else if (wardId === wardOnRelocateBed && !bedOnRelocate) {
      console.log("ward เดิม ไม่มีเตียง  รับลงเตียง");
      await prepareWaitAdmitPatient(data);
    } else if (wardId === wardOnRelocateBed && bedId !== bedOnRelocate) {
      // console.log("ward เดิมมีเตียง  ย้ายเตียงใน ward เดิม");
      await moveAdmitBedPatient(data);
    }

    //requestData For Update Admit
    else {
      // console.log("แก้ไขข้อมูลการย้ายเตียง");
      await updAdmitBedPatient(data);
    }
  };




  useEffect(() => {
    if (
      patientDetail?.admitId == null ||
      patientDetail?.admitId === undefined
    ) {
      if (isVisible === true)
        warning("กรุณาเลือกผู้ป่วยก่อน ย้าย Ward / เตียง");
      onCancel();
      return;
    }

    if (isVisible) {
      //   form.resetFields();
      //   setSelectDeptVisible(false);
      getMasterDataModalWait(patientDetail?.ward);
      if (selectPatient) {
        getWaitAdmitPatientDetail(selectPatient?.admitId);
      }
      //   fetchPatientDetail(patientId); /// fix please use dynamic
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    getListBed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wardId]);

  // useEffect(() => {
  //   if (selectPatient){

  //       getWaitAdmitPatientDetail(selectPatient?.admitId);
  //   }
  // }, [selectPatient]);

  return (
    <>
      <Modal
        closable={false}
        visible={isVisible && selectPatient?.admitId ? isVisible : false}
        footer={[
          <Button
            key="back"
            onClick={() => {
              onCancel();
              setWardId(null);
              form.resetFields();
            }}
          >
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            // disabled={bedId === bedOnRelocate}
          >
            บันทึก
          </Button>,
        ]}
        title={<Text>ย้าย Ward / เตียง</Text>}
        width={1000}
        centered
      >
        <Form
          form={form}
          name="wait"
          layout="vertical"
          wardId
            onFinish={onFinishFormWait}
        >
          <Row
            style={{ display: "flex", flexDirection: "row", marginTop: -14 }}
          >
            <Col span={6}>
              <Form.Item
                name="ward"
                label={<label className="gx-text-primary">Ward</label>}
                rules={[{ required: true, message: "กรุณาเลือกWard" }]}
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  // disabled
                  // allowClear={true}
                  optionFilterProp="children"
                  value={wardId}
                  onChange={(v) => {
                    setWardId(v);
                    form.setFieldsValue({
                      bed: null,
                    });
                  }}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={masterDataModalWait?.workplace.map((item) => {
                    return { value: item.datavalue, label: item.datadisplay };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="bed"
                label={<label className="gx-text-primary">เตียง</label>}
                rules={[
                  {
                    required: wardId === wardOnRelocateBed,
                    message: "กรุณาเลือกเตียง",
                  },
                ]}
              >
                <Select
                  disabled={wardId ? !(wardId === wardOnRelocateBed) : false}
                  style={{ width: "100%" }}
                  showSearch
                  allowClear={true}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={listBed?.map((item) => {
                    return {
                      value: item.bedId,
                      label: item.name,
                      disabled: item.admitId !== null,
                    };
                  })}
                  onChange={(v) => {
                    setBedId(v);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <label className="gx-text-primary">วันที่รับลงเตียง</label>
                }
                name={"dateIn"}
              >
                <DayjsDatePicker
                  form={form}
                  name={"dateIn"}
                  showTime
                  disabled={!(wardId === wardOnRelocateBed && !bedOnRelocate)}
                  disabledDate={(cur) =>
                    cur &&
                    (cur < dayjs(objDateInDateOut?.minDateIn) ||
                      cur > dayjs(objDateInDateOut?.maxDateIn))
                  }
                  // onChange={(e) => setDischDateInput(e.format("YYYY-MM-DD"))}
                  style={{ width: "100%" }}
                  format={"DD/MM/YYYY HH:mm"}
                />
              </Form.Item>
              <Form.Item hidden={true} name="admitTime">
                <DayjsDatePicker form={form} name="admitTime" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="dateOut"
                label={
                  <label className="gx-text-primary">วันที่ย้ายลงเตียง</label>
                }
              >
                <DayjsDatePicker
                  form={form}
                  name={"dateOut"}
                  showTime
                  style={{ width: "100%" }}
                  disabled={wardId === wardOnRelocateBed && !bedOnRelocate}
                  disabledDate={(cur) =>
                    cur && cur < dayjs(objDateInDateOut?.minDateOut)
                  }
                  format={"DD/MM/YYYY HH:mm"}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{ display: "flex", flexDirection: "row", marginTop: -14 }}
          >
            <Col span={6}>
              <Form.Item
                name="feverDoctor"
                label={
                  <label className="gx-text-primary">
                    แพทย์เจ้าของไข้(Admit)
                  </label>
                }
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  allowClear={true}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={masterDataModalWait?.doctor.map((item) => {
                    return { value: item.datavalue, label: item.datadisplay };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="depart"
                label={<label className="gx-text-primary">แผนก</label>}
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  allowClear={true}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={masterDataModalWait?.beddepart.map((item) => {
                    return { value: item.datavalue, label: item.datadisplay };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="specialty"
                label={<label className="gx-text-primary">สายงาน</label>}
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  allowClear={true}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={masterDataModalWait?.specialist.map((item) => {
                    return { value: item.datavalue, label: item.datadisplay };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="urgent"
                label={<label className="gx-text-primary">ระดับอาการ</label>}
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  allowClear={true}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  options={masterDataModalWait?.urgenttype.map((item) => {
                    return { value: item.datavalue, label: item.datadisplay };
                  })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{ display: "flex", flexDirection: "row", marginTop: -14 }}
          >
            <Col span={20}>
              <Form.Item
                name="preDx"
                label={<label className="gx-text-primary">Pre-Diagnosis</label>}
              >
                <Input></Input>
              </Form.Item>
            </Col>
            <Col span={4} style={{ display: "flex", alignItems: "center" }}>
              <Form.Item
                style={{ margin: "0px" }}
                name="npoFlag"
                valuePropName="checked"
                label={<label className="gx-text-primary">NPO</label>}
              >
                <Checkbox />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{ display: "flex", flexDirection: "row", marginTop: -14 }}
          >
            <Form.List name="foods">
              {(fields, { add, remove }) => {
                return (
                  <div
                    style={{ width: "100%", borderBottom: "1px solid #f5f5f5" }}
                  >
                    <Col span={24}>
                      <Form.Item>
                        <Button
                          style={{ margin: "0", marginRight: 8 }}
                          type="primary"
                          onClick={() => {
                            add();
                          }}
                          icon={<PlusOutlined />}
                          size="small"
                          shape="circle"
                        />
                        รายละเอียดอาหาร
                      </Form.Item>
                    </Col>
                    <Scrollbars autoHeight autoHeightMin={180}>
                      {fields.map(({ key, name, ...restField }) => (
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} key={key}>
                          <Row
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              // marginTop:-10
                            }}
                          >
                            <Col xs={24} sm={24} md={3} lg={3} xl={3}>
                              <Form.Item>
                                <Button
                                  style={{ margin: "0" }}
                                  danger
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  shape="circle"
                                  onClick={() => {
                                    remove(name);
                                    let all = form.getFieldValue("foods");
                                    if (
                                      all.length === 0 ||
                                      selectedMeal.length === 0 ||
                                      all[0] === undefined
                                    ) {
                                      setSelectedMeal([]);
                                    } else {
                                      setSelectedMeal(
                                        all.filter(
                                          (item) =>
                                            !includes(selectedMeal, {
                                              meal: item.meal,
                                            })
                                        )
                                      );
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={7} lg={7} xl={7}>
                              <Form.Item
                                {...restField}
                                name={[name, "meal"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณาเลือกมื้อ",
                                  },
                                ]}
                              >
                                <Select
                                  size={"small"}
                                  style={{ width: "100%" }}
                                  placeholder="มื้ออาหาร"
                                  allowClear={true}
                                  showSearch
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option?.label
                                      ?.toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  options={mealList}
                                  onSelect={(value) => {
                                    let all = form.getFieldValue("foods");
                                    if (selectedMeal.length > 0) {
                                      setSelectedMeal(
                                        all.filter(
                                          (item) =>
                                            !includes(selectedMeal, {
                                              meal: item.meal,
                                            })
                                        )
                                      );
                                    } else {
                                      setSelectedMeal([{ meal: value }]);
                                    }
                                  }}
                                  onClear={() => {
                                    let all = form.getFieldValue("foods")[name];
                                    // console.log("ค่า", selectedMeal);
                                    // console.log("all", all);
                                    if (selectedMeal.length > 0) {
                                      setSelectedMeal(
                                        selectedMeal.filter(
                                          (item) => item.meal !== all.meal
                                        )
                                      );
                                    } else {
                                      setSelectedMeal([]);
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={7} lg={7} xl={7}>
                              <Form.Item
                                {...restField}
                                name={[name, `foodType`]}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณาเลือกประเเภท",
                                  },
                                ]}
                              >
                                <Select
                                  size={"small"}
                                  style={{ width: "100%" }}
                                  showSearch
                                  placeholder="ประเภท"
                                  allowClear={true}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option?.label
                                      ?.toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  options={masterDataModalWait?.food.map(
                                    (item) => {
                                      return {
                                        value: item.datavalue,
                                        label: item.datadisplay,
                                      };
                                    }
                                  )}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={7} lg={7} xl={7}>
                              <Form.Item {...restField} name={[name, `food`]}>
                                <Select
                                  size={"small"}
                                  style={{ width: "100%" }}
                                  showSearch
                                  placeholder="ลักษณะ"
                                  allowClear={true}
                                  optionFilterProp="children"
                                  filterOption={(input, option) =>
                                    option?.label
                                      ?.toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  }
                                  options={masterDataModalWait?.foodgroup.map(
                                    (item) => {
                                      return {
                                        value: item.datavalue,
                                        label: item.datadisplay,
                                      };
                                    }
                                  )}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              marginTop: -22,
                            }}
                          >
                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, `foodDetail`]}
                              >
                                <Input
                                  size={"small"}
                                  placeholder="รายละเอียดอาหาร"
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                    </Scrollbars>
                  </div>
                );
              }}
            </Form.List>
          </Row>
          <Row style={{ display: "flex", flexDirection: "row", marginTop: 6 }}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item name="otherRemark">
                <TextArea rows={2} placeholder="รายละเอียดอื่นๆ"></TextArea>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item name="moveReason">
                <TextArea rows={2} placeholder="เหตุผลในการย้าย"></TextArea>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Notifications
        setModal={(isVisible) => {
          setShowProcessResultModal(isVisible);
          setTitleToModal(null);
        }}
        isVisible={showProcessResultModal}
        title={titletoModal?.title}
        type={titletoModal?.type}
      />
      {/* <Noti
        setModal={() => {
          setShowNotificationsModal(false);
          setProcessResult({});
          setNotificationsTitle(null);
          setNotificationType(null);
        }}
        isVisible={showNotificationsModal}
        response={processResult}
        title={notificationsTitle}
        type={notificationType}
      /> */}
    </>
  );
}
