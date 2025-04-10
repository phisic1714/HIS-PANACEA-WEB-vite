import { Card, Col, Input, Row, Table } from "antd";
import { useState } from "react";

export default function SearchTable({ columns, dataSource }) {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);


    const filteredData = dataSource.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        setCurrentPage(1);
    };

    const onSelectChange = async (newSelectedRowKeys, newSelectedRows) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedRows(newSelectedRows);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <>
            <Row gutter={[8, 8]} align="middle" justify="end" style={{ marginBottom: 16 }}>
                <Col>
                    <Input.Search
                        placeholder="ค้นหา..."
                        value={searchText}
                        onChange={handleSearch}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowSelection={rowSelection}
                rowKey="key"
                scroll={{ x: 2000, y: 400 }}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: filteredData.length,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                }}
            />
        </>
    );
};