import React, { useEffect, useState } from 'react'
import { Button, Col, Modal, Row, Select } from 'antd'
import { DivScrollY } from 'components/helper/DivScroll';
import * as api from "./Api/DruginDGApi";

export default function DrugGroups({
    visible,
    setVisible,
    optionsDrugGroup = [],
}) {

    const [expenseInDG, setExpenseInDG] = useState([]);
    const [drugGroupValue, setdDrugGroupValue] = useState(null);

    const getAllExpenseInDrugGroup = async (group) => {
        if (!group) return setExpenseInDG([])
        let res = await api.GetAllExpenseInDrugGroup(group);
        // console.log(res);
        setExpenseInDG(res?.responseData || [])
    }
    useEffect(() => {
        const group = optionsDrugGroup?.length ? optionsDrugGroup[0].datavalue : null
        getAllExpenseInDrugGroup(group)
        setdDrugGroupValue(group)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsDrugGroup])
    return (
        <Modal
            title={
                <Row align='middle' gutter={[4, 4]}>
                    <Col>
                        <label className='gx-text-primary fw-bold fs-5' >กลุ่มยา </label>
                    </Col>
                    <Col>
                        <Select
                            size='small'
                            className='data-value'
                            optionFilterProp='label'
                            value={drugGroupValue}
                            style={{ width: 400 }}
                            options={optionsDrugGroup.map(o => {
                                return {
                                    value: o.datavalue,
                                    label: o.datadisplay,
                                    className: 'data-value'
                                }
                            })}
                            onChange={v => {
                                getAllExpenseInDrugGroup(v)
                                setdDrugGroupValue(v)
                            }}
                        />
                    </Col>
                </Row>
            }
            centered
            visible={visible}
            onCancel={() => setVisible(false)}
            closable={false}
            width={600}
            bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
            footer={[
                <Row justify="center" key="footer">
                    <Button type='default' key="cancel"
                        onClick={() => {
                            setVisible(false);
                        }}
                    >ปิด</Button>
                </Row>]}
        >

            <DivScrollY height={500}>
                <label className='gx-text-primary fw-bold d-block mt-2 mb-1 fs-6'>ยาในกลุ่ม</label>
                {expenseInDG.map((val, index) => (
                    <label key={index} className='data-value d-block mb-1'>{index + 1}. {val?.expenseName}</label>
                ))}
            </DivScrollY>
        </Modal>
    )
}
