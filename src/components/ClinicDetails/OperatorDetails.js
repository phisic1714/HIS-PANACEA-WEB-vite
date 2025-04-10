import React from 'react'
import dayjs from 'dayjs'
import { Card, Col, Row } from 'antd'
import {
    LabelText,
    LabelTopicPrimary,
} from "components/helper/function/GenLabel";
export default function OperatorDetails({
    userCreatedName = null,
    dateCreated = null,
    userModifiedName = null,
    dateModified = null,
}) {
    const dateFormatFromApi = "MM/DD/YYYY HH:mm";
    const dateFormatDsp = "DD/MM/BBBB HH:mm";
    return <div style={{
        position: "sticky",
        bottom: 0,
        zIndex: 900
    }}>
        <Card size='small' bordered={false}>
            <div style={{ margin: -4 }}>
                <Row gutter={[12, 4]} style={{ flexDirection: "row" }} align='middle'>
                    <Col>
                        <LabelTopicPrimary className="me-1" text={"ผู้บันทึก :"} />
                        <LabelText className='me-2' text={userCreatedName || "-"} />
                        <LabelText text={dateCreated ? dayjs(dateCreated, dateFormatFromApi).format(dateFormatDsp) : "-"} />
                    </Col>
                    <Col>
                        <LabelTopicPrimary className="me-1" text={"ผู้แก้ไข :"} />
                        <LabelText className='me-2' text={userModifiedName || "-"} />
                        <LabelText text={dateModified ? dayjs(dateModified, dateFormatFromApi).format(dateFormatDsp) : "-"} />
                    </Col>
                </Row>
            </div>
        </Card>
    </div>
}
