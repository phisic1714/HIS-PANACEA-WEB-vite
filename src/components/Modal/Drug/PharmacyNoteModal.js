import React, { useEffect } from 'react'
import { Modal, Row, Input, Button, Form } from 'antd';
import axios from 'axios';
import { env } from '../../../env.js';
import { toast } from "react-toastify";
import { toastTopRight } from 'components/Notification/toast.js';
import PropTypes from "prop-types";
const { TextArea } = Input;

export default function PharmacyNoteModal({ visible, setVisible, getFinancesOrder, financeId, pharmacyNoteId, pharmacyNote }) {
    const [form] = Form.useForm();
    
    const upsertPharmacyNote = async(value) => {
        const userFromSession = JSON.parse(sessionStorage.getItem('user'));
        let user = userFromSession.responseData.userId;
        let requestData = {
            "requestData": {
                "pharmacyNoteId": pharmacyNoteId,
                "financeId": financeId,
                "PharmacyNote": value.pharmacyNote,
                "userCreated": pharmacyNoteId ?  null : user,
                "userModified": pharmacyNoteId ? user : null
            }
        }
        let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/UpsertPharmacyNote`,requestData).then(res => {
            return res.data;
        }).catch(error => {
            return error;
        });
        if(res?.isSuccess){
            toast.success('บันทึก Pharmacy Note สำเร็จ', {
                ...toastTopRight,
                theme: "dark"
            });
            getFinancesOrder();
        }else{
            toast.error('บันทึก Pharmacy Note ไม่สำเร็จ', {
                ...toastTopRight,
                theme: "dark"
            });
        }
        setVisible(false);
    }

    useEffect(() => {
        form.setFieldsValue({ pharmacyNote: pharmacyNote })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal
            visible={visible}
            centered
            title={<label className='gx-text-primary'>Pharmacy Note</label>}
            width={750}
            onCancel={()=>setVisible(false)}
            footer={
                <Row justify='center'>
                    <Button type="default" onClick={()=>setVisible(false)}>ออก</Button>
                    <Button type="primary" onClick={()=>{form.submit()}}>บันทึก</Button>
                </Row>
            }
            
        >
            <Form layout='vertical' form={form} onFinish={upsertPharmacyNote}>
                <Form.Item
                    name="pharmacyNote"
                    rules={[{
                        required: true,
                        message: "ระบุ"
                    }]}
                >
                    <TextArea rows={1} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

PharmacyNoteModal.propTypes = {
    visible: PropTypes.bool, 
    setVisible: PropTypes.func,
    getFinancesOrder: PropTypes.func, 
    financeId: PropTypes.string, 
    pharmacyNoteId: PropTypes.string, 
    pharmacyNote: PropTypes.string
};

PharmacyNoteModal.defaultProps = {
    setVisible : () => {},
    getFinancesOrder: () => {},
};