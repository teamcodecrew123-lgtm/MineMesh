import { useSimulationStore } from '../../store/simulationStore'
import {
  MONITORING_NODES,
  INTERNAL_SENSORS,
  getNodeReadings,
  getNodeStatus,
  getSensorStatus,
} from '../../data/sensorLayout'
import { formatReading } from '../../data/interpolation'
import { usePipelineData } from '../../hooks/usePipelineData'

export function SensorInfoPanel() {
  const activePanel = useSimulationStore((s) => s.activePanel)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const readings = useSimulationStore((s) => s.readings)
  const closePanel = useSimulationStore((s) => s.closePanel)
  const openSensorGraph = useSimulationStore((s) => s.openSensorGraph)
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const { getRecord } = usePipelineData()

  if (activePanel !== 'node' || !selectedNodeId) return null

  const node = MONITORING_NODES.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const nodeReadings = getNodeReadings(node, readings)
  const overallStatus = getNodeStatus(nodeReadings)

  const statusBadge = {
    normal: { text: 'NORMAL', cls: 'normal' },
    warning: { text: 'WARNING', cls: 'warning' },
    critical: { text: 'CRITICAL', cls: 'critical' },
  }[overallStatus]

  return (
    <div className="glass-panel node-details-panel" id="node-details-panel">
      {/* ── Panel Header ── */}
      <div className="sensor-info-header">
        <div className="sensor-info-icon" style={{ background: '#dbeafe', border: '1.5px solid #3b82f6' }}>
          📡
        </div>
        <div style={{ flex: 1 }}>
          <div className="sensor-info-name">{node.code}</div>
          <div className="sensor-info-type">MULTI-SENSOR MONITORING NODE</div>
        </div>
        <button className="sensor-info-close" onClick={closePanel} title="Close (ESC)">
          ✕
        </button>
      </div>

      {/* Location tag */}
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span style={{ fontWeight: 600 }}>Location: </span>
        <span>{node.locationName}</span>
      </div>

      {/* ── Overall Node Status & Risk ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.03)',
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            NODE RISK
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color:
                nodeReadings.riskPercent >= 80
                  ? '#dc2626'
                  : nodeReadings.riskPercent >= 35
                  ? '#d97706'
                  : '#10b981',
            }}
          >
            {nodeReadings.riskPercent}%
          </div>
        </div>
        <span className={`sensor-status-badge ${statusBadge.cls}`}>{statusBadge.text}</span>
      </div>

      {/* ── Internal Sensor Array Schematic (5 Internal Sensors) ── */}
      <div className="internal-architecture-card">
        <div className="internal-arch-header">
          <span>📦 INTERNAL MULTI-SENSOR ARRAY (5 SENSORS)</span>
        </div>
        <div className="internal-arch-grid">
          {INTERNAL_SENSORS.map((s) => (
            <span
              key={s.key}
              className="internal-arch-tag"
              onClick={() => openSensorGraph(node.id, s.key)}
              style={{ cursor: 'pointer' }}
              title={`Click to view ${s.name} graph`}
            >
              {s.icon} {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Individual Live Channel Readings ── */}
      <div className="sensor-channels-list">
        {INTERNAL_SENSORS.map((sensor) => {
          const val = nodeReadings[sensor.key]
          const sensStatus = getSensorStatus(sensor.key, val)
          const isElevated = sensStatus !== 'normal' && stageIndex > 0
          const trend =
            stageIndex === 0
              ? 'Stable'
              : isElevated
              ? '↑ Increasing'
              : 'Normal'

          return (
            <div
              key={sensor.key}
              className="sensor-channel-row sensor-channel-clickable"
              onClick={() => openSensorGraph(node.id, sensor.key)}
              title="Click to view time-series graph"
            >
              <div className="sensor-channel-left">
                <span className="sensor-channel-icon">{sensor.icon}</span>
                <div>
                  <div className="sensor-channel-name">{sensor.name}</div>
                  <div className="sensor-channel-trend">
                    <span className={isElevated ? 'sensor-trend-up' : 'sensor-trend-stable'}>
                      {trend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sensor-channel-right">
                <div
                  className="sensor-channel-val"
                  style={{
                    color:
                      sensStatus === 'critical'
                        ? '#dc2626'
                        : sensStatus === 'warning'
                        ? '#d97706'
                        : '#0f172a',
                  }}
                >
                  {formatReading(sensor.key, val)}
                </div>
                <span className={`sensor-status-badge ${sensStatus}`} style={{ fontSize: 9 }}>
                  {sensStatus.toUpperCase()}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── ML Pipeline Section ── */}
      {(() => {
        const pipeRec = getRecord(node.id)
        if (!pipeRec) return null
        const ifo = pipeRec.isolation_forest
        const fus = pipeRec.fusion
        const xgb = pipeRec.xgboost
        const scoreCol = ifo.anomaly_score < -0.10 ? '#dc2626' : ifo.anomaly_score < -0.04 ? '#f97316' : '#22c55e'
        const riskCol = xgb.risk_class === 'Critical' ? '#dc2626' : xgb.risk_class === 'Warning' ? '#f97316' : xgb.risk_class === 'Watch' ? '#f59e0b' : '#22c55e'
        return (
          <div style={{ marginBottom: 10, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.06em' }}>⚙ ML PIPELINE OUTPUT</div>

            {/* Anomaly Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>🔍 Anomaly Score <span style={{ fontSize: 9, color: '#94a3b8' }}>(↓ lower = worse)</span></span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: scoreCol }}>
                  {ifo.anomaly_score.toFixed(4)}
                </span>
                {ifo.if_flagged && (
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#d97706', fontWeight: 700 }}>FLAGGED</span>
                )}
              </div>
            </div>

            {/* Fusion Gate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>🔀 Fusion AND-Gate</span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: fus.persistence_check ? '#22c55e' : '#94a3b8' }} title="Persistence gate">{fus.persistence_check ? '✓P' : '✗P'}</span>
                <span style={{ fontSize: 9, color: fus.neighbor_agreement ? '#22c55e' : '#94a3b8' }} title="Neighbor agreement gate">{fus.neighbor_agreement ? '✓N' : '✗N'}</span>
                <span style={{ fontSize: 9, color: fus.sensor_type_agreement ? '#22c55e' : '#94a3b8' }} title="Sensor-type agreement gate">{fus.sensor_type_agreement ? '✓S' : '✗S'}</span>
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                  background: fus.fusion_flag ? 'rgba(220,38,38,0.12)' : 'rgba(71,85,105,0.10)',
                  color: fus.fusion_flag ? '#dc2626' : '#64748b' }}>
                  {fus.fusion_flag ? '● CONFIRMED' : '○ open'}
                </span>
              </div>
            </div>

            {/* XGBoost Risk Class */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>🎯 XGBoost Risk</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ width: 60, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${xgb.risk_percent}%`, height: '100%', background: riskCol, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700,
                  background: `${riskCol}1a`, color: riskCol }}>
                  {xgb.risk_class}
                </span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── View Sensor Trends Button (Requirement 7 & 10) ── */}
      <button
        className="sim-btn sim-btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: 6, marginBottom: 8 }}
        onClick={() => openSensorGraph(node.id, 'vibration')}
      >
        📈 VIEW SENSOR TRENDS
      </button>

      {/* Node Description Footer */}
      <div className="node-desc-box">{node.description}</div>
    </div>
  )
}
