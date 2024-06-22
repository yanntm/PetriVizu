export class PropertyResult {
    constructor(stdoutElemId, stderrElemId) {
        this.stdoutElem = document.getElementById(stdoutElemId);
        this.stderrElem = document.getElementById(stderrElemId);
    }

    appendToOut(text) {
        this.stdoutElem.value += text;
    }

    appendToErr(text) {
        this.stderrElem.value += text;
    }
}
