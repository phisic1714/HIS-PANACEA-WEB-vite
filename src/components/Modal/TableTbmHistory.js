import React from 'react'
import { Table, Modal } from 'antd'
import dayjs from 'dayjs'

export default function TableTbmHistory({
    visible = false,
    setVisible = () => { },
    dataSource = [],
    fieldName = ""
}) {
    const PartsTable = () => {
        const columns = [
            {
                title: 'ข้อมูลเดิม',
                dataIndex: 'oldData',
            },
            {
                title: 'ข้อมูลที่แก้ไข',
                dataIndex: 'newData',
            },
            {
                title: 'วันที่แก้ไข',
                dataIndex: 'dateCreated',
                width: 125,
                align: 'center',
                render: (v) => {
                    return dayjs(v, "MM/DD/YYYY HH:mm:ss").format("DD/MM/BBBB HH:mm")
                }
            },
            {
                title: 'ผู้แก้ไข',
                dataIndex: 'userCreated',
            },
        ]
        return <Table
            size='small'
            rowClassName="data-value"
            pagination={false}
            scroll={{ y: 345 }}
            dataSource={dataSource}
            columns={columns}
        />
    }
    return <Modal
        title={<label className='gx-text-primary fw-bold fs-5'>{`ประวัติการแก้ไขข้อมูล : ${fieldName}`}</label>}
        centered
        width={1000}
        closable={false}
        closeIcon={false}
        visible={visible}
        onCancel={() => setVisible(false)}
        cancelText={"ปิด"}
        okButtonProps={{
            hidden: true,
        }}
    >
        <div style={{ margin: -20 }}>
            {PartsTable()}
        </div>
    </Modal>
}