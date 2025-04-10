import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { Row, Button, Table, Modal } from 'antd';
import Column from 'antd/lib/table/Column';

// eslint-disable-next-line no-unused-vars
export default forwardRef (function ReceiptList({ ...props } , ref) {
    const [visibleBillList,setVisibleBillList] = useState(false);
    const [dataSource,setDataSource] = useState([]);

    useImperativeHandle(ref, () => ({
        setVisibleBillList: (props) => setVisibleBillList(props),
        setDataSource: (props) => setDataSource(props),
    }));

    return (
        <Modal
            title={<label className="topic-green-bold">รายการใบเสร็จ</label>}
            centered
            visible={visibleBillList}
            onCancel={() => { setVisibleBillList(false) }}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="cancel" onClick={() => { setVisibleBillList(false) }}>ปิด</Button>
                </Row>
            ]}
            width={940}
        >
            <Table
                scroll={{ y: 400 }}
                dataSource={dataSource}
                pagination={{
                    pageSize: 50,
                }}
            >
                <Column title={<label className="gx-text-primary">เลขที่ใบเสร็จ</label>} dataIndex="billId" 
                    render={(val) => <label className="data-value">{val}</label>}
                />
                <Column title={<label className="gx-text-primary">เล่มที่</label>} dataIndex="bookNo" 
                    render={(val) => <label className="data-value">{val}</label>}
                />
                <Column title={<label className="gx-text-primary">เลขที่</label>} dataIndex="runNo" 
                    render={(val) => <label className="data-value">{val}</label>}
                />
                <Column title={<label className="gx-text-primary">วันที่</label>} dataIndex="billDatetime" 
                    render={(val) => <label className="data-value">{val}</label>}
                />
                <Column title={<label className="gx-text-primary">ผู้บันทึก</label>} dataIndex="userCreated" 
                    render={(val) => <label className="data-value">{val}</label>}
                />
            </Table>
        </Modal>
    )
})