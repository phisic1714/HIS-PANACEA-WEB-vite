import React, { useState } from 'react'
import _map from "lodash/map"
import { callApis } from 'components/helper/function/CallApi';
import { Button, Card, Col, Form, Modal, Row } from 'antd';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import { LabelTopicPrimary, LabelTopicPrimary18 } from '../helper/function/GenLabel';
import SpecialPPForm from "routes/Psychiatric/Components/SpecialPP/SpecialPPForm"
import SpecialPPHistory from "routes/Psychiatric/Components/SpecialPP/SpecialPPHistory"
import GenRow from '../helper/function/GenRow';
import dayjs from "dayjs";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnSpecialPP({
    patientId = null,
    serviceId = null,
    clinicId = null,
    doctor = null,
    type = "primary",
    disabled = false,
    width = "",
    size = "small",
    style = {},
    ...props
}) {
    // Form
    const [form] = Form.useForm()
    // State
    const [vsbModal, setVsbModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reloadHis, setReloadHis] = useState(false)
    // Functions
    const insertSpecialPP = async (v) => {
        let ppspecial = []
        _map(v.ppSpecialList, o => {
            ppspecial = [...ppspecial, o.ppspecial]
        })
        const req = {
            ppsId: null,
            patientId: patientId,
            serviceId: serviceId,
            clinicId: clinicId,
            servplace: v?.servplace || null,
            ppspecialList: ppspecial,
            ppsplace: v?.ppsplace || null,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DD HH:mm"),
            provider: v?.provider || null,
            doctor: doctor,
            // expenses: v?.expenses || []
        }
        // console.log('updateSpecialPP :>> ', req);
        setLoading(p => !p)
        const res = await callApis(apis["UpsertSpecialpp"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกการส่งเสริมป้องกันโรค" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกการส่งเสริมป้องกันโรค" })
            form.resetFields()
            form.setFieldsValue({ ppSpecialList: [{ ppsId: null }] })
            setReloadHis(p => !p)
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
            form.resetFields()
            form.setFieldsValue({ ppSpecialList: [{ ppsId: null }] })
            setReloadHis(p => !p)
        }
    }
    const onFinishSpecialPP = (v) => {
        if (v?.ppsId) updateSpecialPP(v)
        if (!v?.ppsId) insertSpecialPP(v)
    }
    // Helpers
    const handleClickEditSpecialPP = (v) => {
        form.setFieldsValue({
            ...v,
            ppSpecialList: [{ ppspecial: v?.ppspecial }]
        })
    }
    // Components
    const PartsFormSpecialPP = () => {
        return <Form form={form} onFinish={onFinishSpecialPP} layout='vertical'>
            <Card
                size={"small"}
                bordered={false}
                title={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                    <Col span={12}>
                        <LabelTopicPrimary className='ms-2' text='รายละเอียด' />
                    </Col>
                    <Col span={12} className='text-end'>
                        <Button
                            type='primary'
                            style={{ margin: 0 }}
                            onClick={e => {
                                e.stopPropagation()
                                form.resetFields()
                                form.setFieldsValue({
                                    ppSpecialList: [{ ppsId: null }]
                                })
                            }}
                        >
                            สร้างใหม่
                        </Button>
                    </Col>
                </GenRow>}
            >
                <SpecialPPForm form={form} />
            </Card>
        </Form>
    }
    const PartsSpecialPPHistory = () => {
        return <Card
            size='small'
            bordered={false}
            title={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                <Col span={24}>
                    <LabelTopicPrimary className='ms-2' text='ประวัติการให้บริการส่งเสริมการป้องกันโรคเฉพาะ' />
                </Col>
            </GenRow>}
        >
            <div style={{ margin: -8 }}>
                <GenRow>
                    <Col span={24} style={{ height: 480, overflowY: "scroll" }}>
                        <SpecialPPHistory
                            patientId={patientId}
                            onClickEdit={v => {
                                handleClickEditSpecialPP(v)
                            }}
                            reload={reloadHis}
                        />
                    </Col>
                </GenRow>
            </div>
        </Card>
    }
    const PartsModalSpecialPp = () => {
        return <Modal
            title={<Row gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='บันทึกข้อมูลการให้บริการส่งเสริมป้องกันโรคเฉพาะ Special PP' />
                </Col>
            </Row>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1000}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { form.submit() }}
            onCancel={() => setVsbModal(false)}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                <Col span={12}>
                    {PartsFormSpecialPP()}
                </Col>
                <Col span={12}>
                    {PartsSpecialPPHistory()}
                </Col>
            </Row>
        </Modal>
    }
    return <div>
        <Button
            size={size}
            type={type}
            onClick={e => {
                e.stopPropagation()
                setVsbModal(true)
            }}
            disabled={disabled}
            style={{ width: width, marginBottom: 0, ...style }}
            {...props}
        >Special PP</Button>
        {PartsModalSpecialPp()}
    </div>
}
const apis = {
    UpsertSpecialpp: {
        url: "SocialMedication/UpsertSpecialpp",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}