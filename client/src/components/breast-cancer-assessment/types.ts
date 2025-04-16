export interface FamilyMember {
  relation: string;
  diagnosisAge: number;
}

export interface PersonalInfo {
  age: number;
  hasBreastCancer: boolean;
  diagnosisAge?: number;
}

export interface FamilyHistory {
  maternal: string[];
  paternal: string[];
  immediate: FamilyMember[];
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
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "sister", label: "Sister" },
  { value: "brother", label: "Brother" },
  { value: "daughter", label: "Daughter" },
  { value: "son", label: "Son" }
];

export const MATERNAL_RELATIVES = [
  { value: "maternal_grandmother", label: "Maternal Grandmother" },
  { value: "maternal_aunt", label: "Maternal Aunt" },
  { value: "maternal_cousin", label: "Maternal Cousin" },
  { value: "maternal_uncle", label: "Maternal Uncle" },
  { value: "other_maternal", label: "Other Maternal Relative" }
];

export const PATERNAL_RELATIVES = [
  { value: "paternal_grandmother", label: "Paternal Grandmother" },
  { value: "paternal_aunt", label: "Paternal Aunt" },
  { value: "paternal_cousin", label: "Paternal Cousin" },
  { value: "paternal_uncle", label: "Paternal Uncle" },
  { value: "other_paternal", label: "Other Paternal Relative" }
];
