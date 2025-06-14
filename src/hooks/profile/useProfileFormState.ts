
import { useState } from "react";
import { ProfileFormData } from "@/types/profile";

interface UseProfileFormStateProps {
  initialFormData: ProfileFormData;
}

export const useProfileFormState = ({ initialFormData }: UseProfileFormStateProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    formData,
    handleChange,
    setFormData
  };
};
