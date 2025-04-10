import { env } from '../../env.js';

import { EditOutlined, UserSwitchOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Col,
	Form,
	Layout,
	Row,
	Select,
	Table,
	Tooltip,
} from 'antd';
import Axios from 'axios';
import UpsertFinancesModal from 'components/Modal/UpsertFinancesModal';
import ConcatBillGroupName from 'components/helper/function/ConcatBillGroupName';
import dayjs from 'dayjs';
import { filter, groupBy, map, sumBy, toNumber, uniqBy } from 'lodash';
import _uniqueId from 'lodash/uniqueId';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
	GetFinancesType,
	opdFinancesRightsListInfoFetch,
} from 'routes/Information/API/InformationSummaryOpdFinances';
import 'routes/Information/Views/InformationSummaryOpdFinances/style/SummaryOpdFinances.less';
import { momentEN, momentTH } from '../helper/convertMoment';
const { Option } = Select;
const { Content } = Layout;
const columns = [
	{
		dataIndex: 'isEdit',
		width: 50,
	},
	{
		title: 'รายการ',
		dataIndex: 'billGroup_Name',
		width: 350,
		render(v, r) {
			// console.log('v', r)
			return (
				<>
					<label>
						{v} {r?.cscd || null}
					</label>
					{r?.expenseId ? (
						<label>
							<Tooltip
								placement="top"
								color={'blue'}
								title={
									<>
										<label className="data-value">
											ผู้บันทึก : {r?.userCreatedName || '-'}
										</label>
										<br />
										<label className="data-value">
											เวลา :{' '}
											{r?.dateCreated
												? dayjs(r?.dateCreated, 'MM/DD/YYYY HH:mm').format(
														'DD/MM/BBBB HH:mm'
													)
												: '-'}
										</label>
										<br />
										<label className="data-value">
											ผู้แก้ไข : {r?.userModifiedName || '-'}
										</label>
										<br />
										<label className="data-value">
											เวลา :{' '}
											{r?.dateModified
												? dayjs(r?.dateModified, 'MM/DD/YYYY HH:mm').format(
														'DD/MM/BBBB HH:mm'
													)
												: '-'}
										</label>
									</>
								}
							>
								<Button
									size="small"
									style={{ margin: 0 }}
									icon={<UserSwitchOutlined className="gx-text-primary" />}
								/>
							</Tooltip>
						</label>
					) : (
						''
					)}
				</>
			);
		},
	},
	// {
	//   title: 'วันที่บันทึก',
	//   dataIndex: 'dateCreated'
	// },
	{
		title: 'จำนวนเงิน',
		dataIndex: 'amount',
	},
	{
		title: 'เครดิต',
		dataIndex: 'credit',
	},
	{
		title: 'เบิกได้',
		dataIndex: 'cashReturn',
		render(text) {
			return {
				children: <div>{text}</div>,
			};
		},
	},
	{
		title: 'เบิกไม่ได้',
		dataIndex: 'cashNotReturn',
		render(text) {
			return {
				props: {
					style: {
						color: 'red',
					},
				},
				children: <div>{text}</div>,
			};
		},
	},
	{
		title: 'รพ. ร่วมจ่าย',
		dataIndex: 'offer',
		render(text) {
			return {
				children: <div>{text}</div>,
			};
		},
	},
	{
		title: 'ส่วนลด',
		dataIndex: 'discount',
	},
	{
		title: 'ชำระเเล้ว',
		dataIndex: 'payment',
	},
	{
		title: 'ค้างชำระ',
		dataIndex: 'overdue_todate',
		render(text) {
			return {
				props: {
					style: {
						color: 'red',
					},
				},
				children: <div>{text}</div>,
			};
		},
	},
];
const useStyle = {
	header: {
		col: {
			color: 'white',
		},
		img: {
			borderRadius: '50%',
			width: 100,
			height: 100,
		},
	},
	layout: {
		backgroundColor: 'white',
	},
};
export default function PatientDetailsMedicalExpenses({
	onFinished = () => {},
	opdRightIdMainFlagY = null,
	rightIdMainFlagY = null,
	doctorId = null,
	...props
}) {
	// console.log('PatientDetailsMedicalExpenses', props)
	const [form] = Form.useForm();
	const onFinish = async (values) => {
		opdFinancesRightsRef.current = values.opdFinancesRightsListInfo;
		getOpdFinancesBillgroupsInfo(values);
	};
	const [list, setList] = useState([]);
	// console.log('list', list)
	const [listLoading, setListLoading] = useState(false); // default true

	const [filterHc, setFilterHc] = useState(null);
	const [listDetailTotal, setListDetailTotal] = useState();
	// console.log(listDetailTotal);
	const [opdFinancesRightsListInfo, setOpdFinancesRightsListInfo] =
		useState(null);
	const opdFinancesRightsRef = useRef('1');
	const history = useHistory();
	const [vsbUpsertFinances, setVsbUpsertFinances] = useState(false);

	const getOpdFinancesBillgroupsInfo = async () => {
		let formValues = form.getFieldsValue();
		if (!formValues?.opdFinancesRightsListInfo) {
			setList([]);
			getSum([]);
			return;
		}
		if (formValues?.opdFinancesRightsListInfo === '1') {
			if (!props?.opdRightId) {
				setList([]);
				getSum([]);
				return;
			}
		}
		if (formValues?.opdFinancesRightsListInfo === '2') {
			if (!props?.clinicId) {
				setList([]);
				getSum([]);
				return;
			}
		}
		if (formValues?.opdFinancesRightsListInfo === '3') {
			if (!props?.serviceId) {
				setList([]);
				getSum([]);
				return;
			}
		}
		setListLoading(true);
		form.setFieldsValue({
			chkSSOHC: false,
			chkNHSOHC: false,
		});
		const value = {
			mode: null,
			user: null,
			ip: null,
			lang: null,
			branch_id: null,
			requestData: {
				patientId: props?.patientId,
				clinicDate: null,
				opdRightId: props?.opdRightId ? `${props?.opdRightId}` : null,
				clinicId: props?.clinicId || null,
				serviceId: props?.serviceId || null,
				billgroup: null,
				dataDisplay: formValues?.opdFinancesRightsListInfo || null,
				financeType: formValues?.financeType || null,
			},
			barcode: null,
		};
		try {
			const result = await Axios.post(
				`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdFinancesInfo/GetOpdFinancesBillgroupsInfo`,
				value
			);
			// console.log('GetOpdFinancesBillgroupsInfo : ', result.data.responseData);

			const dataMain = result.data.responseData;
			const lookup = dataMain.reduce((a, e) => {
				a[e.billgroup] = ++a[e.billgroup] || 0;
				return a;
			}, {});
			const uniqBillGroup = dataMain.filter((e) => lookup[e.billgroup]);
			const groupBill = groupBy(uniqBillGroup, 'billgroup');
			let arrTemp = [];
			for (const [, value] of Object.entries(groupBill)) {
				const check = uniqBy(value, (item) => item.dateCreated);
				if (check.length >= 2) {
					const tt = value[value.length - 1].deatils;
					// console.log(tt);
					value[value.length - 1].sum_Amount = sumBy(tt, (item) =>
						toNumber(item.amount)
					);
					value[value.length - 1].sum_Credit = sumBy(tt, (item) =>
						toNumber(item.credit)
					);
					value[value.length - 1].sum_Claim = sumBy(tt, (item) =>
						toNumber(item.claim)
					);
					value[value.length - 1].sum_Copay = sumBy(tt, (item) =>
						toNumber(item.copay)
					);
					value[value.length - 1].sum_Discount = sumBy(tt, (item) =>
						toNumber(item.discount)
					);
					value[value.length - 1].sum_CashReturn = sumBy(tt, (item) =>
						toNumber(item.cashReturn)
					);
					value[value.length - 1].sum_Payment = sumBy(tt, (item) =>
						toNumber(item.payment)
					);
					value[value.length - 1].sum_CashNotReturn = sumBy(tt, (item) =>
						toNumber(item.cashNotReturn)
					);
					value[value.length - 1].dateCreated =
						tt[tt.length - 1].detail.split(' - ')[0];
					value[value.length - 1].sum_overdue_todate = sumBy(value, (item) =>
						toNumber(item.sum_overdue_todate)
					);
					arrTemp.push(value[value.length - 1]);
				}
			}
			const replaceData = dataMain.map(
				(obj) => arrTemp.find((o) => o.billgroup === obj.billgroup) || obj
			);
			const finalData = uniqBy(replaceData, 'billgroup');
			if (result.status === 200) {
				let tempList = [];
				// eslint-disable-next-line array-callback-return
				finalData.map((val, index) => {
					// console.log(finalData[0].deatils)
					let tempSubList = [];
					// eslint-disable-next-line array-callback-return
					val.deatils.map((valSub) => {
						tempSubList.push({
							...valSub,
							key: _uniqueId('prefix-'),
							billGroup_Name: `${valSub.detail.split(' - ')[0]} - ${valSub.expenseName}`,
							// dateCreated: valSub.dateCreated,
							isEdit:
								valSub.isEdit === '0' ? (
									<button
										style={{
											width: 18,
											height: 18,
										}}
										className="btn-table editrow me-1"
										onClick={() => {
											history.push({
												pathname:
													'/physical%20therapy/physical-therapy-non-drug-charge',
												patient: {
													orderId: valSub.orderId,
													patientId: props?.patientId,
													serviceId: props?.serviceId,
												},
											});
										}}
									>
										<EditOutlined
											style={{
												fontSize: 12.5,
											}}
										/>
									</button>
								) : null,
							amount: Intl.NumberFormat('en').format(valSub.amount) + '.-',
							cashNotReturn:
								Intl.NumberFormat('en').format(valSub.cashNotReturn) + '.-',
							cashReturn:
								Intl.NumberFormat('en').format(valSub.cashReturn) + '.-',
							claim: Intl.NumberFormat('en').format(valSub.claim) + '.-',
							copay: Intl.NumberFormat('en').format(valSub.copay) + '.-',
							discount: Intl.NumberFormat('en').format(valSub.discount) + '.-',
							payment: Intl.NumberFormat('en').format(valSub.payment) + '.-',
							credit: Intl.NumberFormat('en').format(valSub.credit) + '.-',
							overdue_todate:
								Intl.NumberFormat('en').format(valSub.overdue_todate) + '.-',
							offer: Intl.NumberFormat('en').format(valSub.offer) + '.-',
						});
					});

					const billGroupName = ConcatBillGroupName(
						val?.billGroup_Name,
						val?.billGroup_EName
					);
					tempList.push({
						key: billGroupName,
						billGroup_Name: billGroupName,
						billgroup: val.billgroup,
						amount: Intl.NumberFormat('en').format(val.sum_Amount) + '.-',
						cashNotReturn:
							Intl.NumberFormat('en').format(val.sum_CashNotReturn) + '.-',
						cashReturn:
							Intl.NumberFormat('en').format(val.sum_CashReturn) + '.-',
						claim: Intl.NumberFormat('en').format(val.sum_Claim) + '.-',
						copay: Intl.NumberFormat('en').format(val.sum_Copay) + '.-',
						discount: Intl.NumberFormat('en').format(val.sum_Discount) + '.-',
						payment: Intl.NumberFormat('en').format(val.sum_Payment) + '.-',
						credit: Intl.NumberFormat('en').format(val.sum_Credit) + '.-',
						overdue_todate:
							Intl.NumberFormat('en').format(val.sum_overdue_todate) + '.-',
						offer: Intl.NumberFormat('en').format(val.sum_Offer) + '.-',
						children: tempSubList,
					});
				});

				setList(tempList);
				getSum(finalData);
				setListLoading(false);
			} else {
				console.log(result.status);
			}
		} catch (err) {
			setList([]);
			getSum([]);
			setListLoading(false);
		}
		setListLoading(false);
	};
	const getSum = (data) => {
		let amountTotal = 0;
		let claimTotal = 0;
		let copayTotal = 0;
		let discountTotal = 0;
		let paymentTotal = 0;
		let creditTotal = 0;
		let overdueTodateTotal = 0;
		let cashNotReturn = 0;
		let cashReturn = 0;
		let offer = 0;
		// eslint-disable-next-line array-callback-return
		data.map((val) => {
			amountTotal += Number(val.sum_Amount);
			claimTotal += Number(val.sum_Claim);
			copayTotal += Number(val.sum_Copay);
			discountTotal += Number(val.sum_Discount);
			paymentTotal += Number(val.sum_Payment);
			creditTotal += Number(val.sum_Credit);
			overdueTodateTotal += Number(val.sum_overdue_todate);
			cashReturn += Number(val.sum_CashReturn);
			cashNotReturn += Number(val.sum_CashNotReturn);
			offer += Number(val.sum_Offer);
		});
		setListDetailTotal({
			amountTotal,
			claimTotal,
			copayTotal,
			discountTotal,
			paymentTotal,
			creditTotal,
			overdueTodateTotal,
			cashReturn,
			cashNotReturn,
			offer,
		});
	};
	const getApiDropdownOpdFinancesRight = async () => {
		const result = await opdFinancesRightsListInfoFetch();
		setOpdFinancesRightsListInfo(result);
	};
	const [financeTypeList, setFinanceTypeList] = useState([]);
	const getFinanceType = async () => {
		let res = await GetFinancesType();
		setFinanceTypeList(res);
	};
	useEffect(() => {
		let opdFinancesRightsListInfo = form.getFieldValue(
			'opdFinancesRightsListInfo'
		);
		if (!opdFinancesRightsListInfo) {
			form.setFieldsValue({
				opdFinancesRightsListInfo: '1',
			});
		}
		getApiDropdownOpdFinancesRight();
		getFinanceType();
		momentTH();
		return () => {
			momentEN();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		getOpdFinancesBillgroupsInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.opdRightId, props?.clinicId, props?.serviceId]);
	useEffect(() => {
		props.setFinanceTotalProp && props.setFinanceTotalProp(listDetailTotal);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [listDetailTotal]);
	const chkSSOHC = Form.useWatch('chkSSOHC', form);
	const chkNHSOHC = Form.useWatch('chkNHSOHC', form);
	const filterHcFinance = (sso, nhso) => {
		if (!sso && !nhso) return setFilterHc(null);
		if (sso && nhso) {
			let mapping = map(list, (o) => {
				let children = filter(o.children, (x) => x.ssoHc || x.nhsoHc);
				return {
					...o,
					children: children,
				};
			});
			return setFilterHc(filter(mapping, (o) => o.children.length));
		}
		if (sso) {
			let mapping = map(list, (o) => {
				let children = filter(o.children, 'ssoHc');
				return {
					...o,
					children: children,
				};
			});
			return setFilterHc(filter(mapping, (o) => o.children.length));
		}
		if (nhso) {
			let mapping = map(list, (o) => {
				let children = filter(o.children, 'nhsoHc');
				return {
					...o,
					children: children,
				};
			});
			// console.log('filter :>> ', mapping);
			return setFilterHc(filter(mapping, (o) => o.children.length));
		}
	};
	useEffect(() => {
		filterHcFinance(chkSSOHC, chkNHSOHC);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chkSSOHC, chkNHSOHC]);

	return (
		<>
			<div className="site-card-border-less-wrapper">
				<Card
					title={
						<Row gutter={24} align="middle">
							<Col>
								<label className="gx-text-primary fs-5 fw-bold me-3">
									รายละเอียดค่าใช้จ่าย
								</label>
							</Col>
							<Col>
								<div
									style={{
										float: 'right',
									}}
								>
									{opdFinancesRightsListInfo ? (
										<Form layout="vertical" form={form} onFinish={onFinish}>
											<Row
												gutter={8}
												style={{
													flexDirection: 'row',
												}}
											>
												<Col>
													<Form.Item
														name="financeType"
														style={{ marginBottom: 0 }}
													>
														<Select
															style={{
																width: 175,
															}}
															showSearch
															placeholder="ประเภทค่าใช้จ่าย"
															optionFilterProp="children"
															onChange={() => {
																form.submit();
															}}
															allowClear
															dropdownMatchSelectWidth={false}
															className="data-value"
														>
															{financeTypeList.map((val, i) => (
																<Option
																	key={i}
																	value={val.datavalue}
																	className="data-value"
																>
																	{val.datadisplay}
																</Option>
															))}
														</Select>
													</Form.Item>
												</Col>
												<Col span={12}>
													<Form.Item
														name="opdFinancesRightsListInfo"
														style={{ marginBottom: 0 }}
													>
														<Select
															style={{
																width: 175,
															}}
															showSearch
															placeholder="มุมมองตามสิทธิ์"
															optionFilterProp="children"
															onChange={() => {
																form.submit();
															}}
															allowClear={false}
															dropdownMatchSelectWidth={false}
															className="data-value"
														>
															{opdFinancesRightsListInfo.map((value, index) => (
																<Option
																	key={index}
																	value={value.dataValue}
																	className="data-value"
																>
																	{value.dataDisplay}
																</Option>
															))}
														</Select>
													</Form.Item>
												</Col>
											</Row>
										</Form>
									) : (
										<></>
									)}
								</div>
							</Col>
							<Col>
								<Form layout="vertical" form={form} onFinish={onFinish}>
									<Form.Item
										name="chkSSOHC"
										style={{ margin: 0 }}
										valuePropName="checked"
									>
										<Checkbox>
											<label className="gx-text-primary">
												เฉพาะสิทธิ์ประกันสังคม
											</label>
										</Checkbox>
									</Form.Item>
								</Form>
							</Col>
							<Col>
								<Form layout="vertical" form={form} onFinish={onFinish}>
									<Form.Item
										name="chkNHSOHC"
										style={{
											margin: 0,
										}}
										valuePropName="checked"
									>
										<Checkbox>
											<label className="gx-text-primary">
												เฉพาะสิทธิ์ สปสช.
											</label>
										</Checkbox>
									</Form.Item>
								</Form>
							</Col>
							<Col>
								<Form layout="vertical" form={form} onFinish={onFinish}>
									<Form.Item style={{ margin: 0 }}>
										<Button
											type="primary"
											style={{ margin: 0 }}
											onClick={() => setVsbUpsertFinances(true)}
											disabled={!opdRightIdMainFlagY}
										>
											เพิ่มค่าใช้จ่าย
										</Button>
									</Form.Item>
								</Form>
								<Button
									hidden
									id="Reload_Finances_10.14"
									onClick={(e) => {
										e.stopPropagation();
										// console.log('Reload_Finances_10.14 :>> ');
										getOpdFinancesBillgroupsInfo();
									}}
								/>
							</Col>
						</Row>
					}
					bordered={false}
					className="mb-2"
				>
					<div style={{ margin: -20 }}>
						<Table
							scroll={{ x: 1200, y: 600 }}
							loading={listLoading}
							columns={columns}
							dataSource={filterHc ? filterHc : list}
							rowClassName={(record) =>
								record.isEdit ? 'data-value edit-row' : 'data-value'
							}
							pagination={{
								pageSize: 20,
								showSizeChanger: false,
							}}
						/>
						<style jsx>
							{`
								.edit-row {
									background-color: #f0f0f0;
									color: #333;
								}
							`}
						</style>
					</div>
				</Card>

				<Layout style={useStyle.layout}>
					<Content className="layout-content-master">
						<Row gutter={[16, 24]}>
							<Col span={4}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										จำนวนเงินรวม
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										เครดิต
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										เบิกได้
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="fw-bold text-danger"
										style={{
											float: 'right',
										}}
									>
										เบิกไม่ได้
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										รพ. รวมจ่าย
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										ส่วนลด
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="gx-text-primary"
										style={{
											float: 'right',
										}}
									>
										ชำระเเล้ว
									</label>
								</strong>
							</Col>
							<Col span={2}>
								<strong>
									<label
										className="fw-bold text-danger"
										style={{
											float: 'right',
										}}
									>
										ค้างชำระ
									</label>
								</strong>
							</Col>
						</Row>
						<Row gutter={[16, 24]}>
							<Col span={4}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.amountTotal
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.creditTotal
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.cashReturn
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right font-color-red">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.cashNotReturn
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(listDetailTotal.offer)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.discountTotal
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.paymentTotal
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
							<Col span={2}>
								<p className="layout-right font-color-red">
									{listDetailTotal ? (
										<span>
											{Intl.NumberFormat('en').format(
												listDetailTotal.overdueTodateTotal
											)}
										</span>
									) : (
										<span> - </span>
									)}
								</p>
							</Col>
						</Row>
					</Content>
				</Layout>
			</div>
			{/* เพิ่มค่าใช้จ่าย */}
			<UpsertFinancesModal
				visible={vsbUpsertFinances}
				close={() => setVsbUpsertFinances(false)}
				patientId={props?.patientId}
				serviceId={props?.serviceId}
				clinicId={props?.clinicId}
				rightId={rightIdMainFlagY}
				opdRightId={opdRightIdMainFlagY}
				orderId={null}
				doctorId={doctorId}
				opdIpd="O"
				page={'10.14'}
				workId={props?.clinicDeatails?.workId}
				appointId={null}
				onFinished={() => {
					onFinished(props?.opdRightId);
				}}
			/>
		</>
	);
}
