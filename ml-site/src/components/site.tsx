"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import LoadingScreen from "./loading-screen";
import Reveal from "./reveal";
import PredictorPanel from "./predictor-panel";

const StarBg = dynamic(() => import("./star-bg"), {
  ssr: false,
});

const stats = [
  { value: "4500+", label: "training data points" },
  { value: "99%", label: "accuracy on the test set with flags" },
  { value: "> 90%", label: "ROC-AUC, with and without flags" },
];

const navSections = [
  { href: "#top", label: "Top" },
  { href: "#about", label: "Project story" },
  { href: "#classifier", label: "Classifier form" },
  { href: "#final-orbit", label: "Final orbit" },
];

const classifierMarkers = [
  {
    label: "Periodic transit dips",
    detail: "As demonstrated here, NASA's Kepler telescope flagged candidates by observing repeating brightness drops in a star's light.",
  },
  {
    label: "Transit depth and shape",
    detail: "How deep and smooth the dip appears separates likely planets from other space objects.",
  },
  {
    label: "False-positive flags",
    detail: "Scientists may have certain insights based on data patterns, which can significantly improve model accuracy.",
  },
];

export default function Site() {
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(() =>
    typeof document !== "undefined" ? !("fonts" in document) : false
  );
  const [introReady, setIntroReady] = useState(false);
  const [transitPhase, setTransitPhase] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#top");

  useEffect(() => {
    const introTimer = window.setTimeout(() => setIntroReady(true), 1200);

    const fontSet = document.fonts;
    if (!fontSet) {
      return () => window.clearTimeout(introTimer);
    }

    fontSet.ready
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true));

    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    const transitTimer = window.setInterval(() => {
      setTransitPhase((current) => (current + 0.006) % 1);
    }, 70);

    return () => window.clearInterval(transitTimer);
  }, []);

  useEffect(() => {
    const sectionElements = navSections
      .map((section) => document.getElementById(section.href.replace("#", "")))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const pageReady = canvasReady && fontsReady && introReady;
  const transitCenter = 0.5;
  const transitDistance = Math.min(
    Math.abs(transitPhase - transitCenter),
    1 - Math.abs(transitPhase - transitCenter)
  );
  const transitStrength = Math.max(0, 1 - transitDistance / 0.14);
  const brightnessDip = 1.1 + transitStrength * 2.3;
  const transitX = 12 + transitPhase * 76;
  const candidateScore = 91 + transitStrength * 6;
  const lightCurvePoints = [
    "0,24",
    "18,24",
    "30,24",
    "40,24",
    "48,24",
    `56,${24 + brightnessDip}`,
    `64,${24 + brightnessDip * 1.45}`,
    `72,${24 + brightnessDip}`,
    "82,24",
    "100,24",
  ].join(" ");

  return (
    <main className="site-shell">
      <LoadingScreen visible={!pageReady} />

      <div className={`scene-layer ${pageReady ? "scene-layer--ready" : ""}`}>
        <StarBg onReady={() => setCanvasReady(true)} />
      </div>

      <div
        className={`pointer-events-auto fixed bottom-4 left-4 z-30 hidden transition-opacity duration-300 sm:block ${
          pageReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`flex items-center overflow-hidden rounded-full border border-white/12 bg-slate-950/70 shadow-[0_14px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl transition-all duration-300 ease-out ${
            menuOpen ? "w-[24rem] max-w-[calc(100vw-3rem)] pl-1.5 pr-4" : "w-12"
          }`}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className=" hover:cursor-pointer relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          >
            <span
              className={`absolute h-[2px] w-4 rounded-full bg-white transition-all duration-300 ease-out ${
                menuOpen ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              className={`absolute h-[2px] w-4 rounded-full bg-white transition-all duration-300 ease-out ${
                menuOpen ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>

          <nav
            aria-label="Section navigation"
            className={`flex min-w-0 items-center gap-4 whitespace-nowrap transition-all duration-300 ease-out ${
              menuOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-3 opacity-0"
            }`}
          >
            {navSections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                onClick={() => setMenuOpen(false)}
                className={`text-[13px] transition-colors duration-300 ease-out hover:!text-cyan-300 ${
                  activeSection === section.href ? "!text-[#5c8cff]" : "text-white"
                }`}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className={`content-layer ${pageReady ? "content-layer--ready" : ""}`}>
        <section id="top" className="grid-shell min-h-screen px-4 pb-20 pt-6 sm:px-6 sm:pb-28 sm:pt-8">
          <div className="glow-pill inline-flex items-center gap-3 rounded-full px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(133,226,255,1)]" />
            KEPLER / Exoplanet classifier
          </div>

          <div className="mt-16 grid items-end gap-14 lg:min-h-[calc(100vh-140px)] lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal className="max-w-3xl">
              <p className="section-label mb-5">Portfolio-ready machine learning interface</p>
              <h1 className="hero-title text-[clamp(4rem,12vw,9rem)] text-white">KEPLER</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                An exoplanet classifier with a cinematic experience. Accurately trained binary ML model
                with fire scroll motions and a sleek prediction interface.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#classifier" className="button-lift rounded-full bg-gradient-to-r from-sky-300 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition">
                  Launch classifier
                </a>
                <a href="#about" className="button-lift rounded-full border border-white/12 bg-black/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/[0.25] hover:bg-white/[0.06]">
                  Explore the project
                </a>
              </div>
            </Reveal>

            <Reveal delayMs={140}>
              <div className="panel rounded-[36px] p-6 sm:p-8">
                <p className="section-label mb-4">Project details</p>
                <div className="space-y-5 text-sm leading-7 text-slate-300 sm:text-base">
                  <p>
                    Tech stack: Next.js, React Three Fiber, and a binary classifier model built with scikit-learn
                    and served on Render. Beginning as a project for the NASA Space Apps Challenge, KEPLER was trained 
                    on the <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank">NASA Kepler Objects of Interest</a> exoplanet 
                    dataset and achieved high performance scores on the test set.
                  </p>
                  <p>
                    Scroll down to navigate the project: check out what exoplanets
                    are, how the model works, and try out your own data!
                  </p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="stat-card rounded-[24px] p-4">
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="about" className="grid-shell px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <div className="panel relative overflow-hidden rounded-[32px] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.1),transparent_24%)]" />

              <div className="relative">
                <div className="max-w-4xl">
                  <p className="section-label mb-3">Project story</p>
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Built to make you feel like an astronaut
                  </h2>
                  <p className="mt-5 text-base leading-8 text-slate-300">
                  Exoplanets—planets that orbit stars beyond our sun—are detected through the faint dimming 
                  they cause as they pass in front of their host stars. KEPLER transforms that process into 
                  an immersive spacewalk, turning a simple machine learning model into something much cooler! 
                  Despite that, it stays faithful to the original method: analyzing stellar light curves for 
                  repeat transit-like dips, then filtering candidates using the same quality flags as the 
                  Kepler Objects of Interest (KOI) dataset. Trained on this data, KEPLER brings real exoplanet 
                  detection into an interactive form.  
                  </p>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-[1.75fr_1.3fr]">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="section-label mb-2">How KOI candidates were found</p>
                        <h3 className="text-xl font-semibold text-white">Transit dips in stellar brightness</h3>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-slate-200">
                        Kepler signal
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-400">
                          <span>Transit simulation</span>
                        </div>
                        <div className="relative mt-5 h-40 overflow-hidden rounded-[20px] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.75),rgba(9,12,30,0.92))]">
                          <div className="absolute inset-y-0 left-[18%] right-[18%] border-x border-dashed border-white/10" />
                          <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-white/10" />
                          <div className="absolute left-[72%] top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.45)_42%,rgba(255,255,255,0.08)_70%,transparent_100%)] shadow-[0_0_36px_rgba(255,255,255,0.25)]" />
                          <div
                            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/40 bg-cyan-200 shadow-[0_0_14px_rgba(125,211,252,0.8)] transition-all duration-100"
                            style={{ left: `${transitX}%` }}
                          />
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate-500">
                            <span>Incoming candidate</span>
                            <span>Star</span>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[20px] border border-white/6 bg-slate-950/40 p-4">
                          <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-400">
                            <span>Brightness curve</span>
                            <span>Dip {brightnessDip.toFixed(2)}%</span>
                          </div>
                          <svg viewBox="0 0 100 48" className="mt-4 h-24 w-full">
                            <line x1="0" y1="24" x2="100" y2="24" stroke="rgba(50, 115, 205, 0.18)" strokeWidth="0.8" />
                            <polyline
                              fill="none"
                              stroke="rgba(103,232,249,0.95)"
                              strokeWidth="2.2"
                              points={lightCurvePoints}
                            />
                            <circle
                              cx={64}
                              cy={24 + brightnessDip * 1.45}
                              r={2.7 + transitStrength * 1.2}
                              fill="rgba(186,230,253,0.95)"
                            />
                          </svg>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            Notice how the star&apos;s brightness lowers regularly. This is the idea behind KOI: repeated 
                            dips in brightness identify objects as planet candidates, or potential exoplanets.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                          <p className="section-label mb-2">Candidate score</p>
                          <p className="text-3xl font-semibold text-white">{candidateScore.toFixed(2)}%</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            The signal strengthens when the object crosses the star during its transit.
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                          <p className="section-label mb-3">Why it matters</p>
                          <p className="text-sm leading-7 text-slate-300">
                            KEPLER builds on KOI features, then adds false-positive flags so
                            predictions are based on the light curve and other candidate information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="section-label mb-2">Key markers</p>
                    <h3 className="text-xl font-semibold text-white">What makes a candidate look planetary</h3>
                    <div className="mt-5 space-y-3">
                      {classifierMarkers.map((marker) => (
                        <div key={marker.label} className="rounded-[22px] border border-white/8 bg-slate-950/35 p-4">
                          <div className="flex items-start gap-3">
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
                                {marker.label}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-slate-400">{marker.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="classifier" className="grid-shell px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <PredictorPanel />
          </Reveal>
        </section>

        <section id="final-orbit" className="grid-shell px-4 pb-20 pt-6 sm:px-6 sm:pb-28">
          <Reveal>
            <div className="panel rounded-[34px] px-6 py-10 text-center sm:px-10">
              <p className="section-label mb-3">Blast off!</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Mission log: signing off
              </h2>
              <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-slate-300">
                This was a fun project of mine to turn a simple model into something more memorable. Check out 
                the <a href="https://github.com/smv1256/KEPLER" target="_blank">source code here on GitHub</a>. If you want to see more projects like this, 
                or if you have any feedback on KEPLER, feel free to reach out on <a href="https://www.linkedin.com/in/smv1256/" target="_blank">LinkedIn</a>!
              </p>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
