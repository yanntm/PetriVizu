import { PropertyResult } from './propertyResultModel.js';
import { runAnalysis } from './serverCommunicator.js';
import { exportToPNMLContent } from './exporter.js';

export default class PropertyResultViewer {
    constructor(sharedState) {
        this.sharedState = sharedState;
        this.result = new PropertyResult('stdout', 'stderr');
        
        this.setupRunAnalysis();
    }

    setupRunAnalysis() {
        document.getElementById('run-analysis').addEventListener('click', () => {
            const examinationSelector = document.getElementById('examination-selector');
            const selectedExamination = examinationSelector.value;
            const toolSelector = document.getElementById('tool-selector');
            let selectedTool = toolSelector.value;
            const applyReductions = document.getElementById('apply-reductions').checked;
            const timeout = document.getElementById('timeout').value || 100;

            if (applyReductions) {
                selectedTool += 'xred';
            }

            const property = {
                examination: selectedExamination,
                tool: selectedTool,
                timeout: timeout
            };

            this.runAnalysis(property);
        });
    }

    runAnalysis(property) {
        const pnmlContent = exportToPNMLContent(this.sharedState.petriNet);

        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        runAnalysis(formData, property.examination, property.tool, this.result);
    }

    activate() {
        document.getElementById('property-result').style.display = 'block';
    }

    deactivate() {
        document.getElementById('property-result').style.display = 'none';
    }
}
