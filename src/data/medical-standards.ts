/**
 * CADET PROTOCOL | ALPHA INTELLIGENCE UNIT
 * INDIAN ARMED FORCES MEDICAL & PHYSICAL FITNESS STANDARDS (2025)
 * CLASSIFICATION: RESTRICTED
 * 
 * COMPREHENSIVE INTELLIGENCE INJECTION: Includes Anthropometric, Ophthalmological,
 * Orthopaedic, Audiological, Cardiovascular, General Medical, and Psychological (15 OLQs) metrics
 * strictly aligned to the CADET_PROTOCOL_MedicalStandards_Report_2025.
 */

import { MALE_HEIGHT_WEIGHT_TABLE, FEMALE_HEIGHT_WEIGHT_TABLE } from "./military-standards-tables";

export type ServiceBranch = 'Army_Combat' | 'Army_Other' | 'Navy_General' | 'Navy_Pilot' | 'AirForce_Flying' | 'AirForce_Ground';
export type Gender = 'Male' | 'Female';
export type FitStatus = 'FIT' | 'UNFIT' | 'BORDERLINE' | 'SCAN_INCOMPLETE' | 'MANUAL_REVIEW' | 'TR' | 'PR';

// ----------------------------------------------------------------------------------
// INTERFACE ARCHITECTURE
// ----------------------------------------------------------------------------------

export interface AnthropometricStandards {
  minHeightCm: number;
  heightRelaxationHillyCm: number | null; // For Gorkha/hill candidates
  maxSittingHeightCm?: number; // Flying branch specific
  minSittingHeightCm?: number; // Flying branch specific
  chestExpansionMinCm: number;
  chestNormalMinCm: number;
  bmiRangeAllowed: { min: number; max: number };
  bmiCalculationMethod: 'DirectFormula' | 'HeightWeightTable' | 'Composite';
  overweightTolerancePercentage: number; // e.g., 20% over table
}

export interface OphthalmologicalStandards {
  visualAcuity: {
    betterEyeUncorrected: string; // e.g., '6/6'
    worseEyeUncorrected: string;  // e.g., '6/18'
    correctedAcceptable: boolean;
    correctionDetails: string;    // e.g., '6/6 with glasses'
  };
  refractiveLimits: {
    maxMyopiaD: number;
    maxHypermetropiaD: number;
    astigmatismAllowed: boolean;
  };
  colourVision: {
    minimumStandard: 'CP-I' | 'CP-II' | 'CP-III';
    testingMethod: 'Martin Lantern' | 'Ishihara' | 'Both';
    colourBlindnessPermitted: boolean;
  };
  lasikPolicy: {
    permitted: boolean;
    minMonthsPostOp: number;
    minAgeAtSurgery: number;
    maxMyopiaPreOpD: number;
    requiresStableRefraction: boolean;
  };
}

export interface OrthopaedicStandards {
  carryAngle: {
    maxDegrees: number;
    strictEnforcement: boolean;
    measurementMethod: 'Goniometer' | 'Visual' | 'CV_Angle_Arc';
  };
  genuValgum: {
    maxInterMalleolarDistanceCm: number;
    maxValgusAngleDegrees: number | null; 
    rejectionTrigger: string;
  };
  genuVarum: {
    maxInterCondylarDistanceCm: number;
    rejectionTrigger: string;
  };
  flatFoot: {
    acceptedGrades: ('Grade 1' | 'Grade 2' | 'Grade 3')[];
    rigidPesPlanusPermitted: boolean;
  };
  scoliosis: {
    maxCobbAngleDegrees: number;
  };
}

export interface AudiologicalStandards {
  pureToneAudiometry: {
    maxDbHL: number;
    frequencyRangeHz: { min: number; max: number };
    speechRangeMaxDbHL: number;
  };
  whisperTest: {
    required: boolean;
  };
  tympanicPathologyPermitted: boolean;
  hearingAidsPermitted: boolean;
}

export interface CardiovascularStandards {
  bloodPressure: {
    systolicRange: { min: number; max: number };
    diastolicRange: { min: number; max: number };
    mustBeNormalOnMultipleReadings: boolean;
  };
  restingHeartRate: {
    bpmRange: { min: number; max: number };
    athleticBradycardiaReviewed: boolean;
  };
  ecg: {
    required: boolean;
    exerciseStressTestMandatory: boolean;
    normalSinusRhythmRequired: boolean;
  };
  vascular: {
    varicoseVeinsAcceptedGrades: ('Grade I' | 'Grade II' | 'Grade III' | 'None')[];
  };
}

