
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";

interface WaliSectionProps {
  form: UseFormReturn<ProfileFormData>;
  isOnboarding?: boolean;
  showWaliFields?: boolean;
}

const WaliSection: React.FC<WaliSectionProps> = ({ form, isOnboarding, showWaliFields }) => {
  if (!showWaliFields) return null;

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Wali Name</FormLabel>
        <FormControl>
          <Input
            {...form.register("waliName")}
            placeholder="Enter your wali's name"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.waliName && (
          <FormMessage>{String(form.formState.errors.waliName.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Wali Relationship</FormLabel>
        <FormControl>
          <Input
            {...form.register("waliRelationship")}
            placeholder="Enter relationship to wali"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.waliRelationship && (
          <FormMessage>{String(form.formState.errors.waliRelationship.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Wali Contact</FormLabel>
        <FormControl>
          <Input
            {...form.register("waliContact")}
            placeholder="Enter wali's contact information"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.waliContact && (
          <FormMessage>{String(form.formState.errors.waliContact.message)}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default WaliSection;
