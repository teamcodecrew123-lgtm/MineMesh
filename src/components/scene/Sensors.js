import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import { GNSS_STATIONS, getNodeReadings, getGNSSReadings, } from '../../data/sensorLayout';
/**
 * Surface & Underground Monitoring Equipment:
 * 1. Underground Multi-Sensor Monitoring Nodes with Smooth Continuous Gradient Risk Heatmap (Yellow -> Orange -> Red)
 * 2. Surface GNSS Survey Stations
 */
export function Sensors() {
    const layers = useSimulationStore((s) => s.layers);
    const readings = useSimulationStore((s) => s.readings);
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId);
    const openNodePanel = useSimulationStore((s) => s.openNodePanel);
    const openGNSSPanel = useSimulationStore((s) => s.openGNSSPanel);
    const heroNodes = useSimulationStore((s) => s.heroNodes);
    return (_jsxs("group", { children: [layers.nodes &&
                heroNodes.map((node) => {
                    const nodeReadings = getNodeReadings(node, readings);
                    const isSelected = selectedNodeId === node.id;
                    return (_jsx(UndergroundMonitoringNode, { node: node, riskPercent: nodeReadings.riskPercent, isSelected: isSelected, onSelect: () => openNodePanel(node.id) }, node.id));
                }), layers.gnss &&
                GNSS_STATIONS.map((station) => {
                    const gnssReadings = getGNSSReadings(station, readings);
                    const isSelected = selectedGNSSId === station.id;
                    return (_jsx(SurfaceGNSSStation, { station: station, readings: gnssReadings, isSelected: isSelected, onSelect: () => openGNSSPanel(station.id) }, station.id));
                })] }));
}
function UndergroundMonitoringNode({ node, riskPercent, isSelected, onSelect, }) {
    const groupRef = useRef(null);
    const handleClick = (e) => {
        e.stopPropagation();
        onSelect();
    };
    const handlePointerEnter = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
    };
    const handlePointerLeave = () => {
        document.body.style.cursor = 'auto';
    };
    return (_jsxs("group", { ref: groupRef, position: [node.position.x, node.position.y, node.position.z], scale: isSelected ? 1.12 : 1.0, children: [_jsx(SmoothNodeRiskHeatmap, { riskPercent: riskPercent }), _jsxs("mesh", { position: [0, 0.45, 0], visible: false, onClick: handleClick, onPointerEnter: handlePointerEnter, onPointerLeave: handlePointerLeave, children: [_jsx("cylinderGeometry", { args: [1.2, 1.2, 1.8, 10] }), _jsx("meshBasicMaterial", { transparent: true, opacity: 0 })] }), _jsxs("group", { onClick: handleClick, onPointerEnter: handlePointerEnter, onPointerLeave: handlePointerLeave, renderOrder: 150, children: [_jsxs("mesh", { position: [0, 0.03, 0], castShadow: true, renderOrder: 150, children: [_jsx("boxGeometry", { args: [0.7, 0.06, 0.55] }), _jsx("meshLambertMaterial", { color: 0x334155 })] }), _jsxs("mesh", { position: [0, 0.38, 0], castShadow: true, renderOrder: 151, children: [_jsx("boxGeometry", { args: [0.65, 0.64, 0.46] }), _jsx("meshLambertMaterial", { color: isSelected ? 0xf8fafc : 0x475569 })] }), _jsxs("mesh", { position: [0, 0.38, 0.24], renderOrder: 152, children: [_jsx("boxGeometry", { args: [0.54, 0.52, 0.03] }), _jsx("meshLambertMaterial", { color: 0x94a3b8 })] }), _jsxs("mesh", { position: [0, 0.48, 0.26], renderOrder: 153, children: [_jsx("boxGeometry", { args: [0.42, 0.22, 0.02] }), _jsx("meshBasicMaterial", { color: 0x1e293b })] }), _jsxs("mesh", { position: [0.2, 0.74, 0], castShadow: true, renderOrder: 154, children: [_jsx("cylinderGeometry", { args: [0.025, 0.025, 0.16, 8] }), _jsx("meshLambertMaterial", { color: 0x64748b })] }), _jsxs("mesh", { position: [-0.2, 0.72, 0], renderOrder: 154, children: [_jsx("cylinderGeometry", { args: [0.035, 0.035, 0.08, 8] }), _jsx("meshLambertMaterial", { color: 0x1e293b })] })] }), isSelected && (_jsxs("mesh", { position: [0, 0.025, 0], rotation: [-Math.PI / 2, 0, 0], renderOrder: 160, children: [_jsx("ringGeometry", { args: [0.55, 0.78, 24] }), _jsx("meshBasicMaterial", { color: 0x38bdf8, transparent: true, opacity: 0.9, side: THREE.DoubleSide })] })), _jsx(Billboard, { position: [0, 1.65, 0], renderOrder: 200, children: _jsx(Text, { fontSize: 0.28, fontWeight: "bold", color: isSelected ? '#38bdf8' : '#ffffff', anchorX: "center", anchorY: "bottom", outlineWidth: 0.04, outlineColor: "#0f172a", renderOrder: 200, children: node.code }) })] }));
}
/**
 * Smooth Continuous Gradient Risk Heatmap
 * - Only visible in underground / cutaway views (never shines through the surface terrain)
 * - Stage by stage progression: hidden in Stage 1 baseline (risk < 24%), expands & intensifies through Stages 2 -> 6
 * - Continuous per-vertex color gradient (Yellow -> Orange -> Deep Red) matching the terrain bulge reference
 * - Centered at [0, 0.45, 0] so it surrounds the node in 360° without tunnel wall clipping
 */