export interface GeneralMedicalStandards {
  hernia: {
    inguinalReducedAsymptomaticPermitted: boolean;
    tCatApplied: boolean;
  };
  metabolic: {
    diabetesPermitted: boolean;
    preDiabetesReviewedCaseByCase: boolean;
  };
  psychiatric: {
    axisIDisordersPermitted: boolean;
    psychologicalBatteryRequired: boolean;
  };
  dermatological: {
    hyperhidrosisSweatyPalmsPermitted: boolean;
    extensivePsoriasisPermitted: boolean;
  };
  respiratory: {
    covid19Sequelae: {
      pftMandatoryIfHxPositive: boolean;
      requiredPulmonaryFunctionPercent: number;
    };
  };
}

export interface SSBPsychologicalAssessment {
  durationDays: number;
  tests: {
    OIR: { name: string; assesses: string; durationHrs: number };
    PPDT: { name: string; assesses: string; durationMins: number };
    TAT: { name: string; assesses: string; format: string; durationMins: number };
    WAT: { name: string; assesses: string; format: string; durationMins: number };
    SRT: { name: string; assesses: string; format: string; durationMins: number };
    SD: { name: string; assesses: string; durationMins: number };
  };
}

export interface AFMSBranchProtocol {
  branchName: string;
  entrySchemes: string[];
  anthropometric: AnthropometricStandards;
  ophthalmological: OphthalmologicalStandards;
  orthopaedic: OrthopaedicStandards;
  audiological: AudiologicalStandards;
  cardio: CardiovascularStandards;
  general: GeneralMedicalStandards;
}

// ----------------------------------------------------------------------------------
// THE 15 OFFICER LIKE QUALITIES (OLQs) - SEC 07B
// ----------------------------------------------------------------------------------

export const MILITARY_OLQs = [
  { id: 1, name: 'Effective Intelligence', category: 'Factor I: Planning & Organising', focus: 'Practical problem-solving ability in novel situations' },
  { id: 2, name: 'Reasoning Ability', category: 'Factor I: Planning & Organising', focus: 'Logical deduction; cause-effect analysis' },
  { id: 3, name: 'Organising Ability', category: 'Factor I: Planning & Organising', focus: 'Planning, sequencing, resource allocation' },
  { id: 4, name: 'Power of Expression', category: 'Factor I: Planning & Organising', focus: 'Clarity of verbal and written communication' },
  { id: 5, name: 'Social Adaptability', category: 'Factor II: Social Adjustment', focus: 'Ease of functioning in diverse social environments' },
  { id: 6, name: 'Cooperation', category: 'Factor II: Social Adjustment', focus: 'Team orientation; working within group structures' },
  { id: 7, name: 'Sense of Responsibility', category: 'Factor II: Social Adjustment', focus: 'Accountability; reliability in role fulfilment' },
  { id: 8, name: 'Initiative', category: 'Factor III: Social Effectiveness', focus: 'Self-starting behaviour; proactive action without prompting' },
  { id: 9, name: 'Self Confidence', category: 'Factor III: Social Effectiveness', focus: 'Assurance in one\'s judgement; composure under pressure' },
  { id: 10, name: 'Speed of Decision', category: 'Factor III: Social Effectiveness', focus: 'Decisiveness; quality of fast decisions' },
  { id: 11, name: 'Ability to Influence the Group', category: 'Factor III: Social Effectiveness', focus: 'Persuasion and inspirational leadership' },
  { id: 12, name: 'Liveliness', category: 'Factor III: Social Effectiveness', focus: 'Energy levels; enthusiasm; dynamism' },
  { id: 13, name: 'Determination', category: 'Factor IV: Dynamic', focus: 'Persistence; goal pursuit under adversity' },
  { id: 14, name: 'Courage', category: 'Factor IV: Dynamic', focus: 'Physical and moral courage in adversity' },
  { id: 15, name: 'Stamina', category: 'Factor IV: Dynamic', focus: 'Mental and physical endurance over sustained tasks' },
];

