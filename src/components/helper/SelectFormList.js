import React from 'react'
import { Form, Input, Select } from 'antd';

export default function SelectFormList({chkFocus, setChkFocus, openDropdown=false, setOpenDropdown, index, form, 
    formProps={},matchProps={}, formSelectProps={}, selectProps={}, inputFormName, formInputProps={}, inputProps={}, nameList=[] }) {
    
    console.log(openDropdown,"TTT");

    return (
        <>
            {chkFocus === index ?
                <Form.Item
                    style={{ width:"100%", marginBottom:0 }}
                    {...formProps}
                    {...formSelectProps}
                >
                    <Select
                        // dropdownAlign={{
                        //     offset: [0, 0]
                        // }}
                        optionFilterProp="label"
                        onClick={()=>setOpenDropdown(true)}
                        onBlur={()=>{
                            setChkFocus(null);
                            setOpenDropdown(false);
                        }}
                        onSelect={()=>{
                            setChkFocus(null);
                            setTimeout(()=>setOpenDropdown(false),100);
                        }}
                        onChange = {(value,option)=>{
                            form.setFields([
                                {
                                    name: [...nameList, ...inputFormName],
                                    value: option?.label
                                },
                            ])
                        }}
                        {...matchProps}
                        {...selectProps}
                    />
                </Form.Item>
                :
                <Form.Item
                    style={{ width:"100%", marginBottom:0 }}
                    name={inputFormName}
                    {...formProps}
                    {...formInputProps}
                >
                    <Input
                        onClick={()=>{
                            setTimeout(()=>{
                                setChkFocus(index)
                            },100)
                        }}
                        onMouseOver={()=>{
                            console.log(openDropdown,"openDropdown");
                            if(!openDropdown){
                                setChkFocus(index);
                            }
                        }}
                        {...matchProps}
                        {...inputProps}
                    />
                </Form.Item>
            }
        </>
    )
}
