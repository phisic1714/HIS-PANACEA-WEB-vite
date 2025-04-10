import { env } from "../../env.js";
// Core viewer
import { ProgressBar, Worker } from "@react-pdf-viewer/core";

// Plugins
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
// eslint-disable-next-line no-unused-vars
import { printPlugin } from "@react-pdf-viewer/print";
// Import styles
import "@react-pdf-viewer/print/lib/styles/index.css";
import {
  Empty,
  Popconfirm,
  Select,
  Row,
  Col,
  Form,
  Input,
  Spin,
  Modal,
  InputNumber,
} from "antd";
import { QzPrint } from "./QzPrint";
import {
  DeleteOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EditOutlined,
  SwapOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { uniqBy, find } from "lodash";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import SelectablePDF from "./SelectablePDF";
import axios from "axios";
import moment from "moment";
import JSZip from "jszip";
import Konva from "konva";
const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const roles = userFromSession?.responseData?.roles || [];

// async function addImageProcess(src) {
//   return new Promise((resolve, reject) => {
//     let img = new Image();
//     img.src = src;
//     img.onload = () => {
//       const imgWidth = img.naturalWidth;
//       const imgHeight = img.naturalHeight;
//       console.log('imgWidth: ', imgWidth);
//       console.log('imgHeight: ', imgHeight);
//       let vertical = imgHeight > imgWidth
//       let dataURL = createRotatedImage(img, vertical ? false : "S");
//       console.log('dataURL: ', dataURL);

//       function createRotatedImage(img, angle) {
//         if (angle) {
//           angle = (angle === 'N') ? -Math.PI / 2 :
//             (angle === 'S') ? Math.PI / 2 :
//               (angle === 'W') ? Math.PI :
//                 angle;
//           var newCanvas = document.createElement('canvas');
//           newCanvas.width = img.width;
//           newCanvas.height = img.height;
//           var newCtx = newCanvas.getContext('2d');
//           newCtx.save();
//           newCtx.translate(img.width / 2, img.height / 2);
//           newCtx.rotate(angle);
//           newCtx.drawImage(img, - img.width / 2, - img.height / 2);
//           newCtx.restore();
//           // console.log(newCtx)
//           return newCtx.canvas.toDataURL("image/png")
//         } else {
//           return img
//         }

//       }
//       resolve({ img: dataURL, vertical: imgHeight > imgWidth, height: imgHeight, width: imgWidth })
//     };
//     img.onerror = reject;
//   });
// }
async function addImageProcess(src, rotate) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = src;
    img.onload = () => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      let vertical = imgHeight > imgWidth;
      let dataURL = createRotatedImage(img, vertical ? false : true);
      function createRotatedImage(img, angle) {
        if (angle) {
          angle = rotate ? Math.PI / 2 : 0;
          var newCanvas = document.createElement("canvas");
          var cos = Math.abs(Math.cos(angle));
          var sin = Math.abs(Math.sin(angle));
          // Calculate the new canvas dimensions based on the maximum dimension of the scaled image
          var newWidth = img.width * cos + img.height * sin;
          var newHeight = img.width * sin + img.height * cos;
          var maxDimension = Math.max(newWidth, newHeight);
          newCanvas.width = maxDimension;
          newCanvas.height = maxDimension;
          var newCtx = newCanvas.getContext("2d");
          newCtx.save();
          // Translate and rotate the context
          newCtx.translate(maxDimension / 2, maxDimension / 2);
          newCtx.rotate(angle);
          // Draw the image onto the canvas, centered
          newCtx.drawImage(
            img,
            -img.width / 2,
            -img.height / 2,
            img.width,
            img.height
          );
          newCtx.restore();
          return newCtx.canvas.toDataURL("image/png");
        } else {
          return img;
        }
      }
      resolve({
        img: dataURL,
        vertical: vertical,
        height: imgHeight,
        width: imgWidth,
      });
    };
    img.onerror = reject;
  });
}
async function generatePdf(imageUrls, rotate) {
  let imgList = [];
  if (rotate) {
    const doc = new jsPDF("p", "mm", "a4");
    for (const [i, url] of imageUrls.entries()) {
      const { img } = await addImageProcess(url, rotate);
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
      if (i !== imageUrls.length - 1) {
        doc.addPage();
      }
    }
    return doc;
  } else {
    const { img, height, width, vertical } = await addImageProcess(
      imageUrls[0],
      rotate
    );
    const doc = new jsPDF(vertical ? "p" : "l", "mm", "a4");
    imgList.push({
      img: img,
      height: height,
      width: width,
      vertical: vertical,
      doc: doc,
    });
    for (const [i, url] of imageUrls.entries()) {
      if (i !== 0) {
        const { img, height, width, vertical } = await addImageProcess(
          url,
          rotate
        );
        imgList.push({
          img: img,
          height: height,
          width: width,
          vertical: vertical,
          doc: doc,
        });
      }
    }
    imgList.forEach(({ img, height, width, vertical, doc }, index) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      // Calculate scaling factors to fit the image within the page
      if (index === 0) {
        if (vertical) {
          // Portrait image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        } else {
          // Landscape image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        }
        if (imgList[index + 1]) {
          doc.addPage(null, imgList[index + 1].vertical ? "p" : "l");
        }
      } else if (index !== imgList.length - 1) {
        if (vertical) {
          // Portrait image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        } else {
          // Landscape image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        }
        if (imgList[index + 1]) {
          doc.addPage(null, imgList[index + 1].vertical ? "p" : "l");
        }
      } else {
        if (vertical) {
          // Portrait image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        } else {
          // Landscape image
          doc.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
        }
      }
    });
    return doc;
  }
}
const base64toBlob = (data) => {
  const bytes = atob(data);
  let length = bytes.length;
  let out = new Uint8Array(length);
  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }
  const contentType = "application/pdf";
  return new Blob([out], {
    type: contentType,
  });
};

