"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { predict } from "../actions/predict";
import {
  emptyValues,
  fieldSections,
  presets,
  type PredictorValues,
} from "./predictor-config";
import PredictorSection from "./predictor-section";

export default function PredictorPanel() {
  const [values, setValues] = useState<PredictorValues>(emptyValues);
  const [result, setResult] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("");
  const [openSections, setOpenSections] = useState<string[]>(["transit"]);
  const [flashResult, setFlashResult] = useState(false);
  const [isPending, startTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement | null>(null);

  const completion = useMemo(() => {
    const filled = Object.values(values).filter((value) => value !== "").length;
    return Math.round((filled / Object.keys(values).length) * 100);
  }, [values]);

  useEffect(() => {
    if (!flashResult) return;
    const timeout = window.setTimeout(() => setFlashResult(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [flashResult]);

  function setField(name: keyof PredictorValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function toggleSection(id: string) {
    setOpenSections((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function applyPreset(name: string, presetValues: PredictorValues) {
    setValues(presetValues);
    setActivePreset(name);
    setResult(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.set(key, value));

    startTransition(async () => {
      const prediction = await predict(formData);
      setResult(prediction);
      setFlashResult(true);
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const progressGradient =
    completion >= 100
      ? "linear-gradient(180deg, #85e2ff 0%, #7b83ff 55%, #c87dff 100%)"
      : "linear-gradient(180deg, #85e2ff 0%, #5c8cff 100%)";

  return (
    <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
      <div className="panel rounded-[32px] p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[64px_minmax(0,1fr)]">
          <div className="hidden lg:flex lg:justify-center">
            <div className="relative h-full min-h-[720px] w-2 rounded-full bg-white/[0.05]">
              <div
                className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-500"
                style={{
                  height: `${Math.max(8, completion)}%`,
                  background: progressGradient,
                  boxShadow:
                    completion >= 100
                      ? "0 0 30px rgba(200, 125, 255, 0.38)"
                      : "0 0 28px rgba(92, 140, 255, 0.34)",
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-label mb-3">Classifier</p>
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Give the model what you have
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  This interface is meant to feel adaptive to whatever data you have on hand, so every field 
                  is optional. Use the collapsible groups below; supply whatever candidate data you have and 
                  see how the model responds. Don&apos;t forget to try out the presets!
                  
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-3 lg:grid-cols-3">
              {presets.map((preset) => {
                const selected = activePreset === preset.name;
                return (
                  <motion.button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.name, preset.values)}
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ y: 0, scale: 0.995 }}
                    className={`button-lift rounded-[24px] border p-4 text-left transition ${
                      selected
                        ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_40px_rgba(93,218,255,0.12)]"
                        : "border-white/8 bg-white/[0.03] hover:border-white/[0.18] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-200/80">
                      {preset.kicker}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-white">{preset.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{preset.note}</p>
                  </motion.button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fieldSections.map((section) => {
                return (
                  <PredictorSection
                    key={section.id}
                    section={section}
                    values={values}
                    isOpen={openSections.includes(section.id)}
                    onToggle={toggleSection}
                    onFieldChange={setField}
                  />
                );
              })}

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setValues(emptyValues);
                      setActivePreset("");
                      setResult(null);
                    }}
                    className="button-lift rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/[0.25] hover:bg-white/[0.06]"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="button-lift rounded-full bg-gradient-to-r from-sky-300 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-70"
                  >
                    {isPending ? "Running prediction..." : "Classify candidate"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <motion.div
          ref={resultRef}
          animate={
            flashResult
              ? {
                  scale: [1, 1.015, 1],
                  boxShadow: [
                    "0 0 0 1px rgba(180, 196, 255, 0.16), 0 32px 100px rgba(2, 4, 12, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    "0 0 0 1px rgba(133, 226, 255, 0.12), 0 30px 100px rgba(36, 72, 170, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    "0 0 0 1px rgba(180, 196, 255, 0.16), 0 32px 100px rgba(2, 4, 12, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  ],
                }
              : undefined
          }
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`panel rounded-[32px] p-6 transition-all duration-500 ${
            flashResult ? "result-glow" : ""
          }`}
        >
          <p className="section-label mb-3">Result</p>
          <h3 className="text-2xl font-semibold text-white">Current output</h3>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Prediction</p>
            {isPending ? (
              <div className="mt-5 flex items-center gap-4 px-4 py-3">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full border border-cyan-200/20"
                    animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.8, 0.35] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(125,211,252,0.8)]"
                    animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ) : null}
            <p
              className={`mt-3 text-3xl font-semibold ${
                result === "Exoplanet" ? "text-cyan-300" : "text-white"
              }`}
            >
              {isPending ? "Waking up the server" : result ?? "Awaiting input"}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {isPending
                ? "Be patient! The first prediction can take up to a minute as the server wakes up."
                : result
                ? "This is what the model thought!"
                : "Submit the form or load a preset and see what the model predicts."}
            </p>
          </div>
        </motion.div>

        <div className="panel rounded-[32px] p-6">
          <p className="section-label mb-3">Methodology</p>
          <p className="text-sm leading-7 text-slate-300">
            KEPLER uses binary classification to evaluate each candidate: it predicts whether the given data 
            most likely represents an exoplanet or not based on patterns in training data. A potential future
            addition is incorporating explainability (XAI) and counterfactual explanations to highlight the most 
            influential features and how small changes in those might alter the outcome.
          </p>
          <div className="aurora-line my-6" />
          <p className="text-sm leading-7 text-slate-300">
            The ML model and site were created by Shriya V. with some AI-accelerated development.
          </p>
        </div>
      </aside>
    </div>
  );
}
