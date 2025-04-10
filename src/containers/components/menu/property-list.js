import List from '@mui/material/List';

export const PropertyList = (props) => {
  const { children } = props;

  return (
    <List disablePadding>
      {children}
    </List>
  );
};
