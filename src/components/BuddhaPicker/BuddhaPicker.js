
import { useEffect, useRef, useState } from "react";
import {
  ConfigProvider,
  Input,
  notification,
} from "antd";
import moment from "moment";
// eslint-disable-next-line no-unused-vars
import dayjs from "dayjs";
import React from "react";

import generatePicker from "antd/es/date-picker/generatePicker";
import momentConfig from "rc-picker/lib/generate/moment";

import "dayjs/locale/th";
import "moment/locale/th";

// import { RangePicker } from './components/RangePicker'

import th from "antd/es/locale/th_TH";
import enUS from "antd/es/locale/en_US";
import { CloseCircleFilled } from "@ant-design/icons";

export default function BuddhaPicker(prop) {
  // console.log(prop);
  const [lang,] = useState(
    prop.lang?.toLowerCase() === "th" ? th : enUS
  );
  const [valueDate, setValueDate] = useState("");
  const [dateString, setDateString] = useState("");
  const ref = useRef();

  // console.log(ref);
  // const [formatDayJS, setFormat] = useState(
  //   lang.locale === "en" ? "DD-MM-YYYY" : "DD-MM-BBBB"
  // );

  // const [lang, setLang] = useState(enUS);

  useEffect(() => {
    if (prop.lang?.toLowerCase() === "th") {
      moment.locale("th");
    } else {
      moment.locale("en");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const changeLocale = (e) => {
  //   // e.preventDefault()
  //   const localeValue = e.target.value;

  //   moment.locale(localeValue.locale);
  //   dayjs.locale(localeValue.locale);

  //   setFormat(localeValue.locale === "en" ? "DD-MM-YYYY" : "DD-MM-BBBB");
  //   setLang(localeValue);
  // };

  const localeDay = JSON.parse(JSON.stringify(lang));
  const dayjsLang = { ...localeDay.Calendar.lang };
  dayjsLang.yearFormat = moment.locale() === "th" ? "BBBB" : "YYYY";

  localeDay.Calendar.lang = dayjsLang;
  localeDay.DatePicker.lang = dayjsLang;

  const oldFormat = moment.prototype.format;

  moment.prototype.format = function (format) {
    const result = format.replace("BBBB", this._d.getFullYear() + 543);
    return oldFormat.bind(this)(result);
  };

  moment.prototype.year = function (input) {
    const yearBias = moment.locale() === "th" ? 543 : 0;
    const annoYear = this._d.getFullYear();

    const bdyear = annoYear + yearBias;

    if (!input) return bdyear;

    const diff = -(bdyear - input);

    return this.add(diff, "year");
  };

  // console.log(moment.locale());

  const MomentDatePicker = generatePicker(momentConfig);

  return (
    <div className="App">
      <header className="App-header">
        <ConfigProvider locale={localeDay}>
          {valueDate ? (
            <Input
              autoFocus
              suffix={
                <CloseCircleFilled
                  onClick={() => {
                    setValueDate("");
                    setDateString("");
                  }}
                />
               }
              style={{ width: "100%" }}
              value={valueDate}
              onChange={(e) => setValueDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (valueDate.length === 10 && valueDate.split("-")[2]) {
                    if (parseInt(valueDate.split("-")[2]) > 2200) {
                      valueDate.split("-")[2] = (
                        parseInt(valueDate.split("-")[2]) - 543
                      ).toString();
                      var checkValue = "";
                      for (let i = 0; i < valueDate.split("-").length; i++) {
                        if (i === 2) {
                          checkValue += (
                            parseInt(valueDate.split("-")[2]) - 543
                          ).toString();
                        } else {
                          checkValue += valueDate.split("-")[i];
                          checkValue += "-";
                        }
                      }
                      // console.log(checkValue);
                    } else {
                      for (let i = 0; i < valueDate.split("-").length; i++) {
                        if (i === 2) {
                          checkValue += valueDate.split("-")[i];
                        } else {
                          checkValue += valueDate.split("-")[i];
                          checkValue += "-";
                        }
                      }
                    }

                    setDateString(checkValue);
                    setValueDate("");
                  } else {
                    notification["error"]({
                      message: "กรุณากรอกรูปแบบวันที่ให้ถูกต้อง",
                    });
                  }
                }
              }}
            />
          ) : (
            <MomentDatePicker
              style={{ width: "150px" }}
              // renderExtraFooter={() => (
              //   <Radio.Group
              //     style={{
              //       display: "flex",
              //       justifyContent: "center",
              //       alignItems: "center",
              //       margin: "auto",
              //     }}
              //     value={lang}
              //     onChange={changeLocale}
              //   >
              //     <Radio.Button style={{margin: "auto 0"}} key="en" value={enUS}>
              //       คริสศักราช
              //     </Radio.Button>
              //     <Radio.Button style={{margin: "auto 0"}} key="th" value={th}>
              //       พุทธศักราช
              //     </Radio.Button>
              //   </Radio.Group>
              // )}
              {...prop}
              allowClear
              onChange={(e, v) => {
                setDateString(e);
              }}
              onKeyDown={(e) => setValueDate(e.target.value)}
              value={dateString ? moment(dateString, "DD-MM-YYYY") : null}
              // inputReadOnly={true}
              ref={ref}
              // inputRender={() => (
              //   <>
              //   <Input />
              //   <DatePicker />

              //   </>
              // )}
            />
          )}
          {/* <RangePicker onChange={onChange} format={formatDayJS} /> */}
        </ConfigProvider>
      </header>
    </div>
  );
}
