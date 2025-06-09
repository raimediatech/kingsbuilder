import React, { useState } from "react";

// Form field types
export type FormFieldType = 
  | "text" 
  | "email" 
  | "number" 
  | "textarea" 
  | "select" 
  | "checkbox" 
  | "radio" 
  | "date";

// Form field definition
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | string[] | boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// Form configuration
export interface FormConfig {
  title?: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  storeInShopify?: boolean;
  sendEmail?: boolean;
  emailRecipient?: string;
  emailSubject?: string;
}

interface FormBuilderWidgetProps {
  config: FormConfig;
  onSubmit?: (formData: Record<string, any>) => Promise<boolean>;
  customStyles?: {
    container?: React.CSSProperties;
    title?: React.CSSProperties;
    description?: React.CSSProperties;
    field?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    select?: React.CSSProperties;
    checkbox?: React.CSSProperties;
    radio?: React.CSSProperties;
    textarea?: React.CSSProperties;
    button?: React.CSSProperties;
    errorMessage?: React.CSSProperties;
    successMessage?: React.CSSProperties;
  };
}

const FormBuilderWidget: React.FC<FormBuilderWidgetProps> = ({
  config,
  onSubmit,
  customStyles = {},
}) => {
  // Default form configuration
  const {
    title = "Contact Form",
    description = "",
    fields = [],
    submitButtonText = "Submit",
    successMessage = "Form submitted successfully!",
    errorMessage = "There was an error submitting the form. Please try again.",
  } = config;

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Initialize form data with default values
  React.useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else if (field.type === "checkbox") {
        initialData[field.id] = false;
      } else if (field.type === "radio" && field.options && field.options.length > 0) {
        initialData[field.id] = field.options[0].value;
      } else {
        initialData[field.id] = "";
      }
    });
    setFormData(initialData);
  }, [fields]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      const value = formData[field.id];
      
      // Required field validation
      if (field.required && (value === "" || value === undefined || value === null)) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Pattern validation
      if (value && field.validation?.pattern) {
        const pattern = new RegExp(field.validation.pattern);
        if (!pattern.test(String(value))) {
          newErrors[field.id] = `${field.label} has an invalid format`;
        }
      }
      
      // Length validation for text fields
      if (typeof value === "string") {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.id] = `${field.label} must be at most ${field.validation.maxLength} characters`;
        }
      }
      
      // Range validation for number fields
      if (field.type === "number" && typeof value === "string") {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            newErrors[field.id] = `${field.label} must be at least ${field.validation.min}`;
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            newErrors[field.id] = `${field.label} must be at most ${field.validation.max}`;
          }
        }
      }
      
      // Email validation
      if (field.type === "email" && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(String(value).toLowerCase())) {
          newErrors[field.id] = "Please enter a valid email address";
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    try {
      // If onSubmit prop is provided, use it
      if (onSubmit) {
        const success = await onSubmit(formData);
        setSubmitStatus(success ? "success" : "error");
      } else {
        // Default behavior - simulate a successful submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitStatus("success");
        
        // Reset form after successful submission
        if (config.redirectUrl) {
          window.location.href = config.redirectUrl;
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form fields based on their type
  const renderField = (field: FormField) => {
    const { id, type, label, placeholder, required, options } = field;
    
    switch (type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <div key={id} style={{ marginBottom: "16px", ...customStyles.field }}>
            <label 
              htmlFor={id} 
              style={{ display: "block", marginBottom: "8px", fontWeight: 500, ...customStyles.label }}
            >
              {label} {required && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type={type}
              id={id}
              name={id}
              value={formData[id] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              style={{ 
                width: "100%", 
                padding: "8px 12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px",
                ...customStyles.input 
              }}
            />
            {errors[id] && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px", ...customStyles.errorMessage }}>
                {errors[id]}
              </div>
            )}
          </div>
        );
        
      case "textarea":
        return (
          <div key={id} style={{ marginBottom: "16px", ...customStyles.field }}>
            <label 
              htmlFor={id} 
              style={{ display: "block", marginBottom: "8px", fontWeight: 500, ...customStyles.label }}
            >
              {label} {required && <span style={{ color: "red" }}>*</span>}
            </label>
            <textarea
              id={id}
              name={id}
              value={formData[id] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              rows={5}
              style={{ 
                width: "100%", 
                padding: "8px 12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px",
                ...customStyles.textarea 
              }}
            />
            {errors[id] && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px", ...customStyles.errorMessage }}>
                {errors[id]}
              </div>
            )}
          </div>
        );
        
      case "select":
        return (
          <div key={id} style={{ marginBottom: "16px", ...customStyles.field }}>
            <label 
              htmlFor={id} 
              style={{ display: "block", marginBottom: "8px", fontWeight: 500, ...customStyles.label }}
            >
              {label} {required && <span style={{ color: "red" }}>*</span>}
            </label>
            <select
              id={id}
              name={id}
              value={formData[id] || ""}
              onChange={handleChange}
              required={required}
              style={{ 
                width: "100%", 
                padding: "8px 12px", 
                border: "1px solid #ddd", 
                borderRadius: "4px",
                ...customStyles.select 
              }}
            >
              <option value="">{placeholder || "Select an option"}</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[id] && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px", ...customStyles.errorMessage }}>
                {errors[id]}
              </div>
            )}
          </div>
        );
        
      case "checkbox":
        return (
          <div key={id} style={{ marginBottom: "16px", ...customStyles.field }}>
            <div style={{ display: "flex", alignItems: "center", ...customStyles.checkbox }}>
              <input
                type="checkbox"
                id={id}
                name={id}
                checked={!!formData[id]}
                onChange={handleChange}
                required={required}
                style={{ marginRight: "8px" }}
              />
              <label htmlFor={id} style={{ ...customStyles.label }}>
                {label} {required && <span style={{ color: "red" }}>*</span>}
              </label>
            </div>
            {errors[id] && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px", ...customStyles.errorMessage }}>
                {errors[id]}
              </div>
            )}
          </div>
        );
        
      case "radio":
        return (
          <div key={id} style={{ marginBottom: "16px", ...customStyles.field }}>
            <div style={{ marginBottom: "8px", fontWeight: 500, ...customStyles.label }}>
              {label} {required && <span style={{ color: "red" }}>*</span>}
            </div>
            <div style={{ ...customStyles.radio }}>
              {options?.map((option) => (
                <div key={option.value} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                  <input
                    type="radio"
                    id={`${id}-${option.value}`}
                    name={id}
                    value={option.value}
                    checked={formData[id] === option.value}
                    onChange={handleChange}
                    required={required}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
            {errors[id] && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px", ...customStyles.errorMessage }}>
                {errors[id]}
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: "100%", ...customStyles.container }}>
      {/* Form Title */}
      {title && (
        <h3 style={{ marginBottom: "16px", fontSize: "24px", ...customStyles.title }}>
          {title}
        </h3>
      )}
      
      {/* Form Description */}
      {description && (
        <p style={{ marginBottom: "24px", color: "#666", ...customStyles.description }}>
          {description}
        </p>
      )}
      
      {/* Success Message */}
      {submitStatus === "success" && (
        <div 
          style={{ 
            padding: "16px", 
            backgroundColor: "#d4edda", 
            color: "#155724", 
            borderRadius: "4px", 
            marginBottom: "24px",
            ...customStyles.successMessage 
          }}
        >
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {submitStatus === "error" && (
        <div 
          style={{ 
            padding: "16px", 
            backgroundColor: "#f8d7da", 
            color: "#721c24", 
            borderRadius: "4px", 
            marginBottom: "24px",
            ...customStyles.errorMessage 
          }}
        >
          {errorMessage}
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        {fields.map(renderField)}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#008060", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            ...customStyles.button 
          }}
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default FormBuilderWidget;