/**
 * FusionGatePanel — Fusion AND-Gate Narrative Display
 * ─────────────────────────────────────────────────────────────────────
 * Shows the real-time status of the rule-based fusion AND-gate for all
 * 5 monitoring nodes. This is the most narratively important part of
 * the pipeline — it shows how the system distinguishes real anomalies
 * from sensor noise/faults.
 *
 * Replaces/augments the generic SensorFusionPanel with data-faithful
 * per-gate status derived from the mock (or future live) pipeline.
 */

import { useSimulationStore } from '../../store/simulationStore'
import { usePipelineData } from '../../hooks/usePipelineData'
import { NodePipelineRecord } from '../../types/pipeline'

const NODE_LABELS: Record<string, string> = {
  'node-01': 'NODE-01\nMain Haulage',
  'node-02': 'NODE-02\nNorth Gate Face',
  'node-03': 'NODE-03\nPanel Crosscut',
  'node-04': 'NODE-04\nSouth Tail Gate',
  'node-05': 'NODE-05\nShaft Station',
}

const NODE_SHORT: Record<string, string> = {
  'node-01': 'N-01',
  'node-02': 'N-02',
  'node-03': 'N-03',
  'node-04': 'N-04',
  'node-05': 'N-05',
}

function gateIcon(pass: boolean) {
  return pass
    ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
    : <span style={{ color: '#475569', fontWeight: 700 }}>✗</span>
}

function flagIcon(flag: boolean) {
  return flag
    ? <span style={{ color: '#dc2626', fontWeight: 800 }}>● CONFIRMED</span>
    : <span style={{ color: '#475569' }}>○ open</span>
}

function NodeFusionRow({ rec }: { rec: NodePipelineRecord }) {
  const f = rec.fusion
  const if_flagged = rec.isolation_forest.if_flagged
  const nodeId = rec.node_id

  // Background intensity based on agreement score
  const bgAlpha = f.fusion_agreement_score * 0.18
  const rowBg = f.fusion_flag
    ? `rgba(220,38,38,${bgAlpha + 0.04})`
    : if_flagged
    ? `rgba(245,158,11,${bgAlpha + 0.02})`
    : 'transparent'

  return (
    <div
      className="fusion-gate-row"
      style={{ background: rowBg }}
    >
      {/* Node label */}
      <div className="fusion-gate-node-label">
        {NODE_SHORT[nodeId]}
      </div>

      {/* IF flagged indicator */}
      <div className="fusion-gate-cell" title="Isolation Forest flagged this node">
        {if_flagged
          ? <span style={{ color: '#f59e0b', fontSize: 9, fontWeight: 700 }}>⚠ IF</span>
          : <span style={{ color: '#475569', fontSize: 9 }}>—</span>}
      </div>

      {/* Gate 1: Persistence */}
      <div className="fusion-gate-cell" title="Persistence: repeated anomaly across timesteps">
        {gateIcon(f.persistence_check)}
      </div>

      {/* Gate 2: Neighbor */}
      <div className="fusion-gate-cell" title="Neighbor agreement: spatially adjacent nodes agree">
        {gateIcon(f.neighbor_agreement)}
      </div>

      {/* Gate 3: Sensor-type */}
      <div className="fusion-gate-cell" title="Sensor-type: vibration/piezo corroborates GNSS anomaly">
        {gateIcon(f.sensor_type_agreement)}
      </div>

      {/* Agreement score */}
      <div className="fusion-gate-cell" style={{ color: '#0ea5e9', fontFamily: 'monospace', fontSize: 10 }}>
        {(f.fusion_agreement_score * 100).toFixed(0)}%
      </div>

      {/* Final gate flag */}
      <div className="fusion-gate-cell fusion-gate-flag-cell">
        {flagIcon(f.fusion_flag)}
      </div>
    </div>
  )
}

// ── Gate explanation sidebar ────────────────────────────────────────
const GATE_EXPLANATIONS = [
  {
    icon: '🔁',
    name: 'Persistence',
    desc: 'Same node elevated anomaly for 4+ consecutive timesteps — not a one-off blip',
  },
  {
    icon: '🌐',
    name: 'Neighbor Agreement',
    desc: 'Spatially adjacent nodes show similar anomaly patterns — rules out single-sensor fault',
  },
  {
    icon: '🔌',
    name: 'Sensor-Type Agreement',
    desc: 'Vibration / piezo signal corroborates GNSS anomaly at same location',
  },
]

export function FusionGatePanel() {
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const { records, loading } = usePipelineData()

  // Only show this panel from stage 2 onwards (when fusion becomes relevant)
  // (or always if you prefer — kept optional here for narrative clarity)
  if (stageIndex < 2 || loading || records.length === 0) return null

  // Count confirmed nodes
  const confirmedCount = records.filter((r) => r.fusion.fusion_flag).length
  const flaggedCount = records.filter((r) => r.isolation_forest.if_flagged).length

  return (
    <div className="glass-panel fusion-gate-panel" id="fusion-gate-panel">

      {/* ── Header ── */}
      <div className="fusion-gate-header">
        <span className="fusion-gate-title">🔀 FUSION AND-GATE STATUS</span>
        <div className="fusion-gate-summary">
          <span style={{ color: '#f59e0b', fontSize: 10 }}>{flaggedCount} IF-flagged</span>
          <span style={{ color: '#475569', fontSize: 10 }}>·</span>
          <span style={{ color: confirmedCount > 0 ? '#dc2626' : '#64748b', fontSize: 10, fontWeight: 700 }}>
            {confirmedCount} confirmed
          </span>
        </div>
      </div>

      {/* ── Explanation: The AND-gate rule ── */}
      <div className="fusion-gate-rule-box">
        <div className="fusion-gate-rule-title">System rule: anomaly confirmed only when ALL 3 gates agree</div>
        <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
          Isolation Forest detection → Persistence AND Neighbor AND Sensor-Type → GRU/XGBoost
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="fusion-gate-table-header">
        <div className="fusion-gate-node-label" style={{ color: '#64748b' }}>NODE</div>
        <div className="fusion-gate-cell" style={{ color: '#f59e0b', fontSize: 9 }}>IF</div>
        <div className="fusion-gate-cell" title="Gate 1 — Persistence" style={{ color: '#64748b', fontSize: 9 }}>P</div>
        <div className="fusion-gate-cell" title="Gate 2 — Neighbor"    style={{ color: '#64748b', fontSize: 9 }}>N</div>
        <div className="fusion-gate-cell" title="Gate 3 — Sensor-Type" style={{ color: '#64748b', fontSize: 9 }}>S</div>
        <div className="fusion-gate-cell" style={{ color: '#0ea5e9',   fontSize: 9 }}>AGR%</div>
        <div className="fusion-gate-cell fusion-gate-flag-cell" style={{ color: '#64748b', fontSize: 9 }}>GATE</div>
      </div>

      {/* ── Rows ── */}
      <div className="fusion-gate-rows">
        {records.map((rec) => (
          <NodeFusionRow key={rec.node_id} rec={rec} />
        ))}
      </div>

      {/* ── Gate legend ── */}
      <div className="fusion-gate-legend">
        {GATE_EXPLANATIONS.map((g) => (
          <div key={g.name} className="fusion-gate-legend-item">
            <span>{g.icon}</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: 9 }}>{g.name}: </span>
              <span style={{ color: '#64748b', fontSize: 9 }}>{g.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
