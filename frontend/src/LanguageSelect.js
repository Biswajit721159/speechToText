import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const LanguageSelect = ({ value, onChange, label }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={onChange}>
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Spanish</MenuItem>
        <MenuItem value="bn">Bengali</MenuItem>
        <MenuItem value="hi">Hindi</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelect;
