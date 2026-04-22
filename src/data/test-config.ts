/**
 * CADET PROTOCOL — Test Configuration Registry
 * Maps all AFMS medical parameters to testable/non-testable categories.
 * Derived from medical-standards.ts data structures.
 */

import { Eye, Ear, Bone, Ruler, Weight, Heart, Activity, HandMetal, Footprints, Stethoscope, Scan, Syringe, Brain, MonitorCheck, FileX2 } from 'lucide-react';

export type TestStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type TestCategory = 'SELF_TEST' | 'CLINICAL_REFERRAL';
export type TestMethod = 'CAMERA_POSE' | 'CAMERA_CAPTURE' | 'SCREEN_INTERACTIVE' | 'AUDIO' | 'MANUAL_INPUT' | 'SELF_ASSESSMENT' | 'CLINICAL';

export interface TestConfig {
  id: string;
  name: string;
  shortName: string;
  category: TestCategory;
  method: TestMethod;
  icon: any;
  description: string;
  duration: string; // estimated time
  instructions: string;
  /** Which field in medical-standards.ts this maps to */
  standardsRef: string;
  /** For clinical referrals: which department to visit */
  referralDept?: string;
}

// ─────────────────────────────────────────────────────────────────
// TIER 1: SELF-TESTABLE PARAMETERS
// ─────────────────────────────────────────────────────────────────

export const SELF_TESTS: TestConfig[] = [
  {
    id: 'COLOUR_VISION',
    name: 'Colour Vision (CP-Matrix)',
    shortName: 'Colour Vision',
    category: 'SELF_TEST',
    method: 'SCREEN_INTERACTIVE',
    icon: Eye,
    description: 'Ishihara plate test for colour perception classification (CP-I/II/III).',
    duration: '3 min',
    instructions: 'Ensure good lighting. You will be shown colour plates and asked to identify the number.',
    standardsRef: 'ophthalmological.colourVision',
  },
  {
    id: 'VISION_ACUITY',
    name: 'Vision Acuity (Snellen)',
    shortName: 'Vision',
    category: 'SELF_TEST',
    method: 'SCREEN_INTERACTIVE',
    icon: Eye,
    description: 'Screen-based Snellen chart test. Tests each eye separately at calibrated distance.',
    duration: '5 min',
    instructions: 'Sit 3 metres from screen. Test each eye separately by covering the other.',
    standardsRef: 'ophthalmological.visualAcuity',
  },
  {
    id: 'CARRY_ANGLE',
    name: 'Carrying Angle Assessment',
    shortName: 'Carry Angle',
    category: 'SELF_TEST',
    method: 'CAMERA_POSE',
    icon: Bone,
    description: 'AI-powered elbow carrying angle measurement using camera pose estimation.',
    duration: '2 min',
    instructions: 'Stand 2m from camera. Arms fully extended at sides, palms forward. Face camera directly.',
    standardsRef: 'orthopaedic.carryAngle',
  },
  {
    id: 'KNOCK_KNEE',
    name: 'Knock Knee / Bow Legs',
    shortName: 'Knee Alignment',
    category: 'SELF_TEST',
    method: 'CAMERA_POSE',
    icon: Bone,
    description: 'AI assessment of knee valgum (knock knee) and varum (bow legs) via leg alignment analysis.',
    duration: '2 min',
    instructions: 'Stand facing camera, feet together, legs straight. Full body must be visible.',
    standardsRef: 'orthopaedic.genuValgum / genuVarum',
  },
  {
    id: 'FLAT_FOOT',
    name: 'Flat Foot Assessment',
    shortName: 'Flat Foot',
    category: 'SELF_TEST',
    method: 'SELF_ASSESSMENT',
    icon: Footprints,
    description: 'Guided wet footprint test for pes planus (flat foot) grading.',
    duration: '3 min',
    instructions: 'Wet your foot, step on dark paper, photograph the footprint. Grade using reference images.',
    standardsRef: 'orthopaedic.flatFoot',
  },
  {
    id: 'HEARING',
    name: 'Hearing Assessment (Audiometry)',
    shortName: 'Hearing',
    category: 'SELF_TEST',
    method: 'AUDIO',
    icon: Ear,
    description: 'Pure tone audiometry at 500Hz–4kHz. Tests each ear separately.',
    duration: '5 min',
    instructions: 'Use headphones in a quiet room. You will hear tones and indicate when you can hear them.',
    standardsRef: 'audiological.pureToneAudiometry',
  },
  {
    id: 'ANTHROPOMETRIC',
    name: 'Height / Weight / BMI / Chest',
    shortName: 'Body Metrics',
    category: 'SELF_TEST',
    method: 'MANUAL_INPUT',
    icon: Ruler,
    description: 'Manual input of height, weight, and chest measurements. Auto-calculates BMI and validates against AFMS tables.',
    duration: '2 min',
    instructions: 'Use a measuring tape and weighing scale. Chest: measure relaxed, then fully expanded.',
    standardsRef: 'anthropometric',
  },
  {
    id: 'TREMOR',
    name: 'Hand Tremor Detection',
    shortName: 'Tremor',
    category: 'SELF_TEST',
    method: 'SCREEN_INTERACTIVE',
    icon: HandMetal,
    description: 'Touch-point stability test to screen for hand tremors.',
    duration: '1 min',
    instructions: 'Place your finger on the target circle and hold steady for 10 seconds.',
    standardsRef: 'general.dermatological (tremors)',
  },
  {
    id: 'SELF_REPORT',
    name: 'Self-Assessment Checklist',
    shortName: 'Self Report',
    category: 'SELF_TEST',
    method: 'SELF_ASSESSMENT',
    icon: Stethoscope,
    description: 'Self-report for conditions: sweaty palms, varicose veins, skin conditions, stammering.',
    duration: '2 min',
    instructions: 'Answer honestly. This flags conditions for professional verification.',
    standardsRef: 'general.dermatological / cardio.vascular',
  },
];

