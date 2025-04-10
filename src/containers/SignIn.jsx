import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
} from "antd";
import axios from "axios";
import { env } from "../env";
import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import IntlMessages from "../util/IntlMessages";
import { useAuth } from "../authentication";
import MasterContext from "../util/context/context";
import "./Form.css";
import Notifications from "./Notification";

const toastSetting = {
  position: "top-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  className: "toastBodyClassName",
};

const SignIn = () => {
  const [panaceaClient] = useState(
    env.REACT_APP_NAME_SITE === "โรงพยาบาลนครปฐม" ? "0.1.1" : "1.0.0.2"
  );
  const [, setLoginType] = useState(null);
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [loadingThaiD, setLoadingThaiD] = useState(false);
  const { state, dispatch } = useContext(MasterContext);
  const { error, userLogin, isLoading, showToast, authUser } = useAuth();

  const history = useHistory();
  const getImage = async (d) => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/UploadPictures/LoadListImage`,
      method: "post",
      data: {
        requestData: [
          {
            name: d.imgName,
          },
        ],
      },
    })
      .then(({ data }) => {
        // dispatch({ type: "SET_DATA", payload: data?.responseData });
        if (data?.isSuccess) {
          dispatch({
            type: "SET_DATA",
            payload: {
              ...d.dataHos,
              image: `data:image/jpeg;base64,${data.responseData[0]?.imgStr}`,
            },
          });
        } else {
          dispatch({
            type: "SET_DATA",
            payload: {
              ...d.dataHos,
              image: null,
            },
          });
        }
        dispatch({
          type: "SET_GETIMAGE",
        });
      })
      .catch(function (error) {
        dispatch({
          type: "SET_DATA",
          payload: {
            ...d.dataHos,
            image: null,
          },
        });
        dispatch({
          type: "SET_GETIMAGE",
        });
        console.log("error image", error);
      });
  };

  const chkShowToast = () => {
    if (showToast) {
      toast.error("Session หมดอายุ", toastSetting);
    }
  };

  useEffect(() => {
    if (authUser) {
      history.push("/home");
    }
    if (!state?.data) {
      const getParamHos = async (val) => {
        await axios
          .get(
            `${env.REACT_APP_PANACEACHS_SERVER}/api/OPDClinic/GetHospitalByHospCode?HospCode=${env.REACT_APP_CODE_HOSPITAL}`
          )
          .then(({ data }) => {
            if (data?.isSuccess) {
              let imageName = data.responseData.logoFilename;
              getImage({
                imgName: imageName + ".jpg",
                dataHos: data.responseData,
              });
              console.log(data.responseData.loginType);
              setLoginType(data.responseData.loginType);
            } else {
              console.log("error");
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      };
      getParamHos();
    }
    chkShowToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [, setLoading] = useState(false);
  const [unmount, setUnmount] = useState(false);

  const onClickSubmit = () => {
    !unmount && setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onFinish = (values) => {
    let valuesFormat = {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        userId: values.username,
        password: values.password,
        // loginType: loginType === "Y" ? 1 : null
      },

      barcode: null,
    };

    const loginCallback = (data) => {
      if (data?.responseData?.roles && data?.responseData?.roles?.length > 0) {
        if (
          data?.responseData?.roles.filter(
            (obj) => obj.roleId === 12 || obj.roleId === 15
          ) > 0
        ) {
          console.log("ผู้ป่วยนอก");
          history.replace({
            pathname: "/outpatient finance/outpatient-finance-login",
          });
          // history.push({ pathname: "/home" });
        } else if (
          data?.responseData?.roles.filter((obj) => obj.roleId === 13) > 0
        ) {
          console.log("ผู้ป่วยใน");
          history.replace({
            pathname: "/inpatient finance/inpatient-finance-login",
          });
          // history.push({ pathname: "/home" });
        } else {
          history.push({
            pathname: "/menu",
          });
        }
      } else {
        history.push({
          pathname: "/menu",
        });
      }
    };

    userLogin(valuesFormat, loginCallback);
  };

  const ping = (url, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Timeout"));
      }, timeout);

      fetch(url, { mode: "no-cors" })
        .then(() => {
          clearTimeout(timer);
          resolve(true);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const loginThaiD = async (domain) => {
    const PUBLIC_URL =
      env.REACT_APP_PANACEA_DOMAIN_PUBLIC ||
      "https://klaenghospital.topprovider.co.th/signin";
    const LOCAL_URL =
      env.REACT_APP_PANACEA_DOMAIN_LOCAL ||
      "https://klaenghospital-his.moph.go.th:4300/signin";
    const state = domain === "public" ? PUBLIC_URL : LOCAL_URL;
    setLoadingThaiD(true);
    try {
      if (domain === "local") {
        await ping(LOCAL_URL);
      }

      const res = await axios.get(
        `${env.REACT_APP_PANACEACHS_SERVER}/api/Thaid/authentication-request?state=${state}`
      );
      window.location.replace(res.data);
    } catch (error) {
      toast.error("ไม่สามรถเข้าระบบด้วย ThaiD ได้");
    } finally {
      setLoadingThaiD(false);
    }
  };

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      setUnmount(true);
    };
  }, []);

  return (
    <div>
      <Notifications />
      <Modal
        centered
        visible={duplicateUserAlert}
        onCancel={() => {
          setDuplicateUserAlert(false);
        }}
        footer={[
          <Row justify="center" key="footer">
            <Button
              danger
              key="cancel"
              onClick={() => {
                setDuplicateUserAlert(false);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              key="cancel"
              onClick={() => {
                // GetListAdmintsIdByPatient(selectedAdmit?.patientId).then(
                //   (res) => {
                //     dispatch(showPatient(selectedAdmit));
                //     dispatch(selectAdmitList(res));
                //   }
                // );
                // history.push("/nutrition/nutrition-ipd-non-drug-charge");
              }}
            >
              ตกลง
            </Button>
          </Row>,
        ]}
        width={520}
      >
        <Row gutter={[8, 8]}>
          <Col span={24} className="text-center">
            <label
              className="fw-bold"
              style={{
                color: "red",
                fontSize: 20,
              }}
            >
              มีการเข้าสู่ระบบด้วย Username นี้แล้วต้องการ Logout
              ออกจากเครื่องเดิมใช่หรือไม่
            </label>
          </Col>
        </Row>
      </Modal>
      <div
        className="version-footer gx-text-primary"
        style={{
          fontSize: "20px",
          position: "fixed",
          zIndex: "1",
          bottom: "1px",
          right: "12px",
          opacity: "0.6",
        }}
      >{`V. ${env.REACT_APP_VERSION}`}</div>
      <div
        style={{
          position: "fixed",
          height: "-webkit-fill-available",
          width: "-webkit-fill-available",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${env.PUBLIC_URL}/assets/images/login_BG.jpg)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* <div style={{backgroundColor:"green",zIndex:20,width:200,height:200}}></div> */}
        <div
          className="my__form"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10%",
            paddingBottom: 10,
          }}
        >
          <Row>
            <Col span={24}>
              <div className="row">
                {/* <div className="avatar-border"> */}
                <img
                  style={{
                    marginTop: "-140px",
                    width: "200px",
                    padding: 3,
                  }}
                  className="avatar"
                  alt=""
                  src={
                    state?.data?.image ||
                    `${env.PUBLIC_URL}/assets/images/WhiteLightEffect.png`
                  }
                  // src={`${process.env.PUBLIC_URL}/assets/images/${process.env.REACT_APP_NAME_PATH_IMAGE}`}
                />

                {/* </div> */}
                <h2
                  style={{
                    color: "var(--primary-color)",
                    fontWeight: "bold",
                  }}
                >
                  {/* {process.env.REACT_APP_NAME_SITE} */}
                  {state?.data?.hospName}
                </h2>
                <Divider
                  style={{
                    backgroundColor: "008000",
                  }}
                />
              </div>
            </Col>
            <Col span={24}>
              {/* <Form
                initialValues={{ remember: true }}
                name="basic"
                onFinish={onFinish}
                style={{
                  width: 420,
                }}
                layout="horizontal"
                className="signin-form"
               >
                <Row gutter={[8, 4]}>
                  </Row>
               </Form> */}
              <div className="row body__box">
                <div className="gx-app-login-wrap">
                  <div className="gx-app-login-container">
                    <div
                      className="gx-app-login-main-content"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="app-login-content"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Form
                          initialValues={{
                            remember: true,
                          }}
                          name="basic"
                          onFinish={onFinish}
                          style={{
                            width: 420,
                          }}
                          layout="horizontal"
                          className="signin-form"
                        >
                          <Form.Item
                            label={
                              <label className="gx-text-primary fw-bold">
                                Username
                              </label>
                            }
                            // initialValue="poweruser"
                            rules={[
                              {
                                validator(_, value) {
                                  if (!value) {
                                    return Promise.reject(
                                      new Error(`กรุณากรอก Username `)
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            name="username"
                          >
                            <Input
                              autoComplete="off"
                              maxLength="24"
                              style={{
                                width: 370,
                              }}
                              placeholder="Username"
                            />
                          </Form.Item>
                          <Form.Item
                            label={
                              <label className="gx-text-primary fw-bold">
                                Password
                              </label>
                            }
                            // initialValue="poweruser"
                            rules={[
                              // {
                              //   required: true,
                              //   message: 'กรุณากรอก Password!',
                              // },
                              {
                                validator(_, value) {
                                  if (!value) {
                                    return Promise.reject(
                                      new Error(`กรุณากรอก Password `)
                                    );
                                  }
                                  if (value.length < state?.data?.minPassword) {
                                    return Promise.reject(
                                      new Error(
                                        `รหัสผ่านขั้นต่ำ ${state?.data?.minPassword} ตัวอักษร `
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                            name="password"
                          >
                            <Input.Password
                              maxLength="24"
                              style={{
                                width: 370,
                              }}
                              placeholder="Password"
                              autoComplete="new-password"
                              autoCorrect="off"
                            />
                          </Form.Item>
                          <div
                            style={{
                              marginTop: -6,
                              marginBottom: 6,
                              display: "flex",
                              flexDirection: "row",
                            }}
                          >
                            <label
                              style={{
                                fontSize: 13,
                                color: "red",
                                marginLeft: 68,
                              }}
                            >
                              ลืม Password หรือลงทะเบียน User ใหม่
                              กรุณาติดต่อเจ้าหน้าที่ IT
                            </label>
                          </div>
                          {/* <Radio.Group
                            onChange={(e) => {
                              // console.log(e);
                              setPanaceaClient(e.target.value);
                            }}
                            value={panaceaClient}
                            style={{ marginBottom: "15px" }}
                           >
                            <Space direction="horizantal">
                              <Radio value={"1.0.0.2"}>
                                <label className="gx-text-primary">1.0.0.2</label>
                              </Radio>
                              <Radio value={"0.1.1"}>
                                <label className="gx-text-primary">0.1.1</label>
                              </Radio>
                            </Space>
                           </Radio.Group> */}
                          {/* <Form.Item>
                           <Checkbox><IntlMessages id="appModule.iAccept"/></Checkbox>
                                </Form.Item> */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {/* <Typography.Text underline  className="gx-link">
                              Forgot Password
                             </Typography.Text> */}

                            <Form.Item
                              style={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Button
                                loading={isLoading}
                                onClick={() => {
                                  onClickSubmit();
                                  localStorage.setItem(
                                    "panacea",
                                    panaceaClient
                                  );
                                }}
                                size="large"
                                type="primary"
                                className="mb-0 ms-5 me-1"
                                htmlType="submit"
                              >
                                <IntlMessages id="app.userAuth.logIn" />
                              </Button>
                              <label className="text-muted">
                                หรือเข้าสู่ระบบด้วย
                              </label>
                              <Popconfirm
                                title="ท่านใช้งานจากภายในโรงพยาบาลหรือภายนอกโรงพยาบาล"
                                open={open}
                                okText="ภายใน"
                                cancelText="ภายนอก"
                                onConfirm={() => loginThaiD("local")}
                                onCancel={() => loginThaiD("public")}
                                icon={null}
                              >
                                <Button
                                  className="mt-2"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    padding: 0,
                                    border: "none",
                                    background: "none",
                                  }}
                                  size="large"
                                  disabled={loadingThaiD}
                                >
                                  <img
                                    src={`${env.PUBLIC_URL}/assets/images/thaidlogo.png`}
                                    alt="thaiD"
                                    style={{ width: "100%", height: "100%" }}
                                  />
                                </Button>
                              </Popconfirm>
                              {/* <span><IntlMessages id="app.userAuth.or"/></span> <Link to="/signup"><IntlMessages
                               id="app.userAuth.signUp"/></Link> */}
                            </Form.Item>
                          </div>
                          {/* <span
                           className="gx-text-light gx-fs-sm"> demo user email: 'demo@example.com' and password: 'demo#123'</span> */}
                          {/* <span
                           className="gx-text-light gx-fs-sm"> demo username: 'poweruser' and password: 'poweruser'</span> */}
                          <div className="text-center">
                            <img
                              style={{
                                width: "150px",
                              }}
                              alt="logo"
                              src={`${env.PUBLIC_URL}/assets/images/panacea_logo_new.png`}
                            />
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
export default SignIn;
