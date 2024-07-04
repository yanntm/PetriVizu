import { exportToPNMLContent } from './exporter.js';

export function serverHelp() {
    return 'Error communicating with the server. Please visit https://github.com/yanntm/MCC-server and follow the README to get the server running.';
}

export async function fetchExaminationToolMap() {
    try {
        const response = await fetch('http://localhost:1664/tools/descriptions');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const examinationToolMap = {};

        data.tools_info.forEach(toolInfo => {
            if (toolInfo.PTexaminations) {
                toolInfo.PTexaminations.forEach(exam => {
                    if (!examinationToolMap[exam]) {
                        examinationToolMap[exam] = new Set();
                    }
                    examinationToolMap[exam].add(toolInfo.tool);
                });
            }
        });

        console.log("Detected tools: ", examinationToolMap);
        return examinationToolMap;
    } catch (error) {
        console.error('Error fetching examination tool map:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export async function runAnalysis(petriNet, examination, tool, timeout, resultHandler, properties = null) {
    const stdoutElem = resultHandler.stdoutElem;
    const stderrElem = resultHandler.stderrElem;
    stdoutElem.value = '';
    stderrElem.value = '';

    try {
        const pnmlContent = exportToPNMLContent(petriNet);
        const formData = new FormData();
        const blob = new Blob([pnmlContent], { type: 'application/xml' });
        formData.append('model.pnml', blob, 'model.pnml');

        if (properties) {
            const logicBlob = new Blob([properties], { type: 'text/plain' });
            formData.append('model.logic', logicBlob, 'model.logic');
        }

        const response = await fetch(`http://localhost:1664/mcc/PT/${examination}/${tool}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
                    resultHandler.appendToOut(output + '\n');
                }
            });
        }
    } catch (error) {
        console.error('Error running analysis:', error);
        resultHandler.appendToErr('Error running analysis. Please check server logs for details.');
        throw error; // Re-throw the error to be handled by the caller
    }
}
