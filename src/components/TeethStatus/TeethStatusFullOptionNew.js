import { env } from "../../env.js";

// import { CaretRightOutlined } from '@ant-design/icons';
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  // Image,
  // Collapse,
  // Layout,
  Row,
  Col,
  Divider,
  Modal,
  Button,
  Radio,
  Select,
  Card,
} from "antd";

// import { useSelector } from "react-redux";

import "./css/teeth.css";
import { SearchOutlined } from "@ant-design/icons";
import {
  // GetDiagSideFetch,
  GetNoTeethFetch,
  GetSelectTeethFetch,
  GetTeethFetch,
} from "../../routes/OpdClinic/API/ScreeningApi";
import { GetPatientDentalCheckups } from "../../routes/Dental/API/CheckUpScreeningApi";
import { useSelector } from "react-redux";

// const { Content } = Layout;
// const { Panel } = Collapse;

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
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "92",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "BU",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "DT",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "EO",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "HP",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "LE",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "LL",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "LT",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "RE",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "SP",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "UL",
  },
  {
    ptDenChkId: null,
    teethStatus: "",
    teeth: "VT",
  },
];
const { Option } = Select;
export default forwardRef(function TeethStatusFullOption(props, ref) {
  const { opdPatientDetail } = useSelector(
    ({ opdPatientDetail }) => opdPatientDetail
  );
  useImperativeHandle(ref, () => ({
    getTooth: () => statusList,
  }));
  const [modalVisible, setModalVisible] = useState(false);
  const [, setIndexForSetStatus] = useState(null);
  const [radioStatus, setRadioStatus] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [selectTeeth, setSelectTeeth] = useState([]);
  const [teeth, setTeeth] = useState([]);
  const [noTeeth, setNoTeeth] = useState([]);
  const [, setLoading] = useState(true);
  const [teethChoose, setTeethChoose] = useState("teeth");
  useEffect(() => {
    if (props?.patientId) return;
    if (!props?.toothDiagnosis?.length) {
      props.setToothDiagnosis(defaultStatus);
      setStatusList(defaultStatus);
    } else {
      if (props?.toothData?.onRow) {
        setStatusList((p) => {
          return p.map((i) => {
            let status = false;
            if (i.teeth === props?.toothData?.teeth) status = true;
            return {
              ...i,
              status: status,
            };
          });
        });
      } else {
        setStatusList(props.toothDiagnosis);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.toothDiagnosis, props.toothData]);
  useEffect(() => {
    if (props?.toothData?.onRow) {
      setStatusList((p) => {
        return p.map((i) => {
          let status = false;
          if (i.teeth === props?.toothData?.teeth) status = true;
          return {
            ...i,
            status: status,
          };
        });
      });
    }
    if (!props?.toothData?.onRow) {
      if (props?.toothData) {
        let selectTeethData = statusList.find(
          (s) => s.teeth === props.toothData.teeth
        );
        let selectTeethIndex = statusList.findIndex(
          (s) => s.teeth === props.toothData.teeth
        );
        if (selectTeethData) {
          selectTeethData.dentalId = props?.toothData?.dentalId;
          selectTeethData.dirIsSelectB = props?.toothData?.diagSide?.includes(
            "B"
          )
            ? true
            : null;
          selectTeethData.dirIsSelectM = props?.toothData?.diagSide?.includes(
            "M"
          )
            ? true
            : null;
          selectTeethData.dirIsSelectL = props?.toothData?.diagSide?.includes(
            "L"
          )
            ? true
            : null;
          selectTeethData.dirIsSelectD = props?.toothData?.diagSide?.includes(
            "D"
          )
            ? true
            : null;
          selectTeethData.dirIsSelectO = props?.toothData?.diagSide?.includes(
            "O"
          )
            ? true
            : null;
          selectTeethData.status = props?.toothData?.status
            ? props?.toothData?.status
            : true;
          selectTeethData.diagSide = props?.toothData?.diagSide;
          statusList.splice(selectTeethIndex, 1, selectTeethData);
          setStatusList(statusList);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.toothData]);
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
    // console.log("TESTTTTTTT");
    // console.log(teeth);
    setTeeth(teeth);
  };
  const GetNoTeeth = async () => {
    const noTeeth = await GetNoTeethFetch();
    // console.log("TESTTTTTTT11111");
    // console.log(noTeeth);
    setNoTeeth(noTeeth);
  };
  const setStatus = (index, status, type) => {
    // prevStatus[index].bg = status;
    let find = statusList.find((item) => item.teeth === index);
    // console.log("find : ", find, index, status);

    let prevStatus = statusList.map((val) =>
      val.teeth === index
        ? {
          ...val,
          status: val?.status === undefined ? true : !val.status,
          teeth: val.teeth,
        }
        : val
    );

    // console.log(prevStatus.sort((a, b) => a.teeth - b.teeth));

    props.handleSelectTeeth(index, find?.status ? "remove" : "add", prevStatus);
    // eslint-disable-next-line no-empty
    if (type) {
    } else {
      // console.log('prevStatus :>> ', prevStatus);
      setStatusList(prevStatus);
    }

    // console.log("คลิกตัวฟัน", prevStatus);

    // props.setToothDiagnosis(prevStatus)
  };

  const [imgLoading] = useState(false);
  const setToothPosterior = (index, dirId, dirIsSelect) => {
    setLoading(true);

    // console.log(index);

    // let findData = statusList.find((s) => s.teeth === index)
    // let findDataIndex = statusList.findIndex((s) => s.teeth === index)

    // findData.diagSide = findData.diagSide ? findData.diagSide.includes(dirId) ? findData.diagSide.replace(`${dirId},`, '') : findData.diagSide.concat("", `${dirId},`) : `${dirId},`
    // findData.status = true
    // findData.dirId = dirId
    // findData.dirIsSelectB = dirId === "B" ? (findData.dirIsSelectB ? !dirIsSelect : true) : findData.dirIsSelectB || null
    // findData.dirIsSelectM = dirId === "M" ? (findData.dirIsSelectM ? !dirIsSelect : true) : findData.dirIsSelectM || null
    // findData.dirIsSelectL = dirId === "L" ? (findData.dirIsSelectL ? !dirIsSelect : true) : findData.dirIsSelectL || null
    // findData.dirIsSelectD = dirId === "D" ? (findData.dirIsSelectD ? !dirIsSelect : true) : findData.dirIsSelectD || null
    // findData.dirIsSelectO = dirId === "O" ? (findData.dirIsSelectO ? !dirIsSelect : true) : findData.dirIsSelectO || null
    // findData.teeth = index

    // statusList.splice(findDataIndex, 1, findData)
    let prevStatus = statusList.map((val) => {
      // console.log(val.teeth === index);
      return val.teeth === index
        ? {
          ...val,
          diagSide: val.diagSide
            ? val.diagSide.includes(dirId)
              ? val.diagSide.replace(`${dirId},`, "")
              : val.diagSide.concat("", `${dirId},`)
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
        : val;
    });
    // console.log('prevStatus :>> ', prevStatus);
    setStatusList(prevStatus);
    setLoading(false);
    // console.log(ref);
    // console.log("setToothPosterior : ", index, dirId, dirIsSelect);
    // console.log("คลิกด้านขอองฟัน", prevStatus);
    // props.setToothDiagnosis(prevStatus)
  };

  const genImage = (key, dirId, style, width, height, className) => {
    let filterStatusList = statusList.filter((val) => val.teeth === key)[0];
    let dirName = "";
    let dirNameIsClick = false;

    // console.log("สร้างซี่",dirId,filterStatusList);

    let isB_Click = false;
    let isM_Click = false;
    let isL_Click = false;
    let isD_Click = false;
    let isO_Click = false;
    //ถ้ามีตรงที่คลิกล่าสุด
    if (filterStatusList?.diagSide) {
      if (filterStatusList.diagSide.includes("B") && dirId === "B") {
        dirName = "buccal_B_hover";
        dirNameIsClick = true;
        isB_Click = true;
      } else if (filterStatusList.diagSide.includes("M") && dirId === "M") {
        dirName = "mesial_M_hover";
        dirNameIsClick = true;
        isM_Click = true;
      } else if (filterStatusList.diagSide.includes("L") && dirId === "L") {
        dirName = "lingual_L_hover";
        dirNameIsClick = true;
        isL_Click = true;
      } else if (filterStatusList.diagSide.includes("D") && dirId === "D") {
        dirName = "distal_D_hover";
        dirNameIsClick = true;
        isD_Click = true;
        //ถ้าคลิกล่าสุดเป็น O
      } else if (filterStatusList.diagSide.includes("O") && dirId === "O") {
        dirName = "occlusal_O_hover";
        dirNameIsClick = true;
        isO_Click = true;
      }
      // else {
      if (dirId === "B") {
        if (filterStatusList.dirIsSelectB || isB_Click) {
          dirName = "buccal_B_hover";
          dirNameIsClick = true;
        } else {
          dirName = "buccal_B";
          dirNameIsClick = false;
        }
      } else if (dirId === "M") {
        if (filterStatusList.dirIsSelectM || isM_Click) {
          dirName = "mesial_M_hover";
          dirNameIsClick = true;
        } else {
          dirName = "mesial_M";
          dirNameIsClick = false;
        }
      } else if (dirId === "L") {
        if (filterStatusList.dirIsSelectL || isL_Click) {
          dirName = "lingual_L_hover";
          dirNameIsClick = true;
        } else {
          dirName = "lingual_L";
          dirNameIsClick = false;
        }
      } else if (dirId === "D") {
        if (filterStatusList.dirIsSelectD || isD_Click) {
          dirName = "distal_D_hover";
          dirNameIsClick = true;
        } else {
          dirName = "distal_D";
          dirNameIsClick = false;
        }
      } else if (dirId === "O") {
        if (filterStatusList.dirIsSelectO || isO_Click) {
          dirName = "occlusal_O_hover";
          dirNameIsClick = true;
        } else {
          dirName = "occlusal_O";
          dirNameIsClick = false;
        }
      }
    }
    // }
    else {
      //โหลดมาครั้งแรก
      if (dirId === "B") {
        dirName = "buccal_B";
        dirNameIsClick = true;
      } else if (dirId === "M") {
        dirName = "mesial_M";
        dirNameIsClick = true;
      } else if (dirId === "L") {
        dirName = "lingual_L";
        dirNameIsClick = true;
      } else if (dirId === "D") {
        dirName = "distal_D";
        dirNameIsClick = true;
      } else if (dirId === "O") {
        dirName = "occlusal_O";
        dirNameIsClick = true;
      }
    }
    return (
      <>
        <img
          alt=""
          width={width}
          height={height}
          style={style}
          className={className}
          onMouseOver={(e) =>
          (e.currentTarget.src = `${env.PUBLIC_URL}/assets/images/teeth/${dirName.split("_")[0] + "_" + dirName.split("_")[1]
            }_hover.png`)
          }
          onMouseOut={(e) =>
            (e.currentTarget.src = `${env.PUBLIC_URL}/assets/images/teeth/${dirName}.png`)
          }
          src={`${env.PUBLIC_URL}/assets/images/teeth/${dirName}.png`}
          onClick={(e) => {
            e.stopPropagation();
            setToothPosterior(key, dirId, dirNameIsClick);
          }}
        />
        <br />
      </>
    );
  };
  const checkStatusColor = (teeth) => {
    let findData = statusList.find((d) => d.teeth === teeth);
    if (!findData) return "";

    // if (findData.teethStatus === "N") {
    //   return "#DCEDC8";
    // } else if (findData.teethStatus === "C") {
    //   return "#BBDEFB";
    // } else if (findData.teethStatus === "F") {
    //   return "#E0E0E0";
    // } else if (findData.teethStatus === "E") {
    //   return "#F8BBD0";
    // } else if (findData.teethStatus === "1") {
    //   return "#EF9A9A";
    // } else if (findData.teethStatus === "2") {
    //   return "#E1BEE7";
    // } else if (findData.teethStatus === "3") {
    //   return "#E1F5FE";
    // } else if (findData.teethStatus === "4") {
    //   return "#77FDFD";
    // } else {
    //   return "";
    // }

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
    } else {
      return "";
    }
  };
  const genTeeth = (datavalue, key, notteeth) => {
    // console.log(statusList);

    // console.log(key);
    // console.log(notteeth);
    // console.log(datavalue);
    // console.log(statusList);
    return (
      <div
        style={{
          padding: 3,
        }}
      >
        <div
          style={{
            backgroundColor: checkStatusColor(key),
            border: statusList.filter((val) => val.teeth === key)[0]?.status
              ? `3px solid #81c784`
              : "1px solid #ccc",
            padding: 3,
          }}
        >
          {!imgLoading ? (
            <Row
              className="pointer"
              onClick={() => {
                setStatus(key, "#81C784");
              }}
            >
              <Col
                hidden={notteeth}
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
                <center>
                  {genImage(key, "D", {}, 24, 12, "dStyle")}
                  {genImage(
                    key,
                    "B",
                    {
                      marginLeft: -22,
                      marginTop: -14,
                    },
                    12,
                    24,
                    "bStyle"
                  )}
                  {genImage(
                    key,
                    "L",
                    {
                      marginRight: -22,
                      marginTop: -50,
                    },
                    12,
                    24,
                    "lStyle"
                  )}
                  {genImage(
                    key,
                    "O",
                    {
                      marginTop: -86,
                    },
                    16,
                    16,
                    "oStyle"
                  )}
                  {genImage(
                    key,
                    "M",
                    {
                      marginTop: -101,
                    },
                    24,
                    12,
                    "mStyle"
                  )}
                </center>
              </Col>

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
  const handleSelectTeethFromDropDown = (val) => {
    console.log(val);
    let Upper = [
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "51",
      "52",
      "53",
      "54",
      "55",
      "61",
      "62",
      "63",
      "64",
      "65",
    ];
    let Lower = [
      "85",
      "84",
      "83",
      "82",
      "81",
      "48",
      "47",
      "46",
      "45",
      "44",
      "43",
      "42",
      "41",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "71",
      "72",
      "73",
      "74",
      "75",
    ];
    let Q1 = ["11", "12", "13", "14", "15", "16", "17", "18"];
    let Q2 = ["21", "22", "23", "24", "25", "26", "27", "28"];
    let Q3 = ["41", "42", "43", "44", "45", "46", "47", "48"];
    let Q4 = ["31", "32", "33", "34", "35", "36", "37", "38"];
    switch (val) {
      case "00":
        return [...Upper, ...Lower];
      case "01":
        return Upper;
      case "02":
        return Lower;
      case "Q1":
        return Q1;
      case "Q2":
        return Q2;
      case "Q3":
        return Q3;
      case "Q4":
        return Q4;
      default:
        return [val];
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
    if (props.patientId || opdPatientDetail) {
      GetPatientDentalCheckups(
        props.patientId || opdPatientDetail?.patientId
      ).then((data) => {
        let defaultTeeth = [...defaultStatus];
        // eslint-disable-next-line array-callback-return
        data.map((d,) => {
          let replaceTeeth = data.find((s) => s.teeth === d.teeth);
          let teethIndex = defaultStatus.findIndex((s) => s.teeth === d.teeth);
          replaceTeeth.diagSide = "";
          defaultTeeth.splice(teethIndex, 1, replaceTeeth);
        });
        // console.log('defaultTeeth :>> ', defaultTeeth);
        setStatusList(defaultTeeth);
      });
    }
  }, [props.patientId, opdPatientDetail]);
  const renderUperTeeth = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          margin: "auto",
        }}
      >
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "18" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "18")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "17" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "17")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "16" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "16")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "15" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "15")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "14" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "14")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "13" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "13")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "12" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "12")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "11" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q1" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "11")
                : []}
            </>
          );
        })}
        &nbsp;&nbsp;&nbsp;
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "21" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "21")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "22" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "22")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "23" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "23")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "24" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "24")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "25" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "25")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "26" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "26")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "27" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "27")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "28" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Upper" ||
                  teethChoose === "Q2" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "28")
                : []}
            </>
          );
        })}
      </div>
    );
  };
  const renderLowerTeeth = () => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          margin: "auto",
        }}
      >
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "48" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "48")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "47" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "47")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "46" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "46")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "45" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "45")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "44" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "44")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "43" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "43")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "42" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "42")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "41" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q3" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "41")
                : []}
            </>
          );
        })}
        &nbsp;&nbsp;&nbsp;
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "31" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "31")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "32" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "32")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "33" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "33")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "34" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "34")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "35" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "35")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "36" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "36")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "37" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "37")
                : []}
            </>
          );
        })}
        {teeth.map((val) => {
          return (
            <>
              {val.datavalue === "38" &&
                (teethChoose === "Full Mouth" ||
                  teethChoose === "Lower" ||
                  teethChoose === "Q4" ||
                  teethChoose === "teeth")
                ? genTeeth(val.datavalue, "38")
                : []}
            </>
          );
        })}
      </div>
    );
  };
  const renderMilkTeeth = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: "auto",
          }}
        >
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "55" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "55")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "54" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "54")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "53" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "53")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "52" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "52")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "51" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "51")
                  : []}
              </>
            );
          })}
          &nbsp;&nbsp;&nbsp;
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "61" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "61")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "62" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "62")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "63" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "63")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "64" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "64")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "65" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "65")
                  : []}
              </>
            );
          })}
        </div>
        <Divider />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: "auto",
          }}
        >
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "85" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "85")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "84" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "84")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "83" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "83")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "82" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "82")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "81" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "81")
                  : []}
              </>
            );
          })}
          &nbsp;&nbsp;&nbsp;
          {/* <Divider type="vertical" /> */}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "71" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "71")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "72" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "72")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "73" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "73")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "74" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "74")
                  : []}
              </>
            );
          })}
          {teeth.map((val) => {
            return (
              <>
                {val.datavalue === "75" &&
                  (teethChoose === "Full Mouth" ||
                    teethChoose === "Upper" ||
                    teethChoose === "teeth")
                  ? genTeeth(val.datavalue, "75")
                  : []}
              </>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      <Card
        title={
          <Row gutter={[4, 4]} align="middle">
            <Col>
              <label className="gx-text-primary fw-bold fs-6">
                รายการซี่ฟัน
              </label>
            </Col>

            <Col>
              <Select
                id="select-teeth"
                mode="multiple"
                allowClear
                disabled={teethChoose !== "teeth"}
                maxTagCount={"responsive"}
                style={{
                  width: 145,
                }}
                placeholder={"ค้นหารหัสซี่ฟัน"}
                showSearch
                optionFilterProp="children"
                defaultActiveFirstOption={false}
                dropdownMatchSelectWidth={400}
                suffixIcon={
                  <span>
                    <SearchOutlined
                      style={{
                        fontSize: "16px",
                        color: "#00C853",
                      }}
                    />
                  </span>
                }
                onClear={() => {
                  let prevStatus = statusList.map((val) => {
                    return {
                      ...val,
                      status: false,
                    };
                  });
                  // console.log('prevStatus :>> ', prevStatus);
                  setStatusList(prevStatus);
                }}
                onSelect={async (e) => {
                  // console.log(e);
                  props.setSelectToothDropdown(e);
                  let list = await handleSelectTeethFromDropDown(e);
                  // console.log(list);
                  // eslint-disable-next-line array-callback-return
                  list.map((val) => {
                    setStatus(val + "", "#81C784", true);
                  });
                  let prevStatus = statusList.map((val) =>
                    list.includes(val.teeth)
                      ? {
                        ...val,
                        teethStatus: val.teethStatus,
                        status: true,
                        teeth: val.teeth,
                      }
                      : val
                  );
                  // console.log(prevStatus);
                  // console.log('prevStatus :>> ', prevStatus);
                  setStatusList(prevStatus);
                  // document.getElementById("select-teeth").blur();
                  // setStatus(key, "#81C784");
                  // setIndexForSetStatus(e);
                  // setModalVisible(true);
                }}
              >
                {teeth.map((val, index) => (
                  <Option
                    hidden={
                      val.datavalue === "00" ||
                      val.datavalue === "01" ||
                      val.datavalue === "02" ||
                      val.datavalue === "Q1" ||
                      val.datavalue === "Q2" ||
                      val.datavalue === "Q3" ||
                      val.datavalue === "Q4" ||
                      val.datavalue === "H01"
                    }
                    value={val.datavalue}
                    key={index}
                    other={val}
                  >
                    {val.datavalue} - {val.datadisplay}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col>
              <Radio.Group
                defaultValue={"teeth"}
                name="radiogroup"
                // style={{ marginTop: 8 }}
                onChange={async (e) => {
                  setTeethChoose(e.target.value);
                  props.setSelectToothDropdown(
                    e.target.value === "Full Mouth"
                      ? "00"
                      : e.target.value === "Upper"
                        ? "01"
                        : e.target.value === "Lower"
                          ? "02"
                          : e.target.value
                  );

                  // console.log(e.target.value);

                  let list = await handleSelectTeethFromDropDown(
                    e.target.value === "Full Mouth"
                      ? "00"
                      : e.target.value === "Upper"
                        ? "01"
                        : e.target.value === "Lower"
                          ? "02"
                          : e.target.value
                  );
                  // console.log(list);

                  // eslint-disable-next-line array-callback-return
                  list.map((val) => {
                    setStatus(val + "", "#81C784", true);
                  });
                  let prevStatus = statusList.map((val) =>
                    list.includes(val.teeth)
                      ? {
                        ...val,
                        teethStatus: val.teethStatus,
                        status: true,
                        teeth: val.teeth,
                      }
                      : {
                        ...val,
                        teethStatus: val.teethStatus,
                        status: false,
                        teeth: val.teeth,
                      }
                  );
                  // console.log('prevStatus :>> ', prevStatus);
                  setStatusList(prevStatus);

                  // console.log(e);
                }}
              >
                {selectTeeth.map((val, index) => {
                  return (
                    <Radio
                      key={index}
                      hidden={val.datavalue === "Other" ? true : false}
                      value={val.datavalue}
                    >
                      {val.datadisplay}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Col>

            <Col>
              <Select
                placeholder={"รายการอื่นๆที่ไม่ใช่ฟัน"}
                showSearch
                disabled={teethChoose === "Other" ? false : true}
                style={{
                  width: 145,
                }}
                allowClear={true}
                optionFilterProp="children"
                dropdownMatchSelectWidth={300}
              >
                {noTeeth.map((val, index) => (
                  <Option value={val.datavalue} key={index}>
                    {val.datadisplay}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        }
      >
        <div
          style={{
            margin: -20,
          }}
        >
          <div className="mb-2 mt-1 text-end">
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#D4FDA2",
              }}
            />
            <label className="me-3">ฟันที่เลือก</label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#80C6FE",
              }}
            />
            <label className="me-3">ต้องอุด</label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#D6D6D6",
              }}
            ></label>
            <label className="me-3">อุดแล้ว</label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FFAAC6",
              }}
            ></label>
            <label className="me-3">ต้องถอน</label>
            <label
              className="circleDiv me-1"
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: "#FF8181",
              }}
            ></label>
            <label className="me-3">ถอนแล้ว</label>
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
              รักษารากฟัน
            </label>
            <label
              className="circleDiv me-1"
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#77FDFD",
              }}
            ></label>
            <label className="me-3">ฟันเทียม</label>
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

          <Row gutter={[24, 8]}>
            <Col span={24} xxl={15} xl={15}>
              <Card hidden={teethChoose === "Other"}>
                <div
                  style={{
                    margin: -20,
                  }}
                >
                  {renderUperTeeth()}
                  {teethChoose === "Full Mouth" || teethChoose === "teeth" ? (
                    <Divider />
                  ) : null}
                  {renderLowerTeeth()}
                </div>
              </Card>
            </Col>
            <Col span={24} xxl={9} xl={9}>
              <Card
                hidden={
                  teethChoose === "Full Mouth" || teethChoose === "teeth"
                    ? false
                    : true
                }
              >
                <div
                  style={{
                    margin: -20,
                  }}
                >
                  {renderMilkTeeth()}
                </div>
              </Card>
            </Col>
          </Row>
          {teethChoose === "Other" ||
            teethChoose === "Q1" ||
            teethChoose === "Q2" ||
            teethChoose === "Q3" ||
            teethChoose === "Q4" ? (
            <Divider />
          ) : (
            []
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "92" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "92", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "BU" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "BU", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "DT" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "DT", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "EO" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "EO", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "HP" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "HP", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "LE" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "LE", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "LL" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "LL", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "LT" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "LT", true)
                    : []}
                </>
              );
            })}
            {/* {teeth.map(val => { return (<>{val.datavalue === "Q1" && (teethChoose === "" || teethChoose === "Q1") ? genTeeth(val.datavalue, "Q1") : []}</>) })}
                              {teeth.map(val => { return (<>{val.datavalue === "Q2" && (teethChoose === "" || teethChoose === "Q2") ? genTeeth(val.datavalue, "Q2") : []}</>) })}
                              {teeth.map(val => { return (<>{val.datavalue === "Q3" && (teethChoose === "" || teethChoose === "Q3") ? genTeeth(val.datavalue, "Q3") : []}</>) })}
                              {teeth.map(val => { return (<>{val.datavalue === "Q4" && (teethChoose === "" || teethChoose === "Q4") ? genTeeth(val.datavalue, "Q4") : []}</>) })} */}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "RE" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "RE", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "SP" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "SP", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "UL" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "UL", true)
                    : []}
                </>
              );
            })}
            {noTeeth.map((val) => {
              return (
                <>
                  {val.datavalue === "VT" &&
                    (teethChoose === "" || teethChoose === "Other")
                    ? genTeeth(val.datavalue, "VT", true)
                    : []}
                </>
              );
            })}
          </div>
        </div>
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
              <Radio value="#77FDFD">
                <label
                  style={{
                    color: "#77FDFD",
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
});
