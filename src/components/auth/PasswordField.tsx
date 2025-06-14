
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PasswordFieldProps {
  form: UseFormReturn<any>;
  loading: boolean;
  autoComplete?: string;
  label?: string;
  placeholder?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ 
  form, 
  loading, 
  autoComplete = "new-password",
  label,
  placeholder 
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <FormItem>
      <FormLabel>{label || t("auth.password")}</FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder || t("auth.passwordPlaceholder")}
            autoComplete={autoComplete}
            disabled={loading}
            aria-invalid={!!form.formState.errors.password}
          />
        </FormControl>
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {form.formState.errors.password && (
        <FormMessage>{form.formState.errors.password.message}</FormMessage>
      )}
    </FormItem>
  );
};

export default PasswordField;
