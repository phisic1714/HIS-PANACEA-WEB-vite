import { env } from '../../env.js';
import { useState, useEffect } from 'react';
import { Table, Button, Checkbox, ConfigProvider, Row, Col, Spin } from 'antd';
import axios from 'axios';
import thTH from 'antd/lib/locale/th_TH';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { notiSuccess, notiError } from "components/Notification/notificationX";


const TableCustom = styled(Table)`
	.ant-table-selection {
		display: none;
	}
`;

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function WorkListTable({
	clinicId = null,
	size = "",
	reload = false,
	scrollY = "",
	...props
}) {
	const [loading, setLoading] = useState(false)
	const [checked, setChecked] = useState(false);
	const [rowKeys, setRowKeys] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	// console.log('selectedRows', selectedRows);
	const [workListdataSource, setWorkListdataSource] = useState(
		/* dumpTableData */[]
	);
	const toggleChecked = (e) => {
		let { checked } = e.target;
		// console.log('value', checked);
		let rowKeys = [];
		let selectedRows = [];
		if (checked) {
			rowKeys = workListdataSource?.map((val) => {
				return val.nWorkListId;
			});
			selectedRows = [...workListdataSource];
		}
		setRowKeys(rowKeys);
		setChecked(checked);
		setSelectedRows(selectedRows);
	};
	const columns = [
		{
			title: "รายการ",
			dataIndex: 'expenseName',
			// render: (val) => <label className="data-value pointer">{val}</label>,
		},
		{
			title: "ผู้ทำหัตถการ",
			dataIndex: 'nursesName',
			width: 145,
			render: (v, r) => <label>{v || r?.nurses}</label>,
		},
		{
			title: "วันที่ทำ",
			dataIndex: 'makedDate',
			align: 'center',
			width: 120,
			render: (val) => (
				<label>
					{val
						? dayjs(val, 'MM/DD/YYYY HH:mm:ss').format('DD/MM/BBBB HH:mm')
						: '-'}
				</label>
			),
		},
	];
	const rowSelection = {
		selectedRowKeys: rowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			// console.log('selectedRowKeys', selectedRowKeys);
			// console.log('selectedRows', selectedRows);
			setRowKeys(selectedRowKeys);
			setSelectedRows(selectedRows);
		},
	};

	const fetchWorkList = async () => {
		if (!clinicId) return;
		setLoading(p => !p)
		let res = await axios
			.get(
				`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/Getworklist/${clinicId}`
			)
			.then((res) => {
				return res.data.responseData;
			})
			.catch((error) => {
				return error;
			});

		if (res) setWorkListdataSource(res);
		setLoading(p => !p)
		return res;
	};

	const updateWorklist = async () => {
		if (!clinicId) return;
		let req = rowKeys?.map((val) => {
			return {
				nWorkListId: val,
				// makedDate:dayjs().format()
				nurses: user,
				userModified: user,
			};
		});

		let { isSuccess, responseData } = await axios
			.post(
				`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpdateWorkList`,
				{
					mode: 'string',
					user: 'string',
					ip: 'string',
					lang: 'string',
					branch_id: 'string',
					requestData: req,
					barcode: 'string',
				}
			)
			.then((res) => {
				return res.data;
			})
			.catch((error) => {
				return error;
			});

		if (isSuccess) {
			notiSuccess({ message: "บันทึกข้อมูล" })
			fetchWorkList();
			setRowKeys([]);
			setChecked(false);
			setSelectedRows([]);
		} else {
			notiError({ message: "บันทึกข้อมูล" })
		}
	};

	useEffect(() => {
		fetchWorkList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [clinicId, reload]);
	return (
		<Spin spinning={loading}>
			<ConfigProvider locale={thTH}>
				<Row gutter={[4, 8]} align='middle'>
					<Col className='ps-2'>
						<Checkbox
							checked={checked || rowKeys.length ? true : false}
							onChange={toggleChecked}
							disabled={!workListdataSource.length}
						>
							{checked || rowKeys.length ? 'เอาออกทั้งหมด' : 'เลือกทั้งหมด'}
						</Checkbox>
						<Button
							size={size}
							style={{
								marginBottom: 0,
							}}
							type="primary"
							disabled={!selectedRows.length}
							onClick={updateWorklist}
						>
							ทำแล้ว
						</Button>
					</Col>
				</Row>
				<TableCustom
					size={size}
					columns={columns}
					dataSource={workListdataSource}
					rowSelection={rowSelection}
					// hideSelectAll={false}
					// hideDefaultSelections={true}
					scroll={{ y: scrollY }}
					// showHeader= {false}
					rowKey={'nWorkListId'}
					rowClassName="data-value pointer"
					{...props}
				/>
			</ConfigProvider>
		</Spin>
	);
}
