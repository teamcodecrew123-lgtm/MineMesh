import { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { STAGE_DEFINITIONS } from '../../data/stageDefinitions'

export function AlertBanner() {
  const stageIndex = useSimulationStore((s) => s.stageIndex)
  const [key, setKey] = useState(0)
  const stageDef = STAGE_DEFINITIONS[stageIndex]

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
