
import React from "react";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/CustomButton";
import PasswordField from "./PasswordField";
import { useTranslation } from "react-i18next";
import { FormControl, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInData } from "@/types/auth";

interface SignInFormProps {
  loading: boolean;
  onSubmit: (data: SignInData) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  loading,
  onSubmit
}) => {
  const { t } = useTranslation();

  // Create schema for form validation
  const formSchema = z.object({
    email: z.string().email(t("auth.invalidEmail")).min(1, t("auth.emailRequired")),
    password: z.string().min(6, t("auth.passwordMinLength")).max(100, t("auth.passwordMaxLength")),
  });

  // Define the form values type based on the schema
  type FormValues = z.infer<typeof formSchema>;

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange"
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmit({
      email: values.email,
      password: values.password
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>{t("auth.email")}</FormLabel>
          <FormControl>
            <Input
              {...form.register("email")}
              placeholder={t("auth.emailPlaceholder")}
              type="email"
              autoComplete="email"
              disabled={loading}
              aria-invalid={!!form.formState.errors.email}
            />
          </FormControl>
          {form.formState.errors.email && (
            <FormMessage>{form.formState.errors.email.message}</FormMessage>
          )}
        </FormItem>
        
        <PasswordField 
          form={form} 
          loading={loading} 
          autoComplete="current-password"
        />

        <CustomButton
          type="submit"
          className="w-full"
          disabled={loading}
          isLoading={loading}
          variant="gold"
        >
          {t("auth.signIn")}
        </CustomButton>
      </form>
    </Form>
  );
};

export default SignInForm;
