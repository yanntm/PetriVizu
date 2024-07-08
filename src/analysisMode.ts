import PropertyEditor from './propertyEditor';
import PropertyLauncher from './propertyLauncher';
import { Core } from 'cytoscape';
import { SharedState} from './sharedState';
import BooleanExpressionEditor from './booleanExpressionEditor';

export default class AnalysisMode {
    public cy: Core | undefined;
    public layout: ((layoutName: string) => void) | undefined;
    private sharedState: any;
    private editor: PropertyEditor;
    private launcher: PropertyLauncher;
    private booleanExpressionEditor : BooleanExpressionEditor;
    constructor(sharedState: SharedState) {
        this.sharedState = sharedState;
        this.booleanExpressionEditor = new BooleanExpressionEditor(sharedState);
        this.editor = new PropertyEditor(sharedState);        
        this.launcher = new PropertyLauncher(sharedState, this.booleanExpressionEditor);        
    }

    activate(): void {
        this.editor.activate();
        this.launcher.activate();
    }

    deactivate(): void {
        this.editor.deactivate();
        this.launcher.deactivate();
    }

}
