import { useSimulationStore } from '../../store/simulationStore'
import { STAGE_DEFINITIONS, TOTAL_DURATION } from '../../data/stageDefinitions'

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function SimulationController() {
  const playing = useSimulationStore((s) => s.playing)
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const start = useSimulationStore((s) => s.start)
  const pause = useSimulationStore((s) => s.pause)
  const restart = useSimulationStore((s) => s.restart)
  const nextStage = useSimulationStore((s) => s.nextStage)
  const prevStage = useSimulationStore((s) => s.prevStage)

  const progress = (elapsedSeconds / TOTAL_DURATION) * 100
  const isFinished = elapsedSeconds >= TOTAL_DURATION
  const currentStage = STAGE_DEFINITIONS[stageIndex]

  return (
    <div className="sim-controller" id="sim-controller">
      {/* ── Active Stage Header ── */}
      <div className="glass-panel sim-stage-info" style={{ width: '100%' }}>
        <span className="sim-stage-badge">
          STAGE {stageIndex + 1} / {STAGE_DEFINITIONS.length}
        </span>
        <span className="sim-stage-name">{currentStage.name}</span>
        <div style={{ flex: 1 }} />
        <div className="sim-progress-track" style={{ width: 120 }}>
          <div
            className="sim-progress-fill"
            style={{ width: `${Math.min(progress, 100).toFixed(1)}%` }}
          />
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="sim-controls-row glass-panel">
        {/* Playback Clock */}
        <span className="sim-clock">{formatTime(elapsedSeconds)}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }}>
          / {formatTime(TOTAL_DURATION)}
        </span>

        <div className="sim-divider" />

        {/* PREVIOUS STAGE */}
        <button
          id="btn-prev-stage"
          className="sim-btn sim-btn-secondary"
          onClick={prevStage}
          disabled={stageIndex === 0 && elapsedSeconds === 0}
          title="Jump to previous stage"
        >
          ⏮ PREV
        </button>

        {/* START / PAUSE Button */}
        {playing ? (
          <button id="btn-pause" className="sim-btn sim-btn-primary" onClick={pause}>
            ⏸ PAUSE
          </button>
        ) : (
          <button
            id="btn-start"
            className="sim-btn sim-btn-primary"
            onClick={start}
            disabled={isFinished}
          >
            {isFinished ? '✓ COMPLETE' : elapsedSeconds === 0 ? '▶ START' : '▶ RESUME'}
          </button>
        )}

        {/* NEXT STAGE (Immediately skips to next stage) */}
        <button
          id="btn-next-stage"
          className="sim-btn sim-btn-secondary"
          onClick={nextStage}
          disabled={stageIndex >= STAGE_DEFINITIONS.length - 1}
          title="Skip immediately to next stage"
        >
          NEXT ⏭
        </button>

        <div className="sim-divider" />

        {/* RESTART Button */}
        <button id="btn-restart" className="sim-btn sim-btn-danger" onClick={restart}>
          ↺ RESTART
        </button>
      </div>
    </div>
  )
}
