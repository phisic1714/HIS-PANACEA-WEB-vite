import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Row, Tooltip, Typography } from 'antd';
import axios from 'axios';
import BackToPage from 'components/BackToPage/BackToPage';
import { useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { moduleIdAction } from '../../appRedux/actions/moduleIdActions';
import { env } from '../../env.js';
import '../../styles/app-styles.css';
import { TabTitle } from '../../util/GeneralFuctions.js';

const { Paragraph } = Typography;
const userFromSession = JSON.parse(sessionStorage.getItem('userMenu'));
const userIdSession = JSON.parse(sessionStorage.getItem('user'));

export default function BreadcrumbMenu({ customBCStyles = null }) {
	const match = useRouteMatch();
	const [menu, setMenu] = useState('');
	const [submenu, setSubmenu] = useState(null);
	const [subMenuName, setSubMenuName] = useState(null);
	const [childern, setChildern] = useState(null);
	const [childernName, setChildernName] = useState(null);
	const [eName, setEName] = useState(null);
	const [codeName, setCodeName] = useState(null);
	const dispatch = useDispatch();

	const snakeToKebab = (str) => {
		var myString = str.replace(/_/g, '-');
		return myString.toLowerCase();
	};

	const InsertActivityLogs = async (moduleId) => {
		if (moduleId) {
			const insertAct = async (ip) => {
				let req = {
					mode: null,
					user: null,
					ip: null,
					lang: null,
					branch_id: null,
					requestData: {
						activityLogId: null,
						screenId: moduleId,
						reportId: null,
						desription: 'Access Menu',
						userCreated: userIdSession?.responseData?.userId || null,
						ipAddress: ip || null,
					},
					barcode: null,
				};
				await axios.post(
					`${env.REACT_APP_PANACEACHS_SERVER}/api/TbActivityLogs/InsTbActivityLogs`,
					req
				);
			};
			await insertAct();
		}
	};

	const manageMenu = () => {
		function chkMenuMap(data, setuserMenu = false) {
			if (data.isSuccess) {
				if (setuserMenu) {
					sessionStorage.setItem('userMenu', JSON.stringify(data));
				}
				let i = data;
				if (i !== null) {
					const menu = i.responseData.filter(
						(n) => n.eName?.toLowerCase() === match.path.split('/')[1]
					);

					if (!menu.length) return;

					const submenu =
						menu[0]?.children !== null
							? menu[0]?.children?.filter(
								(n) => snakeToKebab(n.code) === match.path.split('/')[2]
							)
							: null;
					const childern =
						submenu[0]?.subchildren !== null
							? submenu[0]?.subchildren?.filter(
								(n) => snakeToKebab(n.code) === match.path.split('/')[3]
							)
							: null;

					setMenu(menu[0]?.moduleName?.substring(2, 99));
					setEName(menu[0]?.eName);
					setSubmenu(submenu[0]?.name?.substring(4, 99));
					setSubMenuName(submenu[0]?.name);
					setCodeName(submenu[0]?.code);
					setChildern(
						childern
							? childern[0]?.name?.replace(' ', '').substring(6, 99)
							: null
					);
					setChildernName(childern ? childern[0]?.name : null);
					if (submenu[0]?.subchildren) {
						let filterModule = submenu[0]?.subchildren?.filter(
							(m) => m?.name === childern[0]?.name
						);
						InsertActivityLogs(filterModule[0]?.moduleId);
						dispatch(
							moduleIdAction({
								moduleId: filterModule[0]?.moduleId,
								refreshTime: filterModule[0]?.refreshTime,
							})
						);
					} else {
						InsertActivityLogs(submenu[0]?.moduleId);
						dispatch(
							moduleIdAction({
								moduleId: submenu[0]?.moduleId,
								refreshTime: submenu[0]?.refreshTime,
							})
						);
					}
				}
			}
		}
		if (userFromSession) {
			chkMenuMap(userFromSession);
		} else {
			axios
				.get(
					`${env.REACT_APP_PANACEACHS_SERVER}/api/Module/GetMenu/${userIdSession.responseData.userId}`
				)
				.then(({ data }) => {
					chkMenuMap(data, true);
				})
				.catch(function (error) {
					console.log(error);
				});
		}
	};

	useLayoutEffect(() => {
		manageMenu();
		return;
	}, [userFromSession]);

	const isGoBackToDoctorTakeHistoryPage =
		eName === 'Doctor Clinic' && codeName !== 'DOCTOR_CLINIC_TAKE_HISTORY';
	TabTitle(
		childernName === null
			? subMenuName
			: childernName
				? childernName
				: 'PANACEA+'
	);

	// console.log('menu,', menu);
	// console.log('submenu,', submenu);
	// console.log('childern,', childern);

	return (
		<div
			className={customBCStyles ? '' : 'breadcrumb-card'}
			style={customBCStyles ? customBCStyles : {}}
		>
			<Row gutter={[2, 2]}>
				<Col span={isGoBackToDoctorTakeHistoryPage ? 19 : 24}>
					<Breadcrumb
						style={{
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							marginBottom: 0,
						}}
					>
						<Breadcrumb.Item style={{ marginBottom: 0 }}>
							<HomeOutlined
								style={{
									fontSize: 15,
									verticalAlign: '0.125em',
								}}
							/>
							&nbsp;
							<label className="breadcrumb-value">{menu}</label>
						</Breadcrumb.Item>
						<Breadcrumb.Item style={{ marginBottom: 0 }}>
							<label className="breadcrumb-value">{subMenuName}</label>
						</Breadcrumb.Item>
						{childern !== null ? (
							<Breadcrumb.Item style={{ marginBottom: 0 }}>
								<label className="breadcrumb-value">{childernName}</label>
							</Breadcrumb.Item>
						) : (
							<></>
						)}
					</Breadcrumb>
					<Paragraph
						ellipsis
						className="gx-text-primary"
						style={{
							fontSize: 20,
							marginBottom: 0,
						}}
					>
						<Tooltip
							placement="topLeft"
							title={childernName === null ? subMenuName : childernName}
						>
							{childernName === null ? subMenuName : childernName}
						</Tooltip>
					</Paragraph>
				</Col>
				{isGoBackToDoctorTakeHistoryPage && (
					<Col span={5}>
						<BackToPage
							goToPageUrl={'/doctor clinic/doctor-clinic-take-history'}
						>
							ไปหน้า 10.3
						</BackToPage>
					</Col>
				)}
			</Row>
		</div>
	);
}
