


import React, { useState, useEffect, useRef } from "react";

import { Button, Row, Col, Layout, Modal, Slider, Radio } from "antd";

import "./paint-template.less";
import { DETAL_IMAGE, EYES_IMAGE } from "./ImageTemplate";

const color = [
  "#8F00FF",
  "#0000FF",
  "#00FF00",
  "#FF0000",
  "#FFBF00",
  "#DFFF00",
  "#FFFFFF",
  "#E1E1E1",
  "#999999",
  "#454545",
  "#333333",
  "#000000",
];

const IMGWidth = 600;
const IMGHeight = 400;

export default function PaintBoard({
  paintActive,
  handlePaintModal,
  handleSavePicture,
  picture,
  showTemplate = false,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineColor, setLineColor] = useState("#000");

  const [isClear, setIsClear] = useState(false);
  const [selectTemplate, setSelectTemplate] = useState(1);
  const [backImage, setBackImage] = useState(null);

  useEffect(() => {
    if (picture && picture.backPicture) {
      setBackImage(picture.backPicture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture && picture.backPicture]);

  //Initialization for the first time
  useEffect(() => {
    if (paintActive) {
      // const canvas = canvasRef.current;
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;

      if (picture && picture.frontPicture) {
        createFrontPicture(context);
      }

      canvasRef.current = context;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture && picture.frontPicture, paintActive]);

  ///เมื่อมีการลบข้อมูลที่วาด จะทำการวนสร้างรูปใหม่
  useEffect(() => {
    if (paintActive) {
      const canvas = canvasRef.current;

      if (picture && picture.frontPicture) {
        createFrontPicture(canvas);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClear]);

  const createFrontPicture = (context) => {
    const images = document.getElementById("frontPicture");
    images.onload = function () {
      context.drawImage(images, 0, 0, IMGWidth, IMGHeight);
    };
    images.src = picture.frontPicture;
  };

  // Function for starting the drawing
  const startDrawing = (e) => {
    canvasRef.current.beginPath();
    canvasRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  // Function for ending the drawing
  const endDrawing = () => {
    canvasRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) {
      return;
    }
    canvasRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    canvasRef.current.stroke();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    setIsClear(!isClear);
  };

  const handleSave = () => {
    const canvas = document.getElementById("canvas");
    const frontPicture = canvas.toDataURL("image/png");
    const backPicture = canvas?.style?.backgroundImage
      ?.slice(4, -1)
      .replace(/"/g, "");

    handleSavePicture?.({
      tempPicId:
        picture && picture.tempPicId ? picture && picture.tempPicId : null,
      uid: picture && picture.uid ? picture && picture.uid : null,
      name: picture && picture.name ? picture && picture.name : null,
      status: picture && picture.status ? picture && picture.status : "",
      frontPicture: frontPicture,
      backPicture: backPicture,
    });
    handleClear();
    setSelectTemplate(1);
  };

  const handleStrokeColorChange = (color) => {
    setLineColor(color);
    const canvas = canvasRef.current;
    canvas.strokeStyle = color;
  };

  const handleRateScoreChange = (value) => {
    setLineWidth(value);
    const canvas = canvasRef.current;
    canvas.lineWidth = value;
  };

  const onChangeImageTemplate = (event) => {
    setSelectTemplate(event.target.value);

    if (event.target.value !== 1) {
      setBackImage(`${event.target.value}`);
    } else {
      setBackImage(picture && picture.backPicture ? picture.backPicture : null);
    }

    handleClear();
  };
  return (
    <Modal
      title={<label className="topic-green-bold">วาดรูป</label>}
      centered
      visible={paintActive}
      onCancel={() => {
        handlePaintModal(false);
        handleClear();
      }}
      footer={
        <div className="text-center">
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button type="primary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      }
      width={1000}
    >
      <Row>
        <Col span={16}>
          <canvas
            id="canvas"
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            height={IMGHeight}
            width={IMGWidth}
            style={{
              border: "1px solid black",
              backgroundImage: `url(${backImage})`,
              backgroundSize: `${IMGWidth}px ${IMGHeight}px`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />

          {picture && picture.frontPicture && (
            <div style={{ display: "none" }}>
              <img
                alt="frontPicture"
                id="frontPicture"
                src="frontPicture.jpg"
                width={IMGWidth}
                height={IMGHeight}
              />
            </div>
          )}

          {/* {backPicture && (
            <div style={{ display: "none" }}>
              <img
                id="backPicture"
                src="backPicture.jpg"
                width={IMGWidth}
                height={IMGHeight}
              />
            </div>
          )} */}
        </Col>
        <Col span={8}>
          <Row>
            <Col span={4} style={{ paddingBottom: 20, paddingLeft: 0 }}>
              <Layout
                style={{
                  width: 37,
                  height: 70,
                  backgroundColor: lineColor,
                  border: "1px solid black",
                }}
              />
            </Col>
            <Col span={20} style={{ paddingBottom: 20 }}>
              <Row>
                {color.map((val,index) => (
                  <Col key={index} span={4} style={{ paddingBottom: 20, paddingLeft: 0 }}>
                    <Layout
                      style={{
                        width: 25,
                        height: 25,
                        backgroundColor: val,
                        cursor: "pointer",
                        border: "1px solid #999999",
                      }}
                      onClick={() => handleStrokeColorChange(val)}
                    />
                  </Col>
                ))}
              </Row>
            </Col>

            <Col span={24} style={{ paddingBottom: 20, paddingLeft: 0 }}>
              <Row>
                <Col span={20}>
                  <Slider
                    style={{ marginLeft: 0 }}
                    min={1}
                    max={15}
                    onChange={handleRateScoreChange}
                    value={lineWidth}
                  />
                </Col>
                <Col span={4} style={{ paddingLeft: 0 }}>
                  <label style={{ marginTop: 8 }}>{lineWidth}</label>
                </Col>
              </Row>
            </Col>

            {showTemplate && (
              <Col span={24} style={{ paddingBottom: 20, paddingLeft: 0 }}>
                <Row>
                  <Col span={24} style={{ color: "#27e040" }}>
                    Template
                  </Col>
                  <Col span={24}>
                    <Radio.Group
                      onChange={(event) => onChangeImageTemplate(event)}
                      value={selectTemplate}
                      defaultValue={1}
                    >
                      <Row>
                        <Col span={10} style={spaceStyle}>
                          <div style={containerTemplateStyle}>
                            <Radio value={1} />
                          </div>
                          <div style={lableTemplateeStyle}>ว่าง</div>
                        </Col>
                        <Col span={10} style={spaceStyle}>
                          <div style={containerTemplateStyle}>
                            <Radio value={`${EYES_IMAGE}`} />
                            <img
                              alt="example"
                              style={imageTemplateStyle}
                              src={`${EYES_IMAGE}`}
                            />
                          </div>
                          <div style={lableTemplateeStyle}>ตา</div>
                        </Col>
                        <Col span={10} style={spaceStyle}>
                          <div style={containerTemplateStyle}>
                            <Radio value={`${DETAL_IMAGE}`} />
                            <img
                              alt="example"
                              style={imageTemplateStyle}
                              src={`${DETAL_IMAGE}`}
                            />
                          </div>
                          <div style={lableTemplateeStyle}>ฟัน</div>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Modal>
  );
}

const containerTemplateStyle = {
  width: "100%",
  border: "1px solid #27e040",
  borderRadius: "5px",
  padding: "8px",
  height: "115px",
};
const spaceStyle = {
  marginTop: "8px",
};

const imageTemplateStyle = {
  width: "100%",
  // marginTop: "8px",
  height: "70px",
};

const lableTemplateeStyle = {
  fontSize: "14px",
  textAlign: "center",
  marginTop: "8px",
  color: " #27e040",
};
