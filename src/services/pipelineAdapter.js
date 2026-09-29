/**
 * Pipeline Adapter — THE BACKEND SWITCH POINT
 * ─────────────────────────────────────────────────────────────────────
 * This is the ONLY file that needs to change when the real backend
 * is ready. All UI components consume data through this adapter,
 * so they are completely isolated from the data source.
 *
 * HOW TO SWITCH TO REAL BACKEND:
 *   1. Change DATA_SOURCE from 'mock' to 'live'
 *   2. Set LIVE_API_BASE to your backend URL
 *   3. Done — all UI components work without any other changes.
 *
 * BACKEND CONTRACT:
 *   The live API must return NodePipelineRecord[] (defined in types/pipeline.ts)
 *   at endpoint: GET /api/pipeline?t={timestep}
 *   The JSON shape is identical to what mockPipeline.ts produces.
 */
import { generatePipelineData } from './mockPipeline';
// ──────────────────────────────────────────────────────────────────────
// CONFIGURATION — set to 'mock' to run without a backend
// ──────────────────────────────────────────────────────────────────────
const DATA_SOURCE = 'live';
export const LIVE_API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
// ──────────────────────────────────────────────────────────────────────
/** In-memory cache keyed by composite "scenarioId:t" to prevent cross-scenario stale hits */
const cache = new Map();
/**
 * Fetch pipeline data for all nodes at a given backend timestep and scenario.
 *
 * @param backendT   - Backend timestep (0–299), pre-computed by mapDemoToBackendT
 * @param scenarioId - Active scenario identifier
 * @returns Promise<NodePipelineRecord[]> — one record per monitoring node
 *
 * In mock mode: synchronous generation wrapped in a Promise (no network).
 * In live mode:  fetches from real backend API.
 */
export async function fetchPipelineData(backendT, scenarioId) {
    const t = backendT;
    const cacheKey = `${scenarioId}:${t}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    let records;
    if (DATA_SOURCE === 'mock') {
        // ── MOCK MODE ─────────────────────────────────────────────────────
        records = generatePipelineData(t, scenarioId);
    }
    else {
        // ── LIVE MODE ─────────────────────────────────────────────────────
        let response;
        try {
            response = await fetch(`${LIVE_API_BASE}/api/pipeline?scenario=${scenarioId}&t=${t}`);
        }
        catch {
            // Network-level failure — backend not running or unreachable
            throw new Error(`Backend unreachable — is the server running at ${LIVE_API_BASE}?`);
        }
        if (response.status === 404) {
            throw new Error(`Scenario not found: "${scenarioId}" (404)`);
        }
        if (response.status === 422) {
            throw new Error(`Invalid timestep t=${t} for scenario "${scenarioId}" (422)`);
        }
        if (!response.ok) {
            throw new Error(`Pipeline API error: ${response.status} ${response.statusText}`);
        }
        records = await response.json();
    }
    cache.set(cacheKey, records);
    return records;
}
/**
 * Clear the adapter cache.
 * Call when simulation restarts so stale data is not served.
 */
export function clearPipelineCache() {
    cache.clear();
}
/**
 * Helper: get a single node's record from the full dataset.
 */
export function getNodeRecord(records, nodeId) {
    return records.find((r) => r.node_id === nodeId);
}
/** Expose current data source for debug overlays */
export function getDataSource() {
    return DATA_SOURCE;
}
