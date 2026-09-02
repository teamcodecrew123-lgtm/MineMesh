import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
const VIEWS = [
    { mode: 'full', label: 'FULL MINE', icon: '🔭' },
    { mode: 'surface', label: 'SURFACE', icon: '🏔' },
    { mode: 'underground', label: 'UNDERGROUND', icon: '⛏' },
    { mode: 'cutaway', label: 'CUTAWAY', icon: '✂' },
];
export function ViewControls() {
    const viewMode = useSimulationStore((s) => s.viewMode);
    const setViewMode = useSimulationStore((s) => s.setViewMode);
    const resetCamera = useSimulationStore((s) => s.resetCamera);
    const closeAllPanels = useSimulationStore((s) => s.closeAllPanels);
    const activePanel = useSimulationStore((s) => s.activePanel);
    return (_jsxs("div", { className: "glass-panel camera-views-widget", id: "camera-views-widget", children: [_jsx("div", { className: "camera-views-title", children: "CAMERA VIEWS" }), _jsx("div", { className: "camera-views-grid", children: VIEWS.map(({ mode, label, icon }) => (_jsxs("button", { id: `view-${mode}`, className: `cam-view-btn ${viewMode === mode ? 'active' : ''}`, onClick: () => setViewMode(mode), title: `Switch camera to ${label}`, children: [_jsx("span", { children: icon }), " ", label] }, mode))) }), _jsxs("button", { id: "btn-reset-camera", className: "cam-view-btn reset-cam-btn", onClick: resetCamera, title: "Reset camera orientation", children: [_jsx("span", { children: "\uD83D\uDD04" }), " RESET CAMERA"] }), activePanel && (_jsx("button", { id: "btn-close-all", className: "cam-view-btn close-all-btn", onClick: closeAllPanels, title: "Close open panel (ESC)", children: "\u2715 CLOSE ALL" }))] }));
}
