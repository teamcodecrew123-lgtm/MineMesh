import * as THREE from 'three'
import { SensorReadings, STAGE_DEFINITIONS, getStageAtTime } from './stageDefinitions'
import { interpolateReadings } from './interpolation'

export interface InternalSensorInfo {
  key: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas'
  name: string
  label: string
  unit: string
  icon: string
  description: string
  normalRange: string
  warningThreshold: number
  criticalThreshold: number
}

export const INTERNAL_SENSORS: InternalSensorInfo[] = [
  {
    key: 'vibration',
    name: 'Vibration Sensor',
    label: 'Vibration',
    unit: 'mm/s',
    icon: '📳',
    description: 'High-frequency 3-axis velocity geophone monitoring ground tremors and mechanical shock',
    normalRange: '< 2.0 mm/s',
    warningThreshold: 3.5,
    criticalThreshold: 5.5,
  },
  {
    key: 'tilt',
    name: 'Biaxial Tiltmeter',
    label: 'Tilt',
    unit: 'μrad',
    icon: '📐',
    description: 'Electrolytic biaxial sensor measuring rock mass slope and differential angular settlement',
    normalRange: '< 0.8 μrad',
    warningThreshold: 1.2,
    criticalThreshold: 2.5,
  },
  {
    key: 'strain',
    name: 'Strain Gauge Interface',
    label: 'Strain',
    unit: 'με',
    icon: '📏',
    description: 'Vibrating wire / fibre-optic strain gauge detecting tensile ground extension & shear',
    normalRange: '< 40 με',
    warningThreshold: 60,
    criticalThreshold: 100,
  },
  {
    key: 'seismic',
    name: 'Microseismic Node',
    label: 'Microseismic',
    unit: 'ev/hr',
    icon: '🌊',
    description: 'Acoustic emission transducer capturing strata fracturing rate in overlying rock mass',
    normalRange: '< 8 ev/hr',
    warningThreshold: 15,
    criticalThreshold: 28,
  },
  {
    key: 'gas',
    name: 'Gas Detector (CH₄/CO)',
    label: 'Gas Conc.',
    unit: '%',
    icon: '💨',
    description: 'Optical infrared NDIR detector monitoring tunnel vent degassing and air quality',
    normalRange: '< 1.0%',
    warningThreshold: 1.3,
    criticalThreshold: 2.0,
  },
]

// ── 5 Underground Multi-Sensor Monitoring Nodes (Installed inside tunnels) ──

export interface MonitoringNode {
  id: string
  code: string
  name: string
  locationName: string
  position: THREE.Vector3
  description: string
  sensitivity: {
    vibration: number
    tilt: number
    strain: number
    seismic: number
    gas: number
    riskMultiplier: number
  }
}

