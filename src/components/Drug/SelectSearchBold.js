import React, { useState, useMemo, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { orderBy, debounce } from "lodash";

// eslint-disable-next-line no-unused-vars
export default function SelectSearchBold({ dataList = [], value, optionValue, optionLabel, form, name, notShowValue = false, ...props }) {
    // console.log(dataList,"dataList");
    const [keyWord, setKeyWord] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        setKeyWord(null);
        setOptions([]);
    }, [props?.reFresh])

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value) => {
            setOptions([]);
            // setFetching(true);
            setKeyWord(value);
            keyWordSearch(dataList, value);
            setFetching(false);
            // setTimeout(()=>{setFetching(false);},100);
        };
        return debounce(loadOptions, 200);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataList]);

    const renderBold = (label) => {
        if (keyWord) {
            let index = label.toLowerCase().indexOf(keyWord.toLowerCase());
            if (index !== -1) {
                let length = keyWord.length;
                let prefix = label.substring(0, index);
                let suffix = label.substring(index + length);
                let match = label.substring(index, index + length);

                return (
                    <span>
                        {prefix}<span style={{ fontWeight: "bold" }}>{match}</span>{suffix}
                    </span>
                );
            }
        }
        return (
            <span>{label}</span>
        );
    }

    const keyWordSearch = async (array, keyWord) => { //console.log(new RegExp(keyWord?.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")));
        let newKeyWord = new RegExp(keyWord?.toLowerCase()?.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
        let newOption = keyWord ?
            orderBy(
                array.filter((val) => {
                    let label = notShowValue ? val[optionLabel] : val[optionValue] + " " + val[optionLabel];
                    return label.toLowerCase().search(newKeyWord/* ?.toLowerCase() */) !== -1
                }),
                (item) => {
                    let label = notShowValue ? item[optionLabel] : item[optionValue] + " " + item[optionLabel];
                    return label.toLowerCase().search(newKeyWord/* ?.toLowerCase() */)
                }
            ) : array
        setOptions(newOption)
    }

    return (
        <Select
            className='data-value'
            dropdownMatchSelectWidth={345}
            onInput={() => {
                setFetching(true);
            }}
            onBlur={() => {
                setKeyWord(null);
            }}
            // eslint-disable-next-line no-unused-vars
            onSelect={(value, option) => {
                setKeyWord(null);
            }}
            onClear={() => {
                setOptions([]);
            }}
            filterOption={false}
            onSearch={debounceFetcher}
            value={(form && name) ? form.getFieldValue(name) : undefined}
            {...props}
            dropdownRender={(items) => (
                <div>
                    <div>
                        <Spin spinning={fetching} size="small">
                            {items}
                        </Spin>
                    </div>
                </div>
            )}
        >
            {options.length > 0 ?
                options.map((val) => {
                    let label = notShowValue ? val[optionLabel] : val[optionValue] + " " + val[optionLabel];
                    return (
                        <Select.Option key={val[optionValue]}
                            value={val[optionValue]}
                            label={label}
                            data={val}
                            className='data-value'
                        >
                            {renderBold(
                                label
                            )}
                        </Select.Option>
                    )
                })
                :
                keyWord ?
                    null
                    :
                    dataList.map((val) => {
                        let label = notShowValue ? val[optionLabel] : val[optionValue] + " " + val[optionLabel];
                        return (
                            <Select.Option key={val[optionValue]}
                                value={val[optionValue]}
                                label={label}
                                data={val}
                            >
                                {renderBold(
                                    label
                                )}
                            </Select.Option>
                        )
                    })
            }
        </Select>
    );
}