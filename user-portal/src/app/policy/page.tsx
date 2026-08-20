import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PolicyPage() {
  return (
    <main className="min-h-screen bg-[#071029] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#7898bf]/15 bg-[#101a3a]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-10">
        <Link href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c5d7ee] hover:text-white">
          <ArrowLeft size={16} /> Back to registration
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7898bf]/15 text-[#c5d7ee]"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a9c0dd]/70">Broadcast360</p>
            <h1 className="mt-1 text-3xl font-bold">Acceptable Use & Privacy Policy</h1>
          </div>
        </div>
        <p className="mt-8 text-sm leading-7 text-slate-300">By creating and using a Broadcast360 account, you agree to use the service lawfully, protect your account credentials, and provide accurate account information.</p>
        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-300">
          <section><h2 className="text-lg font-semibold text-white">Account responsibility</h2><p className="mt-2">You are responsible for keeping your Gmail address and password secure. Do not share access or attempt to access another person&apos;s account.</p></section>
          <section><h2 className="text-lg font-semibold text-white">Content and service use</h2><p className="mt-2">Use Broadcast360 only for lawful viewing and account activity. Do not upload, distribute, or access content in a way that violates applicable law or the rights of others.</p></section>
          <section><h2 className="text-lg font-semibold text-white">Data and communications</h2><p className="mt-2">We use account details, verification codes, login activity, and viewing activity to operate, secure, and improve the service. Verification emails may be sent to your Gmail address.</p></section>
          <section><h2 className="text-lg font-semibold text-white">Account status</h2><p className="mt-2">Accounts may become inactive after a prolonged period without login, and support review may be required for reactivation. We may restrict abusive or unsafe activity.</p></section>
          <section><h2 className="text-lg font-semibold text-white">Contact</h2><p className="mt-2">For account questions or reactivation requests, use the Support area in Broadcast360.</p></section>
        </div>
        <div className="mt-10 rounded-2xl border border-[#7898bf]/15 bg-[#0b1636]/65 p-4 text-xs leading-6 text-slate-400">Policy version: August 2026. This page is provided as the current Broadcast360 service policy and may be updated as the service evolves.</div>
      </div>
    </main>
  );
}
