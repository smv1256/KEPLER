"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createStarsGeometry(starCount: number) {
  const random = createSeededRandom(4242);
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 8 + random() * 36;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = -random() * 24;

    const tint = random();
    if (tint < 0.2) {
      colors[i3] = 0.63;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1;
    } else if (tint < 0.4) {
      colors[i3] = 0.82;
      colors[i3 + 1] = 0.68;
      colors[i3 + 2] = 1;
    } else {
      colors[i3] = 0.92;
      colors[i3 + 1] = 0.95;
      colors[i3 + 2] = 1;
    }
  }

  const next = new THREE.BufferGeometry();
  next.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  next.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return next;
}

export default function Stars({
  scrollRef,
  lowPower = false,
}: {
  scrollRef: React.RefObject<number>;
  lowPower?: boolean;
}) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const [geometry] = useState(() => createStarsGeometry(lowPower ? 700 : 1800));

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: lowPower ? 0.05 : 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: lowPower ? 0.72 : 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [lowPower]
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    const scroll = scrollRef.current ?? 0;
    pointsRef.current.rotation.y = state.clock.elapsedTime * (lowPower ? 0.005 : 0.01);

    if (lowPower) {
      pointsRef.current.rotation.x = -0.04 + Math.sin(state.clock.elapsedTime * 0.08) * 0.01;
      pointsRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.06) * 0.08;
      return;
    }

    pointsRef.current.rotation.x = -0.06 + scroll * 0.22;
    pointsRef.current.position.y = -scroll * 1.8;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
