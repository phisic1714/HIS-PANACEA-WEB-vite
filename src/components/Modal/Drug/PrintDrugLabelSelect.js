import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Row, Col, Select, Button, Table, Form, Modal, InputNumber } from 'antd';
import Column from 'antd/lib/table/Column';
import { useSelector } from "react-redux";
import { nanoid } from 'nanoid';
import { GetFinancesOrder } from "../../../routes/OpdClinic/API/OpdDrugChargeApi"
import { useForm } from 'antd/lib/form/Form';
import { getPdfFile } from '../../../components/qzTray/PrintFormReport';

export default forwardRef (function PrintDrugLabelSelect({ patientType="opd",  } , ref) {
    const [isVisible, setIsVisible] = useState(false);
    const { opdPatientDetail } = useSelector(({ opdPatientDetail }) => opdPatientDetail);
    const { selectPatient } = useSelector(({ patient }) => patient);
    const [loading, setLoading] = useState(false);
    const [pageOrderFinances, setPageOrderFinances] = useState(1);
    const pageSize = 5;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [form] = useForm();
    const [orderId, setOrderId] = useState(null);
    const selectOPDList = [
        { value: "DruglabelSelect", label: "ไทย" },
        { value: "DruglabelsSelectopdE", label: "อังกฤษ" },
    ];
    const selectIPDList = [
        { value: "DruglabelSelectipd", label: "ไทย" },
        { value: "DruglabelSelectipdE", label: "อังกฤษ" },
    ];


    useImperativeHandle(ref, () => ({
        setIsVisible: (props) => setIsVisible(props),
        setOrderId: (props) => setOrderId(props),
    }));

    useEffect(() => {
        if(isVisible){
            getFinancesOrder();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isVisible])

    const getFinancesOrder = async () => {
        setLoading(true);
        let patientId = patientType === "opd" ? opdPatientDetail.patientId : selectPatient.patientId;
        let resData = await GetFinancesOrder({ patientId: patientId, orderId: orderId });
        if(resData?.isSuccess){
            resData = resData?.responseData;
            resData = resData?.filter(val => val.financeType === "D" || val.financeType === "M");
            if (resData.length > 0) {
                resData = resData.map(val => {
                    return {
                        ...val,
                        key: nanoid(),
                        printCount: "1"
                    }
                })
            }
            form.setFieldsValue({ 
                selectFile: patientType === "opd" ? "DruglabelSelect" : "DruglabelSelectipd",
                drugList: resData 
            });
        }
        setLoading(false);
    }

    const rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        }
    }

    const onFinish = async(formvalue) => { console.log(formvalue);
    for await(let val of selectedRows){
        console.log(val,"valonFinish");
        let printcount = formvalue?.drugList.find(formval=>formval.financeId===val.financeId)?.printCount
        let param = {
            "@financeid": val.financeId,
            "@printcount": printcount.toString()
        }
        // let patientId = patientType === "opd" ? opdPatientDetail.patientId : selectPatient.patientId;
        // let checkPrint = await GetPrint(patientId, setParamData, param, null, module);
        // console.log(checkPrint);
        // let filePrint = checkPrint.find(val=> 
        //     val?.reportFile?.toLowerCase() === formvalue?.selectFile.toLowerCase() +".mrt" && val?.sqlFile?.toLowerCase() === formvalue?.selectFile.toLowerCase() + ".sql");
        // console.log(filePrint);
        await getPdfFile(
            null,
            null,
            formvalue?.selectFile.toLowerCase() +".mrt",
            formvalue?.selectFile.toLowerCase(),
            param,
            setLoading,
            null,
            false
        );
    }
}

    const closeModal = () => {
        setIsVisible(false);
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setPageOrderFinances(1);
    }

    return(
        <Modal title={<strong><label className="gx-text-primary">14.2.6 ระบุฉลากยาที่พิมพ์</label></strong>} 
        // centered
        visible={isVisible}
        onCancel={()=>closeModal()}
        closable={false}
        width="1200px"
        footer={[
            <Row justify="center" key="footer">
                <Button key="cancel" onClick={() => {closeModal()}}>ออก</Button>
                <Button key="ok" type="primary" disabled={selectedRowKeys.length===0}
                    onClick={() =>{
                        form.submit();
                        closeModal();
                    }}
                >
                    ตกลง
                </Button>
            </Row>
        ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Row justify="end" style={{ flexDirection: 'row', margin:0 }}>
                    <Col span={8}>
                        <Form.Item name="selectFile">
                            <Select placeholder="เลือกภาษา"
                                // allowClear
                                style={{ width: '100%' }}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                options={ patientType === "opd" ? 
                                    selectOPDList.map((n) => ({ value: n.value, label: n.label  })) 
                                    :
                                    selectIPDList.map((n) => ({ value: n.value, label: n.label  }))
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.List name="drugList">
                    {() => {
                        return (
                            <Table dataSource={form.getFieldValue("drugList")}
                                loading={loading}
                                pagination={{
                                    current: pageOrderFinances,
                                    pageSize: pageSize,
                                    showSizeChanger: false
                                }}
                                onChange={(n) => {
                                    setPageOrderFinances(n.current);
                                }}
                                rowSelection={rowSelection}
                                rowKey="financeId"
                            >
                                <Column title={<label className="gx-text-primary"><b>รายการยาเวชภัณฑ์</b></label>} 
                                    render={(record) => {
                                        return (
                                            <>
                                                <Row>
                                                    <Col span={24}>{record.expenseName}</Col>
                                                </Row>
                                                <div style={{ paddingLeft: 5, color: "#c2d5bb" }}>{record.drugLabelName?.replaceAll("\r\n", " , ")}</div>
                                            </>
                                        );
                                    }}
                                />
                                <Column title={<label className="gx-text-primary"><b>จำนวนสั่งพิมพ์</b></label>} 
                                    render={(text,record,index) => {
                                        let newindex = (pageOrderFinances - 1) * pageSize + index;
                                        return (
                                                <Form.Item
                                                    style={{ margin:0 }}
                                                    name={[newindex, "printCount"]}
                                                    rules={[{required: true, message:"ระบุ"}]}
                                                >
                                                    <InputNumber style={{ width: "100%" }} min={1} />
                                                </Form.Item>
                                        );
                                    }}
                                />
                            </Table>
                        )
                    }}
                </Form.List>
            </Form>
        </Modal>
    )
})
