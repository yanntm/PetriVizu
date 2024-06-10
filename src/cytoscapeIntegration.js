import cytoscape from 'cytoscape';
import cytoscapeStyles from './cytoscapeStyles.js';

function initCytoscape(petriNet) {
    const cy = cytoscape({
        container: document.getElementById('cy'),
        style: cytoscapeStyles,
        layout: { name: 'cose', padding: 10 }
    });

    return cy;
}

function updateCytoscape(cy, petriNet) {
    cy.elements().remove();

    const elements = [];

    petriNet.places.forEach((place, index) => {
        elements.push({
            data: {
                id: place.id,
                name: place.name,
                marking: place.tokens
            },
            classes: 'place'
        });

        elements.push({
            data: {
                id: `${place.id}_name`,
                parent: place.id,
                name: place.name
            },
            position: {
                x: 0,
                y: 20 // Adjust y position to place the name below the circle
            },
            classes: 'place-name'
        });
    });

    petriNet.transitions.forEach((transition, index) => {
        elements.push({
            data: {
                id: transition.id,
                name: transition.name
            },
            classes: 'transition'
        });
    });

    petriNet.arcs.forEach((arc, index) => {
        elements.push({
            data: {
                id: `${arc.source}-${arc.target}`,
                source: arc.source,
                target: arc.target,
                weight: arc.weight
            }
        });
    });

    cy.add(elements);
    cy.layout({ name: 'cose', padding: 10 }).run();
}

export { initCytoscape, updateCytoscape };