function SmoothNodeRiskHeatmap({ riskPercent }) {
    const billboardRef = useRef(null);
    const viewMode = useSimulationStore((s) => s.viewMode);
    const layers = useSimulationStore((s) => s.layers);
    // 1. Underground visibility & baseline threshold calculation
    const isUndergroundVisible = layers.underground && layers.nodes;
    const isVisible = isUndergroundVisible && riskPercent >= 24;
    // Normalized active risk from 24% to 100% (0.0 -> 1.0)
    const activeRiskNorm = Math.min(1.0, Math.max(0, (riskPercent - 24) / 76));
    // Subtle breathing pulse (always called unconditionally to satisfy Rules of Hooks)
    useFrame(({ clock }) => {
        if (!billboardRef.current)
            return;
        const rate = riskPercent >= 70 ? 2.2 : 1.2;
        const s = 1.0 + Math.sin(clock.elapsedTime * rate) * 0.03;
        billboardRef.current.scale.setScalar(s);
    });
    // Dynamic radius expanding stage-by-stage:
    // Stage 2 (risk ~30%): small 0.85m aura
    // Stage 3-4 (risk ~55%): medium 1.65m aura
    // Stage 6 (risk ~92%): massive 2.75m critical aura
    const outerRadius = 0.80 + activeRiskNorm * 1.95;
    // High-density subdivided radial mesh with smooth per-vertex gradient (always called unconditionally)
    const geometry = useMemo(() => {
        const rings = 28;
        const segments = 60;
        const geo = new THREE.RingGeometry(0.001, outerRadius, segments, rings);
        const pos = geo.attributes.position;
        const count = pos.count;
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const r = Math.hypot(x, y);
            const normR = Math.min(1.0, r / outerRadius); // 0 at center, 1 at edge
            // Continuous spatial intensity: 1.0 at center -> 0.0 at outer rim
            // Scaled by actual active risk level
            const intensity = (1.0 - normR) * (0.30 + activeRiskNorm * 0.80);
            // Smooth color gradient matching the exact terrain subsidence palette:
            // Outer (low intensity): Bright Warm Yellow
            // Mid: Vibrant Orange
            // Core (high intensity): Vivid Deep Red
            let cr = 0.98;
            let cg = 0.88;
            let cb = 0.10;
            if (intensity < 0.35) {
                // YELLOW -> ORANGE (Outer margin to mid slope)
                const t = intensity / 0.35;
                cr = 0.98;
                cg = 0.88 - t * 0.42; // 0.88 (Yellow) -> 0.46 (Orange)
                cb = 0.10 - t * 0.05; // 0.10 -> 0.05
            }
            else if (intensity < 0.75) {
                // ORANGE -> VIVID RED (Mid slope to core)
                const t = (intensity - 0.35) / 0.40;
                cr = 0.98 - t * 0.06; // 0.98 -> 0.92
                cg = 0.46 - t * 0.41; // 0.46 -> 0.05
                cb = 0.05 + t * 0.01; // 0.05 -> 0.06
            }
            else {
                // VIVID DEEP RED CORE (Critical core at node center)
                cr = 0.92;
                cg = 0.05;
                cb = 0.06;
            }
            colors[i * 3] = cr;
            colors[i * 3 + 1] = cg;
            colors[i * 3 + 2] = cb;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geo;
    }, [outerRadius, activeRiskNorm]);
    const opacity = 0.65 + activeRiskNorm * 0.25;
    // Conditional early return AFTER all hooks have executed
    if (!isVisible)
        return null;
    return (_jsx(Billboard, { ref: billboardRef, position: [0, 0.45, 0], children: _jsx("mesh", { geometry: geometry, renderOrder: 100, children: _jsx("meshBasicMaterial", { vertexColors: true, transparent: true, opacity: opacity, side: THREE.DoubleSide, depthWrite: false, depthTest: true }) }) }));
}
function SurfaceGNSSStation({ station, readings, isSelected, onSelect }) {
    const groupRef = useRef(null);
    const statusColor = useMemo(() => {
        if (readings.status === 'critical')
            return '#dc2626';
        if (readings.status === 'warning')
            return '#f59e0b';
        return '#0284c7';
    }, [readings.status]);
    const handleClick = (e) => {
        e.stopPropagation();
        onSelect();
    };
    const handlePointerEnter = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
    };
    const handlePointerLeave = () => {
        document.body.style.cursor = 'auto';
    };
    return (_jsxs("group", { ref: groupRef, position: [station.position.x, station.position.y, station.position.z], scale: isSelected ? 1.25 : 1.0, children: [_jsxs("mesh", { position: [0, 0.9, 0], visible: false, onClick: handleClick, onPointerEnter: handlePointerEnter, onPointerLeave: handlePointerLeave, children: [_jsx("cylinderGeometry", { args: [1.0, 1.0, 2.2, 12] }), _jsx("meshBasicMaterial", { transparent: true, opacity: 0 })] }), _jsxs("group", { onClick: handleClick, onPointerEnter: handlePointerEnter, onPointerLeave: handlePointerLeave, children: [_jsxs("mesh", { position: [0, 0.12, 0], receiveShadow: true, castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.3, 0.4, 0.24, 12] }), _jsx("meshLambertMaterial", { color: 0x94a3b8 })] }), _jsxs("mesh", { position: [0, 0.75, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.045, 0.05, 1.05, 10] }), _jsx("meshLambertMaterial", { color: 0xe2e8f0 })] }), _jsxs("mesh", { position: [0.16, 0.55, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [0.22, 0.28, 0.18] }), _jsx("meshLambertMaterial", { color: 0x475569 })] }), _jsxs("mesh", { position: [0, 1.3, 0], castShadow: true, children: [_jsx("cylinderGeometry", { args: [0.32, 0.28, 0.08, 16] }), _jsx("meshLambertMaterial", { color: 0x334155 })] }), _jsxs("mesh", { position: [0, 1.38, 0], castShadow: true, children: [_jsx("sphereGeometry", { args: [0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2] }), _jsx("meshLambertMaterial", { color: isSelected ? 0xffffff : 0xf8fafc })] })] }), isSelected && (_jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("ringGeometry", { args: [0.65, 0.85, 28] }), _jsx("meshBasicMaterial", { color: statusColor, transparent: true, opacity: 0.9, side: THREE.DoubleSide })] })), _jsxs(Billboard, { position: [0, 2.0, 0], children: [_jsx(Text, { fontSize: 0.34, fontWeight: "bold", color: isSelected ? '#0369a1' : '#0f172a', anchorX: "center", anchorY: "bottom", outlineWidth: 0.04, outlineColor: "#ffffff", children: station.code }), _jsx(Text, { fontSize: 0.24, fontWeight: "bold", color: statusColor, anchorX: "center", anchorY: "top", outlineWidth: 0.03, outlineColor: "#ffffff", position: [0, -0.03, 0], children: `Δz: ${readings.verticalDisplacement.toFixed(1)} mm` })] })] }));
}
