import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Row, Col, Button, Table, Modal } from 'antd';
import { nanoid } from 'nanoid';
import Topbar from 'containers/Topbar';
import useSignalrHub from 'libs/useSignalrHub';

export default function TestChat() {
	const [joinGroupForm] = Form.useForm();
	const [usersInGroup, setUserInGroup] = useState([]);
	const [userAll, setUserAll] = useState([]);

	const url = Form.useWatch('url', joinGroupForm);
	const chatHub = useSignalrHub(url || null);

	const joinChat = async () => {
		const groupName = joinGroupForm.getFieldValue('groupName');
		const username = joinGroupForm.getFieldValue('username');
		if (chatHub.connection?.connectionState === 'Disconnected') {
			await chatHub.start();
			await chatHub.joinGroup('joinGroup', {
				groupId: groupName,
				userId: username,
			});
		}
	};

	const subscribeMessage = () => {
		chatHub.on('userSessionAll', (users) => {
			setUserAll(users);
		});
		chatHub.on('userSessionGroup', (user) => {
			console.log(user);
		});
		chatHub.on('getMessage', (user, message) => {
			console.log(user, message);
		});
	};

	const onJoinGroup = (v) => {
		joinChat();
	};

	const sendMessage = (userId) => {
		chatHub.invoke('SendUsersByConnectionId', userId, userId);
	};

	const columns = [
		{
			title: <label className="gx-text-primary">Username</label>,
			dataIndex: 'userId',
		},
		{
			title: <label className="gx-text-primary">Group</label>,
			dataIndex: 'groupId',
		},
		{
			title: <label className="gx-text-primary">Connection id</label>,
			dataIndex: 'connectionId',
		},
	];

	useEffect(() => {
		subscribeMessage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usersInGroup, chatHub, url]);

	useEffect(() => {
		joinGroupForm.setFieldsValue({
			url: 'http://localhost:5001/Chat',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Topbar
				PatientSearch={false}
				AdmitSearch={false}
				SearchOpd={false}
				BtnScan={false}
				PatientType={false}
			/>
			<div className="gx-main-content-wrapper">
				<Form form={joinGroupForm} layout="vertical" onFinish={onJoinGroup}>
					<Row gutter={[12, 6]} style={{ flexDirection: 'row', width: '100%' }}>
						<Col span={12}>
							<Form.Item
								// label={<label>Url</label>}
								name="url"
							>
								<Input placeholder="Url" />
							</Form.Item>
						</Col>
						<Col span={5}>
							<Form.Item
								// label={<label>Group Name</label>}
								rules={[
									{
										required: true,
										message: 'Please input your group name',
									},
								]}
								name="groupName"
							>
								<Input placeholder="Group name" />
							</Form.Item>
						</Col>
						<Col span={5}>
							<Form.Item
								// label={<label>Name</label>}
								name="username"
							>
								<Input placeholder="Username" />
							</Form.Item>
						</Col>
						<Col span={2}>
							<Button onClick={() => joinGroupForm.submit()}>Join</Button>
						</Col>
					</Row>
				</Form>
				<Table
					columns={columns}
					dataSource={userAll}
					onRow={(record) => {
						return {
							onClick: () => {
								sendMessage(record.userId);
							}, // click row
						};
					}}
				/>
			</div>
		</>
	);
}
