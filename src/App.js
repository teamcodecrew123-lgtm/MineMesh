import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MineScene } from './components/scene/MineScene';
import { SimulationController } from './components/ui/SimulationController';
import { AlertBanner } from './components/ui/AlertBanner';
import { SensorInfoPanel } from './components/ui/SensorInfoPanel';
import { GNSSInfoPanel } from './components/ui/GNSSInfoPanel';
import { TimeSeriesGraphModal } from './components/ui/TimeSeriesGraphModal';
import { LayerControls } from './components/ui/LayerControls';
import { ViewControls } from './components/ui/ViewControls';
import { LiveDataNavbar } from './components/ui/LiveDataNavbar';
import { MLPipelinePanel } from './components/ui/MLPipelinePanel';
import { FusionGatePanel } from './components/ui/FusionGatePanel';
import { HeroNodesStatusBadge } from './components/ui/HeroNodesStatusBadge';
import { useSimulationStore } from './store/simulationStore';
import { useHeroNodes } from './hooks/useHeroNodes';
/** Mounts once; fetches hero nodes on scenarioId change and stores them in Zustand. */
function HeroNodesLoader() {
    useHeroNodes();
    return null;
}
function App() {
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const readings = useSimulationStore((s) => s.readings);
    const closeAllPanels = useSimulationStore((s) => s.closeAllPanels);
    const [layersOpen, setLayersOpen] = useState(true);
    const riskPct = Math.round(readings.riskPercent);
    const riskStatus = riskPct >= 80 ? 'CRITICAL' : riskPct >= 60 ? 'HIGH' : riskPct >= 40 ? 'WARNING' : riskPct >= 20 ? 'MONITOR' : 'NORMAL';
    const riskColor = riskPct >= 80 ? '#dc2626' : riskPct >= 60 ? '#f97316' : riskPct >= 40 ? '#f59e0b' : '#10b981';
    // Global ESC key listener (Requirement 9 & 11)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeAllPanels();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeAllPanels]);
    return (_jsxs("div", { className: "app-shell", children: [_jsx(HeroNodesLoader, {}), _jsx("div", { className: "canvas-container", children: _jsx(MineScene, {}) }), _jsxs("header", { className: "header-bar", id: "header-bar", children: [_jsxs("div", { className: "header-logo", children: [_jsx("div", { className: "header-logo-icon", children: "M" }), _jsxs("div", { className: "header-title-group", children: [_jsx("span", { className: "header-logo-text", children: "MineGuard" }), _jsx("span", { className: "header-logo-sub", children: "3D Mine Subsidence Digital Twin" })] })] }), _jsx("div", { className: "header-divider" }), _jsx("div", { className: "header-system-tag", children: "5 Underground Nodes \u00B7 4 Surface GNSS \u00B7 InSAR" }), _jsx("div", { className: "header-divider" }), _jsxs("div", { className: "header-risk-block", children: [_jsx("span", { className: "header-risk-label", children: "OVERALL RISK" }), _jsxs("span", { className: "header-risk-val", style: { color: riskColor }, children: [riskPct, "%"] }), _jsx("span", { className: "header-risk-badge", style: {
                                    background: `${riskColor}22`,
                                    color: riskColor,
                                    border: `1px solid ${riskColor}44`,
                                }, children: riskStatus })] })] }), _jsx(AlertBanner, {}), _jsx(LayerControls, { isOpen: layersOpen, onClose: () => setLayersOpen(false) }), !layersOpen && (_jsx("button", { className: "glass-panel layer-reopen-btn", onClick: () => setLayersOpen(true), title: "Open display layers", children: "\u2630 LAYERS" })), _jsx(LiveDataNavbar, {}), _jsx(HeroNodesStatusBadge, {}), _jsx(SimulationController, {}), _jsx(ViewControls, {}), _jsx(SensorInfoPanel, {}), _jsx(GNSSInfoPanel, {}), _jsx(TimeSeriesGraphModal, {}), _jsx(MLPipelinePanel, {}), _jsx(FusionGatePanel, {}), stageIndex >= 5 && _jsx(CriticalBorder, {})] }));
}
function CriticalBorder() {
    return (_jsx("div", { style: {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            border: '4px solid rgba(220,38,38,0.7)',
            boxShadow: 'inset 0 0 80px rgba(220,38,38,0.2)',
            zIndex: 50,
            animation: 'criticalPulse 1.5s ease-in-out infinite',
        } }));
}
export default App;
