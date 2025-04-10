import { DeleteOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Collapse, Popconfirm, Row, Select, Space, Spin, Typography } from 'antd';
import { notiError } from 'components/Notification/notificationX';
import { calcExpense } from 'components/helper/CalcExpense';
import { getDateCalculatExpenses } from 'components/helper/GetDateCalculatExpenses';
import { callApis } from 'components/helper/function/CallApi';
import { LabelTopic, LabelTopicPrimary } from 'components/helper/function/GenLabel';
import GenRow from 'components/helper/function/GenRow';
import dayjs from 'dayjs';
import { debounce, find, map, uniqBy, differenceBy, filter } from 'lodash';
import { nanoid } from "nanoid";
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const {
  Panel
} = Collapse;

const initPackage = {
  "formulaId": null,
  "opdipd": null,
  "admitId": null,
  "clinicId": null,
  "finance_Requst": [],
  "opdProcedures": [],
  "ipdProcedures": [],
}

const { Option } = Select

const getAdmitId = (opdipd, admitId) => (admitId !== "O" ? admitId : null);
const getClinicId = (opdipd, clinicId) => (opdipd === "O" ? clinicId : null);

const mapPackageData = (data = []) => {
  return data.map((v) => {
    const label = v.mapping1 ? `${v.mapping1} - ${v.name}` : v.name

    return {
      ...v, value: v.formulaId, label, formulaExpenses: v.formulaExpenses.filter((ex) => ex.expenseCancelFlag !== 'Y')
    }
  })
}

