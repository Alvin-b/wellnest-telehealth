import { useEffect, useState } from "react";
import { CalendarDays, Camera, CameraOff, Mic, MicOff, Phone, PhoneOff, Plus, ShieldCheck, Trash2, Video, Volume2, FileText, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SPECIALTIES, defaultTimes, todayISO, type Medication } from "@/lib/tele/data";
import { useTele } from "@/lib/tele/store";
import { Avatar, Btn, Card, Field, Header, inputCls } from "./ui";

export function DocRegister() {
  const { set, go } = useTele();
  const [f, setF] = useState({ name: "", specialty: "General", license: "", years: "5", fee: "2000", bio: "" });
  const [file, setFile] = useState<string>("");
  const ok = f.name && f.license && file;
  return (
    <div className="pb-8">
      <Header title="List your practice" />
      <div className="space-y-4 px-5">
        <p className="text-sm text-muted-foreground">Join MediLink and consult patients from anywhere.</p>
        <Field label="Full name"><input className={inputCls} placeholder="Dr. Jane Doe" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Specialty">
          <select className={inputCls} value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })}>{SPECIALTIES.map((s) => <option key={s.name}>{s.name}</option>)}</select>
        </Field>
        <Field label="Medical license number"><input className={inputCls} placeholder="KMPDC-…" value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Years of experience"><input type="number" className={inputCls} value={f.years} onChange={(e) => setF({ ...f, years: e.target.value })} /></Field>
          <Field label="Fee (KES)"><input type="number" className={inputCls} value={f.fee} onChange={(e) => setF({ ...f, fee: e.target.value })} /></Field>
        </div>
        <Field label="About you"><textarea rows={3} className={cn(inputCls, "h-auto py-3")} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></Field>
        <Field label="License certificate">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} className="block w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2.5 file:font-bold file:text-primary" />
        </Field>
        <Btn className="w-full" disabled={!ok} onClick={() => {
          const id = `d${Date.now()}`;
          set((s) => ({
            role: "doctor", myDoctorId: id,
            doctors: [...s.doctors, { id, name: f.name.startsWith("Dr") ? f.name : `Dr. ${f.name}`, specialty: f.specialty, license: f.license, years: +f.years, fee: +f.fee, bio: f.bio || "Certified physician.", rating: 5, languages: ["English"], reviews: [] }],
            appointments: [...s.appointments, { id: `a${Date.now()}`, doctorId: id, patient: "Peter Otieno", date: todayISO(), time: "17:30", type: "voice", reason: "Headaches for 3 days", status: "upcoming", paid: true }],
          }));
          toast.success("You're listed! Patients can now book you.");
          go({ name: "doc-home" });
        }}>Submit & go live</Btn>
        <button className="w-full text-center text-xs font-bold text-primary" onClick={() => {
          set((s) => ({ role: "doctor", myDoctorId: "d1", appointments: s.appointments }));
          go({ name: "doc-home" });
        }}>Demo: sign in as Dr. Amina Wanjiru</button>
      </div>
    </div>
  );
}

