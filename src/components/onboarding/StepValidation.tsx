import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ValidationRule {
  field: string;
  label: string;
  isValid: boolean;
  message?: string;
  isRequired?: boolean;
}

interface StepValidationProps {
  rules: ValidationRule[];
  stepNumber: number;
  className?: string;
}

const StepValidation = ({ rules, stepNumber, className = "" }: StepValidationProps) => {
  const requiredRules = rules.filter(rule => rule.isRequired);
  const validRules = rules.filter(rule => rule.isValid);
  const invalidRules = rules.filter(rule => !rule.isValid && rule.isRequired);
  
  const completionPercentage = Math.round((validRules.length / rules.length) * 100);
  const isStepComplete = requiredRules.every(rule => rule.isValid);

  const getStatusColor = () => {
    if (isStepComplete) return 'text-emerald';
    if (completionPercentage > 50) return 'text-gold';
    return 'text-orange-500';
  };

  const getStatusMessage = () => {
    if (isStepComplete) return 'Étape complète ! Vous pouvez continuer.';
    if (invalidRules.length === 1) return `1 champ requis manquant`;
    if (invalidRules.length > 1) return `${invalidRules.length} champs requis manquants`;
    return 'Remplissez les champs requis pour continuer';
  };

  if (rules.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Summary */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          {isStepComplete ? (
            <CheckCircle className="w-4 h-4 text-emerald" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gold" />
          )}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            Étape {stepNumber}
          </span>
        </div>
        <Badge 
          variant={isStepComplete ? "default" : "secondary"}
          className={isStepComplete ? "bg-emerald" : ""}
        >
          {completionPercentage}% complété
        </Badge>
      </div>

      {/* Status Message */}
      <Alert className={isStepComplete ? "border-emerald/20 bg-emerald/5" : "border-gold/20 bg-gold/5"}>
        <AlertDescription className={`text-sm ${getStatusColor()}`}>
          {getStatusMessage()}
        </AlertDescription>
      </Alert>

      {/* Detailed Validation */}
      {invalidRules.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Champs manquants :</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {invalidRules.map((rule) => (
              <div 
                key={rule.field}
                className="flex items-center space-x-2 text-sm text-muted-foreground"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Checklist */}
      {validRules.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Complété :</h4>
          <div className="flex flex-wrap gap-1">
            {validRules.slice(0, 4).map((rule) => (
              <Badge 
                key={rule.field} 
                variant="secondary" 
                className="text-xs bg-emerald/10 text-emerald border-emerald/20"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {rule.label}
              </Badge>
            ))}
            {validRules.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{validRules.length - 4} autres
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepValidation;