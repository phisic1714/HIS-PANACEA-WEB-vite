import {
	DeleteOutlined,
	EditOutlined,
	ExclamationOutlined,
	FileTextOutlined,
	NotificationOutlined,
} from '@ant-design/icons';
import {
	Badge,
	Button,
	Col,
	Modal,
	Popconfirm,
	Row,
	Spin,
	Table,
	Tabs,
	Tooltip,
	Typography,
} from 'antd';
import { mappingOptions } from 'components/helper/function/MappingOptions';
import ShowUpsertLabResults from 'components/Modal/ShowUpsertLabResults';
import dayjs from 'dayjs';
import { filter, find, map } from 'lodash';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { callApiObject, callApis } from '../helper/function/CallApi';
import { notiError, notiSuccess, notiWarning } from '../Notification/notificationX';
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const user = userFromSession.responseData.userId;
export default function ShowFinances({
	clinicId = null,
	patientId = null,
	gender = null,
	serviceId = null,
	workId = null,
	doctor = null,
	dataSource = [],
	xrayResultCount = 0,
	labResultCount = 0,
	showLab = true,
	showBtnLabResult = false,
	showXray = true,
	showOrder = true,
	showMedication = true,
	onFinish = (isSuccess, message) => {
		console.log('message :>> ', isSuccess, message);
	},
	scrollY = 200,
	displayType = 'default',
}) {
	const history = useHistory();

	const [loading, setLoading] = useState(false);
	const [loadingNoResultModal, setLoadingNoResultModal] = useState(false);
	const [showNoResultModal, setShowNoResultModal] = useState(false);
	const [noResultData, setNoResultData] = useState({});
	const [financeDetails, setFinanceDetails] = useState(null);
	const [visibleUpsertLabResults, setVisibleUpsertLabResults] = useState(false);
	const [options, setOptions] = useState({
		reason: [],
	});
	const [selectedLabRows, setSelectedLabRows] = useState([])
	const [selectedXrayRows, setSelectedXrayRows] = useState([])
	const [selectedOderRows, setSelectedOderRows] = useState([])
	const [selectedMedRows, setSelectedMedRows] = useState([])

	const handleDelete = (selected, financeType) => async () => {
		const mapping = map(selected, o => {
			return {
				financeId: o,
				userModified: user,
				dateModified: dayjs().format("YYYY-MM-DD HH:mm")
			}
		})
		setLoading(p => !p);
		const res = await callApiObject(apis, "DelListFinance", mapping);
		setLoading(p => !p);
		if (res?.isSuccess) {
			notiSuccess({ message: "ลบค่ารายการ" })
			onFinish(true, financeType)
			setSelectedXrayRows([])
			setSelectedOderRows([])
			setSelectedMedRows([])
		}
		if (!res?.isSuccess) notiError({ message: "ลบค่ารายการ" })
	}
	// Funcs
	const getOptions = async () => {
		let [reason] = await Promise.all([
			callApis(apis['GetReasonsCancelOrRejectLab']),
		]);
		reason = mappingOptions({
			dts: reason,
			valueField: 'code',
			labelField: 'name',
		});
		setOptions((p) => {
			return {
				...p,
				reason: reason,
			};
		});
	};
	const delFinance = async (financeId, financeType) => {
		setLoading((p) => !p);
		let req = [
			{
				financeId,
				userModified: user,
				dateModified: dayjs().format('YYYY-MM-DD HH:mm'),
			},
		];
		let res = await callApiObject(apis, 'DelListFinance', req);
		setLoading((p) => !p);
		if (res?.isSuccess) {
			notiSuccess({ message: 'ลบค่ารักษา' });
			onFinish(true, financeType);
		}
		if (!res?.isSuccess) notiError({ message: 'ลบค่ารักษา' });
	};
	const handleNoResultModalClick = async (type, xrayResultCount) => {
		let count = xrayResultCount ? +xrayResultCount : 0;
		if (!count) return;
		setShowNoResultModal(true);
		setLoadingNoResultModal(true);
		let req = {
			clinicId: clinicId || null,
			patientId: patientId || null,
			serviceId: serviceId || null,
		};
		let res = await callApiObject(apis, 'GetPopupResult', req);
		if (res?.isSuccess) {
			let source =
				type === 'X-RAY' ? res?.responseData?.xray : res?.responseData?.lab;
			let data = {
				type: type,
				source: source.map((data) => ({
					...data,
					key: nanoid(),
					orderDate: data.orderDate
						? dayjs(data.orderDate, 'MM/DD/YYYY HH:mm')
							.locale('th')
							.format('DD MMM BB HH:mm')
						: '-',
				})),
			};
			setNoResultData(data);
		}
		if (!res?.isSuccess) {
			setNoResultData({
				type: type,
				source: [],
			});
		}
		setLoadingNoResultModal(false);
	};
	const mappingFinances = (dts = []) => {
		let temp = dts.map((o) => {
			const isDeleleAble = o.payment === '0.00' && o.reminburse === '0.00';
			let textColor = '';
			switch (o.status) {
				case 'A':
					textColor = 'blue';
					break;
				case 'R':
					textColor = 'red';
					break;
				case 'C':
					textColor = 'green';
					break;
				default:
					break;
			}
			return {
				...o,
				textColor,
				isDeleleAble,
			};
		});
		if (workId) temp = temp.filter((o) => o.fromWork === workId);
		return temp;
	};
	// Effect
	useEffect(() => {
		getOptions();
	}, []);
	let dataSourceLab = dataSource.filter((item) => item.financeType === 'L');
	let dataSourceXray = dataSource.filter((item) => item.financeType === 'X');
	let dataSourceOrder = dataSource.filter(
		(item) =>
			item.financeType !== 'X' &&
			item.financeType !== 'L' &&
			item.financeType !== 'M' &&
			item.financeType !== 'D'
	);
	let dataSourceMedication = dataSource.filter(
		(item) => item.financeType === 'M' || item.financeType === 'D'
	);
	dataSourceLab = mappingFinances(dataSourceLab);
	dataSourceXray = mappingFinances(dataSourceXray);
	dataSourceOrder = mappingFinances(dataSourceOrder);
	dataSourceMedication = mappingFinances(dataSourceMedication);
	const columnsLab = [
		{
			title:
				<label className="gx-text-primary" style={{ display: "flex", alignContent: "baseline" }}>
					Lab({dataSourceLab.length})
					<div onClick={() => handleNoResultModalClick("LAB", labResultCount)} style={{ marginRight: '0.5rem' }}>
						<Badge style={{ cursor: "pointer" }} size="small" count={labResultCount} >
							<NotificationOutlined style={{ fontSize: 16, cursor: "pointer" }} />
						</Badge>
					</div>
					<Popconfirm
						title="ลบที่เลือก ?"
						okText="ยืนยัน"
						cancelText="ปิด"
						onConfirm={handleDelete(selectedLabRows, "L")}
					>
						<Button
							type='danger'
							className='mb-0'
							size='small'
							disabled={selectedLabRows.length <= 0}
						>
							ลบที่เลือก
						</Button>
					</Popconfirm>
				</label>,
			dataIndex: 'expenseName',
			render: (val, record) => {
				// console.log('record', record)
				const filterByNumberRef = filter(
					record?.labResults,
					(o) => o.minNumberRef !== null && o.maxNumberRef !== null
				);
				const checkMinMax = find(
					filterByNumberRef,
					(o) =>
						o.numberValue < o.minNumberRef || o.numberValue > o.maxNumberRef
				);
				const reason = options.reason.find((o) => o.value === record.reason);
				return (
					<>
						<label
							style={{
								color: record?.textColor,
							}}
						>
							{val}
							{record?.status === 'R' && (
								<label className="ms-1">({reason?.label})</label>
							)}
							{checkMinMax && (
								<ExclamationOutlined
									style={{ fontSize: 16, fontWeight: 'bold' }}
								/>
							)}
						</label>
					</>
				);
			},
		},
		{
			title: 'จำนวนเงิน',
			dataIndex: 'amount',
			width: 90,
			align: 'right',
			render: (val, record) => {
				return (
					<label
						style={{
							color: record?.textColor,
						}}
					>
						{val}
					</label>
				);
			},
		},
		{
			title: 'เครดิต',
			dataIndex: 'credit',
			width: 90,
			align: 'right',
			render: (val, record) => {
				return (
					<label
						style={{
							color: record?.textColor,
						}}
					>
						{val}
					</label>
				);
			},
		},
		{
			title: 'เบิกได้',
			dataIndex: 'cashReturn',
			width: 90,
			align: 'right',
			render: (val, record) => {
				return (
					<label
						style={{
							color: record?.textColor,
						}}
					>
						{val}
					</label>
				);
			},
		},
		{
			title: 'เบิกไม่ได้',
			dataIndex: 'cashNotReturn',
			width: 90,
			align: 'right',
			render: (val, record) => {
				return (
					<label
						style={{
							color: record?.textColor,
						}}
					>
						{val}
					</label>
				);
			},
		},
		{
			title: ' ',
			dataIndex: 'financeId',
			width: 90,
			fixed: 'right',
			align: 'center',
			render: (val, record) => (
				<Row gutter={[2, 2]} style={{ flexDirection: 'row' }}>
					<Col span={8}>
						<Tooltip title="บันทึกผล Lab">
							<Button
								size={'small'}
								icon={<FileTextOutlined />}
								onClick={(e) => {
									e.stopPropagation();
									setFinanceDetails(record);
									setVisibleUpsertLabResults(true);
								}}
								className="mb-0"
								hidden={!showBtnLabResult}
							/>
						</Tooltip>
					</Col>
					<Col span={8}>
						<Button
							size={'small'}
							icon={
								<EditOutlined
									style={{
										color: 'blue',
									}}
								/>
							}
							onClick={() => {
								history.push({
									pathname: '/opd clinic/opd-clinic-opd-non-drug-charge',
									patient: record,
								});
							}}
							className="mb-0"
						// disabled={isIpd}
						/>
					</Col>
					<Col span={8}>
						<Popconfirm
							placement="top"
							title={'ลบจากระบบ'}
							onConfirm={() => delFinance(val, 'L')}
							okText="Yes"
							cancelText="No"
							disabled={!record?.isDeleleAble}
						>
							<Button
								size={'small'}
								// shape={"circle"}
								icon={
									<DeleteOutlined
										style={{
											color: 'red',
										}}
									/>
								}
								className="mb-0"
								disabled={!record?.isDeleleAble}
							/>
						</Popconfirm>
					</Col>
				</Row>
			),
		},
	];
	const columnsXRay = [
		{
			title: <label
				className="gx-text-primary"
				style={{ display: "flex", alignContent: "baseline" }}
			>
				X-Ray({dataSourceXray.length})
				<div onClick={() => handleNoResultModalClick("X-RAY", xrayResultCount)} style={{ marginRight: '0.5rem' }}>
					<Badge style={{ cursor: "pointer" }} size="small" count={xrayResultCount} >
						<NotificationOutlined style={{ fontSize: 16, cursor: "pointer" }} />
					</Badge>
				</div>
				<Popconfirm
					title="ลบที่เลือก ?"
					okText="ยืนยัน"
					cancelText="ปิด"
					onConfirm={handleDelete(selectedXrayRows, "X")}
				>
					<Button
						type='danger'
						className='mb-0'
						size='small'
						disabled={selectedXrayRows.length <= 0}
					>
						ลบที่เลือก
					</Button>
				</Popconfirm>
			</label>,
			dataIndex: 'expenseName',
			render: (val, record) => {
				const reason = options.reason.find((o) => o.value === record.reason);
				return (
					<>
						<label
							style={{
								color: record?.textColor,
							}}
						>
							{val}
							{record?.status === 'R' && (
								<label className="ms-1">({reason?.label})</label>
							)}
						</label>
					</>
				);
			},
		},
		{
			title: 'จำนวนเงิน',
			dataIndex: 'amount',
			width: 90,
			align: 'right',
		},
		{
			title: 'เครดิต',
			dataIndex: 'credit',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกได้',
			dataIndex: 'cashReturn',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกไม่ได้',
			dataIndex: 'cashNotReturn',
			width: 90,
			align: 'right',
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
			title: ' ',
			dataIndex: 'financeId',
			width: 75,
			fixed: 'right',
			align: 'center',
			render: (val, record) => (
				<Row gutter={[4, 4]} style={{ flexDirection: 'row' }}>
					<Col span={12}>
						<Button
							size={'small'}
							// shape={"circle"}
							icon={
								<EditOutlined
									style={{
										color: 'blue',
									}}
								/>
							}
							onClick={() => {
								history.push({
									pathname: '/opd clinic/opd-clinic-opd-non-drug-charge',
									patient: record,
								});
							}}
							className="me-1"
							style={{
								margin: 0,
							}}
						// disabled={isIpd}
						/>
					</Col>
					<Col span={12}>
						<Popconfirm
							placement="top"
							title={'ลบจากระบบ'}
							onConfirm={() => delFinance(val, 'X')}
							okText="Yes"
							cancelText="No"
							disabled={!record?.isDeleleAble}
						>
							<Button
								size={'small'}
								// shape={"circle"}
								icon={
									<DeleteOutlined
										style={{
											color: 'red',
										}}
									/>
								}
								style={{
									margin: 0,
								}}
								disabled={!record?.isDeleleAble}
							/>
						</Popconfirm>
					</Col>
				</Row>
			),
		},
	];
	const columnsOrder = [
		{
			title: (
				<>
					<label className="gx-text-primary" style={{ display: "flex", alignContent: "baseline", }}>
						<Typography.Text style={{ marginRight: '0.5rem' }}>Order({dataSourceOrder.length})</Typography.Text>
						<Popconfirm
							title="ลบที่เลือก ?"
							okText="ยืนยัน"
							cancelText="ปิด"
							onConfirm={handleDelete(selectedOderRows, "O")}
						>
							<Button
								type='danger'
								className='mb-0'
								size='small'
								disabled={selectedOderRows.length <= 0}
							>
								ลบที่เลือก
							</Button>
						</Popconfirm>
					</label>
				</>
			),
			dataIndex: 'expenseName',
		},
		{
			title: 'ซี่ฟัน',
			dataIndex: 'teeth',
			width: 85,
			render: (value) => value || '-',
		},
		{
			title: 'จำนวนเงิน',
			dataIndex: 'amount',
			width: 90,
			align: 'right',
		},
		{
			title: 'เครดิต',
			dataIndex: 'credit',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกได้',
			dataIndex: 'cashReturn',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกไม่ได้',
			dataIndex: 'cashNotReturn',
			width: 90,
			align: 'right',
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
			title: ' ',
			dataIndex: 'financeId',
			width: 80,
			fixed: 'right',
			align: 'center',
			render: (val, record) => (
				<Row gutter={[4, 4]} style={{ flexDirection: 'row' }}>
					<Col span={12}>
						<Button
							size={'small'}
							// shape={"circle"}
							icon={
								<EditOutlined
									style={{
										color: 'blue',
									}}
								/>
							}
							onClick={() => {
								history.push({
									pathname: '/opd clinic/opd-clinic-opd-non-drug-charge',
									patient: record,
								});
							}}
							className="me-1"
							style={{
								margin: 0,
							}}
						// disabled={isIpd}
						/>
					</Col>
					<Col span={12}>
						<Popconfirm
							placement="top"
							title={'ลบจากระบบ'}
							onConfirm={() => delFinance(val, 'O')}
							okText="Yes"
							cancelText="No"
							disabled={!record?.isDeleleAble}
						>
							<Button
								size={'small'}
								// shape={"circle"}
								icon={
									<DeleteOutlined
										style={{
											color: 'red',
										}}
									/>
								}
								style={{
									margin: 0,
								}}
								disabled={!record?.isDeleleAble}
							/>
						</Popconfirm>
					</Col>
				</Row>
			),
		},
	];
	const columnsMedication = [
		{
			title:
				<label className="gx-text-primary">
					<Typography.Text style={{ marginRight: '0.5rem' }}>รายการยา({dataSourceMedication.length})</Typography.Text>
					<Popconfirm
						title="ลบที่เลือก ?"
						okText="ยืนยัน"
						cancelText="ปิด"
						onConfirm={handleDelete(selectedMedRows, "D")}
					>
						<Button
							type='danger'
							className='mb-0'
							size='small'
							disabled={selectedMedRows.length <= 0}
						>
							ลบที่เลือก
						</Button>

					</Popconfirm>
				</label>,
			// dataIndex: "expenseName"
			render: (record) => (
				<Row>
					<Col span={24}>{record?.expenseName}</Col>
					<Col span={24} style={{ color: 'red' }}>
						{record?.pharmacyNote ? `${record?.pharmacyNote}` : ''}
					</Col>
				</Row>
			),
			// width: 240,
		},
		{
			title: 'จำนวนเงิน',
			dataIndex: 'amount',
			width: 90,
			align: 'right',
		},
		{
			title: 'เครดิต',
			dataIndex: 'credit',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกได้',
			dataIndex: 'cashReturn',
			width: 90,
			align: 'right',
		},
		{
			title: 'เบิกไม่ได้',
			dataIndex: 'cashNotReturn',
			width: 90,
			align: 'right',
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
			title: ' ',
			dataIndex: 'financeId',
			width: 75,
			fixed: 'right',
			align: 'center',
			render: (val, record) => (
				<Row gutter={[4, 4]} style={{ flexDirection: 'row' }}>
					<Col span={12}>
						<Button
							size={'small'}
							// shape={"circle"}
							icon={
								<EditOutlined
									style={{
										color: 'blue',
									}}
								/>
							}
							onClick={() => {
								history.push({
									pathname: '/opd%20clinic/opd-clinic-opd-drug-charge',
									right: record.rightId,
									workRoom: workId,
									doctorInWorkRoom: doctor,
									clinicId: clinicId,
									orderId: record.orderId,
								});
							}}
							className="me-1"
							style={{
								margin: 0,
							}}
						// disabled={isIpd}
						/>
					</Col>
					<Col span={12}>
						<Popconfirm
							placement="top"
							title={'ลบจากระบบ'}
							onConfirm={() => delFinance(val, 'M')}
							okText="Yes"
							cancelText="No"
							disabled={!record?.isDeleleAble}
						>
							<Button
								size={'small'}
								// shape={"circle"}
								icon={
									<DeleteOutlined
										style={{
											color: 'red',
										}}
									/>
								}
								style={{
									margin: 0,
								}}
								disabled={!record?.isDeleleAble}
							/>
						</Popconfirm>
					</Col>
				</Row>
			),
		},
	];
	const genTable = (name, dts = [], clm = [], scrollX = 625, selected, setSelect) => {
		let isLabResultsAll = false;
		if (name === 'Lab') {
			let temp = find(dts, ['status', null]);
			if (!temp) {
				temp = filter(dts, ['status', 'A']);
				if (temp.length) {
					const chkLabResult = find(temp, (o) => !o?.labResults?.length);
					if (!chkLabResult) isLabResultsAll = true;
				}
			}
		}

		const onSelectChange = (newSelectedRowKeys) => {
			setSelect(newSelectedRowKeys);
		};
		const rowSelection = {
			selected,
			onChange: onSelectChange,
		};
		return (
			<>
				<div
					className="text-center mt-2 mb-2 pt-2 pb-2"
					hidden={dts.length}
					style={{ backgroundColor: '#fafafa' }}
				>
					<label style={{ color: '#BDBDBD' }}>ไม่มีข้อมูลการสั่ง {name}</label>
				</div>
				<div hidden={!dts.length}>
					<Table
						size="small"
						scroll={{
							x: scrollX,
							y: scrollY,
						}}
						columns={clm}
						dataSource={dts}
						rowSelection={rowSelection}
						pagination={false}
						rowClassName="data-value"
						rowKey="financeId"
						footer={
							name === 'Lab'
								? () => {
									return (
										<Row gutter={[4, 4]} align="middle">
											<Col>
												<label className="gx-text-primary">
													สถานะการลงผล :
												</label>
											</Col>
											<Col>
												<label className="fw-bold">
													{isLabResultsAll ? 'Complete' : 'In Progress '}
												</label>
											</Col>
										</Row>
									);
								}
								: false
						}
					/>
				</div>
				<ModalNoResult
					visible={showNoResultModal}
					setShowNoResultModal={setShowNoResultModal}
					loading={loadingNoResultModal}
					data={noResultData}
				/>
			</>
		);
	};
	const DisplayTypeDefult = () => {
		return (
			<>
				{showLab && genTable("Lab", dataSourceLab, columnsLab, 700, selectedLabRows, setSelectedLabRows)}
				{showXray && genTable("X-ray", dataSourceXray, columnsXRay, 700, selectedXrayRows, setSelectedXrayRows)}
				{showOrder && genTable("Order", dataSourceOrder, columnsOrder, 700, selectedOderRows, setSelectedOderRows)}
				{showMedication && genTable("ยา", dataSourceMedication, columnsMedication, 700, selectedMedRows, setSelectedMedRows)}
			</>
		);
	};
	const DisplayTypeTab = () => {
		return (
			<Tabs defaultActiveKey="1" type="card" size="small">
				{showLab && (
					<Tabs.TabPane tab={`Lab(${dataSourceLab.length})`} key="1">
						{genTable('Lab', dataSourceLab, columnsLab)}
					</Tabs.TabPane>
				)}
				{showXray && (
					<Tabs.TabPane tab={`X-Ray(${dataSourceXray.length})`} key="2">
						{genTable('X-ray', dataSourceXray, columnsXRay)}
					</Tabs.TabPane>
				)}
				{showOrder && (
					<Tabs.TabPane tab={`Order(${dataSourceOrder.length})`} key="4">
						{genTable('Order', dataSourceOrder, columnsOrder, 700)}
					</Tabs.TabPane>
				)}
				{showMedication && (
					<Tabs.TabPane tab={`ยา(${dataSourceMedication.length})`} key="3">
						{genTable('ยา', dataSourceMedication, columnsMedication)}
					</Tabs.TabPane>
				)}
			</Tabs>
		);
	};
	return (
		<Spin spinning={loading}>
			{displayType === 'default' && DisplayTypeDefult()}
			{displayType === 'tab' && DisplayTypeTab()}
			<ShowUpsertLabResults
				visible={visibleUpsertLabResults}
				setVisible={setVisibleUpsertLabResults}
				patientId={patientId}
				orderId={financeDetails?.orderId}
				financeId={financeDetails?.financeId}
				gender={gender}
			/>
		</Spin>
	);
}

