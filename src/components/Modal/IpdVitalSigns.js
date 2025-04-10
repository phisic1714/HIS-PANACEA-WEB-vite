import React, { useState, useEffect } from 'react';
import { groupBy, map, find, filter, toNumber, uniqBy, intersectionBy, differenceBy, sortBy, isNaN } from 'lodash';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { nanoid } from 'nanoid';
import { Scrollbars } from 'react-custom-scrollbars';
import {
	Modal,
	Form,
	Checkbox,
	Col,
	ConfigProvider,
	Card,
	Button,
	Spin,
	Row,
	Divider,
} from 'antd';
import {
	GenFormItem2,
	GenSelect,
	GenInputNumber,
	GenDatePicker,
	GenTimePicker,
	// GenInput,
} from 'components/Input/FormControls';
import GenRow from 'components/helper/function/GenRow';
import {
	LabelTopicPrimary18,
	LabelText,
	LabelTopic,
	LabelTopicPrimary,
} from 'components/helper/function/GenLabel';
import { callApis } from 'components/helper/function/CallApi';
import {
	notiSuccess,
	notiError,
	notiWarning,
} from 'components/Notification/notificationX';
import dayjs from 'dayjs';
import thTH from 'antd/lib/locale/th_TH';
import { mappingOptions } from 'components/helper/function/MappingOptions';
import { defaultVsFromInterface } from 'components/helper/function/DefaultVsFromInterface';
import { chkVitalSignAlert, chkVitalSignConfigs } from '../helper/VitaalSign';
import SosScore from './SosScore';
import useSignalrHub from 'libs/useSignalrHub';

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const user = userFromSession.responseData.userId;
const hosParam = JSON.parse(localStorage.getItem('hos_param'));

