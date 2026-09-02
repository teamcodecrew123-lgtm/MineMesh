import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { useSimulationStore } from '../../store/simulationStore'
import {
  MONITORING_NODES,
  GNSS_STATIONS,
  getNodeReadings,
  getGNSSReadings,
  MonitoringNode,
  GNSSStation,
} from '../../data/sensorLayout'

/**
 * Surface & Underground Monitoring Equipment:
 * 1. Underground Multi-Sensor Monitoring Nodes with Smooth Continuous Gradient Risk Heatmap (Yellow -> Orange -> Red)
 * 2. Surface GNSS Survey Stations
 */
export function Sensors() {
  const layers = useSimulationStore((s) => s.layers)
  const readings = useSimulationStore((s) => s.readings)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId)
  const openNodePanel = useSimulationStore((s) => s.openNodePanel)
  const openGNSSPanel = useSimulationStore((s) => s.openGNSSPanel)

  return (
    <group>
      {/* ── 1. Underground Monitoring Nodes with Smooth Continuous Gradient Heatmaps ── */}
      {layers.nodes &&
        MONITORING_NODES.map((node) => {
          const nodeReadings = getNodeReadings(node, readings)
          const isSelected = selectedNodeId === node.id

          return (
            <UndergroundMonitoringNode
              key={node.id}
              node={node}
              riskPercent={nodeReadings.riskPercent}
              isSelected={isSelected}
              onSelect={() => openNodePanel(node.id)}
            />
          )
        })}

      {/* ── 2. Surface GNSS Survey Stations (GNSS-01 to GNSS-04) on ground ── */}
      {layers.gnss &&
        GNSS_STATIONS.map((station) => {
          const gnssReadings = getGNSSReadings(station, readings)
          const isSelected = selectedGNSSId === station.id

          return (
            <SurfaceGNSSStation
              key={station.id}
              station={station}
              readings={gnssReadings}
              isSelected={isSelected}
              onSelect={() => openGNSSPanel(station.id)}
            />
          )
        })}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// A. Underground Monitoring Node + Smooth Gradient Risk Heatmap
// ─────────────────────────────────────────────────────────────────────────────

interface UndergroundNodeProps {
  node: MonitoringNode
  riskPercent: number
  isSelected: boolean
  onSelect: () => void
}

function UndergroundMonitoringNode({
  node,
  riskPercent,
  isSelected,
  onSelect,
}: UndergroundNodeProps) {
  const groupRef = useRef<THREE.Group>(null)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect()
  }

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group
      ref={groupRef}
      position={[node.position.x, node.position.y, node.position.z]}
      scale={isSelected ? 1.12 : 1.0}
    >
      {/* ── 1. Smooth Continuous Radial Gradient Heatmap (Surrounds Node, Fully Visible) ── */}
      <SmoothNodeRiskHeatmap riskPercent={riskPercent} />

      {/* ── Clickable Hitbox for Underground Node Selection ── */}
      <mesh
        position={[0, 0.45, 0]}
        visible={false}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[1.2, 1.2, 1.8, 10]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ── Industrial Equipment Enclosure (Constant Real Equipment Colors, NEVER tinted red) ── */}
      <group
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        renderOrder={150}
      >
        {/* Steel Mounting Base Plate */}
        <mesh position={[0, 0.03, 0]} castShadow renderOrder={150}>
          <boxGeometry args={[0.7, 0.06, 0.55]} />
          <meshLambertMaterial color={0x334155} />
        </mesh>

        {/* Explosion-Proof Enclosure Box */}
        <mesh position={[0, 0.38, 0]} castShadow renderOrder={151}>
          <boxGeometry args={[0.65, 0.64, 0.46]} />
          <meshLambertMaterial color={isSelected ? 0xf8fafc : 0x475569} />
        </mesh>

        {/* Stainless Steel Faceplate */}
        <mesh position={[0, 0.38, 0.24]} renderOrder={152}>
          <boxGeometry args={[0.54, 0.52, 0.03]} />
          <meshLambertMaterial color={0x94a3b8} />
        </mesh>

        {/* Inset Sensor Display / Terminal */}
        <mesh position={[0, 0.48, 0.26]} renderOrder={153}>
          <boxGeometry args={[0.42, 0.22, 0.02]} />
          <meshBasicMaterial color={0x1e293b} />
        </mesh>

        {/* Sensor Lead / Antenna Stub */}
        <mesh position={[0.2, 0.74, 0]} castShadow renderOrder={154}>
          <cylinderGeometry args={[0.025, 0.025, 0.16, 8]} />
          <meshLambertMaterial color={0x64748b} />
        </mesh>

        {/* Conduit Cap */}
        <mesh position={[-0.2, 0.72, 0]} renderOrder={154}>
          <cylinderGeometry args={[0.035, 0.035, 0.08, 8]} />
          <meshLambertMaterial color={0x1e293b} />
        </mesh>
      </group>

      {/* Selection Highlight Ring */}
      {isSelected && (
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={160}>
          <ringGeometry args={[0.55, 0.78, 24]} />
          <meshBasicMaterial color={0x38bdf8} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Clean Node Code Label Only */}
      <Billboard position={[0, 1.65, 0]} renderOrder={200}>
        <Text
          fontSize={0.28}
          fontWeight="bold"
          color={isSelected ? '#38bdf8' : '#ffffff'}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.04}
          outlineColor="#0f172a"
          renderOrder={200}
        >
          {node.code}
        </Text>
      </Billboard>
    </group>
  )
}