const ModalNoResult = ({ visible, setShowNoResultModal, loading, data }) => {
	return (
		<Modal
			title={'แจ้งเตือนรายการที่ยังไม่มีผล'}
			onCancel={() => setShowNoResultModal(false)}
			footer={
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Button
						onClick={() => setShowNoResultModal(false)}
						style={{ margin: 0 }}
					>
						ออก
					</Button>
				</div>
			}
			visible={visible}
		>
			<Spin spinning={loading}>
				<Table
					title={() => data?.type}
					dataSource={data?.source}
					columns={[
						{
							title: <label className="gx-text-primary fw-bold">รายการ</label>,
							dataIndex: 'expenseName',
							width: 100,
							align: 'right',
						},
						{
							title: (
								<label className="gx-text-primary fw-bold">
									วันเวลาที่สั่ง
								</label>
							),
							dataIndex: 'orderDate',
							width: 100,
							align: 'right',
						},
					]}
				></Table>
			</Spin>
		</Modal>
	);
};
const apis = {
	DelListFinance: {
		url: 'Finances/DelListFinance',
		method: 'POST',
		return: 'data',
		sendRequest: true,
	},
	GetPopupResult: {
		url: 'OpdExamination/GetPopupResult',
		method: 'POST',
		return: 'data',
		sendRequest: true,
	},
	GetReasonsCancelOrRejectLab: {
		url: 'Laboratory/GetReasonsCancelOrRejectLab',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
};
