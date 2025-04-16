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
  const maternalAffected = totalMaternalRelatives;
  const paternalAffected = totalPaternalRelatives;
  
  // Check for high-risk criteria based on the flowchart
  let isHighRisk = false;
  let highRiskReason = '';
  
  // Criteria 1: 1st degree relative with breast cancer diagnosed < 40 years (man or woman)
  const hasFirstDegreeUnder40 = [...patientData.familyHistory.immediate, ...patientData.familyHistory.maternalFamilyMembers, ...patientData.familyHistory.paternalFamilyMembers]
    .some((member: any) => member.diagnosisAge < 40);
  
  if (hasFirstDegreeUnder40) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met borstkanker aangetoond op leeftijd < 40 jaar';
  }
  
  // Criteria 2: 1st degree relative with bilateral breast cancer first tumor < 50 years
  const hasFirstDegreeBilateralUnder50 = [...patientData.familyHistory.immediate, ...patientData.familyHistory.maternalFamilyMembers, ...patientData.familyHistory.paternalFamilyMembers]
    .some((member: any) => patientData.familyHistory.multipleBreastCancer
      .some((multi: any) => multi.relation === member.relation && multi.firstDiagnosisAge < 50));
  
  if (hasFirstDegreeBilateralUnder50) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met bilaterale BK met eerste tumor < 50 jaar';
  }
  
  // Criteria 3: 1st degree relative with multiple primary tumors in 1 breast, with first tumor < 50 years
  const hasFirstDegreeMultipleTumorsUnder50 = patientData.familyHistory.multipleBreastCancer
    .some((member: any) => member.firstDiagnosisAge < 50);
  
  if (hasFirstDegreeMultipleTumorsUnder50) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met triple negatieve BK < 60 jaar';
  }
  
  // Criteria 4: 2 first-degree relatives or 1 first-degree + 1 second-degree, one diagnosed < 50 years
  // Count all first-degree relatives
  const firstDegreeWithBC = patientData.familyHistory.immediate.length;
  
  // Count second-degree relatives (assuming maternal and paternal family members are second-degree)
  const secondDegreeWithBC = patientData.familyHistory.maternalFamilyMembers.length + 
                           patientData.familyHistory.paternalFamilyMembers.length;
  
  // Check if any member diagnosed under 50
  const anyMemberUnder50 = [...patientData.familyHistory.immediate, 
                           ...patientData.familyHistory.maternalFamilyMembers, 
                           ...patientData.familyHistory.paternalFamilyMembers]
                           .some((member: any) => member.diagnosisAge < 50);
  
  if ((firstDegreeWithBC >= 2 || (firstDegreeWithBC >= 1 && secondDegreeWithBC >= 1)) && anyMemberUnder50) {
    isHighRisk = true;
    highRiskReason = '2 eerste graads verwanten met BK of 1 eerste graads verwant met BK + 1 tweede graads verwant met BK, waarvan ten minste 1 diagnose < 50 jaar';
  }
  
  // Criteria 5: 3 or more first or second-degree relatives with breast cancer
  if (firstDegreeWithBC + secondDegreeWithBC >= 3) {
    isHighRisk = true;
    highRiskReason = '3 of meer 1e of 2e graads verwanten met BK';
  }
  
  // Criteria 6: 1st degree relative with breast cancer and ovarian cancer
  const hasFirstDegreeWithBCAndOC = patientData.familyHistory.immediate
    .some((member: any) => {
      const relation = member.relation;
      return patientData.familyHistory.ovarianCancer.some((oc: any) => oc.relation === relation);
    });
  
  if (hasFirstDegreeWithBCAndOC) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met BK en OC';
  }
  
  // Criteria 7: 2 or more second-degree relatives with breast cancer, one diagnosed < 50 years
  const secondDegreeUnder50 = [...patientData.familyHistory.maternalFamilyMembers, ...patientData.familyHistory.paternalFamilyMembers]
    .some((member: any) => member.diagnosisAge < 50);
  
  if (secondDegreeWithBC >= 2 && secondDegreeUnder50) {
    isHighRisk = true;
    highRiskReason = '2 of meer 2e graads verwanten met BK, waarvan ten minste 1 diagnose < 50 jaar';
  }
  
  // Criteria 8: 1st degree relative with male breast cancer
  const hasFirstDegreeMaleWithBC = patientData.familyHistory.maleBreastCancer.length > 0;
  
  if (hasFirstDegreeMaleWithBC) {
    isHighRisk = true;
    highRiskReason = '1e graads verwante met BK ongeacht de leeftijd en/of beide ouders';
  }
  
  // Criteria 9: Personal history of breast cancer/OC/PDAC
  if (patientData.personalInfo.hasBreastCancer) {
    isHighRisk = true;
    highRiskReason = 'Patiënt heeft zelf borstkanker gehad';
  }
  
  // Yearly screening criteria (all these don't meet high risk but should be screened)
  let shouldYearlyScreen = false;
  let yearlyScreenReason = '';
  
  // Criteria 1: 1st degree relative with breast cancer diagnosed when older than 50 years
  const hasFirstDegreeOver50 = [...patientData.familyHistory.immediate, ...patientData.familyHistory.maternalFamilyMembers, ...patientData.familyHistory.paternalFamilyMembers]
    .some((member: any) => member.diagnosisAge >= 50);
  
  if (hasFirstDegreeOver50) {
    shouldYearlyScreen = true;
    yearlyScreenReason = '1e graads verwante met BK met leeftijd eerste diagnose > 50 jaar';
  }
  
  // Criteria 2: 2 first or second-degree relatives with breast cancer from the same side of the family with average diagnosis age < 50 years
  const maternalDiagnosisAges = patientData.familyHistory.maternalFamilyMembers.map((m: any) => m.diagnosisAge);
  const paternalDiagnosisAges = patientData.familyHistory.paternalFamilyMembers.map((m: any) => m.diagnosisAge);
  
  // Calculate average diagnosis age for maternal side
  const maternalAverageAge = maternalDiagnosisAges.length > 0 
    ? maternalDiagnosisAges.reduce((sum: number, age: number) => sum + age, 0) / maternalDiagnosisAges.length
    : 0;
  
  // Calculate average diagnosis age for paternal side
  const paternalAverageAge = paternalDiagnosisAges.length > 0
    ? paternalDiagnosisAges.reduce((sum: number, age: number) => sum + age, 0) / paternalDiagnosisAges.length
    : 0;
    
  // Check if there are at least 2 relatives on the same side with average age < 50
  const maternalCriteriaMet = patientData.familyHistory.maternalFamilyMembers.length >= 2 && maternalAverageAge < 50;
  const paternalCriteriaMet = patientData.familyHistory.paternalFamilyMembers.length >= 2 && paternalAverageAge < 50;
  
  if (maternalCriteriaMet || paternalCriteriaMet) {
    shouldYearlyScreen = true;
    yearlyScreenReason = '2 eerste/tweede graads verwanten met BK aan dezelfde kant van de familie met gemiddelde leeftijd diagnose < 50 jaar';
  }
  
  // Criteria 3: 3 or more first or second-degree relatives with breast cancer at the same side of the family
  if (patientData.familyHistory.maternalFamilyMembers.length >= 3 || patientData.familyHistory.paternalFamilyMembers.length >= 3) {
    shouldYearlyScreen = true;
    yearlyScreenReason = '3 of meer 1e of 2e graads verwanten met BK, aan zelfde kant van de familie';
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
    maternalAffected,
    paternalAffected,
    totalAffectedRelatives
  };
}

export function getRecommendations(riskLevel: string) {
  const recommendations = [];
  
  if (riskLevel === 'High') {
    recommendations.push('Verwijs naar klinische genetica voor erfelijkheidsonderzoek');
    recommendations.push('Er is een sterke voorspeller om het familiaal risico met BK, OC/TC, PDAC of PC te verwijzen, omdat de DNA-afwijking bij haar/hem zal starten');
  } else if (riskLevel === 'Moderate') {
    recommendations.push('Screen jaarlijks buiten het BVO met mammogram van 40 tot 50 jaar via de huisarts');
    recommendations.push('Verwijs niet naar klinische genetica');
  } else {
    recommendations.push('Screen via het BVO (bevolkingsonderzoek)');
    recommendations.push('Verwijs niet naar klinische genetica');
  }
  
  return recommendations;
}
