import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { getScenarioStages } from '../../data/stageDefinitions';
export function AlertBanner() {
    const stageIndex = useSimulationStore((s) => s.stageIndex);
    const scenarioId = useSimulationStore((s) => s.scenarioId);
    const [key, setKey] = useState(0);
    const stageDef = getScenarioStages(scenarioId)[stageIndex];
    useEffect(() => {
        setKey((k) => k + 1);
    }, [stageIndex]);
    return (_jsxs("div", { className: `alert-banner ${stageDef.alertSeverity}`, id: "alert-banner", children: [_jsx("div", { className: "alert-dot" }), stageDef.alertMessage] }, key));
}
