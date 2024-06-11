function createCytoscapeElements(petriNet, options = {}) {
    const elements = [];
    const { showAllLabels = false } = options;

    petriNet.places.forEach((place) => {
        const label = showAllLabels || place.tokens > 0 ? `${place.name}\n${place.tokens}` : place.name;

        elements.push({
            data: {
                id: place.id,
                label: label
            },
            classes: 'place'
        });
    });

    petriNet.transitions.forEach((transition) => {
        elements.push({
            data: {
                id: transition.id,
                label: transition.name
            },
            classes: 'transition'
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

function updateCytoscapeCommon(cy, petriNet, showAllLabels = false) {
    cy.elements().remove();

    const elements = createCytoscapeElements(petriNet, { showAllLabels });
    cy.add(elements);
}

export { createCytoscapeElements, updateCytoscapeCommon };
