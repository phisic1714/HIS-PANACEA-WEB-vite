import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Col, Modal, Row, Typography } from "antd";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
export default function Notifications({
  setModal,
  isVisible = false,
  response = null,
  title = "ดำเนินการ",
  type = "result",
  // eslint-disable-next-line no-unused-vars
  zIndex = null,
  showErrorMessage
}) {
  const [processResult, setProcessResult] = useState({});
  const setDataForProcessResultModal = async () => {
    if (response.isSuccess) {
      setProcessResult({
        isSuccess: response.isSuccess,
        status: "สำเร็จ",
      });
    } else
      setProcessResult({
        isSuccess: response.isSuccess,
        status: "ไม่สำเร็จ",
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
      });
  };
  useEffect(() => {
    if (response) {
      setDataForProcessResultModal();
    } else setProcessResult({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <div>
      <Modal
        // style={zIndex?{zIndex:zIndex}:null}
        closable={false}
        centered
        visible={isVisible}
        onCancel={() => setModal(false)}
        width={480}
        footer={false}
        zIndex={1001}
      >
        <div
          style={{
            margin: "-20px",
            border: "1px solid #CFD8DC",
            borderRadius: "2px",
            backgroundImage: "linear-gradient(to bottom,#fff 60%, #ECEFF1)",
          }}
        >
          {type === "warning" && (
            <div className="text-center">
              <label className="text-warning mb-2" style={{ fontSize: "52px" }}>
                <WarningOutlined />
              </label>
              <Typography style={{ fontSize: "23px", margin: "15px" }}>{title}</Typography>
            </div>
          )}
          {type === "error" && (
            <div className="text-center">
              <label className="text-danger" style={{ fontSize: "52px" }}>
                <CloseCircleOutlined />
              </label>
              <Typography style={{ fontSize: "24px" }}>{title}</Typography>
            </div>
          )}
          {type === "success" && (
            <div className="text-center">
              <label className="text-success" style={{ fontSize: "52px" }}>
                <CheckCircleOutlined />
              </label>
              <Typography style={{ fontSize: "24px" }}>{title}</Typography>
            </div>
          )}
          {type === "info" && (
            <div className="text-center">
              <label className="text-info" style={{ fontSize: "52px" }}>
                <InfoCircleOutlined />
              </label>
              <Typography style={{ fontSize: "24px" }}>{title}</Typography>
            </div>
          )}
          {type === "result" && (
            <div>
              {processResult.isSuccess !== undefined && (
                <div>
                  {processResult.isSuccess ? (
                    <Row gutter={[8, 8]} align="middle" className="mb-3">
                      <Col
                        span={24}
                        className="text-center"
                        style={{ marginBottom: -14 }}
                      >
                        <label
                          className="gx-text-primary fw-bold mt-2"
                          style={{ fontSize: 28 }}
                        >
                          {title}
                        </label>
                      </Col>
                      <Col span={24} className="text-center">
                        <label
                          className="gx-text-primary"
                          style={{ fontSize: 38 }}
                        >
                          <CheckCircleOutlined />
                        </label>
                      </Col>
                      <Col span={24} className="text-center">
                        <label
                          className="gx-text-primary"
                          style={{ fontSize: 24 }}
                        >
                          {processResult.status}
                        </label>
                      </Col>
                    </Row>
                  ) : (
                    <Row gutter={[8, 8]} align="middle" className="mb-3">
                      <Col
                        span={24}
                        className="text-center"
                        style={{ marginBottom: -14 }}
                      >
                        <label
                          className="gx-text-primary fw-bold mt-2"
                          style={{ fontSize: 28 }}
                        >
                          {title}
                        </label>
                      </Col>
                      <Col span={24} className="text-center">
                        <label style={{ color: "red", fontSize: 32 }}>
                          {" "}
                          <WarningOutlined />
                        </label>
                      </Col>
                      <Col span={24} className="text-center">
                        <label style={{ color: "red", fontSize: 24 }}>
                          {processResult.status}
                        </label>
                      </Col>
                      {showErrorMessage ?
                        <Col span={24} className="text-center">
                          <label style={{ color: "red", fontSize: 16 }}>
                            errorMessage : {processResult.errorMessage}
                          </label>
                        </Col>
                        :
                        <Col span={24} className="text-center">
                          <label style={{ color: "red", fontSize: 16 }}>
                            errorCode : {processResult.errorCode}
                          </label>
                        </Col>
                      }
                    </Row>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="text-center">
            <button
              className="btn-Close mb-1"
              onClick={() => {
                setModal(false);
              }}
            >
              <label className="btn-Close-label">ปิด</label>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const NotificationCompo = forwardRef(function NotificationCompo(
  // eslint-disable-next-line no-unused-vars
  { props },
  ref
) {
  //Notifications modal
  const [showFormulasDrugProcess, setShowFormulasDrugProcess] = useState(false);
  const [titletFormulasDrugProcess, setTitleFormulasDrugProcess] =
    useState(null);

  useImperativeHandle(ref, () => ({
    setShowFormulasDrugProcess: (props) => setShowFormulasDrugProcess(props),
    setTitleFormulasDrugProcess: (props) => setTitleFormulasDrugProcess(props),
  }));

  return (
    <Notifications
      setModal={(isVisible) => {
        setShowFormulasDrugProcess(isVisible);
        setTitleFormulasDrugProcess(null);
      }}
      isVisible={showFormulasDrugProcess}
      title={titletFormulasDrugProcess?.title}
      type={titletFormulasDrugProcess?.type}
    />
  );
});

// วิธีเรียกใช้

// type === result

// const [showNotificationsModal, setShowNotificationsModal] = useState(false)
// const [processResult, setProcessResult] = useState({})
// const [notificationsTitle, setNotificationsTitle] = useState(null)
// const [notificationType, setNotificationType] = useState(null)

// await setProcessResult(res)
// await setNotificationType("result")
// await setNotificationsTitle("ดำเนินการ.....")
// await setShowNotificationsModal(true)


  /* <Notifications
    setModal={() => {
        setShowNotificationsModal(false)
        setProcessResult({})
        setNotificationsTitle(null)
        setNotificationType(null)
    }}
    isVisible={showNotificationsModal}
    response={processResult}
    title={notificationsTitle}
    type={notificationType}
/> */

// type = warning,confirm,result,success
