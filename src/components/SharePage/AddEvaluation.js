import React, { useEffect, useLayoutEffect, useState } from 'react';
import { env } from '../../env.js';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Table, Upload, message } from 'antd';
import axios from 'axios';
import BreadcrumbMenu from 'components/Breadcrumb/BreadcrumbMenu';
import LeavePageAlert from 'components/Modal/LeavePageAlert';
import Topbar from 'containers/Topbar';
import { assessment } from '../../appRedux/actions/HealthCheckup';
import { cloneDeep } from 'lodash';
import { nanoid } from 'nanoid';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { toast } from 'react-toastify';
export class ClassHeathCheckMakeAssessmentApi {
  static async getAssessmentCode(id) {
    const result = axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/HealthCheckup/GetAssessmentCode/${id}`).then(res => {
      if (res.data.isSuccess) {
        return res.data.responseData;
      }
    }).catch(error => {
      return error;
    });
    return result;
  }
  static async getOpdAssessmentByAssessmentId(id) {
    return axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/HealthCheckup/GetAssessmentDetailByAssessmentId/${id}`).then(res => {
      if (res.data.isSuccess) {
        return res.data.responseData;
      }
    }).catch(error => {
      alert(error);
      return null;
    });
  }
  static async UpsertAssessmentMaster(data) {
    const result = axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/HealthCheckup/UpsertAssessmentMaster`, {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": data,
      "barcode": null
    }).then(res => {
      if (res.data.isSuccess) {
        return res.data.responseData;
      } else {
        return null;
      }
    }).catch(error => {
      alert(error);
      return null;
    });
    return result;
  }
  static async GetAssessmentMaster() {
    const result = axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/HealthCheckup/GetAssessmentMaster`, {
      "mode": null,
      "user": null,
      "ip": null,
      "lang": null,
      "branch_id": null,
      "requestData": {
        "code": null,
        "name": null,
        "filtertype": null,
        "page": null,
        "rows": null,
        "getAll": true
      },
      "barcode": null,
      "page": null
    }).then(res => {
      if (res.data.isSuccess) {
        return res.data.responseData;
      } else {
        return null;
      }
    })
    return result;
  }
}

const toastSetting = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  className: "toastBodyClassName"
};

