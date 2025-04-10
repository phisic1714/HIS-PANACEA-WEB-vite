
import React from 'react'
import { Modal } from 'antd';
import OpdDrugCharge from 'routes/OpdClinic/Views/OpdDrugCharge';
import PropTypes from "prop-types";
export default function OpdDrugModal({
    visible,
    setVisible,
    getOpdClinicHistoryPopUpDisplayDetail,
    clinicId = null,
    serviceId = null,
    workId = null,
    page = "10.3"
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
            <OpdDrugCharge
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

OpdDrugModal.propTypes = {
    visible: PropTypes.bool,
    setVisible: PropTypes.func,
    getOpdClinicHistoryPopUpDisplayDetail: PropTypes.func,
};

OpdDrugModal.defaultProps = {
    setVisible: () => { },
    getOpdClinicHistoryPopUpDisplayDetail: () => { },
};