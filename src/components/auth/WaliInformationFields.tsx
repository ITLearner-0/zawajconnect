
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface WaliFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  waliName?: string;
  waliRelationship?: string;
  waliContact?: string;
}

interface WaliInformationFieldsProps {
  form: UseFormReturn<WaliFormValues>;
  loading: boolean;
}

const WaliInformationFields: React.FC<WaliInformationFieldsProps> = ({
  form,
  loading
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 border border-primary/20 rounded-md p-4 bg-primary/5 mt-4 dark:bg-primary/10">
      <div className="text-sm">
        <h3 className="font-medium mb-2">{t("auth.waliInformation")}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t("auth.waliRequired")}
        </p>
      </div>

      <FormItem>
        <FormLabel>
          {t("auth.waliName")} <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input
            {...form.register("waliName")}
            placeholder={t("auth.waliNamePlaceholder")}
            disabled={loading}
            aria-invalid={!!form.formState.errors.waliName}
          />
        </FormControl>
        {form.formState.errors.waliName && (
          <FormMessage>{form.formState.errors.waliName.message}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>
          {t("auth.relationship")} <span className="text-red-500">*</span>
        </FormLabel>
        <Select
          disabled={loading}
          onValueChange={(value) => form.setValue("waliRelationship", value, { shouldValidate: true })}
          value={form.watch("waliRelationship") || ""}
        >
          <FormControl>
            <SelectTrigger className={form.formState.errors.waliRelationship ? "border-destructive" : ""}>
              <SelectValue placeholder={t("auth.relationshipPlaceholder")} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="father">{t("auth.father")}</SelectItem>
            <SelectItem value="brother">{t("auth.brother")}</SelectItem>
            <SelectItem value="uncle">{t("auth.uncle")}</SelectItem>
            <SelectItem value="grandfather">{t("auth.grandfather")}</SelectItem>
            <SelectItem value="other">{t("auth.otherMaleRelative")}</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.waliRelationship && (
          <FormMessage>{form.formState.errors.waliRelationship.message}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>
          {t("auth.waliContact")} <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input
            {...form.register("waliContact")}
            placeholder={t("auth.waliContactPlaceholder")}
            disabled={loading}
            aria-invalid={!!form.formState.errors.waliContact}
          />
        </FormControl>
        {form.formState.errors.waliContact && (
          <FormMessage>{form.formState.errors.waliContact.message}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default WaliInformationFields;
