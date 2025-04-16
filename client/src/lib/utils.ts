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
  const totalMaternalRelatives = patientData.familyHistory.maternal.length;
  const totalPaternalRelatives = patientData.familyHistory.paternal.length;
  const totalImmediateRelatives = patientData.familyHistory.immediate.length;
  const totalAffectedRelatives = totalMaternalRelatives + totalPaternalRelatives + totalImmediateRelatives;
  
  // Determine which side has more affected relatives
  const maternalImmediate = patientData.familyHistory.immediate.filter(
    (member: any) => member.relation === 'mother' || member.relation === 'sister' || member.relation === 'daughter'
  ).length;
  
  const paternalImmediate = patientData.familyHistory.immediate.filter(
    (member: any) => member.relation === 'father' || member.relation === 'brother' || member.relation === 'son'
  ).length;
  
  const maternalAffected = totalMaternalRelatives + maternalImmediate;
  const paternalAffected = totalPaternalRelatives + paternalImmediate;
  
  // Determine risk level
  let riskLevel = 'Average';
  let riskColor = 'text-slate-700';
  let explanation = '';
  
  if (totalAffectedRelatives >= 3) {
    riskLevel = 'High';
    riskColor = 'text-red-500 font-semibold';
    
    const dominantSide = maternalAffected > paternalAffected ? 'maternal' : 
                          paternalAffected > maternalAffected ? 'paternal' : 'both';
    
    switch (dominantSide) {
      case 'maternal':
        explanation = `You have a high risk of breast cancer because you have 3 or more affected relatives, with a stronger history on your mother's side. This pattern may suggest a hereditary component.`;
        break;
      case 'paternal':
        explanation = `You have a high risk of breast cancer because you have 3 or more affected relatives, with a stronger history on your father's side. This pattern may suggest a hereditary component.`;
        break;
      case 'both':
        explanation = `You have a high risk of breast cancer because you have 3 or more affected relatives, with a history on both sides of your family. This pattern may suggest a hereditary component.`;
        break;
    }
  } else if (totalAffectedRelatives === 2) {
    riskLevel = 'Moderate';
    riskColor = 'text-amber-500 font-semibold';
    explanation = `You have a moderate risk of breast cancer because you have 2 affected relatives in your family.`;
  } else if (totalAffectedRelatives === 1) {
    riskLevel = 'Slightly Elevated';
    riskColor = 'text-amber-400 font-semibold';
    explanation = `You have a slightly elevated risk of breast cancer because you have 1 affected relative in your family.`;
  } else if (patientData.personalInfo.hasBreastCancer) {
    riskLevel = 'Follow-up Care Needed';
    riskColor = 'text-primary font-semibold';
    explanation = `You have a personal history of breast cancer, which means you need appropriate follow-up care and surveillance.`;
  } else {
    explanation = `Based on the information provided, your family history does not suggest an elevated risk of breast cancer.`;
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
    recommendations.push('Overweeg genetische counseling en testen op BRCA1/BRCA2-mutaties');
    recommendations.push('Plan vaker klinische borstonderzoeken (elke 6-12 maanden)');
    recommendations.push('Begin eerder met jaarlijkse mammografie screening dan personen met gemiddeld risico');
    recommendations.push('Bespreek aanvullende screening met MRI met uw zorgverlener');
  } else if (riskLevel === 'Moderate') {
    recommendations.push('Overweeg genetische counseling om uw risico nauwkeuriger te evalueren');
    recommendations.push('Volg screeningsrichtlijnen die geschikt zijn voor personen met matig risico');
    recommendations.push('Bespreek de mogelijke voordelen van risicoverlagende medicatie met uw zorgverlener');
  } else if (riskLevel === 'Follow-up Care Needed') {
    recommendations.push('Ga door met uw aanbevolen nazorgplan');
    recommendations.push('Overweeg genetisch onderzoek als dit nog niet is gedaan');
    recommendations.push('Volg de richtlijnen voor kankertoezicht voor overlevenden van borstkanker');
  } else {
    recommendations.push('Volg de algemene screeningsrichtlijnen voor de bevolking');
    recommendations.push('Handhaaf een gezonde levensstijl met regelmatige lichaamsbeweging en een uitgebalanceerd dieet');
    recommendations.push('Wees bekend met hoe uw borsten er normaal uitzien en aanvoelen, en meld eventuele veranderingen aan uw zorgverlener');
  }
  
  return recommendations;
}
