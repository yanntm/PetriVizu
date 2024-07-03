import { fetchExaminationToolMap, serverHelp } from './serverCommunicator.js';
import { PropertyDefinition } from './propertyDefinition.js';


export default class PropertyEditor {
    constructor(sharedState, onSave) {
        this.sharedState = sharedState;
        this.onSave = onSave;

        this.examinationToolMap = {};

        this.setupEditorControls();
        this.init();
    }

    async init() {
        try {
            this.examinationToolMap = await fetchExaminationToolMap();
            this.populateExaminations();
        } catch (error) {
            this.handleError(error);
        }
    }

    setupEditorControls() {
        document.getElementById('save-property').addEventListener('click', () => {
            const name = document.getElementById('property-name').value;
            const examination = document.getElementById('examination-selector').value;
            const tool = document.getElementById('tool-selector').value;
            const timeout = parseInt(document.getElementById('timeout').value);

            const property = new PropertyDefinition(name, examination, tool, timeout);
            this.onSave(property);
        });

        document.getElementById('examination-selector').addEventListener('change', () => {
            this.updateTools();
        });
    }

    populateExaminations() {
        const examinationSelector = document.getElementById('examination-selector');
        examinationSelector.innerHTML = '';
    
        Object.keys(this.examinationToolMap).forEach(exam => {
            const option = document.createElement('option');
            option.value = exam;
            option.textContent = exam;
            examinationSelector.appendChild(option);
        });
    
        this.updateTools();
    }


    updateTools() {
        const examinationSelector = document.getElementById('examination-selector');
        const toolSelector = document.getElementById('tool-selector');
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

    handleError(error) {
        const stderrElem = document.getElementById('stderr');
        stderrElem.value = serverHelp();
        alert(serverHelp());
        console.error('Error:', error);
    }

    activate() {
        document.getElementById('property-configuration').style.display = 'block';
    }

    deactivate() {
        document.getElementById('property-configuration').style.display = 'none';
    }
}
