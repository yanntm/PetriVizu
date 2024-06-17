function createCytoscapeElements(petriNet, options = {}) {
    const elements = [];
    const { showAllLabels = false } = options;
    const graphics = petriNet.getGraphics();

    petriNet.places.forEach((index, id) => {
        const label = showAllLabels || petriNet.initialState[index] > 0 ? `${id}\n${petriNet.initialState[index]}` : id;
        const position = graphics.getPosition(id);

        elements.push({
            data: {
                id: id,
                label: label
            },
            position: position,
            classes: 'place'
        });
    });

    petriNet.transitions.forEach((index, id) => {
        const position = graphics.getPosition(id);

        elements.push({
            data: {
                id: id,
                label: id
            },
            position: position,
            classes: 'transition'
        });
    });

    petriNet.getArcs().forEach(([sourceId, targetId, weight]) => {
        elements.push({
            data: {
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                label: showAllLabels || weight > 1 ? `${weight}` : '' // Only show weight if showAllLabels is true or greater than 1
            }
        });
    });

    return elements;
}

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
    const elements = createCytoscapeElements(petriNet, { showAllLabels });
    cy.elements().remove();
    cy.add(elements);
}

function syncGraphicsFromCy(cy, petriNet) {
    const graphics = petriNet.getGraphics();
    cy.nodes().forEach(node => {
        const position = node.position();
        graphics.setPosition(node.id(), position.x, position.y);
    });
}

export { createCytoscapeElements, updateCytoscapeCommon, syncGraphicsFromCy };
