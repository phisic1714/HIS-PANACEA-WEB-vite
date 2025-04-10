import { Input, Space, Table } from "antd";
import { useState } from "react";

export default function TableSearch({ dataSource = [], buttonPart = null, ...props }) {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <>
            <Space style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                {buttonPart && <>
                    {buttonPart}
                </>}
                <Input
                    style={{ width: 300 }}
                    placeholder="ค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Space>
            <Table
                size="small"
                rowClassName={"data-value"}
                dataSource={dataSource.filter((item) =>
                    Object.values(item || {}).some((value) =>
                        String(value || '')
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    )
                )}
                {...props}
            />
        </>
    )
}