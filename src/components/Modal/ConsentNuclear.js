import { env } from '../../env.js';
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { Popconfirm, Table, Space } from "antd";
import moment from "moment";
import {filter} from "lodash";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { notificationX } from "../Notification/notificationX";
import { callApi } from "../../routes/NuclearMedication/API/PatientDetailApi";

// import { useSelector } from "react-redux";
export default forwardRef(function ConsentNuclear({
  patientId = null,
  workId = null,
  doctor = null,
  serviceId = null,
  showTable = false,
  aboutPatient,
  form,
  scrollY = 200,
  add543 = true //หน้าไหนเรียก momentTH ใส่ add543 เป็น false
}, ref) {

  // Api
  useImperativeHandle(ref, () => ({
    fetchConsent: () => fetchConsentNuclearDisplay()
  }));
  const editConsent = record => {
    // let mappingData = record.map()
    form.setFieldsValue({
      bookconsent: [{
        ...record,
        ...aboutPatient,
        women: record.women ? true : false,
        firstOfmonthMenses: record?.firstOfmonthMenses ? dayjs(record?.firstOfmonthMenses, "MM/DD/YYYY") : null,
        sign: record.sign ? [{
          name: nanoid(),
          status: "done",
          thumbUrl: record.sign ? `data:image/jpeg;base64,${record.sign}` : [],
          type: "image/jpeg",
          uid: nanoid()
        }] : null
      }]
    });
  };
  const deleteConsent = async record => {
    const res = await callApi("DelConsentNuclearmed", `/${record.concentNuNo}`);
    notificationX(res.isSuccess, "ลบหนังสือยินยอม");
    if (res.isSuccess) {
      fetchConsentNuclearDisplay();
    }
  };
  const [conSentNuclearList, setConSentNuclearList] = useState([]);
  const [loadingConsentNuclear, setLoadingConsentNuclear] = useState(false);
  const fetchConsentNuclearDisplay = async () => {
    // (Get Lab Monitor) id : [/]

    if (!patientId) return;
    setLoadingConsentNuclear(true);
    await axios({
      url: `${env.REACT_APP_PANACEACHS_SERVER}/api/NuclearMedication/GetConsentNuList/${+patientId}`,
      method: "GET"
    }).then(res => {
      if (res.data.responseData) {
        let temp = res.data.responseData;
        temp = filter(temp, "concentNuNo");
        setConSentNuclearList(temp);
      } else {
        setConSentNuclearList([]);
      }
    }).catch(error => {
      return error;
    });
    setLoadingConsentNuclear(false);
    // return res;
  };
  // console.log(labMonitorDisplayList);
  const TableLab = () => {
    const dataSource = conSentNuclearList?.map((o, index) => {
      let orderDate = o.labOrderDate ? moment(o.labOrderDate).format("DD/MM/YYYY HH:mm") : null;
      if (add543) {
        orderDate = o.labOrderDate ? moment(o.labOrderDate, "MM/DD/YYYY HH:mm").format("DD/MM") + "" + moment(o.labOrderDate, "MM/DD/YYYY HH:mm").add(543, "y").format("/YYYY HH:mm") : null;
      }
      return {
        key: index,
        ...o,
        orderDate: orderDate,
        nuNodisp: o.concentNuNo.replace("ConcentNuNo-",""),
      };
    });
    const columns = [{
      title: <label className="gx-text-primary">หมายเลขเอกสาร</label>,
      dataIndex: "nuNodisp",
      width: 145,
    }, {
      title: <label className="gx-text-primary">การตรวจ | การรักษา</label>,
      dataIndex: "exam",
      render: val => <label className="data-value">
            {val === "T" ? "การรักษา" : val === "C" ? "การตรวจ" : "-"}
          </label>
    }, {
      title: <label className="gx-text-primary">วันที่บันทึก</label>,
      dataIndex: "dateCreated",
      align: "center",
      width: 145,
      render: val => <label className="data-value">
            {val ? dayjs(val, "MM/DD/YYYY").format("DD/MM/BBBB") : "-"}
          </label>
    }, {
      title: <label className="gx-text-primary"></label>,
      dataIndex: "action",
      align: "center",
      width: 145,
      render: (val, record) => <Space size="middle">
            <EditOutlined id={record.vid} style={{
          fontSize: "16px",
          color: "#1a1aff"
        }} onClick={() => {
          console.log("ต้องการแก้ไข  =>", record);
          editConsent(record);
        }} />
            {/* </Popconfirm> */}
            <Popconfirm title="ต้องการลบ ?" onConfirm={() => {
          console.log("ต้องการลบ  =>", record);
          deleteConsent(record);
        }}>
              <DeleteOutlined style={{
            fontSize: "16px",
            color: "#ff1a66"
          }} />
            </Popconfirm>
          </Space>
    }];
    return <Table 
    loading={loadingConsentNuclear} 
    scroll={{
      x: 480,
      y: scrollY
    }} 
    columns={columns} 
    dataSource={dataSource} 
    pagination={false}
    rowClassName="data-value" 
    rowKey={"concentNuNo"}
    />;
  };
  useEffect(() => {
    if (showTable) {
      fetchConsentNuclearDisplay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, workId, doctor, serviceId]);
  return <div>
      {showTable ? TableLab() : null}
      
    </div>;
});