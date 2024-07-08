import AbstractMode from './abstractMode';
import { loadPetriNet } from './loader';
import { updateCytoscapeCommon } from './cytoscapeUtils';
import { exportToPNML } from './exporter';
import { SharedState } from './sharedState';
import { reorderNet } from './netOrderProvider';

export default class ViewMode extends AbstractMode {
    constructor(sharedState: SharedState) {
        super(sharedState, 'viewer-cy');

        // Bind methods to ensure the correct context
        this.onFileOpenClick = this.onFileOpenClick.bind(this);
        this.onFileInputChange = this.onFileInputChange.bind(this);
        this.onFileExportClick = this.onFileExportClick.bind(this);
        this.onExampleSelectChange = this.onExampleSelectChange.bind(this);
        this.loadPNMLContent = this.loadPNMLContent.bind(this);

        this.setupFileImport();
        this.initializeExampleSelect();
    }

    activate(): void {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, false);
        this.cy.fit();
    }

    setupFileImport() {
        document.getElementById('fileOpen')?.addEventListener('click', this.onFileOpenClick);
        document.getElementById('fileInput')?.addEventListener('change', this.onFileInputChange);
        document.getElementById('fileExport')?.addEventListener('click', this.onFileExportClick);
        document.getElementById('exampleSelect')?.addEventListener('change', this.onExampleSelectChange);
    }

    initializeExampleSelect(): void {
        fetch('examples/index.json')
            .then(response => response.json())
            .then((files: string[]) => {
                const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
                files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file;
                    option.text = file;
                    exampleSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching example list:', error));
    }

    onFileOpenClick() :void {
        document.getElementById('fileInput')?.click();
    }

    onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    this.loadPNMLContent(result);
                }
            };
            reader.readAsText(file);
        }
    }

    onFileExportClick(): void {
        exportToPNML(this.sharedState.petriNet);
    }

    onExampleSelectChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const selectedFile = select.value;
        if (selectedFile) {
            fetch(`examples/${selectedFile}`)
                .then(response => response.text())
                .then(content => {
                    this.loadPNMLContent(content);
                })
                .catch(error => console.error('Error loading example:', error));
        }
    }

    loadPNMLContent(content: string): void {
        this.sharedState.petriNet = loadPetriNet(content);
        this.sharedState.petriNet = reorderNet(this.sharedState.petriNet);
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet);
        const layoutDropdown = document.getElementById('layout-dropdown') as HTMLSelectElement;
        const selectedLayout = layoutDropdown.value;
        this.layout(selectedLayout);
        this.cy.fit();
    }
}
