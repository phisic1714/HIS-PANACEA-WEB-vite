import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { MessageOutlined } from "@ant-design/icons";
import "react-toastify/dist/ReactToastify.css";

const Notification = () => {
  const { notiMessage } = useSelector(({ notification }) => notification);
  let objTimeoutEMessage = JSON.parse(localStorage.getItem("timeoutemessage"));
  const totalTimeout = (objTimeoutEMessage) => {
    let minute = objTimeoutEMessage?.minute * 60000;
    let second = objTimeoutEMessage?.second * 1000;
    let total = minute + second;
    return total;
  };

  const clearEMessage = () => {
    setTimeout(() => toast.dismiss(), totalTimeout(objTimeoutEMessage));
  };

  let { pathname } = useSelector(({ common }) => common);

  const designNoti = ({ workId, workName, subject, title, message }) => {
    return (
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <MessageOutlined
            className="gx-text-primary fw-bold"
            style={{ fontSize: 28 }}
          />
          <label className="fw-bold" style={{ fontSize: 24, marginLeft: 6 }}>
            {title}
          </label>
        </Col>
        {subject ? (
          <Col span={24}>
            <label
              className="me-1"
              style={{ fontSize: 22 }}
            >{`เรื่อง :`}</label>
            <label style={{ fontSize: 20 }}>{subject ? subject : "-"}</label>
          </Col>
        ) : null}

        {workId ? (
          <Col span={24}>
            <label
              className="me-1"
              style={{ fontSize: 22 }}
            >{`ส่งจาก :`}</label>
            <label style={{ fontSize: 20 }}>{workName ? workName : "-"}</label>
          </Col>
        ) : null}

        {/* {workId && subject ? <Divider /> : null} */}

        <Col span={24}>
          <label style={{ fontSize: 20, wordBreak: "break-all" }}>
            <span className="fw-bold me-1">ข้อความ :</span>
            {message || "-"}
          </label>
        </Col>
      </Row>
    );
  };

  const notify = () => {
    // eslint-disable-next-line array-callback-return
    notiMessage?.FETCH_NOTI?.map((noti) => {
      toast(
        designNoti({
          workId: noti.workId,
          workName: noti.workName,
          subject: noti.subject,
          title: "E-Message",
          message: noti.message,
        }),
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: "foo-bar",
          autoClose: false,
        }
      );
    });
  };

  useEffect(() => {
    toast.dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pathname) {
      // eslint-disable-next-line no-unused-vars
      let pathModuleName =
        pathname?.split("/")[pathname?.split("/")?.length - 1];
    }

    if (notiMessage) {
      // console.log("notiMessage",notiMessage);
      // toast.dismiss();
      notify();
      clearEMessage();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notiMessage]);

  return (
    <div>
      <ToastContainer theme="dark" style={{ width: "500px" }} />
    </div>
  );
};

export default Notification;
