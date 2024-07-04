import { PropertyResult } from './propertyResultModel.js';
import { runAnalysis, serverHelp } from './serverCommunicator.js';

const EXAMINATIONS_WITHOUT_XML = ["StateSpace", "OneSafe", "StableMarking", "QuasiLiveness", "Liveness", "ReachabilityDeadlock"];
const EXAMINATIONS_WITH_XML = ["UpperBounds", "ReachabilityFireability", "ReachabilityCardinality", "CTLFireability", "CTLCardinality", "LTLFireability", "LTLCardinality"];

export default class PropertyLauncher {
    constructor(sharedState, editor) {
        this.sharedState = sharedState;
        this.result = new PropertyResult('stdout', 'stderr');
        this.editor = editor;
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

            let properties = null;
            if (EXAMINATIONS_WITH_XML.includes(selectedExamination)) {
                properties = this.editor.editor.getValue();
            }

            this.clearResultsTable();

            try {
                await runAnalysis(this.sharedState.petriNet, selectedExamination, selectedTool, timeout, this.result, properties);
            } catch (error) {
                this.handleError(error);
            }
        });
    }

    clearResultsTable() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
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
