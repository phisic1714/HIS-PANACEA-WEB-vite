import { Spin } from "antd";
import React from "react";

const CircularProgress = ({ className }) => (
  <div className={`loader ${className}`}>
    <Spin size="large" />
  </div>
);
export default CircularProgress;
