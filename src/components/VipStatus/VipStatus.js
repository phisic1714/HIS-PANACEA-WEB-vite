import { StarFilled } from '@ant-design/icons';
import { Col, Modal, Row, Tooltip } from 'antd';
import axios from 'axios';
import { env } from 'env';
import { useEffect, useState } from 'react';
import _filter from 'lodash/filter';

const VipStatus = ({ patientId, sizeStar }) => {
    const [colorType, setColorType] = useState();
    const [detail, setDetail] = useState(null)
    // console.log('detail', detail)
    const [detailList, setDetailList] = useState([])
    const [modal, setModal] = useState(false);
    const getApiVip = async (patientId) => {
        setDetailList([])
        setDetail(null)
        if (!patientId) return
        try {
            const req = {
                requestData: {
                    "name": null,
                    "vipServiceType": null,
                    "cardNo": null,
                    "memberNo": null,
                    "patientId": patientId,
                    "organization": null,
                    "government": null,
                    "vipServiceBenefitId": null,
                    "vipServiceId": null
                }
            }
            let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/VipService/GetVipServiceData`, req);
            let filter = _filter(res?.data?.responseData || [], o => !o.cancelFlag)
            if (filter.length) {
                const lastVip = filter[0]
                // console.log('lastVip', lastVip)
                setDetail(lastVip?.detail || "-")
                switch (lastVip.benefactorType) {
                    case "B":
                        setColorType("#CC9966");
                        break;
                    case "S":
                        setColorType("#a2a1a0");
                        break;
                    case "G":
                        setColorType("#ffab2b");
                        break;
                    case "P":
                        setColorType("#64b8f8");
                        break;
                    default: break;
                }
            }
            filter = _filter(filter, o => o.detail)
            if (!filter.length) return
            if (filter.length) {
                setDetailList(filter)
                setModal(true)
            } else {
                setModal(false)
            }
            return res.data;
        } catch (error) {
            // console.error('Error:', error);
            return error;
        }
    };
    useEffect(() => {
        getApiVip(patientId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);
    return (
        <>
            <Tooltip title={detail}
            >
                <StarFilled
                    className='ms-1'
                    hidden={!detailList.length && !detail}
                    style={{ fontSize: sizeStar ? sizeStar : '20px', color: colorType }}
                />
            </Tooltip>
            <Modal
                title={<label className='gx-text-primary fs-5 fw-bold'>
                    ทะเบียนผู้มีอุปการะคุณ
                </label>}
                visible={modal}
                width={575}
                // closable={false}
                // footer={false}
                centered
                okButtonProps={{
                    hidden: true,
                }}
                cancelText="ปิด"
                onCancel={() => setModal(false)}
            >
                <div style={{ margin: -10 }}>
                    <Row gutter={[4, 8]}>
                        <Col span={24}>
                            {detailList.map((item, index) => (
                                <p key={String(index)} className='data-value fw-bold' style={{ wordBreak: "break-all" }} >
                                    - {item.detail}
                                </p>
                            ))}
                        </Col>
                    </Row>
                </div>
            </Modal>
        </>
    );
};

export default VipStatus;
