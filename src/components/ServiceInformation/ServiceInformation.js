import { EyeOutlined, StarTwoTone } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Drawer,
	Image,
	Modal,
	Row,
	Space,
	Table,
	Tabs,
	Typography,
} from 'antd';
import dayjs from 'dayjs';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import LgMessages from '../../util/IntlMessages';
import OpdClinicsDetail from '../Patient/OpdClinicsDetail';
import { PrintFormReport } from '../qzTray/PrintFormReport';
import {
	GetAdmit,
	GetAppointDetail,
	GetAppointHistory,
	GetOpdCardLatest,
	GetPatientsHistoryCard,
	GetServiceLastest,
	GetStatusHistory,
} from './Api';
import FileLocation from './FileLocation';

const CustomDrawer = styled(Drawer)`
	.ant-drawer-content-wrapper {
		width: 600px !important;
	}
`;
const size = 'small';
// eslint-disable-next-line no-unused-vars
const ServiceInformation = ({ hiddenPrint = false, ...props }) => {
	const [dataLoading, setDataLoading] = useState(false);
	const { TabPane } = Tabs;
	const { Text } = Typography;
	const avatarStyle = {
		boxShadow: '0px 4px 2px 0px #ECEFF1',
	};
	// Tabs GeneralHistory
	const [serviceLastest, setServiceLastest] = useState(null);
	const [servicePage, setServicePage] = useState(1);
	useEffect(() => {
		if (props.patient_id !== null) {
			async function fetchData() {
				let res = await GetServiceLastest(props.patient_id);
				setServiceLastest(
					res?.map((val, index) => {
						return {
							key: index,
							...val,
						};
					})
				);
			}
			setDataLoading(true);
			fetchData();
			setDataLoading(false);
			setServicePage(1);
		}
	}, [props.patient_id]);

	const [clinicIdForOpdClinicsDetail, setClinicIdForOpdClinicsDetail] =
		useState(null);
	const [serviceIdForOpdClinicsDetail, setServiceIdForOpdClinicsDetail] =
		useState(null);
	const [visibleDrawer, setVisibleDrawer] = useState(false);

	const ServiceLastest = () => {
		const columns = [
			{
				title: <label className="gx-text-primary">Today</label>,
				dataIndex: 'today',
				key: 'key',
				align: 'center',
				width: 65,
				render: (dataIndex) => (
					<>{dataIndex !== '' ? <StarTwoTone twoToneColor="#FFEB3B" /> : ''}</>
				),
			},
			{
				title: <label className="gx-text-primary">สถานะจำหน่าย</label>,
				dataIndex: 'disC',
				key: 'key',
				className: 'data-value',
				width: 120,
			},
			{
				title: <label className="gx-text-primary">วันที่มารับบริการ</label>,
				// dataIndex: 'clinicDate',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 145,
				render: (record) => {
					return (
						<>
							{record.clinicDate}{' '}
							{dayjs(record.clinicTime, 'HH:mm:ss').format('HH:mm')}
						</>
					);
				},
			},
			{
				title: <label className="gx-text-primary">หน่วยงานที่ใช้บริการ</label>,
				dataIndex: 'work_Name',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">สิทธิ์</label>,
				dataIndex: 'right_Name',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">เตียง</label>,
				dataIndex: 'bedName',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">ชื่อแพทย์</label>,
				dataIndex: 'uname',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">ประเภท</label>,
				dataIndex: 'registerTypeDesc',
				key: 'key',
				className: 'data-value',
			},
			{
				// hidden: hiddenPrint,
				title: <label className="gx-text-primary"></label>,
				fixed: 'right',
				key: 'key',
				align: 'center',
				width: 85,
				render: (record) => (
					<Row gutter={[4, 4]}>
						<Col span={12}>
							<Button
								style={{ margin: 0 }}
								// button={false}
								size={size}
								// shape="square"
								icon={<EyeOutlined className="gx-text-primary" />}
								onClick={() => {
									// console.log('record :>> ', record);
									setClinicIdForOpdClinicsDetail(record.clinicId);
									setServiceIdForOpdClinicsDetail(record.serviceId);
									setVisibleDrawer(true);
								}}
							/>
						</Col>
						<Col span={12}>
							<PrintFormReport
								style={{ margin: 0 }}
								button={false}
								size={size}
								shape="square"
								param={{
									hn: props?.hn ? props.hn : null,
									clinicid: record?.clinicId ? record.clinicId : null,
								}}
								number={1}
							/>
						</Col>
					</Row>
				),
			},
			// <PrinterOutlined />
		];
		return (
			<Table
				size="small"
				scroll={{ x: 1100, y: 240 }}
				dataSource={serviceLastest}
				columns={columns.filter((item) => !item.hidden)}
				loading={dataLoading}
				pagination={{
					current: servicePage,
					pageSize: 50,
					showSizeChanger: false,
				}}
				onChange={(page) => {
					setServicePage(page.current);
				}}
			/>
		);
	};

	const AppointHistory = () => {
		const [appointHistory, setAppointHistory] = useState(null);
		const [rowActive, setRowActive] = useState(null);

		useEffect(() => {
			if (props.patient_id !== null) {
				async function fetchData() {
					let res = await GetAppointHistory(props.patient_id);
					setAppointHistory(
						res.map((val, index) => {
							return {
								key: index,
								...val,
							};
						})
					);
				}
				setDataLoading(true);
				fetchData();
				setDataLoading(false);
			}
		}, []);

		const cilckRow = (appointId) => {
			setAppointId(appointId);
			setShowAppointDetailModal(!showAppointDetailModal);
		};

		//Modal
		const [appointId, setAppointId] = useState(null);
		const [showAppointDetailModal, setShowAppointDetailModal] = useState(false);
		const appointDetailModalControl = () => {
			setShowAppointDetailModal(!showAppointDetailModal);
		};

		const [appointDetail, setAppointDetail] = useState(null);

		/* const [appointDetail2, setAppointDetail2] = useState([]) */
		useEffect(() => {
			if (appointId !== null) {
				async function fetchData() {
					let res = await GetAppointDetail(appointId);
					/* await  */ setAppointDetail(res);
					/* setAppointDetail2(res.activitiesInfo) */
				}
				setDataLoading(true);
				fetchData();
				setDataLoading(false);
			}
		}, [appointId]);

		const columns = [
			{
				title: <label className="gx-text-primary">วันที่นัด</label>,
				dataIndex: 'appointDate',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 100,
			},
			{
				title: <label className="gx-text-primary">เวลาเริ่ม</label>,
				dataIndex: 'startTime',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 85,
			},
			{
				title: <label className="gx-text-primary">เวลาสิ้นสุด</label>,
				dataIndex: 'endTime',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 95,
			},
			{
				title: <label className="gx-text-primary">แพทย์</label>,
				dataIndex: 'uname',
				className: 'data-value',
				key: 'key',
			},
			{
				title: <label className="gx-text-primary">ห้องตรวจ</label>,
				dataIndex: 'wname',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">สถานะการนัดหมาย</label>,
				dataIndex: 'appointStatus',
				key: 'key',
				className: 'data-value',
				render: (text) => {
					switch (text) {
						case 'C':
							return <label>ยกเลิกนัด</label>;
						case 'I':
							return <label>แทรกนัด</label>;
						case 'P':
							return <label>เลื่อนนัด</label>;
						default:
							return '';
					}
				},
			},
			{
				key: 'key',
				align: 'center',
				width: 50,
				render: (value, record) => {
					// console.log(record);
					return (
						<Row gutter={[8, 8]}>
							<Col span={24} onClick={(e) => e.stopPropagation()}>
								<PrintFormReport
									style={{ margin: 0 }}
									button={false}
									size={size}
									shape="square"
									param={{
										hn: props?.hn ? props.hn : null,
										appointid: record?.appointId,
										appointdate: record?.appointDate
											? dayjs(record.appointDate, 'DD/MM/YYYY').format(
													'YYYY-'
												) +
												dayjs(record.appointDate, 'DD/MM/YYYY').format('MM-DD')
											: null,
										workid: record?.workId,
									}}
									number={2}
								/>
							</Col>
						</Row>
					);
				},
			},
		];
		if (appointDetail !== null) {
			var activityColumns = [
				{
					title: <label className="gx-text-primary">กิจกรรมก่อนพบแพทย์</label>,
					/* key: `${(record)=>record.appActId}`, */
					className: 'data-value',
					render: (record) => {
						return (
							<Row>
								<Col span={2}>
									<Text>{record.financetype}</Text>
								</Col>
								<Col span={22}>
									<Text>{record.actName}</Text>
								</Col>
							</Row>
						);
					},
				},
			];
		}
		return (
			<div>
				<Table
					size={size}
					scroll={{ x: 800, y: 240 }}
					dataSource={appointHistory}
					columns={columns}
					loading={dataLoading}
					rowClassName={(record) =>
						record.key === rowActive ? 'active-row pointer' : 'pointer'
					}
					onRow={(record) => {
						return {
							onClick: () => {
								cilckRow(record.appointId);
								setRowActive(record.key);
							}, // click row
						};
					}}
					pagination={{
						pageSize: 50,
						showSizeChanger: false,
					}}
				/>

				<Modal
					title={
						<label className="gx-text-primary-bold">รายละเอียดการนัดหมาย</label>
					}
					centered
					visible={showAppointDetailModal}
					onOk={appointDetailModalControl}
					onCancel={appointDetailModalControl}
					footer={false}
					width={880}
				>
					{appointDetail !== null && (
						<div className="ps-3 pe-3" style={{ marginBottom: -18 }}>
							<Row gutter={[8, 8]} className="mb-2">
								<Col span={3}>
									{appointDetail.picture !== null ? (
										<Avatar
											size={68}
											src={
												<Image
													src={`data:image/jpeg;base64,${appointDetail.picture}`}
												/>
											}
											style={avatarStyle}
										/>
									) : (
										<Avatar size={68} style={avatarStyle}>
											Patient
										</Avatar>
									)}
								</Col>
								<Col span={7}>
									<br />
									<Row gutter={[8, 8]} className="mb-2">
										<Col span={24}>
											<label className="gx-text-primary">ชื่อ :</label>
											<label className="data-value ms-1">
												{appointDetail.pname}
											</label>
										</Col>
									</Row>
									<Row gutter={[8, 8]}>
										<Col span={24}>
											<label className="gx-text-primary">HN :</label>
											<label className="data-value ms-1">
												{appointDetail.hn}
											</label>
										</Col>
									</Row>
								</Col>
								<Col span={10}>
									<br />
									<Row gutter={[8, 8]} className="mb-2">
										<Col span={24}>
											<label className="gx-text-primary">
												แพทย์ผู้นัดตรวจ :
											</label>
											<label className="data-value ms-1">
												{appointDetail.doctor}
											</label>
										</Col>
									</Row>
									<Row gutter={[8, 8]}>
										<Col span={24}>
											<label className="gx-text-primary">ห้องตรวจ :</label>
											<label className="data-value ms-1">
												{appointDetail.workId}
											</label>
										</Col>
									</Row>
								</Col>
								<Col span={4}>
									<br />
									<Row gutter={[8, 8]} className="mb-2">
										<Col span={24}>
											<label className="gx-text-primary">วันที่นัด :</label>
											<label className="data-value ms-1">
												{appointDetail.appointDate}
											</label>
										</Col>
									</Row>
									<Row gutter={[8, 8]}>
										<Col span={24}>
											<label className="gx-text-primary">เวลา :</label>
											<label className="data-value ms-1">
												{appointDetail.time}
											</label>
										</Col>
									</Row>
								</Col>
							</Row>
							<Space direction="vertical" size={10} style={{ width: '100%' }}>
								<Table
									dataSource={appointDetail.activitiesInfo}
									columns={activityColumns}
									loading={dataLoading}
									rowKey="appActId"
									pagination={{
										pageSize: 5,
										showSizeChanger: false,
									}}
								/>
								<Row justify="center">
									<Button type="secondary" onClick={appointDetailModalControl}>
										ปิด
									</Button>
								</Row>
							</Space>
						</div>
					)}
				</Modal>
			</div>
		);
	};
	const AdmitHistory = () => {
		const [admitHistory, setAdmitHistory] = useState([]);
		useEffect(() => {
			if (props.patient_id !== null) {
				async function fetchData() {
					let res = await GetAdmit(props.patient_id);
					// console.log('res', res)
					setAdmitHistory(
						res.map(({ dischDate, admitDate, admitTime, ...val }, index) => {
							return {
								key: index,
								...val,
								disch: dischDate
									? dayjs(dischDate).format('DD/MM/') +
										dayjs(dischDate).add(543, 'y').format('YYYY HH:mm')
									: null,
								admitDate: admitDate
									? dayjs(admitDate).format('DD/MM/') +
										dayjs(admitTime).add(543, 'y').format('YYYY HH:mm')
									: null,
							};
						})
					);
				}
				setDataLoading(true);
				fetchData();
				setDataLoading(false);
			}
		}, []);
		const columns = [
			{
				title: <label className="gx-text-primary">AN</label>,
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 100,
				render: (v, vs) => <Text delete={vs.deleteFlag === 'Y'}>{vs.an}</Text>,
			},
			{
				title: <label className="gx-text-primary">วันที่ Admit</label>,
				// dataIndex: 'admitDate',
				key: 'key',
				align: 'center',

				className: 'data-value',
				width: 140,
				// render: (v, vs) => `${moment(vs.admitDate, "MM/DD/YYYY HH:mm").format("DD/MM/YYYY HH:mm")}`
				render: (v, vs) => (
					<Text delete={vs.deleteFlag === 'Y'}>{vs.admitDate}</Text>
				),
			},
			{
				title: <label className="gx-text-primary">วันที่ D/C</label>,
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 140,
				render: (v, vs) => (
					<Text delete={vs.deleteFlag === 'Y'}>{vs.disch}</Text>
				),
			},
			{
				title: <label className="gx-text-primary">Ward</label>,
				key: 'key',
				className: 'data-value',
				render: (v, vs) => (
					<Text delete={vs.deleteFlag === 'Y'}>{vs.wardName}</Text>
				),
			},
			{
				title: <label className="gx-text-primary">แพทย์</label>,
				key: 'key',
				className: 'data-value',
				render: (v, vs) => (
					<Text delete={vs.deleteFlag === 'Y'}>{vs.feverDoctorName}</Text>
				),
			},
			{
				title: <label className="gx-text-primary">ประวัติการจำหน่าย</label>,
				dataIndex: 'dischTypeName',
				key: 'key',
				className: 'data-value',
				render: (v, vs) => (
					<Text delete={vs.deleteFlag === 'Y'}>{vs.dischTypeName}</Text>
				),
			},
		];

		return (
			<Table
				size={size}
				scroll={{ x: 880, y: 240 }}
				dataSource={admitHistory}
				columns={columns}
				loading={dataLoading}
				pagination={{
					pageSize: 50,
					showSizeChanger: false,
				}}
			/>
		);
	};
	const StatusHistory = () => {
		// const id = "1786435";
		const [statusHistory, setStatusHistory] = useState(null);
		useEffect(() => {
			if (props.patient_id !== null) {
				async function fetchData() {
					let res = await GetStatusHistory(props.patient_id);
					setStatusHistory(res);
				}
				setDataLoading(true);
				fetchData();
				setDataLoading(false);
			}
		}, []);

		const columns = [
			{
				title: <label className="gx-text-primary">สถานะ</label>,
				dataIndex: 'status',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 85,
			},
			{
				title: '',
				dataIndex: 'statusName',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">วันที่/เวลา ตรวจ</label>,
				dataIndex: 'statusDateTime',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 140,
			},
			{
				title: <label className="gx-text-primary">ผู้บันทึก</label>,
				dataIndex: 'uname',
				key: 'key',
				className: 'data-value',
			},
		];

		return (
			<Table
				size={size}
				scroll={{ x: 780, y: 240 }}
				dataSource={uniqBy(statusHistory, 'statusDateTime')}
				columns={columns}
				loading={dataLoading}
				pagination={{
					pageSize: 50,
					showSizeChanger: false,
				}}
			/>
		);
	};
	const PatientHistoryCard = () => {
		const [patientsHistoryCard, setPatientsHistoryCard] = useState(null);
		// console.log("patientsHistoryCard",patientsHistoryCard);
		const [, setOpdCardLatest] = useState(null);
		useEffect(() => {
			if (props.patient_id !== null) {
				async function fetchData() {
					let res = await GetPatientsHistoryCard(props.patient_id);
					setPatientsHistoryCard(
						res.map((val, index) => {
							return {
								key: index,
								...val,
							};
						})
					);
					res = await GetOpdCardLatest(props.patient_id);
					setOpdCardLatest(res);
				}
				setDataLoading(true);
				fetchData();
				setDataLoading(false);
			}
		}, []);
		const columns = [
			{
				title: <label className="gx-text-primary">ประเภท</label>,
				dataIndex: 'cardTypeName',
				key: 'key',
				className: 'data-value',
				width: 75,
			},
			{
				title: <label className="gx-text-primary">หน่วยงาน</label>,
				dataIndex: 'toWork',
				key: 'key',
				className: 'data-value',
			},
			{
				title: <label className="gx-text-primary">หมายเลขแฟ้มแทน</label>,
				dataIndex: 'replaceId',
				key: 'key',
				className: 'data-value',
				render: (val) => (
					<label className="data-value" style={{ textAlign: 'center' }}>
						{val ? val : '-'}
					</label>
				),
			},
			{
				title: <label className="gx-text-primary">ผู้บันทึก</label>,
				dataIndex: 'uname',
				key: 'key',
				className: 'data-value text-nowrap',
				width: 300,
			},
			{
				title: <label className="gx-text-primary">วันที่/เวลา</label>,
				dataIndex: 'dateCreatedDis',
				key: 'key',
				align: 'center',
				className: 'data-value',
				width: 155,
			},
			{
				title: <label className="gx-text-primary">หมายเหตุ</label>,
				dataIndex: 'remark',
				key: 'key',
				className: 'data-value',
			},
		];
		return (
			<div>
				<Table
					size={size}
					scroll={{ x: 880, y: 240 }}
					dataSource={patientsHistoryCard}
					columns={columns}
					loading={dataLoading}
					pagination={{
						pageSize: 50,
						showSizeChanger: false,
					}}
				/>
				<Card className="mt-2">
					<div>
						{props?.patient_id && (
							<FileLocation patientId={props.patient_id} pageId="type1" />
						)}
					</div>
				</Card>
			</div>
		);
	};
	return (
		<>
			<Card
				size="small"
				title={
					<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
						<LgMessages id="sidebar.araigordai" />
					</label>
				}
				headStyle={{ backgroundColor: '#fafafa' }}
			>
				<Tabs
					size="small"
					style={{ margin: -8 }}
					type="card"
					onChange={() => setServicePage(1)}
				>
					<TabPane tab="ข้อมูลการมารับบริการล่าสุด" key="1">
						<div style={{ marginTop: -12 }}>{ServiceLastest()}</div>
					</TabPane>
					<TabPane tab="ประวัติการนัดหมาย" key="2">
						<div style={{ marginTop: -12 }}>
							<AppointHistory />
						</div>
					</TabPane>
					<TabPane tab="ประวัติการ Admit" key="3">
						<div style={{ marginTop: -12 }}>
							<AdmitHistory />
						</div>
					</TabPane>
					<TabPane tab="สถานะการรับบริการ" key="4">
						<div style={{ marginTop: -12 }}>
							<StatusHistory />
						</div>
					</TabPane>
					<TabPane tab="ประวัติการเคลื่อนไหวแฟ้ม" key="5">
						<div style={{ marginTop: -12 }}>
							<PatientHistoryCard />
						</div>
					</TabPane>
				</Tabs>
			</Card>
			<CustomDrawer
				drawerStyle={{ width: '95%' }}
				title={
					<label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
						ประวัติการรักษา
					</label>
				}
				placement="right"
				onClose={() => {
					setVisibleDrawer(false);
					setClinicIdForOpdClinicsDetail(null);
					setServiceIdForOpdClinicsDetail(null);
				}}
				visible={visibleDrawer}
			>
				<br />
				<br />
				<OpdClinicsDetail
					opdClinicValue={clinicIdForOpdClinicsDetail}
					getServiceId={() => {}}
					opdServiceValue={serviceIdForOpdClinicsDetail}
					patientId={props?.patient_id}
					editAble={false}
				/>
			</CustomDrawer>
		</>
	);
};
export default ServiceInformation;
