import { Autocomplete, TextField } from "@mui/material";

const DynamicAutocomplete = ({
  value,
  onChange,
  options,
  getOptionLabel,
  renderOption,
  error,
  helperText,
  optionId = "id",
  optionLabel = "name",
  placeholder,
  ...props
}) => {
  const defaultGetOptionLabel = (option) => {
    if (Array.isArray(optionLabel)) {
      return optionLabel.map((label) => option[label] || "").join(" : ");
    }
    return option[optionLabel] || "";
  };

  const customIsOptionEqualToValue = (option, value) => {
    return option.id === value.id; // Customize this comparison based on your specific use case
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      options={options}
      getOptionLabel={getOptionLabel || defaultGetOptionLabel}
      renderOption={
        renderOption ||
        ((props, option) => (
          <li {...props} key={option[optionId]}>
            {defaultGetOptionLabel(option)}
          </li>
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || "เลือก"}
          variant="outlined"
          error={error}
          helperText={error && helperText}
        />
      )}
      isOptionEqualToValue={customIsOptionEqualToValue}
      {...props}
    />
  );
};

export default DynamicAutocomplete;
