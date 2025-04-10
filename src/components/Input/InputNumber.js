import React, { useState, useEffect } from "react";
import { Input } from "antd"

export const InputNumber = ({ value, onChange, prev, placeholder, disabled }) => {
    const [prevNumber, setPrevNumber] = useState(null)
    const [number, setNumber] = useState(null);
    useEffect(() => {
        setPrevNumber(prev)
    }, [prev])
    const triggerChange = (changedValue) => {
        onChange?.({
            number,
            ...value,
            ...changedValue,
        });
    };
    const onNumberChange = (e) => {
        const reg = /^-?\d*(\.\d*)?$/;
        if ((!isNaN(e.target.value) && reg.test(e.target.value)) || e.target.value === "") {
            setPrevNumber(null)
            setNumber(e.target.value);
            triggerChange({
                number: e.target.value,
            });
        } else {
            setNumber(number)
        }
    };
    return (
        <span>
            <Input
                type="text"
                value={number ? number : prevNumber ? prevNumber : null}
                onChange={onNumberChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        </span>
    );
}