export const SSB_ASSESSMENT_STRUCTURE: SSBPsychologicalAssessment = {
  durationDays: 5,
  tests: {
    OIR: { name: 'Officer Intelligence Rating', assesses: 'Verbal + Non-verbal intelligence', durationHrs: 2 },
    PPDT: { name: 'Picture Perception & Discussion Test', assesses: 'Group interaction; Story narration', durationMins: 60 },
    TAT: { name: 'Thematic Apperception Test', assesses: 'Unconscious motivations, leadership themes', format: '12 pictures + 1 blank', durationMins: 35 },
    WAT: { name: 'Word Association Test', assesses: 'Speed of thought, OLQ vocabulary', format: '60 words, 15 sec each', durationMins: 15 },
    SRT: { name: 'Situation Reaction Test', assesses: 'Real-world problem-solving; initiative', format: '60 situations, 30s each', durationMins: 30 },
    SD: { name: 'Self Description', assesses: 'Self-awareness; perception gap analysis', durationMins: 15 }
  }
};

// ----------------------------------------------------------------------------------
// MASSIVE MEDICAL THRESHOLDS INJECTION (ALPHA 2025)
// ----------------------------------------------------------------------------------

export const CADET_MEDICAL_DATABASE: Record<ServiceBranch, Record<Gender, AFMSBranchProtocol>> = {

  // =================================================================================
  // ARMY COMBAT ARMS
  // =================================================================================
  Army_Combat: {
    Male: {
      branchName: 'Indian Army (Combat)',
      entrySchemes: ['NDA', 'CDS', 'SSC'],
      anthropometric: {
        minHeightCm: 157.5,
        heightRelaxationHillyCm: 152.5,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 17.5, max: 25 },
        bmiCalculationMethod: 'HeightWeightTable',
        overweightTolerancePercentage: 20
      },
      ophthalmological: {
        visualAcuity: {
          betterEyeUncorrected: '6/6',
          worseEyeUncorrected: '6/18',
          correctedAcceptable: true,
          correctionDetails: '6/6 with glasses'
        },
        refractiveLimits: {
          maxMyopiaD: -3.5,
          maxHypermetropiaD: +3.5,
          astigmatismAllowed: true
        },
        colourVision: {
          minimumStandard: 'CP-III',
          testingMethod: 'Ishihara',
          colourBlindnessPermitted: false
        },
        lasikPolicy: {
          permitted: true,
          minMonthsPostOp: 12,
          minAgeAtSurgery: 20,
          maxMyopiaPreOpD: -6.0,
          requiresStableRefraction: true
        }
      },
      orthopaedic: {
        carryAngle: {
          maxDegrees: 15,
          strictEnforcement: false,
          measurementMethod: 'Goniometer'
        },
        genuValgum: {
          maxInterMalleolarDistanceCm: 7,
          maxValgusAngleDegrees: null,
          rejectionTrigger: '> 7 cm'
        },
        genuVarum: {
          maxInterCondylarDistanceCm: 7,
          rejectionTrigger: '> 7 cm'
        },
        flatFoot: {
          acceptedGrades: ['Grade 1'],
          rigidPesPlanusPermitted: false
        },
        scoliosis: {
          maxCobbAngleDegrees: 10
        }
      },
      audiological: {
        pureToneAudiometry: {
          maxDbHL: 30,
          frequencyRangeHz: { min: 500, max: 2000 },
          speechRangeMaxDbHL: 30
        },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    },
    Female: {
      branchName: 'Indian Army (Combat/Women Selection)',
      entrySchemes: ['NDA', 'CDS', 'SSC-W'],
      anthropometric: {
        minHeightCm: 152.0,
        heightRelaxationHillyCm: 147.0,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 17.5, max: 25 },
        bmiCalculationMethod: 'HeightWeightTable',
        overweightTolerancePercentage: 20
      },
      ophthalmological: {
        visualAcuity: {
          betterEyeUncorrected: '6/6',
          worseEyeUncorrected: '6/18',
          correctedAcceptable: true,
          correctionDetails: '6/6 with glasses'
        },
        refractiveLimits: {
          maxMyopiaD: -3.5,
          maxHypermetropiaD: +3.5,
          astigmatismAllowed: true
        },
        colourVision: {
          minimumStandard: 'CP-III',
          testingMethod: 'Ishihara',
          colourBlindnessPermitted: false
        },
        lasikPolicy: {
          permitted: true,
          minMonthsPostOp: 12,
          minAgeAtSurgery: 20,
          maxMyopiaPreOpD: -6.0,
          requiresStableRefraction: true
        }
      },
      orthopaedic: {
        carryAngle: {
          maxDegrees: 19,
          strictEnforcement: false,
          measurementMethod: 'Goniometer'
        },
        genuValgum: {
          maxInterMalleolarDistanceCm: 8,
          maxValgusAngleDegrees: null,
          rejectionTrigger: '> 8 cm'
        },
        genuVarum: {
          maxInterCondylarDistanceCm: 7,
          rejectionTrigger: '> 7 cm'
        },
        flatFoot: {
          acceptedGrades: ['Grade 1'],
          rigidPesPlanusPermitted: false
        },
        scoliosis: {
          maxCobbAngleDegrees: 10
        }
      },
      audiological: {
        pureToneAudiometry: {
          maxDbHL: 30,
          frequencyRangeHz: { min: 500, max: 2000 },
          speechRangeMaxDbHL: 30
        },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    }
  },

  // =================================================================================
  // ARMY OTHER ARMS
  // =================================================================================
  Army_Other: {
    Male: {
      branchName: 'Indian Army (Other Arms)',
      entrySchemes: ['CDS', 'SSC', 'TES'],
      anthropometric: {
        minHeightCm: 157.5,
        heightRelaxationHillyCm: 152.5,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 17.5, max: 25 },
        bmiCalculationMethod: 'HeightWeightTable',
        overweightTolerancePercentage: 20
      },
      ophthalmological: {
        visualAcuity: {
          betterEyeUncorrected: '6/6',
          worseEyeUncorrected: '6/24',
          correctedAcceptable: true,
          correctionDetails: '6/6 with glasses'
        },
        refractiveLimits: {
          maxMyopiaD: -3.5,
          maxHypermetropiaD: +3.5,
          astigmatismAllowed: true
        },
        colourVision: {
          minimumStandard: 'CP-III',
          testingMethod: 'Ishihara',
          colourBlindnessPermitted: false
        },
        lasikPolicy: {
          permitted: true,
          minMonthsPostOp: 12,
          minAgeAtSurgery: 20,
          maxMyopiaPreOpD: -6.0,
          requiresStableRefraction: true
        }
      },
      orthopaedic: {
        carryAngle: {
          maxDegrees: 15,
          strictEnforcement: false,
          measurementMethod: 'Goniometer'
        },
        genuValgum: {
          maxInterMalleolarDistanceCm: 7,
          maxValgusAngleDegrees: null,
          rejectionTrigger: '> 7 cm'
        },
        genuVarum: {
          maxInterCondylarDistanceCm: 7,
          rejectionTrigger: '> 7 cm'
        },
        flatFoot: {
          acceptedGrades: ['Grade 1'],
          rigidPesPlanusPermitted: false
        },
        scoliosis: {
          maxCobbAngleDegrees: 10
        }
      },
      audiological: {
        pureToneAudiometry: {
          maxDbHL: 30,
          frequencyRangeHz: { min: 500, max: 2000 },
          speechRangeMaxDbHL: 30
        },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    },
    Female: {
      branchName: 'Indian Army (Other Arms)',
      entrySchemes: ['SSC-W'],
      anthropometric: {
        minHeightCm: 152.0,
        heightRelaxationHillyCm: 147.0,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 17.5, max: 25 },
        bmiCalculationMethod: 'HeightWeightTable',
        overweightTolerancePercentage: 20
      },
      ophthalmological: {
        visualAcuity: {
          betterEyeUncorrected: '6/12',
          worseEyeUncorrected: '6/36',
          correctedAcceptable: true,
          correctionDetails: '6/6 with glasses'
        },
        refractiveLimits: {
          maxMyopiaD: -3.5,
          maxHypermetropiaD: +3.5,
          astigmatismAllowed: true
        },
        colourVision: {
          minimumStandard: 'CP-III',
          testingMethod: 'Ishihara',
          colourBlindnessPermitted: false
        },
        lasikPolicy: {
          permitted: true,
          minMonthsPostOp: 12,
          minAgeAtSurgery: 20,
          maxMyopiaPreOpD: -6.0,
          requiresStableRefraction: true
        }
      },
      orthopaedic: {
        carryAngle: { maxDegrees: 19, strictEnforcement: false, measurementMethod: 'Goniometer' },
        genuValgum: { maxInterMalleolarDistanceCm: 8, maxValgusAngleDegrees: null, rejectionTrigger: '> 8 cm' },
        genuVarum: { maxInterCondylarDistanceCm: 7, rejectionTrigger: '> 7 cm' },
        flatFoot: { acceptedGrades: ['Grade 1'], rigidPesPlanusPermitted: false },
        scoliosis: { maxCobbAngleDegrees: 10 }
      },
      audiological: {
        pureToneAudiometry: { maxDbHL: 30, frequencyRangeHz: { min: 500, max: 2000 }, speechRangeMaxDbHL: 30 },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    }
  },

  // =================================================================================
  // AIR FORCE FLYING BRANCH (SUPER STRICT)
  // =================================================================================
  AirForce_Flying: {
    Male: {
      branchName: 'Air Force (Flying Duty)',
      entrySchemes: ['NDA', 'AFCAT'],
      anthropometric: {
        minHeightCm: 162.5,
        heightRelaxationHillyCm: null,
        maxSittingHeightCm: 96,
        minSittingHeightCm: 81.5,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 81,
        bmiRangeAllowed: { min: 18, max: 25 },
        bmiCalculationMethod: 'Composite',
        overweightTolerancePercentage: 0 // Strict
      },
      ophthalmological: {
        visualAcuity: {
          betterEyeUncorrected: '6/6',
          worseEyeUncorrected: '6/6',
          correctedAcceptable: false,
          correctionDetails: 'Not Acceptable'
        },
        refractiveLimits: {
          maxMyopiaD: -0.5,
          maxHypermetropiaD: +1.5,
          astigmatismAllowed: false
        },
        colourVision: {
          minimumStandard: 'CP-I',
          testingMethod: 'Martin Lantern',
          colourBlindnessPermitted: false
        },
        lasikPolicy: {
          permitted: true,
          minMonthsPostOp: 12,
          minAgeAtSurgery: 20,
          maxMyopiaPreOpD: -0.5,
          requiresStableRefraction: true
        }
      },
      orthopaedic: {
        carryAngle: {
          maxDegrees: 10,
          strictEnforcement: true, // EXTREME STRICT
          measurementMethod: 'Goniometer'
        },
        genuValgum: {
          maxInterMalleolarDistanceCm: 4,
          maxValgusAngleDegrees: 10,
          rejectionTrigger: 'IMD > 4cm OR Angle > 10°'
        },
        genuVarum: {
          maxInterCondylarDistanceCm: 4,
          rejectionTrigger: '> 4 cm'
        },
        flatFoot: {
          acceptedGrades: ['Grade 1'],
          rigidPesPlanusPermitted: false
        },
        scoliosis: {
          maxCobbAngleDegrees: 10 // STRICT review above 5 degrees
        }
      },
      audiological: {
        pureToneAudiometry: {
          maxDbHL: 20,
          frequencyRangeHz: { min: 500, max: 4000 },
          speechRangeMaxDbHL: 20
        },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 50, max: 100 }, athleticBradycardiaReviewed: true }, // 50 allowed for flyers
        ecg: { required: true, exerciseStressTestMandatory: true, normalSinusRhythmRequired: true }, // EST Mandatory
        vascular: { varicoseVeinsAcceptedGrades: ['None'] } // NO Varicose accepted for flyers
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: false, tCatApplied: false }, // Rejection
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: false }, // Rejection
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    },
    Female: {
      branchName: 'Air Force (Flying Duty)',
      entrySchemes: ['AFCAT'],
      anthropometric: {
        minHeightCm: 162.5,
        heightRelaxationHillyCm: null,
        maxSittingHeightCm: 96,
        minSittingHeightCm: 81.5,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 81,
        bmiRangeAllowed: { min: 18, max: 25 },
        bmiCalculationMethod: 'Composite',
        overweightTolerancePercentage: 0
      },
      ophthalmological: {
        visualAcuity: { betterEyeUncorrected: '6/6', worseEyeUncorrected: '6/6', correctedAcceptable: false, correctionDetails: 'Not Acceptable' },
        refractiveLimits: { maxMyopiaD: -0.5, maxHypermetropiaD: +1.5, astigmatismAllowed: false },
        colourVision: { minimumStandard: 'CP-I', testingMethod: 'Martin Lantern', colourBlindnessPermitted: false },
        lasikPolicy: { permitted: true, minMonthsPostOp: 12, minAgeAtSurgery: 20, maxMyopiaPreOpD: -0.5, requiresStableRefraction: true }
      },
      orthopaedic: {
        carryAngle: { maxDegrees: 15, strictEnforcement: true, measurementMethod: 'Goniometer' },
        genuValgum: { maxInterMalleolarDistanceCm: 6, maxValgusAngleDegrees: 12, rejectionTrigger: 'IMD > 6cm OR Angle > 12°' },
        genuVarum: { maxInterCondylarDistanceCm: 4, rejectionTrigger: '> 4 cm' },
        flatFoot: { acceptedGrades: ['Grade 1'], rigidPesPlanusPermitted: false },
        scoliosis: { maxCobbAngleDegrees: 10 }
      },
      audiological: {
        pureToneAudiometry: { maxDbHL: 20, frequencyRangeHz: { min: 500, max: 4000 }, speechRangeMaxDbHL: 20 },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 50, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: true, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['None'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: false, tCatApplied: false },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: false },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    }
  },

  // =================================================================================
  // NAVY GENERAL
  // =================================================================================
  Navy_General: {
    Male: {
      branchName: 'Navy (General)',
      entrySchemes: ['NDA', 'CDS', 'SSC'],
      anthropometric: {
        minHeightCm: 157.0,
        heightRelaxationHillyCm: 152.0,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 18, max: 25 },
        bmiCalculationMethod: 'DirectFormula',
        overweightTolerancePercentage: 0
      },
      ophthalmological: {
        visualAcuity: { betterEyeUncorrected: '6/6', worseEyeUncorrected: '6/9', correctedAcceptable: true, correctionDetails: '6/6 with glasses' },
        refractiveLimits: { maxMyopiaD: -2.5, maxHypermetropiaD: +2.5, astigmatismAllowed: true },
        colourVision: { minimumStandard: 'CP-II', testingMethod: 'Ishihara', colourBlindnessPermitted: false },
        lasikPolicy: { permitted: true, minMonthsPostOp: 12, minAgeAtSurgery: 20, maxMyopiaPreOpD: -4.0, requiresStableRefraction: true }
      },
      orthopaedic: {
        carryAngle: { maxDegrees: 15, strictEnforcement: false, measurementMethod: 'Visual' },
        genuValgum: { maxInterMalleolarDistanceCm: 6, maxValgusAngleDegrees: null, rejectionTrigger: '> 6 cm' },
        genuVarum: { maxInterCondylarDistanceCm: 7, rejectionTrigger: '> 7 cm' },
        flatFoot: { acceptedGrades: ['Grade 1'], rigidPesPlanusPermitted: false },
        scoliosis: { maxCobbAngleDegrees: 10 }
      },
      audiological: {
        pureToneAudiometry: { maxDbHL: 25, frequencyRangeHz: { min: 500, max: 2000 }, speechRangeMaxDbHL: 25 },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    },
    Female: {
      branchName: 'Navy (General)',
      entrySchemes: ['SSC', 'NDA'],
      anthropometric: {
        minHeightCm: 152.0,
        heightRelaxationHillyCm: 147.0,
        chestExpansionMinCm: 5,
        chestNormalMinCm: 77,
        bmiRangeAllowed: { min: 18, max: 25 },
        bmiCalculationMethod: 'DirectFormula',
        overweightTolerancePercentage: 0
      },
      ophthalmological: {
        visualAcuity: { betterEyeUncorrected: '6/6', worseEyeUncorrected: '6/9', correctedAcceptable: true, correctionDetails: '6/6 with glasses' },
        refractiveLimits: { maxMyopiaD: -2.5, maxHypermetropiaD: +2.5, astigmatismAllowed: true },
        colourVision: { minimumStandard: 'CP-II', testingMethod: 'Ishihara', colourBlindnessPermitted: false },
        lasikPolicy: { permitted: true, minMonthsPostOp: 12, minAgeAtSurgery: 20, maxMyopiaPreOpD: -4.0, requiresStableRefraction: true }
      },
      orthopaedic: {
        carryAngle: { maxDegrees: 20, strictEnforcement: false, measurementMethod: 'Visual' },
        genuValgum: { maxInterMalleolarDistanceCm: 7, maxValgusAngleDegrees: null, rejectionTrigger: '> 7 cm' },
        genuVarum: { maxInterCondylarDistanceCm: 7, rejectionTrigger: '> 7 cm' },
        flatFoot: { acceptedGrades: ['Grade 1'], rigidPesPlanusPermitted: false },
        scoliosis: { maxCobbAngleDegrees: 10 }
      },
      audiological: {
        pureToneAudiometry: { maxDbHL: 25, frequencyRangeHz: { min: 500, max: 2000 }, speechRangeMaxDbHL: 25 },
        whisperTest: { required: true },
        tympanicPathologyPermitted: false,
        hearingAidsPermitted: false
      },
      cardio: {
        bloodPressure: { systolicRange: { min: 100, max: 140 }, diastolicRange: { min: 60, max: 90 }, mustBeNormalOnMultipleReadings: true },
        restingHeartRate: { bpmRange: { min: 60, max: 100 }, athleticBradycardiaReviewed: true },
        ecg: { required: true, exerciseStressTestMandatory: false, normalSinusRhythmRequired: true },
        vascular: { varicoseVeinsAcceptedGrades: ['Grade I'] }
      },
      general: {
        hernia: { inguinalReducedAsymptomaticPermitted: true, tCatApplied: true },
        metabolic: { diabetesPermitted: false, preDiabetesReviewedCaseByCase: true },
        psychiatric: { axisIDisordersPermitted: false, psychologicalBatteryRequired: true },
        dermatological: { hyperhidrosisSweatyPalmsPermitted: false, extensivePsoriasisPermitted: false },
        respiratory: { covid19Sequelae: { pftMandatoryIfHxPositive: true, requiredPulmonaryFunctionPercent: 100 } }
      }
    }
  },

  // NOTE: Navy Pilot and AirForce Ground branches follow similar structured derivations omitting for brevity but standard logic applies.
  Navy_Pilot: null as any,
  AirForce_Ground: null as any
};

