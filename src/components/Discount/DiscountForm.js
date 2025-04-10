import { Button, Col, Form, Input, Row, Select } from "antd"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GetDiscountHistory } from "./TableDiscount";
import { map, find, toNumber, intersectionBy, } from "lodash";

const { Option } = Select;

export default function DiscountForm({
    opdipd = "O",
    form,
    onFinish,
    selectedRowRecord = [],
    reload,
    sumCash = () => { },
    customCalcDscAndCrd = null,
    ...props
}) {
    const {
        opdPatientDetail
    } = useSelector(({
        opdPatientDetail
    }) => opdPatientDetail);
    const {
        selectPatient
    } = useSelector(({
        patient
    }) => patient);

    const discountValue = Form.useWatch("discountId", form)

    const [listDiscountNo, setListDiscountNo] = useState([])

    const getDiscountList = async () => {
        let patient = opdipd === "O" ? opdPatientDetail : selectPatient;
        const formValues = form.getFieldValue()

        if (!patient?.patientId) return

        let req = {
            patientId: patient?.patientId,
            // serviceId: patient?.serviceId,
            admitId: patient?.admitId || null,
            opdipd: opdipd,
            discountId: null
        };
        let res = await GetDiscountHistory(req);
        if (res?.isSuccess) {
            const filterA = res.responseData.filter((v) => v.discountStatus === "A")
            setListDiscountNo(filterA);

            if (filterA.length && !formValues?.discountId) {
                form.setFieldsValue({
                    discountId: filterA[0].discountId,
                    limit: filterA[0].limit,
                    discount: filterA[0].discount,
                    remark: filterA[0].remark
                })
            }

            if (formValues?.discountId) {
                const findCurrent = res.responseData.find((v) => v.discountId === formValues?.discountId)
                if (!findCurrent) {
                    form.setFieldsValue({
                        discountId: null,
                        limit: 0,
                        discount: 0,
                        remark: ""
                    })
                    return
                }
                form.setFieldsValue({
                    discountId: findCurrent.discountId,
                    limit: findCurrent.limit,
                    discount: findCurrent.discount,
                    remark: findCurrent.remark
                })
            }



        } else {
            setListDiscountNo([]);
        }
    };

    const addValuesToChildren = (index, value, columnName, type) => {
        const formValues = form.getFieldsValue()

        const clcDscNumber = (number) => {
            let list = formValues?.listBill
            let discount = number
            let intersectionsA = intersectionBy(list, selectedRowRecord, 'key')
            let mapping = map(list, x => {
                let finded = find(intersectionsA, ['key', x.key])
                if (finded) {
                    let amount = x.amount
                    let credit = x.credit
                    let cashReturn = x.cashReturn
                    let cashNotReturn = amount - credit - cashReturn
                    let prevChildrenDiscount = discount > cashNotReturn ? cashNotReturn : discount
                    x.discount = prevChildrenDiscount < 0 ? 0 : prevChildrenDiscount
                    x.overdue = cashNotReturn - prevChildrenDiscount
                    return x
                } else return x
            })


            form.setFieldsValue({
                listBill: mapping
            });
        }

        const clcPercent = (percent) => {
            let list = formValues?.listBill
            let intersectionsA = intersectionBy(list, selectedRowRecord, 'key')
            let mapping = map(list, x => {
                let finded = find(intersectionsA, ['key', x.key])
                if (finded) {
                    let amount = x.amount
                    let credit = x.credit
                    let cashReturn = x.cashReturn
                    let cashNotReturn = amount - credit - cashReturn
                    let discount = percent ? (cashNotReturn * toNumber(percent)) / 100 : 0
                    let prevChildrenDiscount = discount > cashNotReturn ? cashNotReturn : discount
                    x.discount = prevChildrenDiscount < 0 ? 0 : prevChildrenDiscount
                    x.overdue = cashNotReturn - prevChildrenDiscount
                    return x
                } else return x
            })
            form.setFieldsValue({
                listBill: mapping
            });
        }

        if (columnName === "discount") {

            if (type === "dscNumber") {
                clcDscNumber(value)
            }

            if (type === 'dscPercent') {
                clcPercent(value)
            }
        }
    }

    const calcDscAndCrd = () => {
        if (customCalcDscAndCrd) return customCalcDscAndCrd()
        let formValues = form.getFieldsValue()
        let dscPercent = formValues.discountPercent
        let dscNumber = formValues.discountAmount


        if (dscPercent) {
            addValuesToChildren(null, toNumber(dscPercent), 'discount', 'dscPercent')
        }
        if (dscNumber) {
            addValuesToChildren(null, toNumber(dscNumber), 'discount', 'dscNumber')
        }

        if (!dscNumber && !dscPercent) {
            addValuesToChildren(null, 0, 'discount', 'dscNumber')
        }

        sumCash()
    }

    useEffect(() => {
        calcDscAndCrd()
    }, [selectedRowRecord])

    useEffect(() => {
        getDiscountList();

        return () => {
            setListDiscountNo([]);
        };
    }, [opdPatientDetail, selectPatient, reload]);

    return <Form
        form={form}
        onFinish={onFinish}
        layout={"vertical"}
    >
        <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
            <Col>
                <Form.Item name="discountId"
                    label={<label className="topic-green">เลขที่ส่วนลด</label>}
                >
                    <Select
                        style={{ width: 100 }}
                        className="data-value"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        onChange={(v) => {
                            if (v) {
                                const findDiscount = listDiscountNo.find((d) => d.discountId === v)
                                form.setFieldsValue({
                                    limit: findDiscount.limit,
                                    balance: findDiscount.balance,
                                    total: findDiscount.total,
                                    remark: findDiscount.remark,
                                    discount: findDiscount.discount,
                                    discountPercent: null,
                                    discountAmount: null
                                })
                            } else {
                                form.setFieldsValue({
                                    limit: 0,
                                    balance: 0,
                                    total: 0,
                                    remark: "",
                                    discountPercent: null,
                                    discountAmount: null,
                                    discount: 0
                                })
                            }
                        }}
                    >
                        {listDiscountNo.map(item =>
                            <Option
                                key={item.discountId}
                                value={item.discountId}
                                className="data-value"
                            >
                                {item.discountId}
                            </Option>
                        )}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item name="limit"
                    label={<label className="topic-green">วงเงินส่วนลด</label>}
                >
                    <Input
                        style={{ width: "100%" }}
                        disabled
                    />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item name="discount"
                    label={<label className="topic-green">ส่วนลดที่ใช้ไป</label>}
                >
                    <Input
                        style={{ width: "100%" }}
                        disabled
                    />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[8, 8]} style={{ flexDirection: "row" }}>
            <Col span={4}>
                <Form.Item name="discountPercent"
                    label={<label className="topic-green">%ส่วนลด</label>}
                >
                    <Input
                        type="number"
                        style={{ width: "100%" }}
                        min={0}
                        step="0.01"
                        disabled={discountValue && selectedRowRecord.length > 0 ? false : true}
                        onChange={(v) => {

                            form.setFieldsValue({
                                discountAmount: null
                            })
                        }}
                        onBlur={(e) => {
                            calcDscAndCrd()
                        }}
                        onPressEnter={(e) => {
                            calcDscAndCrd()
                        }}
                    />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="discountAmount"
                    label={<label className="topic-green">จำนวนเงินส่วนลด</label>}
                >
                    <Input
                        style={{ width: "100%" }}
                        min={0}
                        disabled={discountValue && selectedRowRecord.length > 0 ? false : true}
                        onChange={(v) => {
                            form.setFieldsValue({
                                discountPercent: null
                            })
                        }}
                        onBlur={(e) => {
                            calcDscAndCrd()
                        }}
                        onPressEnter={(e) => {
                            calcDscAndCrd()
                        }}
                    />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginBottom: -2 }}>
            <Col span={24}>
                <Form.Item name="remark"
                    label={<label className="topic-green">หมายเหตุ</label>}
                >
                    <Input.TextArea disabled />
                </Form.Item>
            </Col>
        </Row>
        <Button id="DiscountFormReload" hidden onClick={() => getDiscountList()} />
    </Form>
}