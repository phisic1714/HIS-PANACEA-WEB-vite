import { ConfigProvider } from "antd";
import thTH from "antd/lib/locale/th_TH";
import "./assets/vendors/style";
import axios from "axios";
import { ConnectedRouter } from "connected-react-router";
import { useEffect, useReducer } from "react";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
// import "./styles/wieldy.less";
import { checkWebSocketPort } from "./util/GeneralFuctions";
import { setupInterceptors } from "./api/setup-interceptors";
import configureStore, { history } from "./appRedux/store";
import { AuthProvider } from "./authentication";
import App from "./containers/App/index";
import MasterContext, { initReducer, initState } from "./util/context/context";
const store = configureStore();

const NextApp = () => {
  let root = document.documentElement;
  const [stateContext, dispatchContext] = useReducer(initReducer, initState);
  const themeColorDefault = JSON.parse(localStorage.getItem("themeColor"));
  const themeFontDefault = JSON.parse(localStorage.getItem("themeFont"));
  const timeoutEMessageDefault = JSON.parse(
    localStorage.getItem("timeoutemessage")
  );

  useEffect(() => {
    const connectToWebSocket = async () => {
      const wsUrl = "wss://localhost:8181";

      const isPortOpen = await checkWebSocketPort(wsUrl);
      if (isPortOpen) {
        localStorage.setItem("isQzTray", true);
      } else {
        localStorage.setItem("isQzTray", false);
      }
    };

    connectToWebSocket();

    if (themeColorDefault === null) {
      localStorage.setItem(
        "themeColor",
        JSON.stringify({
          primaryColor: "#1daa3e",
          secondaryColor: "#d6ffe0",
        })
      );
    } else {
      root.style.setProperty("--primary-color", themeColorDefault.primaryColor);
      root.style.setProperty(
        "--secondary-color",
        themeColorDefault.secondaryColor
      );
    }

    if (timeoutEMessageDefault === null) {
      localStorage.setItem(
        "timeoutemessage",
        JSON.stringify({
          minute: 0,
          second: 5,
        })
      );
    }

    if (themeFontDefault === null) {
      localStorage.setItem(
        "themeFont",
        JSON.stringify({
          fontSizeTheme: "14px",
          fontSizeSidebar: "14px",
        })
      );
    } else {
      root.style.setProperty(
        "--font-size-theme",
        themeFontDefault.fontSizeTheme
      );
      root.style.setProperty(
        "--font-size-sidebar",
        themeFontDefault.fontSizeSidebar
      );
    }
  }, []);

  setupInterceptors(axios);

  return (
    <ConfigProvider locale={thTH}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <AuthProvider>
            <Switch>
              <MasterContext.Provider
                value={{ state: stateContext, dispatch: dispatchContext }}
              >
                <Route path="/" component={App} />
              </MasterContext.Provider>
            </Switch>
          </AuthProvider>
        </ConnectedRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default NextApp;
