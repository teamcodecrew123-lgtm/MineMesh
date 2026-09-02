import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
/**
 * Expansive Realistic Underground Mine Architecture:
 * - Deep vertical hoisting shaft with structural steel guide rails
 * - Long main haulage roadway with smoothly curved corner transitions
 * - North Gate and Tail Gate parallel roads with connecting crosscuts
 * - Mining panel with hydraulic roof support shields
 * - Advancing longwall shearer machine with cutting drums and active sparks/glow
 * - Geological rock strata layers
 */
export function Underground() {
    const layers = useSimulationStore((s) => s.layers);
    const miningFrontProgress = useSimulationStore((s) => s.miningFrontProgress);
    const viewMode = useSimulationStore((s) => s.viewMode);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const showUnderground = layers.underground || viewMode === 'underground' || viewMode === 'cutaway';
    if (!showUnderground)
        return null;
    return (_jsxs("group", { children: [_jsx(RockStrata, {}), _jsx(ShaftStructure, {}), layers.tunnels && _jsx(TunnelNetwork, {}), layers.miningPanels && _jsx(LongwallPanel, {}), layers.miningFront && (_jsx(AdvancingMiningFront, { progress: miningFrontProgress, stageIndex: stageIndex }))] }));
}
function RockStrata() {
    return (_jsxs("group", { children: [_jsxs("mesh", { position: [12, -4.0, 0], children: [_jsx("boxGeometry", { args: [42, 7.5, 26] }), _jsx("meshLambertMaterial", { color: 0x78716c, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })] }), _jsxs("mesh", { position: [12, -8.6, 0], children: [_jsx("boxGeometry", { args: [42, 2.6, 26] }), _jsx("meshLambertMaterial", { color: 0x1c1917, transparent: true, opacity: 0.25, side: THREE.BackSide, depthWrite: false })] }), _jsxs("mesh", { position: [12, -11.5, 0], children: [_jsx("boxGeometry", { args: [42, 3.2, 26] }), _jsx("meshLambertMaterial", { color: 0x52525b, transparent: true, opacity: 0.14, side: THREE.BackSide, depthWrite: false })] }), [-7.3, -9.9].map((y) => (_jsxs("mesh", { position: [12, y, 0], children: [_jsx("boxGeometry", { args: [42, 0.08, 26] }), _jsx("meshBasicMaterial", { color: 0x44403c, transparent: true, opacity: 0.18, depthWrite: false })] }, y)))] }));
}
function ShaftStructure() {
    return (_jsxs("group", { position: [3.0, 0, 0], children: [_jsxs("mesh", { position: [0, -4.4, 0], children: [_jsx("cylinderGeometry", { args: [1.35, 1.35, 8.8, 20, 1, true] }), _jsx("meshLambertMaterial", { color: 0x334155, side: THREE.DoubleSide, transparent: true, opacity: 0.7, depthWrite: false })] }), [-1.5, -3.2, -5.0, -6.8, -8.2].map((y) => (_jsxs("mesh", { position: [0, y, 0], children: [_jsx("torusGeometry", { args: [1.35, 0.05, 8, 24] }), _jsx("meshLambertMaterial", { color: 0x64748b })] }, y))), [[-0.9, 0], [0.9, 0], [0, -0.9], [0, 0.9]].map(([gx, gz], i) => (_jsxs("mesh", { position: [gx, -4.4, gz], children: [_jsx("boxGeometry", { args: [0.08, 8.8, 0.08] }), _jsx("meshLambertMaterial", { color: 0x94a3b8 })] }, i))), _jsxs("mesh", { position: [1.4, -8.5, 0], children: [_jsx("boxGeometry", { args: [2.0, 2.2, 2.4] }), _jsx("meshLambertMaterial", { color: 0x1e293b, transparent: true, opacity: 0.75, depthWrite: false })] })] }));
}
/**
 * Curved tunnel mesh generator using segmented geometry
 */
