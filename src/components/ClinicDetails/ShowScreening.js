import React, { useMemo, useState, useEffect } from 'react'
import { find, toNumber, map } from 'lodash'
import { callApis } from 'components/helper/function/CallApi';
import { CheckOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
export default function ShowScreening({
    clinicDetails,
}) {
    const [ambulateType, setAmbulateType] = useState([])
    const getAmbulateType = async () => {
        const res = await callApis(apis["GetMasterAmbulateTypes"])
        setAmbulateType(res)
    }
    useEffect(() => {
        getAmbulateType()
    }, [])

    const ambulateDisplay = useMemo(() => {
        const selectAmbulateDatadisplay = find(ambulateType, item => item?.datavalue === clinicDetails?.ambulate)?.datadisplay;
        if (selectAmbulateDatadisplay?.includes(' - ')) {
            return selectAmbulateDatadisplay?.split(' - ')[1] || '-';
        } else {
            return selectAmbulateDatadisplay || '-';
        }
    }, [clinicDetails, ambulateType]);
    const dataSource = [
        {
            label: "การเคลื่อนย้าย",
            value: ambulateDisplay,
        },
        {
            label: "ญาติเป็นความดัน",
            value: htfamilyMas[clinicDetails?.htfamily] || '-',
        },
        {
            label: "เป็นเบาหวาน",
            value: mdMas[clinicDetails?.dm] || '-',
        },
        {
            label: "ญาติเป็นเบาหวาน",
            value: htfamilyMas[clinicDetails?.dmfamily] || '-',
        },
        {
            label: "ดื่มสุรา",
            value: alcoholMas[clinicDetails?.alcohol] || '-',
        },
        {
            label: "สูบบุหรี่",
            value: smokeMas[clinicDetails?.smoke] || '-',
        },
        {
            label: "ตรวจเท้า",
            value: footMas[clinicDetails?.foot] || '-',
        },
        {
            label: "ตรวจจอประสาทตา",
            value: find(listRetina, item => item?.datavalue === clinicDetails?.ratina)?.datadisplay || '-',
        },
        {
            label: "วิธีตรวจหาน้ำตาล",
            value: bstestMas[clinicDetails?.bstest] || '-',
        },
        {
            label: "ระดับน้ำตาล",
            value: clinicDetails?.bslevel ? toNumber(clinicDetails?.bslevel || 0).toFixed(0) : '-',
        },
        {
            label: "การได้ยินหูซ้าย",
            value: earMas[clinicDetails?.ltEar] || '-',
        },
        {
            label: "การได้ยินหูขวา",
            value: earMas[clinicDetails?.rtEar] || '-',
        },
        {
            label: "เป็นข้อมูลนายจ้าง",
            value: clinicDetails?.employerName || '-',
        },
        {
            label: "ลักษณะการทำงาน",
            value: clinicDetails?.workingType || '-',
        },
        {
            label: "ผู้ป่วยมีเพศสัมพันธ์โดยป้องกันหรือไม่",
            value: yesNoUnknownMas[clinicDetails?.protectiveSex] || '-',
        },
        {
            label: "คู่ของผู้ป่วยมีการตรวจเลือดหรือไม่",
            value: yesNoUnknownMas[clinicDetails?.bloodCouple] || '-',
        },
        {
            label: "วันที่ผู้ป่วยสะดวกมา รพ. ครั้งต่อไป",
            value: clinicDetails?.convenient || '-',
        },
        {
            label: "NCDSCREEN",
            value: clinicDetails?.ncdscreenFlag === "Y" ? <CheckOutlined style={{ color: "green" }} /> : "-",
        },
        {
            label: "CHRONICFU",
            value: clinicDetails?.chronicfuFlag === "Y" ? <CheckOutlined style={{ color: "green" }} /> : "-",
        },
        {
            label: "NUTRITION",
            value: clinicDetails?.nutritionFlag === "Y" ? <CheckOutlined style={{ color: "green" }} /> : "-",
        },
    ]
    return <>
        {
            map(dataSource, (o, i) => {
                return <Row gutter={[4, 4]} key={o.label} style={{ backgroundColor: i % 2 === 0 ? "" : "#f5f5f5" }}>
                    <Col span={15}><label className='gx-text-primary'>{o.label}</label></Col>
                    <Col span={9}><label className='data-value'>{o.value}</label></Col>
                </Row>
            })
        }
    </>
}
const apis = {
    GetMasterAmbulateTypes: {
        name: "GetUserMas",
        url: "OpdExamination/GetMasterAmbulateTypes",
        method: "POST",
        return: "responseData",
        sendRequest: false,
    },
}
const mdMas = {
    '1': 'ใช่',
    '0': 'ไม่ใช่',
};
const htfamilyMas = {
    '1': 'มี',
    '2': 'ไม่มี',
    '9': 'ไม่ทราบ'
};
const alcoholMas = {
    '1': 'ไม่ดื่ม',
    '2': 'ดื่มนานๆครั้ง',
    '3': 'ดื่มเป็นครั้งคราว',
    '4': 'ดื่มเป็นประจำ',
    '9': 'ไม่ทราบ'
};
const footMas = {
    '1': 'ตรวจเท้า',
    '2': 'ไม่ตรวจ'
};
const listRetina = [{
    datavalue: "1",
    datadisplay: "ตรวจ Opthaimoscope ผลปกติ"
}, {
    datavalue: "2",
    datadisplay: "ตรวจด้วย Fundus camera ผลปกติ"
}, {
    datavalue: "3",
    datadisplay: "ตรวจ Opthaimoscope ผลไม่ปกติ"
}, {
    datavalue: "4",
    datadisplay: "ตรวจด้วย Fundus camera ผลไม่ปกติ"
}, {
    datavalue: "8",
    datadisplay: "ไม่ตรวจ"
}, {
    datavalue: "9",
    datadisplay: "ไม่ทราบ"
}];
const bstestMas = {
    '1': 'ตรวจน้ำตาลในเลือด จากหลอดเลือดดำ หลังอดอาหาร',
    '2': 'ตรวจน้ำตาลในเลือด จากหลอดเลือดดำ ไม่อดอาหาร',
    '3': 'ตรวจน้ำตาลในเลือด จากเส้นเลือดฝอย หลังอดอาหาร',
    '4': 'ตรวจน้ำตาลในเลือด จากเส้นเลือดผอย ไม่อดอาหาร'
};
const earMas = {
    '1': 'ปกติ',
    '2': 'ผิดปกติ'
};
const smokeMas = {
    '1': 'ไม่สูบ',
    '2': 'สูบนานๆครั้ง',
    '3': 'สูบเป็นครั้งคราว',
    '4': 'สูบเป็นประจำ',
    '9': 'ไม่ทราบ'
};
const yesNoUnknownMas = {
    '1': 'ใช่',
    '2': 'ไม่ใช่',
    '3': 'ไม่ทราบ'
};