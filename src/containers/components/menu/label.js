import { Typography } from "@mui/material";

const Label = (props) => {
  const { text, required, ...other } = props;

  let customStyle = {};

  if (required)
    customStyle = {
      ...customStyle,
      "&::after": { content: "' *'", color: "red" },
    };

  return (
    <Typography
      color="primary"
      sx={{ typography: { md: "subtitle1", xs: "subtitle2" }, ...customStyle }}
      {...other}
    >
      {text}
    </Typography>
  );
};

export default Label;
