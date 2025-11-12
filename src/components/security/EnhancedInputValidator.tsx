import React, { useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';

interface ValidationRule {
  name: string;
  test: (value: string) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface EnhancedInputValidatorProps {
  value: string;
  rules?: ValidationRule[];
  fieldType: 'email' | 'phone' | 'name' | 'message' | 'general';
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  showDetails?: boolean;
}

const defaultRules: Record<string, ValidationRule[]> = {
  email: [
    {
      name: 'format',
      test: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value),
      message: 'Format email invalide',
      severity: 'error',
    },
    {
      name: 'length',
      test: (value) => value.length >= 5 && value.length <= 100,
      message: "L'email doit contenir entre 5 et 100 caractères",
      severity: 'error',
    },
  ],
  phone: [
    {
      name: 'format',
      test: (value) => /^\+?[1-9]\d{7,14}$/.test(value.replace(/\s/g, '')),
      message: 'Format de téléphone invalide',
      severity: 'error',
    },
  ],
  name: [
    {
      name: 'length',
      test: (value) => value.length >= 2 && value.length <= 100,
      message: 'Le nom doit contenir entre 2 et 100 caractères',
      severity: 'error',
    },
    {
      name: 'characters',
      test: (value) => !/[<>{}()[\]\\/]/.test(value),
      message: 'Caractères spéciaux non autorisés',
      severity: 'error',
    },
    {
      name: 'malicious',
      test: (value) =>
        !/(?:script|javascript|onclick|onerror|eval|alert|document|window)/i.test(value),
      message: 'Contenu potentiellement dangereux détecté',
      severity: 'error',
    },
  ],
  message: [
    {
      name: 'length',
      test: (value) => value.length >= 1 && value.length <= 2000,
      message: 'Le message doit contenir entre 1 et 2000 caractères',
      severity: 'error',
    },
    {
      name: 'malicious',
      test: (value) =>
        !/(?:script|javascript|onclick|onerror|eval|alert|document|window|<iframe|<embed|<object)/i.test(
          value
        ),
      message: 'Contenu potentiellement dangereux détecté',
      severity: 'error',
    },
    {
      name: 'personal_info',
      test: (value) => !/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b|\b\d{10,}\b|@\w+\.\w+/.test(value),
      message: 'Évitez de partager des informations personnelles (numéros, emails)',
      severity: 'warning',
    },
    {
      name: 'inappropriate',
      test: (value) => !/\b(?:sexe|nude|rencontre privée|sans famille|secret|caché)\b/i.test(value),
      message: 'Contenu inapproprié ou contraire aux valeurs islamiques',
      severity: 'warning',
    },
  ],
  general: [
    {
      name: 'xss',
      test: (value) => !/(?:<|>|&lt;|&gt;|javascript:|data:|vbscript:)/i.test(value),
      message: 'Contenu potentiellement dangereux',
      severity: 'error',
    },
  ],
};

export default function EnhancedInputValidator({
  value,
  rules,
  fieldType,
  onValidationChange,
  showDetails = false,
}: EnhancedInputValidatorProps) {
  const { logSecurityEvent } = useSecurityEvents();
  const [lastValidation, setLastValidation] = useState<Date>(new Date());

  const validateInput = useCallback(async () => {
    const applicableRules = rules || defaultRules[fieldType] || [];
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!value) {
      onValidationChange?.(true, []);
      return;
    }

    // Apply all rules
    for (const rule of applicableRules) {
      if (!rule.test(value)) {
        if (rule.severity === 'error') {
          errors.push(rule.message);
        } else if (rule.severity === 'warning') {
          warnings.push(rule.message);
        }

        // Log security events for critical violations
        if (rule.severity === 'error' && (rule.name === 'malicious' || rule.name === 'xss')) {
          try {
            await logSecurityEvent(
              'malicious_input_detected',
              'high',
              `Contenu potentiellement malveillant détecté dans ${fieldType}`,
              {
                field_type: fieldType,
                rule_triggered: rule.name,
                input_length: value.length,
                timestamp: new Date().toISOString(),
              }
            );
          } catch (error) {
            console.error('Failed to log security event:', error);
          }
        }
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.(isValid, [...errors, ...warnings]);
    setLastValidation(new Date());

    return { isValid, errors, warnings };
  }, [value, rules, fieldType, onValidationChange, logSecurityEvent]);

  React.useEffect(() => {
    validateInput();
  }, [validateInput]);

  if (!showDetails || !value) {
    return null;
  }

  return (
    <div className="space-y-2">
      <ValidationStatus value={value} fieldType={fieldType} />
    </div>
  );
}

function ValidationStatus({ value, fieldType }: { value: string; fieldType: string }) {
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'warning'>('checking');
  const [messages, setMessages] = useState<string[]>([]);

  React.useEffect(() => {
    const validateNow = () => {
      const rules = defaultRules[fieldType] || [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const rule of rules) {
        if (!rule.test(value)) {
          if (rule.severity === 'error') {
            errors.push(rule.message);
          } else if (rule.severity === 'warning') {
            warnings.push(rule.message);
          }
        }
      }

      if (errors.length > 0) {
        setStatus('invalid');
        setMessages(errors);
      } else if (warnings.length > 0) {
        setStatus('warning');
        setMessages(warnings);
      } else {
        setStatus('valid');
        setMessages([]);
      }
    };

    const timer = setTimeout(validateNow, 300);
    return () => clearTimeout(timer);
  }, [value, fieldType]);

  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'valid':
        return 'default';
      case 'invalid':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (status === 'valid' && messages.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <Badge variant="default">Valide</Badge>
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <Alert variant={status === 'invalid' ? 'destructive' : 'default'}>
      {getStatusIcon()}
      <AlertDescription className="ml-2">
        <div className="space-y-1">
          {messages.map((message, index) => (
            <div key={index} className="text-sm">
              {message}
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
