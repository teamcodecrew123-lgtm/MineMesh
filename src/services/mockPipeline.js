/**
 * Mock ML Pipeline Data Generator
 * ─────────────────────────────────────────────────────────────────────
 * Generates deterministic, stage-faithful NodePipelineRecord[] data for
 * all 5 monitoring nodes at a given simulation timestep.
 *
 * Follows ML_Pipeline_Mock_Data_Spec.md exactly:
 *  - anomaly_score: LOWER = more anomalous (sklearn IF convention)
 *  - fusion_flag: only true when ALL 3 gates pass (AND-gate logic)
 *  - risk_class: monotonic function of risk_percent
 *  - gnss_displacement_mm: realistic small values, not always dramatic
 *  - Escalation narrative: early = IF flagged but fusion gate closed →
 *                          late  = all gates pass → Critical
 *
 * BACKEND SWITCH NOTE:
 *   This file is ONLY used by pipelineAdapter.ts when DATA_SOURCE='mock'.
 *   When real backend is ready, pipelineAdapter switches to live API
 *   and this file is never called.
 */
// NOTE: KalmanOutput removed — Kalman stage is not in the live pipeline.
// ── Node sensitivity profiles (mirrors sensorLayout.ts riskMultiplier) ──
const NODE_PROFILES = {
    'node-01': { riskMult: 0.60, noiseScale: 0.008, scenarioWeight: 0.9 },
    'node-02': { riskMult: 1.00, noiseScale: 0.005, scenarioWeight: 1.0 }, // near face — most sensitive
    'node-03': { riskMult: 0.88, noiseScale: 0.007, scenarioWeight: 0.95 },
    'node-04': { riskMult: 0.72, noiseScale: 0.009, scenarioWeight: 0.85 },
    'node-05': { riskMult: 0.12, noiseScale: 0.003, scenarioWeight: 0.3 }, // shaft reference — very stable
};
// ── Seeded pseudo-random (deterministic per node+timestep) ───────────
function seededRandom(seed) {
    const x = Math.sin(seed + 1) * 43758.5453123;
    return x - Math.floor(x);
}
function noise(nodeId, timestep, channel) {
    const seedBase = nodeId.charCodeAt(nodeId.length - 1) * 1000 + timestep * 13 + channel * 7;
    return (seededRandom(seedBase) - 0.5) * 2; // -1..1
}
// ── Global stage progression (0–60s mapped to 0–1) ──────────────────
function globalProgress(t) {
    return Math.max(0, Math.min(1, t / 60));
}
// ── Isolation Forest score generation ───────────────────────────────
// Normal range: ~+0.02 to +0.05 (normal)
// Anomalous:    ~-0.05 to -0.15 (flagged)
// sklearn convention: LOWER = MORE anomalous
function generateIsolationForest(nodeId, t, riskMult, prog) {
    const n = noise(nodeId, t, 1);
    const noiseAmt = 0.012;
    // Base score starts near +0.03 (normal), trends downward as risk rises
    // More negative = more anomalous
    const baseScore = 0.03 - prog * riskMult * 0.20;
    const anomaly_score = parseFloat((baseScore + n * noiseAmt).toFixed(4));
    // Threshold at -0.04: below this → flagged
    const if_flagged = anomaly_score < -0.04;
    return { anomaly_score, if_flagged };
}
// ── Fusion AND-gate logic ────────────────────────────────────────────
// Narrative:
//  t=0–20s  (prog 0–0.33): All gates false — baseline noise
//  t=20–30s (prog 0.33–0.5): persistence starts agreeing on high-risk nodes
//  t=30–40s (prog 0.5–0.67): persistence+neighbor agree, sensor-type still lagging
//  t=40–50s (prog 0.67–0.83): all 3 agree on node-02/03, partial on node-01/04
//  t=50–60s (prog 0.83–1.0): all 3 agree on node-01/02/03/04; node-05 still clean
function generateFusion(nodeId, t, riskMult, prog, ifFlagged) {
    // Scaled progress per node sensitivity
    const p = Math.min(1, prog * riskMult * 1.1);
    // Gate 1: Persistence — earliest to activate (needs ~20% of node's risk journey)
    const persistence_check = ifFlagged && p > 0.28;
    // Gate 2: Neighbor agreement — needs ~45% of journey
    const neighbor_agreement = ifFlagged && p > 0.45;
    // Gate 3: Sensor-type agreement — last to activate (~60%), represents
    // vibration+piezo hardware not yet in trained pipeline per spec
    const sensor_type_agreement = ifFlagged && p > 0.60;
    // Fusion flag: strict AND of all three
    const fusion_flag = persistence_check && neighbor_agreement && sensor_type_agreement;
    // Agreement score: weighted fraction (persistence=0.4, neighbor=0.35, type=0.25)
    const fusion_agreement_score = parseFloat(((persistence_check ? 0.40 : 0) +
        (neighbor_agreement ? 0.35 : 0) +
        (sensor_type_agreement ? 0.25 : 0)).toFixed(2));
    return {
        persistence_check,
        neighbor_agreement,
        sensor_type_agreement,
        fusion_agreement_score,
        fusion_flag,
    };
}
// ── GRU trend forecast ───────────────────────────────────────────────
// 2-class output: 'stable' | 'slowing' — matches real trained GRU model.
function generateTrend(prog, riskMult) {
    const p = prog * riskMult;
    if (p > 0.38)
        return 'stable';
    return 'slowing';
}
// ── XGBoost risk classification ──────────────────────────────────────
// risk_percent: 0–100, thresholds: 0–25 Low, 25–50 Watch, 50–75 Warning, 75–100 Critical
function riskClassFromPercent(pct) {
    if (pct >= 75)
        return 'Critical';
    if (pct >= 50)
        return 'Warning';
    if (pct >= 25)
        return 'Watch';
    return 'Low';
}
function generateXGBoost(nodeId, t, riskMult, prog) {
    const n = noise(nodeId, t, 5);
    // Base risk: 8% at start, escalates to ~92% max at node-02
    const baseRisk = 8 + prog * riskMult * 84 + n * 2.5;
    const risk_percent = parseFloat(Math.max(0, Math.min(100, baseRisk)).toFixed(1));
    const risk_class = riskClassFromPercent(risk_percent);
    return { risk_class, risk_percent };
}
// ── GNSS displacement generation ────────────────────────────────────
// Per spec: most nodes single-digit mm. Only extreme scenarios reach high values.
// Negative = subsidence (downward movement)
function generateGNSSDisplacement(nodeId, t, riskMult, prog) {
    const n = noise(nodeId, t, 2);
    // Baseline: -0.5mm. Peak at node-02 stage-6: ~-11.5mm (matches stageDefinitions)
    const peakDisplacement = -11.5 * riskMult;
    const displacement = -0.5 + prog * peakDisplacement + n * 0.15;
    return parseFloat(displacement.toFixed(2));
}
// ── Main generator function ──────────────────────────────────────────
/**
 * Generate pipeline records for ALL 5 monitoring nodes at timestep t.
 * Called by pipelineAdapter every simulation tick.
 *
 * @param elapsedSeconds - Simulation time 0–60
 * @returns Array of 5 NodePipelineRecord (one per node)
 */
