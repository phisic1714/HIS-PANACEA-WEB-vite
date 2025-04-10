import React, { useState, useEffect } from 'react'
import {map,filter ,intersectionBy} from "lodash";
import { useHistory } from "react-router-dom";
import { Modal, Table, Form, Input, Row, Col, Radio, Button } from 'antd'
import { callApi } from 'components/helper/function/CallApi';
import {
    LabelTopicPrimary,
} from "components/helper/function/GenLabel"
import { PlusOutlined } from '@ant-design/icons';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function FavoriteProcedures({
    visible = false,
    close = () => { },
    onSave = () => { }
}) {
    const history = useHistory();
    // Form
    const [form] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [optionsDocFav, setOptionsDocFav] = useState([])
    const [optionsDocFavFilter, setOptionsDocFavFilter] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [page, setPage] = useState(1)
    // Funcs
    const getDocFavProcList = async () => {
        const req = {
            favProcedId: null,
            userId: null,
            proced: null,
            icd: null,
        }
        setLoading(true)
        let res = await callApi(listApi, "GetDocFavProcList", req)
        setLoading(false)
        // console.log('GetDocFavProcList :>> ', res);
        res = map(res, o => {
            const icdDsp = `${o.icd} ${o.icdName}`
            return {
                ...o,
                icdDsp: icdDsp,
            }
        })
        setOptionsDocFav(res)
        setOptionsDocFavFilter(res)
    }
    const onFinish = (dts) => {
        // console.log('onFinish :>> ', dts);
        const keyword = dts?.keyword || null
        const useType = dts?.useType || null
        let temp = [...optionsDocFav]
        if (useType === "2") temp = filter(temp, ["userId", user])
        if (keyword) temp = filter(temp, o => o?.proced?.toLowerCase().includes(keyword) || o?.icdName?.toLowerCase().includes(keyword))
        setOptionsDocFavFilter(temp)
        setPage(1)
    }
    const handleSave = (selected) => {
        const mapping = map(selected, o => {
            return { favProcedId: o }
        })
        const intersect = intersectionBy(optionsDocFav, mapping, "favProcedId")
        onSave(intersect)
        close()
    }
    // Effect
    useEffect(() => {
        if (visible) getDocFavProcList(null)
    }, [visible])
    // Components
    const PartsForm = () => {
        return <Form
            form={form}
            onFinish={onFinish}
            layout='vertical'
            initialValues={{
                useType: "1"
            }}
        >
            <Row gutter={[8, 8]} style={{ flexDirection: "row" }} align='middle' className='mt-2'>
                <Col>
                    <Form.Item
                        style={{ margin: 0 }}
                        name="keyword"
                    >
                        <Input.Search
                            allowClear
                            placeholder='ระบุคำค้นหา'
                            onSearch={() => form.submit()}
                            onChange={(v) => {
                                if (!v) form.submit()
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col>
                    <Form.Item
                        style={{ margin: 0 }}
                        name="useType"
                    >
                        <Radio.Group onChange={() => form.submit()}>
                            <Radio value={"1"}>ใช้ร่วมกัน</Radio>
                            <Radio value={"2"}>เฉพาะตัว</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
                <Col>
                    <LabelTopicPrimary text='รายการที่เลือก' className='me-2' />
                    <LabelTopicPrimary text={selectedRowKeys.length} />
                </Col>
            </Row>
        </Form>
    }
    const PartsTable = () => {
        const columns = [
            {
                title: "หัตถการ",
                dataIndex: "proced",
                width: 300,
            },
            {
                title: "ICD",
                dataIndex: "icdDsp",
                // width: 200,
            },
        ]
        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                setSelectedRowKeys(selectedRowKeys)
            },
        }
        return <Table
            scroll={{ y: 300 }}
            rowSelection={{ ...rowSelection, }}
            columns={columns}
            dataSource={optionsDocFavFilter}
            rowClassName="data-value"
            rowKey="favProcedId"
            pagination={{
                current: page,
                pageSize: 5,
                onChange: (page,) => setPage(page)
            }}
        />
    }
    return <Modal
        title={<Row gutter={[8, 8]} align="middle" style={{ marginTop: -10, marginBottom: -10 }}>
            <Col span={12}>
                <label
                    className="gx-text-primary fw-bold"
                    style={{ fontSize: 18 }}
                >
                    Favorite procedure
                </label>
            </Col>
            <Col span={12} className="text-end">
                <Button
                    style={{ margin: 0, marginRight: 22 }}
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={e => {
                        e.stopPropagation()
                        history.push({ pathname: "/doctor clinic/doctor-clinic-doctor-favorite-procedure", });
                    }}
                >
                    เพิ่ม Favorite
                </Button>
            </Col>
        </Row>}
        centered
        visible={visible}
        width={800}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => handleSave(selectedRowKeys)}
        onCancel={() => close()}
        okButtonProps={{
            loading: loading,
            disabled: !selectedRowKeys.length
        }}
    >
        <div style={{ margin: -18, height: 418 }}>
            {PartsForm()}
            {PartsTable()}
        </div>
    </Modal>
}
const listApi = [
    // GetDocFavProcList
    {
        name: "GetDocFavProcList",
        url: "DoctorOutpatientCare/GetDocFavProcList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
]
