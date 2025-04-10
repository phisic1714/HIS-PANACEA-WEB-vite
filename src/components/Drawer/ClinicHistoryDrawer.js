/* eslint-disable react-hooks/exhaustive-deps */
import { Checkbox, Col, ConfigProvider, Drawer, Form, Row, Select, Table } from 'antd';
import thTH from "antd/lib/locale/th_TH";
import dayjs from "dayjs";
import { filter, map, slice, reverse } from 'lodash';
import { useEffect, useState } from "react";
import InfiniteScroll from 'react-infinite-scroller';
import styled from "styled-components";
import DayjsDatePicker from "../DatePicker/DayjsDatePicker";
import OpdClinicsDetail from "../Patient/OpdClinicsDetail";

import { PrintFormReport } from "components/qzTray/PrintFormReport";
import { GetDoctorFetch, GetOpdClinicHistoryDisplayDetailFetch } from "routes/OpdClinic/API/ScreeningApi";

// eslint-disable-next-line no-undef
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isSameOrAfter);

const { Option } = Select

const CustomDrawer = styled(Drawer)`
    .ant-drawer-content-wrapper{
        width: 700px !important;
    }
`;

const DivStyle = styled.div`
    ::-webkit-scrollbar {
        position: absolute;
        width: 7px;
        height: 7px;
        padding: 0%;
        border: 1px solid transparent;
        opacity: 0.75;
    }
    ::-webkit-scrollbar-track{
        background: #f1f1f1; 
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 100px;
        border: 1.3px solid transparent;
        background: #c1c1c1  ;
    }
    ::-webkit-scrollbar-thumb:hover{
        background: #c1c1c1  ;
    }
`;

