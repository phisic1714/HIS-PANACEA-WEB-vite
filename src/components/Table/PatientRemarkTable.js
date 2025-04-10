import { Icon } from '@iconify/react';
import { Button, Col, Input, Popconfirm, Row, Table } from 'antd';
import { withResolve } from 'api/create-api';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { useLoadingContext } from 'util/context/LoadingContext';
import saveIcon from '@iconify/icons-carbon/save';
import editIcon from '@iconify/icons-akar-icons/edit';
import deleteIcon from '@iconify/icons-carbon/delete';

const PatientRemarkTable = ({ patientId }) => {
  const [dataSource, setDataSource] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [dataEditing, setDataEditing] = useState([]);
  const { addLoading, removeLoading } = useLoadingContext();

  const columns = [

    {
      title: 'หมายเหตุ',
      key: 'remark',
      dataIndex: 'remark',
      width: 400,
      render: (v, r) => (
        <Input.TextArea
          disabled={!dataKeys.includes(r?.ptremarld) ? true : false}
          defaultValue={v}
          onChange={(e) => setDataEditing({ ...r, remark: e.target.value })}
          maxLength={1000}
          autoSize={{ minRows: 3 }}
        />
      ),
    },
    { title: 'ผู้บันทึก', key: 'userCreated', dataIndex: 'userCreated' },
    {
      title: 'วันที่บันทึก',
      key: 'dateCreated',
      dataIndex: 'dateCreated',
      render: (v, r) => v && moment(v).format('DD/MM/YYYY'),
    },
    { title: 'ผู้ที่แก้ไข', key: 'userModified', dataIndex: 'userModified' },
    {
      title: 'วันที่แก้ไข',
      key: 'dateModified',
      dataIndex: 'dateModified',
      render: (v, r) => v && moment(v).format('DD/MM/YYYY'),
    }, {
      fixed: 'right',
      render: (v, r) => (
        <Row gutter={[4, 4]} align="middle">
          <Col>
            <Button size="small" style={{
              marginBottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
              icon={<Icon icon={editIcon} />}
              disabled={dataKeys.includes(r?.ptremarld) ? true : false}
              onClick={() => {

                setDataKeys(prev => [...prev, r?.ptremarld])
              }}>
            </Button>
          </Col>
          <Col>
            {' '}
            <Button
              type="primary"
              size="small"
              icon={<Icon icon={saveIcon} />}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center" // ทำให้ไอคอนอยู่กึ่งกลาง
              }}
              disabled={!dataKeys.includes(r?.ptremarld) ? true : false}
              onClick={() => {
                console.log(dataEditing)
                upsertPatientRemark(dataEditing);
              }}
            >
              {/* บันทึก */}
            </Button>
          </Col>
          <Col>
            <Popconfirm title='ตกลงที่จะลบหมายเหตุหรือไม่?' okText='ตกลง' cancelText='ไม่' onConfirm={() => (console.log(r?.ptremarld),
              deletePatientRemark(r?.ptremarld))}>
              <Button
                type="danger"
                size="small"
                style={{
                  marginBottom: 0, display: "flex",
                  alignItems: "center",
                  justifyContent: "center" // ทำให้ไอคอนอยู่กึ่งกลาง
                }}
                icon={<Icon icon={deleteIcon} />}
              >
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      ),
    },
  ];
  useEffect(() => {
    getPatientRemark(patientId);
  }, [patientId]);

  const getPatientRemark = async (patientId) => {
    if (!patientId) return setDataSource([]);
    addLoading('getPatientRemark');
    let resData = (
      await withResolve(
        `api/patients/GetPatientRemarkByPatientId/${patientId}`
      ).get()
    ).result;
    removeLoading('getPatientRemark');
    if (resData?.length) {
      resData = resData.map((val, index) => {
        return {
          ...val,
          key: index,
        };
      });
    }
    setDataSource(resData || []);
  };

  const upsertPatientRemark = async (dataEditing) => {
    addLoading('upsertPatientRemark');
    await withResolve(`/api/Patients/UpsertPatientRemark`).post(dataEditing);
    removeLoading('upsertPatientRemark');
    setDataKeys(prev => prev.filter(v => v != dataEditing?.ptremarld))
    getPatientRemark(patientId)

  };
  const deletePatientRemark = async (ptremarld) => {
    addLoading('deletePatientRemark');
    await withResolve(`/api/Patients/DelPatientRemark/${ptremarld}`).delete();
    removeLoading('deletePatientRemark');
    setDataKeys(prev => prev.filter(v => v != ptremarld))
    getPatientRemark(patientId)
  };

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: 900 }}
      rowKey={'ptremarld'}
    />
  );
};

export default PatientRemarkTable;
