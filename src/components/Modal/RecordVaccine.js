import React, { useEffect, useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Col, Modal } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import HisRecordVaccine from "routes/HomeHealthcare/Components/HisRecordVaccine"
import { map, filter, } from 'lodash';

export default function RecordVaccine({
    patientId = null,
    serviceId = null,
    clinicId = null,
    hn = null,
    runHn = null,
    yearHn = null,
    visibleModal = false,
    setVisibleModal,
    type = "primary",
    disabled = false,
    width = "",
    style = {},
    size = "small",
    ...props
}) {
    const [listDD, setListDD] = useState([])

    const getUserAll = async () => {
        const setUserByType = dataSource => {
            let temp = map(dataSource, o => {
                let label = `${o.datavalue} ${o.datadisplay || ""}`;
                return {
                    ...o,
                    value: o.datavalue,
                    label: label,
                    className: "data-value"
                };
            });
            // temp = filter(temp, o => o.cancelFlag !== "Y");
            // console.log('temp', temp)
            let filterD = filter(temp, ["userType", "D"]);
            let filterMD = filter(temp, o => o.userType === "M" || o.userType === "D");
            let filterNoMD = filter(temp, o => o.userType !== "M" && o.userType !== "D");
            setListDD(p => ({
                ...p,
                userTypeD: filterD,
                userTypeMD: filterMD,
                userTypeNoMD: filterNoMD
            }));
        };
        let res = await callApis(apis["GetUserMas"]);
        setUserByType(res);
    };
    useEffect(() => {
        getUserAll()

    }, [])

    // console.log('vaccine')

    return <Modal
        title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
            <Col>
                <LabelTopicPrimary18 text='ข้อมูลการรับวัคซีน' />
            </Col>
        </GenRow>}
        centered
        visible={visibleModal}
        // closeIcon={false}
        closable={false}
        width={1145}
        cancelText="ปิด"
        okText="บันทึก"
        onOk={() => { }}
        onCancel={() => { setVisibleModal(false) }}
        okButtonProps={{ hidden: true }}
    // cancelButtonProps={{ loading: loading }}
    >
        <div style={{ marginRight: -14, marginLeft: -14, marginBottom: -14, marginTop: -24 }}>
            <HisRecordVaccine
                patientId={patientId}
                serviceId={serviceId}
                clinicId={clinicId}
                hn={hn}
                runHn={runHn}
                yearHn={yearHn}
                optionsUser={[...listDD?.userTypeMD || [], ...listDD?.userTypeNoMD || []]}
            />
        </div>
    </Modal >


}
export const apis = {
    GetUserMas: {
        url: "Masters/GetUserMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
}