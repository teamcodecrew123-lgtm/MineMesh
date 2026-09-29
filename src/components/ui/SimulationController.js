import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore, SCENARIO_OPTIONS } from '../../store/simulationStore';
import { STAGE_DEFINITIONS, TOTAL_DURATION } from '../../data/stageDefinitions';
function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
export function SimulationController() {
    const playing = useSimulationStore((s) => s.playing);
    const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds);
    const scenarioId = useSimulationStore((s) => s.scenarioId);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const start = useSimulationStore((s) => s.start);
    const pause = useSimulationStore((s) => s.pause);
    const restart = useSimulationStore((s) => s.restart);
    const setScenario = useSimulationStore((s) => s.setScenario);
    const nextStage = useSimulationStore((s) => s.nextStage);
    const prevStage = useSimulationStore((s) => s.prevStage);
    const isFinished = elapsedSeconds >= TOTAL_DURATION;
    return (_jsxs("div", { className: "sim-controller", id: "sim-controller", children: [_jsxs("div", { className: "sim-controls-row glass-panel", children: [_jsx("span", { className: "sim-clock", children: formatTime(elapsedSeconds) }), _jsxs("span", { style: { fontSize: 11, color: 'var(--color-text-muted)', marginRight: 4 }, children: ["/ ", formatTime(TOTAL_DURATION)] }), _jsx("div", { className: "sim-divider" }), _jsx("button", { id: "btn-prev-stage", className: "sim-btn sim-btn-secondary", onClick: prevStage, disabled: stageIndex === 0 && elapsedSeconds === 0, title: "Jump to previous stage", children: "\u23EE PREV" }), playing ? (_jsx("button", { id: "btn-pause", className: "sim-btn sim-btn-primary", onClick: pause, children: "\u23F8 PAUSE" })) : (_jsx("button", { id: "btn-start", className: "sim-btn sim-btn-primary", onClick: start, disabled: isFinished, children: isFinished ? '✓ COMPLETE' : elapsedSeconds === 0 ? '▶ START' : '▶ RESUME' })), _jsx("button", { id: "btn-next-stage", className: "sim-btn sim-btn-secondary", onClick: nextStage, disabled: stageIndex >= STAGE_DEFINITIONS.length - 1, title: "Skip immediately to next stage", children: "NEXT \u23ED" }), _jsx("div", { className: "sim-divider" }), _jsx("button", { id: "btn-restart", className: "sim-btn sim-btn-danger", onClick: restart, children: "\u21BA RESTART" })] }), _jsxs("div", { className: "sim-scenario-row glass-panel", children: [_jsx("span", { className: "sim-scenario-label", children: "SCENARIO" }), SCENARIO_OPTIONS.map((opt) => (_jsx("button", { className: `sim-btn sim-btn-secondary sim-scenario-btn${scenarioId === opt.id ? ' sim-scenario-btn-active' : ''}`, onClick: () => setScenario(opt.id), title: opt.id, children: opt.label }, opt.id)))] })] }));
}
