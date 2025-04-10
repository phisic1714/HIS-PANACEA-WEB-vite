import { env } from '../../../env.js';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Row, Col, Button, Table, Modal, Tabs, Image, Spin, Empty, Form, InputNumber, Tooltip, Checkbox } from 'antd';
import Column from 'antd/lib/table/Column';
import { Icon } from '@iconify/react';
import pillsIcon from '@iconify/icons-carbon/pills';
import { EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from 'react-toastify';
import PreviewPdfNonModal from "../../qzTray/PreviewPdfNonModal";
import { BsThreeDots } from "react-icons/bs";
export default forwardRef(function DrugCondition({
  drugCondiVisible,
  setDrugCondiVisible,
}, ref) {
  const {
    TabPane
  } = Tabs;
  const [expenseId, setExpenseId] = useState(null);
  const [loading, setLoading] = useState({});
  const [tabKey, setTabKey] = useState("pill1");
  const [expense, setExpense] = useState([]);
  const [drugDocSpecial, setDrugDocSpecial] = useState([]);
  const [pageDocSpecial, setPageDocSpecial] = useState(1);
  const [drugDoctor, setDrugDoctor] = useState([]);
  const [pageDoctor, setPageDoctor] = useState(1);
  const [drugRight, setDrugRight] = useState([]);
  const [pageRight, setPageRight] = useState(1);
  const [expenseRatedForm] = Form.useForm();
  const [pdf, setPdf] = useState([]);
  const [viewScanable, setViewScanable] = useState(false);
  useImperativeHandle(ref, () => ({
    setExpenseId: props => setExpenseId(props)
  }));
  const defalutLoading = async () => {
    let load = {};
    load['expense'] = true;
    load['drugDocSpecial'] = true;
    load['drugDoctor'] = true;
    load['drugRight'] = true;
    load['expenseRated'] = true;
    setLoading(load);
  };
  const start = async () => {
    await defalutLoading();
    getOpdExpensesPicfinancesDrug(expenseId);
    getOpdDrugDocSpecialTiesfinancesDrug(expenseId);
    getOpdDrugDoctorfinancesDrug(expenseId);
    getOpdExpenseRightsfinancesDrug(expenseId);
    getExpenseRated(expenseId);
  };

  //Func. Call Api
  const getOpdExpensesPicfinancesDrug = async expenseId => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdExpensesPicfinancesDrug/${expenseId}`).then(res => {
      setExpense(res.data.responseData ? res.data.responseData : []); //res.data.responseData === null when expenseId === 4289
      setLoading(prev => {
        return {
          ...prev,
          expense: false
        };
      });
    }).catch(error => {
      return error;
    });
  };
  const getOpdDrugDocSpecialTiesfinancesDrug = async expenseId => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugDocSpecialTiesfinancesDrug/${expenseId}`).then(res => {
      let resData = res.data.responseData;
      if (resData.length > 0) {
        resData = resData.map((val, index) => {
          return {
            ...val,
            key: index
          };
        });
      }
      setDrugDocSpecial(resData);
      setLoading(prev => {
        return {
          ...prev,
          drugDocSpecial: false
        };
      });
    }).catch(error => {
      return error;
    });
  };
  const getOpdDrugDoctorfinancesDrug = async expenseId => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdDrugDoctorfinancesDrug/${expenseId}`).then(res => {
      let resData = res.data.responseData;
      if (resData.length > 0) {
        resData = resData.map((val, index) => {
          return {
            ...val,
            key: index
          };
        });
      }
      setDrugDoctor(resData);
      setLoading(prev => {
        return {
          ...prev,
          drugDoctor: false
        };
      });
    }).catch(error => {
      return error;
    });
  };
  const getOpdExpenseRightsfinancesDrug = async expenseId => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PatientsFinancesDrug/GetOpdExpenseRightsfinancesDrug/${expenseId}`).then(res => {
      let resData = res.data.responseData;
      if (resData.length > 0) {
        resData = resData.map((val, index) => {
          return {
            ...val,
            key: index
          };
        });
      }
      setDrugRight(resData);
      setLoading(prev => {
        return {
          ...prev,
          drugRight: false
        };
      });
    }).catch(error => {
      return error;
    });
  };
  const getExpenseRated = async expenseId => {
    await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/PharmaceuticalDrug/GetExpenseRated/${expenseId}`).then(res => {
      let resData = res.data;
      if (resData?.isSuccess) {
        // setExpenseRated(resData?.responseData);
        let responseData = resData?.responseData;
        const rightList = ["cscd", "sso", "insurance", "nhso", "alien"];
        for (let val of rightList) {
          responseData[`${val}CashNotReturn`] = responseData[`${val}Rate`] ? responseData?.minRate - responseData[`${val}Rate`] : null;
          responseData[`${val}IpdCashNotReturn`] = responseData[`${val}IpdRate`] ? responseData?.maxRate - responseData[`${val}IpdRate`] : null;
        }
        expenseRatedForm.setFieldsValue(responseData);
      }
      setLoading(prev => {
        return {
          ...prev,
          expenseRated: false
        };
      });
    }).catch(error => {
      return error;
    });
  };
  const GetScanExpenseList = async id => {
    let res = await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/Scan/GetScanExpenseList`,
      method: "POST",
      data: {
        requestData: {
          "expScanId": null,
          "expenseId": id,
          "date": null,
          "page": "1",
          "rows": "99999"
        }
      }
    }).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    return res;
  };
  const handleClickViewScan = async () => {
    if (expenseId) {
      let {
        responseData
      } = await GetScanExpenseList(expenseId);
      console.log(responseData);
      setPdf(responseData.results);
      if (responseData.results.map(i => i.imageScan)?.length > 0) {
        setViewScanable(true);
      } else {
        toast.warn("ไม่มีข้อมูล", {
          position: "top-right",
          autoClose: 1500,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } else {
      toast.warn("กรุณาเลือก expenseId", {
        position: "top-right",
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  // Func.
  const closeModal = () => {
    setTabKey("pill1");
    setDrugCondiVisible(false);
    setPageDocSpecial(1);
    setPageDoctor(1);
    setPageRight(1);
  };
  useEffect(() => {
    if (expenseId) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);
  return <>
            <Modal title={<strong><label>เงื่อนไขการสั่ง</label></strong>}
    // centered
    visible={drugCondiVisible} onCancel={() => closeModal()} closable={false} width="1200px" footer={[<Row justify="center" key="footer">
                        <Button key="cancel" onClick={() => closeModal()}>ออก</Button>
                    </Row>]}>
                <Spin spinning={!Object.values(loading).every(val => val === false)}>
                    <Row>
                        <Col span={4}>
                            {expense[0]?.picture ? <Image src={`data:image/jpeg;base64,${expense[0]?.picture}`} /> : <Image src="error" fallback="data:image/png;base64,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" />}
                        </Col>
                        <Col span={20}>
                            <Row align="middle" style={{
              margin: 0,
              position: "relative"
            }}>
                                <label className="gx-text-primary"><Icon icon={pillsIcon} width="30" height="30" /></label>
                                <label className="gx-text-primary" style={{
                marginLeft: 16
              }}>{expense[0]?.expenseName}</label>
                                <Button type="default" style={{
                marginBottom: 0,
                position: "absolute",
                right: 0
              }} className="btn-custom-bgcolor" icon={<EyeOutlined style={{
                fontSize: "16px"
              }} />} onClick={() => {
                //expenseId
                handleClickViewScan(expenseId);
              }}>
                                    &nbsp;View Scan
                                </Button>
                            </Row>
                            <Tabs style={{
              marginTop: 10
            }} activeKey={tabKey} onChange={value => setTabKey(value)}>
                                <TabPane tab="ยากับสาขาแพทย์" key="pill1">
                                    <Table style={{
                  marginTop: 10
                }} dataSource={drugDocSpecial} pagination={{
                  current: pageDocSpecial,
                  pageSize: 10,
                  showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
                  showSizeChanger: false
                }} onChange={n => {
                  setPageDocSpecial(n.current);
                }}>
                                        <Column title={<label className="gx-text-primary"><b>สาขาแพทย์</b></label>} dataIndex="specialtyName" />
                                        <Column align="right" title={<label className="gx-text-primary"><b>จำนวนที่สั่งได้/ใบสั่งยา</b></label>} dataIndex="qty" />
                                    </Table>
                                </TabPane>
                                <TabPane tab="ยากับแพทย์" key="pill2">
                                    <Table style={{
                  marginTop: 10
                }} dataSource={drugDoctor} pagination={{
                  current: pageDoctor,
                  pageSize: 10,
                  showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
                  showSizeChanger: false
                }} onChange={n => {
                  setPageDoctor(n.current);
                }}>
                                        <Column title={<label className="gx-text-primary"><b>ชื่อแพทย์ที่สามารถสั่งได้</b></label>} dataIndex="doctorName" />
                                        <Column align="right" title={<label className="gx-text-primary"><b>จำนวนที่สั่งได้/ใบสั่งยา</b></label>} dataIndex="qty" />
                                    </Table>
                                </TabPane>
                                <TabPane tab="ยากับสิทธิ์การรักษา" key="pill3">
                                    <Table style={{
                  marginTop: 10
                }} dataSource={drugRight} pagination={{
                  current: pageRight,
                  pageSize: 10,
                  showTotal: (total, range) => `รายการที่ ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
                  showSizeChanger: false
                }} onChange={n => {
                  setPageRight(n.current);
                }}>
                                        <Column title={<label className="gx-text-primary"><b>สิทธิการรักษา</b></label>} dataIndex="rightName" />
                                        <Column title={<label className="gx-text-primary"><b>ราคาขาย Opd</b></label>} dataIndex="opdRate" render={record => {
                    return record ? record : "0.00";
                  }} />
                                        <Column title={<label className="gx-text-primary"><b>เบิกได้ Opd</b></label>} dataIndex="opdCashReturn" render={record => {
                    return record ? record : "0.00";
                  }} />
                                        <Column title={<label className="gx-text-primary"><b>ราคาขาย Ipd</b></label>} dataIndex="ipdRate" render={record => {
                    return record ? record : "0.00";
                  }} />
                                        <Column title={<label className="gx-text-primary"><b>เบิกได้ Ipd</b></label>} dataIndex="ipdCashReturn" render={record => {
                    return record ? record : "0.00";
                  }} />
                                        <Column title={<label className="gx-text-primary"><b>จำนวน</b></label>} dataIndex="limitQty" />
                                        <Column title={<label className="gx-text-primary"><b>ประเภทเบิก</b></label>} dataIndex="limitDurationDesc" />
                                    </Table>
                                </TabPane>
                                <TabPane tab="ค่าใช้จ่ายตามกลุ่มสิทธิ" key="pill4">
                                <Form form={expenseRatedForm}>
                                    <Row justify="center" style={{
                    marginLeft: 0,
                    marginRight: 16
                  }}>
                                        <Col span={24} style={{
                      paddingRight: 0
                    }}>
                                            <Row style={{
                        background: "var(--secondary-color)",
                        padding: "10px 0"
                      }}>
                                            <Col sm={8}></Col>
                                            <Col sm={8}>
                                                <label className="gx-text-primary-bold fw-bold">ผู้ป่วยนอก</label>
                                            </Col>
                                            <Col sm={8}>
                                                <label className="gx-text-primary-bold fw-bold">ผู้ป่วยใน</label>
                                            </Col>
                                            </Row>
                                        </Col>
                                        <Col span={24} style={{
                      paddingRight: 0
                    }}>
                                            <Row style={{
                        marginTop: 10
                      }}>
                                            <Col sm={8} className={"text-center"}>
                                                <Form.Item
                          // label={<span></span>}
                          labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }}>
                                                <label style={{
                              whiteSpace: "nowrap",
                              display: "flex",
                              justifyContent: "center"
                            }}><div style={{
                                color: "red"
                              }}>*</div>
                                                    ราคาขาย
                                                </label>
                                                </Form.Item>
                                            </Col>
                                            <Col sm={8} style={{
                          paddingLeft: 0
                        }}>
                                                <Form.Item labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }} name="minRate" rules={[{
                            required: true
                          }]}>
                                                <InputNumber addonAfter={"บาท"} style={{
                              width: "100%"
                            }} step={0.01} disabled />
                                                </Form.Item>
                                            </Col>
                                            <Col sm={8} style={{
                          paddingLeft: 0
                        }}>
                                                <Form.Item labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }} name="maxRate" rules={[{
                            required: true
                          }]}>
                                                <InputNumber addonAfter={"บาท"} style={{
                              width: "100%"
                            }} step={0.01} disabled />
                                                </Form.Item>
                                            </Col>
                                            </Row>
                                        </Col>
                                        <Col span={24} style={{
                      paddingRight: 0
                    }}>
                                            <Row style={{
                        marginTop: 10
                      }}>
                                                <Col sm={8} className={"text-center"}>
                                                    <Form.Item
                          // label={<span></span>}
                          labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }}>
                                                    <label>
                                                        ราคาที่ควรจะเป็น
                                                    </label>
                                                        <Tooltip placement="bottom" title={`ราคาต้นทุน : ${expenseRatedForm.getFieldValue("pct_Good")?.cost ? expenseRatedForm.getFieldValue("pct_Good")?.cost : "-"}`}>
                                                            <Button className="btn-bsThreeDots" style={{
                                marginLeft: 25
                              }} icon={<BsThreeDots style={{
                                marginTop: -25
                              }} />} />
                                                        </Tooltip>
                                                    </Form.Item>
                                                </Col>
                                                <Col sm={8} style={{
                          paddingLeft: 0
                        }}>
                                                    <Form.Item initialValue={expenseRatedForm.getFieldValue("pct_Good")?.packPrice} labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }} name={["pct_Good", "packprice"]}>
                                                    <InputNumber disabled addonAfter={"บาท"} style={{
                              width: "100%"
                            }} step={0.01} />
                                                    </Form.Item>
                                                </Col>
                                                <Col sm={8} style={{
                          paddingLeft: 0
                        }}>
                                                    <Form.Item initialValue={expenseRatedForm.getFieldValue("pct_Good")?.packPrice} labelCol={{
                            span: 24
                          }} wrapperCol={{
                            span: 24
                          }} name={["pct_Good", "packpriceIpd"]}>
                                                    <InputNumber disabled addonAfter={"บาท"} style={{
                              width: "100%"
                            }} step={0.01} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={24} style={{
                      paddingRight: 0
                    }}>
                                            <Row style={{
                        marginBottom: 10
                      }}>
                                            <Col sm={8}></Col>
                                            <Col sm={4}>เครดิต</Col>
                                            <Col sm={4}>เบิกไม่ได้</Col>
                                            <Col sm={4}>เครดิต</Col>
                                            <Col sm={4}>เบิกไม่ได้</Col>
                                            </Row>
                                        </Col>
                                        <Row style={{
                      marginTop: 10
                    }}>
                                            <Col sm={8} className={"text-center"}>
                                            <Form.Item name="cscdFlag" valuePropName="checked">
                                                <Checkbox disabled={true} name="cscdFlag">
                                                    <span style={{
                              color: "black"
                            }}>กรมบัญชีกลาง/ข้าราชการเบิกได้</span>
                                                </Checkbox>
                                            </Form.Item>
                                            </Col>
                                            <DataFinanceField form={expenseRatedForm} type="Opd" right="cscd" />
                                            <DataFinanceField form={expenseRatedForm} type="Ipd" right="cscd" />
                                        </Row>
                                        <Row style={{
                      marginTop: 10
                    }}>
                                            <Col sm={8} className={"text-center"}>
                                            <Form.Item name="ssoFlag" valuePropName="checked">
                                                <Checkbox disabled={true} name="ssoFlag">
                                                    <span style={{
                              color: "black"
                            }}>ประกันสังคมเบิกได้</span>
                                                </Checkbox>
                                            </Form.Item>
                                            </Col>
                                            <DataFinanceField form={expenseRatedForm} type="Opd" right="sso" />
                                            <DataFinanceField form={expenseRatedForm} type="Ipd" right="sso" />
                                        </Row>
                                        <Row style={{
                      marginTop: 10
                    }}>
                                            <Col sm={8} className={"text-center"}>
                                            <Form.Item name="insuranceFlag" valuePropName="checked">
                                                <Checkbox disabled={true} name="insuranceFlag">
                                                    <span style={{
                              color: "black"
                            }}>กองทุนทดแทน/ประกันฯ</span>
                                                </Checkbox>
                                            </Form.Item>
                                            </Col>
                                            <DataFinanceField form={expenseRatedForm} type="Opd" right="insurance" />
                                            <DataFinanceField form={expenseRatedForm} type="Ipd" right="insurance" />
                                        </Row>
                                        <Row style={{
                      marginTop: 10
                    }}>
                                            <Col sm={8} className={"text-center"}>
                                            <Form.Item name="nhsoFlag" valuePropName="checked">
                                                <Checkbox disabled={true} name="nhsoFlag">
                                                    <span style={{
                              color: "black"
                            }}>UC เบิกได้</span>
                                                </Checkbox>
                                            </Form.Item>
                                            </Col>
                                            <DataFinanceField form={expenseRatedForm} type="Opd" right="nhso" />
                                            <DataFinanceField form={expenseRatedForm} type="Ipd" right="nhso" />
                                        </Row>
                                        <Row style={{
                      marginTop: 10
                    }}>
                                            <Col sm={8} className={"text-center"}>
                                            <Form.Item name="alienFlag" valuePropName="checked">
                                                <Checkbox disabled={true} name="alienFlag">
                                                    <span style={{
                              color: "black"
                            }}>สิทธิ์ต่างด้าว</span>
                                                </Checkbox>
                                            </Form.Item>
                                            </Col>
                                            <DataFinanceField form={expenseRatedForm} type="Opd" right="alien" />
                                            <DataFinanceField form={expenseRatedForm} type="Ipd" right="alien" />
                                        </Row>
                                    </Row>
                                </Form>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
            <Modal visible={viewScanable} closable={false} onCancel={() => {
      setViewScanable(false);
      setPdf([]);
    }}>
                <div style={{
        border: "1px solid rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "center",
        height: "42rem"
      }}>
                    {pdf.length ? <PreviewPdfNonModal pdf={pdf} /> : <Empty />}
                </div>
            </Modal>
        </>;
});
const DataFinanceField = ({
  form,
  type,
  right
}) => {
  const handleChange = val => {
    let rate = type === "Opd" ? form.getFieldValue("minRate") : form.getFieldValue("maxRate");
    form.setFieldsValue({
      [`${right}${type === "Ipd" ? type : ""}CashNotReturn`]: rate - val
    });
  };
  return <>
            <Col sm={4}>
            <Form.Item labelCol={{
        span: 24
      }} wrapperCol={{
        span: 24
      }} name={`${right}${type === "Ipd" ? type : ""}Rate`}>
                <InputNumber addonAfter={"บาท"} style={{
          width: "100%"
        }} step={0.01} min={0} max={type === "Opd" ? form.getFieldValue("minRate") : form.getFieldValue("maxRate")} onChange={handleChange} disabled />
            </Form.Item>
            </Col>
            <Col sm={4}>
            <Form.Item labelCol={{
        span: 24
      }} wrapperCol={{
        span: 24
      }} name={`${right}${type === "Ipd" ? type : ""}CashNotReturn`}>
                <InputNumber addonAfter={"บาท"} style={{
          width: "100%"
        }} step={0.01} disabled />
            </Form.Item>
            </Col>
        </>;
};