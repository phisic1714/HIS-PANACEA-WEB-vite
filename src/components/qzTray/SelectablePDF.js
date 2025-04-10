import * as React from 'react';
import { Button, Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import { Col, Row, Spin, Button as ButtonAntd } from 'antd';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectPatientScanner } from "appRedux/actions";
import dayjs from 'dayjs';
import { callApis } from 'components/helper/function/CallApi';

const SelectablePDF = ({
    fileUrl,
    plugins = [],
    other,
    setSelected = () => "",
    unSelectable,
    loading = false,
    height = "50rem",
    hiddenThumbnails = false,
    hiddenAddDocuments = true,
    type = null,
    selectedPages,
    setSelectedPages,
    currentPage = 0,
    setCurrentPage
}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Thumbnails } = thumbnailPluginInstance;

    const [loadingAdd, setLoadingAdd] = React.useState(false);
    const [maxPage, setMaxPage] = React.useState([]);

    const handleDocumentLoad = (e) => {
        setMaxPage(Array(e.doc.numPages).fill(false))
    };

    const selectAllPages = () => {
        setSelectedPages((selectedPages) => Array(maxPage.length).fill(true));
        setSelected(other)
    };
    const deselectAllPages = () => {
        setSelectedPages((selectedPages) => Array(maxPage.length).fill(false));
        setSelected([])
    };
    const handleChoosePage = (e, pageIndex) => {
        const isSelected = e.target.checked;
        selectedPages[pageIndex] = isSelected;
        setSelectedPages([...selectedPages]);
        setSelected(other.filter((data, index) => [...selectedPages][index]))
    };
    const addDocumemtTypeD = async () => {
        const document = other[0]
        const req = { admitId: document.admitId, }
        setLoadingAdd(p => !p)
        const admitDetails = await callApis(apis["GetAdmitByAdmitID"], req)
        setLoadingAdd(p => !p)
        const scanId = document?.scanId || dayjs().format("DDMMYYYYHHmmss")
        const temp = {
            code: false,
            type: type,
            val: {
                doctor: admitDetails,
            },
            documents: other,
            scanId: scanId,
        }
        dispatch(selectPatientScanner(temp));
        history.push({ pathname: "/document%20management/document-management-scan-barcode" });

    }
    const addDocumemtTypeI = async () => {
        const document = other[0]
        const req = { admitId: document.admitId, }
        setLoadingAdd(p => !p)
        const admitDetails = await callApis(apis["GetAdmitByAdmitID"], req)
        setLoadingAdd(p => !p)
        const temp = {
            code: false,
            type: type,
            val: {
                ipd: admitDetails,
            },
            documents: [],
            scanId: document.admitId,
        }
        dispatch(selectPatientScanner(temp));
        history.push({ pathname: "/document%20management/document-management-scan-barcode" });
    }
    const addDocumemtTypeO = async () => {
        const document = other[0]
        setLoadingAdd(p => !p)
        const patientDetails = await callApis(apis["GetPatientsByID"], document.patientId)
        setLoadingAdd(p => !p)
        const temp = {
            code: false,
            type: type,
            val: {
                opd: {
                    ...patientDetails,
                    ...document,
                },
            },
            documents: other,
            scanId: document?.clinicId || document?.patientId || null,
            typeDoc: document?.scanIndex || null,
        }

        dispatch(selectPatientScanner(temp));
        history.push({ pathname: "/document%20management/document-management-scan-barcode" });
    }
    const handleClickAddDocuments = () => {
        if (!type) return
        switch (type) {
            case "D": return addDocumemtTypeD()
            case "I": return addDocumemtTypeI()
            case "O": return addDocumemtTypeO()
            default: break;
        }
    }

    const renderThumbnailItem = (props) => (
        <div
            key={props.pageIndex}
            className="custom-thumbnail-item"
            data-testid={`thumbnail-${props.pageIndex}`}
            style={{
                backgroundColor: props.pageIndex === currentPage ? 'rgba(0, 0, 0, 0.3)' : '#fff',
                cursor: 'pointer',
                padding: '0.5px',
                width: '100%',
            }}
        >
            <div style={{ marginBottom: '0.5rem' }} onClick={() => {
                setCurrentPage(props.pageIndex);
                props.onJumpToPage()
            }}>
                {props.renderPageThumbnail}
            </div>
            <div
                hidden={unSelectable}
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '0 auto',
                }}
            >
                <div style={{ marginRight: 'auto', marginLeft: 4 }}>{props.renderPageLabel}</div>
                <input
                    type="checkbox"
                    checked={selectedPages[props.pageIndex] || false}
                    onChange={(e) => handleChoosePage(e, props.pageIndex)}
                />
            </div>
        </div>
    );

    return (
        <Spin spinning={loading}>
            <Row gutter={[4, 4]} align='middle'>
                <Col hidden={unSelectable}>
                    <Button onClick={selectAllPages}>Select all</Button>
                </Col>
                <Col hidden={unSelectable}>
                    <Button onClick={deselectAllPages}>Deselect all</Button>
                </Col>
                <Col hidden={unSelectable}>
                    Selected :{' '}
                    {selectedPages
                        .map((v, idx) => (v ? idx + 1 : false))
                        .filter(Number)
                        .join(', ')}
                </Col>
                <Col hidden={hiddenAddDocuments}>
                    <ButtonAntd
                        type='primary'
                        style={{ margin: 0 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClickAddDocuments()
                        }}
                        loading={loadingAdd}
                    >
                        เพิ่มเอกสาร
                    </ButtonAntd>
                </Col>
            </Row>
            <div
                style={{
                    margin: 'auto',
                }}
            >
                <div
                    style={{
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        height: height,
                    }}
                >
                    <div
                        style={{ border: "1px solid rgb(178 178 178)", width: '17%', }}
                        hidden={hiddenThumbnails}
                    >
                        <Thumbnails renderThumbnailItem={renderThumbnailItem} />
                    </div>
                    <div
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                        }}
                    >
                        <Viewer
                            onDocumentLoad={handleDocumentLoad}
                            fileUrl={fileUrl}
                            plugins={[thumbnailPluginInstance, ...plugins]}
                            initialPage={currentPage}
                        />
                    </div>
                </div>
            </div>
        </Spin>
    );
};

export default SelectablePDF;

const apis = {
    GetAdmitByAdmitID: {
        url: "Admits/GetAdmitByAdmitID",
        method: "POST",
        return: "responseData",
        sendRequest: true,
    },
    GetPatientsByID: {
        url: "Patients/GetPatientsByID/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}