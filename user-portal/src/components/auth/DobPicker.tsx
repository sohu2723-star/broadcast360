"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { authInputClass } from "@/components/auth/AuthUi";

type DobPickerProps = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(2024, index, 1),
  ),
);

function toIso(year: number, month: number, day: number) {
  return `${year.toString().padStart(4, "0")}-${(month + 1)
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function parseIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function displayDate(value: string) {
  const parsed = parseIso(value);
  if (!parsed) return "mm / dd / yyyy";
  return `${parsed.month + 1}`.padStart(2, "0") +
    ` / ${parsed.day.toString().padStart(2, "0")}` +
    ` / ${parsed.year}`;
}

export default function DobPicker({ value, onChange, hasError }: DobPickerProps) {
  const today = useMemo(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
  }, []);
  const minimumYear = today.year - 120;
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.year ?? today.year - 18);
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.month);

  useEffect(() => {
    if (!selected) return;
    setViewYear(selected.year);
    setViewMonth(selected.month);
  }, [value]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );
  const years = Array.from(
    { length: today.year - minimumYear + 1 },
    (_, index) => today.year - index,
  );

  function moveMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    if (next.getFullYear() < minimumYear || next > new Date(today.year, today.month, 1)) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function selectDay(day: number) {
    const candidate = new Date(viewYear, viewMonth, day);
    const latest = new Date(today.year, today.month, today.day);
    const earliest = new Date(minimumYear, 0, 1);
    if (candidate > latest || candidate < earliest) return;
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${authInputClass(Boolean(hasError))} flex items-center justify-between text-left`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={hasError || undefined}
      >
        <span className={value ? "text-white" : "text-slate-500"}>{displayDate(value)}</span>
        <CalendarDays size={19} className="text-cyan-200" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-40 rounded-3xl border border-cyan-200/20 bg-[#101b43] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)]" role="dialog" aria-label="Choose date of birth">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => moveMonth(-1)} className="rounded-xl p-2 text-cyan-100 transition hover:bg-white/10" aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <div className="flex min-w-0 gap-2">
              <select value={viewMonth} onChange={(event) => setViewMonth(Number(event.target.value))} className="min-w-0 rounded-xl border border-white/10 bg-[#090f28] px-2 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-200/70">
                {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
              </select>
              <select value={viewYear} onChange={(event) => setViewYear(Number(event.target.value))} className="rounded-xl border border-white/10 bg-[#090f28] px-2 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-200/70">
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => moveMonth(1)} className="rounded-xl p-2 text-cyan-100 transition hover:bg-white/10" aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {WEEKDAYS.map((weekday) => <span key={weekday} className="py-1">{weekday.slice(0, 2)}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} className="h-9" aria-hidden="true" />;
              const iso = toIso(viewYear, viewMonth, day);
              const isSelected = value === iso;
              const date = new Date(viewYear, viewMonth, day);
              const disabled = date > new Date(today.year, today.month, today.day) || date < new Date(minimumYear, 0, 1);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`h-9 rounded-xl text-xs font-semibold transition ${isSelected ? "bg-cyan-300 text-slate-950" : "text-slate-200 hover:bg-blue-500/40"} disabled:cursor-not-allowed disabled:text-slate-700`}
                  aria-label={iso}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">Choose your date of birth. Future dates are disabled.</p>
        </div>
      ) : null}
    </div>
  );
}
