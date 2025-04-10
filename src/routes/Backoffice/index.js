
import { Card, Col, Row } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../../authentication";
import { env } from "../../env";

export const Backoffice = () => {
  const location = useLocation();
  const history = useHistory();
  const {
    onChangeUserSession,
    authUserMenu,
    authUser
  } = useAuth();

  let intervalText, intervalTimer;

  const [text, setText] = useState("");
  const [timerText, setTimerText] = useState(3);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const queryUser = searchParams.get("u");
  const queryToken = searchParams.get("token");
  const nextMoudle = searchParams.get("module")

  const snakeToKebab = (str) => {
    var myString = str.replace(/_/g, "-");
    return myString.toLowerCase();
  };

  const redirectNextPage = (path) => {
    if (path?.length > 1) {
      history.replace(path);
    } else {
      history.replace("/");
    }
  };

  const redirectNextModule = (moduleData) => {
    let childrenFoundIndex = -1
    const nextModule = nextMoudle ? moduleData.responseData.find((mainModule) => {
      const foundModule = mainModule?.children.find((module, index) => {
        if (module?.moduleId === nextMoudle) {
          childrenFoundIndex = index
          return true
        }
        else {
          return false
        }
      })
      return foundModule
    }) : null
    const nextPath = nextModule ? `/${snakeToKebab(nextModule?.eName)}/${snakeToKebab(nextModule.children[childrenFoundIndex].code)}` : null
    redirectNextPage(nextPath)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    intervalText = setInterval(() => {
      if (text.length > 2) {
        setText("");
      } else {
        setText((prev) => (prev += "."));
      }
    }, 1000);

    return () => {
      clearInterval(intervalText);
    };
  }, [text]);

  useEffect(() => {
    if (queryToken && queryUser && !authUser) {
      localStorage.setItem("token", queryToken || null);
      axios
        .get(
          `${env.REACT_APP_PANACEACHS_SERVER}/api/User/Get_AuthenticateCheckToken/${queryUser}`,
          {
            headers: {
              Authorization: `Bearer ${queryToken}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          const resData = res.data
          if (resData.isSuccess) {
            localStorage.setItem("count", 999);
            sessionStorage.setItem("user", JSON.stringify(resData));

            axios.get(
              `${env.REACT_APP_PANACEACHS_SERVER}/api/Module/GetMenu/${resData.responseData.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${queryToken}`,
                  "Content-Type": "application/json",
                },
              }
            )
              .then((res2) => {
                const resData2 = res2.data
                if (resData2.isSuccess) {
                  sessionStorage.setItem("userMenu", JSON.stringify(resData2.responseData));
                  // resData.responseData.token = queryToken
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                  intervalTimer = setInterval(() => {
                    setTimerText((prev) => prev > 0 ? (prev - 1) : 0);
                  }, 1000);

                  onChangeUserSession(resData, () => {
                    redirectNextModule(resData2)
                  });

                  setSuccess(true);
                  setError(false);
                } else {
                  setError(true);
                  setSuccess(false);
                }
              })
              .catch(function (error) {
                setError(true);
                setSuccess(false);
              });
          } else {
            setError(true);
            setSuccess(false);
          }
          return resData
        })
        .then((user) => {
        });
    } else if (authUser && authUserMenu && !success) {
      redirectNextModule(authUserMenu)
    } else if (!authUser && !authUserMenu) {
      setError(true);
      setSuccess(false);

      intervalTimer = setInterval(() => {
        setTimerText((prev) => prev > 0 ? (prev - 1) : 0);
      }, 1000);

      setTimeout(() => {
        redirectNextPage("")
      }, 3500);
    }

    return () => {
      clearInterval(intervalTimer);
    };
  }, [queryToken, queryUser, authUser, nextMoudle, authUserMenu]);

  return (
    <>
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col span={8}>
          <Card
            title={
              <h1 className="gx-text-primary fw-bold">
                เชื่อมต่อกับระบบ Panacea+ Hospital
              </h1>
            }
            style={{ width: "500px" }}
          >
            <Row justify="center" align="middle">
              <Col span={24}>
                {!error && !success ? (
                  <h1
                    style={{ textAlign: "center" }}
                    className="gx-text-primary fw-bold"
                  >
                    กำลังเชื่อมต่อ{text}
                  </h1>
                ) : error ? (
                  <>
                    <h1
                      style={{
                        textAlign: "center",
                        color: "#f51d37",
                        fontWeight: "bold",
                      }}
                    >
                      เชื่อมต่อไม่สำเร็จ
                    </h1>
                    <h1
                      style={{ textAlign: "center" }}
                      className="gx-text-primary fw-bold"
                    >
                      กำลังพาท่านไปหน้าเข้าสู่ระบบ ใน {timerText}
                    </h1>
                  </>
                ) : success ? (
                  <>
                    <h1
                      style={{ textAlign: "center" }}
                      className="gx-text-primary fw-bold"
                    >
                      เชื่อมต่อสำเร็จ
                    </h1>
                    <h1
                      style={{ textAlign: "center" }}
                      className="gx-text-primary fw-bold"
                    >
                      กำลังพาท่านไปหน้าหลัก ใน {timerText}
                    </h1>
                  </>
                ) : null}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};
