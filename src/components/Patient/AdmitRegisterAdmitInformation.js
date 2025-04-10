import { DeleteOutlined, EditOutlined, RedoOutlined, UserSwitchOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    Col,
    Form,
    Input,
    Modal,
    notification,
    Popconfirm,
    Popover,
    Radio,
    Row,
    Select,
    Spin,
    Table,
    Tooltip
} from 'antd';
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker';
import DayjsTimePicker from "components/DatePicker/DayjsTimePicker";
import Notifications from 'components/Modal/Notifications';
import dayjs from 'dayjs';
import { intersectionBy, map, orderBy } from "lodash";
import { useEffect, useRef, useState } from 'react';
import { FaCog } from "react-icons/fa";
import { notiError, notiSuccess, notificationX as notiX } from "../../components/Notification/notificationX";
import { callApiObject } from "../../components/helper/function/CallApi";
import { apiObject, CancelDischargePatient, CancelPatientAdmit, DelAdmit, GetAdmit, GetBedsDocSpecialtiesList, GetDropDownMas, GetWorkPlaces_OPD_Visit, RestoreCancelPatientAdmit, UpdAdmit, UpdAdmitReject } from '../../routes/AdmissionCenter/API/AdmitRegisterApi';
import { admitsDepartListFetch } from '../../routes/Information/API/InformationCheckClinicSchedule';
import { GetDoctorMasFetch } from '../../routes/Information/API/checkDoctorException';
import { GetWorkPlaces_Dashboard_Mas } from '../../routes/PrivilegeCenter/API/DashboardApi';

const { Option } = Select;
const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";

const userFromSession = JSON.parse(sessionStorage.getItem('user'))
const hosParam = JSON.parse(localStorage.getItem("hos_param"));

let user = userFromSession.responseData.userId
const userRoles = userFromSession.responseData.roles

const columns = [
    {
        title: <label className="gx-text-primary">AN</label>,
        // dataIndex: 'an',
        width: 100,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.an}</label>
                    : <label >{val.an}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">วันที่ Admit</label>,
        align: 'center',
        width: 120,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.admitDate}</label>
                    : <label >{val.admitDate}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">วันที่ D/C</label>,
        align: 'center',
        width: 120,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.dischDate}</label>
                    : <label >{val.dischDate}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">Ward</label>,
        width: 140,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.wardName}</label>
                    : <label >{val.wardName}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">แพทย์</label>,
        width: 140,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.admitDoctorName}</label>
                    : <label >{val.admitDoctorName}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">เตียง/ห้อง</label>,
        width: 90,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.bedName}</label>
                    : <label >{val.bedName}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">ประเภทการจำหน่าย</label>,
        width: 170,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.dischType}</label>
                    : <label >{val.dischType}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary">เเพทย์ผู้จำหน่าย</label>,
        align: 'center',
        width: 170,
        render: (val) => (
            <div>
                {(val.deleteFlag === "Y")
                    ? <label style={{ textDecoration: 'line-through', color: 'red' }}>{val.dischDoctor}</label>
                    : <label >{val.dischDoctor}</label>
                }
            </div>
        ),
    },
    {
        title: <label className="gx-text-primary"><FaCog /></label>,
        dataIndex: 'operator',
        align: "center",
        fixed: "right",
        width: 65
    },
];

const dateTrans = (date, format,) => {
    if (date) {
        return dayjs(date, format).format("DD/MM") + "" + dayjs(date, format).add(543, "year").format("/YYYY HH:mm")
    } else {
        return "-"
    }
}

