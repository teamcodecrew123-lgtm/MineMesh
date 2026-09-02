import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
const LAYERS = [
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
];
export function LayerControls({ isOpen, onClose }) {
    const layers = useSimulationStore((s) => s.layers);
    const toggleLayer = useSimulationStore((s) => s.toggleLayer);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "glass-panel layer-controls", id: "layer-controls", children: [_jsxs("div", { className: "layer-controls-header", children: [_jsx("span", { className: "layer-controls-title", children: "DISPLAY LAYERS" }), _jsx("button", { className: "layer-close-btn", onClick: onClose, title: "Close display layers panel", children: "\u2715" })] }), _jsx("div", { className: "layer-controls-list", children: LAYERS.map(({ key, label, color }) => (_jsxs("div", { className: `layer-toggle ${layers[key] ? 'active' : ''}`, onClick: () => toggleLayer(key), id: `layer-${key}`, role: "button", tabIndex: 0, children: [_jsxs("div", { className: "layer-toggle-left", children: [_jsx("div", { className: "layer-toggle-dot", style: { background: color } }), _jsx("span", { className: "layer-toggle-label", children: label })] }), _jsx("div", { className: "layer-toggle-switch" })] }, key))) })] }));
}
