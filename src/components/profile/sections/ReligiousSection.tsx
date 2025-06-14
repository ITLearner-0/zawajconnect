
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";

interface ReligiousSectionProps {
  form: UseFormReturn<ProfileFormData>;
  isOnboarding?: boolean;
}

const ReligiousSection: React.FC<ReligiousSectionProps> = ({ form, isOnboarding }) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Religious Level</FormLabel>
        <FormControl>
          <Input
            {...form.register("religiousLevel")}
            placeholder="Enter your religious practice level"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.religiousLevel && (
          <FormMessage>{String(form.formState.errors.religiousLevel.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Prayer Frequency</FormLabel>
        <FormControl>
          <Input
            {...form.register("prayerFrequency")}
            placeholder="Enter your prayer frequency"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.prayerFrequency && (
          <FormMessage>{String(form.formState.errors.prayerFrequency.message)}</FormMessage>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Family Background</FormLabel>
        <FormControl>
          <Input
            {...form.register("familyBackground")}
            placeholder="Enter your family background"
            disabled={!isOnboarding}
          />
        </FormControl>
        {form.formState.errors.familyBackground && (
          <FormMessage>{String(form.formState.errors.familyBackground.message)}</FormMessage>
        )}
      </FormItem>
    </div>
  );
};

export default ReligiousSection;
