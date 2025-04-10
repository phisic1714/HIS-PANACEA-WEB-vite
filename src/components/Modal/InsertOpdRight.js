import { env } from '../../env.js';
import React, { useState, useEffect, useMemo } from 'react';
import {map ,find , } from "lodash";
import axios from 'axios';
import { Modal, Row, Col, Table, Button, Popconfirm } from 'antd';
import dayjs from "dayjs";
import { notificationX as notiX } from '../Notification/notificationX';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import UpserPatientRight from './UpsertPatientRight';
export default function InsertOpdRight({
  patientId = null,
  serviceId = null,
  open = false,
  close = () => {
    console.log('setIsVis :>> ');
  },
  success = () => {
    console.log('success :>> ');
  }
}) {
  const [loading, setLoading] = useState(false);
  const userFromSession = JSON.parse(sessionStorage.getItem('user'));
  let user = userFromSession.responseData.userId;

  // useState
  const [patient, setPatient] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [ptRightId, setPtRightId] = useState(null);
  // console.log('patient :>> ', patient);
  const [listRight, setListRight] = useState([]);
  const [isOpenUpsertPatientRight, setIsOpenUpsertPatientRight] = useState(false);

  // Functions
  const getPatientsByID = async id => {
    if (!id) return setPatient(null);
    let res = await callApi("GetPatientsByID", id);
    setPatient(res);
  };
  const getOpdRightVisit = async (patientId, serviceId) => {
    if (!patientId || !serviceId) return setListRight([]);
    setLoading(true);
    let resPatientRight = await callApi("GetOpdRightVisit", {
      patientId
    });
    let resOpdRight = await callApi("GetOpdRightByServiceID", serviceId);
    let chkDisable = map(resPatientRight, o => {
      let disable = find(resOpdRight, ["rightId", o.rightId]);
      return {
        ...o,
        disable: disable ? true : false
      };
    });
    setListRight(chkDisable);
    setLoading(false);
  };
  const delPatientRightById = async id => {
    setLoading(true);
    let res = await callApi("DelPatientsRights", id);
    notiX(res?.isSuccess, "ลบสิทธิ์ประจำตัว");
    if (res?.isSuccess) {
      getOpdRightVisit(patientId, serviceId);
    }
    setLoading(false);
  };
  const insListOpdRights = async list => {
    let req = map(list, o => {
      return {
        "opdRightId": null,
        "serviceId": serviceId,
        "rightId": o.rightId,
        "patientId": patientId,
        "runHn": patient?.runHn,
        "yearHn": patient?.yearHn,
        "hn": patient?.hn,
        "mainFlag": null,
        "userCreated": user,
        "dateCreated": dayjs().format("YYYY-MM-DD HH:mm:ss"),
        "userModified": null,
        "dateModified": null,
        "amount": null,
        "copay": null,
        "discount": null,
        "claim": null,
        "payment": null,
        "reminburse": null,
        "limit": null,
        "insid": null,
        "hmain": null,
        "hsub": null,
        "hmainOp": null,
        "govcode": null,
        "ownrightpid": null,
        "owner": null,
        "relinscl": null,
        "referId": null,
        "receive": null,
        "claimcode": null,
        "remark": null,
        "approvalDate": null,
        "confirm": null,
        "dateConfirm": null,
        "userConfirm": null,
        "cashNotReturn": null,
        "cashReturn": null,
        "credit": null
      };
    });
    let res = await callApi("InsListOpdRights", req);
    if (res.isSuccess) {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
    notiX(res?.isSuccess, "บันทึกสิทธิ์ประจำวัน");
    success(res.isSuccess);
  };

  // useEffect
  useEffect(() => {
    if (!open) return;
    getOpdRightVisit(patientId, serviceId);
    getPatientsByID(patientId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const showTableRight = useMemo(() => {
    const columns = [
    // สิทธิ์
    {
      title: labelTopicPrimary("สิทธิ์"),
      dataIndex: "name",
      fixed: "left"
    },
    // ใช้ล่าสุด
    {
      title: labelTopicPrimary("ใช้ล่าสุด"),
      dataIndex: "max_Opd_Right",
      align: "center",
      width: 100
    },
    // หมายเลขบัตร
    {
      title: labelTopicPrimary("หมายเลขบัตร"),
      dataIndex: "insid",
      width: 135
    },
    // รพ.หลัก
    {
      title: labelTopicPrimary("รพ.หลัก"),
      dataIndex: "hMainName",
      width: 150
    },
    // รพ.รอง
    {
      title: labelTopicPrimary("รพ.รอง"),
      dataIndex: "hsubName",
      width: 150
    },
    // หน่วยงานต้นสังกัด
    {
      title: labelTopicPrimary("หน่วยงานต้นสังกัด"),
      dataIndex: "govName",
      width: 240
    },
    // เลขบัตรเจ้าของสิทธิ
    {
      title: labelTopicPrimary("เลขบัตรเจ้าของสิทธิ"),
      dataIndex: "ownRightPid",
      width: 175
    },
    // ความสัมพันธ์
    {
      title: labelTopicPrimary("ความสัมพันธ์"),
      dataIndex: "relinsclDesc",
      width: 120
    },
    // วันที่เริ่มต้น
    {
      title: labelTopicPrimary("วันที่เริ่มต้น"),
      dataIndex: "startDate",
      align: "center",
      width: 100
    },
    // วันที่สิ้นสุด
    {
      title: labelTopicPrimary("วันที่สิ้นสุด"),
      dataIndex: "expireDate",
      align: "center",
      width: 100
    },
    // วันที่สร้าง
    {
      title: labelTopicPrimary("วันที่สร้าง"),
      dataIndex: "dateCreated",
      align: "center",
      width: 100
    },
    // ผู้สร้าง
    {
      title: labelTopicPrimary("ผู้สร้าง"),
      dataIndex: "userCreated",
      width: 145
    },
    // Actions
    {
      title: " ",
      dataIndex: "ptRightId",
      width: 85,
      fixed: "right",
      render: val => <Row gutter={[8, 8]}>
                        <Col span={12} className="text-center">
                            <Button style={{
            margin: 0
          }} size="small" icon={<EditOutlined style={{
            color: "blue"
          }} />} onClick={() => {
            setPtRightId(val);
            setIsOpenUpsertPatientRight(true);
          }} />
                        </Col>
                        <Col span={12} className="text-center">
                            <Popconfirm title="ลบจากระบบ ？" okText="Yes" onConfirm={() => {
            delPatientRightById(val);
          }} cancelText="No">
                                <Button style={{
              margin: 0
            }} size="small" icon={<DeleteOutlined style={{
              color: "red"
            }} />} />
                            </Popconfirm>
                        </Col>
                    </Row>
    }];
    const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disable
      })
    };
    return <div style={{
      margin: -20
    }}>
                <Table loading={loading} scroll={{
        x: 1900,
        y: 480
      }} rowSelection={rowSelection} columns={columns} dataSource={listRight} pagination={false} rowKey={"ptRightId"} rowClassName={"data-value"} />
            </div>;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRight, selectedRowKeys, loading]);
  return <div>
            <Modal
    // forceRender
    confirmLoading={loading} title={<Row gutter={[4, 4]}>
                        <Col span={12}>
                            {labelTopicPrimary18("เพิ่มสิทธิ์ประจำวัน")}
                        </Col>
                        <Col span={12} className='text-end'>
                            <Button type='primary' style={{
          margin: 0
        }} onClick={() => {
          setIsOpenUpsertPatientRight(true);
        }}>
                                เพิ่มสิทธิ์ประจำตัว
                            </Button>
                        </Col>
                    </Row>} closable={false} centered visible={open} onCancel={() => {
      close();
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }} width={1180} onOk={() => insListOpdRights(selectedRows)} okText="บันทึก" cancelText="ปิด" okButtonProps={{
      disabled: !selectedRowKeys?.length
    }}>
                <Row gutter={[8, 8]} style={{
        flexDirection: "row"
      }}>
                    <Col span={24}>
                        {showTableRight}
                    </Col>
                </Row>
                <UpserPatientRight patientId={patientId} serviceId={serviceId} ptRightId={ptRightId} open={isOpenUpsertPatientRight} close={() => {
        setPtRightId(null);
        setIsOpenUpsertPatientRight(false);
      }} success={bool => {
        if (bool) {
          getOpdRightVisit(patientId, serviceId);
        }
      }} />
            </Modal>
        </div>;
}
const labelTopicPrimary18 = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`} style={{
    fontSize: 18
  }}>
            {text}
        </label>;
};
const labelTopicPrimary = (text, extraClass) => {
  return <label className={`gx-text-primary fw-bold ${extraClass}`}>{text}</label>;
};
const callApi = async (name, param) => {
  let api = listApi.find(o => o.name === name);
  if (!api) return;
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/${api.url}${api?.sendRequest ? "" : param || ""}`,
    method: api?.method,
    data: api?.sendRequest ? {
      requestData: param
    } : undefined
  }).then(res => {
    if (api?.return === "data") return res?.data || null;
    if (api?.return === "responseData") return res?.data?.responseData || null;
  }).catch(error => {
    return error;
  });
  return res;
};
const listApi = [
// GetPatientsByID
{
  name: "GetPatientsByID",
  url: "Patients/GetPatientsByID/",
  method: "GET",
  return: "responseData",
  sendRequest: false
},
// GetOpdRightVisit
{
  name: "GetOpdRightVisit",
  url: "OpdRightVisit/GetOpdRightVisit",
  method: "POST",
  return: "responseData",
  sendRequest: true
},
// GetOpdRightByServiceID
{
  name: "GetOpdRightByServiceID",
  url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
  method: "GET",
  return: "responseData",
  sendRequest: false
},
// DelPatientsRights
{
  name: "DelPatientsRights",
  url: "OpdRightVisit/DelPatientsRights?PtRightId=",
  method: "DELETE",
  return: "data",
  sendRequest: false
},
// DelPatientsRights
{
  name: "InsListOpdRights",
  url: "OpdRightVisit/InsListOpdRights",
  method: "POST",
  return: "data",
  sendRequest: true
}];