import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Modal, Row, Col, Form, InputNumber, Button, Table, Popconfirm, Spin } from 'antd';
import Column from 'antd/lib/table/Column';
import DayjsDatePicker from "../../../components/DatePicker/DayjsDatePicker";
import { DivScrollX } from "../../helper/DivScroll";
import {toNumber} from "lodash";
import { getDateCalculatExpenses } from '../../../components/helper/GetDateCalculatExpenses';
import { calculatDayOrDrug } from '../../helper/DrugCalculatOrder';
import { useExpenseListContext } from "../../../routes/OpdClinic/Views/OpdDrugCharge";
import dayjs from 'dayjs';
import { DeleteOutlined } from '@ant-design/icons';
import { InsNewOrderListFinanceWithAppoint, UpdateListFinanceAppointRefill } from "./Api/RefillModalApi";
import { toast } from 'react-toastify';

const toastSetting = {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    className: "toastBodyClassName"
}


export function AlertRefillModal(props) {
    let {
        visible,
        setVisible,
        setRefillVisible = () => { },
        saveOrderInPage = () => { },
    } = props;

    const exitBtn = () => {
        saveOrderInPage();
        setVisible(false);
    }

    const okBtn = () => {
        setRefillVisible(true);
        setVisible(false);
    }

    return (
        <Modal
            visible={visible}
            centered
            title={<strong><label>สั่งยาเกินจำนวน</label></strong>}
            width={600}
            onCancel={exitBtn}
            closable={false}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="cancel" onClick={exitBtn}>ออก</Button>
                    <Button type="primary" key="save" onClick={okBtn}>ตกลง</Button>
                </Row>
            ]}
        >
            <Row justify='center'><label className='gx-text-primary'>ในใบสั่งยานี้มีการสั่งยาที่จำนวนวันเกินกว่า {JSON.parse(localStorage.getItem("hos_param"))?.lockDrugOrderQty} วัน</label></Row>
            <Row justify='center'><label className='gx-text-primary'>ต้องการสร้างใบสั่งยาเพื่อทำใบสั่งยา Refill หรือไม่</label></Row>
        </Modal>
    )
}

export function Alert2RefillModal(props) {
    let {
        visible,
        setVisible,
        setRefillVisible = () => { },
        saveOrderInPage = () => { },
    } = props;

    const exitBtn = () => {
        saveOrderInPage();
        setVisible(false);
    }

    const okBtn = () => {
        setRefillVisible(true);
        setVisible(false);
    }

    return (
        <Modal
            visible={visible}
            centered
            // title={<strong><label>สั่งยาเกินจำนวน</label></strong>}
            width={600}
            onCancel={exitBtn}
            closable={false}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="cancel" onClick={exitBtn}>ปิด</Button>
                    <Button type="primary" key="save" onClick={okBtn}>ตกลง</Button>
                </Row>
            ]}
        >
            <Row justify='center'><label className='gx-text-primary'>ผู้ป่วยมียอดเบิกไม่ได้ต้องการทำยา Refill หรือไม่</label></Row>
        </Modal>
    )
}