export const PatientPackages = forwardRef(function PatientPackages(props, ref) {
  // console.log('props :>> ', props);
  const { serviceId = null,
    clinicId = null,
    workId = null,
    rightId = null,
    opdRightId = null,
    patientId = null,
    runHn = null,
    yearHn = null,
    hn = null,
    gender = null,
    doctorId = null,
    admitId = null,
    admitRightId = null,
    runAn = null,
    yearAn = null,
    an = null,
    onReload = () => { },
    form = null,
    formListName = "procedures",
  } = props

  const opdipd = clinicId ? "O" : "I"
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;

  const [loadding, setLoadding] = useState(false)
  const [state, setState] = useState({
    selectedPackages: [],
    prevPackages: [],
    packages: [],
    listProceduce: [],
    opdipdPackages: [],
    opdipdProceduces: [],
    expenses: [],
    delPackages: [],
    tempFinance: [],
    deleteExpense: []
  })
  const [opdRightList, setOpdRightList] = useState([]);
  const [admitRightList, setAdmitRightList] = useState([]);
  const [tempTbmOrderFormulas, setTempTbmOrderFormulas] = useState([])
  const [popconfirmVisible, setPopconfirmVisible] = useState(false);
  const [tempValue, setTempValue] = useState([]);
  const [checkedPackages, setCheckedPackages] = useState([])

  const handleStateChange = (k, v) => {
    setState((p) => ({ ...p, [k]: v }))
  }

  const handleChange = async (v) => {
    // console.log('handleChange', v)
    const previousValues = state.selectedPackages.map(pkg => pkg);
    const removedValue = previousValues.find(value => !v.includes(value));
    const isDelete = removedValue ? true : false;

    if (isDelete && (admitId || clinicId)) {
      const clearDeleteExpense = state.deleteExpense.filter((de) => de.formulaId !== removedValue)
      const validateDelete = await validateFinancesByFormula(removedValue);
      if (!validateDelete) {
        notiError({ message: "ไม่สามารถลบรายการ Package นี้ได้" });
        return;
      }

      setTempValue(v);
      setPopconfirmVisible(true);
      handleStateChange("deleteExpense", clearDeleteExpense)
    } else {
      handlePackageChange(v);
    }
  };
  const fetchOptions = debounce(async (inputValue = "") => {
    if (!inputValue.length) {
      handleStateChange("packages", [])
      return
    }

    const req = {
      "searchIdAndName": inputValue
    }

    setLoadding(true);
    const res = await callApis(apis["GetTbmOrderFormulas"], req)
    setLoadding(false);


    if (res?.isSuccess) {
      const mapData = mapPackageData(res.responseData)
      handleStateChange("packages", mapData)
      setTempTbmOrderFormulas((p) => ([...p, ...mapData]))
    } else {
      handleStateChange("packages", [])
    }

  }, 500);
  const manageProcedures = (v) => {
    if (!form) return
    let procedures = form.getFieldsValue()?.[formListName] || []
    // console.log('procedures', procedures)
    const addedFormulas = filter(procedures, "formulaId") // icd ที่ Temp ไว้ใน form แล้ว
    // console.log('addedFormulas', addedFormulas)
    let diffFormulas = differenceBy(v, state.prevPackages)
    diffFormulas = map(diffFormulas, o => ({ formulaId: o }))// Package ที่เพิ่มใหม่
    // console.log('diffFormulas', diffFormulas)
    let forAdd = differenceBy(diffFormulas, addedFormulas, "formulaId")
    forAdd = map(forAdd, o => {
      const findByFormulaId = find(tempTbmOrderFormulas, ["formulaId", o.formulaId])
      return {
        procedureId: null,
        icd: findByFormulaId?.icd?.replaceAll(" ", ""),
        procedure: findByFormulaId?.icdprocedure,
        extension: null,
        key: nanoid(),
        formulaId: o.formulaId
      }
    })
    forAdd = filter(forAdd, "icd") // icd ที่จะเพิ่มเข้าไปใหม่
    let forDel = [] // icd ที่จะลบออกจากที่ Temp ไว้ใน form
    map(addedFormulas, o => {
      const findForDel = find(diffFormulas, d => d.formulaId === o.formulaId)
      if (!findForDel) forDel = [...forDel, { formulaId: o.formulaId }]
    })
    procedures = differenceBy(procedures, forDel, "formulaId")
    form.setFieldsValue({
      [formListName]: [...procedures, ...forAdd]
    })
  }
  const handlePackageChange = async (v) => {
    const clearDeleteExpense = state.deleteExpense.filter((de) => de.formulaId !== v)
    setState((p) => ({
      ...p,
      selectedPackages: v,
      deleteExpense: clearDeleteExpense
    }))
    manageProcedures(v)
  }
  const insertPackage = async (listInsert, ignoreReload = false) => {
    const crrDateTime = dayjs().format("MM-DD-YYYY HH:mm")
    let requestData = []

    for (let pac of listInsert) {
      let finances = null
      let procedures = null

      const findData = tempTbmOrderFormulas.find((v) => v.formulaId === pac)
      let filterFormulaExpenses = []

      if (findData.formulaExpenses.length) {
        filterFormulaExpenses = findData.formulaExpenses.filter((v) => {
          const findDelete = state.deleteExpense.find((ex) => ex.formulaId === v.formulaId && ex.expenseId === v.expenseId)
          if (findDelete) return false
          return true
        })
      }
      if (filterFormulaExpenses.length) {
        const expensePromises = filterFormulaExpenses.map(expense =>
          calcExpense(expense.expenseId, rightId, admitId ? 'ipd' : 'opd')
        );

        const resultCal = await Promise.all(expensePromises);

        const expensesWithDetails = resultCal.map(calculatedExpense => {
          const correspondingExpense = filterFormulaExpenses.find(expense =>
            expense.expenseId === calculatedExpense.expenseId
          );
          return {
            ...calculatedExpense,
            quantity: correspondingExpense ? correspondingExpense.quantity || 0 : 0
          };
        });

        finances = await getExpenseDetails(expensesWithDetails, pac);
      }
      if (findData.formulasProceduce.length) {
        procedures = findData.formulasProceduce.map((v) => ({
          procedure: v.name,
          icd: v.icd,
          formulaId: v.formulaId,
          workId: workId,
          userCreated: user,
          dateCreated: crrDateTime,
          doctor: doctorId,
          clinicId,
          admitId,
          serviceId,
          patientId,
          runHn,
          yearHn,
          hn,
        }))
      }

      requestData.push({
        ...initPackage,
        "formulaId": pac,
        "opdipd": opdipd,
        "admitId": getAdmitId(opdipd, admitId),
        "clinicId": getClinicId(opdipd, clinicId),
        "userCreated": user,
        "finance_Requst": finances,
        "opdProcedures": opdipd === "O" ? procedures : [],
        "ipdProcedures": opdipd === "I" ? procedures : [],
      });
    }

    if (requestData.length) {
      const res = await callApis(apis["InsPackage"], requestData);
      if (res && res?.isSuccess && !ignoreReload) {
        handleSearch()
        // onReload()
        return res
      }
    }
  }
  const deletePakcage = async (listDelete) => {
    let delFinances = []
    let delPackage = listDelete.map((v) => ({ id: v.opdipdpackId }))

    for (let pac of listDelete) {
      const uniqFinance = uniqBy(state.tempFinance, "financeId");
      const { formulaId } = pac
      delFinances = [...delFinances, ...uniqFinance.filter((v) => v.formula === formulaId)]

      if (opdipd === "O") callApis(`${apis["DelOpdProceduresByFormula"]}/${clinicId}/${formulaId}`)
      if (opdipd === "I") callApis(`${apis["DelIpdProceduresByFormula"]}/${admitId}/${formulaId}`)
    }

    if (delFinances.length) await callApis(apis["DelListFinance"], delFinances)

    const res = await callApis(apis["DeleteOpdIpdPackage"], delPackage)
    if (res && res?.isSuccess) {
      handleSearch()
      return res
    }
  }
  const handleSumbitPackage = async () => {
    // console.log('handleSumbitPackage :>> ');
    // console.log('state :>> ', state);
    if (!state.selectedPackages.length && !state.opdipdPackages.length) return
    if (!admitId && !clinicId) return

    const listInsert = state.selectedPackages.filter(item => !state.opdipdPackages.map((v) => v.formulaId).includes(item));
    const listDelete = state.opdipdPackages.filter(item => !state.selectedPackages.includes(item.formulaId));

    let resInsert
    let resDelete
    // console.log('resInsert :>> ', resInsert);
    if (listInsert.length) {
      resInsert = await insertPackage(listInsert, listDelete.length > 0)
    }
    if (listDelete.length) {
      resDelete = await deletePakcage(listDelete)
    }
    if (resInsert?.isSuccess || resDelete?.isSuccess) {
      onReload()
    }
  }
  const getExpenseDetails = async (listExpense, formulaId) => {
    const crrDateTime = dayjs().format("MM-DD-YYYY HH:mm")

    let promises = map(listExpense, o => {
      return getDateCalculatExpenses({
        expenseId: o.expenseId,
        rightId: o.rightId,
      }).then(value => {
        let {
          rate = null,
          credit = "0",
          cashReturn = "0",
          cashNotReturn = "0",
          minRate = "0",
          maxRate = "0"
        } = value;

        rate = rate ? String(Number(rate) * Number(o?.quantity || 0)) : null;
        credit = credit ? String(Number(credit) * Number(o?.quantity || 0)) : "0";
        cashReturn = cashReturn ? String(Number(cashReturn) * Number(o?.quantity || 0)) : "0";
        cashNotReturn = cashNotReturn ? String(Number(cashNotReturn) * Number(o?.quantity || 0)) : "0";
        minRate = minRate ? String(Number(minRate) * Number(o?.quantity || 0)) : "0";
        maxRate = maxRate ? String(Number(maxRate) * Number(o?.quantity || 0)) : "0";

        let right
        if (!admitId) right = find(opdRightList, ["opdRightId", o.opdRightId])
        if (admitId) right = find(admitRightList, ["admitRightId", o.admitRightId])

        return {
          patientId: patientId,
          hn,
          runHn,
          yearHn,
          serviceId,
          clinicId,
          an,
          runAn,
          yearAn,
          admitId,
          rightId,
          opdRightId,
          admitRightId,
          orderId: null,
          financeType: o.financeType,
          expenseId: o?.expenseId,
          expenseName: o?.expenseName,
          code: o?.code,
          billgroup: o?.billgroup,
          actgroup: o?.actgroup,
          accgroup: o?.accgroup,
          opdipd: admitId ? "I" : "O",
          price: rate,
          quantity: String(o?.quantity || 0),
          amount: rate,
          credit: credit,
          cashReturn: cashReturn,
          cashNotReturn: cashNotReturn,
          minRate: minRate,
          maxRate: maxRate,
          promiseAmount: null,
          claim: "0",
          copay: "0",
          discount: "0",
          payment: "0",
          reminburse: "0",
          receive: "0",
          cost: "0",
          payAmount: String(o.payAmount || 0),
          nextPayment: String(o.nextPayment || 0),
          orderDate: crrDateTime,
          orderTime: crrDateTime,
          dateCreated: crrDateTime,
          dateModified: null,
          datePrepared: null,
          dateChecked: null,
          dateDispensed: null,
          datePayabled: null,
          fromWork: workId,
          toWork: null,
          vendor: null,
          doctor: doctorId,
          userCreated: user,
          userModified: null,
          userPrepared: null,
          userChecked: null,
          userDispensed: null,
          userPayabled: null,
          teeth: o.teeth || null,
          lockFlag: null,
          docRemark: null,
          orderRemark: null,
          notTriggerFlag: "Y",
          rushFlag: null,
          acceptFlag: o?.acceptFlag || null,
          cashFlag: right?.cashFlag || null,
          editStatus: null,
          status: null,
          userAccepted: null,
          dateAccepted: null,
          notResultFlag: null,
          xrayResultFlag: null,
          specimen: null,
          specimenVol: null,
          specimenSite: null,
          specimenRemark: null,
          specimenUser: null,
          specimenDate: null,
          formula: formulaId
        };
      });
    });

    const results = await Promise.all(promises);
    return results;
  }

  const renderTreePackage = () => {
    if (!state.selectedPackages?.length) return

    return <Collapse className='mt-1'>
      {state.selectedPackages.map((pack) => {
        const findProceduce = tempTbmOrderFormulas.find((v) => v.formulaId === pack)

        if (!findProceduce) return

        const label = findProceduce.mapping1 ? `${findProceduce.mapping1} - ${findProceduce.name}` : findProceduce.name
        const formulaExpenses = findProceduce.formulaExpenses.map((expense) => {
          const deleteRow = state.deleteExpense.find((v) => v.formulaId === pack && v.expenseId === expense.expenseId)

          return {
            ...expense,
            isDelete: deleteRow ? true : false
          }
        })

        const filterFormulaExpenses = formulaExpenses.filter((v) => !v.isDelete)

        const sumEx = filterFormulaExpenses.reduce((sum, expense) => {
          return sum + (expense.maxRate * expense.quantity);
        }, 0);

        const alreadyInsert = findProceduce?.opdipdpackId || filterFormulaExpenses.length === 1

        return <Panel key={pack} header={<LabelTopic text={label} />} extra={<>{sumEx} บาท</>}>
          <GenRow>
            <Col span={15}>
              <LabelTopicPrimary text='ชื่อรายการ' />
            </Col>
            <Col span={4} style={{ textAlign: "center" }}>
              <LabelTopicPrimary text='จำนวน' />
            </Col>
            <Col span={4} style={{ textAlign: "right" }}>
              <LabelTopicPrimary text='ราคารวมทั้งหมด' />
            </Col>
            <Col span={1} />
          </GenRow>
          {filterFormulaExpenses.map((expense) => {
            return <GenRow key={expense.expenseId}>
              <Col span={15}>{expense.expenseName}</Col>
              <Col span={4} style={{ textAlign: "center" }}>{expense.quantity}</Col>
              <Col span={4} style={{ textAlign: "right" }}>{Number(expense.quantity) * Number(expense.maxRate)}</Col>
              {!alreadyInsert && <Col span={1} style={{ textAlign: "center" }}>
                <Popconfirm
                  title={`ยืนยันการลบ ${expense.expenseName}`}
                  onConfirm={() => {
                    const obj = {
                      formulaId: pack,
                      expenseId: expense.expenseId
                    }
                    setState((p) => ({
                      ...p,
                      deleteExpense: [...p.deleteExpense, obj]
                    }))
                  }}
                  onCancel={() => { }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined />
                </Popconfirm>
              </Col>}
            </GenRow>
          })}
        </Panel>
      })}
    </Collapse>
  }

  const fetchPatientPackageOrProceduce = async () => {
    const res = await callApis(apis["GetOpdIpdPackage"], {
      "admitId": getAdmitId(opdipd, admitId),
      "clinicId": getClinicId(opdipd, clinicId),
      "formulaId": null
    })

    if (res?.isSuccess) {
      setState((p) => ({
        ...p,
        selectedPackages: res.responseData.map((v) => v.formulaId),
        prevPackages: res.responseData.map((v) => v.formulaId),
        opdipdPackages: res.responseData,
        packages: mapPackageData(res.responseData),
        deleteExpense: []
      }))

      setTempTbmOrderFormulas(res.responseData)
    }
  }

  const validateFinancesByFormula = async (removedValue) => {
    const res = await callApis(apis["GetFinancesOrder"], {
      "patientId": patientId,
      "serviceId": null,
      "clinicId": getClinicId(opdipd, clinicId),
      "admitId": getAdmitId(opdipd, admitId),
      "date": null,
      "userId": null,
      "workId": null,
      "orderId": null,
      "rightId": null,
      "startDate": null,
      "endDate": null,
      "timeL": null,
      "timeM": null,
      "timeB": null,
      "timeE": null,
      "timeN": null,
      "isDrugOrder": null,
      "formula": removedValue
    })
    if (!res || !res?.isSuccess) return false
    const filterPackage = res.responseData.filter((v) => v.formula === removedValue)
    handleStateChange("tempFinance", [...state.tempFinance, ...filterPackage])
    const findPayment = filterPackage.find((v) => v.payment === 0 && v.reminburse === 0)
    if (findPayment) return false
    return true
  }

  const getClinicsAndOpdRights = async (serviceId) => {
    if (!serviceId) return
    const [
      opdRights,

    ] = await Promise.all([
      callApis(apis["GetOpdRightByServiceId"], serviceId),
    ])
    setOpdRightList(opdRights)

  }

  const getAdmitAndAdmitRights = async (admitId) => {
    if (!admitId) return
    const req = {
      admitId: admitId
    }
    const [
      admitRights,
    ] = await Promise.all([
      callApis(apis["GetAdmitRightByAdmitID"], req),
    ])
    setAdmitRightList(admitRights)
  }

  const handleSearch = () => {
    fetchPatientPackageOrProceduce()
  }

  const confirmDelete = (event) => {
    event.preventDefault()
    handlePackageChange(tempValue);
    setPopconfirmVisible(false);
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setCheckedPackages(state.packages.map((pkg) => pkg.value));
    } else {
      setCheckedPackages([]);
    }
  };

  const handleDelOnSelect = () => {
    const updatedPackages = state.selectedPackages.filter(
      (pkg) => !checkedPackages.includes(pkg)
    );

    setState((prevState) => ({
      ...prevState,
      selectedPackages: updatedPackages,
    }));
    setCheckedPackages([]);
  };

  const handleCheckboxChange = (checkedValues) => {
    setCheckedPackages(checkedValues);
  };


  useEffect(() => {
    if (clinicId || admitId) {
      handleSearch()
    }
    //eslint-disable-next-line
  }, [clinicId, admitId])

  useEffect(() => {
    getClinicsAndOpdRights(serviceId)
  }, [serviceId])

  useEffect(() => {
    getAdmitAndAdmitRights(admitId)
  }, [admitId])

  useImperativeHandle(ref, () => ({
    handleSumbitPackage,
  }));

  // console.log(state)

  return (
    <Collapse defaultActiveKey={["1"]} className="mb-1">
      <Panel
        header={
          <div style={{ width: "100%" }}>
            <label
              className="gx-text-primary fw-bold"
              style={{ fontSize: 14 }}
            >
              รายการรักษา (Package)
            </label>
          </div>
        }
        key="1"
      >
        <Row className="pb-1">
          <Space direction='vertical' size={5} style={{ padding: "0rem 1rem 1rem" }}>
            <Space size={2} direction='horizontal' align='center'>
              <Checkbox
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={
                  checkedPackages.length > 0 &&
                  checkedPackages.length === state.packages.length
                }
              >
                เลือกทั้งหมด
              </Checkbox>
              <Popconfirm
                title="ลบที่เลือก ?"
                okText="ยืนยัน"
                cancelText="ปิด"
                onConfirm={handleDelOnSelect}
              >
                <Button
                  type='danger'
                  className='mb-0'
                  size='small'
                  disabled={checkedPackages.length === 0}
                >
                  ลบที่เลือก
                </Button>
              </Popconfirm>
              {/* <Button style={{ height: '24px', lineHeight: '24px', padding: '3.7px, px', margin: 0, backgroundColor: 'red' }}
                danger
                onClick={handleDelOnSelect}
              >
                <Typography.Text style={{ color: 'white', fontSize: 12 }}>ลบที่เลือก</Typography.Text>
              </Button> */}
            </Space>
            {state.selectedPackages.length > 0 && (
              <Checkbox.Group
                options={state.packages?.filter(item => state.selectedPackages.includes(item.value))?.map(item => ({ label: item.label, value: item.value }))}
                value={checkedPackages}
                onChange={handleCheckboxChange}
              />
            )}
          </Space>
          <Col span={24}>
            <Popconfirm
              title="คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"
              visible={popconfirmVisible}
              onConfirm={confirmDelete}
              onCancel={() => setPopconfirmVisible(false)}
              okText="ใช่"
              cancelText="ไม่ใช่"
            >
              <Select
                mode="multiple"
                value={state.selectedPackages}
                placeholder="พิมพ์ค้นหา..."
                showSearch
                onSearch={(v) => {
                  if (v) {
                    fetchOptions(v);
                  } else {
                    handleStateChange("packages", []);
                  }
                }}
                notFoundContent={loadding ? <Spin size="small" /> : null}
                filterOption={false}
                style={{ width: "100%" }}
                onChange={handleChange}
              >
                {state.packages.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Popconfirm>
          </Col>
        </Row>
        {state.selectedPackages && renderTreePackage()}
      </Panel>
    </Collapse>

  )
})

const apis = {
  GetTbmOrderFormulas: {
    url: "OpdExamination/GetTbmOrderFormulas",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  InsPackage: {
    url: "Finances/InsPackage",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  GetPackagDetail: {
    name: "GetPackagDetail",
    url: "Packages/GetPackagDetail_ById/",
    method: "GET",
    return: "data",
    sendRequest: false
  },
  GetOpdIpdPackage: {
    name: "GetOpdIpdPackage",
    url: "OpdIpd/GetOpdIpdPackage",
    method: "POST",
    return: "data",
    sendRequest: true
  },
  GetOpdIpdProceduce: {
    name: "GetOpdIpdProceduce",
    url: "OpdIpd/GetOpdIpdProceduce",
    method: "POST",
    return: "data",
    sendRequest: true
  },
  GetFinancesOrder: {
    url: "OpdExamination/GetFinancesOrder",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  getExpenById: {
    url: "AdminSystem/Expenses/getExpenById",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  GetExpenses: {
    name: "GetExpenses",
    url: "OpdExamination/GetExpenses",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  GetOpdRightByServiceId: {
    name: "GetOpdRightByServiceId",
    url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  GetAdmitRightByAdmitID: {
    url: "Admits/GetAdmitRightByAdmitID",
    method: "POST",
    return: "responseData",
    sendRequest: true
  },
  DelListFinance: {
    url: "Finances/DelListFinance",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  DeleteOpdIpdPackage: {
    url: "OpdIpd/DeleteOpdIpdPackage",
    method: "POST",
    return: "data",
    sendRequest: true,
  },
  DelOpdProceduresByFormula: {
    url: "OpdProcedures​/DelOpdProceduresByFormula",
    method: "DELETE",
    sendRequest: false,
  },
  DelIpdProceduresByFormula: {
    url: "IpdProcedures/DelIpdProceduresByFormula",
    method: "DELETE",
    sendRequest: false,
  }

}