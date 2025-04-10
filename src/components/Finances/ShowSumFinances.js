import React, { useEffect, useState } from 'react'
import {map , toNumber , sumBy} from 'lodash'
import { Col, Row, Statistic } from 'antd';
export default function ShowSumFinances({ dataSource = [] }) {
    const [sumFinances, setSumFinances] = useState(null);
    const sumListFinance = listFinance => {
        setSumFinances(null);
        if (!listFinance?.length) return;
        let mapping1 = map(listFinance, o => {
            return {
                cashReturn: o?.cashReturn ? toNumber(o.cashReturn) : 0,
                cashNotReturn: o?.cashNotReturn ? toNumber(o.cashNotReturn) : 0,
                amount: o?.amount ? toNumber(o.amount) : 0,
                credit: o?.credit ? toNumber(o.credit) : 0
            };
        });
        let sumAmount = sumBy(mapping1, "amount");
        let sumCredit = sumBy(mapping1, "credit");
        let sumCashReturn = sumBy(mapping1, "cashReturn");
        let sumCashNotReturn = sumBy(mapping1, "cashNotReturn");
        setSumFinances({
            sumAmount: sumAmount,
            sumCredit: sumCredit,
            sumCashReturn: sumCashReturn,
            sumCashNotReturn: sumCashNotReturn
        });
    };
    useEffect(() => {
        sumListFinance(dataSource)
    }, [dataSource])

    return <>
        <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
            <Col span={6} className='text-center'>
                <label className='gx-text-primary'>จำนวนเงินรวม</label>
                <Statistic precision={2} value={sumFinances?.sumAmount || 0} valueStyle={{ fontSize: 15 }} />
            </Col>
            <Col span={6} className='text-center'>
                <label className='gx-text-primary'>เครดิต</label>
                <Statistic precision={2} value={sumFinances?.sumCredit || 0} valueStyle={{ fontSize: 15 }} />
            </Col>
            <Col span={6} className='text-center'>
                <label className='gx-text-primary'>เบิกได้</label>
                <Statistic precision={2} value={sumFinances?.sumCashReturn || 0} valueStyle={{ fontSize: 15 }} />
            </Col>
            <Col span={6} className='text-center'>
                <label style={{ color: "red" }}>เบิกไม่ได้</label>
                <Statistic precision={2} value={sumFinances?.sumCashNotReturn || 0} valueStyle={{ fontSize: 15, color: "red" }} />
            </Col>
        </Row>
    </>
}