export default function ClinicHistoryDrawer({
  patient,
  serviceValue,
  patientId,
  visible,
  onClose,
  clinicId
}) {
  // console.log('patient', patient)
  // console.log('patientId', patientId)
  const [listGeneralMedicineLoading, setListGeneralMedicineLoading] = useState(false)
  const [opdClinicHistoryDisplayDetailMaster, setOpdClinicHistoryDisplayDetailMaster] = useState([])
  const [dentalMas, setDentalMas] = useState([])
  const [listGeneralMedicine, setListGeneralMedicine] = useState([])
  const [selectGeneralMedicines, setSelectGeneralMedicines] = useState([]);
  // console.log('selectGeneralMedicines', selectGeneralMedicines)
  const [generalMedicinesFilterType, setGeneralMedicinesFilterType] = useState('filter');
  const [listPrevGeneralMedicine, setListPrevGeneralMedicine] = useState([]);
  const [clinicHistoryForm] = Form.useForm()
  const isDrugOrder = Form.useWatch("isDrugOrder", clinicHistoryForm)
  const hosParam = JSON.parse(localStorage.getItem("hos_param"));
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  const user = userFromSession.responseData.userId;

  const columnsGeneralMedicine = [{
    title: <label className="gx-text-primary">วันที่</label>,
    dataIndex: "clinicDate",
    width: 118,
    align: "center",
    render: (value, record) => {
      return <label className='data-value pointer' style={{ color: record.textColor }}>{value}</label>;
    }
  },
  {
    title: <label className="gx-text-primary">ห้องตรวจ</label>,
    dataIndex: "workName",
    render: (value, record) => {
      return <label className='data-value pointer' style={{ color: record.textColor }}>{value}</label>;
    }
  }, {
    title: <label className="gx-text-primary">แพทย์</label>,
    dataIndex: "doctor",
    render: (value, record) => {
      return <label className='data-value pointer' style={{ color: record.textColor }}>{dentalMas?.find((item) => item?.datavalue === value)?.datadisplay}</label>
    }
  }];
  const getOpdClinicHistoryDisplayDetail = async (patientId, isDrugOrder) => {
    if (!patientId) return
    if (!visible) return
    // if (patientId === prevPatientId) return
    setListPrevGeneralMedicine([]);
    setListGeneralMedicine([]);
    setListGeneralMedicineLoading(true);
    const result = await GetOpdClinicHistoryDisplayDetailFetch({
      patientId: patientId,
      isDrugOrder: isDrugOrder || null,
    });
    if (result) {
      setOpdClinicHistoryDisplayDetailMaster(result?.works || []);
      let tempListGeneralMedicine = [];
      for (let i = 0; i < result?.histories?.length; i++) {
        tempListGeneralMedicine.push({
          clinicDate: dayjs(result.histories[i].clinicDate).format("DD/MM/BBBB HH:mm"),
          workName: `${result.histories?.[i]?.workId} ${result.histories?.[i]?.workName}`,
          clinicId: String(result.histories[i].clinicId),
          doctor: result.histories[i].doctor ? result.histories[i].doctor : "-",
          textColor: result.histories[i].placeType === "IPD" ? "red" : result.histories[i].placeType === "OPD" ? "black" : "green"
        });
      }
      tempListGeneralMedicine = reverse(tempListGeneralMedicine)
      setListPrevGeneralMedicine(tempListGeneralMedicine);
      if (hosParam?.lock_doc_view_pt_flag === "Y") {
        tempListGeneralMedicine = filter(tempListGeneralMedicine, ["doctor", user]);
      }
      setListGeneralMedicine(tempListGeneralMedicine);
    }
    setListGeneralMedicineLoading(false);
  }
  const handleInfiniteOnLoad = () => {
    if (generalMedicinesFilterType === 'all' && selectGeneralMedicines.length < listGeneralMedicine.length - 1) {
      const newSelectGeneralMedicinesIndex = selectGeneralMedicines.length >= selectGeneralMedicines[0]?.index ? selectGeneralMedicines.length : selectGeneralMedicines.length - 1;
      // console.log(selectGeneralMedicines);
      setSelectGeneralMedicines([...selectGeneralMedicines, {
        index: newSelectGeneralMedicinesIndex,
        clinicId: listGeneralMedicine[newSelectGeneralMedicinesIndex]?.clinicId
      }]);
    }
  };
  const selectGeneralMedicinesAllInit = (filterType, record, rowIndex) => {
    if (filterType === 'all') {
      const generalMedicinesTemp = [...slice(listGeneralMedicine, 0, rowIndex), ...slice(listGeneralMedicine, rowIndex + 1)];
      const rowIndex2 = rowIndex === 0 ? 1 : 0;
      if (generalMedicinesTemp.length > 0) {
        setSelectGeneralMedicines([{
          index: rowIndex,
          clinicId: record?.clinicId
        }, {
          index: rowIndex2,
          clinicId: generalMedicinesTemp[0]?.clinicId
        }]);
      } else {
        setSelectGeneralMedicines([{
          index: rowIndex,
          clinicId: record?.clinicId
        }]);
      }
    } else {
      setSelectGeneralMedicines([{
        index: rowIndex,
        clinicId: record?.clinicId
      }]);
    }
  };
  const onChangeSelectGeneralMedicinesFilter = type => {
    if (type === 'filter') {
      const firstSelectGeneralMedicines = [selectGeneralMedicines[0]] || [];
      setSelectGeneralMedicines(firstSelectGeneralMedicines);
    } else {
      const generalMedicine = listGeneralMedicine[selectGeneralMedicines[0]?.index];
      selectGeneralMedicinesAllInit('all', generalMedicine, selectGeneralMedicines[0]?.index);
    }
    setGeneralMedicinesFilterType(type);
  };
  const getDoctorMas = async () => {
    if (dentalMas.length) return
    const doctorMas = await GetDoctorFetch()
    setDentalMas(doctorMas ? doctorMas : []);
  }
  const getListGeneralMedicine = ({
    workId,
    startDate,
    endDate,
    doctor,
  }) => {
    const prev = [...listPrevGeneralMedicine];
    if (startDate) startDate = dayjs(startDate).startOf('day');
    if (endDate) endDate = dayjs(endDate).endOf('day');
    if (workId || startDate || endDate || doctor) {
      const newGeneralMedicine = filter(prev, item => {
        const clinicDateISO = dayjs(item?.clinicDate, "DD/MM/YYYY HH:mm")
          .subtract(543, "year")
          .format("YYYY-MM-DD");

        return (
          (workId ? item?.workName?.startsWith(String(workId)) : true) &&
          (startDate ? startDate.format("YYYY-MM-DD") <= clinicDateISO : true) &&
          (endDate ? endDate.format("YYYY-MM-DD") >= clinicDateISO : true) &&
          (doctor ? item?.doctor === doctor : true)
        );
      });

      setListGeneralMedicine(newGeneralMedicine);
      selectGeneralMedicinesAllInit('all', newGeneralMedicine, selectGeneralMedicines[0]?.index);
    } else {
      setListGeneralMedicine(prev);
      selectGeneralMedicinesAllInit('all', prev, selectGeneralMedicines[0]?.index);
    }
  };
  useEffect(() => {
    if (visible) getDoctorMas()
  }, [visible])
  useEffect(() => {
    getOpdClinicHistoryDisplayDetail(patientId, isDrugOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, visible])
  useEffect(() => {
    clinicHistoryForm.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listPrevGeneralMedicine])

  const renderCurrentClinic = () => {
    const clinicDetails = listGeneralMedicine[selectGeneralMedicines?.[0]?.index]
    return <>
      <Row
        gutter={[4, 4]}
        align='middle'
      >
        <Col span={2} className='text-center'>
          <PrintFormReport
            style={{ margin: 0 }}
            button={false}
            size="small"
            shape="square"
            param={{
              clinicid: clinicDetails?.clinicId,
            }}
            moduleId="335"
            dropdownPlacement="left"
          />
        </Col>
        <Col span={9}>
          {clinicDetails?.clinicDate}
        </Col>
        <Col span={13}>
          <label className='gx-text-primary me-1'>ห้องตรวจ</label>
          <label className='data-value'>{clinicDetails?.workName}</label>
        </Col>
      </Row>
      <OpdClinicsDetail
        opdClinicValue={clinicDetails?.clinicId}
        getServiceId={() => {
          // console.log(value);
          // setServiceId(value)
        }}
        opdServiceValue={serviceValue}
        patientId={patientId}
        // updOpdClinic={updOpdClinic}
        editAble={false}
      />
    </>
  }
  return (
    <ConfigProvider locale={thTH}>
      <CustomDrawer
        title={<Row gutter={[4, 4]}>
          <Col>
            <label className='gx-text-primary fw-bold fs-6'>ประวัติการรักษา</label>
          </Col>
          <Col>
            <label className='data-value fw-bold me-2'>
              HN : {patient?.[0]?.hn || patient?.hn || "-"}
            </label>
            <label className='data-value fw-bold'>
              เลขบัตรประชาชน : {patient?.[0]?.idCard || patient?.idCard || "-"}
            </label>
          </Col>
        </Row>}
        placement="right"
        onClose={() => {
          onClose(false);
        }}
        visible={visible}

      >

        <Form
          form={clinicHistoryForm}
          onFinish={getListGeneralMedicine}
          className="ps-2"
        >
          <Row gutter={[4, 2]}>
            <Col>
              <Form.Item
                name="startDate"
                style={{ margin: 0 }}
              >
                <DayjsDatePicker
                  size="small"
                  name={"startDate"}
                  form={clinicHistoryForm}
                  onChange={e => {
                    clinicHistoryForm.submit();
                  }}
                  style={{
                    width: 105
                  }}
                  format={"DD/MM/YYYY"}
                  placeholder={"วันที่เริ่มต้น"}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                name="endDate"
                style={{ margin: 0 }}
              >
                <DayjsDatePicker
                  size="small"
                  form={clinicHistoryForm}
                  name={"endDate"}
                  onChange={e => {
                    console.log("Start date  => ", e);
                    clinicHistoryForm.submit();
                  }}
                  style={{
                    width: 105
                  }}
                  format={"DD/MM/YYYY"}
                  placeholder={"วันที่สิ้นสุด"}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name={'workId'} style={{ margin: 0 }}>
                <Select
                  size="small"
                  showSearch
                  style={{
                    width: 175
                  }}
                  allowClear={true}
                  optionFilterProp="children"
                  onChange={() => clinicHistoryForm.submit()}
                  className="data-value"
                  placeholder="ห้องตรวจ"
                  dropdownMatchSelectWidth={285}
                >
                  {opdClinicHistoryDisplayDetailMaster?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">{val.datadisplay}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name={'doctor'} style={{ margin: 0 }}>
                <Select
                  size="small"
                  showSearch
                  style={{
                    width: 175
                  }}
                  allowClear={true}
                  optionFilterProp="children"
                  onChange={() => clinicHistoryForm.submit()}
                  className="data-value"
                  placeholder="แพทย์"
                  disabled={hosParam?.lock_doc_view_pt_flag === "Y"}
                  dropdownMatchSelectWidth={285}
                >
                  {dentalMas?.map((val, index) => <Option value={val.datavalue} key={index} className="data-value">{val.datadisplay}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name={'isDrugOrder'} style={{ margin: 0 }}>
                <Checkbox onChange={e => {
                  e.stopPropagation()
                  if (e.target.checked) getOpdClinicHistoryDisplayDetail(patientId, "Y")
                  if (!e.target.checked) getOpdClinicHistoryDisplayDetail(patientId, null)
                }}>เฉพาะที่มีการสั่งยา</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                size="small"
                scroll={{
                  x: 400,
                  y: 150
                }}
                loading={listGeneralMedicineLoading}
                columns={columnsGeneralMedicine}
                dataSource={listGeneralMedicine}
                pagination={{
                  pageSize: 50,
                  showSizeChanger: false
                }}
                rowClassName="data-value pointer"
                onRow={(record, rowIndex) => {
                  return {
                    onClick: () => {
                      selectGeneralMedicinesAllInit(generalMedicinesFilterType, record, rowIndex);
                      // setVisible(true);
                    }
                  };
                }}
              />
            </Col>
          </Row>
        </Form>
        <Row gutter={[4, 4]} align='middle'>
          <Col>
            <label className='gx-text-primary fw-bold'>มุมมอง</label>
          </Col>
          <Col>
            <Select
              style={{ width: 175 }}
              optionFilterProp="children"
              onChange={e => onChangeSelectGeneralMedicinesFilter(e)}
              className="data-value"
              // placeholder="เลือกห้องตรวจ"
              defaultValue={generalMedicinesFilterType}
            >
              <Option value="all" key="all" className="data-value">
                แสดงทั้งหมด
              </Option>
              <Option value="filter" key="filter" className="data-value">
                เฉพาะที่เลือก
              </Option>
            </Select>
          </Col>
        </Row>
        <Row
          style={{
            height: "25vh",
            marginTop: 6,
          }}
        >
          <Col span={24}>
            <DivStyle style={{
              height: "40rem",
              overflowX: "hidden",
              overflowY: "scroll"
            }}>
              <InfiniteScroll
                initialLoad={false}
                pageStart={0}
                loadMore={handleInfiniteOnLoad}
                hasMore={true}
                useWindow={false}
              >
                {
                  generalMedicinesFilterType === "filter"
                    ? renderCurrentClinic()
                    : map(selectGeneralMedicines, (item, index) => (
                      <Row
                        style={{
                          marginLeft: 2,
                          borderStyle: "solid",
                          borderWidth: "1px",
                          marginBottom: 10,
                          paddingTop: 10
                        }}
                        gutter={[4, 4]}
                      >
                        <Col
                          span={24}
                          style={{
                            padding: 10,
                            borderBottom: '1px solid',
                            paddingBottom: 5
                          }}
                        >
                          {
                            item?.clinicId
                              ? <Row
                                gutter={[4, 4]}
                                align='middle'
                              >
                                <Col span={2} className='text-center'>
                                  <PrintFormReport
                                    style={{ margin: 0 }}
                                    button={false}
                                    size="small"
                                    shape="square"
                                    param={{
                                      clinicid: item?.clinicId,
                                    }}
                                    dropdownPlacement="left"
                                    moduleId="335"
                                  />
                                </Col>
                                <Col span={9}>
                                  {listGeneralMedicine[item?.index]?.clinicDate}
                                </Col>
                                <Col span={13}>
                                  <label className='gx-text-primary me-1'>ห้องตรวจ</label>
                                  <label className='data-value'>{listGeneralMedicine[item?.index]?.workName}</label>
                                </Col>
                              </Row>
                              : ""
                          }
                        </Col>
                        {
                          item?.clinicId
                            ? <Col span={24}>
                              <OpdClinicsDetail
                                opdClinicValue={item?.clinicId}
                                getServiceId={() => {
                                  // console.log(value);
                                  // setServiceId(value)
                                }}
                                opdServiceValue={serviceValue}
                                patientId={patientId}
                                // updOpdClinic={updOpdClinic}
                                editAble={false}
                              />
                            </Col>
                            : ""
                        }
                      </Row>)
                    )
                }
              </InfiniteScroll>
            </DivStyle>
          </Col>
        </Row>
      </CustomDrawer>
    </ConfigProvider>
  )
}