import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Row, Col, Button, Modal, Card, Avatar, Image, Divider } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSelector } from "react-redux";

const rowCursor = {
    cursor: 'pointer',
}

export default forwardRef(function SelectOPD({ onSelectServiceId }, ref) {
    const { /* error,  */serviceList } = useSelector(({ opdPatientDetail }) => opdPatientDetail);
    const [isVisible, setIsVisible] = useState(false); /* console.log(isVisible,"isVisible"); */
    const [showLabel, setShowLabel] = useState(null);
    const [searchOpdList, setSearchOpdList] = useState([]);

    useImperativeHandle(ref, () => ({
        setIsVisible: (props) => setIsVisible(props),
        setShowLabel: (props) => setShowLabel(props),
        setSearchOpdList: (props) => setSearchOpdList(props),
    }));
    // console.log('isVisible :>> ', isVisible);

    return (
        <>
            {isVisible &&
                <Modal
                    title={<label className="gx-text-primary">เลือกรายการ Service ที่ต้องการ</label>}
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
                    <Row align="middle">
                        <Col span={7} className="text-end pb-2">
                            {serviceList[0]?.picture
                                ? <Avatar
                                    size={85}
                                    src={<Image src={`data:image/jpeg;base64,${serviceList[0].picture}`} />}
                                />
                                : <Avatar size={85}>Patient</Avatar>
                            }
                        </Col>
                        <Col span={17} className='pb-2'>
                            {serviceList.length > 0 &&
                                <Row gutter={[4, 8]}>
                                    <Col span={3} className='text-end'>
                                        <label className="topic-blue">HN : </label>
                                    </Col>
                                    <Col span={20}>
                                        <label className="data-value me-3"> {serviceList[0].hn}</label>
                                        <label className="topic-blue me-1">เลขบัตรประชาชน : </label>
                                        <label className="data-value"> {serviceList[0].idCard ? serviceList[0].idCard : "-"}</label>
                                    </Col>
                                    <Col span={3} className='text-end'>
                                        <label className="gx-text-primary">ชื่อ : </label>
                                    </Col>
                                    <Col span={20}>
                                        <label className="data-value"> {serviceList[0].displayName}</label>
                                    </Col>
                                </Row>
                            }
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24} className='mb-2'>
                            <label className='topic-green'>Service ทั้งหมด "{serviceList?.length}" รายการ</label>
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
                                                    <label className="pointer gx-text-primary me-1">Service Id : </label>
                                                    <label className="pointer data-value"> {value.serviceId}</label>
                                                </div>
                                            </Col>
                                            <Col span={12} style={{ marginBottom: "-30px", marginTop: "-8px" }}>
                                                <div >
                                                    <label className="pointer gx-text-primary me-1">วันที่รับบริการ :</label>
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

