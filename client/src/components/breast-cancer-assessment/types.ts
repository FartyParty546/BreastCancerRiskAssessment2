export interface FamilyMember {
  relation: string;
  diagnosisAge: number;
}

export interface PersonalInfo {
  age: number;
  hasBreastCancer: boolean;
  diagnosisAge?: number;
  hadGeneticTest: boolean;
  familyHadGeneticTest: boolean;
}

export interface GeneticTestMember {
  relation: string;
  abnormality: string; // "BRCA1" | "BRCA2" | "none" | "unknown"
}

export interface OvarianCancerMember {
  relation: string;
}

export interface BreastCancerMaleMember {
  relation: string;
}

export interface FamilyHistory {
  maternal: string[];
  paternal: string[];
  immediate: FamilyMember[];
  immediateGeneticTest: GeneticTestMember[];
  paternalGeneticTest: GeneticTestMember[];
  maternalGeneticTest: GeneticTestMember[];
  ovarianCancer: OvarianCancerMember[];
  maleBreastCancer: BreastCancerMaleMember[];
  hasBreastCancerInFamily: boolean;
}

export interface AssessmentFormData {
  personalInfo: PersonalInfo;
  hasFamilyHistory: boolean;
  familyHistory: FamilyHistory;
}

export interface AssessmentResults {
  riskLevel: string;
  riskColor: string;
  explanation: string;
  maternalAffected: number;
  paternalAffected: number;
  totalAffectedRelatives: number;
}

export const FAMILY_MEMBERS = [
  { value: "mother", label: "Moeder" },
  { value: "father", label: "Vader" },
  { value: "sister", label: "Zus" },
  { value: "brother", label: "Broer" },
  { value: "daughter", label: "Dochter" },
  { value: "son", label: "Zoon" },
  { value: "none", label: "Niemand" }
];

export const MATERNAL_RELATIVES = [
  { value: "maternal_grandmother", label: "Oma (moederskant)" },
  { value: "maternal_grandfather", label: "Opa (moederskant)" },
  { value: "maternal_aunt", label: "Tante (moederskant)" },
  { value: "maternal_uncle", label: "Oom (moederskant)" },
  { value: "maternal_half_sister", label: "Halfzus (moederskant)" },
  { value: "maternal_half_brother", label: "Halfbroer (moederskant)" },
  { value: "none", label: "Niemand" }
];

export const PATERNAL_RELATIVES = [
  { value: "paternal_grandmother", label: "Oma (vaderskant)" },
  { value: "paternal_grandfather", label: "Opa (vaderskant)" },
  { value: "paternal_aunt", label: "Tante (vaderskant)" },
  { value: "paternal_uncle", label: "Oom (vaderskant)" },
  { value: "paternal_half_sister", label: "Halfzus (vaderskant)" },
  { value: "paternal_half_brother", label: "Halfbroer (vaderskant)" },
  { value: "none", label: "Niemand" }
];

export const GENETIC_ABNORMALITY_OPTIONS = [
  { value: "BRCA1", label: "BRCA1" },
  { value: "BRCA2", label: "BRCA2" },
  { value: "none", label: "Geen afwijking" },
  { value: "unknown", label: "Onbekend" }
];

export const FEMALE_MEMBERS_OVARIAN = [
  { value: "mother", label: "Moeder" },
  { value: "sister", label: "Zus" },
  { value: "daughter", label: "Dochter" },
  { value: "none", label: "Niemand" }
];

export const MALE_MEMBERS_BREAST = [
  { value: "father", label: "Vader" },
  { value: "brother", label: "Broer" },
  { value: "son", label: "Zoon" },
  { value: "none", label: "Niemand" }
];
