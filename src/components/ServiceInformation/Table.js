import React, { useState } from 'react';
import { Table } from 'antd';

export function TableData(props) {

    const [pageCurrent, setPageCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    return (
        <Table
            dataSource={props.data}
            columns={props.columns}
            loading={props.loading}
            rowKey={props.rowKey}
            pagination={{
                current: pageCurrent,
                pageSize: pageSize,
                pageSizeOptions: [5,10,20,50,100],
                total: props.data !== null ? props.data.length : 0,
                showSizeChanger: true,
                showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
            }}
            onChange={(n) => {
                setPageCurrent(n.current);
                setPageSize(n.pageSize);
            }}
        />
    )
}

export function TableAppointHistory(props) {

    const [pageCurrent, setPageCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    return (
        <Table
            style={{ cursor: "pointer" }}
            dataSource={props.data}
            columns={props.columns}
            loading={props.loading}
            pagination={{
                current: pageCurrent,
                pageSize: pageSize,
                pageSizeOptions: [5,10,20,50,100],
                total: props.data !== null ? props.data.length : 0,
                showSizeChanger: true,
                showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
            }}
            onChange={(n) => {
                setPageCurrent(n.current);
                setPageSize(n.pageSize);
            }}
            onRow={(record, rowIndex) => {
                return {
                    onClick: event => {
                        props.cilckRow(record.appointId);
                        /* setShowAppointDetailModal(!showAppointDetailModal)
                        setAppointId(record.appointId) */
                    },
                };
            }}
        />
    )
}