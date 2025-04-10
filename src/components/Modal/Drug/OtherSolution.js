import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Radio, Spin, Button, Divider } from 'antd';
import { env } from 'env';
import axios from 'axios';
import moment from 'moment';
import { dosingIntervalLabel } from '../../helper/DrugCalculatOrder';
import dayjs from 'dayjs';
import { Scrollbars } from 'react-custom-scrollbars';
import { EditOutlined } from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import { nanoid } from 'nanoid';
import { find } from 'lodash';
import { useSelector } from 'react-redux';
import { drugLabelFunc } from 'components/helper/DrugCalculatOrder';

export default function OtherSolution({
    visible,
    setVisible,
    expenseId,
    prescriptionForm,
    dropdownPrescription,
    selectDosingIntervalRef,
    optionsConvertDose = [],
    handleDrugUsingLabel = () => { },
    clcDayOrDrugInjectionFlag = () => { }
}) {
    const history = useHistory();
    const { pathname } = useSelector(({ common }) => common);
    const [loading, setLoading] = useState(false);
    const [pctDrugUsingList, setPctDrugUsingList] = useState([]);
    const [originalDrugList, setOriginalDrugList] = useState([]);
    const [chkGValue, setChkGValue] = useState(null);
    const [userFromSession,] = useState(JSON.parse(sessionStorage.getItem("userMenu")));
    const [moduleId, settModuleId] = useState(null);

    const [modal, setModal] = useState(false);
    useEffect(() => {
        let childrens = []
        userFromSession.responseData.map(o => {
            childrens = [...childrens, ...o.children]
        })
        settModuleId(childrens.find(moduleId => moduleId.moduleId === "27"))
    }, [userFromSession])

    const getOpdChkExpenseUsing = async (expenseId) => {
        setLoading(true);
        let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdChkExpenseUsing?ExpenseId=${expenseId}`).then(res => {
            return res.data;
        }).catch(error => {
            return error;
        });
        if (res?.isSuccess) {
            let resData = res?.responseData;
            let timeField = ["timeM", "timeL", "timeN", "timeE", "timeB"];
            for (let i = 0; i < resData?.length; i++) {
                for (let f of timeField) {
                    resData[i][f] = resData[i][f] ? moment(resData[i][f], "DD/MM/YYYY HH:mm:ss") : null;
                    resData[i].key = nanoid()
                }
            }
            setPctDrugUsingList(resData);
        }
        setLoading(false);
    }

    const getExpenseUsingTop5 = async (expenseId) => {
        // setLoading(true);
        let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetExpenseUsingTop5?ExpenseId=${expenseId}`).then(res => {
            return res.data;
        }).catch(error => {
            return error;
        });
        if (res?.isSuccess) {

            const mapping = res?.responseData?.map(o => {
                return {
                    ...o,
                    key: nanoid()
                }
            })
            setOriginalDrugList(mapping)

        }
    }

    const changePrescription = () => {
        if (chkGValue !== null) {
            const UsingList = find(pctDrugUsingList, ["key", chkGValue])
            const DrugList = find(originalDrugList, ["key", chkGValue])
            let selectPrescription = UsingList || DrugList;
            selectDosingIntervalRef.current.setDosingInterval(selectPrescription?.dosingInterval ? selectPrescription.dosingInterval.split(',') : []);
            prescriptionForm.setFieldsValue(selectPrescription);
            setTimeout(() => {
                clcDayOrDrugInjectionFlag()
            }, 200);
            let { drugUsingList, unitList, drugTimingList, dosingTime: dosingTimeList, drugProperty: drugPropertyList, drugWarning: drugWarningList, drugAdmin: drugAdminList } = dropdownPrescription;

            const findLabel = (list, key, selectPrescriptionKey, datadisplay = "displayName") => {
                const found = list.find(val => toLowerCaseOrNull(val[key]) === toLowerCaseOrNull(selectPrescription?.[selectPrescriptionKey]));
                return found ? found[datadisplay] : null;
            };
            let drugLabel = {
                ...selectPrescription,
                drugUsing: findLabel(drugUsingList, 'value', 'drugUsing'),
                dosingUnit: findLabel(unitList, 'value', 'dosingUnit'),
                drugTiming: findLabel(drugTimingList, 'value', 'drugTiming'),
                dosingTime: findLabel(dosingTimeList, 'datavalue', 'dosingTime', "datadisplay"),
                drugProperty: findLabel(drugPropertyList, 'value', 'drugProperty'),
                drugWarning: findLabel(drugWarningList, 'value', 'drugWarning'),
                drugAdmin: findLabel(drugAdminList, 'value', 'drugAdmin')
            };

            handleDrugUsingLabel(drugLabel);
        }
        setVisible(false);
    }

    useEffect(() => {
        if (expenseId) {
            getOpdChkExpenseUsing(expenseId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenseId])

    return (
        <>
            <Modal
                title={
                    <Row gutter={[8, 8]}>
                        <Col span={12}>
                            <label className='gx-text-primary'>วิธิใช้ยา</label>
                        </Col>
                        <Col span={12} style={{
                            textAlign: "right"
                        }}>
                            <Button
                                type="primary"
                                size="small"
                                className="me-1 mb-0"
                                onClick={() => {
                                    getExpenseUsingTop5(expenseId)
                                }}
                            >วิธีใช้ยาเดิม</Button>

                            <Button className="me-1 mb-0"
                                icon={<EditOutlined style={{
                                    color: "blue"
                                }} />} size="small"
                                onClick={() => {
                                    if (moduleId) {
                                        history.push({
                                            pathname: "/drug registration/drug registration-drug-code",
                                            prevUrl: pathname,
                                            state: expenseId
                                        })
                                    } else {
                                        setModal(true)
                                    }
                                }}
                            >Edit</Button>

                        </Col>
                    </Row>
                }
                centered
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={() => changePrescription()}
                closable={false}
                width="1000px"
            >
                <Spin spinning={loading}>
                    <Scrollbars autoHeight autoHeightMin={400}>
                        <Col span={24}>
                            {pctDrugUsingList.map((val, index) => (
                                <Radio.Group style={{ width: "100%" }}
                                    onChange={(e => {
                                        setChkGValue(e.target.value)
                                    })}
                                    value={chkGValue}
                                >
                                    <MedicineLabel
                                        index={index}
                                        dropdownPrescription={dropdownPrescription}
                                        drugData={val}
                                        optionsConvertDose={optionsConvertDose}
                                    />
                                </Radio.Group>
                            ))}
                        </Col>

                        <Col span={24} style={{ marginTop: 8 }}>
                            {originalDrugList.length ?
                                <>
                                    <Col span={24}>
                                        <Divider orientation="left" plain>
                                            วิธีใช้ยาเดิม
                                        </Divider>
                                    </Col>

                                </> : null
                            }

                            {originalDrugList.map((val, index) => (
                                <Radio.Group style={{ width: "100%" }}
                                    onChange={(e => {
                                        setChkGValue(e.target.value)
                                    })}
                                    value={chkGValue}>
                                    <OriginalMedicine
                                        index={index}
                                        dropdownPrescription={dropdownPrescription}
                                        originalDrug={val}
                                        optionsConvertDose={optionsConvertDose}
                                    />
                                </Radio.Group>
                            ))}
                        </Col>

                    </Scrollbars>
                </Spin>
            </Modal>
            <Modal
                visible={modal}
                width={400}
                closable={false}
                centered={true}
                footer={<div className="text-center">
                    <Button type="primary" onClick={() => setModal(false)}>ตกลง</Button>
                </div>}
            >
                <Row gutter={[8, 8]}>
                    <Col span={24} style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <label className='gx-text-danger fs-5 fw-bold'>
                            คุณไม่มีสิทธิ์แก้ไขวิธีการใช้ยา
                        </label>
                    </Col>
                    <Col span={24}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "10px"
                        }}
                    >
                        <label className="gx-text-danger fs-5 fw-bold" >
                            กรุณาติดต่อห้องยา
                        </label>
                    </Col>
                </Row>

            </Modal>
        </>

    )
}

