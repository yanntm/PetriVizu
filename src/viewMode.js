import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles.js';
import { updateLabelPositions, updateCytoscapeCommon } from './cytoscapeUtils.js';

function initCytoscape(petriNet, containerId) {
    const cy = cytoscape({
        container: document.getElementById(containerId),
        style: cytoscapeStyles,
        layout: { name: 'cose', padding: 10 }
    });

    return cy;
}

function updateCytoscape(cy, petriNet) {
    updateCytoscapeCommon(cy, petriNet);

    cy.layout({ name: 'cose', padding: 10 }).run().promiseOn('layoutstop').then(() => {        
        cy.fit();
    });
}

export { initCytoscape, updateCytoscape };
