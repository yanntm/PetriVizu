import PropertyEditor from './propertyEditor.js';
import PropertyLauncher from './propertyLauncher.js';


export default class AnalysisMode {
    constructor(sharedState) {
        this.sharedState = sharedState;
        this.editor = new PropertyEditor(sharedState, this.runAnalysis.bind(this));
        this.launcher = new PropertyLauncher(sharedState);
    }

    activate() {
        this.editor.activate();
        this.launcher.activate();
    }

    deactivate() {
        this.editor.deactivate();
        this.launcher.deactivate();
    }

    runAnalysis(property) {
        this.launcher.runAnalysis(property);
    }
}
