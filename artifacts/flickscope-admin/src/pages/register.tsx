import { Link } from 'wouter';

import { AuthBackdrop, AuthLabel } from "@/components/auth/AuthUi";

export default function RegisterPage() {
  return (
    <AuthBackdrop>
      <div className="mx-auto w-full max-w-[440px] rounded-[2rem] border border-white/10 bg-[#1f1f1f]/95 p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">FlickScope</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Admin accounts are created by the FlickScope owner. This keeps the Admin workspace restricted to approved Gmail accounts.
        </p>
        <div className="mt-7 rounded-2xl border border-white/10 bg-[#171717]/80 px-4 py-4 text-left">
          <AuthLabel>Need access?</AuthLabel>
          <p className="text-sm leading-6 text-slate-400">
            Contact the system owner to provision an approved Admin account, then return here to sign in.
          </p>
        </div>
        <Link href="/login" className="flickscope-primary-action mt-6 block w-full rounded-2xl px-4 py-3.5 text-sm font-bold">
          Go to Admin Login
        </Link>
      </div>
    </AuthBackdrop>
  );
}
