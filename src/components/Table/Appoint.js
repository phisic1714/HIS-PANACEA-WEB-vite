import React, { useState, useEffect } from 'react'
import { callApis } from '../helper/function/CallApi';
import AppiontTable, { AppiontModal } from 'components/Table/AppiontTable';

export default function Appoint({
    patientId = null,
    size = "small",
    onClickCopy = () => { },
    hiddenCopy = true,
}) {
    // State
    const [optionsAppoint, setOptionsAppoint] = useState([]);
    const [appointId, setAppointId] = useState(null)
    const [vsbAppointDetails, setVsbAppointDetails] = useState(false)
    // Functions
    const getAppoints = async (patientId) => {
        if (!patientId) return setOptionsAppoint([])
        const res = await callApis(apis["GetOpdAppoints"], patientId)
        setOptionsAppoint(res);
    }
    // Effect
    useEffect(() => {
        getAppoints(patientId);
    }, [patientId])
    return <>
        <AppiontTable
            useDayjs={true}
            size={size}
            scroll={{
                x: 725, y: 200
            }}
            dataSource={optionsAppoint}
            rowClassName="data-value pointer"
            rowKey="appointId"
            pagination={false} onRow={(record) => {
                return {
                    onClick: () => {
                        setAppointId(record.appointId);
                        setVsbAppointDetails(true);
                    } // click row
                };
            }} />
        <AppiontModal
            visible={vsbAppointDetails}
            appointId={appointId}
            hiddenCopy={hiddenCopy}
            onCancel={() => {
                setVsbAppointDetails(false);
                setAppointId(null);
            }}
            onClickClose={() => {
                setVsbAppointDetails(false);
                setAppointId(null);
            }}
            onClickCopy={(activities = []) => {
                console.log('onClickCopy', activities)
                onClickCopy(activities)
                setVsbAppointDetails(false);
                setAppointId(null);
            }}
        />
    </>
}
const apis = {
    GetOpdAppoints: {
        url: "PatientsFinancesDrug/GetOpdAppointsFinancesDrug/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    }
}
