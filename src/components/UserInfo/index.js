import { UserOutlined } from '@ant-design/icons';
import { Avatar, Col, Popover, Row } from "antd";
import { env } from 'env';
import { useHistory } from "react-router-dom";
import { useAuth } from "../../authentication";

const UserInfo = () => {
  const { userSignOut, authUser } = useAuth();
  const history = useHistory();

  const onLogoutClick = async () => {
    userSignOut(() => {
      history.replace('/home');
      window.location.reload(false);
    });
  }
  const onChangePassword = () => {
    history.push('/changepassword');
  }

  const onChatClick = () => {
    history.push('/chat test');
  }

  const userMenuOptions = (
    <ul className="gx-user-popover">
      <li>My Account</li>
      <li onClick={onChatClick}>Chat</li>
      <li onClick={onChangePassword}>Change Password</li>
      <li onClick={onLogoutClick}>Logout
      </li>
    </ul>
  );

  return (
    <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={userMenuOptions} trigger="click">
      <Row align="middle" gutter={[8, 8]}>
        <Col>
          <label className="pointer gx-text-primary fw-bold" style={{ fontSize: "12px" }}>{authUser?.responseData?.firstName} {authUser?.responseData?.lastName}</label>
          {/* <span className="gx-pl-2 gx-avatar-name" style={{fontSize:16 ,paddingRight:10}}><i className="icon icon-chevron-down gx-pl-2"/></span> */}
          <div style={{ position: "absolute", top: 17, left: 5, whiteSpace: "nowrap", color: "gainsboro", fontSize: "12px" }} >
            {`V. ${env.REACT_APP_VERSION}`}
          </div>
        </Col>
        <Col>
          <Avatar icon={<UserOutlined />} className="gx-size-40 gx-pointer" alt="" />
        </Col>
      </Row>
    </Popover>
  );
};

export default UserInfo;
