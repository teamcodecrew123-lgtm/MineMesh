/**
 * MLPipelinePanel — Live ML Pipeline Visualization
 * ─────────────────────────────────────────────────────────────────────
 * Displays the full 6-stage ML pipeline output for the selected node
 * (or a global overview when no node is selected).
 *
 * Shows: RAW → ISOLATION FOREST → FUSION → GRU → XGBOOST
 * Updates in real-time as the simulation progresses through stages.
 */

import { useSimulationStore } from '../../store/simulationStore'
import { usePipelineData } from '../../hooks/usePipelineData'
import { NodePipelineRecord, RiskClass } from '../../types/pipeline'
import { getDataSource } from '../../services/pipelineAdapter'

// ── Color helpers ─────────────────────────────────────────────────────
function riskColor(cls: RiskClass): string {
  switch (cls) {
    case 'Critical': return '#dc2626'
    case 'Warning':  return '#f97316'
    case 'Watch':    return '#f59e0b'
    default:         return '#22c55e'
  }
}

function riskBg(cls: RiskClass): string {
  switch (cls) {
    case 'Critical': return 'rgba(220,38,38,0.12)'
    case 'Warning':  return 'rgba(249,115,22,0.12)'
    case 'Watch':    return 'rgba(245,158,11,0.12)'
    default:         return 'rgba(34,197,94,0.12)'
  }
}

function anomalyColor(score: number): string {
  if (score < -0.10) return '#dc2626'
  if (score < -0.06) return '#f97316'
  if (score < -0.02) return '#f59e0b'
  return '#22c55e'
}

function trendIcon(trend: string): string {
  if (trend === 'slowing') return '↘ slowing'
  return '→ stable'
}

function trendColor(trend: string): string {
  if (trend === 'slowing') return '#22c55e'
  return '#94a3b8'
}

// ── Stage header row ──────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { id: 'raw',    label: 'RAW',    icon: '📡' },
  { id: 'if',     label: 'ISO-F',  icon: '🔍' },
  { id: 'fusion', label: 'FUSION', icon: '🔀' },
  { id: 'gru',    label: 'GRU',    icon: '📈' },
  { id: 'xgb',    label: 'XGB',    icon: '🎯' },
]

function stageStatus(record: NodePipelineRecord, stageId: string): 'normal' | 'flagged' | 'warn' | 'critical' {
  const cls = record.xgboost.risk_class
  switch (stageId) {
    case 'raw':    return 'normal'
    case 'if':     return record.isolation_forest.if_flagged ? 'flagged' : 'normal'
    case 'fusion': return record.fusion.fusion_flag ? 'warn' : record.fusion.fusion_agreement_score > 0.4 ? 'flagged' : 'normal'
    case 'gru':    return 'normal'
    case 'xgb':    return cls === 'Critical' ? 'critical' : cls === 'Warning' ? 'warn' : cls === 'Watch' ? 'flagged' : 'normal'
    default:       return 'normal'
  }
}

const STATUS_COLORS: Record<string, string> = {
  normal:   '#22c55e',
  flagged:  '#f59e0b',
  warn:     '#f97316',
  critical: '#dc2626',
}
const STATUS_BG: Record<string, string> = {
  normal:   'rgba(34,197,94,0.08)',
  flagged:  'rgba(245,158,11,0.12)',
  warn:     'rgba(249,115,22,0.12)',
  critical: 'rgba(220,38,38,0.14)',
}

