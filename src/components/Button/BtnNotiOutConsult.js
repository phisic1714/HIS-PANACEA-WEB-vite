import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import dayjs from 'dayjs';
import { Badge, Button, Popover, Tooltip, Row, Col, Avatar, Card, Image, Spin } from 'antd'
import { Icon } from '@iconify/react';
import personSupport16Regular from "@iconify/icons-fluent/person-support-16-regular";
import { OPDPrescriptionRoom } from "appRedux/actions";
import useSignalrHub from "libs/useSignalrHub";
import { callApis } from 'components/helper/function/CallApi';
import notiPop from "components/Sound/audio/doorbellShortened.mp3";
const warningSound = new Audio(notiPop);

export default function BtnNotiOutConsult({
    page = null,
    showBtnOutConsult = false,
}) {
    // console.log('showBtnOutConsult', showBtnOutConsult)
    const history = useHistory();
    const dispatch = useDispatch();
    const { opdPrescriptionRoom } = useSelector(({ workRoom }) => workRoom);
    const { pathname } = useSelector(({ common }) => common);
    // State
    const [loading, setLoading] = useState(false)
    const [workId, setWorkId] = useState(null)
    // console.log('workId', workId)
    const [count, setCount] = useState("0")
    const [consults, setConsults] = useState([])
    // Signal R
    const wardConsultSignRHub = useSignalrHub('/Consult')
    const joinSignalrWardConsult = async (workId) => {
        if (!workId) return setCount("0")
        if (!showBtnOutConsult) return setCount("0")
        if (wardConsultSignRHub.connection?.connectionState === 'Disconnected') {
            await wardConsultSignRHub.start();
            wardConsultSignRHub.on("WaitingConsult", (message) => {
                // console.log('WaitingConsult :>> ', message);
                const cnt = message || "0"
                setCount(p => {
                    const prev = Number(p || "0")
                    const newCnt = Number(cnt || "0")
                    if (newCnt > prev) warningSound.play();
                    return cnt
                })
            });
            await wardConsultSignRHub.joinGroup("JoinGroup", { workid: workId, doctor: null });
            callApis(apis["GetWaitConsultSignalR"], workId)
            // getCountConsult()
        }
    }
    // Funtions
    const getOutconsultslist = async () => {
        const req = {
            workId,
            date: dayjs().format("YYYY-MM-DD"),
        }
        setLoading(p => !p)
        const res = await callApis(apis["GetOutconsultslist"], req)
        setLoading(p => !p)
        setConsults(res)
    }
    const handleClickConsult = (dts) => {
        dispatch(OPDPrescriptionRoom({ ...opdPrescriptionRoom, consultsId: dts.consultsId }));
        history.push({ pathname: "/opd prescription/opd-prescription-drug-consult-room" });
    }
    useEffect(() => {
        switch (pathname) {
            case "/opd prescription/opd-prescription-check-lab-result": //14.6
            case "/opd prescription/opd-prescription-patient-service-history": //14.9
            case "/opd prescription/opd-prescription-opd-expense-summary": //14.11
            case "/opd prescription/opd-prescription-opd-patient-profile": //14.12
            case "/opd prescription/opd-prescription-non-drug-charge": //14.17
            case "/opd prescription/opd-prescription-add-evaluation-results": //14.21
            case "/opd prescription/opd-prescription-opd-drug-asseessment": //14.22
                return setWorkId(opdPrescriptionRoom?.datavalue)
            default: break
        }
        switch (page) {
            case "14.1":
            case "14.1.1":
            case "14.2":
            case "14.3":
            case "14.3.1":
            case "14.4":
            case "14.5":
            case "14.7":
            case "14.8":
            case "14.10":
            case "14.13":
            case "14.15":
            case "14.16":
            case "14.18":
            case "14.19":
            case "14.20":
                return setWorkId(opdPrescriptionRoom?.datavalue)
            default: break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, page])
    useEffect(() => {
        if (wardConsultSignRHub && workId) {
            joinSignalrWardConsult(workId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wardConsultSignRHub, workId])
    const PartsPopContent = () => {
        return <div style={{ width: 385 }}>
            {
                consults.map(o => {
                    return <Card
                        key={o.consultsId}
                        size='small'
                        hoverable
                        className='mb-1'
                        onClick={e => {
                            e.stopPropagation()
                            handleClickConsult(o)
                        }}
                    >
                        <div style={{ margin: -10 }}>
                            <Row gutter={[4, 4]} align='middle'>
                                <Col span={4} className='text-center'>
                                    {
                                        o?.picture
                                            ? <Avatar
                                                size={50}
                                                src={<Image preview={false} src={`data:image/jpeg;base64,${o.picture}`} />} />
                                            : <Avatar size={50}>Patient</Avatar>
                                    }
                                </Col>
                                <Col span={19}>
                                    <Row gutter={[2, 2]}>
                                        <Col span={24}>
                                            <label className='gx-text-primary fw-bold me-1 fs-6 pointer'>จากห้อง</label>
                                            <label className='fw-bold fs-6 pointer'>{o.fromWorkName}</label>
                                        </Col>
                                        <Col span={24}>
                                            <label className='gx-text-primary fw-bold me-1 fs-6 pointer'>HN</label>
                                            <label className='fw-bold fs-6 me-1 pointer'>{o.hn}</label>
                                            <label className='pointer'>{o.displayName}</label>
                                        </Col>
                                        <Col span={24}>
                                            <label className='data-value pointer'>
                                                {dayjs(o.dateCreated, 'MM/DD/YYYY HH:mm').format("DD/MM/BBBB HH:mm")}
                                            </label>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                })
            }
        </div>
    }
    return <Badge
        hidden={!workId ? true : !showBtnOutConsult}
        size="small"
        count={count}
        offset={[-10, 3]}
        showZero
    >
        <Popover
            placement='bottom'
            content={<Spin spinning={loading}>{PartsPopContent()}</Spin>}
            title={<label className='gx-text-primary fw-bold fs-6'>รายการ Consult ที่ส่งมา</label>}
            trigger="click"
        >
            <Tooltip title="Consult">
                <Button
                    hidden={!workId ? true : !showBtnOutConsult}
                    style={{ marginBottom: 0 }}
                    size="small"
                    icon={<Icon
                        style={{ cursor: "pointer" }}
                        icon={personSupport16Regular} />}
                    onClick={e => {
                        e.stopPropagation()
                        if (count === "0") return
                        getOutconsultslist(workId)
                    }}
                />
            </Tooltip>
        </Popover>
    </Badge>
}
const apis = {
    GetWaitConsultSignalR: {
        url: "OutConsult/GetWaitConsultSignalR/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetCountConsult: {
        url: "OutConsult/GetCountConsult",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetOutconsultslist: {
        url: "OutConsult/Outconsultslist",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}
