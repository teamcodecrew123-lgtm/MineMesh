import { useSimulationStore } from '../../store/simulationStore'

/**
 * Small fixed badge rendered above the SimulationController.
 * Visible only during hero-node fetch loading or on error.
 * Disappears automatically once heroNodes populates successfully.
 * pointerEvents: none on the badge container; the Retry button restores pointer events.
 */
export function HeroNodesStatusBadge() {
  const heroNodes             = useSimulationStore((s) => s.heroNodes)
  const heroNodesLoading      = useSimulationStore((s) => s.heroNodesLoading)
  const heroNodesError        = useSimulationStore((s) => s.heroNodesError)
  const triggerHeroNodesRetry = useSimulationStore((s) => s.triggerHeroNodesRetry)

  if (heroNodesError) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 145,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(127, 29, 29, 0.92)',
        color: '#fca5a5',
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 10px 5px 14px',
        borderRadius: 6,
        border: '1px solid rgba(239,68,68,0.45)',
        backdropFilter: 'blur(8px)',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        <span>⚠ Sensor nodes unavailable — check backend connection</span>
        <button
          onClick={triggerHeroNodesRetry}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(239,68,68,0.18)',
            border: '1px solid rgba(239,68,68,0.45)',
            borderRadius: 4,
            color: '#fca5a5',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Retry now
        </button>
      </div>
    )
  }

  if (heroNodesLoading && heroNodes.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 145,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'rgba(15, 23, 42, 0.85)',
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 14px',
        borderRadius: 6,
        border: '1px solid rgba(148,163,184,0.20)',
        backdropFilter: 'blur(8px)',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        ◌ Loading sensor nodes...
      </div>
    )
  }

  return null
}
