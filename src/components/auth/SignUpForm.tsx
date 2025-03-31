
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomButton from "@/components/CustomButton";
import WaliInformationFields, { signUpFormSchema, SignUpFormValues } from "./WaliInformationFields";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";

interface SignUpFormProps {
  loading: boolean;
  onSubmit: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    waliName?: string;
    waliRelationship?: string;
    waliContact?: string;
  }) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showWaliFields, setShowWaliFields] = useState(false);
  
  // Extend the schema with conditional validation for wali fields
  const formSchema = signUpFormSchema.refine((data) => {
    // If gender is female, wali information is required
    if (data.gender === "female") {
      return !!data.waliName && !!data.waliRelationship && !!data.waliContact;
    }
    return true;
  }, {
    message: t("auth.waliRequired"),
    path: ["waliName"]
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      gender: "",
      waliName: "",
      waliRelationship: "",
      waliContact: "",
    },
    mode: "onChange"
  });

  const gender = form.watch("gender");

  useEffect(() => {
    setShowWaliFields(gender === "female");
  }, [gender]);

  const handleSubmit = (values: SignUpFormValues) => {
    // All these values will be defined due to zod validation
    onSubmit({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender,
      waliName: values.waliName,
      waliRelationship: values.waliRelationship,
      waliContact: values.waliContact,
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <FormMessage>{form.formState.errors.firstName.message}</FormMessage>
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
              <FormMessage>{form.formState.errors.lastName.message}</FormMessage>
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
            <FormMessage>{form.formState.errors.email.message}</FormMessage>
          )}
        </FormItem>
        
        <FormItem>
          <FormLabel>{t("auth.password")}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="new-password"
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

        {showWaliFields && (
          <WaliInformationFields
            form={form}
            loading={loading}
          />
        )}

        <CustomButton
          type="submit"
          className="w-full"
          disabled={loading}
          isLoading={loading}
          variant="gold"
        >
          {t("auth.createAccount")}
        </CustomButton>
      </form>
    </Form>
  );
};

export default SignUpForm;
