import { ConfigProvider } from "antd";
import { lazy, memo, Suspense, useEffect, useMemo } from "react";
import { IntlProvider } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from "react-router-dom";

import {
  onLayoutTypeChange,
  onNavStyleChange,
  setInitUrl,
  setThemeType,
} from "../../appRedux/actions";
import { useAuth } from "../../authentication";
import CircularProgress from "../../components/CircularProgress";
import {
  LAYOUT_TYPE_BOXED,
  LAYOUT_TYPE_FRAMED,
  LAYOUT_TYPE_FULL,
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  THEME_TYPE_DARK,
} from "../../constants/ThemeSetting";
import AppLocale from "../../lngProvider";

// Lazy-loaded components
const ChangePassword = lazy(() => import("../ChangePassword"));
const MenuPage = lazy(() => import("../Menu"));
const MobileUpload = lazy(() => import("../MobileUpload"));
const Nopage = lazy(() => import("../Nopage"));
const SignIn = lazy(() => import("../SignIn"));
const SignUp = lazy(() => import("../SignUp"));
const MainApp = lazy(() => import("./MainApp"));
const Backoffice = lazy(() => import("../../routes/Backoffice"));
const ThaiD = lazy(() => import("../../routes/ThaiD"));
const Moph = lazy(() => import("../../routes/Moph"));

const RestrictedRoute = ({
  component: Component,
  location,
  userSignOut,
  ...rest
}) => {
  const { authUserMenu, authUser } = useAuth();

  const isModulePermisson = useMemo(() => {
    return authUserMenu ? true : true;
  }, [location, authUserMenu]);

  return (
    <Route
      {...rest}
      render={(props) =>
        authUser ? (
          isModulePermisson ? (
            <Component {...props} userSignOut={userSignOut} />
          ) : (
            <Redirect to={{ pathname: "/home", state: { from: location } }} />
          )
        ) : (
          <Redirect to={{ pathname: "/signin", state: { from: location } }} />
        )
      }
    />
  );
};

const setLayoutType = (layoutType) => {
  document.body.classList.toggle(
    "full-layout",
    layoutType === LAYOUT_TYPE_FULL
  );
  document.body.classList.toggle(
    "boxed-layout",
    layoutType === LAYOUT_TYPE_BOXED
  );
  document.body.classList.toggle(
    "framed-layout",
    layoutType === LAYOUT_TYPE_FRAMED
  );
};

const setNavStyle = (navStyle) => {
  const isHorizontal = [
    NAV_STYLE_DEFAULT_HORIZONTAL,
    NAV_STYLE_DARK_HORIZONTAL,
    NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
    NAV_STYLE_ABOVE_HEADER,
    NAV_STYLE_BELOW_HEADER,
  ].includes(navStyle);

  document.body.classList.toggle("full-scroll", isHorizontal);
  document.body.classList.toggle("horizontal-layout", isHorizontal);
};

let styleSheetLink = document.createElement("link");
styleSheetLink.type = "text/css";
styleSheetLink.rel = "stylesheet";
document.body.appendChild(styleSheetLink);

const App = () => {
  const { locale, navStyle, layoutType, themeType, isDirectionRTL, initURL } =
    useSelector(({ settings }) => settings);
  const { authUser, isLoadingUser, authUserMenu, userSignOut, isLoading } =
    useAuth();
  const dispatch = useDispatch();

  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    document.documentElement.classList.toggle("rtl", isDirectionRTL);
    document.documentElement.setAttribute(
      "data-direction",
      isDirectionRTL ? "rtl" : "ltr"
    );
  }, [isDirectionRTL]);

  useEffect(() => {
    if (locale) document.documentElement.lang = locale.locale;
  }, [locale]);

  useEffect(() => {
    if (themeType === THEME_TYPE_DARK) {
      document.body.classList.add("dark-theme");
      styleSheetLink.href = "/css/dark_theme.min.css";
    } else {
      document.body.classList.remove("dark-theme");
      styleSheetLink.href = "";
    }
  }, [themeType]);

  useEffect(() => {
    if (initURL === "") {
      dispatch(setInitUrl(location.pathname));
    }
    const params = new URLSearchParams(location.search);

    if (params.has("theme")) {
      dispatch(setThemeType(params.get("theme")));
    }
    if (params.has("nav-style")) {
      dispatch(onNavStyleChange(params.get("nav-style")));
    }
    if (params.has("layout-type")) {
      dispatch(onLayoutTypeChange(params.get("layout-type")));
    }
  }, [location.search, dispatch, initURL, location.pathname]);

  useEffect(() => {
    if (!isLoadingUser) {
      if (!authUser) {
        // history.push('/signin');
      } else if (
        !authUser &&
        authUserMenu.responseData.length === 0 &&
        initURL !== "/changepassword"
      ) {
        history.push("/nopage");
      } else if (!authUser && initURL === "/changepassword") {
        history.push("/home");
      } else if (initURL === "" || initURL === "/" || initURL === "/signin") {
        // history.push('/home');
      } else if (authUser && initURL === "/changepassword") {
        history.push("/home");
      } else {
        // history.push(initURL);
      }
    }
  }, [isLoadingUser, authUser, initURL, history, isLoading]);

  useEffect(() => {
    setLayoutType(layoutType);
    setNavStyle(navStyle);
  }, [layoutType, navStyle]);

  const currentAppLocale = AppLocale[locale.locale];

  return isLoadingUser || isLoading ? (
    <CircularProgress />
  ) : (
    <ConfigProvider
      locale={currentAppLocale.antd}
      direction={isDirectionRTL ? "rtl" : "ltr"}
    >
      <IntlProvider
        locale={currentAppLocale.locale}
        messages={currentAppLocale.messages}
      >
        <Suspense fallback={<CircularProgress />}>
          <Switch>
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/backoffice" component={Backoffice} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/changepassword" component={ChangePassword} />
            <Route exact path="/nopage" component={Nopage} />
            <Route exact path="/qrupload/:id" component={MobileUpload} />
            <Route exact path="/user/thaid/callback" component={ThaiD} />
            <Route exact path="/moph/callback" component={Moph} />
            <Route exact path="/menu" component={MenuPage} />

            <RestrictedRoute
              path={`${match.url}`}
              authUser={authUser}
              userSignOut={userSignOut}
              location={location}
              component={MainApp}
            />
            <Route component={Nopage} />
          </Switch>
        </Suspense>
      </IntlProvider>
    </ConfigProvider>
  );
};

export default memo(App);
