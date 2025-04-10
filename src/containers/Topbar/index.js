import {
	BellOutlined,
	ContainerTwoTone,
	EyeOutlined,
	FileAddOutlined,
	FileSearchOutlined,
	FileTextOutlined,
	HeartOutlined,
	IdcardOutlined,
	MessageOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Badge,
	Button,
	Card,
	Col,
	Image,
	Layout,
	Modal,
	Popover,
	Row,
	Select,
	Space,
	Spin,
	Tooltip,
	notification,
} from 'antd';
import axios from 'axios';
import BtnNotiOutConsult from 'components/Button/BtnNotiOutConsult';
import BtnNotiSetOr from 'components/Button/BtnNotiSetOr';
import PatientOld from 'components/Patient/PatientOld';
import notiPop from 'components/Sound/audio/doorbellShortened.mp3';
import { callApis } from 'components/helper/function/CallApi';
import { env } from 'env';
import useSignalrHub from 'libs/useSignalrHub';
import { debounce, filter, find, map, uniqBy } from 'lodash';
import { matchSorter } from 'match-sorter';
import moment from 'moment';
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetParamURL } from 'routes/RadioGraphy/API/CheckXrayResultApi';
import Auxiliary from 'util/Auxiliary';
import CustomScrollbars from 'util/CustomScrollbars';
import {
	allSearchDetail,
	clearShowMessage,
	fetch_noti,
	opdPatientDetail,
	patientType as patientTypee,
	selectAdmitList,
	selectPatientScanner,
	selectServiceList,
	select_drug_info,
	showMessage,
	showPatient,
	showType,
	switchLanguage,
	toggleCollapsedSideNav,
} from '../../appRedux/actions';
import {
	smartCardAction,
	smartCardClear,
} from '../../appRedux/actions/SmartCardAction';
import AppNotification from '../../components/AppNotification';
import * as api from '../../components/Modal/API/EMessage/EMessage.js';
import SelectIPD from '../../components/Modal/SelectIPD';
import SelectIPDAllSearch from '../../components/Modal/SelectIPDAllSearch';
import SelectOPD from '../../components/Modal/SelectOPD';
import SelectOPDAllSearch from '../../components/Modal/SelectOPDAllSearch';
import UserInfo from '../../components/UserInfo';
import {
	NAV_STYLE_DRAWER,
	NAV_STYLE_FIXED,
	NAV_STYLE_MINI_SIDEBAR,
	TAB_SIZE,
} from '../../constants/ThemeSetting';
import { getPctDrugMain, searchPctDrug } from '../Api/drugSearch';
import {
	GetAdmitsSearch,
	GetCountPatientsSearch,
	GetLastWorkPlacesByPlaceType,
	GetListAdmintsIdByPatient,
	GetListServicesIdByPatient,
	GetTotalAdmitsSearch,
	patientSearch,
} from '../Api/patientSearch';
import Customizer from '../Customizer';
import ContentMessenger from '../Messenger/ContentMessenger';
import './Topbar.css';
import languageData from './languageData';

const { Header } = Layout;
const { Option } = Select;
const rowCursor = {
	cursor: 'pointer',
};

const NavCollapsed = () => {
	const { navStyle } = useSelector(({ settings }) => settings);
	const { navCollapsed, width } = useSelector(({ common }) => common);
	const dispatch = useDispatch();
	return (
		<Col span={width < TAB_SIZE ? 2 : 0}>
			{navStyle === NAV_STYLE_DRAWER ||
				navStyle === NAV_STYLE_FIXED ||
				(navStyle === NAV_STYLE_MINI_SIDEBAR && width < TAB_SIZE) ? (
				<div className="gx-linebar gx-mr-3">
					<i
						className="gx-icon-btn icon icon-menu"
						onClick={() => {
							dispatch(toggleCollapsedSideNav(!navCollapsed));
						}}
					/>
				</div>
			) : null}
		</Col>
	);
};
const warningDocOrder = new Audio(notiPop);

