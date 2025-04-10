
import { useEffect, useState } from "react";

import { GetPatientsByPatientId } from "../../routes/AdmissionCenter/API/AdmitRegisterApi";

import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Image,
  Modal,
  Row,
} from "antd";

import { BiFemaleSign, BiMaleSign } from "react-icons/bi";
import { FaRegStickyNote } from "react-icons/fa";

import EMessage from "../Modal/EMessageAntdDatePicker";
import PatientDetailsChangesInformation from "./PatientDetailsChangesInformation";

const useStyle = {
  header: {
    col: {
      color: "white",
    },
    img: {
      width: 100,
      height: 100,
    },
  },
  layout: {
    backgroundColor: "white",
  },
};

const onError = (e) => {
  e.setPageCurrent.onError = null;
  e.setPageCurrent.src = "https://icon-library.com/images/0234605a9c.svg.svg";
};

export default function AdmitRegisterOverview(props) {
  const [modalAddress, setModalAddress] = useState(false);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [emessageVisible, setEMessageVisible] = useState(false);
  const arrangeAddress = (list) => {
    return list.addressNo || list.tambon || list.amphur || list.changwat ? (
      <span>
        {" "}
        {(list.addressNo ? list.addressNo + " " : "") +
          (list.tambon ? list.tambon + " " : "") +
          (list.amphur ? list.amphur + " " : "") +
          (list.changwat ? list.changwat : "")}
      </span>
    ) : (
      <span> - </span>
    );
  };

  const setRequestApi = async () => {
    setListLoading(true);

    const result = await GetPatientsByPatientId(props.patientId);
    setList(result ? result[0] : []);
    props.onSetList(result ? result[0] : []);
    props.setHn(result);
    props.setGender(result ? result[0].gender : 'M')
    setListLoading(false);
  };

  useEffect(() => {
    setRequestApi();
  }, [props.patientId]);

  return (
    <>
      {!listLoading ? (
        <>
          <Card>
            <Row gutter={[16, 24]} style={{ padding: 15 }}>
              <Col xs={24} xl={2}>
                <Avatar
                  size={100}
                  src={
                    <Image
                      onError={onError}
                      style={useStyle.header.img}
                      src={
                        list.picture
                          ? `data:image/png;base64,${list.picture}`
                          : `https://icon-library.com/images/0234605a9c.svg.svg`
                      }
                      alt={list.picture}
                    />
                  }
                />
              </Col>

              <Col xs={20} xl={7}>
                <Row>
                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label
                        style={{
                          float: "right",
                          fontSize: 19,
                          color: "#009EFF",
                        }}
                      >
                        HN
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>{list.hn ? <span>{list.hn}</span> : <span> - </span>}</p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        ชื่อ
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.displayName ? (
                        <>
                          <Row>
                            <Col span={16}>
                              <span>{list.displayName}</span>
                              {list.gender ? (
                                list.gender === "M" ? (
                                  <BiMaleSign style={{ color: "green" }} />
                                ) : (
                                  <BiFemaleSign style={{ color: "green" }} />
                                )
                              ) : null}
                            </Col>
                            <Col span={8}>
                              <PatientDetailsChangesInformation
                                patientId={props.patientId}
                              />
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <span> - </span>
                      )}
                    </p>

                    <p>
                      {list.displayName ? (
                        <span>{list.eDisplayName}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        ที่อยู่
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <Row>
                      <Col span={16}>
                        <p>{arrangeAddress(list)}</p>
                      </Col>
                      <Col span={8}>
                        {props.patientId ? (
                          <Button
                            type="default"
                            className="btn-custom-bgcolor"
                            style={{ height: 20 }}
                            size={"small"}
                            onClick={() => setModalAddress(true)}
                          >
                            <h4 style={{ marginTop: -3, cursor: "pointer" }}>
                              ...
                            </h4>
                          </Button>
                        ) : (
                          []
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>

              <Col xs={20} xl={7}>
                <Row>
                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label
                        style={{
                          float: "right",
                          fontSize: 19,
                          color: "#009EFF",
                        }}
                      >
                        เลขบัตรประชาชน
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.idCard ? (
                        <span>{list.idCard}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        อายุ
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.age ? <span>{list.age}</span> : <span> - </span>}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        สัญชาติ
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.nation ? (
                        <span>{list.nation}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        ศาสนา
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>{list.x ? <span>{list.x}</span> : <span> - </span>}</p>
                  </Col>
                </Row>
              </Col>

              <Col xs={20} xl={7}>
                <Row>
                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label
                        style={{
                          float: "right",
                          fontSize: 19,
                          color: "#009EFF",
                        }}
                      >
                        Passport
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.passport ? (
                        <span>{list.passport}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        สถานะภาพสมรส
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.mstatus ? (
                        <span>{list.mstatus}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        อาชีพ
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.occupation ? (
                        <span>{list.occupation}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>

                  <Col span={8} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <strong>
                      <label className="gx-text-primary" style={{ float: "right" }}>
                        เบอร์โทรศัพท์
                      </label>
                    </strong>
                  </Col>
                  <Col span={16} style={{ paddingLeft: 5, paddingRight: 0 }}>
                    <p>
                      {list.mobile ? (
                        <span>{list.mobile}</span>
                      ) : (
                        <span> - </span>
                      )}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col xs={4} xl={1}>
                <div style={{ float: "right" }}>
                  <Button
                    style={{ width: 10 }}
                    className="btn-custom-bgcolor"
                    onClick={() => setEMessageVisible(true)}
                  >
                    <center>
                      <FaRegStickyNote
                        style={{ marginLeft: -7, marginBottom: -2 }}
                      />
                    </center>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
          <EMessage
            isVisible={emessageVisible}
            onOk={() => setEMessageVisible(false)}
            onCancel={() => setEMessageVisible(false)}
            patientId={props.patientId} // ให้ส่ง patientId เข้าไป
          />

          <Modal
            visible={modalAddress}
            title={
              <strong>
                <label className="gx-text-primary" style={{ fontSize: 18 }}>
                  ที่อยู่
                </label>
              </strong>
            }
            width="600px"
            onOk={() => setModalAddress(false)}
            onCancel={() => setModalAddress(false)}
            okButtonProps={{ hidden: true }}
            cancelText="ปิด"
          >
            <span>
              {(list.addressNo ? list.addressNo + " " : "") +
                (list.tambon ? list.tambon + " " : "") +
                (list.amphur ? list.amphur + " " : "") +
                (list.changwat ? list.changwat : "")}
            </span>
          </Modal>
        </>
      ) : (
        <Card style={{ paddingBottom: 0 }}>
          <Empty style={{ paddingBottom: 0 }} />
        </Card>
      )}
    </>
  );
}
