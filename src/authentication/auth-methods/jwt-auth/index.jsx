import { Modal /*message*/ } from "antd";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { env } from "../../../env.jsx";
/*import getParameterCaseInsensitive from "../../../components/helper/GetParameterCaseInsensitive";*/
import { withResolve } from "../../../api/create-api.js";
import { nanoid } from "nanoid";
import { useHistory } from "react-router-dom";
import SessionHub from "../../../libs/VitalSignHub";
import { httpClient, httpPanaceas } from "../../../util/Api.js";

export const useProvideAuth = () => {
  const [authUser, setAuthUser] = useState(null);
  const [authUserMenu, setAuthUserMenu] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingUser, setLoadingUser] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [hosParam, setHosParam] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const authUserRef = useRef();
  const sessionHubRef = useRef();

  const history = useHistory();

  const fetchStart = () => {
    setLoading(true);
    setError("");
  };
  const fetchSuccess = () => {
    setLoading(false);
    setError("");
  };
  const fetchError = (error) => {
    setLoading(false);
    setLoadingUser(false);
    setError(error);
  };

  const onChangeUserSession = async (data, callbackFun) => {
    if (
      data.isSuccess &&
      data.responseData.isExpireDate === "0" &&
      data.responseData.cancelFlag !== "Y"
    ) {
      // console.log("onChangeUserSession", callbackFun);
      const domain = window.location.href;
      const changeSession = () => {
        const token = data.responseData.token?.trim() || "";
        // console.log(data.responseData)
        httpPanaceas.defaults.headers.common["Authorization"] =
          "Bearer " + token;
        localStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));
        getAuthUser(data);
        getMenu(data.responseData.userId);
        // getGeolocation(data.responseData.userId, domain);
        triggerLog({
          userId: data.responseData.userId,
          ipAddress: null,
          url: domain,
        });
        if (callbackFun) callbackFun(data);
      };
      let agent = localStorage.getItem("agent");
      if (!agent) {
        agent = nanoid();
        localStorage.setItem("agent", agent);
      }
      const preventLoginFlag = JSON.parse(
        localStorage.getItem("hos_param")
      )?.preventLoginsFlag;
      if (sessionHubRef.current.connection && preventLoginFlag) {
        sessionHubRef.current.on("userSessionAll", (user) => {
          if (localStorage.getItem("showUserSessionAllLog") === "show") {
            console.log("userSessionAll", user);
          }
          const findAnotherAgent = user.find((item) => item.agent !== agent);
          if (findAnotherAgent && preventLoginFlag) {
            // const session = sessionStorage.getItem('user')
            if (!localStorage.getItem("token")) {
              setAuthUser(null);
              fetchSuccess();
              Modal.confirm({
                content: (
                  <p className="h3 text-danger">
                    มีการเข้าสู่ระบบด้วย Username นี้แล้วต้องการ Logout
                    ออกจากเครื่องเดิมใช่หรือไม่
                  </p>
                ),
                onOk: () => {
                  httpPanaceas.defaults.headers.common["Authorization"] =
                    "Bearer " + data.responseData.token;
                  httpPanaceas
                    .post(
                      `${env.REACT_APP_PANACEACHS_SERVER}/api/User/ExpireUserSessionAll?HospCode=${env.REACT_APP_CODE_HOSPITAL}`
                    )
                    .finally(() => {
                      changeSession();
                    });
                },
                onCancel: () => {
                  changeSession();
                },
              });
            } else if (!authUserRef.current) {
              changeSession();
              fetchSuccess();
            }
          } else if (!authUserRef.current) {
            changeSession();
            fetchSuccess();
          }
        });
        sessionHubRef.current.on("expireUserSessionAll", (user) => {
          console.log("expireUserSessionAll");
          if (authUserRef.current) {
            console.log("expireUserSessionAll", user);
            setTimeout(() => {
              userSignOut(() => {
                history.replace("/home");
                window.location.reload(false);
              });
            }, 5000);
            Modal.info({
              content: (
                <p>
                  Your session is about to expire in 5 seconds due to
                  inactivity. You will be redirected to the login page.
                </p>
              ),
            });
          }
        });
        if (
          sessionHubRef.current.connection.connectionState === "Disconnected"
        ) {
          await sessionHubRef.current.start();
        }
        if (sessionHubRef.current.connection.connectionState === "Connected") {
          await sessionHubRef.current
            .joinGroup("AddSession", {
              UserId: data.responseData.userId,
              Session: nanoid(),
              Agent: agent,
            })
            .catch(() => {
              changeSession();
              fetchSuccess();
            });
        }
      } else {
        changeSession();
        fetchSuccess();
      }
    } else {
      fetchError(data.error);
    }
  };
  const userLogin = async (user, callbackFun) => {
    setLoadingUser(true);
    await getParamHos();
    fetchStart();
    httpPanaceas
      .post("User/GetAuthenticate", {
        ...user,
      })
      .then(async ({ data }) => {
        if (!data) {
          return fetchError("Server ขัดข้อง");
        }
        if (data.responseData === null) {
          return fetchError("username หรือ password ไม่ถูกต้อง");
        }
        if (data.responseData.cancelFlag === "Y") {
          return fetchError("รหัสนี้ถูกยกเลิกการใช้งานแล้ว");
        }
        if (user.userId !== "poweruser") {
          if (data.responseData.expireDate === "1") {
            return fetchError(
              "รหัสหมดอายุหรือไม่ได้ใช้งานเกิน 3 เดือนกรุณาติดต่อเจ้าหน้าที่"
            );
          }
        }
        if (user.userId !== "poweruser") {
          if (data.responseData.isExpireDate !== "0") {
            return fetchError("user นี้หมดอายุ");
          }
          if (data.responseData.isReset === "Y") {
            setLoadingUser(false);
            setLoading(false);
            sessionStorage.setItem("reset", JSON.stringify(data));
            setTimeout(() => {
              history.push({
                pathname: "/changepassword",
                state: {
                  reset: data.responseData,
                },
              });
            }, 1);
            return;
          }
          if (
            data.responseData.isPasswordDate
              ? data.responseData.isPasswordDate !== "0"
              : false
          ) {
            setLoadingUser(false);
            // sessionStorage.setItem("expire", JSON.stringify(data));
            setTimeout(() => {
              history.push({
                pathname: "/changepassword",
                state: {
                  reset: data.responseData,
                  password: user.requestData.password,
                  type: "expire",
                },
              });
            }, 1);
            return;
          }
        }
        onChangeUserSession(data, callbackFun);
        setLoadingUser(false);
        // setTimeout(() => setLoadingUser(false),100);
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const userSignup = (user, callbackFun) => {
    fetchStart();
    httpClient
      .post("auth/register", user)
      .then(({ data }) => {
        if (data.result) {
          fetchSuccess();
          localStorage.setItem("token", data.token.access_token);
          httpClient.defaults.headers.common["Authorization"] =
            "Bearer " + data.token.access_token;
          getAuthUser();
          if (callbackFun) callbackFun();
        } else {
          fetchError(data.error);
        }
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const sendPasswordResetEmail = (email, callbackFun) => {
    fetchStart();
    setTimeout(() => {
      fetchSuccess();
      if (callbackFun) callbackFun();
    }, 300);
  };

  const confirmPasswordReset = (code, password, callbackFun) => {
    fetchStart();
    setTimeout(() => {
      fetchSuccess();
      if (callbackFun) callbackFun();
    }, 300);
  };

  const resetLocalStorage = () => {
    localStorage.removeItem("ipdFinancePlace");
    localStorage.removeItem("opdFinancePlace");
    localStorage.removeItem("laboratoryRoom");
    localStorage.removeItem("selectWorkRoom");
    localStorage.removeItem("doctorClinicRoom");
    localStorage.removeItem("inventoryRoom");
    localStorage.removeItem("wardRoom");
    localStorage.removeItem("workRoomWard");
    localStorage.removeItem("opdClinicRoom");
    localStorage.removeItem("ipdPrescriptionRoom");
    localStorage.removeItem("opdPrescriptionRoom");
    localStorage.removeItem("dentalRoom");
    localStorage.removeItem("selectPatient");
  };

  const renderSocialMediaLogin = () => null;

  const userSignOut = async (callbackFun) => {
    fetchStart();
    if (authUser || authUserRef.current) {
      await withResolve("/api/User/revoke-refresh-token").delete();
      authUserRef.current = null;
      sessionHubRef.current.stop();
      fetchSuccess();
      httpPanaceas.defaults.headers.common["Authorization"] = "";
      localStorage.removeItem("ip_address");
      localStorage.removeItem("token");
      // localStorage.removeItem("hos_param");
      resetLocalStorage();
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("userMenu");
      sessionStorage.removeItem("reset");
      sessionStorage.removeItem("topbar");
      sessionStorage.removeItem("selectPatientemessage");
      sessionStorage.removeItem("showemessage");
      setHosParam(null);
      setAuthUser(false);
      if (callbackFun) callbackFun();
    } else {
      fetchError(error.message);
      if (callbackFun) callbackFun();
    }
  };

  const userChangePassword = (user, callbackFun, notReset) => {
    fetchStart();
    httpPanaceas
      .put("User/UpdateUserPassword", user)
      .then(({ data }) => {
        if (data.isSuccess) {
          fetchSuccess();
          Modal.success({
            content: "Success",
            onOk() {
              // eslint-disable-next-line no-empty
              if (notReset) {
              } else {
                httpPanaceas.defaults.headers.common["Authorization"] = "";
                localStorage.removeItem("token");
                localStorage.removeItem("ip_address");
                resetLocalStorage();
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("userMenu");
                sessionStorage.removeItem("reset");
              }
            },
          });

          if (callbackFun) callbackFun();
        } else {
          Modal.false({
            content: "Fasle",
          });
          fetchError(error.message);
        }
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const getAuthUser = (data) => {
    fetchStart();
    if (data.isSuccess) {
      fetchSuccess();
      setAuthUser(data);
      authUserRef.current = data;
      //setAuthTest(data);
    } else {
      httpPanaceas.defaults.headers.common["Authorization"] = "";
      fetchError(error.message);
    }
  };

  const getMenu = (userid) => {
    fetchStart();
    httpPanaceas
      .get(`Module/GetMenu/${userid}`)
      .then(({ data }) => {
        if (data.isSuccess) {
          fetchSuccess();
          sessionStorage.setItem("userMenu", JSON.stringify(data));
          setAuthUserMenu(data);
        } else {
          fetchError(data.error);
        }
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const getParamHos = async (val) => {
    await httpPanaceas
      .get(
        `OPDClinic/GetHospitalByHospCode?HospCode=${env.REACT_APP_CODE_HOSPITAL}`
      )
      .then(({ data }) => {
        if (data.isSuccess) {
          fetchSuccess();
          localStorage.setItem("hos_param", JSON.stringify(data.responseData));
          localStorage.setItem(
            "count",
            localStorage.getItem("count")
              ? localStorage.getItem("count")
              : data.responseData?.passwordExpire
              ? data.responseData?.passwordExpire
              : "20"
          );
          setHosParam(data.responseData);
        } else {
          fetchError(error.message);
          localStorage.setItem(
            "count",
            localStorage.getItem("count") ? localStorage.getItem("count") : "20"
          );
        }
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const triggerLog = (val) => {
    axios
      .post(
        `${env.REACT_APP_PANACEACHS_SERVER}/api/User/InsertLogUserLogin`,
        val
      )
      .then(({ data }) => {
        // eslint-disable-next-line no-empty
        if (data) {
        } else {
          fetchError(data.error);
        }
      })
      .catch(function (error) {
        fetchError(error.message);
      });
  };

  const getUserByToken = async () => {
    let res = await httpPanaceas
      .post(`/User/GetUserByToken`)
      .then(({ data }) => {
        if (data?.isSuccess) {
          return data;
        }
      })
      .catch(function () {
        return null;
      });
    return res;
  };

  const errorStart = () => {
    sessionStorage.removeItem("reset");
    localStorage.removeItem("token");
    localStorage.removeItem("ip_address");
    // localStorage.removeItem("hos_param");
    resetLocalStorage();
    sessionStorage.removeItem("reset");
    setHosParam(null);
    httpPanaceas.defaults.headers.common["Authorization"] = "";
    setLoadingUser(false);
  };

  useEffect(() => {
    async function start() {
      const sessionHub = new SessionHub("/login-session");
      sessionHubRef.current = sessionHub;
      const token = localStorage.getItem("token");
      localStorage.setItem(
        "count",
        localStorage.getItem("count") ? localStorage.getItem("count") : "20"
      );
      // console.log(token);
      if (token) {
        httpPanaceas.defaults.headers.common["Authorization"] =
          "Bearer " + token;
        const user = await getUserByToken();
        // console.log(user,"user0");
        if (!user) {
          console.log("Error Start 1");
          errorStart();
        } else {
          user.responseData.token = token;
          await onChangeUserSession(user);
          setLoadingUser(false);
          // setTimeout(()=>setLoadingUser(false),1000)
        }
      } else {
        console.log("Error Start 1");
        errorStart();
      }
    }
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionHub = sessionHubRef.current;

  // Return the user object and auth methods
  return {
    isLoadingUser,
    isLoading,
    authUser,
    authUserMenu,
    error,
    hosParam,
    sessionHub,
    setError,
    setAuthUser,
    setAuthUserMenu,
    getAuthUser,
    userLogin,
    userSignup,
    userSignOut,
    userChangePassword,
    renderSocialMediaLogin,
    sendPasswordResetEmail,
    confirmPasswordReset,
    showToast,
    setShowToast,
    onChangeUserSession,
    setLoading,
    setLoadingUser,
    getMenu,
    // start
  };
};
