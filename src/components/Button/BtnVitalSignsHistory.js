import React, { useEffect, useState } from 'react'
import { Button, Modal, Table, Statistic } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import dayjs from 'dayjs';

export default function BtnVitalSignsHis({
    btnType = 'primary',
    btnSize = "small",
    btnClassName = "",
    disabled = false,
    patientId = null,
    vitalSignsHis = null,
    ...props
}) {
    // State
    const [vsbModal, setVsbModal] = useState(false)
    const [dataSource, setDataSource] = useState([])
    // Get Functions
    const getVitalSignsHis = async (patientId) => {
        if (vitalSignsHis) return setDataSource(vitalSignsHis)
        if (!patientId) return setDataSource([])
        const result = await callApis(apis["GetVitalSignsDisplay"], patientId)
        setDataSource(result || [])
    }
    // Effects
    useEffect(() => {
        getVitalSignsHis(patientId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, vitalSignsHis])

    // Components
    const PartsTable = () => {
        const dts = dataSource?.filter(o => o?.bodyTemperature
            || o?.pulse
            || o?.respiratory
            || o?.bpSystolic
            || o?.bpDiastolic
            // || o?.map
        )
        const showNumbers = (number, precision) => {
            if (!number) return
            return <Statistic value={number} valueStyle={{ fontSize: 15 }} precision={precision} />
        }
        const columns = [
            {
                title: "วันที่",
                dataIndex: "dateCreated",
                width: 130,
                align: "center",
                render: (v) => {
                    const dateTime = v ? dayjs(v, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm") : "-"
                    return dateTime
                }
            },
            {
                title: "อุณหภูมิ",
                dataIndex: "bodyTemperature",
                render: (v) => showNumbers(v, 2)
            },
            {
                title: "ชีพจร",
                dataIndex: "pulse",
                render: (v) => showNumbers(v, 0)
            },
            {
                title: "การหายใจ",
                dataIndex: "respiratory",
                render: (v) => showNumbers(v, 0)
            },
            {
                title: "Systolid",
                dataIndex: "bpSystolic",
                render: (v) => showNumbers(v, 0)
            },
            {
                title: "Daistolid",
                dataIndex: "bpDiastolic",
                render: (v) => showNumbers(v, 0)
            },
            {
                title: "MAP",
                dataIndex: "map",
                render: (v) => showNumbers(v, 2)
            },
        ]
        return <Table
            size='small'
            rowClassName="data-value"
            rowKey="vitalsignId"
            pagination={false}
            scroll={{ y: 445 }}
            columns={columns}
            dataSource={dts}
        />
    }
    const PartsModal = () => {
        return <Modal
            centered
            width={800}
            title={<label className='gx-text-primary fs-5 fw-bold'>ประวัติ Vital signs</label>}
            visible={vsbModal}
            cancelText="ปิด"
            onCancel={() => setVsbModal(false)}
            okButtonProps={{
                hidden: true,
            }}
        >
            <div style={{ margin: -20 }}>
                {PartsTable()}
            </div>
        </Modal>
    }
    return <div>
        <Button
            style={{ marginBottom: 0 }}
            type={btnType}
            size={btnSize}
            className={btnClassName}
            disabled={disabled}
            onClick={e => {
                e.stopPropagation()
                setVsbModal(true)
            }}
            {...props}
        >ประวัติ Vital signs</Button>
        {PartsModal()}
    </div>
}
const apis = {
    GetVitalSignsDisplay: {
        url: "IpdWard/GetVitalSignsDisplay/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}