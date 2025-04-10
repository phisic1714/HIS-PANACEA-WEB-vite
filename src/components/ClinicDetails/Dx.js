import React, { useEffect, useState } from 'react'
import { filter, map, uniqBy, find } from "lodash"
import { callApi } from "../helper/function/CallApi";
import { Button, Col, Modal, Row } from 'antd';

export default function Dx({ clinicId }) {
    const [dx, setDx] = useState(null)
    // const [key, setKey] = useState(0);
    // console.log(dx);
    const [modal, setModal] = useState(false);
    const getOpdDiags = async (clinicId) => {
        if (!clinicId) return;
        let req = { clinicId };
        let res = await callApi(listApi, "GetOpdDiags", req);
        let filterDiag = filter(res, "diagId");
        filterDiag = uniqBy(filterDiag, "diagId");
        filterDiag = map(filterDiag, (o) => {
            return {
                doctor: o.doctor,
                serviceId: o.serviceId,
                clinicId: o.clinicId,
                diagId: o.diagId,
                icd: o.icdD,
                diagnosis: o.diagnosis,
                diagType: o.diagType,
                diagSide: o.diagSide,
                workId: o.workId,
            };
        });
        //จะแสดงเฉพาะDidgType=1 ทุกหน้า
        const findDiagType1 = find(filterDiag, ["diagType", "1"])
        if (!findDiagType1) {
            setModal(true)
        }
        setDx(findDiagType1)
    };

    useEffect(() => {
        getOpdDiags(clinicId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clinicId]);

    return (
        <>
            <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                <Col span={3}>
                    <div className="gx-text-primary">Dx</div>
                </Col>
                <Col span={18}>
                    <label className="data-value">{dx?.icdD}{dx?.diagnosis}</label>
                </Col>
            </Row>

            <Modal
                visible={modal}
                width={500}
                closable={false}
                centered={true}
                footer={<div className="text-center">
                    <Button onClick={() => setModal(false)}>ปิด</Button>
                </div>}
            >
                <Row gutter={[8, 8]}>
                    <Col span={24} style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <label className='gx-text-danger fs-5 fw-bold'>
                            เตือนการลง Diag
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
                        <label className="gx-text-danger fs-6" >
                            ผู้ป่วยยังไม่ได้ลงการวินิจฉัยโรค กรุณาลงการวินิจฉัยโรคก่อน
                        </label>
                    </Col>
                </Row>

            </Modal>
        </>
    )
}

const listApi = [
    // GetOpdDiags
    {
        name: "GetOpdDiags",
        url: "OpdClinics/GetHistoryClinicsDetail",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
];
