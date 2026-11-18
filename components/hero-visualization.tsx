"use client"

import { Suspense } from "react"
import { Canvas, type ThreeElements } from "@react-three/fiber"
import { Float, OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei"
import { motion } from "framer-motion"

// Three.js-Props als typisierte Konstanten, damit sie per Spread übergeben werden
const torusMeshProps = { castShadow: true } satisfies ThreeElements["mesh"]
const torusGeometryProps = { args: [1, 0.32, 180, 64] } satisfies ThreeElements["torusKnotGeometry"]
const torusMaterialProps = {
  color: "#7c3aed",
  metalness: 0.3,
  roughness: 0.25,
  emissive: "#312e81",
  emissiveIntensity: 0.65,
} satisfies ThreeElements["meshStandardMaterial"]

const sphereMeshProps = { position: [2.4, -0.6, -1] } satisfies ThreeElements["mesh"]
const sphereGeometryProps = { args: [0.6, 1] } satisfies ThreeElements["icosahedronGeometry"]
const sphereMaterialProps = {
  color: "#0ea5e9",
  metalness: 0.2,
  roughness: 0.15,
  emissive: "#0f172a",
  emissiveIntensity: 0.5,
  wireframe: true,
} satisfies ThreeElements["meshStandardMaterial"]

const capsuleMeshProps = {
  position: [-2.6, 0.8, -0.6],
  rotation: [Math.PI / 4, 0, Math.PI / 6],
} satisfies ThreeElements["mesh"]
const capsuleGeometryProps = { args: [0.4, 1.4, 16, 32] } satisfies ThreeElements["capsuleGeometry"]
const capsuleMaterialProps = {
  color: "#a855f7",
  metalness: 0.4,
  roughness: 0.2,
  emissive: "#581c87",
  emissiveIntensity: 0.4,
} satisfies ThreeElements["meshStandardMaterial"]

const glowLightProps = {
  position: [0, 3, 2],
  intensity: 18,
  distance: 20,
  color: "#60a5fa",
} satisfies ThreeElements["pointLight"]

const backgroundColorProps = {
  attach: "background",
  args: ["#040615"],
} satisfies ThreeElements["color"]
const ambientLightProps = { intensity: 0.4 } satisfies ThreeElements["ambientLight"]
const directionalLightProps = {
  position: [5, 5, 5],
  intensity: 3.2,
} satisfies ThreeElements["directionalLight"]
const sceneGroupProps = { position: [0, 0.25, 0] } satisfies ThreeElements["group"]

const orbMeshProps = { position: [-1.5, -1.2, -1.6] } satisfies ThreeElements["mesh"]
const orbGeometryProps = { args: [0.22, 32, 32] } satisfies ThreeElements["sphereGeometry"]
const orbMaterialProps = {
  color: "#38bdf8",
  emissive: "#0ea5e9",
  emissiveIntensity: 1.4,
  roughness: 0.1,
  metalness: 0.1,
} satisfies ThreeElements["meshStandardMaterial"]

function FloatingTorus() {
  return (
    <Float
      speed={2.4}
      rotationIntensity={0.35}
      floatIntensity={0.9}
      floatingRange={[-0.35, 0.35]}
    >
      <mesh {...torusMeshProps}>
        <torusKnotGeometry {...torusGeometryProps} />
        <meshStandardMaterial {...torusMaterialProps} />
      </mesh>
    </Float>
  )
}

function FloatingSphere() {
  return (
    <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.4} floatingRange={[-0.2, 0.2]}>
      <mesh {...sphereMeshProps}>
        <icosahedronGeometry {...sphereGeometryProps} />
        <meshStandardMaterial {...sphereMaterialProps} />
      </mesh>
    </Float>
  )
}

function FloatingCapsule() {
  return (
    <Float speed={2} rotationIntensity={0.25} floatIntensity={0.3} floatingRange={[-0.2, 0.2]}>
      <mesh {...capsuleMeshProps}>
        <capsuleGeometry {...capsuleGeometryProps} />
        <meshStandardMaterial {...capsuleMaterialProps} />
      </mesh>
    </Float>
  )
}

function SoftGlow() {
  return <pointLight {...glowLightProps} />
}

export function HeroVisualization() {
  return (
    <motion.div
      className="relative h-[360px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 shadow-2xl"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.25),_transparent_55%)]" />
      <Suspense
        fallback={<div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-900 to-indigo-900" />}
      >
        <Canvas dpr={[1, 2]} shadows>
          <color {...backgroundColorProps} />
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
          <ambientLight {...ambientLightProps} />
          <directionalLight {...directionalLightProps} />
          <SoftGlow />
          <Stars radius={20} depth={40} count={3200} factor={4} fade speed={1.4} />
          <group {...sceneGroupProps}>
            <FloatingTorus />
            <FloatingSphere />
            <FloatingCapsule />
            <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
              <mesh {...orbMeshProps}>
                <sphereGeometry {...orbGeometryProps} />
                <meshStandardMaterial {...orbMaterialProps} />
              </mesh>
            </Float>
          </group>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />
    </motion.div>
  )
}
