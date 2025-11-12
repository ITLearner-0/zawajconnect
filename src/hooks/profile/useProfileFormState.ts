import { useState, useCallback } from 'react';
import { ProfileFormData } from '@/types/profile';

interface UseProfileFormStateProps {
  initialFormData: ProfileFormData;
}

export const useProfileFormState = ({ initialFormData }: UseProfileFormStateProps) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      console.log(`Form field changed: ${name} = ${value}`);

      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
        };
        console.log('Updated form data:', updated);
        return updated;
      });
    },
    []
  );

  const updateFormData = useCallback((newData: ProfileFormData) => {
    console.log('Updating entire form data:', newData);
    setFormData(newData);
  }, []);

  return {
    formData,
    handleChange,
    setFormData: updateFormData,
  };
};
