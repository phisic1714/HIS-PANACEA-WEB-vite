
import { useEffect, useState } from "react";

import { DeleteOutlined, EditOutlined, PrinterOutlined, UserSwitchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Modal,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tooltip
} from "antd";
import { AiOutlinePlus } from "react-icons/ai";
import { FaCog } from "react-icons/fa";
import {
  DelPatientsRefersVisit,
  GetPatientRefers
} from "../../routes/AdmissionCenter/API/AdmitRegisterApi";
import ReferModal from "../Modal/ReferModal";

import { momentEN } from '../helper/convertMoment';

export default function AdmitRegisterForward({ size = "middle", scrollY = 240, ...props }) {
  const [list, setList] = useState([]);
  const [referLoading, setReferLoading] = useState(false);

  const [isVisibleReferModal, setIsVisibleReferModal] = useState(false)
  const [prevRefer, setPrevRefer] = useState(null);
  useEffect(() => {
    if (!isVisibleReferModal) {
      momentEN()
    }
  }, [isVisibleReferModal])

  const columns = [
    {
      title: <label className="gx-text-primary">เลขที่</label>,
      dataIndex: "documentNo",
      width: 100,
    },
    {
      title: <label className="gx-text-primary">สถานพยาบาลที่ส่ง</label>,
      dataIndex: "referHospName"
    },
    {
      title: <label className="gx-text-primary">ประเภท</label>,
      dataIndex: "inoutDesc",
      width: 80,
      align: "center"
    },
    {
      title: <label className="gx-text-primary">วันที่รับ/ส่งตัว</label>,
      dataIndex: "referDate",
      width: 120,
      align: "center"
    },
    {
      title: <label className="gx-text-primary">วันที่สิ้นสุด</label>,
      dataIndex: "expireDate",
      width: 100,
      align: "center"
    },
    {
      title: <FaCog />,
      dataIndex: "operator",
      align: "center",
      width: 135,
      fixed: "right"
    },
  ];

  const success = (param) => {
    Modal.success({
      content:
        param === "delete"
          ? "ลบข้อมูลสำเร็จ"
          : param === "add"
            ? "บันทึกข้อมูลสำเร็จ"
            : "เเก้ไขข้อมูลสำเร็จ",
      okText: "ปิด",
    });
  };

  const fail = (param) => {
    Modal.error({
      content:
        param === "delete"
          ? "ลบข้อมูลไม่สำเร็จ"
          : param === "add"
            ? "บันทึกข้อมูลไม่สำเร็จ"
            : "เเก้ไขข้อมูลไม่สำเร็จ",
      okText: "ปิด",
    });
  };

  const deleteMasterData = async (param) => {
    setReferLoading(true);

    const result = await DelPatientsRefersVisit(param);
    if (result.isSuccess === true) {
      success("delete");
      setRequestApi();
    } else {
      fail("delete");
    }

    setReferLoading(false);
  };

  const setRequestApi = async () => {
    let tempList = [];
    const result = await GetPatientRefers(props.patientId);
    result?.map((val, index) => {
      let type = null
      switch (val?.inout) {
        case "I":
          type = "IN"
          break;
        case "O":
          type = "OUT"
          break;
        case "B":
          type = "BACK"
          break;
        default:
          type = null
          break;
      }
      tempList.push({
        ...val,
        key: String(index),
        documentNo: val.documentNo !== "" ? val.documentNo : `${val.referRunNo}/${val.referYearNo}`,
        inoutDesc: type,
        operator: (
          <>
            <Row gutter={[4, 4]} className="text-nowrap">
              <Col span={6}>
                <Tooltip title={
                  <>
                    <label className="data-value mb-1">ผู้บันทึก</label>
                    <label className="data-value ms-1">{val?.userCreatedDesc || "-"}</label>
                    <br />
                    <label className="data-value mb-1">ผู้แก้ไข</label>
                    <label className="data-value ms-1">{val?.userModifiedDesc || "-"}</label>
                  </>
                }>
                  <Button
                    style={{ margin: 0 }}
                    icon={<UserSwitchOutlined className="gx-text-primary" />}
                    size="small"
                  />
                </Tooltip>
              </Col>
              <Col span={6}>
                <Button
                  style={{ margin: 0 }}
                  icon={<EditOutlined className="text-primary" />}
                  size="small"
                  onClick={() => {
                    setPrevRefer(val)
                    setIsVisibleReferModal(true)
                  }}
                />
              </Col>
              <Col span={6}>
                <Popconfirm
                  title="ต้องการลบรายการนี้ ？"
                  okText="Yes"
                  onConfirm={() => {
                    deleteMasterData(val.referId)
                  }}
                  cancelText="No"
                >
                  <Button
                    style={{ margin: 0 }}
                    icon={<DeleteOutlined className="text-danger" />}
                    size="small"
                  />
                </Popconfirm>
              </Col>
              <Col span={6}>
                <Button
                  style={{ margin: 0 }}
                  type="primary"
                  icon={<PrinterOutlined />}
                  size="small"
                />
              </Col>
            </Row>
          </>
        ),
      });
    });
    setList(tempList);
  };

  useEffect(() => {
    if (props?.patientId !== null) {
      setRequestApi();
    }
  }, [props?.patientId]);

  return (
    <Spin spinning={referLoading}>
      <Card
        className='mb-2'
        size={size}
        title={
          <Row gutter={[8, 8]} style={{ marginTop: -4, marginBottom: -4 }} align="middle">
            <Col span={12}>
              <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
                การรับส่งต่อ ({list?.length})
              </label>
            </Col>
            <Col span={12}>
              <Button
                size={size}
                type="primary"
                style={{ float: "right", margin: 0 }}
                icon={<AiOutlinePlus />}
                disabled={!props?.patientId}
                onClick={() => {
                  setIsVisibleReferModal(true)
                }}
              >เพิ่มการรับส่งต่อ</Button>
            </Col>
          </Row>
        }
        style={{ width: "100%" }}
      >
        <div style={{ margin: -8 }}>
          <Table
            size={size}
            scroll={{ x: 680, y: scrollY }}
            rowClassName={'data-value'}
            columns={columns}
            dataSource={list}
            pagination={false}
          />
        </div>
      </Card>
      {isVisibleReferModal
        ? <ReferModal
          isZhow={isVisibleReferModal}
          patient={props?.list}
          prevRefer={prevRefer}
          handleClose={(bool, isSuccess) => {
            setIsVisibleReferModal(bool)
            setPrevRefer(null)
            if (isSuccess) {
              setRequestApi()
            }
          }}
        />
        : null
      }
    </Spin>
  );
}
