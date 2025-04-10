import React, { useEffect, useRef, useState } from "react";
import _uniqueId from "lodash/uniqueId";
import {
  Row,
  Col,
  Form,
  Card,
  Table,
  Select,
  Spin,
  Popconfirm,
  Button,
  Tooltip,
  Statistic,
} from "antd";
import { EditOutlined, DeleteOutlined, UserSwitchOutlined } from "@ant-design/icons";
import {
  GetLookupTypeRightOrVisit, // page 3.7, 3.10 dropdown "มุมมองตามสิทธิ์" ของตาราง "รายละเอียดค่ารักษาพยาบาล"
  GetFinancesType, // page 3.10 dropdown "ประเภทค่าใช้จ่าย" ของตาราง "รายละเอียดค่ารักษาพยาบาล"
  FinancesRightIpdDisplay, // page 3.10 เเสดงข้อมูลลงตาราง "รายละเอียดค่ารักษาพยาบาล"
  GetFinancesRightIpdDisplayByDate,
  GetAdmitRightByAdmitID, // page 3.7 เเสดงข้อมูลลงตาราง "รายละเอียดค่ารักษาพยาบาล"
  GetIpdSummaryFinance
} from "../../routes/PrivilegeCenter/API/CheckIpdApi";

import moment from "moment";
import { DelListFinance } from "../../routes/Ward/API/IpdNonDrugChargeApi";
import ResponseModal from '../../../src/components/Modal/Response';
import { useHistory } from "react-router-dom";
import DatepickerWithForm from "../../components/DatePicker/DatePickerWithForm";
import { map, filter, toNumber, uniqBy, sumBy } from 'lodash';
import { showPatient } from "../../appRedux/actions";
import { useSelector, useDispatch } from "react-redux";
import UpsertFinancesModal from "components/Modal/UpsertFinancesModal";
import ConcatBillGroupName from "components/helper/function/ConcatBillGroupName"
import dayjs from "dayjs";

