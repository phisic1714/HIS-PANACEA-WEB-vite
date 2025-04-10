// Core viewer
import { ProgressBar, Viewer, Worker } from "@react-pdf-viewer/core";

// Plugins
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Button, Modal } from "antd";
import { useMemo, useState } from "react";

const base64toBlob = (data) => {
  const bytes = atob(data);
  let length = bytes.length;
  let out = new Uint8Array(length);

  while (length--) {
      out[length] = bytes.charCodeAt(length);
  }
  const contentType = "application/pdf";
  return new Blob([out], { type: contentType });
};

function PreviewPdf({ pdf, open, setOpen }) {
  const [pdfView, setPdfView] = useState(URL.createObjectURL(base64toBlob(pdf)));
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[1], // Bookmarks tab
      defaultTabs[0], // Thumbnails tab
      defaultTabs[2], // Attachments tab
    ],
  });



  useMemo(() => {
    setPdfView(URL.createObjectURL(base64toBlob(pdf)))
  } ,[pdf])

  return (
    <Modal
      visible={open}
      width={800}
      style={{ top: 5, left: 15 }}
      closable={false}
      footer={[
        <Button
          onClick={() => {
            setOpen(false);
          }}
          key="back"
          danger
        >
          ยกเลิก
        </Button>,
        <Button
          onClick={() => {
            setOpen(false);
            // QzPrint(pdf, null);
          }}
          key="submit"
          type="primary"
        >
          พิมพ์
        </Button>,
      ]}
    >
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js">
        <div
          style={{
            height: "80vh",
          }}
        >
          <Viewer
            fileUrl={pdfView}
            plugins={[defaultLayoutPluginInstance]}
            renderError={console.log}
            renderLoader={(percentages) => (
              <div style={{ width: "240px" }}>
                <ProgressBar progress={Math.round(percentages)} />
              </div>
            )}
          />
        </div>
      </Worker>
    </Modal>
  );
}

export default PreviewPdf;
