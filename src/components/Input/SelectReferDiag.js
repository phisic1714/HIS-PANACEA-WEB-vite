import React, { useEffect, useMemo, useState } from 'react'
import { Select } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import _debounce from "lodash/debounce"
import { notiWarning } from "components/Notification/notificationX";


export default function SelectReferDiag({
    showSearch = true,
    allowClear = true,
    size = "",
    style = { width: "100%" },
    onChange = () => { },
    value = null,
    placeholder = "ระบุคำค้นหา",
    ...props
}) {
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState([])
    const debounceSearch = useMemo(() => {
        const getOptions = async (keywords) => {
            if (!keywords) return
            if (keywords.length < 3) return notiWarning({ message: "ระบุคำค้นหา 3 ตัวอักษรขึ้นไป !" })
            setLoading(p => !p)
            let res = await callApis(apis["GetOptions"], keywords)
            setLoading(p => !p)
            res = res?.map(o => {
                return {
                    value: o?.datavalue,
                    label: o?.datadisplay,
                    classNames: "data-value",
                }
            })
            setOptions(res)
        }
        return _debounce(getOptions, 500);
    }, []);
    const getByCode = async (code) => {
        if (!code) return
        if (options.length) return
        setLoading(p => !p)
        let res = await callApis(apis["GetOptions"], code)
        setLoading(p => !p)
        res = res?.map(o => {
            return {
                value: o?.datavalue,
                label: o?.datadisplay,
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
        placeholder={placeholder}
        {...props}
    />
}
const apis = {
    GetOptions: {
        url: "Masters/GetReferDiags/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
