import { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { getScenarioStages } from '../../data/stageDefinitions'

export function AlertBanner() {
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const scenarioId = useSimulationStore((s) => s.scenarioId)
  const [key, setKey] = useState(0)
  const stageDef = getScenarioStages(scenarioId)[stageIndex]

  useEffect(() => {
    setKey((k) => k + 1)
  }, [stageIndex])

  return (
    <div key={key} className={`alert-banner ${stageDef.alertSeverity}`} id="alert-banner">
      <div className="alert-dot" />
      {stageDef.alertMessage}
    </div>
  )
}
