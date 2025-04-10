import surgicalSterilization from '@iconify/icons-healthicons/surgical-sterilization';
import { Icon } from '@iconify/react';
import { Badge, Button, Col, List, Popover, Row, Spin, Tooltip } from 'antd';
import { withResolve } from 'api/create-api';
import dayjs from 'dayjs';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { operationSet, showMessage } from 'appRedux/actions';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
const BtnNotiSetOr = () => {
    const userFromSession = JSON.parse(
        sessionStorage.getItem('user')
    ).responseData;
    const dispatch = useDispatch();
    const history = useHistory();

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [OrList, setOrList] = useState([]);
    const getSetOrList = async () => {
        const req = {
            date: dayjs().subtract(1, 'months').format('YYYY-MM-DD'),
            toWork: null,
            fromWork: null,
            type: 'allCount',
            surgeon: userFromSession.userId,
            endDate: dayjs().format('YYYY-MM-DD'),
            opdipd: null,
        };

        const res = (
            await withResolve(
                `/api/OperationRoom/GetListDashboardOperationRoomServiceDisplay`
            ).insert(req)
        ).result;
        setTooltipVisible(res?.length !== 0 ? true : false);
        setOrList(res);
        setLoading(false);
    };
    const TooltipTitle = () => {
        return <></>;
    };
    const PartSetOrList = () => {
        return (
            <List
                dataSource={OrList}
                renderItem={(item) => (
                    <List.Item
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                        }
                    >
                        <Row
                            onClick={async () => {
                                history.push({
                                    pathname: '/operation room/operation-room-set-or',
                                });
                                dispatch(showMessage(item?.patientId));
                                await dispatch(
                                    operationSet({
                                        orRecId: item?.orRecId,
                                        patientId: item?.patientId,
                                        formWork: item?.formWork,
                                        formWorkName: item?.formWorkName,
                                    })
                                );
                            }}
                            gutter={16}
                            justify="space-between"
                            align="middle"
                            style={{ width: '100%' }}
                        >
                            <Col flex="auto">
                                <strong>ICD9: </strong>
                                {item?.preOpProced || '-'}
                            </Col>

                            <Col flex="auto">
                                <strong>วันที่: </strong>
                                {moment(item?.orDate).format('DD/MM/YYYY') || '-'}{' '}
                                <strong>เวลา: </strong>
                                {dayjs(item?.orDate).format('HH:mm:ss') || '-'}
                            </Col>
                        </Row>
                    </List.Item>
                )}
            ></List>
        );
    };
    useEffect(() => {
        getSetOrList();
    }, []);

    useEffect(() => {
        if (tooltipVisible === true) {
            setTimeout(() => {
                setTooltipVisible(false);
            }, 5000);
        }
    }, [tooltipVisible]);

    return (
        <Badge
            //   hidden={!workId ? true : !showBtnOutConsult}
            size="small"
            count={OrList?.length}
            offset={[-10, 3]}
            showZero
        >
            <Popover
                placement="bottom"
                content={<Spin spinning={loading}>{PartSetOrList()}</Spin>}
                title={
                    <label className="gx-text-primary fw-bold fs-6">
                        รายการเคสผ่าตัด
                    </label>
                }
                trigger="click"
                onVisibleChange={(visible) =>
                    setTooltipVisible(OrList?.length === 0 ? false : !visible)
                }
            >
                <Tooltip
                    color="red"
                    title={`${userFromSession?.preName}${userFromSession?.firstName} ${userFromSession?.lastName} มีเวรผ่าตัด`}
                    visible={tooltipVisible}
                >
                    <Button
                        //   hidden={!workId ? true : !showBtnOutConsult}
                        style={{ marginBottom: 0 }}
                        size="small"
                        icon={
                            <Icon
                                style={{ cursor: 'pointer' }}
                                icon={surgicalSterilization}
                            />
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            setTooltipVisible(false);
                        }}
                    />
                </Tooltip>
            </Popover>
        </Badge>
    );
};

export default BtnNotiSetOr;
