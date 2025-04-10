import { env } from '../../env.js';

import { PrinterOutlined } from '@ant-design/icons';
import {
	Button,
	Checkbox,
	Col,
	Dropdown,
	Form,
	InputNumber,
	Menu,
	Modal,
	notification,
	Row,
} from 'antd';
import axios from 'axios';
import { map, filter } from 'lodash';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { QzPrint } from './QzPrint';
import SandClock from './SandClock';

const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const userId = userFromSession?.responseData.userId;
const qzIsActive = localStorage.getItem('isQzTray');

export const PrintFormReport = forwardRef(
	(
		{
			param,
			listParam = null,
			button = true,
			disabled = false,
			size = null,
			number = null,
			style,
			className,
			fontSize,
			onFinish,
			shape = 'circle',
			type = 'primary',
			preview,
			setMessageStatus = () => { },
			setDataPrint = null,
			dataPrint,
			workId = null,
			showInputNumber = false,
			qtyPrintFlag = null,
			qtyPrint = null,
			validate = () => true,
			afterOnClickPrint = () => { },
			autoPrintGenDrugProfiles = null,
			id = '',
			moduleId = null,
			dropdownPlacement = "bottomLeft",
		},
		ref
	) => {
		// console.log('param :>> ', param);
		var selectReport = [];
		useImperativeHandle(ref, () => ({
			print: () => {
				buttonPrintRef.current.click();
			},
		}));

		const { selectPatient } = useSelector((state) => state.patient);
		const { opdPatientDetail } = useSelector((state) => state.opdPatientDetail);
		const { message } = useSelector((state) => state.autoComplete);
		const { module } = useSelector((state) => state.moduleId);
		const [checkPrint, setCheckPrint] = useState([]);
		const [paramData, setParamData] = useState({});
		const [patientId, setPatientId] = useState(null);
		const [selectPrintReport, setSelectPrintReport] = useState([]);
		const [listPrintCount, setListPrintCount] = useState([]);
		const [visible, setVisible] = useState(false);
		const [qtyPrintVisible, setQtyPrintVisible] = useState(false);
		const [qtyForm] = Form.useForm();
		const [loading, setLoading] = useState(false);
		const buttonPrintRef = useRef();

		useEffect(() => {
			if (param?.patientId) {
				setPatientId(param?.patientId);
			} else {
				if (selectPatient) {
					/* console.log("T"); */
					setPatientId(selectPatient.patientId);
				} else if (opdPatientDetail) {
					setPatientId(opdPatientDetail.patientId);
				} else if (message) {
					setPatientId(message);
				}
			}
		}, [message, opdPatientDetail, param, selectPatient]);
		// console.log("param",param);
		useEffect(() => {
			if (checkPrint.length) {
				const filterDefaultCheckPrints = checkPrint.filter(
					(o) => o.defaultCheckPrints === 'Y'
				);
				let checked = [];
				filterDefaultCheckPrints.map((o) => {
					checked = [...checked, String(o.reportId)];
				});
				setSelectPrintReport((p) => [...p, ...checked]);
			}
		}, [checkPrint]);

		const changeListPrintCount = (reportId, value) => {
			// setListPrintCount(prev=>[...prev, {reportId: reportId, value:value}]);
			if (value) {
				let selectReport = listPrintCount.findIndex(
					(val) => val.reportId === reportId
				);
				// console.log(selectReport,"selectReport");
				if (selectReport >= 0) {
					let newlistPrintCount = listPrintCount;
					newlistPrintCount[selectReport].value = value;
					setListPrintCount(newlistPrintCount);
				} else {
					setListPrintCount((prev) => [
						...prev,
						{ reportId: reportId, value: value },
					]);
				}
			} else {
				let newlistPrintCount = listPrintCount;
				newlistPrintCount = newlistPrintCount.filter(
					(val) => val.reportId !== reportId
				);
				setListPrintCount(newlistPrintCount);
			}
		};

		const printPDF = async ({
			filterPrintReport = null,
			printCount = null,
		}) => {
			// let qzIsActive = false;
			// const isPortOpen = await checkWebSocketPort('wss://localhost:8181');
			// if (isPortOpen) qzIsActive = true;

			if (!filterPrintReport) {
				filterPrintReport = checkPrint.filter((val) =>
					selectPrintReport.includes(val.reportId.toString())
				);
			}
			for await (let c of filterPrintReport) {
				// console.log(c,"PrintFormReport1");
				if (setDataPrint) {
					setDataPrint(c);
				}
				if (listParam) {
					for await (let pm of listParam) {
						Object.assign(paramData, pm, {
							patientid: patientId,
						});
						setParamData(
							Object.assign(paramData, pm, {
								patientid: patientId,
								userlogin: userId,
							})
						);
						var key,
							keys = Object.keys(paramData);
						var n = keys.length;
						// var newobj = {};
						while (n--) {
							key = keys[n];
							paramData[key.toLowerCase()] = paramData[key];
						}
						let paramRef = [];
						// console.log(Object.keys(paramData));
						// eslint-disable-next-line array-callback-return
						c.pagePrintParam.map((p) => {
							if (p.paramDesc.length > 0) {
								paramRef.push(p.paramDesc.toLowerCase());
							}
						});
						// console.log(paramRef);
						var checkParam = paramRef.filter(
							(e) => Object.keys(paramData).indexOf(e.toLowerCase()) === -1
						);
						// console.log(paramData, "paramData");
						// console.log(checkParam);
						if (checkParam.length === 0) {
							let condition = {};
							for (let val in paramData) {
								// console.log(val.toLowerCase());
								condition[`@${val.toLowerCase()}`] = paramData[val]?.toString();
							}
							if (printCount) {
								if (c.multiPrintFlag === 'Y') {
									condition['@printcount'] = `${printCount}`;
								}
							}
							// console.log(listPrintCount,"listPrintCount");
							if (listPrintCount.length > 0) {
								condition['@printcount'] = `${listPrintCount.find((val) => val.reportId === c?.reportId)
									?.value
									}`;
							}
							// console.log(condition);
							// console.log(c);
							await getPdfFile(
								c.reportId,
								c.reportName,
								c.reportFile.split('.')[0],
								c.sqlFile.split('.')[0],
								condition,
								setLoading,
								onFinish,
								preview,
								null,
								setMessageStatus,
								false
							);
						} else {
							// eslint-disable-next-line array-callback-return
							checkParam.map((c) => {
								notification['warning']({
									message: `กรุณาส่ง ${c}`,
								});
							});
						}
					}
				} else {
					Object.assign(paramData, param, {
						patientid: patientId,
						userlogin: userId,
					});
					setParamData(
						Object.assign(paramData, param, {
							patientid: patientId,
							userlogin: userId,
						})
					);
					let paramRef = [];
					// console.log(Object.keys(paramData));
					// eslint-disable-next-line array-callback-return
					c.pagePrintParam.map((p) => {
						if (p?.paramDesc?.length > 0) {
							paramRef.push(p.paramDesc.toLowerCase());
						}
					});
					// console.log(paramData, "paramData");
					let checkParam = paramRef.filter(
						(e) => Object.keys(paramData).indexOf(e) === -1
					);

					// console.log(checkParam);
					// console.log(c);

					if (checkParam.length === 0) {
						let condition = {};
						for (let val in paramData) {
							condition[`@${val}`] = paramData[val]?.toString();
						}
						if (printCount) {
							if (c.multiPrintFlag === 'Y') {
								condition['@printcount'] = `${printCount}`;
							}
						}
						// console.log(listPrintCount, "listPrintCount");
						if (listPrintCount.length > 0) {
							condition['@printcount'] = `${listPrintCount.find((val) => val.reportId === c?.reportId)
								?.value
								}`;
						}
						// console.log(condition);
						// console.log(c);

						if (c.sqlFile.split(',').length > 1) {
							await getPdfFile(
								c.reportId,
								c.reportName,
								c.reportFile,
								c.sqlFile,
								condition,
								setLoading,
								onFinish,
								preview,
								null,
								setMessageStatus,
								true
							);
						} else {
							await getPdfFile(
								c.reportId,
								c.reportName,
								c.reportFile.split('.')[0],
								c.sqlFile.split('.')[0],
								condition,
								setLoading,
								onFinish,
								preview,
								null,
								setMessageStatus,
								false
							);
						}
					} else {
						// eslint-disable-next-line array-callback-return
						checkParam.map((c) => {
							notification['warning']({
								message: `กรุณาส่ง ${c}`,
							});
						});
					}
				}
			}
			setSelectPrintReport([]);
		};
		const onClickMenuPrint = async (e) => {
			e.stopPropagation();
			// console.log(checkPrint,"PrintFormReport0");
			// console.log(selectPrintReport,"PrintFormReport1");
			let filterPrintReport = checkPrint.filter((val) =>
				selectPrintReport.includes(val.reportId.toString())
			);
			// console.log(prt,"PrintFormReport0");
			if (filterPrintReport?.some((val) => val.multiPrintFlag === 'Y')) {
				setQtyPrintVisible(true);
				setVisible(false);
			} else {
				if (!validate(filterPrintReport)) {
					setListPrintCount([]);
					setVisible(false);
					return;
				}
				setVisible(false);
				await printPDF({
					filterPrintReport: filterPrintReport,
				});
			}
			afterOnClickPrint({
				selectPrintReport: selectPrintReport
			});
			setListPrintCount([]);
			// setVisible(false);
		};
		const funcAutoPrintGenDrugProfiles = (report) => {
			const filterAutoPrintGenDrugProfiles = report.filter(
				(o) => o.autoPrintGenFlag === 'Y'
			);
			if (filterAutoPrintGenDrugProfiles.length) {
				let reportIds = [];
				map(filterAutoPrintGenDrugProfiles, (o) => {
					reportIds = [...reportIds, String(o.reportId)];
				});
				setSelectPrintReport(reportIds);
				setTimeout(() => {
					document.getElementById('print-report').click();
				}, 300);
			}
		};
		// console.log('listPrintCount', listPrintCount)
		const renderMenu = (dts = []) => {
			// console.log(dts);
			return (
				<Menu
					onMouseLeave={() => {
						setVisible(false);
					}}
					selectable={true}
					multiple={true}
					selectedKeys={selectPrintReport}
					onSelect={(e) => {
						selectReport = e.selectedKeys;
						setSelectPrintReport(e.selectedKeys);
						const findReport = dts.find((o) => String(o.reportId) === e.key);
						if (qtyPrintFlag === 'Y') {
							if (findReport.reportDesc === 'Druglabels')
								setListPrintCount((prev) => [
									...prev,
									{ reportId: findReport.reportId, value: qtyPrint },
								]);
						}
					}}
					onDeselect={(e) => {
						// console.log(e);
						selectReport = e.selectedKeys;
						setSelectPrintReport(e.selectedKeys);
					}}
				>
					{!dts.length && (
						<Menu.Item>
							<label className="color-danger">ไม่พบรายงาน กรุณาแจ้ง IT Support เพื่อเพิ่มรายงาน</label>{' '}
						</Menu.Item>
					)}
					{dts.map((c) => {
						// console.log(c);
						return (
							<Menu.Item key={c.reportId}>
								<Checkbox
									checked={
										selectPrintReport.findIndex(
											(report) => parseInt(report) === parseInt(c.reportId)
										) > -1
											? true
											: false
									}
									value={c.reportId}
									style={{
										marginRight: '5px',
									}}
								/>
								{showInputNumber ? (
									<InputNumber
										controls={false}
										onChange={(value) =>
											changeListPrintCount(c.reportId, value)
										}
										value={
											listPrintCount.find((val) => val.reportId === c.reportId)
												?.value
										}
									/>
								) : null}
								<label className="gx-text-primary pointer">
									{c.reportName}
								</label>
							</Menu.Item>
						);
					})}
					<Button
						ref={buttonPrintRef}
						style={{
							width: '100%',
							textAlign: 'center',
						}}
						type="primary"
						// disabled={selectPrintReport <= 0}
						id="print-report"
						onClick={onClickMenuPrint}
					>
						พิมพ์
					</Button>
				</Menu>
			);
		};
		const menu = (
			<div>
				{checkPrint.length > 14 ? (
					<Scrollbars autoHeight autoHeightMin={400}>
						{renderMenu(checkPrint)}
					</Scrollbars>
				) : (
					renderMenu(checkPrint)
				)}
			</div>
		);
		return (
			<>
				<Dropdown
					trigger={['click']}
					visible={visible}
					overlay={menu}
					placement={dropdownPlacement}
					disabled={disabled}
				>
					{button ? (
						<Button
							id={id}
							disabled={disabled}
							style={{
								...style,
								width: style?.width ? style?.width : '117px',
							}}
							className={className}
							type={type}
							onClick={() => {
								GetPrint(
									patientId,
									setParamData,
									param,
									setCheckPrint,
									moduleId || module,
									number,
									workId,
									funcAutoPrintGenDrugProfiles,
									autoPrintGenDrugProfiles
								);
								setVisible(!visible);
							}}
							onMouseEnter={() => {
								GetPrint(
									patientId,
									setParamData,
									param,
									setCheckPrint,
									moduleId || module,
									number,
									workId,
									funcAutoPrintGenDrugProfiles,
									autoPrintGenDrugProfiles
								);
							}}
							icon={
								<div
									style={{
										marginTop: '-5px',
									}}
								>
									<PrinterOutlined />
								</div>
							}
						/>
					) : (
						// </Tooltip>
						<Button
							id={id}
							disabled={disabled}
							style={style}
							className={className}
							type={type}
							shape={shape}
							size={size}
							onClick={() => {
								GetPrint(
									patientId,
									setParamData,
									param,
									setCheckPrint,
									moduleId || module,
									number,
									workId,
									funcAutoPrintGenDrugProfiles,
									autoPrintGenDrugProfiles
								);
								setVisible(!visible);
							}}
							onMouseEnter={() => {
								GetPrint(
									patientId,
									setParamData,
									param,
									setCheckPrint,
									moduleId || module,
									number,
									workId,
									funcAutoPrintGenDrugProfiles,
									autoPrintGenDrugProfiles
								);
							}}
							icon={
								<div
									style={{
										marginTop: '-5px',
									}}
								>
									<PrinterOutlined
										style={{
											fontSize: fontSize,
										}}
									/>
								</div>
							}
						/>
					)}
				</Dropdown>

				<Modal
					title={
						<b>
							<lable
								style={{
									color: 'rgb(29, 170, 62)',
								}}
							>
								กำลังประมวลผล
							</lable>
						</b>
					}
					footer={false}
					visible={loading}
				>
					<Row
						justify="center"
						style={{
							marginBottom: '15px',
						}}
					>
						<Col pan={12} offset={6}>
							<SandClock />
						</Col>
					</Row>
				</Modal>
				{qtyPrintVisible ? (
					<QtyPrintModal
						visible={qtyPrintVisible}
						setVisible={setQtyPrintVisible}
						form={qtyForm}
						printPDF={printPDF}
					/>
				) : null}
			</>
		);
	}
);

