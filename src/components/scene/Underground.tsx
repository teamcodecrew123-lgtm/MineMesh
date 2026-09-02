import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useSimulationStore } from '../../store/simulationStore'

/**
 * Expansive Realistic Underground Mine Architecture:
 * - Deep vertical hoisting shaft with structural steel guide rails
 * - Long main haulage roadway with smoothly curved corner transitions
 * - North Gate and Tail Gate parallel roads with connecting crosscuts
 * - Mining panel with hydraulic roof support shields
 * - Advancing longwall shearer machine with cutting drums and active sparks/glow
 * - Geological rock strata layers
 */
export function Underground() {
  const layers = useSimulationStore((s) => s.layers)
  const miningFrontProgress = useSimulationStore((s) => s.miningFrontProgress)
  const viewMode = useSimulationStore((s) => s.viewMode)
  const stageIndex = useSimulationStore((s) => s.stageIndex)

  const showUnderground =
    layers.underground || viewMode === 'underground' || viewMode === 'cutaway'
  if (!showUnderground) return null

  return (
    <group>
      {/* 1. Geological Rock Strata Volume */}
      <RockStrata />

      {/* 2. Vertical Hoisting & Ventilation Shaft */}
      <ShaftStructure />

      {/* 3. Extensive Curved Tunnel & Haulage Network */}
      {layers.tunnels && <TunnelNetwork />}

      {/* 4. Extracted Longwall Mining Panel & Roof Supports */}
      {layers.miningPanels && <LongwallPanel />}

      {/* 5. Active Advancing Longwall Shearer Cutting Face */}
      {layers.miningFront && (
        <AdvancingMiningFront progress={miningFrontProgress} stageIndex={stageIndex} />
      )}
    </group>
  )
}