// ── Main Component ────────────────────────────────────────────────────
export function MLPipelinePanel() {
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const { records, loading, error, getRecord } = usePipelineData()

  // Show highest-risk node when none selected; else show selected
  const displayRecord: NodePipelineRecord | undefined = selectedNodeId
    ? getRecord(selectedNodeId)
    : records.sort((a, b) => b.xgboost.risk_percent - a.xgboost.risk_percent)[0]

  if (loading) {
    return (
      <div className="glass-panel ml-pipeline-panel" id="ml-pipeline-panel">
        <div className="ml-pipeline-header">
          <span className="ml-pipeline-title">⚙ ML PIPELINE</span>
          <span className="ml-source-badge">MOCK</span>
        </div>
        <div style={{ color: '#64748b', fontSize: 11, textAlign: 'center', padding: '12px 0' }}>
          Initialising pipeline data...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel ml-pipeline-panel" id="ml-pipeline-panel">
        <div className="ml-pipeline-header">
          <span className="ml-pipeline-title">⚙ ML PIPELINE</span>
        </div>
        <div style={{ color: '#dc2626', fontSize: 11 }}>Error: {error}</div>
      </div>
    )
  }

  if (!displayRecord) return null

  const rec = displayRecord
  const nodeLabel = rec.node_id.replace('node-', 'NODE-').toUpperCase()
  const rc = rec.xgboost.risk_class
  const scoreColor = anomalyColor(rec.isolation_forest.anomaly_score)
  const dataSource = getDataSource()

  return (
    <div className="glass-panel ml-pipeline-panel" id="ml-pipeline-panel">

      {/* ── Header ── */}
      <div className="ml-pipeline-header">
        <span className="ml-pipeline-title">⚙ ML PIPELINE</span>
        <span className="ml-node-badge">{nodeLabel}</span>
        <span
          className="ml-source-badge"
          title={dataSource === 'mock' ? 'Running on mock data — switch DATA_SOURCE in pipelineAdapter.ts to go live' : 'Connected to live backend'}
        >
          {dataSource === 'mock' ? '◎ MOCK' : '● LIVE'}
        </span>
      </div>

      {/* ── Stage Flow Strip ── */}
      <div className="ml-stage-strip">
        {PIPELINE_STAGES.map((stage, i) => {
          const st = stageStatus(rec, stage.id)
          const col = STATUS_COLORS[st]
          const bg  = STATUS_BG[st]
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className="ml-stage-chip"
                style={{ background: bg, border: `1px solid ${col}44`, color: col }}
                title={stage.label}
              >
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <span className="ml-stage-arrow">›</span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Stage Detail Rows ── */}
      <div className="ml-stage-details">

        {/* RAW SENSOR */}
        <div className="ml-detail-row">
          <div className="ml-detail-label">📡 RAW SENSOR</div>
          <div className="ml-detail-values">
            <span className="ml-val-chip">GNSS: <b>{rec.raw.gnss_displacement_mm.toFixed(2)} mm</b></span>
            <span className={`ml-val-chip ${rec.raw.vibration_triggered ? 'ml-chip-warn' : ''}`}>
              VIB: <b>{rec.raw.vibration_triggered ? 'TRIGGERED ⚡' : 'clear'}</b>
            </span>
            <span className="ml-val-chip">PIEZO: <b>{rec.raw.piezo_amplitude} u</b></span>
          </div>
        </div>

        {/* ISOLATION FOREST */}
        <div className="ml-detail-row">
          <div className="ml-detail-label">🔍 ISOLATION FOREST</div>
          <div className="ml-detail-values">
            <span className="ml-val-chip" style={{ color: scoreColor, borderColor: `${scoreColor}44` }}>
              score: <b>{rec.isolation_forest.anomaly_score.toFixed(4)}</b>
            </span>
            <span
              className={`ml-val-chip ${rec.isolation_forest.if_flagged ? 'ml-chip-warn' : 'ml-chip-ok'}`}
            >
              {rec.isolation_forest.if_flagged ? '⚠ FLAGGED' : '✓ NORMAL'}
            </span>
            <span className="ml-val-chip ml-chip-muted" title="sklearn convention: lower score = more anomalous">
              ↓ lower = anomalous
            </span>
          </div>
        </div>

        {/* FUSION AND-GATE */}
        <div className="ml-detail-row ml-fusion-row">
          <div className="ml-detail-label">🔀 FUSION AND-GATE</div>
          <div className="ml-fusion-gates">
            <GateChip label="Persist." pass={rec.fusion.persistence_check} />
            <span style={{ color: '#475569', fontSize: 10 }}>AND</span>
            <GateChip label="Neighbor" pass={rec.fusion.neighbor_agreement} />
            <span style={{ color: '#475569', fontSize: 10 }}>AND</span>
            <GateChip label="SensorT." pass={rec.fusion.sensor_type_agreement} />
            <span
              className={`ml-gate-badge ${rec.fusion.fusion_flag ? 'ml-gate-pass' : 'ml-gate-fail'}`}
            >
              {rec.fusion.fusion_flag ? '✓ CONFIRMED' : '✗ OPEN'}
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: '#64748b' }}>
            agreement: <b style={{ color: '#0ea5e9' }}>{(rec.fusion.fusion_agreement_score * 100).toFixed(0)}%</b>
          </div>
        </div>

        {/* GRU + XGBOOST side by side */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* GRU */}
          <div className="ml-detail-row" style={{ flex: 1 }}>
            <div className="ml-detail-label">📈 GRU TREND</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: trendColor(rec.gru.trend) }}>
              {trendIcon(rec.gru.trend)}
            </span>
          </div>

          {/* XGBOOST */}
          <div className="ml-detail-row" style={{ flex: 1 }}>
            <div className="ml-detail-label">🎯 XGBOOST</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                className="ml-risk-class-badge"
                style={{ background: riskBg(rc), color: riskColor(rc), border: `1px solid ${riskColor(rc)}44` }}
              >
                {rc.toUpperCase()}
              </span>
              {/* Risk bar */}
              <div className="ml-risk-bar-track">
                <div
                  className="ml-risk-bar-fill"
                  style={{
                    width: `${rec.xgboost.risk_percent}%`,
                    background: riskColor(rc),
                  }}
                />
              </div>
              <span style={{ fontSize: 9, color: '#64748b', textAlign: 'right' }}>
                {rec.xgboost.risk_percent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="ml-footer-note">
        t={rec.timestep}s · {rec.scenario_id} · {dataSource === 'mock' ? 'Scripted demo pipeline — GRU/XGBoost not yet trained' : 'Live pipeline output'}
      </div>
    </div>
  )
}

// ── Gate chip sub-component ───────────────────────────────────────────
function GateChip({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span
      className={`ml-gate-chip ${pass ? 'ml-gate-chip-pass' : 'ml-gate-chip-fail'}`}
    >
      {pass ? '✓' : '✗'} {label}
    </span>
  )
}
