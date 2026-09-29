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
// 2-class output matching the real trained GRU model (no 'accelerating' class).
export type TrendEnum = 'stable' | 'slowing'

// ── Stage 1: Raw sensor reading ─────────────────────────────────────
export interface RawSensorData {
  /** Vertical GNSS displacement in mm (negative = subsidence) */
  gnss_displacement_mm: number
  /** SW-420 vibration module — triggered above threshold? */
  vibration_triggered: boolean
  /** Piezo disc amplitude (arbitrary units from ADC) */
  piezo_amplitude: number
}

// ── Stage 2: Kalman filter — REMOVED ────────────────────────────────
// Kalman was evaluated and deferred: never validated on real sensor data.
// KalmanOutput and the 'kalman' field on NodePipelineRecord have been removed.
// The live pipeline goes: RAW → ISOLATION FOREST → FUSION → GRU → XGBOOST.

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
//
// MAPPING: real fusion system → UI display fields
// ─────────────────────────────────────────────────────────────────────
// The three boolean fields below are INFORMATIONAL / DISPLAY ONLY.
// They do NOT gate fusion_flag — fusion_flag is passed through directly
// from the real backend's fusion_confirmed value (score >= 3 of 4
// signals). The booleans are approximations for the 3-chip UI only.
//
//   neighbor_agreement      = real spatial neighbor-agreement signal (1:1 match)
//
//   sensor_type_agreement   = true iff BOTH vibration AND piezo signals are
//                             independently elevated; approximates "multiple
//                             sensor types agree" — not a direct backend field
//
//   persistence_check       = RELABELING: maps to the real Isolation Forest
//                             flagged signal, NOT literal persistence-over-time.
//                             Name kept for UI label continuity only.
//
//   fusion_flag             = real fusion_confirmed (score >= 3 of 4 signals),
//                             passed through directly. NOT computed as AND of
//                             the three booleans above.
//
//   fusion_agreement_score  = real fusion_score / 4, normalised to [0, 1]
// ─────────────────────────────────────────────────────────────────────
export interface FusionOutput {
  /** Display only — see mapping comment above. */
  persistence_check: boolean
  /** 1:1 match with real spatial neighbor-agreement signal. */
  neighbor_agreement: boolean
  /** Display only — see mapping comment above. */
  sensor_type_agreement: boolean
  /** real fusion_score / 4, normalised to [0, 1]. */
  fusion_agreement_score: number
  /** real fusion_confirmed (score >= 3 of 4 signals). NOT derived from the three booleans above. */
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
  /** Real-world East position in metres, domain ±1183.4m centred at 0 */
  x_pos_m: number
  /** Real-world North position in metres, domain ±1183.4m centred at 0 */
  y_pos_m: number

  raw: RawSensorData
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
