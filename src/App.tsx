import { useState, useEffect } from 'react'
import { MineScene } from './components/scene/MineScene'
import { SimulationController } from './components/ui/SimulationController'
import { SensorInfoPanel } from './components/ui/SensorInfoPanel'
import { GNSSInfoPanel } from './components/ui/GNSSInfoPanel'
import { TimeSeriesGraphModal } from './components/ui/TimeSeriesGraphModal'
import { LayerControls } from './components/ui/LayerControls'
import { ViewControls } from './components/ui/ViewControls'
import { LiveDataNavbar } from './components/ui/LiveDataNavbar'
import { MLPipelinePanel } from './components/ui/MLPipelinePanel'
import { FusionGatePanel } from './components/ui/FusionGatePanel'
import { HeroNodesStatusBadge } from './components/ui/HeroNodesStatusBadge'
import { useSimulationStore } from './store/simulationStore'
import { useHeroNodes } from './hooks/useHeroNodes'

/** Mounts once; fetches hero nodes on scenarioId change and stores them in Zustand. */
function HeroNodesLoader() {
  useHeroNodes()
  return null
}

function App() {
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const readings = useSimulationStore((s) => s.readings)
  const closeAllPanels = useSimulationStore((s) => s.closeAllPanels)
  const [layersOpen, setLayersOpen] = useState(true)

  const riskPct = Math.round(readings.riskPercent)

  const riskStatus =
    riskPct >= 80 ? 'CRITICAL' : riskPct >= 60 ? 'HIGH' : riskPct >= 40 ? 'WARNING' : riskPct >= 20 ? 'MONITOR' : 'NORMAL'
  const riskColor =
    riskPct >= 80 ? '#dc2626' : riskPct >= 60 ? '#f97316' : riskPct >= 40 ? '#f59e0b' : '#10b981'

  // Global ESC key listener (Requirement 9 & 11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllPanels()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeAllPanels])

  return (
    <div className="app-shell">
      {/* Fetches hero nodes from backend on mount and on scenario change */}
      <HeroNodesLoader />

      {/* ── 3D Canvas (Primary Interactive Digital Twin View) ── */}
      <div className="canvas-container">
        <MineScene />
      </div>

      {/* ── Top Header Bar (Requirement 7 & 11) ── */}
      <header className="header-bar" id="header-bar">
        {/* Left: Brand / System Title */}
        <div className="header-logo">
          <div className="header-logo-icon">M</div>
          <div className="header-title-group">
            <span className="header-logo-text">MineMesh</span>
            <span className="header-logo-sub">3D Mine Subsidence Monitoring</span>
          </div>
        </div>

        <div className="header-divider" />

        {/* Right: Overall Mine Risk Status Tag */}
        <div className="header-risk-block">
          <span className="header-risk-label">OVERALL RISK</span>
          <span className="header-risk-val" style={{ color: riskColor }}>
            {riskPct}%
          </span>
          <span
            className="header-risk-badge"
            style={{
              background: `${riskColor}22`,
              color: riskColor,
              border: `1px solid ${riskColor}44`,
            }}
          >
            {riskStatus}
          </span>
        </div>
      </header>

      {/* ── Top-Left: Display Layers (Closable) ── */}
      <LayerControls isOpen={layersOpen} onClose={() => setLayersOpen(false)} />
      {!layersOpen && (
        <button
          className="glass-panel layer-reopen-btn"
          onClick={() => setLayersOpen(true)}
          title="Open display layers"
        >
          ☰ LAYERS
        </button>
      )}

      {/* ── Bottom-Left: Live Sensor Telemetry Navbar ── */}
      <LiveDataNavbar />

      {/* ── Hero node fetch status (loading / backend error) ── */}
      <HeroNodesStatusBadge />

      {/* ── Bottom-Center: Simulation Timeline Controls ── */}
      <SimulationController />

      {/* ── Bottom-Right: Camera Views Widget ── */}
      <ViewControls />

      {/* ── Right-Side Details Overlays (Single Active Panel) ── */}
      {/* 1. Underground Node Details Panel */}
      <SensorInfoPanel />

      {/* 2. Surface GNSS Details Panel */}
      <GNSSInfoPanel />

      {/* 3. Time-Series Graph Modal */}
      <TimeSeriesGraphModal />

      {/* ── ML Pipeline Panels ── */}
      {/* 4. Live ML pipeline stage-by-stage output panel */}
      <MLPipelinePanel />

      {/* 5. Fusion AND-gate per-node status (visible from stage 2+) */}
      <FusionGatePanel />

      {/* ── Critical Alert Flashing Red Perimeter in Final Stage ── */}
      {stageIndex >= 5 && <CriticalBorder />}
    </div>
  )
}

function CriticalBorder() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        border: '4px solid rgba(220,38,38,0.7)',
        boxShadow: 'inset 0 0 80px rgba(220,38,38,0.2)',
        zIndex: 50,
        animation: 'criticalPulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

export default App
