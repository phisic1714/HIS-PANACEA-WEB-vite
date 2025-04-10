import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Row, Col, Button, Modal, Card, Avatar, Image } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSelector } from "react-redux";

const rowCursor = {
    cursor: 'pointer',
}

export default forwardRef(function SelectOPD({ onSelectServiceId}, ref) {
    const { /* error,  */serviceList } = useSelector(({ opdPatientDetail }) => opdPatientDetail);
    const [isVisible, setIsVisible] = useState(false); /* console.log(isVisible,"isVisible"); */
    const [showLabel, setShowLabel] = useState(null);
    const [searchOpdList, setSearchOpdList] = useState([]);

    useImperativeHandle(ref, () => ({
        setIsVisible: (props) => setIsVisible(props),
        setShowLabel: (props) => setShowLabel(props),
        setSearchOpdList: (props) => setSearchOpdList(props),
    }));

    return (
        <>
            {isVisible &&
                <Modal
                    title={<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>เลือก Service</label>}
                    visible={isVisible}
                    onCancel={() => {
                        onSelectServiceId(false);
                        setIsVisible(false);
                    }}
                    footer={[
                        <Row justify="center" key="footer">
                            <Button key="ok"
                                onClick={() => {
                                    onSelectServiceId(false);
                                    setIsVisible(false);
                                }}
                            >ปิด</Button>
                        </Row>
                    ]}
                    width="580px"
                    zIndex="2000"
                    centered
                >
                    <Card
                        style={{ marginTop: -18, marginBottom: 8,backgroundColor:"#F5F5F5" }}
                    >
                        <Row gutter={[8, 8]} align="middle" style={{ marginTop: -14, marginBottom: -14 }}>
                            <Col span={4} className="text-center">
                                {serviceList[0]?.picture
                                    ? <Avatar
                                        size={64}
                                        src={<Image src={`data:image/jpeg;base64,${serviceList[0].picture}`} />}
                                    />
                                    : <Avatar size={64}>Patient</Avatar>
                                }
                            </Col>
                            <Col span={20}>
                                {serviceList.length > 0
                                    ? <Row gutter={[8, 8]} align="middle">
                                        <Col span={24}>
                                            <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
                                                {serviceList[0].displayName}
                                            </label>
                                        </Col>
                                        <Col span={24}>
                                            <label className="gx-text-primary fw-bold me-1" style={{ fontSize: 18 }}>HN</label>
                                            <label className="me-2" style={{ fontSize: 18 }}>{serviceList[0].hn}</label>
                                            <label className="gx-text-primary fw-bold me-1">เลขบัตรประชาชน</label>
                                            <label className="data-value"> {serviceList[0].idCard ? serviceList[0].idCard : "-"}</label>
                                        </Col>
                                    </Row>
                                    : null
                                }
                            </Col>
                        </Row>
                    </Card>
                    <Row gutter={[8, 8]} align="middle" className="mb-2">
                        <Col span={24}>
                            <label className="gx-text-primary fw-bold" style={{ fontSize: 17 }}>
                                Service " {serviceList?.length} " รายการ
                            </label>
                        </Col>
                    </Row>
                    <div className="p-2" style={{ backgroundColor: "#ECEFF1", borderRadius: "2px" }}>
                        <Scrollbars style={{ height: 360 }}>
                            {serviceList.map((value, index) => (
                                <div key={index} style={{ marginBottom: "-26px" }}
                                    onClick={() => {
                                        setIsVisible(false);
                                        onSelectServiceId(value, showLabel, searchOpdList, serviceList);
                                    }}>
                                    <Card style={rowCursor} bordered={false} hoverable>
                                        <Row>
                                            <Col span={12} style={{ marginBottom: "-30px", marginTop: "-8px" }}>
                                                <div >
                                                    <label className="pointer gx-text-primary fw-bold me-1">Service Id : </label>
                                                    <label className="pointer data-value"> {value.serviceId}</label>
                                                </div>
                                            </Col>
                                            <Col span={12} style={{ marginBottom: "-30px", marginTop: "-8px" }}>
                                                <div >
                                                    <label className="pointer gx-text-primary fw-bold me-1">วันที่รับบริการ :</label>
                                                    <label className="pointer data-value">{value.serviceDate}</label>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </div>
                            ))}
                        </Scrollbars>
                    </div>
                </Modal>}
        </>
    );
})

