"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Planet from "./planet";
import Stars from "./stars";

function Scene({ lowPower = false }: { lowPower?: boolean }) {
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    const updateViewportHeight = (force = false) => {
      const nextHeight = window.innerHeight;
      const widthChanged = Math.abs(window.innerWidth - lastWidthRef.current) > 40;
      const heightChanged = Math.abs(nextHeight - viewportHeightRef.current);

      if (
        force ||
        viewportHeightRef.current === 0 ||
        widthChanged ||
        heightChanged > 160
      ) {
        viewportHeightRef.current = nextHeight;
        lastWidthRef.current = window.innerWidth;
      }
    };

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight = viewportHeightRef.current || window.innerHeight;
      const total = Math.max(docHeight - viewportHeight, 1);
      targetScrollRef.current = THREE.MathUtils.clamp(window.scrollY / total, 0, 1);
    };

    const onResize = () => {
      updateViewportHeight(lowPower);
      onScroll();
    };

    updateViewportHeight(true);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [lowPower]);

  const scroll = scrollRef.current;

  useFrame((state) => {
    scrollRef.current = THREE.MathUtils.lerp(
      scrollRef.current,
      targetScrollRef.current,
      lowPower ? 0.08 : 0.11
    );

    const currentScroll = scrollRef.current;
    const cameraLerp = lowPower ? 0.028 : 0.04;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, currentScroll * 1.5 - 0.3, cameraLerp);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -currentScroll * 1.4, cameraLerp);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 5.2 - currentScroll * 1.1, cameraLerp);
    
    state.camera.lookAt(0.15 + currentScroll * 0.3, 0.1 - currentScroll * 0.2, 0);
});

  return (
    <>
      <fog attach="fog" args={["#04030b", 9, 20]} />
      <ambientLight intensity={lowPower ? 0.52 : 0.6} color="#88aaff" />
      <directionalLight position={[3, 2, 4]} intensity={lowPower ? 1.1 : 1.4} color="#9bd8ff" />
      {!lowPower ? <pointLight position={[-5, -3, -2]} intensity={1.8} color="#8f73ff" /> : null}
      <Stars scroll={scroll} lowPower={lowPower} />
      <Planet scroll={scroll} lowPower={lowPower} />
    </>
  );
}

export default function StarBg({ onReady }: { onReady?: () => void }) {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (pointer: coarse), (prefers-reduced-motion: reduce)"
    );

    const updateMode = () => {
      const hasLowMemory =
        "deviceMemory" in navigator &&
        typeof navigator.deviceMemory === "number" &&
        navigator.deviceMemory <= 4;

      setLowPower(mediaQuery.matches || hasLowMemory);
    };

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  return (
    <Canvas
      className="h-full w-full"
      dpr={lowPower ? [0.7, 1] : [1, 1.5]}
      gl={{ alpha: true, antialias: !lowPower, powerPreference: lowPower ? "low-power" : "high-performance" }}
      camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 100 }}
      onCreated={() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.setTimeout(() => onReady?.(), 180);
          });
        });
      }}
    >
      <Scene lowPower={lowPower} />
    </Canvas>
  );
}
