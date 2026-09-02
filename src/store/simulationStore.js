import { create } from 'zustand';
import { STAGE_DEFINITIONS, TOTAL_DURATION, getStageAtTime } from '../data/stageDefinitions';
import { interpolateReadings, interpolateMiningFront, interpolateTerrainDeformation, } from '../data/interpolation';
const STAGE0 = STAGE_DEFINITIONS[0];
function deriveFromTime(t) {
    const { stageIndex, progressInStage } = getStageAtTime(t);
    const stage = STAGE_DEFINITIONS[stageIndex];
    const nextStage = STAGE_DEFINITIONS[Math.min(stageIndex + 1, STAGE_DEFINITIONS.length - 1)];
    return {
        stageIndex,
        progressInStage,
        readings: interpolateReadings(stageIndex, progressInStage),
        insarStatus: stage.insarStatus,
        miningFrontProgress: interpolateMiningFront(stageIndex, progressInStage),
        terrainDeformation: interpolateTerrainDeformation(stageIndex, progressInStage),
        showFusionPanel: stage.showFusionPanel,
        seismicCluster: stage.seismicCluster || (nextStage.seismicCluster && progressInStage > 0.5),
    };
}
export const useSimulationStore = create((set, get) => ({
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
    restart: () => set({
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
        const { stageIndex } = get();
        if (stageIndex < STAGE_DEFINITIONS.length - 1) {
            const targetTime = STAGE_DEFINITIONS[stageIndex + 1].startTime + 0.1;
            const derived = deriveFromTime(targetTime);
            set({ elapsedSeconds: targetTime, ...derived });
        }
        else {
            const targetTime = TOTAL_DURATION;
            const derived = deriveFromTime(targetTime);
            set({ elapsedSeconds: targetTime, playing: false, ...derived });
        }
    },
    // Immediately jump to previous stage (Requirement 21)
    prevStage: () => {
        const { stageIndex } = get();
        const targetIdx = Math.max(0, stageIndex - 1);
        const targetTime = STAGE_DEFINITIONS[targetIdx].startTime;
        const derived = deriveFromTime(targetTime);
        set({ elapsedSeconds: targetTime, ...derived });
    },
    tick: (delta) => {
        const { playing, elapsedSeconds } = get();
        if (!playing)
            return;
        if (elapsedSeconds >= TOTAL_DURATION) {
            set({ playing: false });
            return;
        }
        const newTime = Math.min(elapsedSeconds + delta, TOTAL_DURATION);
        const derived = deriveFromTime(newTime);
        set({ elapsedSeconds: newTime, ...derived });
    },
    // Panel Openers — strictly closes previous panel
    openNodePanel: (nodeId) => set({
        activePanel: 'node',
        selectedNodeId: nodeId,
        selectedGNSSId: null,
        selectedGraphSensor: null,
    }),
    openGNSSPanel: (gnssId) => set({
        activePanel: 'gnss',
        selectedGNSSId: gnssId,
        selectedNodeId: null,
        selectedGraphSensor: null,
    }),
    openSensorGraph: (nodeId, sensorKey) => set({
        activePanel: 'sensorGraph',
        selectedNodeId: nodeId,
        selectedGraphSensor: sensorKey,
        selectedGNSSId: null,
    }),
    openGNSSGraph: (gnssId) => set({
        activePanel: 'gnssGraph',
        selectedGNSSId: gnssId,
        selectedNodeId: null,
        selectedGraphSensor: null,
    }),
    closePanel: () => set({
        activePanel: null,
        selectedNodeId: null,
        selectedGNSSId: null,
        selectedGraphSensor: null,
    }),
    closeAllPanels: () => set({
        activePanel: null,
        selectedNodeId: null,
        selectedGNSSId: null,
        selectedGraphSensor: null,
    }),
    setViewMode: (mode) => set({
        viewMode: mode,
        // Switching global camera views auto-clears open node panels
        activePanel: null,
        selectedNodeId: null,
        selectedGNSSId: null,
    }),
    resetCamera: () => set((s) => ({
        cameraResetTrigger: s.cameraResetTrigger + 1,
        viewMode: 'full',
    })),
    toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
}));
