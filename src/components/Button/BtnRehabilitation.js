import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Card, Col, Form, Modal } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import FormRehabilitation from "routes/HomeHealthcare/Components/FormRehabilitation"
import RehabilitationHistory from "routes/HomeHealthcare/Components/HisRehabilitation"
import { notiSuccess, notiError } from "components/Notification/notificationX";
import dayjs from "dayjs";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnRehabilitation({
    patientId = null,
    serviceId = null,
    clinicId = null,
    optionsUser = [],
    type = "primary",
    disabled = false,
    width = "",
    size = "small",
    style = {},
    ...props
}) {
    // Form
    const [formRehabilitation] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadRehabilitation, setReloadRehabilitation] = useState(false)
    // Functions
    const insertRehabilitation = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userCreated: user,
            dateCreated: req.crrDate,
            userModified: null,
            dateModified: null,
        }
        const res = await callApis(apis["UpsertRehabilitation"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกข้อมูลการฟื้นฟูสมรรถภาพ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกข้อมูลการฟื้นฟูสมรรถภาพ" })
            formRehabilitation.resetFields()
            setReloadRehabilitation(p => !p)
        }
    }
    const updateRehabilitation = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userModified: user,
            dateModified: req.crrDate,
        }
        const res = await callApis(apis["UpsertRehabilitation"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขข้อมูลการฟื้นฟูสมรรถภาพ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขข้อมูลการฟื้นฟูสมรรถภาพ" })
            formRehabilitation.resetFields()
            setReloadRehabilitation(p => !p)
        }
    }
    const onFinishRehabilitation = (v) => {
        console.log('onFinishRehabilitation :>> ', v);
        const dateFormatForApi = "YYYY-MM-DD HH:mm:ss"
        const crrDate = dayjs().format(dateFormatForApi)
        const req = {
            ...v,
            patientId: patientId,
            serviceId: serviceId,
            clinicId: clinicId,
            dateStart: v?.dateStart ? dayjs(v.dateStart).format(dateFormatForApi) : null,
            dateFinish: v?.dateFinish ? dayjs(v.dateFinish).format(dateFormatForApi) : null,
            dateServ: v?.dateServ ? dayjs(v.dateServ).format(dateFormatForApi) : null,
            crrDate: crrDate,
        }
        if (!v?.rehabId) insertRehabilitation(req)
        if (v?.rehabId) updateRehabilitation(req)
    }
    const handleClickEditRehabilitation = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        const preparData = {
            ...v,
            dateServ: v?.dateServ ? dayjs(v.dateServ, "MM/DD/YYYY HH:mm:ss") : null,
            dateStart: v?.dateStart ? dayjs(v.dateStart, "MM/DD/YYYY HH:mm:ss") : null,
            dateFinish: v?.dateFinish ? dayjs(v.dateFinish, "MM/DD/YYYY HH:mm:ss") : null,
        }
        formRehabilitation.setFieldsValue(preparData)
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='บันทึกข้อมูลการฟื้นฟูสมรรถภาพ (Rehabilitation)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1145}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { formRehabilitation.submit() }}
            onCancel={() => { setVsbModal(false) }}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12} style={{ backgroundColor: "#fafafa" }}>
                        <Form form={formRehabilitation} onFinish={onFinishRehabilitation} layout='vertical'>
                            <FormRehabilitation
                                form={formRehabilitation}
                                optionsUser={optionsUser}
                                patientId={patientId}
                            />
                        </Form>
                    </Col>
                    <Col span={12}>
                        <Card
                            size='small'
                            bordered={false}
                            title={<GenRow align="middle" style={{ marginTop: -4, marginBottom: -4 }}>
                                <Col span={24}>
                                    <LabelTopicPrimary18 className='ms-2' text='ประวัติ' />
                                </Col>
                            </GenRow>}
                        >
                            <div style={{ margin: -8 }}>
                                <GenRow>
                                    <Col span={24} style={{ height: 480, overflowY: "scroll" }}>
                                        <RehabilitationHistory
                                            patientId={patientId}
                                            serviceId={serviceId}
                                            // clinicId={clinicId}
                                            reload={reloadRehabilitation}
                                            optionsUser={optionsUser}
                                            onClickEdit={v => handleClickEditRehabilitation(v)}
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
        >ฟื้นฟูสมรรถภาพ</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertRehabilitation: {
        url: "SocialMedication/UpsertRehabilitation",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}