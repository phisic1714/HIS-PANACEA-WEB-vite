import { Button, Col, Modal, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from "react-router-dom";


function LeavePageAlert(
    {
        path="",
        isChange=false,
        doAfterChange=()=>{}
    }
) {
    const history = useHistory();
    const [triggerExit, setTriggerExit] = useState({
        onOk: false,
        path: "",
    });
    const [isVisibleDialog, setVisibleDialog] = useState(false);
    const handleGoToIntendedPage = useCallback(
        (location) => history.push(location),
        [history]
      );
    useEffect(() => {
        if (triggerExit.onOk) {
            handleGoToIntendedPage(triggerExit.path);
        }
        const unblock = history.block((location) => {
            if (location.pathname !== path) {
                if (isChange) {
                    setVisibleDialog(true);
                } else {
                    setTriggerExit((obj) => ({
                        ...obj,
                        onOk: true
                    }));
                }
            }
            setTriggerExit((obj) => ({ ...obj, path: location.pathname }));
            if (triggerExit.onOk) {
                if(isChange){
                    doAfterChange()
                } 
                return true;
            }
            return false;
        });

        return () => {
            unblock();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleGoToIntendedPage, history, triggerExit.onOk, triggerExit.path,isChange]);
    return (
        <Modal
            centered
            visible={isVisibleDialog}
            onCancel={() => {
                setVisibleDialog(false);
            }}
            footer={[
                <Row justify="center" key="footer">
                    <Button
                        danger
                        key="cancel"
                        onClick={() => {
                            setVisibleDialog(false);
                            setTriggerExit((obj) => ({
                                ...obj,
                                onOk: true
                            }));
                        }}
                    >
                        ออก
                    </Button>
                    <Button
                        type="primary"
                        key="cancel"
                        onClick={() => {
                            setVisibleDialog(false);
                        }}
                    >
                        แก้ไขเพิ่มเติม
                    </Button>
                    <Button
                        disabled={!isChange}
                        key="ok"
                        type="primary"
                        onClick={async () => {
                            if(isChange){
                                doAfterChange()
                            }
                            
                            setTriggerExit((obj) => ({
                              ...obj,
                              onOk: false
                            }));
                            setVisibleDialog(false);
                        }}
                    >
                        บันทึก
                    </Button>
                </Row>,
            ]}
            width={520}
        >
            <Row gutter={[8, 8]}>
                <Col span={24} className="text-center">
                    <label className="fw-bold" style={{ color: "red", fontSize: 20 }}>
                        แจ้งเตือนการบันทึก
                    </label>
                </Col>
                <Col span={24} className="text-center">
                    <label className="gx-text-primary fw-bold" style={{ fontSize: 20 }}>
                        กรุณาเลือกดำเนินการ
                    </label>
                </Col>
            </Row>
        </Modal>

    )
}

export default LeavePageAlert