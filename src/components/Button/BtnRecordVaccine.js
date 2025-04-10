import React, { useEffect, useRef, useState } from 'react';
import { callApis } from 'components/helper/function/CallApi';
import {
    Button,
    Checkbox,
    Col,
    Form,
    Input,
    Modal,
    notification,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tooltip,
    Typography,
} from 'antd';
import GenRow from '../helper/function/GenRow';
import { LabelTopicPrimary18 } from '../helper/function/GenLabel';
import HisRecordVaccine from 'routes/HomeHealthcare/Components/HisRecordVaccine';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { withResolve } from 'api/create-api';
import { GetPatientEPIByPatientId, GetVcctype, InsertPatientEPI } from 'routes/SocialMedication/API/RecordVaccineEpiAPI';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { useSelector } from 'react-redux';
import DayjsDatePicker from 'components/DatePicker/DayjsDatePicker';
import { GetUserMas } from 'routes/OpdClinic/API/ScreeningApi';
import { GetAllergyLevelsMas } from 'routes/AdrRegistration/API/DrugAllergyApi';
import { autoConvertDates } from 'util/GeneralFuctions';
import { map, reverse } from 'lodash';

const hosParam = JSON.parse(localStorage.getItem('hos_param'));
const userFromSession = JSON.parse(sessionStorage.getItem('user'));
const userId = userFromSession.responseData.userId;

