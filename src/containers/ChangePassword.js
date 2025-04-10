import { env } from '../env.js';
import { Button, Card, Col, Divider, Form, Input, message, Row, Tooltip } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import './Form.css';
import { useAuth } from "../authentication";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import MasterContext from "../util/context/context";
import { WarningFilled } from "@ant-design/icons";
import { TabTitle } from 'util/GeneralFuctions.js';
// import LgMessages from "../util/IntlMessages";

function PasswordForm() {
  const regexOrder = /012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba/i;
  const regexRepeat = /^\S*(\w)(?=\1{2,})\S*$/i
  const [form] = Form.useForm();
  const {
    error,
    userChangePassword,
    authUser
  } = useAuth();
  // const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unmount, setUnmount] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const onFinish = values => {
    // console.log('Success:', values);
    let value = {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        userId: location.state ? location.state.reset.userId : authUser.responseData.userId,
        oldPassword: location.state?.type === "expire" ? location.state.password : values.currentpassword,
        newPassword: values.newpassword,
        isReset: null
      },
      barcode: null
    };
    location.state ? userChangePassword(value, history.replace({
      pathname: "/home"
    })) : userChangePassword(value, false, true);
    if (!unmount) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } else { }
    setLoading(false);
  };
  const {
    state,
    dispatch
  } = useContext(MasterContext);
  const getImage = async d => {
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/UploadPictures/LoadListImage`,
      method: "post",
      data: {
        "requestData": [{
          "name": d.imgName
        }]
      }
    }).then(({
      data
    }) => {
      // dispatch({ type: "SET_DATA", payload: data?.responseData });
      if (data?.isSuccess) {
        dispatch({
          type: "SET_DATA",
          payload: {
            ...d.dataHos,
            image: `data:image/jpeg;base64,${data.responseData[0]?.imgStr}`
          }
        });
      } else {
        dispatch({
          type: "SET_DATA",
          payload: {
            ...d.dataHos,
            image: null
          }
        });
      }
      dispatch({
        type: "SET_GETIMAGE"
      });
    }).catch(function (error) {
      dispatch({
        type: "SET_DATA",
        payload: {
          ...d.dataHos,
          image: null
        }
      });
      dispatch({
        type: "SET_GETIMAGE"
      });
      console.log("error image", error);
    });
  };
  useEffect(() => {
    if (!state?.data) {
      const getParamHos = async val => {
        await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/OPDClinic/GetHospitalByHospCode?HospCode=${env.REACT_APP_CODE_HOSPITAL}`).then(({
          data
        }) => {
          if (data?.isSuccess) {
            let imageName = data.responseData.logoFilename;
            getImage({
              imgName: imageName + ".jpg",
              dataHos: data.responseData
            });
          } else {
            console.log("error");
          }
        }).catch(function (error) {
          console.log(error);
        });
      };
      getParamHos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //     if (data === null) {
  //         const getParamHos = async (val) => {
  //             await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/OPDClinic/GetHospitalByHospCode?HospCode=${process.env.REACT_APP_CODE_HOSPITAL}`)
  //                 .then(({ data }) => {
  //                     if (data.isSuccess) {
  //                         setData(data?.responseData);
  //                     } else {
  //                         console.log("error");
  //                     }

  //                 })
  //                 .catch(function (error) {
  //                     console.log(error);
  //                 })
  //         }
  //         getParamHos();
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])
  const onFinishFailed = errorInfo => {
    // console.log('Failed:', errorInfo);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    setLoading(false);
  };
  useEffect(() => {
    if (error || error === undefined) {
      message.error("Password ไม่ถูกต้อง");
    }
  }, [error]);
  useEffect(() => {
    return () => {
      setUnmount(true);
    };
  }, []);
  useEffect(() => {
    if (location.state) {
      console.log("location.state", location.state);
    }
  }, [location]);
  TabTitle("Change Password")
  return <div className="back_ground" style={{
    position: "fixed",
    height: "-webkit-fill-available",
    width: "-webkit-fill-available",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `url(${env.PUBLIC_URL}/assets/images/login_BG.jpg)`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center"
  }}>
    <Card style={{
      padding: 0
    }} bodyStyle={{
      margin: 0,
      padding: 0,
      width: "420px",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <Row style={{
        margin: 0,
        padding: 0,
        display: "flex",
        justifyContent: "center"
      }}>
        <h2 style={{
          color: 'var(--primary-color)',
          paddingTop: 10,
          paddingBottom: 10,
          margin: 0
        }}>CHANGE PASSWORD</h2>
        <Divider style={{
          color: '#008000',
          margin: 0
        }}></Divider>
      </Row>
      <Row style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "-1px -1px",
        padding: 0,
        paddingTop: 10
      }}>
        <Col span={24} style={{
          padding: 0,
          margin: 0,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical" style={{
            padding: 5
          }}>
            <Form.Item hidden={location.state}
              // location.state.type==="expire"?location.state.password:values.currentpassword
              initialValue={location.state ? location.state.type === "expire" ? location.state.password : location.state.reset.userId : null} name="currentpassword" label="Current Password" rules={[{
                required: true,
                message: 'Please input your Current Password!'
              }]}>
              <Input.Password maxLength="24" style={{
                width: 400
              }} type="password" placeholder="Current Password" name="currentpassword" />
            </Form.Item>
            <Divider style={{
              color: '#008000',
              margin: 0
            }}></Divider>
            <Form.Item name="newpassword" labelCol={12} label={<div style={{
              display: "flex"
            }}>
              <div>
                <label>New Password</label>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center"
              }}>
                <Tooltip placement="right" title={<>
                  <>รหัสผ่านต้องไม่มีเลขซ้ำ เลขเรียง ตัวอักษรเรียง และตัวอักษรซ้ำ</>
                </>}><WarningFilled />
                </Tooltip>
              </div>
            </div>} rules={[
              // // { required: true}
              // , 
              {
                validator(_, value, callback) {
                  console.log(value);
                  if (!value) {
                    return Promise.reject(new Error('โปรดกรอกรหัสผ่าน!'));
                  }
                  if (value.length < state?.data?.minPassword) {
                    return Promise.reject(new Error(`รหัสผ่านขั้นต่ำ ${state?.data?.minPassword} ตัวอักษร `));
                  }
                  if (regexOrder.test(value)) {
                    return Promise.reject(new Error("รหัสผ่านไม่ตรงตามเงื่อนไข กรุณาระบุ Password ที่ไม่ใช้ตัวอักษรและเลขเรียง ABCDE , 12345 เช่น 321232 ,CBA"));
                  }
                  if (regexRepeat.test(value)) {
                    return Promise.reject(new Error("รหัสผ่านไม่ตรงตามเงื่อนไข กรุณาระบุ Password ที่ไม่ใช้ตัวอักษรซ้ำกันสามตัวขึ้นไป เช่น 111 aaa bbb "));
                  }
                  return Promise.resolve();
                }
              }]}>
              <Input.Password onChange={() => form.setFieldsValue({
                confirmpassword: null
              })} maxLength="24" style={{
                marginBottom: '8px',
                width: 400
              }} type="password" placeholder="New Password" name="newpassword" />
            </Form.Item>
            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.newpassword !== currentValues.confirmpassword}>
              {({
                getFieldValue
              }) => <Form.Item name="confirmpassword" label="Confirm Password" rules={[
                // {
                //     required: true,                              
                // },
                {
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error('Please input your Confirm Password!'));
                    }
                    if (getFieldValue('newpassword') !== value) {
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    }
                    if (value.length < state?.data?.minPassword) {
                      return Promise.reject(new Error(`รหัสผ่านขั้นต่ำ ${state?.data?.minPassword} ตัวอักษร `));
                    }
                    return Promise.resolve();
                  }
                }]}>
                  <Input.Password maxLength="24" style={{
                    marginBottom: '8px',
                    width: 400
                  }} type="password" placeholder="Confirm Password" />
                </Form.Item>}
            </Form.Item>
            <Row style={{
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Col style={{
                margin: 0,
                padding: 0
              }}>
                <Form.Item>
                  <Button style={{
                    margin: "0px 5px"
                  }} danger type="default" loading={loading} onClick={() => setLoading(true)} className="btn btn-primary-custom" htmlType="submit">CONFIRM</Button>
                </Form.Item>
              </Col>
              <Col style={{
                margin: 0,
                padding: 0
              }}>
                <Form.Item>
                  <Button style={{
                    margin: "0px 5px"
                  }} danger type="submit" onClick={() => history.push({
                    pathname: `/home`
                  })} className="btn btn-primary-custom">BACK</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Row align="middle" style={{
            margin: 0,
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "var(--secondary-color)",
            padding: "10px",
            borderRadius: "0px 0px 5px 5px"
          }}>
            <Col style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center"
            }}>
              <img style={{
                width: "70px",
                margin: "0px 10px"
              }} alt="logo" src={state?.data?.image || `${env.PUBLIC_URL}/assets/images/WhiteLightEffect.png`}
              // src={`${process.env.PUBLIC_URL}/assets/images/${process.env.REACT_APP_NAME_PATH_IMAGE}`}
              />
              <h2 style={{
                color: "var(--primary-color)",
                margin: "0px 10px"
              }}>
                {/* {process.env.REACT_APP_NAME_SITE} */}
                {state?.data?.hospName}
              </h2>
              {/* <LgMessages id="main.hospital name" /> */}
            </Col>
            <Col>
              <div className="text-center">
                <img style={{
                  width: "120px"
                }} alt="logo" src={`${env.PUBLIC_URL}/assets/images/panacea_logo_new.png`} />
              </div>
            </Col>
          </Row>
          {/* <div className="row" style={{ margin: 0, padding: 0, backgroundColor: "#d2e6c2" }}>
                         <h2 style={{ color: '#008000', paddingTop: 10, paddingBottom: 10, margin: 0 }}>CHANGE PASSWORD</h2>
                         </div> */}
        </Col>
      </Row>
    </Card>
  </div>;
}
export default PasswordForm;