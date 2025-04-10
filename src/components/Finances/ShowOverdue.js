import React from 'react'
import { Col, Row, Statistic } from 'antd'
import dayjs from 'dayjs'

export default function ShowOverdue({ dataSource = null }) {
    return <Row gutter={[4, 4]} style={{flexDirection:"row"}}>
        <Col span={12} className='text-center'>
            <label style={{
                fontSize: 18,
                color: "red"
            }}>
                ค้างชำระล่าสุดวันที่
            </label>
            <br />
            <label style={{
                color: "red"
            }}>
                {dataSource?.dateOverdue ? dayjs(dataSource.dateOverdue).format("DD/MM/BBBB") : "-"}
            </label>
        </Col>
        <Col span={12} className='text-center'>
            <label style={{
                fontSize: 18,
                color: "red"
            }}>
                ยอดค้างชำระรวม
            </label>
            <Statistic value={dataSource?.sumOverdue || "-"} precision={2} valueStyle={{
                color: 'red',
                fontSize: 15
            }} suffix="บาท" />
        </Col>
    </Row>
}
