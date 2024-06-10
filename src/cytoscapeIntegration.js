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

    petriNet.places.forEach((place) => {
        // Create the parent node
        elements.push({
            data: { id: `parent_${place.id}` },
            classes: 'parent-node'
        });

        // Create the shape node as a child
        elements.push({
            data: {
                id: place.id,
                parent: `parent_${place.id}`,
                marking: place.tokens > 0 ? place.tokens : '' // Only show marking if greater than 0
            },
            classes: 'place'
        });

        // Create the name node as a child
        elements.push({
            data: {
                id: `${place.id}_name`,
                parent: `parent_${place.id}`,
                name: place.name
            },
            classes: 'node-name'
        });
    });

    petriNet.transitions.forEach((transition) => {
        // Create the parent node
        elements.push({
            data: { id: `parent_${transition.id}` },
            classes: 'parent-node'
        });

        // Create the shape node as a child
        elements.push({
            data: {
                id: transition.id,
                parent: `parent_${transition.id}`
            },
            classes: 'transition'
        });

        // Create the name node as a child
        elements.push({
            data: {
                id: `${transition.id}_name`,
                parent: `parent_${transition.id}`,
                name: transition.name
            },
            classes: 'node-name'
        });
    });

    petriNet.arcs.forEach((arc) => {
        elements.push({
            data: {
                id: `${arc.source}-${arc.target}`,
                source: arc.source,
                target: arc.target,
                weight: arc.weight > 1 ? arc.weight : '' // Only show weight if greater than 1
            }
        });
    });

    cy.add(elements);

    cy.layout({ name: 'cose', padding: 10 }).run().promiseOn('layoutstop').then(() => {
        // Adjust positions of name nodes after layout
        cy.nodes('.node-name').forEach(node => {
            const shapeNode = cy.getElementById(node.data('parent')).children().filter(child => !child.hasClass('node-name'))[0];
            const bb = shapeNode.boundingBox({ includeLabels: false, includeEdges: false });
            node.position({
                x: bb.x1 + (bb.w / 2),
                y: bb.y1 - 25 // Position the name above the shape node
            });
        });

        // Refit the layout after adjusting name positions
        cy.fit();
    });
}

export { initCytoscape, updateCytoscape };
