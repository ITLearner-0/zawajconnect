
import React from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
  loading: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>{t("auth.firstName")}</FormLabel>
          <FormControl>
            <Input
              {...form.register("firstName")}
              placeholder={t("auth.firstNamePlaceholder")}
              disabled={loading}
              aria-invalid={!!form.formState.errors.firstName}
            />
          </FormControl>
          {form.formState.errors.firstName && (
            <FormMessage>{String(form.formState.errors.firstName.message)}</FormMessage>
          )}
        </FormItem>
        
        <FormItem>
          <FormLabel>{t("auth.lastName")}</FormLabel>
          <FormControl>
            <Input
              {...form.register("lastName")}
              placeholder={t("auth.lastNamePlaceholder")}
              disabled={loading}
              aria-invalid={!!form.formState.errors.lastName}
            />
          </FormControl>
          {form.formState.errors.lastName && (
            <FormMessage>{String(form.formState.errors.lastName.message)}</FormMessage>
          )}
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>{t("auth.email")}</FormLabel>
        <FormControl>
          <Input
            {...form.register("email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            autoComplete="email"
            disabled={loading}
            aria-invalid={!!form.formState.errors.email}
          />
        </FormControl>
        {form.formState.errors.email && (
          <FormMessage>{String(form.formState.errors.email.message)}</FormMessage>
        )}
      </FormItem>
    </>
  );
};

export default BasicInfoFields;
