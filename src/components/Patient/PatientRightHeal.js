import { env } from '../../env.js';


import React, { useState, useEffect } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { CheckOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { toNumber } from "lodash";
import { Button, Col, Popconfirm, Row, Table } from "antd";
import "../../routes/Information/Views/InformationSummaryOpdFinances/style/SummaryOpdFinances.less";
import UpdPatientRight from "../Modal/UpdPatientRight";
import Notifications from "../Modal/Notifications";
import { customToast } from 'util/GeneralFuctions.js';

export default function PatientRightHeal(props) {
  const [showUpdPatientRightModal, setShowUpdPatientRightModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [prevRight, setPrevRight] = useState({});
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [, setList] = useState([]);
  const [opdRishtsInfoSelect, setOpdRishtsInfoSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });

  const DelOpdRightVisitOfDate = async id => {
    let res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdRightVisit/DelOpdRightVisitOfDate?opdRightId=` + id).then(res => {
      return res.data;
    }).catch(error => console.log(error));
    return res;
  };

  const delOpdOrIpdRight = async actionRightId => {
    let res = await DelOpdRightVisitOfDate(actionRightId);

    if (!res || !res.isSuccess) return customToast("ลบสิทธิ์ไม่สำเร็จ", "error")

    props?.reloadRights()
    setProcessResult(res);
    setNotificationsTitle("ลบสิทธิ์");
    setShowNotificationsModal(true);
  };

  const columns = [{
    title: "สิทธิ์การรักษา",
    dataIndex: "rightName",
    width: 240
  }, {
    title: "สิทธิ์หลัก",
    dataIndex: "mainFlag",
    align: "center",
    width: 100,
    render(val) {
      return <>{val === "Y" && <CheckOutlined style={{
        color: "green"
      }} />}</>;
    }
  }, {
    title: "จำนวนเงิน",
    dataIndex: "amount",
    render(text,) {
      return {
        children: <label>{Intl.NumberFormat("en").format(text) + ".-"}</label>
      };
    }
  }, {
    title: "เครดิต",
    dataIndex: "credit",
    render(text,) {
      return {
        children: <label>{Intl.NumberFormat("en").format(text) + ".-"}</label>
      };
    }
  }, {
    title: "เบิกได้",
    dataIndex: "cashReturn",
    render(text,) {
      return {
        children: <div>{Intl.NumberFormat("en").format(text) + ".-"}</div>
      };
    }
  }, {
    title: "เบิกไม่ได้",
    dataIndex: "cashNotReturn",
    render(text,) {
      return {
        props: {
          style: {
            color: "red"
          }
        },
        children: <div>{Intl.NumberFormat("en").format(text) + ".-"}</div>
      };
    }
  },
  {
    title: "รพ. ร่วมจ่าย",
    dataIndex: "offer",
    render(text,) {
      return {
        children: <div>{Intl.NumberFormat("en").format(text || 0) + ".-"}</div>
      };
    }
  }, {
    title: "ส่วนลด",
    dataIndex: "discount",
    render(text,) {
      return {
        children: <label>{Intl.NumberFormat("en").format(text) + ".-"}</label>
      };
    }
  }, {
    title: "ชำระเเล้ว",
    dataIndex: "payment",
    render(text,) {
      return {
        children: <label>{Intl.NumberFormat("en").format(text) + ".-"}</label>
      };
    }
  }, {
    title: "ค้างชำระ",
    dataIndex: "overdue",
    render(text,) {
      return {
        children: <label>{(text ? Intl.NumberFormat("en").format(text) : 0) + ".-"}</label>
      };
    }
  }, {
    title: "รับรองสิทธิ์",
    dataIndex: "confirm",
    with: 100,
    render(val) {
      return <>{val === "Y" && <CheckOutlined style={{
        color: "green"
      }} />}</>;
    }
  }, {
    title: "",
    dataIndex: "actionsEdit",
    fixed: "right",
    hidden: props?.page !== "22.5",
    align: "center",
    width: 78,
    render(val, detail) {
      return <Row gutter={[8, 8]}>
        <Col span={12} className="text-center">
          <Button style={{
            margin: 0
          }} size="small" icon={<EditOutlined style={{
            color: "blue"
          }} />}
            disabled={!(detail?.editAble === "0" || !detail?.editAble)}
            onClick={e => {
              e.stopPropagation();
              setShowUpdPatientRightModal(true);
              setEditId(detail?.opdRightId);
              setPrevRight(detail);
            }} />
        </Col>
        <Col span={12} className="text-center">
          <Popconfirm title="ลบรายการ ？" okText="Yes" onConfirm={() => {
            delOpdOrIpdRight(detail?.opdRightId);
          }} cancelText="No" disabled={!(toNumber(detail?.amount) === 0)}>
            <Button style={{
              margin: 0
            }} size="small" icon={<DeleteOutlined style={!(toNumber(detail?.amount) === 0) ? {
              color: ""
            } : {
              color: "red"
            }} />} disabled={!(toNumber(detail?.amount) === 0)} onClick={e => {
              e.stopPropagation();
            }} />
          </Popconfirm>
        </Col>
      </Row>;
    }
  }].filter(val => !val.hidden);

  const onSelectChange = (selectedRowKeys, selectedRow) => {
    const filterSelectedRowKeys = selectedRowKeys.filter((v) => v)

    if (props.opdRishtsInfoSelectProps.length > 0) {
      setOpdRishtsInfoSelect({
        selectedRowKeys: props.opdRishtsInfoSelectProps
      });
      props.onSelectChange(filterSelectedRowKeys, selectedRow);
    } else {
      setOpdRishtsInfoSelect({
        selectedRowKeys
      });
      props.onSelectChange(filterSelectedRowKeys, selectedRow);
    }
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys: opdRishtsInfoSelect.selectedRowKeys,
    onChange: onSelectChange
  };

  const setRequestApi = () => {
    let tempList = [];
    // eslint-disable-next-line array-callback-return
    props.data.opdRishtsInfo.map(val => {
      tempList.push({
        key: val.opdRightId,
        right_Name: val.right_Name,
        mainFlag: val.mainFlag === "Y" ? <AiOutlineCheck /> : <></>,
        amount: Intl.NumberFormat("en").format(val.amount) + ".-",
        cashNotReturn: Intl.NumberFormat("en").format(val.cashNotReturn) + ".-",
        cashReturn: Intl.NumberFormat("en").format(val.cashReturn) + ".-",
        claim: Intl.NumberFormat("en").format(val.claim) + ".-",
        copay: Intl.NumberFormat("en").format(val.copay) + ".-",
        discount: Intl.NumberFormat("en").format(val.discount) + ".-",
        payment: Intl.NumberFormat("en").format(val.payment) + ".-",
        overdue: Intl.NumberFormat("en").format(val.overdue) + ".-"
      });
    });
    setList(tempList);
  };

  useEffect(() => {
    if (props.patientId !== null) {
      if (props.data.length !== 0) {
        setRequestApi();
      }
    }
  }, [props.patientId, props.data]);

  useEffect(() => {
    onSelectChange([props.opdRightId]);
  }, [props.opdRightId]);

  useEffect(() => {
    onSelectChange([]);
  }, [props.listOpdServiceRight]);

  return <div>
    <Table
      scroll={{ x: 1275, y: 300 }}
      rowClassName="data-value"
      rowSelection={rowSelection}
      columns={columns}
      rowKey="opdRightId"
      dataSource={props?.listOpdServiceRight || []} pagination={false}
    />
    <UpdPatientRight show={showUpdPatientRightModal} setModal={(isVisible, reloadTable) => {
      setShowUpdPatientRightModal(isVisible);
      setEditId(null);
      if (reloadTable === true) {
        props?.reloadRights && props?.reloadRights();
      }
    }} editId={editId} prevRight={prevRight} right="OpdRight" />
    <Notifications setModal={isVisible => {
      setShowNotificationsModal(isVisible);
      setProcessResult({});
      setNotificationsTitle(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type="result" />
  </div>;
}