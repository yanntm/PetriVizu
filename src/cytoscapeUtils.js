function createCytoscapeElements(petriNet, options = {}) {
    const elements = [];
    const { showAllLabels = false } = options;

    petriNet.places.forEach((index, id) => {
        const label = showAllLabels || petriNet.initialState[index] > 0 ? `${id}\n${petriNet.initialState[index]}` : id;

        elements.push({
            data: {
                id: id,
                label: label
            },
            classes: 'place'
        });
    });

    petriNet.transitions.forEach((index, id) => {
        elements.push({
            data: {
                id: id,
                label: id
            },
            classes: 'transition'
        });
    });

    petriNet.getArcs().forEach(([sourceId, targetId, weight]) => {
        elements.push({
            data: {
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                weight: showAllLabels || weight > 1 ? weight : '' // Only show weight if showAllLabels is true or greater than 1
            }
        });
    });

    return elements;
}

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
    cy.elements().remove();

    const elements = createCytoscapeElements(petriNet, { showAllLabels });
    cy.add(elements);
}

export { createCytoscapeElements, updateCytoscapeCommon };
