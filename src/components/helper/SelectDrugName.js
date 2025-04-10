import { Select } from 'antd';
import { dspDrugList } from 'appRedux/actions/DropdownMaster.js';
import axios from "axios";
import { filter, orderBy } from "lodash";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { env } from '../../env.js';

export default forwardRef(function SelectDrugName({
  drugType = "D",
  selectDrugType,
  form,
  expenseId,
  name = "expenseId",
  placeholder = "รหัสยา/ชื่อยา",
  sentExpenseId,
  expense_List = [],
  chkExpenseList = false,
  doNotDowloadDropdown = false,
  sentApi = true,
  sentExpenseList,
  notUsePtFlag,
  notShow,
  disabled = false,
  isPcu = false,
  onChange = value => {
    if (!form) {
      sentExpenseId(value);
    }
  },
  expenseListLoading = () => { },
  ...props
}, ref) {
  const dispatch = useDispatch();

  const { drugList: storeDrugList } = useSelector(({ getDropdownMaster }) => getDropdownMaster);
  const [expenseList, setExpenseList] = useState([]);
  const [keyWord, setKeyWord] = useState(null);
  const [chk, setChk] = useState(false);
  const [loading, setLoading] = useState(false)

  const selectRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getExpenseList: () => expenseList
  }));

  const getDataList = async () => {
    if (doNotDowloadDropdown) return
    if (chkExpenseList && expense_List?.length) return
    if (storeDrugList?.length) {
      setExpenseList(storeDrugList)
      sentExpenseList(storeDrugList)
      return
    }
    expenseListLoading(true);
    setLoading(p => !p)
    const resUniq = await getDrugExpenseList(drugType, notUsePtFlag, notShow, selectDrugType);
    setLoading(p => !p)
    dispatch(dspDrugList(resUniq))
    if (sentExpenseList) {
      sentExpenseList(resUniq);
    }
    setExpenseList(resUniq);
    expenseListLoading(false);
  };

  const renderBold = label => {
    if (keyWord) {
      let index = label.toLowerCase().indexOf(keyWord.toLowerCase());
      if (index !== -1) {
        let length = keyWord.length;
        let prefix = label.substring(0, index);
        let suffix = label.substring(index + length);
        let match = label.substring(index, index + length);
        return (
          <span>
            {prefix}
            <mark style={{
              fontWeight: "bold",
              color: "red",
              backgroundColor: "var(--secondary-color)"

            }}>
              {match}
            </mark>
            {suffix}
          </span>
        )
      }
    }
    return <span>{label}</span>;
  };

  useEffect(() => {
    if (sentApi) {
      getDataList();
    }
    return () => {
      setExpenseList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugType, sentApi, selectDrugType]);

  useEffect(() => {
    if (expense_List.length > 0) {
      setExpenseList(expense_List);
    }
  }, [expense_List]);

  const keyWordSearch = (array, keyWord) => {
    array = drugType === "DM" ? array : filter(array, ["financeType", drugType])
    let newKeyWord = new RegExp(keyWord?.toLowerCase()?.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    let newarray = array.map(val => {
      return {
        ...val,
        label: val.code + " " + (val.synonymDesc && val.synonymDesc?.filter(valf => valf?.toLowerCase().indexOf(keyWord?.toLowerCase()) >= 0)?.length > 0 ? val.synonymDesc?.filter(valf => valf?.toLowerCase().indexOf(keyWord?.toLowerCase()) >= 0)[0] : val.expenseName)
      };
    });

    return keyWord ? orderBy(newarray.filter(val => val.label.toLowerCase().search(newKeyWord /* ?.toLowerCase() */) !== -1), item => item.label.toLowerCase().search(newKeyWord /* ?.toLowerCase() */)) : newarray;
  };

  return <Select
    className="data-value"
    expense_List={(drugType === "DM" && selectDrugType === undefined) && isPcu ? expenseList.filter((v) => v.pcu === 'Y') : expenseList}
    placeholder={placeholder}
    ref={selectRef}
    disabled={disabled}
    allowClear={true}
    style={{
      width: '100%'
    }}
    dropdownMatchSelectWidth={775}
    showSearch
    onChange={onChange}
    optionFilterProp="children"
    filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    value={form ? form.getFieldValue(name) : expenseId} onInput={e => {
      setKeyWord(e.target.value);
      setChk(false);
    }}
    onBlur={() => {
      setKeyWord(null);
      setChk(true);
    }}
    onSelect={() => {
      setKeyWord(null);
      setChk(true);
    }}
    loading={loading}
    id="select-drug-name"
    {...props}
  >
    {keyWordSearch(expenseList, keyWord).map(val => {
      return <Select.Option key={val.expenseId} value={val.expenseId} label={val.label} code={val.code} drugTiming={val.drugTiming}>
        {chk ? val.code + " " + val.expenseName :
          renderBold(val.code + " " + (val.synonymDesc && val.synonymDesc?.filter(valf => valf?.toLowerCase().indexOf(keyWord?.toLowerCase()) >= 0)?.length > 0 ? val.synonymDesc?.filter(valf => valf?.toLowerCase().indexOf(keyWord?.toLowerCase()) >= 0)[0] + " " + val.expenseName : val.expenseName))}
      </Select.Option>;
    })}
  </Select>;
});

export const GetOpdExpenseNamefinancesDrugApi = async (drugType, notUsePtFlag, notShow, selectDrugType) => {
  if (notUsePtFlag) {
    notUsePtFlag = "&notUsePtFlag=" + notUsePtFlag;
  } else {
    notUsePtFlag = "";
  }
  if (notShow) {
    notShow = "&notShow=" + notShow;
  } else {
    notShow = "";
  }
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdExpenseNamefinancesDrug?type=${drugType}${notUsePtFlag}${notShow}${selectDrugType ? `&drugtype=${selectDrugType}` : ""}`).then(res => {
    return res.data.responseData;
  }).catch(error => {
    return error;
  });
  return res;
};

export const getDrugExpenseList = async (drugType, notUsePtFlag, notShow, selectDrugType) => {
  let resData = await GetOpdExpenseNamefinancesDrugApi(drugType, notUsePtFlag, notShow, selectDrugType);
  let drugExpenseList = resData.map(val => {
    let synonymDesc = "";
    for (let i of val.expensesDrugSynonym) {
      synonymDesc = synonymDesc ? [...synonymDesc, i.synonymDesc] : [i.synonymDesc];
    }
    return {
      ...val,
      opdFormulaExpensesDrugGroup: val.expensesDrugGroup,
      synonymDesc: synonymDesc
    };
  });
  return drugExpenseList;
};