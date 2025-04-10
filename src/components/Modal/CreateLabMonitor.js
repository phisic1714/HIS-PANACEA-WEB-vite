import { env } from '../../env.js';
import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Row, Col, Button, Modal, Select, Popconfirm, Radio, Table, message } from 'antd';
import moment from 'moment';
import {filter ,map,find} from "lodash";
import Notifications from "../Modal/Notifications";
import Scrollbars from 'react-custom-scrollbars';
import { DeleteOutlined } from '@ant-design/icons';
import { notiSuccess, notiWarning } from 'components/Notification/notificationX.js';
const {
  Option
} = Select;
export default function CreateLabMonitor({
  setModal = () => { },
  isVisible = false,
  onSave = () => {
    console.log("Lab Monitor");
  },
  patientId = null,
  workId = null,
  doctor = null,
  serviceId = null,
  showTable = false,
  scrollY = 200,
  add543 = true, //หน้าไหนเรียก momentTH ใส่ add543 เป็น false
  size = "middle",
  showBottonAdd = false,
  ...props
}) {
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  // const workId = userFromSession.responseData.workId
  // const { opdClinicRoom, dentalRoom, doctorClinicRoom, wardRoom } = useSelector(({ workRoom }) => workRoom);
  const [radioValue, setRadioValue] = useState(null);
  const [labDomainList, setLabDomainList] = useState([]);
  const [selectValue, setSelectValue] = useState(null);
  const [selectedLabDomain, setSelectedLabDomain] = useState(null);
  const [addedList, setAddedList] = useState([]);
  const [vsbModal, setVsbModal] = useState(false)

  // Notification
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [processResult, setProcessResult] = useState({});
  const [notificationsTitle, setNotificationsTitle] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  // Api
  const GetMasterLabDomain = async () => {
    if (labDomainList.length === 0) {
      let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetMasterLabDomain`).then(res => {
        return res.data.responseData;
      }).catch(error => {
        return error;
      });
      setLabDomainList(res);
    }
  };
  const InsListLabMonitor = async () => {
    let labList = addedList.map((o,) => {
      return {
        "labMonitorId": null,
        "workId": workId,
        "doctor": user,
        "labDomain": o.value,
        "seq": null,
        "patientId": radioValue === "3" ? patientId : null,
        "monitorType": radioValue,
        "userCreated": user,
        "dateCreated": moment(),
        "userModified": null,
        "dateModified": null
      };
    });
    let req = {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": labList,
      "barcode": null
    };
    let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/SusgicalOperation/InsListLabMonitor`, req).then(res => {
      return res.data;
    }).catch(error => {
      return error;
    });
    if (res.isSuccess === true) {
      setAddedList([]);
      setSelectValue(null);
      onSave();
      if (showTable) {
        fetchLabMonitorDisplay();
      }
    }
    setProcessResult(res);
    setNotificationsTitle("บันทึก LAB Monitor");
    setNotificationType("result");
    setShowNotificationsModal(true);
  };

  const DelLabMonitor = async (labMonitorId) => {
    const res = await axios.delete(`${env.REACT_APP_PANACEACHS_SERVER}/api/SusgicalOperation/DelLabMonitorn/` + labMonitorId).then(res => {
      return res.data;
    }).catch(error => {
      return error
    })
    return res
  }

  useEffect(() => {
    GetMasterLabDomain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDeleteAddedLabDomain = async index => {
    let filteredData = filter(addedList, (o, indx) => indx !== index);
    setAddedList(filteredData);
  };
  const [labMonitorDisplayList, setLabMonitorDisplayList] = useState([]);
  const [loadingLabMonitor, setLoadingLabMonitor] = useState(false);
  const fetchLabMonitorDisplay = async () => {
    setLoadingLabMonitor(true);
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetLabMonitorPopupDisplay`,
      method: "POST",
      data: {
        requestData: {
          patientId: patientId,
          workId: workId,
          doctor: doctor,
          serviceId: serviceId
        }
      }
    }).then(res => {
      if (res.data.responseData) {
        let temp = res.data.responseData;
        temp = filter(temp, "labTestName");
        setLabMonitorDisplayList(temp);
      } else {
        setLabMonitorDisplayList([]);
      }
    }).catch(error => {
      return error;
    });
    setLoadingLabMonitor(false);
    // return res;
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const onFilterLabMonitorId = (record) => {
    let mapId = map(labMonitorDisplayList, 'labMonitorId').filter(data => record.includes(data))
    warningLabMonitor(mapId)
  }
  const handleDeleteLabMonitor = async () => {
    const resA = await Promise.all(map(selectedRowKeys, async o => {
      const res = await DelLabMonitor(o)
      return res.isSuccess
    }))
    const findTrue = find(resA, o => o === true)
    if (findTrue) {
      notiSuccess({ message: "ลบรายการ" })
      setSelectedRowKeys([])
      if (showTable) {
        fetchLabMonitorDisplay();
      }
    }
    const findFalse = find(resA, o => o === false)
    if (findFalse) notiWarning({ message: "ลบบางรายการไม่สำเร็จ !" })
  }
  const warningLabMonitor = (selectData) => {
    if (selectData.length !== 0) {
      if (selectData.length > 1) {
        message.warning({
          content: "Lab Domain นี้มีหลาย Lab Test ซ้ำกรุณาตรวจสอบข้อมูล!",
          style: {
            marginTop: '20vh',
            padding: '12px'
          },
        })
      } else {
        message.warning("กรุณาตรวจสอบข้อมูล!")
      }
    }
  }
  const findDataInArray = (valueForFinding, list, fieldName) => {
    let res = find(list, o => {
      return o[fieldName] === valueForFinding;
    });
    if (res) {
      return true;
    } else return false;
  };
  const handleSelectLabDomain = (selectedId, record) => {
    const chkDuplicateSelected = find(addedList, ["value", selectedId])
    if (chkDuplicateSelected) return notiWarning({ message: "เลือกรายการซ้ำ !", description: "กรุณาเลือกใหม่" })
    setSelectValue(selectedId);
    setSelectedLabDomain(record);
  }
  const TableLab = () => {
    const onSelectChange = (record) => {
      // console.log('record :>> ', record);
      // onFilterLabMonitorId(record);
      setSelectedRowKeys(record);
      // if (intersectionBy(selectedRowKeys, record).length > 0) {
      //   let samedata = record.filter(data => !selectedRowKeys.includes(data))
      //   onFilterLabMonitorId(samedata);
      //   setSelectedRowKeys(samedata);
      // } else {
      //   onFilterLabMonitorId(record);
      //   setSelectedRowKeys(record);
      // }
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange
    }
    const dataSource = labMonitorDisplayList.map((o, index) => {
      let orderDate = o.labOrderDate ? moment(o.labOrderDate).format("DD/MM/YYYY HH:mm") : null;
      if (add543) {
        orderDate = o.labOrderDate ? moment(o.labOrderDate, "MM/DD/YYYY HH:mm").format("DD/MM") + "" + moment(o.labOrderDate, "MM/DD/YYYY HH:mm").add(543, "y").format("/YYYY HH:mm") : null;
      }
      return {
        key: index,
        ...o,
        orderDate: orderDate
      };
    });
    const columns = [{
      // title: <label className="gx-text-primary">ชื่อ Lab</label>,
      title: <Row gutter={[4, 4]} align='middle'>
        <Col>
          <label className="gx-text-primary">ชื่อ Lab</label>
        </Col>
        <Col>
          <Button
            size='small'
            type='danger'
            disabled={selectedRowKeys.length > 0 ? false : true}
            onClick={handleDeleteLabMonitor}
            style={{ marginBottom: 0 }}
          >ลบที่เลือก</Button>
        </Col>
        <Col hidden={!showBottonAdd}>
          <Button
            size='small'
            type='primary'
            onClick={e => {
              e.stopPropagation()
              setVsbModal(true)
            }}
            style={{ marginBottom: 0 }}
          >เพิ่ม</Button>
        </Col>
      </Row>,
      dataIndex: "labTestName",
      key: "key",
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">ผล Lab</label>,
      dataIndex: "resultValue",
      key: "key",
      width: 110,
      render: val => <label className="data-value">{val}</label>
    }, {
      title: <label className="gx-text-primary">วันที่ตรวจล่าสุด</label>,
      dataIndex: "orderDate",
      key: "key",
      align: "center",
      width: 145,
      render: val => <label className="data-value">{val}</label>
    }];
    return <Table
      size={size}
      loading={loadingLabMonitor}
      scroll={{ x: 480, y: scrollY }}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      rowClassName="data-value"
      rowKey={"labMonitorId"}
      rowSelection={rowSelection}
      {...props}
    />;
  };
  useEffect(() => {
    if (showTable) {
      fetchLabMonitorDisplay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, workId, doctor, serviceId]);
  return <div>
    {showTable ? TableLab() : null}
    <Modal title={<label className="topic-green-bold"> 10.3.9 สร้าง LAB Monitor</label>} centered visible={isVisible || vsbModal} onCancel={() => {
      setModal(false);
      setSelectValue(null);
      setVsbModal(false)
    }} footer={[<Row justify="center" key="footer">
      <Button key="cancel" onClick={() => {
        setSelectValue(null);
        setModal(false);
        setAddedList([]);
        setVsbModal(false)
      }}>ปิด</Button>
      <Button key="save" type="primary" disabled={addedList.length === 0 ? true : false} onClick={() => {
        InsListLabMonitor();
      }}>
        บันทึก
      </Button>
    </Row>]} width={520}>
      <div className="p-2">
        <Row>
          <Radio.Group value={radioValue} onChange={e => {
            setRadioValue(e.target.value);
          }}>
            <Radio value="1" disabled={!workId}>แผนก</Radio>
            <Radio value="2">แพทย์</Radio>
            <Radio value="3" disabled={!patientId}>ผู้ป่วย</Radio>
          </Radio.Group>
        </Row>
        <Row className="mt-3 p-2" style={{
          backgroundColor: "#E8F5E9"
        }}>
          <label className="topic-green">LAB Monitor</label>
        </Row>
        <Row className="mt-2" gutter={[4, 4]}>
          <Col span={22}>
            <Select
              style={{ width: "100%" }}
              allowClear={true}
              showSearch={true}
              optionFilterProp="children"
              value={selectValue}
              onChange={handleSelectLabDomain}
              placeholder="เลือกรายการ LAB"
            >
              {labDomainList?.map((o, index) => <Option
                key={index}
                value={o.datavalue}
                name={o.datadisplay}
                disabled={findDataInArray(o.datavalue, labMonitorDisplayList, "labDomain")}
              >
                {o.datadisplay}
              </Option>)}
            </Select>
          </Col>
          <Col span={2}>
            <Button type="primary" disabled={selectValue ? false : true} onClick={() => {
              setAddedList(addedList.concat([selectedLabDomain]));
              setSelectValue(null);
            }}>+</Button>
          </Col>
        </Row>
        <Scrollbars autoHeight autoHeightMin={240}>
          <div className="mt-2 pe-1">
            {addedList.length > 0 && addedList.map((o, index) => <Row
              key={index}
              gutter={[4, 4]}
              className="mt-2 pb-2 border-bottom"
            >
              <Col span={22}>
                <div>
                  {o.name}
                </div>
              </Col>
              <Col span={2}>
                <Popconfirm title="ต้องการลบรายการนี้ ？" okText="Yes" onConfirm={() => {
                  handleDeleteAddedLabDomain(index);
                }} cancelText="No">
                  <button className="btn-table deleterow" style={{
                    margin: "auto"
                  }}>
                    <DeleteOutlined />
                  </button>
                </Popconfirm>
              </Col>
            </Row>)}
          </div>
        </Scrollbars>
      </div>
    </Modal>
    <Notifications setModal={() => {
      setShowNotificationsModal(false);
      setProcessResult({});
      setNotificationsTitle(null);
      setNotificationType(null);
    }} isVisible={showNotificationsModal} response={processResult} title={notificationsTitle} type={notificationType} />
  </div>;
}