export function DocHome() {
  const { doctors, myDoctorId, appointments, prescriptions, set, go } = useTele();
  const me = doctors.find((d) => d.id === myDoctorId);
  if (!me) return null;
  const mine = appointments.filter((a) => a.doctorId === me.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const up = mine.filter((a) => a.status === "upcoming");
  const done = mine.filter((a) => a.status === "completed");
  return (
    <div className="space-y-5 px-5 pb-6 pt-2">
      <div className="flex items-center gap-3">
        <Avatar doctor={me} size={52} />
        <div className="flex-1"><p className="text-xs text-muted-foreground">Welcome back</p><p className="flex items-center gap-1 font-bold">{me.name}<ShieldCheck className="h-4 w-4 text-success" /></p></div>
        <button onClick={() => { set(() => ({ role: null })); go({ name: "welcome" }); }} aria-label="Sign out" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card"><LogOut className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[["Upcoming", up.length], ["Completed", done.length], ["Rating", me.rating.toFixed(1)]].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-3 shadow-card"><p className="font-display text-xl font-bold text-primary">{v}</p><p className="text-[11px] text-muted-foreground">{k}</p></div>
        ))}
      </div>
      <h2 className="font-bold">Upcoming consultations</h2>
      {up.map((a) => (
        <Card key={a.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar doctor={{ name: a.patient }} size={44} />
            <div className="flex-1"><p className="text-sm font-bold">{a.patient}</p><p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{a.date === todayISO() ? "Today" : a.date} · {a.time}</p></div>
            {a.type === "video" ? <Video className="h-5 w-5 text-primary" /> : <Phone className="h-5 w-5 text-primary" />}
          </div>
          <p className="rounded-xl bg-muted px-3 py-2 text-xs">{a.reason}</p>
          <Btn className="h-10 w-full" onClick={() => go({ name: "call", appointmentId: a.id })}>Start {a.type} call</Btn>
        </Card>
      ))}
      {!up.length && <p className="text-sm text-muted-foreground">No upcoming consultations.</p>}
      {!!done.length && <h2 className="font-bold">Recent</h2>}
      {done.map((a) => {
        const rx = prescriptions.some((p) => p.appointmentId === a.id);
        return (
          <Card key={a.id} className="flex items-center gap-3">
            <Avatar doctor={{ name: a.patient }} size={40} />
            <div className="flex-1"><p className="text-sm font-bold">{a.patient}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>
            <Btn variant={rx ? "outline" : "soft"} className="h-9 text-xs" disabled={rx} onClick={() => go({ name: "doc-prescribe", appointmentId: a.id })}>{rx ? "Prescribed" : "Prescribe"}</Btn>
          </Card>
        );
      })}
    </div>
  );
}

