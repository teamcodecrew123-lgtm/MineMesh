import { useSimulationStore } from '../../store/simulationStore'

export function RiskGauge() {
  const readings = useSimulationStore((s) => s.readings)
  const risk = readings.riskPercent

  const radius = 38
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - risk / 100)

  const getColor = (r: number) => {
    if (r >= 80) return '#dc2626'
    if (r >= 60) return '#ef4444'
    if (r >= 40) return '#f97316'
    if (r >= 20) return '#f59e0b'
    return '#22c55e'
  }

  const getStatus = (r: number) => {
    if (r >= 85) return { label: 'CRITICAL', cls: 'critical' }
    if (r >= 60) return { label: 'HIGH RISK', cls: 'high-risk' }
    if (r >= 35) return { label: 'WARNING', cls: 'warning' }
    return { label: 'NORMAL', cls: 'normal' }
  }

  const color = getColor(risk)
  const status = getStatus(risk)

  return (
    <div className="glass-panel risk-gauge-panel" id="risk-gauge">
      <div className="risk-gauge-title">Overall Risk</div>
      <div className="risk-gauge-ring">
        <svg viewBox="0 0 100 100">
          <circle
            className="risk-gauge-bg"
            cx="50"
            cy="50"
            r={radius}
          />
          <circle
            className="risk-gauge-fill"
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="risk-gauge-center">
          <span className="risk-gauge-value" style={{ color }}>
            {Math.round(risk)}
          </span>
          <span className="risk-gauge-pct">%</span>
        </div>
      </div>
      <div className={`risk-status-badge ${status.cls}`}>{status.label}</div>
    </div>
  )
}
