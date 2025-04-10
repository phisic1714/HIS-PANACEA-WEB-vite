import React from "react";
import "../../styles/ui/modal.less";
import { Modal } from "antd";
import { Icon } from "@iconify/react";
import infoCircle from '@iconify/icons-bi/info-circle';
import successStandardLine from '@iconify/icons-clarity/success-standard-line';
import errorStandardLine from '@iconify/icons-clarity/error-standard-line';
import bxError from '@iconify/icons-bx/bx-error';

export default function Modals({
  typeModal = "info" | "success" | "error" | "warning" | "confirm",
  header = "",
  body = "",
  isModalVisible = false,
  handleOk,
  handleCancel,
  showCancelButton= false,
  showOkButton= false,
  width= 500
}) {
  const renderIcon = () => {
    switch (typeModal) {
      case "info":
        return (
          <Icon
            icon={infoCircle}
            width="50"
            height="50"
            color="steelblue"
          />
        );

      case "success":
        return (
          <Icon
            icon={successStandardLine}
            width="50"
            height="50"
            color="#27e040"
          />
        );

      case "error":
        return (
          <Icon
            icon={errorStandardLine}
            width="50"
            height="50"
            color="red"
          />
        );

      case "warning":
        return <Icon icon={bxError} width="50" height="50" color="coral" />;

      case "confirm":
        return (
          <Icon icon={bxError} width="50" height="50" color="#A3A300" />
        );

      default:
        return <></>;
    }
  };

  return (
    <>
      <Modal visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ style:{display : showOkButton ? 'inline-block' : 'none' }}}
          cancelButtonProps={{ style:{display : showCancelButton? 'inline-block' : 'none' } }} width={width}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ alignSelf: "center" }}>{renderIcon(typeModal)}</div>
          <div
            style={{
              padding: "18px",
              alignSelf: "center",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            {header}
          </div>
          <div style={{ padding: "8px" }}>{body}</div>
        </div>
      </Modal>
    </>
  );
}

{/* <Modals typeModal='error' header='เพียวยูโร ริกเตอร์ โมเดลหลวงปู่คาสิโนฮอตดอก' body=' แอโรบิคออกแบบ ทอร์นาโดตุ๊กตุ๊กแซ็กโซโฟน ฮิต กิมจิ วานิลา คอนแทคชะโนดยิมเนิร์สเซอรี พุทธภูมิลาเต้ฮัม ดีพาร์ทเมนท์ซูม อาว์คอนโดพะเรอ ฮาลาลราสเบอร์รีเซฟตี้ตุ๊ดซี้ นิวฟรังก์ปักขคณนา ร็อคซิ้มหลวงปู่อีสเตอร์อิเหนา สถาปัตย์ไฮไลต์จุ๊ย' isModalVisible={true}  showCancelButton={true}
showOkButton={true}/> */}