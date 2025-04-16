import { calculateBirthYear } from "./utils";
import { AssessmentFormData, GeneticTestMember } from "@/components/breast-cancer-assessment/types";

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
                display: "Borstkanker Risicobeoordeling"
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
          display: "Persoonlijke Geschiedenis van Borstkanker"
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
            display: "Leeftijd bij Persoonlijke Diagnose"
          }
        ]
      },
      valueInteger: patientData.personalInfo.diagnosisAge
    });
  }
  
  // Add genetic testing information
  fhirData.entry[1].resource.component.push({
    code: {
      coding: [
        {
          system: "http://example.org/breast-cancer-assessment",
          code: "genetic-testing-personal",
          display: "Erfelijkheidsonderzoek Ondergaan"
        }
      ]
    },
    valueBoolean: patientData.personalInfo.hadGeneticTest
  });
  
  fhirData.entry[1].resource.component.push({
    code: {
      coding: [
        {
          system: "http://example.org/breast-cancer-assessment",
          code: "genetic-testing-family",
          display: "Familie Erfelijkheidsonderzoek Ondergaan"
        }
      ]
    },
    valueBoolean: patientData.personalInfo.familyHadGeneticTest
  });
  
  // Add family history components if applicable
  if (patientData.hasFamilyHistory) {
    // Add breast cancer in family
    fhirData.entry[1].resource.component.push({
      code: {
        coding: [
          {
            system: "http://example.org/breast-cancer-assessment",
            code: "breast-cancer-in-family",
            display: "Borstkanker in Familie"
          }
        ]
      },
      valueBoolean: patientData.familyHistory.hasBreastCancerInFamily
    });
    
    // Add immediate family members with breast cancer
    patientData.familyHistory.immediate.forEach(member => {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: `family-history-${member.relation}`,
              display: `Familie Geschiedenis - ${member.relation.charAt(0).toUpperCase() + member.relation.slice(1)}`
            }
          ]
        },
        valueInteger: member.diagnosisAge
      });
    });
    
    // Add maternal relatives with breast cancer
    if (patientData.familyHistory.maternal.length > 0) {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: "family-history-maternal",
              display: "Familie Geschiedenis - Familieleden Moederskant"
            }
          ]
        },
        valueString: patientData.familyHistory.maternal.join(", ")
      });
    }
    
    // Add paternal relatives with breast cancer
    if (patientData.familyHistory.paternal.length > 0) {
      fhirData.entry[1].resource.component.push({
        code: {
          coding: [
            {
              system: "http://example.org/breast-cancer-assessment",
              code: "family-history-paternal",
              display: "Familie Geschiedenis - Familieleden Vaderskant"
            }
          ]
        },
        valueString: patientData.familyHistory.paternal.join(", ")
      });
    }
    
    // Add genetic test results for immediate family members
    if (patientData.familyHistory.immediateGeneticTest.length > 0) {
      patientData.familyHistory.immediateGeneticTest.forEach((member: GeneticTestMember, index: number) => {
        fhirData.entry[1].resource.component.push({
          code: {
            coding: [
              {
                system: "http://example.org/breast-cancer-assessment",
                code: `genetic-test-immediate-${index}`,
                display: `Erfelijkheidsonderzoek - ${member.relation}`
              }
            ]
          },
          valueString: `${member.relation}: ${member.abnormality}`
        });
      });
    }
    
    // Add genetic test results for maternal family members
    if (patientData.familyHistory.maternalGeneticTest.length > 0) {
      patientData.familyHistory.maternalGeneticTest.forEach((member: GeneticTestMember, index: number) => {
        fhirData.entry[1].resource.component.push({
          code: {
            coding: [
              {
                system: "http://example.org/breast-cancer-assessment",
                code: `genetic-test-maternal-${index}`,
                display: `Erfelijkheidsonderzoek Moederskant - ${member.relation}`
              }
            ]
          },
          valueString: `${member.relation}: ${member.abnormality}`
        });
      });
    }
    
    // Add genetic test results for paternal family members
    if (patientData.familyHistory.paternalGeneticTest.length > 0) {
      patientData.familyHistory.paternalGeneticTest.forEach((member: GeneticTestMember, index: number) => {
        fhirData.entry[1].resource.component.push({
          code: {
            coding: [
              {
                system: "http://example.org/breast-cancer-assessment",
                code: `genetic-test-paternal-${index}`,
                display: `Erfelijkheidsonderzoek Vaderskant - ${member.relation}`
              }
            ]
          },
          valueString: `${member.relation}: ${member.abnormality}`
        });
      });
    }
    
    // Add ovarian cancer family members
    if (patientData.familyHistory.ovarianCancer.length > 0) {
      patientData.familyHistory.ovarianCancer.forEach((member, index) => {
        fhirData.entry[1].resource.component.push({
          code: {
            coding: [
              {
                system: "http://example.org/breast-cancer-assessment",
                code: `ovarian-cancer-${index}`,
                display: `Eierstokkanker - Familielid`
              }
            ]
          },
          valueString: member.relation
        });
      });
    }
    
    // Add male breast cancer family members
    if (patientData.familyHistory.maleBreastCancer.length > 0) {
      patientData.familyHistory.maleBreastCancer.forEach((member, index) => {
        fhirData.entry[1].resource.component.push({
          code: {
            coding: [
              {
                system: "http://example.org/breast-cancer-assessment",
                code: `male-breast-cancer-${index}`,
                display: `Borstkanker bij Mannelijk Familielid`
              }
            ]
          },
          valueString: member.relation
        });
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
          display: "Toelichting Risicobeoordeling"
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
  downloadAnchorNode.setAttribute("download", "borstkanker_risico_fhir.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
