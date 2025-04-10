import React from 'react'
import { Modal, Row, Button } from 'antd';
import { getPdfFile } from '../../../components/qzTray/PrintFormReport';

export default function DueQuestionnaire({visible, setVisible, reportDueFrom=[]}) {
    const handleOK = async() => {
        for await(const val of reportDueFrom) {
            await getPdfFile(null, null, val?.reportFile?.split(".")[0], val?.sqlFile?.split(".")[0], {"@orderid": val.orderId, "@expenseid": String(val?.expenseId)}, null, null, false, val?.prefix);
        }
        setVisible(false);
    }
    return (
        <Modal
            title={<label className='gx-text-primary fw-bold'>แบบสอบถามยา DUE</label>}
            centered
            visible={visible}
            onCancel={()=>setVisible(false)}
            closable={false}
            // width="1200px"
            footer={[
                <Row justify="center" key="footer">
                    <Button key="ok" type="primary" onClick={handleOK}>ตกลง</Button>
                    <Button key="cancel" onClick={() => {setVisible(false)}}>ปิด</Button>
                </Row>
            ]}
        >
            <Row justify='center'>
                ท่านต้องการพิมพ์แบบสอบถามยา DUE หรือไม่?
            </Row>
        </Modal>
    )
}