export default function IpdVitalSigns({
	visible = false,
	setVisible = () => { },
	patientId = null,
	hn = null,
	admitId = null,
	size = 'small',
	masterDataModalWait,
	admitForm = null,
}) {
	const [form] = Form.useForm();
	const bodyTemperature = Form.useWatch('bodyTemperature', form);
	const pulse = Form.useWatch('pulse', form);
	const respiratory = Form.useWatch('respiratory', form);
	const bpSystolic = Form.useWatch('bpSystolic', form);
	const bpDiastolic = Form.useWatch('bpDiastolic', form);
	const weight = Form.useWatch('weight', form);
	const height = Form.useWatch('height', form);

	const [loading, setLoading] = useState(false);
	const [patient, setPatient] = useState(false);
	// console.log('patient :>> ', patient);
	const [vitalSignConfigs, setVitalSignConfigs] = useState(null);
	const [listVitalSigns, setListVitalSigns] = useState([]);
	const [listForVistalSignTable, setListForVistalSignTable] = useState([]);
	const [chartName, setChartName] = useState('chartDiv');
	const [vsbSosScore, setVsbSosScore] = useState(false);

	const downloadDD = async () => {
		let [configdata, urgentType] = await Promise.all([
			callApis(apis['GetConfigdata']),
			// callApis(apis['GetUrgentTypes']),
		]);
		// urgentType = mappingOptions({
		// 	dts: urgentType,
		// 	valueField: 'datavalue',
		// 	labelField: 'datadisplay',
		// });
		// setOptionUrgentType(urgentType);
		setVitalSignConfigs(configdata);
	};

	const getAdmitByAdmitID = async (patientId, admitId) => {
		if (!admitId) return setPatient(null);
		const req = {
			patientId,
			admitId,
		};
		setLoading((p) => !p);
		const res = await callApis(apis['GetAdmitByAdmitID'], req);
		setLoading((p) => !p);
		setPatient(res);
	};

	const getVitalSignsDisplay = async (patientId) => {
		setLoading((p) => !p);
		setChartName(nanoid());
		let res = await callApis(apis['GetVitalSignsDisplay'], patientId);
		setLoading((p) => !p);
		setListVitalSigns(res?.length > 0 ? res : []);
	};
	const insertTbVitalSign = async (dts) => {
		if (!admitId) return
		const req = {
			...dts,
			"vitalsignId": null,
			"patientId": patient.patientId,
			"runHn": patient.runHn,
			"yearHn": patient.yearHn,
			"hn": patient.hn,
			"workId": patient.ward,
			"serviceId": patient.serviceId,
			"clinicId": patient.clinicId,
			"admitId": patient.admitId,
			"userCreated": user,
			"userModified": null,
			"dateModified": null,
		}
		const res = await callApis(apis["InsVitalSigns"], req)
		if (res?.isSuccess) {
			getVitalSignsDisplay(patientId)
		}
	}
	const updVitalSignAdmit = async (req) => {
		setLoading((p) => !p);
		const res = await callApis(apis['UpdVitalsignadmit'], req);
		setLoading((p) => !p);
		if (res?.isSuccess) {
			insertTbVitalSign(req)
			notiSuccess({ message: 'บันทึก Vital signs' });
			form.resetFields();
			defaultVs(patientId, admitId);
			if (admitForm) {
				admitForm.setFieldsValue({
					bodyTemperature: req?.bodyTemperature || null,
					pulse: req?.pulse || null,
					respiratory: req?.respiratory || null,
					bpSystolic: req?.bpSystolic || null,
					bpDiastolic: req?.bpDiastolic || null,
					map: req?.map || null,
					o2sat: req?.o2sat || null,
					weight: req?.weight || null,
					height: req?.height || null,
				})
			}
		} else notiError({ message: 'บันทึก Vital signs' });
	};

	const onFinish = (v) => {
		let vitalSignAlert = chkVitalSignAlert(v, hosParam?.vitalSignAlert, vitalSignConfigs);
		if (vitalSignAlert)
			return notiWarning({
				message: 'ค่า Vital signs เกิน Limit !',
				description: 'กรุณาตรวจสอบข้อมูล',
			});
		const { patientId, runHn, yearHn, hn, ward, serviceId, clinicId, admitId } =
			patient;
		const req = {
			patientId: patientId || null,
			runHn: runHn || null,
			yearHn: yearHn || null,
			hn: hn || null,
			workId: ward || null,
			serviceId: serviceId || null,
			clinicId: clinicId || null,
			admitId: admitId || null,
			userCreated: user,
			dateCreated: `${dayjs(v.date).format('YYYY-MM-DD')} ${dayjs(v.time).format('HH:mm')}`,
			bodyTemperature: v.bodyTemperature ? String(v.bodyTemperature) : null,
			pulse: v.pulse ? String(v.pulse) : null,
			respiratory: v.respiratory ? String(v.respiratory) : null,
			bpSystolic: v.bpSystolic ? String(v.bpSystolic) : null,
			bpDiastolic: v.bpDiastolic ? String(v.bpDiastolic) : null,
			map: v.map ? String(v.map) : null,
			o2sat: v.o2sat ? String(v.o2sat) : null,
			cvd: v.cvd ? String(v.cvd) : null,
			weight: v.weight ? String(v.weight) : null,
			height: v.height ? String(v.height) : null,
			urgent: v.urgent ? v.urgent : null,
			oralFluidsIntakes: v.oralFluidsIntakes
				? String(v.oralFluidsIntakes)
				: null,
			parenteralIntake: v.parenteralIntake ? String(v.parenteralIntake) : null,
			urineOutput: v.urineOutput ? String(v.urineOutput) : null,
			emesisOutput: v.emesisOutput ? String(v.emesisOutput) : null,
			drainageOutput: v.drainageOutput ? String(v.drainageOutput) : null,
			aspirationOutput: v.aspirationOutput ? String(v.aspirationOutput) : null,
		};
		updVitalSignAdmit(req);
	};

	const defaultVs = (patientId, admitId) => {
		defaultVsFromInterface({
			patientId,
			admitId,
			form: form,
		});
	};

	var vitalSignHub = useSignalrHub(`/vital-sign`);

	const joinVitalSign = async (hn) => {
		if (!hn) return;

		if (vitalSignHub.connection?.connectionState === 'Disconnected') {
			await vitalSignHub.start();

			vitalSignHub.on('ReceiveVitalData', (hn, message) => {
				const newVitalSignData = Object.keys(message).reduce((prev, curr) => {
					const result =
						message[curr] && message[curr] !== ''
							? message[curr]
							: form.getFieldValue(curr);
					prev[curr] = result;
					return prev;
				}, {});

				form.setFieldsValue({
					...newVitalSignData,
					date: dayjs(),
					time: dayjs(),
				});
				notiSuccess({ message: 'ลงข้อมูล Vital Signs' });
			});

			await vitalSignHub.joinGroup("JoinGroupHn", {
				UserId: user,
				HnGroup: hn
			});
		}
	};

	useEffect(() => {
		downloadDD();
	}, []);

	useEffect(() => {
		setChartName(nanoid());
		getAdmitByAdmitID(patientId, admitId);

		if (patientId) {
			getVitalSignsDisplay(patientId);
			defaultVs(patientId, admitId);
		} else {
			setListVitalSigns([]);
		}
	}, [patientId]);

	useEffect(() => {
		if (vitalSignHub && hn) joinVitalSign(hn);
	}, [vitalSignHub, hn])

	useEffect(() => {
		let group = groupBy(listVitalSigns, 'dateCreatedDate');
		let size = Object.keys(group).length;
		for (let i = 0; i < size; i++) {
			group[Object.keys(group)[i]] = {
				'02': '02',
				'06': '06',
				"10": '10',
				"14": '14',
				"18": '18',
				"22": '22',
			};
		}
		const calcTime = (time) => {
			let HH = toNumber(time.slice(0, 2));
			let result = null;
			if (HH >= 2 && HH < 6) {
				result = '02';
			}
			if (HH >= 6 && HH < 10) {
				result = '06';
			}
			if (HH >= 10 && HH < 14) {
				result = '10';
			}
			if (HH >= 14 && HH < 18) {
				result = '14';
			}
			if (HH >= 18 && HH < 22) {
				result = '18';
			}
			if ((HH >= 22 && HH < 24) || (HH >= 0 && HH < 2)) {
				result = '22';
			}
			return result;
		};

		let mappingA = listVitalSigns.map((o) => {
			o.dateCreatedTime = calcTime(o.dateCreatedTime);
			o.dateCreatedDsp = dayjs(o.dateCreatedDate, "MM/DD/YYYY HH:mm:ss").format("DD/MM/BBBB HH:mm");
			return o;
		});
		let groupA = groupBy(mappingA, 'dateCreatedDate');
		let listGroup = [];
		for (let i = 0; i < size; i++) {
			listGroup = listGroup.concat([groupA[Object.keys(groupA)[i]]]);
		}
		// eslint-disable-next-line array-callback-return
		let mappingListGroup = listGroup.map((o) => {
			if (o.length === 1) {
				return o;
			}
			if (o.length > 1) {
				let uniqData = uniqBy(o, 'dateCreatedTime');
				return uniqData;
			}
		});
		setListForVistalSignTable(mappingListGroup);
		let reverse = [];
		for (let i = 0; i < mappingListGroup.length; i++) {
			reverse = reverse.concat(mappingListGroup[i]);
		}
		let mapping = reverse.map((o) => {
			return {
				category: nanoid(),
				provider: o.dateCreatedDate,
				// provider: dayjs(o.dateCreatedDate, "MM/DD/YYYY HH:mm:ss").format("DD/MM/BBBB HH:mm"),
				realName: o.dateCreatedTime,
				bodyTemp: o.bodyTemperature ? toNumber(o.bodyTemperature) : null,
				bpClose: o.bpSystolic ? toNumber(o.bpSystolic) : null,
				bpOpen: o.bpDiastolic ? toNumber(o.bpDiastolic) : null,
				pulse: o.pulse ? toNumber(o.pulse) : null,
			};
		});
		if (mapping.length > 0) {
			chart(group, mapping, size);
		}
	}, [listVitalSigns]);

	const PartsFluid = () => {
		return (
			<>
				<ConfigProvider locale={thTH}>
					<Form form={form} onFinish={onFinish} layout="vertical">
						<GenRow gutter={[4, 4]}>
							<Col span={24} className="pt-2">
								<LabelTopic text="Fluid" />
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="oralFluidsIntakes"
									label="Oral Fluids Intakes"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="parenteralIntake"
									label="Parenteral Intake"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="urineOutput"
									label="Urine Output"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="emesisOutput"
									label="Emesis Output"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="drainageOutput"
									label="Drainage Output"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													pulse,
													vitalSignConfigs?.pulse
												),
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="aspirationOutput"
									label="Aspiration Output"
									input={
										<GenInputNumber
											size={size}
											style={{
												width: '100%',
												margin: 0,
											}}
										/>
									}
								/>
							</Col>

							<Col span={24} className="text-center">
								<Button
									style={{ marginBottom: 0 }}
									type="primary"
									onClick={(e) => {
										e.stopPropagation();
										form.submit();
									}}
								>
									บันทึก
								</Button>
							</Col>
						</GenRow>
					</Form>
				</ConfigProvider>
			</>
		);
	};

	const PartsForm = () => {
		return (
			<>
				<ConfigProvider locale={thTH}>
					<Form form={form} onFinish={onFinish} layout="vertical">
						<GenRow gutter={[4, 4]}>
							<Col span={12}>
								<GenFormItem2
									name="date"
									label="วันที่บันทึก"
									required={true}
									input={<GenDatePicker size={size} form={form} name="date" />}
								/>
							</Col>
							<Col span={12}>
								<GenFormItem2
									name="time"
									label="เวลาบันทึก"
									required={true}
									input={<GenTimePicker size={size} />}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="bodyTemperature"
									label="อุณหภูมิ"
									input={
										<GenInputNumber
											size={size}
											placeholder="°C"
											status={chkVitalSignConfigs(
												'status',
												bodyTemperature,
												vitalSignConfigs?.bodyTemperature
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													bodyTemperature,
													vitalSignConfigs?.bodyTemperature
												),
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="pulse"
									label="ชีพจร"
									input={
										<GenInputNumber
											size={size}
											placeholder="/min"
											status={chkVitalSignConfigs(
												'status',
												pulse,
												vitalSignConfigs?.pulse
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													pulse,
													vitalSignConfigs?.pulse
												),
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="respiratory"
									label="การหายใจ"
									input={
										<GenInputNumber
											size={size}
											placeholder="/min"
											status={chkVitalSignConfigs(
												'status',
												respiratory,
												vitalSignConfigs?.respiratory
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													respiratory,
													vitalSignConfigs?.respiratory
												),
											}}
										/>
									}
								/>
							</Col>
							<Col span={24}>
								<LabelTopic text="Blood Pressure (mmHg)" />
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="bpSystolic"
									label="Systolic"
									input={
										<GenInputNumber
											size={size}
											status={chkVitalSignConfigs(
												'status',
												bpSystolic,
												vitalSignConfigs?.bpSystolic
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													bpSystolic,
													vitalSignConfigs?.bpSystolic
												),
											}}
											onChange={(v) => {
												let value = Number(v);
												let DP = form.getFieldValue('bpDiastolic');
												DP = DP ? Number(DP) : 1;
												let map = Number(DP + (1 / 3) * (value - DP)).toFixed(
													2
												);
												// console.log('map :>> ', map);
												form.setFieldsValue({
													map: String(map) === 'NaN' ? null : String(map),
												});
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="bpDiastolic"
									label="Daistolidc"
									input={
										<GenInputNumber
											size={size}
											status={chkVitalSignConfigs(
												'status',
												bpDiastolic,
												vitalSignConfigs?.bpDiastolic
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													bpDiastolic,
													vitalSignConfigs?.bpDiastolic
												),
											}}
											onChange={(v) => {
												let value = Number(v);
												let SP = form.getFieldValue('bpSystolic');
												SP = SP ? Number(SP) : 1;
												let map = Number(
													value + (1 / 3) * (SP - value)
												).toFixed(2);
												// console.log('map :>> ', map);
												form.setFieldsValue({
													map: String(map) === 'NaN' ? null : String(map),
												});
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="map"
									label="MAP"
									input={<GenInputNumber size={size} disabled={true} />}
								/>
							</Col>
							<Col span={12}>
								<GenFormItem2
									name="o2sat"
									label="O2Sat"
									input={<GenInputNumber size={size} />}
								/>
							</Col>
							<Col span={12}>
								<GenFormItem2
									name="cvd"
									label="C.V.D"
									input={<GenInputNumber size={size} />}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="weight"
									label="น้ำหนัก"
									input={
										<GenInputNumber
											size={size}
											placeholder="kg"
											status={chkVitalSignConfigs(
												'status',
												weight,
												vitalSignConfigs?.weight
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													weight,
													vitalSignConfigs?.weight
												),
											}}
										/>
									}
								/>
							</Col>
							<Col span={8}>
								<GenFormItem2
									name="height"
									label="ส่วนสูง"
									input={
										<GenInputNumber
											size={size}
											placeholder="cm"
											status={chkVitalSignConfigs(
												'status',
												height,
												vitalSignConfigs?.height
											)}
											style={{
												width: '100%',
												margin: 0,
												color: chkVitalSignConfigs(
													'color',
													height,
													vitalSignConfigs?.height
												),
											}}
										/>
									}
								/>
							</Col>
							<Col style={{ alignSelf: "center" }}>
								<Button size='small' type="primary" onClick={() => setVsbSosScore(true)}>SOS Score</Button>
							</Col>
							<Col span={24}>
								<GenFormItem2
									name="urgent"
									label="ระดับอาการ"
									input={<GenSelect size={size} options={masterDataModalWait.urgenttype} />}
								/>
							</Col>
						</GenRow>
					</Form>
				</ConfigProvider>
			</>
		);
	};

	const chart = (group, listData, groupSize) => {
		let root = am5.Root.new(`${chartName}`);
		root.setThemes([am5themes_Animated.new(root)]);
		let chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: false,
				panY: false,
				wheelX: 'none',
				wheelY: 'none',
			})
		);

		let cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
		cursor.lineY.set('visible', false);
		let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
		xRenderer.labels.template.setAll({ text: '{realName}' });
		let yRendererBp = am5xy.AxisRendererY.new(root, {});
		let yRendererPulse = am5xy.AxisRendererY.new(root, {});
		let yRendererBodyTemp = am5xy.AxisRendererY.new(root, {});

		let xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(root, {
				maxDeviation: 0,
				categoryField: 'category',
				renderer: xRenderer,
				tooltip: am5.Tooltip.new(root, {
					labelText: '{realName}',
				}),
			})
		);
		let yAxisBp = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				maxDeviation: 0.3,
				renderer: yRendererBp,
			})
		);
		let yAxisPulse = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				maxDeviation: 0.3,
				renderer: yRendererPulse,
			})
		);
		let yAxisBodyTemp = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				maxDeviation: 0.3,
				renderer: yRendererBodyTemp,
			})
		);

		let series = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: 'mmHg',
				xAxis: xAxis,
				yAxis: yAxisBp,
				valueYField: 'bpClose',
				openValueYField: 'bpOpen',
				categoryXField: 'category',
				stroke: '#00C853',
				fill: '#00C853',
				tooltip: am5.Tooltip.new(root, {
					labelText: '{openValueY} - {valueY}',
				}),
			})
		);
		series.columns.template.setAll({
			width: 0.5,
		});

		series.bullets.push(function () {
			return am5.Bullet.new(root, {
				locationY: 0,
				sprite: am5.Circle.new(root, {
					radius: 5,
					fill: '#00C853',
				}),
			});
		});

		series.bullets.push(function () {
			return am5.Bullet.new(root, {
				locationY: 1,
				sprite: am5.Circle.new(root, {
					radius: 5,
					fill: '#00C853',
				}),
			});
		});

		let lineSeries = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: 'Pulse',
				xAxis: xAxis,
				yAxis: yAxisPulse,
				valueYField: 'pulse',
				sequencedInterpolation: true,
				stroke: '#E53935',
				fill: '#D50000',
				categoryXField: 'category',
				tooltip: am5.Tooltip.new(root, {
					labelText: '{valueY}',
				}),
			})
		);

		lineSeries.strokes.template.set('strokeWidth', 1);

		lineSeries.bullets.push(function () {
			return am5.Bullet.new(root, {
				sprite: am5.Circle.new(root, {
					stroke: lineSeries.get('fill'),
					strokeWidth: 2,
					fill: '#FFCDD2',
					radius: 5,
				}),
			});
		});

		lineSeries.events.on('datavalidated', function () {
			am5.array.each(lineSeries.dataItems, function (dataItem) {
				if (
					dataItem.dataContext.count / 2 ===
					Math.round(dataItem.dataContext.count / 2)
				) {
					dataItem.set('locationX', 0);
				}
				else {
					dataItem.set('locationX', 0.5);
				}
			});
		});
		let lineSeries1 = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: '°C',
				xAxis: xAxis,
				yAxis: yAxisBodyTemp,
				valueYField: 'bodyTemp',
				sequencedInterpolation: true,
				stroke: '#64B5F6',
				fill: '#2962FF',
				categoryXField: 'category',
				tooltip: am5.Tooltip.new(root, {
					labelText: '{valueY} °C',
				}),
			})
		);
		lineSeries1.strokes.template.set('strokeWidth', 1);
		lineSeries1.bullets.push(function () {
			return am5.Bullet.new(root, {
				sprite: am5.Circle.new(root, {
					stroke: lineSeries1.get('fill'),
					strokeWidth: 2,
					fill: '#BBDEFB',
					radius: 5,
				}),
			});
		});
		lineSeries1.events.on('datavalidated', function () {
			am5.array.each(lineSeries1.dataItems, function (dataItem) {
				if (
					dataItem.dataContext.count / 2 ===
					Math.round(dataItem.dataContext.count / 2)
				) {
					dataItem.set('locationX', 0);
				}
				else {
					dataItem.set('locationX', 0.5);
				}
			});
		});

		yRendererBp.grid.template.set('strokeOpacity', 0.05);
		yRendererBp.labels.template.set('fill', series.get('fill'));
		yRendererBp.setAll({
			stroke: series.get('fill'),
			strokeOpacity: 1,
			opacity: 1,
		});

		yRendererPulse.grid.template.set('strokeOpacity', 0.05);
		yRendererPulse.labels.template.set('fill', lineSeries.get('fill'));
		yRendererPulse.setAll({
			stroke: lineSeries.get('fill'),
			strokeOpacity: 1,
			opacity: 1,
		});

		yRendererBodyTemp.grid.template.set('strokeOpacity', 0.05);
		yRendererBodyTemp.labels.template.set('fill', lineSeries1.get('fill'));
		yRendererBodyTemp.setAll({
			stroke: lineSeries1.get('fill'),
			strokeOpacity: 1,
			opacity: 1,
		});

		let legend = chart.children.push(
			am5.Legend.new(root, {
				position: '',
				x: am5.p50,
				centerX: am5.p50,
			})
		);
		legend.data.setAll([series, lineSeries, lineSeries1]);
		chart.set(
			'scrollbarX',
			am5.Scrollbar.new(root, {
				orientation: 'horizontal',
				end: groupSize <= 3 ? 1 : groupSize > 3 && groupSize < 8 ? 0.45 : 0.2,
			})
		);

		let chartData = [];
		for (var providerName in group) {
			let providerData = group[providerName];
			let filtered = filter(listData, (o) => o.provider === providerName);
			let tempArray = [];
			for (var itemName in providerData) {
				let findedData = find(filtered, (o) => o.realName === itemName);
				if (findedData) {
					tempArray.push(findedData);
				} else {
					tempArray.push({
						category: nanoid(),
						realName: itemName,
						pulse: null,
						bodyTemp: null,
						bpOpen: null,
						bpClose: null,
						provider: dayjs(providerName, "MM/DD/YYYY HH:mm:ss").format("DD/MM/BBBB HH:mm"),
					});
				}
			}
			tempArray = sortBy(tempArray, 'realName');
			am5.array.each(tempArray, function (item) {
				chartData.push(item);
			});

			let range = xAxis.makeDataItem({});
			xAxis.createAxisRange(range);

			range.set('category', tempArray[0].category);
			range.set('endCategory', tempArray[tempArray.length - 1].category);

			let label = range.get('label');

			label.setAll({
				text: tempArray[0].provider,
				dy: 30,
				fontWeight: 'bold',
				tooltipText: tempArray[0].provider,
				rotation: groupSize <= 6 ? 0 : 25,
			});
			let tick = range.get('tick');
			tick.setAll({ visible: true, strokeOpacity: 1, length: 50, location: 0 });

			let grid = range.get('grid');
			grid.setAll({ strokeOpacity: 1 });
		}

		let range = xAxis.makeDataItem({});
		xAxis.createAxisRange(range);
		range.set('category', chartData[chartData.length - 1].category);
		let tick = range.get('tick');
		tick.setAll({ visible: true, strokeOpacity: 1, length: 50, location: 1 });

		let grid = range.get('grid');
		grid.setAll({ strokeOpacity: 1, location: 1 });

		xAxis.data.setAll(chartData);
		series.data.setAll(chartData);
		lineSeries.data.setAll(chartData);
		lineSeries1.data.setAll(chartData);
		series.appear(500);
		lineSeries.appear(500);
		lineSeries1.appear(500);
		chart.appear(500, 100);
	};

	const PartsChart = () => {
		return (
			<Card
				className="mb-2"
				size={size}
				title={<LabelTopicPrimary text="ประวัติการบันทึก Vital Signs" />}
			>
				<div
					id={chartName}
					key={chartName}
					style={{ width: '100%', height: '300px', overflow: 'hidden' }}
				></div>
			</Card>
		);
	};

	const showVistalSigns = (list) => {
		let listData = [
			{
				dateCreatedTime: '02',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
			{
				dateCreatedTime: '06',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
			{
				dateCreatedTime: '10',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
			{
				dateCreatedTime: '14',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
			{
				dateCreatedTime: '18',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
			{
				dateCreatedTime: '22',
				respiratory: null,
				o2sat: null,
				bpSystolic: null,
				bpDiastolic: null,
				map: null,
				cvd: null,
				urgent: null,
				oralFluidsIntakes: null,
				parenteralIntake: null,
				urineOutput: null,
				emesisOutput: null,
				drainageOutput: null,
				aspirationOutput: null,
			},
		];

		let intersections = intersectionBy(list, listData, 'dateCreatedTime');
		let difference = differenceBy(listData, list, 'dateCreatedTime');
		let concat = intersections.concat(difference);
		let sorted = sortBy(concat, 'dateCreatedTime');
		return (
			<>
				<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
					<Col span={24} className="text-center">
						<label className="topic-green">{list?.[0]?.dateCreatedDsp}</label>
					</Col>
					<Divider />
					{listData.map((item) => (
						<Col
							span={4}
							className="text-center"
							style={{ borderRight: '1px solid #000' }}
						>
							<label className="topic-green">{item.dateCreatedTime}</label>
						</Col>
					))}
				</Row>
				{[
					'respiratory',
					'o2sat',
					'bpSystolic',
					'bpDiastolic',
					'map',
					'cvd',
					'urgent',
					'oralFluidsIntakes',
					'parenteralIntake',
					'urineOutput',
					'emesisOutput',
					'drainageOutput',
					'aspirationOutput',
				].map((category) => (
					<Row
						gutter={[2, 2]}
						className="mb-2 border-bottom"
						style={{ paddingTop: 2, paddingBottom: 8 }}
					>
						{sorted.map((item) => (
							<Col
								span={4}
								className="text-center"
								style={{ borderRight: '1px solid #000' }}
							>
								<label className="data-value">
									{item[category]
										? isNaN(toNumber(item[category]))
											? item[category]
											: toNumber(item[category])
										: '-'}
								</label>
							</Col>
						))}
					</Row>
				))}
			</>
		);
	};
	const PartsTable = () => {
		return (
			<Card
				className="mb-2"
				size={size}
				style={{ backgroundColor: '#fff' }}
				headStyle={{ backgroundColor: '#FAFAFA' }}
				title={<LabelTopicPrimary18 text="ประวัติการบันทึก Vital Signs" />}
			>
				<div style={{ margin: -8 }}>
					<Row gutter={[4, 4]}>
						<Col span={6}>
							<Card
								className="mb-1"
								bordered={false}
								bodyStyle={{
									backgroundColor: '#FAFAFA',
									borderTopLeftRadius: 6,
									borderBottomLeftRadius: 6,
									border: '1px solid #E0E0E0',
									borderRight: 'none',
								}}
							>
								<div
									style={{
										marginLeft: -12,
										marginRight: -12,
										// paddingTop: 8
									}}
								>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green">วันที่</label>
										</Col>
										<Divider />
										<Col span={24} className="text-end">
											<label className="topic-green">ช่วงเวลา</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1 text-warning">
												Resp. rate
											</label>
											<Checkbox />
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">O2Sat</label>
											<Checkbox />
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 border-bottom">
										<Col span={12}>
											<Row gutter={[2, 2]} align="middle">
												<Col span={24} className="pb-2">
													<label></label>
												</Col>
												<Col span={24} className="text-end text-nowrap pb-2">
													<label className="topic-green me-1">BP</label>
													<Checkbox />
												</Col>
												<Col span={24}>
													<label></label>
												</Col>
											</Row>
										</Col>
										<Col span={12}>
											<Row gutter={[2, 2]}>
												<Col span={24} className="text-end pb-3">
													<label className="topic-green">SBP</label>
												</Col>
												<Col span={24} className="text-end pb-3">
													<label className="topic-green">DBP</label>
												</Col>
												<Col span={24} className="text-end pb-3">
													<label className="topic-green">MAP</label>
												</Col>
											</Row>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end text-nowrap">
											<label
												className="topic-green me-1"
												style={{ color: '#AA00FF' }}
											>
												C.V.P (mmHg)
											</label>
											<Checkbox />
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">ระดับอาการ</label>
											<Checkbox />
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">
												Oral Fluids Intakes
											</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">
												Parenteral Intake
											</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">Urine Output</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">Emesis Output</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2 pb-2 border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">
												Drainage Output
											</label>
										</Col>
									</Row>
									<Row gutter={[2, 2]} className="mb-2  border-bottom">
										<Col span={24} className="text-end">
											<label className="topic-green me-1">
												Aspiration Output
											</label>
										</Col>
									</Row>
								</div>
							</Card>
						</Col>
						<Col span={18}>
							<Card
								className="mb-1"
								bordered={false}
								bodyStyle={{
									backgroundColor: '#FAFAFA',
									borderTopRightRadius: 6,
									borderBottomRightRadius: 6,
									border: '1px solid #E0E0E0',
									borderLeft: 'none',
								}}
							>
								<div style={{ margin: -12 }}>
									<Scrollbars autoHeight autoHeightMin={600}>
										<Row
											gutter={[4, 4]}
											style={{
												flexDirection: 'row',
												width: listForVistalSignTable.length * 240,
											}}
										>
											{listForVistalSignTable.map((o, i) => (
												<div
													key={i}
													style={{
														width: '240px',
														backgroundColor: i % 2 === 0 ? '#E1F5FE' : '#fff',
														paddingTop: 8,
													}}
												>
													{showVistalSigns(o)}
												</div>
											))}
										</Row>
									</Scrollbars>
								</div>
							</Card>
						</Col>
					</Row>
				</div>
			</Card>
		);
	};
	return (
		<Modal
			title={
				<GenRow>
					<Col>
						<LabelTopicPrimary18 text="Vital signs ผู้ป่วยใน" />
					</Col>
					<Col>
						<LabelTopic text="วัดข้อมูลล่าสุด :" />
					</Col>
					<Col>
						<LabelText
							text={
								listVitalSigns?.length
									? dayjs(
										listVitalSigns[0].dateCreated,
										'MM/DD/YYYY HH:mm:ss'
									).format('DD/MM/BBBB HH:mm')
									: '-'
							}
						/>
					</Col>
				</GenRow>
			}
			centered
			visible={visible}
			width={1200}
			// okText="บันทึก"
			cancelText="ปิด"
			// onOk={() => { form.submit() }}
			onCancel={() => setVisible(false)}
			okButtonProps={{
				hidden: true,
			}}
		>
			<Spin spinning={loading}>
				<div style={{ margin: -20 }}>
					<GenRow gutter={[4, 4]}>
						<Col span={7} style={{ backgroundColor: '#FAFAFA' }}>
							{PartsForm()}
							{PartsFluid()}
						</Col>

						<Col span={17}>
							{PartsChart()}
							<div style={{ zoom: '80%' }}>{PartsTable()}</div>
						</Col>
					</GenRow>
				</div>
			</Spin>
			{vsbSosScore && <SosScore
				visible={vsbSosScore}
				setVisible={(bool) => setVsbSosScore(bool)}
				clinicDetails={form.getFieldValue()}
				sosScoreDetails={(v) => {
					console.log('sosScoreDetails', v)
				}}
				opdipd="I"
			/>}
		</Modal>
	);
}
const apis = {
	//เปลี่ยนไปใช้เส้น Masters/GetUrgentTypes
	// GetUrgentTypes: {
	// 	url: 'NuclearMedication/GetUrgentTypes',
	// 	method: 'GET',
	// 	return: 'responseData',
	// 	sendRequest: false,
	// },
	UpdVitalsignadmit: {
		url: 'Admits/UpdVitalsignadmit',
		method: 'POST',
		return: 'data',
		sendRequest: true,
	},
	GetAgeByPatientId: {
		url: 'CancerRegistration/GetAgeByPatientId/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetConfigdata: {
		url: 'Masters/GetConfigdataWithMinMax',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetVitalSignsDisplay: {
		url: 'IpdWard/GetVitalSignsDisplay/',
		method: 'GET',
		return: 'responseData',
		sendRequest: false,
	},
	GetAdmitByAdmitID: {
		url: 'Admits/GetAdmitByAdmitID',
		method: 'POST',
		return: 'responseData',
		sendRequest: true,
	},
	GetIpdWardInsVitalSigns: {
		url: 'IpdWard/InsVitalSigns',
		method: 'POST',
		return: 'responseData',
		sendRequest: true,
	},
	InsVitalSigns: {
		url: "OpdExamination/InsVitalSigns",
		method: "POST",
		return: "data",
		sendRequest: true,
	},
};
