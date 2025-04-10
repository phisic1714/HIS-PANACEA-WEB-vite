import { Col, Form, Row } from 'antd';
import GenFormItem from 'components/helper/function/GenFormItem';
import { notificationX } from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import { map } from "lodash";
import { useEffect } from 'react';
import { GetDropDownMas, InsVitalSignsFetch } from 'routes/OpdClinic/API/ScreeningApi';
import { useDispatch, useSelector } from "react-redux";
import { dspDropdowsVsFoot } from "appRedux/actions";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function VsFoots({
    reload = () => { return false },
    close = () => { console.log('VS') },
    formProp = null,
    prevVitalSign = null,
    show = false,
    patientId,
    clinicId,
    workId,
    serviceId,
    runHn,
    hn,
    yearHn,
    opdClinicDetails = null,
}) {
    const dispatch = useDispatch();
    const optionsVs_Foot = useSelector(({ getDropdowns }) => getDropdowns.optionsVs_Foot);

    const [form] = Form.useForm()

    const onFinish = async (values) => {
        let objVitalSigns = {
            serviceId: serviceId || null,
            workId: workId || null,
            clinicId: clinicId || null,
            patientId: patientId || null,
            runHn: runHn || null,
            yearHn: yearHn || null,
            hn: hn || null,
            respiratory: prevVitalSign?.respiratory ? String(prevVitalSign?.respiratory) : null,
            serviceType: null,
            employerName: values.employerName || null,
            vitalsignId: null,
            admitId: null,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            userModified: null,
            dateModified: null,
            // weight: prevVitalSign?.weight ? String(prevVitalSign?.weight) : null,
            // weightGm: values.weightGm || null,
            // height: prevVitalSign?.height ? String(prevVitalSign?.height) : null,
            // bmi: prevVitalSign.bmi ? String(prevVitalSign.bmi) : null,
            // chestlineOut: values.chestlineOut || null,
            // bodyTemperature: prevVitalSign?.bodyTemperature ? String(prevVitalSign.bodyTemperature) : null,
            // pulse: prevVitalSign?.pulse ? String(prevVitalSign?.pulse) : null,
            rVa: values.rVa || null,
            rSph: values.rSph || null,
            rTn: values.rTn || null,
            rCyl: values.rCyl || null,
            rAx: values.rAx || null,
            rKmax: values.rKmax || null,
            rKmin: values.rKmin || null,
            rKax: values.rKax || null,
            grVa: values.grVa || null,
            grSph: values.grSph || null,
            grCyl: values.grCyl || null,
            grAx: values.grAx || null,
            grAdd: values.grAdd || null,
            lVa: values.lVa || null,
            lTn: values.lTn || null,
            lSph: values.lSph || null,
            lCyl: values.lCyl || null,
            lAx: values.lAx || null,
            lKmax: values.lKmax || null,
            lKmin: values.lKmin || null,
            lKax: values.lKax || null,
            glVa: values.glVa || null,
            glSph: values.glSph || null,
            glCyl: values.glCyl || null,
            glAx: values.glAx || null,
            glAdd: values.glAdd || null,
            urine: values.urine || null,
            urineCc: values.urineCc || null,
            stool: values.stool || null,
            oral: values.oral || null,
            tf: values.tf || null,
            iv: values.iv || null,
            vomit: values.vomit || null,
            drain: values.drain || null,
            pain: values?.pain ? `${values.pain}` : null,
            note: values.note || null,
            doneDate: values.doneDate || null,
            doneFlag: values.doneFlag || null,
            errorFlag: values.errorFlag || null,
            errorLog: values.errorLog || null,
            sedation: values.sedation || null,
            q2: values.q2 || null,
            mpArmRt: values.mpArmRt || null,
            mpArmLt: values.mpArmLt || null,
            mpLegRt: values.mpLegRt || null,
            mpLegLt: values.mpLegLt || null,
            bpType: values.bpType || null,
            palseType: values.palseType || null,
            o2satType: values.o2satType || null,
            painType: values.painType || null,
            oae: values.oae || null,
            abr: values.abr || null,
            vaCphLt: values.vaCphLt || null,
            vaCphRt: values.vaCphRt || null,
            smwt: values.smwt || null,
            rpe: values.rpe || null,
            orRecId: values.orRecId || null,
            cvpCmh2o: values.cvpCmh2o || null,
            datetime: values.datetime || null,
            menses: values.menses || null,
            barden: values.barden || null,
            bpDiastolic: values.bpDiastolic ? String(values.bpDiastolic) : null,
            bpSystolic: values.bpSystolic ? String(values.bpSystolic) : null,
            bpdArmLt: values.bpdArmLt || null,
            bpdArmRt: values.bpdArmRt || null,
            bpdLegLt: values.bpdLegLt || null,
            bpdLegRt: values.bpdLegRt || null,
            bpsArmLt: values.bpsArmLt || null,
            bpsArmRt: values.bpsArmRt || null,
            bpsLegLt: values.bpsLegLt || null,
            bpsLegRt: values.bpsLegRt || null,
            chestlineIn: values.chestlineIn || null,
            childFeeding: values.childFeeding || null,
            cvd: values.cvd || null,
            dtx: values.dtx || null,
            ecog: values.ecog || null,
            fptype: values.fptype || null,
            gcs: values.gcs || null,
            gcsE: values.gcsE || null,
            gcsM: values.gcsM || null,
            gcsV: values.gcsV || null,
            hct: values.hct || null,
            headCircumference: values.headCircumference || null,
            lastChildAge: values.lastChildAge || null,
            lmp: values.lmp ? dayjs(values.lmp).format("YYYY-MM-DD HH:mm:ss") : null,
            map: values.map || null,
            menopause: values.menopause || null,
            menopauseAge: values.menopauseAge ? String(values.menopauseAge) : null,
            o2sat: values?.o2sat ? String(values.o2sat) : null,
            o2satArmLt: values.o2satArmLt || null,
            o2satArmRt: values.o2satArmRt || null,
            o2satLegLt: values.o2satLegLt || null,
            o2satLegRt: values.o2satLegRt || null,
            palseFootLt: values.palseFootLt || null,
            palseFootRt: values.palseFootRt || null,
            para: values.para || null,
            pps: values.pps || null,
            pupilLt: values.pupilLt ? String(values.pupilLt) : null,
            pupilLtRe: values.pupilLtRe || null,
            pupilRt: values.pupilRt || null,
            pupilRtRe: values.pupilRtRe || null,
            q8: values.q8 || null,
            q9: values.q9 || null,
            vaccine: values.vaccine || null,
            waistline: values.waistline || null,
            wbc: values.wbc || null,
            //v/sตา
            checkEyes: values.checkEyes || null,
            checkRightEye: values.checkRightEye || null,
            checkLeftEye: values.checkLeftEye || null,
            examineRightRetina: values.examineRightRetina || null,
            examineLeftRetina: values.examineLeftRetina || null,
            rightVisualAcuityResults: values.rightVisualAcuityResults || null,
            rightSidePHResults: values.rightSidePHResults || null,
            leftVisualAcuityResults: values.leftVisualAcuityResults || null,
            leftSidePHResults: values.leftSidePHResults || null,
            rightIntraOcularPressure: values.rightIntraOcularPressure || null,
            leftIntraOcularPressure: values.leftIntraOcularPressure || null,
            macularEdema: values.macularEdema || null,
            laserTreatment: values.laserTreatment || null,
            cataract: values.cataract || null,
            hadSurgery: values.hadSurgery || null,
            diseaseLeftEye: values.diseaseLeftEye || null,
            diseaseRightEye: values.diseaseRightEye || null,
            blindPatient: values.blindPatient || null,
            treatmentGiven: values.treatmentGiven || null,
            otherNotes: values.otherNotes || null,
            //v/sเท้า
            checkLeftFoot: values.checkLeftFoot || null,
            checkRightFoot: values.checkRightFoot || null,
            footWound: values.footWound || null,
            historyOfFootUlcers: values.historyOfFootUlcers || null,
            historyOfFinger: values.historyOfFinger || null,
            sensationInFeet: values.sensationInFeet || null,
            shoeCharacteristics: values.shoeCharacteristics || null,
            checkToenails: values.checkToenails || null,
            wartsDetected: values.wartsDetected || null,
            deformedFeet: values.deformedFeet || null,
            feetHair: values.feetHair || null,
            warmFeet: values.warmFeet || null,
            fungalInfectionOfFeet: values.fungalInfectionOfFeet || null,
            checkSkinColor: values.checkSkinColor || null,
            evaluateFootSensation: values.evaluateFootSensation || null,
            detectedDeadTissue: values.detectedDeadTissue || null,
            posteriorTibialLeftSide: values.posteriorTibialLeftSide || null,
            posteriorTbialRightSide: values.posteriorTbialRightSide || null,
            dorsalisPedisLeftSide: values.dorsalisPedisLeftSide || null,
            dorsalisPedisRightSide: values.dorsalisPedisRightSide || null,
        };
        let res = await InsVitalSignsFetch(objVitalSigns)
        notificationX(res?.isSuccess, "บันทึก Vital Signs")
        if (res?.isSuccess) {
            reload(true)
            close(true)
        }
    }

    const vitalSignFeet = [
        {
            name: "checkLeftFoot",
            inputType: "select",
            label: "ผลตรวจเท้าซ้าย",
            prevValue: opdClinicDetails?.checkLeftFoot,
            options: map(optionsVs_Foot?.checkFoot || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "checkRightFoot",
            inputType: "select",
            label: "ผลตรวจเท้าขวา",
            prevValue: opdClinicDetails?.checkRightFoot,
            options: map(optionsVs_Foot?.checkFoot || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "footWound",
            inputType: "select",
            label: "ตรวจพบแผลที่เท้า",
            prevValue: opdClinicDetails?.footWound,
            options: map(optionsVs_Foot?.footWound || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "historyOfFootUlcers",
            inputType: "select",
            label: "ประวัติเป็นแผลที่เท้า",
            prevValue: opdClinicDetails?.historyOfFootUlcers,
            options: map(optionsVs_Foot?.historyOfFootUlcers || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "historyOfFinger",
            inputType: "select",
            label: "ประวัติตัดนิ้ว ตัดขา ตัดเท้า",
            prevValue: opdClinicDetails?.historyOfFinger,
            options: map(optionsVs_Foot?.historyOfFinger || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "sensationInFeet",
            inputType: "select",
            label: "ประวัติเสียความรู้สึกที่เท้า",
            prevValue: opdClinicDetails?.sensationInFeet,
            options: map(optionsVs_Foot?.sensationInTheFeet || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "shoeCharacteristics",
            inputType: "input",
            label: "ลักษณะรองเท้า",
            prevValue: opdClinicDetails?.shoeCharacteristics,
        },
        {
            name: "checkToenails",
            inputType: "select",
            label: "ตรวจเล็บเท้า",
            prevValue: opdClinicDetails?.checkToenails,
            options: map(optionsVs_Foot?.checkToenails || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "wartsDetected",
            inputType: "select",
            label: "ตรวจพบหูด",
            prevValue: opdClinicDetails?.wartsDetected,
            options: map(optionsVs_Foot?.wartsDetected || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "deformedFeet",
            inputType: "select",
            label: "ตรวจพบเท้าผิดรูป",
            prevValue: opdClinicDetails?.deformedFeet,
            options: map(optionsVs_Foot?.deformedFeet || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "feetHair",
            inputType: "select",
            label: "ตรวจเส้นขนบนผิวเท้า",
            prevValue: opdClinicDetails?.feetHair,
            options: map(optionsVs_Foot?.feetHair || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "warmFeet",
            inputType: "select",
            label: "สัมผัสถึงไออุ่นบริเวณเท้า",
            prevValue: opdClinicDetails?.warmFeet,
            options: map(optionsVs_Foot?.warmFeet || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "fungalInfectionOfFeet",
            inputType: "select",
            label: "ตรวจพบเท้าติดเชื้อรา",
            prevValue: opdClinicDetails?.fungalInfectionOfFeet,
            options: map(optionsVs_Foot?.fungalInfectionofthefeet || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "checkSkinColor",
            inputType: "select",
            label: "ตรวจสีผิวหนัง",
            prevValue: opdClinicDetails?.checkSkinColor,
            options: map(optionsVs_Foot?.checkSkinColor || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "evaluateFootSensation",
            inputType: "select",
            label: "ประเมินประสาทความรู้สึกเท้า",
            prevValue: opdClinicDetails?.evaluateFootSensation,
            options: map(optionsVs_Foot?.evaluateFootSensation || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "detectedDeadTissue",
            inputType: "select",
            label: "ตรวจพบเนื้อตาย",
            prevValue: opdClinicDetails?.detectedDeadTissue,
            options: map(optionsVs_Foot?.detectedDeadTissue || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "posteriorTibialLeftSide",
            inputType: "select",
            label: "ผลการคลำชี้พจร Posterior tibial ด้านซ้าย",
            prevValue: opdClinicDetails?.posteriorTibialLeftSide,
            options: map(optionsVs_Foot?.posteriortibial || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "posteriorTbialRightSide",
            inputType: "select",
            label: "ผลการคลำชี้พจร Posterior tibial ด้านขวา",
            prevValue: opdClinicDetails?.posteriorTbialRightSide,
            options: map(optionsVs_Foot?.posteriortibial || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "dorsalisPedisLeftSide",
            inputType: "select",
            label: "ผลการคลำชีพจร Dorsalis Pedis ด้านซ้าย",
            prevValue: opdClinicDetails?.dorsalisPedisLeftSide,
            options: map(optionsVs_Foot?.posteriortibial || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "dorsalisPedisRightSide",
            inputType: "select",
            label: "ผลการคลำชีพจร Dorsalis Pedis ด้านขวา",
            prevValue: opdClinicDetails?.dorsalisPedisRightSide,
            options: map(optionsVs_Foot?.posteriortibial || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
    ]

    // V/S ตา / เท้า -> บันทึกเข้า Table OpdClinic ที่ 7.3
    const getDropdowns = async () => {
        if (Object.keys(optionsVs_Foot).length) return
        const fieldList = [
            "CheckFoot",
            "FootWound",
            "HistoryOfFootUlcers",
            "HistoryOfFinger",
            "SensationInTheFeet",
            "CheckToenails",
            "DeformedFeet",
            "WartsDetected",
            "FeetHair",
            "WarmFeet",
            "CheckSkinColor",
            "FungalInfectionofthefeet",
            "EvaluateFootSensation",
            "DetectedDeadTissue",
            "Posteriortibial",
        ]
        let map = fieldList.map((name) => {
            return {
                table: "TB_OPD_CLINICS",
                field: name
            }
        })
        let response = await GetDropDownMas(map);
        if (response.isSuccess) {
            const getDatadisplay = response.responseData.data
            dispatch(dspDropdowsVsFoot({
                checkFoot: getDatadisplay.CheckFoot,
                footWound: getDatadisplay.FootWound,
                historyOfFootUlcers: getDatadisplay.HistoryOfFootUlcers,
                historyOfFinger: getDatadisplay.HistoryOfFinger,
                sensationInTheFeet: getDatadisplay.SensationInTheFeet,
                checkToenails: getDatadisplay.CheckToenails,
                deformedFeet: getDatadisplay.DeformedFeet,
                wartsDetected: getDatadisplay.WartsDetected,
                feetHair: getDatadisplay.FeetHair,
                warmFeet: getDatadisplay.WarmFeet,
                checkSkinColor: getDatadisplay.CheckSkinColor,
                fungalInfectionofthefeet: getDatadisplay.FungalInfectionofthefeet,
                evaluateFootSensation: getDatadisplay.EvaluateFootSensation,
                detectedDeadTissue: getDatadisplay.DetectedDeadTissue,
                posteriortibial: getDatadisplay.Posteriortibial,
            }))
        }
    };
    useEffect(() => {
        getDropdowns();
    }, []);
    return (
        <div style={{ width: '100%' }}>
            <Form form={formProp || form} onFinish={onFinish}>
                <Row >
                    <Col span={24}>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="checkLeftFoot" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="checkRightFoot" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="footWound" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="historyOfFootUlcers" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="historyOfFinger" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="sensationInFeet" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="shoeCharacteristics" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="checkToenails" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="wartsDetected" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="deformedFeet" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="feetHair" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="warmFeet" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="fungalInfectionOfFeet" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="checkSkinColor" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="evaluateFootSensation" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="detectedDeadTissue" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="posteriorTibialLeftSide" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="posteriorTbialRightSide" noStyle={true} />
                        </Row>
                        <Row style={{ flexDirection: "row", paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                            <GenFormItem span={12} items={vitalSignFeet} itemName="dorsalisPedisLeftSide" noStyle={true} />
                            <GenFormItem span={12} items={vitalSignFeet} itemName="dorsalisPedisRightSide" noStyle={true} />
                        </Row>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

