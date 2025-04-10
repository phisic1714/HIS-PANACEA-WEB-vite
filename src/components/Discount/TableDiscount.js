import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, Modal, Row, Select, Spin, Table } from 'antd';
import axios from "axios";
import { notiError, notificationX, notiSuccess } from 'components/Notification/notificationX.js';
import { discountStatus, discountTypes } from 'components/helper/golobalVar/data-variable.js';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { decimalToFixed2Comma } from 'util/GeneralFuctions.js';
import { env } from '../../env.js';
import { GetDropdown } from '../../routes/SocialWelfare/API/OpdDiscountSaveApi.js';
import "./TableDiscount.less";

export const GetDiscountHistory = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OutpatientFinance/GetDiscountHistory`, req).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

export const DelCancelDiscount = async requestData => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OutpatientFinance/DelCancelDiscount`,
    method: "DELETE",
    data: requestData
  }).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};



const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession.responseData.userId;

export default function TableDiscount({
  opdipd = "O",
  showCreateDiscountBtn = false,
  returnListDiscount = () => { },
  size = "middle",
  scrollY = 220,
  handleRowClick = null,
  viewOnly = false,
  reload = 0,
  initialForm = {}
}) {
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const {
    selectPatient
  } = useSelector(({
    patient
  }) => patient);

  const [discountList, setDiscountList] = useState([]);
  const [isModalDiscountOpen, setIsModalDiscountOpen] = useState(false);
  const [formAddDiscount] = Form.useForm();

  const getDiscountList = async () => {
    let patient = opdipd === "O" ? opdPatientDetail : selectPatient;

    if (!patient?.patientId) return

    let req = {
      patientId: patient?.patientId,
      // serviceId: patient?.serviceId,
      admitId: patient?.admitId || null,
      opdipd: opdipd,
      discountId: null
    };
    let res = await GetDiscountHistory(req);
    const handleSetFieldsValue = () => {
      formAddDiscount.setFieldsValue({
        discountId: res.responseData[0]?.discountId
      });
    };
    if (res?.isSuccess) {
      res.responseData = res.responseData.map((v,) => {
        let total = Number(v.limit) - Number(v.discount);
        return {
          ...v,
          total: total
        };
      });
      returnListDiscount(res.responseData);
      setDiscountList(res.responseData);
      handleSetFieldsValue();
    } else {
      setDiscountList([]);
    }
  };

  const deleteDiscount = async (discountId) => {
    if (discountId) {
      let req = {
        requestData: [
          {
            discountId: discountId,
          },
        ],
      };
      let res = await DelCancelDiscount(req);
      if (res.isSuccess === true) {
        notiSuccess({ message: "ลบเลขที่ส่วนลด" })
        getDiscountList()
      } else {
        notiError({ message: "ลบเลขที่ส่วนลด" })
      }
      // setLoading(false);
    }
  };

  let columns = [{
    title: <Row gutter={[4, 4]} align='middle'>
      <Col>
        เลขที่ส่วนลด
      </Col>
      {showCreateDiscountBtn ? <Col>
        <Button
          size='small'
          style={{
            marginBottom: 0
          }}
          disabled={opdipd === "O" ? opdPatientDetail === null : selectPatient === null}
          type={"primary"}
          icon={<PlusOutlined />}
          onClick={() => {
            formAddDiscount.setFieldsValue({
              discountId: " "
            });
            setIsModalDiscountOpen(true);
          }}
        />
      </Col> : null}
    </Row>,
    dataIndex: "discountId"
  }, {
    title: "วันที่ขออนุมัติ",
    dataIndex: "discountDatetime",
    align: "center",
    render: text => <>{`${text ? dayjs(text).format("DD/MM/") + dayjs(text).format("YYYY HH:mm") : "-"}`}</>
  },
  {
    title: "สถานะ",
    dataIndex: "discountStatus",
    render: (t) => discountStatus[t],
    align: "center"
  },
  {
    title: "วันที่อนุมัติ",
    dataIndex: "dateApproved",
    align: "center",
    render: text => <>{`${text ? dayjs(text).format("DD/MM/") + dayjs(text).format("YYYY HH:mm") : "-"}`}</>

  }, {
    title: "Type",
    dataIndex: "discountType",
    render: (text) => discountTypes[text] || "-",
    align: "center"
  }, {
    title: "วงเงินส่วนลด",
    dataIndex: "limit",
    render: (text) => decimalToFixed2Comma(text) || 0,
    align: "right"
  }, {
    title: "ส่วนลดที่ใช้ไป",
    dataIndex: "discount",
    render: (t) => decimalToFixed2Comma(t) || 0,
    align: "right"
  }, {
    title: "คงเหลือ",
    dataIndex: "total",
    render: (text) => decimalToFixed2Comma(text) || 0,
    align: "right"
  }, {
    title: "หมายเหตุ",
    dataIndex: "remark",
    render: (t) => t || "-"
  }, {
    title: <label className="gx-text-primary"> </label>,
    dataIndex: '',
    key: 'key',
    align: 'center',
    fixed: 'right',
    width: 50,
    render: (val, row) => (
      <Button
        disabled={row.discountStatus}
        size="small"
        icon={<DeleteOutlined style={{ color: 'red' }} />}
        onClick={() => {
          deleteDiscount(val?.discountId);
        }}
        style={{ margin: 0 }}
      />
    )
  }];

  if (viewOnly) {
    columns = columns.filter((v) => v.dataIndex)
  }

  useEffect(() => {
    getDiscountList();

    return () => {
      setDiscountList([]);
    };
  }, [opdPatientDetail, selectPatient]);

  useEffect(() => {
    if (reload) getDiscountList()
  }, [reload])

  return <>
    <Table
      size={size}
      pagination={false}
      scroll={{ y: scrollY, x: 1200 }}
      columns={columns}
      dataSource={discountList}
      rowKey="discountId"
      rowClassName={record => record?.discountStatus === "P"
        ? "DStatusPApprove data-value"
        : record?.discountStatus === "A"
          ? "DStatusApprove data-value"
          : record?.discountStatus === "R"
            ? "DStatusDisApprove data-value"
            : "data-value"}
      onRow={record => ({
        onClick: () => handleRowClick && handleRowClick(discountList.find((v) => v.discountId === record.discountId)),
        style: handleRowClick ? { cursor: "pointer" } : {}
      })}
    />
    {isModalDiscountOpen ? <CreateDiscountModal
      visible={isModalDiscountOpen}
      setVisible={setIsModalDiscountOpen}
      opdipd={opdipd} getDiscountList={getDiscountList}
      formAddDiscount={formAddDiscount} initialForm={initialForm} /> : null}
  </>;
}

