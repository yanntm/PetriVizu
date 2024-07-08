import { SharedState } from './sharedState';
import { PropertyResult } from './propertyResultModel';
import { runAnalysis, serverHelp } from './serverCommunicator';

const EXAMINATIONS_WITHOUT_XML = ["StateSpace", "OneSafe", "StableMarking", "QuasiLiveness", "Liveness", "ReachabilityDeadlock"];
const EXAMINATIONS_WITH_XML = ["UpperBounds", "ReachabilityFireability", "ReachabilityCardinality", "CTLFireability", "CTLCardinality", "LTLFireability", "LTLCardinality"];

export default class PropertyLauncher {
    private sharedState: SharedState;
    private result: PropertyResult;
    private editor: any;

    constructor(sharedState: SharedState, editor: any) {
        this.sharedState = sharedState;
        this.result = new PropertyResult('stdout', 'stderr');
        this.editor = editor;
        this.setupRunAnalysis();
    }

    setupRunAnalysis(): void {
        const runButton = document.getElementById('run-analysis');
        runButton?.addEventListener('click', async () => {
            const examinationSelector = document.getElementById('examination-selector') as HTMLSelectElement;
            const selectedExamination = examinationSelector.value;
            const toolSelector = document.getElementById('tool-selector') as HTMLSelectElement;
            let selectedTool = toolSelector.value;
            const applyReductions = (document.getElementById('apply-reductions') as HTMLInputElement).checked;
            const timeoutValue = (document.getElementById('timeout') as HTMLInputElement).value || '100';
            const timeout = parseInt(timeoutValue, 10);

            if (applyReductions) {
                selectedTool += 'xred';
            }

            let properties: string | null = null;
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

    clearResultsTable(): void {
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
        }
    }

    handleError(error: unknown): void {
        const stderrElem = this.result.stderrElem;
        if (stderrElem) {
            stderrElem.value = serverHelp();
        }
        alert(serverHelp());
        console.error('Error:', error);
    }

    activate(): void {
        const propertyResult = document.getElementById('property-result');
        if (propertyResult) {
            propertyResult.style.display = 'block';
        }
    }

    deactivate(): void {
        const propertyResult = document.getElementById('property-result');
        if (propertyResult) {
            propertyResult.style.display = 'none';
        }
    }
}
