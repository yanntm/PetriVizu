import { exportToPNMLContent } from './exporter.js';

export default class AnalysisMode {
    constructor(sharedState) {
        this.sharedState = sharedState;

        this.runAnalysis = this.runAnalysis.bind(this);
        this.setupAnalysisControls = this.setupAnalysisControls.bind(this);
        this.updateExaminations = this.updateExaminations.bind(this);
        this.fetchToolsAndExaminations = this.fetchToolsAndExaminations.bind(this);

        this.setupAnalysisControls();
        this.fetchToolsAndExaminations();
    }

    setupAnalysisControls() {
        document.getElementById('run-analysis').addEventListener('click', this.runAnalysis);
        document.getElementById('tool-selector').addEventListener('change', this.updateExaminations);
    }

    async fetchToolsAndExaminations() {
        const toolSelector = document.getElementById('tool-selector');
        const examinationSelector = document.getElementById('examination-selector');

        toolSelector.innerHTML = '';
        examinationSelector.innerHTML = '';

        try {
            const response = await fetch('http://localhost:5000/tools/descriptions');
            const data = await response.json();

            data.tools_info.forEach(toolInfo => {
                const option = document.createElement('option');
                option.value = toolInfo.tool;
                option.textContent = toolInfo.tool;
                toolSelector.appendChild(option);
            });

            this.updateExaminations();
        } catch (error) {
            console.error('Error fetching tools and examinations:', error);
            const stderrElem = document.getElementById('stderr');
            stderrElem.value = 'Error communicating with the server. Please visit https://github.com/yanntm/MCC-server and follow the README to get the server running.';
        }
    }

    updateExaminations() {
        const toolSelector = document.getElementById('tool-selector');
        const examinationSelector = document.getElementById('examination-selector');
        const selectedTool = toolSelector.value;

        examinationSelector.innerHTML = '';

        fetch(`http://localhost:5000/tools/${selectedTool}/examinations`)
            .then(response => response.json())
            .then(data => {
                data.PTexaminations.forEach(exam => {
                    const option = document.createElement('option');
                    option.value = exam;
                    option.textContent = exam;
                    examinationSelector.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching examinations:', error);
                const stderrElem = document.getElementById('stderr');
                stderrElem.value = 'Error communicating with the server. Please visit https://github.com/yanntm/MCC-server and follow the README to get the server running.';
            });
    }

    async runAnalysis() {
        const pnmlContent = exportToPNMLContent(this.sharedState.petriNet);

        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        const toolSelector = document.getElementById('tool-selector');
        let selectedTool = toolSelector.value;
        const examinationSelector = document.getElementById('examination-selector');
        const selectedExamination = examinationSelector.value;
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
