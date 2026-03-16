
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

class StarMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        time: { value: 0 },
        baseSize: { value: 0.25 },
        flickerSpeed: { value: 2.5 },
      },
      vertexShader: `
        attribute float phase;
        attribute float size;
        varying vec3 vColor;
        varying float vPhase;

        uniform float time;
        uniform float baseSize;
        uniform float flickerSpeed;

        void main() {
          vColor = color;
          vPhase = phase;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float flicker = sin(time * flickerSpeed + phase) * 0.35 + 0.65;
          gl_PointSize = (baseSize * size * flicker) * (140.0 / -mvPosition.z);

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vPhase;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          float alpha = smoothstep(0.42, 0.0, dist) * 0.5;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });
  }
}

export default function Stars() {
  const groupRef = useRef<THREE.Group>(null);
  const material = useMemo(() => new StarMaterial(), []);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const starCount = 1000;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const phases = new Float32Array(starCount);
    const sizes = new Float32Array(starCount);

    const clusters = [
      { center: new THREE.Vector3(2, 0, 3), radius: 12, count: 110 },
      { center: new THREE.Vector3(-6, -3, 4), radius: 10, count: 70 },
    ];

    let index = 0;

    const addStar = (
      pos: THREE.Vector3,
      opts: { size?: number; hue?: "white" | "blue" | "purple" } = {}
    ) => {
      const size = opts.size ?? 1.0;
      const i3 = index * 3;
      positions[i3] = pos.x;
      positions[i3 + 1] = pos.y;
      positions[i3 + 2] = pos.z;

      const colorType = opts.hue
        ? opts.hue
        : Math.random() < 0.12
        ? "blue"
        : Math.random() < 0.12
        ? "purple"
        : "white";

      if (colorType === "white") {
        const white = 0.92 + Math.random() * 0.08;
        colors[i3] = white;
        colors[i3 + 1] = white;
        colors[i3 + 2] = 1.0;
      } else if (colorType === "blue") {
        colors[i3] = 0.8 + Math.random() * 0.1;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 1.0;
      } else {
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.7 + Math.random() * 0.15;
        colors[i3 + 2] = 1.0;
      }

      phases[index] = Math.random() * Math.PI * 2.0;
      sizes[index] = size;
      index += 1;
    };

    clusters.forEach((cluster) => {
      for (let i = 0; i < cluster.count; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * cluster.radius,
          (Math.random() - 0.5) * cluster.radius,
          (Math.random() - 0.5) * cluster.radius
        );
        addStar(cluster.center.clone().add(offset), { size: 0.8 });
      }
    });

    while (index < starCount) {
      const radius = 30 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) + 3
      );
      addStar(pos, { size: 0.85 });
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    return geo;
  }, []);

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  );
}
