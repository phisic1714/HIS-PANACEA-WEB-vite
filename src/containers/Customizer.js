import React, { useState } from 'react';
import { Button, Col, Drawer, InputNumber, Modal, Row } from 'antd';
import { useSelector } from 'react-redux';
import CustomScrollbars from 'util/CustomScrollbars';
import {
	CheckOutlined,
	FontSizeOutlined,
	SaveOutlined,
} from '@ant-design/icons';
const CustomizerSystem = () => {
	let root = document.documentElement;
	const [value, setValue] = useState(JSON.parse(localStorage.getItem('count')));
	const [isCustomizerOpened, setIsCustomizerOpened] = useState(false);
	const [reload, setReload] = useState(false);
	const themeColorDefault = JSON.parse(localStorage.getItem('themeColor'));
	const themeFontDefault = JSON.parse(localStorage.getItem('themeFont'));
	const { themeColor } = useSelector(({ settings }) => settings);

	const [objTimeoutEMessage, setObjTimeoutEMessage] = useState(
		JSON.parse(localStorage.getItem('timeoutemessage'))
	);

	const toggleCustomizer = () => {
		setIsCustomizerOpened(!isCustomizerOpened);
	};

	// console.log(themeColor);
	const getCustomizerContent = () => {
		return (
			<CustomScrollbars className="gx-customizer">
				<div className="gx-customizer-item">
					<h5 className="gx-mb-3 gx-text-uppercase">Other Settings</h5>
					<Row
						style={{
							margin: 0,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Col>
							<h6 className="gx-mb-3 ">Session Time (Minute)</h6>
						</Col>
						<Col
							style={{
								display: 'flex',
								alignItems: 'baseline',
							}}
						>
							<InputNumber
								value={value}
								min={1}
								onChange={(val) => setValue(val)}
								onBlur={() => {
									if (value < 0) {
										setValue(
											JSON.parse(localStorage.getItem('hos_param'))
												?.passwordExpire
										);
									}
								}}
								controls={false}
							></InputNumber>
							<Button
								icon={
									<SaveOutlined
										style={{
											display: 'inline-grid',
										}}
									/>
								}
								type="primary"
								onClick={() => {
									if (value > 0) {
										window.localStorage.setItem('count', value);
										Modal.success({
											title: 'บันทึกสำเร็จ',
										});
									} else {
										setValue(
											JSON.parse(localStorage.getItem('hos_param'))
												?.passwordExpire
										);
										localStorage.setItem(
											'count',
											JSON.parse(localStorage.getItem('hos_param'))
												?.passwordExpire
										);
									}
								}}
							>
								บันทึก
							</Button>
						</Col>
						<div className="gx-customizer-item">
							<h6 className="gx-mb-3 gx-mt-3 gx-text-uppercase">สี Theme</h6>
							{getPresetColors(themeColor)}
						</div>
						<div className="gx-customizer-item">
							<h6 className="gx-mb-3 gx-text-uppercase">ขนาด Font</h6>
							{getPresetFonts()}
						</div>
						<div className="gx-customizer-item">
							<h6 className="gx-mb-3 gx-text-uppercase">
								Auto clear E-Messages
							</h6>
							<Row gutter={[8, 8]}>
								<Col span={8}>
									<InputNumber
										value={objTimeoutEMessage?.minute}
										min={0}
										addonAfter="Min"
										onChange={(val) =>
											setObjTimeoutEMessage((prev) => ({
												...prev,
												minute: val,
											}))
										}
										controls={false}
									></InputNumber>
								</Col>
								<Col span={8}>
									<InputNumber
										value={objTimeoutEMessage?.second}
										min={1}
										addonAfter="Sec"
										onChange={(val) =>
											setObjTimeoutEMessage((prev) => ({
												...prev,
												second: val,
											}))
										}
										controls={false}
									></InputNumber>
								</Col>
								<Col span={8}>
									<Button
										icon={
											<SaveOutlined
												style={{
													display: 'inline-grid',
												}}
											/>
										}
										type="primary"
										onClick={() => {
											localStorage.setItem(
												'timeoutemessage',
												JSON.stringify(objTimeoutEMessage)
											);
											Modal.success({
												title: 'บันทึกสำเร็จ',
											});
										}}
									>
										บันทึก
									</Button>
								</Col>
							</Row>
						</div>
					</Row>

					{/* <Form.Item
            label="Layout Orientation (RTL)"
            className={isDirectionRTL ? "gx-mr-0" : "gx-ml-0"}
           >
            <Switch
              className="gx-ml-2"
              checked={isDirectionRTL}
              onChange={onChangeDirection}
            />
           </Form.Item> */}
				</div>
			</CustomScrollbars>
		);
	};

	const BoxColor = ({ primaryColor, secondaryColor }) => {
		return (
			<div
				style={{
					width: 60,
					height: 60,
					background: primaryColor,
					cursor: 'pointer',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					margin: '5px',
					borderRadius: '50%',
				}}
				onClick={() => {
					root.style.setProperty('--primary-color', primaryColor);
					root.style.setProperty('--secondary-color', secondaryColor);
					localStorage.setItem(
						'themeColor',
						JSON.stringify({
							primaryColor: primaryColor,
							secondaryColor: secondaryColor,
						})
					);
					setReload(!reload);
				}}
			>
				{themeColorDefault.primaryColor === primaryColor && (
					<CheckOutlined
						style={{
							color: '#fff',
							fontSize: 24,
						}}
					/>
				)}
			</div>
		);
	};
	const BoxFontSize = ({ size, text, fontSizeTheme, fontSizeSidebar }) => {
		return (
			<Button
				size={size}
				type={
					themeFontDefault.fontSizeTheme === fontSizeTheme
						? 'primary'
						: 'default'
				}
				icon={
					<FontSizeOutlined
						style={{
							display: 'inline-grid',
						}}
					/>
				}
				onClick={() => {
					root.style.setProperty('--font-size-theme', fontSizeTheme);
					root.style.setProperty('--font-size-sidebar', fontSizeSidebar);
					localStorage.setItem(
						'themeFont',
						JSON.stringify({
							fontSizeTheme: fontSizeTheme,
							fontSizeSidebar: fontSizeSidebar,
						})
					);
					setReload(!reload);
				}}
			>
				{text}
			</Button>
		);
	};
	const getPresetFonts = () => {
		return (
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					width: '100%',
				}}
			>
				<BoxFontSize
					text="เล็ก"
					size="small"
					fontSizeTheme="12.5px"
					fontSizeSidebar="12.5px"
				/>
				<BoxFontSize
					text="กลาง"
					size="middle"
					fontSizeTheme="14px"
					fontSizeSidebar="14px"
				/>
				<BoxFontSize
					text="ใหญ่"
					size="large"
					fontSizeTheme="18px"
					fontSizeSidebar="17px"
				/>
			</div>
		);
	};
	const getPresetColors = (themeColor) => {
		return (
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					width: '100%',
				}}
			>
				<BoxColor primaryColor={'#1daa3e'} secondaryColor={'#d6ffe0'} />
				<BoxColor primaryColor={'#00746c'} secondaryColor={'#beebe8'} />
				<BoxColor primaryColor={'#ff4a99'} secondaryColor={'#ffecf6'} />
				<BoxColor primaryColor={'#6F38C5'} secondaryColor={'#D2DAFF'} />
				<BoxColor primaryColor={'#b50073'} secondaryColor={'#ffc9e8'} />
				<BoxColor primaryColor={'#ee5f00'} secondaryColor={'#ffd6ba'} />
				<BoxColor primaryColor={'#005ec9'} secondaryColor={'#cae3ff'} />
				<BoxColor primaryColor={'#181818'} secondaryColor={'#d7d7d7'} />
				<BoxColor primaryColor={'#e39d19'} secondaryColor={'#ffedc9'} />
				<BoxColor primaryColor={'#472D2D'} secondaryColor={'#d4d4d4'} />
				<BoxColor primaryColor={'#00ACC1'} secondaryColor={'#B2EBF2'} />
				<BoxColor primaryColor={'#0091EA'} secondaryColor={'#80D8FF'} />
				<BoxColor primaryColor={'#D32F2F'} secondaryColor={'#EF9A9A'} />
			</div>
		);
	};

	return (
		<>
			<Drawer
				placement="right"
				closable={false}
				onClose={toggleCustomizer}
				visible={isCustomizerOpened}
			>
				{getCustomizerContent()}
			</Drawer>
			<li
				style={{
					cursor: 'pointer',
					marginRight: '9px',
					marginBottom: '0px',
				}}
				onClick={toggleCustomizer}
			>
				<i className="icon icon-setting fw-bold" />
			</li>
		</>
	);
};
export default CustomizerSystem;
