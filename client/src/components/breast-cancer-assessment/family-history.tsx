import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FamilyHistory as FamilyHistoryType, 
  FAMILY_MEMBERS, 
  MATERNAL_RELATIVES, 
  PATERNAL_RELATIVES,
  GENETIC_ABNORMALITY_OPTIONS,
  FEMALE_MEMBERS_OVARIAN,
  MALE_MEMBERS_BREAST,
  FEMALE_MEMBERS_MULTIPLE_BREAST_CANCER,
  MALE_MEMBERS_PROSTATE_CANCER,
  GeneticTestMember,
  OvarianCancerMember,
  BreastCancerMaleMember,
  MultipleBreastCancerMember,
  ProstateCancerMember
} from "./types";
import { ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";

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
  // Immediate family with breast cancer (women) data
  const [immediateFamily, setImmediateFamily] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map(FAMILY_MEMBERS.map(member => [
      member.value, 
      { 
        checked: false, 
        age: "" 
      }
    ]))
  );

  // Immediate family genetic test data
  const [immediateGeneticTest, setImmediateGeneticTest] = useState<GeneticTestMember[]>([]);
  const [selectedGeneticMember, setSelectedGeneticMember] = useState<string>("");
  const [showGeneticAbnormalityDialog, setShowGeneticAbnormalityDialog] = useState(false);
  const [currentGeneticAbnormality, setCurrentGeneticAbnormality] = useState<string>("");
  
  // Ovarian cancer family members
  const [ovarianCancerMembers, setOvarianCancerMembers] = useState<Map<string, boolean>>(
    new Map(FEMALE_MEMBERS_OVARIAN.map(member => [member.value, false]))
  );
  
  // Male breast cancer members
  const [maleBreastCancerMembers, setMaleBreastCancerMembers] = useState<Map<string, boolean>>(
    new Map(MALE_MEMBERS_BREAST.map(member => [member.value, false]))
  );
  
  // Multiple breast cancer members
  const [multipleBreastCancerMembers, setMultipleBreastCancerMembers] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map(FEMALE_MEMBERS_MULTIPLE_BREAST_CANCER.map(member => [member.value, { checked: false, age: "" }]))
  );
  
  // Prostate cancer members
  const [prostateCancerMembers, setProstateCancerMembers] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map(MALE_MEMBERS_PROSTATE_CANCER.map(member => [member.value, { checked: false, age: "" }]))
  );
  
  // Paternal and maternal family members with breast cancer
  const [paternalFamilyMembers, setPaternalFamilyMembers] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map()
  );
  
  const [maternalFamilyMembers, setMaternalFamilyMembers] = useState<Map<string, { checked: boolean, age: string }>>(
    new Map()
  );
  
  // Family breast cancer question
  const [hasBreastCancerInFamily, setHasBreastCancerInFamily] = useState<string>("");
  
  // Extended family data
  const [maternalRelatives, setMaternalRelatives] = useState<string[]>([]);
  const [paternalRelatives, setPaternalRelatives] = useState<string[]>([]);
  
  // Maternal and paternal genetic test data
  const [maternalGeneticTest, setMaternalGeneticTest] = useState<GeneticTestMember[]>([]);
  const [paternalGeneticTest, setPaternalGeneticTest] = useState<GeneticTestMember[]>([]);
  
  // Current family member being edited
  const [currentRelation, setCurrentRelation] = useState<string>("");
  const [showDiagnosisAgeDialog, setShowDiagnosisAgeDialog] = useState(false);
  const [diagnosisAge, setDiagnosisAge] = useState<string>("");
  
  // Error handling
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
    
    if (initialData.maternalFamilyMembers.length > 0) {
      const newMaternalFamilyMembers = new Map();
      
      initialData.maternalFamilyMembers.forEach(member => {
        newMaternalFamilyMembers.set(member.relation, {
          checked: true,
          age: member.diagnosisAge.toString()
        });
      });
      
      setMaternalFamilyMembers(newMaternalFamilyMembers);
    }
    
    if (initialData.paternalFamilyMembers.length > 0) {
      const newPaternalFamilyMembers = new Map();
      
      initialData.paternalFamilyMembers.forEach(member => {
        newPaternalFamilyMembers.set(member.relation, {
          checked: true,
          age: member.diagnosisAge.toString()
        });
      });
      
      setPaternalFamilyMembers(newPaternalFamilyMembers);
    }
    
    if (initialData.immediateGeneticTest.length > 0) {
      setImmediateGeneticTest(initialData.immediateGeneticTest);
    }
    
    if (initialData.maternalGeneticTest.length > 0) {
      setMaternalGeneticTest(initialData.maternalGeneticTest);
    }
    
    if (initialData.paternalGeneticTest.length > 0) {
      setPaternalGeneticTest(initialData.paternalGeneticTest);
    }
    
    if (initialData.ovarianCancer.length > 0) {
      const newOvarianMembers = new Map(ovarianCancerMembers);
      initialData.ovarianCancer.forEach(member => {
        newOvarianMembers.set(member.relation, true);
      });
      setOvarianCancerMembers(newOvarianMembers);
    }
    
    if (initialData.maleBreastCancer.length > 0) {
      const newMaleMembers = new Map(maleBreastCancerMembers);
      initialData.maleBreastCancer.forEach(member => {
        newMaleMembers.set(member.relation, true);
      });
      setMaleBreastCancerMembers(newMaleMembers);
    }
    
    if (initialData.multipleBreastCancer.length > 0) {
      const newMultipleBreastCancerMembers = new Map(multipleBreastCancerMembers);
      
      initialData.multipleBreastCancer.forEach(member => {
        newMultipleBreastCancerMembers.set(member.relation, {
          checked: true,
          age: member.firstDiagnosisAge.toString()
        });
      });
      
      setMultipleBreastCancerMembers(newMultipleBreastCancerMembers);
    }
    
    if (initialData.prostateCancer.length > 0) {
      const newProstateCancerMembers = new Map(prostateCancerMembers);
      
      initialData.prostateCancer.forEach(member => {
        newProstateCancerMembers.set(member.relation, {
          checked: true,
          age: member.diagnosisAge.toString()
        });
      });
      
      setProstateCancerMembers(newProstateCancerMembers);
    }
    
    if (initialData.hasBreastCancerInFamily !== undefined) {
      setHasBreastCancerInFamily(initialData.hasBreastCancerInFamily ? "yes" : "no");
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
  
  const handleAddGeneticTestMember = (memberType: string) => {
    setSelectedGeneticMember(memberType);
    setShowGeneticAbnormalityDialog(true);
    setCurrentGeneticAbnormality("");
  };
  
  const handleSaveGeneticTest = () => {
    if (!currentGeneticAbnormality) {
      return;
    }
    
    const newMember: GeneticTestMember = {
      relation: selectedGeneticMember,
      abnormality: currentGeneticAbnormality
    };
    
    // Determine which array to update based on the selected member
    if (FAMILY_MEMBERS.some(member => member.value === selectedGeneticMember)) {
      setImmediateGeneticTest(prev => [...prev, newMember]);
    } else if (MATERNAL_RELATIVES.some(member => member.value === selectedGeneticMember)) {
      setMaternalGeneticTest(prev => [...prev, newMember]);
    } else if (PATERNAL_RELATIVES.some(member => member.value === selectedGeneticMember)) {
      setPaternalGeneticTest(prev => [...prev, newMember]);
    }
    
    setShowGeneticAbnormalityDialog(false);
  };
  
  const handleRemoveGeneticTestMember = (index: number, type: 'immediate' | 'maternal' | 'paternal') => {
    if (type === 'immediate') {
      setImmediateGeneticTest(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'maternal') {
      setMaternalGeneticTest(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'paternal') {
      setPaternalGeneticTest(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const handleOvarianCancerChange = (value: string, checked: boolean) => {
    setOvarianCancerMembers(prev => {
      const newMap = new Map(prev);
      newMap.set(value, checked);
      return newMap;
    });
  };
  
  const handleMaleBreastCancerChange = (value: string, checked: boolean) => {
    setMaleBreastCancerMembers(prev => {
      const newMap = new Map(prev);
      newMap.set(value, checked);
      return newMap;
    });
  };
  
  const handleMultipleBreastCancerChange = (value: string, checked: boolean) => {
    setMultipleBreastCancerMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, checked });
      return newMap;
    });
  };
  
  const handleMultipleBreastCancerAgeChange = (value: string, age: string) => {
    setMultipleBreastCancerMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, age });
      return newMap;
    });
  };
  
  const handleProstateCancerChange = (value: string, checked: boolean) => {
    setProstateCancerMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, checked });
      return newMap;
    });
  };
  
  const handleProstateCancerAgeChange = (value: string, age: string) => {
    setProstateCancerMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, age });
      return newMap;
    });
  };
  
  const handlePaternalFamilyMemberChange = (value: string, checked: boolean) => {
    setPaternalFamilyMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, checked });
      return newMap;
    });
  };
  
  const handlePaternalFamilyMemberAgeChange = (value: string, age: string) => {
    setPaternalFamilyMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, age });
      return newMap;
    });
  };
  
  const handleMaternalFamilyMemberChange = (value: string, checked: boolean) => {
    setMaternalFamilyMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, checked });
      return newMap;
    });
  };
  
  const handleMaternalFamilyMemberAgeChange = (value: string, age: string) => {
    setMaternalFamilyMembers(prev => {
      const newMap = new Map(prev);
      const currentEntry = newMap.get(value) || { checked: false, age: "" };
      newMap.set(value, { ...currentEntry, age });
      return newMap;
    });
  };
  
  const handleFamilyMemberClick = (relation: string) => {
    setCurrentRelation(relation);
    setDiagnosisAge("");
    setShowDiagnosisAgeDialog(true);
  };
  
  const handleSaveDiagnosisAge = () => {
    if (!diagnosisAge || isNaN(parseInt(diagnosisAge, 10)) || parseInt(diagnosisAge, 10) < 0) {
      return;
    }
    
    handleCheckboxChange(currentRelation, true);
    handleAgeChange(currentRelation, diagnosisAge);
    setShowDiagnosisAgeDialog(false);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate if family history was indicated
    if (showFamilyHistory) {
      // Check if breast cancer in family is selected
      if (!hasBreastCancerInFamily) {
        newErrors.hasBreastCancerInFamily = "Geef aan of er borstkanker in uw familie is ontdekt";
      }
      
      // Check if diagnosis ages are provided for selected immediate family members
      immediateFamily.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`age_${relation}`] = `Voer een geldige leeftijd bij diagnose in`;
          }
        }
      });
      
      // Check maternal family members
      maternalFamilyMembers.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`maternal_age_${relation}`] = `Voer een geldige leeftijd bij diagnose in`;
          }
        }
      });
      
      // Check paternal family members
      paternalFamilyMembers.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`paternal_age_${relation}`] = `Voer een geldige leeftijd bij diagnose in`;
          }
        }
      });
      
      // Check multiple breast cancer members
      multipleBreastCancerMembers.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`multiple_age_${relation}`] = `Voer een geldige leeftijd bij diagnose in`;
          }
        }
      });
      
      // Check prostate cancer members
      prostateCancerMembers.forEach((data, relation) => {
        if (data.checked) {
          if (!data.age || isNaN(parseInt(data.age, 10)) || parseInt(data.age, 10) < 0) {
            newErrors[`prostate_age_${relation}`] = `Voer een geldige leeftijd bij diagnose in`;
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
    
    // Prepare maternal family members with breast cancer
    const maternalFamilyMembersData = Array.from(maternalFamilyMembers.entries())
      .filter(([_, data]) => data.checked)
      .map(([relation, data]) => ({
        relation,
        diagnosisAge: parseInt(data.age, 10)
      }));
    
    // Prepare paternal family members with breast cancer
    const paternalFamilyMembersData = Array.from(paternalFamilyMembers.entries())
      .filter(([_, data]) => data.checked)
      .map(([relation, data]) => ({
        relation,
        diagnosisAge: parseInt(data.age, 10)
      }));
    
    // Prepare multiple breast cancer members
    const multipleBreastCancer = Array.from(multipleBreastCancerMembers.entries())
      .filter(([_, data]) => data.checked)
      .map(([relation, data]) => ({
        relation,
        firstDiagnosisAge: parseInt(data.age, 10)
      }));
    
    // Prepare prostate cancer members
    const prostateCancer = Array.from(prostateCancerMembers.entries())
      .filter(([_, data]) => data.checked)
      .map(([relation, data]) => ({
        relation,
        diagnosisAge: parseInt(data.age, 10)
      }));
    
    // Prepare ovarian cancer members
    const ovarianCancer = Array.from(ovarianCancerMembers.entries())
      .filter(([_, checked]) => checked && _ !== 'none')
      .map(([relation, _]) => ({
        relation
      }));
    
    // Prepare male breast cancer members
    const maleBreastCancer = Array.from(maleBreastCancerMembers.entries())
      .filter(([_, checked]) => checked && _ !== 'none')
      .map(([relation, _]) => ({
        relation
      }));
    
    // Submit the form
    onSubmit({
      maternal: maternalRelatives,
      paternal: paternalRelatives,
      immediate,
      paternalFamilyMembers: paternalFamilyMembersData,
      maternalFamilyMembers: maternalFamilyMembersData,
      immediateGeneticTest,
      maternalGeneticTest,
      paternalGeneticTest,
      ovarianCancer,
      maleBreastCancer,
      multipleBreastCancer,
      prostateCancer,
      hasBreastCancerInFamily: hasBreastCancerInFamily === "yes"
    });
  };

  // Helper function to get the label for a relation
  const getRelationLabel = (relation: string): string => {
    // Check in all arrays
    const familyMember = FAMILY_MEMBERS.find(member => member.value === relation);
    if (familyMember) return familyMember.label;
    
    const maternalRelative = MATERNAL_RELATIVES.find(member => member.value === relation);
    if (maternalRelative) return maternalRelative.label;
    
    const paternalRelative = PATERNAL_RELATIVES.find(member => member.value === relation);
    if (paternalRelative) return paternalRelative.label;
    
    return relation;
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Familie Geschiedenis</h2>
        
        {showFamilyHistory ? (
          <div className="space-y-8">
            {/* Vraag 3: Family members genetic testing */}
            {initialData.immediateGeneticTest.length > 0 || (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 3: Welke familieleden in uw eigen gezin hebben een erfelijkheidsonderzoek naar borst- en eierstokkanker gehad?
                </h3>
                
                <div className="space-y-4">
                  {/* List of added family members with genetic test results */}
                  {immediateGeneticTest.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Toegevoegde familieleden:</h4>
                      <ul className="space-y-2">
                        {immediateGeneticTest.map((member, index) => (
                          <li key={index} className="flex items-center justify-between border-b pb-2">
                            <span>{getRelationLabel(member.relation)} - {
                              GENETIC_ABNORMALITY_OPTIONS.find(opt => opt.value === member.abnormality)?.label
                            }</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGeneticTestMember(index, 'immediate')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add new family member button */}
                  <div className="flex flex-wrap gap-2">
                    {FAMILY_MEMBERS.filter(member => member.value !== 'none').map(member => (
                      <Button 
                        key={member.value}
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGeneticTestMember(member.value)}
                        className="flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" /> {member.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Vraag 4: Paternal family members genetic testing */}
            {initialData.paternalGeneticTest.length > 0 || (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 4: Welke familieleden van uw vaderskant hebben een erfelijkheidsonderzoek naar borst- en eierstokkanker gehad?
                </h3>
                
                <div className="space-y-4">
                  {/* List of added paternal family members with genetic test results */}
                  {paternalGeneticTest.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Toegevoegde familieleden (vaderskant):</h4>
                      <ul className="space-y-2">
                        {paternalGeneticTest.map((member, index) => (
                          <li key={index} className="flex items-center justify-between border-b pb-2">
                            <span>{getRelationLabel(member.relation)} - {
                              GENETIC_ABNORMALITY_OPTIONS.find(opt => opt.value === member.abnormality)?.label
                            }</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGeneticTestMember(index, 'paternal')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add new paternal family member button */}
                  <div className="flex flex-wrap gap-2">
                    {PATERNAL_RELATIVES.filter(member => member.value !== 'none').map(member => (
                      <Button 
                        key={member.value}
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGeneticTestMember(member.value)}
                        className="flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" /> {member.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Vraag 5: Maternal family members genetic testing */}
            {initialData.maternalGeneticTest.length > 0 || (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 5: Welke familieleden van uw moederskant hebben een erfelijkheidsonderzoek naar borst- en eierstokkanker gehad?
                </h3>
                
                <div className="space-y-4">
                  {/* List of added maternal family members with genetic test results */}
                  {maternalGeneticTest.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Toegevoegde familieleden (moederskant):</h4>
                      <ul className="space-y-2">
                        {maternalGeneticTest.map((member, index) => (
                          <li key={index} className="flex items-center justify-between border-b pb-2">
                            <span>{getRelationLabel(member.relation)} - {
                              GENETIC_ABNORMALITY_OPTIONS.find(opt => opt.value === member.abnormality)?.label
                            }</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGeneticTestMember(index, 'maternal')}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add new maternal family member button */}
                  <div className="flex flex-wrap gap-2">
                    {MATERNAL_RELATIVES.filter(member => member.value !== 'none').map(member => (
                      <Button 
                        key={member.value}
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGeneticTestMember(member.value)}
                        className="flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" /> {member.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Vraag 6: Female family members with ovarian cancer */}
            <div className="form-group border p-4 rounded-md bg-slate-50">
              <h3 className="text-md font-medium mb-4 text-slate-800">
                Vraag 6: Is er bij iemand van onderstaande familieleden eierstok- of eileiderkanker ontdekt?
              </h3>
              
              <div className="space-y-3">
                {FEMALE_MEMBERS_OVARIAN.map(member => (
                  <div key={member.value} className="flex items-center">
                    <Checkbox 
                      id={`ovarian-${member.value}`} 
                      checked={ovarianCancerMembers.get(member.value) || false}
                      onCheckedChange={(checked) => 
                        handleOvarianCancerChange(member.value, checked as boolean)
                      }
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`ovarian-${member.value}`} className="ml-2">
                      {member.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vraag 7: Male family members with breast cancer */}
            <div className="form-group border p-4 rounded-md bg-slate-50">
              <h3 className="text-md font-medium mb-4 text-slate-800">
                Vraag 7: Is er bij iemand van onderstaande mannelijke familieleden borstkanker ontdekt?
              </h3>
              
              <div className="space-y-3">
                {MALE_MEMBERS_BREAST.map(member => (
                  <div key={member.value} className="flex items-center">
                    <Checkbox 
                      id={`male-breast-${member.value}`} 
                      checked={maleBreastCancerMembers.get(member.value) || false}
                      onCheckedChange={(checked) => 
                        handleMaleBreastCancerChange(member.value, checked as boolean)
                      }
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`male-breast-${member.value}`} className="ml-2">
                      {member.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vraag 8: Is there breast cancer in the family */}
            <div className="form-group border p-4 rounded-md bg-slate-50">
              <h3 className="text-md font-medium mb-4 text-slate-800">
                Vraag 8: Is er bij uw familie borstkanker ontdekt?
              </h3>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="family-breast-yes" 
                      name="family-breast-cancer"
                      value="yes"
                      checked={hasBreastCancerInFamily === "yes"}
                      onChange={(e) => setHasBreastCancerInFamily(e.target.value)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="family-breast-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="family-breast-no" 
                      name="family-breast-cancer"
                      value="no"
                      checked={hasBreastCancerInFamily === "no"}
                      onChange={(e) => setHasBreastCancerInFamily(e.target.value)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="family-breast-no">Nee</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="family-breast-unknown" 
                      name="family-breast-cancer"
                      value="unknown"
                      checked={hasBreastCancerInFamily === "unknown"}
                      onChange={(e) => setHasBreastCancerInFamily(e.target.value)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="family-breast-unknown">Onbekend</Label>
                  </div>
                </div>
                {errors.hasBreastCancerInFamily && (
                  <p className="text-red-500 text-xs mt-1">{errors.hasBreastCancerInFamily}</p>
                )}
              </div>
            </div>
            
            {/* Vraag 9: Which immediate family members have had breast cancer (only shown if hasBreastCancerInFamily is "yes") */}
            {hasBreastCancerInFamily === "yes" && (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 9: Bij welke familieleden in uw eigen gezin is er borstkanker ontdekt?
                </h3>
                
                <div className="mb-4">
                  {/* Show list of immediate family members who have been added with diagnosis age */}
                  {Array.from(immediateFamily.entries())
                    .filter(([_, data]) => data.checked)
                    .map(([relation, data]) => (
                      <div key={relation} className="flex items-center justify-between border-b py-2">
                        <span>{getRelationLabel(relation)} - Leeftijd bij diagnose: {data.age}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckboxChange(relation, false)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  }
                  
                  {/* Buttons to add family members */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {FAMILY_MEMBERS.filter(member => 
                      member.value !== 'none' && !immediateFamily.get(member.value)?.checked
                    ).map(member => (
                      <Button 
                        key={member.value}
                        type="button" 
                        variant="outline"
                        size="sm"
                        onClick={() => handleFamilyMemberClick(member.value)}
                        className="flex items-center"
                      >
                        <Plus className="h-3 w-3 mr-1" /> {member.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Vraag 10: Maternal family members with breast cancer (details) */}
            {hasBreastCancerInFamily === "yes" && (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 10: Bij welke familieleden aan uw moederskant is borstkanker ontdekt? En op welke leeftijd?
                </h3>
                
                {/* Show list of maternal family members who have been added with diagnosis age */}
                {Array.from(maternalFamilyMembers.entries())
                  .filter(([_, data]) => data.checked)
                  .map(([relation, data]) => (
                    <div key={relation} className="flex items-center justify-between border-b py-2">
                      <span>{getRelationLabel(relation)} - Leeftijd bij diagnose: {data.age}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMaternalFamilyMemberChange(relation, false)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                }
                
                {/* Form to add a new maternal family member with breast cancer */}
                <div className="mt-4 space-y-4">
                  {MATERNAL_RELATIVES.filter(member => 
                    member.value !== 'none' && !maternalFamilyMembers.get(member.value)?.checked
                  ).map(member => (
                    <div key={member.value} className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`maternal-${member.value}`}
                          checked={maternalFamilyMembers.get(member.value)?.checked || false}
                          onCheckedChange={(checked) => 
                            handleMaternalFamilyMemberChange(member.value, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor={`maternal-${member.value}`} className="ml-2">
                          {member.label}
                        </Label>
                      </div>
                      
                      {maternalFamilyMembers.get(member.value)?.checked && (
                        <div className="ml-7">
                          <Label htmlFor={`maternal-age-${member.value}`} className="text-sm">
                            Leeftijd bij diagnose:
                          </Label>
                          <Input
                            type="number"
                            id={`maternal-age-${member.value}`}
                            value={maternalFamilyMembers.get(member.value)?.age || ""}
                            onChange={(e) => handleMaternalFamilyMemberAgeChange(member.value, e.target.value)}
                            min="0"
                            max="120"
                            className="w-24 inline-block ml-2"
                          />
                          {errors[`maternal_age_${member.value}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`maternal_age_${member.value}`]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vraag 11: Paternal family members with breast cancer (details) */}
            {hasBreastCancerInFamily === "yes" && (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 11: Bij welke familieleden aan uw vaderskant is borstkanker ontdekt? En op welke leeftijd?
                </h3>
                
                {/* Show list of paternal family members who have been added with diagnosis age */}
                {Array.from(paternalFamilyMembers.entries())
                  .filter(([_, data]) => data.checked)
                  .map(([relation, data]) => (
                    <div key={relation} className="flex items-center justify-between border-b py-2">
                      <span>{getRelationLabel(relation)} - Leeftijd bij diagnose: {data.age}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePaternalFamilyMemberChange(relation, false)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                }
                
                {/* Form to add a new paternal family member with breast cancer */}
                <div className="mt-4 space-y-4">
                  {PATERNAL_RELATIVES.filter(member => 
                    member.value !== 'none' && !paternalFamilyMembers.get(member.value)?.checked
                  ).map(member => (
                    <div key={member.value} className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`paternal-${member.value}`}
                          checked={paternalFamilyMembers.get(member.value)?.checked || false}
                          onCheckedChange={(checked) => 
                            handlePaternalFamilyMemberChange(member.value, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor={`paternal-${member.value}`} className="ml-2">
                          {member.label}
                        </Label>
                      </div>
                      
                      {paternalFamilyMembers.get(member.value)?.checked && (
                        <div className="ml-7">
                          <Label htmlFor={`paternal-age-${member.value}`} className="text-sm">
                            Leeftijd bij diagnose:
                          </Label>
                          <Input
                            type="number"
                            id={`paternal-age-${member.value}`}
                            value={paternalFamilyMembers.get(member.value)?.age || ""}
                            onChange={(e) => handlePaternalFamilyMemberAgeChange(member.value, e.target.value)}
                            min="0"
                            max="120"
                            className="w-24 inline-block ml-2"
                          />
                          {errors[`paternal_age_${member.value}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`paternal_age_${member.value}`]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vraag 12: Multiple breast cancer diagnoses */}
            {hasBreastCancerInFamily === "yes" && (
              <div className="form-group border p-4 rounded-md bg-slate-50">
                <h3 className="text-md font-medium mb-4 text-slate-800">
                  Vraag 12: Heeft iemand van onderstaande familieleden meerdere keren borstkanker gehad? Zo ja, op welke leeftijd kreeg deze persoon voor de eerste keer borstkanker?
                </h3>
                
                {/* Show list of family members with multiple breast cancer diagnoses */}
                {Array.from(multipleBreastCancerMembers.entries())
                  .filter(([_, data]) => data.checked)
                  .map(([relation, data]) => (
                    <div key={relation} className="flex items-center justify-between border-b py-2">
                      <span>{getRelationLabel(relation)} - Leeftijd bij eerste diagnose: {data.age}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMultipleBreastCancerChange(relation, false)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                }
                
                {/* Form to add a family member with multiple breast cancer diagnoses */}
                <div className="mt-4 space-y-4">
                  {FEMALE_MEMBERS_MULTIPLE_BREAST_CANCER.filter(member => 
                    member.value !== 'none' && !multipleBreastCancerMembers.get(member.value)?.checked
                  ).map(member => (
                    <div key={member.value} className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`multiple-breast-${member.value}`}
                          checked={multipleBreastCancerMembers.get(member.value)?.checked || false}
                          onCheckedChange={(checked) => 
                            handleMultipleBreastCancerChange(member.value, checked as boolean)
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor={`multiple-breast-${member.value}`} className="ml-2">
                          {member.label}
                        </Label>
                      </div>
                      
                      {multipleBreastCancerMembers.get(member.value)?.checked && (
                        <div className="ml-7">
                          <Label htmlFor={`multiple-breast-age-${member.value}`} className="text-sm">
                            Leeftijd bij eerste diagnose:
                          </Label>
                          <Input
                            type="number"
                            id={`multiple-breast-age-${member.value}`}
                            value={multipleBreastCancerMembers.get(member.value)?.age || ""}
                            onChange={(e) => handleMultipleBreastCancerAgeChange(member.value, e.target.value)}
                            min="0"
                            max="120"
                            className="w-24 inline-block ml-2"
                          />
                          {errors[`multiple_age_${member.value}`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`multiple_age_${member.value}`]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Vraag 13: Prostate cancer diagnoses */}
            <div className="form-group border p-4 rounded-md bg-slate-50">
              <h3 className="text-md font-medium mb-4 text-slate-800">
                Vraag 13: Is er bij iemand van onderstaande mannelijke familieleden prostaatkanker ontdekt vóór hun 60e levensjaar? Zo ja, op welke leeftijd?
              </h3>
              
              {/* Show list of family members with prostate cancer */}
              {Array.from(prostateCancerMembers.entries())
                .filter(([_, data]) => data.checked)
                .map(([relation, data]) => (
                  <div key={relation} className="flex items-center justify-between border-b py-2">
                    <span>{getRelationLabel(relation)} - Leeftijd bij diagnose: {data.age}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProstateCancerChange(relation, false)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              }
              
              {/* Form to add a family member with prostate cancer */}
              <div className="mt-4 space-y-4">
                {MALE_MEMBERS_PROSTATE_CANCER.filter(member => 
                  member.value !== 'none' && !prostateCancerMembers.get(member.value)?.checked
                ).map(member => (
                  <div key={member.value} className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id={`prostate-${member.value}`}
                        checked={prostateCancerMembers.get(member.value)?.checked || false}
                        onCheckedChange={(checked) => 
                          handleProstateCancerChange(member.value, checked as boolean)
                        }
                        className="h-5 w-5"
                      />
                      <Label htmlFor={`prostate-${member.value}`} className="ml-2">
                        {member.label}
                      </Label>
                    </div>
                    
                    {prostateCancerMembers.get(member.value)?.checked && (
                      <div className="ml-7">
                        <Label htmlFor={`prostate-age-${member.value}`} className="text-sm">
                          Leeftijd bij diagnose:
                        </Label>
                        <Input
                          type="number"
                          id={`prostate-age-${member.value}`}
                          value={prostateCancerMembers.get(member.value)?.age || ""}
                          onChange={(e) => handleProstateCancerAgeChange(member.value, e.target.value)}
                          min="0"
                          max="60"
                          className="w-24 inline-block ml-2"
                        />
                        <span className="ml-2 text-xs text-slate-500">(jonger dan 60)</span>
                        {errors[`prostate_age_${member.value}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`prostate_age_${member.value}`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {errors.family && <p className="text-red-500 text-sm">{errors.family}</p>}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="text-slate-700">U heeft aangegeven dat er geen familiegeschiedenis is van borstkanker.</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            className="px-4 py-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Vorige
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="px-4 py-2"
          >
            Volgende <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      {/* Dialog for selecting genetic abnormality */}
      <Dialog open={showGeneticAbnormalityDialog} onOpenChange={setShowGeneticAbnormalityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecteer afwijking</DialogTitle>
            <DialogDescription>
              Is er een afwijking gevonden bij het erfelijkheidsonderzoek?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select 
              value={currentGeneticAbnormality} 
              onValueChange={setCurrentGeneticAbnormality}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een optie" />
              </SelectTrigger>
              <SelectContent>
                {GENETIC_ABNORMALITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSaveGeneticTest}>Opslaan</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for entering diagnosis age */}
      <Dialog open={showDiagnosisAgeDialog} onOpenChange={setShowDiagnosisAgeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voer leeftijd bij diagnose in</DialogTitle>
            <DialogDescription>
              Op welke leeftijd werd borstkanker gediagnosticeerd bij deze persoon?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              type="number"
              min="0"
              max="120"
              placeholder="Leeftijd"
              value={diagnosisAge}
              onChange={(e) => setDiagnosisAge(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSaveDiagnosisAge}>Opslaan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
