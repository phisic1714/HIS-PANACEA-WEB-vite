import { Col, Divider, Form, Input, Row } from 'antd';
import GenFormItem from 'components/helper/function/GenFormItem';
import { notificationX } from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import { map } from "lodash";
import { useEffect, useState } from 'react';
import { GetDropDownMas, InsVitalSignsFetch } from 'routes/OpdClinic/API/ScreeningApi';
import { useDispatch, useSelector } from "react-redux";
import { dspDropdowsVsEyes } from "appRedux/actions";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function VsEyes({
    reload = () => { return false },
    close = () => { console.log('VS') },
    formProp = null,
    prevVitalSign = null,
    patientId,
    clinicId,
    serviceId,
    runHn,
    hn,
    yearHn,
    workId,
    opdClinicDetails,
}) {
    const dispatch = useDispatch();
    const [form] = Form.useForm()
    const optionsVs_Eyes = useSelector(({ getDropdowns }) => getDropdowns.optionsVs_Eyes);
    const [rightIOP, setRightIOP] = useState(opdClinicDetails?.rightIntraOcularPressure || "");
    const [leftIOP, setLeftIOP] = useState(opdClinicDetails?.leftIntraOcularPressure || "");
    const fetchData = async () => {
        if (Object.keys(optionsVs_Eyes).length) return
        const fieldList = [
            "CheckEyes",
            "Checkleftrighteyes",
            "ExamineRetina",
            "MacularEdema",
            "LaserTreatment",
            "Cataract",
            "HadSurgery",
            "BlindPatient",
            "VisualAcuityResults",
        ]
        const map = fieldList.map((name) => {
            return {
                table: "TB_OPD_CLINICS",
                field: name
            }
        })
        const response = await GetDropDownMas(map);
        if (response.isSuccess) {
            const getDatadisplay = response.responseData.data
            dispatch(dspDropdowsVsEyes(getDatadisplay))
        }
    };
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
            rightVisualAcuityResultsOther: values.rightVisualAcuityResultsOther || null,
            rightSidePHResults: values.rightSidePHResults || null,
            rightSidePHResultsOther: values.rightSidePHResultsOther || null,
            leftVisualAcuityResults: values.leftVisualAcuityResults || null,
            leftVisualAcuityResultsOther: values.leftVisualAcuityResultsOther || null,
            leftSidePHResults: values.leftSidePHResults || null,
            leftSidePHResultsOther: values.leftSidePHResultsOther || null,
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
    const vitalSignEyes = [
        {
            name: "checkEyes",
            inputType: "select",
            label: "ตรวจสายตา",
            options: map(optionsVs_Eyes?.CheckEyes || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            }),
            prevValue: opdClinicDetails?.checkEyes
        },
        {
            name: "checkRightEye",
            inputType: "select",
            label: "ตาขวา",
            options: map(optionsVs_Eyes?.Checkleftrighteyes || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            }),
            prevValue: opdClinicDetails?.checkRightEye
        },
        {
            name: "checkLeftEye",
            inputType: "select",
            label: "ตาซ้าย",
            prevValue: opdClinicDetails?.checkLeftEye,
            options: map(optionsVs_Eyes?.Checkleftrighteyes || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "examineRightRetina",
            inputType: "select",
            label: "ตรวจจอประสาทตาด้านขวา",
            prevValue: opdClinicDetails?.examineRightRetina,
            options: map(optionsVs_Eyes?.ExamineRetina || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "examineLeftRetina",
            inputType: "select",
            label: "ตรวจจอประสาทตาด้านซ้าย",
            prevValue: opdClinicDetails?.examineLeftRetina,
            options: map(optionsVs_Eyes?.ExamineRetina || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "rightVisualAcuityResults",
            inputType: "select",
            label: "ผล Visual Acuity ข้างขวา",
            prevValue: opdClinicDetails?.rightVisualAcuityResults,
            options: map(optionsVs_Eyes?.VisualAcuityResults || [], o => {
                return {
                    value: o.datavalue.replace(/F$/, ""),
                    className: "data-value",
                    label: o.datadisplay.replace(/F$/, ""),
                }
            })
        },
        {
            name: "rightVisualAcuityResultsOther",
            inputType: "input",
            prevValue: opdClinicDetails?.rightVisualAcuityResultsOther,
            maxLength: "50"
        },
        {
            name: "rightSidePHResults",
            inputType: "select",
            label: "ผล PH ข้างขวา",
            prevValue: opdClinicDetails?.rightSidePHResults,
            options: map(optionsVs_Eyes?.VisualAcuityResults || [], o => {
                return {
                    value: o.datavalue.replace(/F$/, ""),
                    className: "data-value",
                    label: o.datadisplay.replace(/F$/, ""),
                }
            })
        },
        {
            name: "rightSidePHResultsOther",
            inputType: "input",
            prevValue: opdClinicDetails?.rightSidePHResultsOther,
            maxLength: "50"
        },
        {
            name: "leftVisualAcuityResults",
            inputType: "select",
            label: "ผล Visual Acuity ข้างซ้าย",
            prevValue: opdClinicDetails?.leftVisualAcuityResults,
            options: map(optionsVs_Eyes?.VisualAcuityResults || [], o => {
                return {
                    value: o.datavalue.replace(/F$/, ""),
                    className: "data-value",
                    label: o.datadisplay.replace(/F$/, ""),
                }
            })
        },
        {
            name: "leftVisualAcuityResultsOther",
            inputType: "input",
            label: "",
            prevValue: opdClinicDetails?.leftVisualAcuityResultsOther,
            maxLength: "50"
        },
        {
            name: "leftSidePHResults",
            inputType: "select",
            label: "ผล PH ข้างซ้าย",
            prevValue: opdClinicDetails?.leftSidePHResults,
            options: map(optionsVs_Eyes?.VisualAcuityResults || [], o => {
                return {
                    value: o.datavalue.replace(/F$/, ""),
                    className: "data-value",
                    label: o.datadisplay.replace(/F$/, ""),
                }
            })
        },
        {
            name: "leftSidePHResultsOther",
            inputType: "input",
            label: "",
            prevValue: opdClinicDetails?.leftSidePHResultsOther,
            maxLength: "50"
        },
        {
            name: "rightIntraOcularPressure",
            inputType: "input",
            label: "ผล IntraOcular Pressure ข้างขวา",
            prevValue: opdClinicDetails?.rightIntraOcularPressure,
            maxLength: "50",
            value: rightIOP,
            onChange: (e) => setRightIOP(e.target.value),
            style: rightIOP > 22 ? { color: "red" } : {}

        },
        {
            name: "leftIntraOcularPressure",
            inputType: "input",
            prevValue: opdClinicDetails?.leftIntraOcularPressure,
            label: "ผล IntraOcular Pressure ข้างซ้าย",
            maxLength: "50",
            value: leftIOP,
            onChange: (e) => setLeftIOP(e.target.value),
            style: leftIOP > 22 ? { color: "red" } : {}
        },
        {
            name: "macularEdema",
            inputType: "select",
            label: "การตรวจดู Macular Edema",
            prevValue: opdClinicDetails?.macularEdema,
            options: map(optionsVs_Eyes?.MacularEdema || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "laserTreatment",
            inputType: "select",
            label: "การยิง Laser รักษา",
            prevValue: opdClinicDetails?.laserTreatment,
            options: map(optionsVs_Eyes?.LaserTreatment || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "cataract",
            inputType: "select",
            label: "ตรวจพบต้อกระจกหรือไม่",
            prevValue: opdClinicDetails?.cataract,
            options: map(optionsVs_Eyes?.Cataract || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "hadSurgery",
            inputType: "select",
            label: "มีการผ่าตัดหรือไม่",
            prevValue: opdClinicDetails?.hadSurgery,
            options: map(optionsVs_Eyes?.HadSurgery || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "diseaseLeftEye",
            inputType: "input",
            label: "โรคที่เกิดกับตาซ้าย อื่นๆ",
            prevValue: opdClinicDetails?.diseaseLeftEye,
            maxLength: "50"
        },
        {
            name: "diseaseRightEye",
            inputType: "input",
            label: "โรคที่เกิดกับตาขวา อื่นๆ",
            prevValue: opdClinicDetails?.diseaseRightEye,
            maxLength: "50"
        },
        {
            name: "blindPatient",
            inputType: "select",
            label: "Visit นี้ผู้ป่วยตาบอดหรือไม่",
            prevValue: opdClinicDetails?.blindPatient,
            options: map(optionsVs_Eyes?.BlindPatient || [], o => {
                return {
                    value: o.datavalue,
                    className: "data-value",
                    label: o.datadisplay,
                }
            })
        },
        {
            name: "treatmentGiven",
            inputType: "textArea",
            label: "การรักษาที่ให้",
            prevValue: opdClinicDetails?.treatmentGiven,
            rows: "4",
            maxLength: "2000"
        },
        {
            name: "otherNotes",
            inputType: "textArea",
            label: "หมายเหตุอื่นๆ",
            prevValue: opdClinicDetails?.otherNotes,
            rows: "4",
            maxLength: "2000"
        },
    ]
    useEffect(() => {
        // V/S ตา / เท้า -> บันทึกเข้า Table OpdClinic ที่ 7.3
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const PartLeftRightEyesForm = ({
        title = 'วัดค่าสายตา  (VR)',
        contentRE = [
            { title: '', name: '' },

        ],
        contentLE = [
            { name: '' },
        ],
    }) => {
        return (
            <>
                <label
                    className="gx-text-primary"
                    style={{ cursor: 'pointer', marginLeft: 10 }}
                >
                    {title}
                </label>
                <Row gutter={[4, 4]} style={{ flexDirection: 'row', marginLeft: 10 }}>
                    <Col
                        span={2}
                        style={{
                            paddingLeft: 0,
                            paddingRight: 0,
                            textAlign: 'center',
                            marginTop: 25,
                        }}
                    >
                        RE
                    </Col>
                    {contentRE?.map(v => <>
                        <Col span={4}>
                            <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                                {v?.title}
                            </label>
                            <Form.Item name={v?.name} noStyle>
                                <Input
                                    style={{
                                        marginTop: v?.title === '' && 18,
                                        backgroundColor: opdClinicDetails?.[v?.name] ? '#69f0ae' : '',
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </>)}
                    {/* <Col span={4}>
                        <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                            VA
                        </label>
                        <Form.Item name="grVa" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.grVa ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                            Sph
                        </label>
                        <Form.Item name="grSph" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.grSph ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                            Cyl
                        </label>
                        <Form.Item name="grCyl" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.grCyl ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                            Ax
                        </label>
                        <Form.Item name="grAx" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.grAx ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <label className="gx-text-primary" style={{ cursor: 'pointer' }}>
                            Add
                        </label>
                        <Form.Item name="grAdd" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.grAdd ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col> */}
                    <Col span={4}></Col>
                </Row>
                <Row
                    gutter={[4, 4]}
                    style={{ marginTop: 10, flexDirection: 'row', marginLeft: 10 }}
                >
                    <Col
                        span={2}
                        style={{
                            paddingLeft: 0,
                            paddingRight: 0,
                            textAlign: 'center',
                            marginTop: 10,
                        }}
                    >
                        LE
                    </Col>
                    {contentLE?.map(v => <>
                        <Col span={4}>
                            <Form.Item name={v?.name} noStyle>
                                <Input
                                    style={{
                                        backgroundColor: opdClinicDetails?.[v?.name] ? '#69f0ae' : '',
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </>)}
                    {/* <Col span={4}>
                        <Form.Item name="glVa" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.glVa ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="glSph" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.glSph ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="glCyl" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.glCyl ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="glAx" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.glAx ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="glAdd" noStyle>
                            <Input
                                style={{
                                    backgroundColor: opdClinicDetails?.glAdd ? '#69f0ae' : '',
                                }}
                            />
                        </Form.Item>
                    </Col> */}
                    <Col span={1}></Col>
                </Row>
            </>
        );
    };
    return (
        <div style={{ width: '100%' }}>
            <Form form={formProp || form} onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <label style={{ cursor: 'pointer', marginLeft: 10 }}>
                            3 เมตร
                        </label>
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="VA"
                            contentRE={[
                                { title: '', name: '' },
                                { title: 'cPH', name: '' },
                                { title: 'cC', name: '' },
                                { title: 'cPH', name: '' },
                            ]}
                            contentLE={[
                                { name: '' },
                                { name: '' },
                                { name: '' },
                                { name: '' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="TN"
                            contentRE={[
                                { title: '', name: '' },
                                { title: 'CCT', name: '' },
                                { title: '3nd', name: '' },
                            ]}
                            contentLE={[
                                { name: '' },
                                { name: '' },
                                { name: '' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="TNa"
                            contentRE={[
                                { title: '1St', name: '' },
                                { title: '2nd', name: '' },
                                { title: '3nd', name: '' },
                            ]}
                            contentLE={[
                                { name: 'glVa' },
                                { name: 'glSph' },
                                { name: 'glCyl' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="AR ก่อนขยาย"
                            contentRE={[
                                { title: 'Sph', name: '' },
                                { title: 'Cyl', name: '' },
                                { title: 'Ax', name: '' },
                                { title: 'Add', name: '' },
                            ]}
                            contentLE={[
                                { name: '' },
                                { name: '' },
                                { name: '' },
                                { name: '' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="AR หลังขยาย"
                            contentRE={[
                                { title: 'Sph', name: '' },
                                { title: 'Cyl', name: '' },
                                { title: 'Ax', name: '' },
                                { title: 'Add', name: '' },
                            ]}
                            contentLE={[
                                { name: '' },
                                { name: '' },
                                { name: '' },
                                { name: '' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <PartLeftRightEyesForm
                            title="ค่าวัดแว่นตา (VA)"
                            contentRE={[
                                { title: 'VA', name: 'grVa' },
                                { title: 'Sph', name: 'grSph' },
                                { title: 'Cyl', name: 'grCyl' },
                                { title: 'Ax', name: 'grAx' },
                                { title: 'Add', name: 'grAdd' },
                            ]}
                            contentLE={[
                                { name: 'glVa' },
                                { name: 'glSph' },
                                { name: 'glCyl' },
                                { name: 'glAx' },
                                { name: 'glAdd' },
                            ]}
                        />
                    </Col>
                    <Col span={24}>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={24}
                                items={vitalSignEyes}
                                itemName="checkEyes"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="checkRightEye"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="checkLeftEye"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="examineRightRetina"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="examineLeftRetina"
                                noStyle={true}
                            />
                        </Row>
                    </Col>
                    <Divider />
                    <Col span={24}>

                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="rightVisualAcuityResults"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="leftVisualAcuityResults"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="rightVisualAcuityResultsOther"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="leftVisualAcuityResultsOther"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="rightSidePHResults"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="leftSidePHResults"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="rightSidePHResultsOther"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="leftSidePHResultsOther"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="rightIntraOcularPressure"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="leftIntraOcularPressure"
                                noStyle={true}
                            />
                        </Row>
                        {/* <Col span={24}> */}
                        <br />

                        {/* </Col> */}
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="macularEdema"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="laserTreatment"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="cataract"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="hadSurgery"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="diseaseRightEye"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={12}
                                items={vitalSignEyes}
                                itemName="diseaseLeftEye"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={24}
                                items={vitalSignEyes}
                                itemName="blindPatient"
                                noStyle={true}
                            />
                        </Row>
                        <Row
                            style={{
                                flexDirection: 'row',
                                paddingLeft: 20,
                                paddingRight: 20,
                                paddingTop: 10,
                            }}
                        >
                            <GenFormItem
                                span={24}
                                items={vitalSignEyes}
                                itemName="treatmentGiven"
                                noStyle={true}
                            />
                            <GenFormItem
                                span={24}
                                items={vitalSignEyes}
                                itemName="otherNotes"
                                noStyle={true}
                            />
                        </Row>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

