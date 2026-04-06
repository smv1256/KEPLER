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

  useEffect(() => {
    const readViewportHeight = () => {
      viewportHeightRef.current =
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        window.innerHeight;
    };

    const onScroll = () => {
      const scrollTop =
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        window.scrollY ||
        0;
      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight =
        viewportHeightRef.current ||
        document.documentElement.clientHeight ||
        window.innerHeight;
      const total = Math.max(docHeight - viewportHeight, 1);
      targetScrollRef.current = THREE.MathUtils.clamp(scrollTop / total, 0, 1);
    };

    const onResize = () => {
      readViewportHeight();
      onScroll();
    };

    readViewportHeight();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useFrame((state) => {
    if (lowPower) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, -0.14, 0.028);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -0.08, 0.028);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 5.0, 0.028);
      state.camera.lookAt(0.15, 0.06, 0);
      return;
    }

    scrollRef.current = THREE.MathUtils.lerp(
      scrollRef.current,
      targetScrollRef.current,
      0.11
    );

    const currentScroll = scrollRef.current;
    const cameraLerp = 0.04;
    const cameraX = currentScroll * 1.5 - 0.3;
    const cameraY = -currentScroll * 1.4;
    const cameraZ = 5.2 - currentScroll * 1.1;
    const lookAtX = 0.15 + currentScroll * 0.3;
    const lookAtY = 0.1 - currentScroll * 0.2;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cameraX, cameraLerp);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, cameraY, cameraLerp);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cameraZ, cameraLerp);
    
    state.camera.lookAt(lookAtX, lookAtY, 0);
  });

  return (
    <>
      <fog attach="fog" args={["#04030b", 9, 20]} />
      <ambientLight intensity={lowPower ? 0.52 : 0.6} color="#88aaff" />
      <directionalLight position={[3, 2, 4]} intensity={lowPower ? 1.1 : 1.4} color="#9bd8ff" />
      {!lowPower ? <pointLight position={[-5, -3, -2]} intensity={1.8} color="#8f73ff" /> : null}
      <Stars scrollRef={scrollRef} lowPower={lowPower} />
      <Planet scrollRef={scrollRef} lowPower={lowPower} />
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
