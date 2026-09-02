import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useSimulationStore } from '../../store/simulationStore'

interface SeismicBurstEvent {
  id: number
  position: THREE.Vector3
  birthTime: number
  lifetime: number
  size: number
  color: string
}

let eventIdCounter = 0

/**
 * Underground Microseismic fracture emission bursts:
 * Spawns dynamic acoustic waves in the rock strata above the advancing longwall extraction face.
 */
export function MicroseismicEvents() {
  const layers = useSimulationStore((s) => s.layers)
  const readings = useSimulationStore((s) => s.readings)
  const miningFrontProgress = useSimulationStore((s) => s.miningFrontProgress)
  const seismicCluster = useSimulationStore((s) => s.seismicCluster)
  const playing = useSimulationStore((s) => s.playing)
  const stageIndex = useSimulationStore((s) => s.stageIndex)

  const [events, setEvents] = useState<SeismicBurstEvent[]>([])
  const lastSpawnRef = useRef(0)

  useFrame(({ clock }) => {
    if (!playing || stageIndex < 1) return
    const now = clock.elapsedTime

    // Event rate scaling: 2 events/hr up to 35 events/hr
    const rate = readings.seismic
    const spawnInterval = Math.max(0.18, 2.5 / (rate / 3.5))

    // Remove finished bursts
    setEvents((prev) => prev.filter((ev) => now - ev.birthTime < ev.lifetime))

    // Spawn new fracture event
    if (now - lastSpawnRef.current > spawnInterval) {
      lastSpawnRef.current = now

      // Advancing mining front coordinate
      const frontX = 10.5 + miningFrontProgress * 12.5

      let pos: THREE.Vector3
      let color = '#f97316'

      if (seismicCluster && Math.random() < 0.75) {
        // High-density fracture cluster directly in roof above shearer
        pos = new THREE.Vector3(
          frontX + (Math.random() - 0.5) * 3.5,
          -7.2 + (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 6.5
        )
        color = '#ef4444'
      } else {
        // Diffuse strata load redistribution events
        pos = new THREE.Vector3(
          7.0 + Math.random() * 14.0,
          -6.8 + (Math.random() - 0.5) * 3.2,
          (Math.random() - 0.5) * 8.0
        )
      }

      const newEvent: SeismicBurstEvent = {
        id: eventIdCounter++,
        position: pos,
        birthTime: now,
        lifetime: 1.2 + Math.random() * 0.8,
        size: 0.25 + (rate / 35) * 0.45,
        color,
      }

      setEvents((prev) => [...prev.slice(-35), newEvent])
    }
  })

  if (!layers.seismic) return null

  return (
    <group>
      {events.map((ev) => (
        <SeismicWaveBurst key={ev.id} event={ev} />
      ))}
    </group>
  )
}

function SeismicWaveBurst({ event }: { event: SeismicBurstEvent }) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const age = clock.elapsedTime - event.birthTime
    const progress = Math.min(age / event.lifetime, 1.0)
    const fade = 1.0 - progress

    if (sphereRef.current) {
      const scale = event.size * (1 + progress * 1.5)
      sphereRef.current.scale.setScalar(scale)
      const mat = sphereRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = fade * 0.85
    }

    if (ringRef.current) {
      const ringScale = 0.5 + progress * 2.8
      ringRef.current.scale.setScalar(ringScale)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = fade * 0.55
    }
  })

  return (
    <group position={event.position}>
      {/* 1. Core Fracture Flash */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color={event.color} transparent opacity={0.8} />
      </mesh>

      {/* 2. Expanding Acoustic Wavefront Ring */}
      <mesh ref={ringRef} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
        <ringGeometry args={[0.6, 0.75, 20]} />
        <meshBasicMaterial
          color={event.color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
