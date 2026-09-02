import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSimulationStore } from '../../store/simulationStore';
export function RiskGauge() {
    const readings = useSimulationStore((s) => s.readings);
    const risk = readings.riskPercent;
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - risk / 100);
    const getColor = (r) => {
        if (r >= 80)
            return '#dc2626';
        if (r >= 60)
            return '#ef4444';
        if (r >= 40)
            return '#f97316';
        if (r >= 20)
            return '#f59e0b';
        return '#22c55e';
    };
    const getStatus = (r) => {
        if (r >= 85)
            return { label: 'CRITICAL', cls: 'critical' };
        if (r >= 60)
            return { label: 'HIGH RISK', cls: 'high-risk' };
        if (r >= 35)
            return { label: 'WARNING', cls: 'warning' };
        return { label: 'NORMAL', cls: 'normal' };
    };
    const color = getColor(risk);
    const status = getStatus(risk);
    return (_jsxs("div", { className: "glass-panel risk-gauge-panel", id: "risk-gauge", children: [_jsx("div", { className: "risk-gauge-title", children: "Overall Risk" }), _jsxs("div", { className: "risk-gauge-ring", children: [_jsxs("svg", { viewBox: "0 0 100 100", children: [_jsx("circle", { className: "risk-gauge-bg", cx: "50", cy: "50", r: radius }), _jsx("circle", { className: "risk-gauge-fill", cx: "50", cy: "50", r: radius, stroke: color, strokeDasharray: circumference, strokeDashoffset: dashOffset })] }), _jsxs("div", { className: "risk-gauge-center", children: [_jsx("span", { className: "risk-gauge-value", style: { color }, children: Math.round(risk) }), _jsx("span", { className: "risk-gauge-pct", children: "%" })] })] }), _jsx("div", { className: `risk-status-badge ${status.cls}`, children: status.label })] }));
}
