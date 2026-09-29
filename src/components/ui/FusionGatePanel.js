import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * FusionGatePanel — Fusion AND-Gate Narrative Display
 * ─────────────────────────────────────────────────────────────────────
 * Shows the real-time status of the rule-based fusion AND-gate for all
 * 5 monitoring nodes. This is the most narratively important part of
 * the pipeline — it shows how the system distinguishes real anomalies
 * from sensor noise/faults.
 *
 * Replaces/augments the generic SensorFusionPanel with data-faithful
 * per-gate status derived from the mock (or future live) pipeline.
 */
import { useSimulationStore } from '../../store/simulationStore';
import { usePipelineData } from '../../hooks/usePipelineData';
const NODE_LABELS = {
    'node-01': 'NODE-01\nMain Haulage',
    'node-02': 'NODE-02\nNorth Gate Face',
    'node-03': 'NODE-03\nPanel Crosscut',
    'node-04': 'NODE-04\nSouth Tail Gate',
    'node-05': 'NODE-05\nShaft Station',
};
const NODE_SHORT = {
    'node-01': 'N-01',
    'node-02': 'N-02',
    'node-03': 'N-03',
    'node-04': 'N-04',
    'node-05': 'N-05',
};
function gateIcon(pass) {
    return pass
        ? _jsx("span", { style: { color: '#22c55e', fontWeight: 700 }, children: "\u2713" })
        : _jsx("span", { style: { color: '#475569', fontWeight: 700 }, children: "\u2717" });
}
function flagIcon(flag) {
    return flag
        ? _jsx("span", { style: { color: '#dc2626', fontWeight: 800 }, children: "\u25CF CONFIRMED" })
        : _jsx("span", { style: { color: '#475569' }, children: "\u25CB open" });
}
function NodeFusionRow({ rec }) {
    const f = rec.fusion;
    const if_flagged = rec.isolation_forest.if_flagged;
    const nodeId = rec.node_id;
    // Background intensity based on agreement score
    const bgAlpha = f.fusion_agreement_score * 0.18;
    const rowBg = f.fusion_flag
        ? `rgba(220,38,38,${bgAlpha + 0.04})`
        : if_flagged
            ? `rgba(245,158,11,${bgAlpha + 0.02})`
            : 'transparent';
    return (_jsxs("div", { className: "fusion-gate-row", style: { background: rowBg }, children: [_jsx("div", { className: "fusion-gate-node-label", children: NODE_SHORT[nodeId] }), _jsx("div", { className: "fusion-gate-cell", title: "Isolation Forest flagged this node", children: if_flagged
                    ? _jsx("span", { style: { color: '#f59e0b', fontSize: 9, fontWeight: 700 }, children: "\u26A0 IF" })
                    : _jsx("span", { style: { color: '#475569', fontSize: 9 }, children: "\u2014" }) }), _jsx("div", { className: "fusion-gate-cell", title: "Persistence: repeated anomaly across timesteps", children: gateIcon(f.persistence_check) }), _jsx("div", { className: "fusion-gate-cell", title: "Neighbor agreement: spatially adjacent nodes agree", children: gateIcon(f.neighbor_agreement) }), _jsx("div", { className: "fusion-gate-cell", title: "Sensor-type: vibration/piezo corroborates GNSS anomaly", children: gateIcon(f.sensor_type_agreement) }), _jsxs("div", { className: "fusion-gate-cell", style: { color: '#0ea5e9', fontFamily: 'monospace', fontSize: 10 }, children: [(f.fusion_agreement_score * 100).toFixed(0), "%"] }), _jsx("div", { className: "fusion-gate-cell fusion-gate-flag-cell", children: flagIcon(f.fusion_flag) })] }));
}
// ── Gate explanation sidebar ────────────────────────────────────────
const GATE_EXPLANATIONS = [
    {
        icon: '🔁',
        name: 'Persistence',
        desc: 'Same node elevated anomaly for 4+ consecutive timesteps — not a one-off blip',
    },
    {
        icon: '🌐',
        name: 'Neighbor Agreement',
        desc: 'Spatially adjacent nodes show similar anomaly patterns — rules out single-sensor fault',
    },
    {
        icon: '🔌',
        name: 'Sensor-Type Agreement',
        desc: 'Vibration / piezo signal corroborates GNSS anomaly at same location',
    },
];
export function FusionGatePanel() {
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const { records, loading } = usePipelineData();
    // Only show this panel from stage 2 onwards (when fusion becomes relevant)
    // (or always if you prefer — kept optional here for narrative clarity)
    if (stageIndex < 2 || loading || records.length === 0)
        return null;
    // Count confirmed nodes
    const confirmedCount = records.filter((r) => r.fusion.fusion_flag).length;
    const flaggedCount = records.filter((r) => r.isolation_forest.if_flagged).length;
    return (_jsxs("div", { className: "glass-panel fusion-gate-panel", id: "fusion-gate-panel", children: [_jsxs("div", { className: "fusion-gate-header", children: [_jsx("span", { className: "fusion-gate-title", children: "\uD83D\uDD00 FUSION AND-GATE STATUS" }), _jsxs("div", { className: "fusion-gate-summary", children: [_jsxs("span", { style: { color: '#f59e0b', fontSize: 10 }, children: [flaggedCount, " IF-flagged"] }), _jsx("span", { style: { color: '#475569', fontSize: 10 }, children: "\u00B7" }), _jsxs("span", { style: { color: confirmedCount > 0 ? '#dc2626' : '#64748b', fontSize: 10, fontWeight: 700 }, children: [confirmedCount, " confirmed"] })] })] }), _jsxs("div", { className: "fusion-gate-rule-box", children: [_jsx("div", { className: "fusion-gate-rule-title", children: "System rule: anomaly confirmed only when ALL 3 gates agree" }), _jsx("div", { style: { fontSize: 9, color: '#64748b', marginTop: 2 }, children: "Isolation Forest detection \u2192 Persistence AND Neighbor AND Sensor-Type \u2192 GRU/XGBoost" })] }), _jsxs("div", { className: "fusion-gate-table-header", children: [_jsx("div", { className: "fusion-gate-node-label", style: { color: '#64748b' }, children: "NODE" }), _jsx("div", { className: "fusion-gate-cell", style: { color: '#f59e0b', fontSize: 9 }, children: "IF" }), _jsx("div", { className: "fusion-gate-cell", title: "Gate 1 \u2014 Persistence", style: { color: '#64748b', fontSize: 9 }, children: "P" }), _jsx("div", { className: "fusion-gate-cell", title: "Gate 2 \u2014 Neighbor", style: { color: '#64748b', fontSize: 9 }, children: "N" }), _jsx("div", { className: "fusion-gate-cell", title: "Gate 3 \u2014 Sensor-Type", style: { color: '#64748b', fontSize: 9 }, children: "S" }), _jsx("div", { className: "fusion-gate-cell", style: { color: '#0ea5e9', fontSize: 9 }, children: "AGR%" }), _jsx("div", { className: "fusion-gate-cell fusion-gate-flag-cell", style: { color: '#64748b', fontSize: 9 }, children: "GATE" })] }), _jsx("div", { className: "fusion-gate-rows", children: records.map((rec) => (_jsx(NodeFusionRow, { rec: rec }, rec.node_id))) }), _jsx("div", { className: "fusion-gate-legend", children: GATE_EXPLANATIONS.map((g) => (_jsxs("div", { className: "fusion-gate-legend-item", children: [_jsx("span", { children: g.icon }), _jsxs("div", { children: [_jsxs("span", { style: { fontWeight: 700, fontSize: 9 }, children: [g.name, ": "] }), _jsx("span", { style: { color: '#64748b', fontSize: 9 }, children: g.desc })] })] }, g.name))) })] }));
}