/**
 * Smooth Continuous Gradient Risk Heatmap
 * - Only visible in underground / cutaway views (never shines through the surface terrain)
 * - Stage by stage progression: hidden in Stage 1 baseline (risk < 24%), expands & intensifies through Stages 2 -> 6
 * - Continuous per-vertex color gradient (Yellow -> Orange -> Deep Red) matching the terrain bulge reference
 * - Centered at [0, 0.45, 0] so it surrounds the node in 360° without tunnel wall clipping
 */
function SmoothNodeRiskHeatmap({ riskPercent }: { riskPercent: number }) {
  const billboardRef = useRef<THREE.Group>(null)
  const viewMode = useSimulationStore((s) => s.viewMode)
  const layers = useSimulationStore((s) => s.layers)

  // 1. Underground visibility & baseline threshold calculation
  const isUndergroundVisible = layers.underground && layers.nodes
  const isVisible = isUndergroundVisible && riskPercent >= 24

  // Normalized active risk from 24% to 100% (0.0 -> 1.0)
  const activeRiskNorm = Math.min(1.0, Math.max(0, (riskPercent - 24) / 76))

  // Subtle breathing pulse (always called unconditionally to satisfy Rules of Hooks)
  useFrame(({ clock }) => {
    if (!billboardRef.current) return
    const rate = riskPercent >= 70 ? 2.2 : 1.2
    const s = 1.0 + Math.sin(clock.elapsedTime * rate) * 0.03
    billboardRef.current.scale.setScalar(s)
  })

  // Dynamic radius expanding stage-by-stage:
  // Stage 2 (risk ~30%): small 0.85m aura
  // Stage 3-4 (risk ~55%): medium 1.65m aura
  // Stage 6 (risk ~92%): massive 2.75m critical aura
  const outerRadius = 0.80 + activeRiskNorm * 1.95

  // High-density subdivided radial mesh with smooth per-vertex gradient (always called unconditionally)
  const geometry = useMemo(() => {
    const rings = 28
    const segments = 60
    const geo = new THREE.RingGeometry(0.001, outerRadius, segments, rings)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const count = pos.count
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const r = Math.hypot(x, y)
      const normR = Math.min(1.0, r / outerRadius) // 0 at center, 1 at edge

      // Continuous spatial intensity: 1.0 at center -> 0.0 at outer rim
      // Scaled by actual active risk level
      const intensity = (1.0 - normR) * (0.30 + activeRiskNorm * 0.80)

      // Smooth color gradient matching the exact terrain subsidence palette:
      // Outer (low intensity): Bright Warm Yellow
      // Mid: Vibrant Orange
      // Core (high intensity): Vivid Deep Red
      let cr = 0.98
      let cg = 0.88
      let cb = 0.10

      if (intensity < 0.35) {
        // YELLOW -> ORANGE (Outer margin to mid slope)
        const t = intensity / 0.35
        cr = 0.98
        cg = 0.88 - t * 0.42 // 0.88 (Yellow) -> 0.46 (Orange)
        cb = 0.10 - t * 0.05 // 0.10 -> 0.05
      } else if (intensity < 0.75) {
        // ORANGE -> VIVID RED (Mid slope to core)
        const t = (intensity - 0.35) / 0.40
        cr = 0.98 - t * 0.06 // 0.98 -> 0.92
        cg = 0.46 - t * 0.41 // 0.46 -> 0.05
        cb = 0.05 + t * 0.01 // 0.05 -> 0.06
      } else {
        // VIVID DEEP RED CORE (Critical core at node center)
        cr = 0.92
        cg = 0.05
        cb = 0.06
      }

      colors[i * 3] = cr
      colors[i * 3 + 1] = cg
      colors[i * 3 + 2] = cb
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [outerRadius, activeRiskNorm])

  const opacity = 0.65 + activeRiskNorm * 0.25

  // Conditional early return AFTER all hooks have executed
  if (!isVisible) return null

  return (
    // Centered at [0, 0.45, 0] so the heatmap completely surrounds the node in 360°
    <Billboard ref={billboardRef} position={[0, 0.45, 0]}>
      <mesh geometry={geometry} renderOrder={100}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </Billboard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// B. Surface GNSS Survey Station (Mounted on Ground Surface)
// ─────────────────────────────────────────────────────────────────────────────

interface SurfaceGNSSProps {
  station: GNSSStation
  readings: {
    verticalDisplacement: number
    horizontalDisplacement: number
    velocity: number
    status: 'normal' | 'warning' | 'critical'
    trend: string
  }
  isSelected: boolean
  onSelect: () => void
}

function SurfaceGNSSStation({ station, readings, isSelected, onSelect }: SurfaceGNSSProps) {
  const groupRef = useRef<THREE.Group>(null)

  const statusColor = useMemo(() => {
    if (readings.status === 'critical') return '#dc2626'
    if (readings.status === 'warning') return '#f59e0b'
    return '#0284c7'
  }, [readings.status])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect()
  }

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = () => {
    document.body.style.cursor = 'auto'
  }

  return (
    <group
      ref={groupRef}
      position={[station.position.x, station.position.y, station.position.z]}
      scale={isSelected ? 1.25 : 1.0}
    >
      {/* Clickable Hitbox */}
      <mesh
        position={[0, 0.9, 0]}
        visible={false}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[1.0, 1.0, 2.2, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ── Realistic Surface Geodetic GNSS Monument ── */}
      <group
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {/* Concrete Survey Pillar Base */}
        <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.24, 12]} />
          <meshLambertMaterial color={0x94a3b8} />
        </mesh>

        {/* Stainless Steel Mast */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 1.05, 10]} />
          <meshLambertMaterial color={0xe2e8f0} />
        </mesh>

        {/* Receiver Electronics Housing */}
        <mesh position={[0.16, 0.55, 0]} castShadow>
          <boxGeometry args={[0.22, 0.28, 0.18]} />
          <meshLambertMaterial color={0x475569} />
        </mesh>

        {/* Geodetic Choke-Ring Antenna Base */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.28, 0.08, 16]} />
          <meshLambertMaterial color={0x334155} />
        </mesh>

        {/* Hemispherical Radome Dome */}
        <mesh position={[0, 1.38, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshLambertMaterial color={isSelected ? 0xffffff : 0xf8fafc} />
        </mesh>
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.85, 28]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating GNSS Station Label */}
      <Billboard position={[0, 2.0, 0]}>
        <Text
          fontSize={0.34}
          fontWeight="bold"
          color={isSelected ? '#0369a1' : '#0f172a'}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.04}
          outlineColor="#ffffff"
        >
          {station.code}
        </Text>
        <Text
          fontSize={0.24}
          fontWeight="bold"
          color={statusColor}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.03}
          outlineColor="#ffffff"
          position={[0, -0.03, 0]}
        >
          {`Δz: ${readings.verticalDisplacement.toFixed(1)} mm`}
        </Text>
      </Billboard>
    </group>
  )
}
