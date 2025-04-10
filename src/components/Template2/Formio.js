///http://formio.github.io/formio.js/app/examples/custombuilder.html >>> document
import React, { useState, useEffect } from "react";
import { FormBuilder, Components } from "react-formio";
import "formiojs/dist/formio.full.css";
import "./form-io.less";
import { Button, Row, Col, Modal } from "antd";
import textCustomComp from "./Custom/Text/index";
import radioInputCustomComp from "./Custom/RedioInput/index";
import { config } from "./config";

Components.setComponents(textCustomComp);
Components.setComponents(radioInputCustomComp);

export default function Formio({
  defaultValue = [],
  isModalVisible = false,
  handleCancel,
  handleSaveFrom,
  options = config,
}) {
  const [formData, setFormData] = useState([]);

  useEffect(() => {
    setFormData(defaultValue);
  }, [defaultValue]);

  const onSaveFrom = () => {
    console.log("formData", formData);
    handleSaveFrom?.(convertFromData(formData));
  };

  const convertFromData = (components) => {
    if (components.length > 0) {
      return components.map((item) => {
        return {
          label: item.label,
          tableView: item.tableView,
          key: item.key,
          type: item.type,
          input: item.input,
          placeholder: item.placeholder,
          validate: item.validate,
          value: item.value || item.data || item.values,
        };
      });
    } else {
      return [];
    }
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
          บั นทึก
        </Button>,
      ]}
    >
      {/* <Row>
              <Col span={20} />
              <Col span={4}>
                <Button onClick={onSaveFrom} style={{ marginBottom: "0px" }} disabled={formData.length === 0}>
                  บันทึก
                </Button>
              </Col>
            </Row> */}
      <Row>
        <Col span={24}>
          <FormBuilder
            options={options}
            form={{
              display: "form",
              components: formData,
            }}
            onChange={(schema) => {
              setFormData(schema?.components);
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
}
