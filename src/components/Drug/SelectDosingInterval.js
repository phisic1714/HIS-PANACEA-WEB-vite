import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Radio, Select, Row, Col, Checkbox } from "antd";

const SelectDosingInterval = forwardRef(function SelectDosingInterval({
    options,
    form,
    changeDosingInterval,
    setDrugUsingLabel,
    drugUsingLabel,
    dosingIntervalLabel = () => { },
    profileTypeSelect,
    setDosingIntervalDays = () => { },
    ...props }, ref) {
    const { Option } = Select;
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(undefined);
    const [chkDays, setChkDays] = useState([]);
    const days = options?.find(val => val.datavalue === "DIW")?.subData;

    useImperativeHandle(ref, () => ({
        handleClear: () => handleClear(),
        setDosingInterval: (arr) => setDosingInterval(arr),
        getValue: () => value,
        getChkDays: () => chkDays,
        setValue: (v) => setValue(v),
        setChkDays: (v) => setChkDays(v),
    }));

    useEffect(() => {
        if (profileTypeSelect === "C") {
            changeDosingInterval("ED");
            setValue("ED");
            setChkDays([]);
        } else {
            changeDosingInterval(undefined);
            setValue(undefined);
            setChkDays([]);
        }
        return () => {
            changeDosingInterval(undefined);
            setValue(undefined);
            setChkDays([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileTypeSelect])

    const setDosingInterval = (arr) => {
        // console.log(arr, "arrsetDosingInterval");
        if (arr.length > 1) {
            let newValue = arr.shift();
            changeDosingInterval(newValue);
            setValue(newValue);
            setChkDays(arr);
        } else {
            changeDosingInterval(arr[0]);
            setValue(arr[0]);
            setChkDays([]);
        }
    }

    const onChangeRadio = (e) => {
        let newValue = e.target.value;
        if (newValue !== "DIW") {
            setOpen(false);
            setChkDays([]);
        }
        changeDosingInterval(newValue, true);
        setDrugUsingLabel({
            ...drugUsingLabel,
            dosingInterval: dosingIntervalLabel([newValue], options),
            alternateDay: null,
            otherDosingInterval: null
        });
        form.setFieldsValue({
            alternateDay: null,
            otherDosingInterval: null
        });
        setValue(newValue);
    };

    const onChangeCheckbox = (e, value) => {
        // console.log(e, "setDosingInterval0");
        // console.log(value, "setDosingInterval1");
        // console.log(chkDays, "setDosingInterval2");
        if (chkDays.find((val) => val === value)) {
            let newChkDays = chkDays.filter((val) => val !== value);
            // console.log('[value, ...newChkDays]', [value, ...newChkDays])
            setDrugUsingLabel({
                ...drugUsingLabel,
                dosingInterval: dosingIntervalLabel([value, ...newChkDays], options),
                alternateDay: null,
                otherDosingInterval: null
            });
            setChkDays(newChkDays);
        } else {
            // console.log('[value, ...chkDays, value]', [value, ...chkDays, value])
            setDrugUsingLabel({
                ...drugUsingLabel,
                dosingInterval: dosingIntervalLabel([value, ...chkDays], options),
                alternateDay: null,
                otherDosingInterval: null
            });
            setChkDays((prev) => [...prev, value]);
        }
    };
    useEffect(() => {
        setDosingIntervalDays(chkDays)
    }, [chkDays])

    const showValue = () => {
        if (chkDays.length > 0) {
            let showValue = "";
            days.filter((day) => chkDays.includes(day.datavalue))
                .forEach(
                    (val, index) => (showValue += (index > 0 ? ", " : "") + val.datadisplay)
                );
            return showValue;
        } else {
            if (value) {
                return options.find((val) => val.datavalue === value)?.datadisplay;
            } else {
                return null;
            }
        }
    };

    const handleClear = () => {
        if (profileTypeSelect === "C") {
            changeDosingInterval("ED", true);
            setValue("ED");
            setChkDays([]);
            setDrugUsingLabel({
                ...drugUsingLabel,
                dosingInterval: dosingIntervalLabel(["ED"], options),
            });
        } else {
            setValue(undefined);
            setChkDays([]);
            changeDosingInterval(undefined, true);
            setDrugUsingLabel({
                ...drugUsingLabel,
                dosingInterval: dosingIntervalLabel([], options),
            });
        }
    };

    return (
        <Radio.Group style={{ width: '100%' }} onChange={onChangeRadio} value={value}>
            <Select
                allowClear
                showSearch
                style={{
                    width: '100%'
                }}
                open={open}
                onClick={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onClear={handleClear}
                value={showValue()}
                {...props}
            >
                {options?.map((val) => (
                    <Option key={val.datavalue} value={val.datavalue}>
                        {val.datavalue === "DIW" ? (
                            <Radio
                                style={{ width: "100%" }}
                                value={val.datavalue}
                                onClick={e => {
                                    e.stopPropagation()
                                    if (e.target.value === value) {
                                        setValue(null)
                                        form.setFieldsValue({
                                            alternateDay: null,
                                            otherDosingInterval: null
                                        });
                                    }
                                }}
                            >
                                <Row>
                                    <Col span={24}>{val.datadisplay}</Col>
                                    <Checkbox.Group value={chkDays}>
                                        {days?.map((day) => (
                                            <Col key={day?.datavalue} span={24}>
                                                <Checkbox
                                                    disabled={value !== "DIW"}
                                                    onChange={(e) => onChangeCheckbox(e, day?.datavalue)}
                                                    value={day?.datavalue}
                                                >
                                                    {day?.datadisplay}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Checkbox.Group>
                                </Row>
                            </Radio>
                        ) : (
                            <Radio
                                style={{ width: "100%" }}
                                value={val.datavalue}
                                onClick={e => {
                                    e.stopPropagation()
                                    if (e.target.value === value) {
                                        setValue(null)
                                    }
                                }}
                            >
                                {val.datadisplay}
                            </Radio>
                        )}
                    </Option>
                ))}
            </Select>
        </Radio.Group>
    );
});
export default SelectDosingInterval;
