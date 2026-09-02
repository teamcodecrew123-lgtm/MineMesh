import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
// Maximum realistic subsidence depth in 3D world units (prominent for presentation)
const MAX_SUBSIDENCE_DEPTH = 2.85;
/**
 * 3D Terrain:
 * - Perfectly sized (42m x 26m) and aligned directly on top of the rock strata block at [12, 0, 0]
 * - Physical geometry subsidence deformation (sinking bowl above longwall extraction)
 * - Direct per-vertex heatmap gradient (Green -> Yellow -> Orange -> Vivid Red Core)
 * - Double-sided so it is visible from surface top-down and underground bottom-up
 */
export function Terrain() {
    const meshRef = useRef(null);
    const terrainDeformation = useSimulationStore((s) => s.terrainDeformation);
    const miningFrontProgress = useSimulationStore((s) => s.miningFrontProgress);
    const layers = useSimulationStore((s) => s.layers);
    // Sized 42m x 26m to perfectly match the rock strata block at [12, 0, 0]
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(42, 26, 96, 60);
        geo.rotateX(-Math.PI / 2);
        const positions = geo.attributes.position;
        const count = positions.count;
        // Store natural baseline terrain elevation
        const origY = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const noise = Math.sin(x * 0.25) * 0.12 +
                Math.cos(z * 0.22) * 0.10 +
                Math.sin(x * 0.5 + z * 0.3) * 0.05;
            positions.setY(i, noise);
            origY[i] = noise;
        }
        geo.userData.origY = origY;
        // Add per-vertex RGB color attribute
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            colors[i] = 0.42;
            colors[i + 1] = 0.68;
            colors[i + 2] = 0.26;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();
        return geo;
    }, []);
    // Dynamic deformation & vertex heatmap per frame
    useFrame(() => {
        if (!meshRef.current)
            return;
        const geo = meshRef.current.geometry;
        const positions = geo.attributes.position;
        const colors = geo.attributes.color;
        const origY = geo.userData.origY;
        const count = positions.count;
        const deform = terrainDeformation;
        // Dynamic subsidence center in local terrain space (terrain center is world X=12)
        // World mining front: 9.0 + progress * 5.5 => Local center: -3.0 + progress * 5.5
        const centerX = -3.0 + miningFrontProgress * 5.5;
        const centerZ = 0.0;
        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const dx = x - centerX;
            const dz = z - centerZ;
            const dist2 = dx * dx + dz * dz;
            // 1. Primary smooth Gaussian subsidence bowl
            const sigma2 = 28.0;
            const bowl = MAX_SUBSIDENCE_DEPTH * deform * Math.exp(-dist2 / sigma2);
            // 2. Extraction corridor trough extension
            const troughDx = x - 0.0; // Panel centerline is at local x = 0 (world X = 12)
            const trough = MAX_SUBSIDENCE_DEPTH *
                0.38 *
                deform *
                Math.exp(-((troughDx * troughDx) / 48.0 + (dz * dz) / 16.0));
            const totalDrop = bowl + trough;
            positions.setY(i, origY[i] - totalDrop);
            // 3. Direct Vertex Heatmap coloring (Green -> Yellow -> Orange -> Vivid Red)
            const intensity = Math.min(totalDrop / (MAX_SUBSIDENCE_DEPTH * 0.9), 1.0);
            let r = 0.42;
            let g = 0.68;
            let b = 0.26;
            if (intensity > 0.02 && layers.deformation) {
                if (intensity < 0.22) {
                    // Green -> Yellow (Early subsidence onset)
                    const t = (intensity - 0.02) / 0.2;
                    r = 0.42 + t * 0.56; // 0.42 -> 0.98
                    g = 0.68 + t * 0.22; // 0.68 -> 0.90
                    b = 0.26 * (1 - t); // 0.26 -> 0.02
                }
                else if (intensity < 0.52) {
                    // Yellow -> Orange (Active deformation zone)
                    const t = (intensity - 0.22) / 0.3;
                    r = 0.98 + t * 0.02; // 0.98 -> 1.00
                    g = 0.90 - t * 0.42; // 0.90 -> 0.48
                    b = 0.02 * (1 - t);
                }
                else if (intensity < 0.82) {
                    // Orange -> Bright Red (High risk zone)
                    const t = (intensity - 0.52) / 0.3;
                    r = 1.0 - t * 0.04; // 1.00 -> 0.96
                    g = 0.48 - t * 0.38; // 0.48 -> 0.10
                    b = 0.02 + t * 0.06;
                }
                else {
                    // Vivid Solid Red (Critical subsidence core)
                    r = 0.92;
                    g = 0.05;
                    b = 0.06;
                }
            }
            colors.setXYZ(i, r, g, b);
        }
        positions.needsUpdate = true;
        colors.needsUpdate = true;
        geo.computeVertexNormals();
    });
    if (!layers.surface)
        return null;
    return (_jsx("mesh", { ref: meshRef, position: [12, 0, 0], geometry: geometry, receiveShadow: true, children: _jsx("meshLambertMaterial", { vertexColors: true, side: THREE.DoubleSide }) }));
}
