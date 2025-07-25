'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  CalendarIcon, Upload, Loader2Icon, AlertCircleIcon,
  CheckCircleIcon, InfoIcon, EyeIcon, EyeOffIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const DynamicFormRenderer = ({ 
  formDefinition, 
  initialData = {}, 
  onSubmit, 
  onSaveDraft,
  loading = false,
  showRequiredIndicator = true,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm({
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Watch all form values for conditional logic
  const watchedValues = watch();

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((fieldKey) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((fieldKey, files) => {
    if (files && files.length > 0) {
      const fileList = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
      
      setUploadedFiles(prev => ({
        ...prev,
        [fieldKey]: fileList
      }));
      
      // Set form value
      setValue(fieldKey, fileList);
    }
  }, [setValue]);

  // Check if field should be visible based on conditional logic
  const isFieldVisible = useCallback((field) => {
    if (!field.conditional_logic || !field.conditional_logic.conditions) {
      return !field.is_hidden;
    }

    const { conditions, operator = 'AND' } = field.conditional_logic;
    
    const results = conditions.map(condition => {
      const { field: conditionField, operator: condOp, value: condValue } = condition;
      const fieldValue = watchedValues[conditionField];

      switch (condOp) {
        case 'equals':
          return fieldValue === condValue;
        case 'not_equals':
          return fieldValue !== condValue;
        case 'contains':
          return fieldValue && fieldValue.includes(condValue);
        case 'greater_than':
          return Number(fieldValue) > Number(condValue);
        case 'less_than':
          return Number(fieldValue) < Number(condValue);
        case 'is_empty':
          return !fieldValue || fieldValue === '';
        case 'is_not_empty':
          return fieldValue && fieldValue !== '';
        default:
          return true;
      }
    });

    if (operator === 'OR') {
      return results.some(result => result);
    } else {
      return results.every(result => result);
    }
  }, [watchedValues]);

  // Generate validation rules for react-hook-form
  const getValidationRules = useCallback((field) => {
    const rules = {};
    
    if (field.is_required) {
      rules.required = `${field.label} is required`;
    }

    if (field.validation_rules) {
      const { min_length, max_length, pattern, min_value, max_value } = field.validation_rules;
      
      if (min_length) {
        rules.minLength = {
          value: min_length,
          message: `${field.label} must be at least ${min_length} characters`
        };
      }
      
      if (max_length) {
        rules.maxLength = {
          value: max_length,
          message: `${field.label} must be no more than ${max_length} characters`
        };
      }
      
      if (pattern) {
        rules.pattern = {
          value: new RegExp(pattern),
          message: `${field.label} format is invalid`
        };
      }
      
      if (min_value !== undefined) {
        rules.min = {
          value: min_value,
          message: `${field.label} must be at least ${min_value}`
        };
      }
      
      if (max_value !== undefined) {
        rules.max = {
          value: max_value,
          message: `${field.label} must be no more than ${max_value}`
        };
      }
    }

    // Field type specific validation
    if (field.field_type === 'email') {
      rules.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      };
    }

    return rules;
  }, []);

  // Render different field types
  const renderField = useCallback((field) => {
    if (!isFieldVisible(field)) {
      return null;
    }

    const fieldError = errors[field.field_key];
    const validationRules = getValidationRules(field);
    const fieldValue = watchedValues[field.field_key];

    const commonProps = {
      className: `${field.css_classes || ''} ${fieldError ? 'border-red-500' : ''}`,
      disabled: field.is_readonly
    };

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type={field.field_type === 'email' ? 'email' : 'text'}
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case 'password':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <div className="relative">
                <Input
                  {...formField}
                  {...commonProps}
                  type={showPassword[field.field_key] ? 'text' : 'password'}
                  placeholder={field.placeholder}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => togglePasswordVisibility(field.field_key)}
                >
                  {showPassword[field.field_key] ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          />
        );

      case 'number':
      case 'integer':
      case 'float':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type="number"
                step={field.field_type === 'integer' ? '1' : 'any'}
                placeholder={field.placeholder}
                onChange={(e) => {
                  const value = field.field_type === 'integer' 
                    ? parseInt(e.target.value) || '' 
                    : parseFloat(e.target.value) || '';
                  formField.onChange(value);
                }}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <textarea
                {...formField}
                {...commonProps}
                placeholder={field.placeholder}
                rows={field.field_options?.rows || 4}
                className={`${commonProps.className} min-h-[80px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Select 
                value={formField.value || ''} 
                onValueChange={formField.onChange}
                disabled={field.is_readonly}
              >
                <SelectTrigger className={commonProps.className}>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.field_options?.options?.map((option, index) => (
                    <SelectItem key={index} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'multiselect':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => {
              const selectedValues = formField.value || [];
              
              return (
                <div className="space-y-2">
                  {field.field_options?.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            formField.onChange([...selectedValues, option.value]);
                          } else {
                            formField.onChange(selectedValues.filter(v => v !== option.value));
                          }
                        }}
                        disabled={field.is_readonly}
                      />
                      <Label className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                  {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedValues.map((value, index) => {
                        const option = field.field_options?.options?.find(opt => opt.value === value);
                        return (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {option?.label || value}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <div className="space-y-2">
                {field.field_options?.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${field.field_key}_${index}`}
                      value={option.value}
                      checked={formField.value === option.value}
                      onChange={() => formField.onChange(option.value)}
                      disabled={field.is_readonly}
                      className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
                    />
                    <Label 
                      htmlFor={`${field.field_key}_${index}`}
                      className="text-sm"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formField.value || false}
                  onCheckedChange={formField.onChange}
                  disabled={field.is_readonly}
                />
                <Label className="text-sm">
                  {field.field_options?.text || field.label}
                </Label>
              </div>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type="date"
                value={formField.value || ''}
              />
            )}
          />
        );

      case 'datetime':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type="datetime-local"
                value={formField.value || ''}
              />
            )}
          />
        );

      case 'time':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type="time"
                value={formField.value || ''}
              />
            )}
          />
        );

      case 'file':
      case 'image':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {field.field_options?.accept || 'Any file type'}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple={field.field_options?.multiple}
                      accept={field.field_options?.accept}
                      onChange={(e) => handleFileUpload(field.field_key, e.target.files)}
                      disabled={field.is_readonly}
                    />
                  </label>
                </div>
                {uploadedFiles[field.field_key] && (
                  <div className="space-y-1">
                    {uploadedFiles[field.field_key].map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        );

      case 'slider':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <div className="space-y-2">
                <input
                  type="range"
                  min={field.field_options?.min || 0}
                  max={field.field_options?.max || 100}
                  step={field.field_options?.step || 1}
                  value={formField.value || field.field_options?.min || 0}
                  onChange={formField.onChange}
                  disabled={field.is_readonly}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                {field.field_options?.show_value && (
                  <div className="text-center text-sm text-gray-600">
                    Value: {formField.value || field.field_options?.min || 0}
                  </div>
                )}
              </div>
            )}
          />
        );

      case 'color':
        return (
          <Controller
            name={field.field_key}
            control={control}
            rules={validationRules}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...commonProps}
                type="color"
                value={formField.value || '#000000'}
              />
            )}
          />
        );

      default:
        return (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              Unsupported field type: {field.field_type}
            </p>
          </div>
        );
    }
  }, [control, errors, watchedValues, showPassword, uploadedFiles, togglePasswordVisibility, handleFileUpload, isFieldVisible, getValidationRules]);

  // Group fields by field_group
  const groupedFields = formDefinition.fields?.reduce((groups, field) => {
    const group = field.field_group || 'default';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(field);
    return groups;
  }, {}) || {};

  // Sort fields by display_order within each group
  Object.keys(groupedFields).forEach(groupKey => {
    groupedFields[groupKey].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  const onSaveDraftClick = () => {
    const data = watchedValues;
    onSaveDraft && onSaveDraft(data);
  };

  if (!formDefinition || !formDefinition.fields) {
    return (
      <div className="p-8 text-center text-gray-500">
        <InfoIcon className="h-8 w-8 mx-auto mb-2" />
        <p>No form definition available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form Header */}
      {formDefinition.title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{formDefinition.title}</h2>
          {formDefinition.description && (
            <p className="mt-2 text-gray-600">{formDefinition.description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {Object.entries(groupedFields).map(([groupName, fields]) => (
          <div key={groupName} className="space-y-4">
            {groupName !== 'default' && (
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {groupName.replace('_', ' ')}
                </h3>
              </div>
            )}
            
            {fields.map((field) => {
              if (!isFieldVisible(field)) return null;
              
              const fieldError = errors[field.field_key];
              
              return (
                <div key={field.field_key} className="space-y-2">
                  {/* Field Label */}
                  {field.field_type !== 'checkbox' && (
                    <Label htmlFor={field.field_key} className="text-sm font-medium">
                      {field.label}
                      {field.is_required && showRequiredIndicator && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                  )}
                  
                  {/* Field Input */}
                  {renderField(field)}
                  
                  {/* Field Help Text */}
                  {field.help_text && (
                    <p className="text-xs text-gray-500">{field.help_text}</p>
                  )}
                  
                  {/* Field Error */}
                  {fieldError && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircleIcon className="h-4 w-4" />
                      <span className="text-xs">{fieldError.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraftClick}
                disabled={loading || !isDirty}
              >
                Save Draft
              </Button>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={loading || !isValid}
            className="min-w-[120px]"
          >
            {loading && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DynamicFormRenderer; 