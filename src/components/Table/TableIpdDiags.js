import { useEffect, useState } from 'react';
// Redux
import {
    DeleteOutlined,
    PlusOutlined,
    UsergroupAddOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Button,
    Col,
    Collapse,
    Form, Input,
    Modal,
    Popconfirm,
    Row,
    Select,
    Spin,
    Table,
    Tooltip
} from 'antd';
import Column from "antd/lib/table/Column";
import { callApis } from 'components/helper/function/CallApi';
import { mappingOptions } from "components/helper/function/MappingOptions";
import AutoCompleteIcdDocFav from 'components/Input/AutocompleteIcdDocFav';
import SelectIcdDocFav from 'components/Input/SelectIcdDocFav';
import { map, find, filter, differenceBy } from "lodash";
import { nanoid } from "nanoid";
import { Scrollbars } from "react-custom-scrollbars";
import { LabelTopicPrimary, } from "../helper/function/GenLabel";
import { notiWarning } from "../Notification/notificationX";
const { Panel } = Collapse;
const { Option } = Select;

// const userFromSession = JSON.parse(sessionStorage.getItem("user"));
// const user = userFromSession.responseData.userId;

export default function TableIpdDiags({
    form,
    onFinish,
    size = "small",
    optionsUsers = [],
    optionsDoctor = [],
    ...props
}) {
    // Form
    const [formAddDoctor] = Form.useForm()
    // State
    const [friend, setFriend] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentRowDiag, setCurrentRowDiag] = useState(null);
    const [options, setOptions] = useState({
        diagType: [],
        IpdDeadStatusDiag: [],
    })
    // State Vsb
    // const [visivbleIcdDupModal, setVisivbleIcdDupModal] = useState(false);
    const [visAddDoctorModal, setVisAddDoctorModal] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    // Funcs Get
    const getOptions = async () => {
        const [
            diagType,
            IpdDeadStatusDiag,
        ] = await Promise.all([
            callApis(apis["GetDiagTypes"]),
            callApis(apis["GetMasterDropdown"], "TableName=TB_IPD_DIAGS&FieldName=DiagDeadStatus"),
        ])
        setOptions(p => {
            return {
                ...p,
                diagType: mappingOptions({ dts: diagType, }),
                IpdDeadStatusDiag: mappingOptions({ dts: IpdDeadStatusDiag, }),
            }
        })
    }
    // Funcs onFinish
    const onFormAddDoctorFinish = (v) => {
        setLoading(true);
        setTimeout(() => {
            form.setFields([
                { name: ["diagnosis", currentRowDiag, "doctor2"], value: v.users },
                { name: ["diagnosis", currentRowDiag, "editStatus"], value: true },
            ]);
            setVisAddDoctorModal(false);
            setCurrentRowDiag(null);
            setLoading(false);
        }, 200);
    };
    // Funcs Helper
    const disabledDiagType = (value) => {
        const pd = find(options.diagType, ["dataother1", "1"]);
        const listDiagnosis = form.getFieldsValue().diagnosis;
        const findX = find(listDiagnosis, ["type", pd?.datavalue]);
        if (findX) {
            if (value === findX.type) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    const handleDeleteSelectedRows = () => {
        const diagnosis = form.getFieldValue("diagnosis")
        form.setFieldsValue({
            diagnosis: differenceBy(diagnosis, selectedRows, "key")
        })
    }
    // Effect
    useEffect(() => {
        getOptions()
    }, [])

    // Modal
    const PartsModalAddDoctor = () => {
        return <Modal
            title={
                <div style={{ marginBottom: "-6px", marginTop: "-2px" }}>
                    <label className="topic-blue-bold">เพิ่มแพทย์ผู้วินิจฉัยโรค</label>
                </div>
            }
            closable={false}
            centered
            visible={visAddDoctorModal}
            onCancel={() => {
                setVisAddDoctorModal(false);
                setCurrentRowDiag(null);
            }}
            width={500}
            footer={
                <div className="text-center">
                    <Button
                        type="secondary"
                        onClick={() => {
                            setVisAddDoctorModal(false);
                            setCurrentRowDiag(null);
                        }}
                    >
                        ปิด
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => formAddDoctor.submit()}
                    >
                        บันทึก
                    </Button>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Scrollbars autoHeight autoHeightMin={380}>
                    <Row gutter={8}>
                        <Col span={24} className="ps-3">
                            <Form
                                form={formAddDoctor}
                                onFinish={onFormAddDoctorFinish}
                                layout="vertical"
                                style={{ margin: 0 }}
                            >
                                <Form.List name="users">
                                    {(fields, { add, remove }) => (
                                        <>
                                            <Row gutter={[8, 8]}>
                                                <Col span={24}>
                                                    <Button
                                                        type="primary"
                                                        onClick={() =>
                                                            add({
                                                                userId: null,
                                                                userName: null,
                                                            })
                                                        }
                                                    >
                                                        เพิ่มแพทย์
                                                    </Button>
                                                </Col>
                                            </Row>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <Row
                                                    gutter={[8, 8]}
                                                    key={nanoid()}
                                                    style={{ flexDirection: "row" }}
                                                >
                                                    <Col span={21}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, "userId"]}
                                                            label={
                                                                <label className="topic-green">แพทย์</label>
                                                            }
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: "กรุณาเลือกแพทย์",
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                // allowClear
                                                                showSearch
                                                                style={{ width: "100%" }}
                                                                onChange={(v, vs) => {
                                                                    let doctor =
                                                                        form.getFieldsValue().diagnosis[
                                                                            currentRowDiag
                                                                        ]?.doctor;
                                                                    let list =
                                                                        formAddDoctor.getFieldsValue()?.users;
                                                                    let filterX = filter(list || [], [
                                                                        "userId",
                                                                        v,
                                                                    ]);
                                                                    if (v === doctor || filterX.length > 1) {
                                                                        notiWarning({ message: "เลือกแพทย์ซ้ำกัน !", description: "กรุณาเลือกใหม่" })
                                                                        formAddDoctor.setFields([
                                                                            {
                                                                                name: ["users", name, "userId"],
                                                                                value: null,
                                                                            },
                                                                            {
                                                                                name: ["users", name, "userName"],
                                                                                value: null,
                                                                            },
                                                                        ]);
                                                                    } else {
                                                                        formAddDoctor.setFields([
                                                                            {
                                                                                name: ["users", name, "userName"],
                                                                                value: vs.username,
                                                                            },
                                                                        ]);
                                                                    }
                                                                }}
                                                                className="data-value"
                                                            >
                                                                {optionsDoctor.map((val, index) => (
                                                                    <Option
                                                                        value={val.datavalue}
                                                                        key={index}
                                                                        username={val.datadisplay}
                                                                        // disabled={findDataInArray(val.datavalue, name, 'userId')}
                                                                        className="data-value"
                                                                    >
                                                                        {val.datadisplay}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, "userName"]}
                                                            // label={' '}
                                                            hidden
                                                        >
                                                            <Input />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={3} className="text-center">
                                                        <Form.Item
                                                            {...restField}
                                                            // name={[name, 'note']}
                                                            label={" "}
                                                        >
                                                            <Button
                                                                size="small"
                                                                shape="circle"
                                                                icon={
                                                                    <DeleteOutlined style={{ color: "red" }} />
                                                                }
                                                                onClick={() => remove(name)}
                                                                style={{ marginBottom: 0 }}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            ))}
                                        </>
                                    )}
                                </Form.List>
                            </Form>
                        </Col>
                    </Row>
                </Scrollbars>
            </Spin>
        </Modal>
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
        return <Form form={form} onFinish={onFinish} {...props}>
            <Form.List name="diagnosis">
                {(diagnosis, { add, remove }) => {
                    const formValues = form.getFieldsValue();
                    const prev = formValues?.diagnosis || [];
                    diagnosis = map(diagnosis, (val, i) => {
                        const crrRow = prev[i];
                        return {
                            ...crrRow,
                            ...val,
                            key: crrRow.key,
                            index: i,
                        };
                    });
                    return <div style={{ margin: -14 }}>
                        <div
                            hidden={diagnosis?.length}
                            className="text-center pt-1 pb-1"
                            style={{ backgroundColor: "#fafafa" }}
                        >
                            <label style={{ color: "#BDBDBD" }}>ไม่มีข้อมูล</label>
                        </div>
                        <Button
                            hidden
                            id="add-ipd-diag-11-16"
                            size="small"
                            style={{ margin: 0 }}
                            type="primary"
                            onClick={() => {
                                const feverDoctor = form.getFieldValue("feverDoctor");
                                const pd = find(options.diagType, ["dataother1", "1"]);
                                const listDiagnosis = form.getFieldValue("diagnosis") || [];
                                const findDiag = find(listDiagnosis, ["type", pd?.datavalue,]);
                                add(
                                    {
                                        doctor: feverDoctor,
                                        new: true,
                                        ipdDiagId: null,
                                        type:
                                            listDiagnosis?.length === 0
                                                ? "1"
                                                : findDiag
                                                    ? "2"
                                                    : pd?.datavalue,
                                        doctor2: [],
                                        diagDeadStatus: options.IpdDeadStatusDiag[0]?.value,
                                        key: nanoid(),
                                    },
                                    0
                                );
                                setFriend(!friend);
                            }}
                            disabled={form.getFieldsValue()?.drgLockFlag}
                        >
                            เพิ่มรหัสโรค
                        </Button>
                        <div hidden={!diagnosis?.length}>
                            <Table
                                size={size}
                                scroll={{ x: 1200, y: 200 }}
                                dataSource={diagnosis}
                                pagination={false}
                                rowClassName="data-value"
                                rowSelection={rowSelection}
                            >
                                {/* Diagnosis */}
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *Diagnosis
                                        </label>
                                    }
                                    render={(text, record, i) => {
                                        const name = record.index
                                        return (
                                            <Form.Item
                                                name={[name, "diagnosis"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "กรุณาระบุ diagnosis!",
                                                    },
                                                ]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <AutoCompleteIcdDocFav
                                                    codeset="IT"
                                                    value={form.getFieldValue("diagnosis")[name].diagnosis}
                                                    onChange={(v) => {
                                                        form.setFields([
                                                            { name: ["diagnosis", name, "diagnosis"], value: v, },
                                                            { name: ["diagnosis", name, "isEdit"], value: true },
                                                        ]);
                                                    }}
                                                    onSelect={(v, detail) => {
                                                        form.setFields([{ name: ["diagnosis", name, "diagnosis"], value: detail?.diagnosis }])
                                                        const formValues = form.getFieldValue("diagnosis");
                                                        const filterNoCurrent = filter(formValues, (o, i) => i !== name)
                                                        if (filterNoCurrent?.length > 0 && detail?.pdx === "Y") {//มีหลาย Record
                                                            let findPrincipal = find(filterNoCurrent, ["type", "1"])
                                                            if (findPrincipal) {
                                                                if (!formValues[name]?.icd) {
                                                                    notiWarning({ message: "มีการคีย์รหัสโรคหลักแล้ว", description: "รหัสที่เลือก คีย์เป็นรหัสหลักได้เท่านั้น" })
                                                                    return
                                                                }
                                                            } else {
                                                                if (!formValues[name]?.icd) {
                                                                    form.setFields([
                                                                        {
                                                                            name: ["diagnosis", name, "icd"],
                                                                            value: detail.icd,
                                                                        },
                                                                        {
                                                                            name: ["diagnosis", name, "type"],
                                                                            value: "1",
                                                                        },
                                                                    ]);
                                                                }
                                                                if (detail?.ucChronic) {
                                                                    notiWarning({ message: `รหัสโรค ${detail?.icd} ${v}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง สปสช." })
                                                                }
                                                                if (detail?.sscChronic) {
                                                                    notiWarning({ message: `รหัสโรค ${detail?.icd} ${v}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง ประกันสังคม" })
                                                                }
                                                            }
                                                        } else {//มี Record เดียว
                                                            if (!formValues[name]?.icd) {
                                                                form.setFields([
                                                                    {
                                                                        name: ["diagnosis", name, "icd"],
                                                                        value: detail.icd,
                                                                    },
                                                                ]);
                                                                if (detail?.pdx === "Y") {
                                                                    form.setFields([
                                                                        {
                                                                            name: ["diagnosis", name, "type"],
                                                                            value: "1",
                                                                        },
                                                                    ]);
                                                                }
                                                                if (detail?.ucChronic) {
                                                                    notiWarning({ message: `รหัสโรค ${detail?.icd} ${v}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง สปสช." })
                                                                }
                                                                if (detail?.sscChronic) {
                                                                    notiWarning({ message: `รหัสโรค ${detail?.icd} ${v}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง ประกันสังคม" })
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                />
                                {/* ICD */}
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *ICD10
                                        </label>
                                    }
                                    width={100}
                                    render={(text, record, i) => {
                                        const name = record.index
                                        return <Form.Item
                                            name={[name, "icd"]}
                                            style={{ margin: 0 }}
                                        >
                                            <SelectIcdDocFav
                                                codeset='IT'
                                                onChange={(v, obj) => {
                                                    const finded = find(listChkFirstChr, (o) => o === obj?.icd[0]);
                                                    if (finded) form.setFields([{ name: ["diagnosis", name, "type"], value: "5" }])
                                                    const formValues = form.getFieldValue("diagnosis") || [];
                                                    const filterNoCurrent = filter(formValues, (o, i) => i !== name)
                                                    if (filterNoCurrent?.length > 0 && obj?.pdx === "Y") {
                                                        let findPrincipal = find(filterNoCurrent, ["type", "1"])
                                                        if (findPrincipal) {
                                                            form.setFields([{ name: ["diagnosis", name, "icd"], value: null }])
                                                            notiWarning({ message: "มีการคีย์รหัสโรคหลักแล้ว", description: "รหัสที่เลือก คีย์เป็นรหัสหลักได้เท่านั้น", })
                                                            return
                                                        }
                                                    } else if (obj?.pdx === "Y") {
                                                        form.setFields([{ name: ["diagnosis", name, "type"], value: "1" }]);
                                                    }
                                                    if (!formValues[name]?.diagnosis) {
                                                        form.setFields([
                                                            {
                                                                name: ["diagnosis", name, "icd"],
                                                                value: obj.icd,
                                                            },
                                                            {
                                                                name: ["diagnosis", name, "diagnosis"],
                                                                value: obj.diagnosis,
                                                            },
                                                            {
                                                                name: ["diagnosis", name, "editStatus"],
                                                                value: true,
                                                            },
                                                        ]);
                                                    }
                                                    let filteredData = filter(
                                                        formValues,
                                                        (o, i) => i !== name
                                                    );
                                                    let findedData = find(
                                                        filteredData,
                                                        (o) => o.icd === v
                                                    );
                                                    form.setFields([
                                                        {
                                                            name: ["diagnosis", name, "icd"],
                                                            value: obj.icd,
                                                        },
                                                        {
                                                            name: ["diagnosis", name, "editStatus"],
                                                            value: true,
                                                        },
                                                    ]);
                                                    if (findedData) {
                                                        // setVisivbleIcdDupModal(true);
                                                    }
                                                    if (obj?.ucChronic) {
                                                        notiWarning({ message: `รหัสโรค ${obj?.icd} ${obj?.diagnosis}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง สปสช." })

                                                    }
                                                    if (obj?.sscChronic) {
                                                        notiWarning({ message: `รหัสโรค ${obj?.icd} ${obj?.diagnosis}`, description: "เป็นรหัสกลุ่มโรคเรื้อรัง ประกันสังคม" })
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    }}
                                />
                                {/* ผู้ Audit ICD10 */}
                                <Column
                                    title={<label className="gx-text-primary fw-bold">ผู้ Audit ICD10</label>}
                                    width={160}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <Form.Item
                                                name={[name, "userAudit"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <Select
                                                    dropdownMatchSelectWidth={280}
                                                    allowClear={true}
                                                    showSearch={true}
                                                    optionFilterProp="label"
                                                    onChange={() => {
                                                        form.setFields([
                                                            {
                                                                name: ["diagnosis", name, "editStatus"],
                                                                value: true,
                                                            },
                                                        ]);
                                                    }}
                                                    className="data-value"
                                                    disabled={
                                                        form.getFieldsValue()?.drgLockFlag
                                                    }
                                                    options={optionsUsers}
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                />
                                {/* ผู้ลง ICD */}
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            *ผู้ลง ICD
                                        </label>
                                    }
                                    width={175}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <Row gutter={4} style={{ flexDirection: "row" }}>
                                                <Col span={17}>
                                                    <Form.Item name={[name, "doctor2"]} hidden>
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name={[name, "doctor"]}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: "กรุณาเลือกผู้ลง ICD!",
                                                            },
                                                        ]}
                                                        style={{ marginTop: 0, marginBottom: 0 }}
                                                    >
                                                        <Select
                                                            style={{ width: "100%" }}
                                                            dropdownMatchSelectWidth={280}
                                                            allowClear={true}
                                                            showSearch={true}
                                                            optionFilterProp="label"
                                                            options={optionsDoctor}
                                                            onChange={(v) => {
                                                                // setLastActor(v)
                                                                form.setFields([
                                                                    {
                                                                        name: [
                                                                            "diagnosis",
                                                                            name,
                                                                            "editStatus",
                                                                        ],
                                                                        value: true,
                                                                    },
                                                                ]);
                                                                let list =
                                                                    form.getFieldsValue()?.diagnosis[name]
                                                                        ?.doctor2;
                                                                let finding = find(list || [], [
                                                                    "userId",
                                                                    v,
                                                                ]);
                                                                if (finding) {
                                                                    notiWarning({ message: "เลือกแพทย์ซ้ำกัน !", description: "กรุณาเลือกใหม่" })
                                                                    form.setFields([
                                                                        {
                                                                            name: ["diagnosis", name, "doctor"],
                                                                            value: null,
                                                                        },
                                                                    ]);
                                                                }
                                                                setFriend(!friend);
                                                            }}
                                                            className="data-value"
                                                            disabled={form.getFieldValue("drgLockFlag")}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={7} className="text-end">
                                                    <Tooltip
                                                        title={() => {
                                                            const doctor2 = form.getFieldValue("diagnosis")[name]?.doctor2;
                                                            return (
                                                                <>
                                                                    {doctor2?.length > 0 &&
                                                                        doctor2.map((o) => (
                                                                            <>
                                                                                <label key={nanoid()}>
                                                                                    {o.userName || o.userId} ,
                                                                                </label>
                                                                            </>
                                                                        ))}
                                                                    {doctor2?.length === 0 && "เพิ่มแพทย์"}
                                                                </>
                                                            );
                                                        }}
                                                        color={"green"}
                                                    >
                                                        <Badge
                                                            count={
                                                                form.getFieldsValue().diagnosis[name]
                                                                    ?.doctor2?.length
                                                            }
                                                            size="small"
                                                            color="blue"
                                                            showZero
                                                            offset={[0, 10]}
                                                        >
                                                            <Button
                                                                size="small"
                                                                shape="circle"
                                                                icon={
                                                                    <UsergroupAddOutlined
                                                                        style={{ color: "green" }}
                                                                    />
                                                                }
                                                                style={{ margin: 0, marginTop: 5 }}
                                                                onClick={() => {
                                                                    const doctor2 = form.getFieldsValue().diagnosis[name]?.doctor2;
                                                                    formAddDoctor.setFieldsValue({ users: doctor2, });
                                                                    setCurrentRowDiag(name);
                                                                    setVisAddDoctorModal(true);
                                                                }}
                                                                disabled={
                                                                    form.getFieldsValue()?.drgLockFlag
                                                                        ? true
                                                                        : form.getFieldsValue().diagnosis[
                                                                            name
                                                                        ]?.doctor
                                                                            ? false
                                                                            : true
                                                                }
                                                            />
                                                        </Badge>
                                                    </Tooltip>
                                                </Col>
                                            </Row>
                                        );
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            Type
                                        </label>
                                    }
                                    // align="right"
                                    width={120}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <Form.Item
                                                name={[name, "type"]}
                                                // fieldKey={[fieldKey, 'type']}
                                                rules={[
                                                    { required: true, message: "กรุณาเลือก Type!" },
                                                ]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <Select
                                                    style={{ width: "100%" }}
                                                    dropdownMatchSelectWidth={180}
                                                    optionFilterProp="children"
                                                    showSearch
                                                    onChange={() => {
                                                        setFriend(!friend);
                                                        form.setFields([
                                                            {
                                                                name: ["diagnosis", name, "editStatus"],
                                                                value: true,
                                                            },
                                                        ]);
                                                    }}
                                                    className="data-value"
                                                    disabled={form.getFieldsValue()?.drgLockFlag}
                                                >
                                                    {options.diagType.map((val, index) => (
                                                        <Option
                                                            key={index}

                                                            value={val.datavalue}
                                                            dataother={val.dataother1}
                                                            datadisplay={val.datadisplay}
                                                            disabled={disabledDiagType(val.datavalue)}
                                                            className="data-value"
                                                        >
                                                            {`${val.datavalue} ${val.datadisplay}`}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        );
                                    }}
                                />
                                {/* issue 680 หน้า 6.1 และ 6.2 เอาสถานะและด้านออก */}
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            สถานะ
                                        </label>
                                    }
                                    width={100}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <Form.Item
                                                name={[name, "diagDeadStatus"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <Select
                                                    style={{ width: "100%" }}
                                                    dropdownMatchSelectWidth={245}
                                                    optionFilterProp="label"
                                                    className="data-value"
                                                    options={options.IpdDeadStatusDiag}
                                                    onChange={() => {
                                                        form.setFields([
                                                            {
                                                                name: ["diagnosis", name, "editStatus"],
                                                                value: true,
                                                            },
                                                        ]);
                                                    }}
                                                />
                                            </Form.Item>
                                        );
                                    }}
                                />
                                <Column
                                    title={
                                        <label className="gx-text-primary fw-bold">
                                            ผู้แก้ไข
                                        </label>
                                    }
                                    width={145}
                                    render={(text, record) => {
                                        const name = record.index
                                        return (
                                            <Form.Item
                                                name={[name, "userModified"]}
                                                style={{ marginTop: 0, marginBottom: 0 }}
                                            >
                                                <Select
                                                    allowClear={true}
                                                    showSearch={true}
                                                    optionFilterProp="label"
                                                    disabled
                                                    className="data-value"
                                                    options={optionsDoctor}
                                                />
                                            </Form.Item>
                                        );
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
                                        return (
                                            <>
                                                <Form.Item name={[name, "ipdDiagId"]} hidden>
                                                    <Input /* disabled={allowIcdAction} */ />
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
                                                        // shape="circle"
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
                                            </>
                                        );
                                    }}
                                />
                            </Table>
                        </div>
                    </div>
                }}
            </Form.List>
        </Form>
    };
    return <>
        <Collapse
            // bordered={false}
            defaultActiveKey={['1']}
        >
            <Panel
                key="1"
                header={<LabelTopicPrimary text='วินิจฉัยโรคICD10' />}
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
                                document.getElementById("add-ipd-diag-11-16").click()
                            }}
                        />
                    </div>
                }
            >
                {PartsTableForm()}
            </Panel>
        </Collapse>
        {/* Modal */}
        {PartsModalAddDoctor()}
    </>
}
const listChkFirstChr = ["V", "W", "X", "Y"]
const apis = {
    GetDiagTypes: {
        url: "Masters/GetDiagTypes",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetMasterDropdown: {
        url: "OpdRightVisit/GetDataMasterforDropdown?",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetIcdsRediags: {
        url: "Masters/GetIcdsRediags",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetUserMas: {
        url: "Masters/GetUserMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
    GetDoctorMas: {
        url: "Masters/GetDoctorMas",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
}
