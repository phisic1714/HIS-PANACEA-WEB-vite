// Core viewer
import { Viewer, Worker } from "@react-pdf-viewer/core";
// Import styles
// Plugins
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Button, Col, Image as ImageTag, Modal, Popconfirm, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import {
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import ReactDOM from "react-dom";
import { toNumber } from "lodash";
import Konva from "konva";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const base64toBlob = (data) => {
  let cut = data;
  if (cut.includes("data:application/pdf;base64,")) {
    let sub = cut.indexOf("data:application/pdf;base64,");
    cut = cut.substring(sub + "data:application/pdf;base64,".length);
  }
  const bytes = atob(cut);
  let length = bytes.length;
  let out = new Uint8Array(length);

  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }
  const contentType = "application/pdf";
  return new Blob([out], { type: contentType });
};

const display = ({ all }) => {
  // console.log(all);
  if (all.dupCode?.split("|")[0]) {
    return all.dupCode || "-";
  } else if (all.code) {
    return all.code || "-";
  } else {
    if (all.detail.type === "O") {
      return `HN : ${all.detail.hn || "-"}`;
    }
    if (all.detail.type === "I") {
      return `AN : ${all.detail.an || "-"}`;
    }
    if (all.detail.type === "D") {
      return `AN : ${all.detail.an || "-"}`;
    }
    if (all.detail.type === "F") {
      return `AN : ${all.detail.an || "-"}`;
    }
    if (all.detail.type === "B") {
      return `BillId : ${all.detail.billId || "-"}`;
    }
    if (all.detail.type === "P") {
      return `PurchaseId : ${all.detail.purchaseId || "-"}`;
    }
    if (all.detail.type === "C") {
      return `ExpenseId : ${all.detail.expenseId || "-"}`;
    }
  }
};

function rotateImage(imageBase64, rotation, cb) {
  var img = new Image();
  img.src = imageBase64;
  img.crossOrigin = "anonymous";
  img.onload = () => {
    var canvas = document.createElement("canvas");
    // if ([90, 270].indexOf(rotation) > -1) {
    //   canvas.width = img.height;
    //   canvas.height = img.width;
    // } else {
    canvas.width = img.width;
    canvas.height = img.height;
    // }
    var ctx = canvas.getContext("2d");
    ctx.translate(img.width, img.height);
    ctx.rotate((180 * Math.PI) / 180);
    ctx.drawImage(img, 0, 0);
    // ctx.setTransform(1, 0, 0, 1, maxDim / 2, maxDim / 2);
    // ctx.rotate(90 * (Math.PI / 180));
    // ctx.drawImage(img, -maxDim / 2, -maxDim / 2);

    cb(canvas.toDataURL("image/jpeg"));
  };
}

