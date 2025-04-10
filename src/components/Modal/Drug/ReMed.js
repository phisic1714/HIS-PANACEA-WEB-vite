import { env } from '../../../env.js';
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Modal, Radio, Select, DatePicker, InputNumber, Spin, message } from 'antd';
import Column from 'antd/lib/table/Column';
import { DeleteOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import printIcon from '@iconify/icons-cil/print';
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import { map, find, filter, uniqBy, intersectionBy } from "lodash";
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";
import { useExpenseListContext } from "routes/OpdClinic/Views/OpdDrugCharge";
import DrugAlertReMed from "components/Modal/Drug/DrugAlertReMed.js"
import DueRequest from 'components/Modal/Drug/DueRequest';
import { callApis } from 'components/helper/function/CallApi.js';
import dateForDisplay from "components/helper/function/dateForDisplay.js"
import ChkDrugConditionsV2 from "components/helper/function/drugs/ChkDrugConditionsV2.js"
import { nanoid } from 'nanoid';
const TableStyle = styled(Table)`
    .ant-table-thead .ant-table-cell{
        background-color: #e2ebfc !important;
        color: black !important
    }
`;
const size = "small"
const hosParam = JSON.parse(localStorage.getItem("hos_param"));
const notDefaultDocRemed = hosParam?.notDefaultDocRemed || null
// console.log('notDefaultDocRemed :>> ', notDefaultDocRemed);
const labelZoom90 = (label) => <label style={{ zoom: "85%" }}>{label}</label>
export default function ReMed({
  patient,
  reMedVisible,
  setReMedVisible,
  // drugAlertRef,
  defalutDoctorId,
  // dispatchDiList,
  drugAllergyDetails,
  // optionsExpense,
  optionsDoctor = [],
  // diList = [],
  drugprofile = null,
  ...props
},/* ref*/) {
  // console.log('patient :>> ', patient);
  // console.log('drugAllergyDetails :>> ', drugAllergyDetails);
  const { expenseList } = useExpenseListContext();
  const { opdPatientDetail
  } = useSelector(({ opdPatientDetail }) => opdPatientDetail);
  const { selectPatient } = useSelector(({ patient }) => patient);
  // const [reMedVisible, setReMedVisible] = useState(false);
  const [selectRowKey, setSelectRowKey] = useState([]);
  // console.log(selectRowKey);
  const [workList, setWorkList] = useState([]);
  const [workId, setWorkId] = useState(undefined);
  const [doctorList, setDoctorList] = useState([]);
  const [doctorId, setDoctorId] = useState(notDefaultDocRemed ? null : defalutDoctorId);
  const [orderDate, setOrderDate] = useState(null);
  const [numDays, setNumDays] = useState(null);
  const history = useHistory();
  const [vsbDueRequest, setVsbDueRequest] = useState(false);
  //Table
  const [orderDateDoctor, setOrderDateDoctor] = useState([
    /* {key:"1",orderDateDesc:"27/4/2564",orderTimeDesc:"1:45",workName:"Test"} */
  ]);
  const [selectOrder, setSelectOrder] = useState(null);
  const [orderFinancesDrug, setOrderFinancesDrug] = useState([]);
  const [selectDrug, setSelectDrug] = useState([]);
  const tabelScroll = {
    y: 400,
    x: false
  };
  const [orderType, setOrderType] = useState([]);
  const [selectOrderType, setSelectOrderType] = useState("");
  const [loading, setLoading] = useState(false);
  const [vsbDrugAlertReMed, setVsbDrugAlertReMed] = useState(false)
  const [tempOrderFinances, setTempOrderFinances] = useState([])
  const [drugReconcilesHis, setDrugReconcilesHis] = useState([])
  const [selectedMeReconcile, setSelectedMeReconcile] = useState(null)
  const [medReconciles, setMedReconciles] = useState([])

  //Func. Call Api
  const getDrugWorksMas = async () => {
    //ประเภท
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDrugWorksMas`).then(res => {
      let resData = res.data.responseData;
      setOrderType(resData);
    }).catch(error => {
      return error;
    });
  };
  const getWorkPlacesMas = async () => {
    //ห้องตรวจ
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMas`).then(res => {
      let resData = res.data.responseData;
      setWorkList(resData.filter(val => val.datadisplay != null));
    }).catch(error => {
      return error;
    });
  };
  const getDoctorMas = async () => {
    //ค้นหาแพทย์
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDoctorMas`).then(res => {
      setDoctorList(res.data.responseData);
    }).catch(error => {
      return error;
    });
  };
  const getOrderDateDoctor = async (patientId, workId, doctorId, orderDate, selectOrderType) => {
    //console.log(orderDate);
    setLoading(true);
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdReMedOrderDateFinancesDrug`, {
      requestData: {
        patientId: patientId,
        work: workId ? workId : null,
        doctor: doctorId ? doctorId : null,
        orderMonth: orderDate ? orderDate.format("MM") : null,
        drugWork: selectOrderType
      }
    }).then(res => {
      let resData = res.data.responseData;
      if (resData?.length > 0) {
        resData = resData.map((val, index) => {
          return {
            ...val,
            key: index
          };
        });
      }
      setOrderDateDoctor(resData);
    }).catch(error => {
      return error;
    });
    setLoading(false);
  };
  const getOrderFinancesDrug = async selectOrder => {
    setLoading(true);
    // console.log("selectOrder", selectOrder);
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdReMedNameFinancesDrug`, {
      requestData: {
        patientId: patient.patientId,
        work: selectOrder.workId || null,
        orderId: selectOrder.orderId,
        doctor: selectOrder.doctor || null,
        orderDate: selectOrder.orderDate ? dayjs(selectOrder.orderDate, "MM/DD/YYYY HH:mm:ss").format("YYYY-MM-DD") : null,
        orderMonth: null //ต้องใส่เพราะถ้าไม่ใส่ได้ []
      }
    }).then(res => {
      let resData = res.data.responseData;
      resData = unidFinaceId(resData);
      // console.log(resData);
      setOrderFinancesDrug(resData);
      if (selectDrug.length > 0) {
        resData = intersectionBy([...resData, ...medReconciles], selectDrug, "financeId")?.map(val => {
          return val.financeId;
        });
        setSelectRowKey(resData);
      }
    }).catch(error => {
      return error;
    });
    setLoading(false);
  };
  const getDrugReconcilesHistoryMedByDoc = async (patientId) => {
    if (!patientId) return
    const res = await callApis(apis["GetDrugReconcilesHistoryMedByDoc"], patientId)
    setDrugReconcilesHis(res)
  }
  // Functions Helper
  const objGroupDrug = data => {
    data.newDrugGroup = {
      drugGroup: data.drugGroup,
      drugGroupName: data.drugGroupName
    };
    data.newGenericGroup = {
      drugGroup: data.drugGroup,
      drugGroupName: data.drugGroupName
    };
    return data;
  };
  const unidFinaceId = data => {
    let resUniq = uniqBy(data, "financeId");
    let resDiff = data.filter(val => !resUniq.includes(val));
    for (let i = 0; i < resUniq.length; i++) {
      let newobjGroup = objGroupDrug(resUniq[i]);
      resUniq[i].opdFormulaExpensesDrugGroup = [newobjGroup.newDrugGroup];
      resUniq[i].opdFormulaExpensesGeneric = [newobjGroup.newGenericGroup];
      for (let diff of resDiff) {
        if (resUniq[i].financeId === diff.financeId) {
          let newobjGroup = objGroupDrug(diff);
          resUniq[i].opdFormulaExpensesDrugGroup = [...resUniq[i].opdFormulaExpensesDrugGroup, newobjGroup.newDrugGroup];
          resUniq[i].opdFormulaExpensesGeneric = [...resUniq[i].opdFormulaExpensesGeneric, newobjGroup.newGenericGroup];
        }
      }
    }
    return resUniq;
  };
  const chkSelect = (select, selectedRows) => {
    if (select) {
      let newselectedRows = selectedRows.map(val => {
        return val.financeId;
      });
      setSelectRowKey(prevData => [...prevData, ...newselectedRows]);
      setSelectDrug(prevData => [...prevData, ...selectedRows]);
    } else {
      let newselectedRows = selectedRows.map(val => {
        return val.financeId;
      });
      let newselectedRowkey = selectRowKey.filter(val => !newselectedRows.includes(val));
      setSelectRowKey(newselectedRowkey);
      let newSelectDrug = selectDrug.filter(val => !newselectedRows.includes(val.financeId));
      setSelectDrug(newSelectDrug);
    }
  };
  const handleSelectedMeReconcile = async (docNo) => {
    let res = await callApis(apis["GetDrugReconcilesListByDoc"], docNo)
    res = map(res, o => {
      return {
        ...o,
        drugLabelName: o?.doclabel1,
        financeId: nanoid(),
        docLabel1: o?.doclabel1,
        docLabel2: o?.doclabel2,
        docLabel3: o?.doclabel3,
        docLabel4: o?.doclabel4,
      }
    })
    setMedReconciles(res)
  }
  //Func.
  const rowSelection = {
    selectedRowKeys: selectRowKey,
    onSelect: (record, selected,) => {
      // console.log(record, selected, selectedRows, nativeEvent);
      chkSelect(selected, [record]);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // console.log(selected, selectedRows, changeRows);
      chkSelect(selected, changeRows);
    },
    getCheckboxProps: record => {
      return {
        disabled: record.cancelFlag === "Y" // Column configuration not to be checked     
      };
    }
  };
  const closeModal = () => {
    setReMedVisible(false);
    setSelectRowKey([]);
    setWorkId(undefined);
    setDoctorId(undefined);
    setOrderDate(null);
    setOrderDateDoctor([]);
    setSelectOrder(null);
    setOrderFinancesDrug([]);
    setSelectDrug([]);
    setSelectOrderType("");
    setNumDays(null);
  };
  const handleOkV2 = async () => {
    setLoading(true);
    const mappingSelectDrug = await map(selectDrug, o => {
      return {
        ...o,
        financeId: null,
      }
    })
    let finance = await ChkDrugConditionsV2({
      patientId: patient?.patientId,
      newExpenses: mappingSelectDrug,
      oldExpenses: [],
      doctorId: defalutDoctorId,
      workId: null,
      drugAllergyDetails: drugAllergyDetails,
      drugprofile: drugprofile,
    })
    finance = map(finance, o => {
      const expense = find(expenseList, ["expenseId", o.expenseId])
      if (o.route === "D") {
        o.docLabel1 = o.doclabel1 || null
        o.drugLabel = null
        o.drugLabelName = null
        o.drugLabelNameByFunc = null
      } else {
        o.drugLabel = o.drugLabel || null
      }
      return {
        ...o,
        billgroup: expense?.billgroup || null,
        actgroup: expense?.actgroup || null,
      }
    })
    // console.log('finance', finance)
    setLoading(false);
    const newselectDrug = finance
    // console.log('newselectDrug', newselectDrug)
    if (props?.page === "15.3") {
      const findDue = find(newselectDrug, ["dueReport", "Y"])
      if (findDue) {
        setVsbDueRequest(true)
        setTempOrderFinances(newselectDrug)
        return
      }
      props?.inSertDrugProfile(newselectDrug);
      closeModal()
    } else {
      setTempOrderFinances(newselectDrug)
      setVsbDrugAlertReMed(true)
    }
  }
  useEffect(() => {
    getDrugWorksMas();
    getWorkPlacesMas();
    getDoctorMas();
    return () => {
      setOrderType([]);
      setWorkList([]);
      setDoctorList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    getDrugReconcilesHistoryMedByDoc(patient?.patientId)
  }, [patient])

  useEffect(() => {
    setSelectRowKey([]);
    setSelectOrder(null);
    setOrderFinancesDrug([]);
    // setPageOrderFinance(1);
    setSelectDrug([]);
    if (props.patientType === "opd") {
      getOrderDateDoctor(opdPatientDetail?.patientId, workId, doctorId, orderDate, selectOrderType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, opdPatientDetail, orderDate, props.patientType, workId, selectOrderType]);
  useEffect(() => {
    setSelectRowKey([]);
    setSelectOrder(null);
    setOrderFinancesDrug([]);
    // setPageOrderFinance(1);
    setSelectDrug([]);
    if (props.patientType === "ipd" /*  && doctorId */) {
      getOrderDateDoctor(selectPatient?.patientId, workId, doctorId, orderDate, selectOrderType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, selectPatient, orderDate, workId, props.patientType, selectOrderType]);
  useEffect(() => {
    setSelectRowKey([]);
    setOrderFinancesDrug([]);
    // setPageOrderFinance(1);
    // setSelectDrug([]);
    // setPageOrderDate(1);
    if (selectOrder) {
      getOrderFinancesDrug(selectOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectOrder]);

  const PartsDrugAlertReMedModal = () => {
    return vsbDrugAlertReMed && <DrugAlertReMed
      visible={vsbDrugAlertReMed}
      setVisible={setVsbDrugAlertReMed}
      expenses={tempOrderFinances}
      drugAllergies={drugAllergyDetails}
      optionsDoctor={optionsDoctor}
      doctorId={defalutDoctorId}
      // diList={diList}
      onFinished={(newData) => {
        // console.log('newData :>> ', newData);
        props?.setOrderFinances(newData);
        closeModal()
      }}
    />
  }
  const PartsDueRequestModal = () => {
    return vsbDueRequest && <DueRequest
      // dueReport={dueReport}
      expenses={filter(tempOrderFinances, o => o.dueReport === "Y")}
      optionsUser={optionsDoctor}
      visible={vsbDueRequest}
      onClose={() => {
        setVsbDueRequest(false);
        // setDueReport(null)
      }}
      // reloadOrder={() => setReloadOrder(p => p + 1)}
      onSave={(dts) => {
        // const expenses = form.getFieldValue("expenses")
        const newOrderFinances = tempOrderFinances.map(o => {
          const dueReport = dts[o.expenseId]
          return {
            ...o,
            dueReport: dueReport
              ? {
                ...dueReport[0],
                userCreated: doctorId,
                dateCreated: dayjs(),
                dueRemark: dueReport[0].dueType === "E"
                  ? dueReport[0]?.empiricalRemark
                  : dueReport[0].dueType === "S"
                    ? dueReport[0]?.specificRemark
                    : null,
              }
              : null
          }
        });
        props?.inSertDrugProfile(newOrderFinances);
        setVsbDueRequest(false);
        closeModal()
      }}
    />
  }
  const PartTableMeReconcile = () => {
    const columns = [
      {
        title: 'เลขที่',
        dataIndex: 'documentno',
        width: 100,
      },
      {
        title: 'ชื่อเอกสาร',
        dataIndex: 'documentName',
      },
      {
        title: 'วันที่สร้าง',
        dataIndex: 'dateCreated',
        width: 85,
        align: "center",
        render: v => labelZoom90(dateForDisplay({ date: v, displayFormat: "DD/MM/BBBB" }))
      }
    ]
    const rowSelection = {
      selectedRowKeys: selectedMeReconcile,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        setSelectedMeReconcile(selectedRowKeys)
        handleSelectedMeReconcile(selectedRowKeys)
      },
    };
    return <Table
      size={size}
      title={() => {
        return <Row gutter={[4, 4]} >
          <Col style={{ marginTop: 5 }}>
            <label className='gx-text-primary fw-bold'>Med Reconcile</label>
          </Col>
          {props?.page === "15.3" ?
            <Col>
              <Button
                size='small'
                className='mb-0'
                // 15.3.6
                onClick={() => {
                  history.push({ pathname: "/ipd presciption/ipd-prescription-med-reconcile" })
                }}
                type="primary" >
                เพิ่ม Med Reconcile
              </Button>
            </Col>
            : <Col>
              <Button
                // 14.2
                size='small'
                className='mb-0'
                onClick={() => {
                  history.push({ pathname: "/opd prescription/opd-prescription-med-review" })
                }}
                type="primary" >
                เพิ่ม Med Reconcile
              </Button>
            </Col>
          }
        </Row>
      }}
      rowSelection={{
        type: "radio",
        ...rowSelection,
      }}
      scroll={tabelScroll}
      columns={columns}
      dataSource={drugReconcilesHis}
      rowClassName={"data-value"}
      rowKey={"documentno"}
    />
  }
  return <>
    <Modal
      centered
      title={<Row align="middle" style={{
        position: "relative",
        margin: 0
      }}>
        <strong><label>14.2.5 Re-Med</label></strong>
        <Button type="default" style={{
          position: "absolute",
          right: 0,
          margin: 0,
          paddingLeft: 10,
          paddingRight: 10,
          fontSize: "24px"
        }} className="btn-custom-bgcolor" icon={<Icon icon={printIcon} fontSize="18px" />}
        // onClick={() => setReferModalVisible(true)}
        />
      </Row>}
      // centered
      visible={reMedVisible} onCancel={() => closeModal()} closable={false} width="1500px"
      footer={[
        <Row justify="center" key="footer">
          <Button key="cancel" onClick={() => {
            closeModal();
          }}>ออก</Button>
          <Button
            key="ok"
            type="primary"
            disabled={selectDrug?.length < 1}
            onClick={() => {
              handleOkV2()
              // if (prescribeMedicineTemplates === "Y") return handleOk()
              // return handleOkBank()
            }}
          >
            ตกลง
          </Button>
        </Row>
      ]}>
      <Spin spinning={loading}>
        <Row gutter={[8, 8]}>
          <Col span={3}>
            <Select placeholder="ประเภท" allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={value => {
              setSelectOrderType(value);
            }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={orderType.map(n => ({
              value: n.datavalue,
              label: n.datadisplay
            }))} value={selectOrderType} />
          </Col>
          <Col span={7}>
            <Select placeholder="ห้องตรวจ" allowClear={true} style={{
              width: '100%'
            }} showSearch onChange={value => {
              setWorkId(value);
            }} optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={workList.map(n => ({
              value: n.datavalue,
              label: n.datadisplay
            }))} value={workId}>
            </Select>
          </Col>
          <Col span={7}>
            <Select placeholder="ค้นหาแพทย์" allowClear={true} style={{
              width: '100%'
            }} showSearch
              onChange={value => {
                setDoctorId(value);
              }}
              optionFilterProp="children"
              filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={doctorList.map(n => ({
                value: n.datavalue,
                label: n.datadisplay
              }))} value={doctorId}>
            </Select>
          </Col>
          <Col span={4}>
            <DatePicker picker="month" style={{
              width: "100%"
            }} /* disabled={message===null||dropdownLoad} */ format={['MMMM']} onChange={value => {
              setOrderDate(value);
            }} />
          </Col>
          <Col span={3}>
            <InputNumber placeholder='จน.วันที่สั่ง' style={{
              width: "100%"
            }} /* controls={false} */ onChange={setNumDays} value={numDays} />
          </Col>
        </Row>
        <Row gutter={[8, 8]} className='mt-1'>
          <Col span={6}>
            {PartTableMeReconcile()}
          </Col>
          <Col span={6}>
            <Table
              size={size}
              rowClassName="data-value"
              scroll={tabelScroll}
              dataSource={orderDateDoctor}
              pagination={false}
            >
              <Column width="60px" title={<label className="gx-text-primary"><b>เลือก</b></label>} render={record => {
                return <Radio.Group onChange={e => setSelectOrder(e.target.value)} value={selectOrder}>
                  <Radio value={record} />
                </Radio.Group>;
              }} />
              <Column title={<label className="gx-text-primary"><b>วัน/เวลา</b></label>} render={record => {
                return <label className="gx-text-primary">{record.orderDateDesc} {record.orderTimeDesc} น.</label>;
              }} />
              <Column title={<label className="gx-text-primary"><b>แพทย์</b></label>} render={record => {
                return <>
                  <div>{record.doctorName}</div>
                  <div style={{
                    paddingLeft: 5,
                    color: "#c2d5bb"
                  }}>{record.workName}</div>
                </>;
              }} />
            </Table>
          </Col>
          <Col span={6}>
            <Table
              size={size}
              rowClassName="data-value"
              scroll={tabelScroll}
              dataSource={[...orderFinancesDrug, ...medReconciles]}
              pagination={false}
              rowKey="financeId"
              rowSelection={rowSelection}>
              <Column title={<label className="gx-text-primary"><b>ชื่อยา</b></label>} render={record => {
                return <>
                  {record.cancelFlag === "Y" ? <div>{`${record.expenseName}`} <b style={{
                    color: 'red'
                  }}>(ยกเลิก)</b></div> : <div>{record.expenseName}</div>}
                  <div style={{
                    paddingLeft: 5,
                    color: "#c2d5bb"
                  }}>{record.drugLabelName}</div>
                </>;
              }} />
              <Column align="center" title={<label className="gx-text-primary"><b>จำนวน</b></label>} width="75px" render={record => {
                return <>{parseInt(record.quantity)}</>;
              }} />
            </Table>
          </Col>
          <Col span={6}>
            <TableStyle
              rowClassName="data-value"
              scroll={tabelScroll}
              dataSource={selectDrug}
              pagination={false}
              rowKey="financeId"
              size={size}
            >
              <Column title="รายการยาที่เลือก" render={record => {
                return <>
                  <Row>
                    <Col span={18}>{record.expenseName}</Col>
                    <Col span={6} style={{
                      padding: 0
                    }}>{parseInt(record.quantity)} {record.unitText}</Col>
                  </Row>
                  <div style={{
                    paddingLeft: 5,
                    color: "#c2d5bb"
                  }}>{record.drugLabelName}</div>
                </>;
              }} />
              <Column width="60px" render={(record,) => {
                return <>
                  <button className="btn-table deleterow" style={{
                    marginRight: 0
                  }} onClick={() => {
                    console.log(record);
                    setSelectRowKey(selectRowKey.filter(val => val !== record.financeId));
                    setSelectDrug(selectDrug.filter(val => val.financeId !== record.financeId));
                  }}>
                    <DeleteOutlined />
                  </button>
                </>;
              }} />
            </TableStyle>
          </Col>
        </Row>
      </Spin>
      {PartsDrugAlertReMedModal()}
      {PartsDueRequestModal()}
    </Modal>
  </>
}

export const apis = {
  chkDrugAndDoctor: {
    url: "PatientsFinancesDrug/GetOpdDrugDoctorsfinancesDrug/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  chkDrugAndDocSpecialties: {
    url: "PatientsFinancesDrug/GetOpdDrugDocSpecialtiesfinancesDrug/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  chkDrugComponentsAllergy: {
    url: "PatientsFinancesDrug/GetOpdChkPatientExpAllerygiesfinancesDrug/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  FindGenericByExpenseId: {
    url: "Masters/FindGenericByExpenseId/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  ChkDrugLab: {
    url: "PatientsFinancesDrug/GetOpdChkDrugLabCriticalsfinancesDrug/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  ChkDrugInteractions: {
    url: "PatientsFinancesDrug/GetOpdDrugInteractionsfinancesDrug/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  GetDrugReconcilesHistoryMedByDoc: {
    url: "DrugReconciles/GetDrugReconcilesHistoryMedByDoc/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  GetDrugReconcilesListByDoc: {
    url: "DrugReconciles/GetDrugReconcilesListByDoc/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
}