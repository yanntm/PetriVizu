// viewMode.js
import Mode from './modeInterface.js';
import cytoscape from 'cytoscape';
import { loadPetriNet } from './loader.js';
import { initCytoscape, updateCytoscapeCommon,syncGraphicsFromCy } from './cytoscapeUtils.js';

export default class ViewMode extends Mode {
    constructor(sharedState) {
        super();
        this.sharedState = sharedState;
        this.cy = initCytoscape('viewer-cy');
        this.setupFileImport();
        this.cy.layout({ name: 'cose', padding: 10 }).run().promiseOn('layoutstop').then(() => {
           this.cy.fit();
        });
    }

    activate() {
        updateCytoscapeCommon(this.cy, this.sharedState.petriNet, true);        
        this.cy.fit();
    }

    deactivate() {
        syncGraphicsFromCy(this.cy, this.sharedState.petriNet);
    }

    setSharedState(sharedState) {
        this.sharedState = sharedState;
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
