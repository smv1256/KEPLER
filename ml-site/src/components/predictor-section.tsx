"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PredictorField } from "./predictor-fields";
import type {
  FieldSection,
  PredictorValues,
} from "./predictor-config";

export default function PredictorSection({
  section,
  values,
  isOpen,
  onToggle,
  onFieldChange,
}: {
  section: FieldSection;
  values: PredictorValues;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onFieldChange: (name: keyof PredictorValues, value: string) => void;
}) {
  const filled = section.fields.filter((field) => values[field.name] !== "").length;

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-black/20">
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className="button-lift flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
      >
        <div>
          <p className="text-lg font-semibold text-white">{section.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{section.blurb}</p>
        </div>
        <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
          {filled}/{section.fields.length}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key={section.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
              <div className="data-grid">
                {section.fields.map((field) => (
                  <PredictorField
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    onChange={onFieldChange}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
