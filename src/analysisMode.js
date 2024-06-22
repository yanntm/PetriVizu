import { exportToPNMLContent } from './exporter.js';

const EXAMINATIONS_WITHOUT_XML = ["StateSpace", "OneSafe", "StableMarking", "QuasiLiveness", "Liveness", "ReachabilityDeadlock"];
const EXAMINATIONS_WITH_XML = ["UpperBounds", "ReachabilityFireability", "ReachabilityCardinality", "CTLFireability", "CTLCardinality", "LTLFireability", "LTLCardinality"];

export default class AnalysisMode {
    constructor(sharedState) {
        this.sharedState = sharedState;

        this.runAnalysis = this.runAnalysis.bind(this);
        this.setupAnalysisControls = this.setupAnalysisControls.bind(this);
        this.updateTools = this.updateTools.bind(this);
        this.fetchToolsAndExaminations = this.fetchToolsAndExaminations.bind(this);

        this.examinationToolMap = {};

        this.setupAnalysisControls();
        this.fetchToolsAndExaminations();
    }

    setupAnalysisControls() {
        document.getElementById('run-analysis').addEventListener('click', this.runAnalysis);
        document.getElementById('examination-selector').addEventListener('change', this.updateTools);
    }

    activate() {
        // Logic to activate the tab, e.g., setting up controls
    }

    deactivate() {
        // Logic to deactivate the tab, e.g., cleaning up controls
    }

    async fetchToolsAndExaminations() {
        const examinationSelector = document.getElementById('examination-selector');
        const toolSelector = document.getElementById('tool-selector');

        examinationSelector.innerHTML = '';
        toolSelector.innerHTML = '';

        try {
            const response = await fetch('http://localhost:5000/tools/descriptions');
            const data = await response.json();

            data.tools_info.forEach(toolInfo => {
                toolInfo.PTexaminations.forEach(exam => {
                    if (EXAMINATIONS_WITHOUT_XML.includes(exam)) {
                        if (!this.examinationToolMap[exam]) {
                            this.examinationToolMap[exam] = new Set();
                        }
                        this.examinationToolMap[exam].add(toolInfo.tool);
                    }
                });
            });

            EXAMINATIONS_WITHOUT_XML.forEach(exam => {
                if (this.examinationToolMap[exam]) {
                    const option = document.createElement('option');
                    option.value = exam;
                    option.textContent = exam;
                    examinationSelector.appendChild(option);
                }
            });

            this.updateTools();
        } catch (error) {
            console.error('Error fetching tools and examinations:', error);
            const stderrElem = document.getElementById('stderr');
            stderrElem.value = 'Error communicating with the server. Please visit https://github.com/yanntm/MCC-server and follow the README to get the server running.';
        }
    }

    updateTools() {
        const examinationSelector = document.getElementById('examination-selector');
        const toolSelector = document.getElementById('tool-selector');
        const selectedExamination = examinationSelector.value;

        toolSelector.innerHTML = '';

        if (this.examinationToolMap[selectedExamination]) {
            this.examinationToolMap[selectedExamination].forEach(tool => {
                const option = document.createElement('option');
                option.value = tool;
                option.textContent = tool;
                toolSelector.appendChild(option);
            });
        }
    }

    async runAnalysis() {
        const pnmlContent = exportToPNMLContent(this.sharedState.petriNet);

        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        const examinationSelector = document.getElementById('examination-selector');
        const selectedExamination = examinationSelector.value;
        const toolSelector = document.getElementById('tool-selector');
        let selectedTool = toolSelector.value;
        const applyReductions = document.getElementById('apply-reductions').checked;
        const timeout = document.getElementById('timeout').value || 100;

        if (applyReductions) {
            selectedTool += 'xred';
        }

        const stdoutElem = document.getElementById('stdout');
        const stderrElem = document.getElementById('stderr');
        stdoutElem.value = '';
        stderrElem.value = '';

        try {
            const response = await fetch(`http://localhost:5000/mcc/PT/${selectedExamination}/${selectedTool}`, {
                method: 'POST',
                body: formData
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                const text = decoder.decode(value, { stream: !done });

                const parts = text.split('\n');
                parts.forEach(part => {
                    if (part.startsWith('data:')) {
                        const output = part.slice(5); // Remove 'data:' prefix
                        stdoutElem.value += output + '\n';
                    }
                });
            }
        } catch (error) {
            console.error('Error running analysis:', error);
            stderrElem.value = 'Error running analysis. Please check server logs for details.';
        }
    }
}
