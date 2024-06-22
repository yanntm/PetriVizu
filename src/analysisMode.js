import PropertyEditor from './propertyEditor.js';
import PropertyResultViewer from './propertyResult.js';


export default class AnalysisMode {
    constructor(sharedState) {
        this.sharedState = sharedState;
        this.editor = new PropertyEditor(sharedState, this.runAnalysis.bind(this));
        this.resultViewer = new PropertyResultViewer(sharedState);
    }

    activate() {
        this.editor.activate();
        this.resultViewer.activate();
    }

    deactivate() {
        this.editor.deactivate();
        this.resultViewer.deactivate();
    }

    runAnalysis(property) {
        this.resultViewer.runAnalysis(property);
    }
}
