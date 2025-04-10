

import React, { useState, useEffect } from "react";

import { AiOutlineCheck } from "react-icons/ai";

import { Card, Table } from "antd";

import "../../routes/Information/Views/InformationSummaryOpdFinances/style/SummaryOpdFinances.less";

const columns = [
  {
    title: "Visit No",
    dataIndex: "clinicId",
    width: 100,
  },
  {
    title: "ห้องตรวจ",
    dataIndex: "ward_Name",
  },
  {
    title: "ตรวจ?",
    dataIndex: "finishedFlag",
    width: 90,
  },
  {
    title: "จำนวนเงิน",
    dataIndex: "sum_Amount",
    width: 100,
  },
  {
    title: "เครดิต",
    dataIndex: "sum_Credit",
    width: 90,
  },
  {
    title: "เบิกได้",
    dataIndex: "sum_CashReturn",
    width: 90,
    render(text,) {
      return {
        props: {
          style: { color: "red" },
        },
        children: <div>{text}</div>,
      };
    },
  },

  {
    title: "เบิกไม่ได้",
    dataIndex: "sum_CashNotReturn",
    width: 90,
    render(text,) {
      return {
        props: {
          style: { color: "red" },
        },
        children: <div>{text}</div>,
      };
    },
  },
  {
    title: "ส่วนลด",
    dataIndex: "sum_Discount",
    width: 90,
  },
  {
    title: "ชำระเเล้ว",
    dataIndex: "sum_Payment",
    width: 90,
  },
  {
    title: "ค้างชำระ",
    dataIndex: "overdue_todate",
    width: 90,
  },
];

export default function VisitToday(props) {
  const [list, setList] = useState([]);
  const setRequestApi = () => {
    let tempList = [];
    if (props.data?.opdClinicsInfo) {
      props.data.opdClinicsInfo
        .filter((item) => item.serviceId === props.serviceId)
        // eslint-disable-next-line array-callback-return
        .map((val) => {
          tempList.push({
            ...val,
            key: val.clinicId,
            clinicId: val.clinicId,
            billgroup: val.billgroup ? val.billgroup : "-",
            ward_Name: val.ward_Name ? val.ward_Name : "-",
            finishedFlag: val.finishedFlag !== null ? <AiOutlineCheck /> : <></>,
            sum_Amount: Intl.NumberFormat("en").format(val.sum_Amount || null) + ".-",
            sum_Credit: Intl.NumberFormat("en").format(val.sum_Credit || null) + ".-",
            sum_CashNotReturn: Intl.NumberFormat("en").format(val.sum_CashNotReturn || null) + ".-",
            sum_CashReturn: Intl.NumberFormat("en").format(val.sum_CashReturn || null) + ".-",
            sum_Discount: Intl.NumberFormat("en").format(val.sum_Discount || null) + ".-",
            sum_Payment: Intl.NumberFormat("en").format(val.sum_Payment || null) + ".-",
            sum_overdue_todate: Intl.NumberFormat("en").format(val.sum_overdue_todate || null) + ".-",
          });
        });
      setList(tempList);
      setClinicInfoSelect({ selectedRowKeys: [tempList[0]?.key] })
      props.handleClinicId([tempList[0]?.key], tempList)
    }
  };
  const [clinicInfoSelect, setClinicInfoSelect] = useState({
    selectedRowKeys: [0],
    loading: false,
  });
  const onSelectChange = (selectedRowKeys) => {
    // console.log('selectedRowKeys changed: ', selectedRowKeys);
    props.handleClinicId(selectedRowKeys, list);
    setClinicInfoSelect({ selectedRowKeys });
  };


  const rowSelection = {
    type: "radio",
    selectedRowKeys: clinicInfoSelect.selectedRowKeys,
    onChange: onSelectChange,
  };


  useEffect(() => {
    if (props.patientId !== null) {
      if (props.opdClinicsInfo?.length !== 0) {
        setRequestApi();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.patientId, props.data]);

  return (
    <Card
      title={
        props.noTitle ? null :
          <label className="gx-text-primary fw-bold fs-5">
            Visit วันนี้
          </label>
      }
      bordered={false}
    // style={{ width: "100%", marginBottom: 0 }}
    >
      <div style={{ margin: -20 }}>
        <Table
          scroll={{ x: 1100, y: 300 }}
          rowClassName="data-value"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={false}
        // onChange={(n) => onPagine(n)}
        />
      </div>
    </Card>
  );
}
