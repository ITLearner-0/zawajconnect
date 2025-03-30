
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface WaliInformationFieldsProps {
  waliName: string;
  setWaliName: (value: string) => void;
  waliRelationship: string;
  setWaliRelationship: (value: string) => void;
  waliContact: string;
  setWaliContact: (value: string) => void;
}

const WaliInformationFields: React.FC<WaliInformationFieldsProps> = ({
  waliName,
  setWaliName,
  waliRelationship,
  setWaliRelationship,
  waliContact,
  setWaliContact,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 border border-primary/20 rounded-md p-4 bg-primary/5 mt-4 dark:bg-primary/10">
      <div className="text-sm">
        <h3 className="font-medium mb-2">{t("auth.waliInformation")}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t("auth.waliRequired")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="waliName">{t("auth.waliName")} <span className="text-red-500">*</span></Label>
        <Input
          id="waliName"
          placeholder={t("auth.waliNamePlaceholder")}
          value={waliName}
          onChange={(e) => setWaliName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="waliRelationship">{t("auth.relationship")} <span className="text-red-500">*</span></Label>
        <Select 
          value={waliRelationship} 
          onValueChange={setWaliRelationship}
        >
          <SelectTrigger id="waliRelationship">
            <SelectValue placeholder={t("auth.relationshipPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="father">{t("auth.father")}</SelectItem>
            <SelectItem value="brother">{t("auth.brother")}</SelectItem>
            <SelectItem value="uncle">{t("auth.uncle")}</SelectItem>
            <SelectItem value="grandfather">{t("auth.grandfather")}</SelectItem>
            <SelectItem value="other">{t("auth.otherMaleRelative")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="waliContact">{t("auth.waliContact")} <span className="text-red-500">*</span></Label>
        <Input
          id="waliContact"
          placeholder={t("auth.waliContactPlaceholder")}
          value={waliContact}
          onChange={(e) => setWaliContact(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default WaliInformationFields;
