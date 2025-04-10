import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Drawer, Layout } from "antd";
import "./style.css";
import SidebarContent from "./SidebarContent";
import { toggleCollapsedSideNav } from "../../appRedux/actions";
import {
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  TAB_SIZE,
  THEME_TYPE_LITE,
} from "../../constants/ThemeSetting";

const { Sider } = Layout;

const Sidebar = () => {
  const dispatch = useDispatch();
  let [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // console.log('sidebarCollapsed', sidebarCollapsed)
  let [sidebarCollapsedMessage, setSidebarCollapsedMessage] = useState("");
  const { themeType, navStyle } = useSelector(({ settings }) => settings);
  const { navCollapsed, width } = useSelector(({ common }) => common);

  const onToggleCollapsedNav = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  useEffect(() => {
    setSidebarCollapsed(navStyle === NAV_STYLE_MINI_SIDEBAR);
  }, [navStyle]);

  useEffect(() => {
    if (sidebarCollapsedMessage === "mouseOut") {
      setTimeout(() => {
        if (
          (!navStyle === NAV_STYLE_FIXED ||
            !navStyle === NAV_STYLE_MINI_SIDEBAR ||
            !navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) &&
          !width < TAB_SIZE
        ) {
          setSidebarCollapsed(true);
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarCollapsedMessage]);

  useEffect(() => {
    setTimeout(() => {
      if (
        (!navStyle === NAV_STYLE_FIXED ||
          !navStyle === NAV_STYLE_MINI_SIDEBAR ||
          !navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) &&
        !width < TAB_SIZE
      ) {
        setSidebarCollapsed(true);
      }

    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let drawerStyle = "gx-collapsed-sidebar";

  if (navStyle === NAV_STYLE_FIXED) {
    drawerStyle = "";
  } else if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
    drawerStyle = "gx-mini-sidebar gx-mini-custom-sidebar";
  } else if (navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
    drawerStyle = "gx-custom-sidebar";
  } else if (navStyle === NAV_STYLE_MINI_SIDEBAR) {
    drawerStyle = "gx-mini-sidebar";
  } else if (navStyle === NAV_STYLE_DRAWER) {
    drawerStyle = "gx-collapsed-sidebar";
  }
  if (
    (navStyle === NAV_STYLE_FIXED ||
      navStyle === NAV_STYLE_MINI_SIDEBAR ||
      navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) &&
    width < TAB_SIZE
  ) {
    drawerStyle = "gx-collapsed-sidebar";
  }

  return <>
    <Button
      id="sidebar-left-collapsible-false"
      hidden
      onClick={e => {
        // console.log('sidebar-left-collapsible-false')
        e.stopPropagation()
        setSidebarCollapsed(true);
      }}
    />
    <Sider
      onMouseEnter={() => {
        // console.log("mouseIn");
        setSidebarCollapsedMessage("mouseIn")
        setSidebarCollapsed(false);
      }}
      onMouseLeave={() => {
        // console.log("mouseOut");
        setSidebarCollapsedMessage("mouseOut")
      }}
      className={`gx-app-sidebar ${drawerStyle} ${themeType !== THEME_TYPE_LITE ? "gx-layout-sider-dark" : null
        } ${sidebarCollapsed ? `a` : `b`}`}
      trigger={null}
      collapsed={
        width < TAB_SIZE
          ? false
          : sidebarCollapsed || navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR
      }
      theme={themeType === THEME_TYPE_LITE ? "lite" : "dark"}
      collapsible
    >
      {navStyle === NAV_STYLE_DRAWER || width < TAB_SIZE ? (
        <Drawer
          className={`gx-drawer-sidebar ${themeType !== THEME_TYPE_LITE ? "gx-drawer-sidebar-dark" : null
            }`}
          placement="left"
          closable={false}
          onClose={onToggleCollapsedNav}
          visible={navCollapsed}
          forceRender
        >
          <SidebarContent
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </Drawer>
      ) : (
        <SidebarContent
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      )}
    </Sider>
  </>
};
export default Sidebar;
