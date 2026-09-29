/**
 * useHeroNodes — fetches the 5 hero monitoring nodes for the current scenario.
 *
 * Coordinate conversion:
 *   Backend: x_pos_m (East, metres), y_pos_m (North, metres)
 *   Domain:  ±1183.4 m centred at (0,0) → full extent ~2367 m
 *   Scene:   SCENE_SCALE = 0.009 → 1 scene unit ≈ 111 m
 *   x_scene  = SCENE_CENTER_X + x_pos_m * SCENE_SCALE  (East → scene +X)
 *   z_scene  = y_pos_m * SCENE_SCALE                   (North → scene +Z)
 *   y_scene  = SCENE_UNDERGROUND_Y = -8.7              (fixed underground depth)
 *
 * Retry behaviour on fetch failure:
 *   Attempt 0 → retry after  3 s
 *   Attempt 1 → retry after  5 s
 *   Attempt 2+ → retry after 10 s (indefinite, until success or scenarioId change)
 *
 * Results are stored in Zustand (heroNodes / heroNodesLoading / heroNodesError).
 * This hook is side-effect-only; mount it once via HeroNodesLoader in App.tsx.
 * All consumers read from the store directly.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSimulationStore } from '../store/simulationStore'
import { LIVE_API_BASE } from '../services/pipelineAdapter'
import { NodePipelineRecord } from '../types/pipeline'
import { MonitoringNode } from '../data/sensorLayout'

const SCENE_SCALE = 0.009
const SCENE_CENTER_X = 11.0
const SCENE_UNDERGROUND_Y = -8.7

const RETRY_DELAYS = [3000, 5000, 10000]
function retryDelay(attempt: number): number {
  return RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
}

function nodeCode(id: string): string {
  if (id.startsWith('boundary_'))      return `BND-${id.slice(9).padStart(2, '0')}`
  if (id.startsWith('interior_'))      return `INT-${parseInt(id.slice(9))}`
  if (id.startsWith('mining_front_'))  return `MFR-${id.slice(13, 15)}`
  if (id.startsWith('critical_asset_')) return `CRT-${id.slice(15).padStart(2, '0')}`
  return id.slice(0, 8).toUpperCase()
}

function nodeName(id: string): string {
  if (id.startsWith('boundary_'))      return `Boundary Node ${id.slice(9)}`
  if (id.startsWith('interior_'))      return `Interior Node ${parseInt(id.slice(9))}`
  if (id.startsWith('mining_front_')) {
    const parts = id.slice(13).split('__')
    const rib = parts[1] === '-1' ? ' (Left Rib)' : parts[1] === '1' ? ' (Right Rib)' : ' (Centre)'
    return `Mining Front ${parts[0]}${rib}`
  }
  if (id.startsWith('critical_asset_')) return `Critical Asset ${id.slice(15)}`
  return id
}

function heroRecordToMonitoringNode(r: NodePipelineRecord): MonitoringNode {
  return {
    id: r.node_id,
    code: nodeCode(r.node_id),
    name: nodeName(r.node_id),
    locationName: `Underground — ${nodeName(r.node_id)}`,
    position: new THREE.Vector3(
      SCENE_CENTER_X + r.x_pos_m * SCENE_SCALE,
      SCENE_UNDERGROUND_Y,
      r.y_pos_m * SCENE_SCALE,
    ),
    description: `Hero monitoring node selected for scenario ${r.scenario_id}.`,
    // Uniform sensitivity: real per-node sensor sensitivities are not exposed by the backend.
    // The ML pipeline section in SensorInfoPanel still shows real per-node output via usePipelineData.
    sensitivity: {
      vibration: 1.0,
      tilt: 1.0,
      strain: 1.0,
      seismic: 1.0,
      gas: 1.0,
      riskMultiplier: 1.0,
    },
  }
}

export function useHeroNodes(): void {
  const scenarioId            = useSimulationStore((s) => s.scenarioId)
  const retryTrigger          = useSimulationStore((s) => s.heroNodesRetryTrigger)
  const setHeroNodes          = useSimulationStore((s) => s.setHeroNodes)
  const setHeroNodesLoading   = useSimulationStore((s) => s.setHeroNodesLoading)
  const setHeroNodesError     = useSimulationStore((s) => s.setHeroNodesError)
  const triggerHeroNodesRetry = useSimulationStore((s) => s.triggerHeroNodesRetry)

  // Track attempt count across retries for the current scenarioId.
  // Reset to 0 whenever scenarioId changes so backoff restarts fresh.
  const attemptRef    = useRef(0)
  const lastScenario  = useRef('')
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear any pending auto-retry timer from the previous run
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Reset backoff attempt counter on scenario change
    if (scenarioId !== lastScenario.current) {
      lastScenario.current = scenarioId
      attemptRef.current = 0
    }

    let cancelled = false
    setHeroNodesLoading(true)
    setHeroNodesError(null)

    const load = async () => {
      let response: Response
      try {
        response = await fetch(
          `${LIVE_API_BASE}/api/pipeline/hero?scenario=${scenarioId}&t=0`,
        )
      } catch {
        if (!cancelled) {
          setHeroNodesLoading(false)
          setHeroNodesError(
            `Backend unreachable — is the server running at ${LIVE_API_BASE}?`,
          )
          const delay = retryDelay(attemptRef.current)
          attemptRef.current++
          timerRef.current = setTimeout(() => {
            timerRef.current = null
            triggerHeroNodesRetry()
          }, delay)
        }
        return
      }

      if (response.status === 404) {
        if (!cancelled) {
          setHeroNodesLoading(false)
          setHeroNodesError(`Scenario not found: "${scenarioId}" (404)`)
          const delay = retryDelay(attemptRef.current)
          attemptRef.current++
          timerRef.current = setTimeout(() => {
            timerRef.current = null
            triggerHeroNodesRetry()
          }, delay)
        }
        return
      }
      if (response.status === 422) {
        if (!cancelled) {
          setHeroNodesLoading(false)
          setHeroNodesError(`Invalid hero nodes request (422)`)
          // 422 is a bad request — no point retrying
        }
        return
      }
      if (!response.ok) {
        if (!cancelled) {
          setHeroNodesLoading(false)
          setHeroNodesError(
            `Hero nodes API error: ${response.status} ${response.statusText}`,
          )
          const delay = retryDelay(attemptRef.current)
          attemptRef.current++
          timerRef.current = setTimeout(() => {
            timerRef.current = null
            triggerHeroNodesRetry()
          }, delay)
        }
        return
      }

      const records = (await response.json()) as NodePipelineRecord[]
      if (!cancelled) {
        setHeroNodes(records.map(heroRecordToMonitoringNode))
        setHeroNodesLoading(false)
        attemptRef.current = 0  // reset on success so any future failure starts fresh
      }
    }

    load()
    return () => {
      cancelled = true
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [scenarioId, retryTrigger]) // eslint-disable-line react-hooks/exhaustive-deps
}
