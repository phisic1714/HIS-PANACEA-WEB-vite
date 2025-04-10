import { env } from "../../env.js";

import ribbonIcon from "@iconify/icons-fa-solid/ribbon";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Form,
  Image,
  Input,
  InputNumber,
  Menu,
  Modal,
  notification,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineFacebook, AiOutlineFile } from "react-icons/ai";
import { FaLine, FaRegStickyNote } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { IoCameraSharp } from "react-icons/io5";
import { GetCheckRightKrios } from "../../components/helper/NHSORight";
import {
  DelPatientAddress,
  getAddressMasterFetch,
  GetDropDownMas,
  SavePatientAddressById,
  UpdPatientAddress,
  UpdPatientPicture,
} from "../../routes/Information/API/preRegister"; // แก้ไขที่อยู่ผู้ป่วยตาม patientId, addressId
import { UpdListFailOpdCard } from "../../routes/Registration/API/OpdCardfailApi"; // ล้มเเฟ้ม
import {
  CheckHnNumber,
  InsPatientsFetch,
  RecoveryHn,
  UpdPatient,
} from "../../routes/Registration/API/OutpatientRegistrationApi";
import PatientInfoHistory from "../Modal/PatientInfoHistory";

import { smartCardClear } from "appRedux/actions/SmartCardAction";
import axios from "axios";
import { GenFormItem2 } from 'components/Input/FormControls';
import VipStatus from "components/VipStatus/VipStatus.js";
import SelectWithSearchSort from "components/helper/SelectWithSearchSort";
import GenRow from 'components/helper/function/GenRow';
import { map, find, filter, toNumber, sortBy, countBy } from "lodash";
import moment from "moment";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import thaiIdCard from "thai-id-card";
import { showMessage } from "../../appRedux/actions";
import PatientLast from "../../routes/Registration/Components/PatientLast";
import BreadcrumbMenu from "../Breadcrumb/BreadcrumbMenu";
import DatepickerWithForm from "../DatePicker/DatePickerWithForm";
import MapPatient from "../Map/MapPatient";
import EMessageAntdDatePicker from "../Modal/EMessageAntdDatePicker";
import Notifications from "../Modal/Notifications";
import { calculateAge } from "../ServiceInformation/CalculateAge";
import { momentEN, momentTH } from "../helper/convertMoment";
import { PrintFormReport } from "../qzTray/PrintFormReport";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;
const layout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const StyledButtonTextField = styled(Button)`
cursor: default;
color: #000!important;
:disabled{
opacity: 100;
}
:hover, :focus, :active {
  cursor: default;
   color: #000!important;
   border-color: #FFF!important;
   /* background: transparent!important; */
}
`;

// const onError = (e) => {
//     e.setPageCurrent.onError = null;
//     e.setPageCurrent.src = "https://icon-library.com/images/0234605a9c.svg.svg";
// };

const baseLocation = {
  lat: 13.74,
  lng: 100.49,
};
const size = "small"

const addressTypeList = [
  {
    dataValue: "1",
    dataDisplay: "ที่อยู่ตามทะเบียนบ้าน",
  },
  {
    dataValue: "2",
    dataDisplay: "ที่อยู่ปัจจุบัน",
  },
  {
    dataValue: "3",
    dataDisplay: "ที่อยู่นายจ้าง",
  },
  {
    dataValue: "4",
    dataDisplay: "ที่อยู่ทำงาน",
  },
  {
    dataValue: "5",
    dataDisplay: "ที่อยู่ตามบัตรประชาชน",
  },
  {
    dataValue: "6",
    dataDisplay: "ที่อยู่จัดส่งยาทางไปรษณีย์",
  },
]

const contactRelationshipList = [
  { label: 'บิดา', value: 'บิดา' },
  { label: 'มารดา', value: 'มารดา' },
  { label: 'พี่', value: 'พี่' },
  { label: 'น้อง', value: 'น้อง' },
  { label: 'บุตร', value: 'บุตร' },
  { label: "ญาติ", value: 'ญาติ' },
  { label: "เพื่อน", value: 'เพื่อน' },
  { label: 'นายจ้าง', value: 'นายจ้าง' },
  { label: 'ผู้ร่วมงาน', value: 'ผู้ร่วมงาน' },
  { label: 'บุคคลที่เกี่ยวข้อง', value: 'บุคคลที่เกี่ยวข้อง' },

]

