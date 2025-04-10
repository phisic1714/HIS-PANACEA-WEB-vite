import { env } from '../../env.js';
import useWindowSize from "../../components/Hooks/useWindowSize";
import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, NAV_STYLE_NO_HEADER_MINI_SIDEBAR, TAB_SIZE, THEME_TYPE_LITE } from "../../constants/ThemeSetting";
import axios from "axios";
import MasterContext from "../../util/context/context";
const SidebarLogo = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  size
}) => {
  const {
    width,
    themeType
  } = useSelector(({
    settings
  }) => settings);
  let navStyle = useSelector(({
    settings
  }) => settings.navStyle);
  if (width < TAB_SIZE && navStyle === NAV_STYLE_FIXED) {
    navStyle = NAV_STYLE_DRAWER;
  }
  const {
    state,
    dispatch
  } = useContext(MasterContext);
  const hookSize = useWindowSize();
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
  //   if (data === null) {
  //     const getParamHos = async (val) => {
  //       await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/OPDClinic/GetHospitalByHospCode?HospCode=${process.env.REACT_APP_CODE_HOSPITAL}`)
  //         .then(({ data }) => {
  //           if (data.isSuccess) {
  //             setData(data.responseData);
  //           } else {
  //             console.log("error");
  //           }

  //         })
  //         .catch(function (error) {
  //           console.log(error);
  //         })
  //     }
  //     getParamHos();
  //   }
  // }, [])
  // console.log(hookSize);
  return <div className="gx-layout-sider-header">
    {navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR ? <div className={`gx-linebar ${size <= 991 && "tablet"}`}>
      {/* <i
          className={`gx-icon-btn icon icon-${!sidebarCollapsed ? 'menu-unfold' : 'menu-fold'} ${themeType !== THEME_TYPE_LITE ? 'gx-text-white' : ''}`}
          onClick={() => {
            setSidebarCollapsed(!sidebarCollapsed)
          }}
        /> */}
      <img className="pointer" alt="logo2" style={{
        paddingLeft: `${!sidebarCollapsed ? `${hookSize?.width <= 990 ? "5px" : "0px"}` : "0px"}`
      }} onClick={() => {
        setSidebarCollapsed(!sidebarCollapsed);
      }} width="45"
        // src={`${process.env.PUBLIC_URL}/assets/images/${process.env.REACT_APP_NAME_PATH_IMAGE}`}
        src={state?.data?.image || `${env.PUBLIC_URL}/assets/images/WhiteLightEffect.png`} />
    </div> : null}
    <Link to="/home" className="gx-site-logo">
      {navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR && width >= TAB_SIZE ? <img alt="lo" width="45" src={`${env.PUBLIC_URL}/assets/images/PANACEA_LOGO.png`} /> : themeType === THEME_TYPE_LITE ? <img alt="logo1" src={`${env.PUBLIC_URL}/assets/images/PANACEA_LOGO.png`} /> : <>
        <label style={{
          display: "flow-root",
          paddingLeft: `${hookSize?.width <= 990 ? "5px" : "0px"}`,
          marginBottom: "initial",
          marginLeft: `${hookSize?.width >= 991 ? "68px" : "0px"}`
        }}><label className="topic pointer" style={{
          color: "white",
          fontSize: "13px"
        }}>
            {state?.data?.hospName}
          </label></label>
      </>}
    </Link>
  </div>;
};
export default SidebarLogo;