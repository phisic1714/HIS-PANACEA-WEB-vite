import React, { useState } from 'react'
import { callApis } from 'components/helper/function/CallApi';
import { Button, Col, Form, Modal, Card } from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import dayjs from "dayjs";
import FormNutrition from "routes/HomeHealthcare/Components/FormNutrition"
import NutritionHistory from "routes/HomeHealthcare/Components/HisNutrition"

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function BtnNutrition({
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
    const [formNutrition] = Form.useForm()
    // State
    const [loading, setLoading] = useState(false)
    const [vsbModal, setVsbModal] = useState(false)
    const [reloadNutritionHis, setReloadNutritionHis] = useState(false)
    // Functions
    const insertNutritionX = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userCreated: user,
            dateCreated: req.crrDate,
            userModified: null,
            dateModified: null,
        }
        const res = await callApis(apis["UpsertNutritions"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "บันทึกข้อมูลวัดระดับโภชนาการ (Nutrition)" })
        if (res?.isSuccess) {
            notiSuccess({ message: "บันทึกข้อมูลการวัดระดับโภชนาการ (Nutrition)" })
            formNutrition.resetFields()
            setReloadNutritionHis(p => !p)
        }
    }
    const updateNutrition = async (req) => {
        setLoading(p => !p)
        const temp = {
            ...req,
            userModified: user,
            dateModified: req.crrDate,
        }
        const res = await callApis(apis["UpsertNutritions"], temp)
        setLoading(p => !p)
        if (!res?.isSuccess) notiError({ message: "แก้ไขข้อมูลวัดระดับโภชนาการ (Nutrition)" })
        if (res?.isSuccess) {
            notiSuccess({ message: "แก้ไขข้อมูลวัดระดับโภชนาการ (Nutrition)" })
            formNutrition.resetFields()
            setReloadNutritionHis(p => !p)
        }
    }
    const onFinishNutrition = (v) => {
        console.log('onFinishNutrition :>> ', v);
        const dateFormatForApi = "YYYY-MM-DD HH:mm:ss"
        const crrDate = dayjs()
        const req = {
            ...v,
            patientId: patientId,
            serviceId: serviceId,
            clinicId: clinicId,
            crrDate: crrDate,
            dateServ: crrDate,
        }
        if (!v?.nutritionId) insertNutritionX(req)
        if (v?.nutritionId) updateNutrition(req)
    }
    const handleClickEditNutrition = (v) => {
        // console.log('handleClickEditRateIcf :>> ', v);
        formNutrition.setFieldsValue(v)
    }
    // Components
    const PartsModal = () => {
        return <Modal
            title={<GenRow gutter={[4, 8]} align="middle" style={{ marginTop: -8, marginBottom: -8 }}>
                <Col>
                    <LabelTopicPrimary18 text='บันทึกข้อมูลวัดระดับโภชนาการ (Nutrition)' />
                </Col>
            </GenRow>}
            centered
            visible={vsbModal}
            // closeIcon={false}
            closable={false}
            width={1145}
            cancelText="ปิด"
            okText="บันทึก"
            onOk={() => { formNutrition.submit() }}
            onCancel={() => { setVsbModal(false) }}
            okButtonProps={{ loading: loading }}
            cancelButtonProps={{ loading: loading }}
        >
            <div style={{ margin: -14 }}>
                <GenRow>
                    <Col span={12}>
                        <Form
                            form={formNutrition}
                            onFinish={onFinishNutrition}
                            layout='vertical'
                        // initialValues={{
                        // 	chronicfuplace: hosParam?.hospCode
                        // }}
                        >
                            <FormNutrition
                                form={formNutrition}
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
                                        <NutritionHistory
                                            form={formNutrition}
                                            optionsUser={optionsUser}
                                            patientId={patientId}
                                            serviceId={serviceId}
                                            reload={reloadNutritionHis}
                                            onClickEdit={v => handleClickEditNutrition(v)}
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
        >Nutrition</Button>
        {
            vsbModal && PartsModal()
        }
    </div>
}
const apis = {
    UpsertNutritions: {
        url: "SocialMedication/UpsertNutritions",
        method: "POST",
        return: "data",
        sendRequest: true,
    },
}