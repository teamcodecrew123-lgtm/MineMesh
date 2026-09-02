import { useSimulationStore } from '../../store/simulationStore'

export function LiveDataNavbar() {
  const readings = useSimulationStore((s) => s.readings)

  return (
    <div className="glass-panel live-data-navbar" id="live-data-navbar">
      <div className="live-data-title">LIVE SENSOR TELEMETRY</div>
      <div className="live-data-grid">
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#f97316' }}>VIBRATION</span>
          <span className="live-data-val">{readings.vibration.toFixed(2)} <span className="live-data-unit">mm/s</span></span>
        </div>
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#8b5cf6' }}>TILT</span>
          <span className="live-data-val">{readings.tilt.toFixed(2)} <span className="live-data-unit">μrad</span></span>
        </div>
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#10b981' }}>STRAIN</span>
          <span className="live-data-val">{readings.strain.toFixed(0)} <span className="live-data-unit">με</span></span>
        </div>
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#ef4444' }}>SEISMIC</span>
          <span className="live-data-val">{Math.round(readings.seismic)} <span className="live-data-unit">ev/hr</span></span>
        </div>
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#eab308' }}>GAS</span>
          <span className="live-data-val">{readings.gas.toFixed(2)}<span className="live-data-unit">%</span></span>
        </div>
        <div className="live-data-item">
          <span className="live-data-label" style={{ color: '#0284c7' }}>GNSS Δz</span>
          <span className="live-data-val" style={{ color: readings.gnssDisplacement <= -6.0 ? '#dc2626' : '#0284c7' }}>
            {readings.gnssDisplacement.toFixed(1)} <span className="live-data-unit">mm</span>
          </span>
        </div>
      </div>
    </div>
  )
}
