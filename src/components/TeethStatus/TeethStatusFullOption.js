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
  // Card,
  Collapse,
  Input,
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
import { map, find } from "lodash";
import { GetPatientDentalCheckups } from "../../routes/Dental/API/CheckUpScreeningApi";
import { useSelector } from "react-redux";

// const { Content } = Layout;
const { Panel } = Collapse;

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
  useImperativeHandle(ref, () => ({
    getTooth: () => statusList,
  }));
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const [modalVisible, setModalVisible] = useState(false);
  const [, setIndexForSetStatus] = useState(null);
  const [radioStatus, setRadioStatus] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const { opdPatientDetail } = useSelector(
    ({ opdPatientDetail }) => opdPatientDetail
  );
  const [selectTeeth, setSelectTeeth] = useState([]);
  const [teeth, setTeeth] = useState([]);
  const [noTeeth, setNoTeeth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teethChoose, setTeethChoose] = useState("teeth");
  const DeciduousUpperL = ["55", "54", "53", "52", "51"]; //ฟันน้ำนมบนซ้าย
  const DeciduousUpperR = ["61", "62", "63", "64", "65"]; //ฟันน้ำนมบนขวา
  const DeciduousLowerL = ["85", "84", "83", "82", "81"]; //ฟันน้ำนมล่างซ้าย
  const DeciduousLowerR = ["71", "72", "73", "74", "75"]; //ฟันน้ำนมล่างขวา
  const Q1 = ["18", "17", "16", "15", "14", "13", "12", "11"]; //ฟันแท้บนซ้าย
  const Q2 = ["21", "22", "23", "24", "25", "26", "27", "28"]; //ฟันแท้บนขวา
  const Q3 = ["48", "47", "46", "45", "44", "43", "42", "41"]; //ฟันแท้ล่างซ้าย
  const Q4 = ["31", "32", "33", "34", "35", "36", "37", "38"]; //ฟันแท้ล่างซ้าย
  console.log('props', props)
  useEffect(() => {
    if (props?.patientId) return;
    if (!props?.toothDiagnosis?.length) {
      // console.log('defaultStatus :>> ', defaultStatus);
      props.setToothDiagnosis(defaultStatus);
      setStatusList(defaultStatus);
    } else {
      // console.log('props.toothDiagnosis :>> ', props.toothDiagnosis);
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

    if (addTeeth.length) {
      addTeeth = addTeeth.map((v) => {
        if (v.datavalue === "Full") v.datavalue = "Full Mouth"

        return v
      })
    }

    setSelectTeeth(addTeeth);
  };
  const GetTeeth = async () => {
    const teeth = await GetTeethFetch();
    setTeeth(teeth);
  };
  const GetNoTeeth = async () => {
    const noTeeth = await GetNoTeethFetch();
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
    let prevStatus = statusList.map((val) => {
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
    setStatusList(prevStatus);
  };
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
      if (filterStatusList?.diagSide) {
        if (filterStatusList.diagSide.includes(dirId)) {
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
                  setStatus(key, "#81C784");
                }
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
                {genTeethSide()}
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
    switch (val) {
      case "00":
        return [...Q1, ...Q2, ...Q3, ...Q4];
      case "03":
        return [
          ...DeciduousUpperL,
          ...DeciduousUpperR,
          ...DeciduousLowerL,
          ...DeciduousLowerR,
        ];
      case "01":
        return [...Q1, ...Q2];
      case "02":
        return [...Q3, ...Q4];
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
  const settingZoomDentalTemplates = (teethChoose) => {
    if (hosParam?.dentalTemplates !== "1") return ""
    switch (teethChoose) {
      case "teeth":
        return "40%";
      case "Full Mouth":
        return "50%";
      case "Deciduous Tooth":
        return "75%";
      case "Upper":
        return "75%";
      case "Lower":
        return "75%";
      default:
        return "";
    }
  }
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
          // replaceTeeth.diagSide = replaceTeeth?.side || "";

          defaultTeeth.splice(teethIndex, 1, replaceTeeth);
        });
        console.log('defaultTeeth :>> ', defaultTeeth);
        // setStatusList(defaultTeeth);
      });
    }
  }, [props.patientId, opdPatientDetail]);

  useEffect(() => {
    if (props.isresetSelectTeeth === true) {
      setStatusList(statusList.map((v) => ({
        ...v,
        status: undefined,
      })));
      props.setIsresetSelectTeeth(false)
    }

  }, [props.isresetSelectTeeth])

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
        return <div key={o}>{genTeeth(o, o)}</div>;
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
  const [teethAndSideValues, setTeethAndSideValues] = useState(null)
  const handleChangeTeethAndSide = (v) => setTeethAndSideValues(v)
  const setToothPosteriorr = (index, dirId, dirIsSelect) => {
    console.log('ซี่ฟัน', index)
    console.log('ด้าน', dirId)
    let prevStatus = statusList.map((val) => {
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
    setStatusList(prevStatus);
  };

  const handlePressEnter = (v) => {
    if (!v) return setTeethAndSideValues(null)
    const tempValues = v.toUpperCase()
    const tooth = tempValues.slice(0, 2)
    let prevStatus = statusList.map((o) => {
      let status = o.status
      let diagSide = o.diagSide
      let dirIsSelectB = o.dirIsSelectB
      let dirIsSelectM = o.dirIsSelectM
      let dirIsSelectL = o.dirIsSelectL
      let dirIsSelectD = o.dirIsSelectD
      let dirIsSelectO = o.dirIsSelectO
      if (o.teeth === tooth) {
        diagSide = ""
        const toothSide = ["B", "M", "L", "D", "O"]
        status = true
        dirIsSelectB = tempValues.includes("B")
        dirIsSelectM = tempValues.includes("M")
        dirIsSelectL = tempValues.includes("L")
        dirIsSelectD = tempValues.includes("D")
        dirIsSelectO = tempValues.includes("O")
        map(toothSide, o => {
          if (tempValues.includes(o)) diagSide = diagSide.concat("", `${o},`)
        })
      }
      return {
        ...o,
        status: status,
        dirIsSelectB: dirIsSelectB,
        dirIsSelectM: dirIsSelectM,
        dirIsSelectL: dirIsSelectL,
        dirIsSelectD: dirIsSelectD,
        dirIsSelectO: dirIsSelectO,
        diagSide: diagSide,
      }
    });
    setStatusList(prevStatus);
    setTeethAndSideValues(null)
  }
  return (
    <>
      {!loading ? (
        <div>
          <Collapse defaultActiveKey={"1"} accordion={false}>
            <Panel
              key="1"
              extra={<>
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                  <Col>
                    <Radio.Group
                      defaultValue={"teeth"}
                      name="radiogroup"
                      style={{
                        margin: 0,
                        width: "100%",
                      }}
                      onChange={async (e) => {
                        e.stopPropagation();

                        setTeethChoose(e.target.value);

                        const selectToothValue = (value) => {
                          switch (value) {
                            case "Full Mouth":
                              return "00";
                            case "Deciduous Tooth":
                              return "03";
                            case "Upper":
                              return "01";
                            case "Lower":
                              return "02";
                            default:
                              return value;
                          }
                        };

                        const selectedValue = selectToothValue(e.target.value);

                        props.setSelectToothDropdown(selectedValue);

                        let list = await handleSelectTeethFromDropDown(selectedValue);
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
                        setStatusList(prevStatus);
                      }}
                    >
                      {selectTeeth.map((val, index) => {
                        return (
                          <Radio
                            key={index}
                            hidden={val.datavalue === "Other" ? true : false}
                            value={val.datavalue}
                            style={{ margin: 0 }}
                            onClick={e => {
                              e.stopPropagation()
                            }}
                          >
                            {val.datadisplay}
                          </Radio>
                        );
                      })}
                    </Radio.Group>
                  </Col>
                  <Col>
                    <Select
                      size="small"
                      placeholder={"รายการอื่นๆที่ไม่ใช่ฟัน"}
                      showSearch
                      disabled={teethChoose === "Other" ? false : true}
                      style={{ width: 175, }}
                      allowClear={true}
                      optionFilterProp="children"
                      onClick={e => e.stopPropagation()}
                    >
                      {noTeeth.map((val, index) => (
                        <Option value={val.datavalue} key={index}>
                          {val.datadisplay}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Input
                      disabled={teethChoose !== "teeth"}
                      value={teethAndSideValues}
                      // size="small"
                      style={{ width: 165 }} placeholder="ระบุซี่ฟัน เช่น 18DOM"
                      onChange={e => {
                        e.stopPropagation()
                        handleChangeTeethAndSide(e.target.value)
                      }}
                      onClick={e => e.stopPropagation()}
                      onPressEnter={e => {
                        handlePressEnter(e.target.value)
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                    />
                  </Col>
                  <Col>
                    <Select
                      // size="small"
                      id="select-teeth"
                      mode="multiple"
                      allowClear
                      disabled={teethChoose !== "teeth"}
                      maxTagCount={"responsive"}
                      style={{ width: 200, }}
                      placeholder={"ค้นหารหัสซี่ฟัน"}
                      showSearch
                      optionFilterProp="children"
                      defaultActiveFirstOption={false}
                      dropdownMatchSelectWidth={false}
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
                      onClick={e => e.stopPropagation()}
                      onSelect={async (e) => {
                        props.setSelectToothDropdown(e);
                        let list = await handleSelectTeethFromDropDown(e);
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
                        setStatusList(prevStatus);
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
                </Row>
              </>}
              header={<div style={{ width: 200 }}>
                <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                  <Col>
                    <label className="gx-text-primary fw-bold">รายการซี่ฟัน</label>
                  </Col>
                </Row>

              </div>}

            >
              <div className="mb-3 text-end">
                <label
                  className="circleDiv me-1"
                  style={{
                    width: "15px",
                    height: "15px",
                    backgroundColor: "#D4FDA2",
                  }}
                ></label>
                <label className="me-3">ฟันที่เลือก</label>
                <label
                  className="circleDiv me-1"
                  style={{
                    width: "15px",
                    height: "15px",
                    backgroundColor: "#80C6FE",
                  }}
                ></label>
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
                <Col span={24}>
                  <div
                    hidden={teethChoose === "Other"}
                    style={{ zoom: settingZoomDentalTemplates(teethChoose) }}
                  >
                    {renderTeeth(teethChoose)}
                  </div>
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
            </Panel>
          </Collapse>
        </div>
      ) : (
        []
      )}

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
