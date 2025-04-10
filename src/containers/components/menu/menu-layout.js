import { Box, Container } from '@mui/material'

const MenuLayout = ({ children }) => {
    return (
        <div style={{ overflow: "auto", height: "100%" }}>
            <div style={{
                backgroundImage: 'url("/assets/images/bg-top-login.jpg")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundAttachment: "fixed",
                display: "flex",
                flex: "1 1 auto",
                minHeight: "100%",
                backdropFilter: "blur(10px)",
            }}>
                <Box
                    sx={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center",
                        flex: "1 1 auto",
                    }}
                >
                    <Container
                        maxWidth="xl"
                        sx={{
                            py: {
                                xs: "10px",
                                md: "20px",
                            },
                        }}
                    >
                        {children}
                    </Container>
                </Box>
            </div>
        </div>
    )
}

export default MenuLayout