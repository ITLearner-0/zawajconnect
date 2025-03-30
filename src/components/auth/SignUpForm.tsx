
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomButton from "@/components/CustomButton";
import WaliInformationFields from "./WaliInformationFields";
import { useTranslation } from "react-i18next";

interface SignUpFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  waliName: string;
  setWaliName: (value: string) => void;
  waliRelationship: string;
  setWaliRelationship: (value: string) => void;
  waliContact: string;
  setWaliContact: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  gender,
  setGender,
  waliName,
  setWaliName,
  waliRelationship,
  setWaliRelationship,
  waliContact,
  setWaliContact,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [showWaliFields, setShowWaliFields] = useState(gender === "female");

  const handleGenderChange = (value: string) => {
    setGender(value);
    setShowWaliFields(value === "female");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("auth.firstName")}</Label>
          <Input
            id="firstName"
            placeholder={t("auth.firstNamePlaceholder")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("auth.lastName")}</Label>
          <Input
            id="lastName"
            placeholder={t("auth.lastNamePlaceholder")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">{t("auth.gender")}</Label>
        <Select 
          value={gender} 
          onValueChange={handleGenderChange}
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder={t("auth.genderPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">{t("auth.male")}</SelectItem>
            <SelectItem value="female">{t("auth.female")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showWaliFields && (
        <WaliInformationFields
          waliName={waliName}
          setWaliName={setWaliName}
          waliRelationship={waliRelationship}
          setWaliRelationship={setWaliRelationship}
          waliContact={waliContact}
          setWaliContact={setWaliContact}
        />
      )}

      <CustomButton
        type="submit"
        className="w-full"
        disabled={loading}
        isLoading={loading}
        variant="gold"
      >
        {t("auth.createAccount")}
      </CustomButton>
    </form>
  );
};

export default SignUpForm;