const GetListWorkPlaceWithDepartName = async () => {
  const res = await axios
    .get(
      `${env.REACT_APP_PANACEACHS_SERVER}/api/AdminItHospital/ItHospital/GetListWorkPlaceWithDepartName`
    )
    .then((res) => {
      return res.data.responseData;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  return res;
};
const GetListDocumentType = async () => {
  const res = await axios
    .post(`${env.REACT_APP_PANACEACHS_SERVER}/api/Scan/GetScanIndexesMas`, {
      requestData: {
        getAll: true,
      },
    })
    .then((res) => {
      return res.data.responseData;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  return res;
};

const findAdmit = async (an) => {
  let res = await axios({
    url: `${env.REACT_APP_PANACEACHS_SERVER}/api/MedicalStatistics/GetIpdCardNameByAn`,
    method: "POST",
    data: {
      mode: null,
      user: null,
      ip: null,
      lang: null,
      branch_id: null,
      requestData: {
        patientId: null,
        an: an,
      },
      barcode: null,
    },
  })
    .then(({ data }) => {
      let { admitId } = data.responseData.ipdCardDisplay;
      return admitId || null;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  return res;
};
function rotateImage(imageBase64, rotation, cb) {
  var img = new Image();
  img.src = imageBase64;
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
    console.log(rotatedImg);
    cb(rotatedImg);
    // var canvas = document.createElement("canvas");
    // const maxDim = Math.max(img.height, img.width);
    // // if ([90, 270].indexOf(rotation) > -1) {
    // //   canvas.width = img.height;
    // //   canvas.height = img.width;
    // // } else {
    // canvas.width = img.width;
    // canvas.height = img.height;
    // // }
    // var ctx = canvas.getContext("2d");
    // ctx.translate(img.width, img.height);
    // ctx.rotate(180 * Math.PI / 180);
    // ctx.drawImage(img, 0, 0);
    // // ctx.setTransform(1, 0, 0, 1, maxDim / 2, maxDim / 2);
    // // ctx.rotate(90 * (Math.PI / 180));
    // // ctx.drawImage(img, -maxDim / 2, -maxDim / 2);

    // cb(canvas.toDataURL("image/jpeg"))
  };
}

const PreviewPdf = forwardRef(
  (
    {
      pdf,
      patientId,
      setSelected = () => "",
      selected = [],
      unSelectable = false,
      onDelete = () => { },
      deleteAble = true,
      onEdit = () => { },
      setPdf = () => { },
      getSelect = () => [],
      scanId = "opdScanId",
      // width = "56rem",
      height = "56rem",
      selectablePdfHeight = "50rem",
      isEdit,
      hiddenThumbnails = false,
      hiddenFullScreen = false,
      hiddenAddDocuments = true,
      type = null,
      keyPdf = null
    },
    ref
  ) => {
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editCodeForm] = Form.useForm();
    const [workPlaceList, setWorkPlaceList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [documentType, setDocumentType] = useState([]);
    const [opdIpd, setOpdIpd] = useState(null);
    const documentTypeAll = useRef([]);
    const [pdfView, setPdfView] = useState(null);
    useImperativeHandle(ref, () => ({
      editScan: (selectPdf, total) => {
        editCodeForm.setFieldsValue({
          page: selectPdf.length,
          selectPdf,
        });
        handleEdit(selectPdf, total);
      },
      hideModalEditScan: () => {
        setIsEditVisible(false);
      },
    }));
    const getMasterData = () => {
      GetListWorkPlaceWithDepartName().then((data) => {
        setDepartmentList(
          uniqBy(
            data?.map((item) => item?.department),
            "departId"
          )
        );
        setWorkPlaceList(
          data?.map((item) => ({
            ...item?.workplace,
            departId: item?.department?.departId,
          }))
        );
      });
      GetListDocumentType().then((data) => {
        documentTypeAll.current = data;
        setDocumentType(data);
      });
    };
    const handleEdit = (selectPdf, total = pdf?.length) => {
      const firstPdf = selectPdf[0];
      const selectWork = workPlaceList?.find(
        (item) => `${item.workId}` === firstPdf?.workId + ""
      );
      const scanIndexType = firstPdf?.ipdScanId
        ? "I"
        : firstPdf?.opdScanId
          ? "O"
          : null;
      editCodeForm.setFieldsValue({
        departId: selectWork?.departId ? selectWork?.departId + "" : null,
        clinicId: null,
      });
      console.log(firstPdf);
      setIsEditVisible(true);
      setDocumentType(
        documentTypeAll.current.filter(
          (item) => item?.documentType === scanIndexType || !scanIndexType
        )
      );
      if (firstPdf?.ipdScanId) {
        console.log("IIII");
        setOpdIpd("I");
      } else if (firstPdf?.opdScanId) setOpdIpd("O");
      editCodeForm.setFieldsValue({
        total,
        an: firstPdf?.an,
        hn: firstPdf?.hn,
        scanIndex: firstPdf?.scanIndex,
        workId: firstPdf?.workId,
        departId: selectWork?.departId ? selectWork?.departId + "" : null,
      });
    };
    const onEditFinish = async (values) => {
      console.log(pdf);
      const scanIndexType = documentType?.find(
        (item) => item?.code === values?.scanIndex
      )?.documentType;
      const admitId = await findAdmit(values?.an);
      const request = values?.selectPdf?.map((item) => {
        return {
          ...item,
          action: "update",
          hn: values?.hn ? values?.hn : null,
          an: values?.an ? values?.an : null,
          admitId,
          patientId: patientId,
          scanIndex: values?.scanIndex,
          documentType: scanIndexType,
          workId: values?.workId,
          clinicId: values?.clinicId,
          clinicDate: moment().format("MM/DD/YYYY HH:mm:ss"),
        };
      });
      console.log(request);
      onEdit(request);
      // handleUpdateScan(request)
      //   .then((res) => {
      //     toast.success("บันทึกสำเร็จ", {
      //         position: "top-right",
      //         autoClose: 1500,
      //         closeOnClick: true,
      //         pauseOnHover: true,
      //         draggable: true,
      //       });
      //   })
    };

    async function savePdf(jpeg) {
      let imageList = [];
      // let tmp = await Promise.all( jpeg.map(async(item)=> await convert(item)))
      // console.log(tmp)
      // let tmp = await Promise.all( jpeg.map(async(item)=> await toBase64(item,
      // function(dataUrl) {
      //     console.log("url(" + dataUrl + ")")
      // })))
      // console.log(tmp)

      imageList = jpeg.map((item) => "data:image/png;base64," + item);
      const multiPng = await generatePdf(imageList);

      // generate dataURLString
      const dataURLString = await multiPng.output("dataurlstring");
      setPdfView(dataURLString);
    }
    const downloadFile = async () => {
      let filesAdded = 0;
      if (
        find(
          roles,
          (data) =>
            data.name?.includes("ธุรการ") ||
            data.name?.includes("เวชระเบียน") ||
            data.name?.includes("Read/Download File Scan")
        )
      ) {
        let files = selected?.length === 0 ? pdf : selected;
        const totalFiles = files.length;
        console.log("download", files);
        const imageZip = new JSZip();
        files.forEach((item, index) => {
          imageZip.file(`img_${index}.png`, `${item.imageScan}`, {
            base64: true,
          });
          filesAdded++;
          const progress = (filesAdded / totalFiles) * 100;
          console.log("progress", progress);
        });
        await imageZip
          .generateAsync({
            type: "base64",
          })
          .then((content) => {
            const a = document.createElement("a");
            a.href = "data:application/zip;base64," + content;
            a.download = "images.zip";
            a.click();
          })
          .catch((err) => console.log(err));
        // const link = document.createElement('a');
        // link.href = pdfView
        // link.download = 'panacea.pdf';
        // link.click();
      } else {
        toast.warn("user ที่มีสิทธิ์ Download ได้เท่านั้น ", {
          position: "top-right",
          autoClose: 1500,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };
    const printFile = async () => {
      // if (
      //   find(
      //     roles,
      //     (data) =>
      //       data.name?.includes("ธุรการ") ||
      //       data.name?.includes("เวชระเบียน") ||
      //       data.name?.includes("Read/Download File Scan")
      //   )
      // ) {
      // let cut = pdfView
      // if (cut.includes("data:application/pdf;filename=generated.pdf;base64,")) {
      //   let sub = cut.indexOf("data:application/pdf;filename=generated.pdf;base64,")
      //   cut = cut.substring(sub + "data:application/pdf;filename=generated.pdf;base64,".length)
      // }

      let files =
        selected?.map((data) => {
          return data.imageScan;
        }).length === 0
          ? pdf?.map((data) => {
            return data.imageScan;
          })
          : selected?.map((data) => {
            return data.imageScan;
          });
      if (files.length) {
        setLoading(true);
        let imageList = files.map((item) => "data:image/png;base64," + item);
        const multiPng = await generatePdf(imageList, true);
        // generate dataURLString
        const dataURLString = new Promise((resolve) =>
          resolve(multiPng.output("dataurlstring"))
        );
        dataURLString.then(async (data) => {
          if (
            data.includes(
              "data:application/pdf;filename=generated.pdf;base64,"
            )
          ) {
            let sub = data.indexOf(
              "data:application/pdf;filename=generated.pdf;base64,"
            );
            data = data.substring(
              sub +
              "data:application/pdf;filename=generated.pdf;base64,".length
            );
            await QzPrint(
              data,
              null,
              null,
              null,
              null,
              null,
              1,
              setLoading,
              "portrait"
            );
          }
        });
        // if (cut.includes("data:application/pdf;filename=generated.pdf;base64,")) {
        //   let sub = cut.indexOf("data:application/pdf;filename=generated.pdf;base64,")
        //   cut = cut.substring(sub + "data:application/pdf;filename=generated.pdf;base64,".length)
        // }
      }

      // console.log("cut",cut);
      // } else {
      //   toast.warn("user ที่มีสิทธิ์พิมพ์ได้เท่านั้น ", {
      //     position: "top-right",
      //     autoClose: 1500,
      //     closeOnClick: true,
      //     pauseOnHover: true,
      //     draggable: true,
      //   });
      // }
    };
    const onRotatePdfView = async (rotate) => {
      const imageSelect = selected.length > 0 ? selected : getSelect();
      console.log(imageSelect);
      if (imageSelect.length > 0) {
        const pdfRotation = await Promise.all(
          imageSelect?.map((item) => {
            const dataUrl = URL.createObjectURL(base64toBlob(item?.imageScan));
            const result = new Promise((resolve, reject) => {
              rotateImage(dataUrl, rotate, async (rotateImg) => {
                let img = await rotateImg;
                resolve({
                  ...item,
                  imageScan: img?.split("base64,")[1],
                });
              });
            });
            return result;
          })
        );
        console.log(pdf);
        console.log(pdfRotation);
        setPdf((prev) => {
          console.log(prev);
          return prev?.map((item1) => {
            const newPdfView = pdfRotation?.find(
              (item2) => item2[scanId] === item1[scanId]
            );
            console.log(newPdfView);
            if (newPdfView) {
              console.log(newPdfView, item1);
              item1.imageScan = newPdfView?.imageScan;
            }
            return item1;
          });
        });
      }
    };
    // console.log(pdfView)
    const renderToolbar = (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            EnterFullScreen,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            Zoom,
            ZoomIn,
            ZoomOut,
          } = slots;
          return <Row gutter={[2, 4]} justify="center" align="middle">
            <Col>
              <ZoomOut id="none" />
            </Col>
            <Col>
              <Zoom />
            </Col>
            <Col>
              <ZoomIn />
            </Col>
            <Col hidden={!deleteAble}>
              {deleteAble ? (
                <Popconfirm
                  title={"ต้องการลบใช่หรือไม่"}
                  onConfirm={onDelete}
                >
                  <DeleteOutlined className="pointer" />
                </Popconfirm>
              ) : (
                []
              )}
            </Col>
            <Col>
              <EditOutlined
                className="pointer"
                onClick={() => handleEdit(pdf)}
              />
            </Col>
            <Col>
              <GoToPreviousPage />
            </Col>
            <Col>
              <div
                style={{
                  // padding: "0px 2px",
                  marginRight: 4,
                  width: 45,
                }}
              >
                <CurrentPageInput />
              </div>
            </Col>
            <Col>
              / <NumberOfPages />
            </Col>
            <Col>
              <GoToNextPage />
            </Col>
            <Col>
              {isEdit && (
                <Row gutter={[2, 2]}>
                  <Col>
                    <Tooltip placement="bottom" title={"บันทึก"}>
                      <button
                        className="rpv-core__minimal-button"
                        onClick={() => {
                          onEdit(pdf);
                        }}
                      >
                        <SaveOutlined />
                      </button>
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip placement="bottom" title={"กลับหัว"}>
                      <button
                        className="rpv-core__minimal-button"
                        onClick={() => onRotatePdfView(180)}
                      >
                        <SwapOutlined rotate={90} />
                      </button>
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip placement="bottom" title={"หมุนซ้าย"}>
                      <button
                        className="rpv-core__minimal-button"
                        onClick={() => onRotatePdfView(-90)}
                      >
                        <RotateLeftOutlined />
                      </button>
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip placement="bottom" title={"หมุนขวา"}>
                      <button
                        className="rpv-core__minimal-button"
                        onClick={() => onRotatePdfView(90)}
                      >
                        <RotateRightOutlined />
                      </button>
                    </Tooltip>
                  </Col>
                </Row>
              )}
            </Col>
            <Col hidden={hiddenFullScreen}>
              <EnterFullScreen />
            </Col>
            <Col>
              <button
                className="rpv-core__minimal-button"
                onClick={downloadFile}
              >
                <DownloadOutlined />
              </button>
            </Col>
            <Col>
              <Tooltip placement="Bottom" title={<span>Print</span>}>
                <div>
                  <button
                    className="rpv-core__minimal-button"
                    onClick={printFile}
                  >
                    <PrinterOutlined
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      className="pointer "
                      aria-label={"Print"}
                    />
                  </button>
                </div>
              </Tooltip>
            </Col>
          </Row>
        }}
      </Toolbar>
    );
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
      renderToolbar,
      sidebarTabs: (defaultTabs) => [],
    });
    const [selectedPages, setSelectedPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
      if (pdf.length > 0) {
        savePdf(pdf.map((data) => data.imageScan));
      } else {
        setPdfView(null);
      }
      return setPdfView(null);
    }, [pdf]);

    useEffect(() => {
      setSelectedPages([])
      setCurrentPage(0)
      setSelected([])
    }, [keyPdf])

    useEffect(() => {
      getMasterData();
    }, []);


    return (
      <>
        <Worker workerUrl={`${env.PUBLIC_URL}/assets/js/pdf.worker.js`}>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              height: height,
            }}
          >
            {pdfView ? (
              <SelectablePDF
                loading={loading}
                unSelectable={unSelectable}
                other={pdf}
                onPageChange={(res) => console.log(res)}
                fileUrl={pdfView}
                plugins={[defaultLayoutPluginInstance]}
                // onDocumentLoad={handleDocumentLoad}
                renderError={console.log}
                renderLoader={(percentages) => (
                  <div
                    style={{
                      width: "240px",
                    }}
                  >
                    <ProgressBar progress={Math.round(percentages)} />
                  </div>
                )}
                setSelected={(e) => {
                  setSelected(e);
                  editCodeForm.setFieldsValue({
                    page: e.length,
                    selectPdf: e,
                  });
                }}
                height={selectablePdfHeight}
                hiddenThumbnails={hiddenThumbnails}
                hiddenAddDocuments={hiddenAddDocuments}
                type={type}
                selectedPages={selectedPages}
                setSelectedPages={setSelectedPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            ) : (
              <Empty />
            )}
          </div>
        </Worker>
        <Modal
          visible={isEditVisible}
          zIndex="1000"
          width="340px"
          onCancel={() => setIsEditVisible(false)}
          okText="ตกลง"
          cancelText="ยกเลิก"
          onOk={() => {
            !loading && editCodeForm.submit();
          }}
          title={<label>{"แก้ไขรายละเอียด"}</label>}
        >
          <Spin spinning={loading}>
            <Form form={editCodeForm} onFinish={onEditFinish}>
              <Row
                style={{
                  flexDirection: "row",
                }}
              >
                <Col
                  span={24}
                  style={{
                    display: "flex",
                  }}
                >
                  <Form.List name="selectPdf">
                    {(fields) => (
                      <>
                        {fields.map((field) => (
                          <Form.Item {...field} hidden={true}>
                            <Input />
                          </Form.Item>
                        ))}
                      </>
                    )}
                  </Form.List>
                  <Form.Item name="key" hidden={true}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="code" hidden={true}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="type" hidden={true}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="isFirstPage" hidden={true}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="clinicId" hidden={true}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={"จำนวนภาพสแกน"} name="page">
                    <InputNumber controls={false} disabled></InputNumber>
                  </Form.Item>
                  <label
                    style={{
                      padding: "10px",
                    }}
                  >
                    {"/"}
                  </label>
                  <Form.Item colon={false} label={" "} name="total">
                    <InputNumber disabled controls={false}></InputNumber>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={"AN"} name="an" hidden={opdIpd !== "I"}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={"HN"} name="hn" hidden={opdIpd !== "O"}>
                    <Input
                      controls={false}
                      onChange={() =>
                        editCodeForm.setFieldsValue({
                          clinicId: null,
                        })
                      }
                    ></Input>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={"ประเภทเอกสาร"} name="scanIndex">
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      // onChange={(e) => {
                      //   const selectDocument = documentType?.find((item) => item?.code === e)
                      //   console.log(selectDocument)
                      //   editCodeForm.setFieldsValue({ type: selectDocument?.documentType })
                      // }}
                      style={{
                        width: "100%",
                      }}
                      placeholder={"ประเภทเอกสาร"}
                      options={documentType.map(({ name, code }, index) => {
                        return {
                          label: name,
                          value: code,
                        };
                      })}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="OPD/ward"
                    name="workId"
                    hidden={opdIpd !== "O"}
                  >
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={(e) => {
                        const selectWork = workPlaceList?.find(
                          (item) => `${item.workId}` === e + ""
                        );
                        editCodeForm.setFieldsValue({
                          departId: selectWork?.departId
                            ? selectWork?.departId + ""
                            : null,
                          clinicId: null,
                        });
                      }}
                      style={{
                        width: "100%",
                      }}
                      placeholder={"ห้องตรวจ"}
                      options={workPlaceList.map(
                        ({ workId, name, mapping1 }, index) => {
                          return {
                            label: `${mapping1 || ""} ${name}`,
                            value: `${workId}`,
                          };
                        }
                      )}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={"แผนก"}
                    name="departId"
                    hidden={opdIpd !== "O"}
                  >
                    <Select
                      showSearch
                      allowClear={true}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={(e) => {
                        // nocodeform.setFieldsValue({ serviceId: null, clinicId: null })
                      }}
                      style={{
                        width: "100%",
                      }}
                      placeholder={"แผนก"}
                      options={departmentList.map(
                        ({ departId, name, mapping1 }, index) => {
                          return {
                            label: `${mapping1 || ""} ${name}`,
                            value: `${departId}`,
                          };
                        }
                      )}
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
      </>
    );
  }
);
export default PreviewPdf;
