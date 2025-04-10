import React, { useState } from 'react'
import dayjs from "dayjs";
import { callApis } from 'components/helper/function/CallApi';
import { Button, Card, Col, Form, Modal } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import FormFamilyPlan from "routes/HomeHealthcare/Components/FormFamilyPlan"
import FamilyPlanHistory from "routes/HomeHealthcare/Components/HisFamilyPlan"
import { notiSuccess, notiError } from "components/Notification/notificationX";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnFamilyPlan({
    patientId = null,
    serviceId = null,
    clinicId = null,
    doctor = null,
    optionsUser = [],
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
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadFamilyPlanHis, setReloadFamilyPlanHis] = useState(false)
    // Functions
    const insertFamilyPlan = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userCreated: user,
            dateCreated: req.crrDate,
            userModified: null,
            dateModified: null,
        }
        const res = await callApis(apis["UpsertPatientFp"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกการวางแผนครอบครัว" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกการวางแผนครอบครัว" })
            form.resetFields()
            setReloadFamilyPlanHis(p => !p)
        }
    }
    const updateFamilyPlan = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userModified: user,
            dateModified: req.crrDate,
        }
        const res = await callApis(apis["UpsertPatientFp"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขการวางแผนครอบครัว" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขการวางแผนครอบครัว" })
            form.resetFields()
            setReloadFamilyPlanHis(p => !p)
        }
    }
    const onFinishFamilyPlan = (v) => {
        const crrDate = dayjs().format("YYYY-MM-DD HH:mm:ss")
        const req = {
            ...v,
            patientId: patientId,
            serviceId: serviceId,
            clinicId: clinicId,
            dateServ: crrDate,
            crrDate: crrDate,
        }
        if (!v?.fpId) insertFamilyPlan(req)
        if (v?.fpId) updateFamilyPlan(req)
    }
    const handleClickEditFamilyPlan = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        form.setFieldsValue(v)
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='การวางแผนครอบครัว (FP)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1145}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { form.submit() }}
            onCancel={() => { setVsbModal(false) }}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12} style={{ backgroundColor: "#fafafa" }}>
                        <Form form={form} onFinish={onFinishFamilyPlan} layout='vertical'>
                            <FormFamilyPlan form={form} optionsUser={optionsUser} />
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
                                        <FamilyPlanHistory
                                            patientId={patientId}
                                            serviceId={serviceId}
                                            clinicId={clinicId}
                                            reload={reloadFamilyPlanHis}
                                            onClickEdit={v => handleClickEditFamilyPlan(v)}
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
        >วางแผนครอบครัว</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertPatientFp: {
        url: "SocialMedication/UpsertPatientFp",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}