export default forwardRef(function Topbar(
	{
		IsDashBoard = false,
		validateOnSearch = () => true,
		ShowBtnViewFileScan = false,
		ShowBtnOutConsult = false,
		ShowPatientOld = true,
		historyTo = null,
		...props
	},
	ref
) {
	const { locale } = useSelector(({ settings }) => settings);
	const { width } = useSelector(({ common }) => common);
	const { selectPatient } = useSelector(({ patient }) => patient);
	const reduxOpd = useSelector(({ opdPatientDetail }) => opdPatientDetail);
	const allSearch = useSelector(({ Search }) => Search);
	const { message } = useSelector(({ autoComplete }) => autoComplete);
	const dispatch = useDispatch();
	const selectIPDRef = useRef(null);
	const selectOPDRef = useRef(null);
	const selectIPDAllSearchRef = useRef(null);
	const selectOPDAllSearchRef = useRef(null);

	const history = useHistory();
	let { pathname } = useSelector(({ common }) => common);
	const patient = useSelector((state) => state);
	const {
		opdClinicRoom,
		dentalRoom,
		doctorClinicRoom,
		wardRoom,
		laboratoryRoom,
		opdPrescriptionRoom,
		ipdPrescriptionRoom,
		operationRoom,
		inventoryRoom,
	} = useSelector(({ workRoom }) => workRoom);
	const { XRayWorkId } = useSelector(({ xRayWorkId }) => xRayWorkId);
	const { opdFinancePlace, ipdFinancePlace } = useSelector((state) => state);
	const [page, setPage] = useState(null);
	const [checkPath, setCheckPath] = useState(false);

	useEffect(() => {
		if (props?.page) {
			setPage(props.page);
		} else {
			setPage(null);
		}
	}, [pathname, props]);

	useEffect(() => {
		var pathName = window.location.pathname;
		if (
			pathName === '/opd%20clinic/opd-clinic-screening' ||
			pathName === '/dental/dental-screening' ||
			pathName === '/doctor%20clinic/doctor-clinic-take-history' ||
			pathName === '/ward/ward-ipd-patient-description'
		) {
			setCheckPath(true);
		} else {
			setCheckPath(false);
		}
	}, []);
	//use in new SelectSearch
	const [fetching, setFetching] = useState(false);
	const [countFetching, setCountFetching] = useState(false);
	const [openDropdown, setOpenDropdown] = useState(false);
	//SelectPatientSearch
	const [showPatientSearch, setShowPatientSearch] = useState(true);
	const [patienstList, setPatienstList] = useState([]);
	const [startRowPatientSearch, setStartRowPatientSearch] = useState('0');
	const [keywordForPatientSearch, setKeywordForPatientSearch] = useState(null);
	const [patientSelected, setPatientSelected] = useState(null);
	const [countForPatientSearch, setCountForPatientSearch] = useState(null);
	const [checkOnSelect, setCheckOnSelect] = useState(false);
	const selectRef = useRef(null);
	//SelectAdmitSearch
	const [showAdmitSearch, setShowAdmitSearch] = useState(true);
	const [admitList, setAdmitList] = useState([]);
	const [startRowAdmitSearch, setStartRowAdmitSearch] = useState('0');
	const [keywordForAdmitSearch, setKeywordForAdmitSearch] = useState(null);
	const [admitSelected, setAdmitSelected] = useState(null);
	const [countForAdmitSearch, setCountForAdmitSearch] = useState(null);
	const [checkAdmitOnSelect, setCheckAdmitOnSelect] = useState(false);
	const selectAdmitRef = useRef(null);
	//SelectOpdSearch
	const [searchOpdPatientShow, setSearchOpdPatientShow] = useState(
		props.SearchOpd
	);
	//SelectPatientScanner
	const { detail } = useSelector(({ patientScanner }) => patientScanner);
	const [scannerRoomDetail, setScannerRoomDetail] = useState({});
	////SelectType
	const { patient_Type } = useSelector(({ patientType }) => patientType);
	const [showSearch, setShowSearch] = useState(true);
	const [selectType, setSelectType] = useState('Hn');
	const [searchList, setSearchList] = useState([]);
	const [startRowSearch, setStartRowSearch] = useState('0');
	const [keywordForSearch, setKeywordForSearch] = useState(null);
	const [, setSearchSelected] = useState(null);
	const [countForSearch, setCountForSearch] = useState(null);
	const [, setCheckSearchOnSelect] = useState(false);
	////SelectDrugSearch
	const [showDrugSearch, setShowDrugSearch] = useState(false);
	const [listDrug, setListDrug] = useState([]);
	const [onDrugSearchInput, setOnDrugSearchInput] = useState(undefined);
	const [, setStartRowDrugSearch] = useState(0);
	const [endRowDrugSearch, setEndRowDrugSearch] = useState(20);
	const [chkOnPopupScroll, setChkOnPopupScroll] = useState(false);
	//Button
	const [btnScan, setBtnScan] = useState(true);
	const [btnPac, setBtnPac] = useState(true);
	//Modal
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [admitVisible, setAdmitVisible] = useState(false);
	const [dataList, setDataList] = useState([]);
	const [patientType, setPatientType] = useState(patient_Type);
	const [showPatientType, setShowPatientType] = useState(false);
	const [selectSearchDrug, setSelectSearchDrug] = useState(null);
	//Badgea
	const [badgeCount, setBadgeCount] = useState(10);
	const [patientIdSelected, setPatientIdSelected] = useState(null);
	const [SmartCardReading, setSmartCardReading] = useState(false);
	const userFromSession = JSON.parse(sessionStorage.getItem('user'));
	const userId = userFromSession?.responseData.userId;
	// SignalR ScanDocOrder
	const [countDocOrder, setCountDocOrder] = useState('0');
	const scanDocOrderSignRHub = useSignalrHub('/ScanDocOrder');
	const joinSignalrDoctorOrder = async (workId = '1') => {
		if (!ShowBtnViewFileScan) return setCountDocOrder('0');
		// console.log('scanDocOrderSignRHub.connection :>> ', scanDocOrderSignRHub.connection);
		if (scanDocOrderSignRHub.connection?.connectionState === 'Disconnected') {
			await scanDocOrderSignRHub.start();
			scanDocOrderSignRHub.on('ReceiveMessage', (message) => {
				// console.log("ReceiveMessage", message);
			});
			scanDocOrderSignRHub.on('DocOrderCount', (message) => {
				// console.log('DocOrderCount :>> ', message);
				const cnt = message || '0';
				setCountDocOrder((p) => {
					const prev = Number(p || '0');
					const newCnt = Number(cnt || '0');
					if (newCnt > prev) warningDocOrder.play();
					return cnt;
				});
				if (cnt !== '0') {
					document.getElementById('sidebar-right-hidden-false').click();
				}
			});
			await scanDocOrderSignRHub.joinGroup('JoinGroup', { workid: workId });
			callApis(apis['GetScanDocOrderSignalR']);
		}
	};
	useEffect(() => {
		if (scanDocOrderSignRHub) {
			joinSignalrDoctorOrder();
		}
	}, [scanDocOrderSignRHub]);

	useImperativeHandle(ref, () => ({
		resetState: () => resetState(),
		searchPatiens: ({ isValid = true, typeName }) =>
			searchPatiens(keywordForPatientSearch, typeName, isValid),
		onSelectPatient: ({ patientId }) => onSelectPatient(patientId),
		dispatchLastSerivce: (patientData, serviceList) =>
			dispatchLastSerivce(patientData, serviceList),
		dispatchLastAdmit: (patientData, admitList) =>
			dispatchLastAdmit(patientData, admitList),
		dispatchAllSearch: (patientData) => dispatchAllSearch(patientData),
	}));
	const GetPatients = async (patientId) => {
		const res = await axios
			.get(
				`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` +
				patientId
			)
			.then((res) => {
				return res?.data?.responseData || null;
			})
			.catch((error) => {
				return error;
			});
		return res;
	};
	const dispatchAllSearch = async ({ patientId, ...tempRecord } = {}) => {
		if (!patientId) {
			dispatch(allSearchDetail(null));
		} else {
			const patientData = await GetPatients(patientId);
			tempRecord.patientId = patientId || null;
			tempRecord.lastAn = patientData?.latestAdmits?.an || null;
			tempRecord.lastServiceId = patientData?.latestServices?.serviceId || null;
			tempRecord.opdipd = null;
			dispatch(
				allSearchDetail({
					patient: tempRecord,
					admitList: patientData?.latestAdmits?.an
						? [patientData?.latestAdmits]
						: [],
					serviceList: patientData?.latestServices?.serviceId
						? [patientData?.latestServices]
						: [],
					patientDetail: patientData,
				})
			);
		}
	};
	const dispatchLastAdmit = async (patientData, admitList) => {
		const patientId = patientData?.patientId;
		if (admitList?.length > 0) {
			dispatch(
				showPatient(
					{
						...(admitList[0] || {}),
						displayName: patientData?.displayName,
						idCard: patientData?.idCard,
					} || null
				)
			);
		} else if (patientId) {
			const resData = await GetListAdmintsIdByPatient(patientId);
			// console.log(resData)
			dispatch(
				showPatient(
					{
						...(resData[0] || {}),
						displayName: patientData?.displayName,
						idCard: patientData?.idCard,
					} || null
				)
			);
		}
	};
	const onSetSelectType = (prev) => {
		const pageAnDefaultList = ['6.2', '15.3', '22.6', '21.5'];
		if (pageAnDefaultList.includes(props?.page)) return 'An';
		else return 'Hn';
	};
	const resetState = () => {
		//ClearPatientSearch
		setPatienstList([]);
		setStartRowPatientSearch('0');
		setKeywordForPatientSearch(null);
		setPatientSelected(null);
		setCountForPatientSearch(null);
		setCheckOnSelect(false);
		//ClearAdmitSearch
		setAdmitList([]);
		setStartRowAdmitSearch('0');
		setKeywordForAdmitSearch(null);
		setAdmitSelected(null);
		setCountForAdmitSearch(null);
		setCheckAdmitOnSelect(false);
		//ClearSearchType
		setSelectType(onSetSelectType);
		setSearchList([]);
		setStartRowSearch('0');
		setKeywordForSearch(null);
		setSearchSelected(null);
		setCountForSearch(null);
		setCheckSearchOnSelect(false);
		setPatientType('opd');
	};
	useEffect(() => {
		resetState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);
	useEffect(() => {
		setPatientType(patient_Type);
		setPatientSelected(null);
		setAdmitSelected(null);
	}, [patient_Type]);
	useEffect(() => {
		if (showSearch) {
			if (showPatientSearch || searchOpdPatientShow) {
				setDataList(patienstList);
			}
			if (showAdmitSearch) {
				setDataList(admitList);
			}
		} else {
			setDataList(searchList);
		}
	}, [
		admitList,
		showAdmitSearch,
		showPatientSearch,
		showSearch,
		patienstList,
		searchList,
		searchOpdPatientShow,
	]);
	useEffect(() => {
		// console.log("props", props);
		// console.log("props", patientType);
		if (props?.AdmitSearch || props?.PatientType) {
			// console.log("props", patientType);
			setPatientIdSelected(selectPatient?.patientId || null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectPatient, patientType]);
	useEffect(() => {
		// console.log("reduxOpd", reduxOpd);
		if ((props.SearchOpd || props?.PatientType) && patientType === 'opd') {
			// console.log("props", patientType);
			setPatientIdSelected(reduxOpd?.opdPatientDetail?.patientId || null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reduxOpd, patientType]);
	useEffect(() => {
		// console.log("message", message);
		if (props.PatientSearch) {
			// dispatch(smartCardClear())
			// console.log("12312312312313123123123");
			setPatientIdSelected(message || null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [message]);
	useEffect(() => {
		if (props.allSearch) {
			setPatientIdSelected(allSearch?.patientDetail?.patientId || null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allSearch]);
	// Smart Card
	const SmartCardReader = () => {
		toast.warn('กรุณาเสียบบัตรประชาชน!', {
			position: 'top-center',
			autoClose: false,
			hideProgressBar: false,
			draggable: true,
			progress: undefined,
			theme: 'light',
		});
		const conWs = new WebSocket('ws://localhost:8100');

		conWs.onopen = function () {
			conWs.send(
				JSON.stringify({
					Type: 'CardID',
					Url: '',
				})
			);
			setSmartCardReading(true);
		};

		conWs.onmessage = async function (event) {
			setSelectType('IDCardPassport');
			let jsonData = JSON.parse(event.data);

			if (!jsonData || jsonData === 'Changed, Present, Unpowered') {
				toast.dismiss();
				toast.error('กรุณาตรวจสอบเครื่องอ่านบัตรหรือลองเสียบบัตรใหม่', {
					position: 'top-center',
					autoClose: false,
					hideProgressBar: false,
					draggable: true,
					progress: undefined,
					theme: 'light',
				});
				setTimeout(() => {
					toast.dismiss();
					conWs.close();
				}, 3000);
				return;
			}

			dispatch(smartCardAction(jsonData?.Result || {}));
			if (+jsonData.Event === 1 || jsonData.Event === 'inserted') {
				if (props.PatientSearch || props.SearchOpd || props.allSearch) {
					if (jsonData.Result.Personal) {
						if (props.PatientSearch || props.SearchOpd) {
							await searchPatiens(
								jsonData.Result.Personal.Citizenid,
								'IDCardPassport'
							);
						} else if (props.allSearch) {
							setAllSearchTypeValue('IDCardPassport');
							searchAll(jsonData.Result.Personal.Citizenid, 'IDCardPassport');
						}

						conWs.close();
						toast.dismiss();

						setSmartCardReading(false);
						if (
							window.location.pathname ===
							'/registration/registration-patient-visit' ||
							window.location.pathname ===
							'/privilege%20center/privilege-center-check-opd-right'
						) {
							setTimeout(() => {
								document.getElementById('check-authen').click();
							}, 4000);
						}
					} else {
						notification['error']({
							message:
								'ไม่สามารถอ่านข้อมูลบัตรประชานชนได้ กรุณาลองเสียบบัตรใหม่อีกครับ',
							duration: 2.5,
						});
					}
				} else if (props.AdmitSearch) {
					if (jsonData.Result.Personal) {
						await searchAdmit(
							jsonData.Result.Personal.Citizenid,
							'IDCardPassport'
						);
						conWs.close();
						toast.dismiss();
						setSmartCardReading(false);
					} else {
						notification['error']({
							message:
								'ไม่สามารถอ่านข้อมูลบัตรประชานชนได้ กรุณาลองเสียบบัตรใหม่อีกครับ',
							duration: 2.5,
						});
					}
				} else {
					notification['warning']({
						message: 'ไม่มีช่องสำหรับค้นหา',
						duration: 2.5,
					});
				}
			} else if (+jsonData.Event === 2 || jsonData.Event === 'removed') {
				notification['warning']({
					message: 'ถอดบัตรประชานชนออก',
					duration: 2.5,
				});
			}

			setSmartCardReading(false);
		};
	};

	const searchPatiens = async (values, typeName, isValid = false) => {
		const keySearch = values?.trim().replace(/\s+/g, ' ') || '';
		isValid = isValid ? isValid : validateOnSearch();
		if (!isValid) {
			return;
		}
		if (values) {
			async function fetchData() {
				if (showSearch === true) {
					await setPatienstList([]);
					await setCountForPatientSearch(null);
				} else {
					await setSearchList([]);
					await setCountForSearch(null);
				}
				await setFetching(true);
				let requestForPatientSearch = await {
					mode: null,
					user: null,
					ip: null,
					lang: null,
					branch_id: null,
					requestData: {
						key: keySearch,
						startRow: '0',
						endRow: '100',
						searchBy: typeName ? typeName : selectType,
					},
					barcode: null,
				};
				let requestForCountPatientsSearch = await {
					mode: null,
					user: null,
					ip: null,
					lang: null,
					branch_id: null,
					requestData: {
						key: keySearch,
						searchBy: selectType,
					},
					barcode: null,
				};
				let res = await patientSearch(requestForPatientSearch);
				if (!res || res?.length === 0) {
					setFetching(false);
					setOpenDropdown(false);
					return notificationY(false, 'ไม่พบข้อมูลผู้ป่วย');
				}
				if (res?.length > 0) {
					res = await patientOption(res);
					if (showSearch === true) {
						setStartRowSearch(`${res.length}`);
					} else {
						setStartRowPatientSearch(`${res.length}`);
					}
				}
				if (showSearch === true) {
					await setPatienstList(res);
				} else {
					await setSearchList(res);
				}
				if (res?.length === 1) {
					setOpenDropdown(false);
					if (showPatientSearch) {
						onSelectPatient(res[0].id, res);
					}
					if (searchOpdPatientShow) {
						onSelectOpd(res[0].value, res[0], res);
					}
				}
				if (res?.length > 1) {
					setOpenDropdown(false);
					setIsModalVisible(true);
				}
				// Total Count
				await setFetching(false);
				await setCountFetching(true);
				res = await GetCountPatientsSearch(requestForCountPatientsSearch);
				if (showSearch === true) {
					await setCountForPatientSearch(res);
				} else {
					await setCountForSearch(res);
				}
				await setCountFetching(false);
			}
			fetchData();
		}
	};
	const dispatchLastSerivce = async ({ patientId }, serviceList) => {
		if (serviceList) {
			if (serviceList.length > 0) {
				dispatch(opdPatientDetail(serviceList[0]));
				dispatch(selectServiceList(serviceList));
			} else {
				notificationY(false, 'ผู้ป่วยยังไม่มี Visit ของวันนี้');
				dispatch(opdPatientDetail(null));
				dispatch(selectServiceList([]));
			}
		}
		if (patientId) {
			let resData = await GetListServicesIdByPatient(patientId);
			// console.log(resData)
			if (resData.length > 0) {
				dispatch(opdPatientDetail(resData[0]));
				dispatch(selectServiceList(uniqBy(resData, 'serviceId')));
			} else {
				notificationY(false, 'ผู้ป่วยยังไม่มี Visit ของวันนี้');
				dispatch(opdPatientDetail(null));
				dispatch(selectServiceList([]));
			}
		}
	};
	const patientOption = (data) => {
		let arr = data.map((val, index) => {
			return {
				label: `
            ${val.firstName} ${val.lastName} :
            ${val.idCard !== null ? val.idCard : ''}
            ${val.idCard !== null ? ':' : ''}
            ${val.hn}
            `,
				value: `${val.firstName} ${val.lastName} :${val.idCard !== null ? val.idCard : ''} ${val.idCard !== null ? '/' : ''}${val.hn}`,
				picture: val.picture,
				id: val.patientId,
				patient: val,
				fullName: `${val.firstName} ${val.lastName}`,
			};
		});
		return arr;
	};
	const fetchPatientMore = async () => {
		async function fetchData() {
			await setFetching(true);
			let request = await {
				mode: null,
				user: null,
				ip: null,
				lang: null,
				branch_id: null,
				requestData: {
					key: showSearch ? keywordForPatientSearch : keywordForSearch,
					startRow: showSearch ? startRowSearch : startRowPatientSearch,
					endRow: showSearch
						? `${+startRowSearch + 100}`
						: `${+startRowPatientSearch + 100}`,
					searchBy: selectType,
				},
				barcode: null,
			};
			let res = await patientSearch(request);
			if (res.length > 0) {
				res = await patientOption(res);
				if (showSearch === true) {
					setStartRowSearch(`${+startRowSearch + res.length}`);
				} else {
					setStartRowPatientSearch(`${+startRowPatientSearch + res.length}`);
				}
			}
			if (showSearch === true) {
				await setPatienstList(patienstList.concat(res));
			} else {
				await setSearchList(searchList.concat(res));
			}
			await setFetching(false);
		}
		fetchData();
	};
	//Select Admit Func.
	const searchAdmit = async (values, typeName) => {
		if (values) {
			async function fetchData() {
				if (showSearch === true) {
					await setAdmitList([]);
					await setCountForAdmitSearch(null);
				} else {
					await setSearchList([]);
					await setCountForSearch(null);
				}
				await setFetching(true);
				let requestForAdmitSearch = await {
					mode: null,
					user: null,
					ip: null,
					lang: null,
					branch_id: null,
					requestData: {
						key: values,
						startRow: '0',
						endRow: '100',
						searchBy: typeName ? typeName : selectType,
					},
					barcode: null,
				};
				let requestForCountAdmitSearch = await {
					mode: null,
					user: null,
					ip: null,
					lang: null,
					branch_id: null,
					requestData: {
						key: values,
						searchBy: selectType,
					},
					barcode: null,
				};
				let res = await GetAdmitsSearch(requestForAdmitSearch);
				// console.log(res);
				if (!res || res?.length === 0) {
					setFetching(false);
					setOpenDropdown(false);
					if (selectType === 'notDC') {
						return notificationY(
							false,
							'ไม่พบข้อมูลผู้ป่วย Admit ที่ยังไม่ D/C'
						);
					} else {
						return notificationY(
							false,
							'ไม่พบข้อมูลผู้ป่วย หรือผู้ป่วยยังไม่เคย Admit'
						);
					}
				}
				if (res?.length > 0) {
					let resTmp = [...res];
					let resFail = resTmp.filter((data) => data.deleteFlag === 'Y');
					let resNotFail = resTmp.filter((data) => data.deleteFlag !== 'Y');
					// console.log(resFail, resNotFail);
					if (resFail?.length > 0) {
						if (resFail?.length === res?.length) {
							notificationY(
								false,
								selectType === 'An' || selectType === 'notDC'
									? 'AN ถูกล้มแฟ้มแล้ว'
									: 'แฟ้มผู้ป่วยในทั้งหมดถูกล้มแล้ว'
							);
							res = await admitOption([]);
						} else {
							res = await admitOption(resNotFail);
						}
					} else {
						res = await admitOption(res);
					}
					if (showSearch === true) {
						setStartRowSearch(`${res?.length}`);
					} else {
						setStartRowAdmitSearch(`${res?.length}`);
					}
				}
				if (showSearch === true) {
					await setAdmitList(res);
				} else {
					await setSearchList(res);
				}
				if (res?.length === 1) {
					setOpenDropdown(false);
					onSelectAdmit(res[0].patientId, res[0], res);
				}
				if (res?.length > 1) {
					setOpenDropdown(false);
					setAdmitVisible(true);
				}
				//Total Count
				await setFetching(false);
				await setCountFetching(true);
				res = await GetTotalAdmitsSearch(requestForCountAdmitSearch);
				if (showSearch === true) {
					await setCountForAdmitSearch(res);
				} else {
					await setCountForSearch(res);
				}
				await setCountFetching(false);
			}
			fetchData();
		}
	};
	const admitOption = (data) => {
		let arr = data.map((val, index) => {
			let idCard = null;
			let fullName = null;
			if (val.fullName && val.fullName.includes('|')) {
				idCard = val.fullName.split('|')[0].trim();
				fullName = val.fullName.split('|')[1].trim();
			}
			val.idCard = idCard;
			val.fullName = fullName;

			return {
				label: `${val.fullName}`,
				value: `${val.fullName}`,
				fullName: fullName,
				idCard: idCard,
				admitId: val?.admitId,
				an: val.an,
				hn: val.hn,
				patient: val,
				patientId: val?.patientId,
			};
		});
		return arr;
	};
	const fetchAdmitMore = async () => {
		async function fetchData() {
			await setFetching(true);
			let request = await {
				mode: null,
				user: null,
				ip: null,
				lang: null,
				branch_id: null,
				requestData: {
					key: showSearch ? keywordForAdmitSearch : keywordForSearch,
					startRow: showSearch ? startRowSearch : startRowAdmitSearch,
					endRow: showSearch
						? `${+startRowSearch + 100}`
						: `${+startRowAdmitSearch + 100}`,
					searchBy: selectType,
				},
				barcode: null,
			};
			let res = await GetAdmitsSearch(request);
			if (res.length > 0) {
				res = await admitOption(res);
				if (showSearch === true) {
					setStartRowSearch(`${+startRowSearch + res.length}`);
				} else {
					setStartRowAdmitSearch(`${+startRowAdmitSearch + res.length}`);
				}
			}
			if (showSearch === true) {
				await setAdmitList(admitList.concat(res));
			} else {
				await setSearchList(searchList.concat(res));
			}
			await setFetching(false);
		}
		fetchData();
	};
	const debounceDrugSearch = useMemo(() => {
		const loadOptions = async (value) => {
			// console.log("loadOptions");
			setListDrug([]);
			setChkOnPopupScroll(true);
			setStartRowDrugSearch(0);
			setEndRowDrugSearch(20);
			await searchDrug(value, 0, 20);
			setFetching(false);
		};
		return debounce(loadOptions, 1000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	/// search drug
	const searchDrug = async (values, startrow, endrow) => {
		// console.log("startRowDrugSearch", startrow);
		// console.log("endRowDrugSearch", endrow);
		if (values) {
			let res = await searchPctDrug({
				search: values,
				startrow: startrow /* ||startRowDrugSearch */,
				endrow: endrow /* ||endRowDrugSearch, */,
			});

			if (res.searchResults?.length < 20) {
				setChkOnPopupScroll(false);
			}
			if (listDrug) return setListDrug([...listDrug, ...res.searchResults]);
			return setListDrug(res.searchResults);
		}
	};
	const getDrugInfoFromSearch = async (val) => {
		let res = await getPctDrugMain(val);
		res.pct_DrugRights = res?.pct_DrugRights.map((o) => {
			return {
				...o,
				rightId: o?.rightId?.replaceAll(' ', ''),
			};
		});
		// console.log('getDrugInfoFromSearch :>> ', res);
		dispatch(select_drug_info(res));
	};
	const languageMenu = () => (
		<CustomScrollbars className="gx-popover-lang-scroll">
			<ul className="gx-sub-popover">
				{languageData.map((language) => (
					<li
						className="gx-media gx-pointer"
						key={JSON.stringify(language)}
						onClick={() => dispatch(switchLanguage(language))}
					>
						<i className={`flag flag-24 gx-mr-2 flag-${language.icon}`} />
						<span className="gx-language-text">{language.name}</span>
					</li>
				))}
			</ul>
		</CustomScrollbars>
	);
	const onSelectPatient = (patientid, searchList /* , setlocal */) => {
		setPatientSelected(patientid);
		setPatientIdSelected(patientid);
		// if(!setlocal){
		// let selectPatient = {
		//   showLabel: value, //ถ้า code นี้ใช้ต้องส่งพารามิเตอร์เป็น value เพิ่ม
		//   patientId: patientid,
		//   searchList: searchList ? searchList : patienstList,
		// };
		// localStorage.setItem("selectPatient", JSON.stringify(selectPatient));
		// }
		if (
			/* 1.8 */ pathname === '/information/information-dashboard' ||
			pathname === '/opd clinic/opd-clinic-opd-set-or'
		) {
			dispatch(showMessage(patientid));
			history.push({
				pathname: '/information/information-patient-search',
			});
		} else if (
			/* 3.6 */ pathname === '/privilege center/privilege-center-dashboard'
		) {
			dispatch(showMessage(patientid));
			history.push({
				pathname: '/privilege center/privilege-center-check-opd-right',
			});
		} else if (/* 8.9 */ pathname === '/appointment/appointment-dashboard') {
			dispatch(showMessage(patientid));
			history.push({
				pathname: '/appointment/appointment-appoint',
			});
		} else if (
			/* 8.6 */ pathname === '/appointment/appointment-appoint-history'
		) {
			dispatch(showMessage(patientid));
			history.push({
				pathname: '/appointment/appointment-appoint',
			});
		} else {
			dispatch(showMessage(patientid));
		}
	};
	const onSelectAdmit = async (patientId, param, searchList, noFail) => {
		setAdmitSelected(patientId);
		let resData = await GetListAdmintsIdByPatient(param.patient.patientId);
		resData = resData.map((val) => {
			return {
				...val,
				displayName: param.patient.fullName,
				idCard: param.patient.idCard,
			};
		});
		dispatch(selectAdmitList(resData));
		// console.log(resData);
		if (resData?.length === 0) {
			if (selectType === 'notDC') {
				return notificationY(false, 'ไม่พบข้อมูลผู้ป่วย Admit ที่ยังไม่ D/C');
			} else {
				return notificationY(
					false,
					'ไม่พบข้อมูลผู้ป่วย หรือผู้ป่วยยังไม่เคย Admit'
				);
			}
		} else if (
			resData.length > 1 &&
			selectType !== 'An' &&
			selectType !== 'notDC' &&
			(page === '4.9' ||
				page === '13.6' ||
				window.location.pathname ===
				'/social%20medication/social-medication-record-rehabilitation')
		) {
			onSelectAn(resData[0], searchList, resData);
		} else if (
			resData?.length > 1 &&
			selectType !== 'An' &&
			selectType !== 'notDC'
		) {
			if (page === '13.7' || page === '21.4') {
				onSelectAn(resData[0], searchList, resData);
			} else {
				selectIPDRef?.current?.setIsVisible(true);
				selectIPDRef?.current?.setSearchIpdList(searchList);
			}
		} else if (
			resData.length > 1 &&
			(selectType === 'An' || selectType === 'notDC')
		) {
			// console.log(keywordForAdmitSearch);
			let selectRes = resData.find((val) => val.an === keywordForAdmitSearch);
			onSelectAn(selectRes, searchList, resData);
		} else {
			onSelectAn(resData[0], searchList, resData);
		}
	};
	const onSelectAn = (patientData, searchList, selectAdmitList) => {
		if (!patientData) {
			return setAdmitSelected(keywordForAdmitSearch);
		}
		// let selectPatient = {
		//   showLabel: patientData.displayName,
		//   patientId: patientData.patientId,
		//   searchList: searchList ? searchList : admitList,
		//   showPatient: patientData,
		//   selectAdmitList: selectAdmitList,
		// };
		// localStorage.setItem("selectPatient", JSON.stringify(selectPatient));
		if (
			/* 4.13 */ pathname === '/admission center/admission-center-dashboard'
		) {
			dispatch(showMessage(patientData.patientId));
			history.push({
				pathname: '/admission center/admission-center-admit-register',
			});
		} else if (/* 6.9 */ pathname === '/coder/coder-dashboard') {
			dispatch(opdPatientDetail(patientData));
			history.push({
				pathname: '/refer center/refer-center-register-opd',
			});
		} else if (
			/* 7.7.1 */
			pathname === '/opd clinic/opd-clinic-opd-set-or' /* 10.3.8 */ ||
			pathname === '/doctor clinic/doctor-clinic-set-surgery'
		) {
			dispatch(showPatient(patientData));
			/* 7.7 */
			history.push({
				pathname: '/opd clinic/opd-clinic-opd-set-or-sds',
			});
		} else {
			dispatch(showPatient(patientData));
			if (/* 11.2 */ pathname === '/ward/ward-dashboard') {
				history.push({
					pathname: '/ward/ward-ipd-patient-description',
				});
			}
			if (
				/* 15.7*/ pathname === '/ipd presciption/ipd-prescription-dashboard'
			) {
				history.push({
					pathname: '/ipd presciption/ipd-prescription-ipd-drug-profile',
				});
			}
		}
	};
	const notificationY = (type, title, topic) => {
		notification[type ? 'success' : 'warning']({
			message: (
				<label
					className={type ? 'gx-text-primary fw-bold' : 'fw-bold'}
					style={
						type
							? {
								fontSize: 18,
							}
							: {
								fontSize: 18,
								color: 'red',
							}
					}
				>
					{title}
				</label>
			),
			// description:,
			duration: 5,
		});
	};
	const onSelectOpd = async (value, param, searchOpdList) => {
		// console.log(value, param, searchOpdList);
		setPatientSelected(param?.patient?.patientId);
		let resData = await GetListServicesIdByPatient(param?.patient?.patientId);
		resData = resData.map((val) => {
			return {
				...val,
				displayName: param?.patient?.displayName,
				idCard: param?.patient?.idCard,
				picture: param?.patient?.picture,
			};
		});
		dispatch(selectServiceList(uniqBy(resData, 'serviceId')));
		const chkSrvToday = (listSize = null) => {
			if (page === '7.3' || page === '7.2') {
				let currentDate = moment().format('MM/DD/YYYY');
				if (
					currentDate ===
					moment(resData[0]?.serviceDateDesc, 'MM/DD/YYYY').format('MM/DD/YYYY')
				) {
					// console.log("Y");
					dispatch(opdPatientDetail(resData[0]));
					if (props?.page === '7.2') {
						history.push({
							pathname: '/opd clinic/opd-clinic-screening',
						});
					}
				} else {
					// console.log("N");
					notificationY(false, 'ผู้ป่วยยังไม่มี Visit ของวันนี้');
					dispatch(opdPatientDetail(null));
				}
			} else if (page === '10.3' || page === '10.2') {
				let currentDate = moment().format('MM/DD/YYYY');
				if (
					currentDate ===
					moment(resData[0]?.serviceDateDesc, 'MM/DD/YYYY').format('MM/DD/YYYY')
				) {
					// console.log("Y");
					dispatch(opdPatientDetail(resData[0]));
					if (page === '10.2') {
						// console.log("10.2 ===>");
						history.push({
							pathname: '/doctor clinic/doctor-clinic-take-history',
						});
					}
				} else {
					// console.log("N");
					notificationY(false, 'ผู้ป่วยยังไม่มี Visit ของวันนี้');
					dispatch(opdPatientDetail(null));
				}
			} else if (page === '9.4' || page === '9.3') {
				let currentDate = moment().format('MM/DD/YYYY');
				if (
					currentDate ===
					moment(resData[0]?.serviceDateDesc, 'MM/DD/YYYY').format('MM/DD/YYYY')
				) {
					// console.log("Y");
					dispatch(opdPatientDetail(resData[0]));
					if (page === '9.3') {
						history.push({
							pathname: '/dental/dental-screening',
						});
					}
				} else {
					// console.log("N");
					notificationY(false, 'ผู้ป่วยยังไม่มี Visit ของวันนี้');
					dispatch(opdPatientDetail(null));
				}
			}
			if (listSize === '1') {
				onSelectServiceId(
					resData?.length > 0 ? resData[0] : param.patient /* patienstList.find(
                                                                           (val) => val.patient.patientId === param.patient.patientId
                                                                           )?.patient */,
					value,
					searchOpdList,
					resData
				);
			}
		};
		if (resData.length > 1) {
			// เมนู 7 , 9 , 10
			switch (page) {
				case '7.3': {
					return chkSrvToday();
				}
				case '7.2': {
					return chkSrvToday();
				}
				case '7.4': {
					return dispatch(opdPatientDetail(resData[0]));
				}
				case '9.3': {
					return chkSrvToday();
				}
				case '9.4': {
					return chkSrvToday();
				}
				case '10.2': {
					return chkSrvToday();
				}
				case '10.3': {
					return chkSrvToday();
				}
				case '14.3': {
					return dispatch(opdPatientDetail(resData[0]));
				}
				case '13.6': {
					return dispatch(opdPatientDetail(resData[0]));
				}
				case '13.7': {
					return dispatch(opdPatientDetail(resData[0]));
				}
				case '23.1': {
					return dispatch(opdPatientDetail(resData[0]));
				}
				default: {
					if (props?.firstServiceId) {
						return dispatch(opdPatientDetail(resData[0]));
					}
					if (selectOPDRef.current) {
						selectOPDRef.current.setShowLabel(value);
						selectOPDRef.current.setSearchOpdList(searchOpdList);
						selectOPDRef.current.setIsVisible(true);
					}
				}
			}
			// console.log(selectOPDRef.current);
		} else {
			if (resData.length === 1) {
				switch (page) {
					case '7.3': {
						return chkSrvToday();
					}
					case '7.2': {
						return chkSrvToday();
					}
					case '9.3': {
						return chkSrvToday();
					}
					case '9.4': {
						return chkSrvToday();
					}
					case '10.2': {
						return chkSrvToday();
					}
					case '10.3': {
						return chkSrvToday();
					}
					default: {
						dispatch(opdPatientDetail(resData[0]));
					}
				}
			} else {
				notificationY(false, 'ผู้ป่วยยังไม่เคย Visit');
				dispatch(opdPatientDetail(null));
			}
		}
	};
	const onSelectServiceId = (
		patientData,
		showLabel,
		searchOpdList,
		serviceList
	) => {
		// console.log(patientData);
		// setOpdSelected(value);
		if (!patientData) {
			return setPatientSelected(keywordForPatientSearch);
		}

		// let selectPatient = {
		//   showLabel: showLabel,
		//   patientId: patientData.patientId,
		//   searchList: searchOpdList ? searchOpdList : patienstList,
		//   opdPatientDetail: patientData,
		//   serviceList: serviceList,
		// };
		// localStorage.setItem("selectPatient", JSON.stringify(selectPatient));
		// console.log(patientData);
		dispatch(opdPatientDetail(patientData));
		if (pathname === '/information/information-summary-opd-finances') {
			history.push({
				pathname: '/information/information-summary-opd-finances',
			});
		}
		if (pathname === '/privilege center/privilege-center-opd-expense-summary') {
			history.push({
				pathname: '/privilege center/privilege-center-opd-expense-summary',
			});
		}
		if (pathname === '/opd clinic/opd-clinic-opd-expense-summary') {
			history.push({
				pathname: '/opd clinic/opd-clinic-opd-expense-summary',
			});
		}
		if (pathname === '/dental/dental-opd-expense-summary') {
			history.push({
				pathname: '/dental/dental-opd-expense-summary',
			});
		}
		if (
			pathname === '/outpatient finance/outpatient-finance-opd-expense-summary'
		) {
			history.push({
				pathname: '/outpatient finance/outpatient-finance-opd-expense-summary',
			});
		}
		if (pathname === '/social welfare/social-welfare-opd-finances') {
			history.push({
				pathname: '/social welfare/social-welfare-opd-finances',
			});
		}
		if (pathname === '/reimbursement/reimbursement-opd-expense-summary') {
			history.push({
				pathname: '/reimbursement/reimbursement-opd-expense-summary',
			});
		}
		if (pathname === '/opd prescription/opd-prescription-opd-expense-summary') {
			history.push({
				pathname: '/opd prescription/opd-prescription-opd-expense-summary',
			});
		}
		///เมนู 7
		// เมนู 7.2
		if (pathname === '/opd clinic/opd-clinic-dashboard') {
			history.push({
				pathname: '/opd clinic/opd-clinic-screening',
			});
		}

		///เมนู 9
		// เมนู 9.3
		if (pathname === '/dental/dental-dashboard') {
			history.push({
				pathname: '/opd clinic/opd-clinic-screening',
			});
		}
		if (/* 10.2 */ pathname === '/doctor clinic/doctor-clinic-dashboard') {
			history.push({
				pathname: '/doctor clinic/doctor-clinic-take-history',
			});
		}
		// 10.14
		if (pathname === '/doctor clinic/doctor-clinic-opd-expense-summary') {
			history.push({
				pathname: '/doctor clinic/doctor-clinic-opd-expense-summary',
			});
		}

		//เมนู 14
		//เมนู 14.1.1
		// console.log("TT0");
		// console.log(pathname);
		if (pathname === '/opd prescription/opd-prescription-dashboard') {
			// console.log("TT");
			history.push({
				pathname: '/opd%20prescription/opd-prescription-opd-drug-charge',
			});
		}
	};
	const onSelectSearch = (value, param) => {
		setSearchSelected(value);
		dispatch(
			showType({
				type: selectType,
				patient: param,
			})
		);
	};
	const onPatientIdSelected = async (patientSelected) => {
		if (IsDashBoard) {
			return;
		}
		let patientId = patientSelected;
		let roomValue = null;
		let placeType = null;
		let pathRoom = pathname?.split('/')[1];

		switch (pathRoom) {
			//module1
			case 'information':
				placeType = 'INF';
				break;
			//module2
			case 'registration':
				placeType = 'RGST';
				// let res = await GetWorkPlacesRGST();
				// roomValue = res?.length > 0 ? res[0]?.datavalue : null;

				break;

			//module3
			case 'privilege center':
				placeType = 'Authent';
				break;

			//module4
			case 'admission center':
				placeType = 'Admit';
				break;

			//module5
			case 'refer center':
				placeType = 'Refer';
				break;

			//module6
			case 'coder':
				placeType = 'Coder';
				break;

			//module7
			case 'opd clinic':
				roomValue = opdClinicRoom?.datavalue ? opdClinicRoom?.datavalue : null;
				placeType = 'OPD';
				break;

			//module8
			case 'appointment':
				placeType = 'Appoint';
				break;

			//module9
			case 'dental':
				// if(opdClinicRoom){
				roomValue = dentalRoom?.datavalue ? dentalRoom?.datavalue : null;
				placeType = 'DEN';
				// }
				// code block

				break;

			//module10
			case 'doctor clinic':
				// code block
				roomValue = doctorClinicRoom?.datavalue
					? doctorClinicRoom?.datavalue
					: null;
				placeType = 'OPD';
				break;

			//module11
			case 'ward':
				// code block
				roomValue = wardRoom?.datavalue ? wardRoom?.datavalue : null;
				placeType = 'Ward';
				break;

			//module12
			case 'laboratory':
				// code block
				roomValue = laboratoryRoom?.datavalue
					? laboratoryRoom?.datavalue
					: null;
				placeType = 'Lab';
				break;

			//module13
			case 'diagnostic radiography':
				roomValue = XRayWorkId ? XRayWorkId : null;
				placeType = 'XRay';
				break;

			//module14
			case 'opd prescription':
				roomValue = opdPrescriptionRoom?.datavalue
					? opdPrescriptionRoom?.datavalue
					: null;
				placeType = 'Pho';
				break;

			//module15
			case 'ipd presciption':
				roomValue = ipdPrescriptionRoom?.datavalue
					? ipdPrescriptionRoom?.datavalue
					: null;
				placeType = 'Phi';
				break;

			//module16
			case 'drug registration':
				placeType = 'DRGST';
				break;

			//module17
			case 'adr registration':
				placeType = 'ADR';
				break;

			//module18
			case 'operation room':
				roomValue = operationRoom?.datavalue ? operationRoom?.datavalue : null;
				placeType = 'OR';
				break;

			//module19
			case 'nutrition':
				placeType = 'FOOD';
				break;

			//module20
			case 'outpatient finance':
				roomValue = opdFinancePlace?.financePlace?.workId
					? opdFinancePlace?.financePlace?.workId
					: null;
				placeType = 'OFN';
				break;

			//module21
			case 'inpatient finance':
				roomValue = ipdFinancePlace?.financePlace?.workId
					? ipdFinancePlace?.financePlace?.workId
					: null;
				placeType = 'IFN';
				break;

			//module22
			case 'reimbursement':
				placeType = 'RBM';
				break;

			//module23
			case 'social welfare':
				placeType = 'SA';
				break;

			//module24
			case 'it admin':
				placeType = 'Admin';
				break;

			//module25
			case 'medication supplies inventory':
				roomValue = inventoryRoom?.datavalue ? inventoryRoom?.datavalue : null;
				placeType = 'STO';
				break;
			default:
				roomValue = null;
				// placeType = "OPD";
				break;
		}

		//module 22

		// console.log(pathname);
		// console.log(pathRoom);
		// console.log(pathname?.split("/")[2]);

		let workPlaceValue = await GetLastWorkPlacesByPlaceType(placeType);
		let eMessageLoginRoom = roomValue || null;
		let scanLoginRoom = roomValue
			? roomValue
			: workPlaceValue?.length > 0
				? workPlaceValue[0]?.datavalue
				: null;
		roomValue = roomValue
			? roomValue
			: workPlaceValue?.length > 0
				? workPlaceValue[0]?.datavalue
				: null;
		// let eMessageLoginRoom = roomValue || null;
		// let scanLoginRoom = roomValue || null;
		if (patientId) {
			sessionStorage.setItem('selectPatientemessage', 'true');
		}

		// console.log("roomValue  => ",roomValue);
		if (ShowPatientOld) {
			// หน้าที่ไม่แสดง ShowPatientOld ส่วนมากไม่ต้องแสดง E-Message
			let res = await api.EMessage.getPatientMessage({
				patientId: patientId,
				placeType: placeType,
				workId: eMessageLoginRoom /* || null */ /* userWorkId */,
				isToday: null,
				//Y => รับข้อความเฉพาะวันนี้กับเมื่อวาน, null => ทุกข้อความ
				page: null,
				rows: null,
			});
			let patientMessage = res?.responseData;
			// console.log('patientMessage', patientMessage)
			if (patientMessage) {
				// console.log('patientMessage', patientMessage)
				let filterByPatientMessageWorkPlaces = [];
				if (!roomValue) {
					filterByPatientMessageWorkPlaces = filter(
						res?.responseData?.results,
						function (o) {
							return !o?.patientMessageWorkPlaces?.length > 0;
						}
					);
				} else {
					filterByPatientMessageWorkPlaces = patientMessage?.results;
				}
				filterByPatientMessageWorkPlaces = filter(
					filterByPatientMessageWorkPlaces,
					['deleteFlag', null]
				);
				// console.log('filterByPatientMessageWorkPlaces', filterByPatientMessageWorkPlaces)

				dispatch(
					fetch_noti({
						FETCH_NOTI:
							filterByPatientMessageWorkPlaces /* patientMessage.results */ /* , */,
						/* pathName: pathname */
					})
				);
				setScannerRoomDetail({
					...scannerRoomDetail,
					workId: scanLoginRoom,
				});
				setBadgeCount(patientMessage.totalCount);
			}
		}
	};
	function visbleScanType() {
		let list = [
			{
				name: 'อ่านจาก Barcode',
				type: 'QR',
			},
		];
		let foodOreder = [
			{
				name: 'Order อาหาร',
				type: 'F',
			},
		];
		let doctorOrder = [
			{
				name: 'Order แพทย์',
				type: 'D',
			},
		];
		let opdPatient = [
			{
				name: 'ไม่มี Barcode',
				type: 'O',
			},
		];
		let ipdPatient = [
			{
				name: 'ไม่มี Barcode',
				type: 'I',
			},
		];
		let bill = [
			{
				name: 'ใบเสร็จ',
				type: 'B',
			},
		];
		let payment = [
			{
				name: 'ใบสั่งซื้อ',
				type: 'P',
			},
		];
		let med = [
			{
				name: 'เอกสารแนะนำยา',
				type: 'C',
			},
		];
		switch (page) {
			case '2.1':
			case '2.2':
			case '6.1':
			case '7.3':
			case '10.3':
			case '15.13':
			case '20.4':
			case '81.2':
				return [...list, ...opdPatient];
			case '23.1':
			case '59.1':
				return [...list, ...opdPatient];
			case '59.2':
				return [...list, ...ipdPatient];
			case '12.6':
			case '12.7':
				return [...list, ...opdPatient];
			case '3.6':
			case '4.12':
			case '6.2':
			case '23.2':
			case '12.7-IPD':
				setSelectType('An');
				return [...list, ...ipdPatient];
			case '11.6':
				return [...list, ...ipdPatient, ...foodOreder, ...doctorOrder];
			case '15.3':
				return [...list, ...doctorOrder];
			case '16.1':
				return [...list, ...med];
			case '20.6':
				return [...list, ...bill];
			case '21.5':
				return [...list, ...opdPatient];
			case '25.18':
				return [...list, ...payment];
			default:
				return list;
		}
	}
	function visbleViewScanType() {
		let list = [
			{
				name: 'อ่านจาก QR CODE',
				type: 'QR',
			},
		];
		let foodOreder = [
			{
				name: 'Order อาหาร',
				type: 'F',
			},
		];
		let doctorOrder = [
			{
				name: 'Order แพทย์',
				type: 'D',
			},
		];
		let opdPatient = [
			{
				name: 'View Opd',
				type: 'O',
			},
		];
		let ipdPatient = [
			{
				name: 'View Ipd',
				type: 'I',
			},
		];
		let bill = [
			{
				name: 'ใบเสร็จ',
				type: 'B',
			},
		];
		let payment = [
			{
				name: 'ใบสั่งซื้อ',
				type: 'P',
			},
		];
		let med = [
			{
				name: 'เอกสารแนะนำยา',
				type: 'C',
			},
		];
		switch (page) {
			case '2.1':
			case '2.2':
			case '81.2':
				return [...opdPatient];
			case '6.1':
			case '7.3':
			case '10.3':
			case '15.13':
			case '21.5':
			case '56.5':
			case '23.1':
				return opdPatient;
			case '3.6':
			case '23.2':
				return ipdPatient;
			case '4.12':
			case '6.2':
				return [...opdPatient, ...ipdPatient];
			case '11.6':
				return [...opdPatient, ...ipdPatient, ...foodOreder, ...doctorOrder];
			case '15.3':
				return doctorOrder;
			case '16.1':
				return med;
			case '20.6':
				return bill;
			case '25.18':
				return payment;

			default:
				return list;
		}
	}
	// console.log('detail :>> ', detail);
	const UserMenuOptions = ({ type }) => {
		let listViewScan = visbleViewScanType();
		let listScanQy = visbleScanType();
		return (
			<ul className="gx-user-popover">
				{type === 'scan'
					? listScanQy.map(({ name, type }, index) => (
						<li
							key={index}
							onClick={async () => {
								if (type === 'QR') {
									history.push({
										pathname:
											'/document%20management/document-management-scan-barcode',
									});
									dispatch(
										selectPatientScanner({
											code: true,
											type: type,
											val: null,
										})
									);
								} else {
									if (type === 'O') {
										if (detail.val?.opd) {
											// console.log(reduxOpd);
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														opd: {
															...detail.val?.opd,
															workId: scannerRoomDetail?.workId,
															serviceId:
																reduxOpd?.opdPatientDetail?.serviceId,
														},
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาค้นหาผู้ป่วย`,
												placement: 'top',
											});
										}
									}
									if (type === 'I') {
										if (detail.val?.ipd) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														ipd: detail.val?.ipd,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาค้นหาผู้ป่วย`,
												placement: 'top',
											});
										}
									}
									if (type === 'D') {
										if (detail.val?.doctor) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														doctor: detail.val?.doctor,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาเลือก Order แพทย์`,
												placement: 'top',
											});
										}
									}
									if (type === 'F') {
										if (detail.val?.food) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														food: detail.val?.food,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาเลือกรายการอาหาร`,
												placement: 'top',
											});
										}
									}
									if (type === 'B') {
										if (detail.val?.bill) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														bill: detail.val?.bill,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาเลือกใบเสร็จ`,
												placement: 'top',
											});
										}
									}
									if (type === 'P') {
										if (detail.val?.purchase) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														purchase: detail.val?.purchase,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาเลือกใบสั่งซื้อ`,
												placement: 'top',
											});
										}
									}
									if (type === 'C') {
										if (detail.val?.expense) {
											history.push({
												pathname:
													'/document%20management/document-management-scan-barcode',
											});
											dispatch(
												selectPatientScanner({
													code: false,
													type: type,
													val: {
														...detail.val,
														expense: detail.val?.expense,
													},
												})
											);
										} else {
											return notification.warning({
												message: `กรุณาเลือกเอกสารแนะนำยา`,
												placement: 'top',
											});
										}
									}
								}
							}}
						>
							{name}
						</li>
					))
					: listViewScan.map(({ name, type }, index) => (
						<li
							key={index}
							onClick={async () => {
								if (type === 'O') {
									if (detail.val?.opd) {
										history.push({
											pathname:
												'/document%20management/document-management-view-opdcard',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													opd: detail.val?.opd,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาค้นหาผู้ป่วย`,
											placement: 'top',
										});
									}
								}
								if (type === 'I') {
									if (detail.val?.ipd) {
										history.push({
											pathname:
												'/document%20management/document-management-view-ipdcard',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													ipd: detail.val?.ipd,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาค้นหาผู้ป่วย`,
											placement: 'top',
										});
									}
								}
								if (type === 'D') {
									if (detail.val?.doctor) {
										history.push({
											pathname:
												'/document%20management/document-management-order-med-ward',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													doctor: detail.val?.doctor,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาเลือก Order แพทย์`,
											placement: 'top',
										});
									}
								}
								if (type === 'F') {
									if (detail.val?.food) {
										history.push({
											pathname:
												'/document%20management/document-management-order-food-ward',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													food: detail.val?.food,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาเลือกรายการอาหาร`,
											placement: 'top',
										});
									}
								}
								if (type === 'B') {
									if (detail.val?.bill) {
										history.push({
											pathname:
												'/document%20management/document-management-scan-barcode',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													bill: detail.val?.bill,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาเลือกใบเสร็จ`,
											placement: 'top',
										});
									}
								}
								if (type === 'P') {
									if (detail.val?.purchase) {
										history.push({
											pathname:
												'/document%20management/document-management-scan-barcode',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													purchase: detail.val?.purchase,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาเลือกใบสั่งซื้อ`,
											placement: 'top',
										});
									}
								}
								if (type === 'C') {
									if (detail.val?.expense) {
										history.push({
											pathname:
												'/document%20management/document-management-view-scan-med',
										});
										dispatch(
											selectPatientScanner({
												code: false,
												type: type,
												val: {
													...detail.val,
													expense: detail.val?.expense,
												},
											})
										);
									} else {
										return notification.warning({
											message: `กรุณาเลือกเอกสารแนะนำยา`,
											placement: 'top',
										});
									}
								}
							}}
						>
							{name}
						</li>
					))}
			</ul>
		);
	};
	useEffect(() => {
		/* Note :
		If PatientSearch then setHiddenPatientSearch(false);
		If AdmitSearch then setHiddenAdmitSearch(false);
		If TypeSearch then setHiddenSearch(false);
		If OpdSearch then setSearchOpdPatientHidden(false);
		If HaveBtnScan then setBtnScan(false);
	*/
		// defalut
		setShowPatientSearch(props.PatientSearch);
		setShowAdmitSearch(props.AdmitSearch);
		setShowSearch(true);
		setSearchOpdPatientShow(props.SearchOpd);
		setBtnScan(props.BtnScan);
		setBtnPac(props?.BtnPac);
		setShowPatientType(props.PatientType);
		setShowDrugSearch(props.ShowDrugSearch);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);
	useEffect(() => {
		if (showPatientType) {
			if (patientType === 'opd') {
				setSearchOpdPatientShow(true);
				setShowAdmitSearch(false);
			}
			if (patientType === 'ipd') {
				setSearchOpdPatientShow(false);
				setShowAdmitSearch(true);
			}
		}
		// SmartCardReader();
	}, [patientType, showPatientType]);
	useEffect(() => {
		if (patientIdSelected) {
			onPatientIdSelected(patientIdSelected);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [patientIdSelected]);
	useEffect(() => {
		dispatch(fetch_noti({}));
		setBadgeCount(100);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		// eslint-disable-next-line default-case
		switch (page) {
			case '2.6':
			case '11.2':
			case '11.6':
			case '22.28.1':
				return setSelectType('An');
		}
		switch (props.page) {
			case '21.4':
				return setSelectType('An');
			default:
				break;
		}
	}, [page, props.page]);
	const optionType = () => {
		const defaultList = [
			{
				value: 'Hn',
				label: 'HN',
				className: 'data-value',
			},
			{
				value: 'An',
				label: 'AN',
				className: 'data-value',
			},
			{
				value: 'notDC',
				label: 'AN ที่ยังไม่ D/C',
				className: 'data-value',
			},
			{
				value: 'Name',
				label: 'ชื่อ-นามสกุล',
				className: 'data-value',
			},
			{
				value: 'FirstName',
				label: 'ชื่อ',
				className: 'data-value',
			},
			{
				value: 'LastName',
				label: 'นามสกุล',
				className: 'data-value',
			},
			{
				value: 'IDCardPassport',
				label: 'เลขบัตร/พาสปอร์ต',
				className: 'data-value',
			},
			{
				value: 'failHn',
				label: 'HN ที่ล้มแฟ้มแล้ว',
				className: 'data-value',
			},
		];
		switch (page) {
			case '2.1':
				return showAdmitSearch
					? defaultList
					: [
						...defaultList.filter(
							(i) => i.value !== 'An' && i.value !== 'notDC'
						),
						{
							value: 'parent',
							label: 'ค้นหาจากพ่อแม่',
							className: 'data-value',
						},
					];
			case '2.2':
				return [
					...defaultList.filter((i) => i.value !== 'An' && i.value !== 'notDC'),
					{
						value: 'parent',
						label: 'ค้นหาจากพ่อแม่',
						className: 'data-value',
					},
				];
			case '14.8':
				return defaultList.filter((i) => i.value !== 'notDC');
			case '15.2':
				return defaultList.filter((i) => i.value !== 'failHn');
			default:
				return showAdmitSearch
					? defaultList.filter(
						(i) => i.value !== 'failHn' && i.value !== 'notDC'
					)
					: defaultList.filter(
						(i) =>
							i.value !== 'An' && i.value !== 'failHn' && i.value !== 'notDC'
					);
		}
	};
	const [allSearchVisible, setAllSearchVisible] = useState(false);
	const [listAllSearchType, setListAllSearchType] = useState([]);
	const [allSearchTypeValue, setAllSearchTypeValue] = useState(null);
	const defaultAllSearchType = () => {
		let tempList = [
			{
				value: 'Hn',
				label: 'HN',
				className: 'data-value',
			},
			{
				value: 'An',
				label: 'AN',
				className: 'data-value',
			},
			{
				value: 'Name',
				label: 'ชื่อ-นามสกุล',
				className: 'data-value',
			},
			{
				value: 'FirstName',
				label: 'ชื่อ',
				className: 'data-value',
			},
			{
				value: 'LastName',
				label: 'นามสกุล',
				className: 'data-value',
			},
			{
				value: 'IDCardPassport',
				label: 'เลขบัตร/พาสปอร์ต',
				className: 'data-value',
			},
			{
				value: 'failHn',
				label: 'HN ที่ล้มแฟ้มแล้ว',
				className: 'data-value',
			},
		];
		switch (props?.allSearchType) {
			case `${props?.allSearchType}`:
				let findX = find(tempList, ['value', props?.allSearchType]);
				let filterX = filter(tempList, (o) => o.value !== props?.allSearchType);
				let concated = [findX, ...filterX];
				if (props?.opdipd === 'O') {
					concated = filter(concated, (o) => o.value !== 'An');
				}
				if (props?.hiddenAn) {
					concated = filter(concated, (o) => o.value !== 'An');
				}
				if (props?.page !== '14.8') {
					concated = filter(concated, (o) => o.value !== 'failHn');
				}
				setAllSearchTypeValue(props?.allSearchType);
				setListAllSearchType(concated);
				break;
			default:
				break;
		}
	};
	useEffect(() => {
		if (props?.allSearchType && props?.allSearch) {
			defaultAllSearchType();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.allSearchType]);
	const [keywordForAllSearch, setKeywordForAllSearch] = useState(null);
	const [patientBySelectAllSearch, setPatientBySelectAllSearch] =
		useState(null);
	const [listPatientByAllSearch, setListPatientByAllSearch] = useState([]);
	const [countPatientAllSearch, setCountPatientAllSearch] = useState(0);
	const [patientDetail, setPatientDetail] = useState(null);
	const onSelectAnAllSearch = (
		record,
		admitList,
		patientDetails,
		serviceList = []
	) => {
		let tempRecord = {
			...record,
		};
		tempRecord.lastAn = admitList[0].an;
		setPatientBySelectAllSearch(record?.label);
		dispatch(
			allSearchDetail({
				patient: tempRecord,
				admitList: admitList,
				serviceList: serviceList,
				patientDetail: patientDetails || patientDetail,
			})
		);
		setPatientDetail(null);
	};
	const onSelectHnAllSearch = (record, serviceList, patientDetail) => {
		setPatientBySelectAllSearch(record?.label);
		let tempRecord = {
			...record,
		};
		tempRecord.lastServiceId = serviceList[0].serviceId;
		dispatch(
			allSearchDetail({
				patient: tempRecord,
				admitList: [],
				serviceList: serviceList,
				patientDetail: patientDetail,
			})
		);
	};
	const selectedPatientAllSearch = async (searchType, params, keyWord) => {
		// console.log(searchType, params, keyWord)
		let resData = [];
		let resDataServices = [];
		let patientDetails = null;
		if (props?.getPatientDetail) {
			await axios
				.get(
					`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/` +
					params.patient.patientId
				)
				.then((res) => {
					patientDetails = res?.data?.responseData || null;
					setPatientDetail(patientDetails);
				})
				.catch((error) => {
					return error;
				});
		}
		switch (searchType) {
			case 'ipd':
				await Promise.all([
					(resData = await GetListAdmintsIdByPatient(params.patient.patientId)),
					(resDataServices = await GetListServicesIdByPatient(
						params.patient.patientId
					)),
				]);
				resData = resData.map((val) => {
					return {
						...val,
						opdipd: 'I',
						displayName: params.patient.fullName,
						idCard: params.patient.idCard,
						label: params.patient.fullName + ' AN ' + val?.an,
					};
				});
				resDataServices = resDataServices.map((val) => {
					return {
						...val,
						opdipd: 'O',
						displayName: params.patient.displayName,
						idCard: params.patient.idCard,
						picture: params.patient.picture,
						label: params.patient.displayName + ' HN ' + val?.hn,
					};
				});
				dispatch(selectAdmitList(uniqBy(resData, 'serviceId')));
				if (resData?.length === 1) {
					//ค้นเจอ 1 AN
					onSelectAnAllSearch(
						resData[0],
						resData,
						patientDetails,
						resDataServices
					);
				}
				if (resData?.length > 1) {
					//ค้นเจอ หลาย AN
					if (allSearchTypeValue === 'An') {
						//ค้นหาด้วยการระบุ AN
						let selected = find(resData, ['an', keyWord]);
						onSelectAnAllSearch(
							selected,
							resData,
							patientDetails,
							resDataServices
						);
					} else {
						if (props?.lastSelect) {
							//ไม่ใด้ค้นหาด้วยการระบุ AN
							onSelectAnAllSearch(
								resData[0],
								resData,
								patientDetails,
								resDataServices
							);
						} else {
							selectIPDAllSearchRef?.current?.setIsVisible(true);
						}
					}
				}
				break;
			case 'opd':
				resData = await GetListServicesIdByPatient(params.patient.patientId);
				resData = resData.map((val) => {
					return {
						...val,
						opdipd: 'O',
						displayName: params.patient.displayName,
						idCard: params.patient.idCard,
						picture: params.patient.picture,
						label: params.patient.displayName + ' HN ' + val?.hn,
					};
				});
				dispatch(selectServiceList(uniqBy(resData, 'serviceId')));
				switch (resData?.length) {
					case 0:
						//ค้นไม่เจอ
						setPatientBySelectAllSearch(params.patient.displayName);
						selectRef?.current?.blur();
						notificationY(false, 'ผู้ป่วยยังไม่เคย Visit');
						dispatch(
							allSearchDetail({
								patient: params.patient,
								admitList: [],
								serviceList: [],
								patientDetail: null,
							})
						);
						break;
					case 1:
						//ค้นเจอ 1
						onSelectHnAllSearch(resData[0], resData, patientDetails);
						break;
					default:
						//ค้นเจอมากกว่า 1
						if (props?.lastSelect) {
							onSelectHnAllSearch(resData[0], resData, patientDetails);
						} else {
							selectOPDAllSearchRef?.current?.setIsVisible(true);
						}
						break;
				}
				break;
			default:
				// console.log("defalft", patientDetail);
				setPatientBySelectAllSearch(params.value);
				let listAdmit = await GetListAdmintsIdByPatient(
					params.patient.patientId
				);
				listAdmit = listAdmit.map((val) => {
					return {
						...val,
						displayName: params.patient.displayName,
						idCard: params.patient.idCard,
						label: params.patient.displayName + ' AN ' + val?.an,
					};
				});
				dispatch(selectAdmitList(listAdmit));
				let listService = await GetListServicesIdByPatient(
					params.patient.patientId
				);
				listService = listService.map((val) => {
					return {
						...val,
						displayName: params.patient.displayName,
						idCard: params.patient.idCard,
						picture: params.patient.picture,
						label: params.patient.displayName + ' HN ' + val?.hn,
					};
				});
				dispatch(selectServiceList(uniqBy(listService, 'serviceId')));
				let tempRecord = {
					...params,
				};
				tempRecord.patient.lastAn = listAdmit[0]?.an || null;
				tempRecord.patient.lastServiceId = listService[0]?.serviceId || null;
				tempRecord.patient.opdipd = null;
				dispatch(
					allSearchDetail({
						patient: tempRecord.patient,
						admitList: listAdmit,
						serviceList: listService,
						patientDetail: patientDetails,
					})
				);
				break;
		}
		switch (props?.page) {
			case '7.2':
				history.push({
					pathname: '/opd clinic/opd-clinic-screening',
				});
				break;
			case '9.3':
				history.push({
					pathname: '/dental/dental-screening',
				});
				break;
			case '10.2':
				history.push({
					pathname: '/doctor%20clinic/doctor-clinic-take-history',
				});
				break;
			case '28.8':
				if (searchType == 'opd') {
					history.push({
						pathname: '/chemotherapy/chemotherapy-opd-combo',
					});
				} else {
					history.push({
						pathname: '/chemotherapy/chemotherapy-ipd-combo',
					});
				}
				break;
			default:
				if (historyTo) history.push({ pathname: historyTo });
				break;
		}
	};
	const countPatientByKeyword = async (keyword, type, opdipd) => {
		let requestForCount = {
			mode: null,
			user: null,
			ip: null,
			lang: null,
			branch_id: null,
			requestData: {
				key: keyword,
				searchBy: type,
			},
			barcode: null,
		};
		let count = 0;
		switch (opdipd) {
			case 'I':
				count = await GetTotalAdmitsSearch(requestForCount);
				break;
			default:
				count = await GetCountPatientsSearch(requestForCount);
				break;
		}
		setCountPatientAllSearch(count || 0);
	};
	const searchAll = (keyWord, searchBy) => {
		// console.log('searchAll :>> ', keyWord);
		let requestForFetch = {
			mode: null,
			user: null,
			ip: null,
			lang: null,
			branch_id: null,
			requestData: {
				key: keyWord,
				startRow: '0',
				endRow: '100',
				searchBy: searchBy ? searchBy : allSearchTypeValue,
			},
			barcode: null,
		};
		const ipdSearch = async () => {
			setListPatientByAllSearch([]);
			setFetching(true);
			countPatientByKeyword(keyWord, allSearchTypeValue, 'I');
			let res = await GetAdmitsSearch(requestForFetch);
			// console.log(res);
			if (res?.length === 0) {
				//ค้นไม่เจอ
				if (selectType === 'notDC') {
					notificationY(false, 'ไม่พบข้อมูลผู้ป่วย Admit ที่ยังไม่ D/C');
				} else {
					notificationY(false, 'ไม่พบข้อมูลผู้ป่วย หรือผู้ป่วยยังไม่เคย Admit');
				}
				dispatch(
					allSearchDetail({
						patient: null,
						admitList: [],
						serviceList: [],
					})
				);
			}
			if (res.length > 0) {
				//ค้นเจอ Map Option
				let resTmp = [...res];
				let resFail = resTmp.filter((data) => data.deleteFlag === 'Y');
				let resNotFail = resTmp.filter((data) => data.deleteFlag !== 'Y');
				// console.log(resFail, resNotFail);
				if (resFail?.length > 0) {
					if (resFail?.length === res?.length) {
						notificationY(
							false,
							allSearchTypeValue === 'An' || allSearchTypeValue === 'notDC'
								? 'AN ถูกล้มแฟ้มแล้ว'
								: 'แฟ้มผู้ป่วยในทั้งหมดถูกล้มแล้ว'
						);
						res = await admitOption([]);
					} else {
						res = await admitOption(resNotFail);
					}
				} else {
					res = await admitOption(res);
				}
			}
			if (res.length === 1) {
				//ค้นเจอ 1 คน
				selectedPatientAllSearch('ipd', res[0], keyWord);
				setListPatientByAllSearch(res);
				selectRef?.current?.blur();
			}
			if (res.length > 1) {
				//ค้นเจอมากกว่า 1 คน
				setListPatientByAllSearch(res);
				setAllSearchVisible(true);
				// setOpenDropdown(true);
			}

			setFetching(false);
		};
		const opdSearch = async () => {
			setListPatientByAllSearch([]);
			setFetching(true);
			countPatientByKeyword(keyWord, allSearchTypeValue, 'O');
			let res = await patientSearch(requestForFetch);
			if (res?.length === 0) {
				//ค้นไม่เจอ
				notificationY(false, 'ไม่พบผู้ป่วย');
				dispatch(
					allSearchDetail({
						patient: null,
						admitList: [],
						serviceList: [],
					})
				);
			}
			if (res.length > 0) {
				res = await patientOption(res);
			}
			if (res.length === 1) {
				//ค้นเจอ 1 ค้น
				selectedPatientAllSearch('opd', res[0]);
				setListPatientByAllSearch(res);
				selectRef?.current?.blur();
			}
			if (res.length > 1) {
				//ค้นเจอมากกว่า 1 คน
				setListPatientByAllSearch(res);
				setAllSearchVisible(true);
				// setOpenDropdown(true);
			}

			setFetching(false);
		};
		const allSearch = async () => {
			setListPatientByAllSearch([]);
			setFetching(true);
			countPatientByKeyword(keyWord, allSearchTypeValue, 'All');
			let res = await patientSearch(requestForFetch);
			if (res?.length === undefined) {
				notificationY(false, 'ไม่พบข้อมูลผู้ป่วย');
				setFetching(false);
				return;
			}
			if (res?.length === 0) {
				//ค้นไม่เจอ
				notificationY(false, 'ไม่พบข้อมูลผู้ป่วย');
				dispatch(
					allSearchDetail({
						patient: null,
						admitList: [],
						serviceList: [],
					})
				);
			}
			if (res?.length > 0) {
				res = await patientOption(res);
			}
			if (res?.length === 1) {
				//ค้นเจอ 1 ค้น
				selectedPatientAllSearch('all', res[0]);
				setListPatientByAllSearch(res);
				selectRef?.current?.blur();
			}
			if (res?.length > 1) {
				//ค้นเจอมากกว่า 1 คน
				setListPatientByAllSearch(res);
				setAllSearchVisible(true);
			}
			setFetching(false);
		};
		if (allSearchTypeValue === 'An') {
			keyWord && ipdSearch(keyWord);
		}
		if (allSearchTypeValue !== 'An') {
			switch (props?.opdipd) {
				case 'I':
					keyWord && ipdSearch(keyWord);
					break;
				case 'O':
					keyWord && opdSearch(keyWord);
					break;
				default:
					keyWord && allSearch(keyWord);
					break;
			}
		}
	};
	const searchAllMore = (keyWord) => {
		// console.log('searchAll :>> ', keyWord);
		let requestForFetch = {
			mode: null,
			user: null,
			ip: null,
			lang: null,
			branch_id: null,
			requestData: {
				key: keyWord,
				startRow: String(listPatientByAllSearch.length),
				endRow: String(listPatientByAllSearch.length + 100),
				searchBy: allSearchTypeValue,
			},
			barcode: null,
		};
		const ipdSearch = async () => {
			// setListPatientByAllSearch([]);
			setFetching(true);
			let res = await GetAdmitsSearch(requestForFetch);
			// console.log(resData);
			if (res.length > 0) {
				//ค้นเจอ Map Option
				res = await admitOption(res);
			}
			setListPatientByAllSearch((prev) => [...prev, ...res]);
			setFetching(false);
		};
		const opdSearch = async () => {
			// setListPatientByAllSearch([]);
			setFetching(true);
			let res = await patientSearch(requestForFetch);
			if (res.length > 0) {
				res = await patientOption(res);
			}
			setListPatientByAllSearch((prev) => [...prev, ...res]);
			setFetching(false);
		};
		const allSearch = async () => {
			// setListPatientByAllSearch([]);
			setFetching(true);
			let res = await patientSearch(requestForFetch);
			if (res.length > 0) {
				res = await patientOption(res);
			}
			setListPatientByAllSearch((prev) => [...prev, ...res]);
			setFetching(false);
		};
		if (allSearchTypeValue === 'An') {
			keyWord && ipdSearch(keyWord);
		}
		if (allSearchTypeValue !== 'An') {
			switch (props?.opdipd) {
				case 'I':
					keyWord && ipdSearch(keyWord);
					break;
				case 'O':
					keyWord && opdSearch(keyWord);
					break;
				default:
					keyWord && allSearch(keyWord);
					break;
			}
		}
	};
	const PartsNotiDocOrder = () => {
		return (
			<li hidden={!ShowBtnViewFileScan}>
				<Tooltip title="เอกสารใบสั่งยาจากหอผู้ป่วย">
					<Badge size="small" count={countDocOrder} offset={[-10, 3]} showZero>
						<Button
							style={{ marginBottom: 0 }}
							size="small"
							icon={<FileTextOutlined />}
							onClick={(e) => {
								e.stopPropagation();
								if (countDocOrder === '0') return;
								document.getElementById('sidebar-right-hidden').click();
							}}
						/>
					</Badge>
				</Tooltip>
			</li>
		);
	};
	const PartsNotiConsult = () => {
		return (
			<li hidden={!ShowBtnOutConsult}>
				<BtnNotiOutConsult
					page={props?.page || null}
					showBtnOutConsult={ShowBtnOutConsult}
				/>
			</li>
		);
	};
	const PartsNotiSetOr = () => {
		// const hidden = !pathname?.includes("/operation room/")
		return (
			<li>
				<BtnNotiSetOr></BtnNotiSetOr>
			</li>
		);
	};
	const PartsHRM = () => {
		return (
			<a
				href="https://hrms42.thai-nrls.org/HRMS10829/Account/Login"
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					src="https://hrms42.thai-nrls.org/HRMS10829/Images/hrms-oncloud.png"
					alt="HRMS OnCloud"
					style={{ width: '30px', height: 'auto', marginLeft: 'auto' }}
				/>
			</a>
		);
	};
	return (
		<Header
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				boxShadow: 'none!important',
				display: 'block',
			}}
		>
			<Row
				gutter={[2, 2]}
				align="middle"
				style={{
					display: 'flex' /* ,justifyContent:"space-evenly" */,
					justifyContent: 'space-around',
					height: '100%',
				}}
			>
				<NavCollapsed />
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						whiteSpace: 'nowrap',
						color: 'gainsboro',
					}}
				>
					{`V. ${env.REACT_APP_VERSION}`}
				</div>
				{/* TypeSelectSearch */}
				{showPatientType ? (
					<Col
						span={3}
						style={{
							display: 'flex',
							alignItems: 'center' /* ,padding:"0" */,
						}}
						hidden={!showPatientType}
					>
						<Select
							style={{
								width: '100%',
							}}
							onChange={(value) => {
								setPatientType(value);
								setSearchList([]);
								setStartRowSearch('0');
								setKeywordForSearch(null);
								setSearchSelected(null);
								setCountForSearch(null);
								setCheckSearchOnSelect(false);
								dispatch(patientTypee(value));
							}}
							value={patientType}
						>
							<Option value="opd">OPD</Option>
							<Option value="ipd">IPD</Option>
						</Select>
					</Col>
				) : null}
				<Col
					span={3}
					style={{
						display: 'flex',
						alignItems: 'center' /* ,padding:"0" */,
					}}
				>
					{props?.allSearch && (
						<Select
							style={{
								width: '100%',
								margin: 0,
							}}
							value={allSearchTypeValue}
							onChange={(v) => {
								setAllSearchTypeValue(v);
							}}
							dropdownMatchSelectWidth={175}
							options={listAllSearchType}
							className="data-value"
						/>
					)}
					{showPatientSearch || showAdmitSearch || searchOpdPatientShow ? (
						<Select
							// style={{ width: "100%", marginTop: btnScan ? 15 : 0 }}
							style={{
								width: '100%',
								margin: 0,
							}}
							onChange={(value) => {
								setSelectType(value);
								if (showPatientSearch && searchOpdPatientShow) {
									//ClearPatientSearch
									setPatienstList([]);
									setStartRowPatientSearch('0');
									setKeywordForPatientSearch(null);
									setPatientSelected(null);
									setCountForPatientSearch(null);
									setCheckOnSelect(false);
								}
								if (showAdmitSearch) {
									//ClearAdmitSearch
									setAdmitList([]);
									setStartRowAdmitSearch('0');
									setKeywordForAdmitSearch(null);
									setAdmitSelected(null);
									setCountForAdmitSearch(null);
									setCheckAdmitOnSelect(false);
								}
							}}
							value={selectType}
							options={optionType()}
						>
							{/* <Option value="Hn">HN</Option>
                {showAdmitSearch && <Option value="An">AN</Option>}
                <Option value="Name">ชื่อ</Option>
                <Option value="IDCardPassport">เลขบัตร/พาสปอร์ต</Option>
                {pathname === "/registration/registration-patient-register" && (
                  <Option value="failHn">HN ที่ล้มแฟ้มแล้ว</Option>
                )} */}
							{/* <OptionType/> */}
						</Select>
					) : null}
					{props.OtherSearch && <Col>{props.OtherSearch}</Col>}
				</Col>
				<Col
					span={width < TAB_SIZE ? 5 : 6}
					// style={{ padding: 0 }}
					style={{
						width: '100%',
						margin: 0,
					}}
				>
					{/* Patient Search */}
					<div
						hidden={!showPatientSearch && !searchOpdPatientShow}
						// style={{ width: "100%", marginTop: btnScan ? 15 : 0 }}
						style={{
							width: '100%',
							margin: 0,
						}}
					>
						<Select
							ref={selectRef}
							loading={fetching}
							className="data-value"
							style={{
								width: '100%',
							}}
							value={patientSelected}
							placeholder={
								selectType === 'Name'
									? 'ค้นหาด้วยชื่อ นามสกุล'
									: selectType === 'Hn'
										? 'ค้นหาด้วยเลข HN'
										: selectType === 'failHn'
											? 'ค้นหาด้วยเลข HN ที่ล้มแฟ้มแล้ว'
											: selectType === 'IDCardPassport' &&
											'ค้นหาด้วยเลขบัตร/พาสปอร์ต'
							}
							showSearch
							filterOption={false}
							defaultActiveFirstOption={false}
							suffixIcon={
								<span>
									<SearchOutlined
										className="gx-text-primary"
										style={{
											fontSize: '16px',
										}}
										onClick={() => {
											if (
												keywordForPatientSearch !== null &&
												!fetching &&
												!checkOnSelect
											) {
												setStartRowPatientSearch('0');
												setPatientSelected(keywordForPatientSearch);
												if (keywordForPatientSearch !== patientSelected)
													searchPatiens(keywordForPatientSearch);
											}
										}}
									/>
								</span>
							}
							onSearch={(value) => {
								if (value === '') {
									setKeywordForPatientSearch(patientSelected); //setkeyword to showkeyword in modal
								} else {
									setCheckOnSelect(false);
									setKeywordForPatientSearch(value);
								}
							}}
							onInputKeyDown={(e) => {
								dispatch(smartCardClear());
								if (e.key === 'Enter' && !fetching && !checkOnSelect) {
									setOpenDropdown(true);
									setStartRowPatientSearch('0');
									setPatientSelected(e.target.value);
									setKeywordForPatientSearch(e.target.value);
									if (e.target.value === '') {
										setKeywordForPatientSearch(patientSelected);
										setPatientSelected(patientSelected);
									}
									if (keywordForPatientSearch !== patientSelected)
										searchPatiens(e.target.value);
								}
							}}
							open={openDropdown}
							onClick={() => {
								if (!openDropdown) setOpenDropdown(true);
							}}
							onBlur={() => {
								selectRef.current.blur();
								setTimeout(() => setOpenDropdown(false), 500);
							}} //setTimeout because showmodal before closeDropdown
							dropdownRender={(items) => (
								<div>
									<div>
										<Spin spinning={fetching} size="small">
											{items}
										</Spin>
									</div>
									<div
										className="text-center mt-2 pt-2"
										style={{
											marginBottom: '-12px',
											backgroundColor: '#E8F5E9',
										}}
									>
										<Button
											disabled={!patientSelected || fetching}
											type="primary"
											onClick={() => setIsModalVisible(true)}
										>
											ดูรายการเพิ่มเติม
										</Button>
									</div>
								</div>
							)}
							// notFoundContent={fetching ? <Spin size="small" /> : null}
							onChange={(val, option) => {
								setOpenDropdown(false);
								setCheckOnSelect(true); //Edit bug icon search
								if (showPatientSearch) {
									onSelectPatient(val);
								}
								if (searchOpdPatientShow) {
									onSelectOpd(val, option);
								}
							}}
							options={map(patienstList, (n) => ({
								value: n?.id,
								label: n?.label,
								patient: n?.patient,
							}))}
						/>
					</div>

					{/* Admit Search */}
					<div
						hidden={!showAdmitSearch}
						// style={{ width: "100%", marginTop: btnScan ? 15 : 0 }}
						style={{
							width: '100%',
							margin: 0,
						}}
					>
						<Select
							ref={selectAdmitRef}
							loading={fetching}
							style={{
								width: '100%',
							}}
							value={admitSelected}
							placeholder={
								selectType === 'Name'
									? 'ค้นหาด้วยชื่อ นามสกุล'
									: selectType === 'Hn'
										? 'ค้นหาด้วยเลข HN'
										: selectType === 'An' || selectType === 'notDC'
											? 'ค้นหาด้วยเลข AN'
											: selectType === 'IDCardPassport' &&
											'ค้นหาด้วยเลขบัตร/พาสปอร์ต'
							}
							showSearch
							defaultActiveFirstOption={false}
							filterOption={false}
							suffixIcon={
								<span>
									<SearchOutlined
										style={{
											fontSize: '16px',
											color: 'var(--primary-color)',
										}}
										onClick={() => {
											if (
												keywordForAdmitSearch !== null &&
												!fetching &&
												!checkAdmitOnSelect
											) {
												setStartRowAdmitSearch('0');
												setAdmitSelected(keywordForAdmitSearch);
												if (keywordForAdmitSearch !== admitSelected) {
													searchAdmit(keywordForAdmitSearch);
												}
											}
										}}
									/>
								</span>
							}
							onSearch={(value) => {
								if (value === '') {
									setKeywordForAdmitSearch(admitSelected); //setkeyword to showkeyword in modal
								} else {
									setCheckAdmitOnSelect(false);
									setKeywordForAdmitSearch(value);
								}
							}}
							onInputKeyDown={(e) => {
								if (e.key === 'Enter' && !fetching && !checkAdmitOnSelect) {
									setOpenDropdown(true);
									setStartRowAdmitSearch('0');
									setAdmitSelected(e.target.value);
									setKeywordForAdmitSearch(e.target.value);
									if (e.target.value === '') {
										setKeywordForAdmitSearch(admitSelected);
										setAdmitSelected(admitSelected);
									}
									if (keywordForAdmitSearch !== admitSelected)
										searchAdmit(e.target.value);
								}
							}}
							open={openDropdown}
							onClick={() => {
								if (!openDropdown) setOpenDropdown(true);
							}}
							/* onClick={()=> setOpenDropdown(!openDropdown) } */ onBlur={() => {
								selectAdmitRef.current.blur();
								setTimeout(() => setOpenDropdown(false), 500);
							}} //setTimeout because showmodal before closeDropdown
							dropdownRender={(items) => (
								<div>
									<div>
										<Spin spinning={fetching} size="small">
											{items}
										</Spin>
									</div>
									<div
										className="text-center mt-2 pt-2"
										style={{
											marginBottom: '-12px',
											backgroundColor: '#E8F5E9',
										}}
									>
										<Button
											disabled={!admitSelected || fetching}
											type="primary"
											onClick={() => setAdmitVisible(true)}
										>
											ดูรายการเพิ่มเติม
										</Button>
									</div>
								</div>
							)}
							// notFoundContent={fetching ? <Spin size="small" /> : null}
							onChange={(val, option) => {
								// console.log(val);
								setOpenDropdown(false);
								setCheckAdmitOnSelect(true); //Edit bug icon search
								onSelectAdmit(val, option);
							}}
							options={admitList?.map((n) => ({
								// value: n.value,
								value: n?.patientId,
								label: n?.label,
								patient: n?.patient,
							}))}
						/>
					</div>
					{/* Drug Search */}
					<div
						hidden={!showDrugSearch}
						// style={{ width: "100%", marginTop: btnScan ? 15 : 0 }}
						style={{
							width: '100%',
							margin: 0,
						}}
					>
						<Select
							value={selectSearchDrug || onDrugSearchInput}
							onInput={(e) => {
								setOpenDropdown(true);
								setFetching(true);
								setOnDrugSearchInput(e.target.value);
								setChkOnPopupScroll(false);
								// setStartRowDrugSearch(0);
								// setEndRowDrugSearch(20);
							}}
							onSearch={debounceDrugSearch}
							onClick={() => {
								if (selectSearchDrug) {
									setOpenDropdown(true);
								}
							}}
							onPopupScroll={(e) => {
								let target = e.target;
								if (
									Math.ceil(target.scrollTop) + target.offsetHeight >=
									target.scrollHeight
								) {
									// console.log(endRowDrugSearch, "endRowDrugSearch");
									if (chkOnPopupScroll) {
										let endrowNext = endRowDrugSearch + 20;
										let startRowNext = endRowDrugSearch + 1;
										setStartRowDrugSearch(startRowNext);
										setEndRowDrugSearch(endrowNext);
										searchDrug(onDrugSearchInput, startRowNext, endrowNext);
									}
								}
							}}
							loading={fetching}
							style={{
								width: '100%',
							}}
							placeholder={'ค้นหา รหัส/ชื่อยา'}
							showSearch
							defaultActiveFirstOption={false}
							filterOption={false}
							suffixIcon={
								<span>
									<SearchOutlined
										style={{
											fontSize: '16px',
											color: '#00C853',
											cursor: 'default',
										}}
									/>
								</span>
							}
							open={openDropdown}
							onBlur={() => {
								if (!selectSearchDrug) {
									setOnDrugSearchInput(null);
								}
								setOpenDropdown(false);
								// selectAdmitRef.current.blur();
								// setTimeout(() => setOpenDropdown(false), 500);
							}} //setTimeout because showmodal before closeDropdown
							dropdownRender={(items) => (
								<div>
									<div>
										<Spin spinning={fetching} size="small">
											{items}
										</Spin>
									</div>
								</div>
							)}
							// notFoundContent={fetching ? <Spin size="small" /> : null}
							onSelect={(val, option) => {
								// console.log("TTT");
								setTimeout(() => {
									setOpenDropdown(false);
								}, 100);
								getDrugInfoFromSearch(val);
								setSelectSearchDrug(val);
							}}
							options={matchSorter(
								listDrug.map((e) => ({
									value: e.expenseId,
									label: e.displayName,
									// patient: e.patient,
								})),
								onDrugSearchInput?.toLowerCase(),
								{
									keys: ['value', 'label'],
								}
							)}
						/>
					</div>

					{/* All Search */}
					<div
						hidden={!props?.allSearch}
						// style={{ width: "100%", marginTop: btnScan ? 15 : 0 }}
						style={{
							width: '100%',
							margin: 0,
						}}
					>
						<Select
							ref={selectRef}
							loading={fetching}
							style={{
								width: '100%',
							}}
							dropdownMatchSelectWidth={400}
							value={patientBySelectAllSearch}
							placeholder={
								allSearchTypeValue === 'Name'
									? 'ค้นหาด้วยชื่อ นามสกุล'
									: allSearchTypeValue === 'Hn'
										? 'ค้นหาด้วยเลข HN'
										: allSearchTypeValue === 'An'
											? 'ค้นหาด้วยเลข AN'
											: allSearchTypeValue === 'IDCardPassport' &&
											'ค้นหาด้วยเลขบัตร/พาสปอร์ต'
							}
							showSearch
							filterOption={false}
							defaultActiveFirstOption={false}
							suffixIcon={
								<span>
									<SearchOutlined
										className="gx-text-primary"
										style={{
											fontSize: '16px',
										}}
										onClick={() => {
											if (
												keywordForAllSearch !== null &&
												!fetching &&
												!checkOnSelect
											) {
												setPatientBySelectAllSearch(keywordForAllSearch);
												if (keywordForAllSearch !== patientBySelectAllSearch)
													searchAll(keywordForAllSearch);
											}
										}}
									/>
								</span>
							}
							onSearch={(value) => {
								if (value === '') {
									setKeywordForAllSearch(patientBySelectAllSearch); //setkeyword to showkeyword in modal
								} else {
									setCheckOnSelect(false);
									setKeywordForAllSearch(value);
								}
							}}
							onInputKeyDown={(e) => {
								if (e.key === 'Enter' && !fetching && !checkOnSelect) {
									setOpenDropdown(true);
									setPatientBySelectAllSearch(e.target.value);
									setKeywordForAllSearch(e.target.value);
									if (e.target.value === '') {
										setKeywordForAllSearch(patientBySelectAllSearch);
										setPatientBySelectAllSearch(patientBySelectAllSearch);
									}
									if (keywordForAllSearch !== patientBySelectAllSearch)
										searchAll(e.target.value);
								}
							}}
							open={openDropdown}
							onClick={() => {
								if (!openDropdown) setOpenDropdown(true);
							}}
							onBlur={() => {
								selectRef.current.blur();
								setTimeout(() => setOpenDropdown(false), 500);
							}} //setTimeout because showmodal before closeDropdown
							dropdownRender={(items) => (
								<div>
									<div>
										<Spin spinning={fetching} size="small">
											{items}
										</Spin>
									</div>
									<div
										className="text-center mt-2 pt-2"
										style={{
											marginBottom: '-12px',
											backgroundColor: '#E8F5E9',
										}}
									>
										<Button
											disabled={
												fetching
													? fetching
													: countPatientAllSearch <=
													listPatientByAllSearch.length
											}
											type="primary"
											onClick={() => setAllSearchVisible(true)}
										>
											ดูรายการเพิ่มเติม
										</Button>
									</div>
								</div>
							)}
							// notFoundContent={fetching ? <Spin size="small" /> : null}
							onChange={(val, option) => {
								setOpenDropdown(false);
								setCheckOnSelect(true); //Edit bug icon search
								let searchType = null;
								if (allSearchTypeValue === 'An') {
									searchType = 'ipd';
								} else {
									switch (props?.opdipd) {
										case 'I':
											searchType = 'ipd';
											break;
										case 'O':
											searchType = 'opd';
											break;
										default:
											break;
									}
								}
								selectedPatientAllSearch(searchType, option);
							}}
							options={listPatientByAllSearch}
						/>
					</div>
				</Col>
				{/* Button Scan */}
				<Col
					span={!showPatientType ? 7 : 4}
					style={{
						display: 'inline-block',
					}}
					className="text-center"
				>
					<Tooltip placement="bottom" title="Card">
						<Button
							size="small"
							style={{
								margin: 'auto',
								backgroundColor: SmartCardReading
									? 'rgba(145, 219, 145, 0.65)'
									: null,
							}}
							// type={SmartCardReading ? "primary" : null}
							hidden={!btnScan}
							onClick={() => {
								SmartCardReader();
								dispatch(smartCardClear());
								dispatch(clearShowMessage());
							}}
							icon={
								<IdcardOutlined
									className="gx-text-primary pointer"
									hidden={!btnScan}
									style={{
										fontSize: '16px',
									}}
								/>
							}
						></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="Neo Hosp">
						<Button
							size="small"
							style={{
								margin: 'auto',
								marginLeft: '6px',
							}}
							hidden={!props?.NeoHosp}
							onClick={() => {
								const ws = new WebSocket('ws://localhost:8100');
								if (
									patient.patient.selectPatient &&
									patient?.patient?.selectPatient?.hn
								) {
									let pattern = patient.patient.selectPatient.hn.split('/')[1];
									for (
										let i = 2;
										i <
										9 - patient.patient.selectPatient.hn.split('/')[0].length;
										i++
									) {
										pattern += '0';
									}
									pattern += patient.patient.selectPatient.hn.split('/')[0];
									ws.onopen = function () {
										ws.send(
											JSON.stringify({
												Type: 'IE',
												Url: `${env.REACT_APP_PANACEA_NHSO}/external-view.aspx?HN=${pattern}`,
											})
										);
									};
									ws.onmessage = function (event) {
										console.log(event);
									};
								} else if (
									patient.opdPatientDetail.opdPatientDetail &&
									patient?.opdPatientDetail?.opdPatientDetail?.hn
								) {
									// console.log("opdPatientDetail");
									let pattern =
										patient.opdPatientDetail.opdPatientDetail.hn.split('/')[1];
									for (
										let i = 2;
										i <
										9 -
										patient.opdPatientDetail.opdPatientDetail.hn.split('/')[0]
											.length;
										i++
									) {
										pattern += '0';
									}
									pattern +=
										patient.opdPatientDetail.opdPatientDetail.hn.split('/')[0];
									ws.onopen = function () {
										ws.send(
											JSON.stringify({
												Type: 'IE',
												Url: `${env.REACT_APP_PANACEA_NHSO}/external-view.aspx?HN=${pattern}`,
											})
										);
									};
									ws.onmessage = function (event) {
										console.log(event);
									};
								} else {
									axios
										.get(
											`${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/${patient.admitDischarge.message}`
										)
										.then((res) => {
											let pattern = res.data.responseData.hn.split('/')[1];
											for (
												let i = 2;
												i < 9 - res.data.responseData.hn.split('/')[0].length;
												i++
											) {
												pattern += '0';
											}
											pattern += res.data.responseData.hn.split('/')[0];
											ws.onopen = function () {
												ws.send(
													JSON.stringify({
														Type: 'IE',
														Url: `${env.REACT_APP_PANACEA_NHSO}/external-view.aspx?HN=${pattern}`,
													})
												);
											};
											ws.onmessage = function (event) {
												console.log(event);
											};
										});
								}
							}}
							icon={
								<EyeOutlined
									className="gx-text-primary pointer"
									hidden={!btnScan}
									style={{
										fontSize: '16px',
									}}
								/>
							}
						></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="Views">
						<Popover
							style={{
								zIndex: '900px!important',
							}}
							placement="bottomLeft"
							content={<UserMenuOptions type={'view'} />}
							trigger="click"
						>
							<Button
								size="small"
								style={{
									margin: 'auto',
									marginLeft: '6px',
								}}
								hidden={!props?.Viewable}
								icon={
									<FileSearchOutlined
										className="gx-text-primary pointer"
										hidden={!props?.Viewable}
										style={{
											fontSize: '16px',
										}}
										onClick={() => { }}
									/>
								}
							></Button>
						</Popover>
					</Tooltip>
					<Tooltip placement="bottom" title="Scan">
						<Popover
							style={{
								zIndex: '900px!important',
							}}
							placement="bottomLeft"
							content={<UserMenuOptions type={'scan'} />}
							trigger="click"
						>
							<Button
								size="small"
								style={{
									margin: 'auto',
									marginLeft: '6px',
								}}
								hidden={!props?.Scanable}
								icon={
									<FileAddOutlined
										className="gx-text-primary pointer"
										hidden={!props?.Scanable}
										style={{
											fontSize: '16px',
										}}
										onClick={() => { }}
									/>
								}
							></Button>
						</Popover>
					</Tooltip>
					<Tooltip placement="bottom" title="Heart Stream">
						<Button
							size="small"
							style={{
								margin: 'auto',
								marginLeft: '6px',
							}}
							hidden={!btnScan || !checkPath}
							onClick={() => {
								let hn = null;
								switch (props.page) {
									case '11.6':
										hn = patient?.patient?.selectPatient?.hn?.split('/')[0];
										break;
									case '10.3':
										hn = reduxOpd?.opdPatientDetail?.hn?.split('/')[0];
										break;
									default:
										hn = allSearch.patientDetail?.runHn;
										break;
								}
								if (!hn) return;
								window.open(
									`${env.REACT_APP_PANACEA_HEART}/guestpass.aspx?hn=${hn}`,
									'_blank'
								);
								// if (reduxPatient?.patient?.selectPatient) {
								//   window.open(
								//     `${
								//       process.env.REACT_APP_PANACEA_HEART
								//     }/guestpass.aspx?hn=${
								//       patient.patient.selectPatient.hn.split("/")[0]
								//     }`,
								//     "_blank"
								//   );
								// } else if (reduxOpd?.opdPatientDetail?.opdPatientDetail) {
								//   window.open(
								//     `${
								//       process.env.REACT_APP_PANACEA_HEART
								//     }/guestpass.aspx?hn=${
								//       patient.patient.selectPatient.hn.split("/")[0]
								//     }`,
								//     "_blank"
								//   );
								// }
								// else {
								//   axios
								//     .get(
								//       `${process.env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatients/${message}`
								//     )
								//     .then((res) => {
								//       window.open(
								//         `${
								//           process.env.REACT_APP_PANACEA_HEART
								//         }/guestpass.aspx?hn=${
								//           res.data.responseData.hn.split("/")[0]
								//         }`,
								//         "_blank"
								//       );
								//       // %2F${res.data.responseData.hn.split("/")[1]}
								//     });
								// }
							}}
							icon={
								<HeartOutlined
									className="gx-text-primary pointer"
									hidden={!btnScan}
									style={{
										fontSize: '16px',
									}}
								/>
							}
						></Button>
					</Tooltip>
					<Tooltip placement="bottom" title="ดู PAC">
						<Button
							size="small"
							style={{
								margin: 'auto',
								marginLeft: '6px',
							}}
							hidden={!btnPac || !checkPath}
							onClick={() => {
								let hn = null;
								let fullHn = null;
								switch (props.page) {
									case '11.6':
										fullHn = patient?.patient?.selectPatient?.hn;
										hn = patient?.patient?.selectPatient?.hn?.split('/')[0];
										break;
									case '10.3':
										fullHn = reduxOpd?.opdPatientDetail?.hn;
										hn = reduxOpd?.opdPatientDetail?.hn?.split('/')[0];
										break;
									default:
										fullHn = allSearch.patientDetail?.hn;
										hn = allSearch.patientDetail?.runHn;
										break;
								}
								if (!hn) return;
								const ws = new WebSocket('ws://localhost:8100');
								GetParamURL(
									userId,
									encodeURIComponent(allSearch?.patientDetail?.runHn)
								).then((data) => {
									console.log(data);
									ws.onopen = function () {
										ws.send(
											JSON.stringify({
												Type: 'IE',
												Url: data.result,
											})
										);
									};
									ws.onmessage = function (event) {
										console.log(event);
										ws.close();
									};
								});
							}}
						// icon={
						// 	<div
						// 		style={{
						// 			position: 'relative',
						// 			height: 36,
						// 		}}
						// 	>
						// 		<div
						// 			style={{
						// 				position: 'absolute',
						// 				left: 5,
						// 				top: 4,
						// 				height: 25,
						// 			}}
						// 		>
						// 			<Icon
						// 				icon="ion:man-outline"
						// 				className="gx-text-primary pointer"
						// 				hidden={!btnPac}
						// 				style={{
						// 					display: 'block',
						// 				}}
						// 				width={25}
						// 			/>
						// 		</div>
						// 		<DivBorderPrimaryColor
						// 			style={{
						// 				position: 'absolute',
						// 				zIndex: 99,
						// 				backgroundColor: 'white',
						// 				height: 14,
						// 				top: '33%',
						// 				left: '21%',
						// 				width: '60%',
						// 			}}
						// 		>
						// 			<Icon
						// 				icon="fa-solid:x-ray"
						// 				className="gx-text-primary pointer"
						// 				style={{
						// 					fontSize: '13px',
						// 					marginLeft: 1.5,
						// 					display: 'block',
						// 				}}
						// 			/>
						// 		</DivBorderPrimaryColor>
						// 	</div>
						// }
						>
							<label className="gx-text-primary">PAC</label>
						</Button>
					</Tooltip>
					<Tooltip placement="bottom" title="ดูประวัติ HIS เดิม">
						<Button
							size="small"
							style={{
								margin: 'auto',
								marginLeft: '6px',
							}}
							hidden={props?.Hisold}
							onClick={() => {
								const ws = new WebSocket('ws://localhost:8300');
								ws.onopen = function () {
									ws.send(
										JSON.stringify({
											Type: 'IE',
											Url: `http://localhost:8300/apiClient/Wia/OpenHimpo`,
										})
									);
								};
								ws.onmessage = function (event) {
									console.log('event', event);
								};
								axios
									.get(`http://localhost:8300/apiClient/Wia/OpenHimpo`)
									.then(() => {
										ws.onopen = function () {
											ws.send(
												JSON.stringify({
													Type: 'IE',
													Url: `http://localhost:8300/apiClient/Wia/OpenHimpo`,
												})
											);
										};
										ws.onmessage = function (event) {
											console.log(event);
										};
									});
							}}
							icon={
								<ContainerTwoTone
									className="gx-text-primary pointer"
									style={{
										fontSize: '16px',
									}}
								/>
							}
						></Button>
					</Tooltip>
					{!pathname?.includes(
						'/risk management/risk-management-dashboard-workid'
					) || PartsHRM()}
				</Col>
				{/* Profile */}
				<Col
					span={width < TAB_SIZE ? 7 : 8}
					style={{
						padding: 0,
					}}
				>
					<Row justify="end" align="middle">
						<Col>
							<ul className="gx-header-notifications">
								<Auxiliary>
									<li
										hidden={true}
										className="gx-notify"
										style={{
											marginRight: 3,
											marginBottom: 3,
										}}
									>
										<Popover
											overlayClassName="gx-popover-horizantal"
											placement="bottomRight"
											content={<AppNotification />}
											trigger="click"
										>
											<span className="gx-pointer gx-d-block">
												<i className="icon icon-notification" />
											</span>
										</Popover>
									</li>
								</Auxiliary>
								{PartsNotiDocOrder()}
								{PartsNotiConsult()}
								{!pathname?.includes('/operation room/') || PartsNotiSetOr()}
								<li
									hidden={true}
									className="gx-language"
									style={{
										marginRight: 17,
									}}
								>
									<Popover
										overlayClassName="gx-popover-horizantal"
										placement="bottomRight"
										content={languageMenu()}
										trigger="click"
									>
										<span className="gx-pointer gx-flex-row gx-align-items-center">
											<i className={`flag flag-24 flag-${locale.icon}`} />
										</span>
									</Popover>
								</li>
								<div
									hidden={true}
									style={{ marginRight: '10px', marginTop: '10px' }}
								>
									<Popover
										placement="bottom"
										title={
											<Space>
												<BellOutlined
													style={{
														fontSize: 21,
													}}
												/>{' '}
												<div>Messenger</div>
											</Space>
										}
										content={<ContentMessenger />}
										trigger="click"
									>
										<Badge onClick={() => setBadgeCount(0)} count={badgeCount}>
											<MessageOutlined
												style={{ fontSize: 30, cursor: 'pointer' }}
											/>
										</Badge>
									</Popover>
								</div>
								<div>
									<Customizer />
								</div>
								<li className="gx-user-nav">
									<div
										style={{
											width: '100%',
										}}
									>
										<UserInfo />
									</div>
								</li>
								<div></div>
							</ul>
						</Col>
					</Row>
				</Col>
			</Row>

			{/*Modal Patint Search */}
			<Modal
				title={
					<label className="gx-text-primary">
						<b>ค้นหาข้อมูลผู้ป่วย</b>
					</label>
				}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={[
					<Row justify="center" key="footer">
						<Button key="ok" onClick={() => setIsModalVisible(false)}>
							ปิด
						</Button>
						<Button
							type="primary"
							onClick={fetchPatientMore}
							disabled={
								fetching ||
								(showSearch
									? countForPatientSearch === null
										? false
										: patienstList.length >= Number(countForPatientSearch)
											? true
											: false
									: countForSearch === null
										? false
										: searchList.length >= Number(countForSearch)
											? true
											: false)
							}
						>
							ดูรายการเพิ่มเติม
						</Button>
					</Row>,
				]}
				width="1000px"
				zIndex="2000"
				centered
			>
				<div className="mb-2">
					<label className="gx-text-primary me-1">
						<b>คำค้นหา</b> : "{' '}
						{showSearch ? keywordForPatientSearch : keywordForSearch} "
					</label>
					<label>
						( ผลการค้นหา "{' '}
						<label className="gx-text-primary">
							{showSearch ? patienstList.length : searchList.length}
						</label>{' '}
						" รายการ จากทั้งหมดทั้งหมด "{' '}
						<label className="gx-text-primary">
							<Spin spinning={countFetching} size="small">
								{showSearch ? countForPatientSearch : countForSearch}
							</Spin>
						</label>{' '}
						" รายการ )
					</label>
				</div>
				<Spin spinning={fetching}>
					<div
						className="p-3"
						style={{
							backgroundColor: '#ECEFF1',
							borderRadius: '2px',
						}}
					>
						<Scrollbars
							style={{
								height: 450,
							}}
						>
							{dataList?.map((value, index) => (
								<div
									key={index}
									style={{
										marginBottom: '-26px',
									}}
									onClick={() => {
										setIsModalVisible(false);
										if (showSearch) {
											if (showPatientSearch) {
												onSelectPatient(value.id);
											}
											if (searchOpdPatientShow) {
												onSelectOpd(value.value, value);
											}
										} else {
											onSelectSearch(value.value, value.patient);
										}
									}}
								>
									<Card style={rowCursor} bordered={false} hoverable>
										<Row>
											<Col span={2}>
												<div
													className="text-center"
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													{dataList?.picture ? (
														<Avatar
															size={40}
															src={
																<Image
																	src={`data:image/jpeg;base64,${dataList?.picture}`}
																/>
															}
														/>
													) : (
														<Avatar size={40}>Patient</Avatar>
													)}
												</div>
											</Col>
											<Col span={6}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															ชื่อ :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.firstName} {value.patient.lastName}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															HN :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.hn}
														</label>
													</p>
												</div>
											</Col>
											<Col span={6}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															เลขบัตรประชาชน :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.idCard}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															บิดา :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.fatherName}
														</label>
													</p>
												</div>
											</Col>
											<Col span={6}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															วันเกิด :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.birthdate}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															มารดา :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.motherName}
														</label>
													</p>
												</div>
											</Col>
											<Col span={4}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															อายุ :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.age}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															เพศ :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.gender === 'F' ? 'หญิง' : 'ชาย'}
														</label>
													</p>
												</div>
											</Col>
										</Row>
									</Card>
								</div>
							))}
						</Scrollbars>
					</div>
				</Spin>
			</Modal>

			{/*Modal Admit Search */}
			<Modal
				title={
					<label className="gx-text-primary-bold">
						ค้นหาข้อมูลผู้ป่วยAdmit
					</label>
				}
				visible={admitVisible}
				onCancel={() => setAdmitVisible(false)}
				footer={[
					<Row justify="center" key="footer">
						<Button key="ok" onClick={() => setAdmitVisible(false)}>
							ปิด
						</Button>
						<Button
							type="primary"
							onClick={fetchAdmitMore}
							disabled={
								fetching ||
								(showSearch
									? countForAdmitSearch === null
										? false
										: admitList.length >= Number(countForAdmitSearch)
											? true
											: false
									: countForSearch === null
										? false
										: searchList.length >= Number(countForSearch)
											? true
											: false)
							}
						>
							ดูรายการเพิ่มเติม
						</Button>
					</Row>,
				]}
				width="1000px"
				zIndex="2000"
				centered
			>
				<div className="mb-2">
					<label className="gx-text-primary-bold me-1">
						คำค้นหา : " {showSearch ? keywordForAdmitSearch : keywordForSearch}{' '}
						"
					</label>
					<label>
						( ผลการค้นหา "{' '}
						<label className="gx-text-primary">
							{showSearch ? admitList?.length : searchList?.length}
						</label>{' '}
						" รายการ จากทั้งหมดทั้งหมด "{' '}
						<label className="gx-text-primary">
							<Spin spinning={countFetching} size="small">
								{showSearch ? countForAdmitSearch : countForSearch}
							</Spin>
						</label>{' '}
						" รายการ )
					</label>
				</div>
				<Spin spinning={fetching}>
					<div
						className="p-3"
						style={{
							backgroundColor: '#ECEFF1',
							borderRadius: '2px',
						}}
					>
						<Scrollbars
							style={{
								height: 450,
							}}
						>
							{dataList?.map((value, index) => (
								<div
									key={index}
									style={{
										marginBottom: '-26px',
									}}
									onClick={() => {
										setAdmitVisible(false);
										if (showSearch) {
											onSelectAdmit(value.patientId, value);
										} else {
											onSelectSearch(value.value, value.patient);
										}
									}}
								>
									<Card style={rowCursor} bordered={false} hoverable>
										<Row align="middle">
											<Col
												span={2}
												style={{
													marginBottom: '-19px',
													marginTop: '-19px',
												}}
											>
												<div className="text-center">
													{dataList?.picture ? (
														<Avatar
															size={40}
															src={
																<Image
																	src={`data:image/jpeg;base64,${dataList?.picture}`}
																/>
															}
														/>
													) : (
														<Avatar size={40}>Patient</Avatar>
													)}
												</div>
											</Col>
											<Col
												span={11}
												style={{
													marginBottom: '-19px',
													marginTop: '-19px',
												}}
											>
												<label className="pointer gx-text-primary me-1">
													ชื่อ :{' '}
												</label>
												<label className="pointer data-value">
													{' '}
													{value.fullName}
												</label>
											</Col>
											<Col
												span={11}
												style={{
													marginBottom: '-19px',
													marginTop: '-19px',
												}}
											>
												<label className="pointer gx-text-primary me-1">
													เลขบัตรประชาชน :{' '}
												</label>
												<label className="pointer data-value">
													{' '}
													{value.idCard}
												</label>
											</Col>
										</Row>
									</Card>
								</div>
							))}
						</Scrollbars>
					</div>
				</Spin>
			</Modal>

			{/*Modal All Search */}
			<Modal
				title={
					<label className="gx-text-primary-bold">ค้นหาข้อมูลผู้ป่วย</label>
				}
				visible={allSearchVisible}
				onCancel={() => setAllSearchVisible(false)}
				footer={[
					<Row justify="center" key="footer">
						<Button key="ok" onClick={() => setAllSearchVisible(false)}>
							ปิด
						</Button>
						<Button
							type="primary"
							onClick={() => searchAllMore(keywordForAllSearch)}
							disabled={
								fetching
									? fetching
									: countPatientAllSearch <= listPatientByAllSearch.length
							}
						>
							ดูรายการเพิ่มเติม
						</Button>
					</Row>,
				]}
				width={1000}
				zIndex={2000}
				centered
			>
				<div className="mb-2">
					<label className="gx-text-primary-bold me-1">
						คำค้นหา : " {keywordForAllSearch} "
					</label>
					<label>
						( ผลการค้นหา "{' '}
						<label className="gx-text-primary">
							{listPatientByAllSearch.length}
						</label>{' '}
						" รายการ จากทั้งหมดทั้งหมด "{' '}
						<label className="gx-text-primary">
							<Spin spinning={countFetching} size="small">
								{countPatientAllSearch}
							</Spin>
						</label>{' '}
						" รายการ )
					</label>
				</div>
				<Spin spinning={fetching}>
					<div
						className="p-3"
						style={{
							backgroundColor: '#ECEFF1',
							borderRadius: '2px',
						}}
					>
						<Scrollbars
							style={{
								height: 450,
							}}
						>
							{listPatientByAllSearch.map((value, index) => (
								<div
									key={index}
									style={{
										marginBottom: '-26px',
									}}
									onClick={() => {
										setAllSearchVisible(false);
										if (allSearchTypeValue === 'An') {
											selectedPatientAllSearch(
												'ipd',
												value,
												keywordForAllSearch
											);
										} else {
											switch (props?.opdipd) {
												case 'I':
													selectedPatientAllSearch(
														'ipd',
														value,
														keywordForAllSearch
													);
													break;
												case 'O':
													selectedPatientAllSearch('opd', value);
													break;
												default:
													selectedPatientAllSearch('all', value);
													break;
											}
										}
									}}
								>
									<Card style={rowCursor} bordered={false} hoverable>
										<Row>
											<Col span={2}>
												<div
													className="text-center"
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													{value?.patient?.picture ? (
														<Avatar
															size={40}
															src={
																<Image
																	src={`data:image/jpeg;base64,${value.patient.picture}`}
																/>
															}
														/>
													) : (
														<Avatar size={40}>Patient</Avatar>
													)}
												</div>
											</Col>
											<Col span={6}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															ชื่อ :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.fullName}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															HN :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.hn}
														</label>
													</p>
												</div>
											</Col>
											<Col span={7}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															เลขบัตรประชาชน :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.idCard}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															บิดา :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.fatherName}
														</label>
													</p>
												</div>
											</Col>
											<Col span={5}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															วันเกิด :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.birthdate}
														</label>
													</p>
													<p>
														<label className="pointer gx-text-primary me-1">
															มารดา :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.motherName}
														</label>
													</p>
												</div>
											</Col>
											<Col span={4}>
												<div
													style={{
														marginBottom: '-34px',
														marginTop: '-19px',
													}}
												>
													<p
														style={{
															marginBottom: '5px',
														}}
													>
														<label className="pointer gx-text-primary me-1">
															อายุ :{' '}
														</label>
														<label className="pointer data-value">
															{' '}
															{value.patient.age}
														</label>
													</p>
												</div>
											</Col>
										</Row>
									</Card>
								</div>
							))}
						</Scrollbars>
					</div>
				</Spin>
			</Modal>
			{ShowPatientOld && (
				<PatientOld
					PatientSearch={props?.PatientSearch}
					AdmitSearch={props?.AdmitSearch}
					SearchOpd={props?.SearchOpd}
					allSearch={props?.allSearch}
				/>
			)}
			{/* <Customizer/> */}
			<SelectIPD ref={selectIPDRef} onSelectAn={onSelectAn} />
			<SelectOPD
				ref={selectOPDRef}
				onSelectServiceId={onSelectServiceId}
				page={props.page}
			/>
			<SelectIPDAllSearch
				ref={selectIPDAllSearchRef}
				onSelectAn={onSelectAnAllSearch}
			/>
			<SelectOPDAllSearch
				ref={selectOPDAllSearchRef}
				onSelectServiceId={onSelectHnAllSearch}
			/>
		</Header>
	);
});

const apis = {
	GetScanDocOrderSignalR: {
		url: 'Scan/GetScanDocOrderSignalR',
		method: 'GET',
		return: 'data',
		sendRequest: false,
	},
};
