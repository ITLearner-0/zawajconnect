
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
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: keyof ProfileFormData, value: string) => {
    console.log(`Select field changed: ${field} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return {
    formData,
    handleChange,
    handleSelectChange,
    setFormData
  };
};
