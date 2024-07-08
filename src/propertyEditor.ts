import { fetchExaminationToolMap, serverHelp, ExaminationToolMap } from './serverCommunicator';
import { PropertyDefinition } from './propertyDefinition';
import { SharedState} from './sharedState';

export default class PropertyEditor {
    private sharedState: SharedState;
    private examinationToolMap: ExaminationToolMap;

    constructor(sharedState: SharedState) {
        this.sharedState = sharedState;
        this.examinationToolMap = {};

        this.setupEditorControls();
        this.init();
        document.getElementById('helpButton')?.addEventListener('click', function() {
          window.open('https://github.com/yanntm/PetriVizu/blob/master/public/syntax.md', '_blank');
        });
    }

    async init(): Promise<void> {
        try {
            this.examinationToolMap = await fetchExaminationToolMap();
            this.populateExaminations();
        } catch (error) {
            this.handleError(error);
        }
    }

    setupEditorControls(): void {
        document.getElementById('examination-selector')?.addEventListener('change', () => {
            this.updateTools();
        });
    }

    populateExaminations(): void {
        const examinationSelector = document.getElementById('examination-selector') as HTMLSelectElement;
        examinationSelector.innerHTML = '';
    
        Object.keys(this.examinationToolMap).forEach(exam => {
            const option = document.createElement('option');
            option.value = exam;
            option.textContent = exam;
            examinationSelector.appendChild(option);
        });
    
        this.updateTools();
    }

    updateTools(): void {
        const examinationSelector = document.getElementById('examination-selector') as HTMLSelectElement;
        const toolSelector = document.getElementById('tool-selector') as HTMLSelectElement;
        const selectedExamination = examinationSelector.value;

        toolSelector.innerHTML = '';

        if (this.examinationToolMap[selectedExamination]) {
            this.examinationToolMap[selectedExamination].forEach(tool => {
                const option = document.createElement('option');
                option.value = tool;
                option.textContent = tool;
                toolSelector.appendChild(option);
            });
        }
    }

    handleError(error: unknown): void {
        const stderrElem = document.getElementById('stderr') as HTMLTextAreaElement;
        stderrElem.value = serverHelp();
        alert(serverHelp());
        console.error('Error:', error);
    }

    activate(): void {
        const propertyConfig = document.getElementById('property-configuration') as HTMLElement;
        if (propertyConfig) {
            propertyConfig.style.display = 'block';
        }
    }

    deactivate(): void {
        const propertyConfig = document.getElementById('property-configuration') as HTMLElement;
        if (propertyConfig) {
            propertyConfig.style.display = 'none';
        }
    }
}