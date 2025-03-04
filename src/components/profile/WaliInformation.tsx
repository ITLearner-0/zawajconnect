
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
          Wali Information
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 ml-2 inline-block text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  In accordance with Islamic values, women are required to designate a wali 
                  (guardian). This could be your father, brother, uncle, or another male relative.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="waliName" className="flex items-center">
            Wali Name 
            {showRequired && isWomanUser && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="waliName"
            name="waliName"
            value={formData.waliName || ""}
            onChange={handleChange}
            placeholder="Full name of your wali"
            required={showRequired && isWomanUser}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="waliRelationship" className="flex items-center">
            Relationship 
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
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="brother">Brother</SelectItem>
              <SelectItem value="uncle">Uncle</SelectItem>
              <SelectItem value="grandfather">Grandfather</SelectItem>
              <SelectItem value="other">Other Male Relative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="waliContact" className="flex items-center">
            Wali Contact Number
            {showRequired && isWomanUser && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id="waliContact"
            name="waliContact"
            value={formData.waliContact || ""}
            onChange={handleChange}
            placeholder="Contact number of your wali"
            required={showRequired && isWomanUser}
            className="mt-1"
          />
        </div>

        {showRequired && isWomanUser && (
          <div className="text-sm text-gray-500 mt-4">
            <p>Note: Your wali will be contacted to verify this information.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaliInformation;
