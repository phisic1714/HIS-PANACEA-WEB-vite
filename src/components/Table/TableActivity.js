import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Redux
import { dspIcd9Cm } from '../../appRedux/actions';
import { map, filter } from 'lodash';
import {
	Row,
	Col,
	Form,
	Select,
	Button,
	Spin,
	Popconfirm,
	Table,
	Input,
	AutoComplete,
	// ConfigProvider,
} from 'antd';
import { labelTopicPrimary } from '../helper/function/GenLabel';
//Noti
import { notificationX as notiX } from '../Notification/notificationX';
import FavoriteProcedures from '../Modal/FavoriteProcedures';
// Functins
import { callApi } from '../helper/function/CallApi';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const user = userFromSession.responseData.userId;

export default function TableActivity({
	patientId = null,
	serviceId = null,
	clinicId = null,
	reloadIcd = 0,
	form,
	onFinish = () => { },
	doctor = null,
	page = null,
	getOpdClinicDetails = () => { },
}) {
	// useDispatch
	const dispatch = useDispatch();
	// useSelector
	const { icd9Cm } = useSelector(({ getDropdownMaster }) => getDropdownMaster);
	// Ref
	const keywordRef = useRef(null);
	// State
	const [IsDropDownLoaded, setIsDropDownLoaded] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingIcd9, setLoadingIcd9] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [listOpdPrc, setListOpdPrc] = useState([]);
	const [, setListOpdPrcDiffDoctor] = useState([]);
	// const [vsbFavorite, setVsbFavorite] = useState(false);

	// Functions
	const getIcd9 = async () => {
		if (icd9Cm?.length) return;
		setLoadingIcd9(true);
		let req = {
			datakey1: user,
			datakey2: '0',
			datakey3: '1000000',
			datakey4: 'OP',
			datakey5: null,
		};
		let res = await callApi(listApi, 'GetIcdsRediags', req);
		res = map(res, (o, i) => {
			let key = String(i);
			return {
				key: key,
				value: key,
				icd: o.datavalue,
				label: `${o.datavalue} ${o.datadisplay}`,
				procedure: o?.datadisplay,
				className: 'data-value',
			};
		});
		dispatch(dspIcd9Cm(res));
		setLoadingIcd9(false);
	};
	const getOpdProcedures = async (clinicId) => {
		if (!clinicId) return;
		setLoading(true);
		let req = {
			serviceId,
			patientId,
		};
		let res = await callApi(listApi, 'GetOpdProcedures', req);
		let filterPrc = filter(res, ['clinicId', clinicId]);
		filterPrc = map(filterPrc, (o) => {
			return {
				doctor: o.doctor,
				serviceId: serviceId,
				clinicId: o.clinicId,
				procedureId: o.procedureId,
				icd: o.icd,
				procedure: o.procedure,
				extension: o.extension,
				seq: o.seq,
			};
		});
		setListOpdPrc(filterPrc);
		if (page === '30.3') {
			filterOpdPrcByDoctor(doctor, filterPrc);
		} else {
			setListOpdPrc([]);
			setListOpdPrcDiffDoctor([]);
			form.setFieldsValue({ activities: filterPrc });
		}
		setLoading(false);
	};
	const loadMoreData = (isScroll) => {
		let dataSourceICD = icd9Cm;
		if (keywordRef.current) {
			let keyword = keywordRef.current.toLowerCase();
			if (isScroll) {
				let filterByKeyword = filter(dataSourceICD, (o) =>
					o.label.toLowerCase().includes(keyword)
				);
				if (dataSource.length === filterByKeyword.length) {
					return;
				}
				let filterByIndex = filter(
					filterByKeyword,
					(o, i) => i <= dataSource.length + 100
				);
				setDataSource(() => filterByIndex);
			} else {
				let filterByKeyword = filter(dataSourceICD, (o) =>
					o.label.toLowerCase().includes(keyword)
				);
				let filterByIndex = filter(filterByKeyword, (o, i) => i <= 100);
				// let mapping = map(filterByIndex, o => {
				//     return {
				//         ...o,
				//         label: renderBold(o.label, keywordRef.current)
				//     }
				// })
				setDataSource(() => filterByIndex);
			}
		} else {
			let filtered = filter(
				dataSourceICD,
				(o, i) => i <= dataSource.length + 100
			);
			setDataSource(() => filtered);
		}
	};
	const delRow = async (crrIndex, crrRow) => {
		console.log('crrRow :>> ', crrRow);
		let activities = form.getFieldsValue().activities;
		let newData = filter(activities, (o, i) => i !== crrIndex);
		if (!crrRow?.activityId) {
			form.setFieldsValue({
				activities: newData,
			});
		}
		if (crrRow?.activityId) {
			setLoading(true);
			let res = await callApi(
				listApi,
				'DeleteOpdProcedures',
				crrRow.activityId
			);
			notiX(res?.isSuccess, 'ลบ Procedure');
			if (res?.isSuccess) {
				if (page === '30.3') {
					getOpdClinicDetails();
					getOpdProcedures(clinicId);
				} else {
					form.setFieldsValue({ procedures: newData });
				}
			}
			setLoading(false);
		}
	};
	const filterOpdPrcByDoctor = (doctor, listOpdPrc) => {
		if (!doctor) return form.setFieldsValue({ activities: [] });
		let filterByDoctor = filter(listOpdPrc, ['doctor', doctor]);
		let filterByDiffDoctor = filter(listOpdPrc, (o) => o.doctor !== doctor);
		setListOpdPrcDiffDoctor(filterByDiffDoctor);
		form.setFieldsValue({ activities: filterByDoctor });
	};
	// Effect
	useEffect(() => {
		if (!clinicId) return;
		if (!IsDropDownLoaded) {
			setIsDropDownLoaded(true);
			getIcd9();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [IsDropDownLoaded, clinicId]);
	useEffect(() => {
		getOpdProcedures(clinicId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reloadIcd, clinicId]);
	useEffect(() => {
		if (page === '30.3') {
			filterOpdPrcByDoctor(doctor, listOpdPrc);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [doctor]);

	const columns = [
		// Procedures
		{
			title: labelTopicPrimary('กิจกรรม'),
			render: (v, r, i) => {
				return (
					<div>
						<Form.Item name={[i, 'activity']} style={{ margin: 0 }}>
							<AutoComplete
								// size='small'
								allowClear
								dropdownMatchSelectWidth={400}
								optionFilterProp="label"
								options={dataSource}
								className="data-value"
								onClick={() => {
									keywordRef.current = null;
									loadMoreData(false);
								}}
								onKeyUp={(e) => {
									if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return;
									keywordRef.current = e.target.value;
									setTimeout(() => {
										loadMoreData(false);
									}, 200);
								}}
								onBlur={() => {
									keywordRef.current = null;
									setDataSource([]);
								}}
								onPopupScroll={(e) => {
									e.persist();
									let target = e.target;
									if (
										Math.ceil(target.scrollTop) + target.offsetHeight >=
										target.scrollHeight
									) {
										loadMoreData(true);
									}
								}}
								onChange={() => {
									form.setFields([
										{ name: ['activities', i, 'isEdit'], value: true },
									]);
								}}
								onSelect={(v, detail) => {
									form.setFields([
										{ name: ['activities', i, 'isEdit'], value: true },
										{
											name: ['activities', i, 'activity'],
											value: detail?.procedure,
										},
									]);
									if (!r.icd) {
										form.setFields([
											{ name: ['activities', i, 'icd'], value: detail?.icd },
										]);
									}
								}}
							>
								<Input.TextArea
									// size='small'
									autoSize
									style={{ width: '100%' }}
									className="data-value"
								/>
							</AutoComplete>
						</Form.Item>
					</div>
				);
			},
		},
		// EXT
		{
			title: labelTopicPrimary('ICD10'),
			width: 90,
			render: (v, r, i) => {
				return (
					<div>
						<Form.Item name={[i, 'icd10']} style={{ margin: 0 }}>
							<Input
								// size='small'
								onChange={() => {
									form.setFields([
										{ name: ['activities', i, 'isEdit'], value: true },
									]);
								}}
							/>
						</Form.Item>
					</div>
				);
			},
		},
		// ICD
		{
			title: labelTopicPrimary('ICD9'),
			width: 100,
			render: (v, r, i) => {
				return (
					<div>
						<Form.Item
							name={[i, 'icd9']}
							style={{ margin: 0 }}
							rules={[
								{
									required: true,
									message: 'จำเป็น',
								},
							]}
						>
							<Select
								// size='small'
								loading={loadingIcd9}
								style={{ width: '100%' }}
								dropdownMatchSelectWidth={400}
								options={dataSource}
								optionFilterProp={'label'}
								optionLabelProp="icd"
								showSearch
								// allowClear
								className="data-value"
								onClick={() => {
									keywordRef.current = null;
									loadMoreData(false);
								}}
								onKeyUp={(e) => {
									if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return;
									keywordRef.current = e.target.value;
									setTimeout(() => {
										loadMoreData(false);
									}, 200);
								}}
								onBlur={() => {
									keywordRef.current = null;
									setDataSource([]);
								}}
								onPopupScroll={(e) => {
									e.persist();
									let target = e.target;
									if (
										Math.ceil(target.scrollTop) + target.offsetHeight >=
										target.scrollHeight
									) {
										loadMoreData(true);
									}
								}}
								onChange={(v, detail) => {
									form.setFields([
										{ name: ['activities', i, 'isEdit'], value: true },
										{ name: ['activities', i, 'icd'], value: detail?.icd },
									]);
									// if (!r.procedure) {
									//     form.setFields([
									//         { name: ["procedures", i, "procedure"], value: detail?.procedure },
									//     ]);
									// }
								}}
							/>
						</Form.Item>
					</div>
				);
			},
		},
		// Action
		{
			title: ' ',
			width: 45,
			fixed: 'right',
			render: (v, r, i) => {
				return (
					<Popconfirm
						title="ลบจากระบบ?"
						onConfirm={() => delRow(i, r)}
						onCancel={() => { }}
						okText="ลบ"
						cancelText="ปิด"
					>
						<Button
							style={{ margin: 0 }}
							size="small"
							icon={<DeleteOutlined style={{ color: 'red' }} />}
						/>
					</Popconfirm>
				);
			},
		},
	];
	const TableHeader = (add) => {
		return (
			<Row
				gutter={[8, 8]}
				style={{
					flexDirection: 'row',
					// marginTop: -14,
					marginBottom: 4,
					// marginLeft: -20,
					// marginRight: -20,
				}}
				align="middle"
			>
				<Col span={12}>{labelTopicPrimary('กิจกรรมที่ดำเนินการ')}</Col>
				<Col span={12} className="text-end">
					<Button
						size="small"
						type="primary"
						style={{ margin: 0 }}
						icon={<PlusOutlined />}
						onClick={() => {
							add(
								{
									activityId: null,
									icd: null,
									procedure: null,
									extension: null,
								},
								0
							);
						}}
					/>
				</Col>
			</Row>
		);
	};
	return (
		<>
			<Form form={form} onFinish={onFinish} layout="vertical">
				<Form.List name={'activities'}>
					{(list, { add }) => {
						let formValues = form.getFieldsValue();
						// console.log('formValues :>> ', formValues);
						let activities = formValues?.activities || [];
						list = map(list, (val, i) => {
							let crrRow = activities[i];
							return {
								...crrRow,
								...val,
								key: String(i),
							};
						});
						// console.log('listFinance :>> ', listFinance);
						return (
							<Spin spinning={loading}>
								{TableHeader(add)}
								<div hidden={!list.length}>
									<Table
										size="small"
										// title={() => TableHeader(add)}
										rowClassName="data-value"
										scroll={{ x: 475, y: 240 }}
										dataSource={list}
										columns={columns}
										pagination={false}
									/>
								</div>
								<div
									className="text-center"
									hidden={list.length}
									style={{ backgroundColor: '#fafafa' }}
								>
									<label style={{ color: '#BDBDBD' }}>ไม่มีข้อมูล</label>
								</div>
							</Spin>
						);
					}}
				</Form.List>
			</Form>
		</>
	);
}
const listApi = [
	// GetIcdsRediags
	{
		name: 'GetIcdsRediags',
		url: 'Masters/GetIcdsRediags',
		method: 'POST',
		return: 'responseData',
		sendRequest: true,
	},
	// GetOpdProcedures
	{
		name: 'GetOpdProcedures',
		url: 'Reimbursement/GetOpdProceduresDetails',
		method: 'POST',
		return: 'responseData',
		sendRequest: true,
	},
	// DeleteOpdProcedures
	{
		name: 'DeleteOpdProcedures',
		url: 'OperationRoom/DeleteOpdProcedures/',
		method: 'DELETE',
		return: 'data',
		sendRequest: false,
	},
];
