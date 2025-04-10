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
    showThName = false,
    mode = "",
    debounce = 1000,
    ...props
}) {
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState([])

    const debounceSearch = useMemo(() => {
        const getOptions = async (keywords) => {
            if (!keywords) return
            if (keywords.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
            setLoading(p => !p)
            let res = await callApis(apis["GetOptions"], keywords)
            setLoading(p => !p)
            res = res?.map(o => {
                let label = `${o.code} ${o.name}`
                if (showThName) label = `${label} ${o.thName}`
                let procedure = o.name
                if (showThName) procedure = `${o.name} ${o.thName}`
                return {
                    value: o.code,
                    label: label,
                    icd: o.code,
                    diagnosis: procedure,
                    procedure: procedure,
                    dx: procedure,
                    classNames: "data-value",
                }
            })
            setOptions(res)
        }
        return _debounce(getOptions, debounce);
    }, []);

    const getByCode = async (code) => {
        if (!code) return
        if (options.length) return
        setLoading(p => !p)
        let res = await callApis(apis["GetOptions"], code)
        setLoading(p => !p)
        res = res?.map(o => {
            let label = `${o.code} ${o.name}`
            if (showThName) label = `${label} ${o.thName}`
            return {
                value: o.code,
                label: label,
                icd: o.code,
                diagnosis: label,
                procedure: label,
                dx: label,
                classNames: "data-value",
            }
        })
        setOptions(res)
    }

    useEffect(() => {

        if (Array.isArray(value)) {
            //
        } else {
            getByCode(value)
        }
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
        mode={mode}
        {...props}
    />
}
const apis = {
    GetOptions: {
        url: "AdminSystem/Expenses/GetListIcd9CM/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}
