// CommunityService
import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Col, Form, Modal, Card } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary, LabelTopicPrimary18 } from '../helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import dayjs from "dayjs";
import CommunityServiceForm from "routes/Psychiatric/Components/CommunityService/CommunityServiceForm"
import CommunityServiceHistory from "routes/Psychiatric/Components/CommunityService/CommunityServiceHistory"

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnCommunityService({
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
    const [formCommunityService] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadCommunityServiceHis, setReloadCommunityServiceHis] = useState(false)
    // Functions
    const insertCommunityService = async (v) => {
        // console.log('insertCommunityService :>> ', v);
        const req = {
            ...v,
            patientId: patientId || null,
            serviceId: serviceId || null,
            clinicId: clinicId || null,
            doctor: doctor || null,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
            dateServ: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }
        setLoading(p => !p)
        const res = await callApis(apis["UpsertCommunityService"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกการให้บริการชุมชนในเขตรับผิดชอบ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกการให้บริการชุมชนในเขตรับผิดชอบ" })
            formCommunityService.resetFields()
            setReloadCommunityServiceHis(p => !p)
        }
    }
    const updateCommunityService = async (v) => {
        // console.log('insertCommunityService :>> ', v);
        const req = {
            ...v,
            userModified: user,
            dateModified: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        }
        setLoading(p => !p)
        const res = await callApis(apis["UpsertCommunityService"], req)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขการให้บริการชุมชนในเขตรับผิดชอบ" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขการให้บริการชุมชนในเขตรับผิดชอบ" })
            formCommunityService.resetFields()
            setReloadCommunityServiceHis(p => !p)
        }
    }
    const onFinishCommunityService = (v) => {
        if (!v?.commId) insertCommunityService(v)
        if (v?.commId) updateCommunityService(v)
    }
    const handleClickEditCommunityService = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        formCommunityService.setFieldsValue(v)
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='บันทึกการให้บริการชุมชนในเขตรับผิดชอบ (Community service)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1145}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { formCommunityService.submit() }}
            onCancel={() => setVsbModal(false)}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12}>
                        <Form form={formCommunityService} onFinish={onFinishCommunityService} layout='vertical'>
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
                                                formCommunityService.resetFields()
                                            }}
                                        >
                                            สร้างใหม่
                                        </Button>
                                    </Col>
                                </GenRow>}
                            >
                                <CommunityServiceForm
                                    form={formCommunityService}
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
                                    <LabelTopicPrimary className='ms-2' text='ประวัติการให้บริการชุมชนในเขตรับผิดชอบ' />
                                </Col>
                            </GenRow>}
                        >
                            <div style={{ margin: -8 }}>
                                <GenRow>
                                    <Col span={24} style={{ height: 480, overflowY: "scroll" }}>
                                        <CommunityServiceHistory
                                            patientId={patientId}
                                            onClickEdit={v => {
                                                handleClickEditCommunityService(v)
                                            }}
                                            reload={reloadCommunityServiceHis}
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
        >Community service</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertCommunityService: {
        url: "SocialMedication/UpsertCommunityService",
        method: "POST",
        return: "data",
        sendRequest: true
    },
}