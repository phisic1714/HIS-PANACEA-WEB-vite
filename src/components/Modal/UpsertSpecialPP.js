import React, { useState, useEffect } from 'react'
import { Modal, Form, Row, Col, Card, Button, Spin } from 'antd'
import _map from "lodash/map"
import dayjs from 'dayjs'
import { callApis } from 'components/helper/function/CallApi';
import { notiError, notiSuccess } from 'components/Notification/notificationX';
import { rowProps, } from 'props'
import { LabelTopicPrimary } from 'components/helper/function/GenLabel';
import SpecialPPForm from 'routes/Psychiatric/Components/SpecialPP/SpecialPPForm';
import SpecialPPHistory from 'routes/Psychiatric/Components/SpecialPP/SpecialPPHistory';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function UpsertSpecialPP({
    visible = false,
    setVisible = () => { },
    patientId = null,
    serviceId = null,
    clinicId = null,
    doctor = null,
}) {
    // Form
    const [formSpecialPP] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [reloadSpecialPPHis, setReloadSpecialPPHis] = useState(false)
    // Funcs
    const insertSpecialPP = async (v) => {
        let ppspecial = []
        _map(v.ppSpecialList, o => {
            ppspecial = [...ppspecial, o.ppspecial]
        })
        const req = {
            ppsId: null,
            patientId: patientId || null,
            serviceId: serviceId || null,
            clinicId: clinicId || null,
            servplace: v?.servplace || null,
            ppspecialList: ppspecial,
            ppsplace: v?.ppsplace || null,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
            provider: v?.provider || null,
            doctor: doctor || null,
            // expenses: v?.expenses || []
        }
        // console.log('updateSpecialPP :>> ', req);
        setLoading(p => !p)
        const res = await callApis(apis["UpsertSpecialpp"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกการส่งเสริมป้องกันโรค" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกการส่งเสริมป้องกันโรค" })
            formSpecialPP.resetFields()
            formSpecialPP.setFieldsValue({ ppSpecialList: [{ ppsId: null }] })
            setReloadSpecialPPHis(p => !p)
        }
    }
    const updateSpecialPP = async (v) => {
        const ppspecial = v.ppSpecialList[0].ppspecial
        const req = {
            ppsId: v?.ppsId || null,
            patientId: v?.patientId || null,
            serviceId: v?.serviceId || null,
            clinicId: v?.clinicId || null,
            servplace: v?.servplace || null,
            ppspecialList: [ppspecial],
            ppsplace: v?.ppsplace || null,
            userModified: user,
            dateModified: dayjs().format("YYYY-MM-DD HH:mm"),
            provider: v?.provider || null,
            doctor: doctor || null,
            expenses: v?.expenses || []
        }
        // console.log('updateSpecialPP :>> ', req);
        setLoading(p => !p)
        const res = await callApis(apis["UpsertSpecialpp"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขการส่งเสริมป้องกันโรค" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขการส่งเสริมป้องกันโรค" })
            formSpecialPP.resetFields()
            formSpecialPP.setFieldsValue({ ppSpecialList: [{ ppsId: null }] })
            setReloadSpecialPPHis(p => !p)
        }
    }
    const onFinishSpecialPP = (v) => {
        if (v?.ppsId) updateSpecialPP(v)
        if (!v?.ppsId) insertSpecialPP(v)
    }
    // Funcs Handles
    const handleClickEditSpecialPP = (v) => {
        // console.log('handleClickEditSpecialPP :>> ', v);
        formSpecialPP.setFieldsValue({
            ...v,
            ppSpecialList: [{ ppspecial: v?.ppspecial }]
        })
    }
    // Components
    const PartsForm = () => {
        return <Form form={formSpecialPP} onFinish={onFinishSpecialPP} layout='vertical'>
            <Card
                size='small'
                bordered={false}
                title={<Row align="middle" style={{ marginTop: -4, marginBottom: -4, flexDirection: "row" }}>
                    <Col span={12}>
                        <LabelTopicPrimary className='ms-2' text='รายละเอียด' />
                    </Col>
                    <Col span={12} className='text-end'>
                        <Button
                            type='primary'
                            style={{ margin: 0 }}
                            onClick={e => {
                                e.stopPropagation()
                                formSpecialPP.resetFields()
                                formSpecialPP.setFieldsValue({
                                    ppSpecialList: [{ ppsId: null }]
                                })
                            }}
                        >
                            สร้างใหม่
                        </Button>
                    </Col>
                </Row>}
            >
                <SpecialPPForm form={formSpecialPP} />
            </Card>
        </Form>
    }
    const PartHis = () => {
        return <Card
            size='small'
            bordered={false}
            title={<Row {...rowProps} align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                <Col span={24}>
                    <LabelTopicPrimary className='ms-2' text='ประวัติการให้บริการส่งเสริมการป้องกันโรคเฉพาะ' />
                </Col>
            </Row>}
        >
            <div style={{ margin: -8 }}>
                <Row {...rowProps}>
                    <Col span={24} style={{ height: 480, overflowY: "scroll" }}>
                        <SpecialPPHistory
                            patientId={patientId}
                            onClickEdit={v => {
                                handleClickEditSpecialPP(v)
                            }}
                            reload={reloadSpecialPPHis}
                        />
                    </Col>
                </Row>
            </div>
        </Card>
    }
    return <Modal
        title={<label className='gx-text-primary fw-bold fs-5'>บันทึกข้อมูลการให้บริการส่งเสริมการป้องกันโรคเฉพาะ Special PP</label>}
        centered
        visible={visible}
        width={1225}
        okText="บันทึก"
        cancelText="ปิด"
        onOk={() => formSpecialPP.submit()}
        onCancel={() => {
            formSpecialPP.resetFields()
            setVisible()
        }}
        okButtonProps={{
            loading: loading,
        }}
    >
        <Spin spinning={loading}>
            <Row {...rowProps}>
                <Col span={12}>
                    {PartsForm()}
                </Col>
                <Col span={12}>
                    {PartHis()}
                </Col>
            </Row>
        </Spin>
    </Modal>
}
const apis = {
    UpsertSpecialpp: {
        url: "SocialMedication/UpsertSpecialpp",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}
