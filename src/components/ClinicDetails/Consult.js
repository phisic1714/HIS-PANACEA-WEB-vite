/* eslint-disable react-hooks/exhaustive-deps */
import { Col, Form, Input, Radio } from 'antd';
import { LabelTextPrimary, } from "components/helper/function/GenLabel";
import GenRow from 'components/helper/function/GenRow';
import { useEffect, useState } from 'react';
import ConsultPictures from "../../routes/OpdClinic/Components/ConsultPictures";
import { callApiObject } from '../helper/function/CallApi';
export default function Consult({
    clinicId = null,
    form,
    onFinish = () => { },
    reloadConsult = false,
    onValuesChange = () => { },
}) {
    // State
    const [optionsSenConsult, setOptionsSenConsult] = useState([])
    const [recieveConsult, setRecieveConsult] = useState(null)
    // Funcs
    const getSendConsult = async (clinicId) => {
        if (!clinicId) return form.setFieldsValue({ sendConsults: [], recieveConsult: [] });
        const [
            sendConsults,
            recieveConsult,
        ] = await Promise.all([
            callApiObject(apis, "GetSendConsultDetail", clinicId),
            callApiObject(apis, "GetConsultDetail", clinicId),
        ])

        setOptionsSenConsult(sendConsults)
        setRecieveConsult(recieveConsult)
        form.setFieldsValue({
            sendConsults: sendConsults,
            recieveConsult: ((recieveConsult?.consultId || recieveConsult?.admitId) && recieveConsult?.doctor !== "-") ? [recieveConsult] : []
        })
    }
    const setIsEdit = (listName, name) => {
        form.setFields([{ name: [listName, name, "isEdit"], value: true, }]);
    }
    // Effect
    useEffect(() => {
        getSendConsult(clinicId)
    }, [clinicId, reloadConsult])

    const PartsSendConsult = () => {
        return <Form.List name="sendConsults">
            {(fields) => (
                <>
                    {fields.map(({ key, name, }) => {
                        const record = optionsSenConsult[name]
                        return <div key={key}
                            style={{
                                border: "1px solid #eee",
                                boxShadow: "0 1px 1px 0 #BDBDBD",
                                marginBottom: 6,
                                paddingLeft: 4,
                                paddingRight: 4,
                                borderRadius: 4
                            }}>
                            {hiddenItems.map(o => <Form.Item key={o} hidden name={[name, o]}> <Input /></Form.Item>)}
                            <GenRow>
                                <Col span={8}>
                                    <LabelTextPrimary text='แพทย์' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.doctor ? record?.doctorName : "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='หน่วยส่ง' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.workName || "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='เรื่องที่ Consult' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.consult || "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='เหตุผล' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.consultReason || "-"}
                                    </p>
                                </Col>
                                <Col span={24}>
                                    <GenRow align="middle">
                                        <Col span={8}>
                                            <LabelTextPrimary text='สถานะ' />
                                        </Col>
                                        <Col span={16}>
                                            <Form.Item name={[name, 'consultStatus']} style={{ margin: 0 }} >
                                                <Radio.Group disabled>
                                                    <Radio value={"Y"}>รับ Consult</Radio>
                                                    <Radio value={"N"}>ปฏิเสธ</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>
                                    </GenRow>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='Sugguestion' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.sugguestion || "-"}
                                    </p>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={<LabelTextPrimary text='Comment' />}
                                        name={[name, 'otherRemark']}
                                        style={{ margin: 0 }}
                                    >
                                        <Input.TextArea rows={2} onChange={() => setIsEdit("sendConsults", name)} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <ConsultPictures clinicId={record?.clinicId} outConsultFlag={record?.outconsultFlag} />
                                </Col>
                            </GenRow>
                        </div>
                    })}
                </>
            )}
        </Form.List>
    }
    const PartsRecieveConsult = () => {
        return <Form.List name="recieveConsult">
            {(fields) => (
                <>
                    {fields.map(({ key, name, }) => {
                        const record = recieveConsult
                        return <div key={key}
                            style={{
                                border: "1px solid #eee",
                                boxShadow: "0 1px 1px 0 #BDBDBD",
                                marginBottom: 6,
                                paddingLeft: 4,
                                paddingRight: 4,
                                borderRadius: 4
                            }}>
                            {hiddenItems.map(o => <Form.Item key={o} hidden name={[name, o]}> <Input /></Form.Item>)}
                            <GenRow>
                                <Col span={8}>
                                    <LabelTextPrimary text='แพทย์' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.doctor ? record?.doctorName : "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='หน่วยส่ง' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.workName || "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='เรื่องที่ Consult' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.consult || "-"}
                                    </p>
                                </Col>
                                <Col span={8}>
                                    <LabelTextPrimary text='เหตุผล' />
                                </Col>
                                <Col span={16}>
                                    <p className='data-value' style={{ wordBreak: "break-all", margin: 0 }}>
                                        {record?.consultReason || "-"}
                                    </p>
                                </Col>
                                <Col span={24}>
                                    <GenRow align="middle">
                                        <Col span={8}>
                                            <LabelTextPrimary text='สถานะ' />
                                        </Col>
                                        <Col span={16}>
                                            <Form.Item name={[name, 'consultStatus']} style={{ margin: 0 }} >
                                                <Radio.Group onChange={() => setIsEdit("recieveConsult", name)}>
                                                    <Radio value={"Y"}>รับ Consult</Radio>
                                                    <Radio value={"N"}>ปฏิเสธ</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>
                                    </GenRow>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={<LabelTextPrimary text='Sugguestion' />}
                                        name={[name, 'sugguestion']}
                                        style={{ margin: 0 }}
                                    >
                                        <Input.TextArea rows={2} onChange={() => setIsEdit("recieveConsult", name)} maxLength={1000} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={<LabelTextPrimary text='Comment' />}
                                        name={[name, 'otherRemark']}
                                        style={{ margin: 0 }}
                                    >
                                        <Input.TextArea rows={2} onChange={() => setIsEdit("recieveConsult", name)} maxLength={1000} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <ConsultPictures clinicId={record?.clinicId} outConsultFlag={record?.outconsultFlag} />
                                </Col>
                            </GenRow>
                        </div>
                    })}
                </>
            )}
        </Form.List>
    }
    return <Form form={form} onFinish={onFinish} layout="vertical" onValuesChange={onValuesChange}>
        {PartsSendConsult()}
        {PartsRecieveConsult()}
    </Form>
}
const hiddenItems = ["admitId", "consultId", "ward", "workId", "doctor", "urgent", "consultStatus", "sugguestion", "outconsultFlag", "isEdit"]

const apis = {
    GetSendConsultDetail: {
        name: "GetSendConsultDetail",
        url: "Dental/GetSendConsultDetail/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
    GetConsultDetail: {
        name: "GetConsultDetail",
        url: "Dental/GetConsultDetail/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}