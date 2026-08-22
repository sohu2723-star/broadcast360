"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { FieldError } from "./AuthUi";

declare global {
  interface Window {
    turnstile?: {
      ready?: (callback: () => void) => void;
      render: (container: HTMLElement, options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact" | "flexible";
        retry?: "auto" | "never";
        "retry-interval"?: number;
        "refresh-expired"?: "auto" | "manual" | "never";
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "timeout-callback"?: () => void;
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

type WidgetStatus = "loading" | "ready" | "error";

export default function TurnstileWidget({ token, error, onChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<WidgetStatus>("loading");
  const [widgetError, setWidgetError] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !window.turnstile || !containerRef.current || widgetIdRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      try {
        setStatus("loading");
        setWidgetError("");
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          retry: "auto",
          "retry-interval": 8000,
          "refresh-expired": "auto",
          callback: (value) => {
            onChangeRef.current(value);
            setWidgetError("");
            setStatus("ready");
          },
          "expired-callback": () => {
            onChangeRef.current("");
            setStatus("loading");
          },
          "timeout-callback": () => {
            onChangeRef.current("");
            setWidgetError("The security check timed out. Please try again.");
            setStatus("error");
          },
          "error-callback": () => {
            onChangeRef.current("");
            setWidgetError("Cloudflare security could not connect. Please try again.");
            setStatus("error");
          },
        });

        // A blocked challenge can create only the hidden response input and no
        // visible iframe. Surface a retry state instead of leaving a blank box.
        window.setTimeout(() => {
          if (!containerRef.current || widgetIdRef.current === null) return;
          if (!containerRef.current.querySelector("iframe")) {
            setWidgetError("Cloudflare security could not connect. Please try again.");
            setStatus("error");
          }
        }, 6000);
      } catch {
        setWidgetError("Cloudflare security could not load. Please try again.");
        setStatus("error");
      }
    };

    let mounted = false;
    const mount = () => {
      if (mounted) return;
      mounted = true;
      renderWidget();
    };
    if (window.turnstile.ready) {
      window.turnstile.ready(mount);
      window.setTimeout(mount, 250);
    } else {
      mount();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [scriptReady, siteKey]);

  function retry() {
    onChangeRef.current("");
    setWidgetError("");
    setStatus("loading");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      return;
    }
    setScriptReady(false);
    window.setTimeout(() => setScriptReady(true), 0);
  }

  if (!siteKey) {
    return (
      <div className="rounded-none border border-amber-200/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-100/90" role="alert">
        Security check is not configured for this environment.
        <FieldError message={error} />
      </div>
    );
  }

  const visibleError = error || widgetError;

  return (
    <div className="rounded-none border border-white/10 bg-[#1f1f1f]/75 p-3 sm:p-4" aria-describedby={visibleError ? "turnstile-error" : undefined}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div>
          <p className="text-sm font-semibold text-white">Security check</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">This site is protected by Cloudflare security.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">Required</span>
      </div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setWidgetError("Cloudflare security could not load. Check your connection and try again.");
          setStatus("error");
        }}
      />
      <div className="flex min-h-[70px] w-full items-center justify-center overflow-hidden">
        <div ref={containerRef} className="turnstile-widget-host flex min-h-[65px] w-full max-w-[300px] min-w-0 items-center justify-center overflow-hidden rounded-none [&_iframe]:!block [&_iframe]:!h-[65px] [&_iframe]:!max-w-full [&_iframe]:!w-full" />
      </div>
      {status === "loading" && !token && !visibleError ? <p className="mt-1 text-center text-xs text-slate-500">Loading security check...</p> : null}
      {visibleError ? (
        <div id="turnstile-error" className="mt-2 flex items-center justify-between gap-3 rounded-none border border-amber-200/15 bg-amber-100/5 px-3 py-2 text-xs text-amber-100/85" role="alert">
          <span>{visibleError}</span>
          <button type="button" onClick={retry} className="shrink-0 font-semibold text-white underline underline-offset-2 hover:text-slate-200">Try again</button>
        </div>
      ) : null}
      {token ? <p className="mt-2 text-xs text-emerald-200/80">Security check completed.</p> : null}
    </div>
  );
}
