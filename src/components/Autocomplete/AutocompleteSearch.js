import { AutoComplete, Input } from "antd";
import { useMemo, useState } from "react";
import {map,debounce} from "lodash";;
import { withResolve } from "api/create-api";


export default function AutocompleteSearch({
    searchfield = "",
    valueKey = null,
    labelKey = null,
    apiEndpoint = "",
    limit = 2,
    initialId = null,
    onSelect = () => { },
    ...props
}) {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const fetchData = async (req) => {
        setLoading(true);
        const { error, result } = await withResolve(apiEndpoint).insert(req);
        setLoading(false);
        if (error) {
            setOptions([]);
            return;
        }
        const mapping = map(result, (o) => {
            const value = o[valueKey];
            const label = o[labelKey] ? `${o[valueKey]} ${o[labelKey]}` : `${o[valueKey]}`;

            return {
                ...o,
                key: o[valueKey],
                value: value,
                label: label,
                className: "data-value",
            };
        });
        setOptions(mapping);
    };

    const debounceSearch = useMemo(() => {
        const onSearch = async (keyword = "") => {
            if (!keyword.length || keyword.length < limit) {
                setOptions([]);
                return;
            }

            const req = {
                "searchfield": searchfield,
                "key": keyword
            };

            await fetchData(req);
        }
        return debounce(onSearch, 500);
    }, []);

    const loadDataById = async () => {
        if (initialId) {
            const req = {
                searchfield: searchfield,
                key: initialId,
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
            placeholder={`พิมพ์ค้นหารหัส ${limit} ตัวอักษร`}
            onKeyUp={(e) => debounceSearch(e.target.value)}
            dropdownRender={menu => loading ? "กำลังค้นหา..." : menu}
            onSelect={(value, option) => onSelect(value, option)}
            {...props}
        >
            <Input.TextArea
                autoSize
                style={{ width: "100%" }}
                className="data-value"
            />
        </AutoComplete>
    );
}