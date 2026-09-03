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

import { NodePipelineRecord } from '../types/pipeline'
import { generatePipelineData } from './mockPipeline'

// ──────────────────────────────────────────────────────────────────────
// CONFIGURATION — CHANGE THIS LINE TO SWITCH TO REAL BACKEND
// ──────────────────────────────────────────────────────────────────────
const DATA_SOURCE: 'mock' | 'live' = 'mock'

// Base URL for the real backend API (only used when DATA_SOURCE = 'live')
const LIVE_API_BASE = 'http://localhost:8000'  // update to your backend URL
// ──────────────────────────────────────────────────────────────────────

/** Simple in-memory cache keyed by integer timestep */
const cache = new Map<number, NodePipelineRecord[]>()

/**
 * Fetch pipeline data for all nodes at a given simulation time.
 *
 * @param elapsedSeconds - Simulation elapsed time (0–60)
 * @returns Promise<NodePipelineRecord[]> — one record per monitoring node
 *
 * In mock mode: synchronous generation wrapped in a Promise (no network).
 * In live mode:  fetches from real backend API.
 */
export async function fetchPipelineData(elapsedSeconds: number): Promise<NodePipelineRecord[]> {
  const t = Math.round(elapsedSeconds)

  // Cache hit — avoid regenerating same timestep
  if (cache.has(t)) {
    return cache.get(t)!
  }

  let records: NodePipelineRecord[]

  if (DATA_SOURCE === 'mock') {
    // ── MOCK MODE ─────────────────────────────────────────────────────
    records = generatePipelineData(elapsedSeconds)
  } else {
    // ── LIVE MODE ─────────────────────────────────────────────────────
    // Real backend API call — returns same NodePipelineRecord[] shape
    const response = await fetch(`${LIVE_API_BASE}/api/pipeline?t=${t}`)
    if (!response.ok) {
      throw new Error(`Pipeline API error: ${response.status} ${response.statusText}`)
    }
    records = await response.json() as NodePipelineRecord[]
  }

  // Cache and return
  cache.set(t, records)
  return records
}

/**
 * Clear the adapter cache.
 * Call when simulation restarts so stale data is not served.
 */
export function clearPipelineCache(): void {
  cache.clear()
}

/**
 * Helper: get a single node's record from the full dataset.
 */
export function getNodeRecord(
  records: NodePipelineRecord[],
  nodeId: string,
): NodePipelineRecord | undefined {
  return records.find((r) => r.node_id === nodeId)
}

/** Expose current data source for debug overlays */
export function getDataSource(): 'mock' | 'live' {
  return DATA_SOURCE
}
