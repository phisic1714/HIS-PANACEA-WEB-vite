import { LeftOutlined } from "@ant-design/icons";
import { List, Menu, Space } from "antd";
import { useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuth } from "../../authentication";
import {
  TAB_SIZE,
  THEME_TYPE_LITE,
} from "../../constants/ThemeSetting";
import MenuReactIcon from "./MenuReactIcon";
import SidebarLogo from "./SidebarLogo";
import "./style.css";
// eslint-disable-next-line no-unused-vars
const SidebarContent = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  let { themeType } = useSelector(({ settings }) => settings);
  let { width } = useSelector(({ common }) => common);
  const { authUserMenu } = useAuth();
  const [newMenu, setNewMenu] = useState([]);


  const [openKeys, setOpenKeys] = useState([]);
  const submenuRef = useRef();

  const SubMenu = Menu.SubMenu;
  useLayoutEffect(() => {
    if (authUserMenu) {
      let data = authUserMenu.responseData.map((menu, index) => ({
        ...menu,
        children: menu.children.map((subchild) => ({
          ...subchild,
          moduleId: `${index}${subchild.moduleId}`
        }))
      }))
      setNewMenu(data)
    }

  }, [authUserMenu])


  const onOpenChange = (keys) => {
    const latestOpenKey = keys.length > 0 ? keys[keys.length - 1] : undefined;
    if (latestOpenKey) {
      const topLevelKeys = newMenu.map((item) => snakeToKebab(item.eName));
      const parentKey = findParentKey(latestOpenKey, topLevelKeys);
      const newOpenKeys = parentKey ? [parentKey, latestOpenKey] : [latestOpenKey];
      setOpenKeys(newOpenKeys);
    } else {
      setOpenKeys([]);
    }
  };

  const findParentKey = (key, topLevelKeys) => {
    for (const item of newMenu) {
      if (item.children && item.children.length > 0) {
        for (const module of item.children) {
          if (module.moduleId === key) {
            return snakeToKebab(item.eName);
          }
          if (module.subchildren && module.subchildren.length > 0) {
            for (const sub of module.subchildren) {
              if (sub.moduleId === key) {
                return module.moduleId;
              }
            }
          }
        }
      }
    }
    return topLevelKeys.includes(key) ? key : null;
  };;

  const snakeToKebab = (str) => {
    var myString = str.replace(/_/g, "-");
    return myString.toLowerCase();
  };

  return (
    <>
      <SidebarLogo
        size={width}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="section-sidebar-content">
        <List.Item>
          <Link to="/menu" style={{ color: "white", cursor: "pointer", width: "100%", marginLeft: "10px" }}>
            <Space>
              <LeftOutlined style={{ fontSize: "16px" }} />
              <a style={{ textDecoration: "none", fontSize: "14px" }}>กลับเมนู</a>
            </Space>
          </Link>
        </List.Item>
        <Menu
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          ref={submenuRef}
          theme={themeType === THEME_TYPE_LITE ? "lite" : "dark"}
          mode={width < TAB_SIZE ? "inline" : "vertical"}
        >
          {newMenu
            .sort((a, b) => a.seq - b.seq)
            .map((item) => (
              <SubMenu
                key={snakeToKebab(item.eName)}
                icon={
                  <div
                    style={{
                      display: "inline-block",
                      marginRight: "0px",
                      paddingBottom: "5px",
                    }}
                  >
                    <MenuReactIcon name={item.eName} color={"white"} />
                  </div>
                }
                title={`${item.moduleName}`}
              >
                {item.children.length > 0 && item.children.map((module) => {
                  return module.isParentId === 0 ? (
                    <Menu.Item
                      key={module.moduleId}
                    >
                      <Link
                        to={`/${item.eName.toLowerCase()}/${snakeToKebab(
                          module.code
                        )}`}
                      >
                        {`${module.name}`}
                      </Link>
                    </Menu.Item>
                  ) : (
                    <SubMenu
                      key={`${module.moduleId}`}
                      title={`${module.name}`}
                    >
                      {module.subchildren.map((sub) => (
                        <Menu.Item
                          key={`${snakeToKebab(sub.code)}`}
                        >
                          <Link
                            to={`/${item.eName.toLowerCase()}/${snakeToKebab(
                              module.code
                            )}/${snakeToKebab(sub.code)}`}
                          >
                            {`${sub.name}`}
                          </Link>
                        </Menu.Item>
                      ))}
                    </SubMenu>
                  );
                })}
              </SubMenu>
            ))}
        </Menu>
      </div>
    </>
  );
};

SidebarContent.propTypes = {};
export default SidebarContent;