export function RefillModal(props) {
    let {
        visible,
        setVisible,
        orderFinances = [],
        getSendMedOrder = () => { },
        getParamPatient = () => { },
        tabCardRef,
        setSelectFinancesDrug = () => { },
        chkEditRefill,
    } = props;
    console.log(orderFinances, "orderFinances");
    const [loading, setLoading] = useState(false);
    const { expenseList } = useExpenseListContext();
    const [form] = Form.useForm();
    const drugOrderRef = useRef([]);
    // const defalutOrder = 2;
    const [defalutOrder, setDefalutOrder] = useState(2);
    const [drugOrderList, setDrugOrderList] = useState([]);

    const closeModal = () => {
        setVisible(false);
    }

    const drugRefill = (action) => {
        let numDays = toNumber(JSON.parse(localStorage.getItem("hos_param"))?.lockDrugOrderQty);
        let newDrugOrder = orderFinances.filter(drug => toNumber(drug.duration) >= numDays);
        let newNumDate = null;
        switch (action) {
            case "changeNumDate": newNumDate = form.getFieldValue("numDate"); break;
            case "changeNextDate": newNumDate = dayjs(form.getFieldValue("nextDate")).startOf("date").diff(dayjs().startOf("date"), "d"); break;
            default: newNumDate = numDays;
        }
        // console.log(newNumDate,"newNumDate");
        newDrugOrder = newDrugOrder.map(drug => {
            let newcalculat = calculatDayOrDrug({
                value: newNumDate,
                field: "จน.วัน",
                expenseList: expenseList,
                data: drug,
                dataCalculatExpense: drug?.dataCalculatExpense,
                selectRight: drug?.rightId,
                chkdayjs: true
            })
            // let newcalculat = calculatDayOrDrug(newNumDate, "จน.วัน", expenseList, drug, drug?.dataCalculatExpense, drug?.rightId,true);
            let dataFinnance = newcalculat?.newcalculateExpense;
            console.log(newcalculat, "newcalculat");
            return ({
                ...drug,
                duration: newNumDate,
                quantity: newcalculat?.numOfDrugs,
                docQty: newcalculat?.docQty,
                rate: dataFinnance?.rate,
                amount: dataFinnance?.amount,
                credit: dataFinnance?.credit,
                cashReturn: dataFinnance?.cashReturn,
                cashNotReturn: dataFinnance?.cashNotReturn,
            })
        })
        console.log(newDrugOrder, "newDrugOrder");
        form.setFieldsValue({
            numDate: newNumDate,
            nextDate: dayjs().add(newNumDate, "day")
        })
        let newDrugOrderList = [];
        for (let i = 0; i < defalutOrder; i++) {
            newDrugOrderList.push({ defalutData: newDrugOrder });
        }
        // console.log(newDrugOrderList,"newDrugOrderList");
        setDrugOrderList(newDrugOrderList);
    }

    const disabledDate = (date) => {
        console.log(date, "disabled");
        console.log(dayjs(form.getFieldValue("startDate")).add(-1, "day").endOf("date"), "disabled");
        return date < dayjs().endOf("date")
    }

    const addOrder = () => {
        setDefalutOrder(prev => prev + 1);
        let newDrugOrder = drugOrderRef.current[0].getData();
        setDrugOrderList(prev => [...prev, { defalutData: newDrugOrder }])
    }

    const saveDrugRefill = async () => {
        let orderList = [];
        for (let i = 0; i < defalutOrder; i++) {
            let numDate = form.getFieldValue("numDate");
            console.log(numDate, "numDate");
            let appointDate = dayjs().add((i * numDate), "day").format("YYYY-MM-DD HH:mm:ss")
            console.log(dayjs().add((i * numDate), "day"), "numDate");
            let newDrugOrder = drugOrderRef.current[i].getData();
            console.log(newDrugOrder, "newDrugOrder");
            if (i === 0 && chkEditRefill === false) {
                let numDays = toNumber(JSON.parse(localStorage.getItem("hos_param"))?.lockDrugOrderQty);
                let oldDrug = orderFinances.filter(drug => toNumber(drug.duration) < numDays);
                newDrugOrder = [...oldDrug, ...newDrugOrder]
            }
            newDrugOrder = getSendMedOrder(newDrugOrder, i === 0 ? undefined : "Y", i === 0 ? undefined : appointDate, true);
            orderList.push({ defalutData: newDrugOrder });
        }
        console.log(orderList, "saveDrugRefillorderList");
        let paramPatient = getParamPatient();
        let resData = null;
        if (chkEditRefill) {
            resData = await UpdateListFinanceAppointRefill({ orderList: orderList, paramPatient: paramPatient });
        } else {
            resData = await InsNewOrderListFinanceWithAppoint({ orderList: orderList, paramPatient: paramPatient });
        }
        if (resData?.isSuccess) {
            let tempOrderNo = resData?.id;
            let financesDrug = await tabCardRef?.current.getOpdFinancesDrug();
            setSelectFinancesDrug(financesDrug.find(val => val.orderId === tempOrderNo));
            toast.success((chkEditRefill ? 'แก้ไข' : 'สร้าง') + 'ใบสั่งยา Refill สำเร็จ', toastSetting);
        } else {
            toast.error((chkEditRefill ? 'แก้ไข' : 'สร้าง') + 'ใบสั่งยา Refill ไม่สำเร็จ', toastSetting);
        }
        closeModal();
    }

    const editDrugRefill = async () => {
        setLoading(true);
        let newDrugOrderList = [];
        let orderFinancesList = orderFinances.sort((a, b) => a?.drugno - b?.drugno);
        for (let order of orderFinancesList) {
            console.log(order, "newDrugOrderList");
            order.expenses = await Promise.all(
                order?.expenses.map(async (val) => {
                    let dateCalculate = await getDateCalculatExpenses({
                        expenseId: val?.expenseId,
                        rightId: val?.rightId,
                    });
                    return {
                        ...val,
                        dosingInterval: val?.dosingInterval ? val.dosingInterval.split(',') : [],
                        startDate: val.startDate ? dayjs(val.startDate, "MM/DD/YYYY") : null,
                        endDate: val.endDate ? dayjs(val.endDate, "MM/DD/YYYY") : null,
                        dataCalculatExpense: dateCalculate,
                    }
                })
            )
            newDrugOrderList.push({ defalutData: order?.expenses });
        }
        console.log(newDrugOrderList, "newDrugOrderList");
        form.setFieldsValue({
            numDate: orderFinancesList[1]?.expenses[0]?.duration,
            nextDate: dayjs(orderFinancesList[1]?.appointDate, "DD/MM/BBBB")
        });
        setDrugOrderList(newDrugOrderList);
        setDefalutOrder(orderFinancesList.length);
        setLoading(false);
    }

    useEffect(() => {
        if (chkEditRefill) {
            editDrugRefill();
        } else {
            drugRefill();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Modal
            visible={visible}
            title={<label className='topic-green-bold'>ใบสั่งยา Refill</label>}
            width={1200}
            onCancel={() => closeModal()}
            closable={false}
            footer={[
                <Row justify="center" key="footer">
                    <Button key="cancel" onClick={() => closeModal()}>ออก</Button>
                    <Button type="primary" key="save" onClick={saveDrugRefill}>บันทึก</Button>
                </Row>
            ]}
        >
            <Spin spinning={loading}>
                <Form form={form} layout='vertical'>
                    <Row align='middle' style={{ flexDirection: "row" }}>
                        <Col span={6}>
                            <Form.Item
                                label={<label className="gx-text-primary">จำนวนวันนัดต่อใบสั่งยา</label>}
                                name="numDate"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <InputNumber
                                    addonAfter="วัน"
                                    onChange={() => drugRefill("changeNumDate")}
                                    min={1}
                                    disabled={chkEditRefill}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={<label className="gx-text-primary">นัดครั้งถัดไป</label>}
                                name="nextDate"
                                rules={[
                                    {
                                        required: true,
                                        message: "ระบุ"
                                    }
                                ]}
                            >
                                <DayjsDatePicker
                                    allowClear={false}
                                    style={{ width: '100%' }}
                                    format={"DD/MM/YYYY"}
                                    form={form}
                                    name="nextDate"
                                    disabledDate={disabledDate}
                                    onChange={() => drugRefill("changeNextDate")}
                                    disabled={chkEditRefill}
                                />
                            </Form.Item>
                        </Col>
                        {chkEditRefill ?
                            null
                            :
                            <Col span={2}>
                                <Button
                                    type='primary'
                                    style={{ marginBottom: 0 }}
                                    onClick={addOrder}
                                >
                                    +
                                </Button>
                            </Col>
                        }
                    </Row>
                    <DivScrollX width={"100%"} >
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
                            {drugOrderList.map((val, index) => (
                                <div key={index} style={{ width: 500, marginRight: 8 }}>
                                    <DrugOrder
                                        key={index}
                                        defalutData={val.defalutData}
                                        orderIndex={index}
                                        chkEditRefill={chkEditRefill}
                                        ref={el => drugOrderRef.current[index] = el}
                                        lastRemove={(orderIndex) => {
                                            let newDrugOrderList = [];
                                            for (let i = 0; i < defalutOrder; i++) {
                                                newDrugOrderList.push({ defalutData: drugOrderRef.current[i].getData() })
                                            }
                                            newDrugOrderList.splice(orderIndex, 1);
                                            console.log(newDrugOrderList, "newDrugOrderList");
                                            setDrugOrderList(newDrugOrderList);
                                            setDefalutOrder(prev => prev - 1);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </DivScrollX>
                </Form>
            </Spin>
        </Modal>
    )
}

const DrugOrder = forwardRef(function DrugOrder({ defalutData = [], orderIndex, chkEditRefill, lastRemove = () => { }}, ref) {
    console.log(defalutData, "defalutData");
    // const [dataSource, setDataSource] = useState(defalutData);
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        getData: () => form.getFieldValue("dataList")
    }));

    useEffect(() => {
        form.setFieldsValue({ dataList: defalutData });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defalutData])

    return (
        <Form form={form} /* initialValues={{ dataList:defalutData }} */>
            <Form.List name="dataList">
                {(fields, { remove }) => (
                    <Table
                        dataSource={fields}
                        style={{ width: 500 }}
                    >
                        <Column
                            title={<label className="gx-text-primary">ใบสั่งยา {orderIndex + 1}</label>}
                            width={350}
                            render={(record, row, index) => {
                                // index = (pageCurrent - 1) * pageSize + index;
                                let rowRecord = form.getFieldValue("dataList")[index];
                                console.log(form.getFieldValue("dataList"), "rowRecord");
                                console.log(rowRecord, "rowRecord");
                                return (
                                    <>
                                        <div>{rowRecord?.expenseName || rowRecord?.expensename}</div>
                                        <div style={{ paddingLeft: 5, color: "#c2d5bb" }}>
                                            {rowRecord?.docLabel1 ? rowRecord.docLabel1 + " , " : null}
                                            {rowRecord?.docLabel2 ? rowRecord.docLabel2 + " , " : null}
                                            {rowRecord?.docLabel3 ? rowRecord.docLabel3 + " , " : null}
                                            {rowRecord?.docLabel4 ? rowRecord.docLabel4 + " , " : null}
                                            {rowRecord?.drugLabelName}
                                        </div>
                                    </>
                                );
                            }}
                        />
                        <Column
                            title={<label className="gx-text-primary">จำนวน</label>}
                            width={150}
                            render={(record, row, index) => {
                                // index = (pageCurrent - 1) * pageSize + index;
                                return (
                                    <Form.Item name={[index, "quantity"]} noStyle>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            controls={false}
                                        />
                                    </Form.Item>
                                );
                            }}
                        />
                        {orderIndex === 0 ?
                            null
                            :
                            <>
                                {chkEditRefill ?
                                    null
                                    :
                                    <Column
                                        width={50}
                                        render={(record, row, index) => {
                                            // index = (pageCurrent - 1) * pageSize + index;
                                            return (
                                                <Popconfirm
                                                    title="ต้องการลบหรือไม่?"
                                                    onConfirm={() => {
                                                        remove(index);
                                                        if (fields?.length === 1) {
                                                            lastRemove(orderIndex)
                                                        }
                                                    }}
                                                >
                                                    <button className="btn-table deleterow">
                                                        <DeleteOutlined />
                                                    </button>
                                                </Popconfirm>
                                            );
                                        }}
                                    />
                                }
                            </>
                        }
                    </Table>
                )}
            </Form.List>
        </Form>
    )
})