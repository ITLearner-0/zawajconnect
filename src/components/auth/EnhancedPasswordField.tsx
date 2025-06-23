
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, X, Check } from 'lucide-react';
import { useSecurity } from '@/components/security/SecurityProvider';

interface EnhancedPasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

export const EnhancedPasswordField: React.FC<EnhancedPasswordFieldProps> = ({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  required = false,
  showStrengthIndicator = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { enhancedAuth } = useSecurity();

  const passwordValidation = enhancedAuth.validatePasswordStrength(value);
  
  const getStrengthColor = () => {
    if (!value) return 'bg-gray-200';
    const strength = passwordValidation.feedback.length;
    if (strength === 0) return 'bg-green-500';
    if (strength <= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (!value) return 'No password';
    const strength = passwordValidation.feedback.length;
    if (strength === 0) return 'Strong';
    if (strength <= 2) return 'Medium';
    return 'Weak';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showStrengthIndicator && value && (
        <div className="space-y-2">
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${Math.max(20, 100 - (passwordValidation.feedback.length * 20))}%` }}
              />
            </div>
            <span className="text-sm font-medium">{getStrengthText()}</span>
          </div>

          {/* Validation requirements */}
          <div className="space-y-1">
            {[
              { test: value.length >= 8, text: 'At least 8 characters' },
              { test: /[A-Z]/.test(value), text: 'One uppercase letter' },
              { test: /[a-z]/.test(value), text: 'One lowercase letter' },
              { test: /\d/.test(value), text: 'One number' },
              { test: /[!@#$%^&*(),.?":{}|<>]/.test(value), text: 'One special character' }
            ].map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {requirement.test ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={requirement.test ? 'text-green-600' : 'text-red-600'}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
