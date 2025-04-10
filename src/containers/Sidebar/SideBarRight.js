import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import styled from 'styled-components';
import { Layout, Button, Card, Table, Empty, Row, Col, Spin, Popconfirm } from "antd"
import _find from 'lodash/find'
import _filter from 'lodash/filter'
import _groupBy from 'lodash/groupBy'
import _reverse from 'lodash/reverse'
import _map from 'lodash/map'
import { callApis } from 'components/helper/function/CallApi';
import { LabelText, LabelTopicPrimary18, } from "components/helper/function/GenLabel";
import PreviewPdfNonModal from 'components/qzTray/PreviewPdfNonModal'
import dayjs from "dayjs"
import { notiSuccess, notiError } from "components/Notification/notificationX";
import { CloseOutlined, WarningFilled, WarningOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons/lib/components/Icon';

const { Sider } = Layout;
const CustomSider = styled.div`
  .ant-layout-sider {
    width: 425px !important;
  }
`;
const size = 'small'
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const user = userFromSession?.responseData?.userId;
export default function SideBarRight() {
    // useSelector
    const { pathname } = useSelector(({ common }) => common);
    // State
    const [loading, setLoading] = useState(false)
    const [hidden, setHidden] = useState(true)
    const [dataSource, setDataSource] = useState([])
    const [contentDetails, setContentDetails] = useState({ pathMain: "", pathSub: "", type: "", title: "", })
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [pdf, setPdf] = useState([]);
    // Functions
    // Get
    const getScanDocOrders = async (lastDefault = false) => {
        // 86046
        const req = {
            ward: null,
            date: dayjs().format("YYYY-MM-DD")
            // ward: "197",
        }
        setLoading(p => !p)
        const res = await callApis(apis["GetScanDocOrderList"], req)
        setLoading(p => !p)
        const results = res?.results || []

        // แยกกลุ่มข้อมูลตาม scanId และเก็บเฉพาะคีย์ที่ไม่ซ้ำกัน
        const groupedByScanId = _groupBy(results, data => data.scanId);
        const uniqueScanIds = Object.keys(groupedByScanId);

        // สร้างอาร์เรย์ merge โดยใช้ข้อมูลจาก uniqueScanIds เพื่อเรียงลำดับและผสมข้อมูล
        let merge = uniqueScanIds.map(scanId => {
            const files = groupedByScanId[scanId];
            const rushFlagFile = files.find(file => file.rushFlag === 'Y');
            const firstFile = files[0];

            return {
                ...firstFile,
                status: firstFile.scanStatus, // แนวคิดสถานะนี้มาจาก firstFile หรือปรับเป็นตามโครงสร้างข้อมูลของคุณ
                date: firstFile.scanDate,
                timeDsp: dayjs(firstFile.scanDate, "MM/DD/YYYY HH:mm").format("HH:mm"),
                data: files,
                rushFlag: rushFlagFile ? 'Y' : null,
            };
        });

        // กรองไอเท็มที่ไม่มีสถานะเท่ากับ null (หากต้องการ)
        merge = _filter(merge, o => !o.status);

        // เรียงลำดับ merge โดย rushFlag (Y มาก่อน) และตาม timeDsp จากเร็วไปช้า
        merge.sort((a, b) => {
            // หาก rushFlag ของ a มีค่า Y และ b ไม่ใช่ Y ให้ a มาก่อน b
            if (a.rushFlag === 'Y' && b.rushFlag !== 'Y') return -1;
            // หาก rushFlag ของ b มีค่า Y และ a ไม่ใช่ Y ให้ b มาก่อน a
            if (a.rushFlag !== 'Y' && b.rushFlag === 'Y') return 1;
            // ถ้าไม่ใช่กรณีข้างบน ให้เรียงตาม timeDsp จากมากไปหาน้อย
            return dayjs(a.timeDsp, "HH:mm").diff(dayjs(b.timeDsp, "HH:mm"));
        });

        // อัปเดตสถานะด้วยข้อมูล merge ที่เรียงลำดับแล้ว
        setDataSource(merge);

        // ตั้งค่ารายการแรกเมื่อ lastDefault เป็นจริงและมี merge มากกว่า 0 รายการ
        if (lastDefault && merge.length > 0) {
            setSelectedRowKeys([merge[0].scanId]);
            setPdf(merge[0].data);
        }
        // if (!merge.length) return
        // if (!lastDefault) return
        // setSelectedRowKeys([merge[0].scanId])
        // setPdf(merge[0].data)
    }
    // Actions
    const acceptScanDocOrder = async () => {
        const req = _map(pdf, o => {
            return {
                "docOrderScanId": o.docOrderScanId,
                "scanStatus": "A",
                "userAccepted": user,
                "dateAccepted": dayjs().format("YYYY-MM-DD HH:mm:ss")
            }
        })
        const res = await callApis(apis["AcceptScanDocOrderStatus"], req)
        if (res?.isSuccess) {
            callApis(apis["GetScanDocOrderSignalR"])
            notiSuccess({ message: "รับทราบใบสั่งยา สำเร็จ" })
            getScanDocOrders(false)
            setPdf([])
            setSelectedRowKeys([])
        } else {
            notiError({ message: "รับทราบใบสั่งยา ไม่สำเร็จ!" })
        }
    }
    // Helpers
    const chkPathName = (path) => {
        const temp = path?.split("/")
        const pathMain = temp[1]
        const pathSub = temp[2]
        switch (pathMain) {
            case "ipd presciption":
                if (_find(pageShowDrugOrderFromWard, o => o === pathSub)) {
                    setContentDetails({
                        pathMain,
                        pathSub,
                        type: "drugOrderFromWard",
                        title: "เอกสารใบสั่งยาจากหอผู้ป่วย"
                    })
                }
                break;
            case "opd prescription":
                if (_find(pageShowDrugOrderFromWard, o => o === pathSub)) {
                    setContentDetails({
                        pathMain,
                        pathSub,
                        type: "drugOrderFromWard",
                        title: "เอกสารใบสั่งยาจากหอผู้ป่วย"
                    })
                }
                break;
            default:
                setContentDetails({ pathMain: "", pathSub: "", type: "", title: "", })
                setHidden(true)
                break;
        }
    }
    // Effect
    useEffect(() => {
        setContentDetails({ pathMain: "", pathSub: "", type: "", title: "", })
        setHidden(true)
        setPdf([])
        setSelectedRowKeys([])
        setDataSource([])
        chkPathName(pathname)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])
    useEffect(() => {
        if (!hidden) document.getElementById("sidebar-left-collapsible-false").click()
        if (hidden) {
            setPdf([])
            setSelectedRowKeys([])
            setDataSource([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hidden])
    // Components
    const showDrugOrderFromWard = () => {
        const view = () => {
            return pdf.length
                ? <PreviewPdfNonModal
                    pdf={pdf}
                    selectablePdfHeight="25rem"
                    // height="400px"
                    hiddenThumbnails={true}
                    unSelectable={true}
                    deleteAble={false}
                    hiddenFullScreen={true}
                />
                : <Empty />
        }
        const table = () => {
            const columns = [
                {
                    title: "รายการ",
                    dataIndex: "wardName",
                    render: (text, record) => (
                        <Row gutter={[2, 2]}>
                            <Col span={8}>
                                {record.rushFlag === 'Y' && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '5px', padding: '5px' }}>
                                        <WarningFilled style={{ color: '#f5222d', marginRight: 5 }} />
                                        <span style={{ color: '#f5222d' }}>ด่วน</span>
                                    </div>
                                )}
                            </Col>
                            <Col span={24}>
                                <LabelText text={`${record.timeDsp} ${record?.patientName || "-"}`} />
                            </Col>
                            <Col span={8}>
                                <LabelText text={text} />
                            </Col>
                        </Row>
                    )
                },
                {
                    title: "AN",
                    dataIndex: "an",
                    width: 85,
                },
                {
                    title: "HN",
                    dataIndex: "hn",
                    width: 85,
                },
            ]
            const rowSelection = {
                type: "radio",
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                    // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    setSelectedRowKeys(selectedRowKeys)
                    setPdf(selectedRows[0].data)
                },
            };
            return <>
                <Row justify='end' gutter={[2, 4]}>
                    <Col>
                        <Popconfirm
                            title="รับทราบ ?"
                            onConfirm={() => acceptScanDocOrder()}
                            okText="ตกลง"
                            cancelText="ปิด"
                        >
                            <Button
                                size={size}
                                type='primary'
                                style={{ margin: 0 }}
                                disabled={!pdf?.length}
                                onClick={e => {
                                    e.stopPropagation()

                                }}
                            >
                                รับทราบ
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row >
                <div style={{ zoom: "75%" }}>
                    <Table
                        size={size}
                        rowClassName="data-value pointer"
                        rowKey="scanId"
                        pagination={false}
                        scroll={{ y: 350 }}
                        columns={columns}
                        dataSource={dataSource}
                        rowSelection={rowSelection}
                    />
                </div>
            </>
        }
        return <>
            <div style={{ maxHeight: "400px" }}>
                {view()}
            </div>
            {table()}
        </>
    }
    const showContent = () => {
        return <div>
            {showDrugOrderFromWard()}
        </div>
    }
    return <div hidden={hidden}>
        <CustomSider>
            <Button
                id="sidebar-right-hidden"
                hidden
                onClick={e => {
                    e.stopPropagation()
                    setHidden(p => {
                        if (p) getScanDocOrders(true)
                        return !p
                    })
                }}
            />
            <Button
                id="sidebar-right-hidden-false"
                hidden
                onClick={e => {
                    e.stopPropagation()
                    setHidden(p => {
                        if (p) getScanDocOrders(true)
                        if (!p) getScanDocOrders(false)
                        return false
                    })
                }}
            />
            <Button
                id="sidebar-right-hidden-true"
                hidden
                onClick={e => {
                    e.stopPropagation()
                    setHidden(true)
                }}
            />
            <Sider collapsed={false} >
                <Spin spinning={loading}>
                    <Card
                        size={size}
                        className='mb-0'
                        title={<Row>
                            <Col span={21}>
                                <LabelTopicPrimary18 className='d-block' text={contentDetails?.title} />
                            </Col>
                            <Col span={3} className='text-end'>
                                <Button
                                    size={size}
                                    style={{ marginBottom: 0, marginRight: 6 }}
                                    // type='danger'
                                    shape='circle'
                                    icon={<CloseOutlined className='text-danger' />}
                                    onClick={e => {
                                        e.stopPropagation()
                                        document.getElementById("sidebar-right-hidden-true").click()
                                    }}
                                />
                            </Col>
                        </Row>}
                    >
                        <div style={{ margin: -8 }}>
                            {showContent()}
                        </div>
                    </Card>
                </Spin>
            </Sider>
        </CustomSider>
    </div>
}
const pageShowDrugOrderFromWard = [
    "ipd-prescription-ipd-drug-profile",
    "ipd-prescription-ipd-drug-charge",
    "opd-prescription-opd-drug-charge",
]
const apis = {
    GetScanDocOrderList: {
        url: "Scan/GetScanDocOrderList",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    AcceptScanDocOrderStatus: {
        url: "Scan/AcceptScanDocOrderStatus",
        method: "PUT",
        return: "data",
        sendRequest: true,
    },
    GetScanDocOrderSignalR: {
        url: "Scan/GetScanDocOrderSignalR",
        method: "GET",
        return: "data",
        sendRequest: false,
    },
}