import { Button, Card, Checkbox, Col, Form, Input, Modal, Radio, Select, Tooltip } from 'antd';
import axios from 'axios';
import { GenDatePicker, GenFormItem2, GenInput, GenTimePicker } from "components/Input/FormControls";
import SelectIcdDocFav from 'components/Input/SelectIcdDocFav';
import { callApis } from 'components/helper/function/CallApi';
import {
  LabelTopicPrimary,
} from "components/helper/function/GenLabel";
import GenRow from "components/helper/function/GenRow";
import dayjs from 'dayjs';
import { countBy, filter, find } from 'lodash';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { env } from '../../env.js';
import {
  GetBedsDepartList, GetBedsDocSpecialtiesList,
  GetDoctorMas,
  GetForceDocAdmitAndForceDiag,
  GetOpdClinicHistory,
  GetOpdClinicsByServiceId,
  GetPatientRight,
  GetWorkPlaces_Dashboard_Mas,
  GetWorkPlaces_OPD_Visit,
  GetWorkPlaces_OPD_VisitToday,
  InsAdmit,
  InsListAdmitRight,
  apiObject,
  GetDropDownAdmitTypeMas
} from '../../routes/AdmissionCenter/API/AdmitRegisterApi';

const {
  Option
} = Select;
const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

const requiredDefault = {
  forceDiag: false,
  forceDocAdmit: false
}

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
let user = userFromSession.responseData.userId;

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

const failCustom = param => {
  Modal.error({
    content: `บันทึกข้อมูลไม่สำเร็จ ${param}`,
    okText: "ปิด"
  });
};

const warningMessage = param => {
  Modal.warning({
    content: param,
    okText: "ปิด"
  });
};

