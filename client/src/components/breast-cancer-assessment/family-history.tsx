import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FamilyHistory as FamilyHistoryType, FAMILY_MEMBERS, MATERNAL_RELATIVES, PATERNAL_RELATIVES } from "./types";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FamilyHistoryProps {
  onSubmit: (data: FamilyHistoryType) => void;
  onBack: () => void;
  initialData: FamilyHistoryType;
  showFamilyHistory: boolean;
}

export default function FamilyHistory({ 
  onSubmit, 
  onBack, 
  initialData,
  showFamilyHistory
}: FamilyHistoryProps) {
  const [immediateFamily, setImmediateFamily] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map(FAMILY_MEMBERS.map(member => [
      member.value, 
      { 
        checked: false, 
        age: "" 
      }
    ]))
  );
  
  const [maternalRelatives, setMaternalRelatives] = useState<string[]>([]);
  const [paternalRelatives, setPaternalRelatives] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with any existing data
    if (initialData.immediate.length > 0) {
      const newImmediateFamily = new Map(immediateFamily);
      
      initialData.immediate.forEach(member => {
        newImmediateFamily.set(member.relation, {
          checked: true,
          age: member.diagnosisAge.toString()
        });
      });
      
      setImmediateFamily(newImmediateFamily);
    }
    
    if (initialData.maternal.length > 0) {
      setMaternalRelatives(initialData.maternal);
    }
    
    if (initialData.paternal.length > 0) {
      setPaternalRelatives(initialData.paternal);
    }
  }, [initialData]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setImmediateFamily(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, checked });
      return newMap;
    });
  };

  const handleAgeChange = (value: string, age: string) => {
    setImmediateFamily(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, age });
      return newMap;
    });
  };

  const handleMaternalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setMaternalRelatives(selectedOptions);
  };

  const handlePaternalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setPaternalRelatives(selectedOptions);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate if family history was indicated
    if (showFamilyHistory) {
      // Check if any family members are selected
      const anyImmediateSelected = Array.from(immediateFamily.values()).some(item => item.checked);
      const anyMaternalSelected = maternalRelatives.length > 0;
      const anyPaternalSelected = paternalRelatives.length > 0;
      
      if (!anyImmediateSelected && !anyMaternalSelected && !anyPaternalSelected) {
        newErrors.family = "Please select at least one family member who has had breast cancer";
      }
      
      // Check if diagnosis ages are provided for selected immediate family members
      immediateFamily.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`age_${relation}`] = `Please enter a valid diagnosis age`;
          }
        }
      });
    }
    
    // If there are any errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Prepare data for submission
    const immediate = Array.from(immediateFamily.entries())
      .filter(([_, data]) => data.checked)
      .map(([relation, data]) => ({
        relation,
        diagnosisAge: parseInt(data.age, 10)
      }));
    
    // Submit the form
    onSubmit({
      maternal: maternalRelatives,
      paternal: paternalRelatives,
      immediate
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Family History</h2>
        
        {showFamilyHistory ? (
          <div className="space-y-8">
            {/* Which family members */}
            <div className="form-group">
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Which family members have had breast cancer?
              </Label>
              <div className="space-y-3">
                {FAMILY_MEMBERS.map(member => (
                  <div key={member.value} className="relative family-member-container">
                    <div className="flex items-center">
                      <Checkbox 
                        id={`family-${member.value}`} 
                        checked={immediateFamily.get(member.value)?.checked || false}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(member.value, checked as boolean)
                        }
                        className="h-5 w-5"
                      />
                      <Label htmlFor={`family-${member.value}`} className="ml-2">
                        {member.label}
                      </Label>
                    </div>
                    
                    {immediateFamily.get(member.value)?.checked && (
                      <div className="ml-8 mt-2">
                        <Label className="block text-xs font-medium text-slate-700 mb-1">
                          Age when diagnosed:
                        </Label>
                        <Input 
                          type="number"
                          min="0"
                          max="120"
                          value={immediateFamily.get(member.value)?.age || ""}
                          onChange={(e) => handleAgeChange(member.value, e.target.value)}
                          className="w-24 px-3 py-1"
                        />
                        {errors[`age_${member.value}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`age_${member.value}`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mother's side */}
            <div className="form-group">
              <Label htmlFor="motherSideFamily" className="block text-sm font-medium text-slate-700 mb-2">
                Which family members have had breast cancer on your mother's side?
              </Label>
              <select 
                id="motherSideFamily" 
                multiple
                value={maternalRelatives}
                onChange={handleMaternalSelect}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                size={5}
              >
                {MATERNAL_RELATIVES.map(relative => (
                  <option key={relative.value} value={relative.value}>
                    {relative.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple</p>
            </div>

            {/* Father's side */}
            <div className="form-group">
              <Label htmlFor="fatherSideFamily" className="block text-sm font-medium text-slate-700 mb-2">
                Which family members have had breast cancer on your father's side?
              </Label>
              <select 
                id="fatherSideFamily" 
                multiple
                value={paternalRelatives}
                onChange={handlePaternalSelect}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                size={5}
              >
                {PATERNAL_RELATIVES.map(relative => (
                  <option key={relative.value} value={relative.value}>
                    {relative.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple</p>
            </div>

            {errors.family && <p className="text-red-500 text-sm">{errors.family}</p>}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="text-slate-700">You have indicated no family history of breast cancer.</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            className="px-4 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="px-4 py-2"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
