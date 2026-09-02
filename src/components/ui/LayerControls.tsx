import { useSimulationStore, LayerVisibility } from '../../store/simulationStore'

interface LayerConfig {
  key: keyof LayerVisibility
  label: string
  color: string
}

const LAYERS: LayerConfig[] = [
  { key: 'surface', label: 'Terrain', color: '#65a30d' },
  { key: 'underground', label: 'Rock Strata', color: '#64748b' },
  { key: 'tunnels', label: 'Tunnels & Shaft', color: '#334155' },
  { key: 'miningPanels', label: 'Mining Panels', color: '#0f172a' },
  { key: 'miningFront', label: 'Mining Shearer', color: '#d97706' },
  { key: 'nodes', label: 'Monitoring Nodes', color: '#3b82f6' },
  { key: 'gnss', label: 'GNSS', color: '#0284c7' },
  { key: 'insar', label: 'InSAR', color: '#06b6d4' },
  { key: 'seismic', label: 'Microseismic', color: '#f97316' },
  { key: 'deformation', label: 'Deformation', color: '#ef4444' },
]

interface LayerControlsProps {
  isOpen: boolean
  onClose: () => void
}

export function LayerControls({ isOpen, onClose }: LayerControlsProps) {
  const layers = useSimulationStore((s) => s.layers)
  const toggleLayer = useSimulationStore((s) => s.toggleLayer)

  if (!isOpen) return null

  return (
    <div className="glass-panel layer-controls" id="layer-controls">
      <div className="layer-controls-header">
        <span className="layer-controls-title">DISPLAY LAYERS</span>
        <button
          className="layer-close-btn"
          onClick={onClose}
          title="Close display layers panel"
        >
          ✕
        </button>
      </div>
      <div className="layer-controls-list">
        {LAYERS.map(({ key, label, color }) => (
          <div
            key={key}
            className={`layer-toggle ${layers[key] ? 'active' : ''}`}
            onClick={() => toggleLayer(key)}
            id={`layer-${key}`}
            role="button"
            tabIndex={0}
          >
            <div className="layer-toggle-left">
              <div className="layer-toggle-dot" style={{ background: color }} />
              <span className="layer-toggle-label">{label}</span>
            </div>
            <div className="layer-toggle-switch" />
          </div>
        ))}
      </div>
    </div>
  )
}
