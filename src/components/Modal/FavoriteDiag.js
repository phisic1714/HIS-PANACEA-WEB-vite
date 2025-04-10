import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import {filter, map ,uniq ,uniqBy ,difference,differenceBy} from "lodash"
import {
    Row, Col, Button, Spin, Table, Input, Modal, Radio, Form
} from "antd";
import {
    labelTopicPrimary,
} from "../helper/function/GenLabel"
import { callApis } from "../helper/function/CallApi"
import { SettingOutlined } from '@ant-design/icons';
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function FavoriteDiag({
    rows = 20,
    open = false,
    close = () => { console.log('close :>> '); },
    onFinish = () => { console.log('onFinish :>> '); },
}) {
    const history = useHistory();
    // Form
    const [form] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [dataSource, setDataSource] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    // console.log('selectedRowKeys', selectedRowKeys)
    // console.log('selectedRows', selectedRows)
    const getDataSource = async (dts) => {
        const req = {
            "page": page,
            "row": rows,
            "userId": dts?.useType === "A" ? user : null,
            "search": dts?.search || null,
        }
        setLoading(p => !p)
        const res = await callApis(apis["GetDocFavDiags"], req)
        setLoading(p => !p)
        // console.log('GetDocFavDiags', res)
        setTotal(res?.totalCount)
        setDataSource(res?.results)
    }
    const onFinishSearch = (v) => {
        getDataSource(v)
    }
    // Effect
    useEffect(() => {
        if (open) return form.submit()
    }, [open])
    const PartsFormSearch = () => {
        return <Form
            form={form}
            onFinish={onFinishSearch}
            layout='vertical'
            initialValues={{
                useType: "B"
            }}
        >
            <Row gutter={[4, 4]} style={{ flexDirection: "row" }} align='middle'>
                <Col span={8}>
                    <Form.Item className='m-0' name="search">
                        <Input.Search
                            size='small'
                            className='mb-0'
                            allowClear
                            onSearch={() => {
                                setPage(1)
                                setTimeout(() => {
                                    form.submit()
                                }, 300);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item className='m-0' name="useType">
                        <Radio.Group
                            onChange={() => {
                                setPage(1)
                                setTimeout(() => {
                                    form.submit()
                                }, 300);
                            }}
                        >
                            <Radio value="A">
                                <label className="gx-text-primary fw-bold">เฉพาะตัว</label>
                            </Radio>
                            <Radio value="B">
                                <label className="gx-text-primary fw-bold">ใช้ร่วมกัน</label>
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    }
    const TableFavoriteDiagnosis = () => {
        const columns = [
            {
                title: labelTopicPrimary(""),
                dataIndex: "diag",
                width: 300,
            },
            {
                title: labelTopicPrimary("ICD10"),
                dataIndex: "",
                render: (val, record,) => {
                    return <label>{record.icd + " " + record.icdName}</label>;
                },
            },
            {
                title: labelTopicPrimary("STATUS"),
                dataIndex: "status",
                width: 115,
                align: "center",
                render: (val) => {
                    let status = {
                        R: "REJECTED",
                        A: "APPROVED",
                    };
                    let color = {
                        R: "red",
                        A: "green",
                    };
                    return (
                        <label style={val ? { color: color[val] } : { color: "#fbc02d" }}>
                            {val ? status[val] : "รอ APPROVE"}
                        </label>
                    );
                },
            },
        ];
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onSelect: (record, selected) => {
                if (selected) {
                    setSelectedRows(p => [...p, record]);
                    setSelectedRowKeys(p => [...p, record.favDiagId]);
                } else {
                    setSelectedRows(p => filter(p, i => i?.favDiagId !== record.favDiagId));
                    setSelectedRowKeys(p => filter(p, i => i !== record.favDiagId));
                }
            },
            onSelectAll: (selected, selectedRows) => {
                // console.log('selected', selected)
                // console.log('selectedRows', selectedRows)
                const filterNoUndefined = filter(selectedRows, o => o !== undefined)
                let selectedRowKeys = []
                if (selected) {
                    selectedRowKeys = map(filterNoUndefined, "favDiagId")
                    setSelectedRowKeys(p => uniq([...p, ...selectedRowKeys]))
                    setSelectedRows(p => uniqBy([...p, ...filterNoUndefined], "favDiagId"))
                } else {
                    selectedRowKeys = map(dataSource, "favDiagId")
                    setSelectedRowKeys(p => difference(p, selectedRowKeys))
                    setSelectedRows(p => differenceBy(p, dataSource, "favDiagId"))
                }
            }
        };
        return (
            <>
                {PartsFormSearch()}
                <Row gutter={[8, 8]} style={{ marginBottom: -32 }}>
                    <Table
                        size='small'
                        scroll={{ y: 370 }}
                        columns={columns}
                        dataSource={dataSource}
                        rowSelection={{ ...rowSelection }}
                        rowKey="favDiagId"
                        rowClassName="data-value"
                        pagination={{
                            current: page,
                            pageSize: 50,
                            showSizeChanger: false,
                            total: total,
                        }}
                        onChange={(n) => {
                            setPage(n.current);
                            setTimeout(() => {
                                form.submit()
                            }, 300);
                        }}
                    />
                </Row>
            </>
        );
    };

    return (
        <Modal
            title={
                <Row gutter={[8, 8]} align="middle">
                    <Col span={12}>
                        <label
                            className="gx-text-primary fw-bold"
                            style={{ fontSize: 18 }}
                        >
                            Favorite Diagnosis
                        </label>
                    </Col>
                    <Col span={12} className="text-end">
                        <Button
                            size='small'
                            type="primary"
                            style={{ margin: 0, marginRight: 22 }}
                            icon={<SettingOutlined />}
                            onClick={() => {
                                history.push({
                                    pathname:
                                        "/doctor clinic/doctor-clinic-doctor-favorite-diagnosis",
                                });
                            }}
                        />
                    </Col>
                </Row>
            }
            centered
            visible={open}
            onCancel={() => close()}
            width={920}
            footer={
                <div className="text-center">
                    <Button
                        onClick={() => close()}
                    >
                        ปิด
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            onFinish(selectedRows)
                            close();
                        }}
                        disabled={selectedRows === 0}
                    >
                        ตกลง
                    </Button>
                </div>
            }
        >
            <Spin spinning={loading}>
                {TableFavoriteDiagnosis()}
            </Spin>
        </Modal>
    )
}
const apis = {
    GetDocFavDiags: {
        url: "OpdExamination/doc-fav-diags-list-by-userid",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}