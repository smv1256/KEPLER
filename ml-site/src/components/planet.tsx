"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

class PlanetMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        colorA: { value: new THREE.Color("#0f093f") },
        colorB: { value: new THREE.Color("#21177b") },
        colorC: { value: new THREE.Color("#464bd9") },
        colorD: { value: new THREE.Color("#22c6f1") },
        colorE: { value: new THREE.Color("#66e9ff") },
      },
      vertexShader: `
        varying vec3 vPos;
        varying vec3 vNormal;

        void main() {
          vPos = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPos;
        varying vec3 vNormal;

        uniform float time;
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform vec3 colorC;
        uniform vec3 colorD;
        uniform vec3 colorE;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 191.3))) * 43758.5453123);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float n000 = hash(i + vec3(0.0, 0.0, 0.0));
          float n100 = hash(i + vec3(1.0, 0.0, 0.0));
          float n010 = hash(i + vec3(0.0, 1.0, 0.0));
          float n110 = hash(i + vec3(1.0, 1.0, 0.0));
          float n001 = hash(i + vec3(0.0, 0.0, 1.0));
          float n101 = hash(i + vec3(1.0, 0.0, 1.0));
          float n011 = hash(i + vec3(0.0, 1.0, 1.0));
          float n111 = hash(i + vec3(1.0, 1.0, 1.0));

          float nx00 = mix(n000, n100, f.x);
          float nx10 = mix(n010, n110, f.x);
          float nx01 = mix(n001, n101, f.x);
          float nx11 = mix(n011, n111, f.x);
          float nxy0 = mix(nx00, nx10, f.y);
          float nxy1 = mix(nx01, nx11, f.y);
          return mix(nxy0, nxy1, f.z);
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p);
            p *= 1.8;
            amplitude *= 0.55;
          }
          return value;
        }

        void main() {
          vec3 p = vPos * 1.53;
          float swirlBase = fbm(vec3(vPos.x * 2.2, vPos.y * 2.6 + time * 0.03, vPos.z * 2.2));
          float ribbons = sin((vPos.y + swirlBase * 0.65) * 15.0 + vPos.x * 2.8);
          float ribbons2 = sin((vPos.y - swirlBase * 0.35) * 23.0 - vPos.z * 1.8);
          float marbling = fbm(p * 2.4 + vec3(ribbons * 0.6, ribbons2 * 0.2, 0.0));
          float capNoise = fbm(p * 1.5 + vec3(0.0, time * 0.02, 0.0));
          float polarCap = smoothstep(0.18, 0.82, vPos.y + capNoise * 0.35);
          float bandField = smoothstep(-0.85, 0.95, ribbons * 0.7 + ribbons2 * 0.35 + marbling * 0.9);
          float whirl = smoothstep(0.45, 0.95, marbling + abs(ribbons2) * 0.25);
          float glow = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
          float light = dot(normalize(vNormal), normalize(vec3(-0.28, 0.75, 1.0))) * 0.5 + 0.5;

          vec3 color = mix(colorA, colorB, bandField);
          color = mix(color, colorC, whirl);
          color = mix(color, colorD, smoothstep(0.58, 1.0, polarCap + marbling * 0.2));
          color = mix(color, colorE, smoothstep(0.75, 1.0, polarCap));
          color *= 0.46 + light * 0.74;
          color += colorD * glow * 0.14;
          color = mix(color, floor(color * 7.0) / 7.0, 0.28);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }
}

class RingMaterial extends THREE.ShaderMaterial {
  constructor(opacity: number, showFrontHalf: boolean) {
    super({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        opacityScale: { value: opacity },
        frontHalf: { value: showFrontHalf ? 1 : 0 },
        colorA: { value: new THREE.Color("#464bd9") },
        colorB: { value: new THREE.Color("#22c6f1") },
        colorC: { value: new THREE.Color("#66e9ff") },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vViewZ;
        varying float vCenterViewZ;

        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewZ = mvPosition.z;
          vCenterViewZ = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vViewZ;
        varying float vCenterViewZ;

        uniform float opacityScale;
        uniform int frontHalf;
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform vec3 colorC;

        float ringBand(float radius, float center, float width) {
          return 1.0 - smoothstep(width, width + 0.012, abs(radius - center));
        }

        void main() {
          bool isFront = vViewZ > vCenterViewZ;
          if ((frontHalf == 1 && !isFront) || (frontHalf == 0 && isFront)) {
            discard;
          }

          vec2 p = vUv - 0.5;
          float radius = length(p) * 1.5;

          float edgeFade = smoothstep(0.28, 0.36, radius) * (1.0 - smoothstep(0.92, 1.0, radius));

          float broadBands =
              ringBand(radius, 0.54, 0.06) * 0.8 +
              ringBand(radius, 0.68, 0.05) * 0.55 +
              ringBand(radius, 0.80, 0.045) * 0.95 +
              ringBand(radius, 0.90, 0.03) * 0.6;

          float fineBands =
              0.5 + 0.5 * sin(radius * 160.0) +
              0.5 + 0.5 * sin(radius * 230.0 + 0.8);

          float density = broadBands * edgeFade;
          float alpha = density * (0.75 + fineBands * 0.18) * opacityScale;

          vec3 color = mix(colorC, colorB, smoothstep(0.35, 0.82, density));
          color = mix(color, colorA, smoothstep(0.72, 1.0, density));

          if (alpha < 0.01) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }
}

export default function Planet({
  scrollRef,
  lowPower = false,
}: {
  scrollRef: React.RefObject<number>;
  lowPower?: boolean;
}) {
  const ref = useRef<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Mesh<THREE.SphereGeometry, PlanetMaterial> | null>(
    null
  );
  const [material] = useState(() => new PlanetMaterial());
  const ringGeometry = useMemo(
    () => new THREE.RingGeometry(2.5, 3.45, lowPower ? 96 : 220),
    [lowPower]
  );
  const backRingMaterial = useMemo(() => new RingMaterial(0.42, false), []);
  const frontRingMaterial = useMemo(() => new RingMaterial(0.88, true), []);

  useFrame((state) => {
    if (!ref.current || !meshRef.current) return;
    const scroll = scrollRef.current ?? 0;

    meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    ref.current.rotation.y += lowPower ? 0.001 : 0.0017;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * (lowPower ? 0.12 : 0.18)) * 0.05;
    ref.current.position.x = THREE.MathUtils.lerp(
      ref.current.position.x,
      lowPower ? 1.6 - scroll * 1.15 : 1.9 - scroll * 2.75,
      0.05
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      lowPower ? 0.62 - scroll * 1.35 : 0.7 - scroll * 3.2,
      0.05
    );
    ref.current.position.z = THREE.MathUtils.lerp(
      ref.current.position.z,
      lowPower ? -0.2 + scroll * 0.24 : -0.3 + scroll * 0.8,
      0.05
    );
  });

  return (
    <group ref={ref} position={[1.9, 0.7, -0.3]}>
      <mesh
        geometry={ringGeometry}
        material={backRingMaterial}
        rotation={[1.01, 0.28, 0.14]}
        scale={lowPower ? [0.58, 0.9, 0.58] : [0.6, 0.92, 0.6]}
        renderOrder={0}
      />
      <mesh ref={meshRef} material={material} position={[0, 0.2, 0]} rotation={[-0.5, 0.4, 0]} renderOrder={1}>
        <sphereGeometry args={[1.4, lowPower ? 56 : 128, lowPower ? 56 : 128]} />
      </mesh>
      <mesh
        geometry={ringGeometry}
        material={frontRingMaterial}
        rotation={[1.01, 0.28, 0.14]}
        scale={lowPower ? [0.58, 0.9, 0.58] : [0.6, 0.92, 0.6]}
        renderOrder={2}
      />
    </group>
  );
}
