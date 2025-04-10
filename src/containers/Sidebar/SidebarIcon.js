import { env } from '../../env.js';
import React from 'react';
const SidebarIcon = name => {
  const onError = e => {
    e.target.onerror = null;
    e.target.src = `${env.PUBLIC_URL}/assets/images/menuicons/Noimage.png`;
  };
  return <img onError={onError} style={{
    display: "inline-block",
    width: "25px",
    marginRight: "30px",
    paddingBottom: "5px"
  }} src={`${env.PUBLIC_URL}/assets/images/menuicons/${name.name}.png`} alt={name.name} />;
};
export default SidebarIcon;