const toLowerCaseOrNull = (value) => {
    return value ? value.toLowerCase() : null;
}


const MedicineLabel = ({ index, dropdownPrescription, drugData, optionsConvertDose = [] }) => {
    let { drugUsingList, unitList, drugTimingList, dosingTime: dosingTimeList, drugProperty: drugPropertyList, drugWarning: drugWarningList, dosingInterval, drugAdmin: drugAdminList } = dropdownPrescription;
    const [drugLabelDsp, setDrugLabelDsp] = useState(null);
    const genDrugLabel = (dts) => {
        let dosingIntervalarr = dts?.dosingInterval
        let drugTiming = drugTimingList.find(val => val.code === dts.drugTiming);
        const temp = {
            drugUsing: drugUsingList.find(val => val.code === dts?.drugUsing)?.name,
            dose: dts?.dose,
            dosingUnit: unitList.find(val => val.code === dts?.dosingUnit)?.name,
            drugTiming: drugTiming?.name,
            dosingTime: dosingTimeList.find(val => val.datavalue === dts?.dosingTime)?.datadisplay,
            // dosingInterval: dosingInterval.find(val=>val.datavalue===select.dosingInterval)?.datadisplay,
            dosingInterval: dosingIntervalLabel(dosingIntervalarr, dosingInterval),
            alternateDay: dts?.alternateDay,
            otherDosingInterval: dts?.otherDosingInterval,
            drugProperty: drugPropertyList.find(val => val.code === dts?.drugProperty)?.name,
            drugWarning: drugWarningList.find(val => val.code === dts?.drugWarning)?.name,
            drugAdmin: drugAdminList.find(val => val.code === dts?.drugAdmin)?.name,
            docRemark: dts?.docRemark,
            docLabel1: dts?.docLabel1,
            docLabel2: dts?.docLabel2,
            docLabel3: dts?.docLabel3,
            docLabel4: dts?.docLabel4,
            // drugLabel: select?.drugLabelName,
            moriningDose: dts?.doseM,
            middayDose: dts?.doseL,
            afternoonDose: dts?.doseN,
            eveningDose: dts?.doseE,
            beforeBedDose: dts?.doseB,
        }
        const drugLabel = drugLabelFunc(temp, " ", dts?.route, dts, optionsConvertDose)
        setDrugLabelDsp(drugLabel)
    }
    useEffect(() => {
        genDrugLabel(drugData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drugData])

    return (
        <Row align='middle' gutter={[8, 8]} style={{ width: "100%", padding: 8, marginTop: index === 0 ? 0 : 8, backgroundColor: "#f2f4f6" }}>
            <Col span={1}>
                <Radio value={drugData.key} />
            </Col>
            <Col span={23}>
                <Row align='middle' gutter={[8, 8]}>
                    <Col span={2}><label className="gx-text-primary">วิธิใช้ยา :</label></Col>
                    <Col span={22}>
                        <label className="data-value">{drugLabelDsp}</label>
                        {/* <Row gutter={[8, 8]}>
                            {(drugUsing || drugData?.dose || unit) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {drugUsing ? <>{drugUsing?.displayName}&nbsp;</> : null}
                                        {drugData?.dose ? <>{drugData?.dose}&nbsp;</> : null}
                                        {unit ? <>{unit?.displayName}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugTiming) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {drugTiming ? <>{drugTiming?.displayName}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(dosingTime) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {dosingTime ? <>{dosingTime?.datadisplay}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.doseM) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        เช้า&nbsp;
                                        {drugData?.doseM ? <>{drugData?.doseM}&nbsp;เม็ด&nbsp;</> : null}
                                        {drugData?.timeM ? <>{dayjs(drugData?.timeM).format("HH:mm น.")}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.doseL) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        เที่ยง&nbsp;
                                        {drugData?.doseL ? <>{drugData?.doseL}&nbsp;เม็ด&nbsp;</> : null}
                                        {drugData?.timeL ? <>{dayjs(drugData?.timeL).format("HH:mm น.")}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.doseN) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        บ่าย&nbsp;
                                        {drugData?.doseN ? <>{drugData?.doseN}&nbsp;เม็ด&nbsp;</> : null}
                                        {drugData?.timeN ? <>{dayjs(drugData?.timeN).format("HH:mm น.")}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.doseE) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        เย็น&nbsp;
                                        {drugData?.doseE ? <>{drugData?.doseE}&nbsp;เม็ด&nbsp;</> : null}
                                        {drugData?.timeE ? <>{dayjs(drugData?.timeE).format("HH:mm น.")}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.doseB) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        ก่อนนอน&nbsp;
                                        {drugData?.doseB ? <>{drugData?.doseB}&nbsp;เม็ด&nbsp;</> : null}
                                        {drugData?.timeB ? <>{dayjs(drugData?.timeB).format("HH:mm น.")}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugProperty) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {drugProperty ? <>{drugProperty?.displayName}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugWarning) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {drugWarning ? <>{drugWarning?.displayName}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugData?.dosingInterval) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {dosingIntervalLabel(drugData?.dosingInterval?.split(","), dosingInterval)}
                                    </label>
                                </Col>
                                : null
                            }
                            {(drugAdmin) ?
                                <Col span={24}>
                                    <label className="gx-text-primary">
                                        {drugAdmin ? <>{drugAdmin?.displayName}</> : null}
                                    </label>
                                </Col>
                                : null
                            }
                        </Row> */}
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

const OriginalMedicine = ({ index, dropdownPrescription, originalDrug, optionsConvertDose = [] }) => {

    let { drugUsingList, unitList, drugTimingList, dosingTime: dosingTimeList, drugProperty: drugPropertyList, drugWarning: drugWarningList, dosingInterval, drugAdmin: drugAdminList } = dropdownPrescription;
    const [drugLabelDsp, setDrugLabelDsp] = useState(null);
    const genDrugLabel = (dts) => {
        let dosingIntervalarr = dts?.dosingInterval
        let drugTiming = drugTimingList.find(val => val.code === dts.drugTiming);
        const temp = {
            drugUsing: drugUsingList.find(val => val.code === dts?.drugUsing)?.name,
            dose: dts?.dose,
            dosingUnit: unitList.find(val => val.code === dts?.dosingUnit)?.name,
            drugTiming: drugTiming?.name,
            dosingTime: dosingTimeList.find(val => val.datavalue === dts?.dosingTime)?.datadisplay,
            // dosingInterval: dosingInterval.find(val=>val.datavalue===select.dosingInterval)?.datadisplay,
            dosingInterval: dosingIntervalLabel(dosingIntervalarr, dosingInterval),
            alternateDay: dts?.alternateDay,
            otherDosingInterval: dts?.otherDosingInterval,
            drugProperty: drugPropertyList.find(val => val.code === dts?.drugProperty)?.name,
            drugWarning: drugWarningList.find(val => val.code === dts?.drugWarning)?.name,
            drugAdmin: drugAdminList.find(val => val.code === dts?.drugAdmin)?.name,
            docRemark: dts?.docRemark,
            docLabel1: dts?.docLabel1,
            docLabel2: dts?.docLabel2,
            docLabel3: dts?.docLabel3,
            docLabel4: dts?.docLabel4,
            // drugLabel: select?.drugLabelName,
            moriningDose: dts?.doseM,
            middayDose: dts?.doseL,
            afternoonDose: dts?.doseN,
            eveningDose: dts?.doseE,
            beforeBedDose: dts?.doseB,
        }
        const drugLabel = drugLabelFunc(temp, " ", dts?.route, dts, optionsConvertDose)
        setDrugLabelDsp(drugLabel)
    }
    useEffect(() => {
        genDrugLabel(originalDrug);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originalDrug])

    return (
        <Row align='middle' gutter={[8, 8]} style={{ width: "100%", padding: 8, marginTop: index === 0 ? 0 : 8, backgroundColor: "#f2f4f6" }}>
            <Col span={1}>
                <Radio value={originalDrug.key} />
            </Col>
            <Col span={23}>
                <Row align='middle' gutter={[8, 8]}>
                    <Col span={2}><label className="gx-text-primary">วิธิใช้ยา :</label></Col>
                    <Col span={22}>
                        <label className='data-value'>{drugLabelDsp}</label>
                    </Col>

                </Row>
            </Col>
        </Row>
    )
}
