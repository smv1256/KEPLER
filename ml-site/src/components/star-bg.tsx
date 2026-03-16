"use client"

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Nebula from "./nebula";
import Stars from "./stars";
import Planet from "./planet";

export default function StarBG () {
  return (
    <Canvas className="bg-black w-screen h-screen" camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 200 }} >
        <directionalLight position={[-1, 2, 1]} intensity={3} />
        <Environment preset="night" />
        <Stars />
        <Nebula />
        <Planet />
    </Canvas>
  );
}