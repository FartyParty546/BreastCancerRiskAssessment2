import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssessmentFormData, AssessmentResults, FAMILY_MEMBERS, MATERNAL_RELATIVES, PATERNAL_RELATIVES } from "./types";
import { ArrowLeft, DownloadIcon, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsProps {
  onBack: () => void;
  onReset: () => void;
  onDownloadFHIR: () => void;
  results: AssessmentResults;
  recommendations: string[];
  patientData: AssessmentFormData;
}

export default function Results({ 
  onBack, 
  onReset, 
  onDownloadFHIR, 
  results, 
  recommendations, 
  patientData 
}: ResultsProps) {
  // Helper function to get family member label
  const getFamilyMemberLabel = (value: string) => {
    const member = FAMILY_MEMBERS.find(m => m.value === value);
    return member ? member.label : value;
  };
  
  // Helper function to get maternal relative label
  const getMaternalRelativeLabel = (value: string) => {
    const relative = MATERNAL_RELATIVES.find(r => r.value === value);
    return relative ? relative.label : value;
  };
  
  // Helper function to get paternal relative label
  const getPaternalRelativeLabel = (value: string) => {
    const relative = PATERNAL_RELATIVES.find(r => r.value === value);
    return relative ? relative.label : value;
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Risk Assessment Results</h2>
        
        <div className="space-y-6">
          {/* Risk Level */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Your Risk Level:</h3>
            <p className={cn("text-base", results.riskColor)}>{results.riskLevel}</p>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Explanation:</h3>
            <p className="text-base">{results.explanation}</p>
            
            {/* Family Breakdown */}
            <div className="mt-4">
              <h4 className="text-sm font-medium">Family History Breakdown:</h4>
              <ul className="list-disc list-inside text-sm mt-2">
                {patientData.personalInfo.hasBreastCancer && (
                  <li>
                    You have been diagnosed with breast cancer at age {patientData.personalInfo.diagnosisAge}.
                  </li>
                )}
                
                {patientData.familyHistory.immediate.map((member, index) => (
                  <li key={`immediate-${index}`}>
                    {getFamilyMemberLabel(member.relation)}: Diagnosed at age {member.diagnosisAge}
                  </li>
                ))}
                
                {patientData.familyHistory.maternal.length > 0 && (
                  <li>
                    Mother's side: {patientData.familyHistory.maternal.length} affected relative(s)
                    {patientData.familyHistory.maternal.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.maternal.map((relative, index) => (
                          <li key={`maternal-${index}`}>{getMaternalRelativeLabel(relative)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
                
                {patientData.familyHistory.paternal.length > 0 && (
                  <li>
                    Father's side: {patientData.familyHistory.paternal.length} affected relative(s)
                    {patientData.familyHistory.paternal.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.paternal.map((relative, index) => (
                          <li key={`paternal-${index}`}>{getPaternalRelativeLabel(relative)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
                
                {!patientData.personalInfo.hasBreastCancer && 
                 patientData.familyHistory.immediate.length === 0 && 
                 patientData.familyHistory.maternal.length === 0 && 
                 patientData.familyHistory.paternal.length === 0 && (
                  <li>No reported history of breast cancer.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Recommendations:</h3>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <p key={index} className="flex items-start">
                  <CheckCircle className="text-primary mr-2 mt-0.5 h-5 w-5 flex-shrink-0" /> 
                  <span>{recommendation}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between">
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
              onClick={onDownloadFHIR}
              className="px-4 py-2"
            >
              <DownloadIcon className="mr-2 h-4 w-4" /> Download FHIR Data
            </Button>
          </div>
          <Button 
            type="button" 
            variant="outline"
            onClick={onReset}
            className="w-full px-4 py-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Start a New Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
