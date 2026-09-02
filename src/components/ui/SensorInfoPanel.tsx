import { useSimulationStore } from '../../store/simulationStore'
import {
  MONITORING_NODES,
  INTERNAL_SENSORS,
  getNodeReadings,
  getNodeStatus,
  getSensorStatus,
} from '../../data/sensorLayout'
import { formatReading } from '../../data/interpolation'

export function SensorInfoPanel() {
  const activePanel = useSimulationStore((s) => s.activePanel)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const readings = useSimulationStore((s) => s.readings)
  const closePanel = useSimulationStore((s) => s.closePanel)
  const openSensorGraph = useSimulationStore((s) => s.openSensorGraph)
  const stageIndex = useSimulationStore((s) => s.stageIndex)

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
