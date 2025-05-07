import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AssessmentFormData, 
  AssessmentResults, 
  FAMILY_MEMBERS, 
  MATERNAL_RELATIVES, 
  PATERNAL_RELATIVES,
  GENETIC_ABNORMALITY_OPTIONS,
  FEMALE_MEMBERS_OVARIAN,
  MALE_MEMBERS_BREAST
} from "./types";
import { ArrowLeft, DownloadIcon, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecommendations } from "@/lib/utils";

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
  const getFamilyMemberLabel = (relation: string): string => {
    const member = FAMILY_MEMBERS.find((m) => m.value === relation);
    return member ? member.label : relation;
  };

  const userAge = patientData.personalInfo.age;
  
  const ageBasedRecommendations = getRecommendations(results.riskLevel, userAge);
  // Helper function to get maternal relative label
  const getMaternalRelativeLabel = (relation: string): string => {
    const member = MATERNAL_RELATIVES.find((m) => m.value === relation);
    return member ? member.label : relation;
  };
  
  // Helper function to get paternal relative label
  const getPaternalRelativeLabel = (relation: string) => {
    const member = PATERNAL_RELATIVES.find((m) => m.value === relation);
    return member ? member.label : relation;
  };
  
  // Helper function to get abnormality label
  const getAbnormalityLabel = (value: string) => {
    const abnormality = GENETIC_ABNORMALITY_OPTIONS.find(a => a.value === value);
    return abnormality ? abnormality.label : value;
  };
  
  // Helper function to get female member label for ovarian cancer
  const getFemaleOvarianLabel = (value: string) => {
    const female = FEMALE_MEMBERS_OVARIAN.find(f => f.value === value);
    return female ? female.label : value;
  };
  
  // Helper function to get male member label for breast cancer
  const getMaleBreastLabel = (value: string) => {
    const male = MALE_MEMBERS_BREAST.find(m => m.value === value);
    return male ? male.label : value;
  };
  
  // Translate risk level to Dutch
  const translateRiskLevel = (riskLevel: string): string => {
    switch(riskLevel) {
      case 'High': return 'Verwijs naar klinische genetica';
      case 'Moderate': return 'Jaarlijkse screening buiten het BVO';
      case 'Average': return 'Screening via het BVO';
      default: return riskLevel;
    }
  };



  const trimRelation = (relation: string): string => {
    return relation.replace(/^(immediate_|maternal_|paternal_)/, '').replace(/_\d+$/, '');
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">Risicobeoordeling Resultaten</h2>
        
        <div className="space-y-6">
          {/* Risk Level */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Uw Risiconiveau:</h3>
            <p className={cn("text-base", results.riskColor)}>{translateRiskLevel(results.riskLevel)}</p>
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Toelichting:</h3>
            <p className="text-base">{results.explanation}</p>
            
            {/* Family Breakdown */}
            <div className="mt-4">
              <h4 className="text-sm font-medium">Uitsplitsing Familiegeschiedenis:</h4>
              <ul className="list-disc list-inside text-sm mt-2">
                {patientData.personalInfo.hasBreastCancer && (
                  <li>
                    U bent gediagnosticeerd met borstkanker op leeftijd {patientData.personalInfo.diagnosisAge}.
                  </li>
                )}
                
                {/* Personal genetic testing */}
                {patientData.personalInfo.hadGeneticTest && (
                  <li>
                    U heeft een erfelijkheidsonderzoek naar borst- en eierstokkanker gehad.
                  </li>
                )}
                
                {/* Family genetic testing */}
                {patientData.personalInfo.familyHadGeneticTest && (
                  <li>
                    Er is bij uw familie een erfelijkheidsonderzoek naar borst- en eierstokkanker uitgevoerd.
                    
                    {/* Immediate family genetic testing */}
                    {patientData.familyHistory.immediateGeneticTest.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.immediateGeneticTest.map((member, index) => (
                          <li key={`genetic-immediate-${index}`}>
                            {getFamilyMemberLabel(member.relation)}: {getAbnormalityLabel(member.abnormality)}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Maternal genetic testing */}
                    {patientData.familyHistory.maternalGeneticTest.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.maternalGeneticTest.map((member, index) => (
                          <li key={`genetic-maternal-${index}`}>
                            {getMaternalRelativeLabel(member.relation)}: {getAbnormalityLabel(member.abnormality)}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Paternal genetic testing */}
                    {patientData.familyHistory.paternalGeneticTest.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.paternalGeneticTest.map((member, index) => (
                          <li key={`genetic-paternal-${index}`}>
                            {getPaternalRelativeLabel(member.relation)}: {getAbnormalityLabel(member.abnormality)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
                
                {/* Breast cancer in immediate family */}
                {patientData.familyHistory.immediate.length > 0 && (
                  <li>
                    Directe familieleden met borstkanker:
                    <ul className="list-[circle] list-inside ml-4">
                      {patientData.familyHistory.immediate.map((member, index) => (
                        <li key={`immediate-${index}`}>
                          {getFamilyMemberLabel(trimRelation(member.relation))}: Gediagnosticeerd op leeftijd {member.diagnosisAge}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                
                {/* Ovarian cancer in female relatives */}
                {patientData.familyHistory.ovarianCancer.length > 0 && (
                  <li>
                    Familieleden met eierstok- of eileiderkanker:
                    <ul className="list-[circle] list-inside ml-4">
                      {patientData.familyHistory.ovarianCancer.map((member, index) => (
                        <li key={`ovarian-${index}`}>
                          {getFemaleOvarianLabel(member.relation)}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                
                {/* Breast cancer in male relatives */}
                {patientData.familyHistory.maleBreastCancer.length > 0 && (
                  <li>
                    Mannelijke familieleden met borstkanker:
                    <ul className="list-[circle] list-inside ml-4">
                      {patientData.familyHistory.maleBreastCancer.map((member, index) => (
                        <li key={`male-breast-${index}`}>
                          {getMaleBreastLabel(member.relation)}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                
                {/* Mother's side breast cancer */}
                {patientData.familyHistory.maternal.length > 0 && (
                  <li>
                    Moederskant: {patientData.familyHistory.maternal.length} aangetaste familieleden
                    {patientData.familyHistory.maternal.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.maternalFamilyMembers.map((relative, index) => (
                          <li key={`maternal-${index}`}>{getMaternalRelativeLabel(relative.relation)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
                
                {/* Father's side breast cancer */}
                {patientData.familyHistory.paternal.length > 0 && (
                  <li>
                    Vaderskant: {patientData.familyHistory.paternal.length} aangetaste familieleden
                    {patientData.familyHistory.paternal.length > 0 && (
                      <ul className="list-[circle] list-inside ml-4">
                        {patientData.familyHistory.paternalFamilyMembers.map((relative, index) => (
                          <li key={`paternal-${index}`}>{getPaternalRelativeLabel(relative.relation)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
                  
                  {/* First degree pancreatic cancer */}
                {patientData.familyHistory.pancreaticCancer.length > 0 && (
                  <li>
                    Er is bij uw familie PDAC gevonden bij:
                  <ul className="list-[circle] list-inside ml-4">
                    {patientData.familyHistory.pancreaticCancer.map((relative, index) => (
                      <li key={`pancreatic-${index}`}>{getFamilyMemberLabel(relative.relation)}</li>
                    ))}
                  </ul>
                  </li>
                )}

                {/* Prostate cancer in family */}
                {patientData.familyHistory.prostateCancer.length > 0 && (
                  <li>
                    Familieleden met Prostaatkanker:
                    <ul className="list-[circle] list-inside ml-4">
                      {patientData.familyHistory.prostateCancer.map((member, index) => (
                        <li key={`prostate-${index}`}>
                          {getFamilyMemberLabel(member.relation)}: Gediagnosticeerd op leeftijd {"onder de 60 jaar "}
                        </li>
                      ))}
                    </ul>
                  </li>  
                )}
                
                {!patientData.personalInfo.hasBreastCancer && 
                 patientData.familyHistory.immediate.length === 0 && 
                 patientData.familyHistory.maternal.length === 0 && 
                 patientData.familyHistory.paternal.length === 0 && 
                 patientData.familyHistory.ovarianCancer.length === 0 &&
                 patientData.familyHistory.maleBreastCancer.length === 0 && 
                 patientData.familyHistory.pancreaticCancer.length === 0 && (
                  <li>Geen gemelde geschiedenis van borst- of eierstokkanker.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-2">Aanbevelingen:</h3>
            <div className="space-y-2">
              {ageBasedRecommendations.map((recommendation, index) => (
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
              <ArrowLeft className="mr-2 h-4 w-4" /> Vorige
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
            <RefreshCw className="mr-2 h-4 w-4" /> Begin een Nieuwe Beoordeling
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
