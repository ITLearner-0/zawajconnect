
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { ProfileFormData } from "@/types/profile";

interface WaliInformationProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  showRequired?: boolean;
}

const WaliInformation = ({ formData, handleChange, showRequired = false }: WaliInformationProps) => {
  const isWomanUser = formData.gender === "female";
  
  if (!isWomanUser) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 id="wali-heading" className="text-lg font-semibold">
          Informations du Wali
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 ml-2 inline-block text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Conformément aux valeurs islamiques, les femmes doivent désigner un wali 
                  (tuteur). Il peut s'agir de votre père, frère, oncle ou d'un autre parent masculin.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="waliName" className="flex items-center">
            Nom du Wali 
            {showRequired && isWomanUser && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="waliName"
            name="waliName"
            value={formData.waliName || ""}
            onChange={handleChange}
            placeholder="Nom complet de votre wali"
            required={showRequired && isWomanUser}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="waliRelationship" className="flex items-center">
            Relation 
            {showRequired && isWomanUser && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select 
            name="waliRelationship" 
            value={formData.waliRelationship || ""} 
            onValueChange={(value) => {
              handleChange({
                target: { name: "waliRelationship", value }
              } as React.ChangeEvent<HTMLSelectElement>)
            }}
          >
            <SelectTrigger id="waliRelationship" className="mt-1">
              <SelectValue placeholder="Sélectionnez la relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="father">Père</SelectItem>
              <SelectItem value="brother">Frère</SelectItem>
              <SelectItem value="uncle">Oncle</SelectItem>
              <SelectItem value="grandfather">Grand-père</SelectItem>
              <SelectItem value="other">Autre Parent Masculin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="waliContact" className="flex items-center">
            Numéro de Contact du Wali
            {showRequired && isWomanUser && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="waliContact"
            name="waliContact"
            value={formData.waliContact || ""}
            onChange={handleChange}
            placeholder="Numéro de contact de votre wali"
            required={showRequired && isWomanUser}
            className="mt-1"
          />
        </div>

        {showRequired && isWomanUser && (
          <div className="text-sm text-gray-500 mt-4">
            <p>Note : Votre wali sera contacté pour vérifier ces informations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaliInformation;
