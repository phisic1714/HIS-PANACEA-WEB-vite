import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Row, Col, Button, Modal, Card, Avatar, Image } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSelector } from "react-redux";

const rowCursor = {
    cursor: 'pointer',
}

export default forwardRef(function SelectIPD({ onSelectAn }, ref) {
    const { /* error,  */admitList } = useSelector(({ patient }) => patient);
    const [isVisible, setIsVisible] = useState(false);
    const [searchIpdList, setSearchIpdList] = useState([]);

    useImperativeHandle(ref, () => ({
        setIsVisible: (props) => setIsVisible(props),
        setSearchIpdList: (props) => setSearchIpdList(props)
    }));

    return (
        <>
            {isVisible
                ? <Modal
                    title={<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>เลือก AN</label>}
                    visible={isVisible}
                    onCancel={() => {
                        onSelectAn(false);
                        setIsVisible(false);
                    }}
                    footer={[
                        <Row justify="center" key="footer">
                            <Button key="ok"
                                onClick={() => {
                                    onSelectAn(false);
                                    setIsVisible(false);
                                }}
                            >ปิด</Button>
                        </Row>
                    ]}
                    width="580px"
                    zIndex="2000"
                    centered
                >
                    <Card style={{ backgroundColor: "#F5F5F5", marginTop: -14, marginBottom: 8 }}>
                        <Row gutter={[8, 8]} align="middle" style={{ marginTop: -14, marginBottom: -14 }}>
                            <Col span={5} className="text-center">
                                {admitList[0]?.picture
                                    ? <Avatar
                                        size={64}
                                        src={<Image src={`data:image/jpeg;base64,${admitList[0].picture}`} />}
                                    />
                                    : <Avatar size={64}>Patient</Avatar>
                                }
                            </Col>
                            <Col span={19}>
                                {admitList.length > 0 &&
                                    <Row gutter={[4, 8]}>
                                        <Col span={24}>
                                            <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
                                                ชื่อ : {admitList[0].displayName || "-"}
                                            </label>
                                        </Col>
                                        <Col span={24}>
                                            <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>HN</label>
                                            <label className="ms-1 me-2" style={{ fontSize: 18 }}> {admitList[0].hn}</label>
                                            <label className="gx-text-primary fw-bold me-1" style={{ fontSize: 18 }}>Id Card</label>
                                            <label style={{ fontSize: 18 }}>{admitList[0].idCard ? admitList[0].idCard : "-"}</label>
                                        </Col>
                                    </Row>
                                }
                            </Col>
                        </Row>
                    </Card>
                    <Row gutter={[8, 8]} className="mb-1">
                        <Col span={24}>
                            <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>Admit ทั้งหมด " {admitList?.length} " รายการ</label>
                        </Col>
                    </Row>
                    <div className="p-2" style={{ backgroundColor: "#ECEFF1", borderRadius: "2px" }}>
                        <Scrollbars style={{ height: 360 }}>
                            {admitList.map((value, index) => (
                                <div key={index} style={{ marginBottom: "-26px" }}
                                    onClick={() => {
                                        setIsVisible(false);
                                        onSelectAn(value, searchIpdList, admitList);
                                    }}>
                                    <Card style={rowCursor} bordered={false} hoverable>
                                        <Row>
                                            <Col span={10} style={{ marginBottom: "-30px", marginTop: "-8px" }}>
                                                <div >
                                                    <label className="pointer gx-text-primary fw-bold me-1">AN : </label>
                                                    <label className="pointer data-value"> {value.an}</label>
                                                </div>
                                            </Col>
                                            <Col span={14} style={{ marginBottom: "-30px", marginTop: "-8px" }}>
                                                <div >
                                                    <label className="pointer gx-text-primary fw-bold me-1">วันที่ Admit : </label>
                                                    <label className="pointer data-value"> {value.admitDate} - {value.dischDate}</label>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </div>
                            ))}
                        </Scrollbars>
                    </div>
                </Modal>
                : null
            }
        </>
    );
})

