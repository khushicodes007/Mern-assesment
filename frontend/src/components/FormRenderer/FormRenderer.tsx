import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
} from '@mui/material';

interface FieldConfig {
  fieldName: string;
  label: string;
  value?: any;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: { label: string; value: string | number }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

interface FormSchema {
  title: string;
  fields: FieldConfig[];
}

interface FormRendererProps {
  schema: FormSchema;
  onSubmit: (data: any) => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ schema, onSubmit }) => {
  const [formData, setFormData] = useState<any>(
    schema.fields.reduce((acc, field) => {
      acc[field.fieldName] = field.value || '';
      return acc;
    }, {} as any)
  );

  const [errors, setErrors] = useState<any>({});

  const handleChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: null });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    schema.fields.forEach((field) => {
      const value = formData[field.fieldName];

      if (field.validation?.required && !value) {
        newErrors[field.fieldName] = `${field.label} is required`;
      }

      if (field.type === 'number') {
        if (field.validation?.min && value < field.validation.min) {
          newErrors[field.fieldName] = `Minimum value is ${field.validation.min}`;
        }
        if (field.validation?.max && value > field.validation.max) {
          newErrors[field.fieldName] = `Maximum value is ${field.validation.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {schema.title}
      </Typography>

      {schema.fields.map((field) => {
        switch (field.type) {
          case 'text':
          case 'number':
            return (
              <TextField
                key={field.fieldName}
                fullWidth
                label={field.label}
                type={field.type}
                value={formData[field.fieldName]}
                onChange={(e) => handleChange(field.fieldName, e.target.value)}
                error={!!errors[field.fieldName]}
                helperText={errors[field.fieldName]}
                margin="normal"
                required={field.validation?.required}
              />
            );

          case 'select':
            return (
              <FormControl
                key={field.fieldName}
                fullWidth
                margin="normal"
                error={!!errors[field.fieldName]}
              >
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={formData[field.fieldName]}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  label={field.label}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[field.fieldName] && (
                  <Typography color="error" variant="caption">
                    {errors[field.fieldName]}
                  </Typography>
                )}
              </FormControl>
            );

          case 'boolean':
            return (
              <FormControlLabel
                key={field.fieldName}
                control={
                  <Checkbox
                    checked={formData[field.fieldName]}
                    onChange={(e)=> handleChange(field.fieldName, e.target.checked)}
                    />
                    }
                    label={field.label}
                    />
                    );
                    default:
        return null;
    }
  })}

  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
    Submit
  </Button>
</Box>
);
};
export default FormRenderer;