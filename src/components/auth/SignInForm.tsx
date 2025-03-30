
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "react-i18next";
import { FormControl, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

interface SignInFormProps {
  loading: boolean;
  onSubmit: (data: { email: string; password: string }) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  loading,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

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
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Since we're using zod validation, these values are guaranteed to be defined
    onSubmit({
      email: values.email,
      password: values.password
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
        
        <FormItem>
          <FormLabel>{t("auth.password")}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="current-password"
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
