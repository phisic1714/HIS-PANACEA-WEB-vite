
import React, { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import _debounce from "lodash/debounce"
import { notiWarning } from "components/Notification/notificationX";
import { SearchOutlined } from "@ant-design/icons"

export default function SelectData({
    showSearch = true,
    allowClear = true,
    size = "",
    style = { width: "100%" },
    onChange = () => { },
    value = null,
    debounceTime = 400,
    ...props
}) {
    const [loading, setLoading] = useState(false)
    const [openDropdown, setOpenDropdown] = useState(false);
    const [onDrugSearchInput, setOnDrugSearchInput] = useState(undefined);
    const [options, setOptions] = useState([])
    const [total, setTotal] = useState(0)
    const searchDrug = async (isScroll, values, startRow, endRow) => {
        if (isScroll && (options.length >= total)) return
        if (values?.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
        setLoading(p => !p);
        const res = await callApis(apis["GetOptions"], `?Search=${values}&StartRow=${startRow}&EndRow=${endRow}`);
        setLoading(p => !p);
        console.log('GetOptions', res)
        setTotal(res?.pagination?.total || 0)
        const expenses = res?.searchResults?.map(o => {
            return {
                value: o.expenseId,
                label: o.displayName,
                classNames: "data-value",
            }
        })
        setOptions(p => [...p, ...expenses]);
    };
    const debounceSearch = useMemo(() => {
        const loadOptions = value => {
            setOptions([]);
            setTotal(0)
            searchDrug(false, value, 0, 20);
        };
        return _debounce(loadOptions, debounceTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const getByCode = async (expenseId) => {
        if (!expenseId) return
        if (options.length) return
        setLoading(p => !p)
        let res = await callApis(apis["GetOptions"], { expenseId: expenseId })
        setLoading(p => !p)
        res = res?.map(o => {
            return {
                ...o,
                value: o.expenseId,
                label: `${o.code} ${o.name}`,
                classNames: "data-value",
            }
        })
        setOptions(res)
    }
    useEffect(() => {
        // getByCode(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])
    return <Select
        placeholder="ระบุคำค้นหา"
        showSearch={showSearch}
        allowClear={allowClear}
        className='data-value'
        size={size}
        style={style}
        onKeyUp={e => debounceSearch(e.target.value)}
        onChange={(value, option) => onChange(value, option)}
        loading={loading}
        dropdownMatchSelectWidth={400}
        optionFilterProp="label"
        defaultActiveFirstOption={false}
        options={options}
        value={value}
        onClick={() => setOpenDropdown(true)}
        onInput={e => {
            setOnDrugSearchInput(e.target.value);
        }}
        onSearch={debounceSearch}
        onPopupScroll={e => {
            const target = e.target;
            if (Math.ceil(target.scrollTop) + target.offsetHeight >= target.scrollHeight) {
                searchDrug(true, onDrugSearchInput, options.length + 1, options.length + 20)
            }
        }}
        suffixIcon={<span>
            <SearchOutlined style={{
                fontSize: "16px",
                color: "#00C853",
                cursor: "default"
            }}
            />
        </span>}
        open={openDropdown}
        onBlur={() => {
            setOpenDropdown(false);
        }}
        onSelect={() => {
            setTimeout(() => {
                setOpenDropdown(false);
            }, 100);
        }}
        {...props}
    />
}
const apis = {
    GetOptions: {
        url: "PharmaceuticalDrug/SearchPctDrug",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}