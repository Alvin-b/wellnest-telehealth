import doc1 from "@/assets/doc1.jpg";
import doc2 from "@/assets/doc2.jpg";
import doc3 from "@/assets/doc3.jpg";
import doc4 from "@/assets/doc4.jpg";

export type Review = { author: string; rating: number; text: string };
export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  photo?: string;
  years: number;
  fee: number;
  rating: number;
  bio: string;
  license: string;
  languages: string[];
  reviews: Review[];
};
export type CallType = "video" | "voice";
export type Appointment = {
  id: string;
  doctorId: string;
  patient: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: CallType;
  reason: string;
  status: "upcoming" | "completed";
  paid: boolean;
  rated?: boolean;
};
export type Medication = {
  id: string;
  name: string;
  dose: string;
  frequency: number; // times per day
  days: number;
  notes: string;
  times: string[];
  reminders: boolean;
  taken: string[]; // "YYYY-MM-DD HH:MM"
};
export type Prescription = {
  id: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  diagnosis: string;
  meds: Medication[];
};
export type Message = { id: string; doctorId: string; from: "patient" | "doctor"; text: string; at: string };
export type HealthRecord = { id: string; name: string; kind: string; size: string; date: string };

export const SPECIALTIES = [
  { name: "General", icon: "Stethoscope" },
  { name: "Pediatrics", icon: "Baby" },
  { name: "Cardiology", icon: "HeartPulse" },
  { name: "Dermatology", icon: "Sparkles" },
  { name: "Mental Health", icon: "Brain" },
  { name: "Gynecology", icon: "Flower2" },
] as const;

export const DOCTORS: Doctor[] = [
  {
    id: "d1", name: "Dr. Amina Wanjiru", specialty: "General", photo: doc1, years: 9, fee: 1500, rating: 4.9,
    bio: "Family physician focused on everyday illnesses, chronic care and preventive health.",
    license: "KMPDC-A10293", languages: ["English", "Swahili"],
    reviews: [
      { author: "Brian K.", rating: 5, text: "Very patient and explained everything clearly." },
      { author: "Faith M.", rating: 5, text: "Felt better within two days. Highly recommend." },
    ],
  },
  {
    id: "d2", name: "Dr. Rajesh Patel", specialty: "Cardiology", photo: doc2, years: 18, fee: 3500, rating: 4.8,
    bio: "Consultant cardiologist. Blood pressure, chest pain, heart rhythm and follow-ups.",
    license: "KMPDC-C55120", languages: ["English", "Hindi", "Swahili"],
    reviews: [{ author: "Grace O.", rating: 5, text: "Thorough review of my ECG results." }],
  },
  {
    id: "d3", name: "Dr. Samuel Tesfaye", specialty: "Mental Health", photo: doc3, years: 7, fee: 2500, rating: 4.9,
    bio: "Psychiatrist supporting anxiety, depression, sleep problems and stress.",
    license: "KMPDC-P77341", languages: ["English", "Amharic"],
    reviews: [{ author: "Anon", rating: 5, text: "Safe space, never felt rushed." }],
  },
  {
    id: "d4", name: "Dr. Claire Hoffmann", specialty: "Dermatology", photo: doc4, years: 12, fee: 2800, rating: 4.7,
    bio: "Skin, hair and nail conditions. Acne, eczema, rashes and mole checks by video.",
    license: "KMPDC-D30118", languages: ["English", "German"],
    reviews: [{ author: "Ivy N.", rating: 4, text: "Great advice for my eczema." }],
  },
  {
    id: "d5", name: "Dr. Mercy Achieng", specialty: "Pediatrics", years: 11, fee: 2000, rating: 4.8,
    bio: "Children's doctor — fevers, coughs, growth and vaccinations guidance.",
    license: "KMPDC-K44871", languages: ["English", "Swahili", "Luo"], reviews: [],
  },
  {
    id: "d6", name: "Dr. Lilian Mutua", specialty: "Gynecology", years: 14, fee: 3000, rating: 4.9,
    bio: "Women's health, pregnancy check-ins, family planning and cycle concerns.",
    license: "KMPDC-G21904", languages: ["English", "Swahili"], reviews: [],
  },
];

export const TIME_SLOTS = ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

export function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function defaultTimes(freq: number) {
  return (({ 1: ["08:00"], 2: ["08:00", "20:00"], 3: ["08:00", "14:00", "20:00"], 4: ["07:00", "12:00", "17:00", "22:00"] }) as Record<number, string[]>)[freq] ?? ["08:00"];
}

export function initials(name: string) {
  return name.replace("Dr. ", "").split(" ").map((p) => p[0]).slice(0, 2).join("");
}

export function formatKES(n: number) {
  return `KES ${n.toLocaleString()}`;
}
