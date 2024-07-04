export class PropertyResult {
    constructor(stdoutElemId, stderrElemId) {
        this.stdoutElem = document.getElementById(stdoutElemId);
        this.stderrElem = document.getElementById(stderrElemId);
        this.resultsDiv = document.getElementById('results');
    }

    appendToOut(text) {
        this.stdoutElem.value += text;
        this.parseAndRenderResults(text);
    }

    appendToErr(text) {
        this.stderrElem.value += text;
    }

    parseAndRenderResults(text) {
        const lines = text.split('\n');
        lines.forEach(line => {
            const match = line.match(/^FORMULA\s+(\S+)\s+(\S+)\s+TECHNIQUES\s+(.*)$/);
            if (match) {
                const formula = match[1];
                const value = match[2];
                this.addResultToTable(formula, value);
            }
        });
    }

    addResultToTable(formula, value) {
        const resultHTML = `
            <div class="result-row">
                <div class="result-formula">${formula}</div>
                <div class="result-value">${value}</div>
            </div>
        `;
        this.resultsDiv.innerHTML += resultHTML;
    }
}
