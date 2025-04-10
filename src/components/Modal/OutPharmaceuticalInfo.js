import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Select, Input, message, Spin } from 'antd';
import moment from 'moment';
import {
	Get_Upd_Patient_Drug_Allergies,
	UpdPatients_Drug_Allergies,
} from '../../routes/AdrRegistration/API/DrugAllergyApi';
import { withResolve } from 'api/create-api.js';
import SelectHospCode from 'components/Input/SelectHospCode.js';
const { Option } = Select;
const { TextArea } = Input;
export default function OutPhamaceuticallInfo({ ...props }) {
	// Api
	// Dropdown
	// [GET] http://203.154.95.149:3321/api/Patients/Get_Upd_Patient_Drug_Allergies/170640
	// ระบุ typedx = 2 ตอนดึง api ได้ typedx = null
	// ดึง typedx มาให้แล้ว ครับ
	// [GET] http://203.154.95.149:3321/api/Patients/GetPatients/951745
	// ขอ field admitId

	const userFromSession = JSON.parse(sessionStorage.getItem('user'));
	const user = userFromSession.responseData.userId;
	const [modalloading, setModalLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [listDrugGeneric, setListDrugGeneric] = useState([]);
	const [listLevel, setListLevel] = useState([]);
	const [listTypeDx, setListTypeDx] = useState([]);
	const [listSymptoms, setListSymptoms] = useState([]);
	const [listInformant, setListInformant] = useState([]);
	const [listHosp, setListHosp] = useState([]);
	const [listWorkPlace, setListWorkPlace] = useState([]);
	const [listNewFlag, setListNewFlag] = useState([]);

	const [patient, setPatient] = useState({});
	const getPatientsByPatientId = async (patientId) => {
		await axios({
			url:
				`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsByPatientId/` +
				patientId,
			method: 'GET',
			// data: { requestData }
		})
			.then((res) => {
				setPatient(res.data.responseData[0]);
			})
			.catch((error) => {
				return error;
			});
	};
	const GetDropDown = async () => {
		const [
			typeDxData,
			hospCodeData,
			levelMasData,
			informantData,
			newFlagData,
			allergySymptomsData,
			workPlaceMasData,
		] = await Promise.all([
			withResolve(`/api/DrugAllergies/TypeDX`).fetch(),
			withResolve('/api/Masters/GetHospcodes').fetch(),
			withResolve(
				'/api/DrugAllergies/GetAllergyLevelsMas?MeaningFlag=1'
			).fetch(),
			withResolve('/api/Masters/GetInformant').insert(),
			withResolve('/api/Masters/GetNewFlag').insert(),
			withResolve('/api/Masters/GetAllergySymptoms').insert(),
			withResolve('/api/OpdExamination/GetWorkPlacesMas').insert(),
		]);
		setListTypeDx(typeDxData);
		setListHosp(hospCodeData);
		setListLevel(levelMasData);
		setListInformant(informantData);
		setListNewFlag(newFlagData);
		setListSymptoms(allergySymptomsData);
		setListWorkPlace(workPlaceMasData);
	};

	useEffect(() => {
		GetDropDown();
	}, []);

	const getInitialValues = async (ptOutMdcAlgId) => {
		setModalLoading(true);
		const res = await withResolve(
			`/api/DrugAllergies/AdrRegistration/${ptOutMdcAlgId}`
		).fetch();
		delete res.result?.picture;
		form.setFieldsValue({
			...res?.result,
			adrDate: moment(res.result?.adrDate),
			dateEvaluated: moment(res.result?.dateEvaluated),
			typeDX: res.result?.typeDX === 0 ? null : `${res.result?.typeDX}`,
			informant:
				res.result?.informant === 0 ? null : `${res.result?.informant}`,
			workId: res.result?.workId === 0 ? null : `${res.result?.workId}`,
		});
		setData(res?.result);
		setModalLoading(false);
	};

	useEffect(() => {
		if (props?.patientId) {
			getPatientsByPatientId(props?.patientId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.patientId]);
	useEffect(() => {
		if (props?.ptOutMdcAlgId) {
			getInitialValues(props?.ptOutMdcAlgId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.ptOutMdcAlgId]);

	// แจ้งเตือน
	const success = () => {
		message.success('เพิ่มรายการยาที่แพ้ สำเร็จ', 5);
	};
	const error = () => {
		message.error('เพิ่มรายการยาที่แพ้ ไม่สำเร็จ', 5);
	};
	const [form] = Form.useForm();
	const onFinish = async (values) => {
		// values = form.getFieldValue();
		// console.log(form.getFieldValue(), 'dd');
		// let req = {
		// 	requestData: {
		// 		ptAdrId: values?.ptAdrId ? values?.ptAdrId : null,
		// 		patientId: patient.patientId,
		// 		runHn: patient.runHn,
		// 		yearHn: patient.yearHn,
		// 		hn: patient.hn,
		// 		generic: values?.generic ? values?.generic : null,
		// 		typedx: values?.typedx ? values?.typedx : null,
		// 		symptom: values?.symptom ? values?.symptom : null,
		// 		otherSymptom: values?.otherSymptom ? values?.otherSymptom : null,
		// 		alevel: values?.alevel ? values?.alevel : null,
		// 		informuser: null,
		// 		informant: values?.informant ? values?.informant : null,
		// 		informhosp: values?.informhosp ? values?.informhosp : null,
		// 		lockFlag: null,
		// 		userCreated: user,
		// 		dateCreated: moment().format('MM/DD/YYYY HH:mm:ss'),
		// 		userModified: null,
		// 		dateModified: null,
		// 		mapping1: null,
		// 	},
		// };
		// const insPatients_Drug_Allergies = async () => {
		// 	setLoading(true);
		// 	await axios({
		// 		url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/InsPatients_Drug_Allergies`,
		// 		method: 'POST',
		// 		data: req,
		// 	})
		// 		.then((res) => {
		// 			if (res.data.isSuccess) {
		// 				success();
		// 				props.handleScreeningPharmaceuticalInfoModal(false);
		// 				props.fetchDrugAllergiesByPatientId(patient.patientId);
		// 			} else {
		// 				error();
		// 			}
		// 		})
		// 		.catch((error) => {
		// 			return error;
		// 		});
		// 	setLoading(false);
		// };
		// const updPatients_Drug_Allergies = async () => {
		// 	setLoading(true);
		// 	let res = await UpdPatients_Drug_Allergies(req);
		// 	if (res?.isSuccess) {
		// 		message.success('แก้ไขรายการยาที่แพ้ สำเร็จ', 5);
		// 		props.handleScreeningPharmaceuticalInfoModal(false);
		// 		props.fetchDrugAllergiesByPatientId(patient.patientId);
		// 	} else {
		// 		message.error('แก้ไขรายการยาที่แพ้ ไม่สำเร็จ', 5);
		// 	}
		// 	setLoading(false);
		// };
		// if (patient?.patientId) {
		// 	if (values?.ptAdrId) {
		// 		updPatients_Drug_Allergies();
		// 	} else {
		// 		insPatients_Drug_Allergies();
		// 	}
		// }
		console.log('values', values);
		const req = {
			...data,
			drug: values.drug,
			ptOutMdcAlgId: props.ptOutMdcAlgId ? Number(props.ptOutMdcAlgId) : 0,
			typeDX: Number(values.typeDX),
			informant: Number(values.informant),
			workId:
				values.workId === null || values.workId === '0'
					? null
					: Number(values.workId),
			patientId: Number(props.patientId),
			informHOSP: values.informHOSP,
			symptom: values.symptom,
			otherSymptom: values.otherSymptom,
			aLevel: values.aLevel,

		};
		console.log('req', req);
		const res = await withResolve('/api/DrugAllergies/AdrRegistration').insert(
			req
		);
		form.resetFields();
		if (res.result === 'Update or Insert Success') {
			message.success('แก้ไขรายการยาที่แพ้ สำเร็จ', 5);
			props.handleScreeningPharmaceuticalInfoModal(false);
			props.fetchDrugAllergiesByPatientId(patient.patientId);
		} else {
			message.error('แก้ไขรายการยาที่แพ้ ไม่สำเร็จ', 5);
		}
		// console.log('res', res.result);
	};
	const inputForm = ({
		title = '',
		name,
		required = false,
		message = 'กรุณาระบุ',
	}) => {
		const label = <label className="gx-text-primary">{title}</label>;
		return (
			<Form.Item
				name={name}
				label={label}
				labelCol={{ span: 24 }}
				wrapperCol={{ span: 24 }}
				style={{ width: '100%' }}
				rules={[{ required: required, message: message }]}
			>
				<Input style={{ width: '100%' }} />
			</Form.Item>
		);
	};
	const dropdownForm = ({
		title = '',
		val = [],
		name,
		required = false,
		message = 'กรุณาระบุ',
		onChange = () => { },
	}) => {
		const label = <label className="gx-text-primary">{title}</label>;
		return (
			<Form.Item
				label={label}
				name={name}
				labelCol={{ span: 24 }}
				wrapperCol={{ span: 24 }}
				style={{ width: '100%' }}
				rules={[{ required: required, message: message }]}
			>
				<Select
					showSearch
					allowClear
					dropdownMatchSelectWidth={false}
					options={val}
					placeholder={'ระบุคำค้นหา'}
					optionFilterProp="label"
					style={{ width: '100%' }}
					onChange={onChange}
				/>
			</Form.Item>
		);
	};
	return (
		<Modal
			loading={modalloading}
			title={
				<label className="gx-text-primary fw-bold fs-5">
					{props?.initialValues ? 'แก้ไขข้อมูลแพ้ยา' : 'เพิ่มข้อมูลแพ้ยา'}
				</label>
			}
			centered
			visible={props.screeningPharmaceuticalInfoActive}
			onCancel={() => props.handleScreeningPharmaceuticalInfoModal(false)}
			footer={
				<div className="text-center">
					<Button
						type="default"
						onClick={() => props.handleScreeningPharmaceuticalInfoModal(false)}
						disabled={loading}
					>
						ปิด
					</Button>
					<Button
						type="primary"
						onClick={() => form.submit()}
						disabled={loading || modalloading}
					>
						บันทึก
					</Button>
				</div>
			}
			width={750}
		>
			<Spin spinning={modalloading}>
				<Form layout="vertical" form={form} onFinish={onFinish}>
					<div className="d-flex flex-row">
						{/* ยาที่แพ้ */}
						<div
							className="me-3"
							style={{
								width: '50%',
							}}
						>
							{inputForm({
								title: 'รายการยา',
								name: 'drug',
								required: true,
							})}
						</div>
						{/* ระดับความรุนแรง */}
						<div
							style={{
								width: '50%',
							}}
						>
							{dropdownForm({
								title: 'ความรุนแรง',
								name: 'aLevel',
								val: listLevel.result?.map((n) => ({
									label: n.name,
									value: n.code,
								})), required: true,
							})}
						</div>
					</div>
					<Form.Item
						name={'otherSymptom'}
						label={
							<label className="gx-text-primary">
								ระบุรายละเอียดการแพ้ยา
							</label>
						}
						labelCol={{ span: 24 }}
						wrapperCol={{ span: 24 }}
						style={{ width: '100%' }}
					// rules={[{ required: required, message: message }]}
					>
						<Input.TextArea
							placeholder="ระบุรายละเอียดการแพ้ยา"
							style={{ width: '100%' }}
							rows={4}
						/>
					</Form.Item>
					<div className="d-flex flex-row">
						<div
							className="me-3"
							style={{
								width: '50%',
							}}
						>
							{dropdownForm({
								title: 'ระดับการประเมิณ',
								name: 'typeDX',
								val: listTypeDx.result?.map((n) => ({
									label: n.datadisplay,
									value: n.datavalue,
								})),

							})}
						</div>
						<div
							style={{
								width: '50%',
							}}
						>
							{dropdownForm({
								title: 'ลักษณะอาการณ์',
								name: 'symptom',
								val: listSymptoms.result?.map((n) => ({
									label: n.datadisplay,
									value: n.datavalue,
								})),
							})}
						</div>
					</div>
					<div className="d-flex flex-row">
						<div
							className="me-3"
							style={{
								width: '50%',
							}}
						>
							{dropdownForm({
								title: 'การให้ข้อมูล',
								name: 'informant',
								val: listInformant.result?.map((n) => ({
									label: n.datadisplay,
									value: n.datavalue,
								})),
							})}
						</div>
						<div
							style={{
								width: '50%',
							}}
						>
							<Form.Item
								label={
									<label className="gx-text-primary">
										โรงพยาบาลที่ให้ข้อมูล
									</label>
								}
								name={'informHOSP'}
								labelCol={{ span: 24 }}
								wrapperCol={{ span: 24 }}
								style={{ width: '100%' }}
							>
								<SelectHospCode value={form.getFieldValue('informHOSP')} />
							</Form.Item>
						</div>
					</div>
				</Form>
			</Spin>
		</Modal>
	);
}
