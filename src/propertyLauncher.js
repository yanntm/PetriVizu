import { PropertyResult } from './propertyResultModel.js';
import { runAnalysis, serverHelp } from './serverCommunicator.js';

export default class PropertyLauncher {
    constructor(sharedState) {
        this.sharedState = sharedState;
        this.result = new PropertyResult('stdout', 'stderr');
        
        this.setupRunAnalysis();
    }

    setupRunAnalysis() {
        document.getElementById('run-analysis').addEventListener('click', async () => {
            const examinationSelector = document.getElementById('examination-selector');
            const selectedExamination = examinationSelector.value;
            const toolSelector = document.getElementById('tool-selector');
            let selectedTool = toolSelector.value;
            const applyReductions = document.getElementById('apply-reductions').checked;
            const timeout = document.getElementById('timeout').value || 100;

            if (applyReductions) {
                selectedTool += 'xred';
            }

            try {
                await runAnalysis(this.sharedState.petriNet, selectedExamination, selectedTool, timeout, this.result);
            } catch (error) {
                this.handleError(error);
            }
        });
    }

    handleError(error) {
        const stderrElem = this.result.stderrElem;
        stderrElem.value = serverHelp();
        alert(serverHelp());
        console.error('Error:', error);
    }

    activate() {
        document.getElementById('property-result').style.display = 'block';
    }

    deactivate() {
        document.getElementById('property-result').style.display = 'none';
    }
}
