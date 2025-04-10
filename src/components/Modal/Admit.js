
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { find } from "lodash";
import { Modal, Form, ConfigProvider, Col, Select, Checkbox, Radio, Input } from 'antd'
import { GenFormItem2, GenDatePicker, GenTimePicker, GenInput, GenInputNumber, } from "components/Input/FormControls"
import {
    LabelTopicPrimary18,
} from "components/helper/function/GenLabel"
import GenRow from 'components/helper/function/GenRow'
import { callApis } from 'components/helper/function/CallApi';
import { notiSuccess, notiError } from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import thTH from "antd/lib/locale/th_TH";
import SelectIcdDocFav from 'components/Input/SelectIcdDocFav'
import { withResolve } from 'api/create-api';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
const { Option } = Select;
const dateFrmtForApi = "YYYY-MM-DD HH:mm:ss";
const requiredDefault = {
    forceDiag: false,
    forceDocAdmit: false
}
const size = "small"
export default function Admit({
    visible = false,
    setVisible = () => { },
    clinicDetails = null,
    rightId = null,
    clinics = [],
    onFinishAdmit = () => { },
}) {
    // console.log('visible', visible)
    // console.log('clinicDetails', clinicDetails)
    // useDispatch
    // const dispatch = useDispatch();
    // useSelector
    // const { icd10Pure } = useSelector(({ getDropdownMaster }) => getDropdownMaster);
    // Form
    const [form] = Form.useForm()
    // Watch
    const ward = Form.useWatch("ward", form)
    // const icdPreDx = Form.useWatch("icdPreDx", form)
    // const preDx = Form.useWatch("preDx", form)
    // console.log('preDx :>> ', preDx);
    // console.log('icdPreDx :>> ', icdPreDx);
    // Ref
    const departIdRef = useRef(null);
    const workIdRef = useRef(null);
    // State
    const [isLoading, setIsLoading] = useState(false)
    // const [loadingIcd10, setLoadingIcd10] = useState(false)
    const [workPlacesOpdVisitToday, setWorkPlacesOpdVisitToday] = useState([]);
    const [workPlacesOpdVisit, setWorkPlacesOpdVisit] = useState([]);
    const [workPlacesDashboardMas, setWorkPlacesDashboardMas] = useState([]);
    const [doctorMas, setDoctorMas] = useState([]);
    const [bedsDocSpecialtiesList, setBedsDocSpecialtiesList] = useState([]);
    const [bedsDepartList, setBedsDepartList] = useState([]);
    const [awailableBed, setAwailableBed] = useState([]);
    const [required, setRequired] = useState(requiredDefault)
    const [patient, setPatient] = useState(null)
    const [patientRight, setPatientRight] = useState([])
    // Funcs
    const InsAdmitRight = async (admitId) => {
        const findRight = find(patientRight, ["rightId", rightId]);
        if (!findRight) return notiError({ message: "บันทึกสิทธิ์" })
        const temp = [
            {
                "admitRightId": null,
                "patientId": findRight.patientId,
                "runHn": findRight.runHn,
                "yearHn": findRight.yearHn,
                "hn": findRight.hn,
                "admitId": admitId,
                "rightId": rightId,
                "insid": findRight.insid,
                "mainFlag": "Y",
                "hmain": findRight.hmain,
                "hsub": findRight.hsub,
                "hmainOp": findRight.hmainOp,
                "govcode": findRight.govcode,
                "ownRightPid": findRight.ownRightPid,
                "owner": findRight.owner,
                "relinscl": findRight.relinscl,
                "remark": findRight.remark,
                "userCreated": user,
                "dateCreated": formatDateForApi(dayjs()),
                "userModified": null,
                "dateModified": null,
                "limit": findRight.limit,
                opdFinance: "Y",
            },
        ]
        const res = await callApis(apis["InsListAdmitRight"], temp);
        if (res?.isSuccess) {
            // notiSuccess({ message: "Admit" })
            // InsAdmitRight(res.returnData)
            setVisible(false)
            onFinishAdmit()
            callApis(apis['InsDrugProfile'], { "admitId": admitId })
        } else notiError({ message: "บันทึกสิทธิ์" })
    }
    const InsAdmit = async (dts) => {
        // return console.log('InsAdmit', dts)
        setIsLoading(p => !p)
        const res = await callApis(apis["InsAdmit"], dts);
        setIsLoading(p => !p)
        if (res?.isSuccess) {
            notiSuccess({ message: "Admit" })
            InsAdmitRight(res.returnData)
            // setVisible(false)
            // onFinishAdmit()
        } else notiError({ message: "Admit" })
    }
    const getClinics = async (serviceId) => {
        if (clinics?.length) setWorkPlacesOpdVisitToday([])
        const res = await callApis(apis["GetOpdClinicsList"], serviceId)
        setWorkPlacesOpdVisitToday(res)
    }
    const onFinish = (dts) => {
        console.log('onFinish :>> ', dts);
        const yearAn = dayjs().format("BB");
        const req = {
            ...dts,
            patientId: clinicDetails.patientId,
            runHn: clinicDetails.runHn,
            yearHn: clinicDetails.yearHn,
            hn: clinicDetails.hn,
            register: user ? user : null,
            registerDate: formatDateForApi(dayjs()),
            rightId: rightId,
            yearAn: yearAn ? yearAn : null,
            clinicId: clinicDetails.clinicId,
            serviceId: clinicDetails.serviceId,
            admitDate: formatDateForApi(dayjs(dts.admitDate)),
            admitTime: formatDateForApi(dayjs(dts.admitTime)),
            accidentFlag: dts?.accidentFlag ? "Y" : null,
            conceledFlag: dts?.conceledFlag ? "Y" : null,
            readmitFlag: dts?.readmitFlag ? "Y" : null,
        }
        InsAdmit(req)
    }
    // Func Get
    const getWorkPlacesDashboardMasApi = async () => {
        const result = await callApis(apis["GetWorkPlaces_Dashboard_Mas"]);
        setWorkPlacesDashboardMas(result);
    };
    const getDoctorMasApi = async () => {
        const result = await callApis(apis["GetDoctorMas"]);
        setDoctorMas(result);
    };
    const getBedsDocSpecialtiesListApi = async () => {
        let obj = {
            departId: departIdRef.current,
            workId: workIdRef.current
        };
        const result = await callApis(apis["GetBedsDocSpecialtiesList"], obj);
        setBedsDocSpecialtiesList(result);
    };
    const getBedsDepartListApi = async () => {
        const result = await callApis(apis["GetBedsDepartList"]);
        setBedsDepartList(result);
    };
    const getAwailableBed = async ward => {
        const res = await callApis(apis["CheckAvaliableBed"], ward);
        setAwailableBed(res)
    }
    const getForceDocAdmitAndForceDiag = async (ward) => {
        let { isSuccess, responseData } = await callApis(apis["GetForceDocAdmitAndForceDiag"], ward)
        if (isSuccess) {
            setRequired(responseData)
        } else {
            setRequired(requiredDefault)
        }
    }
    const getWorkPlacesOpdVisit = async () => {
        const result = await callApis(apis["GetWorkPlaces_OPD_Visit"])
        setWorkPlacesOpdVisit(result);
    };
    const getPatient = async (patientId) => {
        if (!patientId) {
            setPatient(null)
            setPatientRight([])
            return
        }
        setIsLoading(p => !p)
        const result = await callApis(apis["GetPatients"], patientId)
        setIsLoading(p => !p)
        setPatient(result);
        setPatientRight(result?.patientRight || [])
    }
    // Func Helpers
    const formDefault = async (dts) => {
        // const vitalSign = await getVitalSigns(clinicDetails?.patientId)
        let diagDefault = find(dts?.diagnosis || [], ["diagType", "1"]);
        // console.log('dts?.diagnosis', dts?.diagnosis)
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
        if (dts?.admitWard) {
            getAwailableBed(dts?.admitWard)

        }
        form.setFieldsValue({
            opdAdmit: dts?.workId,
            icdPreDx: diagDefault?.icd,
            admitDoctor: dts?.doctor,
            ward: dts?.admitWard,
            specialty: dts?.specialty,
            // depart: dts?.departId,
            accidentFlag: dts?.accidentFlag,
            conceledFlag: dts?.conceledFlag,
            preDx: diagDefault?.diagnosis,
            readmitFlag: dts?.readmitFlag,
            pregnantFlag: dts?.pregnantFlag,
            // weight: patient?.lastWeight || vitalSign[0]?.weight,
            bed: null,
            "bodyTemperatureFirst": dts?.bodyTemperature || null,
            "pulseFirst": dts?.pulse || null,
            "respiratoryFirst": dts?.respiratory || null,
            "bpSystolicFirst": dts?.bpSystolic || null,
            "bpDiastolicFirst": dts?.bpDiastolic || null,
            "mapFirst": dts?.map || null,
            "weightFirst": dts?.weight || null,
            "heightFirst": dts?.height || null,
            "bmiFirst": dts?.bmi || null,
            "bsaFirst": dts?.bsa || null,
            "o2satFirst": dts?.o2sat || null,
            "urgentFirst": dts?.urgent || null,
            "painFirst": dts?.pain || null,
            waistline: dts?.waistline || null,
            chestline: dts?.chestline || null,
        });
    }
    const formatDateForApi = (date) => {
        if (!date) return null
        const temp = dayjs(date).format(dateFrmtForApi)
        return temp
    }
    // Effect
    useEffect(() => {
        getWorkPlacesOpdVisit()
        // getClinicsToday(clinicDetails?.patientId)
        // getIcd10()

        getClinics(clinicDetails?.serviceId)
        getPatient(clinicDetails?.patientId)

        formDefault(clinicDetails)
        // getHospcodes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clinicDetails, visible])
    useEffect(() => {
        if (ward) {
            getForceDocAdmitAndForceDiag(ward)
        } else {
            setRequired(requiredDefault)
        }
    }, [ward])

    //Function Components
    const PartsForm = () => {
        return <Form
            form={form}
            onFinish={onFinish}
            layout='vertical'
            initialValues={{
                admitDate: dayjs(),
                admitTime: dayjs(),
            }}
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
            <GenRow>
                <Col span={6}>
                    <GenFormItem2
                        name='admitDate'
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
                        name='admitTime'
                        label='เวลาที่ Admit'
                        required={true}
                        input={<GenTimePicker size='small' format='HH:mm' />}
                    />
                </Col>
                <Col span={7}>
                    <GenFormItem2
                        name='opdAdmit'
                        label='OPD Admit'
                        required={true}
                        input={<Select
                            size='small'
                            showSearch
                            allowClear
                            className="data-value"
                            style={{ width: '100%' }}
                            dropdownMatchSelectWidth={280}
                            placeholder=""
                            optionFilterProp="children"
                            disabled
                        >
                            {
                                workPlacesOpdVisitToday.length === 0
                                    ? workPlacesOpdVisit
                                        ? workPlacesOpdVisit.map((value, index) => <Option
                                            key={index}
                                            value={value.datavalue}
                                            className="data-value"
                                            option={{ clinicId: value.dataother1 }}
                                        >
                                            {value.datadisplay}
                                        </Option>)
                                        : []
                                    : workPlacesOpdVisitToday
                                        ? workPlacesOpdVisitToday.map((value, index) => <Option
                                            key={index}
                                            value={value.workId}
                                            className="data-value"
                                        // option={{
                                        //     clinicId: value.dataother1,
                                        //     specialty: value.specialty,
                                        //     departId: value.departId,
                                        //     accidentFlag: value.accidentFlag,
                                        //     conceledFlag: value.conceledFlag,
                                        //     urgentFlag: value.urgentFlag,
                                        //     pregnantFlag: value.pregnantFlag
                                        // }}
                                        >
                                            {value.workName}
                                        </Option>)
                                        : []
                            }
                        </Select>}
                    />
                </Col>
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
                            }}
                            dropdownMatchSelectWidth={280}
                            placeholder=""
                            optionFilterProp="children"
                            onChange={e => workIdRef.current = e ? e : null}
                            onClick={() => {
                                if (!workPlacesDashboardMas.length) {
                                    getWorkPlacesDashboardMasApi();
                                }
                            }}
                            onClear={() => setAwailableBed([])}
                            onSelect={e => getAwailableBed(e)}
                            allowClear
                            className="data-value"
                        >
                            {workPlacesDashboardMas ? workPlacesDashboardMas.map((value, index) => <Option
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
                <Col span={8}>
                    <GenFormItem2
                        name='admitDoctor'
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
                <Col span={8}>
                    <GenFormItem2
                        name='department'
                        label='เเผนก'
                        input={<Select
                            size='small'
                            loading={isLoading}
                            showSearch
                            style={{ width: '100%' }}
                            dropdownMatchSelectWidth={280}
                            placeholder=""
                            optionFilterProp="children"
                            onChange={e => departIdRef.current = e ? e : null}
                            onClick={() => {
                                if (!bedsDepartList.length) {
                                    getBedsDepartListApi();
                                }
                            }} allowClear className="data-value">
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
                        name='specialty'
                        label='สาขา'
                        input={<Select
                            size='small'
                            loading={isLoading}
                            showSearch
                            style={{ width: '100%' }}
                            dropdownMatchSelectWidth={280}
                            placeholder=""
                            optionFilterProp="children"
                            onClick={() => {
                                if (!bedsDocSpecialtiesList.length) {
                                    getBedsDocSpecialtiesListApi();
                                }
                            }} allowClear className="data-value">
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
                <Col span={12}>
                    <GenFormItem2
                        name='icdPreDx'
                        label='ICD10'
                        input={<SelectIcdDocFav
                            size='small'
                            onSelect={(valueSelected, option) => {
                                form.setFieldsValue({
                                    preDx: option.dx,
                                    icdPreDx: option.icd
                                });
                            }}
                        />}
                    // input={<GenSelect
                    //     size={size}
                    //     loading={loadingIcd10}
                    //     options={icd10Pure}
                    //     onChange={(valueSelected, option) => {
                    //         form.setFieldsValue({
                    //             preDx: option?.name
                    //         });
                    //     }}
                    // />}
                    />
                </Col>
                <Col span={12}>
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
                {/* <Col span={12}>
                    <GenFormItem2
                        name='weight'
                        label='น้ำหนัก'
                        input={<GenInputNumber
                            size={size}
                            addonAfter={patient?.weightUnit ? patient.weightUnit : "กก."}
                        />}
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
                        <Checkbox><label className='gx-text-primary'>ผู้ป่วยคดี?</label></Checkbox>
                    </Form.Item>
                </Col>
                <Col span={9} className='text-center'>
                    <Form.Item style={{ marginBottom: 4 }} name="pregnantFlag">
                        <Radio.Group disabled={clinicDetails?.gender === "M"}>
                            <Radio value={"P"}>ตั้งครรภ์?</Radio>
                            <Radio value={"N"}>ให้นมบุตร?</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </GenRow>
        </Form>
    }
    return <Modal
        title={<LabelTopicPrimary18 text='Admit' />}
        centered
        visible={visible}
        width={825}
        okText="Admit"
        cancelText="ปิด"
        onOk={() => { form.submit() }}
        onCancel={() => setVisible(false)}
        okButtonProps={{
            loading: isLoading,
        }}
    >
        <ConfigProvider locale={thTH}>
            {PartsForm()}
        </ConfigProvider>
    </Modal>
}
const apis = {
    GetOpdSosScore: {
        url: "EmergencyRoom/GetOpdSosScore",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetClinicToday: {
        url: "Masters/GetWorkPlaces_OPD_VisitToday/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    CheckAvaliableBed: {
        url: "IpdWard/CheckAvaliableBed/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetForceDocAdmitAndForceDiag: {
        url: "AdmissionCenter/GetForceDocAdmitAndForceDiag/",
        method: "GET",
        return: "data",
        sendRequest: false,
    },
    GetWorkPlaces_OPD_Visit: {
        url: "Masters/GetWorkPlaces_OPD_Visit",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetWorkPlaces_Dashboard_Mas: {
        url: "Masters/GetWorkPlaces_Dashboard_Mas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetDoctorMas: {
        url: "Masters/GetDoctorMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetBedsDepartList: {
        url: "Masters/GetBedsDepartList",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetBedsDocSpecialtiesList: {
        url: "Masters/GetBedsDocSpecialtiesList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetPatients: {
        url: "Patients/GetPatients/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    InsAdmit: {
        url: "AdmissionCenter/InsAdmit",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    InsListAdmitRight: {
        url: "Admits/InsListAdmitRight",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    GetOpdClinicsList: {
        url: "OPDClinic/GetOpdClinicsList/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    InsDrugProfile: {
        url: "AdmissionCenter/Insert-drug-profiles-oneday-by-admitid",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}