export const MONITORING_NODES: MonitoringNode[] = [
  {
    id: 'node-01',
    code: 'NODE-01',
    name: 'Underground Node 01 (Main Haulage)',
    locationName: 'Underground — Main Haulage Drift',
    position: new THREE.Vector3(8.0, -8.7, 0.0),
    description: 'Installed along the main arterial haulage drift connecting shaft bottom to active longwall workings.',
    sensitivity: {
      vibration: 0.65,
      tilt: 0.55,
      strain: 0.60,
      seismic: 0.58,
      gas: 0.70,
      riskMultiplier: 0.60,
    },
  },
  {
    id: 'node-02',
    code: 'NODE-02',
    name: 'Underground Node 02 (North Gate Face)',
    locationName: 'Underground — North Main Gate Road',
    position: new THREE.Vector3(16.5, -8.7, 4.4),
    description: 'Mounted near the active advancing longwall shearer face. Captures high forward abutment stress and dynamic strata fracturing.',
    sensitivity: {
      vibration: 1.0,
      tilt: 0.95,
      strain: 1.0,
      seismic: 1.0,
      gas: 1.0,
      riskMultiplier: 1.0,
    },
  },
  {
    id: 'node-03',
    code: 'NODE-03',
    name: 'Underground Node 03 (Panel Crosscut)',
    locationName: 'Underground — Panel Crosscut #1',
    position: new THREE.Vector3(12.0, -8.7, 2.0),
    description: 'Stationed in the intermediate crosscut adjacent to the longwall extraction void. Detects roof convergence and lateral shear.',
    sensitivity: {
      vibration: 0.88,
      tilt: 0.85,
      strain: 0.90,
      seismic: 0.92,
      gas: 0.85,
      riskMultiplier: 0.88,
    },
  },
  {
    id: 'node-04',
    code: 'NODE-04',
    name: 'Underground Node 04 (South Tail Gate)',
    locationName: 'Underground — South Tail Gate Road',
    position: new THREE.Vector3(15.5, -8.7, -4.4),
    description: 'Positioned on the return ventilation tail gate tracking goaf consolidation and gas drainage.',
    sensitivity: {
      vibration: 0.72,
      tilt: 0.65,
      strain: 0.68,
      seismic: 0.70,
      gas: 0.95,
      riskMultiplier: 0.72,
    },
  },
  {
    id: 'node-05',
    code: 'NODE-05',
    name: 'Underground Node 05 (Shaft Station)',
    locationName: 'Underground — Shaft Bottom Incline',
    position: new THREE.Vector3(4.2, -8.7, 0.0),
    description: 'Protective monitoring node installed at the vertical shaft bottom transition station. Acts as stable baseline reference.',
    sensitivity: {
      vibration: 0.15,
      tilt: 0.10,
      strain: 0.12,
      seismic: 0.10,
      gas: 0.20,
      riskMultiplier: 0.12,
    },
  },
]

// ── 4 Surface GNSS Survey Stations ─────────────────────────────────

export interface GNSSStation {
  id: string
  code: string
  name: string
  locationName: string
  position: THREE.Vector3
  description: string
  displacementMultiplier: number // Relative to peak global displacement
  horizontalRatio: number       // Horizontal vs vertical displacement ratio
}

export const GNSS_STATIONS: GNSSStation[] = [
  {
    id: 'gnss-01',
    code: 'GNSS-01',
    name: 'GNSS Station 01 (Surface Epicenter)',
    locationName: 'Surface Zone A — Subsidence Center',
    position: new THREE.Vector3(10.5, 0.2, 0.8),
    description: 'Surface geodetic GNSS receiver stationed at predicted maximum depression bowl axis above mining panel.',
    displacementMultiplier: 1.0,  // -11.5 mm peak
    horizontalRatio: 0.22,
  },
  {
    id: 'gnss-02',
    code: 'GNSS-02',
    name: 'GNSS Station 02 (Surface Flank)',
    locationName: 'Surface Zone B — Active Panel Flank',
    position: new THREE.Vector3(16.0, 0.2, -1.8),
    description: 'Tracks inflection point of surface subsidence trough and horizontal tensile shift.',
    displacementMultiplier: 0.60, // -6.8 mm peak
    horizontalRatio: 0.32,
  },
  {
    id: 'gnss-03',
    code: 'GNSS-03',
    name: 'GNSS Station 03 (Surface North Boundary)',
    locationName: 'Surface Zone C — North Perimeter',
    position: new THREE.Vector3(7.0, 0.2, 3.8),
    description: 'Boundary station tracking angle of draw and margin settlement near plant road.',
    displacementMultiplier: 0.28, // -3.2 mm peak
    horizontalRatio: 0.25,
  },
  {
    id: 'gnss-04',
    code: 'GNSS-04',
    name: 'GNSS Station 04 (Surface Reference Benchmark)',
    locationName: 'Surface Zone E — Stable Reference Benchmark',
    position: new THREE.Vector3(-4.0, 0.2, -3.0),
    description: 'Deep-anchored bedrock geodetic monument providing fixed surface reference datum.',
    displacementMultiplier: 0.07, // -0.8 mm peak
    horizontalRatio: 0.10,
  },
]

// Baseline readings for differential calculation
const BASELINE_VALUES: Omit<SensorReadings, 'riskPercent'> = {
  vibration: 1.2,
  tilt: 0.2,
  strain: 20,
  seismic: 2,
  gas: 0.8,
  gnssDisplacement: -0.5,
}

