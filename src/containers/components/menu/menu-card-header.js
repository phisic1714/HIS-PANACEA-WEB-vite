import { UserOutlined } from '@ant-design/icons';
import { Box, Button, CardHeader, Stack, Typography } from '@mui/material';
import { useAuth } from 'authentication';
import { useDatetime } from "components/Hooks/useDatetime";

const userFromSession = JSON.parse(sessionStorage.getItem("user"));
const user = userFromSession?.responseData
const hosParam = JSON.parse(localStorage.getItem("hos_param"));

const MenuCardHeader = ({ themeColor, setIsLoading }) => {
    const { userSignOut } = useAuth();

    const currentDateTime = useDatetime();

    const handleLogout = async () => {
        setIsLoading(true)
        await userSignOut(() => {
            history.replace('/home');
            window.location.reload(false);
        });
        setIsLoading(false)
    }

    return (
        <CardHeader
            title={
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            display: "flex",
                            height: 80,
                            width: 80,
                        }}
                    >
                        <img src="/assets/images/logo.png" alt="logo" />
                    </Box>
                    <Stack>
                        <Typography variant="h5">Panacea Plus Center</Typography>
                        <Typography color="text.secondary">{hosParam?.hospName || 'โรงพยาบาล'}</Typography>
                    </Stack>
                </Stack>
            }
            action={
                <Stack textAlign="right">
                    <Stack direction="row" justifyContent="end" spacing={1}>
                        <UserOutlined style={{ fontSize: 20, color: themeColor?.primaryColor }} />
                        <Typography variant="body1">{user?.userId}</Typography>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleLogout()}>ออกจากระบบ</Button>
                    </Stack>
                    <Stack direction="row" justifyContent="end" spacing={1}>
                        <Typography variant="body1">{user?.preName}{user?.firstName} {user?.lastName}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="end" spacing={1}>
                        <Typography variant="body2">แผนก</Typography>
                        <Typography variant="body2">{user?.departName}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="end" spacing={1}>
                        <Typography variant="body2">ประเภทผู้ใช้</Typography>
                        <Typography variant="body2">{user?.userType}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {currentDateTime}
                    </Typography>
                </Stack>
            }
        />
    )
}

export default MenuCardHeader