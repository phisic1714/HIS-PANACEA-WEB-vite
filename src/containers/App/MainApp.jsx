import { Button, Layout, Modal } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import BackToTop from "../../components/BackToTop/BackToTop";
import CircularProgress from "../../components/CircularProgress";
import {
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  TAB_SIZE,
} from "../../constants/ThemeSetting";
import App from "../../routes/index";
import MasterContext from "../../util/context/context";
import Notifications from "../Notification";
import Sidebar from "../Sidebar/index";
import SideBarRight from "../Sidebar/SideBarRight";

const { Content } = Layout;

const getContainerClass = (navStyle) => {
  switch (navStyle) {
    case NAV_STYLE_DARK_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_DEFAULT_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_BELOW_HEADER:
      return "gx-container-wrap";
    case NAV_STYLE_ABOVE_HEADER:
      return "gx-container-wrap";
    default:
      return "";
  }
};

const GetSidebar = ({ navStyle }) => {
  const { width } = useSelector(({ common }) => common);
  if (width < TAB_SIZE) {
    return <Sidebar />;
  }
  switch (navStyle) {
    case NAV_STYLE_FIXED:
      return <Sidebar />;
    case NAV_STYLE_DRAWER:
      return <Sidebar />;
    case NAV_STYLE_MINI_SIDEBAR:
      return <Sidebar />;
    case NAV_STYLE_NO_HEADER_MINI_SIDEBAR:
      return <Sidebar />;
    case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
      return <Sidebar />;
    default:
      return null;
  }
};

const MainApp = (props) => {
  const { navStyle } = useSelector(({ settings }) => settings);
  const match = useRouteMatch();
  const dispatch = useDispatch();

  const scrollRef = useRef(null);
  const backToTopRef = useRef(null);
  const { state } = useContext(MasterContext);

  useEffect(() => {
    window.addEventListener("resize", () => {
    });
  }, [dispatch]);

  return (
    <>
      <Layout className="gx-app-layout">
        <GetSidebar navStyle={navStyle} />
        {state.sidebarGetImage ? (
          <Layout>
            <Content
              onScroll={(e) => backToTopRef.current.onScroll(e)}
              className={`gx-layout-content ${getContainerClass(navStyle)} `}
            >
              <div ref={scrollRef}>
                <App match={match} />
              </div>
              <Notifications />
              <BackToTop refprop={scrollRef} ref={backToTopRef} />
            </Content>
          </Layout>
        ) : (
          <CircularProgress />
        )}
        <SideBarRight />
      </Layout>
      <TimeoutModal {...props} />
    </>
  );
};

// const TimeoutModal = (props) => {
//   const timeout = 1000 * 60 * +JSON.parse(window.localStorage.getItem("count"));
//   const [remaining, setRemaining] = useState(timeout);
//   const [, setElapsed] = useState(0);
//   const [, setLastActive] = useState(+new Date());
//   const [, setIsIdle] = useState(false);
//   const handleOnActive = () => setIsIdle(false);
//   const handleOnIdle = () => setIsIdle(true);

//   const { reset, getRemainingTime, getLastActiveTime, getElapsedTime } =
//     useIdleTimer({
//       timeout,
//       onActive: handleOnActive,
//       onIdle: handleOnIdle,
//     });

//   const handleReset = () => {
//     togglePopup();
//     reset();
//   };

//   useEffect(() => {
//     setRemaining(getRemainingTime());
//     setLastActive(getLastActiveTime());
//     setElapsed(getElapsedTime());

//     setInterval(() => {
//       setRemaining(getRemainingTime());
//       setLastActive(getLastActiveTime());
//       setElapsed(getElapsedTime());
//     }, 1000);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const [state, setState] = useState({
//     showModal: false,
//     userLoggedIn: false,
//     isTimedOut: false,
//   });

//   const togglePopup = () => {
//     setState((prevState) => ({
//       ...prevState,
//       showModal: !prevState.showModal,
//     }));
//   };
//   const info = () => {
//     Modal.info({
//       title: "Time Out",
//       onOk() { },
//     });
//   };

//   useEffect(() => {
//     if (remaining <= 5000) {
//       if (!state.showModal) {
//         togglePopup();
//       }
//       if (remaining === 0) {
//         togglePopup();
//         props.userSignOut(info);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [remaining]);

//   return (
//     <Modal
//       closable={false}
//       okButtonProps={false}
//       cancelButtonProps={false}
//       footer={
//         <Button color="primary" onClick={() => handleReset()}>
//           Stay Logged In
//         </Button>
//       }
//       visible={state.showModal}
//       toggle={togglePopup}
//     >
//       Your session is about to expire in 5 seconds due to inactivity. You will
//       be redirected to the login page.
//     </Modal>
//   );
// };

const TimeoutModal = (props) => {
  const timeout = 1000 * 60 * +(JSON.parse(window.localStorage.getItem("count")) || 5); // Default to 5 minutes
  const [remaining, setRemaining] = useState(timeout);
  const { reset, getRemainingTime } = useIdleTimer({
    timeout,
    onIdle: () => {
      togglePopup();
    },
    onActive: () => {
      if (state.showModal) togglePopup();
    },
  });

  const [state, setState] = useState({
    showModal: false,
  });

  const togglePopup = () => {
    setState((prevState) => ({
      ...prevState,
      showModal: !prevState.showModal,
    }));
  };

  const handleReset = () => {
    togglePopup();
    reset();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime]);

  return (
    <Modal
      closable={false}
      footer={
        <Button type="primary" onClick={handleReset}>
          Stay Logged In
        </Button>
      }
      visible={state.showModal}
      onCancel={togglePopup}
    >
      <p>Your session will expire in {Math.ceil(remaining / 1000)} seconds due to inactivity.</p>
    </Modal>
  );
};

export default MainApp;
