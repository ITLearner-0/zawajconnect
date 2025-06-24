
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, X, Check } from 'lucide-react';

interface EnhancedPasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  score: number;
}

const validatePasswordStrength = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/\d/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
  
  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, 100 - (errors.length * 20))
  };
};

export const EnhancedPasswordField: React.FC<EnhancedPasswordFieldProps> = ({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  required = false,
  showStrengthIndicator = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordValidation = validatePasswordStrength(value);
  
  const getStrengthColor = () => {
    if (!value) return 'bg-gray-200';
    const errorCount = passwordValidation.errors.length;
    if (errorCount === 0) return 'bg-green-500';
    if (errorCount <= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (!value) return 'No password';
    const errorCount = passwordValidation.errors.length;
    if (errorCount === 0) return 'Strong';
    if (errorCount <= 2) return 'Medium';
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
                style={{ width: `${Math.max(20, passwordValidation.score)}%` }}
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
