// viewMode.js
import AbstractMode from './abstractMode.js';
import cytoscape from 'cytoscape';
import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscapeCommon,syncGraphicsFromCy } from './cytoscapeUtils.js';

export default class ViewMode extends AbstractMode {
    constructor(sharedState) {
        super(sharedState, 'viewer-cy');
        this.setupFileImport();
    }

    activate() {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, true);
        this.cy.fit();
    }

    setupFileImport() {
        document.getElementById('fileOpen').addEventListener('click', this.onFileOpenClick);
        document.getElementById('fileInput').addEventListener('change', this.onFileInputChange);
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
            };
            reader.readAsText(file);
        }
    }
}
