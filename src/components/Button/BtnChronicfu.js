import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Card, Col, Form, Modal } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import dayjs from "dayjs";
import FormChronicfu from "routes/HomeHealthcare/Components/FormChronicfu"
import ChronicFuHistory from "routes/HomeHealthcare/Components/HisChronicFu"

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
export default function BtnChronicfu({
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
    const [formChronicfu] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadChronicfuHis, setReloadChronicfuHis] = useState(false)
    // Functions
    const insertChronicFu = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userCreated: user,
            dateCreated: req.crrDate,
            userModified: null,
            dateModified: null,
        }
        const res = await callApis(apis["UpsertChronicfu"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกข้อมูลการตรวจติดตามโรคเรื้อรัง" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกข้อมูลการการตรวจติดตามโรคเรื้อรัง" })
            formChronicfu.resetFields()
            setReloadChronicfuHis(p => !p)
        }
    }
    const updateChronicFu = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userModified: user,
            dateModified: req.crrDate,
        }
        const res = await callApis(apis["UpsertChronicfu"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขข้อมูลการตรวจติดตามโรคเรื้อรัง" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขข้อมูลการตรวจติดตามโรคเรื้อรัง" })
            formChronicfu.resetFields()
            setReloadChronicfuHis(p => !p)
        }
    }
    const onFinishChronicfu = (v) => {
        console.log('onFinishChronicfu :>> ', v);
        const dateFormatForApi = "YYYY-MM-DD HH:mm:ss"
        const crrDate = dayjs().format(dateFormatForApi)
        const req = {
            ...v,
            patientId: patientId,
            serviceId: serviceId,
            clinicId: clinicId,
            crrDate: crrDate,
            dateServ: crrDate,
        }
        if (!v?.chronicfuId) insertChronicFu(req)
        if (v?.chronicfuId) updateChronicFu(req)
    }
    const handleClickEditChronicFu = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        formChronicfu.setFieldsValue(v)
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='ติดตามผู้ป่วยโรคเรื้อรัง (CHRONICFU)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1145}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { formChronicfu.submit() }}
            onCancel={() => { setVsbModal(false) }}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12}>
                        <Form
                            form={formChronicfu}
                            onFinish={onFinishChronicfu}
                            layout='vertical'
                            initialValues={{
                                chronicfuplace: hosParam?.hospCode
                            }}
                        >
                            <FormChronicfu
                                form={formChronicfu}
                                optionsUser={optionsUser}
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
                                        <ChronicFuHistory
                                            form={formChronicfu}
                                            optionsUser={optionsUser}
                                            patientId={patientId}
                                            serviceId={serviceId}
                                            reload={reloadChronicfuHis}
                                            onClickEdit={v => handleClickEditChronicFu(v)}
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
        >CHRONICFU</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertChronicfu: {
        url: "SocialMedication/UpsertChronicfu",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}