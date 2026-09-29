import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import { Terrain } from './Terrain';
import { Underground } from './Underground';
import { Sensors } from './Sensors';
import { MicroseismicEvents } from './MicroseismicEvents';
import { GNSS_STATIONS } from '../../data/sensorLayout';
export function MineScene() {
    return (_jsx(Canvas, { camera: { position: [26, 20, 26], fov: 46, near: 0.1, far: 600 }, shadows: true, dpr: [1, 1.5], gl: { antialias: true }, style: { background: '#dce8f2' }, children: _jsx(SceneContent, {}) }));
}
function SceneContent() {
    const { camera } = useThree();
    const viewMode = useSimulationStore((s) => s.viewMode);
    const selectedNodeId = useSimulationStore((s) => s.selectedNodeId);
    const selectedGNSSId = useSimulationStore((s) => s.selectedGNSSId);
    const heroNodes = useSimulationStore((s) => s.heroNodes);
    const cameraResetTrigger = useSimulationStore((s) => s.cameraResetTrigger);
    const tick = useSimulationStore((s) => s.tick);
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const miningFrontProgress = useSimulationStore((s) => s.miningFrontProgress);
    const layers = useSimulationStore((s) => s.layers);
    const controlsRef = useRef(null);
    // Advance simulation clock each frame
    useFrame((_, delta) => {
        tick(delta);
    });
    // Smooth camera view transitions on explicit user selection or reset
    useEffect(() => {
        const c = camera;
        if (selectedNodeId) {
            const node = heroNodes.find((n) => n.id === selectedNodeId);
            if (node && controlsRef.current) {
                c.position.set(node.position.x + 8.5, node.position.y + 7.5, node.position.z + 8.5);
                controlsRef.current.target.set(node.position.x, node.position.y + 0.8, node.position.z);
                controlsRef.current.update();
                return;
            }
        }
        if (selectedGNSSId) {
            const gnss = GNSS_STATIONS.find((g) => g.id === selectedGNSSId);
            if (gnss && controlsRef.current) {
                c.position.set(gnss.position.x + 8.0, gnss.position.y + 7.0, gnss.position.z + 8.0);
                controlsRef.current.target.set(gnss.position.x, gnss.position.y + 0.8, gnss.position.z);
                controlsRef.current.update();
                return;
            }
        }
        if (controlsRef.current) {
            if (viewMode === 'full') {
                c.position.set(26, 20, 26);
                controlsRef.current.target.set(11.5, 0, 0);
            }
            else if (viewMode === 'surface') {
                c.position.set(18, 16, 22);
                controlsRef.current.target.set(11.5, 0.5, 0);
            }
            else if (viewMode === 'underground') {
                c.position.set(13, -3.5, 20);
                controlsRef.current.target.set(13.5, -8.5, 0);
            }
            else if (viewMode === 'cutaway') {
                c.position.set(2, 6, 24);
                controlsRef.current.target.set(11.5, -4.0, 0);
            }
            else if (viewMode === 'affected') {
                const focusX = 10.0 + miningFrontProgress * 5.0;
                c.position.set(focusX + 9, 8, 10);
                controlsRef.current.target.set(focusX, -1.0, 0);
            }
            controlsRef.current.update();
        }
    }, [viewMode, selectedNodeId, selectedGNSSId, cameraResetTrigger, camera]);
    return (_jsxs(_Fragment, { children: [_jsx("color", { attach: "background", args: ['#d4e3f0'] }), _jsx("fog", { attach: "fog", args: ['#d4e3f0', 80, 220] }), _jsx("ambientLight", { intensity: 0.68 }), _jsx("directionalLight", { position: [32, 42, 28], intensity: 1.15, castShadow: true, "shadow-mapSize": [2048, 2048], "shadow-camera-far": 120, "shadow-camera-left": -35, "shadow-camera-right": 35, "shadow-camera-top": 25, "shadow-camera-bottom": -25 }), _jsx("hemisphereLight", { args: ['#dbeafe', '#78350f', 0.42] }), _jsx("pointLight", { position: [9, -8.0, 0], intensity: 1.1, color: "#f59e0b", distance: 15 }), _jsx("pointLight", { position: [18, -8.0, 0], intensity: 1.0, color: "#fb923c", distance: 14 }), stageIndex >= 5 && (_jsx("pointLight", { position: [12, 3.5, 0], intensity: 2.8, color: "#ef4444", distance: 25 })), _jsx(Sky, { distance: 450000, sunPosition: [1.2, 0.7, 0.4], inclination: 0.52, azimuth: 0.22, turbidity: stageIndex >= 4 ? 10 : 6, rayleigh: stageIndex >= 4 ? 1.1 : 0.4 }), _jsx(Terrain, {}), _jsx(Underground, {}), _jsx(Sensors, {}), _jsx(MicroseismicEvents, {}), layers.surfaceStructures && _jsx(SurfaceInfrastructure, {}), _jsx(OrbitControls, { ref: controlsRef, target: [11.5, 0, 0], minDistance: 5, maxDistance: 95, maxPolarAngle: Math.PI * 0.82, enableDamping: true, dampingFactor: 0.08 })] }));
}
function SurfaceInfrastructure() {
    return (_jsxs("group", { children: [_jsxs("group", { position: [3.0, 0, 0], children: [[[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].map(([x, z], i) => (_jsxs("mesh", { position: [x, 1.8, z], castShadow: true, children: [_jsx("boxGeometry", { args: [0.22, 3.6, 0.22] }), _jsx("meshLambertMaterial", { color: 0x475569 })] }, i))), _jsxs("mesh", { position: [0, 3.6, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [2.8, 0.25, 2.8] }), _jsx("meshLambertMaterial", { color: 0x334155 })] }), _jsxs("mesh", { position: [0, 4.4, 0], rotation: [Math.PI / 2, 0, 0], castShadow: true, children: [_jsx("torusGeometry", { args: [0.9, 0.08, 8, 24] }), _jsx("meshLambertMaterial", { color: 0x1e293b })] })] }), _jsxs("group", { position: [-1.5, 0.9, -5.5], children: [_jsxs("mesh", { castShadow: true, children: [_jsx("boxGeometry", { args: [6.0, 1.8, 4.8] }), _jsx("meshLambertMaterial", { color: 0xe2e8f0 })] }), _jsxs("mesh", { position: [0, 1.0, 0], children: [_jsx("boxGeometry", { args: [6.3, 0.2, 5.1] }), _jsx("meshLambertMaterial", { color: 0x64748b })] }), _jsxs("mesh", { position: [0, 0.5, 2.42], children: [_jsx("boxGeometry", { args: [3.2, 0.4, 0.05] }), _jsx("meshBasicMaterial", { color: 0x1e3a8a })] })] }), _jsxs("mesh", { position: [10, 0.35, 7.5], rotation: [0, -0.18, 0], castShadow: true, children: [_jsx("boxGeometry", { args: [16, 0.3, 1.2] }), _jsx("meshLambertMaterial", { color: 0x475569 })] })] }));
}
