import { env } from "../../env.js";

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Checkbox } from "antd";
import { map, find } from "lodash";
import "./css/teeth.css";
export default function TeethStatusFha({
  // teethStatus,
  // setTeethResult,
  // teethResult,
  teethStatusResult,
  defaultStatus,
  setDefaultStatus,
  setTeethChange,
  showStatusLabel = true,
  showSideTeeth = true,
  submitTeethDropdown,
  dropdownSelect = false,
  teethByEnter = [],
}) {
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const Q1 = ["18", "17", "16", "15", "14", "13", "12", "11"]; //ฟันแท้บนซ้าย
  const Q2 = ["21", "22", "23", "24", "25", "26", "27", "28"]; //ฟันแท้บนขวา
  const Q3 = ["48", "47", "46", "45", "44", "43", "42", "41"]; //ฟันแท้ล่างซ้าย
  const Q4 = ["31", "32", "33", "34", "35", "36", "37", "38"]; //ฟันแท้ล่างซ้าย
  const DeciduousUpperL = ["55", "54", "53", "52", "51"]; //ฟันน้ำนมบนซ้าย
  const DeciduousUpperR = ["61", "62", "63", "64", "65"]; //ฟันน้ำนมบนขวา
  const DeciduousLowerL = ["85", "84", "83", "82", "81"]; //ฟันน้ำนมล่างซ้าย
  const DeciduousLowerR = ["71", "72", "73", "74", "75"]; //ฟันน้ำนมล่างขวา
  const [statusList, setStatusList] = useState(defaultStatus);
  const [friend, setFriend] = useState(false);
  const [, setLoading] = useState(true);
  useEffect(() => {
    console.log(defaultStatus);
    setStatusList(defaultStatus);
  }, [defaultStatus]);
  useEffect(() => {
    if (dropdownSelect) {
      let status = defaultStatus.map((d) => {
        let findIndex = submitTeethDropdown?.findIndex(
          (select) => d?.teeth === select
        );
        return findIndex & (findIndex === -1)
          ? {
            ...d,
            teethStatus: "",
          }
          : {
            ...d,
            teethStatus: "N",
          };
      });
      setDefaultStatus(status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTeethDropdown]);
  useEffect(() => {
    if (teethByEnter.length) {
      let status = defaultStatus.map((d) => {
        let findIndex = teethByEnter.findIndex(
          (select) => d?.teeth === select
        );
        return findIndex & (findIndex === -1)
          ? {
            ...d,
          }
          : {
            ...d,
            teethStatus: teethStatusResult,
          };
      });
      setDefaultStatus(status);
    }
  }, [teethByEnter])

  const checkStatusColor = (teeth) => {
    let findData = defaultStatus.find((d) => d.teeth === teeth);
    if (findData.teethStatus === "N") {
      return "#D4FDA2";
    } else if (findData.teethStatus === "C") {
      return "#80C6FE";
    } else if (findData.teethStatus === "F") {
      return "#D6D6D6";
    } else if (findData.teethStatus === "E") {
      return "#FFAAC6";
    } else if (findData.teethStatus === "1") {
      return "#FF8181";
    } else if (findData.teethStatus === "2") {
      return "#F5BDFF";
    } else if (findData.teethStatus === "3") {
      return "#77FDFD";
    } else if (findData.teethStatus === "4") {
      return "#FFF88C";
    } else if (findData.teethStatus === "NR") {
      return "#FF9100";
    } else {
      return "";
    }
  };
  const setToothPosterior = (index, dirId, dirIsSelect) => {
    setLoading(true);
    let prevStatus = statusList.map((val) =>
      val.teeth === index
        ? {
          ...val,
          teethStatus: val.teethStatus,
          teeth: val.teeth,
          side: val.side
            ? val.side.includes(dirId)
              ? val.side.replace(`${dirId},`, "")
              : val.side.concat("", `${dirId},`)
            : `${dirId},`,
          status: true,
          dirId: dirId,
          // ด้านที่เลือก (ซ้าย: B (Buccal),ขวา: L (Lingual),ล่าง: M (Mesial),บน: D (Distal),กลาง: O (Occlusal))
          dirIsSelectB:
            dirId === "B"
              ? val.dirIsSelectB
                ? !dirIsSelect
                : true
              : val.dirIsSelectB || null,
          dirIsSelectM:
            dirId === "M"
              ? val.dirIsSelectM
                ? !dirIsSelect
                : true
              : val.dirIsSelectM || null,
          dirIsSelectL:
            dirId === "L"
              ? val.dirIsSelectL
                ? !dirIsSelect
                : true
              : val.dirIsSelectL || null,
          dirIsSelectD:
            dirId === "D"
              ? val.dirIsSelectD
                ? !dirIsSelect
                : true
              : val.dirIsSelectD || null,
          dirIsSelectO:
            dirId === "O"
              ? val.dirIsSelectO
                ? !dirIsSelect
                : true
              : val.dirIsSelectO || null,
        }
        : val
    );
    setStatusList(prevStatus);
    setLoading(false);
    setDefaultStatus(prevStatus);
  };

  // eslint-disable-next-line no-unused-vars
  const genTeeth = (datavalue, key, notteeth) => {
    const chkTeethPosition = (teeth) => {
      const findQ1 = find(Q1, (o) => o === teeth);
      if (findQ1) return "topLeft";
      const findQ2 = find(Q2, (o) => o === teeth);
      if (findQ2) return "topRight";
      const findQ3 = find(Q3, (o) => o === teeth);
      if (findQ3) return "bottomLeft";
      const findQ4 = find(Q4, (o) => o === teeth);
      if (findQ4) return "bottomRight";
      const findDeciduousUpperL = find(DeciduousUpperL, (o) => o === teeth);
      if (findDeciduousUpperL) return "deciduousUpperL";
      const findDeciduousUpperR = find(DeciduousUpperR, (o) => o === teeth);
      if (findDeciduousUpperR) return "deciduousUpperR";
      const findDeciduousLowerL = find(DeciduousLowerL, (o) => o === teeth);
      if (findDeciduousLowerL) return "deciduousLowerL";
      const findDeciduousLowerR = find(DeciduousLowerR, (o) => o === teeth);
      if (findDeciduousLowerR) return "deciduousLowerR";
    };
    let seq = [];
    const teethPosition = chkTeethPosition(datavalue);
    switch (teethPosition) {
      case "topLeft":
        seq = ["BT", "DL", "MR", "O", "LB"];
        break;
      case "topRight":
        seq = ["BT", "ML", "DR", "O", "LB"];
        break;
      case "bottomLeft":
        seq = ["LT", "DL", "MR", "O", "BB"];
        break;
      case "bottomRight":
        seq = ["LT", "ML", "DR", "O", "BB"];
        break;
      case "deciduousUpperL":
        seq = ["BT", "DL", "MR", "O", "LB"];
        break;
      case "deciduousUpperR":
        seq = ["BT", "ML", "DR", "O", "LB"];
        break;
      case "deciduousLowerL":
        seq = ["LT", "DL", "MR", "O", "BB"];
        break;
      case "deciduousLowerR":
        seq = ["LT", "ML", "DR", "O", "BB"];
        break;
      default:
        break;
    }
    const showTeethSide = (side, index) => {
      let style;
      let width;
      let height;
      const dirId = side[0];
      const dirIsSelect = `dirIsSelect${dirId}`;
      let dirNameIsClick = false;
      let isClick = false;
      let urlImg = "ToothSide";
      let filterStatusList = statusList.filter((val) => val.teeth === key)[0];
      if (filterStatusList?.side) {
        if (filterStatusList.side.includes(dirId)) {
          urlImg = "ToothSideHover";
          dirNameIsClick = true;
          isClick = true;
        }
        if (filterStatusList[dirIsSelect] || isClick) {
          urlImg = "ToothSideHover";
          dirNameIsClick = true;
        } else {
          urlImg = "ToothSide";
          dirNameIsClick = false;
        }
      } else {
        urlImg = "ToothSide";
        dirNameIsClick = true;
      }
      // console.log('urlImg', urlImg)
      // console.log('side', side)
      switch (index) {
        case 0:
          style = {};
          width = 24;
          height = 12;
          break;
        case 1:
          style = { marginLeft: -23, marginTop: -14 };
          width = 12;
          height = 24;
          break;
        case 2:
          style = { marginRight: -22, marginTop: -50 };
          width = 12;
          height = 24;
          break;
        case 3:
          style = { marginTop: -86 };
          width = 16;
          height = 16;
          break;
        case 4:
          style = { marginTop: -101 };
          width = 24;
          height = 12;
          break;
        default:
          break;
      }
      return (
        <>
          <img
            alt=""
            width={width}
            height={height}
            style={style}
            onMouseOver={(e) =>
              (e.currentTarget.src = `${env.PUBLIC_URL}/assets/images/teeth/ToothSideHover/${side}.png`)
            }
            onMouseOut={(e) =>
              (e.currentTarget.src = `${env.PUBLIC_URL}/assets/images/teeth/${urlImg}/${side}.png`)
            }
            src={`${env.PUBLIC_URL}/assets/images/teeth/${urlImg}/${side}.png`}
            onClick={(e) => {
              e.stopPropagation();
              setToothPosterior(key, side[0], dirNameIsClick);
            }}
          />
          <br />
        </>
      );
    };
    const genTeethSide = () => {
      return (
        <center>
          {seq?.map((s, i) => {
            return showTeethSide(s, i);
          })}
        </center>
      );
    };
    return (
      <div style={{ padding: 3 }}>
        <div
          style={{
            backgroundColor: checkStatusColor(key),
            border: "1px solid #ccc",
            padding: 3,
            borderRadius: 4,
          }}
        >
          <Row
            className="pointer"
            onClick={(e) => {
              // if (teethChoose === "teeth" || teethChoose === "Other") {
              //   setStatus(key, "#81C784");
              // }
              e.stopPropagation();
              let replaceData = {
                teethStatus: teethStatusResult,
                teeth: datavalue,
              };
              let findIndex = defaultStatus.findIndex(
                (s) => s.teeth === datavalue
              );
              let findData = statusList.find((s) => s.teeth === datavalue);
              if (findData?.teethStatus?.length > 0) {
                if (findData.teethStatus !== teethStatusResult) {
                  replaceData.teethStatus = teethStatusResult;
                } else {
                  replaceData.teethStatus = "";
                }
              }
              setTeethChange({
                teeth: replaceData.teeth,
                teethStatus: replaceData.teethStatus,
              });
              statusList.splice(findIndex, 1, replaceData);
              setDefaultStatus([...statusList]);
              setFriend(!friend);
            }}
          >
            <Col
              hidden={!showSideTeeth}
              span={24}
              style={{
                height: 40,
                paddingTop: 5,
                margin: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
              }}
            >
              {genTeethSide()}
            </Col>

            <Col
              span={24}
              style={{
                // showSideTeeth
                height: 65,
                paddingTop: 4,
                margin: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
              }}
            >
              <center>
                <img
                  alt=""
                  style={{}}
                  width={28}
                  src={`${env.PUBLIC_URL}/assets/images/teeth/${datavalue}.png`}
                />
              </center>
            </Col>

            <Col span={24}>
              <center>
                <div className="text-center">
                  <label className="pointer">{datavalue}</label>
                </div>
              </center>
            </Col>
          </Row>
        </div>
      </div>
    );
  };
  const renderTeeth = () => {
    const teethStyles = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      margin: "auto",
    };
    const mapping = (dts) => {
      return map(dts, (o) => {
        return <div key={o}>{genTeeth(o, o)}</div>;
      });
    };
    return (
      <>
        {hosParam?.dentalTemplates !== "2" && (
          <Row gutter={[4, 4]}>
            <Col span={24} xxl={15} xl={15} className="pe-2">
              <div style={{ ...teethStyles }}>
                {mapping(Q1)}&nbsp;&nbsp;{mapping(Q2)}
              </div>
              <div style={{ ...teethStyles }}>
                {mapping(Q3)}&nbsp;&nbsp;{mapping(Q4)}
              </div>
            </Col>
            <Col span={24} xxl={9} xl={9}>
              <div style={{ ...teethStyles }}>
                {mapping(DeciduousUpperL)}&nbsp;&nbsp;{mapping(DeciduousUpperR)}
              </div>
              <div style={{ ...teethStyles }}>
                {mapping(DeciduousLowerL)}&nbsp;&nbsp;{mapping(DeciduousLowerR)}
              </div>
            </Col>
          </Row>
        )}
        {hosParam?.dentalTemplates === "2" && (
          <Row gutter={[4, 4]}>
            <Col span={24} className="text-center">
              <div style={{ ...teethStyles }}>
                {mapping(DeciduousUpperL)}&nbsp;&nbsp;{mapping(DeciduousUpperR)}
              </div>
            </Col>
            <Col span={24} className="text-center">
              <div style={{ ...teethStyles }}>
                {mapping(Q1)}&nbsp;&nbsp;{mapping(Q2)}
              </div>
              <div style={{ ...teethStyles }}>
                {mapping(Q3)}&nbsp;&nbsp;{mapping(Q4)}
              </div>
            </Col>
            <Col span={24} className="text-center">
              <div style={{ ...teethStyles }}>
                {mapping(DeciduousLowerL)}&nbsp;&nbsp;{mapping(DeciduousLowerR)}
              </div>
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <div>
      <Card bordered={false} className="mb-1">
        {showStatusLabel && (
          <div className="mb-3 text-end">
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#D4FDA2",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              มีฟัน
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#80C6FE",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ต้องอุด
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#D6D6D6",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              อุดแล้ว
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FFAAC6",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ต้องถอน
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FF8181",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ถอนแล้ว
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FF9100",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ต้องรักษารากฟัน
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#F5BDFF",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              รักษารากฟันแล้ว
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#77FDFD",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ฟันเทียม
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FFF88C",
              }}
            ></label>
            <label
              className="me-3"
              style={{
                fontSize: 15,
              }}
            >
              ต้องเคลือบหลุมร่องฟัน
            </label>
          </div>
        )}
        <div style={{ marginLeft: -20, marginRight: -20 }} id="TeathTest">
          {renderTeeth()}
        </div>

        <div className="text-end mt-3">
          <Checkbox
            onChange={(e) => {
              if (e.target.checked) {
                let mappingStatusN = map(defaultStatus, (o) => {
                  let findUpperTeeth = find(upperTeeth, ["teeth", o.teeth]);
                  if (findUpperTeeth) {
                    return {
                      ...o,
                      teethStatus: "N",
                    };
                  } else {
                    return {
                      ...o,
                    };
                  }
                });
                setDefaultStatus(mappingStatusN);
                setFriend(!friend);
              }
              if (!e.target.checked) {
                let mappingStatusNull = map(defaultStatus, (o) => {
                  let findUpperTeeth = find(upperTeeth, ["teeth", o.teeth]);
                  if (findUpperTeeth) {
                    return {
                      ...o,
                      teethStatus: "",
                    };
                  } else {
                    return {
                      ...o,
                    };
                  }
                });
                setDefaultStatus(mappingStatusNull);
                setFriend(!friend);
              }
            }}
          >
            <label className="gx-text-primary fw-bold">เลือกฟันบนทั้งหมด</label>
          </Checkbox>
          <Checkbox
            onChange={(e) => {
              if (e.target.checked) {
                let mappingStatusN = map(defaultStatus, (o) => {
                  let findLowerTeeth = find(lowerTeeth, ["teeth", o.teeth]);
                  if (findLowerTeeth) {
                    return {
                      ...o,
                      teethStatus: "N",
                    };
                  } else {
                    return {
                      ...o,
                    };
                  }
                });
                setDefaultStatus(mappingStatusN);
                setFriend(!friend);
              }
              if (!e.target.checked) {
                let mappingStatusNull = map(defaultStatus, (o) => {
                  let findLowererTeeth = find(lowerTeeth, ["teeth", o.teeth]);
                  if (findLowererTeeth) {
                    return {
                      ...o,
                      teethStatus: "",
                    };
                  } else {
                    return {
                      ...o,
                    };
                  }
                });
                setDefaultStatus(mappingStatusNull);
                setFriend(!friend);
              }
            }}
          >
            <label className="gx-text-primary fw-bold ma-3">
              เลือกฟันล่างทั้งหมด
            </label>
          </Checkbox>
        </div>
      </Card>
    </div>
  );
}
const upperTeeth = [
  {
    teethStatus: "",
    teeth: "18",
  },
  {
    teethStatus: "",
    teeth: "17",
  },
  {
    teethStatus: "",
    teeth: "16",
  },
  {
    teethStatus: "",
    teeth: "15",
  },
  {
    teethStatus: "",
    teeth: "14",
  },
  {
    teethStatus: "",
    teeth: "13",
  },
  {
    teethStatus: "",
    teeth: "12",
  },
  {
    teethStatus: "",
    teeth: "11",
  },
  {
    teethStatus: "",
    teeth: "28",
  },
  {
    teethStatus: "",
    teeth: "27",
  },
  {
    teethStatus: "",
    teeth: "26",
  },
  {
    teethStatus: "",
    teeth: "25",
  },
  {
    teethStatus: "",
    teeth: "24",
  },
  {
    teethStatus: "",
    teeth: "23",
  },
  {
    teethStatus: "",
    teeth: "22",
  },
  {
    teethStatus: "",
    teeth: "21",
  },
];
const lowerTeeth = [
  {
    teethStatus: "",
    teeth: "48",
  },
  {
    teethStatus: "",
    teeth: "47",
  },
  {
    teethStatus: "",
    teeth: "46",
  },
  {
    teethStatus: "",
    teeth: "45",
  },
  {
    teethStatus: "",
    teeth: "44",
  },
  {
    teethStatus: "",
    teeth: "43",
  },
  {
    teethStatus: "",
    teeth: "42",
  },
  {
    teethStatus: "",
    teeth: "41",
  },
  {
    teethStatus: "",
    teeth: "38",
  },
  {
    teethStatus: "",
    teeth: "37",
  },
  {
    teethStatus: "",
    teeth: "36",
  },
  {
    teethStatus: "",
    teeth: "35",
  },
  {
    teethStatus: "",
    teeth: "34",
  },
  {
    teethStatus: "",
    teeth: "33",
  },
  {
    teethStatus: "",
    teeth: "32",
  },
  {
    teethStatus: "",
    teeth: "31",
  },
];
