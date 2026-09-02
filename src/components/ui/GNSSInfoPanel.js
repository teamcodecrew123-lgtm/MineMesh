import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
import { GNSS_STATIONS, getGNSSReadings } from '../../data/sensorLayout';
export function GNSSInfoPanel() {
    const activePanel = useSimulationStore((s) => s.activePanel);
    const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId);
    const readings = useSimulationStore((s) => s.readings);
    const closePanel = useSimulationStore((s) => s.closePanel);
    const openGNSSGraph = useSimulationStore((s) => s.openGNSSGraph);
    if (activePanel !== 'gnss' || !selectedGNSSId)
        return null;
    const station = GNSS_STATIONS.find((g) => g.id === selectedGNSSId);
    if (!station)
        return null;
    const gnssR = getGNSSReadings(station, readings);
    const statusCls = {
        normal: 'normal',
        warning: 'warning',
        critical: 'critical',
    }[gnssR.status];
    return (_jsxs("div", { className: "glass-panel gnss-details-panel", id: "gnss-details-panel", children: [_jsxs("div", { className: "sensor-info-header", children: [_jsx("div", { className: "sensor-info-icon", style: { background: '#e0f2fe', border: '1.5px solid #0284c7' }, children: "\uD83D\uDEF0\uFE0F" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "sensor-info-name", children: station.code }), _jsx("div", { className: "sensor-info-type", children: "GEODETIC GNSS SURVEY STATION" })] }), _jsx("button", { className: "sensor-info-close", onClick: closePanel, title: "Close (ESC)", children: "\u2715" })] }), _jsxs("div", { style: { marginBottom: 10, fontSize: 11, color: 'var(--color-text-secondary)' }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Location: " }), _jsx("span", { children: station.locationName })] }), _jsxs("div", { className: "sensor-channels-list", children: [_jsxs("div", { className: "sensor-channel-row", children: [_jsxs("div", { className: "sensor-channel-left", children: [_jsx("span", { className: "sensor-channel-icon", children: "\u2B07\uFE0F" }), _jsxs("div", { children: [_jsx("div", { className: "sensor-channel-name", children: "Vertical Displacement (\u0394z)" }), _jsx("div", { className: "sensor-channel-trend", children: _jsx("span", { className: gnssR.verticalDisplacement <= -3.0 ? 'sensor-trend-up' : 'sensor-trend-stable', children: gnssR.trend }) })] })] }), _jsxs("div", { className: "sensor-channel-right", children: [_jsxs("div", { className: "sensor-channel-val", style: { color: gnssR.status === 'critical' ? '#dc2626' : gnssR.status === 'warning' ? '#d97706' : '#0284c7' }, children: [gnssR.verticalDisplacement.toFixed(1), " mm"] }), _jsx("span", { className: `sensor-status-badge ${statusCls}`, children: gnssR.status.toUpperCase() })] })] }), _jsxs("div", { className: "sensor-channel-row", children: [_jsxs("div", { className: "sensor-channel-left", children: [_jsx("span", { className: "sensor-channel-icon", children: "\u27A1\uFE0F" }), _jsxs("div", { children: [_jsx("div", { className: "sensor-channel-name", children: "Horizontal Shift (\u0394h)" }), _jsx("div", { className: "sensor-channel-trend", children: "Lateral Tension" })] })] }), _jsx("div", { className: "sensor-channel-right", children: _jsxs("div", { className: "sensor-channel-val", style: { color: '#0369a1' }, children: [gnssR.horizontalDisplacement.toFixed(1), " mm"] }) })] }), _jsxs("div", { className: "sensor-channel-row", children: [_jsxs("div", { className: "sensor-channel-left", children: [_jsx("span", { className: "sensor-channel-icon", children: "\u23F1\uFE0F" }), _jsxs("div", { children: [_jsx("div", { className: "sensor-channel-name", children: "Settlement Velocity" }), _jsx("div", { className: "sensor-channel-trend", children: "Instantaneous Rate" })] })] }), _jsx("div", { className: "sensor-channel-right", children: _jsxs("div", { className: "sensor-channel-val", style: { color: '#475569' }, children: [gnssR.velocity.toFixed(2), " mm/s"] }) })] })] }), _jsx("button", { className: "sim-btn sim-btn-primary", style: { width: '100%', justifyContent: 'center', marginTop: 8, marginBottom: 8 }, onClick: () => openGNSSGraph(station.id), children: "\uD83D\uDCC8 VIEW GNSS TIME-SERIES GRAPH" }), _jsx("div", { className: "node-desc-box", children: station.description })] }));
}
