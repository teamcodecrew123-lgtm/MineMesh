// 6-stage deterministic lifecycle — exact 60 seconds
// Represents the complete evolving mining subsidence event
export const STAGE_DEFINITIONS = [
    {
        id: 0,
        name: 'Stable Mine',
        shortName: 'STABLE',
        startTime: 0,
        endTime: 10,
        alertMessage: 'STAGE 1: SYSTEM NORMAL — All 5 monitoring nodes at baseline',
        alertSeverity: 'normal',
        readings: {
            vibration: 1.2,
            tilt: 0.2,
            strain: 20,
            seismic: 2,
            gas: 0.8,
            gnssDisplacement: -0.5,
            riskPercent: 8,
        },
        insarStatus: 'Stable Baseline',
        miningFrontProgress: 0.0,
        terrainDeformation: 0.0,
        showFusionPanel: false,
        seismicCluster: false,
    },
    {
        id: 1,
        name: 'Mining Starts',
        shortName: 'MINING',
        startTime: 10,
        endTime: 20,
        alertMessage: 'STAGE 2: MINING ACTIVITY DETECTED — Longwall shearer advancing',
        alertSeverity: 'normal',
        readings: {
            vibration: 1.8,
            tilt: 0.35,
            strain: 26,
            seismic: 4,
            gas: 0.82,
            gnssDisplacement: -0.8,
            riskPercent: 20,
        },
        insarStatus: 'Stable / Initial Scan',
        miningFrontProgress: 0.28,
        terrainDeformation: 0.0,
        showFusionPanel: false,
        seismicCluster: false,
    },
    {
        id: 2,
        name: 'Underground Stress Increase',
        shortName: 'STRESS↑',
        startTime: 20,
        endTime: 30,
        alertMessage: 'STAGE 3: UNDERGROUND STRESS INCREASING — Strata load redistribution',
        alertSeverity: 'warning',
        readings: {
            vibration: 2.5,
            tilt: 0.6,
            strain: 38,
            seismic: 7,
            gas: 0.85,
            gnssDisplacement: -1.2,
            riskPercent: 35,
        },
        insarStatus: 'Minor Coherence Shift',
        miningFrontProgress: 0.52,
        terrainDeformation: 0.0,
        showFusionPanel: false,
        seismicCluster: false,
    },
    {
        id: 3,
        name: 'Anomaly Detected',
        shortName: 'ANOMALY',
        startTime: 30,
        endTime: 40,
        alertMessage: 'STAGE 4: CORRELATED SENSOR ANOMALY — Multi-node correlation confirmed',
        alertSeverity: 'warning',
        readings: {
            vibration: 4.0,
            tilt: 1.4,
            strain: 72,
            seismic: 18,
            gas: 1.0,
            gnssDisplacement: -3.4,
            riskPercent: 55,
        },
        insarStatus: 'Early Fringe Distortion',
        miningFrontProgress: 0.74,
        terrainDeformation: 0.16,
        showFusionPanel: false,
        seismicCluster: true,
    },
    {
        id: 4,
        name: 'Surface Deformation',
        shortName: 'DEFORM',
        startTime: 40,
        endTime: 50,
        alertMessage: 'STAGE 5: GROUND DEFORMATION DETECTED — Active surface depression visible',
        alertSeverity: 'high-risk',
        readings: {
            vibration: 4.8,
            tilt: 2.0,
            strain: 95,
            seismic: 25,
            gas: 1.1,
            gnssDisplacement: -6.8,
            riskPercent: 75,
        },
        insarStatus: 'Expanding Spatial Deformation Field',
        miningFrontProgress: 0.88,
        terrainDeformation: 0.64,
        showFusionPanel: false,
        seismicCluster: true,
    },
    {
        id: 5,
        name: 'Critical Subsidence',
        shortName: 'CRITICAL',
        startTime: 50,
        endTime: 60,
        alertMessage: 'STAGE 6: CRITICAL GROUND DEFORMATION ALERT — Immediate response required',
        alertSeverity: 'critical',
        readings: {
            vibration: 6.2,
            tilt: 3.2,
            strain: 130,
            seismic: 35,
            gas: 1.2,
            gnssDisplacement: -11.5,
            riskPercent: 92,
        },
        insarStatus: 'High-Density Subsidence Field (Critical)',
        miningFrontProgress: 1.0,
        terrainDeformation: 1.0,
        showFusionPanel: true,
        seismicCluster: true,
    },
];
export const TOTAL_DURATION = 60; // 60 seconds exact
/**
 * Per-scenario backend timestep ranges for each of the 6 demo stages.
 * Derived from real XGBoost escalation transitions (t=0..299):
 *
 * scenario_0008 (Clear Event):
 *   t=100  MFR-02__-1 + INT-0633  first Watch
 *   t=105  MFR-02__-1             first Critical
 *   t=123  INT-0633               Critical confirmed
 *   t=164  INT-0902               Watch (interior spreads)
 *   t=195  INT-0902               Critical (full confirmation)
 *
 * scenario_0049 (Borderline):
 *   t=100  MFR-02__1 + INT-0204   first Watch
 *   t=111  MFR-02__1 + INT-0204   first Critical
 *   t=127  INT-0330               Watch (third node joins)
 *   t=158  INT-0330               Critical (first wave peak)
 *   t=175  all three nodes        second wave resurgence
 *   t=253  all three nodes        third+ wave persistent criticality
 */
