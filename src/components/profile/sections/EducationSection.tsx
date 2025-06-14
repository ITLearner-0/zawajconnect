
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";

interface EducationSectionProps {
  form: UseFormReturn<ProfileFormData>;
  isOnboarding?: boolean;
}

const EducationSection: React.FC<EducationSectionProps> = ({ form, isOnboarding }) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Education</FormLabel>
        <FormControl>
          <Input
            {...form.register("education")}
            placeholder="Enter your education level"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.education && (
          <FormMessage>{String(form.formState.errors.education.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Occupation</FormLabel>
        <FormControl>
          <Input
            {...form.register("occupation")}
            placeholder="Enter your occupation"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.occupation && (
          <FormMessage>{String(form.formState.errors.occupation.message)}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default EducationSection;
