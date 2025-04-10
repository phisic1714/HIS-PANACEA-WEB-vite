import React, { useEffect, useMemo, useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import _debounce from "lodash/debounce"
import { notiWarning } from "components/Notification/notificationX";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;
export default function AutoCompleteData({
    showSearch = true,
    rows = 1,
    style = { width: "100%" },
    onChange = () => { },
    value = null,
    codeset = "IT",
    ...props
}) {
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState([])
    const debounceSearch = useMemo(() => {
        const getOptions = async (keywords) => {
            if (!keywords) return
            if (keywords.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
            setLoading(p => !p)
            let res = await callApis(apis["GetOptions"], {
                "user": user,
                "codeset": codeset,
                "searhIcdAndDiagKey": keywords,
            })
            setLoading(p => !p)
            res = res?.map((o, i) => {
                return {
                    value: String(i),
                    icd: o.datavalue,
                    label: `${o.datavalue} ${o.datadisplay}`,
                    diagnosis: o.datadisplay,
                    procedure: o.datadisplay,
                    dx: o.datadisplay,
                    classNames: "data-value",
                }
            })
            setOptions(res)
        }
        return _debounce(getOptions, 1000);
    }, []);
    const getByCode = async (code) => {
        if (!code) return
        if (options.length) return
        setLoading(p => !p)
        let res = await callApis(apis["GetOptions"], {
            "user": user,
            "codeset": codeset,
            "searhIcdAndDiagKey": code,
        })
        setLoading(p => !p)
        res = res?.map((o, i) => {
            return {
                value: String(i),
                icd: o.datavalue,
                label: `${o.datavalue} ${o.datadisplay}`,
                diagnosis: o.datadisplay,
                procedure: o.datadisplay,
                dx: o.datadisplay,
                classNames: "data-value",
            }
        })
        setOptions(res)
    }
    return <AutoComplete
        value={value}
        showSearch={showSearch}
        dropdownMatchSelectWidth={400}
        onKeyUp={e => debounceSearch(e.target.value)}
        options={options}
        className="data-value"
        dropdownRender={menu => loading ? "กำลังค้นหา..." : menu}
        style={style}
        onChange={(value, option) => onChange(value, option)}
        {...props}
    >
        <Input.TextArea
            value={value}
            loading={loading}
            rows={rows}
            style={{ width: "100%" }}
            className="data-value"
            placeholder="ระบุคำค้นหา"
            allowClear
        />
    </AutoComplete>
}
const apis = {
    GetOptions: {
        url: "Masters/GetIcdsRediagsNew",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
}
