"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Float, OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei"
import { motion } from "framer-motion"

function FloatingTorus() {
  return (
    <Float
      speed={2.4}
      rotationIntensity={0.35}
      floatIntensity={0.9}
      floatingRange={[-0.35, 0.35]}
    >
      <mesh castShadow>
        <torusKnotGeometry args={[1, 0.32, 180, 64]} />
        <meshStandardMaterial
          color="#7c3aed"
          metalness={0.3}
          roughness={0.25}
          emissive="#312e81"
          emissiveIntensity={0.65}
        />
      </mesh>
    </Float>
  )
}

function FloatingSphere() {
  return (
    <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.4} floatingRange={[-0.2, 0.2]}>
      <mesh position={[2.4, -0.6, -1]}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.2}
          roughness={0.15}
          emissive="#0f172a"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>
    </Float>
  )
}

function FloatingCapsule() {
  return (
    <Float speed={2} rotationIntensity={0.25} floatIntensity={0.3} floatingRange={[-0.2, 0.2]}>
      <mesh position={[-2.6, 0.8, -0.6]} rotation={[Math.PI / 4, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.4, 1.4, 16, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          metalness={0.4}
          roughness={0.2}
          emissive="#581c87"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  )
}

function SoftGlow() {
  return (
    <pointLight position={[0, 3, 2]} intensity={18} distance={20} color="#60a5fa" />
  )
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
          <color attach="background" args={["#040615"]} />
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={3.2} />
          <SoftGlow />
          <Stars radius={20} depth={40} count={3200} factor={4} fade speed={1.4} />
          <group position={[0, 0.25, 0]}>
            <FloatingTorus />
            <FloatingSphere />
            <FloatingCapsule />
            <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
              <mesh position={[-1.5, -1.2, -1.6]}>
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0ea5e9"
                  emissiveIntensity={1.4}
                  roughness={0.1}
                  metalness={0.1}
                />
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
