import { Checkbox, Form, Input, InputNumber, Radio, Select, TimePicker } from "antd"
import DayjsDatePicker from "components/DatePicker/DayjsDatePicker";
import { map } from "lodash";
import React from "react";

export const GenFormItem = ({
    name = "",
    label = false,
    input = <></>,
    style = { marginBottom: 4 },
    required = false,
    ...props
}) => {
    return <Form.Item
        style={style}
        name={name}
        label={label}
        rules={[
            {
                required: required,
                message: "จำเป็น !",
            }
        ]}
        {...props}
    >
        {input}
    </Form.Item>
}
export const GenFormItem2 = ({
    name = "",
    label = false,
    input = <></>,
    style = { marginBottom: 0 },
    required = false,
    requiredLabel = false,
    rules = null,
    valuePropName = undefined,
    maxLength = undefined,
    type = "text",
    ...props
}) => {
    const formLabelRequired = <label className='d-block' style={{ marginBottom: -5 }}>
        <label style={{ color: "red" }}>*</label>
        <label className="data-value" style={{ color: "var(--primary-color)" }}>{label}</label>
    </label>
    const formLabel = <label style={{ marginBottom: -5, color: "var(--primary-color)" }} className='data-value d-block'>{label}</label>
    const clonedInput = React.cloneElement(input, { maxLength, type });
    return <>
        {
            label
                ? (required || requiredLabel) ? formLabelRequired : formLabel
                : false
        }
        <Form.Item
            style={style}
            name={name}
            rules={
                rules
                    ? rules
                    : [
                        {
                            required: required,
                            message: "จำเป็น !",
                        }
                    ]}
            valuePropName={valuePropName}
            {...props}
        >
            {clonedInput}
        </Form.Item>
    </>
}
export const GenSelect = ({
    size = "middle",
    options = [],
    placeholder = "",
    style = { width: "100%", margin: 0 },
    showSearch = true,
    allowClear = true,
    dropdownMatchSelectWidth = 345,
    disabled = false,
    optionFilterProp = "label",
    optionLabelProp = "label",
    loading = false,
    prevValue = null,
    onChange = () => { },
    ...props
}) => {
    return <Select
        size={size}
        className="data-value"
        style={{ ...style, color: prevValue ? "green" : "" }}
        showSearch={showSearch}
        allowClear={allowClear}
        optionLabelProp={optionLabelProp}
        optionFilterProp={optionFilterProp}
        options={options}
        placeholder={placeholder}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
        disabled={disabled}
        onChange={onChange}
        loading={loading}
        {...props}
    />
}
export const GenDatePicker = ({
    size = "middle",
    form = false,
    name = "",
    style = { width: "100%", margin: 0 },
    format = "DD/MM/YYYY",
    showTime = false,
    allowClear = false,
    disabled = false,
    ...props
}) => {
    return <DayjsDatePicker
        size={size}
        className="data-value"
        form={form}
        name={name}
        style={style}
        format={format}
        showTime={showTime}
        allowClear={allowClear}
        locale="th"
        disabled={disabled}
        {...props}
    />
}
export const GenTimePicker = ({
    size = "middle",
    style = { width: "100%", margin: 0 },
    format = "HH:mm",
    allowClear = false,
    disabled = false,
    ...props
}) => {
    return <TimePicker
        size={size}
        className="data-value"
        style={style}
        format={format}
        allowClear={allowClear}
        disabled={disabled}
        {...props}
    />
}
export const GenInput = ({
    size = "middle",
    placeholder = "",
    style = { width: "100%", margin: 0 },
    disabled = false,
    prevValue = null,
    ...props
}) => {
    return <Input size={size} style={{ ...style, color: prevValue ? "green" : "" }} placeholder={placeholder} disabled={disabled} {...props} />
}
export const GenInputNumber = ({
    size = "middle",
    placeholder = "",
    style = { width: "100%", margin: 0 },
    disabled = false,
    stringMode = true,
    controls = false,
    prevValue = null,
    ...props
}) => {
    return <InputNumber
        size={size}
        style={{ ...style, color: prevValue ? "green" : "" }}
        placeholder={placeholder}
        disabled={disabled}
        stringMode={stringMode}
        controls={controls}
        {...props}
    />
}
export const GenRadioGroup = ({
    options = [],
}) => {
    return <Radio.Group>
        {
            map(options, o => {
                return <Radio key={o.value} value={o.value}>{o.label}</Radio>
            })
        }
    </Radio.Group>
}
export const GenCheckBox = ({
    label = false,
}) => {
    return <Checkbox><label className="data-value" style={{ color: "var(--primary-color)", margin: 0 }}>{label}</label></Checkbox>
}