const { Option } = Select;
const decimalToFixed2Comma = (value) =>
  new Intl.NumberFormat("TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)


export default function PatientDetailsExpenses({
  reload = () => { },
  fireReload = false,
  disabled = false,
  reloadAdmitRights = () => { },
  page = "22.6",
  ...props
}) {
  // console.log('props :>> ', props);
  const { selectPatient } = useSelector(({ patient }) => patient);
  // console.log('PatientDetailsExpenses => selectPatient', selectPatient)
  const dispatch = useDispatch();
  const [columnDetails, setColumnsDetails] = useState([]);
  const [chkDefalutColumn, setChkDefalutColumn] = useState(true);
  const history = useHistory()
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const rightViewRef = useRef(null); // set default "มุมมองตามสิทธิ์"
  const financeTypeRef = useRef(null); // set default "ประเภทค่าใช้จ่าย"
  //ResponseModal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalIcon, setModalIcon] = useState(null);
  const [modalTitle, setModalTitle] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false); // default true

  const [listDetailTotal, setListDetailTotal] = useState(null);

  const [sumOrder, setSumOrder] = useState({})

  const [form] = Form.useForm();

  const [opdFinancesRightViewData, setOpdFinancesRightViewData] = useState([]);
  const [, setOpdFinancesRightViewDataLoading] = useState(true);

  const [opdFinancesExpenseTypeData, setOpdFinancesExpenseTypeData] = useState(
    []
  );
  const [, setOpdFinancesExpenseTypeDataLoading] = useState(true);
  const [apiBaseRequestLoading, setApiBaseRequestLoading] = useState(true);

  const [listOrderId, setListOrderId] = useState([])
  const [orderValue, setOrderValue] = useState(null)
  const [filterData, setFilterData] = useState(null);

  const filterByOrderId = () => {
    if (orderValue) {
      let dataSource = [...list]
      // console.log('dataSource :>> ', dataSource);
      let mapping = map(dataSource, o => {
        let children = filter(o.children, ["orderId", orderValue])
        let mappingChildren = map(children, x => {
          return {
            ...x,
            amount: toNumber(x.amount),
            credit: toNumber(x.credit),
            cashReturn: toNumber(x.cashReturn),
            cashNotReturn: toNumber(x.cashNotReturn),
            discount: toNumber(x.discount),
            payment: toNumber(x.payment),
            overdue: toNumber(x.overdue),
            reminburse: toNumber(x.reminburse),
            // children: undefined
          }
        })
        let amount = sumBy(mappingChildren, "amount")
        let credit = sumBy(mappingChildren, "credit")
        let cashReturn = sumBy(mappingChildren, "cashReturn")
        let cashNotReturn = sumBy(mappingChildren, "cashNotReturn")
        let discount = sumBy(mappingChildren, "discount")
        let overdue = sumBy(mappingChildren, "overdue")
        let overdue_todate = sumBy(mappingChildren, "overdue_todate")
        let payment = sumBy(mappingChildren, "payment")
        let reminburse = sumBy(mappingChildren, "reminburse")
        // console.log('mappingChildren :>> ', mappingChildren);
        return {
          ...o,
          children: mappingChildren,
          amount: amount,
          credit: credit,
          cashReturn: cashReturn,
          cashNotReturn: cashNotReturn,
          discount: discount,
          payment: payment,
          overdue: overdue,
          reminburse: reminburse,
          overdue_todate: overdue_todate,
        }
      })
      let filterChildren = filter(mapping, o => o.children.length > 0)
      // console.log('filterChildren', filterChildren)
      setSumOrder({
        amount: sumBy(filterChildren, "amount"),
        credit: sumBy(filterChildren, "credit"),
        cashReturn: sumBy(filterChildren, "cashReturn"),
        cashNotReturn: sumBy(filterChildren, "cashNotReturn"),
        discount: sumBy(filterChildren, "discount"),
        payment: sumBy(filterChildren, "payment"),
        overdue: sumBy(filterChildren, "overdue_todate"),
        reminburse: sumBy(filterChildren, "reminburse"),
      })
      setFilterData(filterChildren)
    } else {
      setFilterData(null)
    }
  }
  useEffect(() => {
    filterByOrderId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderValue])

  const columnsDetailsMedicalExpenses = [
    {
      title: "รายการ",
      // className: "orderDetail",
      dataIndex: "billGroup_Name",
      width: 350,
      render: (record, row) => {
        // console.log(record, "log");
        // console.log(row, "log");
        return (
          <Row gutter={[4, 4]} align="middle" style={{ flexDirection: "row" }}>
            <Col span={!row.children?.length ? 21 : 24}>{record}</Col>
            {!row.children?.length
              ? <Col span={3} className="text-end">
                <Tooltip
                  title={
                    <>
                      <label className="data-value ms-1 mb-1">ผู้บันทึก :</label>
                      <label className="data-value ms-1 mb-1">{row?.userCreatedName || "-"}</label>
                      <label className="data-value ms-1 mb-1">{row?.dateCreated ? dayjs(row?.dateCreated, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm") : "-"}</label>
                      <br />
                      <label className="data-value ms-1 mb-1">ผู้แก้ไข :</label>
                      <label className="data-value ms-1">{row?.userModifiedName || "-"}</label>
                      <label className="data-value ms-1">{row?.dateModified ? dayjs(row?.dateModified, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm") : "-"}</label>
                    </>
                  }
                >
                  <Button
                    style={{ margin: 0 }}
                    icon={<UserSwitchOutlined style={{ color: "green" }} />}
                    size="small"
                  />
                </Tooltip>
              </Col>
              :
              null
            }
          </Row>
        )
      }
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      render: (v) => decimalToFixed2Comma(v)
    },
    {
      title: "เครดิต",
      dataIndex: "credit",
      render: (v) => decimalToFixed2Comma(v)
    },
    {
      title: "เบิกได้",
      dataIndex: "cashReturn",
      render: (v) => decimalToFixed2Comma(v)
    },
    {
      title: <span style={{ color: "red" }}>เบิกไม่ได้</span>,
      dataIndex: "cashNotReturn",
      render(v) {
        return {
          props: {
            style: { color: "red" },
          },
          children: decimalToFixed2Comma(v),
        };
      },
    },
    {
      title: "ส่วนลด",
      dataIndex: "discount",
      render: (v) => decimalToFixed2Comma(v)
    },
    {
      title: <span style={{ color: "red" }}>ค้างชำระ</span>,
      dataIndex: "overdue_todate",
      render(v) {
        return {
          props: {
            style: { color: "red" },
          },
          children: decimalToFixed2Comma(v),
        };
      },
    },
    {
      title: "ชำระเเล้ว",
      dataIndex: "payment",
      render: (v) => decimalToFixed2Comma(v)
    },
    {
      title: "เรียกเก็บ",
      dataIndex: "reminburse",
      render: (v) => decimalToFixed2Comma(v)
    },
  ];
  const columnsDetailsMedicalExpenses2 = [
    {
      title: "รายการ",
      dataIndex: "billGroup_Name",
      width: 350,
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      render(text,) {
        return {
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
        };
      }

    },
    {
      title: "เครดิต",
      dataIndex: "credit",
      render(text,) {
        return {
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
        };
      }
    },
    {
      title: "เบิกได้",
      dataIndex: "cashReturn",
      render(text,) {
        return {
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
        };
      }
    },
    {
      title: "เบิกไม่ได้",
      dataIndex: "cashNotReturn",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>,
        };
      },
    },
    {
      title: "ส่วนลด",
      dataIndex: "discount",
    },
    {
      title: "ค้างชำระ",
      dataIndex: "overdue_todate",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>,
        };
      },
    },
    {
      title: "ชำระเเล้ว",
      dataIndex: "payment",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>,
        };
      },
    },
    {
      title: "เรียกเก็บ",
      dataIndex: "reminburse",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>,
        };
      },
    },
    {
      title: "วันที่บันทึก",
      dataIndex: "date_created",
    },
  ];
  const columnsDetailsMedicalExpensesWithEditable = [
    {
      title: "รายการ",
      dataIndex: "billGroup_Name",
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      width: 100,
      align: "right",
    },
    {
      title: "เครดิต",
      dataIndex: "credit",
      width: 90,
      align: "right",
    },
    {
      title: "เบิกได้",
      dataIndex: "cashReturn",
      width: 90,
      align: "right",
    },
    {
      title: "เบิกไม่ได้",
      dataIndex: "cashNotReturn",
      width: 90,
      align: "right",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <div>{text}</div>,
        };
      },
    },
    {
      title: "รพ. ร่วมจ่าย",
      dataIndex: "offer",
      width: 90,
      align: "right",
    },
    {
      title: "ส่วนลด",
      dataIndex: "discount",
      width: 90,
      align: "right",
    },
    {
      title: "ค้างชำระ",
      width: 90,
      align: "right",
      dataIndex: "overdue_todate",
      render(text) {
        return {
          props: {
            style: { color: "red" },
          },
          children: <div>{text}</div>,
        };
      },
    },
    {
      title: "ชำระเเล้ว",
      dataIndex: "payment",
      width: 90,
      align: "right",
    },
    {
      title: "เรียกเก็บ",
      dataIndex: "reminburse",
      width: 90,
      align: "right",
    },
    {
      title: "",
      align: "center",
      fixed: "right",
      width: 120,
      render: (record) => {
        // console.log('record :>> ', record);
        return (
          <Row gutter={[4, 4]} style={{ flexDirection: "row" }} hidden={record.children !== undefined}>
            <Col>
              {record.isFinance
                ? <Tooltip
                  color={"blue"}
                  title={
                    <>
                      <label className="data-value">
                        ผู้บันทึก : {record.userCreated || "-"}
                      </label>
                      <br />
                      <label className="data-value">
                        {record.dateCreated
                          ? dayjs(record.dateCreated, "MM/DD/YYYY HH:mm").format("วันที่ : DD/MM/BBBB เวลา : HH:mm")
                          : "วันที่ : - เวลา : -"}
                      </label>
                      <br />
                      <label className="data-value">
                        ผู้แก้ไข : {record.userModified || "-"}
                      </label>
                      <br />
                      <label className="data-value">
                        {record.dateModified
                          ? dayjs(record.dateModified, "MM/DD/YYYY HH:mm").format("วันที่ : DD/MM/BBBB เวลา : HH:mm")
                          : "วันที่ : - เวลา : -"}
                      </label>
                    </>
                  }
                >
                  <Button
                    size="small"
                    icon={<UserSwitchOutlined style={{ color: "green" }} />}
                    style={{ margin: 0 }}
                  />
                </Tooltip>
                : <Button
                  size="small"
                  icon={<UserSwitchOutlined style={{ color: "grey" }} />}
                  style={{ margin: 0 }}
                />
              }

            </Col>
            <Col>
              <Button
                size="small"
                icon={<EditOutlined style={{ color: disabled ? "" : "blue" }} />}
                onClick={() => {
                  if (page === "21.2") {
                    // console.log('record', record)
                    history.push({ pathname: "/inpatient finance/inpatient-finance-ipd-non-drug-charge" });
                    dispatch(showPatient({ ...selectPatient, orderId: record?.orderId }));
                  } else {
                    history.push({ pathname: "/ward/ward-ipd-non-drug-charge" });
                  }
                }}
                disabled={record.orderId ? false : true}
                style={{ margin: 0 }}
              />
            </Col>
            <Col>
              <Popconfirm
                title="ต้องการลบหรือไม่?"
                onConfirm={async () => {
                  // setIpdRightLoading(true);
                  let res = await DelListFinance(record.financeId);
                  if (res.isSuccess) {
                    setIsModalVisible(true);
                    setModalIcon("success");
                    setModalTitle("ลบสำเร็จ");
                    // setReloadIpdRight(reloadIpdRight + 1);
                    setModalContent(null);
                    if (reload) reload(props)
                  } else {
                    setIsModalVisible(true);
                    setModalIcon("error");
                    setModalTitle("ลบไม่สำเร็จ");
                    setModalContent(
                      res.errorCode + "  " + res.errorMessage
                    );
                    // setIpdRightLoading(false);
                  }
                }}
                disabled={disabled || record.orderId ? false : true}
              >
                <Button
                  size="small"
                  icon={<DeleteOutlined style={{ color: disabled ? "" : "red" }} />}
                  disabled={disabled || record.orderId ? false : true}
                  style={{ margin: 0 }}
                />
              </Popconfirm>
            </Col>
          </Row >
        );
      }
    }
    ,
  ];
  const onFinishTreatFeeDetail = async (values) => {
    let startDate = values.startDate
      ? values.startDate.format("BBBB-MM-DD")
      : null;
    let endDate = values.endDate ? values.endDate.format("BBBB-MM-DD 23:59:59") : null;
    let opdFinancesExpenseType = values?.opdFinancesExpenseType
    let opdFinancesRightView = values?.opdFinancesRightView
      ? values?.opdFinancesRightView
      : "1";

    startDateRef.current = startDate;
    endDateRef.current = endDate;
    financeTypeRef.current = opdFinancesExpenseType;
    rightViewRef.current = opdFinancesRightView;

    if (opdFinancesRightView === "1") {
      if (props?.admitRightId) {
        await getFinancesRightIpd();
      }
    } else {
      await getDataAdmitRightByAdmitID();
    }
  };

  const getDataAdmitRightByAdmitID = async () => {
    if (page === "21.2" || page === "3.7" || page === "3.10" || page === "23.9" || page === "11.20") {
      const obj = {
        admitId: props.admitId,
        patientId: props.patientId,
        startDate: startDateRef.current,
        endDate: endDateRef.current,
        financeType: financeTypeRef.current || null,
      }
      // console.log(obj)
      const result = await GetIpdSummaryFinance(obj)
      cutomizeList(result)
      setListLoading(false);
    }
    else {
      let obj = {
        admitId: props.admitId,
        patientId: props.patientId,
      };
      let data = await GetAdmitRightByAdmitID(obj);
      // console.log("GetAdmitRightByAdmitID OBJ", obj);
      // console.log("GetAdmitRightByAdmitID", data);

      //-----------------------
      // let newList = data.map((admitId) => ({
      //   value: admitId.admitId,
      // }));
      let tempDataAll = [];
      for (let i = 0; i < data.length; i++) {
        const obj = {
          admitId: data[i].admitId,
          admitRightId: data[i].admitRightId,
          financeType: financeTypeRef.current,
        };
        // console.log("obj ==> : ", obj);

        const result = await FinancesRightIpdDisplay(obj);
        // console.log("FinancesRightIpdDisplay 3.10 : ", result);
        for (let j = 0; j < result.length; j++) {
          tempDataAll.push(result[j]);
        }
      }
      // console.log("tempDataAll", tempDataAll);
      cutomizeList(tempDataAll);
      setListLoading(false);
    }
    //----------------------
  };

  const getOpdFinancesRightView = async () => {
    setOpdFinancesRightViewDataLoading(true);

    const result = await GetLookupTypeRightOrVisit();
    setOpdFinancesRightViewData(result);

    setOpdFinancesRightViewDataLoading(false);
  };

  const getOpdFinancesExpenseType = async () => {
    setOpdFinancesExpenseTypeDataLoading(true);

    const result = await GetFinancesType();
    setOpdFinancesExpenseTypeData(result ? result : []);

    setOpdFinancesExpenseTypeDataLoading(false);
  };

  const [, setFinanceType] = useState("")

  const detectAdmitRight = () => {
    // detect admit right
    let tempAdmitRightId = null;
    if (rightViewRef.current === "1") {
      tempAdmitRightId = props.admitRightId;
    }

    return tempAdmitRightId;
  };

  const getFinancesRightIpd = async () => {
    setListLoading(true);

    if (page === "21.2" || page === "3.7" || page === "3.10" || page === "23.9" || page === "11.20") { // 3.7, 21.2 ใช้เส้น /IpdWard/IpdSummaryFinance
      const obj = {
        admitId: props.admitId,
        patientId: props.patientId,
        startDate: startDateRef.current,
        endDate: endDateRef.current,
        // rightId: props.rightId,
        financeType: financeTypeRef.current,
        admitRightId: props.admitRightId,
      }
      // console.log(obj)
      const result = await GetIpdSummaryFinance(obj)
      cutomizeList(result)
      setListLoading(false);
    }

    if (page === "15.12." || page === "18.16.") {
      const values = {
        admitId: props.admitId,
        admitRightId: detectAdmitRight(),
        financeType: financeTypeRef.current,
        startDate: startDateRef.current,
        endDate: endDateRef.current,
      };

      const result = await GetFinancesRightIpdDisplayByDate(values);
      cutomizeList(result);
      setListLoading(false);
    }
  };

  const cutomizeList = (values) => {
    setListOrderId([])
    setOrderValue(null)
    let tempList = [];
    let sum_AmountAll = 0;
    let sum_CreditAll = 0;
    let sum_CashReturnAll = 0;
    let sum_CashNotReturnAll = 0;
    let sum_DiscountAll = 0;
    let sum_PaymentAll = 0;
    let sum_ReminburseAll = 0;
    let sum_overdue_todateAll = 0;
    let sum_OfferAll = 0

    if (page === "21.2" || page === "3.7" || page === "3.10" || page === "23.9" || page === "11.20") {
      values?.map((val, index) => {
        let tempSubList = [];
        let amountSum = 0
        let creditSum = 0
        let cashReturnSum = 0
        let cashNotReturnSum = 0
        let discountSum = 0
        let paymentSum = 0
        let reminburseSum = 0
        let overdueSum = 0
        let offerSum = 0

        val.finances.map((valSub) => {
          tempSubList.push({
            ...valSub,
            key: _uniqueId("prefix-"),
            isFinance: true,
            billGroup_Name: `${dayjs(valSub.orderDate, 'MM/DD/YYYY').format('DD/MM/BBBB')} - ${valSub.expenseName}`, // รายการ
            amount: toNumber(valSub.amount),
            credit: toNumber(valSub.credit),
            cashReturn:
              toNumber(valSub.cashReturn),
            cashNotReturn:
              toNumber(valSub.cashNotReturn),
            offer: toNumber(valSub.offer),
            discount: toNumber(valSub.discount),
            payment: toNumber(valSub.payment),
            reminburse:
              toNumber(valSub.reminburse),
            overdue_todate:
              toNumber(valSub.overdue),
            financeId: [{ financeId: valSub.financeId }]
          });
          amountSum += Number(valSub.amount)
          creditSum += Number(valSub.credit)
          cashReturnSum += Number(valSub.cashReturn)
          cashNotReturnSum += Number(valSub.cashNotReturn)
          offerSum += Number(valSub.offer)
          discountSum += Number(valSub.discount)
          paymentSum += Number(valSub.payment)
          reminburseSum += Number(valSub.reminburse)
          overdueSum += Number(valSub.overdue)
        });

        const billgroupName = ConcatBillGroupName(val?.billgroupName, val?.billgroupEName)
        if (tempSubList.length === 0) {
          tempList.push({
            key: index,
            billGroup_Name: billgroupName,
            amount: toNumber(val.sum_Amount),
            credit: toNumber(val.sum_Credit),
            cashReturn: toNumber(val.cashReturn),
            cashNotReturn:
              toNumber(val.sum_CashNotReturn),
            discount: toNumber(val.sum_Discount),
            payment: toNumber(val.sum_Payment),
            reminburse:
              toNumber(val.sum_Reminburse),
            overdue_todate:
              toNumber(val.sum_overdue_todate),
            date_created: val.dateCreated,
          });
        } else {
          tempList.push({
            key: index,
            billGroup_Name: billgroupName,
            amount: toNumber(amountSum),
            credit: toNumber(creditSum),
            cashReturn: toNumber(cashReturnSum),
            cashNotReturn: toNumber(cashNotReturnSum),
            offer: toNumber(offerSum),
            discount: toNumber(discountSum),
            payment: toNumber(paymentSum),
            reminburse: toNumber(reminburseSum),
            overdue_todate: toNumber(overdueSum),
            date_created: val.dateCreated,
            children: tempSubList,
            financeId: tempSubList.map(i => {
              let container = { financeId: null };
              return container = { ...container, financeId: i.financeId[0].financeId }
            })
          });
        }

        sum_AmountAll += amountSum;
        sum_CreditAll += creditSum;
        sum_CashReturnAll += cashReturnSum;
        sum_CashNotReturnAll += cashNotReturnSum;
        sum_OfferAll += offerSum;
        sum_DiscountAll += discountSum;
        sum_PaymentAll += paymentSum;
        sum_ReminburseAll += reminburseSum;
        sum_overdue_todateAll += overdueSum;
      });
    }

    if (page === "15.12." || page === "18.16.") {
      values.map((val, index) => {
        let tempSubList = [];
        val.financesRightOpdIpdDetailDisplay.map((valSub) => {
          tempSubList.push({
            ...valSub,
            key: _uniqueId("prefix-"),
            isFinance: true,
            billGroup_Name: valSub.detail,
            amount: toNumber(valSub.amount),
            credit: toNumber(valSub.credit),
            cashReturn:
              toNumber(valSub.cashReturn),
            cashNotReturn:
              toNumber(valSub.cashNotReturn),
            offer:
              toNumber(valSub.offer),
            discount: toNumber(valSub.discount),
            payment: toNumber(valSub.payment),
            reminburse:
              toNumber(valSub.sum_Reminburse),
            overdue_todate:
              toNumber(valSub.overdue_todate),
          });
        });

        if (tempSubList.length === 0) {
          tempList.push({
            key: index,
            billGroup_Name: val.billGroup_Name,
            amount: toNumber(val.sum_Amount),
            credit: toNumber(val.sum_Credit),
            cashReturn:
              toNumber(val.sum_CashReturn),
            cashNotReturn:
              toNumber(val.sum_CashNotReturn),
            offer: toNumber(val.sum_Offer),
            discount: toNumber(val.sum_Discount),
            payment: toNumber(val.sum_Payment),
            reminburse:
              toNumber(val.sum_Reminburse),
            overdue_todate:
              toNumber(val.sum_overdue_todate),
          });
        } else {
          tempList.push({
            key: index,
            billGroup_Name: val.billGroup_Name,
            amount: toNumber(val.sum_Amount),
            credit: toNumber(val.sum_Credit),
            cashReturn:
              toNumber(val.sum_CashReturn),
            cashNotReturn:
              toNumber(val.sum_CashNotReturn),
            offer: toNumber(val.sum_Offer),
            discount: toNumber(val.sum_Discount),
            payment: toNumber(val.sum_Payment),
            reminburse:
              toNumber(val.sum_Reminburse),
            overdue_todate:
              toNumber(val.sum_overdue_todate),
            children: tempSubList,
          });
        }

        sum_AmountAll += Number(val.sum_Amount);
        sum_CreditAll += Number(val.sum_Credit);
        sum_CashReturnAll += Number(val.sum_CashReturn);
        sum_CashNotReturnAll += Number(val.sum_CashNotReturn);
        sum_OfferAll += Number(val.sum_Offer);
        sum_DiscountAll += Number(val.sum_Discount);
        sum_PaymentAll += Number(val.sum_Payment);
        sum_ReminburseAll += Number(val.sum_Reminburse);
        sum_overdue_todateAll += Number(val.sum_overdue_todate);
      });
    }

    let mappingChildren = []
    map(tempList, o => mappingChildren.push(...o.children))
    let listOrder = map(mappingChildren, o => {
      return {
        value: o.orderId,
        label: o.orderId,
        className: "data-value"
      }
    })
    setListOrderId(uniqBy(listOrder, "value"))
    setList(tempList);
    setListDetailTotal({
      sum_AmountAll,
      sum_CreditAll,
      sum_CashReturnAll,
      sum_CashNotReturnAll,
      sum_OfferAll,
      sum_DiscountAll,
      sum_PaymentAll,
      sum_ReminburseAll,
      sum_overdue_todateAll,
    });
  };

  const getApiBaseRequest = async () => {
    setApiBaseRequestLoading(true);

    if (opdFinancesRightViewData.length === 0) {
      await getOpdFinancesRightView();
    }

    if (page === "3.7" || page === "3.10" || page === "23.9" || page === "21.2" || page === "15.12." || page === "18.16." || page === "11.20") {
      if (opdFinancesExpenseTypeData.length === 0) {
        await getOpdFinancesExpenseType();
      }
    }

    setApiBaseRequestLoading(false);
  };

  //about date
  const disabledDateBefore = (current) => {
    return current && current > moment().endOf("day");
  };
  const disabledDateAfter = (current) => {
    return current && current < form.getFieldValue("startDate");
  };
  useEffect(() => {
    getApiBaseRequest();
    form.resetFields();
    startDateRef.current = null;
    endDateRef.current = null;
    setList([]);
    form.setFieldsValue({ opdFinancesRightView: "1" });
    form.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.admitId, props.admitRightId, fireReload]);

  // useEffect(() => {
  //   form.setFieldsValue({ opdFinancesRightView: "1" });
  //   form.submit();
  // }, [props.admitRightId,fireReload]);

  useEffect(() => {
    switch (page) {
      case "3.10":
        setChkDefalutColumn(false);
        setColumnsDetails(columnsDetailsMedicalExpenses2);
        break;
      case "23.9":
        setChkDefalutColumn(false);
        setColumnsDetails(columnsDetailsMedicalExpenses2);
        break;
      case "18.6":
        setChkDefalutColumn(false);
        setColumnsDetails(columnsDetailsMedicalExpensesWithEditable);
        break;
      case "21.2":
        setChkDefalutColumn(false);
        setColumnsDetails(columnsDetailsMedicalExpensesWithEditable);
        break;
      default:
        setChkDefalutColumn(true);
        setColumnsDetails(columnsDetailsMedicalExpenses);
        break;
    }
    if (page === "15.12." || page === "18.16.") {
      columnsDetailsMedicalExpenses.push({
        title: "",
        key: "action",
        width: 100,
        render: (record) => {
          // console.log('record', record)
          const disabledDelete = record?.payment || record?.reminburse
          return <Row hidden={!record?.financeId} gutter={[4, 4]} style={{ flexDirection: "row" }}>
            <Col span={12} className="text-center">
              <Button
                size="small"
                icon={<EditOutlined style={{ color: disabled ? "" : "blue" }} />}
                onClick={() => {
                  if (record?.financeType === "M" || record?.financeType === "D") {
                    history.push({
                      pathname: `/ipd presciption/ipd-prescription-ipd-drug-charge`,
                    });
                  } else {
                    console.log('selectPatient', selectPatient)
                    dispatch(showPatient({ ...selectPatient, orderId: record?.orderId }));
                    history.push({ pathname: "/ward/ward-ipd-non-drug-charge" });
                  }

                }}
                style={{ margin: 0 }}
              />
            </Col>
            <Col span={12} className="text-center">
              <Popconfirm
                title="ลบ ?"
                onConfirm={async () => {
                  // setIpdRightLoading(true);
                  let res = await DelListFinance([{ financeId: record.financeId }]);
                  if (res.isSuccess) {
                    setIsModalVisible(true);
                    setModalIcon("success");
                    setModalTitle("ลบสำเร็จ");
                    // setReloadIpdRight(reloadIpdRight + 1);
                    setModalContent(null);
                    reload()
                    reloadAdmitRights()
                    form.submit()
                  } else {
                    setIsModalVisible(true);
                    setModalIcon("error");
                    setModalTitle("ลบไม่สำเร็จ");
                    setModalContent(
                      res.errorCode + "  " + res.errorMessage
                    );
                    // setIpdRightLoading(false);
                  }
                }}
                disabled={disabledDelete}
              >
                <Button
                  type="danger"
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled={disabledDelete}
                  style={{ margin: 0 }}
                />
              </Popconfirm>
            </Col>
          </Row>
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireReload, disabled, selectPatient]);
  // console.log('props :>> ', props);
  const [vsbUpsertFinances, setVsbUpsertFinances] = useState(false)
  const PartsModalUpsertFinances = () => {
    return <UpsertFinancesModal
      visible={vsbUpsertFinances}
      close={() => {
        setVsbUpsertFinances(false)
      }}
      // Patient
      patientId={props?.patientId}
      serviceId={props?.serviceId}
      admitId={props?.admitId}
      clinicId={props?.clinicId}
      // Right
      opdRightId={null}
      admitRightId={props?.admitRightId}
      // Other
      orderId={null}
      opdIpd="I"
      page={page}
      workId={null}
      appointId={null}
      onFinished={() => {
        console.log('onFinished')
        reload()
        reloadAdmitRights()
      }}
    />
  }
  return (
    <Spin spinning={apiBaseRequestLoading}>
      <Row gutter={[8, 8]} style={{ marginBottom: -24, marginTop: -18 }}>
        <Col span={24}>
          <Form
            // {...layout}
            form={form}
            onFinish={onFinishTreatFeeDetail}
            layout="vertical"
          >
            <Card
              bordered={false}
              title={
                <Row gutter={[8, 8]} style={{ flexDirection: "row", marginBottom: -12, marginTop: -10 }} align="middle">
                  <Col>
                    <label className="gx-text-primary fw-bold fs-6">
                      รายละเอียดค่ารักษาพยาบาล
                    </label>
                  </Col>
                  <Col>
                    <Form.Item
                      name="startDate"
                      style={{ margin: 0 }}
                    >
                      <DatepickerWithForm
                        format={"DD/MM/YYYY"}
                        form={form}
                        name="startDate"
                        disabledDate={disabledDateBefore}
                        placeholder="วันที่เริ่มต้น"
                        onChange={(v) => {
                          form.submit()
                          props.setStartDate(v?.format("BBBB-MM-DD"))
                        }}
                        style={{ width: 120, margin: 0 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="endDate" style={{ margin: 0 }}>
                      <DatepickerWithForm
                        format={"DD/MM/YYYY"}
                        form={form}
                        name="endDate"
                        disabledDate={disabledDateAfter}
                        placeholder="วันที่สิ้นสุด"
                        onChange={(v) => {
                          form.submit()
                          props.setEndDate(v?.format("BBBB-MM-DD"))
                        }}
                        style={{ width: 120, margin: 0 }}
                      />
                    </Form.Item>
                  </Col>

                  {page === "3.7" || page === "3.10" || page === "23.9" || page === "15.12." || page === "18.16." || page === "21.2" || page === "11.20" ? (
                    <Col>
                      <Form.Item name="opdFinancesExpenseType" style={{ margin: 0 }}>
                        <Select
                          showSearch
                          placeholder="ประเภทค่าใช้จ่าย"
                          optionFilterProp="children"
                          style={{ width: 130, margin: 0 }}
                          onChange={(e) => {
                            form.submit()
                            setFinanceType(e)
                          }}
                          allowClear
                          dropdownMatchSelectWidth={false}
                          className="data-value"
                        >
                          {opdFinancesExpenseTypeData.map((value, index) => (
                            <Option key={index} value={value.datavalue} className="data-value">
                              {value.datadisplay}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  ) : (
                    []
                  )}
                  <Col>
                    <Form.Item name="opdFinancesRightView" style={{ margin: 0 }}>
                      <Select
                        showSearch
                        placeholder="มุมมอง"
                        optionFilterProp="children"
                        style={{ width: 130, margin: 0 }}
                        onChange={() => form.submit()}
                        allowClear
                        dropdownMatchSelectWidth={false}
                        className="data-value"
                      >
                        {opdFinancesRightViewData.map((value, index) => (
                          <Option key={index} value={value.datavalue} className="data-value">
                            {value.datadisplay}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="xxx" style={{ margin: 0 }}>
                      <Select
                        showSearch
                        placeholder="Order Id"
                        optionFilterProp="children"
                        style={{ width: 125, margin: 0 }}
                        value={orderValue}
                        onChange={(v) => {
                          setOrderValue(v)
                        }}
                        allowClear
                        className="data-value"
                        options={listOrderId}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      style={{ margin: 0 }}
                    >
                      <Button
                        type='primary'
                        style={{ margin: 0 }}
                        onClick={() => setVsbUpsertFinances(true)}
                      >เพิ่มค่าใช้จ่าย</Button>
                      {/* <Button
                        hidden
                        id="Reload_Finances_22.6"
                        type='primary'
                        style={{ margin: 0 }}
                        onClick={() => getDataAdmitRightByAdmitID()}
                      /> */}
                      <Button
                        hidden
                        id="Reload_Finances_22.6"
                        type='primary'
                        style={{ margin: 0 }}
                        onClick={async () => {
                          const opdFinancesRightView = form.getFieldValue("opdFinancesRightView")
                          if (opdFinancesRightView === "1") {
                            if (props?.admitRightId) {
                              await getFinancesRightIpd();
                            }
                          } else {
                            await getDataAdmitRightByAdmitID();
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              }
            // style={{ width: "100%" }}
            >
              <div style={{ margin: -20 }}>
                <Table
                  size="small"
                  loading={listLoading}
                  scroll={{ x: 1000, y: 500 }}
                  columns={columnDetails}
                  dataSource={filterData === null ? list : filterData}
                  pagination={false}
                  rowClassName="data-value"
                  defaultColumn={chkDefalutColumn}
                />
              </div>
            </Card>
          </Form>
        </Col>
      </Row >
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Spin spinning={listLoading}>
            <Card>
              <Row gutter={[8, 8]}>
                {page !== "21.2" ? (<>
                  <Col span={3}>
                    {/* <strong>
                      <label className="gx-text-primary">ผู้บันทึก</label>
                    </strong> */}
                  </Col>
                  <Col span={5}>
                    {/* <strong>
                      <label className="gx-text-primary">ผู้เเก้ไข</label>
                    </strong> */}
                  </Col>
                </>) : null}

                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">จำนวนเงิน</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">เครดิต</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">เบิกได้</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="fw-bold text-danger">เบิกไม่ได้</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">รพ. ร่วมจ่าย</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">ส่วนลด</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="fw-bold text-danger">ค้างชำระ</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">ชำระเเล้ว</label>
                </Col>
                <Col span={2} className="text-center">
                  <label className="gx-text-primary fw-bold">เรียกเก็บ</label>
                </Col>
              </Row>

              <Row gutter={[16, 24]}>
                {page !== "21.2" ? (<>
                  <Col span={3}>
                  </Col>
                  <Col span={5}>
                  </Col>
                </>) : null}

                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.amount || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_AmountAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.credit || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_CreditAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.cashReturn || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_CashReturnAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14, color: "red" }} precision={2} value={sumOrder?.cashNotReturn || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14, color: "red" }} precision={2} value={listDetailTotal?.sum_CashNotReturnAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.offer || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_OfferAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.discount || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_DiscountAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14, color: "red" }} precision={2} value={sumOrder?.overdue || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14, color: "red" }} precision={2} value={listDetailTotal?.sum_overdue_todateAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.payment || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_PaymentAll || "-"} />
                  }
                </Col>
                <Col span={2} className="text-center">
                  {orderValue
                    ? <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={sumOrder?.reminburse || "-"} />
                    : <Statistic valueStyle={{ fontSize: 14 }} precision={2} value={listDetailTotal?.sum_ReminburseAll || "-"} />
                  }
                </Col>
              </Row>
            </Card>
          </Spin>
        </Col>
      </Row>
      <ResponseModal isModalVisible={isModalVisible}
        setIsModalVisible={(value) => setIsModalVisible(value)}
        modalIcon={modalIcon}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
      {PartsModalUpsertFinances()}
    </Spin >
  );
}