export const GetPrint = async (
	patientId,
	setParamData,
	param,
	setCheckPrint,
	module,
	number,
	workId,
	funcAutoPrintGenDrugProfiles,
	autoPrintGenDrugProfiles
) => {
	if (patientId) {
		await axios
			.get(
				`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientPrintForm/${patientId}`
			)
			.then((res) => {
				var key,
					keys = Object.keys(res.data.responseData);
				var n = keys.length;
				var newobj = {};
				while (n--) {
					key = keys[n];
					newobj[key.toLowerCase()] = res.data.responseData[key];
				}
				if (setParamData) {
					setParamData(
						Object.assign(newobj, param, {
							patientid: patientId,
						})
					);
				}
			});
	}
	if (module) {
		let res = await axios
			.get(
				`${env.REACT_APP_PANACEACHS_SERVER
				}/api/Module/GetPrint?ModuleId=${module}${number ? '&MainPrinter=' + number : ''
				}${workId ? '&WorkId=' + workId : ''}`,
				{
					headers: {},
				}
			)
			.then((res) => {
				if (setCheckPrint) {
					// console.log(res.data.responseData);
					const report = res.data.responseData;
					if (param?.reportName) {
						setCheckPrint(
							filter(report, ["reportName", param.reportName])
						);
					} else {
						setCheckPrint(report);
					}
				}
				// console.log(res.data.responseData);
				if (autoPrintGenDrugProfiles === 'Y')
					funcAutoPrintGenDrugProfiles(res.data.responseData);
				return res.data.responseData;
			})
			.catch((error) => {
				console.log(error);
			});
		return res;
	}
};

