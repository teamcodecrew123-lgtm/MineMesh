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
} from '../services/pipelineAdapter'
import { mapDemoToBackendT } from '../data/stageDefinitions'
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
  const scenarioId = useSimulationStore((s) => s.scenarioId)
  const playing = useSimulationStore((s) => s.playing)

  // Map demo time (0–60s) to real backend timestep (0–299) using per-scenario stage boundaries.
  const backendT = mapDemoToBackendT(elapsedSeconds, scenarioId)

  const [records, setRecords] = useState<NodePipelineRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data whenever the mapped backend timestep or scenario changes.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchPipelineData(backendT, scenarioId)
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

    load()

    return () => { cancelled = true }
  }, [backendT, scenarioId])  // eslint-disable-line react-hooks/exhaustive-deps

  const getRecord = useCallback(
    (nodeId: string): NodePipelineRecord | undefined => getNodeRecord(records, nodeId),
    [records],
  )

  return { records, loading, error, getRecord }
}
