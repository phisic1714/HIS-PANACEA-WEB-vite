import { env } from '../../../env.js';
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Table, Modal, Select, Spin, Form } from 'antd';
// import Column from 'antd/lib/table/Column';
import { Icon } from '@iconify/react';
import printIcon from '@iconify/icons-cil/print';
// import { useSelector } from "react-redux";
import axios from "axios";
import { map, find, filter, toNumber, uniqBy, intersectionBy, differenceBy, debounce , cloneDeep} from "lodash";
// import styled from "styled-components";
import { useExpenseListContext } from "../../../routes/OpdClinic/Views/OpdDrugCharge";
import { GetDropDownMas } from "../../../api/Masters";
import dayjs from 'dayjs';
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker.js';
import { buttonSm, rowProps, selectSm } from 'props';
import { LabelText, GenFormItemLabel } from 'components/helper/function/GenLabel';
import { callApis } from 'components/helper/function/CallApi.js';
import { mappingOptions } from "components/helper/function/MappingOptions";
import { nanoid } from 'nanoid';
import ChkDrugInteractions from 'components/helper/function/ChkDrugInteractions';
// import ChkDrugConditions from 'components/helper/function/ChkDrugConditions.js';
import ChkDrugConditionsV2 from 'components/helper/function/drugs/ChkDrugConditionsV2.js';
// import { notiWarning } from 'components/Notification/notificationX.js';
import DueRequest from 'components/Modal/Drug/DueRequest';
const size = "small"
const labelZoom85 = (label) => <label style={{ zoom: "85%" }}>{label}</label>
export default function MedReView({
  medReviewVisible,
  setMedReviewVisible,
  // drugAlertRef,
  defalutDoctorId,
  defalutDoctorList,
  // dispatchDiList,
  patient,
  medOrder = [],
  drugAllergyDetails,
  handleDeleteFinances = () => { },
  drugprofile = null,
  ...props
}) {
  const { expenseList } = useExpenseListContext();
  const [workList, setWorkList] = useState([]);
  const [doctorList, setDoctorList] = useState(defalutDoctorList);
  const [periodList, setPeriodList] = useState([]);
  const [form] = Form.useForm();
  const [vsbDueRequest, setVsbDueRequest] = useState(false);
  const [tempOrderFinances, setTempOrderFinances] = useState([])
  //NewDrugFinance
  const [loading, setLoading] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [selectedOrderKeys, setSelectedOrderKeys] = useState([]);
  const [orderKeysForGetFinaces, setOrderKeysForGetFinaces] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [selectedFinanceKeys, setSelectedFinanceKeys] = useState([]);
  const [optionsOrder, setOptionsOrder] = useState([])
  const [optionsFinance, setOptionsFinance] = useState([])
  const [optionsDrug, setOptionsDrug] = useState([])
  const [keyTableOldFinances, setKeyTableOldFinances] = useState('KeyTableOldFinances')
  const [orderId, setOrderId] = useState(null)
  //Func
  const getWorkPlacesMas = async () => {
    //ห้องตรวจ
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetWorkPlacesMas`).then(res => {
      let resData = res?.data?.responseData?.filter(val => val.datadisplay != null)
      resData = mappingOptions({ dts: resData || [] })
      setWorkList(resData);
    }).catch(error => {
      return error;
    });
  };
  const getDoctorMas = async () => {
    //ค้นหาแพทย์
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetDoctorMas`).then(res => {
      const mapping = mappingOptions({ dts: res?.data?.responseData || [] })
      setDoctorList(mapping);
    }).catch(error => {
      return error;
    });
  };
  const getPeriodList = async () => {
    let res = await GetDropDownMas({
      "table": "TB_FINANCES",
      "field": "PastDateFilter"
    });
    if (res?.isSuccess) {
      const mapping = mappingOptions({ dts: res?.responseData || [] })
      setPeriodList(mapping);
    }
  }
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
  const getDrugOrders = async (dts) => {
    const req = {
      "patientId": patient?.patientId,
      "work": dts?.work || null,
      "orderId": null,
      "doctor": dts?.doctor || null,
      "orderDate": dts?.orderDate ? dayjs(dts.orderDate).format("YYYY-MM-DD") : null,
      "orderMonth": null,
      "drugWork": null,
      "isLatestServiceId": null,
      "period": dts?.period === "a" ? null : dts?.period || null,
      "clinicDate": null
    }
    setLoading(p => !p)
    const res = await callApis(apis["GetDrugOrders"], req)
    setLoading(p => !p)
    // console.log('getDrugOrders', res)
    setOptionsOrder(filter(res, 'orderId'))
  }
  const debounceGetDrugFinances = useMemo(() => {
    const onSearch = async (orderKeys, orderKeysForGetFinaces, optionsFinance) => {
      setLoadingFinance(p => !p)
      const finances = await Promise.all(map(orderKeys, o => {
        if (find(orderKeysForGetFinaces, f => f === o)) return []
        const res = callApis(apis["GetDrugFinances"], { orderId: o, patientId: patient?.patientId })
        return res
      }))
      setLoadingFinance(p => !p)
      let temp = []
      map(finances, o => {
        temp = [...temp, ...o]
      })
      // temp = uniqBy(, "financeId")
      temp = unidFinaceId([...optionsFinance, ...temp]);
      setOptionsFinance(temp)
      setOrderKeysForGetFinaces(p => [...p, ...orderKeys])
    }
    return debounce(onSearch, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onFinish = (v) => {
    // console.log('onFinish', v)
    getDrugOrders(v)
  }
  // Funcs Helpers
  const closeModal = () => {
    setMedReviewVisible(false);
    setSelectedOrderKeys([])
    setOrderKeysForGetFinaces([])
    setSelectedDrugs([])
    setSelectedFinanceKeys([])
    setOptionsOrder([])
    setOptionsFinance([])
    setOptionsDrug([])
  };
  const defauftSelectedDrugs = (medOrder) => {
    const mapping = map(medOrder, o => {
      return {
        ...o,
        // key: nanoid(),
        prevFinanceId: o.financeId,
        // financeId: null,
      }
    })
    setOptionsDrug(mapping)
    if (mapping.length) setOrderId(mapping[0].orderId)
  }
  // Funcs Handles
  const handleAddDrugByFinances = () => {
    const mappingKeys = map(selectedFinanceKeys, f => {
      return {
        financeId: f
      }
    })
    let interactions = intersectionBy(optionsFinance, mappingKeys, "financeId")
    interactions = map(interactions, i => {
      return {
        ...i,
        key: nanoid(),
        prevFinanceId: i.financeId,
        financeId: null,
        orderid: null,
        orderId: orderId,
      }
    })
    setSelectedFinanceKeys([])
    setOptionsDrug(p => [...p, ...interactions])
    setKeyTableOldFinances(nanoid())
  }
  const handleDeleteSelectedDrugs = (selectedDrugs) => {
    const mappingKeys = map(selectedDrugs, o => {
      return {
        key: o
      }
    })
    let intersections = intersectionBy(cloneDeep(optionsDrug), mappingKeys, "key")
    // console.log('intersections', intersections)
    intersections = filter(intersections, "financeId")
    // console.log('intersections', intersections)
    if (intersections.length) handleDeleteFinances(intersections)
    setOptionsDrug(p => differenceBy(p, mappingKeys, "key"))
    // setSelectDrug([])
  }
  const handleOkNewV2 = async () => {
    let finance = await ChkDrugConditionsV2({
      patientId: patient?.patientId,
      newExpenses: filter(optionsDrug, o => !o?.financeId),
      oldExpenses: filter(optionsDrug, "financeId"),
      doctorId: defalutDoctorId,
      workId: null,
      drugAllergyDetails: drugAllergyDetails,
      drugprofile: drugprofile,
    })
    finance = map(finance, o => {
      const expense = find(expenseList, ["expenseId", o.expenseId])
      return {
        ...o,
        billgroup: expense?.billgroup || null,
        actgroup: expense?.actgroup || null,
      }
    })
    if (props?.page === "15.3") {
      const findDue = find(finance, ["dueReport", "Y"])
      if (findDue) {
        setVsbDueRequest(true)
        setTempOrderFinances(finance)
        return
      }
      props?.inSertDrugProfile(finance);
      closeModal()
    } else {
      setTempOrderFinances(finance)
      // setVsbDrugAlertReMed(true)
    }
    // console.log('finance', finance)
    props?.setOrderFinances(finance);
    closeModal();
  }
  useEffect(() => {
    getWorkPlacesMas();
    getDoctorMas();
    getPeriodList();
    form.submit()
    return () => {
      setWorkList([]);
      setDoctorList([]);
      setPeriodList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (medReviewVisible) {
      defauftSelectedDrugs(medOrder)
    } else {
      setOrderId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medReviewVisible])

  const PartsForm = () => {
    return <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      initialValues={{
        doctor: defalutDoctorId,
        orderDate: dayjs(),
        period: null,
        work: null,
      }}
      onValuesChange={(v, vs) => {
        form.submit()
      }}
    >
      <Row {...rowProps}>
        <Col>
          <GenFormItemLabel label="ห้องตรวจ" />
          <Form.Item className='m-0' name="work">
            <Select
              {...selectSm}
              style={{ marginBottom: 0, width: 200 }}
              options={workList}
            />
          </Form.Item>
        </Col>
        <Col>
          <GenFormItemLabel label="แพทย์" />
          <Form.Item className='m-0' name="doctor">
            <Select
              {...selectSm}
              style={{ marginBottom: 0, width: 200 }}
              options={doctorList}
            />
          </Form.Item>
        </Col>
        <Col>
          <GenFormItemLabel label="วันที่สั่ง" />
          <Form.Item className='m-0' name="orderDate">
            <DayjsDatePicker size={size} name={"orderDate"} form={form} style={{ width: 120 }} />
          </Form.Item>
        </Col>
        <Col>
          <GenFormItemLabel label="ช่วงเวลา" />
          <Form.Item className='m-0' name="period">
            <Select {...selectSm} style={{ marginBottom: 0, width: 145 }} options={periodList} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  }
  const PartTableOrders = () => {
    const columns = [
      {
        title: 'วัน/เวลา',
        dataIndex: 'orderDate',
        width: 110,
        align: 'center',
        render: (v, r) => {
          const orderDateDsp = dayjs(v, "MM/DD/YYYY").format("DD/MM/BBBB") || ""
          const orderTimeDsp = dayjs(r.orderTime, "MM/DD/YYYY HH:mm").format("HH:mm") || ""
          const orderDateTimeDsp = orderDateDsp + " " + orderTimeDsp
          return labelZoom85(orderDateTimeDsp)
        }
      },
      {
        title: 'แพทย์',
        dataIndex: 'doctorName',
        render: (v) => {
          return labelZoom85(v)
        }
      },
    ];
    const rowSelection = {
      selectRowKey: selectedOrderKeys,
      onChange: (selectedRowKeys) => {
        setSelectedOrderKeys(selectedRowKeys)
        debounceGetDrugFinances(selectedRowKeys, orderKeysForGetFinaces, optionsFinance)
      },
    };
    return <Table
      scroll={{ y: 400 }}
      size={size}
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
      columns={columns}
      dataSource={optionsOrder}
      rowKey="orderId"
      rowClassName="data-value"
      pagination={{
        pageSize: 50,
        showSizeChanger: false,
      }}
    />
  }
  const PartTableOldFinances = () => {
    let dataSource = []
    map(optionsFinance, o => {
      if (find(selectedOrderKeys, s => s === o.orderid)) dataSource = [...dataSource, o]
    })
    const columns = [
      {
        title: 'ใบสั่งยาเดิม',
        dataIndex: '',
        render: (v, r, i) => {
          const chkSelectedFinance = find(optionsDrug, ["prevFinanceId", r.financeId])
          let classes = 'd-block'
          if (chkSelectedFinance) classes = "d-block text-danger"
          return <Row {...rowProps}>
            <LabelText className={classes} text={r.expenseName} />
            {
              r?.drugLabelName && <LabelText className='fw-lighter' text={r.drugLabelName || "-"} />
            }
          </Row>
        }
      },
      {
        title: 'จำนวน',
        dataIndex: 'quantity',
        width: 75,
      },
    ];
    const rowSelection = {
      selectRowKey: selectedFinanceKeys,
      onChange: (selectedRowKeys) => {
        setSelectedFinanceKeys(selectedRowKeys)
      },
      getCheckboxProps: (r) => ({
        disabled: find(optionsDrug, ["prevFinanceId", r.financeId]),
      }),
    };
    return <Table
      key={keyTableOldFinances}
      scroll={{ y: 400 }}
      size={size}
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
      columns={columns}
      dataSource={dataSource}
      rowKey="financeId"
      rowClassName="data-value"
      pagination={{
        pageSize: 50,
        showSizeChanger: false,
      }}
    />
  }
  const PartTableSelectedDrugs = () => {
    const columns = [
      {
        title: 'ใบสั่งยาใหม่',
        dataIndex: '',
        render: (v, r, i) => {
          const filterNoCrr = filter(optionsDrug, o => o.key !== r.key)
          const chkDupExpenseId = find(filterNoCrr, ["expenseId", r.expenseId])
          let classes = 'd-block'
          if (chkDupExpenseId) classes = "d-block text-danger"
          let drugLabel = r.drugLabelName
          if (r.route === "D") {
            drugLabel = (r?.docLabel1 || "") + " " + (r?.docLabel2 || "") + " " + (r?.docLabel3 || "") + " " + (r?.docLabel4 || "")
          }
          return <Row {...rowProps}>
            <LabelText className={classes} text={r.expenseName} />
            <LabelText className='fw-lighter' text={drugLabel} />
          </Row>
        }
      },
      {
        title: 'จำนวน',
        dataIndex: 'quantity',
        width: 75,
      },
    ];
    const rowSelection = {
      selectRowKey: selectedDrugs,
      onChange: (selectedRowKeys) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        setSelectedDrugs(selectedRowKeys)
      },
      getCheckboxProps: (record) => ({
        disabled: record.status === "D" || toNumber(record?.sumPayment) || toNumber(record?.sumReminburse),
      }),
    };
    return <Table
      scroll={{ y: 400 }}
      size={size}
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
      columns={columns}
      dataSource={optionsDrug}
      rowClassName="data-value"
      pagination={{
        pageSize: 50,
        showSizeChanger: false,
      }}
    />
  }
  const PartsDueRequestModal = () => {
    return vsbDueRequest && <DueRequest
      // dueReport={dueReport}
      expenses={filter(tempOrderFinances, o => o.dueReport === "Y")}
      optionsUser={doctorList}
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
                userCreated: defalutDoctorId,
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
  return <>
    <Modal
      title={<Row align="middle" style={{
        position: "relative",
        margin: 0
      }}>
        <strong><label>Med-ReView</label></strong>
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
      centered
      visible={medReviewVisible}
      onCancel={() => closeModal()}
      closable={false}
      width={1200}
      footer={[<Row justify="center" key="footer">
        <Button
          key="cancel"
          onClick={() => {
            closeModal();
          }}
        >ออก</Button>
        <Button
          key="ok"
          type="primary"
          disabled={!optionsDrug.length}
          // onClick={() => handleOk()}
          onClick={() => handleOkNewV2()}
        >
          ตกลง
        </Button>
      </Row>]}
    >
      <div style={{ margin: -18 }}>
        <Spin spinning={loading}>
          {PartsForm()}
          <Row {...rowProps} className='mb-2'>
            <Col span={7}>

            </Col>
            <Col span={8} className='text-end'>
              <Button
                {...buttonSm}
                disabled={!selectedFinanceKeys.length}
                onClick={e => {
                  e.stopPropagation()
                  handleAddDrugByFinances()
                }}
              >
                สั่งยาที่เลือก
              </Button>
            </Col>
            <Col span={9} className='text-end'>
              <Button
                hidden
                {...buttonSm}
                className='me-2'
                onClick={e => {
                  e.stopPropagation()
                  setSelectedDrugs([])
                }}
              >
                เพิ่มยา
              </Button>
              <Button
                {...buttonSm}
                type='danger'
                disabled={!selectedDrugs.length}
                onClick={e => {
                  e.stopPropagation()
                  handleDeleteSelectedDrugs(selectedDrugs)
                }}
              >
                ลบยาที่เลือก
              </Button>
            </Col>
          </Row>
          <Row {...rowProps}>
            <Col span={7}>
              {PartTableOrders()}
            </Col>
            <Col span={8}>
              <Spin spinning={loadingFinance}>
                {PartTableOldFinances()}
              </Spin>
            </Col>
            <Col span={9}>
              {PartTableSelectedDrugs()}
            </Col>
          </Row>
        </Spin>
        {PartsDueRequestModal()}
      </div>
    </Modal>
  </>;
}

const apis = {
  GetDrugOrders: {
    url: "PatientsFinancesDrug/GetOpdReMedOrderDateFinancesDrug",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
  GetDrugFinances: {
    url: "PatientsFinancesDrug/GetOpdReMedNameFinancesDrug",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
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
}