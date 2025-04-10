import React, { useState, useEffect, useRef } from 'react'
import _filter from "lodash/filter"
import { Row, Col, Button } from 'antd';
import { callApis } from 'components/helper/function/CallApi';
import { BsThreeDots } from "react-icons/bs";
import PharmaceuticalDetail from '../Modal/PharmaceuticalDetail';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { withResolve } from 'api/create-api';
// import Scrollbars from 'react-custom-scrollbars';
// const { Paragraph } = Typography;
const threeDot = {
    backgroundColor: "#ECEFF1",
    width: "26px",
    height: "12px",
    borderRadius: "50px",
    boxShadow: "0 1px 1px 0 #CFD8DC",
    alignItems: "center",
    cursor: "pointer"
};
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const displaySymtomAllergy = hosParam?.displaySymtomAllergy || null
// console.log('displaySymtomAllergy :>> ', displaySymtomAllergy);
export default function EllipsisDrugAllergy({
    patientId,
    btnShape = "default" || "circle",
    spanCol1 = 2,
    spanCol2 = 20,
    spanCol3 = 2,
    // showClinicalHistory = false,
    // showSurgeryHistory = false,
    returnDrugAllergyDetails = () => { },
    reloadPtAdr = () => { },
    reloadPtGroupAdr = () => { },
    reloadPtCodeAdr = () => { },
    reloadPtComponentAdr = () => { },
}) {
    const textRef = useRef(null)
    // State
    const [loading, setLoading] = useState(false)
    const [isEllipsis, setIsEllipsis] = useState(false);
    const [isDrugAllergy, setIsDrugAllergy] = useState(false);
    const [expand, setExpand] = useState(false);
    const [key, setKey] = useState(0);
    const [dataSource, setDataSource] = useState({
        drugAllergy: null,
        foodAllergy: null,
        otherAllergic: null,
        clinicalHistory: null,
        surgeryHistory: null,
        drugsAllergy: [],
        drugGroupAllergy: [],
        drugCodeAllergy: [],
        drugComponentAllergy: [],
        drugsOutAllergy: [],
    })
    const [vsbDrugAllergy, setVsbDrugAllergy] = useState(false)
    // Funcs
    const getDrugAllergies = async (patientId) => {
        if (!patientId) return
        setLoading(p => !p)
        let [
            patientsDrugAllergies,
            drugsOutAllergy
        ] = await Promise.all([
            callApis(apis["GetPatientsDrugAllergies"], patientId),
            withResolve(
                `/api/DrugAllergies/AdrRegistrationList/${patientId}`
            ).fetch()
        ])
        setLoading(p => !p)
        const drugsAllergy = _filter(patientsDrugAllergies.drug_Allergies_Info || [], o => o.cancelFlag !== "Y")
        const drugGroupAllergy = _filter(patientsDrugAllergies.drug_Group_Allergies_Info || [], o => o.cancelFlag !== "Y")
        setDataSource(p => {
            return {
                ...p,
                notAlergicFlag: patientsDrugAllergies.notAlergicFlag || null,
                drugAllergy: patientsDrugAllergies.drugAllergic || null,
                foodAllergy: patientsDrugAllergies.foodAllergy || null,
                otherAllergic: patientsDrugAllergies.otherAllergic || null,
                clinicalHistory: patientsDrugAllergies.clinicalHistory || null,
                surgeryHistory: patientsDrugAllergies.surgeryHistory || null,
                drugsAllergy: drugsAllergy,
                drugGroupAllergy: drugGroupAllergy,
                drugsOutAllergy: _filter(drugsOutAllergy.result || [], o => o.cancelFlag !== "Y"),
            }
        })
    }
    const getTbPtCodeAdrs = async (patientId) => {
        if (!patientId) return
        let res = await callApis(apis["GetTbPtCodeAdrs"], patientId)
        res = _filter(res, o => o.cancelFlag !== "Y")
        setDataSource(p => {
            return {
                ...p,
                drugCodeAllergy: res,
            }
        })
    }
    const getDrugComponentAllegies = async (patientId) => {
        if (!patientId) return
        let res = await callApis(apis["GetDrugComponentAllegies"], patientId)
        res = _filter(res, o => o.cancelFlag !== "Y")
        setDataSource(p => {
            return {
                ...p,
                drugComponentAllergy: res,
            }
        })
    }
    const chkDataSource = (dts) => {
        const allergy = dts?.drugAllergy
            || dts?.foodAllergy
            || dts?.otherAllergic
            || dts?.clinicalHistory
            || dts?.surgeryHistory
            || dts?.drugsAllergy?.length
            || dts?.drugGroupAllergy?.length
            || dts?.drugCodeAllergy?.length
            || dts?.drugComponentAllergy?.length
            || dts?.drugsOutAllergy?.length

        setIsDrugAllergy(allergy)
    }
    // Effect
    useEffect(() => {
        getDrugAllergies(patientId)
        getTbPtCodeAdrs(patientId)
        getDrugComponentAllegies(patientId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId])

    useEffect(() => {
        setKey(p => p += 1);
        returnDrugAllergyDetails(dataSource)
        chkDataSource(dataSource)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource])

    useEffect(() => {
        if (hosParam?.hideAllergy === "Y") {
            setIsEllipsis(true)
        } else {
            setExpand(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hosParam?.hideAllergy])

    useEffect(() => {
        if (textRef.current) {
            setIsDrugAllergy(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
    }, [dataSource]);
    const chkNotAlergicFlag = (notAlergicFlag) => {
        // console.log('dataSource', dataSource)
        const hasAllergyData =
            !notAlergicFlag ||
            dataSource?.drugsAllergy?.length > 0 ||
            dataSource?.drugGroupAllergy?.length > 0 ||
            dataSource?.drugCodeAllergy?.length > 0 ||
            dataSource?.drugComponentAllergy?.length > 0 ||
            dataSource?.drugsOutAllergy?.length > 0

        switch (notAlergicFlag) {
            case 'Y':
                return <label className="gx-text-primary">ไม่มีประวัติแพ้ยา</label>;
            case 'W':
                return <label style={{ color: "#ff9800" }}>ไม่ทราบ : {dataSource.drugAllergy}</label>;
            default:
                return (
                    <>
                        <div
                            ref={textRef}
                            style={{
                                whiteSpace: expand ? 'nowrap' : 'normal',
                                overflow: expand ? 'hidden' : 'visible',
                                textOverflow: expand ? 'ellipsis' : 'clip',
                                maxWidth: expand ? '100%' : 'none',
                                flex: '1 1 auto',
                                marginRight: '3px',
                                // marginLeft: '10px',
                            }}
                            className={hasAllergyData ? "blinking-background" : ""}
                        >
                            <label className='data-value d-inline me-1'>
                                {hosParam?.adrGeneric === 'Y' ? dataSource?.drugAllergy || '' : ''}
                                {dataSource?.foodAllergy && `, แพ้อาหาร: ${dataSource.foodAllergy}`}
                                {dataSource?.otherAllergic && `, แพ้อื่นๆ: ${dataSource.otherAllergic}`}
                                {dataSource?.clinicalHistory && `, ข้อมูลสำคัญทางคลินิก: ${dataSource.clinicalHistory}`}
                                {dataSource?.surgeryHistory && `, ข้อมูลสำคัญทางผ่าตัด: ${dataSource.surgeryHistory}`}
                            </label>

                            {
                                // แสดงพื้นหลังสีแดงกระพริบเมื่อ hasAllergyData มีข้อมูล
                                hasAllergyData && (
                                    <label className="data-value d-inline blinking-background">
                                        {hosParam?.adrGeneric === 'Y' && dataSource.drugsAllergy?.map((o, i) => (
                                            <span key={i} className="data-value" hidden={!o?.userCreated}>
                                                {o.lockFlag === 'Y' ? (
                                                    <LockOutlined size={8} style={{ color: 'red' }} />
                                                ) : (
                                                    <UnlockOutlined size={8} style={{ color: 'blue' }} />
                                                )}
                                                {o.generic} {displaySymtomAllergy ? o.otherSymptom : ""}
                                            </span>
                                        ))}
                                        {hosParam?.adrDrugGroup === 'Y' && dataSource.drugGroupAllergy?.map((o, i) => (
                                            <span key={i} className="data-value" hidden={!o?.userCreated}>
                                                {o.lockFlag === 'Y' ? (
                                                    <LockOutlined size={8} style={{ color: 'red' }} />
                                                ) : (
                                                    <UnlockOutlined size={8} style={{ color: 'blue' }} />
                                                )}
                                                {o.drugGroup} {displaySymtomAllergy ? o.otherSymptom : ""}
                                            </span>
                                        ))}
                                        {hosParam?.adrCode === 'Y' && dataSource.drugCodeAllergy?.map((o, i) => (
                                            <span key={i} className="data-value" hidden={!o?.userCreated}>
                                                {o.lockFlag === 'Y' ? (
                                                    <LockOutlined size={8} style={{ color: 'red' }} />
                                                ) : (
                                                    <UnlockOutlined size={8} style={{ color: 'blue' }} />
                                                )}
                                                {o.expenseName} {displaySymtomAllergy ? o.otherSymptom : ""}
                                            </span>
                                        ))}
                                        {hosParam?.adrComponent === 'Y' && dataSource.drugComponentAllergy?.map((o, i) => (
                                            <span key={i} className="data-value" hidden={!o?.userCreated}>
                                                {o.lockFlag === 'Y' ? (
                                                    <LockOutlined size={8} style={{ color: 'red' }} />
                                                ) : (
                                                    <UnlockOutlined size={8} style={{ color: 'blue' }} />
                                                )}
                                                {o.drugComponentName} {displaySymtomAllergy ? o.otherSymptom : ""}
                                            </span>
                                        ))}
                                        {hosParam?.adrOutMedicine === 'Y' && dataSource.drugsOutAllergy?.map((o, i) => (
                                            <span key={i} className="data-value" hidden={!o?.userCreated}>
                                                {o.lockFlag === 'Y' ? (
                                                    <LockOutlined size={8} style={{ color: 'red' }} />
                                                ) : (
                                                    <UnlockOutlined size={8} style={{ color: 'blue' }} />
                                                )}
                                                {o.drug} {displaySymtomAllergy ? o.otherSymptom : ""}
                                            </span>
                                        ))}
                                    </label>
                                )
                            }
                        </div>
                        {
                            isDrugAllergy && (
                                <Button
                                    onClick={() => {
                                        setExpand(!expand);
                                        setIsEllipsis(!isEllipsis);
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        border: 'none',
                                        borderRadius: '5px',
                                        marginTop: "6px",
                                    }}
                                    type="primary"
                                    size="small"
                                >
                                    {expand ? 'ดูเพิ่ม' : 'ซ่อน'}
                                </Button>
                            )
                        }

                    </>
                );
        }
    }

    return (
        <>
            <style>
                {`
    @keyframes blinkBackground {
        0% {
            background-color: red;
            color: white;
        }
        50% {
            background-color: white;
            color: red;
        }
        100% {
            background-color: red;
            color: white;
        }
    }

    .blinking-background {
        animation: blinkBackground 5s infinite; /* กระพริบทุก 2 วินาที */
        padding: 5px;
        border-radius: 4px;
        display: inline-block;
    

    `}
            </style>

            <Row gutter={[4, 4]} style={{ flexDirection: "row", width: '100%' }}
            // className={dataSource?.notAlergicFlag ? 'blinking-text' : ''}  
            >
                <Col
                    span={spanCol1}
                >
                    <label className="topic-danger-bold text-nowrap">
                        <span className={dataSource?.notAlergicFlag ? 'blinking-text' : ''}>
                            แพ้ยา
                        </span>
                    </label>
                </Col>
                <Col
                    span={spanCol2}
                    key={String(key)}
                // className={
                //     dataSource?.notAlergicFlag === 'Y' || dataSource?.notAlergicFlag === 'W'
                //         ? 'normal-row'
                //         : ''
                // }
                >
                    {chkNotAlergicFlag(dataSource?.notAlergicFlag)}
                </Col>
                <Col span={spanCol3} className='text-end'>
                    {btnShape === "default" && (
                        <label className="ms-3 topic-danger" onClick={() => setVsbDrugAllergy(true)}>
                            <BsThreeDots style={threeDot} />
                        </label>
                    )}
                    {btnShape === "circle" && (
                        <Button
                            style={{ marginBottom: 0 }}
                            size="small"
                            shape="circle"
                            icon={<BsThreeDots className='gx-text-primary' />}
                            onClick={() => setVsbDrugAllergy(true)}
                            disabled={!patientId}
                        />
                    )}
                </Col>
                {vsbDrugAllergy && (
                    <PharmaceuticalDetail
                        handlePharmaceuticalDetail={() => setVsbDrugAllergy(false)}
                        showPharmaceuticalDetail={vsbDrugAllergy}
                        patientId={patientId}
                        reloadDrugAllergic={isSuccess => {
                            if (isSuccess) {
                                getDrugAllergies(patientId);
                                reloadPtAdr();
                                reloadPtGroupAdr();
                            }
                        }}
                        reloadPtCodeAdrs={() => {
                            getTbPtCodeAdrs(patientId);
                            reloadPtCodeAdr();
                        }}
                        reloadDrugComponentAllegies={() => {
                            getDrugComponentAllegies(patientId);
                            reloadPtComponentAdr();
                        }}

                    />
                )}
            </Row>
        </>



    )


}
const apis = {
    GetPatientsDrugAllergies: {
        url: "Patients/GetPatients_Drug_AllergiesById/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetTbPtCodeAdrs: {
        url: "TbPtCodeAdrs/GetTbPtCodeAdrsDisplay/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetDrugComponentAllegies: {
        url: "DrugAllergies/GetListDrugComponentAllegies/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