export const SCENARIO_BACKEND_STAGES = {
    scenario_0008: [
        { tStart: 0, tEnd: 99 }, // Stage 0: All Low — stable baseline
        { tStart: 100, tEnd: 109 }, // Stage 1: MFR + INT-0633 first Watch
        { tStart: 110, tEnd: 122 }, // Stage 2: MFR Critical, INT-0633 Warning
        { tStart: 123, tEnd: 163 }, // Stage 3: INT-0633 Critical confirmed
        { tStart: 164, tEnd: 194 }, // Stage 4: INT-0902 escalating Watch→Warning
        { tStart: 195, tEnd: 299 }, // Stage 5: INT-0902 Critical — full event
    ],
    scenario_0049: [
        { tStart: 0, tEnd: 99 }, // Stage 0: All Low — stable baseline
        { tStart: 100, tEnd: 110 }, // Stage 1: MFR + INT-0204 first Watch
        { tStart: 111, tEnd: 126 }, // Stage 2: MFR + INT-0204 first Critical
        { tStart: 127, tEnd: 174 }, // Stage 3: INT-0330 joins; oscillating (merged 3+4)
        { tStart: 175, tEnd: 252 }, // Stage 4: Second wave resurgence
        { tStart: 253, tEnd: 299 }, // Stage 5: Third+ wave — persistent multi-node criticality
    ],
};
/**
 * Map a demo elapsed time (0–60s) to the real backend timestep (0–299)
 * for the given scenario, using the per-scenario stage boundaries above.
 * Linearly interpolates within each stage's backend t-range.
 * Falls back to a linear 0-299 mapping for unknown scenarios (e.g. scenario_0045).
 */