const replaceUndefinedWithNull = (obj) => {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === undefined) {
			obj[key] = null;
		}
	});
	return obj;
};

export const getPdfFile = async (
	reportId,
	reportName,
	mrtFileName,
	sqlFileName,
	param,
	setLoading,
	onFinish,
	preview = false,
	preFix = null,
	setMessageStatus = () => { },
	multiFile = false
) => {
	let req = {
		reportId: reportId?.toString(),
		reportName: reportName,
		mrtFileName: mrtFileName,
		sqlFileName: sqlFileName,
		dataTableName: sqlFileName,
		condition: replaceUndefinedWithNull(param),
	};

	console.log('qzIsActive', qzIsActive);

	if (setLoading) {
		setLoading(true);
	}
	if (multiFile) {
		await axios
			.post(
				`${env.REACT_APP_PANACEA_REPORT}/api/ReportService/export-report-muti-sql-pdf`,
				req
			)
			.then(async (res) => {
				if (res.data.message.length === 0) {
					if (res.data.result) {
						if (res.data.result.previewFlag || preview) {
							// eslint-disable-next-line no-useless-concat
							var winparams =
								'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,' +
								'resizable,screenX=50,screenY=50,width=850,height=1050';
							const win = window.open('', 'PDF', winparams);
							let html = '';
							html += '<html>';
							html += '<body style="margin:0!important">';
							html +=
								'<embed width="100%" height="100%" src="data:application/pdf;base64,' +
								res.data.result.file +
								'" type="application/pdf" />';
							html += '</body>';
							html += '</html>';
							setTimeout(() => {
								if (html) {
									win?.document?.write(html);
								}
							}, 0);
							setMessageStatus(true);
						} else {
							if (qzIsActive === 'true') {
								await QzPrint(
									res.data.result.file,
									null,
									preFix ? preFix : res.data.result.prefix
								);
							}

							setMessageStatus(true);
							return;
						}
					}
				} else {
					toast.error('เกิดข้อผิดพลาด ไม่สามารถพิมพ์เอกสารได้', {
						position: 'top-right',
						autoClose: 2500,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: 'colored',
					});
					setMessageStatus(false);
				}
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				if (setLoading) {
					setLoading(false);
				}
				if (onFinish) {
					onFinish();
				}
			});
	} else {
		await axios
			.post(
				`${env.REACT_APP_PANACEA_REPORT}/api/ReportService/export-report-pdf`,
				req
			)
			.then(async (res) => {
				if (res.data.message.length === 0) {
					if (res.data.result) {
						if (res.data.result.previewFlag || preview) {
							var winparams =
								'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,' +
								'resizable,screenX=50,screenY=50,width=850,height=1050';
							const win = window.open('', 'PDF', winparams);
							let html = '';
							html += '<html>';
							html += '<body style="margin:0!important">';
							html +=
								'<embed width="100%" height="100%" src="data:application/pdf;base64,' +
								res.data.result.file +
								'" type="application/pdf" />';
							html += '</body>';
							html += '</html>';
							setTimeout(() => {
								if (html) {
									win?.document?.write(html);
								}
							}, 0);
							setMessageStatus(true);
						} else {
							if (qzIsActive === 'true') {
								await QzPrint(
									res.data.result.file,
									null,
									preFix ? preFix : res.data.result.prefix,
									res.data.result?.dimension?.width,
									res.data.result?.dimension?.height,
									res.data.result?.isLandscape,
									parseInt(param['@printcount'])
								);
							}

							setMessageStatus(true);
							return;
						}
					}
				} else {
					toast.error('เกิดข้อผิดพลาด ไม่สามารถพิมพ์เอกสารได้', {
						position: 'top-right',
						autoClose: 2500,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: 'colored',
					});
					setMessageStatus(false);
				}
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				if (setLoading) {
					setLoading(false);
				}
				if (onFinish) {
					onFinish();
				}
			});
	}
};
const QtyPrintModal = ({ visible, setVisible, form, printPDF }) => {
	const onFinish = (value) => {
		printPDF({
			printCount: form.getFieldValue('qtyPrint'),
		});
		form.resetFields();
		setVisible(false);
	};
	return (
		<Modal
			centered
			visible={visible}
			closable={false}
			footer={
				<Row justify="center" key="footer">
					<Button key="cancel" onClick={() => setVisible(false)}>
						ยกเลิก
					</Button>
					<Button key="ok" type="primary" onClick={() => form.submit()}>
						ตกลง
					</Button>
				</Row>
			}
		>
			<Form form={form} layout="vertical" onFinish={onFinish}>
				<Row
					justify="center"
					style={{
						flexDirection: 'row',
					}}
				>
					<Col span={12} /* style={{}} */>
						{/* <div><label className="gx-text-primary">ระบุจำนวนที่ต้องการพิมพ์</label></div> */}
						<Form.Item
							name="qtyPrint"
							style={{
								marginBottom: 0,
							}}
							label={
								<label className="gx-text-primary">
									ระบุจำนวนที่ต้องการพิมพ์
								</label>
							}
							rules={[
								{
									required: true,
									message: 'ระบุ',
								},
							]}
						>
							<InputNumber
								style={{
									width: '100%',
								}}
								min={0}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};
