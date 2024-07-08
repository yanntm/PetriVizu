import PropertyEditor from './propertyEditor';
import PropertyLauncher from './propertyLauncher';


export default class AnalysisMode {
    constructor(sharedState,propertyEditor) {
        this.sharedState = sharedState;
        this.editor = new PropertyEditor(sharedState, this.runAnalysis.bind(this));        
        this.launcher = new PropertyLauncher(sharedState, propertyEditor);        
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
