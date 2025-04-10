import React, { useState } from "react";
import { Upload, Button, Modal, Image } from "antd";
import { Icon } from "@iconify/react";
import uploadIcon from "@iconify/icons-el/upload";

import "./upload.less";
import Notifications from "../../components/Modal/Notifications";

export default function UploadFile({
  accept = ".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,",
  files = [],
  disabled = false,
  maxCount = 5,
  onChage,
  referId,
  handleCallServiceDeletePic,
}) {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationsTitle, setNotificationsTitle] = useState(null);

  const onChagePic = (res) => {
    if (res.file.status) {
      onChage?.(res.file, res.fileList);
    }
    // if (res.file.status === "done") {
    //   message.success(`${res.file.name} file uploaded successfully`);
    // } else if (res.file.status === "error") {
    //   message.error(`${res.file.name} file upload failed.`);
    // }
  };

  const props = {
    name: "logo",
    action: (file) => {
      if (file) {
        return file;
      }
    },
    listType: "picture",
  };

  const handleCustomRequest = ({ file, onSuccess }) => {
    if (file) {
      onSuccess("ok");
    }
  };

  const handleBeforeUpload = (file) => {
    ///เชคขนาดไฟล์รูป Uploading will be stopped with false
    const fileSize = file.size / 1024 < 20000000;
    if (!fileSize) {
      setShowNotificationsModal(true);
      setNotificationsTitle("ไฟล์ต้องมีขนาดไม่เกิน 20 MB");
    }
    return fileSize;
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle] = useState("");

  const handlePreview = (file) => {
    console.log("file", file);
    setPreviewImage(file.preview);
    setPreviewOpen(true);
  };
  const handleCancel = () => setPreviewOpen(false);
  return (
    <>
      <Upload
        accept={accept}
        fileList={files}
        beforeUpload={handleBeforeUpload}
        customRequest={handleCustomRequest}
        onChange={(res) => onChagePic(res)}
        onPreview={handlePreview}
        maxCount={maxCount}
        onRemove={(file) => {
          return handleCallServiceDeletePic?.(file);
        }}
        {...props}
      >
        <Button
          disabled={disabled || files.length >= maxCount}
          icon={
            <Icon
              icon={uploadIcon}
              width="15"
              height="15"
              style={{ marginRight: "8px" }}
            />
          }
        >
          Upload
        </Button>
      </Upload>
      <Modal
        visible={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt="example"
          style={{
            width: "100%",
          }}
          src={`data:image/jpeg;base64,${previewImage}`}
        />
        <Image src={`data:image/jpeg;base64,${previewImage}`} />
      </Modal>
      <Notifications
        setModal={() => {
          setShowNotificationsModal(false);
        }}
        isVisible={showNotificationsModal}
        title={notificationsTitle}
        type="error"
      />
    </>
  );
}
