/* CADET PROTOCOL — Static reference data */

export const ENTRY_SCHEMES = ["NDA", "CDS"] as const;
export const TARGET_SERVICES = ["ARMY", "NAVY", "AIR_FORCE"] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
] as const;

export const STATE_CITY_MAP: Record<string, string[]> = {
  "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
  "Chandigarh": ["Chandigarh"],
  "Delhi": ["New Delhi", "Delhi NCR"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Haryana": ["Gurugram", "Faridabad", "Panchkula", "Ambala"],
  "Jammu and Kashmir": ["Jammu", "Srinagar", "Udhampur"],
  "Karnataka": ["Bangalore", "Mysore", "Belgaum"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Ghaziabad", "Noida"],
  "West Bengal": ["Kolkata", "Siliguri", "Asansol"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  "Kerala": ["Kochi", "Thiruvananthapuram"],
  "Assam": ["Guwahati", "Dibrugarh"],
};

export const STATE_TO_COMMAND_MAP: Record<string, string> = {
  "Jammu and Kashmir": "Command Hospital (Northern Command)",
  "Ladakh": "Command Hospital (Northern Command)",
  "Punjab": "Command Hospital (Western Command)",
  "Haryana": "Command Hospital (Western Command)",
  "Himachal Pradesh": "Command Hospital (Western Command)",
  "Delhi": "Army Hospital (Research & Referral)",
  "Uttar Pradesh": "Command Hospital (Central Command)",
  "Uttarakhand": "Command Hospital (Central Command)",
  "Madhya Pradesh": "Command Hospital (Central Command)",
  "Chhattisgarh": "Command Hospital (Central Command)",
  "West Bengal": "Command Hospital (Eastern Command)",
  "Bihar": "Command Hospital (Eastern Command)",
  "Jharkhand": "Command Hospital (Eastern Command)",
  "Odisha": "Command Hospital (Eastern Command)",
  "Sikkim": "Command Hospital (Eastern Command)",
  "Assam": "Command Hospital (Eastern Command)",
  "Maharashtra": "Command Hospital (Southern Command)",
  "Gujarat": "Command Hospital (Southern Command)",
  "Rajasthan": "Command Hospital (Southern Command)",
  "Goa": "Command Hospital (Southern Command)",
  "Karnataka": "Command Hospital Air Force",
  "Kerala": "Command Hospital (Southern Command)",
  "Tamil Nadu": "Command Hospital (Southern Command)",
  "Andhra Pradesh": "INHS Kalyani",
  "Telangana": "Command Hospital (Southern Command)",
};

export const INDIAN_CITIES = Object.values(STATE_CITY_MAP).flat();

export type EntryScheme = typeof ENTRY_SCHEMES[number];
export type TargetService = typeof TARGET_SERVICES[number];

// AFMS thresholds (simplified from PDF Module B)
export interface StandardRow {
  parameter: string;
  unit: string;
  thresholds: Record<string, string>;
  rejectTrigger: string;
}

export const AFMS_STANDARDS: StandardRow[] = [
  {
    parameter: "Height",
    unit: "cm",
    thresholds: {
      "NDA-ARMY": "157.5", "NDA-NAVY": "157", "NDA-AIR_FORCE": "162.5",
      "CDS-ARMY": "157.5", "CDS-NAVY": "157", "CDS-AIR_FORCE": "162.5",
    },
    rejectTrigger: "Below minimum height",
  },
  {
    parameter: "Weight",
    unit: "kg",
    thresholds: {
      "NDA-ARMY": "Per BMI", "NDA-NAVY": "Per BMI", "NDA-AIR_FORCE": "Per BMI",
      "CDS-ARMY": "Per BMI", "CDS-NAVY": "Per BMI", "CDS-AIR_FORCE": "Per BMI",
    },
    rejectTrigger: "BMI < 18.5 or > 25",
  },
  {
    parameter: "Chest Expansion",
    unit: "cm",
    thresholds: {
      "NDA-ARMY": "5", "NDA-NAVY": "5", "NDA-AIR_FORCE": "5",
      "CDS-ARMY": "5", "CDS-NAVY": "5", "CDS-AIR_FORCE": "5",
    },
    rejectTrigger: "Less than 5 cm",
  },
  {
    parameter: "Vision (better eye, uncorrected)",
    unit: "",
    thresholds: {
      "NDA-ARMY": "6/6", "NDA-NAVY": "6/6", "NDA-AIR_FORCE": "6/6 strict",
      "CDS-ARMY": "6/6 corrected", "CDS-NAVY": "6/6", "CDS-AIR_FORCE": "6/6 strict",
    },
    rejectTrigger: "Below required acuity",
  },
  {
    parameter: "Colour Vision",
    unit: "",
    thresholds: {
      "NDA-ARMY": "CP-III", "NDA-NAVY": "CP-II", "NDA-AIR_FORCE": "CP-I",
      "CDS-ARMY": "CP-III", "CDS-NAVY": "CP-II", "CDS-AIR_FORCE": "CP-I",
    },
    rejectTrigger: "Below required colour perception class",
  },
  {
    parameter: "Hearing",
    unit: "",
    thresholds: {
      "NDA-ARMY": "Whisper @ 610cm", "NDA-NAVY": "Whisper @ 610cm", "NDA-AIR_FORCE": "Audiometric",
      "CDS-ARMY": "Whisper @ 610cm", "CDS-NAVY": "Whisper @ 610cm", "CDS-AIR_FORCE": "Audiometric",
    },
    rejectTrigger: "Hearing loss > 20 dB",
  },
];

// Command Hospitals (representative — PDF Module D)
export interface CommandHospital {
  name: string;
  city: string;
  state: string;
  service: "ARMY" | "NAVY" | "AIR_FORCE";
  phone?: string;
  specialities: string[];
  // Approximate coords for distance calc
  lat: number;
  lng: number;
}

export const COMMAND_HOSPITALS: CommandHospital[] = [
  { name: "Army Hospital (Research & Referral)", city: "New Delhi", state: "Delhi", service: "ARMY", phone: "+91-11-23338181", specialities: ["Tertiary Care", "All Specialities", "Oncology"], lat: 28.5954, lng: 77.1654 },
  { name: "Command Hospital (Air Force)", city: "Bangalore", state: "Karnataka", service: "AIR_FORCE", phone: "+91-80-25224436", specialities: ["Aviation Medicine", "Vision", "ENT"], lat: 12.9716, lng: 77.5946 },
  { name: "Command Hospital (Western Command)", city: "Chandimandir", state: "Haryana", service: "ARMY", phone: "+91-172-2589901", specialities: ["Orthopaedics", "Cardiology", "ENT"], lat: 30.7303, lng: 76.9042 },
  { name: "Command Hospital (Central Command)", city: "Lucknow", state: "Uttar Pradesh", service: "ARMY", phone: "+91-522-2292350", specialities: ["General Surgery", "Medicine", "Vision"], lat: 26.8467, lng: 80.9462 },
  { name: "Command Hospital (Eastern Command)", city: "Kolkata", state: "West Bengal", service: "ARMY", phone: "+91-33-22221300", specialities: ["Specialist referral", "Trauma Care"], lat: 22.5726, lng: 88.3639 },
  { name: "Command Hospital (Southern Command)", city: "Pune", state: "Maharashtra", service: "ARMY", phone: "+91-20-26306000", specialities: ["Orthopaedics", "Burn Specialist", "Cardio"], lat: 18.5204, lng: 73.8567 },
  { name: "Command Hospital (Northern Command)", city: "Udhampur", state: "Jammu and Kashmir", service: "ARMY", phone: "+91-1992-242000", specialities: ["Mountain Medicine", "Ortho"], lat: 32.9159, lng: 75.1416 },
  { name: "INHS Asvini (Navy)", city: "Mumbai", state: "Maharashtra", service: "NAVY", phone: "+91-22-22151031", specialities: ["Maritime Medicine", "Vision", "Navy Ops"], lat: 18.9169, lng: 72.8227 },
  { name: "INHS Kalyani", city: "Visakhapatnam", state: "Andhra Pradesh", service: "NAVY", phone: "+91-891-2812345", specialities: ["General Care", "Sea Sickness Specialist"], lat: 17.6868, lng: 83.2185 },
  { name: "Base Hospital Delhi Cantt", city: "New Delhi", state: "Delhi", service: "ARMY", phone: "+91-11-25683412", specialities: ["General Review", "Psychology"], lat: 28.5962, lng: 77.1425 },
];

// Approximate city coordinates for distance calculation (city-level, not GPS)
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  patna: { lat: 25.5941, lng: 85.1376 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  guwahati: { lat: 26.1445, lng: 91.7362 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
  noida: { lat: 28.5355, lng: 77.3910 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  indore: { lat: 22.7196, lng: 75.8577 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
};

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

export function getCityCoords(city?: string | null): { lat: number; lng: number } | null {
  if (!city) return null;
  return CITY_COORDS[city.toLowerCase().trim()] ?? null;
}

export function bmi(heightCm?: number | null, weightKg?: number | null): number | null {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
