export async function fetchExaminationToolMap() {
    const response = await fetch('http://localhost:5000/tools/descriptions');
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
}


export async function runAnalysis(formData, examination, tool, resultHandler) {
    const stdoutElem = resultHandler.stdoutElem;
    const stderrElem = resultHandler.stderrElem;
    stdoutElem.value = '';
    stderrElem.value = '';

    try {
        const response = await fetch(`http://localhost:5000/mcc/PT/${examination}/${tool}`, {
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
                    resultHandler.appendToOut(output + '\n');
                }
            });
        }
    } catch (error) {
        console.error('Error running analysis:', error);
        resultHandler.appendToErr('Error running analysis. Please check server logs for details.');
    }
}
