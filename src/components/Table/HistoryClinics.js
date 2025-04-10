import React, { useEffect, useState } from 'react'
import { Button, Col, Drawer, Row, Select, Table } from 'antd';
import { callApis } from 'components/helper/function/CallApi';
import dayjs from 'dayjs'
import _map from "lodash/map"
import _uniqBy from "lodash/uniqBy"
import _filter from "lodash/filter"
import { LabelText, LabelTextPrimary, LabelTopicPrimary, } from "components/helper/function/GenLabel";
import styled from 'styled-components';
import OpdClinicsDetail from 'components/Patient/OpdClinicsDetail';
import { EyeOutlined } from '@ant-design/icons';

const CustomDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 645px !important;
  }
`;
export default function HistoryClinics({
    size = "small",
    patient = null,
    serviceId = null,
    handleChangeRadio = () => { },
    rowSelectionHidden = false,
    // returnData = null,
    opdClinicDetailsViewer = false,
    clinicHis = []
}) {
    // console.log('opdClinicDetailsViewer', opdClinicDetailsViewer)
    // State
    const [loadingOpdClinicHis, setLoadingOpdClinicHis] = useState(false)
    const [his, setHis] = useState([])
    const [optionsWorkHis, setOptionsWorkHis] = useState([]);
    const [selectedOpdClinicWorkHis, setSelectedOpdClinicWorkHis] = useState(null)
    const [clinicId, setClinicId] = useState(null)
    const [vsbDrawer, setVsbDrawer] = useState(false)
    // Functions
    const getHis = async (patientId) => {
        if (!patientId) return setHis([])
        if (clinicHis.length) return setHis(clinicHis)
        setLoadingOpdClinicHis(p => !p)
        const res = await callApis(apis["GetHistoryClinics"], { patientId })
        setLoadingOpdClinicHis(p => !p)
        setHis(res);
        // setHisFiltered(res);
        let listWorkPlaces = _uniqBy(res, "workId");
        listWorkPlaces = _map(listWorkPlaces, o => {
            return {
                ...o,
                value: o.workId,
                label: o.workName,
                className: "data-value"
            };
        });
        setOptionsWorkHis(listWorkPlaces);
    }
    const handleClickViewDetails = (record) => {
        setClinicId(record.clinicId)
        setVsbDrawer(true)
    }
    // Effects
    useEffect(() => {
        getHis(patient?.patientId)
    }, [patient])

    // Columns
    let columns = [
        {
            title: "ClinicId",
            dataIndex: "clinicId",
            fixed: "left",
            align: "center",
            width: 95,
        },
        {
            title: "วันที่รับบริการ",
            dataIndex: "clinicDate",
            align: "center",
            width: 120,
            render: (v) => dayjs(v, "MM/DD/YYYY HH:mm").format("DD/MM/BBBB HH:mm"),
        },
        {
            title: "ห้องตรวจ/Ward",
            dataIndex: "workName",
        },
        {
            title: "ชื่อแพทย์",
            dataIndex: "doctorName",
        },
        {
            title: "สาขาแพทย์",
            dataIndex: "specialtyName",
        },
    ];
    if (opdClinicDetailsViewer) {
        columns = [
            ...columns,
            {
                title: "",
                dataIndex: "clinicId",
                fixed: "right",
                align: "center",
                width: 50,
                render: (val, row) => <Button
                    className='mb-0'
                    size='small'
                    icon={<EyeOutlined className='gx-text-primary' />}
                    onClick={() => handleClickViewDetails(row)}
                />
            }
        ]
    }
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            handleChangeRadio(selectedRows[0])
        }
    };
    const title = () => {
        return <Row gutter={[4, 4]} align='middle'>
            <Col><LabelTopicPrimary text="ประวัติการมารับบริการ" /></Col>
            <Col>
                <Select
                    style={{ width: 200 }}
                    size='small'
                    className='data-value'
                    showSearch
                    allowClear
                    placeholder="เลือกห้องตรวจ"
                    optionFilterProp="label"
                    dropdownMatchSelectWidth={345}
                    options={optionsWorkHis}
                    onChange={(value) => setSelectedOpdClinicWorkHis(value)}
                />
            </Col>
        </Row>
    }
    return <>
        <Table
            title={() => title()}
            loading={loadingOpdClinicHis}
            size={size}
            scroll={{ x: 800, y: 200 }}
            rowSelection={
                rowSelectionHidden
                    ? undefined
                    : { type: "radio", ...rowSelection }
            }
            pagination={false}
            rowClassName="data-value"
            rowKey={"clinicId"}
            columns={columns}
            dataSource={selectedOpdClinicWorkHis ? _filter(his, ["workId", selectedOpdClinicWorkHis]) : his}
        />
        <CustomDrawer
            // size="large"
            drawerStyle={{
                width: "95%"
            }}
            title={
                <Row gutter={[4, 4]}>
                    <Col>
                        <LabelTextPrimary text="ประวัติการรักษา" />
                    </Col>
                    <Col>
                        <LabelText text={`HN: ${patient?.hn || "-"}`} />
                    </Col>
                    <Col>
                        <LabelText text={`เลขบัตร: ${patient?.idCard || "-"}`} />
                    </Col>
                </Row>
            }
            placement="right"
            onClose={() => {
                setVsbDrawer(false);
                setClinicId(null);
            }}
            visible={vsbDrawer}
        >
            <br />
            <br />
            <OpdClinicsDetail
                opdClinicValue={clinicId}
                opdServiceValue={serviceId}
                patientId={patient?.patientId}
                // updOpdClinic={updOpdClinic}
                editAble={false} />
        </CustomDrawer>
    </>
}
const apis = {
    GetHistoryClinics: {
        url: "OpdClinics/GetHistoryClinics",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    }
}