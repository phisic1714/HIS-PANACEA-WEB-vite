import { env } from '../../env.js';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Row, Col, Divider, Modal, Button, Radio, Avatar, Image, Spin, Space } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { smartCardAction } from "../../appRedux/actions/SmartCardAction";
import { toast } from "react-toastify";
import Scrollbars from "react-custom-scrollbars";
import { InsPatientsRights, GetMappingRight } from "routes/Registration/API/PatientVisitApi";

export const GetCheckRight = async req => {
  let res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/INhsoService/GetNhsoService`, req)
    // let res = await axios.get(`${process.env.REACT_APP_PANACEACHS_SERVER}/api/smartcard/probe/${idCard}`)
    .then(res => {
      return res;
    }).catch(error => {
      return error.response;
    });
  return res;
};

// };

export const GetCheckRightKrios = async idCard => {
  let res = fetch(`${env.REACT_APP_PANACEA_CHECKRIGHT}/api/smartcard/probe/${idCard}`
  ).then(res => res).then(data => data.json()).catch(error => {
    return error.response;
  });
  return res;
};
export default forwardRef(function NHSORight({
  patient = [],
  ...props
}, ref) {
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const [showCheckVisitModal, setShowCheckVisitModal] = useState(false);
  const [patientRight, setPatientRight] = useState({});
  // const [patientRight, setPatientRight] = useState(dataTest);
  const [checkRight, setCheckRight] = useState({}); /* console.log(checkRight); */

  const smartCard = useSelector(({
    smartCard
  }) => smartCard);
  const dispatch = useDispatch();
  useImperativeHandle(ref, () => ({
    setShowCheckVisitModal: props => setShowCheckVisitModal(props)
  }));
  useEffect(() => {
    // console.log(patient);
  }, [patient]);
  const getCheckRight = async req => {
    if (!req) {
      return setCheckRight({});
    }
    let res = await GetCheckRight(req);
    if (res.data?.responseData?.ws_status_desc !== "ok") {
      toast.error(`${res.data?.responseData?.ws_status_desc}`, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
      props.NHSORightRef.current.setShowCheckVisitModal(false);
      return;
    }
    dispatch(smartCardAction({
      ...smartCard?.Personal,
      insid: res?.data?.responseData?.person_id || null
    }));
    setPatientRight(res.data.responseData);
    getMappingRight(res.data.responseData);
    if (res?.status === 200) {
      // console.log(res.data.responseData);
      if (res.data) {
        res.data.status = 200;
      }
    }
    setCheckRight(res?.data);
  };
  // const [visibleSelactRight, setVisibleSelactRight] = useState(false)
  const [listRightInscl, setListRightInscl] = useState([]);
  const [radioValue, setRadioValue] = useState(null);
  const getMappingRight = async nhsoRight => {
    // console.log("nhsoRight", nhsoRight);
    if (!nhsoRight) {
      return;
    }
    let res = await GetMappingRight({
      inscl: nhsoRight.maininscl,
      subinscl: nhsoRight.subinscl
    });
    // maininscl
    // subinscl
    // { patienRightData.patientRight?.maininscl} }
    // { patienRightData.patientRight?.subinscl} }
    // console.log("res", res);
    res = res.map(v => {
      return {
        ...v,
        value: v.rightid,
        label: v.name
      };
    });
    setListRightInscl(res);
    if (res.length > 0) {
      // props.setVisibleSelactRight(true)
    }
  };
  useEffect(() => {
    // getMappingRight()
  }, []);
  useEffect(() => {
    // console.log(props.requestRight);
    if (patient && props.requestRight) {
      getCheckRight(props.requestRight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, props.requestRight]);
  // console.log("valueListRightInscl", props.valueListRightInscl);

  const [loading, setLoading] = useState(false);
  const insPatientRight = async (rightId, mainFlag = null, rightName = "") => {
    setLoading(true);
    let reqInsRight = {
      mode: "string",
      user: "string",
      ip: "string",
      lang: "string",
      branch_id: "string",
      requestData: {
        patientId: patient[0].patientId,
        runHn: patient[0].runHn,
        yearHn: patient[0].yearHn,
        hn: patient[0].hn,
        rightId: rightId,
        govcode: null,
        ptRightId: null,
        insid: patientRight.cardid,
        hmain: patientRight.hmain || null,
        hsub: patientRight.hsub || null,
        hmainOp: null,
        ownRightPid: null,
        relinscl: null,
        startDate: null,
        expireDate: null,
        identifyFlag: null,
        mainFlag: mainFlag
      },
      barcode: "string"
    };
    let res = await InsPatientsRights(reqInsRight);
    if (!res?.isSuccess) {
      toast.error("เพิ่มสิทธิ์ไม่สำเร็จ", {
        position: "top-right",
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
    if (res?.isSuccess) {
      toast.success("เพิ่มสิทธิ์สำเร็จ", {
        position: "top-right",
        autoClose: 1500,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
    if (props?.onInsPatientRight) {
      props?.onInsPatientRight(rightId, rightName)
    }
    // props.setReloadVisitTable();
    setLoading(false);
  };
  return <>
    <Modal title={<label className="font_main">แสดงผลการตรวจสอบสิทธิ์</label>} centered
      visible={showCheckVisitModal}
      // visible={true}
      okText="บันทึก"
      cancelText="ออก"
      // onOk={() => {
      //   handleSubmitRight();

      //   setShowCheckVisitModal(false);
      // }}
      // onCancel={() => {
      //   handleSubmitRight();

      //   setShowCheckVisitModal(false);
      // }}
      closable={false}
      footer={false} width={900}>
      {checkRight?.status === 200 ? <>
        <div>
          <Row gutter={8}>
            <Col span={4}>
              <div>
                {patient[0]?.picture ? <Avatar size={100} src={<Image src={`data:image/jpeg;base64,${patient[0].picture}`} />} style={{
                  boxShadow: "0px 4px 2px 0px #ECEFF1"
                }} /> : <Avatar size={100} style={{
                  boxShadow: "0px 4px 2px 0px #ECEFF1"
                }}>
                  Patient
                </Avatar>}
              </div>
            </Col>
            <Col span={20}>
              <br />
              <Row>
                <Col span={24}>
                  <p>
                    <b>ชื่อ : </b>
                    {patientRight?.fname} {patientRight?.lname}&nbsp;&nbsp;
                    {patientRight?.sex === "2" ? <IoMdFemale style={{
                      color: "#EC407A"
                    }} /> : patientRight?.sex === "1" ? <IoMdMale style={{
                      color: "blue"
                    }} /> : ""}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <p>
                    <b>เลขบัตรประชาชน : </b>
                    {patientRight?.person_id}
                  </p>
                  <p>
                    <b>สถานภาพบุคคล : </b>
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <b>วัน/เดือน/ปี เกิด : </b>
                    {patientRight?.birthdate
                      ? parseInt(patientRight?.birthdate.substring(4, 8)) === 0
                        ? `01/01/${patientRight?.birthdate.substring(0, 4)}`
                        : dayjs(patientRight?.birthdate, "YYYYMMDD").format("DD/MM/YYYY")
                      : "-"
                    }
                    {/* {patientRight?.birthdate ? dayjs(patientRight.birthdate, "YYYYMMDD").format("DD/MM/YYYY") : "-"} */}
                  </p>
                  <p>
                    <b>ข้อมูล ณ วันที่ : </b>
                    {patientRight?.ws_date_request ? <>
                      {dayjs(patientRight?.ws_date_request).format("DD/MM/BBBB HH:mm")}{" "}
                      น.
                    </> : "-"}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row gutter={8}>
            <Col span={8}>
              <p>
                <b>สิทธิ์ที่ใช้เบิก</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.subinscl_name ? patientRight?.subinscl_name : "-"}{" "}
                <label style={{
                  fontSize: "10px"
                }}>
                  ({patientRight?.maininscl})-({patientRight?.subinscl})
                </label>
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>รหัสประกันสุขภาพ</b>
              </p>
            </Col>
            <Col span={16}>
              <p>{patientRight?.cardId ? patientRight?.cardId : "-"}</p>
            </Col>
            <Col span={8}>
              <p>
                <b>วันเริ่มสิทธิ์</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.startdate ? dayjs(patientRight?.startdate, 'YYYYMMDD', true).isValid() ? dayjs(patientRight?.startdate).format("DD/MM/YYYY") : "-" : "-"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>วันหมดสิทธิ์</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.expdate ? dayjs(patientRight?.expdate, 'YYYYMMDD', true).isValid() ? dayjs(patientRight?.expdate).format("DD/MM/YYYY") : "-" : "-"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>จังหวัดลงทะเบียนรักษา</b>
              </p>
            </Col>
            <Col span={16}>
              <p>{patientRight?.purchaseprovince_name}</p>
            </Col>
            <Col span={8}>
              <p>
                <b>รพ.รักษา (ประกันสังคม)</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.hmain_name ? patientRight?.hmain_name : "-"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>หน่วยบริการที่รับการส่งต่อ</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.hmain_name ? patientRight?.hmain_name : "-"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>หน่วยบริการปฐมภูมิ</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.hsub_name ? patientRight?.hsub_name : "-"}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <b>หน่วยบริการประจำ</b>
              </p>
            </Col>
            <Col span={16}>
              <p>
                {patientRight?.hmain_op_name ? patientRight?.hmain_op_name : "-"}
              </p>
            </Col>
          </Row>
        </div>
        <div className="text-center">
          <Button type="secondary" onClick={() => {
            // console.log(patientRight);
            // handleSubmitRight();

            setShowCheckVisitModal(false);
          }}>
            ปิด
          </Button>

          <Button type="primary" onClick={() => {
            setShowCheckVisitModal(false);

            if (!listRightInscl.length) {
              toast.error("ไม่พบสิทธิ์ที่ตรงกับในระบบ", {
                position: "top-right",
                autoClose: 1500,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              });
              return
            }

            if (listRightInscl.length === 1) {
              insPatientRight(listRightInscl[0].rightid, 'Y', listRightInscl[0].name);
              return
            }

            const listHospital = ["10663", "10829", "10827"]
            const hospitalMain = hosParam?.hospCode
            const hospitalProvince = hosParam?.changwat ? hosParam.changwat.substring(0, 4) : null

            const inRights = listRightInscl.filter((v) => v.rightInArea === 'I')
            const outRights = listRightInscl.filter((v) => v.rightInArea === 'O')
            const proviceRights = listRightInscl.filter((v) => v.rightInArea === 'P')

            // ตรวจสอบสิทธิ์ประกันสังคม
            if (patientRight?.maininscl === 'SSS') {
              if (listHospital.includes(patientRight?.hmain) && inRights.length === 1) {
                insPatientRight(inRights[0].rightid, 'Y', inRights[0].name);
                return;
              } else if (!listHospital.includes(patientRight?.hmain) && outRights.length === 1) {
                insPatientRight(outRights[0].rightid, 'Y', outRights[0].name);
                return;
              }
            }

            // ต่างจังหวัด หมายถึง ไม่ใช่ จ.ระยอง
            if (patientRight?.purchaseprovince !== hospitalProvince && proviceRights.length === 1) {
              insPatientRight(proviceRights[0].rightid, 'Y', proviceRights[0].name);
              return
            }

            //ในเขต ใน จ.ระยอง
            if (patientRight?.hmain === hospitalMain && inRights.length === 1) {
              insPatientRight(inRights[0].rightid, 'Y', inRights[0].name);
              return
            }

            //นอกเขต ใน จ.ระยอง
            if (patientRight?.hmain !== hospitalMain && outRights.length === 1) {
              insPatientRight(outRights[0].rightid, 'Y', outRights[0].name);
              return
            }

            if (props.setVisibleSelactRight) props.setVisibleSelactRight(true);
          }}>
            บันทึก
          </Button>
        </div>
      </> : <>
        <Row justify="center">{checkRight?.message}</Row>
        <div className="text-center">
          <Button type="secondary" onClick={() => {
            setShowCheckVisitModal(false);
          }}>
            ปิด
          </Button>
        </div>
      </>}
    </Modal>

    <Modal title={<label className="gx-text-primary fw-bold" style={{
      fontSize: 20
    }}>
      แสดงผล ตรวจสอบสิทธิ์
    </label>} centered visible={props.visibleSelactRight}
      // onOk={() => {
      //   (InsPatientsRights())

      // }}
      // onCancel={handleCancelAddaRights}
      width={900} footer={<Row gutter={[8, 8]}>
        <Col span={24} className="text-center">
          <Button onClick={() => props.setVisibleSelactRight(false)}>
            ปิด
          </Button>
          <Button type="primary" disabled={!radioValue || loading} onClick={() => {
            const findObj = listRightInscl.find((v) => v.rightid === radioValue)
            insPatientRight(radioValue, 'Y', findObj ? findObj?.name : '');
            props.setVisibleSelactRight(false);
            getMappingRight();
          }}>
            บันทึก
          </Button>
        </Col>
      </Row>}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Scrollbars autoHeight autoHeightMin={400}>
              <Radio.Group onChange={e => {
                setRadioValue(e.target.value);
              }} value={radioValue}>
                <Space direction="vertical">
                  {listRightInscl.map(v => {
                    return <>
                      <label className="ms-3">Radio</label>
                      <Radio value={v.rightid}>{v.name}</Radio>
                    </>;
                  })}
                </Space>
              </Radio.Group>
            </Scrollbars>
          </Col>

          <Col span={8}>
            {/* patientRight?.maininscl, patientRight?.subinscl */}

            <p className="ms-3">maininscl : {patientRight.maininscl}</p>
            {/* patientRight?.maininscl, patientRight?.subinscl */}
            <p className="ms-3">
              subinscl : {patientRight.subinscl} {patientRight.subinscl_name}
            </p>
            {/* <label className="ms-3">{patienRightData.patientRight?.subinscl}</label> */}
          </Col>
        </Row>
      </Spin>
    </Modal>
  </>;
});

const dataTest = {
  "birthdate": "25361206",
  "count_select": "0",
  "fname": "xxx",
  "hmain": "11582",
  "hmain_name": "รพ.ทั่วไปขนาดใหญ่ศิครินทร์",
  "lname": "xxxxxxxxxxxxx",
  "maininscl": "SSS",
  "maininscl_main": "S",
  "maininscl_name": "สิทธิประกันสังคม",
  "nation": "099",
  "person_id": "xxxx7xxxxxx6",
  "primary_amphur_name": "บางพลี",
  "primary_moo": "01",
  "primary_mooban_name": "บ้านคลองบางโฉลง",
  "primary_province_name": "สมุทรปราการ",
  "primary_tumbon_name": "บางโฉลง",
  "primaryprovince": "1100",
  "purchaseprovince": "1000",
  "purchaseprovince_name": "กรุงเทพฯ",
  "sex": "1",
  "startdate": "25611201",
  "startdate_sss": "25611201",
  "subinscl": "S1",
  "subinscl_name": "สิทธิเบิกกองทุนประกันสังคม (ผู้ประกันตน)",
  "title": "001",
  "title_name": "ด.ช.",
  "ws_data_source": "NHSO",
  "ws_date_request": "2024-10-09T00:00:00+07:00",
  "ws_status": "NHSO-000001",
  "ws_status_desc": "ok",
  "wsid": "WS000015303374014",
  "wsid_batch": "WSB00004063978747"
}