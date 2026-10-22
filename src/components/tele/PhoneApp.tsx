import { useEffect, useState } from "react";
import { CalendarDays, Home as HomeIcon, MessageCircle, Pill, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeleProvider, useTele } from "@/lib/tele/store";
import { todayISO } from "@/lib/tele/data";
import { Appointments, Book, Chat, Chats, DoctorProfile, Doctors, Home, Meds, Pay, Profile, Rate, Records, Welcome } from "./patient";
import { Call, DocHome, DocRegister, Prescribe } from "./doctor";

function Screen() {
  const { screen: s } = useTele();
  switch (s.name) {
    case "welcome": return <Welcome />;
    case "home": return <Home />;
    case "doctors": return <Doctors specialty={s.specialty} />;
    case "doctor": return <DoctorProfile id={s.id} />;
    case "book": return <Book id={s.id} />;
    case "pay": return <Pay appointment={s.appointment} />;
    case "appointments": return <Appointments />;
    case "call": return <Call appointmentId={s.appointmentId} />;
    case "rate": return <Rate appointmentId={s.appointmentId} />;
    case "meds": return <Meds />;
    case "chats": return <Chats />;
    case "chat": return <Chat doctorId={s.doctorId} />;
    case "records": return <Records />;
    case "profile": return <Profile />;
    case "doc-register": return <DocRegister />;
    case "doc-home": return <DocHome />;
    case "doc-prescribe": return <Prescribe appointmentId={s.appointmentId} />;
  }
}

const TABS = [
  { name: "home", icon: HomeIcon, label: "Home" },
  { name: "appointments", icon: CalendarDays, label: "Visits" },
  { name: "meds", icon: Pill, label: "Meds" },
  { name: "chats", icon: MessageCircle, label: "Chat" },
  { name: "profile", icon: User, label: "Me" },
] as const;

function useReminders() {
  const { prescriptions, appointments, doctors, role } = useTele();
  useEffect(() => {
    const fired = new Set<string>();
    const tick = () => {
      if (role !== "patient") return;
      const now = new Date().toTimeString().slice(0, 5);
      const today = todayISO();
      prescriptions.forEach((p) => p.meds.forEach((m) => {
        if (!m.reminders || !m.times.includes(now)) return;
        const k = `${m.id}-${today}-${now}`;
        if (fired.has(k)) return;
        fired.add(k);
        const msg = `Time to take ${m.name} (${m.dose})`;
        toast(`💊 ${msg}`, { duration: 10000 });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Medication reminder", { body: msg });
      }));
      appointments.filter((a) => a.status === "upcoming" && a.date === today).forEach((a) => {
        const [h, mi] = a.time.split(":").map(Number);
        const t = new Date(); t.setHours(h, mi - 10, 0);
        if (t.toTimeString().slice(0, 5) === now && !fired.has(a.id)) {
          fired.add(a.id);
          toast(`📞 ${doctors.find((d) => d.id === a.doctorId)?.name} will call you in 10 minutes`);
        }
      });
    };
    tick();
    const i = setInterval(tick, 20000);
    return () => clearInterval(i);
  }, [prescriptions, appointments, doctors, role]);
}

function Shell() {
  const { screen, role, go } = useTele();
  useReminders();
  const [clock, setClock] = useState("");
  useEffect(() => {
    const u = () => setClock(new Date().toTimeString().slice(0, 5));
    u(); const i = setInterval(u, 15000); return () => clearInterval(i);
  }, []);
  const showTabs = role === "patient" && TABS.some((t) => t.name === screen.name);
  const dark = screen.name === "welcome" || screen.name === "call";
  return (
    <div className="relative h-[820px] max-h-[calc(100vh-2rem)] w-[390px] max-w-full rounded-[3.2rem] bg-bezel p-3 shadow-phone">
      <div className={cn("relative flex h-full flex-col overflow-hidden rounded-[2.5rem]", dark ? "bg-call" : "bg-background")}>
        <div className={cn("relative z-20 flex h-11 shrink-0 items-center justify-between px-8 text-xs font-bold", dark ? "text-call-foreground" : "text-foreground", screen.name === "welcome" && "bg-gradient-primary")}>
          <span>{clock}</span>
          <span className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-bezel" />
          <span className="flex items-center gap-1">5G <span className="inline-block h-2.5 w-5 rounded-sm border border-current"><span className="block h-full w-3/4 bg-current" /></span></span>
        </div>
        <div className="no-scrollbar relative flex-1 overflow-y-auto">
          <Screen />
        </div>
        {showTabs && (
          <nav className="flex shrink-0 justify-around border-t bg-card px-2 pb-5 pt-2">
            {TABS.map((t) => (
              <button key={t.name} onClick={() => go({ name: t.name })} className={cn("flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold", screen.name === t.name ? "text-primary" : "text-muted-foreground")}>
                <t.icon className="h-5 w-5" />{t.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export function PhoneApp() {
  return <TeleProvider><Shell /></TeleProvider>;
}
