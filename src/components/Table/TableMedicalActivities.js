import React, { useState, useEffect } from 'react'
import { filter, map } from "lodash";
import { callApis } from 'components/helper/function/CallApi';
import { mappingOptions } from "components/helper/function/MappingOptions";
import { Spin, Table, Form, Row, Col, Button, Select, Input, Popconfirm } from "antd"
import { LabelTopicPrimary } from 'components/helper/function/GenLabel';
import { notiSuccess, notiError } from "components/Notification/notificationX";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import SelectMasterIcd9 from 'components/Input/SelectMasterIcd9'
import SelectMasterIcd10 from 'components/Input/SelectMasterIcd10'
export default function TableMedicalActivities({
  clinicId = null,
  reload = false,
  form,
  onFinish = () => { },
  onValuesChange = () => { },
  size = "small",
}) {
  // State
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState({
    activity: [],
  })
  // Funcs
  const getOptions = async () => {
    let [
      GetTBMMedicalactivities,
    ] = await Promise.all([
      callApis(apis["GetTBMMedicalactivities"])
    ])
    GetTBMMedicalactivities = mappingOptions({ dts: GetTBMMedicalactivities })
    setOptions(p => ({
      ...p,
      activity: GetTBMMedicalactivities,
    }));
  }
  const getMedicalactivities = async () => {
    if (!clinicId) return
    const req = { clinicId }
    setLoading(p => !p)
    const res = await callApis(apis["GetMedicalactivities"], req)
    setLoading(p => !p)
    // console.log('getMedicalactivities :>> ', res);
    form.setFieldsValue({
      activities: res
    })
  }
  const deleteItem = async (record) => {
    if (!record?.medAId) {
      const dts = form.getFieldValue('activities')
      const filterNoCrr = filter(dts, (o, i) => i !== Number(record.key))
      form.setFieldsValue({ activities: filterNoCrr })
      return
    }
    setLoading(p => !p)
    const res = await callApis(apis["DeleteMedicalactivities"], record.medAId)
    setLoading(p => !p)
    if (res?.isSuccess) {
      notiSuccess({ message: "ลบรายการ" })
      getMedicalactivities()
    } else notiError({ message: "ลบรายการ" })
  }
  // Handle
  const handleChangeForm = (i) => {
    form.setFields([
      { name: ["activities", i, "isEdit"], value: true },
    ]);
  }
  useEffect(() => {
    getOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    getMedicalactivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, reload])

  const TableHeader = (add) => {
    return (
      <Row
        gutter={[8, 8]}
        style={{
          flexDirection: "row",
          marginBottom: 4,
        }}
        align="middle"
      >
        <Col span={12}><LabelTopicPrimary text='กิจกรรมที่ดำเนินการ' /></Col>
        <Col span={12} className="text-end">
          <Button
            size={size}
            type="primary"
            style={{ margin: 0 }}
            icon={<PlusOutlined />}
            disabled={!clinicId}
            onClick={() => {
              add({ medAId: null })
            }}
          />
        </Col>
      </Row>
    );
  };
  const PartsForm = () => {
    const selectProps = {
      size: 'small',
      style: { width: "100%" },
      className: "data-value",
      dropdownMatchSelectWidth: 345,
      showSearch: true,
      allowClear: true,
      optionFilterProp: "label",
    }
    const renderFormItem = ({ index, name, input }) => {
      return <div style={{ marginLeft: -4, marginRight: -4, marginBottom: -8, marginTop: -8 }}>
        <Form.Item
          name={[index, name]}
          style={{ margin: 0 }}
        >
          {input}
        </Form.Item>
      </div>
    }
    const columns = [
      {
        title: "กิจกรรม",
        // width:,
        render: (v, r, i) => {
          // console.log('r :>> ', r);
          return <>
            <div hidden>
              <Form.Item name={[i, "key"]}><Input /></Form.Item>
              <Form.Item name={[i, "medAId"]}><Input /></Form.Item>
              <Form.Item name={[i, "userCreated"]}><Input /></Form.Item>
              <Form.Item name={[i, "dateCreated"]}><Input /></Form.Item>
            </div>
            {renderFormItem({
              index: i,
              name: "activity",
              input: <Select
                {...selectProps}
                options={options.activity}
                onChange={() => { handleChangeForm(i) }}
              />,
            })
            }
          </>
        }
      },
      {
        title: "ICD10",
        width: 85,
        render: (v, r, i) => renderFormItem({
          index: i,
          name: "icd10",
          input: <SelectMasterIcd10 size='small' value={r.icd10} onChange={() => handleChangeForm(i)} />
        }),
      },
      {
        title: "ICD9",
        width: 85,
        render: (v, r, i) => renderFormItem({
          index: i,
          name: "icd9",
          input: <SelectMasterIcd9 size='small' value={r.icd9} onChange={() => handleChangeForm(i)} />
        }),
      },
      {
        title: "",
        dataIndex: "medAId",
        width: 55,
        align: "center",
        render: (v, r, i) => {
          return <>
            <Popconfirm
              title="ลบจากระบบ ?"
              onConfirm={() => deleteItem(r)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                style={{ margin: 0 }}
                size={size}
                type='default'
                icon={<DeleteOutlined className='text-danger' />}
                onClick={e => {
                  e.stopPropagation()
                }}
              />
            </Popconfirm>
          </>
        }
      }
    ]
    return <Form form={form} onFinish={onFinish} layout="vertical" onValuesChange={onValuesChange}>
      <Form.List name={"activities"}>
        {(list, { add, remove }) => {
          let formValues = form.getFieldsValue();
          // console.log('formValues :>> ', formValues);
          let dts = formValues?.activities || [];
          list = map(list, (val, i) => {
            let crrRow = dts[i];
            return {
              ...crrRow,
              ...val,
              key: String(i),
            };
          });
          // console.log('listFinance :>> ', listFinance);
          return (
            <Spin spinning={loading}>
              {TableHeader(add)}
              <div hidden={!list.length}>
                <Table
                  size="small"
                  rowClassName="data-value"
                  scroll={{ y: 240 }}
                  dataSource={list}
                  columns={columns}
                  pagination={false}
                />
              </div>
              <div className="text-center" hidden={list.length} style={{ backgroundColor: "#fafafa" }}>
                <label style={{ color: "#BDBDBD" }}>ไม่มีข้อมูล</label>
              </div>
            </Spin>
          );
        }}
      </Form.List>
    </Form>
  }
  return <Spin spinning={loading}>
    {PartsForm()}
  </Spin>
}

const apis = {
  GetMedicalactivities: {
    url: "Homevisit/GetMedicalactivities",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
  GetIcd9: {
    url: "AdminSystem/Expenses/GetListIcd9CM",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  GetIcd10: {
    url: "AdminSystem/Expenses/GetListIcd10",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  GetTBMMedicalactivities: {
    url: "Homevisit/GetTBMMedicalactivities",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  DeleteMedicalactivities: {
    url: "Homevisit/DeleteMedicalactivities/",
    method: "DELETE",
    return: "data",
    sendRequest: false,
  },
}
