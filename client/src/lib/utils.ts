import FamilyHistory from "@/components/breast-cancer-assessment/family-history";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateAge(age: string | number): boolean {
  const ageNumber = typeof age === 'string' ? parseInt(age, 10) : age;
  return !isNaN(ageNumber) && ageNumber >= 18 && ageNumber <= 120;
}

export function validateDiagnosisAge(diagnosisAge: string | number, currentAge: string | number): boolean {
  const diagnosisAgeNumber = typeof diagnosisAge === 'string' ? parseInt(diagnosisAge, 10) : diagnosisAge;
  const currentAgeNumber = typeof currentAge === 'string' ? parseInt(currentAge, 10) : currentAge;
  
  return !isNaN(diagnosisAgeNumber) && 
         diagnosisAgeNumber >= 0 && 
         diagnosisAgeNumber <= 120 && 
         diagnosisAgeNumber <= currentAgeNumber;
}

export function calculateBirthYear(age: number): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear - age}-01-01`;
}

export function getBreastCancerRisk(patientData: any) {
  // Count affected relatives
  const totalMaternalRelatives = patientData.familyHistory.maternalFamilyMembers.length;
  const totalPaternalRelatives = patientData.familyHistory.paternalFamilyMembers.length;
  const totalImmediateRelatives = patientData.familyHistory.immediate.length;
  
  // Determine total affected relatives with breast cancer
  const totalAffectedRelatives = totalMaternalRelatives + totalPaternalRelatives + totalImmediateRelatives;
  
  // Determine which side has more affected relatives
  let mostAffectedGroup: {relation: string, diagnosisAge: number}[] = [];
  if (totalMaternalRelatives > totalPaternalRelatives) {
    mostAffectedGroup = patientData.familyHistory.maternalFamilyMembers;
  } else {
    mostAffectedGroup = patientData.familyHistory.paternalFamilyMembers;
  }


  // Check for high-risk criteria based on the flowchart
  let isHighRisk = false;
  let highRiskReason = '';
  
  // Criteria 1: 1st degree relative with breast cancer diagnosed < 40 years (man or woman)
  const hasFirstDegreeUnder40 = patientData.familyHistory.immediate
  .some((member: any) => member.diagnosisAge < 40);
  
  if (hasFirstDegreeUnder40) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met borstkanker aangetoond op leeftijd < 40 jaar';
  }
  
 // Criteria 2: 1st degree or 2nd degree relative with genetich abnormality (BRCA1/2)
  const hasGeneticAbnormality = [...patientData.familyHistory.immediateGeneticTest, ...patientData.familyHistory.maternalGeneticTest, ...patientData.familyHistory.paternalGeneticTest]
    .some((member: any) => member.abnormality === 'BRCA1' || member.abnormality === 'BRCA2');
  
  if (hasGeneticAbnormality) {
    isHighRisk = true;
    highRiskReason = '1e of 2e graads verwante met genetische abnormaliteit (BRCA1/2)';
  }

  

// Criteria 3: 1st degree relative with both breast cancer and pancreatic cancer
// Check if any immediate family member has breast cancer and pancreatic cancer
patientData.familyHistory.immediate = patientData.familyHistory.immediate.map((member: any) => {
  // Extract the base relation by removing the prefix and suffix
  const baseRelation = member.relation.replace(/^immediate_/, '').replace(/_\d+$/, '');

  const hasPancreaticCancer = patientData.familyHistory.pancreaticCancer
    .some((pcMember: any) => {
      const pcBaseRelation = pcMember.relation.replace(/^immediate_/, '').replace(/_\d+$/, '');
      return pcBaseRelation === baseRelation;
    });

  return {
    ...member,
    hasPancreaticCancer,
  };
});
const hasFirstDegreeWithBCAndPC = patientData.familyHistory.immediate
  .some((member: any) => member.hasPancreaticCancer && member.hasBreastCancer);

if (hasFirstDegreeWithBCAndPC) {
  isHighRisk = true;
  highRiskReason = '1e graads verwante met BK en alvleesklierkanker';
}

  
 // Criteria 4: 1st degree relative with male breast cancer
 const hasFirstDegreeMaleWithBC = patientData.familyHistory.maleBreastCancer.length > 0;
  
 if (hasFirstDegreeMaleWithBC) {
   isHighRisk = true;
   highRiskReason = '1e graads mannelijk verwante met BK ongeacht de leeftijd en/of beide ouders';
 }
  
  // Criteria 5: 1st degree relative with breast cancer under 50 years and prostate cancer under 60 years (60years is already in checked in the questionnaire)
  const hasFirstDegreeWithBC = patientData.familyHistory.immediate
  .some((member: any) => member.hasBreastCancer && member.diagnosisAge < 50);

  const hasProstateCancer = patientData.familyHistory.prostateCancer.length > 0;;


  // Exclude the scenario where the father has prostate cancer and the mother has breast cancer under 50
  const isExcludedFatherProstateMotherBreastCancer =
  patientData.familyHistory.prostateCancer.some(
    (member: any) =>
      member.relation === "father" 
  ) &&
  patientData.familyHistory.immediate.some(
    (member: any) =>
      member.relation.replace(/^immediate_/, '').replace(/_\d+$/, '') === 'Moeder' &&
      member.hasBreastCancer &&
      member.diagnosisAge < 50
  );
  if (hasFirstDegreeWithBC && hasProstateCancer && !isExcludedFatherProstateMotherBreastCancer) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met BK onder 50 jaar en prostaatkanker onder 60 jaar (Aan dezelfde kant van de familie)';
  }

  //criteria 6: 1st degree relative with breast cancer under 50 years and pancreatic cancer under 60 years (60years is already in checked in the questionnaire)
  const hasBcAndPancreaticCancer = patientData.familyHistory.immediate
  .some((member: any) => member.hasBreastCancer && member.diagnosisAge < 50);

  const hasPancreaticCancer = patientData.familyHistory.pancreaticCancer.length > 0;

  // Exclude the scenario where the father has pancreatic cancer and the mother has breast cancer under 50
  const isExcludedFatherPancreaticMotherBreastCancer =
  patientData.familyHistory.pancreaticCancer.some(
    (member: any) =>
      member.relation === "Vader" 
  ) &&
  patientData.familyHistory.immediate.some(
    (member: any) =>
      member.relation.replace(/^immediate_/, '').replace(/_\d+$/, '') === 'Moeder' &&
      member.hasBreastCancer &&
      member.diagnosisAge < 50
  );

  if (hasBcAndPancreaticCancer && hasPancreaticCancer && !isExcludedFatherPancreaticMotherBreastCancer) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met BK onder 50 jaar en alvleesklierkanker onder 60 jaar (Aan dezelfde kant van de familie)';
  }


  // Criteria 7: 2 or more first-degree relatives with breast cancer under 50 years
  const firstDegreeUnder50Count = patientData.familyHistory.immediate
  .filter((member: any) => member.hasBreastCancer && member.diagnosisAge < 50).length;

  if (firstDegreeUnder50Count >= 2) {
    isHighRisk = true;
    highRiskReason = '2 of meer 1e graads verwante met BK onder 50 jaar';
  }

  // Criteria 8: 3 or more first-degree and second-degree relatives (second-degree relatives on the same side of the family) with breast cancer, with at least one diagnosed < 50 years
  const firstDegreeWithBCCount = patientData.familyHistory.immediate
  .filter((member: any) => member.hasBreastCancer).length;

  // if paternal side is higher, only use paternal family members. If maternal side is higher, only use maternal family members.
  const secondDegreeWithBCMembers = mostAffectedGroup.filter((member: any) => member.hasBreastCancer);
  const secondDegreeWithBCCount = mostAffectedGroup.length;

  const hasUnder50Diagnosis = [
    ...patientData.familyHistory.immediate,
    ...secondDegreeWithBCMembers,
  ].some((member: any) => member.hasBreastCancer && member.diagnosisAge < 50);

  if (firstDegreeWithBCCount + secondDegreeWithBCCount >= 3 && hasUnder50Diagnosis) {
    isHighRisk = true;
    highRiskReason = '3 of meer 1e of 2e graads verwante met BK, met minimaal 1 onder 50 jaar';
  }


  // YEARLY SCREENING CRITERIA
  // Yearly screening criteria (all these don't meet high risk but should be screened)
  let shouldYearlyScreen = false;
  let yearlyScreenReason = '';

  // Criteria 1: 1st degree relative with breast cancer twice and the first diagnosis age < 60 years
if (patientData.familyHistory.multipleBreastCancer.length > 0) {
  shouldYearlyScreen = true;
  yearlyScreenReason = '1e graads verwante met tweemaal borstkankerdiagnoses, waarvan ten minste 1 diagnose <60 jaar.';
}

// Criteria 2: 1st and 2nd degree relatives with breast cancer, with the average age of diagnosis < 50 years
// Combine maternal family members and immediate family members for maternal side
const maternalCombinedAges = [
  ...(patientData.familyHistory.maternalFamilyMembers.length > 0
    ? patientData.familyHistory.maternalFamilyMembers.map((m: any) => m.diagnosisAge)
    : []),
    ...(patientData.familyHistory.immediate.length > 0
      ? patientData.familyHistory.immediate.map((m: any) => m.diagnosisAge)
      : []),
];

// Combine paternal family members and immediate family members for paternal side
const paternalCombinedAges = [
  ...(patientData.familyHistory.paternalFamilyMembers.length > 0
    ? patientData.familyHistory.paternalFamilyMembers.map((m: any) => m.diagnosisAge)
    : []),
    ...(patientData.familyHistory.immediate.length > 0
      ? patientData.familyHistory.immediate.map((m: any) => m.diagnosisAge)
      : []),
];

// Calculate average diagnosis age for maternal side
const maternalImmediateDiagnosisAgesAverage =
  maternalCombinedAges.length > 0
    ? maternalCombinedAges.reduce((sum: number, age: number) => sum + age, 0) /
      maternalCombinedAges.length
    : 0;

// Calculate average diagnosis age for paternal side
const paternalImmediateDiagnosisAgesAverage =
  paternalCombinedAges.length > 0
    ? paternalCombinedAges.reduce((sum: number, age: number) => sum + age, 0) /
      paternalCombinedAges.length
    : 0;

// Check if either maternal or paternal average diagnosis age is below 50
if ((maternalImmediateDiagnosisAgesAverage < 50 && maternalCombinedAges.length > 1  || paternalImmediateDiagnosisAgesAverage < 50 && paternalCombinedAges.length > 1) && isHighRisk === false) {
  shouldYearlyScreen = true;
  yearlyScreenReason =
    "1e en 2e graads verwanten met borstkanker, met gemiddelde leeftijd diagnose < 50 jaar";
}

// 3 or more 1st or 2nd degree relatives with breast cancer, on the same side of the family
if (
  mostAffectedGroup.length >= 3 &&
  mostAffectedGroup.every((member: any) => member.hasBreastCancer) &&
  isHighRisk === false
) {
  shouldYearlyScreen = true;
  yearlyScreenReason =
    "3 of meer 1e of 2e graads verwante met borstkanker, aan dezelfde kant van de familie";
}
  
  // Determine risk level
  let riskLevel = 'Average';
  let riskColor = 'text-slate-700';
  let explanation = '';
  
  if (isHighRisk) {
    riskLevel = 'High';
    riskColor = 'text-red-500 font-semibold';
    explanation = `Op basis van de gegevens is doorverwijzing naar klinische genetica voor erfelijkheidsonderzoek geadviseerd. Reden: ${highRiskReason}`;
  } else if (shouldYearlyScreen) {
    riskLevel = 'Moderate';
    riskColor = 'text-amber-500 font-semibold';
    explanation = `Jaarlijkse screening buiten het BVO wordt geadviseerd. Reden: ${yearlyScreenReason}`;
    
  } else {
    riskLevel = 'Average';
    riskColor = 'text-green-500';
    explanation = `Screening via het BVO (bevolkingsonderzoek) wordt geadviseerd.`;
  }
  
  return {
    riskLevel,
    riskColor,
    explanation,
    mostAffectedGroup,
    totalAffectedRelatives,
  };
}

export function getRecommendations(riskLevel: string, age: number) {
  const recommendations = [];

  if (riskLevel === 'High') {
    recommendations.push('Verwijs naar klinische genetica voor erfelijkheidsonderzoek');
    // Voeg aanbevelingen toe op basis van leeftijd
    if (age >= 35 && age < 40) {
      recommendations.push('1 maal per 1,5 jaar MRI en contactmoment');
    } else if (age >= 40 && age < 50) {
      recommendations.push('Jaarlijks afwisselend MRI en mammografie of 1 maal per 1.5 jaar MRI en contactmoment');
    } else if (age >= 50 && age < 60) {
      recommendations.push('Jaarlijks afwisselend MRI en mammografie of 1 maal per 1.5 jaar MRI en contactmoment');
    } else if (age >= 60 && age < 75) {
      recommendations.push('1 maal per 2 jaar mammofgrafie binnen het bevolkingsonderzoek');
    } 
  } else if (riskLevel === 'Moderate') {
    recommendations.push('Screen jaarlijks buiten het BVO met mammogram van 40 tot 50 jaar via de huisarts');
    // Voeg aanbevelingen toe op basis van leeftijd
    if (age >= 40 && age < 50) {
      recommendations.push('Jaarlijks mammografie via huisarts');
    } else if (age >= 50 && age < 60) {
      recommendations.push('1 x per 2 jaar mammografie binnen het bevolkingsonderzoek');
    } else if (age >= 60 && age < 75) {
      recommendations.push('1 x per 2 jaar mammografie binnen het bevolkingsonderzoek');
    }
  } else {
    recommendations.push('Screen via het BVO (bevolkingsonderzoek)');
    recommendations.push('Verwijs niet naar klinische genetica');
  }

  return recommendations;
}
