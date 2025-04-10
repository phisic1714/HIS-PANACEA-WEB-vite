import React, { useState, useEffect } from 'react';
import { GetOpdCardLatest } from "./Api";

import { Row, Col, Typography } from 'antd';

const { Text } = Typography;

export default function FileLocation(props) {
    const [opdCardLatest, setOpdCardLatest] = useState(null);
    const [opdCardLatestLoading, setOpdCardLatestLoading] = useState(true);
    // console.log(opdCardLatest);

    const getApi = async () => {
        if (!props.patientId) return
        setOpdCardLatestLoading(true);
        let res = await GetOpdCardLatest(props.patientId);/* props.page === "6.5.5" ? props.admitId : props.patientId*/
        // console.log(res);
        setOpdCardLatest(res);
        if (props?.page === "2.2") {
            props?.fileLocation(res)
        }
        setOpdCardLatestLoading(false);
    }

    useEffect(() => {
        getApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.patientId]);
    useEffect(() => {
        if (props?.reload) {
            getApi()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props?.reload])

    // console.log(opdCardLatest);
    return (
        <>
            {!opdCardLatestLoading ?
                <>
                    {props.pageId === 'type1' ?
                        <>
                            <Row gutter={[8, 8]}>
                                <Col span={5}>
                                    <strong><label className="gx-text-primary fw-bold" style={{ fontSize: 16 }}>ตำแหน่งแฟ้มล่าสุด</label></strong>
                                </Col>
                                <Col span={5}>
                                    <strong><label className="gx-text-primary fw-bold" style={{ fontSize: 16 }}>ผู้ส่ง</label></strong>
                                </Col>
                                <Col span={5}>
                                    <strong><label className="gx-text-primary fw-bold" style={{ fontSize: 16 }}>ผู้รับ</label></strong>
                                </Col>
                                <Col span={5}>
                                    <strong><label className="gx-text-primary fw-bold" style={{ fontSize: 16 }}>ผู้บันทึก</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary fw-bold" style={{ fontSize: 16 }}>ผู้แก้ไข</label></strong>
                                </Col>
                            </Row>
                            {opdCardLatest ?
                                <>
                                    {opdCardLatest.map((val, index) => (
                                        <Row gutter={[8, 8]} key={index}>
                                            <Col span={5}>
                                                <Text><label className="data-value">{val.name ? val.name : "เวชระเบียน"}</label></Text><br />
                                                <Text><label className="data-value">{val.opdcardDate}</label></Text>
                                                <Text>{`หมายเลขแฟ้มแทน ${val.replaceId || ""}`}</Text>
                                            </Col>
                                            <Col span={5}>
                                                <Text><label className="data-value">{val.opdcardUser ? val.opdcardUser : "-"}</label></Text><br />
                                                <Text><label className="data-value">{val.opdcardUserDate ? val.opdcardUserDate : "-"}</label></Text>
                                            </Col>
                                            <Col span={5}>
                                                <Text><label className="data-value">{val.opdcardRecipient ? val.opdcardRecipient : "-"}</label></Text><br />
                                                <Text><label className="data-value">{val.opdcardReceive ? val.opdcardReceive : "-"}</label></Text>
                                            </Col>
                                            <Col span={5}>
                                                <Text><label className="data-value">{val.userCreated ? val.userCreated : "-"}</label></Text><br />
                                                <Text><label className="data-value">{val.dateCreated ? val.dateCreated : "-"}</label></Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text><label className="data-value">{val.userModified ? val.userModified : "-"}</label></Text><br />
                                                <Text><label className="data-value">{val.dateModified ? val.dateModified : "-"}</label></Text>
                                            </Col>
                                        </Row>
                                    ))}
                                </>
                                :
                                <Row gutter={8}>
                                    <Col span={5}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={5}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={5}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={5}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                </Row>
                            }
                        </>
                        :
                        <>
                            <Row gutter={8}>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >ตำเเหน่งเเฟ้ม</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >ชื่อผู้ส่ง</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >ชื่อผู้รับ</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >ผู้บันทึก</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >ผู้เเก้ไข</label></strong>
                                </Col>
                                <Col span={4}>
                                    <strong><label className="gx-text-primary" >สถานที่ลงทะเบียน</label></strong>
                                </Col>
                            </Row>
                            {opdCardLatest ?
                                <>
                                    {opdCardLatest.map((val, index) => (
                                        <Row gutter={8} key={index}>
                                            <Col span={4}>
                                                <Text>{val.name || "เวชระเบียน"}</Text><br />
                                                <Text>{val.opdcardDate}</Text>
                                                <Text>{`หมายเลขแฟ้มแทน ${val.replaceId || ""}`}</Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text>{val.opdcardUser ? val.opdcardUser : "-"}</Text><br />
                                                <Text>{val.opdcardUserDate ? val.opdcardUserDate : "-"}</Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text>{val.opdcardRecipient ? val.opdcardRecipient : "-"}</Text><br />
                                                <Text>{val.opdcardReceive ? val.opdcardReceive : "-"}</Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text>{val.userCreated ? val.userCreated : "-"}</Text><br />
                                                <Text>{val.dateCreated ? val.dateCreated : "-"}</Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text>{val.userModified ? val.userModified : "-"}</Text><br />
                                                <Text>{val.dateModified ? val.dateModified : "-"}</Text>
                                            </Col>
                                            <Col span={4}>
                                                <Text>{val.opdcardPosition || "เวชระเบียน"}</Text>
                                            </Col>
                                        </Row>
                                    ))}
                                </>
                                :
                                <Row gutter={8}>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text>-</Text>
                                    </Col>
                                </Row>
                            }
                        </>
                    }
                </>
                : []}
        </>
    )
}
