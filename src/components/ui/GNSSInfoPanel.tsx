import { useSimulationStore } from '../../store/simulationStore'
import { GNSS_STATIONS, getGNSSReadings } from '../../data/sensorLayout'

export function GNSSInfoPanel() {
  const activePanel = useSimulationStore((s) => s.activePanel)
  const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId)
  const readings = useSimulationStore((s) => s.readings)
  const closePanel = useSimulationStore((s) => s.closePanel)
  const openGNSSGraph = useSimulationStore((s) => s.openGNSSGraph)

  if (activePanel !== 'gnss' || !selectedGNSSId) return null

  const station = GNSS_STATIONS.find((g) => g.id === selectedGNSSId)
  if (!station) return null

  const gnssR = getGNSSReadings(station, readings)

  const statusCls = {
    normal: 'normal',
    warning: 'warning',
    critical: 'critical',
  }[gnssR.status]

  return (
    <div className="glass-panel gnss-details-panel" id="gnss-details-panel">
      {/* ── Panel Header ── */}
      <div className="sensor-info-header">
        <div className="sensor-info-icon" style={{ background: '#e0f2fe', border: '1.5px solid #0284c7' }}>
          🛰️
        </div>
        <div style={{ flex: 1 }}>
          <div className="sensor-info-name">{station.code}</div>
          <div className="sensor-info-type">GEODETIC GNSS SURVEY STATION</div>
        </div>
        <button className="sensor-info-close" onClick={closePanel} title="Close (ESC)">
          ✕
        </button>
      </div>

      {/* Location tag */}
      <div style={{ marginBottom: 10, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span style={{ fontWeight: 600 }}>Location: </span>
        <span>{station.locationName}</span>
      </div>

      {/* ── GNSS Primary Measurements ── */}
      <div className="sensor-channels-list">
        {/* Vertical Displacement */}
        <div className="sensor-channel-row">
          <div className="sensor-channel-left">
            <span className="sensor-channel-icon">⬇️</span>
            <div>
              <div className="sensor-channel-name">Vertical Displacement (Δz)</div>
              <div className="sensor-channel-trend">
                <span className={gnssR.verticalDisplacement <= -3.0 ? 'sensor-trend-up' : 'sensor-trend-stable'}>
                  {gnssR.trend}
                </span>
              </div>
            </div>
          </div>
          <div className="sensor-channel-right">
            <div
              className="sensor-channel-val"
              style={{ color: gnssR.status === 'critical' ? '#dc2626' : gnssR.status === 'warning' ? '#d97706' : '#0284c7' }}
            >
              {gnssR.verticalDisplacement.toFixed(1)} mm
            </div>
            <span className={`sensor-status-badge ${statusCls}`}>
              {gnssR.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Horizontal Displacement */}
        <div className="sensor-channel-row">
          <div className="sensor-channel-left">
            <span className="sensor-channel-icon">➡️</span>
            <div>
              <div className="sensor-channel-name">Horizontal Shift (Δh)</div>
              <div className="sensor-channel-trend">Lateral Tension</div>
            </div>
          </div>
          <div className="sensor-channel-right">
            <div className="sensor-channel-val" style={{ color: '#0369a1' }}>
              {gnssR.horizontalDisplacement.toFixed(1)} mm
            </div>
          </div>
        </div>

        {/* Subsidence Rate / Velocity */}
        <div className="sensor-channel-row">
          <div className="sensor-channel-left">
            <span className="sensor-channel-icon">⏱️</span>
            <div>
              <div className="sensor-channel-name">Settlement Velocity</div>
              <div className="sensor-channel-trend">Instantaneous Rate</div>
            </div>
          </div>
          <div className="sensor-channel-right">
            <div className="sensor-channel-val" style={{ color: '#475569' }}>
              {gnssR.velocity.toFixed(2)} mm/s
            </div>
          </div>
        </div>
      </div>

      {/* ── View GNSS Graph Button (Requirement 8 & 11) ── */}
      <button
        className="sim-btn sim-btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: 8, marginBottom: 8 }}
        onClick={() => openGNSSGraph(station.id)}
      >
        📈 VIEW GNSS TIME-SERIES GRAPH
      </button>

      {/* Station Description Footer */}
      <div className="node-desc-box">{station.description}</div>
    </div>
  )
}
