import { env } from "../../env.js";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Modal, Button, Radio, Checkbox } from "antd";
import { useSelector } from "react-redux";
import {
  GetNoTeethFetch,
  GetSelectTeethFetch,
  GetTeethFetch,
} from "../../routes/OpdClinic/API/ScreeningApi";
import { GetPatientDentalCheckups } from "../../routes/Dental/API/TreatmentHistoryApi";
import { map } from "lodash";
export default function TeethStatus(props) {
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const defaultStatus = [
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "55",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "54",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "53",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "52",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "51",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "18",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "17",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "16",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "15",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "14",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "13",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "12",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "11",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "21",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "22",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "23",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "24",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "25",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "26",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "27",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "28",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "61",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "62",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "63",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "64",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "65",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "85",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "84",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "83",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "82",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "81",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "48",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "47",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "46",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "45",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "44",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "43",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "42",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "41",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "31",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "32",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "33",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "34",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "35",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "36",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "37",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "38",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "71",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "72",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "73",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "74",
    },
    {
      ptDenChkId: null,
      teethStatus: "",
      teeth: "75",
    },
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [, setIndexForSetStatus] = useState(null);
  const [radioStatus, setRadioStatus] = useState(null);
  const [statusList, setStatusList] = useState(defaultStatus);
  const { message } = useSelector(({ autoComplete }) => autoComplete);
  const [, setSelectTeeth] = useState([]);
  const [, setTeeth] = useState([]);
  const [, setNoTeeth] = useState([]);
  const [, setLoading] = useState(true);
  const [teethChoose] = useState("teeth");
  const DeciduousUpperL = ["55", "54", "53", "52", "51"]; //ฟันน้ำนมบนซ้าย
  const DeciduousUpperR = ["61", "62", "63", "64", "65"]; //ฟันน้ำนมบนขวา
  const DeciduousLowerL = ["85", "84", "83", "82", "81"]; //ฟันน้ำนมล่างซ้าย
  const DeciduousLowerR = ["71", "72", "73", "74", "75"]; //ฟันน้ำนมล่างขวา
  const Q1 = ["18", "17", "16", "15", "14", "13", "12", "11"]; //ฟันแท้บนซ้าย
  const Q2 = ["21", "22", "23", "24", "25", "26", "27", "28"]; //ฟันแท้บนขวา
  const Q3 = ["48", "47", "46", "45", "44", "43", "42", "41"]; //ฟันแท้ล่างซ้าย
  const Q4 = ["31", "32", "33", "34", "35", "36", "37", "38"]; //ฟันแท้ล่างซ้าย

  const GetSelectTeeth = async () => {
    const selectTeeth = await GetSelectTeethFetch();
    let addTeeth = [
      {
        datadisplay: "ซี่",
        dataother1: null,
        dataother2: null,
        dataother3: null,
        dataother4: null,
        dataother5: null,
        datavalue: "teeth",
      },
      ...selectTeeth,
    ];
    setSelectTeeth(addTeeth);
  };
  const GetTeeth = async () => {
    const teeth = await GetTeethFetch();
    setTeeth(teeth);
  };
  const GetNoTeeth = async () => {
    const noTeeth = await GetNoTeethFetch();
    console.log(noTeeth);
    setNoTeeth(noTeeth);
  };
  const [imgLoading] = useState(false);
  const checkStatusColor = (teeth) => {
    let findData = statusList.find((d) => d.teeth === teeth);
    if (!findData) return "";
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

  useEffect(() => {
    setLoading(true);
    GetSelectTeeth();
    GetTeeth();
    GetNoTeeth();
    // GetDiagSide();

    setLoading(false);
  }, []);
  useEffect(() => {
    if (message) {
      GetPatientDentalCheckups(message).then((data) => {
        // eslint-disable-next-line array-callback-return
        data.responseData.map((d) => {
          let replaceTeeth = data.responseData.find((s) => s.teeth === d.teeth);
          let teethIndex = defaultStatus.findIndex((s) => s.teeth === d.teeth);
          replaceTeeth.dirIsSelectB =
            d.side && d.side.includes("B") ? true : null;
          replaceTeeth.dirIsSelectM =
            d.side && d.side.includes("M") ? true : null;
          replaceTeeth.dirIsSelectL =
            d.side && d.side.includes("L") ? true : null;
          replaceTeeth.dirIsSelectD =
            d.side && d.side.includes("D") ? true : null;
          replaceTeeth.dirIsSelectO =
            d.side && d.side.includes("O") ? true : null;
          defaultStatus.splice(teethIndex, 1, replaceTeeth);
        });
        setStatusList(defaultStatus);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
  // eslint-disable-next-line no-unused-vars
  const genTeethNew = (datavalue, key, notteeth) => {
    // const chkTeethPosition = (teeth) => {
    //   const findQ1 = find(Q1, (o) => o === teeth);
    //   if (findQ1) return "topLeft";
    //   const findQ2 = find(Q2, (o) => o === teeth);
    //   if (findQ2) return "topRight";
    //   const findQ3 = find(Q3, (o) => o === teeth);
    //   if (findQ3) return "bottomLeft";
    //   const findQ4 = find(Q4, (o) => o === teeth);
    //   if (findQ4) return "bottomRight";
    //   const findDeciduousUpperL = find(DeciduousUpperL, (o) => o === teeth);
    //   if (findDeciduousUpperL) return "deciduousUpperL";
    //   const findDeciduousUpperR = find(DeciduousUpperR, (o) => o === teeth);
    //   if (findDeciduousUpperR) return "deciduousUpperR";
    //   const findDeciduousLowerL = find(DeciduousLowerL, (o) => o === teeth);
    //   if (findDeciduousLowerL) return "deciduousLowerL";
    //   const findDeciduousLowerR = find(DeciduousLowerR, (o) => o === teeth);
    //   if (findDeciduousLowerR) return "deciduousLowerR";
    // };
    // let seq = [];
    // const teethPosition = chkTeethPosition(datavalue);
    // switch (teethPosition) {
    //   case "topLeft":
    //     seq = ["BT", "DL", "MR", "O", "LB"];
    //     break;
    //   case "topRight":
    //     seq = ["BT", "ML", "DR", "O", "LB"];
    //     break;
    //   case "bottomLeft":
    //     seq = ["LT", "DL", "MR", "O", "BB"];
    //     break;
    //   case "bottomRight":
    //     seq = ["LT", "ML", "DR", "O", "BB"];
    //     break;
    //   case "deciduousUpperL":
    //     seq = ["BT", "DL", "MR", "O", "LB"];
    //     break;
    //   case "deciduousUpperR":
    //     seq = ["BT", "ML", "DR", "O", "LB"];
    //     break;
    //   case "deciduousLowerL":
    //     seq = ["LT", "DL", "MR", "O", "BB"];
    //     break;
    //   case "deciduousLowerR":
    //     seq = ["LT", "ML", "DR", "O", "BB"];
    //     break;
    //   default:
    //     break;
    // }

    return (
      <div style={{ padding: 3 }}>
        <div
          style={{
            backgroundColor: checkStatusColor(key),
            border: statusList.filter((val) => val.teeth === key)[0]?.status
              ? `3px solid #81c784`
              : "1px solid #ccc",
            padding: 3,
            borderRadius: 4,
          }}
        >
          {!imgLoading ? (
            <Row
              className="pointer"
              onClick={() => {
                if (teethChoose === "teeth" || teethChoose === "Other") {
                  // setStatus(key, "#81C784");
                  props.setSelectTeeth(key);
                }
              }}
            >
              <Col
                span={24}
                style={{
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
          ) : null}
        </div>
      </div>
    );
  };
  const renderTeeth = (set) => {
    const teethStyles = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      margin: "auto",
    };
    const mapping = (dts) => {
      return map(dts, (o) => {
        return <div key={o}>{genTeethNew(o, o)}</div>;
      });
    };
    switch (set) {
      case "Q1":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q1)}
          </div>
        );
      case "Q2":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q2)}
          </div>
        );
      case "Q3":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q3)}
          </div>
        );
      case "Q4":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q4)}
          </div>
        );
      case "Upper":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q1)}&nbsp;&nbsp;&nbsp;{mapping(Q2)}
          </div>
        );
      case "Lower":
        return (
          <div
            style={{
              ...teethStyles,
            }}
          >
            {mapping(Q3)}&nbsp;&nbsp;&nbsp;{mapping(Q4)}
          </div>
        );
      case "Full Mouth":
        return (
          <>
            <div
              style={{
                ...teethStyles,
              }}
            >
              {mapping(Q1)}&nbsp;&nbsp;&nbsp;{mapping(Q2)}
            </div>
            <div
              style={{
                ...teethStyles,
              }}
            >
              {mapping(Q3)}&nbsp;&nbsp;&nbsp;{mapping(Q4)}
            </div>
          </>
        );
      case "Deciduous Tooth":
        return (
          <>
            <div
              style={{
                ...teethStyles,
              }}
            >
              {mapping(DeciduousUpperL)}&nbsp;&nbsp;&nbsp;
              {mapping(DeciduousUpperR)}
            </div>
            <div
              style={{
                ...teethStyles,
              }}
            >
              {mapping(DeciduousLowerL)}&nbsp;&nbsp;&nbsp;
              {mapping(DeciduousLowerR)}
            </div>
          </>
        );
      case "teeth":
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
                    {mapping(DeciduousUpperL)}&nbsp;&nbsp;
                    {mapping(DeciduousUpperR)}
                  </div>
                  <div style={{ ...teethStyles }}>
                    {mapping(DeciduousLowerL)}&nbsp;&nbsp;
                    {mapping(DeciduousLowerR)}
                  </div>
                </Col>
              </Row>
            )}
            {hosParam?.dentalTemplates === "2" && (
              <Row gutter={[4, 4]}>
                <Col span={24} className="text-center">
                  <div style={{ ...teethStyles }}>
                    {mapping(DeciduousUpperL)}&nbsp;&nbsp;
                    {mapping(DeciduousUpperR)}
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
                    {mapping(DeciduousLowerL)}&nbsp;&nbsp;
                    {mapping(DeciduousLowerR)}
                  </div>
                </Col>
              </Row>
            )}
          </>
        );
      default:
        break;
    }
  };

  return (
    <>
      <Card bordered={false}>
        <div className="mb-3 text-end">
          <label className="circleDiv me-1">
            <Checkbox
              checked={props.checkBoxShowAll}
              onChange={(e) => {
                props.setCheckBoxShowAll(e.target.checked);
              }}
            ></Checkbox>
          </label>
          <label
            className="me-3"
            style={{
              fontSize: 15,
            }}
          >
            ดูทั้งหมด
          </label>
          <label
            className="circleDiv me-1"
            style={{
              width: "15px",
              height: "15px",
              backgroundColor: "#DCEDC8",
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
              backgroundColor: "#BBDEFB",
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
              backgroundColor: "#B0BEC5",
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
              backgroundColor: "#F8BBD0",
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
              backgroundColor: "#EF9A9A",
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
              backgroundColor: "#E1BEE7",
            }}
          ></label>
          <label
            className="me-3"
            style={{
              fontSize: 15,
            }}
          >
            รักษารากฟัน
          </label>
          <label
            className="circleDiv me-1"
            style={{
              width: "15px",
              height: "15px",
              backgroundColor: "#E1F5FE",
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
              backgroundColor: "#FFE0B2",
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
        {renderTeeth(teethChoose)}
      </Card>

      <Modal
        centered
        title={<label className="topic-green-bold">เลือกสถานะ</label>}
        visible={modalVisible}
        onOk={() => {
          setModalVisible(false);
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
        width={260}
        footer={[
          <Row justify="center" key="footer">
            <Button
              key="cancel"
              onClick={() => {
                setModalVisible(false);
                setIndexForSetStatus(null);
                setRadioStatus(null);
              }}
            >
              ปิด
            </Button>
            <Button
              type="primary"
              onClick={() => {
                // setStatus(indexForSetStatus, radioStatus);
                // console.log("Z : ", indexForSetStatus, radioStatus);
              }}
            >
              ตกลง
            </Button>
          </Row>,
        ]}
      >
        <Radio.Group
          onChange={(e) => {
            setRadioStatus(e.target.value);
          }}
          value={radioStatus}
        >
          <Row gutter={[4, 4]}>
            <Col span={12}>
              <Radio value="#81C784">
                <label
                  style={{
                    color: "#81C784",
                  }}
                >
                  ฟันที่เลือก
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="#42A5F5">
                <label
                  style={{
                    color: "#42A5F5",
                  }}
                >
                  ต้องอุด
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="#B0BEC5">
                <label
                  style={{
                    color: "#B0BEC5",
                  }}
                >
                  อุดแล้ว
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="#F06292">
                <label
                  style={{
                    color: "#F06292",
                  }}
                >
                  ต้องถอน
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="#E57373">
                <label
                  style={{
                    color: "#E57373",
                  }}
                >
                  ถอนแล้ว
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="#FFB74D">
                <label
                  style={{
                    color: "#FFB74D",
                  }}
                >
                  ฟันเทียม
                </label>
              </Radio>
            </Col>
            <Col span={12}>
              <Radio value="white">
                <label>ไม่เลือก</label>
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Modal>
    </>
  );
}