export const InsDiscounts = async values => {
  let req = {
    "mode": null,
    "user": null,
    "ip": null,
    "lang": null,
    "branch_id": null,
    "requestData": values,
    "barcode": null
  };
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Discounts/InsDiscounts `, req).then(res => {
    return res.data;
  }).catch(error => {
    return error;
  });
  return res;
};

const CreateDiscountModal = ({
  visible,
  setVisible,
  opdipd = "O",
  getDiscountList = () => { },
  formAddDiscount,
  initialForm = {},
  handleAddDiscount = null
}) => {
  const {
    opdPatientDetail
  } = useSelector(({
    opdPatientDetail
  }) => opdPatientDetail);
  const {
    selectPatient
  } = useSelector(({
    patient
  }) => patient);

  const chkAutoAccept = Form.useWatch("chkAutoAccept", formAddDiscount);
  const [chk, setChk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState([]);
  const [state, setState] = useState({
    limit: 0,
    remark: "",
    chkAutoAccept: false
  })

  const selectprop = {
    allowClear: true,
    style: { width: "100%" },
    showSearch: true,
    optionFilterProp: "children",
    filterOption: (input, option) =>
      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
  };

  const getDropdown = async () => {
    setLoading(true);
    try {
      const [discountType] = await Promise.all([
        GetDropdown("OpdDiscount/GetDiscountType"),
      ]);
      setDiscountType(discountType);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onFinishAddDiscount = async (values) => {
    setLoading(true);
    let patient = opdipd === "O" ? opdPatientDetail : selectPatient;
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss")

    const request = {
      discountId: null,
      discountDate: currentDate,
      discountTime: currentDate,
      discountDatetime: currentDate,
      discountType: patient.discountType || values.discountType,
      opdipd: opdipd,
      workId: null,
      doctor: null,
      runNo: null,
      yearNo: null,
      patientId: patient.patientId,
      runHn: patient.hn.split("/")[0],
      yearHn: patient.hn.split("/")[1],
      hn: patient.hn,
      serviceId: patient?.serviceId,
      admitId: patient?.admitId,
      an: patient?.an,
      referId: null,
      runAn: null,
      yearAn: null,
      discountPtType: null,
      discountStatus: formAddDiscount.getFieldValue("chkAutoAccept") === "Y" ? "A" : null,
      discountReason: null,
      remark: state.remark,
      expireDate: null,
      limit: state.limit,
      total: state.limit,
      userCreated: user,
      dateCreated: currentDate,
      userModified: null,
      dateModified: null,
      userApproved: formAddDiscount.getFieldValue("chkAutoAccept") === "Y" ? user : null,
      dateApproved: formAddDiscount.getFieldValue("chkAutoAccept") === "Y" ? currentDate : null,
      oldNew: null,
      doctorId: null,
      diagnosis: null,
      icd10: null,
      otherPlace: null,
      placeType: "I"
    };

    let res = await InsDiscounts(request);
    setLoading(false);
    if (res.isSuccess === true) {
      await getDiscountList();
      document.getElementById("DiscountFormReload").click()
      notificationX(res.isSuccess, "ขอเลขที่ส่วนลด");
      setChk(true)
      setVisible(false);
      formAddDiscount.resetFields();
    } else {
      notificationX(res.error, "ขอเลขที่ส่วนลด");
    }
  };

  const chkDisableRoleAutoAccept = () => {
    let userRoles = userFromSession.responseData?.roles;
    if (userRoles?.find(val => val?.autoDiscountFlag === "Y")) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    getDropdown();
    return () => {
      setDiscountType([]);
    };
  }, []);

  return <Form form={formAddDiscount} onFinish={onFinishAddDiscount} layout={"vertical"} initialValues={initialForm}>
    <Modal centered width={700} title={<Row align='middle'>
      <Col span={24}>
        <label className="gx-text-primary fs-4">
          สร้างเลขที่ส่วนลด
        </label>
        <Checkbox disabled={chkDisableRoleAutoAccept()} style={{
          position: "absolute",
          right: 10,
          margin: 0
        }} onChange={e => formAddDiscount.setFieldsValue({
          chkAutoAccept: e.target.checked ? "Y" : null
        })} value={chkAutoAccept === "Y"}>
          <label className="gx-text-primary">Auto Accept</label>
        </Checkbox>
      </Col>
    </Row>} visible={visible}
      closable={false} footer={[<>
        <Button key="close" onClick={() => {
          formAddDiscount.resetFields();
          setVisible(false);
        }} >
          ปิด
        </Button>
        <Button
          key="save"
          type="primary"
          onClick={() => {
            formAddDiscount.submit();
          }}
        >
          ขอเลขที่ส่วนลด
        </Button>
      </>
      ]}>
      <Spin spinning={loading}>
        <Row gutter={[2, 8]} style={{
          flexDirection: "row"
        }}>
          <Col span={6}>
            <label className="gx-text-primary">
              เลขที่ส่วนลด
            </label>
            <Form.Item name="discountId">
              <Input disabled style={{
                width: "100%"
              }} />
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: "35px" }}>
            <label className="gx-text-primary">
              วงเงินส่วนลด
            </label>
            <Form.Item name="limit">
              <Input value={state.limit} onChange={(e) => setState((p) => ({ ...p, limit: e.target.value }))} type="number" style={{
                width: "100%"
              }} />
            </Form.Item>
          </Col>
          <Col span={6} style={{ paddingLeft: "35px" }}>
            <label className="gx-text-primary">
              Type การลดหย่อน            </label>
            <Form.Item
              name="discountType"

            >
              <Select
                {...selectprop}
                options={discountType?.map((n) => ({
                  value: n.datavalue,
                  label: n.datadisplay,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <label className="gx-text-primary">
              หมายเหตุ
            </label>
            <Form.Item name="remark">
              <Input.TextArea value={state.remark} onChange={(e) => setState((p) => ({ ...p, remark: e.target.value }))} style={{
                width: "100%"
              }} />
            </Form.Item>
          </Col>
        </Row>
      </Spin>
    </Modal>
  </Form>
};