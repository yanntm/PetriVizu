import AbstractMode from './abstractMode.js';
import { loadPetriNet } from './loader.js';
import { updateCytoscapeCommon } from './cytoscapeUtils.js';
import { exportToPNML } from './exporter.js';

export default class ViewMode extends AbstractMode {
    constructor(sharedState) {
        super(sharedState, 'viewer-cy');
        
        // Bind methods to ensure the correct context
        this.onFileOpenClick = this.onFileOpenClick.bind(this);
        this.onFileInputChange = this.onFileInputChange.bind(this);
        this.onFileExportClick = this.onFileExportClick.bind(this);

        this.setupFileImport();
    }

    activate() {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, false);
        this.cy.fit();
    }

    setupFileImport() {
        document.getElementById('fileOpen').addEventListener('click', this.onFileOpenClick);
        document.getElementById('fileInput').addEventListener('change', this.onFileInputChange);
        document.getElementById('fileExport').addEventListener('click', this.onFileExportClick);
    }

    onFileOpenClick() {
        document.getElementById('fileInput').click();
    }

    onFileInputChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.sharedState.petriNet = loadPetriNet(content);
                updateCytoscapeCommon(this.cy, this.sharedState.petriNet);
                            // Apply the current layout and fit the graph
              const layoutDropdown = document.getElementById('layout-dropdown');
              const selectedLayout = layoutDropdown.value;
              this.layout(selectedLayout); // Apply the selected layout and fit the graph
                this.cy.fit();
            };
            reader.readAsText(file);
        }
    }

    onFileExportClick() {
        exportToPNML(this.sharedState.petriNet);
    }
}
