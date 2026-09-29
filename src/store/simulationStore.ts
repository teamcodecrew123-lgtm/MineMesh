import { create } from 'zustand'
import { SensorReadings, STAGE_DEFINITIONS, TOTAL_DURATION, getScenarioStages, getStageAtTimeForScenario } from '../data/stageDefinitions'
// Initial readings for default scenario (scenario_0008 stage 0)
const _STAGE0 = STAGE_DEFINITIONS[0]
import {
  interpolateReadings,
  interpolateMiningFront,
  interpolateTerrainDeformation,
} from '../data/interpolation'
import { clearPipelineCache } from '../services/pipelineAdapter'
import type { MonitoringNode } from '../data/sensorLayout'

export const SCENARIO_OPTIONS = [
  { id: 'scenario_0008', label: 'Clear Event' },
  { id: 'scenario_0049', label: 'Borderline'  },
  { id: 'scenario_0045', label: 'No Event'    },
] as const

export type ScenarioId = typeof SCENARIO_OPTIONS[number]['id']

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
  scenarioId: ScenarioId

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

  // Hero nodes — fetched dynamically from backend on scenario change
  heroNodes: MonitoringNode[]
  heroNodesLoading: boolean
  heroNodesError: string | null
  heroNodesRetryTrigger: number
  setHeroNodes: (nodes: MonitoringNode[]) => void
  setHeroNodesLoading: (loading: boolean) => void
  setHeroNodesError: (error: string | null) => void
  triggerHeroNodesRetry: () => void

  // Camera & Layers
  viewMode: 'full' | 'surface' | 'underground' | 'cutaway' | 'affected'
  layers: LayerVisibility
  cameraResetTrigger: number

  // Actions
  start: () => void
  pause: () => void
  restart: () => void
  setScenario: (id: ScenarioId) => void
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

function deriveFromTime(t: number, scenarioId: string) {
  const stages = getScenarioStages(scenarioId)
  const { stageIndex, progressInStage } = getStageAtTimeForScenario(t, scenarioId)
  const stage = stages[stageIndex]
  const nextStage = stages[Math.min(stageIndex + 1, stages.length - 1)]

  return {
    stageIndex,
    progressInStage,
    readings: interpolateReadings(stageIndex, progressInStage, stages),
    insarStatus: stage.insarStatus,
    miningFrontProgress: interpolateMiningFront(stageIndex, progressInStage, stages),
    terrainDeformation: interpolateTerrainDeformation(stageIndex, progressInStage, stages),
    showFusionPanel: stage.showFusionPanel,
    seismicCluster: stage.seismicCluster || (nextStage.seismicCluster && progressInStage > 0.5),
  }
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  playing: false,
  elapsedSeconds: 0,
  scenarioId: 'scenario_0008',
  stageIndex: 0,
  progressInStage: 0,
  readings: _STAGE0.readings,
  insarStatus: _STAGE0.insarStatus,
  miningFrontProgress: 0,
  terrainDeformation: 0,
  showFusionPanel: false,
  seismicCluster: false,

  heroNodes: [],
  heroNodesLoading: true,
  heroNodesError: null,
  heroNodesRetryTrigger: 0,

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
    insar: false,
    seismic: false,
    deformation: false,
    surfaceStructures: true,
  },

  start: () => set({ playing: true }),
  pause: () => set({ playing: false }),

  restart: () => {
    clearPipelineCache()
    const scenarioId = get().scenarioId
    const initial = deriveFromTime(0, scenarioId)
    set({
      playing: false,
      elapsedSeconds: 0,
      ...initial,
      activePanel: null,
      selectedNodeId: null,
      selectedGNSSId: null,
      selectedGraphSensor: null,
    })
  },

  setScenario: (id: ScenarioId) => {
    clearPipelineCache()
    const initial = deriveFromTime(0, id)
    set({
      scenarioId: id,
      playing: false,
      elapsedSeconds: 0,
      ...initial,
      heroNodes: [],
      heroNodesLoading: true,
      heroNodesError: null,
      heroNodesRetryTrigger: 0,
    })
  },

  setHeroNodes: (nodes) => set({ heroNodes: nodes }),
  setHeroNodesLoading: (loading) => set({ heroNodesLoading: loading }),
  setHeroNodesError: (error) => set({ heroNodesError: error }),
  triggerHeroNodesRetry: () => set((s) => ({ heroNodesRetryTrigger: s.heroNodesRetryTrigger + 1 })),

  // Immediately skip to next stage (Requirement 20)
  nextStage: () => {
    const { stageIndex, scenarioId } = get()
    const stages = getScenarioStages(scenarioId)
    if (stageIndex < stages.length - 1) {
      const targetTime = stages[stageIndex + 1].startTime + 0.1
      const derived = deriveFromTime(targetTime, scenarioId)
      set({ elapsedSeconds: targetTime, ...derived })
    } else {
      const targetTime = TOTAL_DURATION
      const derived = deriveFromTime(targetTime, scenarioId)
      set({ elapsedSeconds: targetTime, playing: false, ...derived })
    }
  },

  // Immediately jump to previous stage (Requirement 21)
  prevStage: () => {
    const { stageIndex, scenarioId } = get()
    const stages = getScenarioStages(scenarioId)
    const targetIdx = Math.max(0, stageIndex - 1)
    const targetTime = stages[targetIdx].startTime
    const derived = deriveFromTime(targetTime, scenarioId)
    set({ elapsedSeconds: targetTime, ...derived })
  },

  tick: (delta: number) => {
    const { playing, elapsedSeconds, scenarioId } = get()
    if (!playing) return
    if (elapsedSeconds >= TOTAL_DURATION) {
      set({ playing: false })
      return
    }
    const newTime = Math.min(elapsedSeconds + delta, TOTAL_DURATION)
    const derived = deriveFromTime(newTime, scenarioId)
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