function RockStrata() {
  return (
    <group>
      {/* Overburden strata (semi-transparent rock mass) */}
      <mesh position={[12, -4.0, 0]}>
        <boxGeometry args={[42, 7.5, 26]} />
        <meshLambertMaterial
          color={0x78716c}
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Coal seam deposit layer */}
      <mesh position={[12, -8.6, 0]}>
        <boxGeometry args={[42, 2.6, 26]} />
        <meshLambertMaterial
          color={0x1c1917}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Basal floor rock strata */}
      <mesh position={[12, -11.5, 0]}>
        <boxGeometry args={[42, 3.2, 26]} />
        <meshLambertMaterial
          color={0x52525b}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Geological interface strata divider planes */}
      {[-7.3, -9.9].map((y) => (
        <mesh key={y} position={[12, y, 0]}>
          <boxGeometry args={[42, 0.08, 26]} />
          <meshBasicMaterial color={0x44403c} transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function ShaftStructure() {
  return (
    <group position={[3.0, 0, 0]}>
      {/* Shaft Concrete/Steel Lining Cylinder */}
      <mesh position={[0, -4.4, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 8.8, 20, 1, true]} />
        <meshLambertMaterial color={0x334155} side={THREE.DoubleSide} transparent opacity={0.7} depthWrite={false} />
      </mesh>

      {/* Steel Ring Stiffeners along Shaft Wall */}
      {[-1.5, -3.2, -5.0, -6.8, -8.2].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[1.35, 0.05, 8, 24]} />
          <meshLambertMaterial color={0x64748b} />
        </mesh>
      ))}

      {/* Vertical Hoist Cage Guide Beams */}
      {[[-0.9, 0], [0.9, 0], [0, -0.9], [0, 0.9]].map(([gx, gz], i) => (
        <mesh key={i} position={[gx, -4.4, gz]}>
          <boxGeometry args={[0.08, 8.8, 0.08]} />
          <meshLambertMaterial color={0x94a3b8} />
        </mesh>
      ))}

      {/* Shaft Bottom Incline Transition Station */}
      <mesh position={[1.4, -8.5, 0]}>
        <boxGeometry args={[2.0, 2.2, 2.4]} />
        <meshLambertMaterial color={0x1e293b} transparent opacity={0.75} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Curved tunnel mesh generator using segmented geometry
 */
function CurvedTunnelSegment({
  startAngle,
  endAngle,
  radius,
  center,
  width = 1.4,
  height = 2.2,
  segments = 8,
}: {
  startAngle: number
  endAngle: number
  radius: number
  center: [number, number, number]
  width?: number
  height?: number
  segments?: number
}) {
  const meshRef = useRef<THREE.Group>(null)

  const arches = useMemo(() => {
    const items = []
    const angleStep = (endAngle - startAngle) / segments
    for (let i = 0; i <= segments; i++) {
      const a = startAngle + i * angleStep
      const x = center[0] + Math.cos(a) * radius
      const z = center[2] + Math.sin(a) * radius
      const rotY = -a + Math.PI / 2
      items.push({ x, y: center[1], z, rotY })
    }
    return items
  }, [startAngle, endAngle, radius, center, segments])

  return (
    <group ref={meshRef}>
      {arches.slice(0, -1).map((curr, idx) => {
        const next = arches[idx + 1]
        const midX = (curr.x + next.x) / 2
        const midZ = (curr.z + next.z) / 2
        const length = Math.hypot(next.x - curr.x, next.z - curr.z)
        const angle = Math.atan2(next.z - curr.z, next.x - curr.x)

        return (
          <group key={idx} position={[midX, curr.y, midZ]} rotation={[0, -angle, 0]}>
            {/* Tunnel Chamber Box Segment */}
            <mesh>
              <boxGeometry args={[length * 1.05, height, width]} />
              <meshLambertMaterial color={0x334155} transparent opacity={0.65} depthWrite={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function TunnelNetwork() {
  const tunnelColor = 0x334155
  const tunnelOpacity = 0.65

  return (
    <group>
      {/* ── 1. Main Arterial Haulage Drift (X = 3.5 -> 24.0, Z = 0) ── */}
      <mesh position={[14.0, -8.5, 0]}>
        <boxGeometry args={[19.0, 2.2, 1.6]} />
        <meshLambertMaterial color={tunnelColor} transparent opacity={tunnelOpacity} depthWrite={false} />
      </mesh>

      {/* ── 2. North Crosscut Curved Transition ── */}
      <CurvedTunnelSegment
        startAngle={-Math.PI / 2}
        endAngle={0}
        radius={4.8}
        center={[6.5, -8.5, 4.8]}
        width={1.4}
        height={2.2}
      />

      {/* ── 3. South Crosscut Curved Transition ── */}
      <CurvedTunnelSegment
        startAngle={Math.PI / 2}
        endAngle={0}
        radius={4.8}
        center={[6.5, -8.5, -4.8]}
        width={1.4}
        height={2.2}
      />

      {/* ── 4. North Main Gate Road (Parallel to longwall panel, Z = 4.8) ── */}
      <mesh position={[17.0, -8.5, 4.8]}>
        <boxGeometry args={[13.0, 2.2, 1.4]} />
        <meshLambertMaterial color={tunnelColor} transparent opacity={tunnelOpacity} depthWrite={false} />
      </mesh>

      {/* ── 5. South Tail Gate Road (Parallel to longwall panel, Z = -4.8) ── */}
      <mesh position={[17.0, -8.5, -4.8]}>
        <boxGeometry args={[13.0, 2.2, 1.4]} />
        <meshLambertMaterial color={tunnelColor} transparent opacity={tunnelOpacity} depthWrite={false} />
      </mesh>

      {/* ── 6. Intermediate Ventilation & Equipment Crosscuts ── */}
      {[12.0, 17.5, 23.0].map((cx) => (
        <group key={cx}>
          {/* North connecting crosscut */}
          <mesh position={[cx, -8.5, 2.4]}>
            <boxGeometry args={[1.3, 2.0, 3.4]} />
            <meshLambertMaterial color={tunnelColor} transparent opacity={tunnelOpacity} depthWrite={false} />
          </mesh>
          {/* South connecting crosscut */}
          <mesh position={[cx, -8.5, -2.4]}>
            <boxGeometry args={[1.3, 2.0, 3.4]} />
            <meshLambertMaterial color={tunnelColor} transparent opacity={tunnelOpacity} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* ── 7. Steel Arch Structural Supports along Main Tunnels ── */}
      {[5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0, 22.5].map((x) => (
        <TunnelSteelArch key={x} position={[x, -8.5, 0]} width={1.6} height={2.2} />
      ))}
      {[12.0, 14.5, 17.0, 19.5, 22.0].map((x) => (
        <TunnelSteelArch key={`n-${x}`} position={[x, -8.5, 4.8]} width={1.4} height={2.2} />
      ))}
      {[12.0, 14.5, 17.0, 19.5, 22.0].map((x) => (
        <TunnelSteelArch key={`s-${x}`} position={[x, -8.5, -4.8]} width={1.4} height={2.2} />
      ))}
    </group>
  )
}

function TunnelSteelArch({
  position,
  width = 1.6,
  height = 2.2,
}: {
  position: [number, number, number]
  width?: number
  height?: number
}) {
  const halfW = width / 2
  return (
    <group position={position}>
      {/* Left post */}
      <mesh position={[0, 0, -halfW]}>
        <boxGeometry args={[0.1, height, 0.1]} />
        <meshLambertMaterial color={0x94a3b8} />
      </mesh>
      {/* Right post */}
      <mesh position={[0, 0, halfW]}>
        <boxGeometry args={[0.1, height, 0.1]} />
        <meshLambertMaterial color={0x94a3b8} />
      </mesh>
      {/* Curved/Angled Roof Beam */}
      <mesh position={[0, height / 2 - 0.05, 0]}>
        <boxGeometry args={[0.12, 0.1, width + 0.1]} />
        <meshLambertMaterial color={0x64748b} />
      </mesh>
    </group>
  )
}

function LongwallPanel() {
  return (
    <group>
      {/* 1. Extracted Coal Seam Void Volume */}
      <mesh position={[16.5, -8.5, 0]}>
        <boxGeometry args={[13.5, 2.3, 8.2]} />
        <meshLambertMaterial
          color={0x0f172a}
          transparent
          opacity={0.45}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Perimeter edge boundary wireframe for clarity */}
      <lineSegments position={[16.5, -8.5, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(13.5, 2.3, 8.2)]} />
        <lineBasicMaterial color={0x38bdf8} transparent opacity={0.35} />
      </lineSegments>

      {/* Hydraulic Powered Roof Supports (Shield Canopies) along Goaf */}
      {[-3.2, -2.1, -1.0, 0.0, 1.1, 2.2, 3.3].map((z) => (
        <group key={z} position={[10.5, -8.5, z]}>
          {/* Base plate */}
          <mesh position={[0, -1.0, 0]}>
            <boxGeometry args={[1.4, 0.18, 0.85]} />
            <meshLambertMaterial color={0xf59e0b} />
          </mesh>
          {/* Hydraulic rams */}
          <mesh position={[0.2, -0.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 1.4, 8]} />
            <meshLambertMaterial color={0xd97706} />
          </mesh>
          {/* Canopy shield plate */}
          <mesh position={[0.1, 0.95, 0]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[1.6, 0.15, 0.9]} />
            <meshLambertMaterial color={0xfbbf24} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface MiningFrontProps {
  progress: number // 0..1
  stageIndex: number
}

function AdvancingMiningFront({ progress, stageIndex }: MiningFrontProps) {
  const glowRef = useRef<THREE.Mesh>(null)
  const sparkRef = useRef<THREE.PointLight>(null)

  // Longwall cutting front advances smoothly from X=10.5 to X=23.0
  const frontX = 10.5 + progress * 12.5

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (glowRef.current && stageIndex >= 1) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.25 + Math.sin(t * 4) * 0.15
    }
    if (sparkRef.current && stageIndex >= 1) {
      sparkRef.current.intensity = 1.2 + Math.sin(t * 8) * 0.6
    }
  })

  return (
    <group position={[frontX, -8.5, 0]}>
      {/* 1. Coal Face Cut Wall */}
      <mesh position={[0.25, 0, 0]}>
        <boxGeometry args={[0.5, 2.3, 8.4]} />
        <meshLambertMaterial color={0x451a03} />
      </mesh>

      {/* 2. Heavy Double-Ended Ranging Drum Shearer Machine */}
      <group position={[-0.4, -0.4, 0]}>
        {/* Machine Main Body */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.1, 4.8]} />
          <meshLambertMaterial color={0xb45309} />
        </mesh>
        {/* Cab & Electrical Enclosure */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.2, 0.45, 2.8]} />
          <meshLambertMaterial color={0x78350f} />
        </mesh>

        {/* Left & Right Ranging Cutting Arms & Rotating Drums */}
        {[-2.0, 2.0].map((z, idx) => (
          <group key={z} position={[0.6, idx === 0 ? 0.4 : -0.3, z]}>
            {/* Ranging Arm */}
            <mesh rotation={[0, 0, idx === 0 ? 0.4 : -0.3]}>
              <boxGeometry args={[1.0, 0.35, 0.4]} />
              <meshLambertMaterial color={0x9a3412} />
            </mesh>
            {/* Spiral Vane Cutting Drum */}
            <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.55, 0.55, 0.9, 14]} />
              <meshLambertMaterial color={0x18181b} />
            </mesh>
            {/* Tungsten Carbide Cutting Picks */}
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
              <mesh
                key={i}
                position={[
                  0.55,
                  Math.sin(ang) * 0.58,
                  Math.cos(ang) * 0.58,
                ]}
              >
                <coneGeometry args={[0.06, 0.15, 6]} />
                <meshLambertMaterial color={0xf59e0b} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 3. Active Cutting Zone Illumination & Spark Glow */}
      {stageIndex >= 1 && (
        <>
          <mesh ref={glowRef} position={[0.4, 0, 0]}>
            <boxGeometry args={[1.2, 2.5, 8.8]} />
            <meshBasicMaterial
              color={0xf97316}
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
          <pointLight
            ref={sparkRef}
            position={[0.2, 0, 0]}
            color="#fb923c"
            intensity={1.5}
            distance={8}
          />
        </>
      )}
    </group>
  )
}
