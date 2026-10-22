import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { PhoneApp } from "@/components/tele/PhoneApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediLink — Telemedicine: book doctors, video calls & prescriptions" },
      { name: "description", content: "Book certified doctors, consult by video or voice, receive prescriptions and set medication reminders." },
      { property: "og:title", content: "MediLink — Telemedicine app" },
      { property: "og:description", content: "Book certified doctors, consult by video or voice and never miss a dose." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-16 px-4 py-4">
      <div className="hidden max-w-sm lg:block">
        <div className="flex items-center gap-2 text-primary"><HeartPulse className="h-6 w-6" /><span className="font-display text-lg font-bold">MediLink</span></div>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight">A doctor in your pocket.</h1>
        <p className="mt-4 text-muted-foreground">Find certified doctors, book a slot, pay with M-Pesa, take the video or voice call, then get prescriptions with smart dose reminders.</p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li>• Try as a patient: book, join call, rate, see meds</li>
          <li>• Try as a doctor: list yourself, call, prescribe</li>
        </ul>
      </div>
      <PhoneApp />
    </main>
  );
}
