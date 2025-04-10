import React, { useState } from "react";
import { Table } from "antd";
import {
  getBedDropdown,
  getBuildDropdown,
  getCountAllAdmit,
  getDepartmentDropdown,
  getListPatient,
  getSpecialDropdown,
  getWardDropdown,
} from "../../routes/Ward/API/PatientCheckNowAPI.js";



const columns = [
  {
    title: "AN",
    dataIndex: "key",
  },
  {
    title: "ชื่อคนไข้",
    dataIndex: "name",
  },
  {
    title: "แผนก",
    dataIndex: "department",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.department - b.department,
  },
  {
    title: "Ward",
    dataIndex: "ward",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.ward - b.ward,
  },
  {
    title: "สาขาแพทย์",
    dataIndex: "section",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.section - b.section,
  },
  {
    title: "ตึก",
    dataIndex: "building",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.building - b.building,
  },
  {
    title: "ประเภทเตียง",
    dataIndex: "bedtype",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.bedtype - b.bedtype,
  },
];
// const data = [
//   {
//     key: "1",
//     name: "John Brown",
//   },
//   {
//     key: "2",
//     name: "Jim Green",
//   },
//   {
//     key: "3",
//     name: "Joe Black",
//   },
//   {
//     key: "4",
//     name: "Jim Red",
//   },
// ];
const onChange = (pagination, filters, sorter, extra) => {
  console.log("params", pagination, filters, sorter, extra);
};
const PatientTableInfo = () => {
  const [allpatientAN, setAllPatientAN] = useState([]);
  const [allpatientname, setAllPatientName] = useState([]);
  const [alldepartment, setAllDepartment] = useState([]);
  const [allward, setAllWard] = useState([]);
  const [allsection, setAllSection] = useState([]);
  const [allbuilding, setAllBuilding] = useState([]);
  const [allbedtype, setAllBedtype] = useState([]);

const getData = () => {
  getListPatient().then((data) => {
    setAllPatientName(data)
   
  })
}

  return (
    <div>
      {allpatientname.map((name) => (
        <Table
        columns={columns}
        title={() => {
          return <label className="gx-text-primary">ข้อมูลผู้ป่วย</label>
        }
      }
        onChange={onChange}
      />
      ))}    
    </div>
  );
};
export default PatientTableInfo;
