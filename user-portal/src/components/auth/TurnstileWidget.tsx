"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { FieldError } from "./AuthUi";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact" | "flexible";
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  token: string;
  error?: string;
  onChange: (token: string) => void;
};

export default function TurnstileWidget({ token, error, onChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!ready || !siteKey || !window.turnstile || !containerRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      callback: (value) => onChangeRef.current(value),
      "expired-callback": () => onChangeRef.current(""),
      "error-callback": () => onChangeRef.current(""),
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [ready, siteKey]);

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-amber-200/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-100/90" role="alert">
        Turnstile is not configured for this environment.
        <FieldError message={error} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#7898bf]/20 bg-[#0b1636]/75 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Security check</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">This site is protected by Cloudflare Turnstile.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">Required</span>
      </div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className="flex min-h-[65px] w-full min-w-0 items-center justify-center overflow-hidden rounded-xl [&_iframe]:max-w-full" />
      <FieldError message={error} />
      {token ? <p className="mt-2 text-xs text-emerald-200/80">Security check completed.</p> : null}
    </div>
  );
}
