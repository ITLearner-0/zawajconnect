import React from 'react';
import { Input } from '@/components/ui/input';
import CustomButton from '@/components/CustomButton';
import PasswordField from './PasswordField';
import { useTranslation } from 'react-i18next';
import { FormControl, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInData } from '@/types/auth';

interface SignInFormProps {
  loading: boolean;
  onSubmit: (data: SignInData) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ loading, onSubmit }) => {
  const { t } = useTranslation();

  // Create schema for form validation with proper French messages
  const formSchema = z.object({
    email: z
      .string()
      .email('Veuillez entrer une adresse email valide')
      .min(1, "L'email est requis"),
    password: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
      .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              {...form.register('email')}
              placeholder="votre.email@exemple.com"
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

        <PasswordField form={form} loading={loading} autoComplete="current-password" />

        <CustomButton
          type="submit"
          className="w-full"
          disabled={loading}
          isLoading={loading}
          variant="gold"
        >
          Se Connecter
        </CustomButton>
      </form>
    </Form>
  );
};

export default SignInForm;
