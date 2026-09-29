import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
import { INTERNAL_SENSORS, getNodeReadings, getNodeStatus, getSensorStatus, } from '../../data/sensorLayout';
import { formatReading } from '../../data/interpolation';
import { usePipelineData } from '../../hooks/usePipelineData';
export function SensorInfoPanel() {
    const activePanel = useSimulationStore((s) => s.activePanel);
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const readings = useSimulationStore((s) => s.readings);
    const closePanel = useSimulationStore((s) => s.closePanel);
    const openSensorGraph = useSimulationStore((s) => s.openSensorGraph);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const { getRecord } = usePipelineData();
    const heroNodes = useSimulationStore((s) => s.heroNodes);
    if (activePanel !== 'node' || !selectedNodeId)
        return null;
    const node = heroNodes.find((n) => n.id === selectedNodeId);
    if (!node)
        return null;
    const nodeReadings = getNodeReadings(node, readings);
    const pipeRec = getRecord(node.id);
    // NODE RISK: use real XGBoost output when available; fall back to scripted riskPercent.
    const nodeRiskPct = pipeRec != null
        ? Math.round(pipeRec.xgboost.risk_percent)
        : nodeReadings.riskPercent;
    const overallStatus = pipeRec != null
        ? (pipeRec.xgboost.risk_class === 'Critical' ? 'critical'
            : pipeRec.xgboost.risk_class === 'Warning' || pipeRec.xgboost.risk_class === 'Watch' ? 'warning'
                : 'normal')
        : getNodeStatus(nodeReadings);
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
                                    color: nodeRiskPct >= 80
                                        ? '#dc2626'
                                        : nodeRiskPct >= 35
                                            ? '#d97706'
                                            : '#10b981',
                                }, children: [nodeRiskPct, "%"] })] }), _jsx("span", { className: `sensor-status-badge ${statusBadge.cls}`, children: statusBadge.text })] }), _jsxs("div", { className: "internal-architecture-card", children: [_jsx("div", { className: "internal-arch-header", children: _jsx("span", { children: "\uD83D\uDCE6 INTERNAL MULTI-SENSOR ARRAY (5 SENSORS)" }) }), _jsx("div", { className: "internal-arch-grid", children: INTERNAL_SENSORS.map((s) => (_jsxs("span", { className: "internal-arch-tag", onClick: () => openSensorGraph(node.id, s.key), style: { cursor: 'pointer' }, title: `Click to view ${s.name} graph`, children: [s.icon, " ", s.label] }, s.key))) })] }), _jsx("div", { className: "sensor-channels-list", children: INTERNAL_SENSORS.map((sensor) => {
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
                }) }), (() => {
                if (!pipeRec)
                    return null;
                const ifo = pipeRec.isolation_forest;
                const fus = pipeRec.fusion;
                const xgb = pipeRec.xgboost;
                const scoreCol = ifo.anomaly_score < -0.10 ? '#dc2626' : ifo.anomaly_score < -0.04 ? '#f97316' : '#22c55e';
                const riskCol = xgb.risk_class === 'Critical' ? '#dc2626' : xgb.risk_class === 'Warning' ? '#f97316' : xgb.risk_class === 'Watch' ? '#f59e0b' : '#22c55e';
                return (_jsxs("div", { style: { marginBottom: 10, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 10 }, children: [_jsx("div", { style: { fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.06em' }, children: "\u2699 ML PIPELINE OUTPUT" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }, children: [_jsxs("span", { style: { fontSize: 10, color: '#64748b' }, children: ["\uD83D\uDD0D Anomaly Score ", _jsx("span", { style: { fontSize: 9, color: '#94a3b8' }, children: "(\u2193 lower = worse)" })] }), _jsxs("div", { style: { display: 'flex', gap: 4, alignItems: 'center' }, children: [_jsx("span", { style: { fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: scoreCol }, children: ifo.anomaly_score.toFixed(4) }), ifo.if_flagged && (_jsx("span", { style: { fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#d97706', fontWeight: 700 }, children: "FLAGGED" }))] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }, children: [_jsx("span", { style: { fontSize: 10, color: '#64748b' }, children: "\uD83D\uDD00 Fusion AND-Gate" }), _jsxs("div", { style: { display: 'flex', gap: 3, alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 9, color: fus.persistence_check ? '#22c55e' : '#94a3b8' }, title: "Persistence gate", children: fus.persistence_check ? '✓P' : '✗P' }), _jsx("span", { style: { fontSize: 9, color: fus.neighbor_agreement ? '#22c55e' : '#94a3b8' }, title: "Neighbor agreement gate", children: fus.neighbor_agreement ? '✓N' : '✗N' }), _jsx("span", { style: { fontSize: 9, color: fus.sensor_type_agreement ? '#22c55e' : '#94a3b8' }, title: "Sensor-type agreement gate", children: fus.sensor_type_agreement ? '✓S' : '✗S' }), _jsx("span", { style: { fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                                                background: fus.fusion_flag ? 'rgba(220,38,38,0.12)' : 'rgba(71,85,105,0.10)',
                                                color: fus.fusion_flag ? '#dc2626' : '#64748b' }, children: fus.fusion_flag ? '● CONFIRMED' : '○ open' })] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 10, color: '#64748b' }, children: "\uD83C\uDFAF XGBoost Risk" }), _jsxs("div", { style: { display: 'flex', gap: 5, alignItems: 'center' }, children: [_jsx("div", { style: { width: 60, height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }, children: _jsx("div", { style: { width: `${xgb.risk_percent}%`, height: '100%', background: riskCol, transition: 'width 0.6s ease' } }) }), _jsx("span", { style: { fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700,
                                                background: `${riskCol}1a`, color: riskCol }, children: xgb.risk_class })] })] })] }));
            })(), _jsx("button", { className: "sim-btn sim-btn-primary", style: { width: '100%', justifyContent: 'center', marginTop: 6, marginBottom: 8 }, onClick: () => openSensorGraph(node.id, 'vibration'), children: "\uD83D\uDCC8 VIEW SENSOR TRENDS" }), _jsx("div", { className: "node-desc-box", children: node.description })] }));
}