export function getNodeReadings(node: MonitoringNode, globalReadings: SensorReadings): SensorReadings {
  const s = node.sensitivity

  const vibration = BASELINE_VALUES.vibration + (globalReadings.vibration - BASELINE_VALUES.vibration) * s.vibration
  const tilt = BASELINE_VALUES.tilt + (globalReadings.tilt - BASELINE_VALUES.tilt) * s.tilt
  const strain = BASELINE_VALUES.strain + (globalReadings.strain - BASELINE_VALUES.strain) * s.strain
  const seismic = Math.round(BASELINE_VALUES.seismic + (globalReadings.seismic - BASELINE_VALUES.seismic) * s.seismic)
  const gas = BASELINE_VALUES.gas + (globalReadings.gas - BASELINE_VALUES.gas) * s.gas
  const gnssDisplacement = BASELINE_VALUES.gnssDisplacement + (globalReadings.gnssDisplacement - BASELINE_VALUES.gnssDisplacement) * s.riskMultiplier
  const riskPercent = Math.min(100, Math.round(8 + (globalReadings.riskPercent - 8) * s.riskMultiplier))

  return {
    vibration,
    tilt,
    strain,
    seismic,
    gas,
    gnssDisplacement,
    riskPercent,
  }
}

export interface GNSSReadings {
  verticalDisplacement: number   // mm (negative)
  horizontalDisplacement: number // mm
  velocity: number               // mm/s
  status: 'normal' | 'warning' | 'critical'
  trend: string
}

export function getGNSSReadings(station: GNSSStation, globalReadings: SensorReadings): GNSSReadings {
  const vert = BASELINE_VALUES.gnssDisplacement + (globalReadings.gnssDisplacement - BASELINE_VALUES.gnssDisplacement) * station.displacementMultiplier
  const horiz = Math.abs(vert) * station.horizontalRatio
  const velocity = (vert / 60) * 2.2 // mm/s rate estimation

  let status: 'normal' | 'warning' | 'critical' = 'normal'
  if (Math.abs(vert) >= 8.0) status = 'critical'
  else if (Math.abs(vert) >= 3.0) status = 'warning'

  const trend = Math.abs(vert) > 1.2 ? 'Increasing' : 'Stable'

  return {
    verticalDisplacement: vert,
    horizontalDisplacement: horiz,
    velocity,
    status,
    trend,
  }
}

export function getNodeStatus(readings: SensorReadings): 'normal' | 'warning' | 'critical' {
  if (readings.riskPercent >= 80 || readings.vibration >= 5.5 || readings.strain >= 100 || readings.tilt >= 2.5) {
    return 'critical'
  }
  if (readings.riskPercent >= 35 || readings.vibration >= 3.0 || readings.strain >= 55 || readings.tilt >= 1.0) {
    return 'warning'
  }
  return 'normal'
}

export function getSensorStatus(
  sensorKey: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas',
  value: number
): 'normal' | 'warning' | 'critical' {
  const sensor = INTERNAL_SENSORS.find((s) => s.key === sensorKey)
  if (!sensor) return 'normal'
  if (value >= sensor.criticalThreshold) return 'critical'
  if (value >= sensor.warningThreshold) return 'warning'
  return 'normal'
}

// ── Time Series Generation (0s -> 60s at 1s intervals) ───────────────

export function getNodeTimeSeries(node: MonitoringNode, sensorKey: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas') {
  const points: { time: number; value: number }[] = []
  for (let t = 0; t <= 60; t++) {
    const { stageIndex, progressInStage } = getStageAtTime(t)
    const globalR = interpolateReadings(stageIndex, progressInStage)
    const nodeR = getNodeReadings(node, globalR)
    points.push({ time: t, value: nodeR[sensorKey] })
  }
  return points
}

export function getGNSSTimeSeries(station: GNSSStation) {
  const points: { time: number; vertical: number; horizontal: number }[] = []
  for (let t = 0; t <= 60; t++) {
    const { stageIndex, progressInStage } = getStageAtTime(t)
    const globalR = interpolateReadings(stageIndex, progressInStage)
    const gnssR = getGNSSReadings(station, globalR)
    points.push({ time: t, vertical: gnssR.verticalDisplacement, horizontal: gnssR.horizontalDisplacement })
  }
  return points
}
