import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AssessmentFormData } from "./types";
import { validateAge, validateDiagnosisAge } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PersonalInfoProps {
  onSubmit: (data: Partial<AssessmentFormData>) => void;
  initialData: AssessmentFormData;
}

export default function PersonalInfo({ onSubmit, initialData }: PersonalInfoProps) {
  const [age, setAge] = useState<string>("");
  const [personalHistory, setPersonalHistory] = useState<string>("");
  const [diagnosisAge, setDiagnosisAge] = useState<string>("");
  const [familyHistory, setFamilyHistory] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form with any existing data
    if (initialData.personalInfo.age) {
      setAge(initialData.personalInfo.age.toString());
    }
    
    if (initialData.personalInfo.hasBreastCancer !== undefined) {
      setPersonalHistory(initialData.personalInfo.hasBreastCancer ? "yes" : "no");
    }
    
    if (initialData.personalInfo.diagnosisAge) {
      setDiagnosisAge(initialData.personalInfo.diagnosisAge.toString());
    }
    
    if (initialData.hasFamilyHistory !== undefined) {
      setFamilyHistory(initialData.hasFamilyHistory ? "yes" : "no");
    }
  }, [initialData]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate age
    if (!age) {
      newErrors.age = "Age is required";
    } else if (!validateAge(age)) {
      newErrors.age = "Please enter a valid age (18-120)";
    }
    
    // Validate personal history selection
    if (!personalHistory) {
      newErrors.personalHistory = "Please indicate whether you have had breast cancer";
    }
    
    // Validate diagnosis age if applicable
    if (personalHistory === "yes" && !diagnosisAge) {
      newErrors.diagnosisAge = "Please enter your age at diagnosis";
    } else if (personalHistory === "yes" && !validateDiagnosisAge(diagnosisAge, age)) {
      newErrors.diagnosisAge = "Diagnosis age must be less than or equal to your current age";
    }
    
    // Validate family history selection
    if (!familyHistory) {
      newErrors.familyHistory = "Please indicate whether any family members have had breast cancer";
    }
    
    // If there are any errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Submit the form
    onSubmit({
      personalInfo: {
        age: parseInt(age, 10),
        hasBreastCancer: personalHistory === "yes",
        ...(personalHistory === "yes" && { diagnosisAge: parseInt(diagnosisAge, 10) }),
      },
      hasFamilyHistory: familyHistory === "yes",
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Personal Information</h2>
        
        <div className="space-y-6">
          {/* Age input */}
          <div className="form-group">
            <Label htmlFor="patientAge" className="block text-sm font-medium text-slate-700 mb-1">
              What is your age?
            </Label>
            <Input 
              type="number" 
              id="patientAge" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="18" 
              max="120"
              className="w-full md:w-1/3"
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            <p className="text-xs text-slate-500 mt-1">Please enter your current age in years</p>
          </div>

          {/* Personal history question */}
          <div className="form-group">
            <div className="block text-sm font-medium text-slate-700 mb-2">Have you had breast cancer?</div>
            <RadioGroup 
              value={personalHistory} 
              onValueChange={setPersonalHistory}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="personalYes" />
                <Label htmlFor="personalYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="personalNo" />
                <Label htmlFor="personalNo">No</Label>
              </div>
            </RadioGroup>
            {errors.personalHistory && <p className="text-red-500 text-xs mt-1">{errors.personalHistory}</p>}
          </div>

          {/* Personal diagnosis age (conditional) */}
          {personalHistory === "yes" && (
            <div className="form-group">
              <Label htmlFor="ageAtDiagnosis" className="block text-sm font-medium text-slate-700 mb-1">
                At what age were you diagnosed?
              </Label>
              <Input 
                type="number" 
                id="ageAtDiagnosis"
                value={diagnosisAge}
                onChange={(e) => setDiagnosisAge(e.target.value)} 
                min="0" 
                max="120"
                className="w-full md:w-1/3"
              />
              {errors.diagnosisAge && <p className="text-red-500 text-xs mt-1">{errors.diagnosisAge}</p>}
            </div>
          )}

          {/* Family history question */}
          <div className="form-group">
            <div className="block text-sm font-medium text-slate-700 mb-2">Have any family members had breast cancer?</div>
            <RadioGroup 
              value={familyHistory} 
              onValueChange={setFamilyHistory}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="familyYes" />
                <Label htmlFor="familyYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="familyNo" />
                <Label htmlFor="familyNo">No</Label>
              </div>
            </RadioGroup>
            {errors.familyHistory && <p className="text-red-500 text-xs mt-1">{errors.familyHistory}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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
