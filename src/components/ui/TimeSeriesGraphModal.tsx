import { useMemo, useState, useEffect } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import {
  MONITORING_NODES,
  GNSS_STATIONS,
  INTERNAL_SENSORS,
  getNodeTimeSeries,
  getGNSSTimeSeries,
  getNodeReadings,
  getGNSSReadings,
} from '../../data/sensorLayout'
import { formatReading } from '../../data/interpolation'

export function TimeSeriesGraphModal() {
  const activePanel = useSimulationStore((s) => s.activePanel)
  const selectedNodeId = useSimulationStore((s) => s.selectedNodeId)
  const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId)
  const selectedGraphSensor = useSimulationStore((s) => s.selectedGraphSensor)
  const openSensorGraph = useSimulationStore((s) => s.openSensorGraph)
  const closePanel = useSimulationStore((s) => s.closePanel)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const readings = useSimulationStore((s) => s.readings)

  const isNodeGraph = activePanel === 'sensorGraph' && !!selectedNodeId
  const isGNSSGraph = activePanel === 'gnssGraph' && !!selectedGNSSId

  const [gnssMode, setGnssMode] = useState<'vertical' | 'horizontal'>('vertical')

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closePanel])

  if (!isNodeGraph && !isGNSSGraph) return null

  const node = selectedNodeId ? MONITORING_NODES.find((n) => n.id === selectedNodeId) : null
  const gnss = selectedGNSSId ? GNSS_STATIONS.find((g) => g.id === selectedGNSSId) : null

  const currentSensorKey = selectedGraphSensor || 'vibration'
  const activeSensorInfo = INTERNAL_SENSORS.find((s) => s.key === currentSensorKey)!

  return (
    <div className="glass-panel time-series-modal" id="time-series-modal">
      {/* ── Modal Header ── */}
      <div className="modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {isNodeGraph && node && `${node.code} — SENSOR TIME SERIES`}
              {isGNSSGraph && gnss && `${gnss.code} — GEODETIC DISPLACEMENT TREND`}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
              60-Second Deterministic Simulation Lifecycle Data
            </div>
          </div>
        </div>
        <button className="sensor-info-close" onClick={closePanel} title="Close graph (ESC)">
          ✕
        </button>
      </div>

      {/* ── Channel Selector Tabs ── */}
      {isNodeGraph && node && (
        <div className="graph-tabs-row">
          {INTERNAL_SENSORS.map((s) => (
            <button
              key={s.key}
              className={`graph-tab-btn ${currentSensorKey === s.key ? 'active' : ''}`}
              onClick={() => openSensorGraph(node.id, s.key)}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      )}

      {isGNSSGraph && gnss && (
        <div className="graph-tabs-row">
          <button
            className={`graph-tab-btn ${gnssMode === 'vertical' ? 'active' : ''}`}
            onClick={() => setGnssMode('vertical')}
          >
            ⬇️ Vertical Displacement (Δz)
          </button>
          <button
            className={`graph-tab-btn ${gnssMode === 'horizontal' ? 'active' : ''}`}
            onClick={() => setGnssMode('horizontal')}
          >
            ➡️ Horizontal Displacement (Δh)
          </button>
        </div>
      )}

      {/* ── SVG Time Series Chart Component ── */}
      {isNodeGraph && node && (
        <NodeSensorChart
          node={node}
          sensorInfo={activeSensorInfo}
          elapsedSeconds={elapsedSeconds}
          globalReadings={readings}
        />
      )}

      {isGNSSGraph && gnss && (
        <GNSSChart
          station={gnss}
          mode={gnssMode}
          elapsedSeconds={elapsedSeconds}
          globalReadings={readings}
        />
      )}
    </div>
  )
}

function NodeSensorChart({
  node,
  sensorInfo,
  elapsedSeconds,
  globalReadings,
}: {
  node: any
  sensorInfo: any
  elapsedSeconds: number
  globalReadings: any
}) {
  const points = useMemo(() => getNodeTimeSeries(node, sensorInfo.key), [node, sensorInfo])
  const nodeReadings = getNodeReadings(node, globalReadings)
  const currentVal = nodeReadings[sensorInfo.key]

  const maxVal = Math.max(...points.map((p) => p.value), sensorInfo.criticalThreshold * 1.15)
  const minVal = Math.min(0, ...points.map((p) => p.value))

  // Chart Dimensions
  const W = 460
  const H = 160
  const padL = 45
  const padR = 20
  const padT = 15
  const padB = 25

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const getX = (t: number) => padL + (t / 60) * plotW
  const getY = (v: number) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.time).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ')

  const currentX = getX(elapsedSeconds)
  const currentY = getY(currentVal)

  return (
    <div>
      {/* Live Readout Header */}
      <div className="chart-live-header">
        <div>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            CURRENT VALUE:
          </span>{' '}
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-brand)' }}>
            {formatReading(sensorInfo.key, currentVal)}
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Normal Limit: <b style={{ color: '#166534' }}>{sensorInfo.normalRange}</b>
        </div>
      </div>

      {/* SVG Plot */}
      <svg className="time-series-svg" viewBox={`0 0 ${W} ${H}`}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
          const val = minVal + frac * (maxVal - minVal)
          const y = getY(val)
          return (
            <g key={frac}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                {val.toFixed(sensorInfo.key === 'gas' ? 1 : 0)}
              </text>
            </g>
          )
        })}

        {/* Warning Threshold Line */}
        {sensorInfo.warningThreshold < maxVal && (
          <line
            x1={padL}
            y1={getY(sensorInfo.warningThreshold)}
            x2={W - padR}
            y2={getY(sensorInfo.warningThreshold)}
            stroke="#f59e0b"
            strokeDasharray="4,2"
            strokeWidth="1.2"
          />
        )}

        {/* Trend Area Fill */}
        <path
          d={`${pathD} L ${getX(60)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`}
          fill="rgba(59, 130, 246, 0.08)"
        />

        {/* Trend Curve Line */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

        {/* Live Elapsed Time Vertical Scrubber Line */}
        <line
          x1={currentX}
          y1={padT}
          x2={currentX}
          y2={padT + plotH}
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="2,2"
        />

        {/* Live Highlight Point */}
        <circle cx={currentX} cy={currentY} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

        {/* Time X-axis labels */}
        {[0, 10, 20, 30, 40, 50, 60].map((t) => (
          <text key={t} x={getX(t)} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
            {t}s
          </text>
        ))}
      </svg>
    </div>
  )
}

