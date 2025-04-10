import { Button, Checkbox, Col, Form, Input, Modal, Row, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DayjsDatePicker from '../../DatePicker/DayjsDatePicker';
import { GetNarcoticModal, UpdateRecivesNarcotic } from './Api/DrugNDApi';

export default function DrugND({
	visible,
	setVisible,
	orderId,
	patientType,
	tabCardRef,
}) {
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const [expenseND, setExpenseND] = useState([]);

	const getNarcoticModal = async (orderId) => {
		setLoading(true);
		let res = await GetNarcoticModal(orderId);
		if (res?.isSuccess) {
			let resData = res?.responseData;
			form.setFieldsValue({
				...resData,
				nacrosDate: resData?.nacrosDate
					? dayjs(resData.nacrosDate, 'DD/MM/BBBB')
					: null,
				recivesNarcotic: resData?.recivesNarcotic === 'Y' ? true : false,
			});
			setExpenseND(resData?.expenseList);
		}
		setLoading(false);
	};

	const onFinish = async (value) => {
		setLoading(true);
		let req = {
			...value,
			nacrosId: form.getFieldValue('nacrosId'),
		};
		let res = await UpdateRecivesNarcotic(req);
		if (res?.isSuccess) {
			toast.success('บันทึกสำเร็จ', toastSetting);
			if (patientType === 'opd') {
				tabCardRef.current.getOpdFinancesDrug();
			} else {
				tabCardRef.current.getIpdFinancesDrug();
			}
		} else {
			toast.error('บันทึกไม่สำเร็จ', toastSetting);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (orderId) {
			getNarcoticModal(orderId);
		}
		return () => {
			setExpenseND([]);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId]);

	return (
		<Modal
			width="700px"
			visible={visible}
			title={
				<strong>
					<label className="gx-text-primary">รายละเอียด</label>
				</strong>
			}
			footer={[
				<Row justify="center" key="footer">
					<Button
						key="cancel"
						onClick={() => {
							setVisible(false);
						}}
					>
						ออก
					</Button>
					<Button
						key="ok"
						type="primary"
						onClick={() => {
							form.submit();
							setVisible(false);
						}}
					>
						ตกลง
					</Button>
				</Row>,
			]}
		>
			<Spin spinning={loading}>
				<Form form={form} layout="vertical" onFinish={onFinish}>
					<Row gutter={[16, 16]} style={{ flexDirection: 'row' }}>
						<Col span={12}>
							<label className="gx-text-primary">วันที่</label>
						</Col>
						<Col span={12} />
						<Col span={12}>
							<Form.Item style={{ marginBottom: 0 }} name="nacrosDate">
								<DayjsDatePicker form={form} name="nacrosDate" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Row
								align="middle"
								style={{ flexDirection: 'row', height: '100%' }}
							>
								<Form.Item
									style={{ marginBottom: 0 }}
									name="recivesNarcotic"
									valuePropName="checked"
								>
									<Checkbox>
										<label className="gx-text-primary">
											ได้รับใบยาเสพติดแล้ว
										</label>
									</Checkbox>
								</Form.Item>
							</Row>
						</Col>
						<Col span={24}>
							<label className="gx-text-primary">รายละเอียดยาเสพติด</label>
						</Col>
						{expenseND.map((val, index) => (
							<Col key={index} span={24}>
								ยา{val?.expenseName}
							</Col>
						))}
						<Col span={24}>
							<Form.Item
								name="remark"
								label={<label className="gx-text-primary">หมายเหตุ</label>}
							>
								<Input />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Spin>
		</Modal>
	);
}

const toastSetting = {
	position: 'top-right',
	autoClose: 2500,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: 'light',
	className: 'toastBodyClassName',
};
