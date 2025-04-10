import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Card, Col, Form, Modal } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary, LabelTopicPrimary18 } from '../helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import RateIcfForm from "routes/Psychiatric/Components/RateIcf/RateIcfForm"
import RateIcfHistory from "routes/Psychiatric/Components/RateIcf/RateIcfHistory"
import dayjs from "dayjs";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnRateIcf({
    patientId = null,
    serviceId = null,
    clinicId = null,
    workId = null,
    optionsUser = [],
    type = "primary",
    disabled = false,
    width = "",
    size = "small",
    style = {},
    ...props
}) {
    // Form
    const [formRateIcf] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadRateIcfHis, setReloadRateIcfHis] = useState(false)
    // Functions
    const insertRateIcf = async (v) => {
        console.log('insertRateIcf :>> ', v);
        const req = {
            ...v,
            patientId: patientId || null,
            serviceId: serviceId || null,
            clinicId: clinicId || null,
            workId: workId || null,
            dateServ: v?.dateServ ? dayjs(v.dateServ).format("YYYY-MM-DDTHH:mm:ss") : null,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }
        setLoading(p => !p)
        const res = await callApis(apis["UpsertPatientICF"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกการประเมินภาวะสุขภาพ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกการประเมินภาวะสุขภาพ" })
            formRateIcf.resetFields()
            setReloadRateIcfHis(p => !p)
        }
    }
    const updateRateIcf = async (v) => {
        // console.log('updateRateIcf :>> ', v);
        const req = {
            ...v,
            dateServ: v?.dateServ ? dayjs(v.dateServ).format("YYYY-MM-DDTHH:mm:ss") : null,
            dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            userModified: user,
        }
        setLoading(p => !p)
        const res = await callApis(apis["UpsertPatientICF"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขการประเมินภาวะสุขภาพ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขการประเมินภาวะสุขภาพ" })
            formRateIcf.resetFields()
            setReloadRateIcfHis(p => !p)
        }
    }
    const onFinishRateIcf = (v) => {
        // console.log('onFinishRateIcf :>> ', v);
        if (!v?.icfId) insertRateIcf(v)
        if (v?.icfId) updateRateIcf(v)
    }
    const handleClickEditRateIcf = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        formRateIcf.setFieldsValue({
            ...v,
            dateServ: v.dateServ ? dayjs(v.dateServ) : null,
        })
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='บันทึกการประเมินภาวะสุขภาพ (ICF)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1000}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { formRateIcf.submit() }}
            onCancel={() => setVsbModal(false)}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12}>
                        <Form form={formRateIcf} onFinish={onFinishRateIcf} layout='vertical'>
                            <Card
                                size='small'
                                bordered={false}
                                title={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                                    <Col span={12}>
                                        <LabelTopicPrimary className='ms-2' text='รายละเอียด' />
                                    </Col>
                                    <Col span={12} className='text-end'>
                                        <Button
                                            type='primary'
                                            style={{ marginBottom: 0, marginRight: 4 }}
                                            onClick={e => {
                                                e.stopPropagation()
                                                formRateIcf.resetFields()
                                            }}
                                        >
                                            สร้างใหม่
                                        </Button>
                                    </Col>
                                </GenRow>}
                            >
                                <RateIcfForm
                                    form={formRateIcf}
                                    user={optionsUser}
                                />
                            </Card>
                        </Form>
                    </Col>
                    <Col span={12}>
                        <Card
                            size='small'
                            bordered={false}
                            title={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                                <Col span={24}>
                                    <LabelTopicPrimary className='ms-2' text='ประวัติการประเมินสภาวะสุขภาพ' />
                                </Col>
                            </GenRow>}
                        >
                            <div style={{ margin: -8 }}>
                                <GenRow>
                                    <Col span={24} style={{ height: 480, overflowY: "scroll" }}>
                                        <RateIcfHistory
                                            patientId={patientId}
                                            onClickEdit={v => {
                                                handleClickEditRateIcf(v)
                                            }}
                                            reload={reloadRateIcfHis}
                                        />
                                    </Col>
                                </GenRow>
                            </div>
                        </Card>
                    </Col>
                </GenRow>
            </div>
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
        >ประเมินสภาวะสุขภาพ</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertPatientICF: {
        url: "SocialMedication/UpsertPatientICF",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}