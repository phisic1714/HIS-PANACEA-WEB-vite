/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Button, Col, Row, Select, Statistic } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import { BsThreeDots } from "react-icons/bs";
import UpdateOpdRight from "components/Modal/UpdateOpdRight";

const threeDot = {
    backgroundColor: "#ECEFF1",
    width: "26px",
    height: "12px",
    borderRadius: "50px",
    boxShadow: "0 1px 1px 0 #CFD8DC",
    alignItems: "center",
    cursor: "pointer"
};
export default function OpdRights({
    patientId = null,
    serviceId = null,
    opdRightId = null,
    btnShape = "default" || "circle",
    spanCol1 = 2,
    spanCol2 = 7,
    spanCol3 = 13,
    spanCol4 = 2,
    size = "small",
    selectedRight = () => { },
    reload = false,
    allowSave = true,
}) {
    // State
    const [optionsRight, setOptionsRight] = useState([])
    const [selectedRightDetails, setSelectedRightDetails] = useState(null)
    const [vsbUpdateRight, setVsbUpdateRight] = useState(false)
    // Funcs
    const resetData = () => {
        setOptionsRight([])
        setSelectedRightDetails(null)
    }
    const getOpdRights = async (serviceId) => {
        if (!serviceId) return resetData()
        let res = await callApis(apis["getOpdRights"], serviceId)
        if (!res?.length) return resetData()
        res = res.map(o => {
            return {
                ...o,
                value: o.opdRightId,
                label: o.opdRightName,
                className: "data-value",
            }
        })
        setOptionsRight(res)
        if (opdRightId) {
            const findByOpdRightId = res.find(o => o.opdRightId === opdRightId)
            setSelectedRightDetails(findByOpdRightId)
        } else {
            const findForSelected = res.find(o => o.mainFlag === "Y") || res[0]
            setSelectedRightDetails(findForSelected)
        }
    }
    // Effects
    useEffect(() => {
        getOpdRights(serviceId)
    }, [serviceId, reload])
    useEffect(() => {
        selectedRight(selectedRightDetails)
    }, [selectedRightDetails])
    // Components
    const PartsUpdateOpdRightModal = () => {
        return vsbUpdateRight && <UpdateOpdRight
            patientId={patientId}
            opdRightId={selectedRightDetails?.opdRightId}
            open={vsbUpdateRight}
            close={() => setVsbUpdateRight(false)}
            success={bool => {
                if (bool) {
                    setVsbUpdateRight(false);
                    getOpdRights(serviceId)
                }
            }}
            allowSave={allowSave}
        />
    }
    return <>
        <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
            <Col span={spanCol1}>
                <label className="gx-text-primary text-nowrap">
                    สิทธิ์<span className='fw-lighter'>({optionsRight.length})</span>
                </label>
            </Col>
            <Col span={spanCol2}>
                <Select
                    style={{ width: "95%", }}
                    size={size}
                    showSearch
                    allowClear
                    dropdownMatchSelectWidth={275}
                    className='data-value'
                    options={optionsRight}
                    value={selectedRightDetails?.opdRightId}
                    onChange={(v, d) => setSelectedRightDetails(d || null)}
                />
            </Col>
            <Col span={spanCol3}>
                <Row gutter={[4, 4]} className='text-center'>
                    <Col span={6}>
                        <p className="gx-text-primary" style={{
                            marginBottom: "4px"
                        }}>
                            จำนวนเงิน
                        </p>
                        <p className="data-value">
                            <Statistic value={selectedRightDetails?.amount || "-"}
                                valueStyle={{
                                    fontSize: 12
                                }} />
                        </p>
                    </Col>
                    <Col span={6}>
                        <p className="gx-text-primary" style={{
                            marginBottom: "4px"
                        }}>
                            เครดิต
                        </p>
                        <p className="data-value">
                            <Statistic value={selectedRightDetails?.credit || "-"}
                                valueStyle={{
                                    fontSize: 12
                                }} />
                        </p>
                    </Col>
                    <Col span={6}>
                        <p className="gx-text-primary" style={{
                            marginBottom: "4px"
                        }}>
                            เบิกได้
                        </p>
                        <p className="data-value">
                            <Statistic value={selectedRightDetails?.cashReturn || "-"}
                                valueStyle={{
                                    fontSize: 12
                                }} />
                        </p>
                    </Col>
                    <Col span={6}>
                        <p className="gx-text-primary " style={{
                            marginBottom: "4px"
                        }}>
                            เบิกไม่ได้
                        </p>
                        <p className="data-value">
                            <Statistic value={selectedRightDetails?.cashNotReturn || "-"}
                                valueStyle={{
                                    fontSize: 12
                                }} />
                        </p>
                    </Col>
                </Row>
            </Col>
            <Col span={spanCol4} className='text-end'>
                {
                    btnShape === "default" && <label
                        className="ms-3 gx-text-primary"
                        onClick={() => {
                            if (!selectedRightDetails) return
                            setVsbUpdateRight(true)
                        }}
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
                        // onClick={() => setVsbDrugAllergy(true)}
                        disabled={!serviceId}
                    />
                }
            </Col>
        </Row>
        {PartsUpdateOpdRightModal()}
    </>
}
const apis = {
    getOpdRights: {
        url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