export default function AdmitRegisterAdmission({
  onChangeConceledFlag,
  ...props
}) {
  const departIdRef = useRef(null);
  const workIdRef = useRef(null);

  const [form] = Form.useForm();
  const ward = Form.useWatch("ward", form)

  const [insertAdmitLoading, setInsertAdmitLoading] = useState(false);
  const yearAn = dayjs().add(543, "years").format("YY");
  const [workPlacesOpdVisit, setWorkPlacesOpdVisit] = useState([]);
  const [workPlacesOpdVisitToday, setWorkPlacesOpdVisitToday] = useState([]);
  const [workPlacesDashboardMas, setWorkPlacesDashboardMas] = useState([]);
  const [doctorMas, setDoctorMas] = useState([]);
  const [bedsDepartList, setBedsDepartList] = useState([]);
  const [bedsDocSpecialtiesList, setBedsDocSpecialtiesList] = useState([]);
  const [awailableBed, setAwailableBed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [required, setRequired] = useState(requiredDefault)
  const [aNToShow, setANToShow] = useState("")
  const [, setListOpdClinic] = useState([]);
  const [admitType, setAdmitType] = useState([])
  // console.log('admitType', admitType)

  const getOpdClinicsByServiceId = async serviceId => {
    if (!props?.isNoService) return;
    let res = await GetOpdClinicsByServiceId(serviceId);
    setListOpdClinic(res);
  };

  const getAwailableBed = async ward => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/CheckAvaliableBed/${ward}`).then(({
      data
    }) => {
      const {
        isSuccess,
        responseData
      } = data;
      if (isSuccess) {
        setAwailableBed(responseData);
      } else {
        setAwailableBed([]);
      }
    }).catch(error => {
      return error;
    });
  };

  const onFinish = async values => {
    const dateMix = `${typeof values.dateAdmit === "string" ? values.dateAdmit : values.dateAdmit.format('DD/MM/YYYY')} ${values.timeAdmit.format('HH:mm:ss')}`;
    setInsertAdmitLoading(true);
    const patientRight = await GetPatientRight(props.patientId);
    let mainRight = find(patientRight, ["ptRightId", props?.mainFlag]);
    if (props?.rightId?.length > 0) {
      let clinicId = props?.clinicId || find(workPlacesOpdVisitToday, ["datavalue", values.admitOPD])?.dataother1 || null;
      let objInsAdmit = {
        ...values,
        admitDate: values.dateAdmit ? dayjs(dateMix, "DD/MM/YYYY HH:mm:ss").format(dateTimeFormat) : null,
        admitTime: values.timeAdmit ? dayjs(dateMix, "DD/MM/YYYY HH:mm:ss").format(dateTimeFormat) : null,
        patientId: props.patientId ? props.patientId : null,
        runHn: props.list.runHn ? props.list.runHn : null,
        yearHn: props.list.yearHn ? props.list.yearHn : null,
        hn: props.list.hn ? props.list.hn : null,
        depart: values.department ? values.department : null,
        ward: values.ward ? values.ward : null,
        register: user ? user : null,
        registerDate: dayjs().format(dateTimeFormat),
        rightId: mainRight?.rightId || null,
        admitDoctor: values.doctorAdmit ? values.doctorAdmit : null,
        readmitFlag: values.readmitFlag ? "Y" : "N",
        pregnantFlag: values.pregnantFlag === 1 ? "P" : values.pregnantFlag === 2 ? "N" : null,
        conceledFlag: values.conceledFlag ? "Y" : "N",
        yearAn: yearAn ? yearAn : null,
        accidentFlag: values.accidentFlag ? "Y" : "N",
        opdAdmit: values.admitOPD,
        specialty: values.branch ? values.branch : null,
        preDx: values.preDx ? values.preDx : null,
        icdPreDx: values.icdPreDx ? values.icdPreDx : null,
        clinicId: clinicId,
        serviceId: props?.serviceId || null,
        weight: values.weight ? values.weight + "" : null,
        bed: values.bed || null,
        admitType: values.admitType || null,
      };
      if (props.pageId === "4.10") {
        objInsAdmit = {
          ...objInsAdmit,
          yearAn: values.an.split("/")[1],
          runAn: values.an.split("/")[0],
          an: values.an || null
        };
      }
      // return console.log('objInsAdmit :>> ', objInsAdmit);
      const resultInsAdmit = await InsAdmit(objInsAdmit);

      let objInsListAdmitRight = [];
      for (let i = 0; i < props.rightId.length; i++) {
        let findData = patientRight.find(item => item.ptRightId === props.rightId[i]);
        objInsListAdmitRight.push({
          "admitRightId": null,
          "patientId": props.patientId ? props.patientId : null,
          "runHn": props.list.runHn ? props.list.runHn : null,
          "yearHn": props.list.yearHn ? props.list.yearHn : null,
          "hn": props.list.hn ? props.list.hn : null,
          "admitId": resultInsAdmit ? resultInsAdmit.returnData : null,
          "rightId": findData?.rightId || null,
          "insid": findData ? findData.insid ? findData.insid : null : null,
          "mainFlag": props?.mainFlag === findData?.ptRightId ? "Y" : null,
          "hmain": findData ? findData.hmain ? findData.hmain : null : null,
          "hsub": findData ? findData.hsub ? findData.hsub : null : null,
          "hmainOp": findData ? findData.hmainOp ? findData.hmainOp : null : null,
          "govcode": findData ? findData.govcode ? findData.govcode : null : null,
          "ownRightPid": findData ? findData.ownRightPid ? findData.ownRightPid : null : null,
          "owner": findData ? findData.owner ? findData.owner : null : null,
          "relinscl": findData ? findData.relinscl ? findData.relinscl : null : null,
          "remark": findData ? findData.remark ? findData.remark : null : null,
          "userCreated": findData ? findData.userCreated ? findData.userCreated : null : null,
          "dateCreated": findData ? findData.dateCreated ? findData.dateCreated : null : null,
          "userModified": null,
          "dateModified": null,
          "limit": findData ? findData.limit ? findData.limit : null : null,
          opdFinance: "Y",
        });
      }
      let resultInsListAdmitRight = {};
      const {
        isSuccess,
        errorMessage
      } = resultInsAdmit;
      if (isSuccess) {
        resultInsListAdmitRight = await InsListAdmitRight(objInsListAdmitRight);
      } else {
        failCustom(errorMessage);
        setInsertAdmitLoading(false);
        return;
      }
      if (resultInsListAdmitRight.isSuccess) {
        success("add");
        props?.setRefresh(prev => !prev);
        setANToShow(resultInsAdmit ? resultInsAdmit?.returnData2 : "")
        callApis(apiObject["InsertDrugProfileTypeO"], { admitId: resultInsAdmit.returnData })
      } else {
        setInsertAdmitLoading(false);
        fail("add");
      }
    } else {
      warningMessage("กรุณาเลือกสิทธิ์การรักษา!");
    }
    setInsertAdmitLoading(false);
  };

  const getWorkPlacesOpdVisitApi = async () => {
    const result = await GetWorkPlaces_OPD_Visit();
    setWorkPlacesOpdVisit(result);
  };

  const getWorkPlacesDashboardMasApi = async () => {
    const result = await GetWorkPlaces_Dashboard_Mas();
    setWorkPlacesDashboardMas(result);
  };

  const getDoctorMasApi = async () => {
    const result = await GetDoctorMas();
    setDoctorMas(result);
  };

  const getBedsDepartListApi = async () => {
    const result = await GetBedsDepartList();
    setBedsDepartList(result);
  };

  const getBedsDocSpecialtiesListApi = async () => {
    let obj = {
      departId: null,
      workId: null
    };
    const result = await GetBedsDocSpecialtiesList(obj);
    setBedsDocSpecialtiesList(result);
  };

  const getAdmitTypeListApi = async () => {
    const result = await GetDropDownAdmitTypeMas();
    setAdmitType(result);
  };

  const fetchOpdClinicHistory = async (patientId, clientId, workId, specialty, departId, accidentFlag, conceledFlag, readmitFlag, pregnantFlag, lastWeight) => {
    // console.log('workId>>', workId)
    // if (!clientId) return;
    setIsLoading(true);
    let opdClinicHistory = await GetOpdClinicHistory(patientId, clientId)
    setIsLoading(false);
    opdClinicHistory = opdClinicHistory?.responseData;
    let diagDefault = opdClinicHistory?.diagnosis?.filter(value => value.diagType === "1");
    if (!workPlacesDashboardMas.length) {
      getWorkPlacesDashboardMasApi();
    }
    if (!doctorMas.length) {
      getDoctorMasApi();
    }
    if (!bedsDocSpecialtiesList.length) {
      getBedsDocSpecialtiesListApi();
    }
    if (!bedsDepartList.length) {
      getBedsDepartListApi();
    }

    form.setFieldsValue({
      admitOPD: workId,
      icdPreDx: diagDefault?.[0]?.icd,
      doctorAdmit: opdClinicHistory?.doctor,
      ward: opdClinicHistory?.admitWard,
      branch: specialty,
      department: departId,
      accidentFlag: accidentFlag,
      conceledFlag: conceledFlag,
      preDx: diagDefault?.[0]?.diagnosis,
      readmitFlag: readmitFlag,
      pregnantFlag: pregnantFlag,
      weight: null,
      bed: null,
      admitType: null,
      "bodyTemperatureFirst": opdClinicHistory?.bodyTemperature || null,
      "pulseFirst": opdClinicHistory?.pulse || null,
      "respiratoryFirst": opdClinicHistory?.respiratory || null,
      "bpSystolicFirst": opdClinicHistory?.bpSystolic || null,
      "bpDiastolicFirst": opdClinicHistory?.bpDiastolic || null,
      "mapFirst": opdClinicHistory?.map || null,
      "weightFirst": opdClinicHistory?.weight || null,
      "heightFirst": opdClinicHistory?.height || null,
      "bmiFirst": opdClinicHistory?.bmi || null,
      "bsaFirst": opdClinicHistory?.bsa || null,
      "o2satFirst": opdClinicHistory?.o2sat || null,
      "urgentFirst": opdClinicHistory?.urgent || null,
      "painFirst": opdClinicHistory?.pain || null,
      waistline: opdClinicHistory?.waistline || null,
      chestline: opdClinicHistory?.chestline || null,
    });

    if (opdClinicHistory?.responseData?.admitWard) {
      getAwailableBed(opdClinicHistory.responseData.admitWard);
    }

  }

  useEffect(() => {
    getAdmitTypeListApi()
  }, [])

  useEffect(() => {
    getOpdClinicsByServiceId(props?.serviceId);
  }, [props?.serviceId]);

  useLayoutEffect(() => {
    if (props.patientId) {
      setANToShow("")
      setIsLoading(true);
      setWorkPlacesOpdVisitToday([]);
      GetWorkPlaces_OPD_VisitToday(props.patientId).then(data => {
        const dataFilter = data?.filter(value => value.dataother1 !== null).sort((a, b) => +(a.dataother1 < b.dataother1) || -(a.dataother1 > b.dataother1));
        if (dataFilter.length === 0) {
          setIsLoading(false);
          form.resetFields();
          return;
        }
        if (props?.pageId === "4.1") {
          let filterTodayClinics = filter(data, "serviceId");
          setWorkPlacesOpdVisitToday(filterTodayClinics);
        } else {
          setWorkPlacesOpdVisitToday(data);
        }
        fetchOpdClinicHistory(props.patientId, dataFilter?.[0]?.dataother1, dataFilter?.[0]?.datavalue, dataFilter?.[0]?.specialty, dataFilter?.[0]?.departId, dataFilter?.[0]?.accidentFlag, dataFilter?.[0]?.conceledFlag, dataFilter?.[0]?.urgentFlag, dataFilter?.[0]?.pregnantFlag, props?.patient?.lastWeight);
      });
    }
  }, [props.patientId, props.patient]);

  useEffect(() => {
    const getForceDocAdmitAndForceDiag = async (ward) => {
      let { isSuccess, responseData } = await GetForceDocAdmitAndForceDiag(ward)
      if (isSuccess) {
        setRequired(responseData)
      } else {
        setRequired(requiredDefault)
      }
    }

    if (ward) {
      getForceDocAdmitAndForceDiag(ward)
    } else {
      setRequired(requiredDefault)
    }
  }, [ward])

  useEffect(() => {
    if (props.gender === "M") {
      form.setFieldsValue({
        pregnantFlag: null
      });
    }
  }, [props.gender]);


  return <Form
    initialValues={{ dateAdmit: dayjs() }}
    form={form}
    labelCol={{ span: 24 }}
    wrapperCol={{ span: 24 }}
    onFinish={onFinish}
    disabled={props?.isNoService === true ? true : !props?.lastAdmit?.admitId ? false : props?.lastAdmit?.deleteFlag === "Y" ? false : !props?.lastAdmit?.dischDate}
  >
    <div hidden>
      <Form.Item name="bodyTemperatureFirst"><Input /></Form.Item>
      <Form.Item name="pulseFirst"><Input /></Form.Item>
      <Form.Item name="respiratoryFirst"><Input /></Form.Item>
      <Form.Item name="bpSystolicFirst"><Input /></Form.Item>
      <Form.Item name="bpDiastolicFirst"><Input /></Form.Item>
      <Form.Item name="mapFirst"><Input /></Form.Item>
      <Form.Item name="weightFirst"><Input /></Form.Item>
      <Form.Item name="heightFirst"><Input /></Form.Item>
      <Form.Item name="bmiFirst"><Input /></Form.Item>
      <Form.Item name="bsaFirst"><Input /></Form.Item>
      <Form.Item name="o2satFirst"><Input /></Form.Item>
      <Form.Item name="urgentFirst"><Input /></Form.Item>
      <Form.Item name="painFirst"><Input /></Form.Item>

      <Form.Item name="waistline"><Input /></Form.Item>
      <Form.Item name="chestline"><Input /></Form.Item>
    </div>
    <Card
      className='mb-2'
      size='small'
      title={<GenRow align="middle">
        <Col>
          {
            props.pageId === "4.10"
              ? <LabelTopicPrimary text='AN' />
              : <LabelTopicPrimary text={`Admission AN : ${aNToShow || "-"}`} />
          }
        </Col>
        <Col>
          <Tooltip
            title={`ตัวอย่าง 9999/${dayjs().add(543, "years").format("YY")}`}>
            <Form.Item
              style={{ margin: 0 }}
              hidden={props.pageId !== "4.10"}
              name="an"
              rules={[{
                required: props.pageId === "4.10",
                message: 'กรุณากรอก AN'
              }, () => ({
                validator(all, values) {
                  if (props.pageId === "4.10") {
                    if (!values) {
                      return Promise.reject();
                    }
                    if (values && values.indexOf("/") === 0) {
                      return Promise.reject('กรุณาใส่ค่าหน้า /');
                    }
                    if (countBy(values)['/'] ? countBy(values)['/'] > 1 ? true : false : false) {
                      return Promise.reject("Format ไม่ถูกต้อง");
                    }

                    if (values?.split('/')[1] ? Number(values.split('/')[1]) > Number(dayjs().add(543, "years").format("YY")) : false) {
                      return Promise.reject("YearAn ต้องไม่มากกว่าปีปัจจุบัน");
                    }
                  }
                  return Promise.resolve();
                }
              })]}>
              <Input size='small' />
            </Form.Item>
          </Tooltip>
        </Col>
      </GenRow>
      }
    >
      <div style={{ margin: -8 }}>
        <GenRow>
          <Col span={6}>
            <GenFormItem2
              name='dateAdmit'
              label='วันที่ Admit'
              required={true}
              input={<GenDatePicker
                form={form}
                size='small'
                name='dateAdmit'
                format='DD/MM/BBBB'
              />}
            />
          </Col>
          <Col span={4}>
            <GenFormItem2
              name='timeAdmit'
              label='เวลาที่ Admit'
              required={true}
              input={<GenTimePicker size='small' format='HH:mm' />}
            />
          </Col>
          <Col span={7}>
            <GenFormItem2
              name='admitOPD'
              label='OPD Admit'
              required={true}
              input={<Select
                size='small'
                showSearch
                style={{
                  width: '100%'
                }} dropdownMatchSelectWidth={280} placeholder="" optionFilterProp="children" onClick={() => {
                  if (workPlacesOpdVisitToday.length === 0) {
                    getWorkPlacesOpdVisitApi();
                  }
                }} onSelect={(e, option) => {
                  const clinicId = option?.option?.clinicId;
                  if (clinicId) {
                    const specialty = option.option.specialty;
                    const departId = option.option.departId;
                    const accidentFlag = option.option.accidentFlag;
                    const conceledFlag = option.option.conceledFlag;
                    const urgentFlag = option.option.urgentFlag;
                    const pregnantFlag = option.option.pregnantFlag;
                    const workId = e;
                    fetchOpdClinicHistory(props.patientId, clinicId, workId, specialty, departId, accidentFlag, conceledFlag, urgentFlag, pregnantFlag);
                  }
                }} allowClear className="data-value">
                {workPlacesOpdVisitToday.length === 0 ? workPlacesOpdVisit ? workPlacesOpdVisit.map((value, index) => <Option key={index} value={value.datavalue} className="data-value" option={{
                  clinicId: value.dataother1
                }}>
                  {value.datadisplay}
                </Option>) : [] : workPlacesOpdVisitToday ? workPlacesOpdVisitToday.map((value, index) => <Option key={index} value={value.datavalue} className="data-value" option={{
                  clinicId: value.dataother1,
                  specialty: value.specialty,
                  departId: value.departId,
                  accidentFlag: value.accidentFlag,
                  conceledFlag: value.conceledFlag,
                  urgentFlag: value.urgentFlag,
                  pregnantFlag: value.pregnantFlag
                }}>
                  {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
          <Col span={7}>
            <GenFormItem2
              name='doctorAdmit'
              label='เเพทย์ Admit'
              required={required?.forceDocAdmit}
              input={<Select
                size='small'
                loading={isLoading}
                showSearch
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={280}
                placeholder=""
                optionFilterProp="children"
                onClick={() => {
                  if (!doctorMas.length) {
                    getDoctorMasApi();
                  }
                }}
                allowClear
                className="data-value"
              >
                {doctorMas ? doctorMas.map((value, index) => <Option
                  key={index}
                  value={value.datavalue}
                  className="data-value"
                >
                  {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
        </GenRow>
        <GenRow>
          <Col span={7}>
            <GenFormItem2
              name='ward'
              label='Ward'
              required={true}
              input={<Select
                size='small'
                loading={isLoading}
                showSearch
                style={{
                  width: '100%'
                }} dropdownMatchSelectWidth={280} placeholder="" optionFilterProp="children" onChange={e => workIdRef.current = e ? e : null} onClick={() => {
                  if (!workPlacesDashboardMas.length) {
                    getWorkPlacesDashboardMasApi();
                  }
                }} onClear={() => {
                  setAwailableBed([])
                  form.setFieldsValue({ department: null })
                }} onSelect={(v, o) => {
                  getAwailableBed(v)
                  if (!bedsDepartList.length) {
                    getBedsDepartListApi();
                  }
                  if (!bedsDocSpecialtiesList.length) {
                    getBedsDocSpecialtiesListApi();
                  }
                  if (v) {
                    form.setFieldsValue({ department: o?.departId })
                  }

                }} allowClear className="data-value">
                {workPlacesDashboardMas ? workPlacesDashboardMas.map((value, index) => <Option key={index} value={value.datavalue} departId={value.departId} className="data-value">
                  {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
          <Col span={8}>
            <GenFormItem2
              name='department'
              label='เเผนก'
              input={<Select
                size='small'
                loading={isLoading}
                disabled
                showSearch
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={280}
                placeholder=""
                optionFilterProp="children"
                onChange={e => departIdRef.current = e ? e : null}
                allowClear className="data-value">
                {bedsDepartList ? bedsDepartList.map((value, index) => <Option
                  key={index}
                  value={value.datavalue}
                  className="data-value"
                >
                  {value.datavalue} {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
          <Col span={8}>
            <GenFormItem2
              name='branch'
              label='สาขา'
              input={<Select
                size='small'
                loading={isLoading}
                showSearch
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={280}
                placeholder=""
                optionFilterProp="children"
                allowClear className="data-value">
                {bedsDocSpecialtiesList ? bedsDocSpecialtiesList.map((value, index) => <Option
                  key={index}
                  value={value.datavalue}
                  className="data-value">
                  {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
        </GenRow>
        <GenRow>
          <Col span={6}>
            <GenFormItem2
              name='icdPreDx'
              label='ICD10'
              input={<SelectIcdDocFav
                size='small'
                onSelect={(valueSelected, option) => {
                  form.setFieldsValue({
                    preDx: option.dx,
                    icdPreDx: option.icd,
                  });
                }}
              />}
            // input={<Select
            //   size='small'
            //   loading={isLoading}
            //   showSearch
            //   style={{ width: '100%' }}
            //   placeholder=""
            //   optionFilterProp="children"
            //   allowClear
            //   onSelect={(valueSelected, option) => {
            //     form.setFieldsValue({
            //       preDx: option.valueSelect
            //     });
            //   }}
            //   // onClick={() => {
            //   //   if (!icd10.length) {
            //   //     getDropdownICD10();
            //   //   }
            //   // }}
            //   className="data-value">
            //   {icd10 ? icd10?.map((value, index) => <Option key={index} value={value.code} valueSelect={value.name} className="data-value">
            //     {value.code} {value.name}
            //   </Option>) : []}
            // </Select>}
            />
          </Col>
          <Col span={18}>
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ward !== curr.ward}>{() => {
              return <GenFormItem2
                name='preDx'
                label='การวินิจฉัยแรกรับ'
                required={required?.forceDiag}
                input={<GenInput size='small' />}
              />
            }}</Form.Item>
          </Col>
        </GenRow>
        <GenRow>
          <Col span={12}>
            <GenFormItem2
              name='bed'
              label='เตียง'
              input={<Select
                size='small'
                loading={isLoading}
                showSearch
                style={{
                  width: '100%'
                }}
                placeholder=""
                optionFilterProp="children"
                allowClear
                className="data-value"
                filterOption={(input, option) => option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={awailableBed.map(item => {
                  return {
                    value: item.bedId,
                    label: item.name,
                    disabled: item.admitId ? true : false
                  };
                })}>
              </Select>}
            />
          </Col>
          <Col span={8}>
            <GenFormItem2
              name='admitType'
              label='ประเภท'
              required={true}
              input={<Select
                size='small'
                loading={isLoading}
                showSearch
                style={{ width: '100%' }}
                dropdownMatchSelectWidth={280}
                placeholder=""
                optionFilterProp="children"
                allowClear className="data-value">
                {admitType ? admitType.map((value, index) => <Option
                  key={index}
                  value={value.datavalue}
                  className="data-value">
                  {value.datadisplay}
                </Option>) : []}
              </Select>}
            />
          </Col>
          {/* <Col span={12}>
            <GenFormItem2
              name='weight'
              label='น้ำหนัก'
              input={<InputNumber size='small' addonAfter={props?.patient?.weightUnit ? props?.patient?.weightUnit : "กก."} />}
            />
          </Col> */}
        </GenRow>
        <GenRow>
          <Col span={5} className='text-center'>
            <Form.Item style={{ marginBottom: 4 }} name="readmitFlag" valuePropName="checked">
              <Checkbox><label className="text-danger">ฉุกเฉิน?</label></Checkbox>
            </Form.Item>
          </Col>
          <Col span={5} className='text-center'>
            <Form.Item style={{ marginBottom: 4 }} name="accidentFlag" valuePropName="checked">
              <Checkbox><label className="text-danger">อุบัติเหตุ?</label></Checkbox>
            </Form.Item>
          </Col>
          <Col span={5} className='text-center'>
            <Form.Item style={{ marginBottom: 4 }} name="conceledFlag" valuePropName="checked">
              <Checkbox onChange={e => onChangeConceledFlag(e.target.checked ? 'Y' : 'N')}><label className='gx-text-primary'>ผู้ป่วยคดี?</label></Checkbox>
            </Form.Item>
          </Col>
          <Col span={9} className='text-center'>
            <Form.Item style={{ marginBottom: 4 }} name="pregnantFlag">
              <Radio.Group disabled={props.gender === "M"}>
                <Radio value={1}>ตั้งครรภ์?</Radio>
                <Radio value={2}>ให้นมบุตร?</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </GenRow>
        <div className='text-center'>
          <Button
            type="primary"
            style={{ margin: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              form.submit()
            }}
            loading={insertAdmitLoading}
          >Admit</Button>
        </div>
      </div>
    </Card>
  </Form>
}