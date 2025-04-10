import { useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
import { map, find, filter, uniqBy, differenceBy, debounce } from "lodash";
// Redux
// import { dspIcd10It } from "../../appRedux/actions";
// Antd
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
} from "antd";
// Components
import FavoriteDiag from "../Modal/FavoriteDiag";
//Noti
import { notiWarning, notificationX as notiX } from "../Notification/notificationX";
// Functins
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { nanoid } from "nanoid";
import { callApi } from "../helper/function/CallApi";
import {
  labelTopicPrimary,
} from "../helper/function/GenLabel";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function TableIcd10({
  clinicId = null,
  reloadIcd = 0,
  form,
  onFinish = () => { },
  doctor = null,
  page = null,
  getOpdClinicDetails = () => { },
  icdLoading = (bool) => { console.log('bool :>> ', bool); },
  onValuesChange = () => { },
}) {

  const [IsDropDownLoaded, setIsDropDownLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listDiagType, setListDiagType] = useState([]);
  const [listDiagSide, setListDiagSide] = useState([]);
  const [loadingIcd10, setLoadingIcd10] = useState(false);
  const [listOpdDiag, setListOpdDiag] = useState([]);
  const [listOpdDiagDiffDoctor, setListOpdDiagDiffDoctor] = useState([]);
  const [optionsIcd10, setOptionsIcd10] = useState([])
  const [vsbFavoriteDiag, setVsbFavoriteDiag] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const getDD = async (name) => {
    let res = await callApi(listApi, name);
    res = map(res, (o) => {
      let value;
      let label;
      switch (name) {
        default:
          value = o.datavalue;
          label = o.datadisplay;
          break;
      }
      return {
        ...o,
        value: value,
        label: label,
      };
    });
    switch (name) {
      case "GetDiagTypes":
        setListDiagType(res);
        break;
      case "GetDiagSides":
        setListDiagSide(res);
        break;
      default:
        break;
    }
  };
  const delRow = async (crrIndex, crrRow) => {
    const listDiagnosis = form.getFieldValue("diagnosis") || [];
    const newData = filter(listDiagnosis, (o, i) => i !== crrIndex);
    if (!crrRow?.diagId) {
      form.setFieldsValue({
        diagnosis: newData,
      });
    }
    if (crrRow?.diagId) {
      setLoading(true);
      const res = await callApi(listApi, "DelOpdDiags", [crrRow]);
      notiX(res?.isSuccess, "ลบรหัสโรค");
      if (res?.isSuccess) {
        if (page === "30.3") {
          getOpdClinicDetails();
          getOpdDiags(clinicId);
        } else {
          form.setFieldsValue({ diagnosis: newData });
        }
      }
      setSelectedRowKeys([])
      setSelectedRows([])
      setLoading(false);
    }
  };
  const chkDiagTypePrincipal = ({
    index,
    diagDetail,
    listDiagnosis,
    filterNoCurrent,
    fieldName,
  }) => {
    let pd = find(listDiagType, ["dataother1", "1"]);
    let findDupIcd = find(filterNoCurrent, ["icd", diagDetail?.icd]);
    switch (fieldName) {
      case "icd":
        if (diagDetail?.pdx !== "Y") {
          form.setFields([
            { name: ["diagnosis", index, "icd"], value: diagDetail?.icd },
            { name: ["diagnosis", index, "diagType"], value: "2" },
          ]);
          if (findDupIcd) notiX(false, "ระบุ icd ซ้ำ", findDupIcd.icd);
          if (!listDiagnosis[index].diagnosis) {
            form.setFields([
              {
                name: ["diagnosis", index, "diagnosis"],
                value: diagDetail?.diagnosis,
              },
            ]);
          }
        }
        if (diagDetail?.pdx === "Y") {
          let findPrincipal = find(filterNoCurrent, [
            "diagType",
            pd?.datavalue,
          ]);
          if (findPrincipal) {
            notiX(
              false,
              "มีการคีย์รหัสโรคหลักแล้ว",
              "รหัสที่เลือก คีย์เป็นรหัสหลักได้เท่านั้น"
            );
            form.setFields([
              { name: ["diagnosis", index, "icd"], value: null },
            ]);
            return;
          } else {
            form.setFields([
              { name: ["diagnosis", index, "icd"], value: diagDetail?.icd },
              { name: ["diagnosis", index, "diagType"], value: pd?.datavalue },
            ]);
            if (findDupIcd) notiX(false, "ระบุ icd ซ้ำ", findDupIcd.icd);
            if (!listDiagnosis[index].diagnosis) {
              form.setFields([
                {
                  name: ["diagnosis", index, "diagnosis"],
                  value: diagDetail?.diagnosis,
                },
              ]);
            }
          }
        }
        break;
      case "diagnosis":
        if (diagDetail?.pdx !== "Y") {
          form.setFields([
            { name: ["diagnosis", index, "icd"], value: diagDetail?.icd },
            {
              name: ["diagnosis", index, "diagnosis"],
              value: diagDetail?.diagnosis,
            },
            { name: ["diagnosis", index, "diagType"], value: "2" },
          ]);
          if (findDupIcd) notiX(false, "ระบุ icd ซ้ำ", findDupIcd.icd);
        }
        if (diagDetail?.pdx === "Y") {
          let findPrincipal = find(filterNoCurrent, ["diagType", pd?.datavalue]);
          if (findPrincipal) {
            notiX(
              false,
              "มีการคีย์รหัสโรคหลักแล้ว",
              "รหัสที่เลือก คีย์เป็นรหัสหลักได้เท่านั้น"
            );
            form.setFields([
              { name: ["diagnosis", index, "icd"], value: null },
              { name: ["diagnosis", index, "diagnosis"], value: null },
            ]);
            return;
          } else {
            form.setFields([
              { name: ["diagnosis", index, "icd"], value: diagDetail?.icd },
              {
                name: ["diagnosis", index, "diagnosis"],
                value: diagDetail?.diagnosis,
              },
              { name: ["diagnosis", index, "diagType"], value: pd?.datavalue },
            ]);
            if (findDupIcd) notiX(false, "ระบุ icd ซ้ำ", findDupIcd.icd);
          }
        }
        break;
      default:
        break;
    }
  };
  const getOpdDiags = async (clinicId) => {
    if (!clinicId) return;
    setLoading(true);
    icdLoading(true)
    let req = { clinicId };
    let res = await callApi(listApi, "GetOpdDiags", req);
    let filterDiag = filter(res, "diagId");
    filterDiag = uniqBy(filterDiag, "diagId");
    filterDiag = map(filterDiag, (o) => {
      return {
        doctor: o.doctor,
        serviceId: o.serviceId,
        clinicId: o.clinicId,
        diagId: o.diagId,
        icd: o.icdD,
        diagnosis: o.diagnosis,
        diagType: o.diagType,
        diagSide: o.diagSide,
        workId: o.workId,
        key: nanoid(),
      };
    });
    setListOpdDiag(filterDiag);
    if (page === "30.3") {
      filterOpdDiagsByDoctor(doctor, filterDiag);
    } else {
      setListOpdDiag([]);
      setListOpdDiagDiffDoctor([]);
      form.setFieldsValue({ diagnosis: filterDiag });
    }
    setLoading(false);
    icdLoading(false)
  };

  const filterOpdDiagsByDoctor = (doctor, listOpdDiag) => {
    if (!doctor) return form.setFieldsValue({ diagnosis: [] });
    let filterByDoctor = filter(listOpdDiag, ["doctor", doctor]);
    let filterByDiffDoctor = filter(listOpdDiag, (o) => o.doctor !== doctor);
    setListOpdDiagDiffDoctor(filterByDiffDoctor);
    form.setFieldsValue({ diagnosis: filterByDoctor });
  };
  const handleDelSelectedRows = async () => {
    const listDiagnosis = form.getFieldValue("diagnosis");
    let newData = differenceBy(listDiagnosis, selectedRows, "key");
    const findDiagId = filter(selectedRows, "diagId")
    if (!findDiagId.length) {
      form.setFieldsValue({
        diagnosis: newData,
      });
    } else {
      setLoading(true);
      let res = await callApi(listApi, "DelOpdDiags", findDiagId);
      notiX(res?.isSuccess, "ลบรหัสโรค");
      if (res?.isSuccess) {
        if (page === "30.3") {
          getOpdClinicDetails();
          getOpdDiags(clinicId);
        } else {
          form.setFieldsValue({ diagnosis: newData });
        }
      }
      setLoading(false);
    }

  }
  useEffect(() => {
    getDD("GetDiagTypes");
  }, [])
  useEffect(() => {
    if (clinicId) {
      if (!IsDropDownLoaded) {
        setIsDropDownLoaded(true);
        getDD("GetDiagSides");
      }
    }
  }, [IsDropDownLoaded, clinicId]);
  useEffect(() => {
    getOpdDiags(clinicId);
  }, [reloadIcd, clinicId]);
  useEffect(() => {
    if (page === "30.3") {
      filterOpdDiagsByDoctor(doctor, listOpdDiag);
    }
  }, [doctor]);
  const debounceSearch = useMemo(() => {
    const onSearchIcd = async (keyword = "") => {
      if (!keyword) return
      if (keyword.length < 2) return notiWarning({ message: "ระบุคำค้นหา 2 ตัวอักษรขึ้นไป !" })
      const req = {
        "user": user,
        "codeset": "IT",
        "searhIcdAndDiagKey": keyword
      }
      setLoadingIcd10(p => !p)
      let res = await callApi(listApi, "GetIcdsRediagsNew", req);
      setLoadingIcd10(p => !p)
      res = map(res, (o, i) => {
        let key = String(i);
        return {
          key: key,
          value: key,
          icd: o.datavalue,
          label: `${o.datavalue} ${o.datadisplay}`,
          diagnosis: o?.datadisplay,
          className: "data-value",
          pdx: o.dataother1,
        };
      });
      setOptionsIcd10(res)
    }
    return debounce(onSearchIcd, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSelectIcd = (index, detail) => {
    form.setFields([
      { name: ["diagnosis", index, "isEdit"], value: true },
    ]);
    let pd = find(listDiagType, ["dataother1", "1"]);
    let formValues = form.getFieldsValue().diagnosis;
    let filterNoCurrent = filter(formValues, (o, i) => i !== index);
    if (!filterNoCurrent.length) {
      if (listOpdDiagDiffDoctor?.length) {
        chkDiagTypePrincipal({
          index: index,
          diagDetail: detail,
          listDiagnosis: formValues,
          filterNoCurrent: listOpdDiagDiffDoctor,
          fieldName: "icd",
        });
      } else {
        form.setFields([
          { name: ["diagnosis", index, "icd"], value: detail?.icd },
          {
            name: ["diagnosis", index, "diagType"],
            value: pd?.datavalue,
          },
        ]);
        // if (!formValues[index].diagnosis) {
        form.setFields([
          {
            name: ["diagnosis", index, "diagnosis"],
            value: detail?.diagnosis,
          },
        ]);
        // }
      }
    }
    if (filterNoCurrent.length) {
      chkDiagTypePrincipal({
        index: index,
        diagDetail: detail,
        listDiagnosis: formValues,
        filterNoCurrent: [
          ...filterNoCurrent,
          ...listOpdDiagDiffDoctor,
        ],
        fieldName: "icd",
      });
    }
  }
  const handleSelectDiagnosis = (index, detail) => {
    form.setFields([
      { name: ["diagnosis", index, "isEdit"], value: true },
    ]);
    let pd = find(listDiagType, ["dataother1", "1"]);
    let formValues = form.getFieldsValue().diagnosis;
    let filterNoCurrent = filter(formValues, (o, i) => i !== index);
    if (!filterNoCurrent.length) {
      if (listOpdDiagDiffDoctor?.length) {
        chkDiagTypePrincipal({
          index: index,
          diagDetail: detail,
          listDiagnosis: formValues,
          filterNoCurrent: listOpdDiagDiffDoctor,
          fieldName: "diagnosis",
        });
      } else {
        form.setFields([
          {
            name: ["diagnosis", index, "diagnosis"],
            value: detail.diagnosis,
          },
          {
            name: ["diagnosis", index, "diagType"],
            value: pd?.datavalue,
          },
        ]);
        // if (!formValues[index]?.icd) {
        form.setFields([
          { name: ["diagnosis", index, "icd"], value: detail.icd },
        ]);
        // }
      }
    }
    if (filterNoCurrent.length) {
      if (!formValues[index]?.icd) {
        chkDiagTypePrincipal({
          index: index,
          diagDetail: detail,
          listDiagnosis: formValues,
          filterNoCurrent: [
            ...filterNoCurrent,
            ...listOpdDiagDiffDoctor,
          ],
          fieldName: "diagnosis",
        });
      }
      if (formValues[index]?.icd) {
        form.setFields([
          {
            name: ["diagnosis", index, "diagnosis"],
            value: detail.diagnosis,
          },
        ]);
      }
    }
  }
  const columns = [
    {
      title: labelTopicPrimary("Diagnosis"),
      render: (v, r, i) => {
        return (
          <div>
            <Form.Item name={[i, "key"]} hidden><Input /></Form.Item>
            <Form.Item name={[i, "doctor"]} hidden><Input /></Form.Item>
            <Form.Item
              name={[i, "diagnosis"]}
              style={{ margin: 0 }}
            >
              <AutoComplete
                allowClear
                dropdownMatchSelectWidth={500}
                optionFilterProp="label"
                options={optionsIcd10}
                className="data-value"
                onKeyUp={(e) => debounceSearch(e.target.value)}
                onChange={() => {
                  form.setFields([
                    { name: ["diagnosis", i, "isEdit"], value: true },
                  ]);
                }}
                onSelect={(v, detail) => handleSelectDiagnosis(i, detail)}
                dropdownRender={menu => loadingIcd10 ? "กำลังค้นหา..." : menu}
              >
                <Input.TextArea
                  autoSize
                  style={{ width: "100%" }}
                  className="data-value"
                />
              </AutoComplete>
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: labelTopicPrimary("ICD10"),
      width: 100,
      render: (v, r, i) => {
        return (
          <div>
            <Form.Item
              name={[i, "icd"]}
              style={{ margin: 0 }}
            >
              <Select
                style={{ width: "100%" }}
                dropdownMatchSelectWidth={500}
                showSearch
                allowClear
                onKeyUp={e => debounceSearch(e.target.value)}
                loading={loadingIcd10}
                options={optionsIcd10}
                optionFilterProp="label"
                optionLabelProp="icd"
                className="data-value"
                dropdownRender={menu => loadingIcd10 ? "กำลังค้นหา..." : menu}
                onChange={(v, detail) => handleSelectIcd(i, detail)}
              />
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: labelTopicPrimary("Type"),
      width: 100,
      render: (v, r, i) => {
        return (
          <div>
            <Form.Item
              name={[i, "diagType"]}
              style={{ margin: 0 }}
            >
              <Select
                style={{ width: "100%" }}
                className="data-value"
                dropdownMatchSelectWidth={200}
                showSearch
                optionFilterProp="label"
                disabled={v?.diagType === "1"}
                onChange={() => {
                  form.setFields([
                    {
                      name: ["diagnosis", i, "isEdit"],
                      value: true,
                    },
                  ]);
                }}
              >
                {listDiagType.map(option => (
                  <Select.Option key={option.datadisplay} value={option.datavalue} disabled={option.datavalue === "1"}>
                    {option.datadisplay}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: labelTopicPrimary("ด้าน"),
      width: 100,
      render: (v, r, i) => {
        return (
          <div>
            <Form.Item name={[i, "diagSide"]} style={{ margin: 0 }}>
              <Select
                style={{ width: "100%" }}
                dropdownMatchSelectWidth={200}
                allowClear
                showSearch
                optionFilterProp="label"
                className="data-value"
                options={listDiagSide}
                onChange={() => {
                  form.setFields([
                    {
                      name: ["diagnosis", i, "isEdit"],
                      value: true,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: " ",
      width: 45,
      fixed: "right",
      render: (v, r, i) => {
        return (
          <Popconfirm
            title="ลบจากระบบ?"
            onConfirm={() => {
              delRow(i, r)

              let formValues = form.getFieldsValue();
              let diagnosis = formValues?.diagnosis.filter((v) => v.diagType) || [];
              const findPx = diagnosis.find((v) => v.diagType === "1")

              if (!diagnosis.length || findPx) return

              form.setFields([
                {
                  name: ["diagnosis", 0, "diagType"],
                  value: "1",
                },
              ]);
            }}
            onCancel={() => { }}
            okText="ลบ"
            cancelText="ปิด"
          >
            <Button
              style={{ margin: 0 }}
              size="small"
              icon={<DeleteOutlined style={{ color: "red" }} />}
            />
          </Popconfirm>
        );
      },
    },
  ];
  const TableHeader = (add,) => {
    return (
      <Row
        gutter={[8, 8]}
        style={{
          flexDirection: "row",
          marginBottom: 4,
        }}
        align="middle"
      >
        <Col span={14}>
          {labelTopicPrimary("วินิจฉัยโรคICD10")}
          <Popconfirm
            title="ลบจากระบบ ?"
            okText="ยืนยัน"
            cancelText="ปิด"
            onConfirm={() => handleDelSelectedRows()}
            disabled={!selectedRowKeys.length}
          >
            <Button
              type="danger"
              size="small"
              className="mb-0 ms-2"
              disabled={!selectedRowKeys.length}
            >ลบที่เลือก</Button>
          </Popconfirm>
        </Col>
        <Col span={10} className="text-end">
          <Button
            size="small"
            type="primary"
            style={{ margin: 0, marginRight: 4 }}
            onClick={() => setVsbFavoriteDiag(true)}
          >
            Favorite
          </Button>
          <Button
            size="small"
            type="primary"
            style={{ margin: 0 }}
            icon={<PlusOutlined />}
            disabled={!clinicId || !listDiagType?.length}
            onClick={() => {
              const pd = find(listDiagType, ["dataother1", "1"]);
              const listDiagnosis = form.getFieldValue("diagnosis") || [];
              let findX = find(listOpdDiagDiffDoctor, [
                "diagType",
                pd?.datavalue,
              ]);
              if (!findX) {
                findX = find(listDiagnosis, ["diagType", pd?.datavalue]);
              }
              add(
                {
                  diagId: null,
                  diagType: findX ? "2" : pd?.datavalue,
                  key: nanoid()
                },
              );
            }}
          />
        </Col>
      </Row>
    );
  };
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys)
      setSelectedRows(selectedRows)
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // console.log(selected, selectedRows, changeRows);
      setSelectedRowKeys(map(selectedRows, "key"))
      setSelectedRows(selectedRows)
    },
  };
  return (
    <>
      <Form form={form} onFinish={onFinish} layout="vertical" onValuesChange={onValuesChange}>
        <Form.List name={"diagnosis"}>
          {(list, { add, remove }) => {
            let formValues = form.getFieldsValue();
            let finances = formValues?.diagnosis || [];
            list = map(list, (val, i) => {
              let crrRow = finances[i];
              return {
                ...crrRow,
                ...val,
                key: crrRow.key,
              };
            });

            return (
              <Spin spinning={loading}>
                {TableHeader(add, remove)}
                <div hidden={!list.length}>
                  <Table
                    size="small"
                    rowClassName="data-value"
                    scroll={{ x: 600, y: 240 }}
                    dataSource={list}
                    columns={columns}
                    pagination={false}
                    rowSelection={{ ...rowSelection }}
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
      {vsbFavoriteDiag && (
        <FavoriteDiag
          open={vsbFavoriteDiag}
          close={() => setVsbFavoriteDiag(false)}
          onFinish={(arr) => {
            const pd = find(listDiagType, ["dataother1", "1"]);
            const prevDiagnosis = form.getFieldValue("diagnosis") || [];
            const findTypePd = find(prevDiagnosis, ["diagType", pd?.datavalue]);
            const mapping = map(arr, (o, i) => {
              return {
                icd: o.icd,
                diagnosis: o.diag,
                diagType: i === 0 ? (findTypePd ? "2" : pd?.datavalue) : "2",
                key: nanoid(),
              };
            });
            form.setFieldsValue({
              diagnosis: [...mapping, ...prevDiagnosis],
            });
          }}
        />
      )}
    </>
  );
}
const listApi = [
  {
    name: "GetOpdRights",
    url: "PatientsFinancesDrug/GetOpdRightFinancesDrugByService/",
    method: "GET",
    return: "responseData",
    sendRequest: false,
  },
  {
    name: "GetDiagTypes",
    url: "Masters/GetDiagTypes",
    method: "POST",
    return: "responseData",
    sendRequest: false,
  },
  {
    name: "GetDiagSides",
    url: "Masters/GetDiagSides",
    method: "POST",
    return: "responseData",
    sendRequest: false,
  },
  // GetIcdsRediags
  {
    name: "GetIcdsRediags",
    url: "Masters/GetIcdsRediags",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
  // GetIcdsRediagsNew
  {
    name: "GetIcdsRediagsNew",
    url: "Masters/GetIcdsRediagsNew",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
  // GetOpdDiags
  {
    name: "GetOpdDiags",
    url: "OpdClinics/GetHistoryClinicsDetail",
    method: "POST",
    return: "responseData",
    sendRequest: true,
  },
  // DelListOpdDiags
  {
    name: "DelOpdDiags",
    url: "OpdExamination/DelListOpdDiags",
    method: "DELETE",
    return: "data",
    sendRequest: true,
  },
];
