
import { DeleteOutlined, EditOutlined, } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  // Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Spin,
  Statistic,
  // DatePicker,
  Table
} from "antd";
import thTH from "antd/lib/locale/th_TH";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { filter, find, map, orderBy, sumBy, toNumber, uniqBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DayjsDatePicker from "../../components/DatePicker/DayjsDatePicker";
import InsertOpdRight from "../../components/Modal/InsertOpdRight";
import UpdateOpdRight from "../../components/Modal/UpdateOpdRight";
import BreadcrumbMenu from "../Breadcrumb/BreadcrumbMenu";
import Notifications from "../Modal/Notifications";
import UpdPatientRight from "../Modal/UpdPatientRight";
import AddRight from "../Patient/AddRight";
import IpdPatient from "../Patient/IpdPatient";
import OpdPatient from "../Patient/OpdPatient";
import {
  DelIpdRight,
  DelOpdRightVisitOfDate,
  GetAppointsOpdVisit,
  GetFinancesRightDisplay,
  GetFinancesType,
  GetLookupViewOpdRight,
  GetOpdServiceRightCash,
  GetSelectRights,
  GetServiceRight,
  InsListRefFinancesIpdRights,
  InsListRefFinancesOpdRights,
  UpdListFinancesIpdRights,
  UpdListFinancesOpdRights,
} from "./ExpenseTransferApi";
dayjs.extend(isBetween);

const { Option } = Select;

const marginBottomDiv = {
  marginBottom: "-23px",
};
const marginBottomCard = {
  marginBottom: "10px",
};
const marginForDivider = {
  marginLeft: "-24px",
  marginRight: "-24px",
};

export default function ExpenseTransfer({ page }) {
  const { pathname } = useSelector(({ common }) => common);
  const [loading, setLoading] = useState(false);
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  let user = userFromSession.responseData.userId;
  const { opdPatientDetail } = useSelector(
    ({ opdPatientDetail }) => opdPatientDetail
  );
  const { selectPatient } = useSelector(({ patient }) => patient);
  const [basicData, setBasicData] = useState(null);
  // Notifications
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [patientType, setPatientType] = useState(null);
  useEffect(() => {
    if (
      pathname === "/privilege center/privilege-center-opd-expense-right-transfer" ||
      pathname === "/reimbursement/reimbursement-opd-transfer-expenses-right" ||
      pathname === "/outpatient finance/outpatient-transfer-finance-ipd-right"
    ) {
      setPatientType("opd");
    }
    if (
      pathname === "/privilege center/privilege-center-ipd-expense-right-transfer" ||
      pathname === "/inpatient finance/inpatient-finance-ipd-transfer-expensesopd-right" ||
      pathname === "/reimbursement/reimbursement-ipd-transfer-expenses-right" ||
      pathname === "/inpatient finance/inpatient-finance-check-bill"
    ) {
      setPatientType("ipd");
    }
  }, [pathname]);
  // เซ็ต BasicData
  const manageBasicData = (opdIpd) => {
    if (!opdIpd) {
      resetValues();
      setServiceRight([]);
      setRightRadio(null);
      setStartDate(null);
      setEndDate(null);
      setActionRightId(null);
      return
    }
    switch (opdIpd) {
      case "opd":
        if (opdPatientDetail) {
          setBasicData({
            patientId: opdPatientDetail.patientId,
            actionId: opdPatientDetail.serviceId,
            hn: opdPatientDetail.hn,
            serviceDate: opdPatientDetail.serviceDate,
            patientType: "opd",
          });
        }
        break;
      case "ipd":
        if (selectPatient) {
          setBasicData({
            patientId: selectPatient.patientId,
            actionId: selectPatient.admitId,
            hn: selectPatient.hn,
            an: selectPatient.an,
            patientType: "ipd",
          });
        }
        break;
      default:
        break;
    }
    resetValues();
    setServiceRight([]);
    setRightRadio(null);
    setStartDate(null);
    setEndDate(null);
    setActionRightId(null);
  }
  useEffect(() => {
    manageBasicData(patientType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opdPatientDetail, selectPatient, patientType]);
  // console.log(basicData);
  const [appointsVisit, setAppointsVisit] = useState({});
  // console.log(appointsVisit);
  const [opdServiceRightCash, setOpdServiceRightCash] = useState({});
  const [serviceRightCash, setServiceRightCash] = useState([]);
  const [serviceRight, setServiceRight] = useState([]);
  const [, setServiceRightValue] = useState(null);
  const [, setSelectRights] = useState([]);
  const [lookupViewRight, setLookupViewRight] = useState([]);
  const [financesRightDisplay, setFinancesRightDisplay] = useState([]);
  const [financeTypeList, setFinanceTypeList] = useState([]);
  const [financeType, setFinanceType] = useState(null);

  // console.log(selectRights);
  const fetchFinancesType = async () => {
    let res = await GetFinancesType();
    setFinanceTypeList(res);
    return res;
  };
  const fetchLookupViewOpdRight = async () => {
    let res = await GetLookupViewOpdRight();
    setLookupViewRight(res);
  };
  const fetchAppointsOpdVisit = async (serviceId) => {
    setLoading(true);
    let res = await GetAppointsOpdVisit(serviceId);
    setAppointsVisit(res);
    setLoading(false);
  };
  const fetchOpdServiceRightCash = async () => {
    if (!basicData?.patientId) {
      setServiceRightValue(null);
      setOpdServiceRightCash([])
      setServiceRightCash([])
      return
    }
    setLoading(true);
    setServiceRightValue(null);
    let res = await GetOpdServiceRightCash(basicData?.patientId);
    setOpdServiceRightCash(res);
    setServiceRightCash(res.serviceRightCash);
  };

  // console.log("basicData  =>", basicData);
  const fetchRights = async () => {
    setSelectRights([]);
    // setServiceRightValue(null)
    setActionRightId(null);
    if (!basicData?.patientId) return;
    let req = {
      patientId: basicData?.patientId,
      actionId: basicData?.actionId,
      hn: basicData?.hn,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
      patientType: basicData?.patientType,
    };
    setRightLoading(true);
    let res = await GetServiceRight(req);
    setRightLoading(false);
    if (basicData.patientType === "opd") {
      let filterX = filter(res, ["serviceId", serviceIdBySelect]);
      let mapping = map(filterX, (o) => {
        return {
          ...o,
          actionRightId: o.opdRightId,
        };
      });
      setServiceRight(mapping);
    }
    if (basicData?.patientType === "ipd") {
      let mapping = map(res, (o) => {
        return {
          ...o,
          actionRightId: o.admitRightId,
        };
      });
      setServiceRight(mapping);
    }
  };
  const fetchSelectRights = async () => {
    if (basicData?.patientId) {
      setLoading(true);
      let values = {
        patientId: basicData?.patientId,
        actionId: serviceIdBySelect,
        patientType: basicData?.patientType,
      };
      let res = await GetSelectRights(values);
      setSelectRights(res);
      // console.log(res);
    } else {
      setSelectRights([]);
    }
    setLoading(false);
  };
  const fetchFinancesRightDisplay = async () => {
    if (!basicData) return
    setMedicalFeeLoading(true);
    setLookupViewRightRadio(null);
    setCashForTransfer(null);
    setCashForTransferFake(null);
    let value = {
      patientId: basicData?.patientId,
      actionId: basicData?.actionId,
      hn: basicData?.hn,
      actionRightId: rightRadio,
      patientType: basicData?.patientType,
      financeType: financeType ? financeType : null,
      startDate: startDateFinance ? dayjs(startDateFinance).format("YYYY-MM-DD") : null,
      endDate: endDateFinance ? dayjs(endDateFinance).format("YYYY-MM-DD") : null,
    };
    let res = await GetFinancesRightDisplay(value);
    const uniqFinancesRight = uniqBy(res, 'billgroup')
    setFinancesRightDisplay(uniqFinancesRight);
    setMedicalFeeLoading(false);
  };
  const delOpdOrIpdRight = async (actionRightId) => {
    setLoading(true);
    if (patientType === "opd") {
      let res = await DelOpdRightVisitOfDate(actionRightId);
      setLoading(false);
      setProcessResult(res);
      setNotificationsTitle("ลบสิทธิ์");
      setShowNotificationsModal(true);
      if (res.isSuccess !== undefined && res.isSuccess === true) {
        await fetchRights();
      }
    }
    if (patientType === "ipd") {
      let res = await DelIpdRight(actionRightId);
      setLoading(false);
      setProcessResult(res);
      setNotificationsTitle("ลบสิทธิ์");
      setShowNotificationsModal(true);
      if (res.isSuccess !== undefined && res.isSuccess === true) {
        await fetchRights();
      }
    }
  };
  useEffect(() => {
    fetchLookupViewOpdRight();
    fetchFinancesType();
  }, []);
  useEffect(() => {
    if (opdPatientDetail) {
      if (opdPatientDetail?.serviceId) {
        setServiceIdBySelect(opdPatientDetail.serviceId);
      } else {
        setAppointsVisit(opdPatientDetail);
      }
      fetchAppointsOpdVisit();
    }
  }, [opdPatientDetail]);

  useEffect(() => {
    fetchOpdServiceRightCash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicData]);
  const [serviceIdBySelect, setServiceIdBySelect] = useState(null);
  const [cashByServiceId, setCashByServiceId] = useState({});
  const getCashByServiceId = async (serviceId) => {
    if (serviceId && serviceRightCash.length > 0) {
      let res = await find(serviceRightCash, (o) => {
        return o.serviceId === serviceId;
      });
      setCashByServiceId({
        amount: res?.amount,
        cashReturn: res?.cashReturn,
        cashNotReturn: res?.cashNotReturn,
      });
    }
    if (!serviceId) {
      setCashByServiceId({});
    }
  };

  useEffect(() => {
    getCashByServiceId(serviceIdBySelect);
    fetchAppointsOpdVisit(serviceIdBySelect);
    fetchRights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdBySelect, serviceRightCash]);
  useEffect(() => {
    fetchSelectRights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdBySelect]);
  // สิทธิการรักษา
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  useEffect(() => {
    if (basicData?.patientId) {
      setRightRadio(null);
      resetValues();
      fetchRights();
    } else setServiceRight([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicData]);
  const [rightRadio, setRightRadio] = useState(null);
  const rightRadioChange = (value) => {
    if (value !== rightRadio) {
      resetValues();
      setRightRadio(value);
    } else {
      setRightRadio(null);
      resetValues();
    }
  };
  const [patient, setPatient] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [startDateFinance, setStartDateFinance] = useState(null)
  const [endDateFinance, setEndDateFinance] = useState(null)

  // useEffect(() => {
  //   if (!patient) return
  //   let admitDate = patient.admitDate ? dayjs(patient.admitDate, "DD/MM/YYYY").subtract("543", "y") : null
  //   let dischDate = patient.dischDate ? dayjs(patient.dischDate, "DD/MM/YYYY").subtract("543", "y") : dayjs()
  //   setStartDateFinance(admitDate)
  //   setEndDateFinance(dischDate)
  //   return
  // }, [patient])

  useEffect(() => {
    if (rightRadio) {
      fetchFinancesRightDisplay();
    }
    if (!rightRadio) {
      setFinancesRightDisplay([]);
      setFinanceSelected({});
      setSelectedRowKeys([]);
      setFinanceSelectedForTransfer([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightRadio, financeType, startDateFinance, endDateFinance]);
  // Table สิทธิการรักษา
  const [actionRightId, setActionRightId] = useState(null);
  const [rightForTransferSelected, setRightForTransferSelected] = useState({});
  const [rightLoading, setRightLoading] = useState(false);
  const [showUpdPatientRightModal, setShowUpdPatientRightModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [prevRight, setPrevRight] = useState({});
  const [openInsertOpdRight, setOpenInsertOpdRight] = useState(false)
  const [openUpdateOpdRight, setOpenUpdateOpdRight] = useState(false)
  const TableRight = useMemo(() => {
    const dataSource = serviceRight.map((val, index) => {
      return {
        ...val,
        key: index,
        actionId:
          basicData?.patientType === "opd"
            ? val.serviceId
            : basicData?.patientType === "ipd" && val.admitId,
        actionRightId:
          basicData?.patientType === "opd"
            ? val.opdRightId
            : basicData?.patientType === "ipd" && val.admitRightId,
        editAble:
          basicData?.patientType === "opd"
            ? val.editAble
            : basicData?.patientType === "ipd" && null,
      };
    });
    const columns = [
      {
        title: <label className="gx-text-primary"></label>,
        dataIndex: "",
        key: "key",
        align: "center",
        width: 40,
        fixed: "left",
        render: (val) => (
          <div>
            <Radio.Group name="rightRadio" value={rightRadio}>
              <Radio
                value={val.actionRightId}
                onClick={(e) => {
                  rightRadioChange(e.target.value);
                  setServiceRightValue(val.actionId);
                  setActionRightId(val.actionRightId);
                  setFinanceSelectedForTransfer([]);
                  setFinanceSelected({});
                  setSelectedRowKeys([]);
                }}
              />
            </Radio.Group>
          </div>
        ),
      },
      {
        title: <label className="gx-text-primary">สิทธิ์</label>,
        dataIndex: "rightName",
        key: "key",
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">จำนวนเงิน</label>,
        dataIndex: "amount",
        key: "key",
        align: "right",
        width: 95,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">เครดิต</label>,
        dataIndex: "credit",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-color">เบิกได้</label>,
        dataIndex: "cashReturn",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-danger">เบิกไม่ได้</label>,
        dataIndex: "cashNotReturn",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val || 0}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">ชำระ</label>,
        dataIndex: "payment",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">ส่วนลด</label>,
        dataIndex: "discount",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-danger">ค้างชำระ</label>,
        dataIndex: "cashReturn",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">ใช้สิทธิ์ล่าสุด</label>,
        dataIndex: "",
        key: "key",
        align: "center",
        width: 110,
        // render: (val) => <label className="data-value">{val}</label>
      },
      {
        title: <label className="gx-text-primary"></label>,
        dataIndex: "",
        key: "key",
        align: "center",
        width: 75,
        fixed: "right",
        render: (val) => {
          // let disabledEdit = val.editAble !== "0" || !val.editAble
          let disabledDel = toNumber(val.amount) !== 0
          return (
            <Row gutter={[4, 4]}>
              <Col className="text-nowrap">
                {val.editAble === "0" || !val.editAble
                  ? <Button
                    size="small"
                    icon={<EditOutlined className="gx-text-primary" />}
                    onClick={() => {
                      if (patientType === "opd") {
                        setOpenUpdateOpdRight(true);
                        setEditId(val.actionRightId);
                        // console.log('val.actionRightId :>> ', val.actionRightId);
                      }
                      if (patientType === "ipd") {
                        setShowUpdPatientRightModal(true);
                        setEditId(val.actionRightId);
                        setPrevRight({
                          amount: val.amount ? val.amount : "0.00",
                          cashReturn: val.claim ? val.claim : "0.00",
                          copay: val.copay ? val.copay : "0.00",
                        });
                      }
                    }}
                    style={{ margin: 0, marginRight: 2 }}
                  />
                  : <Button
                    size="small"
                    icon={<EditOutlined style={{ color: "#E0E0E0" }} />}
                    style={{ margin: 0, marginRight: 2 }}
                    disabled
                  />
                }
                <Popconfirm
                  title="ลบจากระบบ ？"
                  okText="Yes"
                  onConfirm={() => {
                    delOpdOrIpdRight(val.actionRightId);
                  }}
                  cancelText="No"
                  disabled={disabledDel}
                >
                  <Button
                    size="small"
                    icon={<DeleteOutlined style={{ color: disabledDel ? "#E0E0E0" : "red" }} />}
                    onClick={() => {
                    }}
                    style={{ margin: 0 }}
                    disabled={disabledDel}
                  />
                </Popconfirm>
              </Col>
            </Row>
          )
        }
      },
    ];
    return (
      <Table
        loading={rightLoading}
        scroll={{ x: 945, y: 248 }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceRight, rightLoading, rightRadio]);
  // Table รายละเอียดค่ารักษาพยาบาล
  const [lookupViewRightRadio, setLookupViewRightRadio] = useState(null);

  const [financeSelected, setFinanceSelected] = useState({});
  const [rightSelectedForTransfer, setRightSelectedForTransfer] = useState(null);
  const [financeSelectedForTransfer, setFinanceSelectedForTransfer] = useState([]);
  const [medicalFeeLoading, setMedicalFeeLoading] = useState(false);
  const [transferTypeRadio, setTransferTypeRadio] = useState(null);
  const [cashForTransfer, setCashForTransfer] = useState(null);
  const [cashForTransferFake, setCashForTransferFake] = useState(null);
  const [maxOverdue, setmaxOverdue] = useState(null);
  const [, setAlllowedToTransfer] = useState(false);
  const [FilteredFinancesRightDisplay, setFilteredFinancesRightDisplay] = useState([]);
  const resetValues = () => {
    setRightRadio(null);
    setAlllowedToTransfer(false);
    setTransferTypeRadio(null);
    setmaxOverdue(null);
    setRightSelectedForTransfer(null);
    setFinanceSelected({});
    setFinanceSelectedForTransfer([]);
    setSelectedRowKeys([]);
    setFinancesRightDisplay([]);
    setLookupViewRightRadio(null);
    setCashForTransfer(null);
  };
  useEffect(() => {
    if (financeSelectedForTransfer.length > 0) {
      let filteredData = filter(
        financeSelectedForTransfer,
        (val) => val.type === null
      );
      setmaxOverdue(sumBy(filteredData, "overdue_todate"));
    } else setmaxOverdue(null);
  }, [financeSelectedForTransfer]);
  const checkCashForTransfer = () => {
    if (financeSelectedForTransfer.length > 0) {
      let claimToNumber = toNumber(rightForTransferSelected.claim);
      if (maxOverdue >= claimToNumber) {
        setAlllowedToTransfer(false);
      } else setAlllowedToTransfer(true);
    } else setAlllowedToTransfer(false);
  };
  useEffect(() => {
    if (rightForTransferSelected.claim !== undefined) {
      checkCashForTransfer();
    } else setAlllowedToTransfer(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxOverdue, rightForTransferSelected]);
  useEffect(() => {
    if (rightSelectedForTransfer) {
      async function setData() {
        let result = await find(serviceRight, [
          "actionRightId",
          rightSelectedForTransfer,
        ]);
        setRightForTransferSelected(result);
      }
      setData();
    } else setRightForTransferSelected({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightSelectedForTransfer]);

  const TableMedicalFee = () => {
    const dataSource = financesRightDisplay.map((val, index) => {
      let children = val.financesRightOpdIpdDetailDisplay.map((vall, indexx) => {
        return {
          key: index + "children" + indexx,
          financeId: vall.financeId,
          type: null,
          dateCreated: "",
          // name: `${date} - ${vall.expenseName}`,
          name: `${vall.detail}`,
          amount: toNumber(vall.amount),
          credit: toNumber(vall.credit),
          // claim: toNumber(vall.claim),
          // copay: toNumber(vall.copay),
          cashReturn: toNumber(vall.cashReturn),
          cashNotReturn: toNumber(vall.cashNotReturn),
          discount: toNumber(vall.discount),
          payment: toNumber(vall.payment),
          overdue_todate: toNumber(vall.overdue_todate) < 0 ? 0 : toNumber(vall.overdue_todate),
          sum_Reminburse: toNumber(vall.sum_Reminburse),
          isPayment: vall.isPayment,
          isDiscount: vall.isDiscount,
          isOpdipd: vall.isOpdipd,
        };
      })
      return {
        key: index,
        type: val.billgroup,
        children: children,
        name: val.billGroup_Name,
        dateCreated: val.dateCreated,
        amount: sumBy(children, "amount"),
        credit: sumBy(children, "credit"),
        // claim: toNumber(val.sum_Claim),
        // copay: toNumber(val.sum_Copay),
        cashReturn: sumBy(children, "cashReturn"),
        cashNotReturn: sumBy(children, "cashNotReturn"),
        discount: sumBy(children, "discount"),
        payment: sumBy(children, "payment"),
        overdue_todate: sumBy(children, "overdue_todate"),
        sum_Reminburse: sumBy(children, "sum_Reminburse"),
        isPayment: val.isPayment,
        isDiscount: val.isDiscount,
        isOpdipd: val.isOpdipd,
      };
    });

    const combinations = (listAmount) => {
      let result = [];
      function* generateCombinations(arr, minSize) {
        function* doGenerateCombinations(offset, combo) {
          if (combo.length >= minSize) {
            yield combo;
          }
          for (let i = offset; i < arr.length; i++) {
            yield* doGenerateCombinations(i + 1, combo.concat(arr[i]));
          }
        }
        yield* doGenerateCombinations(0, []);
      }

      for (let combo of generateCombinations(listAmount, 0)) {
        result.push({
          listAmount: combo.map((o) => {
            return {
              amount: o,
            };
          }),
          sum: sumBy(combo),
        });
      }
      return result;
    };

    useEffect(() => {
      setSelectedRowKeys([]);
      setFinanceSelectedForTransfer([]);
      setFinanceSelected({});
      let filteredData = [];
      if (lookupViewRightRadio === "2") {
        filteredData = filter(dataSource, (o) => {
          return o.overdue_todate !== 0;
        });
      } else {
        filteredData = dataSource;
      }
      if (cashForTransfer) {
        filteredData = filter(filteredData, (o) => {
          return o.amount <= toNumber(cashForTransfer);
        });
        let listCombination = combinations(map(filteredData, "amount"));
        let filteredCombination = filter(
          listCombination,
          (o) => o.sum <= toNumber(cashForTransfer)
        );
        let ordered = orderBy(filteredCombination, "sum", "desc");
        let list = filteredData;
        let mapping = ordered[0]?.listAmount.map((o) => {
          let obj = find(list, (i) => i.amount === o.amount);
          let filterX = filter(list, (x) => x.key !== obj.key);
          list = filterX;
          return obj;
        });
        filteredData = mapping;
      }

      setFilteredFinancesRightDisplay(filteredData);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookupViewRightRadio, cashForTransfer, financeType]);

    const columns = [
      {
        title: <label className="gx-text-primary">รายการ</label>,
        dataIndex: "",
        key: "key",
        render: (val) => (
          <label className="data-value">
            {val.name} {!val.financeId && `(${val?.children?.length})`}
          </label>
        ),
      },
      {
        title: <label className="gx-text-primary">วันที่บันทึก</label>,
        dataIndex: "dateCreated",
        key: "key",
        align: "center",
        width: 100,
        render: (val) => <label className="data-value">{val}</label>,
      },
      {
        title: <label className="gx-text-primary">จำนวนเงิน</label>,
        dataIndex: "amount",
        key: "key",
        align: "right",
        width: 95,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">เครดิต</label>,
        dataIndex: "credit",
        key: "key",
        align: "right",
        width: 85,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-color">เบิกได้</label>,
        dataIndex: "cashReturn",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-danger">เบิกไม่ได้</label>,
        dataIndex: "cashNotReturn",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">ส่วนลด</label>,
        dataIndex: "discount",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="gx-text-primary">ชำระแล้ว</label>,
        dataIndex: "payment",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-danger">ค้างชำระ</label>,
        dataIndex: "overdue_todate",
        key: "key",
        align: "right",
        width: 90,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
      {
        title: <label className="topic-danger">เรียกเก็บแล้ว</label>,
        dataIndex: "sum_Reminburse",
        key: "key",
        align: "right",
        width: 110,
        // render: (val) => <label className="data-value">{val}</label>,
        render(text,) {
          return {
            children: <label>{Intl.NumberFormat("en").format(text) + "."}</label>
          };
        }
      },
    ];

    const [checkStrictly,] = useState(false);

    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let sumResult = {
          amount: sumBy(selectedRows, (val) => {
            return val.type === null && val.amount;
          }),
          // claim: sumBy(selectedRows, (val) => {
          //   return val.type === null && val.claim;
          // }),
          cashReturn: sumBy(selectedRows, (val) => {
            return val.type === null && val.cashReturn;
          }),
          cashNotReturn: sumBy(selectedRows, (val) => {
            return val.type === null && val.cashNotReturn;
          }),
          credit: sumBy(selectedRows, (val) => {
            return val.type === null && val.credit;
          }),
          discount: sumBy(selectedRows, (val) => {
            return val.type === null && val.discount;
          }),
          payment: sumBy(selectedRows, (val) => {
            return val.type === null && val.payment;
          }),
          overdue_todate: sumBy(selectedRows, (val) => {
            return val.type === null && val.overdue_todate;
          }),
        };
        setFinanceSelected(sumResult);
        setSelectedRowKeys(selectedRowKeys);
        setFinanceSelectedForTransfer(selectedRows);
      },
      getCheckboxProps: (record) =>
        basicData?.patientType === "ipd" && {
          disabled:
            (record.children !== undefined &&
              record.children.filter(
                () => record.isPayment !== "1" && record.isDiscount !== "1"
              ).length === 0) ||
            record.isPayment === "1" ||
            record.isDiscount === "1",
        },
    };

    let filterData = lookupViewRightRadio || cashForTransfer
      ? FilteredFinancesRightDisplay
      : dataSource

    if (startDateFinance || endDateFinance) {
      const startDate = startDateFinance ? dayjs(startDateFinance).startOf('day') : null;
      const endDate = endDateFinance ? dayjs(endDateFinance).endOf('day') : null;

      const datePattern = /\d{2}\/\d{2}\/\d{4}/;

      filterData = filterData.map((v) => {
        if (v.children && v.children.length > 0) {
          v.children = v.children.filter((child) => {
            const orderDateMatch = child.name.match(datePattern);
            if (orderDateMatch) {
              const orderDate = dayjs(orderDateMatch[0], "DD/MM/YYYY").subtract(543, 'year');

              if (startDate && endDate) {
                return orderDate.isBetween(startDate, endDate, null, '[]');
              } else if (startDate) {
                return orderDate.isSame(startDate, 'day') || orderDate.isAfter(startDate);
              } else if (endDate) {
                return orderDate.isSame(endDate, 'day') || orderDate.isBefore(endDate);
              }
            }
            return false;
          });
        }
        return v;
      }).filter((v) => v.children && v.children.length > 0);
    }

    return (
      <div>
        <Spin spinning={medicalFeeLoading}>
          <Table
            scroll={{ x: 1120, y: 300 }}
            columns={columns}
            rowSelection={{ ...rowSelection, checkStrictly }}
            dataSource={filterData}
            pagination={false}
          />
        </Spin>
      </div>
    );
  };

  // console.log('startDateFinance, endDateFinance', dayjs(startDateFinance).format("DD/MM/YYYY"), dayjs(endDateFinance).format("DD/MM/YYYY"))

  const onChangeTransferTypeRadio = (val) => {
    setTransferTypeRadio(val);
  };

  const setValuesForOpdTransfer = async (type) => {
    if (type === "total") {
      let dataSource = await filter(financeSelectedForTransfer, (val) => {
        return !val.type;
      });
      let result = await dataSource.map((val) => {
        return {
          financeId: val.financeId,
          opdRightId: rightSelectedForTransfer && rightSelectedForTransfer,
          userModified: user,
        };
      });
      return result;
    }
    if (type === "overdue") {
      let dataSource = await filter(financeSelectedForTransfer, (val) => {
        return !val.type;
      });
      let result = await dataSource.map((val) => {
        return {
          refFinancesRightsId: null,
          financeId: val.financeId,
          opdRightId: rightSelectedForTransfer && rightSelectedForTransfer,
          price: null,
          quantity: null,
          discount: String(val.discount),
          payment: String(val.payment),
          reminburse: String(val.sum_Reminburse),
          amount: String(val.overdue_todate),
          cost: null,
          credit: String(val.credit),
          cashReturn: String(val.cashReturn),
          cashNotReturn: String(val.cashNotReturn),
          discountLevel: null,
          ipdRightparents: null,
          remark: null,
          userCreated: user,
          dateCreated: null,
          userModified: null,
          dateModified: null,
          cancelFlag: null,
        };
      });
      return result;
    }
  };
  const setValuesForIpdTransfer = async (type) => {
    if (type === "total") {
      let dataSource = filter(financeSelectedForTransfer, (val) => {
        return !val.type;
      });
      let result = dataSource.map((val) => {
        return {
          financeId: val.financeId,
          admitRightId: rightSelectedForTransfer && rightSelectedForTransfer,
          userModified: user,
          admitId: basicData?.actionId,
        };
      });
      return result;
    }
    if (type === "overdue") {
      let dataSource = filter(financeSelectedForTransfer, (val) => {
        return !val.type;
      });
      let result = dataSource.map((val) => {
        return {
          refFinancesRightsId: null,
          financeId: val.financeId,
          admitRightId: rightSelectedForTransfer && rightSelectedForTransfer,
          price: null,
          quantity: null,
          discount: String(val.discount),
          payment: String(val.payment),
          reminburse: String(val.sum_Reminburse),
          amount: String(val.overdue_todate),
          admitId: basicData?.actionId,
          cost: null,
          credit: String(val.credit),
          cashReturn: String(val.cashReturn),
          cashNotReturn: String(val.cashNotReturn),
          discountLevel: null,
          ipdRightparents: null,
          remark: null,
          userCreated: user,
          dateCreated: null,
          userModified: null,
          dateModified: null,
          cancelFlag: null,
        };
      });
      return result;
    }
  };
  const onClickTransfer = async () => {
    if (basicData?.patientType === "opd") {
      if (financeSelectedForTransfer.length > 0) {
        setLoading(true);
        if (transferTypeRadio === "total") {
          let values = await setValuesForOpdTransfer("total");
          let res = await UpdListFinancesOpdRights(values);
          if (res.isSuccess === true) {
            fetchRights();
          }
          setProcessResult(res);
          setNotificationsTitle("โอนค่าใช้จ่าย ( จ่ายยอดเต็ม )");
          setShowNotificationsModal(true);
        }
        if (transferTypeRadio === "overdue") {
          let values = await setValuesForOpdTransfer("overdue");
          let res = await InsListRefFinancesOpdRights(values);
          if (res.isSuccess === true) {
            fetchRights();
          }
          setProcessResult(res);
          setNotificationsTitle("โอนค่าใช้จ่าย ( เฉพาะยอดค้างชำระ )");
          setShowNotificationsModal(true);
        }
        resetValues();
        setLoading(false);
      }
    }
    if (basicData?.patientType === "ipd") {
      if (financeSelectedForTransfer.length > 0) {
        setLoading(true);
        if (transferTypeRadio === "total") {
          let values = await setValuesForIpdTransfer("total");
          let res = await UpdListFinancesIpdRights(values);
          if (res.isSuccess === true) {
            fetchRights();
          }
          setProcessResult(res);
          setNotificationsTitle("โอนค่าใช้จ่าย ( จ่ายยอดเต็ม )");
          setShowNotificationsModal(true);
        }
        if (transferTypeRadio === "overdue") {
          let values = await setValuesForIpdTransfer("overdue");
          let res = await InsListRefFinancesIpdRights(values);
          if (res.isSuccess === true) {
            fetchRights();
          }
          setProcessResult(res);
          setNotificationsTitle("โอนค่าใช้จ่าย ( เฉพาะยอดค้างชำระ )");
          setShowNotificationsModal(true);
        }
        resetValues();
        setLoading(false);
      }
    }
  };
  const [showModalAddRight, setShowModalAddRight] = useState(false);
  // แจ้งเตือนการโอน
  const [visibleWarningTranfer, setVisibleWarningTranfer] = useState(false);
  const [warningTranferText, setWarningTranferText] = useState(null);

  return (
    <ConfigProvider locale={thTH}>
      <BreadcrumbMenu />
      <Spin spinning={loading}>
        <Row gutter={[8, 8]} style={{ marginTop: 0 }}>
          <Col span={24} xl={12}>
            {/* ข้อมูลส่วนตัว */}
            <div style={marginBottomDiv}>
              {patientType === "opd" && <OpdPatient personalData={appointsVisit} />}
              {patientType === "ipd" && <Card>
                <IpdPatient
                  patient={selectPatient} address={true}
                  getPatientInfo={(v) => {
                    if (v?.length) {
                      setPatient(v[0])
                    }
                  }}
                />
              </Card>}
            </div>
            {/* Service No. */}
            {patientType === "opd"
              ? (
                <Card
                  style={marginBottomCard}
                  title={
                    <div>
                      <Row gutter={[4, 4]} align="middle">
                        <Col span={3} className="text-nowrap">
                          <label className="gx-text-primary fw-bold">
                            Service No
                          </label>
                        </Col>
                        <Col span={7}>
                          <Select
                            value={serviceIdBySelect}
                            showSearch
                            style={{ width: "110%" }}
                            // allowClear={true}
                            optionFilterProp="children"
                            onChange={(val) => {
                              // console.log(val);
                              setFinancesRightDisplay([])
                              setServiceIdBySelect(val);
                            }}
                            className="data-value"
                            bordered={false}
                          >
                            {serviceRightCash.map((val, index) => (
                              <Option value={val.serviceId} key={index} className="data-value">
                                {val.serviceId}{" "}
                                {/* {val.serviceDate ? val.serviceDate : "  "} */}
                                {val.serviceDate
                                  ? dayjs(val.serviceDate, "MM/DD/YYYY HH:mm:ss")
                                    .add(543, "y")
                                    .format("DD/MM/YYYY")
                                  : "  "}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={14}>
                          <Row gutter={[4, 4]}>
                            <Col span={8} className="text-center">
                              <label className="gx-text-primary fw-bold text-nowrap">
                                จำนวนเงิน
                              </label>
                              <br />
                              <label className="data-value">
                                {/* {cashByServiceId.amount || "0"} */}

                                <Statistic value={cashByServiceId.amount || "0"}
                                  // precision={2}
                                  valueStyle={{
                                    // color: "red",
                                    fontSize: 14
                                  }} />
                              </label>
                            </Col>
                            <Col span={8} className="text-center">
                              <label className="gx-text-primary fw-bold text-nowrap">เบิกได้</label>
                              <br />
                              <label className="data-value">
                                {/* {cashByServiceId.cashReturn || "0"} */}
                                <Statistic value={cashByServiceId.cashReturn || "0"}
                                  // precision={2}
                                  valueStyle={{
                                    // color: "red",
                                    fontSize: 14
                                  }} />
                              </label>
                            </Col>
                            <Col span={8} className="text-center">
                              <label className="topic-danger fw-bold text-nowrap">
                                เบิกไม่ได้
                              </label>
                              <br />
                              <label className="data-value">
                                {/* {cashByServiceId.cashNotReturn || "0"} */}
                                <Statistic value={cashByServiceId.cashNotReturn || "0"}
                                  // precision={2}
                                  valueStyle={{
                                    // color: "red",
                                    fontSize: 14
                                  }} />
                              </label>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  }
                >
                  <Row gutter={[8, 8]} style={{ marginTop: -12, marginBottom: -28 }}>
                    <Col span={12}>
                      <p className="mb-1">
                        <label className="topic-danger fw-bold">
                          ค้างชำระล่าสุดวันที่
                        </label>
                      </p>
                      <p>
                        <label className="data-value">
                          {opdServiceRightCash.maxOrderDate}
                        </label>
                      </p>
                    </Col>
                    <Col span={12}>
                      <div className="text-end">
                        <p className="mb-1">
                          <label className="topic-danger fw-bold">ค้างชำระรวม</label>
                        </p>
                        <p>
                          <Statistic
                            value={opdServiceRightCash.cashReturn}
                            valueStyle={{
                              color: "red",
                              fontSize: 14
                            }}
                          />
                          {/* <label className="data-value">
                            {opdServiceRightCash.cashReturn}
                          </label> */}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ) : null}
          </Col>
          <Col span={24} xl={12}>
            {/* สิทธิการรักษา */}
            <Card
              style={marginBottomCard}
              title={
                <Row gutter={[8, 8]} align="middle" style={{ marginTop: -8, marginBottom: -9 }}>
                  <Col span={16}>
                    <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>สิทธิ์การรักษา</label>
                  </Col>
                  <Col span={8} className="text-end">
                    <Button
                      type={"primary"}
                      // icon={<PlusOutlined />}
                      disabled={!basicData?.actionId ? true : false}
                      onClick={() => {
                        if (
                          pathname === "/privilege center/privilege-center-opd-expense-right-transfer" ||
                          pathname === "/outpatient finance/outpatient-transfer-finance-ipd-right"
                        ) {
                          setOpenInsertOpdRight(true);
                        } else {
                          setShowModalAddRight(true);
                        }
                      }}
                      style={{ margin: 0 }}
                    >เพิ่มสิทธิ์</Button>
                  </Col>
                </Row>
              }
            >
              <div style={{ margin: -14 }}>
                {TableRight}
              </div>
              {/* {console.log("data======>", appointsVisit)} */}
              <AddRight
                page={page}
                patientTypeProp={patientType}
                setModal={(isVisible, reloadTable) => {
                  setShowModalAddRight(isVisible);
                  if (reloadTable === true) {
                    fetchRights();
                  }
                }}
                isModelVisible={showModalAddRight}
                personalData={appointsVisit}
                serviceRight={serviceRight}
              />
              <UpdPatientRight
                show={showUpdPatientRightModal}
                setModal={(isVisible, reloadTable) => {
                  setShowUpdPatientRightModal(isVisible);
                  setEditId(null);
                  if (reloadTable === true) {
                    fetchRights();
                  }
                }}
                editId={editId}
                prevRight={prevRight}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            {/* รายละเอียดค่ารักษาพยาบาล */}
            <Card
              style={marginBottomCard}
              title={
                <Row gutter={[8, 8]} align="middle" style={{ marginTop: -8, marginBottom: -9 }}>
                  <Col>
                    <label className="gx-text-primary fw-bold me-4" style={{ fontSize: 18 }}>
                      รายละเอียดค่ารักษาพยาบาล
                    </label>
                  </Col>
                  <Col>
                    <Select
                      value={financeType}
                      showSearch
                      style={{ width: 140 }}
                      allowClear={true}
                      optionFilterProp="children"
                      placeholder="ประเภทค่าใช้จ่าย"
                      onChange={(val) => {
                        setFinanceType(val);
                      }}
                      className="data-value me-2"
                    >
                      {financeTypeList.map((val, i) => (
                        <Option key={i} value={val.datavalue} className="data-value">
                          {val.datadisplay}
                        </Option>
                      ))}
                    </Select>
                    <InputNumber
                      style={{ width: 140 }}
                      min={0}
                      placeholder="จำนวนเงิน"
                      value={cashForTransferFake}
                      onChange={(v) => {
                        if (!v) {
                          setCashForTransferFake(null);
                          setCashForTransfer(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setCashForTransfer(e.target.value);
                          setCashForTransferFake(e.target.value);
                        }
                      }}
                    />
                    <Select
                      value={lookupViewRightRadio}
                      showSearch
                      style={{ width: 175 }}
                      allowClear={true}
                      optionFilterProp="children"
                      placeholder="เลือกมุมมอง"
                      onChange={(val) => setLookupViewRightRadio(val)}
                      className="data-value"
                    >
                      {lookupViewRight.map((val, index) => (
                        <Option value={val.datavalue} key={index} className="data-value">
                          {val.datadisplay}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <DayjsDatePicker
                      style={{ width: 120 }}
                      format={["DD/MM/YYYY", "DD/MM/YY"]}
                      placeholder="เริ่ม"
                      value={startDateFinance}
                      onChange={(val) => {
                        setStartDateFinance(val);
                      }}
                    />
                  </Col>
                  <Col>
                    <label className="gx-text-primary fw-bold">ถึง</label>
                  </Col>
                  <Col>
                    <DayjsDatePicker
                      style={{ width: 120 }}
                      format={["DD/MM/YYYY", "DD/MM/YY"]}
                      placeholder="สิ้นสุด"
                      value={endDateFinance}
                      onChange={(val) => {
                        setEndDateFinance(val);
                      }}
                    />
                  </Col>
                </Row>
              }
            >
              <div style={{ margin: -14 }}>
                {TableMedicalFee()}
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[8, 8]} style={{ marginTop: 0 }}>
          <Col span={24} xl={12}>
            {/* จำนวนเงินที่เลือก */}
            <Card
              size="small"
              style={marginBottomCard}
              title={
                <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>จำนวนเงินที่เลือก</label>
              }
            >
              <div style={{ margin: -8 }}>
                <Row gutter={[4, 4]}>
                  <Col span={4} className="text-end">
                    <label className="gx-text-primary text-nowrap">จำนวนรวม</label>
                    <Statistic value={financeSelected.amount} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">เครดิต</label>
                    <Statistic value={financeSelected.credit} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">เบิกได้</label>
                    <Statistic value={financeSelected.cashReturn} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">เบิกไม่ได้</label>
                    <Statistic value={financeSelected.cashNotReturn} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">ส่วนลด</label>
                    <Statistic value={financeSelected.discount} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">ชำระ</label>
                    <Statistic value={financeSelected.payment} valueStyle={{ fontSize: 14 }} />
                  </Col>
                  <Col span={3} className="text-end">
                    <label className="gx-text-primary text-nowrap">ค้างชำระ</label>
                    <Statistic value={financeSelected.overdue_todate} valueStyle={{ fontSize: 14 }} />
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={24} xl={12}>
            {/* สิทธิการรักษาที่จะรับโอนค่าใช้จ่าย */}
            <Card
              size="small"
              style={marginBottomCard}
              title={
                <div className="row row-cols-2 align-items-center" style={{ marginTop: -4, marginBottom: -4 }}>
                  <div className="col" style={{ width: "60%" }}>
                    <label className="gx-text-primary fw-bold" style={{ fontSize: 18 }}>
                      สิทธิ์การรักษาที่จะรับโอนค่าใช้จ่าย
                    </label>
                  </div>
                  <div className="col" style={{ width: "40%" }}>
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      // allowClear={true}
                      optionFilterProp="children"
                      value={rightSelectedForTransfer}
                      onSelect={(val) => setRightSelectedForTransfer(val)}
                      placeholder="สิทธิ์ที่จะรับโอนค่าใช้จ่าย"
                      className="data-value"
                    >
                      {serviceRight.map((val, index) => (
                        <Option
                          value={val.actionRightId}
                          key={index}
                          className="data-value"
                          disabled={val.actionRightId === actionRightId}
                        >
                          {val.rightName}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
              }
            >
              <label className="gx-text-primary">
                จำนวนเงินของสิทธิ์ที่จะรับโอนค่าใช้จ่าย
              </label>
              <Divider />
              <Row gutter={[4, 4]}>
                <Col span={4} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">จำนวนรวม</label>
                  <label className="data-value"> {rightForTransferSelected?.amount || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">เครดิต</label>
                  <label className="data-value"> {rightForTransferSelected?.credit || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">เบิกได้</label>
                  <label className="data-value"> {rightForTransferSelected?.cashReturn || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">เบิกไม่ได้</label>
                  <label className="data-value"> {rightForTransferSelected?.cashNotReturn || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">ส่วนลด</label>
                  <label className="data-value"> {rightForTransferSelected?.discount || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">ชำระ</label>
                  <label className="data-value"> {rightForTransferSelected?.payment || ""}</label>
                </Col>
                <Col span={3} className="text-end">
                  <label className="gx-text-primary d-block text-nowrap">ค้างชำระ</label>
                  <label className="data-value"> {rightForTransferSelected?.overdue || ""}</label>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[4, 4]} align="middle">
                <Col>
                  <Radio.Group
                    name="transferFinancesOpdRights"
                    value={transferTypeRadio}
                    onChange={(e) => onChangeTransferTypeRadio(e.target.value)}
                  >
                    <Radio value="total">
                      <label className="gx-text-primary">จ่ายยอดเต็ม</label>
                    </Radio>
                    <Radio value="overdue">
                      <label className="gx-text-primary">เฉพาะยอดค้างชำระ</label>
                    </Radio>
                  </Radio.Group></Col>
                <Col>
                  <Button
                    className="mb-0"
                    type="primary"
                    onClick={() => {
                      if (selectedRowKeys.length === 0) {
                        setVisibleWarningTranfer(true);
                        setWarningTranferText(
                          "กรุณาเลือกรายการค่ารักษาพยาบาล !"
                        );
                      } else if (!rightSelectedForTransfer) {
                        setVisibleWarningTranfer(true);
                        setWarningTranferText(
                          "กรุณาเลือกรายสิทธิ์ที่จะรับโอนค่าใช้จ่าย !"
                        );
                      } else if (!transferTypeRadio) {
                        setVisibleWarningTranfer(true);
                        setWarningTranferText(
                          "กรุณาเลือกประเภทการโอนค่าใช้จ่าย !"
                        );
                      } else {
                        onClickTransfer();
                      }
                    }}
                  >
                    โอนค่าใช้จ่าย
                  </Button>
                </Col>
              </Row>
            </Card>
            {/* แจ้งเตือนการโอน */}
            <Modal
              width={400}
              centered
              title={
                <label className="topic-danger-bold">แจ้งเตือนการโอน</label>
              }
              visible={visibleWarningTranfer}
              onCancel={() => {
                setWarningTranferText(null);
                setVisibleWarningTranfer(false);
              }}
              footer={
                <div className="text-center">
                  <Button
                    onClick={() => {
                      setWarningTranferText(null);
                      setVisibleWarningTranfer(false);
                    }}
                  >
                    ปิด
                  </Button>
                </div>
              }
            >
              <div className="text-center">
                <label className="topic-danger" style={{ fontSize: 18 }}>
                  {warningTranferText}
                </label>
              </div>
            </Modal>
          </Col>
        </Row>
      </Spin>
      <Notifications
        setModal={(isVisible) => {
          setShowNotificationsModal(isVisible);
          setProcessResult({});
          setNotificationsTitle(null);
        }}
        isVisible={showNotificationsModal}
        response={processResult}
        title={notificationsTitle}
        type="result"
      />
      <InsertOpdRight
        patientId={opdPatientDetail?.patientId}
        serviceId={serviceIdBySelect}
        open={openInsertOpdRight}
        close={() => {
          setOpenInsertOpdRight(false)
        }}
        success={(bool) => {
          if (bool) {
            setOpenInsertOpdRight(false)
            fetchRights()
          }
        }}
      />
      <UpdateOpdRight
        patientId={opdPatientDetail?.patientId}
        opdRightId={editId}
        open={openUpdateOpdRight}
        close={() => {
          setOpenUpdateOpdRight(false)
          // setEditId(null)
        }}
        success={(bool) => {
          if (bool) {
            setOpenUpdateOpdRight(false)
            // setEditId(null)
            fetchRights()
          }
        }}
      />
    </ConfigProvider>
  );
}
