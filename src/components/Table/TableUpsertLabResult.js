/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { callApis } from '../helper/function/CallApi';
import {
    Card, Col, Row, Spin, Form, Table,
    Popconfirm, Tooltip, Input, Select,
    InputNumber, Button, Modal, notification
} from 'antd';
import { map, find, filter, differenceBy } from 'lodash';
import dayjs from 'dayjs';
import backInTime from '@iconify/icons-entypo/back-in-time';
import { Icon } from '@iconify/react';
import { DeleteOutlined, EditOutlined, FileImageOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import { cleanBase64String, extractFileExtension, extractFileName } from 'util/GeneralFuctions';
import UploadFileComponent from 'components/UploadFile/UploadFileComponent';
// const { Panel } = Collapse;
const { Option } = Select;
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
// const { hospCode } = JSON.parse(localStorage.getItem("hos_param"));
// const userDetails = userFromSession.responseData;
const userId = userFromSession.responseData.userId;
export default function TableUpsertLabResult({
    patientId = null,
    gender = null,
    orderId = null,
    financeId = null,
}) {
    // Form
    const [formTable] = Form.useForm();
    const [formEditAble] = Form.useForm()
    // Watch
    const reasonEdit = Form.useWatch("reasonEdit", formEditAble)
    const listName = Form.useWatch("listName", formEditAble)
    const index = Form.useWatch("index", formEditAble)
    // State
    const [loading, setLoading] = useState(false);
    const [optionsLabResult, setOptionsLabResult] = useState([]);
    console.log('optionsLabResult', optionsLabResult)
    const [listLabResultStatus, setListLabResultStatus] = useState([])
    const [listLabResultId, setListLabResultId] = useState([])
    const [labResultId, setLabResultId] = useState(null)
    const [activeFinanceId, setActiveFinanceId] = useState(null)
    const [activeIndexId, setActiveIndexId] = useState(null)
    const [isVisibleImgModal, setIsVisibleImgModal] = useState(false)
    const [editingLabResult, setEditingLabResult] = useState(null)
    const [isVisibleModalLabHis, setIsVisibleModalLabHis] = useState(false)
    const [listLabResultLogsHis, setListLabResultLogsHis] = useState([])
    const [editModal, setEditModal] = useState(false)
    const [listImgLab, setListImgLab] = useState([])
    const [oldListImgLab, setOldListImgLab] = useState([])
    const [loadingUploadImg, setLoadingUploadImg] = useState(false)
    // Funcs
    const getLabResult = async () => {
        if (!orderId) return
        setLoading(p => !p)
        const res = await callApis(apis["GetLabResultList"], { orderId, patientId });
        setLoading(p => !p)
        console.log('getLabResult', res)
        setOptionsLabResult(filter(res, ["financeId", financeId]))
        let listLabResult = [];
        map(res, o => {
            let listResult = o?.labResultLists || [];
            listLabResult.push(...listResult);
        });
        setListLabResultId(listLabResult || [])
    }
    const getDD = async () => {
        let [
            labResultStatus,
        ] = await Promise.all([
            callApis(apis["GetLabServeritiesMas"]),
        ])
        setListLabResultStatus(labResultStatus)
    }
    const handleClickLabResultLogs = async (labResultId) => {
        setLoading(true)
        let res = await callApis(apis["GetLabResultLogsHistory"], labResultId)
        setListLabResultLogsHis(res || [])
        setIsVisibleModalLabHis(true)
        setLoading(false)
    }
    const manageImgWithFileType = async (list, lastLabResultId = null) => {
        const convertBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);

                fileReader.onload = () => {
                    resolve(fileReader.result);
                };

                fileReader.onerror = (error) => {
                    reject(error);
                };
            });
        };

        let res = await Promise.all(
            list.map(async (item) => {
                let converted = await convertBase64(item.originFileObj)
                return {
                    labResultId: lastLabResultId ? lastLabResultId : labResultId,
                    picture: cleanBase64String(converted),
                    userCreated: userId,
                    fileType: `.${extractFileExtension(item.name)}`,
                    fileName: extractFileName(item.name)
                }
            }
            )).then(function (results) {
                return results
            })
        return res
    }
    const addListImgToLab = () => {
        if (editingLabResult) {
            let findX = find(listLabResultId, ["labResultId", editingLabResult])
            if (findX) {
                setOldListImgLab(findX.labResultPictures)
                const imageShowAdded = findX.labResultPictures?.map(item => {
                    return {
                        ...item,
                        url: "data:image/png;base64," + item.picture
                    }
                })
                setListImgLab(imageShowAdded)
            }
        } else setListImgLab([])
    }
    const onFinishEditAble = (v) => {
        formTable.setFields([
            { name: [listName, index, "isEditAble"], value: true },
            { name: [listName, index, "reasonEdit"], value: v?.reasonEdit },
            { name: [listName, index, "reasonEditOther"], value: v?.reasonEditOther },
        ])
        let formValues = formTable.getFieldsValue()
        let temp = map(optionsLabResult, (o, i) => {
            let list = formValues[o.financeId]
            return {
                ...o,
                labResultLists: list,
            }
        })
        setOptionsLabResult(temp)
        setEditModal(false)
    }
    const onFinish = (values) => {
        let listFinance = []
        let size = Object.keys(values).length
        for (let i = 0; i < size; i++) {
            let objValues = Object.values(values)[i]
            let checkData = objValues ? objValues : []
            listFinance.push(...checkData)
        }
        let isDelete = filter(listFinance, ['isDelete', 'Y'])
        let listForInsert = filter(listFinance, o => o.labResultId === null)
        let listForUpdate = filter(listFinance, ["isUpdate", "Y"])
        const updOrDelLabResult = async (action) => {
            setLoading(true)
            let list = action === "DELETE" ? isDelete : listForUpdate
            let req = map(list, o => {
                return {
                    "labResultId": o.labResultId,
                    "resultValue": o.dataType === "N" ? o.numberValue ? String(o.numberValue) : null : o.resultValue,
                    "textValue": o.dataType === "N" ? null : o.resultValue,
                    "numberValue": o.dataType === "N" ? o.numberValue ? String(o.numberValue) : null : null,
                    "minNumberRef": o.minNumberRef ? o.minNumberRef + "" : "0",
                    "maxNumberRef": o.maxNumberRef ? o.maxNumberRef + "" : "0",
                    "minTextRef": o.minTextRef,
                    "maxTextRef": o.maxTextRef,
                    "conceal": o.conceal,
                    "severity": o.severity,
                    "remark": o.remark || null,
                    "userModified": userId,
                    "dateModified": dayjs(),
                    "labResultPic": [],
                    reasonEdit: o?.reasonEdit || null,
                    reasonEditOther: o?.reasonEditOther || null,
                }
            })
            let res = await callApis(apis["UpdLabResults"], req)
            setLoading(false)
            if (res.isSuccess === true) {
                notiSuccess({ message: "บันทึก" })
                getLabResult()
            } else {
                notiError({ message: "บันทึก" })
            }
        }
        const insertLabResult = async () => {
            let req = map(listForInsert, o => {
                return {
                    ...o,
                    "resultValue": o.dataType === "N" ? o.numberValue ? String(o.numberValue) : null : o.resultValue,
                    "textValue": o.dataType === "N" ? null : o.resultValue,
                    "numberValue": o.dataType === "N" ? o.numberValue ? String(o.numberValue) : null : null,
                    "minNumberRef": o.minNumberRef ? o.minNumberRef + "" : "0",
                    "maxNumberRef": o.maxNumberRef ? o.maxNumberRef + "" : "0",
                    "minTextRef": o.minTextRef,
                    "maxTextRef": o.maxTextRef,
                    "conceal": o.conceal,
                    "severity": o.severity,
                    "userCreated": userId,
                }
            })
            let res = await callApis(apis["InsLabResults"], req)
            setLoading(false)
            if (res.isSuccess === true) {
                notiSuccess({ message: "บันทึก" })
                getLabResult()
            } else {
                notiError({ message: "บันทึก" })
            }
        }

        if (listForUpdate.length > 0) {
            updOrDelLabResult("UPDATE")
        } else if (listForInsert.length > 0) {
            insertLabResult()
        } else {
            notification['warning']({
                message: "ยังไม่มีการเปลื่ยนแปลงข้อมูลใด ๆ"
            })
        }

    }
    // Effect
    useEffect(() => {
        getDD()
    }, [])
    useEffect(() => {
        getLabResult(orderId)
    }, [financeId])
    useEffect(() => {
        addListImgToLab()
    }, [editingLabResult])
    // Components
    const FormList = ({ listName, dataSource = [], status = null }) => {
        useEffect(() => {
            const currentValues = formTable.getFieldValue(listName);
            if (!currentValues || currentValues.length === 0) {
                const mapping = map(dataSource, (o, i) => ({
                    ...o,
                    key: String(i),
                }));
                formTable.setFieldsValue({
                    [listName]: mapping,
                });
            }
        }, [dataSource, formTable, listName]);

        const columns = [
            {
                title: <label className="gx-text-primary text-nowrap">ปกปิด</label>,
                dataIndex: 'conceal',
                fixed: 'left',
                align: 'center',
                width: 65,
                render: (value, record, index) => (
                    <>
                        {value === "Y" && <LockOutlined style={{ color: 'red' }} />}
                        {value !== "Y" && <UnlockOutlined style={{ color: 'green' }} />}
                        <div hidden>
                            <Form.Item name={[index, "isUpdate"]} style={{ marginBottom: 0 }}>
                                <Input />
                            </Form.Item>
                            <Form.Item name={[index, "isEditAble"]} style={{ marginBottom: 0 }}>
                                <Input />
                            </Form.Item>
                        </div>
                    </>
                )
            },
            {
                title: <label className="gx-text-primary text-nowrap">Domain ผล LAB</label>,
                dataIndex: '',
                render: (value, record, index) => (
                    <>
                        <Form.Item name={[index, "testName"]} style={{ marginBottom: 0 }}>
                            <Input disabled />
                        </Form.Item>
                    </>
                )
            },
            {
                title: <label className="gx-text-primary text-nowrap">ผลลัพธ์</label>,
                dataIndex: '',
                render: (value, record, index) => {
                    let v = formTable?.getFieldValue(listName)
                    let disabledByValue = false
                    if (v) {
                        if (value?.dataType === "N") {
                            disabledByValue = v[index].numberValue ? true : false
                        }
                        if (value?.dataType === "T") {
                            disabledByValue = v[index].textValue ? true : false
                        }
                    }
                    return (
                        <>
                            {value?.dataType === "N" &&
                                <Form.Item name={[index, "numberValue"]} style={{ marginBottom: 0 }}>
                                    <InputNumber onChange={() => {
                                        if (record.labResultId) {
                                            formTable.setFields([
                                                { name: [`${listName}`, index, "isUpdate"], value: "Y" }
                                            ])
                                        }
                                    }}
                                        disabled={
                                            !record.labResultId
                                                ? false
                                                : !record?.isEditAble
                                                    ? disabledByValue
                                                    : false
                                        }
                                    />
                                </Form.Item>
                            }
                            {value?.dataType !== "N" &&
                                <Form.Item name={[index, "resultValue"]} style={{ marginBottom: 0 }}>
                                    <Input onChange={() => {
                                        if (record.labResultId) {
                                            formTable.setFields([
                                                { name: [`${listName}`, index, "isUpdate"], value: "Y" }
                                            ])
                                        }
                                    }}
                                        disabled={
                                            !record.labResultId
                                                ? false
                                                : !record?.isEditAble
                                                    ? disabledByValue
                                                    : false
                                        }
                                    />
                                </Form.Item>
                            }
                        </>
                    )
                }
            },
            {
                title: <label className="gx-text-primary text-nowrap">หน่วย</label>,
                dataIndex: '',
                width: 75,
                render: (value, record, index) => (
                    <>
                        <Form.Item name={[index, "dataType"]} style={{ marginBottom: 0 }}>
                            <Input disabled />
                        </Form.Item>
                    </>
                )
            },
            {
                title: <label className="gx-text-primary text-nowrap">Normal Range</label>,
                dataIndex: '',
                align: 'center',
                width: 200,
                render: (value, record, index) => {
                    const { criticalGender } = record;
                    let minNumberRef, maxNumberRef;
                    if (criticalGender === "Y") {
                        if (gender !== "F") {
                            minNumberRef = record.lowestStandardLabCost;
                            maxNumberRef = record.highestStandardLabCost;
                        } else {
                            minNumberRef = record.lowestStandardLabCostFemale;
                            maxNumberRef = record.highestStandardLabCostFemale;
                        }
                    } else {
                        minNumberRef = value?.minNumberRef || '';
                        maxNumberRef = value?.maxNumberRef || '';
                    }
                    return (
                        <>
                            {value?.dataType === "N" &&
                                <Row gutter={[8, 8]}>
                                    <Col span={12}>
                                        <Form.Item name={[index, "minNumberRef"]} style={{ marginBottom: 0 }}>
                                            <InputNumber
                                                style={{ width: 87 }}
                                                placeholder="Min"
                                                defaultValue={minNumberRef}
                                                onChange={() => {
                                                    if (record.labResultId) {
                                                        formTable.setFields([
                                                            { name: [`${listName}`, index, "isUpdate"], value: "Y" }
                                                        ]);
                                                    }
                                                }}
                                            // disabled={status !== "A"}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={[index, "maxNumberRef"]} style={{ marginBottom: 0 }}>
                                            <InputNumber
                                                className="ms-1"
                                                style={{ width: 88 }}
                                                placeholder="Max"
                                                defaultValue={maxNumberRef}
                                                onChange={() => {
                                                    if (record.labResultId) {
                                                        formTable.setFields([
                                                            { name: [`${listName}`, index, "isUpdate"], value: "Y" }
                                                        ]);
                                                    }
                                                }}
                                            // disabled={status !== "A"}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            }
                            {value?.dataType !== "N" &&
                                <Row gutter={[8, 8]}>
                                    <Col span={24}>
                                        <Form.Item name={[index, "unitText"]} style={{ marginBottom: 0 }}>
                                            <Input style={{ width: "100%" }} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            }
                        </>
                    );
                }
            },

            {
                title: <label className="gx-text-primary text-nowrap">สถานะ</label>,
                dataIndex: '',
                render: (value, record, index) => {
                    let v = formTable?.getFieldValue(listName)
                    let disabledByValue = false
                    if (v) {
                        if (value?.dataType === "N") {
                            disabledByValue = v[index].numberValue ? true : false
                        }
                        if (value?.dataType !== "N") {
                            disabledByValue = v[index].resultValue ? true : false
                        }
                    }
                    return <>
                        <Form.Item name={[index, "severity"]} style={{ marginBottom: 0 }}>
                            <Select
                                style={{ width: "100%" }}
                                onChange={() => {
                                    if (record.labResultId) {
                                        formTable.setFields([
                                            { name: [`${listName}`, index, "isUpdate"], value: "Y" }
                                        ])
                                    }
                                }}
                                disabled={
                                    !record.labResultId
                                        ? false
                                        : !record?.isEditAble
                                            ? disabledByValue
                                            : false
                                }
                            >
                                {listLabResultStatus.map((o, i) =>
                                    <Option key={String(i)} value={o.code}>
                                        {o.name}
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                    </>
                }
            },
            {
                title: <label className="gx-text-primary text-nowrap">หมายเหตุ</label>,
                dataIndex: '',
                render: (value, record, index) => {
                    let v = formTable?.getFieldValue(listName)
                    let disabledByValue = false
                    if (v) {
                        if (value?.dataType === "N") {
                            disabledByValue = v[index].numberValue ? true : false
                        }
                        if (value?.dataType !== "N") {
                            disabledByValue = v[index].resultValue ? true : false
                        }
                    }
                    return (
                        <>
                            <Form.Item name={[index, "remark"]} style={{ marginBottom: 0 }}>
                                <Input style={{ width: "100%" }}
                                    disabled={
                                        !record.labResultId
                                            ? false
                                            : !record?.isEditAble
                                                ? disabledByValue
                                                : false
                                    }
                                />
                            </Form.Item>
                        </>
                    )
                }
            },
            {
                title: <label className="gx-text-primary text-nowrap">รูป</label>,
                dataIndex: 'labResultId',
                align: 'center',
                width: 55,
                render: (value, record, index) => {
                    let finded = find(listLabResultId, ['labResultId', value])
                    let count = finded?.labResultPictures?.length

                    let v = formTable?.getFieldValue(listName)
                    let disabledByValue = false

                    if (v) {
                        if (value?.dataType === "N") {
                            disabledByValue = v[index].numberValue ? true : false
                        }
                        if (value?.dataType !== "N") {
                            disabledByValue = v[index].resultValue ? true : false
                        }
                    }

                    return (
                        <label className="text-nowrap">
                            <FileImageOutlined
                                className="pointer"
                                onClick={() => {
                                    let disabled = !record.labResultId
                                        ? false
                                        : !record?.isEditAble
                                            ? disabledByValue
                                            : false
                                    if (!disabled) {
                                        setLabResultId(finded.labResultId)
                                        setEditingLabResult(value)
                                        setActiveFinanceId(record.financeId)
                                        setActiveIndexId(index)
                                        setIsVisibleImgModal(true)
                                    }
                                }}
                            />
                            {count === 0 ? "+" : `(${count || 0})`}
                        </label>
                    )
                }
            },
            {
                title: <label className="gx-text-primary text-nowrap"> </label>,
                dataIndex: 'labResultId',
                align: 'center',
                width: 55,
                render: (value, record, index) => (
                    <>
                        <Tooltip title={"ดูประวัติการแก้ไข LAB"} color={"green"}>
                            <Icon
                                icon={backInTime}
                                width="16"
                                className="pointer"
                                onClick={() => {
                                    handleClickLabResultLogs(value)
                                }}
                            />
                        </Tooltip>
                    </>
                )
            },
            {
                title: "",
                dataIndex: 'labResultId',
                align: 'center',
                fixed: 'right',
                width: 75,
                render: (value, record, index) => {
                    return (
                        <>
                            <div hidden>
                                <Form.Item name={[index, "isDelete"]} style={{ marginBottom: 0 }}>
                                    <Input style={{ width: "100%" }} />
                                </Form.Item>
                            </div>
                            <EditOutlined className="pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    formEditAble.setFieldsValue({
                                        index: index,
                                        listName: listName
                                    })
                                    setEditModal(true)
                                }}
                            />
                            <Popconfirm
                                title="ลบรายการ"
                                onConfirm={() => {
                                    formTable.setFields([
                                        { name: [`${listName}`, index, "isUpdate"], value: "Y" },
                                        { name: [`${listName}`, index, "remark"], value: null },
                                        { name: [`${listName}`, index, "severity"], value: null },
                                        { name: [`${listName}`, index, "minNumberRef"], value: null },
                                        { name: [`${listName}`, index, "maxNumberRef"], value: null },
                                        { name: [`${listName}`, index, "resultValue"], value: null },
                                        { name: [`${listName}`, index, "numberValue"], value: null },
                                        { name: [`${listName}`, index, "isEditAble"], value: true },
                                        { name: [`${listName}`, index, "reasonEdit"], value: null },
                                        { name: [`${listName}`, index, "reasonEditOther"], value: null },
                                    ])
                                    if (!record?.labResultPictures?.length) return formTable.submit()
                                    let listOldImgLab = record?.labResultPictures?.filter(item => item.labPicId)
                                    if (listOldImgLab.length) {
                                        callApis(apis["DelLabResultPictures"], listOldImgLab).then(res => {
                                            formTable.submit()
                                        })
                                    }
                                }}
                                okText="Yes"
                                cancelText="No"
                            // disabled={!ableDeleteLabResult}
                            >
                                <DeleteOutlined
                                    className="pointer ms-1"
                                    // style={ableDeleteLabResult ? { color: "red" } : { color: "gray", cursor: "not-allowed" }}
                                    onClick={(e) => { e.stopPropagation() }}
                                />
                            </Popconfirm>

                        </>
                    )
                }
            },
        ];

        return (
            <div>
                <Table
                    scroll={{ x: 900 }}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    rowClassName={"data-value"}
                />
            </div>
        );
    };
    const FormTable = (listName, dataSource, status = null) => {
        return (
            <Form
                form={formTable}
                onFinish={onFinish}
            >
                <Form.List name={listName}>
                    {() => {
                        return <FormList listName={listName} dataSource={dataSource} status={status} />;
                    }}
                </Form.List>
            </Form>
        );
    };
    const TableLabResultLogHis = () => {
        const columns = [
            {
                title: <label className="gx-text-primary text-nowrap">วันที่แก้ไข</label>,
                dataIndex: 'dateUpdated',
                width: 165,
                align: 'center',
                render: (value, record, index) => (
                    <label className="data-value">
                        {dayjs(value, "MM/DD/YYYY HH:mm:ss").format("DD/MM/BBBB HH:mm")}
                    </label>
                )
            },
            {
                title: <label className="gx-text-primary text-nowrap">ผู้แก้ไข</label>,
                dataIndex: 'userUpdatedDesc',
                className: "data-value",
                width: 240,
            },
            {
                title: <label className="gx-text-primary text-nowrap">ชื่อฟิลด์</label>,
                dataIndex: 'logField',
                className: "data-value"
            },
            {
                title: <label className="gx-text-primary text-nowrap">ก่อนแก้ไข</label>,
                dataIndex: 'oldData',
                className: "data-value"
            },
            {
                title: <label className="gx-text-primary text-nowrap">หลังแก้ไข</label>,
                dataIndex: 'newData',
                className: "data-value"
            }
        ]
        return (
            <>
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <label className="gx-text-primary">{listLabResultLogsHis[0]?.name}</label>
                    </Col>
                </Row>
                <br />
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Table
                            size="small"
                            rowClassName={"data-value"}
                            scroll={{ y: 340 }}
                            columns={columns}
                            dataSource={listLabResultLogsHis}
                            rowKey={"labResultLogId"}
                            pagination={false}
                        />
                    </Col>
                </Row>
            </>
        )
    }
    const ShowListLabImg = () => {
        return (
            <>
                <Spin spinning={loadingUploadImg} tip="กำลังบันทึกข้อมูล">
                    <UploadFileComponent fileList={listImgLab} handleUploadFile={(fileList) => setListImgLab(fileList)} />
                </Spin>
            </>
        )
    }
    return <Spin spinning={loading}>
        <>
            {optionsLabResult.map(o =>
                <Card
                    className='mb-0'
                    size='small'
                    bordered={false}
                    title={<>
                        <label className="gx-text-primary fw-bold me-2">{o.expenseName}</label>
                        (<label className="fw-bold" style={{ fontSize: 18 }}>{o.statusDesc}</label>)
                    </>}
                >
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            {FormTable(o.financeId, o.labResultLists, o.status)}
                        </Col>
                    </Row>
                    <Row gutter={[8, 8]} className="mb-2 mt-2">
                        <Col span={8}>
                            <label className="gx-text-primary fw-bold">จำนวนเงิน</label>
                            <br />
                            <label className="data-value">{o.amount}</label>
                        </Col>
                        <Col span={8}>
                            <label className="gx-text-primary fw-bold">เบิกได้</label>
                            <br />
                            <label className="data-value">{o.claim}</label>
                        </Col>
                        <Col span={8}>
                            <label className="topic-danger fw-bold">เบิกไม่ได้</label>
                            <br />
                            <label className="data-value">{o.copay}</label>
                        </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                        <Col span={8}>
                            <label className="gx-text-primary fw-bold">ผู้บันทึก</label>
                            <br />
                            <label className="data-value me-1">{o.userCreatedDesc}</label>
                            <label className="data-value">{o.orderDate ? dayjs(o.orderDate).format("DD/MM/BBBB HH:mm") : "-"}</label>
                        </Col>
                        <Col span={8}>
                            <label className="gx-text-primary fw-bold">ผู้แก้ไข</label>
                            <br />
                            <label className="data-value me-1">{o.userModifiedDesc}</label>
                            <label className="data-value">{o.dateModified ? dayjs(o.dateModified).format("DD/MM/BBBB HH:mm") : "-"}</label>
                        </Col>
                        <Col span={8}>
                            <label className="gx-text-primary fw-bold">ผู้รับทราบ</label>
                            <br />
                            <label className="data-value me-1">{o.userAcceptedDesc}</label>
                            <label className="data-value">{o.dateAccepted ? dayjs(o.dateAccepted).format("DD/MM/BBBB HH:mm") : "-"}</label>
                        </Col>
                    </Row>
                </Card>
            )}
            <Button
                hidden
                id="btn-save-lab-results"
                onClick={() => {
                    formTable.submit()
                }}
            />
        </>
        {isVisibleModalLabHis && <Modal
            centered
            visible={isVisibleModalLabHis}
            width={840}
            title={<label className="gx-text-primary fw-bold">12.6.3 ตรวจสอบประวัติการแก้ไขผล LAB</label>}
            onCancel={() => setIsVisibleModalLabHis(false)}
            footer={
                <div className="text-center">
                    <Button onClick={() => setIsVisibleModalLabHis(false)}>
                        ปิด
                    </Button>
                </div>
            }
        >
            {TableLabResultLogHis()}
        </Modal>}
        {editModal && <Modal
            centered
            visible={editModal}
            width={500}
            title={<label className="gx-text-primary fw-bold fs-6">ระบุเหตุผลการแก้ไข</label>}
            onCancel={() => setEditModal(false)}
            footer={
                <div className="text-center">
                    <Button onClick={() => setEditModal(false)}>
                        ปิด
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            formEditAble.submit()
                        }}
                        disabled={!reasonEdit}
                    >
                        ตกลง
                    </Button>
                </div>
            }
        >
            <Form
                form={formEditAble}
                onFinish={onFinishEditAble}
                layout='vertical'
            >
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Form.Item name="index" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name="listName" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="reasonEdit"
                            label={<label className="gx-text-primary fw-bold">เหตุผล</label>}
                        >
                            <Select
                                style={{ width: '100%' }}
                                placeholder="เลือกเหตุผล"
                                onChange={(v) => {
                                    if (v !== "4") {
                                        formEditAble.setFieldsValue({
                                            reasonEditOther: null
                                        })
                                    }
                                    if (!v) {
                                        formTable.setFields([
                                            { name: [listName, index, "isEditAble"], value: false },
                                        ])
                                    }
                                }}
                            >
                                <Option value="1"> 1 ออกเลขผิด</Option>
                                <Option value="2"> 2 ออกผลผิดคน</Option>
                                <Option value="3"> 3 ตรวจซ้ำ</Option>
                                <Option value="4"> 4 อื่นๆ</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="reasonEditOther"
                            label={<label className="gx-text-primary fw-bold">เหตุผล</label>}
                        >
                            <Input.TextArea disabled={reasonEdit !== "4"} />
                        </Form.Item>
                    </Col>

                </Row>
            </Form>
        </Modal>}
        {isVisibleImgModal && <Modal
            centered
            visible={isVisibleImgModal}
            width={900}
            title={<label className="gx-text-primary fw-bold">รูปภาพที่อัพโหลด</label>}
            onCancel={() => {
                setEditingLabResult(null)
                setIsVisibleImgModal(false)
            }}
            footer={
                <div className="text-center">
                    <Button onClick={() => {
                        setIsVisibleImgModal(false)
                        setEditingLabResult(null)
                    }}
                    >
                        ปิด
                    </Button>
                    <Button type="primary" onClick={() => {
                        if (listImgLab.length >= 1) {
                            let listNewImgLab = listImgLab.filter(item => !item.labPicId)
                            let listOldImgLab = listImgLab.filter(item => item.labPicId)
                            let listDelImgLab = differenceBy(oldListImgLab, listOldImgLab, "labPicId")
                            if (editingLabResult) {
                                if (listNewImgLab.length !== 0) {
                                    const InsertImgs = async () => {
                                        setLoadingUploadImg(true)
                                        let reqFile = await manageImgWithFileType(listNewImgLab)
                                        await callApis(apis["InsLabResultPictures"], reqFile).then(data => {
                                            if (listDelImgLab.length === 0) {
                                                setLoadingUploadImg(false)
                                                setIsVisibleImgModal(false)
                                                getLabResult()
                                                setEditingLabResult(null)
                                                notification['success']({
                                                    message: "บันทึกสำเร็จ",
                                                    description: "บันทึกรูปผล LAB สำเร็จ!",
                                                    placement: "bottomRight"
                                                })
                                            }
                                        });
                                        setLoadingUploadImg(false)
                                    }
                                    InsertImgs()
                                }

                                if (listDelImgLab.length !== 0) {
                                    setLoadingUploadImg(true)
                                    callApis(apis["DelLabResultPictures"], listDelImgLab).then(data => {
                                        setLoadingUploadImg(false)
                                        setIsVisibleImgModal(false)
                                        getLabResult()
                                        setEditingLabResult(null)
                                        notification['success']({
                                            message: "บันทึกสำเร็จ",
                                            description: "บันทึกรูปผล LAB สำเร็จ!",
                                            placement: "bottomRight"
                                        })
                                    })
                                }
                            } else {
                                const values = formTable.getFieldsValue()[activeFinanceId]
                                const find2Insert = values.find((o, i) => o.financeId === activeFinanceId && i === activeIndexId)
                                const insertLabResult = async () => {
                                    let req = [{
                                        ...find2Insert,
                                        "resultValue": find2Insert.dataType === "N" ? find2Insert.numberValue ? String(find2Insert.numberValue) : null : find2Insert.resultValue,
                                        "numberValue": find2Insert.dataType === "N" ? find2Insert.numberValue ? String(find2Insert.numberValue) : null : null,
                                        "minNumberRef": find2Insert.minNumberRef ? find2Insert.minNumberRef + "" : "0",
                                        "maxNumberRef": find2Insert.maxNumberRef ? find2Insert.maxNumberRef + "" : "0",
                                        "minTextRef": find2Insert.minTextRef,
                                        "maxTextRef": find2Insert.maxTextRef,
                                        "conceal": find2Insert.conceal,
                                        "severity": find2Insert.severity,
                                    }]
                                    setLoadingUploadImg(true)
                                    let res = await callApis(apis["InsLabResults"], req)
                                    if (res.isSuccess === true) {
                                        const lastLabResultId = res.responseData[0].labResultId
                                        if (listNewImgLab.length !== 0) {
                                            const InsertImgs = async () => {
                                                setLoadingUploadImg(true)
                                                let reqFile = await manageImgWithFileType(listNewImgLab, lastLabResultId)
                                                await callApis(apis["InsLabResultPictures"], reqFile).then(() => {
                                                    if (listDelImgLab.length === 0) {
                                                        setLoadingUploadImg(false)
                                                        setIsVisibleImgModal(false)
                                                        getLabResult()
                                                        setEditingLabResult(null)

                                                        notification['success']({
                                                            message: "บันทึกสำเร็จ",
                                                            description: "บันทึกรูปผล LAB สำเร็จ!",
                                                            placement: "bottomRight"
                                                        })
                                                    }
                                                });
                                                setLoadingUploadImg(false)
                                            }

                                            InsertImgs()
                                        }
                                    }
                                    setLoadingUploadImg(false)
                                    setIsVisibleImgModal(false)
                                }

                                insertLabResult()
                            }
                        } else {
                            // delete image
                            let listOldImgLab = listImgLab.filter(item => item.labPicId)
                            let listDelImgLab = differenceBy(oldListImgLab, listOldImgLab, "labPicId")
                            if (listDelImgLab.length) {
                                setLoadingUploadImg(true)
                                callApis(apis["DelLabResultPictures"], listDelImgLab).then(() => {
                                    setLoadingUploadImg(false)
                                    setIsVisibleImgModal(false)
                                    getLabResult()
                                    setEditingLabResult(null)
                                    notification['success']({
                                        message: "บันทึกสำเร็จ",
                                        description: "บันทึกรูปผล LAB สำเร็จ!",
                                        placement: "bottomRight"
                                    })
                                })
                            }
                        }
                    }}
                    >
                        บันทึก
                    </Button>
                </div>
            }
        >
            {ShowListLabImg()}
        </Modal>}
    </Spin>
}

const apis = {
    GetLabResultList: {
        url: "Laboratory/GetLabResultList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetLabServeritiesMas: {
        url: "Laboratory/GetLabServeritiesMas",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetLabResultLogsHistory: {
        url: "Laboratory/GetLabResultLogsHistory/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    DelLabResultPictures: {
        url: "Laboratory/DelLabResultPictures",
        method: "DELETE",
        return: "data",
        sendRequest: true,
    },
    UpdLabResults: {
        url: "Laboratory/UpdLabResults",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    InsLabResults: {
        url: "Laboratory/InsLabResults",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
    InsLabResultPictures: {
        url: "Laboratory/InsLabResultPictures",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}
