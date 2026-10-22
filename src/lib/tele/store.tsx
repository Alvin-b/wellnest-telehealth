import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DOCTORS, defaultTimes, todayISO,
  type Appointment, type Doctor, type HealthRecord, type Message, type Prescription,
} from "./data";

export type Screen =
  | { name: "welcome" }
  | { name: "home" }
  | { name: "doctors"; specialty?: string }
  | { name: "doctor"; id: string }
  | { name: "book"; id: string }
  | { name: "pay"; appointment: Appointment }
  | { name: "appointments" }
  | { name: "call"; appointmentId: string }
  | { name: "rate"; appointmentId: string }
  | { name: "meds" }
  | { name: "chats" }
  | { name: "chat"; doctorId: string }
  | { name: "records" }
  | { name: "profile" }
  | { name: "doc-register" }
  | { name: "doc-home" }
  | { name: "doc-prescribe"; appointmentId: string };

type State = {
  role: "patient" | "doctor" | null;
  patientName: string;
  doctors: Doctor[];
  myDoctorId: string | null;
  appointments: Appointment[];
  prescriptions: Prescription[];
  messages: Message[];
  records: HealthRecord[];
};

const seed = (): State => ({
  role: null,
  patientName: "Joy Kamau",
  doctors: DOCTORS,
  myDoctorId: null,
  appointments: [
    { id: "a1", doctorId: "d1", patient: "Joy Kamau", date: todayISO(), time: "16:00", type: "video", reason: "Persistent cough and mild fever", status: "upcoming", paid: true },
    { id: "a0", doctorId: "d4", patient: "Joy Kamau", date: todayISO(-6), time: "11:30", type: "video", reason: "Skin rash on arms", status: "completed", paid: true, rated: true },
  ],
  prescriptions: [
    {
      id: "p0", doctorId: "d4", appointmentId: "a0", date: todayISO(-6), diagnosis: "Contact dermatitis",
      meds: [
        { id: "m1", name: "Hydrocortisone 1% cream", dose: "Thin layer", frequency: 2, days: 10, notes: "Apply to affected skin", times: defaultTimes(2), reminders: true, taken: [] },
        { id: "m2", name: "Cetirizine 10mg", dose: "1 tablet", frequency: 1, days: 7, notes: "At night, may cause drowsiness", times: ["21:00"], reminders: true, taken: [] },
      ],
    },
  ],
  messages: [
    { id: "x1", doctorId: "d4", from: "doctor", text: "Hi Joy, how is the rash today?", at: "09:12" },
    { id: "x2", doctorId: "d4", from: "patient", text: "Much better, the itching has reduced.", at: "09:20" },
  ],
  records: [{ id: "r1", name: "Full blood count.pdf", kind: "Lab result", size: "240 KB", date: todayISO(-20) }],
});

type Ctx = State & {
  screen: Screen;
  go: (s: Screen) => void;
  back: () => void;
  set: (fn: (s: State) => Partial<State>) => void;
  reset: () => void;
};

const TeleCtx = createContext<Ctx | null>(null);
const KEY = "medilink-demo-v1";

export function TeleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [stack, setStack] = useState<Screen[]>([{ name: "welcome" }]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as State;
        setState(s);
        if (s.role) setStack([{ name: s.role === "doctor" ? "doc-home" : "home" }]);
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const value: Ctx = {
    ...state,
    screen: stack[stack.length - 1],
    go: (s) => setStack((st) => (["home", "appointments", "meds", "chats", "profile", "doc-home", "welcome"].includes(s.name) ? [s] : [...st, s])),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    set: (fn) => setState((s) => ({ ...s, ...fn(s) })),
    reset: () => { localStorage.removeItem(KEY); setState(seed()); setStack([{ name: "welcome" }]); },
  };
  return <TeleCtx.Provider value={value}>{children}</TeleCtx.Provider>;
}

export function useTele() {
  const c = useContext(TeleCtx);
  if (!c) throw new Error("useTele outside provider");
  return c;
}
