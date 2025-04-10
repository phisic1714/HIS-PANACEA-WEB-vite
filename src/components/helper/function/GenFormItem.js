import React from 'react'
import { Col, Form, Select, Input, Checkbox, InputNumber, Radio, TimePicker } from "antd";
import DayjsDatePicker from "../../DatePicker/DayjsDatePicker";

export default function GenFormItem({
    items = [],
    itemName = null,
    span = 24,
    genCol = true,
}) {
    let fndByName = items.find(o => o.name === itemName)
    if (!fndByName) return
    const {
        form,
        name,
        label,
        inputType,
        checkBoxLabel,
        radioLabel,
        placeholder,
        initialValue = {},
        rules = [],
        options = [],
        status,
        format = "DD/MM/YYYY",
        rows = 1,
        disabled = false,
        loading = false,
        addonBefore = undefined,
        addonAfter = undefined,
        onChange = () => { },
        onKeyUp = () => { },
        onSearch = () => { },
        showTime = false,
        style = {},
        inputStyle = {},
        formItemStyle = {},
        maxLength,
        className = "",
        size = "middle",
        allowClear = false,
        colon = false,
        bordered = true,
        min = undefined,
        max = undefined,
        stringMode = true,
        noStyle = false,
        prevValue = null,
    } = fndByName
    const genInput = () => {
        // eslint-disable-next-line default-case
        // console.log('prevValue :>> ', prevValue);
        switch (inputType) {
            case "select":
                return <Select
                    size={size}
                    showSearch
                    allowClear
                    bordered={bordered}
                    optionFilterProp="label"
                    className={`data-value ${className}`}
                    style={{ width: "100%", ...style, ...inputStyle, color: prevValue ? "green" : "" }}
                    placeholder={placeholder}
                    options={options || []}
                    dropdownMatchSelectWidth={300}
                    disabled={disabled}
                    loading={loading}
                    onChange={onChange}
                    onKeyUp={onKeyUp}
                />
            case "textArea":
                return <Input.TextArea
                    // style={{ ...style }}
                    className="data-value"
                    rows={rows || 1}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={onChange}
                    style={{ ...style, ...inputStyle, backgroundColor: prevValue ? "#69f0ae" : "" }}
                />
            case "checkbox":
                return <Checkbox
                    // style={{ ...style }}
                    disabled={disabled}
                    onChange={onChange}
                ><label className='gx-text-primary'>{checkBoxLabel}</label></Checkbox>
            case "input":
                return <Input
                    className="data-value"
                    style={{ width: "100%", ...style, ...inputStyle, backgroundColor: prevValue ? "#69f0ae" : "" }}
                    placeholder={placeholder}
                    addonBefore={addonBefore}
                    addonAfter={addonAfter}
                    disabled={disabled}
                    onChange={onChange}
                    maxLength={maxLength}
                />
            case "inputSearch":
                return <Input.Search
                    size={size}
                    className="data-value"
                    style={{ width: "100%", ...style, ...inputStyle }}
                    placeholder={placeholder}
                    addonBefore={addonBefore}
                    addonAfter={addonAfter}
                    disabled={disabled}
                    onChange={onChange}
                    onSearch={onSearch}
                />
            case "inputNumber":
                return <InputNumber
                    className="data-value"
                    style={{ width: "100%", ...style, ...inputStyle, backgroundColor: prevValue ? "#69f0ae" : "" }}
                    stringMode={stringMode}
                    placeholder={placeholder}
                    controls={false}
                    disabled={disabled}
                    addonBefore={addonBefore}
                    addonAfter={addonAfter}
                    status={status}
                    onChange={onChange}
                    min={min}
                    max={max}
                />
            case "radio":
                return <Radio
                    // style={{ ...style }}
                    className="data-value"
                    onChange={onChange}
                >{radioLabel}</Radio>
            case "radioGroup":
                return <Radio.Group
                    className="data-value"
                    options={options}
                    onChange={onChange}
                // style={{ ...inputStyle }}
                />
            case "datepicker":
                return <DayjsDatePicker
                    className="data-value"
                    form={form}
                    name={name}
                    style={{ width: "100%", ...style, ...inputStyle }}
                    format={format}
                    showTime={showTime}
                    onChange={onChange}
                    allowClear={allowClear}
                    placeholder={placeholder}
                    initialValue={initialValue}
                    size="small"
                />
            case "timepicker":
                return <TimePicker
                    className="data-value"
                    style={{ width: "100%", ...style, ...inputStyle }}
                    format={"HH:mm"}
                    size={size}
                    onChange={onChange}
                    placeholder={placeholder}
                />
        }
    }
    if (genCol) {
        return (
            <Col span={span} xxl={span} xl={span} lg={6} md={8} sm={24}>
                <Form.Item
                    name={name}
                    label={label ? <label className='gx-text-primary'>{label}</label> : false}
                    rules={rules}
                    valuePropName={inputType === "checkbox" ? "checked" : undefined}
                    style={{ marginBottom: 4, ...formItemStyle }}
                    colon={colon}
                    noStyle={noStyle}
                >
                    {genInput()}
                </Form.Item>
            </Col>
        )
    }
    if (!genCol) {
        return (
            <Form.Item
                name={name}
                label={label ? <label className='gx-text-primary'>{label}</label> : false}
                rules={rules}
                valuePropName={inputType === "checkbox" ? "checked" : undefined}
                style={{ marginBottom: 4, ...formItemStyle }}
                colon={colon}
            >
                {genInput()}
            </Form.Item>
        )
    }
}
