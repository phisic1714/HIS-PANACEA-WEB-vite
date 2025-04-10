import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Checkbox, Col, Collapse, Form, Radio, Row } from "antd"
import { LabelTopicPrimary } from "../helper/function/GenLabel";
import axios from "axios";
import { env } from 'env';
import { map } from "lodash";

const { Panel } = Collapse;

export default forwardRef(function PregnantFlag({
  serviceId,
  updateService = false,
  setUpdateService = () => { },
  onValuesChange = () => { },
  initialValues = {},
  opdClinicDetails = null,
  ...props
}, ref) {
  const [form] = Form.useForm();

  const RadioList = (index) => {

    //Checkbox
    const optionsCheckbox = [
      {
        name: "urgentFlag",
        label: "ฉุกเฉิน",
      },
      {
        name: "accidentFlag",
        label: "อุบัติเหตุ",
      },
      {
        name: "conceledFlag",
        label: "ผู้ป่วยคดี",
      },
      {
        name: "observeFlag",
        label: "ผู้ป่วยเฝ้าระวัง",
      },
    ]

    //Radio
    const optionsRadio = [{
      value: "P",
      label: "ตั้งครรภ์?",
      className: "data-value"
    }, {
      value: "N",
      label: "ให้นมบุตร?",
      className: "data-value"
    },]


    return (
      <Collapse defaultActiveKey={['1']} className='mb-2 mt-2' style={{ border: "0px" }}>
        <Panel header={<LabelTopicPrimary text='ผู้ป่วยเป็นหญิงตั้งครรภ์' />} key="1">
          <Form form={form} onFinish={onFinish} onValuesChange={onValuesChange}>
            <Row gutter={[4, 4]} style={{ flexDirection: "row", marginLeft: 5 }}>
              {optionsCheckbox.map(item => {
                const styles = { color: opdClinicDetails?.[item?.name] ? "green" : "" }
                return <Col span={8} key={item.name}>
                  <Form.Item
                    className="mb-0"
                    name={item.name}
                    valuePropName="checked"
                  >
                    <Checkbox>
                      <label style={styles}>{item.label}</label>
                    </Checkbox>
                  </Form.Item>
                </Col>
              })}
              <Col span={16}>
                <Form.Item className="mb-0" name="pregnantFlag">
                  <Radio.Group>
                    {map(optionsRadio, o => {
                      return <Radio
                        style={{ color: opdClinicDetails?.pregnantFlag ? "green" : "" }}
                        onClick={e => {
                          const pregnantFlag = form.getFieldValue("pregnantFlag")
                          form.setFieldsValue({ pregnantFlag: e.target.value === pregnantFlag ? null : e.target.value })
                        }}
                        key={o.value}
                        value={o.value}>{o.label}</Radio>
                    })}
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    )
  }

  const onFinish = async (v) => {
    const req = {
      requestData: {
        serviceid: serviceId,
        urgentFlag: v.urgentFlag ? "Y" : null,
        accidentFlag: v.accidentFlag ? "Y" : null,
        conceledFlag: v.conceledFlag ? "Y" : null,
        pregnantFlag: v.pregnantFlag ? v.pregnantFlag : null,
        observeFlag: v.observeFlag ? "Y" : null,
      },
    }
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdServices/UpdOpdservice`, req);
    if (res.isSuccess) {
      setUpdateService(false)
    } else {
      setUpdateService()
    }
    return res
  }

  useImperativeHandle(ref, () => ({
    getForm: () => form.getFieldValue(),
  }));

  useEffect(() => {
    // if (updateService) form.submit()
  }, [updateService, form])

  useEffect(() => {
    if (initialValues) {
      // console.log('firinitialValuesst', initialValues)
      form.setFieldsValue({
        urgentFlag: initialValues?.urgentFlag === "Y",
        accidentFlag: initialValues?.accidentFlag === "Y",
        conceledFlag: initialValues?.conceledFlag === "Y",
        pregnantFlag: initialValues?.pregnantFlag || null,
        observeFlag: initialValues?.observeFlag === "Y",
      });
    }
  }, [initialValues]);

  return (
    <>
      {RadioList()}
    </>
  )
})