function CurvedTunnelSegment({ startAngle, endAngle, radius, center, width = 1.4, height = 2.2, segments = 8, }) {
    const meshRef = useRef(null);
    const arches = useMemo(() => {
        const items = [];
        const angleStep = (endAngle - startAngle) / segments;
        for (let i = 0; i <= segments; i++) {
            const a = startAngle + i * angleStep;
            const x = center[0] + Math.cos(a) * radius;
            const z = center[2] + Math.sin(a) * radius;
            const rotY = -a + Math.PI / 2;
            items.push({ x, y: center[1], z, rotY });
        }
        return items;
    }, [startAngle, endAngle, radius, center, segments]);
    return (_jsx("group", { ref: meshRef, children: arches.slice(0, -1).map((curr, idx) => {
            const next = arches[idx + 1];
            const midX = (curr.x + next.x) / 2;
            const midZ = (curr.z + next.z) / 2;
            const length = Math.hypot(next.x - curr.x, next.z - curr.z);
            const angle = Math.atan2(next.z - curr.z, next.x - curr.x);
            return (_jsx("group", { position: [midX, curr.y, midZ], rotation: [0, -angle, 0], children: _jsxs("mesh", { children: [_jsx("boxGeometry", { args: [length * 1.05, height, width] }), _jsx("meshLambertMaterial", { color: 0x334155, transparent: true, opacity: 0.65, depthWrite: false })] }) }, idx));
        }) }));
}
function TunnelNetwork() {
    const tunnelColor = 0x334155;
    const tunnelOpacity = 0.65;
    return (_jsxs("group", { children: [_jsxs("mesh", { position: [14.0, -8.5, 0], children: [_jsx("boxGeometry", { args: [19.0, 2.2, 1.6] }), _jsx("meshLambertMaterial", { color: tunnelColor, transparent: true, opacity: tunnelOpacity, depthWrite: false })] }), _jsx(CurvedTunnelSegment, { startAngle: -Math.PI / 2, endAngle: 0, radius: 4.8, center: [6.5, -8.5, 4.8], width: 1.4, height: 2.2 }), _jsx(CurvedTunnelSegment, { startAngle: Math.PI / 2, endAngle: 0, radius: 4.8, center: [6.5, -8.5, -4.8], width: 1.4, height: 2.2 }), _jsxs("mesh", { position: [17.0, -8.5, 4.8], children: [_jsx("boxGeometry", { args: [13.0, 2.2, 1.4] }), _jsx("meshLambertMaterial", { color: tunnelColor, transparent: true, opacity: tunnelOpacity, depthWrite: false })] }), _jsxs("mesh", { position: [17.0, -8.5, -4.8], children: [_jsx("boxGeometry", { args: [13.0, 2.2, 1.4] }), _jsx("meshLambertMaterial", { color: tunnelColor, transparent: true, opacity: tunnelOpacity, depthWrite: false })] }), [12.0, 17.5, 23.0].map((cx) => (_jsxs("group", { children: [_jsxs("mesh", { position: [cx, -8.5, 2.4], children: [_jsx("boxGeometry", { args: [1.3, 2.0, 3.4] }), _jsx("meshLambertMaterial", { color: tunnelColor, transparent: true, opacity: tunnelOpacity, depthWrite: false })] }), _jsxs("mesh", { position: [cx, -8.5, -2.4], children: [_jsx("boxGeometry", { args: [1.3, 2.0, 3.4] }), _jsx("meshLambertMaterial", { color: tunnelColor, transparent: true, opacity: tunnelOpacity, depthWrite: false })] })] }, cx))), [5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0, 22.5].map((x) => (_jsx(TunnelSteelArch, { position: [x, -8.5, 0], width: 1.6, height: 2.2 }, x))), [12.0, 14.5, 17.0, 19.5, 22.0].map((x) => (_jsx(TunnelSteelArch, { position: [x, -8.5, 4.8], width: 1.4, height: 2.2 }, `n-${x}`))), [12.0, 14.5, 17.0, 19.5, 22.0].map((x) => (_jsx(TunnelSteelArch, { position: [x, -8.5, -4.8], width: 1.4, height: 2.2 }, `s-${x}`)))] }));
}
function TunnelSteelArch({ position, width = 1.6, height = 2.2, }) {
    const halfW = width / 2;
    return (_jsxs("group", { position: position, children: [_jsxs("mesh", { position: [0, 0, -halfW], children: [_jsx("boxGeometry", { args: [0.1, height, 0.1] }), _jsx("meshLambertMaterial", { color: 0x94a3b8 })] }), _jsxs("mesh", { position: [0, 0, halfW], children: [_jsx("boxGeometry", { args: [0.1, height, 0.1] }), _jsx("meshLambertMaterial", { color: 0x94a3b8 })] }), _jsxs("mesh", { position: [0, height / 2 - 0.05, 0], children: [_jsx("boxGeometry", { args: [0.12, 0.1, width + 0.1] }), _jsx("meshLambertMaterial", { color: 0x64748b })] })] }));
}
function LongwallPanel() {
    return (_jsxs("group", { children: [_jsxs("mesh", { position: [16.5, -8.5, 0], children: [_jsx("boxGeometry", { args: [13.5, 2.3, 8.2] }), _jsx("meshLambertMaterial", { color: 0x0f172a, transparent: true, opacity: 0.45, side: THREE.BackSide })] }), _jsxs("lineSegments", { position: [16.5, -8.5, 0], children: [_jsx("edgesGeometry", { args: [new THREE.BoxGeometry(13.5, 2.3, 8.2)] }), _jsx("lineBasicMaterial", { color: 0x38bdf8, transparent: true, opacity: 0.35 })] }), [-3.2, -2.1, -1.0, 0.0, 1.1, 2.2, 3.3].map((z) => (_jsxs("group", { position: [10.5, -8.5, z], children: [_jsxs("mesh", { position: [0, -1.0, 0], children: [_jsx("boxGeometry", { args: [1.4, 0.18, 0.85] }), _jsx("meshLambertMaterial", { color: 0xf59e0b })] }), _jsxs("mesh", { position: [0.2, -0.2, 0], children: [_jsx("cylinderGeometry", { args: [0.08, 0.1, 1.4, 8] }), _jsx("meshLambertMaterial", { color: 0xd97706 })] }), _jsxs("mesh", { position: [0.1, 0.95, 0], rotation: [0, 0, -0.1], children: [_jsx("boxGeometry", { args: [1.6, 0.15, 0.9] }), _jsx("meshLambertMaterial", { color: 0xfbbf24 })] })] }, z)))] }));
}
function AdvancingMiningFront({ progress, stageIndex }) {
    const glowRef = useRef(null);
    const sparkRef = useRef(null);
    // Longwall cutting front advances smoothly from X=10.5 to X=23.0
    const frontX = 10.5 + progress * 12.5;
    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        if (glowRef.current && stageIndex >= 1) {
            const mat = glowRef.current.material;
            mat.opacity = 0.25 + Math.sin(t * 4) * 0.15;
        }
        if (sparkRef.current && stageIndex >= 1) {
            sparkRef.current.intensity = 1.2 + Math.sin(t * 8) * 0.6;
        }
    });
    return (_jsxs("group", { position: [frontX, -8.5, 0], children: [_jsxs("mesh", { position: [0.25, 0, 0], children: [_jsx("boxGeometry", { args: [0.5, 2.3, 8.4] }), _jsx("meshLambertMaterial", { color: 0x451a03 })] }), _jsxs("group", { position: [-0.4, -0.4, 0], children: [_jsxs("mesh", { castShadow: true, children: [_jsx("boxGeometry", { args: [1.8, 1.1, 4.8] }), _jsx("meshLambertMaterial", { color: 0xb45309 })] }), _jsxs("mesh", { position: [0, 0.55, 0], children: [_jsx("boxGeometry", { args: [1.2, 0.45, 2.8] }), _jsx("meshLambertMaterial", { color: 0x78350f })] }), [-2.0, 2.0].map((z, idx) => (_jsxs("group", { position: [0.6, idx === 0 ? 0.4 : -0.3, z], children: [_jsxs("mesh", { rotation: [0, 0, idx === 0 ? 0.4 : -0.3], children: [_jsx("boxGeometry", { args: [1.0, 0.35, 0.4] }), _jsx("meshLambertMaterial", { color: 0x9a3412 })] }), _jsxs("mesh", { position: [0.55, 0, 0], rotation: [0, 0, Math.PI / 2], children: [_jsx("cylinderGeometry", { args: [0.55, 0.55, 0.9, 14] }), _jsx("meshLambertMaterial", { color: 0x18181b })] }), [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (_jsxs("mesh", { position: [
                                    0.55,
                                    Math.sin(ang) * 0.58,
                                    Math.cos(ang) * 0.58,
                                ], children: [_jsx("coneGeometry", { args: [0.06, 0.15, 6] }), _jsx("meshLambertMaterial", { color: 0xf59e0b })] }, i)))] }, z)))] }), stageIndex >= 1 && (_jsxs(_Fragment, { children: [_jsxs("mesh", { ref: glowRef, position: [0.4, 0, 0], children: [_jsx("boxGeometry", { args: [1.2, 2.5, 8.8] }), _jsx("meshBasicMaterial", { color: 0xf97316, transparent: true, opacity: 0.3, side: THREE.BackSide })] }), _jsx("pointLight", { ref: sparkRef, position: [0.2, 0, 0], color: "#fb923c", intensity: 1.5, distance: 8 })] }))] }));
}
