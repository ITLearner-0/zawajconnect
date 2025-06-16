
import React, { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccessibleFormFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "tel" | "textarea" | "select";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  autoComplete?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  options,
  disabled = false,
  autoComplete
}) => {
  const fieldId = useId();
  const helpId = useId();
  const errorId = useId();

  const getAriaDescribedBy = () => {
    const ids = [];
    if (helpText) ids.push(helpId);
    if (error) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  const renderField = () => {
    const commonProps = {
      id: fieldId,
      value,
      placeholder,
      required,
      disabled,
      autoComplete,
      'aria-invalid': !!error,
      'aria-describedby': getAriaDescribedBy(),
      className: `${error ? 'border-red-500 focus:border-red-500' : ''}`
    };

    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        );
      
      case "select":
        return (
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger
              id={fieldId}
              aria-invalid={!!error}
              aria-describedby={getAriaDescribedBy()}
              className={error ? 'border-red-500 focus:border-red-500' : ''}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldId} className="font-medium">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="requis">
              *
            </span>
          )}
        </Label>
        
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Aide pour ${label}`}
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {renderField()}

      {helpText && (
        <p
          id={helpId}
          className="text-sm text-muted-foreground"
        >
          {helpText}
        </p>
      )}

      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AccessibleFormField;
