import React, { useState } from "react";

import {
  Card,
  Row,
  Col,
  Avatar,
  Table,
  Image,
  Modal,
  Button,
  Spin,
} from "antd";

import { GetHistoryUpdPatient } from "../../routes/AdmissionCenter/API/CheckAdmitHistoryApi";
import { Scrollbars } from "react-custom-scrollbars";
import { GiBackwardTime } from "react-icons/gi";

export default function PatientDetailsChangesInformation(props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [tableLoading,] = useState(false);
  const [patientDetailEditDisplayCard, setpatientDetailEditDisplayCard] =
    useState({});
  const [patientDetailEditDisplayTable, setpatientDetailEditDisplayTable] =
    useState([]);
  const [showModalPatientDetailEdit, setShowModalPatientDetailEdit] =
    useState(false);

  const closeModalPatientDetailEdit = () => {
    setShowModalPatientDetailEdit(false);
  };

  const showModalPatientDetailEditControl = async () => {
    if (props.patientId) {
      let res = await GetHistoryUpdPatient(props.patientId);
      await setpatientDetailEditDisplayCard({
        picture: res.picture,
        pname: res.pname,
        hn: res.hn,
        userModified: res.userModified,
        dateModified: res.dateModified,
      });
      await setpatientDetailEditDisplayTable(res.patientLogDisplay);
    }
    await setShowModalPatientDetailEdit(true);
  };

  const TablePatientDetailEdit = () => {
    const dataSource = patientDetailEditDisplayTable.map((val, index) => {
      return {
        key: index,
        logField: val.logField,
        oldData: val.oldData,
        newData: val.newData,
        dateUpdated: val.dateUpdated,
        userUpdated: val.userUpdated,
      };
    });
    const columns = [
      {
        title: <label className="gx-text-primary">การแก้ไข</label>,
        dataIndex: "logField",
        key: "key",
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">ข้อมูลเดิมก่อนแก้ไข</label>,
        dataIndex: "oldData",
        key: "key",
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">ข้อมูลหลังแก้ไข</label>,
        dataIndex: "newData",
        key: "key",
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">วันที่แก้ไข</label>,
        dataIndex: "dateUpdated",
        key: "key",
        align: "center",
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">ผู้แก้ไข</label>,
        dataIndex: "userUpdated",
        key: "key",
        render: (val) => <label className="data-value">{val}</label>,
      },
    ];
    const setWidthForScrollbars = (dataSourceLength) => {
      if (dataSourceLength === 0) return 250;
      if (dataSourceLength === 1) return 180;
      if (dataSourceLength === 2) return 230;
      if (dataSourceLength === 3) return 280;
      if (dataSourceLength === 4) return 330;
      if (dataSourceLength >= 5) return 385;
    };
    return (
      <div>
        <Spin spinning={tableLoading}>
          <Scrollbars
            autoHeight
            autoHeightMin={setWidthForScrollbars(dataSource.length)}
          >
            <div>
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{
                  current: page,
                  pageSize: pageSize,
                  total: dataSource.length,
                  onChange: (page, pageSize) => {
                    setPage(page);
                    setPageSize(pageSize);
                  },
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50],
                  showTotal: (total, range) => (
                    <label>
                      รายการที่
                      <label className="gx-text-primary ps-1 pe-1">
                        {" "}
                        {range[0]}-{range[1]}{" "}
                      </label>
                      จากทั้งหมด
                      <label className="gx-text-primary ps-1 pe-1"> {total} </label>
                      รายการ
                    </label>
                  ),
                }}
              />
            </div>
          </Scrollbars>
        </Spin>
      </div>
    );
  };

  return (
    <>
      <label className="gx-text-primary ms-3" style={{ marginRight: 20 }}>
        <div
          className="button-circle"
          onClick={showModalPatientDetailEditControl}
        >
          <GiBackwardTime />
        </div>
      </label>

      <Modal
        name="PatientDetailEdit"
        title={
          <label className="gx-text-primary-bold">
            รายละเอียดการเปลี่ยนแปลงข้อมูลผู้ป่วย
          </label>
        }
        centered
        visible={showModalPatientDetailEdit}
        onCancel={closeModalPatientDetailEdit}
        footer={
          <div className="text-center">
            <Button type="secondary" onClick={closeModalPatientDetailEdit}>
              ปิด
            </Button>
          </div>
        }
        width={900}
      >
        <div>
          <Card style={{ backgroundColor: "#E3F2FD" }} bordered={false}>
            <Row>
              <Col span={3}>
                <div className="text-center">
                  {patientDetailEditDisplayCard.picture ? (
                    <Avatar
                      size={70}
                      src={
                        <Image
                          src={`data:image/jpeg;base64,${patientDetailEditDisplayCard.picture}`}
                        />
                      }
                    />
                  ) : (
                    <Avatar size={70}>Patient</Avatar>
                  )}
                </div>
              </Col>
              <Col span={21} className="mt-3">
                <Row className="mb-2">
                  <Col span={9}>
                    <label className="gx-text-primary me-1">ชื่อ :</label>
                    <label className="data-value">
                      {patientDetailEditDisplayCard.pname}
                    </label>
                  </Col>
                  <Col span={9}>
                    <label className="gx-text-primary">ผู้แก้ไขล่าสุด</label>
                  </Col>
                  <Col span={6}>
                    <label className="gx-text-primary">วันที่แก้ไขล่าสุด</label>
                  </Col>
                </Row>
                <Row>
                  <Col span={9}>
                    <label className="gx-text-primary me-1">HN :</label>
                    <label className="data-value">
                      {patientDetailEditDisplayCard.hn}
                    </label>
                  </Col>
                  <Col span={9}>
                    <label className="data-value">
                      {patientDetailEditDisplayCard.userModified}
                    </label>
                  </Col>
                  <Col span={6}>
                    <label className="data-value">
                      {patientDetailEditDisplayCard.dateModified}
                    </label>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          {TablePatientDetailEdit()}
        </div>
      </Modal>
    </>
  );
}