function PreviewPdfThumbnail({
  pdf,
  patient,
  detail,
  all,
  setLoading,
  setPdf,
  pdfAll,
  keymake,
  handleEdit,
  editable,
}) {
  const [thumbList, setThumbList] = useState([]);
  const [pdfView, setPdfView] = useState(URL.createObjectURL(base64toBlob("")));
  const [visible, setVisible] = useState(false);
  const imagePreviewListRef = useRef([]);

  const thumbnailPluginInstance = thumbnailPlugin();
  const renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        const { EnterFullScreen, Zoom, ZoomIn, ZoomOut } = slots;
        return (
          <div
            style={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <div style={{ padding: "0px 2px" }}>
              <ZoomOut />
            </div>
            <div style={{ padding: "0px 2px" }}>
              <Zoom />
            </div>
            <div style={{ padding: "0px 2px" }}>
              <ZoomIn />
            </div>
            <div style={{ padding: "0px 2px", marginLeft: "auto" }}>
              <EnterFullScreen />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnails tab
    ],
  });

  useEffect(() => {
    if (pdf && all.type.includes("pdf")) {
      setLoading(true);
      setPdfView(URL.createObjectURL(base64toBlob(pdf)));
      setThumbList([
        {
          data: URL.createObjectURL(base64toBlob(pdf)),
          hn: detail.hn,
          pdf: all.type.includes("pdf"),
          all: all,
        },
      ]);
      const convertPdfToImages = async (file) => {
        const images = [];
        let cut = file;
        if (file.includes("data:application/pdf;base64,")) {
          let sub = file.indexOf("data:application/pdf;base64,");
          cut = file.substring(sub + "data:application/pdf;base64,".length);
        }
        const pdf = await pdfjs.getDocument(
          `data:application/pdf;base64,${cut}`
        ).promise;
        const canvas = document.createElement("canvas");
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 1 });
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport })
            .promise;
          images.push(canvas.toDataURL("image/jpeg"));
        }
        canvas.remove();
        return images;
      };
      convertPdfToImages(pdf);
      setLoading(false);
    }
    if (
      pdf &&
      (all.type.includes("png") ||
        all.type.includes("jpeg") ||
        all.type.includes("jpg"))
    ) {
      setThumbList([{ data: pdf, hn: detail.hn, pdf: false, all: all }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf]);

  const onPreviewImage = (status, item) => {
    const foundPreviewImageNode = imagePreviewListRef.current.find(
      (item) => item?.all.key === item.all.key
    );
    let imagePreviewBody;
    if (foundPreviewImageNode) {
      imagePreviewBody = foundPreviewImageNode.imagePreviewBody;
    } else {
      const imagePreviewBodyList = document.getElementsByClassName(
        "ant-image-preview-body"
      );
      imagePreviewBody = imagePreviewBodyList[imagePreviewBodyList.length - 1];
      imagePreviewListRef.current = [
        ...imagePreviewListRef.current,
        { ...item, imagePreviewBody: imagePreviewBody },
      ];
    }
    const previewImageNode = imagePreviewBody.childNodes[1].childNodes[0];
    const imagePreviewOperations = imagePreviewBody.childNodes[0];
    if (imagePreviewOperations.childNodes.length <= 5) {
      const closeOperation = imagePreviewOperations.childNodes[0];
      const newLi = closeOperation.cloneNode();
      newLi.addEventListener("click", (e) => {
        const rotation = toNumber(
          previewImageNode
            .getAttribute("style")
            .split("rotate(")?.[1]
            .split("deg);")[0]
        );
        const dataUrl = previewImageNode.getAttribute("src");
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.src = dataUrl;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const container = document.createElement("div");

          const stageNode = new Konva.Stage({
            container: container,
            width: width,
            height: height,
          });
          const layerNode = new Konva.Layer();
          const group = new Konva.Group({
            rotation: rotation,
            x: width / 2,
            y: height / 2,
            offsetX: width / 2,
            offsetY: height / 2,
          });
          const imageKonva = new Konva.Image({
            image: img,
            x: 0,
            y: 0,
          });
          group.add(imageKonva);
          layerNode.add(group);
          stageNode.add(layerNode);
          stageNode.draw();
          const rotatedImg = group.toCanvas().toDataURL("image/jpeg");
          setPdf((prev) => {
            return prev.map((val) => {
              if (val.key === item.all.key) {
                return {
                  ...val,
                  origin: val.data,
                  data: rotatedImg,
                };
              } else {
                return val;
              }
            });
          });
          closeOperation.click();
        };
      });
      ReactDOM.render(<SaveOutlined />, newLi);
      imagePreviewOperations.appendChild(newLi);
    }
  };

  // console.log("thumbList", thumbList);
  // https://palicfilmfestival.com/uploads/documents/20200709/document_487851581.pdf

  return (
    <div>
      {thumbList.map((item, index) => (
        <>
          {item.pdf ? (
            <Document key={index} className="pointer" file={item.data}>
              <div
                key={index}
                className="pointer"
                style={{
                  position: "relative",
                  width: 204,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "2px solid black",
                  margin: "2px",
                  borderRadius: "50",
                }}
              >
                <Row>
                  <Page
                    width={200}
                    height={322}
                    className="pointer"
                    onClick={() => console.log(item)}
                    pageNumber={1}
                  />
                </Row>
                <Row
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Col span={20}>
                    <label>{item.hn || "-"}</label>
                  </Col>
                  <Col span={4}>
                    <label>{item.hn || "-"}</label>
                  </Col>
                </Row>
                <Button
                  danger
                  style={{
                    position: "absolute",
                    right: 0,
                    zIndex: "5",
                    color: "red",
                  }}
                  size="small"
                  shape="circle"
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                  onClick={() => console.log(item)}
                />
              </div>
            </Document>
          ) : (
            <div
              key={index}
              style={{
                position: "relative",
                width: 204,
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid black",
                margin: "2px",
                borderRadius: "50",
              }}
            >
              <Row clasName="imageForOverlay">
                <ImageTag
                  key={index}
                  width={200}
                  height={322}
                  src={`${item.data}`}
                  preview={{
                    // เดี๋ยวมาทำต่อ
                    onVisibleChange: (visible, prevVisible) => {
                      // console.log(visible, prevVisible);
                      onPreviewImage(visible, item);
                    },
                    mask: (
                      <>
                        <EditOutlined />
                        &nbsp;Preview & Edit
                      </>
                    ),
                  }}
                ></ImageTag>
                {/* <CrossLeft/>
                <CrossRight/> */}
              </Row>
              <Row>
                <div
                  style={{ height: "24px", display: "flex", flexWrap: "wrap" }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      flexWrap: "wrap",
                      alignContent: "center",
                      width: "200px",
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    title={item?.all?.maxContinueWhitePercent}
                  >
                    {display(item)}
                  </span>
                  <Button
                    hidden={!editable}
                    onClick={() => handleEdit(item.all.key)}
                    style={{
                      position: "absolute",
                      right: 0,
                      zIndex: "5",
                      color: "green",
                    }}
                    size="small"
                    shape="circle"
                    icon={<EditOutlined style={{ color: "green" }} />}
                  />
                </div>
              </Row>
              <Button
                hidden={false}
                style={{
                  position: "absolute",
                  right: 10,
                  zIndex: "5",
                  color: "green",
                }}
                size="small"
                shape="circle"
                icon={<SwapOutlined rotate={90} style={{ color: "blue" }} />}
                onClick={() =>
                  rotateImage(item.data, 270, async (rotateImg) => {
                    let img = await rotateImg;
                    // console.log(item.data);
                    setPdf(
                      pdfAll.map((val) => {
                        if (val.key === item.all.key) {
                          return {
                            ...val,
                            origin: val.data,
                            data: img,
                          };
                        } else {
                          return val;
                        }
                      })
                    );
                  })
                }
              />
              <Popconfirm
                title="ต้องการลบรายการนี้ ？"
                onConfirm={() =>
                  setPdf(pdfAll.filter((val) => val.key !== item.all.key))
                }
              >
                <Button
                  danger
                  style={{
                    position: "absolute",
                    right: 0,
                    zIndex: "5",
                    color: "red",
                  }}
                  size="small"
                  shape="circle"
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                // disabled={item?.scanId}
                />
              </Popconfirm>
            </div>
          )}
        </>
      ))}

      <Modal
        closable={false}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.min.js">
          <div
            style={{
              height: "60vh",
            }}
          >
            <Viewer
              // The page is zero-based index
              // We will display the third page initially
              plugins={[thumbnailPluginInstance, defaultLayoutPluginInstance]}
              fileUrl={pdfView}
            // initialPage={page}
            />
          </div>
        </Worker>
        {/* <Document file={`data:application/pdf;base64,${pdf}`} >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Page pageNumber={page + 1} />
        </div>
      </Document> */}
        {/* 
      <embed src={`data:application/pdf;base64,${pdf}`} type="application/pdf" width="100%"  />
      <iframe title="pdf" src={`data:application/pdf;base64,${pdf}`}></iframe> 
      <div style={{ width: 0, height: 0 }}>
        <iframe style={{ width: 0, height: 0 }} title="pdf" ></iframe>
      </div> */}
      </Modal>
    </div>
  );
}

export default PreviewPdfThumbnail;
