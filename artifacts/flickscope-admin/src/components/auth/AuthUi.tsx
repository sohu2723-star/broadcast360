export function MoonSpinner({ label = "Authenticating" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-r-white/80 border-t-white"
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

export function AuthTransitionLoader({ label = "Signing you in..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#121212]/88 px-5 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="flex w-full max-w-xs flex-col items-center rounded-3xl border border-white/10 bg-[#1f1f1f]/96 px-7 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <span className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/15 border-r-white/80 border-t-white" aria-hidden="true" />
        <p className="mt-5 text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-slate-400">Please wait a moment</p>
      </div>
    </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]/75 px-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1f1f1f]/96 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl text-white">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="flickscope-primary-action mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold"
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
  return `w-full rounded-2xl border bg-[#171717]/95 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-white/50 focus:ring-4 focus:ring-white/10 ${
    hasError ? "border-amber-200/60 bg-amber-100/[0.03]" : "border-white/10"
  }`;
}

export function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen w-full max-w-[100vw] items-center justify-center overflow-x-hidden overflow-y-auto bg-[#121212] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-white/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-14rem] h-[32rem] w-[32rem] rounded-full bg-white/[0.03] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.06),transparent_38%)]" />
      <div className="relative z-10 w-full min-w-0 max-w-full">{children}</div>
    </main>
  );
}

export function AuthLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-white/85">{children}</label>;
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
    <div data-google-ready={googleReady ? "true" : "false"} className="google-button-shell relative mx-auto h-11 w-full max-w-full min-w-0 overflow-hidden rounded-full">
      <button
        type="button"
        onClick={onClick}
        className={`${googleReady ? "pointer-events-none opacity-0" : "opacity-100"} absolute inset-0 z-0 flex w-full min-w-0 items-center justify-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm`}
        aria-label="Continue with Google"
      >
        <span className="text-lg font-bold leading-none text-[#4285F4]" aria-hidden="true">G</span>
        <span>{loading ? "Opening Google" : "Continue with Google"}</span>
      </button>
      <div
        ref={googleButtonRef}
        className={`${googleReady ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} absolute inset-0 z-10 flex min-w-0 items-center justify-center overflow-hidden rounded-full [&>div]:!mx-auto [&>div]:!h-full [&>div]:!max-w-full [&_iframe]:!block [&_iframe]:!h-full [&_iframe]:!max-w-full`}
        aria-label="Continue with Google"
      />
    </div>
  );
}