function GNSSChart({
  station,
  mode,
  elapsedSeconds,
  globalReadings,
}: {
  station: any
  mode: 'vertical' | 'horizontal'
  elapsedSeconds: number
  globalReadings: any
}) {
  const points = useMemo(() => getGNSSTimeSeries(station), [station])
  const gnssR = getGNSSReadings(station, globalReadings)
  const currentVal = mode === 'vertical' ? gnssR.verticalDisplacement : gnssR.horizontalDisplacement

  const values = points.map((p) => (mode === 'vertical' ? p.vertical : p.horizontal))
  const minVal = Math.min(...values, mode === 'vertical' ? -12 : 0)
  const maxVal = Math.max(...values, mode === 'vertical' ? 0 : 3.0)

  const W = 460
  const H = 160
  const padL = 45
  const padR = 20
  const padT = 15
  const padB = 25

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const getX = (t: number) => padL + (t / 60) * plotW
  const getY = (v: number) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH

  const pathD = points
    .map((p, idx) => {
      const v = mode === 'vertical' ? p.vertical : p.horizontal
      return `${idx === 0 ? 'M' : 'L'} ${getX(p.time).toFixed(1)} ${getY(v).toFixed(1)}`
    })
    .join(' ')

  const currentX = getX(elapsedSeconds)
  const currentY = getY(currentVal)

  return (
    <div>
      <div className="chart-live-header">
        <div>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {mode === 'vertical' ? 'VERTICAL DISPLACEMENT (Δz):' : 'HORIZONTAL SHIFT (Δh):'}
          </span>{' '}
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0284c7' }}>
            {currentVal.toFixed(1)} mm
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          Status: <b style={{ color: gnssR.status === 'critical' ? '#dc2626' : '#0284c7' }}>{gnssR.status.toUpperCase()}</b>
        </div>
      </div>

      <svg className="time-series-svg" viewBox={`0 0 ${W} ${H}`}>
        {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
          const val = minVal + frac * (maxVal - minVal)
          const y = getY(val)
          return (
            <g key={frac}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}

        <path
          d={`${pathD} L ${getX(60)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`}
          fill="rgba(2, 132, 199, 0.08)"
        />

        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

        <line
          x1={currentX}
          y1={padT}
          x2={currentX}
          y2={padT + plotH}
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="2,2"
        />

        <circle cx={currentX} cy={currentY} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />

        {[0, 10, 20, 30, 40, 50, 60].map((t) => (
          <text key={t} x={getX(t)} y={H - 6} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
            {t}s
          </text>
        ))}
      </svg>
    </div>
  )
}
