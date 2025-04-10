import React, { useEffect } from "react";
import { List, Button,Row,Col} from 'antd';
import {
    NotificationTwoTone
} from '@ant-design/icons';
const ContentMessenger = () => {
    useEffect(() => {
    }, [])
    return (
        <>
            <div style={{
                width: 500, height: 400,
                overflow: 'auto',
            }}>
                <List
                    header={<div>วันนี้</div>}
                    itemLayout="horizontal"
                    dataSource={[]}
                    renderItem={item => (
                        <List.Item>


                            <List.Item.Meta
                                avatar={<NotificationTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
                                }
                                title={"E-Message"}
                                description={item.message}
                            />



                        </List.Item>
                    )}
                />
                
            </div>
            <Footer/>
        </>
    )
};

const Footer = () => {
    return (
        <Row>
            <Col>
                <Button>ทดสอบ</Button>
            </Col>

        </Row>
    )
}
export default ContentMessenger;
