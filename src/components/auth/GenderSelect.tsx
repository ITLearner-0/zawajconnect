
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";

interface GenderSelectProps {
  form: UseFormReturn<any>;
  loading: boolean;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ form, loading }) => {
  const { t } = useTranslation();

  return (
    <FormItem>
      <FormLabel>{t("auth.gender")}</FormLabel>
      <Select
        disabled={loading}
        onValueChange={(value) => form.setValue("gender", value, { shouldValidate: true })}
        value={form.watch("gender")}
      >
        <FormControl>
          <SelectTrigger className={form.formState.errors.gender ? "border-destructive" : ""}>
            <SelectValue placeholder={t("auth.genderPlaceholder")} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="male">{t("auth.male")}</SelectItem>
          <SelectItem value="female">{t("auth.female")}</SelectItem>
        </SelectContent>
      </Select>
      {form.formState.errors.gender && (
        <FormMessage>{form.formState.errors.gender.message}</FormMessage>
      )}
    </FormItem>
  );
};

export default GenderSelect;
