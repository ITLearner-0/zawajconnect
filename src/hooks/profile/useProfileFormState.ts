
import { useState } from "react";
import { ProfileFormData } from "@/types/profile";

interface UseProfileFormStateProps {
  initialFormData: ProfileFormData;
}

export const useProfileFormState = ({ initialFormData }: UseProfileFormStateProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  // Handle both event-based calls and direct field/value calls
  const handleChange = (
    fieldOrEvent: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    value?: string
  ) => {
    if (typeof fieldOrEvent === 'string' && value !== undefined) {
      // Direct field/value call
      setFormData((prev) => ({
        ...prev,
        [fieldOrEvent]: value,
      }));
    } else if (typeof fieldOrEvent === 'object' && fieldOrEvent.target) {
      // Event-based call
      const { name, value: eventValue } = fieldOrEvent.target;
      setFormData((prev) => ({
        ...prev,
        [name]: eventValue,
      }));
    }
  };

  return {
    formData,
    handleChange,
    setFormData
  };
};
