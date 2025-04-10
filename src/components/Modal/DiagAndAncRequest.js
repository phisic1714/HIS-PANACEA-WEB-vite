import React, { useEffect } from 'react'
import {
    Modal, Form, Avatar, Image, Divider
} from 'antd';
import {
    LabelTopicPrimary18,
    LabelTopic,
} from "../../components/helper/function/GenLabel"
import GenFormItem from '../../components/helper/function/GenFormItem';
import GenRow from "../../components/helper/function/GenRow"
import GenCol from "../../components/helper/function/GenCol"
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

export default function DiagAndAncRequest({
    visible,
    close = () => { },
    onSave = () => { },
    patient = {},
    prev = null,
}) {

    const { opdPatientDetail } = useSelector(({ opdPatientDetail }) => opdPatientDetail)
    console.log('patient :>> ', patient);
    // Form
    const [form] = Form.useForm()
    const onFinish = (v) => {
        onSave(v)
    }
    const defaultForm = (dataSource) => {
        form.setFieldsValue({
            diagnosisL: dataSource?.diagnosisL || null,
            ancL: dataSource?.ancL || null,
            ancnoL: dataSource?.ancnoL || null,
        })
    }
    useEffect(() => {
        defaultForm(prev)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prev])

    const PartsHeader = () => {
        return (
            <GenRow>
                <GenCol fixSpan={true} span={3} className="text-center">
                    {patient?.picture
                        ? <Avatar
                            size={60}
                            src={<Image src={`data:image/jpeg;base64,${patient.picture}`} />}
                        />
                        : <Avatar size={60}>Patient</Avatar>
                    }
                </GenCol>
                <GenCol fixSpan={true} span={21}>
                    <GenRow>
                        <GenCol fixSpan={true} span={24}>
                            <LabelTopicPrimary18 className='me-2' text="AN" />
                            <LabelTopic className='me-3' text={opdPatientDetail?.an || "-"} />
                            <LabelTopicPrimary18 className='me-2' text="HN" />
                            <LabelTopic className='me-3' text={patient?.hn || "-"} />
                            {/* <LabelTopicPrimary18 className='me-2' text="ID Card" />
                            <LabelTopic className='' text={patient?.idCard || "-"} /> */}
                        </GenCol>
                        <GenCol fixSpan={true} span={24}>
                            <LabelTopicPrimary18 className='me-2' text="ชื่อ" />
                            <LabelTopic
                                className='me-3'
                                text={(opdPatientDetail?.displayName?.split(" ").slice(1).join(" ") || "ชื่อ -") + " " + opdPatientDetail?.idCard}
                            />
                            {opdPatientDetail?.gender === "M" && <ManOutlined style={{ color: "blue" }} />}
                            {opdPatientDetail?.gender === "F" && <WomanOutlined style={{ color: "pink" }} />}
                            <LabelTopicPrimary18 className='ms-2 me-2' text="อายุ" />
                            <LabelTopic className='' text={opdPatientDetail?.ageYear || "-"} />
                        </GenCol>
                    </GenRow>
                </GenCol>
            </GenRow>
        )
    }
    const PartsForm = () => {
        const formItems = [
            {
                name: "diagnosisL",
                label: false,
                inputType: "textArea",
            },
            {
                name: "ancL",
                label: false,
                inputType: "inputNumber",
            },
            {
                name: "ancnoL",
                label: false,
                inputType: "inputNumber",
            },
        ]
        return (
            <Form
                form={form}
                onFinish={onFinish}
                layout='vertical'
            >
                <GenRow align="middle">
                    <GenCol fixSpan={true} span={6} className='text-end'>
                        <LabelTopic text='Diagnosis :' />
                    </GenCol>
                    <GenCol fixSpan={true} span={18}>
                        <GenFormItem genCol={false} items={formItems} itemName={"diagnosisL"} />
                    </GenCol>
                </GenRow>
                <GenRow align="middle">
                    <GenCol fixSpan={true} span={6} className='text-end'>
                        <LabelTopic text='อายุครรภ์ :' />
                    </GenCol>
                    <GenCol fixSpan={true} span={5}>
                        <GenFormItem genCol={false} items={formItems} itemName={"ancL"} />
                    </GenCol>
                    <GenCol noSpan={true}>
                        <LabelTopic text='สัปดาห์' />
                    </GenCol>
                </GenRow>
                <GenRow align="middle">
                    <GenCol fixSpan={true} span={6} className='text-end'>
                        <LabelTopic text='ครรภ์ที่ :' />
                    </GenCol>
                    <GenCol fixSpan={true} span={5}>
                        <GenFormItem genCol={false} items={formItems} itemName={"ancnoL"} />
                    </GenCol>
                </GenRow>
            </Form>
        )
    }
    return (
        <Modal
            forceRender
            centered
            width={800}
            closable={false}
            closeIcon={false}
            visible={visible}
            onCancel={() => close()}
            onOk={() => form.submit()}
            cancelText={"ออก"}
            okText={"บันทึก"}
        >
            {PartsHeader()}
            <Divider />
            {PartsForm()}
        </Modal>
    )
}
