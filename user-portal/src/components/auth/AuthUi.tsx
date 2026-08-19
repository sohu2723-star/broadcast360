"use client";

export function MoonSpinner({ label = "Authenticating" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-r-cyan-200 border-t-cyan-100"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function AuthNotice({
  title,
  message,
  onDone,
}: {
  title: string;
  message: string;
  onDone?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-3xl border border-cyan-200/20 bg-[#101b43]/95 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300/15 text-2xl text-cyan-100">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-100"
      role="alert"
    >
      {message}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-rose-300">{message}</p> : null;
}

export function authInputClass(hasError: boolean) {
  return `w-full rounded-2xl border bg-[#090f28]/90 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/70 focus:ring-4 focus:ring-cyan-300/10 ${
    hasError ? "border-rose-300/70" : "border-white/10"
  }`;
}

export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050817] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-14rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(37,99,235,0.16),transparent_38%)]" />
      <div className="relative z-10 w-full">{children}</div>
    </main>
  );
}

export function AuthLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-slate-200">{children}</label>;
}

export function GoogleDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
      <span className="h-px flex-1 bg-white/10" />
      <span>or</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function GoogleButtonSlot({ googleButtonRef }: { googleButtonRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="relative h-11 w-full overflow-hidden rounded-2xl">
      <button
        type="button"
        className="absolute inset-0 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
        aria-label="Continue with Google"
      >
        <span className="text-lg font-bold leading-none text-[#4285F4]" aria-hidden="true">G</span>
        <span>Continue with Google</span>
      </button>
      <div
        ref={googleButtonRef}
        className="absolute inset-0 z-10 opacity-0 [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full"
        aria-label="Continue with Google"
      />
    </div>
  );
}
