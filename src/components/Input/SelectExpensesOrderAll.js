
import React, { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import _debounce from "lodash/debounce"
import { notiWarning } from "components/Notification/notificationX";

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
    const [options, setOptions] = useState([])
    const debounceSearch = useMemo(() => {
        const getOptions = async (keywords) => {
            if (!keywords) return
            if (keywords.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
            setLoading(p => !p)
            let res = await callApis(apis["GetOptions"], { search: keywords })
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
        return _debounce(getOptions, debounceTime);
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
        getByCode(value)
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
        dropdownRender={menu => loading ? "กำลังค้นหา..." : menu}
        dropdownMatchSelectWidth={400}
        optionFilterProp="label"
        options={options}
        value={value}
        {...props}
    />
}
const apis = {
    GetOptions: {
        url: "OpdExamination/GetExpensesOrderAll",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}