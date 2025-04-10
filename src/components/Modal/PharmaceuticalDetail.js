import { env } from '../../env.js';
import React, {
	useState,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from 'react';
import axios from 'axios';
import {
	Input,
	Button,
	Form,
	Row,
	Col,
	Avatar,
	Image,
	Modal,
	Radio,
	Empty,
	Card,
	Spin,
	Checkbox,
	InputNumber,
	DatePicker,
	Badge,
	Popconfirm,
} from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import PharmaceuticalInfo from './PharmaceuticalInfo';
import PharmaceuticalGroupInfo from './PharmaceuticalGroupInfo';
import OutPhamaceuticallInfo from './OutPharmaceuticalInfo';
import PtCodeAdrs from './Drug/PtCodeAdrs';
import DrugComponent from './Drug/DrugComponent';
import {
	LockOutlined,
	UnlockOutlined,
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	RedoOutlined,
} from '@ant-design/icons';
import {
	CancelTbPatientDrugAllergies,
	CancelTbPtDgAdrs,
	Get_Upd_Patient_Drug_Allergies_Display,
} from '../../routes/AdrRegistration/API/DrugAllergyApi';
import moment from 'moment';
import { callApis } from 'components/helper/function/CallApi';
import {
	notiSuccess,
	notiError,
	notificationX as notiX,
} from 'components/Notification/notificationX';
import {
	LabelTopicPrimary,
	LabelTopic,
	LabelText,
	LabelTextPrimary,
	LabelTopicPrimary18,
	GenFormItemLabel,
} from 'components/helper/function/GenLabel';
import { rowProps } from 'props';
import dayjs from 'dayjs';
import { withResolve } from 'api/create-api.js';
import { GetTbPtDgAdrsDisplay } from 'routes/AdrRegistration/API/DrugGroupAllergyApi.js';
import { PrintFormReport } from 'components/qzTray/PrintFormReport.js';
const size = 'small';
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const userDetail = userFromSession.responseData;
const user = userFromSession.responseData.userId;
const { roles = [], userType = null } = userFromSession.responseData;
const isPharmacist =
	userType === 'p' || roles?.find((val) => val.name.includes('เภสัชกร'));
const disabledAction = !isPharmacist;
export default forwardRef(function PharmaceuticalDetail(
	{
		reloadPtCodeAdrs = () => {
			return false;
		},
		reloadDrugComponentAllegies = () => {
			return false;
		},
		reloadDrugAllergic = () => {
			return false;
		},

		...props
	},
	ref
) {
	useImperativeHandle(ref, () => ({
		fireReload() {
			getDrugAllergies(props.patientId);
		},
	}));
	// Form
	const [formPharmaceutical] = Form.useForm();
	// Watch
	const notAlergicFlag = Form.useWatch('notAlergicFlag', formPharmaceutical);
	// console.log('notAlergicFlag :>> ', notAlergicFlag);
	const bloodInteraction = Form.useWatch(
		'bloodInteraction',
		formPharmaceutical
	);
	// State
	const [loading, setLoading] = useState(false);
	const [loadingPtCodeAdrs, setLoadingPtCodeAdrs] = useState(false);
	const [loadingDrugComponentAllegies, setLoadingDrugComponentAllegies] =
		useState(false);
	const [
		screeningPharmaceuticalInfoActive,
		setScreeningPharmaceuticalInfoActive,
	] = useState(false);
	const [
		screeningOutPharmaceuticalInfoActive,
		setScreeningOutPharmaceuticalInfoActive,
	] = useState(false);
	const [tempDrugAllergyId, settempDrugAllergyId] = useState(null);
	const [outDrugAllergyId, setOutDrugAllergyId] = useState(null);
	const [
		screeningPharmaceuticalGroupInfoActive,
		setScreeningPharmaceuticalGroupInfoActive,
	] = useState(false);
	const [patientDetail, setPatientDetail] = useState({});
	const [popUpDetailPatient, setPopUpDetailPatient] = useState([]);

	// console.log('patientDetail :>> ', patientDetail);
	const [drugAllergic, setDrugAllergic] = useState([]);
	const [outDrugAllergic, setOutDrugAllergic] = useState([]);
	const [drugGroupAllergic, setDrugGroupAllergic] = useState([]);
	const [ptDrugCode, setPtDrugCode] = useState([]);
	const [drugComponentAllegies, setDrugComponentAllegies] = useState([]);
	const [prevFormData, setPrevFormData] = useState(null);
	// console.log('prevFormData :>> ', prevFormData);
	//ModalCancelReason
	const [showCancelNoti, setShowCancelNoti] = useState(false);
	const [cancelScreen, setCancelScreen] = useState(null);
	const [formCancelNoti] = Form.useForm();
	// Modal PtCodeAdrs
	const [vsbPtCodeAdrs, setVsbPtCodeAdrs] = useState(false);
	const [defaultPtCodeAdrs, setDefaultPtCodeAdrs] = useState(null);
	// Modal DrugComponent
	const [vsbDrugComponent, setVsbDrugComponent] = useState(false);
	const [defaultDrugComponent, setDefaultDrugComponent] = useState(null);
	const [disabledNotAlergicFlag, setDisabledNotAlergicFlag] = useState(false);

	const onPharmaceuticalFinish = async (values) => {
		setPrevFormData(null);
		setLoading(true);
		await axios({
			url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/UpdDrug_Allergies_Underlying_Diseases`,
			method: 'POST',
			data: {
				requestData: {
					patientId: patientDetail?.patientId,
					notAlergicFlag: values.notAlergicFlag,
					drugAllergic: values.drugAllergic,
					underlyingDisease: values?.underlyingDisease || null,
					userModified: user,
					foodAllergy: values.foodAllergy || null,
					otherAllergic: values.otherAllergic || null,
					clinicalHistory: values.clinicalHistory || null,
					surgeryHistory: values.surgeryHistory || null,
					bloodInteraction: values?.bloodInteraction ? 'Y' : null,
					bloodInteractionDesc: values.bloodInteractionDesc,
					regularMedication: values.regularMedication || null,
				},
			},
		})
			.then((res) => {
				notiX(res.data.isSuccess, 'บันทึกข้อมูลการแพ้ยา');
				if (res.data.isSuccess === true) {
					getDrugAllergies(props.patientId);
					props.handlePharmaceuticalDetail(false);
					reloadDrugAllergic(true);
				}
			})
			.catch((error) => {
				return error;
			});
		// Update CovidDose
		if (props?.page === '7.3') {
			if (!props?.clinicId) return setLoading(false);
			await axios({
				url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OPDClinic/UpdateOpdClinicCovid`,
				method: 'POST',
				data: {
					requestData: {
						clinicId: props?.clinicId,
						covidDose: values.latestCovidDose
							? String(values.latestCovidDose)
							: null,
						covidLastDate: values.latestCovidLastDate
							? moment(values.latestCovidLastDate).format('YYYY-MM-DD')
							: null,
						userModified: null,
					},
				},
			})
				.then((res) => {
					notiX(res.data.isSuccess, 'บันทึกข้อมูลฉีดวัคซีน Covid');
					if (res.data.isSuccess === true) {
						getDrugAllergies(props.patientId);
						props.handlePharmaceuticalDetail(false);
					}
				})
				.catch((error) => {
					return error;
				});
		}
		setLoading(false);
	};
	const handleScreeningPharmaceuticalInfoModal = () => {
		setScreeningPharmaceuticalInfoActive(!screeningPharmaceuticalInfoActive);
	};
	const handleScreeningOutPharmaceuticalInfoModal = () => {
		setScreeningOutPharmaceuticalInfoActive(
			!screeningOutPharmaceuticalInfoActive
		);
	};
	const handleScreeningPharmaceuticalGroupInfoModal = () => {
		setScreeningPharmaceuticalGroupInfoActive(
			!screeningPharmaceuticalGroupInfoActive
		);
	};
	const getDrugAllergies = async (patientId) => {
		if (!patientId) return;
		setLoading((p) => !p);
		const res = await callApis(apis['GetPatientsDrugAllergies'], patientId);
		const resPopUpDetailPatient = await withResolve(
			`api/Patients/GetPatientPrintForm/${patientId}`
		).fetch();
		const resDrugAllgies = await Get_Upd_Patient_Drug_Allergies_Display(patientId);
		const drugAllergiesGroup = await GetTbPtDgAdrsDisplay(patientId);

		setLoading((p) => !p);
		setPatientDetail(res);
		setPopUpDetailPatient(resPopUpDetailPatient?.result)
		// console.log('first', resPopUpDetailPatient?.result)
		// reloadDrugAllergic(true)
		setDrugAllergic(resDrugAllgies);
		setDrugGroupAllergic(drugAllergiesGroup);
	};
	const getOutDrugAllergies = async (patientId) => {
		if (!patientId) return;
		setLoading((p) => !p);
		const res = await callApis(apis['GetOutDrugAllegies'], patientId);
		setLoading((p) => !p);
		// setPatientDetail(res);
		// reloadDrugAllergic(true)
		setOutDrugAllergic(res);
		// setDrugGroupAllergic(res.drug_Group_Allergies_Info);
	};
	const getPtCodeAdrs = async (patientId) => {
		if (!patientId) return;
		setLoadingPtCodeAdrs((p) => !p);
		const res = await callApis(apis['GetTbPtCodeAdrs'], patientId);
		setLoadingPtCodeAdrs((p) => !p);
		setPtDrugCode(res);
	};
	const getDrugComponentAllegies = async (patientId) => {
		if (!patientId) return;
		setLoadingDrugComponentAllegies((p) => !p);
		const res = await callApis(apis['GetDrugComponentAllegies'], patientId);
		setLoadingDrugComponentAllegies((p) => !p);
		setDrugComponentAllegies(res);
		// reloadDrugAllergic(true)
	};
	const setForm = (dataForForm, disabledNotAlergicFlag) => {
		// console.log('prevFormData :>> ', prevFormData);
		// console.log('dataForForm :>> ', dataForForm);
		let latestCovidLastDate = prevFormData
			? prevFormData?.latestCovidLastDate
				? moment(prevFormData?.latestCovidLastDate, 'MM/DD/YYYY')
				: null
			: dataForForm.latestCovidLastDate
				? moment(dataForForm?.latestCovidLastDate, 'MM/DD/YYYY')
				: null;
		let dataSource = {
			notAlergicFlag: prevFormData
				? prevFormData.notAlergicFlag
				: dataForForm.notAlergicFlag
					? dataForForm.notAlergicFlag
					: null,
			drugAllergic: prevFormData
				? prevFormData.drugAllergic
				: dataForForm.drugAllergic,
			otherAllergic: prevFormData
				? prevFormData.otherAllergic
				: dataForForm.otherAllergic,
			underlyingDisease: prevFormData
				? prevFormData.underlyingDisease
				: dataForForm.underlyingDisease,
			clinicalHistory: prevFormData
				? prevFormData.clinicalHistory
				: dataForForm.clinicalHistory,
			surgeryHistory: prevFormData
				? prevFormData.surgeryHistory
				: dataForForm.surgeryHistory,
			foodAllergy: prevFormData
				? prevFormData.foodAllergy
				: dataForForm.foodAllergy,
			bloodInteraction: prevFormData
				? prevFormData.bloodInteraction
				: dataForForm.bloodInteraction,
			bloodInteractionDesc: prevFormData
				? prevFormData.bloodInteractionDesc
				: dataForForm.bloodInteractionDesc,
			regularMedication: prevFormData
				? prevFormData.regularMedication
				: dataForForm.regularMedication,
			// Gap 10-171 Start
			latestCovidDose: prevFormData
				? prevFormData.latestCovidDose
				: dataForForm.latestCovidDose,
			latestCovidLastDate: latestCovidLastDate,
			// Gap 10-171 End
		};
		if (disabledNotAlergicFlag) {
			if (dataSource?.notAlergicFlag) {
				if (dataSource?.drugAllergic === 'ไม่มีประวัติแพ้ยา') {
					dataSource.drugAllergic = null;
				}
				dataSource.notAlergicFlag = null;
			}
		}
		formPharmaceutical.setFieldsValue(dataSource);
	};
	const updCancelReason = async () => {
		const userFromSession = JSON.parse(sessionStorage.getItem('user'));
		let user = userFromSession.responseData.userId;
		let request = {
			mode: null,
			user: null,
			ip: null,
			lang: null,
			branch_id: null,
			requestData: [
				{
					cancelFlag: 'Y',
					cancelReason: formCancelNoti.getFieldValue('cancelReason') || null,
					cancelUser: user,
					ptAdrId: tempDrugAllergyId,
					ptDgAdrId: tempDrugAllergyId,
				},
			],
			barcode: null,
		};

		let { isSuccess } =
			cancelScreen === 'drugAllergy'
				? await CancelTbPatientDrugAllergies(request)
				: await CancelTbPtDgAdrs(request);

		if (isSuccess) {
			notiSuccess({ message: 'ลบข้อมูล' });
			getDrugAllergies(props.patientId);
			setShowCancelNoti(false);
		} else {
			setLoading(false);
			notiError({ message: 'ลบข้อมูล' });
		}
	};
	const delTbPtCodeAdrs = async (ptCodeAdrId) => {
		setLoadingPtCodeAdrs((p) => !p);
		const res = await callApis(apis['DelTbPtCodeAdrs'], ptCodeAdrId);
		setLoadingPtCodeAdrs((p) => !p);
		if (res?.isSuccess) {
			notiSuccess({ message: 'ลบข้อมูลแพ้ Code ยา' });
			getPtCodeAdrs(props?.patientId);
			reloadPtCodeAdrs();
		} else notiError({ message: 'ลบข้อมูลแพ้ Code ยา' });
	};
	const updateCancelFlagDrugComponentAllegies = async (dts, flag) => {
		const req = {
			...dts,
			cancelFlag: flag,
			userModified: user,
			userId: user,
			dateModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
		};
		setLoading((p) => !p);
		const res = await callApis(apis['UpSertDrugComponentAllegies'], req);
		setLoading((p) => !p);
		if (res?.isSuccess) {
			notiSuccess({ message: 'อัพเดตแพ้ส่วนประกอบยา' });
			getDrugComponentAllegies(props?.patientId);
			reloadDrugComponentAllegies();
		} else notiError({ message: 'อัพเดตแพ้ส่วนประกอบยา' });
	};
	const chkCheckDrugAllergyAll = () => {
		const disabledNotAlergicFlag =
			drugAllergic.filter((o) => o.cancelFlag !== 'Y').length ||
			drugGroupAllergic.filter((o) => o.cancelFlag !== 'Y').length ||
			ptDrugCode.filter((o) => o.cancelFlag !== 'Y').length || outDrugAllergic.filter((o) => o.cancelFlag !== 'Y').length ||
			drugComponentAllegies.length;
		setDisabledNotAlergicFlag(disabledNotAlergicFlag);
		// setTimeout(() => {
		// 	setForm(patientDetail, disabledNotAlergicFlag);
		// }, 100);
	};
	useEffect(() => {
		setDrugAllergic([]);
		setDrugGroupAllergic([]);
		setPtDrugCode([]);
		getDrugAllergies(props?.patientId);
		getPtCodeAdrs(props?.patientId);
		getDrugComponentAllegies(props?.patientId);
		getOutDrugAllergies(props?.patientId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.patientId]);
	useEffect(() => {
		setForm(patientDetail);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientDetail, disabledNotAlergicFlag]);
	useEffect(() => {
		chkCheckDrugAllergyAll();
	}, [
		drugAllergic,
		drugGroupAllergic,
		ptDrugCode,
		drugComponentAllegies,
		patientDetail, outDrugAllergic
	]);

	const tmpFormData = () => {
		let formData = formPharmaceutical.getFieldsValue();
		setPrevFormData(formData);
	};
	const PartsTitle = () => {
		return (
			<Row
				{...rowProps}
				align="middle"
				style={{ marginTop: -8, marginBottom: -8 }}
			>
				<Col>
					<LabelTopicPrimary18 text="รายละเอียดการแพ้ยา" />
				</Col>
				<Col>
					{patientDetail?.picture ? (
						<Avatar
							size={42}
							src={
								<Image
									src={`data:image/jpeg;base64,${patientDetail.picture}`}
								/>
							}
						/>
					) : (
						<Avatar size={42}>Patient</Avatar>
					)}
				</Col>
				<Col>
					<LabelTopic text={patientDetail?.displayName} />
				</Col>
				<Col>
					<LabelTopicPrimary className="me-1" text="HN" />
					<LabelTopic text={patientDetail?.hn} />
				</Col>
				<Col>
					<LabelTextPrimary className="me-1" text="อายุ" />
					<LabelText text={patientDetail?.age || '-'} />
				</Col>
				<Col>
					<LabelTextPrimary className="me-1" text="เบอร์โทร" />
					<LabelText
						text={patientDetail?.mobile || patientDetail?.telephone || '-'}
					/>
				</Col>
				<Col style={{ marginLeft: 'auto', marginRight: 20 }}>
					<PrintFormReport style={{ margin: 0, width: 85, height: 32 }}
						shape="square"
						param={{
							admitid: popUpDetailPatient?.admitId
						}}
						moduleId={216}
						number={3} ></PrintFormReport>
				</Col>
			</Row>
		);
	};
	const PartsFooter = () => {
		return (
			<div
				className="text-center"
				style={{
					marginBottom: 0,
					marginTop: 0,
				}}
			>
				<Button
					type="default"
					onClick={() => {
						props.handlePharmaceuticalDetail(false);
						setPrevFormData(null);
					}}
				>
					ปิด
				</Button>
				<Button
					type="primary"
					disabled={patientDetail?.patientId ? false : true}
					onClick={() => formPharmaceutical.submit()}
				>
					บันทึก
				</Button>
			</div>
		);
	};
	const PartsForm = () => {
		return (
			<Form
				layout="vertical"
				form={formPharmaceutical}
				onFinish={onPharmaceuticalFinish}
			>
				<Form.Item name="underlyingDisease" hidden>
					<Input />
				</Form.Item>
				<Row {...rowProps} gutter={[2, 2]}>
					<Col span={21}>
						<Row {...rowProps} gutter={[4, 2]}>
							<Col span={4}>
								<Form.Item name="notAlergicFlag" className="mb-0">
									<Radio.Group
										value={notAlergicFlag}
										className="mb-0"
										style={{ width: '100%' }}
									>
										<Row {...rowProps}>
											<Col span={24}>
												<Radio
													value="Y"
													disabled={notAlergicFlag === "Y" ? false : disabledNotAlergicFlag}
													onClick={() => {
														if (notAlergicFlag === 'Y') {
															formPharmaceutical.setFieldsValue({
																notAlergicFlag: null,
																drugAllergic: null,
															});
														} else {
															formPharmaceutical.setFieldsValue({
																drugAllergic: 'ไม่มีประวัติแพ้ยา',
															});
														}
													}}
												>
													ไม่มีประวัติแพ้ยา
												</Radio>
												<Radio
													value="W"
													disabled={notAlergicFlag === "W" ? false : disabledNotAlergicFlag}
													onClick={() => {
														if (notAlergicFlag === 'W') {
															formPharmaceutical.setFieldsValue({
																notAlergicFlag: null,
															});
														}
														formPharmaceutical.setFieldsValue({
															drugAllergic: null,
														});
													}}
												>
													ไม่ทราบ
												</Radio>
											</Col>
										</Row>
									</Radio.Group>
								</Form.Item>
							</Col>
							<Col span={7}>
								<GenFormItemLabel label="ระบุรายละเอียดแพ้ยา" required={notAlergicFlag === 'W'} />
								<Form.Item
									className="mb-0 mt-1"
									name="drugAllergic"
									rules={[
										{
											required: notAlergicFlag === 'W',
											message: 'จำเป็น !'
										}
									]}
								>
									<Input.TextArea
										placeholder="ระบุรายละเอียดแพ้ยา"
										disabled={notAlergicFlag === "Y"}
										rows={1}
									/>
								</Form.Item>
							</Col>
							<Col span={7}>
								<GenFormItemLabel label="แพ้อาหาร" />
								<Form.Item className="mb-0 mt-1" name="foodAllergy">
									<Input.TextArea
										rows={1}
										placeholder="ระบุรายละเอียดแพ้อาหาร"
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<GenFormItemLabel label="แพ้อื่นๆ" />
								<Form.Item className="mb-0 mt-1" name="otherAllergic">
									<Input.TextArea rows={1} placeholder="แพ้อื่นๆ" />
								</Form.Item>
							</Col>
						</Row>
						<Row {...rowProps} gutter={[4, 2]} className="mt-1">
							<Col span={4}>
								<Form.Item
									className="mb-0"
									name="bloodInteraction"
									valuePropName="checked"
								>
									<Checkbox
										onChange={(e) => {
											if (!e.target.checked) {
												formPharmaceutical.setFieldsValue({
													bloodInteractionDesc: null,
												});
											}
											// setFriend(!friend);
										}}
									>
										ผู้ป่วยมีการให้เลือด
									</Checkbox>
								</Form.Item>
							</Col>
							<Col span={7}>
								<GenFormItemLabel label="ระบุปฏิกิริยาที่เกิดจากการให้เลือด" />
								<Form.Item className="mb-0 mt-1" name="bloodInteractionDesc">
									<Input.TextArea
										rows={1}
										placeholder="ระบุปฏิกิริยาที่เกิดจากการให้เลือด"
										disabled={!bloodInteraction}
									/>
								</Form.Item>
							</Col>
							<Col span={5}>
								<GenFormItemLabel label="ยาที่ใช้ประจำ" />
								<Form.Item className="mb-0 mt-1" name="regularMedication">
									<Input.TextArea rows={1} placeholder="ยาที่ใช้ประจำ" />
								</Form.Item>
							</Col>
							<Col span={4}>
								<GenFormItemLabel label="ข้อมูลสำคัญทางคลินิก" />
								<Form.Item className="mb-0 mt-1" name="clinicalHistory">
									<Input.TextArea rows={1} placeholder="ข้อมูลสำคัญทางคลินิก" />
								</Form.Item>
							</Col>
							<Col span={4}>
								<GenFormItemLabel label="ข้อมูลสำคัญทางผ่าตัด" />
								<Form.Item className="mb-0 mt-1" name="surgeryHistory">
									<Input.TextArea rows={1} placeholder="ข้อมูลสำคัญทางผ่าตัด" />
								</Form.Item>
							</Col>
						</Row>
					</Col>
					<Col span={3}>
						<GenFormItemLabel label="วัคซีน Covid" />
						<Form.Item className="mb-0 mt-1 mb-1" name="latestCovidDose">
							<InputNumber
								style={{ width: '100%' }}
								addonBefore="เข็มที่"
								min={0}
								disabled={props?.page !== '7.3'}
							/>
						</Form.Item>
						<GenFormItemLabel label="วันที่ฉีดล่าสุด" />
						<Form.Item className="mb-0 mt-1" name="latestCovidLastDate">
							<DatePicker
								format={'DD/MM/YYYY'}
								style={{ width: '100%' }}
								disabled={props?.page !== '7.3'}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		);
	};
	const PartsDrugAllergyDetails = (disabledAction) => {
		const CardDetails = (val) => {
			return (
				<Badge.Ribbon
					text={
						<label className="data-value">{val.alevelName || 'ระดับ :-'}</label>
					}
					color="red"
				>
					<Card bordered={false} size={size} className="mb-1 pt-3">
						<div style={{ margin: -10 }}>
							<Row gutter={[2, 2]} className="mt-3">
								<Col className="me-4">
									{val.lockFlag ? (
										<LockOutlined style={{ color: 'red' }} />
									) : (
										<UnlockOutlined style={{ color: 'blue' }} />
									)}
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										icon={<EditOutlined className="gx-text-primary" />}
										disabled={disabledAction}
										onClick={() => {
											settempDrugAllergyId(val?.ptAdrId);
											setScreeningPharmaceuticalInfoActive(true);
										}}
									/>
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										type="danger"
										disabled={disabledAction}
										icon={<DeleteOutlined />}
										onClick={() => {
											settempDrugAllergyId(val?.ptAdrId);
											setShowCancelNoti(true);
											setCancelScreen('drugAllergy');
										}}
									/>
								</Col>
								<Col span={24}>
									<LabelTopic text={val.genericName} />
								</Col>
							</Row>
							<Row gutter={[2, 2]}>
								<Col span={7}>
									<label className="gx-text-primary">รายละเอียด</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.otherSymptom || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การวินิจฉัย</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.typedxDesc || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">อาการ</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.symptomName || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การให้ข้อมูล</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.informantdesc || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">รพ.ที่ให้</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.informhospName || '-'}</label>
								</Col>
								<Col span={7}><label className="gx-text-primary">ผู้บันทึก</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userCreated}
										{val.dateCreated
											? moment(val.dateCreated)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
								<Col span={7}><label className="gx-text-primary">ผู้แก้ไข</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userModified}
										{val.dateModified
											? moment(val.dateModified)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
							</Row>
						</div>
					</Card>
				</Badge.Ribbon>
			);
		};
		return (
			<Card
				bordered={false}
				className="mb-1"
				size={size}
				style={{ backgroundColor: '#f5f5f5' }}
				title={
					<Row gutter={[2, 2]} align="middle">
						<Col span={18}>
							<LabelTopicPrimary text="รายละเอียดแพ้ยา" />
						</Col>
						<Col span={6} className="text-end">
							<Button
								type="primary"
								size={size}
								shape="circle"
								className="m-0"
								onClick={() => {
									settempDrugAllergyId(null);
									setScreeningPharmaceuticalInfoActive(true);
									tmpFormData();
								}}
								icon={<PlusOutlined />}
								disabled={userDetail.userType !== 'P'}
							/>
						</Col>
					</Row>
				}
			>
				<div style={{ margin: -8 }}>
					{drugAllergic?.length > 0 ? (
						<Scrollbars autoHeight autoHeightMin={386}>
							<div className="pe-2">
								{drugAllergic
									.filter((drugAll) => drugAll.cancelFlag !== 'Y')
									.map((val, index) => {
										return <div key={String(index)}>{CardDetails(val)}</div>;
									})}
							</div>
						</Scrollbars>
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)}
				</div>
			</Card>
		);
	};
	const PartsDrugGroupAllergyDetails = (disabledAction) => {
		const CardDetails = (val) => {
			return (
				<Badge.Ribbon
					text={
						<label className="data-value">{val.alevelName || 'ระดับ :-'}</label>
					}
					color="red"
				>
					<Card bordered={false} size={size} className="mb-1">
						<div style={{ margin: -10 }}>
							<Row gutter={[2, 2]} className="mt-4">
								<Col className="me-3">
									{val.lockFlag ? (
										<LockOutlined style={{ color: 'red' }} />
									) : (
										<UnlockOutlined style={{ color: 'blue' }} />
									)}
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										icon={<EditOutlined className="gx-text-primary" />}
										disabled={disabledAction}
										onClick={() => {
											settempDrugAllergyId(val?.ptDgAdrId);
											setScreeningPharmaceuticalGroupInfoActive(true);
										}}
									/>
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										type="danger"
										disabled={disabledAction}
										icon={<DeleteOutlined />}
										onClick={() => {
											settempDrugAllergyId(val?.ptDgAdrId);
											setShowCancelNoti(true);
											setCancelScreen('ptDgAdrs');
										}}
									/>
								</Col>
								<Col span={24}>
									<label className="data-value fw-bold">{val.drugGroupDesc}</label>
								</Col>
								<Row gutter={[2, 2]}>
									<Col span={7}>
										<label className="gx-text-primary">รายละเอียด</label>
									</Col>
									<Col span={17}>
										<label className="data-value">
											{val.otherSymptom || '-'}
										</label>
									</Col>
									<Col span={7}>
										<label className="gx-text-primary">การวินิจฉัย</label>
									</Col>
									<Col span={17}>
										<label className="data-value">{val.typedxDesc || '-'}</label>
									</Col>
									<Col span={7}>
										<label className="gx-text-primary">อาการ</label>
									</Col>
									<Col span={17}>
										<label className="data-value">{val.symptomName || '-'}</label>
									</Col>
									<Col span={7}>
										<label className="gx-text-primary">การให้ข้อมูล</label>
									</Col>
									<Col span={17}>
										<label className="data-value">{val.informantDesc || '-'}</label>
									</Col>
									<Col span={7}>
										<label className="gx-text-primary">รพ.ที่ให้</label>
									</Col>
									<Col span={17}>
										<label className="data-value">
											{val.informhospName || '-'}
										</label>
									</Col>
									<Col span={7}><label className="gx-text-primary">ผู้บันทึก</label></Col>
									<Col span={17}>
										<label className="data-value">{val.userCreated}
											{val.dateCreated
												? moment(val.dateCreated)
													.format("DD/MM/YYYY HH:mm น.")
												: "-"}</label>
									</Col>
									<Col span={7}><label className="gx-text-primary">ผู้แก้ไข</label></Col>
									<Col span={17}>
										<label className="data-value">{val.userModified}
											{val.dateModified
												? moment(val.dateModified)
													.format("DD/MM/YYYY HH:mm น.")
												: "-"}</label>
									</Col>
								</Row>
							</Row>
						</div>
					</Card>
				</Badge.Ribbon>
			);
		};
		return (
			<Card
				bordered={false}
				className="mb-1"
				size={size}
				style={{ backgroundColor: '#f5f5f5' }}
				title={
					<Row gutter={[2, 2]} align="middle">
						<Col span={18}>
							<LabelTopicPrimary text="รายละเอียดแพ้กลุ่มยา" />
						</Col>
						<Col span={6} className="text-end">
							<Button
								type="primary"
								size={size}
								shape="circle"
								className="m-0"
								onClick={() => {
									settempDrugAllergyId(null);
									setScreeningPharmaceuticalGroupInfoActive(true);
									tmpFormData();
								}}
								icon={<PlusOutlined />}
								disabled={userDetail.userType !== 'P'}
							/>
						</Col>
					</Row>
				}
			>
				<div style={{ margin: -8 }}>
					{drugGroupAllergic?.length > 0 ? (
						<Scrollbars autoHeight autoHeightMin={386}>
							{drugGroupAllergic
								.filter((drugAll) => drugAll.cancelFlag !== 'Y')
								.map((val, index) => (
									<div key={index} className="pe-2">
										{CardDetails(val)}
									</div>
								))}
						</Scrollbars>
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)}
				</div>
			</Card>
		);
	};
	const PartsPtCodeAdrs = () => {
		const CardDetails = (val) => {
			return (
				<Badge.Ribbon
					text={
						<label className="data-value">{val.alevelName || 'ระดับ :-'}</label>
					}
					color="red"
				>
					<Card bordered={false} size={size} className="mb-1">
						<div style={{ margin: -10 }}>
							<Row gutter={[2, 2]} className="mt-4">
								<Col className="me-3">
									{val.lockFlag ? (
										<LockOutlined style={{ color: 'red' }} />
									) : (
										<UnlockOutlined style={{ color: 'blue' }} />
									)}
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										icon={<EditOutlined className="gx-text-primary" />}
										disabled={
											!(
												userDetail.userType === 'M' ||
												userDetail.userType === 'D'
											)
										}
										onClick={() => {
											setVsbPtCodeAdrs(true);
											setDefaultPtCodeAdrs(val);
										}}
									/>
								</Col>
								<Col>
									<Popconfirm
										title="ลบจากระบบ ?"
										cancelText="ปิด"
										okText="ยืนยัน"
										onConfirm={() => delTbPtCodeAdrs(val.ptCodeAdrId)}
									>
										<Button
											size={size}
											className="m-0"
											type="danger"
											icon={<DeleteOutlined />}
											disabled={
												!(
													userDetail.userType === 'M' ||
													userDetail.userType === 'D'
												)
											}
											onClick={(e) => {
												e.stopPropagation();
											}}
										/>
									</Popconfirm>
								</Col>
								<Col span={24}>
									<LabelTopic text={val.expenseName} />
								</Col>
							</Row>
							<Row gutter={[2, 2]}>
								<Col span={7}>
									<label className="gx-text-primary">รายละเอียด</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.otherSymptom || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การวินิจฉัย</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.typedxDesc || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">อาการ</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.symptomDesc || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การให้ข้อมูล</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.informantDesc || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">รพ.ที่ให้</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.informhospName || '-'}
									</label>
								</Col><Col span={7}><label className="gx-text-primary">ผู้บันทึก</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userCreated}
										{val.dateCreated
											? moment(val.dateCreated)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
								<Col span={7}><label className="gx-text-primary">ผู้แก้ไข</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userModified}
										{val.dateModified
											? moment(val.dateModified)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
							</Row>
						</div>
					</Card>
				</Badge.Ribbon>
			);
		};
		return (
			<Card
				bordered={false}
				className="mb-1"
				size={size}
				style={{ backgroundColor: '#f5f5f5' }}
				title={
					<Row gutter={[2, 2]} align="middle">
						<Col span={18}>
							<LabelTopicPrimary text="รายละเอียดแพ้ Code ยา" />
						</Col>
						<Col span={6} className="text-end">
							<Button
								type="primary"
								size={size}
								shape="circle"
								className="m-0"
								onClick={() => {
									setVsbPtCodeAdrs(true);
								}}
								icon={<PlusOutlined />}
								disabled={userDetail.userType !== 'P'}
							/>
						</Col>
					</Row>
				}
			>
				<div style={{ margin: -8 }}>
					{ptDrugCode?.length > 0 ? (
						<Scrollbars autoHeight autoHeightMin={386}>
							<div className="pe-2">
								{ptDrugCode
									.filter((drugAll) => drugAll.cancelFlag !== 'Y')
									.map((val, index) => {
										return <div key={String(index)}>{CardDetails(val)}</div>;
									})}
							</div>
						</Scrollbars>
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)}
				</div>
			</Card>
		);
	};
	const PartsModalPtCodeAdrs = () => {
		if (!patientDetail?.patientId) return;
		const splitHn = patientDetail.hn.split('/');
		return (
			<PtCodeAdrs
				patientId={patientDetail.patientId}
				hn={patientDetail.hn}
				runHn={splitHn[0]}
				yearHn={splitHn[1]}
				visible={vsbPtCodeAdrs}
				onCancel={() => {
					setVsbPtCodeAdrs(false);
					setDefaultPtCodeAdrs(null);
				}}
				defaultPtCodeAdrs={defaultPtCodeAdrs}
				isFinished={() => {
					getPtCodeAdrs(props?.patientId);
					reloadPtCodeAdrs();
				}}
			/>
		);
	};
	const PartsDrugComponentAllegies = () => {
		const CardDetails = (val) => {
			return (
				<Badge.Ribbon
					text={
						<label className="data-value">{val.alevelName || 'ระดับ :-'}</label>
					}
					color="red"
				>
					<Card bordered={false} size={size} className="mb-1">
						<div style={{ margin: -10 }}>
							<Row gutter={[2, 2]} className="mt-4">
								<Col className="me-3">
									{val.lockFlag ? (
										<LockOutlined style={{ color: 'red' }} />
									) : (
										<UnlockOutlined style={{ color: 'blue' }} />
									)}
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										icon={<EditOutlined className="gx-text-primary" />}
										disabled={
											!(
												userDetail.userType === 'M' ||
												userDetail.userType === 'D'
											)
										}
										onClick={() => {
											setVsbDrugComponent(true);
											setDefaultDrugComponent(val);
										}}
									/>
								</Col>
								<Col>
									<Popconfirm
										title="ยกเลิกใช้งาน ?"
										cancelText="ปิด"
										okText="ยืนยัน"
										onConfirm={() =>
											updateCancelFlagDrugComponentAllegies(val, 'Y')
										}
									>
										<Button
											hidden={val?.cancelFlag === 'Y'}
											size={size}
											className="m-0"
											type="danger"
											icon={<DeleteOutlined />}
											disabled={
												!(
													userDetail.userType === 'M' ||
													userDetail.userType === 'D'
												)
											}
											onClick={(e) => {
												e.stopPropagation();
											}}
										/>
									</Popconfirm>
									<Popconfirm
										title="กู้คืนการใช้งาน ?"
										cancelText="ปิด"
										okText="ยืนยัน"
										onConfirm={() =>
											updateCancelFlagDrugComponentAllegies(val, null)
										}
									>
										<Button
											hidden={val?.cancelFlag !== 'Y'}
											size={size}
											className="m-0"
											type="primary"
											icon={<RedoOutlined />}
											disabled={
												!(
													userDetail.userType === 'M' ||
													userDetail.userType === 'D'
												)
											}
											onClick={(e) => {
												e.stopPropagation();
											}}
										/>
									</Popconfirm>
								</Col>
								<Col span={24}>
									<LabelTopic text={val.drugComponentName} />
								</Col>
							</Row>
							<Row gutter={[2, 2]}>
								<Col span={7}>
									<label className="gx-text-primary">รายละเอียด</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.otherSymptom || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">ADR</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.typeDxName || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">อาการ</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.symptomName || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การให้ข้อมูล</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.informantName || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">รพ.ที่ให้</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.hospName || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">ผู้บันทึก</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.userCreated}
										{val.dateCreated
											? moment(val.dateCreated)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">ผู้แก้ไข</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.userModified}
										{val.dateModified
											? moment(val.dateModified)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>

								</Col>
							</Row>
						</div>
					</Card>
				</Badge.Ribbon>
			);
		};
		return (
			<Card
				bordered={false}
				className="mb-1"
				size={size}
				style={{ backgroundColor: '#f5f5f5' }}
				title={
					<Row gutter={[2, 2]} align="middle">
						<Col span={19}>
							<LabelTopicPrimary text="รายละเอียดแพ้ส่วนประกอบยา" />
						</Col>
						<Col span={5} className="text-end">
							<Button
								type="primary"
								size={size}
								shape="circle"
								className="m-0"
								onClick={() => {
									setVsbDrugComponent(true);
								}}
								icon={<PlusOutlined />}
								disabled={userDetail.userType !== 'P'}
							/>
						</Col>
					</Row>
				}
			>
				<div style={{ margin: -8 }}>
					{drugComponentAllegies?.length > 0 ? (
						<Scrollbars autoHeight autoHeightMin={386}>
							<div className="pe-2">
								{
									// _sortBy(drugComponentAllegies, (item) => item.cancelFlag !== null)?.map
									drugComponentAllegies.map((val, index) => {
										return <div key={String(index)}>{CardDetails(val)}</div>;
									})
								}
							</div>
						</Scrollbars>
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)}
				</div>
			</Card>
		);
	};
	const PartsModalDrugComponentAllegies = () => {
		if (!patientDetail?.patientId) return;
		const splitHn = patientDetail.hn.split('/');
		return (
			<DrugComponent
				patientId={patientDetail.patientId}
				hn={patientDetail.hn}
				runHn={splitHn[0]}
				yearHn={splitHn[1]}
				visible={vsbDrugComponent}
				onCancel={() => {
					setVsbDrugComponent(false);
					setDefaultDrugComponent(null);
				}}
				defaultValues={defaultDrugComponent}
				isFinished={() => {
					getDrugComponentAllegies(props?.patientId);
					reloadDrugComponentAllegies();
				}}
				prevRecord={drugComponentAllegies}
			/>
		);
	};
	const PartsOutDrugAllergyDetails = (disabledAction) => {
		const CardDetails = (val) => {
			return (
				<Badge.Ribbon
					text={
						<label className="data-value">{val.aLevel || 'ระดับ :-'}</label>
					}
					color="red"
				>
					<Card bordered={false} size={size} className="mb-1 pt-3">
						<div style={{ margin: -10 }}>
							<Row gutter={[2, 2]} className="mt-3">
								<Col className="me-4">
									{val.lockFlag ? (
										<LockOutlined style={{ color: 'red' }} />
									) : (
										<UnlockOutlined style={{ color: 'blue' }} />
									)}
								</Col>
								<Col>
									<Button
										size={size}
										className="m-0"
										icon={<EditOutlined className="gx-text-primary" />}
										disabled={disabledAction}
										onClick={() => {
											setOutDrugAllergyId(val?.ptOutMdcAlgId);

											setScreeningOutPharmaceuticalInfoActive(true);
										}}
									/>
								</Col>
								<Col>
									<Popconfirm
										title="ลบจากระบบ ?"
										cancelText="ปิด"
										okText="ยืนยัน"
										onConfirm={async () => {
											setOutDrugAllergyId(val?.ptOutMdcAlgId)
											await withResolve(
												`/api/DrugAllergies/AdrRegistration/${val?.ptOutMdcAlgId}`
											).delete()
											await getOutDrugAllergies(props.patientId)
										}}
									>

										<Button
											size={size}
											className="m-0"
											type="danger"
											disabled={disabledAction}
											icon={<DeleteOutlined />}
											onClick={(e) => {
												e.stopPropagation();
											}}

										/></Popconfirm>
								</Col>
								<Col span={24}>
									<LabelTopic text={val.drug} />
								</Col>
							</Row>
							<Row gutter={[2, 2]}>
								<Col span={7}>
									<label className="gx-text-primary">รายละเอียด</label>
								</Col>
								<Col span={17}>
									<label className="data-value">
										{val.otherSymptom === 'Null' && '-' || val.otherSymptom === null && '-' || val.otherSymptom || '-'}
									</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การวินิจฉัย</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.typeDX === 'Null' && '-' || val.typeDX === null && '-' || val.typeDX || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">อาการ</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.symptom === 'Null' && '-' || val.symptom === null && '-' || val.symptom || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">การให้ข้อมูล</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.informant === 'Null' && '-' || val.informant === null && '-' || val.informant || '-'}</label>
								</Col>
								<Col span={7}>
									<label className="gx-text-primary">รพ.ที่ให้</label>
								</Col>
								<Col span={17}>
									<label className="data-value">{val.informHosp === 'Null' && '-' || val.informHosp === null && '-' || val.informHosp || '-'}</label>
								</Col>
								<Col span={7}><label className="gx-text-primary">ผู้บันทึก</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userCreated}
										{val.dateCreated
											? moment(val.dateCreated)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
								<Col span={7}><label className="gx-text-primary">ผู้แก้ไข</label></Col>
								<Col span={17}>
									<label className="data-value">{val.userModified}
										{val.dateModified
											? moment(val.dateModified)
												.format("DD/MM/YYYY HH:mm น.")
											: "-"}</label>
								</Col>
							</Row>
						</div>
					</Card>
				</Badge.Ribbon>
			);
		};
		return (
			<Card
				bordered={false}
				className="mb-1"
				size={size}
				style={{ backgroundColor: '#f5f5f5' }}
				title={
					<Row gutter={[2, 2]} align="middle">
						<Col span={18}>
							<LabelTopicPrimary text="รายละเอียดแพ้ยานอกทะเบียน รพ." />
						</Col>
						<Col span={6} className="text-end">
							<Button
								type="primary"
								size={size}
								shape="circle"
								className="m-0"
								onClick={() => {
									setOutDrugAllergyId(null);
									setScreeningOutPharmaceuticalInfoActive(true);
									tmpFormData();
								}}
								icon={<PlusOutlined />}
								disabled={userDetail.userType !== 'P'}
							/>
						</Col>
					</Row>
				}
			>
				<div style={{ margin: -8 }}>
					{outDrugAllergic?.length > 0 ? (
						<Scrollbars autoHeight autoHeightMin={386}>
							<div className="pe-2">
								{outDrugAllergic
									.filter((drugAll) => drugAll.cancelFlag !== 'Y')
									.map((val, index) => {
										return <div key={String(index)}>{CardDetails(val)}</div>;
									})}
							</div>
						</Scrollbars>
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					)}
				</div>
			</Card>
		);
	};
	return (
		<>
			<Modal
				centered
				forceRender
				width={1185}
				title={<>{PartsTitle()}</>}
				visible={props.showPharmaceuticalDetail}
				onCancel={() => {
					props.handlePharmaceuticalDetail(false);
				}}
				footer={<>{PartsFooter()}</>}
			>
				<Spin
					spinning={
						loading || loadingPtCodeAdrs || loadingDrugComponentAllegies
					}
				>
					<div style={{ margin: -18 }}>
						<Row {...rowProps}>
							<Col span={24}>
								{/*ไม่มีประวัติแพ้ยา */}
								{PartsForm()}
							</Col>
							{/* รายละเอียดแพ้ยา */}
							<Col span={6}>{PartsDrugAllergyDetails(disabledAction)}</Col>
							{/* รายละเอียดแพ้กลุ่มยา */}
							<Col span={6}>{PartsDrugGroupAllergyDetails(disabledAction)}</Col>
							<Col span={6}>
								{PartsPtCodeAdrs()}
								{PartsModalPtCodeAdrs()}
							</Col>
							<Col span={6}>
								{PartsDrugComponentAllegies()}
								{PartsModalDrugComponentAllegies()}
							</Col>
							{/* รายละเอียดแพ้ยานอกทะเบียน รพ */}
							<Col span={6}>{PartsOutDrugAllergyDetails(disabledAction)}</Col>
						</Row>
					</div>
				</Spin>
			</Modal>
			{screeningPharmaceuticalInfoActive && (
				<PharmaceuticalInfo
					handleScreeningPharmaceuticalInfoModal={
						handleScreeningPharmaceuticalInfoModal
					}
					screeningPharmaceuticalInfoActive={screeningPharmaceuticalInfoActive}
					fetchDrugAllergiesByPatientId={() =>
						getDrugAllergies(props?.patientId)
					}
					patientId={props?.patientId}
					ptAdrId={tempDrugAllergyId}
				/>
			)}
			{screeningPharmaceuticalGroupInfoActive && (
				<PharmaceuticalGroupInfo
					handleScreeningPharmaceuticalGroupInfoModal={
						handleScreeningPharmaceuticalGroupInfoModal
					}
					screeningPharmaceuticalGroupInfoActive={
						screeningPharmaceuticalGroupInfoActive
					}
					fetchDrugAllergiesByPatientId={getDrugAllergies}
					patientId={props?.patientId}
					ptDgAdrId={tempDrugAllergyId}
				/>
			)}
			{showCancelNoti ? (
				<ModalCancelReasonDrugAllergy
					showCancelNoti={showCancelNoti}
					setShowCancelNoti={setShowCancelNoti}
					formCancelNoti={formCancelNoti}
					updCancelReason={updCancelReason}
				/>
			) : null}
			{screeningOutPharmaceuticalInfoActive && (
				<OutPhamaceuticallInfo
					handleScreeningPharmaceuticalInfoModal={
						handleScreeningOutPharmaceuticalInfoModal
					}
					screeningPharmaceuticalInfoActive={
						screeningOutPharmaceuticalInfoActive
					}
					fetchDrugAllergiesByPatientId={() =>
						getOutDrugAllergies(props?.patientId)
					}
					patientId={props?.patientId}
					ptOutMdcAlgId={outDrugAllergyId}

				/>
			)}
		</>
	);
});
const ModalCancelReasonDrugAllergy = ({
	showCancelNoti,
	setShowCancelNoti,
	formCancelNoti,
	updCancelReason,
}) => {
	return (
		<Modal
			title="การแจ้งเตือน"
			visible={showCancelNoti}
			closable={false}
			footer={false}
		>
			<Form
				id="dynamic_form_nest_item"
				form={formCancelNoti}
				onFinish={updCancelReason}
			>
				<Row>
					<Col
						span={24}
						style={{
							color: '#1daa3e',
							textAlign: 'left',
						}}
					>
						เหตุในการลบรายการแพ้ยา
					</Col>
					<Col span={24}>
						<Form.Item
							name="cancelReason"
							rules={[
								{
									required: true,
								},
							]}
							style={{
								paddingRight: '16px',
								paddingLeft: '16px',
							}}
						>
							<Input />
						</Form.Item>
					</Col>
				</Row>

				<Row align="middle">
					<Col
						span={12}
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
						}}
					>
						<Form.Item
							style={{
								paddingRight: '8px',
							}}
						>
							<Button
								type="default"
								onClick={() => {
									setShowCancelNoti(false);
								}}
							>
								ออก
							</Button>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								บันทึก
							</Button>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};
const apis = {
	GetPatientsDrugAllergies: {
		url: 'Patients/GetPatients_Drug_AllergiesById/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetTbPtCodeAdrs: {
		url: 'TbPtCodeAdrs/GetTbPtCodeAdrsDisplay/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetDrugComponentAllegies: {
		url: 'DrugAllergies/GetListDrugComponentAllegies/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetOutDrugAllegies: {
		url: 'DrugAllergies/AdrRegistrationList/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	DelTbPtCodeAdrs: {
		url: 'TbPtCodeAdrs/DelTbPtCodeAdrs?PtCodeAdrId=',
		method: 'DELETE',
		return: 'data',
		sendRequest: false,
	},
	UpSertDrugComponentAllegies: {
		url: 'DrugAllergies/UpSertDrugComponentAllegies',
		method: 'POST',
		return: 'data',
		sendRequest: true,
	},
};
