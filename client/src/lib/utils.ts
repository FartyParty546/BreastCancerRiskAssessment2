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
    recommendations.push('Consider genetic counseling and testing for BRCA1/BRCA2 mutations');
    recommendations.push('Schedule more frequent clinical breast exams (every 6-12 months)');
    recommendations.push('Begin annual mammography screening earlier than average risk individuals');
    recommendations.push('Discuss additional screening with MRI with your healthcare provider');
  } else if (riskLevel === 'Moderate') {
    recommendations.push('Consider genetic counseling to evaluate your risk more precisely');
    recommendations.push('Follow screening guidelines appropriate for moderate risk individuals');
    recommendations.push('Discuss the potential benefits of risk-reducing medications with your healthcare provider');
  } else if (riskLevel === 'Follow-up Care Needed') {
    recommendations.push('Continue with your recommended follow-up care plan');
    recommendations.push('Consider genetic testing if not already done');
    recommendations.push('Follow cancer surveillance guidelines for breast cancer survivors');
  } else {
    recommendations.push('Follow general population screening guidelines');
    recommendations.push('Maintain a healthy lifestyle with regular exercise and balanced diet');
    recommendations.push('Be familiar with how your breasts normally look and feel, and report any changes to your healthcare provider');
  }
  
  return recommendations;
}
