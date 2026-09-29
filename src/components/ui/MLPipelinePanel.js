import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MLPipelinePanel — Live ML Pipeline Visualization
 * ─────────────────────────────────────────────────────────────────────
 * Displays the full 6-stage ML pipeline output for the selected node
 * (or a global overview when no node is selected).
 *
 * Shows: RAW → ISOLATION FOREST → FUSION → GRU → XGBOOST
 * Updates in real-time as the simulation progresses through stages.
 */
import { useSimulationStore } from '../../store/simulationStore';
import { usePipelineData } from '../../hooks/usePipelineData';
import { getDataSource } from '../../services/pipelineAdapter';
// ── Color helpers ─────────────────────────────────────────────────────
function riskColor(cls) {
    switch (cls) {
        case 'Critical': return '#dc2626';
        case 'Warning': return '#f97316';
        case 'Watch': return '#f59e0b';
        default: return '#22c55e';
    }
}
function riskBg(cls) {
    switch (cls) {
        case 'Critical': return 'rgba(220,38,38,0.12)';
        case 'Warning': return 'rgba(249,115,22,0.12)';
        case 'Watch': return 'rgba(245,158,11,0.12)';
        default: return 'rgba(34,197,94,0.12)';
    }
}
function anomalyColor(score) {
    if (score < -0.10)
        return '#dc2626';
    if (score < -0.06)
        return '#f97316';
    if (score < -0.02)
        return '#f59e0b';
    return '#22c55e';
}
function trendIcon(trend) {
    if (trend === 'slowing')
        return '↘ slowing';
    return '→ stable';
}
function trendColor(trend) {
    if (trend === 'slowing')
        return '#22c55e';
    return '#94a3b8';
}
// ── Stage header row ──────────────────────────────────────────────────
const PIPELINE_STAGES = [
    { id: 'raw', label: 'RAW', icon: '📡' },
    { id: 'if', label: 'ISO-F', icon: '🔍' },
    { id: 'fusion', label: 'FUSION', icon: '🔀' },
    { id: 'gru', label: 'GRU', icon: '📈' },
    { id: 'xgb', label: 'XGB', icon: '🎯' },
];
function stageStatus(record, stageId) {
    const cls = record.xgboost.risk_class;
    switch (stageId) {
        case 'raw': return 'normal';
        case 'if': return record.isolation_forest.if_flagged ? 'flagged' : 'normal';
        case 'fusion': return record.fusion.fusion_flag ? 'warn' : record.fusion.fusion_agreement_score > 0.4 ? 'flagged' : 'normal';
        case 'gru': return 'normal';
        case 'xgb': return cls === 'Critical' ? 'critical' : cls === 'Warning' ? 'warn' : cls === 'Watch' ? 'flagged' : 'normal';
        default: return 'normal';
    }
}
const STATUS_COLORS = {
    normal: '#22c55e',
    flagged: '#f59e0b',
    warn: '#f97316',
    critical: '#dc2626',
};
const STATUS_BG = {
    normal: 'rgba(34,197,94,0.08)',
    flagged: 'rgba(245,158,11,0.12)',
    warn: 'rgba(249,115,22,0.12)',
    critical: 'rgba(220,38,38,0.14)',
};
// ── Main Component ────────────────────────────────────────────────────
export function MLPipelinePanel() {
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const { records, loading, error, getRecord } = usePipelineData();
    // Show highest-risk node when none selected; else show selected
    const displayRecord = selectedNodeId
        ? getRecord(selectedNodeId)
        : records.sort((a, b) => b.xgboost.risk_percent - a.xgboost.risk_percent)[0];
    if (loading) {
        return (_jsxs("div", { className: "glass-panel ml-pipeline-panel", id: "ml-pipeline-panel", children: [_jsxs("div", { className: "ml-pipeline-header", children: [_jsx("span", { className: "ml-pipeline-title", children: "\u2699 ML PIPELINE" }), _jsx("span", { className: "ml-source-badge", children: "MOCK" })] }), _jsx("div", { style: { color: '#64748b', fontSize: 11, textAlign: 'center', padding: '12px 0' }, children: "Initialising pipeline data..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "glass-panel ml-pipeline-panel", id: "ml-pipeline-panel", children: [_jsx("div", { className: "ml-pipeline-header", children: _jsx("span", { className: "ml-pipeline-title", children: "\u2699 ML PIPELINE" }) }), _jsxs("div", { style: { color: '#dc2626', fontSize: 11 }, children: ["Error: ", error] })] }));
    }
    if (!displayRecord)
        return null;
    const rec = displayRecord;
    const nodeLabel = rec.node_id.replace('node-', 'NODE-').toUpperCase();
    const rc = rec.xgboost.risk_class;
    const scoreColor = anomalyColor(rec.isolation_forest.anomaly_score);
    const dataSource = getDataSource();
    return (_jsxs("div", { className: "glass-panel ml-pipeline-panel", id: "ml-pipeline-panel", children: [_jsxs("div", { className: "ml-pipeline-header", children: [_jsx("span", { className: "ml-pipeline-title", children: "\u2699 ML PIPELINE" }), _jsx("span", { className: "ml-node-badge", children: nodeLabel }), _jsx("span", { className: "ml-source-badge", title: dataSource === 'mock' ? 'Running on mock data — switch DATA_SOURCE in pipelineAdapter.ts to go live' : 'Connected to live backend', children: dataSource === 'mock' ? '◎ MOCK' : '● LIVE' })] }), _jsx("div", { className: "ml-stage-strip", children: PIPELINE_STAGES.map((stage, i) => {
                    const st = stageStatus(rec, stage.id);
                    const col = STATUS_COLORS[st];
                    const bg = STATUS_BG[st];
                    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsxs("div", { className: "ml-stage-chip", style: { background: bg, border: `1px solid ${col}44`, color: col }, title: stage.label, children: [_jsx("span", { children: stage.icon }), _jsx("span", { children: stage.label })] }), i < PIPELINE_STAGES.length - 1 && (_jsx("span", { className: "ml-stage-arrow", children: "\u203A" }))] }, stage.id));
                }) }), _jsxs("div", { className: "ml-stage-details", children: [_jsxs("div", { className: "ml-detail-row", children: [_jsx("div", { className: "ml-detail-label", children: "\uD83D\uDCE1 RAW SENSOR" }), _jsxs("div", { className: "ml-detail-values", children: [_jsxs("span", { className: "ml-val-chip", children: ["GNSS: ", _jsxs("b", { children: [rec.raw.gnss_displacement_mm.toFixed(2), " mm"] })] }), _jsxs("span", { className: `ml-val-chip ${rec.raw.vibration_triggered ? 'ml-chip-warn' : ''}`, children: ["VIB: ", _jsx("b", { children: rec.raw.vibration_triggered ? 'TRIGGERED ⚡' : 'clear' })] }), _jsxs("span", { className: "ml-val-chip", children: ["PIEZO: ", _jsxs("b", { children: [rec.raw.piezo_amplitude, " u"] })] })] })] }), _jsxs("div", { className: "ml-detail-row", children: [_jsx("div", { className: "ml-detail-label", children: "\uD83D\uDD0D ISOLATION FOREST" }), _jsxs("div", { className: "ml-detail-values", children: [_jsxs("span", { className: "ml-val-chip", style: { color: scoreColor, borderColor: `${scoreColor}44` }, children: ["score: ", _jsx("b", { children: rec.isolation_forest.anomaly_score.toFixed(4) })] }), _jsx("span", { className: `ml-val-chip ${rec.isolation_forest.if_flagged ? 'ml-chip-warn' : 'ml-chip-ok'}`, children: rec.isolation_forest.if_flagged ? '⚠ FLAGGED' : '✓ NORMAL' }), _jsx("span", { className: "ml-val-chip ml-chip-muted", title: "sklearn convention: lower score = more anomalous", children: "\u2193 lower = anomalous" })] })] }), _jsxs("div", { className: "ml-detail-row ml-fusion-row", children: [_jsx("div", { className: "ml-detail-label", children: "\uD83D\uDD00 FUSION AND-GATE" }), _jsxs("div", { className: "ml-fusion-gates", children: [_jsx(GateChip, { label: "Persist.", pass: rec.fusion.persistence_check }), _jsx("span", { style: { color: '#475569', fontSize: 10 }, children: "AND" }), _jsx(GateChip, { label: "Neighbor", pass: rec.fusion.neighbor_agreement }), _jsx("span", { style: { color: '#475569', fontSize: 10 }, children: "AND" }), _jsx(GateChip, { label: "SensorT.", pass: rec.fusion.sensor_type_agreement }), _jsx("span", { className: `ml-gate-badge ${rec.fusion.fusion_flag ? 'ml-gate-pass' : 'ml-gate-fail'}`, children: rec.fusion.fusion_flag ? '✓ CONFIRMED' : '✗ OPEN' })] }), _jsxs("div", { style: { marginTop: 4, fontSize: 10, color: '#64748b' }, children: ["agreement: ", _jsxs("b", { style: { color: '#0ea5e9' }, children: [(rec.fusion.fusion_agreement_score * 100).toFixed(0), "%"] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsxs("div", { className: "ml-detail-row", style: { flex: 1 }, children: [_jsx("div", { className: "ml-detail-label", children: "\uD83D\uDCC8 GRU TREND" }), _jsx("span", { style: { fontSize: 11, fontWeight: 700, color: trendColor(rec.gru.trend) }, children: trendIcon(rec.gru.trend) })] }), _jsxs("div", { className: "ml-detail-row", style: { flex: 1 }, children: [_jsx("div", { className: "ml-detail-label", children: "\uD83C\uDFAF XGBOOST" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [_jsx("span", { className: "ml-risk-class-badge", style: { background: riskBg(rc), color: riskColor(rc), border: `1px solid ${riskColor(rc)}44` }, children: rc.toUpperCase() }), _jsx("div", { className: "ml-risk-bar-track", children: _jsx("div", { className: "ml-risk-bar-fill", style: {
                                                        width: `${rec.xgboost.risk_percent}%`,
                                                        background: riskColor(rc),
                                                    } }) }), _jsxs("span", { style: { fontSize: 9, color: '#64748b', textAlign: 'right' }, children: [rec.xgboost.risk_percent.toFixed(1), "%"] })] })] })] })] }), _jsxs("div", { className: "ml-footer-note", children: ["t=", rec.timestep, "s \u00B7 ", rec.scenario_id, " \u00B7 ", dataSource === 'mock' ? 'Scripted demo pipeline — GRU/XGBoost not yet trained' : 'Live pipeline output'] })] }));
}
// ── Gate chip sub-component ───────────────────────────────────────────
function GateChip({ label, pass }) {
    return (_jsxs("span", { className: `ml-gate-chip ${pass ? 'ml-gate-chip-pass' : 'ml-gate-chip-fail'}`, children: [pass ? '✓' : '✗', " ", label] }));
}
