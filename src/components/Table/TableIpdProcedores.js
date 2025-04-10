import { DeleteOutlined, PlusOutlined, } from "@ant-design/icons";
import {
    Button,
    Collapse,
    Form, Input,
    InputNumber,
    Popconfirm,
    Select,
    Table
} from 'antd';
import Column from "antd/lib/table/Column";
import DayjsDatePicker from "components/DatePicker/DayjsDatePicker";
import AutoCompleteIcdDocFav from 'components/Input/AutocompleteIcdDocFav';
import SelectIcdDocFav from 'components/Input/SelectIcdDocFav';
import dayjs from "dayjs";
import { differenceBy, map } from "lodash";
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { LabelTopicPrimary, } from "../helper/function/GenLabel";
const { Panel } = Collapse;

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function TableIpdProcedores({
    form,
    onFinish,
    size = "small",
    // optionsUsers = [],
    optionsDoctor = [],
    ...props
}) {
    // State
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    // Funcs
    const handleDeleteSelectedRows = () => {
        const procedures = form.getFieldValue("procedures")
        form.setFieldsValue({
            procedures: differenceBy(procedures, selectedRows, "key")
        })
    }
    // Components 
    const PartsTableForm = () => {
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                setSelectedRowKeys(selectedRowKeys)
                setSelectedRows(selectedRows)
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                // console.log(selected, selectedRows, changeRows);
                setSelectedRowKeys(map(selectedRows, "key"))
                setSelectedRows(selectedRows)
            },
        };
        const marginLR = { marginLeft: -4, marginRight: -4 }
        return <Form form={form} onFinish={onFinish} {...props}>
            <Form.List name="procedures">
                {(procedures, { add, remove }) => {
                    const procedureValues = form.getFieldValue("procedures") || []
                    procedures = procedures.map((val, index) => {
                        const crrRow = procedureValues[index] || {};
                        return {
                            ...val,
                            ...crrRow,
                            key: crrRow?.key,
                            index: index,
                        };
                    });
                    return <div style={{ margin: -14 }}>
                        <div
                            hidden={procedures?.length}
                            className="text-center pt-1 pb-1"
                            style={{ backgroundColor: "#fafafa" }}
                        >
                            <label style={{ color: "#BDBDBD" }}>ไม่มีข้อมูล</label>
                        </div>
                        <Button
                            hidden
                            id="add-ipd-procedure-11-16"
                            size="small"
                            style={{ margin: 0 }}
                            type="primary"
                            onClick={() => {
                                add({ ipdProcedId: null, doctor: user, key: nanoid(), startDate: dayjs(), finishedDate: dayjs() }, 0)
                            }}
                            disabled={form.getFieldValue("drgLockFlag")}
                        >
                            เพิ่มรหัสโรค
                        </Button>

                        <div hidden={!procedures?.length}>
                            <Table
                                // loading={diagLoading}
                                size={size}
                                scroll={{ x: 1100, y: 200 }}
                                dataSource={procedures}
                                pagination={false}
                                rowClassName="data-value"
                                rowSelection={rowSelection}
                            >
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">No.</label>
                                    }
                                    fixed="left"
                                    width={50}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <>
                                                <Form.Item name={[name, "seq"]} hidden>
                                                    <Input value={name + 1} />
                                                </Form.Item>
                                                <label>{name + 1}</label>
                                            </>
                                        );
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *ICD9CM
                                        </label>
                                    }
                                    // fixed="left"
                                    width={100}
                                    render={(v, r) => {
                                        const i = r.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[i, "icd"]}
                                                style={{ margin: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "จำเป็น"
                                                    }
                                                ]}
                                            >
                                                <SelectIcdDocFav
                                                    codeset='OP'
                                                    onChange={(v, detail) => {
                                                        form.setFields([
                                                            { name: ["procedures", i, "isEdit"], value: true },
                                                            { name: ["procedures", i, "icd"], value: detail?.icd },
                                                            { name: ["procedures", i, "procedure"], value: detail?.dx },
                                                        ]);
                                                    }}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *Procedures/operation
                                        </label>
                                    }
                                    render={(v, r) => {
                                        const i = r.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[i, "procedure"]}
                                                style={{ margin: 0 }}
                                            >
                                                <AutoCompleteIcdDocFav
                                                    codeset="OP"
                                                    value={form.getFieldValue("procedures")[i].procedure}
                                                    onChange={(v) => {
                                                        form.setFields([
                                                            { name: ["procedures", i, "procedure"], value: v, },
                                                            { name: ["procedures", i, "isEdit"], value: true },
                                                        ]);
                                                    }}
                                                    onSelect={(v, detail) => {
                                                        form.setFields([
                                                            { name: ["procedures", i, "isEdit"], value: true },
                                                            { name: ["procedures", i, "procedure"], value: detail?.procedure },
                                                        ]);
                                                        if (!r.icd) {
                                                            form.setFields([
                                                                { name: ["procedures", i, "icd"], value: detail?.icd },
                                                            ]);
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            ราคา
                                        </label>
                                    }
                                    // align="right"
                                    width={80}
                                    render={(text, r) => {
                                        const name = r.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[name, "price"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    stringMode
                                                    className="data-value"
                                                    disabled={form.getFieldsValue()?.drgLockFlag}
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            Ext.
                                        </label>
                                    }
                                    // align="right"
                                    width={60}
                                    render={(text, record) => {
                                        const name = record.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[name, "extension"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <Input
                                                    style={{ width: "100%" }}
                                                    className="data-value"
                                                    disabled={form.getFieldsValue()?.drgLockFlag}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *ผู้ทำหัตถการ
                                        </label>
                                    }
                                    width={160}
                                    render={(text, record) => {
                                        const name = record.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[name, "doctor"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "กรุณาเลือกผู้ทำ !",
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    style={{ width: "100%" }}
                                                    allowClear
                                                    showSearch
                                                    optionFilterProp="label"
                                                    dropdownMatchSelectWidth={280}
                                                    className="data-value"
                                                    disabled={form.getFieldsValue()?.drgLockFlag}
                                                    options={optionsDoctor}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *วัน/เวลา เริ่ม
                                        </label>
                                    }
                                    // align="right"
                                    width={165}
                                    render={(text, record) => {
                                        const name = record.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[name, "startDate"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "กรุณาระบุวัน/เวลา เริ่ม",
                                                    },
                                                ]}
                                            >
                                                <DayjsDatePicker
                                                    form={form}
                                                    name="startDate"
                                                    allowClear={false}
                                                    isFormList={true}
                                                    listIndex={name}
                                                    listName='procedures'
                                                    disabled={form.getFieldValue("drgLockFlag")}
                                                    format='DD/MM/YYYY HH:mm'
                                                    showTime={true}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *วัน/เวลา สิ้นสุด
                                        </label>
                                    }
                                    // align="right"
                                    width={165}
                                    render={(text, record) => {
                                        const name = record.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item
                                                name={[name, "finishedDate"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "กรุณาระบุวัน/เวลา สั้นสุด",
                                                    },
                                                ]}
                                            >
                                                <DayjsDatePicker
                                                    form={form}
                                                    name="finishedDate"
                                                    allowClear={false}
                                                    isFormList={true}
                                                    listIndex={name}
                                                    listName='procedures'
                                                    disabled={form.getFieldValue("drgLockFlag")}
                                                    format='DD/MM/YYYY HH:mm'
                                                    showTime={true}
                                                />
                                            </Form.Item>
                                        </div>
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold"> </label>
                                    }
                                    width={50}
                                    align="center"
                                    fixed="right"
                                    render={(text, record) => {
                                        const name = record.index
                                        return <div style={{ ...marginLR }}>
                                            <Form.Item name={[name, "ipdProcedId"]} hidden>
                                                <Input />
                                            </Form.Item>
                                            <Popconfirm
                                                title="ลบ ?"
                                                okText="ยืนยัน"
                                                cancelText="ปิด"
                                                onConfirm={(e) => {
                                                    e.stopPropagation()
                                                    remove(name);
                                                }}
                                                disabled={form.getFieldsValue()?.drgLockFlag}
                                            >
                                                <Button
                                                    size="small"
                                                    icon={
                                                        <DeleteOutlined style={{ color: "red" }} />
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                    }}
                                                    style={{ margin: 0 }}
                                                    disabled={form.getFieldsValue()?.drgLockFlag}
                                                />
                                            </Popconfirm>
                                        </div>
                                    }}
                                />
                            </Table>
                        </div>
                    </div>
                }}
            </Form.List>
        </Form>
    }
    return <>
        <Collapse
            // bordered={false}
            defaultActiveKey={['1']}
        >
            <Panel
                key="1"
                header={<LabelTopicPrimary text='หัตถการICD9' />}
                extra={
                    <div
                        className='text-end'
                        style={{ width: 200 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Popconfirm
                            title="ลบที่เลือก ?"
                            okText="ยืนยัน"
                            cancelText="ปิด"
                            onConfirm={(e) => {
                                e.stopPropagation()
                                handleDeleteSelectedRows()
                            }}
                            disabled={!selectedRowKeys.length}
                        >
                            <Button
                                size="small"
                                style={{ margin: 0, marginRight: 4 }}
                                type="danger"
                                disabled={!selectedRowKeys.length}
                                onClick={e => e.stopPropagation()}
                            >
                                ลบที่เลือก
                            </Button>
                        </Popconfirm>
                        <Button
                            type='primary'
                            className='m-0'
                            size={size}
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                                e.stopPropagation()
                                document.getElementById("add-ipd-procedure-11-16").click()
                            }}
                        />
                    </div>
                }
            >
                {PartsTableForm()}
            </Panel>
        </Collapse>
    </>
}