export default function PatientRegistration(props) {
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const { message } = useSelector(({ autoComplete }) => autoComplete);
  const dispatch = useDispatch();
  // props?.setIsReplace({status:true,data:props?.prevPatientData.hn,deleteRemark: null})
  let isUpdate = props.isUpdate;
  const history = useHistory();
  const [emessageVisible, setEMessageVisible] = useState(false);
  const birthDateRef = useRef(null);
  const { pathname } = useSelector(({ common }) => common);

  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;
  var personal = useSelector(({ smartCard }) => smartCard);
  const [prevIdCard, setPrevIdCard] = useState(null);
  const [checkGotoRightPage, setCheckGotoRightPage] = useState(false);
  const [latAddress, setLatAddress] = useState(null);
  const [lngAddress, setLngAddress] = useState(null);
  useEffect(() => {
    if (props?.prevPatientData) {
      setPrevIdCard(props?.prevPatientData?.idCard);
    }
    setBirthdate(form.getFieldValue().birthdate);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onBirthdate(form.getFieldValue().birthdate);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.prevPatientData]);

  // YearHn generate
  const newDate = new Date();
  let date = moment(newDate, "DD/MM/YYYY");
  if (date.isValid()) {
    date.subtract(-543, "years");
  }
  const detectAddressTypeRef = useRef([]);
  const [form] = Form.useForm();
  const [formOpdCardFail] = Form.useForm();
  const [formOpdCardFailReplace] = Form.useForm();
  const [formAddressFail] = Form.useForm();

  // movein date
  const patientDataMoveinDateisActive = props.prevPatientData
    ? props.prevPatientData.moveinDate
    : undefined;
  const moveinDateisFormat = patientDataMoveinDateisActive
    ? moment(props.prevPatientData.moveinDate, "MM/DD/YYYY")
    : undefined;

  // disch date
  const patientDataDischDateisActive = props.prevPatientData
    ? props.prevPatientData.dischDate
    : undefined;
  const dischDateFormat = patientDataDischDateisActive
    ? moment(props.prevPatientData.dischDate, "MM/DD/YYYY")
    : undefined;

  // runHn
  const patientDataRunHnActive = props.prevPatientData
    ? props.prevPatientData.runHn
    : undefined;
  const runHn = patientDataRunHnActive
    ? props.prevPatientData.runHn
    : undefined;

  // yearHn
  const patientDataYearHnActive = props.prevPatientData
    ? props.prevPatientData.yearHn
    : undefined;
  const yearHn = patientDataYearHnActive
    ? props.prevPatientData.yearHn
    : undefined;
  // hn
  const hn = (runHn ? `${runHn}/` : "") + (yearHn ? yearHn : "");
  // eslint-disable-next-line no-unused-vars
  const drugAllergyStatus = props.prevPatientsDrugAllergies
    ? props.prevPatientsDrugAllergies.drugAllergic === ""
      ? 3
      : 1
    : 3;
  const [showModalPatientDetailEdit, setShowModalPatientDetailEdit] = useState(false);
  // detect format email
  const emailPattern =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


  // setdefault labor
  const [, setLaborTypeDetect] = useState(
    props.prevPatientData
      ? props.prevPatientData.laborTypeId
        ? props.prevPatientData.laborTypeId
        : undefined
      : undefined
  );
  const [, setEmployerType] = useState(
    props.prevPatientData
      ? props.prevPatientData.employerTypeId
        ? props.prevPatientData.employerTypeId
        : undefined
      : undefined
  );
  const [diedFlag, setDiedFlag] = useState(false);
  const [isHideName, setIsHideName] = useState(false);
  const [age, setAge] = useState({
    ageDay: null,
    ageMonth: null,
    ageYear: null,
    ageFull: "0Y 0M 0D",
  });

  const [addressInfo, setAddressInfo] = useState(
    props.prevPatientAddress ? props.prevPatientAddress?.addressInfo : []
  );

  useEffect(() => {
    console.log('addressInfo', addressInfo)
  }, [addressInfo])


  const formSubmitType = useRef();
  const countAddressInfoRef = useRef(
    props.prevPatientAddress ? props.prevPatientAddress.count : 0
  );

  // member data for detect firstName & lastName
  const firstNameRef = useRef("");
  const lastNameRef = useRef("");

  // temp address for use next step
  const addressInfoTemp = useRef([]);
  const countAddressRef = useRef(
    props.prevPatientAddress ? props.prevPatientAddress.formData.length : 0
  );
  const hiddenPictureUploadInput = React.useRef(null);
  const [base64Img, setBase64Img] = useState({
    patientId: null,
    picture: null,
    dateCreated: null,
    dateModified: null,
    mimeType: null,
    userCreated: null,
    userModified: null,
  });
  const [isAlienFather, setIsAlienFather] = useState(false);
  const [isAlienMother, setIsAlienMother] = useState(false);
  const [isAlienCouple, setIsAlienCouple] = useState(false);
  const [isAlienContact, setIsAlienContact] = useState(false);
  const patientInfoPerfectRef = useRef(false);
  const patientAddressPerfectRef = useRef(false);
  const patientInfoContactAddressRef = useRef(false);
  const latAddressRef = useRef(13.74);
  const lngAddressRef = useRef(100.49);
  const [birthdate, setBirthdate] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showProcessResultModal, setShowProcessResultModal] = useState(false);
  const [titletoModal, setTitleToModal] = useState(null);

  const timer = useRef(null);
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const [delAddress, setDelAddress] = useState([]);
  const getCheckRight = async (idCard = null) => {
    setLoading(true);
    let res = await GetCheckRightKrios(idCard);
    if (!res?.pid) {
      setLoading(false);
      return;
    }
    let birthDate =
      res?.birthDate.substring(6, 8) +
      res?.birthDate.substring(4, 6) +
      res?.birthDate.substring(0, 4);
    let formValues = form.getFieldsValue();
    form.setFieldsValue({
      prefixTH: res?.titleName || formValues?.prefixTH,
      firstNameTH: res?.fname || formValues?.firstNameTH,
      lastNameTH: res?.lname || formValues?.lastNameTH,
      nationality: res?.nation || formValues?.nationality,
      gender:
        res?.sex === "ชาย"
          ? "M"
          : res?.sex === "หญิง"
            ? "F"
            : formValues?.gender,
      birthdate: moment(birthDate, "DDMMYYYY").subtract(543, "years"),
    });

    document.getElementById("DOB").focus();
    document.getElementById("DOB").blur();
    if (res?.data?.birthDate) {
      setBirthdate(moment(res?.birthDate).format("DD/MM/YYYY"));
      onBirthdate(moment(res?.birthDate).format("DD/MM/YYYY"));
    }
    setLoading(false);
  };
  const markLocation = (local) => {
    setLatAddress(local.lat);
    setLngAddress(local.lng);
    latAddressRef.current = local.lat;
    lngAddressRef.current = local.lng;
  };
  function handleTakePhotoAnimationDone(dataUri) {
    let patientId = props.prevPatientPicture
      ? props.prevPatientPicture.patientId
      : null;
    let picture = dataUri.split("base64,");
    handlePictureUpload(patientId, picture[1]);
    setShowCameraModal(false);
  }

  // Modal camera
  const [showCameraModal, setShowCameraModal] = useState(false);
  const handleCameraOk = () => {
    setShowCameraModal(false);
  };
  const handleCameraCancel = () => {
    setShowCameraModal(false);
  };

  // Modal opd card fail
  const [showOpdCardFailModal, setShowOpdCardFailModal] = useState(false);
  const handleOpdCardFailOk = () => {
    setShowOpdCardFailModal(false);
  };
  const handleOpdCardFailCancel = () => {
    setShowOpdCardFailModal(false);
  };
  const [showOpdCardFailReplaceModal, setShowOpdCardFailReplaceModal] =
    useState(false);
  const handleOpdCardFailReplaceOk = () => {
    setShowOpdCardFailReplaceModal(false);
  };
  const handleOpdCardFailReplaceCancel = () => {
    setShowOpdCardFailReplaceModal(false);
  };
  const handlePictureUploadClick = () => {
    hiddenPictureUploadInput.current.click();
  };

  const handlePictureUploadChange = async (event) => {
    const fileUploaded = event.target.files[0];
    const base64 = await convertBase64(fileUploaded);
    let patientId = props.prevPatientPicture
      ? props.prevPatientPicture.patientId
      : null;
    let picture = base64.split("base64,");
    handlePictureUpload(patientId, picture[1]);
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };
  const handleMenuDropFolderClick = (e) => {
    if (e.key === "1") {
      setShowOpdCardFailModal(true);
    } else if (e.key === "2") {
      setShowOpdCardFailReplaceModal(true);
    }
  };
  const menuDropFolder = (
    <Menu
      onClick={handleMenuDropFolderClick}
      items={[
        {
          label: "ล้มเเฟ้ม",
          key: "1",
          // icon: <UserOutlined />,
        },
        {
          label: "สร้างทดแทน",
          key: "2",
          // icon: <UserOutlined />,
        },
      ]}
    />
  );

  const menu = (
    <Menu>
      <Menu.Item
        key={1}
        style={{
          paddingBottom: 0,
          height: 47,
        }}
      >
        <Button
          style={{
            width: "100%",
          }}
          onClick={() => {
            setShowCameraModal(true);
          }}
        >
          <IoCameraSharp
            style={{
              width: 20,
              height: 20,
              marginTop: -4,
            }}
          />{" "}
          กล้องถ่ายรูป
        </Button>
      </Menu.Item>
      <Menu.Item
        key={2}
        style={{
          paddingBottom: 0,
          height: 47,
        }}
      >
        <>
          <Button
            onClick={handlePictureUploadClick}
            style={{
              width: "100%",
            }}
          >
            <AiOutlineFile
              style={{
                width: 20,
                height: 20,
                marginTop: -4,
              }}
            />{" "}
            ไฟล์ภาพ
          </Button>
          <input
            type="file"
            ref={hiddenPictureUploadInput}
            onChange={handlePictureUploadChange}
            style={{
              display: "none",
            }}
          />
        </>
      </Menu.Item>
    </Menu>
  );
  const handlePictureUpload = (patientId, picture) => {
    var currentDate = moment(new Date()).format("YYYY-MM-DD HH:mm");
    dispatch(smartCardClear());
    personal = null;
    props.setImageSmartCard("");
    let tempPrevPatientPicture = props.prevPatientPicture;
    if (tempPrevPatientPicture?.dateCreated) {
      tempPrevPatientPicture.dateCreated = props.prevPatientPicture.dateCreated;
      tempPrevPatientPicture.dateModified = currentDate;
      tempPrevPatientPicture.mimeType = props.prevPatientPicture.mimeType;
      tempPrevPatientPicture.patientId = patientId;
      tempPrevPatientPicture.picture = picture;
      tempPrevPatientPicture.userCreated = props.prevPatientPicture.userCreated;
      tempPrevPatientPicture.userModified =
        props.prevPatientPicture.userModified;
    } else {
      tempPrevPatientPicture = {
        dateCreated: currentDate,
        dateModified: currentDate,
        mimeType: null,
        patientId: isUpdate,
        picture,
        userCreated: null,
        userModified: null,
      };
    }
    setBase64Img(tempPrevPatientPicture);
  };

  const getCheckboxColor = (color) => {
    let checkboxClassName = "checkbox-green";
    if (color === "red") {
      checkboxClassName = "checkbox-red";
    }
    return checkboxClassName;
  };

  const checkPatientIsLocal = () => {
    let isLocal = props?.prevPatientAddress?.formData?.find((ele,) => ele?.isLocal === "Y");
    return isLocal;
  }

  const onAddAddress = () => {
    const values = [...addressInfo];
    values.push({
      id: Number(countAddressInfoRef.current) - 1,
      isEdit: true,
      address: ["", "", "", "", "", "", "", "", ""],
      addressType: "",
      lat: baseLocation.lat,
      lng: baseLocation.lng,
      mapIsOpen: false,
    });
    setAddressInfo(values);
    setAmphur((prev) => {
      // if (props.apiData.amphurList?.length > 0)
      prev.push(props.apiData.amphurList || []);
      return prev;
    });
    setTambon((prev) => {
      // if (props.apiData.tambonList?.length > 0)
      prev.push(props.apiData.tambonList || []);
      return prev;
    });
    countAddressRef.current += 1;
  };
  const onRemoveAddress = (id, obj) => {
    const temp = [...addressInfo];
    let newList = temp.filter((val) => val.id !== id);
    newList = newList ? newList : [];
    let newListAddressType = newList[0] ? newList[0]?.addressType : undefined;
    let tempAddressTypeList = addressTypeList.filter(
      (val) => val.dataDisplay === newListAddressType
    );
    if (tempAddressTypeList?.length !== 0) {
      let tempDetectAddressType = detectAddressTypeRef.current.filter(
        (val) => val === tempAddressTypeList[0]?.dataValue
      );
      detectAddressTypeRef.current = tempDetectAddressType;
    } else {
      detectAddressTypeRef.current = [];
    }

    //Bank(B1)
    if (obj?.addressId) {
      setDelAddress((prevData) => [...prevData, obj]);
    }
    setAddressInfo(newList);
    countAddressRef.current -= 1;
  };
  const openEditAddress = (id) => {
    let find = addressInfo.filter((val) => val.id === id);
    const value = addressInfo.map((val) =>
      val.id === id
        ? {
          id,
          isEdit: true,
          address: find[0]?.address,
          addressType: find[0]?.addressType,
          lat: find[0].lat,
          lng: find[0].lng,
          mapIsOpen: find[0].mapIsOpen,
        }
        : val
    );
    setAddressInfo(value);
  };

  const onClickMapOnAddress = (id) => {
    let find = addressInfo.filter((val) => val.id === id);
    const value = addressInfo.map((val) =>
      val.id === id
        ? {
          id,
          isEdit: true,
          address: find[0]?.address,
          addressType: find[0]?.addressType,
          lat: find[0].lat,
          lng: find[0].lng,
          mapIsOpen: !find[0].mapIsOpen,
        }
        : val
    );
    setAddressInfo(value);
  };

  const onFinish = (values) => {
    // รวมค่า fatherFirstName และ fatherLastName เป็น fatherName
    const fatherName = `${values.fatherFirstName || ""} ${values.fatherLastName || ""}`.trim(); // ตัดช่องว่างส่วนเกิน
    const motherName = `${values.motherFirstName || ""} ${values.motherLastName || ""}`.trim(); // ตัดช่องว่างส่วนเกิน

    // ข้อมูลที่จะส่งไปยัง backend
    const formData = {
      ...values,
      fatherName,  // เพิ่มค่า fatherName ที่รวมแล้ว
      motherName,  // เพิ่มค่า motherName ที่รวมแล้ว
    };
    if (
      window.location.pathname ===
      "/information/information-pre-patient-register"
    ) {
      formData.preHnFlag = "Y";
    } else {
      formData.preHnFlag = null;
    }
    patientInfoPerfectRef.current = true;
    if (patientInfoPerfectRef.current && patientAddressPerfectRef.current) {
      if (props?.replace?.status) {
        insPatients(formData, addressInfoTemp.current, "A");
      } else {
        if (isUpdate) {
          insPatients(formData, addressInfoTemp.current, "U");
        } else {
          insPatients(formData, addressInfoTemp.current, "A");
        }
      }
    }
    patientInfoPerfectRef.current = false;
    if (patientInfoContactAddressRef.current) {
      patientAddressPerfectRef.current = false;
    }
    patientInfoContactAddressRef.current = false;
    if (checkGotoRightPage) {
      history.push({
        pathname: "/registration/registration-patient-visit",
      });
    }
  };
  const onOpdCardFailFinish = async (values) => {
    let obj = [
      {
        hn: hn,
        deleteRemark: values.opdCardFailRemark,
        userDelete: user,
        delRunHn: runHn ? runHn : null,
        delYearHn: yearHn ? yearHn : null,
      },
    ];
    const result = await UpdListFailOpdCard(obj);
    if (result?.status.data.isSuccess) {
      function Execute() {
        formAddressFail.resetFields();
        form.resetFields();
        handleOpdCardFailCancel();
        dispatch(showMessage(null));
      }
      success("ล้มเเฟ้ม", Execute);
    } else {
      faild("ล้มเเฟ้ม");
    }
  };
  //ล้มแฟ้มทดแทน
  const onOpdCardFailReplaceFinish = async (values) => {
    props?.setIsReplace({
      status: true,
      data: props?.prevPatientData.hn,
      deleteRemark: values.opdCardFailRemark,
      all: props?.prevPatientData,
    });
    patientInfoContactAddressRef.current = true;
    formAddressFail.submit();
    form.submit();
    formSubmitType.current = {
      req: "save all",
      id: null,
    };
    handleOpdCardFailReplaceCancel();
  };
  const success = async (param, callback) => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param}สำเร็จ`,
      type: "success",
    });
    if (callback) {
      setTimeout(callback, 2000);
    }
  };
  const faild = (param) => {
    setShowProcessResultModal(true);
    setTitleToModal({
      title: `${param}ไม่สำเร็จ`,
      type: "warning",
    });
  };
  const onAddressFinish = async (values) => {
    props?.setLoading(true);
    patientAddressPerfectRef.current = true;
    if (values?.addresses) {
      let tempAddressInfo = values?.addresses.filter(
        (val) => val.key === formSubmitType.current.id
      );
      if (tempAddressInfo?.length !== 0) {
        let homeNumber = tempAddressInfo[0].homeNumber;
        let village = tempAddressInfo[0].village;
        let moo = tempAddressInfo[0].moo;
        let soisub = tempAddressInfo[0].soisub;
        let soimain = tempAddressInfo[0].soimain;
        let road = tempAddressInfo[0].road;
        let parish = tempAddressInfo[0].parish;
        let district = tempAddressInfo[0].district;
        let province = tempAddressInfo[0].province;
        let zipCode = tempAddressInfo[0].zipCode;
        let latitude = tempAddressInfo[0].latitude;
        let longitude = tempAddressInfo[0].longitude;
        let checkAddress = detectAddressTypeRef.current.filter(
          (val) => val === tempAddressInfo[0]?.addressType
        );
        if (checkAddress.length === 0) {
          if (countAddressRef.current > 1) {
            detectAddressTypeRef.current.push(tempAddressInfo[0]?.addressType);
          } else {
            detectAddressTypeRef.current = [];
            detectAddressTypeRef.current.push(tempAddressInfo[0]?.addressType);
          }
        }
        parish = props.apiData.tambonList.find((val) => {
          return val?.datavalue === parish ? val + " " : "";
        });
        district = props.apiData.amphurList.find((val) => {
          return val?.datavalue === district ? val + " " : "";
        });
        province = props.apiData.changwatList.find((val) => {
          return val?.datavalue === province ? val + " " : "";
        });
        let tmpAddressType = checkNameAddress(tempAddressInfo[0]?.addressType);
        const value = addressInfo.map((val) =>
          val.id === formSubmitType.current.id
            ? {
              id: formSubmitType.current.id,
              isEdit: false,
              address: [
                homeNumber ? homeNumber + " " : "",
                village ? village + " " : "",
                moo ? moo + " " : "",
                soisub ? soisub + " " : "",
                soimain ? soimain + " " : "",
                road ? road + " " : "",
                parish ? parish.datadisplay + " " : "",
                district ? district.datadisplay + " " : "",
                province ? province.datadisplay + " " : "",
                zipCode ? zipCode + " " : "",
                longitude ? longitude + " " : "",
                latitude ? latitude + " " : "",
              ],
              addressType: tmpAddressType,
              lat: latAddressRef.current ? latAddressRef.current : val.lat,
              lng: lngAddressRef.current ? lngAddressRef.current : val.lng,
              mapIsOpen: val.mapIsOpen,
            }
            : val
        );

        setAddressInfo(value);
        latAddressRef.current = null;
        lngAddressRef.current = null;
      }
    }
    addressInfoTemp.current = values;

    // -----------------------------------------------------------
    if (!patientInfoContactAddressRef.current) {
      patientAddressPerfectRef.current = false;
    }
    props?.setLoading(false);
  };
  const checkNameAddress = (type) => {
    if (type === "1") {
      return "ที่อยู่ตามบัตรประชาชน";
    } else if (type === "2") {
      return "ที่อยู่ปัจจุบัน";
    } else if (type === "3") {
      return "ที่นายจ้าง"
    } else if (type === "4") {
      return "ที่อยู่ทำงาน"
    } else if (type === "5") {
      return "ที่อยู่ตามบัตรประชาชน"
    } else {
      return "ที่อยู่จัดส่งยาทางไปรษณีย์"
    }
  };
  const insPatients = async (patientInfo, patientAddress, hnType) => {
    try {
      props?.setLoading(true);
      const findGovDocTypePassport = find(props?.apiData?.icdCardTypeList, ["dataother1", "P"])
      const findRegisterWorkList = find(props?.apiData?.registerWorkList, ["mapping2", "1"])

      let patients = {
        patientId: props.replace?.status ? null : isUpdate,
        runHn:
          props.topBarType === "page 2.6"
            ? hnType === "A"
              ? form.getFieldValue().hn.split("/")[0]
              : patientInfo.hn.split("/")[0]
            : hnType === "A"
              ? null
              : runHn
                ? runHn
                : null,
        yearHn:
          props.topBarType === "page 2.6"
            ? hnType === "A"
              ? form.getFieldValue().hn.split("/")[1]
              : patientInfo.hn.split("/")[1]
            : hnType === "A"
              ? null
              : yearHn
                ? yearHn
                : null,
        hn:
          props.topBarType === "page 2.6"
            ? patientInfo.hn
            : hnType === "A"
              ? null
              : hn || null,
        titleId: patientInfo.prefixTH,
        firstName: patientInfo.firstNameTH,
        lastName: patientInfo.lastNameTH,
        nickName: patientInfo.nickname ? patientInfo.nickname : null,
        eFirstName: patientInfo.firstNameENG ? patientInfo.firstNameENG : null,
        eLastName: patientInfo.lastNameENG ? patientInfo.lastNameENG : null,
        aliasName: patientInfo.alias ? patientInfo.alias : null,
        gender: patientInfo.gender,
        /* props.checkCard ?
                    (patientInfo.birthdate ? genFormatDate(patientInfo.birthdate) : null)
                    : */
        birthdate: patientInfo.birthdate
          ? moment(patientInfo.birthdate).format("BBBB-MM-DD")
          : null,
        ageDay: age.ageDay ? String(age.ageDay) : null,
        ageMonth: age.ageMonth ? String(age.ageMonth) : null,
        ageYear: age.ageYear ? String(age.ageYear) : null,
        bloodGroup: patientInfo.bloodGroup ? patientInfo.bloodGroup : null,
        bloodRh: patientInfo.rh ? patientInfo.rh : null,
        maritalStatusId: patientInfo.maritalStatus
          ? patientInfo.maritalStatus
          : null,
        nationalityId: patientInfo.nationality ? patientInfo.nationality : null,
        ethnicityId: patientInfo.ethnicity ? patientInfo.ethnicity : null,
        religionId: patientInfo.religion ? patientInfo.religion : null,
        occupationId: patientInfo.occupation ? patientInfo.occupation : null,
        educationalId: patientInfo.education ? patientInfo.education : null,
        idCard: patientInfo.cardNumberID
          ? String(patientInfo.cardNumberID)
          : null,
        patientTypeId: patientInfo.patientType ? patientInfo.patientType : null,
        fatherName: patientInfo.fatherName ? patientInfo.fatherName : null,
        fatherFirstName: patientInfo.fatherFirstName ? patientInfo.fatherFirstName : null,
        fatherLastName: patientInfo.fatherLastName ? patientInfo.fatherLastName : null,
        fatherIdCard: patientInfo.fatherCardIdNumber
          ? patientInfo.fatherCardIdNumber
          : null,
        motherName: patientInfo.motherName ? patientInfo.motherName : null,
        motherFirstName: patientInfo.motherFirstName ? patientInfo.motherFirstName : null,
        motherLastName: patientInfo.motherLastName ? patientInfo.motherLastName : null,
        motherIdCard: patientInfo.motherCardIdNumber
          ? patientInfo.motherCardIdNumber
          : null,
        coupleName: patientInfo.coupleName ? patientInfo.coupleName : null,
        coupleIdCard: patientInfo.coupleCardIdNumber
          ? patientInfo.coupleCardIdNumber
          : null,
        contactName: patientInfo.contactName ? patientInfo.contactName : null,
        contactIdCard: patientInfo.contactCardIdNumber
          ? patientInfo.contactCardIdNumber
          : null,
        contactRelation: patientInfo.contactRelationship
          ? patientInfo.contactRelationship
          : null,
        contactAddress: patientInfo.contactAddress
          ? patientInfo.contactAddress
          : null,
        email: patientInfo.email ? patientInfo.email : null,
        facebook: patientInfo.facebookId ? patientInfo.facebookId : null,
        lineid: patientInfo.lineId ? patientInfo.lineId : null,
        drugAllergic: patientInfo.drugAllergy ? patientInfo.drugAllergy : null,
        otherAllergic: patientInfo.otherAllergic
          ? patientInfo.otherAllergic
          : null,
        agency: patientInfo.agency ? patientInfo.agency : null,
        clinicalHistory: patientInfo.clinicalHistory
          ? patientInfo.clinicalHistory
          : null,
        surgeryHistory: patientInfo.surgeryHistory
          ? patientInfo.surgeryHistory
          : null,
        familyStatus: patientInfo.familyStatus
          ? patientInfo.familyStatus
          : null,
        moveinDate: patientInfo.moveInDate
          ? moment(patientInfo.moveInDate, "DD/MM/YYYY").format("BBBB-MM-DD")
          : null,
        familyDcStatus: patientInfo.familyDcStatus
          ? patientInfo.familyDcStatus
          : null,
        dischDate: patientInfo.dischDate
          ? moment(patientInfo.dischDate, "DD/MM/YYYY").format("BBBB-MM-DD")
          : null,
        typeArea: patientInfo.typeArea ? patientInfo.typeArea : null,
        communityPosId: patientInfo.communityPosition
          ? patientInfo.communityPosition
          : null,
        laborTypeId: patientInfo.laborType ? patientInfo.laborType : null,
        employerTypeId: patientInfo.employerType
          ? patientInfo.employerType
          : null,
        disabledTypeId: patientInfo.disabledType
          ? patientInfo.disabledType
          : null,
        diedFlag: patientInfo?.familyDcStatus === "1" ? "Y" : diedFlag ? "Y" : null,
        notAlergicFlag: patientInfo?.notAlergicFlag || null,
        userCreated: user,
        userModified: user,
        scanFlag: props.prevPatientData ? props.prevPatientData.scanFlag : null,
        telephone: patientInfo.telephoneNumber
          ? patientInfo.telephoneNumber
          : null,
        mobile: patientInfo.mobileNumber ? patientInfo.mobileNumber : null,
        contactTelephone: patientInfo.contactTelephoneNumber
          ? patientInfo.contactTelephoneNumber
          : null,
        contactMobile: patientInfo.contactMobileNumber
          ? patientInfo.contactMobileNumber
          : null,
        socialEconomic: patientInfo.socialEconomic
          ? patientInfo.socialEconomic
          : null,
        socialEconomicType: patientInfo.socialEconomicType
          ? patientInfo.socialEconomicType
          : null,
        preHnFlag: patientInfo.preHnFlag ? patientInfo.preHnFlag : null,
        employerName: patientInfo.employerName
          ? patientInfo.employerName
          : null,
        workingType: patientInfo.workingType ? patientInfo.workingType : null,
        employerTel: patientInfo.employerTel ? patientInfo.employerTel : null,
        nidCard: patientInfo.nidCard ? patientInfo.nidCard : null,
        skin: patientInfo.skin ? patientInfo.skin : null,
        governmentDocType: patientInfo.governmentDocType ? patientInfo.governmentDocType : null,
        governmentDocNo: patientInfo.governmentDocNo ? patientInfo.governmentDocNo : null,
        passport: patientInfo?.governmentDocType === findGovDocTypePassport?.datavalue ? patientInfo.governmentDocNo : patientInfo.passport || null,
        cityOfBirth: patientInfo.cityOfBirth ? patientInfo.cityOfBirth : null,
        countryBirth: patientInfo.countryBirth ? patientInfo.countryBirth : null,
        registerPlaceId: findRegisterWorkList ? `${findRegisterWorkList.workId}` : null
      };

      let result = null;
      // eslint-disable-next-line no-unused-vars
      let resultPatientsDeath = {
        isSuccess: true,
      };
      let resultAddressInsert = null;
      // eslint-disable-next-line no-unused-vars
      let resultAddressUpdate = {
        isSuccess: true,
      };
      const InsertPatient = async () => {
        let patient_pictures = base64Img;
        let patient_address = [];
        if (patientAddress.addresses) {
          for (let i = 0; i < patientAddress.addresses?.length; i++) {
            patient_address.push({
              addressType: patientAddress.addresses[i].addressType
                ? patientAddress.addresses[i]?.addressType
                : null,
              addressNo: patientAddress.addresses[i].homeNumber
                ? patientAddress.addresses[i].homeNumber
                : null,
              patientId: props.replace?.status ? null : isUpdate,
              moo: patientAddress.addresses[i].moo
                ? patientAddress.addresses[i].moo
                : null,
              soisub: patientAddress.addresses[i].soisub
                ? patientAddress.addresses[i].soisub
                : null,
              road: patientAddress.addresses[i].road
                ? patientAddress.addresses[i].road
                : null,
              villaname: patientAddress.addresses[i].village
                ? patientAddress.addresses[i].village
                : null,
              tambon: patientAddress.addresses[i].parish
                ? patientAddress.addresses[i].parish
                : null,
              amphur: patientAddress.addresses[i].district
                ? patientAddress.addresses[i].district
                : null,
              changwat: patientAddress.addresses[i].province
                ? patientAddress.addresses[i].province
                : null,
              zipcode: patientAddress.addresses[i].zipCode
                ? patientAddress.addresses[i].zipCode
                : null,
              latitude: patientAddress.addresses[i].latitude
                ? patientAddress.addresses[i].latitude
                : null,
              longitude: patientAddress.addresses[i].longitude
                ? patientAddress.addresses[i].longitude
                : null,
              userCreated: user,
              userModified: null,
              countryId: patientAddress.addresses[i].country
                ? patientAddress.addresses[i].country
                : null,
              houseId: null,
              hid: null,
              soimain: patientAddress.addresses[i].soimain
                ? patientAddress.addresses[i].soimain
                : null,
              deleteFlag: null,
              dateDelete: null,
              userDelete: null,
              condo: null,
              roomno: null,
              housetype: null,
              dateCreated: moment().format("DD-MM-YYYY HH:mm:ss"),
              dateModified: null,
            });
          }
        }
        let drug_allergies = {
          patientId: props.replace?.status ? null : isUpdate,
          runHn: hnType === "A" ? null : runHn ? runHn : null,
          yearHn: hnType === "A" ? null : yearHn ? yearHn : null,
          hn:
            props.topBarType === "page 2.6"
              ? patientInfo.hn
              : hnType === "A"
                ? null
                : hn,
          symptom: patientInfo.drugAllergy ? patientInfo.drugAllergy : null,
          otherSymptom: patientInfo.otherAllergic
            ? patientInfo.otherAllergic
            : null,
          userCreated: user,
          userModified: user,
          // runHn: runHn ? runHn : null,
          // yearHn: yearHn ? yearHn : null,
          // hn: hn ? hn : null,
          generic: null,
          // "typedx": null,
          // "alevel": null,
          // "informuser": null,
          // "informant": null,
          // "informhosp": null,
          // "lockFlag": null,
          // "dateCreated": null,
          // "dateModified": null,
          // "mapping1": null,
        };

        let underlying_diseases = {
          patientId: null,
          // RunHn: runHn ? runHn : null,
          // yearHn: yearHn ? yearHn : null,
          // hn: hn ? hn : null,

          runHn: hnType === "A" ? null : runHn ? runHn : null,
          yearHn: hnType === "A" ? null : yearHn ? yearHn : null,
          hn:
            props.topBarType === "page 2.6"
              ? patientInfo.hn
              : hnType === "A"
                ? "A"
                : hn,
          udId: null,
          // "udId": props.prevPatientsUnderlyingDiseasesById ? props.prevPatientsUnderlyingDiseasesById.ptUdId ? props.prevPatientsUnderlyingDiseasesById.ptUdId : null : null,
          informant: null,
          informhosp: null,
          userCreated: user,
          dateCreated: null,
          userModified: user,
          dateModified: null,
        };
        let valueAll = {
          mode: null,
          user: null,
          ip: null,
          lang: null,
          branch_id: null,
          requestData: {
            patients: patients,
            patient_pictures: patient_pictures,
            patient_address: patient_address,
            drug_allergies: drug_allergies,
            underlying_diseases: underlying_diseases,
          },
          barcode: null,
        };

        result = await InsPatientsFetch(valueAll);
        console.log("API Response:", result);
        if (result) {
          props.reloadPage({
            patientId: result?.patientId,
            type: "Replace",
            result: result,
          });
        }
      };
      const UpdatePatient = async () => {
        if (!patients?.hn) {
          patients.hn = patients.hn || "U";
          patients.yearHn = moment().format("YY");
        }
        if (props.preRegister) {
          patients.preHnFlag = "Y";
          patients.hn = null;
          patients.runHn = null;
          patients.yearHn = null;
        }
        if (patientAddress.addresses) {
          for (let i = 0; i < patientAddress.addresses?.length; i++) {
            let addressId = patientAddress?.addresses[i]?.addressId
              ? patientAddress.addresses[i].addressId + ""
              : "";
            let patient_address = {
              mode: null,
              user: null,
              ip: null,
              lang: null,
              branch_id: null,
              requestData: {
                addressId: addressId === "" ? null : addressId,
                addressType: patientAddress?.addresses[i]?.addressType
                  ? patientAddress.addresses[i].addressType
                  : "",
                addressNo: patientAddress?.addresses[i]?.homeNumber
                  ? patientAddress.addresses[i].homeNumber
                  : "",
                patientId: props?.isUpdate ? isUpdate : "",
                hid: null,
                moo: patientAddress?.addresses[i]?.moo
                  ? patientAddress.addresses[i].moo
                  : "",
                soisub: patientAddress?.addresses[i]?.soisub
                  ? patientAddress.addresses[i].soisub
                  : "",
                soimain: patientAddress.addresses[i].soimain
                  ? patientAddress.addresses[i].soimain
                  : null,
                road: patientAddress?.addresses[i]?.road
                  ? patientAddress.addresses[i].road
                  : "",
                villaname: patientAddress?.addresses[i]?.village
                  ? patientAddress.addresses[i].village
                  : "",
                tambon: patientAddress?.addresses[i]?.parish
                  ? patientAddress.addresses[i].parish
                  : "",
                amphur: patientAddress?.addresses[i]?.district
                  ? patientAddress.addresses[i].district
                  : "",
                changwat: patientAddress?.addresses[i]?.province
                  ? patientAddress.addresses[i].province
                  : "",
                zipcode: patientAddress?.addresses[i]?.zipCode
                  ? patientAddress.addresses[i].zipCode
                  : "",
                latitude: patientAddress?.addresses[i]?.latitude
                  ? patientAddress.addresses[i].latitude
                  : "",
                longitude: patientAddress?.addresses[i]?.longitude
                  ? patientAddress.addresses[i].longitude
                  : "",
                userCreated: user,
                dateCreated:
                  addressId === ""
                    ? moment()
                    : patientAddress?.addresses[i]?.dateCreated
                      ? patientAddress.addresses[i].dateCreated
                      : "",
                userModified: user,
                dateModified:
                  addressId === ""
                    ? null
                    : patientAddress?.addresses[i]?.dateModified
                      ? patientAddress.addresses[i].dateModified
                      : "",
                deleteFlag: null,
                dateDelete: null,
                userDelete: null,
                countryId: patientAddress?.addresses[i]?.country
                  ? patientAddress.addresses[i].country
                  : "",
                houseId: null,
                condo: null,
                roomno: null,
                housetype: null,
                // moment().format("DD-MM-YYYY HH:mm:ss"),
              },

              barcode: null,
            };
            if (addressId === "") {
              // Insert ==================================================
              resultAddressInsert = await SavePatientAddressById(
                patient_address
              );
            } else {
              // Update ==================================================
              resultAddressUpdate = await UpdPatientAddress(patient_address);
            }
          }
        }
        if (personal?.Picture) {
          let pictureValues = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
              patientId: message,
              picture: personal?.Picture.split(",")[1],
              mimeType: null,
              userCreated: base64Img?.userCreated,
              dateCreated: base64Img?.dateCreated,
              userModified: user,
              dateModified: moment(),
            },
            barcode: null,
          };
          await UpdPatientPicture(pictureValues);
        }
        if (base64Img && !personal?.Picture) {
          let pictureValues = {
            mode: null,
            user: null,
            ip: null,
            lang: null,
            branch_id: null,
            requestData: {
              patientId: base64Img.patientId,
              picture: base64Img.picture,
              mimeType: null,
              userCreated: base64Img?.userCreated,
              dateCreated: base64Img?.dateCreated,
              userModified: user,
              dateModified: moment(),
            },
            barcode: null,
          };
          await UpdPatientPicture(pictureValues);
        }
        result = await UpdPatient({
          mode: null,
          user: null,
          ip: null,
          lang: null,
          branch_id: null,
          requestData: patients,
          barcode: null,
        });
        props.reloadPage({
          patientId: isUpdate,
          type: null,
          result: result,
          reloadAddress: resultAddressInsert,
        });
      };
      if (hnType === "A") {
        InsertPatient();
      }
      if (hnType === "U") {
        UpdatePatient();
      }
      props?.setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const getAddressInfo = (key, type) => {
    let data = addressInfo.filter((val) => val.id === key);
    if (data) {
      if (type === "isEdit") {
        return data[0]?.isEdit;
      } else if (type === "address") {
        const convertAddress = data[0]?.address;
        if (convertAddress) {
          let newText =
            (convertAddress[0] ? convertAddress[0] + " " : "") +
            (convertAddress[1]
              ? "หมู่บ้าน/อาคาร " + convertAddress[1] + " "
              : "") +
            (convertAddress[2] ? "หมู่ " + convertAddress[2] + " " : "") +
            // (convertAddress[3] ? "ซอย " + convertAddress[3] + " " : "") +
            // (convertAddress[4] ? "แยก " + convertAddress[4] + " " : "") +
            (convertAddress[5] ? "ถนน " + convertAddress[5] + " " : "") +
            (convertAddress[6] ? "เเขวง/ตำบล " + convertAddress[6] + " " : "") +
            (convertAddress[7] ? "เขต/อำเภอ " + convertAddress[7] + " " : "") +
            (convertAddress[8] ? "จังหวัด " + convertAddress[8] + " " : "") +
            (convertAddress[9]
              ? "รหัสไปรษณีย์ " + convertAddress[9] + " "
              : "");

          return newText.replaceAll("undefined", "");
        }
      } else if (type === "addressType") {

        return data[0]?.addressType;
      } else if (type === "addressId") {
        return data[0]?.addressId;
      }
    }
  };
  const detectPatientName = () => {
    props.detectPatientName(
      firstNameRef.current.input.value,
      lastNameRef.current.input.value
    );
  };
  // console.log(thaiIdCard.generate());
  const idCardVerifyNoRequired = async (_, value) => {
    let idCard = value;
    if (!idCard) {
      return Promise.resolve();
    }
    if (idCard) {
      if (thaiIdCard.verify(idCard)) {
        return Promise.resolve();
      }
    }
    return Promise.reject(new Error("Format ไม่ถูกต้อง!"));
  };
  const idCardVerifyNoRequiredPatient = async (_, value) => {
    let idCard = value;
    if (!idCard) {
      return Promise.resolve();
    }
    if (idCard) {
      if (idCard === prevIdCard) {
        return Promise.resolve();
      } else {
        if (thaiIdCard.verify(idCard)) {
          let res = await axios
            .get(
              `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsByIdCard/${idCard}`
            )
            .then(({ data }) => {
              // console.log("test",data.responseData)
              if (data.responseData.length > 0) {
                return Promise.reject(new Error("เลขบัตรซ้ำ กรุณาระบุใหม่!"));
              } else {
                getCheckRight(idCard);
                return Promise.resolve();
              }
            });
          return res;
        }
      }
    }
    return Promise.reject(new Error("Format ไม่ถูกต้อง!"));
  };

  const onBirthdate = (value) => {
    const resDate = null;
    if (resDate || true) {
      setAge(calculateAge(moment(resDate).format("YYYY-MM-DD"), value));
    } else {
      setAge({
        ageDay: null,
        ageMonth: null,
        ageYear: null,
        ageFull: "0Y 0M 0D",
      });
    }
  };

  const genBirthdate = (value, field) => {
    let newAge = age;
    let diff = null;
    value = value ? value : 0;
    if (field === "years") {
      if (value >= 0 && value <= 120) {
        diff = age.ageYear - value;
        newAge.ageYear = value;
      }
    }

    if (field === "months") {
      if (value >= 0 && value <= 12) {
        diff = age.ageMonth - value;
        newAge.ageMonth = value;
      }
    }
    if (field === "days") {
      if (value >= 0 && value <= 31) {
        diff = age.ageDay - value;
        newAge.ageDay = value;
      }
    }
    let newBirthdate = null;
    newBirthdate = birthdate
      ? birthdate.format("DD/MM/YYYY").split("/")
      : moment().format("DD/MM/YYYY").split("/");
    newBirthdate =
      newBirthdate[0] +
      "/" +
      newBirthdate[1] +
      "/" +
      (Number(newBirthdate[2]) - 543);
    let resDate = moment(newBirthdate, "DD/MM/YYYY")
      .add(Number(diff), field)
      .format("DD/MM/YYYY");
    let tempDate = resDate.split("/");
    tempDate =
      tempDate[0] +
      "/" +
      tempDate[1] +
      "/" +
      (birthdate ? Number(tempDate[2]) + 543 : Number(tempDate[2]) + 543 + 543);
    resDate = tempDate;
    setBirthdate(moment(resDate));
    if (!newAge.ageYear) {
      newAge.ageYear = 0;
    }
    if (!newAge.ageMonth) {
      newAge.ageMonth = 0;
    }
    if (!newAge.ageDay) {
      newAge.ageDay = 0;
    }
    let newDate = moment();
    newDate.subtract(newAge.ageYear, "years");
    newDate.subtract(newAge.ageMonth, "months");
    newDate.subtract(newAge.ageDay, "days");
    form.setFieldsValue({
      birthdate: newDate,
    });
  };

  const genTopBar = () => {
    if (isUpdate) {
      return (
        <>
          <Popconfirm
            placement="top"
            title={"ต้องการสร้างประวัติใหม่ไหม"}
            onConfirm={() => props.handleCreateNewPatient()}
          >
            <Button
              style={{
                width: "122px",
              }}
              type="primary"
            >
              สร้างผู้ป่วยใหม่
            </Button>
          </Popconfirm>
          {props.topBarType === "page 2.1" ? (
            <>
              <Popconfirm
                title="คุณต้องการบันทึกหรือไม่"
                okText="ใช่"
                cancelText="ไม่"
                onConfirm={() => {
                  setCheckGotoRightPage(true);
                  patientInfoContactAddressRef.current = true;
                  formAddressFail.submit();
                  form.submit();
                  formSubmitType.current = {
                    req: "save all",
                    id: null,
                  };
                  delAddressList(delAddress);
                }}
                onCancel={() => {
                  history.push({
                    pathname: "/registration/registration-patient-visit",
                  });
                }}
              >
                <Button
                  style={{
                    width: "122px",
                  }}
                  type="primary"
                >
                  เพิ่มสิทธิ์/visit
                </Button>
              </Popconfirm>

              {/* <Button
                style={{ width: "122px" }}
                type="primary"
                onClick={() => setShowOpdCardFailModal(true)}
               >
                ล้มเเฟ้ม
               </Button> */}
              <Dropdown overlay={menuDropFolder}>
                <Button
                  style={{
                    width: "122px",
                  }}
                  type="primary"
                >
                  <Space>
                    ล้มเเฟ้ม
                    {/* <DownOutlined /> */}
                  </Space>
                </Button>
              </Dropdown>
            </>
          ) : (
            []
          )}
          <PrintFormReport
            style={{
              width: "122px",
            }}
            className="btn-custom-bgcolor"
            number={null}
          />
          {/* <Button
                        className="btn-custom-bgcolor"
                        style={{ width: "122px" }}
                        type="default"
                    >
                        พิมพ์
                    </Button> */}
        </>
      );
    }
  };

  // ========================================================================================
  const [changwat, setChangwat] = useState([]); // จังหวัด
  const [amphur, setAmphur] = useState([]); // อำเภอ array 2d
  const [tambon, setTambon] = useState([]); // ตำบล array 2d

  const changeAddressInfo = (e, index, fieldKey) => {
    let newAddressInfo = addressInfo
      ? addressInfo
      : [
        {
          id: addressInfo[index].id,
          isEdit: addressInfo[index]?.isEdit,
          address: ["", "", "", "", "", "", "", "", "", "", ""],
          addressType: addressInfo[index]?.addressType,
          lat: addressInfo[index].lat,
          lng: addressInfo[index].lng,
          mapIsOpen: addressInfo[index].mapIsOpen,
        },
      ];

    let addressIndex = 0;
    switch (fieldKey) {
      case "homeNumber":
        addressIndex = 0;
        break;
      case "village":
        addressIndex = 1;
        break;
      case "moo":
        addressIndex = 2;
        break;
      case "soisub":
        addressIndex = 3;
        break;
      case "soimain":
        addressIndex = 4;
        break;
      case "road":
        addressIndex = 5;
        break;
      case "parish":
        addressIndex = 6;
        break;
      case "district":
        addressIndex = 7;
        break;
      case "province":
        addressIndex = 8;
        break;
      case "zipCode":
        addressIndex = 9;
        break;
      case "longitude":
        addressIndex = 10;
        break;
      case "latitude":
        addressIndex = 11;
        break;
      default:
        break;
    }
    newAddressInfo[index].address[addressIndex] = e.target.value;
    setAddressInfo(newAddressInfo);
  };

  const autoSelectAddress = async (typeId, code, fieldKey, typeName) => {
    if (code) {
      const result = await getAddressMasterFetch(typeId, code);
      if (result) {
        setChangwat(result.masterDataChangwat ? result.masterDataChangwat : []);
        // setAmphur(result.masterDataAmphur ? result.masterDataAmphur : []);
        setAmphur((prev) => {
          prev[fieldKey] =
            result.masterDataAmphur && typeId !== "A" && typeId !== "T"
              ? result.masterDataAmphur
              : amphur[fieldKey] || result.masterDataAmphur;
          return prev;
        });
        // setTambon((result.masterDataTambon && typeId !== 'T') ? result.masterDataTambon : tambon || []);
        setTambon((prev) => {
          prev[fieldKey] =
            result.masterDataTambon && typeId !== "T"
              ? result.masterDataTambon
              : tambon[[fieldKey]] || [];
          return prev;
        });

        if (typeId === "T") {
          addressInfo[fieldKey].address[6] =
            result?.masterDataTambon[0]?.datadisplay;
          addressInfo[fieldKey].address[9] = result?.masterDataTambon[0]
            ?.dataother2
            ? result?.masterDataTambon[0]?.dataother2
            : "";
        }

        if (typeId === "T" || typeId === "A") {
          addressInfo[fieldKey].address[7] =
            result?.masterDataAmphur[0]?.datadisplay;
        }
        addressInfo[fieldKey].address[8] =
          result?.masterDataChangwat[0]?.datadisplay;

        let tempLocalAddress = formAddressFail
          .getFieldValue()
          .addresses.map((val,) => {
            return val.key === fieldKey
              ? {
                addressId: val.addressId,
                addressType: val.addressType,
                country: val.country,
                homeMap: val.homeMap,
                key: val.key,
                homeNumber: val.homeNumber,
                village: val.village,
                moo: val.moo,
                soisub: val.soisub,
                soimain: val.soimain,
                road: val.road,
                parish:
                  typeId === "C" || typeId === "A" // เเขวง/ตำบล
                    ? null
                    : result.masterDataTambon?.length > 0
                      ? result.masterDataTambon[0]?.datavalue
                      : null,
                district:
                  typeId === "C" // เขต/อำเภอ
                    ? null
                    : result.masterDataAmphur?.length > 0
                      ? result.masterDataAmphur[0]?.datavalue
                      : null,
                province:
                  result.masterDataChangwat?.length > 0 &&
                  // จังหวัด
                  result.masterDataChangwat[0]?.datavalue,
                zipCode:
                  typeId === "T" // เเขวง/ตำบล
                    ? result.masterDataTambon?.length > 0
                      ? result.masterDataTambon[0]?.dataother2
                      : null
                    : val.zipCode,
                longitude: val.longitude,
                latitude: val.latitude,
              }
              : val;
          });
        formAddressFail.setFieldsValue({
          addresses: tempLocalAddress,
        });
      }
    } else {
      if (props.apiData) {
        if (typeId === "C") {
          let changwatList = props.apiData.changwatList;
          setChangwat(changwatList);
          addressInfo[fieldKey].address[7] = changwatList[0]?.datadisplay;
        }
        if (typeId === "A") {
          if (formAddressFail.getFieldValue().addresses[fieldKey].province) {
            const result = await getAddressMasterFetch(
              "C",
              formAddressFail.getFieldValue().addresses[fieldKey].province
            );
            setAmphur((prev) => {
              prev[fieldKey] =
                result.masterDataAmphur && typeId !== "A" && typeId !== "T"
                  ? result.masterDataAmphur
                  : amphur[fieldKey] || [];
              return prev;
            });
            addressInfo[fieldKey].address[7] =
              result?.masterDataAmphur[0]?.datadisplay;
          } else {
            let amphurList = props.apiData.amphurList;
            setAmphur((prev) => {
              prev[fieldKey] = props.apiData.amphurList;
              return prev;
            });
            addressInfo[fieldKey].address[7] = amphurList?.datadisplay;
          }
        }
        if (typeId === "T") {
          if (formAddressFail.getFieldValue().addresses[fieldKey].district) {
            const result = await getAddressMasterFetch(
              "A",
              formAddressFail.getFieldValue().addresses[fieldKey].district
            );
            setTambon((prev) => {
              prev[fieldKey] =
                result.masterDataTambon && typeId !== "T"
                  ? result.masterDataTambon
                  : tambon[[fieldKey]] || [];
              return prev;
            });
            addressInfo[fieldKey].address[6] =
              result?.masterDataChangwat[0]?.datadisplay;
          } else if (
            formAddressFail.getFieldValue().addresses[fieldKey].province
          ) {
            const result = await getAddressMasterFetch(
              "C",
              formAddressFail.getFieldValue().addresses[fieldKey].province
            );
            // setTambon(result.masterDataTambon ? result.masterDataTambon : []);
            setTambon((prev) => {
              prev[fieldKey] =
                result.masterDataTambon && typeId !== "T"
                  ? result.masterDataTambon
                  : tambon[[fieldKey]] || [];
              return prev;
            });
            addressInfo[fieldKey].address[6] =
              result?.masterDataChangwat[0]?.datadisplay;
          } else {
            let tambonList = props.apiData.tambonList;
            setTambon((prev) => {
              prev[fieldKey] = tambonList;
              return prev;
            });
            addressInfo[fieldKey].address[6] = tambonList?.datadisplay;
          }
        }
      }
    }
  };

  const onFinishFailed = () => {
    Modal.warning({
      title: "กรุณากรอกข้อมูลให้ครบ!",
    });
  };

  const delAddressList = async (arr) => {
    for (let val of arr) {
      val.patientId = message;
      val.deleteFlag = "Y";
      val.dateCreated = moment(val.dateCreated, "MM/DD/YYYY HH:mm:ss").format(
        "BBBB-MM-DD HH:mm:ss"
      );
      val.dateModified = moment(val.dateModified, "MM/DD/YYYY HH:mm:ss").format(
        "BBBB-MM-DD HH:mm:ss"
      );
      val.dateDelete = moment().format("BBBB-MM-DD HH:mm:ss");
      val.userDelete = user;
      let req = {
        mode: null,
        user: null,
        ip: null,
        lang: null,
        branch_id: null,
        requestData: val,
        barcode: null,
      };
      await DelPatientAddress(req);
    }
  };
  const showModalDiedFlag = () => {
    Modal.error({
      centered: true,
      title: "ผู้ป่วยท่านนี้เสียชีวิตแล้ว!",
      // content: 'some messages...some messages...',
    });
  };

  useEffect(() => {
    console.log("Prev Patient Data:", props.prevPatientData);
  }, [props.prevPatientData]);

  useEffect(() => {
    momentTH();
    setLoading(true);

    const prefixes = ["นาย", "นาง", "นางสาว", "ด.ช.", "ด.ญ.", "น.ส."];

    const prefixdata = Array.isArray(props.prevPatientData?.datadisplay)
      ? props.prevPatientData.datadisplay
      : [props.prevPatientData?.datadisplay || ""];

    const fatherName = props.prevPatientData ? props.prevPatientData.fatherName : "";
    let fatherFirstName = "";
    let fatherLastName = "";
    if (fatherName && prefixes.length > 0) {
      let nameWithoutPrefix = fatherName.trim(); // ตัดช่องว่างหน้าหลังของ fatherName

      // สร้าง Regular Expression สำหรับคำนำหน้าแต่ละตัว
      prefixes.forEach((prefix) => {
        // ใช้ regular expression เพื่อตรวจสอบคำนำหน้าและลบออก
        const regex = new RegExp(`^${prefix.trim()}\\s*`);  // ^ เพื่อเริ่มต้นที่คำนำหน้า และ \s* เพื่อตัดช่องว่างที่ตามมา
        nameWithoutPrefix = nameWithoutPrefix.replace(regex, "").trim();
      });

      // แยกชื่อและนามสกุล
      const nameParts = nameWithoutPrefix.split(" ");

      if (nameParts.length > 1) {
        fatherFirstName = nameParts.slice(0, nameParts.length - 1).join(" ");  // ชื่อ
        fatherLastName = nameParts[nameParts.length - 1];  // นามสกุล
      } else {
        fatherFirstName = nameParts[0];  // กรณีมีแค่ชื่อเดียว
      }
    }

    const motherName = props.prevPatientData ? props.prevPatientData.motherName : "";
    let motherFirstName = "";
    let motherLastName = "";
    if (motherName) {
      // ตัดคำนำหน้าออกจาก motherName
      let nameWithoutPrefix = motherName;
      prefixes.forEach((prefix) => {
        if (motherName.startsWith(prefix)) {
          nameWithoutPrefix = motherName.replace(prefix, "").trim(); // ลบคำนำหน้าออก
        }
      });

      // แยกชื่อและนามสกุล
      [motherFirstName, motherLastName] = nameWithoutPrefix.split(" ");
    }

    // setdefault เสียชีวิต?
    if (props.prevPatientData) {
      setAge(
        calculateAge(
          moment(props.prevPatientData.birthdate).format("YYYY-MM-DD")
        )
      );
    }
    if (props?.prevPatientData?.diedFlag === "Y" || props?.prevPatientData?.familyDcStatus === '1') {
      showModalDiedFlag();
    }
    setDiedFlag(
      props.prevPatientData
        ? props.prevPatientData.diedFlag === "Y"
          ? true
          : false
        : false
    );
    setIsHideName(
      props.prevPatientData
        ? props.prevPatientData.aliasName
          ? true
          : false
        : false
    );

    // setdefault age
    if (isUpdate) {
      if (props.prevPatientData) {
        props.prevPatientData.birthdate
          ? setAge(calculateAge(props.prevPatientData.birthdate))
          : setAge({
            ageDay: null,
            ageMonth: null,
            ageYear: null,
            ageFull: "0Y 0M 0D",
          });
      }
    }
    setBase64Img({
      patientId: props.prevPatientPicture
        ? props.prevPatientPicture.patientId
        : null,
      picture: props.prevPatientPicture
        ? props.prevPatientPicture.picture
        : null,
      dateCreated: props.prevPatientPicture
        ? props.prevPatientPicture.dateCreated
        : null,
      dateModified: props.prevPatientPicture
        ? props.prevPatientPicture.dateModified
        : null,
      mimeType: props.prevPatientPicture
        ? props.prevPatientPicture.mimeType
        : null,
      userCreated: props.prevPatientPicture
        ? props.prevPatientPicture.userCreated
        : null,
      userModified: props.prevPatientPicture
        ? props.prevPatientPicture.userModified
        : null,
    });
    if (props.prevPatientData?.birthdate) {
      setBirthdate(
        moment(props.prevPatientData.birthdate, "MM/DD/YYYY HH:mm:ss")
      );
    }
    form.setFieldsValue({
      alias: props.prevPatientData
        ? props.prevPatientData.aliasName
          ? props.prevPatientData.aliasName
          : ""
        : "",
      // นามเเฝง
      bloodGroup: props.prevPatientData
        ? props.prevPatientData.bloodGroup
          ? props.prevPatientData.bloodGroup
          : null
        : null,
      // หมู่โลหิต
      cardNumberID: props.prevPatientData
        ? props.prevPatientData.idCard
          ? props.prevPatientData.idCard
          : ""
        : "",
      // เลขบัตรประชาชน
      // ethnicity: props.prevPatientData
      //   ? props.prevPatientData.ethnicityId
      //     ? props.prevPatientData.ethnicityId
      //     : ""
      //   : "", // เชื้อชาติ
      firstNameENG: props.prevPatientData
        ? props.prevPatientData.eFirstName
          ? props.prevPatientData.eFirstName
          : ""
        : "",
      // First Name
      firstNameTH: props.prevPatientData
        ? props.prevPatientData.firstName
          ? props.prevPatientData.firstName
          : ""
        : "",
      // ชื่อ
      gender: props.prevPatientData
        ? props.prevPatientData.gender
          ? props.prevPatientData.gender
          : ""
        : "",
      // เพศ
      lastNameENG: props.prevPatientData
        ? props.prevPatientData.eLastName
          ? props.prevPatientData.eLastName
          : ""
        : "",
      // Last Name
      lastNameTH: props.prevPatientData
        ? props.prevPatientData.lastName
          ? props.prevPatientData.lastName
          : ""
        : "",
      // นามสกุล
      maritalStatus: props.prevPatientData
        ? props.prevPatientData.maritalStatusId
          ? props.prevPatientData.maritalStatusId
          : ""
        : "",
      // สถานะภาพสมรส
      // nationality: props.prevPatientData
      //   ? props.prevPatientData.nationalityId
      //     ? props.prevPatientData.nationalityId
      //     : ""
      //   : "", // สัญชาติ
      nickname: props.prevPatientData
        ? props.prevPatientData.nickName
          ? props.prevPatientData.nickName
          : ""
        : "",
      // ชื่อเล่น
      passport: props.prevPatientData
        ? props.prevPatientData.passport
          ? props.prevPatientData.passport
          : ""
        : "",
      // Passport
      prefixENG: props.prevPatientData
        ? props.prevPatientData.titleId
          ? props.prevPatientData.titleId
          : ""
        : "",
      // Title
      prefixTH: props.prevPatientData
        ? props.prevPatientData.titleId
          ? props.prevPatientData.titleId
          : ""
        : "",
      // คำนำหน้าชื่อ
      // religion: props.prevPatientData
      //   ? props.prevPatientData.religionId
      //     ? props.prevPatientData.religionId
      //     : ""
      //   : "", // ศาสนา
      rh: props.prevPatientData
        ? props.prevPatientData.bloodRh
          ? props.prevPatientData.bloodRh
          : ""
        : "",
      // Rh

      laborType: props.prevPatientData
        ? props.prevPatientData.laborTypeId
          ? props.prevPatientData.laborTypeId
          : ""
        : "",
      // ประเภทต่างด้าว
      familyDcStatus: props.prevPatientData
        ? props.prevPatientData.familyDcStatus
          ? props.prevPatientData.familyDcStatus
          : ""
        : "",
      // สถานะจำหน่าย
      occupation: props.prevPatientData
        ? props.prevPatientData.occupationId
          ? props.prevPatientData.occupationId
          : ""
        : "",
      // อาชีพ
      clinicalHistory: props.prevPatientData
        ? props.prevPatientData.clinicalHistory
          ? props.prevPatientData.clinicalHistory
          : ""
        : "",
      // ข้อมูลสำคัญทางคลินิก
      socialEconomic: props.prevPatientData
        ? props.prevPatientData.socialEconomic
          ? props.prevPatientData.socialEconomic
          : ""
        : "",
      // เงินเดือน
      communityPosition: props.prevPatientData
        ? props.prevPatientData.communityPosId
          ? props.prevPatientData.communityPosId
          : ""
        : "",

      socialEconomicType: props.prevPatientData
        ? props.prevPatientData.socialEconomicType
          ? props.prevPatientData.socialEconomicType
          : ""
        : "",
      // ตำเเหน่งชุมชน
      education: props.prevPatientData
        ? props.prevPatientData.educationalId
          ? props.prevPatientData.educationalId
          : ""
        : "",
      // การศึกษา
      birthdate: props.prevPatientData
        ? props.prevPatientData.birthdate
          ? moment(props.prevPatientData.birthdate, "MM/DD/YYYY")
          : // .format(
          //     "DD/MM/YYYY"
          //   )
          undefined
        : undefined,
      // วันเกิด
      email: props.prevPatientData
        ? props.prevPatientData.email
          ? props.prevPatientData.email
          : ""
        : "",
      // อีเมล
      employerType: props.prevPatientData
        ? props.prevPatientData.employerTypeId
          ? props.prevPatientData.employerTypeId
          : ""
        : "",
      // ข้อมูลนายจ้าง
      facebookId: props.prevPatientData
        ? props.prevPatientData.facebook
          ? props.prevPatientData.facebook
          : ""
        : "",
      // Facebook
      familyStatus: props.prevPatientData
        ? props.prevPatientData.familyStatus
          ? props.prevPatientData.familyStatus
          : ""
        : "",
      // สถานะในครอบครัว
      fatherAlien: "",
      // checkblok ต่างด้าว
      fatherCardIdNumber: props.prevPatientData
        ? props.prevPatientData.fatherIdCard
          ? props.prevPatientData.fatherIdCard.replaceAll(" ", "")
          : ""
        : "",
      // เลขบัตรประชาชน (บิดา)
      fatherName: props.prevPatientData
        ? props.prevPatientData.fatherName
          ? props.prevPatientData.fatherName
          : ""
        : "",

      fatherFirstName: fatherFirstName || "",
      fatherLastName: fatherLastName || "",
      // ชื่อ-สกุลบิดา
      contactAlien: "",
      // checkblok ต่างด้าว
      contactCardIdNumber: props.prevPatientData
        ? props.prevPatientData.contactIdCard
          ? props.prevPatientData.contactIdCard.replaceAll(" ", "")
          : ""
        : "",
      // เลขบัตรประชาชน (ผู้ติดต่อได้)
      contactMobileNumber: props.prevPatientData
        ? props.prevPatientData.contactMobile
          ? props.prevPatientData.contactMobile
          : ""
        : "",
      //  เบอร์มือถือ (ผู้ติดต่อได้)
      contactName: props.prevPatientData
        ? props.prevPatientData.contactName
          ? props.prevPatientData.contactName
          : ""
        : "",
      // ชื่อ-สกุลผู้ติดต่อได้
      contactRelationship: props.prevPatientData
        ? props.prevPatientData.contactRelation
          ? props.prevPatientData.contactRelation
          : ""
        : "",
      // ความสัมพันธ์
      contactAddress: props.prevPatientData
        ? props.prevPatientData.contactAddress
          ? props.prevPatientData.contactAddress
          : ""
        : "",
      // ที่อยู่ผู้ติดต่อได้
      contactTelephoneNumber: props.prevPatientData
        ? props.prevPatientData.contactTelephone
          ? props.prevPatientData.contactTelephone
          : ""
        : "",
      // เบอร์โทรศัพท์
      disabledType: props.prevPatientData
        ? props.prevPatientData.disabledTypeId
          ? props.prevPatientData.disabledTypeId
          : ""
        : "",
      // ประเภทผู้พิการ
      employerName: props.prevPatientData
        ? props.prevPatientData.employerName
          ? props.prevPatientData.employerName
          : ""
        : "",
      // ข้อมูลนายจ้าง
      workingType: props.prevPatientData
        ? props.prevPatientData.workingType
          ? props.prevPatientData.workingType
          : ""
        : "",
      // ลักษณะการทำงาน
      employerTel: props.prevPatientData
        ? props.prevPatientData.employerTel
          ? props.prevPatientData.employerTel
          : ""
        : "",
      // เบอร์ติดต่อนายจ้าง
      nidCard: props.prevPatientData
        ? props.prevPatientData.nidcard
          ? props.prevPatientData.nidcard
          : ""
        : "",
      // เลขบัตรตนไม่มีสัญชาติไทย
      skin: props.prevPatientData
        ? props.prevPatientData.skin
          ? props.prevPatientData.skin
          : ""
        : "",
      // สีผิว
      surgeryHistory: props.prevPatientData
        ? props.prevPatientData.surgeryHistory
          ? props.prevPatientData.surgeryHistory
          : ""
        : "",
      // ข้อมูลสำคัญทางผ่าตัด
      typeArea: props.prevPatientData
        ? props.prevPatientData.typeArea
          ? props.prevPatientData.typeArea
          : ""
        : "",
      // สถานะบุคคล
      lineId: props.prevPatientData
        ? props.prevPatientData.lineid
          ? props.prevPatientData.lineid
          : ""
        : "",
      // Line ID
      mobileNumber: props.prevPatientData
        ? props.prevPatientData.mobile
          ? props.prevPatientData.mobile
          : ""
        : "",
      // เบอร์มือถือ
      motherAlien: "",
      // checkblok ต่างด้าว
      motherCardIdNumber: props.prevPatientData
        ? props.prevPatientData.motherIdCard
          ? props.prevPatientData.motherIdCard.replaceAll(" ", "")
          : ""
        : "",
      // เลขบัตรประชาชน (มารดา)
      motherName: props.prevPatientData
        ? props.prevPatientData.motherName
          ? props.prevPatientData.motherName
          : ""
        : "",

      motherFirstName: motherFirstName || "",
      motherLastName: motherLastName || "",
      // ชื่อ-สกุลมารดา
      moveInDate: moveinDateisFormat,
      // วันที่ย้ายเข้า
      dischDate: dischDateFormat,
      // วันที่ย้ายออก
      patientType: props.prevPatientData
        ? props.prevPatientData.patientTypeId
          ? props.prevPatientData.patientTypeId
          : ""
        : "",
      // ประเภทผู้ป่วย
      agency: props.prevPatientData
        ? props.prevPatientData.agency
          ? props.prevPatientData.agency
          : ""
        : "",
      // ผู้เเนะนำ
      coupleAlien: "",
      // checkblok ต่างด้าว
      // notAlergicFlag: props?.prevPatientData?.notAlergicFlag || null,
      coupleCardIdNumber: props.prevPatientData
        ? props.prevPatientData.coupleIdCard
          ? props.prevPatientData.coupleIdCard.replaceAll(" ", "")
          : ""
        : "",
      // เลขบัตรประชาชน (คู่สมรส)
      coupleName: props.prevPatientData
        ? props.prevPatientData.coupleName
          ? props.prevPatientData.coupleName
          : ""
        : "",
      // ชื่อ-สกุลคู่สมรส
      telephoneNumber: props.prevPatientData
        ? props.prevPatientData.telephone
          ? props.prevPatientData.telephone
          : ""
        : "",
      // เบอร์โทรศัพท์

      cityOfBirth: props.prevPatientData
        ? props.prevPatientData.cityOfBirth
          ? props.prevPatientData.cityOfBirth
          : ""
        : "",
      //cityOfBirth


      countryBirth: props.prevPatientData
        ? props.prevPatientData.countryBirth
          ? props.prevPatientData.countryBirth
          : ""
        : "",
      // countryBirth

      drugAllergy: props.prevPatientsDrugAllergies
        ? props.prevPatientsDrugAllergies.drugAllergic
          ? props.prevPatientsDrugAllergies.drugAllergic
          : ""
        : "",
      // เเพ้ยา
      otherAllergic: props.prevPatientsDrugAllergies
        ? props.prevPatientsDrugAllergies.otherAllergic
          ? props.prevPatientsDrugAllergies.otherAllergic
          : ""
        : "",
      // เเพ้อื่นๆ
      underlyingDisease: props.prevPatientData?.underlyingDisease, // โรคประจำตัว

      //ตัวเลือกประเภทบัตร
      governmentDocType: props.prevPatientData?.governmentDocType,
      governmentDocNo: props.prevPatientData?.governmentDocNo

    });
    console.log("Father's name:", props.prevPatientData?.fatherFirstName, props.prevPatientData?.fatherLastName);

    if (pathname === "/registration/registration-backward-patient-register") {
      form.setFieldsValue({
        hn,
      });
    }
    if (props.prevPatientAddress?.formData?.length > 0) {
      Promise.all(
        props.prevPatientAddress?.formData?.map((item, index) => {
          return autoSelectAddress("C", item?.province, index, "province");
        })
      ).then(() => {
        setChangwat(props.apiData.changwatList);
        formAddressFail.setFieldsValue({
          addresses: props.prevPatientAddress
            ? props.prevPatientAddress.formData
              ? props.prevPatientAddress.formData
              : undefined
            : undefined, // address group
        });
      });

      formAddressFail.setFieldsValue({
        addresses: props.prevPatientAddress
          ? props.prevPatientAddress.formData
            ? props.prevPatientAddress.formData
            : undefined
          : undefined, // address group
      });
    }

    if (!isUpdate && props.checkCard === false) {
      formAddressFail.setFieldsValue({
        addresses: [],
      });
      countAddressInfoRef.current = Number(countAddressInfoRef.current) + 1;
      onAddAddress();
    }
    if (props.checkCard) {
      let obj = [
        {
          id: 0,
          isEdit: true,
          address: props.prevPatientAddress.addressInfo[0]?.address,
          addressType: "ที่อยู่ตามบัตรประชาชน",
          lat: null,
          lng: null,
          mapIsOpen: false,
        },
      ];
      setAddressInfo(obj);
      countAddressRef.current = 1;
    }
    setLoading(false);
    return () => {
      momentEN();
      if (props?.prevPatientData?.deleteFlag === "Y") {
        dispatch(showMessage(null));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gap 02-264
  useEffect(() => {
    // console.log('hosParam :>> ', hosParam);
    // console.log('nationalityList :>> ', props.apiData.nationalityList);
    let nationalityDefault = find(props.apiData.nationalityList, [
      "dataother1",
      "D",
    ]);
    let ethnicityDefault = find(props.apiData.ethnicityList, [
      "dataother1",
      "D",
    ]);
    let religionDefault = find(props.apiData.religionList, [
      "dataother1",
      "D",
    ]);
    // props.apiData.nationalityList
    form.setFieldsValue({
      nationality: props?.isUpdate
        ? props?.prevPatientData?.nationalityId
        : nationalityDefault?.datavalue || null,
      ethnicity: props?.isUpdate
        ? props?.prevPatientData?.ethnicityId
        : ethnicityDefault?.datavalue || null,
      religion: props?.isUpdate
        ? props?.prevPatientData?.religionId
        : religionDefault?.datavalue || null,
      socialEconomicType: props?.isUpdate
        ? props?.prevPatientData?.socialEconomicType || null
        : "M",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prevPatientData, message, props.apiData]);

  useEffect(() => {
    setChangwat(props.apiData.changwatList);
  }, [props.apiData]);

  const [listCountry, setListCountry] = useState([]);

  useEffect(() => {
    if (props.apiData?.countryList?.length > 0) {
      let temp = filter(
        props.apiData?.countryList,
        (o) => o.cancelFlag !== "Y"
      );
      temp = temp?.map((o) => {
        let code = toNumber(o.mapping1);
        return {
          ...o,
          datavalue: o.countryId,
          code: code,
          datadisplay: String(code) + " " + o.name,
        };
      });
      temp = sortBy(temp, ["code", "asc"]);
      setListCountry(temp);
      // console.log(temp);
    }
  }, [props.apiData?.countryList]);
  // CR
  const notificationX = (type, title, topic, duration = 6) => {
    notification[type ? "success" : "warning"]({
      message: (
        <label
          className={type ? "gx-text-primary fw-bold" : "fw-bold"}
          style={
            type
              ? {
                fontSize: 20,
              }
              : {
                fontSize: 20,
                color: "red",
              }
          }
        >
          {title}
        </label>
      ),
      description: (
        <label
          className={type ? "gx-text-primary fw-bold" : "fw-bold"}
          style={
            type
              ? {
                fontSize: 20,
              }
              : {
                fontSize: 20,
                color: "red",
              }
          }
        >
          {topic ? (
            <label>{topic}</label>
          ) : (
            <label>{type ? "สำเร็จ" : "ไม่สำเร็จ"}</label>
          )}
        </label>
      ),
      duration: duration,
    });
  };
  // กู้คืน HN
  const recoveryHn = async (hn) => {
    setLoading(true);
    if (hn) {
      let req = {
        requestData: {
          hn: hn,
          deleteFlag: null,
          deleteRemark: null,
          userDelete: user,
          delRunHn: null,
          delYearHn: null,
        },
      };
      let res = await RecoveryHn(req);
      notificationX(res?.isSuccess, "กู้คืน HN ผู้ป่วย");
      if (res.isSuccess) {
        props?.getPrevPatientData(props?.prevPatientData?.patientId, () => {
          dispatch(showMessage(props?.prevPatientData?.patientId));
        });
      }
      setLoading(false);
    }
  };

  // console.log(amphur);
  const notAlergicFlag = Form.useWatch("notAlergicFlag", form);
  console.log('notAlergicFlag :>> ', notAlergicFlag);
  const ValueGovernmentDocType = Form.useWatch("governmentDocType", form);
  const findDataDisplay = () => {
    let dataDisplay = props?.apiData?.icdCardTypeList?.find(
      (ele) => ele.datavalue === ValueGovernmentDocType
    );

    return dataDisplay?.datadisplay
  }
  useEffect(() => {
    console.log('props?.prevPatientData :>> ', props?.prevPatientData);
    form.setFieldsValue({
      notAlergicFlag: props?.prevPatientData?.patientId ? props?.prevPatientData?.notAlergicFlag : "W"
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prevPatientsDrugAllergies, props?.prevPatientData]);
  useEffect(() => {
    switch (notAlergicFlag) {
      case "W":
        form.setFieldsValue({
          drugAllergy: null,
        });
        break;
      case "Y":
        form.setFieldsValue({
          drugAllergy: "ไม่มีประวัติแพ้ยา",
        });
        break;
      default:
        form.setFieldsValue({
          drugAllergy: props?.prevPatientData?.drugAllergic,
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notAlergicFlag]);
  const dob = document.querySelector("#DOB");
  if (dob) {
    dob.addEventListener("keyup", (e) => {
      var text = e.target.value;
      // eslint-disable-next-line no-empty
      if (e.key === "Delete" || e.key === "Backspace") {
      } else {
        if (text.length === 2 || text.length === 5) {
          dob.value = text + "/";
        }
      }
    });
  }
  const selectAfter = (
    <Form.Item name="socialEconomicType" noStyle>
      <Select size={size} style={{ width: 70 }} name="socialEconomicType">
        <Option value="D">/วัน</Option>
        <Option value="M">/เดือน</Option>
        <Option value="Y">/ปี</Option>

      </Select>
    </Form.Item>
  )
  const spanPersonalItems = { span: 24, xxl: 4, xl: 4, lg: 6, md: 8, sm: 8, }

  return (
    <Spin spinning={loading}>
      <Row
        gutter={[8, 8]}
        style={{
          position: "sticky",
          top: 104,
          zIndex: 1000,
        }}
      >
        <Col span={8}>
          <BreadcrumbMenu />
        </Col>
        <Col span={16}>
          <div className="breadcrumb-card">
            {props?.prevPatientData?.deleteFlag === "Y" ? (
              <div
                style={{
                  paddingLeft: 22,
                  float: "right",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => {
                    recoveryHn(props?.prevPatientData?.hn);
                  }}
                >
                  กู้คืน HN ผู้ป่วย
                </Button>
              </div>
            ) : (
              <div
                style={{
                  paddingLeft: 22,
                  float: "right",
                }}
              >
                {genTopBar()}
                <Button
                  style={{
                    width: "122px",
                  }}
                  type="primary"
                  onClick={() => {
                    patientInfoContactAddressRef.current = true;
                    formAddressFail.submit();
                    form.submit();
                    formSubmitType.current = {
                      req: "save all",
                      id: null,
                    };
                    delAddressList(delAddress);
                  }}
                // disabled={props?.prevPatientData?.diedFlag === "Y"}
                >
                  บันทึก
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>
      <Form
        labelCol={{
          span: 9,
        }}
        wrapperCol={{
          span: 15,
        }}
        // layout="horizontal"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        name="control-hooks"
        autoComplete="off"
      >
        <div
          style={{
            paddingTop: 15,
            position: "relative",
          }}
        >
          <Card
            size={size}
            style={{
              marginBottom: 0,
              marginTop: -24,
            }}
          >
            {/* Fix Top */}
            <Row
              gutter={[2, 2]}
              style={{
                position: "sticky",
                top: 145,
                zIndex: "1",
                backgroundColor: "white",
              }}
            >
              <Col span={3}>
                <Avatar
                  shape="square"
                  size={85}
                  src={
                    <Image
                      // style={{
                      //   height: 85,
                      // }}
                      src={
                        base64Img.picture
                          ? `data:image/png;base64,${base64Img.picture}`
                          : props.prevPatientPicture
                            ? props.prevPatientPicture
                            : `https://icon-library.com/images/0234605a9c.svg.svg`
                      }
                      alt={base64Img.picture}
                    />
                  }
                />
              </Col>
              <Col span={3}>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "#B5FFB8",
                    borderRadius: 50,
                    width: 32,
                    height: 32,
                    border: "1px solid green",
                    marginLeft: -74,
                    marginTop: 40,
                  }}
                >
                  <Dropdown overlay={menu}>
                    <IoCameraSharp
                      style={{
                        width: 30,
                        height: 30,
                        cursor: "pointer",
                      }}
                      onClick={(e) => e.preventDefault()}
                    />
                  </Dropdown>
                </div>
                {pathname ===
                  "/registration/registration-backward-patient-register" ? (
                  <div
                    style={{
                      marginTop: -31,
                    }}
                  >
                    <label
                      style={{
                        paddingBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                        }}
                      >
                        *{" "}
                      </span>
                      <strong>
                        <label className="gx-text-primary">HN</label>
                      </strong>
                    </label>
                    <Form.Item
                      name="hn"
                      wrapperCol={{
                        span: 24,
                      }}
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกเลข HN",
                        },
                        () => ({
                          async validator(all, values) {
                            if (!values) {
                              return Promise.reject();
                            }
                            if (values && !values.includes("/")) {
                              return Promise.reject("Format ไม่ถูกต้อง");
                            }
                            if (values && values.indexOf("/") === 0) {
                              return Promise.reject("กรุณาใส่ค่าหน้า /");
                            }
                            if (!values?.split("/")[1]) {
                              return Promise.reject("กรุณาใส่ค่าหลัง /");
                            }
                            if (values?.split("/")[1].length !== 2) {
                              return Promise.reject("กรุณาใส่ค่าหลัง / 2หลัก");
                            }
                            if (
                              countBy(values)["/"]
                                ? countBy(values)["/"] > 1
                                  ? true
                                  : false
                                : false
                            ) {
                              return Promise.reject("Format ไม่ถูกต้อง");
                            }
                            if (
                              values?.split("/")[1]
                                ? Number(values.split("/")[1]) >
                                moment().format("YY")
                                : false
                            ) {
                              return Promise.reject(
                                "yearHn ต้องไม่มากกว่าปีปัจจุบัน"
                              );
                            }
                            const data = await CheckHnNumber(values);
                            if (data.returnData === "มี Hn นี้แล้ว") {
                              return Promise.reject("มี Hn นี้แล้ว");
                            }
                            if (data.returnData === "เลข RunHn เกินค่าล่าสุด") {
                              return Promise.reject(
                                `เลข runHn เกินค่าล่าสุด (${data.responseData.runHn})`
                              );
                            }
                            if (data.isSuccess === false) {
                              return Promise.reject(
                                "เลข Hn นี้ ไม่สามารถใช้ได้"
                              );
                            }
                            if (data.returnData === "can save") {
                              return Promise.resolve();
                            }
                          },
                        }),
                      ]}
                    >
                      <Input
                        style={{
                          width: "100%",
                        }}
                        placeholder="เลข HN"
                      ></Input>
                    </Form.Item>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: -70,
                    }}
                  >
                    <p>
                      <strong>
                        <label
                          style={{
                            fontSize: "22px",
                          }}
                          className="gx-text-primary me-2"
                        >
                          HN
                        </label>
                        <label
                          style={{
                            fontSize: "22px",
                          }}
                        >
                          {hn !== "/" ? hn : <>-</>}
                        </label>
                      </strong>
                    </p>
                  </div>
                )}
                <strong>
                  <label className="gx-text-primary">Last Update</label>
                </strong>
                <p className="data-value">
                  {base64Img
                    ? base64Img.dateModified
                      ? moment(base64Img.dateModified).format("DD/MM/") +
                      moment(base64Img.dateModified).format(
                        "YYYY HH:mm:ss น."
                      )
                      : "-"
                    : "-"}
                </p>
              </Col>
              <Col span={18}>
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  labelCol={{ span: 24, }}
                  wrapperCol={{ span: 24, }}
                >
                  <Row gutter={[2, 2]} style={{ flexDirection: "row" }}>
                    <Col xs={12} sm={8} md={6} xl={4} xxl={4}>
                      <Form.Item style={{ margin: 0 }} shouldUpdate={(prev, cur) => prev.prefixENG !== cur.prefixENG}>
                        {() => {
                          return <GenFormItem2
                            name="prefixTH"
                            label="คำนำหน้าชื่อ"
                            required={true}
                            input={<Select
                              size={size}
                              showSearch
                              style={{ width: "100%" }}
                              allowClear={false}
                              dropdownMatchSelectWidth={220}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children
                                  ?.toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0 || false
                              }
                              filterSort={(optionA, optionB) =>
                                optionA.value.length - optionB.value.length
                              }
                              onSelect={(val, option) =>
                                form.setFieldsValue({
                                  prefixENG: val,
                                  gender: !option.gender
                                    ? null
                                    : option.gender === "F" ||
                                      option.gender === "Y"
                                      ? "F"
                                      : option.gender === "M"
                                        ? "M"
                                        : null,
                                })
                              }
                            >
                              {props.apiData
                                ? props.apiData.titleNameList?.map(
                                  (value, index) => {
                                    //console.log("Prefix data:", value);
                                    return (
                                      <Option
                                        key={index}
                                        value={value?.datavalue}
                                        // eslint-disable-next-line react/no-children-prop
                                        children={`${value.datavalue} ${value.datadisplay}`}
                                        gender={value?.dataother2}
                                      >
                                        {`${value.datavalue} ${value.datadisplay}`}
                                      </Option>
                                    )
                                  }
                                )
                                : []}
                            </Select>}
                          />
                        }}
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={8} md={9} xl={6}>
                      <GenFormItem2
                        name="firstNameTH"
                        label="ชื่อ"
                        required={true}
                        input={<Input
                          size={size}
                          ref={firstNameRef}
                          onBlur={() => detectPatientName()}
                        />}
                        maxLength={50}

                      />
                    </Col>
                    <Col xs={12} sm={8} md={9} xl={6}>
                      <GenFormItem2
                        name="lastNameTH"
                        label="นามสกุล"
                        required={true}
                        input={<Input
                          size={size}
                          ref={lastNameRef}
                          onBlur={() => detectPatientName()}
                        />}
                        maxLength={50}
                      />
                    </Col>
                    <Col xs={12} sm={8} md={6} xl={4}>
                      <GenFormItem2
                        name="gender"
                        label="เพศ"
                        required={true}
                        input={<Select
                          size={size}
                          showSearch
                          style={{
                            width: "100%",
                          }}
                          placeholder=""
                          optionFilterProp="children"
                          // onChange={() => form.submit()}
                          filterOption={(input, option) =>
                            option.children
                              ?.toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0 || false
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.value.length - optionB.value.length
                          }
                          allowClear
                        >
                          <Option value="M" name="ชาย">
                            M ชาย
                          </Option>
                          <Option value="F" name="หญิง">
                            F หญิง
                          </Option>
                        </Select>}
                      />
                    </Col>
                    <Col xs={12} sm={8} md={9} xl={4}>
                      <GenFormItem2
                        name="maritalStatus"
                        label="สถานะภาพสมรส"
                        // required={true}
                        input={<Select
                          size={size}
                          showSearch
                          style={{
                            width: "100%",
                          }}
                          placeholder=""
                          optionFilterProp="children"
                          // onChange={() => form.submit()}
                          filterOption={(input, option) =>
                            option.children
                              ?.toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0 || false
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.value.length - optionB.value.length
                          }
                          allowClear
                        >
                          {props.apiData
                            ? props.apiData.maritalStatusList.map(
                              (value, index) => (
                                <Option key={index} value={value?.datavalue}>
                                  {value?.datadisplay}
                                </Option>
                              )
                            )
                            : []}
                        </Select>}
                      />
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
            <GenRow gutter={[2, 2]}>
              <Col span={24}>
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  labelCol={{ span: 24, }}
                  wrapperCol={{ span: 24, }}
                >
                  <GenRow gutter={[2, 2]}>
                    <Col xxl={3} xl={3} lg={4} md={6} sm={8} xs={24}>
                      <GenRow gutter={[2, 2]}>
                        <Col span={24} hidden={!props?.prevPatientData?.isCancer}>
                          <Icon height={25} icon={ribbonIcon} color="pink" />
                        </Col>
                        <Col span={24}>
                          <Checkbox
                            checked={diedFlag}
                            onChange={() => setDiedFlag(!diedFlag)}
                            className={getCheckboxColor("red")}
                          >
                            <p
                              style={{
                                color: "red",
                                fontWeight: "bold",
                              }}
                            >
                              เสียชีวิต?
                            </p>
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <Checkbox
                            checked={isHideName}
                            onChange={(e) => {
                              setIsHideName(!isHideName);
                              if (!e.target.checked) {
                                form.setFieldsValue({
                                  alias: "",
                                });
                              }
                            }}
                          >
                            <p
                              className="gx-text-primary"
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              ปกปิดชื่อ
                            </p>
                          </Checkbox>
                        </Col>
                        <Col span={24}>
                          <div className="ms-4">
                            <VipStatus patientId={props?.prevPatientData?.patientId} sizeStar={65} />
                          </div>
                        </Col>
                      </GenRow>
                    </Col>
                    <Col xxl={21} xl={21} lg={20} md={18} sm={16} xs={24}>
                      <GenRow gutter={[2, 2]}>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="nationality"
                            label="สัญชาติ"
                            // required={true}
                            input={<SelectWithSearchSort
                              size={size}
                              dropdownMatchSelectWidth={300}
                              data={
                                props.apiData
                                  ? props.apiData.nationalityList
                                  : []
                              }
                              optionValue={"datavalue"}
                              label={["datadisplay"]}
                              keys={["datadisplay"]}
                              allowClear={true}
                            />}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="ethnicity"
                            label="เชื้อชาติ"
                            // required={true}
                            input={<Select
                              size={size}
                              showSearch
                              style={{
                                width: "100%",
                              }}
                              placeholder=""
                              optionFilterProp="children"
                              // onChange={() => form.submit()}
                              allowClear
                              dropdownMatchSelectWidth={300}
                            >
                              {props.apiData
                                ? props.apiData.ethnicityList.map(
                                  (value, index) => (
                                    <Option
                                      key={index}
                                      value={value?.datavalue}
                                    >
                                      {value?.datavalue}{" "}
                                      {value?.datadisplay}
                                    </Option>
                                  )
                                )
                                : []}
                            </Select>}
                          />
                        </Col>
                        <Col {...spanPersonalItems} xxl={3} xl={3}>
                          <GenFormItem2
                            name="religion"
                            label="ศาสนา"
                            // required={true}
                            input={<SelectWithSearchSort
                              size={size}
                              dropdownMatchSelectWidth={300}
                              data={
                                props.apiData
                                  ? props.apiData.religionList
                                  : []
                              }
                              optionValue={"datavalue"}
                              label={["datadisplay"]}
                              keys={["datadisplay"]}
                              allowClear={true}
                            />}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="cardNumberID"
                            label="บัตรประชาชน"
                            // required={true}
                            rules={[
                              {
                                validator: hosParam?.checkIDCard
                                  ? idCardVerifyNoRequiredPatient
                                  : false,
                              },
                            ]}
                            input={<Input
                              size={size}
                              maxLength={13}
                              // controls={false}
                              style={{
                                width: "100%",
                              }}
                              // stringMode
                              onKeyPress={(event) => {
                                if (isAlienContact) return;
                                if (!/[0-9]/.test(event.key))
                                  return event.preventDefault();
                              }}
                              onBlur={async (e) => {
                                if (!hosParam?.checkIDCard) {
                                  if (e.target.value) {
                                    await axios
                                      .get(
                                        `${env.REACT_APP_PANACEACHS_SERVER}/api/Patients/GetPatientsByIdCard/${e.target.value}`
                                      )
                                      .then(({ data }) => {
                                        if (data.responseData.length > 0) {
                                          // return Promise.reject(new Error("เลขบัตรซ้ำ กรุณาระบุใหม่!"));
                                          notificationX(
                                            false,
                                            "เลขบัตรซ้ำ กรุณาระบุใหม่!",
                                            " "
                                          );
                                        } else {
                                          getCheckRight(e.target.value);
                                          // return Promise.resolve();
                                        }
                                      });
                                  }
                                }
                              }}
                            />}
                          />
                        </Col>
                        <Col {...spanPersonalItems} xxl={3} xl={3}>
                          <GenFormItem2
                            name="governmentDocType"
                            label="ประเภทบัตร"
                            // required={true}
                            input={<Select
                              size={size}
                              dropdownMatchSelectWidth={300}
                              showSearch
                              style={{
                                width: "100%",
                              }}
                              placeholder=""
                              optionFilterProp="children"
                              allowClear
                            >
                              {props?.apiData
                                ? props?.apiData?.icdCardTypeList?.map(
                                  (value, index) => (
                                    <Option
                                      key={index}
                                      value={value?.datavalue}
                                    >
                                      {value?.datadisplay}
                                    </Option>
                                  )
                                )
                                : []}
                            </Select>}
                          />
                        </Col>
                        <Col {...spanPersonalItems} xxl={3} xl={3}>
                          <GenFormItem2
                            name="governmentDocNo"
                            label={ValueGovernmentDocType ? findDataDisplay() : "-"}
                            // required={true}
                            input={<Input size={size} />}
                          />
                        </Col>
                        <Col {...spanPersonalItems} xxl={3} xl={3}>
                          <GenFormItem2
                            name="bloodGroup"
                            label="หมู่โลหิต"
                            // required={true}
                            input={<Select
                              size={size}
                              dropdownMatchSelectWidth={300}
                              showSearch
                              style={{
                                width: "100%",
                              }}
                              placeholder=""
                              optionFilterProp="children"
                              // onChange={() => form.submit()}
                              allowClear
                            >
                              {props?.apiData
                                ? props?.apiData?.bloodGroupList?.map(
                                  (value, index) => (
                                    <Option
                                      key={index}
                                      value={value?.datavalue}
                                    >
                                      {value?.datadisplay}
                                    </Option>
                                  )
                                )
                                : []}
                            </Select>}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="alias"
                            label="นามเเฝง"
                            // required={true}
                            input={<Input size={size} disabled={isHideName ? false : true} />}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, cur) =>
                              prev.prefixTH !== cur.prefixTH
                            }
                          >
                            {({ getFieldValue }) => {
                              return (
                                <GenFormItem2
                                  name="prefixENG"
                                  label="Title"
                                  // required={true}
                                  initialValue={
                                    getFieldValue("prefixENG")
                                      ? getFieldValue("prefixENG")
                                      : getFieldValue("prefixTH")
                                        ? getFieldValue("prefixTH")
                                        : null
                                  }
                                  input={<Select
                                    size={size}
                                    disabled
                                    showSearch
                                    style={{
                                      width: "100%",
                                    }}
                                    placeholder=""
                                    optionFilterProp="children"
                                    onSelect={(val) =>
                                      form.setFieldsValue({
                                        prefixTH: val,
                                      })
                                    }
                                    allowClear={false}
                                  >
                                    {props.apiData
                                      ? props.apiData.titleNameList.map(
                                        (value, index) => (
                                          <Option
                                            key={index}
                                            value={value?.datavalue}
                                          >
                                            {value?.datavalue}{" "}
                                            {value?.dataother1}
                                          </Option>
                                        )
                                      )
                                      : []}
                                  </Select>}
                                />
                              )
                            }}
                          </Form.Item>

                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="firstNameENG"
                            label="First Name"
                            // required={true}
                            maxLength={50}
                            input={<Input size={size} />}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="lastNameENG"
                            label="Last Name"
                            maxLength={50}
                            // required={true}
                            input={<Input size={size} />}
                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="nickname"
                            label="ชื่อเล่น"
                            maxLength={50}

                            // required={true}
                            input={<Input size={size} />}

                          />
                        </Col>
                        <Col {...spanPersonalItems}>
                          <GenFormItem2
                            name="rh"
                            label="Rh"
                            // required={true}
                            input={<Select
                              size={size}
                              showSearch
                              style={{
                                width: "100%",
                              }}
                              placeholder=""
                              optionFilterProp="children"
                              // onChange={() => form.submit()}
                              allowClear
                            >
                              <Option value="+">+ Positive </Option>
                              <Option value="-">- Negative</Option>
                            </Select>}
                          />
                        </Col>
                      </GenRow>
                    </Col>
                  </GenRow>
                </Form>
              </Col>
            </GenRow>
            <Divider />
            <Row gutter={[2, 2]} align="middle">
              <Col span={12}>
                <label
                  className="gx-text-primary fw-bold"
                  style={{
                    fontSize: 18,
                  }}
                >
                  ประวัติ
                </label>
              </Col>
              <Col span={12} className="text-end">
                {isUpdate ? (
                  <Button
                    size={size}
                    type="primary"
                    style={{
                      margin: 0,
                    }}
                    onClick={() => {
                      setShowModalPatientDetailEdit(true);
                    }}
                  >
                    ประวัติการเเก้ไข
                  </Button>
                ) : (
                  []
                )}
                <Button
                  size={size}
                  className="ms-3"
                  type="primary"
                  style={{
                    margin: 0,
                  }}
                  icon={<FaRegStickyNote />}
                  onClick={() => setEMessageVisible(true)}
                />
                <PatientInfoHistory
                  showModalPatientDetailEdit={showModalPatientDetailEdit}
                  closeModalPatientDetailEdit={() =>
                    setShowModalPatientDetailEdit(false)
                  }
                  patientId={
                    props?.prevPatientData?.patientId
                      ? props?.prevPatientData?.patientId
                      : null
                  }
                />
              </Col>
            </Row>
            <Divider />
            <GenRow>
              <Col span={24} xxl={12} xl={12}
                style={{
                  borderRight: "1px solid #DBDBDB",
                }}
              >
                {/* ----------------------- ข้อมูลทั่วไป */}
                <label className="gx-text-primary fw-bold">
                  ข้อมูลทั่วไป
                </label>
                <GenRow gutter={[2, 2]}>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 12, }}
                      wrapperCol={{ span: 12, }}
                      name="birthdate"
                      label={<label className="gx-text-primary"> วัน/เดือน/ปี เกิด</label>}
                    >
                      <DatepickerWithForm
                        size={size}
                        birthDateRef={birthDateRef}
                        id="DOB"
                        form={form}
                        name={"birthdate"}
                        format={"DD/MM/YYYY"}
                        style={{
                          width: "100%",
                        }}
                        // defaultValue={moment("01/01/" + moment().format("BBBB"))}
                        placeholder={"XX/XX/XXXX"}
                        onChange={(value) => {
                          // console.log(value.format("DD/MM/YYYY"));
                          setBirthdate(value);
                          clearTimeout(timer.current);
                          timer.current = setTimeout(() => {
                            onBirthdate(value);
                          }, 100);
                        }}
                        onBlur={() => {
                          setBirthdate(form.getFieldValue().birthdate);
                          clearTimeout(timer.current);
                          timer.current = setTimeout(() => {
                            onBirthdate(form.getFieldValue().birthdate);
                          }, 100);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">อายุ</label>}
                    >
                      <Row gutter={[8, 8]} align="middle">
                        <Col span={8}>
                          <InputNumber
                            size={size}
                            addonAfter="ปี"
                            ref={yearRef}
                            controls={false}
                            value={age.ageYear}
                            style={{
                              width: "100%",
                            }}
                            onChange={(value) => {
                              if (value < 0) {
                                value = 0;
                                yearRef.current.blur();
                              }
                              if (value > 120) {
                                value = 120;
                                yearRef.current.blur();
                              }
                              genBirthdate(value, "years");
                            }}
                          />
                        </Col>
                        <Col span={8}>
                          <InputNumber
                            size={size}
                            addonAfter="เดือน"
                            ref={monthRef}
                            controls={false}
                            value={age.ageMonth}
                            style={{
                              width: "100%",
                            }}
                            onChange={(value) => {
                              if (value < 0) {
                                value = 0;
                                monthRef.current.blur();
                              }
                              if (value > 11) {
                                value = 11;
                                monthRef.current.blur();
                              }
                              genBirthdate(value, "months");
                            }}
                          />
                        </Col>
                        <Col span={8}>
                          <InputNumber
                            size={size}
                            addonAfter="วัน"
                            ref={dayRef}
                            controls={false}
                            value={age.ageDay}
                            style={{
                              width: "100%",
                            }}
                            onChange={(value) => {
                              if (value < 0) {
                                value = 0;
                                dayRef.current.blur();
                              }
                              if (value > 30) {
                                value = 30;
                                dayRef.current.blur();
                              }
                              genBirthdate(value, "days");
                            }}
                          />
                        </Col>
                      </Row>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">จังหวัด</label>}
                      name="cityOfBirth"
                    >
                      <Select
                        size={size}
                        dropdownMatchSelectWidth={300}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        allowClear
                        filterOption={(input, option) =>
                          option.value.toLowerCase().slice(0, 2).includes(input.toLowerCase()) ||
                          option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                      >
                        {changwat?.map(
                          (value, index) => (
                            <Option
                              key={index}
                              value={
                                value?.datavalue
                              }
                              keyword={`${value?.datavalue}${value?.datadisplay}`}
                            >
                              {value?.datadisplay}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">ประเทศ</label>}
                      name="countryBirth"
                    >
                      <Select
                        size={size}
                        dropdownMatchSelectWidth={300}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        allowClear
                        filterOption={(input, option) =>
                          option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }

                      >
                        {listCountry?.map(
                          (value, index) => (
                            <Option
                              key={index}
                              value={
                                value?.datavalue
                              }
                              label={value?.datadisplay}
                            // name={value.datadisplay}
                            >
                              {value?.datadisplay}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">การศึกษา</label>}
                      name="education"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        dropdownMatchSelectWidth={300}
                        allowClear
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                      >
                        {props.apiData
                          ? props.apiData.educationalList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value?.datadisplay}
                              >
                                {value?.datavalue} {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">อาชีพ</label>}
                      name="occupation"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        // onChange={() => form.submit()}
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.other
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                      >
                        {props.apiData
                          ? props.apiData.occupationList.map((value, index) => (
                            <Option
                              key={index}
                              value={value?.datavalue}
                              name={value?.datadisplay}
                              other={value?.dataother1}
                            >
                              {value?.dataother1} - {value?.datadisplay}
                            </Option>
                          ))
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">รายได้</label>}
                      name="socialEconomic"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        addonAfter={selectAfter}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">ประเภทผู้ป่วย</label>}
                      name="patientType"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        // onChange={() => form.submit()}
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                      >
                        {props.apiData
                          ? props.apiData.patientTypeList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value?.datadisplay}
                              >
                                {value.datavalue} - {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">
                        โทรศัพท์
                      </label>}
                      name="telephoneNumber"
                    >
                      <Input
                        size={size}
                        onKeyPress={(event) =>
                          !/[0-9]/.test(event.key) && event.preventDefault()
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">มือถือ</label>}
                      name="mobileNumber"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกเบอร์มือถือ",
                        },
                      ]}
                    >
                      <Input
                        size={size}
                        onKeyPress={(event) =>
                          !/[0-9]/.test(event.key) && event.preventDefault()
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={<label className="gx-text-primary">อีเมล</label>}
                      name="email"
                      rules={[
                        {
                          pattern: emailPattern,
                          message: "กรุณาป้อนอีเมลให้ถูกต้อง!",
                        },
                      ]}
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={
                        <>
                          <FaLine
                            style={{
                              paddingRight: 5,
                              width: 20,
                              height: 20,
                              color: "green",
                            }}
                          />{" "}
                          <label className="gx-text-primary">Line ID</label>
                        </>
                      }
                      name="lineId"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      labelCol={{ span: 9, }}
                      wrapperCol={{ span: 15, }}
                      label={
                        <>
                          <AiOutlineFacebook
                            style={{
                              paddingRight: 5,
                              width: 20,
                              height: 20,
                              color: "blue",
                            }}
                          />{" "}
                          <label className="gx-text-primary">Facebook</label>
                        </>
                      }
                      name="facebookId"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        placeholder="http://facebook.com/"
                      />
                    </Form.Item>
                  </Col>
                </GenRow>
                <Divider />
                {/* ----------------------- ญาติผู้ป่วย */}
                <label className="gx-text-primary fw-bold">ญาติผู้ป่วย</label>
                <GenRow gutter={[2, 2]}>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        บิดา ชื่อ
                      </label>}
                      name="fatherFirstName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={50}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        นามสกุล
                      </label>}
                      name="fatherLastName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={50}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        เลขบัตรประชาชน (บิดา)
                      </label>}
                    >
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "65%",
                          margin: 0
                        }}
                        name="fatherCardIdNumber"
                        rules={[
                          {
                            validator: isAlienFather
                              ? false
                              : idCardVerifyNoRequired,
                          },
                        ]}
                      >
                        <Input
                          size={size}
                          onKeyPress={(event) => {
                            if (isAlienFather) return;
                            if (!/[0-9]/.test(event.key))
                              return event.preventDefault();
                          }}
                          maxLength={13}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "35%",
                          margin: 0
                        }}
                        name="fatherAlien"
                        valuePropName="checked"
                      >
                        <Checkbox
                          className="ms-2"
                          onClick={() => setIsAlienFather(!isAlienFather)}
                        >
                          <label className="gx-text-primary">ต่างด้าว</label>
                        </Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        มารดา ชื่อ
                      </label>}
                      name="motherFirstName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={50}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        นามสกุล
                      </label>}
                      name="motherLastName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={50}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={<label className="gx-text-primary">
                        เลขบัตรประชาชน (มารดา)
                      </label>}
                    >
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "65%",
                          margin: 0,
                        }}
                        name="motherCardIdNumber"
                        rules={[
                          {
                            validator: isAlienMother
                              ? false
                              : idCardVerifyNoRequired,
                          },
                        ]}
                      >
                        <Input
                          size={size}
                          onKeyPress={(event) => {
                            if (isAlienMother) return;
                            if (!/[0-9]/.test(event.key))
                              return event.preventDefault();
                          }}
                          maxLength={13}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "35%",
                          margin: 0
                        }}
                        name="motherAlien"
                        valuePropName="checked"
                      >
                        <Checkbox
                          className="ms-2"
                          onClick={() => setIsAlienMother(!isAlienMother)}
                        >
                          <label className="gx-text-primary">ต่างด้าว</label>
                        </Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={
                        <label className="gx-text-primary">
                          ชื่อ-สกุลคู่สมรส
                        </label>
                      }
                      name="coupleName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={50}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <label className="gx-text-primary">
                          เลขบัตรประชาชน (คู่สมรส)
                        </label>
                      }
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "65%",
                          margin: 0
                        }}
                        name="coupleCardIdNumber"
                        rules={[
                          {
                            validator: isAlienCouple
                              ? false
                              : idCardVerifyNoRequired,
                          },
                        ]}
                      >
                        <Input
                          size={size}
                          onKeyPress={(event) => {
                            if (isAlienCouple) return;
                            if (!/[0-9]/.test(event.key))
                              return event.preventDefault();
                          }}
                          maxLength={13}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "35%",
                          margin: 0
                        }}
                        name="coupleAlien"
                        valuePropName="checked"
                      >
                        <Checkbox
                          className="ms-2"
                          onClick={() => setIsAlienCouple(!isAlienCouple)}
                        >
                          <label className="gx-text-primary">ต่างด้าว</label>
                        </Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={
                        <label className="gx-text-primary">
                          ชื่อ-สกุลผู้ติดต่อได้
                        </label>
                      }
                      name="contactName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <label className="gx-text-primary">
                          เลขบัตรประชาชน (ผู้ติดต่อได้)
                        </label>
                      }
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "65%",
                          margin: 0,
                        }}
                        name="contactCardIdNumber"
                        rules={[
                          {
                            validator: isAlienContact
                              ? false
                              : idCardVerifyNoRequired,
                          },
                        ]}
                      >
                        <Input
                          size={size}
                          onKeyPress={(event) => {
                            if (isAlienContact) return;
                            if (!/[0-9]/.test(event.key))
                              return event.preventDefault();
                          }}
                          maxLength={13}
                        />
                      </Form.Item>
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "35%",
                          margin: 0,
                        }}
                        name="contactAlien"
                        valuePropName="checked"
                      >
                        <Checkbox
                          className="ms-2"
                          onClick={() => setIsAlienContact(!isAlienContact)}
                        >
                          <label className="gx-text-primary">ต่างด้าว</label>
                        </Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      labelCol={{ span: 9 }}
                      wrapperCol={{ span: 15 }}
                      label={
                        <label className="gx-text-primary">
                          โทรศัพท์
                        </label>
                      }
                      style={{
                        marginBottom: 0,
                      }}
                      name="contactTelephoneNumber"
                    >
                      <Input
                        size={size}
                        onKeyPress={(event) =>
                          !/[0-9]/.test(event.key) && event.preventDefault()
                        }
                        maxLength={10}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      labelCol={{ span: 9 }}
                      wrapperCol={{ span: 15 }}
                      style={{ marginBottom: 0 }}
                      name="contactMobileNumber"
                      label={
                        <label className="gx-text-primary">
                          มือถือ
                        </label>
                      }
                    >
                      <Input
                        size={size}
                        onKeyPress={(event) =>
                          !/[0-9]/.test(event.key) && event.preventDefault()
                        }
                        maxLength={10}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={
                        <label className="gx-text-primary">
                          ความสัมพันธ์
                        </label>
                      }
                      name="contactRelationship"
                    >
                      <Select
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        // maxLength={50}
                        options={contactRelationshipList}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={
                        <label className="gx-text-primary">
                          ที่อยู่ผู้ติดต่อได้
                        </label>
                      }
                      style={{
                        marginBottom: 4,
                      }}
                    >
                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "65%",
                          margin: 0
                        }}
                        name="contactAddress"
                      >
                        <TextArea
                          // placeholder="Controlled autosize"
                          autoSize={{
                            minRows: 3,
                            maxRows: 5,
                          }}
                          maxLength={2000}
                        />
                      </Form.Item>

                      <Form.Item
                        style={{
                          display: "inline-block",
                          width: "35%",
                          margin: 0,
                        }}
                        // name="fatherAlien"
                        valuePropName="checked"
                      >
                        <Checkbox
                          className="ms-1"
                          onClick={(e) => {
                            let { checked } = e.target;
                            if (checked) {
                              let currentAddres = addressInfo
                                ? addressInfo?.find(
                                  ({ addressType }) =>
                                    addressType === "ที่อยู่ปัจจุบัน" ||
                                    addressType === "ที่อยู่ตามบัตรประชาชน"
                                )
                                : [];
                              if (currentAddres) {
                                const convertAddress =
                                  currentAddres?.address?.map((item) =>
                                    item.includes("undefined") ? "" : item
                                  );

                                // console.log(
                                //   "convertAddress   =>  ",
                                //   convertAddress.reduce((a, b) => a + ' ' + b)
                                // );

                                let sumWord = convertAddress.reduce(
                                  (a, b) => a + " " + b
                                );
                                form.setFieldsValue({
                                  contactAddress: sumWord,
                                });

                                // let data =  currentAddres?.address?.length >0 ?
                              }
                            }
                          }}
                        >
                          <label className="gx-text-primary">
                            บ้านเดียวกัน?
                          </label>
                        </Checkbox>
                      </Form.Item>
                    </Form.Item>
                  </Col>
                </GenRow>
                <Divider />
                {/* ----------------------- เเพ้ยา/โรคประจำตัว */}
                <label className="gx-text-primary fw-bold">โรคประจำตัว</label>
                <GenRow gutter={[2, 2]}>
                  <Col span={24} className="text-end">
                    <Form.Item
                      style={{ margin: 0 }}
                      name="notAlergicFlag"
                    >
                      <Radio.Group
                        className="ms-2"
                        name="notAlergicFlag"
                        value={notAlergicFlag}
                      >
                        <Radio
                          value={"Y"}
                          onClick={() => {
                            if (notAlergicFlag === "Y") {
                              form.setFieldsValue({
                                notAlergicFlag: null,
                              })
                            }
                          }}
                        >ไม่มีประวัติแพ้ยา</Radio>
                        <Radio
                          value={"W"}
                          onClick={() => {
                            if (notAlergicFlag === "W") {
                              form.setFieldsValue({
                                notAlergicFlag: null,
                              })
                            }
                          }}
                        >ไม่ทราบ</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">เเพ้ยา</label>}
                      name="drugAllergy"
                      rules={[
                        {
                          required: notAlergicFlag === "W",
                          message: "ระบุรายละเอียด"
                        }
                      ]}

                    >
                      <Input
                        size={size}
                        disabled={notAlergicFlag === "Y"}
                        placeholder="ระบุรายละเอียด"
                        style={{
                          width: "100%",
                        }}
                        maxLength={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">เเพ้อื่นๆ</label>}
                      name="otherAllergic"
                    >
                      <Input
                        size={size}
                        placeholder="ระบุรายละเอียด"
                        style={{
                          width: "100%",
                        }}
                        maxLength={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">โรคประจำตัว</label>}
                      name="underlyingDisease"
                    >
                      <Input
                        size={size}
                        disabled
                        style={{
                          width: "100%",
                        }}
                        maxLength={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ข้อมูลสำคัญทางคลินิก
                      </label>}
                      name="clinicalHistory"
                    >
                      <Input
                        size={size}
                        disabled
                        style={{
                          width: "100%",
                        }}
                        maxLength={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ข้อมูลสำคัญทางผ่าตัด
                      </label>}
                      name="surgeryHistory"
                    >
                      <Input
                        size={size}
                        disabled
                        style={{
                          width: "100%",
                        }}
                        maxLength={1000}
                      />
                    </Form.Item>
                  </Col>
                </GenRow>
              </Col>
              <Col span={24} xxl={12} xl={12}>
                {/* ----------------------- ที่อยู่ */}
                <Form
                  layout="horizntal"
                  form={formAddressFail}
                  onFinish={onAddressFinish}
                >
                  <Form.List name="addresses">
                    {(fields, { add, remove }) => (
                      <GenRow>
                        <Col span={12}>
                          <label className="gx-text-primary fw-bold">ที่อยู่</label>
                        </Col>
                        <Col span={6}>
                          <StyledButtonTextField
                            type="text"
                            style={{ backgroundColor: checkPatientIsLocal() ? "#E3B31B" : "#A4A4A4", marginBottom: 0 }}
                          >
                            {`บุคคล${checkPatientIsLocal() ? "ใน" : "นอก"}พื้นที่`}
                          </StyledButtonTextField>
                        </Col>
                        <Col span={6}>
                          <Button
                            style={{
                              float: "right",
                              marginBottom: 0
                            }}
                            type="primary"
                            onClick={() => {
                              add();
                              countAddressInfoRef.current =
                                Number(countAddressInfoRef.current) + 1;
                              onAddAddress();
                            }}
                          // icon={<PlusOutlined />}
                          >
                            เพิ่มที่อยู่
                          </Button>
                        </Col>

                        <Col span={24}>
                          <>
                            {fields?.map(
                              ({ key, name, fieldKey, ...restField }) => (
                                <Space
                                  key={key}
                                  style={{
                                    display: "flex",
                                    marginBottom: 8,
                                  }}
                                  align="baseline"
                                  className="A"
                                >
                                  {addressInfo ? (
                                    <>
                                      {getAddressInfo(key, "isEdit") ? (
                                        <Card
                                          size={size}
                                          title={
                                            <Row>
                                              <Col
                                                span={2}
                                                style={{
                                                  paddingLeft: "5%",
                                                }}
                                              >
                                                <HiLocationMarker
                                                  style={{
                                                    height: 30,
                                                    width: 30,
                                                    color: "red",
                                                  }}
                                                />
                                              </Col>
                                              <Col span={14}>
                                                <strong>
                                                  <label className="gx-text-primary">
                                                    ประเภทที่อยู่{" "}
                                                    {getAddressInfo(
                                                      key,
                                                      "addressType"
                                                    )}
                                                  </label>
                                                </strong>
                                                <p>
                                                  {getAddressInfo(
                                                    key,
                                                    "address"
                                                  )}
                                                </p>
                                              </Col>

                                              <Col span={4}>
                                                {!getAddressInfo(
                                                  key,
                                                  "isEdit"
                                                ) ? (
                                                  <Button
                                                    success
                                                    onClick={() => {
                                                      openEditAddress(key);
                                                    }}
                                                  >
                                                    เเก้ไข
                                                  </Button>
                                                ) : (
                                                  []
                                                )}
                                              </Col>

                                              <Col span={4}>
                                                {isUpdate ? (
                                                  <Button
                                                    danger
                                                    onClick={() => {
                                                      onRemoveAddress(
                                                        key,
                                                        formAddressFail.getFieldValue(
                                                          "addresses"
                                                        )[key]
                                                      );
                                                      remove(name);
                                                    }}
                                                  >
                                                    ลบที่อยู่
                                                  </Button>
                                                ) : (
                                                  []
                                                )}
                                              </Col>
                                            </Row>
                                          }
                                          style={{
                                            marginBottom: 15,
                                          }}
                                          className="address-body-background"
                                        >
                                          <GenRow gutter={[2, 2]}>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                shouldUpdate={(cur, prev) =>
                                                  cur.addresses
                                                    .addressType !==
                                                  prev.addresses.addressType
                                                }
                                                style={{ margin: 0, }}
                                              >
                                                {() => {
                                                  return (
                                                    <Form.Item
                                                      style={{ margin: 0, }}
                                                      label={<label className="gx-text-primary">
                                                        ประเภท
                                                      </label>}
                                                      required
                                                      name={[
                                                        name,
                                                        "addressType",
                                                      ]}
                                                      {...layout}
                                                      {...restField}
                                                      fieldKey={[
                                                        fieldKey,
                                                        "addressType",
                                                      ]}
                                                      rules={[
                                                        {
                                                          required: true,
                                                          message:
                                                            "กรุณากรอก ประเภทที่อยู่",
                                                        },
                                                      ]}
                                                    >
                                                      <Select
                                                        size={size}
                                                        showSearch
                                                        style={{ width: "100%", }}
                                                        placeholder=""
                                                        optionFilterProp="children"
                                                        filterOption={(
                                                          input,
                                                          option
                                                        ) =>
                                                          option.value
                                                            ?.toLowerCase()
                                                            .indexOf(
                                                              input.toLowerCase()
                                                            ) >= 0 ||
                                                          option.name
                                                            ?.toLowerCase()
                                                            .indexOf(
                                                              input.toLowerCase()
                                                            ) >= 0
                                                        }
                                                        filterSort={(
                                                          optionA,
                                                          optionB
                                                        ) =>
                                                          optionA.value
                                                            .length -
                                                          optionB.value
                                                            .length
                                                        }
                                                        allowClear
                                                        onChange={(val) => {
                                                          console.log(val);
                                                          let newAddresses =
                                                            formAddressFail.getFieldValue(
                                                              "addresses"
                                                            );
                                                          newAddresses[
                                                            name
                                                          ].addressType =
                                                            val;
                                                          formAddressFail.setFieldsValue(
                                                            newAddresses
                                                          );
                                                        }}
                                                        dropdownMatchSelectWidth={300}
                                                      >
                                                        {addressTypeList.map(
                                                          (
                                                            value,
                                                            index
                                                          ) => (
                                                            <Option
                                                              key={index}
                                                              value={
                                                                value?.dataValue
                                                              }
                                                              name={
                                                                value.dataDisplay
                                                              }
                                                            // disabled={getFieldValue("addresses").find(val=>val?.addressType===value?.dataValue)}
                                                            >
                                                              {
                                                                value.dataValue
                                                              }{" "}
                                                              -{" "}
                                                              {
                                                                value?.dataDisplay
                                                              }
                                                            </Option>
                                                          )
                                                        )}
                                                      </Select>
                                                    </Form.Item>
                                                  );
                                                }}
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  ประเทศ
                                                </label>}
                                                required
                                                name={[name, "country"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "country",
                                                ]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      "กรุณากรอก ประเทศ",
                                                  },
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Select
                                                  size={size}
                                                  showSearch
                                                  style={{ width: "100%" }}
                                                  placeholder="เลือกประเทศ"
                                                  optionFilterProp="children"
                                                  allowClear
                                                  dropdownMatchSelectWidth={300}
                                                >
                                                  {listCountry?.map(
                                                    (value, index) => (
                                                      <Option
                                                        key={index}
                                                        value={
                                                          value?.datavalue
                                                        }
                                                      // name={value.datadisplay}
                                                      >
                                                        {value?.datadisplay}
                                                      </Option>
                                                    )
                                                  )}
                                                </Select>
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  เลขที่
                                                </label>}
                                                required
                                                name={[name, "homeNumber"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "homeNumber",
                                                ]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      "กรุณากรอก เลขที่",
                                                  },
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={(e) => {
                                                    changeAddressInfo(
                                                      e,
                                                      name,
                                                      "homeNumber"
                                                    );
                                                  }}
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  อาคาร/หมู่บ้าน
                                                </label>}
                                                name={[name, "village"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "village",
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={
                                                    (e) =>
                                                      changeAddressInfo(
                                                        e,
                                                        name,
                                                        "village"
                                                      )
                                                    // updateAddressInfo(
                                                    //   e,
                                                    //   name,
                                                    //   1,
                                                    //   key
                                                    // )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  หมู่ที่
                                                </label>}
                                                name={[name, "moo"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[fieldKey, "moo"]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={(e) =>
                                                    changeAddressInfo(
                                                      e,
                                                      name,
                                                      "moo"
                                                    )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  ซอย
                                                </label>}
                                                name={[name, "soisub"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "soisub",
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={
                                                    (e) =>
                                                      changeAddressInfo(
                                                        e,
                                                        name,
                                                        "soisub"
                                                      )
                                                    // updateAddressInfo(
                                                    //   e,
                                                    //   name,
                                                    //   2,
                                                    //   key
                                                    // )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  เเยก
                                                </label>}
                                                name={[name, "soimain"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "soimain",
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={(e) =>
                                                    changeAddressInfo(
                                                      e,
                                                      name,
                                                      "soimain"
                                                    )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  ถนน
                                                </label>}
                                                name={[name, "road"]}
                                                {...layout}
                                                {...restField}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={
                                                    (e) =>
                                                      changeAddressInfo(
                                                        e,
                                                        name,
                                                        "road"
                                                      )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  จังหวัด
                                                </label>}
                                                required
                                                name={[name, "province"]}
                                                {...layout}
                                                {...restField}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      "กรุณากรอก จังหวัด",
                                                  },
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Select
                                                  size={size}
                                                  showSearch
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  placeholder=""
                                                  optionFilterProp="keyword"
                                                  allowClear
                                                  onClick={() => {
                                                    setChangwat(
                                                      props.apiData
                                                        .changwatList
                                                    );
                                                  }}
                                                  onFocus={() => {
                                                    setChangwat(
                                                      props.apiData
                                                        .changwatList
                                                    );
                                                  }}
                                                  onChange={(e) => {
                                                    autoSelectAddress(
                                                      "C",
                                                      e,
                                                      name,
                                                      "province"
                                                    );
                                                    addressInfo[
                                                      name
                                                    ].address[6] = "";
                                                    addressInfo[
                                                      name
                                                    ].address[7] = "";
                                                  }}
                                                  dropdownMatchSelectWidth={300}
                                                >
                                                  {changwat.map(
                                                    (value, index) => (
                                                      <Option
                                                        key={index}
                                                        value={
                                                          value?.datavalue
                                                        }
                                                        keyword={`${value?.datavalue}${value?.datadisplay}`}
                                                      >
                                                        {value?.datadisplay}
                                                      </Option>
                                                    )
                                                  )}
                                                </Select>
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  เขต/อำเภอ
                                                </label>}
                                                required
                                                name={[name, "district"]}
                                                {...layout}
                                                {...restField}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      "กรุณากรอก เขต/อำเภอ",
                                                  },
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Select
                                                  disabled={!formAddressFail.getFieldValue(
                                                    "addresses"
                                                  )[name]?.province}
                                                  size={size}
                                                  showSearch
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  placeholder=""
                                                  optionFilterProp="keyword"
                                                  allowClear
                                                  onChange={(e) => {
                                                    formAddressFail.getFieldValue(
                                                      "addresses"
                                                    )
                                                    autoSelectAddress(
                                                      "A",
                                                      e,
                                                      name,
                                                      "district"
                                                    );
                                                    addressInfo[
                                                      name
                                                    ].address[6] = "";
                                                  }}
                                                  dropdownMatchSelectWidth={300}
                                                >
                                                  {map(
                                                    amphur[fieldKey],
                                                    (value, index) => (
                                                      <Option
                                                        key={index}
                                                        value={
                                                          value?.datavalue
                                                        }
                                                        keyword={`${value?.datavalue}${value?.datadisplay}`}
                                                      >
                                                        {value?.datadisplay}
                                                      </Option>
                                                    )
                                                  )}
                                                </Select>
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  เเขวง/ตำบล
                                                </label>}
                                                required
                                                name={[name, "parish"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "parish",
                                                ]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message:
                                                      "กรุณากรอก เเขวง/ตำบล",
                                                  },
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Select
                                                  disabled={!formAddressFail.getFieldValue(
                                                    "addresses"
                                                  )[name]?.district}
                                                  size={size}
                                                  showSearch
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  placeholder=""
                                                  optionFilterProp="keyword"
                                                  allowClear
                                                  onChange={(e) => {
                                                    autoSelectAddress(
                                                      "T",
                                                      e,
                                                      name,
                                                      "parish"
                                                    );
                                                  }}
                                                  dropdownMatchSelectWidth={300}
                                                >
                                                  {map(
                                                    tambon[fieldKey],
                                                    (value, index) => (
                                                      <Option
                                                        key={index}
                                                        value={
                                                          value?.datavalue
                                                        }
                                                        keyword={`${value?.datavalue}${value?.datadisplay}`}
                                                      >
                                                        {value?.datadisplay}
                                                      </Option>
                                                    )
                                                  )}
                                                </Select>
                                              </Form.Item>
                                            </Col>
                                            <Col xs={24} xl={12}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  รหัสไปรษณีย์
                                                </label>}
                                                name={[name, "zipCode"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "zipCode",
                                                ]}
                                                style={{ margin: 0 }}
                                              // rules={[{ required: true, message: 'กรุณากรอก รหัสไปรษณีย์' }]}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={
                                                    (e) =>
                                                      changeAddressInfo(
                                                        e,
                                                        name,
                                                        "zipCode"
                                                      )

                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col xs={8} xl={8}>
                                              <Form.Item
                                                style={{ margin: 0 }}
                                                label={<label className="gx-text-primary">
                                                  เเผนที่บ้าน
                                                </label>}
                                                labelCol={{
                                                  span: 24,
                                                }}
                                                wrapperCol={{
                                                  span: 24,
                                                }}
                                              >
                                                <Button
                                                  style={{
                                                    backgroundColor: "gray",
                                                    color: "white",
                                                    marginBottom: 0,
                                                  }}
                                                  onClick={
                                                    () =>
                                                      onClickMapOnAddress(
                                                        key
                                                      )
                                                    // console.log('A')
                                                  }
                                                >
                                                  Google map
                                                </Button>
                                              </Form.Item>
                                            </Col>
                                            <Col xs={8} xl={8}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  ละติจูด
                                                </label>}
                                                name={[name, "latitude"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "latitude",
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={(e) =>
                                                    changeAddressInfo(
                                                      e,
                                                      name,
                                                      "latitude"
                                                    )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col> <Col xs={8} xl={8}>
                                              <Form.Item
                                                label={<label className="gx-text-primary">
                                                  ลองจิจูด
                                                </label>}
                                                name={[name, "longitude"]}
                                                {...layout}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "longitude",
                                                ]}
                                                style={{ margin: 0 }}
                                              >
                                                <Input
                                                  size={size}
                                                  style={{
                                                    width: "100%",

                                                  }}
                                                  onChange={(e) =>
                                                    changeAddressInfo(
                                                      e,
                                                      name,
                                                      "longitude"
                                                    )
                                                  }
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                              <Form.Item
                                                name={[name, "key"]}
                                                {...restField}
                                                fieldKey={[fieldKey, "key"]}
                                                style={{
                                                  display: "none",
                                                }}
                                                initialValue={key}
                                              >
                                                <Input />
                                              </Form.Item>

                                              <Form.Item
                                                name={[name, "addressId"]}
                                                {...restField}
                                                fieldKey={[
                                                  fieldKey,
                                                  "addressId",
                                                ]}
                                                style={{
                                                  display: "none",
                                                }}
                                              >
                                                <Input />
                                              </Form.Item>
                                            </Col>
                                            <Col span={22}>
                                              <Form.Item
                                                name={[name, "homeMap"]}
                                                {...restField}
                                                fieldKey={[fieldKey, "homeMap"]}
                                              >
                                                {addressInfo[name].mapIsOpen ? (
                                                  <MapPatient
                                                    address={
                                                      (addressInfo[name]
                                                        ?.address[0] !== ""
                                                        ? addressInfo[name]
                                                          ?.address[0]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[1] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[1]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[2] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[2]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[3] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[3]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[4] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[4]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[5] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[5]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[6] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[6]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[7] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[7]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[8] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[8]
                                                        : "") +
                                                      (addressInfo[name]
                                                        ?.address[9] !== ""
                                                        ? " " +
                                                        addressInfo[name]
                                                          ?.address[9]
                                                        : "")
                                                    }
                                                    latAddress={latAddress}
                                                    lngAddress={lngAddress}
                                                    markLocation={markLocation}
                                                  />
                                                ) : (
                                                  []
                                                )}

                                                <div
                                                  style={{
                                                    color: "red",
                                                    paddingTop: 10,
                                                    paddingBottom: 0,
                                                  }}
                                                >
                                                  <HiLocationMarker
                                                    style={{
                                                      marginTop: -4,
                                                      height: 20,
                                                      width: 20,
                                                    }}
                                                  />
                                                  <span>
                                                    {" "}
                                                    ยังไม่เคยมีการเยี่ยมบ้าน
                                                  </span>
                                                </div>
                                              </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                              <center>
                                                <Button
                                                  type="primary"
                                                  style={{
                                                    marginBottom: 0,
                                                    width: 120,
                                                  }}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    formSubmitType.current = {
                                                      req: "save address",
                                                      id: key,
                                                    };
                                                    formAddressFail.submit();
                                                  }}
                                                >
                                                  บันทึก
                                                </Button>
                                              </center>
                                            </Col>
                                          </GenRow>
                                        </Card>
                                      ) : (
                                        <Card
                                          className="address-body-background-default"
                                          style={{
                                            marginBottom: 15,
                                          }}
                                        >
                                          <Row>
                                            <Col
                                              span={2}
                                              style={{
                                                paddingLeft: "5%",
                                              }}
                                            >
                                              <HiLocationMarker
                                                style={{
                                                  height: 30,
                                                  width: 30,
                                                  color: "red",
                                                }}
                                              />
                                            </Col>
                                            <Col span={14}>
                                              <strong>
                                                <label className="gx-text-primary">
                                                  ประเภทที่อยู่{" "}
                                                  {getAddressInfo(
                                                    key,
                                                    "addressType"
                                                  )}
                                                </label>
                                              </strong>
                                              <p>
                                                {getAddressInfo(key, "address")}
                                              </p>
                                            </Col>
                                            <Col span={4}>
                                              {!getAddressInfo(
                                                key,
                                                "isEdit"
                                              ) ? (
                                                <Button
                                                  success
                                                  style={{
                                                    float: "right",
                                                    width: "100%",
                                                  }}
                                                  onClick={() => {
                                                    openEditAddress(key);
                                                  }}
                                                >
                                                  เเก้ไข
                                                </Button>
                                              ) : (
                                                []
                                              )}
                                            </Col>
                                            <Col span={4}>
                                              <Button
                                                style={{
                                                  float: "right",
                                                  width: "100%",
                                                }}
                                                danger
                                                onClick={() => {
                                                  remove(name);
                                                  onRemoveAddress(key);
                                                }}
                                              >
                                                ลบที่อยู่
                                              </Button>
                                            </Col>
                                          </Row>
                                        </Card>
                                      )}
                                    </>
                                  ) : (
                                    []
                                  )}
                                </Space>
                              )
                            )}
                          </>
                        </Col>
                      </GenRow>
                    )}
                  </Form.List>
                </Form>
                <Divider />
                {/* ----------------------- ข้อมูลเพิ่มเติม */}
                <label className="gx-text-primary fw-bold">ข้อมูลเพิ่มเติม</label>
                <GenRow gutter={[2, 2]}>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ประเภทผู้พิการ
                      </label>}
                      name="disabledType"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        className="data-value"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                      >
                        {props.apiData
                          ? props.apiData.disabledTypeList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value.datadisplay}
                              >
                                {value.datavalue} - {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ประเภทต่างด้าว
                      </label>}
                      name="laborType"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        className="data-value"
                        onChange={(e) => {
                          setLaborTypeDetect(e);
                        }}
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={600}
                      >
                        {props.apiData
                          ? props.apiData.laborTypeList.map((value, index) => (
                            <Option
                              key={index}
                              value={value?.datavalue}
                              name={value.datadisplay}
                            >
                              {value.datavalue} - {value?.datadisplay}
                            </Option>
                          ))
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ประเภทนายจ้าง
                      </label>}
                      name="employerType"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        className="data-value"
                        onChange={(e) => {
                          setEmployerType(e);
                        }}
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={600}
                      >
                        {props.apiData
                          ? props.apiData.employerTypeList.map((value, index) => (
                            <Option
                              key={index}
                              value={value?.datavalue}
                              name={value.datadisplay}
                            >
                              {value.datavalue} - {value?.datadisplay}
                            </Option>
                          ))
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ข้อมูลนายจ้าง
                      </label>}
                      name="employerName"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={500}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ลักษณะการทำงาน
                      </label>}
                      name="workingType"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={500}

                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        เบอร์ติดต่อนายจ้าง
                      </label>}
                      name="employerTel"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        onKeyPress={(event) =>
                          !/[0-9]/.test(event.key) && event.preventDefault()
                        }
                        maxLength={10}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        เลขบัตรตนไม่มีสัญชาติไทย
                      </label>}
                      name="nidCard"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={20}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">สีผิว</label>}
                      name="skin"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={40}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        สถานะในครอบครัว
                      </label>}
                      name="familyStatus"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        className="data-value"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                      >
                        {props.apiData
                          ? props.apiData.familyStatusList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value.datadisplay}
                              >
                                {value.datavalue} - {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        สถานะจำหน่าย
                      </label>}
                      name="familyDcStatus"
                    >
                      <Select
                        className="data-value"
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                        onChange={(value) => setDiedFlag(value === "1")}
                      >
                        {props.apiData
                          ? props.apiData.familyDCStatusList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value.datadisplay}
                              >
                                {value.datavalue} - {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">สถานะบุคคล</label>}
                      name="typeArea"
                    >
                      <Select
                        size={size}
                        className="data-value"
                        style={{ width: "100%" }}
                        showSearch
                        allowClear
                        optionFilterProp="label"
                        dropdownMatchSelectWidth={625}
                        options={props?.apiData?.optionsTypeArea}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ margin: 0 }}
                      labelCol={{ span: 9 }}
                      wrapperCol={{ span: 15 }}
                      shouldUpdate={(prev, cur) =>
                        prev.moveInDate !== cur.moveInDate
                      }
                      label={<label className="gx-text-primary">
                        ย้ายเข้า
                      </label>}
                      name="moveInDate"
                    >
                      <DatepickerWithForm
                        size={size}
                        form={form}
                        name={"moveInDate"}
                        format={"DD/MM/YYYY"}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{ margin: 0 }}
                      labelCol={{ span: 9 }}
                      wrapperCol={{ span: 15 }}
                      shouldUpdate={(prev, cur) =>
                        prev.dischDate !== cur.dischDate
                      }
                      label={<label className="gx-text-primary">ย้ายออก</label>}
                      name="dischDate"
                    >
                      <DatepickerWithForm
                        size={size}
                        form={form}
                        name={"dischDate"}
                        format={"DD/MM/YYYY"}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </GenRow>
                <Divider />
                <GenRow gutter={[2, 2]}>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">
                        ตำเเหน่งชุมชน
                      </label>}
                      name="communityPosition"
                    >
                      <Select
                        size={size}
                        showSearch
                        style={{
                          width: "100%",
                        }}
                        placeholder=""
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.value
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.name
                            ?.toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.value.length - optionB.value.length
                        }
                        allowClear
                        dropdownMatchSelectWidth={300}
                      >
                        {props.apiData
                          ? props.apiData.communityPositionsList.map(
                            (value, index) => (
                              <Option
                                key={index}
                                value={value?.datavalue}
                                name={value.datadisplay}
                              >
                                {value.datavalue} - {value?.datadisplay}
                              </Option>
                            )
                          )
                          : []}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      style={{ margin: 0 }}
                      label={<label className="gx-text-primary">ผู้เเนะนำ</label>}
                      name="agency"
                    >
                      <Input
                        size={size}
                        style={{
                          width: "100%",
                        }}
                        maxLength={100}
                      />
                    </Form.Item>
                  </Col>
                </GenRow>
                <Divider />
                <PatientLast
                  patientId={isUpdate}
                  scanFlag={
                    props.prevPatientData
                      ? props.prevPatientData.scanFlag
                      : null
                  }
                  oldHn={props.prevPatientData?.oldHn || null}
                />
                <GenRow>
                  <Col span={8}></Col>
                  <Col span={8}>
                    {props.prevPatientData?.opdCardFlag === "Y" ? (
                      <strong>
                        <label
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            paddingBottom: 15,
                          }}
                        >
                          พิมพ์ OPD CARD
                        </label>
                      </strong>
                    ) : null}
                  </Col>
                  <Col span={8}></Col>
                </GenRow>
              </Col>
            </GenRow>
          </Card>
        </div>
      </Form>

      {/* Open Modal Notification */}
      <Notifications
        setModal={(isVisible) => {
          setShowProcessResultModal(isVisible);
          setTitleToModal(null);
        }}
        isVisible={showProcessResultModal}
        response={titletoModal?.response}
        title={titletoModal?.title}
        type={titletoModal?.type}
      />
      {/* Close Modal Notification */}

      {/* start modal camera */}
      <Modal
        // title={<Title level={4}>กล้องถ่ายรูป</Title>}
        width={1200}
        centered
        visible={showCameraModal}
        okText="บันทึก"
        cancelText="ออก"
        onOk={handleCameraOk}
        onCancel={handleCameraCancel}
        footer={false}
      >
        <div className="bg-light p-3">
          <Row>
            <Col span={24}>{/* --- */}</Col>
            <Col span={24}>
              <Camera
                onTakePhotoAnimationDone={handleTakePhotoAnimationDone}
                onCameraStop={() => { }}
                isFullscreen={false}
              />
            </Col>
            <Col span={24}></Col>
          </Row>
        </div>
      </Modal>
      {/* end modal camera */}

      {/* start modal opd card fail */}
      <Modal
        title={<Title level={4}>ระบุเหตุผลที่ต้องการล้มเเฟ้ม</Title>}
        centered
        visible={showOpdCardFailModal}
        okText="บันทึก"
        cancelText="ออก"
        onOk={handleOpdCardFailOk}
        onCancel={handleOpdCardFailCancel}
        footer={[
          <Button key="back" onClick={handleOpdCardFailCancel}>
            ออก
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              formOpdCardFail.submit();
            }}
          >
            ตกลง
          </Button>,
        ]}
        width="50%"
      >
        <Form
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          form={formOpdCardFail}
          onFinish={onOpdCardFailFinish}
        >
          <div className="bg-light p-3">
            <Row>
              <Col span={24}>
                <Form.Item
                  label="เหตุผลที่ต้องการจะล้ม"
                  name="opdCardFailRemark"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    style={{
                      width: "100%",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>
      {/* end modal opd card fail */}
      <Modal
        title={<Title level={4}>ระบุเหตุผลที่ต้องการล้มเเฟ้มทดแทน</Title>}
        centered
        visible={showOpdCardFailReplaceModal}
        okText="บันทึก"
        cancelText="ออก"
        onOk={handleOpdCardFailReplaceOk}
        onCancel={handleOpdCardFailReplaceCancel}
        footer={[
          <Button key="back" onClick={handleOpdCardFailReplaceCancel}>
            ออก
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              formOpdCardFailReplace.submit();
            }}
          >
            ตกลง
          </Button>,
        ]}
        width="50%"
      >
        <Form
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          form={formOpdCardFailReplace}
          onFinish={onOpdCardFailReplaceFinish}
        >
          <div className="bg-light p-3">
            <Row>
              <Col span={24}>
                <Form.Item
                  label="เหตุผลที่ต้องการจะล้ม"
                  name="opdCardFailRemark"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    style={{
                      width: "100%",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>
      <EMessageAntdDatePicker
        isVisible={emessageVisible}
        onOk={() => setEMessageVisible(false)}
        onCancel={() => setEMessageVisible(false)}
        patientId={isUpdate}
      />
    </Spin>
  );
}
