export class PropertyResult {
    stdoutElem: any;
    stderrElem: any;
    resultsDiv: any;

    constructor(stdoutElemId: string, stderrElemId: string) {
        this.stdoutElem = document.getElementById(stdoutElemId) as HTMLTextAreaElement;
        this.stderrElem = document.getElementById(stderrElemId) as HTMLTextAreaElement;
        this.resultsDiv = document.getElementById('results');
    }

    appendToOut(text: string): void {
        if (this.stdoutElem) {
            this.stdoutElem.value += text;
            this.parseAndRenderResults(text);
        }
    }

    appendToErr(text: string): void {
        if (this.stderrElem) {
            this.stderrElem.value += text;
        }
    }

    parseAndRenderResults(text: string): void {
        const lines = text.split('\n');
        lines.forEach(line => {
            let match = line.match(/^FORMULA\s+(\S+)\s+(\S+)\s+TECHNIQUES\s+(.*)$/);
            if (match) {
                const formula = match[1];
                const value = match[2];
                this.addResultToTable(formula, value);
            } else {
                match = line.match(/^STATE_SPACE\s+(\S+)\s+(\d+)\s+TECHNIQUES\s+(.*)$/);
                if (match) {
                    const metric = match[1];
                    const value = match[2];
                    this.addResultToTable(metric, value);
                }
            }
        });
    }

    addResultToTable(formula: string, value: string): void {
        if (this.resultsDiv) {
            const resultHTML = `
                <div class="result-row">
                    <div class="result-formula">${formula}</div>
                    <div class="result-value">${value}</div>
                </div>
            `;
            this.resultsDiv.innerHTML += resultHTML;
        }
    }
}
