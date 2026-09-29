import { SensorReadings, StageDefinition, STAGE_DEFINITIONS } from './stageDefinitions'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

export function interpolateReadings(
  stageIndex: number,
  progressInStage: number,
  stages: StageDefinition[] = STAGE_DEFINITIONS,
): SensorReadings {
  const current = stages[stageIndex]
  const next = stages[Math.min(stageIndex + 1, stages.length - 1)]
  const t = smoothstep(progressInStage)

  return {
    vibration: lerp(current.readings.vibration, next.readings.vibration, t),
    tilt: lerp(current.readings.tilt, next.readings.tilt, t),
    strain: lerp(current.readings.strain, next.readings.strain, t),
    seismic: lerp(current.readings.seismic, next.readings.seismic, t),
    gas: lerp(current.readings.gas, next.readings.gas, t),
    gnssDisplacement: lerp(current.readings.gnssDisplacement, next.readings.gnssDisplacement, t),
    riskPercent: lerp(current.readings.riskPercent, next.readings.riskPercent, t),
  }
}

export function interpolateMiningFront(
  stageIndex: number,
  progressInStage: number,
  stages: StageDefinition[] = STAGE_DEFINITIONS,
): number {
  const current = stages[stageIndex]
  const next = stages[Math.min(stageIndex + 1, stages.length - 1)]
  return lerp(current.miningFrontProgress, next.miningFrontProgress, smoothstep(progressInStage))
}

export function interpolateTerrainDeformation(
  stageIndex: number,
  progressInStage: number,
  stages: StageDefinition[] = STAGE_DEFINITIONS,
): number {
  const current = stages[stageIndex]
  const next = stages[Math.min(stageIndex + 1, stages.length - 1)]
  return lerp(current.terrainDeformation, next.terrainDeformation, smoothstep(progressInStage))
}

export function formatReading(key: keyof Omit<SensorReadings, 'riskPercent'>, value: number): string {
  switch (key) {
    case 'vibration':
      return `${value.toFixed(2)} mm/s`
    case 'tilt':
      return `${value.toFixed(2)} μrad`
    case 'strain':
      return `${value.toFixed(0)} με`
    case 'seismic':
      return `${Math.round(value)} ev/hr`
    case 'gas':
      return `${value.toFixed(2)}%`
    case 'gnssDisplacement':
      return `${value.toFixed(1)} mm`
    default:
      return value.toFixed(2)
  }
}
