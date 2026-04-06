"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import Planet from "./planet";
import Stars from "./stars";

function Scene() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      setScroll(total > 0 ? window.scrollY / total : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, scroll * 1.5 - 0.3, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -scroll * 1.4, 0.04);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 5.2 - scroll * 1.1, 0.04);
    state.camera.lookAt(0.15 + scroll * 0.3, 0.1 - scroll * 0.2, 0);
  });

  return (
    <>
      <fog attach="fog" args={["#04030b", 9, 20]} />
      <ambientLight intensity={0.6} color="#88aaff" />
      <directionalLight position={[3, 2, 4]} intensity={1.4} color="#9bd8ff" />
      <pointLight position={[-5, -3, -2]} intensity={1.8} color="#8f73ff" />
      <Stars scroll={scroll} />
      <Planet scroll={scroll} />
    </>
  );
}

export default function StarBg({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5.2], fov: 42, near: 0.1, far: 100 }}
      onCreated={() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.setTimeout(() => onReady?.(), 180);
          });
        });
      }}
    >
      <Scene />
    </Canvas>
  );
}
