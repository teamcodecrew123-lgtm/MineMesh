/**
 * usePipelineData — React hook for ML pipeline data
 * ─────────────────────────────────────────────────────────────────────
 * Subscribes to the simulation's elapsedSeconds and fetches fresh
 * pipeline data from pipelineAdapter on each tick change.
 *
 * Returns per-node pipeline records and helpers to look up a specific node.
 * All UI components should use this hook — never call pipelineAdapter directly.
 */

import { useEffect, useState, useCallback } from 'react'
import { useSimulationStore } from '../store/simulationStore'
import {
  fetchPipelineData,
  getNodeRecord,
  clearPipelineCache,
} from '../services/pipelineAdapter'
import { NodePipelineRecord } from '../types/pipeline'

export interface PipelineDataState {
  /** All 5 node records for the current timestep */
  records: NodePipelineRecord[]
  /** True briefly on first load or after a restart */
  loading: boolean
  /** Error message if live API fails (null in mock mode) */
  error: string | null
  /**
   * Get pipeline record for a specific node.
   * Returns undefined if records not loaded yet.
   */
  getRecord: (nodeId: string) => NodePipelineRecord | undefined
}

export function usePipelineData(): PipelineDataState {
  const elapsedSeconds = useSimulationStore((s) => s.elapsedSeconds)
  const playing = useSimulationStore((s) => s.playing)

  const [records, setRecords] = useState<NodePipelineRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clear cache when simulation restarts (elapsedSeconds resets to 0)
  useEffect(() => {
    if (elapsedSeconds === 0) {
      clearPipelineCache()
    }
  }, [elapsedSeconds === 0])  // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data whenever elapsed time changes
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchPipelineData(elapsedSeconds)
        if (!cancelled) {
          setRecords(data)
          setError(null)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Pipeline data error')
          setLoading(false)
        }
      }
    }

    // Throttle: only refetch when playing or on manual jump (not every frame)
    // quantized to integer seconds so we only re-render at second boundaries
    load()

    return () => { cancelled = true }
  }, [Math.round(elapsedSeconds)])  // quantized dependency — only triggers on integer second changes

  const getRecord = useCallback(
    (nodeId: string): NodePipelineRecord | undefined => getNodeRecord(records, nodeId),
    [records],
  )

  return { records, loading, error, getRecord }
}
