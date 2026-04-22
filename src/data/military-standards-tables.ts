/**
 * AFMS HEIGHT-WEIGHT STANDARDS (2025)
 * Extracted from Command Directive: TEXT FILE.txt
 */

export interface WeightRange {
  min: number;
  max: number;
}

export interface HeightTableEntry {
  minHeight: number;
  maxHeight: number;
  weightByAge: {
    '15-17': WeightRange;
    '18-22': WeightRange;
    '22-27': WeightRange;
    '28-32': WeightRange;
  };
}

export const MALE_HEIGHT_WEIGHT_TABLE: HeightTableEntry[] = [
  {
    minHeight: 152, maxHeight: 158,
    weightByAge: {
      '15-17': { min: 46, max: 49 },
      '18-22': { min: 47, max: 50 },
      '22-27': { min: 50, max: 54 },
      '28-32': { min: 54, max: 58 }
    }
  },
  {
    minHeight: 159, maxHeight: 165,
    weightByAge: {
      '15-17': { min: 50, max: 53 },
      '18-22': { min: 51, max: 55 },
      '22-27': { min: 55, max: 59 },
      '28-32': { min: 59, max: 63 }
    }
  },
  {
    minHeight: 166, maxHeight: 171,
    weightByAge: {
      '15-17': { min: 54, max: 56 },
      '18-22': { min: 56, max: 59 },
      '22-27': { min: 60, max: 64 },
      '28-32': { min: 63, max: 66 }
    }
  },
  {
    minHeight: 172, maxHeight: 178,
    weightByAge: {
      '15-17': { min: 57, max: 60 },
      '18-22': { min: 59, max: 63 },
      '22-27': { min: 64, max: 69 },
      '28-32': { min: 67, max: 71 }
    }
  },
  {
    minHeight: 179, maxHeight: 183,
    weightByAge: {
      '15-17': { min: 61, max: 63 },
      '18-22': { min: 64, max: 66 },
      '22-27': { min: 69, max: 72 },
      '28-32': { min: 72, max: 74 }
    }
  },
  {
    minHeight: 184, maxHeight: 185,
    weightByAge: {
      '15-17': { min: 64, max: 64 },
      '18-22': { min: 67, max: 68 },
      '22-27': { min: 73, max: 74 },
      '28-32': { min: 75, max: 75 }
    }
  }
];

export const FEMALE_HEIGHT_WEIGHT_TABLE: any[] = [
  {
    minHeight: 148, maxHeight: 151,
    weightByAge: {
      '20-25': { min: 43, max: 45 },
      '26-30': { min: 46, max: 48 }
    }
  },
  {
    minHeight: 152, maxHeight: 155,
    weightByAge: {
      '20-25': { min: 46, max: 48 },
      '26-30': { min: 49, max: 51 }
    }
  },
  {
    minHeight: 156, maxHeight: 160,
    weightByAge: {
      '20-25': { min: 49, max: 51 },
      '26-30': { min: 52, max: 55 }
    }
  },
  {
    minHeight: 161, maxHeight: 165,
    weightByAge: {
      '20-25': { min: 52, max: 54 },
      '26-30': { min: 55, max: 58 }
    }
  },
  {
    minHeight: 166, maxHeight: 171,
    weightByAge: {
      '20-25': { min: 55, max: 58 },
      '26-30': { min: 59, max: 62 }
    }
  },
  {
    minHeight: 172, maxHeight: 176,
    weightByAge: {
      '20-25': { min: 59, max: 61 },
      '26-30': { min: 63, max: 66 }
    }
  },
  {
    minHeight: 177, maxHeight: 178,
    weightByAge: {
      '20-25': { min: 62, max: 63 },
      '26-30': { min: 64, max: 66 } // Estimate based on trend
    }
  }
];

export const MAJOR_REJECTION_CAUSES = [
  { id: 'CV_DEFECT', name: 'Defective Color Vision', type: 'PR', system: 'Eye' },
  { id: 'EAR_PERF', name: 'Ear Perforation', type: 'TR/PR', system: 'ENT' },
  { id: 'TACHYCARDIA', name: 'Tachycardia', type: 'TR', system: 'Cardiac' },
  { id: 'HYPERTENSION', name: 'Hypertension', type: 'TR/PR', system: 'Cardiac' },
  { id: 'TREMORS', name: 'Tremors of Hands', type: 'PR', system: 'CNS' },
  { id: 'HYPERHIDROSIS', name: 'Sweaty Palms', type: 'PR', system: 'Skin' },
  { id: 'KNOCK_KNEE', name: 'Knock Knee', type: 'PR', system: 'Orthopaedic' },
  { id: 'FLAT_FOOT', name: 'Flat Foot', type: 'PR', system: 'Orthopaedic' },
  { id: 'OVERWEIGHT', name: 'Overweight', type: 'TR', system: 'Anthropometric' },
  { id: 'SPINAL_DEF', name: 'Spinal Deformities', type: 'PR', system: 'Orthopaedic' },
  { id: 'LS_SPINE', name: 'LS-Spine Anomalies (LSTB)', type: 'PR', system: 'Orthopaedic' },
  { id: 'MYOPIA', name: 'Significant Myopia', type: 'PR', system: 'Eye' },
  { id: 'DNS', name: 'Deviated Nasal Septum', type: 'TR', system: 'ENT' },
  { id: 'THALASSEMIA', name: 'Beta-Thalassemia Trait', type: 'PR', system: 'Blood' },
  { id: 'PCOS', name: 'PCOS / Hormonal Anomalies', type: 'TR', system: 'Gyno' },
];

export const MANDATORY_CLINICAL_TESTS = [
  { test: 'X-Ray Chest PA View', purpose: 'Lungs/Heart integrity' },
  { test: 'USG Abdomen & Pelvis', purpose: 'Kidney/Liver/Stones' },
  { test: 'Complete Hemogram', purpose: 'Blood abnormalities' },
  { test: 'Urine RE/ME', purpose: 'Mineral levels/Infection' },
  { test: 'ECG', purpose: 'Heart rhythm' },
  { test: 'EEG', purpose: 'Brain activity (Air Force)' },
  { test: 'X-Ray LS Spine', purpose: 'Spinal integrity (LSTB)' },
  { test: 'USG (Pelvis/Abd)', purpose: 'Gyno/Internal anomalies' },
  { test: 'Hb Analysis (HPLC)', purpose: 'Beta-Thalassemia screening' },
];
