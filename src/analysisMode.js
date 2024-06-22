import { exportToPNMLContent } from './exporter.js';

export default class AnalysisMode {
    constructor(sharedState) {
        this.sharedState = sharedState;
        
        this.runAnalysis = this.runAnalysis.bind(this);

        this.setupAnalysisControls();
    }
    

    setupAnalysisControls() {
        document.getElementById('run-analysis').addEventListener('click', this.runAnalysis);
    }

    async runAnalysis() {
        const pnmlContent = exportToPNMLContent(this.sharedState.petriNet);

        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        const response = await fetch('http://localhost:5000/run', {
            method: 'POST',
            body: formData
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        const stdoutElem = document.getElementById('stdout');
        const stderrElem = document.getElementById('stderr');
        stdoutElem.value = '';
        stderrElem.value = '';

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
    }
}
