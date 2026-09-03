/**
 * ML Pipeline Data Contract
 * ─────────────────────────────────────────────────────────────────────
 * This file defines the TypeScript types for the ML pipeline output at
 * each stage, exactly matching ML_Pipeline_Mock_Data_Spec.md.
 *
 * BACKEND SWITCH NOTE:
 *   All types here define the contract between frontend and backend.
 *   When the real backend is ready, pipelineAdapter.ts is the ONLY
 *   file that needs to change — these types remain identical.
 */

// ── XGBoost output risk classification ──────────────────────────────
export type RiskClass = 'Low' | 'Watch' | 'Warning' | 'Critical'

// ── GRU trend prediction ────────────────────────────────────────────
export type TrendEnum = 'accelerating' | 'stable' | 'slowing'

// ── Stage 1: Raw sensor reading ─────────────────────────────────────
export interface RawSensorData {
  /** Vertical GNSS displacement in mm (negative = subsidence) */
  gnss_displacement_mm: number
  /** SW-420 vibration module — triggered above threshold? */
  vibration_triggered: boolean
  /** Piezo disc amplitude (arbitrary units from ADC) */
  piezo_amplitude: number
}

// ── Stage 2: Kalman filter output ───────────────────────────────────
export interface KalmanOutput {
  /** Smoothed vertical displacement estimate (same units as raw, less noisy) */
  displacement_smoothed_mm: number
}

// ── Stage 3: Isolation Forest output ────────────────────────────────
export interface IsolationForestOutput {
  /**
   * sklearn IsolationForest score convention:
   *   LOWER (more negative) = MORE anomalous
   *   Typical range: -0.15 (very anomalous) to +0.05 (very normal)
   *   Mock "rising risk" should trend this value downward.
   */
  anomaly_score: number
  /** true when anomaly_score crosses the calibrated threshold */
  if_flagged: boolean
}

// ── Stage 4: Rule-based fusion AND-gate ────────────────────────────
export interface FusionOutput {
  /**
   * Gate 1 — Persistence check:
   * Same node shows elevated anomaly score across multiple timesteps,
   * not just a single noisy blip.
   */
  persistence_check: boolean
  /**
   * Gate 2 — Neighbor agreement:
   * Spatially adjacent nodes also show elevated anomaly scores —
   * rules out single-sensor hardware fault.
   */
  neighbor_agreement: boolean
  /**
   * Gate 3 — Sensor-type agreement:
   * Multiple sensor types at/near this location agree
   * (e.g. vibration/piezo corroborates GNSS anomaly).
   */
  sensor_type_agreement: boolean
  /**
   * Weighted fraction of sub-checks that agree (0.0 – 1.0).
   * Even when fusion_flag is false, this shows partial agreement.
   */
  fusion_agreement_score: number
  /**
   * TRUE only when ALL THREE gates pass (AND logic).
   * Only then does the pipeline proceed to GRU/XGBoost.
   * This is the most defensible engineered part of the system.
   */
  fusion_flag: boolean
}

// ── Stage 5: GRU trend forecast (optional / stretch goal) ───────────
export interface GRUOutput {
  /** Displacement trend forecast based on recent GNSS time-series */
  trend: TrendEnum
}

// ── Stage 6: XGBoost final classification ───────────────────────────
export interface XGBoostOutput {
  /**
   * Graded alert class:
   *   risk_percent 0–25   → Low
   *   risk_percent 25–50  → Watch
   *   risk_percent 50–75  → Warning
   *   risk_percent 75–100 → Critical
   * (Real boundaries will be learned by model — thresholds are illustrative)
   */
  risk_class: RiskClass
  /** Continuous score behind the class (0–100), for gauge/gradient display */
  risk_percent: number
}

// ── Full per-node per-timestep record ───────────────────────────────
/**
 * This is the shape of a single "reading" arriving per monitoring node
 * per simulation timestep. Matches the JSON example in spec Section 2.
 */
export interface NodePipelineRecord {
  /** Node identifier — maps to MonitoringNode.id in sensorLayout.ts */
  node_id: string
  /** Integer simulation timestep (0–60) */
  timestep: number
  /** Scenario identifier for the current simulation run */
  scenario_id: string

  raw: RawSensorData
  kalman: KalmanOutput
  isolation_forest: IsolationForestOutput
  fusion: FusionOutput
  gru: GRUOutput
  xgboost: XGBoostOutput
}

// ── Pipeline stage metadata for UI visualization ────────────────────
export interface PipelineStageStatus {
  name: string
  shortName: string
  status: 'pending' | 'active' | 'done' | 'flagged'
  value?: string
}