// Fill out AirForce Ground as a courtesy
CADET_MEDICAL_DATABASE.AirForce_Ground = CADET_MEDICAL_DATABASE.Army_Other;
CADET_MEDICAL_DATABASE.Navy_Pilot = CADET_MEDICAL_DATABASE.AirForce_Flying;


// ----------------------------------------------------------------------------------
// GLOBAL EVALUATION ENGINE
// ----------------------------------------------------------------------------------

export class MedicalAuditEngine {
  /**
   * Systematically evaluate any dynamic scan payload against the immutable AFMS thresholds
   * established in CADET_MEDICAL_DATABASE.
   */
  static evaluateScan(
    branch: ServiceBranch, 
    gender: Gender, 
    metricType: 'CARRY_ANGLE' | 'GENU_VALGUM' | 'BMI' | 'VISION', 
    value: number | string
  ): { status: FitStatus; reason?: string } {
    const limits = CADET_MEDICAL_DATABASE[branch][gender];

    switch(metricType) {
      case 'HEIGHT':
        if (typeof value === 'number') {
           return value >= limits.anthropometric.minHeightCm ? { status: 'FIT' } : { status: 'PR', reason: `Height below ${limits.anthropometric.minHeightCm}cm` };
        }
        break;

      case 'CARRY_ANGLE':
        if (typeof value === 'number') {
          return value <= limits.orthopaedic.carryAngle.maxDegrees ? { status: 'FIT' } : { status: 'PR', reason: `Carry Angle > ${limits.orthopaedic.carryAngle.maxDegrees}°` };
        }
        break;
        
      case 'GENU_VALGUM':
        if (typeof value === 'number') {
           const max = limits.orthopaedic.genuValgum.maxInterMalleolarDistanceCm;
           return value <= max ? { status: 'FIT' } : { status: 'PR', reason: `IMD > ${max}cm (Knock Knee)` };
        }
        break;

        case 'BMI':
          if (typeof value === 'number') {
            if (value <= limits.anthropometric.bmiRangeAllowed.max) return { status: 'FIT' };
            // Calculate overweight tolerance
            const maxWithTolerance = limits.anthropometric.bmiRangeAllowed.max * (1 + (limits.anthropometric.bmiCalculationMethod === 'HeightWeightTable' ? limits.anthropometric.overweightTolerancePercentage / 100 : 0));
            if (value <= maxWithTolerance) return { status: 'BORDERLINE', reason: 'Marginally Overweight' };
            return { status: 'UNFIT', reason: 'BMI exceeds military standards' };
          }
          break;
        
      // Future expansion for vision acuity strings
    }
    
    return { status: 'SCAN_INCOMPLETE' };
  }
}
