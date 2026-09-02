import { useState, useEffect } from 'react'
import { useSimulationStore } from '../../store/simulationStore'

const PIPELINE_STEPS = ['RAW DATA', 'CLEANING', 'STATE EST.', 'ANOMALY DET.', 'FUSION', 'RISK', '3D VIZ']

const SIGNALS = [
  { name: 'Vibration', icon: '📳' },
  { name: 'Tilt', icon: '📐' },
  { name: 'Strain', icon: '📏' },
  { name: 'Microseismic', icon: '🌊' },
  { name: 'Gas', icon: '💨' },
]

export function SensorFusionPanel() {
  const showFusionPanel = useSimulationStore((s) => s.showFusionPanel)
  const [activeStep, setActiveStep] = useState(0)
  const [showCorrelated, setShowCorrelated] = useState(false)

  useEffect(() => {
    if (!showFusionPanel) {
      setActiveStep(0)
      setShowCorrelated(false)
      return
    }
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= PIPELINE_STEPS.length - 1) {
          clearInterval(timer)
          setTimeout(() => setShowCorrelated(true), 300)
          return prev
        }
        return prev + 1
      })
    }, 400)
    return () => clearInterval(timer)
  }, [showFusionPanel])

  if (!showFusionPanel) return null

  return (
    <div className="glass-panel fusion-panel" id="fusion-panel">
      <div className="fusion-title">⚙ Multi-Node Sensor Fusion Pipeline</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        {SIGNALS.map((sig, i) => (
          <div
            key={sig.name}
            style={{
              padding: '3px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#991b1b',
              opacity: activeStep > i ? 1 : 0.35,
              transition: 'opacity 0.4s',
            }}
          >
            {sig.icon} {sig.name} ↑
          </div>
        ))}
      </div>
      <div className="fusion-pipeline">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              className={`fusion-step-box ${
                i === activeStep ? 'active' : i < activeStep ? 'done' : 'pending'
              }`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              {step}
            </div>
            {i < PIPELINE_STEPS.length - 1 && <span className="fusion-arrow">›</span>}
          </div>
        ))}
      </div>
      {showCorrelated && (
        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#991b1b',
            padding: '7px 14px',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 8,
            animation: 'bannerIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          ✓ 5-NODE MULTI-SENSOR CORRELATION CONFIRMED — CRITICAL SUBSIDENCE
        </div>
      )}
    </div>
  )
}