const UploadCustom = styled(Upload)`
.ant-upload-list{
    display:flex;
}
.ant-upload-list-picture-card-container{
    width:60px;
    height:60px;
}
.ant-upload.ant-upload-select-picture-card{
    width:60px;
    height:60px;
}
`;
const TableCustom = styled(Table)`
  .ant-table-container table > thead > tr:first-child th:last-child{
      display:flex;
      justify-content:flex-end;
  }
`;
export default function AddEvaluation({ page = null, name = "" }) {
  const [form] = Form.useForm();
  const [formAddQuestion] = Form.useForm();
  const [formEditQuestion] = Form.useForm();
  const [selectedRows, setSelectRows] = useState([]);
  const [addQuestionVisible, setAddQuestionVisible] = useState(false);
  const [editQuestionVisible, setEditQuestionVisible] = useState(false);
  const [duplicateQuestionVisible, setDuplicateQuestionVisible] = useState(false);
  const [getData, setGetData] = useState([]);
  const [assessData, setAssessData] = useState({
    question: []
  });
  const [assessDataNew, setAssessDataNew] = useState({
    question: []
  });
  const [loading, setLoading] = useState(false);
  const {
    assessment: assessDataRedux
  } = useSelector(({
    healthCheckup
  }) => healthCheckup);
  const dispatch = useDispatch();
  const onAddMainToOpenModalFinish = ({
    cancelFlag,
    ...rest
  }) => {
    formAddQuestion.setFieldsValue({
      ...rest,
      cancelFlag: cancelFlag ? "Y" : null,
      assessmentTmpId: nanoid(),
      question: []
    });
    setAddQuestionVisible(true);
  };
  const onClickDuplicate = () => {
    console.log("alassessDataNewlData", assessDataNew);
    console.log(selectedRows);
    let allData = form.getFieldsValue();
    const {
      code,
      name
    } = allData;
    if (!code || !name) {
      form.submit();
      return;
    }
    let question = assessDataNew.question.map(data => {
      let mainKey = nanoid();
      return {
        ...data,
        key: mainKey,
        questionTmpId: nanoid(),
        questionId: null,
        children: data.children.filter(child => selectedRows.includes(child.key)).map(mapData => ({
          ...mapData,
          mainId: mainKey,
          answerId: null,
          key: nanoid()
        }))
      };
    }).filter(finalChild => finalChild.children.length > 0);
    console.log("allData", allData);
    console.log("assessDataNewQuestion", question);
    formAddQuestion.setFieldsValue({
      ...allData,
      question: question
    });
    setDuplicateQuestionVisible(true);
  };
  const onDuplicateFinish = val => {
    let tmpData = {
      ...assessDataNew,
      ...val,
      question: [...assessDataNew.question, ...val.question]
    };
    setAssessDataNew(tmpData);
    setDuplicateQuestionVisible(false);
    formAddQuestion.resetFields();
  };
  function compareObjects(old, newData) {
    const results = {
      ...form.getFieldsValue(),
      question: [],
      action: "update"
    };

    // Iterate through new questions
    newData.question.forEach(newQuestion => {
      const existingQuestion = old.question.find(oldQuestion => oldQuestion.questionId === newQuestion.questionId);
      if (existingQuestion) {
        // Question exists in both old and new, compare children
        const children = [];
        newQuestion.children.forEach(newChild => {
          const existingChild = existingQuestion.children.find(oldChild => oldChild.answerId === newChild.answerId);
          if (existingChild) {
            // Child exists in both old and new, check for updates
            if (JSON.stringify(existingChild) !== JSON.stringify(newChild)) {
              children.push({
                ...newChild,
                action: "update"
              });
            }
          } else {
            // Child only exists in new, mark for insertion
            children.push({
              ...newChild,
              action: "insert"
            });
          }
        });
        existingQuestion.children.forEach(oldChild => {
          const doesExist = newQuestion.children.some(newChild => oldChild.answerId === newChild.answerId);
          if (!doesExist) {
            // Child only exists in old, mark for deletion
            children.push({
              ...oldChild,
              action: "delete"
            });
          }
        });
        if (children.length > 0) {
          results.question.push({
            ...newQuestion,
            children
          });
        }
      } else {
        // Question only exists in new, mark for insertion
        results.question.push({
          ...newQuestion,
          action: "insert",
          children: newQuestion.children?.map(data => ({
            ...data,
            action: "insert"
          }))
        });
      }
    });
    old.question.forEach(oldQuestion => {
      const doesExist = newData.question.some(newQuestion => oldQuestion.questionId === newQuestion.questionId);
      if (!doesExist) {
        // Question only exists in old, mark for deletion
        results.question.push({
          ...oldQuestion,
          action: "delete",
          children: []
        });
      }
    });
    return results;
  }
  const onFinalSave = async () => {
    setLoading(true);
    console.log("AssessDataNew", assessDataNew);
    console.log("AssessDataOld", assessData);
    const convertOtherFlag = flag => flag ? "Y" : null;
    let result = {};
    //ชั้นแรก 
    if (assessData.question.length > 0) {
      result = compareObjects(assessData, assessDataNew);
    } else {
      result = {
        ...assessDataNew,
        action: "insert"
      };
    }
    result = cloneDeep(result);
    result = {
      ...result,
      filterType: "D",
      cancelFlag: convertOtherFlag(form.getFieldValue("cancelFlag"))
    };

    // Modify the children array in results to convert otherFlag
    result.question.forEach(question => {
      question.children = question.children.map(child => ({
        ...child,
        otherFlag: convertOtherFlag(child.otherFlag),
        picture: child.picture ? child.picture[0] ? `${child.picture[0]?.thumbUrl?.split(",")[1]}` : null : null,
        pictureName: child.picture ? child.picture[0] ? `${child.picture[0].name}` : null : null
      }));
    });
    console.log("result", result);
    let assessmentId = await ClassHeathCheckMakeAssessmentApi.UpsertAssessmentMaster(result);
    if (assessmentId) {
      let data = await ClassHeathCheckMakeAssessmentApi.getOpdAssessmentByAssessmentId(assessmentId);
      prepareData(data);
      toast.success('บันทึกสำเร็จ', toastSetting);
    } else {
      toast.error('บันทึกไม่สำเร็จ', toastSetting);
    }
    fetchData();
    setLoading(false);
  };
  const onSelectRow = (checked, key) => {
    // if (checked) {
    //     if (selectedMain === parentId) {
    //         setSelectRows((data) => [...data, key])
    //     } else {
    //         setSelectMain(parentId)
    //         setSelectRows([key])
    //     }
    // } else {
    //     let prevKeys = [...selectedRows]
    //     let filterKeys = filter(prevKeys, o => o !== key)
    //     if (filterKeys.length) {
    //         setSelectRows(filterKeys)
    //     } else {
    //         setSelectMain("")
    //         setSelectRows(filterKeys)
    //     }
    // }
    if (checked) {
      setSelectRows(data => [...data, key]);
    } else {
      let prevKeys = [...selectedRows];
      let filterKeys = prevKeys.filter(o => o !== key);
      setSelectRows(filterKeys);
    }
  };
  const handleEditQuestion = index => {
    let allData = form.getFieldsValue();
    // console.log("assessDataNew", assessDataNew);
    formEditQuestion.setFieldsValue({
      ...allData,
      editItem: index,
      question: [assessDataNew.question[index]]
    });
    setEditQuestionVisible(true);
  };
  const handleDeleteQuestion = id => {
    // setQuestionData(questionData.filter((data) => data.questionId !== id))
    let tmpData = {
      ...assessDataNew,
      question: assessDataNew.question.filter((data, index) => index !== id)
    };
    setAssessDataNew(tmpData);
  };
  const onAddFinish = data => {
    console.log("AddAssessDataNewAfterAdd", data);
    setAssessDataNew({
      ...data,
      question: [...assessDataNew.question, ...data.question]
    });
    formAddQuestion.resetFields();
    setAddQuestionVisible(false);
  };
  const onEditFinish = data => {
    let newData = data;
    let prepareData = {
      ...assessDataNew
    };
    prepareData.question[data.editItem] = data.question[0] || [];
    newData = newData.editItem = null;
    setAssessDataNew({
      ...newData,
      question: prepareData.question
    });
    formEditQuestion.resetFields();
    setEditQuestionVisible(false);
  };
  const columns = [{
    title: 'ชุดคำถาม',
    key: 'assessmentId',
    width: "90%",
    render: (_, record) => (
      <div key={record.assessmentId}>
        {record.main ? (
          <div>{record.name}</div>
        ) : (
          <>
            {/* <Checkbox.Group value={selectedRows}> */}
            <Checkbox
              checked={selectedRows.includes(record.assessmentId)}
              value={record.assessmentId}
              onChange={e => onSelectRow(e.target.checked, record.assessmentId, record.mainId)}
            >
              {record.name}
            </Checkbox>
            {/* </Checkbox.Group> */}
          </>
        )}
      </div>
    )
  }, {
    fixed: "right",
    title: <Button onClick={() => form.submit()} type="primary" style={{
      margin: 0
    }} icon={<PlusCircleOutlined />}></Button>,
    width: "10%",
    key: 'questionId',
    render: (_, record, index) => <div key={record.questionId}>
      {record.main ? <div style={{
        display: "flex",
        alignItems: "right",
        justifyContent: "flex-end"
      }}>
        <Button
          style={{
            backgroundColor: "#1064eb",
            margin: 0
          }}
          onClick={() => handleEditQuestion(index)}
          shape='circle'
          icon={<EditOutlined />}
        />
        <Popconfirm title="ต้องการลบหรือไม่ ？" okText="Yes"
          onConfirm={() => {
            handleDeleteQuestion(index);
          }} cancelText="No"
        >
          <Button
            style={{
              backgroundColor: "#e81336",
              margin: 0
            }}
            shape='circle'
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      </div> : []}
    </div>
  }];
  const prepareData = data => {
    if (data) {
      data = {
        ...data,
        assessmentTmpId: nanoid(),
        cancelFlag: data.cancelFlag ? true : false,
        question: data.question?.map(question => {
          let mainKey = nanoid();
          return {
            ...question,
            key: mainKey,
            main: true,
            questionTmpId: nanoid(),
            children: question.children?.map(answer => {
              return {
                ...answer,
                key: nanoid(),
                mainId: mainKey,
                otherFlag: answer.otherFlag ? true : false,
                picture: answer.picture ? [{
                  thumbUrl: `data:image/png;base64,${answer.picture}`,
                  status: "done",
                  type: `image/${answer.pictureName?.split(".")[1]}`,
                  name: answer?.pictueName,
                  uid: nanoid()
                }] : []
              };
            })
          };
        })
      };
      form.setFieldsValue({
        assessmentId: data.assessmentId,
        assessmentTmpI: data.dassessmentTmpId,
        cancelFlag: data.cancelFlag,
        code: data.code,
        name: data.name,
        filterType: data.filterType,
        mdCertType: data.mdCertType,
        seq: data.seq,
        workId: data.workId
      });
      setAssessData(data);
      setAssessDataNew(cloneDeep(data));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    let res = await ClassHeathCheckMakeAssessmentApi.GetAssessmentMaster()
    setLoading(false);
    setGetData(res);
  }

  useEffect(() => {
    fetchData();
  }, [])

  useLayoutEffect(() => {
    async function getData(assessmentId) {
      let data = await ClassHeathCheckMakeAssessmentApi.getOpdAssessmentByAssessmentId(assessmentId);
      prepareData(data);
      dispatch(assessment(null));
    }
    if (assessDataRedux) {
      getData(assessDataRedux);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>
    <Topbar
      PatientSearch={false}
      AdmitSearch={false} SearchOpd={false} BtnScan={false} PatientType={false} IsDashBoard={false}
      page={page}
      ShowBtnOutConsult={true}
    />
    <div className="gx-main-content-wrapper">
      <Row>
        <Col span={12}>
          <BreadcrumbMenu />
        </Col>
        <Col span={12}>
          <div className="breadcrumb-card" style={{
            display: "flex",
            justifyContent: "right"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "right"
            }}>
              <Button disabled={loading} style={{
                margin: 0
              }} onClick={() => {
                form.resetFields();
                setAssessData({
                  question: []
                });
                setAssessDataNew({
                  question: []
                });
              }}>เคลียร์</Button>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "right"
            }}>
              <Button type='primary' disabled={!assessDataNew.question.length || loading} style={{
                margin: 0
              }} onClick={onFinalSave}>บันทึก</Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Card loading={loading} title={<Row className='m-auto' style={{
            display: "flex",
            justifyContent: "space-between"
          }}>
            <div>
              <label className="gx-text-primary fw-bold" style={{
                margin: "5px 7px",
                fontSize: 18
              }}>สร้างแบบประเมิน{`${name}`} </label>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "right"
            }}>
              <Button disabled={selectedRows.length === 0} onClick={() => onClickDuplicate()} type='primary' style={{
                margin: 0
              }}>คัดลอกแบบประเมิณ</Button>
            </div>
          </Row>}>
            <Row className='m-auto'>
              <Col style={{
                display: "flex",
                alignItems: "baseline",
                flexDirection: "row",
                flexWrap: "wrap"
              }}>
                <Form form={form} onFinish={onAddMainToOpenModalFinish} layout='vertical'>
                  <Row gutter={[8, 8]} style={{
                    display: "flex",
                    flexDirection: 'row'
                  }}>
                    <div style={{
                      margin: "5px 7px"
                    }}>
                      <Form.Item name="code" rules={[() => ({
                        async validator(_, values) {
                          if (!values) {
                            return Promise.reject(new Error('กรุณากรอกเลข Code'));
                          }
                          const data = await ClassHeathCheckMakeAssessmentApi.getAssessmentCode(values);
                          if (data && !assessData.assessmentId) {
                            return Promise.reject(new Error('ห้ามใส่เลขซ้ำ'));
                          }
                          return Promise.resolve();
                        }
                      })]}>
                        <Input placeholder={"รหัสแบบประเมิน"}>
                        </Input>
                      </Form.Item>
                    </div>
                    <div style={{
                      margin: "5px 7px"
                    }}>
                      <Form.Item name="name" rules={[{
                        required: true,
                        message: "กรุณากรอกชื่อแบบประเมิณ"
                      }]}>
                        <Input placeholder={"ชื่อแบบประเมิน"}>
                        </Input>
                      </Form.Item>
                    </div>
                    <div style={{
                      margin: "5px 7px"
                    }}>
                      <Form.Item name="meaning" initialValue={"C"} rules={[{
                        required: true,
                        message: "กรุณากรอกMeaning"
                      }]}>
                        <Select placeholder={"Meaning"}>
                          <Select.Option value="C">Checkup</Select.Option>
                          <Select.Option value="M">ใบรับรองแพทย์</Select.Option>
                          <Select.Option value="A">แบบประเมิณ</Select.Option>
                          <Select.Option value="D">DUE</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div style={{
                      margin: "5px 7px"
                    }}>
                      <Form.Item name="cancelFlag" noStyle valuePropName='checked'>
                        <Checkbox>ยกเลิก</Checkbox>
                      </Form.Item>
                    </div>
                    <Form.Item hidden={true} name={"assessmentId"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"assessmentTmpId"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"code"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"mdCertType"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"meaningFlag"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"cancelFlag"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"workId"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"filterType"}>
                      <Input></Input>
                    </Form.Item>
                    <Form.Item hidden={true} name={"seq"}>
                      <Input></Input>
                    </Form.Item>
                  </Row>
                </Form>
              </Col>
            </Row>
            <Row className='m-auto'>
              <Col span={24}>
                <TableCustom rowKey="assessmentId" columns={columns} dataSource={getData.results} />
              </Col>
              <Col>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <ModalComponents title={"สร้างชุดคำถาม"} form={formAddQuestion} onFinish={onAddFinish} visible={addQuestionVisible} onCancel={() => {
        setAddQuestionVisible(false);
      }} />
      <ModalComponents title={"แก้ไขชุดคำถาม"} form={formEditQuestion} onFinish={onEditFinish} visible={editQuestionVisible} onCancel={() => {
        setEditQuestionVisible(false);
      }} />
      <ModalComponents title={"คัดลอกชุดคำถาม"} form={formAddQuestion} onFinish={onDuplicateFinish} visible={duplicateQuestionVisible} onCancel={() => {
        setDuplicateQuestionVisible(false);
      }} />
      <LeavePageAlert path="/document%20management/health-checkup-make-assessment-form" isChange={assessDataNew?.question?.length > 0} doAfterChange={onFinalSave} />
    </div>
  </>;
}
export const ModalComponents = ({
  form,
  title,
  onCancel,
  visible,
  onFinish
}) => {
  const getValueFromEvent = event => {
    const {
      fileList
    } = event;
    return [...fileList];
  };
  const handlePreview = data => {
    var w = window.open('about:blank');
    // FireFox seems to require a setTimeout for this to work.
    setTimeout(() => {
      w.document.body.appendChild(w.document.createElement('iframe')).src = data;
      w.document.body.style.margin = 0;
      w.document.getElementsByTagName("iframe")[0].style.width = '100%';
      w.document.getElementsByTagName("iframe")[0].style.height = '100%';
      w.document.getElementsByTagName("iframe")[0].style.border = 0;
    }, 0);
  };
  return <Modal title={`${title}`} visible={visible} closable={false} onCancel={onCancel} onOk={() => form.submit()} width={800}>
    <div>
      <div style={{
        display: "flex",
        flexDirection: "column"
      }}>
        <Row style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}>
          <Col span={18} style={{
            margin: "-14px"
          }}>
            <Form form={form} onFinish={onFinish} layout='vertical'>
              <Form.Item hidden={true} name={"assessmentId"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"assessmentTmpId"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"code"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"mdCertType"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"meaningFlag"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"cancelFlag"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"workId"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"filterType"}>
                <Input></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"seq"}>
                <Input></Input>
              </Form.Item>
              <Form.Item name="name" label={<label className="gx-text-primary">ชื่อแบบประเมิณ</label>} rules={[{
                required: true,
                message: "กรุณากรอกชื่อแบบประเมิณ"
              }]}>
                <Input autoFocus={true}></Input>
              </Form.Item>
              <Form.Item hidden={true} name={"editItem"}>
                <Input></Input>
              </Form.Item>
            </Form>
          </Col>
          <Col span={6}>
            <Button onClick={() => {
              let {
                question,
                assessmentId
              } = form.getFieldsValue();
              question = [...question, {
                key: nanoid(),
                main: true,
                questionId: null,
                questionType: "C",
                assessmentId: assessmentId || null,
                questionTmpId: nanoid(),
                name: null,
                seq: null,
                children: []
              }];
              form.setFieldsValue({
                question: question
              });
            }} style={{
              margin: "11px 0px 0px 0px"
            }} type="primary">เพิ่มคำถาม</Button>
          </Col>
        </Row>
        <Form form={form} onFinish={onFinish}>
          <Form.List name="question">
            {(list, {
              remove,
              index: topIndex
            }) => {
              return <div key={topIndex}>
                {list.map(({
                  key,
                  name,
                }, index) => <div key={key + name + index}>
                    <Row key={key} style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <Col span={12}>
                        <Form.Item hidden={true} name={[index, "assessmentId"]}>
                          <Input></Input>
                        </Form.Item>
                        <Form.Item hidden={true} name={[index, "seq"]}>
                          <Input></Input>
                        </Form.Item>
                        <Form.Item hidden={true} name={[index, "main"]} valuePropName='checked'>
                          <Input></Input>
                        </Form.Item>
                        <Row>
                          <label className="gx-text-primary">คำถาม</label>
                        </Row>
                        <Row style={{
                          margin: "auto"
                        }}>
                          <Form.Item name={[index, "name"]} rules={[{
                            required: true,
                            message: "กรุณากรอก"
                          }]}>
                            <Input autoFocus={true}></Input>
                          </Form.Item>
                        </Row>
                      </Col>
                      <Col span={6}>
                        <Row>
                          <label className="gx-text-primary">&nbsp;</label>
                        </Row>
                        <Row>
                          <Form.Item name={[index, "questionType"]}>
                            <Select onSelect={value => {
                              if (value === "S") {
                                let {
                                  question
                                } = form.getFieldValue();
                                let children = question[index].children || [];
                                if (children.length > 1) {
                                  question[index].children = [question[index].children[0]];
                                  form.setFieldsValue({
                                    question: question
                                  });
                                }
                              }
                            }}>
                              <Select.Option value={"C"}>Choice</Select.Option>
                              <Select.Option value={"S"}>อัตนัย</Select.Option>
                            </Select>
                          </Form.Item>
                        </Row>
                      </Col>
                      <Col span={3}>
                        <Row>
                          <label className="gx-text-primary"></label>
                        </Row>
                        <Row>
                          <Form.Item noStyle shouldUpdate={(prev, cur) => prev !== cur}>
                            {() => {
                              let {
                                question
                              } = form.getFieldValue();
                              const isOne = question[index].questionType === "S";
                              const children = question[index].children || [];
                              const disabled = children.length === 1 && isOne;
                              return <Button disabled={disabled} onClick={() => {
                                let {
                                  question
                                } = form.getFieldValue();
                                let children = question[index].children || [];
                                let maxSeq = children.length === 0 ? 0 : children.reduce((a, b) => +a.seq > +b.seq ? a : b).seq + 1;
                                let addItem = [...children, {
                                  mainId: question[index].key,
                                  answerId: null,
                                  seq: maxSeq,
                                  name: "",
                                  score: 0,
                                  otherFlag: null,
                                  picture: null,
                                  key: nanoid()
                                }];
                                question[index].children = addItem;
                                form.setFieldsValue({
                                  question: question
                                });
                              }} style={{
                                margin: 0
                              }} icon={<PlusCircleOutlined />} type="primary"></Button>;
                            }}
                          </Form.Item>
                        </Row>
                      </Col>
                      <Col span={3}>
                        <Row>
                          <label className="gx-text-primary"></label>
                        </Row>
                        <Row>
                          <Popconfirm title="ต้องการลบหรือไม่ ？" okText="Yes" onConfirm={() => {
                            remove(index);
                          }} cancelText="No">
                            <Button shape='circle' style={{
                              backgroundColor: "#e81336",
                              margin: 0
                            }} icon={<DeleteOutlined />}></Button>
                          </Popconfirm>
                        </Row>
                      </Col>
                    </Row>
                    <Form.List name={[index, "children"]}>
                      {(childs, {
                        remove,
                        index: childIndex,
                        ...rest
                      }) => {
                        return <div key={`${childIndex}`}>
                          {childs.map((child, childIndexs) => {
                            return <Row key={`${childIndexs}${rest.name}${rest.key}`} style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center"
                            }}>
                              <Col span={4}>
                                <Row>
                                  <label className="gx-text-primary">ลำดับ</label>
                                </Row>
                                <Row style={{
                                  margin: "auto"
                                }}>
                                  <Form.Item name={[childIndexs, "seq"]} rules={[{
                                    required: true,
                                    message: "กรุณากรอก"
                                  }]}>
                                    <InputNumber autoFocus={true} controls={false}></InputNumber>
                                  </Form.Item>
                                </Row>
                              </Col>
                              <Col span={7}>
                                <Row>
                                  <label className="gx-text-primary">&nbsp;</label>
                                </Row>
                                <Row style={{
                                  margin: "auto"
                                }}>
                                  <Form.Item name={[childIndexs, "name"]} rules={[{
                                    required: true,
                                    message: "กรุณากรอก"
                                  }]}>
                                    <Input style={{
                                      width: "152px"
                                    }}></Input>
                                  </Form.Item>
                                </Row>
                              </Col>
                              <Col span={4}>
                                <Row>
                                  <label className="gx-text-primary">score</label>
                                </Row>
                                <Row style={{
                                  margin: "auto"
                                }}>
                                  <Form.Item name={[childIndexs, "score"]} rules={[{
                                    required: true,
                                    message: "กรุณากรอก"
                                  }]}>
                                    <InputNumber controls={false} value={child.score}></InputNumber>
                                  </Form.Item>
                                </Row>
                              </Col>
                              <Col span={2}>
                                <Row>
                                  <label className="gx-text-primary">FreeText</label>
                                </Row>
                                <Row>
                                  <Form.Item name={[childIndexs, "otherFlag"]} valuePropName='checked' noStyle>
                                    <Checkbox></Checkbox>
                                  </Form.Item>
                                </Row>
                              </Col>
                              <Col span={4}>
                                <Row>
                                  <label className="gx-text-primary">&nbsp;</label>
                                </Row>
                                <Row>
                                  <Form.Item name={[childIndexs, "picture"]} valuePropName="fileList" getValueFromEvent={getValueFromEvent} noStyle>
                                    <UploadCustom style={{
                                      width: 20
                                    }} listType="picture-card" maxCount={1} onPreview={file => handlePreview(file.thumbUrl)} beforeUpload={(file,) => {
                                      console.log(file);
                                      const isLt2M = file.size / 1024 / 1024 < 2;
                                      if (!isLt2M) {
                                        message.error("Image must smaller than 2MB!");
                                        return Upload.LIST_IGNORE;
                                      } else {
                                        return false;
                                      }
                                      // Prevent antd Upload from uploading the file automatically
                                    }} previewFile={false} onChange={({
                                      file
                                    }) => {
                                      let {
                                        question
                                      } = form.getFieldValue();
                                      if (file.status === "removed") {
                                        question[index].children[childIndexs].picture = [];
                                        form.setFieldsValue({
                                          question: question
                                        });
                                      } else {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = () => {
                                          const base64String = reader.result;
                                          const isLt2M = file.size / 1024 / 1024 < 2;
                                          const format = {
                                            "thumbUrl": base64String,
                                            "name": `answer.${base64String.substr(10).split(";")[0].substr(1)}`,
                                            "status": !isLt2M ? "error" : "done",
                                            "type": base64String.substr(5).split(";")[0],
                                            "uid": file.uid
                                          };
                                          question[index].children[childIndexs].picture = [format];
                                          form.setFieldsValue({
                                            question: question
                                          });
                                        };
                                      }
                                    }} accept=".jpeg, .jpg, .png">
                                      <UploadOutlined />
                                    </UploadCustom>
                                  </Form.Item>
                                </Row>
                              </Col>
                              <Col span={2}>
                                <Row>
                                  <label className="gx-text-primary"></label>
                                </Row>
                                <Row>
                                  <Popconfirm title="ต้องการลบหรือไม่ ？" okText="Yes" onConfirm={() => {
                                    remove(childIndexs);
                                  }} cancelText="No">
                                    <Button shape='circle' style={{
                                      backgroundColor: "#e81336",
                                      margin: 0
                                    }} icon={<DeleteOutlined />}></Button>
                                  </Popconfirm>
                                </Row>
                              </Col>
                            </Row>;
                          })}
                        </div>;
                      }}
                    </Form.List>
                    <Divider />
                  </div>)}
              </div>;
            }}
          </Form.List>
        </Form>
      </div>
    </div>
  </Modal>;
};