export default function BtnRecordVaccine({
    patientId = null,
    serviceId = null,
    clinicId = null,
    hn = null,
    runHn = null,
    yearHn = null,
    optionsUser = [],
    type = 'primary',
    disabled = false,
    width = '',
    style = {},
    size = 'small',
    ...props
}) {
    const hisRecordVaccineRef = useRef(null);

    // State
    const [loading, setLoading] = useState(false);
    const [vsbModal, setVsbModal] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();
    const allSearchPatientDetail = useSelector(({ Search }) => Search);
    const patient = allSearchPatientDetail?.patient;
    const patientDetail = allSearchPatientDetail?.patientDetail;
    // console.log('allSearchPatientDetail :>> ', allSearchPatientDetail);

    const [isModalVaccineVisible, setIsModalVaccineVisible] = useState(false);
    const [selectedTmp, setSelectedTmp] = useState(null);
    //dropdown
    const [userMasDropdown, setUserMasDropdown] = useState([]);
    const [allergyLevelsMasDropDown, setAllergyLevelsMasDropDown] = useState([]);
    //data
    const [getVaccine, setGetVaccine] = useState([]);
    const [dataSelect, setDataSelect] = useState([]);
    const [dataSourceVaccine, setDataSourceVaccine] = useState([]);
    const [dataAll, setDataAll] = useState([]);
    const [formDetailVaccine, setFormDetailVaccine] = useState({
        dose: '',
        epiId: '',
        ageId: '',
        lotno: '',
        vccType: '',
        remark: '',
        provider: '',
        dateServ: '',
        received: '',
        serialno: '',
        vccPlaces: '',
        expireDate: '',
        userCreated: '',
        dateCreated: '',
        manufacturer: '',
        dateModified: '',
        userModified: '',
        allergyLevels: [
            {
                ptAdrId: '',
                epiId: '',
                levels: '',
                otherSymptom: '',
            },
        ],
    });
    const [dataTmp, setDataTmp] = useState([]);
    const [epiList, setEpiList] = useState(null);
    const [currentTab, setCurrentTab] = useState('1');
    const [vaccineHis, setVaccineHis] = useState([]);

    const columns = [
        {
            title: 'อายุ',
            dataIndex: 'age',
            key: 'age',
            ellipsis: true,
            width: 150,
            render: (text) => (
                <Tooltip title={displayAge(text)}>
                    <Typography.Text
                        style={{
                            position: 'absolute',
                            top: 16,
                            marginBlock: 2.5,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '84%',
                        }}
                    >
                        {displayAge(text)}
                    </Typography.Text>
                </Tooltip>
            ),
        },
        {
            title: 'วัคซีน',
            dataIndex: 'vaccine',
            key: 'vaccine',
            ellipsis: true,
            width: 200,
            render(_, value) {
                return (
                    <div
                        style={{
                            position: 'absolute',
                            top: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '84%',
                        }}
                    >
                        {value.vaccine.map((item, index) => {
                            return (
                                <Tooltip key={index} title={item.vaccineName}>
                                    <Typography.Text
                                        style={{
                                            margin: '2.5px 0 12.5px',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            width: '100%',
                                        }}
                                    >
                                        {item.vaccine ? item.vaccineName : 'ไม่พบวัคซีน'}
                                    </Typography.Text>
                                </Tooltip>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'คำแนะนำ',
            dataIndex: 'suggestion',
            key: 'suggestion',
            ellipsis: true,
            width: 200,
            render(_, value) {
                return (
                    <div
                        style={{
                            position: 'absolute',
                            top: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '84%',
                        }}
                    >
                        {value.vaccine.map((item, index) => (
                            <Tooltip
                                key={index}
                                title={item.suggestion ? item.suggestion : '-'}
                            >
                                <Typography.Text
                                    style={{
                                        margin: '2.5px 0 12.5px',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        width: '100%',
                                    }}
                                >
                                    {item.suggestion ? item.suggestion : '-'}
                                </Typography.Text>
                            </Tooltip>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'เข็มที่',
            dataIndex: 'dose',
            key: 'dose',
            width: 130,
            ellipsis: true,
            render: (_, value) => {
                return (
                    <Space
                        direction="vertical"
                        style={{ position: 'absolute', top: 16, width: '80%' }}
                    >
                        {value.vaccine.map((item) => {
                            const isDisabled = item.received === 'Y' && item.epiId;
                            return (
                                <Input
                                    key={item.vactemdtid}
                                    size="small"
                                    value={item.dose}
                                    disabled={item.dose === '0' || isDisabled}
                                    style={{ width: '80%' }}
                                    onChange={handleChangeDos(value.age, item.vactemdtid)}
                                />
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'ได้รับแล้ว',
            dataIndex: 'received',
            key: 'received',
            width: 120,
            align: 'center',
            ellipsis: true,
            render: (_, value) => {
                return (
                    <Space direction="vertical" style={{ position: 'absolute', top: 16 }}>
                        {value.vaccine.map((item) => {
                            const isDisabled = item.received === 'Y' && item.epiId;
                            return (
                                <Checkbox
                                    key={item.vactemdtid}
                                    checked={item.received === 'Y'}
                                    disabled={isDisabled}
                                    style={{ marginBlock: 2.5 }}
                                    onChange={(e) =>
                                        handleChangeReceived(value.age, item.vactemdtid)(e)
                                    }
                                />
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'วันที่ได้รับ',
            dataIndex: 'receivedDate',
            key: 'receivedDate',
            width: 160,
            ellipsis: true,
            render: (_, value) => {
                return (
                    <Space direction="vertical">
                        {value.vaccine.map((item) => {
                            const isDisabled = item.received === 'Y' && item.epiId;
                            return (
                                <DayjsDatePicker
                                    key={item.vactemdtid}
                                    value={item.dateServ ? dayjs(item.dateServ) : null}
                                    size="small"
                                    defaultValue={dayjs()}
                                    style={{ width: '100%' }}
                                    disabled={isDisabled}
                                    onChange={(date) => {
                                        handleChangeReceivedDate(value.age, item.vactemdtid, date);
                                    }}
                                />
                            );
                        })}
                    </Space>
                );
            },
        },

        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            ellipsis: true,
            width: 120,
            render: (_, value) => (
                <Space direction="vertical" size={0}>
                    {value.vaccine.map((item) => (
                        <Button
                            key={item.vactemdtid}
                            type="primary"
                            size="small"
                            style={{ width: '100%', marginBlock: 2.5 }}
                            onClick={handleClickVisibleVaccineModal(item, item.epiId)}
                            disabled={!item?.epiId || (!item?.epiId && item.received)}
                        >
                            ดูรายละเอียด
                        </Button>
                    ))}
                </Space>
            ),
        },
        // {
        // 	title: 'ผู้บันทึก',
        // 	dataIndex: 'recorder',
        // 	key: 'recorder',
        // 	ellipsis: true,
        // 	width: 160,
        // 	render: (_, value) => {
        // 		const firstVaccine = value.vaccine[0];
        // 		return firstVaccine ? (
        // 			<Space direction="vertical" size={1} style={{ position: 'absolute', top: 16, marginBottom: 0 }}>
        // 				<Typography.Text style={{ fontSize: 14 }}>{firstVaccine.userCreated}</Typography.Text>
        // 				<Typography.Text style={{ fontSize: 14 }}>{firstVaccine.dateCreated}</Typography.Text>
        // 			</Space>
        // 		) : '-';
        // 	},
        // },
        // {
        // 	title: 'ผู้แก้ไข',
        // 	dataIndex: 'editor',
        // 	key: 'editor',
        // 	width: 160,
        // 	ellipsis: true,
        // 	render: (_, value) => {
        // 		const firstVaccine = value.vaccine[0];

        // 		return firstVaccine ? (
        // 			<Space direction="vertical" size={1} style={{ position: 'absolute', top: 16, marginBottom: 0 }}>
        // 				<Typography.Text style={{ fontSize: 14 }}>{firstVaccine.userModified}</Typography.Text>
        // 				<Typography.Text style={{ fontSize: 14 }}>{firstVaccine.dateModified}</Typography.Text>
        // 			</Space>
        // 		) : '-';
        // 	},
        // },
    ];
    const fecthTmpVaccine = async () => {
        const { error: errTmpVaccine, result: resultTmpVaccines } =
            await withResolve('/api/SocialMedication/GetTbmVaccinceTemplate').fetch();
        if (errTmpVaccine) return;

        const { error: errAgeSelect, result: resultAgeSelect } = await withResolve(
            `api/Masters/GetDropDownMas`
        ).insert({
            table: 'TBM_VACCINE_TEMPLATE_DETAILS',
            field: 'Age',
        });
        if (errAgeSelect) return;

        setDataTmp(resultTmpVaccines);
        setDataSelect(resultAgeSelect);
    };
    const fetchEPIList = async (patientId) => {
        setEpiList([])
        const { error, result } = await withResolve("/api/SocialMedication/patient-epi-vaccine-template").insert({
            patientId: patientId
        })
        if (error) return

        const convertedData = autoConvertDates(result?.details || []);

        setEpiList(convertedData);
        return new Promise((resolve) => {
            setTimeout(() => resolve(convertedData), 0);
        });
    };
    const handleClickSave =
        (epiId = null) =>
            async () => {
                setLoading(true);
                let newArr = [];
                const timeStamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

                dataSourceVaccine.forEach((item) => {
                    item.vaccine.forEach((vaccine) => {
                        const isCreated = vaccine?.epiId;
                        const formattedDateServ =
                            vaccine.dateServ && dayjs(vaccine.dateServ).isValid()
                                ? dayjs(vaccine.dateServ).format('YYYY-MM-DD HH:mm:ss')
                                : vaccine.receivedDate && dayjs(vaccine.receivedDate).isValid()
                                    ? dayjs(vaccine.receivedDate).format('YYYY-MM-DD HH:mm:ss')
                                    : null;
                        const vaccineData = {
                            epiId: isCreated || null,
                            patientId: patient?.patientId,
                            serviceId: isCreated ? serviceId : vaccine?.serviceId || null,
                            clinicId: isCreated ? clinicId : vaccine?.clinicId || null,
                            vcctype: vaccine.vaccine,
                            dose: Number(vaccine.dose) || 0,
                            vccplaces: hosParam.hospCode,
                            provider: userId,
                            lotno: vaccine.lotno || null,
                            serialno: vaccine.serialno || null,
                            remark: vaccine.remark || null,
                            expireDate: vaccine.expireDate || null,
                            manufacturer: vaccine.manufacturer || null,
                            expenseId: vaccine.expenseId || null,
                            financeId: vaccine.financeId || null,
                            fptype: vaccine.fptype || null,
                            route: vaccine.route || null,
                            swapPatientId: vaccine.swapPatientId || null,
                            ageId: vaccine.ageId,
                            received: vaccine.received ? 'Y' : null,
                            dateServ: formattedDateServ,
                            userCreated: isCreated ? vaccine.userCreated || userId : userId,
                            dateCreated: isCreated
                                ? vaccine.dateCreated
                                    ? dayjs(vaccine.dateCreated).format('YYYY-MM-DD HH:mm:ss')
                                    : timeStamp
                                : timeStamp,
                            userModified: isCreated ? null : userId,
                            dateModified: isCreated ? null : timeStamp,
                            receivedDate: isCreated
                                ? timeStamp
                                : vaccine.receivedDate || timeStamp,
                            patientDrugAllergies: [],
                            vactemdtid: vaccine.vactemdtid,
                            vaccine: vaccine.vaccine,
                        };

                        if (vaccineData.dateServ && !isCreated) {
                            newArr.push(vaccineData);
                        }
                    });
                });
                if (epiId !== null) {
                    newArr = newArr.filter((item) => item.epiId === epiId);
                }
                if (newArr?.length) {
                    try {
                        const result = await InsertPatientEPI(newArr);
                        if (result?.isSuccess) {
                            notification.success({
                                message: 'บันทึกสำเร็จ',
                                description: 'บันทึกข้อมูลสำเร็จ',
                            });
                            setDataAll(
                                newArr.map((item) => ({
                                    ...item,
                                    dose: String(item.dose) || null,
                                }))
                            );

                            const epiIdDataList = Array.isArray(result?.responseData)
                                ? result?.responseData
                                : result?.responseData
                                    ? [result?.responseData]
                                    : [];
                            const tmpSelectData = await handleChangeTmpSelect(selectedTmp);
                            if (tmpSelectData) {
                                const updatedData = dataSourceVaccine.map((item) => {
                                    const updatedVaccines = item.vaccine.map((vaccine, index) => {
                                        const matchedData = newArr.find((insData) => {
                                            return (
                                                insData.ageId === vaccine.ageId &&
                                                insData.vaccine === vaccine.vaccine &&
                                                insData.vactemdtid === vaccine.vactemdtid
                                            );
                                        });
                                        if (matchedData) {
                                            const epiIndex = newArr.findIndex(
                                                (insData) => insData === matchedData
                                            );
                                            return {
                                                ...vaccine,
                                                epiId: epiIdDataList[epiIndex] || vaccine.epiId,
                                                received: 'Y',
                                                receivedDate: matchedData.receivedDate,
                                                dateServ: matchedData.dateServ,
                                                dose: matchedData.dose,
                                                ageId: matchedData.ageId,
                                            };
                                        }
                                        return vaccine;
                                    });

                                    return { ...item, vaccine: updatedVaccines };
                                });

                                setDataSourceVaccine(updatedData);
                                hisRecordVaccineRef.current.getHis();
                            }
                            setIsModalVaccineVisible(false);
                        }
                    } catch (error) {
                        notification.error({
                            message: 'ข้อผิดพลาดจากการส่งข้อมูล',
                            description: 'มีข้อมูลบางอย่างผิดพลาด กรุณาตรวจสอบอีกครั้ง',
                        });
                    }
                }

                setLoading(false);
                return newArr;
            };

    const handleTabChange = (key) => {
        setCurrentTab(key);
        if (key === '2') {
            handleChangeTmpSelect(selectedTmp);
        } else if (key === '1') {
            if (hisRecordVaccineRef.current) {
                hisRecordVaccineRef.current.getHis();
            }
        }
    };
    const handleChangeDos = (ageId, vaccineId) => (event) => {
        const { value } = event.target;

        setDataSourceVaccine((prev) => {
            const newData = prev.map((item) =>
                item.age === ageId
                    ? {
                        ...item,
                        vaccine: item.vaccine.map((v) =>
                            v.vactemdtid === vaccineId ? { ...v, dose: value } : v
                        ),
                    }
                    : item
            );

            return newData;
        });
    };
    const handleChangeReceived = (ageId, vaccineId) => (event) => {
        const { checked } = event.target;
        const receivedValue = checked ? 'Y' : null;
        setDataSourceVaccine((prev) =>
            prev.map((item) =>
                item.age === ageId
                    ? {
                        ...item,
                        vaccine: item.vaccine.map((vaccineItem) =>
                            vaccineItem.vactemdtid === vaccineId
                                ? {
                                    ...vaccineItem,
                                    received: receivedValue,
                                    dose:
                                        receivedValue === 'Y'
                                            ? vaccineItem.dose && vaccineItem.dose !== '0'
                                                ? vaccineItem.dose
                                                : '1'
                                            : '0',
                                    dateServ: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                                }
                                : vaccineItem
                        ),
                    }
                    : item
            )
        );
    };
    const handleChangeReceivedDate = (ageId, vaccineId, date) => {
        setDataSourceVaccine((prev) =>
            prev.map((item) =>
                item.age === ageId
                    ? {
                        ...item,
                        vaccine: item.vaccine.map((vaccineItem) =>
                            vaccineItem.vactemdtid === vaccineId
                                ? { ...vaccineItem, dateServ: date, receivedDate: date }
                                : vaccineItem
                        ),
                    }
                    : item
            )
        );
    };
    const handleClickVisibleVaccineModal = (data, epiId) => async () => {
        setLoading(true);
        const { error, result } = await withResolve(
            `/api/SocialMedication/patient-epi-vaccine-template-by-id?EpiId=${data.epiId}`
        ).fetch();
        if (error) return;

        setIsModalVaccineVisible(true);
        setFormDetailVaccine((prev) => ({
            ...prev,
            dose: data.dose || null,
            epiId: epiId || null,
            ageId: data.ageId,
            vccType: data.vaccine || null,
            dateServ: data.dateServ || null,
            received: data.received || null,
            userCreated: data.userCreated || null,
            dateCreated: data.dateCreated || null,
            dateModified: data.dateModified || null,
            userModified: data.userModified || null,
            remark: result.remark || null,
            lotno: result?.lotno || null,
            provider: result?.provider || null,
            serialno: result?.serialno || null,
            vccPlaces: result?.vccPlaces || null,
            expireDate: result?.expireDate || null,
            manufacturer: result?.manufacturer || null,
            allergyLevels:
                patientDetail?.drug_Allergies_Display
                    ?.filter((item) => item.epiId === epiId)
                    ?.map((item) => ({
                        ptAdrId: item.id,
                        epiId: item.epiId,
                        levels: item.alevel,
                        otherSymptom: item.symptom,
                    })) || [],
        }));

        setLoading(false);
    };
    const displayAge = (age) => {
        const select = dataSelect.find((item) => item.datavalue === age);
        return select.datadisplay;
    };
    const displayVaccine = (code) => {
        const select = getVaccine.find((item) => item.code === code);
        return select?.name;
    };
    const handleChangeTmpSelect = async (value) => {
        setDataSourceVaccine([]);
        setSelectedTmp(value);

        if (!value) return;

        const { error, result: resResult } = await withResolve(
            `/api/SocialMedication/GetVaccineTemplateList/${value}`
        ).fetch();

        if (error) return;
        const vaccineDetails = resResult.tbmVaccineTemplateListDetail;
        const ageGroupedVaccines = {};

        vaccineDetails.forEach(({ age, userCreated, userModified, ...vaccine }) => {
            const findData = epiList.find((v) => v.vccType === vaccine.vaccine) || {};
            if (!ageGroupedVaccines[age]) {
                ageGroupedVaccines[age] = {
                    age,
                    userCreated,
                    userModified,
                    vaccines: [],
                };
            }
            let receivedValue = findData.received;

            if (receivedValue === null) {
                if (findData.epiId) {
                    receivedValue = 'Y';
                }
            }

            ageGroupedVaccines[age].vaccines.push({
                ...vaccine,
                ageId: age || null,
                epiId: findData.epiId || null,
                dose: findData.dose || null,
                vaccineName: displayVaccine(vaccine.vaccine),
                received: receivedValue,
                dateServ: findData.dateServ || null,
                userCreated: findData.userCreated || '',
                userModified: findData.userModified || '',
            });
        });

        const formattedResult = Object.values(ageGroupedVaccines).map(
            (group, index) => ({
                key: index,
                age: group.age,
                vaccine: group.vaccines,
            })
        );
        setDataSourceVaccine(formattedResult);
        return formattedResult;
    };
    useEffect(() => {
        GetVcctype().then((data) => {
            setGetVaccine(data);
        });
        GetUserMas().then((data) => {
            setUserMasDropdown(data);
        });
        GetAllergyLevelsMas().then((data) => {
            setAllergyLevelsMasDropDown(data);
        });
        form.setFieldsValue({
            patientDrugAllergies: [{}],
        });
        fecthTmpVaccine();
    }, []);
    useEffect(() => {
        if (patient?.patientId) {
            GetPatientEPIByPatientId(patient.patientId);
            handleChangeTmpSelect(null)
            fetchEPIList(patient.patientId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patient]);
    const PartsVaccineHis = () => {
        const columns = [
            {
                title: 'วันที่รับบริการ',
                dataIndex: 'dateServ',
                align: 'center',
                width: 130,
                render: (v) =>
                    dayjs(v, 'MM/DD/YYYY HH:mm:ss').format('DD/MM/BBBB HH:mm'),
            },
            {
                title: 'วัคซีน',
                dataIndex: 'name',
            },
            {
                title: 'เข็มที่',
                dataIndex: 'dose',
                align: 'center',
                width: 70,
            },
            {
                title: 'Lot no.',
                dataIndex: 'lotno',
                width: 145,
            },
            {
                title: 'รหัส สนย',
                dataIndex: 'x',
            },
            {
                title: 'ประเภท',
                dataIndex: 'serviceId',
                align: 'center',
                width: 100,
                render: (v) => (v ? 'OPD/IPD' : 'PCU'),
            },
            {
                title: 'รับบริการที่',
                dataIndex: 'x',
                // align: 'center',
                width: 100,
            },
            {
                title: 'วันที่บันทึก',
                dataIndex: 'dateCreated',
                align: 'center',
                width: 130,
                render: (v) =>
                    dayjs(v, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/BBBB HH:mm'),
            },
        ];
        return (
            <Table
                size="small"
                rowClassName="data-value"
                rowKey="epiId"
                columns={columns}
                dataSource={vaccineHis}
                scroll={{ y: 345 }}
                pagination={false}
            />
        );
    };
    // Components
    const PartsModal = () => {
        return (
            <Modal
                title={
                    <GenRow
                        gutter={[4, 8]}
                        align="middle"
                        style={{ marginTop: -8, marginBottom: -8 }}
                    >
                        <Col>
                            <LabelTopicPrimary18 text="ข้อมูลการรับวัคซีน" />
                        </Col>
                    </GenRow>
                }
                centered
                visible={vsbModal}
                // closeIcon={false}
                closable={false}
                width={1145}
                cancelText="ปิด"
                okText="บันทึก"
                onOk={() => { }}
                onCancel={() => {
                    setVsbModal(false);
                }}
                okButtonProps={{ hidden: true }}
            // cancelButtonProps={{ loading: loading }}
            >
                <div
                    style={{
                        marginRight: -14,
                        marginLeft: -14,
                        marginBottom: -14,
                        marginTop: -14,
                    }}
                >
                    {/* <HisRecordVaccine
                    patientId={patientId}
                    serviceId={serviceId}
                    clinicId={clinicId}
                    hn={hn}
                    runHn={runHn}
                    yearHn={yearHn}
                    optionsUser={optionsUser}
                /> */}
                    <Tabs
                        type="card"
                        size="small"
                        defaultActiveKey="1"
                        activeKey={currentTab}
                        onChange={handleTabChange}
                    >
                        <Tabs.TabPane key="1" tab="ทะเบียนวัคซีน">
                            <HisRecordVaccine
                                ref={hisRecordVaccineRef}
                                patientId={patientId}
                                serviceId={serviceId}
                                clinicId={clinicId}
                                hn={hn}
                                runHn={runHn}
                                yearHn={yearHn}
                                optionsUser={optionsUser}
                                returnHis={(his) => {
                                    const mapping = map(his, o => {
                                        const vccDetails = o?.patientEPIs?.[0] || {}
                                        return {
                                            ...o,
                                            ...vccDetails,
                                        }
                                    })
                                    console.log('his :>> ', mapping);
                                    setVaccineHis(reverse(mapping))
                                }}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane key="2" tab="ชุดวัคซีน">
                            <Row
                                style={{ marginInline: 10, marginBottom: 10 }}
                                align="middle"
                                justify="space-between"
                            >
                                <Col style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Text className="gx-text-primary">
                                        เลือกชุดวัคซีน :
                                    </Typography.Text>
                                    <Select
                                        size="small"
                                        allowClear
                                        value={selectedTmp}
                                        options={dataTmp?.map((item) => ({
                                            label: item.name,
                                            value: item.code,
                                        }))}
                                        placeholder="เลือกชุดวัคซีน"
                                        style={{ width: 150 }}
                                        loading={loading}
                                        onChange={handleChangeTmpSelect}
                                        disabled={!epiList}
                                    />
                                    <Button
                                        className="mb-0"
                                        type="primary"
                                        style={{
                                            background: '#FFFFFF',
                                            marginTop: '11px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        onClick={() => {
                                            history.push({
                                                pathname:
                                                    '/social%20medication/social-medication-set-medication-code/social-medication-temp-vac',
                                            });
                                        }}
                                        size="small"
                                        icon={<PlusOutlined />}
                                    >
                                        เพิ่ม Template วัคซีน
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        className="mb-0"
                                        type="primary"
                                        style={{ background: '#FFFFFF' }}
                                        onClick={handleClickSave()}
                                        disabled={dataSourceVaccine.length === 0}
                                    >
                                        บันทึก
                                    </Button>
                                </Col>
                            </Row>
                            <Table
                                dataSource={dataSourceVaccine}
                                columns={columns}
                                pagination={false}
                                loading={loading}
                                scroll={{ y: 400, x: 1555 }}
                            />
                        </Tabs.TabPane>
                        <Tabs.TabPane key="3" tab="ประวัติการรับวัคซีน">
                            {PartsVaccineHis()}
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </Modal>
        );
    };
    return (
        <div>
            <Button
                size={size}
                type={type}
                onClick={(e) => {
                    e.stopPropagation();
                    setVsbModal(true);
                }}
                disabled={disabled}
                style={{ width: width, marginBottom: 0, ...style }}
                {...props}
            >
                ทะเบียนวัคซีน
            </Button>
            {vsbModal && PartsModal()}
        </div>
    );
}
const apis = {
    xxx: {
        url: 'xxxx',
        method: 'GET',
        return: 'responseData',
        sendRequest: false,
    },
};
