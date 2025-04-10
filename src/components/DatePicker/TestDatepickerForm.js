import React from 'react'
import { ThaiDatePicker } from './ThaiDatePicker';
import moment from "moment";

function TestDatepickerForm({format="DD/MM/YYYY",form, name , ...props}) {
    return (
        <ThaiDatePicker
            dropdownClassName="datePicker"
            format={format}
            onKeyDown={(e)=>{
                setTimeout(() => {
                    let date = e.target.value;
                    if(moment(date,"DD/MM/YYYY", true).isValid() && (/[\d.]/.test(e.key)||e.key=== "Backspace")){
                        let newobj = {};
                        newobj[name] = moment(date,"DD/MM/YYYY").subtract(1086, "years")
                        form.setFieldsValue(newobj)
                    }
                }, 1);
            }}
            value={moment(form.getFieldValue(name))}
            {...props}
        />
    )
}

export default TestDatepickerForm