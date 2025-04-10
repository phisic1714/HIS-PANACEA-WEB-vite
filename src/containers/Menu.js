import { SearchOutlined } from "@ant-design/icons";
import { Card, CardContent, CircularProgress, Divider, ThemeProvider } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Box } from "@mui/system";
import { Checkbox, Input, Select } from "antd";
import { withResolve } from "api/create-api";
import { useAuth } from "authentication";
import { useEffect, useState } from "react";
import Label from "./components/menu/label";
import MenuCardContent from "./components/menu/menu-card-content";
import MenuCardHeader from "./components/menu/menu-card-header";
import MenuLayout from "./components/menu/menu-layout";
import createMuiTheme from "./themes/create-mui-theme";

const mockModules = [
    {
        "id": 2,
        "fkSystemId": 3,
        "code": "67.0",
        "name": "ระบบงานทรัพยากรบุคคล",
        "nameEn": "Human Resource",
        "icon": null,
        "path": "",
        "active": true
    },
    {
        "id": 3,
        "fkSystemId": 3,
        "code": "68.0",
        "name": "ระบบงานเงินเดือนและค่าตอบแทน",
        "nameEn": "Payroll & Compensation",
        "icon": null,
        "path": "",
        "active": true
    },
    {
        "id": 4,
        "fkSystemId": 3,
        "code": "69.0",
        "name": "ระบบงานพัฒนาคุณภาพ",
        "nameEn": "Quality Development",
        "icon": null,
        "path": "",
        "active": true
    },
    {
        "id": 73,
        "fkSystemId": 3,
        "code": "65.0",
        "name": "ระบบงานบริหารทรัพย์สิน",
        "nameEn": "Assets Management",
        "icon": null,
        "path": "http://10.99.0.16/asset",
        "active": true
    },
    {
        "id": 74,
        "fkSystemId": 3,
        "code": "70.0",
        "name": "ระบบบริหารสัญญาและแผนงบประมาณ",
        "nameEn": "Contract Management & Budget Plan",
        "icon": null,
        "path": "",
        "active": true
    },
    {
        "id": 75,
        "fkSystemId": 3,
        "code": "71.0",
        "name": "ระบบข้อมูลเพื่อการบริหาร",
        "nameEn": "Business Intelligence",
        "icon": null,
        "path": "",
        "active": true
    },
    {
        "id": 76,
        "fkSystemId": 4,
        "code": "66.0",
        "name": "ระบบงานบัญชี",
        "nameEn": "Account",
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 77,
        "fkSystemId": 4,
        "code": "66.1",
        "name": "ระบบบัญชีแยกประเภททั่วไป",
        "nameEn": "General Ledger",
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 78,
        "fkSystemId": 4,
        "code": "66.2",
        "name": "งานบัญชีเจ้าหนี้",
        "nameEn": "Account Payable",
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 79,
        "fkSystemId": 4,
        "code": "66.3",
        "name": "ระบบบัญชีลูกหนี้",
        "nameEn": "Account Receiveable",
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 80,
        "fkSystemId": 4,
        "code": "66.4",
        "name": "ระบบงานภาษี",
        "nameEn": "Tax",
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 81,
        "fkSystemId": 5,
        "code": "64.0",
        "name": "ระบบงานแพทย์ผู้ป่วยใน",
        "nameEn": "Doctor Inpatient Care",
        "icon": null,
        "path": "http://10.99.0.16/ipd",
        "active": true
    },
    {
        "id": 82,
        "fkSystemId": 6,
        "code": "74.0",
        "name": "EMR Tablet",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 83,
        "fkSystemId": 6,
        "code": "74.1",
        "name": "OPD",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 84,
        "fkSystemId": 6,
        "code": "74.2",
        "name": "IPD",
        "nameEn": null,
        "icon": null,
        "path": "http://192.168.16.124:3031/",
        "active": true
    },
    {
        "id": 85,
        "fkSystemId": 6,
        "code": "74.3",
        "name": "ER",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 86,
        "fkSystemId": 8,
        "code": "72.0",
        "name": "Self-Register Kiosk",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 87,
        "fkSystemId": 8,
        "code": "73.0",
        "name": "Self-Payment Kiosk",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 88,
        "fkSystemId": 9,
        "code": "75.1",
        "name": "QUEUE",
        "nameEn": null,
        "icon": null,
        "path": null,
        "active": true
    },
    {
        "id": 89,
        "fkSystemId": 7,
        "code": "59",
        "name": "งานจัดการเอกสาร",
        "nameEn": "Document Management",
        "icon": null,
        "path": null,
        "active": true
    },
]


const themeColor = JSON.parse(
    localStorage.getItem('themeColor')
);

const theme = createMuiTheme()

