import { useMemo, useRef, useState } from "react";
import {
  Baby, Bell, BellOff, Brain, CalendarDays, Check, CreditCard, FileText, Flower2, HeartPulse, MessageCircle,
  Phone, Pill, Search, Send, ShieldCheck, Smartphone, Sparkles, Stethoscope, Upload, Video, LogOut, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SPECIALTIES, TIME_SLOTS, formatKES, todayISO, type Appointment, type CallType } from "@/lib/tele/data";
import { useTele } from "@/lib/tele/store";
import { Avatar, Btn, Card, Field, Header, Stars, inputCls } from "./ui";

const ICONS = { Stethoscope, Baby, HeartPulse, Sparkles, Brain, Flower2 };

export function Welcome() {
  const { set, go } = useTele();
  return (
    <div className="flex h-full flex-col bg-gradient-primary px-6 pb-8 pt-16 text-primary-foreground">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary-foreground/15">
        <HeartPulse className="h-9 w-9" />
      </div>
      <h1 className="mt-8 text-4xl font-extrabold leading-tight">Care that<br />comes to you.</h1>
      <p className="mt-4 text-sm opacity-85">See certified doctors by video or voice, get prescriptions on your phone and never miss a dose.</p>
      <div className="mt-auto space-y-3">
        <Btn variant="accent" className="w-full" onClick={() => { set(() => ({ role: "patient" })); go({ name: "home" }); }}>
          I need a doctor
        </Btn>
        <Btn variant="outline" className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground" onClick={() => go({ name: "doc-register" })}>
          I'm a certified doctor
        </Btn>
      </div>
    </div>
  );
}

