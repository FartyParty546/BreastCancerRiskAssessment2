import { useState } from "react";
import { AssessmentFormData, AssessmentResults } from "./types";
import PersonalInfo from "./personal-info";
import FamilyHistory from "./family-history";
import Results from "./results";
import { getBreastCancerRisk, getRecommendations } from "@/lib/utils";
import { generateFHIRData, downloadFHIRData } from "@/lib/fhir";

const initialFormData: AssessmentFormData = {
  personalInfo: {
    age: 0,
    hasBreastCancer: false,
  },
  hasFamilyHistory: false,
  familyHistory: {
    maternal: [],
    paternal: [],
    immediate: []
  }
};

export default function BreastCancerAssessmentForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [fhirData, setFhirData] = useState<any>(null);
  
  const totalSections = 3;
  const progressPercentage = ((currentSection - 1) / (totalSections - 1)) * 100;
  
  const handlePersonalInfoSubmit = (personalInfo: any) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: personalInfo.personalInfo,
      hasFamilyHistory: personalInfo.hasFamilyHistory
    }));
    
    setCurrentSection(2);
  };
  
  const handleFamilyHistorySubmit = (familyHistory: any) => {
    const updatedFormData = {
      ...formData,
      familyHistory
    };
    
    setFormData(updatedFormData);
    
    // Calculate risk assessment
    const riskAssessment = getBreastCancerRisk(updatedFormData);
    setResults(riskAssessment);
    
    // Get recommendations based on risk level
    const recommendationsList = getRecommendations(riskAssessment.riskLevel);
    setRecommendations(recommendationsList);
    
    // Generate FHIR data
    const fhirDataOutput = generateFHIRData(
      updatedFormData,
      riskAssessment.riskLevel,
      riskAssessment.explanation
    );
    setFhirData(fhirDataOutput);
    
    setCurrentSection(3);
  };
  
  const handleBack = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
    }
  };
  
  const handleReset = () => {
    setFormData(initialFormData);
    setResults(null);
    setRecommendations([]);
    setFhirData(null);
    setCurrentSection(1);
  };
  
  const handleDownloadFHIR = () => {
    if (fhirData) {
      downloadFHIRData(fhirData);
    }
  };
  
  return (
    <div className="min-h-screen">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Breast Cancer Risk Assessment</h1>
          <p className="text-sm md:text-base opacity-90 mt-1">Complete the questionnaire to receive a personalized risk assessment</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form className="space-y-8">
          {/* Progress indicator */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between text-xs text-slate-500">
            <span>Personal Information</span>
            <span>Family History</span>
            <span>Risk Assessment</span>
          </div>
          
          {/* Form sections */}
          <div className="form-sections">
            {currentSection === 1 && (
              <PersonalInfo 
                onSubmit={handlePersonalInfoSubmit}
                initialData={formData}
              />
            )}
            
            {currentSection === 2 && (
              <FamilyHistory 
                onSubmit={handleFamilyHistorySubmit} 
                onBack={handleBack}
                initialData={formData.familyHistory}
                showFamilyHistory={formData.hasFamilyHistory}
              />
            )}
            
            {currentSection === 3 && (
              <Results 
                onBack={handleBack}
                onReset={handleReset}
                onDownloadFHIR={handleDownloadFHIR}
                results={results!}
                recommendations={recommendations}
                patientData={formData}
              />
            )}
          </div>
        </form>
      </main>

      <footer className="bg-slate-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2023 Breast Cancer Risk Assessment Tool</p>
              <p className="text-xs text-slate-400 mt-1">This tool is for informational purposes only and does not constitute medical advice.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="text-sm text-slate-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