export default function AdmitRegisterAdmitInformation({
    size = "middle",
    scrollY = 240,
    refresh = false,
    ...props
}) {
    const [admitForm] = Form.useForm();

    const [list, setList] = useState([]);
    const [updateAdmitLoading, setUpdateAdmitLoading] = useState(false);
    const [deleteRightLoading, setDeleteRightLoading] = useState(false);
    const [admitId, setAdmitId] = useState("");
    const [workPlacesDashboardMas, setWorkPlacesDashboardMas] = useState([]);
    const [doctorMasFetch, setDoctorMasFetch] = useState([]);
    const [admitsDepartFetch, setAdmitsDepart] = useState([]);
    const [workPlacesOpdVisit, setWorkPlacesOpdVisit] = useState([]);
    const [bedsDocSpecialtiesFetch, setBedsDocSpecialtiesFetch] = useState([]);
    const [admitReject, setAdmitReject] = useState([]);
    const [apiBaseLoading, setApiBaseLoading] = useState(true);
    const departIdRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [valuesForCancle, setValuesForCancle] = useState({})
    const [remarkForCancel, setRemarkForCancel] = useState("")
    const [cancleType, setCancleType] = useState(null)
    const [showModalConfirmCancle, setShowModalConfirmCancle] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false)
    const [processResult, setProcessResult] = useState({})
    const [notificationsTitle, setNotificationsTitle] = useState(null)
    const [hosParams, setHosParams] = useState(null)
    const [formCancleAdmit] = Form.useForm();

    const closeModal = () => {
        setShowModal(false);
    }
    const closeAdmitModal = () => {
        setShowAdmitModal(false);
    }
    const handleOtherInput = (value) => {
        setSelectedOption(value);
    };

    const success = (param) => {
        Modal.success({
            content: (param !== "delete") ? "เเก้ไขข้อมูลสำเร็จ" : "ลบข้อมูลสำเร็จ",
            okText: "ปิด",
        });
    }

    const fail = (param) => {
        Modal.error({
            content: (param !== "delete") ? "เเก้ไขข้อมูลไม่สำเร็จ" : "ลบข้อมูลไม่สำเร็จ",
            okText: "ปิด",
        });
    }

    const handleCancle = async () => {
        if (cancleType === "admit") {
            let res = await CancelPatientAdmit(valuesForCancle, remarkForCancel)
            if (res.isSuccess === true) {
                setRequestApi();
            }
            setProcessResult(res)
            setNotificationsTitle("ยกเลิก Admit")
        }
        if (cancleType === "dc") {
            let res = await CancelDischargePatient({
                requestData: {
                    admitId: valuesForCancle.admitId,
                    ward: valuesForCancle.ward,
                    patientId: props.patientId ? props.patientId : null,
                    bed: valuesForCancle.bedId,
                    moveReason: remarkForCancel ? remarkForCancel : null
                }
            })
            if (res.isSuccess === true) {
                setRequestApi();
            }
            setProcessResult(res)
            setNotificationsTitle("ดำเนินการยกเลิก D/C")
        }

        setShowNotificationsModal(true)
    }


    const closeModalConfirmCancle = (confirmed) => {
        if (confirmed === "YES") {
            setDeleteRightLoading(true)
            handleCancle()
            setDeleteRightLoading(false)

        }
        setShowModalConfirmCancle(false)
        setCancleType(null)
        setValuesForCancle({})
        setRemarkForCancel("")
    }

    const getHosParams = async (hospCode) => {
        if (!hospCode) return setHosParams(null)
        const req = { hospCode, }
        const res = await callApiObject(apiObject, "FetchAllHosParam", req)
        setHosParams(res)
    }

    const deleteMasterData = async (param) => {
        await setDeleteRightLoading(true);

        const result = await DelAdmit(param);
        if (result.isSuccess === true) {
            setRequestApi();
            success("delete");
        } else {
            fail('delete');
        }

        await setDeleteRightLoading(false);
    }

    const onAdmitFinish = async (values) => {
        setUpdateAdmitLoading(true);
        const dateMix = `${(typeof values.admitDate === "string" ? values.admitDate : values.admitDate.format('DD/MM/YYYY'))} ${values.admitTime.format('HH:mm:ss')}`
        let request = {
            admitId: values.admitId,
            admitDate: values.admitDate ? dayjs(dateMix, "DD/MM/YYYY HH:mm:ss").format(dateTimeFormat) : null,
            admitTime: values.admitDate ? dayjs(dateMix, "DD/MM/YYYY HH:mm:ss").format(dateTimeFormat) : null,
            patientId: props.patientId ? props.patientId : null,
            runHn: props.list.runHn ? props.list.runHn : null,
            yearHn: props.list.yearHn ? props.list.yearHn : null,
            hn: props.list.hn ? props.list.hn : null,
            depart: values.depart ? values.depart : null,
            ward: values.ward ? values.ward : null,
            userModified: user,
            dateModified: null,
            deleteFlag: null,
            userDelete: null,
            dateDelete: null,
            deleteRemark: null,
            rightId: values.rightId ? values.rightId : null,
            admitDoctor: values.admitDoctor ? values.admitDoctor : null,
            runAn: values.runAn ? values.runAn : null,
            yearAn: values.yearAn ? values.yearAn : null,
            an: values.an ? values.an : null,
            opdAdmit: values.opdAdmit ? values.opdAdmit : null,
            specialty: values.specialty ? values.specialty : null,
            feverDoctor: values.feverDoctor ? values.feverDoctor : null,
            readmitFlag: values.readmitFlag === true ? "Y" : "N",
            pregnantFlag: values.pregnantFlag === 1 ? "P" : values.pregnantFlag === 2 ? "N" : null,
            conceledFlag: values.conceledFlag === true ? "Y" : "N",
            accidentFlag: values.accidentFlag === true ? "Y" : "N",
            preDx: values.preDx ? values.preDx : null,
            serviceId: props?.serviceId ? props?.serviceId : null
        }
        console.log(request);
        return
        const result = await UpdAdmit(request);
        if (result.isSuccess === true) {
            setRequestApi();
            success("update");
        } else {
            fail('update');
        }

        const AdmitList = await GetAdmit(props.patientId);
        let findData = AdmitList.find((admit) => admit.admitId === admitId)
        props.setRowData([findData])
        setUpdateAdmitLoading(false);
        setShowModal(false);
    }

    const onFinish = async (values) => {
        const req = await UpdAdmitReject({
            admitId: values.admitId,
            admitReject: values.admitReject,
            rejectOther: values.rejectOther,
        })

        if (req.isSuccess) {
            notiSuccess({
                message: "บันทึก"
            })
            closeAdmitModal();
        } else {
            notiError({
                message: "บันทึก"
            })
        }

    };

    function dateTimeIn24hrs(date, format) {
        const dateTimeAdmit = dayjs(date, format).valueOf()
        const dateTimeNow = dayjs().valueOf()
        const msBetweenDates = Math.abs(dateTimeAdmit - dateTimeNow)
        const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

        return hoursBetweenDates < 24 ? true : false
    }

    const alert = () => {
        const cancelAble = hosParams?.cancelAdmits || null
        const cancelAbleRoles = map(hosParams?.cancelAdmitRoles || [], o => { return { roleId: o.role } })
        let alert = { isAlert: false, message: "" }
        if (!cancelAble) {
            alert = { isAlert: true, message: "ระบบไม่อนุญาติให้ยกเลิก Admit !" }
            return alert
        }
        if (cancelAbleRoles?.length) {
            const intersections = intersectionBy([cancelAbleRoles, userRoles, 'roleId'])
            if (!intersections.length) {
                alert = { isAlert: true, message: "Roles ของท่านไม่ได้รับสิทธิ์ให้ยกเลิก Admit !" }
                return alert
            }
        }
        return alert
    }

    const setRequestApi = async () => {
        let tempList = [];
        const result = await GetAdmit(props.patientId);
        let order = orderBy(result, o => +o.admitId, 'desc')
        order?.map((val, index) => {
            const In24hrs = dateTimeIn24hrs(val.registerDate, "MM/DD/YYYY HH:mm:ss")
            const checkRecovery = (index === 0 && val.deleteFlag === "Y" && In24hrs)
            let registerDateDisp = val?.registerDate ? dateTrans(val.registerDate, "MM/DD/YYYY hh:mm") : null
            let dateModifieldDisp = val?.dateModified ? dateTrans(val.registerDate, "MM/DD/YYYY hh:mm") : null
            tempList.push({
                key: index,
                an: val.an,
                admitId: val.admitId,
                admitDate: val.admitDate ? dateTrans(val.admitDate, "MM/DD/YYYY hh:mm") : null,
                dischDate: val.dischDate ? dateTrans(val.dischDate, "MM/DD/YYYY hh:mm") : null,
                wardName: val.wardName,
                admitDoctorName: val.admitDoctorName,
                bedName: val.bedName,
                dischType: val.dischType,
                dischDoctor: val.dischDoctor,
                feverDoctor: val.feverDoctor,
                conceledFlag: val.conceledFlag,
                deleteFlag: val.deleteFlag,
                pregnantFlag: val.pregnantFlag,
                operator:
                    <Popover
                        trigger="click"
                        content={
                            <Row className="text-nowrap" style={{ width: 200 }}>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center", marginBottom: 5 }} span={6}>
                                    <Popconfirm
                                        title="กู้คืน Admit?"
                                        okText="ใช่"
                                        cancelText="ไม่"
                                        onConfirm={() => recoveryAdmit(val.admitId)}
                                        disabled={!checkRecovery}
                                    >
                                        <Button
                                            style={{ margin: 0 }}
                                            icon={<RedoOutlined className={checkRecovery ? "text-info" : "text-secondary"} />}
                                            size="small"
                                            disabled={!checkRecovery}
                                        />
                                    </Popconfirm>
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center", marginBottom: 5 }} span={6}>
                                    <Tooltip title={
                                        <>
                                            <label className="data-value mb-1">ผู้บันทึก</label>
                                            <label className="data-value ms-1">{val?.registerName || "-"}</label>
                                            <label className="data-value ms-2 mb-1">{registerDateDisp || "-"}</label>
                                            <br />
                                            <label className="data-value mb-1">ผู้แก้ไข</label>
                                            <label className="data-value ms-1">{val?.userModifiedName || "-"}</label>
                                            <label className="data-value ms-2 mb-1">{dateModifieldDisp || "-"}</label>
                                        </>
                                    }>
                                        <Button
                                            style={{ margin: 0 }}
                                            icon={<UserSwitchOutlined className="gx-text-primary" />}
                                            size="small"
                                        />
                                    </Tooltip>
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center", marginBottom: 5 }} span={6}>
                                    <Button
                                        style={{ margin: 0 }}
                                        icon={<EditOutlined className={val.editButton !== "Y" ? "text-secondary" : "text-primary"} />}
                                        size="small"
                                        onClick={() => {
                                            const admitD = dayjs(val.admitDate).format('x');
                                            const dischD = dayjs(val.dischDate).format('x');
                                            admitForm.setFieldsValue({
                                                admitId: val.admitId,
                                                admitDate: val.admitDate ? dayjs(Number(admitD)) : undefined,
                                                admitTime: val.admitDate ? dayjs(Number(admitD)) : undefined,
                                                dischDate: val.dischDate ? dayjs(Number(dischD)) : undefined,
                                                ward: val.ward,
                                                bed: val.bed,
                                                dischType: val.dischType,
                                                dischDoctor: val.dischDoctor,
                                                feverDoctor: val.feverDoctor,
                                                depart: val.depart,
                                                rightId: val.rightId,
                                                deleteFlag: val.deleteFlag,
                                                conceledFlag: val.conceledFlag ? (val.conceledFlag === 'Y' ? true : false) : false,
                                                pregnantFlag: val.pregnantFlag && props.gender === "F" ? (val.pregnantFlag === 'P' ? 1 : 2) : false,
                                                readmitFlag: val.readmitFlag ? (val.readmitFlag === 'Y' ? true : false) : false,
                                                accidentFlag: val.accidentFlag ? (val.accidentFlag === 'Y' ? true : false) : false,
                                                admitDoctor: val.admitDoctor,
                                                runAn: val.runAn,
                                                yearAn: val.yearAn,
                                                an: val.an,
                                                opdAdmit: val.opdAdmit,
                                                specialty: val.specialty,
                                                preDx: val.preDx,
                                                clinicId: val.clinicId || null,
                                                admitReject: val.admitReject,
                                                rejectOther: val.rejectOther,
                                            });
                                            setShowModal(true);
                                        }}
                                        disabled={val.editButton !== "Y"}
                                    />
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center", marginBottom: 5 }} span={6}>
                                    <Popconfirm
                                        title="ลบรายการ ？"
                                        okText="Yes"
                                        onConfirm={() => {
                                            deleteMasterData(val.admitId)
                                        }}
                                        cancelText="No"
                                        disabled={val.cancelButton === "Y" ? false : true}
                                    >
                                        <Button
                                            style={{ margin: 0 }}
                                            icon={<DeleteOutlined className={val.cancelButton === "Y" ? "text-danger" : "text-secondary"} />}
                                            size="small"
                                            disabled={val.cancelButton === "Y" ? false : true}
                                        />
                                    </Popconfirm>
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "flex-end" }} span={12}>
                                    {!(index === 0
                                        ? val.deleteFlag === "Y" || val.havePayment === "Y"
                                            ? false
                                            : true
                                        : false)
                                        ? <button className="btn-Cancel-notAllowed me-2">
                                            <label className="btn-Cancel-label-notAllowed">ยกเลิก Admit</label>
                                        </button>
                                        : <button className="btn-Cancel me-2"
                                            onClick={() => {
                                                const { isAlert, message } = alert()
                                                if (isAlert) return notiX(false, message, " ")
                                                setShowModalConfirmCancle(true)
                                                setValuesForCancle(val)
                                                setCancleType("admit")
                                            }}
                                        >
                                            <label className="btn-Cancel-label">ยกเลิก Admit</label>
                                        </button>}
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center" }} span={12}>
                                    {index === 0 && val.dischStatus !== null && val.deleteFlag === null
                                        ? <button className="btn-Cancel"
                                            onClick={() => {
                                                setShowModalConfirmCancle(true)
                                                setValuesForCancle(val)
                                                setCancleType("dc")
                                            }}
                                        >
                                            <label className="btn-Cancel-label">ยกเลิก D/C</label>
                                        </button>
                                        : <button className="btn-Cancel-notAllowed"><label className="btn-Cancel-label-notAllowed">ยกเลิก D/C</label></button>
                                    }
                                </Col>
                                <Col style={{ padding: 0, display: "flex", justifyContent: "center", paddingTop: "3px" }} span={24}>
                                    <button
                                        className="btn-Cancel"
                                        onClick={() => {
                                            setShowAdmitModal(true)
                                            formCancleAdmit.setFieldsValue({ admitId: val.admitId })
                                        }}
                                    >
                                        <label className="btn-Cancel-label">ผู้ป่วยไม่ยินยอม Admit</label>
                                    </button>

                                </Col>
                            </Row>

                        }
                        zIndex="10"
                    >
                        <Button
                            style={{ margin: 0 }}
                            icon={<FaCog />}
                            size="small"
                        />

                    </Popover>

            });
        });
        setList(tempList);

        //ใส่ค่าเริ่มต้นของ radio ประวัติ admit
        if (!props.admitId) {
            console.log(tempList[0])
            props.setAdmitId(tempList?.length > 0 && tempList[0]?.admitId)
            props?.onChangeConceledFlag && props.onChangeConceledFlag(tempList[0]?.conceledFlag)
        }
        else {
            const selectAdmit = tempList?.find((item) => item?.admitId === props.admitId)
            console.log(selectAdmit)
            props?.onChangeConceledFlag && props.onChangeConceledFlag(selectAdmit?.conceledFlag)
        }
        props?.lastAdmit && props?.lastAdmit(tempList[0])
        if (props?.setStatus) {
            props?.setStatus(tempList[0] || null)
        }

    }

    const recoveryAdmit = async (admitId) => {
        const result = await RestoreCancelPatientAdmit(admitId, user);
        if (result.isSuccess) {
            notification['success']({
                message: "กู้คืน Admit สำเร็จ"
            })
            setRequestApi();
        }
    }

    const getRequestBaseApi = async () => {
        await setApiBaseLoading(true);

        let result = await GetWorkPlaces_Dashboard_Mas();
        if (result.isSuccess) {
            setWorkPlacesDashboardMas(result.responseData);
        }

        result = await admitsDepartListFetch({
            "mode": null,
            "user": null,
            "ip": null,
            "lang": null,
            "branch_id": null,
            "requestData": {
                "departId": null,
                "workId": null
            },
            "barcode": null
        });
        setAdmitsDepart(result);

        result = await GetDoctorMasFetch();
        setDoctorMasFetch(result);

        result = await GetWorkPlaces_OPD_Visit();
        setWorkPlacesOpdVisit(result);

        await setApiBaseLoading(false);
    }

    const getBedsDocSpecialtiesListApi = async () => {
        let result = await GetBedsDocSpecialtiesList({
            departId: departIdRef.current,
            workId: null,
        });
        setBedsDocSpecialtiesFetch(result);
    }

    const GetDropDownMasAdmitReject = async () => {
        let result = await GetDropDownMas({
            table: "TB_ADMITS",
            field: "AdmitReject"
        });
        setAdmitReject(result);
    }

    useEffect(() => {
        getRequestBaseApi();
    }, []);

    useEffect(() => {
        if (props.patientId !== null) {
            setRequestApi();
            getHosParams(hosParam?.hospCode)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.patientId, refresh]);

    const admitDate = Form.useWatch("admitDate", admitForm)

    return (
        <Spin spinning={deleteRightLoading}>
            <Card
                className='mb-2'
                size={size}
                title={<Row gutter={[8, 8]} style={{ marginTop: -4, marginBottom: -4 }} align="middle">
                    <Col span={12}>
                        <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>ข้อมูลการ Admit ({list?.length})</label>
                    </Col>
                </Row>}
                // bordered={false}
                style={{ width: '100%' }}
            >
                <div style={{ margin: -8 }}>
                    <Table
                        size={size}
                        scroll={{ x: 1200, y: scrollY }}
                        rowClassName='data-value'
                        rowKey="admitId"
                        rowSelection={{
                            type: "radio",
                            onChange: (rowKey, rowData) => {
                                console.log(rowKey);
                                console.log(rowData);
                                props.setRowData(rowData)
                                props.setAn(rowData[0].an)
                                props.setAdmitId(rowData[0].admitId)
                                setAdmitId(rowData[0].admitId)
                            },
                            selectedRowKeys: [props?.admitId]
                        }}
                        columns={columns}
                        dataSource={list}
                        pagination={false}
                    >
                    </Table>
                </div>

            </Card>
            <Modal
                title={<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>เหตุผลที่ไม่ยินยอม Admit</label>}
                visible={showAdmitModal}
                confirmLoading={updateAdmitLoading}
                onOk={() => formCancleAdmit.submit()}
                onCancel={closeAdmitModal}
                okText={<label style={{ width: 50, cursor: 'pointer' }}>บันทึก</label>}
                cancelText={<label style={{ width: 50, cursor: 'pointer' }}>ปิด</label>}

            >
                <Form form={formCancleAdmit} onFinish={onFinish}  >
                    <Form.Item
                        hidden
                        name="admitId"
                    >
                        <Input />
                    </Form.Item>
                    <Row gutter={[4, 4]}>
                        <Col span={24}>
                            <Form.Item
                                name="admitReject"
                                label={<label className="gx-text-primary " >ระบุ</label>}
                                style={{ display: 'flex', justifyContent: 'center' }}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    onChange={handleOtherInput}
                                    filterOption={(input, option) =>
                                        option?.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
                                    }
                                    style={{ width: '100%' }}
                                    onClick={() => GetDropDownMasAdmitReject()}
                                >
                                    {admitReject?.map((val, index) =>
                                        <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                    )}
                                </Select>

                            </Form.Item>

                        </Col>
                        <Col span={24} >
                            <Form.Item
                                name="rejectOther"
                                style={{ paddingLeft: "7%" }}
                            >
                                <Input
                                    style={{ width: '100%' }}
                                    disabled={selectedOption !== '3'}
                                    placeholder={selectedOption === '3' ? "กรุณาระบุ" : ""}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                zIndex="1001"
                title={<label className="gx-text-primary-bold">เเก้ไขข้อมูลการ Admit</label>}
                centered
                visible={showModal}
                confirmLoading={updateAdmitLoading}
                onCancel={closeModal}
                width={900}
                onOk={() => admitForm.submit()}
                okText={<label style={{ width: 50, cursor: 'pointer' }}>บันทึก</label>}
                cancelText={<label style={{ width: 50, cursor: 'pointer' }}>ปิด</label>}
            >
                <Form
                    layout="vertical"
                    form={admitForm}
                    onFinish={onAdmitFinish}>
                    <Spin spinning={apiBaseLoading}>
                        <div className="d-flex flex-row" style={{ marginBottom: "-20px" }}>
                            <div hidden>
                                <Form.Item name="clinicId">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="an">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="runAn">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="yearAn">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="rightId">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="admitId">
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="m-1" style={{ width: "35%" }}>
                                <div className='d-flex flex-row'>
                                    <div style={{ width: "50%" }}>
                                        <Form.Item
                                            name="admitDate"
                                            style={{ marginBottom: 0 }}
                                            label={<label className="gx-text-primary" style={{ marginTop: '0.5rem' }}>วันที่ Admit</label>}>
                                            <DayjsDatePicker
                                                name="admitDate"
                                                form={admitForm}
                                                defaultDate={admitDate}
                                                placeholder={"เลือกวันที่"}
                                                // onChangeDate={onChangeDate}
                                                clearable={false}
                                                height="36px"
                                                maxDate={dayjs()}
                                            />
                                        </Form.Item>

                                    </div>
                                    <div style={{ width: '50%' }}>
                                        <Form.Item
                                            name="admitTime"
                                            label={
                                                <strong><label className="gx-text-primary" style={{ paddingLeft: 0, marginTop: '0.5rem' }}>เวลาที่ Admit</label></strong>
                                            }
                                            rules={[{ required: true, message: 'กรุณาเลือกเวลา Admit' }]}
                                        >
                                            <DayjsTimePicker
                                                format="HH:mm"
                                                style={{ width: '100%' }}
                                                placeholder="เวลาที่ Admit"
                                            />
                                        </Form.Item>
                                    </div>
                                </div>

                                <Form.Item name="ward" label={<label className="gx-text-primary">Ward</label>}>
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        optionFilterProp="children"
                                    >
                                        {workPlacesDashboardMas.map((val, index) =>
                                            <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                        )}
                                    </Select>
                                    {/* <Input /> */}
                                </Form.Item>
                            </div>
                            <div className="p-2 m-1" style={{ width: "25%" }}>
                                <Form.Item name="opdAdmit" label={<label className="gx-text-primary">OPD Admit</label>}>
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        optionFilterProp="children"
                                        onChange={(v) => {
                                            console.log(v)
                                        }}
                                    >
                                        {workPlacesOpdVisit.map((val, index) =>
                                            <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                        )}
                                    </Select>
                                    {/* <Input /> */}
                                </Form.Item>
                                <Form.Item name="depart" label={<label className="gx-text-primary">เเผนก</label>}>
                                    <Select
                                        showSearch
                                        disabled
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        optionFilterProp="children"
                                        onChange={(e) => departIdRef.current = e ? e : null}
                                    >
                                        {admitsDepartFetch.map((val, index) =>
                                            <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                        )}
                                    </Select>
                                    {/* <Input /> */}
                                </Form.Item>
                            </div>
                            <div className="p-2 m-1" style={{ width: "40%" }}>
                                <Form.Item name="admitDoctor" label={<label className="gx-text-primary">เเพทย์ Admit</label>}>
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        optionFilterProp="children"
                                    >
                                        {doctorMasFetch.map((val, index) =>
                                            <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                        )}
                                    </Select>
                                    {/* <Input /> */}
                                </Form.Item>
                                <div className="d-flex flex-row">
                                    <div className="me-3" style={{ width: "50%" }}>
                                        <Form.Item name="specialty" label={<label className="gx-text-primary">สายงาน</label>}>
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                allowClear={true}
                                                optionFilterProp="children"
                                                onClick={() => getBedsDocSpecialtiesListApi()}
                                            >
                                                {bedsDocSpecialtiesFetch?.map((val, index) =>
                                                    <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </div>
                                    <div style={{ width: "50%" }}>
                                        <Form.Item name="feverDoctor" label={<label className="gx-text-primary">แพทย์เจ้าของไข้</label>}>
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                allowClear={true}
                                                optionFilterProp="children"
                                            >
                                                {doctorMasFetch.map((val, index) =>
                                                    <Option value={val.datavalue} key={index}>{val.datadisplay}</Option>
                                                )}
                                            </Select>
                                            {/* <Input /> */}
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-row" style={{ marginBottom: "-20px" }}>
                            <div className="p-2 m-1" style={{ width: "100%" }}>
                                <Form.Item name="preDx" label={<label className="gx-text-primary">การวินิจฉัยเบื้องต้น (Pre-Diagnosis)</label>}>
                                    {/* <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        allowClear={true}
                                        optionFilterProp="children"
                                    >
                                    </Select> */}
                                    <Input />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="d-flex flex-row" style={{ marginBottom: "-20px" }}>
                            <Form.Item name="readmitFlag" valuePropName="checked">
                                <Checkbox><p style={{ color: 'red', fontWeight: 'bold' }}>ฉุกเฉิน?</p></Checkbox>
                            </Form.Item>
                            <Form.Item name="accidentFlag" valuePropName="checked">
                                <Checkbox><p style={{ color: 'red', fontWeight: 'bold' }}>อุบัติเหตุ?</p></Checkbox>
                            </Form.Item>
                            <Form.Item name="conceledFlag" valuePropName="checked">
                                <Checkbox><p style={{ color: 'green', fontWeight: 'bold' }}>ผู้ป่วยคดี?</p></Checkbox>
                            </Form.Item>
                            <Form.Item name="pregnantFlag">
                                <Radio.Group>
                                    <Radio value={1} disabled={props.gender === "M"}>ตั้งครรภ์?</Radio>
                                    <Radio value={2} disabled={props.gender === "M"}>ให้นมบุตร?</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    </Spin>
                </Form>
            </Modal>
            <Modal name="confirmCancle"
                title={
                    <label className="gx-text-primary fw-bold fs-5">
                        กรุณาเหตุผลการ {cancleType === "admit" && "Admit"}{cancleType === "dc" && "D/C"} !
                    </label>}
                centered
                visible={showModalConfirmCancle}
                onCancel={closeModalConfirmCancle}
                width={500}
                footer={
                    <div className="text-center">
                        <Button type="secondary" disabled={deleteRightLoading} onClick={closeModalConfirmCancle} >ปิด</Button>
                        <Button type="primary" disabled={deleteRightLoading} onClick={() => closeModalConfirmCancle("YES")}>ตกลง</Button>
                    </div>
                }
            >
                <Spin spinning={deleteRightLoading}>
                    <Input.TextArea
                        autoSize
                        value={remarkForCancel}
                        onChange={(e) => setRemarkForCancel(e.target.value)}
                    />
                </Spin>
            </Modal>
            <Notifications
                setModal={() => {
                    setShowNotificationsModal(false)
                    setProcessResult({})
                    setNotificationsTitle(null)
                }}
                isVisible={showNotificationsModal}
                response={processResult}
                title={notificationsTitle}
                type="result"
            />
        </Spin>
    )
}

