import { Col, Row, Statistic } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { env } from "../../env";
import {toNumber} from "lodash";
import convertToComma from "components/helper/function/convertToComma";

export default function Bw({
    clinicId, //ผู้ป่วยนอก clinicId
    admitId, //ผู้ป่วยในส่ง admitid
    patientId,
    type = null
}) {
    // ดึงข้อมูลรายละเอียดการมารับบริการ
    const [opdClinicDetail, setOpdClinicDetail] = useState({});
    // console.log(opdClinicDetail);
    const getVsAdmit = async () => {
        let req = {
            requestData: {
                patientId: patientId || null,
                admitId: admitId || null,
            }
        };
        const urlAdmitVs = `${env.REACT_APP_PANACEACHS_SERVER}/api/IpdWard/GetAdmitDetail`;
        await axios.post(urlAdmitVs, req).then(res => {
            // console.log("GetAdmitDetail", res.data.responseData);
            return setOpdClinicDetail(res?.data?.responseData || {});
        }).catch(error => {
            return error;
        })
    }
    const fetchHistoryClinicsDetail = async () => {
        if (type === "ipd") return getVsAdmit()
        let urlold = `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetOpdClinicHistoryPopUpDisplayDetail`;
        let urlwithtype = `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetOpdClinicHistoryPopUpDisplayDetail`;
        let reqA = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
                patientId: patientId || null,
                serviceId: null,
                date: null,
                userId: null,
                workId: null,
                clinicId: clinicId || null,
                admitId: admitId || null
            },
            barcode: null
        };
        let resA = await axios.post(`${type ? urlwithtype : urlold}`, reqA).then(res => {
            // console.log(res.data.responseData);

            return res.data.responseData;
        }).catch(error => {
            return error;
        })
        if (type) {
            // console.log(resA);
            setOpdClinicDetail(resA?.clinicDetail || {});
            // if (resA.opdIpd === "ipd") {
            //     setOpdClinicDetail(resA.admitDetail || {});
            // } else if (resA.opdIpd === "opd") {
            //     setOpdClinicDetail(resA?.clinicDetail || {});
            // } else {
            //     setOpdClinicDetail({});
            // }
        } else {
            setOpdClinicDetail(resA);
        }
    }

    useEffect(() => {
        if (clinicId || admitId) {
            // getOpdClinicAssistant();
            fetchHistoryClinicsDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clinicId, admitId]);

    return (
        <>
            <Row gutter={[8, 8]}>
                <Col span={3}>
                    <label className="gx-text-primary fw-bold me-1">BW</label>
                    <label className="data-value">
                        {opdClinicDetail?.weight && toNumber(opdClinicDetail?.weight)}{" "}
                        kg
                    </label>
                </Col>
                <Col span={4}>
                    <label className="gx-text-primary fw-bold me-1">Ht.</label>
                    <label className="data-value">
                        {opdClinicDetail?.height && toNumber(opdClinicDetail?.height)}{" "}
                        cm
                    </label>
                </Col>
                <Col span={6}>
                    <label className="gx-text-primary fw-bold me-1">BP</label>
                    {/* <label className="data-value">{opdClinicDetail?.bpSD}</label> */}

                    {/* <br /> */}
                    {opdClinicDetail?.bpDiastolic ? <label>
                        <label>
                            <Statistic value={convertToComma({
                                value: opdClinicDetail?.bpDiastolic,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                                comma: false
                            })} valueStyle={{
                                fontSize: 14
                            }} suffix="/" />
                        </label>
                        <label>
                            <Statistic value={convertToComma({
                                value: opdClinicDetail?.bpSystolic,
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                                comma: false
                            })} valueStyle={{
                                fontSize: 14
                            }} />
                        </label>
                    </label> : <p>-</p>}
                </Col>
                <Col span={3}>
                    <label className="gx-text-primary fw-bold me-1">BT</label>
                    <label className="data-value">
                        {opdClinicDetail?.bodyTemperature && toNumber(opdClinicDetail?.bodyTemperature)}{" "}
                        °C
                    </label>
                </Col>
                <Col span={3}>
                    <label className="gx-text-primary fw-bold me-1">P</label>
                    <label className="data-value">
                        {opdClinicDetail?.pulse && toNumber(opdClinicDetail?.pulse)}
                        /min
                    </label>
                </Col>
                <Col span={3}>
                    <label className="gx-text-primary fw-bold me-1">R</label>
                    <label className="data-value">
                        {opdClinicDetail?.respiratory && toNumber(opdClinicDetail?.respiratory)}
                        /min
                    </label>
                </Col>
                {/* <Col span={2}>
                    <label className="ms-3 gx-text-primary" onClick={() => setShowOpdVitalSignsModal(true)}>
                        <BsThreeDots style={threeDot} />
                    </label>
                </Col> */}
            </Row>
        </>
    )
}