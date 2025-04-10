
import React, { useEffect } from 'react'
import { ThaiDatePicker } from './ThaiDatePicker';
import moment from "moment";

function DatepickerWithForm({
    birthDateRef,
    format = "DD/MM/YYYY HH:mm",
    initialValue = false,
    form,
    name,
    placeholder,
    isFormList = false,
    listName = "",
    listIndex = 0,
    ...props
}) {
    // console.log('listIndex', listIndex)
    useEffect(() => {
        if (form && initialValue) {
            form.setFieldsValue({ [name]: initialValue });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    let formValue = null
    switch (isFormList) {
        case false:
            formValue = moment(form.getFieldValue(name))
            break;
        case true:
            let formList = form.getFieldValue(listName)
            if (formList?.length > 0) {
                let crrIndexValue = formList[listIndex]
                // console.log('crrIndexValue', crrIndexValue)
                if (crrIndexValue) {
                    formValue = crrIndexValue[name]
                }
            }
            break;
        default : break;
    }

    return (
        <ThaiDatePicker
            ref={birthDateRef}
            // name={name}
            dropdownClassName="datePicker"
            format={format}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (birthDateRef && e.key === 'Enter') {
                    birthDateRef.current.blur();
                }
                setTimeout(() => {
                    let date = e.target.value;
                    if (moment(date, format, true).isValid() && (/[\d.]/.test(e.key) || e.key === "Backspace")) {
                        let newobj = {};
                        switch (isFormList) {
                            case false:
                                newobj[name] = moment(date, format).subtract(1086, "years")
                                // console.log('newobj', newobj)
                                form.setFieldsValue(newobj)
                                break;
                            case true:
                                let formList = form.getFieldValue(listName)
                                if (formList?.length > 0) {
                                    let selecttedDate = moment(date, format).subtract(1086, "years")
                                    form.setFields([
                                        {
                                            name: [listName, listIndex, name],
                                            value: selecttedDate,
                                        },
                                    ]);
                                }
                                break;
                            default: break;
                        }
                    }
                }, 1);
            }}
            placeholder={placeholder}
            value={formValue}
            {...props}
        />
    )
}

export default DatepickerWithForm