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
        this.onExampleSelectChange = this.onExampleSelectChange.bind(this);
        this.loadPNMLContent = this.loadPNMLContent.bind(this);

        this.setupFileImport();
        this.initializeExampleSelect();
    }

    activate() {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, false);
        this.cy.fit();
    }

    setupFileImport() {
        document.getElementById('fileOpen').addEventListener('click', this.onFileOpenClick);
        document.getElementById('fileInput').addEventListener('change', this.onFileInputChange);
        document.getElementById('fileExport').addEventListener('click', this.onFileExportClick);
        document.getElementById('exampleSelect').addEventListener('change', this.onExampleSelectChange);
    }

    initializeExampleSelect() {
        fetch('examples/index.json')
            .then(response => response.json())
            .then(files => {
                const exampleSelect = document.getElementById('exampleSelect');
                files.forEach(file => {
                    const option = document.createElement('option');
                    option.value = file;
                    option.text = file;
                    exampleSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching example list:', error));
    }

    onFileOpenClick() {
        document.getElementById('fileInput').click();
    }

    onFileInputChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadPNMLContent(e.target.result);
            };
            reader.readAsText(file);
        }
    }

    onFileExportClick() {
        exportToPNML(this.sharedState.petriNet);
    }

    onExampleSelectChange(event) {
        const selectedFile = event.target.value;
        if (selectedFile) {
            fetch(`examples/${selectedFile}`)
                .then(response => response.text())
                .then(content => {
                    this.loadPNMLContent(content);
                })
                .catch(error => console.error('Error loading example:', error));
        }
    }

    loadPNMLContent(content) {
        this.sharedState.petriNet = loadPetriNet(content);
        this.sharedState.petriNet.reorder();
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet);
        const layoutDropdown = document.getElementById('layout-dropdown');
        const selectedLayout = layoutDropdown.value;
        this.layout(selectedLayout);
        this.cy.fit();
    }
}
