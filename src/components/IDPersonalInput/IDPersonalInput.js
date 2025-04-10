import React, { useEffect, useState } from "react";
import { Input, Form } from "antd";
import "./id-personall-input.less";

const pattern = /^[0-9]*$/;

export default function IDPersonalInput({ idCode, onChnageIDPersanal,disabled=false }) {
  const [IDPersonalList, setIDPersonalList] = useState();
  useEffect(() => {
    let addList = {};
    for (let i in idCode) {
      addList = {
        ...addList,
        [`code${Number(i) + 1}`]: idCode[i],
      };
      setIDPersonalList(addList);
    }
  }, [idCode]);

  const handleChange = (keys, event) => {
    ///กรณี กดกรอกตัวเลข และต้องเป็น format ตัวเลขเท่านั้น
    if (pattern.test(event.target.value)) {
      setIDPersonalList({ ...IDPersonalList, [keys]: event.target.value });

      ///แปลง object กลับเป็น format บัตรประชาชน
      const convertObjToIDFormat = Object.values({
        ...IDPersonalList,
        [keys]: event.target.value,
      }).reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
      }, "");
      onChnageIDPersanal(convertObjToIDFormat);
    }
  };

  const inputfocus = (keys, element) => {
    ///กรณี กดลบเลข
    if (element.key === "Delete" || element.key === "Backspace") {
      const next = element.target.tabIndex - 2;
      if (next > -1) {
        element.target.form.elements[next].focus();
      }
    }

    ///กรณี กดกรอกตัวเลข และต้องเป็น format ตัวเลขเท่านั้น
    if (pattern.test(element.key)) {
      setIDPersonalList({ ...IDPersonalList, [keys]: element.key });

      const next = element.target.tabIndex;
      if (next < 13) {
        element.target.form.elements[next].focus();
      }
    }
  };

  return (
    <Form>
      <div className="id-personal-container">
        <Input
          name="code1"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code1 ? IDPersonalList.code1 : ""
          }
          onChange={(e) => handleChange("code1", e)}
          tabIndex="1"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code1", e)}
          disabled={disabled}
        />

        <hr className="line" />

        <Input
          name="code2"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code2 ? IDPersonalList.code2 : ""
          }
          onChange={(e) => handleChange("code2", e)}
          tabIndex="2"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code2", e)}
          disabled={disabled}
        />

        <Input
          name="code3"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code3 ? IDPersonalList.code3 : ""
          }
          onChange={(e) => handleChange("code3", e)}
          tabIndex="3"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code3", e)}
          disabled={disabled}
        />

        <Input
          name="code4"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code4 ? IDPersonalList.code4 : ""
          }
          onChange={(e) => handleChange("code4", e)}
          tabIndex="4"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code4", e)}
          disabled={disabled}
        />

        <Input
          name="code5"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code5 ? IDPersonalList.code5 : ""
          }
          onChange={(e) => handleChange("code5", e)}
          tabIndex="5"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code5", e)}
          disabled={disabled}
        />

        <hr className="line" />

        <Input
          name="code6"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code6 ? IDPersonalList.code6 : ""
          }
          onChange={(e) => handleChange("code6", e)}
          tabIndex="6"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code6", e)}
          disabled={disabled}
        />

        <Input
          name="code7"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code7 ? IDPersonalList.code7 : ""
          }
          onChange={(e) => handleChange("code7", e)}
          tabIndex="7"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code7", e)}
          disabled={disabled}
        />

        <Input
          name="code8"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code8 ? IDPersonalList.code8 : ""
          }
          onChange={(e) => handleChange("code8", e)}
          tabIndex="8"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code8", e)}
          disabled={disabled}
        />

        <Input
          name="code9"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code9 ? IDPersonalList.code9 : ""
          }
          onChange={(e) => handleChange("code9", e)}
          tabIndex="9"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code9", e)}
          disabled={disabled}
        />

        <Input
          name="code10"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code10 ? IDPersonalList.code10 : ""
          }
          onChange={(e) => handleChange("code10", e)}
          tabIndex="10"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code10", e)}
          disabled={disabled}
        />

        <hr className="line" />

        <Input
          name="code11"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code11 ? IDPersonalList.code11 : ""
          }
          onChange={(e) => handleChange("code11", e)}
          tabIndex="11"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code11", e)}
          disabled={disabled}
        />

        <Input
          name="code12"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code12 ? IDPersonalList.code12 : ""
          }
          onChange={(e) => handleChange("code12", e)}
          tabIndex="12"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code12", e)}
          disabled={disabled}
        />

        <hr className="line" />

        <Input
          name="code13"
          type="text"
          autoComplete="off"
          className="id-personal-input"
          value={
            IDPersonalList && IDPersonalList.code13 ? IDPersonalList.code13 : ""
          }
          onChange={(e) => handleChange("code13", e)}
          tabIndex="13"
          maxLength="1"
          onKeyUp={(e) => inputfocus("code13", e)}
          disabled={disabled}
        />
      </div>
    </Form>
  );
}