export function Home() {
  const { patientName, appointments, doctors, prescriptions, go } = useTele();
  const [q, setQ] = useState("");
  const next = appointments.filter((a) => a.status === "upcoming").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const nextDoc = next && doctors.find((d) => d.id === next.doctorId);
  const doses = prescriptions.flatMap((p) => p.meds.flatMap((m) => m.times.map((t) => ({ m, t })))).sort((a, b) => a.t.localeCompare(b.t));
  const now = new Date().toTimeString().slice(0, 5);
  const upcomingDose = doses.find((d) => d.t >= now) ?? doses[0];

  return (
    <div className="space-y-6 px-5 pb-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Good day 👋</p>
          <h1 className="text-xl font-bold">{patientName.split(" ")[0]}</h1>
        </div>
        <button onClick={() => go({ name: "meds" })} className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-card" aria-label="Reminders">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); go({ name: "doctors", specialty: q || undefined }); }} className="flex items-center gap-2 rounded-2xl bg-card px-4 shadow-card">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctor, symptom, specialty" className="h-12 flex-1 bg-transparent text-sm outline-none" />
      </form>

      {next && nextDoc && (
        <div className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Next appointment</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar doctor={nextDoc} size={48} />
            <div className="flex-1">
              <p className="font-bold">{nextDoc.name}</p>
              <p className="text-xs opacity-80">{nextDoc.specialty}</p>
            </div>
            {next.type === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary-foreground/15 px-4 py-3 text-sm">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{next.date === todayISO() ? "Today" : next.date} · {next.time}</span>
            <button onClick={() => go({ name: "call", appointmentId: next.id })} className="rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">Join</button>
          </div>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Specialties</h2>
          <button onClick={() => go({ name: "doctors" })} className="text-xs font-bold text-primary">See all</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SPECIALTIES.map((s) => {
            const I = ICONS[s.icon];
            return (
              <button key={s.name} onClick={() => go({ name: "doctors", specialty: s.name })} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><I className="h-5 w-5" /></span>
                <span className="text-[11px] font-semibold">{s.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {upcomingDose && (
        <Card onClick={() => go({ name: "meds" })} className="flex items-center gap-3 bg-accent-soft">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground"><Pill className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Next dose · {upcomingDose.t}</p>
            <p className="text-sm font-bold">{upcomingDose.m.name}</p>
          </div>
          <span className="text-xs font-bold text-accent">{upcomingDose.m.dose}</span>
        </Card>
      )}

      <section>
        <h2 className="mb-3 font-bold">Top doctors</h2>
        <div className="space-y-3">
          {doctors.slice(0, 3).map((d) => <DoctorRow key={d.id} id={d.id} />)}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card onClick={() => go({ name: "records" })}><FileText className="h-5 w-5 text-primary" /><p className="mt-2 text-sm font-bold">Health records</p><p className="text-xs text-muted-foreground">Labs & files</p></Card>
        <Card onClick={() => go({ name: "chats" })}><MessageCircle className="h-5 w-5 text-primary" /><p className="mt-2 text-sm font-bold">Messages</p><p className="text-xs text-muted-foreground">Ask your doctor</p></Card>
      </div>
    </div>
  );
}

function DoctorRow({ id }: { id: string }) {
  const { doctors, go } = useTele();
  const d = doctors.find((x) => x.id === id)!;
  return (
    <Card onClick={() => go({ name: "doctor", id })} className="flex items-center gap-3">
      <Avatar doctor={d} size={60} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-bold">{d.name}<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" /></p>
        <p className="text-xs text-muted-foreground">{d.specialty} · {d.years} yrs</p>
        <div className="mt-1 flex items-center gap-2"><Stars value={d.rating} size={12} /><span className="text-[11px] text-muted-foreground">{d.rating.toFixed(1)}</span></div>
      </div>
      <span className="text-xs font-bold text-primary">{formatKES(d.fee)}</span>
    </Card>
  );
}

export function Doctors({ specialty }: { specialty?: string | undefined }) {
  const { doctors } = useTele();
  const [filter, setFilter] = useState(SPECIALTIES.some((s) => s.name === specialty) ? specialty! : "All");
  const [q, setQ] = useState(SPECIALTIES.some((s) => s.name === specialty) ? "" : specialty ?? "");
  const list = doctors.filter((d) => (filter === "All" || d.specialty === filter) && (d.name + d.specialty + d.bio).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="pb-6">
      <Header title="Find a doctor" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. rash, chest pain, child fever" className="h-12 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        {["All", ...SPECIALTIES.map((s) => s.name)].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-bold", filter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card")}>{s}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3 px-5">
        {list.map((d) => <DoctorRow key={d.id} id={d.id} />)}
        {!list.length && <p className="py-10 text-center text-sm text-muted-foreground">No doctors match your search.</p>}
      </div>
    </div>
  );
}

export function DoctorProfile({ id }: { id: string }) {
  const { doctors, go } = useTele();
  const d = doctors.find((x) => x.id === id)!;
  return (
    <div className="flex min-h-full flex-col">
      <Header title="Doctor" />
      <div className="flex-1 space-y-5 px-5 pb-28">
        <div className="flex flex-col items-center text-center">
          <Avatar doctor={d} size={120} />
          <h2 className="mt-4 flex items-center gap-1 text-xl font-bold">{d.name}<ShieldCheck className="h-5 w-5 text-success" /></h2>
          <p className="text-sm text-muted-foreground">{d.specialty}</p>
          <span className="mt-2 rounded-full bg-success-soft px-3 py-1 text-[11px] font-bold text-success">Licensed · {d.license}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[["Experience", `${d.years} yrs`], ["Rating", d.rating.toFixed(1)], ["Reviews", String(d.reviews.length)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-card p-3 shadow-card"><p className="font-display text-lg font-bold text-primary">{v}</p><p className="text-[11px] text-muted-foreground">{k}</p></div>
          ))}
        </div>
        <div><h3 className="mb-1 font-bold">About</h3><p className="text-sm text-muted-foreground">{d.bio}</p><p className="mt-2 text-xs text-muted-foreground">Speaks: {d.languages.join(", ")}</p></div>
        <div>
          <h3 className="mb-2 font-bold">Reviews</h3>
          <div className="space-y-2">
            {d.reviews.length ? d.reviews.map((r, i) => (
              <Card key={i} className="p-3"><div className="flex items-center justify-between"><p className="text-sm font-bold">{r.author}</p><Stars value={r.rating} size={12} /></div><p className="mt-1 text-xs text-muted-foreground">{r.text}</p></Card>
            )) : <p className="text-xs text-muted-foreground">No reviews yet.</p>}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 flex items-center gap-3 border-t bg-background/95 px-5 py-4 backdrop-blur">
        <div><p className="text-[11px] text-muted-foreground">Consultation</p><p className="font-display font-bold">{formatKES(d.fee)}</p></div>
        <Btn variant="soft" className="w-12 px-0" onClick={() => go({ name: "chat", doctorId: d.id })} aria-label="Message"><MessageCircle className="h-5 w-5" /></Btn>
        <Btn className="flex-1" onClick={() => go({ name: "book", id: d.id })}>Book appointment</Btn>
      </div>
    </div>
  );
}

export function Book({ id }: { id: string }) {
  const { doctors, patientName, appointments, go } = useTele();
  const d = doctors.find((x) => x.id === id)!;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => todayISO(i)), []);
  const [date, setDate] = useState<string>(days[0]!);
  const [time, setTime] = useState("");
  const [type, setType] = useState<CallType>("video");
  const [reason, setReason] = useState("");
  const taken = appointments.filter((a) => a.doctorId === id && a.date === date).map((a) => a.time);
  const now = new Date().toTimeString().slice(0, 5);
  return (
    <div className="flex min-h-full flex-col">
      <Header title="Book appointment" />
      <div className="flex-1 space-y-5 px-5 pb-28">
        <Card className="flex items-center gap-3"><Avatar doctor={d} size={48} /><div><p className="text-sm font-bold">{d.name}</p><p className="text-xs text-muted-foreground">{d.specialty}</p></div></Card>
        <div>
          <h3 className="mb-2 text-sm font-bold">Date</h3>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {days.map((iso) => {
              const dt = new Date(iso);
              return (
                <button key={iso} onClick={() => { setDate(iso); setTime(""); }} className={cn("flex w-14 shrink-0 flex-col items-center rounded-2xl py-3", date === iso ? "bg-primary text-primary-foreground" : "bg-card shadow-card")}>
                  <span className="text-[10px] uppercase opacity-70">{dt.toLocaleDateString("en", { weekday: "short" })}</span>
                  <span className="font-display text-lg font-bold">{dt.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">Time</h3>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((t) => {
              const off = taken.includes(t) || (date === days[0] && t < now);
              return <button key={t} disabled={off} onClick={() => setTime(t)} className={cn("rounded-xl py-2.5 text-xs font-bold", time === t ? "bg-primary text-primary-foreground" : "bg-card shadow-card", off && "line-through opacity-40")}>{t}</button>;
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">Consultation type</h3>
          <div className="grid grid-cols-2 gap-3">
            {([["video", Video, "Video call"], ["voice", Phone, "Voice call"]] as const).map(([k, I, l]) => (
              <button key={k} onClick={() => setType(k)} className={cn("flex items-center gap-2 rounded-2xl p-4 text-sm font-bold", type === k ? "bg-primary-soft text-primary ring-2 ring-primary" : "bg-card shadow-card")}><I className="h-5 w-5" />{l}</button>
            ))}
          </div>
        </div>
        <Field label="What's bothering you?"><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Describe your symptoms" className={cn(inputCls, "h-auto py-3")} /></Field>
      </div>
      <div className="sticky bottom-0 border-t bg-background/95 px-5 py-4 backdrop-blur">
        <Btn className="w-full" disabled={!time || !reason.trim()} onClick={() => go({ name: "pay", appointment: { id: `a${Date.now()}`, doctorId: id, patient: patientName, date, time, type, reason, status: "upcoming", paid: false } })}>
          Continue to payment · {formatKES(d.fee)}
        </Btn>
      </div>
    </div>
  );
}

export function Pay({ appointment }: { appointment: Appointment }) {
  const { doctors, set, go } = useTele();
  const d = doctors.find((x) => x.id === appointment.doctorId)!;
  const [method, setMethod] = useState<"mpesa" | "card">("mpesa");
  const [phone, setPhone] = useState("0712 345 678");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const pay = () => {
    setBusy(true);
    setTimeout(() => {
      set((s) => ({ appointments: [...s.appointments, { ...appointment, paid: true }] }));
      setBusy(false); setDone(true);
    }, 1600);
  };
  if (done) return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-success-soft text-success"><Check className="h-12 w-12" /></div>
      <h2 className="mt-6 text-2xl font-bold">You're booked!</h2>
      <p className="mt-2 text-sm text-muted-foreground">{d.name} will call you by {appointment.type} on {appointment.date} at {appointment.time}. We'll remind you 10 minutes before.</p>
      <Btn className="mt-8 w-full" onClick={() => go({ name: "appointments" })}>View appointments</Btn>
    </div>
  );
  return (
    <div className="flex min-h-full flex-col">
      <Header title="Payment" />
      <div className="flex-1 space-y-4 px-5">
        <Card>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Consultation</span><span>{formatKES(d.fee)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Service fee</span><span>{formatKES(50)}</span></div>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total</span><span>{formatKES(d.fee + 50)}</span></div>
        </Card>
        {([["mpesa", Smartphone, "M-Pesa", "Pay via STK push"], ["card", CreditCard, "Card", "Visa / Mastercard"]] as const).map(([k, I, l, s]) => (
          <button key={k} onClick={() => setMethod(k)} className={cn("flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-card", method === k && "ring-2 ring-primary")}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><I className="h-5 w-5" /></span>
            <div className="flex-1"><p className="text-sm font-bold">{l}</p><p className="text-xs text-muted-foreground">{s}</p></div>
            <span className={cn("h-5 w-5 rounded-full border-2", method === k ? "border-[6px] border-primary" : "border-border")} />
          </button>
        ))}
        {method === "mpesa" ? (
          <Field label="M-Pesa phone number"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
        ) : (
          <div className="space-y-3">
            <input placeholder="Card number" defaultValue="4242 4242 4242 4242" className={inputCls} />
            <div className="grid grid-cols-2 gap-3"><input placeholder="MM/YY" defaultValue="12/28" className={inputCls} /><input placeholder="CVC" defaultValue="123" className={inputCls} /></div>
          </div>
        )}
        <p className="text-center text-[11px] text-muted-foreground">Demo mode — no real money is charged.</p>
      </div>
      <div className="p-5"><Btn className="w-full" disabled={busy} onClick={pay}>{busy ? "Processing…" : `Pay ${formatKES(d.fee + 50)}`}</Btn></div>
    </div>
  );
}

export function Appointments() {
  const { appointments, doctors, prescriptions, go } = useTele();
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const list = appointments.filter((a) => a.status === tab).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) * (tab === "upcoming" ? 1 : -1));
  return (
    <div className="space-y-4 px-5 pb-6 pt-2">
      <h1 className="text-xl font-bold">Appointments</h1>
      <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
        {(["upcoming", "completed"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-xl py-2 text-sm font-bold capitalize", tab === t ? "bg-card shadow-card" : "text-muted-foreground")}>{t}</button>)}
      </div>
      {list.map((a) => {
        const d = doctors.find((x) => x.id === a.doctorId)!;
        const rx = prescriptions.find((p) => p.appointmentId === a.id);
        return (
          <Card key={a.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar doctor={d} size={48} />
              <div className="flex-1"><p className="text-sm font-bold">{d.name}</p><p className="text-xs text-muted-foreground">{d.specialty}</p></div>
              <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold capitalize text-primary">{a.type === "video" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}{a.type}</span>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{a.date === todayISO() ? "Today" : a.date} · {a.time}</p>
            <p className="text-xs">{a.reason}</p>
            {tab === "upcoming" ? (
              <div className="grid grid-cols-2 gap-2">
                <Btn variant="soft" className="h-10" onClick={() => go({ name: "chat", doctorId: d.id })}>Message</Btn>
                <Btn className="h-10" onClick={() => go({ name: "call", appointmentId: a.id })}>Join call</Btn>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Btn variant="soft" className="h-10" onClick={() => go(rx ? { name: "meds" } : { name: "chat", doctorId: d.id })}>{rx ? "Prescription" : "Message"}</Btn>
                {a.rated ? <Btn variant="outline" className="h-10" onClick={() => go({ name: "book", id: d.id })}>Book again</Btn> : <Btn variant="accent" className="h-10" onClick={() => go({ name: "rate", appointmentId: a.id })}>Rate visit</Btn>}
              </div>
            )}
          </Card>
        );
      })}
      {!list.length && <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>}
    </div>
  );
}

export function Rate({ appointmentId }: { appointmentId: string }) {
  const { appointments, doctors, patientName, set, go } = useTele();
  const a = appointments.find((x) => x.id === appointmentId)!;
  const d = doctors.find((x) => x.id === a.doctorId)!;
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="flex min-h-full flex-col">
      <Header title="Rate your visit" onBack={() => go({ name: "appointments" })} />
      <div className="flex flex-1 flex-col items-center px-6 text-center">
        <Avatar doctor={d} size={96} />
        <h2 className="mt-4 text-lg font-bold">How was {d.name}?</h2>
        <div className="mt-4"><Stars value={rating} onChange={setRating} size={36} /></div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Share your experience (optional)" className={cn(inputCls, "mt-6 h-auto py-3")} />
      </div>
      <div className="p-5">
        <Btn className="w-full" onClick={() => {
          set((s) => ({
            appointments: s.appointments.map((x) => (x.id === a.id ? { ...x, rated: true } : x)),
            doctors: s.doctors.map((x) => x.id === d.id ? { ...x, reviews: [{ author: patientName.split(" ")[0] ?? "Patient", rating, text: text || "Great consultation." }, ...x.reviews], rating: (x.rating * x.reviews.length + rating) / (x.reviews.length + 1) || rating } : x),
          }));
          toast.success("Thanks for your review!");
          go({ name: "appointments" });
        }}>Submit review</Btn>
      </div>
    </div>
  );
}

export function Meds() {
  const { prescriptions, doctors, set } = useTele();
  const today = todayISO();
  const updateMed = (pid: string, mid: string, fn: (m: Prescription["meds"][number]) => Prescription["meds"][number]) =>
    set((s) => ({ prescriptions: s.prescriptions.map((p) => p.id !== pid ? p : { ...p, meds: p.meds.map((m) => (m.id === mid ? fn(m) : m)) }) }));
  const enableNotifs = async () => {
    if (typeof Notification === "undefined") { toast("Notifications not supported here — in-app alerts will be used."); return; }
    const r = await Notification.requestPermission();
    toast(r === "granted" ? "Phone notifications on" : "We'll remind you inside the app");
  };
  return (
    <div className="space-y-4 px-5 pb-6 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Medications</h1>
        <button onClick={enableNotifs} className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary"><Bell className="h-3.5 w-3.5" />Allow alerts</button>
      </div>
      {!prescriptions.length && <p className="py-10 text-center text-sm text-muted-foreground">Prescriptions from your doctor will appear here.</p>}
      {prescriptions.map((p) => {
        const d = doctors.find((x) => x.id === p.doctorId);
        return (
          <div key={p.id} className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5" />{d?.name} · {p.date} · <span className="font-semibold text-foreground">{p.diagnosis}</span></div>
            {p.meds.map((m) => (
              <Card key={m.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent"><Pill className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dose} · {m.frequency}× daily · {m.days} days</p>
                    {m.notes && <p className="mt-1 text-xs italic text-muted-foreground">{m.notes}</p>}
                  </div>
                  <button onClick={() => updateMed(p.id, m.id, (x) => ({ ...x, reminders: !x.reminders }))} aria-label="Toggle reminders" className={cn("grid h-9 w-9 place-items-center rounded-full", m.reminders ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {m.reminders ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.times.map((t, i) => {
                    const key = `${today} ${t}`;
                    const done = m.taken.includes(key);
                    return (
                      <div key={i} className={cn("flex items-center gap-1 rounded-xl border px-2 py-1", done && "border-success bg-success-soft")}>
                        <input type="time" value={t} onChange={(e) => updateMed(p.id, m.id, (x) => ({ ...x, times: x.times.map((tt, j) => (j === i ? e.target.value : tt)) }))} className="bg-transparent text-xs font-bold outline-none" aria-label="Reminder time" />
                        <button onClick={() => updateMed(p.id, m.id, (x) => ({ ...x, taken: done ? x.taken.filter((k) => k !== key) : [...x.taken, key] }))} className={cn("grid h-6 w-6 place-items-center rounded-lg", done ? "bg-success text-primary-foreground" : "bg-muted")} aria-label="Mark taken"><Check className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}
type Prescription = import("@/lib/tele/data").Prescription;

export function Chats() {
  const { doctors, messages, go } = useTele();
  const ids = Array.from(new Set(messages.map((m) => m.doctorId)));
  return (
    <div className="space-y-3 px-5 pb-6 pt-2">
      <h1 className="text-xl font-bold">Messages</h1>
      {ids.map((id) => {
        const d = doctors.find((x) => x.id === id)!;
        const last = messages.filter((m) => m.doctorId === id).at(-1)!;
        return (
          <Card key={id} onClick={() => go({ name: "chat", doctorId: id })} className="flex items-center gap-3">
            <Avatar doctor={d} size={48} />
            <div className="min-w-0 flex-1"><p className="text-sm font-bold">{d.name}</p><p className="truncate text-xs text-muted-foreground">{last.text}</p></div>
            <span className="text-[10px] text-muted-foreground">{last.at}</span>
          </Card>
        );
      })}
      {!ids.length && <p className="py-10 text-center text-sm text-muted-foreground">Open a doctor's profile to start a conversation.</p>}
    </div>
  );
}

export function Chat({ doctorId }: { doctorId: string }) {
  const { doctors, messages, set } = useTele();
  const d = doctors.find((x) => x.id === doctorId)!;
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const thread = messages.filter((m) => m.doctorId === doctorId);
  const send = () => {
    if (!text.trim()) return;
    const at = new Date().toTimeString().slice(0, 5);
    set((s) => ({ messages: [...s.messages, { id: `m${Date.now()}`, doctorId, from: "patient", text, at }] }));
    setText("");
    setTimeout(() => {
      set((s) => ({ messages: [...s.messages, { id: `m${Date.now()}`, doctorId, from: "doctor", text: "Thanks for the update. I'll review this and we can discuss more during our consultation.", at: new Date().toTimeString().slice(0, 5) }] }));
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1500);
  };
  return (
    <div className="flex h-full flex-col">
      <Header title={d.name} right={<Avatar doctor={d} size={36} />} />
      <div className="flex-1 space-y-2 overflow-y-auto px-5 py-2">
        {thread.map((m) => (
          <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.from === "patient" ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card shadow-card")}>
            {m.text}<p className="mt-1 text-right text-[10px] opacity-60">{m.at}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t bg-background p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className={inputCls} />
        <Btn type="submit" className="w-12 shrink-0 px-0" aria-label="Send"><Send className="h-5 w-5" /></Btn>
      </form>
    </div>
  );
}

export function Records() {
  const { records, set } = useTele();
  const ref = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState("Lab result");
  return (
    <div className="pb-6">
      <Header title="Health records" />
      <div className="space-y-4 px-5">
        <button onClick={() => ref.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft p-6 text-primary">
          <Upload className="h-7 w-7" /><span className="text-sm font-bold">Upload a file</span><span className="text-xs opacity-80">PDF, photos of lab results, scans</span>
        </button>
        <input ref={ref} type="file" hidden onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return;
          set((s) => ({ records: [{ id: `r${Date.now()}`, name: f.name, kind, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, date: todayISO() }, ...s.records] }));
          toast.success("Uploaded — shared with your doctors");
          e.target.value = "";
        }} />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["Lab result", "Imaging", "Prescription", "Insurance", "Other"].map((k) => <button key={k} onClick={() => setKind(k)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-bold", kind === k ? "bg-primary text-primary-foreground" : "bg-card shadow-card")}>{k}</button>)}
        </div>
        {records.map((r) => (
          <Card key={r.id} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{r.name}</p><p className="text-xs text-muted-foreground">{r.kind} · {r.size} · {r.date}</p></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile() {
  const { patientName, set, go, reset } = useTele();
  return (
    <div className="space-y-4 px-5 pb-6 pt-2">
      <h1 className="text-xl font-bold">Profile</h1>
      <Card className="flex items-center gap-3"><Avatar doctor={{ name: patientName }} size={56} /><div><p className="font-bold">{patientName}</p><p className="text-xs text-muted-foreground">Patient · Nairobi</p></div></Card>
      <Field label="Full name"><input value={patientName} onChange={(e) => set(() => ({ patientName: e.target.value }))} className={inputCls} /></Field>
      <Card onClick={() => go({ name: "records" })} className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><span className="text-sm font-bold">Health records</span></Card>
      <Card onClick={() => { set(() => ({ role: null })); go({ name: "welcome" }); }} className="flex items-center gap-3"><LogOut className="h-5 w-5 text-primary" /><span className="text-sm font-bold">Switch role</span></Card>
      <Card onClick={reset} className="flex items-center gap-3"><RotateCcw className="h-5 w-5 text-destructive" /><span className="text-sm font-bold text-destructive">Reset demo data</span></Card>
    </div>
  );
}
