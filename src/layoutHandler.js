// layoutHandler.js
import cytoscape from 'cytoscape';

import fcose from 'cytoscape-fcose';
import dagre from 'cytoscape-dagre';

cytoscape.use(fcose);
cytoscape.use(dagre);

const layouts = [
    { name: 'fcose', description: 'fCoSE (Fast CoSE)' },
    { name: 'cose', description: 'CoSE (Clustered Spring Embedder)' },
    { name: 'dagre', description: 'Dagre (DAG Layout)' },
    { name: 'cose-bilkent', description: 'CoSE Bilkent (Improved CoSE)' },
    { name: 'circle', description: 'Circle Layout' },
    { name: 'grid', description: 'Grid Layout' },
    { name: 'random', description: 'Random Layout' },
    { name: 'concentric', description: 'Concentric Layout' },
    { name: 'breadthfirst', description: 'Breadthfirst Layout' }
];



class LayoutHandler {
    constructor() {
        this.currentMode = null;
        this.populateLayoutDropdown();
        this.initializeLayoutControls();
    }

    populateLayoutDropdown() {
        const layoutDropdown = document.getElementById('layout-dropdown');
        layouts.forEach(layout => {
            const option = document.createElement('option');
            option.value = layout.name;
            option.text = layout.description;
            layoutDropdown.appendChild(option);
        });
    }

    initializeLayoutControls() {
        const fitButton = document.getElementById('fit-button');
        const applyLayoutButton = document.getElementById('apply-layout-button');
        const layoutDropdown = document.getElementById('layout-dropdown');

        fitButton.addEventListener('click', () => {
            if (this.currentMode && this.currentMode.cy) {
                this.currentMode.cy.fit();
            }
        });

        applyLayoutButton.addEventListener('click', () => {
            const selectedLayout = layoutDropdown.value;
            if (this.currentMode && this.currentMode.layout) {
                this.currentMode.layout(selectedLayout);
            }
        });
    }

    setCurrentMode(mode) {
        this.currentMode = mode;
    }
}

export default LayoutHandler;
