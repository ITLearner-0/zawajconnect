
import React, { useState, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import WaliInformationFields, { signUpFormSchema, SignUpFormValues } from "./WaliInformationFields";
import PasswordField from "./PasswordField";
import BasicInfoFields from "./BasicInfoFields";
import GenderSelect from "./GenderSelect";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

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
  preselectedGender?: string | null;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  loading,
  onSubmit,
  preselectedGender,
}) => {
  const { t } = useTranslation();
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
      gender: preselectedGender || "",
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

  // Set preselected gender when component mounts or preselectedGender changes
  useEffect(() => {
    if (preselectedGender) {
      form.setValue("gender", preselectedGender);
    }
  }, [preselectedGender, form]);

  const handleSubmit = (values: SignUpFormValues) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} loading={loading} />
        <PasswordField form={form} loading={loading} />
        <GenderSelect form={form} loading={loading} />

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
