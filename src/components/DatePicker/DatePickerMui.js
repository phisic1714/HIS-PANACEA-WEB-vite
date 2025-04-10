import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import moment from "moment";
import OverwriteMomentBE from "./OverwriteMomentBE";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField, InputAdornment } from "@material-ui/core";
import styled from "styled-components";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Icon } from "@iconify/react";
import bxCalendarAlt from '@iconify/icons-bx/bx-calendar-alt';

import { Form } from "antd";
export default forwardRef(function DatePickerMui(
  {
    // initialValue=null,
    form,
    name,
    defaultDate = null, //"30/01/2022"
    disabled = false,
    required = false,
    label = "",
    placeholder = "เลือกวันที่",
    minDate = undefined, //"30/01/2022"
    maxDate = undefined, //"30/01/2022"
    onChangeDate,
    onChange,
    clearable = true,
    height = "30px",
    mb = "default",
    bordercolor = "#d9d9d9",
    list = {
      name: "",
      index: null,
      field: "",
    },
  },
  ref
) {
  const { dialogDatePicker } = useStyles();
  const [selectedDate, setSelectedDate] = useState(null);

  useImperativeHandle(ref, () => ({
    getDate: () => convertObjDate(selectedDate?.format("DD/MM/YYYY")),
  }));

  useEffect(() => {
    if (list.name) {
      form?.setFields([
        {
          name: [list.name, list.index, list.field],
          value: defaultDate
            ? moment(defaultDate, "DD/MM/YYYY")
              .add(0, "years")
              .format("DD/MM/YYYY")
            : form.getFieldValue([list.name, list.index, list.field])
              ? moment(
                form.getFieldValue([list.name, list.index, list.field]),
                "DD/MM/YYYY"
              )
                .add(0, "years")
                .format("DD/MM/YYYY")
              : null,
        },
      ]);
    } else {
      form?.setFieldsValue({
        [name]: defaultDate
          ? moment(defaultDate, "DD/MM/YYYY")
            .add(0, "years")
            .format("DD/MM/YYYY")
          : null,
      });
    }

    setSelectedDate(
      defaultDate ? moment(defaultDate, "DD/MM/YYYY").add(0, "years") : null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDate]);

  const handleDateChange = (date) => {
    if (list.name) {
      form?.setFields([
        {
          name: [list.name, list.index, list.field],
          value: date ? date.format("DD/MM/YYYY") : null,
        },
      ]);
      onChangeDate?.(
        convertObjDate(
          form?.getFieldValue(list?.name)[list.index]?.[list.field]
        )
      );
    } else {
      form?.setFieldsValue({
        [name]: date ? date.format("DD/MM/YYYY") : null,
      });
      onChangeDate?.(convertObjDate(form?.getFieldValue(`${name}`)));
      onChange?.(date);
    }

    setSelectedDate(date);
  };

  const convertObjDate = (date) => {
    if (date) {
      return {
        dateEN: date,
        dateTH: moment(date, "DD/MM/YYYY")
          .add(543, "year")
          .format("DD/MM/YYYY"),
      };
    } else {
      return {
        dateEN: null,
        dateTH: null,
      };
    }
  };

  //   const NewDate = new OverwriteMomentBE();
  //   NewDate.toBuddhistYear(moment(), "DD/MM/YYYY");
  //   console.log("NewDate", NewDate);

  const renderInput = (props) => {
    return (
      <StyledTextField
        height={height}
        bordercolor={bordercolor}
        type="text"
        variant="outlined"
        fullWidth
        disabled={props.disabled}
        placeholder={placeholder}
        onClick={props.onClick}
        value={props.value}
        onChange={props.onChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Icon icon={bxCalendarAlt} width="15" height="15" />
            </InputAdornment>
          ),
        }}
      />
    );
  };

  return (
    <Form.Item
      // initialValue={initialValue}
      style={{ marginBottom: mb }}
      name={name ? name : "datePicker"}
      label={label}
      rules={
        required
          ? [
            {
              required: true,
              message: "กรุณาเลือกวันที่",
            },
          ]
          : []
      }
    >
      <MuiPickersUtilsProvider utils={OverwriteMomentBE} locale="th">
        <DatePicker
          format="DD/MM/YYYY"
          value={selectedDate}
          DialogProps={{ className: dialogDatePicker }}
          onChange={(date) => handleDateChange(date)}
          onChangeDate
          disabled={disabled}
          TextFieldComponent={renderInput}
          clearable={clearable}
          clearLabel={<label style={StyledLabel}>ล้างค่า</label>}
          cancelLabel={<label style={StyledLabel}>ยกเลิก</label>}
          okLabel={<label style={StyledLabel}>ตกลง</label>}
          minDate={
            minDate ? moment(minDate, "DD/MM/YYYY").add(0, "years") : undefined
          }
          maxDate={
            maxDate ? moment(maxDate, "DD/MM/YYYY").add(0, "years") : undefined
          }
        />
      </MuiPickersUtilsProvider>
    </Form.Item>
  );
});

const useStyles = makeStyles(() =>
  createStyles({
    dialogDatePicker: {
      "& .MuiPickersToolbar-toolbar": {
        backgroundColor: "var(--primary-color)",
      },
      "& .MuiPickersDay-daySelected": {
        backgroundColor: "var(--primary-color)",
      },
      "& .MuiPickersCalendarHeader-dayLabel": {
        fontFamily: "NoirPro, sans-serif",
      },
      "& .MuiTypography-root": {
        fontFamily: "NoirPro, sans-serif",
      },
    },
  })
);

const StyledTextField = styled(TextField)`
  .MuiInputBase-input.Mui-disabled, .MuiInputBase-root.Mui-disabled {
    background: #f5f5f5;
    border-color: #d9d9d9 !important;
    color: #545454;
    cursor: not-allowed;
  }
  .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline {
    border-color: #d9d9d9 !important;
  }
  .MuiOutlinedInput-notchedOutline {
    top: 0px !important;
    border-color: ${(props) => props.bordercolor};
  }
  .MuiInputBase-root {
    background-color: #fff;
  },
  .MuiOutlinedInput-input {
    padding: 0px 0px;
    font-size: 14px;
    font-family: NoirPro, sans-serif;
    height: ${(props) => props.height};
    text-indent: 12px;
  },
  .MuiOutlinedInput-root {
    border-radius: 6px;
    .fieldset {
      border: 1px solid #d9d9d9 !important;
      color: #545454;
    },
    .PrivateNotchedOutline-root-2{
      top: 0px;
    }
    &:hover fieldset {
      /* border-color: #27e040; */
      border-color: ${(props) => (props?.disabled ? "#d9d9d9" : "var(--primary-color)")};
    },
    &.Mui-focused fieldset {
      border-color: var(--primary-color);
      border-width: 1px;
    },
    
  }
 
`;

const StyledLabel = {
  color: "var(--primary-color)",
  fontFamily: "NoirPro, sans-serif",
};