// ─────────────────────────────────────────────────────────────────
// TIER 2: CLINICAL REFERRAL PARAMETERS
// ─────────────────────────────────────────────────────────────────

export const CLINICAL_REFERRALS: TestConfig[] = [
  {
    id: 'XRAY_CHEST',
    name: 'X-Ray Chest PA View',
    shortName: 'Chest X-Ray',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Scan,
    description: 'Mandatory radiological evaluation for lung/heart integrity.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Radiology department.',
    standardsRef: 'respiratory',
    referralDept: 'Radiology',
  },
  {
    id: 'XRAY_LS_SPINE',
    name: 'X-Ray LS Spine',
    shortName: 'Spine X-Ray',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Scan,
    description: 'Lumbosacral spine X-Ray to check for LSTB / spinal deformities.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Radiology department.',
    standardsRef: 'orthopaedic.scoliosis',
    referralDept: 'Radiology / Orthopaedics',
  },
  {
    id: 'USG',
    name: 'USG Abdomen & Pelvis',
    shortName: 'USG',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: MonitorCheck,
    description: 'Ultrasound for kidney, liver, stones, and gynaecological anomalies.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Radiology department.',
    standardsRef: 'general',
    referralDept: 'Radiology',
  },
  {
    id: 'ECG_EEG',
    name: 'ECG / EEG',
    shortName: 'ECG/EEG',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Activity,
    description: 'Electrocardiogram (heart rhythm) and EEG (brain activity, Air Force mandatory).',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Cardiology / Neurology department.',
    standardsRef: 'cardio.ecg',
    referralDept: 'Cardiology / Neurology',
  },
  {
    id: 'BLOOD_TESTS',
    name: 'Blood Work (Hemogram / HPLC)',
    shortName: 'Blood Tests',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Syringe,
    description: 'Complete hemogram, Hb analysis (HPLC) for thalassemia screening, and metabolic panel.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Pathology department. Fasting may be required.',
    standardsRef: 'general.metabolic',
    referralDept: 'Pathology',
  },
  {
    id: 'URINE',
    name: 'Urine RE/ME',
    shortName: 'Urine Test',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Syringe,
    description: 'Urine routine and microscopy for mineral levels, infection markers.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital Pathology department.',
    standardsRef: 'general',
    referralDept: 'Pathology',
  },
  {
    id: 'ENT_SURGICAL',
    name: 'ENT Specialist Evaluation',
    shortName: 'ENT',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Ear,
    description: 'Deviated nasal septum (DNS), ear perforation, tympanic membrane pathology.',
    duration: 'Clinical',
    instructions: 'Visit nearest Command Hospital ENT department.',
    standardsRef: 'audiological.tympanicPathologyPermitted',
    referralDept: 'ENT',
  },
  {
    id: 'BP_CLINICAL',
    name: 'Blood Pressure (Clinical)',
    shortName: 'BP',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Heart,
    description: 'Calibrated sphygmomanometer BP reading on multiple occasions.',
    duration: 'Clinical',
    instructions: 'Visit any clinic with a calibrated BP monitor. Get readings on 3 separate occasions.',
    standardsRef: 'cardio.bloodPressure',
    referralDept: 'General Medicine',
  },
  {
    id: 'REFRACTION',
    name: 'Refraction (Autorefractor)',
    shortName: 'Refraction',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Eye,
    description: 'Precise myopia/hypermetropia measurement via autorefractor.',
    duration: 'Clinical',
    instructions: 'Visit any ophthalmologist or Command Hospital Eye department.',
    standardsRef: 'ophthalmological.refractiveLimits',
    referralDept: 'Ophthalmology',
  },
  {
    id: 'PSYCHIATRIC',
    name: 'Psychiatric Evaluation',
    shortName: 'Psych',
    category: 'CLINICAL_REFERRAL',
    method: 'CLINICAL',
    icon: Brain,
    description: 'Professional psychiatric assessment if flagged.',
    duration: 'Clinical',
    instructions: 'Referral only if self-report flags concerns.',
    standardsRef: 'general.psychiatric',
    referralDept: 'Psychiatry',
  },
];

export const ALL_TESTS = [...SELF_TESTS, ...CLINICAL_REFERRALS];
