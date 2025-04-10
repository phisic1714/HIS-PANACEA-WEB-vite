import { AutoComplete, Input } from "antd";
import { useMemo, useState } from "react";
import { map, debounce } from "lodash";
import { callApi } from 'components/helper/function/CallApi';

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function AutocompleteProcedue({ codeset = "OP", placeholder = "พิมพ์ค้นหา", limit = 3, initialId = null, ...props }) {
    const [loadding, setLoading] = useState(false)
    const [options, setOptions] = useState([])

    const fetchData = async (req) => {
        setLoading(true);
        let res = await callApi(listApi, "GetIcdsRediagsNew", req);
        setLoading(false);

        res = map(res, (o, i) => {
            let key = String(i);
            return {
                key: key,
                value: key,
                icd: o.datavalue,
                label: `${o.datavalue} ${o.datadisplay}`,
                procedure: o?.datadisplay,
                className: "data-value",
                pdx: o.dataother1,
            };
        });
        setOptions(res)
    };

    const debounceSearch = useMemo(() => {
        const onSearchIcd = async (keyword = "") => {
            if (!keyword.length || keyword.length < limit) {
                setOptions([]);
                return;
            }

            const req = {
                "user": user,
                "codeset": codeset,
                "searhIcdAndDiagKey": keyword
            }

            await fetchData(req)
        }
        return debounce(onSearchIcd, 400);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDataById = async () => {
        if (initialId) {
            const req = {
                "codeset": codeset,
                "searhIcdAndDiagKey": initialId
            };

            await fetchData(req);
        }
    };

    useMemo(() => {
        if (initialId) {
            loadDataById();
        }
    }, [initialId]);

    return (
        <AutoComplete
            allowClear
            dropdownMatchSelectWidth={500}
            optionFilterProp="label"
            options={options}
            className="data-value"
            placeholder={placeholder}
            onKeyUp={(e) => debounceSearch(e.target.value)}
            dropdownRender={menu => loadding ? "กำลังค้นหา..." : menu}
            {...props}
        >
            <Input.TextArea
                autoSize
                style={{ width: "100%" }}
                className="data-value"
                maxLength={2000}
            />
        </AutoComplete>
    )
}

const listApi = [{
    name: "GetIcdsRediagsNew",
    url: "Masters/GetIcdsRediagsNew",
    method: "POST",
    return: "responseData",
    sendRequest: true,
}]