export function Prescribe({ appointmentId }: { appointmentId: string }) {
  const { appointments, set, go } = useTele();
  const a = appointments.find((x) => x.id === appointmentId)!;
  const blank = (): Medication => ({ id: `m${Math.random()}`, name: "", dose: "1 tablet", frequency: 2, days: 5, notes: "", times: defaultTimes(2), reminders: true, taken: [] });
  const [diagnosis, setDiagnosis] = useState("");
  const [meds, setMeds] = useState<Medication[]>([blank()]);
  const upd = (i: number, p: Partial<Medication>) => setMeds((m) => m.map((x, j) => (j === i ? { ...x, ...p, ...(p.frequency ? { times: defaultTimes(p.frequency) } : {}) } : x)));
  return (
    <div className="pb-8">
      <Header title="Write prescription" />
      <div className="space-y-4 px-5">
        <Card className="flex items-center gap-3"><Avatar doctor={{ name: a.patient }} size={44} /><div><p className="text-sm font-bold">{a.patient}</p><p className="text-xs text-muted-foreground">{a.reason}</p></div></Card>
        <Field label="Diagnosis"><input className={inputCls} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Upper respiratory infection" /></Field>
        {meds.map((m, i) => (
          <Card key={m.id} className="space-y-3">
            <div className="flex items-center justify-between"><p className="text-xs font-bold text-primary">Medication {i + 1}</p>{meds.length > 1 && <button onClick={() => setMeds(meds.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></button>}</div>
            <input className={inputCls} placeholder="Drug name & strength" value={m.name} onChange={(e) => upd(i, { name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className={inputCls} placeholder="Dose" value={m.dose} onChange={(e) => upd(i, { dose: e.target.value })} />
              <select className={inputCls} value={m.frequency} onChange={(e) => upd(i, { frequency: +e.target.value })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}×/day</option>)}</select>
              <input type="number" className={inputCls} value={m.days} onChange={(e) => upd(i, { days: +e.target.value })} aria-label="Days" />
            </div>
            <input className={inputCls} placeholder="Instructions (e.g. after meals)" value={m.notes} onChange={(e) => upd(i, { notes: e.target.value })} />
          </Card>
        ))}
        <Btn variant="soft" className="w-full" onClick={() => setMeds([...meds, blank()])}><Plus className="h-4 w-4" />Add medication</Btn>
        <Btn className="w-full" disabled={!diagnosis || meds.some((m) => !m.name)} onClick={() => {
          set((s) => ({ prescriptions: [{ id: `p${Date.now()}`, doctorId: a.doctorId, appointmentId: a.id, date: todayISO(), diagnosis, meds }, ...s.prescriptions] }));
          toast.success("Prescription sent to patient");
          go({ name: "doc-home" });
        }}><FileText className="h-4 w-4" />Send prescription</Btn>
      </div>
    </div>
  );
}

export function Call({ appointmentId }: { appointmentId: string }) {
  const { appointments, doctors, role, set, go } = useTele();
  const a = appointments.find((x) => x.id === appointmentId)!;
  const d = doctors.find((x) => x.id === a.doctorId)!;
  const other = role === "doctor" ? { name: a.patient } : d;
  const [phase, setPhase] = useState<"ringing" | "live">("ringing");
  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(a.type === "video");
  useEffect(() => {
    if (phase === "ringing") { const t = setTimeout(() => setPhase("live"), 2500); return () => clearTimeout(t); }
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);
  const end = () => {
    set((s) => ({ appointments: s.appointments.map((x) => (x.id === a.id ? { ...x, status: "completed" } : x)) }));
    if (role === "doctor") go({ name: "doc-prescribe", appointmentId: a.id });
    else go({ name: "rate", appointmentId: a.id });
  };
  const mm = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  const isVideo = a.type === "video" && phase === "live";
  return (
    <div className="relative flex h-full flex-col bg-call text-call-foreground">
      {isVideo && "photo" in other && other.photo && <img src={other.photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />}
      {isVideo && <div className="absolute inset-0 bg-gradient-to-b from-call/70 via-transparent to-call/90" />}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-14 text-center">
        {!isVideo && <div className={cn("rounded-3xl", phase === "ringing" && "pulse-ring")}><Avatar doctor={other} size={120} /></div>}
        <h2 className="mt-6 text-2xl font-bold">{other.name}</h2>
        <p className="mt-1 text-sm opacity-75">{phase === "ringing" ? (role === "doctor" ? "Calling patient…" : "Doctor is calling…") : `${a.type === "video" ? "Video" : "Voice"} consultation · ${mm}`}</p>
        <span className="mt-3 rounded-full bg-call-foreground/10 px-3 py-1 text-[11px]">🔒 End-to-end encrypted</span>
      </div>
      {isVideo && (
        <div className="absolute bottom-32 right-4 z-10 grid h-36 w-24 place-items-center rounded-2xl border border-call-foreground/20 bg-call text-xs opacity-90">
          {cam ? "You" : <CameraOff className="h-5 w-5" />}
        </div>
      )}
      <div className="relative z-10 flex items-center justify-center gap-4 pb-12">
        <CallBtn on={mic} onClick={() => setMic(!mic)} label="Mute">{mic ? <Mic /> : <MicOff />}</CallBtn>
        {a.type === "video" ? <CallBtn on={cam} onClick={() => setCam(!cam)} label="Camera">{cam ? <Camera /> : <CameraOff />}</CallBtn> : <CallBtn on onClick={() => {}} label="Speaker"><Volume2 /></CallBtn>}
        <button onClick={end} aria-label="End call" className="grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground"><PhoneOff /></button>
      </div>
    </div>
  );
}

function CallBtn({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return <button onClick={onClick} aria-label={label} className={cn("grid h-14 w-14 place-items-center rounded-full", on ? "bg-call-foreground/15" : "bg-call-foreground text-call")}>{children}</button>;
}
