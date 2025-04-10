import { CheckOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Spin, Table } from "antd";
import Column from 'antd/lib/table/Column';
import axios from 'axios';
import { threeDot } from "components/ComponentStyles.js";
import dayjs from "dayjs";
import { useEffect, useState } from 'react';
import { BsThreeDots } from "react-icons/bs";
import { env } from '../../env.js';

export default function BillDetails({
  patientId = null,
  serviceId = null,
  orderId = null,
  add543 = false
}) {
  const [listBill, setListBill] = useState([]);
  const [lastBill, setLastBill] = useState(null);
  const [drugStatusVisible, setDrugStatusVisible] = useState(false);
  const fetchBills = async (patientId, serviceId, orderId) => {
    if (serviceId || orderId) {
      let res = await GetBills({
        patientId: patientId,
        serviceId: serviceId,
        orderId: orderId
      });
      if (res?.length > 0) {
        let mapping = res.map(o => {
          let billDatetime = o.billDatetime ? add543 ? dayjs(o.billDatetime, "MM/DD/YYYY HH:mm:ss").add(543, "y").format("DD/MM/YYYY HH:mm") : dayjs(o.billDatetime, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm") : "";
          return {
            ...o,
            billDatetime: billDatetime
          };
        });
        setLastBill(mapping[0]);
        setListBill(mapping);
      } else {
        setLastBill(null);
        setListBill([]);
      }
    }
  };
  useEffect(() => {
    fetchBills(patientId, serviceId, orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, orderId]);
  const [vsbTblBill, setVsbTblBill] = useState(false);
  const TableBill = () => {
    const columns = [{
      title: <label className="gx-text-primary">เลขที่ใบเสร็จ</label>,
      dataIndex: "billId"
    }, {
      title: <label className="gx-text-primary">เล่มที่</label>,
      dataIndex: "bookNo"
    }, {
      title: <label className="gx-text-primary">เลขที่</label>,
      dataIndex: "runNo"
    }, {
      title: <label className="gx-text-primary">วันที่</label>,
      dataIndex: "billDatetime",
      align: "center"
    }, {
      title: <label className="gx-text-primary">ผู้บันทึก</label>,
      dataIndex: "userCreated"
    }, {
      title: <label className="gx-text-primary">ยกเลิก</label>,
      dataIndex: "",
      key: "key",
      align: "center",
      render: val => <div>
        {val.cancelFlag === "Y" ? <label className="text-success">
          <CheckOutlined />
        </label> : null}
      </div>
    }];
    return <div style={{
      margin: -20
    }}>
      <Table scroll={{
        y: 345
      }} columns={columns} dataSource={listBill} pagination={false} rowKey={"billId"} rowClassName={"data-value"} />
    </div>;
  };
  return <div>
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <label className='gx-text-primary me-2'>ใบเสร็จล่าสุด</label>
        <label className='data-value me-3'>{lastBill?.billId}</label>
        <label className='data-value me-2'>{lastBill?.billDatetime}
        </label>
        <label className="gx-text-primary me-3" onClick={() => {
          setVsbTblBill(true);
        }}>
          <BsThreeDots style={threeDot} />
        </label>
        <label className='gx-text-primary me-2'>สถานะใบสั่งยา</label>
        <label className="gx-text-primary me-3" onClick={() => {
          setDrugStatusVisible(true);
        }}>
          <BsThreeDots style={threeDot} />
        </label>
      </Col>
    </Row>
    <Modal title={<label className="gx-text-primary fw-bold fs-6">
      รายการใบเสร็จ
    </label>} centered visible={vsbTblBill} onCancel={() => {
      setVsbTblBill(false);
    }} footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setVsbTblBill(false);
      }}>
        ปิด
      </Button>
    </Row>]} width={1000}>
      {TableBill()}
    </Modal>
    {drugStatusVisible ?
      <ModalDrugStatus
        visible={drugStatusVisible}
        setVisible={setDrugStatusVisible}
        patientId={patientId}
        serviceId={serviceId}
      />
      : null
    }
  </div>;
}
export const GetBills = async params => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": params?.patientId,
      "serviceId": params?.serviceId,
      "orderId": params?.orderId || null,
      "clinicId": null,
      "date": null,
      "userId": null,
      "workId": null
    },
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetBills`, req).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

export const ModalDrugStatus = ({ visible, setVisible, patientId, serviceId }) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const getFinancesOrderStatus = async (patientId, serviceId) => {
    setLoading(true);
    let res = await GetFinancesOrderStatus({ patientId: patientId, serviceId: serviceId });
    if (res?.isSuccess) {
      setDataSource(res?.responseData);
    }
    setLoading(false);
  }
  useEffect(() => {
    getFinancesOrderStatus(patientId, serviceId);
    return () => {
      setDataSource([]);
    }
  }, [patientId, serviceId]);
  return (
    <Modal
      centered
      width={1000}
      visible={visible}
      title={<label className="gx-text-primary fw-bold fs-6">สถานะใบสั่งยา</label>}
      closable={false}
      onCancel={() => setVisible(false)}
      footer={
        <Row justify='center'>
          <Button type="default" onClick={() => setVisible(false)}>ปิด</Button>
        </Row>
      }
    >
      <Spin spinning={loading}>
        <Table
          dataSource={dataSource}
          scroll={{ x: 1000 }}
          pagination={false}
        >
          <Column title="เลขที่ใบสั่งยา" dataIndex="orderId" />
          <Column title="ราคา" dataIndex="amount" />
          <Column title="สถานะ" dataIndex="status" />
          <Column title="วันที่" dataIndex="dateStatused"
            render={(record) => (
              <>{record ? dayjs(record, "MM/DD/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm น.") : ""}</>
            )}
          />
          <Column title="ผู้บันทึก" dataIndex="userCreated" />
        </Table>
      </Spin>
    </Modal>
  )
};

const GetFinancesOrderStatus = async params => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": {
      "patientId": params?.patientId,
      "serviceId": params?.serviceId,
    },
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/InPatientFinance/GetFinancesOrderStatus`, req).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};