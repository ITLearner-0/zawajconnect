
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { z } from "zod";

const waliSignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  relationshipType: z.string().min(1, "Relationship type is required"),
  contactPhone: z.string().min(1, "Phone number is required"),
  managedUserEmails: z.string().optional(),
});

type WaliSignUpFormValues = z.infer<typeof waliSignUpSchema>;

interface WaliSignUpFormProps {
  loading: boolean;
  onSubmit: (data: WaliSignUpFormValues) => void;
}

const WaliSignUpForm: React.FC<WaliSignUpFormProps> = ({ loading, onSubmit }) => {
  const { t } = useTranslation();
  
  const form = useForm<WaliSignUpFormValues>({
    resolver: zodResolver(waliSignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      relationshipType: "",
      contactPhone: "",
      managedUserEmails: "",
    },
  });

  const handleSubmit = (values: WaliSignUpFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>First Name *</FormLabel>
            <FormControl>
              <Input
                {...form.register("firstName")}
                placeholder="Enter first name"
                disabled={loading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Last Name *</FormLabel>
            <FormControl>
              <Input
                {...form.register("lastName")}
                placeholder="Enter last name"
                disabled={loading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <FormItem>
          <FormLabel>Email Address *</FormLabel>
          <FormControl>
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Enter email address"
              disabled={loading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Password *</FormLabel>
          <FormControl>
            <Input
              {...form.register("password")}
              type="password"
              placeholder="Enter password"
              disabled={loading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Relationship Type *</FormLabel>
          <Select
            disabled={loading}
            onValueChange={(value) => form.setValue("relationshipType", value)}
            value={form.watch("relationshipType")}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="brother">Brother</SelectItem>
              <SelectItem value="uncle">Uncle</SelectItem>
              <SelectItem value="grandfather">Grandfather</SelectItem>
              <SelectItem value="guardian">Legal Guardian</SelectItem>
              <SelectItem value="other">Other Male Relative</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Contact Phone *</FormLabel>
          <FormControl>
            <Input
              {...form.register("contactPhone")}
              placeholder="Enter phone number"
              disabled={loading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Managed User Emails (Optional)</FormLabel>
          <FormControl>
            <Input
              {...form.register("managedUserEmails")}
              placeholder="Enter emails separated by commas"
              disabled={loading}
            />
          </FormControl>
          <p className="text-sm text-muted-foreground">
            Enter the email addresses of users you will be supervising (separated by commas)
          </p>
          <FormMessage />
        </FormItem>

        <CustomButton
          type="submit"
          className="w-full"
          disabled={loading}
          isLoading={loading}
          variant="gold"
        >
          Create Wali Account
        </CustomButton>
      </form>
    </Form>
  );
};

export default WaliSignUpForm;