export function generatePipelineData(elapsedSeconds, scenarioId) {
    const t = Math.round(elapsedSeconds); // quantize to integer timestep
    const prog = globalProgress(elapsedSeconds);
    const nodeIds = ['node-01', 'node-02', 'node-03', 'node-04', 'node-05'];
    return nodeIds.map((nodeId) => {
        const profile = NODE_PROFILES[nodeId];
        const riskMult = profile.riskMult;
        const n1 = noise(nodeId, t, 3);
        const n2 = noise(nodeId, t, 4);
        const gnssDisp = generateGNSSDisplacement(nodeId, t, riskMult, prog);
        const isoForest = generateIsolationForest(nodeId, t, riskMult, prog);
        const fusion = generateFusion(nodeId, t, riskMult, prog, isoForest.if_flagged);
        const { risk_class, risk_percent } = generateXGBoost(nodeId, t, riskMult, prog);
        const trend = generateTrend(prog, riskMult);
        return {
            node_id: nodeId,
            timestep: t,
            scenario_id: scenarioId,
            x_pos_m: 0,
            y_pos_m: 0,
            raw: {
                gnss_displacement_mm: gnssDisp,
                vibration_triggered: prog * riskMult > 0.30 || (n1 > 0.35 && prog > 0.15),
                piezo_amplitude: parseFloat((12 + prog * riskMult * 60 + n2 * 4).toFixed(1)),
            },
            isolation_forest: isoForest,
            fusion,
            gru: {
                trend,
            },
            xgboost: {
                risk_class,
                risk_percent,
            },
        };
    });
}
