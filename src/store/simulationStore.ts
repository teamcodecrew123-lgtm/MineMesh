import { create } from 'zustand'
import { SensorReadings, STAGE_DEFINITIONS, TOTAL_DURATION, getStageAtTime } from '../data/stageDefinitions'
import {
  interpolateReadings,
  interpolateMiningFront,
  interpolateTerrainDeformation,
} from '../data/interpolation'

export interface LayerVisibility {
  surface: boolean
  underground: boolean
  tunnels: boolean
  miningPanels: boolean
  miningFront: boolean
  nodes: boolean
  gnss: boolean
  insar: boolean
  seismic: boolean
  deformation: boolean
  surfaceStructures: boolean
}

export type ActivePanelType = 'node' | 'gnss' | 'sensorGraph' | 'gnssGraph' | null

export interface SimulationState {
  playing: boolean
  elapsedSeconds: number // 0..60

  // Derived simulation metrics
  stageIndex: number
  progressInStage: number
  readings: SensorReadings
  insarStatus: string
  miningFrontProgress: number
  terrainDeformation: number
  showFusionPanel: boolean
  seismicCluster: boolean

  // Single Active Panel State Management (Requirement 14)
  activePanel: ActivePanelType
  selectedNodeId: string | null
  selectedGNSSId: string | null
  selectedGraphSensor: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas' | null

  // Camera & Layers
  viewMode: 'full' | 'surface' | 'underground' | 'cutaway' | 'affected'
  layers: LayerVisibility
  cameraResetTrigger: number

  // Actions
  start: () => void
  pause: () => void
  restart: () => void
  nextStage: () => void
  prevStage: () => void
  tick: (delta: number) => void

  // Panel Open / Close Actions
  openNodePanel: (nodeId: string) => void
  openGNSSPanel: (gnssId: string) => void
  openSensorGraph: (nodeId: string, sensorKey: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas') => void
  openGNSSGraph: (gnssId: string) => void
  closePanel: () => void
  closeAllPanels: () => void

  // Camera / Layers
  setViewMode: (mode: SimulationState['viewMode']) => void
  resetCamera: () => void
  toggleLayer: (key: keyof LayerVisibility) => void
}

const STAGE0 = STAGE_DEFINITIONS[0]

function deriveFromTime(t: number) {
  const { stageIndex, progressInStage } = getStageAtTime(t)
  const stage = STAGE_DEFINITIONS[stageIndex]
  const nextStage = STAGE_DEFINITIONS[Math.min(stageIndex + 1, STAGE_DEFINITIONS.length - 1)]

  return {
    stageIndex,
    progressInStage,
    readings: interpolateReadings(stageIndex, progressInStage),
    insarStatus: stage.insarStatus,
    miningFrontProgress: interpolateMiningFront(stageIndex, progressInStage),
    terrainDeformation: interpolateTerrainDeformation(stageIndex, progressInStage),
    showFusionPanel: stage.showFusionPanel,
    seismicCluster: stage.seismicCluster || (nextStage.seismicCluster && progressInStage > 0.5),
  }
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  playing: false,
  elapsedSeconds: 0,
  stageIndex: 0,
  progressInStage: 0,
  readings: STAGE0.readings,
  insarStatus: STAGE0.insarStatus,
  miningFrontProgress: 0,
  terrainDeformation: 0,
  showFusionPanel: false,
  seismicCluster: false,

  activePanel: null,
  selectedNodeId: null,
  selectedGNSSId: null,
  selectedGraphSensor: null,

  viewMode: 'full',
  cameraResetTrigger: 0,
  layers: {
    surface: true,
    underground: true,
    tunnels: true,
    miningPanels: true,
    miningFront: true,
    nodes: true,
    gnss: true,
    insar: true,
    seismic: true,
    deformation: true,
    surfaceStructures: true,
  },

  start: () => set({ playing: true }),
  pause: () => set({ playing: false }),

  restart: () =>
    set({
      playing: false,
      elapsedSeconds: 0,
      stageIndex: 0,
      progressInStage: 0,
      readings: STAGE0.readings,
      insarStatus: STAGE0.insarStatus,
      miningFrontProgress: 0,
      terrainDeformation: 0,
      showFusionPanel: false,
      seismicCluster: false,
      activePanel: null,
      selectedNodeId: null,
      selectedGNSSId: null,
      selectedGraphSensor: null,
    }),

  // Immediately skip to next stage (Requirement 20)
  nextStage: () => {
    const { stageIndex } = get()
    if (stageIndex < STAGE_DEFINITIONS.length - 1) {
      const targetTime = STAGE_DEFINITIONS[stageIndex + 1].startTime + 0.1
      const derived = deriveFromTime(targetTime)
      set({ elapsedSeconds: targetTime, ...derived })
    } else {
      const targetTime = TOTAL_DURATION
      const derived = deriveFromTime(targetTime)
      set({ elapsedSeconds: targetTime, playing: false, ...derived })
    }
  },

  // Immediately jump to previous stage (Requirement 21)
  prevStage: () => {
    const { stageIndex } = get()
    const targetIdx = Math.max(0, stageIndex - 1)
    const targetTime = STAGE_DEFINITIONS[targetIdx].startTime
    const derived = deriveFromTime(targetTime)
    set({ elapsedSeconds: targetTime, ...derived })
  },

  tick: (delta: number) => {
    const { playing, elapsedSeconds } = get()
    if (!playing) return
    if (elapsedSeconds >= TOTAL_DURATION) {
      set({ playing: false })
      return
    }
    const newTime = Math.min(elapsedSeconds + delta, TOTAL_DURATION)
    const derived = deriveFromTime(newTime)
    set({ elapsedSeconds: newTime, ...derived })
  },

  // Panel Openers — strictly closes previous panel
  openNodePanel: (nodeId: string) =>
    set({
      activePanel: 'node',
      selectedNodeId: nodeId,
      selectedGNSSId: null,
      selectedGraphSensor: null,
    }),

  openGNSSPanel: (gnssId: string) =>
    set({
      activePanel: 'gnss',
      selectedGNSSId: gnssId,
      selectedNodeId: null,
      selectedGraphSensor: null,
    }),

  openSensorGraph: (nodeId: string, sensorKey: 'vibration' | 'tilt' | 'strain' | 'seismic' | 'gas') =>
    set({
      activePanel: 'sensorGraph',
      selectedNodeId: nodeId,
      selectedGraphSensor: sensorKey,
      selectedGNSSId: null,
    }),

  openGNSSGraph: (gnssId: string) =>
    set({
      activePanel: 'gnssGraph',
      selectedGNSSId: gnssId,
      selectedNodeId: null,
      selectedGraphSensor: null,
    }),

  closePanel: () =>
    set({
      activePanel: null,
      selectedNodeId: null,
      selectedGNSSId: null,
      selectedGraphSensor: null,
    }),

  closeAllPanels: () =>
    set({
      activePanel: null,
      selectedNodeId: null,
      selectedGNSSId: null,
      selectedGraphSensor: null,
    }),

  setViewMode: (mode) =>
    set({
      viewMode: mode,
      // Switching global camera views auto-clears open node panels
      activePanel: null,
      selectedNodeId: null,
      selectedGNSSId: null,
    }),

  resetCamera: () =>
    set((s) => ({
      cameraResetTrigger: s.cameraResetTrigger + 1,
      viewMode: 'full',
    })),

  toggleLayer: (key) =>
    set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
}))
