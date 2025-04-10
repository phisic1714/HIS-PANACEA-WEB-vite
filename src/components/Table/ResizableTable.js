// ResizableTable.js
import { Table } from 'antd';
import { useState, useEffect } from 'react';
import ResizableTitle from './ResizableTitle';

export default function ResizableTable({ initialColumns, dataSource, rerender = false, ...props }) {
    const [columns, setColumns] = useState(initialColumns);
    const handleResize = index => (e, { size }) => {
        setColumns(prevColumns => {
            const nextColumns = [...prevColumns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return nextColumns;
        });
    };
    const resizableColumns = columns.map((col, index) => ({
        ...col,
        onHeaderCell: column => ({
            width: column.width,
            onResize: handleResize(index),
        }),
    }));
    useEffect(() => {
        setColumns(p => p.map((o, i) => {
            const updatedColumn = initialColumns[i]
            return {
                ...updatedColumn,
                width: o.width,
            }
        }))
    }, [rerender])


    const components = {
        header: {
            cell: ResizableTitle,
        },
    };
    return (
        <Table bordered components={components} columns={resizableColumns} dataSource={dataSource} {...props} />
    );
};
