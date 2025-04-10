import { env } from '../../../env.js';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { DropdownPrescription } from "../../../routes/OpdClinic/Views/OpdDrugCharge";
import SelectSearchBold from 'components/Drug/SelectSearchBold';
import axios from 'axios';
export const GetExpenseSaline = async () => {
  let res = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Masters/GetExpenseSaline`).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};
const rules = [{
  required: true,
  message: "จำเป็น"
}]
export default function BrineOrder({
  visible,
  setVisible,
  brineList,
  dispatchBrineList,
  profileTypeSelected = null,
}) {
  console.log('profileTypeSelected', profileTypeSelected)
  const dropdownPrescription = useContext(DropdownPrescription);
  const [chkFocus, setChkFocus] = useState(null);
  const [expenseSalineList, setExpenseSalineList] = useState([]);
  const [form] = Form.useForm();
  const [drugUsingList, setDrugUsingList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const getExpenseSaline = async () => {
    let res = await GetExpenseSaline();
    if (res?.isSuccess) {
      setExpenseSalineList(res?.responseData || []);
    }
  };
  const defaultFormValue = () => {
    console.log(brineList, "brineList");
    form.setFieldsValue({
      dataList: brineList
    });
  };
  const getDropdownPrescription = async () => {
    if (dropdownPrescription?.getDropdownPrescription) {
      //Route
      setDrugUsingList(dropdownPrescription.drugUsingList);
      //Unit
      setUnitList(dropdownPrescription.unitList);
    }
  };
  const confirmBrineOrder = () => {
    console.log(form.getFieldValue("dataList"), "confirmBrineOrder");
    dispatchBrineList({
      type: "confirmBrineOrder",
      data: form.getFieldValue("dataList")
    });
    setVisible(false);
  };
  useEffect(() => {
    getExpenseSaline();
    defaultFormValue();
    return () => {
      setExpenseSalineList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    getDropdownPrescription();
    return () => {
      setDrugUsingList([]);
      setUnitList([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownPrescription]);
  return <Modal title={<Row align="middle" style={{
    position: "relative",
    margin: 0
  }}>
    <strong><label>สั่งรวมสารน้ำเกลือ</label></strong>
    <Button type="primary" style={{
      position: "absolute",
      right: 0,
      margin: 0 /* , paddingLeft:10, paddingRight:10, fontSize: "24px" */
    }}
      onClick={() => {
        let dataList = form.getFieldValue("dataList");
        form.setFieldsValue({
          dataList: [...dataList, {}]
        });
      }}
    >
      เพิ่มรายการ
    </Button>
  </Row>} centered visible={visible}
    // onCancel={()=>closeModal()}
    closable={false} width="1200px" footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setVisible(false);
      }}>
        ออก
      </Button>
      <Button key="ok" type="primary" onClick={confirmBrineOrder}>
        ตกลง
      </Button>
    </Row>]}>
    <Form form={form} layout='vertical'>
      <Form.List name="dataList" initialValue={[{}]}>
        {(fields,) => {
          return fields.map((val, index) => <Row key={index} style={{
            flexDirection: "row"
          }}>
            <Col span={8}>
              {chkFocus === index ? <Form.Item name={[index, "expenseId"]} label="ชนิดสารน้ำ">
                <SelectSearchBold placeholder="รหัสยา/ชื่อยา" dataList={expenseSalineList} form={form} name={["dataList", index, "expenseId"]} optionValue="datavalue" optionLabel="datadisplay" allowClear={true} style={{
                  width: '100%'
                }} showSearch notShowValue={true} onBlur={() => setChkFocus(null)} onChange={(value, option) => {
                  console.log(option, "option");
                  form.setFields([{
                    name: ["dataList", index, "expenseName"],
                    value: option?.label
                  }]);
                }} />
              </Form.Item> : <Form.Item name={[index, "expenseName"]} label="ชนิดสารน้ำ">
                <Input placeholder="รหัสยา/ชื่อยา" onMouseOver={() => setChkFocus(index)} />
              </Form.Item>}
            </Col>
            <Col span={4}>
              <Form.Item name={[index, "dose"]} label="ปริมาตร">
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name={[index, "dosingUnit"]} label="หน่วย">
                <Select allowClear={true} style={{
                  width: '100%'
                }} showSearch onChange={(value, option) => {
                  form.setFields([{
                    name: ["dataList", index, "dosingUnitName"],
                    value: option?.label
                  }]);
                }} optionFilterProp="label" options={unitList.map(n => ({
                  value: n.code,
                  label: n.name
                }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={[index, "drugUsing"]} label="วิธิใช้ยา">
                <SelectSearchBold dataList={drugUsingList} optionValue="code" optionLabel="name" form={form} name={["dataList", index, "drugUsing"]} allowClear={true} style={{
                  width: '100%'
                }} showSearch onChange={async (value, option) => {
                  form.setFields([{
                    name: ["dataList", index, "drugUsingName"],
                    value: option?.label
                  }]);
                }} />
              </Form.Item>
            </Col>
            {
              profileTypeSelected === "C"
                ? <Col span={24}>
                  <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    <Col span={4}>
                      <label className="gx-text-primary d-block">จำนวน Con</label>
                      <Form.Item
                        style={{ margin: 0, alignItems: "center" }}
                        name={[index, "qtyCon"]}
                        rules={rules}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          text={"center"}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <label className="gx-text-primary d-block">จำนวน Daily</label>
                      <Form.Item
                        style={{ margin: 0, alignItems: "center" }}
                        name={[index, "qty"]}
                        rules={rules}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          text={"center"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                : <Col span={24}>
                  <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                    {
                      profileTypeSelected === "H" && <Col span={12}>

                        <label className="gx-text-primary d-block">จำนวนวัน</label>
                        <Form.Item
                          style={{ margin: 0, alignItems: "center" }}
                          name={[index, "numOfDays"]}
                          rules={rules}
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            min={1}
                            text={"center"}
                          />
                        </Form.Item>
                      </Col>
                    }
                    <Col span={12}>
                      <label className="gx-text-primary d-block">จำนวน</label>
                      <Form.Item style={{
                        margin: 0,
                        alignItems: "center"
                      }}
                        name={[index, "qty"]}
                        rules={rules}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          // value={numOfDrugs !== "" ? numOfDrugs : ""}
                          text={"center"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
            }
          </Row>)
        }}
      </Form.List>
    </Form>
  </Modal>;
}