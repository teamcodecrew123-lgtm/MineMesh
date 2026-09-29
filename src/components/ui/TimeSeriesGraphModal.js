import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { GNSS_STATIONS, INTERNAL_SENSORS, getNodeTimeSeries, getGNSSTimeSeries, getNodeReadings, getGNSSReadings, } from '../../data/sensorLayout';
import { formatReading } from '../../data/interpolation';
export function TimeSeriesGraphModal() {
    const activePanel = useSimulationStore((s) => s.activePanel);
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId);
    const selectedGraphSensor = useSimulationStore((s) => s.selectedGraphSensor);
    const openSensorGraph = useSimulationStore((s) => s.openSensorGraph);
    const closePanel = useSimulationStore((s) => s.closePanel);
    const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds);
    const readings = useSimulationStore((s) => s.readings);
    const heroNodes = useSimulationStore((s) => s.heroNodes);
    const isNodeGraph = activePanel === 'sensorGraph' && !!selectedNodeId;
    const isGNSSGraph = activePanel === 'gnssGraph' && !!selectedGNSSId;
    const [gnssMode, setGnssMode] = useState('vertical');
    // Keyboard Escape listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                closePanel();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closePanel]);
    if (!isNodeGraph && !isGNSSGraph)
        return null;
    const node = selectedNodeId ? heroNodes.find((n) => n.id === selectedNodeId) : null;
    const gnss = selectedGNSSId ? GNSS_STATIONS.find((g) => g.id === selectedGNSSId) : null;
    const currentSensorKey = selectedGraphSensor || 'vibration';
    const activeSensorInfo = INTERNAL_SENSORS.find((s) => s.key === currentSensorKey);
    return (_jsxs("div", { className: "glass-panel time-series-modal", id: "time-series-modal", children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 18 }, children: "\uD83D\uDCC8" }), _jsxs("div", { children: [_jsxs("div", { style: { fontSize: 14, fontWeight: 800, color: 'var(--color-text-primary)' }, children: [isNodeGraph && node && `${node.code} — SENSOR TIME SERIES`, isGNSSGraph && gnss && `${gnss.code} — GEODETIC DISPLACEMENT TREND`] }), _jsx("div", { style: { fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }, children: "60-Second Deterministic Simulation Lifecycle Data" })] })] }), _jsx("button", { className: "sensor-info-close", onClick: closePanel, title: "Close graph (ESC)", children: "\u2715" })] }), isNodeGraph && node && (_jsx("div", { className: "graph-tabs-row", children: INTERNAL_SENSORS.map((s) => (_jsxs("button", { className: `graph-tab-btn ${currentSensorKey === s.key ? 'active' : ''}`, onClick: () => openSensorGraph(node.id, s.key), children: [_jsx("span", { children: s.icon }), " ", s.label] }, s.key))) })), isGNSSGraph && gnss && (_jsxs("div", { className: "graph-tabs-row", children: [_jsx("button", { className: `graph-tab-btn ${gnssMode === 'vertical' ? 'active' : ''}`, onClick: () => setGnssMode('vertical'), children: "\u2B07\uFE0F Vertical Displacement (\u0394z)" }), _jsx("button", { className: `graph-tab-btn ${gnssMode === 'horizontal' ? 'active' : ''}`, onClick: () => setGnssMode('horizontal'), children: "\u27A1\uFE0F Horizontal Displacement (\u0394h)" })] })), isNodeGraph && node && (_jsx(NodeSensorChart, { node: node, sensorInfo: activeSensorInfo, elapsedSeconds: elapsedSeconds, globalReadings: readings })), isGNSSGraph && gnss && (_jsx(GNSSChart, { station: gnss, mode: gnssMode, elapsedSeconds: elapsedSeconds, globalReadings: readings }))] }));
}
function NodeSensorChart({ node, sensorInfo, elapsedSeconds, globalReadings, }) {
    const points = useMemo(() => getNodeTimeSeries(node, sensorInfo.key), [node, sensorInfo]);
    const nodeReadings = getNodeReadings(node, globalReadings);
    const currentVal = nodeReadings[sensorInfo.key];
    const maxVal = Math.max(...points.map((p) => p.value), sensorInfo.criticalThreshold * 1.15);
    const minVal = Math.min(0, ...points.map((p) => p.value));
    // Chart Dimensions
    const W = 460;
    const H = 160;
    const padL = 45;
    const padR = 20;
    const padT = 15;
    const padB = 25;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const getX = (t) => padL + (t / 60) * plotW;
    const getY = (v) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
    const pathD = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.time).toFixed(1)} ${getY(p.value).toFixed(1)}`)
        .join(' ');
    const currentX = getX(elapsedSeconds);
    const currentY = getY(currentVal);
    return (_jsxs("div", { children: [_jsxs("div", { className: "chart-live-header", children: [_jsxs("div", { children: [_jsx("span", { style: { fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }, children: "CURRENT VALUE:" }), ' ', _jsx("span", { style: { fontSize: 14, fontWeight: 800, color: 'var(--color-brand)' }, children: formatReading(sensorInfo.key, currentVal) })] }), _jsxs("div", { style: { fontSize: 10, color: 'var(--color-text-muted)' }, children: ["Normal Limit: ", _jsx("b", { style: { color: '#166534' }, children: sensorInfo.normalRange })] })] }), _jsxs("svg", { className: "time-series-svg", viewBox: `0 0 ${W} ${H}`, children: [[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                        const val = minVal + frac * (maxVal - minVal);
                        const y = getY(val);
                        return (_jsxs("g", { children: [_jsx("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: "#e2e8f0", strokeDasharray: "3,3" }), _jsx("text", { x: padL - 6, y: y + 3, textAnchor: "end", fontSize: "9", fill: "#94a3b8", children: val.toFixed(sensorInfo.key === 'gas' ? 1 : 0) })] }, frac));
                    }), sensorInfo.warningThreshold < maxVal && (_jsx("line", { x1: padL, y1: getY(sensorInfo.warningThreshold), x2: W - padR, y2: getY(sensorInfo.warningThreshold), stroke: "#f59e0b", strokeDasharray: "4,2", strokeWidth: "1.2" })), _jsx("path", { d: `${pathD} L ${getX(60)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`, fill: "rgba(59, 130, 246, 0.08)" }), _jsx("path", { d: pathD, fill: "none", stroke: "#2563eb", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: currentX, y1: padT, x2: currentX, y2: padT + plotH, stroke: "#ef4444", strokeWidth: "1.5", strokeDasharray: "2,2" }), _jsx("circle", { cx: currentX, cy: currentY, r: "5", fill: "#ef4444", stroke: "#ffffff", strokeWidth: "2" }), [0, 10, 20, 30, 40, 50, 60].map((t) => (_jsxs("text", { x: getX(t), y: H - 6, textAnchor: "middle", fontSize: "9", fill: "#64748b", fontWeight: "600", children: [t, "s"] }, t)))] })] }));
}
function GNSSChart({ station, mode, elapsedSeconds, globalReadings, }) {
    const points = useMemo(() => getGNSSTimeSeries(station), [station]);
    const gnssR = getGNSSReadings(station, globalReadings);
    const currentVal = mode === 'vertical' ? gnssR.verticalDisplacement : gnssR.horizontalDisplacement;
    const values = points.map((p) => (mode === 'vertical' ? p.vertical : p.horizontal));
    const minVal = Math.min(...values, mode === 'vertical' ? -12 : 0);
    const maxVal = Math.max(...values, mode === 'vertical' ? 0 : 3.0);
    const W = 460;
    const H = 160;
    const padL = 45;
    const padR = 20;
    const padT = 15;
    const padB = 25;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const getX = (t) => padL + (t / 60) * plotW;
    const getY = (v) => padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
    const pathD = points
        .map((p, idx) => {
        const v = mode === 'vertical' ? p.vertical : p.horizontal;
        return `${idx === 0 ? 'M' : 'L'} ${getX(p.time).toFixed(1)} ${getY(v).toFixed(1)}`;
    })
        .join(' ');
    const currentX = getX(elapsedSeconds);
    const currentY = getY(currentVal);
    return (_jsxs("div", { children: [_jsxs("div", { className: "chart-live-header", children: [_jsxs("div", { children: [_jsx("span", { style: { fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }, children: mode === 'vertical' ? 'VERTICAL DISPLACEMENT (Δz):' : 'HORIZONTAL SHIFT (Δh):' }), ' ', _jsxs("span", { style: { fontSize: 14, fontWeight: 800, color: '#0284c7' }, children: [currentVal.toFixed(1), " mm"] })] }), _jsxs("div", { style: { fontSize: 10, color: 'var(--color-text-muted)' }, children: ["Status: ", _jsx("b", { style: { color: gnssR.status === 'critical' ? '#dc2626' : '#0284c7' }, children: gnssR.status.toUpperCase() })] })] }), _jsxs("svg", { className: "time-series-svg", viewBox: `0 0 ${W} ${H}`, children: [[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                        const val = minVal + frac * (maxVal - minVal);
                        const y = getY(val);
                        return (_jsxs("g", { children: [_jsx("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: "#e2e8f0", strokeDasharray: "3,3" }), _jsx("text", { x: padL - 6, y: y + 3, textAnchor: "end", fontSize: "9", fill: "#94a3b8", children: val.toFixed(1) })] }, frac));
                    }), _jsx("path", { d: `${pathD} L ${getX(60)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`, fill: "rgba(2, 132, 199, 0.08)" }), _jsx("path", { d: pathD, fill: "none", stroke: "#0284c7", strokeWidth: "2.5", strokeLinecap: "round" }), _jsx("line", { x1: currentX, y1: padT, x2: currentX, y2: padT + plotH, stroke: "#ef4444", strokeWidth: "1.5", strokeDasharray: "2,2" }), _jsx("circle", { cx: currentX, cy: currentY, r: "5", fill: "#ef4444", stroke: "#ffffff", strokeWidth: "2" }), [0, 10, 20, 30, 40, 50, 60].map((t) => (_jsxs("text", { x: getX(t), y: H - 6, textAnchor: "middle", fontSize: "9", fill: "#64748b", fontWeight: "600", children: [t, "s"] }, t)))] })] }));
}
