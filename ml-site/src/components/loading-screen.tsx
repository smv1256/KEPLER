"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="loading-screen"
          className="loading-screen"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
        >
          <motion.div
            className="loading-screen__core"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="loading-screen__orbit">
              <motion.span
                className="loading-screen__planet"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
              />
            </div>
            <p className="loading-screen__eyebrow">Initializing model</p>
            <h2 className="loading-screen__title">KEPLER</h2>
            <motion.div
              className="loading-screen__bar"
              initial={{ scaleX: 0.2, opacity: 0.5 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
