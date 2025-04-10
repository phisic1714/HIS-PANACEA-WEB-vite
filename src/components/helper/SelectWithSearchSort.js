import React, { useEffect, useState } from 'react'
import { Select } from 'antd'
import { matchSorter } from "match-sorter";

function SelectWithSearchSort({ data = [], keys = [], optionValue = "", label = [], comma = " ", ...props }) {
    const [filter, setFilter] = useState(data);
    useEffect(() => {
        setFilter(data)
    }, [data])
    function findMatch(options, word) {
        // console.log(options,"findMatch0");
        // console.log(word,"findMatch1");
        // console.log(label,"findMatch2");
        return options.filter(option => option[label].toLowerCase().includes(word)).sort((a, b) => {
            const indexA = a[label].indexOf(word);
            const indexB = b[label].indexOf(word);
            if (indexA !== indexB) {
                return indexA - indexB;
            }
            return a[label].localeCompare(b[label], undefined, { numeric: true });
        });
    }
    return (
        <Select
            onSearch={(searchValue) =>
                //keys คืออยากให้ตัวเซิจจับ field ไหนบ้าง
                setFilter(
                    findMatch(matchSorter(data, searchValue.toLowerCase(), { keys: keys }), searchValue.toLowerCase())
                )
            }
            showSearch
            filterOption={false}
            options={filter.map((option) => ({
                key: option[optionValue],
                value: option[optionValue],
                label: `${label.map((display) => option[display])}`.replace(",", comma ? comma : " "),
                children: option
            }))}
            {...props}
        />
    )
}

export default SelectWithSearchSort