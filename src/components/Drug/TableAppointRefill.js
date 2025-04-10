import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import { GetDrugRefill } from "../../routes/OPDPrescription/API/OpdPrescriptionRefillApi"
import Column from 'antd/lib/table/Column';
import { useSelector } from 'react-redux';
import EditAppointmentDesc from 'components/Modal/EditAppointmentDesc';

export default function TableAppointRefill({ size = "middle", ...props }) {
    const { opdPatientDetail } = useSelector(({ opdPatientDetail }) => opdPatientDetail);
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [editVisible, setEditVisible] = useState(false)
    const [selectAppointId, setSelectAppointId] = useState(null);

    const getDrugRefill = async (patientId) => {
        setLoading(true);
        let res = await GetDrugRefill({ patientId: patientId });
        if (res?.isSuccess) {
            setDataSource(res?.responseData);
        }
        setLoading(false);
    }

    useEffect(() => {
        let patientId = opdPatientDetail?.patientId;
        if (patientId) {
            getDrugRefill(patientId);
        }
        return () => {
            setDataSource([]);
        }
    }, [opdPatientDetail])


    return (
        <>
            <Table
                size={size}
                dataSource={dataSource}
                loading={loading}
                scroll={{ x: 480, y: 200 }}
                // pagination={{
                //     pageSize: 50,
                //     showSizeChanger: false,
                //     showTotal: (total,) => (
                //         <label className="me-3">
                //             ทั้งหมด
                //             <label className="gx-text-primary fw-bold ms-1 me-1">
                //                 {total}
                //             </label>
                //             รายการ
                //         </label>
                //     ),
                // }}
                pagination={false}
                rowClassName={"pointer data-value"}
                onRow={(record,) => {
                    return {
                        onClick: () => {
                            setSelectAppointId(record?.appointId);
                            setEditVisible(true);
                        },
                    };
                }}
                {...props}
            >
                <Column title="วันที่นัด" dataIndex="appointDate" width={110} align="center" />
                <Column title="เวลา" dataIndex="appointTime" width={110} align="center" />
                <Column title="ห้องตรวจ" dataIndex="workIdDisplay" />
                <Column title="ก่อนพบแพทย์/วัน" dataIndex="appointDateDiff" width={120} align="center" />
                <Column title="แพทย์" dataIndex="doctor" />
            </Table>
            <EditAppointmentDesc
                visible={editVisible}
                patient={{
                    appointId: selectAppointId
                }}
                onClose={() => { setEditVisible(false) }}
                viewOnly={true}
            />
        </>
    )
}
