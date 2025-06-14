
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";

interface BasicInfoSectionProps {
  form: UseFormReturn<ProfileFormData>;
  isOnboarding?: boolean;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, isOnboarding }) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Full Name</FormLabel>
        <FormControl>
          <Input
            {...form.register("fullName")}
            placeholder="Enter your full name"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.fullName && (
          <FormMessage>{String(form.formState.errors.fullName.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Age</FormLabel>
        <FormControl>
          <Input
            {...form.register("age")}
            type="number"
            placeholder="Enter your age"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.age && (
          <FormMessage>{String(form.formState.errors.age.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Gender</FormLabel>
        <FormControl>
          <Input
            {...form.register("gender")}
            placeholder="Enter your gender"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.gender && (
          <FormMessage>{String(form.formState.errors.gender.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Location</FormLabel>
        <FormControl>
          <Input
            {...form.register("location")}
            placeholder="Enter your location"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.location && (
          <FormMessage>{String(form.formState.errors.location.message)}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default BasicInfoSection;
