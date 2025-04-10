
import React from 'react'
import { Modal } from 'antd';
import IpdDrugCharge from 'routes/Ward/Views/IpdDrugCharge';
import PropTypes from "prop-types";
export default function IpdDrugModal({
    visible,
    setVisible,
    getOpdClinicHistoryPopUpDisplayDetail,
    clinicId = null,
    serviceId = null,
    workId = null,
    page = "15.2"
}) {
    return (
        <Modal
            forceRender
            centered
            visible={visible}
            width="100%"
            footer={false}
            closable={false}
            bodyStyle={{ padding: 0 }}
        >
            <IpdDrugCharge
                page={page}
                notModal={false}
                setVisible={setVisible}
                getOpdClinicHistoryPopUpDisplayDetail={() => getOpdClinicHistoryPopUpDisplayDetail()}
                clinicIdFromModal={clinicId}
                serviceIdFromModal={serviceId}
                workIdFromModal={workId}
            />
        </Modal>
    )
}

IpdDrugModal.propTypes = {
    visible: PropTypes.bool,
    setVisible: PropTypes.func,
    getOpdClinicHistoryPopUpDisplayDetail: PropTypes.func,
};

IpdDrugModal.defaultProps = {
    setVisible: () => { },
    getOpdClinicHistoryPopUpDisplayDetail: () => { },
};