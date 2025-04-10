import { useEffect, useMemo, useRef, useState } from 'react';
// Redux
import {
    AutoComplete,
    Button,
    Col, Form,
    Input,
    Popconfirm,
    Row,
    Select,
    Spin,
    Table,
} from "antd";
import { debounce, differenceBy, filter, map } from "lodash";
import {
    labelTopicPrimary,
} from "../helper/function/GenLabel";
//Noti
import FavoriteProcedures from "../Modal/FavoriteProcedures";
import { notiWarning, notificationX as notiX } from "../Notification/notificationX";
// Functins
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { nanoid } from "nanoid";
import { callApi } from '../helper/function/CallApi';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function TableIcd10({
    patientId = null,
    serviceId = null,
    clinicId = null,
    reloadIcd = 0,
    form,
    onFinish = () => { },
    doctor = null,
    page = null,
    getOpdClinicDetails = () => { },
    onValuesChange = () => { },
}) {
    // useDispatch
    // useSelector
    // Ref
    const keywordRef = useRef(null)
    // State
    const [IsDropDownLoaded, setIsDropDownLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingIcd9, setLoadingIcd9] = useState(false)
    const [optionsIcd, setOptionsIcd] = useState([]);
    const [listOpdPrc, setListOpdPrc] = useState([])
    const [, setListOpdPrcDiffDoctor] = useState([])
    const [vsbFavorite, setVsbFavorite] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    const getOpdProcedures = async (clinicId) => {
        if (!clinicId) return
        setLoading(true)
        let req = {
            serviceId,
            patientId,
        }
        let res = await callApi(listApi, "GetOpdProcedures", req)
        let filterPrc = filter(res, ["clinicId", clinicId])
        filterPrc = map(filterPrc, o => {
            return {
                doctor: o.doctor,
                serviceId: serviceId,
                clinicId: o.clinicId,
                procedureId: o.procedureId,
                icd: o.icd,
                procedure: o.procedure,
                extension: o.extension,
                seq: o.seq,
            }
        })
        setListOpdPrc(filterPrc)
        if (page === "30.3") {
            filterOpdPrcByDoctor(doctor, filterPrc)
        } else {
            setListOpdPrc([])
            setListOpdPrcDiffDoctor([])
            form.setFieldsValue({ procedures: filterPrc },);
        }
        setLoading(false)
    }
    const delRow = async (crrIndex, crrRow) => {
        // console.log('crrRow :>> ', crrRow);
        const procedures = form.getFieldsValue().procedures
        const newData = filter(procedures, (o, i) => i !== crrIndex)
        if (!crrRow?.procedureId) {
            form.setFieldsValue({
                procedures: newData,
            })
        }
        if (crrRow?.procedureId) {
            setLoading(true)
            const res = await callApi(listApi, "DeleteOpdProcedures", crrRow.procedureId)
            notiX(res?.isSuccess, "ลบ Procedure")
            if (res?.isSuccess) {
                if (page === "30.3") {
                    getOpdClinicDetails()
                    getOpdProcedures(clinicId)
                } else {
                    form.setFieldsValue({ procedures: newData, })
                }
            }
            setLoading(false)
        }
    }
    const filterOpdPrcByDoctor = (doctor, listOpdPrc) => {
        if (!doctor) return form.setFieldsValue({ procedures: [] })
        let filterByDoctor = filter(listOpdPrc, ["doctor", doctor])
        let filterByDiffDoctor = filter(listOpdPrc, o => o.doctor !== doctor)
        setListOpdPrcDiffDoctor(filterByDiffDoctor)
        form.setFieldsValue({ procedures: filterByDoctor })
    }
    const handleDelSelectedRows = async () => {
        const procedures = form.getFieldsValue().procedures
        let newData = differenceBy(procedures, selectedRows, "key");
        const findProcedureId = filter(selectedRows, "procedureId")
        if (!findProcedureId.length) {
            form.setFieldsValue({
                diagnosis: newData,
            });
        } else {
            setLoading(true);
            let res = await callApi(listApi, "DeleteOpdProceduces", findProcedureId);
            notiX(res?.isSuccess, "ลบ Procedure")
            if (res?.isSuccess) {
                if (page === "30.3") {
                    getOpdClinicDetails()
                    getOpdProcedures(clinicId)
                } else {
                    form.setFieldsValue({ procedures: newData, })
                }
            }
            setLoading(false)
        }

    }
    // Effect
    useEffect(() => {
        if (!clinicId) return
        if (!IsDropDownLoaded) {
            setIsDropDownLoaded(true)
            // getIcd9()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [IsDropDownLoaded, clinicId])
    useEffect(() => {
        getOpdProcedures(clinicId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadIcd, clinicId])
    useEffect(() => {
        if (page === "30.3") {
            filterOpdPrcByDoctor(doctor, listOpdPrc)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctor])

    const debounceSearch = useMemo(() => {
        const onSearchIcd = async (keyword = "") => {
            if (!keyword) return
            if (keyword.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
            const req = {
                "user": user,
                "codeset": "OP",
                "searhIcdAndDiagKey": keyword
            }
            setLoadingIcd9(p => !p)
            let res = await callApi(listApi, "GetIcdsRediagsNew", req);
            setLoadingIcd9(p => !p)
            res = map(res, (o, i) => {
                let key = String(i);
                return {
                    key: key,
                    value: key,
                    icd: o.datavalue,
                    label: `${o.datavalue} ${o.datadisplay}`,
                    procedure: o?.datadisplay,
                    className: "data-value",
                    pdx: o.dataother1,
                };
            });
            setOptionsIcd(res)
        }
        return debounce(onSearchIcd, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const handleSelectIcd = (index, record, detail) => {
        form.setFields([
            { name: ["procedures", index, "isEdit"], value: true },
            { name: ["procedures", index, "icd"], value: detail?.icd },
        ]);
        // if (!record.procedure) {
        form.setFields([
            { name: ["procedures", index, "procedure"], value: detail?.procedure },
        ]);
        // }
    }
    const handleSelectProcedure = (index, record, detail) => {
        form.setFields([
            { name: ["procedures", index, "isEdit"], value: true },
            { name: ["procedures", index, "procedure"], value: detail?.procedure },
        ]);
        // if (!record.icd) {
        form.setFields([
            { name: ["procedures", index, "icd"], value: detail?.icd },
        ]);
        // }
    }
    const columns = [
        // Procedures
        {
            title: labelTopicPrimary("Procedures"),
            render: (v, r, i) => {
                return (
                    <div>
                        <Form.Item
                            name={[i, "procedure"]}
                            style={{ margin: 0 }}
                        >
                            <AutoComplete
                                allowClear
                                dropdownMatchSelectWidth={500}
                                optionFilterProp="label"
                                options={optionsIcd}
                                className="data-value"
                                onKeyUp={(e) => debounceSearch(e.target.value)}
                                onChange={() => {
                                    form.setFields([
                                        { name: ["procedures", i, "isEdit"], value: true },
                                    ]);
                                }}
                                onSelect={(v, detail) => handleSelectProcedure(i, r, detail)}
                                dropdownRender={menu => loadingIcd9 ? "กำลังค้นหา..." : menu}
                            >
                                <Input.TextArea
                                    autoSize
                                    style={{ width: "100%" }}
                                    className="data-value"
                                />
                            </AutoComplete>
                        </Form.Item>
                    </div>
                )
            }
        },
        // EXT
        {
            title: labelTopicPrimary("+EXT."),
            width: 90,
            render: (v, r, i) => {
                return (
                    <div>
                        <Form.Item
                            name={[i, "extension"]}
                            style={{ margin: 0 }}
                        >
                            <Input
                                // size='small'
                                onChange={() => {
                                    form.setFields([
                                        { name: ["procedures", i, "isEdit"], value: true },
                                    ]);
                                }}
                            />
                        </Form.Item>
                    </div>
                )
            }
        },
        // ICD
        {
            title: labelTopicPrimary("ICD"),
            width: 100,
            render: (v, r, i) => {
                return (
                    <div>
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
                            <Select
                                style={{ width: "100%" }}
                                dropdownMatchSelectWidth={500}
                                showSearch
                                allowClear
                                onKeyUp={e => debounceSearch(e.target.value)}
                                loading={loadingIcd9}
                                options={optionsIcd}
                                optionFilterProp="label"
                                optionLabelProp="icd"
                                className="data-value"
                                dropdownRender={menu => loadingIcd9 ? "กำลังค้นหา..." : menu}
                                onChange={(v, detail) => handleSelectIcd(i, r, detail)}
                            />
                        </Form.Item>
                    </div>
                )
            }
        },
        // Action
        {
            title: ' ',
            width: 45,
            fixed: "right",
            render: (v, r, i) => {
                return <Popconfirm
                    title="ลบจากระบบ?"
                    onConfirm={() => delRow(i, r)}
                    onCancel={() => { }}
                    okText="ลบ"
                    cancelText="ปิด"
                >
                    <Button
                        style={{ margin: 0 }}
                        size='small'
                        icon={<DeleteOutlined style={{ color: "red" }} />}
                    />
                </Popconfirm>
            }
        },
    ]
    const TableHeader = (add) => {
        return (
            <Row
                gutter={[8, 8]}
                style={{
                    flexDirection: "row",
                    // marginTop: -14,
                    marginBottom: 4,
                    // marginLeft: -20,
                    // marginRight: -20,
                }}
                align='middle'
            >
                <Col span={14}>
                    {labelTopicPrimary("หัตถการICD9")}
                    <Popconfirm
                        title="ลบจากระบบ ?"
                        okText="ยืนยัน"
                        cancelText="ปิด"
                        onConfirm={() => handleDelSelectedRows()}
                        disabled={!selectedRowKeys.length}
                    >
                        <Button
                            type="danger"
                            size="small"
                            className="mb-0 ms-2"
                            disabled={!selectedRowKeys.length}
                        >ลบที่เลือก</Button>
                    </Popconfirm>
                </Col>
                <Col span={10} className='text-end'>
                    <Button
                        size='small'
                        type='primary'
                        style={{ marginBottom: 0, marginRight: 4 }}
                        onClick={() => setVsbFavorite(true)}
                    >
                        Favorite
                    </Button>
                    <Button
                        size='small'
                        type='primary'
                        style={{ margin: 0 }}
                        icon={<PlusOutlined />}
                        disabled={!clinicId}
                        onClick={() => {
                            add({
                                procedureId: null,
                                icd: null,
                                procedure: null,
                                extension: null,
                                key: nanoid(),
                            }, 0)
                        }}
                    />
                </Col>
            </Row>
        )
    }
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
    return <>
        <Form
            form={form}
            onFinish={onFinish}
            layout='vertical'
            onValuesChange={onValuesChange}
        >
            <Form.List name={"procedures"}>
                {(list, { add }) => {
                    const formValues = form.getFieldsValue()
                    // console.log('formValues :>> ', formValues);
                    const procedures = formValues?.procedures || []
                    list = map(list, (val, i) => {
                        const crrRow = procedures[i]
                        return {
                            ...crrRow,
                            ...val,
                            key: crrRow.key,
                        };
                    })
                    // console.log('listFinance :>> ', listFinance);
                    return (
                        <Spin spinning={loading}>
                            {TableHeader(add)}
                            <div hidden={!list.length}>
                                <Table
                                    size='small'
                                    // title={() => TableHeader(add)}
                                    rowClassName="data-value"
                                    scroll={{ x: 475, y: 240 }}
                                    dataSource={list}
                                    columns={columns}
                                    pagination={false}
                                    rowSelection={{ ...rowSelection }}
                                />
                            </div>
                            <div className="text-center" hidden={list.length} style={{ backgroundColor: "#fafafa" }}>
                                <label style={{ color: "#BDBDBD" }}>ไม่มีข้อมูล</label>
                            </div>
                        </Spin>
                    );
                }}
            </Form.List>
        </Form>
        {
            vsbFavorite && <FavoriteProcedures
                visible={vsbFavorite}
                close={() => setVsbFavorite(false)}
                onSave={selected => {
                    const formValues = form.getFieldValue('procedures')
                    const mappingSelected = map(selected, o => {
                        return {
                            ...o,
                            procedureId: null,
                            icd: o?.icd,
                            procedure: o?.proced,
                            extension: null,
                            key: nanoid(),
                            startDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                            finishedDate: dayjs().add(1, "hour").format("YYYY-MM-DD HH:mm:ss")
                        }
                    })
                    form.setFieldsValue({ procedures: [...mappingSelected, ...formValues] })
                }}
            />
        }
    </>
}
const listApi = [
    // GetIcdsRediags
    {
        name: "GetIcdsRediags",
        url: "Masters/GetIcdsRediags",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // GetOpdProcedures
    {
        name: "GetOpdProcedures",
        url: "Reimbursement/GetOpdProceduresDetails",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    // DeleteOpdProcedures
    {
        name: "DeleteOpdProcedures",
        url: "OperationRoom/DeleteOpdProcedures/",
        method: "DELETE",
        return: "data",
        sendRequest: false,
    },
    // GetIcdsRediagsNew
    {
        name: "GetIcdsRediagsNew",
        url: "Masters/GetIcdsRediagsNew",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    {
        name: "DeleteOpdProceduces",
        url: "OperationRoom/delete-list-opd-procedures",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
]
