import React, { useEffect, useState } from 'react'
import { ThaiDatePicker } from './ThaiDatePicker';
import moment from "moment";
function TestDatepicker({format="DD/MM/YYYY",...props}) {
// const [value, setValue] = useState(moment());
// const [text, setText] = useState("");
useEffect(() => {

},[props?.value])
  return (
    // <ThaiDatePicker open={show} panelRender={(o)=>{
    //     return <div onMouseLeave={()=>setShow(false)}>
    //          <div>
    //             <input></input>
    //         </div>
    //         {o}
    //     </div>
    // }} {...props} onMouseEnter={()=>{
    //     setShow(true)
    // }}></ThaiDatePicker>
    <ThaiDatePicker
      value={props?.value}
      // onChange={(e) => {
      //   if (!e&&e!==value) {
      //     setValue(null);
      //     setText("");
      //   }
      // }}
      dropdownClassName="datePicker"
      format={format}
      // onKeyDown={(e) => {
      //   if (e.key !== "Backspace") {
      //     const newText = text.concat(e.key);
      //     setText(newText);
      //     if (moment(newText, format).isValid()) {
      //       console.log(newText);
      //       setValue(moment(newText, format).isValid() ? moment(newText, format).subtract(543,"y") : null);
      //     }
      //   } else {
      //     const newText = text.slice(0, -1);
      //     setText(newText);
      //   }
      // }}
      onChange={value=>{
        props?.setValue(value)
      }}
      onKeyDown={(e)=>{
        e.stopPropagation();
        setTimeout(() => {
            let date = e.target.value;
            if(moment(date,"DD/MM/YYYY", true).isValid() && (/[\d.]/.test(e.key)||e.key=== "Backspace")){
              props?.setValue(moment(date,"DD/MM/YYYY").subtract(1086, "years"))
            }
        }, 1);
    }}
      {...props}
    />
  )
}

export default TestDatepicker