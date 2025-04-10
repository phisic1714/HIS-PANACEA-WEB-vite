import React, { useState, useEffect } from 'react'
import { Button, Modal, Table } from 'antd'
import { callApis } from 'components/helper/function/CallApi'
import _find from "lodash/find"
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function SelectOpdClinicsByServiceId({
    size = "small",
    serviceId = null,
    clinicId = null,
    workId = null,
    onSelect = () => { },
    visible = false,
    setVisible = () => { },
}) {
    // State
    const [loading, setLoading] = useState(false)
    const [vsb, setVsb] = useState(false)
    const [options, setOptions] = useState([])
    // Funcs
    const getOpdClinics = async (serviceId, reload = false) => {
        if (!serviceId) return setOptions([])
        setLoading(p => !p)
        const clinics = await callApis(apis["GetOptions"], serviceId)
        setLoading(p => !p)
        setOptions(clinics)
        if (reload) return
        if (!clinics?.length) return
        if (clinics?.length === 1) return onSelect(clinics[0])
        if (clinics?.length > 1) {
            const findByWorkId = _find(clinics, ["workId", workId])
            if (findByWorkId) return onSelect(findByWorkId)
            const findByUser = _find(clinics, ["doctor", user])
            if (findByUser) return onSelect(findByUser)
            setVsb(true)
        }
    }
    // Effect
    useEffect(() => {
        getOpdClinics(serviceId)
    }, [serviceId])

    const columns = [
        {
            title: "ClinicId",
            dataIndex: "clinicId",
            width: 90,
        },
        {
            title: "ห้องตรวจ",
            dataIndex: "workName",
            // width: 100,
        },
        {
            title: "แพทย์",
            dataIndex: "doctorName",
            width: 245,
        },
    ]

    return <Modal
        centered
        closable={false}
        visible={visible || vsb}
        title={<label className='gx-text-primary fw-bold fs-6'>เลือกรายการ Clinics</label>}
        onCancel={() => {
            setVsb(false)
            setVisible(false)
        }}
        cancelText="ปิด"
        okButtonProps={{ hidden: true }}
        width={600}
    >
        <Button hidden
            id="reload-SelectOpdClinicsByServiceId"
            onClick={e => {
                e.stopPropagation()
                getOpdClinics(serviceId, true)
                console.log('reload-SelectOpdClinicsByServiceId :>> ');
            }}
        />
        <Table
            loading={loading}
            scroll={{ y: 400 }}
            size={size}
            columns={columns}
            dataSource={options}
            rowClassName={record => record?.clinicId === clinicId ? "bg-info data-value" : "pointer data-value"}
            onRow={(record) => {
                return {
                    onClick: e => {
                        e.stopPropagation()
                        if (record?.clinicId === clinicId) return
                        onSelect(record)
                        setVsb(false)
                        setVisible(false)
                    }, // click row
                };
            }}
            pagination={false}
        />
    </Modal>
}

const apis = {
    GetOptions: {
        url: "OPDClinic/GetOpdClinicsList/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
