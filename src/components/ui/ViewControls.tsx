import { useSimulationStore } from '../../store/simulationStore'

const VIEWS = [
  { mode: 'full' as const, label: 'FULL MINE', icon: '🔭' },
  { mode: 'surface' as const, label: 'SURFACE', icon: '🏔' },
  { mode: 'underground' as const, label: 'UNDERGROUND', icon: '⛏' },
  { mode: 'cutaway' as const, label: 'CUTAWAY', icon: '✂' },
]

export function ViewControls() {
  const viewMode = useSimulationStore((s) => s.viewMode)
  const setViewMode = useSimulationStore((s) => s.setViewMode)
  const resetCamera = useSimulationStore((s) => s.resetCamera)
  const closeAllPanels = useSimulationStore((s) => s.closeAllPanels)
  const activePanel = useSimulationStore((s) => s.activePanel)

  return (
    <div className="glass-panel camera-views-widget" id="camera-views-widget">
      <div className="camera-views-title">CAMERA VIEWS</div>
      <div className="camera-views-grid">
        {VIEWS.map(({ mode, label, icon }) => (
          <button
            key={mode}
            id={`view-${mode}`}
            className={`cam-view-btn ${viewMode === mode ? 'active' : ''}`}
            onClick={() => setViewMode(mode)}
            title={`Switch camera to ${label}`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Reset Camera Button */}
      <button
        id="btn-reset-camera"
        className="cam-view-btn reset-cam-btn"
        onClick={resetCamera}
        title="Reset camera orientation"
      >
        <span>🔄</span> RESET CAMERA
      </button>

      {/* Close All Button */}
      {activePanel && (
        <button
          id="btn-close-all"
          className="cam-view-btn close-all-btn"
          onClick={closeAllPanels}
          title="Close open panel (ESC)"
        >
          ✕ CLOSE ALL
        </button>
      )}
    </div>
  )
}
