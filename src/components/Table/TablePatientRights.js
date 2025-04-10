/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, Popconfirm, Radio, Row, Table } from 'antd';
import { rowProps } from 'props';
import UpserPatientRight from "components/Modal/UpsertPatientRight";
import { find, filter } from 'lodash';
export default function TablePatientRights({
    size = "small",
    patientId,
    selectedRows = () => { },
    reloadPatientRight = false,
}) {
    // State
    const [loading, setLoading] = useState(false)
    const [loadingPatientRights, setLoadingPatientRights] = useState(false)
    const [patientRights, setPatientRights] = useState([])
    const [mainRight, setMainRight] = useState(null)
    const [listSelectedRowKey, setListSelectedRowKey] = useState([]);
    const [listSelectedRow, setListSelectedRow] = useState([]);
    const [vsbUpsertRight, setVsbUpsertRight] = useState(null)
    // Funcs
    const getPatientRights = async (patientId) => {
        if (!patientId) return setPatientRights([])
        setLoadingPatientRights(p => !p)
        const result = await callApis(apis["GetOpdRightVisit"], { patientId: patientId })
        setLoadingPatientRights(p => !p)
        setPatientRights(result)
        let filterNotExpire = filter(result, o => o.isExpire !== "Y")
        if (!filterNotExpire.length) return
        const findMainFlag = find(filterNotExpire, o => o.mainFlag === "Y")
        if (!findMainFlag) {
            setMainRight(null)
            setListSelectedRowKey([])
            setListSelectedRow([])
        } else {
            setMainRight(findMainFlag.ptRightId)
            setListSelectedRowKey([findMainFlag.ptRightId])
            setListSelectedRow([findMainFlag])
        }
    }
    const deletePatientRights = async (ptRightId) => {
        setLoading(p => !p)
        const result = await callApis(apis["DelOpdRightVisit"], { ptRightId })
        setLoading(p => !p)
        if (!result.isSuccess) return
        getPatientRights(patientId)
    }
    // Effects
    useEffect(() => {
        getPatientRights(patientId)
    }, [patientId, reloadPatientRight])
    useEffect(() => {
        selectedRows(patientRights, mainRight, listSelectedRow,)
    }, [patientRights, mainRight, listSelectedRow,])

    const PartsPatientRights = () => {
        const columns = [{
            title: <label>
                สิทธิ์
                <Button
                    className='mb-0 ms-1'
                    type="primary"
                    size={size}
                    onClick={() => setVsbUpsertRight("add")}
                >
                    เพิ่มสิทธิ์
                </Button>
            </label>,
            width: 200,
            render: val => <div>
                {val.isExpire === "Y" ? <label className="data-value-danger">{val.name}</label> : <label className="gx-text-primary">{val.name}</label>}
            </div>
        }, {
            title: "*สิทธิ์หลัก?",
            dataIndex: "ptRightId",
            align: "center",
            width: 100,
            render: (v, r) => <Radio.Group
                value={mainRight}
                disabled={r.isExpire === "Y" ? true : false}
                onChange={e => {
                    setMainRight(e.target.value);
                    const finded = find(listSelectedRowKey, o => o === v);
                    if (!finded) {
                        setListSelectedRowKey(listSelectedRowKey.concat([v]));
                        setListSelectedRow(listSelectedRow.concat([r]));
                    }
                }}>
                <Radio value={v} />
            </Radio.Group>
        }, {
            title: "ใช้สิทธิ์ล่าสุด",
            dataIndex: "max_Opd_Right",
            align: "center",
            width: 115
        }, {
            title: "หมายเลขบัตร",
            dataIndex: "insid",
            align: "center",
            width: 125
        }, {
            title: "รพ.หลัก",
            dataIndex: "hMainName",
        }, {
            title: "รพ.รอง",
            dataIndex: "hsubName",
        }, {
            title: "รพ.ที่รักษาประจำ",
            dataIndex: "hmainOpName",
        }, {
            title: "หน่วยงานต้นสังกัด",
            dataIndex: "govName",
        }, {
            title: "เลขบัตรเจ้าของสิทธิ์",
            dataIndex: "ownRightPid",
            align: "center",
            width: 175
        }, {
            title: "ความสัมพันธ์",
            dataIndex: "relinsclDesc",
            width: 110
        }, {
            title: "วันที่เริ่มต้น",
            dataIndex: "startDate",
            align: "center",
            width: 100
        }, {
            title: "วันที่สิ้นสุด",
            dataIndex: "expireDate",
            align: "center",
            width: 100
        },
        {
            title: "วันที่สร้าง",
            dataIndex: "dateCreated",
            align: "center",
            width: 100
        },
        {
            title: "สร้างโดย",
            dataIndex: "userCreated",
        },
        {
            title: "ผู้แก้ไข",
            dataIndex: "userModifiedDesc"
        }, {
            title: "วันที่แก้ไข",
            dataIndex: "dateModified",
            width: 100,
            align: "center"
        },
        {
            title: "",
            dataIndex: "ptRightId",
            align: "center",
            fixed: "right",
            width: 75,
            render: val => <Row {...rowProps}>
                <Col span={12}>
                    <Button
                        size={size}
                        className='m-0'
                        icon={<EditOutlined style={{
                            color: "blue"
                        }} />}
                        onClick={() => {
                            setVsbUpsertRight(val);
                        }} />
                </Col>
                <Col span={12}>
                    <Popconfirm
                        title="ลบรายการ ？"
                        okText="Yes"
                        onConfirm={() => {
                            deletePatientRights(val);
                        }}
                        cancelText="No">
                        <Button style={{
                            margin: 0
                        }} icon={<DeleteOutlined
                            style={{
                                color: "red"
                            }} />}
                            size={size}
                        />
                    </Popconfirm>
                </Col>
            </Row>
        }];
        const rowSelection = {
            selectedRowKeys: listSelectedRowKey,
            onChange: (selectedRowKeys, selectedRows) => {
                setListSelectedRowKey(selectedRowKeys);
                setListSelectedRow(selectedRows);
                if (!selectedRowKeys.length) {
                    setMainRight(null)
                } else {
                    if (!mainRight) setMainRight(selectedRowKeys[0])
                }
            },
            getCheckboxProps: record => ({
                disabled: record.isExpire === "Y"
            })
        };
        return <Table
            loading={loadingPatientRights || loading}
            size={size}
            columns={columns}
            dataSource={patientRights}
            rowKey={"ptRightId"}
            rowClassName={"data-value"}
            rowSelection={{ ...rowSelection }}
            scroll={{ x: 2400, y: 200 }}
        />
    }
    return <>
        {PartsPatientRights()}
        <UpserPatientRight
            open={vsbUpsertRight}
            close={() => setVsbUpsertRight(null)}
            success={bool => {
                if (bool) {
                    getPatientRights(patientId);
                    setVsbUpsertRight(null);
                }
            }}
            patientId={patientId}
            ptRightId={vsbUpsertRight === "add" ? null : vsbUpsertRight}
        />
    </>
}
const apis = {
    GetOpdRightVisit: {
        url: "OpdRightVisit/GetOpdRightVisit",
        method: "POST",
        return: "responseData",
        sendRequest: true
    },
    DelPatientsRights: {
        url: "OpdRightVisit/DelPatientsRights?PtRightId=",
        method: "DELETE",
        return: "data",
        sendRequest: false
    },
}