export function mapDemoToBackendT(elapsedSeconds, scenarioId) {
    const backendStages = SCENARIO_BACKEND_STAGES[scenarioId];
    const clamped = Math.max(0, Math.min(elapsedSeconds, TOTAL_DURATION));
    if (!backendStages) {
        return Math.round(clamped * 299 / TOTAL_DURATION);
    }
    for (let i = STAGE_DEFINITIONS.length - 1; i >= 0; i--) {
        const demo = STAGE_DEFINITIONS[i];
        const bknd = backendStages[i];
        if (!bknd)
            continue;
        if (clamped >= demo.startTime) {
            const demoRange = demo.endTime - demo.startTime;
            const progress = demoRange > 0 ? (clamped - demo.startTime) / demoRange : 0;
            return Math.round(bknd.tStart + Math.min(progress, 1) * (bknd.tEnd - bknd.tStart));
        }
    }
    return 0;
}
export function getStageAtTime(t) {
    const clamped = Math.max(0, Math.min(t, TOTAL_DURATION));
    for (let i = STAGE_DEFINITIONS.length - 1; i >= 0; i--) {
        const stage = STAGE_DEFINITIONS[i];
        if (clamped >= stage.startTime) {
            const duration = stage.endTime - stage.startTime;
            const progress = duration > 0 ? (clamped - stage.startTime) / duration : 0;
            return { stageIndex: i, progressInStage: Math.min(progress, 1) };
        }
    }
    return { stageIndex: 0, progressInStage: 0 };
}
// ── Per-scenario stage definitions ───────────────────────────────────────────
// scenario_0045: flat "no event" arc — terrainDeformation=0 throughout.
// gnssDisplacement values are real backend averages across 5 hero nodes at each
// stage's representative timestep (oscillating background noise, no systematic trend).
const SCENARIO_0045_STAGES = [
    {
        id: 0, name: 'Stable Baseline', shortName: 'STABLE',
        startTime: 0, endTime: 10,
        alertMessage: 'STAGE 1: SYSTEM NORMAL — All 5 nodes at baseline across full monitoring grid',
        alertSeverity: 'normal',
        readings: { vibration: 1.20, tilt: 0.20, strain: 20, seismic: 2, gas: 0.80, gnssDisplacement: 1.86, riskPercent: 5 },
        insarStatus: 'Stable Baseline',
        miningFrontProgress: 0.00, terrainDeformation: 0.0, showFusionPanel: false, seismicCluster: false,
    },
    {
        id: 1, name: 'Routine Mining', shortName: 'MINING',
        startTime: 10, endTime: 20,
        alertMessage: 'STAGE 2: MINING ACTIVITY — Routine longwall advance; all sensor channels within normal bounds',
        alertSeverity: 'normal',
        readings: { vibration: 1.50, tilt: 0.28, strain: 23, seismic: 3, gas: 0.81, gnssDisplacement: 0.11, riskPercent: 8 },
        insarStatus: 'Stable / Initial Scan',
        miningFrontProgress: 0.25, terrainDeformation: 0.0, showFusionPanel: false, seismicCluster: false,
    },
    {
        id: 2, name: 'Background Monitoring', shortName: 'MONITOR',
        startTime: 20, endTime: 30,
        alertMessage: 'STAGE 3: BACKGROUND MONITORING — Isolation Forest scanning; no persistent anomaly pattern detected',
        alertSeverity: 'normal',
        readings: { vibration: 1.80, tilt: 0.35, strain: 27, seismic: 4, gas: 0.82, gnssDisplacement: 1.20, riskPercent: 10 },
        insarStatus: 'Stable / Background Noise',
        miningFrontProgress: 0.50, terrainDeformation: 0.0, showFusionPanel: false, seismicCluster: false,
    },
    {
        id: 3, name: 'Fusion Gate Review', shortName: 'FUSION',
        startTime: 30, endTime: 40,
        alertMessage: 'STAGE 4: FUSION REVIEW — Transient IF flags observed; AND-gate unconfirmed (sensor-type condition not sustained)',
        alertSeverity: 'normal',
        readings: { vibration: 2.00, tilt: 0.40, strain: 30, seismic: 5, gas: 0.83, gnssDisplacement: -0.64, riskPercent: 12 },
        insarStatus: 'Minor Noise / No Pattern',
        miningFrontProgress: 0.72, terrainDeformation: 0.0, showFusionPanel: true, seismicCluster: false,
    },
    {
        id: 4, name: 'Extended Window', shortName: 'EXTENDED',
        startTime: 40, endTime: 50,
        alertMessage: 'STAGE 5: EXTENDED MONITORING — No correlated escalation across sensor array; ground surface stable',
        alertSeverity: 'normal',
        readings: { vibration: 1.90, tilt: 0.38, strain: 28, seismic: 4, gas: 0.82, gnssDisplacement: -1.50, riskPercent: 10 },
        insarStatus: 'Stable — No Trend',
        miningFrontProgress: 0.90, terrainDeformation: 0.0, showFusionPanel: true, seismicCluster: false,
    },
    {
        id: 5, name: 'No Event Confirmed', shortName: 'CLEAR',
        startTime: 50, endTime: 60,
        alertMessage: 'STAGE 6: NO EVENT CONFIRMED — Full monitoring window complete. Fusion gate remained open throughout — no sustained anomaly',
        alertSeverity: 'normal',
        readings: { vibration: 1.60, tilt: 0.30, strain: 24, seismic: 3, gas: 0.81, gnssDisplacement: -1.17, riskPercent: 7 },
        insarStatus: 'Clear — No Subsidence',
        miningFrontProgress: 1.00, terrainDeformation: 0.0, showFusionPanel: false, seismicCluster: false,
    },
];
export const SCENARIO_STAGE_DEFINITIONS = {
    scenario_0045: SCENARIO_0045_STAGES,
};
/** Returns the stage definitions for the given scenario (falls back to STAGE_DEFINITIONS). */
export function getScenarioStages(scenarioId) {
    return SCENARIO_STAGE_DEFINITIONS[scenarioId] ?? STAGE_DEFINITIONS;
}
/** getStageAtTime scoped to a specific scenario's stage definitions. */
export function getStageAtTimeForScenario(t, scenarioId) {
    const stages = getScenarioStages(scenarioId);
    const clamped = Math.max(0, Math.min(t, TOTAL_DURATION));
    for (let i = stages.length - 1; i >= 0; i--) {
        const stage = stages[i];
        if (clamped >= stage.startTime) {
            const duration = stage.endTime - stage.startTime;
            const progress = duration > 0 ? (clamped - stage.startTime) / duration : 0;
            return { stageIndex: i, progressInStage: Math.min(progress, 1) };
        }
    }
    return { stageIndex: 0, progressInStage: 0 };
}
