import pregnantIcon from '@iconify/icons-cil/pregnant';
import { Icon } from '@iconify/react';
import { Col } from 'antd';
import axios from 'axios';
import { env } from 'env';
import { useEffect, useState } from 'react';

const PregnantStatus = ({ patientId }) => {

    const [detail, setDetail] = useState(null)

    const getPregnant = async patientId => {
        if (patientId) {
            let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdServices/GetListServicesLastByPatient/` + patientId).then(res => {
                return res.data.responseData;
            }).catch(error => {
                return error;
            })
            // console.log(res);
            setDetail(res)
        }
    }

    useEffect(() => {
        getPregnant(patientId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);

    return (
        <>
            {detail?.urgentFlag &&
                <Icon style={{ cursor: "pointer" }} icon={pregnantIcon} width="22" height="22" className='gx-text-primary' /> ||
                detail?.accidentFlag &&
                <Icon style={{ cursor: "pointer" }} icon={pregnantIcon} width="22" height="22" className='gx-text-primary' /> ||
                detail?.conceledFlag &&
                <Icon style={{ cursor: "pointer" }} icon={pregnantIcon} width="22" height="22" className='gx-text-primary' /> ||
                detail?.observeFlag &&
                <Icon style={{ cursor: "pointer" }} icon={pregnantIcon} width="22" height="22" className='gx-text-primary' /> ||
                detail?.optionsRadio === "P" &&
                <Icon style={{ cursor: "pointer" }} icon={pregnantIcon} width="22" height="22" className='gx-text-primary' />
            }

        </>
    )
}
export default PregnantStatus;