const MenuPage = () => {
    const { authUserMenu, authUser } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [systems, setSystems] = useState([]);
    const [modules, setModules] = useState([]);
    const [userMenus, setUserMenus] = useState([]);
    const [checkHideDisabled, setCheckHideDisabled] = useState(false);

    const [filter, setFilter] = useState({
        systems: [],
        modules: [],
    });

    const [search, setSearch] = useState({
        system: null,
        module: "",
    });

    useEffect(() => {
        const fetchSystems = async () => {
            const mockSystems = [{
                "id": 1,
                "code": "001",
                "name": "ระบบงานบริการส่วนหน้า HIS",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 3,
                "code": "002",
                "name": "ระบบงาน Back Office",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 4,
                "code": "003",
                "name": "SAP",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 5,
                "code": "004",
                "name": "IPD Roundward",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 6,
                "code": "005",
                "name": "EMR Tablet",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 7,
                "code": "006",
                "name": "Document Management",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 8,
                "code": "007",
                "name": "Kiosk",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            },
            {
                "id": 9,
                "code": "008",
                "name": "Queue",
                "nameEN": null,
                "icon": null,
                "path": null,
                "active": true
            }]
            setSystems(mockSystems.map((v) => ({ ...v, expanded: true })))
        }

        const fetchModule = async () => {
            setIsLoading(true);
            let { error, result } = await withResolve("/api/Module/GetMenu/poweruser").get();
            setIsLoading(false);
            if (error) return
            result = [...result.map((v) => ({ ...v, fkSystemId: 1, code: v.seq, name: v.moduleName, nameEn: v.eName, active: true })), ...mockModules.map((v) => ({ ...v, name: `${v.code} ${v.name}` }))];
            setModules(result);
        }

        fetchSystems()
        fetchModule();
    }, []);

    useEffect(() => {
        if (!authUser) window.location.href = '/signin';
    }, [authUser]);


    useEffect(() => {
        if (systems.length && search.system) {
            const filterSystems = systems.filter((v) => v.id === search.system);
            const searchLowerCase = search.module.toLowerCase();

            setFilter({
                systems: filterSystems,
                modules: searchLowerCase
                    ? modules.filter(
                        (module) =>
                            (module.name &&
                                module.name.toLowerCase().includes(searchLowerCase)) ||
                            (module.nameEn &&
                                module.nameEn.toLowerCase().includes(searchLowerCase))
                    )
                    : modules,
            });
        } else {
            const searchLowerCase = search.module.toLowerCase();
            setFilter({
                systems: systems,
                modules: modules.filter(
                    (module) =>
                        (module.name &&
                            module.name.toLowerCase().includes(searchLowerCase)) ||
                        (module.nameEn &&
                            module.nameEn.toLowerCase().includes(searchLowerCase))
                ),
            });
        }
    }, [systems, modules, search.system, search.module]);

    useEffect(() => {
        if (authUserMenu) {
            setUserMenus(authUserMenu.responseData);
        }
    }, [authUserMenu])

    return (
        <ThemeProvider theme={theme}>
            <MenuLayout>
                <Card>
                    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress size="20rem" />
                    </Box> : <>
                        <MenuCardHeader themeColor={themeColor} setIsLoading={setIsLoading} />
                        <Divider sx={{ backgroundColor: '#ECEFF1' }} />
                        <CardContent sx={{ p: 2 }}>
                            <Grid container spacing={1}>
                                <Grid xs={12} md={6} lg={4} xl={3}>
                                    <Label text="ระบบหลัก" />
                                    <Select
                                        value={search.system}
                                        onChange={(v) => setSearch({ ...search, system: v })}
                                        showSearch
                                        allowClear
                                        placeholder="เลือกระบบหลัก"
                                        style={{ width: '100%' }}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={systems.map((v) => ({ value: v.id, label: v.name }))}
                                    />
                                </Grid>
                                <Grid xs={12} md={6} lg={4} xl={3}>
                                    <Label text="ระบบงาน" />
                                    <Input value={search.module} onChange={(e) => setSearch({ ...search, module: e.target.value })} prefix={<SearchOutlined style={{ color: "#d6d6d6" }} />} placeholder="ค้นหาระบบงาน ..." />
                                </Grid>
                                <Grid alignSelf="center" pt={3}>
                                    <Checkbox checked={checkHideDisabled} onChange={(e) => setCheckHideDisabled(e.target.checked)}>แสดงเฉพาะที่มีสิทธิใช้งาน</Checkbox>
                                </Grid>
                            </Grid>
                            <MenuCardContent systems={filter.systems} modules={filter.modules} userMenus={userMenus} checkHideDisabled={checkHideDisabled} />
                        </CardContent>
                    </>}
                </Card>
            </MenuLayout>
        </ThemeProvider >
    )
}

export default MenuPage;