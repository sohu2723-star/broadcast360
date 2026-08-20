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
      <div className="w-full max-w-sm rounded-3xl border border-[#7898bf]/20 bg-[#101a3a]/96 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#7898bf]/15 text-2xl text-[#c5d7ee]">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="mt-6 w-full rounded-2xl border border-[#7898bf]/25 bg-[#284a78] px-4 py-3 text-sm font-bold text-[#eef5ff] transition hover:brightness-110 active:scale-[0.98]"
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
      className="rounded-2xl border border-amber-200/15 bg-amber-100/5 px-4 py-3 text-center text-sm text-amber-100/90"
      role="alert"
    >
      {message}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-amber-100/75">{message}</p> : null;
}

export function authInputClass(hasError: boolean) {
  return `w-full rounded-2xl border bg-[#08122f]/95 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#8eafd4]/70 focus:ring-4 focus:ring-[#7898bf]/10 ${
    hasError ? "border-amber-200/60 bg-amber-100/[0.03]" : "border-white/10"
  }`;
}

export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071029] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#476d9f]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-14rem] h-[32rem] w-[32rem] rounded-full bg-[#7898bf]/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(120,166,220,0.11),transparent_38%)]" />
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

export function GoogleButtonSlot({
  googleButtonRef,
  onClick,
  googleReady = false,
  loading = false,
}: {
  googleButtonRef: React.RefObject<HTMLDivElement | null>;
  onClick?: () => void;
  googleReady?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="relative mx-auto h-11 w-full max-w-[360px] min-w-0 overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={onClick}
        className={`${googleReady ? "pointer-events-none opacity-0" : "opacity-100"} absolute inset-0 z-0 flex w-full min-w-0 items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm`}
        aria-label="Continue with Google"
      >
        <span className="text-lg font-bold leading-none text-[#4285F4]" aria-hidden="true">G</span>
        <span>{loading ? "Opening Google" : "Continue with Google"}</span>
      </button>
      <div
        ref={googleButtonRef}
        className={`${googleReady ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} absolute inset-0 z-10 flex min-w-0 items-center justify-center [&>div]:!mx-auto [&>div]:!h-full [&>div]:!max-w-full [&>div]:!w-full [&_iframe]:!h-full [&_iframe]:!max-w-full [&_iframe]:!w-full`}
        aria-label="Continue with Google"
      />
    </div>
  );
}
