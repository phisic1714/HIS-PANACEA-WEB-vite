import React, { useEffect } from 'react'
import { ThaiDatePicker } from './ThaiDatePicker';
import moment from "moment";

function DatepickerWithoutForm({ format = "DD/MM/YYYY HH:mm", initialValue = false, form, name, ...props }) {
    useEffect(() => {
        if (form && initialValue) {
            form.setFieldsValue({ [name]: initialValue });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <ThaiDatePicker
            // name={name}
            dropdownClassName="datePicker"
            format={format}
            onKeyDown={(e) => {
                e.stopPropagation();
                setTimeout(() => {
                    let date = e.target.value;
                    if (moment(date, format, true).isValid() && (/[\d.]/.test(e.key) || e.key === "Backspace")) {
                        let newobj = {};
                        newobj[name] = moment(date, format).subtract(1086, "years")
                        form.setFieldsValue(newobj)
                    }
                }, 1);
            }}
            value={moment(form.getFieldValue(name))}
            {...props}
        />
    )
}

export default DatepickerWithoutForm