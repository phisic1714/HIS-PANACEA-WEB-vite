import { Button, Col, Divider, Form, Input, Modal, Row, Select, Spin, Table } from 'antd';
import axios from "axios";
import dayjs from "dayjs";
import { without, toNumber, maxBy } from 'lodash';
import { nanoid } from 'nanoid';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { BsTrash } from 'react-icons/bs';
import { HiPlus } from 'react-icons/hi';
import styled from 'styled-components';
import { env } from '../../env.js';
import Notifications from './Notifications';

const TableAddActivity = styled(Table)`
th.ant-table-cell.ant-table-selection-column .ant-table-selection{
    display: none;
}
`;

const DelectButton = styled(Button)`
    :active{
        color: #E53935;
        background-color: #FFEBEE;
        border: none;
        box-shadow: 0px 1px 3px 0px #bdbdbd !important;
        transition: background-color 500ms;
    }
    :focus{
        color: #E53935;
        background-color: #FFEBEE;
        border: none;
        box-shadow: 0px 1px 3px 0px #bdbdbd !important;
        transition: background-color 500ms;
    }
`;

const CreateAndEditActivity = forwardRef(function CreateAndEditActivity({
  visible,
  setShowAppointmentActivity,
  reload,
}, ref) {
  const [loading, setLoading] = useState(false);
  const [addActivityForm] = Form.useForm();
  const [adviceForm] = Form.useForm();
  const [workPlacesList, setWorkPlacesList] = useState([]);
  //คำแนะนำสำหรับกิจกรรมนี้
  const [activityAdvice, setActivityAdvice] = useState([]);
  //Edit Modal
  const [oldActivity, setOldActivity] = useState({});
  const [oldActivityAdvice, setOldActivityAdvice] = useState([]);
  //เปลี่ยน Modal จาก Create เป็น Edit
  const [checkEdit, setCheckEdit] = useState(false);
  //Notifications modal
  const [showProcessResultModal, setShowProcessResultModal] = useState(false);
  const [titletoModal, setTitleToModal] = useState(null);
  useImperativeHandle(ref, () => ({
    setWorkPlacesList: props => setWorkPlacesList(props),
    setAddActivityForm: props => addActivityForm.setFieldsValue(props),
    setActivityAdvice: props => setActivityAdvice(props),
    setOldActivityAdvice: props => setOldActivityAdvice(props),
    setOldActivity: props => setOldActivity(props),
    setCheckEdit: props => setCheckEdit(props)
  }));
  const getWorkPlacesAppointMas = async () => {
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/OpdExamination/GetWorkPlacesAppointMas`).then(res => {
      if (res.data.responseData?.length > 0) {
        let newRes = res.data.responseData.filter(val => val.datadisplay !== null);
        setWorkPlacesList(newRes);
      }
    }).catch(error => {
      return error;
    });
  };
  const addActivitySubmit = param => {
    if (!checkEdit) {
      createActivities(param);
    } else {
      editActivities(param);
    }
  };
  const adviceSubmit = async param => {
    setActivityAdvice(activityAdvice => [...activityAdvice, param]);
    adviceForm.resetFields();
  };
  const createActivities = async param => {
    setLoading(true);
    const userFromSession = JSON.parse(sessionStorage.getItem('user'));
    let user = userFromSession.responseData.userId;
    let reqData = {
      requestData: {
        name: param.name,
        workId: param.workId ? param.workId : null,
        userCreated: user
      }
    };
    await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/InsTbmAppointmentActivities`, reqData).then(res => {
      if (!res.data.isSuccess) {
        return showError();
      }
    }).catch(error => {
      return error;
    });
    let error = false;
    reqData = {
      requestData: {
        search: null,
        workId: null
      }
    };
    let newActivityAdvice = activityAdvice.filter(val => val.detailDesc !== "");
    if (newActivityAdvice.length > 0) {
      let resData = [];
      await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/GetAppointmentActivities`, reqData).then(res => {
        if (!res.data.isSuccess) {
          error = true;
          showError();
        }
        resData = res.data.responseData;
      }).catch(error => {
        return error;
      });
      if (!error) {
        resData = resData.map(val => {
          return {
            activityId: toNumber(val.activityId)
          };
        });
        let activityId = String(maxBy(resData, 'activityId').activityId);
        reqData = {
          requestData: newActivityAdvice.map(val => {
            return {
              ...val,
              activityId: activityId,
              userCreated: user,
              dateCreated: dayjs().format("YYYY-MM-DD")
            };
          })
        };
        await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/InsTbmAppointmentActivitiesDetail`, reqData).then(res => {
          if (!res.data.isSuccess) {
            error = true;
            showError();
          }
        }).catch(error => {
          return error;
        });
      }
    }
    if (!error) {
      setTitleToModal({
        title: "สร้างกิจกรรมสำเร็จ",
        type: "success"
      });
      setShowProcessResultModal(true);
    }
    setLoading(false);
    closeCreate();
    await reload(true);
  };
  const editActivities = async param => {
    setLoading(true);
    const userFromSession = JSON.parse(sessionStorage.getItem('user'));
    let user = userFromSession.responseData.userId;
    let reqData = {};
    //update activity
    let workId = param.workId ? param.workId : null;
    // console.log(param.name!==oldActivityAdvice[0].name || workId!==oldActivityAdvice[0].workId);
    if (param.name !== oldActivity.name || param.workId !== oldActivity.workId) {
      reqData = {
        requestData: {
          activityId: oldActivity.activityId,
          name: param.name,
          workId: workId,
          userModified: user
        }
      };
      await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/UpdTbmAppointmentActivities`, reqData).then(res => {
        if (!res.data.isSuccess) {
          return showError();
        }
      }).catch(error => {
        return error;
      });
    }
    let error = false;
    let newActivityAdvice = activityAdvice.filter(val => val.detailDesc && val);
    //insert activityAdvice
    let arrReq = newActivityAdvice.filter((val, index) => index >= oldActivityAdvice.length);
    if (arrReq.length > 0 && newActivityAdvice.length > 0) {
      reqData = {
        requestData: arrReq.map(val => {
          return {
            ...val,
            activityId: oldActivity.activityId,
            userCreated: user,
            dateCreated: dayjs().format("YYYY-MM-DD")
          };
        })
      };
      await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/InsTbmAppointmentActivitiesDetail`, reqData).then(res => {
        if (!res.data.isSuccess) {
          error = true;
          showError();
        }
      }).catch(error => {
        return error;
      });
    }
    //update activityAdvice
    arrReq = oldActivityAdvice.filter((val, index) => index < newActivityAdvice.length);
    if (arrReq.length > 0 && newActivityAdvice.length > 0) {
      reqData = {
        requestData: arrReq.map((val, index) => {
          return {
            actDtlId: val.actDtlId,
            activityId: oldActivity.activityId,
            detailDesc: newActivityAdvice[index].detailDesc,
            dateCreated: dayjs().format("YYYY-MM-DD"),
            //api require
            userCreated: user
          };
        })
      };
      await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/UpdTbmAppointmentActivitiesDetail`, reqData).then(res => {
        if (!res.data.isSuccess) {
          error = true;
          showError();
        }
      }).catch(error => {
        return error;
      });
    }

    //delete activityAdvice
    arrReq = oldActivityAdvice.filter((val, index) => index >= newActivityAdvice.length);
    if (arrReq.length > 0) {
      reqData = {
        requestData: arrReq.map((val,) => {
          return {
            actDtlId: val.actDtlId
          };
        })
      };
      await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/DelTbmAppointmentActivitiesDetail`, reqData).then(res => {
        if (!res.data.isSuccess) {
          error = true;
          showError();
        }
      }).catch(error => {
        return error;
      });
    }
    if (!error) {
      setTitleToModal({
        title: "บันทีกกิจกรรมสำเร็จ",
        type: "success"
      });
      setShowProcessResultModal(true);
    }
    setLoading(false);
    closeCreate();
    reload(true);
  };
  const showError = () => {
    setTitleToModal({
      title: !checkEdit ? "สร้างกิจกรรมไม่สำเร็จ" : "บันทีกกิจกรรมไม่สำเร็จ",
      type: "error"
    });
    setShowProcessResultModal(true);
    setLoading(false);
    closeCreate();
  };
  const closeCreate = () => {
    setShowAppointmentActivity(false);
    addActivityForm.resetFields();
    adviceForm.resetFields();
    setActivityAdvice([]);
    setOldActivity({});
    setCheckEdit(false);
  };
  useEffect(() => {
    if (!ref) {
      setLoading(true);
      getWorkPlacesAppointMas();
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>
    <Modal visible={visible} closable={false} onCancel={() => closeCreate()} title={<div className="text-start">
      <label className="topic-bold" style={{
        fontSize: "18px"
      }}>
        {!checkEdit ? "8.8.1.สร้างกิจกรรมการนัด" : "แก้ไขกิจกรรมการนัด"}
      </label>
    </div>} footer={[<Row justify="center" key="footer">
      <Button key="cancel" style={{
        width: "100px"
      }} onClick={() => closeCreate()}>ออก</Button>
      {!checkEdit ? <Button key="ok" type="primary" style={{
        width: "100px"
      }} onClick={() => addActivityForm.submit()}>สร้าง</Button> : <Button key="ok" type="primary" style={{
        width: "100px"
      }} onClick={() => addActivityForm.submit()}>บันทึก</Button>}
    </Row>]} width={1000}>
      <Spin spinning={loading}>
        <div>
          <Form form={addActivityForm} layout="vertical" onFinish={addActivitySubmit} requiredMark={false}>
            <Row style={{
              flexDirection: "row"
            }}>
              <Col span={8} style={{
                padding: 0
              }}>
                <Form.Item style={{
                  marginBottom: 4
                }} label={<label className="gx-text-primary-bold">ชื่อกิจกรรม<span style={{
                  color: "red"
                }}> *</span></label>} name="name" rules={[{
                  required: true,
                  message: "กรุณาระบุกิจกรรม"
                }]}>
                  <Input placeholder="ระบุกิจกรรม" /* autoComplete="off" */ />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item style={{
                  marginBottom: 4
                }} label=" " name="workId">
                  <Select placeholder="ห้องตรวจ" allowClear showSearch optionFilterProp="children" filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} options={workPlacesList.map(n => ({
                    value: n.datavalue,
                    label: n.datadisplay
                  }))} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div style={{
            margin: "0px -23px 0px -23px"
          }}>
            <Divider />
          </div>
          <Form form={adviceForm} style={{
            marginTop: 16
          }} layout="vertical" onFinish={adviceSubmit} requiredMark={false}>
            <Form.Item style={{
              marginBottom: 16
            }} label={<label className="gx-text-primary-bold">คำแนะนำ</label>} name="detailDesc" rules={[{
              required: true,
              message: "กรุณาระบุคำแนะนำ"
            }]}>
              <>
                <Input placeholder="ระบุคำแนะนำ" style={{
                  width: "80%"
                }} onChange={e => adviceForm.setFieldsValue({
                  detailDesc: e.target.value
                })} />
                <Button style={{
                  width: "50px",
                  position: "absolute",
                  marginBottom: 0,
                  marginLeft: 10
                }} type="primary" icon={<HiPlus size="25px" />} onClick={() => {
                  adviceForm.submit();
                }} />
              </>
            </Form.Item>
          </Form>
          <label className="gx-text-primary-bold">คำแนะนำสำหรับกิจกรรมนี้</label>
          <div style={{
            width: "100%"
          }}>
            {activityAdvice.map((val, index) => {
              return <Row align='middle' key={index} style={{
                flexDirection: "row",
                marginTop: 8
              }}>
                <Col span={22} /* style={{ padding: 0 }} */>
                  <Input onChange={e => {
                    let newActivityAdvice = activityAdvice;
                    newActivityAdvice[index].detailDesc = e.target.value;
                    setActivityAdvice([...newActivityAdvice]);
                  }} value={val.detailDesc} />
                </Col>
                <Col span={2} style={{
                  padding: 0,
                  textAlign: "left"
                }}>
                  <DelectButton onClick={() => setActivityAdvice(activityAdvice.filter((val, indexa) => indexa !== index))} style={{
                    margin: "0px 0px 0px 5px",
                    borderRadius: "50px",
                    lineHeight: "0px",
                    width: "28px"
                  }} className="btn-Cancel" icon={<BsTrash size="20px" style={{
                    padding: 0
                  }} />} />
                </Col>
              </Row>;
            })}
          </div>
        </div>
      </Spin>
    </Modal>
    <Notifications setModal={isVisible => {
      setShowProcessResultModal(isVisible);
      setTitleToModal(null);
    }} isVisible={showProcessResultModal} title={titletoModal?.title} type={titletoModal?.type} />
  </>;
});
function AddActivity({
  visible,
  onCancel,
  onAdd
}) {
  //สร้างกิจกรรมการนัด
  const [reload, setReload] = useState(false);
  const [showAppointmentActivity, setShowAppointmentActivity] = useState(false);
  //RX กิจกรรม
  const [rxActivityOption, setRxActivityOption] = useState([]);
  const [parentSelectedRowKeys, setParentSelectedRowKeys] = useState([]);
  const [childSelectedRowKeys, setChildSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loadingAppointmentActivity, setLoadingAppointmentActivity] = useState(false);
  const [searchAct, setSearchAct] = useState("");
  const [pageCurrent, setPageCurrent] = useState(1);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const parentColumns = [{
    width: 'auto',
    title: 'กิจกรรม',
    key: 'activityId',
    render: (_, record) => <>{`${record.mapping1 || ""} ${record.name}`}</>
  }];
  const expandedRowRender = (record,) => {
    const childData = record.activitiesDetails;
    const childColumns = [{
      title: 'คำแนะนำ',
      dataIndex: 'detailDesc',
      key: 'actDtlId'
    }];
    return <Table rowKey={"actDtlId"} columns={childColumns} dataSource={childData} pagination={false} rowSelection={childRowSelection} />;
  };
  const onParentSelectChange = (record, selected,) => {
    let parentArr = [...parentSelectedRowKeys];
    let childArr = [...childSelectedRowKeys];
    //setChildArr: select all child options under the parent Table
    let setChildArr = dataSource.find(d => d.activityId === record.activityId).activitiesDetails.map(item => item.actDtlId);
    //The first step is to determine the selected true: selected, false, unselected
    if (selected) {
      //The second step, the parent table is selected, and the child tables are all selected
      parentArr.push(record.activityId);
      childArr = Array.from(new Set([...setChildArr, ...childArr]));
    } else {
      //The second step is to uncheck the parent table and uncheck all the child tables
      parentArr.splice(parentArr.findIndex(item => item === record.activityId), 1);
      childArr = childArr.filter(item => !setChildArr.some(e => e === item));
    }
    //The third step is to set the SelectedRowKeys of the parent and child
    setParentSelectedRowKeys(parentArr);
    setChildSelectedRowKeys(childArr);
  };
  const onParentSelectAll = (selected, selectedRows, changeRows) => {
    let parentArr = [...parentSelectedRowKeys];
    let setChildArr = [];
    changeRows.forEach(e => {
      setChildArr = [...setChildArr, ...e.activitiesDetails.map(item => item.actDtlId)];
    });
    //The first step is to judge selected true: select all, false: cancel all selection
    if (selected) {
      //Step 2: Select the parent Table, select all the child Tables, and set the SelectedRowKeys of the child Table

      parentArr = Array.from(new Set([...parentArr, ...changeRows.map(item => item.actDtlId)]));
      setChildSelectedRowKeys(setChildArr);
    } else {
      //Step 2: Uncheck the parent Table, uncheck all the child Tables, set the SelectedRowKeys of the child Table
      parentArr = parentArr.filter(item => !changeRows.some(e => e.actDtlId === item));
      setChildSelectedRowKeys([]);
    }
    //The third step: Set the SelectedRowKeys of the parent Table
    setParentSelectedRowKeys(parentArr);
  };
  const onChildSelectChange = (record, selected, selectedRows) => {
    //record: current operation line
    //selected selected state
    //selectedRows: selected array
    let childArr = [...childSelectedRowKeys];
    //The first step is to judge selected true: selected, false: unselected
    if (selected) {
      childArr.push(record.actDtlId);
    } else {
      childArr.splice(childArr.findIndex(item => item === record.actDtlId), 1);
    }
    // eslint-disable-next-line no-unused-vars
    selectedRows = selectedRows.filter(a => a !== undefined);
    //The second step is to determine whether the length of selectedRows is the length of the child in the data. If it is equal, select the parent table.
    for (let item of dataSource) {
      if (item.activitiesDetails.find(d => d.actDtlId === record.actDtlId)) {
        let parentArr = [...parentSelectedRowKeys];
        if (!parentArr.includes(item.activityId)) {
          parentArr.push(item.activityId);
        }
        setParentSelectedRowKeys(parentArr);
        break;
      }
    }
    setChildSelectedRowKeys(childArr);
  };
  const onChildSelectAll = (selected, selectedRows, changeRows) => {
    //selected: select all true, cancel select all false
    //selectedRows: changed
    //changeRows: all arrays changed
    //The first step: judge selected, true: select all sub-tables, false: uncheck all sub-tables
    let childArr = [...childSelectedRowKeys];
    if (selected) {
      //select all 
      childArr = Array.from(new Set([...childArr, ...changeRows.map(item => item.actDtlId)]));
    } else {
      //Unselect all
      childArr = childArr.filter(item => !changeRows.some(e => e.actDtlId === item));
    }
    //Step 2: Find the row of the parent Table corresponding to the child Table, and then judge selected, true: select the row of the parent Table, false: unselect the row of the parent Table
    for (let item of dataSource) {
      if (item.activitiesDetails.find(d => d.actDtlId === changeRows[0].actDtlId)) {
        let parentArr = [...parentSelectedRowKeys];
        if (selected) {
          //select all 
          parentArr.push(item.activityId);
        } else {
          //Unselect all
          parentArr.splice(parentArr.findIndex(item => item === item.activityId), 1);
        }
        setParentSelectedRowKeys(parentArr);
        break;
      }
    }
    setChildSelectedRowKeys(childArr);
  };
  const childRowSelection = {
    selectedRowKeys: childSelectedRowKeys,
    onSelect: onChildSelectChange,
    onSelectAll: onChildSelectAll
  };
  const parentRowSelection = {
    selectedRowKeys: parentSelectedRowKeys,
    onSelect: onParentSelectChange,
    onSelectAll: onParentSelectAll
  };
  const onSearch = value => {
    setParentSelectedRowKeys([]);
    setChildSelectedRowKeys([]);
    if (value) {
      setSearchAct(value);
      setDataSource(rxActivityOption.filter(item => item.name.toLowerCase().includes(value.toLowerCase()) || (item.mapping1 === null ? false : item.mapping1?.toLowerCase().includes(value.toLowerCase()))));
    } else {
      setSearchAct("");
      setDataSource(rxActivityOption);
    }
  };
  // console.log("rxActivityList",rxActivityList);
  const onExpandedRowsChange = expandRow => {
    setExpandedRowKeys(expandRow);
  };
  const onAddActivity = async () => {
    let data = [];
    // eslint-disable-next-line array-callback-return
    dataSource.map(item => {
      if (parentSelectedRowKeys.includes(item.activityId)) {
        data = [...data, {
          ...item,
          // eslint-disable-next-line array-callback-return
          activitiesDetails: without(item.activitiesDetails.map(child => {
            if (childSelectedRowKeys.includes(child.actDtlId)) {
              return child.detailDesc;
            }
          }), undefined),
          key: nanoid(),
          activityDesc: item.name
        }];
      }
    });

    let dummy = data;
    dummy = dummy.map(item => item.activitiesDetails.length > 0 ? [...item.activitiesDetails.map((child, index) => {
      return {
        ...item,
        activitiesDetails: item.activitiesDetails[index],
        activityDesc: `${item.name} ${item.activitiesDetails[index]}`,
        name: `${item.name} ${item.activitiesDetails[index]}`
      };
    })] : [{
      ...item,
      activitiesDetails: ""
    }]);
    let dummy_step_2 = dummy;
    onAdd(dummy_step_2.flat().map(item => {
      return {
        ...item,
        key: nanoid(),
        quantity: null
      };
    }));
    onCancel();
    setDataSource([]);
    setParentSelectedRowKeys([]);
    setChildSelectedRowKeys([]);
    setExpandedRowKeys([]);
    setPageCurrent(1);
  };

  const getAppointmentActivities = async search => {
    setLoadingAppointmentActivity(true);
    await axios(`${env.REACT_APP_PANACEACHS_SERVER}/api/Appointment/GetAppointmentActivities`, {
      method: "POST",
      data: {
        requestData: {
          search: search,
          workId: null
        }
      }
    }).then(res => {
      if (res.data.isSuccess) {
        setRxActivityOption(res.data.responseData);
        setDataSource(res.data.responseData);
      } else {
        setDataSource([]);
        setRxActivityOption([]);
      }
    }).catch(error => {
      return error;
    }).finally(() => {
      setSearchAct("");
      setLoadingAppointmentActivity(false);
    });
  };
  useEffect(() => {
    if (visible) {
      getAppointmentActivities(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  useEffect(() => {
    if (searchAct) {
      // getAppointmentActivities(searchAct)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);
  return <div>
    <Modal
      centered
      visible={visible} onCancel={() => {
        onCancel();
        setSearchAct("");
        setDataSource([]);
        setParentSelectedRowKeys([]);
        setChildSelectedRowKeys([]);
        setExpandedRowKeys([]);
        setPageCurrent(1);
      }} closable={false} title={<Row align="middle">
        <Col span={20}>
          <div className="text-start">
            <label className="topic-bold" style={{
              fontSize: "18px"
            }}>เพิ่มกิจกรรม</label>
          </div>
        </Col>
        <Col span={4}>
          <div className="text-end" style={{
            paddingTop: "10px"
          }}>
            <Button style={{
              width: "50px"
            }} type="primary" icon={<HiPlus size="25px" />} onClick={() => setShowAppointmentActivity(true)} />
          </div>
        </Col>
      </Row>} footer={<div className="text-center">
        <Button type="secondary" style={{
          width: "100px"
        }} onClick={() => {
          onCancel();
          setSearchAct("");
          setDataSource([]);
          setParentSelectedRowKeys([]);
          setChildSelectedRowKeys([]);
          setExpandedRowKeys([]);
          setPageCurrent(1);
        }}>ยกเลิก</Button>
        <Button type="primary" onClick={() => onAddActivity()} style={{
          width: "100px"
        }}>เพิ่มกิจกรรม</Button>
      </div>} width={1000}>
      <div style={{ margin: -8 }}>
        <Row gutter={[8, 8]}>
          <Input.Search
            placeholder="ค้นหากิจกรรม"
            onSearch={onSearch} value={searchAct}
            onChange={e => setSearchAct(e.target.value)}
            style={{ width: 345 }}
            allowClear={true}
          />
        </Row>
        <TableAddActivity
          size="small"
          loading={loadingAppointmentActivity}
          pagination={{
            current: pageCurrent,
            pageSize: 50,
            showSizeChanger: false
          }}
          scroll={{ y: 345 }}
          onChange={pagination => {
            setPageCurrent(pagination.current);
          }}
          rowKey={"activityId"}
          rowClassName={"data-value"}
          style={{
            width: "100%",
            minHeight: "393px"
          }}
          columns={parentColumns}
          dataSource={dataSource}
          expandable={{
            expandedRowRender: expandedRowRender,
            rowExpandable: record => record.activitiesDetails.length > 0,
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: onExpandedRowsChange
          }}
          rowSelection={parentRowSelection}
        />
      </div>
    </Modal>
    <CreateAndEditActivity visible={showAppointmentActivity} setShowAppointmentActivity={setShowAppointmentActivity} reload={async val => {
      val === true && (await setReload(reload + 1));
      await getAppointmentActivities(searchAct);
      console.log("เข้า");
    }} />
  </div>;
}
export { AddActivity, CreateAndEditActivity };
