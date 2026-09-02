import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
import { MONITORING_NODES, INTERNAL_SENSORS, getNodeReadings, getNodeStatus, getSensorStatus, } from '../../data/sensorLayout';
import { formatReading } from '../../data/interpolation';
export function SensorInfoPanel() {
    const activePanel = useSimulationStore((s) => s.activePanel);
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const readings = useSimulationStore((s) => s.readings);
    const closePanel = useSimulationStore((s) => s.closePanel);
    const openSensorGraph = useSimulationStore((s) => s.openSensorGraph);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    if (activePanel !== 'node' || !selectedNodeId)
        return null;
    const node = MONITORING_NODES.find((n) => n.id === selectedNodeId);
    if (!node)
        return null;
    const nodeReadings = getNodeReadings(node, readings);
    const overallStatus = getNodeStatus(nodeReadings);
    const statusBadge = {
        normal: { text: 'NORMAL', cls: 'normal' },
        warning: { text: 'WARNING', cls: 'warning' },
        critical: { text: 'CRITICAL', cls: 'critical' },
    }[overallStatus];
    return (_jsxs("div", { className: "glass-panel node-details-panel", id: "node-details-panel", children: [_jsxs("div", { className: "sensor-info-header", children: [_jsx("div", { className: "sensor-info-icon", style: { background: '#dbeafe', border: '1.5px solid #3b82f6' }, children: "\uD83D\uDCE1" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "sensor-info-name", children: node.code }), _jsx("div", { className: "sensor-info-type", children: "MULTI-SENSOR MONITORING NODE" })] }), _jsx("button", { className: "sensor-info-close", onClick: closePanel, title: "Close (ESC)", children: "\u2715" })] }), _jsxs("div", { style: { marginBottom: 8, fontSize: 11, color: 'var(--color-text-secondary)' }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Location: " }), _jsx("span", { children: node.locationName })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: 8,
                    marginBottom: 10,
                }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }, children: "NODE RISK" }), _jsxs("div", { style: {
                                    fontSize: 18,
                                    fontWeight: 800,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    color: nodeReadings.riskPercent >= 80
                                        ? '#dc2626'
                                        : nodeReadings.riskPercent >= 35
                                            ? '#d97706'
                                            : '#10b981',
                                }, children: [nodeReadings.riskPercent, "%"] })] }), _jsx("span", { className: `sensor-status-badge ${statusBadge.cls}`, children: statusBadge.text })] }), _jsxs("div", { className: "internal-architecture-card", children: [_jsx("div", { className: "internal-arch-header", children: _jsx("span", { children: "\uD83D\uDCE6 INTERNAL MULTI-SENSOR ARRAY (5 SENSORS)" }) }), _jsx("div", { className: "internal-arch-grid", children: INTERNAL_SENSORS.map((s) => (_jsxs("span", { className: "internal-arch-tag", onClick: () => openSensorGraph(node.id, s.key), style: { cursor: 'pointer' }, title: `Click to view ${s.name} graph`, children: [s.icon, " ", s.label] }, s.key))) })] }), _jsx("div", { className: "sensor-channels-list", children: INTERNAL_SENSORS.map((sensor) => {
                    const val = nodeReadings[sensor.key];
                    const sensStatus = getSensorStatus(sensor.key, val);
                    const isElevated = sensStatus !== 'normal' && stageIndex > 0;
                    const trend = stageIndex === 0
                        ? 'Stable'
                        : isElevated
                            ? '↑ Increasing'
                            : 'Normal';
                    return (_jsxs("div", { className: "sensor-channel-row sensor-channel-clickable", onClick: () => openSensorGraph(node.id, sensor.key), title: "Click to view time-series graph", children: [_jsxs("div", { className: "sensor-channel-left", children: [_jsx("span", { className: "sensor-channel-icon", children: sensor.icon }), _jsxs("div", { children: [_jsx("div", { className: "sensor-channel-name", children: sensor.name }), _jsx("div", { className: "sensor-channel-trend", children: _jsx("span", { className: isElevated ? 'sensor-trend-up' : 'sensor-trend-stable', children: trend }) })] })] }), _jsxs("div", { className: "sensor-channel-right", children: [_jsx("div", { className: "sensor-channel-val", style: {
                                            color: sensStatus === 'critical'
                                                ? '#dc2626'
                                                : sensStatus === 'warning'
                                                    ? '#d97706'
                                                    : '#0f172a',
                                        }, children: formatReading(sensor.key, val) }), _jsx("span", { className: `sensor-status-badge ${sensStatus}`, style: { fontSize: 9 }, children: sensStatus.toUpperCase() })] })] }, sensor.key));
                }) }), _jsx("button", { className: "sim-btn sim-btn-primary", style: { width: '100%', justifyContent: 'center', marginTop: 6, marginBottom: 8 }, onClick: () => openSensorGraph(node.id, 'vibration'), children: "\uD83D\uDCC8 VIEW SENSOR TRENDS" }), _jsx("div", { className: "node-desc-box", children: node.description })] }));
}
