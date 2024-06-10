function createCytoscapeElements(petriNet, options = {}) {
    const elements = [];
    const { showAllLabels = false } = options;

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
                marking: showAllLabels || place.tokens > 0 ? place.tokens : '' // Only show marking if showAllLabels is true or greater than 0
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
                weight: showAllLabels || arc.weight > 1 ? arc.weight : '' // Only show weight if showAllLabels is true or greater than 1
            }
        });
    });

    return elements;
}

function updateLabelPositions(cy) {
    // Adjust positions of name nodes after layout
    cy.nodes('.node-name').forEach(node => {
        const shapeNode = cy.getElementById(node.data('parent')).children().filter(child => !child.hasClass('node-name'))[0];
        const bb = shapeNode.boundingBox({ includeLabels: false, includeEdges: false });
        node.position({
            x: bb.x1 + (bb.w / 2),
            y: bb.y1 - 25 // Position the name above the shape node
        });
    });
}

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
    cy.elements().remove();

    const elements = createCytoscapeElements(petriNet, { showAllLabels });
    cy.add(elements);
}

export { createCytoscapeElements, updateLabelPositions, updateCytoscapeCommon };
