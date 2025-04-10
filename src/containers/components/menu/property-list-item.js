import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";

export const PropertyListItem = (props) => {
  const {
    align = "vertical",
    children,
    disableGutters,
    value,
    label,
    href,
    isHis = false,
    disabled = true,
    moduleId,
    ...other
  } = props;
  const history = useHistory();

  const handleSelect = async (path) => {
    if (isHis) {
      history.push(path);
      // setLoading(true);
      // const { error, result } = await apiBaseURL.fetch();
      // setLoading(false);
      // if (error)
      //   return toast.error("ไม่สามารถไประบบสารสนเทศโรงพยาบาล (PANACEA+) ได้");
      // let path = result.fullUrl;
      // if (moduleId) path += `&module=${moduleId}`;
      // window.location.assign(path);
      // return;
    } else {
      window.location.assign(path);
    }

    // if (path) window.location.assign(path);
  };

  return (
    <ListItem
      sx={{
        px: disableGutters ? 0 : 3,
        py: 1.5,
      }}
      {...other}
    >
      <ListItemText
        disableTypography
        primary={
          !disabled ? (
            <Typography
              sx={{
                minWidth: align === "vertical" ? "inherit" : 180,
                "&:hover": {
                  textDecoration: "underline",
                  cursor: "pointer",
                },
              }}
              variant="h6"
              onClick={() => handleSelect(href)}
            >
              {label}
            </Typography>
          ) : (
            <Typography color="grey">{label}</Typography>
          )
        }
        secondary={
          <Box
            sx={{
              flex: 1,
              mt: align === "vertical" ? 0.5 : 0,
            }}
          >
            {children || (
              <Typography color="black" variant="h6">
                {value}
              </Typography>
            )}
          </Box>
        }
        sx={{
          display: "flex",
          flexDirection: align === "vertical" ? "column" : "row",
          my: 0,
        }}
      />
    </ListItem>
  );
};
