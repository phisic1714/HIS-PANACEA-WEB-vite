import { alpha, createTheme } from '@mui/material';

const neutral = {
    50: "#F8F9FA",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D2D6DB",
    400: "#9DA4AE",
    500: "#6C737F",
    600: "#4D5761",
    700: "#2F3746",
    800: "#1C2536",
    900: "#111927",
};

const createShadows = () => {
    return [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.08)',
        '0px 1px 5px rgba(0, 0, 0, 0.08)',
        '0px 1px 8px rgba(0, 0, 0, 0.08)',
        '0px 1px 10px rgba(0, 0, 0, 0.08)',
        '0px 1px 14px rgba(0, 0, 0, 0.08)',
        '0px 1px 18px rgba(0, 0, 0, 0.08)',
        '0px 2px 16px rgba(0, 0, 0, 0.08)',
        '0px 3px 14px rgba(0, 0, 0, 0.08)',
        '0px 3px 16px rgba(0, 0, 0, 0.08)',
        '0px 4px 18px rgba(0, 0, 0, 0.08)',
        '0px 4px 20px rgba(0, 0, 0, 0.08)',
        '0px 5px 22px rgba(0, 0, 0, 0.08)',
        '0px 5px 24px rgba(0, 0, 0, 0.08)',
        '0px 5px 26px rgba(0, 0, 0, 0.08)',
        '0px 6px 28px rgba(0, 0, 0, 0.08)',
        '0px 6px 30px rgba(0, 0, 0, 0.08)',
        '0px 6px 32px rgba(0, 0, 0, 0.08)',
        '0px 7px 34px rgba(0, 0, 0, 0.08)',
        '0px 7px 36px rgba(0, 0, 0, 0.08)',
        '0px 8px 38px rgba(0, 0, 0, 0.08)',
        '0px 8px 40px rgba(0, 0, 0, 0.08)',
        '0px 8px 42px rgba(0, 0, 0, 0.08)',
        '0px 9px 44px rgba(0, 0, 0, 0.08)',
        '0px 9px 46px rgba(0, 0, 0, 0.08)'
    ];
};

const createPalette = () => {
    return {
        primary: {
            main: '#429801'
        },
        grey: '#ffffff',
        white: '#ffffff',
        divider: alpha("#000000", 0.12),
        text: {
            primary: neutral[900],
            secondary: neutral[500],
            disabled: alpha(neutral[900], 0.38),
        },
    }
}

const createComponents = () => {
    return {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    borderRadius: "2px",
                },
            },
        },

    }
}

const createTypography = () => ({
    fontFamily: "'sarabun', sans-serif",
    body1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.5,
    },
    body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.57,
    },
    h6: {
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: 1.2,
    },
    subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.57,
    },
    subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.57,
    },
    caption: {
        fontSize: "0.75rem",
        fontWeight: 500,
        lineHeight: 1.66,
    },
})



const createMuiTheme = () => {
    const shadows = createShadows();
    const palette = createPalette();
    const components = createComponents();
    const typography = createTypography();

    return createTheme({
        shadows,
        components,
        typography,
        palette,
    });
}

export default createMuiTheme