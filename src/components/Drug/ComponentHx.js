import { Button, Col, Row } from 'antd'
import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import Hx from '../Modal/Hx';
import { GetPatientDetail } from 'routes/OpdClinic/API/OpdDrugChargeApi';

export default function ComponentHx({
    patientId,
    btnShape = "default" || "circle",
    spanCol1 = 2,
    spanCol2 = 20,
    spanCol3 = 2,
    reloadHxDrug = () => { },
}) {
    const [key, setKey] = useState(0);
    const [vsbDiseases, setVsbDiseases] = useState(false)
    const [patientInfo, setpatientInfo] = useState();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const textRef = useRef(null)
    const threeDot = {
        backgroundColor: "#ECEFF1",
        width: "26px",
        height: "12px",
        borderRadius: "50px",
        boxShadow: "0 1px 1px 0 #CFD8DC",
        alignItems: "center",
        cursor: "pointer"
    };
    const getPatientAdmitDetail = async (patientId) => {
        let patientDetail = await GetPatientDetail(patientId);
        if (patientDetail) {
            const haveData = patientDetail?.underlyingDisease ||
                (patientDetail?.underlying_Diseases_Display?.length > 0);

            setpatientInfo(patientDetail);
            setShowExpandButton(haveData);
        } else {
            setpatientInfo(null);
            setShowExpandButton(false);
        }
    };
    useEffect(() => {
        if (patientId) {
            getPatientAdmitDetail(patientId)
        }
    }, [patientId]);
    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
                setShowExpandButton(isOverflowing || isExpanded);
            }
        };

        checkOverflow();

        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, [patientInfo, key, isExpanded]);

    return (
        <Row gutter={[4, 4]} style={{ flexDirection: "row", width: '100%' }}>
            <Col span={spanCol1}>
                <label className="topic-danger-bold text-nowrap">Hx</label>
            </Col>
            <Col span={spanCol2} key={String(key)}>
                <>
                    <div
                        ref={textRef}
                        style={{
                            whiteSpace: isExpanded ? 'normal' : 'nowrap',
                            overflow: isExpanded ? 'visible' : 'hidden',
                            textOverflow: isExpanded ? 'clip' : 'ellipsis',
                            maxWidth: isExpanded ? '100%' : 'none',
                            flex: '1 1 auto',
                            maxHeight: isExpanded ? 'none' : '2em',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                        }}
                    >
                        <div className='data-value' style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5em',
                        }}>
                            {patientInfo?.underlyingDisease && (
                                <div style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: '0.5em 1em',
                                    borderRadius: '5px',
                                    fontSize: '0.9em',
                                    display: 'inline-block',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: isExpanded ? 'normal' : 'nowrap',

                                }}>
                                    {patientInfo?.underlyingDisease}
                                </div>
                            )}
                            {patientInfo?.underlying_Diseases_Display?.length > 0 &&
                                patientInfo.underlying_Diseases_Display.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            backgroundColor: '#f5f5f5',
                                            padding: '0.5em 1em',
                                            borderRadius: '5px',
                                            fontSize: '0.9em',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: isExpanded ? 'normal' : 'nowrap',

                                        }}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                        </div>
                    </div>

                    {showExpandButton && (
                        <Button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                cursor: 'pointer',
                                border: 'none',
                                borderRadius: '5px',
                                marginTop: "6px",
                            }}
                            type="primary"
                            size="small"
                        >
                            {isExpanded ? 'ซ่อน' : 'ดูเพิ่ม'}
                        </Button>
                    )}
                </>
            </Col>
            <Col span={spanCol3} className='text-end'>
                {
                    btnShape === "default" && <label
                        className="ms-3 topic-danger"
                        onClick={() => setVsbDiseases(true)}
                    >
                        <BsThreeDots style={threeDot} />
                    </label>
                }
                {
                    btnShape === "circle" && <Button
                        style={{ marginBottom: 0 }}
                        size="small"
                        shape='circle'
                        icon={<BsThreeDots className='gx-text-primary' />}
                        onClick={() => setVsbDiseases(true)}
                        disabled={!patientId}
                    />
                }
            </Col>
            {
                vsbDiseases && <Hx
                    isVisible={vsbDiseases}
                    setModal={isVisible => setVsbDiseases(isVisible)}
                    patientId={patientId}
                    readOnly={true}
                    reloadHx={isSuccess => {
                        console.log('reloadHx :>> ', isSuccess);
                        if (isSuccess) {
                            getPatientAdmitDetail(patientId)
                            reloadHxDrug()
                            setKey(prevKey => prevKey + 1);
                            document.getElementById("get-Diseases")?.click()
                        }
                    }}
                />
            }
        </Row>
    )
}