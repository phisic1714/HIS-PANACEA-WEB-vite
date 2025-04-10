import React, { useState, useEffect } from "react";
import { ReactFormBuilder } from "react-form-builder2"; //"react-form-builder2": "^0.4.2",  "jquery": "^3.6.0",
import "react-form-builder2/dist/app.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./form-builder.less";
import { Button, Row, Col, Modal } from "antd";

var items = [
  {
    key: "Header",
    name: "Header Text",
    icon: "fa fa-header",
    static: true,
    content: "Placeholder Text...",
  },
  {
    key: "Label",
    name: "Label",
    static: true,
    icon: "fa fa-font",
    content: "Placeholder Text...",
  },
  // {
  //   key: "Paragraph",
  //   name: "Paragraph",
  //   static: true,
  //   icon: "fa fa-paragraph",
  //   content: "Placeholder Text...",
  // },
  {
    key: "LineBreak",
    name: "Line Break",
    static: true,
    icon: "fa fa-arrows-h",
  },
  // {
  //   key: "Dropdown",
  //   canHaveAnswer: true,
  //   name: "Dropdown",
  //   icon: "fa fa-caret-square-o-down",
  //   label: "Placeholder Label",
  //   field_name: "dropdown_",
  //   options: [],
  // },
  {
    key: "Tags",
    canHaveAnswer: true,
    name: "Select",
    icon: "fa fa-caret-square-o-down",
    label: "Placeholder Label",
    field_name: "tags_",
    placeholder: "Please use a full name...",

    options: [],
  },
  {
    key: "Checkboxes",
    canHaveAnswer: true,
    name: "Checkboxes",
    icon: "fa fa-check-square-o",
    label: "Placeholder Label",
    field_name: "checkboxes_",
    options: [],
  },
  {
    key: "RadioButtons",
    canHaveAnswer: true,
    name: "Multiple Choice",
    icon: "fa fa-dot-circle-o",
    label: "Placeholder Label",
    field_name: "radiobuttons_",
    options: [],
  },
  {
    key: "TextInput",
    canHaveAnswer: true,
    name: "Text Input",
    label: "Placeholder Label",
    icon: "fa fa-font",
    field_name: "text_input_",
  },
  {
    key: "NumberInput",
    canHaveAnswer: true,
    name: "Number Input",
    label: "Placeholder Label",
    icon: "fa fa-plus",
    field_name: "number_input_",
  },
  {
    key: "TextArea",
    canHaveAnswer: true,
    name: "Multi-line Input",
    label: "Placeholder Label",
    icon: "fa fa-text-height",
    field_name: "text_area_",
  },
  {
    key: "Image",
    name: "Image",
    label: "",
    icon: "fa fa-photo",
    field_name: "image_",
    src: "",
  },
  // {
  //   key: "Rating",
  //   canHaveAnswer: true,
  //   name: "Rating",
  //   label: "Placeholder Label",
  //   icon: "fa fa-star",
  //   field_name: "rating_",
  // },
  {
    key: "DatePicker",
    canDefaultToday: true,
    canReadOnly: true,
    dateFormat: "MM/dd/yyyy",
    timeFormat: "hh:mm aa",
    showTimeSelect: false,
    showTimeSelectOnly: false,
    name: "Date",
    icon: "fa fa-calendar",
    label: "Placeholder Label",
    field_name: "date_picker_",
  },
  // {
  //   key: "Signature",
  //   canReadOnly: true,
  //   name: "Signature",
  //   icon: "fa fa-pencil-square-o",
  //   label: "Signature",
  //   field_name: "signature_",
  // },
  // {
  //   key: "HyperLink",
  //   name: "Web site",
  //   icon: "fa fa-link",
  //   static: true,
  //   content: "Placeholder Web site link ...",
  //   href: "http://www.example.com",
  // },
  {
    key: "Download",
    name: "File Attachment",
    icon: "fa fa-file",
    static: true,
    content: "Placeholder file name ...",
    field_name: "download_",
    file_path: "",
    _href: "",
  },
  // {
  //   key: "Range",
  //   name: "Range",
  //   icon: "fa fa-sliders",
  //   label: "Placeholder Label",
  //   field_name: "range_",
  //   step: 1,
  //   default_value: 3,
  //   min_value: 1,
  //   max_value: 5,
  //   min_label: "Easy",
  //   max_label: "Difficult",
  // },
  // {
  //   key: "Camera",
  //   name: "Camera",
  //   icon: "fa fa-camera",
  //   label: "Placeholder Label",
  //   field_name: "camera_",
  // },
];

export default function FormBuilder({
  defaultValue,
  isModalVisible = false,
  handleCancel,
  handleSaveFrom,
}) {
  const [formData, setFormData] = useState([]);

  useEffect(() => {
    if (defaultValue.length > 0) {
      onLoad();
    }
  }, [defaultValue]);

  const onLoad = () => {
    console.log(" Load From Data", defaultValue);
    return new Promise((resolve, reject) => {
      resolve(defaultValue);
    });
  };

  const onPost = (data) => {
    console.log("Post Data", data);
    setFormData(data);
  };

  const onSaveFrom = () => {
    console.log("formData", formData);
  };

  return (
    <Modal
      title="สร้าง Template ใบรับรองแพทย์"
      visible={isModalVisible}
      closable={false}
      width={1000}
      footer={[
        <Button key="back" onClick={handleCancel}>
          ยกเลิก
        </Button>,
        <Button form="dental" key="submit" type="primary" onClick={onSaveFrom}>
          บันทึก
        </Button>,
      ]}
    >
      <ReactFormBuilder toolbarItems={items} onPost={onPost} onLoad={onLoad} />
    </Modal>
  );
}
