import { calculateBirthYear } from "./utils";
import { AssessmentFormData } from "@/components/breast-cancer-assessment/types";

export function generateFHIRData(patientData: AssessmentFormData, riskLevel: string, explanation: string) {
  // Create FHIR resource
  const fhirData = {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: "breast-cancer-risk-assessment",
          active: true,
          name: [
            {
              use: "official",
              text: "Assessment Patient"
            }
          ],
          gender: "unknown",
          birthDate: calculateBirthYear(patientData.personalInfo.age)
        }
      },
      {
        resource: {
          resourceType: "Observation",
          status: "final",
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "21156-8",
                display: "Breast Cancer Risk Assessment"
              }
            ]
          },
          subject: {
            reference: "Patient/breast-cancer-risk-assessment"
          },
          valueCodeableConcept: {
            coding: [
              {
                system: "http://example.org/risk-assessment",
                code: riskLevel.toLowerCase().replace(/\s/g, "-"),
                display: riskLevel
              }
            ]
          },
          component: []
        }
      }
    ]
  };
  
  // Add personal history component
  fhirData.entry[1].resource.component.push({
    code: {
      coding: [
        {
          system: "http://example.org/breast-cancer-assessment",
          code: "personal-history",
          display: "Personal History of Breast Cancer"
        }
      ]
    },
    valueBoolean: patientData.personalInfo.hasBreastCancer
  });
  
  // Add diagnosis age if applicable
  if (patientData.personalInfo.hasBreastCancer && patientData.personalInfo.diagnosisAge) {
    fhirData.entry[1].resource.component.push({
      code: {
        coding: [
          {
            system: "http://example.org/breast-cancer-assessment",
            code: "personal-diagnosis-age",
            display: "Age at Personal Diagnosis"
          }
        ]
      },
      valueInteger: patientData.personalInfo.diagnosisAge
    });
  }
  
  // Add family history components if applicable
  if (patientData.hasFamilyHistory) {
    // Add immediate family members
    patientData.familyHistory.immediate.forEach(member => {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: `family-history-${member.relation}`,
              display: `Family History - ${member.relation.charAt(0).toUpperCase() + member.relation.slice(1)}`
            }
          ]
        },
        valueInteger: member.diagnosisAge
      });
    });
    
    // Add maternal relatives
    if (patientData.familyHistory.maternal.length > 0) {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: "family-history-maternal",
              display: "Family History - Maternal Relatives"
            }
          ]
        },
        valueString: patientData.familyHistory.maternal.join(", ")
      });
    }
    
    // Add paternal relatives
    if (patientData.familyHistory.paternal.length > 0) {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: "family-history-paternal",
              display: "Family History - Paternal Relatives"
            }
          ]
        },
        valueString: patientData.familyHistory.paternal.join(", ")
      });
    }
  }
  
  // Add explanation
  fhirData.entry[1].resource.component.push({
    code: {
      coding: [
        {
          system: "http://example.org/breast-cancer-assessment",
          code: "risk-explanation",
          display: "Risk Assessment Explanation"
        }
      ]
    },
    valueString: explanation
  });
  
  return fhirData;
}

export function downloadFHIRData(fhirData: any) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "breast_cancer_risk_fhir.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
