
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";

interface AboutSectionProps {
  form: UseFormReturn<ProfileFormData>;
  isOnboarding?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ form, isOnboarding }) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>About Me</FormLabel>
        <FormControl>
          <Textarea
            {...form.register("aboutMe")}
            placeholder="Tell us about yourself..."
            rows={4}
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.aboutMe && (
          <FormMessage>{String(form.formState.errors.aboutMe.message)}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default AboutSection;
