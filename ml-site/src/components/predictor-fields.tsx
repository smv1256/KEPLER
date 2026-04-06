"use client";

import { motion } from "framer-motion";
import type { FieldConfig, PredictorValues } from "./predictor-config";

function getStepAmount(step?: string) {
  if (!step || step === "any") return 0.1;
  const parsed = Number(step);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.1;
}

function formatSteppedValue(value: number, stepAmount: number) {
  const decimals = `${stepAmount}`.includes(".")
    ? `${stepAmount}`.split(".")[1].length
    : 0;
  return value.toFixed(decimals);
}

export function TooltipLabel({
  label,
  helper,
}: {
  label: string;
  helper: string;
}) {
  return (
    <div className="field-tip">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <span>{label}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-[11px] text-slate-300">
          ?
        </span>
      </div>
      <div className="field-tip__bubble">{helper}</div>
    </div>
  );
}

export function NumberField({
  name,
  value,
  onChange,
  step,
  placeholder,
}: {
  name: keyof PredictorValues;
  value: string;
  onChange: (name: keyof PredictorValues, value: string) => void;
  step?: string;
  placeholder: string;
}) {
  const stepAmount = getStepAmount(step);

  function nudge(direction: 1 | -1) {
    const nextValue =
      value === ""
        ? direction > 0
          ? stepAmount
          : -stepAmount
        : Number(value) + stepAmount * direction;

    onChange(name, formatSteppedValue(nextValue, stepAmount));
  }

  return (
    <div className="relative mt-1">
      <input
        name={name}
        type="number"
        step={step ?? "any"}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        className="number-input w-full rounded-2xl border border-white/8 bg-slate-950/80 px-4 py-3 pr-12 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-300/40"
      />
      <div className="absolute inset-y-0 right-3 flex flex-col justify-center gap-1">
        <button
          type="button"
          aria-label="Increase value"
          onClick={() => nudge(1)}
          className="number-step flex h-2 w-3 items-center justify-center text-white"
        >
          <span className="number-chevron number-chevron--up" />
        </button>
        <button
          type="button"
          aria-label="Decrease value"
          onClick={() => nudge(-1)}
          className="number-step flex h-2 w-3 items-center justify-center text-white"
        >
          <span className="number-chevron number-chevron--down" />
        </button>
      </div>
    </div>
  );
}

export function PredictorField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (name: keyof PredictorValues, value: string) => void;
}) {
  return (
    <label className="rounded-[22px] border border-white/8 bg-slate-950/45 p-4">
      <TooltipLabel label={field.label} helper={field.helper} />
      {field.type === "flag" ? (
        <select
          name={field.name}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="flag-select mt-1 w-full rounded-[1.15rem] bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
        >
          <motion.option value="0">0 - No flag</motion.option>
          <motion.option value="1">1 - Flagged</motion.option>
        </select>
      ) : (
        <NumberField
          name={field.name}
          value={value}
          onChange={onChange}
          step={field.step}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
}
